# API Integration Documentation

## Overview
EcoSnap AI integrates with multiple APIs to provide comprehensive product sustainability analysis:

## API Integration Flow

### 1. Product Data Scanning
**Source**: OpenFoodFacts API (Free)
- **URL**: `https://world.openfoodfacts.org/api/v2/product/{barcode}.json`
- **Purpose**: Get basic product information (name, brand, ingredients, packaging)
- **Implementation**: `src/lib/real-product-api.ts` → `getProductByBarcode()`

### 2. AI Eco Score Analysis  
**Source**: Google Gemini API (Paid/Free tier)
- **URL**: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`
- **Purpose**: Analyze product sustainability and generate eco scores (0-100)
- **Implementation**: `src/lib/real-product-api.ts` → `calculateEcoScoreWithAI()`
- **Fallback**: Rule-based scoring when API unavailable

### 3. High-Quality Product Images
**Source**: Unsplash API (Free tier)
- **URL**: `https://api.unsplash.com/search/photos`
- **Purpose**: Get professional product images when OpenFoodFacts images are poor
- **Implementation**: `src/lib/real-product-api.ts` → `getProductImage()`
- **Fallback**: OpenFoodFacts images or placeholder.svg

### 4. Carbon Footprint Calculations
**Source**: Carbon Interface API (Paid/Free tier)
- **URL**: `https://www.carboninterface.com/api/v1/estimates`
- **Purpose**: Calculate accurate CO2 emissions for products
- **Implementation**: `src/lib/real-product-api.ts` → `calculateCarbonFootprint()`
- **Fallback**: Category-based estimation algorithm

### 5. Data Persistence & Caching
**Source**: Supabase (Free tier)
- **Purpose**: Cache API results, store user data, real-time features
- **Implementation**: `src/hooks/useBarcodeAPI.ts` → Supabase client
- **Tables**: `products`, `scans`, `user_preferences`

## Environment Variables Required

```bash
# Core Database (Required)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key

# AI Analysis (Recommended for best experience)
VITE_GEMINI_API_KEY=your_gemini_key

# High-Quality Images (Recommended)
VITE_UNSPLASH_ACCESS_KEY=your_unsplash_key

# Accurate CO2 Data (Optional, has smart fallback)
VITE_CARBON_INTERFACE_KEY=your_carbon_key
```

## API Fallback Strategy

1. **Primary Flow**: All APIs working
   - OpenFoodFacts → Gemini AI → Unsplash → Carbon Interface → Supabase

2. **Partial API Failure**: 
   - Missing Gemini → Rule-based eco scoring
   - Missing Unsplash → OpenFoodFacts images or placeholder
   - Missing Carbon Interface → Category-based CO2 estimation

3. **Complete Offline**: 
   - Demo product generation with realistic data
   - Local calculations for all metrics

## API Rate Limits & Costs

- **OpenFoodFacts**: Free, no limits
- **Gemini API**: 60 requests/minute (free tier)
- **Unsplash**: 50 requests/hour (free tier)
- **Carbon Interface**: 200 requests/month (free tier)
- **Supabase**: 2 simultaneous connections (free tier)

## Performance Optimizations

- Supabase caching reduces API calls
- Parallel API requests where possible
- Smart fallbacks prevent user-facing errors
- Image lazy loading and optimization
