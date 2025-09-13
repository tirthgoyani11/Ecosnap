/**
 * Intelligent Image Search Service
 * Uses Unsplash API with smart search algorithms to find most relevant product images
 */

interface UnsplashPhoto {
  id: string;
  urls: {
    raw: string;
    full: string;
    regular: string;
    small: string;
    thumb: string;
  };
  alt_description: string | null;
  description: string | null;
  user: {
    name: string;
    username: string;
  };
  tags?: Array<{
    title: string;
  }>;
}

interface UnsplashSearchResponse {
  total: number;
  total_pages: number;
  results: UnsplashPhoto[];
}

export class IntelligentImageSearch {
  private static readonly UNSPLASH_ACCESS_KEY = (import.meta as any).env?.VITE_UNSPLASH_ACCESS_KEY;
  private static readonly UNSPLASH_API_URL = 'https://api.unsplash.com';
  private static readonly SEARCH_TIMEOUT = 3000; // 3 seconds max
  private static readonly MAX_CONCURRENT_SEARCHES = 2; // Limit concurrent API calls
  private static readonly MIN_ACCEPTABLE_SCORE = 0.7; // Early termination threshold
  
  // Cache for frequently searched products
  private static imageCache = new Map<string, { url: string; timestamp: number }>();
  private static readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
  
  /**
   * Check cache for previously searched images
   */
  private static getCachedImage(cacheKey: string): string | null {
    const cached = this.imageCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.url;
    }
    return null;
  }

  /**
   * Cache image result
   */
  private static setCachedImage(cacheKey: string, url: string): void {
    this.imageCache.set(cacheKey, { url, timestamp: Date.now() });
  }

  /**
   * Generate optimized search terms (reduced for speed)
   */
  private static generateSearchTerms(productName: string, brand?: string, category?: string): string[] {
    const terms: string[] = [];
    
    // Primary search term (most likely to succeed)
    if (brand && productName) {
      terms.push(`${brand} ${productName.split(' ')[0]}`);
    } else {
      terms.push(productName.split(' ')[0]); // Just first word for speed
    }
    
    // Category fallback (simple mapping)
    if (category) {
      terms.push(category.toLowerCase());
    }
    
    // Limit to max 2 terms for speed
    return terms.slice(0, this.MAX_CONCURRENT_SEARCHES);
  }
  
  /**
   * Check if product name represents a recognizable consumer product
   */
  private static isRecognizableProduct(productName: string): boolean {
    const recognizablePatterns = [
      /iphone|samsung|phone|smartphone/i,
      /coca cola|pepsi|sprite|fanta/i,
      /nike|adidas|puma|shoe|sneaker/i,
      /macbook|laptop|computer/i,
      /toyota|honda|bmw|car/i,
      /lays|chips|snack/i,
      /shampoo|toothpaste|soap/i,
      /milk|bread|cheese|yogurt/i,
    ];
    
    return recognizablePatterns.some(pattern => pattern.test(productName));
  }
  
  /**
   * Extract relevant keywords from product name
   */
  private static extractProductKeywords(productName: string): string[] {
    const keywords: string[] = [];
    
    // Technology products
    if (/phone|smartphone|mobile|iphone|android/i.test(productName)) {
      keywords.push('smartphone', 'mobile phone', 'technology');
    }
    
    // Food & beverage
    if (/food|drink|beverage|snack|meal/i.test(productName)) {
      keywords.push('food', 'beverage', 'nutrition');
    }
    
    // Beauty & personal care
    if (/beauty|cosmetic|shampoo|soap|cream|lotion/i.test(productName)) {
      keywords.push('beauty product', 'cosmetics', 'personal care');
    }
    
    // Clothing & fashion
    if (/shirt|pants|shoe|clothing|fashion|apparel/i.test(productName)) {
      keywords.push('clothing', 'fashion', 'apparel');
    }
    
    // Electronics
    if (/electronic|device|gadget|computer|laptop/i.test(productName)) {
      keywords.push('electronics', 'technology', 'device');
    }
    
    // Home & garden
    if (/home|house|garden|furniture|decor/i.test(productName)) {
      keywords.push('home product', 'household', 'domestic');
    }
    
    return keywords;
  }
  
  /**
   * Score image relevance based on multiple factors
   */
  private static scoreImageRelevance(
    photo: UnsplashPhoto, 
    searchTerm: string, 
    productName: string,
    brand?: string
  ): number {
    let score = 0;
    
    const description = (photo.description || '').toLowerCase();
    const altDescription = (photo.alt_description || '').toLowerCase();
    const allText = `${description} ${altDescription}`.toLowerCase();
    
    // Exact product name match (highest priority)
    if (allText.includes(productName.toLowerCase())) {
      score += 100;
    }
    
    // Brand match
    if (brand && allText.includes(brand.toLowerCase())) {
      score += 50;
    }
    
    // Search term relevance
    const searchWords = searchTerm.toLowerCase().split(' ');
    searchWords.forEach(word => {
      if (allText.includes(word)) {
        score += 20;
      }
    });
    
    // Tag relevance
    if (photo.tags) {
      photo.tags.forEach(tag => {
        if (tag.title.toLowerCase().includes(searchTerm.toLowerCase())) {
          score += 15;
        }
      });
    }
    
    // Quality indicators (avoid generic stock photos)
    if (description && description.length > 20) {
      score += 10;
    }
    
    // Penalize overly generic terms
    const genericTerms = ['background', 'abstract', 'pattern', 'texture', 'wallpaper'];
    genericTerms.forEach(term => {
      if (allText.includes(term)) {
        score -= 20;
      }
    });
    
    return Math.max(0, score);
  }
  
  /**
   * Search for the most relevant product image (OPTIMIZED FOR SPEED)
   */
  static async findBestProductImage(
    productName: string, 
    brand?: string, 
    category?: string
  ): Promise<string> {
    if (!this.UNSPLASH_ACCESS_KEY) {
      console.warn('Unsplash API key not provided, using fallback image');
      return this.getFallbackImage(category);
    }

    // Check cache first
    const cacheKey = `${productName}-${brand || ''}-${category || ''}`;
    const cachedImage = this.getCachedImage(cacheKey);
    if (cachedImage) {
      console.log('🚀 Using cached image for:', productName);
      return cachedImage;
    }
    
    try {
      const searchTerms = this.generateSearchTerms(productName, brand, category);
      console.log('🔍 Fast searching images with terms:', searchTerms);
      
      // Use Promise.race with timeout for maximum speed
      const searchPromise = this.performFastParallelSearch(searchTerms, productName, brand);
      const timeoutPromise = new Promise<string>((_, reject) => 
        setTimeout(() => reject(new Error('Search timeout')), this.SEARCH_TIMEOUT)
      );
      
      const result = await Promise.race([searchPromise, timeoutPromise]);
      
      // Cache the result
      this.setCachedImage(cacheKey, result);
      
      return result;
    } catch (error) {
      console.warn('🔥 Fast image search failed, using fallback:', error);
      return this.getFallbackImage(category);
    }
  }

  /**
   * Perform fast parallel search across multiple terms
   */
  private static async performFastParallelSearch(
    searchTerms: string[], 
    productName: string, 
    brand?: string
  ): Promise<string> {
    // Create parallel search promises for maximum concurrency
    const searchPromises = searchTerms.slice(0, this.MAX_CONCURRENT_SEARCHES).map(term => 
      this.searchSingleTerm(term, productName, brand)
    );
    
    const results = await Promise.allSettled(searchPromises);
    
    let bestPhoto: UnsplashPhoto | null = null;
    let bestScore = 0;
    
    for (const result of results) {
      if (result.status === 'fulfilled' && result.value) {
        const { photo, score } = result.value;
        if (score > bestScore) {
          bestScore = score;
          bestPhoto = photo;
        }
        
        // Early termination for good enough results
        if (score >= this.MIN_ACCEPTABLE_SCORE * 100) {
          break;
        }
      }
    }
    
    if (bestPhoto && bestScore > 30) {
      console.log(`✅ Found relevant image (score: ${bestScore}):`, bestPhoto.urls.regular);
      return bestPhoto.urls.regular;
    }
    
    throw new Error('No relevant image found');
  }

  /**
   * Search single term with optimized performance
   */
  private static async searchSingleTerm(
    term: string, 
    productName: string, 
    brand?: string
  ): Promise<{ photo: UnsplashPhoto; score: number } | null> {
    try {
      const response = await fetch(
        `${this.UNSPLASH_API_URL}/search/photos?query=${encodeURIComponent(term)}&per_page=5&orientation=squarish`,
        {
          headers: {
            'Authorization': `Client-ID ${this.UNSPLASH_ACCESS_KEY}`,
          },
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data: UnsplashSearchResponse = await response.json();
      
      let bestPhoto: UnsplashPhoto | null = null;
      let bestScore = 0;
      
      // Score each photo for relevance (only check top 3 for speed)
      for (const photo of data.results.slice(0, 3)) {
        const score = this.scoreImageRelevance(photo, term, productName, brand);
        if (score > bestScore) {
          bestScore = score;
          bestPhoto = photo;
        }
      }
      
      return bestPhoto ? { photo: bestPhoto, score: bestScore } : null;
      
    } catch (error) {
      console.warn(`Fast search failed for term ${term}:`, error);
      return null;
    }
  }
  
  /**
   * Get category-appropriate fallback image
   */
  private static getFallbackImage(category?: string): string {
    const fallbackImages = {
      'Smartphone': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop&q=80',
      'Electronics': 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=400&fit=crop&q=80',
      'Food': 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=400&fit=crop&q=80',
      'Beverage': 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&h=400&fit=crop&q=80',
      'Beauty': 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop&q=80',
      'Clothing': 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop&q=80',
      'Home': 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop&q=80',
      'Default': 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400&h=400&fit=crop&q=80'
    };
    
    return fallbackImages[category as keyof typeof fallbackImages] || fallbackImages.Default;
  }
  
  /**
   * Get multiple relevant images for a product
   */
  static async getProductImageGallery(
    productName: string, 
    brand?: string, 
    category?: string,
    count: number = 3
  ): Promise<string[]> {
    if (!this.UNSPLASH_ACCESS_KEY) {
      return [this.getFallbackImage(category)];
    }
    
    try {
      const searchTerms = this.generateSearchTerms(productName, brand, category);
      const images: string[] = [];
      
      for (const term of searchTerms.slice(0, 2)) { // Use top 2 terms
        try {
          const response = await fetch(
            `${this.UNSPLASH_API_URL}/search/photos?query=${encodeURIComponent(term)}&per_page=${count}&orientation=squarish`,
            {
              headers: {
                'Authorization': `Client-ID ${this.UNSPLASH_ACCESS_KEY}`,
              },
            }
          );
          
          if (response.ok) {
            const data: UnsplashSearchResponse = await response.json();
            const termImages = data.results
              .map(photo => photo.urls.regular)
              .slice(0, Math.ceil(count / 2));
            images.push(...termImages);
          }
        } catch (error) {
          console.warn(`Error fetching gallery for term ${term}:`, error);
        }
      }
      
      // Remove duplicates and ensure we have enough images
      const uniqueImages = [...new Set(images)];
      while (uniqueImages.length < count) {
        uniqueImages.push(this.getFallbackImage(category));
      }
      
      return uniqueImages.slice(0, count);
      
    } catch (error) {
      console.error('Error getting product image gallery:', error);
      return [this.getFallbackImage(category)];
    }
  }
}