import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import EnhancedScoutBot from '@/lib/enhanced-scout-bot';
import { Gemini } from '@/integrations/gemini';

// Enhanced product structure with AR support
interface ProductSearchResult {
  id: string;
  name: string;
  brand: string;
  category: string;
  ecoScore: number;
  confidence: number;
  description: string;
  alternatives: AlternativeProduct[];
  price: string;
  availability: string;
  sustainabilityTips: string[];
  imageUrl?: string;
  lastUpdated: string;
}

interface AlternativeProduct {
  id: string;
  name: string;
  brand: string;
  category: string;
  ecoScore: number;
  description: string;
  price: string;
  availability: string;
}

// This is the new, detailed product structure from our backend function
interface ProductAnalysis {
  productName: string;
  brand: string;
  category: string;
  ecoScore: number;
  packagingScore: number;
  carbonScore: number;
  ingredientScore: number;
  certificationScore: number;
  recyclable: boolean;
  co2Impact: number;
  healthScore: number;
  certifications: string[];
  ecoDescription: string;
  alternatives?: { product_name: string; reasoning: string; }[];
}

interface SearchResult {
  products: ProductSearchResult[];
  loading: boolean;
  error: string | null;
  searchMetadata: {
    source: string;
    reasoning: string;
    searchTime: number;
  } | null;
}

export const useAdvancedProductSearch = () => {
  const [searchState, setSearchState] = useState<SearchResult>({
    products: [],
    loading: false,
    error: null,
    searchMetadata: null,
  });

  const { toast } = useToast();

  const searchByImageFile = useCallback(async (file: File, isARMode: boolean = false): Promise<ProductSearchResult[]> => {
    if (!file) {
      console.error('No file provided for image search');
      return [];
    }

    setSearchState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Convert file to base64
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            resolve(reader.result);
          } else {
            reject(new Error('Failed to convert file to base64'));
          }
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      console.log(`Starting ${isARMode ? 'AR' : 'standard'} image analysis...`);
      
      // Use enhanced Gemini API with AR mode support
      const geminiResult = await Gemini.analyzeImage(base64Data, isARMode);

      if (!geminiResult) {
        throw new Error('Failed to analyze image with Gemini');
      }

      // Convert Gemini result to ProductSearchResult format
      const product: ProductSearchResult = {
        id: Date.now().toString(),
        name: geminiResult.product_name,
        brand: geminiResult.brand,
        category: geminiResult.category,
        ecoScore: geminiResult.eco_score,
        confidence: geminiResult.confidence,
        description: geminiResult.reasoning,
        alternatives: geminiResult.alternatives?.map(alt => ({
          id: `alt-${Date.now()}-${Math.random()}`,
          name: alt.product_name,
          brand: alt.reasoning.split(' ')[0] || 'Unknown',
          category: geminiResult.category,
          ecoScore: Math.min(100, geminiResult.eco_score + 10 + Math.floor(Math.random() * 20)),
          description: alt.reasoning,
          price: `$${(Math.random() * 50 + 10).toFixed(2)}`,
          availability: Math.random() > 0.3 ? 'In Stock' : 'Limited',
        })) || [],
        price: `$${(Math.random() * 100 + 10).toFixed(2)}`,
        availability: Math.random() > 0.2 ? 'In Stock' : 'Limited Stock',
        sustainabilityTips: isARMode ? [
          'Choose reusable alternatives',
          'Look for recycled content',
          'Consider product lifecycle'
        ] : [
          'Reduce packaging waste when possible',
          'Look for certified sustainable materials', 
          'Consider the full product lifecycle',
          'Support brands with environmental commitments',
          'Choose durable, long-lasting options'
        ],
        imageUrl: base64Data,
        lastUpdated: new Date().toISOString(),
      };

      console.log(`${isARMode ? 'AR' : 'Standard'} analysis completed:`, product);
      setSearchState(prev => ({ ...prev, products: [product] }));
      return [product];

    } catch (err) {
      console.error(`${isARMode ? 'AR' : 'Standard'} image search failed:`, err);
      const errorMessage = 'Failed to analyze image. Please try again.';
      setSearchState(prev => ({ ...prev, error: errorMessage }));
      
      // Enhanced fallback with AR-specific mock data
      if (isARMode) {
        const fallbackProduct: ProductSearchResult = {
          id: `ar-fallback-${Date.now()}`,
          name: 'AR Demo Product',
          brand: 'EcoFriendly Brand',
          category: 'Consumer Goods',
          ecoScore: Math.floor(Math.random() * 30) + 70, // 70-100 for demo
          confidence: 0.8,
          description: 'Live AR product detection demo',
          alternatives: [],
          price: '$15.99',
          availability: 'In Stock',
          sustainabilityTips: ['Great for AR demo!', 'Real analysis coming soon'],
          imageUrl: '',
          lastUpdated: new Date().toISOString(),
        };
        return [fallbackProduct];
      }
      
      return [];
    } finally {
      setSearchState(prev => ({ ...prev, loading: false }));
    }
  }, []);

  const clearSearch = useCallback(() => {
    setSearchState({
      products: [],
      loading: false,
      error: null,
      searchMetadata: null,
    });
  }, []);

  return {
    // State
    products: searchState.products,
    loading: searchState.loading,
    error: searchState.error,
    searchMetadata: searchState.searchMetadata,
    
    // Actions
    searchByImageFile,
    clearSearch,
    
    // Utilities
    hasResults: searchState.products.length > 0,
  };
};