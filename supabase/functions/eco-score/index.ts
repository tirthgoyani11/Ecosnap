// Supabase Edge Function for transparent eco-score calculation
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EcoScoreInput {
  product_name: string
  brand?: string
  category?: string
  materials?: string[]
  packaging?: string[]
  ingredients?: string[]
  carbon_footprint?: number
  recyclable?: boolean
  organic?: boolean
  local?: boolean
  fair_trade?: boolean
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const input: EcoScoreInput = await req.json()
    
    if (!input.product_name) {
      throw new Error('Product name is required')
    }

    // Transparent eco-score calculation algorithm
    const factors = []
    let totalScore = 0
    let totalWeight = 0

    // 1. Carbon Footprint Score (30% weight)
    const carbonWeight = 0.30
    let carbonScore = 50 // Default middle score
    
    if (input.carbon_footprint !== undefined) {
      // Lower carbon footprint = higher score
      if (input.carbon_footprint <= 5) carbonScore = 100
      else if (input.carbon_footprint <= 15) carbonScore = 85
      else if (input.carbon_footprint <= 30) carbonScore = 70
      else if (input.carbon_footprint <= 50) carbonScore = 55
      else if (input.carbon_footprint <= 100) carbonScore = 35
      else carbonScore = 15
    }
    
    factors.push({
      name: "Carbon Footprint",
      score: carbonScore,
      weight: carbonWeight,
      description: `${input.carbon_footprint || 'Unknown'} kg CO₂eq`
    })
    
    totalScore += carbonScore * carbonWeight
    totalWeight += carbonWeight

    // 2. Packaging Score (25% weight)
    const packagingWeight = 0.25
    let packagingScore = 50
    
    if (input.packaging?.length) {
      const sustainablePackaging = ['glass', 'aluminum', 'cardboard', 'paper', 'compostable']
      const problematicPackaging = ['plastic', 'styrofoam', 'mixed materials']
      
      const sustainable = input.packaging.some(p => 
        sustainablePackaging.some(sp => p.toLowerCase().includes(sp))
      )
      const problematic = input.packaging.some(p => 
        problematicPackaging.some(pp => p.toLowerCase().includes(pp))
      )
      
      if (sustainable && !problematic) packagingScore = 90
      else if (sustainable) packagingScore = 70
      else if (problematic) packagingScore = 20
    }
    
    factors.push({
      name: "Packaging",
      score: packagingScore,
      weight: packagingWeight,
      description: input.packaging?.join(', ') || 'Unknown packaging'
    })
    
    totalScore += packagingScore * packagingWeight
    totalWeight += packagingWeight

    // 3. Materials Score (20% weight)
    const materialsWeight = 0.20
    let materialsScore = 50
    
    if (input.materials?.length) {
      const sustainableMaterials = ['organic', 'recycled', 'bamboo', 'hemp', 'linen', 'wool']
      const problematicMaterials = ['synthetic', 'plastic', 'polyester', 'acrylic']
      
      const sustainable = input.materials.some(m => 
        sustainableMaterials.some(sm => m.toLowerCase().includes(sm))
      )
      const problematic = input.materials.some(m => 
        problematicMaterials.some(pm => m.toLowerCase().includes(pm))
      )
      
      if (sustainable && !problematic) materialsScore = 85
      else if (sustainable) materialsScore = 65
      else if (problematic) materialsScore = 25
    }
    
    factors.push({
      name: "Materials",
      score: materialsScore,
      weight: materialsWeight,
      description: input.materials?.join(', ') || 'Unknown materials'
    })
    
    totalScore += materialsScore * materialsWeight
    totalWeight += materialsWeight

    // 4. Certifications & Practices (15% weight)
    const certificationsWeight = 0.15
    let certificationsScore = 40
    
    if (input.organic) certificationsScore += 20
    if (input.fair_trade) certificationsScore += 15
    if (input.local) certificationsScore += 10
    if (input.recyclable) certificationsScore += 15
    
    certificationsScore = Math.min(100, certificationsScore)
    
    factors.push({
      name: "Certifications",
      score: certificationsScore,
      weight: certificationsWeight,
      description: [
        input.organic && "Organic",
        input.fair_trade && "Fair Trade", 
        input.local && "Local",
        input.recyclable && "Recyclable"
      ].filter(Boolean).join(', ') || 'No certifications'
    })
    
    totalScore += certificationsScore * certificationsWeight
    totalWeight += certificationsWeight

    // 5. Category Adjustment (10% weight)
    const categoryWeight = 0.10
    let categoryScore = 50
    
    if (input.category) {
      const category = input.category.toLowerCase()
      if (category.includes('organic') || category.includes('eco')) categoryScore = 80
      else if (category.includes('fast fashion') || category.includes('single-use')) categoryScore = 20
      else if (category.includes('food') || category.includes('beverage')) categoryScore = 60
    }
    
    factors.push({
      name: "Category",
      score: categoryScore,
      weight: categoryWeight,
      description: input.category || 'General product'
    })
    
    totalScore += categoryScore * categoryWeight
    totalWeight += categoryWeight

    // Final score calculation
    const overallScore = Math.round(totalScore / totalWeight)
    
    // Component scores for detailed breakdown
    const breakdown = {
      overall_score: overallScore,
      carbon_footprint_score: carbonScore,
      recyclability_score: input.recyclable ? 85 : 30,
      sustainability_score: (materialsScore + certificationsScore) / 2,
      packaging_score: packagingScore,
      factors
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: breakdown
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Eco-score calculation error:', error)
    
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