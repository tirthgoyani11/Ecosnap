import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Progress } from "../../components/ui/progress";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../components/EnhancedThemeProvider";
import { 
  Trophy, Crown, Star, Flame, Zap, Users, ArrowUp, Sparkles, Leaf, Recycle, 
  Cloud, TreePine, Bike, Car, Flower, Flag, Shield, Footprints, Globe, Sprout
} from 'lucide-react';
import { useLeaderboard } from "../hooks/useLeaderboard";
import { useProfile } from "../hooks/useDatabase";
import { useEcoProfile } from "../hooks/useEcoProfile";
import { supabase } from "../integrations/supabase/client";

const cn = (...classes: (string | undefined | false)[]) => {
  return classes.filter(Boolean).join(' ');
};

// Real User Profile Interface based on Supabase schema
interface RealUserProfile {
  id: string;
  user_id: string;
  current_rank: number;
  previous_rank?: number;
  total_points: number;
  weekly_points: number;
  monthly_points: number;
  scan_streak: number;
  max_streak: number;
  last_scan_date?: string;
  achievement_level: 'Beginner' | 'Novice' | 'Explorer' | 'Expert' | 'Master' | 'Legend';
  badges_earned: string[];
  prizes_claimed: string[];
  user_name: string;
  avatar_url?: string;
  total_scans?: number;
  eco_score_avg?: number;
  created_at: string;
  updated_at: string;
}

// Enhanced Dynamic Avatar Evolution System 🌱➡️🌳
export const getEcoAvatar = (achievementLevel: string, points: number, scanStreak: number = 0) => {
  // Achievement level mapping to numeric levels for avatar evolution
  const levelMap = {
    'Beginner': 1,
    'Novice': 2, 
    'Explorer': 3,
    'Expert': 4,
    'Master': 5,
    'Legend': 6
  };
  
  const numericLevel = levelMap[achievementLevel as keyof typeof levelMap] || 1;
  
  const treeEvolution = [
    { emoji: '🌱', name: 'Seedling', desc: 'Just sprouted!', minPoints: 0 },
    { emoji: '🌿', name: 'Young Plant', desc: 'Growing strong!', minPoints: 100 },
    { emoji: '🌳', name: 'Mighty Tree', desc: 'Forest guardian!', minPoints: 500 },
    { emoji: '🌲', name: 'Ancient Forest', desc: 'Wisdom of ages!', minPoints: 1000 },
    { emoji: '🌍', name: 'Earth Guardian', desc: 'Planet protector!', minPoints: 2500 }
  ];
  
  const mobilityEvolution = [
    { emoji: '👟', name: 'Walker', desc: 'Every step counts!', minPoints: 0 },
    { emoji: '🚲', name: 'Cyclist', desc: 'Pedal power!', minPoints: 300 },
    { emoji: '⚡', name: 'E-Biker', desc: 'Electric rides!', minPoints: 800 },
    { emoji: '🚗', name: 'Electric Driver', desc: 'Zero emissions!', minPoints: 1500 },
    { emoji: '🚀', name: 'Eco Pioneer', desc: 'Future transport!', minPoints: 3000 }
  ];

  const ecoEvolution = [
    { emoji: '♻️', name: 'Recycler', desc: 'Waste warrior!', minPoints: 0 },
    { emoji: '🍃', name: 'Green Guardian', desc: 'Nature lover!', minPoints: 500 },
    { emoji: '🛡️', name: 'Eco Defender', desc: 'Earth protector!', minPoints: 1200 },
    { emoji: '👑', name: 'Eco Monarch', desc: 'Ultimate eco royalty!', minPoints: 2000 },
    { emoji: '🌟', name: 'Eco Legend', desc: 'Mythical eco hero!', minPoints: 5000 }
  ];

  // Choose evolution path based on points and streak
  let evolution = treeEvolution;
  if (points > 500 && scanStreak > 5) evolution = mobilityEvolution;
  if (points > 1000 && scanStreak > 10) evolution = ecoEvolution;

  // Find the appropriate avatar based on points
  let selectedAvatar = evolution[0];
  for (let i = evolution.length - 1; i >= 0; i--) {
    if (points >= evolution[i].minPoints) {
      selectedAvatar = evolution[i];
      break;
    }
  }

  return {
    ...selectedAvatar,
    level: numericLevel,
    evolutionPath: evolution === treeEvolution ? 'tree' : evolution === mobilityEvolution ? 'mobility' : 'eco'
  };
};

// Enhanced Calculate Eco Impact 📊 - Based on Real Scan Data
export const calculateEcoImpact = (points: number, totalScans: number, weeklyPoints: number) => {
  // More realistic calculations based on actual eco-impact research
  const baseMultiplier = {
    co2PerPoint: 0.08, // kg CO2 per point (more realistic)
    treesPerScan: 0.02, // trees planted per scan (based on actual tree planting costs)
    plasticPerPoint: 0.03, // kg plastic recycled per point
    waterPerPoint: 1.2, // liters water saved per point
    energyPerWeeklyPoint: 0.5 // kWh energy saved per weekly point
  };

  return {
    co2Reduced: Math.round(points * baseMultiplier.co2PerPoint * 100) / 100, // Round to 2 decimals
    treesPlanted: Math.floor(totalScans * baseMultiplier.treesPerScan),
    plasticRecycled: Math.round(points * baseMultiplier.plasticPerPoint * 100) / 100,
    waterSaved: Math.round(points * baseMultiplier.waterPerPoint),
    energySaved: Math.round(weeklyPoints * baseMultiplier.energyPerWeeklyPoint * 100) / 100
  };
};

// Animated Eco Avatar Component ✨
const EcoAvatar = ({ user, size = 'md' }: { user: any; size?: 'sm' | 'md' | 'lg' }) => {
  const avatar = getEcoAvatar(user?.achievement_level || 'Beginner', user?.total_points || 0, user?.scan_streak || 0);
  const sizes = {
    sm: 'w-8 h-8 text-lg',
    md: 'w-12 h-12 text-xl', 
    lg: 'w-16 h-16 text-2xl'
  };

  return (
    <motion.div
      whileHover={{ scale: 1.1, rotate: 5 }}
      className={cn(
        "rounded-full bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center relative",
        sizes[size]
      )}
      title={`${avatar.name}: ${avatar.desc}`}
    >
      <span className="z-10">{avatar.emoji}</span>
      {avatar.level > 3 && (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 border-2 border-yellow-400 rounded-full opacity-70"
        />
      )}
      {user?.total_points > 1000 && (
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute -top-1 -right-1"
        >
          <Star className="w-3 h-3 text-yellow-500" />
        </motion.div>
      )}
    </motion.div>
  );
};

// Weekly Eco Hero Spotlight 👑
const WeeklySpotlight = ({ user }: { user: any }) => (
  <motion.div
    initial={{ scale: 0.8, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    className="relative mb-8"
  >
    <Card className="bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 text-white border-none shadow-2xl overflow-hidden">
      <CardContent className="p-6 text-center relative">
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 via-orange-500/20 to-pink-500/20 animate-pulse" />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-4 -right-4 text-6xl opacity-20"
        >
          👑
        </motion.div>
        
        {Array.from({ length: 5 }, (_, i) => (
          <motion.div
            key={i}
            animate={{ 
              y: [-10, -20, -10],
              x: [0, 5, 0],
              opacity: [0.3, 1, 0.3]
            }}
            transition={{ 
              duration: 2 + i * 0.5, 
              repeat: Infinity,
              delay: i * 0.4 
            }}
            className="absolute text-2xl"
            style={{
              left: `${20 + i * 15}%`,
              top: `${10 + i * 5}%`
            }}
          >
            ✨
          </motion.div>
        ))}
        
        <div className="relative z-10">
          <Sparkles className="w-8 h-8 mx-auto mb-3 text-yellow-200" />
          <h3 className="text-2xl font-bold mb-2">🌟 Eco Hero of the Week 🌟</h3>
          <div className="flex items-center justify-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl">
              {getEcoAvatar(user?.achievement_level || 'Beginner', user?.total_points || 0, user?.scan_streak || 0).emoji}
            </div>
            <div>
              <p className="text-xl font-bold">{user?.user_name || 'Anonymous Hero'}</p>
              <p className="text-yellow-200">
                {(user?.total_points || 0).toLocaleString()} eco points 🌍
              </p>
              <p className="text-sm text-yellow-100 mt-1">
                {getEcoAvatar(user?.achievement_level || 'Beginner', user?.total_points || 0, user?.scan_streak || 0).desc}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

// Impact Visualization Dashboard 📊
const ImpactDashboard = ({ user }: { user: any }) => {
  const impact = calculateEcoImpact(user?.total_points || 0, user?.total_scans || 0, user?.weekly_points || 0);
  
  const impactCards = [
    {
      title: 'CO₂ Reduced',
      value: `${impact.co2Reduced}kg`,
      icon: Cloud,
      gradient: 'from-green-400 to-green-600',
      progress: Math.min((impact.co2Reduced / 50) * 100, 100), // Progress toward 50kg goal
      emoji: '🌬️'
    },
    {
      title: 'Trees Planted',
      value: impact.treesPlanted.toString(),
      icon: TreePine,
      gradient: 'from-green-500 to-emerald-600',
      treeDisplay: Array.from({ length: Math.min(impact.treesPlanted, 10) }, () => '🌳').join(''),
      emoji: '🌳'
    },
    {
      title: 'Plastic Recycled',
      value: `${impact.plasticRecycled}kg`,
      icon: Recycle,
      gradient: 'from-blue-500 to-cyan-600',
      progress: Math.min((impact.plasticRecycled / 25) * 100, 100), // Progress toward 25kg goal
      emoji: '♻️'
    },
    {
      title: 'Energy Saved',
      value: `${impact.energySaved}kWh`,
      gradient: 'from-yellow-500 to-orange-600',
      progress: Math.min((impact.energySaved / 100) * 100, 100), // Progress toward 100kWh goal
      emoji: '⚡'
    }
  ];
  
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {impactCards.map((card, index) => (
        <motion.div
          key={card.title}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ scale: 1.05, y: -5 }}
          className={`bg-gradient-to-br ${card.gradient} rounded-xl p-4 text-white relative overflow-hidden`}
        >
          <div className="absolute inset-0 opacity-10">
            {card.icon && <card.icon className="w-full h-full" />}
          </div>
          
          <div className="relative z-10">
            {card.icon ? (
              <card.icon className="w-8 h-8 mb-2 opacity-80" />
            ) : (
              <div className="text-2xl mb-2">{card.emoji}</div>
            )}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className="text-2xl font-bold"
            >
              {card.value}
            </motion.div>
            <div className="text-sm opacity-90">{card.title}</div>
            
            {card.treeDisplay && (
              <div className="text-xs mt-1 opacity-75">
                {card.treeDisplay}
              </div>
            )}
            
            {card.progress !== undefined && (
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ delay: 1 + index * 0.1, duration: 1 }}
              >
                <Progress value={card.progress} className="mt-2 h-2" />
              </motion.div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

// Top 3 Eco Podium 🏆
const EcoPodium = ({ topThree }: { topThree: any[] }) => {
  const podiumOrder = [1, 0, 2];
  const heights = ['h-32', 'h-40', 'h-28'];
  const positions = ['🥈 2nd', '🥇 1st', '🥉 3rd'];
  const gradients = [
    'from-gray-300 to-gray-400',
    'from-yellow-400 to-yellow-500', 
    'from-orange-400 to-orange-500'
  ];

  return (
    <div className="flex items-end justify-center gap-4 mb-8">
      {podiumOrder.map((index, displayIndex) => {
        const user = topThree[index];
        if (!user) return null;

        return (
          <div
            key={user.user_id}
            className="text-center relative"
          >
            <div className="mb-4 p-4 bg-white rounded-xl shadow-lg relative border-2 border-transparent hover:border-yellow-300 transition-all duration-300">
              <EcoAvatar user={user} size="lg" />
              <div className="mt-2">
                <h4 className="font-bold text-gray-800 truncate">
                  {user.user_name || 'Anonymous'}
                </h4>
                <p className="text-sm text-gray-600">
                  {(user.total_points || 0).toLocaleString()} pts
                </p>
                <Badge className="text-xs mt-1 bg-green-100 text-green-700">
                  {getEcoAvatar(user?.achievement_level || 'Beginner', user?.total_points || 0, user?.scan_streak || 0).name}
                </Badge>
                {/* Static Eco Royalty Badge */}
                {user.total_points > 1000 && (
                  <div className="mt-2">
                    <Badge className="bg-yellow-100 text-yellow-700 text-xs">
                      👑 Eco Royalty - {positions[displayIndex]}
                    </Badge>
                  </div>
                )}
              </div>
              
              {index === 0 && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Crown className="w-8 h-8 text-yellow-500 drop-shadow-lg" />
                </div>
              )}
            </div>

            <div className={cn(
              "rounded-t-xl relative overflow-hidden",
              heights[displayIndex],
              `bg-gradient-to-t ${gradients[displayIndex]}`
            )}>
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white font-bold text-xl">
                {positions[displayIndex]}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Enhanced Leaderboard Row
const EnhancedLeaderboardRow = ({ user, index, isCurrentUser }: {
  user: any;
  index: number;
  isCurrentUser: boolean;
}) => {
  const impact = calculateEcoImpact(user?.total_points || 0, user?.total_scans || 0, user?.weekly_points || 0);
  const avatar = getEcoAvatar(user?.achievement_level || 'Beginner', user?.total_points || 0, user?.scan_streak || 0);

  return (
    <motion.div
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ 
        delay: index * 0.1,
        type: "spring",
        stiffness: 100
      }}
      whileHover={{ scale: 1.02, x: 10 }}
      className={cn(
        "p-4 rounded-xl mb-3 transition-all duration-300",
        isCurrentUser 
          ? "bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-300 shadow-lg ring-2 ring-blue-200" 
          : "bg-white border border-gray-200 hover:shadow-lg hover:border-green-300"
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <motion.div
            whileHover={{ scale: 1.2, rotate: 10 }}
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg relative",
              index < 3 ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-white" : "bg-gray-100 text-gray-600"
            )}
          >
            {index + 4}
            {index < 3 && (
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 bg-yellow-400 rounded-full opacity-30"
              />
            )}
          </motion.div>

          <div className="flex items-center space-x-3">
            <EcoAvatar user={user} size="md" />
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-gray-800">
                  {user.user_name || 'Anonymous'}
                  {isCurrentUser && (
                    <motion.span
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="ml-2 text-blue-600 font-bold"
                    >
                      (You!) 🎯
                    </motion.span>
                  )}
                </h3>
                <Badge className="text-xs bg-green-100 text-green-700">
                  {avatar.name}
                </Badge>
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span>{(user.total_points || 0).toLocaleString()} points</span>
                <span>{user.total_scans || 0} scans</span>
                <span className="text-green-600">🌱 {impact.treesPlanted} trees</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {user.scan_streak > 0 && (
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Badge className="bg-orange-100 text-orange-700">
                🔥 {user.scan_streak} day streak
              </Badge>
            </motion.div>
          )}
          
          <Badge className="bg-purple-100 text-purple-700">
            {user.achievement_level || 'Beginner'}
          </Badge>

          {user.total_points > 1000 && (
            <Badge className="bg-yellow-100 text-yellow-700">
              👑 Eco Royalty
            </Badge>
          )}
        </div>
      </div>

      <div className="mt-3">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Progress to next level</span>
          <span>{((user.total_points || 0) % 1000)} / 1000</span>
        </div>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ delay: 0.5 + index * 0.1, duration: 1 }}
        >
          <Progress value={((user.total_points || 0) % 1000) / 10} className="h-2" />
        </motion.div>
      </div>
    </motion.div>
  );
};

// Race Track View 🏁
const RaceTrackView = ({ leaderboard }: { leaderboard: any[] }) => {
  const topUsers = leaderboard?.slice(0, 5) || [];
  const maxPoints = topUsers[0]?.total_points || 1;

  return (
    <Card className="mb-6 overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Flag className="w-5 h-5 text-blue-600" />
          🏁 Eco Race Track - Watch Champions Race!
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {topUsers.map((user, index) => {
            const progress = ((user.total_points || 0) / maxPoints) * 100;
            const avatar = getEcoAvatar(user?.achievement_level || 'Beginner', user?.total_points || 0, user?.scan_streak || 0);
            
            return (
              <div key={user.user_id} className="relative">
                <div className="flex items-center space-x-3 mb-2">
                  <motion.span 
                    whileHover={{ scale: 1.2 }}
                    className="w-8 text-sm font-bold bg-gray-100 rounded-full h-8 flex items-center justify-center"
                  >
                    #{index + 1}
                  </motion.span>
                  <motion.span 
                    animate={{ 
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity,
                      delay: index * 0.2
                    }}
                    className="text-2xl"
                  >
                    {avatar.emoji}
                  </motion.span>
                  <span className="font-medium text-gray-800">{user.user_name}</span>
                  <Badge className="text-xs bg-green-100 text-green-700">
                    {avatar.name}
                  </Badge>
                  <span className="text-sm text-gray-600 ml-auto">
                    {(user.total_points || 0).toLocaleString()} pts
                  </span>
                </div>
                
                <div className="relative h-6 bg-gray-200 rounded-full overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200" />
                  
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ 
                      duration: 2, 
                      delay: index * 0.3,
                      ease: "easeOut"
                    }}
                    className={cn(
                      "h-full rounded-full relative overflow-hidden",
                      index === 0 ? "bg-gradient-to-r from-yellow-400 to-orange-500" :
                      index === 1 ? "bg-gradient-to-r from-gray-400 to-gray-500" :
                      index === 2 ? "bg-gradient-to-r from-orange-400 to-red-500" :
                      "bg-gradient-to-r from-green-400 to-blue-500"
                    )}
                  >
                    <motion.div
                      animate={{ x: [0, 20] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    />
                  </motion.div>
                  
                  <motion.div
                    initial={{ x: 0 }}
                    animate={{ x: `${Math.max(progress * 4, 0)}px` }}
                    transition={{ 
                      duration: 2, 
                      delay: index * 0.3,
                      ease: "easeOut"
                    }}
                    className="absolute top-0 -mt-1 text-2xl"
                    style={{ zIndex: 10 - index }}
                  >
                    <motion.span
                      animate={{ 
                        y: [0, -3, 0],
                        rotate: [0, 10, -10, 0]
                      }}
                      transition={{ 
                        duration: 0.5, 
                        repeat: Infinity,
                        delay: index * 0.1
                      }}
                    >
                      {avatar.emoji}
                    </motion.span>
                  </motion.div>
                  
                  <div className="absolute right-0 top-0 h-full w-1 bg-black opacity-50" />
                  <div className="absolute right-1 top-0 h-full flex items-center">
                    <span className="text-xs">🏁</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

// Main Ultimate Eco-Leaderboard Component 🌍
export default function EcoLeaderboardUltimate() {
  const { user } = useAuth();
  const { setTheme } = useTheme();
  const { data: leaderboard, isLoading, error, refetch } = useLeaderboard('all', 50);
  const { ecoProfile, loading: profileLoading, updatePoints, addBadge } = useEcoProfile();
  
  const [viewMode, setViewMode] = useState<'leaderboard' | 'racetrack'>('leaderboard');
  const [showCelebration, setShowCelebration] = useState(false);

  // Force light theme for leaderboard page
  useEffect(() => {
    setTheme('light');
  }, [setTheme]);

  // Find current user in leaderboard data or use eco profile data
  const currentUserData = leaderboard?.find(u => u.user_id === user?.id) || ecoProfile;

  const topThree = leaderboard?.slice(0, 3) || [];
  const remainingUsers = leaderboard?.slice(3) || [];

  useEffect(() => {
    if (currentUserData?.total_points && currentUserData.total_points % 1000 === 0 && currentUserData.total_points > 0) {
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 4000);
    }
  }, [currentUserData?.total_points]);

  // Loading state includes both leaderboard and profile loading
  const isLoadingData = isLoading || profileLoading;

  if (isLoadingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 p-6 light">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <LoadingSpinner />
            </motion.div>
            <motion.p 
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="mt-4 text-gray-600"
            >
              Loading the ultimate eco-leaderboard... 🌱
            </motion.p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 p-6 light">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-6xl mb-4"
            >
              🌱
            </motion.div>
            <h3 className="text-2xl font-semibold mb-2">Oops! Eco-Leaderboard Needs Some Love</h3>
            <p className="text-gray-600 mb-6">
              Our eco-warriors are working hard to fix this! Please try again. 🔧
            </p>
            <Button 
              onClick={() => refetch()} 
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg"
            >
              <ArrowUp className="w-4 h-4 mr-2" />
              Retry & Save the Planet! 🌍
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 p-6 light">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-2">
        
          </h1>
          <p className="text-gray-600 text-lg">
            Where every scan saves the planet! Dynamic avatars evolve as you grow! 🌟
          </p>
        </div>

        {topThree[0] && <WeeklySpotlight user={topThree[0]} />}

        {currentUserData && <ImpactDashboard user={currentUserData} />}

        <div className="flex justify-center mb-6">
          <div className="bg-white rounded-xl p-1 shadow-lg border-2 border-gray-100">
            <Button
              variant={viewMode === 'leaderboard' ? 'default' : 'ghost'}
              onClick={() => setViewMode('leaderboard')}
              className="rounded-lg font-semibold"
            >
              <Trophy className="w-4 h-4 mr-2" />
              🏆 Leaderboard
            </Button>
            <Button
              variant={viewMode === 'racetrack' ? 'default' : 'ghost'}
              onClick={() => setViewMode('racetrack')}
              className="rounded-lg font-semibold"
            >
              <Flag className="w-4 h-4 mr-2" />
              🏁 Race Track
            </Button>
          </div>
        </div>

        {viewMode === 'racetrack' ? (
          <div>
            <RaceTrackView leaderboard={leaderboard || []} />
          </div>
        ) : (
          <div>
            <EcoPodium topThree={topThree} />

            <Card className="border-2 border-green-200 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-green-600" />
                  🌿 Eco Warriors Rankings - Everyone's Making a Difference!
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-green-300">
                  {remainingUsers.length > 0 ? (
                    remainingUsers.map((user, index) => (
                      <EnhancedLeaderboardRow
                        key={user.user_id}
                        user={user}
                        index={index}
                        isCurrentUser={user.user_id === currentUserData?.user_id}
                      />
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <div>
                        <Sprout className="w-16 h-16 mx-auto mb-4 text-green-400" />
                      </div>
                      <p>Be the first eco-warrior! Start scanning to save the planet! 🌱</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <AnimatePresence>
          {showCelebration && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            >
              <div className="text-center">
                <motion.div
                  animate={{ 
                    rotate: 360,
                    scale: [1, 1.2, 1]
                  }}
                  transition={{ 
                    rotate: { duration: 2, repeat: Infinity },
                    scale: { duration: 1, repeat: Infinity }
                  }}
                  className="text-9xl mb-4"
                >
                  🎉
                </motion.div>
                <motion.h2
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="text-4xl font-bold text-white mb-2"
                >
                  MILESTONE ACHIEVED!
                </motion.h2>
                <p className="text-xl text-white">You're an Eco Champion! 🌍👑</p>
              </div>
              
              <div className="absolute inset-0 pointer-events-none">
                {Array.from({ length: 30 }, (_, i) => (
                  <motion.div
                    key={i}
                    initial={{ 
                      y: -100, 
                      x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000), 
                      opacity: 1,
                      rotate: 0
                    }}
                    animate={{ 
                      y: (typeof window !== 'undefined' ? window.innerHeight : 1000) + 100, 
                      opacity: 0,
                      rotate: 360
                    }}
                    transition={{ 
                      duration: 3, 
                      delay: Math.random() * 2,
                      ease: "easeOut"
                    }}
                    className="absolute text-3xl"
                  >
                    {['🌱', '🌳', '♻️', '🌍', '⚡', '🏆', '👑', '🎉'][Math.floor(Math.random() * 8)]}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}