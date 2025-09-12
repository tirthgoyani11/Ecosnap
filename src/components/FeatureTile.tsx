import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface FeatureTileProps {
  title: string;
  description: string;
  icon: LucideIcon;
  delay?: number;
  className?: string;
}

export function FeatureTile({ 
  title, 
  description, 
  icon: Icon, 
  delay = 0,
  className = ""
}: FeatureTileProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ 
        duration: 0.6, 
        delay: delay,
        ease: "easeOut"
      }}
      whileHover={{ 
        y: -8, 
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
      className={className}
    >
      <Card className="glass-card hover:shadow-glow transition-all duration-300 h-full group">
        <CardContent className="p-6 flex flex-col items-center text-center space-y-4 h-full">
          {/* Icon */}
          <motion.div 
            className="p-4 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 group-hover:from-primary/30 group-hover:to-secondary/30 transition-all duration-300"
            whileHover={{ rotate: 5, scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Icon className="h-8 w-8 text-primary" />
          </motion.div>
          
          {/* Content */}
          <div className="space-y-2 flex-1">
            <h3 className="text-lg font-semibold group-hover:text-primary transition-colors duration-200">
              {title}
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {description}
            </p>
          </div>
          
          {/* Animated underline */}
          <motion.div 
            className="w-12 h-0.5 bg-gradient-to-r from-primary to-secondary rounded-full"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ delay: delay + 0.3, duration: 0.4 }}
          />
        </CardContent>
      </Card>
    </motion.div>
  );
}