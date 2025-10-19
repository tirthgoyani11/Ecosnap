import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Recycle, 
  TrendingUp, 
  Award, 
  Leaf,
  Droplets,
  Zap,
  Target,
  Calendar,
  Flame
} from 'lucide-react';

export interface RecyclingStats {
  totalItemsRecycled: number;
  co2Saved: number;
  waterSaved: number;
  energySaved: number;
  recyclingStreak: number;
  pointsFromRecycling: number;
  monthlyGoal: number;
  achievements: Array<{
    id: string;
    name: string;
    description: string;
    icon: string;
    unlocked: boolean;
  }>;
}

interface RecyclingTrackerProps {
  stats: RecyclingStats;
  compact?: boolean;
}

export const RecyclingTracker = ({ stats, compact = false }: RecyclingTrackerProps) => {
  const [progressToGoal, setProgressToGoal] = useState(0);

  useEffect(() => {
    setProgressToGoal((stats.totalItemsRecycled / stats.monthlyGoal) * 100);
  }, [stats.totalItemsRecycled, stats.monthlyGoal]);

  if (compact) {
    return (
      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-green-500 rounded-lg">
                <Recycle className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-semibold">Recycling Impact</p>
                <p className="text-xs text-muted-foreground">
                  {stats.totalItemsRecycled} items recycled
                </p>
              </div>
            </div>
            <Badge className="bg-green-600 text-white">
              +{stats.pointsFromRecycling} pts
            </Badge>
          </div>
          
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-2 bg-white dark:bg-slate-900 rounded-lg">
              <Leaf className="h-4 w-4 mx-auto mb-1 text-green-600" />
              <p className="text-sm font-bold">{stats.co2Saved}kg</p>
              <p className="text-xs text-muted-foreground">CO₂</p>
            </div>
            <div className="p-2 bg-white dark:bg-slate-900 rounded-lg">
              <Droplets className="h-4 w-4 mx-auto mb-1 text-blue-600" />
              <p className="text-sm font-bold">{stats.waterSaved}L</p>
              <p className="text-xs text-muted-foreground">Water</p>
            </div>
            <div className="p-2 bg-white dark:bg-slate-900 rounded-lg">
              <Zap className="h-4 w-4 mx-auto mb-1 text-yellow-600" />
              <p className="text-sm font-bold">{stats.energySaved}</p>
              <p className="text-xs text-muted-foreground">kWh</p>
            </div>
          </div>

          {stats.recyclingStreak > 0 && (
            <div className="mt-4 p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-orange-600" />
                <span className="font-semibold text-orange-900 dark:text-orange-100">
                  {stats.recyclingStreak} Day Streak! 🔥
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Stats Card */}
      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-2 border-green-200 dark:border-green-800">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-3 bg-green-500 rounded-full">
                <Recycle className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl">Recycling Impact</h2>
                <p className="text-sm text-muted-foreground">Your environmental contribution</p>
              </div>
            </div>
            <Badge className="bg-green-600 text-white text-lg px-4 py-2">
              +{stats.pointsFromRecycling} Points
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Impact Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-white dark:bg-slate-900 border-green-200 dark:border-green-800">
              <CardContent className="pt-6 text-center">
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full w-fit mx-auto mb-3">
                  <Leaf className="h-8 w-8 text-green-600" />
                </div>
                <p className="text-3xl font-bold text-green-600">{stats.co2Saved} kg</p>
                <p className="text-sm text-muted-foreground mt-1">CO₂ Saved</p>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-slate-900 border-blue-200 dark:border-blue-800">
              <CardContent className="pt-6 text-center">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full w-fit mx-auto mb-3">
                  <Droplets className="h-8 w-8 text-blue-600" />
                </div>
                <p className="text-3xl font-bold text-blue-600">{stats.waterSaved} L</p>
                <p className="text-sm text-muted-foreground mt-1">Water Conserved</p>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-slate-900 border-yellow-200 dark:border-yellow-800">
              <CardContent className="pt-6 text-center">
                <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-full w-fit mx-auto mb-3">
                  <Zap className="h-8 w-8 text-yellow-600" />
                </div>
                <p className="text-3xl font-bold text-yellow-600">{stats.energySaved} kWh</p>
                <p className="text-sm text-muted-foreground mt-1">Energy Saved</p>
              </CardContent>
            </Card>
          </div>

          {/* Monthly Goal Progress */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-green-600" />
                  <span className="font-semibold">Monthly Goal</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {stats.totalItemsRecycled} / {stats.monthlyGoal} items
                </span>
              </div>
              <Progress value={progressToGoal} className="h-3" />
              <p className="text-xs text-muted-foreground mt-2">
                {progressToGoal >= 100 
                  ? '🎉 Goal achieved! Keep up the great work!' 
                  : `${Math.round(progressToGoal)}% complete - ${stats.monthlyGoal - stats.totalItemsRecycled} items to go!`
                }
              </p>
            </CardContent>
          </Card>

          {/* Recycling Streak */}
          {stats.recyclingStreak > 0 && (
            <Card className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white/20 rounded-full">
                    <Flame className="h-8 w-8" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.recyclingStreak} Days</p>
                    <p className="text-sm text-orange-50">Recycling Streak! Keep it going! 🔥</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Achievements */}
      {stats.achievements && stats.achievements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-600" />
              Recycling Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {stats.achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    achievement.unlocked
                      ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20'
                      : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/20 opacity-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`text-3xl ${achievement.unlocked ? 'grayscale-0' : 'grayscale'}`}>
                      {achievement.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">{achievement.name}</h4>
                      <p className="text-xs text-muted-foreground">{achievement.description}</p>
                      {achievement.unlocked && (
                        <Badge className="mt-2 bg-yellow-500 text-white">Unlocked!</Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tips Card */}
      <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Boost Your Impact
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <Recycle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <span>Recycle daily to maintain your streak and earn bonus points!</span>
            </li>
            <li className="flex items-start gap-2">
              <Award className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <span>Complete achievements to unlock special rewards and badges.</span>
            </li>
            <li className="flex items-start gap-2">
              <Calendar className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <span>Reach your monthly goal to get 200 bonus eco-points!</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};
