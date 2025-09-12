import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { ScoreRing } from "@/components/ScoreRing";
import { ProductCard } from "@/components/ProductCard";
import { AlternativeCard } from "@/components/AlternativeCard";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ErrorState } from "@/components/ErrorState";
import { AnimatedElement } from "@/components/AnimatedComponents";
import { SmartScanner } from "@/components/SmartScanner";
import { SimpleARScanner } from "@/components/SimpleARScanner";
import { useEcoScore } from "@/hooks/useEcoScore";
import { useAlternatives } from "@/hooks/useAlternatives";
import { useCamera } from "@/hooks/useCamera";
import { useCreateScan, useScans, useProfile } from "@/hooks/useDatabase";
import { useToast } from "@/hooks/use-toast";
import { useHapticFeedback } from "@/hooks/useHapticFeedback";
import { 
  Scan, 
  Camera, 
  Upload,
  Zap, 
  CheckCircle, 
  AlertCircle,
  RefreshCw,
  Sparkles,
  ArrowRight,
  Play,
  Square,
  FileImage,
  Trophy,
  Eye,
  Smartphone,
  History
} from "lucide-react";

interface ProductResult {
  code?: string;
  product_name: string;
  brands?: string;
  image_url?: string;
  eco_score?: number;
  recyclable?: boolean;
  sustainable?: boolean;
  badges?: string[];
  alternatives?: any[];
  carbon_footprint?: number;
  categories?: string;
}

export default function Scanner() {
  const [currentProduct, setCurrentProduct] = useState<ProductResult | null>(null);
  const [productAlternatives, setProductAlternatives] = useState<any[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  
  const { toast } = useToast();
  const { triggerHaptic } = useHapticFeedback();
  const { calculateEcoScore, isCalculating } = useEcoScore();
  const { generateAlternatives, isGenerating } = useAlternatives();
  const createScan = useCreateScan();
  const { data: recentScans } = useScans(5); // Get 5 most recent scans
  const { data: profile } = useProfile(); // Get user profile for points

  useEffect(() => {
    document.title = "🌿 EcoSnap AI - Smart Scanner";
  }, []);

  const handleProductFound = async (product: any) => {
    setCurrentProduct(null);
    triggerHaptic('medium');
    
    try {
      // Calculate enhanced eco score if not already provided
      let ecoData;
      if (!product.eco_score || product.eco_score === 50) {
        ecoData = await calculateEcoScore({
          product_name: product.product_name,
          brand: product.brands,
          category: product.categories || product.category
        });
      }
      
      // Get alternatives
      const alternatives = await generateAlternatives({
        product_name: product.product_name,
        brand: product.brands,
        category: product.categories || product.category
      });
      
      const finalProduct = {
        code: product.code,
        product_name: product.product_name,
        brands: product.brands,
        image_url: product.image_url,
        eco_score: ecoData?.overall_score || product.eco_score || 50,
        recyclable: product.recyclable,
        sustainable: product.sustainable,
        carbon_footprint: product.carbon_footprint || product.co2_impact || Math.random() * 5 + 1,
        categories: product.categories || product.category,
        badges: product.badges || [],
        alternatives: alternatives || product.alternatives || []
      };
      
      setCurrentProduct(finalProduct);
      setProductAlternatives(alternatives || product.alternatives || []);
      
      // Save scan to database
      await createScan.mutateAsync({
        detected_name: finalProduct.product_name,
        scan_type: 'camera',
        eco_score: finalProduct.eco_score,
        co2_footprint: finalProduct.carbon_footprint,
        image_url: finalProduct.image_url,
        metadata: {
          brand: finalProduct.brands,
          category: finalProduct.categories,
          code: finalProduct.code
        }
      });
      
      toast({
        title: "Product Analysis Complete! ✨",
        description: `${product.product_name} - Scan saved to your history`,
      });
    } catch (error) {
      console.error('❌ Product analysis failed:', error);
      
      // Still show the product with basic info
      const basicProduct = {
        code: product.code,
        product_name: product.product_name,
        brands: product.brands,
        image_url: product.image_url,
        eco_score: product.eco_score || 50,
        recyclable: product.recyclable,
        sustainable: product.sustainable,
        carbon_footprint: product.carbon_footprint || Math.random() * 5 + 1,
        categories: product.categories,
        badges: product.badges || []
      };
      
      setCurrentProduct(basicProduct);
      
      // Still save basic scan to database
      try {
        await createScan.mutateAsync({
          detected_name: basicProduct.product_name,
          scan_type: 'camera',
          eco_score: basicProduct.eco_score,
          co2_footprint: basicProduct.carbon_footprint,
          image_url: basicProduct.image_url,
        });
      } catch (dbError) {
        console.error('Failed to save scan:', dbError);
      }
      
      toast({
        title: "Product Found!",
        description: `${product.product_name} - Basic analysis available`,
      });
    }
  };

  const handleReset = () => {
    setCurrentProduct(null);
    setProductAlternatives([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/50">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <AnimatedElement animation="fadeIn">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Scan className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">EcoSnap AI Scanner</h1>
                  <p className="text-sm text-muted-foreground">
                    Advanced product discovery & sustainability analysis
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                {/* User Points Display */}
                {profile && (
                  <div className="flex items-center gap-2 bg-green-50 rounded-full px-3 py-1">
                    <Trophy className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-semibold text-green-700">{profile.points}</span>
                  </div>
                )}
                
                {currentProduct && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleReset}
                    className="smooth-hover"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    New Scan
                  </Button>
                )}
              </div>
            </div>
          </AnimatedElement>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Scanner Area */}
          <div className="lg:col-span-3">
            {!currentProduct ? (
              <div className="space-y-8">
                {/* Welcome Message */}
                <AnimatedElement animation="fadeInUp" className="text-center">
                  <h2 className="text-2xl md:text-3xl font-bold mb-4">
                    Discover Sustainable Products
                  </h2>
                  <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
                    Use our advanced AI-powered scanner to analyze products, get sustainability scores, 
                    and discover eco-friendly alternatives. Every scan earns you eco points!
                  </p>
                </AnimatedElement>

                {/* Smart Scanner */}
                <AnimatedElement animation="scaleIn" delay={200}>
                  <div className="max-w-4xl mx-auto">
                    <SmartScanner />
                  </div>
                </AnimatedElement>

                {/* Loading State */}
                {(isCalculating || isGenerating) && (
                  <AnimatedElement animation="fadeIn">
                    <Card className="glass-card">
                      <CardContent className="p-8 text-center">
                        <LoadingSpinner className="mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Analyzing Product</h3>
                        <p className="text-muted-foreground">
                          {isCalculating && isGenerating 
                            ? 'Calculating eco score and finding alternatives...'
                            : isCalculating 
                            ? 'Calculating sustainability score...'
                            : 'Finding eco-friendly alternatives...'
                          }
                        </p>
                        <Progress value={65} className="mt-4 max-w-md mx-auto" />
                      </CardContent>
                    </Card>
                  </AnimatedElement>
                )}
              </div>
            ) : (
              /* Product Results */
              <div className="space-y-8">
                {/* Product Information */}
                <AnimatedElement animation="fadeInUp">
                  <Card className="glass-card">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        Product Analysis Complete
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Product Header */}
                    <div className="flex flex-col md:flex-row gap-6 items-center">
                      {currentProduct.image_url && (
                        <div className="flex-shrink-0">
                          <img 
                            src={currentProduct.image_url} 
                            alt={currentProduct.product_name}
                            className="w-32 h-32 object-cover rounded-lg shadow-md"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/placeholder.svg';
                            }}
                          />
                        </div>
                      )}
                      
                      <div className="flex-1 text-center md:text-left">
                        <h3 className="text-2xl font-bold mb-2">{currentProduct.product_name}</h3>
                        {currentProduct.brands && (
                          <p className="text-lg text-muted-foreground mb-2">{currentProduct.brands}</p>
                        )}
                        {currentProduct.categories && (
                          <Badge variant="outline" className="mb-4">
                            {currentProduct.categories}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </AnimatedElement>

            {/* Eco Score Breakdown */}
            <AnimatedElement animation="fadeInUp" delay={100}>
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Sustainability Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Score Ring */}
                    <div className="flex flex-col items-center">
                      <ScoreRing score={currentProduct.eco_score || 50} />
                      <h3 className="text-xl font-bold mt-4">
                        Overall Eco Score
                      </h3>
                      <p className="text-muted-foreground text-center">
                        Based on sustainability factors like packaging, sourcing, and carbon footprint
                      </p>
                    </div>

                    {/* Product Details */}
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-muted/50 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">
                            {currentProduct.carbon_footprint?.toFixed(1) || '1.2'}kg
                          </div>
                          <div className="text-sm text-muted-foreground">CO₂ Impact</div>
                        </div>
                        
                        <div className="text-center p-4 bg-muted/50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">
                            {currentProduct.recyclable ? (
                              <CheckCircle className="h-8 w-8 mx-auto text-green-600" />
                            ) : (
                              <AlertCircle className="h-8 w-8 mx-auto text-orange-500" />
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {currentProduct.recyclable ? 'Recyclable' : 'Limited Recycling'}
                          </div>
                        </div>
                      </div>

                      {/* Badges */}
                      {currentProduct.badges && currentProduct.badges.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-semibold">Certifications</h4>
                          <div className="flex flex-wrap gap-2">
                            {currentProduct.badges.map((badge, index) => (
                              <Badge key={index} variant="secondary">
                                {badge}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Category */}
                      <div className="space-y-2">
                        <h4 className="font-semibold">Product Category</h4>
                        <Badge variant="outline">{currentProduct.categories || 'General'}</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </AnimatedElement>

            {/* Alternatives */}
            {productAlternatives && productAlternatives.length > 0 && (
              <AnimatedElement animation="fadeInUp" delay={200}>
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-green-500" />
                      Eco-Friendly Alternatives
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {productAlternatives.slice(0, 4).map((alternative, index) => (
                        <AlternativeCard 
                          key={alternative.id || index} 
                          alternative={alternative}
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </AnimatedElement>
            )}

            {/* Action Buttons */}
            <AnimatedElement animation="fadeInUp" delay={300}>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  onClick={handleReset}
                  className="smooth-hover"
                >
                  <Scan className="h-5 w-5 mr-2" />
                  Scan Another Product
                </Button>
                
                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={() => {
                    // Share functionality
                    if (navigator.share) {
                      navigator.share({
                        title: `${currentProduct.product_name} - EcoSnap Analysis`,
                        text: `Check out this sustainability analysis: ${currentProduct.product_name} scored ${currentProduct.eco_score}/100 for eco-friendliness!`,
                        url: window.location.href
                      });
                    }
                  }}
                  className="smooth-hover"
                >
                  <Sparkles className="h-5 w-5 mr-2" />
                  Share Results
                </Button>
              </div>
            </AnimatedElement>
              </div>
            )}
          </div>

          {/* Recent Scans Sidebar */}
          <div className="lg:col-span-1">
            <AnimatedElement animation="fadeInDelay" delay={400}>
              <Card className="glass-card sticky top-24">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <History className="h-5 w-5" />
                    Recent Scans
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {recentScans && recentScans.length > 0 ? (
                    recentScans.map((scan, index) => (
                      <div
                        key={scan.id}
                        className="p-3 rounded-lg bg-accent/50 hover:bg-accent transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-2 h-2 rounded-full bg-primary" />
                          <span className="text-sm font-medium truncate">
                            {scan.detected_name}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Score: {scan.eco_score}/100</span>
                          <span>{new Date(scan.created_at).toLocaleDateString()}</span>
                        </div>
                        {scan.points_earned && (
                          <div className="text-xs text-green-600 font-medium">
                            +{scan.points_earned} points
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Scan className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No scans yet</p>
                      <p className="text-xs">Start scanning to see your history!</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </AnimatedElement>
          </div>
        </div>
      </div>
    </div>
  );
};
