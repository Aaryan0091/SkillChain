const { JsonRpcProvider, Wallet, getBytes, hexlify } = require("ethers");
const { env } = require("../config/env");

function isBlockchainConfigured() {
  return Boolean(env.blockchainRpcUrl && env.blockchainPrivateKey);
}

function getProvider() {
  if (!env.blockchainRpcUrl) {
    throw new Error("Missing BLOCKCHAIN_RPC_URL.");
  }

  const chainId = Number(env.blockchainChainId || "0");
  return chainId
    ? new JsonRpcProvider(env.blockchainRpcUrl, chainId)
    : new JsonRpcProvider(env.blockchainRpcUrl);
}

function getWallet() {
  if (!env.blockchainPrivateKey) {
    throw new Error("Missing BLOCKCHAIN_PRIVATE_KEY.");
  }

  return new Wallet(env.blockchainPrivateKey, getProvider());
}

function normalizeHashData(certificateHash) {
  if (!certificateHash) {
    throw new Error("Certificate hash is required for blockchain anchoring.");
  }

  const normalized = certificateHash.startsWith("0x")
    ? certificateHash.toLowerCase()
    : `0x${certificateHash.toLowerCase()}`;

  const bytes = getBytes(normalized);
  if (bytes.length !== 32) {
    throw new Error("Certificate hash must be a 32-byte value.");
  }

  return hexlify(bytes);
}

async function anchorCertificateHash({ certificateHash }) {
  const wallet = getWallet();
  const provider = getProvider();
  const network = await provider.getNetwork();
  const data = normalizeHashData(certificateHash);
  const targetAddress =
    env.blockchainContractAddress || env.issuerWalletAddress || wallet.address;

  const tx = await wallet.sendTransaction({
    to: targetAddress,
    data,
    value: 0n,
  });

  const receipt = await tx.wait();

  if (!receipt) {
    throw new Error("Blockchain transaction was sent but no receipt was returned.");
  }

  return {
    transactionHash: receipt.hash,
    chainId: String(network.chainId),
    anchorAddress: targetAddress,
    mode: env.blockchainContractAddress ? "contract_record" : "trusted_chain_record",
  };
}

async function readAnchoredHash(transactionHash) {
  if (!transactionHash) {
    throw new Error("Transaction hash is required to read the anchored certificate hash.");
  }

  const provider = getProvider();
  const tx = await provider.getTransaction(transactionHash);

  if (!tx) {
    throw new Error("Blockchain transaction could not be found.");
  }

  return {
    anchoredHash: (tx.data || "0x").replace(/^0x/, "").toLowerCase(),
    to: tx.to || null,
    hash: tx.hash,
  };
}

module.exports = {
  anchorCertificateHash,
  isBlockchainConfigured,
  readAnchoredHash,
};
