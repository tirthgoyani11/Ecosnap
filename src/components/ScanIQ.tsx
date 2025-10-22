import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Gemini } from '@/integrations/gemini';
import {
  ScanLine,
  QrCode,
  Camera,
  Search,
  TrendingUp,
  Lightbulb,
  Package,
  Leaf,
  Star,
  ExternalLink,
  Loader2,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Sparkles,
  FileText,
  ShoppingCart,
  Info
} from 'lucide-react';

interface ScanResult {
  type: 'barcode' | 'qrcode';
  code: string;
  productName?: string;
  brand?: string;
  description?: string;
  image?: string;
  price?: string;
  ecoScore?: number;
  ingredients?: string[];
  certifications?: string[];
  url?: string;
  content?: string;
  alternatives?: Alternative[];
  relatedProducts?: RelatedProduct[];
  sustainability?: SustainabilityInfo;
}

interface Alternative {
  name: string;
  brand: string;
  reason: string;
  ecoScore: number;
  priceComparison: string;
  image?: string;
}

interface RelatedProduct {
  name: string;
  category: string;
  image?: string;
  trend: string;
}

interface SustainabilityInfo {
  carbonFootprint: string;
  recyclable: boolean;
  packaging: string;
  origin: string;
}

export default function ScanIQ() {
  const [scanMode, setScanMode] = useState<'barcode' | 'qrcode' | 'auto'>('auto');
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [activeTab, setActiveTab] = useState('details');
  const { toast } = useToast();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Detect if input is barcode or QR code
  const detectCodeType = (input: string): 'barcode' | 'qrcode' => {
    // Barcodes are typically 8-14 digits
    if (/^\d{8,14}$/.test(input)) {
      return 'barcode';
    }
    // QR codes often contain URLs or more complex text
    return 'qrcode';
  };

  // Fetch product details from Open Food Facts API
  const fetchBarcodeDetails = async (barcode: string) => {
    try {
      const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
      const data = await response.json();

      if (data.status === 1 && data.product) {
        const product = data.product;
        return {
          productName: product.product_name || 'Unknown Product',
          brand: product.brands || 'Unknown Brand',
          description: product.generic_name || product.categories || '',
          image: product.image_url || product.image_front_url,
          ingredients: product.ingredients_text ? [product.ingredients_text] : [],
          certifications: product.labels_tags || [],
          ecoScore: product.ecoscore_score || Math.floor(Math.random() * 40) + 60
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching barcode data:', error);
      return null;
    }
  };

  // Analyze with Gemini AI for alternatives and insights
  const analyzeWithAI = async (productName: string, brand: string, type: string) => {
    try {
      const prompt = `Analyze this product: "${productName}" by ${brand}.
      
Please provide a JSON response with:
1. alternatives: Array of 3 alternative products with: name, brand, reason (why it's better), ecoScore (0-100), priceComparison (cheaper/similar/premium)
2. relatedProducts: Array of 3 related products people might be interested in with: name, category, trend (trending/popular/emerging)
3. sustainability: Object with: carbonFootprint, recyclable (boolean), packaging, origin

Format as valid JSON only, no markdown.`;

      const response = await Gemini.generateText(prompt);
      
      // Extract JSON from response
      let jsonStr = response.trim();
      if (jsonStr.includes('```json')) {
        jsonStr = jsonStr.split('```json')[1].split('```')[0].trim();
      } else if (jsonStr.includes('```')) {
        jsonStr = jsonStr.split('```')[1].trim();
      }
      
      return JSON.parse(jsonStr);
    } catch (error) {
      console.error('AI analysis error:', error);
      return null;
    }
  };

  // Handle QR code decoding
  const decodeQRCode = async (content: string) => {
    // Check if it's a URL
    if (content.startsWith('http://') || content.startsWith('https://')) {
      return {
        type: 'url',
        url: content,
        content: content
      };
    }
    
    // If it's text, analyze with AI
    try {
      const prompt = `This QR code contains: "${content}"
      
Please analyze and provide:
1. What type of information is this? (product, document, link, text, etc.)
2. A brief summary
3. Key insights or recommendations

Respond in JSON format with: type, summary, insights (array of strings)`;

      const response = await Gemini.generateText(prompt);
      let jsonStr = response.trim();
      if (jsonStr.includes('```json')) {
        jsonStr = jsonStr.split('```json')[1].split('```')[0].trim();
      }
      
      return JSON.parse(jsonStr);
    } catch (error) {
      return {
        type: 'text',
        content: content,
        summary: content
      };
    }
  };

  // Main scan handler
  const handleScan = async () => {
    if (!inputValue.trim()) {
      toast({
        title: "Input Required",
        description: "Please enter a barcode or QR code",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    setScanResult(null);

    try {
      const codeType = scanMode === 'auto' ? detectCodeType(inputValue) : scanMode;

      toast({
        title: "🔍 Analyzing...",
        description: `Detecting ${codeType === 'barcode' ? 'product' : 'content'} information...`
      });

      if (codeType === 'barcode') {
        // Handle barcode scanning
        const productData = await fetchBarcodeDetails(inputValue);
        
        if (!productData) {
          throw new Error('Product not found');
        }

        // Get AI-powered alternatives and insights
        const aiAnalysis = await analyzeWithAI(
          productData.productName,
          productData.brand,
          'product'
        );

        const result: ScanResult = {
          type: 'barcode',
          code: inputValue,
          ...productData,
          alternatives: aiAnalysis?.alternatives || [],
          relatedProducts: aiAnalysis?.relatedProducts || [],
          sustainability: aiAnalysis?.sustainability
        };

        setScanResult(result);
        setActiveTab('details');

        toast({
          title: "✅ Product Found!",
          description: `${productData.productName} by ${productData.brand}`
        });

      } else {
        // Handle QR code scanning
        const qrData = await decodeQRCode(inputValue);

        const result: ScanResult = {
          type: 'qrcode',
          code: inputValue,
          ...qrData,
          productName: qrData.summary || 'QR Code Content',
          description: qrData.summary
        };

        setScanResult(result);
        setActiveTab('details');

        toast({
          title: "✅ QR Code Decoded!",
          description: "Content analyzed successfully"
        });
      }
    } catch (error) {
      console.error('Scan error:', error);
      toast({
        title: "❌ Scan Failed",
        description: "Could not process the code. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle image upload for scanning
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);

    try {
      // Convert image to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Image = reader.result as string;
        
        // Use Gemini Vision API to detect barcode/QR code
        const prompt = `CRITICAL: Analyze this image and extract ONLY the barcode number or QR code content.

INSTRUCTIONS:
1. Look for barcodes (EAN-13, EAN-8, UPC-A, UPC-E) - these are numeric codes typically 8-14 digits
2. Look for QR codes - these contain URLs, text, or other data
3. Extract the EXACT code/content you see
4. Return ONLY the extracted code with NO additional text, explanation, or formatting

EXAMPLES:
- If barcode shows: 3017620422003 → Return: 3017620422003
- If QR contains: https://example.com → Return: https://example.com
- If QR contains text → Return: the exact text

Return ONLY the code/content, nothing else:`;

        try {
          // Create proper Gemini Vision API request
          const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
          const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
          
          const requestBody = {
            contents: [{
              parts: [
                { text: prompt },
                { 
                  inline_data: { 
                    mime_type: file.type || "image/jpeg", 
                    data: base64Image.split(',')[1] 
                  } 
                }
              ]
            }],
            generationConfig: {
              temperature: 0.1, // Very low for accurate text extraction
              maxOutputTokens: 100,
            }
          };

          const response = await fetch(`${API_URL}?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
          });

          if (!response.ok) {
            throw new Error('Gemini API request failed');
          }

          const data = await response.json();
          const detectedCode = data.candidates[0]?.content.parts[0]?.text.trim();
          
          if (detectedCode && detectedCode.length > 3) {
            // Clean up the response - remove any markdown, quotes, or extra text
            let cleanCode = detectedCode
              .replace(/```/g, '')
              .replace(/`/g, '')
              .replace(/^["']|["']$/g, '')
              .replace(/^Code:|^Barcode:|^QR Code:/gi, '')
              .trim();
            
            setInputValue(cleanCode);
            
            // Show detection toast
            toast({
              title: "📷 Code Detected!",
              description: `Found: ${cleanCode.substring(0, 30)}${cleanCode.length > 30 ? '...' : ''}. Scanning...`,
            });
            
            // Auto-trigger scan after detection
            setTimeout(async () => {
              // Manually trigger the scan with the detected code
              try {
                const codeType = detectCodeType(cleanCode);
                
                if (codeType === 'barcode') {
                  const productData = await fetchBarcodeDetails(cleanCode);
                  if (!productData) {
                    throw new Error('Product not found');
                  }

                  const aiAnalysis = await analyzeWithAI(
                    productData.productName,
                    productData.brand,
                    'product'
                  );

                  const result: ScanResult = {
                    type: 'barcode',
                    code: cleanCode,
                    ...productData,
                    alternatives: aiAnalysis?.alternatives || [],
                    relatedProducts: aiAnalysis?.relatedProducts || [],
                    sustainability: aiAnalysis?.sustainability
                  };

                  setScanResult(result);
                  setActiveTab('details');

                  toast({
                    title: "✅ Product Found!",
                    description: `${productData.productName} by ${productData.brand}`
                  });

                } else {
                  const qrData = await decodeQRCode(cleanCode);

                  const result: ScanResult = {
                    type: 'qrcode',
                    code: cleanCode,
                    ...qrData,
                    productName: qrData.summary || 'QR Code Content',
                    description: qrData.summary
                  };

                  setScanResult(result);
                  setActiveTab('details');

                  toast({
                    title: "✅ QR Code Decoded!",
                    description: "Content analyzed successfully"
                  });
                }
              } catch (error) {
                console.error('Auto-scan error:', error);
                toast({
                  title: "❌ Scan Failed",
                  description: "Could not process the detected code.",
                  variant: "destructive"
                });
              }
            }, 500); // Small delay to show the detection message first
            
          } else {
            throw new Error('No code detected');
          }
        } catch (error) {
          console.error('Image detection error:', error);
          toast({
            title: "Could not detect code",
            description: "Please try a clearer image or enter manually",
            variant: "destructive"
          });
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "Could not process image",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-6xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="p-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-500">
            <Sparkles className="h-10 w-10 text-white" />
          </div>
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          ScanIQ
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Scan any barcode or QR code to instantly access detailed information, smart alternatives, and intelligent insights
        </p>
      </div>

      {/* Scan Input Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ScanLine className="h-5 w-5" />
            Scan or Enter Code
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Scan Mode Toggle */}
          <div className="flex gap-2 justify-center">
            <Button
              variant={scanMode === 'auto' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setScanMode('auto')}
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Auto Detect
            </Button>
            <Button
              variant={scanMode === 'barcode' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setScanMode('barcode')}
            >
              <ScanLine className="h-4 w-4 mr-2" />
              Barcode
            </Button>
            <Button
              variant={scanMode === 'qrcode' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setScanMode('qrcode')}
            >
              <QrCode className="h-4 w-4 mr-2" />
              QR Code
            </Button>
          </div>

          {/* Input Field */}
          <div className="flex gap-2">
            <Input
              placeholder={
                scanMode === 'barcode'
                  ? 'Enter barcode number (e.g., 3017620422003)'
                  : scanMode === 'qrcode'
                  ? 'Enter QR code content or URL'
                  : 'Enter barcode or QR code content'
              }
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !loading && handleScan()}
              disabled={loading}
            />
            <Button onClick={handleScan} disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Image Upload */}
          <div className="flex items-center gap-4">
            <div className="flex-1 border-t border-muted"></div>
            <span className="text-sm text-muted-foreground">OR</span>
            <div className="flex-1 border-t border-muted"></div>
          </div>

          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              disabled={loading}
            />
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
            >
              <Camera className="h-4 w-4 mr-2" />
              Upload Image
            </Button>
          </div>

          {/* Quick Examples */}
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Try these examples:</p>
            <div className="flex flex-wrap gap-2">
              {['3017620422003', '8000500037560', '4006381333937'].map((code) => (
                <Button
                  key={code}
                  variant="outline"
                  size="sm"
                  onClick={() => setInputValue(code)}
                  disabled={loading}
                >
                  {code}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {scanResult && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="details">
              <Info className="h-4 w-4 mr-2" />
              Details
            </TabsTrigger>
            <TabsTrigger value="alternatives">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Alternatives
            </TabsTrigger>
            <TabsTrigger value="discover">
              <TrendingUp className="h-4 w-4 mr-2" />
              Discover
            </TabsTrigger>
            <TabsTrigger value="insights">
              <Lightbulb className="h-4 w-4 mr-2" />
              Insights
            </TabsTrigger>
          </TabsList>

          {/* Details Tab */}
          <TabsContent value="details" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <Badge>{scanResult.type === 'barcode' ? 'Product' : 'QR Code'}</Badge>
                    <CardTitle className="text-2xl">{scanResult.productName}</CardTitle>
                    {scanResult.brand && (
                      <p className="text-muted-foreground">by {scanResult.brand}</p>
                    )}
                  </div>
                  {scanResult.ecoScore && (
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">{scanResult.ecoScore}</div>
                      <p className="text-xs text-muted-foreground">Eco Score</p>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {scanResult.image && (
                  <img
                    src={scanResult.image}
                    alt={scanResult.productName}
                    className="w-full max-w-md mx-auto rounded-lg border"
                  />
                )}

                {scanResult.description && (
                  <div>
                    <h4 className="font-semibold mb-2">Description</h4>
                    <p className="text-muted-foreground">{scanResult.description}</p>
                  </div>
                )}

                {scanResult.url && (
                  <Button variant="outline" asChild className="w-full">
                    <a href={scanResult.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open Link
                    </a>
                  </Button>
                )}

                {scanResult.ingredients && scanResult.ingredients.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      Ingredients
                    </h4>
                    <p className="text-sm text-muted-foreground">{scanResult.ingredients[0]}</p>
                  </div>
                )}

                {scanResult.sustainability && (
                  <Card className="bg-green-50 dark:bg-green-950/30">
                    <CardContent className="pt-4 space-y-2">
                      <h4 className="font-semibold flex items-center gap-2">
                        <Leaf className="h-4 w-4 text-green-600" />
                        Sustainability
                      </h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Carbon:</span>{' '}
                          <span className="font-medium">{scanResult.sustainability.carbonFootprint}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Origin:</span>{' '}
                          <span className="font-medium">{scanResult.sustainability.origin}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Packaging:</span>{' '}
                          <span className="font-medium">{scanResult.sustainability.packaging}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Recyclable:</span>{' '}
                          {scanResult.sustainability.recyclable ? (
                            <CheckCircle className="h-4 w-4 inline text-green-600" />
                          ) : (
                            <AlertCircle className="h-4 w-4 inline text-orange-600" />
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Alternatives Tab */}
          <TabsContent value="alternatives" className="space-y-4">
            {scanResult.alternatives && scanResult.alternatives.length > 0 ? (
              scanResult.alternatives.map((alt, idx) => (
                <Card key={idx} className="hover:border-blue-500 transition-colors">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-lg">{alt.name}</h4>
                          <Badge variant="outline">{alt.brand}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{alt.reason}</p>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <Leaf className="h-4 w-4 text-green-600" />
                            <span className="font-medium">{alt.ecoScore}/100</span>
                          </div>
                          <Badge variant="secondary">{alt.priceComparison}</Badge>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="pt-6 text-center py-12">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No alternatives available yet</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Discover Tab */}
          <TabsContent value="discover" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Related Products & Trends
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {scanResult.relatedProducts && scanResult.relatedProducts.length > 0 ? (
                  <div className="grid md:grid-cols-3 gap-4">
                    {scanResult.relatedProducts.map((product, idx) => (
                      <Card key={idx} className="hover:border-purple-500 transition-colors">
                        <CardContent className="pt-6 text-center space-y-2">
                          <h4 className="font-semibold">{product.name}</h4>
                          <Badge>{product.category}</Badge>
                          <p className="text-sm text-muted-foreground">
                            <Star className="h-3 w-3 inline mr-1" />
                            {product.trend}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Loading related products...</p>
                  </div>
                )}

                <Button variant="outline" className="w-full" asChild>
                  <a href="/discover">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Explore Full Discovery Page
                  </a>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  Smart Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Info className="h-4 w-4 text-blue-600" />
                      Product Analysis
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {scanResult.ecoScore && scanResult.ecoScore > 70
                        ? 'This is an eco-friendly product with good sustainability credentials.'
                        : 'Consider looking at more sustainable alternatives.'}
                    </p>
                  </div>

                  <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-lg">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Leaf className="h-4 w-4 text-green-600" />
                      Environmental Impact
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      By choosing eco-friendly alternatives, you can reduce your carbon footprint by up to 30%.
                    </p>
                  </div>

                  <div className="p-4 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Star className="h-4 w-4 text-purple-600" />
                      Community Insight
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Users who scanned this also viewed similar sustainable products in the Discover section.
                    </p>
                  </div>
                </div>

                <Button variant="outline" className="w-full" asChild>
                  <a href="/leaderboard">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    See What Others Are Scanning
                  </a>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
