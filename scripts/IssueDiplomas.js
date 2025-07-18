const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const fetch = require("node-fetch");
const FormData = require("form-data");
require("dotenv").config();

// 🔐 Upload avec la nouvelle API Web3.Storage
async function uploadToWeb3Storage(filepath) {
  const data = new FormData();
  data.append("file", fs.createReadStream(filepath));

  const res = await fetch("https://api.web3.storage/upload", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.WEB3_STORAGE_TOKEN}`
    },
    body: data,
  });

  if (!res.ok) {
    throw new Error(`Erreur d'upload IPFS: ${res.status} ${await res.text()}`);
  }

  const result = await res.json();
  return `https://w3s.link/ipfs/${result.cid}`;
}

// 🔢 SHA-256 hash buffer
function sha256(data) {
  return crypto.createHash("sha256").update(data).digest();
}

// 🧱 Merkle Tree avec direction
function buildMerkleTree(leaves) {
  if (leaves.length % 2 !== 0) {
    leaves.push(leaves[leaves.length - 1]); // Duplicate last if odd
  }

  const layers = [leaves];
  while (layers[layers.length - 1].length > 1) {
    const prev = layers[layers.length - 1];
    const layer = [];
    for (let i = 0; i < prev.length; i += 2) {
      const combined = Buffer.concat([prev[i], prev[i + 1]]);
      layer.push(sha256(combined));
    }
    layers.push(layer);
  }
  return layers;
}

function getMerkleProof(layers, index) {
  const proof = [];
  for (let i = 0; i < layers.length - 1; i++) {
    const isRightNode = index % 2;
    const pairIndex = isRightNode ? index - 1 : index + 1;
    const sibling = layers[i][pairIndex];
    proof.push({
      direction: isRightNode ? "left" : "right",
      hash: sibling.toString("hex")
    });
    index = Math.floor(index / 2);
  }
  return proof;
}

async function main() {
  const diplomaDir = path.join(__dirname, "../data");
  const files = fs.readdirSync(diplomaDir);
  const diplomaHashes = [];
  const diplomaBuffers = [];

  for (const file of files) {
    const filePath = path.join(diplomaDir, file);
    const raw = fs.readFileSync(filePath);
    const hash = sha256(raw);
    diplomaHashes.push(hash);
    diplomaBuffers.push(raw);
  }

  const tree =
