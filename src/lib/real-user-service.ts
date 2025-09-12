/**
 * Real User Authentication Service
 * Handles user registration, login, profiles, and real-time data
 */

import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  full_name: string;
  avatar_url?: string;
  bio?: string;
  location?: string;
  total_scans: number;
  eco_score_avg: number;
  co2_saved: number;
  points: number;
  level: number;
  badges: string[];
  achievements: Achievement[];
  created_at: string;
  updated_at: string;
  preferences: {
    notifications: boolean;
    privacy_level: 'public' | 'friends' | 'private';
    eco_goals: string[];
  };
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked_at: string;
  progress: number;
  max_progress: number;
}

export interface ScanHistory {
  id: string;
  user_id: string;
  product_name: string;
  product_image: string;
  eco_score: number;
  carbon_footprint: number;
  barcode?: string;
  scan_method: 'camera' | 'upload' | 'manual';
  location?: {
    lat: number;
    lng: number;
    address: string;
  };
  scanned_at: string;
  alternatives_found: number;
  action_taken?: 'viewed_alternatives' | 'switched_product' | 'shared' | 'none';
}

export class RealUserService {
  /**
   * Register new user with email and password
   */
  static async signUp(email: string, password: string, userData: {
    username: string;
    full_name: string;
  }): Promise<{ user: User | null; error: Error | null }> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: userData.username,
            full_name: userData.full_name,
          }
        }
      });

      if (error) throw error;

      // Create user profile
      if (data.user) {
        await this.createUserProfile(data.user, userData);
      }

      return { user: data.user, error: null };
    } catch (error) {
      console.error('❌ Sign up error:', error);
      return { user: null, error: error as Error };
    }
  }

  /**
   * Sign in user
   */
  static async signIn(email: string, password: string): Promise<{ user: User | null; error: Error | null }> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      return { user: data.user, error: null };
    } catch (error) {
      console.error('❌ Sign in error:', error);
      return { user: null, error: error as Error };
    }
  }

  /**
   * Sign out user
   */
  static async signOut(): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase.auth.signOut();
      return { error };
    } catch (error) {
      console.error('❌ Sign out error:', error);
      return { error: error as Error };
    }
  }

  /**
   * Get current session
   */
  static async getCurrentSession(): Promise<Session | null> {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  }

  /**
   * Create user profile after registration
   */
  private static async createUserProfile(user: User, userData: any): Promise<void> {
    const { error } = await supabase
      .from('profiles')
      .insert({
        user_id: user.id,
        username: userData.username,
        full_name: userData.full_name,
        total_scans: 0,
        eco_score_avg: 0,
        total_co2_saved: 0,
        points: 0
      });

    if (error) {
      console.error('❌ Profile creation error:', error);
      throw error;
    }
  }

  /**
   * Get user profile
   */
  static async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.error('❌ Get profile error:', error);
      return null;
    }
  }

  /**
   * Update user profile
   */
  static async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<void> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('❌ Update profile error:', error);
      throw error;
    }
  }

  /**
   * Record a product scan
   */
  static async recordScan(userId: string, scanData: {
    product_name: string;
    product_image: string;
    eco_score: number;
    carbon_footprint: number;
    barcode?: string;
    scan_method: 'camera' | 'upload' | 'manual';
    location?: any;
    alternatives_found: number;
  }): Promise<void> {
    try {
      // Insert scan record
      const { error: scanError } = await supabase
        .from('scans')
        .insert({
          user_id: userId,
          ...scanData,
          scanned_at: new Date().toISOString()
        });

      if (scanError) throw scanError;

      // Update user stats
      await this.updateUserStats(userId, scanData);

      console.log('✅ Scan recorded successfully');
    } catch (error) {
      console.error('❌ Record scan error:', error);
      throw error;
    }
  }

  /**
   * Update user statistics after scan
   */
  private static async updateUserStats(userId: string, scanData: any): Promise<void> {
    try {
      // Get current profile
      const profile = await this.getUserProfile(userId);
      if (!profile) return;

      // Calculate new stats
      const totalScans = profile.total_scans + 1;
      const newEcoAverage = (profile.eco_score_avg * profile.total_scans + scanData.eco_score) / totalScans;
      const co2Saved = profile.co2_saved + (scanData.eco_score > 70 ? scanData.carbon_footprint * 0.3 : 0);
      const points = profile.points + this.calculateScanPoints(scanData.eco_score);
      const level = Math.floor(points / 1000) + 1;

      // Check for new achievements
      const newAchievements = await this.checkAchievements(profile, totalScans, newEcoAverage, co2Saved);

      await this.updateUserProfile(userId, {
        total_scans: totalScans,
        eco_score_avg: Number(newEcoAverage.toFixed(1)),
        co2_saved: Number(co2Saved.toFixed(2)),
        points,
        level,
        achievements: [...profile.achievements, ...newAchievements]
      });
    } catch (error) {
      console.error('❌ Update stats error:', error);
    }
  }

  /**
   * Calculate points for a scan
   */
  private static calculateScanPoints(ecoScore: number): number {
    if (ecoScore >= 90) return 50;
    if (ecoScore >= 80) return 30;
    if (ecoScore >= 70) return 20;
    if (ecoScore >= 60) return 10;
    return 5;
  }

  /**
   * Check for new achievements
   */
  private static async checkAchievements(profile: UserProfile, totalScans: number, ecoAverage: number, co2Saved: number): Promise<Achievement[]> {
    const newAchievements: Achievement[] = [];
    const existingIds = profile.achievements.map(a => a.id);

    // First scan achievement
    if (totalScans === 1 && !existingIds.includes('first_scan')) {
      newAchievements.push({
        id: 'first_scan',
        title: 'First Steps',
        description: 'Completed your first eco scan!',
        icon: '🌱',
        unlocked_at: new Date().toISOString(),
        progress: 1,
        max_progress: 1
      });
    }

    // Eco warrior achievement
    if (totalScans >= 50 && !existingIds.includes('eco_warrior')) {
      newAchievements.push({
        id: 'eco_warrior',
        title: 'Eco Warrior',
        description: 'Scanned 50 products!',
        icon: '⚡',
        unlocked_at: new Date().toISOString(),
        progress: totalScans,
        max_progress: 50
      });
    }

    // High eco score achievement
    if (ecoAverage >= 80 && totalScans >= 10 && !existingIds.includes('eco_champion')) {
      newAchievements.push({
        id: 'eco_champion',
        title: 'Eco Champion',
        description: 'Maintained 80+ average eco score!',
        icon: '🏆',
        unlocked_at: new Date().toISOString(),
        progress: ecoAverage,
        max_progress: 100
      });
    }

    // CO2 saver achievement
    if (co2Saved >= 10 && !existingIds.includes('carbon_saver')) {
      newAchievements.push({
        id: 'carbon_saver',
        title: 'Carbon Saver',
        description: 'Saved 10kg of CO2!',
        icon: '🌍',
        unlocked_at: new Date().toISOString(),
        progress: co2Saved,
        max_progress: 10
      });
    }

    return newAchievements;
  }

  /**
   * Get user scan history
   */
  static async getScanHistory(userId: string, limit = 20, offset = 0): Promise<ScanHistory[]> {
    try {
      const { data, error } = await supabase
        .from('scans')
        .select('*')
        .eq('user_id', userId)
        .order('scanned_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('❌ Get scan history error:', error);
      return [];
    }
  }

  /**
   * Get real-time stats for dashboard
   */
  static async getDashboardStats(userId: string): Promise<any> {
    try {
      const profile = await this.getUserProfile(userId);
      if (!profile) return null;

      // Get recent scans for trends
      const recentScans = await this.getScanHistory(userId, 30);
      
      // Calculate trends
      const last7Days = recentScans.filter(scan => 
        new Date(scan.scanned_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      );

      return {
        ...profile,
        recent_scans: recentScans.length,
        weekly_scans: last7Days.length,
        weekly_eco_average: last7Days.length > 0 
          ? last7Days.reduce((sum, scan) => sum + scan.eco_score, 0) / last7Days.length
          : profile.eco_score_avg,
        trending_up: last7Days.length > (recentScans.length - last7Days.length) / 3
      };
    } catch (error) {
      console.error('❌ Get dashboard stats error:', error);
      return null;
    }
  }
}

export default RealUserService;
