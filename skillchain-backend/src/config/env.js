const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 4000),
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",
  supabaseUrl: process.env.SUPABASE_URL || "",
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY || "",
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  githubToken: process.env.GITHUB_TOKEN || "",
  blockchainRpcUrl: process.env.BLOCKCHAIN_RPC_URL || "",
  blockchainChainId: process.env.BLOCKCHAIN_CHAIN_ID || "80002",
  blockchainContractAddress: process.env.BLOCKCHAIN_CONTRACT_ADDRESS || "",
  issuerWalletAddress: process.env.ISSUER_WALLET_ADDRESS || "",
};

module.exports = { env };
