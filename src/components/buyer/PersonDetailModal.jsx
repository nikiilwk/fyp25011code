import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, DollarSign, Plane, TrendingUp, Shield, Clock, CreditCard, Award, Calendar, Heart } from "lucide-react";

const getHealthIndex = (name) => {
  const map = { "Sarah Lam": 87, "James Wong": 92, "Emily Chan": 78 };
  if (map[name]) return map[name];
  let hash = 0;
  for (let i = 0; i < (name || "").length; i++) hash = (hash * 31 + name.charCodeAt(i)) % 40;
  return 60 + hash;
};
import { Badge } from "@/components/ui/badge";

export default function PersonDetailModal({ person, onClose }) {
  const profiles = person.profiles || [];
  
  // Hardcoded ML results for Chow Ka Ho
  const isChowKaHo = person.full_name === "Chow Ka Ho";

  // Calculate aggregate metrics
  const avgSpend = isChowKaHo ? 1500 : profiles.reduce((sum, p) => sum + (p.avg_spend_per_trip || 0), 0) / profiles.length;
  const tripFrequency = isChowKaHo ? 5 : person.total_trips;
  const avgLeadTime = isChowKaHo ? 14 : profiles.reduce((sum, p) => sum + (p.booking_lead_time_days || 0), 0) / profiles.length;
  const avgInsuranceRate = isChowKaHo ? 50 : profiles.reduce((sum, p) => sum + (p.insurance_purchase_rate || 0), 0) / profiles.length;
  const crossBorderFreq = isChowKaHo ? 3 : profiles.reduce((sum, p) => sum + (p.cross_border_frequency || 0), 0) / profiles.length;

  // Get most common values
  const premiumPreference = isChowKaHo ? "Budget" : (profiles[0]?.premium_vs_budget || "Mid-Range");
  const paymentTiming = isChowKaHo ? "On-Time" : (profiles[0]?.payment_timing || "On-Time");
  const loyaltyTier = isChowKaHo ? "Bronze" : (profiles[0]?.loyalty_tier || "Silver");
  const destinationConsistency = isChowKaHo ? "Medium" : (profiles[0]?.destination_consistency || "Medium");
  const businessLeisureRatio = isChowKaHo ? "50/50" : (profiles[0]?.business_vs_leisure_ratio || "50/50");
  const chowCreditScore = 355;
  const chowHealthIndex = 95;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="glass-card rounded-3xl p-8 max-w-4xl w-full my-8"
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-600 to-cyan-500 flex items-center justify-center text-white font-bold text-2xl">
                {person.full_name?.charAt(0) || "?"}
              </div>
              <div>
                <h2 className="text-3xl font-bold">{person.full_name}</h2>
                <p className="text-gray-600">{person.email}</p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="p-2 rounded-full hover:bg-gray-100 transition-colors group"
              aria-label="Close"
            >
              <X className="w-7 h-7 text-gray-400 group-hover:text-gray-700" />
            </button>
          </div>

          {/* Credit Score & Health Index Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-gradient-to-r from-purple-50 to-cyan-50 rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Alternative Credit Score</div>
                  <div className="text-5xl font-bold text-purple-600">{isChowKaHo ? chowCreditScore : person.avg_credit_score}</div>
                  <Badge className="mt-2 bg-white">
                    {(isChowKaHo ? chowCreditScore : person.avg_credit_score) >= 750 ? "Excellent" : (isChowKaHo ? chowCreditScore : person.avg_credit_score) >= 650 ? "Good" : (isChowKaHo ? chowCreditScore : person.avg_credit_score) >= 600 ? "Fair" : "Poor"}
                  </Badge>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600 mb-1">Recommended Action</div>
                  <Badge className={`text-lg px-4 py-2 ${
                    (isChowKaHo ? chowCreditScore : person.avg_credit_score) >= 700 ? "bg-green-500" :
                    (isChowKaHo ? chowCreditScore : person.avg_credit_score) >= 600 ? "bg-yellow-500" : "bg-red-500"
                  } text-white`}>
                    {isChowKaHo ? "Review" : ((isChowKaHo ? chowCreditScore : person.avg_credit_score) >= 700 ? "Approve" : (isChowKaHo ? chowCreditScore : person.avg_credit_score) >= 600 ? "Review" : "Decline")}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600 mb-1 flex items-center gap-1"><Heart className="w-4 h-4 text-green-500" /> Health Index</div>
                  <div className="text-5xl font-bold text-green-600">{isChowKaHo ? chowHealthIndex : getHealthIndex(person.full_name)}<span className="text-xl font-normal">/100</span></div>
                  <Badge className="mt-2 bg-white">
                    {(isChowKaHo ? chowHealthIndex : getHealthIndex(person.full_name)) >= 85 ? "Optimal" : (isChowKaHo ? chowHealthIndex : getHealthIndex(person.full_name)) >= 70 ? "Moderate" : "Fair"}
                  </Badge>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600 mb-1">Risk Level</div>
                  <Badge className={`text-lg px-4 py-2 ${
                    (isChowKaHo ? chowHealthIndex : getHealthIndex(person.full_name)) >= 85 ? "bg-green-500" :
                    (isChowKaHo ? chowHealthIndex : getHealthIndex(person.full_name)) >= 70 ? "bg-yellow-500" : "bg-orange-500"
                  } text-white`}>
                    {(isChowKaHo ? chowHealthIndex : getHealthIndex(person.full_name)) >= 85 ? "Low Risk" : (isChowKaHo ? chowHealthIndex : getHealthIndex(person.full_name)) >= 70 ? "Medium" : "Monitor"}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Section 1: Financial Ability & Spending Power */}
          <div className="mb-6">
            <h3 className="text-xl font-bold mb-4 flex items-center space-x-2">
              <DollarSign className="w-6 h-6 text-purple-600" />
              <span>Financial Ability & Spending Power</span>
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/50 rounded-xl p-4">
                <div className="text-xs text-gray-600 mb-1">Avg Spend/Trip</div>
                <div className="text-2xl font-bold text-purple-600">${Math.round(avgSpend).toLocaleString()}</div>
              </div>
              <div className="bg-white/50 rounded-xl p-4">
                <div className="text-xs text-gray-600 mb-1">Travel Class</div>
                <Badge className="mt-1">{premiumPreference}</Badge>
              </div>
              <div className="bg-white/50 rounded-xl p-4">
                <div className="text-xs text-gray-600 mb-1">Ancillary Spending</div>
                <div className="text-2xl font-bold text-purple-600">${Math.round(avgSpend * 0.15).toLocaleString()}</div>
              </div>
              <div className="bg-white/50 rounded-xl p-4">
                <div className="text-xs text-gray-600 mb-1">Cross-Border</div>
                <div className="text-2xl font-bold text-purple-600">{Math.round(crossBorderFreq)}/yr</div>
              </div>
            </div>
          </div>

          {/* Section 2: Lifestyle Stability Indicators */}
          <div className="mb-6">
            <h3 className="text-xl font-bold mb-4 flex items-center space-x-2">
              <Plane className="w-6 h-6 text-cyan-600" />
              <span>Lifestyle Stability Indicators</span>
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/50 rounded-xl p-4">
                <div className="text-xs text-gray-600 mb-1">Trip Frequency</div>
                <div className="text-2xl font-bold text-cyan-600">{tripFrequency}/yr</div>
              </div>
              <div className="bg-white/50 rounded-xl p-4">
                <div className="text-xs text-gray-600 mb-1">Business/Leisure</div>
                <Badge className="mt-1">{businessLeisureRatio}</Badge>
              </div>
              <div className="bg-white/50 rounded-xl p-4">
                <div className="text-xs text-gray-600 mb-1">Destination Consistency</div>
                <Badge className="mt-1">{destinationConsistency}</Badge>
              </div>
              <div className="bg-white/50 rounded-xl p-4">
                <div className="text-xs text-gray-600 mb-1">Geographic Stability</div>
                <div className="text-2xl font-bold text-cyan-600">
                  {destinationConsistency === "High" ? "Stable" : destinationConsistency === "Medium" ? "Moderate" : "Variable"}
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Willingness & Responsibility */}
          <div className="mb-6">
            <h3 className="text-xl font-bold mb-4 flex items-center space-x-2">
              <Shield className="w-6 h-6 text-green-600" />
              <span>Willingness & Personal Responsibility</span>
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/50 rounded-xl p-4">
                <div className="text-xs text-gray-600 mb-1">Booking Lead Time</div>
                <div className="text-2xl font-bold text-green-600">{Math.round(avgLeadTime)} days</div>
              </div>
              <div className="bg-white/50 rounded-xl p-4">
                <div className="text-xs text-gray-600 mb-1">Insurance Rate</div>
                <div className="text-2xl font-bold text-green-600">{Math.round(avgInsuranceRate)}%</div>
              </div>
              <div className="bg-white/50 rounded-xl p-4">
                <div className="text-xs text-gray-600 mb-1">Payment Timing</div>
                <Badge className="mt-1">{paymentTiming}</Badge>
              </div>
              <div className="bg-white/50 rounded-xl p-4">
                <div className="text-xs text-gray-600 mb-1">Loyalty Tier</div>
                <Badge className="mt-1">{loyaltyTier}</Badge>
              </div>
            </div>
          </div>

          {/* Section 4: Behavioral Segmentation */}
          <div className="mb-6">
            <h3 className="text-xl font-bold mb-4 flex items-center space-x-2">
              <TrendingUp className="w-6 h-6 text-yellow-600" />
              <span>Behavioral & Psychographic Profile</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/50 rounded-xl p-4">
                <div className="text-xs text-gray-600 mb-2">Activity Preferences</div>
                <div className="flex flex-wrap gap-2">
                  {profiles.slice(0, 3).map((profile, idx) => (
                    <Badge key={idx} variant="outline">{profile.category}</Badge>
                  ))}
                </div>
              </div>
              <div className="bg-white/50 rounded-xl p-4">
                <div className="text-xs text-gray-600 mb-2">Digital Touchpoint</div>
                <Badge className="mt-1">{profiles[0]?.digital_touchpoint || "Mobile App"}</Badge>
              </div>
            </div>
          </div>

          {/* Trip History */}
          <div>
            <h3 className="text-xl font-bold mb-4">Recent Trip History</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {profiles.slice(0, 5).map((profile, idx) => (
                <div key={idx} className="bg-white/50 rounded-lg p-3 flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{profile.trip_name}</div>
                    <div className="text-xs text-gray-600">{profile.category} • ${profile.avg_spend_per_trip?.toLocaleString()}</div>
                  </div>
                  <Badge>{profile.premium_vs_budget}</Badge>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}