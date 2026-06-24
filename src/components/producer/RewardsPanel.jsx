import React, { useState } from "react";
import { motion } from "framer-motion";
import { DollarSign, TrendingUp, Database, BarChart3, Wallet, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function RewardsPanel({ totalEarned, activeAssets, profiles }) {
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [recipientAddress, setRecipientAddress] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [txStatus, setTxStatus] = useState(null);

  const handleRedeem = async () => {
    if (typeof window.ethereum === 'undefined') {
      setTxStatus({ type: 'error', message: 'Please connect MetaMask first' });
      return;
    }

    if (!recipientAddress || !recipientAddress.startsWith('0x')) {
      setTxStatus({ type: 'error', message: 'Please enter a valid Ethereum address' });
      return;
    }

    setIsProcessing(true);
    setTxStatus(null);

    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length === 0) {
        setTxStatus({ type: 'error', message: 'Please connect your wallet first' });
        setIsProcessing(false);
        return;
      }

      // Convert tokens to Wei (for demo, 1 token = 0.001 ETH)
      const ethAmount = (totalEarned * 0.001).toFixed(18);
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
        message: `Transaction sent! Hash: ${txHash.slice(0, 10)}...`,
        txHash 
      });

      // Reset form after 3 seconds
      setTimeout(() => {
        setShowRedeemModal(false);
        setRecipientAddress("");
        setTxStatus(null);
      }, 3000);

    } catch (error) {
      console.error('Transaction error:', error);
      setTxStatus({ 
        type: 'error', 
        message: error.message || 'Transaction failed' 
      });
    }

    setIsProcessing(false);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card rounded-3xl p-8 glow-hover"
      >
        <h2 className="text-2xl font-bold mb-6 flex items-center space-x-2">
          <DollarSign className="w-6 h-6 text-purple-600" />
          <span>Token Rewards</span>
        </h2>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gradient-to-br from-purple-50 to-cyan-50 rounded-2xl p-4">
            <div className="text-sm text-gray-600 mb-1">Total Earned</div>
            <div className="text-3xl font-bold text-purple-600">
              {totalEarned}
              <span className="text-sm font-normal text-gray-600 ml-1">Tokens</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-cyan-50 to-purple-50 rounded-2xl p-4">
            <div className="text-sm text-gray-600 mb-1">Active Assets</div>
            <div className="text-3xl font-bold text-cyan-600">
              {activeAssets}
              <span className="text-sm font-normal text-gray-600 ml-1">Datasets</span>
            </div>
          </div>

          <div className="bg-white/50 rounded-2xl p-4">
            <div className="text-sm text-gray-600 mb-1">ETH Value</div>
            <div className="text-2xl font-bold text-gray-900">
              {(totalEarned * 0.001).toFixed(4)} <span className="text-sm font-normal">ETH</span>
            </div>
          </div>

          <div className="bg-white/50 rounded-2xl p-4">
            <div className="text-sm text-gray-600 mb-1">Avg. Value</div>
            <div className="text-2xl font-bold text-gray-900">
              {activeAssets > 0 ? Math.floor(totalEarned / activeAssets) : 0}
              <span className="text-sm font-normal"> Tokens</span>
            </div>
          </div>
        </div>

        {/* Reward Distribution */}
        <div className="bg-white/50 rounded-2xl p-4 mb-6">
          <h3 className="text-sm font-semibold mb-3">Reward Distribution</h3>
          <div className="space-y-3">
            {profiles.slice(0, 3).map((profile, index) => {
              const percentage = totalEarned > 0 ? (profile.tokens_earned / totalEarned * 100) : 0;
              return (
                <div key={profile.id}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="truncate mr-2">{profile.trip_name}</span>
                    <span className="text-gray-600">{percentage.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        index === 0 ? 'bg-purple-500' : 
                        index === 1 ? 'bg-cyan-500' : 
                        'bg-indigo-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" className="rounded-xl">
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </Button>
          <Button 
            onClick={() => window.open('https://dannywinson1.github.io/fite4801ethredeem/', '_blank')}
            disabled={totalEarned === 0}
            className="gradient-purple-cyan text-white rounded-xl"
          >
            <Wallet className="w-4 h-4 mr-2" />
            Redeem to Sepolia
          </Button>
        </div>
      </motion.div>

      {/* Redeem Modal */}
      <Dialog open={showRedeemModal} onOpenChange={setShowRedeemModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Wallet className="w-5 h-5 text-purple-600" />
              <span>Redeem Tokens to ETH</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Summary */}
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tokens Available:</span>
                  <span className="font-bold text-purple-600">{totalEarned} Tokens</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">ETH Value:</span>
                  <span className="font-bold">{(totalEarned * 0.001).toFixed(4)} ETH</span>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  Rate: 1 Token = 0.001 ETH (Sepolia Testnet)
                </div>
              </div>
            </div>

            {/* Recipient Address Input */}
            <div>
              <Label htmlFor="recipient">Recipient Address</Label>
              <Input
                id="recipient"
                value={recipientAddress}
                onChange={(e) => setRecipientAddress(e.target.value)}
                placeholder="0x..."
                className="mt-1 font-mono"
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter your Ethereum wallet address to receive ETH
              </p>
            </div>

            {/* Status Messages */}
            {txStatus && (
              <div className={`p-3 rounded-xl border flex items-start space-x-2 ${
                txStatus.type === 'success' 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                {txStatus.type === 'success' ? (
                  <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <p className={`text-sm ${
                    txStatus.type === 'success' ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {txStatus.message}
                  </p>
                  {txStatus.txHash && (
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

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowRedeemModal(false)}
                className="flex-1"
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button
                onClick={handleRedeem}
                disabled={isProcessing || !recipientAddress}
                className="flex-1 gradient-purple-cyan text-white"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <Wallet className="w-4 h-4 mr-2" />
                    Redeem Now
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}