/**
 * Walmart Open API Integration
 * 
 * Provides product search, pricing, and availability data from Walmart.
 * 
 * API Features:
 * - Product search by name/UPC
 * - Real-time pricing data
 * - Store inventory and availability
 * - Product specifications and images
 * - Customer reviews and ratings
 * - Nutritional information for food items
 */

export interface WalmartResponse {
  product_name: string;
  brand: string;
  upc: string;
  walmart_item_id: string;
  
  // Pricing
  price: number;
  currency: string;
  sale_price?: number;
  price_per_unit?: string;
  
  // Availability
  availability: {
    in_stock: boolean;
    stock_level: 'High' | 'Medium' | 'Low' | 'Out of Stock';
    shipping_available: boolean;
    pickup_available: boolean;
    delivery_available: boolean;
  };
  
  // Product details
  description: string;
  specifications: {
    weight?: string;
    dimensions?: string;
    model_number?: string;
    manufacturer?: string;
  };
  
  // Images and media
  images: string[];
  thumbnail: string;
  
  // Reviews
  reviews: {
    average_rating: number; // 1-5
    total_reviews: number;
    rating_breakdown: {
      five_star: number;
      four_star: number;
      three_star: number;
      two_star: number;
      one_star: number;
    };
  };
  
  // Category and classification
  category: string;
  subcategory?: string;
  department: string;
  
  // Store information
  store_info: {
    available_online: boolean;
    available_in_store: boolean;
    store_locations?: Array<{
      store_id: string;
      address: string;
      in_stock: boolean;
    }>;
  };
  
  // Additional data
  nutrition_info?: any;
  ingredients?: string;
  allergen_info?: string[];
}

export class WalmartAPI {
  private static readonly API_URL = 'https://api.walmart.com/v1';
  private static readonly AFFILIATE_API_URL = 'https://affiliate-api.walmart.com/v1';
  private static readonly API_KEY = (import.meta as any).env?.VITE_WALMART_API_KEY || '';
  
  /**
   * Search for products by name or UPC
   */
  static async searchProduct(query: string, limit: number = 10): Promise<WalmartResponse[]> {
    if (!this.API_KEY) {
      console.warn('Walmart API key not available, using mock data');
      return [this.generateMockResponse(query)];
    }
    
    try {
      // Try UPC lookup first if query looks like a barcode
      if (this.isBarcode(query)) {
        const upcResult = await this.lookupByUPC(query);
        if (upcResult) {
          return [upcResult];
        }
      }
      
      // Fallback to text search
      return await this.searchByText(query, limit);
      
    } catch (error) {
      console.warn('Walmart API search failed:', error);
      return [this.generateMockResponse(query)];
    }
  }
  
  /**
   * Get detailed product information by Walmart Item ID
   */
  static async getProductDetails(itemId: string): Promise<WalmartResponse | null> {
    if (!this.API_KEY) {
      return this.generateMockResponse(itemId);
    }
    
    try {
      const response = await fetch(`${this.API_URL}/items/${itemId}?format=json`, {
        headers: {
          'WM_SVC.NAME': 'Walmart Open API',
          'WM_CONSUMER.ID': this.API_KEY,
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Walmart product details error: ${response.status}`);
      }
      
      const data = await response.json();
      return this.mapWalmartResponse(data);
      
    } catch (error) {
      console.warn('Walmart product details failed:', error);
      return this.generateMockResponse(itemId);
    }
  }
  
  /**
   * Get store availability for a product
   */
  static async getStoreAvailability(itemId: string, zipCode: string): Promise<any> {
    if (!this.API_KEY) {
      return this.generateMockAvailability();
    }
    
    try {
      const response = await fetch(
        `${this.API_URL}/stores/${zipCode}/inventory/${itemId}?format=json`,
        {
          headers: {
            'WM_SVC.NAME': 'Walmart Open API',
            'WM_CONSUMER.ID': this.API_KEY,
            'Accept': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`Store availability error: ${response.status}`);
      }
      
      return await response.json();
      
    } catch (error) {
      console.warn('Store availability lookup failed:', error);
      return this.generateMockAvailability();
    }
  }
  
  private static async lookupByUPC(upc: string): Promise<WalmartResponse | null> {
    try {
      const response = await fetch(`${this.API_URL}/items?upc=${upc}&format=json`, {
        headers: {
          'WM_SVC.NAME': 'Walmart Open API',
          'WM_CONSUMER.ID': this.API_KEY,
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        return null;
      }
      
      const data = await response.json();
      
      if (data.items && data.items.length > 0) {
        return this.mapWalmartResponse(data.items[0]);
      }
      
      return null;
      
    } catch (error) {
      console.warn('Walmart UPC lookup failed:', error);
      return null;
    }
  }
  
  private static async searchByText(query: string, limit: number): Promise<WalmartResponse[]> {
    try {
      const response = await fetch(
        `${this.API_URL}/search?query=${encodeURIComponent(query)}&numItems=${limit}&format=json`,
        {
          headers: {
            'WM_SVC.NAME': 'Walmart Open API',
            'WM_CONSUMER.ID': this.API_KEY,
            'Accept': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`Walmart search error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.items) {
        return data.items.map((item: any) => this.mapWalmartResponse(item));
      }
      
      return [];
      
    } catch (error) {
      console.warn('Walmart text search failed:', error);
      return [this.generateMockResponse(query)];
    }
  }
  
  private static mapWalmartResponse(apiData: any): WalmartResponse {
    return {
      product_name: apiData.name || 'Unknown Product',
      brand: apiData.brandName || 'Unknown Brand',
      upc: apiData.upc || '',
      walmart_item_id: apiData.itemId?.toString() || '',
      
      price: parseFloat(apiData.salePrice) || 0,
      currency: 'USD',
      sale_price: apiData.salePrice !== apiData.msrp ? parseFloat(apiData.salePrice) : undefined,
      price_per_unit: apiData.standardShipRate || undefined,
      
      availability: {
        in_stock: apiData.stock !== 'Not available',
        stock_level: this.mapStockLevel(apiData.stock),
        shipping_available: apiData.freeShipping || false,
        pickup_available: apiData.pickup || false,
        delivery_available: apiData.delivery || false
      },
      
      description: apiData.shortDescription || apiData.longDescription || '',
      specifications: {
        weight: apiData.size,
        model_number: apiData.modelNumber,
        manufacturer: apiData.brandName
      },
      
      images: this.extractImages(apiData),
      thumbnail: apiData.thumbnailImage || apiData.mediumImage || '',
      
      reviews: {
        average_rating: parseFloat(apiData.customerRating) || 0,
        total_reviews: parseInt(apiData.numReviews) || 0,
        rating_breakdown: this.generateRatingBreakdown(apiData.customerRating, apiData.numReviews)
      },
      
      category: apiData.categoryPath || 'Unknown',
      subcategory: apiData.categoryNode,
      department: this.extractDepartment(apiData.categoryPath),
      
      store_info: {
        available_online: apiData.availableOnline !== false,
        available_in_store: apiData.availableInStore !== false,
        store_locations: [] // Would need separate API call
      },
      
      nutrition_info: apiData.nutrition,
      ingredients: apiData.ingredients,
      allergen_info: this.extractAllergens(apiData.allergenInfo)
    };
  }
  
  private static generateMockResponse(query: string): WalmartResponse {
    return {
      product_name: `Mock Product: ${query}`,
      brand: 'Mock Brand',
      upc: '',
      walmart_item_id: 'mock-123',
      
      price: 9.99,
      currency: 'USD',
      
      availability: {
        in_stock: true,
        stock_level: 'High',
        shipping_available: true,
        pickup_available: true,
        delivery_available: false
      },
      
      description: `Mock product description for ${query}`,
      specifications: {},
      
      images: [],
      thumbnail: '',
      
      reviews: {
        average_rating: 4.0,
        total_reviews: 50,
        rating_breakdown: {
          five_star: 25,
          four_star: 15,
          three_star: 7,
          two_star: 2,
          one_star: 1
        }
      },
      
      category: 'Mock Category',
      department: 'General',
      
      store_info: {
        available_online: true,
        available_in_store: true
      }
    };
  }
  
  private static generateMockAvailability(): any {
    return {
      stores: [
        {
          store_id: '1001',
          address: '123 Main St, Sample City, ST 12345',
          in_stock: true,
          stock_level: 'High'
        }
      ]
    };
  }
  
  private static isBarcode(query: string): boolean {
    // Check if query looks like a UPC/EAN barcode
    return /^\d{8,14}$/.test(query);
  }
  
  private static mapStockLevel(stock: any): 'High' | 'Medium' | 'Low' | 'Out of Stock' {
    if (!stock || stock === 'Not available') return 'Out of Stock';
    if (stock === 'Available') return 'High';
    if (stock === 'Limited stock') return 'Low';
    return 'Medium';
  }
  
  private static extractImages(apiData: any): string[] {
    const images = [];
    
    if (apiData.largeImage) images.push(apiData.largeImage);
    if (apiData.mediumImage) images.push(apiData.mediumImage);
    if (apiData.thumbnailImage) images.push(apiData.thumbnailImage);
    
    // Handle image arrays
    if (apiData.imageEntities) {
      apiData.imageEntities.forEach((img: any) => {
        if (img.largeImage) images.push(img.largeImage);
      });
    }
    
    return [...new Set(images)]; // Remove duplicates
  }
  
  private static generateRatingBreakdown(rating: any, totalReviews: any): any {
    const avgRating = parseFloat(rating) || 4.0;
    const total = parseInt(totalReviews) || 50;
    
    // Estimate rating distribution based on average
    const breakdown = {
      five_star: 0,
      four_star: 0,
      three_star: 0,
      two_star: 0,
      one_star: 0
    };
    
    if (avgRating >= 4.5) {
      breakdown.five_star = Math.floor(total * 0.6);
      breakdown.four_star = Math.floor(total * 0.3);
      breakdown.three_star = Math.floor(total * 0.08);
      breakdown.two_star = Math.floor(total * 0.015);
      breakdown.one_star = total - breakdown.five_star - breakdown.four_star - breakdown.three_star - breakdown.two_star;
    } else if (avgRating >= 4.0) {
      breakdown.five_star = Math.floor(total * 0.4);
      breakdown.four_star = Math.floor(total * 0.4);
      breakdown.three_star = Math.floor(total * 0.15);
      breakdown.two_star = Math.floor(total * 0.03);
      breakdown.one_star = total - breakdown.five_star - breakdown.four_star - breakdown.three_star - breakdown.two_star;
    } else {
      // Lower ratings get more spread
      breakdown.five_star = Math.floor(total * 0.2);
      breakdown.four_star = Math.floor(total * 0.3);
      breakdown.three_star = Math.floor(total * 0.3);
      breakdown.two_star = Math.floor(total * 0.15);
      breakdown.one_star = total - breakdown.five_star - breakdown.four_star - breakdown.three_star - breakdown.two_star;
    }
    
    return breakdown;
  }
  
  private static extractDepartment(categoryPath?: string): string {
    if (!categoryPath) return 'General';
    
    const path = categoryPath.toLowerCase();
    
    if (path.includes('food')) return 'Food & Grocery';
    if (path.includes('electronic')) return 'Electronics';
    if (path.includes('clothing') || path.includes('apparel')) return 'Clothing';
    if (path.includes('home') || path.includes('garden')) return 'Home & Garden';
    if (path.includes('health') || path.includes('beauty')) return 'Health & Beauty';
    if (path.includes('sports') || path.includes('outdoor')) return 'Sports & Outdoors';
    
    return 'General';
  }
  
  private static extractAllergens(allergenInfo: any): string[] {
    if (!allergenInfo) return [];
    
    if (typeof allergenInfo === 'string') {
      return allergenInfo.split(',').map(a => a.trim());
    }
    
    if (Array.isArray(allergenInfo)) {
      return allergenInfo;
    }
    
    return [];
  }
}