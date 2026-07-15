const { Contract, JsonRpcProvider, Wallet, getBytes, hexlify } = require("ethers");
const { env } = require("../config/env");
const skillchainRegistryAbi = require("../contracts/skillchain-certificate-registry.abi.json");

function isBlockchainConfigured() {
  return Boolean(env.blockchainRpcUrl && env.blockchainPrivateKey);
}

function isContractModeConfigured() {
  return Boolean(
    env.blockchainRpcUrl &&
      env.blockchainPrivateKey &&
      env.blockchainContractAddress
  );
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

function getRegistryContract() {
  if (!env.blockchainContractAddress) {
    throw new Error("Missing BLOCKCHAIN_CONTRACT_ADDRESS.");
  }

  const wallet = getWallet();
  return new Contract(env.blockchainContractAddress, skillchainRegistryAbi, wallet);
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

async function anchorCertificateHash({ certificateId, certificateHash }) {
  const wallet = getWallet();
  const provider = getProvider();
  const network = await provider.getNetwork();
  const data = normalizeHashData(certificateHash);
  let tx;
  let targetAddress;
  let mode;

  if (env.blockchainContractAddress) {
    if (!certificateId) {
      throw new Error(
        "Certificate id is required when anchoring through the SkillChain registry contract."
      );
    }

    const contract = getRegistryContract();
    tx = await contract.anchorCertificate(certificateId, data);
    targetAddress = env.blockchainContractAddress;
    mode = "smart_contract_registry";
  } else {
    targetAddress = env.issuerWalletAddress || wallet.address;
    tx = await wallet.sendTransaction({
      to: targetAddress,
      data,
      value: 0n,
    });
    mode = "trusted_chain_record";
  }

  const receipt = await tx.wait();

  if (!receipt) {
    throw new Error("Blockchain transaction was sent but no receipt was returned.");
  }

  return {
    transactionHash: receipt.hash,
    chainId: String(network.chainId),
    anchorAddress: targetAddress,
    mode,
  };
}

async function readAnchoredHash({ certificateId, transactionHash }) {
  if (env.blockchainContractAddress) {
    if (!certificateId) {
      throw new Error(
        "Certificate id is required to read an anchored certificate hash from the contract."
      );
    }

    const contract = getRegistryContract();
    const anchoredHash = await contract.getCertificateHash(certificateId);

    if (!anchoredHash || /^0x0+$/.test(String(anchoredHash))) {
      throw new Error("No anchored certificate hash was found in the contract.");
    }

    return {
      anchoredHash: String(anchoredHash).replace(/^0x/, "").toLowerCase(),
      to: env.blockchainContractAddress,
      hash: transactionHash || null,
      mode: "smart_contract_registry",
    };
  }

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
    mode: "trusted_chain_record",
  };
}

module.exports = {
  anchorCertificateHash,
  isBlockchainConfigured,
  isContractModeConfigured,
  readAnchoredHash,
};
