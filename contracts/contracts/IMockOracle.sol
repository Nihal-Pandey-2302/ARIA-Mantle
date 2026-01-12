// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IMockOracle
 * @dev Interface for Mock Oracle integration
 * Provides real-world data feeds for dynamic pricing
 */
interface IMockOracle {
    /**
     * @dev Get the latest price for a given pair
     * @param pair The trading pair (e.g., "ARIA/USD", "ETH/USD")
     * @return price The latest price (scaled by 10^8 for precision)
     * @return timestamp When the price was last updated
     */
    function getLatestPrice(
        string memory pair
    ) external view returns (int256 price, uint256 timestamp);

    function updateAnswer(int256 _answer) external;
}
