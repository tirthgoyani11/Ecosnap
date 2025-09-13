import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

// ===============================
// MOBILE-FIRST ENHANCED UI COMPONENTS
// ===============================

interface MobileCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'glass' | 'elevated' | 'flat';
  padding?: 'sm' | 'md' | 'lg';
}

export const MobileCard = ({ 
  children, 
  className, 
  variant = 'default',
  padding = 'md'
}: MobileCardProps) => {
  const baseClasses = "w-full rounded-xl transition-all duration-200";
  
  const variantClasses = {
    default: "bg-adaptive-card shadow-mobile",
    glass: "glass-card",
    elevated: "bg-adaptive-card shadow-mobile-strong",
    flat: "bg-adaptive-card border border-slate-200 dark:border-slate-700"
  };
  
  const paddingClasses = {
    sm: "p-3 sm:p-4",
    md: "p-4 sm:p-6", 
    lg: "p-6 sm:p-8"
  };

  return (
    <div 
      className={cn(
        baseClasses,
        variantClasses[variant],
        paddingClasses[padding],
        className
      )}
    >
      {children}
    </div>
  );
};

interface MobileButtonProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'glass';
  size?: 'sm' | 'md' | 'lg' | 'touch';
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

export const MobileButton = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  fullWidth = false,
  disabled = false,
  onClick
}: MobileButtonProps) => {
  const baseClasses = "inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 touch-target";
  
  const variantClasses = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/90 active:bg-secondary/80",
    outline: "border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground",
    ghost: "text-medium-contrast hover:bg-muted hover:text-high-contrast",
    glass: "glass-button text-high-contrast"
  };
  
  const sizeClasses = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-3 sm:px-6 sm:py-2 text-base sm:text-sm",
    lg: "px-6 py-4 sm:px-8 sm:py-3 text-lg sm:text-base",
    touch: "px-6 py-4 text-base min-h-touch min-w-touch"
  };

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && "w-full",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      {Icon && iconPosition === 'left' && (
        <Icon className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
      )}
      {children}
      {Icon && iconPosition === 'right' && (
        <Icon className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
      )}
    </motion.button>
  );
};

interface MobileTextProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'heading' | 'subheading' | 'body' | 'caption' | 'label';
  contrast?: 'high' | 'medium' | 'low';
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const MobileText = ({
  children,
  className,
  variant = 'body',
  contrast = 'medium',
  size = 'md'
}: MobileTextProps) => {
  const variantClasses = {
    heading: "font-bold tracking-tight",
    subheading: "font-semibold",
    body: "font-normal",
    caption: "font-normal text-sm",
    label: "font-medium text-sm"
  };
  
  const contrastClasses = {
    high: "text-high-contrast",
    medium: "text-medium-contrast", 
    low: "text-low-contrast"
  };
  
  const sizeClasses = {
    sm: "text-mobile-sm sm:text-sm",
    md: "text-mobile-base sm:text-base",
    lg: "text-mobile-lg sm:text-lg",
    xl: "text-mobile-xl sm:text-xl"
  };

  return (
    <span 
      className={cn(
        variantClasses[variant],
        contrastClasses[contrast],
        sizeClasses[size],
        className
      )}
    >
      {children}
    </span>
  );
};

interface MobileInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: LucideIcon;
  className?: string;
}

export const MobileInput = ({
  label,
  error,
  icon: Icon,
  className,
  ...props
}: MobileInputProps) => {
  return (
    <div className="space-y-2">
      {label && (
        <MobileText variant="label" contrast="high">
          {label}
        </MobileText>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-low-contrast" />
        )}
        <input
          className={cn(
            "w-full px-4 py-3 sm:py-2 rounded-xl border-2 border-slate-200 dark:border-slate-700",
            "bg-adaptive text-high-contrast placeholder:text-low-contrast",
            "focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none",
            "transition-all duration-200 text-base sm:text-sm",
            Icon && "pl-10",
            error && "border-red-500 focus:border-red-500 focus:ring-red-500/20",
            className
          )}
          {...props}
        />
      </div>
      {error && (
        <MobileText variant="caption" contrast="high" className="text-red-500">
          {error}
        </MobileText>
      )}
    </div>
  );
};

interface MobileGridProps {
  children: React.ReactNode;
  className?: string;
  columns?: 1 | 2 | 3 | 4;
  gap?: 'sm' | 'md' | 'lg';
}

export const MobileGrid = ({
  children,
  className,
  columns = 2,
  gap = 'md'
}: MobileGridProps) => {
  const columnClasses = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
  };
  
  const gapClasses = {
    sm: "gap-3 sm:gap-4",
    md: "gap-4 sm:gap-6",
    lg: "gap-6 sm:gap-8"
  };

  return (
    <div 
      className={cn(
        "grid",
        columnClasses[columns],
        gapClasses[gap],
        className
      )}
    >
      {children}
    </div>
  );
};

interface MobileStackProps {
  children: React.ReactNode;
  className?: string;
  spacing?: 'sm' | 'md' | 'lg';
  align?: 'start' | 'center' | 'end' | 'stretch';
}

export const MobileStack = ({
  children,
  className,
  spacing = 'md',
  align = 'stretch'
}: MobileStackProps) => {
  const spacingClasses = {
    sm: "spacing-mobile-tight",
    md: "spacing-mobile",
    lg: "space-y-6 sm:space-y-8"
  };
  
  const alignClasses = {
    start: "items-start",
    center: "items-center", 
    end: "items-end",
    stretch: "items-stretch"
  };

  return (
    <div 
      className={cn(
        "flex flex-col",
        spacingClasses[spacing],
        alignClasses[align],
        className
      )}
    >
      {children}
    </div>
  );
};

interface MobileHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}

export const MobileHeader = ({
  title,
  subtitle,
  action,
  className
}: MobileHeaderProps) => {
  return (
    <div className={cn("flex items-start justify-between mb-6", className)}>
      <div className="flex-1">
        <MobileText variant="heading" contrast="high" size="xl">
          {title}
        </MobileText>
        {subtitle && (
          <MobileText variant="body" contrast="medium" className="mt-1">
            {subtitle}
          </MobileText>
        )}
      </div>
      {action && (
        <div className="ml-4 flex-shrink-0">
          {action}
        </div>
      )}
    </div>
  );
};

interface MobileStatsCardProps {
  label: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon?: LucideIcon;
  className?: string;
}

export const MobileStatsCard = ({
  label,
  value,
  change,
  changeType = 'neutral',
  icon: Icon,
  className
}: MobileStatsCardProps) => {
  const changeColors = {
    positive: "text-green-600 dark:text-green-400",
    negative: "text-red-600 dark:text-red-400",
    neutral: "text-medium-contrast"
  };

  return (
    <MobileCard variant="glass" className={className}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <MobileText variant="caption" contrast="medium">
            {label}
          </MobileText>
          <MobileText variant="heading" contrast="high" size="lg" className="mt-1">
            {value}
          </MobileText>
          {change && (
            <MobileText 
              variant="caption" 
              className={cn("mt-1", changeColors[changeType])}
            >
              {change}
            </MobileText>
          )}
        </div>
        {Icon && (
          <Icon className="h-8 w-8 text-primary opacity-80" />
        )}
      </div>
    </MobileCard>
  );
};

interface MobileBadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md';
}

export const MobileBadge = ({
  children,
  className,
  variant = 'default',
  size = 'md'
}: MobileBadgeProps) => {
  const baseClasses = "inline-flex items-center rounded-full font-medium";
  
  const variantClasses = {
    default: "bg-slate-100 dark:bg-slate-800 text-medium-contrast",
    success: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
    warning: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400",
    error: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400",
    info: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
  };
  
  const sizeClasses = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1 text-sm"
  };

  return (
    <span 
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      {children}
    </span>
  );
};

// Safe Area Component for mobile devices
interface SafeAreaProps {
  children: React.ReactNode;
  className?: string;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
}

export const SafeArea = ({
  children,
  className,
  edges = ['top', 'bottom']
}: SafeAreaProps) => {
  const edgeClasses = edges.map(edge => `pl-safe-${edge}`).join(' ');
  
  return (
    <div className={cn(edgeClasses, className)}>
      {children}
    </div>
  );
};