import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  ArrowRight, 
  Zap, 
  Shield, 
  Star,
  CheckCircle,
  LucideIcon
} from "lucide-react";
import { useState } from "react";

interface ModernCardProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  badge?: string;
  badgeVariant?: "default" | "secondary" | "destructive" | "outline";
  gradient?: string;
  stats?: string;
  className?: string;
  children?: React.ReactNode;
  onClick?: () => void;
}

export const ModernCard = ({ 
  title, 
  description, 
  icon: Icon, 
  badge, 
  badgeVariant = "default",
  gradient = "from-blue-500/20 to-purple-500/20",
  stats,
  className = "",
  children,
  onClick 
}: ModernCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={`group cursor-pointer ${className}`}
      onClick={onClick}
    >
      <Card className="glass-card h-full relative overflow-hidden hover:shadow-xl transition-all duration-300">
        {/* Animated Background Gradient */}
        <motion.div 
          className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 transition-opacity duration-300`}
          animate={{ opacity: isHovered ? 0.1 : 0 }}
        />
        
        <div className="p-6 relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              {Icon && (
                <motion.div 
                  className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors"
                  whileHover={{ rotate: 12 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <Icon className="h-5 w-5 text-primary" />
                </motion.div>
              )}
              <div>
                <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">{title}</h3>
                {stats && (
                  <motion.p 
                    className="text-sm text-primary font-medium"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    {stats}
                  </motion.p>
                )}
              </div>
            </div>
            {badge && (
              <Badge variant={badgeVariant} className="animate-pulse">
                {badge}
              </Badge>
            )}
          </div>
          
          <p className="text-muted-foreground mb-4 leading-relaxed">{description}</p>
          
          {children}
          
          <motion.div 
            className="flex items-center text-primary text-sm font-medium"
            initial={{ x: 0 }}
            animate={{ x: isHovered ? 4 : 0 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            Learn more 
            <ArrowRight className="ml-1 h-4 w-4" />
          </motion.div>
        </div>
      </Card>
    </motion.div>
  );
};

interface StatCardProps {
  title: string;
  value: number | string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon?: LucideIcon;
  suffix?: string;
  prefix?: string;
  className?: string;
}

export const StatCard = ({ 
  title, 
  value, 
  change, 
  changeType = "positive",
  icon: Icon,
  suffix = "",
  prefix = "",
  className = ""
}: StatCardProps) => {
  const changeColors = {
    positive: "text-green-500 bg-green-500/10",
    negative: "text-red-500 bg-red-500/10", 
    neutral: "text-blue-500 bg-blue-500/10"
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300 }}
      className={className}
    >
      <Card className="glass-card p-6 hover:shadow-lg transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          {Icon && (
            <motion.div
              whileHover={{ rotate: 12 }}
              transition={{ type: "spring", stiffness: 400 }}
              className="p-2 rounded-lg bg-primary/10"
            >
              <Icon className="h-6 w-6 text-primary" />
            </motion.div>
          )}
          {change && (
            <Badge className={`${changeColors[changeType]} border-0`}>
              {changeType === "positive" && "+"}{change}
            </Badge>
          )}
        </div>
        
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="text-3xl font-bold mb-2"
        >
          {prefix}{value}{suffix}
        </motion.div>
        
        <p className="text-muted-foreground text-sm">{title}</p>
        
        <div className="mt-3 w-full bg-muted/30 rounded-full h-1">
          <motion.div
            className="bg-gradient-to-r from-primary to-secondary h-1 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: "70%" }}
            transition={{ delay: 0.5, duration: 1 }}
          />
        </div>
      </Card>
    </motion.div>
  );
};

interface InteractiveButtonProps {
  variant?: "default" | "premium" | "glass" | "gradient";
  size?: "sm" | "md" | "lg";
  icon?: LucideIcon;
  iconPosition?: "left" | "right";
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

export const InteractiveButton = ({
  variant = "default",
  size = "md",
  icon: Icon,
  iconPosition = "left", 
  children,
  onClick,
  className = "",
  disabled = false
}: InteractiveButtonProps) => {
  const variants = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    premium: "premium-button",
    glass: "glass-button",
    gradient: "bg-gradient-to-r from-primary via-secondary to-accent text-white hover:scale-105"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2",
    lg: "px-8 py-4 text-lg"
  };

  return (
    <motion.div
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
    >
      <Button
        className={`${variants[variant]} ${sizes[size]} ${className} group transition-all duration-300`}
        onClick={onClick}
        disabled={disabled}
      >
        {Icon && iconPosition === "left" && (
          <motion.div
            whileHover={{ rotate: 12 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <Icon className="mr-2 h-4 w-4" />
          </motion.div>
        )}
        {children}
        {Icon && iconPosition === "right" && (
          <motion.div
            whileHover={{ x: 2 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <Icon className="ml-2 h-4 w-4" />
          </motion.div>
        )}
      </Button>
    </motion.div>
  );
};

interface ProgressRingProps {
  value: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  color?: string;
  showValue?: boolean;
  className?: string;
}

export const ProgressRing = ({ 
  value, 
  max = 100, 
  size = "md", 
  color = "text-primary",
  showValue = true,
  className = ""
}: ProgressRingProps) => {
  const sizes = {
    sm: { width: 60, strokeWidth: 4, fontSize: "text-xs" },
    md: { width: 80, strokeWidth: 6, fontSize: "text-sm" },
    lg: { width: 120, strokeWidth: 8, fontSize: "text-lg" }
  };
  
  const { width, strokeWidth, fontSize } = sizes[size];
  const radius = (width - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const percentage = (value / max) * 100;
  const strokeDasharray = `${circumference} ${circumference}`;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className={`relative ${className}`} style={{ width, height: width }}>
      <svg 
        className="transform -rotate-90" 
        width={width} 
        height={width}
      >
        {/* Background circle */}
        <circle
          cx={width / 2}
          cy={width / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-muted/30"
        />
        
        {/* Progress circle */}
        <motion.circle
          cx={width / 2}
          cy={width / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className={color}
          strokeDasharray={strokeDasharray}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          strokeLinecap="round"
        />
      </svg>
      
      {showValue && (
        <motion.div
          className={`absolute inset-0 flex items-center justify-center ${fontSize} font-bold ${color}`}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, type: "spring", stiffness: 300 }}
        >
          {Math.round(percentage)}%
        </motion.div>
      )}
    </div>
  );
};

interface NotificationToastProps {
  title: string;
  message: string;
  type?: "success" | "warning" | "error" | "info";
  icon?: LucideIcon;
  duration?: number;
  onClose?: () => void;
}

export const NotificationToast = ({
  title,
  message, 
  type = "info",
  icon: Icon,
  duration = 4000,
  onClose
}: NotificationToastProps) => {
  const typeStyles = {
    success: "border-green-500/20 bg-green-500/10 text-green-500",
    warning: "border-yellow-500/20 bg-yellow-500/10 text-yellow-500", 
    error: "border-red-500/20 bg-red-500/10 text-red-500",
    info: "border-blue-500/20 bg-blue-500/10 text-blue-500"
  };

  const typeIcons = {
    success: CheckCircle,
    warning: Shield,
    error: Zap,
    info: Star
  };

  const ToastIcon = Icon || typeIcons[type];

  return (
    <motion.div
      initial={{ opacity: 0, x: 100, scale: 0.8 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.8 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`glass-card border p-4 rounded-lg shadow-lg max-w-sm ${typeStyles[type]}`}
    >
      <div className="flex items-start gap-3">
        <ToastIcon className="h-5 w-5 mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm mb-1">{title}</h4>
          <p className="text-sm opacity-90 leading-relaxed">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="text-current/50 hover:text-current transition-colors p-1 rounded"
        >
          ×
        </button>
      </div>
    </motion.div>
  );
};
