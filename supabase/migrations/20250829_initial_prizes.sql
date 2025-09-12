-- Insert initial prizes and achievements

-- Badge Prizes (Free achievements)
INSERT INTO public.prizes (name, description, prize_type, points_required, rarity, image_url, metadata) VALUES
('First Scanner', 'Complete your first product scan', 'badge', 0, 'common', '🔍', '{"auto_award": true, "scan_count_required": 1}'),
('Eco Warrior', 'Scan 10 eco-friendly products (score 80+)', 'badge', 0, 'rare', '🌱', '{"auto_award": true, "eco_scans_required": 10}'),
('Streak Starter', 'Maintain a 7-day scanning streak', 'badge', 0, 'common', '🔥', '{"auto_award": true}'),
('Green Guardian', 'Scan 50 products with eco alternatives', 'badge', 0, 'epic', '🛡️', '{"auto_award": true, "alternatives_found": 50}'),
('Sustainability Expert', 'Achieve 1000 total points', 'badge', 1000, 'epic', '⭐', '{"auto_award": true}'),
('Eco Legend', 'Reach the top 10 on the leaderboard', 'badge', 0, 'legendary', '👑', '{"auto_award": true, "rank_required": 10}'),

-- Point Rewards
('Point Boost 100', 'Get an extra 100 points boost', 'points', 50, 'common', '💎', '{"points_bonus": 100}'),
('Point Boost 500', 'Get an extra 500 points boost', 'points', 200, 'rare', '💎', '{"points_bonus": 500}'),
('Mega Point Boost', 'Get an extra 1000 points boost', 'points', 400, 'epic', '💎', '{"points_bonus": 1000}'),

-- Discount Prizes
('Eco Store 10% Off', 'Get 10% off your next eco-friendly purchase', 'discount', 300, 'rare', '🏷️', '{"discount_percent": 10, "store": "EcoMart"}'),
('Green Products 20% Off', 'Get 20% off sustainable products', 'discount', 600, 'epic', '🏷️', '{"discount_percent": 20, "category": "sustainable"}'),
('Premium Eco Box', 'Free eco-friendly starter kit', 'gift', 1000, 'legendary', '📦', '{"physical_prize": true}'),

-- Achievement Levels
('Bronze Eco Champion', 'Reach 500 total points', 'achievement', 500, 'common', '🥉', '{"level": "bronze"}'),
('Silver Eco Champion', 'Reach 1500 total points', 'achievement', 1500, 'rare', '🥈', '{"level": "silver"}'),
('Gold Eco Champion', 'Reach 3000 total points', 'achievement', 3000, 'epic', '🥇', '{"level": "gold"}'),
('Platinum Eco Champion', 'Reach 5000 total points', 'achievement', 5000, 'legendary', '💿', '{"level": "platinum"}'),

-- Special Limited Prizes
('Early Adopter Badge', 'Exclusive badge for beta testers', 'badge', 0, 'legendary', '🚀', '{"limited_time": true, "max_claims": 100}'),
('Earth Day Special', 'Special Earth Day commemorative badge', 'badge', 0, 'epic', '🌍', '{"seasonal": true, "max_claims": 1000}');

-- Update max_claims for limited prizes
UPDATE public.prizes SET max_claims = 100 WHERE name = 'Early Adopter Badge';
UPDATE public.prizes SET max_claims = 1000 WHERE name = 'Earth Day Special';
UPDATE public.prizes SET max_claims = 50 WHERE name = 'Premium Eco Box';

-- Set streak requirements
UPDATE public.prizes SET streak_required = 7 WHERE name = 'Streak Starter';
UPDATE public.prizes SET scan_count_required = 1 WHERE name = 'First Scanner';
UPDATE public.prizes SET rank_required = 10 WHERE name = 'Eco Legend';
