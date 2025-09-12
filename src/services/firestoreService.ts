import { 
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  QueryDocumentSnapshot,
  DocumentData,
  onSnapshot,
  Unsubscribe,
  serverTimestamp,
  increment,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { getFirebaseApp } from '@/lib/firebase';
import { 
  UserProfile, 
  ScanResult, 
  FavoriteProduct, 
  LeaderboardEntry, 
  BulkScanData,
  EcoChallenge,
  CreateUserProfileData,
  UpdateUserProfileData,
  CreateScanData,
  UpdateScanData,
  CreateFavoriteData,
  PaginationOptions,
  QueryResult,
  RealtimeSubscription
} from '@/types/firestore.types';

class FirestoreService {
  private app = getFirebaseApp();
  private db: any = null;

  constructor() {
    this.initializeFirestore();
  }

  private async initializeFirestore() {
    if (!this.db && this.app) {
      const { getFirestore } = await import('firebase/firestore');
      this.db = getFirestore(this.app);
    }
    return this.db;
  }

  private async ensureFirestore() {
    if (!this.db) {
      await this.initializeFirestore();
    }
    return this.db;
  }

  // User Profile Operations
  async createUserProfile(userId: string, profileData: CreateUserProfileData): Promise<UserProfile | null> {
    try {
      const db = await this.ensureFirestore();
      const userRef = doc(db, 'users', userId);
      
      const newProfile: UserProfile = {
        id: userId,
        ...profileData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await setDoc(userRef, newProfile);
      
      // Return the profile with converted timestamps
      return {
        ...newProfile,
        createdAt: new Date() as any,
        updatedAt: new Date() as any
      };
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
  }

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const db = await this.ensureFirestore();
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const data = userSnap.data();
        return {
          id: userSnap.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as UserProfile;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw error;
    }
  }

  async updateUserProfile(userId: string, updates: UpdateUserProfileData): Promise<UserProfile | null> {
    try {
      const db = await this.ensureFirestore();
      const userRef = doc(db, 'users', userId);
      
      const updateData = {
        ...updates,
        updatedAt: serverTimestamp()
      };

      await updateDoc(userRef, updateData);
      
      // Get and return the updated profile
      return await this.getUserProfile(userId);
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  // Scan Operations
  async createScan(scanData: CreateScanData): Promise<ScanResult | null> {
    try {
      const db = await this.ensureFirestore();
      const scansRef = collection(db, 'scans');
      const scanRef = doc(scansRef);
      
      const newScan: ScanResult = {
        id: scanRef.id,
        ...scanData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await setDoc(scanRef, newScan);

      // Update user stats
      if (scanData.userId) {
        const userRef = doc(db, 'users', scanData.userId);
        await updateDoc(userRef, {
          totalScans: increment(1),
          points: increment(scanData.pointsEarned || 0),
          ecoScore: increment(scanData.ecoScore || 0),
          updatedAt: serverTimestamp()
        });
      }
      
      return {
        ...newScan,
        createdAt: new Date() as any,
        updatedAt: new Date() as any
      };
    } catch (error) {
      console.error('Error creating scan:', error);
      throw error;
    }
  }

  async getUserScans(
    userId: string, 
    options: PaginationOptions = {}
  ): Promise<QueryResult<ScanResult>> {
    try {
      const db = await this.ensureFirestore();
      const scansRef = collection(db, 'scans');
      
      let q = query(
        scansRef,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );

      if (options.limit) {
        q = query(q, limit(options.limit));
      }

      if (options.startAfter) {
        q = query(q, startAfter(options.startAfter));
      }

      const querySnap = await getDocs(q);
      const scans: ScanResult[] = [];
      
      querySnap.forEach((doc) => {
        const data = doc.data();
        scans.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as ScanResult);
      });

      const lastDoc = querySnap.docs[querySnap.docs.length - 1];

      return {
        data: scans,
        hasMore: querySnap.size === (options.limit || 10),
        lastDoc
      };
    } catch (error) {
      console.error('Error getting user scans:', error);
      throw error;
    }
  }

  async updateScan(scanId: string, updates: UpdateScanData): Promise<ScanResult | null> {
    try {
      const db = await this.ensureFirestore();
      const scanRef = doc(db, 'scans', scanId);
      
      const updateData = {
        ...updates,
        updatedAt: serverTimestamp()
      };

      await updateDoc(scanRef, updateData);
      
      // Get and return the updated scan
      const scanSnap = await getDoc(scanRef);
      if (scanSnap.exists()) {
        const data = scanSnap.data();
        return {
          id: scanSnap.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as unknown as ScanResult;
      }
      
      return null;
    } catch (error) {
      console.error('Error updating scan:', error);
      throw error;
    }
  }

  // Favorites Operations
  async addToFavorites(favoriteData: CreateFavoriteData): Promise<FavoriteProduct | null> {
    try {
      const db = await this.ensureFirestore();
      const favoritesRef = collection(db, 'favorites');
      const favoriteRef = doc(favoritesRef);
      
      const newFavorite: FavoriteProduct = {
        id: favoriteRef.id,
        ...favoriteData,
        createdAt: serverTimestamp()
      };

      await setDoc(favoriteRef, newFavorite);
      
      return {
        ...newFavorite,
        createdAt: new Date() as any
      };
    } catch (error) {
      console.error('Error adding to favorites:', error);
      throw error;
    }
  }

  async removeFromFavorites(userId: string, productId: string): Promise<void> {
    try {
      const db = await this.ensureFirestore();
      const favoritesRef = collection(db, 'favorites');
      const q = query(
        favoritesRef,
        where('userId', '==', userId),
        where('productId', '==', productId)
      );

      const querySnap = await getDocs(q);
      
      querySnap.forEach(async (doc) => {
        await deleteDoc(doc.ref);
      });
    } catch (error) {
      console.error('Error removing from favorites:', error);
      throw error;
    }
  }

  async getUserFavorites(
    userId: string, 
    options: PaginationOptions = {}
  ): Promise<QueryResult<FavoriteProduct>> {
    try {
      const db = await this.ensureFirestore();
      const favoritesRef = collection(db, 'favorites');
      
      let q = query(
        favoritesRef,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );

      if (options.limit) {
        q = query(q, limit(options.limit));
      }

      if (options.startAfter) {
        q = query(q, startAfter(options.startAfter));
      }

      const querySnap = await getDocs(q);
      const favorites: FavoriteProduct[] = [];
      
      querySnap.forEach((doc) => {
        const data = doc.data();
        favorites.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date()
        } as unknown as FavoriteProduct);
      });

      const lastDoc = querySnap.docs[querySnap.docs.length - 1];

      return {
        data: favorites,
        hasMore: querySnap.size === (options.limit || 10),
        lastDoc
      };
    } catch (error) {
      console.error('Error getting user favorites:', error);
      throw error;
    }
  }

  async isFavorite(userId: string, productId: string): Promise<boolean> {
    try {
      const db = await this.ensureFirestore();
      const favoritesRef = collection(db, 'favorites');
      const q = query(
        favoritesRef,
        where('userId', '==', userId),
        where('productId', '==', productId),
        limit(1)
      );

      const querySnap = await getDocs(q);
      return !querySnap.empty;
    } catch (error) {
      console.error('Error checking if favorite:', error);
      return false;
    }
  }

  // Leaderboard Operations
  async getLeaderboard(
    options: PaginationOptions & { timeframe?: 'weekly' | 'monthly' | 'all' } = {}
  ): Promise<QueryResult<LeaderboardEntry>> {
    try {
      const db = await this.ensureFirestore();
      const usersRef = collection(db, 'users');
      
      let q = query(
        usersRef,
        orderBy('points', 'desc')
      );

      if (options.limit) {
        q = query(q, limit(options.limit));
      }

      if (options.startAfter) {
        q = query(q, startAfter(options.startAfter));
      }

      const querySnap = await getDocs(q);
      const leaderboard: LeaderboardEntry[] = [];
      
      querySnap.forEach((doc) => {
        const data = doc.data() as UserProfile;
        leaderboard.push({
          id: doc.id,
          userId: doc.id,
          name: data.name,
          avatarUrl: data.avatarUrl,
          points: data.points,
          totalScans: data.totalScans,
          ecoScore: data.ecoScore,
          rank: leaderboard.length + 1,
          achievements: data.achievements || []
        });
      });

      const lastDoc = querySnap.docs[querySnap.docs.length - 1];

      return {
        data: leaderboard,
        hasMore: querySnap.size === (options.limit || 10),
        lastDoc
      };
    } catch (error) {
      console.error('Error getting leaderboard:', error);
      throw error;
    }
  }

  async getUserRank(userId: string): Promise<number> {
    try {
      const db = await this.ensureFirestore();
      const userProfile = await this.getUserProfile(userId);
      
      if (!userProfile) return 0;

      const usersRef = collection(db, 'users');
      const q = query(
        usersRef,
        where('points', '>', userProfile.points)
      );

      const querySnap = await getDocs(q);
      return querySnap.size + 1; // Rank is one more than users with higher points
    } catch (error) {
      console.error('Error getting user rank:', error);
      return 0;
    }
  }

  // Bulk Scan Operations
  async createBulkScan(bulkData: Omit<BulkScanData, 'id' | 'createdAt'>): Promise<BulkScanData | null> {
    try {
      const db = await this.ensureFirestore();
      const bulkScansRef = collection(db, 'bulkScans');
      const bulkRef = doc(bulkScansRef);
      
      const newBulkScan: BulkScanData = {
        id: bulkRef.id,
        ...bulkData,
        createdAt: serverTimestamp() as any
      };

      await setDoc(bulkRef, newBulkScan);
      
      return {
        ...newBulkScan,
        createdAt: new Date() as any
      };
    } catch (error) {
      console.error('Error creating bulk scan:', error);
      throw error;
    }
  }

  async getUserBulkScans(
    userId: string, 
    options: PaginationOptions = {}
  ): Promise<QueryResult<BulkScanData>> {
    try {
      const db = await this.ensureFirestore();
      const bulkScansRef = collection(db, 'bulkScans');
      
      let q = query(
        bulkScansRef,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );

      if (options.limit) {
        q = query(q, limit(options.limit));
      }

      if (options.startAfter) {
        q = query(q, startAfter(options.startAfter));
      }

      const querySnap = await getDocs(q);
      const bulkScans: BulkScanData[] = [];
      
      querySnap.forEach((doc) => {
        const data = doc.data();
        bulkScans.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date()
        } as BulkScanData);
      });

      const lastDoc = querySnap.docs[querySnap.docs.length - 1];

      return {
        data: bulkScans,
        hasMore: querySnap.size === (options.limit || 10),
        lastDoc
      };
    } catch (error) {
      console.error('Error getting user bulk scans:', error);
      throw error;
    }
  }

  // Real-time Subscriptions
  subscribeToUserProfile(
    userId: string, 
    callback: (profile: UserProfile | null) => void
  ): RealtimeSubscription {
    const initSubscription = async () => {
      const db = await this.ensureFirestore();
      const userRef = doc(db, 'users', userId);
      
      const unsubscribe = onSnapshot(
        userRef,
        (doc) => {
          if (doc.exists()) {
            const data = doc.data();
            callback({
              id: doc.id,
              ...data,
              createdAt: data.createdAt?.toDate() || new Date(),
              updatedAt: data.updatedAt?.toDate() || new Date()
            } as UserProfile);
          } else {
            callback(null);
          }
        },
        (error) => {
          console.error('Error in profile subscription:', error);
        }
      );

      return { unsubscribe };
    };

    let unsubscribePromise = initSubscription();
    
    return {
      unsubscribe: () => {
        unsubscribePromise.then(({ unsubscribe }) => unsubscribe());
      }
    };
  }

  subscribeToUserScans(
    userId: string,
    callback: (scans: ScanResult[]) => void,
    options: { limit?: number } = {}
  ): RealtimeSubscription {
    const initSubscription = async () => {
      const db = await this.ensureFirestore();
      const scansRef = collection(db, 'scans');
      
      let q = query(
        scansRef,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );

      if (options.limit) {
        q = query(q, limit(options.limit));
      }

      const unsubscribe = onSnapshot(
        q,
        (querySnap) => {
          const scans: ScanResult[] = [];
          querySnap.forEach((doc) => {
            const data = doc.data();
            scans.push({
              id: doc.id,
              ...data,
              createdAt: data.createdAt?.toDate() || new Date(),
              updatedAt: data.updatedAt?.toDate() || new Date()
            } as unknown as ScanResult);
          });
          callback(scans);
        },
        (error) => {
          console.error('Error in scans subscription:', error);
        }
      );

      return { unsubscribe };
    };

    let unsubscribePromise = initSubscription();
    
    return {
      unsubscribe: () => {
        unsubscribePromise.then(({ unsubscribe }) => unsubscribe());
      }
    };
  }

  subscribeToLeaderboard(
    callback: (leaderboard: LeaderboardEntry[]) => void,
    options: { limit?: number } = {}
  ): RealtimeSubscription {
    const initSubscription = async () => {
      const db = await this.ensureFirestore();
      const usersRef = collection(db, 'users');
      
      let q = query(
        usersRef,
        orderBy('points', 'desc')
      );

      if (options.limit) {
        q = query(q, limit(options.limit));
      }

      const unsubscribe = onSnapshot(
        q,
        (querySnap) => {
          const leaderboard: LeaderboardEntry[] = [];
          querySnap.forEach((doc) => {
            const data = doc.data() as UserProfile;
            leaderboard.push({
              id: doc.id,
              userId: doc.id,
              name: data.name,
              avatarUrl: data.avatarUrl,
              points: data.points,
              totalScans: data.totalScans,
              ecoScore: data.ecoScore,
              rank: leaderboard.length + 1,
              achievements: data.achievements || []
            });
          });
          callback(leaderboard);
        },
        (error) => {
          console.error('Error in leaderboard subscription:', error);
        }
      );

      return { unsubscribe };
    };

    let unsubscribePromise = initSubscription();
    
    return {
      unsubscribe: () => {
        unsubscribePromise.then(({ unsubscribe }) => unsubscribe());
      }
    };
  }

  // Achievement Operations
  async addAchievement(userId: string, achievement: string): Promise<void> {
    try {
      const db = await this.ensureFirestore();
      const userRef = doc(db, 'users', userId);
      
      await updateDoc(userRef, {
        achievements: arrayUnion(achievement),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error adding achievement:', error);
      throw error;
    }
  }

  async removeAchievement(userId: string, achievement: string): Promise<void> {
    try {
      const db = await this.ensureFirestore();
      const userRef = doc(db, 'users', userId);
      
      await updateDoc(userRef, {
        achievements: arrayRemove(achievement),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error removing achievement:', error);
      throw error;
    }
  }

  // Analytics and Stats
  async getUserStats(userId: string): Promise<{
    totalScans: number;
    totalPoints: number;
    ecoScore: number;
    favoriteCount: number;
    rank: number;
    achievements: string[];
  } | null> {
    try {
      const userProfile = await this.getUserProfile(userId);
      if (!userProfile) return null;

      const favoritesResult = await this.getUserFavorites(userId, { limit: 1 });
      const rank = await this.getUserRank(userId);

      return {
        totalScans: userProfile.totalScans,
        totalPoints: userProfile.points,
        ecoScore: userProfile.ecoScore,
        favoriteCount: favoritesResult.data.length,
        rank,
        achievements: userProfile.achievements || []
      };
    } catch (error) {
      console.error('Error getting user stats:', error);
      return null;
    }
  }
}

// Export a singleton instance
export const firestoreService = new FirestoreService();
export default firestoreService;
