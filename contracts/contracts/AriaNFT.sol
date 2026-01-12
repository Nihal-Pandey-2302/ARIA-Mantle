// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

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

    // Mint function restricted to the contract owner (the backend server)
    function safeMint(
        address to,
        string memory ipfsHash
    ) public onlyOwner onlyKYCVerified(to) returns (uint256) {
        _tokenIdCounter.increment();
        uint256 newItemId = _tokenIdCounter.current();
        _safeMint(to, newItemId);
        _setTokenURI(newItemId, ipfsHash);
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
