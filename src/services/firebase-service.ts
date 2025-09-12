// Alternative Database Service - Firebase Firestore
// src/services/firebase-service.ts

interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

interface Product {
  id?: string;
  barcode?: string;
  name: string;
  brand: string;
  category: string;
  eco_metrics: {
    sustainability_score: number;
    carbon_footprint: number;
    packaging_score: number;
    certifications: string[];
  };
  alternatives?: Product[];
  market_data?: {
    price_range: { min: number; max: number };
    availability: string[];
  };
  created_at: Date;
  updated_at: Date;
}

interface ScanRecord {
  id?: string;
  user_id: string; // From Supabase auth
  product_id?: string;
  scan_data: {
    detected_name: string;
    confidence: number;
    analysis_method: 'ai' | 'barcode' | 'text';
  };
  results: {
    eco_score: number;
    sustainability_rating: string;
    improvement_suggestions: string[];
  };
  timestamp: Date;
}

class FirebaseService {
  private db: any;
  private initialized = false;

  constructor() {
    // Initialize Firebase if not already done
    this.initializeFirebase();
  }

  private async initializeFirebase() {
    if (this.initialized) return;

    try {
      // Dynamic import to avoid bundling issues
      const { initializeApp, getApps } = await import('firebase/app');
      const { getFirestore, connectFirestoreEmulator } = await import('firebase/firestore');

      const firebaseConfig: FirebaseConfig = {
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "demo-key",
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "demo-project.firebaseapp.com",
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "demo-project",
        storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "demo-project.appspot.com",
        messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
        appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789:web:abcdef"
      };

      // Initialize Firebase only if no apps exist
      const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
      this.db = getFirestore(app);

      // Use emulator in development
      if (import.meta.env.DEV && !this.initialized) {
        try {
          connectFirestoreEmulator(this.db, 'localhost', 8080);
        } catch (error) {
          console.log('Firestore emulator already connected or not available');
        }
      }

      this.initialized = true;
      console.log('✅ Firebase initialized successfully');
    } catch (error) {
      console.error('❌ Firebase initialization failed:', error);
      this.initialized = false;
    }
  }

  async ensureInitialized() {
    if (!this.initialized) {
      await this.initializeFirebase();
    }
    return this.initialized;
  }

  // Product Operations
  async createProduct(productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product | null> {
    if (!await this.ensureInitialized()) return null;

    try {
      const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
      
      const product = {
        ...productData,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
      };

      const docRef = await addDoc(collection(this.db, 'products'), product);
      
      return {
        ...productData,
        id: docRef.id,
        created_at: new Date(),
        updated_at: new Date()
      };
    } catch (error) {
      console.error('Error creating product:', error);
      return null;
    }
  }

  async findProductByBarcode(barcode: string): Promise<Product | null> {
    if (!await this.ensureInitialized()) return null;

    try {
      const { collection, query, where, getDocs } = await import('firebase/firestore');
      
      const q = query(collection(this.db, 'products'), where('barcode', '==', barcode));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) return null;
      
      const doc = querySnapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data(),
        created_at: doc.data().created_at?.toDate() || new Date(),
        updated_at: doc.data().updated_at?.toDate() || new Date()
      } as Product;
    } catch (error) {
      console.error('Error finding product:', error);
      return null;
    }
  }

  async searchProducts(searchQuery: string, limit = 20): Promise<Product[]> {
    if (!await this.ensureInitialized()) return [];

    try {
      const { collection, query, where, orderBy, limitToLast, getDocs } = await import('firebase/firestore');
      
      // Simple text search (Firestore doesn't have full-text search built-in)
      const q = query(
        collection(this.db, 'products'),
        orderBy('eco_metrics.sustainability_score', 'desc'),
        limitToLast(limit)
      );
      
      const querySnapshot = await getDocs(q);
      const products: Product[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const product = {
          id: doc.id,
          ...data,
          created_at: data.created_at?.toDate() || new Date(),
          updated_at: data.updated_at?.toDate() || new Date()
        } as Product;
        
        // Client-side filtering for search
        if (
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.category.toLowerCase().includes(searchQuery.toLowerCase())
        ) {
          products.push(product);
        }
      });
      
      return products;
    } catch (error) {
      console.error('Error searching products:', error);
      return [];
    }
  }

  // Scan Operations
  async createScan(scanData: Omit<ScanRecord, 'id' | 'timestamp'>): Promise<ScanRecord | null> {
    if (!await this.ensureInitialized()) return null;

    try {
      const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
      
      const scan = {
        ...scanData,
        timestamp: serverTimestamp()
      };

      const docRef = await addDoc(collection(this.db, 'scans'), scan);
      
      return {
        ...scanData,
        id: docRef.id,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Error creating scan:', error);
      return null;
    }
  }

  async getUserScans(userId: string, limit = 50): Promise<ScanRecord[]> {
    if (!await this.ensureInitialized()) return [];

    try {
      const { collection, query, where, orderBy, limitToLast, getDocs } = await import('firebase/firestore');
      
      const q = query(
        collection(this.db, 'scans'),
        where('user_id', '==', userId),
        orderBy('timestamp', 'desc'),
        limitToLast(limit)
      );
      
      const querySnapshot = await getDocs(q);
      const scans: ScanRecord[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        scans.push({
          id: doc.id,
          ...data,
          timestamp: data.timestamp?.toDate() || new Date()
        } as ScanRecord);
      });
      
      return scans;
    } catch (error) {
      console.error('Error getting user scans:', error);
      return [];
    }
  }

  async getScanAnalytics(userId?: string) {
    if (!await this.ensureInitialized()) {
      return {
        total_scans: 0,
        avg_eco_score: 0,
        unique_products_count: 0,
        scan_method_distribution: {}
      };
    }

    try {
      const { collection, query, where, getDocs } = await import('firebase/firestore');
      
      let q;
      if (userId) {
        q = query(collection(this.db, 'scans'), where('user_id', '==', userId));
      } else {
        q = query(collection(this.db, 'scans'));
      }
      
      const querySnapshot = await getDocs(q);
      
      let totalScans = 0;
      let totalEcoScore = 0;
      const uniqueProducts = new Set();
      const scanMethods: { [key: string]: number } = {};
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        totalScans++;
        totalEcoScore += data.results?.eco_score || 0;
        
        if (data.product_id) {
          uniqueProducts.add(data.product_id);
        }
        
        const method = data.scan_data?.analysis_method || 'unknown';
        scanMethods[method] = (scanMethods[method] || 0) + 1;
      });
      
      return {
        total_scans: totalScans,
        avg_eco_score: totalScans > 0 ? Math.round((totalEcoScore / totalScans) * 100) / 100 : 0,
        unique_products_count: uniqueProducts.size,
        scan_method_distribution: scanMethods
      };
    } catch (error) {
      console.error('Error getting analytics:', error);
      return {
        total_scans: 0,
        avg_eco_score: 0,
        unique_products_count: 0,
        scan_method_distribution: {}
      };
    }
  }
}

// Singleton instance
export const firebaseService = new FirebaseService();

// React Hooks for Firebase operations
export const useFirebaseProduct = () => {
  const searchProducts = async (query: string) => {
    return await firebaseService.searchProducts(query);
  };

  const getProductByBarcode = async (barcode: string) => {
    return await firebaseService.findProductByBarcode(barcode);
  };

  const createProduct = async (productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => {
    return await firebaseService.createProduct(productData);
  };

  return {
    searchProducts,
    getProductByBarcode,
    createProduct
  };
};

export const useFirebaseScan = () => {
  const createScan = async (scanData: Omit<ScanRecord, 'id' | 'timestamp'>) => {
    return await firebaseService.createScan(scanData);
  };

  const getUserScans = async (userId: string) => {
    return await firebaseService.getUserScans(userId);
  };

  const getAnalytics = async (userId?: string) => {
    return await firebaseService.getScanAnalytics(userId);
  };

  return {
    createScan,
    getUserScans,
    getAnalytics
  };
};
