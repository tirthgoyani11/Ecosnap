import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useCamera } from "@/hooks/useCamera";
import { useHapticFeedback } from "@/hooks/useHapticFeedback";
import { 
  Camera, 
  CameraOff, 
  AlertCircle, 
  Eye,
  Scan,
  Zap
} from "lucide-react";

interface ARCameraProps {
  onProductDetected?: (product: any) => void;
  className?: string;
}

export function ARCamera({ onProductDetected, className = "" }: ARCameraProps) {
  const { 
    isActive, 
    isLoading, 
    error, 
    hasPermission, 
    videoRef, 
    startCamera, 
    stopCamera 
  } = useCamera();
  
  const { triggerHaptic } = useHapticFeedback();
  const [isScanning, setIsScanning] = useState(false);
  const [detectedProducts, setDetectedProducts] = useState<any[]>([]);

  // Enhanced product detection with more realistic data
  useEffect(() => {
    if (!isActive) return;

    const detectProducts = () => {
      // Simulate random product detection with better data
      if (Math.random() > 0.6) {
        const products = [
          {
            id: "prod_1",
            name: "Organic Cotton T-Shirt",
            brand: "EcoWear",
            ecoScore: 85,
            carbonFootprint: 2.4, // kg CO2e
            waterUsage: 120, // liters
            recyclability: 95,
            certifications: ["GOTS", "Fair Trade"],
          },
          {
            id: "prod_2", 
            name: "Bamboo Water Bottle",
            brand: "GreenTech",
            ecoScore: 92,
            carbonFootprint: 1.2,
            waterUsage: 45,
            recyclability: 100,
            certifications: ["FSC", "BPA-Free"],
          },
          {
            id: "prod_3",
            name: "Recycled Plastic Sneakers",
            brand: "EcoStep",
            ecoScore: 78,
            carbonFootprint: 3.8,
            waterUsage: 200,
            recyclability: 85,
            certifications: ["Ocean Positive", "Carbon Neutral"],
          }
        ];

        const selectedProduct = products[Math.floor(Math.random() * products.length)];
        const mockProduct = {
          ...selectedProduct,
          position: {
            x: Math.random() * 60 + 20, // 20-80%
            y: Math.random() * 60 + 20, // 20-80%
          },
          confidence: Math.random() * 0.3 + 0.7, // 70-100%
        };
        
        setDetectedProducts([mockProduct]);
        onProductDetected?.(mockProduct);
        triggerHaptic('light');
      } else {
        setDetectedProducts([]);
      }
    };

    const interval = setInterval(detectProducts, 3000);
    return () => clearInterval(interval);
  }, [isActive, onProductDetected, triggerHaptic]);

  const handleStartCamera = async () => {
    triggerHaptic('medium');
    try {
      await startCamera();
      console.log('AR Camera started successfully');
    } catch (error) {
      console.error('AR Camera start failed:', error);
    }
  };

  // Manual camera start only - no auto-start to avoid issues

  const handleStopCamera = () => {
    triggerHaptic('light');
    stopCamera();
    setDetectedProducts([]);
  };

  const handleScan = () => {
    if (!isActive) return;
    
    setIsScanning(true);
    triggerHaptic('medium');
    
    // Simulate scanning process
    setTimeout(() => {
      setIsScanning(false);
      triggerHaptic('success');
    }, 2000);
  };

  return (
    <div className={`relative bg-black rounded-xl overflow-hidden ${className}`}>
      {/* Enhanced Camera Feed */}
      <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
        {/* Always render video element, but hide when not active */}
        <video
          ref={videoRef}
          className={`w-full h-full object-cover ${isActive ? '' : 'hidden'}`}
          playsInline
          muted
          autoPlay
          style={{ transform: 'scaleX(-1)' }} // Mirror the video for better UX
        />
        
        {/* Show content when camera is active */}
        {isActive && (
          <>
            {/* Show mock overlay only if no video stream */}
            {(!videoRef.current?.srcObject || error) && (
              <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900">
                {/* Mock camera grid */}
                <div className="absolute inset-0 opacity-20">
                  <div className="grid grid-cols-8 grid-rows-6 h-full w-full">
                    {[...Array(48)].map((_, i) => (
                      <div key={i} className="border border-white/10" />
                    ))}
                  </div>
                </div>
                {/* Mock preview indicators */}
                <div className="absolute top-4 left-4 bg-black/70 px-3 py-1 rounded-lg text-xs text-white border border-white/20">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    📹 Camera Simulation
                  </div>
                </div>
                <div className="absolute bottom-4 right-4 bg-black/70 px-3 py-1 rounded-lg text-xs text-white border border-white/20">
                  Ready to scan products
                </div>
                {/* Camera permission hint */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center bg-black/50 backdrop-blur-sm p-6 rounded-xl border border-white/20">
                    <Camera className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-300 text-sm mb-2">Click "Start AR" to enable camera</p>
                    <p className="text-gray-500 text-xs">Allow camera access when prompted</p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        
        {/* Enhanced Camera Placeholder */}
        {!isActive && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-800 via-gray-900 to-black">
            <div className="text-center">
              <motion.div
                animate={{ 
                  scale: [1, 1.05, 1],
                  opacity: [0.7, 1, 0.7]
                }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity,
                  ease: "easeInOut" 
                }}
              >
                <Camera className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              </motion.div>
              <h3 className="text-lg font-semibold text-white mb-2">Start Your AR Camera</h3>
              <p className="text-gray-400 text-sm mb-1">Real camera feed will appear here</p>
              <p className="text-gray-500 text-xs mb-4">Ready for Gemini AI product scanning</p>
              
              {!isLoading && (
                <Button
                  onClick={handleStartCamera}
                  variant="default"
                  size="lg"
                  className="mt-4"
                >
                  <Camera className="h-5 w-5 mr-2" />
                  Start Camera Now
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="text-center text-white">
              <LoadingSpinner size="lg" />
              <p className="mt-4 text-sm">Starting camera...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-red-900/20 flex items-center justify-center"
          >
            <div className="text-center text-white bg-red-500/20 backdrop-blur-md p-6 rounded-xl max-w-sm mx-4">
              <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Camera Access Issue</h3>
              <p className="text-sm text-red-200 mb-4">{error}</p>
              <div className="space-y-2">
                <Button 
                  onClick={handleStartCamera}
                  variant="outline"
                  size="sm"
                  className="text-white border-white/30 hover:bg-white/10"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
                <div className="text-xs text-red-300">
                  <p>• Grant camera permissions</p>
                  <p>• Ensure camera isn't in use</p>
                  <p>• Try refreshing the page</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* AR Overlays */}
        <AnimatePresence>
          {isActive && detectedProducts.map((product) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              style={{
                position: 'absolute',
                left: `${product.position.x}%`,
                top: `${product.position.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
              className="pointer-events-none"
            >
              {/* Product Detection Box */}
              <motion.div
                animate={{ 
                  scale: [1, 1.05, 1],
                  rotate: [0, 1, 0, -1, 0]
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity,
                  ease: "easeInOut" 
                }}
                className="relative"
              >
                {/* Detection Frame */}
                <div className="w-24 h-24 border-2 border-primary/80 rounded-lg relative">
                  <div className="absolute -top-1 -left-1 w-4 h-4 border-l-2 border-t-2 border-primary" />
                  <div className="absolute -top-1 -right-1 w-4 h-4 border-r-2 border-t-2 border-primary" />
                  <div className="absolute -bottom-1 -left-1 w-4 h-4 border-l-2 border-b-2 border-primary" />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 border-r-2 border-b-2 border-primary" />
                </div>

                {/* Floating Info with Enhanced Data */}
                <motion.div
                  animate={{ y: [-5, -10, -5] }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity,
                    ease: "easeInOut" 
                  }}
                  className="absolute -top-16 left-1/2 transform -translate-x-1/2"
                >
                  <div className="glass-card px-3 py-2 rounded-lg text-xs text-white font-medium whitespace-nowrap min-w-max">
                    <div className="flex items-center gap-3">
                      {/* Eco Score */}
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-400 to-green-600 flex items-center justify-center text-xs font-bold">
                          {product.ecoScore}
                        </div>
                        <div>
                          <div className="font-semibold">{product.name}</div>
                          <div className="text-green-400 text-[10px]">{product.brand}</div>
                        </div>
                      </div>
                      
                      {/* Carbon Footprint */}
                      <div className="border-l border-white/20 pl-3">
                        <div className="text-[10px] text-gray-300">Carbon</div>
                        <div className="font-bold text-orange-400">{product.carbonFootprint}kg CO₂</div>
                      </div>
                      
                      {/* Recyclability */}
                      <div className="border-l border-white/20 pl-3">
                        <div className="text-[10px] text-gray-300">Recycle</div>
                        <div className="font-bold text-blue-400">{product.recyclability}%</div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Confidence Indicator */}
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
                  <div className="bg-black/50 backdrop-blur-sm px-2 py-1 rounded text-xs text-white">
                    {Math.round(product.confidence * 100)}% match
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Enhanced Scanning Animation */}
        {isScanning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 pointer-events-none"
          >
            {/* Scanning Frame */}
            <motion.div
              animate={{
                scale: [1, 1.05, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute inset-4 border-2 border-primary/60 rounded-xl"
            />
            
            {/* Scanning Lines with AI effect */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute left-8 right-8 h-0.5"
                style={{ 
                  top: `${15 + i * 10}%`,
                  background: `linear-gradient(90deg, transparent, rgba(16,185,129,${0.8 - i * 0.1}), transparent)`
                }}
                animate={{
                  scaleX: [0, 1, 0],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 2,
                  delay: i * 0.15,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            ))}
            
            {/* AI Processing Indicator */}
            <motion.div
              className="absolute top-6 left-6 bg-black/70 backdrop-blur-sm px-3 py-2 rounded-lg"
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <div className="flex items-center gap-2 text-white text-sm">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span>AI Analyzing...</span>
              </div>
            </motion.div>
            
            {/* Scanning Grid */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.1)_1px,transparent_1px)] [background-size:30px_30px]">
              <motion.div
                className="w-full h-full"
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
          </motion.div>
        )}

        {/* Status Indicators */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
          <div className="space-y-2">
            {isActive && (
              <Badge variant="secondary" className="bg-black/50 text-white">
                <Eye className="h-3 w-3 mr-1" />
                AR Active
              </Badge>
            )}
            {detectedProducts.length > 0 && (
              <Badge variant="secondary" className="bg-green-500/80 text-white animate-pulse">
                <Scan className="h-3 w-3 mr-1" />
                Product Detected! Check below ↓
              </Badge>
            )}
          </div>
          
          {isScanning && (
            <Badge variant="secondary" className="bg-primary/20 text-primary">
              <Zap className="h-3 w-3 mr-1" />
              Analyzing...
            </Badge>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="absolute bottom-4 left-4 right-4">
        <div className="flex justify-center gap-4">
          {!isActive ? (
            <Button
              onClick={handleStartCamera}
              disabled={isLoading}
              variant="premium"
              size="lg"
              className="rounded-full shadow-xl"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span className="ml-2">Starting Camera...</span>
                </>
              ) : (
                <>
                  <Camera className="h-5 w-5" />
                  <span className="ml-2">Start AR</span>
                </>
              )}
            </Button>
          ) : (
            <>
              <Button
                onClick={handleScan}
                disabled={isScanning}
                variant="premium"
                size="lg"
                className="rounded-full"
              >
                {isScanning ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <Scan className="h-5 w-5" />
                )}
                {isScanning ? 'Scanning...' : 'Scan'}
              </Button>
              
              <Button
                onClick={handleStopCamera}
                variant="glass"
                size="lg"
                className="rounded-full"
              >
                <CameraOff className="h-5 w-5" />
                Stop
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}