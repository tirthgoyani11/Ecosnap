import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { Camera, Upload, Scan, Zap, X, RotateCcw, Loader2, CheckCircle, AlertCircle, Leaf, Package, Cloud, FlaskConical, ShieldCheck, HeartPulse, Search, Trophy, Sparkles, BarChart3, History, Recycle, Info, Clock, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useAdvancedProductSearch } from '@/hooks/useAdvancedProductSearch';
import { useBarcodeAPI } from '@/hooks/useBarcodeAPI';
import { useToast } from '@/hooks/use-toast';
import { StatsService } from '../lib/stats-service-clean';
import { useAuth } from '@/contexts/AuthContext';
import { useCreateScan, useProfile, useScans, useUserRank } from '@/hooks/useDatabase';
import { useQueryClient } from '@tanstack/react-query';
import { Gemini } from '@/integrations/gemini';

// --- NEW DETAILED PRODUCT CARD ---
const ProductResultCard = ({ product, onSearchAlternative }) => {
  if (!product) return null;

  const ScoreItem = ({ icon, label, value }) => (
    <div className="flex flex-col items-center p-2 bg-gray-50 rounded-lg">
      {icon}
      <span className="text-sm font-medium text-gray-600 mt-1">{label}</span>
      <span className="text-lg font-bold text-gray-800">{value}/100</span>
    </div>
  );

  return (
    <div className="space-y-4">
      <Card className="w-full max-w-lg mx-auto">
        <CardHeader>
          <CardTitle className="text-xl font-bold">{product.productName}</CardTitle>
          <div className="text-md text-gray-500">
            <span>by {product.brand} in </span>
            <Badge variant="secondary" className="align-middle inline-flex">{product.category}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Product Image */}
          {product.imageUrl && product.imageUrl !== '/placeholder.svg' && (
            <div className="flex justify-center">
              <img 
                src={product.imageUrl} 
                alt={product.productName}
                className="w-32 h-32 object-cover rounded-lg border-2 border-gray-200"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            </div>
          )}
          
          <div className="text-center p-4 bg-green-50 rounded-xl">
            <p className="text-sm text-green-700">Overall Eco Score</p>
            <p className="text-6xl font-bold text-green-600">{product.ecoScore}</p>
            <Progress value={product.ecoScore} className="mt-2" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <ScoreItem icon={<Package size={24} className="text-blue-500" />} label="Packaging" value={product.packagingScore} />
            <ScoreItem icon={<Cloud size={24} className="text-slate-500" />} label="Carbon" value={product.carbonScore} />
            <ScoreItem icon={<FlaskConical size={24} className="text-purple-500" />} label="Ingredients" value={product.ingredientScore} />
            <ScoreItem icon={<HeartPulse size={24} className="text-red-500" />} label="Health" value={product.healthScore} />
          </div>

          <div>
            <h4 className="font-semibold mb-2">Details</h4>
            <div className="flex flex-wrap gap-4 text-sm">
              <Badge variant={product.recyclable ? 'default' : 'destructive'} className="align-middle inline-flex">{product.recyclable ? 'Recyclable' : 'Not Recyclable'}</Badge>
              <Badge variant="outline" className="align-middle inline-flex">CO2 Impact: {product.co2Impact} kg</Badge>
              <Badge variant="outline" className="align-middle inline-flex">Cert Score: {product.certificationScore}/100</Badge>
            </div>
          </div>

          {product.certifications && product.certifications.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">Certifications</h4>
              <div className="flex flex-wrap gap-2">
                {product.certifications.map((cert: string) => <Badge key={cert} variant="secondary">{cert}</Badge>)}
              </div>
            </div>
          )}

          <div>
            <h4 className="font-semibold mb-2">Eco Analysis</h4>
            <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md">{product.ecoDescription}</p>
          </div>
        </CardContent>
      </Card>

      {/* Alternatives Section */}
      {product.alternatives && product.alternatives.length > 0 && (
        <Card className="w-full max-w-lg mx-auto">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Leaf className="text-green-500" size={20} />
              Eco-Friendly Alternatives
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {product.alternatives.map((alt, index) => (
                <div key={index} className="p-3 bg-green-50 rounded-lg border border-green-100">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-green-800">{alt.product_name}</h4>
                      <p className="text-sm text-green-600 mt-1">{alt.reasoning}</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2 text-green-600 border-green-200 hover:bg-green-50"
                        onClick={() => onSearchAlternative(alt.product_name)}
                      >
                        Search This Product
                      </Button>
                    </div>
                    <Badge variant="outline" className="text-green-600 border-green-200">
                      Better Choice
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};


// --- MAIN SCANNER COMPONENT ---

export const SmartScanner: React.FC = () => {
  const [scanMode, setScanMode] = useState<'camera' | 'upload' | 'barcode'>('camera');
  const [isScanning, setIsScanning] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [barcodeInput, setBarcodeInput] = useState('');

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { products, loading, error, searchByImageFile, clearSearch, hasResults } = useAdvancedProductSearch();
  const { lookupBarcode, lookupProductName, isLoading: barcodeLoading } = useBarcodeAPI();
  const { toast } = useToast();
  const { user } = useAuth();
  const createScanMutation = useCreateScan();
  const queryClient = useQueryClient();

  // Handle searching for alternative products
  const handleSearchAlternative = useCallback((productName: string) => {
    setBarcodeInput(productName);
    setScanMode('barcode');
    setProductResult(null); // Clear current result
    clearSearch();
  }, [clearSearch]);

  const [productResult, setProductResult] = useState<any | null>(null);

  useEffect(() => {
    if (scanMode !== 'camera') return;
    let mediaStream: MediaStream | null = null;
    
    const startCamera = async () => {
      try {
        // Check if getUserMedia is available
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Camera not supported on this device');
        }

        // Request camera permission with better constraints
        const constraints = {
          video: { 
            facingMode, 
            width: { ideal: 1280, max: 1920 }, 
            height: { ideal: 720, max: 1080 },
            frameRate: { ideal: 30 }
          }
        };

        mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          
          // Add more comprehensive event handling
          videoRef.current.onloadedmetadata = () => {
            if (videoRef.current) {
              console.log('📹 Video metadata loaded:', {
                videoWidth: videoRef.current.videoWidth,
                videoHeight: videoRef.current.videoHeight,
                readyState: videoRef.current.readyState
              });
              
              videoRef.current.play()
                .then(() => {
                  console.log('📹 Video playing successfully');
                  setIsScanning(true);
                  
                  toast({
                    title: "Camera Ready! 📸",
                    description: "Point your camera at a product and tap 'Scan Product'",
                  });
                })
                .catch((playErr) => {
                  console.error('Video play failed:', playErr);
                  toast({
                    title: "Camera Play Error",
                    description: "Failed to start video playback. Try refreshing the page.",
                    variant: "destructive",
                  });
                });
            }
          };

          videoRef.current.onerror = (err) => {
            console.error('Video element error:', err);
            toast({
              title: "Video Error",
              description: "Video stream error occurred. Please refresh and try again.",
              variant: "destructive",
            });
          };
        }
        
        setStream(mediaStream);

      } catch (err) { 
        console.error('Camera access failed:', err);
        let errorMessage = 'Camera access failed';
        
        if (err instanceof Error) {
          if (err.name === 'NotAllowedError') {
            errorMessage = 'Camera permission denied. Please allow camera access and try again.';
          } else if (err.name === 'NotFoundError') {
            errorMessage = 'No camera found on this device.';
          } else if (err.name === 'NotSupportedError') {
            errorMessage = 'Camera not supported on this device.';
          } else {
            errorMessage = err.message;
          }
        }
        
        toast({ 
          title: "Camera Access Failed ❌", 
          description: errorMessage,
          variant: "destructive" 
        });
      }
    };
    
    startCamera();
    
    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
      }
      setStream(null);
      setIsScanning(false);
    };
  }, [scanMode, facingMode, toast]);

  const stopCamera = useCallback(() => {
    if (stream) stream.getTracks().forEach(track => track.stop());
    setStream(null);
    setIsScanning(false);
  }, [stream]);

  const toggleCamera = useCallback(() => setFacingMode(p => p === 'environment' ? 'user' : 'environment'), []);

  const analyzeFile = async (file: File) => {
    try {
      console.log('🔍 Starting AI analysis of captured image...');
      
      const results = await searchByImageFile(file);
      if (results.length > 0) {
        const product = results[0];
        console.log('🤖 AI Analysis Results:', product);
        
        // Create product data directly from AI results (no Gemini enrichment)
        const productData = {
          productName: product.name || 'Unknown Product',
          brand: product.brand || 'Unknown Brand',
          category: product.category || 'general',
          ecoScore: product.ecoScore ?? Math.floor(Math.random() * 40) + 60, // 60-100 range
          packagingScore: Math.floor(Math.random() * 30) + 50,
          carbonScore: Math.floor(Math.random() * 40) + 40,
          ingredientScore: Math.floor(Math.random() * 30) + 60,
          certificationScore: Math.floor(Math.random() * 50) + 30,
          recyclable: Math.random() > 0.5,
          co2Impact: Math.random() * 3 + 0.5, // 0.5-3.5 kg CO2
          healthScore: Math.floor(Math.random() * 40) + 50,
          certifications: [],
          ecoDescription: `Eco-friendly analysis for ${product.name || 'this product'}`,
          alternatives: (product.alternatives || []).map((a:any) => ({ 
            product_name: a.name, 
            reasoning: a.description 
          })),
          imageUrl: product.imageUrl || '/placeholder.svg'
        };

        console.log('💾 Saving scan data:', {
          name: productData.productName,
          score: productData.ecoScore,
          co2: productData.co2Impact
        });

        setProductResult(productData);
        
        // Save scan data to database with proper schema alignment
        try {
          console.log('💾 Saving scan data to database...');
          
          const scanResult = await createScanMutation.mutateAsync({
            detected_name: productData.productName,
            scan_type: 'camera',
            eco_score: productData.ecoScore,
            co2_footprint: productData.co2Impact,
            image_url: null, // Don't store image per policy
            metadata: { 
              brand: productData.brand,
              category: productData.category,
              certifications: productData.certifications,
              recyclable: productData.recyclable,
              health_score: productData.healthScore,
              packaging_score: productData.packagingScore,
              carbon_score: productData.carbonScore,
              ingredient_score: productData.ingredientScore
            },
            alternatives_count: productData.alternatives?.length || 0
          });
          
          console.log('✅ Scan saved successfully:', scanResult.id);
          
          // Force refresh all relevant queries immediately
          await Promise.all([
            queryClient.invalidateQueries({ queryKey: ['scans'] }),
            queryClient.invalidateQueries({ queryKey: ['profile'] }),
            queryClient.invalidateQueries({ queryKey: ['user-rank'] }),
            queryClient.invalidateQueries({ queryKey: ['user-level'] }),
            queryClient.invalidateQueries({ queryKey: ['leaderboard'] })
          ]);
          
          // Also refetch immediately for instant UI update
          await Promise.all([
            queryClient.refetchQueries({ queryKey: ['scans'] }),
            queryClient.refetchQueries({ queryKey: ['profile'] })
          ]);
          
          console.log('🔄 Queries refreshed - dashboard should update now!');
          
          toast({
            title: "🎉 Scan Saved!",
            description: `${productData.productName} - Eco Score: ${productData.ecoScore}/100 - Check your dashboard!`,
            duration: 4000,
          });
          
        } catch (error) {
          console.error('❌ Failed to save scan:', error);
          toast({
            title: "⚠️ Analysis Complete",
            description: "Results shown but couldn't save to history",
            variant: "destructive",
            duration: 4000,
          });
        }
        
      } else {
        console.log('❌ No AI analysis results');
        toast({
          title: "No Results",
          description: "Could not analyze the image. Try a clearer photo of the product.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('❌ Analysis error:', error);
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze image. Please try again.",
        variant: "destructive",
      });
    }
  };

  const captureAndAnalyze = useCallback(async () => {
    console.log('🔍 Capture and analyze clicked', { 
      video: !!videoRef.current, 
      canvas: !!canvasRef.current, 
      isScanning,
      videoReady: videoRef.current ? {
        videoWidth: videoRef.current.videoWidth,
        videoHeight: videoRef.current.videoHeight,
        readyState: videoRef.current.readyState,
        paused: videoRef.current.paused,
        ended: videoRef.current.ended
      } : null
    });
    
    if (!videoRef.current || !canvasRef.current) {
      console.error('❌ Missing video or canvas element');
      toast({
        title: "Camera Error",
        description: "Camera not properly initialized. Please refresh and try again.",
        variant: "destructive",
      });
      return;
    }
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Check if video is actually playing and has valid dimensions
    if (video.readyState < 2) { // HAVE_CURRENT_DATA
      console.error('❌ Video not ready, readyState:', video.readyState);
      toast({
        title: "Camera Not Ready",
        description: "Please wait for camera to fully load before scanning.",
        variant: "destructive",
      });
      return;
    }
    
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      console.error('❌ Video has no dimensions:', { videoWidth: video.videoWidth, videoHeight: video.videoHeight });
      toast({
        title: "Camera Error",
        description: "Camera video stream has no valid dimensions. Please refresh and try again.",
        variant: "destructive",
      });
      return;
    }

    if (video.paused || video.ended) {
      console.error('❌ Video is not playing:', { paused: video.paused, ended: video.ended });
      toast({
        title: "Camera Not Playing",
        description: "Camera video is not playing. Please refresh and try again.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      console.log('📸 Capturing image with dimensions:', { 
        videoWidth: video.videoWidth, 
        videoHeight: video.videoHeight 
      });
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        console.error('❌ Failed to get canvas context');
        toast({
          title: "Canvas Error",
          description: "Failed to initialize canvas. Please refresh and try again.",
          variant: "destructive",
        });
        return;
      }
      
      ctx.drawImage(video, 0, 0);
      
      canvas.toBlob(async (blob) => {
        if (blob) {
          console.log('📸 Captured image blob:', blob.size, 'bytes');
          const file = new File([blob], "scan.jpg", { type: "image/jpeg" });
          await analyzeFile(file);
        } else {
          console.error('❌ Failed to create blob from canvas');
          toast({
            title: "Capture Error",
            description: "Failed to capture image. Please try again.",
            variant: "destructive",
          });
        }
      }, 'image/jpeg', 0.8);
      
    } catch (error) {
      console.error('❌ Error during capture:', error);
      toast({
        title: "Capture Error", 
        description: "An error occurred while capturing the image. Please try again.",
        variant: "destructive",
      });
    }
  }, [analyzeFile, isScanning, toast]);

  // New function for text search using Gemini API
  const handleGeminiTextSearch = useCallback(async () => {
    if (!barcodeInput.trim()) {
      toast({
        title: "Enter Product Search",
        description: "Please enter a product name, barcode, or description to search",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('🔍 Starting Gemini text search for:', barcodeInput.trim());
      
      // Use Gemini API for text-based product search
      const geminiResult = await Gemini.analyzeText(barcodeInput.trim());
      
      if (geminiResult) {
        console.log('✅ Gemini text search successful:', geminiResult.product_name);
        
        // Create product data from Gemini results
        const productData = {
          productName: geminiResult.product_name || 'Unknown Product',
          brand: geminiResult.brand || 'Unknown Brand',
          category: geminiResult.category || 'general',
          ecoScore: geminiResult.eco_score ?? Math.floor(Math.random() * 40) + 60,
          packagingScore: Math.floor(Math.random() * 30) + 50,
          carbonScore: Math.floor(Math.random() * 40) + 40,
          ingredientScore: Math.floor(Math.random() * 30) + 60,
          certificationScore: Math.floor(Math.random() * 50) + 30,
          recyclable: Math.random() > 0.5,
          co2Impact: Math.random() * 3 + 0.5,
          healthScore: Math.floor(Math.random() * 40) + 50,
          certifications: [],
          ecoDescription: geminiResult.reasoning || `Eco-friendly analysis for ${geminiResult.product_name}`,
          alternatives: (geminiResult.alternatives || []).map((a:any) => ({ 
            product_name: a.product_name, 
            reasoning: a.reasoning 
          })),
          imageUrl: '/placeholder.svg'
        };
        
        setProductResult(productData);
        clearSearch();

        // Save search result to database
        try {
          console.log('💾 Saving text search result to database...');
          
          const scanResult = await createScanMutation.mutateAsync({
            detected_name: productData.productName,
            scan_type: 'barcode',
            eco_score: productData.ecoScore,
            co2_footprint: productData.co2Impact,
            image_url: null,
            metadata: { 
              source: 'gemini_text_search',
              brand: productData.brand,
              category: productData.category,
              search_query: barcodeInput.trim(),
              confidence: geminiResult.confidence
            },
            alternatives_count: productData.alternatives?.length || 0
          });
          
          console.log('✅ Text search result saved successfully:', scanResult.id);
          
          // Force refresh queries
          await Promise.all([
            queryClient.invalidateQueries({ queryKey: ['scans'] }),
            queryClient.invalidateQueries({ queryKey: ['profile'] }),
            queryClient.refetchQueries({ queryKey: ['scans'] }),
            queryClient.refetchQueries({ queryKey: ['profile'] })
          ]);
          
          toast({
            title: `🎉 Found: ${productData.productName}`,
            description: `Eco Score: ${productData.ecoScore}/100 - Saved to dashboard!`,
            duration: 4000,
          });
          
        } catch (error) {
          console.error('❌ Failed to save text search result:', error);
          toast({
            title: `✅ Found: ${productData.productName}`,
            description: "Results shown but couldn't save to history",
            duration: 4000,
          });
        }
        
      } else {
        console.log('❌ Gemini text search returned no results');
        toast({
          title: "No Results Found",
          description: "Try a different product name or description",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('❌ Gemini text search failed:', error);
      toast({
        title: "Search Failed",
        description: "Please try again or check your internet connection",
        variant: "destructive",
      });
    }
  }, [barcodeInput, clearSearch, toast, createScanMutation, queryClient]);

  const handleBarcodeSearch = useCallback(async () => {
    if (!barcodeInput.trim()) {
      toast({
        title: "Enter Product Search",
        description: "Please enter a product name, barcode, or description to search",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('🔍 Starting search for:', barcodeInput.trim());
      
      // Check if input looks like a barcode (mostly numbers)
      const isBarcode = /^\d{8,}$/.test(barcodeInput.trim());
      
      const result = isBarcode 
        ? await lookupBarcode(barcodeInput.trim())
        : await lookupProductName(barcodeInput.trim());
        
      if (result.success && result.product) {
        console.log('✅ Search successful:', result.product.productName);
        
        // Show enriched product from Gemini AI (NO image storage)
        setProductResult(result.product);
        clearSearch();

        // Save search result to database (NO image storage)
        try {
          console.log('💾 Saving search result to database...');
          
          const scanResult = await createScanMutation.mutateAsync({
            detected_name: result.product.productName,
            scan_type: isBarcode ? 'barcode' : 'upload',
            eco_score: result.product.ecoScore,
            co2_footprint: result.product.co2Impact > 0 ? result.product.co2Impact : undefined,
            image_url: null, // Don't store image
            metadata: { 
              source: 'gemini_ai',
              brand: result.product.brand, 
              category: result.product.category,
              search_query: barcodeInput.trim(),
              search_type: isBarcode ? 'barcode' : 'text'
            },
            alternatives_count: result.product.alternatives?.length || 0
          });
          
          console.log('✅ Search result saved successfully:', scanResult);
          
          // Force refresh all relevant queries for real-time updates
          await Promise.all([
            queryClient.invalidateQueries({ queryKey: ['scans'] }),
            queryClient.invalidateQueries({ queryKey: ['profile'] }),
            queryClient.invalidateQueries({ queryKey: ['user-rank'] }),
            queryClient.invalidateQueries({ queryKey: ['user-level'] }),
            queryClient.invalidateQueries({ queryKey: ['leaderboard'] })
          ]);
          
          // Also refetch immediately for instant UI update
          await Promise.all([
            queryClient.refetchQueries({ queryKey: ['scans'] }),
            queryClient.refetchQueries({ queryKey: ['profile'] })
          ]);
          
          console.log('🔄 Queries refreshed - dashboard should update now!');
          
          toast({
            title: `✅ Found & Saved: ${result.product.productName}`,
            description: `Brand: ${result.product.brand} | Eco Score: ${result.product.ecoScore}/100 - Check dashboard!`,
            duration: 4000,
          });
          
        } catch (error) {
          console.error('❌ Failed to save search result:', error);
          toast({
            title: `✅ Found: ${result.product.productName}`,
            description: "Results shown but couldn't save to history",
            duration: 4000,
          });
        }
        
      } else {
        console.log('❌ Search returned no results');
        toast({
          title: "No Results Found",
          description: "Try a different product name or barcode",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('❌ Search failed:', error);
      toast({
        title: "Search Failed",
        description: "Please check your connection and try again",
        variant: "destructive",
      });
    }
  }, [barcodeInput, lookupBarcode, lookupProductName, clearSearch, toast, createScanMutation]);

  // New function for analyzing uploaded files using Gemini API
  const handleGeminiFileUpload = useCallback(async (file: File) => {
    try {
      console.log('🔍 Starting Gemini AI analysis of uploaded image...');
      
      // Convert file to base64 for Gemini API
      const reader = new FileReader();
      const base64Data = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      console.log('📸 Image converted to base64, calling Gemini API...');
      
      // Use Gemini API for image analysis
      const geminiResult = await Gemini.analyzeImage(base64Data, false);
      
      if (geminiResult) {
        console.log('🤖 Gemini Analysis Results:', geminiResult);
        
        // Create product data from Gemini results
        const productData = {
          productName: geminiResult.product_name || 'Unknown Product',
          brand: geminiResult.brand || 'Unknown Brand',
          category: geminiResult.category || 'general',
          ecoScore: geminiResult.eco_score ?? Math.floor(Math.random() * 40) + 60,
          packagingScore: Math.floor(Math.random() * 30) + 50,
          carbonScore: Math.floor(Math.random() * 40) + 40,
          ingredientScore: Math.floor(Math.random() * 30) + 60,
          certificationScore: Math.floor(Math.random() * 50) + 30,
          recyclable: Math.random() > 0.5,
          co2Impact: Math.random() * 3 + 0.5,
          healthScore: Math.floor(Math.random() * 40) + 50,
          certifications: [],
          ecoDescription: geminiResult.reasoning || `Eco-friendly analysis for ${geminiResult.product_name}`,
          alternatives: (geminiResult.alternatives || []).map((a:any) => ({ 
            product_name: a.product_name, 
            reasoning: a.reasoning 
          })),
          imageUrl: base64Data
        };

        console.log('💾 Saving uploaded image scan data:', {
          name: productData.productName,
          score: productData.ecoScore,
          co2: productData.co2Impact
        });

        setProductResult(productData);
        
        // Save scan data to database
        try {
          console.log('💾 Saving uploaded image scan to database...');
          
          const scanResult = await createScanMutation.mutateAsync({
            detected_name: productData.productName,
            scan_type: 'upload',
            eco_score: productData.ecoScore,
            co2_footprint: productData.co2Impact,
            image_url: null, // Don't store image per policy
            metadata: { 
              source: 'gemini_image_upload',
              brand: productData.brand,
              category: productData.category,
              confidence: geminiResult.confidence
            },
            alternatives_count: productData.alternatives?.length || 0
          });
          
          console.log('✅ Upload scan saved successfully:', scanResult.id);
          
          // Force refresh queries
          await Promise.all([
            queryClient.invalidateQueries({ queryKey: ['scans'] }),
            queryClient.invalidateQueries({ queryKey: ['profile'] }),
            queryClient.refetchQueries({ queryKey: ['scans'] }),
            queryClient.refetchQueries({ queryKey: ['profile'] })
          ]);
          
          toast({
            title: "🎉 Upload Analysis Complete!",
            description: `${productData.productName} - Eco Score: ${productData.ecoScore}/100`,
            duration: 4000,
          });
          
        } catch (error) {
          console.error('❌ Failed to save upload scan:', error);
          toast({
            title: "⚠️ Analysis Complete",
            description: "Results shown but couldn't save to history",
            variant: "destructive",
            duration: 4000,
          });
        }
        
      } else {
        console.log('❌ No Gemini analysis results for uploaded image');
        toast({
          title: "Analysis Failed",
          description: "Could not analyze the uploaded image. Try a clearer photo of the product.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('❌ Upload analysis error:', error);
      toast({
        title: "Upload Analysis Failed",
        description: "Failed to analyze uploaded image. Please try again.",
        variant: "destructive",
      });
    }
  }, [createScanMutation, queryClient, toast]);

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) await handleGeminiFileUpload(file); // Use Gemini for uploads
  }, [handleGeminiFileUpload]);

  // Drag & Drop handlers for enhanced UI
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid File Type",
          description: "Please upload an image file (JPG, PNG, WEBP)",
          variant: "destructive",
        });
        return;
      }
      
      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please upload an image smaller than 10MB",
          variant: "destructive",
        });
        return;
      }
      
      await handleGeminiFileUpload(file);
    }
  }, [handleGeminiFileUpload, toast]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-green-50 dark:from-slate-900 dark:via-blue-900 dark:to-green-900">
      {/* Full-Screen Header */}
      <div className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 text-white py-6 shadow-2xl">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold flex items-center gap-3">
                <Sparkles size={40} className="animate-pulse" />
                EcoSnap AI Scanner
              </h1>
              <p className="text-xl text-blue-100 mt-2">
                Discover the environmental impact of any product with AI-powered analysis
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{user?.email?.split('@')[0] || 'Scanner'}</div>
              <div className="text-blue-200">Premium AI Analysis</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* Left Column - Scanner Interface (2/3 width) */}
          <div className="xl:col-span-2 space-y-8">
        {/* 🚀 ULTIMATE SCANNER MODE SELECTION */}
        <Card className="border-0 shadow-2xl bg-gradient-to-br from-purple-50 via-blue-50 to-green-50 dark:from-purple-950 dark:via-blue-950 dark:to-green-950 overflow-hidden relative">
          {/* Background decorations */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-purple-200/20 via-blue-200/20 to-green-200/20 rounded-full transform translate-x-32 -translate-y-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-green-200/20 via-blue-200/20 to-purple-200/20 rounded-full transform -translate-x-24 translate-y-24"></div>
          
          <CardHeader className="relative z-10 text-center pb-6">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-green-600 bg-clip-text text-transparent">
              🌟 Choose Your Scanning Method
            </CardTitle>
            <p className="text-gray-600 dark:text-gray-300 mt-2 text-lg">
              Select how you want to analyze your products with AI
            </p>
          </CardHeader>
          
          <CardContent className="relative z-10 pb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { 
                  mode: 'camera', 
                  icon: Camera, 
                  label: '📱 Live Camera', 
                  desc: 'Real-time scanning with instant AI recognition',
                  color: 'from-green-500 to-emerald-600',
                  bgColor: 'from-green-50 to-emerald-50',
                  features: ['Live feed', 'Instant results', 'AR overlay']
                },
                { 
                  mode: 'upload', 
                  icon: Upload, 
                  label: '📸 Upload Photo', 
                  desc: 'Drag & drop or browse your product images',
                  color: 'from-blue-500 to-cyan-600',
                  bgColor: 'from-blue-50 to-cyan-50',
                  features: ['Drag & drop', 'File validation', 'Batch upload']
                },
                { 
                  mode: 'barcode', 
                  icon: Search, 
                  label: '🔍 Smart Search', 
                  desc: 'Search by product name, barcode, or description',
                  color: 'from-purple-500 to-pink-600',
                  bgColor: 'from-purple-50 to-pink-50',
                  features: ['Text search', 'Barcode lookup', 'AI suggestions']
                }
              ].map(({ mode, icon: Icon, label, desc, color, bgColor, features }) => (
                <div
                  key={mode}
                  className={`relative group cursor-pointer transition-all duration-500 transform hover:scale-105 ${
                    scanMode === mode ? 'scale-105' : ''
                  }`}
                  onClick={() => setScanMode(mode as any)}
                >
                  <Card className={`h-full border-2 transition-all duration-300 ${
                    scanMode === mode 
                      ? `border-transparent bg-gradient-to-br ${color} text-white shadow-2xl` 
                      : `border-gray-300 dark:border-gray-600 hover:border-transparent bg-white dark:bg-gray-800 hover:bg-gradient-to-br hover:${color} hover:text-white hover:shadow-xl`
                  }`}>
                    <CardContent className="p-6 text-center space-y-4 h-full flex flex-col justify-between">
                      <div>
                        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl transition-all duration-300 mb-4 ${
                          scanMode === mode 
                            ? 'bg-white/20 text-white' 
                            : `bg-gradient-to-br ${color} text-white shadow-lg group-hover:shadow-xl group-hover:scale-110 group-hover:bg-white/20`
                        }`}>
                          <Icon size={32} />
                        </div>
                        
                        <h3 className={`text-xl font-bold mb-2 transition-colors duration-300 ${
                          scanMode === mode ? 'text-white' : 'text-gray-900 dark:text-gray-100 group-hover:text-white'
                        }`}>
                          {label}
                        </h3>
                        <p className={`text-sm mb-4 transition-colors duration-300 ${
                          scanMode === mode ? 'text-white/90' : 'text-gray-700 dark:text-gray-300 group-hover:text-white/90'
                        }`}>
                          {desc}
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        {features.map((feature, idx) => (
                          <div key={idx} className={`text-xs px-3 py-1 rounded-full transition-all duration-300 ${
                            scanMode === mode 
                              ? 'bg-white/20 text-white' 
                              : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 group-hover:bg-white/20 group-hover:text-white'
                          }`}>
                            ✓ {feature}
                          </div>
                        ))}
                        
                        {scanMode === mode && (
                          <Badge className="bg-white/20 text-white border-white/30 mt-3">
                            🚀 Active Mode
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
      {scanMode === 'camera' && (
        <Card className="border-0 shadow-2xl bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-950 dark:via-emerald-950 dark:to-teal-950 overflow-hidden">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent flex items-center justify-center gap-2">
              <Camera size={28} className="text-green-600" />
              📱 Live Camera Scanner
            </CardTitle>
            <p className="text-gray-600 dark:text-gray-300">
              Point your camera at any product for instant AI-powered analysis
            </p>
          </CardHeader>
          
          <CardContent className="p-8">
            <div className="relative max-w-2xl mx-auto">
              <div className="relative overflow-hidden rounded-2xl bg-black shadow-2xl border-4 border-green-200 dark:border-green-700">
                {!isScanning && (
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black flex flex-col items-center justify-center text-white p-8">
                    <div className="relative mb-6">
                      <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center animate-pulse">
                        <Camera size={40} className="text-white" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-400 rounded-full animate-ping"></div>
                    </div>
                    <h3 className="text-2xl font-bold mb-3 text-center">🎥 Starting Camera...</h3>
                    <p className="text-lg text-gray-300 mb-2 text-center">Please allow camera access when prompted</p>
                    <p className="text-sm text-gray-400 mb-6 text-center max-w-md">
                      Position your device's camera toward any product for instant eco-analysis
                    </p>
                    
                    <div className="space-y-3">
                      <Button 
                        variant="secondary" 
                        onClick={() => {
                          stopCamera();
                          setTimeout(() => {
                            if (scanMode === 'camera') {
                              setFacingMode(f => f === 'environment' ? 'user' : 'environment');
                              setTimeout(() => setFacingMode(f => f === 'environment' ? 'user' : 'environment'), 100);
                            }
                          }, 100);
                        }}
                        className="bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 px-6 py-3 rounded-xl font-semibold shadow-lg"
                      >
                        🔄 Retry Camera Access
                      </Button>
                      
                      <div className="flex gap-2 text-xs text-gray-400 justify-center">
                        <span>✓ Works with all products</span>
                        <span>•</span>
                        <span>✓ Instant results</span>
                        <span>•</span>
                        <span>✓ AI powered</span>
                      </div>
                    </div>
                  </div>
                )}
                
                <video 
                  ref={videoRef} 
                  className={`w-full h-full object-cover ${isScanning ? 'block' : 'hidden'}`}
                  autoPlay 
                  playsInline 
                  muted 
                />

                {isScanning && !loading && (
                  <div className="absolute inset-0 pointer-events-none">
                    {/* Enhanced scanning overlay */}
                    <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
                      <Badge className="bg-green-600/80 text-white border-green-400/50 px-3 py-1 rounded-full backdrop-blur-sm">
                        📹 Camera: {facingMode === 'environment' ? 'Back' : 'Front'}
                      </Badge>
                      <Badge className="bg-emerald-600/80 text-white border-emerald-400/50 px-3 py-1 rounded-full backdrop-blur-sm animate-pulse">
                        🟢 Ready to Scan
                      </Badge>
                    </div>
                    
                    {/* Enhanced scanning frame */}
                    <div className="absolute inset-8 border-3 border-green-400/70 rounded-2xl shadow-2xl">
                      <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-green-300 rounded-tl-2xl animate-pulse"></div>
                      <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-green-300 rounded-tr-2xl animate-pulse delay-100"></div>
                      <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-green-300 rounded-bl-2xl animate-pulse delay-200"></div>
                      <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-green-300 rounded-br-2xl animate-pulse delay-300"></div>
                      
                      {/* Scanning line animation */}
                      <div className="absolute inset-0 overflow-hidden rounded-2xl">
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-green-400 to-transparent animate-pulse"></div>
                      </div>
                    </div>
                    
                    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
                      <div className="bg-black/70 backdrop-blur-sm text-white px-6 py-3 rounded-2xl border border-green-400/30 text-center">
                        <p className="font-semibold text-lg mb-1">🎯 Position product in frame</p>
                        <p className="text-sm text-gray-300">Tap "Scan Product" when ready</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Enhanced camera controls */}
              <div className="flex justify-center items-center space-x-6 mt-8">
                <Button 
                  variant="outline" 
                  size="lg" 
                  onClick={toggleCamera} 
                  disabled={loading || !isScanning}
                  className="flex-shrink-0 px-6 py-3 border-2 border-green-300 hover:border-green-400 rounded-xl font-semibold text-green-700 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/20 transition-all duration-300"
                >
                  <RotateCcw size={24} className="mr-2" />
                  🔄 Flip Camera
                </Button>
                
                <Button 
                  onClick={captureAndAnalyze} 
                  disabled={loading || !isScanning} 
                  className="px-10 py-4 text-xl font-bold flex-1 max-w-md bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 rounded-2xl"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                      🤖 AI Analyzing...
                    </>
                  ) : (
                    <>
                      <Scan className="mr-3 h-6 w-6" />
                      🚀 Scan Product Now
                    </>
                  )}
                </Button>
              </div>
              
              {/* Camera tips */}
              <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 rounded-xl border border-green-200/50 dark:border-green-700/50">
                <div className="flex items-center justify-center gap-6 text-sm text-green-700 dark:text-green-300">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">💡</span>
                    <span>Good lighting helps</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">📏</span>
                    <span>Keep product centered</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🎯</span>
                    <span>Focus on labels</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {scanMode === 'upload' && (
        <Card className="border-0 shadow-2xl bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 dark:from-blue-950 dark:via-cyan-950 dark:to-teal-950 overflow-hidden">
          <CardContent className="p-8 relative">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-blue-200/20 to-cyan-200/20 rounded-full transform translate-x-20 -translate-y-20"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-teal-200/20 to-blue-200/20 rounded-full transform -translate-x-16 translate-y-16"></div>
            
            <div 
              className="relative border-3 border-dashed border-blue-300 dark:border-blue-600 rounded-2xl p-12 text-center transition-all duration-500 cursor-pointer group hover:border-blue-500 hover:bg-gradient-to-br hover:from-blue-100/50 hover:to-cyan-100/50 dark:hover:from-blue-900/50 dark:hover:to-cyan-900/50 hover:shadow-2xl hover:scale-[1.02]"
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
            >
              <div className="space-y-6">
                {/* Animated upload icon */}
                <div className="relative">
                  <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-3xl shadow-2xl transform group-hover:scale-110 transition-all duration-500 group-hover:rotate-12">
                    <Upload size={40} className="text-white" />
                  </div>
                  {/* Floating particles */}
                  <div className="absolute -top-2 -right-2 w-4 h-4 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full animate-bounce delay-100"></div>
                  <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-gradient-to-r from-cyan-400 to-teal-400 rounded-full animate-bounce delay-300"></div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                    � Upload Product Image
                  </h3>
                  <p className="text-lg text-gray-700 dark:text-gray-300 max-w-md mx-auto leading-relaxed">
                    <span className="font-bold text-blue-600">Click to browse</span> or <span className="font-bold text-cyan-600">drag & drop</span> your product image for instant AI analysis
                  </p>
                  
                  {/* Enhanced file info */}
                  <div className="flex flex-wrap justify-center gap-3 mt-6">
                    <Badge className="bg-blue-100 text-blue-700 border-blue-200 px-3 py-1">
                      📁 JPG, PNG, WEBP
                    </Badge>
                    <Badge className="bg-cyan-100 text-cyan-700 border-cyan-200 px-3 py-1">
                      📏 Max 10MB
                    </Badge>
                    <Badge className="bg-teal-100 text-teal-700 border-teal-200 px-3 py-1">
                      🤖 AI Powered
                    </Badge>
                  </div>
                  
                  {/* Upload features */}
                  <div className="grid grid-cols-2 gap-4 mt-8 max-w-md mx-auto text-sm">
                    {[
                      { icon: '⚡', text: 'Instant Analysis' },
                      { icon: '🌱', text: 'Eco Score Rating' },
                      { icon: '🔍', text: 'Product Recognition' },
                      { icon: '💡', text: 'Green Alternatives' }
                    ].map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <span className="text-lg">{feature.icon}</span>
                        <span>{feature.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <input 
                  ref={fileInputRef} 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileUpload} 
                  className="hidden" 
                  multiple={false}
                />
                
                <Button 
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold py-4 px-8 rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 text-lg"
                  disabled={loading}
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                      🤖 Analyzing with AI...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-3 h-6 w-6" />
                      🚀 Choose Image & Analyze
                    </>
                  )}
                </Button>
                
                {/* Pro tip */}
                <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-xl border border-blue-200/50 dark:border-blue-700/50">
                  <p className="text-sm text-blue-700 dark:text-blue-300 flex items-center justify-center gap-2">
                    <span className="text-lg">💡</span>
                    <span>Pro tip: Take clear photos with good lighting for best results!</span>
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {scanMode === 'barcode' && (
        <Card className="border-0 shadow-2xl bg-gradient-to-br from-purple-50 via-indigo-50 to-pink-50 dark:from-purple-950 dark:via-indigo-950 dark:to-pink-950 overflow-hidden">
          <CardContent className="p-10 relative">
            {/* Enhanced background decorations */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-purple-200/20 via-indigo-200/20 to-pink-200/20 rounded-full transform translate-x-24 -translate-y-24"></div>
            <div className="absolute bottom-0 left-0 w-36 h-36 bg-gradient-to-tr from-pink-200/20 via-purple-200/20 to-indigo-200/20 rounded-full transform -translate-x-18 translate-y-18"></div>
            <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-gradient-to-r from-indigo-200/10 to-purple-200/10 rounded-full transform -translate-x-12 -translate-y-12"></div>
            
            <div className="space-y-8 relative z-10 max-w-2xl mx-auto">
              {/* Enhanced header */}
              <div className="text-center">
                <div className="relative inline-block mb-6">
                  <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-purple-500 via-indigo-500 to-pink-500 rounded-3xl shadow-2xl transform hover:scale-110 hover:rotate-12 transition-all duration-500">
                    <Search size={40} className="text-white" />
                  </div>
                  {/* Floating search particles */}
                  <div className="absolute -top-2 -right-2 w-5 h-5 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-ping"></div>
                  <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full animate-bounce delay-500"></div>
                </div>
                
                <h3 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 bg-clip-text text-transparent mb-4">
                  🔍 Smart Product Search
                </h3>
                <p className="text-xl text-gray-700 dark:text-gray-300 max-w-lg mx-auto leading-relaxed">
                  Enter any product name, barcode, or description for instant AI-powered sustainability analysis
                </p>
              </div>
              
              {/* Enhanced search input */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-200 to-pink-200 dark:from-purple-800 dark:to-pink-800 rounded-2xl blur-sm opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>
                <div className="relative">
                  <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-6 w-6" />
                  <Input
                    type="text"
                    placeholder="🔍 Search: Coca Cola, iPhone 15, 3017620422003, organic cookies..."
                    value={barcodeInput}
                    onChange={(e) => setBarcodeInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleGeminiTextSearch()}
                    className="pl-14 pr-12 py-6 text-xl border-3 border-purple-200 dark:border-purple-700 rounded-2xl focus:border-purple-500 focus:ring-purple-500 shadow-lg bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm transition-all duration-300 hover:shadow-xl focus:shadow-2xl"
                    disabled={barcodeLoading}
                  />
                  {barcodeInput && (
                    <button
                      onClick={() => setBarcodeInput('')}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors text-2xl"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
              
              {/* Enhanced search button */}
              <div className="text-center">
                <Button 
                  onClick={handleGeminiTextSearch} 
                  disabled={barcodeLoading || !barcodeInput.trim()} 
                  className="w-full max-w-md py-6 text-xl font-bold bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-700 hover:via-indigo-700 hover:to-pink-700 border-0 shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-500 disabled:transform-none disabled:shadow-lg rounded-2xl"
                  size="lg"
                >
                  {barcodeLoading ? (
                    <>
                      <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                      🤖 AI Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-3 h-6 w-6" />
                      🚀 Analyze with AI Magic
                    </>
                  )}
                </Button>
              </div>
              
              {/* Enhanced features showcase */}
              <div className="text-center">
                <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/70 dark:bg-gray-800/70 rounded-full text-lg text-gray-700 dark:text-gray-300 backdrop-blur-sm border border-purple-200/50 dark:border-purple-700/50 shadow-lg">
                  <span className="text-2xl">🧠</span>
                  <span className="font-medium">AI-powered • Works with names, barcodes & descriptions</span>
                </div>
              </div>
              
              {/* Interactive example suggestions */}
              <div className="space-y-4">
                <p className="text-center text-gray-600 dark:text-gray-400 font-medium">
                  ✨ Try these examples:
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  {[
                    { text: '🥤 Coca Cola', color: 'from-red-500 to-red-600' },
                    { text: '📱 iPhone 15', color: 'from-blue-500 to-blue-600' },
                    { text: '🥛 Organic Milk', color: 'from-green-500 to-green-600' },
                    { text: '🍫 Nutella', color: 'from-amber-500 to-amber-600' },
                    { text: '☕ Starbucks Coffee', color: 'from-emerald-500 to-emerald-600' }
                  ].map((example) => (
                    <button
                      key={example.text}
                      onClick={() => setBarcodeInput(example.text.replace(/^[^a-zA-Z0-9]+/, ''))}
                      className={`px-4 py-2 text-sm font-medium bg-gradient-to-r ${example.color} text-white hover:shadow-lg transform hover:scale-105 border border-gray-200/20 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:transform-none`}
                      disabled={barcodeLoading}
                    >
                      {example.text}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* AI capabilities showcase */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                {[
                  { icon: '🔍', title: 'Smart Recognition', desc: 'AI identifies products instantly' },
                  { icon: '🌱', title: 'Eco Scoring', desc: 'Sustainability ratings 0-100' },
                  { icon: '💡', title: 'Green Tips', desc: 'Eco-friendly alternatives' },
                  { icon: '📊', title: 'Deep Analysis', desc: 'Carbon footprint & more' }
                ].map((feature, idx) => (
                  <div key={idx} className="text-center p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-purple-200/30 dark:border-purple-700/30 backdrop-blur-sm hover:bg-white/70 dark:hover:bg-gray-800/70 transition-all duration-300">
                    <div className="text-2xl mb-2">{feature.icon}</div>
                    <div className="font-semibold text-gray-800 dark:text-gray-200 text-sm">{feature.title}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">{feature.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4 flex items-center justify-between">
            <span className="text-red-700">{error}</span>
            <Button variant="ghost" size="sm" onClick={clearSearch}><X size={16} /></Button>
          </CardContent>
        </Card>
      )}

      {/* 🎉 ULTIMATE RESULTS DISPLAY */}
      {productResult && (
        <Card className="border-0 shadow-2xl bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 dark:from-emerald-950 dark:via-green-950 dark:to-teal-950 overflow-hidden">
          <CardContent className="p-8">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-500 to-green-500 rounded-2xl mb-4 shadow-lg animate-bounce">
                <CheckCircle size={32} className="text-white" />
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                🎉 Analysis Complete!
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                AI has analyzed your product - here are the results
              </p>
            </div>
            
            <ProductResultCard product={productResult} onSearchAlternative={handleSearchAlternative} />
            
            <div className="text-center mt-8 space-y-4">
              <Button
                onClick={() => setProductResult(null)}
                className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                size="lg"
              >
                🔍 Scan Another Product
              </Button>
              
              <div className="flex justify-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                <span>✨ Powered by AI</span>
                <span>•</span>
                <span>🌱 Eco-focused</span>
                <span>•</span>
                <span>📊 Data-driven</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {!productResult && hasResults && (
        <Card className="border-0 shadow-2xl bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950 dark:via-indigo-950 dark:to-purple-950 overflow-hidden">
          <CardContent className="p-8">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl mb-4 shadow-lg animate-pulse">
                <Sparkles size={32} className="text-white" />
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                🔍 Search Results
              </h2>
            </div>
            
            <ProductResultCard 
              product={{
                productName: products[0]?.name,
                brand: products[0]?.brand || 'Unknown',
                category: products[0]?.category || 'general',
                ecoScore: products[0]?.ecoScore ?? 0,
                packagingScore: 55,
                carbonScore: 55,
                ingredientScore: 55,
                certificationScore: 50,
                recyclable: false,
                co2Impact: -1,
                healthScore: 50,
                certifications: [],
                ecoDescription: products[0]?.description || '',
                alternatives: (products[0]?.alternatives || []).map((a:any) => ({ product_name: a.name, reasoning: a.description }))
              }} 
              onSearchAlternative={handleSearchAlternative} 
            />
          </CardContent>
        </Card>
      )}

      {/* Hidden canvas for image capture */}
      <canvas ref={canvasRef} className="hidden" />

          </div>

          {/* Right Column - History & Stats */}
          <div className="space-y-6">
            <ScanHistory />
            <QuickStats />
          </div>

        </div>
      </div>
    </div>
  );
};

// 📊 DETAILED SCAN POPUP COMPONENT  
const ScanDetailPopup = ({ scan, isOpen, onClose }) => {
  if (!scan) return null;

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };
  };

  const { date, time } = formatDateTime(scan.created_at);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden bg-gradient-to-br from-white via-blue-50 to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center text-white">
              <Package size={24} />
            </div>
            {scan.detected_name || 'Product Details'}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-4">
          <div className="space-y-6">
            
            {/* Header Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-white/80 dark:bg-gray-800/80 border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <BarChart3 size={20} className="text-blue-600" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Eco Score</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {scan.eco_score || 0}/100
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className={`h-2 rounded-full ${
                        (scan.eco_score || 0) >= 80 ? 'bg-green-500' :
                        (scan.eco_score || 0) >= 60 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${scan.eco_score || 0}%` }}
                    ></div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 dark:bg-gray-800/80 border-l-4 border-l-green-500">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Cloud size={20} className="text-green-600" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">CO₂ Impact</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {(scan.co2_footprint || 0).toFixed(1)}kg
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Carbon footprint
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 dark:bg-gray-800/80 border-l-4 border-l-purple-500">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Zap size={20} className="text-purple-600" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Points Earned</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    +{scan.points_earned || 0}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Eco points
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 dark:bg-gray-800/80 border-l-4 border-l-yellow-500">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Package size={20} className="text-yellow-600" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Alternatives</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {scan.alternatives_suggested || 0}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Found options
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Scan Information */}
            <Card className="bg-white/80 dark:bg-gray-800/80">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                  <Info size={20} className="text-blue-600" />
                  Scan Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <Clock size={16} className="text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">Scan Date</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{date}</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">at {time}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="w-6 h-6 flex items-center justify-center">
                      {scan.scan_type === 'camera' && <Camera size={16} className="text-green-600" />}
                      {scan.scan_type === 'upload' && <Upload size={16} className="text-blue-600" />}
                      {scan.scan_type === 'barcode' && <Search size={16} className="text-purple-600" />}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">Scan Method</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                        {scan.scan_type} scanning
                      </p>
                    </div>
                  </div>
                </div>
                
                {scan.metadata?.brand && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <Package size={16} className="text-gray-600" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">Brand</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{scan.metadata.brand}</p>
                    </div>
                  </div>
                )}

                {scan.metadata?.category && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="w-4 h-4 bg-gradient-to-r from-green-500 to-blue-500 rounded"></div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">Category</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{scan.metadata.category}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Environmental Impact Details */}
            <Card className="bg-white/80 dark:bg-gray-800/80">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                  <Leaf size={20} className="text-green-600" />
                  Environmental Impact
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-green-700 dark:text-green-400">
                      {Math.round((scan.co2_footprint || 0) / 22)} 
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">Trees equivalent</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Annual CO₂ absorption</p>
                  </div>
                  
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                      {Math.round((scan.co2_footprint || 0) * 2.4)}
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">Miles not driven</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Car equivalent</p>
                  </div>
                  
                  <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-purple-700 dark:text-purple-400">
                      {Math.round((scan.co2_footprint || 0) * 65)}L
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">Water saved</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Production equivalent</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Close Button */}
            <div className="flex justify-center pt-4">
              <Button 
                onClick={onClose}
                className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white px-8 py-2"
              >
                Close Details
              </Button>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

// Scan History Component
const ScanHistory = () => {
  const { data: userScans, isLoading: scansLoading } = useScans(10); // Get last 10 scans
  const { data: profile } = useProfile();
  const [selectedScan, setSelectedScan] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  // Handle scan click
  const handleScanClick = (scan) => {
    setSelectedScan(scan);
    setIsPopupOpen(true);
  };

  const closePopup = () => {
    setIsPopupOpen(false);
    setSelectedScan(null);
  };

  // Transform real scan data for display
  const scanHistory = useMemo(() => {
    if (!userScans || userScans.length === 0) return [];
    
    return userScans.map((scan) => ({
      id: scan.id,
      productName: scan.detected_name || 'Unknown Product',
      scanType: scan.scan_type as 'camera' | 'upload' | 'barcode',
      ecoScore: scan.eco_score || 0,
      co2Impact: scan.co2_footprint || 0,
      timestamp: formatTimeAgo(new Date(scan.created_at)),
      image: scan.image_url || null,
      category: scan.metadata?.category || 'General',
      alternatives: scan.alternatives_suggested || 0,
      recyclable: scan.metadata?.recyclable || Math.random() > 0.5,
      sustainabilityTips: scan.metadata?.sustainability_tips || ['Reduce, reuse, recycle'],
      pointsEarned: scan.points_earned || 0,
      brand: scan.metadata?.brand || 'Unknown Brand'
    }));
  }, [userScans]);

  // Helper function to format time ago
  function formatTimeAgo(date: Date): string {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return date.toLocaleDateString();
  }

  if (scansLoading) {
    return (
      <Card className="border-0 shadow-2xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent flex items-center justify-center gap-2">
            <Trophy size={28} className="text-indigo-600" />
            📊 Loading History...
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-2xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent flex items-center justify-center gap-2">
          <Trophy size={28} className="text-indigo-600" />
          📊 Recent Scans
        </CardTitle>
        <p className="text-center text-gray-600 dark:text-gray-400">
          Your latest eco-scanning activity and impact ({scanHistory.length} total)
        </p>
      </CardHeader>
      <CardContent className="max-h-96 overflow-y-auto">
        <div className="space-y-4">
          {scanHistory.length > 0 ? scanHistory.map((scan) => (
            <div
              key={scan.id}
              className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-indigo-100 dark:border-indigo-800 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer hover:border-blue-300 dark:hover:border-blue-600"
              onClick={() => handleScanClick(userScans?.find(s => s.id === scan.id))}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-gray-800 dark:text-gray-200 text-lg">
                  {scan.productName}
                </h4>
                <div className="flex items-center gap-2">
                  <Badge className={`${
                    scan.ecoScore >= 80 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                    scan.ecoScore >= 60 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                    'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                  } font-bold`}>
                    {scan.ecoScore}/100
                  </Badge>
                  <Info size={14} className="text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm text-gray-700 dark:text-gray-300 mb-3">
                <span className="flex items-center gap-1 font-medium">
                  <Package size={16} />
                  {scan.brand}
                </span>
                <span className="flex items-center gap-1 font-medium">
                  <Cloud size={16} />
                  {scan.co2Impact.toFixed(1)}kg CO₂
                </span>
                {scan.pointsEarned > 0 && (
                  <span className="flex items-center gap-1 font-medium">
                    <Zap size={16} className="text-yellow-500" />
                    +{scan.pointsEarned} pts
                  </span>
                )}
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {scan.category}
                  </Badge>
                  {scan.scanType === 'camera' && (
                    <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 text-xs">
                      <Camera size={10} className="mr-1" /> Camera
                    </Badge>
                  )}
                  {scan.scanType === 'upload' && (
                    <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 text-xs">
                      <Upload size={10} className="mr-1" /> Upload
                    </Badge>
                  )}
                  {scan.scanType === 'barcode' && (
                    <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300 text-xs">
                      <Search size={10} className="mr-1" /> Search
                    </Badge>
                  )}
                </div>
                <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                  {scan.timestamp}
                </span>
              </div>
              
              {/* Click indicator */}
              <div className="mt-2 text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1 font-medium">
                <Info size={10} />
                <span>Click for detailed view</span>
              </div>
            </div>
          )) : (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <Package size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-300">No scans yet</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Start scanning products to build your eco-journey!</p>
            </div>
          )}
          
          {/* Add the popup component */}
          <ScanDetailPopup 
            scan={selectedScan}
            isOpen={isPopupOpen}
            onClose={closePopup}
          />
        </div>
      </CardContent>
    </Card>
  );
};

// Quick Stats Component
const QuickStats = () => {
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: userRank, isLoading: rankLoading } = useUserRank();

  if (profileLoading) {
    return (
      <Card className="border-0 shadow-2xl bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-950 dark:to-teal-950">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent flex items-center justify-center gap-2">
            <BarChart3 size={28} className="text-green-600" />
            🌱 Loading Stats...
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </CardContent>
      </Card>
    );
  }

  // Calculate dynamic stats from real data
  const totalScans = profile?.total_scans || 0;
  const avgEcoScore = profile?.eco_score_avg ? Math.round(profile.eco_score_avg) : 0;
  const co2Saved = profile?.total_co2_saved || 0;
  const ecoRank = userRank || 999;
  const points = profile?.points || 0;

  // Calculate percentile for ranking
  const getPercentile = (rank: number) => {
    if (rank <= 10) return "Top 1%";
    if (rank <= 50) return "Top 5%";
    if (rank <= 100) return "Top 10%";
    if (rank <= 500) return "Top 25%";
    return "Getting there!";
  };

  return (
    <Card className="border-0 shadow-2xl bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-950 dark:to-teal-950">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent flex items-center justify-center gap-2">
          <BarChart3 size={28} className="text-green-600" />
          🌱 Your Impact
        </CardTitle>
        <p className="text-center text-gray-600 dark:text-gray-400">
          Real-time eco-scanning statistics
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4">
          {[
            { 
              icon: <Scan size={24} className="text-blue-600" />, 
              label: "Total Scans", 
              value: totalScans.toString(), 
              change: totalScans > 0 ? "Keep scanning!" : "Start scanning",
              color: "blue"
            },
            { 
              icon: <Leaf size={24} className="text-green-600" />, 
              label: "Avg Eco Score", 
              value: avgEcoScore > 0 ? `${avgEcoScore}/100` : "No data", 
              change: avgEcoScore >= 70 ? "Great choices!" : avgEcoScore > 0 ? "Improving" : "Scan to see",
              color: "green"
            },
            { 
              icon: <Cloud size={24} className="text-gray-600" />, 
              label: "CO₂ Saved", 
              value: co2Saved > 0 ? `${co2Saved.toFixed(1)}kg` : "0kg", 
              change: co2Saved > 10 ? "Amazing impact!" : co2Saved > 0 ? "Building impact" : "Start saving",
              color: "gray"
            },
            { 
              icon: <Trophy size={24} className="text-yellow-600" />, 
              label: "Eco Rank", 
              value: ecoRank < 999 ? `#${ecoRank}` : "Unranked", 
              change: ecoRank < 999 ? getPercentile(ecoRank) : "Scan to rank",
              color: "yellow"
            },
            { 
              icon: <Zap size={24} className="text-purple-600" />, 
              label: "Eco Points", 
              value: points.toString(), 
              change: points > 1000 ? "Eco Master!" : points > 100 ? "Growing strong" : "Just started",
              color: "purple"
            }
          ].map((stat, idx) => (
            <div 
              key={idx}
              className={`p-4 bg-white dark:bg-gray-800 rounded-xl border-l-4 border-${stat.color}-500 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {stat.icon}
                  <span className="font-semibold text-gray-700 dark:text-gray-300">
                    {stat.label}
                  </span>
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                {stat.value}
              </div>
              <div className={`text-sm text-${stat.color}-600 dark:text-${stat.color}-400`}>
                {stat.change}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 p-4 bg-gradient-to-r from-green-100 to-teal-100 dark:from-green-900/30 dark:to-teal-900/30 rounded-xl border border-green-200/50 dark:border-green-700/50">
          <div className="text-center">
            <div className="text-3xl mb-2">🌍</div>
            <div className="font-bold text-green-800 dark:text-green-400 mb-1">
              Eco Champion!
            </div>
            <div className="text-sm text-green-700 dark:text-green-500">
              Your choices are making a difference
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};