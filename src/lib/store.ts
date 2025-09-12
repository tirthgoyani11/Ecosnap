import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product, Alternative } from '@/lib/types';
import { mockProducts, mockAlternatives } from '@/lib/mock/products';
import { mockUserStats, type UserStats, type Achievement } from '@/lib/mock/stats';

interface ScanItem {
  id: string;
  product: Product;
  alternatives: Alternative[];
  timestamp: Date;
  pointsEarned: number;
}

interface AppState {
  // User stats
  stats: UserStats;
  scans: ScanItem[];
  
  // App settings
  isDemoMode: boolean;
  units: 'kg' | 'lb';
  
  // Actions
  addScan: (product: Product, alternatives: Alternative[]) => void;
  addPoints: (points: number) => void;
  unlockAchievement: (achievementId: string) => void;
  resetData: () => void;
  toggleDemoMode: () => void;
  setUnits: (units: 'kg' | 'lb') => void;
  
  // Derived values
  getRecentScans: () => ScanItem[];
  getTotalCO2Saved: () => number;
  getAvgEcoScore: () => number;
}

const initialStats: UserStats = {
  ...mockUserStats,
  totalScans: 0,
  pointsEarned: 0,
  co2Saved: 0,
  avgEcoScore: 0,
  levelProgress: 0,
  achievements: mockUserStats.achievements.map(a => ({ ...a, unlocked: false }))
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      stats: initialStats,
      scans: [],
      isDemoMode: true,
      units: 'kg',
      
      addScan: (product, alternatives) => {
        const pointsEarned = Math.floor(product.eco_score * 2.5);
        const newScan: ScanItem = {
          id: Date.now().toString(),
          product,
          alternatives,
          timestamp: new Date(),
          pointsEarned
        };
        
        const state = get();
        const newScans = [newScan, ...state.scans];
        const totalScans = newScans.length;
        const totalPoints = state.stats.pointsEarned + pointsEarned;
        const avgEcoScore = newScans.reduce((sum, scan) => sum + scan.product.eco_score, 0) / totalScans;
        const co2Saved = newScans.reduce((sum, scan) => sum + (scan.product.carbon_footprint || 0) * 0.1, 0);
        const level = Math.floor(totalPoints / 1000) + 1;
        const levelProgress = (totalPoints % 1000) / 10;
        
        set({
          scans: newScans,
          stats: {
            ...state.stats,
            totalScans,
            pointsEarned: totalPoints,
            avgEcoScore: Math.round(avgEcoScore),
            co2Saved: Math.round(co2Saved * 10) / 10,
            level,
            levelProgress: Math.round(levelProgress)
          }
        });
      },
      
      addPoints: (points) => {
        const state = get();
        const newPoints = state.stats.pointsEarned + points;
        const level = Math.floor(newPoints / 1000) + 1;
        const levelProgress = (newPoints % 1000) / 10;
        
        set({
          stats: {
            ...state.stats,
            pointsEarned: newPoints,
            level,
            levelProgress: Math.round(levelProgress)
          }
        });
      },
      
      unlockAchievement: (achievementId) => {
        const state = get();
        const updatedAchievements = state.stats.achievements.map(achievement =>
          achievement.id === achievementId
            ? { ...achievement, unlocked: true, unlockedDate: new Date().toISOString().split('T')[0] }
            : achievement
        );
        
        set({
          stats: {
            ...state.stats,
            achievements: updatedAchievements
          }
        });
      },
      
      resetData: () => {
        set({
          stats: initialStats,
          scans: []
        });
      },
      
      toggleDemoMode: () => {
        set((state) => ({ isDemoMode: !state.isDemoMode }));
      },
      
      setUnits: (units) => {
        set({ units });
      },
      
      getRecentScans: () => {
        return get().scans.slice(0, 5);
      },
      
      getTotalCO2Saved: () => {
        return get().stats.co2Saved;
      },
      
      getAvgEcoScore: () => {
        return get().stats.avgEcoScore;
      }
    }),
    {
      name: 'ecosnap-store',
      version: 1
    }
  )
);