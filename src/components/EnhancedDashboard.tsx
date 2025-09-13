import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  Leaf, 
  Award, 
  Users, 
  ShoppingCart,
  Zap,
  Globe,
  Star,
  ChevronRight,
  Plus,
  Filter,
  Calendar,
  Download
} from 'lucide-react';

// Import our enhanced components
import {
  DisplayText,
  TitleText,
  HeadingText,
  BodyText,
  CaptionText,
  EnhancedCard,
  EnhancedButton,
  EnhancedBadge,
  EcoScoreDisplay,
  StarRating,
  LoadingSkeleton,
  FeatureHighlight
} from './ui/EnhancedComponents';

import { cn, themeClasses, responsiveUtils, layoutUtils } from '../lib/utils';

// ===============================
// DASHBOARD STATISTICS
// ===============================

interface StatCardProps {
  title: string;
  value: string | number;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  icon: React.ReactNode;
  className?: string;
}

const StatCard = ({ title, value, change, trend, icon, className }: StatCardProps) => {
  const trendColors = {
    up: 'text-emerald-600 dark:text-emerald-400',
    down: 'text-red-600 dark:text-red-400',
    neutral: 'text-slate-600 dark:text-slate-400',
  };

  const trendBgs = {
    up: 'bg-emerald-50 dark:bg-emerald-900/20',
    down: 'bg-red-50 dark:bg-red-900/20',
    neutral: 'bg-slate-50 dark:bg-slate-900/20',
  };

  return (
    <EnhancedCard variant="elevated" className={className}>
      <div className="flex items-center justify-between">
        <div>
          <CaptionText contrast="medium" className="mb-1">
            {title}
          </CaptionText>
          <HeadingText className="mb-2">
            {value}
          </HeadingText>
          <div className={cn(
            'inline-flex items-center rounded-full px-2 py-1 text-xs font-medium',
            trendColors[trend],
            trendBgs[trend]
          )}>
            <TrendingUp className={cn(
              'mr-1 h-3 w-3',
              trend === 'down' && 'rotate-180'
            )} />
            {change}
          </div>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>
      </div>
    </EnhancedCard>
  );
};

// ===============================
// RECENT ACTIVITY COMPONENT
// ===============================

interface ActivityItem {
  id: string;
  type: 'scan' | 'achievement' | 'comparison';
  title: string;
  description: string;
  time: string;
  ecoScore?: number;
}

const ActivityFeed = () => {
  const activities: ActivityItem[] = [
    {
      id: '1',
      type: 'scan',
      title: 'Scanned Eco-Friendly Detergent',
      description: 'Great choice! This product has excellent sustainability ratings.',
      time: '2 hours ago',
      ecoScore: 85,
    },
    {
      id: '2',
      type: 'achievement',
      title: 'Eco Warrior Badge Earned',
      description: 'You\'ve made 50 sustainable product choices this month!',
      time: '1 day ago',
    },
    {
      id: '3',
      type: 'comparison',
      title: 'Product Comparison Completed',
      description: 'Compared 3 alternatives for organic pasta.',
      time: '2 days ago',
    },
    {
      id: '4',
      type: 'scan',
      title: 'Scanned Reusable Water Bottle',
      description: 'Excellent environmental impact - perfect for reducing plastic waste.',
      time: '3 days ago',
      ecoScore: 92,
    },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'scan':
        return <Zap className="h-4 w-4" />;
      case 'achievement':
        return <Award className="h-4 w-4" />;
      case 'comparison':
        return <BarChart3 className="h-4 w-4" />;
      default:
        return <Leaf className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'scan':
        return 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400';
      case 'achievement':
        return 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400';
      case 'comparison':
        return 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400';
      default:
        return 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400';
    }
  };

  return (
    <EnhancedCard>
      <div className="flex items-center justify-between mb-6">
        <HeadingText>Recent Activity</HeadingText>
        <EnhancedButton variant="ghost" size="sm">
          View All
          <ChevronRight className="ml-1 h-4 w-4" />
        </EnhancedButton>
      </div>

      <div className="space-y-4">
        {activities.map((activity, index) => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div className={cn(
              'flex h-8 w-8 items-center justify-center rounded-full',
              getActivityColor(activity.type)
            )}>
              {getActivityIcon(activity.type)}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <BodyText className="font-medium truncate">
                  {activity.title}
                </BodyText>
                {activity.ecoScore && (
                  <EcoScoreDisplay 
                    score={activity.ecoScore} 
                    size="sm" 
                    showLabel={false}
                  />
                )}
              </div>
              <CaptionText className="mt-1">
                {activity.description}
              </CaptionText>
              <CaptionText contrast="low" className="mt-1">
                {activity.time}
              </CaptionText>
            </div>
          </motion.div>
        ))}
      </div>
    </EnhancedCard>
  );
};

// ===============================
// QUICK ACTIONS COMPONENT
// ===============================

const QuickActions = () => {
  const actions = [
    {
      title: 'Scan Product',
      description: 'Analyze a new product',
      icon: <Zap className="h-5 w-5" />,
      color: 'bg-blue-500',
      href: '/scanner',
    },
    {
      title: 'Browse Discover',
      description: 'Find sustainable products',
      icon: <Globe className="h-5 w-5" />,
      color: 'bg-emerald-500',
      href: '/discover',
    },
    {
      title: 'View Leaderboard',
      description: 'See your eco ranking',
      icon: <Award className="h-5 w-5" />,
      color: 'bg-amber-500',
      href: '/leaderboard',
    },
    {
      title: 'Bulk Analysis',
      description: 'Analyze multiple items',
      icon: <BarChart3 className="h-5 w-5" />,
      color: 'bg-purple-500',
      href: '/bulk',
    },
  ];

  return (
    <EnhancedCard>
      <HeadingText className="mb-6">Quick Actions</HeadingText>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {actions.map((action, index) => (
          <motion.a
            key={action.title}
            href={action.href}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              'flex items-center space-x-3 p-4 rounded-lg',
              'bg-muted/50 hover:bg-muted transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'
            )}
          >
            <div className={cn(
              'flex h-10 w-10 items-center justify-center rounded-lg text-white',
              action.color
            )}>
              {action.icon}
            </div>
            <div>
              <BodyText className="font-medium">
                {action.title}
              </BodyText>
              <CaptionText contrast="medium">
                {action.description}
              </CaptionText>
            </div>
          </motion.a>
        ))}
      </div>
    </EnhancedCard>
  );
};

// ===============================
// ENVIRONMENTAL IMPACT SUMMARY
// ===============================

const ImpactSummary = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const impacts = [
    {
      metric: 'CO2 Saved',
      value: '127 kg',
      description: 'This month',
      icon: <Leaf className="h-5 w-5" />,
    },
    {
      metric: 'Plastic Avoided',
      value: '45 items',
      description: 'This month',
      icon: <Globe className="h-5 w-5" />,
    },
    {
      metric: 'Eco Score',
      value: '8.4/10',
      description: 'Average',
      icon: <Star className="h-5 w-5" />,
    },
  ];

  if (isLoading) {
    return (
      <EnhancedCard>
        <HeadingText className="mb-6">Environmental Impact</HeadingText>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center space-x-3">
              <LoadingSkeleton className="h-10 w-10 rounded-lg" />
              <div className="space-y-2 flex-1">
                <LoadingSkeleton className="h-4 w-24" />
                <LoadingSkeleton className="h-3 w-16" />
              </div>
            </div>
          ))}
        </div>
      </EnhancedCard>
    );
  }

  return (
    <EnhancedCard>
      <div className="flex items-center justify-between mb-6">
        <HeadingText>Environmental Impact</HeadingText>
        <EnhancedButton variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" />
          Export
        </EnhancedButton>
      </div>

      <div className="space-y-4">
        {impacts.map((impact, index) => (
          <motion.div
            key={impact.metric}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center space-x-3 p-3 rounded-lg bg-muted/30"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400">
              {impact.icon}
            </div>
            <div className="flex-1">
              <BodyText className="font-medium">
                {impact.value}
              </BodyText>
              <CaptionText contrast="medium">
                {impact.metric} • {impact.description}
              </CaptionText>
            </div>
          </motion.div>
        ))}
      </div>
    </EnhancedCard>
  );
};

// ===============================
// MAIN DASHBOARD COMPONENT
// ===============================

export const EnhancedDashboard = () => {
  const [timeRange, setTimeRange] = useState('This Month');

  const stats = [
    {
      title: 'Products Scanned',
      value: '156',
      change: '+12%',
      trend: 'up' as const,
      icon: <Zap className="h-6 w-6" />,
    },
    {
      title: 'Eco Score Average',
      value: '8.4',
      change: '+2.1',
      trend: 'up' as const,
      icon: <Leaf className="h-6 w-6" />,
    },
    {
      title: 'Comparisons Made',
      value: '23',
      change: '+8%',
      trend: 'up' as const,
      icon: <BarChart3 className="h-6 w-6" />,
    },
    {
      title: 'Community Rank',
      value: '#142',
      change: 'Up 23',
      trend: 'up' as const,
      icon: <Users className="h-6 w-6" />,
    },
  ];

  return (
    <div className={cn(layoutUtils.pageContainer, 'space-y-8')}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={layoutUtils.spaceBetween}
      >
        <div>
          <DisplayText className="mb-2">
            Dashboard
          </DisplayText>
          <BodyText contrast="medium">
            Track your environmental impact and sustainable choices
          </BodyText>
        </div>

        <div className="flex items-center space-x-3">
          <EnhancedButton variant="outline" size="sm">
            <Calendar className="mr-2 h-4 w-4" />
            {timeRange}
          </EnhancedButton>
          <EnhancedButton size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Quick Scan
          </EnhancedButton>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={responsiveUtils.grid.auto + ' gap-6'}
      >
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.1 }}
          >
            <StatCard {...stat} />
          </motion.div>
        ))}
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Recent Activity */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2"
        >
          <ActivityFeed />
        </motion.div>

        {/* Right Column - Quick Actions & Impact */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-8"
        >
          <QuickActions />
          <ImpactSummary />
        </motion.div>
      </div>

      {/* Feature Highlights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <HeadingText className="mb-6 text-center">
          Discover EcoSnap Features
        </HeadingText>
        
        <div className={cn(responsiveUtils.grid.auto, 'gap-6')}>
          <FeatureHighlight
            icon={<Zap className="h-6 w-6" />}
            title="Smart Scanner"
            description="AI-powered product analysis with instant sustainability insights"
          />
          <FeatureHighlight
            icon={<BarChart3 className="h-6 w-6" />}
            title="Product Comparison"
            description="Compare alternatives and make better environmental choices"
          />
          <FeatureHighlight
            icon={<Award className="h-6 w-6" />}
            title="Eco Achievements"
            description="Earn badges and track your environmental impact journey"
          />
          <FeatureHighlight
            icon={<Users className="h-6 w-6" />}
            title="Community Rankings"
            description="See how you stack up against other eco-conscious users"
          />
        </div>
      </motion.div>
    </div>
  );
};

export default EnhancedDashboard;