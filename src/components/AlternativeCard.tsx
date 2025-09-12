import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScoreRing } from "@/components/ScoreRing";
import { EcoBadge, getBadgeType } from "@/components/EcoBadge";
import { ArrowUpRight, Zap } from "lucide-react";
import { type Alternative } from "@/lib/mock/products";

interface AlternativeCardProps {
  alternative: Alternative;
  onSwap?: (alternative: Alternative) => void;
  compact?: boolean;
  className?: string;
}

export function AlternativeCard({ 
  alternative, 
  onSwap, 
  compact = false, 
  className = "" 
}: AlternativeCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
      className={className}
    >
      <Card className="glass-card hover:shadow-glow transition-all duration-300">
        <CardContent className={compact ? "p-4" : "p-5"}>
          <div className={`flex ${compact ? 'gap-3' : 'gap-4'}`}>
            {/* Product Image */}
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className={`relative ${compact ? 'w-16 h-16' : 'w-20 h-20'} rounded-lg overflow-hidden bg-muted flex-shrink-0`}
            >
              <img
                src={alternative.image}
                alt={alternative.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.svg";
                }}
              />
            </motion.div>

            {/* Product Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="min-w-0 flex-1">
                  <h4 className={`font-medium ${compact ? 'text-sm' : 'text-base'} leading-tight truncate`}>
                    {alternative.name}
                  </h4>
                  <p className={`text-muted-foreground ${compact ? 'text-xs' : 'text-sm'}`}>
                    {alternative.brand}
                  </p>
                </div>
                
                {/* Eco Score */}
                <div className="flex-shrink-0">
                  <ScoreRing score={alternative.eco_score} size="sm" animated={false} />
                </div>
              </div>

              {/* Eco Badges */}
              {alternative.badges.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {alternative.badges.slice(0, compact ? 2 : 3).map((badge, index) => {
                    const badgeType = getBadgeType(badge);
                    return badgeType ? (
                      <EcoBadge 
                        key={index} 
                        type={badgeType} 
                        size="sm"
                        animated={false}
                      />
                    ) : null;
                  })}
                </div>
              )}

              {/* Savings & Price */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    <Zap className="w-3 h-3 mr-1" />
                    +{alternative.savings}% better
                  </Badge>
                  <span className={`font-medium text-foreground ${compact ? 'text-sm' : 'text-base'}`}>
                    ${alternative.price}
                  </span>
                </div>
                
                {onSwap && (
                  <Button
                    onClick={() => onSwap(alternative)}
                    size="sm"
                    className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 group"
                  >
                    Swap
                    <ArrowUpRight className="ml-1 h-3 w-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}