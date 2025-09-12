// Supabase Edge Function for generating eco-friendly alternatives
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AlternativeRequest {
  product_name: string
  brand?: string
  category?: string
  eco_score?: number
  price_range?: 'budget' | 'mid' | 'premium'
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const input: AlternativeRequest = await req.json()
    
    if (!input.product_name) {
      throw new Error('Product name is required')
    }

    // TODO: Replace with actual AI API for generating alternatives
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')
    
    // For now, return curated alternatives based on category
    const alternatives = generateAlternatives(input)

    if (GEMINI_API_KEY) {
      // Enhanced alternatives using AI
      try {
        const aiAlternatives = await generateAIAlternatives(input, GEMINI_API_KEY)
        return new Response(
          JSON.stringify({
            success: true,
            data: aiAlternatives
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          },
        )
      } catch (aiError) {
        console.log('AI alternatives failed, using fallback:', aiError)
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: alternatives
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Alternatives generation error:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})

function generateAlternatives(input: AlternativeRequest) {
  const category = input.category?.toLowerCase() || ''
  const productName = input.product_name.toLowerCase()
  
  // Water bottles
  if (productName.includes('water bottle') || productName.includes('bottle')) {
    return [
      {
        id: 'alt-steel-bottle',
        name: 'Stainless Steel Water Bottle',
        brand: 'EcoLife',
        eco_score: 92,
        price: 24.99,
        savings_percentage: 85,
        carbon_footprint: 8.2,
        reasons: [
          'Reusable for years, eliminating single-use plastics',
          'No BPA or harmful chemicals',
          'Keeps drinks cold for 24h, hot for 12h',
          'Fully recyclable stainless steel construction'
        ],
        badges: ['🌱', '♻️', '⭐']
      },
      {
        id: 'alt-glass-bottle',
        name: 'Borosilicate Glass Bottle',
        brand: 'PureGlass',
        eco_score: 88,
        price: 19.99,
        savings_percentage: 78,
        carbon_footprint: 12.1,
        reasons: [
          '100% recyclable and reusable glass',
          'No plastic taste or chemical leaching',
          'Dishwasher safe and easy to clean',
          'Silicone sleeve for protection'
        ],
        badges: ['♻️', '🌱', '💧']
      }
    ]
  }
  
  // Clothing items
  if (category.includes('clothing') || productName.includes('shirt') || productName.includes('jeans')) {
    return [
      {
        id: 'alt-organic-cotton',
        name: 'Organic Cotton T-Shirt',
        brand: 'EarthWear',
        eco_score: 85,
        price: 29.99,
        savings_percentage: 70,
        carbon_footprint: 12.4,
        reasons: [
          '100% certified organic cotton',
          'Fair trade manufacturing',
          'Non-toxic dyes and processes',
          'Biodegradable packaging'
        ],
        badges: ['🌱', '♻️', '🏷️']
      },
      {
        id: 'alt-recycled-fabric',
        name: 'Recycled Fabric Shirt',
        brand: 'ReNew',
        eco_score: 82,
        price: 34.99,
        savings_percentage: 65,
        carbon_footprint: 15.8,
        reasons: [
          'Made from 80% recycled materials',
          'Reduces textile waste in landfills',
          'Carbon-neutral shipping',
          'Recyclable at end of life'
        ],
        badges: ['♻️', '🌍', '⭐']
      }
    ]
  }
  
  // Food and beverages
  if (category.includes('food') || category.includes('beverage')) {
    return [
      {
        id: 'alt-organic-food',
        name: 'Organic Alternative',
        brand: 'Nature\'s Best',
        eco_score: 88,
        price: 6.99,
        savings_percentage: 45,
        carbon_footprint: 8.5,
        reasons: [
          'Certified organic ingredients',
          'No synthetic pesticides or fertilizers',
          'Supports biodiversity',
          'Minimal processing'
        ],
        badges: ['🌱', '🏷️', '🐝']
      },
      {
        id: 'alt-local-produce',
        name: 'Local Organic Option',
        brand: 'Local Farms Co-op',
        eco_score: 92,
        price: 5.49,
        savings_percentage: 60,
        carbon_footprint: 3.2,
        reasons: [
          'Locally sourced within 100 miles',
          'Seasonal and fresh',
          'Supports local farmers',
          'Minimal transportation emissions'
        ],
        badges: ['🌱', '🚚', '🏠']
      }
    ]
  }
  
  // Default alternatives
  return [
    {
      id: 'alt-eco-friendly',
      name: 'Eco-Friendly Alternative',
      brand: 'GreenChoice',
      eco_score: 82,
      price: 22.99,
      savings_percentage: 50,
      carbon_footprint: 15.0,
      reasons: [
        'Sustainable materials and production',
        'Reduced environmental impact',
        'Ethically sourced components',
        'Recyclable packaging'
      ],
      badges: ['🌱', '♻️']
    }
  ]
}

async function generateAIAlternatives(input: AlternativeRequest, apiKey: string) {
  const prompt = `Generate 2-3 eco-friendly alternatives for: ${input.product_name} (${input.brand || 'Unknown brand'})
  
  Category: ${input.category || 'General'}
  Current eco-score: ${input.eco_score || 'Unknown'}
  
  Return JSON array with this structure:
  [
    {
      "name": "Alternative product name",
      "brand": "Brand name",
      "eco_score": 85,
      "price": 24.99,
      "savings_percentage": 60,
      "carbon_footprint": 12.5,
      "reasons": ["Specific eco benefit 1", "Specific eco benefit 2", "Specific eco benefit 3"],
      "badges": ["🌱", "♻️"]
    }
  ]
  
  Focus on real, sustainable alternatives that are actually better for the environment.`

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          topK: 1,
          topP: 1,
          maxOutputTokens: 2048,
        },
      }),
    }
  )

  const data = await response.json()
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text

  try {
    const jsonMatch = content.match(/\[[\s\S]*\]/)
    return JSON.parse(jsonMatch ? jsonMatch[0] : content)
  } catch {
    return generateAlternatives(input)
  }
}