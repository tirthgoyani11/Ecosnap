/**
 * Enhanced AI-Powered Eco-Scoring Algorithm
 * Based on the latest environmental science and sustainability research
 * Provides comprehensive analysis with weighted scoring system
 */

export interface EcoScoreBreakdown {
  overall_score: number;
  confidence: 'high' | 'medium' | 'low';
  breakdown: {
    carbon_footprint: number;
    resource_consumption: number;
    packaging: number;
    supply_chain: number;
    lifecycle: number;
  };
  insights: string[];
  alternatives: string[];
  certifications: string[];
  impact_summary: string;
}

export interface ProductData {
  product_name: string;
  category?: string;
  brand?: string;
  materials?: string;
  packaging?: string;
  origin_country?: string;
  weight?: string;
  ingredients?: string[];
  certifications?: string[];
}

export class EnhancedEcoScoringAlgorithm {
  private static readonly WEIGHTS = {
    CARBON_FOOTPRINT: 0.30,
    RESOURCE_CONSUMPTION: 0.25,
    PACKAGING: 0.20,
    SUPPLY_CHAIN: 0.15,
    LIFECYCLE: 0.10
  };

  /**
   * Main AI prompt for comprehensive eco-score analysis
   */
  private static generateEcoScorePrompt(productData: ProductData): string {
    return `You are an expert environmental scientist and sustainability analyst. Analyze the given product and provide a comprehensive eco-score between 0-100, where 100 is the most environmentally friendly.

**PRODUCT DATA:**
- Name: ${productData.product_name}
- Category: ${productData.category || 'Unknown'}
- Brand: ${productData.brand || 'Unknown'}
- Materials: ${productData.materials || 'Unknown'}
- Packaging: ${productData.packaging || 'Unknown'}
- Origin: ${productData.origin_country || 'Unknown'}
- Weight: ${productData.weight || 'Unknown'}

**ANALYSIS REQUIREMENTS:**

1. **CARBON FOOTPRINT (30% weight)**
   - Manufacturing emissions
   - Transportation distance and method
   - Raw material extraction impact
   - End-of-life disposal emissions

2. **RESOURCE CONSUMPTION (25% weight)**
   - Water usage in production
   - Energy consumption (renewable vs non-renewable)
   - Land use and deforestation impact
   - Rare materials or minerals usage

3. **PACKAGING SUSTAINABILITY (20% weight)**
   - Material recyclability (plastic, glass, cardboard, etc.)
   - Packaging waste volume
   - Single-use vs reusable design
   - Biodegradability of packaging materials

4. **SUPPLY CHAIN ETHICS (15% weight)**
   - Fair trade certifications
   - Labor practices
   - Local vs global sourcing
   - Corporate sustainability commitments

5. **LIFECYCLE IMPACT (10% weight)**
   - Product durability and lifespan
   - Repair and maintenance requirements
   - Upgrade potential vs replacement needs
   - Disposal and recycling options

**OUTPUT FORMAT (JSON):**
{
  "overall_score": 75,
  "confidence": "high",
  "breakdown": {
    "carbon_footprint": 22,
    "resource_consumption": 18,
    "packaging": 16,
    "supply_chain": 12,
    "lifecycle": 7
  },
  "insights": [
    "Specific environmental strengths",
    "Key areas for improvement",
    "Comparison to category average"
  ],
  "alternatives": [
    "Better eco-friendly options",
    "Specific improvement suggestions"
  ],
  "certifications": ["organic", "fair-trade", "carbon-neutral"],
  "impact_summary": "Brief environmental impact description"
}

Ensure accuracy and provide actionable insights for consumers making eco-conscious choices.`;
  }

  /**
   * Calculate eco-score using AI analysis
   */
  public static async calculateAIEcoScore(productData: ProductData): Promise<EcoScoreBreakdown> {
    try {
      const { Gemini } = await import('../integrations/gemini');
      const prompt = this.generateEcoScorePrompt(productData);
      
      const response = await Gemini.analyzeText(prompt);
      
      if (response && this.isValidEcoScoreResponse(response)) {
        return this.normalizeEcoScoreResponse(response);
      }
      
      // Fallback to enhanced heuristic calculation
      return this.calculateHeuristicEcoScore(productData);
    } catch (error) {
      console.warn('AI eco-score failed, using heuristic approach:', error);
      return this.calculateHeuristicEcoScore(productData);
    }
  }

  /**
   * Enhanced heuristic calculation as fallback
   */
  private static calculateHeuristicEcoScore(productData: ProductData): EcoScoreBreakdown {
    const scores = {
      carbon_footprint: this.calculateCarbonScore(productData),
      resource_consumption: this.calculateResourceScore(productData),
      packaging: this.calculatePackagingScore(productData),
      supply_chain: this.calculateSupplyChainScore(productData),
      lifecycle: this.calculateLifecycleScore(productData)
    };

    const overall_score = Math.round(
      scores.carbon_footprint * this.WEIGHTS.CARBON_FOOTPRINT +
      scores.resource_consumption * this.WEIGHTS.RESOURCE_CONSUMPTION +
      scores.packaging * this.WEIGHTS.PACKAGING +
      scores.supply_chain * this.WEIGHTS.SUPPLY_CHAIN +
      scores.lifecycle * this.WEIGHTS.LIFECYCLE
    );

    return {
      overall_score: Math.max(0, Math.min(100, overall_score)),
      confidence: 'medium',
      breakdown: scores,
      insights: this.generateInsights(productData, scores),
      alternatives: this.generateAlternatives(productData),
      certifications: this.detectCertifications(productData),
      impact_summary: this.generateImpactSummary(overall_score, productData)
    };
  }

  private static calculateCarbonScore(productData: ProductData): number {
    let score = 50; // Base score

    const product = productData.product_name?.toLowerCase() || '';
    const materials = productData.materials?.toLowerCase() || '';
    const category = productData.category?.toLowerCase() || '';

    // Material impact on carbon footprint
    if (materials.includes('recycled')) score += 20;
    if (materials.includes('organic')) score += 15;
    if (materials.includes('plastic')) score -= 10;
    if (materials.includes('metal')) score -= 5;
    if (materials.includes('bamboo') || materials.includes('hemp')) score += 25;

    // Category-based adjustments
    if (category.includes('electronics')) score -= 15;
    if (category.includes('food')) score += 10;
    if (category.includes('clothing')) score -= 5;

    // Origin impact (local vs global)
    if (productData.origin_country) {
      // Penalize for long-distance shipping
      const nonLocalOrigins = ['china', 'india', 'vietnam', 'bangladesh'];
      if (nonLocalOrigins.some(country => 
        productData.origin_country?.toLowerCase().includes(country))) {
        score -= 15;
      }
    }

    return Math.max(0, Math.min(100, score));
  }

  private static calculateResourceScore(productData: ProductData): number {
    let score = 50;

    const materials = productData.materials?.toLowerCase() || '';
    const category = productData.category?.toLowerCase() || '';

    // Water usage considerations
    if (category.includes('textile') || category.includes('cotton')) score -= 20;
    if (materials.includes('organic cotton')) score += 10;
    if (materials.includes('linen') || materials.includes('hemp')) score += 15;

    // Energy considerations
    if (category.includes('electronics')) score -= 15;
    if (materials.includes('solar') || materials.includes('renewable')) score += 20;

    // Land use
    if (materials.includes('palm oil')) score -= 25;
    if (materials.includes('sustainable wood')) score += 15;

    return Math.max(0, Math.min(100, score));
  }

  private static calculatePackagingScore(productData: ProductData): number {
    let score = 50;

    const packaging = productData.packaging?.toLowerCase() || '';

    // Packaging material scoring
    if (packaging.includes('glass')) score += 25;
    if (packaging.includes('aluminum')) score += 20;
    if (packaging.includes('cardboard') || packaging.includes('paper')) score += 15;
    if (packaging.includes('plastic')) score -= 15;
    if (packaging.includes('styrofoam') || packaging.includes('polystyrene')) score -= 30;

    // Packaging design
    if (packaging.includes('minimal')) score += 20;
    if (packaging.includes('recyclable')) score += 15;
    if (packaging.includes('biodegradable')) score += 25;
    if (packaging.includes('compostable')) score += 30;

    return Math.max(0, Math.min(100, score));
  }

  private static calculateSupplyChainScore(productData: ProductData): number {
    let score = 50;

    const brand = productData.brand?.toLowerCase() || '';
    const certifications = productData.certifications || [];

    // Certification bonuses
    if (certifications.includes('fair-trade')) score += 20;
    if (certifications.includes('organic')) score += 15;
    if (certifications.includes('rainforest-alliance')) score += 15;
    if (certifications.includes('b-corp')) score += 25;

    // Brand reputation (simplified)
    const sustainableBrands = ['patagonia', 'seventh generation', 'method', 'eileen fisher'];
    if (sustainableBrands.some(b => brand.includes(b))) score += 20;

    return Math.max(0, Math.min(100, score));
  }

  private static calculateLifecycleScore(productData: ProductData): number {
    let score = 50;

    const category = productData.category?.toLowerCase() || '';
    const product = productData.product_name?.toLowerCase() || '';

    // Durability considerations
    if (category.includes('electronics')) {
      if (product.includes('phone') || product.includes('tablet')) score -= 20;
      if (product.includes('laptop') || product.includes('computer')) score -= 10;
    }

    if (category.includes('furniture')) score += 15; // Generally longer-lasting
    if (category.includes('clothing')) {
      if (product.includes('fast fashion')) score -= 25;
      if (product.includes('quality') || product.includes('durable')) score += 15;
    }

    // Repairability
    if (product.includes('modular') || product.includes('repairable')) score += 20;
    if (product.includes('disposable')) score -= 30;

    return Math.max(0, Math.min(100, score));
  }

  private static generateInsights(productData: ProductData, scores: any): string[] {
    const insights: string[] = [];

    // Find strongest and weakest areas
    const scoreEntries = Object.entries(scores);
    const maxScore = Math.max(...Object.values(scores) as number[]);
    const minScore = Math.min(...Object.values(scores) as number[]);

    const strongestArea = scoreEntries.find(([_, score]) => score === maxScore)?.[0];
    const weakestArea = scoreEntries.find(([_, score]) => score === minScore)?.[0];

    if (strongestArea) {
      insights.push(`Strongest environmental performance in ${strongestArea.replace('_', ' ')}`);
    }

    if (weakestArea && maxScore - minScore > 20) {
      insights.push(`Improvement needed in ${weakestArea.replace('_', ' ')}`);
    }

    // Category-specific insights
    const category = productData.category?.toLowerCase() || '';
    if (category.includes('food')) {
      insights.push('Consider local, seasonal alternatives to reduce carbon footprint');
    }
    if (category.includes('electronics')) {
      insights.push('Look for energy-efficient models with longer warranties');
    }

    return insights;
  }

  private static generateAlternatives(productData: ProductData): string[] {
    const alternatives: string[] = [];
    const category = productData.category?.toLowerCase() || '';

    if (category.includes('cleaning')) {
      alternatives.push('DIY cleaning solutions with vinegar and baking soda');
      alternatives.push('Concentrated refillable cleaning products');
    }

    if (category.includes('personal care')) {
      alternatives.push('Solid shampoo and soap bars to reduce packaging');
      alternatives.push('Refillable containers and bulk purchasing options');
    }

    if (category.includes('food')) {
      alternatives.push('Local, seasonal produce from farmers markets');
      alternatives.push('Organic and fair-trade certified options');
    }

    return alternatives;
  }

  private static detectCertifications(productData: ProductData): string[] {
    const certifications: string[] = [];
    const productText = [
      productData.product_name,
      productData.brand,
      productData.materials
    ].join(' ').toLowerCase();

    if (productText.includes('organic')) certifications.push('organic');
    if (productText.includes('fair trade')) certifications.push('fair-trade');
    if (productText.includes('rainforest')) certifications.push('rainforest-alliance');
    if (productText.includes('fsc')) certifications.push('fsc-certified');
    if (productText.includes('energy star')) certifications.push('energy-star');

    return certifications;
  }

  private static generateImpactSummary(score: number, productData: ProductData): string {
    if (score >= 80) {
      return `Excellent environmental choice with minimal impact across most categories.`;
    } else if (score >= 60) {
      return `Good environmental choice with some areas for improvement.`;
    } else if (score >= 40) {
      return `Moderate environmental impact - consider alternatives when possible.`;
    } else {
      return `High environmental impact - significant improvements needed.`;
    }
  }

  private static isValidEcoScoreResponse(response: any): boolean {
    return response && 
           typeof response.overall_score === 'number' &&
           response.breakdown &&
           Array.isArray(response.insights);
  }

  private static normalizeEcoScoreResponse(response: any): EcoScoreBreakdown {
    // Ensure all required fields are present and valid
    return {
      overall_score: Math.max(0, Math.min(100, response.overall_score)),
      confidence: response.confidence || 'medium',
      breakdown: {
        carbon_footprint: response.breakdown?.carbon_footprint || 50,
        resource_consumption: response.breakdown?.resource_consumption || 50,
        packaging: response.breakdown?.packaging || 50,
        supply_chain: response.breakdown?.supply_chain || 50,
        lifecycle: response.breakdown?.lifecycle || 50
      },
      insights: Array.isArray(response.insights) ? response.insights : [],
      alternatives: Array.isArray(response.alternatives) ? response.alternatives : [],
      certifications: Array.isArray(response.certifications) ? response.certifications : [],
      impact_summary: response.impact_summary || 'Environmental impact analysis completed.'
    };
  }
}
