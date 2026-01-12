// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract YieldDistributor is Ownable, ReentrancyGuard {
    struct YieldStream {
        uint256 tokenId; // ARIA NFT ID
        uint256 totalYield; // Total amount distributed so far (native currency)
        uint256 pendingYield; // Yield waiting to be claimed
        address nftContract; // Address of the RWA NFT
        uint256 lastDistributionTime;
    }

    // Mapping from NFT ID to YieldStream
    mapping(uint256 => YieldStream) public streams;

    // Track claimed yield per user per stream?
    // Simplified: If NFT owner changes, how do we handle?
    // For Hackathon: Assume yield claims go to CURRENT owner of NFT.

    event YieldDeposited(uint256 indexed tokenId, uint256 amount);
    event YieldClaimed(
        uint256 indexed tokenId,
        address indexed owner,
        uint256 amount
    );

    constructor() Ownable() {}

    // 1. Deposit Yield (e.g. from invoice payment or rental income)
    // Anyone can deposit yield for an asset (e.g. the Invoice payer)
    function depositYield(
        uint256 tokenId,
        address nftContract
    ) external payable nonReentrant {
        require(msg.value > 0, "No yield provided");

        YieldStream storage stream = streams[tokenId];
        stream.tokenId = tokenId;
        stream.nftContract = nftContract;

        // Add to pending
        stream.pendingYield += msg.value;
        stream.totalYield += msg.value; // Track lifetime stats
        stream.lastDistributionTime = block.timestamp;

        emit YieldDeposited(tokenId, msg.value);
    }

    // 2. Claim Yield (Only NFT Owner)
    function claimYield(uint256 tokenId) external nonReentrant {
        YieldStream storage stream = streams[tokenId];
        require(stream.pendingYield > 0, "No yield to claim");

        // Verify ownership
        IERC721 nft = IERC721(stream.nftContract);
        require(nft.ownerOf(tokenId) == msg.sender, "Only NFT owner can claim");

        uint256 amount = stream.pendingYield;
        stream.pendingYield = 0;

        (bool sent, ) = payable(msg.sender).call{value: amount}("");
        require(sent, "Failed to send Ether");

        emit YieldClaimed(tokenId, msg.sender, amount);
    }

    // View function for frontend
    function getClaimableYield(
        uint256 tokenId
    ) external view returns (uint256) {
        return streams[tokenId].pendingYield;
    }
}
