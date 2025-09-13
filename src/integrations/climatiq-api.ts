/**
 * Climatiq API Integration
 * 
 * Climatiq provides comprehensive carbon emissions factors and 
 * environmental impact calculations for products and supply chains.
 * 
 * API Features:
 * - 10,000+ emission factors database
 * - Lifecycle assessment (LCA) calculations
 * - Carbon footprint tracking
 * - Scope 1, 2, 3 emissions analysis
 * - Regional emission factors
 * - Transportation impact calculations
 */

export interface ClimatiqResponse {
  carbon_footprint: number; // kg CO2 equivalent
  sustainability_score: number; // 0-100 derived score
  emission_factors: {
    production: number;
    transportation: number;
    packaging: number;
    end_of_life: number;
  };
  lifecycle_analysis: {
    raw_materials: number;
    manufacturing: number;
    distribution: number;
    use_phase: number;
    disposal: number;
  };
  regional_impact: {
    origin_country: string;
    carbon_intensity: number;
    renewable_energy_percent: number;
  };
  comparison_benchmark: {
    category_average: number;
    best_in_category: number;
    percentile_rank: number; // 0-100, higher is better
  };
}

export class ClimatiqAPI {
  private static readonly API_URL = 'https://api.climatiq.io/v1';
  private static readonly API_KEY = (import.meta as any).env?.VITE_CLIMATIQ_API_KEY || '';
  
  /**
   * Calculate comprehensive carbon footprint for a product
   */
  static async calculateCarbonFootprint(productData: any): Promise<ClimatiqResponse> {
    if (!this.API_KEY) {
      console.warn('Climatiq API key not available, using carbon estimation');
      return this.generateCarbonEstimation(productData);
    }
    
    try {
      // Prepare emission calculation payload
      const emissionSources = this.identifyEmissionSources(productData);
      
      const payload = {
        emission_factor: {
          activity_id: this.getCategoryActivityId(productData.category),
          region: this.extractRegion(productData),
          year: new Date().getFullYear(),
          source: 'EPA',
          data_version: '^5'
        },
        parameters: {
          mass: this.extractMass(productData),
          mass_unit: 'kg',
          distance: this.estimateTransportDistance(productData),
          distance_unit: 'km'
        }
      };
      
      const response = await fetch(`${this.API_URL}/estimate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        throw new Error(`Climatiq API error: ${response.status}`);
      }
      
      const data = await response.json();
      return this.processClimatiqResponse(data, productData);
      
    } catch (error) {
      console.warn('Climatiq API failed, using intelligent carbon estimation:', error);
      return this.generateCarbonEstimation(productData);
    }
  }
  
  /**
   * Get emission factors for specific product categories
   */
  static async getEmissionFactors(category: string, region: string = 'US'): Promise<any> {
    if (!this.API_KEY) {
      return this.getDefaultEmissionFactors(category);
    }
    
    try {
      const searchParams = new URLSearchParams({
        category: category.toLowerCase(),
        region,
        source: 'EPA,DEFRA,IPCC'
      });
      
      const response = await fetch(`${this.API_URL}/emission-factors?${searchParams}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.API_KEY}`,
        }
      });
      
      if (!response.ok) {
        throw new Error(`Climatiq emission factors error: ${response.status}`);
      }
      
      return await response.json();
      
    } catch (error) {
      console.warn('Climatiq emission factors failed:', error);
      return this.getDefaultEmissionFactors(category);
    }
  }
  
  /**
   * Calculate transportation emissions
   */
  static async calculateTransportEmissions(
    distance: number,
    transportMode: string,
    mass: number
  ): Promise<number> {
    if (!this.API_KEY) {
      return this.estimateTransportEmissions(distance, transportMode, mass);
    }
    
    try {
      const payload = {
        emission_factor: {
          activity_id: `transport-${transportMode.toLowerCase()}`,
          data_version: '^5'
        },
        parameters: {
          distance,
          distance_unit: 'km',
          weight: mass,
          weight_unit: 'kg'
        }
      };
      
      const response = await fetch(`${this.API_URL}/estimate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        throw new Error(`Transport emissions error: ${response.status}`);
      }
      
      const data = await response.json();
      return data.co2e || this.estimateTransportEmissions(distance, transportMode, mass);
      
    } catch (error) {
      console.warn('Transport emissions calculation failed:', error);
      return this.estimateTransportEmissions(distance, transportMode, mass);
    }
  }
  
  private static processClimatiqResponse(apiData: any, productData: any): ClimatiqResponse {
    const carbonFootprint = apiData.co2e || this.estimateBasicCarbon(productData);
    
    return {
      carbon_footprint: carbonFootprint,
      sustainability_score: this.calculateSustainabilityScore(carbonFootprint, productData),
      emission_factors: {
        production: carbonFootprint * 0.4, // 40% production
        transportation: carbonFootprint * 0.2, // 20% transport
        packaging: carbonFootprint * 0.15, // 15% packaging
        end_of_life: carbonFootprint * 0.25 // 25% disposal
      },
      lifecycle_analysis: {
        raw_materials: carbonFootprint * 0.3,
        manufacturing: carbonFootprint * 0.25,
        distribution: carbonFootprint * 0.2,
        use_phase: carbonFootprint * 0.1,
        disposal: carbonFootprint * 0.15
      },
      regional_impact: {
        origin_country: this.extractRegion(productData),
        carbon_intensity: this.getRegionCarbonIntensity(this.extractRegion(productData)),
        renewable_energy_percent: this.getRegionRenewablePercent(this.extractRegion(productData))
      },
      comparison_benchmark: {
        category_average: this.getCategoryAverage(productData.category),
        best_in_category: this.getCategoryBest(productData.category),
        percentile_rank: this.calculatePercentileRank(carbonFootprint, productData.category)
      }
    };
  }
  
  private static generateCarbonEstimation(productData: any): ClimatiqResponse {
    const category = productData.category?.toLowerCase() || 'unknown';
    
    // Science-based carbon estimates by category (kg CO2 equivalent)
    const categoryEmissions: Record<string, number> = {
      'meat': 15.5, // Beef, high emissions
      'poultry': 6.2, // Chicken, moderate emissions
      'dairy': 8.2, // Milk, cheese
      'fish': 4.5, // Seafood
      'vegetables': 1.8, // Fresh produce
      'fruits': 2.1, // Fresh fruits
      'grains': 1.5, // Cereals, bread
      'legumes': 1.2, // Beans, lentils
      'nuts': 3.8, // Tree nuts
      'beverages': 1.8, // Soft drinks, juices
      'alcohol': 4.2, // Beer, wine
      'snacks': 3.5, // Processed snacks
      'frozen': 2.8, // Frozen foods
      'canned': 2.2, // Canned goods
      'electronics': 85.0, // Consumer electronics
      'clothing': 15.2, // Textiles
      'cosmetics': 4.8, // Beauty products
      'cleaning': 3.2, // Household cleaners
      'default': 3.5 // Unknown products
    };
    
    let baseEmission = categoryEmissions[category] || categoryEmissions['default'];
    
    // Apply modifiers based on product attributes
    const isOrganic = productData.labels?.some((label: string) => 
      label.toLowerCase().includes('organic')
    ) || false;
    
    const isLocal = this.isLocalProduct(productData);
    const packagingIntensity = this.assessPackagingIntensity(productData);
    
    // Organic products typically have 10-20% lower emissions
    if (isOrganic) {
      baseEmission *= 0.85;
    }
    
    // Local products reduce transportation emissions
    if (isLocal) {
      baseEmission *= 0.9;
    }
    
    // Adjust for packaging intensity
    baseEmission *= (1 + packagingIntensity * 0.3);
    
    const carbonFootprint = Math.round(baseEmission * 100) / 100;
    
    return {
      carbon_footprint: carbonFootprint,
      sustainability_score: this.calculateSustainabilityScore(carbonFootprint, productData),
      emission_factors: {
        production: carbonFootprint * 0.4,
        transportation: carbonFootprint * 0.2,
        packaging: carbonFootprint * 0.15,
        end_of_life: carbonFootprint * 0.25
      },
      lifecycle_analysis: {
        raw_materials: carbonFootprint * 0.3,
        manufacturing: carbonFootprint * 0.25,
        distribution: carbonFootprint * 0.2,
        use_phase: carbonFootprint * 0.1,
        disposal: carbonFootprint * 0.15
      },
      regional_impact: {
        origin_country: this.extractRegion(productData),
        carbon_intensity: this.getRegionCarbonIntensity(this.extractRegion(productData)),
        renewable_energy_percent: this.getRegionRenewablePercent(this.extractRegion(productData))
      },
      comparison_benchmark: {
        category_average: this.getCategoryAverage(productData.category),
        best_in_category: this.getCategoryBest(productData.category),
        percentile_rank: this.calculatePercentileRank(carbonFootprint, productData.category)
      }
    };
  }
  
  private static calculateSustainabilityScore(carbonFootprint: number, productData: any): number {
    // Convert carbon footprint to sustainability score (0-100, higher is better)
    const categoryAverage = this.getCategoryAverage(productData.category);
    const categoryBest = this.getCategoryBest(productData.category);
    
    // Score based on how close to best-in-category
    const range = Math.max(categoryAverage - categoryBest, 1);
    const position = Math.max(0, carbonFootprint - categoryBest);
    const rawScore = Math.max(0, 100 - (position / range) * 100);
    
    // Apply bonus points for certifications
    let bonus = 0;
    if (productData.labels) {
      const labels = productData.labels.map((l: string) => l.toLowerCase());
      if (labels.some((l: string) => l.includes('organic'))) bonus += 10;
      if (labels.some((l: string) => l.includes('fair trade'))) bonus += 5;
      if (labels.some((l: string) => l.includes('carbon neutral'))) bonus += 15;
    }
    
    return Math.min(100, Math.round(rawScore + bonus));
  }
  
  // Helper methods
  private static identifyEmissionSources(productData: any): string[] {
    const sources = ['production', 'transportation', 'packaging'];
    
    if (productData.manufacturing_places) sources.push('manufacturing');
    if (productData.origins) sources.push('raw_materials');
    
    return sources;
  }
  
  private static getCategoryActivityId(category?: string): string {
    const mapping: Record<string, string> = {
      'meat': 'food-meat-beef',
      'dairy': 'food-dairy-milk',
      'vegetables': 'food-vegetables-fresh',
      'beverages': 'food-beverages-soft-drinks',
      'electronics': 'manufacturing-electronics',
      'clothing': 'manufacturing-textiles'
    };
    
    return mapping[category?.toLowerCase() || 'unknown'] || 'food-general';
  }
  
  private static extractRegion(productData: any): string {
    if (productData.origins) {
      const origins = productData.origins.split(',')[0].trim();
      // Map country names to regions
      const regionMapping: Record<string, string> = {
        'united states': 'US',
        'usa': 'US',
        'canada': 'CA',
        'mexico': 'MX',
        'france': 'FR',
        'germany': 'DE',
        'italy': 'IT',
        'spain': 'ES',
        'united kingdom': 'GB',
        'china': 'CN',
        'india': 'IN',
        'brazil': 'BR'
      };
      
      return regionMapping[origins.toLowerCase()] || 'US';
    }
    
    return 'US'; // Default to US
  }
  
  private static extractMass(productData: any): number {
    // Try to extract product mass from various fields
    if (productData.quantity) {
      const match = productData.quantity.match(/(\d+\.?\d*)\s*(g|kg|lb|oz)/i);
      if (match) {
        const value = parseFloat(match[1]);
        const unit = match[2].toLowerCase();
        
        // Convert to kg
        switch (unit) {
          case 'g': return value / 1000;
          case 'kg': return value;
          case 'lb': return value * 0.453592;
          case 'oz': return value * 0.0283495;
          default: return value / 1000; // Assume grams
        }
      }
    }
    
    // Default estimates by category
    const categoryDefaults: Record<string, number> = {
      'beverages': 0.5, // 500ml bottle
      'snacks': 0.1, // 100g package
      'canned': 0.4, // 400g can
      'meat': 0.5, // 500g package
      'dairy': 1.0, // 1L carton
      'electronics': 2.0, // 2kg device
      'clothing': 0.3 // 300g garment
    };
    
    return categoryDefaults[productData.category?.toLowerCase()] || 0.3;
  }
  
  private static estimateTransportDistance(productData: any): number {
    // Estimate transport distance based on origin
    const region = this.extractRegion(productData);
    
    const distanceMapping: Record<string, number> = {
      'US': 1500, // Average domestic transport
      'CA': 2000, // US-Canada
      'MX': 2500, // US-Mexico
      'CN': 12000, // China to US
      'IN': 15000, // India to US
      'BR': 8000, // Brazil to US
      'FR': 7000, // France to US
      'DE': 7500, // Germany to US
      'IT': 8500, // Italy to US
      'ES': 6500, // Spain to US
      'GB': 6000 // UK to US
    };
    
    return distanceMapping[region] || 5000; // Default global average
  }
  
  private static estimateBasicCarbon(productData: any): number {
    // Fallback carbon estimation
    const category = productData.category?.toLowerCase() || 'unknown';
    const estimates: Record<string, number> = {
      'meat': 15.5,
      'dairy': 8.2,
      'vegetables': 1.8,
      'beverages': 1.8,
      'electronics': 85.0,
      'clothing': 15.2
    };
    
    return estimates[category] || 3.5;
  }
  
  private static getCategoryAverage(category?: string): number {
    const averages: Record<string, number> = {
      'meat': 12.5,
      'dairy': 6.5,
      'vegetables': 2.2,
      'beverages': 2.1,
      'electronics': 75.0,
      'clothing': 12.8
    };
    
    return averages[category?.toLowerCase() || 'unknown'] || 4.0;
  }
  
  private static getCategoryBest(category?: string): number {
    const best: Record<string, number> = {
      'meat': 8.0, // Best sustainable meat
      'dairy': 4.0, // Best organic dairy
      'vegetables': 1.0, // Local organic vegetables
      'beverages': 1.2, // Local beverages
      'electronics': 45.0, // Most efficient electronics
      'clothing': 8.0 // Sustainable fashion
    };
    
    return best[category?.toLowerCase() || 'unknown'] || 2.0;
  }
  
  private static calculatePercentileRank(carbonFootprint: number, category?: string): number {
    const average = this.getCategoryAverage(category);
    const best = this.getCategoryBest(category);
    
    if (carbonFootprint <= best) return 95; // Top 5%
    if (carbonFootprint <= average * 0.8) return 80; // Top 20%
    if (carbonFootprint <= average) return 50; // Average
    if (carbonFootprint <= average * 1.5) return 25; // Below average
    
    return 10; // Bottom 10%
  }
  
  private static isLocalProduct(productData: any): boolean {
    const origins = productData.origins?.toLowerCase() || '';
    const localKeywords = ['usa', 'united states', 'us', 'local', 'domestic'];
    
    return localKeywords.some(keyword => origins.includes(keyword));
  }
  
  private static assessPackagingIntensity(productData: any): number {
    // Estimate packaging intensity (0-1 scale)
    const packaging = productData.packaging?.toLowerCase() || '';
    
    if (packaging.includes('minimal') || packaging.includes('biodegradable')) return 0.2;
    if (packaging.includes('plastic') && packaging.includes('multiple')) return 0.8;
    if (packaging.includes('glass') || packaging.includes('metal')) return 0.6;
    if (packaging.includes('cardboard') || packaging.includes('paper')) return 0.4;
    
    return 0.5; // Default moderate packaging
  }
  
  private static getRegionCarbonIntensity(region: string): number {
    // Carbon intensity of electricity grid (gCO2/kWh)
    const intensities: Record<string, number> = {
      'US': 429,
      'CA': 130,
      'MX': 458,
      'CN': 644,
      'IN': 708,
      'BR': 75,
      'FR': 58,
      'DE': 350,
      'IT': 278,
      'ES': 200,
      'GB': 233
    };
    
    return intensities[region] || 400;
  }
  
  private static getRegionRenewablePercent(region: string): number {
    // Renewable energy percentage by region
    const renewables: Record<string, number> = {
      'US': 21,
      'CA': 68,
      'MX': 25,
      'CN': 28,
      'IN': 25,
      'BR': 85,
      'FR': 21,
      'DE': 46,
      'IT': 42,
      'ES': 44,
      'GB': 43
    };
    
    return renewables[region] || 25;
  }
  
  private static getDefaultEmissionFactors(category: string): any {
    return {
      production: 2.5,
      transportation: 0.8,
      packaging: 0.5,
      end_of_life: 0.3
    };
  }
  
  private static estimateTransportEmissions(distance: number, mode: string, mass: number): number {
    // Emission factors (kg CO2 per km per kg of cargo)
    const factors: Record<string, number> = {
      'truck': 0.0001,
      'ship': 0.000015,
      'plane': 0.0005,
      'rail': 0.00003
    };
    
    const factor = factors[mode.toLowerCase()] || factors['truck'];
    return distance * mass * factor;
  }
}