import { useState, useRef, useCallback, useEffect } from 'react';

export interface CameraState {
  isActive: boolean;
  isLoading: boolean;
  error: string | null;
  hasPermission: boolean;
  stream: MediaStream | null;
}

export const useCamera = () => {
  const [state, setState] = useState<CameraState>({
    isActive: false,
    isLoading: false,
    error: null,
    hasPermission: false,
    stream: null,
  });
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const checkPermissions = useCallback(async () => {
    try {
      const result = await navigator.permissions.query({ name: 'camera' as PermissionName });
      setState(prev => ({ ...prev, hasPermission: result.state === 'granted' }));
      return result.state === 'granted';
    } catch (error) {
      // Fallback for browsers that don't support permissions API
      return true;
    }
  }, []);

  const startCamera = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Check if mediaDevices is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API not supported by this browser');
      }

      console.log('Requesting camera permissions...');

      const constraints = {
        video: {
          facingMode: { ideal: 'environment' }, // Prefer back camera
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 },
          frameRate: { ideal: 30, min: 15 }
        },
        audio: false
      };

      console.log('Camera constraints:', constraints);

      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (constraintsError) {
        console.warn('Failed with ideal constraints, trying basic constraints:', constraintsError);
        // Fallback to basic constraints
        const basicConstraints = {
          video: true,
          audio: false
        };
        stream = await navigator.mediaDevices.getUserMedia(basicConstraints);
      }
      streamRef.current = stream;
      console.log('Camera stream obtained:', stream);
      console.log('Video tracks:', stream.getVideoTracks());

      // Store stream first, then wait for video element to be available
      setState(prev => ({
        ...prev,
        stream,
        hasPermission: true,
      }));

      // Wait for video element to be available with retry mechanism
      let retries = 0;
      const maxRetries = 20; // 2 seconds with 100ms intervals
      
      while (!videoRef.current && retries < maxRetries) {
        console.log(`Waiting for video element... attempt ${retries + 1}`);
        await new Promise(resolve => setTimeout(resolve, 100));
        retries++;
      }

      if (videoRef.current) {
        const video = videoRef.current;
        video.srcObject = stream;
        console.log('Video srcObject set');
        
        // Wait for video to load with better error handling
        await new Promise<void>((resolve, reject) => {
          const onLoadedMetadata = () => {
            console.log('Video metadata loaded, dimensions:', video.videoWidth, 'x', video.videoHeight);
            
            // Try to play video, but don't fail if autoplay is blocked
            video.play().then(() => {
              console.log('Video playing successfully');
              resolve();
            }).catch((playError) => {
              console.warn('Autoplay blocked, but video loaded:', playError);
              // Even if autoplay fails, we can still use the video
              resolve();
            });
          };
          
          const onError = (e: Event) => {
            console.error('Video error event:', e);
            reject(new Error('Failed to load video stream'));
          };
          
          // Handle case where video is already loaded
          if (video.readyState >= 2) {
            console.log('Video already loaded');
            onLoadedMetadata();
            return;
          }
          
          video.onloadedmetadata = onLoadedMetadata;
          video.onerror = onError;
          
          // More generous timeout and fallback
          setTimeout(() => {
            video.onloadedmetadata = null;
            video.onerror = null;
            
            // Check if video has started loading at all
            if (video.readyState > 0) {
              console.warn('Video partially loaded, continuing anyway');
              resolve();
            } else {
              reject(new Error('Video loading timeout after 10 seconds'));
            }
          }, 10000);
        });
      } else {
        // If video element is still not available, set stream anyway and mark as ready but not active yet
        console.warn('Video element not available, but camera stream is ready');
      }

      setState(prev => ({
        ...prev,
        isActive: videoRef.current !== null, // Only set active if video element is available
        isLoading: false,
        hasPermission: true,
        stream,
      }));
      
      console.log('Camera started successfully');
    } catch (error) {
      console.error('Camera error details:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to access camera';
      
      // More specific error messages
      if (errorMessage.includes('Permission denied') || errorMessage.includes('NotAllowedError')) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Camera permission denied. Please allow camera access and try again.',
          hasPermission: false,
        }));
      } else if (errorMessage.includes('NotFoundError') || errorMessage.includes('DevicesNotFoundError')) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: 'No camera found. Please connect a camera and try again.',
          hasPermission: false,
        }));
      } else if (errorMessage.includes('NotSupportedError')) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Camera not supported by this browser. Try Chrome or Firefox.',
          hasPermission: false,
        }));
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
          hasPermission: false,
        }));
      }
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setState(prev => ({
      ...prev,
      isActive: false,
      stream: null,
    }));
  }, []);

  const takePhoto = useCallback((): string | null => {
    if (!videoRef.current || !state.isActive) return null;

    const canvas = document.createElement('canvas');
    const video = videoRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    
    ctx.drawImage(video, 0, 0);
    return canvas.toDataURL('image/jpeg', 0.8);
  }, [state.isActive]);

  // Effect to handle video element becoming available
  useEffect(() => {
    if (videoRef.current && state.stream && !state.isActive) {
      const video = videoRef.current;
      const stream = state.stream;
      
      console.log('Setting video source from effect');
      video.srcObject = stream;
      
      const onLoadedMetadata = () => {
        console.log('Video metadata loaded from effect');
        video.play().then(() => {
          console.log('Video playing from effect');
          setState(prev => ({ ...prev, isActive: true, isLoading: false }));
        }).catch((error) => {
          console.error('Video play error from effect:', error);
        });
      };
      
      video.onloadedmetadata = onLoadedMetadata;
      
      return () => {
        video.onloadedmetadata = null;
      };
    }
  }, [state.stream, state.isActive]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return {
    ...state,
    videoRef,
    startCamera,
    stopCamera,
    takePhoto,
    checkPermissions,
  };
};