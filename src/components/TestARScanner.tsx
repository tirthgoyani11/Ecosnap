import { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Camera, Scan, X, Loader2, Eye, RotateCcw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

export const TestARScanner: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [error, setError] = useState<string>('');
  const [cameraStatus, setCameraStatus] = useState<string>('Not started');

  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();

  // Simple camera start function
  const startCamera = useCallback(async () => {
    try {
      setError('');
      setCameraStatus('Requesting permissions...');
      
      // Check if camera is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API not supported in this browser');
      }

      // Simple constraints first
      const constraints = {
        video: {
          facingMode,
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      };

      setCameraStatus('Accessing camera...');
      console.log('Requesting camera access with constraints:', constraints);
      
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('Camera access granted, stream:', mediaStream);
      
      setCameraStatus('Setting up video...');
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        
        videoRef.current.onloadedmetadata = () => {
          console.log('Video metadata loaded');
          setCameraStatus('Starting video...');
        };
        
        videoRef.current.onloadeddata = () => {
          console.log('Video data loaded, dimensions:', videoRef.current?.videoWidth, 'x', videoRef.current?.videoHeight);
        };
        
        videoRef.current.oncanplay = () => {
          console.log('Video can play');
          setCameraStatus('Video ready');
        };
        
        videoRef.current.onplay = () => {
          console.log('Video started playing');
          setCameraStatus('AR Scanner Active');
          setIsActive(true);
          toast({
            title: "Camera Active! 📹",
            description: "AR Scanner is now running",
          });
        };

        videoRef.current.onerror = (e) => {
          console.error('Video error:', e);
          setError('Video playback failed');
          setCameraStatus('Video error');
        };

        // Try to play the video
        try {
          await videoRef.current.play();
        } catch (playError) {
          console.error('Video play failed:', playError);
          // Try again after a short delay
          setTimeout(() => {
            videoRef.current?.play().catch(console.error);
          }, 1000);
        }
      }

      setStream(mediaStream);

    } catch (err: any) {
      console.error('Camera setup failed:', err);
      let errorMessage = "Camera setup failed";
      
      if (err.name === 'NotAllowedError') {
        errorMessage = "Camera permission denied. Please allow camera access and try again.";
      } else if (err.name === 'NotFoundError') {
        errorMessage = "No camera found. Please connect a camera.";
      } else if (err.name === 'NotReadableError') {
        errorMessage = "Camera is being used by another app. Please close other apps using the camera.";
      } else if (err.name === 'OverconstrainedError') {
        errorMessage = "Camera doesn't support the requested settings.";
      } else {
        errorMessage = err.message || "Unknown camera error";
      }
      
      setError(errorMessage);
      setCameraStatus('Error: ' + err.name);
      toast({
        title: "Camera Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, [facingMode, toast]);

  // Stop camera
  const stopCamera = useCallback(() => {
    console.log('Stopping camera');
    if (stream) {
      stream.getTracks().forEach(track => {
        track.stop();
        console.log('Stopped track:', track.kind);
      });
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsActive(false);
    setCameraStatus('Stopped');
  }, [stream]);

  // Toggle camera
  const toggleCamera = useCallback(() => {
    const newMode = facingMode === 'environment' ? 'user' : 'environment';
    console.log('Switching camera from', facingMode, 'to', newMode);
    setFacingMode(newMode);
    
    if (isActive) {
      stopCamera();
      setTimeout(() => startCamera(), 500);
    }
  }, [facingMode, isActive, stopCamera, startCamera]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-6 w-6" />
          AR Scanner Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Status Display */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Status:</span>
            <Badge variant={isActive ? "default" : error ? "destructive" : "secondary"}>
              {cameraStatus}
            </Badge>
          </div>
          
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        {/* Controls */}
        <div className="flex gap-3 justify-center">
          {!isActive ? (
            <Button 
              onClick={startCamera} 
              className="flex items-center gap-2"
              size="lg"
            >
              <Camera size={20} />
              Start Camera Test
            </Button>
          ) : (
            <>
              <Button onClick={stopCamera} variant="outline">
                <X size={18} />
                Stop
              </Button>
              <Button onClick={toggleCamera} variant="outline">
                <RotateCcw size={18} />
                Flip ({facingMode})
              </Button>
            </>
          )}
        </div>

        {/* Video Display */}
        <div className="relative">
          <div className="relative overflow-hidden rounded-lg bg-gray-900 aspect-video">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              autoPlay
              playsInline
              muted
              style={{ 
                backgroundColor: '#1a1a1a',
                minHeight: '360px'
              }}
            />
            
            {!isActive && (
              <div className="absolute inset-0 flex items-center justify-center text-white">
                <div className="text-center">
                  <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">Camera Preview</p>
                  <p className="text-sm opacity-70">Click "Start Camera Test" to begin</p>
                </div>
              </div>
            )}

            {/* AR Grid Overlay when active */}
            {isActive && (
              <div className="absolute inset-0 pointer-events-none">
                <div className="w-full h-full border border-green-400/30 rounded-lg">
                  {/* Corner markers */}
                  <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-green-400"></div>
                  <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-green-400"></div>
                  <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-green-400"></div>
                  <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-green-400"></div>
                  
                  {/* Center crosshair */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="w-8 h-8 border border-green-400 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    </div>
                  </div>
                  
                  {/* Status overlay */}
                  <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-black/50 text-white border-white/20">
                      🎯 AR Mode Active
                    </Badge>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {isActive && (
            <p className="text-center text-sm text-gray-600 mt-2">
              Camera is working! This will be used for product scanning.
            </p>
          )}
        </div>

        {/* Debug Info */}
        {isActive && videoRef.current && (
          <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
            <p><strong>Debug Info:</strong></p>
            <p>Video Size: {videoRef.current.videoWidth || 0} x {videoRef.current.videoHeight || 0}</p>
            <p>Ready State: {videoRef.current.readyState}</p>
            <p>Current Time: {videoRef.current.currentTime.toFixed(1)}s</p>
            <p>Facing Mode: {facingMode}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
