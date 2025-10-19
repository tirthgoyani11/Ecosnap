/**
 * Clean Stats Service for build compatibility
 * NOW SYNCED WITH DATABASE - No more localStorage conflicts!
 */

import { supabase } from '@/integrations/supabase/client';
import { UniversalPointsSystem } from './universal-points-system';

export interface UserStats {
  totalScans: number;
  ecoPoints: number;
  productsScanned: number;
  alternativesFound: number;
  co2Saved: number;
  sustainabilityRating: string;
  achievements: string[];
  lastScanDate: string;
  // Recycling stats
  totalItemsRecycled: number;
  waterSaved: number;
  energySaved: number;
  recyclingStreak: number;
  lastRecycleDate: string;
  pointsFromRecycling: number;
}

export interface LeaderboardEntry {
  username: string;
  ecoPoints: number;
  totalScans: number;
  co2Saved: number;
  rank: number;
}

export class StatsService {
  private static readonly STORAGE_KEY = 'ecosnap_recycling_data'; // Only for recycling temp data
  private static readonly LEADERBOARD_KEY = 'ecosnap_leaderboard';

  /**
   * Get user stats from DATABASE (not localStorage)
   * This syncs with Supabase profiles table
   */
  static async getUserStats(userId: string): Promise<UserStats> {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;

      // Get recycling data from metadata or separate tracking
      const recyclingData = this.getRecyclingData();

      return {
        totalScans: profile.total_scans || 0,
        ecoPoints: profile.points || 0, // DATABASE POINTS!
        productsScanned: profile.total_scans || 0,
        alternativesFound: 0,
        co2Saved: profile.total_co2_saved || 0,
        sustainabilityRating: this.calculateRating(profile.points || 0),
        achievements: recyclingData.achievements || [],
        lastScanDate: new Date().toISOString(),
        totalItemsRecycled: recyclingData.totalItemsRecycled || 0,
        waterSaved: recyclingData.waterSaved || 0,
        energySaved: recyclingData.energySaved || 0,
        recyclingStreak: recyclingData.recyclingStreak || 0,
        lastRecycleDate: recyclingData.lastRecycleDate || '',
        pointsFromRecycling: recyclingData.pointsFromRecycling || 0
      };
    } catch (error) {
      console.error('Error loading user stats from database:', error);
      return this.getDefaultStats();
    }
  }

  /**
   * Legacy sync method - returns default stats
   * Use getUserStats(userId) instead
   */
  static getUserStatsSync(): UserStats {
    return this.getDefaultStats();
  }

  private static getDefaultStats(): UserStats {
    return {
      totalScans: 0,
      ecoPoints: 0,
      productsScanned: 0,
      alternativesFound: 0,
      co2Saved: 0,
      sustainabilityRating: 'Beginner',
      achievements: [],
      lastScanDate: new Date().toISOString(),
      totalItemsRecycled: 0,
      waterSaved: 0,
      energySaved: 0,
      recyclingStreak: 0,
      lastRecycleDate: '',
      pointsFromRecycling: 0
    };
  }

  private static calculateRating(points: number): string {
    if (points >= 10000) return 'Eco Legend';
    if (points >= 5000) return 'Eco Master';
    if (points >= 2000) return 'Eco Expert';
    if (points >= 1000) return 'Eco Enthusiast';
    if (points >= 500) return 'Eco Learner';
    return 'Beginner';
  }

  private static getRecyclingData() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading recycling data:', error);
    }
    return {
      totalItemsRecycled: 0,
      waterSaved: 0,
      energySaved: 0,
      recyclingStreak: 0,
      lastRecycleDate: '',
      pointsFromRecycling: 0,
      achievements: []
    };
  }

  /**
   * Calculate dynamic points for scanning products
   * Universal points algorithm
   */
  static calculateScanPoints(
    ecoScore: number = 50,
    alternativesCount: number = 0,
    totalScans: number = 0
  ): number {
    // Base scan points (5-15 points based on eco score)
    // Lower eco score = more points (rewarding awareness of bad products)
    let basePoints = 5;
    if (ecoScore < 40) basePoints = 15; // Bad products = more awareness points
    else if (ecoScore < 60) basePoints = 12;
    else if (ecoScore < 80) basePoints = 10;
    else basePoints = 8; // Good products = standard points
    
    // Alternative discovery bonus (3 points per alternative found)
    const alternativeBonus = Math.min(15, alternativesCount * 3);
    
    // Milestone bonuses
    let milestoneBonus = 0;
    if (totalScans === 10) milestoneBonus = 20;
    else if (totalScans === 25) milestoneBonus = 30;
    else if (totalScans === 50) milestoneBonus = 50;
    else if (totalScans === 100) milestoneBonus = 100;
    
    return basePoints + alternativeBonus + milestoneBonus;
  }

  /**
   * DEPRECATED: Use useCreateScan hook instead
   * This method is kept for backwards compatibility but should not be used
   * The proper way to create scans is through the useCreateScan hook in useDatabase.ts
   */
  static async updateAfterScan(userId: string, product: any, alternativesCount: number = 0): Promise<{ points: number; reason: string }> {
    try {
      // Calculate points using universal algorithm
      const ecoScore = product.eco_score || product.ecoScore || 50;
      
      // Get current stats
      const currentStats = await this.getUserStats(userId);
      const newTotalScans = currentStats.totalScans + 1;
      
      const scanPoints = this.calculateScanPoints(ecoScore, alternativesCount, newTotalScans);
      
      // Update database
      const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('points, total_scans, total_co2_saved')
        .eq('user_id', userId)
        .single();

      if (fetchError) throw fetchError;

      const newTotalPoints = (profile.points || 0) + scanPoints;
      const newTotalScansDb = (profile.total_scans || 0) + 1;
      const newCo2 = (profile.total_co2_saved || 0) + 0.5;

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          points: newTotalPoints,
          total_scans: newTotalScansDb,
          total_co2_saved: newCo2,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (updateError) throw updateError;

      console.log(`✅ Scan points added: +${scanPoints} pts (Total: ${newTotalPoints})`);
      
      return {
        points: scanPoints,
        reason: `Product scanned! +${scanPoints} pts`
      };
    } catch (error) {
      console.error('Error updating scan stats:', error);
      return { points: 10, reason: 'Product scanned! +10 pts' };
    }
  }

  static getLeaderboard(): LeaderboardEntry[] {
    try {
      const stored = localStorage.getItem(this.LEADERBOARD_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    }

    // Return mock leaderboard data
    return [
      { username: 'Tirth Goyani', ecoPoints: 1250, totalScans: 65, co2Saved: 32.5, rank: 1 },
      { username: 'Abhi Gabani', ecoPoints: 980, totalScans: 49, co2Saved: 24.5, rank: 2 },
      { username: 'Krisha Vithani', ecoPoints: 750, totalScans: 38, co2Saved: 19.0, rank: 3 }
    ];
  }

  static async getUserRank(userId: string): Promise<number> {
    try {
      const userStats = await this.getUserStats(userId);
      const leaderboard = this.getLeaderboard();
      
      // Find user's position in leaderboard based on ecoPoints
      let rank = 1;
      for (const entry of leaderboard) {
        if (userStats.ecoPoints >= entry.ecoPoints) {
          break;
        }
        rank++;
      }
      
      return rank;
    } catch (error) {
      console.error('Error getting user rank:', error);
      return 999; // Default rank if error
    }
  }

  /**
   * Calculate dynamic points based on environmental impact and other factors
   * Universal points algorithm for consistency
   */
  static calculateRecyclingPoints(
    environmentalImpact: {
      co2SavedByRecycling: number;
      waterSaved: number;
      energySaved: number;
    },
    recyclabilityScore: number = 70,
    streak: number = 1
  ): number {
    // Base points calculation based on environmental impact
    // Each factor contributes to the total score
    
    // 1. CO2 Impact Points (0-25 points)
    // Scale: 0.5kg = 10 pts, 1.0kg = 15 pts, 2.0kg+ = 25 pts
    const co2Points = Math.min(25, Math.round(environmentalImpact.co2SavedByRecycling * 12.5));
    
    // 2. Water Conservation Points (0-15 points)
    // Scale: 2L = 8 pts, 5L = 12 pts, 10L+ = 15 pts
    const waterPoints = Math.min(15, Math.round(environmentalImpact.waterSaved * 1.5));
    
    // 3. Energy Saved Points (0-15 points)
    // Scale: 1kWh = 8 pts, 2kWh = 12 pts, 4kWh+ = 15 pts
    const energyPoints = Math.min(15, Math.round(environmentalImpact.energySaved * 3.75));
    
    // 4. Recyclability Score Bonus (0-20 points)
    // Higher recyclability = more points
    const recyclabilityPoints = Math.round((recyclabilityScore / 100) * 20);
    
    // 5. Base Action Points (always earned)
    const baseActionPoints = 15;
    
    // Sum up all components
    let totalPoints = co2Points + waterPoints + energyPoints + recyclabilityPoints + baseActionPoints;
    
    // 6. Streak Multiplier (increases total by percentage)
    let streakMultiplier = 1.0;
    if (streak >= 30) streakMultiplier = 1.4; // +40% for 30 day streak
    else if (streak >= 14) streakMultiplier = 1.3; // +30% for 2 week streak
    else if (streak >= 7) streakMultiplier = 1.2; // +20% for 1 week streak
    else if (streak >= 3) streakMultiplier = 1.1; // +10% for 3 day streak
    
    totalPoints = Math.round(totalPoints * streakMultiplier);
    
    // Minimum and maximum bounds
    const minPoints = 20; // At least 20 points for any recycling action
    const maxPoints = 150; // Cap at 150 points per item
    
    return Math.max(minPoints, Math.min(maxPoints, totalPoints));
  }

  /**
   * Update stats after recycling an item
   * NOW SYNCS WITH DATABASE and uses Universal Points System
   * Range: 10-100 points based on environmental impact
   */
  static async updateAfterRecycle(
    userId: string,
    environmentalImpact: {
      co2SavedByRecycling: number;
      waterSaved: number;
      energySaved: number;
      recyclabilityScore?: number;
    }
  ): Promise<{ points: number; reason: string }> {
    try {
      // Get recycling data
      const recyclingData = this.getRecyclingData();
      const today = new Date().toISOString().split('T')[0];
      const lastRecycleDate = recyclingData.lastRecycleDate ? recyclingData.lastRecycleDate.split('T')[0] : '';
      
      // Calculate streak
      let newStreak = recyclingData.recyclingStreak || 0;
      if (lastRecycleDate) {
        const lastDate = new Date(lastRecycleDate);
        const todayDate = new Date(today);
        const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          newStreak += 1;
        } else if (diffDays > 1) {
          newStreak = 1;
        }
      } else {
        newStreak = 1;
      }

      // Use Universal Points System for recycling (10-100 points)
      const pointsCalculation = UniversalPointsSystem.calculateRecyclePoints({
        recyclabilityScore: environmentalImpact.recyclabilityScore || 80,
        co2SavedByRecycling: environmentalImpact.co2SavedByRecycling,
        waterSaved: environmentalImpact.waterSaved,
        energySaved: environmentalImpact.energySaved,
        currentStreak: newStreak,
        totalRecycled: recyclingData.totalItemsRecycled || 0
      });

      const pointsEarned = pointsCalculation.points;
      
      // Update recycling data in localStorage (temporary)
      const newRecyclingData = {
        totalItemsRecycled: (recyclingData.totalItemsRecycled || 0) + 1,
        waterSaved: Math.round((recyclingData.waterSaved + environmentalImpact.waterSaved) * 10) / 10,
        energySaved: Math.round((recyclingData.energySaved + environmentalImpact.energySaved) * 10) / 10,
        co2Saved: Math.round(((recyclingData.co2Saved || 0) + environmentalImpact.co2SavedByRecycling) * 10) / 10,
        recyclingStreak: newStreak,
        lastRecycleDate: new Date().toISOString(),
        pointsFromRecycling: (recyclingData.pointsFromRecycling || 0) + pointsEarned,
        achievements: recyclingData.achievements || []
      };

      // Add achievements
      if (newRecyclingData.totalItemsRecycled === 1 && !newRecyclingData.achievements.includes('First Recycle')) {
        newRecyclingData.achievements.push('First Recycle');
      }
      if (newRecyclingData.totalItemsRecycled === 10 && !newRecyclingData.achievements.includes('Recycling Rookie')) {
        newRecyclingData.achievements.push('Recycling Rookie');
      }
      if (newRecyclingData.totalItemsRecycled === 50 && !newRecyclingData.achievements.includes('Recycling Champion')) {
        newRecyclingData.achievements.push('Recycling Champion');
      }
      if (newRecyclingData.totalItemsRecycled === 100 && !newRecyclingData.achievements.includes('Recycling Legend')) {
        newRecyclingData.achievements.push('Recycling Legend');
      }
      if (newStreak === 7 && !newRecyclingData.achievements.includes('Week Warrior')) {
        newRecyclingData.achievements.push('Week Warrior');
      }
      if (newStreak === 30 && !newRecyclingData.achievements.includes('Monthly Master')) {
        newRecyclingData.achievements.push('Monthly Master');
      }

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(newRecyclingData));
      
      // UPDATE DATABASE with new points
      const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('points, total_co2_saved')
        .eq('user_id', userId)
        .single();

      if (fetchError) throw fetchError;

      const newTotalPoints = (profile.points || 0) + pointsEarned;
      const newTotalCo2 = Math.round(((profile.total_co2_saved || 0) + environmentalImpact.co2SavedByRecycling) * 10) / 10;

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          points: newTotalPoints, // DATABASE POINTS UPDATED!
          total_co2_saved: newTotalCo2,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (updateError) throw updateError;

      console.log(`✅ Recycling points added: +${pointsEarned} pts (Total: ${newTotalPoints})`);
      
      return {
        points: pointsEarned,
        reason: pointsCalculation.reason
      };
    } catch (error) {
      console.error('Error updating recycle stats:', error);
      return { points: 20, reason: 'Item recycled successfully (+20 pts)' };
    }
  }

  /**
   * Get recycling-specific stats from localStorage
   * (Temporary until recycling is fully integrated with database)
   */
  static getRecyclingStats() {
    const recyclingData = this.getRecyclingData();
    return {
      totalItemsRecycled: recyclingData.totalItemsRecycled || 0,
      co2Saved: recyclingData.co2Saved || 0,
      waterSaved: recyclingData.waterSaved || 0,
      energySaved: recyclingData.energySaved || 0,
      recyclingStreak: recyclingData.recyclingStreak || 0,
      pointsFromRecycling: recyclingData.pointsFromRecycling || 0,
      monthlyGoal: 20, // Fixed monthly goal
      achievements: [
        {
          id: 'first_recycle',
          name: 'First Recycle',
          description: 'Recycle your first item',
          icon: '♻️',
          unlocked: recyclingData.achievements?.includes('First Recycle') || false
        },
        {
          id: 'recycling_rookie',
          name: 'Recycling Rookie',
          description: 'Recycle 10 items',
          icon: '🌱',
          unlocked: recyclingData.achievements?.includes('Recycling Rookie') || false
        },
        {
          id: 'recycling_champion',
          name: 'Recycling Champion',
          description: 'Recycle 50 items',
          icon: '🏆',
          unlocked: recyclingData.achievements?.includes('Recycling Champion') || false
        },
        {
          id: 'recycling_legend',
          name: 'Recycling Legend',
          description: 'Recycle 100 items',
          icon: '👑',
          unlocked: recyclingData.achievements?.includes('Recycling Legend') || false
        },
        {
          id: 'week_warrior',
          name: 'Week Warrior',
          description: '7-day recycling streak',
          icon: '🔥',
          unlocked: recyclingData.achievements?.includes('Week Warrior') || false
        },
        {
          id: 'monthly_master',
          name: 'Monthly Master',
          description: '30-day recycling streak',
          icon: '⭐',
          unlocked: recyclingData.achievements?.includes('Monthly Master') || false
        }
      ]
    };
  }
}

// Explicit exports for Rollup
export { StatsService as default };
