import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// Types
export interface LeaderboardEntry {
  id: string;
  user_id: string;
  current_rank: number;
  previous_rank?: number;
  user_name: string;
  avatar_url?: string;
  total_points: number;
  weekly_points: number;
  monthly_points: number;
  scan_streak: number;
  max_streak: number;
  last_scan_date?: string;
  achievement_level: 'Beginner' | 'Novice' | 'Explorer' | 'Expert' | 'Master' | 'Legend';
  badges_earned: string[];
  prizes_claimed: string[];
  total_scans?: number;
  eco_score_avg?: number;
  created_at: string;
  updated_at: string;
}

export interface Prize {
  id: string;
  name: string;
  description?: string;
  prize_type: 'badge' | 'points' | 'discount' | 'gift' | 'achievement';
  image_url?: string;
  points_required: number;
  rank_required?: number;
  streak_required?: number;
  scan_count_required?: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  is_active: boolean;
  max_claims?: number;
  current_claims: number;
  is_claimable: boolean;
  metadata?: any;
}

export interface UserPrize {
  id: string;
  prize_id: string;
  prize_name: string;
  prize_type: string;
  claimed_at: string;
  status: 'claimed' | 'delivered' | 'expired';
}

// Helper function to calculate streak
function calculateStreakDays(lastScanDate?: string): number {
  if (!lastScanDate) return 0;
  
  const lastScan = new Date(lastScanDate);
  const today = new Date();
  const diffTime = Math.abs(today.getTime() - lastScan.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays <= 1 ? 1 : 0; // Simplified streak calculation
}

// Helper function to calculate achievement level
function getAchievementLevel(points: number): LeaderboardEntry['achievement_level'] {
  if (points >= 10000) return 'Legend';
  if (points >= 5000) return 'Master';
  if (points >= 2500) return 'Expert';
  if (points >= 1000) return 'Explorer';
  if (points >= 300) return 'Novice';
  return 'Beginner';
}

// Helper function to get badges based on points
function getBadgesForPoints(points: number): string[] {
  const badges = [];
  if (points >= 100) badges.push('First Century');
  if (points >= 500) badges.push('Point Collector');
  if (points >= 1000) badges.push('Eco Explorer');
  if (points >= 2500) badges.push('Sustainability Expert');
  if (points >= 5000) badges.push('Eco Master');
  if (points >= 10000) badges.push('Eco Legend');
  return badges;
}

// Hook to get leaderboard data
export function useLeaderboard(timeframe: 'all' | 'weekly' | 'monthly' = 'all', limit: number = 100) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['leaderboard', timeframe, limit],
    queryFn: async () => {
      console.log('🏆 Fetching leaderboard data...', { timeframe, limit });
      
      // Use profiles table for now, will upgrade to user_rankings later
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('points', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('❌ Leaderboard fetch error:', error);
        throw error;
      }

      console.log('✅ Leaderboard data fetched:', data?.length || 0, 'entries');

      // Transform data to match expected format
      const transformedData: LeaderboardEntry[] = (data || []).map((item, index) => ({
        id: item.id,
        user_id: item.user_id,
        current_rank: index + 1,
        previous_rank: undefined,
        user_name: item.full_name || item.username || 'Anonymous User',
        avatar_url: item.avatar_url,
        total_points: item.points || 0,
        weekly_points: item.points || 0, // Fallback until we have weekly tracking
        monthly_points: item.points || 0, // Fallback until we have monthly tracking
        scan_streak: calculateStreakDays(item.updated_at),
        max_streak: calculateStreakDays(item.updated_at),
        last_scan_date: item.updated_at,
        achievement_level: getAchievementLevel(item.points || 0),
        badges_earned: getBadgesForPoints(item.points || 0),
        prizes_claimed: [], // Will be populated when we implement prizes
        total_scans: item.total_scans || 0,
        eco_score_avg: item.eco_score_avg || 0,
        created_at: item.created_at,
        updated_at: item.updated_at
      }));

      return transformedData;
    },
    staleTime: 60000, // 1 minute
    enabled: !!user
  });
}

// Hook to get user's current rank and stats
export function useUserRank() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-rank', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');

      console.log('📊 Fetching user rank data for:', user.id);

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('❌ User rank fetch error:', error);
        throw error;
      }

      if (!data) {
        console.log('📝 No profile data found');
        return null;
      }

      console.log('✅ User rank data:', data);

      // Get user's rank by counting profiles with higher points
      const { count } = await supabase
        .from('profiles')
        .select('id', { count: 'exact' })
        .gt('points', data.points || 0);

      const currentRank = (count || 0) + 1;

      return {
        id: data.id,
        user_id: data.user_id,
        current_rank: currentRank,
        previous_rank: undefined,
        user_name: data.full_name || data.username || 'Anonymous User',
        avatar_url: data.avatar_url,
        total_points: data.points || 0,
        weekly_points: data.points || 0,
        monthly_points: data.points || 0,
        scan_streak: calculateStreakDays(data.updated_at),
        max_streak: calculateStreakDays(data.updated_at),
        last_scan_date: data.updated_at,
        achievement_level: getAchievementLevel(data.points || 0),
        badges_earned: getBadgesForPoints(data.points || 0),
        prizes_claimed: [],
        total_scans: data.total_scans || 0,
        eco_score_avg: data.eco_score_avg || 0,
        created_at: data.created_at,
        updated_at: data.updated_at
      } as LeaderboardEntry;
    },
    enabled: !!user?.id
  });
}

// Mock prizes until database is set up
const mockPrizes: Prize[] = [
  {
    id: '1',
    name: 'First Scanner',
    description: 'Complete your first product scan',
    prize_type: 'badge',
    image_url: '🔍',
    points_required: 0,
    rarity: 'common',
    is_active: true,
    max_claims: undefined,
    current_claims: 0,
    is_claimable: true
  },
  {
    id: '2',
    name: 'Eco Warrior',
    description: 'Reach 100 points',
    prize_type: 'badge',
    image_url: '🌱',
    points_required: 100,
    rarity: 'rare',
    is_active: true,
    max_claims: undefined,
    current_claims: 0,
    is_claimable: false
  },
  {
    id: '3',
    name: 'Sustainability Expert',
    description: 'Reach 500 points',
    prize_type: 'badge',
    image_url: '⭐',
    points_required: 500,
    rarity: 'epic',
    is_active: true,
    max_claims: undefined,
    current_claims: 0,
    is_claimable: false
  },
  {
    id: '4',
    name: 'Point Boost',
    description: 'Get 50 extra points',
    prize_type: 'points',
    image_url: '💎',
    points_required: 50,
    rarity: 'common',
    is_active: true,
    max_claims: undefined,
    current_claims: 0,
    is_claimable: false
  },
  {
    id: '5',
    name: 'Mega Point Boost',
    description: 'Get 200 extra points',
    prize_type: 'points',
    image_url: '💎',
    points_required: 200,
    rarity: 'epic',
    is_active: true,
    max_claims: undefined,
    current_claims: 0,
    is_claimable: false
  }
];

// Hook to get available prizes for user
export function useAvailablePrizes() {
  const { user } = useAuth();
  const { data: userRank } = useUserRank();

  return useQuery({
    queryKey: ['available-prizes', user?.id, userRank?.total_points],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');

      console.log('🎁 Fetching available prizes for user:', user.id);

      // For now return mock prizes with claimability based on user points
      const prizesWithClaimability = mockPrizes.map(prize => ({
        ...prize,
        is_claimable: (userRank?.total_points || 0) >= prize.points_required
      }));

      console.log('✅ Fetched', prizesWithClaimability.length, 'prizes');
      return prizesWithClaimability;
    },
    enabled: !!user?.id && !!userRank,
    staleTime: 300000 // 5 minutes
  });
}

// Hook to get user's claimed prizes (mock for now)
export function useUserPrizes() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-prizes', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');
      
      // Mock empty prizes for now
      return [] as UserPrize[];
    },
    enabled: !!user?.id
  });
}

// Hook to claim a prize
export function useClaimPrize() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (prizeId: string) => {
      if (!user?.id) throw new Error('User not authenticated');

      console.log('🎁 Claiming prize:', prizeId);

      const prize = mockPrizes.find(p => p.id === prizeId);
      if (!prize) throw new Error('Prize not found');

      // For points-based prizes, update the user's points
      if (prize.prize_type === 'points') {
        const pointBonus = prize.name.includes('Mega') ? 200 : 50;
        
        // Get current profile to calculate new totals
        const { data: currentProfile } = await supabase
          .from('profiles')
          .select('points')
          .eq('user_id', user.id)
          .single();

        if (!currentProfile) throw new Error('Profile not found');

        const { error } = await supabase
          .from('profiles')
          .update({ 
            points: (currentProfile.points || 0) + pointBonus,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);

        if (error) throw error;
      }

      // Mock successful claim
      return {
        success: true,
        prize: {
          name: prize.name,
          description: prize.description,
          type: prize.prize_type,
          rarity: prize.rarity
        }
      };
    },
    onSuccess: (data) => {
      console.log('✅ Prize claimed successfully:', data);
      
      // Show confetti effect
      const confetti = document.createElement('div');
      confetti.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        pointer-events: none;
        z-index: 9999;
        background: radial-gradient(circle at 50% 50%, 
          rgba(255, 215, 0, 0.3) 0%, 
          transparent 70%);
        animation: confetti-burst 2s ease-out forwards;
      `;
      
      document.body.appendChild(confetti);
      setTimeout(() => confetti.remove(), 2000);
      
      toast.success(`🎉 ${data.prize.name} claimed!`, {
        description: data.prize.description,
        duration: 5000
      });

      queryClient.invalidateQueries({ queryKey: ['available-prizes'] });
      queryClient.invalidateQueries({ queryKey: ['user-prizes'] });
      queryClient.invalidateQueries({ queryKey: ['user-rank'] });
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
    },
    onError: (error) => {
      console.error('❌ Error claiming prize:', error);
      toast.error('Failed to claim prize', {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
}

// Point calculation algorithm
function calculatePointsForScan(ecoScore: number, scanType: 'camera' | 'upload' | 'barcode'): number {
  let basePoints = Math.floor(ecoScore / 10) * 5; // 5 points per 10 eco score points
  
  // Bonus for scan type
  const scanBonus = {
    camera: 10,
    upload: 5,
    barcode: 3
  };
  
  basePoints += scanBonus[scanType];
  
  // Bonus for high eco scores
  if (ecoScore >= 90) basePoints += 20;
  else if (ecoScore >= 80) basePoints += 10;
  else if (ecoScore >= 70) basePoints += 5;
  
  return Math.max(basePoints, 5); // Minimum 5 points
}

// Hook to update user points
export function useUpdatePoints() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      ecoScore, 
      scanType, 
      alternativesSuggested = 0 
    }: {
      ecoScore: number;
      scanType: 'camera' | 'upload' | 'barcode';
      alternativesSuggested?: number;
    }) => {
      if (!user?.id) throw new Error('User not authenticated');

      console.log('📈 Updating points for scan:', { ecoScore, scanType, alternativesSuggested });

      const points = calculatePointsForScan(ecoScore, scanType);
      const bonusPoints = alternativesSuggested * 5; // 5 points per alternative
      const totalPoints = points + bonusPoints;

      // Get current profile to calculate new totals
      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('points, total_scans')
        .eq('user_id', user.id)
        .single();

      if (!currentProfile) throw new Error('Profile not found');

      // Update user profile points
      const { error } = await supabase
        .from('profiles')
        .update({ 
          points: (currentProfile.points || 0) + totalPoints,
          total_scans: (currentProfile.total_scans || 0) + 1,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) throw error;

      return { points: totalPoints, ecoScore, scanType };
    },
    onSuccess: ({ points, ecoScore }) => {
      console.log('✅ Points updated successfully:', points);
      
      // Show achievement toast with confetti effect
      toast.success(`+${points} points earned! 🎉`, {
        description: `Eco score: ${ecoScore}/100`,
        duration: 3000
      });

      // Trigger confetti effect
      const confetti = document.createElement('div');
      confetti.innerHTML = '🎉';
      confetti.style.cssText = `
        position: fixed;
        top: 20%;
        left: 50%;
        transform: translateX(-50%);
        font-size: 3rem;
        animation: bounce 1s ease-in-out;
        z-index: 9999;
        pointer-events: none;
      `;
      
      document.body.appendChild(confetti);
      setTimeout(() => confetti.remove(), 1000);

      queryClient.invalidateQueries({ queryKey: ['user-rank'] });
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
      queryClient.invalidateQueries({ queryKey: ['available-prizes'] });
    },
    onError: (error) => {
      console.error('❌ Error updating points:', error);
      toast.error('Failed to update points');
    }
  });
}
