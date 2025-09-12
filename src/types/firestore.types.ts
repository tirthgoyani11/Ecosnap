// src/types/firestore.types.ts
import { Timestamp, FieldValue } from 'firebase/firestore';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  createdAt: Timestamp | FieldValue;
  updatedAt: Timestamp | FieldValue;
  points: number;
  totalScans: number;
  ecoScore: number;
  achievements?: string[];
  preferences: {
    theme: 'light' | 'dark' | 'system';
    notifications: boolean;
    sustainabilityGoals: string[];
  };
}

export interface ScanResult {
  id: string;
  userId: string;
  productName: string;
  brand?: string;
  barcode?: string;
  ecoScore: number;
  sustainabilityRating: 'poor' | 'fair' | 'good' | 'excellent' | 'outstanding';
  badges: string[];
  categories: string[];
  co2Impact: number;
  waterFootprint?: number;
  recyclable: boolean;
  certifications: string[];
  alternatives: Alternative[];
  scanMethod: 'camera' | 'barcode' | 'upload' | 'text';
  imageUrl?: string;
  pointsEarned: number;
  createdAt: Timestamp | FieldValue;
  updatedAt: Timestamp | FieldValue;
  metadata?: {
    location?: string;
    confidence?: number;
    aiModel?: string;
  };
}

export interface Alternative {
  productName: string;
  brand: string;
  ecoScore: number;
  reasoning: string;
  priceComparison: 'cheaper' | 'similar' | 'expensive';
  availableAt: string[];
}

export interface FavoriteProduct {
  id: string;
  userId: string;
  productId: string;
  productName: string;
  productBrand: string;
  ecoScore: number;
  imageUrl?: string;
  createdAt: Timestamp | FieldValue;
  tags: string[];
  notes?: string;
}

export interface LeaderboardEntry {
  id: string;
  userId: string;
  name: string;
  avatarUrl?: string;
  points: number;
  totalScans: number;
  ecoScore: number;
  rank: number;
  achievements: string[];
}

export interface BulkScanData {
  id: string;
  userId: string;
  sessionName: string;
  totalProducts: number;
  processedProducts: number;
  averageEcoScore: number;
  totalPointsEarned: number;
  status: 'processing' | 'completed' | 'failed';
  createdAt: Timestamp | FieldValue;
  completedAt?: Timestamp;
  scans: string[]; // Array of scan IDs
}

export interface EcoChallenge {
  id: string;
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  type: 'scans' | 'points' | 'co2_saved' | 'streak';
  difficulty: 'easy' | 'medium' | 'hard';
  reward: {
    points: number;
    badge: string;
  };
  startDate: Timestamp;
  endDate: Timestamp;
  participants: string[]; // User IDs
  isActive: boolean;
}

export interface UserStats {
  totalScans: number;
  totalPoints: number;
  averageEcoScore: number;
  co2Saved: number;
  waterSaved: number;
  currentStreak: number;
  longestStreak: number;
  favoriteCategories: string[];
  sustainabilityLevel: string;
  achievements: Achievement[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: Timestamp;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  points: number;
}

// Utility types for Firestore operations
export type CreateUserProfile = Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateUserProfile = Partial<Omit<UserProfile, 'id' | 'email' | 'createdAt'>>;
export type CreateScanResult = Omit<ScanResult, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateScanResult = Partial<Omit<ScanResult, 'id' | 'userId' | 'createdAt'>>;
export type CreateFavorite = Omit<FavoriteProduct, 'id' | 'createdAt'>;
export type UpdateLeaderboardEntry = Partial<Omit<LeaderboardEntry, 'id' | 'userId'>>;

// Additional utility types
export type CreateUserProfileData = CreateUserProfile;
export type UpdateUserProfileData = UpdateUserProfile;
export type CreateScanData = CreateScanResult;
export type UpdateScanData = UpdateScanResult;
export type CreateFavoriteData = CreateFavorite;

// Pagination and Query types
export interface PaginationOptions {
  limit?: number;
  startAfter?: any;
}

export interface QueryResult<T> {
  data: T[];
  hasMore: boolean;
  lastDoc?: any;
}

// API Response types
export interface FirestoreResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  lastDoc?: any;
  hasMore: boolean;
  total?: number;
}

// Query filters
export interface ScanFilters {
  userId?: string;
  startDate?: Date;
  endDate?: Date;
  minEcoScore?: number;
  maxEcoScore?: number;
  categories?: string[];
  sustainabilityRating?: ScanResult['sustainabilityRating'];
  limit?: number;
  orderBy?: 'createdAt' | 'ecoScore' | 'pointsEarned';
  orderDirection?: 'asc' | 'desc';
}

export interface LeaderboardFilters {
  timeframe?: 'daily' | 'weekly' | 'monthly' | 'all-time';
  limit?: number;
  category?: string;
}

// Real-time subscription types
export interface RealtimeSubscription {
  unsubscribe: () => void;
}

export interface RealtimeOptions {
  includeMetadataChanges?: boolean;
  source?: 'default' | 'server' | 'cache';
}
