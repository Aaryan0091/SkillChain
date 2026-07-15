const express = require("express");
const { env } = require("../config/env");
const {
  isBlockchainConfigured,
  isContractModeConfigured,
} = require("../services/blockchain.service");

const router = express.Router();

function missingBlockchainConfig() {
  const missing = [];

  if (!env.blockchainRpcUrl) missing.push("BLOCKCHAIN_RPC_URL");
  if (!env.blockchainPrivateKey) missing.push("BLOCKCHAIN_PRIVATE_KEY");
  if (!env.blockchainContractAddress && !env.issuerWalletAddress) {
    missing.push("ISSUER_WALLET_ADDRESS");
  }

  return missing;
}

router.get("/", (_req, res) => {
  res.json({
    success: true,
    service: "skillchain-backend",
    environment: env.nodeEnv,
    supabaseConfigured: Boolean(env.supabaseUrl && env.supabaseAnonKey),
    githubConfigured: Boolean(env.githubToken),
    blockchainConfigured: Boolean(
      env.blockchainRpcUrl &&
        env.blockchainPrivateKey &&
        (env.blockchainContractAddress || env.issuerWalletAddress)
    ),
    blockchainReady: isBlockchainConfigured(),
    blockchainMode: isContractModeConfigured()
      ? "smart_contract_registry"
      : "trusted_chain_record",
    blockchainMissingConfig: missingBlockchainConfig(),
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
