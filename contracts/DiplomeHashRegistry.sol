// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract DiplomaHashRegistry {
    // Mapping : adresse étudiant → hash du JSON du diplôme
    mapping(address => bytes32) private _diplomaHashes;

    // Événement déclenché quand on enregistre un hash
    event DiplomaHashIssued(address indexed student, bytes32 hash);

    /// @notice Enregistre le hash d’un diplôme JSON pour un étudiant
    function issueDiplomaHash(address student, bytes32 diplomaHash) external {
        _diplomaHashes[student] = diplomaHash;
        emit DiplomaHashIssued(student, diplomaHash);
    }

    /// @notice Récupère le hash du diplôme pour un étudiant
    function getDiplomaHash(address student) external view returns (bytes32) {
        return _diplomaHashes[student];
    }
}
