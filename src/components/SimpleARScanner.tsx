import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Scan, X, Loader2, Eye, Zap, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAdvancedProductSearch } from '@/hooks/useAdvancedProductSearch';
import { useToast } from '@/hooks/use-toast';
import { StatsService } from '../lib/stats-service-clean';

interface AROverlayProps {
  product: any;
  position: { x: number; y: number };
  onClose: () => void;
}

const AROverlay = ({ product, position, onClose }: AROverlayProps) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.8 }}
    className="absolute bg-white/95 backdrop-blur-md rounded-lg p-4 shadow-lg border border-white/20 min-w-[280px]"
    style={{
      left: `${position.x}%`,
      top: `${position.y}%`,
      transform: 'translate(-50%, -50%)',
    }}
  >
    <div className="flex items-start justify-between mb-2">
      <div className="flex-1">
        <h3 className="font-bold text-lg text-gray-900">{product.productName}</h3>
        <p className="text-sm text-gray-600">{product.brand}</p>
      </div>
      <Button variant="ghost" size="sm" onClick={onClose} className="p-1">
        <X size={16} />
      </Button>
    </div>
    
    <div className="flex items-center gap-3 mb-3">
      <div className="flex flex-col items-center">
        <div className="text-2xl font-bold text-green-600">{product.ecoScore}</div>
        <div className="text-xs text-gray-500">Eco Score</div>
      </div>
      <div className="flex flex-col items-center">
        <div className="text-sm font-medium">{product.co2Impact}kg</div>
        <div className="text-xs text-gray-500">CO2 Impact</div>
      </div>
      <div className="flex flex-col items-center">
        <div className="text-sm font-medium">{product.healthScore}/100</div>
        <div className="text-xs text-gray-500">Health</div>
      </div>
    </div>

    <div className="flex flex-wrap gap-1 mb-2">
      <Badge variant={product.recyclable ? 'default' : 'secondary'} className="text-xs">
        {product.recyclable ? 'Recyclable' : 'Non-recyclable'}
      </Badge>
      {product.certifications?.slice(0, 2).map((cert: string) => (
        <Badge key={cert} variant="outline" className="text-xs">{cert}</Badge>
      ))}
    </div>

    {product.alternatives && product.alternatives.length > 0 && (
      <div className="mt-3 pt-2 border-t border-gray-200">
        <p className="text-xs text-green-600 font-medium mb-1">
          💡 Better alternative: {product.alternatives[0].product_name}
        </p>
      </div>
    )}
  </motion.div>
);

export const SimpleARScanner: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [detectedProducts, setDetectedProducts] = useState<any[]>([]);
  const [isDetecting, setIsDetecting] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { searchByImageFile, loading } = useAdvancedProductSearch();
  const { toast } = useToast();

  // Start camera
  const startCamera = useCallback(async () => {
    try {
      setIsActive(false); // Reset state first
      setDetectedProducts([]); // Clear any previous detections
      
      console.log('Starting AR camera...');
      
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API not supported in this browser');
      }

      // Simpler, more reliable constraints
      const constraints = {
        video: { 
          facingMode,
          width: { ideal: 640, min: 480 },
          height: { ideal: 480, min: 360 }
        }
      };

      console.log('Requesting camera access with constraints:', constraints);
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('Camera access granted');
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        
        // Better video initialization with proper event handling
        videoRef.current.onloadeddata = () => {
          console.log('Video data loaded, dimensions:', videoRef.current?.videoWidth, 'x', videoRef.current?.videoHeight);
        };
        
        videoRef.current.oncanplay = () => {
          console.log('Video can play');
        };
        
        videoRef.current.onplay = () => {
          console.log('Video started playing');
          setIsActive(true);
          toast({
            title: "AR Scanner Active! 🔍",
            description: "Point at products to see live eco information",
          });
        };

        videoRef.current.onerror = (e) => {
          console.error('Video error:', e);
          toast({
            title: "Video Error",
            description: "There was an error with the video stream",
            variant: "destructive",
          });
        };

        // Start video playback
        try {
          await videoRef.current.play();
          console.log('Video play initiated successfully');
        } catch (playError) {
          console.error('Initial video play failed:', playError);
          // Retry after a delay
          setTimeout(async () => {
            try {
              await videoRef.current?.play();
              console.log('Video play retry successful');
            } catch (retryError) {
              console.error('Video play retry failed:', retryError);
            }
          }, 1000);
        }
      }

      setStream(mediaStream);

    } catch (err: any) {
      console.error('Camera access failed:', err);
      let errorMessage = "Please allow camera access to use AR scanning";
      
      if (err.name === 'NotAllowedError') {
        errorMessage = "Camera permission denied. Please allow camera permissions and refresh the page.";
      } else if (err.name === 'NotFoundError') {
        errorMessage = "No camera found. Please connect a camera and try again.";
      } else if (err.name === 'NotReadableError') {
        errorMessage = "Camera is already in use by another application. Please close other apps and try again.";
      } else if (err.name === 'OverconstrainedError') {
        errorMessage = "Camera doesn't support the requested settings. Try switching cameras.";
      } else {
        errorMessage = err.message || "Unknown camera error occurred.";
      }
      
      toast({
        title: "Camera Access Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, [facingMode, toast]);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsActive(false);
    setDetectedProducts([]);
  }, [stream]);

  // Toggle camera facing mode
  const toggleCamera = useCallback(async () => {
    const newFacingMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(newFacingMode);
    
    // Restart camera with new facing mode
    if (isActive) {
      stopCamera();
      // Give a small delay for cleanup
      setTimeout(() => {
        startCamera();
      }, 500);
    }
  }, [facingMode, isActive, stopCamera, startCamera]);

  // Auto-scan functionality with Gemini API integration
  useEffect(() => {
    if (!isActive || loading || isDetecting) return;

    const detectProducts = async () => {
      // Auto-capture and analyze every 3 seconds with higher frequency
      if (Math.random() > 0.3) { // 70% chance to trigger analysis
        setIsDetecting(true);
        
        // Capture current frame for Gemini analysis
        if (videoRef.current && canvasRef.current) {
          const video = videoRef.current;
          const canvas = canvasRef.current;
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(video, 0, 0);
            
            canvas.toBlob(async (blob) => {
              if (blob) {
                try {
                  const file = new File([blob], "ar-scan.jpg", { type: "image/jpeg" });
                  const results = await searchByImageFile(file);
                  
                  if (results.length > 0) {
                    const product = results[0];
                    
                    // Update user stats with real data
                    const alternativesCount = product.alternatives?.length || 0;
                    const updatedStats = StatsService.updateAfterScan(product, alternativesCount);
                    
                    // Create AR overlay with enhanced positioning
                    const arProduct = {
                      ...product,
                      position: {
                        x: Math.random() * 50 + 25, // 25-75% for better visibility
                        y: Math.random() * 50 + 25, // 25-75% for better visibility
                      },
                      id: Date.now(),
                      confidence: 0.85 + Math.random() * 0.15, // 85-100% confidence
                    };
                    
                    setDetectedProducts([arProduct]);
                    
                    toast({
                      title: "🎯 Product Detected!",
                      description: `${product.name} - Eco Score: ${product.ecoScore}/100`,
                    });

                    // Show achievement notification if any
                    if (updatedStats.achievements.length > 0) {
                      const latestAchievement = updatedStats.achievements[updatedStats.achievements.length - 1];
                      toast({
                        title: "🏆 AR Achievement!",
                        description: `${latestAchievement}! ${updatedStats.ecoPoints} eco points`,
                        duration: 4000,
                      });
                    }
                    
                    // Auto-hide detection after 8 seconds to allow new detections
                    setTimeout(() => {
                      setDetectedProducts(prev => prev.filter(p => p.id !== arProduct.id));
                    }, 8000);
                  }
                } catch (error) {
                  console.error('AR Gemini detection failed:', error);
                  // Fallback to enhanced mock data for demonstration if API fails
                  if (Math.random() > 0.6) {
                    const mockCategories = ['Electronics', 'Food & Beverage', 'Personal Care', 'Household', 'Fashion'];
                    const mockProduct = {
                      id: Date.now(),
                      name: `Eco-Friendly ${mockCategories[Math.floor(Math.random() * mockCategories.length)]}`,
                      brand: "Green Brand",
                      ecoScore: Math.floor(Math.random() * 40) + 60, // 60-100 for good products
                      position: {
                        x: Math.random() * 50 + 25,
                        y: Math.random() * 50 + 25,
                      },
                      confidence: 0.75 + Math.random() * 0.2,
                      category: mockCategories[Math.floor(Math.random() * mockCategories.length)],
                      alternatives: [],
                      sustainabilityTips: ["Choose reusable alternatives", "Look for recycled content"],
                    };
                    setDetectedProducts([mockProduct]);
                    
                    toast({
                      title: "🎯 Demo Product Detected!",
                      description: `${mockProduct.name} - Score: ${mockProduct.ecoScore}/100`,
                    });
                  }
                }
              }
              setIsDetecting(false);
            }, 'image/jpeg', 0.8);
          }
        }
      }
    };

    const interval = setInterval(detectProducts, 3000); // Every 3 seconds for more responsive AR
    return () => clearInterval(interval);
  }, [isActive, searchByImageFile, loading, isDetecting, toast]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Eye className="text-blue-500" size={20} />
          AR Product Scanner
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Control Buttons */}
          <div className="flex gap-2 justify-center">
            {!isActive ? (
              <Button onClick={startCamera} className="flex items-center gap-2">
                <Camera size={18} />
                Start AR Scanner
              </Button>
            ) : (
              <>
                <Button onClick={stopCamera} variant="outline">
                  Stop Scanner
                </Button>
                <Button onClick={toggleCamera} variant="outline" size="icon">
                  <RotateCcw size={18} />
                </Button>
                <Button
                  onClick={() => {
                    // Manual capture for testing
                    if (videoRef.current && canvasRef.current) {
                      const video = videoRef.current;
                      const canvas = canvasRef.current;
                      canvas.width = video.videoWidth;
                      canvas.height = video.videoHeight;
                      
                      const ctx = canvas.getContext('2d');
                      if (ctx) {
                        ctx.drawImage(video, 0, 0);
                        toast({
                          title: "Frame Captured! 📸",
                          description: "Analyzing product...",
                        });
                        
                        canvas.toBlob(async (blob) => {
                          if (blob) {
                            try {
                              const file = new File([blob], "manual-ar-scan.jpg", { type: "image/jpeg" });
                              const results = await searchByImageFile(file);
                              
                              if (results.length > 0) {
                                const product = results[0];
                                const arProduct = {
                                  ...product,
                                  position: { x: 50, y: 50 },
                                  id: Date.now(),
                                };
                                setDetectedProducts([arProduct]);
                                
                                // Update stats
                                const alternativesCount = product.alternatives?.length || 0;
                                StatsService.updateAfterScan(product, alternativesCount);
                              }
                            } catch (error) {
                              console.error('Manual AR scan failed:', error);
                              toast({
                                title: "Scan Failed",
                                description: "Unable to analyze the image",
                                variant: "destructive",
                              });
                            }
                          }
                        }, 'image/jpeg', 0.8);
                      }
                    }
                  }}
                  variant="default"
                  disabled={loading}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                >
                  <Scan size={16} />
                  Scan Now
                </Button>
              </>
            )}
          </div>

          {/* Camera View */}
          {isActive && (
            <div className="relative">
              <div className="relative overflow-hidden rounded-lg bg-black aspect-video">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  autoPlay
                  playsInline
                  muted
                  controls={false}
                  style={{ 
                    backgroundColor: '#000',
                    minHeight: '300px'
                  }}
                />
                <canvas ref={canvasRef} className="hidden" />

                {/* Loading overlay when video is starting */}
                {!videoRef.current?.videoWidth && (
                  <div className="absolute inset-0 bg-black flex items-center justify-center">
                    <div className="text-white text-center">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                      <p>Initializing camera...</p>
                    </div>
                  </div>
                )}

                {/* AR Overlay for detected products */}
                <AnimatePresence>
                  {detectedProducts.map((product) => (
                    <AROverlay
                      key={product.id}
                      product={product}
                      position={product.position}
                      onClose={() => setDetectedProducts([])}
                    />
                  ))}
                </AnimatePresence>

                {/* Scanning indicator */}
                {(loading || isDetecting) && (
                  <div className="absolute top-4 right-4">
                    <div className="flex items-center gap-2 bg-blue-500/90 text-white px-3 py-1 rounded-full text-sm">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {isDetecting ? 'Detecting...' : 'Analyzing...'}
                    </div>
                  </div>
                )}

                {/* AR Grid overlay */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="w-full h-full border border-white/20 rounded-lg">
                    {/* Corner markers */}
                    <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-green-400"></div>
                    <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-green-400"></div>
                    <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-green-400"></div>
                    <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-green-400"></div>
                    
                    {/* Status */}
                    <div className="absolute top-4 left-4">
                      <Badge variant="secondary" className="bg-black/50 text-white border-white/20">
                        AR Mode: {detectedProducts.length > 0 ? 'Product Detected' : 'Scanning...'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
              
              <p className="text-center text-sm text-gray-600 mt-2">
                Point your camera at products to see live eco information
              </p>
            </div>
          )}

          {/* Camera not active - show activation button */}
          {!isActive && (
            <div className="text-center py-12">
              <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-lg p-8 mb-6">
                <Eye className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  AR Scanner Ready
                </h3>
                <p className="text-gray-600 mb-4">
                  Experience real-time product analysis with augmented reality
                </p>
                <Button
                  onClick={startCamera}
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
                >
                  <Camera className="w-5 h-5 mr-2" />
                  Activate AR Scanner
                </Button>
              </div>
              
              <div className="text-sm text-gray-500">
                <p>• Point camera at products for instant eco analysis</p>
                <p>• See sustainability scores in real-time</p>
                <p>• Discover better alternatives instantly</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
