import { motion } from "framer-motion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface EcoBadgeProps {
  type: "recyclable" | "organic" | "cruelty-free" | "sustainable" | "biodegradable";
  size?: "sm" | "md" | "lg";
  animated?: boolean;
  className?: string;
}

const badgeConfig = {
  recyclable: {
    emoji: "♻️",
    label: "Recyclable",
    description: "This product can be recycled",
    color: "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300"
  },
  organic: {
    emoji: "🌱",
    label: "Organic",
    description: "Made with organic materials",
    color: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
  },
  "cruelty-free": {
    emoji: "🐰",
    label: "Cruelty Free",
    description: "No animal testing involved",
    color: "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300"
  },
  sustainable: {
    emoji: "🌍",
    label: "Sustainable",
    description: "Environmentally sustainable production",
    color: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300"
  },
  biodegradable: {
    emoji: "🍃",
    label: "Biodegradable",
    description: "Naturally breaks down over time",
    color: "bg-lime-100 dark:bg-lime-900/30 text-lime-800 dark:text-lime-300"
  }
};

export function EcoBadge({ type, size = "md", animated = true, className = "" }: EcoBadgeProps) {
  const config = badgeConfig[type];
  
  const sizeClasses = {
    sm: "text-xs px-1.5 py-0.5 gap-1",
    md: "text-sm px-2 py-1 gap-1.5", 
    lg: "text-base px-3 py-1.5 gap-2"
  };

  const Badge = (
    <motion.div
      initial={animated ? { scale: 0, opacity: 0 } : false}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      whileHover={animated ? { scale: 1.05 } : {}}
      whileTap={animated ? { scale: 0.95 } : {}}
      className={`
        inline-flex items-center rounded-full font-medium
        ${config.color}
        ${sizeClasses[size]}
        transition-all duration-200
        shadow-sm hover:shadow-md
        ${animated ? 'animate-pulse-glow' : ''}
        ${className}
      `}
    >
      <span className="select-none">{config.emoji}</span>
      <span>{config.label}</span>
    </motion.div>
  );

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {Badge}
        </TooltipTrigger>
        <TooltipContent>
          <p>{config.description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Helper function to convert string badges to EcoBadge types
export function getBadgeType(badge: string): EcoBadgeProps["type"] | null {
  const badgeMap: Record<string, EcoBadgeProps["type"]> = {
    "♻️": "recyclable",
    "🌱": "organic", 
    "🐰": "cruelty-free",
    "🌍": "sustainable",
    "🍃": "biodegradable"
  };
  
  return badgeMap[badge] || null;
}