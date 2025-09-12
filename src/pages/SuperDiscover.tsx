import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Gemini } from "@/integrations/gemini";
import { 
  Search, 
  Filter,
  Star,
  Leaf,
  Zap,
  TrendingUp,
  ShoppingCart,
  Sparkles,
  Eye,
  Heart,
  Plus,
  Minus,
  X,
  Clock,
  Truck,
  Shield,
  Flame,
  RefreshCw,
  Grid,
  List,
  SortDesc,
  ThumbsUp,
  Package,
  Gift,
  Target,
  Globe,
  Users,
  BarChart3
} from "lucide-react";

// Enhanced Product Interface
interface EnhancedProduct {
  id: string;
  name: string;
  brand: string;
  eco_score: number;
  price: string;
  originalPrice?: string;
  discount?: number;
  rating: number;
  reviews: number;
  image_url: string;
  category: string;
  description: string;
  co2_saved: number;
  tags: string[];
  inStock: boolean;
  fastDelivery: boolean;
  freeShipping: boolean;
  verified: boolean;
  trending: boolean;
  newArrival: boolean;
  specifications?: Record<string, string>;
  sustainability?: {
    carbonNeutral: boolean;
    recycledMaterials: number;
    biodegradable: boolean;
    locallyMade: boolean;
  };
}

// Real-time Product Suggestions Interface
interface ProductSuggestion {
  id: string;
  reason: string;
  confidence: number;
  product: EnhancedProduct;
}

// Shopping Cart Item
interface CartItem extends EnhancedProduct {
  quantity: number;
}

// Unsplash API Service
class UnsplashService {
  private static ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;
  private static BASE_URL = 'https://api.unsplash.com';

  static async searchImages(query: string, count: number = 1): Promise<string[]> {
    if (!this.ACCESS_KEY) {
      console.warn('Unsplash API key not found, using placeholder images');
      return Array(count).fill('/placeholder.svg');
    }

    try {
      const response = await fetch(
        `${this.BASE_URL}/search/photos?query=${encodeURIComponent(query)}&per_page=${count}&orientation=portrait`,
        {
          headers: {
            'Authorization': `Client-ID ${this.ACCESS_KEY}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch from Unsplash');
      }

      const data = await response.json();
      return data.results.map((photo: any) => photo.urls.regular) || ['/placeholder.svg'];
    } catch (error) {
      console.error('Unsplash API error:', error);
      return Array(count).fill('/placeholder.svg');
    }
  }
}

// Real-time search with Gemini
class RealTimeSearch {
  static async searchProducts(query: string): Promise<EnhancedProduct[]> {
    if (!query.trim()) return [];

    const prompt = `Search for eco-friendly products related to "${query}". Find 6 real products from the market with authentic information.
    
    Return JSON format with realistic Indian market data:
    {
      "products": [
        {
          "name": "Actual Product Name",
          "brand": "Real Brand Name (prefer Indian brands when applicable)",
          "category": "Product Category",
          "description": "Detailed product description with real features",
          "eco_score": 85,
          "price_inr": 1299,
          "original_price_inr": 1899,
          "rating": 4.3,
          "reviews": 847,
          "co2_saved": 2.1,
          "tags": ["Sustainable", "Organic", "etc"],
          "specifications": {
            "Material": "Bamboo",
            "Weight": "200g",
            "Dimensions": "15x8cm"
          },
          "sustainability": {
            "carbonNeutral": true,
            "recycledMaterials": 65,
            "biodegradable": true,
            "locallyMade": false
          },
          "search_terms": "product search keywords for image"
        }
      ]
    }
    
    IMPORTANT:
    - Find REAL products that exist in the market
    - Use authentic brand names and realistic specifications
    - Include proper Indian pricing (₹500 - ₹50,000 range)
    - Focus on sustainable/eco-friendly alternatives when possible
    - Provide search terms for finding relevant product images
    - Make eco_scores realistic (70-95 range)
    - Include both Indian and international brands appropriately`;

    try {
      const geminiResponse = await Gemini.generateText(prompt);
      
      if (!geminiResponse) {
        throw new Error('No response from Gemini');
      }

      // Extract JSON from response
      const jsonMatch = geminiResponse.match(/```json\n([\s\S]*?)\n```/) || 
                      geminiResponse.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const data = JSON.parse(jsonMatch[0].replace(/```json\n?|\n?```/g, ''));
      const products: EnhancedProduct[] = [];

      for (const productData of data.products || []) {
        // Get real image from Unsplash using search terms
        const searchTerms = productData.search_terms || 
                          `${productData.name} ${productData.category} sustainable eco product`;
        const images = await UnsplashService.searchImages(searchTerms, 1);

        const product: EnhancedProduct = {
          id: `search-${Date.now()}-${Math.random()}`,
          name: productData.name,
          brand: productData.brand,
          eco_score: productData.eco_score || 85,
          price: `₹${productData.price_inr?.toLocaleString('en-IN') || '1,299'}`,
          originalPrice: productData.original_price_inr 
            ? `₹${productData.original_price_inr.toLocaleString('en-IN')}` 
            : undefined,
          discount: productData.original_price_inr 
            ? Math.round(((productData.original_price_inr - productData.price_inr) / productData.original_price_inr) * 100)
            : undefined,
          rating: productData.rating || 4.5,
          reviews: productData.reviews || Math.floor(Math.random() * 3000) + 200,
          image_url: images[0],
          category: productData.category,
          description: productData.description,
          co2_saved: productData.co2_saved || Math.round(Math.random() * 4 + 1),
          tags: productData.tags || ['Sustainable', 'Eco-friendly'],
          inStock: true,
          fastDelivery: Math.random() > 0.4,
          freeShipping: Math.random() > 0.3,
          verified: true,
          trending: Math.random() > 0.6,
          newArrival: Math.random() > 0.7,
          specifications: productData.specifications,
          sustainability: productData.sustainability || {
            carbonNeutral: true,
            recycledMaterials: 70,
            biodegradable: true,
            locallyMade: Math.random() > 0.5
          }
        };

        products.push(product);
      }

      return products;
    } catch (error) {
      console.error('Real-time search error:', error);
      return [];
    }
  }
}
// Product Generator using Gemini API
class ProductGenerator {
  static async generateProducts(categories: string[]): Promise<EnhancedProduct[]> {
    const products: EnhancedProduct[] = [];
    
    for (const category of categories) {
      try {
        const prompt = `Generate 2 realistic eco-friendly products for the category "${category}". 
        Return JSON format with the following structure:
        {
          "products": [
            {
              "name": "Product Name",
              "brand": "Brand Name",
              "category": "${category}",
              "description": "Detailed description",
              "eco_score": 85,
              "price_inr": 2499,
              "original_price_inr": 3199,
              "rating": 4.5,
              "reviews": 1234,
              "co2_saved": 2.5,
              "tags": ["Sustainable", "Organic"],
              "specifications": {
                "Material": "Bamboo Fiber",
                "Weight": "250g"
              },
              "sustainability": {
                "carbonNeutral": true,
                "recycledMaterials": 75,
                "biodegradable": true,
                "locallyMade": true
              }
            }
          ]
        }
        Make prices realistic for Indian market. Include Indian brands where appropriate.`;

        const geminiResponse = await Gemini.generateText(prompt);
        
        if (geminiResponse) {
          const jsonMatch = geminiResponse.match(/```json\n([\s\S]*?)\n```/) || 
                          geminiResponse.match(/\{[\s\S]*\}/);
          
          if (jsonMatch) {
            const data = JSON.parse(jsonMatch[0].replace(/```json\n?|\n?```/g, ''));
            
            for (const productData of data.products || []) {
              // Get real image from Unsplash
              const images = await UnsplashService.searchImages(
                `${productData.name} ${category} sustainable eco-friendly product`,
                1
              );

              const product: EnhancedProduct = {
                id: `${category.toLowerCase()}-${Date.now()}-${Math.random()}`,
                name: productData.name,
                brand: productData.brand,
                eco_score: productData.eco_score || 85,
                price: `₹${productData.price_inr?.toLocaleString('en-IN') || '2,499'}`,
                originalPrice: productData.original_price_inr 
                  ? `₹${productData.original_price_inr.toLocaleString('en-IN')}` 
                  : undefined,
                discount: productData.original_price_inr 
                  ? Math.round(((productData.original_price_inr - productData.price_inr) / productData.original_price_inr) * 100)
                  : undefined,
                rating: productData.rating || 4.5,
                reviews: productData.reviews || Math.floor(Math.random() * 5000) + 100,
                image_url: images[0],
                category: productData.category || category,
                description: productData.description,
                co2_saved: productData.co2_saved || Math.round(Math.random() * 5 + 1),
                tags: productData.tags || ['Sustainable', 'Eco-friendly'],
                inStock: true,
                fastDelivery: Math.random() > 0.3,
                freeShipping: Math.random() > 0.4,
                verified: true,
                trending: Math.random() > 0.7,
                newArrival: Math.random() > 0.8,
                specifications: productData.specifications,
                sustainability: productData.sustainability || {
                  carbonNeutral: true,
                  recycledMaterials: 75,
                  biodegradable: true,
                  locallyMade: true
                }
              };

              products.push(product);
            }
          }
        }
      } catch (error) {
        console.error(`Failed to generate products for ${category}:`, error);
      }
    }

    return products;
  }
}

// Price Comparison Service
class PriceComparisonService {
  static async comparePrices(productName: string, brand: string): Promise<any[]> {
    try {
      const comparisonPrompt = `You are a price comparison expert for Indian e-commerce. Find current prices for "${productName}" by ${brand} across major Indian platforms.

Search these platforms for realistic current prices:
- Amazon India (competitive pricing, frequent discounts)
- Flipkart (similar to Amazon, good deals)
- Myntra (fashion/lifestyle focus)
- Nykaa (beauty/personal care)
- Croma (electronics retail)
- Reliance Digital (electronics)
- Paytm Mall (general marketplace)
- Snapdeal (budget-friendly options)

For each available platform, provide:
{
  "comparisons": [
    {
      "platform": "Amazon India",
      "price": 15999,
      "originalPrice": 18999,
      "discount": 16,
      "delivery": "Free",
      "deliveryTime": "Tomorrow",
      "rating": 4.3,
      "inStock": true,
      "seller": "Fulfilled by Amazon",
      "offers": "Bank Offer: 10% off",
      "bestDeal": false
    }
  ]
}

Make prices realistic based on each platform's strategy. Include 4-6 platforms where product would actually be available.
Return ONLY valid JSON, no explanations.`;

      const response = await Gemini.generateText(comparisonPrompt);
      
      if (!response) {
        throw new Error('No response from Gemini');
      }

      const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/) || 
                      response.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const data = JSON.parse(jsonMatch[0].replace(/```json\n?|\n?```/g, ''));
      let comparisons = data.comparisons || [];
      
      // Sort by price (lowest first) and mark best deal
      comparisons.sort((a: any, b: any) => a.price - b.price);
      if (comparisons.length > 0) {
        comparisons[0].bestDeal = true;
      }
      
      // Format prices
      comparisons = comparisons.map((comp: any) => ({
        ...comp,
        price: `₹${comp.price.toLocaleString('en-IN')}`,
        originalPrice: comp.originalPrice ? `₹${comp.originalPrice.toLocaleString('en-IN')}` : null,
        discount: comp.discount ? `${comp.discount}% OFF` : null
      }));
      
      return comparisons;
      
    } catch (error) {
      console.error('Price comparison error:', error);
      return PriceComparisonService.generateFallbackComparison(productName, brand);
    }
  }

  static generateFallbackComparison(productName: string, brand: string): any[] {
    const platforms = [
      { name: 'Amazon India', discount: 15, delivery: 'Free', deliveryTime: 'Tomorrow' },
      { name: 'Flipkart', discount: 12, delivery: 'Free', deliveryTime: '2 Days' },
      { name: 'Croma', discount: 8, delivery: '₹40', deliveryTime: '3 Days' },
      { name: 'Reliance Digital', discount: 10, delivery: 'Free', deliveryTime: '2 Days' },
      { name: 'Paytm Mall', discount: 18, delivery: 'Free', deliveryTime: '4 Days' }
    ];
    
    const basePrice = Math.floor(Math.random() * 15000) + 5000;
    
    return platforms.map((platform, index) => {
      const discountedPrice = Math.floor(basePrice * (1 - platform.discount / 100));
      return {
        platform: platform.name,
        price: `₹${discountedPrice.toLocaleString('en-IN')}`,
        originalPrice: `₹${basePrice.toLocaleString('en-IN')}`,
        discount: `${platform.discount}% OFF`,
        delivery: platform.delivery,
        deliveryTime: platform.deliveryTime,
        rating: (Math.random() * 1.5 + 3.5).toFixed(1),
        inStock: Math.random() > 0.1,
        seller: index < 2 ? 'Fulfilled by Platform' : 'Authorized Seller',
        offers: index === 0 ? 'Bank Offer: 10% off' : index === 1 ? 'Cashback: ₹200' : null,
        bestDeal: index === 0
      };
    }).sort((a, b) => {
      const priceA = parseInt(a.price.replace('₹', '').replace(/,/g, ''));
      const priceB = parseInt(b.price.replace('₹', '').replace(/,/g, ''));
      return priceA - priceB;
    });
  }
}

export default function SuperDiscoverPage() {
  const { toast } = useToast();
  
  // State Management
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('trending');
  const [showFilters, setShowFilters] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<EnhancedProduct | null>(null);
  const [priceComparisons, setPriceComparisons] = useState<any[]>([]);
  const [showPriceComparison, setShowPriceComparison] = useState(false);
  const [loadingComparison, setLoadingComparison] = useState(false);
  const [realtimeSuggestions, setRealtimeSuggestions] = useState<ProductSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [featuredProducts, setFeaturedProducts] = useState<EnhancedProduct[]>([]);
  const [isGeneratingProducts, setIsGeneratingProducts] = useState(true);
  const [searchResults, setSearchResults] = useState<EnhancedProduct[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Filters State
  const [priceRange, setPriceRange] = useState([0, 50000]);
  const [ecoScoreMin, setEcoScoreMin] = useState(70);
  const [showInStockOnly, setShowInStockOnly] = useState(true);
  const [showFreeShippingOnly, setShowFreeShippingOnly] = useState(false);

  // Price comparison functionality
  const handlePriceComparison = async (product: EnhancedProduct) => {
    setSelectedProduct(product);
    setLoadingComparison(true);
    setShowPriceComparison(true);
    
    try {
      const comparisons = await PriceComparisonService.comparePrices(product.name, product.brand);
      setPriceComparisons(comparisons);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load price comparisons. Please try again.",
        variant: "destructive",
      });
      console.error('Price comparison error:', error);
    } finally {
      setLoadingComparison(false);
    }
  };

  // Real-time search function
  const performRealTimeSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      const results = await RealTimeSearch.searchProducts(query);
      setSearchResults(results);
      toast({
        title: "Search Complete! 🔍",
        description: `Found ${results.length} products for "${query}"`,
      });
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Search Error",
        description: "Failed to search products. Please try again.",
      });
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [toast]);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim().length > 2) {
        performRealTimeSearch(searchQuery);
      } else {
        setSearchResults([]);
        setIsSearching(false);
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, performRealTimeSearch]);

  // Generate products on component mount
  useEffect(() => {
    const generateInitialProducts = async () => {
      setIsGeneratingProducts(true);
      try {
        const categories = ['Drinkware', 'Clothing', 'Electronics', 'Kitchen', 'Fitness', 'Personal Care'];
        const products = await ProductGenerator.generateProducts(categories);
        setFeaturedProducts(products);
      } catch (error) {
        console.error('Failed to generate products:', error);
        // Fallback to a few basic products if Gemini fails
        setFeaturedProducts([
          {
            id: '1',
            name: 'Bamboo Water Bottle',
            brand: 'EcoVessel',
            eco_score: 92,
            price: '₹1,299',
            originalPrice: '₹1,899',
            discount: 32,
            rating: 4.7,
            reviews: 1247,
            image_url: '/placeholder.svg',
            category: 'Drinkware',
            description: 'Sustainable bamboo water bottle with steel interior',
            co2_saved: 2.5,
            tags: ['Sustainable', 'BPA Free'],
            inStock: true,
            fastDelivery: true,
            freeShipping: true,
            verified: true,
            trending: true,
            newArrival: false,
            sustainability: {
              carbonNeutral: true,
              recycledMaterials: 75,
              biodegradable: true,
              locallyMade: true
            }
          }
        ]);
      } finally {
        setIsGeneratingProducts(false);
      }
    };

    generateInitialProducts();
  }, []);

  // Real-time updates simulation
  useEffect(() => {
    const interval = setInterval(() => {
      if (featuredProducts.length > 0) {
        // Simulate real-time product suggestions
        const suggestions: ProductSuggestion[] = [
          {
            id: 'suggestion-1',
            reason: 'Based on your eco-score preferences',
            confidence: 94,
            product: featuredProducts[Math.floor(Math.random() * featuredProducts.length)]
          },
          {
            id: 'suggestion-2',
            reason: 'Popular in your area',
            confidence: 87,
            product: featuredProducts[Math.floor(Math.random() * featuredProducts.length)]
          },
          {
            id: 'suggestion-3',
            reason: 'Similar to your recent scans',
            confidence: 92,
            product: featuredProducts[Math.floor(Math.random() * featuredProducts.length)]
          }
        ];
        setRealtimeSuggestions(suggestions);
      }
    }, 8000); // Update every 8 seconds

    return () => clearInterval(interval);
  }, [featuredProducts]);

  // Filter and search products
  const filteredProducts = useMemo(() => {
    // Use search results if there's a search query, otherwise use featured products
    let filtered = searchQuery.trim().length > 2 ? searchResults : featuredProducts;

    // Category filter (only apply to featured products, not search results)
    if (selectedCategory !== 'All' && searchQuery.trim().length <= 2) {
      if (selectedCategory === 'Trending') {
        filtered = filtered.filter(p => p.trending);
      } else if (selectedCategory === 'New') {
        filtered = filtered.filter(p => p.newArrival);
      } else if (selectedCategory === 'Sustainable') {
        filtered = filtered.filter(p => p.eco_score >= 90);
      } else {
        filtered = filtered.filter(p => p.category === selectedCategory);
      }
    }

    // Price range filter
    filtered = filtered.filter(product => {
      const price = parseFloat(product.price.replace('₹', '').replace(/,/g, ''));
      return price >= priceRange[0] && price <= priceRange[1];
    });

    // Eco score filter
    filtered = filtered.filter(product => product.eco_score >= ecoScoreMin);

    // Stock filter
    if (showInStockOnly) {
      filtered = filtered.filter(product => product.inStock);
    }

    // Free shipping filter
    if (showFreeShippingOnly) {
      filtered = filtered.filter(product => product.freeShipping);
    }

    // Sorting
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => {
          const priceA = parseFloat(a.price.replace('₹', '').replace(/,/g, ''));
          const priceB = parseFloat(b.price.replace('₹', '').replace(/,/g, ''));
          return priceA - priceB;
        });
        break;
      case 'price-high':
        filtered.sort((a, b) => {
          const priceA = parseFloat(a.price.replace('₹', '').replace(/,/g, ''));
          const priceB = parseFloat(b.price.replace('₹', '').replace(/,/g, ''));
          return priceB - priceA;
        });
        break;
      case 'eco-score':
        filtered.sort((a, b) => b.eco_score - a.eco_score);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'reviews':
        filtered.sort((a, b) => b.reviews - a.reviews);
        break;
      default: // trending
        filtered.sort((a, b) => (b.trending ? 1 : 0) - (a.trending ? 1 : 0));
    }

    return filtered;
  }, [searchQuery, searchResults, featuredProducts, selectedCategory, sortBy, priceRange, ecoScoreMin, showInStockOnly, showFreeShippingOnly]);

  // Cart functions
  const addToCart = useCallback((product: EnhancedProduct) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    toast({
      title: "Added to Cart! 🛒",
      description: `${product.name} has been added to your cart.`,
    });
  }, [toast]);

  const removeFromCart = useCallback((productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  }, []);

  const toggleWishlist = useCallback((productId: string) => {
    setWishlist(prev => {
      if (prev.includes(productId)) {
        toast({
          title: "Removed from Wishlist 💔",
          description: "Item removed from your wishlist.",
        });
        return prev.filter(id => id !== productId);
      }
      toast({
        title: "Added to Wishlist! ❤️",
        description: "Item saved to your wishlist.",
      });
      return [...prev, productId];
    });
  }, [toast]);

  const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalCartValue = cart.reduce((sum, item) => {
    const price = parseFloat(item.price.replace('₹', '').replace(/,/g, ''));
    return sum + (price * item.quantity);
  }, 0);

  const categories = ['All', 'Trending', 'New', 'Sustainable', 'Drinkware', 'Clothing', 'Electronics', 'Kitchen', 'Fitness', 'Personal Care'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-blue-950 dark:to-purple-950">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-pink-400/10 to-yellow-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        
        {/* Floating particles */}
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [-10, -50, -10],
              x: [-5, 5, -5],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-4 py-6">
        {/* Header with Search and Live Status */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 rounded-3xl p-6 shadow-2xl border border-white/20">
            {/* Title and Description */}
            <div>
              <motion.h1 
                className="text-4xl lg:text-5xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                🛒 Super Shopping
              </motion.h1>
              <motion.p 
                className="text-slate-500 dark:text-slate-400 text-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                Real-time eco-friendly products with AI-powered suggestions
              </motion.p>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search eco-friendly products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 bg-white/50 backdrop-blur-sm border-white/30 focus:border-blue-400 rounded-2xl"
                />
              </div>
            </div>

            {/* Cart Button */}
            <div className="flex items-center gap-4">
              <Sheet>
                <SheetTrigger asChild>
                  <Button className="relative bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white h-12 px-6 rounded-2xl">
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Cart
                    {totalCartItems > 0 && (
                      <Badge className="absolute -top-2 -right-2 bg-red-500 text-white h-5 w-5 p-0 text-xs flex items-center justify-center">
                        {totalCartItems}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-full max-w-md">
                  <SheetHeader>
                    <SheetTitle>Shopping Cart ({totalCartItems} items)</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6 space-y-4">
                    {cart.length > 0 ? (
                      <>
                        {cart.map((item) => (
                          <motion.div
                            key={item.id}
                            layout
                            className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl"
                          >
                            <img
                              src={item.image_url}
                              alt={item.name}
                              className="w-16 h-16 object-cover rounded-lg bg-gradient-to-br from-blue-100 to-purple-100"
                            />
                            <div className="flex-1">
                              <h4 className="font-semibold text-sm">{item.name}</h4>
                              <p className="text-slate-600 text-xs">{item.brand}</p>
                              <p className="font-bold text-blue-600">{item.price}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  if (item.quantity > 1) {
                                    setCart(prev => prev.map(cartItem => 
                                      cartItem.id === item.id 
                                        ? { ...cartItem, quantity: cartItem.quantity - 1 }
                                        : cartItem
                                    ));
                                  }
                                }}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-8 text-center">{item.quantity}</span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => addToCart(item)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => removeFromCart(item.id)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          </motion.div>
                        ))}
                        <Separator />
                        <div className="flex justify-between items-center font-bold">
                          <span>Total: ₹{totalCartValue.toLocaleString('en-IN')}</span>
                          <Button className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
                            Checkout
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-8 text-slate-500">
                        <ShoppingCart className="h-16 w-16 mx-auto mb-4 opacity-50" />
                        <p>Your cart is empty</p>
                        <p className="text-sm">Add some eco-friendly products!</p>
                      </div>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </motion.div>

        {/* Real-time Suggestions Bar */}
        <AnimatePresence>
          {realtimeSuggestions.length > 0 && (
            <motion.div
              className="mb-6"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="backdrop-blur-xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-200/30 shadow-xl">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      <Sparkles className="h-5 w-5 text-green-600" />
                    </motion.div>
                    <h3 className="font-semibold text-green-800 dark:text-green-400">
                      🤖 AI Real-time Suggestions
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {realtimeSuggestions.map((suggestion, index) => (
                      <motion.div
                        key={suggestion.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white/50 dark:bg-slate-800/50 p-3 rounded-xl cursor-pointer hover:bg-white/70 transition-colors"
                        onClick={() => setSelectedProduct(suggestion.product)}
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={suggestion.product.image_url}
                            alt={suggestion.product.name}
                            className="w-12 h-12 object-cover rounded-lg bg-gradient-to-br from-blue-100 to-purple-100"
                          />
                          <div className="flex-1">
                            <p className="font-medium text-sm">{suggestion.product.name}</p>
                            <p className="text-xs text-slate-600">{suggestion.reason}</p>
                            <div className="flex items-center gap-1 mt-1">
                              <Target className="h-3 w-3 text-blue-500" />
                              <span className="text-xs text-blue-600">{suggestion.confidence}% match</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Categories and Filters */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 shadow-xl border border-white/20">
            <CardContent className="p-6">
              {/* Search Results Header */}
        {searchQuery.trim().length > 2 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Search className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">
                    {isSearching ? 'Searching...' : `Search Results for "${searchQuery}"`}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {isSearching ? 'Finding products from across the web' : `Found ${filteredProducts.length} products`}
                  </p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSearchQuery('')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Categories */}
              <div className="flex flex-wrap gap-2 mb-4">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className={cn(
                      "rounded-full",
                      selectedCategory === category 
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0" 
                        : "backdrop-blur-sm bg-white/50 hover:bg-white/70 border-white/50"
                    )}
                  >
                    {category}
                  </Button>
                ))}
              </div>

              {/* Controls */}
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* View Mode Toggle */}
                  <div className="flex bg-white/50 dark:bg-slate-800/50 rounded-lg p-1">
                    <Button
                      size="sm"
                      variant={viewMode === 'grid' ? 'default' : 'ghost'}
                      onClick={() => setViewMode('grid')}
                    >
                      <Grid className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant={viewMode === 'list' ? 'default' : 'ghost'}
                      onClick={() => setViewMode('list')}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Sort Options */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-white/50 dark:bg-slate-800/50 border border-white/30 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="trending">🔥 Trending</option>
                    <option value="price-low">💰 Price: Low to High</option>
                    <option value="price-high">💎 Price: High to Low</option>
                    <option value="eco-score">🌱 Eco Score</option>
                    <option value="rating">⭐ Rating</option>
                    <option value="reviews">💬 Most Reviews</option>
                  </select>
                </div>

                {/* Results Count */}
                <div className="flex items-center gap-4">
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    {filteredProducts.length} products found
                  </div>
                  
                  {/* Regenerate Products Button */}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={async () => {
                      setIsGeneratingProducts(true);
                      try {
                        const categories = ['Drinkware', 'Clothing', 'Electronics', 'Kitchen', 'Fitness', 'Personal Care'];
                        const products = await ProductGenerator.generateProducts(categories);
                        setFeaturedProducts(products);
                        toast({
                          title: "Products Refreshed! ✨",
                          description: "New AI-generated products with real images loaded.",
                        });
                      } catch (error) {
                        toast({
                          title: "Failed to generate products",
                          description: "Please try again later.",
                        });
                      } finally {
                        setIsGeneratingProducts(false);
                      }
                    }}
                    disabled={isGeneratingProducts}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 hover:from-purple-600 hover:to-pink-600"
                  >
                    <RefreshCw className={cn("h-3 w-3 mr-1", isGeneratingProducts && "animate-spin")} />
                    AI Refresh
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Products Grid/List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {isGeneratingProducts ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <LoadingSpinner />
              <div className="text-center">
                <p className="text-lg font-semibold">🤖 Loading products...</p>
                <p className="text-slate-600 dark:text-slate-400">
                  Getting the latest eco-friendly products for you
                </p>
              </div>
            </div>
          ) : isLoading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner />
              <span className="ml-3">Searching...</span>
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className={cn(
              "grid gap-6",
              viewMode === 'grid' 
                ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                : "grid-cols-1 max-w-4xl mx-auto"
            )}>
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -5 }}
                >
                  <Card className={cn(
                    "group relative overflow-hidden backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300",
                    viewMode === 'list' && "flex flex-row"
                  )}>
                    {/* Product Image */}
                    <div className={cn(
                      "relative overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100",
                      viewMode === 'grid' ? "aspect-square" : "w-48 flex-shrink-0"
                    )}>
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      
                      {/* Overlay Badges */}
                      <div className="absolute top-2 left-2 space-y-1">
                        {product.discount && (
                          <Badge className="bg-red-500 text-white">
                            -{product.discount}%
                          </Badge>
                        )}
                        {product.trending && (
                          <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                            <Flame className="h-3 w-3 mr-1" />
                            Hot
                          </Badge>
                        )}
                        {product.newArrival && (
                          <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                            New
                          </Badge>
                        )}
                      </div>

                      {/* Quick Actions */}
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 space-y-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleWishlist(product.id);
                          }}
                        >
                          <Heart className={cn(
                            "h-4 w-4",
                            wishlist.includes(product.id) ? "fill-red-500 text-red-500" : "text-slate-600"
                          )} />
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedProduct(product);
                          }}
                        >
                          <Eye className="h-4 w-4 text-slate-600" />
                        </Button>
                      </div>

                      {/* Eco Score */}
                      <div className="absolute bottom-2 left-2">
                        <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                          <Leaf className="h-3 w-3" />
                          {product.eco_score}
                        </div>
                      </div>
                    </div>

                    {/* Product Details */}
                    <CardContent className={cn("p-4", viewMode === 'list' && "flex-1")}>
                      <div className="space-y-3">
                        {/* Brand and Title */}
                        <div>
                          <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">{product.brand}</p>
                          <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                            {product.name}
                          </h3>
                        </div>

                        {/* Rating and Reviews */}
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-semibold text-sm">{product.rating}</span>
                          </div>
                          <span className="text-xs text-slate-500">({product.reviews.toLocaleString()} reviews)</span>
                        </div>

                        {/* Description */}
                        <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                          {product.description}
                        </p>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-1">
                          {product.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>

                        {/* Features */}
                        <div className="flex items-center gap-3 text-xs">
                          {product.freeShipping && (
                            <div className="flex items-center gap-1 text-green-600">
                              <Truck className="h-3 w-3" />
                              Free Shipping
                            </div>
                          )}
                          {product.fastDelivery && (
                            <div className="flex items-center gap-1 text-blue-600">
                              <Zap className="h-3 w-3" />
                              Fast Delivery
                            </div>
                          )}
                          {product.verified && (
                            <div className="flex items-center gap-1 text-purple-600">
                              <Shield className="h-3 w-3" />
                              Verified
                            </div>
                          )}
                        </div>

                        {/* Environmental Impact */}
                        <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded-lg">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-green-700 dark:text-green-400 font-medium">
                              🌍 CO₂ Saved: {product.co2_saved}kg
                            </span>
                            {product.sustainability?.carbonNeutral && (
                              <Badge className="bg-green-100 text-green-800 text-xs">
                                Carbon Neutral
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Price and Actions */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-lg text-slate-900 dark:text-white">
                                  {product.price}
                                </span>
                                {product.originalPrice && (
                                  <span className="text-sm text-slate-500 line-through">
                                    {product.originalPrice}
                                  </span>
                                )}
                              </div>
                              {!product.inStock && (
                                <p className="text-xs text-red-500 font-medium">Out of Stock</p>
                              )}
                            </div>
                          </div>

                          <div className="flex gap-2 w-full">
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                addToCart(product);
                              }}
                              disabled={!product.inStock}
                              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white flex-1 h-10 text-sm"
                            >
                              <ShoppingCart className="h-4 w-4 mr-1" />
                              Add to Cart
                            </Button>
                            
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePriceComparison(product);
                              }}
                              variant="outline"
                              size="default"
                              className="border-green-300 text-green-600 hover:bg-green-50 hover:border-green-400 h-10 px-3 flex-shrink-0 w-auto min-w-[80px]"
                            >
                              <TrendingUp className="h-4 w-4 mr-1" />
                              Compare
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold mb-2">No products found</h3>
              <p className="text-slate-600 dark:text-slate-400">
                Try adjusting your search or filter criteria
              </p>
            </div>
          )}
        </motion.div>

        {/* Product Detail Modal */}
        <Dialog open={selectedProduct !== null} onOpenChange={() => setSelectedProduct(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            {selectedProduct && (
              <div className="space-y-6">
                <DialogHeader>
                  <DialogTitle className="text-2xl">{selectedProduct.name}</DialogTitle>
                  <p className="text-slate-600">{selectedProduct.brand}</p>
                </DialogHeader>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Product Image */}
                  <div className="aspect-square bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl overflow-hidden">
                    <img
                      src={selectedProduct.image_url}
                      alt={selectedProduct.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Product Details */}
                  <div className="space-y-4">
                    {/* Price and Rating */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-3xl font-bold">{selectedProduct.price}</span>
                        {selectedProduct.originalPrice && (
                          <span className="text-lg text-slate-500 line-through">
                            {selectedProduct.originalPrice}
                          </span>
                        )}
                        {selectedProduct.discount && (
                          <Badge className="bg-red-500 text-white">
                            -{selectedProduct.discount}%
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={cn(
                              "h-4 w-4",
                              i < Math.floor(selectedProduct.rating) 
                                ? "fill-yellow-400 text-yellow-400" 
                                : "text-slate-300"
                            )} />
                          ))}
                        </div>
                        <span className="font-semibold">{selectedProduct.rating}</span>
                        <span className="text-slate-500">({selectedProduct.reviews.toLocaleString()} reviews)</span>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-slate-600 dark:text-slate-400">
                      {selectedProduct.description}
                    </p>

                    {/* Specifications */}
                    {selectedProduct.specifications && (
                      <div className="space-y-2">
                        <h4 className="font-semibold">Specifications</h4>
                        <div className="space-y-1">
                          {Object.entries(selectedProduct.specifications).map(([key, value]) => (
                            <div key={key} className="flex justify-between text-sm">
                              <span className="text-slate-600">{key}:</span>
                              <span className="font-medium">{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Sustainability Info */}
                    {selectedProduct.sustainability && (
                      <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl space-y-2">
                        <h4 className="font-semibold text-green-800 dark:text-green-400">
                          🌱 Sustainability Features
                        </h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="flex items-center gap-2">
                            <div className={cn(
                              "w-2 h-2 rounded-full",
                              selectedProduct.sustainability.carbonNeutral ? "bg-green-500" : "bg-slate-300"
                            )} />
                            Carbon Neutral
                          </div>
                          <div className="flex items-center gap-2">
                            <div className={cn(
                              "w-2 h-2 rounded-full",
                              selectedProduct.sustainability.biodegradable ? "bg-green-500" : "bg-slate-300"
                            )} />
                            Biodegradable
                          </div>
                          <div className="flex items-center gap-2">
                            <div className={cn(
                              "w-2 h-2 rounded-full",
                              selectedProduct.sustainability.locallyMade ? "bg-green-500" : "bg-slate-300"
                            )} />
                            Locally Made
                          </div>
                          <div className="text-green-700 dark:text-green-400">
                            {selectedProduct.sustainability.recycledMaterials}% Recycled
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <Button
                        onClick={() => addToCart(selectedProduct)}
                        disabled={!selectedProduct.inStock}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white h-12"
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Add to Cart
                      </Button>
                      
                      <Button
                        onClick={() => handlePriceComparison(selectedProduct)}
                        variant="outline"
                        className="h-12 px-6 border-green-300 text-green-600 hover:bg-green-50 hover:border-green-400 transition-all duration-200 flex-shrink-0"
                      >
                        <TrendingUp className="h-4 w-4 mr-1" />
                        Compare Prices
                      </Button>
                      
                      <Button
                        variant="outline"
                        onClick={() => toggleWishlist(selectedProduct.id)}
                        className="h-12 px-6"
                      >
                        <Heart className={cn(
                          "h-4 w-4",
                          wishlist.includes(selectedProduct.id) ? "fill-red-500 text-red-500" : ""
                        )} />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Price Comparison Dialog */}
        <Dialog open={showPriceComparison} onOpenChange={setShowPriceComparison}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <TrendingUp className="w-6 h-6 text-green-600" />
                <span>Price Comparison - {selectedProduct?.name}</span>
              </DialogTitle>
            </DialogHeader>

            {loadingComparison ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Finding best prices across platforms...</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Product Info Header */}
                {selectedProduct && (
                  <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl">
                    <img
                      src={selectedProduct.image_url || '/api/placeholder/80/80'}
                      alt={selectedProduct.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{selectedProduct.name}</h3>
                      <p className="text-gray-600">{selectedProduct.brand}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm">{selectedProduct.rating} ({selectedProduct.reviews} reviews)</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Price Comparison Results */}
                {priceComparisons.length > 0 ? (
                  <div className="space-y-3">
                    <h4 className="text-lg font-semibold flex items-center">
                      <span>💰 Price Comparison Across Platforms</span>
                      {priceComparisons.find(c => c.bestDeal) && (
                        <Badge className="ml-2 bg-green-100 text-green-800">Best Deal Found</Badge>
                      )}
                    </h4>
                    
                    <div className="grid gap-4">
                      {priceComparisons.map((comparison, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className={cn(
                            "p-4 rounded-lg border-2 transition-all",
                            comparison.bestDeal 
                              ? "border-green-500 bg-green-50 shadow-lg" 
                              : "border-gray-200 bg-white hover:border-gray-300"
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="p-2 bg-blue-100 rounded-lg">
                                <span className="text-sm font-medium text-blue-700">
                                  {comparison.platform}
                                </span>
                              </div>
                              {comparison.bestDeal && (
                                <Badge className="bg-green-600 text-white">
                                  🏆 Best Price
                                </Badge>
                              )}
                            </div>
                            
                            <div className="text-right">
                              <div className="flex items-center space-x-2">
                                <span className="text-2xl font-bold text-green-600">
                                  {comparison.price}
                                </span>
                                {comparison.originalPrice && (
                                  <span className="text-sm text-gray-500 line-through">
                                    {comparison.originalPrice}
                                  </span>
                                )}
                                {comparison.discount && (
                                  <Badge className="bg-red-100 text-red-800">
                                    {comparison.discount}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div className="flex items-center space-x-1">
                              <Truck className="w-4 h-4 text-blue-500" />
                              <span className="text-gray-600">
                                {comparison.delivery} • {comparison.deliveryTime}
                              </span>
                            </div>
                            
                            <div className="flex items-center space-x-1">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-gray-600">{comparison.rating}</span>
                            </div>
                            
                            <div className="flex items-center space-x-1">
                              <div className={cn(
                                "w-2 h-2 rounded-full",
                                comparison.inStock ? "bg-green-500" : "bg-red-500"
                              )} />
                              <span className="text-gray-600">
                                {comparison.inStock ? 'In Stock' : 'Out of Stock'}
                              </span>
                            </div>
                            
                            <div className="text-gray-600 text-xs">
                              {comparison.seller}
                            </div>
                          </div>

                          {comparison.offers && (
                            <div className="mt-2 p-2 bg-yellow-50 rounded-lg">
                              <p className="text-sm text-yellow-800 font-medium">
                                🎁 {comparison.offers}
                              </p>
                            </div>
                          )}

                          <Button
                            className="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white"
                            onClick={() => {
                              toast({
                                title: "Redirecting to Platform",
                                description: `Opening ${comparison.platform} in new tab...`,
                              });
                            }}
                            disabled={!comparison.inStock}
                          >
                            Buy on {comparison.platform}
                            <Eye className="w-4 h-4 ml-2" />
                          </Button>
                        </motion.div>
                      ))}
                    </div>

                    {/* Summary */}
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                      <h5 className="font-semibold mb-2">💡 Price Comparison Summary</h5>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Lowest Price:</span>
                          <span className="font-semibold text-green-600 ml-2">
                            {priceComparisons[0]?.price}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Highest Price:</span>
                          <span className="font-semibold text-red-600 ml-2">
                            {priceComparisons[priceComparisons.length - 1]?.price}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Platforms Checked:</span>
                          <span className="font-semibold ml-2">{priceComparisons.length}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4">🔍</div>
                    <h3 className="text-lg font-semibold mb-2">No price data available</h3>
                    <p className="text-gray-600">
                      Unable to find price comparisons for this product at the moment.
                    </p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
