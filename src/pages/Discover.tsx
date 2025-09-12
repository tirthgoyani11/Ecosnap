import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { 
  Search, 
  Filter,
  Star,
  Leaf,
  Zap,
  Award,
  TrendingUp,
  ShoppingCart,
  Sparkles,
  Eye,
  Heart,
  Share2,
  ArrowRight,
  TreePine,
  Recycle,
  Lightbulb,
  Plus,
  Minus,
  X,
  MapPin,
  Clock,
  Truck,
  Shield,
  Flame,
  Camera,
  Image as ImageIcon,
  Wifi,
  RefreshCw,
  Bell,
  Settings,
  Grid,
  List,
  SortDesc,
  ThumbsUp,
  MessageSquare,
  ExternalLink,
  Package,
  CreditCard,
  Gift,
  Target,
  Layers,
  Wind,
  Droplets,
  Sun,
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

// Enhanced mock product data with real shopping features
const featuredProducts: EnhancedProduct[] = [
  {
    id: '1',
    name: 'Bamboo Water Bottle Premium',
    brand: 'EcoLife Pro',
    eco_score: 95,
    price: '$24.99',
    originalPrice: '$34.99',
    discount: 29,
    rating: 4.9,
    reviews: 2847,
    image_url: '/placeholder.svg',
    category: 'Drinkware',
    description: 'Premium sustainable bamboo water bottle with temperature control and leak-proof design',
    co2_saved: 3.2,
    tags: ['Sustainable', 'Zero Waste', 'BPA Free', 'Premium'],
    inStock: true,
    fastDelivery: true,
    freeShipping: true,
    verified: true,
    trending: true,
    newArrival: false,
    specifications: {
      'Capacity': '750ml',
      'Material': '100% Bamboo Fiber',
      'Temperature': 'Keeps cold 24h, hot 12h',
      'Warranty': '2 Years'
    },
    sustainability: {
      carbonNeutral: true,
      recycledMaterials: 85,
      biodegradable: true,
      locallyMade: false
    }
  },
  {
    id: '2',
    name: 'Organic Cotton T-Shirt Collection',
    brand: 'Green Thread Co.',
    eco_score: 91,
    price: '$28.00',
    originalPrice: '$35.00',
    discount: 20,
    rating: 4.7,
    reviews: 1543,
    image_url: '/placeholder.svg',
    category: 'Clothing',
    description: '100% organic cotton, ethically sourced and produced with fair trade certification',
    co2_saved: 2.8,
    tags: ['Organic', 'Fair Trade', 'Biodegradable', 'Ethical'],
    inStock: true,
    fastDelivery: false,
    freeShipping: true,
    verified: true,
    trending: false,
    newArrival: true,
    specifications: {
      'Material': '100% Organic Cotton',
      'Certification': 'GOTS Certified',
      'Origin': 'Fair Trade Certified',
      'Care': 'Machine Wash Cold'
    },
    sustainability: {
      carbonNeutral: false,
      recycledMaterials: 0,
      biodegradable: true,
      locallyMade: true
    }
  },
  {
    id: '3',
    name: 'Solar Power Bank 20000mAh',
    brand: 'SunTech Pro',
    eco_score: 88,
    price: '$45.99',
    originalPrice: '$59.99',
    discount: 23,
    rating: 4.6,
    reviews: 3284,
    image_url: '/placeholder.svg',
    category: 'Electronics',
    description: 'High-capacity solar power bank with wireless charging and LED indicators',
    co2_saved: 5.4,
    tags: ['Solar Powered', 'Wireless Charging', 'Fast Charge', 'Durable'],
    inStock: true,
    fastDelivery: true,
    freeShipping: true,
    verified: true,
    trending: true,
    newArrival: false,
    specifications: {
      'Capacity': '20000mAh',
      'Solar Panel': '5W Monocrystalline',
      'Wireless': '10W Qi Charging',
      'Ports': '2x USB-A, 1x USB-C'
    },
    sustainability: {
      carbonNeutral: true,
      recycledMaterials: 45,
      biodegradable: false,
      locallyMade: false
    }
  },
  {
    id: '4',
    name: 'Compostable Phone Case Set',
    brand: 'BioCover',
    eco_score: 93,
    price: '$19.99',
    rating: 4.8,
    reviews: 892,
    image_url: '/placeholder.svg',
    category: 'Electronics',
    description: 'Fully compostable phone cases made from plant-based materials',
    co2_saved: 1.2,
    tags: ['Compostable', 'Plant-Based', 'Biodegradable', 'Protective'],
    inStock: true,
    fastDelivery: true,
    freeShipping: false,
    verified: true,
    trending: false,
    newArrival: true,
    sustainability: {
      carbonNeutral: true,
      recycledMaterials: 0,
      biodegradable: true,
      locallyMade: true
    }
  },
  {
    id: '5',
    name: 'Stainless Steel Lunch Box',
    brand: 'EcoMeal',
    eco_score: 89,
    price: '$32.99',
    originalPrice: '$42.99',
    discount: 23,
    rating: 4.5,
    reviews: 1672,
    image_url: '/placeholder.svg',
    category: 'Kitchen',
    description: 'Premium stainless steel lunch box with compartments and bamboo utensils',
    co2_saved: 4.1,
    tags: ['Stainless Steel', 'Zero Waste', 'Leak Proof', 'Includes Utensils'],
    inStock: true,
    fastDelivery: false,
    freeShipping: true,
    verified: true,
    trending: true,
    newArrival: false,
    sustainability: {
      carbonNeutral: false,
      recycledMaterials: 75,
      biodegradable: false,
      locallyMade: true
    }
  }
];

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
  const [realtimeSuggestions, setRealtimeSuggestions] = useState<ProductSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Filters State
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [ecoScoreMin, setEcoScoreMin] = useState(70);
  const [showInStockOnly, setShowInStockOnly] = useState(true);
  const [showFreeShippingOnly, setShowFreeShippingOnly] = useState(false);

  // Real-time updates simulation
  useEffect(() => {
    const interval = setInterval(() => {
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
      setLastUpdated(new Date());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Filter and search products
  const filteredProducts = useMemo(() => {
    let filtered = featuredProducts;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Category filter
    if (selectedCategory !== 'All') {
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
      const price = parseFloat(product.price.replace('$', ''));
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
        filtered.sort((a, b) => parseFloat(a.price.replace('$', '')) - parseFloat(b.price.replace('$', '')));
        break;
      case 'price-high':
        filtered.sort((a, b) => parseFloat(b.price.replace('$', '')) - parseFloat(a.price.replace('$', '')));
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
  }, [searchQuery, selectedCategory, sortBy, priceRange, ecoScoreMin, showInStockOnly, showFreeShippingOnly]);

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
        return prev.filter(id => id !== productId);
      }
      return [...prev, productId];
    });
  }, []);

  const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalCartValue = cart.reduce((sum, item) => sum + (parseFloat(item.price.replace('$', '')) * item.quantity), 0);

  const categories = ['All', 'Trending', 'New', 'Sustainable', 'Drinkware', 'Clothing', 'Electronics', 'Kitchen'];

  return (
  {
    id: '1',
    name: 'Bamboo Water Bottle',
    brand: 'EcoLife',
    eco_score: 92,
    price: '$24.99',
    rating: 4.8,
    reviews: 1240,
    image_url: '/placeholder.svg',
    category: 'Drinkware',
    description: 'Sustainable bamboo water bottle with leak-proof design',
    co2_saved: 2.3,
    tags: ['Sustainable', 'Zero Waste', 'BPA Free']
  },
  {
    id: '2',
    name: 'Organic Cotton T-Shirt',
    brand: 'Green Thread',
    eco_score: 88,
    price: '$32.00',
    rating: 4.6,
    reviews: 856,
    image_url: '/placeholder.svg',
    category: 'Clothing',
    description: '100% organic cotton, ethically sourced and produced',
    co2_saved: 1.8,
    tags: ['Organic', 'Fair Trade', 'Biodegradable']
  },
  {
    id: '3',
    name: 'Solar Power Bank',
    brand: 'SunTech',
    eco_score: 85,
    price: '$45.99',
    rating: 4.7,
    reviews: 632,
    image_url: '/placeholder.svg',
    category: 'Electronics',
    description: 'Portable solar charger with 20,000mAh capacity',
    co2_saved: 3.1,
    tags: ['Solar Powered', 'Renewable Energy', 'Portable']
  },
  {
    id: '4',
    name: 'Reusable Beeswax Wraps',
    brand: 'Bee Green',
    eco_score: 95,
    price: '$18.50',
    rating: 4.9,
    reviews: 1450,
    image_url: '/placeholder.svg',
    category: 'Kitchen',
    description: 'Replace plastic wrap with natural beeswax food wraps',
    co2_saved: 4.2,
    tags: ['Reusable', 'Natural', 'Compostable']
  }
];

const categories = [
  { name: 'All', icon: Star, count: 150 },
  { name: 'Electronics', icon: Zap, count: 45 },
  { name: 'Clothing', icon: Heart, count: 32 },
  { name: 'Kitchen', icon: Leaf, count: 28 },
  { name: 'Personal Care', icon: Sparkles, count: 25 },
  { name: 'Home', icon: TreePine, count: 20 }
];

export default function Discover() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeTab, setActiveTab] = useState('featured');
  
  // Use the real product search hook
  const { data: searchResults, isLoading: searchLoading } = useProductSearch(searchTerm);
  const { data: products, isLoading: productsLoading } = useProducts(20);

  // Filter products based on selected category
  const filteredProducts = featuredProducts.filter(product => 
    selectedCategory === 'All' || product.category === selectedCategory
  );

  const getEcoScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 70) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-orange-600 bg-orange-50 border-orange-200';
  };

  const ProductCard = ({ product }: { product: any }) => (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -4 }}
      className="group cursor-pointer"
    >
      <Card className="h-full overflow-hidden transition-all duration-300 hover:shadow-lg border-0 bg-gradient-to-br from-background to-accent/20">
        <div className="relative">
          <div className="aspect-square w-full bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center">
            <img 
              src={product.image_url} 
              alt={product.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/placeholder.svg';
              }}
            />
          </div>
          <Badge className={cn("absolute top-2 right-2 border", getEcoScoreColor(product.eco_score))}>
            <Leaf className="w-3 h-3 mr-1" />
            {product.eco_score}
          </Badge>
        </div>
        
        <CardContent className="p-4">
          <div className="space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">
                  {product.name}
                </h3>
                <p className="text-xs text-muted-foreground">{product.brand}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-primary">{product.price}</p>
              </div>
            </div>
            
            <p className="text-xs text-muted-foreground line-clamp-2">
              {product.description}
            </p>
            
            <div className="flex items-center gap-2 text-xs">
              <div className="flex items-center">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 mr-1" />
                <span>{product.rating}</span>
                <span className="text-muted-foreground ml-1">({product.reviews})</span>
              </div>
              <div className="flex items-center text-emerald-600">
                <Recycle className="w-3 h-3 mr-1" />
                <span>{product.co2_saved}kg CO₂ saved</span>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-1">
              {product.tags.slice(0, 2).map((tag: string) => (
                <Badge key={tag} variant="outline" className="text-xs px-2 py-0">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header Section */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="inline-flex items-center space-x-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
            <Sparkles className="w-4 h-4" />
            <span>Eco-Friendly Product Discovery</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Discover Sustainable Products
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Find eco-friendly alternatives to everyday products. Every sustainable choice makes a difference for our planet.
          </p>
        </motion.div>
      </div>

      {/* Search and Filter Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-8"
      >
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search sustainable products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12"
            />
          </div>
          <Button variant="outline" size="lg" className="px-6">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category.name}
              variant={selectedCategory === category.name ? "default" : "outline"}
              onClick={() => setSelectedCategory(category.name)}
              className="rounded-full"
            >
              <category.icon className="w-4 h-4 mr-2" />
              {category.name}
              <Badge variant="secondary" className="ml-2 text-xs">
                {category.count}
              </Badge>
            </Button>
          ))}
        </div>
      </motion.div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="featured" className="text-sm">
            <Award className="w-4 h-4 mr-2" />
            Featured
          </TabsTrigger>
          <TabsTrigger value="trending" className="text-sm">
            <TrendingUp className="w-4 h-4 mr-2" />
            Trending
          </TabsTrigger>
          <TabsTrigger value="newest" className="text-sm">
            <Sparkles className="w-4 h-4 mr-2" />
            New Arrivals
          </TabsTrigger>
        </TabsList>

        <TabsContent value="featured" className="space-y-8">
          {/* Featured Products Grid */}
          <AnimatePresence mode="wait">
            {searchTerm ? (
              // Search Results
              <motion.div
                key="search-results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <h2 className="text-2xl font-bold mb-4">
                  Search Results for "{searchTerm}"
                </h2>
                {searchLoading ? (
                  <LoadingSkeleton />
                ) : searchResults && searchResults.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {searchResults.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={Search}
                    title="No products found"
                    description={`No eco-friendly products found for "${searchTerm}". Try different keywords.`}
                  />
                )}
              </motion.div>
            ) : (
              // Featured Products
              <motion.div
                key="featured-products"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Featured Eco-Friendly Products</h2>
                  <Button variant="ghost">
                    View All
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  <AnimatePresence>
                    {filteredProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </TabsContent>

        <TabsContent value="trending" className="space-y-8">
          <div className="text-center py-12">
            <TrendingUp className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Trending Products</h3>
            <p className="text-muted-foreground">Discover what's popular in sustainable living</p>
          </div>
        </TabsContent>

        <TabsContent value="newest" className="space-y-8">
          <div className="text-center py-12">
            <Sparkles className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">New Arrivals</h3>
            <p className="text-muted-foreground">Latest eco-friendly products just added</p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Bottom CTA Section */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-16"
      >
        <Card className="bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 border-0">
          <CardContent className="p-8 text-center">
            <div className="space-y-4">
              <div className="inline-flex items-center space-x-2 bg-background/80 text-primary px-4 py-2 rounded-full text-sm font-medium">
                <Lightbulb className="w-4 h-4" />
                <span>Join the Eco Movement</span>
              </div>
              
              <h3 className="text-2xl font-bold">
                Can't find what you're looking for?
              </h3>
              
              <p className="text-muted-foreground max-w-md mx-auto">
                Scan any product to discover its environmental impact and find sustainable alternatives instantly.
              </p>
              
              <Button size="lg" className="mt-4">
                <Zap className="w-4 h-4 mr-2" />
                Start Scanning Products
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
