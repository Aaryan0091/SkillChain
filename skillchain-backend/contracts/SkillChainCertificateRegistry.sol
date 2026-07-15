// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract SkillChainCertificateRegistry {
    struct CertificateRecord {
        bytes32 certificateHash;
        address issuer;
        uint256 anchoredAt;
    }

    mapping(string => CertificateRecord) private certificateRecords;

    event CertificateAnchored(
        string indexed certificateId,
        bytes32 indexed certificateHash,
        address indexed issuer,
        uint256 anchoredAt
    );

    function anchorCertificate(string calldata certificateId, bytes32 certificateHash) external {
        require(bytes(certificateId).length > 0, "certificate id required");
        require(certificateHash != bytes32(0), "certificate hash required");

        certificateRecords[certificateId] = CertificateRecord({
            certificateHash: certificateHash,
            issuer: msg.sender,
            anchoredAt: block.timestamp
        });

        emit CertificateAnchored(certificateId, certificateHash, msg.sender, block.timestamp);
    }

    function getCertificateHash(string calldata certificateId) external view returns (bytes32) {
        return certificateRecords[certificateId].certificateHash;
    }

    function getCertificateRecord(
        string calldata certificateId
    ) external view returns (bytes32 certificateHash, address issuer, uint256 anchoredAt) {
        CertificateRecord memory record = certificateRecords[certificateId];
        return (record.certificateHash, record.issuer, record.anchoredAt);
    }
}
