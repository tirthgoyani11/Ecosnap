import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FeatureTile } from "@/components/FeatureTile";
import { TestimonialCard } from "@/components/TestimonialCard";
import { ParticleField } from "@/components/ParticleField";
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
  BarChart3
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

const testimonials = [
  {
    name: "Sarah Chen",
    title: "Sustainability Advocate", 
    role: "Sustainability Advocate",
    rating: 5,
    content: "EcoSnap AI has completely changed how I shop. I can instantly know if a product aligns with my values!",
    avatar: "/placeholder.svg"
  },
  {
    name: "Marcus Rodriguez",
    title: "Environmental Scientist",
    role: "Environmental Scientist",
    rating: 5,
    content: "The accuracy of environmental data is impressive. It's like having a sustainability expert in my pocket.",
    avatar: "/placeholder.svg"
  },
  {
    name: "Emily Watson",
    title: "Conscious Consumer",
    role: "Conscious Consumer",
    rating: 5,
    content: "Love how easy it is to find better alternatives. My carbon footprint has decreased significantly!",
    avatar: "/placeholder.svg"
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
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/50">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 eco-gradient opacity-30" />
        <ParticleField count={15} />
        
        {/* Floating Orbs with smooth CSS animations */}
        <div className="absolute top-20 left-20 w-32 h-32 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 blur-xl animate-float-slow" />
        <div className="absolute bottom-32 right-20 w-24 h-24 rounded-full bg-gradient-to-br from-secondary/20 to-accent/20 blur-xl animate-float-fast" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            {/* Hero Content */}
            <div className="glass-card p-8 md:p-12 rounded-3xl mb-8 animate-fade-in-up">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-button text-sm font-medium mb-6 animate-scale-in">
                <Sparkles className="h-4 w-4 text-primary animate-spin-slow" />
                AI-Powered Sustainability Scanner
              </div>

              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent animate-fade-in">
                Scan. Learn. 
                <br />
                Choose Better.
              </h1>

              <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed animate-fade-in-delay">
                Discover the environmental impact of products instantly. 
                Make informed, sustainable choices with AI-powered insights.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-delay-2">
                <Link to="/scanner">
                  <Button 
                    variant="premium"
                    size="xl"
                    className="group smooth-hover"
                  >
                    <Scan className="h-5 w-5 mr-3 group-hover:scale-110 transition-transform" />
                    Try the Scanner
                    <ArrowRight className="h-5 w-5 ml-3 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                
                <Button 
                  variant="glass" 
                  size="xl"
                  className="group smooth-hover"
                >
                  <Play className="h-5 w-5 mr-3 group-hover:scale-110 transition-transform" />
                  View Demo
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Powerful Features for 
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {" "}Eco-Conscious Choices
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Our AI-powered platform makes sustainable shopping effortless with cutting-edge technology and real-time data.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={feature.title} className="animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                <FeatureTile {...feature} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gradient-to-br from-muted/30 to-background relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              How It Works
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Get started with sustainable shopping in just three simple steps
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {steps.map((step, index) => (
                <div key={step.number} className="text-center animate-fade-in-up" style={{ animationDelay: `${index * 200}ms` }}>
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-xl mb-6 mx-auto smooth-hover">
                    {step.number}
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Trusted by 
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {" "}Eco-Warriors
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Join thousands of users making a positive impact on the planet
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <div key={testimonial.name} className="animate-fade-in-up" style={{ animationDelay: `${index * 150}ms` }}>
                <TestimonialCard {...testimonial} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative">
        <div className="absolute inset-0 eco-gradient opacity-20" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center animate-fade-in-up">
            <Card className="glass-card p-8 md:p-16">
              <CardContent className="p-0">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-button text-sm font-medium mb-6">
                  <Award className="h-4 w-4 text-primary" />
                  Ready to Make a Difference?
                </div>
                
                <h2 className="text-3xl md:text-5xl font-bold mb-6">
                  Start Your 
                  <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    {" "}Sustainable Journey
                  </span>
                  {" "}Today
                </h2>
                
                <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                  Join thousands of conscious consumers already making better choices for our planet. 
                  Every scan brings us closer to a sustainable future.
                </p>
                
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
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
