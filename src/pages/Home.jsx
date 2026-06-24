import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { Database, Upload, ShoppingBag, ArrowRight, Bell, CheckCircle, XCircle, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export default function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
    } catch (error) {
      console.error("Error loading user:", error);
    }
  };

  const { data: pendingRequests } = useQuery({
    queryKey: ['homePendingRequests', user?.email],
    queryFn: async () => {
      if (!user) return [];
      return base44.entities.TransactionRequest.filter({
        seller_id: user.email,
        status: "pending"
      });
    },
    enabled: !!user,
    initialData: [],
  });

  const approveMutation = useMutation({
    mutationFn: async (request) => {
      await base44.entities.TransactionRequest.update(request.id, { status: "approved" });
      await base44.entities.DataPurchase.create({
        buyer_email: request.buyer_id,
        profile_id: request.profile_id,
        tokens_paid: request.token_amount,
        status: "completed",
        use_case: "Approved via home dashboard"
      });
      const currentUser = await base44.auth.me();
      await base44.auth.updateMe({
        token_balance: (currentUser.token_balance || 0) + request.token_amount
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homePendingRequests'] });
      loadUser();
      toast.success("Request approved! Tokens added to your balance.");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (request) => {
      await base44.entities.TransactionRequest.update(request.id, { status: "rejected" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homePendingRequests'] });
      toast.success("Request rejected. Buyer refunded.");
    },
  });

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto text-center"
      >
        {/* Logo & Title */}
        <div className="flex items-center justify-center space-x-3 mb-6">
          <Database className="w-12 h-12 text-purple-600" />
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 to-cyan-500 bg-clip-text text-transparent">
            Datatrek
          </h1>
        </div>

        <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-2xl mx-auto">
          Decentralized Data Wallet - Share travel data securely, earn tokens, and access verified insights
        </p>

        {/* Pending Approval Requests */}
        {user && pendingRequests.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="glass-card rounded-3xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Bell className="w-5 h-5 text-amber-600" />
                  <h3 className="text-lg font-bold">Pending Data Access Requests</h3>
                </div>
                <Badge className="bg-amber-100 text-amber-800">
                  {pendingRequests.length} New
                </Badge>
              </div>

              <div className="space-y-3">
                {pendingRequests.map((request) => (
                  <div
                    key={request.id}
                    className="bg-white rounded-xl p-4 border border-gray-200 flex items-center justify-between"
                  >
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">{request.buyer_name}</div>
                      <div className="text-sm text-gray-600">
                        wants to purchase: {request.profile_name}
                      </div>
                      <div className="text-sm text-purple-600 font-medium mt-1">
                        Payment: {request.amount} ETH ({request.token_amount} Tokens)
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={() => approveMutation.mutate(request)}
                        disabled={approveMutation.isPending}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => rejectMutation.mutate(request)}
                        disabled={rejectMutation.isPending}
                        className="border-red-300 text-red-600 hover:bg-red-50"
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Role Selection Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {/* Data Owner */}
          <motion.div
            whileHover={{ scale: 1.04 }}
            className="glass-card rounded-3xl p-8 cursor-pointer glow-hover"
            onClick={() => navigate(createPageUrl("ProducerDashboard"))}
          >
            <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-purple-600 to-purple-400 rounded-2xl flex items-center justify-center">
              <Upload className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-bold mb-2 text-center">I own travel data</h2>
            <p className="text-gray-600 mb-4 text-sm text-center">
              Upload your flight receipts, share your travel patterns, and earn money every time someone uses your data.
            </p>
            <Button className="w-full gradient-purple-cyan text-white rounded-xl">
              Start Earning
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>

          {/* Data Buyer */}
          <motion.div
            whileHover={{ scale: 1.04 }}
            className="glass-card rounded-3xl p-8 cursor-pointer glow-hover"
            onClick={() => navigate(createPageUrl("BuyerDashboard"))}
          >
            <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-cyan-500 to-cyan-400 rounded-2xl flex items-center justify-center">
              <ShoppingBag className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-bold mb-2 text-center">I want to buy data</h2>
            <p className="text-gray-600 mb-4 text-sm text-center">
              Browse verified travel profiles and purchase access to real behavioral insights for your business.
            </p>
            <Button className="w-full gradient-purple-cyan text-white rounded-xl">
              Browse Profiles
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>

          {/* Platform Provider */}
          <motion.div
            whileHover={{ scale: 1.04 }}
            className="glass-card rounded-3xl p-8 cursor-pointer glow-hover"
            onClick={() => navigate(createPageUrl("AnalyticsDashboard"))}
          >
            <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-indigo-600 to-indigo-400 rounded-2xl flex items-center justify-center">
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-bold mb-2 text-center">Platform Overview</h2>
            <p className="text-gray-600 mb-4 text-sm text-center">
              Monitor all platform activity, track transaction volumes, and oversee the data marketplace in real time.
            </p>
            <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl">
              View Dashboard
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="bg-white/50 rounded-2xl p-6">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <Database className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="font-semibold mb-2">Your Data, Your Control</h3>
            <p className="text-sm text-gray-600">You decide who sees your data. You can turn it off any time.</p>
          </div>

          <div className="bg-white/50 rounded-2xl p-6">
            <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center mb-4">
              <Upload className="w-5 h-5 text-cyan-600" />
            </div>
            <h3 className="font-semibold mb-2">Earn Every Time</h3>
            <p className="text-sm text-gray-600">Get paid automatically whenever a company accesses your travel profile.</p>
          </div>

          <div className="bg-white/50 rounded-2xl p-6">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
              <ShoppingBag className="w-5 h-5 text-indigo-600" />
            </div>
            <h3 className="font-semibold mb-2">Trusted & Verified</h3>
            <p className="text-sm text-gray-600">Every piece of data is checked for authenticity before it's made available.</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}