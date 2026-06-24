import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { X, DollarSign, AlertCircle, Wallet, Loader2, FileCode, Clock, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function BuyerPurchaseModal({ person, onClose, onPurchase }) {
  const [useCase, setUseCase] = useState("");
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showContractCode, setShowContractCode] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [processingStatus, setProcessingStatus] = useState(""); // "processing", "waiting", "approved", "rejected"

  const escrowContractCode = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DatatrekEscrow {
    
    // Event to notify the Seller on the blockchain
    event AccessRequested(bytes32 indexed dataId, address buyer, uint256 amount);
    event TradeFinalized(bytes32 indexed dataId, address seller, uint256 payout);

    // 1. BUYER FUNCTION: Request Access & Deposit ETH
    function requestDataAccess(address _seller, bytes32 _dataId) public payable {
        require(msg.value >= 0.05 ether, "Insufficient ETH for data price");
        
        // Funds are locked in this contract (Escrow) until approved
        transactions[_dataId] = Transaction({
            buyer: msg.sender,
            seller: _seller,
            amount: msg.value,
            status: "PENDING_APPROVAL"
        });

        emit AccessRequested(_dataId, msg.sender, msg.value);
    }

    // 2. SELLER FUNCTION: Approve the trade
    function approveTrade(bytes32 _dataId) public {
        Transaction storage t = transactions[_dataId];
        require(msg.sender == t.seller, "Only data owner can approve");

        // Release 95% funds to Seller, 5% Platform Fee
        uint256 sellerShare = (t.amount * 95) / 100;
        payable(t.seller).transfer(sellerShare);
        
        // Grant Data Access Key to Buyer
        accessRegistry.grantPermission(t.buyer, _dataId);
        
        t.status = "COMPLETED";
        emit TradeFinalized(_dataId, t.seller, sellerShare);
    }
}`;

  // Hardcoded price: 0.13 ETH / 130 UTK Tokens
  const totalETH = 0.13;
  const totalTokens = 130;

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const user = await base44.auth.me();
    setCurrentUser(user);
  };

  const handlePurchase = async () => {
    if (!useCase.trim()) {
      setError("Please describe your use case");
      return;
    }

    setIsProcessing(true);
    setError("");

    try {
      // Generate mock transaction hash
      const mockTxHash = '0x' + Array.from({length: 64}, () => 
        Math.floor(Math.random() * 16).toString(16)
      ).join('');

      // Step 1: Broadcasting to Sepolia blockchain (4 seconds)
      setProcessingStatus("processing");
      await new Promise(resolve => setTimeout(resolve, 4000));

      // Step 2: Waiting for Seller Approval (4 seconds)
      setProcessingStatus("waiting");
      await new Promise(resolve => setTimeout(resolve, 4000));

      // Step 3: Create approved transaction requests & purchase records
      for (const profile of person.profiles) {
        await base44.entities.TransactionRequest.create({
          buyer_id: currentUser.email,
          seller_id: profile.created_by,
          profile_id: profile.id,
          amount: (profile.token_price * 0.001),
          token_amount: profile.token_price,
          status: "approved",
          tx_hash: mockTxHash,
          buyer_name: currentUser.full_name,
          profile_name: profile.trip_name
        });

        await base44.entities.DataPurchase.create({
          buyer_email: currentUser.email,
          profile_id: profile.id,
          tokens_paid: profile.token_price,
          status: "completed",
          use_case: useCase
        });
      }

      // Step 4: Finalizing (2 seconds)
      setProcessingStatus("finalizing");
      await new Promise(resolve => setTimeout(resolve, 2000));

      setProcessingStatus("approved");
      toast.success("✅ Access Granted! Data unlocked.");
      setIsProcessing(false);

      setTimeout(() => {
        if (onPurchase) onPurchase();
        onClose();
      }, 2000);

    } catch (error) {
      console.error('Transaction request error:', error);
      setError("Failed to create transaction request. Please try again.");
      setIsProcessing(false);
      setProcessingStatus("");
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="glass-card rounded-3xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold">Confirm Data Access Transaction</h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Traveler Info */}
          <div className="space-y-4 mb-6">
            <div className="flex items-center space-x-3 bg-white/50 rounded-xl p-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-600 to-cyan-500 flex items-center justify-center text-white font-bold text-lg">
                {person.full_name?.charAt(0) || "?"}
              </div>
              <div>
                <h4 className="font-semibold">{person.full_name}</h4>
                <p className="text-sm text-gray-500">{person.email}</p>
                <Badge className="mt-1">
                  {person.profiles.length} Travel Profile{person.profiles.length > 1 ? 's' : ''}
                </Badge>
              </div>
            </div>

            <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-xl p-4">
              <div className="text-sm text-gray-500 mb-2 flex items-center">
                <span className="mr-2">🔒</span>
                <strong>Credit Score:</strong> <span className="ml-1">Purchase Access to View</span>
              </div>
              <div className="text-sm text-gray-700">
                <strong>Total Trips:</strong> {person.total_trips} (Public Info)
              </div>
            </div>
          </div>

          {/* Smart Contract Link */}
          <div className="mb-6 bg-slate-50 border border-slate-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">Smart Contract Address</p>
                <code className="text-sm font-mono text-slate-700">0x71C7656EC7ab88b098defB751B7401B5f6d8976F</code>
              </div>
            </div>
            <button
              onClick={() => window.open('/MockExplorer', '_blank')}
              className="mt-3 flex items-center justify-center w-full py-2 px-4 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <FileCode className="w-4 h-4 mr-2 text-purple-600" />
              <span className="text-sm font-medium">View on SepoliaScan</span>
              <ExternalLink className="w-3 h-3 ml-2 text-gray-400" />
            </button>
          </div>

          {/* Use Case Input */}
          <div className="mb-6">
            <Label htmlFor="useCase" className="mb-2 block">
              Business Use Case *
            </Label>
            <Textarea
              id="useCase"
              value={useCase}
              onChange={(e) => {
                setUseCase(e.target.value);
                setError("");
              }}
              placeholder="Explain how you'll use this travel data for enterprise analysis, credit scoring, or business insights..."
              className="h-24"
            />
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-4 p-3 rounded-xl border flex items-start space-x-2 bg-red-50 border-red-200">
              <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Price Display */}
          <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-xl">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Cost:</span>
                <span className="font-bold text-purple-600">{totalETH.toFixed(2)} ETH (or {totalTokens} UTK Tokens)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Platform Fee:</span>
                <span className="font-medium">5%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Seller Receives:</span>
                <span className="font-medium">{(totalETH * 0.95).toFixed(4)} ETH</span>
              </div>
            </div>
          </div>

          {/* Status Messages */}
          {processingStatus === "processing" && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-xl text-center">
              <Loader2 className="animate-spin h-6 w-6 text-blue-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-blue-700">Processing on Sepolia Blockchain...</p>
            </div>
          )}

          {processingStatus === "waiting" && (
            <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-xl text-center">
              <Clock className="animate-pulse h-6 w-6 text-amber-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-amber-700">Waiting for Seller Approval...</p>
              <p className="text-xs text-amber-600 mt-1">Funds held in escrow contract</p>
            </div>
          )}

          {processingStatus === "finalizing" && (
            <div className="mb-4 p-4 bg-purple-50 border border-purple-200 rounded-xl text-center">
              <Loader2 className="animate-spin h-6 w-6 text-purple-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-purple-700">Finalizing on-chain & granting access...</p>
              <p className="text-xs text-purple-600 mt-1">Releasing funds to seller</p>
            </div>
          )}

          {processingStatus === "approved" && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl text-center">
              <div className="text-4xl mb-2">✅</div>
              <p className="text-sm font-semibold text-green-700">Access Granted!</p>
              <p className="text-xs text-green-600 mt-1">Data unlocked successfully</p>
            </div>
          )}

          {processingStatus === "rejected" && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-center">
              <div className="text-4xl mb-2">⛔</div>
              <p className="text-sm font-semibold text-red-700">Request Denied by Data Owner</p>
              <p className="text-xs text-red-600 mt-1">Funds returned to your wallet</p>
            </div>
          )}

          {/* Action Button */}
          {!processingStatus && (
            <>
              <Button
                onClick={handlePurchase}
                disabled={isProcessing}
                className="w-full gradient-purple-cyan text-white py-6 rounded-xl font-semibold hover:shadow-lg"
              >
                <Wallet className="w-5 h-5 mr-2" />
                Sign & Commit Transaction
              </Button>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mt-4">
                <p className="text-xs text-amber-800">
                  <strong>Escrow Protection:</strong> Your funds will be locked in the smart contract until the seller approves. 
                  If rejected, funds are automatically returned.
                </p>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}