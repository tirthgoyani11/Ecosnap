import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { useEffect, useState } from "react";

interface KPIStatProps {
  title: string;
  value: number | string;
  unit?: string;
  change?: number;
  changeLabel?: string;
  icon: LucideIcon;
  color?: "primary" | "secondary" | "accent" | "success" | "warning";
  animated?: boolean;
  className?: string;
}

export function KPIStat({
  title,
  value,
  unit = "",
  change,
  changeLabel,
  icon: Icon,
  color = "primary",
  animated = true,
  className = ""
}: KPIStatProps) {
  const [displayValue, setDisplayValue] = useState(animated ? 0 : typeof value === 'number' ? value : 0);
  const numericValue = typeof value === 'number' ? value : parseFloat(value.toString()) || 0;

  const colorConfig = {
    primary: "text-primary bg-primary/10",
    secondary: "text-secondary bg-secondary/10", 
    accent: "text-accent bg-accent/10",
    success: "text-emerald-600 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/30",
    warning: "text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30"
  };

  useEffect(() => {
    if (!animated || typeof value !== 'number') {
      setDisplayValue(numericValue);
      return;
    }

    let start = 0;
    const duration = 2000;
    const startTime = Date.now();
    
    const animate = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const current = start + (numericValue - start) * easeOutQuart;
      
      setDisplayValue(current);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    animate();
  }, [value, animated, numericValue]);

  const formatDisplayValue = (val: number): string => {
    if (typeof value === 'string') return value;
    
    const safeVal = val || 0;
    
    if (safeVal >= 1000000) {
      return (safeVal / 1000000).toFixed(1) + 'M';
    } else if (safeVal >= 1000) {
      return (safeVal / 1000).toFixed(1) + 'K';
    } else if (safeVal % 1 === 0) {
      return safeVal.toString();
    } else {
      return safeVal.toFixed(1);
    }
  };

  return (
    <motion.div
      initial={animated ? { opacity: 0, y: 20 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -2 }}
      className={className}
    >
      <Card className="glass-card hover:shadow-glow transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                {title}
              </p>
              
              <div className="flex items-baseline gap-1">
                <motion.span 
                  className="text-2xl font-bold"
                  key={displayValue}
                  initial={animated ? { scale: 0.8 } : false}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  {formatDisplayValue(displayValue)}
                </motion.span>
                {unit && (
                  <span className="text-sm text-muted-foreground font-medium">
                    {unit}
                  </span>
                )}
              </div>
              
              {change !== undefined && (
                <div className="flex items-center gap-1">
                  <span className={`text-xs font-medium ${
                    change >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    {change >= 0 ? '+' : ''}{change}%
                  </span>
                  {changeLabel && (
                    <span className="text-xs text-muted-foreground">
                      {changeLabel}
                    </span>
                  )}
                </div>
              )}
            </div>
            
            <motion.div 
              className={`p-3 rounded-xl ${colorConfig[color]}`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Icon className="h-6 w-6" />
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}