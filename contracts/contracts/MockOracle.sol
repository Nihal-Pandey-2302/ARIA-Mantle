// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./IMockOracle.sol";

/**
 * @title MockOracle
 * @notice Mock implementation of an Oracle for Mantle Testnet
 * @dev Implements IMockOracle for AriaMarketplace compatibility
 */
contract MockOracle is Ownable, IMockOracle {
    // Map pair string to price (simple mock)
    mapping(string => int256) public prices;

    uint8 public decimals;
    string public description;
    uint256 public version;

    event AnswerUpdated(
        int256 indexed current,
        uint256 indexed roundId,
        uint256 updatedAt
    );

    constructor(string memory _description, uint8 _decimals) Ownable() {
        description = _description;
        decimals = _decimals;
        version = 1;
        // Default ARIA price
        prices["ARIA/USD"] = 50000000; // $0.50
    }

    // IMockOracle implementation
    function getLatestPrice(
        string memory pair
    ) external view override returns (int256 price, uint256 timestamp) {
        if (prices[pair] != 0) {
            return (prices[pair], block.timestamp);
        }
        return (0, 0);
    }

    // Allow updating specific pair
    function updatePrice(string memory pair, int256 _price) external onlyOwner {
        prices[pair] = _price;
    }

    // Helper for updateAnswer (legacy support if needed, or remove)
    function updateAnswer(int256 _answer) external onlyOwner {
        // Assume this updates ARIA/USD default
        prices["ARIA/USD"] = _answer;
        emit AnswerUpdated(_answer, 0, block.timestamp);
    }
}
