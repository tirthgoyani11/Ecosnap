import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Scan, Zap, User, LogOut, Settings } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/ThemeToggle";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

// Navigation items for authenticated users
const authenticatedNavItems = [
  { name: "Home", href: "/", icon: Zap },
  { name: "Scanner", href: "/scanner", icon: Scan },
  { name: "Bulk Scan", href: "/bulk", icon: Menu },
  { name: "Dashboard", href: "/dashboard", icon: Zap },
  { name: "Leaderboard", href: "/leaderboard", icon: Zap },
];

// Navigation items for public users
const publicNavItems = [
  { name: "Home", href: "/", icon: Zap },
];

export function NavBar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <>
      {/* Desktop Navigation */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 glass-card border-b backdrop-blur-xl"
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2"
              >
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  EcoSnap AI
                </span>
              </motion.div>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link key={item.name} to={item.href}>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        variant={isActive ? "secondary" : "ghost"}
                        className={cn(
                          "relative transition-all duration-200",
                          isActive && "bg-primary/10 text-primary"
                        )}
                      >
                        {item.name}
                        {isActive && (
                          <motion.div
                            layoutId="activeTab"
                            className="absolute inset-x-0 bottom-0 h-0.5 bg-primary rounded-full"
                          />
                        )}
                      </Button>
                    </motion.div>
                  </Link>
                );
              })}
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-2">
              <ThemeToggle />
              <Link to="/scanner">
                <Button className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90">
                  <Scan className="h-4 w-4 mr-2" />
                  Try Scanner
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center space-x-2">
              <ThemeToggle />
              <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] glass-card border-l">
                  <div className="flex flex-col space-y-4 mt-8">
                    {navItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = location.pathname === item.href;
                      return (
                        <Link 
                          key={item.name} 
                          to={item.href}
                          onClick={() => setMobileOpen(false)}
                        >
                          <motion.div
                            whileHover={{ x: 8 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Button
                              variant={isActive ? "secondary" : "ghost"}
                              className="w-full justify-start"
                            >
                              <Icon className="h-4 w-4 mr-3" />
                              {item.name}
                            </Button>
                          </motion.div>
                        </Link>
                      );
                    })}
                    
                    <div className="pt-4 border-t">
                      <Link to="/scanner" onClick={() => setMobileOpen(false)}>
                        <Button className="w-full bg-gradient-to-r from-primary to-secondary">
                          <Scan className="h-4 w-4 mr-2" />
                          Try Scanner
                        </Button>
                      </Link>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Spacer to prevent content from hiding under navbar */}
      <div className="h-16"></div>
    </>
  );
}