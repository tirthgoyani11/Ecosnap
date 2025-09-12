-- Create advanced point calculation and ranking functions

-- Function to calculate points based on scan quality and eco score
CREATE OR REPLACE FUNCTION public.calculate_scan_points(
  p_eco_score INTEGER,
  p_scan_type TEXT,
  p_alternatives_suggested INTEGER DEFAULT 0,
  p_user_streak INTEGER DEFAULT 0
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  base_points INTEGER := 0;
  bonus_points INTEGER := 0;
  streak_multiplier NUMERIC := 1.0;
BEGIN
  -- Base points calculation based on eco score
  CASE 
    WHEN p_eco_score >= 90 THEN base_points := 50;  -- Excellent eco score
    WHEN p_eco_score >= 80 THEN base_points := 40;  -- Great eco score
    WHEN p_eco_score >= 70 THEN base_points := 30;  -- Good eco score
    WHEN p_eco_score >= 60 THEN base_points := 25;  -- Fair eco score
    WHEN p_eco_score >= 50 THEN base_points := 20;  -- Poor eco score
    ELSE base_points := 15;                          -- Very poor eco score
  END CASE;

  -- Bonus points for scan type complexity
  CASE p_scan_type
    WHEN 'camera' THEN bonus_points := bonus_points + 10;  -- Live scanning is harder
    WHEN 'upload' THEN bonus_points := bonus_points + 5;   -- Photo upload moderate
    WHEN 'barcode' THEN bonus_points := bonus_points + 3;  -- Barcode is easiest
  END CASE;

  -- Bonus for finding alternatives
  bonus_points := bonus_points + (p_alternatives_suggested * 5);

  -- Streak multiplier (up to 2x for 30+ day streaks)
  IF p_user_streak > 30 THEN 
    streak_multiplier := 2.0;
  ELSIF p_user_streak > 15 THEN 
    streak_multiplier := 1.5;
  ELSIF p_user_streak > 7 THEN 
    streak_multiplier := 1.25;
  ELSIF p_user_streak > 3 THEN 
    streak_multiplier := 1.1;
  END IF;

  RETURN FLOOR((base_points + bonus_points) * streak_multiplier);
END;
$$;

-- Function to update user ranking and calculate streaks
CREATE OR REPLACE FUNCTION public.update_user_ranking(p_user_id UUID, p_points_earned INTEGER)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  current_date DATE := CURRENT_DATE;
  user_record user_rankings%ROWTYPE;
  new_streak INTEGER := 0;
  is_consecutive BOOLEAN := false;
BEGIN
  -- Get or create user ranking record
  SELECT * INTO user_record FROM user_rankings WHERE user_id = p_user_id;
  
  IF NOT FOUND THEN
    -- Create new ranking record
    INSERT INTO user_rankings (
      user_id, 
      total_points, 
      weekly_points, 
      monthly_points, 
      scan_streak, 
      max_streak,
      last_scan_date
    ) VALUES (
      p_user_id, 
      p_points_earned, 
      p_points_earned, 
      p_points_earned, 
      1, 
      1,
      current_date
    );
    RETURN;
  END IF;

  -- Calculate streak
  IF user_record.last_scan_date IS NULL THEN
    new_streak := 1;
  ELSIF user_record.last_scan_date = current_date THEN
    -- Same day scan, don't increase streak but add points
    new_streak := user_record.scan_streak;
  ELSIF user_record.last_scan_date = current_date - INTERVAL '1 day' THEN
    -- Consecutive day, increase streak
    new_streak := user_record.scan_streak + 1;
    is_consecutive := true;
  ELSE
    -- Streak broken, reset to 1
    new_streak := 1;
  END IF;

  -- Update ranking record
  UPDATE user_rankings SET
    total_points = total_points + p_points_earned,
    weekly_points = CASE 
      WHEN EXTRACT(week FROM last_scan_date) = EXTRACT(week FROM current_date) 
      THEN weekly_points + p_points_earned 
      ELSE p_points_earned 
    END,
    monthly_points = CASE 
      WHEN EXTRACT(month FROM last_scan_date) = EXTRACT(month FROM current_date) 
      THEN monthly_points + p_points_earned 
      ELSE p_points_earned 
    END,
    scan_streak = new_streak,
    max_streak = GREATEST(max_streak, new_streak),
    last_scan_date = current_date,
    updated_at = NOW()
  WHERE user_id = p_user_id;

  -- Update achievement level based on total points
  UPDATE user_rankings SET
    achievement_level = CASE
      WHEN total_points >= 10000 THEN 'Legend'
      WHEN total_points >= 5000 THEN 'Master'
      WHEN total_points >= 2500 THEN 'Expert'
      WHEN total_points >= 1000 THEN 'Explorer'
      WHEN total_points >= 300 THEN 'Novice'
      ELSE 'Beginner'
    END
  WHERE user_id = p_user_id;

  -- Award streak badges
  IF is_consecutive AND new_streak IN (7, 14, 30, 60, 100) THEN
    UPDATE user_rankings SET
      badges_earned = array_append(
        badges_earned, 
        new_streak || '-Day Streak Master'
      )
    WHERE user_id = p_user_id 
    AND NOT (badges_earned @> ARRAY[new_streak || '-Day Streak Master']);
  END IF;
END;
$$;

-- Function to recalculate all user ranks
CREATE OR REPLACE FUNCTION public.recalculate_leaderboard_ranks()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  rank_counter INTEGER := 1;
  user_record RECORD;
BEGIN
  -- Update previous ranks
  UPDATE user_rankings SET previous_rank = current_rank;
  
  -- Recalculate ranks based on total points
  FOR user_record IN (
    SELECT user_id 
    FROM user_rankings 
    ORDER BY total_points DESC, scan_streak DESC, max_streak DESC
  ) LOOP
    UPDATE user_rankings 
    SET current_rank = rank_counter 
    WHERE user_id = user_record.user_id;
    
    rank_counter := rank_counter + 1;
  END LOOP;
END;
$$;

-- Function to get eligible prizes for a user
CREATE OR REPLACE FUNCTION public.get_eligible_prizes(p_user_id UUID)
RETURNS TABLE(
  prize_id UUID,
  name TEXT,
  description TEXT,
  prize_type TEXT,
  image_url TEXT,
  points_required INTEGER,
  rarity TEXT,
  is_claimable BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  user_stats RECORD;
BEGIN
  -- Get user statistics
  SELECT 
    ur.total_points,
    ur.current_rank,
    ur.scan_streak,
    p.total_scans
  INTO user_stats
  FROM user_rankings ur
  JOIN profiles p ON p.user_id = ur.user_id
  WHERE ur.user_id = p_user_id;

  IF NOT FOUND THEN
    -- Return empty if user not found
    RETURN;
  END IF;

  -- Return eligible prizes
  RETURN QUERY
  SELECT 
    pr.id,
    pr.name,
    pr.description,
    pr.prize_type,
    pr.image_url,
    pr.points_required,
    pr.rarity,
    CASE
      WHEN up.user_id IS NOT NULL THEN false  -- Already claimed
      WHEN pr.max_claims IS NOT NULL AND pr.current_claims >= pr.max_claims THEN false  -- Max claims reached
      WHEN pr.points_required > user_stats.total_points THEN false  -- Not enough points
      WHEN pr.rank_required IS NOT NULL AND pr.rank_required < user_stats.current_rank THEN false  -- Rank too low
      WHEN pr.streak_required IS NOT NULL AND pr.streak_required > user_stats.scan_streak THEN false  -- Streak too low
      WHEN pr.scan_count_required IS NOT NULL AND pr.scan_count_required > user_stats.total_scans THEN false  -- Not enough scans
      ELSE true
    END as is_claimable
  FROM prizes pr
  LEFT JOIN user_prizes up ON up.prize_id = pr.id AND up.user_id = p_user_id
  WHERE pr.is_active = true
  ORDER BY pr.points_required ASC, pr.rarity DESC;
END;
$$;

-- Function to claim a prize
CREATE OR REPLACE FUNCTION public.claim_prize(p_user_id UUID, p_prize_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  prize_record prizes%ROWTYPE;
  user_stats RECORD;
  result JSONB;
BEGIN
  -- Get prize details
  SELECT * INTO prize_record FROM prizes WHERE id = p_prize_id AND is_active = true;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Prize not found or inactive');
  END IF;

  -- Check if already claimed
  IF EXISTS(SELECT 1 FROM user_prizes WHERE user_id = p_user_id AND prize_id = p_prize_id) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Prize already claimed');
  END IF;

  -- Get user statistics
  SELECT 
    ur.total_points,
    ur.current_rank,
    ur.scan_streak,
    p.total_scans
  INTO user_stats
  FROM user_rankings ur
  JOIN profiles p ON p.user_id = ur.user_id
  WHERE ur.user_id = p_user_id;

  -- Check eligibility
  IF prize_record.points_required > user_stats.total_points THEN
    RETURN jsonb_build_object('success', false, 'error', 'Insufficient points');
  END IF;

  IF prize_record.rank_required IS NOT NULL AND prize_record.rank_required < user_stats.current_rank THEN
    RETURN jsonb_build_object('success', false, 'error', 'Rank requirement not met');
  END IF;

  IF prize_record.max_claims IS NOT NULL AND prize_record.current_claims >= prize_record.max_claims THEN
    RETURN jsonb_build_object('success', false, 'error', 'Prize no longer available');
  END IF;

  -- Claim the prize
  INSERT INTO user_prizes (user_id, prize_id) VALUES (p_user_id, p_prize_id);
  
  -- Update prize claim count
  UPDATE prizes SET current_claims = current_claims + 1 WHERE id = p_prize_id;
  
  -- Deduct points if it's a points-based prize
  IF prize_record.prize_type = 'points' THEN
    UPDATE user_rankings SET total_points = total_points - prize_record.points_required 
    WHERE user_id = p_user_id;
  END IF;

  RETURN jsonb_build_object(
    'success', true, 
    'prize', jsonb_build_object(
      'name', prize_record.name,
      'description', prize_record.description,
      'type', prize_record.prize_type,
      'rarity', prize_record.rarity
    )
  );
END;
$$;
