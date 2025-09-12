import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FeatureTile } from "@/components/FeatureTile";
import { AnimatedElement, StaggeredGrid, FloatingElement } from "@/components/AnimatedComponents";
import { ParticleField } from "@/components/ParticleField";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { 
  Scan, 
  Play, 
  Sparkles, 
  Shield, 
  Zap, 
  Leaf, 
  Users, 
  Award,
  ArrowRight,
  Camera,
  BarChart3,
  Globe,
  CheckCircle,
  TrendingUp,
  Heart,
  Star
} from "lucide-react";

const features = [
  {
    icon: Camera,
    title: "AI-Powered Scanner",
    description: "Instantly scan any product with your camera to get detailed eco-impact analysis and sustainability scores."
  },
  {
    icon: Sparkles,
    title: "Smart Alternatives",
    description: "Find better, more sustainable alternatives to any product with personalized recommendations."
  },
  {
    icon: BarChart3,
    title: "Impact Analytics",
    description: "Track your environmental impact over time and see how your choices make a difference."
  },
  {
    icon: Shield,
    title: "Verified Data",
    description: "All environmental data is sourced from certified databases and third-party verification."
  },
  {
    icon: Zap,
    title: "Real-time Updates",
    description: "Get the latest sustainability information as companies update their environmental practices."
  },
  {
    icon: Users,
    title: "Community Driven",
    description: "Join a growing community of eco-conscious consumers making informed choices together."
  }
];

const steps = [
  {
    number: "01",
    title: "Scan Product",
    description: "Point your camera at any product barcode or packaging"
  },
  {
    number: "02", 
    title: "Get Eco Score",
    description: "Instantly receive a comprehensive sustainability rating"
  },
  {
    number: "03",
    title: "Find Alternatives", 
    description: "Discover better eco-friendly options with one tap"
  }
];

export default function Index() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/50">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 eco-gradient opacity-30" />
        <ParticleField count={8} />
        
        {/* Floating Orbs with smooth CSS animations */}
        <FloatingElement 
          speed="slow"
          className="absolute top-20 left-20 w-32 h-32 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 blur-xl"
        >
          <div></div>
        </FloatingElement>
        <FloatingElement 
          speed="fast"
          className="absolute bottom-32 right-20 w-24 h-24 rounded-full bg-gradient-to-br from-secondary/20 to-accent/20 blur-xl"
        >
          <div></div>
        </FloatingElement>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            {/* Hero Content with smooth entrance */}
            <AnimatedElement animation="scaleIn" className="glass-card p-8 md:p-12 rounded-3xl mb-8">
              {/* Badge */}
              <AnimatedElement animation="fadeIn" delay={200} className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-button text-sm font-medium mb-6">
                <Sparkles className="h-4 w-4 text-primary animate-spin-slow" />
                AI-Powered Sustainability Scanner
              </AnimatedElement>

              <AnimatedElement animation="fadeInUp" delay={400}>
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                  Scan. Learn. 
                  <br />
                  Choose Better.
                </h1>
              </AnimatedElement>

              <AnimatedElement animation="fadeInUp" delay={600}>
                <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed">
                  Discover the environmental impact of products instantly. 
                  Make informed, sustainable choices with AI-powered insights.
                </p>
              </AnimatedElement>

              <AnimatedElement animation="fadeInUp" delay={800}>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  {user ? (
                    // Authenticated user - direct access to scanner
                    <Link to="/scanner">
                      <Button 
                        variant="premium"
                        size="xl"
                        className="group smooth-hover"
                      >
                        <Scan className="h-5 w-5 mr-3 group-hover:scale-110 transition-transform" />
                        Start Scanning
                        <ArrowRight className="h-5 w-5 ml-3 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  ) : (
                    // Unauthenticated user - signup flow
                    <>
                      <Link to="/signup">
                        <Button 
                          variant="premium"
                          size="xl"
                          className="group smooth-hover"
                        >
                          <Sparkles className="h-5 w-5 mr-3 group-hover:scale-110 transition-transform" />
                          Get Started Free
                          <ArrowRight className="h-5 w-5 ml-3 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                      <Link to="/login">
                        <Button 
                          variant="outline" 
                          size="xl"
                          className="smooth-hover"
                        >
                          <Play className="h-5 w-5 mr-3" />
                          Sign In
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              </AnimatedElement>
            </AnimatedElement>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <AnimatedElement animation="fadeInUp" className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Powerful Features for 
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {" "}Eco-Conscious Choices
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Our AI-powered platform makes sustainable shopping effortless with cutting-edge technology and real-time data.
            </p>
          </AnimatedElement>

          <StaggeredGrid className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <FeatureTile key={feature.title} {...feature} />
            ))}
          </StaggeredGrid>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gradient-to-br from-muted/30 to-background relative">
        <div className="container mx-auto px-4">
          <AnimatedElement animation="fadeInUp" className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              How It Works
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Get started with sustainable shopping in just three simple steps
            </p>
          </AnimatedElement>

          <div className="max-w-4xl mx-auto">
            <StaggeredGrid className="grid grid-cols-1 md:grid-cols-3 gap-8" delay={200}>
              {steps.map((step) => (
                <div key={step.number} className="text-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-xl mb-6 mx-auto smooth-hover">
                    {step.number}
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              ))}
            </StaggeredGrid>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative">
        <div className="absolute inset-0 eco-gradient opacity-20" />
        <div className="container mx-auto px-4 relative z-10">
          <AnimatedElement animation="scaleIn" className="max-w-4xl mx-auto text-center">
            <Card className="glass-card p-8 md:p-16">
              <CardContent className="p-0">
                <AnimatedElement animation="fadeIn" delay={200} className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-button text-sm font-medium mb-6">
                  <Award className="h-4 w-4 text-primary" />
                  Ready to Make a Difference?
                </AnimatedElement>
                
                <AnimatedElement animation="fadeInUp" delay={400}>
                  <h2 className="text-3xl md:text-5xl font-bold mb-6">
                    Start Your 
                    <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                      {" "}Sustainable Journey
                    </span>
                    {" "}Today
                  </h2>
                </AnimatedElement>
                
                <AnimatedElement animation="fadeInUp" delay={600}>
                  <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                    Join thousands of conscious consumers already making better choices for our planet. 
                    Every scan brings us closer to a sustainable future.
                  </p>
                </AnimatedElement>
                
                <AnimatedElement animation="fadeInUp" delay={800}>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link to="/scanner">
                      <Button 
                        variant="premium"
                        size="xl"
                        className="group smooth-hover"
                      >
                        <Camera className="h-5 w-5 mr-3" />
                        Start Scanning Now
                        <ArrowRight className="h-5 w-5 ml-3 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                    
                    <Link to="/dashboard">
                      <Button 
                        variant="glass" 
                        size="xl"
                        className="group smooth-hover"
                      >
                        <BarChart3 className="h-5 w-5 mr-3" />
                        View Dashboard
                      </Button>
                    </Link>
                  </div>
                </AnimatedElement>
              </CardContent>
            </Card>
          </AnimatedElement>
        </div>
      </section>
    </div>
  );
}
