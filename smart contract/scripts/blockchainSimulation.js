const { ethers } = require("ethers");
const { createIpfsNode, addJson, catToString } = require("./ipfsClient");
const { deployDiplomaContract } = require("./deployDiploma");

async function main() {
  const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545");
  const accounts = await provider.listAccounts();
  const deployer = provider.getSigner(accounts[0]);
  const user = provider.getSigner(accounts[1]);

  console.log("Deployer:", accounts[0]);
  console.log("User:", accounts[1]);
  console.log("Deployer balance:", (await deployer.getBalance()).toString());
  console.log("User balance:", (await user.getBalance()).toString());

  console.log("\nSending 1 ETH from deployer to user...");
  const tx = await deployer.sendTransaction({
    to: accounts[1],
    value: ethers.utils.parseEther("1"),
  });
  await tx.wait();

  console.log("Deployer balance after:", (await deployer.getBalance()).toString());
  console.log("User balance after:", (await user.getBalance()).toString());

  const ipfs = await createIpfsNode();

  const diploma = await deployDiplomaContract(deployer);
  console.log("DiplomaContract deployed at:", diploma.address);

  const diplomaObject = {
    name: "student1",
    degree: "Blockchain 101",
    year: 2024,
  };
  const cid = await addJson(ipfs, diplomaObject);
  const ipfsLink = `ipfs://${cid.toString()}`;

  const leaf = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("student1"));
  const regTx = await diploma.registerDiploma(leaf, ipfsLink);
  await regTx.wait();
  console.log("Diploma registered with IPFS:", ipfsLink);

  const stored = await diploma.getDiplomaIpfs(leaf);
  console.log("Stored IPFS:", stored);

  const retrieved = await catToString(ipfs, cid);
  console.log("Retrieved from IPFS:", retrieved);

  await ipfs.stop();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
