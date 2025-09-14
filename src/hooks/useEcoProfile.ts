import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '../contexts/AuthContext';

export interface EcoProfile {
  user_id: string;
  user_name: string;
  avatar_url?: string;
  current_rank: number;
  total_points: number;
  weekly_points: number;
  scan_streak: number;
  achievement_level: AchievementLevel;
  badges_earned: string[];
  total_scans: number;
  eco_impact_score: number;
  level_progress: number;
}

export type AchievementLevel = 'Beginner' | 'Novice' | 'Explorer' | 'Expert' | 'Master' | 'Legend';

export function useEcoProfile() {
  const { user } = useAuth();
  const [ecoProfile, setEcoProfile] = useState<EcoProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const calculateAchievementLevel = useCallback((points: number): AchievementLevel => {
    if (points >= 10000) return 'Legend';
    if (points >= 5000) return 'Master';
    if (points >= 2000) return 'Expert';
    if (points >= 500) return 'Explorer';
    if (points >= 100) return 'Novice';
    return 'Beginner';
  }, []);

  const fetchEcoProfile = useCallback(async () => {
    if (!user) {
      setEcoProfile(null);
      setLoading(false);
      return;
    }

    try {
      // Get user profile data
      const { data: profileData } = await supabase
        .from('profiles')
        .select('username, full_name, avatar_url')
        .eq('id', user.id)
        .single();

      // Get user scan data to calculate points
      const { data: scanData, count: totalScans } = await supabase
        .from('scans')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id);

      // Calculate points based on scans (10 points per scan)
      const totalPoints = (totalScans || 0) * 10;
      const achievementLevel = calculateAchievementLevel(totalPoints);

      // Create eco profile from existing data
      const profile: EcoProfile = {
        user_id: user.id,
        user_name: profileData?.username || profileData?.full_name || 'Anonymous User',
        avatar_url: profileData?.avatar_url,
        current_rank: Math.floor(Math.random() * 100) + 1, // Temporary ranking
        total_points: totalPoints,
        weekly_points: Math.floor(totalPoints * 0.3), // Estimate weekly points
        scan_streak: Math.min(totalScans || 0, 30), // Max 30 day streak
        achievement_level: achievementLevel,
        badges_earned: calculateBadges(totalScans || 0, achievementLevel),
        total_scans: totalScans || 0,
        eco_impact_score: totalPoints * 0.1,
        level_progress: calculateLevelProgress(totalPoints, achievementLevel)
      };

      setEcoProfile(profile);
    } catch (error) {
      console.error('Error fetching eco profile:', error);
    } finally {
      setLoading(false);
    }
  }, [user, calculateAchievementLevel]);

  const calculateBadges = (scanCount: number, level: AchievementLevel): string[] => {
    const badges: string[] = [];
    
    if (scanCount >= 1) badges.push('First Scan');
    if (scanCount >= 10) badges.push('Eco Explorer');
    if (scanCount >= 50) badges.push('Sustainability Champion');
    if (scanCount >= 100) badges.push('Green Guardian');
    if (level === 'Expert' || level === 'Master' || level === 'Legend') badges.push('Expert Scanner');
    if (level === 'Master' || level === 'Legend') badges.push('Eco Master');
    if (level === 'Legend') badges.push('Planet Protector');
    
    return badges;
  };

  const calculateLevelProgress = (points: number, level: AchievementLevel): number => {
    const thresholds = {
      'Beginner': 0,
      'Novice': 100,
      'Explorer': 500,
      'Expert': 2000,
      'Master': 5000,
      'Legend': 10000
    };

    const currentThreshold = thresholds[level];
    const nextLevels = Object.entries(thresholds).find(([_, threshold]) => threshold > currentThreshold);
    
    if (!nextLevels) return 100; // Max level reached
    
    const nextThreshold = nextLevels[1];
    const progressInLevel = points - currentThreshold;
    const levelRange = nextThreshold - currentThreshold;
    
    return Math.min(100, (progressInLevel / levelRange) * 100);
  };

  const updatePoints = useCallback(async (pointsToAdd: number) => {
    if (!user || !ecoProfile) return;

    try {
      // For now, just update local state since we're using scan data
      const newTotalPoints = ecoProfile.total_points + pointsToAdd;
      const newLevel = calculateAchievementLevel(newTotalPoints);
      
      setEcoProfile(prev => prev ? {
        ...prev,
        total_points: newTotalPoints,
        weekly_points: prev.weekly_points + pointsToAdd,
        achievement_level: newLevel,
        eco_impact_score: prev.eco_impact_score + (pointsToAdd * 0.1),
        level_progress: calculateLevelProgress(newTotalPoints, newLevel)
      } : null);

      // Refresh profile to get updated scan count
      setTimeout(() => fetchEcoProfile(), 1000);
    } catch (error) {
      console.error('Error updating points:', error);
    }
  }, [user, ecoProfile, calculateAchievementLevel, fetchEcoProfile]);

  const addBadge = useCallback(async (badgeName: string) => {
    if (!user || !ecoProfile) return;

    try {
      const currentBadges = ecoProfile.badges_earned || [];
      if (currentBadges.includes(badgeName)) return;

      const newBadges = [...currentBadges, badgeName];

      setEcoProfile(prev => prev ? { ...prev, badges_earned: newBadges } : null);
    } catch (error) {
      console.error('Error adding badge:', error);
    }
  }, [user, ecoProfile]);

  // Subscribe to real-time updates for scans
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('scans_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'scans',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          // Refresh profile when new scan is added
          fetchEcoProfile();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchEcoProfile]);

  useEffect(() => {
    fetchEcoProfile();
  }, [fetchEcoProfile]);

  return {
    ecoProfile,
    loading,
    updatePoints,
    addBadge,
    refreshProfile: fetchEcoProfile
  };
}