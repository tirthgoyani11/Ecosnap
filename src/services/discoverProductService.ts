import { GeminiProductAPI, ProductAnalysis } from '@/lib/gemini-product-api';

export interface EnhancedProduct {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  originalPrice?: number;
  ecoScore: number;
  rating: number;
  reviews: number;
  image: string;
  description: string;
  tags: string[];
  isNew?: boolean;
  isTrending?: boolean;
  sustainability: {
    packaging: number;
    materials: number;
    manufacturing: number;
    transport: number;
  };
  source: 'gemini' | 'mock' | 'api';
}

export class DiscoverProductService {
  private static readonly UNSPLASH_ACCESS_KEY = 'demo-key';
  
  /**
   * Fetch product image from Unsplash based on category and product name
   */
  static async fetchProductImage(category: string, productName: string): Promise<string> {
    try {
      const searchTerm = `eco-friendly ${category} ${productName}`.toLowerCase();
      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(searchTerm)}&per_page=1&orientation=squarish`,
        {
          headers: {
            Authorization: `Client-ID ${this.UNSPLASH_ACCESS_KEY}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.results && data.results.length > 0) {
          return data.results[0].urls.small;
        }
      }
    } catch (error) {
      console.error('Failed to fetch Unsplash image:', error);
    }

    // Fallback: return a category-based placeholder URL
    return this.getCategoryPlaceholderImage(category);
  }

  /**
   * Get placeholder image based on category
   */
  private static getCategoryPlaceholderImage(category: string): string {
    const categoryImages: { [key: string]: string } = {
      'Drinkware': 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&h=400&fit=crop',
      'Clothing': 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop',
      'Electronics': 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400&h=400&fit=crop',
      'Kitchen': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop',
      'Fitness': 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=400&h=400&fit=crop',
      'Default': 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=400&h=400&fit=crop'
    };

    return categoryImages[category] || categoryImages['Default'];
  }

  /**
   * Generate eco-friendly products using Gemini AI
   */
  static async generateEcoProducts(categories: string[], count: number = 20): Promise<EnhancedProduct[]> {
    const products: EnhancedProduct[] = [];
    
    try {
      // Create a prompt for Gemini to generate eco-friendly products
      const prompt = `Generate ${count} eco-friendly product ideas across these categories: ${categories.join(', ')}. 
      For each product, provide:
      - Product name
      - Brand name (make it eco-friendly sounding)
      - Category (from the provided list)
      - Description (1-2 sentences)
      - Price range ($10-$100)
      - Eco score (80-98)
      - Key eco-friendly features/tags
      - Sustainability breakdown (packaging, materials, manufacturing, transport percentages)
      
      Format as JSON array with objects containing: name, brand, category, description, price, ecoScore, tags, sustainability.`;

      // For demo purposes, we'll use mock data since we need a structured approach
      // In a real implementation, you'd call Gemini AI with the prompt above
      const mockGeminiProducts = await this.getMockGeminiProducts();
      
      // Enhance products with images
      for (const product of mockGeminiProducts) {
        // Ensure all required properties exist
        if (!product.name || !product.brand || !product.category || !product.price || 
            !product.ecoScore || !product.description || !product.tags || !product.sustainability) {
          continue; // Skip incomplete products
        }

        const image = await this.fetchProductImage(product.category, product.name);
        
        const enhancedProduct: EnhancedProduct = {
          id: `gemini_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: product.name,
          brand: product.brand,
          category: product.category,
          price: product.price,
          originalPrice: product.originalPrice,
          ecoScore: product.ecoScore,
          description: product.description,
          tags: product.tags,
          sustainability: product.sustainability,
          image,
          source: 'gemini' as const,
          rating: parseFloat((4.2 + Math.random() * 0.8).toFixed(1)),
          reviews: Math.floor(Math.random() * 2000) + 100,
          isNew: Math.random() > 0.7,
          isTrending: Math.random() > 0.6
        };

        products.push(enhancedProduct);
      }

    } catch (error) {
      console.error('Failed to generate products with Gemini:', error);
    }

    return products;
  }

  /**
   * Mock Gemini-generated products (structured data)
   * In real implementation, this would be generated by Gemini AI
   */
  private static async getMockGeminiProducts(): Promise<Partial<EnhancedProduct>[]> {
    return [
      {
        name: 'BioCycle Water Purifier',
        brand: 'AquaGreen',
        category: 'Electronics',
        price: 89.99,
        originalPrice: 119.99,
        ecoScore: 94,
        description: 'Solar-powered water purification system using sustainable materials and zero-waste design.',
        tags: ['Solar Powered', 'Zero Waste', 'Sustainable'],
        sustainability: {
          packaging: 92,
          materials: 95,
          manufacturing: 89,
          transport: 86
        }
      },
      {
        name: 'Hemp Fiber Workout Set',
        brand: 'EcoFit',
        category: 'Clothing',
        price: 45.99,
        ecoScore: 91,
        description: 'Breathable hemp and organic cotton workout clothes with natural antimicrobial properties.',
        tags: ['Hemp Fiber', 'Organic', 'Antimicrobial'],
        sustainability: {
          packaging: 88,
          materials: 93,
          manufacturing: 90,
          transport: 82
        }
      },
      {
        name: 'Coconut Coir Dish Set',
        brand: 'TropicalHome',
        category: 'Kitchen',
        price: 34.99,
        ecoScore: 96,
        description: 'Biodegradable dishware made from coconut coir and natural plant-based resins.',
        tags: ['Biodegradable', 'Coconut Coir', 'Plant-Based'],
        sustainability: {
          packaging: 96,
          materials: 97,
          manufacturing: 94,
          transport: 88
        }
      },
      {
        name: 'Recycled Ocean Yoga Block',
        brand: 'WaveFlow',
        category: 'Fitness',
        price: 28.99,
        ecoScore: 93,
        description: 'Supportive yoga block crafted from recycled ocean plastic with cork accents.',
        tags: ['Ocean Plastic', 'Cork', 'Recycled'],
        sustainability: {
          packaging: 90,
          materials: 96,
          manufacturing: 91,
          transport: 85
        }
      },
      {
        name: 'Bamboo Smart Tumbler',
        brand: 'TechGreen',
        category: 'Drinkware',
        price: 52.99,
        ecoScore: 89,
        description: 'Temperature-smart bamboo tumbler with app connectivity and sustainable tech components.',
        tags: ['Smart Tech', 'Bamboo', 'App Connected'],
        sustainability: {
          packaging: 87,
          materials: 91,
          manufacturing: 88,
          transport: 83
        }
      }
    ];
  }

  /**
   * Search products using Gemini AI
   */
  static async searchProducts(query: string, category?: string): Promise<EnhancedProduct[]> {
    try {
      // In a real implementation, this would query Gemini AI for eco-friendly products
      // matching the search criteria
      const allProducts = await this.generateEcoProducts(['Electronics', 'Clothing', 'Kitchen', 'Fitness', 'Drinkware'], 10);
      
      return allProducts.filter(product => {
        const matchesQuery = !query || 
          product.name.toLowerCase().includes(query.toLowerCase()) ||
          product.brand.toLowerCase().includes(query.toLowerCase()) ||
          product.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()));
          
        const matchesCategory = !category || category === 'All' || product.category === category;
        
        return matchesQuery && matchesCategory;
      });
    } catch (error) {
      console.error('Failed to search products:', error);
      return [];
    }
  }

  /**
   * Get trending products (high eco scores and recent popularity)
   */
  static async getTrendingProducts(limit: number = 6): Promise<EnhancedProduct[]> {
    const products = await this.generateEcoProducts(['Electronics', 'Clothing', 'Kitchen', 'Fitness', 'Drinkware'], 20);
    
    return products
      .filter(product => product.ecoScore >= 90)
      .sort((a, b) => b.ecoScore - a.ecoScore)
      .slice(0, limit)
      .map(product => ({ ...product, isTrending: true }));
  }

  /**
   * Get new products (recently added eco-friendly items)
   */
  static async getNewProducts(limit: number = 6): Promise<EnhancedProduct[]> {
    const products = await this.generateEcoProducts(['Electronics', 'Clothing', 'Kitchen', 'Fitness', 'Drinkware'], 15);
    
    return products
      .slice(0, limit)
      .map(product => ({ ...product, isNew: true }));
  }

  /**
   * Get personalized recommendations based on user preferences
   */
  static async getRecommendations(userPreferences: {
    categories: string[];
    priceRange: { min: number; max: number };
    ecoScoreMin: number;
  }, limit: number = 5): Promise<EnhancedProduct[]> {
    const products = await this.generateEcoProducts(userPreferences.categories, 30);
    
    return products
      .filter(product => 
        product.price >= userPreferences.priceRange.min &&
        product.price <= userPreferences.priceRange.max &&
        product.ecoScore >= userPreferences.ecoScoreMin
      )
      .sort((a, b) => b.ecoScore - a.ecoScore)
      .slice(0, limit);
  }
}
