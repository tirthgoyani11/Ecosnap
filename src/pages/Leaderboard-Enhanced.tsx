import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  Trophy,
  Crown,
  Medal,
  Star,
  Flame,
  Zap,
  Users,
  TrendingUp,
  Award,
  Gift,
  Target,
  Calendar,
  ArrowUp,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLeaderboard, useProfile } from '@/hooks/useDatabase';

// Helper function to get rank icon with proper styling
const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return <Crown className="w-6 h-6 text-yellow-500" />;
    case 2:
      return <Medal className="w-6 h-6 text-gray-400" />;
    case 3:
      return <Award className="w-6 h-6 text-amber-600" />;
    default:
      return <Trophy className="w-5 h-5 text-slate-400" />;
  }
};

// Helper function to get badge color
const getBadgeColor = (badge: string) => {
  switch (badge) {
    case 'Legend':
      return 'bg-gradient-to-r from-purple-600 to-pink-600 text-white';
    case 'Expert':
      return 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white';
    case 'Advanced':
      return 'bg-gradient-to-r from-green-600 to-emerald-600 text-white';
    case 'Intermediate':
      return 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white';
    default:
      return 'bg-slate-200 text-slate-800';
  }
};

// Helper function to get user initials
const getUserInitials = (name: string) => {
  if (!name) return 'U';
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

// Stats Card Component
const StatsCard = ({ icon: Icon, title, value, subtitle, color }: {
  icon: React.ElementType;
  title: string;
  value: string | number;
  subtitle?: string;
  color: string;
}) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    className="p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20"
  >
    <div className="flex items-center space-x-3">
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
        <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
        {subtitle && (
          <p className="text-xs text-gray-500 dark:text-gray-500">{subtitle}</p>
        )}
      </div>
    </div>
  </motion.div>
);

// Achievement Badge Component
const AchievementBadge = ({ title, description, unlocked, icon: Icon }: {
  title: string;
  description: string;
  unlocked: boolean;
  icon: React.ElementType;
}) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    className={cn(
      "p-4 rounded-xl border-2 transition-all duration-300",
      unlocked 
        ? "bg-gradient-to-br from-green-50 to-emerald-50 border-green-200" 
        : "bg-gray-50 border-gray-200 opacity-60"
    )}
  >
    <div className="flex items-center space-x-3">
      <div className={cn(
        "p-2 rounded-lg",
        unlocked 
          ? "bg-green-100 text-green-600" 
          : "bg-gray-100 text-gray-400"
      )}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <h4 className={cn(
          "font-semibold",
          unlocked ? "text-green-800" : "text-gray-500"
        )}>
          {title}
        </h4>
        <p className={cn(
          "text-sm",
          unlocked ? "text-green-600" : "text-gray-400"
        )}>
          {description}
        </p>
      </div>
    </div>
    {unlocked && (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="absolute -top-2 -right-2"
      >
        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
          <Sparkles className="w-3 h-3 text-white" />
        </div>
      </motion.div>
    )}
  </motion.div>
);

// Podium Component for top 3
const PodiumCard = ({ user, position }: { 
  user: any; 
  position: number;
}) => {
  const { user: currentUser } = useAuth();
  const isCurrentUser = currentUser?.id === user.user_id;
  
  const heights = ['h-40', 'h-32', 'h-28'];
  const podiumColors = [
    'from-yellow-400 to-yellow-600',
    'from-gray-300 to-gray-500',
    'from-amber-400 to-amber-600'
  ];
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: position * 0.2 }}
      className={cn(
        "flex flex-col items-center relative",
        isCurrentUser && "ring-4 ring-blue-300 rounded-2xl p-2"
      )}
    >
      {isCurrentUser && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-blue-600 text-white px-3 py-1">
            You!
          </Badge>
        </div>
      )}
      
      {/* Avatar with rank indicator */}
      <div className="relative mb-4">
        <Avatar className="w-20 h-20 border-4 border-white shadow-xl">
          <AvatarImage src={user.avatar} alt={user.name} />
          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-lg">
            {getUserInitials(user.name)}
          </AvatarFallback>
        </Avatar>
        <div className="absolute -top-3 -right-3 bg-white rounded-full p-2 shadow-lg">
          {getRankIcon(user.rank)}
        </div>
      </div>

      {/* User Info */}
      <div className="text-center mb-4 px-2">
        <h3 className="font-bold text-lg text-gray-800 truncate max-w-24">
          {user.name || 'Anonymous'}
        </h3>
        <p className="text-sm text-gray-600 truncate max-w-24">
          @{user.username || 'user'}
        </p>
        <Badge className={cn("mt-2 text-xs", getBadgeColor(user.badge))}>
          {user.badge}
        </Badge>
      </div>

      {/* Podium */}
      <div 
        className={cn(
          "w-full max-w-[140px] bg-gradient-to-t rounded-t-xl flex flex-col items-center justify-end p-4 relative overflow-hidden",
          podiumColors[position],
          heights[position]
        )}
      >
        {/* Decorative elements */}
        <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px]" />
        
        {/* Content */}
        <div className="text-center text-white relative z-10">
          <div className="font-bold text-3xl mb-1">
            {user.points?.toLocaleString() || 0}
          </div>
          <div className="text-sm opacity-90">points</div>
          <div className="text-xs opacity-75 mt-1">
            {user.scans || 0} scans
          </div>
        </div>

        {/* Podium number */}
        <div className="absolute bottom-2 right-2 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
          <span className="text-white font-bold text-lg">
            {position + 1}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

// Regular leaderboard row with enhanced styling
const LeaderboardRow = ({ user, index }: { 
  user: any; 
  index: number;
}) => {
  const { user: currentUser } = useAuth();
  const isCurrentUser = currentUser?.id === user.user_id;
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className={cn(
        "mb-3 hover:shadow-lg transition-all duration-300 border-l-4",
        isCurrentUser 
          ? "border-l-blue-500 bg-blue-50/50 shadow-md ring-2 ring-blue-200" 
          : "border-l-gray-200 hover:border-l-green-400"
      )}>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            {/* Rank with styling */}
            <div className={cn(
              "flex items-center justify-center w-12 h-12 rounded-full font-bold text-lg shadow-sm",
              user.rank <= 10 
                ? "bg-gradient-to-br from-green-400 to-green-600 text-white" 
                : "bg-gray-100 text-gray-700"
            )}>
              {user.rank}
            </div>

            {/* Avatar */}
            <Avatar className="w-14 h-14 border-2 border-white shadow-md">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                {getUserInitials(user.name || 'Anonymous')}
              </AvatarFallback>
            </Avatar>

            {/* User Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-3 mb-1">
                <h3 className="font-semibold text-gray-800 truncate">
                  {user.name || 'Anonymous User'}
                </h3>
                <Badge className={cn("text-xs flex-shrink-0", getBadgeColor(user.badge))}>
                  {user.badge}
                </Badge>
                {isCurrentUser && (
                  <Badge className="bg-blue-600 text-white text-xs">
                    You
                  </Badge>
                )}
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span>@{user.username || 'user'}</span>
                <span>•</span>
                <span>{user.scans || 0} scans</span>
                <span>•</span>
                <span className="flex items-center">
                  <Flame className="w-3 h-3 mr-1 text-orange-500" />
                  {user.ecoScore?.toFixed(1) || '0.0'} eco score
                </span>
              </div>
            </div>

            {/* Points with trend indicator */}
            <div className="text-right flex-shrink-0">
              <div className="flex items-center space-x-2">
                <div className="text-right">
                  <div className="font-bold text-xl text-gray-800">
                    {user.points?.toLocaleString() || 0}
                  </div>
                  <div className="text-sm text-gray-600">points</div>
                </div>
                <ArrowUp className="w-4 h-4 text-green-500" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default function Leaderboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: leaderboard, isLoading, error, refetch } = useLeaderboard(50);
  const { data: profile } = useProfile();
  
  const [selectedTab, setSelectedTab] = useState<'leaderboard' | 'achievements'>('leaderboard');
  const [showCelebration, setShowCelebration] = useState(false);

  // Find current user in leaderboard
  const currentUserRank = leaderboard?.find(u => u.user_id === user?.id);

  // Sample achievements (you can expand this)
  const achievements = [
    {
      id: 1,
      title: 'First Scan',
      description: 'Complete your first product scan',
      icon: Target,
      unlocked: (profile?.total_scans || 0) >= 1
    },
    {
      id: 2,
      title: 'Eco Warrior',
      description: 'Scan 10 eco-friendly products',
      icon: Flame,
      unlocked: (profile?.total_scans || 0) >= 10
    },
    {
      id: 3,
      title: 'Point Master',
      description: 'Earn 1000 points',
      icon: Star,
      unlocked: (profile?.points || 0) >= 1000
    },
    {
      id: 4,
      title: 'Sustainability Hero',
      description: 'Save 50kg CO2',
      icon: Award,
      unlocked: (profile?.total_co2_saved || 0) >= 50
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <LoadingSpinner />
            <p className="mt-4 text-gray-600">Loading leaderboard data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-2xl font-semibold mb-2">Unable to load leaderboard</h3>
            <p className="text-gray-600 mb-6">
              Please check your connection and try again.
            </p>
            <Button onClick={() => refetch()} className="bg-blue-600 hover:bg-blue-700">
              <ArrowUp className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const topThree = leaderboard?.slice(0, 3) || [];
  const remaining = leaderboard?.slice(3) || [];
  const totalUsers = leaderboard?.length || 0;
  const totalPoints = leaderboard?.reduce((sum, user) => sum + (user.points || 0), 0) || 0;
  const totalScans = leaderboard?.reduce((sum, user) => sum + (user.scans || 0), 0) || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header with tabs */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center mb-6">
            <Trophy className="w-10 h-10 text-yellow-500 mr-4" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
              EcoSnap Leaderboard
            </h1>
            <Trophy className="w-10 h-10 text-yellow-500 ml-4" />
          </div>
          
          <p className="text-gray-600 text-lg mb-8">
            Compete with eco-warriors and climb the sustainability rankings!
          </p>

          {/* Tab Navigation */}
          <div className="flex justify-center mb-8">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-1 border border-white/30">
              <Button
                variant={selectedTab === 'leaderboard' ? 'default' : 'ghost'}
                onClick={() => setSelectedTab('leaderboard')}
                className={cn(
                  "px-6 py-3 rounded-lg transition-all",
                  selectedTab === 'leaderboard' 
                    ? "bg-white shadow-md text-gray-800" 
                    : "text-gray-600 hover:text-gray-800"
                )}
              >
                <Trophy className="w-4 h-4 mr-2" />
                Rankings
              </Button>
              <Button
                variant={selectedTab === 'achievements' ? 'default' : 'ghost'}
                onClick={() => setSelectedTab('achievements')}
                className={cn(
                  "px-6 py-3 rounded-lg transition-all ml-2",
                  selectedTab === 'achievements' 
                    ? "bg-white shadow-md text-gray-800" 
                    : "text-gray-600 hover:text-gray-800"
                )}
              >
                <Award className="w-4 h-4 mr-2" />
                Achievements
              </Button>
            </div>
          </div>
        </motion.div>

        {selectedTab === 'leaderboard' ? (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <StatsCard
                icon={Users}
                title="Active Users"
                value={totalUsers}
                color="bg-blue-600"
              />
              <StatsCard
                icon={TrendingUp}
                title="Total Points"
                value={totalPoints.toLocaleString()}
                color="bg-green-600"
              />
              <StatsCard
                icon={Zap}
                title="Total Scans"
                value={totalScans.toLocaleString()}
                color="bg-purple-600"
              />
              <StatsCard
                icon={Flame}
                title="Your Rank"
                value={currentUserRank ? `#${currentUserRank.rank}` : 'Unranked'}
                subtitle={currentUserRank ? `${currentUserRank.points?.toLocaleString()} pts` : 'Start scanning!'}
                color="bg-orange-600"
              />
            </div>

            {/* Top 3 Podium */}
            {topThree.length > 0 && (
              <Card className="mb-8 overflow-hidden">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-center mb-8 flex items-center justify-center">
                    <Crown className="w-6 h-6 text-yellow-500 mr-2" />
                    Top Eco Champions
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end justify-items-center">
                    {/* 2nd Place */}
                    {topThree[1] && (
                      <PodiumCard user={topThree[1]} position={1} />
                    )}
                    
                    {/* 1st Place */}
                    {topThree[0] && (
                      <PodiumCard user={topThree[0]} position={0} />
                    )}
                    
                    {/* 3rd Place */}
                    {topThree[2] && (
                      <PodiumCard user={topThree[2]} position={2} />
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Remaining Rankings */}
            {remaining.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Star className="w-5 h-5 mr-2 text-yellow-500" />
                    Complete Rankings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {remaining.map((user, index) => (
                      <LeaderboardRow key={user.id} user={user} index={index} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        ) : (
          /* Achievements Tab */
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Award className="w-6 h-6 mr-2 text-purple-600" />
                Your Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {achievements.map((achievement) => (
                  <AchievementBadge
                    key={achievement.id}
                    title={achievement.title}
                    description={achievement.description}
                    unlocked={achievement.unlocked}
                    icon={achievement.icon}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
