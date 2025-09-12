# Multi-Database Setup Guide for EcoSnap

## Quick Start: Add External Database

The simplest way to add an external database is using **JSONBin.io** (free JSON storage):

### 1. Set Up JSONBin.io (2 minutes)
```bash
# 1. Go to https://jsonbin.io
# 2. Sign up (free account)
# 3. Get your Master Key from dashboard
# 4. Add to your .env.local:

VITE_EXTERNAL_DB_URL=https://api.jsonbin.io/v3
VITE_EXTERNAL_DB_API_KEY=your_master_key_here
```

### 2. Enable External Database
```typescript
// In src/components/MultiDbScanner.tsx, change:
external: {
  name: 'External API',
  icon: <Cloud className="h-4 w-4" />,
  description: 'Product catalog & analytics',
  enabled: true, // Change to true
}
```

### 3. Test Multi-Database Scanner
```typescript
// Add to your main app or create test page:
import MultiDbScanner from '@/components/MultiDbScanner';

function App() {
  return (
    <div>
      <MultiDbScanner />
    </div>
  );
}
```

## Database Architecture Benefits

### Current (Single Database)
```
┌─────────────┐
│   Supabase  │
│             │
│ • Users     │
│ • Profiles  │
│ • Scans     │
│ • Products  │
└─────────────┘
```

### Multi-Database (Recommended)
```
┌─────────────┐    ┌──────────────┐
│  Supabase   │    │  External DB │
│             │    │              │
│ • Users     │    │ • Products   │
│ • Profiles  │    │ • Analytics  │
│ • Auth      │    │ • Categories │
└─────────────┘    └──────────────┘
```

## Free Database Options

### 🟢 JSONBin.io (Easiest)
- **Setup Time**: 2 minutes
- **Free Tier**: 10,000 requests/month
- **Best For**: Simple JSON storage
- **Setup**: Sign up → Get Master Key → Done

### 🟢 Airtable (User-Friendly)  
- **Setup Time**: 5 minutes
- **Free Tier**: 1,200 records per base
- **Best For**: Structured data with UI
- **Setup**: Create base → Get API key → Configure

### 🟡 Firebase Firestore (Real-time)
- **Setup Time**: 10 minutes  
- **Free Tier**: 50k reads + 20k writes/day
- **Best For**: Real-time features
- **Setup**: Create project → Enable Firestore → Get config

### 🟡 PlanetScale (Advanced)
- **Setup Time**: 15 minutes
- **Free Tier**: 10GB storage + 1B row reads/month
- **Best For**: Relational data at scale
- **Setup**: Create database → Get connection string → Connect

## Implementation Examples

### Save Scan to Multiple Databases
```typescript
const saveMultiDatabase = async (scanData) => {
  // Save user data to Supabase (authentication & profiles)
  const supabaseResult = await supabase.from('scans').insert({
    user_id: user.id,
    scan_type: 'camera',
    points_earned: 25
  });

  // Save product data to external database
  const externalResult = await fetch('https://api.jsonbin.io/v3/b', {
    method: 'POST',
    headers: {
      'X-Master-Key': process.env.VITE_EXTERNAL_DB_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      product_name: scanData.name,
      eco_score: scanData.ecoScore,
      timestamp: new Date().toISOString()
    })
  });

  return { supabaseResult, externalResult };
};
```

### Query from Multiple Sources
```typescript
const getProductData = async (barcode) => {
  // Try external database first (product catalog)
  const externalProduct = await fetch(
    `https://api.jsonbin.io/v3/c/products/barcode/${barcode}`,
    { headers: { 'X-Master-Key': process.env.VITE_EXTERNAL_DB_API_KEY } }
  );
  
  if (externalProduct.ok) {
    return await externalProduct.json();
  }
  
  // Fallback to Supabase
  const { data } = await supabase
    .from('products')
    .select('*')
    .eq('barcode', barcode)
    .single();
    
  return data;
};
```

## Cost Optimization

### Current Supabase Usage (Estimated)
- Users: ~100 rows
- Scans: ~1,000 rows/month  
- Products: ~500 rows

### With Multi-Database Split
- **Supabase**: Users + Profiles (~100 rows) → Stay in free tier
- **External DB**: Products + Analytics (~2,000 rows) → Use free tier
- **Total Cost**: $0/month instead of potential $25/month

## Migration Strategy

### Phase 1: Dual Write (Safe)
```typescript
const createScan = async (scanData) => {
  // Write to both databases during transition
  const [supabaseResult, externalResult] = await Promise.all([
    supabase.from('scans').insert(scanData),
    externalDB.scans.create(scanData)
  ]);
  
  return { supabaseResult, externalResult };
};
```

### Phase 2: Read from External, Write to Both
```typescript
const getScans = async (userId) => {
  // Read from external DB (faster/cheaper)
  try {
    return await externalDB.scans.getByUser(userId);
  } catch (error) {
    // Fallback to Supabase
    const { data } = await supabase
      .from('scans')
      .select('*')
      .eq('user_id', userId);
    return data;
  }
};
```

### Phase 3: Full Migration
```typescript
// Eventually migrate all non-auth data to external database
// Keep only authentication in Supabase
```

## Testing Your Setup

1. **Add MultiDbScanner to your app**:
```typescript
// In App.tsx or create test page
import MultiDbScanner from './components/MultiDbScanner';

function TestPage() {
  return <MultiDbScanner />;
}
```

2. **Test different databases**:
- Switch between Supabase and External API
- Perform scans and verify data is saved correctly
- Check both database dashboards for saved data

3. **Monitor performance**:
- Check response times for each database
- Monitor free tier usage
- Test offline/fallback scenarios

## Next Steps

1. Choose your preferred external database
2. Get API credentials  
3. Update environment variables
4. Enable the database in MultiDbScanner
5. Test the multi-database functionality
6. Gradually migrate data based on your needs

Would you like me to help you set up any specific database provider?
