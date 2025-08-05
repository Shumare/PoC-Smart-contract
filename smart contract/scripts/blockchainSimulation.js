const fs = require("fs");
const path = require("path");
const solc = require("solc");
const { ethers } = require("ethers");

async function main() {
  // Connexion au nœud local Hardhat
  const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545");
  const accounts = await provider.listAccounts();
  const deployer = provider.getSigner(accounts[0]);
  const user = provider.getSigner(accounts[1]);

  console.log("Deployer:", accounts[0]);
  console.log("User:", accounts[1]);

  console.log("Deployer balance:", (await deployer.getBalance()).toString());
  console.log("User balance:", (await user.getBalance()).toString());

  // Transaction d'ETH entre comptes
  console.log("\nSending 1 ETH from deployer to user...");
  const tx = await deployer.sendTransaction({
    to: accounts[1],
    value: ethers.utils.parseEther("1"),
  });
  await tx.wait();

  console.log("Deployer balance after:", (await deployer.getBalance()).toString());
  console.log("User balance after:", (await user.getBalance()).toString());

  // Compilation du contrat avec solc
  const source = fs.readFileSync(path.join(__dirname, "../contracts/DiplomaContract.sol"), "utf8");
  const input = {
    language: "Solidity",
    sources: { "DiplomaContract.sol": { content: source } },
    settings: { outputSelection: { "*": { "*": ["abi", "evm.bytecode"] } } },
  };
  const output = JSON.parse(solc.compile(JSON.stringify(input)));
  const contract = output.contracts["DiplomaContract.sol"]["DiplomaContract"];
  const abi = contract.abi;
  const bytecode = contract.evm.bytecode.object;

  // Déploiement du smart contract
  const factory = new ethers.ContractFactory(abi, bytecode, deployer);
  const merkleRoot = ethers.constants.HashZero;
  const diploma = await factory.deploy(merkleRoot);
  await diploma.deployed();
  console.log("DiplomaContract deployed at:", diploma.address);

  // Interaction avec le contrat
  const leaf = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("student1"));
  const ipfs = "ipfs://exampleHash";
  const regTx = await diploma.registerDiploma(leaf, ipfs);
  await regTx.wait();
  console.log("Diploma registered");

  const stored = await diploma.getDiplomaIpfs(leaf);
  console.log("Stored IPFS:", stored);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
