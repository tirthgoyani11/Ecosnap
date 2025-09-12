// Supabase Edge Function for AI chat using Groq or Ollama
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ChatRequest {
  message: string
  context?: string
  history?: Array<{role: string, content: string}>
  product_context?: any
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { message, context, history = [], product_context }: ChatRequest = await req.json()
    
    if (!message) {
      throw new Error('No message provided')
    }

    const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY')
    const OLLAMA_URL = Deno.env.get('OLLAMA_URL') || 'http://localhost:11434'

    let response

    if (GROQ_API_KEY) {
      response = await callGroq(message, context, history, product_context, GROQ_API_KEY)
    } else {
      // Try Ollama as fallback
      response = await callOllama(message, context, history, product_context, OLLAMA_URL)
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          message: response,
          timestamp: new Date().toISOString()
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Chat error:', error)
    
    // Fallback to predefined responses
    const fallbackResponse = getFallbackResponse(await req.json().then(d => d.message).catch(() => ''))
    
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          message: fallbackResponse,
          timestamp: new Date().toISOString()
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  }
})

async function callGroq(message: string, context: string = '', history: any[], productContext: any, apiKey: string) {
  const systemPrompt = `You are EcoSnap AI, a helpful assistant focused on sustainability and eco-friendly living. 
  
  You help users make better environmental choices by:
  - Analyzing products for sustainability
  - Suggesting eco-friendly alternatives
  - Providing tips for reducing environmental impact
  - Educating about sustainable practices
  
  ${context ? `Context: ${context}` : ''}
  ${productContext ? `Current product context: ${JSON.stringify(productContext)}` : ''}
  
  Be helpful, informative, and encouraging. Focus on actionable advice.`

  const messages = [
    { role: "system", content: systemPrompt },
    ...history.slice(-10), // Keep last 10 messages for context
    { role: "user", content: message }
  ]

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant", // Fast and efficient model
      messages,
      temperature: 0.7,
      max_tokens: 1024,
      stream: false
    })
  })

  const data = await response.json()
  
  if (!response.ok) {
    throw new Error(`Groq API error: ${data.error?.message || 'Unknown error'}`)
  }

  return data.choices[0]?.message?.content || 'I\'m sorry, I couldn\'t generate a response.'
}

async function callOllama(message: string, context: string = '', history: any[], productContext: any, ollamaUrl: string) {
  const systemPrompt = `You are EcoSnap AI, focused on sustainability and eco-friendly living. Help users make better environmental choices.
  
  ${context ? `Context: ${context}` : ''}
  ${productContext ? `Product: ${JSON.stringify(productContext)}` : ''}`

  const prompt = `${systemPrompt}\n\nUser: ${message}\n\nAssistant:`

  const response = await fetch(`${ollamaUrl}/api/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'llama3.2', // Use available model
      prompt,
      stream: false,
      options: {
        temperature: 0.7,
        num_predict: 500
      }
    })
  })

  const data = await response.json()
  
  if (!response.ok) {
    throw new Error(`Ollama error: ${data.error || 'Connection failed'}`)
  }

  return data.response || 'I\'m sorry, I couldn\'t generate a response.'
}

function getFallbackResponse(message: string): string {
  const lowerMessage = message.toLowerCase()
  
  if (lowerMessage.includes('eco score') || lowerMessage.includes('score')) {
    return "Eco scores are calculated based on several factors: carbon footprint (30%), packaging sustainability (25%), materials used (20%), certifications (15%), and product category (10%). Higher scores indicate more environmentally friendly products!"
  }
  
  if (lowerMessage.includes('alternative') || lowerMessage.includes('better')) {
    return "I'd be happy to help you find better alternatives! Look for products with: organic certifications, minimal packaging, local sourcing, recycled materials, and higher eco scores. What type of product are you looking for alternatives to?"
  }
  
  if (lowerMessage.includes('tip') || lowerMessage.includes('advice')) {
    return "Here's a great eco tip: Choose reusable over disposable whenever possible! Bring your own bags, water bottle, and food containers. Small changes in daily habits can make a big environmental impact over time."
  }
  
  if (lowerMessage.includes('recycle') || lowerMessage.includes('waste')) {
    return "Great question about recycling! Check your local recycling guidelines as they vary by location. Generally: clean containers, separate materials, and look for recycling symbols. When in doubt, reduce and reuse first!"
  }
  
  return "I'm here to help you make more sustainable choices! You can ask me about eco scores, product alternatives, recycling tips, or general sustainability advice. What would you like to know?"
}