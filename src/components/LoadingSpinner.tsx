import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function LoadingSpinner({ size = "md", className = "" }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6", 
    lg: "h-8 w-8"
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className={`flex items-center justify-center ${className}`}
    >
      <Loader2 className={`animate-spin text-primary ${sizeClasses[size]}`} />
    </motion.div>
  );
}

export function LoadingSkeleton({ 
  className = "",
  count = 1 
}: { 
  className?: string;
  count?: number;
}) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.1 }}
          className={`animate-pulse bg-muted rounded-lg ${className}`}
          style={{
            background: `linear-gradient(90deg, 
              hsl(var(--muted)) 25%, 
              hsl(var(--muted) / 0.5) 50%, 
              hsl(var(--muted)) 75%)`,
            backgroundSize: '200px 100%',
            animation: 'shimmer 1.5s linear infinite'
          }}
        />
      ))}
    </div>
  );
}