import React, { useRef, useState } from 'react';
import { useCamera } from '@/hooks/useCamera';
import { useVisionAPI } from '@/hooks/useVisionAPI';
import { useEcoScore } from '@/hooks/useEcoScore';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Camera, Square, RotateCcw, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { LoadingSpinner } from './LoadingSpinner';
import { ScoreRing } from './ScoreRing';

interface CameraScannerProps {
  onScanResult?: (result: any) => void;
  className?: string;
}

export function CameraScanner({ onScanResult, className = '' }: CameraScannerProps) {
  const { 
    isActive, 
    isLoading, 
    error, 
    videoRef, 
    startCamera, 
    stopCamera, 
    takePhoto 
  } = useCamera();
  
  const { analyzeImage, isAnalyzing } = useVisionAPI();
  const { calculateEcoScore, isCalculating } = useEcoScore();
  
  const [lastScanResult, setLastScanResult] = useState<any>(null);
  const [showResult, setShowResult] = useState(false);

  const handleScan = async () => {
    if (!isActive) return;

    const photoData = takePhoto();
    if (!photoData) return;

    // Remove data URL prefix for API
    const base64Image = photoData.replace(/^data:image\/[a-z]+;base64,/, '');
    
    // Analyze image with Gemini Vision
    const visionResult = await analyzeImage(base64Image);
    if (!visionResult) return;

    // Calculate eco score
    const ecoScore = await calculateEcoScore({
      product_name: visionResult.product_name,
      brand: visionResult.brand,
      category: visionResult.category,
      materials: visionResult.materials,
      packaging: visionResult.packaging,
      ingredients: visionResult.ingredients
    });

    if (ecoScore) {
      const scanResult = {
        vision: visionResult,
        ecoScore: ecoScore,
        timestamp: new Date().toISOString(),
        imageData: photoData
      };

      setLastScanResult(scanResult);
      setShowResult(true);
      onScanResult?.(scanResult);
    }
  };

  const handleRetry = () => {
    setShowResult(false);
    setLastScanResult(null);
  };

  const isProcessing = isAnalyzing || isCalculating;

  return (
    <div className={`relative ${className}`}>
      <Card className="relative overflow-hidden glass-card">
        {/* Camera View */}
        <div className="relative aspect-square bg-muted">
          {/* Always render video element */}
          <video
            ref={videoRef}
            className={`w-full h-full object-cover ${isActive ? '' : 'hidden'}`}
            playsInline
            muted
          />
          
          {isActive && (
            <>
              {/* Scan Overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="relative">
                  {/* Corner brackets */}
                  <div className="w-48 h-48 border-2 border-primary/50 relative">
                    <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-primary"></div>
                    <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-primary"></div>
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-primary"></div>
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-primary"></div>
                  </div>
                  
                  {/* Scanning animation */}
                  {isProcessing && (
                    <motion.div
                      className="absolute inset-0 border-t-2 border-primary"
                      initial={{ y: 0, opacity: 0.8 }}
                      animate={{ y: 192, opacity: 0.2 }}
                      transition={{ 
                        duration: 2, 
                        repeat: Infinity, 
                        ease: "easeInOut" 
                      }}
                    />
                  )}
                </div>
              </div>
            </>
          )}

          {/* Camera not active */}
          {!isActive && !isLoading && (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <Camera className="w-16 h-16 mb-4" />
              <p className="text-lg font-medium">Camera Scanner</p>
              <p className="text-sm">Tap to start scanning products</p>
            </div>
          )}

          {/* Loading state */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center h-full">
              <LoadingSpinner size="lg" />
              <p className="mt-4 text-sm text-muted-foreground">Starting camera...</p>
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="flex flex-col items-center justify-center h-full text-destructive">
              <Square className="w-16 h-16 mb-4" />
              <p className="text-lg font-medium">Camera Error</p>
              <p className="text-sm text-center px-4">{error}</p>
            </div>
          )}

          {/* Processing overlay */}
          {isProcessing && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center">
              <LoadingSpinner size="lg" />
              <p className="mt-4 text-lg font-medium">
                {isAnalyzing ? 'Analyzing product...' : 'Calculating eco score...'}
              </p>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="p-4 space-y-3">
          <div className="flex justify-center space-x-3">
            {!isActive ? (
              <Button
                onClick={startCamera}
                disabled={isLoading}
                size="lg"
                className="w-full"
              >
                <Camera className="w-5 h-5 mr-2" />
                Start Camera
              </Button>
            ) : (
              <>
                <Button
                  onClick={handleScan}
                  disabled={isProcessing}
                  size="lg"
                  className="flex-1"
                >
                  <Zap className="w-5 h-5 mr-2" />
                  Scan Product
                </Button>
                <Button
                  onClick={stopCamera}
                  variant="outline"
                  size="lg"
                >
                  Stop
                </Button>
              </>
            )}
          </div>

          {/* Status badges */}
          <div className="flex justify-center space-x-2">
            {isActive && (
              <Badge variant="secondary" className="animate-pulse">
                Camera Active
              </Badge>
            )}
            {isProcessing && (
              <Badge variant="outline" className="animate-pulse">
                Processing...
              </Badge>
            )}
          </div>
        </div>
      </Card>

      {/* Scan Result Modal */}
      <AnimatePresence>
        {showResult && lastScanResult && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute inset-0 bg-background/95 backdrop-blur-sm flex items-center justify-center p-4 z-10"
          >
            <Card className="w-full max-w-md p-6 glass-card">
              <div className="text-center space-y-4">
                <h3 className="text-xl font-bold">Product Detected!</h3>
                
                <div className="space-y-2">
                  <h4 className="font-semibold">{lastScanResult.vision.product_name}</h4>
                  {lastScanResult.vision.brand && (
                    <p className="text-sm text-muted-foreground">
                      by {lastScanResult.vision.brand}
                    </p>
                  )}
                </div>

                <div className="flex justify-center">
                  <ScoreRing 
                    score={lastScanResult.ecoScore.overall_score} 
                    size="lg" 
                  />
                </div>

                <div className="flex space-x-2 justify-center">
                  <Button onClick={handleRetry} variant="outline">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Scan Again
                  </Button>
                  <Button onClick={() => setShowResult(false)}>
                    View Details
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}