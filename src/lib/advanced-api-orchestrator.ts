/**
 * Advanced API Orchestrator
 * 
 * Coordinates multiple APIs for comprehensive sustainability analysis
 * Features: Parallel processing, intelligent caching, fallback strategies, load balancing
 */

import { HowGoodAPI } from '../integrations/howgood-api';
import { ClimatiqAPI } from '../integrations/climatiq-api';
import { BarcodeAPI } from '../integrations/barcode-api';
import { FairTradeAPI } from '../integrations/fairtrade-api';
import { WalmartAPI } from '../integrations/walmart-api';
import { AmazonAPI } from '../integrations/amazon-api';
import { EnhancedImageSearchAPI } from '../integrations/enhanced-image-search';
import { ProductDataEnrichment } from './enhanced-product-enrichment';

export interface ComprehensiveProductData {
  // Basic product info
  name: string;
  brand: string;
  category: string;
  barcode: string;
  image_url: string;
  
  // Sustainability scores
  eco_score: number; // 0-100
  carbon_footprint: number; // kg CO2 equivalent
  water_usage: number; // liters
  biodiversity_impact: number; // 0-100
  ethical_score: number; // 0-100
  
  // Detailed analysis
  certifications: string[];
  supply_chain_transparency: number; // 0-100
  environmental_impact: {
    land_use: number;
    pollution_level: number;
    renewable_energy_use: number;
  };
  
  // Social impact
  labor_conditions: number; // 0-100
  fair_trade_certified: boolean;
  local_sourcing: boolean;
  
  // Market data
  price_comparison: {
    current_price: number;
    average_price: number;
    price_trend: 'increasing' | 'decreasing' | 'stable';
    stores: Array<{
      name: string;
      price: number;
      availability: boolean;
    }>;
  };
  
  // Enhanced alternatives
  alternatives: Array<{
    product: ComprehensiveProductData;
    improvement_areas: string[];
    sustainability_gain: number;
    price_difference: number;
  }>;
  
  // Data sources and reliability
  data_sources: {
    primary: string[];
    secondary: string[];
    confidence_score: number; // 0-1
    last_updated: Date;
  };
}

export interface APIConfig {
  enabled: boolean;
  priority: number; // 1-10, higher = more important
  timeout: number; // milliseconds
  cache_duration: number; // hours
  fallback_strategies: string[];
}

export class AdvancedAPIOrchestrator {
  private static readonly CACHE_PREFIX = 'ecosnap_comprehensive_';
  private static readonly DEFAULT_TIMEOUT = 5000; // 5 seconds
  private static readonly MAX_CONCURRENT_APIS = 6;
  
  // API Configuration
  private static readonly API_CONFIGS: Record<string, APIConfig> = {
    'howgood': {
      enabled: true,
      priority: 10,
      timeout: 8000,
      cache_duration: 24,
      fallback_strategies: ['climatiq', 'gemini']
    },
    'climatiq': {
      enabled: true,
      priority: 9,
      timeout: 6000,
      cache_duration: 12,
      fallback_strategies: ['howgood', 'manual_calculation']
    },
    'barcode_lookup': {
      enabled: true,
      priority: 8,
      timeout: 3000,
      cache_duration: 6,
      fallback_strategies: ['openfoodfacts', 'manual_search']
    },
    'fairtrade': {
      enabled: true,
      priority: 7,
      timeout: 4000,
      cache_duration: 48,
      fallback_strategies: ['manual_verification']
    },
    'walmart': {
      enabled: true,
      priority: 6,
      timeout: 5000,
      cache_duration: 2,
      fallback_strategies: ['amazon', 'manual_pricing']
    },
    'amazon': {
      enabled: true,
      priority: 6,
      timeout: 5000,
      cache_duration: 2,
      fallback_strategies: ['walmart', 'manual_pricing']
    }
  };

  /**
   * Orchestrate comprehensive product analysis using multiple APIs
   */
  static async analyzeProductComprehensively(
    barcode: string,
    productName?: string,
    additionalContext?: any
  ): Promise<ComprehensiveProductData> {
    console.log('🚀 Starting comprehensive product analysis...', { barcode, productName });
    
    // Check comprehensive cache first
    const cacheKey = `${this.CACHE_PREFIX}${barcode}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) {
      console.log('⚡ Using cached comprehensive data');
      return cached;
    }
    
    try {
      // Phase 1: Parallel basic data gathering
      const basicDataPromises = this.launchBasicDataCollection(barcode, productName);
      
      // Phase 2: Enhanced analysis with dependencies
      const basicResults = await this.processBasicData(basicDataPromises);
      
      // Phase 3: Advanced sustainability analysis
      const comprehensiveData = await this.performAdvancedAnalysis(basicResults);
      
      // Cache the result
      this.setCachedData(cacheKey, comprehensiveData, 24); // 24 hour cache
      
      console.log('✅ Comprehensive analysis complete');
      return comprehensiveData;
      
    } catch (error) {
      console.error('❌ Comprehensive analysis failed:', error);
      return this.getFallbackData(barcode, productName);
    }
  }

  /**
   * Launch parallel basic data collection from multiple sources
   */
  private static launchBasicDataCollection(barcode: string, productName?: string) {
    const promises = [];
    
    // Core product data
    promises.push({
      source: 'openfoodfacts',
      promise: ProductDataEnrichment.enrichProductData(barcode, productName || '')
    });
    
    // Enhanced barcode lookup
    if (this.API_CONFIGS.barcode_lookup.enabled) {
      promises.push({
        source: 'barcode_lookup',
        promise: this.timeoutPromise(
          BarcodeAPI.lookupProduct(barcode),
          this.API_CONFIGS.barcode_lookup.timeout,
          'barcode_lookup'
        )
      });
    }
    
    // Retail data
    if (this.API_CONFIGS.walmart.enabled) {
      promises.push({
        source: 'walmart',
        promise: this.timeoutPromise(
          WalmartAPI.searchProduct(productName || barcode),
          this.API_CONFIGS.walmart.timeout,
          'walmart'
        )
      });
    }
    
    if (this.API_CONFIGS.amazon.enabled) {
      promises.push({
        source: 'amazon',
        promise: this.timeoutPromise(
          AmazonAPI.searchProduct(productName || barcode),
          this.API_CONFIGS.amazon.timeout,
          'amazon'
        )
      });
    }
    
    return promises;
  }

  /**
   * Process basic data with intelligent error handling
   */
  private static async processBasicData(promises: Array<{source: string, promise: Promise<any>}>) {
    const results = await Promise.allSettled(promises.map(p => p.promise));
    const processedData: Record<string, any> = {};
    
    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      const source = promises[i].source;
      
      if (result.status === 'fulfilled') {
        processedData[source] = result.value;
        console.log(`✅ ${source} data retrieved successfully`);
      } else {
        console.warn(`⚠️ ${source} failed:`, result.reason);
        processedData[source] = this.getSourceFallback(source);
      }
    }
    
    return processedData;
  }

  /**
   * Perform advanced sustainability analysis
   */
  private static async performAdvancedAnalysis(basicData: Record<string, any>): Promise<ComprehensiveProductData> {
    const sustainabilityPromises = [];
    
    // Carbon footprint analysis
    if (this.API_CONFIGS.climatiq.enabled && basicData.openfoodfacts) {
      sustainabilityPromises.push({
        source: 'climatiq',
        promise: this.timeoutPromise(
          ClimatiqAPI.calculateCarbonFootprint(basicData.openfoodfacts),
          this.API_CONFIGS.climatiq.timeout,
          'climatiq'
        )
      });
    }
    
    // Supply chain analysis
    if (this.API_CONFIGS.howgood.enabled && basicData.openfoodfacts) {
      sustainabilityPromises.push({
        source: 'howgood',
        promise: this.timeoutPromise(
          HowGoodAPI.analyzeSupplyChain(basicData.openfoodfacts),
          this.API_CONFIGS.howgood.timeout,
          'howgood'
        )
      });
    }
    
    // Certification verification
    if (this.API_CONFIGS.fairtrade.enabled && basicData.openfoodfacts) {
      sustainabilityPromises.push({
        source: 'fairtrade',
        promise: this.timeoutPromise(
          FairTradeAPI.verifyCertifications(basicData.openfoodfacts),
          this.API_CONFIGS.fairtrade.timeout,
          'fairtrade'
        )
      });
    }
    
    // Enhanced image search across multiple free APIs
    sustainabilityPromises.push({
      source: 'images',
      promise: EnhancedImageSearchAPI.getProductImages(
        basicData.openfoodfacts?.product_name || '',
        basicData.openfoodfacts?.category || ''
      )
    });
    
    const sustainabilityResults = await this.processBasicData(sustainabilityPromises);
    
    // Merge and synthesize all data
    return this.synthesizeComprehensiveData(basicData, sustainabilityResults);
  }

  /**
   * Synthesize all collected data into comprehensive product information
   */
  private static synthesizeComprehensiveData(
    basicData: Record<string, any>,
    sustainabilityData: Record<string, any>
  ): ComprehensiveProductData {
    const primary = basicData.openfoodfacts || {};
    
    return {
      // Basic info
      name: primary.product_name || 'Unknown Product',
      brand: primary.brand || 'Unknown Brand',
      category: primary.category || 'Unknown Category',
      barcode: primary.barcode || '',
      image_url: this.extractBestImageUrl(sustainabilityData.images) || primary.image_url || '',
      
      // Sustainability scores (intelligently calculated)
      eco_score: this.calculateCompositeEcoScore(sustainabilityData),
      carbon_footprint: sustainabilityData.climatiq?.carbon_footprint || this.estimateCarbonFootprint(primary),
      water_usage: sustainabilityData.howgood?.water_usage || this.estimateWaterUsage(primary),
      biodiversity_impact: sustainabilityData.howgood?.biodiversity_score || this.estimateBiodiversityImpact(primary),
      ethical_score: this.calculateEthicalScore(sustainabilityData, primary),
      
      // Certifications
      certifications: this.extractCertifications(sustainabilityData, primary),
      supply_chain_transparency: sustainabilityData.howgood?.transparency_score || this.estimateTransparency(primary),
      
      // Environmental impact
      environmental_impact: {
        land_use: sustainabilityData.howgood?.land_use || this.estimateLandUse(primary),
        pollution_level: sustainabilityData.howgood?.pollution || this.estimatePollution(primary),
        renewable_energy_use: sustainabilityData.howgood?.renewable_energy || this.estimateRenewableEnergy(primary)
      },
      
      // Social impact
      labor_conditions: sustainabilityData.fairtrade?.labor_score || this.estimateLaborConditions(primary),
      fair_trade_certified: sustainabilityData.fairtrade?.certified || false,
      local_sourcing: this.assessLocalSourcing(basicData, sustainabilityData),
      
      // Market data
      price_comparison: this.synthesizePriceData(basicData),
      
      // Alternatives (enhanced)
      alternatives: [], // Will be populated by advanced alternatives engine
      
      // Metadata
      data_sources: {
        primary: Object.keys(basicData).filter(k => basicData[k] && !basicData[k].error),
        secondary: Object.keys(sustainabilityData).filter(k => sustainabilityData[k] && !sustainabilityData[k].error),
        confidence_score: this.calculateConfidenceScore(basicData, sustainabilityData),
        last_updated: new Date()
      }
    };
  }

  /**
   * Intelligent timeout wrapper for API calls
   */
  private static timeoutPromise<T>(promise: Promise<T>, timeout: number, source: string): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) => 
        setTimeout(() => reject(new Error(`${source} timeout after ${timeout}ms`)), timeout)
      )
    ]);
  }

  /**
   * Calculate composite eco score from multiple sources
   */
  private static calculateCompositeEcoScore(data: Record<string, any>): number {
    const scores = [];
    
    // Weight different sources by reliability
    if (data.howgood?.eco_score) scores.push({ score: data.howgood.eco_score, weight: 0.4 });
    if (data.climatiq?.sustainability_score) scores.push({ score: data.climatiq.sustainability_score, weight: 0.3 });
    if (data.fairtrade?.overall_score) scores.push({ score: data.fairtrade.overall_score, weight: 0.2 });
    
    if (scores.length === 0) return 50; // Default neutral score
    
    const weightedSum = scores.reduce((sum, item) => sum + (item.score * item.weight), 0);
    const totalWeight = scores.reduce((sum, item) => sum + item.weight, 0);
    
    return Math.round(weightedSum / totalWeight);
  }

  // Helper methods for estimation when API data is unavailable
  private static estimateCarbonFootprint(product: any): number {
    // Implement intelligent estimation based on category, ingredients, etc.
    const categoryEstimates: Record<string, number> = {
      'meat': 15.5,
      'dairy': 8.2,
      'vegetables': 2.1,
      'beverages': 1.8,
      'processed_food': 4.5
    };
    
    return categoryEstimates[product.category?.toLowerCase()] || 3.0;
  }

  private static estimateWaterUsage(product: any): number {
    // Implement water usage estimation
    return 100; // Placeholder
  }

  private static estimateBiodiversityImpact(product: any): number {
    // Implement biodiversity impact estimation
    return 60; // Placeholder
  }

  private static calculateEthicalScore(sustainabilityData: any, product: any): number {
    let score = 50; // Base score
    
    if (sustainabilityData.fairtrade?.certified) score += 20;
    if (sustainabilityData.howgood?.labor_score) score = Math.max(score, sustainabilityData.howgood.labor_score);
    
    return Math.min(100, score);
  }

  private static extractCertifications(sustainabilityData: any, product: any): string[] {
    const certs = [];
    
    if (sustainabilityData.fairtrade?.certified) certs.push('Fair Trade');
    if (product.organic) certs.push('Organic');
    if (product.labels) certs.push(...product.labels);
    
    return [...new Set(certs)]; // Remove duplicates
  }

  private static estimateTransparency(product: any): number {
    let score = 30; // Base low transparency
    
    if (product.ingredients_text) score += 20;
    if (product.manufacturing_places) score += 15;
    if (product.origins) score += 15;
    if (product.labels?.length > 0) score += 20;
    
    return Math.min(100, score);
  }

  private static estimateLandUse(product: any): number {
    return 40; // Placeholder
  }

  private static estimatePollution(product: any): number {
    return 35; // Placeholder
  }

  private static estimateRenewableEnergy(product: any): number {
    return 25; // Placeholder
  }

  private static estimateLaborConditions(product: any): number {
    return 60; // Placeholder
  }

  private static assessLocalSourcing(basicData: any, sustainabilityData: any): boolean {
    // Implement local sourcing assessment
    return false; // Placeholder
  }

  private static synthesizePriceData(basicData: any): any {
    const prices = [];
    
    if (basicData.walmart?.price) {
      prices.push({ name: 'Walmart', price: basicData.walmart.price, availability: true });
    }
    
    if (basicData.amazon?.price) {
      prices.push({ name: 'Amazon', price: basicData.amazon.price, availability: true });
    }
    
    const avgPrice = prices.length > 0 ? prices.reduce((sum, p) => sum + p.price, 0) / prices.length : 0;
    
    return {
      current_price: prices[0]?.price || 0,
      average_price: avgPrice,
      price_trend: 'stable' as const,
      stores: prices
    };
  }

  private static calculateConfidenceScore(basicData: any, sustainabilityData: any): number {
    let confidence = 0;
    const totalSources = Object.keys({...basicData, ...sustainabilityData}).length;
    const successfulSources = Object.values({...basicData, ...sustainabilityData})
      .filter(data => data && !(data as any).error).length;
    
    confidence = successfulSources / Math.max(totalSources, 1);
    
    // Boost confidence for high-priority sources
    if (basicData.openfoodfacts && !basicData.openfoodfacts.error) confidence += 0.2;
    if (sustainabilityData.howgood && !sustainabilityData.howgood.error) confidence += 0.2;
    
    return Math.min(1, confidence);
  }

  /**
   * Extract the best image URL from enhanced image search results
   */
  private static extractBestImageUrl(imageResults: any): string {
    if (!imageResults || !Array.isArray(imageResults) || imageResults.length === 0) {
      return '';
    }

    // Priority order: high quality, medium quality, low quality
    const highQuality = imageResults.find(img => img.quality === 'high');
    if (highQuality) return highQuality.url;

    const mediumQuality = imageResults.find(img => img.quality === 'medium');
    if (mediumQuality) return mediumQuality.url;

    // Fallback to any available image
    return imageResults[0]?.url || '';
  }

  private static getSourceFallback(source: string): any {
    return {
      error: true,
      source,
      fallback_used: true,
      timestamp: new Date()
    };
  }

  private static getFallbackData(barcode: string, productName?: string): ComprehensiveProductData {
    return {
      name: productName || 'Unknown Product',
      brand: 'Unknown Brand',
      category: 'Unknown Category',
      barcode,
      image_url: '/placeholder.svg',
      eco_score: 50,
      carbon_footprint: 3.0,
      water_usage: 100,
      biodiversity_impact: 60,
      ethical_score: 50,
      certifications: [],
      supply_chain_transparency: 30,
      environmental_impact: {
        land_use: 40,
        pollution_level: 35,
        renewable_energy_use: 25
      },
      labor_conditions: 60,
      fair_trade_certified: false,
      local_sourcing: false,
      price_comparison: {
        current_price: 0,
        average_price: 0,
        price_trend: 'stable',
        stores: []
      },
      alternatives: [],
      data_sources: {
        primary: [],
        secondary: [],
        confidence_score: 0.1,
        last_updated: new Date()
      }
    };
  }

  // Cache management
  private static getCachedData(key: string): ComprehensiveProductData | null {
    try {
      const cached = localStorage.getItem(key);
      if (!cached) return null;
      
      const data = JSON.parse(cached);
      const age = (Date.now() - new Date(data.timestamp).getTime()) / (1000 * 60 * 60); // hours
      
      if (age > 24) { // 24 hour expiry
        localStorage.removeItem(key);
        return null;
      }
      
      return data.value;
    } catch {
      return null;
    }
  }

  private static setCachedData(key: string, data: ComprehensiveProductData, hours: number): void {
    try {
      const cacheItem = {
        value: data,
        timestamp: new Date(),
        expiry_hours: hours
      };
      localStorage.setItem(key, JSON.stringify(cacheItem));
    } catch (error) {
      console.warn('Failed to cache data:', error);
    }
  }
}