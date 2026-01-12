// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IFractionalNFT {
    function getFractionalToken(
        uint256 tokenId
    ) external view returns (address);
}

contract YieldDistributor is Ownable, ReentrancyGuard {
    IERC721 public ariaNFT;
    IERC20 public ariaToken;
    IFractionalNFT public fractionalNFT;

    struct YieldStream {
        uint256 totalYield; // Total yield generated (in ARIA tokens)
        uint256 distributedYield; // Already distributed
        uint256 lastUpdateTime; // Last time yield was calculated
        uint256 yieldRate; // ARIA tokens per second (e.g., 12.5% APY)
        bool active; // Is yield accruing?
    }

    mapping(uint256 => YieldStream) public streams; // tokenId => YieldStream
    mapping(uint256 => mapping(address => uint256)) public claimed; // tokenId => user => amount

    event YieldStreamCreated(uint256 indexed tokenId, uint256 yieldRate);
    event YieldClaimed(
        uint256 indexed tokenId,
        address indexed claimer,
        uint256 amount
    );
    event YieldDeposited(uint256 indexed tokenId, uint256 amount);

    constructor(address _ariaNFT, address _ariaToken, address _fractionalNFT) {
        ariaNFT = IERC721(_ariaNFT);
        ariaToken = IERC20(_ariaToken);
        fractionalNFT = IFractionalNFT(_fractionalNFT);
    }

    /**
     * @dev Create a yield stream for an NFT (called by NFT minter or admin)
     * @param tokenId The NFT token ID
     * @param yieldRate ARIA tokens per second (e.g., 0.000000396 ARIA/sec = ~12.5% APY)
     */
    function createYieldStream(uint256 tokenId, uint256 yieldRate) external {
        // Allow owner or the NFT contract to create streams
        require(
            msg.sender == owner() || msg.sender == address(ariaNFT),
            "Unauthorized"
        );
        require(streams[tokenId].active == false, "Stream already exists");

        streams[tokenId] = YieldStream({
            totalYield: 0,
            distributedYield: 0,
            lastUpdateTime: block.timestamp,
            yieldRate: yieldRate,
            active: true
        });

        emit YieldStreamCreated(tokenId, yieldRate);
    }

    /**
     * @dev Deposit yield into the contract (from marketplace fees, interest payments, etc)
     */
    function depositYield(uint256 tokenId, uint256 amount) external {
        require(streams[tokenId].active, "No active stream");
        require(
            ariaToken.transferFrom(msg.sender, address(this), amount),
            "Transfer failed"
        );

        streams[tokenId].totalYield += amount;
        emit YieldDeposited(tokenId, amount);
    }

    /**
     * @dev Calculate pending yield for a token holder
     */
    function pendingYield(
        uint256 tokenId,
        address holder
    ) public view returns (uint256) {
        YieldStream memory stream = streams[tokenId];
        if (!stream.active) return 0;

        // Calculate time-based accrual
        uint256 elapsed = block.timestamp - stream.lastUpdateTime;
        uint256 accrued = elapsed * stream.yieldRate;

        // Add any deposited yield
        uint256 totalAvailable = stream.totalYield +
            accrued -
            stream.distributedYield;

        // Check if NFT is fractionalized
        address fractionalToken = address(0);
        try fractionalNFT.getFractionalToken(tokenId) returns (address token) {
            fractionalToken = token;
        } catch {}
        if (fractionalToken != address(0)) {
            // Fractionalized: holder gets proportional share
            uint256 holderBalance = IERC20(fractionalToken).balanceOf(holder);
            uint256 totalSupply = IERC20(fractionalToken).totalSupply();

            if (totalSupply == 0) return 0;
            uint256 holderShare = (totalAvailable * holderBalance) /
                totalSupply;

            // Subtract already claimed
            if (holderShare <= claimed[tokenId][holder]) return 0;
            return holderShare - claimed[tokenId][holder];
        } else {
            // Not fractionalized: full owner gets all
            if (ariaNFT.ownerOf(tokenId) != holder) return 0;
            return totalAvailable - claimed[tokenId][holder];
        }
    }

    /**
     * @dev Claim pending yield
     */
    function claimYield(uint256 tokenId) external nonReentrant {
        uint256 pending = pendingYield(tokenId, msg.sender);
        require(pending > 0, "No yield to claim");

        // Update claimed amount
        claimed[tokenId][msg.sender] += pending;
        streams[tokenId].distributedYield += pending;

        // Transfer ARIA tokens
        require(ariaToken.transfer(msg.sender, pending), "Transfer failed");

        emit YieldClaimed(tokenId, msg.sender, pending);
    }

    /**
     * @dev Emergency stop (owner only)
     */
    function pauseYieldStream(uint256 tokenId) external onlyOwner {
        streams[tokenId].active = false;
    }

    /**
     * @dev Get yield stats for frontend
     */
    function getYieldStats(
        uint256 tokenId
    )
        external
        view
        returns (
            uint256 totalYield,
            uint256 distributedYield,
            uint256 yieldRate,
            bool active
        )
    {
        YieldStream memory stream = streams[tokenId];
        return (
            stream.totalYield,
            stream.distributedYield,
            stream.yieldRate,
            stream.active
        );
    }
}
