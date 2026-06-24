import React from "react";
import { motion } from "framer-motion";
import { Calendar, MapPin, Tag, Lock } from "lucide-react";
import { format } from "date-fns";

export default function DataPreview({ latestProfile }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="glass-card rounded-3xl p-8 glow-hover"
    >
      <h2 className="text-2xl font-bold mb-6">Data Preview</h2>

      {latestProfile ? (
        <div className="bg-white/50 rounded-2xl p-6">
          <div className="space-y-3 mb-4">
            <div className="flex items-center space-x-3 text-sm">
              <Calendar className="w-4 h-4 text-purple-600" />
              <span>{format(new Date(latestProfile.created_date), "MMM d, yyyy")}</span>
            </div>
            <div className="flex items-center space-x-3 text-sm">
              <MapPin className="w-4 h-4 text-purple-600" />
              <span>{latestProfile.trip_name}</span>
            </div>
            <div className="flex items-center space-x-3 text-sm">
              <Tag className="w-4 h-4 text-purple-600" />
              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                {latestProfile.category}
              </span>
            </div>
          </div>

          <p className="text-sm text-gray-600 mb-4 line-clamp-3">
            {latestProfile.description || "No description provided"}
          </p>

          <button className="text-sm text-purple-600 font-medium flex items-center space-x-2 hover:underline">
            <span>View Hidden Details</span>
            <Lock className="w-3 h-3" />
          </button>
        </div>
      ) : (
        <div className="bg-white/50 rounded-2xl p-6 text-center">
          <p className="text-gray-500">No data uploaded yet</p>
          <p className="text-sm text-gray-400 mt-2">Upload your first travel profile to see preview</p>
        </div>
      )}
    </motion.div>
  );
}