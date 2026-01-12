# backend/contract_info.py
import json
import os

# --- DEPLOYED CONTRACT ADDRESSES ---
# --- DEPLOYED CONTRACT ADDRESSES ---
ARIANFT_ADDRESS = "0xD504D75D5ebfaBEfF8d35658e85bbc52CC66d880"
ARIATOKEN_ADDRESS = "0xf37F527E7b50A07Fa7fd49D595132a1f2fDC5f98"
ARIAMARKETPLACE_ADDRESS = "0x13056D2af56AFb98d924FC8146B8E0aa2C8B67d7"

FRACTIONALNFT_ADDRESS = "0x3e2B64f8d927447C370CD6a84FAdf92f6B95C806"

YIELDDISTRIBUTOR_ADDRESS = "0x047100C5357497bFC8Ecc6846E65BC7bDb4d35f9"

ORACLE_ADDRESS = "0x85B5F81f2581Ae8BbC1353F55456EF00aD67993B"

# --- DYNAMIC ABI LOADING ---

def load_abi(contract_filename: str) -> list:
    """
    Loads a contract's ABI from its Hardhat artifact file.
    Assumes this script is in 'backend/' and artifacts are in '../contracts-hardhat/artifacts/'.
    """
    try:
        # Construct the relative path to the artifact file
        artifact_path = os.path.join(
            os.path.dirname(__file__),
            '..',
            'contracts',
            'artifacts',
            'contracts',
            contract_filename
        )

        with open(artifact_path, 'r') as f:
            artifact = json.load(f)
            return artifact['abi']

    except FileNotFoundError:
        print(f"ERROR: Artifact file not found at {artifact_path}")
        print("Please ensure your monorepo structure is correct ('backend' and 'contracts-hardhat' are sibling folders) and that you have compiled your contracts.")
        raise
    except KeyError:
        print(f"ERROR: 'abi' key not found in {artifact_path}. The artifact file may be corrupted.")
        raise

# Load the ABIs from their respective .sol.json files
ARIANFT_ABI = load_abi('AriaNFT.sol/AriaNFT.json')
ARIATOKEN_ABI = load_abi('AriaToken.sol/AriaToken.json')
ARIAMARKETPLACE_ABI = load_abi('AriaMarketplace.sol/AriaMarketplace.json')

print("Successfully loaded contract ABIs from artifact files.")
FRACTIONALNFT_ABI = load_abi('FractionalNFT.sol/FractionalNFT.json')
