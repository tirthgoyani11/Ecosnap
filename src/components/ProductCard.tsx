import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScoreRing } from "@/components/ScoreRing";
import { EcoBadge, getBadgeType } from "@/components/EcoBadge";
import { ExternalLink } from "lucide-react";
import { type Product } from "@/lib/mock/products";

interface ProductCardProps {
  product: Product;
  onViewDetails?: (product: Product) => void;
  className?: string;
}

export function ProductCard({ product, onViewDetails, className = "" }: ProductCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -4, scale: 1.02 }}
      className={className}
    >
      <Card className="glass-card hover:shadow-glow transition-all duration-300 overflow-hidden">
        <CardContent className="p-6">
          {/* Product Image */}
          <div className="relative mb-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="relative aspect-square rounded-xl overflow-hidden bg-muted"
            >
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.svg";
                }}
              />
              
              {/* Eco Score Ring Overlay */}
              <div className="absolute top-3 right-3">
                <div className="glass-card p-2 rounded-full">
                  <ScoreRing score={product.eco_score} size="sm" />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Product Info */}
          <div className="space-y-3">
            <div>
              <h3 className="font-semibold text-lg leading-tight">{product.name}</h3>
              <p className="text-sm text-muted-foreground">{product.brand}</p>
            </div>

            {/* Eco Badges */}
            {product.badges.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {product.badges.map((badge, index) => {
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

            {/* Carbon Footprint */}
            <div className="text-xs text-muted-foreground">
              Carbon footprint: <span className="font-medium">{product.carbon_footprint}g CO₂</span>
            </div>

            {/* Action Button */}
            {onViewDetails && (
              <Button
                onClick={() => onViewDetails(product)}
                variant="outline"
                className="w-full mt-4 group"
                size="sm"
              >
                View Details
                <ExternalLink className="ml-2 h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}