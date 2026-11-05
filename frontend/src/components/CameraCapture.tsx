import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Camera,
  RefreshCw,
  X,
  AlertCircle,
  UploadCloud,
  Check,
  SwitchCamera,
  RotateCw,
  Sparkles,
  ChevronDown
} from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (file: File, previewUrl: string) => void;
  onClose: () => void;
  onSwitchToUpload?: () => void;
}

export interface CameraDeviceInfo {
  deviceId: string;
  label: string;
  facingMode: 'environment' | 'user' | 'unknown';
}

// Detect if current runtime is a mobile or tablet device
function isMobile(): boolean {
  if (typeof window === 'undefined' || !window.navigator) return false;
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera || '';
  const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
  const hasTouch = typeof navigator.maxTouchPoints === 'number' && navigator.maxTouchPoints > 1;
  return mobileRegex.test(userAgent) || hasTouch;
}

// Categorize camera devices based on label heuristics
function categorizeDevice(device: MediaDeviceInfo, index: number): CameraDeviceInfo {
  const label = (device.label || '').toLowerCase();
  let facingMode: 'environment' | 'user' | 'unknown' = 'unknown';

  if (
    label.includes('back') ||
    label.includes('rear') ||
    label.includes('environment') ||
    label.includes('facing back') ||
    label.includes('wide') ||
    label.includes('main') ||
    label.includes('ultra') ||
    label.includes('telephoto') ||
    label.includes('0,') ||
    label.includes('camera 0')
  ) {
    facingMode = 'environment';
  } else if (
    label.includes('front') ||
    label.includes('user') ||
    label.includes('selfie') ||
    label.includes('facing front') ||
    label.includes('facetime') ||
    label.includes('truedepth') ||
    label.includes('camera 1')
  ) {
    facingMode = 'user';
  }

  // Generate clean, readable label for UI display
  let cleanLabel = device.label;
  if (!cleanLabel) {
    cleanLabel = facingMode === 'environment'
      ? `Rear Camera ${index + 1}`
      : facingMode === 'user'
      ? `Front Camera ${index + 1}`
      : `Camera ${index + 1}`;
  }

  return {
    deviceId: device.deviceId,
    label: cleanLabel,
    facingMode
  };
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({
  onCapture,
  onClose,
  onSwitchToUpload,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Camera State
  const [isInitializing, setIsInitializing] = useState(true);
  const [isSwitching, setIsSwitching] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<'permission' | 'notFound' | 'inUse' | 'unsupported' | 'generic' | null>(null);
  
  // Active Camera Information
  const [activeFacingMode, setActiveFacingMode] = useState<'environment' | 'user'>('environment');
  const [activeDeviceId, setActiveDeviceId] = useState<string>('');
  const [availableDevices, setAvailableDevices] = useState<CameraDeviceInfo[]>([]);
  const [showDeviceMenu, setShowDeviceMenu] = useState(false);

  // Captured Photo State
  const [capturedPreview, setCapturedPreview] = useState<string | null>(null);
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);

  // Safely stop all active media tracks
  const stopStream = useCallback(() => {
    if (streamRef.current) {
      const tracks = streamRef.current.getTracks();
      tracks.forEach((track) => {
        try {
          track.stop();
        } catch (e) {
          console.warn('Error stopping video track:', e);
        }
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  // Enumerate video devices and classify them
  const updateDeviceList = useCallback(async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
      return [];
    }
    try {
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const videoInputs = allDevices.filter((d) => d.kind === 'videoinput');
      const categorized = videoInputs.map((d, i) => categorizeDevice(d, i));
      setAvailableDevices(categorized);
      return categorized;
    } catch (e) {
      console.warn('Failed to enumerate media devices:', e);
      return [];
    }
  }, []);

  // Start camera stream with resilient fallback cascade
  const startCamera = useCallback(
    async (targetFacing: 'environment' | 'user' = 'environment', targetDeviceId?: string) => {
      stopStream();
      setIsInitializing(true);
      setErrorMsg(null);
      setErrorType(null);

      // Verify browser support
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setErrorType('unsupported');
        setErrorMsg('Camera access is not supported by your browser or requires a secure HTTPS context.');
        setIsInitializing(false);
        return;
      }

      let stream: MediaStream | null = null;
      let resolvedFacing: 'environment' | 'user' = targetFacing;
      let resolvedDeviceId: string = targetDeviceId || '';

      // Constraint tier 1: If specific device ID is specified
      if (targetDeviceId) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            audio: false,
            video: {
              deviceId: { exact: targetDeviceId },
              width: { ideal: 1920 },
              height: { ideal: 1080 }
            }
          });
        } catch (err: any) {
          console.warn('Exact deviceId constraint failed, falling back to ideal constraint:', err);
        }
      }

      // Constraint tier 2: Prefer rear camera by default with { ideal: "environment" }
      if (!stream) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            audio: false,
            video: {
              facingMode: { ideal: targetFacing },
              width: { ideal: 1920 },
              height: { ideal: 1080 }
            }
          });
        } catch (err: any) {
          console.warn(`Ideal facingMode ${targetFacing} failed:`, err);
        }
      }

      // Constraint tier 3: Fallback to opposite facingMode if requested facing failed
      if (!stream) {
        const fallbackFacing = targetFacing === 'environment' ? 'user' : 'environment';
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            audio: false,
            video: {
              facingMode: { ideal: fallbackFacing },
              width: { ideal: 1280 },
              height: { ideal: 720 }
            }
          });
          resolvedFacing = fallbackFacing;
        } catch (err: any) {
          console.warn('Fallback facing mode failed:', err);
        }
      }

      // Constraint tier 4: Standard basic video fallback
      if (!stream) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            audio: false,
            video: true
          });
        } catch (err: any) {
          console.error('All camera constraint tiers failed:', err);
          setIsInitializing(false);
          const name = err.name || '';
          if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
            setErrorType('permission');
            setErrorMsg('Camera permission was denied. Please allow camera access in your browser site permissions or use File Upload.');
          } else if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
            setErrorType('notFound');
            setErrorMsg('No camera hardware was detected on this device. Please use File Upload instead.');
          } else if (name === 'NotReadableError' || name === 'TrackStartError') {
            setErrorType('inUse');
            setErrorMsg('Your camera is currently in use or locked by another application. Please close other apps using the camera.');
          } else {
            setErrorType('generic');
            setErrorMsg(err.message || 'Unable to connect to camera. Please use File Upload.');
          }
          return;
        }
      }

      streamRef.current = stream;

      // Inspect active track settings
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        const trackSettings = videoTrack.getSettings ? videoTrack.getSettings() : {};
        if (trackSettings.deviceId) {
          resolvedDeviceId = trackSettings.deviceId;
        }
        if (trackSettings.facingMode) {
          resolvedFacing = trackSettings.facingMode === 'user' ? 'user' : 'environment';
        }
      }

      // Attach stream to video element
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current
            ?.play()
            .catch((playErr) => console.warn('Video auto-play warning:', playErr));
        };
      }

      // Refresh device list now that permissions are granted (labels are now populated)
      const devices = await updateDeviceList();

      // Mobile smart-check: if rear camera was requested on mobile, but browser defaulted to front
      if (
        isMobile() &&
        targetFacing === 'environment' &&
        resolvedFacing === 'user' &&
        !targetDeviceId
      ) {
        // Check if an explicit rear device exists in enumerated list
        const rearDevice = devices.find((d) => d.facingMode === 'environment');
        if (rearDevice && rearDevice.deviceId && rearDevice.deviceId !== resolvedDeviceId) {
          console.log('Mobile defaulted to front camera; re-routing to rear camera:', rearDevice.label);
          // Reconnect with explicit rear device ID
          return startCamera('environment', rearDevice.deviceId);
        }
      }

      setActiveFacingMode(resolvedFacing);
      setActiveDeviceId(resolvedDeviceId);
      setIsInitializing(false);
      setIsSwitching(false);
    },
    [stopStream, updateDeviceList]
  );

  // Mount effect: start with rear camera
  useEffect(() => {
    startCamera('environment');
    return () => {
      stopStream();
    };
  }, [startCamera, stopStream]);

  // Handle switching between front and back cameras
  const handleToggleCamera = async () => {
    if (isSwitching || isInitializing) return;
    setIsSwitching(true);

    const nextFacing: 'environment' | 'user' = activeFacingMode === 'environment' ? 'user' : 'environment';

    // Find the best target device matching the next facing mode
    const matchingDevice = availableDevices.find((d) => d.facingMode === nextFacing);

    // If no explicit device matches, cycle to the next device if multiple devices exist
    let targetDeviceId = matchingDevice?.deviceId;
    if (!targetDeviceId && availableDevices.length > 1) {
      const currentIndex = availableDevices.findIndex((d) => d.deviceId === activeDeviceId);
      const nextIndex = (currentIndex + 1) % availableDevices.length;
      targetDeviceId = availableDevices[nextIndex]?.deviceId;
    }

    await startCamera(nextFacing, targetDeviceId);
  };

  // Select a specific camera device from menu
  const handleSelectDevice = async (device: CameraDeviceInfo) => {
    setShowDeviceMenu(false);
    if (device.deviceId === activeDeviceId) return;
    setIsSwitching(true);
    await startCamera(device.facingMode === 'user' ? 'user' : 'environment', device.deviceId);
  };

  // Capture still image frame from video feed
  const handleTakePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');

    const width = video.videoWidth || 1920;
    const height = video.videoHeight || 1080;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw un-mirrored for accurate document / note reading
    ctx.drawImage(video, 0, 0, width, height);

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

  // Retake photo: clear preview and restart camera with current preferences
  const handleRetake = () => {
    setCapturedPreview(null);
    setCapturedBlob(null);
    startCamera(activeFacingMode, activeDeviceId);
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

  // Determine active camera label for display
  const currentDevice = availableDevices.find((d) => d.deviceId === activeDeviceId);
  const activeLabel = currentDevice
    ? currentDevice.label
    : activeFacingMode === 'environment'
    ? 'Rear Camera (Back)'
    : 'Front Camera (Selfie)';

  const isMobileScreen = typeof window !== 'undefined' && (window.innerWidth <= 840 || isMobile());
  const hasMultipleCameras = availableDevices.length > 1 || isMobileScreen;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-surface border border-border rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-4 py-3 sm:px-5 sm:py-3.5 border-b border-border bg-surface-elevated shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-1.5 rounded-lg bg-primary/10 text-primary shrink-0">
              <Camera className="w-4 h-4 text-secondary" />
            </div>
            <div className="truncate">
              <span className="font-bold text-foreground text-xs sm:text-sm block truncate">
                {capturedPreview ? 'Review Study Note Photo' : 'Snap Study Note'}
              </span>
              {!capturedPreview && (
                <span className="text-[10px] text-foreground-muted flex items-center gap-1 truncate">
                  <span className={`w-1.5 h-1.5 rounded-full ${isInitializing ? 'bg-amber-400' : 'bg-emerald-400'} animate-pulse`} />
                  <span>{activeLabel}</span>
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Quick Switch Button in Header for Mobile & Desktop */}
            {hasMultipleCameras && !capturedPreview && !errorMsg && (
              <div className="relative">
                <button
                  type="button"
                  onClick={handleToggleCamera}
                  disabled={isSwitching || isInitializing}
                  className="px-2.5 py-1.5 rounded-xl bg-surface hover:bg-surface-hover text-secondary border border-border hover:border-secondary/40 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  title="Switch between front and back cameras"
                  aria-label="Switch camera"
                >
                  <SwitchCamera className={`w-3.5 h-3.5 ${isSwitching ? 'animate-spin' : ''}`} />
                  <span className="text-[11px] hidden sm:inline">
                    {activeFacingMode === 'environment' ? 'Switch to Front' : 'Switch to Back'}
                  </span>
                  <span className="text-[11px] sm:hidden">
                    {activeFacingMode === 'environment' ? 'Back' : 'Front'}
                  </span>
                </button>

                {/* Dropdown toggle for devices with 3+ lenses */}
                {availableDevices.length > 2 && (
                  <button
                    type="button"
                    onClick={() => setShowDeviceMenu(!showDeviceMenu)}
                    className="ml-1 p-1.5 rounded-xl bg-surface border border-border text-foreground-muted hover:text-foreground"
                    title="Select specific camera lens"
                  >
                    <ChevronDown className="w-3 h-3" />
                  </button>
                )}

                {/* Camera Selection Dropdown Menu */}
                {showDeviceMenu && availableDevices.length > 1 && (
                  <div className="absolute right-0 top-full mt-1.5 w-60 rounded-xl bg-surface border border-border shadow-2xl py-1 z-30 animate-in fade-in zoom-in-95">
                    <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-foreground-muted border-b border-border/50">
                      Available Camera Lenses
                    </div>
                    {availableDevices.map((dev) => (
                      <button
                        key={dev.deviceId}
                        type="button"
                        onClick={() => handleSelectDevice(dev)}
                        className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between transition-colors ${
                          dev.deviceId === activeDeviceId
                            ? 'bg-primary/20 text-secondary font-bold'
                            : 'text-foreground hover:bg-surface-hover'
                        }`}
                      >
                        <span className="truncate pr-2">{dev.label}</span>
                        {dev.deviceId === activeDeviceId && <Check className="w-3.5 h-3.5 text-secondary shrink-0" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <button
              type="button"
              onClick={handleClose}
              className="p-1.5 rounded-xl text-foreground-muted hover:text-foreground hover:bg-surface-hover transition-colors cursor-pointer"
              title="Close camera"
              aria-label="Close camera"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Viewport Area */}
        <div className="relative aspect-4/3 w-full bg-black flex items-center justify-center overflow-hidden min-h-[260px] sm:min-h-[360px]">
          {errorMsg ? (
            <div className="p-6 text-center max-w-md animate-in fade-in">
              <div className="w-14 h-14 rounded-full bg-red-500/10 text-red-400 mx-auto flex items-center justify-center mb-3 border border-red-500/20 shadow-inner">
                <AlertCircle className="w-7 h-7" />
              </div>
              <h4 className="font-bold text-foreground text-sm sm:text-base mb-1">
                {errorType === 'permission'
                  ? 'Camera Permission Required'
                  : errorType === 'notFound'
                  ? 'No Camera Hardware Found'
                  : errorType === 'inUse'
                  ? 'Camera Already in Use'
                  : 'Camera Connection Notice'}
              </h4>
              <p className="text-xs text-foreground-muted mb-5 leading-relaxed">{errorMsg}</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
                <button
                  type="button"
                  onClick={() => startCamera(activeFacingMode, activeDeviceId)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-surface-elevated hover:bg-surface-hover text-foreground text-xs font-semibold border border-border transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Try Again
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleClose();
                    if (onSwitchToUpload) onSwitchToUpload();
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary-hover shadow-md glow-primary transition-all flex items-center justify-center gap-1.5 cursor-pointer"
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
              <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/75 backdrop-blur-sm border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-1.5 shadow-md">
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
                className={`w-full h-full object-cover transition-opacity duration-300 ${
                  isInitializing || isSwitching ? 'opacity-30' : 'opacity-100'
                }`}
              />

              {/* Viewfinder Target Framing Guidelines */}
              <div className="absolute inset-6 sm:inset-8 pointer-events-none border-2 border-secondary/30 rounded-2xl">
                <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-secondary rounded-tl-xl" />
                <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-secondary rounded-tr-xl" />
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-secondary rounded-bl-xl" />
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-secondary rounded-br-xl" />

                <div className="absolute inset-x-0 bottom-3 text-center px-2">
                  <span className="inline-block px-3 py-1 rounded-full bg-black/75 text-secondary text-[11px] font-medium backdrop-blur-md border border-secondary/20 shadow-md">
                    Align your handwritten notes or textbook inside frame
                  </span>
                </div>
              </div>

              {/* Floating Camera Flip / Switch Button on Viewfinder for Thumb Reach on Phones */}
              {hasMultipleCameras && (
                <button
                  type="button"
                  onClick={handleToggleCamera}
                  disabled={isSwitching || isInitializing}
                  className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-black/65 hover:bg-black/85 text-white backdrop-blur-md border border-white/20 shadow-xl active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
                  title={`Active: ${activeLabel}. Tap to switch camera.`}
                  aria-label="Switch camera"
                >
                  <SwitchCamera className={`w-4 h-4 text-secondary ${isSwitching ? 'animate-spin' : ''}`} />
                  <span className="text-[11px] font-bold pr-1 text-slate-100">
                    {activeFacingMode === 'environment' ? 'Rear' : 'Front'}
                  </span>
                </button>
              )}

              {/* Active Camera Mode Badge on Viewfinder */}
              <div className="absolute top-4 left-4 z-20 pointer-events-none">
                <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-slate-300 text-[10px] font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  {activeFacingMode === 'environment' ? 'Rear Lens Active' : 'Selfie Lens Active'}
                </span>
              </div>

              {/* Loading / Switching Spinner Overlay */}
              {(isInitializing || isSwitching) && (
                <div className="absolute inset-0 bg-surface/85 backdrop-blur-xs flex flex-col items-center justify-center gap-2 z-20">
                  <RefreshCw className="w-7 h-7 text-secondary animate-spin" />
                  <span className="text-xs font-semibold text-foreground">
                    {isSwitching ? 'Switching camera lens...' : 'Connecting to rear camera...'}
                  </span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Action Controls Footer */}
        <div className="p-3.5 sm:p-4 bg-surface-elevated border-t border-border flex items-center justify-between gap-3 shrink-0">
          {!capturedPreview && !errorMsg ? (
            <>
              <button
                type="button"
                onClick={handleClose}
                className="px-3.5 py-2 rounded-xl bg-surface hover:bg-surface-hover text-foreground-muted hover:text-foreground text-xs font-medium transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleTakePhoto}
                disabled={isInitializing || isSwitching}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-bold text-xs shadow-lg glow-primary hover:opacity-95 disabled:opacity-50 transition-all flex items-center gap-2 cursor-pointer"
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
                className="px-3 py-2 text-xs text-foreground-muted hover:text-secondary transition-colors flex items-center gap-1.5 cursor-pointer"
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
                className="px-4 py-2.5 rounded-xl bg-surface hover:bg-surface-hover text-foreground text-xs font-semibold border border-border transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Retake
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-3 py-2 text-xs text-foreground-muted hover:text-foreground transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmPhoto}
                  className="px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary-hover shadow-md glow-primary transition-all flex items-center gap-1.5 cursor-pointer"
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
              className="ml-auto px-4 py-2 text-xs text-foreground-muted hover:text-foreground transition-colors cursor-pointer"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
export default CameraCapture;
