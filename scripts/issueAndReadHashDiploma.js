const fs = require("fs");
const path = require("path");
const hre = require("hardhat");
const { ethers } = hre;

async function main() {
  // 1) Charger et hasher le JSON
  const jsonPath = path.join(__dirname, "../data/diploma.json");
  const raw = fs.readFileSync(jsonPath);
  const jsonString = raw.toString();
  // keccak256 attend une hex string prefixed "0x" ou un Utf8Bytes
  const diplomaHash = ethers.utils.keccak256(
    ethers.utils.toUtf8Bytes(jsonString)
  );
  console.log("Diploma JSON hash :", diplomaHash);

  // 2) Comptes
  const [deployer, student] = await ethers.getSigners();

  // 3) Déploiement du contrat
  const Registry = await ethers.getContractFactory("DiplomaHashRegistry");
  const registry = await Registry.deploy();
  await registry.deployed();
  console.log("Registry deployed to:", registry.address);

  // 4) Enregistrement du hash
  const tx = await registry.issueDiplomaHash(student.address, diplomaHash);
  await tx.wait();
  console.log(`Hash enregistré pour ${student.address}`);

  // 5) Lecture du hash on‑chain
  const onChainHash = await registry.getDiplomaHash(student.address);
  console.log("Hash lu :", onChainHash);

  // 6) Vérification côté client
  console.log(
    "Correspondance ?",
    onChainHash === diplomaHash ? "✅ ok" : "❌ mismatch"
  );
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
