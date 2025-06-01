import { Button } from '@/components/ui/button';
import { Play, Pause, Square, Circle, SkipBack, SkipForward, Music, Piano, Lock, Unlock, X } from 'lucide-react';
import { TransportState } from '@/types/audio';
import { useState } from 'react';

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
  onSeek?: (time: number) => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onViewModeChange?: (mode: 'timeline' | 'midi') => void;
  // MIDI-specific playback functions
  onMidiPlay?: () => void;
  onMidiPause?: () => void;
  onMidiStop?: () => void;
  isMidiPlaying?: boolean;
  selectedTrack?: string | null;
  // Lock state management
  isTimelineLocked?: boolean;
  isMidiLocked?: boolean;
  onTimelineLockToggle?: () => void;
  onMidiLockToggle?: () => void;
  // Metronome functions
  onBpmChange?: (bpm: number) => void;
  onTimeSignatureChange?: (timeSignature: [number, number]) => void;
}

interface MetronomeProps {
  isOpen: boolean;
  onClose: () => void;
  currentBpm: number;
  timeSignature: [number, number];
  onBpmChange: (bpm: number) => void;
  onTimeSignatureChange: (timeSignature: [number, number]) => void;
}

function Metronome({ isOpen, onClose, currentBpm, timeSignature, onBpmChange, onTimeSignatureChange }: MetronomeProps) {
  const [bpm, setBpm] = useState(currentBpm);
  const [numerator, setNumerator] = useState(timeSignature[0]);
  const [denominator, setDenominator] = useState(timeSignature[1]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[var(--background)] border border-[var(--border)] rounded-lg w-[400px] shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">Metronome</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* BPM Control */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-[var(--foreground)]">Tempo (BPM)</label>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const newBpm = Math.max(60, bpm - 10);
                  setBpm(newBpm);
                  onBpmChange(newBpm);
                }}
              >
                -10
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const newBpm = Math.max(60, bpm - 1);
                  setBpm(newBpm);
                  onBpmChange(newBpm);
                }}
              >
                -1
              </Button>
              <div className="text-2xl font-mono font-bold text-[var(--foreground)] min-w-[4rem] text-center">
                {bpm}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const newBpm = Math.min(300, bpm + 1);
                  setBpm(newBpm);
                  onBpmChange(newBpm);
                }}
              >
                +1
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const newBpm = Math.min(300, bpm + 10);
                  setBpm(newBpm);
                  onBpmChange(newBpm);
                }}
              >
                +10
              </Button>
            </div>
            <input
              type="range"
              min="60"
              max="300"
              value={bpm}
              onChange={(e) => {
                const newBpm = parseInt(e.target.value);
                setBpm(newBpm);
                onBpmChange(newBpm);
              }}
              className="w-full"
            />
          </div>

          {/* Time Signature */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-[var(--foreground)]">Time Signature</label>
            <div className="flex items-center space-x-3">
              <select
                value={numerator}
                onChange={(e) => {
                  const newNumerator = parseInt(e.target.value);
                  setNumerator(newNumerator);
                  onTimeSignatureChange([newNumerator, denominator]);
                }}
                className="px-3 py-2 bg-[var(--input)] border border-[var(--border)] rounded-md text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 12, 15, 16].map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
              <span className="text-xl font-mono text-[var(--foreground)]">/</span>
              <select
                value={denominator}
                onChange={(e) => {
                  const newDenominator = parseInt(e.target.value);
                  setDenominator(newDenominator);
                  onTimeSignatureChange([numerator, newDenominator]);
                }}
                className="px-3 py-2 bg-[var(--input)] border border-[var(--border)] rounded-md text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]"
              >
                {[2, 4, 8, 16].map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-4 border-t border-[var(--border)] space-x-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={onClose}>Done</Button>
        </div>
      </div>
    </div>
  );
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
  onSeek,
  onZoomIn,
  onZoomOut,
  onViewModeChange,
  onMidiPlay,
  onMidiPause,
  onMidiStop,
  isMidiPlaying = false,
  selectedTrack,
  isTimelineLocked = false,
  isMidiLocked = false,
  onTimelineLockToggle,
  onMidiLockToggle,
  onBpmChange,
  onTimeSignatureChange
}: CompactTransportBarProps) {
  const [isMetronomeOpen, setIsMetronomeOpen] = useState(false);
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
          onClick={() => {
            if (viewMode === 'midi') {
              // MIDI mode: handle MIDI playback
              if (isMidiPlaying) {
                onMidiPause?.();
              } else {
                onMidiPlay?.();
              }
            } else {
              // Timeline mode: handle timeline playback
              if (transport.isPlaying) {
                onPause();
              } else {
                onPlay();
              }
            }
          }}
          className="h-8 w-8 p-0 hover:bg-[var(--accent)]"
          title={
            viewMode === 'midi' 
              ? (isMidiPlaying ? "Pause MIDI" : "Play MIDI")
              : (transport.isPlaying ? "Pause" : "Play")
          }
          disabled={viewMode === 'midi' && !selectedTrack}
        >
          {(viewMode === 'midi' ? isMidiPlaying : transport.isPlaying) ? (
            <Pause className="w-4 h-4" />
          ) : (
            <Play className="w-4 h-4" />
          )}
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            if (viewMode === 'midi') {
              onMidiStop?.();
            } else {
              onStop();
            }
          }}
          className="h-8 w-8 p-0 hover:bg-[var(--accent)]"
          title={viewMode === 'midi' ? "Stop MIDI" : "Stop"}
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
        <div 
          className="text-sm font-mono text-[var(--foreground)] cursor-pointer hover:bg-[var(--accent)] px-2 py-1 rounded transition-colors"
          onClick={() => onSeek?.(0)}
          title="Click to seek to beginning"
        >
          {formatTime(transport.currentTime)}
        </div>
        <div className="w-px h-4 bg-[var(--border)]"></div>
        <button 
          className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors cursor-pointer px-2 py-1 rounded hover:bg-[var(--accent)]"
          onClick={() => setIsMetronomeOpen(true)}
          title="Click to open Metronome"
        >
          {bpm} BPM • {timeSignature[0]}/{timeSignature[1]}
        </button>
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
        
        {/* Lock Session Button */}
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 hover:bg-[var(--muted)] transition-colors"
          onClick={() => {
            if (viewMode === 'timeline' && onTimelineLockToggle) {
              onTimelineLockToggle();
            } else if (viewMode === 'midi' && onMidiLockToggle) {
              onMidiLockToggle();
            }
          }}
          title={`${viewMode === 'timeline' ? (isTimelineLocked ? 'Unlock Timeline' : 'Lock Timeline') : (isMidiLocked ? 'Unlock MIDI Editor' : 'Lock MIDI Editor')}`}
        >
          {viewMode === 'timeline' ? 
            (isTimelineLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />) :
            (isMidiLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />)
          }
        </Button>

        {transport.isRecording && (
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-[var(--red)] rounded-full animate-pulse"></div>
            <span className="text-xs text-[var(--red)] font-medium">REC</span>
          </div>
        )}
      </div>

      {/* Metronome Modal */}
      <Metronome
        isOpen={isMetronomeOpen}
        onClose={() => setIsMetronomeOpen(false)}
        currentBpm={bpm}
        timeSignature={timeSignature}
        onBpmChange={onBpmChange || (() => {})}
        onTimeSignatureChange={onTimeSignatureChange || (() => {})}
      />
    </div>
  );
}