// Enhanced Supabase client with EcoSnap specific functions
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { Product, Alternative, ScanResult, UserProfile, ChatSession, BulkScanResult, DashboardStats } from './types';

type DbProduct = Database['public']['Tables']['products']['Row'];
type DbScan = Database['public']['Tables']['scans']['Row'];
type DbProfile = Database['public']['Tables']['profiles']['Row'];
type DbAlternative = Database['public']['Tables']['alternatives']['Row'];
type DbChatSession = Database['public']['Tables']['chat_sessions']['Row'];

export class EcoSnapSupabase {
  // Product operations
  static async getProduct(id: string): Promise<Product | null> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data ? this.transformProduct(data) : null;
  }

  static async getProductByBarcode(barcode: string): Promise<Product | null> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('barcode', barcode)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data ? this.transformProduct(data) : null;
  }

  static async createProduct(product: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .insert({
        ...product,
        metadata: product.metadata || {}
      })
      .select('*')
      .single();
    
    if (error) throw error;
    return this.transformProduct(data);
  }

  // Scan operations
  static async createScan(scan: Omit<ScanResult, 'id' | 'created_at'>): Promise<ScanResult> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('scans')
      .insert({
        ...scan,
        user_id: user.id,
        metadata: scan.metadata || {}
      })
      .select('*')
      .single();
    
    if (error) throw error;
    return this.transformScan(data);
  }

  static async getUserScans(limit = 10): Promise<ScanResult[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('scans')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return (data || []).map(scan => this.transformScan(scan));
  }

  // Profile operations
  static async getProfile(): Promise<UserProfile | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data ? this.transformProfile(data) : null;
  }

  static async createProfile(profile: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>): Promise<UserProfile> {
    const { data, error } = await supabase
      .from('profiles')
      .insert(profile)
      .select('*')
      .single();
    
    if (error) throw error;
    return this.transformProfile(data);
  }

  static async updateProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('user_id', user.id)
      .select('*')
      .single();
    
    if (error) throw error;
    return this.transformProfile(data);
  }

  // Dashboard stats
  static async getDashboardStats(): Promise<DashboardStats> {
    const profile = await this.getProfile();
    const recentScans = await this.getUserScans(5);
    
    // Get weekly stats (last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const { data: weeklyScans, error } = await supabase
      .from('scans')
      .select('points_earned, co2_footprint')
      .gte('created_at', weekAgo.toISOString());
    
    if (error) throw error;
    
    const weeklyStats = {
      scans: weeklyScans?.length || 0,
      co2_saved: weeklyScans?.reduce((sum, scan) => sum + (scan.co2_footprint || 0), 0) || 0,
      points_earned: weeklyScans?.reduce((sum, scan) => sum + scan.points_earned, 0) || 0
    };

    return {
      total_scans: profile?.total_scans || 0,
      points: profile?.points || 0,
      co2_saved: profile?.total_co2_saved || 0,
      eco_score_avg: profile?.eco_score_avg || 0,
      recent_scans: recentScans,
      achievements: [], // TODO: Implement achievements system
      weekly_progress: weeklyStats
    };
  }

  // Chat sessions
  static async createChatSession(contextProductId?: string): Promise<ChatSession> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('chat_sessions')
      .insert({
        user_id: user.id,
        context_product_id: contextProductId,
        messages: []
      })
      .select('*')
      .single();
    
    if (error) throw error;
    return this.transformChatSession(data);
  }

  static async updateChatSession(sessionId: string, messages: any[]): Promise<void> {
    const { error } = await supabase
      .from('chat_sessions')
      .update({ messages })
      .eq('id', sessionId);
    
    if (error) throw error;
  }

  // Alternatives
  static async getAlternatives(productId: string): Promise<Alternative[]> {
    const { data, error } = await supabase
      .from('alternatives')
      .select('*')
      .eq('original_product_id', productId);
    
    if (error) throw error;
    return (data || []).map(alt => this.transformAlternative(alt));
  }

  static async createAlternative(alternative: Omit<Alternative, 'id' | 'created_at'>): Promise<Alternative> {
    const { data, error } = await supabase
      .from('alternatives')
      .insert({
        ...alternative,
        metadata: alternative.metadata || {}
      })
      .select('*')
      .single();
    
    if (error) throw error;
    return this.transformAlternative(data);
  }

  // Bulk operations
  static async createBulkScan(products: Product[]): Promise<BulkScanResult> {
    // Calculate stats from products array
    const totalProducts = products.length;
    const averageEcoScore = products.reduce((sum, p) => sum + p.eco_score, 0) / totalProducts;
    
    // Simulate CO2 savings calculation
    const totalCo2Saved = products.reduce((sum, p) => {
      const baseline = 50; // Average CO2 for conventional products
      const savings = Math.max(0, baseline - (p.carbon_footprint || 0));
      return sum + savings;
    }, 0);

    // Categorize products
    const summary = {
      excellent_products: products.filter(p => p.eco_score >= 80).length,
      good_products: products.filter(p => p.eco_score >= 60 && p.eco_score < 80).length,
      needs_improvement: products.filter(p => p.eco_score >= 40 && p.eco_score < 60).length,
      avoid_products: products.filter(p => p.eco_score < 40).length
    };

    return {
      total_products: totalProducts,
      average_eco_score: averageEcoScore,
      total_co2_saved: totalCo2Saved,
      recommendations: {
        high_impact: [], // TODO: Get from alternatives API
        quick_wins: [],
        budget_friendly: []
      },
      summary
    };
  }

  // Transform database types to app types
  private static transformProduct(dbProduct: DbProduct): Product {
    return {
      ...dbProduct,
      metadata: typeof dbProduct.metadata === 'object' && dbProduct.metadata ? 
        dbProduct.metadata as Record<string, any> : {}
    };
  }

  private static transformScan(dbScan: DbScan): ScanResult {
    return {
      ...dbScan,
      scan_type: dbScan.scan_type as 'camera' | 'barcode' | 'upload',
      metadata: typeof dbScan.metadata === 'object' && dbScan.metadata ? 
        dbScan.metadata as Record<string, any> : {}
    };
  }

  private static transformProfile(dbProfile: DbProfile): UserProfile {
    return {
      ...dbProfile
    };
  }

  private static transformAlternative(dbAlternative: DbAlternative): Alternative {
    return {
      ...dbAlternative,
      metadata: typeof dbAlternative.metadata === 'object' && dbAlternative.metadata ? 
        dbAlternative.metadata as Record<string, any> : {}
    };
  }

  private static transformChatSession(dbSession: DbChatSession): ChatSession {
    return {
      ...dbSession,
      messages: Array.isArray(dbSession.messages) ? 
        dbSession.messages as any[] : []
    };
  }
}