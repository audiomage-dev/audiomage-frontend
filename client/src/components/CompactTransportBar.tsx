import { Button } from '@/components/ui/button';
import { Play, Pause, Square, Circle, SkipBack, SkipForward, Music, Piano } from 'lucide-react';
import { TransportState } from '@/types/audio';

interface CompactTransportBarProps {
  transport: TransportState;
  bpm: number;
  timeSignature: [number, number];
  zoomLevel?: number;
  viewMode?: 'timeline' | 'midi';
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onRecord: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onViewModeChange?: (mode: 'timeline' | 'midi') => void;
}

export function CompactTransportBar({
  transport,
  bpm,
  timeSignature,
  zoomLevel = 1,
  viewMode = 'timeline',
  onPlay,
  onPause,
  onStop,
  onRecord,
  onZoomIn,
  onZoomOut,
  onViewModeChange
}: CompactTransportBarProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-12 bg-[var(--muted)] border-b border-[var(--border)] px-4 flex items-center justify-between">
      {/* Left: Transport Controls */}
      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 hover:bg-[var(--accent)]"
          title="Go to beginning"
        >
          <SkipBack className="w-4 h-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={transport.isPlaying ? onPause : onPlay}
          className="h-8 w-8 p-0 hover:bg-[var(--accent)]"
          title={transport.isPlaying ? "Pause" : "Play"}
        >
          {transport.isPlaying ? (
            <Pause className="w-4 h-4" />
          ) : (
            <Play className="w-4 h-4" />
          )}
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onStop}
          className="h-8 w-8 p-0 hover:bg-[var(--accent)]"
          title="Stop"
        >
          <Square className="w-4 h-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onRecord}
          className={`h-8 w-8 p-0 hover:bg-[var(--accent)] ${
            transport.isRecording ? 'text-[var(--red)] bg-[var(--red)]/20' : ''
          }`}
          title="Record"
        >
          <Circle className={`w-4 h-4 ${transport.isRecording ? 'fill-current' : ''}`} />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 hover:bg-[var(--accent)]"
          title="Go to end"
        >
          <SkipForward className="w-4 h-4" />
        </Button>
      </div>

      {/* Center: Time Display */}
      <div className="flex items-center space-x-4">
        <div className="text-sm font-mono text-[var(--foreground)]">
          {formatTime(transport.currentTime)}
        </div>
        <div className="w-px h-4 bg-[var(--border)]"></div>
        <div className="text-sm text-[var(--muted-foreground)]">
          {bpm} BPM • {timeSignature[0]}/{timeSignature[1]}
        </div>
      </div>

      {/* Right: Additional Controls */}
      <div className="flex items-center space-x-2">
        {/* View Mode Toggle */}
        <div className="flex items-center bg-[var(--background)] border border-[var(--border)] rounded overflow-hidden">
          <button
            onClick={() => onViewModeChange?.('timeline')}
            className={`h-7 px-2 flex items-center justify-center transition-colors ${
              viewMode === 'timeline' 
                ? 'bg-[var(--primary)] text-[var(--primary-foreground)]' 
                : 'hover:bg-[var(--accent)] text-[var(--foreground)]'
            }`}
            title="Timeline View"
          >
            <Music className="w-3 h-3" />
          </button>
          <button
            onClick={() => onViewModeChange?.('midi')}
            className={`h-7 px-2 flex items-center justify-center transition-colors ${
              viewMode === 'midi' 
                ? 'bg-[var(--primary)] text-[var(--primary-foreground)]' 
                : 'hover:bg-[var(--accent)] text-[var(--foreground)]'
            }`}
            title="MIDI Editor"
          >
            <Piano className="w-3 h-3" />
          </button>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center space-x-1 bg-[var(--background)] border border-[var(--border)] rounded px-2 py-1">
          <button
            onClick={onZoomOut}
            disabled={!onZoomOut}
            className="h-5 w-5 flex items-center justify-center hover:bg-[var(--accent)] rounded text-[var(--foreground)] disabled:opacity-50"
            title="Zoom Out"
          >
            -
          </button>
          <span className="text-xs text-[var(--foreground)] min-w-[2.5rem] text-center font-mono">
            {Math.round(zoomLevel * 100)}%
          </span>
          <button
            onClick={onZoomIn}
            disabled={!onZoomIn}
            className="h-5 w-5 flex items-center justify-center hover:bg-[var(--accent)] rounded text-[var(--foreground)] disabled:opacity-50"
            title="Zoom In"
          >
            +
          </button>
        </div>
        
        <div className="text-xs text-[var(--muted-foreground)]">
          {transport.isLooping ? 'LOOP' : 'LINEAR'}
        </div>
        {transport.isRecording && (
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-[var(--red)] rounded-full animate-pulse"></div>
            <span className="text-xs text-[var(--red)] font-medium">REC</span>
          </div>
        )}
      </div>
    </div>
  );
}