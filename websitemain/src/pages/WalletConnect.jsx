import { useEffect, useState } from "react";
import { MetaMaskSDK } from "@metamask/sdk";
import { motion } from "framer-motion";
import { Wallet, CheckCircle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

const MMSDK = new MetaMaskSDK({
  dappMetadata: {
    name: "DataLoom Wallet",
    url: window.location.href,
    iconUrl: "https://docs.metamask.io/img/metamask-logo.svg",
  },
  infuraAPIKey: import.meta.env.VITE_INFURA_API_KEY || "",
});

export default function WalletConnect() {
  const [isConnected, setIsConnected] = useState(false);
  const [provider, setProvider] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [balance, setBalance] = useState(undefined);

  useEffect(() => {
    setProvider(MMSDK.getProvider());
  }, []);

  const connect = async () => {
    const accounts = await MMSDK.connect();
    setAccount(accounts[0]);
    if (accounts.length > 0) {
      setIsConnected(true);
    }
  };

  const terminate = async () => {
    await MMSDK.terminate();
    setIsConnected(false);
    setBalance(undefined);
    setAccount(undefined);
  };

  const getBalance = async () => {
    if (!account || !provider) {
      return;
    }
    const result = await provider?.request({
      method: "eth_getBalance",
      params: [account, "latest"],
    });
    const decimal = BigInt(result);
    const balance = Number(decimal) / 10 ** 18;
    console.log(balance.toFixed(4));
    setBalance(balance);
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        <div className="text-center mb-12">
          <div className="flex justify-center space-x-4 mb-8">
            <a href="https://vite.dev" target="_blank" rel="noopener noreferrer">
              <img 
                src="https://vite.dev/logo.svg" 
                className="h-20 w-20 hover:opacity-80 transition-opacity" 
                alt="Vite logo" 
              />
            </a>
            <a href="https://react.dev" target="_blank" rel="noopener noreferrer">
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg" 
                className="h-20 w-20 hover:opacity-80 transition-opacity" 
                alt="React logo" 
              />
            </a>
            <a href="https://metamask.io" target="_blank" rel="noopener noreferrer">
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" 
                className="h-20 w-20 hover:opacity-80 transition-opacity" 
                alt="MetaMask logo" 
              />
            </a>
          </div>

          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-cyan-500 bg-clip-text text-transparent">
            MetaMask SDK React Quickstart
          </h1>
        </div>

        <div className="glass-card rounded-3xl p-8">
          {isConnected ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <p className="text-lg font-semibold">Connected to {account?.slice(0, 6)}...{account?.slice(-4)}</p>
              </div>
              
              {balance !== undefined && (
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl text-center">
                  <p className="text-sm text-gray-600 mb-1">Balance</p>
                  <p className="text-2xl font-bold text-purple-600">{balance?.toFixed(4)} Sepolia ETH</p>
                </div>
              )}

              <div className="grid grid-cols-1 gap-3">
                <Button onClick={getBalance} className="w-full gradient-purple-cyan text-white py-6 text-lg rounded-xl">
                  <Wallet className="w-5 h-5 mr-2" />
                  Get Balance
                </Button>
                <Button onClick={terminate} variant="outline" className="w-full py-6 text-lg rounded-xl">
                  Disconnect
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <Button onClick={connect} className="w-full gradient-purple-cyan text-white py-8 text-xl rounded-xl hover:shadow-lg">
                <Wallet className="w-6 h-6 mr-2" />
                Connect
              </Button>
            </div>
          )}
        </div>

        <div className="mt-8 text-center space-y-4">
          <p className="text-gray-600">
            <a
              href="https://docs.metamask.io/sdk/connect/javascript/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-600 hover:underline inline-flex items-center"
            >
              SDK Documentation
              <ExternalLink className="w-4 h-4 ml-1" />
            </a>
          </p>
          <footer>
            <a
              href="https://github.com/MetaMask/metamask-sdk-examples/tree/main/quickstarts/react"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-purple-600 inline-flex items-center"
            >
              Source code
              <ExternalLink className="w-4 h-4 ml-1" />
            </a>
          </footer>
        </div>
      </motion.div>
    </div>
  );
}