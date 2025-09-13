import React from 'react';
import { motion } from 'framer-motion';
import { cn, themeClasses, responsiveUtils, layoutUtils } from '../../lib/utils';
import { 
  Star, 
  Leaf, 
  Award, 
  TrendingUp, 
  Shield, 
  Globe,
  Zap,
  Heart,
  CheckCircle2,
  AlertCircle,
  Info,
  X
} from 'lucide-react';

// ===============================
// ENHANCED TYPOGRAPHY COMPONENTS
// ===============================

interface TypographyProps {
  children: React.ReactNode;
  className?: string;
  contrast?: 'high' | 'medium' | 'low';
}

export const DisplayText = ({ children, className, contrast = 'high' }: TypographyProps) => (
  <h1 className={cn(
    responsiveUtils.text.display,
    themeClasses.text[contrast],
    className
  )}>
    {children}
  </h1>
);

export const TitleText = ({ children, className, contrast = 'high' }: TypographyProps) => (
  <h2 className={cn(
    responsiveUtils.text.title,
    themeClasses.text[contrast],
    className
  )}>
    {children}
  </h2>
);

export const HeadingText = ({ children, className, contrast = 'high' }: TypographyProps) => (
  <h3 className={cn(
    responsiveUtils.text.heading,
    themeClasses.text[contrast],
    className
  )}>
    {children}
  </h3>
);

export const SubheadingText = ({ children, className, contrast = 'medium' }: TypographyProps) => (
  <h4 className={cn(
    responsiveUtils.text.subheading,
    themeClasses.text[contrast],
    className
  )}>
    {children}
  </h4>
);

export const BodyText = ({ children, className, contrast = 'medium' }: TypographyProps) => (
  <p className={cn(
    responsiveUtils.text.body,
    themeClasses.text[contrast],
    'leading-relaxed',
    className
  )}>
    {children}
  </p>
);

export const CaptionText = ({ children, className, contrast = 'low' }: TypographyProps) => (
  <span className={cn(
    responsiveUtils.text.caption,
    themeClasses.text[contrast],
    className
  )}>
    {children}
  </span>
);

// ===============================
// ENHANCED CARD COMPONENTS
// ===============================

interface EnhancedCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'interactive' | 'outlined';
  padding?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

export const EnhancedCard = ({ 
  children, 
  className, 
  variant = 'default',
  padding = 'md',
  onClick 
}: EnhancedCardProps) => {
  const paddingClasses = {
    sm: 'p-3 sm:p-4',
    md: 'p-4 sm:p-6',
    lg: 'p-6 sm:p-8',
  };

  const variantClasses = {
    default: 'bg-card border-border shadow-sm',
    elevated: 'bg-card border-border shadow-lg hover:shadow-xl',
    interactive: 'bg-card border-border shadow-sm hover:shadow-md hover:scale-[1.02] cursor-pointer',
    outlined: 'bg-transparent border-2 border-border',
  };

  const Component = onClick ? motion.div : 'div';
  const motionProps = onClick ? {
    whileTap: { scale: 0.98 },
    transition: { type: 'spring' as const, stiffness: 400, damping: 17 },
    onClick,
  } : {};

  return (
    <Component
      className={cn(
        'rounded-xl border transition-all duration-200',
        variantClasses[variant],
        paddingClasses[padding],
        themeClasses.interactive.focus,
        className
      )}
      {...motionProps}
    >
      {children}
    </Component>
  );
};

// ===============================
// ENHANCED BUTTON COMPONENTS
// ===============================

interface EnhancedButtonProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  fullWidth?: boolean;
}

export const EnhancedButton = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  disabled,
  loading,
  onClick,
  type = 'button',
  fullWidth
}: EnhancedButtonProps) => {
  const sizeClasses = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-10 px-4 text-sm',
    lg: 'h-12 px-6 text-base',
  };

  const variantClasses = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
  };

  return (
    <motion.button
      whileTap={{ scale: disabled || loading ? 1 : 0.95 }}
      transition={{ type: 'spring' as const, stiffness: 400, damping: 17 }}
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center rounded-md font-medium',
        'ring-offset-background transition-colors',
        themeClasses.interactive.focus,
        themeClasses.interactive.disabled,
        themeClasses.mobile.touchTarget,
        sizeClasses[size],
        variantClasses[variant],
        fullWidth && 'w-full',
        className
      )}
    >
      {loading ? (
        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : null}
      {children}
    </motion.button>
  );
};

// ===============================
// ENHANCED BADGE COMPONENTS
// ===============================

interface EnhancedBadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'secondary' | 'outline' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
}

export const EnhancedBadge = ({ 
  children, 
  className, 
  variant = 'default',
  size = 'md'
}: EnhancedBadgeProps) => {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-sm',
    lg: 'px-3 py-1 text-sm',
  };

  const variantClasses = {
    default: 'bg-primary text-primary-foreground',
    secondary: 'bg-secondary text-secondary-foreground',
    outline: 'border border-input bg-background text-foreground',
    success: 'bg-emerald-500 text-white dark:bg-emerald-600',
    warning: 'bg-amber-500 text-white dark:bg-amber-600',
    error: 'bg-red-500 text-white dark:bg-red-600',
  };

  return (
    <span className={cn(
      'inline-flex items-center rounded-full font-medium',
      'transition-colors',
      sizeClasses[size],
      variantClasses[variant],
      className
    )}>
      {children}
    </span>
  );
};

// ===============================
// ECO SCORE COMPONENTS
// ===============================

interface EcoScoreDisplayProps {
  score: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const EcoScoreDisplay = ({ 
  score, 
  className, 
  size = 'md',
  showLabel = true 
}: EcoScoreDisplayProps) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600 dark:text-emerald-400';
    if (score >= 60) return 'text-amber-600 dark:text-amber-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-emerald-100 dark:bg-emerald-900/20';
    if (score >= 60) return 'bg-amber-100 dark:bg-amber-900/20';
    return 'bg-red-100 dark:bg-red-900/20';
  };

  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-12 w-12 text-sm',
    lg: 'h-16 w-16 text-lg',
  };

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <div className={cn(
        'flex items-center justify-center rounded-full font-bold',
        sizeClasses[size],
        getScoreColor(score),
        getScoreBg(score)
      )}>
        {score}
      </div>
      {showLabel && (
        <CaptionText contrast="medium">
          Eco Score
        </CaptionText>
      )}
    </div>
  );
};

// ===============================
// RATING COMPONENTS
// ===============================

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
}

export const StarRating = ({ 
  rating, 
  maxRating = 5, 
  className,
  size = 'md',
  interactive = false,
  onRatingChange
}: StarRatingProps) => {
  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  return (
    <div className={cn('flex items-center space-x-0.5', className)}>
      {Array.from({ length: maxRating }, (_, index) => {
        const filled = index < Math.floor(rating);
        const partial = index === Math.floor(rating) && rating % 1 > 0;
        
        return (
          <motion.button
            key={index}
            whileHover={interactive ? { scale: 1.1 } : undefined}
            whileTap={interactive ? { scale: 0.9 } : undefined}
            onClick={() => interactive && onRatingChange?.(index + 1)}
            disabled={!interactive}
            className={cn(
              'relative',
              interactive && 'cursor-pointer',
              !interactive && 'cursor-default'
            )}
          >
            <Star 
              className={cn(
                sizeClasses[size],
                filled 
                  ? 'fill-amber-400 text-amber-400' 
                  : 'fill-transparent text-slate-300 dark:text-slate-600'
              )}
            />
            {partial && (
              <Star 
                className={cn(
                  'absolute inset-0 fill-amber-400 text-amber-400',
                  sizeClasses[size]
                )}
                style={{
                  clipPath: `inset(0 ${100 - (rating % 1) * 100}% 0 0)`
                }}
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
};

// ===============================
// NOTIFICATION COMPONENTS
// ===============================

interface NotificationProps {
  children: React.ReactNode;
  variant?: 'info' | 'success' | 'warning' | 'error';
  className?: string;
  onClose?: () => void;
}

export const Notification = ({ 
  children, 
  variant = 'info', 
  className,
  onClose 
}: NotificationProps) => {
  const icons = {
    info: Info,
    success: CheckCircle2,
    warning: AlertCircle,
    error: AlertCircle,
  };

  const variantClasses = {
    info: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200',
    success: 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-200',
    warning: 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-200',
    error: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200',
  };

  const Icon = icons[variant];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={cn(
        'flex items-start space-x-3 rounded-lg border p-4',
        variantClasses[variant],
        className
      )}
    >
      <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
      <div className="flex-1 text-sm leading-relaxed">
        {children}
      </div>
      {onClose && (
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onClose}
          className="flex-shrink-0 ml-2"
        >
          <X className="h-4 w-4" />
        </motion.button>
      )}
    </motion.div>
  );
};

// ===============================
// LOADING COMPONENTS
// ===============================

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingSpinner = ({ size = 'md', className }: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  return (
    <div className={cn(
      'animate-spin rounded-full border-2 border-current border-t-transparent',
      sizeClasses[size],
      'text-primary',
      className
    )} />
  );
};

export const LoadingSkeleton = ({ className }: { className?: string }) => (
  <div className={cn(
    'animate-pulse rounded-md bg-muted',
    className
  )} />
);

// ===============================
// FEATURE HIGHLIGHT COMPONENTS
// ===============================

interface FeatureHighlightProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  className?: string;
}

export const FeatureHighlight = ({ 
  icon, 
  title, 
  description, 
  className 
}: FeatureHighlightProps) => (
  <EnhancedCard className={cn('text-center', className)} padding="lg">
    <div className="flex justify-center mb-4">
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
    </div>
    <HeadingText className="mb-2">{title}</HeadingText>
    <BodyText contrast="medium">{description}</BodyText>
  </EnhancedCard>
);