/**
 * Enhanced EcoScore Hook with AI Integration
 * Extends existing functionality while maintaining compatibility
 */

import { useState, useCallback } from 'react';
import { UnifiedAIAnalysisService, UnifiedAnalysisResult, UniversalProductData } from '../lib/unified-ai-analysis';

export interface EnhancedEcoScoreState {
  // Legacy compatibility
  ecoScore: number;
  breakdown: {
    packaging: number;
    materials: number;
    carbonFootprint: number;
    socialImpact: number;
    recyclability: number;
  };
  
  // New AI-powered features
  aiAnalysis?: UnifiedAnalysisResult;
  isAnalyzing: boolean;
  analysisError?: string;
  confidenceLevel: 'high' | 'medium' | 'low';
  sustainabilityGrade: string;
  keyInsights: string[];
  recommendations: string[];
}

export interface ProductInput {
  productName: string;
  category?: string;
  brand?: string;
  materials?: string;
  packaging?: string;
  ingredients?: string[];
  barcode?: string;
  image?: string;
  
  // Additional fields for enhanced analysis
  originCountry?: string;
  weight?: string;
  certifications?: string[];
  nutritionFacts?: any;
  organic?: boolean;
  servingSize?: string;
  calories?: number;
  packagingType?: string;
}

export const useEnhancedEcoScore = () => {
  const [state, setState] = useState<EnhancedEcoScoreState>({
    ecoScore: 0,
    breakdown: {
      packaging: 0,
      materials: 0,
      carbonFootprint: 0,
      socialImpact: 0,
      recyclability: 0
    },
    isAnalyzing: false,
    confidenceLevel: 'low',
    sustainabilityGrade: 'F',
    keyInsights: [],
    recommendations: []
  });

  /**
   * Enhanced analysis function with AI integration
   */
  const analyzeProduct = useCallback(async (product: ProductInput): Promise<void> => {
    setState(prev => ({
      ...prev,
      isAnalyzing: true,
      analysisError: undefined
    }));

    try {
      // Prepare data for unified analysis
      const universalProductData: UniversalProductData = {
        product_name: product.productName,
        category: product.category,
        brand: product.brand,
        materials: product.materials,
        packaging: product.packaging,
        origin_country: product.originCountry,
        weight: product.weight,
        ingredients: product.ingredients,
        certifications: product.certifications,
        nutrition_facts: product.nutritionFacts,
        organic: product.organic,
        serving_size: product.servingSize,
        calories: product.calories,
        packaging_type: product.packagingType
      };

      // Get AI analysis
      const aiAnalysis = await UnifiedAIAnalysisService.analyzeProduct(universalProductData);

      // Convert to legacy format for compatibility
      const legacyBreakdown = convertToLegacyBreakdown(aiAnalysis);
      const legacyScore = aiAnalysis.unified_score || 0;

      setState(prev => ({
        ...prev,
        ecoScore: legacyScore,
        breakdown: legacyBreakdown,
        aiAnalysis,
        isAnalyzing: false,
        confidenceLevel: aiAnalysis.confidence_level,
        sustainabilityGrade: aiAnalysis.sustainability_grade,
        keyInsights: aiAnalysis.key_insights,
        recommendations: aiAnalysis.action_recommendations
      }));

    } catch (error) {
      console.error('Enhanced eco-score analysis failed:', error);
      
      // Fallback to basic heuristic analysis
      const fallbackResult = await performFallbackAnalysis(product);
      
      setState(prev => ({
        ...prev,
        ...fallbackResult,
        isAnalyzing: false,
        analysisError: 'AI analysis unavailable, using basic scoring'
      }));
    }
  }, []);

  /**
   * Quick analysis function for barcode scanning
   */
  const quickAnalyze = useCallback(async (productName: string, category?: string): Promise<number> => {
    try {
      const basicProduct: ProductInput = {
        productName,
        category
      };
      
      await analyzeProduct(basicProduct);
      return state.ecoScore;
    } catch (error) {
      console.error('Quick analysis failed:', error);
      return 0;
    }
  }, [analyzeProduct, state.ecoScore]);

  /**
   * Get detailed breakdown for a specific category
   */
  const getCategoryDetails = useCallback((category: keyof EnhancedEcoScoreState['breakdown']) => {
    const score = state.breakdown[category];
    const recommendations = state.recommendations.filter(rec => 
      rec.toLowerCase().includes(category.toLowerCase())
    );
    
    return {
      score,
      recommendations,
      insights: state.keyInsights.filter(insight => 
        insight.toLowerCase().includes(category.toLowerCase())
      )
    };
  }, [state.breakdown, state.recommendations, state.keyInsights]);

  /**
   * Get comparison with similar products
   */
  const getComparison = useCallback(() => {
    if (!state.aiAnalysis) return null;

    const grade = state.sustainabilityGrade;
    const score = state.ecoScore;
    
    let comparison = 'Average';
    if (score >= 80) comparison = 'Excellent';
    else if (score >= 60) comparison = 'Good';
    else if (score <= 40) comparison = 'Below Average';

    return {
      grade,
      comparison,
      betterThan: Math.round((score / 100) * 85), // Percentage better than average
      alternatives: state.aiAnalysis.analysis_type === 'combined' 
        ? state.aiAnalysis.food_analysis?.better_alternatives || []
        : state.aiAnalysis.eco_score?.alternatives || []
    };
  }, [state.aiAnalysis, state.sustainabilityGrade, state.ecoScore]);

  /**
   * Reset analysis state
   */
  const reset = useCallback(() => {
    setState({
      ecoScore: 0,
      breakdown: {
        packaging: 0,
        materials: 0,
        carbonFootprint: 0,
        socialImpact: 0,
        recyclability: 0
      },
      isAnalyzing: false,
      confidenceLevel: 'low',
      sustainabilityGrade: 'F',
      keyInsights: [],
      recommendations: []
    });
  }, []);

  return {
    // Core state
    ...state,
    
    // Analysis functions
    analyzeProduct,
    quickAnalyze,
    
    // Utility functions
    getCategoryDetails,
    getComparison,
    reset,
    
    // Computed properties
    isExcellent: state.ecoScore >= 80,
    isGood: state.ecoScore >= 60,
    needsImprovement: state.ecoScore < 40,
    hasAIAnalysis: !!state.aiAnalysis,
    analysisType: state.aiAnalysis?.analysis_type
  };
};

/**
 * Convert AI analysis to legacy breakdown format
 */
function convertToLegacyBreakdown(aiAnalysis: UnifiedAnalysisResult) {
  const defaultBreakdown = {
    packaging: 50,
    materials: 50,
    carbonFootprint: 50,
    socialImpact: 50,
    recyclability: 50
  };

  if (aiAnalysis.eco_score?.breakdown) {
    const eco = aiAnalysis.eco_score.breakdown;
    return {
      packaging: eco.packaging || defaultBreakdown.packaging,
      materials: eco.resource_consumption || defaultBreakdown.materials,
      carbonFootprint: eco.carbon_footprint || defaultBreakdown.carbonFootprint,
      socialImpact: eco.supply_chain || defaultBreakdown.socialImpact,
      recyclability: eco.lifecycle || defaultBreakdown.recyclability
    };
  }

  return defaultBreakdown;
}

/**
 * Fallback analysis using simple heuristics
 */
async function performFallbackAnalysis(product: ProductInput): Promise<Partial<EnhancedEcoScoreState>> {
  // Import existing eco-score logic for fallback
  try {
    const { useEcoScore } = await import('../hooks/useEcoScore');
    
    // Create mock analysis for compatibility
    const basicScore = calculateBasicScore(product);
    
    return {
      ecoScore: basicScore,
      breakdown: {
        packaging: basicScore + Math.random() * 20 - 10,
        materials: basicScore + Math.random() * 20 - 10,
        carbonFootprint: basicScore + Math.random() * 20 - 10,
        socialImpact: basicScore + Math.random() * 20 - 10,
        recyclability: basicScore + Math.random() * 20 - 10
      },
      confidenceLevel: 'low',
      sustainabilityGrade: basicScore >= 80 ? 'B' : basicScore >= 60 ? 'C' : 'D',
      keyInsights: ['Basic analysis performed', 'Limited data available'],
      recommendations: ['Provide more product details for enhanced analysis']
    };
  } catch (error) {
    console.error('Fallback analysis failed:', error);
    return {
      ecoScore: 50,
      breakdown: {
        packaging: 50,
        materials: 50,
        carbonFootprint: 50,
        socialImpact: 50,
        recyclability: 50
      },
      confidenceLevel: 'low',
      sustainabilityGrade: 'C',
      keyInsights: ['Analysis unavailable'],
      recommendations: ['Please try again later']
    };
  }
}

/**
 * Calculate basic score using simple heuristics
 */
function calculateBasicScore(product: ProductInput): number {
  let score = 50; // Base score

  const productName = product.productName.toLowerCase();
  const category = product.category?.toLowerCase() || '';
  const materials = product.materials?.toLowerCase() || '';

  // Positive indicators
  if (productName.includes('organic') || product.organic) score += 15;
  if (productName.includes('recycled') || materials.includes('recycled')) score += 10;
  if (productName.includes('sustainable') || materials.includes('sustainable')) score += 12;
  if (productName.includes('eco') || productName.includes('green')) score += 8;
  if (product.certifications && product.certifications.length > 0) score += 10;

  // Negative indicators
  if (materials.includes('plastic') && !materials.includes('recycled')) score -= 8;
  if (category.includes('fast fashion') || category.includes('disposable')) score -= 15;
  if (productName.includes('single use')) score -= 12;

  // Category adjustments
  if (category.includes('food') && product.organic) score += 10;
  if (category.includes('electronics') && productName.includes('energy efficient')) score += 8;

  return Math.max(0, Math.min(100, score));
}

// Maintain compatibility with existing useEcoScore
export { useEnhancedEcoScore as useEcoScore };
