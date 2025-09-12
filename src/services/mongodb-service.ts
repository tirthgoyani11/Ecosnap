// MongoDB Product Service Integration - DISABLED FOR DEPLOYMENT
// src/services/mongodb-service.ts

// MongoDB imports disabled to prevent build errors
// import { MongoClient, Db, Collection } from 'mongodb';

interface Product {
  _id?: string;
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

interface Scan {
  _id?: string;
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

/*
// MongoDB service disabled for deployment - using Firebase/Supabase instead
class MongoDBService {
  private client: MongoClient;
  private db: Db;
  private products: Collection<Product>;
  private scans: Collection<Scan>;

  constructor() {
    const connectionString = process.env.MONGODB_CONNECTION_STRING || 
      process.env.VITE_MONGODB_CONNECTION_STRING || 
      'mongodb://localhost:27017';
    
    this.client = new MongoClient(connectionString);
  }

  async connect() {
    try {
      await this.client.connect();
      this.db = this.client.db('ecosnap');
      this.products = this.db.collection<Product>('products');
      this.scans = this.db.collection<Scan>('scans');
      
      // Create indexes for better performance
      await this.createIndexes();
      
      console.log('✅ Connected to MongoDB');
      return true;
    } catch (error) {
      console.error('❌ MongoDB connection failed:', error);
      return false;
    }
  }

  private async createIndexes() {
    // Product indexes
    await this.products.createIndex({ barcode: 1 }, { unique: true, sparse: true });
    await this.products.createIndex({ name: 'text', brand: 'text', category: 'text' });
    await this.products.createIndex({ 'eco_metrics.sustainability_score': -1 });
    
    // Scan indexes
    await this.scans.createIndex({ user_id: 1, timestamp: -1 });
    await this.scans.createIndex({ timestamp: -1 });
  }

  // Product Operations
  async createProduct(productData: Omit<Product, '_id' | 'created_at' | 'updated_at'>): Promise<Product> {
    const product: Product = {
      ...productData,
      created_at: new Date(),
      updated_at: new Date()
    };

    const result = await this.products.insertOne(product);
    return { ...product, _id: result.insertedId.toString() };
  }

  async findProductByBarcode(barcode: string): Promise<Product | null> {
    return await this.products.findOne({ barcode });
  }

  async searchProducts(query: string, limit = 20): Promise<Product[]> {
    return await this.products
      .find({ $text: { $search: query } })
      .limit(limit)
      .toArray();
  }

  async getProductsByCategory(category: string, limit = 20): Promise<Product[]> {
    return await this.products
      .find({ category })
      .sort({ 'eco_metrics.sustainability_score': -1 })
      .limit(limit)
      .toArray();
  }

  async getTopSustainableProducts(limit = 10): Promise<Product[]> {
    return await this.products
      .find({})
      .sort({ 'eco_metrics.sustainability_score': -1 })
      .limit(limit)
      .toArray();
  }

  // Scan Operations
  async createScan(scanData: Omit<Scan, '_id' | 'timestamp'>): Promise<Scan> {
    const scan: Scan = {
      ...scanData,
      timestamp: new Date()
    };

    const result = await this.scans.insertOne(scan);
    return { ...scan, _id: result.insertedId.toString() };
  }

  async getUserScans(userId: string, limit = 50): Promise<Scan[]> {
    return await this.scans
      .find({ user_id: userId })
      .sort({ timestamp: -1 })
      .limit(limit)
      .toArray();
  }

  async getScanAnalytics(userId?: string) {
    const matchStage = userId ? { $match: { user_id: userId } } : { $match: {} };
    
    const pipeline = [
      matchStage,
      {
        $group: {
          _id: null,
          total_scans: { $sum: 1 },
          avg_eco_score: { $avg: '$results.eco_score' },
          total_unique_products: { $addToSet: '$product_id' },
          scan_methods: {
            $push: '$scan_data.analysis_method'
          }
        }
      },
      {
        $project: {
          total_scans: 1,
          avg_eco_score: { $round: ['$avg_eco_score', 2] },
          unique_products_count: { $size: '$total_unique_products' },
          scan_method_distribution: {
            $reduce: {
              input: '$scan_methods',
              initialValue: {},
              in: {
                $mergeObjects: [
                  '$$value',
                  {
                    $let: {
                      vars: { method: '$$this' },
                      in: {
                        $arrayToObject: [[{
                          k: '$$method',
                          v: { $add: [{ $ifNull: [{ $getField: { input: '$$value', field: '$$method' } }, 0] }, 1] }
                        }]]
                      }
                    }
                  }
                ]
              }
            }
          }
        }
      }
    ];

    const result = await this.scans.aggregate(pipeline).toArray();
    return result[0] || {
      total_scans: 0,
      avg_eco_score: 0,
      unique_products_count: 0,
      scan_method_distribution: {}
    };
  }

  async disconnect() {
    await this.client.close();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Singleton instance
export const mongoService = new MongoDBService();

// React Hook for MongoDB operations
export const useMongoProduct = () => {
  const searchProducts = async (query: string) => {
    await mongoService.connect();
    return await mongoService.searchProducts(query);
  };

  const getProductByBarcode = async (barcode: string) => {
    await mongoService.connect();
    return await mongoService.findProductByBarcode(barcode);
  };

  const createProduct = async (productData: Omit<Product, '_id' | 'created_at' | 'updated_at'>) => {
    await mongoService.connect();
    return await mongoService.createProduct(productData);
  };

  return {
    searchProducts,
    getProductByBarcode,
    createProduct
  };
};

// React Hook for MongoDB scans
export const useMongoScan = () => {
  const createScan = async (scanData: Omit<Scan, '_id' | 'timestamp'>) => {
    await mongoService.connect();
    return await mongoService.createScan(scanData);
  };

  const getUserScans = async (userId: string) => {
    await mongoService.connect();
    return await mongoService.getUserScans(userId);
  };

  const getAnalytics = async (userId?: string) => {
    await mongoService.connect();
    return await mongoService.getScanAnalytics(userId);
  };

  return {
    createScan,
    getUserScans,
    getAnalytics
  };
};
*/

// Export disabled MongoDB service with null values to prevent import errors
export const mongoService = null;
export const useMongoScan = () => ({
  createScan: async () => null,
  getUserScans: async () => [],
  getAnalytics: async () => null
});
