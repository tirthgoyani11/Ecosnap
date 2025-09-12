/**
 * Test Gemini API connectivity and key validity
 */

export class GeminiAPITester {
  private static readonly GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

  /**
   * Test basic Gemini API connection
   */
  static async testConnection(): Promise<{ success: boolean; error?: string; details?: any }> {
    try {
      console.log('🧪 Testing Gemini API connection...');
      
      if (!this.GEMINI_API_KEY || this.GEMINI_API_KEY === 'demo-key') {
        return {
          success: false,
          error: 'No API key configured. Please set VITE_GEMINI_API_KEY in your .env file.'
        };
      }

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': this.GEMINI_API_KEY
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: "Hello! Please respond with a simple JSON object: {\"status\": \"working\", \"message\": \"API connection successful\"}"
            }]
          }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 100
          }
        })
      });

      console.log('📡 API Response Status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error:', errorText);
        
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        
        try {
          const errorData = JSON.parse(errorText);
          if (errorData.error?.message) {
            errorMessage = errorData.error.message;
          }
        } catch (e) {
          // Use the raw error text if JSON parsing fails
          errorMessage = errorText.substring(0, 200);
        }

        return {
          success: false,
          error: errorMessage,
          details: {
            status: response.status,
            statusText: response.statusText,
            errorText
          }
        };
      }

      const result = await response.json();
      console.log('✅ API Test Successful:', result);

      return {
        success: true,
        details: result
      };

    } catch (error) {
      console.error('❌ Connection test failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        details: error
      };
    }
  }

  /**
   * Test Gemini Vision API with a simple base64 image
   */
  static async testVisionAPI(): Promise<{ success: boolean; error?: string; details?: any }> {
    try {
      // Simple 1x1 pixel red image in base64
      const testImage = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';

      console.log('🧪 Testing Gemini Vision API...');

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': this.GEMINI_API_KEY
        },
        body: JSON.stringify({
          contents: [{
            parts: [
              {
                text: "Describe this image briefly and respond with JSON: {\"description\": \"your description here\"}"
              },
              {
                inline_data: {
                  mime_type: "image/png",
                  data: testImage
                }
              }
            ]
          }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 100
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        return {
          success: false,
          error: `Vision API test failed: ${response.status} - ${errorText}`,
          details: { status: response.status, errorText }
        };
      }

      const result = await response.json();
      console.log('✅ Vision API Test Successful:', result);

      return {
        success: true,
        details: result
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Vision API test failed',
        details: error
      };
    }
  }

  /**
   * Run comprehensive API tests
   */
  static async runAllTests(): Promise<void> {
    console.log('🔍 Running Gemini API diagnostics...');
    
    // Test basic connection
    const connectionTest = await this.testConnection();
    console.log('Basic API Test:', connectionTest);

    if (connectionTest.success) {
      // Test vision API
      const visionTest = await this.testVisionAPI();
      console.log('Vision API Test:', visionTest);
    }

    // Log API key info (masked)
    const maskedKey = this.GEMINI_API_KEY 
      ? `${this.GEMINI_API_KEY.substring(0, 8)}...${this.GEMINI_API_KEY.substring(this.GEMINI_API_KEY.length - 4)}`
      : 'Not configured';
    console.log('API Key Status:', maskedKey);
  }
}
