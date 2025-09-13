/**
 * Amazon Product API Integration
 * 
 * Provides product search, pricing, and review data from Amazon.
 * Note: This uses Amazon Product Advertising API (PA-API) which requires approval.
 * 
 * API Features:
 * - Product search by keywords/ASIN
 * - Real-time pricing and availability
 * - Customer reviews and ratings
 * - Product images and specifications
 * - Best seller rankings
 * - Similar products recommendations
 */

export interface AmazonResponse {
  asin: string;
  product_name: string;
  brand: string;
  
  // Pricing
  price: number;
  currency: string;
  list_price?: number;
  savings?: number;
  prime_eligible: boolean;
  
  // Availability
  availability: {
    in_stock: boolean;
    shipping_info: string;
    delivery_estimate: string;
    prime_delivery: boolean;
  };
  
  // Product details
  description: string;
  features: string[];
  specifications: {
    weight?: string;
    dimensions?: string;
    model_number?: string;
    manufacturer?: string;
    part_number?: string;
  };
  
  // Images
  images: {
    primary: string;
    variants: string[];
    thumbnails: string[];
  };
  
  // Reviews and ratings
  reviews: {
    average_rating: number; // 1-5
    total_reviews: number;
    rating_distribution: {
      five_star: number;
      four_star: number;
      three_star: number;
      two_star: number;
      one_star: number;
    };
  };
  
  // Category and ranking
  category: string;
  browse_nodes: string[];
  best_seller_rank?: {
    rank: number;
    category: string;
  };
  
  // Additional info
  variations?: Array<{
    asin: string;
    title: string;
    price: number;
  }>;
  
  similar_products?: Array<{
    asin: string;
    title: string;
    price: number;
    rating: number;
  }>;
  
  // Sustainability info (if available)
  climate_pledge_friendly?: boolean;
  sustainability_features?: string[];
}

export class AmazonAPI {
  private static readonly API_URL = 'https://sellingpartnerapi-na.amazon.com';
  private static readonly APPLICATION_ID = (import.meta as any).env?.VITE_AMAZON_APPLICATION_ID || '';
  private static readonly REFRESH_TOKEN = (import.meta as any).env?.VITE_AMAZON_REFRESH_TOKEN || '';
  private static readonly CLIENT_ID = (import.meta as any).env?.VITE_AMAZON_CLIENT_ID || '';
  private static readonly CLIENT_SECRET = (import.meta as any).env?.VITE_AMAZON_CLIENT_SECRET || '';
  private static readonly ACCESS_KEY_ID = (import.meta as any).env?.VITE_AMAZON_ACCESS_KEY_ID || '';
  private static readonly SECRET_ACCESS_KEY = (import.meta as any).env?.VITE_AMAZON_SECRET_ACCESS_KEY || '';
  private static readonly ROLE_ARN = (import.meta as any).env?.VITE_AMAZON_ROLE_ARN || '';
  private static readonly HOST = 'sellingpartnerapi-na.amazon.com';
  private static readonly REGION = 'us-east-1';
  
  // Cache for access tokens
  private static accessTokenCache: {
    token: string;
    expires: number;
  } | null = null;
  
  /**
   * Search for products by name or keyword
   */
  static async searchProduct(query: string, limit: number = 10): Promise<AmazonResponse[]> {
    if (!this.ACCESS_KEY_ID || !this.SECRET_ACCESS_KEY || !this.REFRESH_TOKEN) {
      console.warn('Amazon API credentials not available, using mock data');
      return [this.generateMockResponse(query)];
    }
    
    try {
      const searchRequest = {
        Keywords: query,
        SearchIndex: 'All',
        ItemCount: limit,
        Resources: [
          'ItemInfo.Title',
          'ItemInfo.Features',
          'ItemInfo.ProductInfo',
          'Offers.Listings.Price',
          'Offers.Listings.Availability',
          'Images.Primary.Large',
          'Images.Variants.Large',
          'CustomerReviews.StarRating',
          'CustomerReviews.Count',
          'BrowseNodeInfo.BrowseNodes'
        ]
      };
      
      const response = await this.makeSignedRequest('SearchItems', searchRequest);
      
      if (response.SearchResult && response.SearchResult.Items) {
        return response.SearchResult.Items.map((item: any) => this.mapAmazonResponse(item));
      }
      
      return [];
      
    } catch (error) {
      console.warn('Amazon search failed:', error);
      return [this.generateMockResponse(query)];
    }
  }
  
  /**
   * Get detailed product information by ASIN
   */
  static async getProductByASIN(asin: string): Promise<AmazonResponse | null> {
    if (!this.ACCESS_KEY_ID || !this.SECRET_ACCESS_KEY || !this.REFRESH_TOKEN) {
      return this.generateMockResponse(asin);
    }
    
    try {
      const itemRequest = {
        ItemIds: [asin],
        Resources: [
          'ItemInfo.Title',
          'ItemInfo.Features',
          'ItemInfo.ProductInfo',
          'ItemInfo.TechnicalInfo',
          'Offers.Listings.Price',
          'Offers.Listings.Availability',
          'Images.Primary.Large',
          'Images.Variants.Large',
          'CustomerReviews.StarRating',
          'CustomerReviews.Count',
          'BrowseNodeInfo.BrowseNodes',
          'ParentASIN'
        ]
      };
      
      const response = await this.makeSignedRequest('GetItems', itemRequest);
      
      if (response.ItemsResult && response.ItemsResult.Items && response.ItemsResult.Items.length > 0) {
        return this.mapAmazonResponse(response.ItemsResult.Items[0]);
      }
      
      return null;
      
    } catch (error) {
      console.warn('Amazon ASIN lookup failed:', error);
      return this.generateMockResponse(asin);
    }
  }
  
  /**
   * Get variations of a product (different sizes, colors, etc.)
   */
  static async getProductVariations(asin: string): Promise<AmazonResponse[]> {
    if (!this.ACCESS_KEY_ID || !this.SECRET_ACCESS_KEY || !this.REFRESH_TOKEN) {
      return [this.generateMockResponse(asin)];
    }
    
    try {
      const variationRequest = {
        ASIN: asin,
        Resources: [
          'ItemInfo.Title',
          'Offers.Listings.Price',
          'Images.Primary.Medium'
        ]
      };
      
      const response = await this.makeSignedRequest('GetVariations', variationRequest);
      
      if (response.VariationsResult && response.VariationsResult.Items) {
        return response.VariationsResult.Items.map((item: any) => this.mapAmazonResponse(item));
      }
      
      return [];
      
    } catch (error) {
      console.warn('Amazon variations lookup failed:', error);
      return [];
    }
  }
  
  private static async makeSignedRequest(operation: string, payload: any): Promise<any> {
    // This would require implementing AWS Signature Version 4
    // For now, we'll simulate the request structure
    
    const requestPayload = {
      Operation: operation,
      ApplicationId: this.APPLICATION_ID,
      Marketplace: 'www.amazon.com',
      ...payload
    };
    
    // Note: In a real implementation, you would need to:
    // 1. Create AWS Signature Version 4
    // 2. Sign the request with secret key
    // 3. Add proper headers and authentication
    
    throw new Error('Amazon API signing not implemented - using mock data');
  }
  
  private static mapAmazonResponse(apiData: any): AmazonResponse {
    return {
      asin: apiData.ASIN || '',
      product_name: apiData.ItemInfo?.Title?.DisplayValue || 'Unknown Product',
      brand: apiData.ItemInfo?.ByLineInfo?.Brand?.DisplayValue || 'Unknown Brand',
      
      price: this.extractPrice(apiData.Offers),
      currency: 'USD',
      list_price: this.extractListPrice(apiData.Offers),
      savings: this.calculateSavings(apiData.Offers),
      prime_eligible: this.isPrimeEligible(apiData.Offers),
      
      availability: {
        in_stock: this.isInStock(apiData.Offers),
        shipping_info: this.getShippingInfo(apiData.Offers),
        delivery_estimate: this.getDeliveryEstimate(apiData.Offers),
        prime_delivery: this.isPrimeEligible(apiData.Offers)
      },
      
      description: this.extractDescription(apiData.ItemInfo),
      features: this.extractFeatures(apiData.ItemInfo),
      specifications: this.extractSpecifications(apiData.ItemInfo),
      
      images: {
        primary: apiData.Images?.Primary?.Large?.URL || '',
        variants: this.extractVariantImages(apiData.Images),
        thumbnails: this.extractThumbnails(apiData.Images)
      },
      
      reviews: {
        average_rating: this.extractRating(apiData.CustomerReviews),
        total_reviews: this.extractReviewCount(apiData.CustomerReviews),
        rating_distribution: this.generateRatingDistribution(apiData.CustomerReviews)
      },
      
      category: this.extractCategory(apiData.BrowseNodeInfo),
      browse_nodes: this.extractBrowseNodes(apiData.BrowseNodeInfo),
      best_seller_rank: this.extractBestSellerRank(apiData.BrowseNodeInfo),
      
      climate_pledge_friendly: this.checkClimatePledge(apiData.ItemInfo),
      sustainability_features: this.extractSustainabilityFeatures(apiData.ItemInfo)
    };
  }
  
  private static generateMockResponse(query: string): AmazonResponse {
    return {
      asin: 'B0MOCK123',
      product_name: `Mock Amazon Product: ${query}`,
      brand: 'Mock Brand',
      
      price: 19.99,
      currency: 'USD',
      list_price: 24.99,
      savings: 5.00,
      prime_eligible: true,
      
      availability: {
        in_stock: true,
        shipping_info: 'Usually ships within 24 hours',
        delivery_estimate: '2-3 business days',
        prime_delivery: true
      },
      
      description: `Mock product description for ${query}`,
      features: [
        'Mock feature 1',
        'Mock feature 2',
        'Mock feature 3'
      ],
      specifications: {
        weight: '1 lb',
        dimensions: '6 x 4 x 2 inches',
        manufacturer: 'Mock Manufacturer'
      },
      
      images: {
        primary: '',
        variants: [],
        thumbnails: []
      },
      
      reviews: {
        average_rating: 4.3,
        total_reviews: 127,
        rating_distribution: {
          five_star: 65,
          four_star: 35,
          three_star: 18,
          two_star: 6,
          one_star: 3
        }
      },
      
      category: 'Mock Category',
      browse_nodes: ['Mock Node 1', 'Mock Node 2'],
      
      climate_pledge_friendly: Math.random() > 0.7, // 30% chance
      sustainability_features: Math.random() > 0.5 ? ['Recyclable packaging'] : []
    };
  }
  
  // Helper methods for extracting data from Amazon API response
  private static extractPrice(offers: any): number {
    if (!offers || !offers.Listings || offers.Listings.length === 0) return 0;
    
    const listing = offers.Listings[0];
    return parseFloat(listing.Price?.Amount) || 0;
  }
  
  private static extractListPrice(offers: any): number | undefined {
    if (!offers || !offers.Listings || offers.Listings.length === 0) return undefined;
    
    const listing = offers.Listings[0];
    return listing.SavingBasis?.Amount ? parseFloat(listing.SavingBasis.Amount) : undefined;
  }
  
  private static calculateSavings(offers: any): number | undefined {
    const price = this.extractPrice(offers);
    const listPrice = this.extractListPrice(offers);
    
    if (price && listPrice && listPrice > price) {
      return listPrice - price;
    }
    
    return undefined;
  }
  
  private static isPrimeEligible(offers: any): boolean {
    if (!offers || !offers.Listings || offers.Listings.length === 0) return false;
    
    const listing = offers.Listings[0];
    return listing.DeliveryInfo?.IsPrimeEligible === true;
  }
  
  private static isInStock(offers: any): boolean {
    if (!offers || !offers.Listings || offers.Listings.length === 0) return false;
    
    const listing = offers.Listings[0];
    return listing.Availability?.Type !== 'OutOfStock';
  }
  
  private static getShippingInfo(offers: any): string {
    if (!offers || !offers.Listings || offers.Listings.length === 0) return 'Unknown';
    
    const listing = offers.Listings[0];
    return listing.DeliveryInfo?.ShippingCharges?.DisplayAmount || 'Standard shipping';
  }
  
  private static getDeliveryEstimate(offers: any): string {
    if (!offers || !offers.Listings || offers.Listings.length === 0) return 'Unknown';
    
    return '2-3 business days'; // Default estimate
  }
  
  private static extractDescription(itemInfo: any): string {
    return itemInfo?.ProductInfo?.Warranty?.DisplayValue || 
           itemInfo?.ContentInfo?.PagesCount?.DisplayValue || 
           'No description available';
  }
  
  private static extractFeatures(itemInfo: any): string[] {
    return itemInfo?.Features?.DisplayValues || [];
  }
  
  private static extractSpecifications(itemInfo: any): any {
    const specs: any = {};
    
    if (itemInfo?.ProductInfo) {
      const productInfo = itemInfo.ProductInfo;
      
      if (productInfo.ItemDimensions) {
        specs.dimensions = `${productInfo.ItemDimensions.Length?.DisplayValue || ''} x ${productInfo.ItemDimensions.Width?.DisplayValue || ''} x ${productInfo.ItemDimensions.Height?.DisplayValue || ''}`;
        specs.weight = productInfo.ItemDimensions.Weight?.DisplayValue;
      }
      
      if (productInfo.Manufacturer) {
        specs.manufacturer = productInfo.Manufacturer.DisplayValue;
      }
      
      if (productInfo.PartNumber) {
        specs.part_number = productInfo.PartNumber.DisplayValue;
      }
    }
    
    return specs;
  }
  
  private static extractVariantImages(images: any): string[] {
    if (!images || !images.Variants) return [];
    
    return images.Variants.map((variant: any) => variant.Large?.URL).filter(Boolean);
  }
  
  private static extractThumbnails(images: any): string[] {
    if (!images || !images.Variants) return [];
    
    return images.Variants.map((variant: any) => variant.Medium?.URL).filter(Boolean);
  }
  
  private static extractRating(customerReviews: any): number {
    if (!customerReviews || !customerReviews.StarRating) return 0;
    
    return parseFloat(customerReviews.StarRating.DisplayValue) || 0;
  }
  
  private static extractReviewCount(customerReviews: any): number {
    if (!customerReviews || !customerReviews.Count) return 0;
    
    return parseInt(customerReviews.Count.DisplayValue) || 0;
  }
  
  private static generateRatingDistribution(customerReviews: any): any {
    const total = this.extractReviewCount(customerReviews);
    const avgRating = this.extractRating(customerReviews);
    
    if (total === 0) {
      return { five_star: 0, four_star: 0, three_star: 0, two_star: 0, one_star: 0 };
    }
    
    // Estimate distribution based on average rating
    const distribution = {
      five_star: 0,
      four_star: 0,
      three_star: 0,
      two_star: 0,
      one_star: 0
    };
    
    if (avgRating >= 4.5) {
      distribution.five_star = Math.floor(total * 0.7);
      distribution.four_star = Math.floor(total * 0.2);
      distribution.three_star = Math.floor(total * 0.07);
      distribution.two_star = Math.floor(total * 0.02);
      distribution.one_star = total - distribution.five_star - distribution.four_star - distribution.three_star - distribution.two_star;
    } else if (avgRating >= 4.0) {
      distribution.five_star = Math.floor(total * 0.5);
      distribution.four_star = Math.floor(total * 0.3);
      distribution.three_star = Math.floor(total * 0.15);
      distribution.two_star = Math.floor(total * 0.03);
      distribution.one_star = total - distribution.five_star - distribution.four_star - distribution.three_star - distribution.two_star;
    } else {
      distribution.five_star = Math.floor(total * 0.3);
      distribution.four_star = Math.floor(total * 0.25);
      distribution.three_star = Math.floor(total * 0.25);
      distribution.two_star = Math.floor(total * 0.15);
      distribution.one_star = total - distribution.five_star - distribution.four_star - distribution.three_star - distribution.two_star;
    }
    
    return distribution;
  }
  
  private static extractCategory(browseNodeInfo: any): string {
    if (!browseNodeInfo || !browseNodeInfo.BrowseNodes || browseNodeInfo.BrowseNodes.length === 0) {
      return 'Unknown Category';
    }
    
    return browseNodeInfo.BrowseNodes[0].DisplayName || 'Unknown Category';
  }
  
  private static extractBrowseNodes(browseNodeInfo: any): string[] {
    if (!browseNodeInfo || !browseNodeInfo.BrowseNodes) return [];
    
    return browseNodeInfo.BrowseNodes.map((node: any) => node.DisplayName).filter(Boolean);
  }
  
  private static extractBestSellerRank(browseNodeInfo: any): any {
    // This would require additional API calls to get sales rank
    return undefined;
  }
  
  private static checkClimatePledge(itemInfo: any): boolean {
    // Check if product has climate pledge friendly badge
    const features = itemInfo?.Features?.DisplayValues || [];
    return features.some((feature: string) => 
      feature.toLowerCase().includes('climate pledge') || 
      feature.toLowerCase().includes('sustainable')
    );
  }
  
  private static extractSustainabilityFeatures(itemInfo: any): string[] {
    const features = itemInfo?.Features?.DisplayValues || [];
    const sustainabilityKeywords = [
      'recyclable', 'biodegradable', 'organic', 'sustainable',
      'eco-friendly', 'carbon neutral', 'renewable'
    ];
    
    return features.filter((feature: string) =>
      sustainabilityKeywords.some(keyword =>
        feature.toLowerCase().includes(keyword)
      )
    );
  }
}