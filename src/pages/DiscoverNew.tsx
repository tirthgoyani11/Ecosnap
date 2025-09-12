import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  useDiscoverProducts, 
  useCart, 
  useWishlist, 
  useProductComparison 
} from '@/hooks/useDiscoverProducts';
import { EnhancedProduct } from '@/services/discoverProductService';
import { LoadingSkeleton } from '@/components/LoadingSpinner';
import {
  Search,
  Filter,
  Heart,
  ShoppingCart,
  Eye,
  Star,
  Leaf,
  Zap,
  TrendingUp,
  Sparkles,
  GitCompare,
  X,
  Plus,
  Minus,
  ChevronLeft,
  ChevronRight,
  Loader2
} from 'lucide-react';

// Types
interface Product {
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
}

interface CartItem extends Product {
  quantity: number;
}

interface WishlistItem {
  productId: string;
  addedAt: Date;
}

// Mock data with comprehensive product information
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Bamboo Water Bottle',
    brand: 'EcoLife',
    category: 'Drinkware',
    price: 24.99,
    originalPrice: 34.99,
    ecoScore: 95,
    rating: 4.8,
    reviews: 1240,
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&h=400&fit=crop',
    description: 'Sustainable bamboo water bottle with leak-proof design and temperature control.',
    tags: ['Sustainable', 'BPA-Free', 'Leak-Proof'],
    isNew: false,
    isTrending: true,
    sustainability: {
      packaging: 90,
      materials: 95,
      manufacturing: 85,
      transport: 80
    }
  },
  {
    id: '2',
    name: 'Organic Cotton T-Shirt',
    brand: 'GreenWear',
    category: 'Clothing',
    price: 32.99,
    ecoScore: 88,
    rating: 4.6,
    reviews: 856,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop',
    description: 'Premium organic cotton t-shirt made with sustainable farming practices.',
    tags: ['Organic', 'Fair Trade', 'Biodegradable'],
    isNew: true,
    isTrending: false,
    sustainability: {
      packaging: 85,
      materials: 90,
      manufacturing: 88,
      transport: 75
    }
  },
  {
    id: '3',
    name: 'Solar Power Bank',
    brand: 'SunTech',
    category: 'Electronics',
    price: 49.99,
    originalPrice: 69.99,
    ecoScore: 92,
    rating: 4.9,
    reviews: 2100,
    image: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400&h=400&fit=crop',
    description: 'Portable solar power bank with fast charging and weather-resistant design.',
    tags: ['Solar', 'Renewable Energy', 'Portable'],
    isNew: false,
    isTrending: true,
    sustainability: {
      packaging: 88,
      materials: 92,
      manufacturing: 90,
      transport: 85
    }
  },
  {
    id: '4',
    name: 'Reusable Food Wraps',
    brand: 'ZeroWaste',
    category: 'Kitchen',
    price: 18.99,
    ecoScore: 96,
    rating: 4.7,
    reviews: 950,
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop',
    description: 'Beeswax food wraps that replace plastic wrap for sustainable food storage.',
    tags: ['Zero Waste', 'Reusable', 'Natural'],
    isNew: true,
    isTrending: false,
    sustainability: {
      packaging: 95,
      materials: 98,
      manufacturing: 92,
      transport: 88
    }
  },
  {
    id: '5',
    name: 'Recycled Yoga Mat',
    brand: 'EcoFit',
    category: 'Fitness',
    price: 68.99,
    ecoScore: 89,
    rating: 4.5,
    reviews: 670,
    image: 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=400&h=400&fit=crop',
    description: 'High-performance yoga mat made from recycled ocean plastic.',
    tags: ['Recycled', 'Ocean Plastic', 'Non-Slip'],
    isNew: false,
    isTrending: true,
    sustainability: {
      packaging: 85,
      materials: 95,
      manufacturing: 88,
      transport: 82
    }
  },
  {
    id: '6',
    name: 'Biodegradable Phone Case',
    brand: 'EcoTech',
    category: 'Electronics',
    price: 22.99,
    ecoScore: 91,
    rating: 4.4,
    reviews: 445,
    image: 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=400&h=400&fit=crop',
    description: 'Protective phone case made from plant-based biodegradable materials.',
    tags: ['Biodegradable', 'Plant-Based', 'Protective'],
    isNew: true,
    isTrending: false,
    sustainability: {
      packaging: 90,
      materials: 93,
      manufacturing: 89,
      transport: 87
    }
  }
];

const categories = ['All', 'Trending', 'New', 'Sustainable', 'Top Rated', 'Drinkware', 'Clothing', 'Electronics', 'Kitchen', 'Fitness'];

const DiscoverPage: React.FC = () => {
  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [compareList, setCompareList] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const { toast } = useToast();

  // Load cart and wishlist from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('ecosnap-cart');
    const savedWishlist = localStorage.getItem('ecosnap-wishlist');
    
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
    if (savedWishlist) {
      setWishlist(JSON.parse(savedWishlist));
    }
  }, []);

  // Save to localStorage when cart or wishlist changes
  useEffect(() => {
    localStorage.setItem('ecosnap-cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('ecosnap-wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  // Filter and search products
  const filteredProducts = useMemo(() => {
    let filtered = mockProducts;

    // Category filter
    if (selectedCategory === 'Trending') {
      filtered = filtered.filter(product => product.isTrending);
    } else if (selectedCategory === 'New') {
      filtered = filtered.filter(product => product.isNew);
    } else if (selectedCategory === 'Sustainable') {
      filtered = filtered.filter(product => product.ecoScore >= 90);
    } else if (selectedCategory === 'Top Rated') {
      filtered = filtered.filter(product => product.rating >= 4.7);
    } else if (selectedCategory !== 'All') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    return filtered;
  }, [searchQuery, selectedCategory]);

  // Personalized recommendations (products with similar eco scores or categories)
  const recommendations = useMemo(() => {
    if (cart.length === 0) return mockProducts.slice(0, 3);
    
    const cartCategories = cart.map(item => item.category);
    const avgEcoScore = cart.reduce((sum, item) => sum + item.ecoScore, 0) / cart.length;
    
    return mockProducts
      .filter(product => 
        cartCategories.includes(product.category) || 
        Math.abs(product.ecoScore - avgEcoScore) <= 10
      )
      .filter(product => !cart.some(cartItem => cartItem.id === product.id))
      .slice(0, 3);
  }, [cart]);

  // Cart functions
  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      setCart(cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
    
    toast({
      title: "Added to Cart",
      description: `${product.name} added to your cart`,
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCart(cart.map(item =>
      item.id === productId
        ? { ...item, quantity }
        : item
    ));
  };

  // Wishlist functions
  const toggleWishlist = (product: Product) => {
    const isInWishlist = wishlist.some(item => item.productId === product.id);
    
    if (isInWishlist) {
      setWishlist(wishlist.filter(item => item.productId !== product.id));
      toast({
        title: "Removed from Wishlist",
        description: `${product.name} removed from your wishlist`,
      });
    } else {
      setWishlist([...wishlist, { productId: product.id, addedAt: new Date() }]);
      toast({
        title: "Added to Wishlist",
        description: `${product.name} added to your wishlist`,
      });
    }
  };

  // Compare functions
  const toggleCompare = (product: Product) => {
    const isInCompare = compareList.some(item => item.id === product.id);
    
    if (isInCompare) {
      setCompareList(compareList.filter(item => item.id !== product.id));
    } else if (compareList.length < 3) {
      setCompareList([...compareList, product]);
      toast({
        title: "Added to Compare",
        description: `${product.name} added to comparison`,
      });
    } else {
      toast({
        title: "Compare Limit Reached",
        description: "You can only compare up to 3 products",
        variant: "destructive"
      });
    }
  };

  const clearCompare = () => {
    setCompareList([]);
  };

  // Calculate cart total
  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-16 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search eco-friendly products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Cart */}
              <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="relative">
                    <ShoppingCart className="h-4 w-4" />
                    {cartItemCount > 0 && (
                      <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                        {cartItemCount}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Shopping Cart ({cartItemCount})</SheetTitle>
                  </SheetHeader>
                  <div className="flex flex-col h-full">
                    <div className="flex-1 overflow-auto space-y-4 mt-4">
                      {cart.length === 0 ? (
                        <p className="text-center text-muted-foreground mt-8">Your cart is empty</p>
                      ) : (
                        cart.map((item) => (
                          <div key={item.id} className="flex items-center gap-3 p-3 border rounded-lg">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-16 h-16 object-cover rounded"
                            />
                            <div className="flex-1">
                              <h4 className="font-medium text-sm">{item.name}</h4>
                              <p className="text-sm text-muted-foreground">${item.price}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <span className="text-sm font-medium">{item.quantity}</span>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => removeFromCart(item.id)}
                                  className="ml-auto"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    
                    {cart.length > 0 && (
                      <div className="border-t pt-4 space-y-4">
                        <div className="flex justify-between items-center font-medium">
                          <span>Total: ${cartTotal.toFixed(2)}</span>
                        </div>
                        <div className="space-y-2">
                          <Button className="w-full">Checkout</Button>
                          <Button variant="outline" className="w-full">Continue Shopping</Button>
                        </div>
                      </div>
                    )}
                  </div>
                </SheetContent>
              </Sheet>

              {/* Compare */}
              {compareList.length > 0 && (
                <Sheet open={isCompareOpen} onOpenChange={setIsCompareOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm" className="relative">
                      <Compare className="h-4 w-4" />
                      <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                        {compareList.length}
                      </Badge>
                    </Button>
                  </SheetTrigger>
                  <SheetContent className="w-full max-w-4xl">
                    <SheetHeader>
                      <SheetTitle className="flex items-center justify-between">
                        Compare Products ({compareList.length})
                        <Button variant="ghost" size="sm" onClick={clearCompare}>
                          Clear All
                        </Button>
                      </SheetTitle>
                    </SheetHeader>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                      {compareList.map((product) => (
                        <Card key={product.id} className="relative">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="absolute top-2 right-2 z-10"
                            onClick={() => toggleCompare(product)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                          
                          <CardHeader className="p-4">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-32 object-cover rounded"
                            />
                          </CardHeader>
                          
                          <CardContent className="p-4 space-y-3">
                            <h3 className="font-semibold text-sm">{product.name}</h3>
                            <p className="text-sm text-muted-foreground">{product.brand}</p>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-xs">Price:</span>
                                <span className="text-xs font-medium">${product.price}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-xs">Eco Score:</span>
                                <Badge variant="secondary" className="text-xs">{product.ecoScore}</Badge>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-xs">Rating:</span>
                                <div className="flex items-center gap-1">
                                  <Star className="h-3 w-3 fill-current" />
                                  <span className="text-xs">{product.rating}</span>
                                </div>
                              </div>
                              
                              <Separator />
                              
                              <div className="space-y-1">
                                <p className="text-xs font-medium">Sustainability:</p>
                                <div className="space-y-1">
                                  <div className="flex justify-between">
                                    <span className="text-xs">Packaging:</span>
                                    <span className="text-xs">{product.sustainability.packaging}%</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-xs">Materials:</span>
                                    <span className="text-xs">{product.sustainability.materials}%</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-xs">Manufacturing:</span>
                                    <span className="text-xs">{product.sustainability.manufacturing}%</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-xs">Transport:</span>
                                    <span className="text-xs">{product.sustainability.transport}%</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </SheetContent>
                </Sheet>
              )}
            </div>
          </div>

          {/* Category Tabs */}
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mt-4">
            <TabsList className="grid grid-cols-5 lg:grid-cols-10 w-full">
              {categories.map((category) => (
                <TabsTrigger key={category} value={category} className="text-xs">
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold mb-4">Discover Eco-Friendly Products</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Find sustainable, high-quality products that are good for you and the planet.
            Every purchase makes a difference.
          </p>
        </motion.div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-muted-foreground">
            {filteredProducts.length} products found
          </p>
        </div>

        {/* Product Grid */}
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12"
        >
          <AnimatePresence>
            {filteredProducts.map((product) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ y: -4 }}
                className="group"
              >
                <Card className="h-full overflow-hidden hover:shadow-lg transition-all duration-300">
                  {/* Product Image */}
                  <div className="relative overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder.svg';
                      }}
                    />
                    
                    {/* Badges */}
                    <div className="absolute top-2 left-2 flex gap-1">
                      {product.isNew && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          <Sparkles className="h-3 w-3 mr-1" />
                          New
                        </Badge>
                      )}
                      {product.isTrending && (
                        <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          Trending
                        </Badge>
                      )}
                    </div>

                    {/* Eco Score */}
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-green-600">
                        <Leaf className="h-3 w-3 mr-1" />
                        {product.ecoScore}
                      </Badge>
                    </div>

                    {/* Quick Actions */}
                    <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => toggleWishlist(product)}
                        className={wishlist.some(item => item.productId === product.id) ? 'text-red-500' : ''}
                      >
                        <Heart className={`h-4 w-4 ${wishlist.some(item => item.productId === product.id) ? 'fill-current' : ''}`} />
                      </Button>
                      
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="secondary" onClick={() => setSelectedProduct(product)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>{product.name}</DialogTitle>
                          </DialogHeader>
                          
                          {selectedProduct && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <img
                                  src={selectedProduct.image}
                                  alt={selectedProduct.name}
                                  className="w-full h-64 object-cover rounded"
                                />
                                
                                <div className="space-y-4">
                                  <div>
                                    <h3 className="font-semibold text-lg">{selectedProduct.name}</h3>
                                    <p className="text-muted-foreground">{selectedProduct.brand}</p>
                                  </div>
                                  
                                  <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-1">
                                      <Star className="h-4 w-4 fill-current text-yellow-400" />
                                      <span>{selectedProduct.rating}</span>
                                      <span className="text-sm text-muted-foreground">({selectedProduct.reviews} reviews)</span>
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center gap-2">
                                    <span className="text-2xl font-bold">${selectedProduct.price}</span>
                                    {selectedProduct.originalPrice && (
                                      <span className="text-lg text-muted-foreground line-through">
                                        ${selectedProduct.originalPrice}
                                      </span>
                                    )}
                                  </div>

                                  <Badge className="bg-green-600">
                                    <Leaf className="h-3 w-3 mr-1" />
                                    Eco Score: {selectedProduct.ecoScore}
                                  </Badge>
                                  
                                  <div className="flex flex-wrap gap-1">
                                    {selectedProduct.tags.map((tag, index) => (
                                      <Badge key={index} variant="outline" className="text-xs">
                                        {tag}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              </div>
                              
                              <p className="text-muted-foreground">{selectedProduct.description}</p>
                              
                              <div className="space-y-2">
                                <h4 className="font-medium">Sustainability Breakdown</h4>
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="flex justify-between">
                                    <span className="text-sm">Packaging:</span>
                                    <span className="text-sm font-medium">{selectedProduct.sustainability.packaging}%</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-sm">Materials:</span>
                                    <span className="text-sm font-medium">{selectedProduct.sustainability.materials}%</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-sm">Manufacturing:</span>
                                    <span className="text-sm font-medium">{selectedProduct.sustainability.manufacturing}%</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-sm">Transport:</span>
                                    <span className="text-sm font-medium">{selectedProduct.sustainability.transport}%</span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex gap-2 pt-4">
                                <Button onClick={() => addToCart(selectedProduct)} className="flex-1">
                                  <ShoppingCart className="h-4 w-4 mr-2" />
                                  Add to Cart
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={() => toggleCompare(selectedProduct)}
                                  disabled={compareList.length >= 3 && !compareList.some(item => item.id === selectedProduct.id)}
                                  className="border-green-300 text-green-600 hover:bg-green-50 hover:border-green-400 transition-all duration-200 flex-shrink-0"
                                >
                                  <GitCompare className="h-4 w-4 mr-2" />
                                  Compare
                                </Button>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                      
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => toggleCompare(product)}
                        disabled={compareList.length >= 3 && !compareList.some(item => item.id === product.id)}
                      >
                        <Compare className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Product Info */}
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-semibold line-clamp-1">{product.name}</h3>
                        <p className="text-sm text-muted-foreground">{product.brand}</p>
                      </div>

                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-current text-yellow-400" />
                        <span className="text-sm">{product.rating}</span>
                        <span className="text-xs text-muted-foreground">({product.reviews})</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="font-bold">${product.price}</span>
                        {product.originalPrice && (
                          <span className="text-sm text-muted-foreground line-through">
                            ${product.originalPrice}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {product.tags.slice(0, 2).map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {product.tags.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{product.tags.length - 2}
                          </Badge>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Button onClick={() => addToCart(product)} className="flex-1">
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Add to Cart
                        </Button>
                        <Button variant="outline" size="sm">
                          Buy Now
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-bold">Recommended for You</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendations.map((product) => (
                <motion.div
                  key={product.id}
                  whileHover={{ y: -4 }}
                  className="group"
                >
                  <Card className="h-full overflow-hidden hover:shadow-lg transition-all duration-300">
                    <div className="relative overflow-hidden">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder.svg';
                        }}
                      />
                      
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-green-600">
                          <Leaf className="h-3 w-3 mr-1" />
                          {product.ecoScore}
                        </Badge>
                      </div>
                    </div>

                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <h3 className="font-semibold text-sm line-clamp-1">{product.name}</h3>
                        <p className="text-xs text-muted-foreground">{product.brand}</p>
                        
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm">${product.price}</span>
                          <Button size="sm" onClick={() => addToCart(product)}>
                            <ShoppingCart className="h-3 w-3 mr-1" />
                            Add
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default DiscoverPage;
