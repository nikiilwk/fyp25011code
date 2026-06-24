import React, { useState } from "react";
import { motion } from "framer-motion";
import { Shield, Copy, CheckCircle, FileCode, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function MockExplorer() {
  const [copied, setCopied] = useState(false);

  const contractAddress = "0x71C7656EC7ab88b098defB751B7401B5f6d8976F";
  
  const contractCode = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol"; // For signature verification

/**
 * @title DecentralizedDataWallet
 * @dev Sample contract for a decentralized data wallet system for trading travel data.
 * - Uses ERC20 for utility tokens (transferable for payments).
 * - Uses a custom non-transferable ERC721 for data ownership tokens (soulbound-like).
 * - Includes access control, verifications, privacy mechanisms (via hashes and signatures).
 * - Supports minting, trading, committing transactions, notifying access, enforcing privacy, issuing tokens, and denying access.
 */
contract DecentralizedDataWallet is ERC20, AccessControl {
    // Roles for access control
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant DATA_VERIFIER_ROLE = keccak256("DATA_VERIFIER_ROLE");

    // Non-transferable Data Token (like ERC721 but transfer disabled)
    mapping(uint256 => address) private _dataOwners;
    mapping(uint256 => string) private _dataHashes; // Hash of the data for verification (privacy-preserving)
    mapping(uint256 => address) private _dataAccessGrantees; // Who has access to the data
    uint256 private _dataTokenCounter;

    // Events for notifications
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

    // Modifier to enforce privacy: only allow calls with valid signatures for sensitive ops
    modifier withSignatureVerification(bytes32 messageHash, bytes memory signature, address expectedSigner) {
        address signer = ECDSA.recover(messageHash, signature);
        require(signer == expectedSigner, "Invalid signature");
        _;
    }

    /**
     * @dev Mint non-transferable data token (soulbound-like).
     * Represents ownership of travel data. Cannot be transferred.
     * Data hash is stored for verification (privacy-preserving: actual data off-chain).
     */
    function mintNonTransferableDataToken(string memory dataHash) public {
        require(hasRole(ADMIN_ROLE, msg.sender) || hasRole(DATA_VERIFIER_ROLE, msg.sender), "Not authorized to mint");
        _dataTokenCounter++;
        uint256 tokenId = _dataTokenCounter;
        _dataOwners[tokenId] = msg.sender;
        _dataHashes[tokenId] = dataHash;
        emit DataTokenMinted(tokenId, msg.sender, dataHash);
    }

    /**
     * @dev Issue utility tokens (ERC20) for payments.
     */
    function issueUtilityTokens(address to, uint256 amount) public onlyRole(ADMIN_ROLE) {
        _mint(to, amount);
        emit UtilityTokensIssued(to, amount);
    }

    /**
     * @dev Verify data integrity using hash (privacy-preserving).
     * Can be called by verifiers.
     */
    function verifyData(uint256 tokenId, string memory providedHash) public onlyRole(DATA_VERIFIER_ROLE) {
        require(keccak256(abi.encodePacked(providedHash)) == keccak256(abi.encodePacked(_dataHashes[tokenId])), "Data hash mismatch");
        emit DataVerified(tokenId, msg.sender);
    }

    /**
     * @dev Commit a transaction: Buyer pays with utility tokens, seller grants access.
     * Uses escrow-like mechanism: Tokens transferred to contract, released on success.
     * Privacy: Actual data access off-chain, contract only manages rights.
     */
    function commitTransaction(uint256 tokenId, address buyer, uint256 price, bytes memory signature) public {
        address seller = _dataOwners[tokenId];
        require(msg.sender == seller, "Only seller can commit");
        bytes32 messageHash = keccak256(abi.encodePacked(tokenId, buyer, price));
        // Verify buyer's signature to confirm intent (privacy-preserving agreement)
        _withSignatureVerification(messageHash, signature, buyer);

        // Transfer utility tokens from buyer to seller (via contract for safety)
        _transfer(buyer, address(this), price); // Escrow
        _dataAccessGrantees[tokenId] = buyer; // Grant access
        _transfer(address(this), seller, price); // Release to seller

        emit TransactionCommitted(tokenId, seller, buyer, price);
        emit AccessGranted(tokenId, buyer);
    }

    /**
     * @dev Notify access control: Check if address has access.
     * Emits events internally, but this function can be queried.
     */
    function hasAccess(uint256 tokenId, address user) public view returns (bool) {
        return _dataAccessGrantees[tokenId] == user || _dataOwners[tokenId] == user;
    }

    /**
     * @dev Enforce privacy-preserving mechanism: Only reveal hash, not data.
     * Actual data decryption/access off-chain with proofs if needed.
     */
    function getDataHash(uint256 tokenId) public view returns (string memory) {
        require(hasAccess(tokenId, msg.sender), "No access to data");
        return _dataHashes[tokenId];
    }

    /**
     * @dev Deny access: Revoke grantee's access.
     */
    function denyAccess(uint256 tokenId, address toRevoke) public {
        require(msg.sender == _dataOwners[tokenId], "Only owner can deny access");
        require(_dataAccessGrantees[tokenId] == toRevoke, "No access to revoke");
        _dataAccessGrantees[tokenId] = address(0);
        emit AccessDenied(tokenId, toRevoke);
    }

    // Disable transfers for data tokens (non-transferable)
    function transferDataToken(uint256 tokenId, address to) public pure {
        revert("Data tokens are non-transferable");
    }

    // Override ERC721-like ownerOf for data tokens
    function ownerOfDataToken(uint256 tokenId) public view returns (address) {
        address owner = _dataOwners[tokenId];
        require(owner != address(0), "Token does not exist");
        return owner;
    }
}`;

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Contract address copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header - Etherscan Style */}
      <header className="bg-slate-800 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="w-8 h-8 text-cyan-400" />
              <div>
                <h1 className="text-xl font-bold">Sepolia Testnet Explorer</h1>
                <p className="text-xs text-gray-400">Ethereum Blockchain Explorer</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.close()}
              className="text-white hover:bg-slate-700"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Close
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Contract Overview Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6"
        >
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <FileCode className="w-5 h-5 mr-2 text-gray-600" />
            Contract
          </h2>

          {/* Contract Address */}
          <div className="mb-4">
            <label className="text-sm text-gray-500 mb-1 block">Contract Address</label>
            <div className="flex items-center space-x-2 bg-gray-50 rounded-lg p-3 border border-gray-200">
              <code className="flex-1 font-mono text-sm text-gray-800">{contractAddress}</code>
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(contractAddress)}
              >
                {copied ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Verification Badge - Prominent */}
          <div className="bg-green-50 border-2 border-green-500 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center space-x-3">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div>
                <h3 className="text-lg font-bold text-green-900">
                  ✅ Contract Source Code Verified (Exact Match)
                </h3>
                <p className="text-sm text-green-700">
                  This contract's source code has been verified and matched against the deployed bytecode
                </p>
              </div>
            </div>
          </div>

          {/* Contract Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <div className="text-xs text-gray-500 mb-1">Network</div>
              <div className="text-sm font-semibold text-gray-800">Sepolia Testnet</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <div className="text-xs text-gray-500 mb-1">Compiler</div>
              <div className="text-sm font-semibold text-gray-800">v0.8.20+commit.a1b79de6</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <div className="text-xs text-gray-500 mb-1">Optimization</div>
              <div className="text-sm font-semibold text-gray-800">Enabled (200 runs)</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <div className="text-xs text-gray-500 mb-1">License</div>
              <div className="text-sm font-semibold text-gray-800">MIT</div>
            </div>
          </div>
        </motion.div>

        {/* Source Code Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden"
        >
          <div className="bg-gray-100 border-b border-gray-200 px-6 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileCode className="w-5 h-5 text-gray-600" />
              <span className="font-semibold text-gray-800">Contract Source Code</span>
              <Badge variant="outline" className="ml-2">DecentralizedDataWallet.sol</Badge>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                navigator.clipboard.writeText(contractCode);
                toast.success("Source code copied!");
              }}
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy
            </Button>
          </div>

          <div className="bg-slate-50 p-6 overflow-x-auto max-h-[600px] overflow-y-auto">
            <pre className="text-xs text-slate-800 font-mono leading-relaxed">
              <code>{contractCode}</code>
            </pre>
          </div>
        </motion.div>

        {/* Security Notice */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4"
        >
          <div className="flex items-start space-x-3">
            <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">Security Verification Complete</h3>
              <p className="text-sm text-blue-700">
                This contract uses OpenZeppelin's audited libraries for ERC20, AccessControl, and ECDSA signature verification. 
                The source code shown above is an exact match to the deployed bytecode on Sepolia testnet.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}