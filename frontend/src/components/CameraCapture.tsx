import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, RefreshCw, X, AlertCircle, UploadCloud, Check, Video } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (file: File, previewUrl: string) => void;
  onClose: () => void;
  onSwitchToUpload?: () => void;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({
  onCapture,
  onClose,
  onSwitchToUpload,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [isInitializing, setIsInitializing] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<'permission' | 'notFound' | 'unsupported' | 'generic' | null>(null);
  const [capturedPreview, setCapturedPreview] = useState<string | null>(null);
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);

  // Stop all camera media tracks safely
  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (e) {
          console.warn('Error stopping track:', e);
        }
      });
      streamRef.current = null;
    }
  }, []);

  // Request camera using navigator.mediaDevices.getUserMedia({ video: true })
  const startCamera = useCallback(async () => {
    stopStream();
    setIsInitializing(true);
    setErrorMsg(null);
    setErrorType(null);

    // Check if mediaDevices API is supported
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setErrorType('unsupported');
      setErrorMsg('Camera access is not supported by your browser or requires a secure HTTPS/localhost context.');
      setIsInitializing(false);
      return;
    }

    try {
      // Use standard { video: true } constraint for maximum compatibility across all devices
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current
            ?.play()
            .catch((err) => console.warn('Video auto-play warning:', err));
        };
      }
      setIsInitializing(false);
    } catch (err: any) {
      console.warn('Camera access error:', err);
      setIsInitializing(false);
      const name = err.name || '';

      if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
        setErrorType('permission');
        setErrorMsg('Camera permission was denied. Please allow camera access in your browser settings (look for the camera icon in your address bar) or use File Upload.');
      } else if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
        setErrorType('notFound');
        setErrorMsg('No camera hardware was detected on this device. Please upload an image file instead.');
      } else if (name === 'NotReadableError' || name === 'TrackStartError') {
        setErrorType('generic');
        setErrorMsg('Your camera is currently in use by another application. Please close other camera apps and try again, or upload a file.');
      } else {
        setErrorType('generic');
        setErrorMsg(err.message || 'Could not connect to camera. Please use the file upload option.');
      }
    }
  }, [stopStream]);

  // Request camera stream when modal opens
  useEffect(() => {
    startCamera();
    return () => {
      stopStream();
    };
  }, [startCamera, stopStream]);

  // Capture still image frame from video feed
  const handleTakePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        setCapturedBlob(blob);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
        setCapturedPreview(dataUrl);
        stopStream();
      },
      'image/jpeg',
      0.92
    );
  };

  // Retake photo: clear state and restart camera
  const handleRetake = () => {
    setCapturedPreview(null);
    setCapturedBlob(null);
    startCamera();
  };

  // Confirm photo and send to parent
  const handleConfirmPhoto = () => {
    if (!capturedBlob || !capturedPreview) return;
    const file = new File([capturedBlob], `scan_${Date.now()}.jpg`, { type: 'image/jpeg' });
    stopStream();
    onCapture(file, capturedPreview);
  };

  // Close and stop stream
  const handleClose = () => {
    stopStream();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-surface border border-border rounded-2xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-surface-elevated">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-secondary" />
            <span className="font-semibold text-foreground text-sm md:text-base">
              {capturedPreview ? 'Review Study Note Photo' : 'Snap Study Note'}
            </span>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-foreground-muted hover:text-foreground hover:bg-surface-hover transition-colors"
            title="Close camera"
            aria-label="Close camera"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewport Area */}
        <div className="relative aspect-4/3 w-full bg-black flex items-center justify-center overflow-hidden">
          {errorMsg ? (
            <div className="p-6 text-center max-w-md">
              <div className="w-14 h-14 rounded-full bg-red-500/10 text-red-400 mx-auto flex items-center justify-center mb-3 border border-red-500/20">
                <AlertCircle className="w-7 h-7" />
              </div>
              <h4 className="font-semibold text-foreground text-base mb-1">Camera Unavailable</h4>
              <p className="text-xs text-foreground-muted mb-5 leading-relaxed">{errorMsg}</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={startCamera}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-surface-elevated hover:bg-surface-hover text-foreground text-xs font-semibold border border-border transition-colors flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Try Again
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleClose();
                    if (onSwitchToUpload) onSwitchToUpload();
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary-hover shadow-md glow-primary transition-all flex items-center justify-center gap-1.5"
                >
                  <UploadCloud className="w-4 h-4" /> Switch to File Upload
                </button>
              </div>
            </div>
          ) : capturedPreview ? (
            <div className="relative w-full h-full bg-black flex items-center justify-center">
              <img
                src={capturedPreview}
                alt="Captured study note preview"
                className="w-full h-full object-contain"
              />
              <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/70 backdrop-blur-sm border border-white/10 text-emerald-400 text-xs font-medium flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" /> Photo Captured
              </div>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />

              {/* Viewfinder Target Overlay */}
              <div className="absolute inset-8 pointer-events-none border-2 border-secondary/40 rounded-xl">
                <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-secondary rounded-tl-lg" />
                <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-secondary rounded-tr-lg" />
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-secondary rounded-bl-lg" />
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-secondary rounded-br-lg" />
                <div className="absolute inset-x-0 bottom-4 text-center">
                  <span className="px-3.5 py-1.5 rounded-full bg-black/70 text-secondary text-xs font-medium backdrop-blur-sm border border-secondary/20">
                    Align your handwritten notes or textbook inside frame
                  </span>
                </div>
              </div>

              {isInitializing && (
                <div className="absolute inset-0 bg-surface/90 backdrop-blur-xs flex flex-col items-center justify-center gap-2">
                  <RefreshCw className="w-7 h-7 text-secondary animate-spin" />
                  <span className="text-xs font-medium text-foreground">Connecting to camera...</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Action Controls */}
        <div className="p-4 bg-surface-elevated border-t border-border flex items-center justify-between gap-3">
          {!capturedPreview && !errorMsg ? (
            <>
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 rounded-xl bg-surface hover:bg-surface-hover text-foreground-muted hover:text-foreground text-xs font-medium transition-colors"
              >
                Close
              </button>

              <button
                type="button"
                onClick={handleTakePhoto}
                disabled={isInitializing}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold text-xs shadow-lg glow-primary hover:opacity-95 disabled:opacity-50 transition-all flex items-center gap-2"
              >
                <Camera className="w-4 h-4" />
                <span>Capture Photo</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  handleClose();
                  if (onSwitchToUpload) onSwitchToUpload();
                }}
                className="px-3 py-2 text-xs text-foreground-muted hover:text-secondary transition-colors flex items-center gap-1.5"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Use File Upload</span>
              </button>
            </>
          ) : capturedPreview ? (
            <>
              <button
                type="button"
                onClick={handleRetake}
                className="px-4 py-2.5 rounded-xl bg-surface hover:bg-surface-hover text-foreground text-xs font-semibold border border-border transition-colors flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Retake
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-3 py-2 text-xs text-foreground-muted hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmPhoto}
                  className="px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary-hover shadow-md glow-primary transition-all flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Use This Photo</span>
                </button>
              </div>
            </>
          ) : (
            <button
              type="button"
              onClick={handleClose}
              className="ml-auto px-4 py-2 text-xs text-foreground-muted hover:text-foreground transition-colors"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
