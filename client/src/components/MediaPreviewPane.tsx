import { X, Play, Pause, Volume2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
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

  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!file) {
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
      setError(null);
    }
  }, [file]);

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

  if (!isVisible || !file) {
    return null;
  }

  return (
    <div className="flex-none bg-[var(--background)] border-b border-[var(--border)] shadow-lg">
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
            <div className="relative rounded-lg overflow-hidden max-h-64 flex justify-center">
              <video
                ref={videoRef}
                src={file.url}
                className="max-h-64 object-contain rounded-lg"
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleTimeUpdate}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onError={() => setError('Failed to load video file')}
              />
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
