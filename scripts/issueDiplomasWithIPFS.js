const fs = require("fs");
const path = require("path");
const keccak256 = require("keccak256");
const { MerkleTree } = require("merkletreejs");
const { Web3Storage, getFilesFromPath } = require("web3.storage");
const hre = require("hardhat");

const WEB3_STORAGE_TOKEN = "TON_TOKEN_WEB3_STORAGE"; // <-- remplace ici

// 📦 Génère le client IPFS
function makeStorageClient() {
  return new Web3Storage({ token: WEB3_STORAGE_TOKEN });
}

// 🔄 Génère le hash d’un diplôme
function hashDiploma(jsonData) {
  return keccak256(JSON.stringify(jsonData));
}

async function main() {
  const diplomaFiles = [
    "diploma1.json",
    "diploma2.json",
    "diploma3.json",
    "diploma4.json",
  ];
  const diplomaHashes = [];
  const diplomaData = [];

  for (const file of diplomaFiles) {
    const raw = fs.readFileSync(path.join(__dirname, "..", "data", file));
    const parsed = JSON.parse(raw);
    const hash = hashDiploma(parsed);

    diplomaHashes.push(hash);
    diplomaData.push({ filename: file, json: parsed, hash });
  }

  // 🌳 Construction Merkle Tree
  const tree = new MerkleTree(diplomaHashes, keccak256, { sortPairs: true });
  const merkleRoot = tree.getHexRoot();

  // 📤 Upload sur IPFS
  const client = makeStorageClient();
  const files = await getFilesFromPath(path.resolve("data"));
  const cid = await client.put(files);
  const ipfsBase = `https://ipfs.io/ipfs/${cid}`;

  // 🚀 Déploiement Smart Contract
  const DiplomaVerifier = await hre.ethers.getContractFactory(
    "DiplomaVerifier"
  );
  const contract = await DiplomaVerifier.deploy(merkleRoot);
  await contract.deployed();

  console.log("\n✅ Contrat déployé à :", contract.address);
  console.log("🌿 Merkle Root :", merkleRoot);
  console.log("📦 IPFS CID :", cid);
  console.log("🔗 IPFS Base URL :", ipfsBase);

  // 🔎 Détail des diplômes
  for (const { filename, json, hash } of diplomaData) {
    const proof = tree.getProof(hash).map((p) => ({
      position: p.position,
      data: p.data.toString("hex"),
    }));

    console.log(`\n📄 Diplôme: ${filename}`);
    console.log("Hash:", "0x" + hash.toString("hex"));
    console.log("Proof:");
    proof.forEach((step, i) => {
      console.log(
        `  ${i + 1}. ${step.position.toUpperCase()} - 0x${step.data}`
      );
    });
    console.log("📁 IPFS URL:", `${ipfsBase}/${filename}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
