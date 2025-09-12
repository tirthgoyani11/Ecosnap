import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { EcoScoreBreakdown } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

// Enhanced AI-powered eco score calculation
const calculateAdvancedEcoScore = async (productData: any): Promise<EcoScoreBreakdown> => {
  try {
    // Try to get real eco data first
    const realScore = await calculateRealEcoScore(productData);
    if (realScore) return realScore;
  } catch (error) {
    console.log('Real API unavailable, using enhanced algorithm');
  }

  // Enhanced calculation with more sophisticated logic
  let baseScore = 50; // Start with neutral score
  let carbonScore = 50;
  let recyclabilityScore = 50;
  let sustainabilityScore = 50;
  let packagingScore = 50;
  
  // Brand analysis
  const brand = productData.brand?.toLowerCase() || '';
  if (brand.includes('organic') || brand.includes('eco') || brand.includes('green')) {
    baseScore += 15;
    sustainabilityScore += 20;
  }
  
  // Product name analysis
  const productName = productData.product_name?.toLowerCase() || '';
  if (productName.includes('organic')) baseScore += 20;
  if (productName.includes('recycled')) recyclabilityScore += 25;
  if (productName.includes('sustainable')) sustainabilityScore += 20;
  if (productName.includes('eco')) baseScore += 15;
  if (productName.includes('bamboo') || productName.includes('hemp')) sustainabilityScore += 30;
  
  // Advanced packaging analysis
  const packaging = (productData.packaging?.join(' ') || '').toLowerCase();
  if (packaging.includes('glass')) {
    packagingScore += 25;
    recyclabilityScore += 20;
  } else if (packaging.includes('aluminum')) {
    packagingScore += 20;
    recyclabilityScore += 25;
  } else if (packaging.includes('cardboard') || packaging.includes('paper')) {
    packagingScore += 15;
    recyclabilityScore += 15;
  } else if (packaging.includes('plastic')) {
    packagingScore -= 15;
    recyclabilityScore -= 10;
  }
  
  // Ingredients analysis
  const ingredients = (productData.ingredients?.join(' ') || '').toLowerCase();
  if (ingredients.includes('organic')) sustainabilityScore += 20;
  if (ingredients.includes('natural')) sustainabilityScore += 10;
  if (ingredients.includes('artificial') || ingredients.includes('synthetic')) {
    sustainabilityScore -= 15;
    carbonScore -= 10;
  }
  
  // Category-specific scoring
  const category = productData.category?.toLowerCase() || '';
  if (category.includes('food')) {
    if (category.includes('meat')) carbonScore -= 20;
    if (category.includes('plant') || category.includes('vegan')) carbonScore += 15;
    if (category.includes('local')) carbonScore += 10;
  }
  
  // Apply boolean flags
  if (productData.organic) {
    baseScore += 20;
    sustainabilityScore += 25;
    carbonScore += 15;
  }
  if (productData.local) {
    carbonScore += 20;
    sustainabilityScore += 15;
  }
  if (productData.fair_trade) {
    sustainabilityScore += 20;
  }
  if (productData.recyclable === false) {
    recyclabilityScore -= 30;
  }
  
  // Apply carbon footprint data if available
  if (productData.carbon_footprint) {
    const footprint = productData.carbon_footprint;
    if (footprint < 1) carbonScore += 20;
    else if (footprint < 3) carbonScore += 10;
    else if (footprint > 8) carbonScore -= 20;
    else if (footprint > 5) carbonScore -= 10;
  }
  
  // Normalize scores (keep within 0-100 range)
  const normalizeScore = (score: number) => Math.max(0, Math.min(100, score));
  
  const finalCarbonScore = normalizeScore(carbonScore);
  const finalRecyclabilityScore = normalizeScore(recyclabilityScore);
  const finalSustainabilityScore = normalizeScore(sustainabilityScore);
  const finalPackagingScore = normalizeScore(packagingScore);
  
  // Calculate weighted overall score
  const overallScore = Math.round(
    (finalCarbonScore * 0.3) + 
    (finalRecyclabilityScore * 0.25) + 
    (finalSustainabilityScore * 0.25) + 
    (finalPackagingScore * 0.2)
  );
  
  return {
    overall_score: overallScore,
    carbon_footprint_score: finalCarbonScore,
    recyclability_score: finalRecyclabilityScore,
    sustainability_score: finalSustainabilityScore,
    packaging_score: finalPackagingScore,
    factors: [
      {
        name: 'Carbon Footprint',
        score: finalCarbonScore,
        weight: 30,
        description: 'CO₂ emissions from production, transport, and lifecycle'
      },
      {
        name: 'Recyclability',
        score: finalRecyclabilityScore,
        weight: 25,
        description: 'How easily materials can be recycled or reused'
      },
      {
        name: 'Sustainability',
        score: finalSustainabilityScore,
        weight: 25,
        description: 'Long-term environmental impact and resource use'
      },
      {
        name: 'Packaging',
        score: finalPackagingScore,
        weight: 20,
        description: 'Environmental impact of packaging materials and design'
      }
    ]
  };
};

// Real API integration for eco scoring
const calculateRealEcoScore = async (productData: any): Promise<EcoScoreBreakdown | null> => {
  try {
    const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!geminiKey) {
      console.log('⚠️ Gemini API key not configured');
      return null;
    }

    console.log('🤖 Using Gemini AI for eco-scoring...');
    
    // Try Gemini AI API for advanced analysis
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Analyze this product for environmental impact and provide eco scores (0-100 for each category):
            
            Product: ${productData.product_name || 'Unknown'}
            Brand: ${productData.brand || 'Unknown'}
            Category: ${productData.category || 'General'}
            Packaging: ${productData.packaging?.join(', ') || 'Unknown'}
            Ingredients: ${productData.ingredients?.join(', ') || 'Unknown'}
            
            Provide scores for:
            1. Carbon Footprint (production, transport, lifecycle CO₂ impact)
            2. Recyclability (how easily materials can be recycled/reused)
            3. Sustainability (long-term environmental impact, resource use)
            4. Packaging (environmental impact of packaging materials)
            
            Respond ONLY with valid JSON in this exact format:
            {
              "carbon": 75,
              "recyclability": 80,
              "sustainability": 70,
              "packaging": 85,
              "overall": 77,
              "reasoning": "Brief explanation of the overall assessment"
            }`
          }]
        }]
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (content) {
        console.log('🤖 Gemini AI response:', content);
        
        // Extract JSON from the response
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const scores = JSON.parse(jsonMatch[0]);
          
          console.log('✅ Gemini AI eco scores:', scores);
          
          return {
            overall_score: scores.overall || 50,
            carbon_footprint_score: scores.carbon || 50,
            recyclability_score: scores.recyclability || 50,
            sustainability_score: scores.sustainability || 50,
            packaging_score: scores.packaging || 50,
            factors: [
              { 
                name: 'Carbon Footprint', 
                score: scores.carbon || 50, 
                weight: 30, 
                description: 'AI-analyzed CO₂ impact from production and lifecycle' 
              },
              { 
                name: 'Recyclability', 
                score: scores.recyclability || 50, 
                weight: 25, 
                description: 'AI-assessed recyclability of materials and packaging' 
              },
              { 
                name: 'Sustainability', 
                score: scores.sustainability || 50, 
                weight: 25, 
                description: 'AI-evaluated long-term environmental sustainability' 
              },
              { 
                name: 'Packaging', 
                score: scores.packaging || 50, 
                weight: 20, 
                description: 'AI-reviewed packaging environmental impact' 
              }
            ]
          };
        }
      }
    } else {
      console.error('❌ Gemini API error:', response.status, await response.text());
    }
  } catch (error) {
    console.error('❌ Gemini AI API error:', error);
  }
  
  return null;
};

export const useEcoScore = () => {
  const [isCalculating, setIsCalculating] = useState(false);
  const { toast } = useToast();

  const calculateEcoScore = async (productData: {
    product_name: string;
    brand?: string;
    category?: string;
    materials?: string[];
    packaging?: string[];
    ingredients?: string[];
    carbon_footprint?: number;
    recyclable?: boolean;
    organic?: boolean;
    local?: boolean;
    fair_trade?: boolean;
  }): Promise<EcoScoreBreakdown | null> => {
    setIsCalculating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('eco-score', {
        body: productData
      });

      if (!error && data?.success) {
        setIsCalculating(false);
        return data.data;
      }

      // Fallback to enhanced calculation
      const mockScore = await calculateAdvancedEcoScore(productData);
      
      setIsCalculating(false);
      toast({
        title: "Eco Score Calculated",
        description: `Score: ${mockScore.overall_score}/100 (Demo Mode)`,
      });
      
      return mockScore;

    } catch (error) {
      console.error('Eco-score calculation error:', error);
      
      // Always provide a fallback score
      const mockScore = await calculateAdvancedEcoScore(productData);
      
      setIsCalculating(false);
      toast({
        title: "Demo Mode",
        description: `Eco Score: ${mockScore.overall_score}/100`,
      });
      
      return mockScore;
      console.error('Eco-score API error:', error);
      toast({
        title: "Network Error",
        description: "Please check your connection and try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsCalculating(false);
    }
  };

  return {
    calculateEcoScore,
    isCalculating
  };
};