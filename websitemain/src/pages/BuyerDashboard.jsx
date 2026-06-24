import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Search, User, TrendingUp, DollarSign, Plane } from "lucide-react";
import { Input } from "@/components/ui/input";
import PersonCard from "../components/buyer/PersonCard";
import PersonDetailModal from "../components/buyer/PersonDetailModal";
import BuyerPurchaseModal from "../components/buyer/BuyerPurchaseModal";

export default function BuyerDashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [purchasingPerson, setPurchasingPerson] = useState(null);

  const { data: profiles, isLoading } = useQuery({
    queryKey: ['buyerProfiles'],
    queryFn: async () => {
      return base44.entities.TravelDataProfile.filter({ share_with_enterprises: true }, '-created_date');
    },
    initialData: [],
  });

  const { data: purchases, refetch: refetchPurchases } = useQuery({
    queryKey: ['myPurchases'],
    queryFn: async () => {
      const user = await base44.auth.me();
      const approved = await base44.entities.TransactionRequest.filter({ 
        buyer_id: user.email,
        status: "approved"
      });
      return approved;
    },
    initialData: [],
  });

  // Group profiles by person (full_name)
  const groupedByPerson = profiles.reduce((acc, profile) => {
    const name = profile.full_name || "Unknown";
    if (!acc[name]) {
      acc[name] = {
        full_name: name,
        email: profile.email,
        profiles: [],
        total_trips: 0,
        avg_credit_score: 0,
        total_spend: 0,
      };
    }
    acc[name].profiles.push(profile);
    acc[name].total_trips = acc[name].profiles.length;
    return acc;
  }, {});

  // Calculate aggregated metrics for each person
  const personsData = Object.values(groupedByPerson).map(person => {
    const profiles = person.profiles;
    const avgCreditScore = profiles.reduce((sum, p) => sum + (p.credit_score || 0), 0) / profiles.length;
    const totalSpend = profiles.reduce((sum, p) => sum + (p.avg_spend_per_trip || 0), 0);
    const avgSpend = totalSpend / profiles.length;
    
    return {
      ...person,
      avg_credit_score: Math.round(avgCreditScore),
      total_spend: Math.round(totalSpend),
      avg_spend: Math.round(avgSpend),
    };
  });

  const filteredPersons = personsData.filter(person =>
    person.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    person.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const hasPurchasedPerson = (person) => {
    return person.profiles.some(profile => 
      purchases.some(p => p.profile_id === profile.id)
    );
  };

  const stats = {
    totalProfiles: profiles.length,
    totalPersons: personsData.length,
    avgCreditScore: Math.round(personsData.reduce((sum, p) => sum + p.avg_credit_score, 0) / personsData.length) || 0,
    totalRevenue: personsData.reduce((sum, p) => sum + p.total_spend, 0),
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-cyan-500 bg-clip-text text-transparent">
            Data Buyer Portal
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Access integrated behavioral and financial profiles for credit assessment
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="glass-card rounded-2xl p-6">
            <User className="w-8 h-8 text-purple-600 mb-2" />
            <div className="text-2xl font-bold">{stats.totalPersons}</div>
            <div className="text-sm text-gray-600">Total Profiles</div>
          </div>
          <div className="glass-card rounded-2xl p-6">
            <Plane className="w-8 h-8 text-cyan-600 mb-2" />
            <div className="text-2xl font-bold">{stats.totalProfiles}</div>
            <div className="text-sm text-gray-600">Total Trips</div>
          </div>
          <div className="glass-card rounded-2xl p-6">
            <TrendingUp className="w-8 h-8 text-green-600 mb-2" />
            <div className="text-2xl font-bold">{stats.avgCreditScore}</div>
            <div className="text-sm text-gray-600">Avg Credit Score</div>
          </div>
          <div className="glass-card rounded-2xl p-6">
            <DollarSign className="w-8 h-8 text-yellow-600 mb-2" />
            <div className="text-2xl font-bold">${(stats.totalRevenue / 1000).toFixed(0)}K</div>
            <div className="text-sm text-gray-600">Total Spend</div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-2xl mx-auto mb-8">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 pr-4 py-6 rounded-full text-lg border-2 border-gray-200 focus:border-purple-500"
          />
        </div>

        {/* Person Cards */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPersons.map((person) => (
              <PersonCard
                key={person.full_name}
                person={person}
                onClick={() => hasPurchasedPerson(person) && setSelectedPerson(person)}
                onPurchase={(p) => setPurchasingPerson(p)}
                hasPurchased={hasPurchasedPerson(person)}
              />
            ))}
          </div>
        )}

        {filteredPersons.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No profiles found.</p>
          </div>
        )}
      </motion.div>

      {/* Detail Modal */}
      {selectedPerson && (
        <PersonDetailModal
          person={selectedPerson}
          onClose={() => setSelectedPerson(null)}
        />
      )}

      {/* Purchase Modal */}
      {purchasingPerson && (
        <BuyerPurchaseModal 
          person={purchasingPerson}
          onClose={() => setPurchasingPerson(null)}
          onPurchase={() => refetchPurchases()}
        />
      )}
    </div>
  );
}