const express = require("express");
const { env } = require("../config/env");

const router = express.Router();

router.get("/", (_req, res) => {
  res.json({
    success: true,
    service: "skillchain-backend",
    environment: env.nodeEnv,
    supabaseConfigured: Boolean(env.supabaseUrl && env.supabaseAnonKey),
    githubConfigured: Boolean(env.githubToken),
    blockchainConfigured: Boolean(env.blockchainRpcUrl),
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
