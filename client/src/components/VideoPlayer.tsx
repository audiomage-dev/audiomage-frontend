import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { X, Play, Pause, Volume2, VolumeX, Maximize2, Minimize2 } from 'lucide-react';
import { TransportState } from '@/types/audio';

interface VideoPlayerProps {
  isOpen: boolean;
  onClose: () => void;
  transport: TransportState;
  onVideoTimeUpdate?: (time: number) => void;
  videoUrl?: string;
}

export function VideoPlayer({ 
  isOpen, 
  onClose, 
  transport, 
  onVideoTimeUpdate,
  videoUrl = "/api/placeholder-video" // Default placeholder for now
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [videoVolume, setVideoVolume] = useState(1);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [videoDuration, setVideoDuration] = useState(0);
  const [videoCurrentTime, setVideoCurrentTime] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(0);

  // Sync video with transport
  useEffect(() => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    
    // Sync playback state
    if (transport.isPlaying && !isVideoPlaying) {
      video.play().then(() => {
        setIsVideoPlaying(true);
      }).catch(console.error);
    } else if (!transport.isPlaying && isVideoPlaying) {
      video.pause();
      setIsVideoPlaying(false);
    }

    // Sync time position (with tolerance to avoid constant seeking)
    const timeDifference = Math.abs(transport.currentTime - video.currentTime);
    if (timeDifference > 0.5) { // Only sync if difference is > 0.5 seconds
      video.currentTime = transport.currentTime;
      setVideoCurrentTime(transport.currentTime);
      setLastSyncTime(Date.now());
    }
  }, [transport.isPlaying, transport.currentTime, isVideoPlaying]);

  // Handle video events
  const handleVideoTimeUpdate = useCallback(() => {
    if (!videoRef.current) return;
    
    const currentTime = videoRef.current.currentTime;
    setVideoCurrentTime(currentTime);
    
    // Only update transport if we're not currently syncing from transport
    // to avoid feedback loops
    const timeSinceLastSync = Date.now() - lastSyncTime;
    if (timeSinceLastSync > 1000) { // 1 second buffer
      onVideoTimeUpdate?.(currentTime);
    }
  }, [onVideoTimeUpdate, lastSyncTime]);

  const handleVideoLoadedMetadata = useCallback(() => {
    if (!videoRef.current) return;
    setVideoDuration(videoRef.current.duration);
  }, []);

  const handleVideoPlay = useCallback(() => {
    setIsVideoPlaying(true);
  }, []);

  const handleVideoPause = useCallback(() => {
    setIsVideoPlaying(false);
  }, []);

  const handleVolumeChange = useCallback((newVolume: number) => {
    if (!videoRef.current) return;
    videoRef.current.volume = newVolume;
    setVideoVolume(newVolume);
    setIsVideoMuted(newVolume === 0);
  }, []);

  const toggleMute = useCallback(() => {
    if (!videoRef.current) return;
    
    if (isVideoMuted) {
      videoRef.current.volume = videoVolume > 0 ? videoVolume : 0.5;
      setIsVideoMuted(false);
    } else {
      videoRef.current.volume = 0;
      setIsVideoMuted(true);
    }
  }, [isVideoMuted, videoVolume]);

  const toggleFullscreen = useCallback(() => {
    if (!videoRef.current) return;

    if (!isFullscreen) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }, [isFullscreen]);

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-[var(--background)] border border-[var(--border)] rounded-xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 rounded-full bg-[var(--primary)]"></div>
            <h2 className="text-lg font-semibold text-[var(--foreground)]">Video Player</h2>
            <div className="text-sm text-[var(--muted-foreground)] font-mono">
              Synced with Timeline
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Video Container */}
        <div className="relative bg-black">
          <video
            ref={videoRef}
            className="w-full h-auto max-h-[60vh] object-contain"
            onTimeUpdate={handleVideoTimeUpdate}
            onLoadedMetadata={handleVideoLoadedMetadata}
            onPlay={handleVideoPlay}
            onPause={handleVideoPause}
            controls={false}
            preload="metadata"
          >
            <source src={videoUrl} type="video/mp4" />
            <div className="flex items-center justify-center h-64 text-[var(--muted-foreground)]">
              Video not supported in this browser
            </div>
          </video>

          {/* Video Controls Overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            <div className="flex items-center space-x-4 text-white">
              {/* Play/Pause */}
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-white hover:bg-white/20"
                onClick={() => {
                  if (isVideoPlaying) {
                    videoRef.current?.pause();
                  } else {
                    videoRef.current?.play();
                  }
                }}
              >
                {isVideoPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>

              {/* Time Display */}
              <div className="text-sm font-mono">
                {formatTime(videoCurrentTime)} / {formatTime(videoDuration)}
              </div>

              {/* Progress Bar */}
              <div className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[var(--primary)] transition-all duration-100"
                  style={{ width: `${videoDuration > 0 ? (videoCurrentTime / videoDuration) * 100 : 0}%` }}
                />
              </div>

              {/* Volume Control */}
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-white hover:bg-white/20"
                  onClick={toggleMute}
                >
                  {isVideoMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={isVideoMuted ? 0 : videoVolume}
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  className="w-16 h-1 bg-white/30 rounded-full appearance-none slider"
                />
              </div>

              {/* Fullscreen */}
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-white hover:bg-white/20"
                onClick={toggleFullscreen}
              >
                {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Sync Status */}
        <div className="p-3 border-t border-[var(--border)] bg-[var(--muted)]/30">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2 text-[var(--muted-foreground)]">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span>Timeline Sync Active</span>
            </div>
            <div className="text-[var(--muted-foreground)] font-mono">
              Transport: {formatTime(transport.currentTime)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}