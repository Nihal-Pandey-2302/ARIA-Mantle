# backend/blockchain_service.py
import os
from web3 import Web3
from dotenv import load_dotenv
from contract_info import ARIANFT_ADDRESS, ARIANFT_ABI

load_dotenv()

class BlockchainService:
    # --- CONFIGURATION ---
    PROVIDER_URL = os.getenv("MANTLE_RPC_URL") or os.getenv("QIE_RPC_URL") or "https://rpc1testnet.qie.digital"
    
    # Load the server's wallet private key from .env
    # This is the first account provided by the `npx hardhat node` command
    SERVER_PRIVATE_KEY = os.getenv("SERVER_WALLET_PRIVATE_KEY")
    
    # --- INITIALIZATION ---
    w3 = Web3(Web3.HTTPProvider(PROVIDER_URL))
    server_account = w3.eth.account.from_key(SERVER_PRIVATE_KEY)
    
    # Instantiate the NFT contract object
    nft_contract = w3.eth.contract(address=ARIANFT_ADDRESS, abi=ARIANFT_ABI)

    @classmethod
    def mint_nft(cls, recipient_address: str, ipfs_hash: str) -> str:
        """
        Mints a new AriaNFT and returns the transaction hash.
        """
        try:
            print(f"[Blockchain Service] Minting NFT for {recipient_address} with IPFS hash {ipfs_hash}")

            # 1. Build the transaction
            # 1. Prepare contract function
            contract_func = cls.nft_contract.functions.safeMint(recipient_address, ipfs_hash)
            
            # 2. Get nonce and gas price
            nonce = cls.w3.eth.get_transaction_count(cls.server_account.address)
            gas_price = cls.w3.eth.gas_price

            # 3. Estimate Gas (Crucial for L2s like Mantle)
            try:
                estimated_gas = contract_func.estimate_gas({
                    'from': cls.server_account.address,
                    'nonce': nonce,
                    'gasPrice': gas_price
                })
                # Add 20% buffer for safety
                gas_limit = int(estimated_gas * 1.2)
                print(f"[Blockchain Service] Estimated Gas: {estimated_gas}, Limit with buffer: {gas_limit}")
            except Exception as e:
                error_str = str(e)
                if "KYC verification required" in error_str:
                    print(f"[Blockchain Service] KYC Error: Recipient {recipient_address} is not verified.")
                    raise Exception("KYC Verification Required. Please click 'Verify Identity' in the top right corner.")
                
                print(f"[Blockchain Service] Gas estimation failed: {e}. Using fallback.")
                gas_limit = 100000000 # Fallback: 100M (Satisfies 72M requirement)

            # 4. Build the transaction
            tx_data = contract_func.build_transaction({
                'from': cls.server_account.address,
                'nonce': nonce,
                'gas': gas_limit,
                'gasPrice': gas_price
            })

            # 2. Sign the transaction with the server's private key
            signed_tx = cls.w3.eth.account.sign_transaction(tx_data, private_key=cls.SERVER_PRIVATE_KEY)

            # 3. Send the raw transaction to the blockchain
            tx_hash = cls.w3.eth.send_raw_transaction(signed_tx.raw_transaction)

            # 4. Wait for the transaction to be mined and get the receipt
            tx_receipt = cls.w3.eth.wait_for_transaction_receipt(tx_hash)

            print(f"[Blockchain Service] Minting successful. Tx Hash: {tx_receipt.transactionHash.hex()}")
            
            return tx_receipt.transactionHash.hex()

        except Exception as e:
            print(f"[Blockchain Service] Error minting NFT: {e}")
            raise e