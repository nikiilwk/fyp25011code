import React from "react";
import { motion } from "framer-motion";
import { User, Mail, TrendingUp, Plane, DollarSign, ChevronRight, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const getHealthIndex = (name) => {
  // Deterministic health index based on name
  const map = { "Sarah Lam": 87, "James Wong": 92, "Emily Chan": 78 };
  if (map[name]) return map[name];
  let hash = 0;
  for (let i = 0; i < (name || "").length; i++) hash = (hash * 31 + name.charCodeAt(i)) % 40;
  return 60 + hash;
};

const getHealthColor = (score) => {
  if (score >= 85) return "text-green-600 bg-green-50";
  if (score >= 70) return "text-blue-600 bg-blue-50";
  return "text-yellow-600 bg-yellow-50";
};

export default function PersonCard({ person, onClick, onPurchase, hasPurchased }) {
  const isChowKaHo = person.full_name === "Chow Ka Ho";
  const displayCreditScore = isChowKaHo ? 355 : person.avg_credit_score;
  const displayHealthIndex = isChowKaHo ? 95 : getHealthIndex(person.full_name);
  const displayTrips = isChowKaHo ? 5 : person.total_trips;
  const displayAvgSpend = isChowKaHo ? 1500 : person.avg_spend;
  const getCreditColor = (score) => {
    if (score >= 750) return "text-green-600 bg-green-50";
    if (score >= 650) return "text-blue-600 bg-blue-50";
    if (score >= 600) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  const getCreditRating = (score) => {
    if (score >= 750) return "Excellent";
    if (score >= 650) return "Good";
    if (score >= 600) return "Fair";
    return "Poor";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="glass-card rounded-2xl p-6 cursor-pointer hover:shadow-xl transition-all"
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-600 to-cyan-500 flex items-center justify-center text-white font-bold text-lg">
            {person.full_name?.charAt(0) || "?"}
          </div>
          <div>
            <h3 className="font-bold text-lg">{person.full_name}</h3>
            <div className="flex items-center text-xs text-gray-500">
              <Mail className="w-3 h-3 mr-1" />
              {person.email}
            </div>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-400" />
      </div>

      {/* Credit Score */}
      {hasPurchased ? (
        <div className={`rounded-xl p-4 mb-3 ${getCreditColor(person.avg_credit_score)}`}>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-medium opacity-70">Credit Score</div>
              <div className="text-2xl font-bold">{displayCreditScore}</div>
            </div>
            <Badge className="bg-white/50">
              {getCreditRating(displayCreditScore)}
            </Badge>
          </div>
        </div>
      ) : (
        <div className="rounded-xl p-4 mb-3 bg-gray-100 border-2 border-dashed border-gray-300">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-medium text-gray-500">Credit Score</div>
              <div className="text-2xl font-bold text-gray-400 flex items-center">
                🔒 <span className="ml-2 text-sm">Locked</span>
              </div>
            </div>
            <Badge className="bg-gray-200 text-gray-600">Purchase to View</Badge>
          </div>
        </div>
      )}

      {/* Health Index */}
      {hasPurchased ? (
        <div className={`rounded-xl p-4 mb-4 ${getHealthColor(displayHealthIndex)}`}>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-medium opacity-70">Health Index</div>
              <div className="text-2xl font-bold">{displayHealthIndex}<span className="text-sm font-normal">/100</span></div>
            </div>
            <Badge className="bg-white/50">
              {displayHealthIndex >= 85 ? "Optimal" : displayHealthIndex >= 70 ? "Moderate" : "Fair"}
            </Badge>
          </div>
        </div>
      ) : (
        <div className="rounded-xl p-4 mb-4 bg-gray-100 border-2 border-dashed border-gray-300">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-medium text-gray-500">Health Index</div>
              <div className="text-2xl font-bold text-gray-400 flex items-center">
                🔒 <span className="ml-2 text-sm">Locked</span>
              </div>
            </div>
            <Badge className="bg-gray-200 text-gray-600">Purchase to View</Badge>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white/50 rounded-lg p-3">
          <div className="flex items-center space-x-2 text-purple-600 mb-1">
            <Plane className="w-4 h-4" />
            <span className="text-xs font-medium">Trips</span>
          </div>
          <div className="text-xl font-bold">{displayTrips}</div>
        </div>
        <div className="bg-white/50 rounded-lg p-3">
          <div className="flex items-center space-x-2 text-cyan-600 mb-1">
            <DollarSign className="w-4 h-4" />
            <span className="text-xs font-medium">Avg Spend</span>
          </div>
          <div className="text-xl font-bold">${(displayAvgSpend / 1000).toFixed(1)}K</div>
        </div>
      </div>

      {/* Action */}
      <div className="mt-4">
        {!hasPurchased ? (
          <Button 
            onClick={(e) => {
              e.stopPropagation();
              onPurchase(person);
            }}
            className="w-full gradient-purple-cyan text-white"
          >
            <Lock className="w-4 h-4 mr-2" />
            Purchase Access
          </Button>
        ) : (
          <Button className="w-full gradient-purple-cyan text-white">
            View Details
          </Button>
        )}
      </div>
    </motion.div>
  );
}