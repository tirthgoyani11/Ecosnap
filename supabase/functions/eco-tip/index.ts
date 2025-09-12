// Supabase Edge Function for daily eco tips
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const ecoTips = [
  {
    id: 'tip-reusable-bags',
    title: 'Bring Your Own Bags',
    content: 'Use reusable shopping bags instead of plastic ones. A single reusable bag can replace hundreds of plastic bags over its lifetime, reducing plastic waste in oceans and landfills.',
    category: 'shopping',
    difficulty: 'easy',
    impact_score: 7,
    image_url: '/images/tips/reusable-bags.jpg'
  },
  {
    id: 'tip-bulk-buying',
    title: 'Buy in Bulk',
    content: 'Purchase items in bulk to reduce packaging waste. Bring your own containers to bulk stores for even greater impact. This reduces both plastic packaging and trips to the store.',
    category: 'shopping',
    difficulty: 'medium',
    impact_score: 8,
    image_url: '/images/tips/bulk-buying.jpg'
  },
  {
    id: 'tip-glass-over-plastic',
    title: 'Choose Glass Over Plastic',
    content: 'When possible, choose products in glass containers. Glass is 100% recyclable infinitely without quality loss and doesn\'t leach harmful chemicals into food or drinks.',
    category: 'shopping',
    difficulty: 'easy',
    impact_score: 6,
    image_url: '/images/tips/glass-containers.jpg'
  },
  {
    id: 'tip-unplug-electronics',
    title: 'Unplug Electronics',
    content: 'Unplug devices when not in use. Many electronics consume power even when turned off (called "phantom load"), accounting for 5-10% of residential energy use.',
    category: 'energy',
    difficulty: 'easy',
    impact_score: 5,
    image_url: '/images/tips/unplug-devices.jpg'
  },
  {
    id: 'tip-meal-planning',
    title: 'Plan Your Meals',
    content: 'Plan your meals for the week to reduce food waste. Food waste accounts for 8% of global greenhouse gas emissions. Planning helps you buy only what you need.',
    category: 'lifestyle',
    difficulty: 'medium',
    impact_score: 9,
    image_url: '/images/tips/meal-planning.jpg'
  },
  {
    id: 'tip-cold-water-washing',
    title: 'Wash in Cold Water',
    content: 'Wash clothes in cold water whenever possible. Heating water accounts for about 90% of washing machine energy use. Cold water is also gentler on fabrics.',
    category: 'lifestyle',
    difficulty: 'easy',
    impact_score: 6,
    image_url: '/images/tips/cold-water-wash.jpg'
  },
  {
    id: 'tip-led-bulbs',
    title: 'Switch to LED Bulbs',
    content: 'Replace incandescent bulbs with LED bulbs. LEDs use 75% less energy and last 25 times longer, saving money on electricity and replacement costs.',
    category: 'energy',
    difficulty: 'easy',
    impact_score: 7,
    image_url: '/images/tips/led-bulbs.jpg'
  },
  {
    id: 'tip-composting',
    title: 'Start Composting',
    content: 'Compost food scraps and yard waste. Composting reduces methane emissions from landfills and creates nutrient-rich soil for gardens.',
    category: 'recycling',
    difficulty: 'medium',
    impact_score: 8,
    image_url: '/images/tips/composting.jpg'
  },
  {
    id: 'tip-public-transport',
    title: 'Use Public Transportation',
    content: 'Take public transport, bike, or walk when possible. Transportation accounts for 29% of US greenhouse gas emissions. Every mile counts!',
    category: 'transport',
    difficulty: 'medium',
    impact_score: 9,
    image_url: '/images/tips/public-transport.jpg'
  },
  {
    id: 'tip-meatless-monday',
    title: 'Try Meatless Monday',
    content: 'Reduce meat consumption one day per week. Livestock farming produces 14.5% of global greenhouse gas emissions. Plant-based meals are delicious and nutritious!',
    category: 'lifestyle',
    difficulty: 'medium',
    impact_score: 8,
    image_url: '/images/tips/meatless-monday.jpg'
  },
  {
    id: 'tip-reusable-water-bottle',
    title: 'Use a Reusable Water Bottle',
    content: 'Carry a reusable water bottle instead of buying plastic bottles. Americans use 50 billion plastic water bottles per year - only 23% are recycled.',
    category: 'lifestyle',
    difficulty: 'easy',
    impact_score: 7,
    image_url: '/images/tips/reusable-bottle.jpg'
  },
  {
    id: 'tip-paperless-billing',
    title: 'Go Paperless',
    content: 'Switch to electronic bills and statements. The average household receives 41 pounds of junk mail per year, requiring 100 million trees annually.',
    category: 'lifestyle',
    difficulty: 'easy',
    impact_score: 4,
    image_url: '/images/tips/paperless.jpg'
  },
  {
    id: 'tip-native-plants',
    title: 'Plant Native Species',
    content: 'Choose native plants for your garden. They require less water, fertilizer, and pesticides while supporting local wildlife and pollinators.',
    category: 'lifestyle',
    difficulty: 'hard',
    impact_score: 6,
    image_url: '/images/tips/native-plants.jpg'
  },
  {
    id: 'tip-secondhand-shopping',
    title: 'Shop Secondhand First',
    content: 'Check thrift stores and online marketplaces before buying new. The fashion industry is the second-largest polluter globally. Secondhand extends product lifecycles.',
    category: 'shopping',
    difficulty: 'easy',
    impact_score: 7,
    image_url: '/images/tips/secondhand.jpg'
  },
  {
    id: 'tip-air-dry-clothes',
    title: 'Air Dry Your Clothes',
    content: 'Skip the dryer when weather permits. Dryers are among the most energy-intensive household appliances. Air drying also extends fabric life.',
    category: 'energy',
    difficulty: 'easy',
    impact_score: 6,
    image_url: '/images/tips/air-dry.jpg'
  }
]

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const category = url.searchParams.get('category')
    const difficulty = url.searchParams.get('difficulty')
    
    let availableTips = [...ecoTips]
    
    // Filter by category if specified
    if (category) {
      availableTips = availableTips.filter(tip => tip.category === category)
    }
    
    // Filter by difficulty if specified
    if (difficulty) {
      availableTips = availableTips.filter(tip => tip.difficulty === difficulty)
    }
    
    // Get tip of the day based on current date (ensures same tip per day)
    const today = new Date()
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24))
    const tipIndex = dayOfYear % availableTips.length
    
    const tipOfTheDay = availableTips[tipIndex]
    
    // Add some dynamic context
    const contextualTip = {
      ...tipOfTheDay,
      date: today.toISOString().split('T')[0],
      seasonal_note: getSeasonalNote(today),
      related_tips: getRelatedTips(tipOfTheDay, availableTips, 2)
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: contextualTip
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Eco tip error:', error)
    
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

function getSeasonalNote(date: Date): string {
  const month = date.getMonth()
  
  if (month >= 2 && month <= 4) { // Spring
    return "Spring is perfect for starting new eco-habits and cleaning up outdoor spaces!"
  } else if (month >= 5 && month <= 7) { // Summer
    return "Summer's longer days are great for air-drying clothes and growing your own food!"
  } else if (month >= 8 && month <= 10) { // Fall
    return "Fall is ideal for composting leaves and reducing energy use as weather cools!"
  } else { // Winter
    return "Winter is a great time to focus on energy conservation and indoor eco-practices!"
  }
}

function getRelatedTips(currentTip: any, allTips: any[], count: number) {
  return allTips
    .filter(tip => tip.category === currentTip.category && tip.id !== currentTip.id)
    .slice(0, count)
    .map(tip => ({
      id: tip.id,
      title: tip.title,
      difficulty: tip.difficulty,
      impact_score: tip.impact_score
    }))
}