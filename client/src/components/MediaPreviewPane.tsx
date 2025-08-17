import {
  X,
  Play,
  Pause,
  Volume2,
  RotateCcw,
  MoreVertical,
  ZoomIn,
  ZoomOut,
  Monitor,
  PictureInPicture2,
  ExternalLink,
  Fullscreen,
  Minimize2,
  Maximize2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useState, useRef, useEffect } from 'react';

interface MediaFile {
  id: string;
  name: string;
  type: 'audio' | 'video' | 'image';
  url: string;
  duration?: number;
  size?: number;
}

interface MediaPreviewPaneProps {
  file: MediaFile | null;
  onClose: () => void;
  isVisible: boolean;
}

export function MediaPreviewPane({
  file,
  onClose,
  isVisible,
}: MediaPreviewPaneProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [error, setError] = useState<string | null>(null);

  // Video-specific states
  const [videoMode, setVideoMode] = useState<'normal' | 'mini' | 'fullscreen'>(
    'normal'
  );
  const [videoZoom, setVideoZoom] = useState(1);
  const [isInPictureInPicture, setIsInPictureInPicture] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!file) {
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
      setError(null);
      setVideoMode('normal');
      setVideoZoom(1);
      setIsInPictureInPicture(false);
    }
  }, [file]);

  // Handle fullscreen and picture-in-picture events
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setVideoMode('normal');
      }
    };

    const handlePictureInPictureChange = () => {
      setIsInPictureInPicture(!!document.pictureInPictureElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener(
      'enterpictureinpicture',
      handlePictureInPictureChange
    );
    document.addEventListener(
      'leavepictureinpicture',
      handlePictureInPictureChange
    );

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener(
        'enterpictureinpicture',
        handlePictureInPictureChange
      );
      document.removeEventListener(
        'leavepictureinpicture',
        handlePictureInPictureChange
      );
    };
  }, []);

  const handlePlayPause = () => {
    const mediaElement =
      file?.type === 'video' ? videoRef.current : audioRef.current;
    if (!mediaElement) return;

    if (isPlaying) {
      mediaElement.pause();
    } else {
      mediaElement.play().catch((err) => {
        setError('Failed to play media file');
        console.error('Media playback error:', err);
      });
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    const mediaElement =
      file?.type === 'video' ? videoRef.current : audioRef.current;
    if (mediaElement) {
      setCurrentTime(mediaElement.currentTime);
      setDuration(mediaElement.duration || 0);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const mediaElement =
      file?.type === 'video' ? videoRef.current : audioRef.current;
    if (!mediaElement || !duration) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const seekTime = (clickX / rect.width) * duration;

    mediaElement.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);

    const mediaElement =
      file?.type === 'video' ? videoRef.current : audioRef.current;
    if (mediaElement) {
      mediaElement.volume = newVolume;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleReset = () => {
    const mediaElement =
      file?.type === 'video' ? videoRef.current : audioRef.current;
    if (mediaElement) {
      mediaElement.currentTime = 0;
      setCurrentTime(0);
      setIsPlaying(false);
    }
  };

  // Video-specific handlers
  const handleZoomIn = () => {
    setVideoZoom((prev) => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setVideoZoom((prev) => Math.max(prev - 0.25, 0.25));
  };

  const handleResetZoom = () => {
    setVideoZoom(1);
  };

  const handleToggleMiniPlayer = () => {
    setVideoMode((prev) => (prev === 'mini' ? 'normal' : 'mini'));
  };

  const handleToggleFullscreen = () => {
    if (videoRef.current) {
      if (!document.fullscreenElement) {
        videoRef.current.requestFullscreen().catch(console.error);
        setVideoMode('fullscreen');
      } else {
        document.exitFullscreen();
        setVideoMode('normal');
      }
    }
  };

  const handlePictureInPicture = async () => {
    if (videoRef.current) {
      try {
        if (document.pictureInPictureElement) {
          await document.exitPictureInPicture();
          setIsInPictureInPicture(false);
        } else {
          await videoRef.current.requestPictureInPicture();
          setIsInPictureInPicture(true);
        }
      } catch (error) {
        console.error('Picture-in-picture failed:', error);
      }
    }
  };

  const handleIndependentWindow = () => {
    if (videoRef.current && file?.url) {
      const newWindow = window.open(
        '',
        '_blank',
        'width=800,height=600,resizable=yes,scrollbars=yes'
      );
      if (newWindow) {
        newWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>${file.name}</title>
              <style>
                body { margin: 0; padding: 0; background: black; display: flex; justify-content: center; align-items: center; height: 100vh; }
                video { max-width: 100%; max-height: 100%; }
              </style>
            </head>
            <body>
              <video controls autoplay src="${file.url}"></video>
            </body>
          </html>
        `);
        newWindow.document.close();
      }
    }
  };

  if (!isVisible || !file) {
    return null;
  }

  return (
    <div className="flex-none w-80 h-full bg-[var(--background)] border-r border-[var(--border)] shadow-lg overflow-y-auto">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  file.type === 'audio'
                    ? 'bg-[var(--blue)]'
                    : file.type === 'video'
                      ? 'bg-[var(--green)]'
                      : 'bg-[var(--purple)]'
                }`}
              />
              <h3 className="text-sm font-medium text-[var(--foreground)]">
                {file.name}
              </h3>
            </div>
            <div className="text-xs text-[var(--muted-foreground)] capitalize">
              {file.type} •{' '}
              {file.size
                ? `${(file.size / 1024 / 1024).toFixed(1)} MB`
                : 'Unknown size'}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-6 w-6 p-0 hover:bg-[var(--muted)]"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-[var(--red)]/10 border border-[var(--red)]/20 rounded-md">
            <div className="text-sm text-[var(--red)]">{error}</div>
          </div>
        )}

        {/* Media Content */}
        <div className="space-y-4">
          {file.type === 'video' && (
            <div className="space-y-3">
              {/* Video Container with Enhanced Controls */}
              <div
                className={`relative rounded-lg overflow-hidden ${
                  videoMode === 'mini' ? 'max-h-32' : 'max-h-64'
                } flex justify-center w-fit mx-0 group`}
              >
                <video
                  ref={videoRef}
                  src={file.url}
                  className={`${
                    videoMode === 'mini' ? 'max-h-32' : 'max-h-64'
                  } object-contain rounded-lg transition-all duration-300`}
                  style={{ transform: `scale(${videoZoom})` }}
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleTimeUpdate}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onError={() => setError('Failed to load video file')}
                />

                {/* Video Overlay Controls */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="h-8 w-8 p-0 bg-black/50 hover:bg-black/70 border-none"
                      >
                        <MoreVertical className="w-4 h-4 text-white" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuItem onClick={handleZoomIn}>
                        <ZoomIn className="w-4 h-4 mr-2" />
                        Zoom In ({Math.round(videoZoom * 100)}%)
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleZoomOut}>
                        <ZoomOut className="w-4 h-4 mr-2" />
                        Zoom Out
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleResetZoom}>
                        <Monitor className="w-4 h-4 mr-2" />
                        Reset Zoom (100%)
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleToggleMiniPlayer}>
                        {videoMode === 'mini' ? (
                          <Maximize2 className="w-4 h-4 mr-2" />
                        ) : (
                          <Minimize2 className="w-4 h-4 mr-2" />
                        )}
                        {videoMode === 'mini'
                          ? 'Exit Mini Player'
                          : 'Toggle Mini-Player Mode'}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handlePictureInPicture}>
                        <PictureInPicture2 className="w-4 h-4 mr-2" />
                        Picture in Picture
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleToggleFullscreen}>
                        <Fullscreen className="w-4 h-4 mr-2" />
                        Fullscreen Mode
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleIndependentWindow}>
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Move to Independent Screen
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Video Mode Indicator */}
                {videoMode !== 'normal' && (
                  <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {videoMode === 'mini'
                      ? 'Mini Player'
                      : videoMode === 'fullscreen'
                        ? 'Fullscreen'
                        : ''}
                    {isInPictureInPicture && ' • PiP'}
                  </div>
                )}
              </div>

              {/* Video Info Panel (hidden in mini mode) */}
              {videoMode !== 'mini' && (
                <div className="bg-[var(--muted)]/30 rounded-lg p-3 space-y-2">
                  <div className="flex justify-between text-xs text-[var(--muted-foreground)]">
                    <span>Zoom: {Math.round(videoZoom * 100)}%</span>
                    <span>
                      Mode: {videoMode === 'normal' ? 'Normal' : videoMode}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {file.type === 'audio' && (
            <div className="relative bg-gradient-to-br from-[var(--muted)]/40 to-[var(--muted)]/20 rounded-lg p-8 min-h-32 flex items-center justify-center">
              <audio
                ref={audioRef}
                src={file.url}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleTimeUpdate}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onError={() => setError('Failed to load audio file')}
              />
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-[var(--primary)]/20 rounded-full flex items-center justify-center">
                  <Volume2 className="w-8 h-8 text-[var(--primary)]" />
                </div>
                <div className="text-sm text-[var(--muted-foreground)]">
                  Audio Preview
                </div>
              </div>
            </div>
          )}

          {file.type === 'image' && (
            <div className="relative bg-black rounded-lg overflow-hidden max-h-64">
              <img
                src={file.url}
                alt={file.name}
                className="w-full h-auto max-h-64 object-contain"
                onError={() => setError('Failed to load image file')}
              />
            </div>
          )}

          {/* Media Controls */}
          {(file.type === 'audio' || file.type === 'video') && (
            <div className="space-y-3">
              {/* Playback Controls */}
              <div className="flex items-center justify-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReset}
                  className="h-8 w-8 p-0 hover:bg-[var(--accent)]"
                  title="Reset to beginning"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handlePlayPause}
                  className="h-10 w-10 p-0 hover:bg-[var(--accent)]"
                  title={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5" />
                  ) : (
                    <Play className="w-5 h-5" />
                  )}
                </Button>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div
                  className="relative h-2 bg-[var(--muted)] rounded-full cursor-pointer"
                  onClick={handleSeek}
                >
                  <div
                    className="absolute top-0 left-0 h-full bg-[var(--primary)] rounded-full transition-all duration-150"
                    style={{
                      width: duration
                        ? `${(currentTime / duration) * 100}%`
                        : '0%',
                    }}
                  />
                  <div
                    className="absolute top-1/2 transform -translate-y-1/2 w-3 h-3 bg-[var(--primary)] rounded-full transition-all duration-150"
                    style={{
                      left: duration
                        ? `${(currentTime / duration) * 100}%`
                        : '0%',
                      marginLeft: '-6px',
                    }}
                  />
                </div>

                <div className="flex justify-between text-xs text-[var(--muted-foreground)] font-mono">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Volume Control */}
              <div className="flex items-center space-x-3">
                <Volume2 className="w-4 h-4 text-[var(--muted-foreground)]" />
                <div className="flex-1">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="w-full h-1 bg-[var(--muted)] rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>
                <span className="text-xs text-[var(--muted-foreground)] font-mono w-8">
                  {Math.round(volume * 100)}%
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
