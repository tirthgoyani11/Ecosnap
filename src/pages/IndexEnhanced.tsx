import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FeatureTile } from "@/components/FeatureTile";
import { AnimatedElement, StaggeredGrid, FloatingElement } from "@/components/AnimatedComponents";
import { ParticleField } from "@/components/ParticleField";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
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
  Star,
  Quote,
  Verified
} from "lucide-react";

const features = [
  {
    icon: Camera,
    title: "AI-Powered Scanner",
    description: "Instantly scan any product with your camera to get detailed eco-impact analysis and sustainability scores.",
    color: "bg-gradient-to-br from-blue-400 to-cyan-300",
    stats: "99.7% accuracy"
  },
  {
    icon: Sparkles,
    title: "Smart Alternatives",
    description: "Find better, more sustainable alternatives to any product with personalized recommendations.",
    color: "bg-gradient-to-br from-green-400 to-emerald-300",
    stats: "10K+ alternatives"
  },
  {
    icon: BarChart3,
    title: "Impact Analytics",
    description: "Track your environmental impact over time and see how your choices make a difference.",
    color: "bg-gradient-to-br from-purple-400 to-pink-300",
    stats: "Real-time tracking"
  },
  {
    icon: Shield,
    title: "Verified Data",
    description: "All environmental data is sourced from certified databases and third-party verification.",
    color: "bg-gradient-to-br from-orange-400 to-red-300",
    stats: "Certified sources"
  },
  {
    icon: Zap,
    title: "Real-time Updates",
    description: "Get the latest sustainability information as companies update their environmental practices.",
    color: "bg-gradient-to-br from-indigo-400 to-purple-300",
    stats: "Live updates"
  },
  {
    icon: Users,
    title: "Community Driven",
    description: "Join a growing community of eco-conscious consumers making informed choices together.",
    color: "bg-gradient-to-br from-pink-400 to-rose-300",
    stats: "10K+ members"
  }
];

const steps = [
  {
    number: "01",
    title: "Scan Product",
    description: "Point your camera at any product barcode or packaging",
    icon: Camera
  },
  {
    number: "02", 
    title: "Get Eco Score",
    description: "Instantly receive a comprehensive sustainability rating",
    icon: BarChart3
  },
  {
    number: "03",
    title: "Find Alternatives", 
    description: "Discover better eco-friendly options with one tap",
    icon: Sparkles
  }
];

export default function IndexEnhanced() {
  const { user, loading } = useAuth();
  const [activeFeature, setActiveFeature] = useState(0);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  // For home page, we don't wait for auth loading - we show the page immediately
  const isAuthenticated = !loading && user;

  // Enhanced statistics
  const stats = [
    { icon: Users, value: "10K+", label: "Active Users", color: "text-blue-400", change: "+23%" },
    { icon: Scan, value: "50K+", label: "Products Scanned", color: "text-green-400", change: "+47%" },
    { icon: Award, value: "1M+", label: "Points Earned", color: "text-purple-400", change: "+89%" },
    { icon: Globe, value: "25+", label: "Countries", color: "text-orange-400", change: "+12%" }
  ];

  const testimonials = [
    {
      name: "Tirth Goyani",
      role: "Environmental Advocate",
      content: "EcoSnap changed how I shop. I've reduced my carbon footprint by 40% in just 3 months!",
      avatar: "👩‍🔬",
      rating: 5,
      verified: true
    },
    {
      name: "Abhi Gabani",
      role: "Sustainability Blogger",
      content: "The most comprehensive eco-tool I've ever used. The community features are incredible.",
      avatar: "👨‍💻",
      rating: 5,
      verified: true
    },
    {
      name: "Krisha Vithani",
      role: "Green Living Expert",
      content: "Finally, a tool that makes sustainable living accessible and rewarding for everyone.",
      avatar: "🌱",
      rating: 5,
      verified: true
    }
  ];

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  // Cycle through features for hero animation
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/50">
      {/* Enhanced Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Advanced Background Elements */}
        <motion.div 
          className="absolute inset-0 eco-gradient opacity-30"
          style={{ y, opacity }}
        />
        <ParticleField count={12} />
        
        {/* Dynamic Floating Orbs */}
        <FloatingElement 
          speed="slow"
          className="absolute top-20 left-20 w-32 h-32 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 blur-xl animate-pulse"
        >
          <div></div>
        </FloatingElement>
        <FloatingElement 
          speed="fast"
          className="absolute bottom-32 right-20 w-24 h-24 rounded-full bg-gradient-to-br from-secondary/20 to-accent/20 blur-xl"
        >
          <div></div>
        </FloatingElement>
        <FloatingElement 
          speed="fast"
          className="absolute top-1/3 right-1/4 w-20 h-20 rounded-full bg-gradient-to-br from-purple-400/20 to-pink-400/20 blur-lg"
        >
          <div></div>
        </FloatingElement>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            {/* Enhanced Hero Content */}
            <AnimatedElement animation="scaleIn" className="glass-card p-8 md:p-12 rounded-3xl mb-8 relative overflow-hidden">
              {/* Animated Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-secondary/20 animate-gradient-x"></div>
              </div>

              {/* Premium Badge with Animation */}
              <AnimatedElement animation="fadeIn" delay={200} className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-button text-sm font-medium mb-6 hover:scale-105 transition-transform">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="h-4 w-4 text-primary" />
                </motion.div>
                AI-Powered Sustainability Scanner
              </AnimatedElement>

              <AnimatedElement animation="fadeInUp" delay={400}>
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6">
                  <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent animate-gradient-x bg-300% ">
                    Scan. Learn.
                  </span>
                  <br />
                  <span className="bg-gradient-to-r from-accent via-primary to-secondary bg-clip-text text-transparent animate-gradient-x bg-300%">
                    Choose Better.
                  </span>
                </h1>
              </AnimatedElement>

              <AnimatedElement animation="fadeInUp" delay={600}>
                <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
                  Transform your shopping experience with AI-powered sustainability insights. 
                  Make informed choices that benefit both you and the planet.
                </p>
              </AnimatedElement>

              {/* Enhanced Action Buttons */}
              <AnimatedElement animation="fadeInUp" delay={800} className="flex justify-center mb-8">
                <Link to={isAuthenticated ? "/dashboard" : "/scanner"}>
                  <Button 
                    size="lg" 
                    className="premium-button group px-8 py-4 text-lg font-semibold hover:scale-105 transition-all duration-300"
                  >
                    <Camera className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
                    Start Scanning
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </AnimatedElement>

              {/* Live Stats with Animations */}
              <AnimatedElement animation="fadeInUp" delay={1000}>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8">
                  {stats.map((stat, index) => (
                    <motion.div
                      key={stat.label}
                      className="text-center"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.2 + index * 0.1 }}
                      whileHover={{ scale: 1.05 }}
                    >
                      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-background to-muted mb-3 ${stat.color}`}>
                        <stat.icon className="h-6 w-6" />
                      </div>
                      <div className="flex items-center justify-center gap-1">
                        <span className="text-2xl font-bold">{stat.value}</span>
                        <span className="text-green-400 text-sm font-medium">{stat.change}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                    </motion.div>
                  ))}
                </div>
              </AnimatedElement>
            </AnimatedElement>
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 border-2 border-primary/50 rounded-full flex justify-center">
            <motion.div 
              className="w-1 h-3 bg-primary rounded-full mt-2"
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </section>

      {/* Enhanced How It Works Section */}
      <section className="py-24 relative">
        <div className="container mx-auto px-4">
          <AnimatedElement animation="fadeInUp" className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              How It Works
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Three simple steps to start your sustainable journey
            </p>
          </AnimatedElement>

          <div className="max-w-4xl mx-auto">
            <StaggeredGrid className="grid md:grid-cols-3 gap-8">
              {steps.map((step, index) => (
                <motion.div
                  key={step.number}
                  className="relative"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Card className="glass-card h-full p-6 text-center hover:shadow-lg transition-all duration-300">
                    <div className="relative mb-6">
                      <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-4">
                        <step.icon className="h-8 w-8 text-white" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-accent rounded-full flex items-center justify-center text-sm font-bold text-white">
                        {step.number}
                      </div>
                    </div>
                    <CardContent className="p-0">
                      <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                      <p className="text-muted-foreground">{step.description}</p>
                    </CardContent>
                  </Card>
                  
                  {/* Connection Line */}
                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-primary to-transparent transform -translate-y-1/2" />
                  )}
                </motion.div>
              ))}
            </StaggeredGrid>
          </div>
        </div>
      </section>

      {/* Enhanced Features Grid */}
      <section className="py-24 bg-gradient-to-br from-muted/30 to-background">
        <div className="container mx-auto px-4">
          <AnimatedElement animation="fadeInUp" className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Powerful Features
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to make sustainable choices with confidence
            </p>
          </AnimatedElement>

          <StaggeredGrid className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <FeatureTile
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                  className="h-full hover:shadow-xl transition-all duration-300"
                />
                <motion.div 
                  className="mt-2 text-center text-sm font-medium text-primary"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  {feature.stats}
                </motion.div>
              </motion.div>
            ))}
          </StaggeredGrid>
        </div>
      </section>

      {/* New Testimonials Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5" />
        <div className="container mx-auto px-4 relative z-10">
          <AnimatedElement animation="fadeInUp" className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              What Our Users Say
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Join thousands of users making a positive environmental impact
            </p>
          </AnimatedElement>

          <div className="max-w-4xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTestimonial}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.5 }}
                className="text-center"
              >
                <Card className="glass-card p-8 md:p-12 max-w-3xl mx-auto">
                  <Quote className="h-12 w-12 text-primary mx-auto mb-6" />
                  <blockquote className="text-xl md:text-2xl font-medium mb-6 text-foreground/90">
                    "{testimonials[currentTestimonial].content}"
                  </blockquote>
                  <div className="flex items-center justify-center gap-4">
                    <div className="text-4xl">{testimonials[currentTestimonial].avatar}</div>
                    <div className="text-left">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{testimonials[currentTestimonial].name}</p>
                        {testimonials[currentTestimonial].verified && (
                          <Verified className="h-4 w-4 text-blue-500" />
                        )}
                      </div>
                      <p className="text-muted-foreground">{testimonials[currentTestimonial].role}</p>
                      <div className="flex gap-1 mt-1">
                        {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </AnimatePresence>

            {/* Testimonial Navigation */}
            <div className="flex justify-center gap-2 mt-8">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentTestimonial 
                      ? 'bg-primary w-8' 
                      : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-secondary to-accent opacity-10" />
        <ParticleField count={6} />
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <AnimatedElement animation="fadeInUp" className="max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Ready to Make a Difference?
            </h2>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed">
              Join thousands of users who are already making sustainable choices with EcoSnap.
              Every scan brings us closer to a greener future.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
              <Link to={isAuthenticated ? "/dashboard" : "/scanner"}>
                <Button 
                  size="lg" 
                  className="premium-button group px-12 py-6 text-xl font-semibold hover:scale-105 transition-all duration-300"
                >
                  <Leaf className="mr-3 h-6 w-6 group-hover:rotate-12 transition-transform" />
                  Start Your Journey
                  <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-2 transition-transform" />
                </Button>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>100% Free to Start</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-blue-500" />
                <span>Privacy Protected</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-red-500" />
                <span>Community Driven</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-purple-500" />
                <span>Proven Impact</span>
              </div>
            </div>
          </AnimatedElement>
        </div>
      </section>
    </div>
  );
}
