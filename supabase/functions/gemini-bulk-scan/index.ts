
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { GoogleGenerativeAI } from 'npm:@google/generative-ai';

// --- CORS Headers ---
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Allow any origin
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// --- Interfaces ---
interface ScanResult {
  filename: string;
  analysis?: any; // Using any to be flexible with Gemini's output
  error?: string;
}

// --- Main Server Logic ---
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const formData = await req.formData();
    const files = formData.getAll('files') as File[];

    if (files.length === 0) {
      return new Response(JSON.stringify({ error: 'No files provided' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'API key not configured on server' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });

    const prompt = `
      You are an AI trained to analyze product images and assess their environmental impact. For each image:

      1. Identify the product name and brand.
      2. Determine the product category.
      3. Analyze and score (0-100) these aspects:
         - Overall eco-friendliness (ecoScore)
         - Packaging sustainability (packagingScore)
         - Carbon footprint impact (carbonScore)
         - Ingredient/material sustainability (ingredientScore)
         - Eco certifications present (certificationScore)
      4. Determine if the packaging is recyclable (recyclable: boolean).
      5. Estimate CO2 impact in kg (co2Impact).
      6. Calculate a health impact score (healthScore, 0-100).
      7. List any eco-certifications found (certifications: string[]).
      8. Provide a brief, one-paragraph eco-analysis (ecoDescription).

      Return ONLY a single minified JSON object with this exact structure (numbers should be 0-100 except co2Impact):
      {
        "productName": "",
        "brand": "",
        "category": "",
        "ecoScore": 0,
        "packagingScore": 0,
        "carbonScore": 0,
        "ingredientScore": 0, 
        "certificationScore": 0,
        "recyclable": true,
        "co2Impact": 0.0,
        "healthScore": 0,
        "certifications": [],
        "ecoDescription": ""
      }
    `;

    const results: ScanResult[] = [];
    const errors: ScanResult[] = [];

    for (const file of files) {
      try {
        const buffer = await file.arrayBuffer();
        const base64Data = btoa(String.fromCharCode(...new Uint8Array(buffer)));

        const result = await model.generateContent([
          prompt,
          { inlineData: { data: base64Data, mimeType: file.type } }
        ]);

        const response = await result.response;
        const text = response.text();
        
        try {
          const analysis = JSON.parse(text);
          results.push({ filename: file.name, analysis });
        } catch (parseError) {
          console.error("JSON Parse Error:", parseError, "Raw Text:", text);
          throw new Error('Failed to parse analysis result from AI.');
        }

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to process image';
        errors.push({ filename: file.name, error: errorMessage });
      }
    }

    return new Response(JSON.stringify({ results, errors }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new Response(JSON.stringify({ error: 'Failed to process request', details: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
