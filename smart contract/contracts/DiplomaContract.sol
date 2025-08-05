// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title DiplomaContract
 * @dev Stores IPFS links for diplomas and manages authorized users.
 */
contract DiplomaContract is Ownable {
    bytes32 public merkleRoot;

    // Mapping of diploma leaf to its IPFS link
    mapping(bytes32 => string) public diplomaIpfsLinks;

    // Tracks addresses allowed to register diplomas
    mapping(address => bool) public authorizedUsers;

    constructor(bytes32 _root) Ownable(msg.sender) {
        merkleRoot = _root;
    }

    /**
     * @dev Adds an address as an authorized user. Only callable by the owner.
     * @param user Address to authorize.
     */
    function addAuthorizedUser(address user) external onlyOwner {
        authorizedUsers[user] = true;
    }

    /**
     * @dev Removes an address from the list of authorized users. Only callable by the owner.
     * @param user Address to deauthorize.
     */
    function removeAuthorizedUser(address user) external onlyOwner {
        authorizedUsers[user] = false;
    }

    /**
     * @dev Restricts function access to authorized users.
     */
    modifier onlyAuthorized() {
        require(authorizedUsers[msg.sender], "User not authorized");
        _;
    }

    /**
     * @dev Registers a diploma IPFS link for a given leaf. Only authorized users can call.
     * @param leaf Merkle tree leaf of the diploma.
     * @param ipfsLink IPFS link associated with the diploma.
     */
    function registerDiploma(bytes32 leaf, string memory ipfsLink) public onlyAuthorized {
        diplomaIpfsLinks[leaf] = ipfsLink;
    }

    /**
     * @dev Retrieves the IPFS link for a given diploma leaf.
     * @param leaf Merkle tree leaf of the diploma.
     * @return The IPFS link stored for the diploma.
     */
    function getDiplomaIpfs(bytes32 leaf) public view returns (string memory) {
        return diplomaIpfsLinks[leaf];
    }
}
