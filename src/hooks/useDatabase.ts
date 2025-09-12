import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { EnhancedScoringSystem } from '../lib/enhanced-scoring-system';

export interface Scan {
  id: string;
  user_id: string;
  product_id?: string;
  detected_name?: string;
  scan_type: string;
  eco_score?: number;
  co2_footprint?: number;
  points_earned?: number;
  alternatives_suggested?: number;
  image_url?: string;
  metadata?: any;
  created_at: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  full_name?: string;
  username?: string;
  avatar_url?: string;
  points: number;
  total_scans: number;
  total_co2_saved: number;
  eco_score_avg?: number;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  brand?: string;
  barcode?: string;
  eco_score?: number;
  carbon_footprint?: number;
  image_url?: string;
  badges?: string[];
  sustainable?: boolean;
  recyclable?: boolean;
  metadata?: any;
  created_at: string;
  updated_at: string;
}

// Hook to get user profile with automatic initialization
export const useProfile = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('No user found');
      
      console.log('👤 Fetching user profile...', { user_id: user.id });
      
      let { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      // If no profile exists, create one
      if (!data && !error) {
        console.log('🔧 Creating new user profile...');
        const newProfile = {
          user_id: user.id,
          full_name: user.user_metadata?.full_name || null,
          username: user.email?.split('@')[0] || 'eco-user',
          avatar_url: user.user_metadata?.avatar_url || null,
          points: 0,
          total_scans: 0,
          total_co2_saved: 0,
          eco_score_avg: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        const { data: createdProfile, error: createError } = await supabase
          .from('profiles')
          .insert(newProfile)
          .select()
          .single();

        if (createError) {
          console.error('❌ Failed to create profile:', createError);
          throw createError;
        }

        console.log('✅ Profile created successfully');
        return createdProfile as UserProfile;
      }
      
      if (error) {
        console.error('❌ Profile query error:', error);
        throw error;
      }
      
      console.log('✅ Profile fetched:', { 
        points: data?.points, 
        total_scans: data?.total_scans 
      });
      return data as UserProfile;
    },
    enabled: !!user,
    retry: 3,
    staleTime: 10 * 1000, // 10 seconds - more frequent updates
    gcTime: 5 * 60 * 1000, // 5 minutes cache
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
};

// Hook to update user profile
export const useUpdateProfile = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: Partial<Pick<UserProfile, 'full_name' | 'username' | 'avatar_url'>>) => {
      if (!user) throw new Error('No user found');
      
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();
      
      if (error) throw error;
      return data as UserProfile;
    },
    onSuccess: (updatedProfile) => {
      // Update the profile cache
      queryClient.setQueryData(['profile', user?.id], updatedProfile);
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
    },
  });
};

// Hook to get user's scans
export const useScans = (limit?: number) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['scans', user?.id, limit],
    queryFn: async () => {
      if (!user) throw new Error('No user found');
      
      console.log('🔍 Fetching user scans...', { user_id: user.id, limit });
      
      let query = supabase
        .from('scans')
        .select(`
          *,
          products (
            id,
            name,
            brand,
            eco_score,
            image_url
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (limit) {
        query = query.limit(limit);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('❌ Failed to fetch scans:', error);
        throw error;
      }
      
      console.log('✅ Fetched scans:', data?.length || 0, 'scans');
      return data as (Scan & { products?: Product })[];
    },
    enabled: !!user,
    staleTime: 10 * 1000, // 10 seconds - more frequent updates
    gcTime: 5 * 60 * 1000, // 5 minutes cache
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
};

// Hook to create a new scan aligned with Supabase schema
export const useCreateScan = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (scanData: {
      detected_name: string;
      scan_type: 'camera' | 'barcode' | 'upload';
      eco_score?: number;
      co2_footprint?: number;
      image_url?: string;
      metadata?: any;
      product_id?: string;
      alternatives_count?: number;
    }) => {
      if (!user) throw new Error('No user found');
      
      console.log('💾 Creating scan aligned with Supabase schema...', scanData);
      
      // Get current profile for scoring calculations
      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!currentProfile) {
        throw new Error('User profile not found. Please refresh and try again.');
      }

      // Calculate enhanced points
      const userStats = {
        totalScans: currentProfile.total_scans,
        totalPoints: currentProfile.points,
        totalCo2Saved: currentProfile.total_co2_saved,
        averageEcoScore: currentProfile.eco_score_avg || 0,
        consecutiveScans: 1,
        lastScanDate: new Date().toISOString(),
        categoriesScanned: {},
        alternativesFound: scanData.alternatives_count || 0,
        level: 1,
        xp: currentProfile.points,
        streak: 1
      };

      const ecoScore = scanData.eco_score || Math.floor(Math.random() * 40) + 60;
      const co2Footprint = scanData.co2_footprint || Math.random() * 3 + 0.5;

      const scoreCalculation = EnhancedScoringSystem.calculatePoints({
        ecoScore,
        category: 'general',
        alternatives: scanData.alternatives_count || 0,
        co2Footprint,
        isConsecutive: false,
        scanQuality: 'medium',
        userStats
      });

      // Create scan record following exact Supabase schema
      const scanRecord = {
        user_id: user.id,
        product_id: scanData.product_id || null, // FK to products table
        scan_type: scanData.scan_type,
        image_url: scanData.image_url || null, // Can be null
        detected_name: scanData.detected_name,
        eco_score: ecoScore,
        co2_footprint: co2Footprint,
        alternatives_suggested: scanData.alternatives_count || 0,
        points_earned: scoreCalculation.totalPoints,
        metadata: {
          ...scanData.metadata,
          scoring_breakdown: scoreCalculation.breakdown,
          enhanced_scoring: true,
          timestamp: new Date().toISOString()
        }
      };

      console.log('📝 Inserting scan with schema-compliant data:', {
        detected_name: scanRecord.detected_name,
        scan_type: scanRecord.scan_type,
        eco_score: scanRecord.eco_score,
        points_earned: scanRecord.points_earned
      });

      const { data: scan, error } = await supabase
        .from('scans')
        .insert(scanRecord)
        .select()
        .single();
      
      if (error) {
        console.error('❌ Scan creation failed:', error);
        throw error;
      }
      
      console.log('✅ Scan created successfully:', scan.id);

      // Update profile with new totals
      const newTotalScans = currentProfile.total_scans + 1;
      const newTotalPoints = currentProfile.points + scoreCalculation.totalPoints;
      const newTotalCo2Saved = currentProfile.total_co2_saved + co2Footprint;
      const newEcoScoreAvg = ((currentProfile.eco_score_avg || 0) * currentProfile.total_scans + ecoScore) / newTotalScans;

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          points: newTotalPoints,
          total_scans: newTotalScans,
          total_co2_saved: newTotalCo2Saved,
          eco_score_avg: Math.round(newEcoScoreAvg * 100) / 100,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (updateError) {
        console.error('⚠️ Profile update failed:', updateError);
      } else {
        console.log('✅ Profile updated - Scans:', newTotalScans, 'Points:', newTotalPoints);
      }
      
      return { 
        ...scan, 
        scoring_details: scoreCalculation 
      };
    },
    onSuccess: async (data) => {
      console.log('🎉 Scan completed - triggering real-time updates');
      
      // Force immediate cache invalidation and refetch
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['scans'] }),
        queryClient.invalidateQueries({ queryKey: ['profile'] }),
        queryClient.refetchQueries({ queryKey: ['scans'] }),
        queryClient.refetchQueries({ queryKey: ['profile'] })
      ]);
      
      toast({
        title: "✅ Scan Completed!",
        description: `${data.detected_name} - ${data.points_earned} points earned! Check dashboard!`,
        duration: 4000,
      });
    },
    onError: (error) => {
      console.error('❌ Scan creation error:', error);
      toast({
        title: "❌ Scan Failed",
        description: "Failed to save scan data. Please check your connection and try again.",
        variant: "destructive",
        duration: 5000,
      });
    },
  });
};

// Hook to get products (for discover page)
export const useProducts = (limit = 20, offset = 0) => {
  return useQuery({
    queryKey: ['products', limit, offset],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
      
      if (error) throw error;
      return data as Product[];
    },
  });
};

// Hook to search products
export const useProductSearch = (searchTerm: string) => {
  return useQuery({
    queryKey: ['productSearch', searchTerm],
    queryFn: async () => {
      if (!searchTerm.trim()) return [];
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .or(`name.ilike.%${searchTerm}%,brand.ilike.%${searchTerm}%`)
        .limit(10);
      
      if (error) throw error;
      return data as Product[];
    },
    enabled: !!searchTerm.trim(),
  });
};

// Hook for bulk scan operations
export const useBulkScan = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (scans: Array<{
      detected_name: string;
      scan_type: 'bulk';
      eco_score?: number;
      co2_footprint?: number;
    }>) => {
      if (!user) throw new Error('No user found');
      
      const scanRecords = scans.map(scan => ({
        user_id: user.id,
        detected_name: scan.detected_name,
        scan_type: scan.scan_type,
        eco_score: scan.eco_score || Math.floor(Math.random() * 40) + 60,
        co2_footprint: scan.co2_footprint || Math.random() * 5 + 1,
        points_earned: Math.round((scan.eco_score || 75) * 10),
      }));
      
      const { data, error } = await supabase
        .from('scans')
        .insert(scanRecords)
        .select();
      
      if (error) throw error;
      
      // Calculate totals for profile update
      const totalPoints = scanRecords.reduce((sum, scan) => sum + scan.points_earned, 0);
      const totalCo2Saved = scanRecords.reduce((sum, scan) => sum + scan.co2_footprint, 0);
      
      // Update user profile stats
      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('points, total_scans, total_co2_saved')
        .eq('user_id', user.id)
        .single();
      
      if (currentProfile) {
        await supabase
          .from('profiles')
          .update({
            points: currentProfile.points + totalPoints,
            total_scans: currentProfile.total_scans + scanRecords.length,
            total_co2_saved: currentProfile.total_co2_saved + totalCo2Saved,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', user.id);
      }
      
      return { scans: data, totalPoints, totalScans: scanRecords.length };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['scans'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
      
      toast({
        title: "Bulk scan completed!",
        description: `Successfully scanned ${data.totalScans} products and earned ${data.totalPoints} points!`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to process bulk scan. Please try again.",
        variant: "destructive",
      });
      console.error('Error in bulk scan:', error);
    },
  });
};

// Hook to get user's ranking based on points
export const useUserRank = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-rank', user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;

      const { data: profile } = await supabase
        .from('profiles')
        .select('points')
        .eq('user_id', user.id)
        .single();

      if (!profile) return 0;

      const { data: higherRanked } = await supabase
        .from('profiles')
        .select('points')
        .gt('points', profile.points);

      return (higherRanked?.length || 0) + 1;
    },
    enabled: !!user?.id,
  });
};

// Hook to get user level and achievements using enhanced scoring
export const useUserLevel = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['user-level', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      // Get user profile data
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (!profile) return null;
      
      // Get recent scan data for achievements
      const { data: scans } = await supabase
        .from('scans')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100);
      
      // Calculate level using enhanced scoring system
      const level = EnhancedScoringSystem.calculateLevel(profile.points);
      
      // Prepare user stats for achievements
      const userStats = {
        totalScans: profile.total_scans,
        totalPoints: profile.points,
        totalCo2Saved: profile.total_co2_saved,
        averageEcoScore: profile.eco_score_avg || 0,
        consecutiveScans: 1, // Could be calculated from scan dates
        lastScanDate: scans?.[0]?.created_at || new Date().toISOString(),
        categoriesScanned: {}, // Could be enhanced with category tracking
        alternativesFound: 0,
        level: level.level,
        xp: profile.points,
        streak: 1
      };
      
      // Get achievements
      const achievements = EnhancedScoringSystem.getAchievements();
      const unlockedAchievements = achievements.filter(achievement => 
        achievement.condition(userStats)
      );
      
      // Get sustainability rating
      const sustainabilityRating = EnhancedScoringSystem.getSustainabilityRating(userStats);
      
      return {
        ...level,
        achievements: unlockedAchievements,
        sustainabilityRating,
        userStats
      };
    },
    enabled: !!user,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Hook to get leaderboard data
export const useLeaderboard = (limit = 10) => {
  return useQuery({
    queryKey: ['leaderboard', limit],
    queryFn: async () => {
      console.log('🏆 Fetching leaderboard data...');
      
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          user_id,
          full_name,
          username,
          avatar_url,
          points,
          total_scans,
          total_co2_saved,
          eco_score_avg,
          created_at,
          updated_at
        `)
        .order('points', { ascending: false })
        .limit(limit);
      
      if (error) {
        console.error('❌ Failed to fetch leaderboard:', error);
        throw error;
      }
      
      console.log('✅ Fetched leaderboard:', data?.length || 0, 'users');
      
      // Add rank to each user and determine badge
      const leaderboardWithRanks = data?.map((profile, index) => {
        const rank = index + 1;
        let badge = 'Beginner';
        
        if (profile.points >= 10000) badge = 'Legend';
        else if (profile.points >= 5000) badge = 'Expert';
        else if (profile.points >= 2000) badge = 'Advanced';
        else if (profile.points >= 1000) badge = 'Intermediate';
        
        return {
          ...profile,
          rank,
          badge,
          name: profile.full_name || profile.username || 'Anonymous User',
          username: profile.username || `user_${profile.id.slice(0, 6)}`,
          avatar: profile.avatar_url,
          scans: profile.total_scans || 0,
          ecoScore: profile.eco_score_avg || 0
        };
      }) || [];
      
      return leaderboardWithRanks;
    },
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes cache
    refetchOnWindowFocus: true,
  });
};
