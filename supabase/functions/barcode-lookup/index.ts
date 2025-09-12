// Supabase Edge Function for Open Food Facts barcode lookup
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { barcode } = await req.json()
    
    if (!barcode) {
      throw new Error('No barcode provided')
    }

    // Call Open Food Facts API
    const response = await fetch(
      `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`,
      {
        headers: {
          'User-Agent': 'EcoSnap-AI/1.0 (https://ecosnap.ai)'
        }
      }
    )

    const data = await response.json()
    
    if (!response.ok || data.status !== 1) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Product not found'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404,
        },
      )
    }

    const product = data.product
    
    const result = {
      success: true,
      data: {
        code: barcode,
        product_name: product.product_name || product.product_name_en || 'Unknown Product',
        brands: product.brands,
        image_url: product.image_url,
        categories: product.categories,
        ingredients_text: product.ingredients_text || product.ingredients_text_en,
        packaging: product.packaging,
        ecoscore_grade: product.ecoscore_grade,
        nutriscore_grade: product.nutriscore_grade,
        nova_group: product.nova_group,
        labels: product.labels,
        stores: product.stores,
        countries: product.countries,
        nutrition_grades: product.nutrition_grades,
        environmental_impact: {
          carbon_footprint: product.carbon_footprint_from_known_ingredients_debug,
          ecoscore_data: product.ecoscore_data
        }
      }
    }

    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Barcode lookup error:', error)
    
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