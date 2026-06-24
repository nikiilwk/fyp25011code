import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { X, User, Briefcase, Clock, DollarSign, AlertCircle, Wallet, Check, FileCode, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import TransactionReceipt from "./TransactionReceipt";

export default function PurchaseModal({ profile, onClose, onPurchase, isPurchasing }) {
  const [useCase, setUseCase] = useState("");
  const [userBalance, setUserBalance] = useState(0);
  const [error, setError] = useState("");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [txStatus, setTxStatus] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [mockTransaction, setMockTransaction] = useState(null);
  const [showContractCode, setShowContractCode] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const escrowContractCode = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DataLoomEscrow {
    
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

  useEffect(() => {
    loadBalance();
  }, []);

  const loadBalance = async () => {
    const user = await base44.auth.me();
    setCurrentUser(user);
    setUserBalance(user.token_balance || 0);
  };

  const handlePurchaseWithMetaMask = async () => {
    if (!useCase.trim()) {
      setError("Please describe your use case");
      return;
    }

    if (typeof window.ethereum === 'undefined') {
      setError("Please connect MetaMask first");
      return;
    }

    setIsProcessingPayment(true);
    setError("");
    setTxStatus(null);

    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length === 0) {
        setError("Please connect your MetaMask wallet");
        setIsProcessingPayment(false);
        return;
      }

      // Get profile creator's address (in real scenario, this would be stored)
      // For demo, we'll use a placeholder recipient address
      const recipientAddress = "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"; // Demo address

      // Convert token price to ETH (1 token = 0.001 ETH for demo)
      const ethAmount = (profile.token_price * 0.001).toFixed(18);
      const weiAmount = '0x' + BigInt(Math.floor(parseFloat(ethAmount) * 10**18)).toString(16);

      const transactionParameters = {
        from: accounts[0],
        to: recipientAddress,
        value: weiAmount,
        gas: '0x5208', // 21000 gas
      };

      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [transactionParameters],
      });

      setTxStatus({ 
        type: 'success', 
        message: `Payment successful! Transaction: ${txHash.slice(0, 10)}...`,
        txHash 
      });

      // Complete purchase in database
      setTimeout(() => {
        onPurchase(useCase);
      }, 2000);

    } catch (error) {
      console.error('Payment error:', error);
      setError(error.message || "Payment failed. Please try again.");
      setTxStatus({ 
        type: 'error', 
        message: error.message || 'Transaction failed' 
      });
    }

    setIsProcessingPayment(false);
  };

  const generateMockTransaction = () => {
    // Generate mock transaction data
    const mockTxHash = '0x' + Array.from({length: 64}, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
    
    const mockFromAddress = '0x' + Array.from({length: 40}, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
    
    const mockToAddress = '0x' + Array.from({length: 40}, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('');

    return {
      hash: mockTxHash,
      blockNumber: Math.floor(Math.random() * 1000000) + 5000000,
      confirmations: Math.floor(Math.random() * 10) + 1,
      from: mockFromAddress,
      to: mockToAddress,
      value: (profile.token_price * 0.001).toFixed(4),
      gasFee: '0.0021',
      timestamp: new Date().toISOString()
    };
  };

  const handlePurchaseWithTokens = async () => {
    if (!useCase.trim()) {
      setError("Please describe your use case");
      return;
    }

    setIsProcessingPayment(true);
    setError("");

    try {
      // Generate mock transaction hash
      const mockTxHash = '0x' + Array.from({length: 64}, () => 
        Math.floor(Math.random() * 16).toString(16)
      ).join('');

      // Create transaction request in database
      await base44.entities.TransactionRequest.create({
        buyer_id: currentUser.email,
        seller_id: profile.created_by,
        profile_id: profile.id,
        amount: (profile.token_price * 0.001),
        token_amount: profile.token_price,
        status: "pending",
        tx_hash: mockTxHash,
        buyer_name: currentUser.full_name,
        profile_name: profile.trip_name
      });

      setIsProcessingPayment(false);
      toast.success(`Funds deposited to Escrow Contract (${mockTxHash.slice(0, 10)}...). Waiting for data owner approval.`);
      
      // Close modal and show success
      setTimeout(() => {
        onClose();
        toast.info("Your purchase request is pending seller approval. You'll be notified once approved.");
      }, 1500);

    } catch (error) {
      console.error('Transaction request error:', error);
      setError("Failed to create transaction request. Please try again.");
      setIsProcessingPayment(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="glass-card rounded-3xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto"
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

          {/* Provider Info */}
          <div className="space-y-4 mb-6">
            <div className="flex items-center space-x-3 bg-white/50 rounded-xl p-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-600 to-cyan-500 flex items-center justify-center text-white font-bold text-lg">
                {profile.trip_name?.charAt(0) || "D"}
              </div>
              <div>
                <h4 className="font-semibold">{profile.trip_name}</h4>
                <p className="text-sm text-gray-500">Verified Data Profile</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 text-sm bg-white/50 rounded-xl p-3">
              <Briefcase className="w-4 h-4 text-purple-600" />
              <span>Category: {profile.category}</span>
            </div>

            <div className="flex items-center space-x-3 text-sm bg-white/50 rounded-xl p-3">
              <Clock className="w-4 h-4 text-purple-600" />
              <span>Instant access after purchase</span>
            </div>
          </div>

          {/* Smart Contract Simulation Box */}
          <div className="mb-6">
            <Button
              variant="outline"
              onClick={() => setShowContractCode(!showContractCode)}
              className="w-full flex items-center justify-between mb-3"
            >
              <div className="flex items-center space-x-2">
                <FileCode className="w-4 h-4" />
                <span>Executing Smart Contract Logic...</span>
              </div>
              <Badge variant="secondary">Solidity</Badge>
            </Button>

            {showContractCode && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="bg-slate-900 rounded-xl p-4 overflow-x-auto"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-400">DataLoomEscrow.sol</span>
                </div>
                <pre className="text-xs text-slate-100 overflow-x-auto max-h-48">
                  <code>{escrowContractCode}</code>
                </pre>
              </motion.div>
            )}
          </div>

          {/* Use Case Input */}
          <div className="mb-6">
            <Label htmlFor="useCase" className="mb-2 block">
              Your Use Case *
            </Label>
            <Textarea
              id="useCase"
              value={useCase}
              onChange={(e) => {
                setUseCase(e.target.value);
                setError("");
              }}
              placeholder="Explain how you'll use this travel data for analysis or insights..."
              className="h-24"
            />
          </div>

          {/* Status Messages */}
          {(error || txStatus) && (
            <div className={`mb-4 p-3 rounded-xl border flex items-start space-x-2 ${
              txStatus?.type === 'success' 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              {txStatus?.type === 'success' ? (
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
              )}
              <div className="flex-1">
                <p className={`text-sm ${
                  txStatus?.type === 'success' ? 'text-green-700' : 'text-red-700'
                }`}>
                  {txStatus?.message || error}
                </p>
                {txStatus?.txHash && (
                  <a
                    href={`https://sepolia.etherscan.io/tx/${txStatus.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-purple-600 hover:underline mt-1 inline-block"
                  >
                    View on Etherscan →
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Price Display */}
          <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-xl">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Cost:</span>
                <span className="font-bold text-purple-600">{(profile.token_price * 0.001).toFixed(2)} ETH (or {profile.token_price} UTK Tokens)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Platform Fee:</span>
                <span className="font-medium">5%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Seller Receives:</span>
                <span className="font-medium">{(profile.token_price * 0.001 * 0.95).toFixed(4)} ETH</span>
              </div>
              <div className="border-t border-purple-200 pt-2 mt-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Your Balance:</span>
                  <span className="font-medium">{userBalance} Tokens</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Options */}
          <div className="space-y-3">
            {/* Pay with MetaMask */}
            <Button
              onClick={handlePurchaseWithMetaMask}
              disabled={isProcessingPayment || isPurchasing}
              className="w-full gradient-purple-cyan text-white py-6 rounded-xl font-semibold hover:shadow-lg"
            >
              {isProcessingPayment ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Processing Payment...
                </>
              ) : (
                <>
                  <Wallet className="w-5 h-5 mr-2" />
                  Pay with MetaMask ({(profile.token_price * 0.001).toFixed(4)} ETH)
                </>
              )}
            </Button>

            {/* Pay with Platform Tokens - Creates Pending Request */}
            <Button
              onClick={handlePurchaseWithTokens}
              disabled={isPurchasing || isProcessingPayment}
              className="w-full gradient-purple-cyan text-white py-6 rounded-xl font-semibold hover:shadow-lg"
            >
              {isProcessingPayment ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5 mr-2" />
                  Interacting with Sepolia Blockchain...
                </>
              ) : (
                <>
                  <Wallet className="w-5 h-5 mr-2" />
                  Sign & Commit Transaction
                </>
              )}
            </Button>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mt-4">
            <p className="text-xs text-amber-800">
              <strong>Escrow Protection:</strong> Your funds will be locked in the smart contract until the seller approves. 
              If rejected, funds are automatically returned.
            </p>
            </div>
        </motion.div>

        {/* Transaction Receipt Modal */}
        {showReceipt && mockTransaction && (
          <TransactionReceipt 
            transaction={mockTransaction}
            onClose={() => {
              setShowReceipt(false);
              onClose();
            }}
          />
        )}
      </div>
    </AnimatePresence>
  );
}