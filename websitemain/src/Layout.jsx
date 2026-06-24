import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Database, Upload, ShoppingBag, LogOut, User as UserIcon, BarChart3, Shield, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import MetaMaskConnect from "./components/shared/MetaMaskConnect";

export default function Layout({ children }) {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [tokenBalance, setTokenBalance] = useState(0);
  const [metaMaskAccount, setMetaMaskAccount] = useState(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
      setTokenBalance(userData.token_balance || 1000);
    } catch (error) {
      console.error("Error loading user:", error);
    }
  };

  const { data: pendingRequestsCount } = useQuery({
    queryKey: ['pendingRequestsCount', user?.email],
    queryFn: async () => {
      if (!user) return 0;
      const requests = await base44.entities.TransactionRequest.filter({
        seller_id: user.email,
        status: "pending"
      });
      return requests.length;
    },
    enabled: !!user,
    refetchInterval: 5000, // Refresh every 5 seconds
    initialData: 1, // Fake notification for demo
  });

  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    if (user) setShowNotification(true);
  }, [user]);

  const handleApprove = () => {
    setShowNotification(false);
    alert("Request Approved! ✅");
  };

  const handleReject = () => {
    setShowNotification(false);
    alert("Request Rejected! ❌");
  };

  const handleLogout = async () => {
    // Clear ALL transaction history and purchases for ALL users on logout
    try {
      // Delete ALL transaction requests
      const allRequests = await base44.entities.TransactionRequest.list();
      for (const req of allRequests) {
        await base44.entities.TransactionRequest.delete(req.id);
      }

      // Delete ALL purchases
      const allPurchases = await base44.entities.DataPurchase.list();
      for (const purchase of allPurchases) {
        await base44.entities.DataPurchase.delete(purchase.id);
      }

      // Delete only the current user's own uploaded profiles (not seeded data)
      if (user) {
        const myProfiles = await base44.entities.TravelDataProfile.filter({ created_by: user.email, email: user.email });
        for (const profile of myProfiles) {
          await base44.entities.TravelDataProfile.delete(profile.id);
        }
      }
    } catch (error) {
      console.error("Error clearing demo data:", error);
    }

    await base44.auth.logout();
  };

  const handleMetaMaskAccountChange = (account) => {
    setMetaMaskAccount(account);
  };

  return (
    <div className="min-h-screen gradient-bg">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg sticky top-0 z-50 border-b border-gray-200/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link to={createPageUrl("Home")} className="flex items-center space-x-2">
              <Database className="w-7 h-7 text-purple-600" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-cyan-500 bg-clip-text text-transparent">
                Datatrek
              </h1>
            </Link>

            <nav className="hidden md:flex items-center space-x-6">
              <Link 
                to={createPageUrl("ProducerDashboard")}
                className={`flex items-center space-x-2 font-medium transition-colors ${
                  location.pathname.includes('Producer') 
                    ? 'text-purple-600' 
                    : 'text-gray-700 hover:text-purple-600'
                }`}
              >
                <Upload className="w-4 h-4" />
                <span>Upload Data</span>
              </Link>
              <Link 
                to={createPageUrl("BuyerDashboard")}
                className={`flex items-center space-x-2 font-medium transition-colors ${
                  location.pathname.includes('Buyer') 
                    ? 'text-purple-600' 
                    : 'text-gray-700 hover:text-purple-600'
                }`}
              >
                <Database className="w-4 h-4" />
                <span>Buyer Portal</span>
              </Link>
              <Link 
                to={createPageUrl("AnalyticsDashboard")}
                className={`flex items-center space-x-2 font-medium transition-colors ${
                  location.pathname.includes('Analytics') 
                    ? 'text-purple-600' 
                    : 'text-gray-700 hover:text-purple-600'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>Analytics</span>
              </Link>
              <Link 
                to={createPageUrl("SmartContractAudit")}
                className={`flex items-center space-x-2 font-medium transition-colors ${
                  location.pathname.includes('Audit') 
                    ? 'text-purple-600' 
                    : 'text-gray-700 hover:text-purple-600'
                }`}
              >
                <Shield className="w-4 h-4" />
                <span>Audit</span>
              </Link>
            </nav>

            <div className="flex items-center space-x-3">
              {/* Notification Bell */}
              {user && pendingRequestsCount > 0 && (
                <Link to={createPageUrl("ProducerDashboard")}>
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full relative"
                  >
                    <Bell className="w-4 h-4" />
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500">
                      {pendingRequestsCount}
                    </Badge>
                  </Button>
                </Link>
              )}

              {/* MetaMask Connect */}
              <MetaMaskConnect onAccountChange={handleMetaMaskAccountChange} />

              {user && (
                <div className="hidden md:flex items-center space-x-3 px-4 py-2 bg-white/50 rounded-full border border-gray-200">
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-900">{user.full_name}</div>
                    <div className="text-xs text-purple-600 font-medium">
                      {tokenBalance} Tokens
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-cyan-500 flex items-center justify-center text-white font-bold text-sm">
                    {user.full_name?.charAt(0) || <UserIcon className="w-4 h-4" />}
                  </div>
                </div>
              )}
              
              <Button
                variant="outline"
                size="icon"
                onClick={handleLogout}
                className="rounded-full hidden md:flex"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden flex justify-center gap-2 mt-4 overflow-x-auto">
            <Link to={createPageUrl("ProducerDashboard")}>
              <Button 
                variant={location.pathname.includes('Producer') ? 'default' : 'outline'}
                size="sm"
                className="flex items-center space-x-1 whitespace-nowrap"
              >
                <Upload className="w-4 h-4" />
                <span>Upload</span>
              </Button>
            </Link>
            <Link to={createPageUrl("BuyerDashboard")}>
              <Button 
                variant={location.pathname.includes('Buyer') ? 'default' : 'outline'}
                size="sm"
                className="flex items-center space-x-1 whitespace-nowrap"
              >
                <Database className="w-4 h-4" />
                <span>Buyer</span>
              </Button>
            </Link>
            <Link to={createPageUrl("AnalyticsDashboard")}>
              <Button 
                variant={location.pathname.includes('Analytics') ? 'default' : 'outline'}
                size="sm"
                className="flex items-center space-x-1 whitespace-nowrap"
              >
                <BarChart3 className="w-4 h-4" />
                <span>Analytics</span>
              </Button>
            </Link>
            <Link to={createPageUrl("SmartContractAudit")}>
              <Button 
                variant={location.pathname.includes('Audit') ? 'default' : 'outline'}
                size="sm"
                className="flex items-center space-x-1 whitespace-nowrap"
              >
                <Shield className="w-4 h-4" />
                <span>Audit</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Fake Notification for Demo */}
      {user && showNotification && (
        <div className="fixed top-20 right-4 z-50 max-w-sm animate-in slide-in-from-top">
          <div className="bg-white rounded-2xl p-4 border-2 border-amber-300 shadow-xl">
            <div className="flex items-start space-x-3">
              <Bell className="w-5 h-5 text-amber-600 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="font-bold text-gray-900 mb-1">New Purchase Request</h4>
                <p className="text-sm text-gray-700 mb-2">
                  <strong>Cherry Wong</strong> wants to buy the Decentralised Personal Insights in your personal data profile
                </p>
                <p className="text-xs text-purple-600 font-medium mb-3">
                  Payment: 0.13 ETH (Or 130 UTK Tokens)
                </p>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    onClick={handleApprove}
                    className="bg-green-600 hover:bg-green-700 text-white flex-1"
                  >
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleReject}
                    className="border-red-300 text-red-600 hover:bg-red-50 flex-1"
                  >
                    Reject
                  </Button>
                </div>
              </div>
              <button
                onClick={() => setShowNotification(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="text-xl">×</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="min-h-screen">
        {children}
      </main>
    </div>
  );
}