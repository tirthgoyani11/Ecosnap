import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { 
  Trophy,
  Crown,
  Medal,
  Star,
  Flame,
  Zap,
  Users,
  TrendingUp,
  Award
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLeaderboard } from '@/hooks/useDatabase';

// Helper function to get rank icon
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
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

// Podium component for top 3
const PodiumCard = ({ user, position }: { 
  user: any; 
  position: number;
}) => {
  const heights = ['h-32', 'h-24', 'h-20'];
  const heights_mobile = ['h-20', 'h-16', 'h-12'];
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: position * 0.2 }}
      className="flex flex-col items-center"
    >
      {/* Avatar */}
      <div className="relative mb-3">
        <Avatar className="w-16 h-16 border-4 border-white shadow-lg">
          <AvatarImage src={user.avatar} alt={user.name} />
          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold">
            {getUserInitials(user.name)}
          </AvatarFallback>
        </Avatar>
        <div className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-lg">
          {getRankIcon(user.rank)}
        </div>
      </div>

      {/* User Info */}
      <div className="text-center mb-3">
        <h3 className="font-bold text-lg text-gray-800">{user.name}</h3>
        <p className="text-sm text-gray-600">@{user.username}</p>
        <Badge className={cn("mt-2 text-xs", getBadgeColor(user.badge))}>
          {user.badge}
        </Badge>
      </div>

      {/* Podium */}
      <div 
        className={cn(
          "w-full max-w-[120px] bg-gradient-to-t rounded-t-lg flex flex-col items-center justify-end p-4",
          position === 0 
            ? "from-yellow-400 to-yellow-600" 
            : position === 1 
            ? "from-gray-300 to-gray-500" 
            : "from-amber-400 to-amber-600",
          heights[position],
          `md:${heights[position]}`,
          heights_mobile[position]
        )}
      >
        <div className="text-center text-white">
          <div className="font-bold text-2xl">{user.points.toLocaleString()}</div>
          <div className="text-xs opacity-90">points</div>
        </div>
      </div>
    </motion.div>
  );
};

// Regular leaderboard row
const LeaderboardRow = ({ user, index }: { 
  user: any; 
  index: number;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="mb-3 hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            {/* Rank */}
            <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full font-bold text-gray-700">
              {user.rank}
            </div>

            {/* Avatar */}
            <Avatar className="w-12 h-12">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                {getUserInitials(user.name)}
              </AvatarFallback>
            </Avatar>

            {/* User Info */}
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-gray-800">{user.name}</h3>
                <Badge className={cn("text-xs", getBadgeColor(user.badge))}>
                  {user.badge}
                </Badge>
              </div>
              <p className="text-sm text-gray-600">@{user.username}</p>
            </div>

            {/* Stats */}
            <div className="text-right">
              <div className="font-bold text-lg text-gray-800">
                {user.points.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">
                {user.scans} scans
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default function Leaderboard() {
  const { data: leaderboard, isLoading, error, refetch } = useLeaderboard(20);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <LoadingSpinner />
            <p className="mt-4 text-gray-600">Loading leaderboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-semibold mb-2">Failed to load leaderboard</h3>
            <p className="text-gray-600 mb-4">
              Unable to fetch leaderboard data. Please check your connection.
            </p>
            <button 
              onClick={() => refetch()} 
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!leaderboard || leaderboard.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏆</div>
            <h3 className="text-xl font-semibold mb-2">No leaderboard data yet</h3>
            <p className="text-gray-600">
              Be the first to start scanning and earning points!
            </p>
          </div>
        </div>
      </div>
    );
  }

  const topThree = leaderboard.slice(0, 3);
  const remaining = leaderboard.slice(3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center mb-4">
            <Trophy className="w-8 h-8 text-yellow-500 mr-3" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Leaderboard
            </h1>
            <Trophy className="w-8 h-8 text-yellow-500 ml-3" />
          </div>
          <p className="text-gray-600 text-lg">
            See how you rank among eco-conscious scanners
          </p>
          
          {/* Stats */}
          <div className="flex items-center justify-center space-x-8 mt-6">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Users className="w-5 h-5 text-blue-600 mr-2" />
                <span className="font-bold text-2xl text-gray-800">
                  {leaderboard.length}
                </span>
              </div>
              <p className="text-sm text-gray-600">Active Users</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className="w-5 h-5 text-green-600 mr-2" />
                <span className="font-bold text-2xl text-gray-800">
                  {leaderboard.reduce((sum, user) => sum + user.points, 0).toLocaleString()}
                </span>
              </div>
              <p className="text-sm text-gray-600">Total Points</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Zap className="w-5 h-5 text-purple-600 mr-2" />
                <span className="font-bold text-2xl text-gray-800">
                  {leaderboard.reduce((sum, user) => sum + user.scans, 0).toLocaleString()}
                </span>
              </div>
              <p className="text-sm text-gray-600">Total Scans</p>
            </div>
          </div>
        </motion.div>

        {/* Top 3 Podium */}
        {topThree.length > 0 && (
          <Card className="mb-8 p-6">
            <CardContent className="p-0">
              <div className="grid grid-cols-3 gap-4 items-end justify-items-center">
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

        {/* Remaining Users */}
        {remaining.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Star className="w-5 h-5 mr-2 text-yellow-500" />
              All Rankings
            </h2>
            
            {remaining.map((user, index) => (
              <LeaderboardRow key={user.id} user={user} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
