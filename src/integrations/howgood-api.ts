/**
 * HowGood API Integration
 * 
 * HowGood provides comprehensive supply chain and environmental impact data
 * for food and consumer products.
 * 
 * API Features:
 * - 33,000+ ingredient database
 * - Supply chain transparency scores
 * - Carbon footprint calculations
 * - Water usage metrics
 * - Labor condition assessments
 * - Biodiversity impact scores
 */

export interface HowGoodResponse {
  product_id?: string;
  sustainability_score: number; // 0-100
  carbon_footprint: number; // kg CO2 equivalent
  water_usage: number; // liters
  land_use: number; // m² equivalent
  biodiversity_score: number; // 0-100
  transparency_score: number; // 0-100
  labor_score: number; // 0-100
  supply_chain_risk: 'low' | 'medium' | 'high';
  certifications: string[];
  renewable_energy: number; // percentage
  pollution: number; // 0-100 scale
  ingredients_analysis: Array<{
    ingredient: string;
    sustainability_score: number;
    impact_factors: string[];
  }>;
}

export class HowGoodAPI {
  private static readonly API_URL = 'https://api.howgood.com/v1';
  private static readonly API_KEY = (import.meta as any).env?.VITE_HOWGOOD_API_KEY || '';
  
  /**
   * Analyze supply chain and environmental impact
   */
  static async analyzeSupplyChain(productData: any): Promise<HowGoodResponse> {
    if (!this.API_KEY) {
      console.warn('HowGood API key not available, using estimation');
      return this.generateEstimatedResponse(productData);
    }
    
    try {
      const payload = {
        product_name: productData.product_name,
        brand: productData.brand,
        category: productData.category,
        ingredients: productData.ingredients_text?.split(',').map((i: string) => i.trim()) || [],
        origin_countries: productData.origins?.split(',').map((o: string) => o.trim()) || [],
        manufacturing_places: productData.manufacturing_places?.split(',').map((m: string) => m.trim()) || []
      };
      
      const response = await fetch(`${this.API_URL}/products/analyze`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        throw new Error(`HowGood API error: ${response.status}`);
      }
      
      const data = await response.json();
      return this.mapApiResponse(data);
      
    } catch (error) {
      console.warn('HowGood API failed, using intelligent estimation:', error);
      return this.generateEstimatedResponse(productData);
    }
  }
  
  /**
   * Search for ingredient-specific sustainability data
   */
  static async analyzeIngredients(ingredients: string[]): Promise<Array<{
    ingredient: string;
    sustainability_score: number;
    carbon_footprint: number;
    water_usage: number;
    impact_factors: string[];
  }>> {
    if (!this.API_KEY) {
      return this.estimateIngredientsImpact(ingredients);
    }
    
    try {
      const response = await fetch(`${this.API_URL}/ingredients/batch`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ingredients })
      });
      
      if (!response.ok) {
        throw new Error(`HowGood ingredients API error: ${response.status}`);
      }
      
      return await response.json();
      
    } catch (error) {
      console.warn('HowGood ingredients API failed:', error);
      return this.estimateIngredientsImpact(ingredients);
    }
  }
  
  private static mapApiResponse(apiData: any): HowGoodResponse {
    return {
      product_id: apiData.id,
      sustainability_score: apiData.overall_score || 60,
      carbon_footprint: apiData.carbon_footprint_kg || 3.5,
      water_usage: apiData.water_usage_liters || 100,
      land_use: apiData.land_use_m2 || 25,
      biodiversity_score: apiData.biodiversity_impact || 70,
      transparency_score: apiData.supply_chain_transparency || 50,
      labor_score: apiData.labor_conditions || 65,
      supply_chain_risk: apiData.risk_level || 'medium',
      certifications: apiData.certifications || [],
      renewable_energy: apiData.renewable_energy_percent || 30,
      pollution: apiData.pollution_score || 40,
      ingredients_analysis: apiData.ingredients || []
    };
  }
  
  /**
   * Generate intelligent estimations when API is unavailable
   */
  private static generateEstimatedResponse(productData: any): HowGoodResponse {
    const category = productData.category?.toLowerCase() || 'unknown';
    const hasOrganic = productData.labels?.some((label: string) => 
      label.toLowerCase().includes('organic')
    ) || false;
    
    // Category-based sustainability scoring
    const categoryScores: Record<string, Partial<HowGoodResponse>> = {
      'organic': {
        sustainability_score: 85,
        carbon_footprint: 2.1,
        water_usage: 80,
        biodiversity_score: 90,
        transparency_score: 75,
        labor_score: 80,
        supply_chain_risk: 'low',
        renewable_energy: 60,
        pollution: 20
      },
      'meat': {
        sustainability_score: 25,
        carbon_footprint: 15.5,
        water_usage: 1500,
        biodiversity_score: 30,
        transparency_score: 40,
        labor_score: 50,
        supply_chain_risk: 'high',
        renewable_energy: 15,
        pollution: 75
      },
      'dairy': {
        sustainability_score: 35,
        carbon_footprint: 8.2,
        water_usage: 800,
        biodiversity_score: 45,
        transparency_score: 55,
        labor_score: 60,
        supply_chain_risk: 'medium',
        renewable_energy: 20,
        pollution: 60
      },
      'vegetables': {
        sustainability_score: 80,
        carbon_footprint: 1.8,
        water_usage: 50,
        biodiversity_score: 85,
        transparency_score: 70,
        labor_score: 70,
        supply_chain_risk: 'low',
        renewable_energy: 45,
        pollution: 25
      },
      'processed': {
        sustainability_score: 45,
        carbon_footprint: 4.5,
        water_usage: 200,
        biodiversity_score: 55,
        transparency_score: 35,
        labor_score: 55,
        supply_chain_risk: 'medium',
        renewable_energy: 25,
        pollution: 55
      }
    };
    
    let baseScore = categoryScores[category] || categoryScores['processed'];
    
    // Apply organic boost
    if (hasOrganic) {
      baseScore = {
        ...baseScore,
        sustainability_score: Math.min(100, (baseScore.sustainability_score || 50) + 15),
        carbon_footprint: (baseScore.carbon_footprint || 3.0) * 0.8,
        biodiversity_score: Math.min(100, (baseScore.biodiversity_score || 60) + 10),
        supply_chain_risk: 'low' as const,
        renewable_energy: Math.min(100, (baseScore.renewable_energy || 30) + 20)
      };
    }
    
    // Analyze ingredients if available
    const ingredients_analysis = this.analyzeIngredientsText(productData.ingredients_text);
    
    return {
      sustainability_score: baseScore.sustainability_score || 60,
      carbon_footprint: baseScore.carbon_footprint || 3.5,
      water_usage: baseScore.water_usage || 100,
      land_use: 25,
      biodiversity_score: baseScore.biodiversity_score || 70,
      transparency_score: baseScore.transparency_score || 50,
      labor_score: baseScore.labor_score || 65,
      supply_chain_risk: baseScore.supply_chain_risk || 'medium',
      certifications: this.extractCertifications(productData),
      renewable_energy: baseScore.renewable_energy || 30,
      pollution: baseScore.pollution || 40,
      ingredients_analysis
    };
  }
  
  private static analyzeIngredientsText(ingredientsText?: string): Array<{
    ingredient: string;
    sustainability_score: number;
    impact_factors: string[];
  }> {
    if (!ingredientsText) return [];
    
    const ingredients = ingredientsText.split(',').map(i => i.trim()).slice(0, 5); // Top 5
    
    return ingredients.map(ingredient => {
      const impact_factors = [];
      let score = 60; // Base score
      
      const lower = ingredient.toLowerCase();
      
      // Analyze ingredient sustainability
      if (lower.includes('organic')) {
        score += 20;
        impact_factors.push('Organic certification');
      }
      if (lower.includes('palm oil')) {
        score -= 30;
        impact_factors.push('Deforestation risk', 'Biodiversity impact');
      }
      if (lower.includes('sugar') || lower.includes('corn syrup')) {
        score -= 10;
        impact_factors.push('Water intensive', 'Processing energy');
      }
      if (lower.includes('soy')) {
        score -= 15;
        impact_factors.push('Land use', 'Monoculture farming');
      }
      
      return {
        ingredient,
        sustainability_score: Math.max(0, Math.min(100, score)),
        impact_factors
      };
    });
  }
  
  private static extractCertifications(productData: any): string[] {
    const certs = [];
    const labels = productData.labels || [];
    
    for (const label of labels) {
      const lower = label.toLowerCase();
      if (lower.includes('organic')) certs.push('USDA Organic');
      if (lower.includes('fair trade')) certs.push('Fair Trade');
      if (lower.includes('rainforest')) certs.push('Rainforest Alliance');
      if (lower.includes('non-gmo')) certs.push('Non-GMO');
    }
    
    return [...new Set(certs)]; // Remove duplicates
  }
  
  private static estimateIngredientsImpact(ingredients: string[]) {
    return ingredients.slice(0, 5).map(ingredient => ({
      ingredient,
      sustainability_score: 60,
      carbon_footprint: 2.5,
      water_usage: 75,
      impact_factors: ['Estimated based on category']
    }));
  }
}