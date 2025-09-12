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
import { useBarcodeAPI } from "@/hooks/useBarcodeAPI";
import { useEcoScore } from "@/hooks/useEcoScore";
import { useAlternatives } from "@/hooks/useAlternatives";
import { useCamera } from "@/hooks/useCamera";
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
  FileImage
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
  const [scanMode, setScanMode] = useState<'camera' | 'upload' | 'barcode'>('camera');
  const [currentProduct, setCurrentProduct] = useState<ProductResult | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [manualBarcode, setManualBarcode] = useState('');
  const [productAlternatives, setProductAlternatives] = useState<any[]>([]);
  
  const { toast } = useToast();
  const { triggerHaptic } = useHapticFeedback();
  const { lookupBarcode, isLooking } = useBarcodeAPI();
  const { calculateEcoScore, isCalculating } = useEcoScore();
  const { generateAlternatives, isGenerating } = useAlternatives();
  const { 
    videoRef,
    startCamera, 
    stopCamera, 
    isActive: cameraIsActive,
    isLoading: cameraIsLoading,
    error: cameraError,
    hasPermission: cameraHasPermission
  } = useCamera();

  useEffect(() => {
    document.title = "🌿 EcoSnap AI - Smart Scanner";
    
    // Cleanup camera on unmount
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  const handleBarcodeDetected = async (barcode: string) => {
    setIsScanning(true);
    triggerHaptic('medium');
    
    try {
      // Look up product by barcode
      const product = await lookupBarcode(barcode);
      
      if (product && product.product_name) {
        // Calculate eco score
        const ecoData = await calculateEcoScore({
          product_name: product.product_name,
          brand: product.brands,
          category: product.categories
        });
        
        // Get alternatives
        const productAlternatives = await generateAlternatives({
          product_name: product.product_name,
          brand: product.brands,
          category: product.categories
        });
        
        setCurrentProduct({
          product_name: product.product_name || 'Unknown Product',
          ...product,
          eco_score: ecoData.overall_score
        });
        
        setProductAlternatives(productAlternatives);
        
        toast({
          title: "Product Found!",
          description: `Scanned: ${product.product_name}`,
        });
      }
    } catch (error) {
      toast({
        title: "Scan Failed",
        description: "Could not find product information. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsScanning(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    if (!file) return;
    
    setIsScanning(true);
    triggerHaptic('medium');
    
    try {
      // Create a preview
      const reader = new FileReader();
      reader.onload = () => {
        // Here you would implement actual barcode detection from image
        // For now, simulate processing
        setTimeout(async () => {
          // Mock barcode extraction - in real implementation, use a library like zxing-js
          const mockBarcode = '1234567890123';
          await handleBarcodeDetected(mockBarcode);
        }, 2000);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast({
        title: "Image Processing Failed",
        description: "Could not extract barcode from image. Please try again.",
        variant: "destructive"
      });
      setIsScanning(false);
    }
  };

  const handleManualBarcode = async () => {
    if (!manualBarcode.trim()) {
      toast({
        title: "Invalid Barcode",
        description: "Please enter a valid barcode.",
        variant: "destructive"
      });
      return;
    }
    
    await handleBarcodeDetected(manualBarcode);
    setManualBarcode('');
  };

  const handleCameraStart = async () => {
    try {
      await startCamera();
      toast({
        title: "Camera Started",
        description: "Point your camera at a product barcode to scan.",
      });
    } catch (error) {
      toast({
        title: "Camera Error",
        description: "Could not access camera. Please check permissions.",
        variant: "destructive"
      });
    }
  };

  const handleReset = () => {
    setCurrentProduct(null);
    setIsScanning(false);
    stopCamera();
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
                  <h1 className="text-xl font-bold">EcoSnap Scanner</h1>
                  <p className="text-sm text-muted-foreground">
                    Discover eco-friendly alternatives
                  </p>
                </div>
              </div>
              
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
          </AnimatedElement>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {!currentProduct ? (
          <div className="space-y-8">
            {/* Scan Mode Selection */}
            <AnimatedElement animation="fadeInUp" className="text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Choose Your Scanning Method
              </h2>
              <p className="text-muted-foreground mb-8">
                Select how you'd like to scan your product
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-2xl mx-auto">
                <Button
                  variant={scanMode === 'camera' ? 'default' : 'outline'}
                  size="lg"
                  onClick={() => setScanMode('camera')}
                  className="flex-1 smooth-hover"
                >
                  <Camera className="h-5 w-5 mr-2" />
                  Camera
                </Button>
                
                <Button
                  variant={scanMode === 'upload' ? 'default' : 'outline'}
                  size="lg"
                  onClick={() => setScanMode('upload')}
                  className="flex-1 smooth-hover"
                >
                  <Upload className="h-5 w-5 mr-2" />
                  Upload Photo
                </Button>
                
                <Button
                  variant={scanMode === 'barcode' ? 'default' : 'outline'}
                  size="lg"
                  onClick={() => setScanMode('barcode')}
                  className="flex-1 smooth-hover"
                >
                  <Scan className="h-5 w-5 mr-2" />
                  Enter Barcode
                </Button>
              </div>
            </AnimatedElement>

            {/* Scanner Interface */}
            <AnimatedElement animation="scaleIn" delay={200}>
              <Card className="glass-card">
                <CardContent className="p-8">
                  {/* Camera Scanner */}
                  {scanMode === 'camera' && (
                    <div className="text-center space-y-6">
                      <div className="mx-auto w-full max-w-md aspect-video bg-muted rounded-lg relative overflow-hidden">
                        {cameraIsActive ? (
                          <video 
                            ref={videoRef}
                            autoPlay 
                            playsInline
                            muted
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full space-y-4">
                            <Camera className="h-16 w-16 text-muted-foreground" />
                            <p className="text-muted-foreground">Camera preview will appear here</p>
                          </div>
                        )}
                        
                        {/* Scanning overlay */}
                        {isScanning && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <div className="text-center text-white">
                              <LoadingSpinner className="text-white" />
                              <p className="mt-2">Scanning...</p>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-4">
                        {!cameraIsActive ? (
                          <Button 
                            size="lg" 
                            onClick={handleCameraStart}
                            disabled={cameraIsLoading}
                            className="smooth-hover"
                          >
                            {cameraIsLoading ? (
                              <LoadingSpinner className="mr-2" />
                            ) : (
                              <Play className="h-5 w-5 mr-2" />
                            )}
                            {cameraIsLoading ? 'Starting Camera...' : 'Start Camera'}
                          </Button>
                        ) : (
                          <div className="flex gap-4 justify-center">
                            <Button 
                              size="lg" 
                              onClick={() => handleBarcodeDetected('demo-barcode')}
                              disabled={isScanning}
                              className="smooth-hover"
                            >
                              <Scan className="h-5 w-5 mr-2" />
                              Scan Now
                            </Button>
                            
                            <Button 
                              variant="outline" 
                              size="lg" 
                              onClick={stopCamera}
                              className="smooth-hover"
                            >
                              <Square className="h-4 w-4 mr-2" />
                              Stop
                            </Button>
                          </div>
                        )}
                        
                        {cameraError && (
                          <div className="text-center text-destructive text-sm">
                            {cameraError}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* File Upload Scanner */}
                  {scanMode === 'upload' && (
                    <div className="text-center space-y-6">
                      <div className="mx-auto w-full max-w-md aspect-video bg-muted rounded-lg border-2 border-dashed border-muted-foreground/25 flex flex-col items-center justify-center space-y-4">
                        <FileImage className="h-16 w-16 text-muted-foreground" />
                        <div className="space-y-2">
                          <p className="text-muted-foreground">Upload a photo of the product</p>
                          <p className="text-sm text-muted-foreground">Support for JPG, PNG files</p>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleImageUpload(file);
                          }}
                          className="hidden"
                          id="image-upload"
                        />
                        <label htmlFor="image-upload">
                          <Button size="lg" className="smooth-hover cursor-pointer" asChild>
                            <span>
                              <Upload className="h-5 w-5 mr-2" />
                              Choose Image
                            </span>
                          </Button>
                        </label>
                      </div>
                    </div>
                  )}
                  
                  {/* Manual Barcode Entry */}
                  {scanMode === 'barcode' && (
                    <div className="text-center space-y-6">
                      <div className="mx-auto w-full max-w-md space-y-4">
                        <div className="p-8 bg-muted rounded-lg">
                          <Scan className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground">Enter the barcode manually</p>
                        </div>
                        
                        <div className="flex gap-2">
                          <Input
                            placeholder="Enter barcode (e.g., 1234567890123)"
                            value={manualBarcode}
                            onChange={(e) => setManualBarcode(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') handleManualBarcode();
                            }}
                            className="text-center"
                          />
                          <Button 
                            onClick={handleManualBarcode}
                            disabled={isLooking || !manualBarcode.trim()}
                            className="smooth-hover"
                          >
                            {isLooking ? (
                              <LoadingSpinner />
                            ) : (
                              <ArrowRight className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {(isScanning || isLooking) && (
                    <div className="mt-6 text-center">
                      <LoadingSpinner />
                      <p className="text-muted-foreground mt-4">
                        {isLooking ? 'Looking up product...' : 'Processing scan...'}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </AnimatedElement>
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
                    Product Found
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <h3 className="text-xl font-semibold">{currentProduct.product_name}</h3>
                      {currentProduct.brands && (
                        <p className="text-muted-foreground">{currentProduct.brands}</p>
                      )}
                    </div>
                    
                    {currentProduct.image_url && (
                      <div className="flex justify-center">
                        <img 
                          src={currentProduct.image_url} 
                          alt={currentProduct.product_name}
                          className="w-32 h-32 object-cover rounded-lg"
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </AnimatedElement>

            {/* Eco Score */}
            <AnimatedElement animation="fadeInUp" delay={200}>
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Environmental Impact
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    <div className="text-center">
                      <ScoreRing 
                        score={currentProduct.eco_score || 65}
                        size="lg"
                      />
                    </div>
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold mb-2">Sustainability Metrics</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Carbon Footprint</span>
                            <Progress value={75} className="w-24" />
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Recyclability</span>
                            <Progress value={currentProduct.recyclable ? 90 : 30} className="w-24" />
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Packaging Impact</span>
                            <Progress value={60} className="w-24" />
                          </div>
                        </div>
                      </div>
                      
                      {currentProduct.badges && (
                        <div>
                          <h3 className="font-semibold mb-2">Certifications</h3>
                          <div className="flex flex-wrap gap-2">
                            {currentProduct.badges.map((badge, index) => (
                              <Badge key={index} variant="secondary">
                                {badge}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </AnimatedElement>

            {/* Alternatives */}
            {productAlternatives && productAlternatives.length > 0 && (
              <AnimatedElement animation="fadeInUp" delay={400}>
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-secondary" />
                      Better Alternatives
                      <Badge variant="outline">{productAlternatives.length} found</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {productAlternatives.map((alternative, index) => (
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
          </div>
        )}
      </div>
    </div>
  );
}
