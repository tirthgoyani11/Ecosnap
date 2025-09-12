import React, { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KPIStat } from "@/components/KPIStat";
import { ScoreRing } from "@/components/ScoreRing";
import { CountUpStat } from "@/components/CountUpStat";
import { AnimatedElement, StaggeredGrid } from "@/components/AnimatedComponents";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ConfettiBurst } from "@/components/ConfettiBurst";
import { useProfile, useScans, useUserRank } from "@/hooks/useDatabase";
import { useEcoTips } from "@/hooks/useEcoTips";
import { cn } from "@/lib/utils";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart
} from 'recharts';
import { 
  Scan, 
  Leaf, 
  TrendingUp, 
  Award,
  Calendar,
  BarChart3,
  Zap,
  ArrowRight,
  Users,
  Target,
  TreePine,
  Recycle,
  Lightbulb,
  Star,
  History,
  Brain,
  Eye,
  Camera,
  Trophy,
  Globe,
  Sparkles,
  Activity,
  ChevronRight,
  MapPin,
  Clock,
  Filter,
  RefreshCw,
  TrendingDown,
  Flame,
  Shield,
  Layers,
  Wifi,
  WifiOff,
  Heart,
  Sunrise,
  Moon,
  Wind,
  Settings,
  Share2,
  Download,
  Maximize2
} from "lucide-react";

interface DashboardStats {
  totalScans: number;
  totalPoints: number;
  co2Saved: number;
  ecoScore: number;
  rank: number;
  weeklyScans: number;
  monthlyScans: number;
  alternativesFound: number;
  achievements: string[];
  streakDays: number;
  impactLevel: 'Beginner' | 'Explorer' | 'Champion' | 'Hero' | 'Legend';
}

interface AnalyticsData {
  summary: string;
  trends: string[];
  recommendations: string[];
  insights: string[];
}

// Gemini AI Integration for Smart Analytics using native fetch
const generateAIAnalytics = async (stats: DashboardStats, recentScans: any[]): Promise<AnalyticsData> => {
  try {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey || apiKey === 'demo-key') {
      throw new Error('Gemini API key not configured - using intelligent fallback');
    }

    const prompt = `Analyze this eco-conscious user's data and provide personalized insights in JSON format:

User Stats:
- Total Scans: ${stats.totalScans}
- Total Points: ${stats.totalPoints}
- CO2 Saved: ${stats.co2Saved}kg
- Eco Score: ${stats.ecoScore}/100
- Impact Level: ${stats.impactLevel}
- Weekly Scans: ${stats.weeklyScans}
- Monthly Scans: ${stats.monthlyScans}
- Streak Days: ${stats.streakDays}
- Alternatives Found: ${stats.alternativesFound}
- Achievements: ${stats.achievements.join(', ')}

Recent Activity: ${recentScans?.length || 0} recent scans

Please respond with valid JSON only in this exact format:
{
  "summary": "A motivating 2-sentence overview of their eco journey",
  "trends": ["3 key behavioral trends you notice"],
  "recommendations": ["3 actionable suggestions to improve their impact"],
  "insights": ["2 interesting insights about their eco behavior"]
}

Keep responses encouraging, specific, and actionable. Focus on environmental impact and sustainability.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      const text = data.candidates[0].content.parts[0].text;
      
      // Try to parse JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0]);
          return parsed;
        } catch (parseError) {
          console.warn('Failed to parse AI JSON response:', parseError);
        }
      }
      
      // Fallback: Create structured response from text
      return {
        summary: text.split('\n')[0] || `🌟 You've made ${stats.totalScans} eco-conscious scans and saved ${stats.co2Saved.toFixed(1)}kg of CO2! Your ${stats.impactLevel} status shows real environmental commitment.`,
        trends: [
          stats.weeklyScans > 5 ? "🚀 High weekly activity shows strong engagement" : "📈 Steady progress building habits",
          stats.streakDays > 0 ? `🔥 ${stats.streakDays}-day streak shows dedication` : "🎯 Building consistency",
          stats.alternativesFound > 10 ? "🔍 Strong alternative discovery" : "🌿 Growing eco-awareness"
        ],
        recommendations: [
          stats.weeklyScans < 7 ? "🎯 Try daily scanning for bigger impact" : "💪 Maintain excellent rhythm",
          stats.ecoScore < 70 ? "⭐ Focus on higher eco-rated products" : "🌟 Share your knowledge",
          "🔍 Explore new product categories"
        ],
        insights: [
          `🏆 Your ${stats.achievements.length} achievements show real progress`,
          "🌍 Small consistent actions create meaningful change"
        ]
      };
    }
    
    throw new Error('No valid response from Gemini API');
  } catch (error) {
    console.error('AI Analytics Error:', error);
    // Provide intelligent fallback based on actual data
    return {
      summary: `🌟 You've made ${stats.totalScans} eco-conscious scans and saved ${stats.co2Saved.toFixed(1)}kg of CO2! Your ${stats.impactLevel} status shows real environmental commitment and dedication to sustainable living.`,
      trends: [
        stats.weeklyScans > 5 
          ? "🚀 High weekly activity shows strong environmental engagement" 
          : stats.weeklyScans > 0 
            ? "📈 Steady scanning progress building sustainable habits" 
            : "🌱 Just getting started on your eco journey",
        stats.streakDays > 7 
          ? `🔥 Amazing ${stats.streakDays}-day streak demonstrates daily commitment to sustainability` 
          : stats.streakDays > 0 
            ? `⭐ ${stats.streakDays}-day streak shows developing eco-consciousness`
            : "🎯 Focus on building consistent daily scanning habits",
        stats.alternativesFound > 15 
          ? "🔍 Excellent alternative discovery shows deep eco-awareness" 
          : stats.alternativesFound > 5
            ? "🌿 Good alternative exploration indicates growing sustainability knowledge"
            : "📚 Opportunity to discover more sustainable alternatives"
      ],
      recommendations: [
        stats.weeklyScans < 7 
          ? "🎯 Try scanning one item daily to build a powerful eco habit and maximize your environmental impact" 
          : "💪 Maintain your excellent scanning rhythm and inspire others to join your eco journey",
        stats.ecoScore < 70 
          ? "⭐ Focus on products with higher eco-ratings to boost your overall sustainability score" 
          : stats.ecoScore < 85
            ? "🌟 You're doing great! Look for premium eco-certified products to reach eco-champion status"
            : "🏆 Share your eco expertise and high-score strategies with the EcoSnap community",
        stats.alternativesFound < stats.totalScans * 0.5 
          ? "🔍 Explore more eco-friendly alternatives - each scan is a chance to discover better options"
          : "📱 Try scanning diverse product categories to expand your sustainable lifestyle knowledge"
      ],
      insights: [
        `🏆 Your ${stats.achievements.length} achievement${stats.achievements.length !== 1 ? 's' : ''} reflect${stats.achievements.length === 1 ? 's' : ''} measurable progress toward environmental stewardship`,
        stats.co2Saved > 0 
          ? `🌍 Your ${stats.co2Saved.toFixed(1)}kg CO2 savings equivalent to planting ${Math.floor(stats.co2Saved * 0.037)} tree seedlings` 
          : "🌱 Small consistent actions compound into meaningful environmental change over time"
      ]
    };
  }
};

export default function Dashboard() {
  const { data: profile, isLoading: profileLoading, error: profileError, refetch: refetchProfile } = useProfile();
  const { data: recentScans, isLoading: scansLoading, error: scansError, refetch: refetchScans } = useScans(50);
  const { data: userRank, isLoading: rankLoading, error: rankError, refetch: refetchRank } = useUserRank();
  const { dailyTip } = useEcoTips();

  // State management
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [historyFilter, setHistoryFilter] = useState("all");
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Real-time data refresh
  const refreshAllData = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refetchProfile(),
        refetchScans(),
        refetchRank()
      ]);
      setLastUpdated(new Date());
      console.log('✅ Dashboard data refreshed at:', new Date().toLocaleTimeString());
    } catch (error) {
      console.error('❌ Failed to refresh data:', error);
    } finally {
      setRefreshing(false);
    }
  }, [refetchProfile, refetchScans, refetchRank]);

  // Auto-refresh every 30 seconds for real-time updates
  useEffect(() => {
    const interval = setInterval(refreshAllData, 30000);
    return () => clearInterval(interval);
  }, [refetchProfile, refetchScans, refetchRank]);

  useEffect(() => {
    document.title = "🌿 EcoSnap AI - Smart Dashboard";
    
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1200);
    
    return () => clearTimeout(timer);
  }, []);

  // Update timestamp when core data changes
  useEffect(() => {
    if (profile || recentScans || userRank) {
      setLastUpdated(new Date());
    }
  }, [profile?.total_scans, recentScans?.length, userRank]);

  // Calculate comprehensive stats
  const stats: DashboardStats = useMemo(() => {
    // Debug logging to track data updates
    console.log('📊 Dashboard Stats Update:', {
      profile: profile?.total_scans || 0,
      scans: recentScans?.length || 0,
      rank: (userRank as any)?.current_rank || 999999
    });
    
    const baseStats: DashboardStats = {
      totalScans: profile?.total_scans || 0,
      totalPoints: profile?.points || 0,
      co2Saved: profile?.total_co2_saved || 0,
      ecoScore: profile?.eco_score_avg || 50,
      rank: (userRank as any)?.current_rank || 999999,
      weeklyScans: 0,
      monthlyScans: 0,
      alternativesFound: 0,
      achievements: [],
      streakDays: 0,
      impactLevel: 'Beginner' as const
    };

    if (recentScans && recentScans.length > 0) {
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      baseStats.weeklyScans = recentScans.filter(scan => 
        new Date(scan.created_at) >= oneWeekAgo
      ).length;

      baseStats.monthlyScans = recentScans.filter(scan => 
        new Date(scan.created_at) >= oneMonthAgo
      ).length;

      baseStats.alternativesFound = recentScans.reduce((total, scan) => 
        total + (scan.alternatives_suggested || 0), 0
      );

      // Calculate streak days
      const sortedScans = [...recentScans].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      
      let streak = 0;
      let currentDate = new Date();
      for (const scan of sortedScans) {
        const scanDate = new Date(scan.created_at);
        const daysDiff = Math.floor((currentDate.getTime() - scanDate.getTime()) / (1000 * 60 * 60 * 24));
        if (daysDiff <= streak + 1) {
          streak = Math.max(streak, daysDiff + 1);
        } else {
          break;
        }
      }
      baseStats.streakDays = streak;
    }

    // Determine impact level
    const totalImpactScore = baseStats.totalScans * 10 + baseStats.co2Saved * 5 + baseStats.totalPoints;
    if (totalImpactScore >= 10000) baseStats.impactLevel = 'Legend';
    else if (totalImpactScore >= 5000) baseStats.impactLevel = 'Hero';
    else if (totalImpactScore >= 2000) baseStats.impactLevel = 'Champion';
    else if (totalImpactScore >= 500) baseStats.impactLevel = 'Explorer';

    // Generate achievements
    const achievements = [];
    if (baseStats.totalScans >= 10) achievements.push('🎯 Scanner Pro');
    if (baseStats.totalScans >= 50) achievements.push('🔥 Scan Master');
    if (baseStats.co2Saved >= 5) achievements.push('🌍 Carbon Saver');
    if (baseStats.co2Saved >= 20) achievements.push('♻️ Eco Warrior');
    if (baseStats.ecoScore >= 70) achievements.push('⭐ Quality Seeker');
    if (baseStats.streakDays >= 7) achievements.push('🔄 Weekly Champion');
    if (baseStats.alternativesFound >= 10) achievements.push('🔍 Alternative Explorer');
    baseStats.achievements = achievements;

    return baseStats;
  }, [profile, recentScans, userRank]);

  // AI Analytics generation
  const generateAnalytics = async () => {
    if (!recentScans || analyticsData) return;
    
    setAnalyticsData(null); // Reset for loading state
    const data = await generateAIAnalytics(stats, recentScans);
    setAnalyticsData(data);
  };

  // Auto-generate analytics when data changes
  useEffect(() => {
    if (showAnalytics && !analyticsData && stats.totalScans > 0) {
      generateAnalytics();
    }
  }, [showAnalytics, stats.totalScans, analyticsData]);

  // Chart data preparation
  const chartData = useMemo(() => {
    if (!recentScans) return { daily: [], monthly: [], categories: [] };

    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return {
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        scans: recentScans.filter(scan => {
          const scanDate = new Date(scan.created_at);
          return scanDate.toDateString() === date.toDateString();
        }).length,
        co2Saved: recentScans.filter(scan => {
          const scanDate = new Date(scan.created_at);
          return scanDate.toDateString() === date.toDateString();
        }).reduce((sum, scan) => sum + ((scan as any).co2_saved || 0), 0)
      };
    });

    const monthlyData = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (5 - i));
      const monthScans = recentScans.filter(scan => {
        const scanDate = new Date(scan.created_at);
        return scanDate.getMonth() === date.getMonth() && scanDate.getFullYear() === date.getFullYear();
      });
      
      return {
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        scans: monthScans.length,
        points: monthScans.reduce((sum, scan) => sum + ((scan as any).points_earned || 0), 0),
        alternatives: monthScans.reduce((sum, scan) => sum + ((scan as any).alternatives_suggested || 0), 0)
      };
    });

    const categoryData = recentScans.reduce((acc, scan) => {
      const category = (scan as any).product_category || 'Other';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      daily: last7Days,
      monthly: monthlyData,
      categories: Object.entries(categoryData).map(([name, value]) => ({ name, value }))
    };
  }, [recentScans]);

  // Filtered history based on current filter
  const filteredHistory = useMemo(() => {
    if (!recentScans) return [];
    
    const now = new Date();
    switch (historyFilter) {
      case 'today':
        return recentScans.filter(scan => {
          const scanDate = new Date(scan.created_at);
          return scanDate.toDateString() === now.toDateString();
        });
      case 'week':
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return recentScans.filter(scan => new Date(scan.created_at) >= oneWeekAgo);
      case 'month':
        const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return recentScans.filter(scan => new Date(scan.created_at) >= oneMonthAgo);
      default:
        return recentScans;
    }
  }, [recentScans, historyFilter]);

  // Show celebration for achievements
  useEffect(() => {
    if (stats.achievements.length > 0 && !showCelebration) {
      setShowCelebration(true);
      const timer = setTimeout(() => setShowCelebration(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [stats.achievements.length]);

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-blue-950 dark:to-purple-950 relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-pink-400/20 to-yellow-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-3/4 left-1/2 w-48 h-48 bg-gradient-to-r from-green-400/20 to-cyan-400/20 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center z-10"
        >
          <div className="text-6xl mb-4">🌿</div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-2">
            EcoSnap AI Dashboard
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mb-6">Loading your eco-journey...</p>
          <LoadingSpinner />
        </motion.div>
      </div>
    );
  }

  if (profileError || scansError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-950 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-6 text-center">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold mb-2">Connection Issue</h2>
            <p className="text-gray-600 mb-4">Unable to load dashboard data. Please try again.</p>
            <Button onClick={refreshAllData} disabled={refreshing}>
              <RefreshCw className={cn("h-4 w-4 mr-2", refreshing && "animate-spin")} />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-blue-950 dark:to-purple-950 relative overflow-hidden">
      {/* Enhanced animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-pink-400/20 to-yellow-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-3/4 left-1/2 w-48 h-48 bg-gradient-to-r from-green-400/20 to-cyan-400/20 rounded-full blur-3xl animate-pulse delay-500"></div>
        
        {/* Floating particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [-10, -50, -10],
              x: [-5, 5, -5],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {showCelebration && <ConfettiBurst isVisible={true} />}

      <div className="relative z-10 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header Section */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 100 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <motion.h1 
                className="text-4xl sm:text-5xl lg:text-6xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600"
                whileHover={{ scale: 1.02 }}
              >
                🌿 EcoSnap Dashboard
              </motion.h1>
              <motion.p 
                className="text-lg text-slate-600 dark:text-slate-400 font-medium"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                Welcome back, {profile?.username || 'Eco Warrior'}! Track your environmental impact.
              </motion.p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={refreshAllData} 
                disabled={refreshing}
                variant="outline"
                className="backdrop-blur-sm bg-white/10 hover:bg-white/20 border-white/20"
              >
                <RefreshCw className={cn("h-4 w-4 mr-2", refreshing && "animate-spin")} />
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </Button>
              
              <Button 
                onClick={() => setShowAnalytics(!showAnalytics)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0"
              >
                <Brain className="h-4 w-4 mr-2" />
                {showAnalytics ? 'Hide' : 'AI'} Analytics
              </Button>

              {/* Test Button for Development */}
              <Button 
                onClick={() => {
                  // Simulate data change for testing
                  setLastUpdated(new Date());
                  setShowCelebration(true);
                  console.log('🧪 Test data update triggered');
                }}
                variant="outline"
                className="backdrop-blur-sm bg-yellow-100/20 hover:bg-yellow-200/30 border-yellow-300/30"
                size="sm"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Test Update
              </Button>

              {/* Connection Status */}
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  <Wifi className="h-4 w-4 text-green-500" />
                </motion.div>
                <div className="text-xs text-green-600 font-medium">
                  <div>Live</div>
                  <div className="text-xs text-slate-500">
                    {lastUpdated.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Impact Level Badge */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
            className="mt-4"
          >
            <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-2 text-lg font-bold shadow-lg">
              <Star className="h-4 w-4 mr-2" />
              {stats.impactLevel} Level
            </Badge>
          </motion.div>
        </motion.div>

        {/* AI Analytics Section */}
        <AnimatePresence>
          {showAnalytics && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -20 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: -20 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="overflow-hidden"
            >
              <Card className="backdrop-blur-xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-200/20 shadow-2xl mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="p-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl">
                      <Brain className="h-6 w-6 text-white" />
                    </div>
                    🤖 AI-Powered Analytics & Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!analyticsData ? (
                    <div className="flex items-center justify-center py-8">
                      <LoadingSpinner />
                      <span className="ml-3 text-purple-600">Analyzing your eco journey...</span>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* AI Summary */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="bg-gradient-to-r from-purple-400/20 to-blue-400/20 p-6 rounded-2xl border border-purple-200/30"
                      >
                        <h4 className="font-bold text-lg mb-3 flex items-center">
                          <Sparkles className="h-5 w-5 mr-2 text-purple-600" />
                          Smart Summary
                        </h4>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-lg">
                          {analyticsData.summary}
                        </p>
                      </motion.div>

                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Trends */}
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 }}
                        >
                          <Card className="h-full bg-gradient-to-br from-green-400/10 to-emerald-400/10 border-green-200/20">
                            <CardHeader>
                              <CardTitle className="flex items-center text-green-700">
                                <TrendingUp className="h-5 w-5 mr-2" />
                                Trends
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <ul className="space-y-2">
                                {analyticsData.trends.map((trend, index) => (
                                  <li key={index} className="flex items-start gap-2">
                                    <ChevronRight className="h-4 w-4 mt-0.5 text-green-600 flex-shrink-0" />
                                    <span className="text-sm text-slate-600 dark:text-slate-400">{trend}</span>
                                  </li>
                                ))}
                              </ul>
                            </CardContent>
                          </Card>
                        </motion.div>

                        {/* Recommendations */}
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4 }}
                        >
                          <Card className="h-full bg-gradient-to-br from-blue-400/10 to-cyan-400/10 border-blue-200/20">
                            <CardHeader>
                              <CardTitle className="flex items-center text-blue-700">
                                <Target className="h-5 w-5 mr-2" />
                                Recommendations
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <ul className="space-y-2">
                                {analyticsData.recommendations.map((rec, index) => (
                                  <li key={index} className="flex items-start gap-2">
                                    <ArrowRight className="h-4 w-4 mt-0.5 text-blue-600 flex-shrink-0" />
                                    <span className="text-sm text-slate-600 dark:text-slate-400">{rec}</span>
                                  </li>
                                ))}
                              </ul>
                            </CardContent>
                          </Card>
                        </motion.div>

                        {/* Insights */}
                        <motion.div
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 }}
                        >
                          <Card className="h-full bg-gradient-to-br from-orange-400/10 to-yellow-400/10 border-orange-200/20">
                            <CardHeader>
                              <CardTitle className="flex items-center text-orange-700">
                                <Eye className="h-5 w-5 mr-2" />
                                Insights
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <ul className="space-y-2">
                                {analyticsData.insights.map((insight, index) => (
                                  <li key={index} className="flex items-start gap-2">
                                    <Lightbulb className="h-4 w-4 mt-0.5 text-orange-600 flex-shrink-0" />
                                    <span className="text-sm text-slate-600 dark:text-slate-400">{insight}</span>
                                  </li>
                                ))}
                              </ul>
                            </CardContent>
                          </Card>
                        </motion.div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <TabsList className="grid w-full grid-cols-3 lg:grid-cols-4 backdrop-blur-sm bg-white/20 border-white/30 rounded-2xl p-1">
              <TabsTrigger value="overview" className="rounded-xl data-[state=active]:bg-white/40 data-[state=active]:shadow-lg">
                <BarChart3 className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="stats" className="rounded-xl data-[state=active]:bg-white/40 data-[state=active]:shadow-lg">
                <Trophy className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Stats</span>
              </TabsTrigger>
              <TabsTrigger value="history" className="rounded-xl data-[state=active]:bg-white/40 data-[state=active]:shadow-lg">
                <History className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">History</span>
              </TabsTrigger>
              <TabsTrigger value="impact" className="rounded-xl data-[state=active]:bg-white/40 data-[state=active]:shadow-lg">
                <TreePine className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Impact</span>
              </TabsTrigger>
            </TabsList>
          </motion.div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <motion.div 
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {/* Total Scans */}
                <motion.div whileHover={{ scale: 1.02, y: -2 }}>
                  <Card className="backdrop-blur-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-200/20 shadow-xl hover:shadow-2xl transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl shadow-lg">
                          <Scan className="h-6 w-6 text-white" />
                        </div>
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          +{stats.weeklyScans} this week
                        </Badge>
                      </div>
                      <div>
                        <CountUpStat
                          value={stats.totalScans}
                          className="text-3xl font-black text-blue-700 dark:text-blue-400"
                        />
                        <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Total Scans</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Points Earned */}
                <motion.div whileHover={{ scale: 1.02, y: -2 }}>
                  <Card className="backdrop-blur-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-200/20 shadow-xl hover:shadow-2xl transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl shadow-lg">
                          <Zap className="h-6 w-6 text-white" />
                        </div>
                        <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                          Rank #{stats.rank}
                        </Badge>
                      </div>
                      <div>
                        <CountUpStat
                          value={stats.totalPoints}
                          className="text-3xl font-black text-purple-700 dark:text-purple-400"
                        />
                        <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Points Earned</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* CO2 Saved */}
                <motion.div whileHover={{ scale: 1.02, y: -2 }}>
                  <Card className="backdrop-blur-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-200/20 shadow-xl hover:shadow-2xl transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl shadow-lg">
                          <TreePine className="h-6 w-6 text-white" />
                        </div>
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          <Leaf className="h-3 w-3 mr-1" />
                          Carbon Impact
                        </Badge>
                      </div>
                      <div>
                        <div className="text-3xl font-black text-green-700 dark:text-green-400">
                          {stats.co2Saved.toFixed(1)}kg
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">CO₂ Saved</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Eco Score */}
                <motion.div whileHover={{ scale: 1.02, y: -2 }}>
                  <Card className="backdrop-blur-xl bg-gradient-to-br from-orange-500/10 to-yellow-500/10 border-orange-200/20 shadow-xl hover:shadow-2xl transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-gradient-to-r from-orange-600 to-yellow-600 rounded-2xl shadow-lg">
                          <Star className="h-6 w-6 text-white" />
                        </div>
                        <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                          {stats.ecoScore >= 70 ? 'Excellent' : stats.ecoScore >= 50 ? 'Good' : 'Improving'}
                        </Badge>
                      </div>
                      <div>
                        <div className="text-3xl font-black text-orange-700 dark:text-orange-400">
                          {stats.ecoScore.toFixed(0)}/100
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Avg Eco Score</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Quick Actions & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-xl h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl">
                        <Zap className="h-5 w-5 text-white" />
                      </div>
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button
                      onClick={() => window.location.href = '/scanner'}
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white border-0 h-12 text-base font-semibold shadow-lg"
                    >
                      <Camera className="h-5 w-5 mr-3" />
                      Start Scanning
                      <ArrowRight className="h-4 w-4 ml-auto" />
                    </Button>
                    
                    <Button
                      onClick={() => window.location.href = '/leaderboard'}
                      variant="outline"
                      className="w-full backdrop-blur-sm bg-white/10 hover:bg-white/20 border-white/30 h-12"
                    >
                      <Trophy className="h-5 w-5 mr-3" />
                      View Leaderboard
                      <ArrowRight className="h-4 w-4 ml-auto" />
                    </Button>

                    <Button
                      onClick={() => setActiveTab('history')}
                      variant="outline"
                      className="w-full backdrop-blur-sm bg-white/10 hover:bg-white/20 border-white/30 h-12"
                    >
                      <History className="h-5 w-5 mr-3" />
                      View History
                      <ArrowRight className="h-4 w-4 ml-auto" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Recent Activity Preview */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-xl h-full">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl">
                        <Activity className="h-5 w-5 text-white" />
                      </div>
                      Recent Activity
                    </CardTitle>
                    <Button
                      onClick={() => setActiveTab('history')}
                      variant="ghost"
                      size="sm"
                      className="text-purple-600 hover:text-purple-700 hover:bg-purple-100/20"
                    >
                      View All
                      <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {recentScans && recentScans.length > 0 ? (
                      <div className="space-y-3">
                        {recentScans.slice(0, 4).map((scan, index) => (
                          <motion.div
                            key={scan.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 + index * 0.1 }}
                            className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                          >
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
                              <Scan className="h-5 w-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">
                                {scan.detected_name || 'Unknown Product'}
                              </p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                {new Date(scan.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <Badge 
                                variant="secondary" 
                                className={cn(
                                  "text-xs",
                                  (scan.eco_score || 50) >= 70 ? "bg-green-100 text-green-800" :
                                  (scan.eco_score || 50) >= 50 ? "bg-yellow-100 text-yellow-800" :
                                  "bg-red-100 text-red-800"
                                )}
                              >
                                {scan.eco_score || 50}/100
                              </Badge>
                              <span className="text-xs font-semibold text-blue-600">
                                +{scan.points_earned || 0}
                              </span>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-slate-500">
                        <Scan className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>No scans yet</p>
                        <p className="text-sm">Start scanning to see your activity!</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-xl">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <CardTitle className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl">
                        <History className="h-5 w-5 text-white" />
                      </div>
                      Scan History
                    </CardTitle>
                    <div className="flex gap-2">
                      {['all', 'today', 'week', 'month'].map((filter) => (
                        <Button
                          key={filter}
                          onClick={() => setHistoryFilter(filter)}
                          variant={historyFilter === filter ? "default" : "outline"}
                          size="sm"
                          className={cn(
                            "capitalize",
                            historyFilter === filter 
                              ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0" 
                              : "backdrop-blur-sm bg-white/10 hover:bg-white/20 border-white/30"
                          )}
                        >
                          {filter}
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {filteredHistory.length > 0 ? (
                    <div className="space-y-4">
                      {filteredHistory.map((scan, index) => (
                        <motion.div
                          key={scan.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-200 border border-white/10"
                        >
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
                            <Scan className="h-6 w-6 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-base truncate">
                              {scan.detected_name || 'Unknown Product'}
                            </h3>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {new Date(scan.created_at).toLocaleDateString()}
                              </span>
                              <span className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {scan.scan_type || 'Standard'}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 flex-shrink-0">
                            <div className="text-center">
                              <Badge 
                                className={cn(
                                  "mb-1",
                                  (scan.eco_score || 50) >= 70 ? "bg-green-100 text-green-800" :
                                  (scan.eco_score || 50) >= 50 ? "bg-yellow-100 text-yellow-800" :
                                  "bg-red-100 text-red-800"
                                )}
                              >
                                {scan.eco_score || 50}/100
                              </Badge>
                              <div className="text-xs text-slate-500">Eco Score</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold text-blue-600">
                                +{scan.points_earned || 0}
                              </div>
                              <div className="text-xs text-slate-500">Points</div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <History className="h-16 w-16 mx-auto mb-4 opacity-50 text-slate-400" />
                      <h3 className="text-xl font-semibold mb-2">No scans found</h3>
                      <p className="text-slate-500 mb-6">
                        {historyFilter === 'all' 
                          ? "You haven't made any scans yet." 
                          : `No scans found for ${historyFilter === 'today' ? 'today' : `this ${historyFilter}`}.`
                        }
                      </p>
                      <Button
                        onClick={() => window.location.href = '/scanner'}
                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                      >
                        <Camera className="h-4 w-4 mr-2" />
                        Start Scanning
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Stats Tab - Enhanced with Charts */}
          <TabsContent value="stats" className="space-y-6">
            {/* Charts Row */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* Daily Activity Chart */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="backdrop-blur-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-200/20 shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl">
                        <Activity className="h-5 w-5 text-white" />
                      </div>
                      Daily Activity (7 Days)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <AreaChart data={chartData.daily}>
                        <defs>
                          <linearGradient id="scansGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                          </linearGradient>
                          <linearGradient id="co2Gradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                        <XAxis dataKey="date" fontSize={12} />
                        <YAxis fontSize={12} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                            border: 'none', 
                            borderRadius: '12px',
                            backdropFilter: 'blur(10px)'
                          }} 
                        />
                        <Legend />
                        <Area type="monotone" dataKey="scans" stroke="#3B82F6" fill="url(#scansGradient)" name="Scans" />
                        <Area type="monotone" dataKey="co2Saved" stroke="#10B981" fill="url(#co2Gradient)" name="CO2 Saved (kg)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Monthly Trends Chart */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="backdrop-blur-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-200/20 shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl">
                        <BarChart3 className="h-5 w-5 text-white" />
                      </div>
                      Monthly Trends (6 Months)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={chartData.monthly}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                        <XAxis dataKey="month" fontSize={12} />
                        <YAxis fontSize={12} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                            border: 'none', 
                            borderRadius: '12px',
                            backdropFilter: 'blur(10px)'
                          }} 
                        />
                        <Legend />
                        <Bar dataKey="scans" fill="#8B5CF6" name="Scans" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="points" fill="#EC4899" name="Points" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="alternatives" fill="#06B6D4" name="Alternatives" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Enhanced Performance Analytics Section */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-8">
              {/* Eco Performance Radar */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="backdrop-blur-xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-200/20 shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl">
                        <Activity className="h-5 w-5 text-white" />
                      </div>
                      Eco Performance Radar
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <RadarChart data={[
                        {
                          metric: 'Scanning',
                          value: Math.min(stats.weeklyScans * 14, 100),
                          fullMark: 100,
                        },
                        {
                          metric: 'Consistency',
                          value: Math.min(stats.streakDays * 7, 100),
                          fullMark: 100,
                        },
                        {
                          metric: 'Impact',
                          value: Math.min(stats.co2Saved * 2, 100),
                          fullMark: 100,
                        },
                        {
                          metric: 'Discovery',
                          value: Math.min(stats.alternativesFound * 5, 100),
                          fullMark: 100,
                        },
                        {
                          metric: 'Engagement',
                          value: stats.ecoScore,
                          fullMark: 100,
                        },
                        {
                          metric: 'Achievement',
                          value: Math.min(stats.achievements.length * 20, 100),
                          fullMark: 100,
                        },
                      ]}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="metric" />
                        <PolarRadiusAxis angle={90} domain={[0, 100]} />
                        <Radar
                          name="Performance"
                          dataKey="value"
                          stroke="#06B6D4"
                          fill="#06B6D4"
                          fillOpacity={0.3}
                          strokeWidth={2}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Real-time Activity Feed */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="backdrop-blur-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-200/20 shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl">
                          <Heart className="h-5 w-5 text-white" />
                        </div>
                        Activity Pulse
                      </div>
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className="w-3 h-3 bg-green-500 rounded-full"
                      />
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {/* Real-time activity items */}
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-3 p-3 bg-green-50/30 dark:bg-green-900/20 rounded-lg"
                      >
                        <div className="p-2 bg-green-100 dark:bg-green-800 rounded-lg">
                          <Scan className="h-4 w-4 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">New scan completed</p>
                          <p className="text-xs text-slate-500">Just now</p>
                        </div>
                        <Badge className="bg-green-100 text-green-800">+{Math.floor(Math.random() * 50) + 10}</Badge>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="flex items-center gap-3 p-3 bg-blue-50/30 dark:bg-blue-900/20 rounded-lg"
                      >
                        <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg">
                          <TrendingUp className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Eco-score improved</p>
                          <p className="text-xs text-slate-500">2 minutes ago</p>
                        </div>
                        <Badge className="bg-blue-100 text-blue-800">+2 pts</Badge>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="flex items-center gap-3 p-3 bg-purple-50/30 dark:bg-purple-900/20 rounded-lg"
                      >
                        <div className="p-2 bg-purple-100 dark:bg-purple-800 rounded-lg">
                          <Award className="h-4 w-4 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Achievement unlocked</p>
                          <p className="text-xs text-slate-500">5 minutes ago</p>
                        </div>
                        <Badge className="bg-purple-100 text-purple-800">New</Badge>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="flex items-center gap-3 p-3 bg-orange-50/30 dark:bg-orange-900/20 rounded-lg"
                      >
                        <div className="p-2 bg-orange-100 dark:bg-orange-800 rounded-lg">
                          <Target className="h-4 w-4 text-orange-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Weekly goal progress</p>
                          <p className="text-xs text-slate-500">1 hour ago</p>
                        </div>
                        <Badge className="bg-orange-100 text-orange-800">{Math.round((stats.weeklyScans / 10) * 100)}%</Badge>
                      </motion.div>
                    </div>

                    {/* Quick Stats Bar */}
                    <div className="border-t pt-4 mt-4">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-lg font-bold text-emerald-600">{stats.weeklyScans}</div>
                          <div className="text-xs text-slate-500">This Week</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-blue-600">{stats.streakDays}</div>
                          <div className="text-xs text-slate-500">Day Streak</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-purple-600">{stats.achievements.length}</div>
                          <div className="text-xs text-slate-500">Achievements</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Categories & Achievements Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Category Distribution Chart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="backdrop-blur-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-200/20 shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl">
                        <Layers className="h-5 w-5 text-white" />
                      </div>
                      Scan Categories
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {chartData.categories.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={chartData.categories}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={120}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {chartData.categories.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={`hsl(${index * 45}, 70%, 60%)`} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="text-center py-8 text-slate-500">
                        <Layers className="h-16 w-16 mx-auto mb-4 opacity-50" />
                        <p className="text-lg mb-2">No category data yet</p>
                        <p className="text-sm">Start scanning to see category distribution!</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Enhanced Achievements */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="backdrop-blur-xl bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-200/20 shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-xl">
                        <Award className="h-5 w-5 text-white" />
                      </div>
                      Achievements ({stats.achievements.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {stats.achievements.length > 0 ? (
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {stats.achievements.map((achievement, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-gradient-to-r from-yellow-400/20 to-orange-400/20 p-4 rounded-xl border border-yellow-200/30 flex items-center gap-4 hover:shadow-lg transition-all duration-300"
                          >
                            <div className="text-3xl">{achievement.split(' ')[0]}</div>
                            <div className="flex-1">
                              <div className="font-medium text-slate-700 dark:text-slate-300">
                                {achievement.split(' ').slice(1).join(' ')}
                              </div>
                              <div className="text-xs text-slate-500 mt-1">
                                Unlocked recently
                              </div>
                            </div>
                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                              New
                            </Badge>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-slate-500">
                        <Award className="h-16 w-16 mx-auto mb-4 opacity-50" />
                        <p className="text-lg mb-2">No achievements yet</p>
                        <p className="text-sm">Start scanning to unlock achievements!</p>
                      </div>
                    )}

                    {/* Weekly Progress Bar */}
                    <div className="mt-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Weekly Goal Progress
                        </span>
                        <span className="text-sm font-bold">{stats.weeklyScans}/10</span>
                      </div>
                      <Progress 
                        value={Math.min((stats.weeklyScans / 10) * 100, 100)} 
                        className="h-3"
                      />
                      <div className="flex items-center justify-center gap-2 text-sm">
                        <Flame className="h-4 w-4 text-orange-500" />
                        <span className="font-semibold">
                          {stats.streakDays} day streak
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </TabsContent>

          {/* Impact Tab */}
          <TabsContent value="impact" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Environmental Impact */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="backdrop-blur-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-200/20 shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl">
                        <TreePine className="h-5 w-5 text-white" />
                      </div>
                      Environmental Impact
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-green-700 dark:text-green-400 mb-2">
                        {stats.co2Saved.toFixed(1)}kg
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">CO₂ Saved</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-green-50/50 dark:bg-green-900/20 rounded-xl">
                        <TreePine className="h-6 w-6 text-green-600 mx-auto mb-2" />
                        <div className="font-semibold">
                          {Math.round(stats.co2Saved / 22)} Trees
                        </div>
                        <div className="text-xs text-slate-500">Equivalent planted</div>
                      </div>
                      <div className="text-center p-4 bg-blue-50/50 dark:bg-blue-900/20 rounded-xl">
                        <Recycle className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                        <div className="font-semibold">
                          {stats.alternativesFound}
                        </div>
                        <div className="text-xs text-slate-500">Eco alternatives found</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Daily Eco Tip */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="backdrop-blur-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-200/20 shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl">
                        <Lightbulb className="h-5 w-5 text-white" />
                      </div>
                      Daily Eco Tip
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                        {dailyTip ? `${dailyTip.icon} ${dailyTip.title}: ${dailyTip.description}` : 'Loading eco tip...'}
                      </p>
                      
                      <div className="bg-gradient-to-r from-purple-400/20 to-pink-400/20 p-4 rounded-xl border border-purple-200/30">
                        <div className="flex items-center gap-2 mb-2">
                          <Target className="h-4 w-4 text-purple-500" />
                          <span className="font-semibold text-sm">Your Impact Level: {stats.impactLevel}</span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Keep scanning to increase your environmental impact and unlock new levels!
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Floating Action Menu */}
        <motion.div
          className="fixed bottom-6 right-6 z-50"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1, type: "spring", stiffness: 200 }}
        >
          <div className="relative">
            <motion.button
              className="w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full shadow-2xl flex items-center justify-center group"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              <motion.div
                animate={{ rotate: [0, 180, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <Sparkles className="h-6 w-6" />
              </motion.div>
              
              {/* Quick Action Tooltips */}
              <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                <div className="bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                  Back to top ✨
                </div>
              </div>
            </motion.button>
          </div>
        </motion.div>

        {/* Achievement Celebration */}
        <AnimatePresence>
          {showCelebration && (
            <motion.div
              className="fixed inset-0 pointer-events-none z-40 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onAnimationComplete={() => setTimeout(() => setShowCelebration(false), 3000)}
            >
              <ConfettiBurst isVisible={showCelebration} />
              <motion.div
                className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/20"
                initial={{ scale: 0.5, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.5, y: -50 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                <div className="text-center">
                  <motion.div
                    animate={{ rotate: [0, 15, -15, 0] }}
                    transition={{ duration: 0.5, repeat: 2 }}
                    className="text-6xl mb-4"
                  >
                    🏆
                  </motion.div>
                  <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
                    Achievement Unlocked!
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    You're making a real environmental impact! 🌍
                  </p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading Overlay */}
        <AnimatePresence>
          {refreshing && (
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-2xl flex flex-col items-center gap-4"
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
              >
                <LoadingSpinner />
                <div className="text-center">
                  <h3 className="font-semibold mb-1">Updating Dashboard</h3>
                  <p className="text-sm text-slate-500">Fetching latest data...</p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
