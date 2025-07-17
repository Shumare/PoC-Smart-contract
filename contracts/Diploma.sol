// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract Diploma {
    bytes32 public merkleRoot;

    constructor(bytes32 _root) {
        merkleRoot = _root;
    }

    function verify(bytes32 leaf, bytes32[] calldata proof) public view returns (bool) {
        return MerkleProof.verify(proof, merkleRoot, leaf);
    }
}
