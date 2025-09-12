import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DiscoverProductService, EnhancedProduct } from '@/services/discoverProductService';

interface UseDiscoverProductsOptions {
  searchQuery?: string;
  selectedCategory?: string;
  enableRecommendations?: boolean;
  userPreferences?: {
    categories: string[];
    priceRange: { min: number; max: number };
    ecoScoreMin: number;
  };
}

interface CartItem extends EnhancedProduct {
  quantity: number;
}

interface WishlistItem {
  productId: string;
  addedAt: Date;
}

export const useDiscoverProducts = (options: UseDiscoverProductsOptions = {}) => {
  const {
    searchQuery = '',
    selectedCategory = 'All',
    enableRecommendations = true,
    userPreferences = {
      categories: ['Electronics', 'Clothing', 'Kitchen', 'Fitness', 'Drinkware'],
      priceRange: { min: 0, max: 200 },
      ecoScoreMin: 80
    }
  } = options;

  // Fetch main products
  const {
    data: allProducts = [],
    isLoading: productsLoading,
    error: productsError,
    refetch: refetchProducts
  } = useQuery({
    queryKey: ['discover-products', selectedCategory, searchQuery],
    queryFn: async () => {
      if (searchQuery) {
        return await DiscoverProductService.searchProducts(searchQuery, selectedCategory);
      }
      
      // Generate products based on category
      let categories = ['Electronics', 'Clothing', 'Kitchen', 'Fitness', 'Drinkware'];
      if (selectedCategory !== 'All') {
        categories = [selectedCategory];
      }
      
      return await DiscoverProductService.generateEcoProducts(categories, 20);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Fetch trending products
  const {
    data: trendingProducts = [],
    isLoading: trendingLoading
  } = useQuery({
    queryKey: ['trending-products'],
    queryFn: () => DiscoverProductService.getTrendingProducts(6),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Fetch new products
  const {
    data: newProducts = [],
    isLoading: newLoading
  } = useQuery({
    queryKey: ['new-products'],
    queryFn: () => DiscoverProductService.getNewProducts(6),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Fetch recommendations
  const {
    data: recommendations = [],
    isLoading: recommendationsLoading
  } = useQuery({
    queryKey: ['product-recommendations', userPreferences],
    queryFn: () => DiscoverProductService.getRecommendations(userPreferences, 5),
    enabled: enableRecommendations,
    staleTime: 15 * 60 * 1000, // 15 minutes
  });

  // Filter products based on current selection
  const filteredProducts = useMemo(() => {
    let filtered = allProducts;

    // Category filter
    if (selectedCategory === 'Trending') {
      filtered = trendingProducts;
    } else if (selectedCategory === 'New') {
      filtered = newProducts;
    } else if (selectedCategory === 'Sustainable') {
      filtered = allProducts.filter(product => product.ecoScore >= 90);
    } else if (selectedCategory === 'Top Rated') {
      filtered = allProducts.filter(product => product.rating >= 4.7);
    }

    return filtered;
  }, [allProducts, trendingProducts, newProducts, selectedCategory]);

  return {
    // Products
    products: filteredProducts,
    trendingProducts,
    newProducts,
    recommendations,
    
    // Loading states
    isLoading: productsLoading || trendingLoading || newLoading,
    recommendationsLoading,
    
    // Error states
    error: productsError,
    
    // Actions
    refetchProducts,
  };
};

export const useCart = () => {
  const [cart, setCart] = useState<CartItem[]>([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('ecosnap-discover-cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (error) {
        console.error('Failed to load cart from localStorage:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('ecosnap-discover-cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product: EnhancedProduct) => {
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

  const clearCart = () => {
    setCart([]);
  };

  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  return {
    cart,
    cartTotal,
    cartItemCount,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
  };
};

export const useWishlist = () => {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);

  // Load wishlist from localStorage on mount
  useEffect(() => {
    const savedWishlist = localStorage.getItem('ecosnap-discover-wishlist');
    if (savedWishlist) {
      try {
        const parsed = JSON.parse(savedWishlist);
        // Convert date strings back to Date objects
        const wishlistWithDates = parsed.map((item: any) => ({
          ...item,
          addedAt: new Date(item.addedAt)
        }));
        setWishlist(wishlistWithDates);
      } catch (error) {
        console.error('Failed to load wishlist from localStorage:', error);
      }
    }
  }, []);

  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('ecosnap-discover-wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const toggleWishlist = (product: EnhancedProduct) => {
    const isInWishlist = wishlist.some(item => item.productId === product.id);
    
    if (isInWishlist) {
      setWishlist(wishlist.filter(item => item.productId !== product.id));
      return { added: false };
    } else {
      setWishlist([...wishlist, { productId: product.id, addedAt: new Date() }]);
      return { added: true };
    }
  };

  const isInWishlist = (productId: string) => {
    return wishlist.some(item => item.productId === productId);
  };

  const clearWishlist = () => {
    setWishlist([]);
  };

  return {
    wishlist,
    toggleWishlist,
    isInWishlist,
    clearWishlist,
  };
};

export const useProductComparison = () => {
  const [compareList, setCompareList] = useState<EnhancedProduct[]>([]);

  const toggleCompare = (product: EnhancedProduct) => {
    const isInCompare = compareList.some(item => item.id === product.id);
    
    if (isInCompare) {
      setCompareList(compareList.filter(item => item.id !== product.id));
      return { added: false, error: null };
    } else if (compareList.length < 3) {
      setCompareList([...compareList, product]);
      return { added: true, error: null };
    } else {
      return { 
        added: false, 
        error: 'You can only compare up to 3 products. Please remove one to add another.' 
      };
    }
  };

  const removeFromCompare = (productId: string) => {
    setCompareList(compareList.filter(item => item.id !== productId));
  };

  const clearCompare = () => {
    setCompareList([]);
  };

  const isInCompare = (productId: string) => {
    return compareList.some(item => item.id === productId);
  };

  return {
    compareList,
    toggleCompare,
    removeFromCompare,
    clearCompare,
    isInCompare,
  };
};
