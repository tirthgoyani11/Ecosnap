/**
 * Stats Service for tracking user eco-friendly actions and leaderboard updates
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

  /**
   * Get current user stats
   */
  static getUserStats(): UserStats {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Ensure all numeric values are valid numbers, not null/undefined
        return {
          totalScans: Number(parsed.totalScans) || 0,
          ecoPoints: Number(parsed.ecoPoints) || 0,
          productsScanned: Number(parsed.productsScanned) || 0,
          alternativesFound: Number(parsed.alternativesFound) || 0,
          co2Saved: Number(parsed.co2Saved) || 0.0,
          sustainabilityRating: parsed.sustainabilityRating || 'Eco Rookie',
          achievements: Array.isArray(parsed.achievements) ? parsed.achievements : [],
          lastScanDate: parsed.lastScanDate || new Date().toISOString(),
        };
      } catch (error) {
        console.warn('Error parsing stored stats, using defaults:', error);
      }
    }

    // Default stats for new users
    return {
      totalScans: 0,
      ecoPoints: 0,
      productsScanned: 0,
      alternativesFound: 0,
      co2Saved: 0.0,
      sustainabilityRating: 'Eco Rookie',
      achievements: [],
      lastScanDate: new Date().toISOString(),
    };
  }

  /**
   * Update stats after a successful scan
   */
  static updateAfterScan(product: any, alternativesCount: number = 0): UserStats {
    const currentStats = this.getUserStats();
    
    // Calculate points based on product eco score (safely handle null/undefined)
    const ecoScore = Number(product?.ecoScore) || 50; // Default to 50 if invalid
    const basePoints = Math.floor(ecoScore / 10);
    const alternativeBonus = (Number(alternativesCount) || 0) * 5;
    const totalPoints = basePoints + alternativeBonus + 10; // Base 10 points per scan

    const updatedStats: UserStats = {
      totalScans: currentStats.totalScans + 1,
      productsScanned: currentStats.productsScanned + 1,
      alternativesFound: currentStats.alternativesFound + (Number(alternativesCount) || 0),
      ecoPoints: currentStats.ecoPoints + totalPoints,
      co2Saved: currentStats.co2Saved + (ecoScore * 0.1), // Rough CO2 calculation
      sustainabilityRating: this.calculateRating(currentStats.ecoPoints + totalPoints),
      achievements: this.updateAchievements(currentStats, {
        ecoPoints: currentStats.ecoPoints + totalPoints,
        totalScans: currentStats.totalScans + 1,
        alternativesFound: currentStats.alternativesFound + alternativesCount
      }),
      lastScanDate: new Date().toISOString(),
    };

    // Save to localStorage
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedStats));
    
    // Update leaderboard
    this.updateLeaderboard(updatedStats);
    
    return updatedStats;
  }

  /**
   * Calculate sustainability rating based on eco points
   */
  private static calculateRating(ecoPoints: number): string {
    if (ecoPoints >= 1000) return 'Eco Champion';
    if (ecoPoints >= 500) return 'Sustainability Expert';
    if (ecoPoints >= 250) return 'Green Guardian';
    if (ecoPoints >= 100) return 'Eco Enthusiast';
    if (ecoPoints >= 50) return 'Planet Protector';
    return 'Eco Rookie';
  }

  /**
   * Update achievements based on stats
   */
  private static updateAchievements(currentStats: UserStats, newStats: any): string[] {
    const achievements = [...currentStats.achievements];

    // First scan achievement
    if (newStats.totalScans === 1 && !achievements.includes('First Scan')) {
      achievements.push('First Scan');
    }

    // Scan milestones
    if (newStats.totalScans >= 10 && !achievements.includes('Scan Master')) {
      achievements.push('Scan Master');
    }
    if (newStats.totalScans >= 50 && !achievements.includes('Scan Legend')) {
      achievements.push('Scan Legend');
    }

    // Point milestones
    if (newStats.ecoPoints >= 100 && !achievements.includes('Century Club')) {
      achievements.push('Century Club');
    }
    if (newStats.ecoPoints >= 500 && !achievements.includes('Eco Warrior')) {
      achievements.push('Eco Warrior');
    }

    // Alternative finder
    if (newStats.alternativesFound >= 5 && !achievements.includes('Alternative Finder')) {
      achievements.push('Alternative Finder');
    }

    return achievements;
  }

  /**
   * Get leaderboard data
   */
  static getLeaderboard(): LeaderboardEntry[] {
    const stored = localStorage.getItem(this.LEADERBOARD_KEY);
    if (stored) {
      return JSON.parse(stored);
    }

    return [];
  }

  /**
   * Update leaderboard with current user stats
   */
  private static updateLeaderboard(userStats: UserStats): void {
    const leaderboard = this.getLeaderboard();
    const username = 'EcoUser_' + Date.now().toString().slice(-6); // Simple username generation

    // Check if user already exists
    const existingIndex = leaderboard.findIndex(entry => entry.username === username);
    
    const newEntry: LeaderboardEntry = {
      username,
      ecoPoints: userStats.ecoPoints,
      totalScans: userStats.totalScans,
      co2Saved: userStats.co2Saved,
      rank: 0 // Will be calculated below
    };

    if (existingIndex >= 0) {
      // Update existing entry
      leaderboard[existingIndex] = newEntry;
    } else {
      // Add new entry
      leaderboard.push(newEntry);
    }

    // Sort by eco points and assign ranks
    leaderboard.sort((a, b) => b.ecoPoints - a.ecoPoints);
    leaderboard.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    // Keep only top 100 entries
    const trimmedLeaderboard = leaderboard.slice(0, 100);

    localStorage.setItem(this.LEADERBOARD_KEY, JSON.stringify(trimmedLeaderboard));
  }

  /**
   * Get current user's rank
   */
  static getUserRank(): number {
    const leaderboard = this.getLeaderboard();
    const userStats = this.getUserStats();
    
    const userEntry = leaderboard.find(entry => entry.ecoPoints === userStats.ecoPoints);
    return userEntry ? userEntry.rank : leaderboard.length + 1;
  }

  /**
   * Reset all stats (for testing/development)
   */
  static resetStats(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.LEADERBOARD_KEY);
  }

  /**
   * Generate mock data for testing
   */
  static generateMockData(): void {
    const mockLeaderboard: LeaderboardEntry[] = [
      { username: 'Tirth Goyani', ecoPoints: 2500, totalScans: 150, co2Saved: 45.2, rank: 1 },
      { username: 'Abhi Gabani', ecoPoints: 2200, totalScans: 120, co2Saved: 38.7, rank: 2 },
      { username: 'Krisha Vithani', ecoPoints: 1800, totalScans: 95, co2Saved: 32.1, rank: 3 },
      { username: 'EcoWarrior', ecoPoints: 1500, totalScans: 80, co2Saved: 28.5, rank: 4 },
      { username: 'PlanetProtector', ecoPoints: 1200, totalScans: 65, co2Saved: 24.3, rank: 5 },
      { username: 'GreenThumb', ecoPoints: 1000, totalScans: 55, co2Saved: 21.8, rank: 6 },
      { username: 'EcoAdvocate', ecoPoints: 850, totalScans: 45, co2Saved: 18.9, rank: 7 },
      { username: 'ClimateChamp', ecoPoints: 720, totalScans: 38, co2Saved: 16.2, rank: 8 },
      { username: 'NatureNinja', ecoPoints: 680, totalScans: 35, co2Saved: 15.1, rank: 9 },
      { username: 'EcoExplorer', ecoPoints: 550, totalScans: 28, co2Saved: 12.7, rank: 10 },
    ];

    localStorage.setItem(this.LEADERBOARD_KEY, JSON.stringify(mockLeaderboard));
  }
}

// Export the service
export default StatsService;
