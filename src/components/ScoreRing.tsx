import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface ScoreRingProps {
  score: number;
  size?: "sm" | "md" | "lg";
  animated?: boolean;
  className?: string;
}

export function ScoreRing({ score, size = "md", animated = true, className = "" }: ScoreRingProps) {
  const [displayScore, setDisplayScore] = useState(0);
  
  const sizeConfig = {
    sm: { radius: 20, strokeWidth: 3, fontSize: "text-xs" },
    md: { radius: 30, strokeWidth: 4, fontSize: "text-sm" },
    lg: { radius: 40, strokeWidth: 5, fontSize: "text-lg" }
  };
  
  const { radius, strokeWidth, fontSize } = sizeConfig[size];
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  
  // Get color based on score
  const getScoreColor = (score: number) => {
    if (score >= 80) return "stroke-emerald-500";
    if (score >= 60) return "stroke-yellow-500"; 
    if (score >= 40) return "stroke-orange-500";
    return "stroke-red-500";
  };
  
  const getScoreColorBg = (score: number) => {
    if (score >= 80) return "text-emerald-600 dark:text-emerald-400";
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
    if (score >= 40) return "text-orange-600 dark:text-orange-400";
    return "text-red-600 dark:text-red-400";
  };

  useEffect(() => {
    if (!animated) {
      setDisplayScore(score);
      return;
    }

    let start = 0;
    const duration = 1000;
    const startTime = Date.now();
    
    const animate = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const current = Math.floor(start + (score - start) * easeOutQuart);
      
      setDisplayScore(current);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    animate();
  }, [score, animated]);

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg
        width={(radius + strokeWidth) * 2}
        height={(radius + strokeWidth) * 2}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={radius + strokeWidth}
          cy={radius + strokeWidth}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="opacity-20"
        />
        
        {/* Progress circle */}
        <motion.circle
          cx={radius + strokeWidth}
          cy={radius + strokeWidth}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: strokeDashoffset }}
          transition={{ 
            duration: animated ? 1 : 0, 
            ease: "easeOut",
            delay: animated ? 0.2 : 0
          }}
          className={getScoreColor(score)}
        />
      </svg>
      
      {/* Score text */}
      <div className={`absolute inset-0 flex items-center justify-center ${fontSize} font-bold ${getScoreColorBg(score)}`}>
        {displayScore}
      </div>
    </div>
  );
}