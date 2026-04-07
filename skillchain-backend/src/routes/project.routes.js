const express = require("express");

const router = express.Router();

router.get("/", (_req, res) => {
  res.json({
    success: true,
    data: [],
    message: "Project listing endpoint is ready for Supabase-backed data.",
  });
});

router.post("/", (req, res) => {
  const { repoUrl } = req.body || {};

  if (!repoUrl) {
    return res.status(400).json({
      success: false,
      message: "repoUrl is required.",
    });
  }

  return res.status(202).json({
    success: true,
    message: "Repository submission accepted for future analysis pipeline.",
    data: {
      repoUrl,
      status: "queued",
    },
  });
});

module.exports = router;
