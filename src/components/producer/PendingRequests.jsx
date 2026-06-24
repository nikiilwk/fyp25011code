import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, CheckCircle, XCircle, User, Clock, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function PendingRequests({ userEmail }) {
  const queryClient = useQueryClient();

  const { data: pendingRequests, isLoading } = useQuery({
    queryKey: ['pendingRequests', userEmail],
    queryFn: async () => {
      const requests = await base44.entities.TransactionRequest.filter({
        seller_id: userEmail,
        status: "pending"
      });
      return requests;
    },
    initialData: [],
  });

  const approveMutation = useMutation({
    mutationFn: async (request) => {
      // Update transaction status
      await base44.entities.TransactionRequest.update(request.id, {
        status: "approved"
      });

      // Create the actual purchase record
      await base44.entities.DataPurchase.create({
        buyer_email: request.buyer_id,
        profile_id: request.profile_id,
        tokens_paid: request.token_amount,
        status: "completed",
        use_case: "Approved by seller"
      });

      // Update seller's token balance (95% of amount)
      const seller = await base44.auth.me();
      const sellerShare = Math.floor(request.token_amount * 0.95);
      await base44.auth.updateMe({
        token_balance: (seller.token_balance || 0) + sellerShare
      });

      return { request, sellerShare };
    },
    onSuccess: ({ request, sellerShare }) => {
      queryClient.invalidateQueries({ queryKey: ['pendingRequests'] });
      toast.success(`Transaction Finalized! ${(request.amount * 0.95).toFixed(4)} ETH added to your wallet. Access granted to buyer.`);
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (request) => {
      await base44.entities.TransactionRequest.update(request.id, {
        status: "rejected"
      });
      return request;
    },
    onSuccess: (request) => {
      queryClient.invalidateQueries({ queryKey: ['pendingRequests'] });
      toast.info(`Request from ${request.buyer_name} has been rejected. Funds returned to buyer.`);
    },
  });

  if (isLoading) {
    return (
      <div className="glass-card rounded-2xl p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="h-24 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (pendingRequests.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-2xl p-6 mb-6"
    >
      <div className="flex items-center space-x-3 mb-4">
        <AlertCircle className="w-6 h-6 text-amber-600" />
        <h3 className="text-xl font-bold">Pending Data Requests</h3>
        <Badge className="bg-amber-500 text-white">{pendingRequests.length}</Badge>
      </div>

      <div className="space-y-4">
        <AnimatePresence>
          {pendingRequests.map((request) => (
            <motion.div
              key={request.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="bg-white/60 rounded-xl p-4 border border-amber-200"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-cyan-500 flex items-center justify-center text-white font-bold">
                      {request.buyer_name?.charAt(0) || "?"}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{request.buyer_name}</h4>
                      <p className="text-sm text-gray-600">{request.buyer_id}</p>
                    </div>
                  </div>

                  <div className="ml-13 space-y-2">
                    <div className="flex items-center space-x-2 text-sm">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-700">
                        Wants to purchase: <strong>{request.profile_name}</strong>
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 text-sm">
                      <DollarSign className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-700">
                        Amount: <strong>{request.amount?.toFixed(4)} ETH</strong> ({request.token_amount} Tokens)
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 text-sm">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-700">
                        Escrow Contract: <span className="font-mono text-xs">{request.tx_hash?.slice(0, 20)}...</span>
                      </span>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-2 mt-2">
                      <p className="text-xs text-green-800">
                        <strong>You'll receive:</strong> {(request.amount * 0.95)?.toFixed(4)} ETH 
                        (95% after 5% platform fee)
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col space-y-2 ml-4">
                  <Button
                    onClick={() => approveMutation.mutate(request)}
                    disabled={approveMutation.isPending || rejectMutation.isPending}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    {approveMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Approving...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve Trade
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={() => rejectMutation.mutate(request)}
                    disabled={approveMutation.isPending || rejectMutation.isPending}
                    variant="outline"
                    className="border-red-300 text-red-600 hover:bg-red-50"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Deny
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}