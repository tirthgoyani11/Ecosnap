import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { LucideIcon, Star, Leaf, TrendingUp } from 'lucide-react';
import { MobileText, MobileBadge, MobileButton } from './ui/enhanced-mobile';

// ===============================
// MOBILE-OPTIMIZED PRODUCT CARDS
// ===============================

interface MobileProductCardProps {
  product: {
    id: string;
    name: string;
    brand?: string;
    price?: string;
    originalPrice?: string;
    discount?: number;
    rating?: number;
    reviews?: number;
    ecoScore: number;
    image?: string;
    availability?: string;
    description?: string;
    tags?: string[];
    sustainabilityFeatures?: string[];
  };
  onViewDetails?: () => void;
  onAddToCart?: () => void;
  onToggleFavorite?: () => void;
  isFavorite?: boolean;
  className?: string;
  compact?: boolean;
}

export const MobileProductCard = ({
  product,
  onViewDetails,
  onAddToCart,
  onToggleFavorite,
  isFavorite = false,
  className,
  compact = false
}: MobileProductCardProps) => {
  const getEcoScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400'; 
    if (score >= 40) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getEcoScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Poor';
  };

  const getEcoScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-100 dark:bg-green-900/30';
    if (score >= 60) return 'bg-yellow-100 dark:bg-yellow-900/30';
    if (score >= 40) return 'bg-orange-100 dark:bg-orange-900/30';
    return 'bg-red-100 dark:bg-red-900/30';
  };

  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "w-full rounded-xl border border-slate-200 dark:border-slate-700",
        "bg-adaptive shadow-mobile hover:shadow-mobile-strong",
        "transition-all duration-200 overflow-hidden",
        className
      )}
    >
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden">
        {product.image ? (
          <img 
            src={product.image} 
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <Leaf className="h-12 w-12 text-slate-400" />
          </div>
        )}
        
        {/* Eco Score Badge */}
        <div className={cn(
          "absolute top-3 left-3 px-2 py-1 rounded-lg",
          "backdrop-blur-sm border border-white/20",
          getEcoScoreBg(product.ecoScore)
        )}>
          <div className="flex items-center space-x-1">
            <Leaf className={cn("h-3 w-3", getEcoScoreColor(product.ecoScore))} />
            <span className={cn("text-xs font-bold", getEcoScoreColor(product.ecoScore))}>
              {product.ecoScore}
            </span>
          </div>
        </div>

        {/* Discount Badge */}
        {product.discount && product.discount > 0 && (
          <div className="absolute top-3 right-3 bg-red-500 text-white px-2 py-1 rounded-lg">
            <span className="text-xs font-bold">-{product.discount}%</span>
          </div>
        )}

        {/* Favorite Button */}
        <button
          onClick={onToggleFavorite}
          className={cn(
            "absolute bottom-3 right-3 p-2 rounded-full touch-target",
            "backdrop-blur-sm border border-white/20 transition-all duration-200",
            isFavorite 
              ? "bg-red-500 text-white" 
              : "bg-white/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400"
          )}
        >
          <svg 
            className="h-4 w-4" 
            fill={isFavorite ? "currentColor" : "none"} 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </button>
      </div>

      {/* Product Details */}
      <div className="p-4 space-y-3">
        {/* Brand & Name */}
        <div>
          {product.brand && (
            <MobileText variant="caption" contrast="medium" className="uppercase tracking-wide">
              {product.brand}
            </MobileText>
          )}
          <MobileText 
            variant="subheading" 
            contrast="high" 
            className="line-clamp-2 leading-tight"
          >
            {product.name}
          </MobileText>
        </div>

        {/* Rating */}
        {product.rating && (
          <div className="flex items-center space-x-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={cn(
                    "h-3 w-3",
                    i < Math.floor(product.rating || 0)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-slate-300 dark:text-slate-600"
                  )} 
                />
              ))}
            </div>
            <MobileText variant="caption" contrast="medium">
              {product.rating} ({product.reviews?.toLocaleString()})
            </MobileText>
          </div>
        )}

        {/* Description */}
        {!compact && product.description && (
          <MobileText 
            variant="caption" 
            contrast="medium" 
            className="line-clamp-2"
          >
            {product.description}
          </MobileText>
        )}

        {/* Eco Features */}
        {!compact && product.sustainabilityFeatures && product.sustainabilityFeatures.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {product.sustainabilityFeatures.slice(0, 2).map((feature, index) => (
              <MobileBadge key={index} variant="success" size="sm">
                {feature}
              </MobileBadge>
            ))}
          </div>
        )}

        {/* Price & Eco Score */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {product.price && (
              <MobileText variant="subheading" contrast="high" size="lg">
                {product.price}
              </MobileText>
            )}
            {product.originalPrice && product.discount && (
              <MobileText 
                variant="caption" 
                contrast="low" 
                className="line-through"
              >
                {product.originalPrice}
              </MobileText>
            )}
          </div>
          
          <div className="flex items-center space-x-1">
            <TrendingUp className={cn("h-4 w-4", getEcoScoreColor(product.ecoScore))} />
            <MobileText 
              variant="label" 
              className={getEcoScoreColor(product.ecoScore)}
            >
              {getEcoScoreLabel(product.ecoScore)}
            </MobileText>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2 pt-2">
          <MobileButton
            variant="outline"
            size="sm"
            fullWidth
            onClick={onViewDetails}
            className="flex-1"
          >
            Details
          </MobileButton>
          <MobileButton
            variant="primary"
            size="sm"
            fullWidth
            onClick={onAddToCart}
            className="flex-1"
          >
            Add to Cart
          </MobileButton>
        </div>
      </div>
    </motion.div>
  );
};

// ===============================
// COMPACT PRODUCT CARD FOR LISTS
// ===============================

interface CompactProductCardProps {
  product: {
    id: string;
    name: string;
    brand?: string;
    price?: string;
    ecoScore: number;
    image?: string;
    rating?: number;
  };
  onSelect?: () => void;
  selected?: boolean;
  className?: string;
}

export const CompactProductCard = ({
  product,
  onSelect,
  selected = false,
  className
}: CompactProductCardProps) => {
  const getEcoScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    if (score >= 40) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      onClick={onSelect}
      className={cn(
        "flex items-center space-x-3 p-3 rounded-xl border transition-all duration-200 cursor-pointer touch-target",
        selected 
          ? "border-primary bg-primary/5" 
          : "border-slate-200 dark:border-slate-700 bg-adaptive hover:bg-muted",
        className
      )}
    >
      {/* Product Image */}
      <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden">
        {product.image ? (
          <img 
            src={product.image} 
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <Leaf className="h-5 w-5 text-slate-400" />
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            {product.brand && (
              <MobileText variant="caption" contrast="medium" className="uppercase tracking-wide">
                {product.brand}
              </MobileText>
            )}
            <MobileText 
              variant="body" 
              contrast="high" 
              className="line-clamp-1 font-medium"
            >
              {product.name}
            </MobileText>
            {product.price && (
              <MobileText variant="caption" contrast="medium">
                {product.price}
              </MobileText>
            )}
          </div>
          
          {/* Eco Score */}
          <div className="flex items-center space-x-1 ml-2">
            <Leaf className={cn("h-3 w-3", getEcoScoreColor(product.ecoScore))} />
            <MobileText 
              variant="caption" 
              className={cn("font-bold", getEcoScoreColor(product.ecoScore))}
            >
              {product.ecoScore}
            </MobileText>
          </div>
        </div>

        {/* Rating */}
        {product.rating && (
          <div className="flex items-center space-x-1 mt-1">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                className={cn(
                  "h-2.5 w-2.5",
                  i < Math.floor(product.rating || 0)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-slate-300 dark:text-slate-600"
                )} 
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

// ===============================
// PRODUCT GRID CONTAINER
// ===============================

interface ProductGridProps {
  children: React.ReactNode;
  className?: string;
  columns?: 1 | 2 | 3 | 4;
  gap?: 'sm' | 'md' | 'lg';
}

export const ProductGrid = ({
  children,
  className,
  columns = 2,
  gap = 'md'
}: ProductGridProps) => {
  const columnClasses = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
  };
  
  const gapClasses = {
    sm: "gap-3",
    md: "gap-4 sm:gap-6",
    lg: "gap-6 sm:gap-8"
  };

  return (
    <div 
      className={cn(
        "grid w-full",
        columnClasses[columns],
        gapClasses[gap],
        className
      )}
    >
      {children}
    </div>
  );
};