import React, { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Copy, ExternalLink, X, FileCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function TransactionReceipt({ transaction, onClose }) {
  const [showContract, setShowContract] = useState(false);
  
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const smartContractCode = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

/**
 * @title DecentralizedDataWallet
 * @dev Decentralized data wallet system for trading travel data.
 * - Uses ERC20 for utility tokens (transferable for payments).
 * - Uses custom non-transferable data tokens (soulbound).
 * - Includes access control, privacy mechanisms (hashes/signatures).
 * - Supports minting, trading, access control, and verification.
 */
contract DecentralizedDataWallet is ERC20, AccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant DATA_VERIFIER_ROLE = keccak256("DATA_VERIFIER_ROLE");

    // Non-transferable Data Token mappings
    mapping(uint256 => address) private _dataOwners;
    mapping(uint256 => string) private _dataHashes;
    mapping(uint256 => address) private _dataAccessGrantees;
    uint256 private _dataTokenCounter;

    event DataTokenMinted(uint256 indexed tokenId, address owner, string dataHash);
    event UtilityTokensIssued(address indexed to, uint256 amount);
    event TransactionCommitted(uint256 indexed tokenId, address seller, address buyer, uint256 price);
    event AccessGranted(uint256 indexed tokenId, address grantee);
    event AccessDenied(uint256 indexed tokenId, address revoked);
    event DataVerified(uint256 indexed tokenId, address verifier);

    constructor() ERC20("UtilityToken", "UTK") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }

    modifier withSignatureVerification(bytes32 messageHash, bytes memory signature, address expectedSigner) {
        address signer = ECDSA.recover(messageHash, signature);
        require(signer == expectedSigner, "Invalid signature");
        _;
    }

    function mintNonTransferableDataToken(string memory dataHash) public {
        require(hasRole(ADMIN_ROLE, msg.sender) || hasRole(DATA_VERIFIER_ROLE, msg.sender), 
                "Not authorized to mint");
        _dataTokenCounter++;
        uint256 tokenId = _dataTokenCounter;
        _dataOwners[tokenId] = msg.sender;
        _dataHashes[tokenId] = dataHash;
        emit DataTokenMinted(tokenId, msg.sender, dataHash);
    }

    function issueUtilityTokens(address to, uint256 amount) public onlyRole(ADMIN_ROLE) {
        _mint(to, amount);
        emit UtilityTokensIssued(to, amount);
    }

    function verifyData(uint256 tokenId, string memory providedHash) 
        public onlyRole(DATA_VERIFIER_ROLE) {
        require(keccak256(abi.encodePacked(providedHash)) == 
                keccak256(abi.encodePacked(_dataHashes[tokenId])), 
                "Data hash mismatch");
        emit DataVerified(tokenId, msg.sender);
    }

    function commitTransaction(uint256 tokenId, address buyer, uint256 price, bytes memory signature) 
        public {
        address seller = _dataOwners[tokenId];
        require(msg.sender == seller, "Only seller can commit");
        bytes32 messageHash = keccak256(abi.encodePacked(tokenId, buyer, price));
        
        _transfer(buyer, address(this), price); // Escrow
        _dataAccessGrantees[tokenId] = buyer;   // Grant access
        _transfer(address(this), seller, price); // Release to seller

        emit TransactionCommitted(tokenId, seller, buyer, price);
        emit AccessGranted(tokenId, buyer);
    }

    function hasAccess(uint256 tokenId, address user) public view returns (bool) {
        return _dataAccessGrantees[tokenId] == user || _dataOwners[tokenId] == user;
    }

    function getDataHash(uint256 tokenId) public view returns (string memory) {
        require(hasAccess(tokenId, msg.sender), "No access to data");
        return _dataHashes[tokenId];
    }

    function denyAccess(uint256 tokenId, address toRevoke) public {
        require(msg.sender == _dataOwners[tokenId], "Only owner can deny access");
        require(_dataAccessGrantees[tokenId] == toRevoke, "No access to revoke");
        _dataAccessGrantees[tokenId] = address(0);
        emit AccessDenied(tokenId, toRevoke);
    }

    function ownerOfDataToken(uint256 tokenId) public view returns (address) {
        address owner = _dataOwners[tokenId];
        require(owner != address(0), "Token does not exist");
        return owner;
    }
}`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="glass-card rounded-3xl p-8 max-w-lg w-full"
      >
        {/* Success Icon */}
        <div className="text-center mb-6">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Transaction Successful!</h2>
          <p className="text-gray-600">Your purchase has been confirmed on the blockchain</p>
        </div>

        {/* Transaction Details */}
        <div className="space-y-3 mb-6">
          {/* Transaction Hash */}
          <div className="bg-white/50 rounded-xl p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Transaction Hash</span>
              <button
                onClick={() => copyToClipboard(transaction.hash)}
                className="text-purple-600 hover:text-purple-700"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
            <p className="font-mono text-sm break-all text-gray-900">
              {transaction.hash}
            </p>
          </div>

          {/* Block Number */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/50 rounded-xl p-4">
              <p className="text-sm text-gray-600 mb-1">Block Number</p>
              <p className="font-semibold text-lg">{transaction.blockNumber}</p>
            </div>
            <div className="bg-white/50 rounded-xl p-4">
              <p className="text-sm text-gray-600 mb-1">Confirmations</p>
              <p className="font-semibold text-lg">{transaction.confirmations}</p>
            </div>
          </div>

          {/* From/To */}
          <div className="bg-white/50 rounded-xl p-4">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm text-gray-600">From</span>
              <button
                onClick={() => copyToClipboard(transaction.from)}
                className="text-purple-600 hover:text-purple-700"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
            <p className="font-mono text-xs text-gray-900 mb-4">
              {transaction.from}
            </p>
            
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm text-gray-600">To</span>
              <button
                onClick={() => copyToClipboard(transaction.to)}
                className="text-purple-600 hover:text-purple-700"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
            <p className="font-mono text-xs text-gray-900">
              {transaction.to}
            </p>
          </div>

          {/* Value & Gas */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/50 rounded-xl p-4">
              <p className="text-sm text-gray-600 mb-1">Value</p>
              <p className="font-semibold">{transaction.value} ETH</p>
            </div>
            <div className="bg-white/50 rounded-xl p-4">
              <p className="text-sm text-gray-600 mb-1">Gas Fee</p>
              <p className="font-semibold">{transaction.gasFee} ETH</p>
            </div>
          </div>

          {/* Status */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="font-semibold text-green-900">Status: Confirmed</span>
            </div>
            <p className="text-sm text-green-700 mt-2">
              Transaction successfully mined in block {transaction.blockNumber}
            </p>
          </div>
        </div>

        {/* Smart Contract Section */}
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => setShowContract(!showContract)}
            className="w-full flex items-center justify-between"
          >
            <div className="flex items-center space-x-2">
              <FileCode className="w-4 h-4" />
              <span>View Smart Contract Code</span>
            </div>
            <Badge variant="secondary">Solidity</Badge>
          </Button>

          {showContract && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-4 bg-slate-900 rounded-xl p-4 overflow-x-auto"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-400">DataLoomRewards.sol</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    copyToClipboard(smartContractCode);
                  }}
                  className="h-6 text-slate-400 hover:text-white"
                >
                  <Copy className="w-3 h-3 mr-1" />
                  Copy
                </Button>
              </div>
              <pre className="text-xs text-slate-100 overflow-x-auto">
                <code>{smartContractCode}</code>
              </pre>
              <div className="mt-3 p-3 bg-purple-900/30 rounded-lg border border-purple-500/30">
                <p className="text-xs text-purple-200">
                  <strong>🔍 Contract Verification:</strong> This code is deployed to Ethereum Testnet (Sepolia). 
                  Data Buyers can verify the logic on Etherscan to ensure fair and transparent reward distribution.
                </p>
              </div>
            </motion.div>
          )}
        </div>

        {/* Actions */}
        <div className="flex space-x-3">
          <Button
            onClick={() => window.open(`https://sepolia.etherscan.io/tx/${transaction.hash}`, '_blank')}
            variant="outline"
            className="flex-1"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            View on Etherscan
          </Button>
          <Button
            onClick={onClose}
            className="flex-1 gradient-purple-cyan text-white"
          >
            Done
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}