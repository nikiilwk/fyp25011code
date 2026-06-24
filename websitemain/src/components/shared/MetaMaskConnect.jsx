import React, { useEffect, useState } from "react";
import { Wallet, Check, X, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function MetaMaskConnect({ onAccountChange }) {
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Detect if user is on mobile
    const checkMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    setIsMobile(checkMobile);
    
    checkConnection();
    
    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', () => window.location.reload());
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, []);

  const handleAccountsChanged = (accounts) => {
    if (accounts.length === 0) {
      disconnect();
    } else {
      setAccount(accounts[0]);
      getBalance(accounts[0]);
      if (onAccountChange) {
        onAccountChange(accounts[0]);
      }
    }
  };

  const checkConnection = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setIsConnected(true);
          await getBalance(accounts[0]);
          if (onAccountChange) {
            onAccountChange(accounts[0]);
          }
        }
      } catch (err) {
        console.error("Error checking connection:", err);
      }
    }
  };

  const connectMobile = () => {
    // Use MetaMask deep link for mobile
    const currentUrl = window.location.href;
    const dappUrl = currentUrl.replace(/^https?:\/\//, '');
    const metamaskAppDeepLink = `https://metamask.app.link/dapp/${dappUrl}`;
    
    // Open MetaMask app
    window.location.href = metamaskAppDeepLink;
  };

  const connect = async () => {
    setError(null);
    
    // If mobile and no ethereum provider, use deep link
    if (isMobile && typeof window.ethereum === 'undefined') {
      connectMobile();
      return;
    }

    if (typeof window.ethereum === 'undefined') {
      setError("MetaMask is not installed. Please install MetaMask to continue.");
      setShowModal(true);
      return;
    }

    try {
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        setIsConnected(true);
        await getBalance(accounts[0]);
        setShowModal(true);
        if (onAccountChange) {
          onAccountChange(accounts[0]);
        }
      }
    } catch (err) {
      console.error("Error connecting to MetaMask:", err);
      setError(err.message || "Failed to connect to MetaMask");
      setShowModal(true);
    }
  };

  const disconnect = () => {
    setAccount(null);
    setBalance(null);
    setIsConnected(false);
    if (onAccountChange) {
      onAccountChange(null);
    }
  };

  const getBalance = async (address) => {
    try {
      const result = await window.ethereum.request({
        method: "eth_getBalance",
        params: [address, "latest"],
      });
      const decimal = BigInt(result);
      const balanceInEth = Number(decimal) / 10 ** 18;
      setBalance(balanceInEth);
    } catch (err) {
      console.error("Error getting balance:", err);
    }
  };

  const formatAddress = (addr) => {
    if (!addr) return "";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <>
      {isConnected ? (
        <Button
          onClick={() => setShowModal(true)}
          variant="outline"
          className="flex items-center space-x-2 rounded-full border-2 border-purple-600 text-purple-600 hover:bg-purple-50"
        >
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <Wallet className="w-4 h-4" />
          <span className="font-mono text-sm hidden md:inline">{formatAddress(account)}</span>
        </Button>
      ) : (
        <Button
          onClick={connect}
          className="gradient-purple-cyan text-white rounded-full flex items-center space-x-2"
        >
          {isMobile ? (
            <>
              <Smartphone className="w-4 h-4" />
              <span className="hidden sm:inline">Connect Wallet</span>
            </>
          ) : (
            <>
              <Wallet className="w-4 h-4" />
              <span className="hidden sm:inline">Connect Wallet</span>
            </>
          )}
        </Button>
      )}

      {/* Connection Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Wallet className="w-5 h-5 text-purple-600" />
              <span>MetaMask Wallet</span>
            </DialogTitle>
          </DialogHeader>

          {error ? (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-start space-x-3">
                <X className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-red-900 mb-1">Connection Error</h4>
                  <p className="text-sm text-red-700 mb-3">{error}</p>
                  {error.includes("not installed") && (
                    <div className="space-y-2">
                      <a
                        href="https://metamask.io/download/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-purple-600 hover:underline inline-block"
                      >
                        Download MetaMask for Desktop →
                      </a>
                      {isMobile && (
                        <div>
                          <a
                            href="https://metamask.app.link/dapp/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-purple-600 hover:underline inline-block"
                          >
                            Open in MetaMask Mobile App →
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                <div className="flex items-start space-x-3">
                  <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-green-900 mb-1">Connected Successfully</h4>
                    <p className="text-sm text-green-700 mb-3">Your wallet is now connected to Datatrek</p>
                    
                    <div className="space-y-2 bg-white/50 rounded-lg p-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Account:</span>
                        <span className="font-mono font-medium">{formatAddress(account)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Balance:</span>
                        <span className="font-semibold">
                          {balance !== null ? `${balance.toFixed(4)} ETH` : 'Loading...'}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Network:</span>
                        <span className="font-medium">Sepolia Testnet</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {isMobile && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs text-blue-700 flex items-center">
                    <Smartphone className="w-3 h-3 mr-2" />
                    Mobile detected - Make sure MetaMask app is installed
                  </p>
                </div>
              )}

              <Button
                onClick={disconnect}
                variant="outline"
                className="w-full"
              >
                Disconnect Wallet
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}