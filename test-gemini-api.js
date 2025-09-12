/**
 * Simple Node.js script to test Gemini API
 * Run with: node test-gemini-api.js
 */

const API_KEY = ''; // Your API key

async function testGeminiAPI() {
  try {
    console.log('🧪 Testing Gemini 2.0 Flash API...');
    
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': API_KEY
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: 'Hello! Please respond with: {"status": "working", "message": "API is functional"}'
          }]
        }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 100
        }
      })
    });

    console.log('Response Status:', response.status);
    console.log('Response Headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error Response:', errorText);
      return;
    }

    const result = await response.json();
    console.log('✅ Success Response:', JSON.stringify(result, null, 2));

  } catch (error) {
    console.error('❌ Test Failed:', error);
  }
}

// For Node.js environments
if (typeof require !== 'undefined' && require.main === module) {
  testGeminiAPI();
}

// For browser environments
if (typeof window !== 'undefined') {
  window.testGeminiAPI = testGeminiAPI;
}
