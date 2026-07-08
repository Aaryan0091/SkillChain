const express = require("express");
const {
  fetchPublicCertificateById,
  fetchPublicCertificates,
  finalizeCertificateVerification,
} = require("../services/project-store.service");

const router = express.Router();

router.get("/", async (req, res) => {
  const limit = Number(req.query.limit || 4);

  try {
    const certificates = await fetchPublicCertificates(
      Number.isFinite(limit) ? limit : 4
    );

    return res.json({
      success: true,
      data: certificates,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Could not load public certificates.",
    });
  }
});

router.get("/:certificateId", async (req, res) => {
  try {
    let certificate = await fetchPublicCertificateById(req.params.certificateId);

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: "Certificate not found.",
      });
    }

    if (certificate.verification_status === "pending") {
      certificate =
        (await finalizeCertificateVerification(req.params.certificateId)) || certificate;
    }

    return res.json({
      success: true,
      data: certificate,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Could not load certificate.",
    });
  }
});

router.post("/:certificateId/finalize", async (req, res) => {
  try {
    const certificate = await finalizeCertificateVerification(req.params.certificateId);

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: "Certificate not found.",
      });
    }

    return res.json({
      success: true,
      message: "Certificate verification finalized.",
      data: certificate,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Could not finalize certificate verification.",
    });
  }
});

module.exports = router;
