// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

interface IYieldDistributor {
    function createYieldStream(uint256 tokenId, uint256 yieldRate) external;
}

contract AriaNFT is ERC721, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;

    // Mapping from token ID to the IPFS metadata hash
    mapping(uint256 => string) private _tokenURIs;

    // KYC/AML Compliance
    enum KYCLevel {
        None,
        Basic,
        Verified,
        Accredited
    }
    mapping(address => KYCLevel) public kycStatus;
    mapping(address => string) public kycDocuments; // IPFS hash of KYC data

    event KYCRegistered(address indexed user, KYCLevel level, string ipfsHash);

    constructor() ERC721("ARIA RWA", "ARWA") Ownable() {}

    modifier onlyKYCVerified(address _user) {
        require(
            kycStatus[_user] >= KYCLevel.Basic,
            "KYC verification required"
        );
        _;
    }

    // Register KYC (Self-Attestation for Hackathon Demo)
    function registerKYC(string memory ipfsHash, KYCLevel level) external {
        require(level > KYCLevel.None, "Invalid KYC level");
        kycStatus[msg.sender] = level;
        kycDocuments[msg.sender] = ipfsHash;
        emit KYCRegistered(msg.sender, level, ipfsHash);
    }

    // Yield Distributor Integration
    address public yieldDistributor;

    function setYieldDistributor(address _yieldDistributor) external onlyOwner {
        yieldDistributor = _yieldDistributor;
    }

    // Mint function restricted to the contract owner (the backend server)
    // Deprecated for new checks, keeping for backward compatibility but redirecting if possible
    function safeMint(
        address to,
        string memory ipfsHash
    ) public onlyOwner onlyKYCVerified(to) returns (uint256) {
        return mintRWA(to, ipfsHash, "Asset"); // Default type
    }

    // Enhanced Mint function with Yield Auto-Creation
    function mintRWA(
        address to,
        string memory ipfsHash,
        string memory documentType
    ) public onlyOwner onlyKYCVerified(to) returns (uint256) {
        _tokenIdCounter.increment();
        uint256 newItemId = _tokenIdCounter.current();
        _safeMint(to, newItemId);
        _setTokenURI(newItemId, ipfsHash);

        // Auto-create yield stream (Hackathon Logic)
        if (yieldDistributor != address(0)) {
            uint256 yieldRate = 0;

            // Invoice: ~12.5% APY (represented as token/sec, simplistic calc)
            // Keccak check for string comparison
            if (keccak256(bytes(documentType)) == keccak256(bytes("Invoice"))) {
                yieldRate = 396000000000000; // 396 * 1e12
            }
            // Property Deed: ~5% APY
            else if (
                keccak256(bytes(documentType)) ==
                keccak256(bytes("Property Deed"))
            ) {
                yieldRate = 158000000000000; // 158 * 1e12
            }

            if (yieldRate > 0) {
                // Call external contract (must be linked)
                IYieldDistributor(yieldDistributor).createYieldStream(
                    newItemId,
                    yieldRate
                );
            }
        }

        return newItemId;
    }

    // Sets the metadata URI for a given token
    function _setTokenURI(
        uint256 tokenId,
        string memory _tokenURI
    ) internal virtual {
        _tokenURIs[tokenId] = _tokenURI;
    }

    // Returns the metadata URI for a given token
    function tokenURI(
        uint256 tokenId
    ) public view override returns (string memory) {
        _requireMinted(tokenId);
        return _tokenURIs[tokenId];
    }
}
