import FractionalArtifact from '../../contracts/artifacts/contracts/FractionalNFT.sol/FractionalNFT.json';
// src/constants.js
import { ethers } from 'ethers';

// --- Hardhat Local Network Configuration ---
// --- Mantle Testnet Configuration ---
export const NETWORK_CONFIG = {
  chainId: '0x138B', // 5003 in hex
  chainName: 'Mantle Testnet',
  nativeCurrency: { name: 'Mantle', decimals: 18, symbol: 'MNT' },
  rpcUrls: ['https://rpc.testnet.mantle.xyz'],
  blockExplorerUrls: ['https://explorer.testnet.mantle.xyz/']
};

// --- Backend API URL ---
export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:5001';

// --- Deployed Contract Addresses (Mantle Testnet) ---
export const ARIA_NFT_ADDRESS = "";
export const ARIA_TOKEN_ADDRESS = "";
export const MARKETPLACE_ADDRESS = "";
export const ARIA_MARKETPLACE_ADDRESS = MARKETPLACE_ADDRESS; // Alias for consistency

export const FRACTIONAL_NFT_ADDRESS = "";

// --- Contract ABIs (imported from artifacts) ---
// Make sure the path is correct relative to your frontend directory
// --- Contract ABIs (imported from artifacts) ---
import NftArtifact from '../../contracts/artifacts/contracts/AriaNFT.sol/AriaNFT.json';
import TokenArtifact from '../../contracts/artifacts/contracts/AriaToken.sol/AriaToken.json';
import MarketplaceArtifact from '../../contracts/artifacts/contracts/AriaMarketplace.sol/AriaMarketplace.json';


export const ARIA_NFT_ABI = NftArtifact.abi;
export const ARIA_TOKEN_ABI = TokenArtifact.abi;
export const MARKETPLACE_ABI = MarketplaceArtifact.abi;
export const ARIA_MARKETPLACE_ABI = MARKETPLACE_ABI; // Alias for consistency

// --- Ethers.js Contract Interfaces ---
// These help with parsing event logs
export const ARIA_NFT_INTERFACE = new ethers.Interface(ARIA_NFT_ABI);

// --- Display Constants ---
export const TOKEN_DISPLAY = 'ARIA';
export const TOKEN_DECIMALS = 18; // Default for ERC20
export const FRACTIONAL_NFT_ABI = FractionalArtifact.abi;
