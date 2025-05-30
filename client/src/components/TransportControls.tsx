import { Button } from '@/components/ui/button';
import { TransportState } from '../types/audio';
import { Play, Pause, Square, Circle, SkipBack, SkipForward, Repeat } from 'lucide-react';

interface TransportControlsProps {
  transport: TransportState;
  bpm: number;
  timeSignature: [number, number];
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onRecord: () => void;
}

export function TransportControls({
  transport,
  bpm,
  timeSignature,
  onPlay,
  onPause,
  onStop,
  onRecord,
}: TransportControlsProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const frames = Math.floor((seconds % 1) * 100);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${frames.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-gradient-to-r from-[var(--background)] to-[var(--muted)] p-6 border-b border-[var(--border)] shadow-sm">
      <div className="flex items-center justify-center space-x-4 mb-4">
        <Button
          variant="outline"
          size="sm"
          className="w-10 h-10 rounded-xl border-2 border-[var(--border)] hover:bg-[var(--accent)] transition-all duration-200"
        >
          <SkipBack className="w-4 h-4" />
        </Button>
        
        {transport.isPlaying ? (
          <Button
            onClick={onPause}
            variant="default"
            size="lg"
            className="w-16 h-16 rounded-2xl bg-[var(--yellow)] hover:bg-[var(--yellow)]/80 text-[var(--background)] shadow-lg transition-all duration-200"
          >
            <Pause className="w-6 h-6" fill="currentColor" />
          </Button>
        ) : (
          <Button
            onClick={onPlay}
            variant="default"
            size="lg"
            className="w-16 h-16 rounded-2xl bg-[var(--green)] hover:bg-[var(--green)]/80 text-[var(--background)] shadow-lg transition-all duration-200"
          >
            <Play className="w-6 h-6 ml-1" fill="currentColor" />
          </Button>
        )}
        
        <Button
          variant="outline"
          size="sm"
          className="w-10 h-10 rounded-xl border-2 border-[var(--border)] hover:bg-[var(--accent)] transition-all duration-200"
        >
          <SkipForward className="w-4 h-4" />
        </Button>
        
        <Button
          onClick={onStop}
          variant="outline"
          size="sm"
          className="w-10 h-10 rounded-xl border-2 border-[var(--red)] text-[var(--red)] hover:bg-[var(--red)] hover:text-white transition-all duration-200"
        >
          <Square className="w-4 h-4" fill="currentColor" />
        </Button>
        
        <Button
          onClick={onRecord}
          variant="outline"
          size="sm"
          className={`w-10 h-10 rounded-xl border-2 transition-all duration-200 ${
            transport.isRecording 
              ? 'bg-[var(--red)] border-[var(--red)] text-white animate-pulse shadow-lg' 
              : 'border-[var(--red)] text-[var(--red)] hover:bg-[var(--red)] hover:text-white'
          }`}
        >
          <Circle className="w-4 h-4" fill="currentColor" />
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          className={`w-10 h-10 rounded-xl border-2 transition-all duration-200 ${
            transport.isLooping 
              ? 'bg-[var(--primary)] border-[var(--primary)] text-white' 
              : 'border-[var(--border)] hover:bg-[var(--accent)]'
          }`}
        >
          <Repeat className="w-4 h-4" />
        </Button>
      </div>
      
      <div className="flex items-center justify-center space-x-8">
        <div className="text-center">
          <div className="text-2xl font-mono font-bold text-[var(--primary)] mb-1">
            {formatTime(transport.currentTime)}
          </div>
          <span className="text-xs text-[var(--muted-foreground)] uppercase tracking-wider">Position</span>
        </div>
        
        <div className="w-px h-12 bg-[var(--border)]"></div>
        
        <div className="flex items-center space-x-6 bg-[var(--secondary)] px-4 py-2 rounded-lg">
          <div className="text-center">
            <div className="text-lg font-mono font-bold text-[var(--secondary-foreground)]">{bpm}</div>
            <span className="text-xs text-[var(--muted-foreground)]">BPM</span>
          </div>
          <div className="text-center">
            <div className="text-lg font-mono font-bold text-[var(--secondary-foreground)]">
              {timeSignature[0]}/{timeSignature[1]}
            </div>
            <span className="text-xs text-[var(--muted-foreground)]">Time</span>
          </div>
        </div>
      </div>
    </div>
  );
}
