/**
 * Clean Stats Service for build compatibility
 */

export interface UserStats {
  totalScans: number;
  ecoPoints: number;
  productsScanned: number;
  alternativesFound: number;
  co2Saved: number;
  sustainabilityRating: string;
  achievements: string[];
  lastScanDate: string;
}

export interface LeaderboardEntry {
  username: string;
  ecoPoints: number;
  totalScans: number;
  co2Saved: number;
  rank: number;
}

export class StatsService {
  private static readonly STORAGE_KEY = 'ecosnap_user_stats';
  private static readonly LEADERBOARD_KEY = 'ecosnap_leaderboard';

  static getUserStats(): UserStats {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading user stats:', error);
    }

    // Return default stats
    return {
      totalScans: 0,
      ecoPoints: 0,
      productsScanned: 0,
      alternativesFound: 0,
      co2Saved: 0,
      sustainabilityRating: 'Beginner',
      achievements: [],
      lastScanDate: new Date().toISOString()
    };
  }

  static updateAfterScan(product: any, alternativesCount: number = 0): UserStats {
    const currentStats = this.getUserStats();
    
    // Update basic stats
    const newStats = {
      ...currentStats,
      totalScans: currentStats.totalScans + 1,
      productsScanned: currentStats.productsScanned + 1,
      alternativesFound: currentStats.alternativesFound + alternativesCount,
      ecoPoints: currentStats.ecoPoints + 10, // Base points per scan
      co2Saved: currentStats.co2Saved + 0.5, // Estimated CO2 saved per scan
      lastScanDate: new Date().toISOString()
    };

    // Update achievements
    newStats.achievements = [...currentStats.achievements];
    if (newStats.totalScans === 1) {
      newStats.achievements.push('First Scan');
    }
    if (newStats.totalScans === 10) {
      newStats.achievements.push('Scan Master');
    }

    // Save updated stats
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(newStats));
    
    return newStats;
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

  static getUserRank(): number {
    const userStats = this.getUserStats();
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
  }
}

// Explicit exports for Rollup
export { StatsService as default };
