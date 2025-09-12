/**
 * Unified AI-Powered Analysis Service
 * Combines enhanced eco-scoring with comprehensive food analysis
 */

import { EnhancedEcoScoringAlgorithm, EcoScoreBreakdown, ProductData } from './enhanced-eco-scoring';
import { ComprehensiveFoodAnalyzer, FoodHealthScore, FoodData } from './comprehensive-food-analyzer';

export interface UnifiedAnalysisResult {
  product_name: string;
  analysis_type: 'eco_only' | 'food_only' | 'combined';
  eco_score?: EcoScoreBreakdown;
  food_analysis?: FoodHealthScore;
  unified_score?: number;
  key_insights: string[];
  action_recommendations: string[];
  sustainability_grade: 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F';
  confidence_level: 'high' | 'medium' | 'low';
}

export interface UniversalProductData {
  product_name: string;
  category?: string;
  brand?: string;
  materials?: string;
  packaging?: string;
  origin_country?: string;
  weight?: string;
  ingredients?: string[];
  certifications?: string[];
  nutrition_facts?: any;
  organic?: boolean;
  serving_size?: string;
  calories?: number;
  packaging_type?: string;
}

export class UnifiedAIAnalysisService {
  /**
   * Main analysis method that determines the best approach
   */
  public static async analyzeProduct(productData: UniversalProductData): Promise<UnifiedAnalysisResult> {
    const analysisType = this.determineAnalysisType(productData);
    
    try {
      switch (analysisType) {
        case 'food_only':
          return await this.performFoodAnalysis(productData);
        
        case 'eco_only':
          return await this.performEcoAnalysis(productData);
        
        case 'combined':
          return await this.performCombinedAnalysis(productData);
        
        default:
          return await this.performEcoAnalysis(productData);
      }
    } catch (error) {
      console.error('Analysis failed:', error);
      return this.createFallbackAnalysis(productData);
    }
  }

  /**
   * Determine what type of analysis is most appropriate
   */
  private static determineAnalysisType(productData: UniversalProductData): 'eco_only' | 'food_only' | 'combined' {
    const category = productData.category?.toLowerCase() || '';
    const productName = productData.product_name.toLowerCase();
    
    const foodCategories = [
      'food', 'beverage', 'snack', 'grocery', 'organic', 'nutrition',
      'fruit', 'vegetable', 'meat', 'dairy', 'grain', 'cereal'
    ];
    
    const hasIngredients = productData.ingredients && productData.ingredients.length > 0;
    const hasNutrition = productData.nutrition_facts || productData.calories;
    const isFoodProduct = foodCategories.some(cat => 
      category.includes(cat) || productName.includes(cat)
    );
    
    if ((isFoodProduct || hasIngredients || hasNutrition) && 
        (productData.materials || productData.packaging)) {
      return 'combined';
    } else if (isFoodProduct || hasIngredients || hasNutrition) {
      return 'food_only';
    } else {
      return 'eco_only';
    }
  }

  /**
   * Perform comprehensive food analysis
   */
  private static async performFoodAnalysis(productData: UniversalProductData): Promise<UnifiedAnalysisResult> {
    const foodData: FoodData = {
      product_name: productData.product_name,
      ingredients: productData.ingredients,
      nutrition_facts: productData.nutrition_facts,
      origin: productData.origin_country,
      organic: productData.organic,
      brand: productData.brand,
      category: productData.category,
      serving_size: productData.serving_size,
      calories: productData.calories,
      packaging_type: productData.packaging_type
    };

    const foodAnalysis = await ComprehensiveFoodAnalyzer.analyzeFoodProduct(foodData);
    
    return {
      product_name: productData.product_name,
      analysis_type: 'food_only',
      food_analysis: foodAnalysis,
      unified_score: (foodAnalysis.health_score + foodAnalysis.sustainability_score) / 2,
      key_insights: this.extractFoodInsights(foodAnalysis),
      action_recommendations: this.generateFoodRecommendations(foodAnalysis),
      sustainability_grade: this.calculateGrade(foodAnalysis.sustainability_score),
      confidence_level: this.assessConfidence(productData)
    };
  }

  /**
   * Perform eco-scoring analysis
   */
  private static async performEcoAnalysis(productData: UniversalProductData): Promise<UnifiedAnalysisResult> {
    const ecoData: ProductData = {
      product_name: productData.product_name,
      category: productData.category,
      brand: productData.brand,
      materials: productData.materials,
      packaging: productData.packaging,
      origin_country: productData.origin_country,
      weight: productData.weight,
      ingredients: productData.ingredients,
      certifications: productData.certifications
    };

    const ecoScore = await EnhancedEcoScoringAlgorithm.calculateAIEcoScore(ecoData);
    
    return {
      product_name: productData.product_name,
      analysis_type: 'eco_only',
      eco_score: ecoScore,
      unified_score: ecoScore.overall_score,
      key_insights: this.extractEcoInsights(ecoScore),
      action_recommendations: this.generateEcoRecommendations(ecoScore),
      sustainability_grade: this.calculateGrade(ecoScore.overall_score),
      confidence_level: ecoScore.confidence
    };
  }

  /**
   * Perform combined analysis for food products with environmental impact
   */
  private static async performCombinedAnalysis(productData: UniversalProductData): Promise<UnifiedAnalysisResult> {
    const [foodResult, ecoResult] = await Promise.all([
      this.performFoodAnalysis(productData),
      this.performEcoAnalysis(productData)
    ]);

    const unifiedScore = this.calculateUnifiedScore(
      foodResult.food_analysis!,
      ecoResult.eco_score!
    );

    return {
      product_name: productData.product_name,
      analysis_type: 'combined',
      food_analysis: foodResult.food_analysis,
      eco_score: ecoResult.eco_score,
      unified_score: unifiedScore,
      key_insights: this.combinedInsights(foodResult, ecoResult),
      action_recommendations: this.combinedRecommendations(foodResult, ecoResult),
      sustainability_grade: this.calculateGrade(unifiedScore),
      confidence_level: this.assessCombinedConfidence(foodResult, ecoResult)
    };
  }

  /**
   * Calculate unified score for combined analysis
   */
  private static calculateUnifiedScore(foodAnalysis: FoodHealthScore, ecoScore: EcoScoreBreakdown): number {
    // Weight health and environmental factors
    const healthWeight = 0.4;
    const sustainabilityWeight = 0.6;
    
    const healthScore = foodAnalysis.health_score;
    const envScore = (foodAnalysis.sustainability_score + ecoScore.overall_score) / 2;
    
    return Math.round(healthScore * healthWeight + envScore * sustainabilityWeight);
  }

  /**
   * Extract key insights from food analysis
   */
  private static extractFoodInsights(analysis: FoodHealthScore): string[] {
    const insights: string[] = [];
    
    // Health insights
    if (analysis.health_score >= 80) {
      insights.push('Excellent nutritional profile with high health benefits');
    } else if (analysis.health_score <= 40) {
      insights.push('Consider healthier alternatives for better nutrition');
    }
    
    // Sustainability insights
    if (analysis.sustainability_score >= 75) {
      insights.push('Environmentally friendly food choice');
    } else if (analysis.sustainability_score <= 45) {
      insights.push('High environmental impact - consider sustainable alternatives');
    }
    
    // Add specific benefits and concerns
    insights.push(...analysis.health_benefits.slice(0, 2));
    if (analysis.health_concerns.length > 0) {
      insights.push(analysis.health_concerns[0]);
    }
    
    return insights;
  }

  /**
   * Extract key insights from eco analysis
   */
  private static extractEcoInsights(ecoScore: EcoScoreBreakdown): string[] {
    const insights: string[] = [...ecoScore.insights];
    
    // Add breakdown insights
    const breakdown = ecoScore.breakdown;
    const maxCategory = Object.entries(breakdown).reduce((a, b) => 
      breakdown[a[0] as keyof typeof breakdown] > breakdown[b[0] as keyof typeof breakdown] ? a : b
    );
    
    insights.push(`Strongest performance in ${maxCategory[0].replace('_', ' ')}`);
    
    return insights.slice(0, 4);
  }

  /**
   * Generate recommendations for food products
   */
  private static generateFoodRecommendations(analysis: FoodHealthScore): string[] {
    const recommendations: string[] = [];
    
    // Health recommendations
    if (analysis.nutritional_analysis.sodium_level === 'high' || 
        analysis.nutritional_analysis.sodium_level === 'very_high') {
      recommendations.push('Look for low-sodium alternatives');
    }
    
    if (analysis.nutritional_analysis.sugar_content === 'high' || 
        analysis.nutritional_analysis.sugar_content === 'very_high') {
      recommendations.push('Choose products with less added sugar');
    }
    
    // Add eco tips and alternatives
    recommendations.push(...analysis.eco_tips.slice(0, 2));
    recommendations.push(...analysis.better_alternatives.slice(0, 2));
    
    return recommendations.slice(0, 4);
  }

  /**
   * Generate recommendations for eco analysis
   */
  private static generateEcoRecommendations(ecoScore: EcoScoreBreakdown): string[] {
    const recommendations: string[] = [];
    
    // Add alternatives and insights
    recommendations.push(...ecoScore.alternatives.slice(0, 2));
    
    // Add improvement suggestions based on lowest scoring category
    const breakdown = ecoScore.breakdown;
    const minCategory = Object.entries(breakdown).reduce((a, b) => 
      breakdown[a[0] as keyof typeof breakdown] < breakdown[b[0] as keyof typeof breakdown] ? a : b
    );
    
    switch (minCategory[0]) {
      case 'packaging':
        recommendations.push('Choose products with recyclable or minimal packaging');
        break;
      case 'carbon_footprint':
        recommendations.push('Look for locally sourced or carbon-neutral options');
        break;
      case 'supply_chain':
        recommendations.push('Support brands with fair trade and ethical practices');
        break;
    }
    
    return recommendations.slice(0, 4);
  }

  /**
   * Combine insights from both analyses
   */
  private static combinedInsights(foodResult: UnifiedAnalysisResult, ecoResult: UnifiedAnalysisResult): string[] {
    const combined = [
      ...foodResult.key_insights.slice(0, 2),
      ...ecoResult.key_insights.slice(0, 2)
    ];
    
    // Add unified insight
    const avgScore = (foodResult.unified_score! + ecoResult.unified_score!) / 2;
    if (avgScore >= 75) {
      combined.unshift('Excellent choice for both health and environment');
    } else if (avgScore <= 45) {
      combined.unshift('Consider alternatives for better health and environmental impact');
    }
    
    return combined.slice(0, 5);
  }

  /**
   * Combine recommendations from both analyses
   */
  private static combinedRecommendations(foodResult: UnifiedAnalysisResult, ecoResult: UnifiedAnalysisResult): string[] {
    return [
      ...foodResult.action_recommendations.slice(0, 2),
      ...ecoResult.action_recommendations.slice(0, 2)
    ].slice(0, 4);
  }

  /**
   * Calculate letter grade from numeric score
   */
  private static calculateGrade(score: number): 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F' {
    if (score >= 95) return 'A+';
    if (score >= 90) return 'A';
    if (score >= 85) return 'B+';
    if (score >= 80) return 'B';
    if (score >= 75) return 'C+';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }

  /**
   * Assess confidence level based on available data
   */
  private static assessConfidence(productData: UniversalProductData): 'high' | 'medium' | 'low' {
    let dataPoints = 0;
    
    if (productData.ingredients && productData.ingredients.length > 0) dataPoints++;
    if (productData.nutrition_facts || productData.calories) dataPoints++;
    if (productData.materials) dataPoints++;
    if (productData.packaging) dataPoints++;
    if (productData.origin_country) dataPoints++;
    if (productData.certifications && productData.certifications.length > 0) dataPoints++;
    if (productData.brand) dataPoints++;
    if (productData.category) dataPoints++;
    
    if (dataPoints >= 6) return 'high';
    if (dataPoints >= 4) return 'medium';
    return 'low';
  }

  /**
   * Assess confidence for combined analysis
   */
  private static assessCombinedConfidence(
    foodResult: UnifiedAnalysisResult, 
    ecoResult: UnifiedAnalysisResult
  ): 'high' | 'medium' | 'low' {
    const confidenceLevels = { high: 3, medium: 2, low: 1 };
    const avgConfidence = (
      confidenceLevels[foodResult.confidence_level] + 
      confidenceLevels[ecoResult.confidence_level]
    ) / 2;
    
    if (avgConfidence >= 2.5) return 'high';
    if (avgConfidence >= 1.5) return 'medium';
    return 'low';
  }

  /**
   * Create fallback analysis when AI fails
   */
  private static createFallbackAnalysis(productData: UniversalProductData): UnifiedAnalysisResult {
    return {
      product_name: productData.product_name,
      analysis_type: 'eco_only',
      unified_score: 50,
      key_insights: [
        'Basic analysis performed due to limited data',
        'Consider providing more product information for detailed insights'
      ],
      action_recommendations: [
        'Look for products with clear sustainability certifications',
        'Choose items with minimal packaging when possible'
      ],
      sustainability_grade: 'C',
      confidence_level: 'low'
    };
  }
}
