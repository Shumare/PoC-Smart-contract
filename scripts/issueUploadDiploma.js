// scripts/issueUploadDiploma.js
const fs = require("fs");
const path = require("path");
const { create } = require("ipfs-http-client");
const { MerkleTree } = require("merkletreejs");
const keccak256 = require("keccak256");
const hre = require("hardhat");
const { ethers } = hre;

async function main() {
  // 1) Lire le JSON brut
  const jsonPath = path.join(__dirname, "../data/diploma.json");
  const raw = fs.readFileSync(jsonPath);
  const diploma = JSON.parse(raw.toString());

  // 2) Calculer le hash du JSON
  const jsonString = JSON.stringify(diploma);
  const diplomaHash = ethers.utils.keccak256(
    ethers.utils.toUtf8Bytes(jsonString)
  );
  console.log("📑 Diploma JSON hash:", diplomaHash);

  // 3) Construire un Merkle Tree (ici sur un seul élément, mais extensible)
  const leaves = [diplomaHash].map((x) => Buffer.from(x.slice(2), "hex"));
  const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });
  const root = tree.getRoot().toString("hex");
  const proof = tree
    .getProof(leaves[0])
    .map((node) => "0x" + node.data.toString("hex"));
  console.log("🌳 Merkle Root:", "0x" + root);
  console.log("🔐 Merkle Proof:", proof);

  // 4) Composer le JSON enrichi
  const enriched = {
    diploma,
    hash: diplomaHash,
    merkle: {
      root: "0x" + root,
      proof,
    },
  };

  // 5) Publier sur IPFS
  const ipfs = create({ url: "https://ipfs.infura.io:5001/api/v0" });
  const { cid } = await ipfs.add(JSON.stringify(enriched));
  const ipfsUri = `ipfs://${cid.toString()}`;
  console.log("🚀 Enriched JSON uploaded to IPFS at:", ipfsUri);

  // 6) Déployer et enregistrer le hash on‑chain
  const [deployer, student] = await ethers.getSigners();
  const Registry = await ethers.getContractFactory("DiplomaHashRegistry");
  const registry = await Registry.deploy();
  await registry.deployed();
  console.log("🏛️ Contract deployed to:", registry.address);

  const tx = await registry.issueDiplomaHash(student.address, diplomaHash);
  await tx.wait();
  console.log(`✅ Hash enregistré pour ${student.address}`);

  // 7) Retour en console
  console.log("\n📘 Résumé:");
  console.log("  • Diploma hash     :", diplomaHash);
  console.log("  • IPFS URI         :", ipfsUri);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
