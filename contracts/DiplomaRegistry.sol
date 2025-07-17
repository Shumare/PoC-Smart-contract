// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DiplomaRegistry {
    mapping(bytes32 => string) public diplomaIPFS;

    function issueDiploma(bytes32 diplomaHash, string memory ipfsUri) external {
        diplomaIPFS[diplomaHash] = ipfsUri;
    }

    function getDiplomaIPFS(bytes32 diplomaHash) public view returns (string memory) {
        return diplomaIPFS[diplomaHash];
    }
}
