const express = require("express");

const router = express.Router();

router.get("/providers", (_req, res) => {
  res.json({
    success: true,
    providers: ["email", "github", "google", "magic_link"],
    message: "Supabase auth providers will be connected here.",
  });
});

module.exports = router;
