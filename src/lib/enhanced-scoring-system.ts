/**
 * Enhanced Scoring System for EcoSnap
 * Provides sophisticated scoring algorithms and achievement tracking
 */

export interface EnhancedScoreCalculation {
  basePoints: number;
  ecoScoreBonus: number;
  consecutiveScanBonus: number;
  categoryBonus: number;
  alternativesBonus: number;
  co2SavedBonus: number;
  qualityBonus: number;
  totalPoints: number;
  breakdown: string[];
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  points: number;
  condition: (stats: UserStats) => boolean;
  unlocked?: boolean;
  unlockedAt?: string;
}

export interface UserStats {
  totalScans: number;
  totalPoints: number;
  totalCo2Saved: number;
  averageEcoScore: number;
  consecutiveScans: number;
  lastScanDate: string;
  categoriesScanned: Record<string, number>;
  alternativesFound: number;
  level: number;
  xp: number;
  streak: number;
}

export class EnhancedScoringSystem {
  
  /**
   * Calculate comprehensive points for a scan
   */
  static calculatePoints(scanData: {
    ecoScore: number;
    category: string;
    alternatives: number;
    co2Footprint?: number;
    isConsecutive: boolean;
    scanQuality: 'low' | 'medium' | 'high';
    userStats: UserStats;
  }): EnhancedScoreCalculation {
    
    const breakdown: string[] = [];
    
    // Base points (10-30 based on eco score ranges)
    let basePoints = 10;
    if (scanData.ecoScore >= 80) {
      basePoints = 30;
      breakdown.push("High eco-score product (+30)");
    } else if (scanData.ecoScore >= 60) {
      basePoints = 20;
      breakdown.push("Good eco-score product (+20)");
    } else {
      breakdown.push("Product scanned (+10)");
    }

    // Eco Score Bonus (0-20 points)
    const ecoScoreBonus = Math.round((scanData.ecoScore - 50) / 5);
    const clampedEcoBonus = Math.max(0, Math.min(20, ecoScoreBonus));
    if (clampedEcoBonus > 0) {
      breakdown.push(`Eco-score bonus (+${clampedEcoBonus})`);
    }

    // Consecutive Scan Bonus (multiplier)
    let consecutiveScanBonus = 0;
    if (scanData.isConsecutive && scanData.userStats.consecutiveScans > 1) {
      consecutiveScanBonus = Math.min(10, scanData.userStats.consecutiveScans * 2);
      breakdown.push(`Consecutive scan bonus (+${consecutiveScanBonus})`);
    }

    // Category Exploration Bonus
    const categoryBonus = this.calculateCategoryBonus(scanData.category, scanData.userStats.categoriesScanned);
    if (categoryBonus > 0) {
      breakdown.push(`Category exploration (+${categoryBonus})`);
    }

    // Alternatives Found Bonus
    const alternativesBonus = scanData.alternatives * 5;
    if (alternativesBonus > 0) {
      breakdown.push(`Alternatives found (+${alternativesBonus})`);
    }

    // CO2 Saved Bonus
    const co2SavedBonus = scanData.co2Footprint ? Math.round(scanData.co2Footprint * 2) : 0;
    if (co2SavedBonus > 0) {
      breakdown.push(`CO2 impact awareness (+${co2SavedBonus})`);
    }

    // Quality Bonus
    const qualityMultipliers = { low: 0.8, medium: 1.0, high: 1.2 };
    const qualityBonus = Math.round((basePoints + clampedEcoBonus) * (qualityMultipliers[scanData.scanQuality] - 1));
    if (qualityBonus !== 0) {
      breakdown.push(`Scan quality ${scanData.scanQuality} (${qualityBonus >= 0 ? '+' : ''}${qualityBonus})`);
    }

    const totalPoints = Math.round(
      (basePoints + clampedEcoBonus + consecutiveScanBonus + categoryBonus + alternativesBonus + co2SavedBonus + qualityBonus)
      * qualityMultipliers[scanData.scanQuality]
    );

    return {
      basePoints,
      ecoScoreBonus: clampedEcoBonus,
      consecutiveScanBonus,
      categoryBonus,
      alternativesBonus,
      co2SavedBonus,
      qualityBonus,
      totalPoints: Math.max(5, totalPoints), // Minimum 5 points
      breakdown
    };
  }

  /**
   * Calculate category exploration bonus
   */
  private static calculateCategoryBonus(category: string, categoriesScanned: Record<string, number>): number {
    const categoryCount = categoriesScanned[category] || 0;
    
    // First time scanning this category
    if (categoryCount === 0) {
      return 10;
    }
    
    // Milestone bonuses for frequently scanned categories
    if (categoryCount === 10) return 15;
    if (categoryCount === 25) return 25;
    if (categoryCount === 50) return 50;
    
    return 0;
  }

  /**
   * Calculate user level based on total XP/points
   */
  static calculateLevel(totalXP: number): { level: number, xpForNext: number, progress: number } {
    // Level progression: Level = floor(sqrt(totalXP / 100))
    const level = Math.floor(Math.sqrt(totalXP / 100)) + 1;
    const xpForCurrentLevel = Math.pow(level - 1, 2) * 100;
    const xpForNextLevel = Math.pow(level, 2) * 100;
    const xpForNext = xpForNextLevel - totalXP;
    const progress = ((totalXP - xpForCurrentLevel) / (xpForNextLevel - xpForCurrentLevel)) * 100;
    
    return {
      level,
      xpForNext: Math.max(0, xpForNext),
      progress: Math.max(0, Math.min(100, progress))
    };
  }

  /**
   * Get sustainability rating based on stats
   */
  static getSustainabilityRating(stats: UserStats): { 
    rating: string, 
    color: string, 
    description: string,
    nextRating?: string,
    pointsToNext?: number 
  } {
    const { level } = this.calculateLevel(stats.totalPoints);
    
    if (level >= 50) {
      return {
        rating: "Eco Legend",
        color: "text-purple-600",
        description: "You've mastered sustainable living and inspire others!",
      };
    } else if (level >= 30) {
      return {
        rating: "Sustainability Champion",
        color: "text-green-600",
        description: "You're a true environmental advocate!",
        nextRating: "Eco Legend",
        pointsToNext: Math.pow(50, 2) * 100 - stats.totalPoints
      };
    } else if (level >= 20) {
      return {
        rating: "Eco Warrior",
        color: "text-blue-600", 
        description: "Fighting the good fight for our planet!",
        nextRating: "Sustainability Champion",
        pointsToNext: Math.pow(30, 2) * 100 - stats.totalPoints
      };
    } else if (level >= 10) {
      return {
        rating: "Green Guardian",
        color: "text-emerald-600",
        description: "Protecting our environment with every scan!",
        nextRating: "Eco Warrior", 
        pointsToNext: Math.pow(20, 2) * 100 - stats.totalPoints
      };
    } else if (level >= 5) {
      return {
        rating: "Eco Explorer",
        color: "text-teal-600",
        description: "Discovering sustainable alternatives!",
        nextRating: "Green Guardian",
        pointsToNext: Math.pow(10, 2) * 100 - stats.totalPoints
      };
    } else {
      return {
        rating: "Eco Novice",
        color: "text-gray-600",
        description: "Just starting your sustainability journey!",
        nextRating: "Eco Explorer",
        pointsToNext: Math.pow(5, 2) * 100 - stats.totalPoints
      };
    }
  }

  /**
   * Get available achievements
   */
  static getAchievements(): Achievement[] {
    return [
      {
        id: 'first_scan',
        name: 'First Steps',
        description: 'Complete your first product scan',
        icon: '🌱',
        points: 50,
        condition: (stats) => stats.totalScans >= 1
      },
      {
        id: 'scan_master',
        name: 'Scan Master',
        description: 'Complete 10 product scans',
        icon: '📱',
        points: 100,
        condition: (stats) => stats.totalScans >= 10
      },
      {
        id: 'eco_hunter',
        name: 'Eco Hunter',
        description: 'Find 25 alternative products',
        icon: '🔍',
        points: 150,
        condition: (stats) => stats.alternativesFound >= 25
      },
      {
        id: 'category_explorer',
        name: 'Category Explorer', 
        description: 'Scan products from 5 different categories',
        icon: '🗺️',
        points: 200,
        condition: (stats) => Object.keys(stats.categoriesScanned).length >= 5
      },
      {
        id: 'streak_warrior',
        name: 'Streak Warrior',
        description: 'Maintain a 7-day scanning streak',
        icon: '🔥',
        points: 300,
        condition: (stats) => stats.streak >= 7
      },
      {
        id: 'co2_saver',
        name: 'CO2 Saver',
        description: 'Save 100kg of CO2 through better choices',
        icon: '🌍',
        points: 500,
        condition: (stats) => stats.totalCo2Saved >= 100
      },
      {
        id: 'quality_seeker',
        name: 'Quality Seeker',
        description: 'Maintain an average eco-score above 80',
        icon: '⭐',
        points: 400,
        condition: (stats) => stats.averageEcoScore >= 80 && stats.totalScans >= 20
      },
      {
        id: 'centurion',
        name: 'Centurion',
        description: 'Complete 100 product scans',
        icon: '💯',
        points: 1000,
        condition: (stats) => stats.totalScans >= 100
      },
      {
        id: 'level_master',
        name: 'Level Master',
        description: 'Reach level 25',
        icon: '🏆',
        points: 2500,
        condition: (stats) => this.calculateLevel(stats.totalPoints).level >= 25
      }
    ];
  }

  /**
   * Check for newly unlocked achievements
   */
  static checkAchievements(stats: UserStats, currentAchievements: string[] = []): Achievement[] {
    const allAchievements = this.getAchievements();
    const newAchievements: Achievement[] = [];

    for (const achievement of allAchievements) {
      if (!currentAchievements.includes(achievement.id) && achievement.condition(stats)) {
        newAchievements.push({
          ...achievement,
          unlocked: true,
          unlockedAt: new Date().toISOString()
        });
      }
    }

    return newAchievements;
  }
}
