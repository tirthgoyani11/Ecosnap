import React, { createContext, useContext, useEffect, useState } from 'react';

// ===============================
// ENHANCED THEME PROVIDER
// ===============================

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  actualTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

export const EnhancedThemeProvider = ({
  children,
  defaultTheme = 'system',
  storageKey = 'ecosnap-theme',
}: ThemeProviderProps) => {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem(storageKey) as Theme) || defaultTheme;
    }
    return defaultTheme;
  });

  const [actualTheme, setActualTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove existing theme classes
    root.classList.remove('light', 'dark');

    let effectiveTheme: 'light' | 'dark';

    if (theme === 'system') {
      effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches 
        ? 'dark' 
        : 'light';
    } else {
      effectiveTheme = theme;
    }

    // Apply the theme class
    root.classList.add(effectiveTheme);
    setActualTheme(effectiveTheme);

    // Enhanced CSS custom properties for better dark mode
    if (effectiveTheme === 'dark') {
      root.style.setProperty('--text-contrast-high', '210 40% 98%');
      root.style.setProperty('--text-contrast-medium', '210 20% 85%');
      root.style.setProperty('--text-contrast-low', '210 15% 70%');
      root.style.setProperty('--bg-adaptive', '210 11% 4%');
      root.style.setProperty('--bg-adaptive-subtle', '210 11% 8%');
      root.style.setProperty('--border-adaptive', '217.2 32.6% 18%');
    } else {
      root.style.setProperty('--text-contrast-high', '215.4 16.3% 26.9%');
      root.style.setProperty('--text-contrast-medium', '215.4 16.3% 46.9%');
      root.style.setProperty('--text-contrast-low', '215.4 16.3% 66.9%');
      root.style.setProperty('--bg-adaptive', '0 0% 100%');
      root.style.setProperty('--bg-adaptive-subtle', '210 20% 98%');
      root.style.setProperty('--border-adaptive', '214.3 31.8% 91.4%');
    }
  }, [theme]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        const newTheme = mediaQuery.matches ? 'dark' : 'light';
        setActualTheme(newTheme);
        window.document.documentElement.classList.remove('light', 'dark');
        window.document.documentElement.classList.add(newTheme);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const setThemeWithStorage = (newTheme: Theme) => {
    localStorage.setItem(storageKey, newTheme);
    setTheme(newTheme);
  };

  const value: ThemeContextType = {
    theme,
    setTheme: setThemeWithStorage,
    actualTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// ===============================
// ENHANCED THEME TOGGLE COMPONENT
// ===============================

import { Monitor, Moon, Sun } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const EnhancedThemeToggle = ({ 
  className, 
  showLabel = false,
  size = 'md' 
}: ThemeToggleProps) => {
  const { theme, setTheme, actualTheme } = useTheme();

  const themes = [
    { value: 'light', icon: Sun, label: 'Light' },
    { value: 'dark', icon: Moon, label: 'Dark' },
    { value: 'system', icon: Monitor, label: 'System' },
  ] as const;

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12'
  };

  if (showLabel) {
    return (
      <div className={cn("flex items-center space-x-2", className)}>
        <span className="text-sm font-medium text-medium-contrast">Theme:</span>
        <div className="flex rounded-lg bg-muted p-1">
          {themes.map(({ value, icon: Icon, label }) => (
            <motion.button
              key={value}
              whileTap={{ scale: 0.95 }}
              onClick={() => setTheme(value)}
              className={cn(
                "flex items-center space-x-2 rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-200",
                theme === value
                  ? "bg-background text-high-contrast shadow-sm"
                  : "text-medium-contrast hover:text-high-contrast"
              )}
            >
              <Icon className="h-3 w-3" />
              <span>{label}</span>
            </motion.button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex rounded-lg bg-muted p-1", className)}>
      {themes.map(({ value, icon: Icon }) => (
        <motion.button
          key={value}
          whileTap={{ scale: 0.95 }}
          onClick={() => setTheme(value)}
          className={cn(
            "rounded-md p-2 transition-all duration-200",
            sizeClasses[size],
            theme === value
              ? "bg-background text-high-contrast shadow-sm"
              : "text-medium-contrast hover:text-high-contrast hover:bg-background/50"
          )}
          aria-label={`Switch to ${value} theme`}
        >
          <Icon className="h-4 w-4" />
        </motion.button>
      ))}
    </div>
  );
};

// ===============================
// THEME-AWARE COMPONENTS
// ===============================

interface ThemeAwareCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'outlined';
}

export const ThemeAwareCard = ({ 
  children, 
  className, 
  variant = 'default' 
}: ThemeAwareCardProps) => {
  const { actualTheme } = useTheme();

  const variantClasses = {
    default: actualTheme === 'dark' 
      ? "bg-slate-800/50 border-slate-700/50 backdrop-blur-sm"
      : "bg-white border-slate-200 shadow-sm",
    elevated: actualTheme === 'dark'
      ? "bg-slate-800 border-slate-700 shadow-xl shadow-black/20"
      : "bg-white border-slate-200 shadow-lg",
    outlined: actualTheme === 'dark'
      ? "bg-transparent border-slate-700 border-2"
      : "bg-transparent border-slate-300 border-2"
  };

  return (
    <div 
      className={cn(
        "rounded-xl border transition-all duration-200",
        variantClasses[variant],
        className
      )}
    >
      {children}
    </div>
  );
};

// ===============================
// ACCESSIBILITY HELPERS
// ===============================

export const useColorContrastChecker = () => {
  const { actualTheme } = useTheme();

  const getContrastClass = (level: 'high' | 'medium' | 'low') => {
    const classes = {
      high: actualTheme === 'dark' ? 'text-slate-50' : 'text-slate-900',
      medium: actualTheme === 'dark' ? 'text-slate-200' : 'text-slate-700',
      low: actualTheme === 'dark' ? 'text-slate-400' : 'text-slate-500',
    };
    return classes[level];
  };

  const getBgContrastClass = (level: 'high' | 'medium' | 'low') => {
    const classes = {
      high: actualTheme === 'dark' ? 'bg-slate-50' : 'bg-slate-900',
      medium: actualTheme === 'dark' ? 'bg-slate-700' : 'bg-slate-200',
      low: actualTheme === 'dark' ? 'bg-slate-800' : 'bg-slate-100',
    };
    return classes[level];
  };

  return {
    getContrastClass,
    getBgContrastClass,
    actualTheme,
  };
};

// ===============================
// MOTION PREFERENCES
// ===============================

export const useMotionPreferences = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = () => setPrefersReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return { prefersReducedMotion };
};