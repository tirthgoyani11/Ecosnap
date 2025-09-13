/**
 * Test script to verify the Enhanced Product Enrichment Service
 * This tests the real API integrations without the UI
 */

import { ProductDataEnrichment } from '../src/lib/enhanced-product-enrichment';

async function testRealDataEnrichment() {
  console.log('🧪 Testing Enhanced Product Data Enrichment Service...\n');

  // Test 1: Barcode enrichment (real product)
  console.log('📊 Test 1: Barcode Enrichment');
  try {
    const barcodeResult = await ProductDataEnrichment.enrichProductData({
      productName: 'Coca Cola',
      barcode: '5449000000996', // Real Coca-Cola barcode
      confidence: 0.95,
      source: 'barcode'
    });
    
    console.log('✅ Barcode Result:', {
      name: barcodeResult.productName,
      brand: barcodeResult.brand,
      category: barcodeResult.category,
      ecoScore: barcodeResult.ecoScore,
      confidence: barcodeResult.confidence,
      dataSources: barcodeResult.dataSources,
      imageUrl: barcodeResult.imageUrl ? 'Has Image' : 'No Image',
      alternativesCount: barcodeResult.alternatives?.length || 0
    });
  } catch (error) {
    console.error('❌ Barcode test failed:', error);
  }

  console.log('\n---\n');

  // Test 2: Product name enrichment
  console.log('📊 Test 2: Product Name Enrichment');
  try {
    const nameResult = await ProductDataEnrichment.enrichProductData({
      productName: 'iPhone 15',
      confidence: 0.90,
      source: 'ai_detection'
    });
    
    console.log('✅ Product Name Result:', {
      name: nameResult.productName,
      brand: nameResult.brand,
      category: nameResult.category,
      ecoScore: nameResult.ecoScore,
      confidence: nameResult.confidence,
      dataSources: nameResult.dataSources,
      imageUrl: nameResult.imageUrl ? 'Has Image' : 'No Image',
      alternativesCount: nameResult.alternatives?.length || 0
    });
  } catch (error) {
    console.error('❌ Product name test failed:', error);
  }

  console.log('\n---\n');

  // Test 3: Basic product enrichment (fallback test)
  console.log('📊 Test 3: Basic Product Enrichment');
  try {
    const basicResult = await ProductDataEnrichment.enrichProductData({
      productName: 'Unknown Test Product',
      confidence: 0.60,
      source: 'ai_detection'
    });
    
    console.log('✅ Basic Result:', {
      name: basicResult.productName,
      brand: basicResult.brand,
      category: basicResult.category,
      ecoScore: basicResult.ecoScore,
      confidence: basicResult.confidence,
      dataSources: basicResult.dataSources,
      imageUrl: basicResult.imageUrl ? 'Has Image' : 'No Image',
      alternativesCount: basicResult.alternatives?.length || 0
    });
  } catch (error) {
    console.error('❌ Basic enrichment test failed:', error);
  }

  console.log('\n🎉 Enhanced Product Data Enrichment Tests Complete!');
}

// Run the test
testRealDataEnrichment().catch(console.error);