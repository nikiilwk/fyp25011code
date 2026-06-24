import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import UploadPanel from "../components/producer/UploadPanel";
import PrivacyPanel from "../components/producer/PrivacyPanel";
import RewardsPanel from "../components/producer/RewardsPanel";
import DataPreview from "../components/producer/DataPreview";
import AnalyticsPanel from "../components/producer/AnalyticsPanel";
import PendingRequests from "../components/producer/PendingRequests";

export default function ProducerDashboard() {
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const userData = await base44.auth.me();
    setUser(userData);
  };

  const { data: profiles, isLoading } = useQuery({
    queryKey: ['myProfiles'],
    queryFn: async () => {
      const user = await base44.auth.me();
      return base44.entities.TravelDataProfile.filter({ created_by: user.email }, '-created_date');
    },
    initialData: [],
  });

  const createProfileMutation = useMutation({
    mutationFn: async (profileData) => {
      const profile = await base44.entities.TravelDataProfile.create(profileData);
      
      // Award tokens for uploading data
      const tokensEarned = Math.floor(Math.random() * 50) + 50;
      const user = await base44.auth.me();
      await base44.auth.updateMe({ 
        token_balance: (user.token_balance || 1000) + tokensEarned 
      });
      
      // Update profile with tokens earned
      await base44.entities.TravelDataProfile.update(profile.id, {
        tokens_earned: tokensEarned,
        completeness_score: Math.floor(Math.random() * 30) + 70,
        quality_score: (Math.random() * 2 + 8).toFixed(1),
      });
      
      return profile;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myProfiles'] });
      loadUser();
    },
  });

  const totalEarned = profiles.reduce((sum, p) => sum + (p.tokens_earned || 0), 0);
  const avgScore = profiles.length > 0 
    ? (profiles.reduce((sum, p) => sum + (p.completeness_score || 0), 0) / profiles.length).toFixed(0)
    : 0;

  return (
    <div className="container mx-auto px-4 py-8 md:py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-cyan-500 bg-clip-text text-transparent">
            Upload Your Travel Data
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Share your travel experiences securely and earn tokens. Control your privacy and contribute to better insights.
          </p>
        </div>

        {/* Pending Transaction Requests */}
        {user && <PendingRequests userEmail={user.email} />}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-8">
            <UploadPanel 
              onUpload={(data) => createProfileMutation.mutate(data)}
              isUploading={createProfileMutation.isPending}
            />
            
            <PrivacyPanel />
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            <DataPreview key={profiles[0]?.id || 'empty'} latestProfile={profiles[0]} />
            
            <AnalyticsPanel
              key={`analytics-${profiles.length}-${avgScore}`}
              completenessScore={avgScore}
              profilesCount={profiles.length}
            />
            
            <RewardsPanel 
              totalEarned={totalEarned}
              activeAssets={profiles.length}
              profiles={profiles}
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}