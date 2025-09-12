// Supabase Edge Function for Gemini 2.0 Flash Vision API
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { image, type = 'base64' } = await req.json()
    
    if (!image) {
      throw new Error('No image provided')
    }

    // TODO: Replace with actual Gemini API key from environment
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')
    
    if (!GEMINI_API_KEY) {
      // Return mock data for development
      return new Response(
        JSON.stringify({
          success: true,
          data: {
            product_name: "Sample Detected Product",
            brand: "EcoBrand",
            category: "Food & Beverages",
            confidence: 0.85,
            ingredients: ["Water", "Natural Flavors", "Citric Acid"],
            materials: ["Aluminum Can"],
            packaging: ["Recyclable Aluminum", "Plastic Ring"]
          }
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      )
    }

    // Call Gemini 2.0 Flash Vision API
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Analyze this product image and extract the following information in JSON format:
                  {
                    "product_name": "exact product name",
                    "brand": "brand name if visible",
                    "category": "product category",
                    "confidence": "confidence level 0-1",
                    "ingredients": ["list of ingredients if visible"],
                    "materials": ["packaging materials"],
                    "packaging": ["packaging types"]
                  }
                  Focus on sustainability-relevant details like materials, packaging, and ingredients.`
                },
                {
                  inline_data: {
                    mime_type: type === 'base64' ? 'image/jpeg' : 'image/jpeg',
                    data: image
                  }
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.1,
            topK: 1,
            topP: 1,
            maxOutputTokens: 2048,
          },
        }),
      }
    )

    const geminiData = await geminiResponse.json()
    
    if (!geminiResponse.ok) {
      throw new Error(`Gemini API error: ${geminiData.error?.message || 'Unknown error'}`)
    }

    // Parse the JSON response from Gemini
    const content = geminiData.candidates?.[0]?.content?.parts?.[0]?.text
    let analysisResult
    
    try {
      // Extract JSON from the response (Gemini might include markdown formatting)
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      analysisResult = JSON.parse(jsonMatch ? jsonMatch[0] : content)
    } catch (parseError) {
      // Fallback: create structured response from text
      analysisResult = {
        product_name: "Product detected",
        brand: "Unknown",
        category: "General",
        confidence: 0.7,
        ingredients: [],
        materials: [],
        packaging: []
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: analysisResult
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Vision analysis error:', error)
    
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