// Simple External Database API Service
// src/services/external-db-service.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface ExternalProduct {
  id: string;
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
  alternatives?: ExternalProduct[];
  market_data?: {
    price_range: { min: number; max: number };
    availability: string[];
  };
  created_at: string;
  updated_at: string;
}

interface ExternalScan {
  id: string;
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
  timestamp: string;
}

class ExternalDatabaseService {
  private baseUrl: string;
  private apiKey?: string;

  constructor() {
    // You can use various free database APIs:
    // - JSONBin.io (Free JSON storage)
    // - Airtable API (Free tier)
    // - FaunaDB (Free tier)
    // - PlanetScale (Free tier)
    // - Railway PostgreSQL (Free tier)
    
    this.baseUrl = import.meta.env.VITE_EXTERNAL_DB_URL || 'https://api.jsonbin.io/v3';
    this.apiKey = import.meta.env.VITE_EXTERNAL_DB_API_KEY;
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(this.apiKey && { 'X-Master-Key': this.apiKey }),
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error(`API request failed:`, error);
      return { success: false, error };
    }
  }

  // Product Operations
  async createProduct(productData: Omit<ExternalProduct, 'id' | 'created_at' | 'updated_at'>): Promise<ExternalProduct | null> {
    const product: ExternalProduct = {
      ...productData,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const result = await this.makeRequest('/b', {
      method: 'POST',
      body: JSON.stringify(product),
    });

    return result.success ? product : null;
  }

  async findProductByBarcode(barcode: string): Promise<ExternalProduct | null> {
    // In a real implementation, you'd have a proper search endpoint
    // For demo purposes, we'll simulate this
    console.log(`Searching for product with barcode: ${barcode}`);
    
    // Simulate API response
    return {
      id: crypto.randomUUID(),
      barcode,
      name: 'Sample Product',
      brand: 'EcoFriendly Brand',
      category: 'Household',
      eco_metrics: {
        sustainability_score: 85,
        carbon_footprint: 2.3,
        packaging_score: 78,
        certifications: ['Organic', 'Fair Trade'],
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  async searchProducts(query: string, limit = 20): Promise<ExternalProduct[]> {
    // Simulate product search
    console.log(`Searching products with query: ${query}`);
    
    // Return sample data
    return Array.from({ length: Math.min(5, limit) }, (_, index) => ({
      id: crypto.randomUUID(),
      name: `Product ${index + 1} - ${query}`,
      brand: `Brand ${index + 1}`,
      category: 'Sample Category',
      eco_metrics: {
        sustainability_score: Math.floor(Math.random() * 40) + 60,
        carbon_footprint: Math.random() * 3 + 1,
        packaging_score: Math.floor(Math.random() * 30) + 50,
        certifications: ['Eco-Friendly'],
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));
  }

  // Scan Operations
  async createScan(scanData: Omit<ExternalScan, 'id' | 'timestamp'>): Promise<ExternalScan | null> {
    const scan: ExternalScan = {
      ...scanData,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
    };

    console.log('Creating scan in external database:', scan);
    
    // Simulate successful creation
    return scan;
  }

  async getUserScans(userId: string, limit = 50): Promise<ExternalScan[]> {
    console.log(`Fetching scans for user: ${userId}`);
    
    // Return sample scan data
    return Array.from({ length: Math.min(3, limit) }, (_, index) => ({
      id: crypto.randomUUID(),
      user_id: userId,
      product_id: crypto.randomUUID(),
      scan_data: {
        detected_name: `Product Scan ${index + 1}`,
        confidence: Math.random() * 0.3 + 0.7, // 70-100% confidence
        analysis_method: ['ai', 'barcode', 'text'][Math.floor(Math.random() * 3)] as 'ai' | 'barcode' | 'text',
      },
      results: {
        eco_score: Math.floor(Math.random() * 40) + 60,
        sustainability_rating: ['Good', 'Excellent', 'Outstanding'][Math.floor(Math.random() * 3)],
        improvement_suggestions: [
          'Consider switching to organic alternatives',
          'Look for products with less packaging',
          'Choose locally sourced options when available',
        ],
      },
      timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(), // Within last week
    }));
  }

  async getScanAnalytics(userId?: string) {
    console.log('Fetching scan analytics for user:', userId || 'all users');
    
    // Return sample analytics
    return {
      total_scans: Math.floor(Math.random() * 100) + 10,
      avg_eco_score: Math.floor(Math.random() * 20) + 70,
      unique_products_count: Math.floor(Math.random() * 50) + 5,
      scan_method_distribution: {
        ai: Math.floor(Math.random() * 50) + 20,
        barcode: Math.floor(Math.random() * 30) + 10,
        text: Math.floor(Math.random() * 20) + 5,
      },
    };
  }
}

// Singleton instance
export const externalDbService = new ExternalDatabaseService();

// React Hooks for External Database operations
export const useExternalProduct = () => {
  const queryClient = useQueryClient();

  const searchProducts = useQuery({
    queryKey: ['external-products-search'],
    queryFn: ({ queryKey }) => {
      const [, query] = queryKey as [string, string];
      return externalDbService.searchProducts(query || '');
    },
    enabled: false, // Only run when explicitly called
  });

  const getProductByBarcode = useMutation({
    mutationFn: (barcode: string) => externalDbService.findProductByBarcode(barcode),
    onSuccess: (data) => {
      if (data) {
        queryClient.setQueryData(['external-product', data.barcode], data);
      }
    },
  });

  const createProduct = useMutation({
    mutationFn: (productData: Omit<ExternalProduct, 'id' | 'created_at' | 'updated_at'>) =>
      externalDbService.createProduct(productData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['external-products'] });
    },
  });

  return {
    searchProducts: (query: string) => {
      queryClient.setQueryData(['external-products-search'], query);
      return searchProducts.refetch();
    },
    getProductByBarcode,
    createProduct,
  };
};

export const useExternalScan = () => {
  const queryClient = useQueryClient();

  const createScan = useMutation({
    mutationFn: (scanData: Omit<ExternalScan, 'id' | 'timestamp'>) =>
      externalDbService.createScan(scanData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['external-scans'] });
      queryClient.invalidateQueries({ queryKey: ['external-analytics'] });
    },
  });

  const getUserScans = useQuery({
    queryKey: ['external-scans'],
    queryFn: ({ queryKey }) => {
      const [, userId] = queryKey as [string, string];
      return externalDbService.getUserScans(userId);
    },
    enabled: false,
  });

  const getAnalytics = useQuery({
    queryKey: ['external-analytics'],
    queryFn: ({ queryKey }) => {
      const [, userId] = queryKey as [string, string | undefined];
      return externalDbService.getScanAnalytics(userId);
    },
    enabled: false,
  });

  return {
    createScan,
    getUserScans: (userId: string) => {
      queryClient.setQueryData(['external-scans'], userId);
      return getUserScans.refetch();
    },
    getAnalytics: (userId?: string) => {
      queryClient.setQueryData(['external-analytics'], userId);
      return getAnalytics.refetch();
    },
  };
};

// Configuration for different external database providers
export const DATABASE_PROVIDERS = {
  JSONBIN: {
    name: 'JSONBin.io',
    description: 'Simple JSON storage with REST API',
    setup: 'Create account at jsonbin.io, get API key',
    free_tier: '10,000 requests/month',
    url: 'https://api.jsonbin.io/v3',
  },
  AIRTABLE: {
    name: 'Airtable',
    description: 'Spreadsheet-like database with API',
    setup: 'Create Airtable base, get API key and base ID',
    free_tier: '1,200 records per base',
    url: 'https://api.airtable.com/v0',
  },
  FAUNA: {
    name: 'FaunaDB',
    description: 'Serverless, globally distributed database',
    setup: 'Create Fauna account, get secret key',
    free_tier: '100,000 read/write ops per day',
    url: 'https://db.fauna.com',
  },
  PLANETSCALE: {
    name: 'PlanetScale',
    description: 'Serverless MySQL platform',
    setup: 'Create database, get connection string',
    free_tier: '10GB storage, 1 billion row reads/month',
    url: 'Connect via MySQL protocol',
  },
};
