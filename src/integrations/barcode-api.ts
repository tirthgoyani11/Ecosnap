/**
 * Barcode Lookup API Integration
 * 
 * Provides comprehensive product information from barcode scanning
 * using multiple barcode databases for maximum coverage.
 * 
 * API Features:
 * - 1.5+ billion products in database
 * - Real-time price comparisons
 * - Store availability data
 * - Product specifications
 * - User reviews and ratings
 */

export interface BarcodeResponse {
  product_name: string;
  brand: string;
  category: string;
  description: string;
  barcode: string;
  
  // Price information
  price_data: {
    average_price: number;
    price_range: {
      min: number;
      max: number;
    };
    currency: string;
    stores: Array<{
      name: string;
      price: number;
      availability: boolean;
      url?: string;
    }>;
  };
  
  // Product details
  specifications: {
    weight?: string;
    dimensions?: string;
    manufacturer?: string;
    country_of_origin?: string;
    model_number?: string;
  };
  
  // Reviews and ratings
  reviews: {
    average_rating: number; // 1-5 stars
    total_reviews: number;
    rating_distribution: {
      five_star: number;
      four_star: number;
      three_star: number;
      two_star: number;
      one_star: number;
    };
  };
  
  // Images
  images: string[];
  
  // Metadata
  last_updated: Date;
  data_source: string;
  confidence: number; // 0-1
}

export class BarcodeAPI {
  private static readonly API_URL = 'https://api.barcodelookup.com/v3';
  private static readonly FALLBACK_URL = 'https://api.upcitemdb.com/prod/trial';
  private static readonly API_KEY = (import.meta as any).env?.VITE_BARCODE_API_KEY || '';
  
  /**
   * Look up comprehensive product information by barcode
   */
  static async lookupProduct(barcode: string): Promise<BarcodeResponse> {
    if (!this.API_KEY) {
      console.warn('Barcode API key not available, using estimation');
      return this.generateFallbackResponse(barcode);
    }
    
    try {
      // Try primary barcode lookup service
      const primaryResult = await this.tryPrimaryLookup(barcode);
      if (primaryResult) {
        return primaryResult;
      }
      
      // Fallback to secondary service
      const fallbackResult = await this.tryFallbackLookup(barcode);
      if (fallbackResult) {
        return fallbackResult;
      }
      
      throw new Error('No barcode data found');
      
    } catch (error) {
      console.warn('Barcode lookup failed, generating estimated response:', error);
      return this.generateFallbackResponse(barcode);
    }
  }
  
  /**
   * Search for products by name (when barcode lookup fails)
   */
  static async searchProducts(productName: string, limit: number = 5): Promise<BarcodeResponse[]> {
    if (!this.API_KEY) {
      return [this.generateFallbackResponse('', productName)];
    }
    
    try {
      const response = await fetch(`${this.API_URL}/products?search=${encodeURIComponent(productName)}&limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${this.API_KEY}`,
        }
      });
      
      if (!response.ok) {
        throw new Error(`Barcode search error: ${response.status}`);
      }
      
      const data = await response.json();
      return data.products?.map((product: any) => this.mapBarcodeResponse(product)) || [];
      
    } catch (error) {
      console.warn('Barcode search failed:', error);
      return [this.generateFallbackResponse('', productName)];
    }
  }
  
  /**
   * Get price comparison data for a product
   */
  static async getPriceComparison(barcode: string): Promise<any> {
    if (!this.API_KEY) {
      return this.generateDefaultPricing();
    }
    
    try {
      const response = await fetch(`${this.API_URL}/products/${barcode}/prices`, {
        headers: {
          'Authorization': `Bearer ${this.API_KEY}`,
        }
      });
      
      if (!response.ok) {
        throw new Error(`Price comparison error: ${response.status}`);
      }
      
      return await response.json();
      
    } catch (error) {
      console.warn('Price comparison failed:', error);
      return this.generateDefaultPricing();
    }
  }
  
  private static async tryPrimaryLookup(barcode: string): Promise<BarcodeResponse | null> {
    try {
      const response = await fetch(`${this.API_URL}/products/${barcode}`, {
        headers: {
          'Authorization': `Bearer ${this.API_KEY}`,
        }
      });
      
      if (!response.ok) {
        return null;
      }
      
      const data = await response.json();
      return this.mapBarcodeResponse(data.product);
      
    } catch (error) {
      console.warn('Primary barcode lookup failed:', error);
      return null;
    }
  }
  
  private static async tryFallbackLookup(barcode: string): Promise<BarcodeResponse | null> {
    try {
      // Try UPC Item DB as fallback (free tier available)
      const response = await fetch(`${this.FALLBACK_URL}/lookup?upc=${barcode}`);
      
      if (!response.ok) {
        return null;
      }
      
      const data = await response.json();
      
      if (data.items && data.items.length > 0) {
        return this.mapUPCResponse(data.items[0]);
      }
      
      return null;
      
    } catch (error) {
      console.warn('Fallback barcode lookup failed:', error);
      return null;
    }
  }
  
  private static mapBarcodeResponse(apiData: any): BarcodeResponse {
    return {
      product_name: apiData.title || apiData.product_name || 'Unknown Product',
      brand: apiData.brand || apiData.manufacturer || 'Unknown Brand',
      category: apiData.category || this.inferCategory(apiData.title || ''),
      description: apiData.description || '',
      barcode: apiData.barcode || apiData.upc || '',
      
      price_data: {
        average_price: apiData.average_price || 0,
        price_range: {
          min: apiData.lowest_price || 0,
          max: apiData.highest_price || 0
        },
        currency: apiData.currency || 'USD',
        stores: this.mapStoreData(apiData.stores || [])
      },
      
      specifications: {
        weight: apiData.weight || apiData.size,
        dimensions: apiData.dimensions,
        manufacturer: apiData.manufacturer,
        country_of_origin: apiData.country,
        model_number: apiData.model
      },
      
      reviews: {
        average_rating: apiData.rating || 0,
        total_reviews: apiData.reviews_count || 0,
        rating_distribution: this.mapRatingDistribution(apiData.rating_breakdown || {})
      },
      
      images: apiData.images || [apiData.image] || [],
      
      last_updated: new Date(),
      data_source: 'BarcodeAPI',
      confidence: 0.9
    };
  }
  
  private static mapUPCResponse(apiData: any): BarcodeResponse {
    return {
      product_name: apiData.title || 'Unknown Product',
      brand: apiData.brand || 'Unknown Brand',
      category: apiData.category || this.inferCategory(apiData.title || ''),
      description: apiData.description || '',
      barcode: apiData.upc || '',
      
      price_data: {
        average_price: 0,
        price_range: { min: 0, max: 0 },
        currency: 'USD',
        stores: []
      },
      
      specifications: {
        weight: apiData.size,
        manufacturer: apiData.brand,
        model_number: apiData.model
      },
      
      reviews: {
        average_rating: 0,
        total_reviews: 0,
        rating_distribution: {
          five_star: 0, four_star: 0, three_star: 0, two_star: 0, one_star: 0
        }
      },
      
      images: apiData.images || [],
      
      last_updated: new Date(),
      data_source: 'UPCItemDB',
      confidence: 0.7
    };
  }
  
  private static generateFallbackResponse(barcode: string, productName?: string): BarcodeResponse {
    const name = productName || 'Unknown Product';
    
    return {
      product_name: name,
      brand: 'Unknown Brand',
      category: this.inferCategory(name),
      description: `Product information for ${name}`,
      barcode: barcode,
      
      price_data: {
        average_price: 0,
        price_range: { min: 0, max: 0 },
        currency: 'USD',
        stores: []
      },
      
      specifications: {
        weight: undefined,
        dimensions: undefined,
        manufacturer: undefined,
        country_of_origin: undefined,
        model_number: undefined
      },
      
      reviews: {
        average_rating: 0,
        total_reviews: 0,
        rating_distribution: {
          five_star: 0,
          four_star: 0,
          three_star: 0,
          two_star: 0,
          one_star: 0
        }
      },
      
      images: [],
      
      last_updated: new Date(),
      data_source: 'Fallback',
      confidence: 0.1
    };
  }
  
  private static inferCategory(productName: string): string {
    const name = productName.toLowerCase();
    
    // Food categories
    if (name.includes('organic') || name.includes('food') || name.includes('snack')) return 'Food';
    if (name.includes('drink') || name.includes('beverage') || name.includes('juice')) return 'Beverages';
    if (name.includes('meat') || name.includes('chicken') || name.includes('beef')) return 'Meat';
    if (name.includes('milk') || name.includes('cheese') || name.includes('yogurt')) return 'Dairy';
    
    // Non-food categories
    if (name.includes('phone') || name.includes('electronic') || name.includes('device')) return 'Electronics';
    if (name.includes('shirt') || name.includes('clothing') || name.includes('apparel')) return 'Clothing';
    if (name.includes('beauty') || name.includes('cosmetic') || name.includes('makeup')) return 'Beauty';
    if (name.includes('clean') || name.includes('detergent') || name.includes('soap')) return 'Cleaning';
    
    return 'Unknown Category';
  }
  
  private static mapStoreData(stores: any[]): Array<{
    name: string;
    price: number;
    availability: boolean;
    url?: string;
  }> {
    return stores.map(store => ({
      name: store.name || store.store_name || 'Unknown Store',
      price: parseFloat(store.price) || 0,
      availability: store.in_stock !== false,
      url: store.url || store.link
    }));
  }
  
  private static mapRatingDistribution(breakdown: any): any {
    return {
      five_star: breakdown['5'] || breakdown.five || 0,
      four_star: breakdown['4'] || breakdown.four || 0,
      three_star: breakdown['3'] || breakdown.three || 0,
      two_star: breakdown['2'] || breakdown.two || 0,
      one_star: breakdown['1'] || breakdown.one || 0
    };
  }
  
  private static generateDefaultPricing(): any {
    return {
      average_price: 0,
      stores: [],
      currency: 'USD',
      last_updated: new Date()
    };
  }
}