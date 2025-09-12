import React, { useState } from 'react';
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

const categories = ['All', 'Trending', 'New', 'Sustainable', 'Top Rated', 'Drinkware', 'Clothing', 'Electronics', 'Kitchen', 'Fitness'];

const DiscoverPage: React.FC = () => {
  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedProduct, setSelectedProduct] = useState<EnhancedProduct | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCompareOpen, setIsCompareOpen] = useState(false);

  const { toast } = useToast();

  // Custom hooks
  const { 
    products, 
    recommendations, 
    isLoading, 
    error 
  } = useDiscoverProducts({ 
    searchQuery, 
    selectedCategory,
    enableRecommendations: true 
  });

  const {
    cart,
    cartTotal,
    cartItemCount,
    addToCart,
    removeFromCart,
    updateCartQuantity,
  } = useCart();

  const {
    wishlist,
    toggleWishlist,
    isInWishlist,
  } = useWishlist();

  const {
    compareList,
    toggleCompare,
    clearCompare,
    isInCompare,
  } = useProductComparison();

  // Enhanced cart handler with toast
  const handleAddToCart = (product: EnhancedProduct) => {
    addToCart(product);
    toast({
      title: "Added to Cart",
      description: `${product.name} added to your cart`,
    });
  };

  // Enhanced wishlist handler with toast
  const handleToggleWishlist = (product: EnhancedProduct) => {
    const result = toggleWishlist(product);
    toast({
      title: result.added ? "Added to Wishlist" : "Removed from Wishlist",
      description: `${product.name} ${result.added ? 'added to' : 'removed from'} your wishlist`,
    });
  };

  // Enhanced compare handler with toast
  const handleToggleCompare = (product: EnhancedProduct) => {
    const result = toggleCompare(product);
    
    if (result.error) {
      toast({
        title: "Compare Limit Reached",
        description: result.error,
        variant: "destructive"
      });
    } else if (result.added) {
      toast({
        title: "Added to Compare",
        description: `${product.name} added to comparison`,
      });
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-destructive">Failed to Load Products</h2>
          <p className="text-muted-foreground">Please try refreshing the page</p>
          <Button onClick={() => window.location.reload()}>Refresh</Button>
        </div>
      </div>
    );
  }

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
                              onError={(e) => {
                                e.currentTarget.src = '/placeholder.svg';
                              }}
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
                          <Button variant="outline" className="w-full" onClick={() => setIsCartOpen(false)}>
                            Continue Shopping
                          </Button>
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
                      <GitCompare className="h-4 w-4" />
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
                            onClick={() => handleToggleCompare(product)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                          
                          <CardHeader className="p-4">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-32 object-cover rounded"
                              onError={(e) => {
                                e.currentTarget.src = '/placeholder.svg';
                              }}
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
                                  <Star className="h-3 w-3 fill-current text-yellow-400" />
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
        {!isLoading && (
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-muted-foreground">
              {products.length} products found
            </p>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
            {Array.from({ length: 8 }).map((_, index) => (
              <Card key={index} className="overflow-hidden">
                <div className="w-full h-48 bg-gray-200 animate-pulse" />
                <CardContent className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 animate-pulse rounded" />
                  <div className="h-3 bg-gray-200 animate-pulse rounded w-2/3" />
                  <div className="h-3 bg-gray-200 animate-pulse rounded w-1/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Product Grid */}
        {!isLoading && (
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12"
          >
            <AnimatePresence>
              {products.map((product) => (
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
                          onClick={() => handleToggleWishlist(product)}
                          className={isInWishlist(product.id) ? 'text-red-500' : ''}
                        >
                          <Heart className={`h-4 w-4 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
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
                                    onError={(e) => {
                                      e.currentTarget.src = '/placeholder.svg';
                                    }}
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
                                  <Button onClick={() => handleAddToCart(selectedProduct)} className="flex-1">
                                    <ShoppingCart className="h-4 w-4 mr-2" />
                                    Add to Cart
                                  </Button>
                                  <Button
                                    variant="outline"
                                    onClick={() => handleToggleCompare(selectedProduct)}
                                    disabled={compareList.length >= 3 && !isInCompare(selectedProduct.id)}
                                    className="border-green-300 text-green-600 hover:bg-green-50 hover:border-green-400 transition-all duration-200"
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
                          onClick={() => handleToggleCompare(product)}
                          disabled={compareList.length >= 3 && !isInCompare(product.id)}
                          className="bg-green-50 text-green-600 border-green-300 hover:bg-green-100 hover:border-green-400 transition-all duration-200"
                        >
                          <GitCompare className="h-4 w-4" />
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
                          <Button onClick={() => handleAddToCart(product)} className="flex-1">
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
        )}

        {/* Recommendations */}
        {!isLoading && recommendations.length > 0 && (
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
                          <Button size="sm" onClick={() => handleAddToCart(product)}>
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

        {/* Empty State */}
        {!isLoading && products.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold mb-2">No products found</h3>
            <p className="text-muted-foreground mb-4">Try adjusting your search or category filters</p>
            <Button onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
            }}>
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiscoverPage;
