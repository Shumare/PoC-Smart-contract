// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DiplomaRegistry {
    mapping(bytes32 => string) public diplomaIPFS;

    function storeDiploma(bytes32 hash, string memory ipfsLink) public {
        diplomaIPFS[hash] = ipfsLink;
    }

    function getDiplomaIPFS(bytes32 hash) public view returns (string memory) {
        return diplomaIPFS[hash];
    }
}
