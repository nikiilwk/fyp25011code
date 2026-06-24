import React from "react";
import { motion } from "framer-motion";
import { BarChart3, TrendingUp, Plus, Upload } from "lucide-react";

export default function AnalyticsPanel({ completenessScore, profilesCount }) {
  const demandPercentage = Math.min(completenessScore, 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="glass-card rounded-3xl p-8 glow-hover"
    >
      <h2 className="text-2xl font-bold mb-6 flex items-center space-x-2">
        <BarChart3 className="w-6 h-6 text-purple-600" />
        <span>Data Quality & Market Value</span>
      </h2>

      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Completeness Score */}
        <div className="bg-gradient-to-br from-purple-50 to-white rounded-2xl p-6 flex flex-col items-center">
          <div className="relative w-24 h-24 mb-3">
            <svg className="transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="#e5e7eb"
                strokeWidth="8"
                fill="none"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="url(#gradient)"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 45}`}
                strokeDashoffset={`${2 * Math.PI * 45 * (1 - completenessScore / 100)}`}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6F00FF" />
                  <stop offset="100%" stopColor="#00E5FF" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-purple-600">{completenessScore}%</span>
            </div>
          </div>
          <p className="text-sm font-medium text-center">Completeness Score</p>
          <p className="text-xs text-gray-500 mt-1">Upload more data to improve</p>
        </div>

        {/* Market Demand */}
        <div className="bg-gradient-to-br from-cyan-50 to-white rounded-2xl p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium">Market Demand</span>
            <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">
              {demandPercentage > 70 ? 'High' : demandPercentage > 40 ? 'Medium' : 'Low'}
            </span>
          </div>
          <div className="h-3 bg-gray-200 rounded-full mb-3">
            <div 
              className="h-3 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full transition-all duration-1000"
              style={{ width: `${demandPercentage}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-600 mb-3">"Travel" data demand</p>
          <div className="flex items-center space-x-2 text-xs text-indigo-700">
            <TrendingUp className="w-3 h-3" />
            <span>+{Math.floor(demandPercentage / 10)}% change</span>
          </div>
        </div>
      </div>

      {/* Suggestions */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4">
        <h3 className="text-sm font-semibold mb-3 text-indigo-900">Suggested Actions</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start space-x-2">
            <Plus className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
            <span>Add more travel segments to improve completeness</span>
          </li>
          <li className="flex items-start space-x-2">
            <Upload className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
            <span>Upload diverse data types for higher rewards</span>
          </li>
        </ul>
      </div>
    </motion.div>
  );
}