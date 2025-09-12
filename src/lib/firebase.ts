// src/lib/firebase.ts
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { 
  getFirestore, 
  Firestore, 
  connectFirestoreEmulator,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager
} from 'firebase/firestore';

interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}

// Firebase configuration - replace with your actual config
const firebaseConfig: FirebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "demo-api-key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "eco-snap-sparkle.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "eco-snap-sparkle",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "eco-snap-sparkle.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789012",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789012:web:abcdef123456",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

class FirebaseManager {
  private static instance: FirebaseManager;
  private app: FirebaseApp | null = null;
  private firestore: Firestore | null = null;
  private isInitialized = false;

  private constructor() {}

  public static getInstance(): FirebaseManager {
    if (!FirebaseManager.instance) {
      FirebaseManager.instance = new FirebaseManager();
    }
    return FirebaseManager.instance;
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // Initialize Firebase app if not already done
      if (getApps().length === 0) {
        this.app = initializeApp(firebaseConfig);
        console.log('✅ Firebase app initialized');
      } else {
        this.app = getApps()[0];
        console.log('✅ Firebase app already initialized');
      }

      // Initialize Firestore with offline persistence
      if (!this.firestore) {
        // Always use production mode for now to avoid emulator issues
        this.firestore = initializeFirestore(this.app, {
          localCache: persistentLocalCache({
            tabManager: persistentMultipleTabManager()
          })
        });
        console.log('✅ Firestore initialized with offline persistence');
      }

      this.isInitialized = true;
    } catch (error) {
      console.error('❌ Firebase initialization failed:', error);
      throw new Error(`Firebase initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  public getFirestore(): Firestore {
    if (!this.firestore) {
      throw new Error('Firestore not initialized. Call initialize() first.');
    }
    return this.firestore;
  }

  public getApp(): FirebaseApp {
    if (!this.app) {
      throw new Error('Firebase app not initialized. Call initialize() first.');
    }
    return this.app;
  }

  public isReady(): boolean {
    return this.isInitialized && this.app !== null && this.firestore !== null;
  }

  // Utility method for connection status
  public async waitForConnection(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    // In a real app, you might want to implement a connection health check
    return Promise.resolve();
  }
}

// Initialize Firebase on module load
const firebaseManager = FirebaseManager.getInstance();

// Auto-initialize Firebase
let initPromise: Promise<void> | null = null;

export const initializeFirebase = (): Promise<void> => {
  if (!initPromise) {
    initPromise = firebaseManager.initialize();
  }
  return initPromise;
};

// Export initialized Firestore instance
export const getDb = (): Firestore => {
  return firebaseManager.getFirestore();
};

// Export Firebase app instance
export const getFirebaseApp = (): FirebaseApp => {
  return firebaseManager.getApp();
};

// Check if Firebase is ready
export const isFirebaseReady = (): boolean => {
  return firebaseManager.isReady();
};

// Wait for Firebase connection
export const waitForFirebase = (): Promise<void> => {
  return firebaseManager.waitForConnection();
};

// Collection names as constants
export const COLLECTIONS = {
  USERS: 'users',
  SCANS: 'scans',
  FAVORITES: 'favorites',
  LEADERBOARD: 'leaderboard',
  BULK_SCANS: 'bulkScans',
  CHALLENGES: 'challenges'
} as const;

// Auto-initialize Firebase when this module is imported
initializeFirebase().catch(console.error);

export default firebaseManager;
