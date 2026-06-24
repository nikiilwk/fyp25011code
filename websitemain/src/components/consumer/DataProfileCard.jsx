import React from "react";
import { motion } from "framer-motion";
import { Star, BarChart2, Calendar, Lock, CheckCircle, DollarSign, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default function DataProfileCard({ profile, onPurchase }) {
  const categoryColors = {
    Business: "bg-blue-100 text-blue-700 border-blue-200",
    Leisure: "bg-green-100 text-green-700 border-green-200",
    Adventure: "bg-orange-100 text-orange-700 border-orange-200",
    Family: "bg-purple-100 text-purple-700 border-purple-200",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="glass-card rounded-3xl p-6 glow-hover h-full flex flex-col"
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold mb-2 line-clamp-1">{profile.trip_name}</h3>
          <Badge className={`${categoryColors[profile.category]} border`}>
            {profile.category}
          </Badge>
        </div>
        <div className="flex items-center space-x-1 ml-2">
          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
          <span className="font-bold text-sm">{profile.quality_score || "9.0"} / 10</span>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between text-sm mb-4 pb-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <BarChart2 className="w-4 h-4 text-purple-600" />
          <span className="text-gray-700">{profile.completeness_score || 90}% Complete</span>
        </div>
        <div className="flex items-center space-x-1 text-gray-500">
          <Calendar className="w-3 h-3" />
          <span className="text-xs">
            {format(new Date(profile.created_date), "MMM yyyy")}
          </span>
        </div>
      </div>

      {/* Data Types (Locked) */}
      <div className="mb-4 flex-1">
        <h4 className="text-sm font-semibold mb-2 text-gray-700">
          Data Types Available (Locked):
        </h4>
        <ul className="space-y-2 text-xs">
          <li className="flex items-start space-x-2">
            <Lock className="w-3 h-3 text-gray-400 mt-0.5 flex-shrink-0" />
            <span>Flight booking history and preferences</span>
          </li>
          <li className="flex items-start space-x-2">
            <Lock className="w-3 h-3 text-gray-400 mt-0.5 flex-shrink-0" />
            <span>Hotel stays and accommodation patterns</span>
          </li>
          <li className="flex items-start space-x-2">
            <Lock className="w-3 h-3 text-gray-400 mt-0.5 flex-shrink-0" />
            <span>Travel spending and budget allocation</span>
          </li>
        </ul>
      </div>

      {/* AI Insights Preview */}
      <div className="mb-4">
        <h4 className="text-sm font-semibold mb-2 text-gray-700">
          AI Insights Preview:
        </h4>
        <ul className="space-y-2 text-xs">
          {(profile.ai_insights || []).slice(0, 2).map((insight, index) => (
            <li key={index} className="flex items-start space-x-2">
              <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
              <span>{insight}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="flex items-center space-x-1">
          <DollarSign className="w-4 h-4 text-purple-600" />
          <span className="font-bold text-lg">{profile.token_price || 100}</span>
          <span className="text-sm text-gray-500">Tokens</span>
        </div>
        <Button
          onClick={onPurchase}
          className="gradient-purple-cyan text-white rounded-xl px-6 hover:shadow-lg"
        >
          <Eye className="w-4 h-4 mr-2" />
          Purchase Access
        </Button>
      </div>
    </motion.div>
  );
}