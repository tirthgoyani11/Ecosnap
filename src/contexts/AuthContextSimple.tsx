import React, { createContext, useContext, useState } from 'react';

interface AuthContextType {
  user: any | null;
  session: any | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error?: string }>;
  signInWithGoogle: () => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: { full_name?: string; username?: string; avatar_url?: string }) => Promise<{ error?: string }>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Mock user for testing
const mockUser = {
  id: 'mock-user-1',
  email: 'test@example.com',
  full_name: 'Test User',
  username: 'testuser',
  avatar_url: null
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user] = useState(mockUser);
  const [session] = useState({ user: mockUser });
  const [loading] = useState(false);

  const signIn = async (email: string, password: string) => {
    return {};
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    return {};
  };

  const signInWithGoogle = async () => {
    return {};
  };

  const signOut = async () => {
    // Mock sign out
  };

  const updateProfile = async (updates: any) => {
    return {};
  };

  const value: AuthContextType = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
