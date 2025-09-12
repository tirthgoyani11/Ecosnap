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
import { useProfile } from "@/hooks/useDatabase";
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
  const navigate = useNavigate();
  const { user, signOut, loading } = useAuth();
  const { data: profile } = useProfile();
  
  const navItems = user ? authenticatedNavItems : publicNavItems;

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getUserInitials = (name?: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

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
                  <Link
                    key={item.name}
                    to={item.href}
                    className={cn(
                      "px-4 py-2 rounded-lg transition-all duration-200 font-medium",
                      isActive
                        ? "bg-primary/10 text-primary border border-primary/20"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    )}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </div>

            {/* Desktop Auth Section */}
            <div className="hidden md:flex items-center space-x-4">
              <ThemeToggle />
              
              {loading ? (
                <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
              ) : user ? (
                <div className="flex items-center space-x-3">
                  {profile && (
                    <div className="text-right text-sm">
                      <div className="font-medium">{profile.points} pts</div>
                      <div className="text-xs text-muted-foreground">{profile.total_scans} scans</div>
                    </div>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.user_metadata?.avatar_url} alt={user.user_metadata?.full_name} />
                          <AvatarFallback>{getUserInitials(user.user_metadata?.full_name)}</AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {user.user_metadata?.full_name || 'User'}
                          </p>
                          <p className="text-xs leading-none text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => navigate('/settings')}>
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleSignOut}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" onClick={() => navigate('/login')}>
                    Sign In
                  </Button>
                  <Button onClick={() => navigate('/signup')}>
                    Sign Up
                  </Button>
                </div>
              )}
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
                <SheetContent side="right" className="w-72">
                  <div className="flex flex-col h-full">
                    {/* Mobile Logo */}
                    <div className="flex items-center space-x-2 mb-8">
                      <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                        <Zap className="h-5 w-5 text-white" />
                      </div>
                      <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                        EcoSnap AI
                      </span>
                    </div>

                    {/* Mobile Navigation Links */}
                    <nav className="flex-1 space-y-2">
                      {navItems.map((item) => {
                        const isActive = location.pathname === item.href;
                        return (
                          <Link
                            key={item.name}
                            to={item.href}
                            onClick={() => setMobileOpen(false)}
                            className={cn(
                              "flex items-center space-x-3 px-3 py-3 rounded-lg transition-colors text-sm font-medium",
                              isActive
                                ? "bg-primary/10 text-primary"
                                : "text-muted-foreground hover:text-foreground hover:bg-accent"
                            )}
                          >
                            <item.icon className="h-5 w-5" />
                            <span>{item.name}</span>
                          </Link>
                        );
                      })}
                    </nav>

                    {/* Mobile Auth Section */}
                    <div className="border-t pt-4">
                      {loading ? (
                        <div className="flex items-center space-x-3 px-3 py-3">
                          <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-muted rounded animate-pulse" />
                            <div className="h-3 bg-muted rounded w-2/3 animate-pulse" />
                          </div>
                        </div>
                      ) : user ? (
                        <div className="space-y-4">
                          <div className="flex items-center space-x-3 px-3 py-3 rounded-lg bg-accent/50">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={user.user_metadata?.avatar_url} alt={user.user_metadata?.full_name} />
                              <AvatarFallback>{getUserInitials(user.user_metadata?.full_name)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <p className="text-sm font-medium">
                                {user.user_metadata?.full_name || 'User'}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {user.email}
                              </p>
                            </div>
                          </div>
                          
                          {profile && (
                            <div className="grid grid-cols-3 gap-3">
                              <div className="text-center p-3 rounded-lg bg-primary/5">
                                <div className="text-lg font-bold text-primary">{profile.total_scans}</div>
                                <div className="text-xs text-muted-foreground">Scans</div>
                              </div>
                              <div className="text-center p-3 rounded-lg bg-emerald-500/5">
                                <div className="text-lg font-bold text-emerald-600">{profile.points}</div>
                                <div className="text-xs text-muted-foreground">Points</div>
                              </div>
                              <div className="text-center p-3 rounded-lg bg-blue-500/5">
                                <div className="text-lg font-bold text-blue-600">{Math.round(profile.total_co2_saved)}kg</div>
                                <div className="text-xs text-muted-foreground">CO₂ Saved</div>
                              </div>
                            </div>
                          )}
                          
                          <div className="space-y-2">
                            <Button
                              variant="ghost"
                              onClick={() => {
                                navigate('/settings');
                                setMobileOpen(false);
                              }}
                              className="w-full justify-start"
                            >
                              <Settings className="mr-2 h-4 w-4" />
                              Settings
                            </Button>
                            <Button
                              variant="ghost"
                              onClick={() => {
                                handleSignOut();
                                setMobileOpen(false);
                              }}
                              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <LogOut className="mr-2 h-4 w-4" />
                              Sign Out
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Button
                            variant="ghost"
                            onClick={() => {
                              navigate('/login');
                              setMobileOpen(false);
                            }}
                            className="w-full justify-start"
                          >
                            <User className="mr-2 h-4 w-4" />
                            Sign In
                          </Button>
                          <Button
                            onClick={() => {
                              navigate('/signup');
                              setMobileOpen(false);
                            }}
                            className="w-full"
                          >
                            Sign Up
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Spacer to prevent content from going under fixed nav */}
      <div className="h-16" />
    </>
  );
}
