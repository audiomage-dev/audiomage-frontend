import { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize2, SkipBack, SkipForward, X, Minimize2, Move, ChevronUp, ChevronDown, CornerLeftDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MovableVideoWindowProps {
  title?: string;
  src?: string;
  isOpen: boolean;
  onClose: () => void;
  onTimeUpdate?: (currentTime: number) => void;
  onDurationChange?: (duration: number) => void;
  initialPosition?: { x: number; y: number };
  initialSize?: { width: number; height: number };
}

export function MovableVideoWindow({ 
  title = "Project Video", 
  src = "/api/placeholder-video",
  isOpen,
  onClose,
  onTimeUpdate,
  onDurationChange,
  initialPosition = { x: 100, y: 100 },
  initialSize = { width: 480, height: 320 }
}: MovableVideoWindowProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // Window management states
  const [position, setPosition] = useState(initialPosition);
  const [size, setSize] = useState(initialSize);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const windowRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const resizeHandleRef = useRef<HTMLDivElement>(null);

  // Video controls
  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const time = parseFloat(e.target.value);
    video.currentTime = time;
    setCurrentTime(time);
  }, []);

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const vol = parseFloat(e.target.value);
    video.volume = vol;
    setVolume(vol);
    setIsMuted(vol === 0);
  }, []);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isMuted) {
      video.volume = volume || 0.5;
      setIsMuted(false);
    } else {
      video.volume = 0;
      setIsMuted(true);
    }
  }, [isMuted, volume]);

  const skipForward = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.min(video.currentTime + 10, duration);
  }, [duration]);

  const skipBackward = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(video.currentTime - 10, 0);
  }, []);

  const toggleMaximize = useCallback(() => {
    if (isMaximized) {
      setSize(initialSize);
      setPosition(initialPosition);
    } else {
      // Maximize to fit most of the screen
      setSize({ width: window.innerWidth - 100, height: window.innerHeight - 100 });
      setPosition({ x: 50, y: 50 });
    }
    setIsMaximized(!isMaximized);
  }, [isMaximized, initialSize, initialPosition]);

  const toggleCollapse = useCallback(() => {
    setIsCollapsed(!isCollapsed);
  }, [isCollapsed]);

  // Dragging functionality
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.target === headerRef.current || headerRef.current?.contains(e.target as Node)) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  }, [position]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    } else if (isResizing) {
      // Bottom-left resize handle: width decreases when dragging left, height increases when dragging down
      const deltaX = resizeStart.x - e.clientX; // Inverted for left handle
      const deltaY = e.clientY - resizeStart.y; // Normal for bottom handle
      
      const newWidth = Math.max(320, resizeStart.width + deltaX);
      const newHeight = Math.max(240, resizeStart.height + deltaY);
      
      // Adjust position when resizing from left edge
      const newX = position.x - (newWidth - size.width);
      
      setSize({ width: newWidth, height: newHeight });
      setPosition({ ...position, x: newX });
    }
  }, [isDragging, isResizing, dragStart, resizeStart, position, size]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
  }, []);

  // Resize functionality
  const handleResizeMouseDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height
    });
  }, [size]);

  // Video event handlers
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      const time = video.currentTime;
      setCurrentTime(time);
      onTimeUpdate?.(time);
    };

    const handleDurationChange = () => {
      const dur = video.duration;
      setDuration(dur);
      onDurationChange?.(dur);
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      onDurationChange?.(video.duration);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('durationchange', handleDurationChange);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('durationchange', handleDurationChange);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, [onTimeUpdate, onDurationChange]);

  // Global mouse event listeners for dragging and resizing
  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp]);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div
      ref={windowRef}
      className="fixed bg-[var(--card)] border border-[var(--border)] rounded-lg shadow-2xl z-50 overflow-hidden movable-video-window"
      style={{
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
        minWidth: 320,
        minHeight: 240
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Window Header */}
      <div
        ref={headerRef}
        className="flex items-center justify-between p-2 bg-[var(--muted)] border-b border-[var(--border)] cursor-move select-none video-window-header"
      >
        <div className="flex items-center gap-2">
          <Move className="w-4 h-4 text-[var(--muted-foreground)]" />
          <span className="text-sm font-medium text-[var(--foreground)]">{title}</span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleCollapse}
            className="h-6 w-6 p-0 hover:bg-[var(--accent)]"
            title={isCollapsed ? "Expand video" : "Collapse video"}
          >
            {isCollapsed ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleMaximize}
            className="h-6 w-6 p-0 hover:bg-[var(--accent)]"
          >
            {isMaximized ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-6 w-6 p-0 hover:bg-[var(--destructive)] hover:text-[var(--destructive-foreground)]"
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Video Container - Conditionally rendered */}
      {!isCollapsed && (
        <>
          <div className="relative flex-1" style={{ height: size.height - 80 }}>
            <video
              ref={videoRef}
              src={src}
              className="w-full h-full object-contain bg-black"
              poster="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjMUExQTFBIi8+Cjx0ZXh0IHg9IjIwMCIgeT0iMTUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM2NjY2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkxvYWRpbmcgVmlkZW8uLi48L3RleHQ+Cjwvc3ZnPgo="
            />
          </div>

          {/* Video Controls */}
          <div className="p-3 bg-[var(--muted)]/50 border-t border-[var(--border)]">
            {/* Progress Bar */}
            <div className="mb-2">
              <input
                type="range"
                min="0"
                max={duration || 0}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1 bg-[var(--muted)] rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-[var(--muted-foreground)] mt-1">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={skipBackward}
                  className="h-8 w-8 p-0"
                >
                  <SkipBack className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={togglePlay}
                  className="h-8 w-8 p-0"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={skipForward}
                  className="h-8 w-8 p-0"
                >
                  <SkipForward className="w-4 h-4" />
                </Button>
              </div>

              {/* Volume Control */}
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleMute}
                  className="h-8 w-8 p-0"
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </Button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-16 h-1 bg-[var(--muted)] rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
            </div>
          </div>
        </>
      )}

      {/* Resize Handle - Bottom Left */}
      <div
        ref={resizeHandleRef}
        className="absolute bottom-0 left-0 w-4 h-4 bg-[var(--muted)] cursor-sw-resize resize-handle flex items-end justify-start"
        onMouseDown={handleResizeMouseDown}
        title="Drag to resize video"
      >
        <CornerLeftDown className="w-3 h-3 text-[var(--muted-foreground)] m-0.5" />
      </div>
    </div>
  );
}