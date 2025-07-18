// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract DiplomaVerifier {
    bytes32 public merkleRoot;

    constructor(bytes32 _root) {
        merkleRoot = _root;
    }

    function verifyDiploma(bytes32 leaf, bytes32[] memory proof) public view returns (bool) {
        return MerkleProof.verify(proof, merkleRoot, leaf);
    }
}
