# A.R.I.A. - Automated RWA Intelligence & Authentication (Mantle Edition)

## Built for Mantle Global Hackathon 2025 🏆

<p align="center">
  <img src="https://img.shields.io/badge/Network-Mantle-black?style=for-the-badge&logo=mantle" alt="Mantle">
  <img src="https://img.shields.io/badge/AI-Groq%20Llama%203.3-orange?style=for-the-badge&logo=meta" alt="Groq AI">
  <img src="https://img.shields.io/badge/Storage-IPFS-65c2cb?style=for-the-badge&logo=ipfs" alt="IPFS">
  <img src="https://img.shields.io/badge/Stack-React%20%2B%20Python-green?style=for-the-badge" alt="Tech Stack">
</p>

<p align="center">
  <strong>The world's first Mantle-native RWA verification platform</strong><br>
  <em>Verify ANY document. Tokenize ANY asset. Trade instantly. All in under 3 seconds.</em>
</p>

---

<details open>
<summary><strong>🎯 The Problem We're Solving</strong></summary>

## 🎯 The Problem We're Solving

The **$2 Trillion+ Real-World Asset (RWA)** market faces critical challenges:

- 📄 **Manual Verification Crisis** - Takes 3-14 days and costs $10-$1000 per document
- 🚫 **Centralized Trust Issues** - Relies on intermediaries and paper trails
- 💸 **Illiquidity Trap** - No native venues for trading tokenized assets
- ⚠️ **Fraud Risk** - $50 billion lost annually to document fraud

**A.R.I.A. leverages Mantle's high-performance modular L2 to eliminate these bottlenecks.**

</details>

---

<details>
<summary><strong>💡 Our Solution (Mantle Optimized)</strong></summary>

## 💡 Our Solution

A.R.I.A. is a **complete end-to-end protocol** that transforms real-world documents into verified, liquid, tradeable NFTs on Mantle Network. We deliver:

### 🤖 **Multi-Document AI Verification (Groq Llama 3.3)**

Support for **8+ document types** with automatic AI classification:

- 💰 Invoices & Receipts
- 🏠 Property Deeds
- 🚗 Vehicle Registrations
- 🎓 Certificates & Degrees

### ⚡ **Built on Mantle Network**

- **Modular Architecture**: Leverages Mantle DA for low-cost metadata availability.
- **Unbeatable Speed**: Instant confirmations for high-frequency RWA trading.
- **Near-Zero Fees**: Minting an RWA NFT costs fractions of a cent.

### 🛡️ **Tier 1 Regulatory Compliance (New)**

- **Native KYC Gates**: `AriaNFT.sol` enforces identity verification before minting.
- **Investor Classes**: Retail, Verified, and Accredited investor tiers.
- **Fraud Detection**: AI flags suspicious modifications or future-dates.

### 💰 **Yield Distribution Engine (New)**

- **Real-World Yield**: Distribute rental income or invoice payments directly to NFT holders.
- **Claim Dashboard**: Simple UI for holders to claim ETH/MNT rewards.

</details>

---

<details>
<summary><strong>🏗️ Technical Architecture</strong></summary>

## 🏗️ Technical Architecture

### **System Flow Diagram**

```mermaid
graph TD
    %% Styling
    classDef primary fill:#6b46c1,stroke:#fff,stroke-width:2px,color:#fff;
    classDef blockchain fill:#000000,stroke:#65c2cb,stroke-width:2px,color:#fff;
    classDef ai fill:#c53030,stroke:#fff,stroke-width:2px,color:#fff;

    subgraph User [User Interface]
        Upload[File Upload]:::primary
        KYC[KYC Gate]:::primary
        Yield[Yield Dashboard]:::primary
    end

    subgraph AI [AI Service]
        Groq[Groq Llama 3.3]:::ai
        Vision[QR Analysis]:::ai
    end

    subgraph Contracts [Mantle Network]
        Auth[AriaNFT (KYC-Gated)]:::blockchain
        Mkt[Marketplace (Hybrid Pricing)]:::blockchain
        Dist[YieldDistributor]:::blockchain
    end

    Upload -->|1. Analyze| Groq
    Groq -->|2. Verify| KYC
    KYC -->|3. Mint| Auth
    Auth -->|4. List| Mkt

    Yield -.->|Claim Rewards| Dist
    Dist -.->|Pay| Auth
```

### **Technology Stack**

#### **Frontend**

- **Framework**: React 18 + Vite
- **UI Library**: Chakra UI
- **Wallet**: MetaMask / Mantle Wallet support

#### **Backend**

- **Language**: Python (Flask)
- **AI**: Groq API (Llama 3.3 70B)
- **Blockchain**: Web3.py

#### **Smart Contracts (Mantle)**

- **Language**: Solidity 0.8.20
- **Core Contracts**:
  - `AriaNFT.sol`: ERC721 with `onlyKYCVerified` modifier.
  - `YieldDistributor.sol`: Handles ETH/MNT payout streams.
  - `Marketplace.sol`: Supports static and USD-pegged (Oracle) pricing.
  - `MockOracle.sol`: Simulates Chainlink feeds on Mantle Testnet.

</details>

---

<details>
<summary><strong>🚀 Getting Started</strong></summary>

## 🚀 Getting Started

### **Prerequisites**

- Node.js 18+ & Python 3.9+
- Mantle Wallet (MetaMask configured for Chain ID 5003)

### **Installation**

#### **1. Clone & Setup**

```bash
git clone https://github.com/Nihal-Pandey-2302/ARIA-Mantle.git
cd ARIA-Mantle
```

#### **2. Install Dependencies**

```bash
# Backend
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Frontend
cd ../frontend
npm install
```

#### **3. Deploy to Mantle Testnet**

```bash
cd ../contracts
# Create .env with PRIVATE_KEY
npx hardhat run scripts/deploy.js --network mantleTestnet
```

#### **4. Run Application**

```bash
# Terminal 1: Backend
python backend/app.py

# Terminal 2: Frontend
cd frontend
npm run dev
```

</details>

---

<details>
<summary><strong>🆕 Mantle Hackathon Features</strong></summary>

## 🆕 Mantle Hackathon Features (Tier 1 & 2)

### 1. **Native KYC/AML Integration** 🆔

A.R.I.A. on Mantle includes a strict compliance layer.

- **How it works**: Users self-attest via the `KYCGate` component.
- **On-Chain**: The `AriaNFT` contract checks `kycStatus[msg.sender]` before allowing any minting transaction.
- **Privacy**: Identity docs are hashed via IPFS (simulated for demo).

### 2. **RWA Yield Distribution** 💸

Real-world assets generate cash flow. A.R.I.A. makes it claimable on-chain.

- **YieldDistributor**: A pull-payment contract where asset managers deposit yield.
- **Instant Claims**: NFT holders visit the **Yield Dashboard** to withdraw their share in $MNT or $ETH.

### 3. **Oracle-Powered Hybrid Pricing** 🔮

Sellers can list assets in USD, preventing crypto-volatility risk.

- **MockOracle**: We deployed a custom Oracle on Mantle Testnet since Chainlink feeds are Mainnet-only.
- **Dynamic Conversion**: Buyers pay the real-time $MNT equivalent of the USD price.

</details>

---

<details>
<summary><strong>🧪 Testing Guide</strong></summary>

## 🧪 Testing Guide

### **Manual Flow**

1. **Connect Wallet**: Switch to Mantle Testnet.
2. **KYC Check**: Click "Verify Identity" in the header. (Required to Mint)
3. **Upload**: Select "Invoice" and upload a PDF.
4. **Mint**: Create your verifiable RWA NFT.
5. **Yield**: Go to `/yield` to see simulated earnings from your asset.

</details>

---

## 📜 Deployed Contracts (Mantle Testnet)

| Contract             | Address                           |
| -------------------- | --------------------------------- |
| **AriaNFT**          | `DEPLOY_ON_MANTLE_TO_GET_ADDRESS` |
| **Marketplace**      | `DEPLOY_ON_MANTLE_TO_GET_ADDRESS` |
| **YieldDistributor** | `DEPLOY_ON_MANTLE_TO_GET_ADDRESS` |
| **MockOracle**       | `DEPLOY_ON_MANTLE_TO_GET_ADDRESS` |

---

**Built with ❤️ by Nihal Pandey for the Mantle Global Hackathon.**
