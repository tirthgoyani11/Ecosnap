import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Camera, Square, AlertTriangle, RefreshCw } from 'lucide-react';

export function SimpleCameraTest() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string>('');
  const [stream, setStream] = useState<MediaStream | null>(null);

  const startSimpleCamera = async () => {
    try {
      setError('');
      console.log('Starting simple camera test...');

      // Basic camera request
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: false 
      });
      
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.onloadedmetadata = () => {
          console.log('Simple camera loaded');
          setIsActive(true);
        };
      }
    } catch (err: any) {
      console.error('Simple camera error:', err);
      setError(`Error: ${err.name} - ${err.message}`);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsActive(false);
  };

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4">Simple Camera Test</h3>
        
        <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden mb-4">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover ${isActive ? '' : 'hidden'}`}
          />
          
          {!isActive && (
            <div className="flex items-center justify-center h-full">
              <Camera className="h-12 w-12 text-gray-400" />
            </div>
          )}
        </div>

        <div className="space-y-3">
          {!isActive ? (
            <Button onClick={startSimpleCamera} className="w-full">
              Start Simple Camera
            </Button>
          ) : (
            <Button onClick={stopCamera} variant="destructive" className="w-full">
              <Square className="h-4 w-4 mr-2" />
              Stop Camera
            </Button>
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5" />
                <div className="text-sm text-red-700">
                  <p className="font-medium">Camera Error:</p>
                  <p>{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="text-xs text-gray-500">
            <p>• Test in Chrome, Firefox, or Safari</p>
            <p>• Allow camera permissions when prompted</p>
            <p>• Check browser console for detailed logs</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
