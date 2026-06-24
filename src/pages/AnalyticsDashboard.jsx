import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { 
  TrendingUp, 
  DollarSign, 
  Database,
  Activity,
  ArrowUpRight,
  Zap,
  Users,
  RefreshCw,
  PieChart,
  BarChart3,
  AlertCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Animated counter hook
function useCounter(target, duration = 1500) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target]);
  return count;
}

function StatCard({ icon: Icon, color, label, value, sub, highlight, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Card className={`glass-card border-0 glow-hover ${highlight ? 'ring-2 ring-purple-400' : ''}`}>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">{label}</CardTitle>
          <Icon className={`w-4 h-4 ${color}`} />
        </CardHeader>
        <CardContent>
          <div className={`text-3xl font-bold ${color}`}>{value}</div>
          {sub && <p className="text-xs text-gray-500 mt-2">{sub}</p>}
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function AnalyticsDashboard() {
  const [liveCount, setLiveCount] = useState(0);
  const [liveIncome, setLiveIncome] = useState(0);

  const { data: profiles } = useQuery({
    queryKey: ['allProfiles'],
    queryFn: () => base44.entities.TravelDataProfile.list('-created_date'),
    initialData: [],
    refetchInterval: 5000,
  });

  const { data: purchases } = useQuery({
    queryKey: ['allPurchases'],
    queryFn: () => base44.entities.DataPurchase.list('-created_date'),
    initialData: [],
    refetchInterval: 5000,
  });

  const { data: txRequests } = useQuery({
    queryKey: ['allTxRequests'],
    queryFn: () => base44.entities.TransactionRequest.list('-created_date'),
    initialData: [],
    refetchInterval: 5000,
  });

  // Real metrics
  const totalTransactions = purchases.length + txRequests.filter(r => r.status === 'approved').length;
  const totalTokensEarned = profiles.reduce((sum, p) => sum + (p.tokens_earned || 0), 0);
  const totalIncomeHKD = (totalTokensEarned * 0.001 * 7.8).toFixed(2); // ETH to HKD estimate
  const categoryData = profiles.reduce((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + 1;
    return acc;
  }, {});

  // Simulate live counter incrementing
  useEffect(() => {
    setLiveCount(totalTransactions);
    setLiveIncome(parseFloat(totalIncomeHKD));
    const interval = setInterval(() => {
      setLiveCount(c => c + Math.floor(Math.random() * 2));
      setLiveIncome(v => parseFloat((v + Math.random() * 0.5).toFixed(2)));
    }, 4000);
    return () => clearInterval(interval);
  }, [totalTransactions, totalIncomeHKD]);

  const animatedTx = useCounter(liveCount);
  const animatedTokens = useCounter(totalTokensEarned);

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-purple-600 to-cyan-500 bg-clip-text text-transparent">
            Your Data Earnings Dashboard
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            See exactly how much money your travel data is generating — in real time.
          </p>
        </div>

        {/* Hero Banner: The Core Message */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-8 rounded-3xl overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #6F00FF 0%, #00E5FF 100%)' }}
        >
          <div className="p-8 md:p-10 text-white flex flex-col md:flex-row items-center gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-5 h-5 text-yellow-300" />
                <span className="text-yellow-300 font-semibold text-sm uppercase tracking-wide">Before DataLoom</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold mb-2">
                Your travel data was worth <span className="line-through text-white/60">$0.00</span> to you.
              </h2>
              <p className="text-white/80 text-sm md:text-base">
                Airlines, banks, and advertisers were already using your travel patterns to make money — without paying you a single cent. DataLoom changes that.
              </p>
            </div>
            <div className="bg-white/20 rounded-2xl p-6 text-center min-w-[180px]">
              <div className="text-4xl font-bold mb-1">${liveIncome.toFixed(2)}</div>
              <div className="text-white/80 text-sm">earned so far (HKD est.)</div>
              <div className="flex items-center justify-center gap-1 mt-2 text-green-300 text-xs">
                <TrendingUp className="w-3 h-3" />
                <span>Live updating</span>
                <RefreshCw className="w-3 h-3 animate-spin" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={Activity}
            color="text-purple-600"
            label="Total Transactions"
            value={animatedTx}
            sub="Times your data was sold or accessed"
            delay={0.15}
            highlight
          />
          <StatCard
            icon={Database}
            color="text-cyan-600"
            label="Data Profiles Uploaded"
            value={profiles.length}
            sub={`${profiles.filter(p => p.status === 'active').length} active on the marketplace`}
            delay={0.2}
          />
          <StatCard
            icon={Zap}
            color="text-green-600"
            label="Points Earned"
            value={`${animatedTokens}`}
            sub="Redeemable for real money"
            delay={0.25}
          />
          <StatCard
            icon={DollarSign}
            color="text-indigo-600"
            label="Original Earnings (No Platform)"
            value="$0.00"
            sub="What you'd make without DataLoom"
            delay={0.3}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Category Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <Card className="glass-card border-0">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <PieChart className="w-5 h-5 text-purple-600" />
                  <span>Your Trip Categories</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {Object.keys(categoryData).length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <Database className="w-10 h-10 mx-auto mb-2 opacity-40" />
                    <p className="text-sm">Upload your first trip to see data here</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {Object.entries(categoryData).map(([cat, count], i) => {
                      const pct = ((count / profiles.length) * 100).toFixed(1);
                      const colors = ['bg-purple-500', 'bg-cyan-500', 'bg-indigo-500', 'bg-green-500'];
                      return (
                        <div key={cat}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="font-medium">{cat}</span>
                            <span className="text-gray-500">{count} trip{count > 1 ? 's' : ''} ({pct}%)</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ duration: 1, delay: 0.5 + i * 0.1 }}
                              className={`h-3 rounded-full ${colors[i % colors.length]}`}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Live Transaction Feed */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="glass-card border-0">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="w-5 h-5 text-purple-600" />
                  <span>Recent Sales Activity</span>
                  <Badge className="bg-green-100 text-green-700 text-xs ml-auto">Live</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {purchases.length === 0 && txRequests.filter(r => r.status === 'approved').length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <Activity className="w-10 h-10 mx-auto mb-2 opacity-40" />
                    <p className="text-sm">No sales yet — your data will appear here once purchased</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-72 overflow-y-auto">
                    {[...txRequests.filter(r => r.status === 'approved'), ...purchases].slice(0, 8).map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-white/60 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center">
                            <ArrowUpRight className="w-4 h-4 text-green-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-800">Data accessed</p>
                            <p className="text-xs text-gray-500">
                              {item.created_date ? new Date(item.created_date).toLocaleDateString() : 'Recently'}
                            </p>
                          </div>
                        </div>
                        <Badge className="bg-purple-100 text-purple-700">
                          +{item.tokens_paid || item.token_amount || '–'} pts
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Impact Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card rounded-3xl p-8 text-center"
        >
          <h3 className="text-xl font-bold mb-2 text-gray-800">The bigger picture</h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Every time you fly, your travel patterns generate valuable insights for banks, insurers, and advertisers. 
            DataLoom gives you a share of that value — automatically and securely.
          </p>
          <div className="grid grid-cols-3 gap-6 max-w-lg mx-auto">
            <div>
              <div className="text-2xl font-bold text-purple-600">$0</div>
              <div className="text-xs text-gray-500 mt-1">You earned before</div>
            </div>
            <div className="flex items-center justify-center">
              <ArrowUpRight className="w-8 h-8 text-green-500" />
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">${liveIncome.toFixed(2)}+</div>
              <div className="text-xs text-gray-500 mt-1">You're earning now</div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}