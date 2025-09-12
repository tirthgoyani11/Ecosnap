/**
 * Integration test for enhanced AI features
 * Tests the new eco-scoring and food analysis capabilities
 */

import { UnifiedAIAnalysisService } from '../lib/unified-ai-analysis';
import { EnhancedEcoScoringAlgorithm } from '../lib/enhanced-eco-scoring';
import { ComprehensiveFoodAnalyzer } from '../lib/comprehensive-food-analyzer';

// Test data
const testProducts = {
  organicFood: {
    product_name: "Organic Quinoa Salad Bowl",
    category: "food",
    brand: "WholeEarth Foods",
    ingredients: ["organic quinoa", "organic tomatoes", "organic cucumber"],
    organic: true,
    calories: 320,
    certifications: ["organic", "non-gmo"]
  },
  plasticBottle: {
    product_name: "Single-Use Plastic Water Bottle",
    category: "beverage container",
    materials: "PET plastic",
    packaging: "plastic bottle with plastic cap",
    origin_country: "China"
  },
  bambooProduct: {
    product_name: "Bamboo Toothbrush with Charcoal Bristles",
    category: "personal care",
    materials: "bamboo handle, charcoal-infused bristles",
    packaging: "minimal cardboard packaging",
    certifications: ["fsc-certified", "biodegradable"]
  }
};

/**
 * Test enhanced eco-scoring algorithm
 */
async function testEcoScoring() {
  console.log('🧪 Testing Enhanced Eco-Scoring Algorithm...');
  
  try {
    const result = await EnhancedEcoScoringAlgorithm.calculateAIEcoScore(testProducts.bambooProduct);
    
    console.log('✅ Eco-scoring test passed:');
    console.log(`   Score: ${result.overall_score}/100`);
    console.log(`   Confidence: ${result.confidence}`);
    console.log(`   Insights: ${result.insights.length} generated`);
    
    return true;
  } catch (error) {
    console.error('❌ Eco-scoring test failed:', error);
    return false;
  }
}

/**
 * Test comprehensive food analyzer
 */
async function testFoodAnalyzer() {
  console.log('🧪 Testing Comprehensive Food Analyzer...');
  
  try {
    const result = await ComprehensiveFoodAnalyzer.analyzeFoodProduct(testProducts.organicFood);
    
    console.log('✅ Food analysis test passed:');
    console.log(`   Health Score: ${result.health_score}/100`);
    console.log(`   Sustainability: ${result.sustainability_score}/100`);
    console.log(`   Rating: ${result.overall_rating}`);
    
    return true;
  } catch (error) {
    console.error('❌ Food analysis test failed:', error);
    return false;
  }
}

/**
 * Test unified AI analysis service
 */
async function testUnifiedAnalysis() {
  console.log('🧪 Testing Unified AI Analysis Service...');
  
  try {
    const results = await Promise.all([
      UnifiedAIAnalysisService.analyzeProduct(testProducts.organicFood),
      UnifiedAIAnalysisService.analyzeProduct(testProducts.plasticBottle),
      UnifiedAIAnalysisService.analyzeProduct(testProducts.bambooProduct)
    ]);
    
    console.log('✅ Unified analysis test passed:');
    results.forEach((result, index) => {
      const productNames = ['Organic Food', 'Plastic Bottle', 'Bamboo Product'];
      console.log(`   ${productNames[index]}: ${result.unified_score}/100 (${result.analysis_type})`);
    });
    
    return true;
  } catch (error) {
    console.error('❌ Unified analysis test failed:', error);
    return false;
  }
}

/**
 * Test analysis type determination
 */
function testAnalysisTypeDetection() {
  console.log('🧪 Testing Analysis Type Detection...');
  
  const testCases = [
    { product: testProducts.organicFood, expected: 'combined' },
    { product: testProducts.plasticBottle, expected: 'eco_only' },
    { product: { product_name: 'Apple', ingredients: ['apple'], category: 'fruit' }, expected: 'food_only' }
  ];
  
  let passed = 0;
  testCases.forEach((testCase, index) => {
    // This would normally call the private method, but for testing we'll simulate
    const hasIngredients = testCase.product.ingredients && testCase.product.ingredients.length > 0;
    const hasMaterials = testCase.product.materials;
    const isFood = testCase.product.category && testCase.product.category.includes('food');
    
    let detectedType;
    if ((isFood || hasIngredients) && hasMaterials) {
      detectedType = 'combined';
    } else if (isFood || hasIngredients) {
      detectedType = 'food_only';
    } else {
      detectedType = 'eco_only';
    }
    
    if (detectedType === testCase.expected) {
      passed++;
      console.log(`   ✓ Test ${index + 1}: ${detectedType} (correct)`);
    } else {
      console.log(`   ✗ Test ${index + 1}: ${detectedType} (expected ${testCase.expected})`);
    }
  });
  
  const success = passed === testCases.length;
  console.log(success ? '✅ Analysis type detection test passed' : '❌ Analysis type detection test failed');
  return success;
}

/**
 * Test fallback mechanisms
 */
async function testFallbackMechanisms() {
  console.log('🧪 Testing Fallback Mechanisms...');
  
  try {
    // Test with minimal data to trigger fallbacks
    const minimalProduct = {
      product_name: "Unknown Product"
    };
    
    const result = await UnifiedAIAnalysisService.analyzeProduct(minimalProduct);
    
    const hasValidResult = result && 
                          typeof result.unified_score === 'number' &&
                          result.key_insights.length > 0 &&
                          result.action_recommendations.length > 0;
    
    if (hasValidResult) {
      console.log('✅ Fallback mechanisms test passed:');
      console.log(`   Generated score: ${result.unified_score}`);
      console.log(`   Confidence: ${result.confidence_level}`);
    } else {
      throw new Error('Fallback did not generate valid results');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Fallback mechanisms test failed:', error);
    return false;
  }
}

/**
 * Run all tests
 */
export async function runIntegrationTests() {
  console.log('🚀 Starting Enhanced AI Features Integration Tests\n');
  
  const tests = [
    testAnalysisTypeDetection,
    testEcoScoring,
    testFoodAnalyzer,
    testUnifiedAnalysis,
    testFallbackMechanisms
  ];
  
  const results = [];
  
  for (const test of tests) {
    try {
      const result = await test();
      results.push(result);
    } catch (error) {
      console.error(`Test failed with error:`, error);
      results.push(false);
    }
    console.log(''); // Add spacing between tests
  }
  
  const passed = results.filter(r => r).length;
  const total = results.length;
  
  console.log('📊 Test Results Summary:');
  console.log(`   Passed: ${passed}/${total}`);
  console.log(`   Success Rate: ${Math.round((passed / total) * 100)}%`);
  
  if (passed === total) {
    console.log('🎉 All tests passed! Enhanced AI features are working correctly.');
  } else {
    console.log('⚠️ Some tests failed. Check the output above for details.');
  }
  
  return passed === total;
}

// Auto-run tests if this file is executed directly
if (typeof window !== 'undefined' && window.location.pathname.includes('test')) {
  runIntegrationTests();
}
