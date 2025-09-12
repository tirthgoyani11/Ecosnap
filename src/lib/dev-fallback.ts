/**
 * Development Mode Bypass
 * This file provides fallback functionality when APIs are not available
 */

// Simple in-memory storage for development
class DevStorage {
  private static data = new Map();
  
  static set(key: string, value: any) {
    this.data.set(key, JSON.stringify(value));
  }
  
  static get(key: string) {
    const stored = this.data.get(key);
    return stored ? JSON.parse(stored) : null;
  }
  
  static clear() {
    this.data.clear();
  }
}

// Development user for testing
export const createDevUser = () => ({
  id: 'dev-user-123',
  email: 'dev@example.com',
  user_metadata: {
    name: 'Development User'
  },
  created_at: new Date().toISOString()
});

// Mock Firebase/Supabase for development
export const mockAuthProvider = {
  user: null,
  userProfile: null,
  session: null,
  loading: false,
  initialized: true,
  
  async signUp() {
    const user = createDevUser();
    this.user = user;
    return { user, error: null };
  },
  
  async signIn() {
    const user = createDevUser();
    this.user = user;
    return { user, error: null };
  },
  
  async signInWithGoogle() {
    const user = createDevUser();
    this.user = user;
    return { user, error: null };
  },
  
  async signOut() {
    this.user = null;
    this.userProfile = null;
    this.session = null;
    return { error: null };
  },
  
  async updateProfile(updates: any) {
    if (this.userProfile) {
      this.userProfile = { ...this.userProfile, ...updates };
    }
  },
  
  async refreshProfile() {
    // No-op for development
  }
};

export { DevStorage };
