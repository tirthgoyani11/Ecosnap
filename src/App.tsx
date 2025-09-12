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
import Index from "./pages/Index";
import IndexEnhanced from "./pages/IndexEnhanced";
import Login from "./pages/Login";
import LoginNew from "./pages/LoginNew";
import SignUp from "./pages/SignUp";
import SignUpNew from "./pages/SignUpNew";
import Scanner from "./pages/Scanner";
import { SmartScanner } from "../src/components/SmartScanner";
import DashboardNew from './pages/DashboardNew';
import Dashboard from './pages/Dashboard';
import BulkScan from "./pages/BulkScan";
import Discover from "./pages/Discover";
import SuperDiscover from "./pages/SuperDiscover";
import DiscoverNew from "./pages/DiscoverNew";
import DiscoverNewEnhanced from "./pages/DiscoverNewEnhanced";
import Leaderboard from "./pages/Leaderboard";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import TestPage from "./pages/TestPage";
import SimpleTest from "./pages/SimpleTest";
import RoutingTest from "./pages/RoutingTest";
import Developer from "./pages/Developer";
import DemoShowcase from "./pages/DemoShowcase";
import DataFlowTest from "@/components/DataFlowTest";
import Footer from "@/components/Footer";

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
            <Route path="/home-original" element={<Index />} />
            <Route path="/demo" element={<DemoShowcase />} />
            
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
              path="/login-old" 
              element={
                <ProtectedRoute requireAuth={false}>
                  <Login />
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
            <Route 
              path="/signup-old" 
              element={
                <ProtectedRoute requireAuth={false}>
                  <SignUp />
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
              path="/scanner-original" 
              element={
                <ProtectedRoute>
                  <Scanner />
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
              path="/dashboard-original" 
              element={
                <ProtectedRoute>
                  <DashboardNew />
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
            
            {/* Test Routes */}
            <Route path="/test" element={<TestPage />} />
            <Route path="/simple" element={<SimpleTest />} />
            <Route path="/routing-test" element={<RoutingTest />} />
            <Route path="/data-test" element={<DataFlowTest />} />
            <Route path="/developer" element={<Developer />} />
            
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
