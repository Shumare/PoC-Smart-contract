const hre = require("hardhat");
const { ethers } = hre;

async function main() {
  // 1) Récupérer les comptes fournis par Hardhat
  const [deployer, student] = await ethers.getSigners();

  // 2) Déployer le contrat
  const Registry = await ethers.getContractFactory("DiplomaRegistry");
  const registry = await Registry.deploy();
  await registry.deployed();
  console.log("DiplomaRegistry deployed to:", registry.address);

  // 3) Émettre un diplôme pour `student`
  const now = Math.floor(Date.now() / 1000);
  const tx = await registry.issueDiploma(
    student.address,
    "Alice Dupont",
    "Master Blockchain",
    now,
    "ipfs://QmYourIpfsHash"
  );
  await tx.wait();
  console.log(`Diploma issued to ${student.address} at ${now}`);

  // 4) Lire le diplôme
  const diploma = await registry.getDiploma(student.address);
  console.log("=== Diploma data ===");
  console.log("Student name:", diploma.studentName);
  console.log("Degree      :", diploma.degree);
  console.log(
    "Issued at   :",
    new Date(diploma.issuedAt * 1000).toLocaleString()
  );
  console.log("Metadata URI:", diploma.metadataURI);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
