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
    <div className="w-full h-full flex flex-col">
      {/* Title */}
      <div className="p-3 bg-[var(--background)] border-b border-[var(--border)]">
        <h2 className="text-sm font-medium text-[var(--foreground)]">SampleVideo_1280x720_1mb.mp4</h2>
      </div>

      {/* Video Only */}
      <div className="flex-1 bg-black flex items-center justify-center">
        <video
          ref={videoRef}
          className="max-w-full max-h-full object-contain"
          onTimeUpdate={handleVideoTimeUpdate}
          onLoadedMetadata={handleVideoLoadedMetadata}
          onPlay={handleVideoPlay}
          onPause={handleVideoPause}
          controls={false}
          preload="metadata"
        >
          <source src={videoUrl} type="video/mp4" />
          <div className="flex items-center justify-center h-64 text-gray-400">
            Video not supported in this browser
          </div>
        </video>
      </div>
    </div>
  );
}