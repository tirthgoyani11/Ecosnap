import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ModernCard, StatCard, InteractiveButton, ProgressRing } from "@/components/ModernComponents";
import { Link } from "react-router-dom";
import {
  Sparkles,
  Camera,
  BarChart3,
  Leaf,
  Award,
  Users,
  TrendingUp,
  ArrowRight,
  Star,
  Zap,
  Globe,
  Heart,
  Shield
} from "lucide-react";

export default function DemoShowcase() {
  const [selectedDemo, setSelectedDemo] = useState("landing");

  const demos = [
    { id: "landing", name: "Enhanced Landing Page", path: "/", icon: Sparkles },
    { id: "dashboard", name: "Enhanced Dashboard", path: "/dashboard", icon: BarChart3 },
    { id: "scanner", name: "Enhanced Scanner", path: "/scanner", icon: Camera },
  ];

  const features = [
    {
      title: "Modern Animations",
      description: "Physics-based transitions with Framer Motion for silky smooth interactions",
      icon: Zap,
      gradient: "from-blue-500/20 to-purple-500/20",
      stats: "60fps smooth"
    },
    {
      title: "Glass Morphism Design",
      description: "Translucent backgrounds with blur effects creating depth and modern aesthetics",
      icon: Shield,
      gradient: "from-cyan-500/20 to-blue-500/20",
      stats: "Premium feel"
    },
    {
      title: "Interactive Components",
      description: "Hover effects, micro-animations, and responsive feedback for enhanced UX",
      icon: Star,
      gradient: "from-purple-500/20 to-pink-500/20",
      stats: "100% responsive"
    },
    {
      title: "Real-time Analytics",
      description: "Live data visualization with animated charts and progress indicators",
      icon: TrendingUp,
      gradient: "from-green-500/20 to-emerald-500/20",
      stats: "Live updates"
    },
    {
      title: "AI-Powered Insights",
      description: "Smart recommendations and sustainability scoring with machine learning",
      icon: Globe,
      gradient: "from-orange-500/20 to-red-500/20",
      stats: "99.7% accuracy"
    },
    {
      title: "Community Features",
      description: "Social sharing, achievements system, and collaborative sustainability tracking",
      icon: Heart,
      gradient: "from-pink-500/20 to-rose-500/20",
      stats: "10K+ users"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/50 to-muted/30 p-4">
      <div className="container mx-auto max-w-7xl">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent mb-6">
            🚀 Enhanced EcoSnap
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Experience the next generation of sustainable living with ReactBits.dev-inspired 
            modern UI components, smooth animations, and intelligent features.
          </p>
          
          {/* Quick Navigation */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {demos.map((demo) => (
              <Link key={demo.id} to={demo.path}>
                <InteractiveButton
                  variant={selectedDemo === demo.id ? "premium" : "glass"}
                  icon={demo.icon}
                  onClick={() => setSelectedDemo(demo.id)}
                >
                  {demo.name}
                </InteractiveButton>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
        >
          <StatCard
            title="Performance Boost"
            value="300%"
            change="+25%"
            changeType="positive"
            icon={TrendingUp}
          />
          <StatCard
            title="User Engagement"
            value="45%"
            change="+15%"
            changeType="positive"
            icon={Users}
            suffix=" increase"
          />
          <StatCard
            title="Animation Smoothness"
            value="60"
            change="100%"
            changeType="positive"
            icon={Zap}
            suffix="fps"
          />
          <StatCard
            title="Modern Components"
            value="50+"
            change="New"
            changeType="neutral"
            icon={Sparkles}
          />
        </motion.div>

        {/* Feature Showcase */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-12"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Modern Features & Enhancements
            </h2>
            <p className="text-lg text-muted-foreground">
              Discover the cutting-edge features that make EcoSnap exceptional
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
              >
                <ModernCard
                  title={feature.title}
                  description={feature.description}
                  icon={feature.icon}
                  gradient={feature.gradient}
                  stats={feature.stats}
                  badge="Enhanced"
                  badgeVariant="outline"
                />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Interactive Demo Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mb-12"
        >
          <Card className="glass-card relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10" />
            
            <CardHeader className="relative z-10">
              <CardTitle className="text-2xl text-center">
                Interactive Component Showcase
              </CardTitle>
            </CardHeader>
            
            <CardContent className="relative z-10 p-8">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                
                {/* Progress Rings Demo */}
                <div className="text-center space-y-6">
                  <h3 className="text-xl font-semibold mb-4">Animated Progress Rings</h3>
                  <div className="flex justify-center gap-6">
                    <div className="text-center">
                      <ProgressRing value={85} color="text-green-500" />
                      <p className="text-sm mt-2 text-muted-foreground">Sustainability</p>
                    </div>
                    <div className="text-center">
                      <ProgressRing value={72} color="text-blue-500" />
                      <p className="text-sm mt-2 text-muted-foreground">Performance</p>
                    </div>
                    <div className="text-center">
                      <ProgressRing value={94} color="text-purple-500" />
                      <p className="text-sm mt-2 text-muted-foreground">User Experience</p>
                    </div>
                  </div>
                </div>

                {/* Interactive Buttons Demo */}
                <div className="text-center space-y-4">
                  <h3 className="text-xl font-semibold mb-4">Interactive Button Variants</h3>
                  <div className="space-y-3">
                    <InteractiveButton variant="premium" icon={Star} className="w-full">
                      Premium Button
                    </InteractiveButton>
                    <InteractiveButton variant="glass" icon={Shield} className="w-full">
                      Glass Button
                    </InteractiveButton>
                    <InteractiveButton variant="gradient" icon={Zap} className="w-full">
                      Gradient Button
                    </InteractiveButton>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="text-center"
        >
          <div className="bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 rounded-3xl p-8 md:p-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Ready to Explore?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Experience the enhanced EcoSnap with modern animations, intelligent features, 
              and a premium user experience that makes sustainable living engaging and accessible.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/">
                <InteractiveButton variant="premium" icon={Sparkles} size="lg">
                  Enhanced Landing Page
                  <ArrowRight className="ml-2 h-5 w-5" />
                </InteractiveButton>
              </Link>
              <Link to="/dashboard">
                <InteractiveButton variant="glass" icon={BarChart3} size="lg">
                  Modern Dashboard
                </InteractiveButton>
              </Link>
              <Link to="/scanner">
                <InteractiveButton variant="gradient" icon={Camera} size="lg">
                  AI Scanner
                </InteractiveButton>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
