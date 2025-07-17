const fs = require("fs");
const path = require("path");
const keccak256 = require("keccak256");
const { MerkleTree } = require("merkletreejs");
const hre = require("hardhat");

function simulateIPFSUri(contentHash) {
  return `ipfs://simulated-${contentHash.slice(0, 46)}`;
}

async function main() {
  const diplomaData = JSON.parse(fs.readFileSync("data/diploma.json", "utf8"));

  // 1. Hash du diplôme
  const diplomaStr = JSON.stringify(diplomaData);
  const diplomaHash = keccak256(diplomaStr);

  // 2. Merkle Tree (inutile ici mais simulé)
  const leaves = [diplomaHash];
  const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });
  const root = tree.getRoot().toString("hex");
  const proof = tree
    .getProof(diplomaHash)
    .map((p) => "0x" + p.data.toString("hex"));

  // 3. Simuler "upload" sur IPFS
  const contentForIPFS = {
    diploma: diplomaData,
    hash: "0x" + diplomaHash.toString("hex"),
    merkleProof: proof,
  };

  const simulatedCID = simulateIPFSUri(diplomaHash.toString("hex"));

  // 4. Déploiement & interaction
  const [deployer] = await hre.ethers.getSigners();
  const DiplomaRegistry = await hre.ethers.getContractFactory(
    "DiplomaRegistry"
  );
  const contract = await DiplomaRegistry.deploy();
  await contract.deployed();

  await contract.issueDiploma("0x" + diplomaHash.toString("hex"), simulatedCID);

  console.log("✔️ Diplôme émis !");
  console.log("→ Hash :", "0x" + diplomaHash.toString("hex"));
  console.log("→ IPFS simulé :", simulatedCID);
  console.log("→ Merkle root :", root);
  console.log("→ Merkle proof :", proof);
  console.log("→ Contrat :", contract.address);
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
