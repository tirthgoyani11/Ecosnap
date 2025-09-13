/**
 * Amazon API Test Integration
 * 
 * This file demonstrates how to test your Amazon API integration
 * with the credentials you provided.
 */

import { AmazonAPI } from './integrations/amazon-api';
import { AdvancedAPIOrchestrator } from './lib/advanced-api-orchestrator';

// Test Amazon API directly
export async function testAmazonAPI() {
  console.log('🧪 Testing Amazon API Integration...');
  
  try {
    // Test product search
    console.log('1. Testing product search...');
    const searchResults = await AmazonAPI.searchProduct('organic coffee');
    console.log('✅ Search Results:', searchResults);
    
    // Test product details
    console.log('2. Testing product details...');
    const productDetails = await AmazonAPI.getProductByASIN('B08N5WRWNW');
    console.log('✅ Product Details:', productDetails);
    
    // Test variations
    console.log('3. Testing product variations...');
    const variations = await AmazonAPI.getProductVariations('B08N5WRWNW');
    console.log('✅ Product Variations:', variations);
    
    return {
      success: true,
      data: {
        searchResults,
        productDetails,
        variations
      }
    };
    
  } catch (error) {
    console.error('❌ Amazon API Test Failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Test complete API orchestrator with Amazon integration
export async function testComprehensiveAnalysis() {
  console.log('🚀 Testing Complete API Orchestration...');
  
  try {
    const productData = {
      name: "Organic Fair Trade Coffee",
      barcode: "123456789012",
      category: "food",
      brand: "Green Mountain"
    };
    
    console.log('🔄 Starting comprehensive analysis...');
    const analysis = await AdvancedAPIOrchestrator.analyzeProductComprehensively(
      productData.barcode,
      productData.name,
      productData
    );
    
    console.log('✅ Comprehensive Analysis Complete!');
    console.log('📊 Eco Score:', analysis.eco_score);
    console.log('🌍 Carbon Footprint:', analysis.carbon_footprint);
    console.log('💰 Price Comparison:', analysis.price_comparison);
    console.log('⭐ Certifications:', analysis.certifications);
    console.log('🔄 Alternatives Found:', analysis.alternatives?.length || 0);
    
    return {
      success: true,
      analysis
    };
    
  } catch (error) {
    console.error('❌ Comprehensive Analysis Failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Quick status check of all APIs
export function checkAPIStatus() {
  console.log('🔍 Checking API Configuration Status...');
  
  const status = {
    amazon: {
      applicationId: !!(import.meta as any).env?.VITE_AMAZON_APPLICATION_ID,
      refreshToken: !!(import.meta as any).env?.VITE_AMAZON_REFRESH_TOKEN,
      clientId: !!(import.meta as any).env?.VITE_AMAZON_CLIENT_ID,
      clientSecret: !!(import.meta as any).env?.VITE_AMAZON_CLIENT_SECRET,
      accessKeyId: !!(import.meta as any).env?.VITE_AMAZON_ACCESS_KEY_ID,
      secretKey: !!(import.meta as any).env?.VITE_AMAZON_SECRET_ACCESS_KEY,
      roleArn: !!(import.meta as any).env?.VITE_AMAZON_ROLE_ARN
    },
    other: {
      gemini: !!(import.meta as any).env?.VITE_GEMINI_API_KEY,
      howgood: !!(import.meta as any).env?.VITE_HOWGOOD_API_KEY,
      climatiq: !!(import.meta as any).env?.VITE_CLIMATIQ_API_KEY,
      fairtrade: !!(import.meta as any).env?.VITE_FAIRTRADE_API_KEY,
      barcode: !!(import.meta as any).env?.VITE_BARCODE_API_KEY,
      walmart: !!(import.meta as any).env?.VITE_WALMART_API_KEY
    }
  };
  
  console.log('📋 API Status:', status);
  
  // Amazon specific check
  const amazonConfigured = status.amazon.applicationId && status.amazon.refreshToken && 
                           status.amazon.accessKeyId && status.amazon.secretKey;
  console.log(`🛒 Amazon API: ${amazonConfigured ? '✅ Configured' : '⚠️ Needs AWS Access Keys'}`);
  
  // Count total configured APIs
  const totalApis = Object.values(status.amazon).filter(Boolean).length + 
                    Object.values(status.other).filter(Boolean).length;
  console.log(`📈 Total API Fields Configured: ${totalApis}/13`);
  
  return status;
}

// Usage example for your components
export function integrateWithExistingComponents() {
  console.log('🔗 Integration Example for Your Components:');
  
  const exampleCode = `
// In your SmartScanner or ProductDetails component:
import { AdvancedAPIOrchestrator } from '@/integrations/advanced-api-orchestrator';

const handleProductScan = async (productData) => {
  try {
    // Get comprehensive analysis using all APIs including Amazon
    const analysis = await AdvancedAPIOrchestrator.analyzeProductComprehensively(
      productData.barcode,
      productData.name,
      productData
    );
    
    // Rich data now available:
    setProductInfo({
      ...productData,
      ecoScore: analysis.eco_score,
      carbonFootprint: analysis.carbon_footprint,
      priceComparison: analysis.price_comparison, // Amazon + Walmart prices
      certifications: analysis.certifications, // Fair trade, organic, etc.
      alternatives: analysis.alternatives,
      confidenceScore: analysis.confidence_score
    });
    
  } catch (error) {
    console.error('Analysis failed:', error);
    // Fallback behavior ensures app still works
  }
};
  `;
  
  console.log(exampleCode);
  return exampleCode;
}

console.log('🎯 Amazon API Test Functions Ready!');
console.log('📞 Available functions:');
console.log('  - testAmazonAPI() - Test Amazon integration specifically');
console.log('  - testComprehensiveAnalysis() - Test full API orchestration');
console.log('  - checkAPIStatus() - Check what APIs are configured');
console.log('  - integrateWithExistingComponents() - Integration examples');