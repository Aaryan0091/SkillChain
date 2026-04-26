const express = require("express");
const { analyzeRepository } = require("../services/repo-analyzer.service");

const router = express.Router();

router.get("/", (_req, res) => {
  res.json({
    success: true,
    data: [],
    message: "Project listing endpoint is ready for Supabase-backed data.",
  });
});

router.post("/", async (req, res) => {
  const { repoUrl, branch } = req.body || {};

  if (!repoUrl) {
    return res.status(400).json({
      success: false,
      message: "repoUrl is required.",
    });
  }

  try {
    const analysis = await analyzeRepository(repoUrl, branch);

    return res.status(200).json({
      success: true,
      message: "Repository analyzed with the hybrid NLP pipeline.",
      data: {
        repoUrl,
        status: "completed",
        analysis,
      },
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Repository analysis failed.",
    });
  }
});

module.exports = router;
