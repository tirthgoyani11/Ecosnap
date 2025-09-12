// Enhanced SmartScanner with Multi-Database Support
// src/components/MultiDbScanner.tsx

import { useState, useRef, useCallback, useEffect } from 'react';
import { Camera, Upload, Scan, Database, Cloud, HardDrive } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAdvancedProductSearch } from '@/hooks/useAdvancedProductSearch';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

// Import different database services
import { useCreateScan } from '@/hooks/useDatabase'; // Supabase
import { useExternalProduct, useExternalScan } from '@/services/external-db-service';
// import { useFirebaseProduct, useFirebaseScan } from '@/services/firebase-service';
// import { useMongoProduct, useMongoScan } from '@/services/mongodb-service';

type DatabaseProvider = 'supabase' | 'external' | 'firebase' | 'mongodb';

interface DatabaseConfig {
  name: string;
  icon: React.ReactNode;
  description: string;
  enabled: boolean;
}

const DATABASE_CONFIGS: Record<DatabaseProvider, DatabaseConfig> = {
  supabase: {
    name: 'Supabase',
    icon: <Database className="h-4 w-4" />,
    description: 'User data & authentication',
    enabled: true,
  },
  external: {
    name: 'External API',
    icon: <Cloud className="h-4 w-4" />,
    description: 'Product catalog & analytics',
    enabled: true,
  },
  firebase: {
    name: 'Firebase',
    icon: <HardDrive className="h-4 w-4" />,
    description: 'Real-time features',
    enabled: false, // Set to true when Firebase is configured
  },
  mongodb: {
    name: 'MongoDB',
    icon: <Database className="h-4 w-4" />,
    description: 'Advanced product data',
    enabled: false, // Set to true when MongoDB is configured
  },
};

export default function MultiDbScanner() {
  const [selectedDatabase, setSelectedDatabase] = useState<DatabaseProvider>('supabase');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const [productInput, setProductInput] = useState('');
  
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Supabase hooks
  const createSupabaseScan = useCreateScan();
  
  // External database hooks
  const { getProductByBarcode: getExternalProduct, createProduct: createExternalProduct } = useExternalProduct();
  const { createScan: createExternalScan } = useExternalScan();
  
  // Product search hook
  const { searchByText, searchByImageFile, lookupProductName } = useAdvancedProductSearch();

  const handleDatabaseChange = (provider: DatabaseProvider) => {
    if (!DATABASE_CONFIGS[provider].enabled) {
      toast({
        title: "Database Not Configured",
        description: `${DATABASE_CONFIGS[provider].name} is not yet configured. Please check the setup guide.`,
        variant: "destructive",
      });
      return;
    }
    
    setSelectedDatabase(provider);
    toast({
      title: "Database Switched",
      description: `Now using ${DATABASE_CONFIGS[provider].name} for data storage.`,
    });
  };

  const saveToSelectedDatabase = async (scanData: any, productData: any) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to save scan data.",
        variant: "destructive",
      });
      return null;
    }

    const baseScanData = {
      user_id: user.id,
      scan_data: {
        detected_name: productData.productName || productData.name,
        confidence: 0.85,
        analysis_method: scanData.method || 'ai' as const,
      },
      results: {
        eco_score: productData.ecoScore || 75,
        sustainability_rating: productData.sustainabilityRating || 'Good',
        improvement_suggestions: productData.suggestions || [],
      },
    };

    try {
      let result = null;

      switch (selectedDatabase) {
        case 'supabase':
          // Save to Supabase (existing logic)
          result = await createSupabaseScan.mutateAsync({
            detected_name: productData.productName || productData.name,
            scan_type: scanData.method || 'camera',
            eco_score: productData.ecoScore || 75,
            co2_footprint: productData.co2Impact || 2.0,
            image_url: null,
            metadata: {
              brand: productData.brand,
              category: productData.category,
              database_source: 'supabase',
            },
            alternatives_count: productData.alternatives?.length || 0,
          });
          break;

        case 'external':
          // Save to External Database
          result = await createExternalScan.mutateAsync(baseScanData);
          break;

        // case 'firebase':
        //   // Save to Firebase
        //   result = await createFirebaseScan(baseScanData);
        //   break;

        // case 'mongodb':
        //   // Save to MongoDB
        //   result = await createMongoScan(baseScanData);
        //   break;

        default:
          throw new Error(`Database provider ${selectedDatabase} not implemented`);
      }

      toast({
        title: "✅ Scan Saved Successfully!",
        description: `Data saved to ${DATABASE_CONFIGS[selectedDatabase].name}. Points earned: ${productData.pointsEarned || 25}`,
        duration: 4000,
      });

      return result;
    } catch (error) {
      console.error(`Error saving to ${selectedDatabase}:`, error);
      toast({
        title: "❌ Save Failed",
        description: `Failed to save scan data to ${DATABASE_CONFIGS[selectedDatabase].name}. Please try again.`,
        variant: "destructive",
      });
      return null;
    }
  };

  const handleTextSearch = async () => {
    if (!productInput.trim()) return;

    setIsScanning(true);
    try {
      const isBarcode = /^\d{8,14}$/.test(productInput.trim());
      
      let productData = null;

      if (selectedDatabase === 'external' && isBarcode) {
        // Try external database first for barcode lookup
        const externalResult = await getExternalProduct.mutateAsync(productInput.trim());
        if (externalResult) {
          productData = {
            productName: externalResult.name,
            brand: externalResult.brand,
            category: externalResult.category,
            ecoScore: externalResult.eco_metrics.sustainability_score,
            co2Impact: externalResult.eco_metrics.carbon_footprint,
            certifications: externalResult.eco_metrics.certifications,
            alternatives: externalResult.alternatives || [],
            pointsEarned: Math.round(externalResult.eco_metrics.sustainability_score * 0.3),
          };
        }
      }

      if (!productData) {
        // Fall back to existing search methods
        const results = await searchByText(productInput);
        if (results.success && results.product) {
          productData = results.product;
        }
      }

      if (productData) {
        setScanResult(productData);
        
        // Save to selected database
        await saveToSelectedDatabase(
          { method: isBarcode ? 'barcode' : 'text' },
          productData
        );
      } else {
        toast({
          title: "Product Not Found",
          description: "No product found matching your search. Try a different query.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Search Failed",
        description: "Failed to search for product. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsScanning(false);
    }
  };

  const handleImageScan = async (file: File) => {
    setIsScanning(true);
    try {
      const results = await searchByImageFile(file);
      if (results.length > 0) {
        const product = results[0];
        
        const productData = {
          productName: product.name || 'Unknown Product',
          brand: product.brand || 'Unknown Brand',
          category: product.category || 'general',
          ecoScore: product.ecoScore ?? Math.floor(Math.random() * 40) + 60,
          co2Impact: Math.random() * 3 + 0.5,
          certifications: [],
          alternatives: product.alternatives || [],
          pointsEarned: Math.round((product.ecoScore ?? 75) * 0.3),
          sustainabilityRating: 'Good',
          suggestions: ['Consider eco-friendly alternatives'],
        };

        setScanResult(productData);
        
        // Save to selected database
        await saveToSelectedDatabase(
          { method: 'camera' },
          productData
        );
      } else {
        toast({
          title: "No Product Detected",
          description: "Could not identify any products in the image. Try a clearer photo.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Image scan error:', error);
      toast({
        title: "Scan Failed",
        description: "Failed to analyze the image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Database Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Select Database Provider:</label>
              <Select value={selectedDatabase} onValueChange={(value: DatabaseProvider) => handleDatabaseChange(value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(DATABASE_CONFIGS).map(([key, config]) => (
                    <SelectItem key={key} value={key} disabled={!config.enabled}>
                      <div className="flex items-center gap-2">
                        {config.icon}
                        <div>
                          <div className="font-medium">{config.name}</div>
                          <div className="text-xs text-muted-foreground">{config.description}</div>
                        </div>
                        {!config.enabled && (
                          <Badge variant="secondary" className="ml-2">
                            Not Configured
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
              {DATABASE_CONFIGS[selectedDatabase].icon}
              <div>
                <div className="font-medium">Current: {DATABASE_CONFIGS[selectedDatabase].name}</div>
                <div className="text-sm text-muted-foreground">
                  {DATABASE_CONFIGS[selectedDatabase].description}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scanner Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scan className="h-5 w-5" />
            Multi-Database Scanner
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Text/Barcode Search */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Search Product:</label>
            <div className="flex gap-2">
              <Input
                placeholder="Enter product name or barcode..."
                value={productInput}
                onChange={(e) => setProductInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleTextSearch()}
              />
              <Button
                onClick={handleTextSearch}
                disabled={isScanning || !productInput.trim()}
              >
                {isScanning ? 'Searching...' : 'Search'}
              </Button>
            </div>
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Or Upload Image:</label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImageScan(file);
              }}
              disabled={isScanning}
            />
          </div>

          {/* Scanning Progress */}
          {isScanning && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Scan className="h-4 w-4 animate-spin" />
                <span className="text-sm">
                  Analyzing with {DATABASE_CONFIGS[selectedDatabase].name}...
                </span>
              </div>
              <Progress value={75} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {scanResult && (
        <Card>
          <CardHeader>
            <CardTitle>Scan Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">{scanResult.productName}</h3>
                <p className="text-muted-foreground">by {scanResult.brand}</p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {scanResult.ecoScore}
                  </div>
                  <div className="text-sm text-green-700">Eco Score</div>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {(scanResult.co2Impact || 0).toFixed(1)}kg
                  </div>
                  <div className="text-sm text-blue-700">CO₂ Impact</div>
                </div>
                <div className="text-center p-3 bg-amber-50 rounded-lg">
                  <div className="text-2xl font-bold text-amber-600">
                    {scanResult.pointsEarned}
                  </div>
                  <div className="text-sm text-amber-700">Points Earned</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {DATABASE_CONFIGS[selectedDatabase].name}
                  </div>
                  <div className="text-sm text-purple-700">Saved To</div>
                </div>
              </div>
              
              {scanResult.alternatives && scanResult.alternatives.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Suggested Alternatives:</h4>
                  <div className="grid gap-2">
                    {scanResult.alternatives.slice(0, 3).map((alt: any, index: number) => (
                      <div key={index} className="p-2 border rounded-lg">
                        <div className="font-medium">{alt.product_name || alt.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {alt.reasoning || 'More eco-friendly option'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
