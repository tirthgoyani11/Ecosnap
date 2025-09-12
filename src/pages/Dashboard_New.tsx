import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { KPIStat } from "@/components/KPIStat";
import { ScoreRing } from "@/components/ScoreRing";
import { CountUpStat } from "@/components/CountUpStat";
import { AnimatedElement, StaggeredGrid } from "@/components/AnimatedComponents";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useStatsMock } from "@/hooks/useStatsMock";
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
  Recycle
} from "lucide-react";

interface DashboardStats {
  totalScans: number;
  totalCO2Saved: number;
  ecoScoreAverage: number;
  points: number;
  weeklyScans: number;
  monthlyGoal: number;
  alternativesFound: number;
  sustainableChoices: number;
}

export default function Dashboard() {
  const { stats, loading } = useStatsMock();
  const [userStats, setUserStats] = useState<DashboardStats>({
    totalScans: 0,
    totalCO2Saved: 0,
    ecoScoreAverage: 0,
    points: 0,
    weeklyScans: 0,
    monthlyGoal: 50,
    alternativesFound: 0,
    sustainableChoices: 0
  });

  useEffect(() => {
    document.title = "🌿 EcoSnap AI - Dashboard";
    
    // Simulate loading user stats
    if (!loading && stats) {
      setUserStats({
        totalScans: stats.totalScans || 127,
        totalCO2Saved: Math.round((stats.totalScans || 127) * 0.8),
        ecoScoreAverage: 78,
        points: (stats.totalScans || 127) * 10,
        weeklyScans: 12,
        monthlyGoal: 50,
        alternativesFound: Math.round((stats.totalScans || 127) * 0.6),
        sustainableChoices: Math.round((stats.totalScans || 127) * 0.4)
      });
    }
  }, [stats, loading]);

  const achievements = [
    { 
      icon: Scan, 
      title: "First Scan", 
      description: "Completed your first product scan",
      earned: true,
      date: "2 weeks ago"
    },
    { 
      icon: Leaf, 
      title: "Eco Warrior", 
      description: "Made 10 sustainable swaps",
      earned: true,
      date: "1 week ago"
    },
    { 
      icon: TreePine, 
      title: "Carbon Saver", 
      description: "Saved 50kg of CO2",
      earned: userStats.totalCO2Saved >= 50,
      date: userStats.totalCO2Saved >= 50 ? "Today" : null
    },
    { 
      icon: Target, 
      title: "Goal Crusher", 
      description: "Hit monthly scanning goal",
      earned: userStats.weeklyScans * 4 >= userStats.monthlyGoal,
      date: null
    }
  ];

  const recentActivity = [
    {
      type: "scan",
      product: "Organic Apple Juice",
      score: 85,
      action: "Found better alternative",
      time: "2 hours ago"
    },
    {
      type: "swap",
      product: "Eco-Friendly Detergent",
      score: 92,
      action: "Made sustainable choice",
      time: "5 hours ago"
    },
    {
      type: "achievement",
      product: "Carbon Saver Badge",
      score: null,
      action: "Achievement unlocked",
      time: "1 day ago"
    }
  ];

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          <div className="text-center">
            <LoadingSpinner />
            <p className="text-muted-foreground mt-4">Loading your eco-journey...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <AnimatedElement animation="fadeInUp" className="mb-8">
          <div className="text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              Your Eco Dashboard
            </h1>
            <p className="text-xl text-muted-foreground">
              Track your environmental impact and sustainable choices
            </p>
          </div>
        </AnimatedElement>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <AnimatedElement animation="scaleIn" delay={100}>
            <Card className="glass-card text-center">
              <CardContent className="p-6">
                <div className="space-y-2">
                  <Scan className="h-8 w-8 text-primary mx-auto" />
                  <CountUpStat 
                    value={userStats.totalScans}
                    duration={2}
                    className="text-2xl font-bold"
                  />
                  <p className="text-sm text-muted-foreground">Total Scans</p>
                </div>
              </CardContent>
            </Card>
          </AnimatedElement>

          <AnimatedElement animation="scaleIn" delay={200}>
            <Card className="glass-card text-center">
              <CardContent className="p-6">
                <div className="space-y-2">
                  <TreePine className="h-8 w-8 text-green-500 mx-auto" />
                  <CountUpStat 
                    value={userStats.totalCO2Saved}
                    duration={2}
                    suffix=" kg"
                    className="text-2xl font-bold text-green-600"
                  />
                  <p className="text-sm text-muted-foreground">CO₂ Saved</p>
                </div>
              </CardContent>
            </Card>
          </AnimatedElement>

          <AnimatedElement animation="scaleIn" delay={300}>
            <Card className="glass-card text-center">
              <CardContent className="p-6">
                <div className="space-y-2">
                  <Award className="h-8 w-8 text-yellow-500 mx-auto" />
                  <CountUpStat 
                    value={userStats.points}
                    duration={2}
                    className="text-2xl font-bold text-yellow-600"
                  />
                  <p className="text-sm text-muted-foreground">Eco Points</p>
                </div>
              </CardContent>
            </Card>
          </AnimatedElement>

          <AnimatedElement animation="scaleIn" delay={400}>
            <Card className="glass-card text-center">
              <CardContent className="p-6">
                <div className="space-y-2">
                  <BarChart3 className="h-8 w-8 text-secondary mx-auto" />
                  <CountUpStat 
                    value={userStats.ecoScoreAverage}
                    duration={2}
                    suffix="/100"
                    className="text-2xl font-bold text-secondary"
                  />
                  <p className="text-sm text-muted-foreground">Avg Eco Score</p>
                </div>
              </CardContent>
            </Card>
          </AnimatedElement>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Eco Score Overview */}
          <AnimatedElement animation="fadeInUp" delay={500}>
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  Your Eco Impact
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center mb-6">
                  <ScoreRing 
                    score={userStats.ecoScoreAverage} 
                    size="lg"
                  />
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Carbon Footprint</span>
                    <div className="flex items-center gap-2">
                      <Progress value={85} className="w-20" />
                      <span className="text-sm text-green-600">85%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Sustainable Choices</span>
                    <div className="flex items-center gap-2">
                      <Progress value={78} className="w-20" />
                      <span className="text-sm text-green-600">78%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Alternative Usage</span>
                    <div className="flex items-center gap-2">
                      <Progress value={65} className="w-20" />
                      <span className="text-sm text-green-600">65%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </AnimatedElement>

          {/* Weekly Goal Progress */}
          <AnimatedElement animation="fadeInUp" delay={600}>
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-secondary" />
                  Weekly Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-secondary mb-1">
                      {userStats.weeklyScans}/{Math.round(userStats.monthlyGoal / 4)}
                    </div>
                    <p className="text-muted-foreground">Scans this week</p>
                  </div>
                  
                  <Progress 
                    value={(userStats.weeklyScans / (userStats.monthlyGoal / 4)) * 100} 
                    className="h-3"
                  />
                  
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                        {userStats.alternativesFound}
                      </div>
                      <p className="text-sm text-muted-foreground">Alternatives Found</p>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-600">
                        {userStats.sustainableChoices}
                      </div>
                      <p className="text-sm text-muted-foreground">Sustainable Swaps</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </AnimatedElement>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <AnimatedElement animation="fadeInUp" delay={700}>
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center gap-4 p-3 rounded-lg bg-muted/30">
                      <div className="p-2 rounded-full bg-primary/10">
                        {activity.type === 'scan' && <Scan className="h-4 w-4 text-primary" />}
                        {activity.type === 'swap' && <Recycle className="h-4 w-4 text-green-500" />}
                        {activity.type === 'achievement' && <Award className="h-4 w-4 text-yellow-500" />}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{activity.product}</p>
                        <p className="text-sm text-muted-foreground">{activity.action}</p>
                      </div>
                      <div className="text-right">
                        {activity.score && (
                          <Badge variant="outline" className="mb-1">
                            {activity.score}/100
                          </Badge>
                        )}
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </AnimatedElement>

          {/* Achievements */}
          <AnimatedElement animation="fadeInUp" delay={800}>
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-yellow-500" />
                  Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4">
                  {achievements.map((achievement, index) => (
                    <div 
                      key={index} 
                      className={`flex items-center gap-4 p-3 rounded-lg border transition-all ${
                        achievement.earned 
                          ? 'bg-green-50 border-green-200 dark:bg-green-900/10 dark:border-green-800' 
                          : 'bg-muted/30 border-muted opacity-50'
                      }`}
                    >
                      <div className={`p-2 rounded-full ${
                        achievement.earned ? 'bg-green-100 text-green-600' : 'bg-muted text-muted-foreground'
                      }`}>
                        <achievement.icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{achievement.title}</p>
                        <p className="text-sm text-muted-foreground">{achievement.description}</p>
                      </div>
                      {achievement.earned && achievement.date && (
                        <Badge variant="secondary" className="text-xs">
                          {achievement.date}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </AnimatedElement>
        </div>

        {/* Call to Action */}
        <AnimatedElement animation="fadeInUp" delay={900} className="mt-8 text-center">
          <Card className="glass-card">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-4">Ready for More Impact?</h3>
              <p className="text-muted-foreground mb-6">
                Continue your eco-journey by scanning more products and discovering sustainable alternatives.
              </p>
              <Button size="lg" className="group smooth-hover">
                <Scan className="h-5 w-5 mr-2" />
                Start Scanning
                <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardContent>
          </Card>
        </AnimatedElement>
      </div>
    </div>
  );
}
