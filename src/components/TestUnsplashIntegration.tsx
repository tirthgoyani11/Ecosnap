// Test your Unsplash API integration
import RealProductAPI from '../lib/real-product-api';

export const TestUnsplashIntegration = () => {
  const testUnsplashAPI = async () => {
    try {
      console.log('🧪 Testing Unsplash API integration...');
      
      // Test different product types
      const testProducts = [
        'organic coffee beans',
        'eco friendly water bottle',
        'sustainable clothing',
        'bamboo toothbrush'
      ];
      
      for (const product of testProducts) {
        console.log(`\n🔍 Fetching image for: ${product}`);
        const imageUrl = await RealProductAPI.getProductImage(product);
        console.log(`📸 Image URL: ${imageUrl}`);
        
        if (imageUrl !== '/placeholder.svg') {
          console.log('✅ Successfully fetched real Unsplash image!');
        } else {
          console.log('⚠️ Using fallback placeholder');
        }
      }
      
    } catch (error) {
      console.error('❌ Unsplash test failed:', error);
    }
  };

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">🧪 API Integration Test</h3>
      <button 
        onClick={testUnsplashAPI}
        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
      >
        Test Unsplash API Integration
      </button>
      <p className="text-sm text-gray-600 mt-2">
        Check browser console for detailed results
      </p>
    </div>
  );
};

export default TestUnsplashIntegration;
