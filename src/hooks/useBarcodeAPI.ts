import { useState, useCallback } from 'react';
import { useToast } from './use-toast';
import EnhancedScoutBot from '@/lib/enhanced-scout-bot';
import { Gemini } from '@/integrations/gemini';
import { fetchProductByBarcode, mapOffToEcoProduct, searchProductByName, type EcoProduct } from '@/integrations/openfoodfacts';

interface BarcodeResult {
  success: boolean;
  product?: {
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
    alternatives: { product_name: string; reasoning: string; }[];
  };
  error?: string;
}

export const useBarcodeAPI = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  function timeoutPromise<T>(p: Promise<T>, ms = 6000): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const t = setTimeout(() => reject(new Error('Request timed out')), ms);
      p.then((v) => { clearTimeout(t); resolve(v); })
       .catch((e) => { clearTimeout(t); reject(e); });
    });
  }

  function mergeGeminiWithOFF(gem: {
    productName: string;
    brand: string;
    category: string;
    ecoScore: number;
    alternatives: { product_name: string; reasoning: string }[];
    ecoDescription: string;
  }, off?: EcoProduct | null): BarcodeResult['product'] {
    if (!off) {
      return {
        productName: gem.productName,
        brand: gem.brand,
        category: gem.category,
        ecoScore: gem.ecoScore,
        packagingScore: 55,
        carbonScore: 55,
        ingredientScore: 55,
        certificationScore: 50,
        recyclable: false,
        co2Impact: -1,
        healthScore: 50,
        certifications: [],
        ecoDescription: gem.ecoDescription,
        alternatives: gem.alternatives,
      };
    }
    // Use Gemini as source of truth for identity/ecoScore; enrich with OFF metadata
    return {
      productName: gem.productName || off.productName,
      brand: gem.brand || off.brand,
      category: gem.category || off.category,
      ecoScore: gem.ecoScore, // Gemini primary
      packagingScore: off.packagingScore,
      carbonScore: off.carbonScore,
      ingredientScore: off.ingredientScore,
      certificationScore: off.certificationScore,
      recyclable: off.recyclable,
      co2Impact: off.co2Impact,
      healthScore: off.healthScore,
      certifications: off.certifications,
      ecoDescription: `${gem.ecoDescription}\n\nExtra info (OFF): ${off.ecoDescription}`,
      alternatives: gem.alternatives.length ? gem.alternatives : off.alternatives,
    };
  }

  const lookupBarcode = useCallback(async (barcode: string): Promise<BarcodeResult> => {
    if (!barcode) {
      return { success: false, error: 'No barcode provided' };
    }

    setIsLoading(true);
    
    try {
      console.log('🔍 Looking up barcode (Gemini-first):', barcode);

      // 1) Gemini primary (text analysis on barcode string)
      const gem = await timeoutPromise(Gemini.analyzeText(barcode));
      if (gem) {
        const base = {
          productName: gem.product_name || 'Unknown product',
          brand: gem.brand || 'Unknown brand',
          category: gem.category || 'general',
          ecoScore: typeof gem.eco_score === 'number' ? gem.eco_score : 55,
          alternatives: gem.alternatives || [],
          ecoDescription: `Gemini: ${gem.reasoning || 'Eco analysis'}. Confidence: ${gem.confidence ?? 0}`,
        };
        // 2) OFF enrichment (do not use OFF for scanning/identification)
        let offMapped: EcoProduct | null = null;
        try {
          const controller = new AbortController();
          const offPromise = fetchProductByBarcode(barcode, { signal: controller.signal });
          const timeoutId = setTimeout(() => controller.abort('OFF timeout'), 3000);
          const off = await offPromise.finally(() => clearTimeout(timeoutId));
          if (off?.status === 1 && off.product) offMapped = mapOffToEcoProduct(off.product);
        } catch {}

        const merged = mergeGeminiWithOFF(base, offMapped);
        toast({ title: 'Product Found! ✅', description: `${merged.productName} - Eco Score: ${merged.ecoScore}` });
        return { success: true, product: merged };
      }

      // 3) Fallback to EnhancedScoutBot if Gemini failed
      const scoutResult = await EnhancedScoutBot.findProduct({ barcode });
      if (scoutResult.success && scoutResult.product) {
        toast({ title: 'Product Found! ✅', description: `${scoutResult.product.productName} - Eco Score: ${scoutResult.product.ecoScore}` });
        return { success: true, product: scoutResult.product };
      }
      throw new Error('Product not found');

    } catch (error) {
      console.error('❌ Barcode lookup failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Lookup failed';
      
      toast({
        title: "Lookup Failed ❌",
        description: errorMessage,
        variant: "destructive",
      });

      return {
        success: false,
        error: errorMessage,
      };

    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const lookupProductName = useCallback(async (productName: string): Promise<BarcodeResult> => {
    if (!productName) {
      return { success: false, error: 'No product name provided' };
    }

    setIsLoading(true);
    
    try {
      console.log('🔍 Looking up product (Gemini-first):', productName);

      // 1) Gemini primary on name
      const gem = await timeoutPromise(Gemini.analyzeText(productName));
      if (gem) {
        const base = {
          productName: gem.product_name || productName,
          brand: gem.brand || 'Unknown brand',
          category: gem.category || 'general',
          ecoScore: typeof gem.eco_score === 'number' ? gem.eco_score : 55,
          alternatives: gem.alternatives || [],
          ecoDescription: `Gemini: ${gem.reasoning || 'Eco analysis'}. Confidence: ${gem.confidence ?? 0}`,
        };
        // 2) OFF enrichment by name (best-effort)
        let offMapped: EcoProduct | null = null;
        try {
          const controller = new AbortController();
          const offPromise = searchProductByName(productName, { signal: controller.signal, pageSize: 1 });
          const timeoutId = setTimeout(() => controller.abort('OFF search timeout'), 3000);
          const results = await offPromise.finally(() => clearTimeout(timeoutId));
          if (results?.length) offMapped = mapOffToEcoProduct(results[0]);
        } catch {}

        const merged = mergeGeminiWithOFF(base, offMapped);
        toast({ title: 'Product Found! ✅', description: `${merged.productName} - Eco Score: ${merged.ecoScore}` });
        return { success: true, product: merged };
      }

      // 3) Fallback to EnhancedScoutBot
      const scoutResult = await EnhancedScoutBot.findProduct({ productName });
      if (scoutResult.success && scoutResult.product) {
        toast({ title: 'Product Found! ✅', description: `${scoutResult.product.productName} - Eco Score: ${scoutResult.product.ecoScore}` });
        return { success: true, product: scoutResult.product };
      }
      throw new Error('Product not found');

    } catch (error) {
      console.error('❌ Product lookup failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Lookup failed';
      
      toast({
        title: "Lookup Failed ❌",
        description: errorMessage,
        variant: "destructive",
      });

      return {
        success: false,
        error: errorMessage,
      };

    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  return {
    lookupBarcode,
    lookupProductName,
  isLoading,
  // Back-compat for components using `isLooking`
  isLooking: isLoading,
  };
};
