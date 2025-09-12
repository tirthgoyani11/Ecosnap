import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import {
  Zap,
  Mail,
  Twitter,
  Github,
  Linkedin,
  Instagram,
  ExternalLink,
  Heart,
  Leaf,
  ChevronUp,
  Send
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// Types
interface SocialIconProps {
  icon: React.ElementType;
  href: string;
  label: string;
  color: string;
}

interface CounterProps {
  end: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
}

// Animated Counter Component
const AnimatedCounter: React.FC<CounterProps> = ({ 
  end, 
  duration = 2000, 
  prefix = '', 
  suffix = '' 
}) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;

    const startTime = Date.now();
    const endTime = startTime + duration;

    const timer = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(endTime - now, 0);
      const progress = Math.min((duration - remaining) / duration, 1);
      
      setCount(Math.round(progress * end));
      
      if (remaining === 0) {
        clearInterval(timer);
      }
    }, 16);

    return () => clearInterval(timer);
  }, [isInView, end, duration]);

  return (
    <span ref={ref} className="font-bold text-green-400">
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
};

// Social Icon Component
const SocialIcon: React.FC<SocialIconProps> = ({ icon: Icon, href, label, color }) => (
  <motion.a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className={cn(
      "inline-flex items-center justify-center w-10 h-10 rounded-full",
      "bg-muted/50 hover:bg-muted transition-colors duration-200",
      "group relative overflow-hidden"
    )}
    whileHover={{ 
      scale: 1.1,
      rotate: 5,
    }}
    whileTap={{ scale: 0.95 }}
    aria-label={label}
  >
    <motion.div
      className={cn(
        "absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-200",
        color
      )}
      initial={{ scale: 0 }}
      whileHover={{ scale: 1 }}
    />
    <Icon className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors duration-200 relative z-10" />
  </motion.a>
);

// Newsletter Form Component
const NewsletterForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast({
        title: "Email Required",
        description: "Please enter your email address",
        variant: "destructive"
      });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Successfully Subscribed! 🎉",
        description: "Welcome to the EcoSnap community! Check your inbox for confirmation.",
      });
      setEmail('');
      setIsLoading(false);
    }, 1000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="relative">
        <Input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={cn(
            "pr-12 transition-all duration-200",
            "focus:ring-2 focus:ring-green-400/20 focus:border-green-400"
          )}
        />
        <Button
          type="submit"
          size="sm"
          disabled={isLoading}
          className="absolute right-1 top-1 h-8 w-8 p-0 bg-green-600 hover:bg-green-700"
        >
          {isLoading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
            />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </Button>
      </div>
    </form>
  );
};

// Main Footer Component
const Footer: React.FC = () => {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [isInView, controls]);

  const containerVariants = {
    hidden: { 
      opacity: 0, 
      y: 50 
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4 }
    }
  };

  const quickLinks = [
    { name: 'Home', href: '/' },
    { name: 'Scanner', href: '/scanner' },
    { name: 'Bulk Scan', href: '/bulk' },
    { name: 'Discover', href: '/discover-new' },
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Leaderboard', href: '/leaderboard' },
  ];

  const resourceLinks = [
    { name: 'Blog', href: 'https://blog.ecosnap.com', external: true },
    { name: 'FAQ', href: '/faq', external: false },
    { name: 'Docs', href: 'https://docs.ecosnap.com', external: true },
    { name: 'Privacy Policy', href: '/privacy', external: false },
    { name: 'Terms of Service', href: '/terms', external: false },
  ];

  const socialLinks = [
    { 
      icon: Twitter, 
      href: 'https://twitter.com/ecosnap', 
      label: 'Twitter',
      color: 'bg-blue-400'
    },
    { 
      icon: Github, 
      href: 'https://github.com/ecosnap', 
      label: 'GitHub',
      color: 'bg-gray-400'
    },
    { 
      icon: Linkedin, 
      href: 'https://linkedin.com/company/ecosnap', 
      label: 'LinkedIn',
      color: 'bg-blue-600'
    },
    { 
      icon: Instagram, 
      href: 'https://instagram.com/ecosnap', 
      label: 'Instagram',
      color: 'bg-gradient-to-r from-pink-400 to-purple-400'
    },
  ];

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <motion.footer
      ref={ref}
      className="relative bg-background border-t mt-20"
      variants={containerVariants}
      initial="hidden"
      animate={controls}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-br from-green-400/10 via-transparent to-blue-400/10" />
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="footer-pattern" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
              <circle cx="30" cy="30" r="1" fill="currentColor" opacity="0.1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#footer-pattern)" />
        </svg>
      </div>

      <div className="relative container mx-auto px-4 pt-16 pb-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Section */}
          <motion.div variants={itemVariants} className="lg:col-span-1">
            <div className="space-y-4">
              {/* Logo */}
              <Link to="/" className="inline-flex items-center space-x-2 group">
                <motion.div
                  className="h-10 w-10 rounded-xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg"
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Zap className="h-6 w-6 text-white" />
                </motion.div>
                <span className="text-2xl font-bold bg-gradient-to-r from-green-400 via-green-500 to-green-600 bg-clip-text text-transparent">
                  EcoSnap AI
                </span>
              </Link>

              {/* Tagline */}
              <p className="text-muted-foreground font-medium">
                Scan. Swap. Save the Planet.
              </p>

              {/* Eco Impact Counter */}
              <motion.div 
                className="flex items-center space-x-2 p-3 rounded-lg bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border border-green-200 dark:border-green-800"
                whileHover={{ scale: 1.02 }}
              >
                <Leaf className="w-5 h-5 text-green-500" />
                <span className="text-sm text-muted-foreground">
                  <AnimatedCounter end={12300} suffix=" kg" /> CO₂ saved by users
                </span>
              </motion.div>
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div variants={itemVariants} className="lg:col-span-1">
            <h3 className="font-semibold text-foreground mb-4 flex items-center">
              <ChevronUp className="w-4 h-4 mr-1" />
              Quick Links
            </h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors duration-200 group flex items-center"
                  >
                    <span className="relative">
                      {link.name}
                      <motion.div
                        className="absolute -bottom-1 left-0 h-0.5 bg-green-400 origin-left"
                        initial={{ scaleX: 0 }}
                        whileHover={{ scaleX: 1 }}
                        transition={{ duration: 0.2 }}
                      />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Resources */}
          <motion.div variants={itemVariants} className="lg:col-span-1">
            <h3 className="font-semibold text-foreground mb-4 flex items-center">
              <ExternalLink className="w-4 h-4 mr-1" />
              Resources
            </h3>
            <ul className="space-y-3">
              {resourceLinks.map((link) => (
                <li key={link.name}>
                  {link.external ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground transition-colors duration-200 group flex items-center"
                    >
                      <span className="relative">
                        {link.name}
                        <motion.div
                          className="absolute -bottom-1 left-0 h-0.5 bg-green-400 origin-left"
                          initial={{ scaleX: 0 }}
                          whileHover={{ scaleX: 1 }}
                          transition={{ duration: 0.2 }}
                        />
                      </span>
                      <ExternalLink className="w-3 h-3 ml-1 opacity-50 group-hover:opacity-100 transition-opacity" />
                    </a>
                  ) : (
                    <Link
                      to={link.href}
                      className="text-muted-foreground hover:text-foreground transition-colors duration-200 group flex items-center"
                    >
                      <span className="relative">
                        {link.name}
                        <motion.div
                          className="absolute -bottom-1 left-0 h-0.5 bg-green-400 origin-left"
                          initial={{ scaleX: 0 }}
                          whileHover={{ scaleX: 1 }}
                          transition={{ duration: 0.2 }}
                        />
                      </span>
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Newsletter & Social */}
          <motion.div variants={itemVariants} className="lg:col-span-1">
            <div className="space-y-6">
              {/* Newsletter */}
              <div>
                <h3 className="font-semibold text-foreground mb-4 flex items-center">
                  <Mail className="w-4 h-4 mr-1" />
                  Stay Updated
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Get the latest eco-friendly tips and product updates.
                </p>
                <NewsletterForm />
              </div>

              {/* Social Media */}
              <div>
                <h3 className="font-semibold text-foreground mb-4">Follow Us</h3>
                <div className="flex space-x-3">
                  {socialLinks.map((social) => (
                    <SocialIcon
                      key={social.label}
                      icon={social.icon}
                      href={social.href}
                      label={social.label}
                      color={social.color}
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <motion.div variants={itemVariants}>
          <Separator className="my-8" />
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="text-sm text-muted-foreground">
              © 2025 EcoSnap. All rights reserved.
            </div>
            <div className="flex items-center space-x-1 text-sm text-muted-foreground">
              <span>Made with</span>
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Heart className="w-4 h-4 text-red-500 fill-current" />
              </motion.div>
              <span>by Tirth Goyani</span>
            </div>
          </div>
        </motion.div>

        {/* Scroll to Top Button */}
        <motion.button
          onClick={scrollToTop}
          className={cn(
            "fixed bottom-6 right-6 p-3 rounded-full",
            "bg-green-600 hover:bg-green-700 text-white",
            "shadow-lg hover:shadow-xl transition-all duration-200",
            "z-50"
          )}
          whileHover={{ scale: 1.1, y: -2 }}
          whileTap={{ scale: 0.9 }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          <ChevronUp className="w-5 h-5" />
        </motion.button>
      </div>
    </motion.footer>
  );
};

export default Footer;
