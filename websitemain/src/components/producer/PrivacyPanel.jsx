import React, { useState } from "react";
import { motion } from "framer-motion";
import { Shield, EyeOff, Briefcase, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function PrivacyPanel() {
  const [settings, setSettings] = useState({
    anonymized: true,
    shareWithEnterprises: true,
    earnRewards: true,
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="glass-card rounded-3xl p-8 glow-hover"
    >
      <h2 className="text-2xl font-bold mb-6 flex items-center space-x-2">
        <Shield className="w-6 h-6 text-purple-600" />
        <span>Privacy & Permissions</span>
      </h2>

      <div className="space-y-6">
        {/* Privacy Controls */}
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-white/50 rounded-xl">
            <div className="flex items-center space-x-3">
              <EyeOff className="w-5 h-5 text-purple-600" />
              <div>
                <Label className="font-medium">Allow Anonymization</Label>
                <p className="text-xs text-gray-500">Your personal info will be hidden</p>
              </div>
            </div>
            <Switch
              checked={settings.anonymized}
              onCheckedChange={(val) => setSettings({ ...settings, anonymized: val })}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-white/50 rounded-xl">
            <div className="flex items-center space-x-3">
              <Briefcase className="w-5 h-5 text-purple-600" />
              <div>
                <Label className="font-medium">Allow Enterprise Access</Label>
                <p className="text-xs text-gray-500">Share insights with businesses</p>
              </div>
            </div>
            <Switch
              checked={settings.shareWithEnterprises}
              onCheckedChange={(val) => setSettings({ ...settings, shareWithEnterprises: val })}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-white/50 rounded-xl">
            <div className="flex items-center space-x-3">
              <DollarSign className="w-5 h-5 text-purple-600" />
              <div>
                <Label className="font-medium">Enable Reward Sharing</Label>
                <p className="text-xs text-gray-500">Earn tokens from your data</p>
              </div>
            </div>
            <Switch
              checked={settings.earnRewards}
              onCheckedChange={(val) => setSettings({ ...settings, earnRewards: val })}
            />
          </div>
        </div>

        <Button className="w-full gradient-purple-cyan text-white py-5 rounded-xl font-semibold">
          Save Permissions
        </Button>
      </div>
    </motion.div>
  );
}