# EcoSnap AI - Enhanced AR Deployment Guide

## 🚀 Deploy to Vercel with AR Scanner

### Prerequisites
- GitHub account
- Vercel account (free)
- All API keys ready (Gemini API key is critical for AR functionality)

### Step 1: Build and Test Locally
```bash
# Install dependencies
npm install

# Test AR scanner locally
npm run dev
# Visit http://localhost:5173/ar-test to test camera functionality

# Build for production
npm run build

# Test production build
npm run preview
```

### Step 2: Push to GitHub
```bash
git add .
git commit -m "Production ready - AR Scanner with Gemini AI integrated"
git push origin main
```

### Step 3: Connect to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click "New Project"
4. Import your `eco-snap-sparkle` repository

### Step 4: Configure Environment Variables
In Vercel dashboard, add these environment variables:

#### Required APIs (Already have keys):
```
VITE_GEMINI_API_KEY = AIzaSyCdBFIzpAfPfk7tW9IUOSihKU20XmuyrGA
VITE_UNSPLASH_ACCESS_KEY = HUDILVwDmLsGa2sKvhXONnSuVf4wlbAd3RvcewAe10s  
VITE_CARBON_INTERFACE_KEY = EnacLdKh2zHUdjJ2qzvXDw
```

#### Optional Feature Flags:
```
VITE_ENABLE_AR_SCANNER = true
VITE_ENABLE_CAMERA_UPLOAD = true
VITE_ENABLE_BARCODE_SCANNER = true
```

#### Optional (for user accounts):
```
VITE_SUPABASE_URL = https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY = your_supabase_key
```

#### App Configuration:
```
VITE_APP_NAME = EcoSnap AI
VITE_APP_VERSION = 2.0.0
```

### Step 4: Deploy
- Click "Deploy"
- Wait 2-3 minutes
- Your app will be live!

## 🔧 Build Settings (Auto-detected)
- **Framework**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

## 🌟 Features Available
- ✅ AI-powered eco scoring (Gemini)
- ✅ High-quality product images (Unsplash)
- ✅ Carbon footprint calculations (Carbon Interface)
- ✅ Real product database (OpenFoodFacts - no key needed)
- ✅ Professional UI with camera scanning
- ✅ Real-time product analysis

## 🎯 Post-Deployment
1. Test all scanning modes
2. Verify API integrations
3. Check console for any errors
4. Share your live environmental app!

Your EcoSnap AI will be production-ready with all premium features! 🚀
