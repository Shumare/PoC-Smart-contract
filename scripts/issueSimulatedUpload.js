const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const DiplomaRegistry = await hre.ethers.getContractFactory(
    "DiplomaRegistry"
  );
  const registry = await DiplomaRegistry.deploy();
  await registry.deployed();
  console.log(`✅ Contract deployed at ${registry.address}`);

  const ipfsDataPath = path.join(
    __dirname,
    "..",
    "data",
    "ipfs_simulated.json"
  );
  const ipfsData = JSON.parse(fs.readFileSync(ipfsDataPath));
  const merkleRoot = ipfsData.merkleRoot;
  const ipfsFakeLink = `ipfs://simulated/${merkleRoot}`;

  const tx = await registry.storeDiploma(merkleRoot, ipfsFakeLink);
  await tx.wait();
  console.log(`✅ Diploma stored with hash ${merkleRoot}`);
  console.log(`✅ Simulated IPFS link: ${ipfsFakeLink}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
