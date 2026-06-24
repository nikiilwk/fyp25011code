# On-Chain Credit & Health Scoring MVP in Google Colab
# --- Step 1: Install Dependencies ---
# !pip install web3 py-solc-x pandas requests

import os
from web3 import Web3
import solcx
from google.colab import userdata

# --- Step 2: Configuration and Secrets ---
# CHANGED: We now point this to our Private Enterprise Consortium Chain
PRIVATE_CHAIN_RPC_URL = userdata.get('PRIVATE_CHAIN_RPC_URL') 
PRIVATE_KEY = userdata.get('PRIVATE_KEY')

if not PRIVATE_CHAIN_RPC_URL or not PRIVATE_KEY:
    raise ValueError("Please set PRIVATE_CHAIN_RPC_URL and PRIVATE_KEY in Colab secrets.")

# --- Step 3: The FINAL Solidity Contract ---
with open('CreditScoreOracle.sol', 'r') as file:
    SOLIDITY_CODE = file.read()

# --- Step 4: Compile and Deploy ---
solcx.install_solc('0.8.0')
compiled_sol = solcx.compile_source(SOLIDITY_CODE, output_values=['abi', 'bin'])
contract_interface = compiled_sol['<stdin>:CreditScoreOracle']

w3 = Web3(Web3.HTTPProvider(PRIVATE_CHAIN_RPC_URL))
if not w3.is_connected():
    raise ValueError("Cannot connect to the private chain.")

account = w3.eth.account.from_key(PRIVATE_KEY)
w3.eth.default_account = account.address

print(f"Deploying from account: {account.address}...")

CreditScoreOracle = w3.eth.contract(abi=contract_interface['abi'], bytecode=contract_interface['bin'])
tx = CreditScoreOracle.constructor().build_transaction({
    'from': account.address,
    'nonce': w3.eth.get_transaction_count(account.address),
    'gas': 3000000,
    'gasPrice': w3.to_wei('10', 'gwei')
})
signed_tx = account.sign_transaction(tx)

tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction)
print(f"Deployment TX sent! Waiting for receipt... Hash: {tx_hash.hex()}")
tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash)

contract_address = tx_receipt.contractAddress
print(f"\n✅ CONTRACT SUCCESSFULLY DEPLOYED!")
print(f"📋 Copy this address to your dashboard.html: {contract_address}")