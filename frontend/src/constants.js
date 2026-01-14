// src/constants.js
import { ethers } from 'ethers';

// --- Hardhat Local Network Configuration ---
// --- Mantle Testnet Configuration ---
export const NETWORK_CONFIG = {
  chainId: '0x138B', // 5003 in hex
  chainName: 'Mantle Testnet',
  nativeCurrency: { name: 'Mantle', decimals: 18, symbol: 'MNT' },
  rpcUrls: ['https://rpc.sepolia.mantle.xyz/'],
  blockExplorerUrls: ['https://sepolia.mantlescan.xyz/']
};

// --- Backend API URL ---
export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:5001';

// --- Deployed Contract Addresses (Mantle Testnet) ---
export const ARIA_NFT_ADDRESS = "0xD504D75D5ebfaBEfF8d35658e85bbc52CC66d880";
export const ARIA_TOKEN_ADDRESS = "0xf37F527E7b50A07Fa7fd49D595132a1f2fDC5f98";
export const MARKETPLACE_ADDRESS = "0x13056D2af56AFb98d924FC8146B8E0aa2C8B67d7";
export const ARIA_MARKETPLACE_ADDRESS = MARKETPLACE_ADDRESS; // Alias for consistency

export const FRACTIONAL_NFT_ADDRESS = "0x3e2B64f8d927447C370CD6a84FAdf92f6B95C806";
export const YIELD_DISTRIBUTOR_ADDRESS = "0x047100C5357497bFC8Ecc6846E65BC7bDb4d35f9";
export const ORACLE_ADDRESS = "0x85B5F81f2581Ae8BbC1353F55456EF00aD67993B";

// --- Contract ABIs (imported from local abis folder for Vercel support) ---
import NftArtifact from './abis/AriaNFT.json';
import TokenArtifact from './abis/AriaToken.json';
import MarketplaceArtifact from './abis/AriaMarketplace.json';
import YieldDistributorArtifact from './abis/YieldDistributor.json';
import FractionalArtifact from './abis/FractionalNFT.json';

export const ARIA_NFT_ABI = NftArtifact.abi;
export const ARIA_TOKEN_ABI = TokenArtifact.abi;
export const MARKETPLACE_ABI = MarketplaceArtifact.abi;
export const YIELD_DISTRIBUTOR_ABI = YieldDistributorArtifact.abi;
export const FRACTIONAL_NFT_ABI = FractionalArtifact.abi;

// Alias for consistency
export {
  MARKETPLACE_ABI as ARIA_MARKETPLACE_ABI 
};

// --- Ethers.js Contract Interfaces ---
// These help with parsing event logs
export const ARIA_NFT_INTERFACE = new ethers.Interface(ARIA_NFT_ABI);

// --- Public Provider (Fallback) ---
// Use this for read-only operations to avoid MetaMask RPC errors
// We disable batching ({ batchMaxCount: 1 }) to respect DRPC free tier limits (max 3 batch requests)
// --- Public Provider (Fallback) ---
// Use this for read-only operations to avoid MetaMask RPC errors
// Switched to Official Mantle RPC specific for Sepolia (Exact Docs Match)
export const publicProvider = new ethers.JsonRpcProvider(
  'https://rpc.sepolia.mantle.xyz/', 
  undefined, 
  { batchMaxCount: 1 }
);


// --- Display Constants ---
export const TOKEN_DISPLAY = 'ARIA';
export const TOKEN_DECIMALS = 18; // Default for ERC20
