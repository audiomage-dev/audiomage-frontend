import { Button } from '@/components/ui/button';
import { TransportState } from '../types/audio';

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
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}:${frames.toString().padStart(3, '0')}`;
  };

  return (
    <div className="p-3 border-b border-[hsl(var(--nord-2))]">
      <div className="flex items-center justify-center space-x-2 mb-3">
        <Button
          variant="ghost"
          size="sm"
          className="transport-btn w-8 h-8 bg-[hsl(var(--nord-2))] hover:bg-[hsl(var(--frost-4))] rounded-full flex items-center justify-center"
        >
          <i className="fas fa-backward text-xs"></i>
        </Button>
        
        {transport.isPlaying ? (
          <Button
            onClick={onPause}
            variant="ghost"
            size="sm"
            className="transport-btn w-10 h-10 bg-[hsl(var(--aurora-yellow))] hover:bg-opacity-80 rounded-full flex items-center justify-center"
          >
            <i className="fas fa-pause text-[hsl(var(--nord-0))] text-xs"></i>
          </Button>
        ) : (
          <Button
            onClick={onPlay}
            variant="ghost"
            size="sm"
            className="transport-btn w-10 h-10 bg-[hsl(var(--aurora-green))] hover:bg-opacity-80 rounded-full flex items-center justify-center"
          >
            <i className="fas fa-play text-[hsl(var(--nord-0))] ml-1"></i>
          </Button>
        )}
        
        <Button
          variant="ghost"
          size="sm"
          className="transport-btn w-8 h-8 bg-[hsl(var(--nord-2))] hover:bg-[hsl(var(--frost-4))] rounded-full flex items-center justify-center"
        >
          <i className="fas fa-forward text-xs"></i>
        </Button>
        
        <Button
          onClick={onStop}
          variant="ghost"
          size="sm"
          className="transport-btn w-8 h-8 bg-[hsl(var(--aurora-red))] hover:bg-opacity-80 rounded-full flex items-center justify-center"
        >
          <i className="fas fa-square text-xs text-white"></i>
        </Button>
        
        <Button
          onClick={onRecord}
          variant="ghost"
          size="sm"
          className={`transport-btn w-8 h-8 rounded-full flex items-center justify-center ${
            transport.isRecording 
              ? 'bg-[hsl(var(--aurora-red))] text-white animate-pulse' 
              : 'bg-[hsl(var(--nord-2))] hover:bg-[hsl(var(--aurora-red))]'
          }`}
        >
          <i className="fas fa-circle text-xs"></i>
        </Button>
      </div>
      
      <div className="text-center font-mono text-sm">
        <div className="text-[hsl(var(--frost-2))]">{formatTime(transport.currentTime)}</div>
        <div className="text-xs text-[hsl(var(--nord-3))] mt-1">
          {bpm} BPM | {timeSignature[0]}/{timeSignature[1]}
        </div>
      </div>
    </div>
  );
}
