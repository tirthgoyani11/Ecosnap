import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScoreRing } from "@/components/ScoreRing";
import { EcoBadge } from "@/components/EcoBadge";
import { 
  X, 
  ExternalLink, 
  Heart, 
  Share2, 
  ShoppingCart,
  Zap,
  Leaf
} from "lucide-react";

interface ARProductOverlayProps {
  product: any;
  isVisible: boolean;
  onClose: () => void;
  onAddToCart?: (product: any) => void;
  onViewDetails?: (product: any) => void;
}

export function ARProductOverlay({ 
  product, 
  isVisible, 
  onClose, 
  onAddToCart, 
  onViewDetails 
}: ARProductOverlayProps) {
  const [isLiked, setIsLiked] = useState(false);

  if (!product) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: "100%" }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: "100%" }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
          className="fixed inset-x-0 bottom-0 z-50 px-4 pb-safe max-h-[60vh] overflow-hidden"
        >
          <Card className="glass-card border-t-2 border-primary/20">
            <CardContent className="p-4">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3 flex-1">
                  {/* Product Image */}
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="w-12 h-12 rounded-lg bg-muted overflow-hidden flex-shrink-0"
                  >
                    <img
                      src="/placeholder.svg"
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </motion.div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base leading-tight truncate">
                      {product.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-1">
                      {product.brand}
                    </p>
                    
                    {/* Eco Score */}
                    <div className="flex items-center gap-2">
                      <ScoreRing score={product.ecoScore} size="sm" />
                      <div className="flex gap-1">
                        <EcoBadge type="organic" size="sm" />
                        <EcoBadge type="recyclable" size="sm" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Close Button */}
                <Button
                  onClick={onClose}
                  variant="ghost"
                  size="icon"
                  className="rounded-full flex-shrink-0 h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Enhanced Impact Stats - Compact Version */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                {/* Carbon Footprint */}
                <div className="p-3 rounded-lg bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-orange-500/20 flex items-center justify-center">
                        🏭
                      </div>
                      <div className="text-xs font-medium text-orange-600 dark:text-orange-400">Carbon</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-orange-600">{product.carbonFootprint || '2.4'}kg</div>
                      <div className="text-[10px] text-muted-foreground">CO₂e</div>
                    </div>
                  </div>
                  {/* Carbon footprint progress bar */}
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-orange-500 h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(20, 100 - (product.carbonFootprint || 2.4) * 20)}%` }}
                    />
                  </div>
                </div>

                {/* Eco Score */}
                <div className="p-3 rounded-lg bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-green-500/20 flex items-center justify-center">
                        <Leaf className="h-3 w-3 text-green-500" />
                      </div>
                      <div className="text-xs font-medium text-green-600 dark:text-green-400">Eco Score</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-green-600">{product.ecoScore}/100</div>
                      <div className="text-[10px] text-muted-foreground">Excellent</div>
                    </div>
                  </div>
                  {/* Eco score progress bar */}
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-emerald-500 h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${product.ecoScore}%` }}
                    />
                  </div>
                </div>

                {/* Water Usage */}
                <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-blue-500/20 flex items-center justify-center">
                        💧
                      </div>
                      <div className="text-xs font-medium text-blue-600 dark:text-blue-400">Water</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-blue-600">{product.waterUsage || '120'}L</div>
                      <div className="text-[10px] text-muted-foreground">Used</div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-cyan-500 h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(20, 100 - (product.waterUsage || 120) / 3)}%` }}
                    />
                  </div>
                </div>

                {/* Recyclability */}
                <div className="p-3 rounded-lg bg-gradient-to-br from-purple-500/10 to-violet-500/10 border border-purple-500/20">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-purple-500/20 flex items-center justify-center">
                        ♻️
                      </div>
                      <div className="text-xs font-medium text-purple-600 dark:text-purple-400">Recycle</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-purple-600">{product.recyclability || '95'}%</div>
                      <div className="text-[10px] text-muted-foreground">Rate</div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-violet-500 h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${product.recyclability || 95}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Certifications - Compact */}
              {product.certifications && product.certifications.length > 0 && (
                <div className="mb-3">
                  <div className="flex flex-wrap gap-1">
                    {product.certifications.map((cert: string) => (
                      <div 
                        key={cert}
                        className="px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-medium text-primary"
                      >
                        {cert}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons - Compact */}
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Button
                    onClick={() => onViewDetails?.(product)}
                    variant="outline"
                    size="sm"
                    className="flex-1 glass-button group h-9"
                  >
                    <ExternalLink className="h-3 w-3 mr-2 group-hover:scale-110 transition-transform" />
                    Details
                  </Button>
                  
                  <Button
                    onClick={() => onAddToCart?.(product)}
                    variant="premium"
                    size="sm"
                    className="flex-1 group h-9"
                  >
                    <ShoppingCart className="h-3 w-3 mr-2 group-hover:scale-110 transition-transform" />
                    Add to Cart
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex gap-1">
                    <Button
                      onClick={() => setIsLiked(!isLiked)}
                      variant="ghost"
                      size="icon"
                      className="rounded-full h-8 w-8"
                    >
                      <motion.div
                        whileTap={{ scale: 0.8 }}
                        animate={isLiked ? { scale: [1, 1.2, 1] } : {}}
                      >
                        <Heart 
                          className={`h-3 w-3 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} 
                        />
                      </motion.div>
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full h-8 w-8"
                    >
                      <Share2 className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-lg font-bold">$24.99</div>
                    <div className="text-xs text-muted-foreground">Free shipping</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}