import { useState, useEffect, useCallback } from 'react';
import { StatsService } from '../lib/stats-service-clean';

interface UserStats {
  totalScans: number;
  ecoPoints: number;
  productsScanned: number;
  alternativesFound: number;
  co2Saved: number;
  sustainabilityRating: string;
  achievements: string[];
  lastScanDate: string;
}

export const useUserStats = () => {
  const [stats, setStats] = useState<UserStats>(() => StatsService.getUserStats());
  const [leaderboard, setLeaderboard] = useState(() => StatsService.getLeaderboard());

  // Refresh stats from localStorage
  const refreshStats = useCallback(() => {
    setStats(StatsService.getUserStats());
    setLeaderboard(StatsService.getLeaderboard());
  }, []);

  // Update stats after a scan
  const updateAfterScan = useCallback((product: any, alternativesCount: number = 0) => {
    const updatedStats = StatsService.updateAfterScan(product, alternativesCount);
    setStats(updatedStats);
    setLeaderboard(StatsService.getLeaderboard());
    return updatedStats;
  }, []);

  // Get user's current rank
  const getUserRank = useCallback(() => {
    return StatsService.getUserRank();
  }, [leaderboard]);

  // Refresh stats on mount and when localStorage changes
  useEffect(() => {
    refreshStats();

    // Listen for storage changes (if multiple tabs)
    const handleStorageChange = () => {
      refreshStats();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [refreshStats]);

  return {
    stats,
    leaderboard,
    updateAfterScan,
    refreshStats,
    getUserRank,
  };
};
