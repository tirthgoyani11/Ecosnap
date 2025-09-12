import { useState, useEffect, createElement } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CountUpStat } from "@/components/CountUpStat";
import { ScoreRing } from "@/components/ScoreRing";
import { AnimatedElement, StaggeredGrid } from "@/components/AnimatedComponents";
import { useAuth } from "@/contexts/AuthContext";
import { StatsService } from "@/lib/stats-service";
import {
  Leaf,
  TrendingUp,
  Award,
  Users,
  Scan,
  Calendar,
  Target,
  Zap,
  Globe,
  Heart,
  Star,
  ArrowRight,
  BarChart3,
  PieChart,
  Activity,
  CheckCircle,
  Sparkles,
  Trophy,
  Flame,
  Camera
} from "lucide-react";
import { Link } from "react-router-dom";

export default function DashboardEnhanced() {
  const { user, loading } = useAuth();
  const [selectedTimeframe, setSelectedTimeframe] = useState("month");
  const [currentTip, setCurrentTip] = useState(0);
  const [userStats, setUserStats] = useState(StatsService.getUserStats());

  // Update stats when component mounts and periodically
  useEffect(() => {
    const updateStats = () => {
      setUserStats(StatsService.getUserStats());
    };
    
    // Update immediately
    updateStats();
    
    // Update every 2 seconds to catch changes
    const interval = setInterval(updateStats, 2000);
    
    return () => clearInterval(interval);
  }, []);

  // Real KPI data from StatsService
  const kpiData = {
    totalScans: userStats.totalScans,
    ecoScore: userStats.totalScans > 0 ? Math.floor((userStats.ecoPoints / userStats.totalScans) * 0.8) : 0, // Approximate eco score
    pointsEarned: userStats.ecoPoints,
    carbonSaved: userStats.co2Saved,
    streak: 15, // Mock streak (could be calculated from lastScanDate)
    rank: 142, // Mock rank (would need leaderboard implementation)
    communityImpact: userStats.totalScans > 0 ? (userStats.ecoPoints / userStats.totalScans) * 10 : 0
  };

  // Get real recent scans from user stats (mock for now since not in interface)
  const recentScans = [
    { id: 1, product: "Organic Shampoo", score: 89, timestamp: "2 hours ago", category: "Personal Care" },
    { id: 2, product: "Bamboo Toothbrush", score: 95, timestamp: "5 hours ago", category: "Oral Care" },
    { id: 3, product: "Reusable Water Bottle", score: 92, timestamp: "1 day ago", category: "Lifestyle" },
    { id: 4, product: "Eco-Friendly Detergent", score: 87, timestamp: "2 days ago", category: "Home Care" },
  ];

  // Real achievements based on user stats
  const achievements = [
    { 
      id: 1, 
      title: "Eco Warrior", 
      description: "Scanned 100+ products", 
      icon: Trophy, 
      unlocked: userStats.totalScans >= 100, 
      rarity: "gold" 
    },
    { 
      id: 2, 
      title: "Streak Master", 
      description: "15-day scanning streak", 
      icon: Flame, 
      unlocked: userStats.totalScans >= 15, // Use totalScans as proxy for streak
      rarity: "silver" 
    },
    { 
      id: 3, 
      title: "Community Helper", 
      description: "Helped 50+ users", 
      icon: Users, 
      unlocked: userStats.totalScans >= 50, 
      rarity: "bronze" 
    },
    { 
      id: 4, 
      title: "Carbon Saver", 
      description: "Saved 10kg CO2", 
      icon: Leaf, 
      unlocked: userStats.co2Saved >= 10, 
      rarity: "platinum" 
    },
  ];

  const ecoTips = [
    {
      title: "Reduce Plastic Usage",
      description: "Choose products with minimal or recyclable packaging",
      impact: "High",
      category: "Packaging",
      icon: Globe
    },
    {
      title: "Support Local Brands",
      description: "Local products have lower transportation carbon footprints",
      impact: "Medium",
      category: "Transportation",
      icon: Heart
    },
    {
      title: "Check Certifications",
      description: "Look for certified organic or fair-trade labels",
      impact: "High",
      category: "Sustainability",
      icon: Star
    },
    {
      title: "Buy in Bulk",
      description: "Reduce packaging waste by purchasing larger quantities",
      impact: "Medium",
      category: "Waste",
      icon: Target
    }
  ];

  const weeklyGoals = [
    { title: "Scan 20 Products", progress: 85, target: 20, current: 17, icon: Scan },
    { title: "Find 5 Alternatives", progress: 60, target: 5, current: 3, icon: Sparkles },
    { title: "Earn 200 Points", progress: 92, target: 200, current: 184, icon: Award },
    { title: "Share 3 Reviews", progress: 33, target: 3, current: 1, icon: Users },
  ];

  // Auto-rotate eco tips
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % ecoTips.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-500";
    if (score >= 70) return "text-yellow-500";
    return "text-red-500";
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 90) return "bg-green-500/10 text-green-500 border-green-500/20";
    if (score >= 70) return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
    return "bg-red-500/10 text-red-500 border-red-500/20";
  };

  const rarityColors = {
    bronze: "from-amber-600 to-amber-400",
    silver: "from-gray-400 to-gray-200", 
    gold: "from-yellow-400 to-yellow-200",
    platinum: "from-purple-400 to-pink-300"
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 p-4">
      <div className="container mx-auto max-w-7xl">
        
        {/* Enhanced Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Welcome back, {user?.user_metadata?.name || 'Eco Warrior'}! 👋
              </h1>
              <p className="text-muted-foreground text-lg mt-2">
                Track your sustainable journey and make a positive impact
              </p>
            </div>
            <div className="flex gap-3">
              <Link to="/scanner">
                <Button className="premium-button group">
                  <Camera className="mr-2 h-4 w-4 group-hover:rotate-12 transition-transform" />
                  Quick Scan
                </Button>
              </Link>
              <Button variant="outline" className="glass-button">
                <BarChart3 className="mr-2 h-4 w-4" />
                Analytics
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Enhanced KPI Cards */}
        <StaggeredGrid className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
          <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}>
            <Card className="glass-card hover:shadow-lg transition-all duration-300 group">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Scan className="h-8 w-8 text-blue-500" />
                  <Badge className="bg-blue-500/10 text-blue-500">+12%</Badge>
                </div>
                <CountUpStat 
                  value={kpiData.totalScans} 
                  className="text-2xl md:text-3xl font-bold mb-1" 
                />
                <p className="text-muted-foreground text-sm">Products Scanned</p>
                <div className="w-full bg-muted/30 rounded-full h-2 mt-2">
                  <div className="bg-gradient-to-r from-blue-500 to-cyan-400 h-2 rounded-full w-3/4 animate-pulse"></div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}>
            <Card className="glass-card hover:shadow-lg transition-all duration-300 group">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Leaf className="h-8 w-8 text-green-500" />
                  <Badge className="bg-green-500/10 text-green-500">+5%</Badge>
                </div>
                <div className="flex items-center gap-3">
                  <ScoreRing score={kpiData.ecoScore} size="sm" />
                  <div>
                    <CountUpStat 
                      value={kpiData.ecoScore} 
                      className="text-2xl md:text-3xl font-bold" 
                      suffix="%" 
                    />
                    <p className="text-muted-foreground text-sm">Eco Score</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}>
            <Card className="glass-card hover:shadow-lg transition-all duration-300 group">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Award className="h-8 w-8 text-purple-500" />
                  <Badge className="bg-purple-500/10 text-purple-500">+89</Badge>
                </div>
                <CountUpStat 
                  value={kpiData.pointsEarned} 
                  className="text-2xl md:text-3xl font-bold mb-1" 
                />
                <p className="text-muted-foreground text-sm">Points Earned</p>
                <div className="flex items-center gap-1 mt-2">
                  <Sparkles className="h-3 w-3 text-purple-500" />
                  <span className="text-xs text-purple-500">Level 7 - Expert</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}>
            <Card className="glass-card hover:shadow-lg transition-all duration-300 group">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Globe className="h-8 w-8 text-emerald-500" />
                  <Badge className="bg-emerald-500/10 text-emerald-500">2.1kg</Badge>
                </div>
                <CountUpStat 
                  value={kpiData.carbonSaved} 
                  decimals={1}
                  suffix=" kg" 
                  className="text-2xl md:text-3xl font-bold mb-1" 
                />
                <p className="text-muted-foreground text-sm">CO₂ Saved</p>
                <p className="text-xs text-emerald-500 mt-1">🌱 Equal to planting 3 trees</p>
              </CardContent>
            </Card>
          </motion.div>
        </StaggeredGrid>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          
          {/* Weekly Goals */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Weekly Goals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {weeklyGoals.map((goal, index) => (
                    <motion.div
                      key={goal.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className="space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <goal.icon className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium text-sm">{goal.title}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {goal.current}/{goal.target}
                        </span>
                      </div>
                      <div className="w-full bg-muted/30 rounded-full h-2">
                        <motion.div 
                          className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${goal.progress}%` }}
                          transition={{ delay: 0.5 + index * 0.1, duration: 0.8 }}
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Scans */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="glass-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" />
                    Recent Scans
                  </CardTitle>
                  <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                    View All
                    <ArrowRight className="ml-1 h-3 w-3" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentScans.map((scan, index) => (
                    <motion.div
                      key={scan.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      className="flex items-center justify-between p-3 rounded-lg glass-button hover:bg-white/10 transition-colors group cursor-pointer"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-sm group-hover:text-primary transition-colors">
                          {scan.product}
                        </p>
                        <p className="text-xs text-muted-foreground">{scan.category} • {scan.timestamp}</p>
                      </div>
                      <Badge className={`${getScoreBadgeColor(scan.score)} border`}>
                        {scan.score}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Achievements */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-primary" />
                  Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {achievements.map((achievement, index) => (
                    <motion.div
                      key={achievement.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      className={`relative p-4 rounded-lg text-center transition-all duration-300 ${
                        achievement.unlocked 
                          ? 'glass-button hover:scale-105 cursor-pointer' 
                          : 'opacity-50 grayscale'
                      }`}
                    >
                      <div className={`absolute inset-0 bg-gradient-to-br ${rarityColors[achievement.rarity as keyof typeof rarityColors]} opacity-10 rounded-lg`} />
                      <achievement.icon className={`h-8 w-8 mx-auto mb-2 ${
                        achievement.unlocked ? 'text-primary' : 'text-muted-foreground'
                      }`} />
                      <h4 className="font-semibold text-xs mb-1">{achievement.title}</h4>
                      <p className="text-xs text-muted-foreground">{achievement.description}</p>
                      {achievement.unlocked && (
                        <CheckCircle className="absolute top-1 right-1 h-4 w-4 text-green-500" />
                      )}
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Enhanced Eco Tips Carousel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="glass-card relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-transparent to-emerald-500/5" />
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary animate-pulse" />
                Daily Eco Tip
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentTip}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.5 }}
                  className="relative z-10"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-full bg-primary/10">
                      {createElement(ecoTips[currentTip].icon, {
                        className: "h-6 w-6 text-primary"
                      })}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{ecoTips[currentTip].title}</h3>
                        <Badge className={`
                          ${ecoTips[currentTip].impact === 'High' ? 'bg-red-500/10 text-red-500' : 
                            ecoTips[currentTip].impact === 'Medium' ? 'bg-yellow-500/10 text-yellow-500' : 
                            'bg-green-500/10 text-green-500'}
                        `}>
                          {ecoTips[currentTip].impact} Impact
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mb-3">{ecoTips[currentTip].description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-primary font-medium">
                          Category: {ecoTips[currentTip].category}
                        </span>
                        <div className="flex gap-1">
                          {ecoTips.map((_, index) => (
                            <div
                              key={index}
                              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                                index === currentTip ? 'bg-primary w-6' : 'bg-muted-foreground/30'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>

        {/* Community Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-8"
        >
          <Card className="glass-card bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5">
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Community Impact
                </h3>
                <p className="text-muted-foreground">Together, we're making a difference</p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <Users className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                  <CountUpStat value={10247} className="text-2xl font-bold" />
                  <p className="text-sm text-muted-foreground">Active Users</p>
                </div>
                <div className="text-center">
                  <Scan className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <CountUpStat value={156892} className="text-2xl font-bold" />
                  <p className="text-sm text-muted-foreground">Products Scanned</p>
                </div>
                <div className="text-center">
                  <Globe className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                  <CountUpStat value={2847} decimals={1} suffix=" kg" className="text-2xl font-bold" />
                  <p className="text-sm text-muted-foreground">CO₂ Saved</p>
                </div>
                <div className="text-center">
                  <Award className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                  <CountUpStat value={892456} className="text-2xl font-bold" />
                  <p className="text-sm text-muted-foreground">Points Earned</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
