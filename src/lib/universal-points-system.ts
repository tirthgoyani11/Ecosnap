/**
 * Universal Points Calculation System
 * Single source of truth for all point calculations across the app
 */

export interface PointCalculationInput {
  // For scanning
  ecoScore?: number;
  scanType?: 'camera' | 'barcode' | 'upload';
  dataQuality?: 'high' | 'medium' | 'low';
  
  // For recycling
  recyclabilityScore?: number;
  co2SavedByRecycling?: number;
  waterSaved?: number;
  energySaved?: number;
  
  // User context
  currentStreak?: number;
  totalScans?: number;
  totalRecycled?: number;
  isConsecutive?: boolean;
}

export interface PointCalculationResult {
  points: number;
  breakdown: {
    base: number;
    quality: number;
    streak: number;
    milestone: number;
  };
  reason: string;
}

export class UniversalPointsSystem {
  
  /**
   * Calculate points for scanning a product
   * Range: 1-10 points based on eco-score and quality
   */
  static calculateScanPoints(input: PointCalculationInput): PointCalculationResult {
    const ecoScore = input.ecoScore || 50;
    const dataQuality = input.dataQuality || 'medium';
    const totalScans = input.totalScans || 0;
    
    // Base points: 1-7 based on eco-score
    // Lower eco-score (bad products) = fewer points
    // Higher eco-score (good products) = more points
    let basePoints = 1;
    if (ecoScore >= 90) basePoints = 7;
    else if (ecoScore >= 80) basePoints = 6;
    else if (ecoScore >= 70) basePoints = 5;
    else if (ecoScore >= 60) basePoints = 4;
    else if (ecoScore >= 50) basePoints = 3;
    else if (ecoScore >= 40) basePoints = 2;
    else basePoints = 1;
    
    // Quality bonus: 0-2 points
    let qualityBonus = 0;
    if (dataQuality === 'high') qualityBonus = 2;
    else if (dataQuality === 'medium') qualityBonus = 1;
    
    // Streak bonus: 0-1 point
    const streakBonus = input.isConsecutive ? 1 : 0;
    
    // Milestone bonus: 0-2 points for scan milestones
    let milestoneBonus = 0;
    if (totalScans === 0) milestoneBonus = 2; // First scan
    else if (totalScans === 9) milestoneBonus = 2; // 10th scan
    else if (totalScans === 49) milestoneBonus = 2; // 50th scan
    else if (totalScans === 99) milestoneBonus = 2; // 100th scan
    
    const totalPoints = Math.min(
      basePoints + qualityBonus + streakBonus + milestoneBonus,
      10 // Cap at 10 points
    );
    
    return {
      points: totalPoints,
      breakdown: {
        base: basePoints,
        quality: qualityBonus,
        streak: streakBonus,
        milestone: milestoneBonus
      },
      reason: this.getScanPointsReason(ecoScore, totalPoints)
    };
  }
  
  /**
   * Calculate points for recycling an item
   * Range: 10-100 points based on environmental impact and recyclability
   */
  static calculateRecyclePoints(input: PointCalculationInput): PointCalculationResult {
    const recyclabilityScore = input.recyclabilityScore || 50;
    const co2Saved = input.co2SavedByRecycling || 0;
    const waterSaved = input.waterSaved || 0;
    const energySaved = input.energySaved || 0;
    const currentStreak = input.currentStreak || 0;
    const totalRecycled = input.totalRecycled || 0;
    
    // Base points: 10-60 based on recyclability score
    let basePoints = Math.floor((recyclabilityScore / 100) * 50) + 10; // 10-60 range
    
    // Environmental impact bonus: 0-20 points
    let impactBonus = 0;
    
    // CO2 impact (0-8 points)
    if (co2Saved >= 2.0) impactBonus += 8;
    else if (co2Saved >= 1.5) impactBonus += 6;
    else if (co2Saved >= 1.0) impactBonus += 4;
    else if (co2Saved >= 0.5) impactBonus += 2;
    
    // Water impact (0-6 points)
    if (waterSaved >= 7.0) impactBonus += 6;
    else if (waterSaved >= 5.0) impactBonus += 4;
    else if (waterSaved >= 3.0) impactBonus += 2;
    else if (waterSaved >= 1.0) impactBonus += 1;
    
    // Energy impact (0-6 points)
    if (energySaved >= 3.0) impactBonus += 6;
    else if (energySaved >= 2.0) impactBonus += 4;
    else if (energySaved >= 1.0) impactBonus += 2;
    
    // Streak bonus: 0-10 points
    let streakBonus = 0;
    if (currentStreak >= 30) streakBonus = 10;
    else if (currentStreak >= 14) streakBonus = 8;
    else if (currentStreak >= 7) streakBonus = 6;
    else if (currentStreak >= 3) streakBonus = 3;
    
    // Milestone bonus: 0-10 points
    let milestoneBonus = 0;
    if (totalRecycled === 0) milestoneBonus = 10; // First recycle
    else if (totalRecycled === 9) milestoneBonus = 8; // 10th recycle
    else if (totalRecycled === 24) milestoneBonus = 8; // 25th recycle
    else if (totalRecycled === 49) milestoneBonus = 10; // 50th recycle
    else if (totalRecycled === 99) milestoneBonus = 10; // 100th recycle
    
    const totalPoints = Math.min(
      basePoints + impactBonus + streakBonus + milestoneBonus,
      100 // Cap at 100 points
    );
    
    return {
      points: totalPoints,
      breakdown: {
        base: basePoints,
        quality: impactBonus,
        streak: streakBonus,
        milestone: milestoneBonus
      },
      reason: this.getRecyclePointsReason(recyclabilityScore, co2Saved, totalPoints)
    };
  }
  
  private static getScanPointsReason(ecoScore: number, points: number): string {
    if (points >= 9) return `Excellent! Scanning highly sustainable products (+${points} pts)`;
    if (points >= 7) return `Great choice! Good eco-score product (+${points} pts)`;
    if (points >= 5) return `Good scan! Moderate sustainability (+${points} pts)`;
    if (points >= 3) return `Product scanned. Consider alternatives (+${points} pts)`;
    return `Scan recorded. Look for better options (+${points} pts)`;
  }
  
  private static getRecyclePointsReason(recyclabilityScore: number, co2Saved: number, points: number): string {
    if (points >= 80) return `🌟 Amazing! Major environmental impact (+${points} pts)`;
    if (points >= 60) return `💚 Excellent recycling! Great contribution (+${points} pts)`;
    if (points >= 40) return `♻️ Good job! Solid recycling effort (+${points} pts)`;
    if (points >= 20) return `✅ Nice! Every bit helps the planet (+${points} pts)`;
    return `👍 Item recycled successfully (+${points} pts)`;
  }
}
