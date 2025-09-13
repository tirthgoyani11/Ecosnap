import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { NavBar } from "@/components/NavBar";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";

// Create a query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

// Pages
import IndexEnhanced from "./pages/IndexEnhanced";
import LoginNew from "./pages/LoginNew";
import SignUpNew from "./pages/SignUpNew";
import { SmartScanner } from "../src/components/SmartScanner";
import { ProductDetailsPage } from "../src/components/ProductDetailsPage";
import Dashboard from './pages/Dashboard';
import BulkScan from "./pages/BulkScan";
import SuperDiscover from "./pages/SuperDiscover";
import DiscoverNewEnhanced from "./pages/DiscoverNewEnhanced";
import Leaderboard from "./pages/Leaderboard";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Footer from "./components/Footer";

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen bg-background">
            <NavBar />
            <Routes>
            <Route path="/" element={<IndexEnhanced />} />
            
            {/* Auth Routes */}
            <Route 
              path="/login" 
              element={
                <ProtectedRoute requireAuth={false}>
                  <LoginNew />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/signup" 
              element={
                <ProtectedRoute requireAuth={false}>
                  <SignUpNew />
                </ProtectedRoute>
              } 
            />
            
            {/* Protected Routes */}
            <Route 
              path="/scanner" 
              element={
                <ProtectedRoute>
                  <SmartScanner />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/product/:productId" 
              element={
                <ProtectedRoute>
                  <ProductDetailsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/bulk" 
              element={
                <ProtectedRoute>
                  <BulkScan />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/discover" 
              element={
                <ProtectedRoute>
                  <SuperDiscover />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/discover-new" 
              element={
                <ProtectedRoute>
                  <DiscoverNewEnhanced />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/leaderboard" 
              element={
                <ProtectedRoute>
                  <Leaderboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/settings" 
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              } 
            />
            
            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Footer />
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </AuthProvider>
</QueryClientProvider>
);

export default App;
