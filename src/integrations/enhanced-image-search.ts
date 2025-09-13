/**
 * Enhanced Image Search API Integration
 * 
 * Integrates multiple free image APIs for comprehensive product image search
 * Features: Fallback chain, intelligent source selection, image quality optimization
 */

export interface ImageSearchResult {
  url: string;
  thumbnail?: string;
  source: string;
  quality: 'high' | 'medium' | 'low';
  size: {
    width: number;
    height: number;
  };
  alt_text?: string;
  license?: string;
}

export interface ImageSearchOptions {
  query: string;
  limit?: number;
  orientation?: 'landscape' | 'portrait' | 'square';
  color?: string;
  size?: 'small' | 'medium' | 'large';
  safeSearch?: boolean;
}

export class EnhancedImageSearchAPI {
  // API Keys and URLs
  private static readonly UNSPLASH_ACCESS_KEY = (import.meta as any).env?.VITE_UNSPLASH_ACCESS_KEY || '';
  private static readonly PIXABAY_API_KEY = (import.meta as any).env?.VITE_PIXABAY_API_KEY || '';
  private static readonly PEXELS_API_KEY = (import.meta as any).env?.VITE_PEXELS_API_KEY || '';
  private static readonly FREEPIK_API_KEY = (import.meta as any).env?.VITE_FREEPIK_API_KEY || '';
  
  // API Endpoints
  private static readonly UNSPLASH_URL = 'https://api.unsplash.com';
  private static readonly PIXABAY_URL = 'https://pixabay.com/api';
  private static readonly PEXELS_URL = 'https://api.pexels.com/v1';
  private static readonly FREEPIK_URL = 'https://api.freepik.com/v1';
  private static readonly WIKIMEDIA_URL = 'https://commons.wikimedia.org/w/api.php';
  private static readonly FOODISH_URL = 'https://foodish-api.herokuapp.com/api';
  
  // Cache for image results
  private static imageCache = new Map<string, ImageSearchResult[]>();
  private static readonly CACHE_DURATION = 3600000; // 1 hour

  /**
   * Search for product images across multiple free APIs
   */
  static async searchProductImages(options: ImageSearchOptions): Promise<ImageSearchResult[]> {
    const cacheKey = JSON.stringify(options);
    
    // Check cache first
    if (this.imageCache.has(cacheKey)) {
      console.log('📸 Using cached image results');
      return this.imageCache.get(cacheKey)!;
    }

    console.log('🔍 Searching for images:', options);
    
    const results: ImageSearchResult[] = [];
    const limit = options.limit || 10;
    
    try {
      // Run multiple API searches in parallel
      const searchPromises = [
        this.searchUnsplash(options),
        this.searchPixabay(options),
        this.searchPexels(options),
        this.searchWikimedia(options),
        this.searchFoodishAPI(options),
        this.searchFreepik(options)
      ];
      
      const apiResults = await Promise.allSettled(searchPromises);
      
      // Combine results from all APIs
      apiResults.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value) {
          results.push(...result.value);
        } else {
          console.warn(`Image API ${index + 1} failed:`, result);
        }
      });
      
      // Sort by quality and diversify sources
      const finalResults = this.optimizeImageResults(results, limit);
      
      // Cache results
      this.imageCache.set(cacheKey, finalResults);
      setTimeout(() => this.imageCache.delete(cacheKey), this.CACHE_DURATION);
      
      console.log(`✅ Found ${finalResults.length} images from ${new Set(finalResults.map(r => r.source)).size} sources`);
      return finalResults;
      
    } catch (error) {
      console.error('❌ Image search failed:', error);
      return this.getFallbackImages(options.query);
    }
  }

  /**
   * Search Unsplash (Free tier: 50 requests/hour)
   */
  private static async searchUnsplash(options: ImageSearchOptions): Promise<ImageSearchResult[]> {
    if (!this.UNSPLASH_ACCESS_KEY) {
      return [];
    }
    
    try {
      const params = new URLSearchParams({
        query: options.query,
        per_page: Math.min(options.limit || 5, 10).toString(),
        orientation: options.orientation || 'landscape'
      });
      
      const response = await fetch(`${this.UNSPLASH_URL}/search/photos?${params}`, {
        headers: {
          'Authorization': `Client-ID ${this.UNSPLASH_ACCESS_KEY}`
        }
      });
      
      if (!response.ok) return [];
      
      const data = await response.json();
      return data.results?.map((photo: any) => ({
        url: photo.urls.regular,
        thumbnail: photo.urls.thumb,
        source: 'Unsplash',
        quality: 'high' as const,
        size: {
          width: photo.width,
          height: photo.height
        },
        alt_text: photo.alt_description || photo.description,
        license: 'Unsplash License'
      })) || [];
      
    } catch (error) {
      console.warn('Unsplash search failed:', error);
      return [];
    }
  }

  /**
   * Search Pixabay (Free tier: 20,000 requests/month)
   */
  private static async searchPixabay(options: ImageSearchOptions): Promise<ImageSearchResult[]> {
    if (!this.PIXABAY_API_KEY) {
      return [];
    }
    
    try {
      const params = new URLSearchParams({
        key: this.PIXABAY_API_KEY,
        q: options.query,
        image_type: 'photo',
        orientation: options.orientation || 'horizontal',
        category: 'food,nature,business',
        min_width: '640',
        min_height: '480',
        per_page: Math.min(options.limit || 5, 20).toString(),
        safesearch: options.safeSearch ? 'true' : 'false'
      });
      
      const response = await fetch(`${this.PIXABAY_URL}/?${params}`);
      if (!response.ok) return [];
      
      const data = await response.json();
      return data.hits?.map((hit: any) => ({
        url: hit.webformatURL,
        thumbnail: hit.previewURL,
        source: 'Pixabay',
        quality: 'high' as const,
        size: {
          width: hit.webformatWidth,
          height: hit.webformatHeight
        },
        alt_text: hit.tags,
        license: 'Pixabay License'
      })) || [];
      
    } catch (error) {
      console.warn('Pixabay search failed:', error);
      return [];
    }
  }

  /**
   * Search Pexels (Free tier: 200 requests/hour)
   */
  private static async searchPexels(options: ImageSearchOptions): Promise<ImageSearchResult[]> {
    if (!this.PEXELS_API_KEY) {
      return [];
    }
    
    try {
      const params = new URLSearchParams({
        query: options.query,
        per_page: Math.min(options.limit || 5, 15).toString(),
        orientation: options.orientation || 'landscape'
      });
      
      const response = await fetch(`${this.PEXELS_URL}/search?${params}`, {
        headers: {
          'Authorization': this.PEXELS_API_KEY
        }
      });
      
      if (!response.ok) return [];
      
      const data = await response.json();
      return data.photos?.map((photo: any) => ({
        url: photo.src.large,
        thumbnail: photo.src.small,
        source: 'Pexels',
        quality: 'high' as const,
        size: {
          width: photo.width,
          height: photo.height
        },
        alt_text: photo.alt,
        license: 'Pexels License'
      })) || [];
      
    } catch (error) {
      console.warn('Pexels search failed:', error);
      return [];
    }
  }

  /**
   * Search Wikimedia Commons (Free, no API key needed)
   */
  private static async searchWikimedia(options: ImageSearchOptions): Promise<ImageSearchResult[]> {
    try {
      const params = new URLSearchParams({
        action: 'query',
        format: 'json',
        list: 'search',
        srsearch: `${options.query} filetype:bitmap`,
        srnamespace: '6', // File namespace
        srlimit: Math.min(options.limit || 3, 10).toString(),
        origin: '*'
      });
      
      const response = await fetch(`${this.WIKIMEDIA_URL}?${params}`);
      if (!response.ok) return [];
      
      const data = await response.json();
      const results: ImageSearchResult[] = [];
      
      for (const item of data.query?.search || []) {
        try {
          const imageUrl = `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(item.title)}?width=800`;
          const thumbnailUrl = `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(item.title)}?width=300`;
          
          results.push({
            url: imageUrl,
            thumbnail: thumbnailUrl,
            source: 'Wikimedia',
            quality: 'medium' as const,
            size: { width: 800, height: 600 }, // Estimated
            alt_text: item.snippet,
            license: 'Creative Commons'
          });
        } catch (e) {
          continue;
        }
      }
      
      return results;
      
    } catch (error) {
      console.warn('Wikimedia search failed:', error);
      return [];
    }
  }

  /**
   * Search Foodish API (Free food images)
   */
  private static async searchFoodishAPI(options: ImageSearchOptions): Promise<ImageSearchResult[]> {
    // Only use for food-related queries
    if (!options.query.toLowerCase().match(/food|eat|drink|cook|kitchen|meal|snack|fruit|vegetable|organic|healthy/)) {
      return [];
    }
    
    try {
      const results: ImageSearchResult[] = [];
      const limit = Math.min(options.limit || 2, 5);
      
      for (let i = 0; i < limit; i++) {
        const response = await fetch(`${this.FOODISH_URL}/images/food`);
        if (!response.ok) break;
        
        const data = await response.json();
        if (data.image) {
          results.push({
            url: data.image,
            thumbnail: data.image,
            source: 'Foodish',
            quality: 'medium' as const,
            size: { width: 800, height: 600 },
            alt_text: 'Food image',
            license: 'Free Use'
          });
        }
        
        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      return results;
      
    } catch (error) {
      console.warn('Foodish API search failed:', error);
      return [];
    }
  }

  /**
   * Search Freepik (Free tier with attribution)
   */
  private static async searchFreepik(options: ImageSearchOptions): Promise<ImageSearchResult[]> {
    if (!this.FREEPIK_API_KEY) {
      return [];
    }
    
    try {
      const params = new URLSearchParams({
        query: options.query,
        limit: Math.min(options.limit || 3, 10).toString(),
        content_type: 'photo'
      });
      
      const response = await fetch(`${this.FREEPIK_URL}/resources?${params}`, {
        headers: {
          'X-Freepik-API-Key': this.FREEPIK_API_KEY
        }
      });
      
      if (!response.ok) return [];
      
      const data = await response.json();
      return data.data?.map((item: any) => ({
        url: item.image,
        thumbnail: item.thumbnail,
        source: 'Freepik',
        quality: 'high' as const,
        size: {
          width: item.width || 800,
          height: item.height || 600
        },
        alt_text: item.title,
        license: 'Freepik License'
      })) || [];
      
    } catch (error) {
      console.warn('Freepik search failed:', error);
      return [];
    }
  }

  /**
   * Optimize and diversify image results
   */
  private static optimizeImageResults(results: ImageSearchResult[], limit: number): ImageSearchResult[] {
    // Remove duplicates by URL
    const uniqueResults = results.filter((result, index, self) => 
      index === self.findIndex(r => r.url === result.url)
    );
    
    // Sort by quality (high > medium > low) and diversify sources
    const sortedResults = uniqueResults.sort((a, b) => {
      const qualityOrder = { high: 3, medium: 2, low: 1 };
      return qualityOrder[b.quality] - qualityOrder[a.quality];
    });
    
    // Ensure source diversity
    const diversifiedResults: ImageSearchResult[] = [];
    const sourceCount = new Map<string, number>();
    
    for (const result of sortedResults) {
      const currentCount = sourceCount.get(result.source) || 0;
      if (currentCount < Math.ceil(limit / 3) || diversifiedResults.length < limit) {
        diversifiedResults.push(result);
        sourceCount.set(result.source, currentCount + 1);
        
        if (diversifiedResults.length >= limit) break;
      }
    }
    
    return diversifiedResults;
  }

  /**
   * Generate fallback images when all APIs fail
   */
  private static getFallbackImages(query: string): ImageSearchResult[] {
    const fallbackUrls = [
      'https://via.placeholder.com/800x600/4CAF50/FFFFFF?text=Eco+Product',
      'https://via.placeholder.com/800x600/2196F3/FFFFFF?text=Sustainable',
      'https://via.placeholder.com/800x600/FF9800/FFFFFF?text=Green+Choice'
    ];
    
    return fallbackUrls.map((url, index) => ({
      url,
      thumbnail: url.replace('800x600', '300x225'),
      source: 'Fallback',
      quality: 'low' as const,
      size: { width: 800, height: 600 },
      alt_text: `${query} - Placeholder ${index + 1}`,
      license: 'Generated'
    }));
  }

  /**
   * Get product-specific images with intelligent categorization
   */
  static async getProductImages(productName: string, category?: string): Promise<ImageSearchResult[]> {
    const enhancedQuery = this.enhanceProductQuery(productName, category);
    
    return this.searchProductImages({
      query: enhancedQuery,
      limit: 10,
      orientation: 'square',
      safeSearch: true
    });
  }

  /**
   * Enhance product query for better image search results
   */
  private static enhanceProductQuery(productName: string, category?: string): string {
    const cleanName = productName.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    const keywords = [];
    
    // Add category-specific keywords
    if (category) {
      switch (category.toLowerCase()) {
        case 'food':
          keywords.push('organic', 'fresh', 'healthy');
          break;
        case 'beauty':
          keywords.push('natural', 'skincare', 'cosmetic');
          break;
        case 'clothing':
          keywords.push('sustainable', 'fashion', 'apparel');
          break;
        case 'electronics':
          keywords.push('device', 'technology', 'gadget');
          break;
        default:
          keywords.push('product', 'sustainable');
      }
    }
    
    return [cleanName, ...keywords].join(' ').substring(0, 100);
  }

  /**
   * Get image search statistics
   */
  static getSearchStats(): { cacheSize: number; supportedAPIs: string[] } {
    return {
      cacheSize: this.imageCache.size,
      supportedAPIs: [
        'Unsplash',
        'Pixabay', 
        'Pexels',
        'Wikimedia Commons',
        'Foodish API',
        'Freepik'
      ]
    };
  }
}