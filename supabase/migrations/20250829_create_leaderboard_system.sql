-- Create leaderboard tables with proper indexing and constraints
CREATE TABLE IF NOT EXISTS public.user_rankings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  current_rank INTEGER NOT NULL DEFAULT 0,
  previous_rank INTEGER DEFAULT NULL,
  total_points INTEGER NOT NULL DEFAULT 0,
  weekly_points INTEGER NOT NULL DEFAULT 0,
  monthly_points INTEGER NOT NULL DEFAULT 0,
  scan_streak INTEGER NOT NULL DEFAULT 0,
  max_streak INTEGER NOT NULL DEFAULT 0,
  last_scan_date DATE DEFAULT NULL,
  achievement_level TEXT DEFAULT 'Beginner' CHECK (achievement_level IN ('Beginner', 'Novice', 'Explorer', 'Expert', 'Master', 'Legend')),
  badges_earned TEXT[] DEFAULT '{}',
  prizes_claimed TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create prizes table for reward system
CREATE TABLE IF NOT EXISTS public.prizes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  prize_type TEXT NOT NULL CHECK (prize_type IN ('badge', 'points', 'discount', 'gift', 'achievement')),
  image_url TEXT,
  points_required INTEGER NOT NULL DEFAULT 0,
  rank_required INTEGER DEFAULT NULL,
  streak_required INTEGER DEFAULT NULL,
  scan_count_required INTEGER DEFAULT NULL,
  rarity TEXT DEFAULT 'common' CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  is_active BOOLEAN DEFAULT true,
  max_claims INTEGER DEFAULT NULL, -- null means unlimited
  current_claims INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_prizes table for tracking claimed prizes
CREATE TABLE IF NOT EXISTS public.user_prizes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  prize_id UUID NOT NULL REFERENCES public.prizes(id) ON DELETE CASCADE,
  claimed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT DEFAULT 'claimed' CHECK (status IN ('claimed', 'delivered', 'expired')),
  metadata JSONB DEFAULT '{}',
  UNIQUE(user_id, prize_id) -- Prevent duplicate claims unless prize allows it
);

-- Create leaderboard_snapshots for historical data
CREATE TABLE IF NOT EXISTS public.leaderboard_snapshots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  snapshot_date DATE NOT NULL,
  snapshot_type TEXT NOT NULL CHECK (snapshot_type IN ('daily', 'weekly', 'monthly')),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rank INTEGER NOT NULL,
  points INTEGER NOT NULL,
  scans_count INTEGER NOT NULL,
  eco_score_avg NUMERIC DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(snapshot_date, snapshot_type, user_id)
);

-- Enable RLS on all new tables
ALTER TABLE public.user_rankings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_prizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard_snapshots ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_rankings
CREATE POLICY "User rankings are viewable by everyone" 
ON public.user_rankings FOR SELECT 
USING (true);

CREATE POLICY "Users can update their own ranking" 
ON public.user_rankings FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "System can insert user rankings" 
ON public.user_rankings FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- Create RLS policies for prizes
CREATE POLICY "Prizes are viewable by everyone" 
ON public.prizes FOR SELECT 
USING (true);

-- Create RLS policies for user_prizes
CREATE POLICY "Users can view their own prizes" 
ON public.user_prizes FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can claim prizes" 
ON public.user_prizes FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for leaderboard_snapshots
CREATE POLICY "Leaderboard snapshots are viewable by everyone" 
ON public.leaderboard_snapshots FOR SELECT 
USING (true);

CREATE POLICY "System can insert snapshots" 
ON public.leaderboard_snapshots FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_rankings_user_id ON public.user_rankings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_rankings_current_rank ON public.user_rankings(current_rank);
CREATE INDEX IF NOT EXISTS idx_user_rankings_total_points ON public.user_rankings(total_points DESC);
CREATE INDEX IF NOT EXISTS idx_user_rankings_weekly_points ON public.user_rankings(weekly_points DESC);
CREATE INDEX IF NOT EXISTS idx_user_rankings_monthly_points ON public.user_rankings(monthly_points DESC);
CREATE INDEX IF NOT EXISTS idx_user_rankings_scan_streak ON public.user_rankings(scan_streak DESC);

CREATE INDEX IF NOT EXISTS idx_prizes_points_required ON public.prizes(points_required);
CREATE INDEX IF NOT EXISTS idx_prizes_rank_required ON public.prizes(rank_required);
CREATE INDEX IF NOT EXISTS idx_prizes_is_active ON public.prizes(is_active);

CREATE INDEX IF NOT EXISTS idx_user_prizes_user_id ON public.user_prizes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_prizes_prize_id ON public.user_prizes(prize_id);

CREATE INDEX IF NOT EXISTS idx_snapshots_date_type ON public.leaderboard_snapshots(snapshot_date, snapshot_type);
CREATE INDEX IF NOT EXISTS idx_snapshots_rank ON public.leaderboard_snapshots(rank);

-- Add triggers for updated_at
CREATE TRIGGER update_user_rankings_updated_at 
BEFORE UPDATE ON public.user_rankings 
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
