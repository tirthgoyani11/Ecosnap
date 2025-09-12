import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { firestoreService } from '@/services/firestoreService';
import { UserProfile } from '@/types/firestore.types';
import { initializeFirebase, waitForFirebase } from '@/lib/firebase';
import { toast } from '@/hooks/use-toast';

interface AuthState {
  user: User | null;
  userProfile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  initialized: boolean;
}

interface AuthContextType extends AuthState {
  signUp: (email: string, password: string, userData?: { name?: string }) => Promise<{ user: User | null; error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ user: User | null; error: AuthError | null }>;
  signInWithGoogle: () => Promise<{ user: User | null; error: AuthError | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    userProfile: null,
    session: null,
    loading: true,
    initialized: false
  });

  // Initialize Firebase and set up auth state
  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        // Initialize Firebase first with timeout
        const initTimeout = setTimeout(() => {
          console.warn('Firebase initialization taking too long, continuing without it...');
          if (isMounted) {
            setState(prev => ({ ...prev, loading: false, initialized: true }));
          }
        }, 5000); // 5 second timeout

        await initializeFirebase();
        await waitForFirebase();
        clearTimeout(initTimeout);

        // Get initial session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          if (isMounted) {
            setState(prev => ({ ...prev, loading: false, initialized: true }));
          }
          return;
        }

        if (session?.user && isMounted) {
          const userProfile = await loadUserProfile(session.user);
          setState(prev => ({
            ...prev,
            user: session.user,
            userProfile,
            session,
            loading: false,
            initialized: true
          }));
        } else if (isMounted) {
          setState(prev => ({ ...prev, loading: false, initialized: true }));
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        // Always set initialized to true to prevent infinite loading
        if (isMounted) {
          setState(prev => ({ ...prev, loading: false, initialized: true }));
        }
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  // Set up auth state listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, session?.user?.id);

      try {
        if (session?.user && session.user.id) {
          console.log('Loading profile for authenticated user:', session.user.id);
          const userProfile = await loadUserProfile(session.user);
          setState(prev => ({
            ...prev,
            user: session.user,
            userProfile,
            session,
            loading: false
          }));

          if (event === 'SIGNED_IN' && userProfile) {
            toast({
              title: "Welcome back!",
              description: `Hello ${userProfile?.name || session.user.email}`,
            });
          }
        } else {
          setState(prev => ({
            ...prev,
            user: null,
            userProfile: null,
            session: null,
            loading: false
          }));

          if (event === 'SIGNED_OUT') {
            toast({
              title: "Signed out",
              description: "You have been signed out successfully",
            });
          }
        }
      } catch (error) {
        console.error('Error handling auth state change:', error);
        setState(prev => ({ ...prev, loading: false }));
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (user: User): Promise<UserProfile | null> => {
    try {
      // Validate user object
      if (!user || !user.id) {
        console.warn('Invalid user object provided to loadUserProfile');
        return null;
      }

      console.log('Loading profile for user:', user.id);
      await waitForFirebase();
      
      // Try to get existing profile
      let userProfile = await firestoreService.getUserProfile(user.id);
      
      // If no profile exists, create one
      if (!userProfile) {
        console.log('Creating new user profile for:', user.id);
        
        const newProfile = {
          name: user.user_metadata?.full_name || 
                user.user_metadata?.name || 
                user.email?.split('@')[0] || 
                'Eco User',
          email: user.email || '',
          avatarUrl: user.user_metadata?.avatar_url || user.user_metadata?.picture,
          points: 0,
          totalScans: 0,
          ecoScore: 0,
          preferences: {
            theme: 'system' as const,
            notifications: true,
            sustainabilityGoals: []
          }
        };

        userProfile = await firestoreService.createUserProfile(user.id, newProfile);
        
        if (userProfile) {
          toast({
            title: "Welcome to EcoSnap!",
            description: "Your profile has been created successfully",
          });
        }
      } else {
        console.log('User profile loaded successfully for:', user.id);
      }
      
      return userProfile;
    } catch (error) {
      console.error('Error loading user profile:', error);
      
      // Check if it's a Firebase connection error
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      if (errorMessage.includes('Failed to get document') || 
          errorMessage.includes('network') || 
          errorMessage.includes('timeout') ||
          errorMessage.includes('UNAVAILABLE') ||
          errorMessage.includes('permission-denied')) {
        // Network or connection error - create a temporary profile
        console.warn('Network/permission error loading profile, creating temporary profile:', errorMessage);
        
        // Create a temporary profile for offline use
        return {
          id: user.id,
          name: user.user_metadata?.full_name || 
                user.user_metadata?.name || 
                user.email?.split('@')[0] || 
                'Eco User',
          email: user.email || '',
          avatarUrl: user.user_metadata?.avatar_url || user.user_metadata?.picture,
          points: 0,
          totalScans: 0,
          ecoScore: 0,
          preferences: {
            theme: 'system' as const,
            notifications: true,
            sustainabilityGoals: []
          }
        } as UserProfile;
      }
      
      // Silent error handling - no toast notification
      return null;
    }
  };

  const signUp = async (email: string, password: string, userData?: { name?: string }) => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: userData?.name
          }
        }
      });

      if (error) {
        toast({
          title: "Sign Up Failed",
          description: error.message,
          variant: "destructive"
        });
      } else if (data.user && !data.session) {
        toast({
          title: "Check your email",
          description: "Please check your email for a confirmation link",
        });
      }

      return { user: data.user, error };
    } catch (error) {
      return { user: null, error: error as AuthError };
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        toast({
          title: "Sign In Failed",
          description: error.message,
          variant: "destructive"
        });
      }

      return { user: data.user, error };
    } catch (error) {
      return { user: null, error: error as AuthError };
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  const signInWithGoogle = async () => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });

      if (error) {
        toast({
          title: "Google Sign In Failed",
          description: error.message,
          variant: "destructive"
        });
        return { user: null, error };
      }

      // OAuth will redirect, so we return empty values
      return { user: null, error: null };
    } catch (error) {
      return { user: null, error: error as AuthError };
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  const signOut = async () => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        toast({
          title: "Sign Out Failed",
          description: error.message,
          variant: "destructive"
        });
      }

      return { error };
    } catch (error) {
      return { error: error as AuthError };
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!state.user || !state.userProfile) {
      throw new Error('No user logged in');
    }

    try {
      const updatedProfile = await firestoreService.updateUserProfile(
        state.user.id,
        updates
      );

      if (updatedProfile) {
        setState(prev => ({
          ...prev,
          userProfile: updatedProfile
        }));

        toast({
          title: "Profile Updated",
          description: "Your profile has been updated successfully",
        });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const refreshProfile = async () => {
    if (!state.user) return;

    try {
      const userProfile = await firestoreService.getUserProfile(state.user.id);
      setState(prev => ({ ...prev, userProfile }));
    } catch (error) {
      console.error('Error refreshing profile:', error);
    }
  };

  const value: AuthContextType = {
    ...state,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    updateProfile,
    refreshProfile
  };

  // Don't render children until Firebase is initialized
  if (!state.initialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
