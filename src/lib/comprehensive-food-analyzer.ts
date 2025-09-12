/**
 * Comprehensive Food Health and Sustainability Analysis
 * AI-powered nutritional and environmental assessment system
 */

export interface FoodHealthScore {
  health_score: number;
  sustainability_score: number;
  overall_rating: 'excellent' | 'good' | 'fair' | 'poor';
  nutritional_analysis: {
    calories_per_serving?: number;
    protein_quality: 'high' | 'medium' | 'low';
    fiber_content: 'high' | 'medium' | 'low';
    sodium_level: 'low' | 'moderate' | 'high' | 'very_high';
    sugar_content: 'low' | 'moderate' | 'high' | 'very_high';
    additives_concern: 'none' | 'minimal' | 'moderate' | 'high';
  };
  environmental_impact: {
    carbon_footprint: 'low' | 'medium' | 'high';
    water_usage: 'low' | 'medium' | 'high';
    land_use: 'low' | 'medium' | 'high';
    biodiversity_impact: 'positive' | 'neutral' | 'negative';
  };
  health_benefits: string[];
  health_concerns: string[];
  eco_tips: string[];
  better_alternatives: string[];
}

export interface FoodData {
  product_name: string;
  ingredients?: string[];
  nutrition_facts?: any;
  origin?: string;
  organic?: boolean;
  brand?: string;
  category?: string;
  serving_size?: string;
  calories?: number;
  packaging_type?: string;
}

export class ComprehensiveFoodAnalyzer {
  /**
   * AI prompt for comprehensive food analysis
   */
  private static generateFoodAnalysisPrompt(foodData: FoodData): string {
    const ingredientsList = foodData.ingredients?.join(', ') || 'Not specified';
    
    return `You are a registered dietitian and environmental sustainability expert. Analyze this food product comprehensively for both health and environmental impact.

**FOOD PRODUCT:**
- Name: ${foodData.product_name}
- Ingredients: ${ingredientsList}
- Brand: ${foodData.brand || 'Unknown'}
- Category: ${foodData.category || 'Unknown'}
- Origin: ${foodData.origin || 'Unknown'}
- Organic: ${foodData.organic ? 'Yes' : 'No/Unknown'}
- Calories: ${foodData.calories || 'Unknown'}
- Serving Size: ${foodData.serving_size || 'Unknown'}

**COMPREHENSIVE ANALYSIS REQUIRED:**

1. **NUTRITIONAL HEALTH ASSESSMENT (0-100 scale)**
   - Protein quality and completeness
   - Fiber content and digestive benefits
   - Sodium levels and cardiovascular impact
   - Added sugars and metabolic effects
   - Artificial additives and preservatives
   - Vitamin and mineral density
   - Overall nutritional value

2. **ENVIRONMENTAL SUSTAINABILITY (0-100 scale)**
   - Carbon footprint of production
   - Water consumption in farming/processing
   - Land use efficiency
   - Impact on biodiversity
   - Packaging sustainability
   - Transportation distance
   - Seasonal availability

3. **HEALTH IMPACT ANALYSIS**
   - Immediate health benefits
   - Long-term health implications
   - Dietary restriction considerations
   - Allergen information
   - Digestibility factors

4. **ENVIRONMENTAL CONSIDERATIONS**
   - Farming practices impact
   - Processing energy requirements
   - Packaging waste generation
   - Supply chain sustainability
   - Local vs global sourcing

**OUTPUT FORMAT (JSON):**
{
  "health_score": 75,
  "sustainability_score": 60,
  "overall_rating": "good",
  "nutritional_analysis": {
    "protein_quality": "high",
    "fiber_content": "medium",
    "sodium_level": "moderate",
    "sugar_content": "low",
    "additives_concern": "minimal"
  },
  "environmental_impact": {
    "carbon_footprint": "medium",
    "water_usage": "low",
    "land_use": "medium",
    "biodiversity_impact": "neutral"
  },
  "health_benefits": [
    "High in essential amino acids",
    "Good source of dietary fiber",
    "Contains beneficial antioxidants"
  ],
  "health_concerns": [
    "Contains moderate sodium levels",
    "May contain allergens"
  ],
  "eco_tips": [
    "Choose organic when possible",
    "Buy local and seasonal varieties",
    "Consider packaging alternatives"
  ],
  "better_alternatives": [
    "Organic version of same product",
    "Local farmer's market equivalent",
    "Less processed alternative"
  ]
}

Provide evidence-based analysis with actionable recommendations for healthier and more sustainable food choices.`;
  }

  /**
   * Analyze food for health and sustainability
   */
  public static async analyzeFoodProduct(foodData: FoodData): Promise<FoodHealthScore> {
    try {
      const { Gemini } = await import('../integrations/gemini');
      const prompt = this.generateFoodAnalysisPrompt(foodData);
      
      const response = await Gemini.analyzeText(prompt);
      
      if (response && this.isValidFoodAnalysisResponse(response)) {
        return this.normalizeFoodAnalysisResponse(response);
      }
      
      // Fallback to heuristic analysis
      return this.calculateHeuristicFoodScore(foodData);
    } catch (error) {
      console.warn('AI food analysis failed, using heuristic approach:', error);
      return this.calculateHeuristicFoodScore(foodData);
    }
  }

  /**
   * Heuristic food analysis as fallback
   */
  private static calculateHeuristicFoodScore(foodData: FoodData): FoodHealthScore {
    const healthScore = this.calculateHealthScore(foodData);
    const sustainabilityScore = this.calculateSustainabilityScore(foodData);
    
    const overall_rating = this.determineOverallRating(healthScore, sustainabilityScore);

    return {
      health_score: healthScore,
      sustainability_score: sustainabilityScore,
      overall_rating,
      nutritional_analysis: this.analyzeNutrition(foodData),
      environmental_impact: this.analyzeEnvironmentalImpact(foodData),
      health_benefits: this.identifyHealthBenefits(foodData),
      health_concerns: this.identifyHealthConcerns(foodData),
      eco_tips: this.generateEcoTips(foodData),
      better_alternatives: this.suggestAlternatives(foodData)
    };
  }

  private static calculateHealthScore(foodData: FoodData): number {
    let score = 50; // Base score

    const ingredients = (foodData.ingredients || []).join(' ').toLowerCase();
    const productName = foodData.product_name.toLowerCase();
    const category = foodData.category?.toLowerCase() || '';

    // Positive health indicators
    if (ingredients.includes('whole grain')) score += 15;
    if (ingredients.includes('fiber') || ingredients.includes('oat')) score += 10;
    if (ingredients.includes('protein')) score += 10;
    if (foodData.organic) score += 10;
    if (ingredients.includes('vitamin') || ingredients.includes('mineral')) score += 8;

    // Negative health indicators
    if (ingredients.includes('sugar') || ingredients.includes('corn syrup')) score -= 15;
    if (ingredients.includes('artificial') || ingredients.includes('preservative')) score -= 10;
    if (ingredients.includes('sodium') || ingredients.includes('salt')) score -= 8;
    if (ingredients.includes('trans fat') || ingredients.includes('hydrogenated')) score -= 20;
    if (ingredients.includes('msg') || ingredients.includes('monosodium glutamate')) score -= 5;

    // Category adjustments
    if (category.includes('fruit') || category.includes('vegetable')) score += 20;
    if (category.includes('processed') || category.includes('snack')) score -= 15;
    if (category.includes('soda') || category.includes('candy')) score -= 25;
    if (category.includes('organic')) score += 10;

    // Product name indicators
    if (productName.includes('diet') || productName.includes('light')) score += 5;
    if (productName.includes('natural') || productName.includes('wholesome')) score += 8;

    return Math.max(0, Math.min(100, score));
  }

  private static calculateSustainabilityScore(foodData: FoodData): number {
    let score = 50; // Base score

    const category = foodData.category?.toLowerCase() || '';
    const productName = foodData.product_name.toLowerCase();

    // Organic bonus
    if (foodData.organic) score += 20;

    // Category-based sustainability
    if (category.includes('plant') || category.includes('vegetable') || category.includes('fruit')) {
      score += 15;
    }
    if (category.includes('meat') || category.includes('beef')) {
      score -= 20;
    }
    if (category.includes('dairy')) {
      score -= 10;
    }
    if (category.includes('seafood')) {
      score -= 5; // Depends on sourcing
    }

    // Local vs global
    if (foodData.origin) {
      // Simplified: assume local is better
      const localIndicators = ['local', 'regional', 'farm'];
      if (localIndicators.some(indicator => foodData.origin!.toLowerCase().includes(indicator))) {
        score += 15;
      }
    }

    // Processing level
    if (productName.includes('processed') || productName.includes('instant')) {
      score -= 10;
    }
    if (productName.includes('fresh') || productName.includes('raw')) {
      score += 10;
    }

    // Packaging considerations
    if (foodData.packaging_type) {
      const packaging = foodData.packaging_type.toLowerCase();
      if (packaging.includes('glass') || packaging.includes('aluminum')) score += 10;
      if (packaging.includes('plastic')) score -= 5;
      if (packaging.includes('minimal') || packaging.includes('bulk')) score += 15;
    }

    return Math.max(0, Math.min(100, score));
  }

  private static analyzeNutrition(foodData: FoodData) {
    const ingredients = (foodData.ingredients || []).join(' ').toLowerCase();
    
    return {
      protein_quality: this.assessProteinQuality(ingredients, foodData),
      fiber_content: this.assessFiberContent(ingredients, foodData),
      sodium_level: this.assessSodiumLevel(ingredients, foodData),
      sugar_content: this.assessSugarContent(ingredients, foodData),
      additives_concern: this.assessAdditivesConcern(ingredients, foodData)
    };
  }

  private static assessProteinQuality(ingredients: string, foodData: FoodData): 'high' | 'medium' | 'low' {
    if (ingredients.includes('meat') || ingredients.includes('fish') || 
        ingredients.includes('egg') || ingredients.includes('quinoa')) {
      return 'high';
    }
    if (ingredients.includes('bean') || ingredients.includes('lentil') || 
        ingredients.includes('nut') || ingredients.includes('seed')) {
      return 'medium';
    }
    return 'low';
  }

  private static assessFiberContent(ingredients: string, foodData: FoodData): 'high' | 'medium' | 'low' {
    if (ingredients.includes('whole grain') || ingredients.includes('fiber') || 
        ingredients.includes('bean') || ingredients.includes('oat')) {
      return 'high';
    }
    if (ingredients.includes('fruit') || ingredients.includes('vegetable')) {
      return 'medium';
    }
    return 'low';
  }

  private static assessSodiumLevel(ingredients: string, foodData: FoodData): 'low' | 'moderate' | 'high' | 'very_high' {
    if (ingredients.includes('sodium') || ingredients.includes('salt')) {
      if (ingredients.includes('high sodium') || ingredients.includes('salty')) {
        return 'very_high';
      }
      return 'high';
    }
    return 'low';
  }

  private static assessSugarContent(ingredients: string, foodData: FoodData): 'low' | 'moderate' | 'high' | 'very_high' {
    if (ingredients.includes('sugar') || ingredients.includes('syrup') || 
        ingredients.includes('fructose') || ingredients.includes('sucrose')) {
      if (ingredients.includes('high sugar') || ingredients.includes('candy')) {
        return 'very_high';
      }
      return 'high';
    }
    if (ingredients.includes('fruit')) {
      return 'moderate';
    }
    return 'low';
  }

  private static assessAdditivesConcern(ingredients: string, foodData: FoodData): 'none' | 'minimal' | 'moderate' | 'high' {
    if (ingredients.includes('artificial') || ingredients.includes('preservative') || 
        ingredients.includes('msg') || ingredients.includes('hydrogenated')) {
      return 'high';
    }
    if (ingredients.includes('natural flavor') || ingredients.includes('citric acid')) {
      return 'minimal';
    }
    return 'none';
  }

  private static analyzeEnvironmentalImpact(foodData: FoodData) {
    const category = foodData.category?.toLowerCase() || '';
    
    return {
      carbon_footprint: this.assessCarbonFootprint(category, foodData),
      water_usage: this.assessWaterUsage(category, foodData),
      land_use: this.assessLandUse(category, foodData),
      biodiversity_impact: this.assessBiodiversityImpact(category, foodData)
    };
  }

  private static assessCarbonFootprint(category: string, foodData: FoodData): 'low' | 'medium' | 'high' {
    if (category.includes('meat') || category.includes('beef')) return 'high';
    if (category.includes('dairy')) return 'medium';
    if (category.includes('plant') || category.includes('vegetable')) return 'low';
    return 'medium';
  }

  private static assessWaterUsage(category: string, foodData: FoodData): 'low' | 'medium' | 'high' {
    if (category.includes('meat') || category.includes('dairy')) return 'high';
    if (category.includes('nut') || category.includes('avocado')) return 'medium';
    return 'low';
  }

  private static assessLandUse(category: string, foodData: FoodData): 'low' | 'medium' | 'high' {
    if (category.includes('meat')) return 'high';
    if (category.includes('grain') || category.includes('cereal')) return 'medium';
    return 'low';
  }

  private static assessBiodiversityImpact(category: string, foodData: FoodData): 'positive' | 'neutral' | 'negative' {
    if (foodData.organic) return 'positive';
    if (category.includes('monoculture') || category.includes('industrial')) return 'negative';
    return 'neutral';
  }

  private static identifyHealthBenefits(foodData: FoodData): string[] {
    const benefits: string[] = [];
    const ingredients = (foodData.ingredients || []).join(' ').toLowerCase();
    const category = foodData.category?.toLowerCase() || '';

    if (ingredients.includes('fiber') || ingredients.includes('whole grain')) {
      benefits.push('Supports digestive health and satiety');
    }
    if (ingredients.includes('protein')) {
      benefits.push('Provides essential amino acids for muscle health');
    }
    if (category.includes('fruit') || category.includes('vegetable')) {
      benefits.push('Rich in vitamins, minerals, and antioxidants');
    }
    if (foodData.organic) {
      benefits.push('Reduced exposure to synthetic pesticides');
    }
    if (ingredients.includes('omega') || ingredients.includes('fish')) {
      benefits.push('Contains beneficial omega-3 fatty acids');
    }

    return benefits;
  }

  private static identifyHealthConcerns(foodData: FoodData): string[] {
    const concerns: string[] = [];
    const ingredients = (foodData.ingredients || []).join(' ').toLowerCase();

    if (ingredients.includes('sugar') || ingredients.includes('syrup')) {
      concerns.push('High sugar content may contribute to blood sugar spikes');
    }
    if (ingredients.includes('sodium') || ingredients.includes('salt')) {
      concerns.push('High sodium content may affect blood pressure');
    }
    if (ingredients.includes('artificial') || ingredients.includes('preservative')) {
      concerns.push('Contains artificial additives or preservatives');
    }
    if (ingredients.includes('trans fat') || ingredients.includes('hydrogenated')) {
      concerns.push('Contains unhealthy trans fats');
    }
    if (ingredients.includes('allergen')) {
      concerns.push('May contain common allergens');
    }

    return concerns;
  }

  private static generateEcoTips(foodData: FoodData): string[] {
    const tips: string[] = [];
    const category = foodData.category?.toLowerCase() || '';

    if (!foodData.organic) {
      tips.push('Consider choosing organic versions to support sustainable farming');
    }
    if (category.includes('meat')) {
      tips.push('Try reducing portion sizes or exploring plant-based alternatives');
    }
    tips.push('Buy local and seasonal when possible to reduce transportation impact');
    tips.push('Choose products with minimal or recyclable packaging');
    
    return tips;
  }

  private static suggestAlternatives(foodData: FoodData): string[] {
    const alternatives: string[] = [];
    const category = foodData.category?.toLowerCase() || '';
    const productName = foodData.product_name.toLowerCase();

    if (category.includes('snack')) {
      alternatives.push('Fresh fruits or vegetables with hummus');
      alternatives.push('Homemade trail mix with nuts and dried fruit');
    }
    if (category.includes('beverage') && !category.includes('water')) {
      alternatives.push('Filtered water with fresh fruit slices');
      alternatives.push('Herbal teas or sparkling water with natural flavors');
    }
    if (category.includes('processed')) {
      alternatives.push('Whole food versions of the same ingredients');
      alternatives.push('Homemade versions using simple ingredients');
    }

    return alternatives;
  }

  private static determineOverallRating(healthScore: number, sustainabilityScore: number): 'excellent' | 'good' | 'fair' | 'poor' {
    const averageScore = (healthScore + sustainabilityScore) / 2;
    
    if (averageScore >= 80) return 'excellent';
    if (averageScore >= 65) return 'good';
    if (averageScore >= 45) return 'fair';
    return 'poor';
  }

  private static isValidFoodAnalysisResponse(response: any): boolean {
    return response && 
           typeof response.health_score === 'number' &&
           typeof response.sustainability_score === 'number' &&
           response.nutritional_analysis &&
           response.environmental_impact;
  }

  private static normalizeFoodAnalysisResponse(response: any): FoodHealthScore {
    return {
      health_score: Math.max(0, Math.min(100, response.health_score)),
      sustainability_score: Math.max(0, Math.min(100, response.sustainability_score)),
      overall_rating: response.overall_rating || 'fair',
      nutritional_analysis: response.nutritional_analysis || {},
      environmental_impact: response.environmental_impact || {},
      health_benefits: Array.isArray(response.health_benefits) ? response.health_benefits : [],
      health_concerns: Array.isArray(response.health_concerns) ? response.health_concerns : [],
      eco_tips: Array.isArray(response.eco_tips) ? response.eco_tips : [],
      better_alternatives: Array.isArray(response.better_alternatives) ? response.better_alternatives : []
    };
  }
}
