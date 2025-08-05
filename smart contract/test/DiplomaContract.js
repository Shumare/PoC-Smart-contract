const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DiplomaContract user management", function () {
  it("allows owner to authorize users and restricts access", async function () {
    const [owner, authorized, stranger] = await ethers.getSigners();
    const DiplomaContract = await ethers.getContractFactory("DiplomaContract");
    const contract = await DiplomaContract.deploy(ethers.constants.HashZero);
    await contract.deployed();

    // Unauthorized user should not be able to register a diploma
    try {
      await contract
        .connect(stranger)
        .registerDiploma(ethers.constants.HashZero, "ipfs://test");
      expect.fail("Expected revert not received");
    } catch (error) {
      expect(error.message).to.include("User not authorized");
    }

    // Owner authorizes a user
    await contract.addAuthorizedUser(authorized.address);
    const leaf = ethers.utils.formatBytes32String("leaf");
    await contract.connect(authorized).registerDiploma(leaf, "ipfs://link");
    expect(await contract.getDiplomaIpfs(leaf)).to.equal("ipfs://link");

    // Authorization can be revoked
    await contract.removeAuthorizedUser(authorized.address);
    try {
      await contract
        .connect(authorized)
        .registerDiploma(ethers.constants.HashZero, "ipfs://test2");
      expect.fail("Expected revert not received");
    } catch (error) {
      expect(error.message).to.include("User not authorized");
    }
  });
});
