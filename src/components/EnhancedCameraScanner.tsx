import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, 
  RotateCcw, 
  Scan, 
  Loader2, 
  X,
  Zap as Flash,
  ZoomIn,
  ZoomOut,
  Focus,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import {
  EnhancedCard,
  EnhancedButton,
  EnhancedBadge,
  HeadingText,
  BodyText,
  CaptionText,
  Notification
} from './ui/EnhancedComponents';
import { cn, themeClasses } from '../lib/utils';

interface EnhancedCameraScannerProps {
  onScanComplete?: (imageData: string) => void;
  onError?: (error: string) => void;
  isLoading?: boolean;
  className?: string;
}

export const EnhancedCameraScanner = ({
  onScanComplete,
  onError,
  isLoading = false,
  className
}: EnhancedCameraScannerProps) => {
  const [isScanning, setIsScanning] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [flash, setFlash] = useState(false);
  const [zoom, setZoom] = useState(1);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Initialize camera
  const initializeCamera = useCallback(async () => {
    try {
      setError(null);
      
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera not supported on this device');
      }

      const constraints = {
        video: {
          facingMode,
          width: { ideal: 1920, max: 1920 },
          height: { ideal: 1080, max: 1080 },
          aspectRatio: { ideal: 16/9 }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setMediaStream(stream);
      setHasPermission(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsScanning(true);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to access camera';
      setError(errorMessage);
      setHasPermission(false);
      onError?.(errorMessage);
    }
  }, [facingMode, onError]);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
      setMediaStream(null);
    }
    setIsScanning(false);
  }, [mediaStream]);

  // Toggle camera (front/back)
  const toggleCamera = useCallback(() => {
    stopCamera();
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  }, [stopCamera]);

  // Capture photo
  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    onScanComplete?.(imageData);
  }, [onScanComplete]);

  // Flash effect
  const triggerFlash = useCallback(() => {
    setFlash(true);
    setTimeout(() => setFlash(false), 200);
  }, []);

  // Handle scan button
  const handleScan = useCallback(() => {
    triggerFlash();
    capturePhoto();
  }, [triggerFlash, capturePhoto]);

  // Zoom controls
  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.2, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.2, 1));

  // Initialize camera on mount
  useEffect(() => {
    initializeCamera();
    return () => stopCamera();
  }, [facingMode]);

  // Permission states
  if (hasPermission === false) {
    return (
      <EnhancedCard className={cn('max-w-md mx-auto', className)}>
        <div className="p-8 text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <HeadingText>Camera Access Required</HeadingText>
          <BodyText contrast="medium" className="text-center">
            Please allow camera access to scan products. Check your browser settings and try again.
          </BodyText>
          <EnhancedButton onClick={initializeCamera} variant="primary" fullWidth>
            <Camera className="mr-2 h-4 w-4" />
            Try Again
          </EnhancedButton>
        </div>
      </EnhancedCard>
    );
  }

  if (hasPermission === null) {
    return (
      <EnhancedCard className={cn('max-w-md mx-auto', className)}>
        <div className="p-8 text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin" />
          </div>
          <HeadingText>Initializing Camera</HeadingText>
          <BodyText contrast="medium" className="text-center">
            Setting up your camera for scanning...
          </BodyText>
        </div>
      </EnhancedCard>
    );
  }

  return (
    <div className={cn('w-full max-w-4xl mx-auto', className)}>
      {error && (
        <Notification variant="error" className="mb-4" onClose={() => setError(null)}>
          {error}
        </Notification>
      )}

      <EnhancedCard variant="elevated" className="overflow-hidden">
        {/* Camera Header */}
        <div className="p-4 bg-gradient-to-r from-emerald-500/10 to-green-500/10 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
              <HeadingText className="text-lg">
                Smart Scanner
              </HeadingText>
            </div>
            
            <div className="flex items-center space-x-2">
              <EnhancedBadge 
                variant={facingMode === 'environment' ? 'success' : 'secondary'}
                size="sm"
              >
                <Camera className="w-3 h-3 mr-1" />
                {facingMode === 'environment' ? 'Back' : 'Front'}
              </EnhancedBadge>
              
              {isScanning && (
                <EnhancedBadge variant="success" size="sm">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse mr-1"></div>
                  Ready to Scan
                </EnhancedBadge>
              )}
            </div>
          </div>
        </div>

        {/* Camera View */}
        <div className="relative aspect-video bg-slate-900 overflow-hidden">
          {/* Video Element */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={cn(
              'w-full h-full object-cover',
              `scale-${Math.round(zoom * 100)}`
            )}
            style={{
              transform: facingMode === 'user' ? 'scaleX(-1)' : 'none'
            }}
          />

          {/* Flash Overlay */}
          <AnimatePresence>
            {flash && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 bg-white pointer-events-none"
              />
            )}
          </AnimatePresence>

          {/* Scanning Overlay */}
          {isScanning && !isLoading && (
            <div className="absolute inset-0 pointer-events-none">
              {/* Scanning Frame */}
              <div className="absolute inset-8 border-2 border-emerald-400/70 rounded-2xl shadow-lg">
                {/* Corner markers */}
                <div className="absolute -top-1 -left-1 w-8 h-8 border-l-4 border-t-4 border-emerald-300 rounded-tl-lg"></div>
                <div className="absolute -top-1 -right-1 w-8 h-8 border-r-4 border-t-4 border-emerald-300 rounded-tr-lg"></div>
                <div className="absolute -bottom-1 -left-1 w-8 h-8 border-l-4 border-b-4 border-emerald-300 rounded-bl-lg"></div>
                <div className="absolute -bottom-1 -right-1 w-8 h-8 border-r-4 border-b-4 border-emerald-300 rounded-br-lg"></div>
                
                {/* Scanning line */}
                <motion.div
                  className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent"
                  animate={{ y: [0, 200, 0] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                />
              </div>

              {/* Instructions */}
              <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
                <div className="bg-black/80 backdrop-blur-sm text-white px-6 py-3 rounded-xl border border-emerald-400/30">
                  <BodyText className="text-white font-medium text-center">
                    🎯 Position product in frame
                  </BodyText>
                  <CaptionText className="text-emerald-200 text-center mt-1">
                    Tap "Scan Product" when ready
                  </CaptionText>
                </div>
              </div>
            </div>
          )}

          {/* Loading Overlay */}
          {isLoading && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
              <div className="text-center space-y-4">
                <Loader2 className="w-12 h-12 text-emerald-400 animate-spin mx-auto" />
                <BodyText className="text-white font-medium">
                  🤖 AI Analyzing Product...
                </BodyText>
              </div>
            </div>
          )}

          {/* Camera Controls Overlay */}
          <div className="absolute top-4 right-4 flex flex-col space-y-2">
            {/* Zoom Controls */}
            <div className="flex flex-col space-y-1 bg-black/60 backdrop-blur-sm rounded-lg p-1">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleZoomIn}
                disabled={zoom >= 3}
                className="p-2 text-white hover:text-emerald-400 disabled:opacity-50"
              >
                <ZoomIn className="w-4 h-4" />
              </motion.button>
              <div className="w-px h-4 bg-white/20 mx-auto"></div>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleZoomOut}
                disabled={zoom <= 1}
                className="p-2 text-white hover:text-emerald-400 disabled:opacity-50"
              >
                <ZoomOut className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
        </div>

        {/* Camera Controls */}
        <div className="p-6 space-y-4">
          {/* Main Controls */}
          <div className="flex items-center justify-center space-x-4">
            <EnhancedButton
              variant="outline"
              size="lg"
              onClick={toggleCamera}
              disabled={isLoading}
              className="flex-shrink-0"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Flip Camera
            </EnhancedButton>

            <EnhancedButton
              onClick={handleScan}
              disabled={isLoading || !isScanning}
              size="lg"
              className="flex-1 max-w-sm bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Scan className="mr-2 h-5 w-5" />
                  Scan Product Now
                </>
              )}
            </EnhancedButton>
          </div>

          {/* Camera Tips */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center space-x-2 text-center sm:text-left">
              <span className="text-lg">💡</span>
              <CaptionText contrast="medium">
                Good lighting helps
              </CaptionText>
            </div>
            <div className="flex items-center space-x-2 text-center sm:text-left">
              <span className="text-lg">📏</span>
              <CaptionText contrast="medium">
                Keep product centered
              </CaptionText>
            </div>
            <div className="flex items-center space-x-2 text-center sm:text-left">
              <span className="text-lg">🎯</span>
              <CaptionText contrast="medium">
                Focus on labels
              </CaptionText>
            </div>
          </div>
        </div>
      </EnhancedCard>

      {/* Hidden canvas for capturing */}
      <canvas
        ref={canvasRef}
        className="hidden"
      />
    </div>
  );
};