import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RecyclingTracker } from '@/components/RecyclingTracker';
import { StatsService } from '@/lib/stats-service-clean';
import { Gemini } from '@/integrations/gemini';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Recycle, 
  Search, 
  History, 
  TrendingUp,
  Leaf,
  Package,
  AlertCircle,
  CheckCircle,
  Info,
  Loader2,
  Camera,
  Upload,
  Sparkles
} from 'lucide-react';
import { Input } from '@/components/ui/input';

// Sample recycling database
const recyclingDatabase = {
  'plastic bottle': {
    recyclable: true,
    recyclabilityScore: 95,
    materials: [
      { name: 'PET Plastic', percentage: 95, recyclable: true, recyclingCode: '#1 PET' },
      { name: 'Label (Paper)', percentage: 3, recyclable: true },
      { name: 'Cap (HDPE)', percentage: 2, recyclable: true, recyclingCode: '#2 HDPE' }
    ],
    instructions: [
      'Remove cap and place in recycling bin separately',
      'Rinse out any remaining liquid',
      'Remove label if possible (though not always necessary)',
      'Crush the bottle to save space'
    ],
    preparation: [
      'Empty all contents from the bottle',
      'Rinse with water to remove residue',
      'Remove the cap and set aside',
      'Flatten the bottle if desired'
    ],
    environmentalImpact: {
      co2SavedByRecycling: 0.5,
      waterSaved: 2.5,
      energySaved: 1.2
    },
    alternatives: {
      composting: false,
      upcycling: ['Bird feeder', 'Plant pot', 'Storage container', 'DIY sprinkler'],
      donation: false
    }
  },
  'cardboard box': {
    recyclable: true,
    recyclabilityScore: 100,
    materials: [
      { name: 'Corrugated Cardboard', percentage: 95, recyclable: true, recyclingCode: '#20 C PAP' },
      { name: 'Tape/Adhesive', percentage: 5, recyclable: false }
    ],
    instructions: [
      'Flatten the box completely',
      'Remove all tape and labels',
      'Keep dry - wet cardboard cannot be recycled',
      'Place in paper recycling bin'
    ],
    preparation: [
      'Remove all contents',
      'Break down the box by folding along creases',
      'Remove packing tape, labels, and staples',
      'Ensure the cardboard is clean and dry'
    ],
    environmentalImpact: {
      co2SavedByRecycling: 1.2,
      waterSaved: 7.5,
      energySaved: 2.8
    },
    alternatives: {
      composting: true,
      upcycling: ['Storage box', 'Cat house', 'Kids playhouse', 'Drawer organizer'],
      donation: false
    }
  },
  'aluminum can': {
    recyclable: true,
    recyclabilityScore: 100,
    materials: [
      { name: 'Aluminum', percentage: 100, recyclable: true, recyclingCode: '#41 ALU' }
    ],
    instructions: [
      'Rinse out any remaining contents',
      'No need to remove the tab',
      'Crushing saves space but is optional',
      'Place in metal recycling bin'
    ],
    preparation: [
      'Empty completely',
      'Rinse with water',
      'Crush if desired to save space'
    ],
    environmentalImpact: {
      co2SavedByRecycling: 1.8,
      waterSaved: 4.0,
      energySaved: 3.5
    },
    alternatives: {
      composting: false,
      upcycling: ['Pencil holder', 'Plant pot', 'Candle holder', 'Wind chimes'],
      donation: false
    }
  }
};

export default function RecyclingPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [recyclingStats, setRecyclingStats] = useState<any>(null);
  const [recentRecycles, setRecentRecycles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [aiRecyclingInfo, setAiRecyclingInfo] = useState<any>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('search');
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    // Load recycling stats
    const stats = StatsService.getRecyclingStats();
    setRecyclingStats(stats);

    // Load recent recycles from localStorage
    const stored = localStorage.getItem('ecosnap_recent_recycles');
    if (stored) {
      setRecentRecycles(JSON.parse(stored));
    }
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      toast({
        title: "Empty Search",
        description: "Please enter a product name to search.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    setAiRecyclingInfo(null);
    
    try {
      // First check static database
      const query = searchQuery.toLowerCase();
      const productKey = Object.keys(recyclingDatabase).find(key => 
        query.includes(key) || key.includes(query)
      );
      
      if (productKey) {
        setSelectedProduct(productKey);
        setLoading(false);
        return;
      }

      // Use intelligent analysis
      toast({
        title: "🔍 Analyzing Product",
        description: "Searching for recycling information...",
      });

      const aiResponse = await analyzeProductWithAI(searchQuery);
      
      if (aiResponse) {
        setAiRecyclingInfo(aiResponse);
        setSelectedProduct('ai-result');
        toast({
          title: "✅ Analysis Complete",
          description: "Recycling guide is ready!",
        });
      } else {
        setSelectedProduct('not-found');
        toast({
          title: "Not Found",
          description: "Couldn't find recycling information for this product.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Search error:', error);
      setSelectedProduct('not-found');
      toast({
        title: "Error",
        description: "Failed to analyze product. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    setLoading(true);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    try {
      toast({
        title: "📸 Analyzing Image",
        description: "Identifying the product...",
      });

      // Convert to base64 for analysis
      const base64 = await fileToBase64(file);
      const aiResponse = await analyzeImageWithAI(base64);
      
      if (aiResponse) {
        setAiRecyclingInfo(aiResponse);
        setSelectedProduct('ai-result');
        setSearchQuery(aiResponse.product_name);
        toast({
          title: "✅ Product Identified!",
          description: `Found: ${aiResponse.product_name}`,
        });
      } else {
        toast({
          title: "Unable to Identify",
          description: "Couldn't recognize the product. Try a clearer image.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Image analysis error:', error);
      toast({
        title: "Error",
        description: "Failed to analyze image. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const analyzeProductWithAI = async (productName: string) => {
    const prompt = `
      Analyze the product "${productName}" and provide detailed recycling information in JSON format:
      {
        "product_name": "exact product name",
        "category": "product category",
        "recyclable": true/false,
        "recyclabilityScore": 0-100,
        "materials": [
          {
            "name": "material name",
            "percentage": 0-100,
            "recyclable": true/false,
            "recyclingCode": "recycling symbol code if applicable"
          }
        ],
        "instructions": ["step by step recycling instructions"],
        "preparation": ["preparation steps before recycling"],
        "environmentalImpact": {
          "co2SavedByRecycling": estimated kg,
          "waterSaved": estimated liters,
          "energySaved": estimated kWh
        },
        "alternatives": {
          "composting": true/false,
          "upcycling": ["creative reuse ideas"],
          "donation": true/false
        },
        "tips": ["additional recycling tips"],
        "warnings": ["things to avoid"]
      }
      
      Provide realistic, accurate recycling information based on common product knowledge.
    `;

    const response = await Gemini.generateText(prompt);
    if (!response) return null;

    try {
      // Extract JSON from response
      const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/) || response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const jsonStr = jsonMatch[1] || jsonMatch[0];
        return JSON.parse(jsonStr);
      }
      return JSON.parse(response);
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      return null;
    }
  };

  const analyzeImageWithAI = async (base64Image: string) => {
    const prompt = `
      Identify the product in this image and provide recycling information in JSON format:
      {
        "product_name": "identified product name",
        "brand": "brand if visible",
        "category": "product category",
        "recyclable": true/false,
        "recyclabilityScore": 0-100,
        "materials": [
          {
            "name": "material name",
            "percentage": estimated percentage,
            "recyclable": true/false,
            "recyclingCode": "code if visible"
          }
        ],
        "instructions": ["recycling instructions"],
        "preparation": ["preparation steps"],
        "environmentalImpact": {
          "co2SavedByRecycling": estimated kg,
          "waterSaved": estimated liters,
          "energySaved": estimated kWh
        },
        "confidence": 0.0-1.0
      }
    `;

    try {
      const requestBody = {
        contents: [{
          parts: [
            { text: prompt },
            { inline_data: { mime_type: "image/jpeg", data: base64Image.split(',')[1] } }
          ]
        }],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 2048,
        }
      };

      const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
      const MODEL = import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.5-flash';
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) throw new Error('API request failed');

      const data = await response.json();
      const responseText = data.candidates[0]?.content.parts[0]?.text;

      if (!responseText) return null;

      const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/) || responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const jsonStr = jsonMatch[1] || jsonMatch[0];
        return JSON.parse(jsonStr);
      }
      
      return JSON.parse(responseText);
    } catch (error) {
      console.error('Image AI analysis error:', error);
      return null;
    }
  };

  const handleRecycleConfirm = async (productName: string, environmentalImpact?: any, recyclabilityScore: number = 70) => {
    // Use provided impact or get from database
    let impactData = environmentalImpact;
    let recycScore = recyclabilityScore;
    
    if (!impactData) {
      const productData = recyclingDatabase[productName as keyof typeof recyclingDatabase];
      if (productData) {
        impactData = productData.environmentalImpact;
        recycScore = productData.recyclabilityScore;
      }
    }

    if (impactData && user) {
      try {
        // Update stats with new async method (10-100 points range)
        const result = await StatsService.updateAfterRecycle(user.id, {
          ...impactData,
          recyclabilityScore: recycScore
        });
        
        setRecyclingStats(StatsService.getRecyclingStats());

        // Add to recent recycles
        const updated = [productName, ...recentRecycles.filter(p => p !== productName)].slice(0, 5);
        setRecentRecycles(updated);
        localStorage.setItem('ecosnap_recent_recycles', JSON.stringify(updated));

        toast({
          title: "🎉 Great Job!",
          description: `${result.reason} - Points synced to your profile!`,
        });
      } catch (error) {
        console.error('Error updating recycle stats:', error);
        toast({
          title: "⚠️ Points Update Failed",
          description: "Your recycling was tracked locally, but we couldn't sync to the server.",
          variant: "destructive"
        });
      }
    } else if (!user) {
      toast({
        title: "⚠️ Not Logged In",
        description: "Please log in to earn and save recycling points.",
        variant: "destructive"
      });
    }
  };

  const renderAIRecyclingInfo = (product: any) => {
    return (
      <div className="space-y-6">
        {/* Smart Analysis Badge */}
        <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
          <Sparkles className="h-3 w-3 mr-1" />
          Smart Analysis
        </Badge>

        {/* Image Preview if available */}
        {imagePreview && (
          <Card>
            <CardContent className="pt-6">
              <img 
                src={imagePreview} 
                alt="Uploaded product" 
                className="w-full max-w-md mx-auto rounded-lg border-2 border-green-200"
              />
            </CardContent>
          </Card>
        )}

        {/* Header */}
        <Card className="border-2 border-green-200 dark:border-green-800 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-500 rounded-full">
                  <Recycle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl">{product.product_name}</CardTitle>
                  {product.brand && (
                    <p className="text-sm text-muted-foreground">by {product.brand}</p>
                  )}
                  <p className="text-sm text-muted-foreground">{product.category}</p>
                </div>
              </div>
              <Badge className={product.recyclable ? 'bg-green-600' : 'bg-red-600'}>
                {product.recyclabilityScore}% Recyclable
              </Badge>
            </div>
          </CardHeader>
        </Card>

        {/* Confidence Score (if available) */}
        {product.confidence && (
          <Card className="bg-blue-50 dark:bg-blue-950/30">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Analysis Confidence</span>
                <Badge variant="outline">
                  {Math.round(product.confidence * 100)}%
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Materials */}
        {product.materials && product.materials.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Material Composition
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {product.materials.map((material: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{material.name}</span>
                    {material.recyclable ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    )}
                    {material.recyclingCode && (
                      <Badge variant="outline" className="text-xs">
                        {material.recyclingCode}
                      </Badge>
                    )}
                  </div>
                  <span className="text-sm font-semibold">{material.percentage}%</span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              How to Recycle
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Preparation Steps */}
            {product.preparation && product.preparation.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Preparation Steps:</h4>
                <ol className="space-y-2">
                  {product.preparation.map((step: string, idx: number) => (
                    <li key={idx} className="flex gap-2">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 flex items-center justify-center text-sm">
                        {idx + 1}
                      </span>
                      <span className="text-sm">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
            
            {/* Main Instructions */}
            {product.instructions && product.instructions.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Recycling Instructions:</h4>
                <ul className="space-y-2">
                  {product.instructions.map((instruction: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{instruction}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Tips */}
            {product.tips && product.tips.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2 text-blue-600">💡 Tips:</h4>
                <ul className="space-y-1">
                  {product.tips.map((tip: string, idx: number) => (
                    <li key={idx} className="text-sm text-muted-foreground">• {tip}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Warnings */}
            {product.warnings && product.warnings.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2 text-orange-600">⚠️ Important:</h4>
                <ul className="space-y-1">
                  {product.warnings.map((warning: string, idx: number) => (
                    <li key={idx} className="text-sm text-orange-700 dark:text-orange-400">• {warning}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Environmental Impact */}
        {product.environmentalImpact && (
          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Leaf className="h-5 w-5 text-green-600" />
                Environmental Impact of Recycling
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 bg-white dark:bg-slate-900 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">
                    {product.environmentalImpact.co2SavedByRecycling} kg
                  </p>
                  <p className="text-xs text-muted-foreground">CO₂ Saved</p>
                </div>
                <div className="p-3 bg-white dark:bg-slate-900 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">
                    {product.environmentalImpact.waterSaved} L
                  </p>
                  <p className="text-xs text-muted-foreground">Water Saved</p>
                </div>
                <div className="p-3 bg-white dark:bg-slate-900 rounded-lg">
                  <p className="text-2xl font-bold text-yellow-600">
                    {product.environmentalImpact.energySaved} kWh
                  </p>
                  <p className="text-xs text-muted-foreground">Energy Saved</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Alternative Methods */}
        {product.alternatives && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Alternative Options
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {product.alternatives.composting && (
                <div className="p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Leaf className="h-4 w-4 text-green-600" />
                    <span className="font-semibold">Composting Available</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    This product can be composted at home or in industrial facilities.
                  </p>
                </div>
              )}
              
              {product.alternatives.donation && (
                <div className="p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <span className="font-semibold">💝 Consider donating if still usable</span>
                </div>
              )}
              
              {product.alternatives.upcycling && product.alternatives.upcycling.length > 0 && (
                <div className="p-3 bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800 rounded-lg">
                  <div className="font-semibold mb-2">♻️ Upcycling Ideas:</div>
                  <ul className="space-y-1">
                    {product.alternatives.upcycling.map((idea: string, idx: number) => (
                      <li key={idx} className="text-sm">• {idea}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Confirm Recycle Button */}
        <Card className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold">Ready to Recycle?</h3>
                <p className="text-sm text-green-50">
                  Earn eco-points by recycling this item!
                </p>
              </div>
              <Button 
                onClick={() => handleRecycleConfirm(product.product_name, product.environmentalImpact, product.recyclabilityScore)}
                size="lg"
                className="bg-white text-green-600 hover:bg-green-50"
              >
                <CheckCircle className="mr-2 h-5 w-5" />
                I Recycled This!
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderRecyclingInfo = (productKey: string) => {
    if (productKey === 'not-found') {
      return (
        <Card className="border-yellow-200 dark:border-yellow-800">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Product Not Found</h3>
              <p className="text-muted-foreground mb-4">
                We couldn't find recycling information for "{searchQuery}".
              </p>
              <p className="text-sm text-muted-foreground mb-2">
                Try searching for common items or upload an image of the product.
              </p>
              <div className="flex gap-2 justify-center mt-4">
                {Object.keys(recyclingDatabase).map((key) => (
                  <Button
                    key={key}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchQuery(key);
                      setSelectedProduct(key);
                    }}
                  >
                    {key}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    // Handle AI-generated results
    if (productKey === 'ai-result' && aiRecyclingInfo) {
      const product = aiRecyclingInfo;
      return renderAIRecyclingInfo(product);
    }

    const product = recyclingDatabase[productKey as keyof typeof recyclingDatabase];
    if (!product) return null;

    return (
      <div className="space-y-6">
        {/* Header */}
        <Card className="border-2 border-green-200 dark:border-green-800 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-500 rounded-full">
                  <Recycle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl capitalize">{productKey}</CardTitle>
                  <p className="text-sm text-muted-foreground">Recycling Guide</p>
                </div>
              </div>
              <Badge className={product.recyclable ? 'bg-green-600' : 'bg-red-600'}>
                {product.recyclabilityScore}% Recyclable
              </Badge>
            </div>
          </CardHeader>
        </Card>

        {/* Materials */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Material Composition
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {product.materials.map((material, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{material.name}</span>
                  {material.recyclable ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  )}
                  {material.recyclingCode && (
                    <Badge variant="outline" className="text-xs">
                      {material.recyclingCode}
                    </Badge>
                  )}
                </div>
                <span className="text-sm font-semibold">{material.percentage}%</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              How to Recycle
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Preparation Steps:</h4>
              <ol className="space-y-2">
                {product.preparation.map((step, idx) => (
                  <li key={idx} className="flex gap-2">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 flex items-center justify-center text-sm">
                      {idx + 1}
                    </span>
                    <span className="text-sm">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Recycling Instructions:</h4>
              <ul className="space-y-2">
                {product.instructions.map((instruction, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{instruction}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Impact */}
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Leaf className="h-5 w-5 text-green-600" />
              Environmental Impact
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-white dark:bg-slate-900 rounded-lg">
                <p className="text-2xl font-bold text-green-600">
                  {product.environmentalImpact.co2SavedByRecycling} kg
                </p>
                <p className="text-xs text-muted-foreground">CO₂ Saved</p>
              </div>
              <div className="p-3 bg-white dark:bg-slate-900 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">
                  {product.environmentalImpact.waterSaved} L
                </p>
                <p className="text-xs text-muted-foreground">Water Saved</p>
              </div>
              <div className="p-3 bg-white dark:bg-slate-900 rounded-lg">
                <p className="text-2xl font-bold text-yellow-600">
                  {product.environmentalImpact.energySaved} kWh
                </p>
                <p className="text-xs text-muted-foreground">Energy Saved</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Confirm Recycle Button */}
        <Card className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold">Ready to Recycle?</h3>
                <p className="text-sm text-green-50">
                  Earn eco-points by recycling this item!
                </p>
              </div>
              <Button 
                onClick={() => handleRecycleConfirm(productKey, product.environmentalImpact, product.recyclabilityScore)}
                size="lg"
                className="bg-white text-green-600 hover:bg-green-50"
              >
                <CheckCircle className="mr-2 h-5 w-5" />
                I Recycled This!
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
          <div className="p-3 bg-green-500 rounded-full">
            <Recycle className="h-8 w-8 text-white" />
          </div>
          Recycling Center
        </h1>
        <p className="text-muted-foreground">
          Learn how to recycle properly and track your environmental impact
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="search" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Search
          </TabsTrigger>
          <TabsTrigger value="tracker" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            My Impact
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Recent
          </TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="space-y-6">
          {/* Search Bar */}
          <Card>
            <CardContent className="pt-6">
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Search for a product to recycle (e.g., plastic bottle, cardboard box)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1"
                    disabled={loading}
                  />
                  <Button type="submit" disabled={loading}>
                    {loading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4 mr-2" />
                    )}
                    Search
                  </Button>
                </div>

                {/* Image Upload Option */}
                <div className="flex items-center gap-4">
                  <div className="flex-1 border-t border-muted"></div>
                  <span className="text-sm text-muted-foreground">OR</span>
                  <div className="flex-1 border-t border-muted"></div>
                </div>

                <div className="flex gap-2">
                  <label className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={loading}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      disabled={loading}
                      onClick={() => document.querySelector('input[type="file"]')?.click()}
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4 mr-2" />
                      )}
                      Upload Product Image
                    </Button>
                  </label>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={loading}
                    onClick={() => {
                      // Could add camera capture functionality
                      toast({
                        title: "Camera Feature",
                        description: "Use the upload button to select an image from your device.",
                      });
                    }}
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                  <Sparkles className="h-5 w-5 text-blue-600" />
                  <p className="text-sm text-muted-foreground">
                    <strong>Smart Analysis:</strong> Get instant recycling guidance for any product with intelligent search and image recognition!
                  </p>
                </div>
              </form>
              
              <div className="mt-4 flex flex-wrap gap-2">
                <p className="text-sm text-muted-foreground w-full mb-2">Quick search:</p>
                {Object.keys(recyclingDatabase).map((key) => (
                  <Button
                    key={key}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchQuery(key);
                      setSelectedProduct(key);
                      setAiRecyclingInfo(null);
                      setImagePreview(null);
                    }}
                    disabled={loading}
                  >
                    {key}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Loading State */}
          {loading && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <Loader2 className="h-12 w-12 text-primary mx-auto mb-4 animate-spin" />
                  <h3 className="text-xl font-semibold mb-2">Analyzing Product...</h3>
                  <p className="text-muted-foreground">
                    Please wait while we gather recycling information for your product.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Results */}
          {!loading && selectedProduct && renderRecyclingInfo(selectedProduct)}
        </TabsContent>

        <TabsContent value="tracker">
          {recyclingStats && <RecyclingTracker stats={recyclingStats} />}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {recentRecycles.length > 0 ? (
            recentRecycles.map((productKey) => (
              <Card key={productKey} className="cursor-pointer hover:border-green-500 transition-colors">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Recycle className="h-5 w-5 text-green-600" />
                      <div>
                        <h3 className="font-semibold capitalize">{productKey}</h3>
                        <p className="text-sm text-muted-foreground">Previously recycled</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchQuery(productKey);
                        setSelectedProduct(productKey);
                        setAiRecyclingInfo(null);
                        setImagePreview(null);
                        setActiveTab('search'); // Switch to search tab
                      }}
                    >
                      View Guide
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="pt-6 text-center py-12">
                <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Recycling History</h3>
                <p className="text-muted-foreground">
                  Start recycling products to see your history here!
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
