import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAuth = true 
}) => {
  const { user, loading, session } = useAuth();
  const location = useLocation();
  const [forceSkipLoading, setForceSkipLoading] = useState(false);

  // Fallback: After 8 seconds, skip loading to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      console.log('ProtectedRoute: Forcing skip loading after timeout');
      setForceSkipLoading(true);
    }, 8000);

    return () => clearTimeout(timeout);
  }, []);

  // Show loading spinner while authentication is being determined
  if (loading && !forceSkipLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mb-6">
            <div className="w-16 h-16 mx-auto bg-green-500 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <LoadingSpinner size="lg" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            Welcome to EcoSnap Sparkle
          </h3>
          <p className="text-gray-600 mb-4">
            Your AI-powered sustainability companion
          </p>
          <p className="text-sm text-gray-500">
            Initializing your eco-friendly experience...
          </p>
        </div>
      </div>
    );
  }

  if (requireAuth && !user) {
    // Redirect to login page with return url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!requireAuth && user) {
    // If user is logged in and trying to access auth pages, redirect to dashboard
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
