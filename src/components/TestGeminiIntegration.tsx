// Test Gemini AI Integration for Eco Scoring
import { useState } from 'react';
import { useEcoScore } from '@/hooks/useEcoScore';

export const TestGeminiIntegration = () => {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { calculateEcoScore } = useEcoScore();

  const testProducts = [
    {
      product_name: 'Organic Fair Trade Coffee',
      brand: 'Sustainable Grounds',
      category: 'Beverages',
      packaging: ['recyclable aluminum', 'compostable liner'],
      ingredients: ['organic coffee beans', 'fair trade certified'],
      organic: true,
      fair_trade: true
    },
    {
      product_name: 'Plastic Water Bottle',
      brand: 'AquaCorp',
      category: 'Beverages',
      packaging: ['single-use plastic'],
      ingredients: ['purified water'],
      organic: false,
      fair_trade: false
    },
    {
      product_name: 'Bamboo Toothbrush',
      brand: 'EcoSmile',
      category: 'Personal Care',
      packaging: ['cardboard box', 'no plastic'],
      ingredients: ['bamboo handle', 'plant-based bristles'],
      organic: true,
      fair_trade: false
    }
  ];

  const runGeminiTests = async () => {
    setIsLoading(true);
    setTestResults([]);
    
    console.log('🧪 Starting Gemini AI Eco-Scoring Tests...');
    
    for (let i = 0; i < testProducts.length; i++) {
      const product = testProducts[i];
      console.log(`\n🔍 Testing product ${i + 1}: ${product.product_name}`);
      
      try {
        const result = await calculateEcoScore(product);
        
        setTestResults(prev => [...prev, {
          product: product.product_name,
          result,
          success: !!result,
          timestamp: new Date().toLocaleTimeString()
        }]);
        
        if (result) {
          console.log(`✅ AI Score: ${result.overall_score}/100 for ${product.product_name}`);
        }
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`❌ Test failed for ${product.product_name}:`, error);
        setTestResults(prev => [...prev, {
          product: product.product_name,
          result: null,
          success: false,
          error: error.message,
          timestamp: new Date().toLocaleTimeString()
        }]);
      }
    }
    
    setIsLoading(false);
    console.log('🏁 Gemini AI testing complete!');
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">🤖 Gemini AI Integration Test</h2>
      
      <div className="mb-6">
        <button 
          onClick={runGeminiTests}
          disabled={isLoading}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {isLoading ? '🔄 Testing AI Eco-Scoring...' : '🚀 Test Gemini AI Integration'}
        </button>
      </div>

      {testResults.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-700">Test Results:</h3>
          
          {testResults.map((test, index) => (
            <div key={index} className={`p-4 rounded-lg border-l-4 ${
              test.success ? 'bg-green-50 border-green-400' : 'bg-red-50 border-red-400'
            }`}>
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium text-gray-800">{test.product}</h4>
                <span className="text-sm text-gray-500">{test.timestamp}</span>
              </div>
              
              {test.success && test.result ? (
                <div className="space-y-2">
                  <div className="text-lg font-bold text-green-600">
                    Overall Score: {test.result.overall_score}/100
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>🌱 Carbon: {test.result.carbon_footprint_score}/100</div>
                    <div>♻️ Recyclable: {test.result.recyclability_score}/100</div>
                    <div>🌍 Sustainable: {test.result.sustainability_score}/100</div>
                    <div>📦 Packaging: {test.result.packaging_score}/100</div>
                  </div>
                </div>
              ) : (
                <div className="text-red-600">
                  ❌ Failed: {test.error || 'Unknown error'}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-700 mb-2">💡 What this tests:</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>✅ Gemini API key authentication</li>
          <li>✅ AI-powered eco-scoring algorithm</li>
          <li>✅ Multi-factor environmental analysis</li>
          <li>✅ Real-time product assessment</li>
          <li>✅ JSON response parsing</li>
        </ul>
        <p className="text-xs text-gray-500 mt-3">
          Check browser console for detailed API responses and debugging info.
        </p>
      </div>
    </div>
  );
};

export default TestGeminiIntegration;
