interface GeminiResponse {
  text: string;
  responseType: 'text' | 'eco_comparison' | 'data_table' | 'visual_mock';
  data?: any;
  suggestions?: string[];
}

interface EcoProduct {
  name: string;
  eco_score: string;
  carbon_footprint: string;
  packaging: string;
  sustainability: string;
  price?: string;
  availability?: string;
}

interface UserEcoStats {
  total_scans: number;
  carbon_saved: string;
  eco_score: string;
  current_rank: number;
  achievement_level: string;
  monthly_progress: number;
}

export class InsenAIService {
  private apiKey: string;
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

  constructor() {
    // In production, this should be stored in environment variables
    // For now, we'll use a placeholder or make API calls optional
    this.apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || '';
  }

  async generateResponse(
    userInput: string,
    productContext?: any,
    userContext?: any
  ): Promise<GeminiResponse> {
    try {
      // If no API key is available, use fallback responses immediately
      if (!this.apiKey) {
        console.warn('Gemini API key not configured, using fallback responses');
        return this.generateFallbackResponse(userInput, productContext, userContext);
      }

      // Enhanced prompt engineering for eco-focused responses
      const systemPrompt = this.buildSystemPrompt(productContext, userContext);
      const enhancedPrompt = `${systemPrompt}\n\nUser Query: ${userInput}\n\nProvide a helpful, eco-focused response with actionable insights.`;

      const requestBody = {
        contents: [{
          parts: [{
            text: enhancedPrompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      };

      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'I apologize, but I encountered an issue generating a response.';

      // Process and categorize the response
      return this.processGeminiResponse(generatedText, userInput, productContext, userContext);

    } catch (error) {
      console.error('Gemini API Error:', error);
      return this.generateFallbackResponse(userInput, productContext, userContext);
    }
  }

  private buildSystemPrompt(productContext?: any, userContext?: any): string {
    let prompt = `You are Insen AI, an advanced eco-smart assistant for EcoSnap. Your role is to help users make sustainable choices and understand environmental impact.

Key Guidelines:
- Always provide eco-friendly insights and suggestions
- Use emojis to make responses engaging (🌱, ♻️, 🌍, 📊, etc.)
- Focus on sustainability, carbon footprint, and environmental impact
- Provide actionable recommendations
- Be encouraging about the user's eco-journey
- Include relevant data when possible

EcoSnap Features You Can Reference:
- Product scanning and eco-scoring
- Carbon footprint tracking
- Sustainable alternatives discovery
- Leaderboard and achievement system
- Bulk scanning capabilities`;

    if (productContext) {
      prompt += `\n\nCurrent Product Context:
- Product: ${productContext.name || 'Unknown Product'}
- Category: ${productContext.category || 'General'}
- Eco Score: ${productContext.eco_score || 'Not rated'}
- Carbon Impact: ${productContext.carbon_footprint || 'Unknown'}`;
    }

    if (userContext) {
      prompt += `\n\nUser Context:
- Total Scans: ${userContext.total_scans || 0}
- Achievement Level: ${userContext.achievement_level || 'Beginner'}
- Current Rank: ${userContext.current_rank || 'Not ranked'}
- Carbon Saved: ${userContext.carbon_saved || '0 kg CO₂'}`;
    }

    return prompt;
  }

  private processGeminiResponse(
    generatedText: string,
    userInput: string,
    productContext?: any,
    userContext?: any
  ): GeminiResponse {
    const lowerInput = userInput.toLowerCase();

    // Determine response type based on user input and generated content
    let responseType: GeminiResponse['responseType'] = 'text';
    let data = null;
    let suggestions: string[] = [];

    // Product comparison responses
    if (lowerInput.includes('compare') || lowerInput.includes('alternative') || lowerInput.includes('versus')) {
      responseType = 'eco_comparison';
      data = this.generateComparisonData(productContext);
      suggestions = ['🛒 Where to Buy', '💰 Price Comparison', '🌍 Environmental Impact', '⭐ User Reviews'];
    }
    
    // Stats and analytics responses
    else if (lowerInput.includes('stats') || lowerInput.includes('footprint') || lowerInput.includes('progress') || lowerInput.includes('dashboard')) {
      responseType = 'data_table';
      data = this.generateStatsData(userContext);
      suggestions = ['🎯 Set New Goals', '🏆 View Achievements', '📈 Monthly Report', '🌱 Improvement Tips'];
    }

    // Visual/mockup responses
    else if (lowerInput.includes('visual') || lowerInput.includes('chart') || lowerInput.includes('graph')) {
      responseType = 'visual_mock';
      data = this.generateVisualData(userContext);
      suggestions = ['📊 More Analytics', '🔍 Detailed View', '📱 Share Results', '💡 Insights'];
    }

    // Default suggestions for text responses
    if (suggestions.length === 0) {
      suggestions = ['🔍 Scan Product', '📊 View Stats', '🌱 Find Alternatives', '💡 Eco Tips'];
    }

    return {
      text: generatedText,
      responseType,
      data,
      suggestions
    };
  }

  private generateComparisonData(productContext?: any): any {
    return {
      products: [
        {
          name: `${productContext?.name || 'Eco-Friendly'} Option 🌿`,
          eco_score: 'A+',
          carbon_footprint: '1.2 kg CO₂',
          packaging: 'Biodegradable',
          sustainability: 'Excellent',
          price: '$12.99',
          availability: 'In Stock'
        },
        {
          name: 'Standard Option',
          eco_score: 'C',
          carbon_footprint: '3.1 kg CO₂',
          packaging: 'Plastic',
          sustainability: 'Fair',
          price: '$9.99',
          availability: 'Limited'
        }
      ],
      insights: [
        '📉 60% lower carbon footprint',
        '♻️ Biodegradable packaging reduces waste',
        '🌱 Supports sustainable farming practices',
        '💚 Higher long-term value for environment'
      ]
    };
  }

  private generateStatsData(userContext?: any): any {
    return {
      stats: {
        total_scans: userContext?.total_scans || 42,
        carbon_saved: userContext?.carbon_saved || '127.5 kg CO₂',
        eco_score: userContext?.achievement_level || 'Expert',
        current_rank: userContext?.current_rank || 15,
        monthly_progress: userContext?.monthly_progress || 78
      },
      progress: [
        { metric: 'Eco Scans', value: 85, max: 100, color: 'green' },
        { metric: 'Carbon Savings', value: 72, max: 100, color: 'blue' },
        { metric: 'Sustainable Choices', value: 91, max: 100, color: 'purple' },
        { metric: 'Monthly Goal', value: userContext?.monthly_progress || 65, max: 100, color: 'orange' }
      ],
      achievements: [
        { name: 'Eco Warrior', icon: '🌟', progress: 90 },
        { name: 'Carbon Saver', icon: '♻️', progress: 75 },
        { name: 'Green Scanner', icon: '📱', progress: 100 }
      ]
    };
  }

  private generateVisualData(userContext?: any): any {
    return {
      charts: [
        {
          type: 'impact_timeline',
          title: 'Your Eco Impact Over Time',
          data: [
            { month: 'Jan', carbon_saved: 15.2, scans: 12 },
            { month: 'Feb', carbon_saved: 22.1, scans: 18 },
            { month: 'Mar', carbon_saved: 31.5, scans: 25 },
            { month: 'Apr', carbon_saved: 28.7, scans: 22 },
            { month: 'May', carbon_saved: 35.8, scans: 29 }
          ]
        },
        {
          type: 'category_breakdown',
          title: 'Sustainable Choices by Category',
          data: [
            { category: 'Food & Beverage', percentage: 45, color: '#10b981' },
            { category: 'Personal Care', percentage: 25, color: '#3b82f6' },
            { category: 'Household', percentage: 20, color: '#8b5cf6' },
            { category: 'Fashion', percentage: 10, color: '#f59e0b' }
          ]
        }
      ]
    };
  }

  private generateFallbackResponse(
    userInput: string,
    productContext?: any,
    userContext?: any
  ): GeminiResponse {
    const lowerInput = userInput.toLowerCase();

    if (lowerInput.includes('compare') || lowerInput.includes('alternative')) {
      return {
        text: `🔍 I'd love to help you compare eco-friendly options! Based on your request about "${userInput}", here's what I found:`,
        responseType: 'eco_comparison',
        data: this.generateComparisonData(productContext),
        suggestions: ['🛒 Where to Buy', '💰 Price Comparison', '🌍 Environmental Impact']
      };
    }

    if (lowerInput.includes('stats') || lowerInput.includes('progress')) {
      return {
        text: `📊 Here's your current eco-impact summary:

**Total Carbon Footprint Reduced:** ${userContext?.carbon_saved || '127.5 kg CO₂'} 🌱 That's equivalent to planting approximately 15 trees – great work!

**Your Achievement Level:** ${userContext?.achievement_level || 'Expert'}
**Current Rank:** #${userContext?.current_rank || 15}`,
        responseType: 'data_table',
        data: this.generateStatsData(userContext),
        suggestions: ['🎯 Set Goals', '🏆 Achievements', '📈 Trends']
      };
    }

    return {
      text: `🌱 I understand you're asking about "${userInput}". As your eco-smart assistant, I'm here to help you make sustainable choices! 

While I'm processing your request, here are some quick actions you can take:

• 🔍 Scan a product to check its eco-score
• 📊 View your sustainability dashboard  
• 🌍 Find eco-friendly alternatives
• 💡 Get personalized eco-tips

What would you like to explore first?`,
      responseType: 'text',
      suggestions: ['🔍 Scan Product', '📊 My Stats', '🌱 Find Alternatives', '💡 Eco Tips']
    };
  }

  // Helper method to get smart suggestions based on context
  getSmartSuggestions(currentPage?: string, productContext?: any, userContext?: any): string[] {
    const baseSuggestions = ['🔍 Scan New Product', '📊 View Dashboard', '🌱 Find Alternatives'];

    switch (currentPage) {
      case 'scanner':
        return ['📷 Scan Product', '🔍 Compare Options', '♻️ Find Alternatives', '📊 View Results'];
      
      case 'dashboard':
        return ['📈 View Trends', '🎯 Set Goals', '🏆 Check Achievements', '💡 Get Tips'];
      
      case 'leaderboard':
        return ['🏆 My Ranking', '📊 Eco Stats', '🎯 Level Up Tips', '👥 Compare Friends'];
      
      case 'discover':
        return ['🌟 Featured Products', '🔍 Search Eco Items', '💚 Recommended', '📱 Scan to Compare'];
      
      default:
        return baseSuggestions;
    }
  }
}

export const insenAI = new InsenAIService();