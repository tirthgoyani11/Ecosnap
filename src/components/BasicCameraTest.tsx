import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, Square } from 'lucide-react';

const BasicCameraTest = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>('');
  const [status, setStatus] = useState<string>('Ready to test');
  const [videoReady, setVideoReady] = useState(false);

  const startBasicCamera = async () => {
    try {
      setError('');
      setStatus('Requesting camera access...');
      
      // Most basic camera request possible
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true
      });
      
      setStatus('Camera access granted, setting up video...');
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        
        // Wait for video to be ready
        videoRef.current.onloadedmetadata = () => {
          setStatus('Video metadata loaded, attempting to play...');
          videoRef.current?.play().then(() => {
            setStatus('Video playing successfully!');
            setVideoReady(true);
          }).catch(playErr => {
            setError(`Video play failed: ${playErr.message}`);
            setStatus('Video play failed');
          });
        };
        
        videoRef.current.onerror = (e) => {
          setError(`Video error: ${e}`);
          setStatus('Video error occurred');
        };
      }
      
      setStream(mediaStream);
      
    } catch (err: any) {
      setError(`Camera error: ${err.name} - ${err.message}`);
      setStatus('Camera access failed');
      console.error('Basic camera test failed:', err);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setVideoReady(false);
    setStatus('Camera stopped');
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="text-blue-500" />
          Basic Camera Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status */}
        <div className="p-3 bg-gray-50 rounded-lg">
          <p className="text-sm font-medium">Status: {status}</p>
          {error && (
            <p className="text-sm text-red-600 mt-1">Error: {error}</p>
          )}
        </div>

        {/* Controls */}
        <div className="flex gap-2 justify-center">
          {!stream ? (
            <Button onClick={startBasicCamera} className="flex items-center gap-2">
              <Camera size={18} />
              Start Basic Camera Test
            </Button>
          ) : (
            <Button onClick={stopCamera} variant="outline">
              <Square size={18} />
              Stop Camera
            </Button>
          )}
        </div>

        {/* Video Display */}
        {stream && (
          <div className="space-y-2">
            <div className="relative bg-black rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                className="w-full h-64 object-cover"
                autoPlay
                playsInline
                muted
                style={{ backgroundColor: '#000' }}
              />
              
              {/* Status overlay */}
              {!videoReady && (
                <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center">
                  <div className="text-white text-center">
                    <div className="animate-pulse mb-2">📹</div>
                    <p className="text-sm">Setting up camera...</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Video info */}
            {videoReady && videoRef.current && (
              <div className="text-sm text-gray-600 text-center">
                Video: {videoRef.current.videoWidth}x{videoRef.current.videoHeight} 
                | Ready State: {videoRef.current.readyState}/4
              </div>
            )}
          </div>
        )}

        {/* Instructions */}
        <div className="text-sm text-gray-600 space-y-1">
          <p>• This is the most basic camera test possible</p>
          <p>• If this works, the AR scanner issue is with constraints or setup</p>
          <p>• If this fails, there's a fundamental camera/permission issue</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default BasicCameraTest;
