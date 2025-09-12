// Core types for EcoSnap AI functionality

export interface Product {
  id: string;
  name: string;
  brand?: string;
  barcode?: string;
  image_url?: string;
  eco_score: number;
  carbon_footprint?: number;
  recyclable: boolean;
  sustainable: boolean;
  badges: string[];
  metadata?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

export interface Alternative {
  id: string;
  name: string;
  brand?: string;
  image_url?: string;
  eco_score: number;
  price?: number;
  savings_percentage?: number;
  carbon_footprint?: number;
  reasons: string[];
  badges: string[];
  metadata?: Record<string, any>;
}

export interface ScanResult {
  id: string;
  product_id?: string;
  detected_name: string;
  eco_score: number;
  co2_footprint?: number;
  scan_type: 'camera' | 'barcode' | 'upload';
  image_url?: string;
  alternatives_suggested: number;
  points_earned: number;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  points: number;
  total_co2_saved: number;
  total_scans: number;
  eco_score_avg?: number;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface ChatSession {
  id: string;
  messages: ChatMessage[];
  context_product_id?: string;
  created_at: string;
  updated_at: string;
}

export interface VisionAnalysisResult {
  product_name: string;
  brand?: string;
  category?: string;
  confidence: number;
  ingredients?: string[];
  materials?: string[];
  packaging?: string[];
}

export interface EcoScoreBreakdown {
  overall_score: number;
  carbon_footprint_score: number;
  recyclability_score: number;
  sustainability_score: number;
  packaging_score: number;
  factors: {
    name: string;
    score: number;
    weight: number;
    description: string;
  }[];
}

export interface BarcodeProduct {
  code: string;
  product_name?: string;
  brands?: string;
  image_url?: string;
  categories?: string;
  ingredients_text?: string;
  packaging?: string;
  ecoscore_grade?: string;
  nutriscore_grade?: string;
}

export interface BulkScanResult {
  total_products: number;
  average_eco_score: number;
  total_co2_saved: number;
  recommendations: {
    high_impact: Alternative[];
    quick_wins: Alternative[];
    budget_friendly: Alternative[];
  };
  summary: {
    excellent_products: number;
    good_products: number;
    needs_improvement: number;
    avoid_products: number;
  };
}

export interface DashboardStats {
  total_scans: number;
  points: number;
  co2_saved: number;
  eco_score_avg: number;
  recent_scans: ScanResult[];
  achievements: Achievement[];
  weekly_progress: {
    scans: number;
    co2_saved: number;
    points_earned: number;
  };
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress?: number;
  target?: number;
  unlock_date?: string;
}

export interface EcoTip {
  id: string;
  title: string;
  content: string;
  category: 'shopping' | 'lifestyle' | 'recycling' | 'energy' | 'transport';
  difficulty: 'easy' | 'medium' | 'hard';
  impact_score: number;
  image_url?: string;
  source?: string;
}