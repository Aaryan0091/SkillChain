const express = require("express");
const {
  fetchPublicCertificateById,
  fetchPublicCertificates,
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
    const certificate = await fetchPublicCertificateById(req.params.certificateId);

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: "Certificate not found.",
      });
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

module.exports = router;
