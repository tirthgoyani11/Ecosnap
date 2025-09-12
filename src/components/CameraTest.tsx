import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Camera, Square, AlertTriangle } from 'lucide-react';

export function CameraTest() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const startCamera = async () => {
    setIsLoading(true);
    setError('');

    try {
      console.log('Requesting camera access...');
      
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('getUserMedia is not supported');
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 640 },
          height: { ideal: 480 }
        },
        audio: false
      });

      console.log('Camera stream obtained:', mediaStream);
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        console.log('Video element set with stream');
        setIsActive(true);
      }
    } catch (err) {
      console.error('Camera error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown camera error';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => {
        track.stop();
        console.log('Camera track stopped');
      });
      setStream(null);
    }
    setIsActive(false);
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="p-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Camera Test</h3>
          
          <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${isActive ? '' : 'hidden'}`}
              onLoadedMetadata={() => {
                console.log('Video metadata loaded');
              }}
              onCanPlay={() => {
                console.log('Video can play');
              }}
              onError={(e) => {
                console.error('Video error:', e);
              }}
            />
            
            {!isActive && (
              <div className="flex items-center justify-center h-full">
                <Camera className="h-12 w-12 text-gray-400" />
              </div>
            )}
          </div>

          <div className="space-y-2">
            {!isActive ? (
              <Button 
                onClick={startCamera} 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? 'Starting...' : 'Start Camera'}
              </Button>
            ) : (
              <Button 
                onClick={stopCamera}
                variant="destructive"
                className="w-full"
              >
                <Square className="h-4 w-4 mr-2" />
                Stop Camera
              </Button>
            )}

            {error && (
              <div className="flex items-center gap-2 text-red-500 text-sm p-2 bg-red-50 rounded">
                <AlertTriangle className="h-4 w-4" />
                {error}
              </div>
            )}
          </div>

          <div className="text-xs text-gray-500 space-y-1">
            <p>• Camera access requires HTTPS in production</p>
            <p>• Check browser permissions if camera fails</p>
            <p>• Open browser console for detailed logs</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
