import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  Home, 
  Search, 
  Camera, 
  Package, 
  BarChart3, 
  Trophy, 
  Settings,
  Menu,
  X,
  Leaf
} from 'lucide-react';
import { MobileButton } from './ui/enhanced-mobile';

// ===============================
// MOBILE-FIRST NAVIGATION COMPONENT
// ===============================

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
  badge?: string;
}

const navItems: NavItem[] = [
  { label: 'Home', path: '/', icon: Home },
  { label: 'Scanner', path: '/scanner', icon: Camera },
  { label: 'Discover', path: '/discover', icon: Search },
  { label: 'Bulk Scan', path: '/bulk', icon: Package },
  { label: 'Dashboard', path: '/dashboard', icon: BarChart3 },
  { label: 'Leaderboard', path: '/leaderboard', icon: Trophy },
  { label: 'Settings', path: '/settings', icon: Settings },
];

export const MobileNavigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Mobile Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-adaptive backdrop-blur-sm md:hidden">
        <div className="flex h-16 items-center justify-between px-4">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Leaf className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-high-contrast">EcoSnap</span>
          </Link>

          {/* Mobile Menu Button */}
          <MobileButton
            variant="ghost"
            size="touch"
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </MobileButton>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile Side Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.nav
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="fixed left-0 top-0 z-50 h-full w-72 bg-adaptive border-r shadow-xl md:hidden"
          >
            <div className="flex h-16 items-center justify-between px-4 border-b">
              <Link to="/" className="flex items-center space-x-2" onClick={() => setIsOpen(false)}>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                  <Leaf className="h-5 w-5 text-white" />
                </div>
                <span className="text-lg font-bold text-high-contrast">EcoSnap AI</span>
              </Link>
              <MobileButton
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </MobileButton>
            </div>

            <div className="p-4 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center space-x-3 rounded-xl px-4 py-3 transition-all duration-200 touch-target",
                      active
                        ? "bg-primary text-white shadow-md"
                        : "text-medium-contrast hover:bg-muted hover:text-high-contrast"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                    {item.badge && (
                      <span className="ml-auto rounded-full bg-red-500 px-2 py-1 text-xs text-white">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Bottom Section */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-adaptive-subtle">
              <div className="text-center">
                <div className="text-sm text-low-contrast">EcoSnap AI v2.0</div>
                <div className="text-xs text-low-contrast mt-1">
                  Making sustainable choices easier
                </div>
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>

      {/* Bottom Tab Bar (Alternative Mobile Navigation) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-adaptive border-t backdrop-blur-sm md:hidden">
        <div className="flex items-center justify-around py-2">
          {navItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-all duration-200 touch-target",
                  active
                    ? "text-primary"
                    : "text-low-contrast hover:text-medium-contrast"
                )}
              >
                <Icon className="h-5 w-5 mb-1" />
                <span className="text-xs font-medium">{item.label}</span>
                {item.badge && (
                  <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 flex items-center justify-center">
                    <span className="text-xs text-white">{item.badge}</span>
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
};

// ===============================
// DESKTOP NAVIGATION COMPONENT
// ===============================

export const DesktopNavigation = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="hidden md:flex items-center space-x-6">
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.path);
        
        return (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex items-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
              active
                ? "text-primary bg-primary/10"
                : "text-medium-contrast hover:text-high-contrast hover:bg-muted"
            )}
          >
            <Icon className="h-4 w-4" />
            <span>{item.label}</span>
            {item.badge && (
              <span className="ml-1 rounded-full bg-red-500 px-2 py-1 text-xs text-white">
                {item.badge}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
};

// ===============================
// RESPONSIVE PAGE WRAPPER
// ===============================

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  className?: string;
  showBottomNav?: boolean;
}

export const ResponsiveLayout = ({ 
  children, 
  className,
  showBottomNav = true 
}: ResponsiveLayoutProps) => {
  return (
    <div className="min-h-screen bg-adaptive">
      <MobileNavigation />
      
      {/* Main Content */}
      <main className={cn(
        "container mx-auto px-4 py-6",
        // Add top padding for mobile header
        "pt-20 md:pt-6",
        // Add bottom padding for mobile bottom nav
        showBottomNav && "pb-20 md:pb-6",
        className
      )}>
        {children}
      </main>
    </div>
  );
};

// ===============================
// FLOATING ACTION BUTTON
// ===============================

interface FloatingActionButtonProps {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  className?: string;
}

export const FloatingActionButton = ({
  icon: Icon,
  label,
  onClick,
  className
}: FloatingActionButtonProps) => {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={cn(
        "fixed bottom-20 right-4 z-30 h-14 w-14 rounded-full",
        "bg-primary text-white shadow-lg hover:shadow-xl",
        "flex items-center justify-center transition-all duration-200",
        "md:bottom-6 md:right-6",
        className
      )}
      aria-label={label}
    >
      <Icon className="h-6 w-6" />
    </motion.button>
  );
};