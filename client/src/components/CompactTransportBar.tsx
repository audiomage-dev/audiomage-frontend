import { Button } from '@/components/ui/button';
import { Play, Pause, Square, Circle, SkipBack, SkipForward, Music, Piano, Lock, Unlock, Volume2, Minus, Plus, X, FileMusic, Video, Shuffle, Grid3x3, Target, Move } from 'lucide-react';
import { TransportState } from '@/types/audio';
import { useState, useRef, useEffect } from 'react';

interface CompactTransportBarProps {
  transport: TransportState;
  bpm: number;
  timeSignature: [number, number];
  zoomLevel?: number;
  viewMode?: 'timeline' | 'midi' | 'score';
  midiPlaybackTime?: number;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onRecord: () => void;
  onSeek?: (time: number) => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onViewModeChange?: (mode: 'timeline' | 'midi' | 'score') => void;
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
  // Snap mode management
  snapMode?: 'free' | 'grid' | 'beat' | 'measure';
  onSnapModeChange?: (mode: 'free' | 'grid' | 'beat' | 'measure') => void;
  // Metronome functions
  onBpmChange?: (bpm: number) => void;
  onTimeSignatureChange?: (timeSignature: [number, number]) => void;
  onVideoPlayerToggle?: () => void;
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
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(0);
  const [volume, setVolume] = useState(50);
  const audioContextRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize audio context
  const initAudioContext = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  };

  // Play click sound
  const playClick = (isAccent: boolean = false) => {
    const audioContext = initAudioContext();
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Higher frequency for accent beats
    oscillator.frequency.setValueAtTime(isAccent ? 1200 : 800, audioContext.currentTime);
    oscillator.type = 'sine';

    // Volume control
    const adjustedVolume = (volume / 100) * 0.1; // Keep volume reasonable
    gainNode.gain.setValueAtTime(adjustedVolume, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  };

  // Start/stop metronome
  const togglePlayback = () => {
    if (isPlaying) {
      stopMetronome();
    } else {
      startMetronome();
    }
  };

  const startMetronome = () => {
    const interval = 60000 / currentBpm; // Convert BPM to milliseconds
    let beat = 0;

    const tick = () => {
      const isAccent = beat === 0; // First beat of measure is accent
      playClick(isAccent);
      setCurrentBeat(beat);
      beat = (beat + 1) % timeSignature[0];
    };

    // Play first beat immediately
    tick();
    
    intervalRef.current = setInterval(tick, interval);
    setIsPlaying(true);
  };

  const stopMetronome = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsPlaying(false);
    setCurrentBeat(0);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopMetronome();
    };
  }, []);

  // Update interval when BPM changes
  useEffect(() => {
    if (isPlaying) {
      stopMetronome();
      startMetronome();
    }
  }, [currentBpm]);

  const adjustBpm = (delta: number) => {
    const newBpm = Math.max(60, Math.min(200, currentBpm + delta));
    onBpmChange(newBpm);
  };

  const presetBpms = [60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 170, 180];
  const timeSignatures: [number, number][] = [[4, 4], [3, 4], [2, 4], [6, 8], [9, 8], [12, 8]];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-start justify-center pt-20 z-50">
      <div className="bg-[var(--background)] border border-[var(--border)] rounded-xl shadow-2xl w-[600px] max-w-[90vw] max-h-[70vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-[var(--border)] bg-[var(--muted)] rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-[var(--primary)] rounded-lg flex items-center justify-center">
                <Volume2 className="h-4 w-4 text-[var(--primary-foreground)]" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[var(--foreground)]">Metronome</h3>
                <p className="text-xs text-[var(--muted-foreground)]">Professional timing and tempo control</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 hover:bg-[var(--accent)]"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* BPM Display and Controls */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-4 mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => adjustBpm(-1)}
                className="h-8 w-8 p-0"
              >
                <Minus className="h-4 w-4" />
              </Button>
              
              <div className="flex flex-col items-center">
                <input
                  type="number"
                  value={currentBpm}
                  onChange={(e) => onBpmChange(Math.max(60, Math.min(200, parseInt(e.target.value) || 60)))}
                  className="text-4xl font-bold text-center bg-transparent border-none outline-none w-20 text-[var(--foreground)]"
                  min="60"
                  max="200"
                />
                <span className="text-sm text-[var(--muted-foreground)] uppercase tracking-wider">BPM</span>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => adjustBpm(1)}
                className="h-8 w-8 p-0"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Beat Indicator */}
            <div className="flex items-center justify-center space-x-2 mb-6">
              {Array.from({ length: timeSignature[0] }, (_, i) => (
                <div
                  key={i}
                  className={`w-4 h-4 rounded-full border-2 transition-all duration-100 ${
                    i === currentBeat && isPlaying
                      ? 'bg-[var(--primary)] border-[var(--primary)] scale-125'
                      : i === 0
                      ? 'border-[var(--primary)] bg-transparent'
                      : 'border-[var(--muted-foreground)] bg-transparent'
                  }`}
                />
              ))}
            </div>

            {/* Play/Pause Button */}
            <Button
              onClick={togglePlayback}
              className="h-16 w-16 rounded-full bg-[var(--primary)] hover:bg-[var(--primary)]/90 mb-6"
            >
              {isPlaying ? (
                <Pause className="h-6 w-6 text-[var(--primary-foreground)]" />
              ) : (
                <Play className="h-6 w-6 text-[var(--primary-foreground)] ml-1" />
              )}
            </Button>
          </div>

          {/* Time Signature */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Time Signature</label>
            <div className="flex justify-center space-x-2">
              {timeSignatures.map((sig) => (
                <Button
                  key={`${sig[0]}/${sig[1]}`}
                  variant={timeSignature[0] === sig[0] && timeSignature[1] === sig[1] ? "default" : "outline"}
                  size="sm"
                  onClick={() => onTimeSignatureChange(sig)}
                  className="text-xs"
                >
                  {sig[0]}/{sig[1]}
                </Button>
              ))}
            </div>
          </div>

          {/* Volume Control */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Volume</label>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-[var(--muted-foreground)]">0</span>
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => setVolume(parseInt(e.target.value))}
                className="flex-1 h-2 bg-[var(--secondary)] rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-sm text-[var(--muted-foreground)]">100</span>
            </div>
            <div className="text-center mt-1 text-sm text-[var(--muted-foreground)]">{volume}%</div>
          </div>

          {/* BPM Presets */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Quick BPM</label>
            <div className="grid grid-cols-4 gap-2">
              {presetBpms.map((bpm) => (
                <Button
                  key={bpm}
                  variant={currentBpm === bpm ? "default" : "outline"}
                  size="sm"
                  onClick={() => onBpmChange(bpm)}
                  className="text-xs"
                >
                  {bpm}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-[var(--border)] bg-[var(--muted)] rounded-b-xl">
          <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)]">
            <div className="flex items-center space-x-4">
              <span>Click BPM display in transport to open</span>
            </div>
            <span>{timeSignature[0]}/{timeSignature[1]} at {currentBpm} BPM</span>
          </div>
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
  midiPlaybackTime = 0,
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
  snapMode = 'grid',
  onSnapModeChange,
  onBpmChange,
  onTimeSignatureChange,
  onVideoPlayerToggle
}: CompactTransportBarProps) {
  const [isMetronomeOpen, setIsMetronomeOpen] = useState(false);
  const [isTimeEditing, setIsTimeEditing] = useState(false);
  const [editTimeValue, setEditTimeValue] = useState('');
  const timeInputRef = useRef<HTMLInputElement>(null);
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const frames = Math.floor((seconds % 1) * 30); // Using 30fps for SMPTE
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}:${frames.toString().padStart(2, '0')}`;
  };

  const formatMidiTime = (beats: number) => {
    const measure = Math.floor(beats / 4) + 1;
    const beat = Math.floor(beats % 4) + 1;
    const subBeat = Math.floor((beats % 1) * 16) + 1;
    return `${measure}.${beat}.${subBeat.toString().padStart(2, '0')}`;
  };

  const getCurrentDisplayTime = () => {
    if (viewMode === 'midi') {
      return formatMidiTime(midiPlaybackTime);
    }
    return formatTime(transport.currentTime);
  };

  const parseTimeString = (timeStr: string): number => {
    const parts = timeStr.split(':');
    if (parts.length === 4) {
      // SMPTE format: HH:MM:SS:FF
      const hours = parseInt(parts[0]) || 0;
      const mins = parseInt(parts[1]) || 0;
      const secs = parseInt(parts[2]) || 0;
      const frames = parseInt(parts[3]) || 0;
      return hours * 3600 + mins * 60 + secs + (frames / 30);
    } else if (parts.length === 2) {
      // Legacy MM:SS format for backward compatibility
      const mins = parseInt(parts[0]) || 0;
      const secs = parseInt(parts[1]) || 0;
      return mins * 60 + secs;
    }
    return 0;
  };

  const handleTimeClick = () => {
    setIsTimeEditing(true);
    setEditTimeValue(getCurrentDisplayTime());
  };

  const handleTimeSubmit = () => {
    const newTime = parseTimeString(editTimeValue);
    if (onSeek && newTime >= 0) {
      onSeek(newTime);
    }
    setIsTimeEditing(false);
  };

  const handleTimeKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTimeSubmit();
    } else if (e.key === 'Escape') {
      setIsTimeEditing(false);
      setEditTimeValue('');
    }
  };

  useEffect(() => {
    if (isTimeEditing && timeInputRef.current) {
      timeInputRef.current.focus();
      timeInputRef.current.select();
    }
  }, [isTimeEditing]);

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
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Play button clicked! ViewMode:', viewMode, 'SelectedTrack:', selectedTrack, 'IsMidiPlaying:', isMidiPlaying);
            
            if (viewMode === 'midi') {
              // MIDI mode: handle MIDI playback
              if (isMidiPlaying) {
                console.log('Calling onMidiPause');
                onMidiPause?.();
              } else {
                console.log('Calling onMidiPlay');
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
        
        {/* Time Display - moved next to transport controls */}
        <div className="w-px h-4 bg-[var(--border)] ml-2"></div>
        {isTimeEditing ? (
          <input
            ref={timeInputRef}
            type="text"
            value={editTimeValue}
            onChange={(e) => setEditTimeValue(e.target.value)}
            onKeyDown={handleTimeKeyDown}
            onBlur={handleTimeSubmit}
            className="text-sm font-mono text-[var(--foreground)] bg-[var(--background)] border border-[var(--primary)] px-2 py-1 rounded w-24 text-center focus:outline-none ml-2"
            placeholder="HH:MM:SS:FF"
          />
        ) : (
          <div 
            className="text-sm font-mono text-[var(--foreground)] cursor-pointer hover:bg-[var(--accent)] px-2 py-1 rounded transition-colors ml-2"
            onClick={handleTimeClick}
            title="Click to edit time position"
          >
            {getCurrentDisplayTime()}
          </div>
        )}
      </div>

      {/* Center: Spacer */}
      <div className="flex-1"></div>

      {/* Right: Additional Controls */}
      <div className="flex items-center space-x-2">
        {/* Video Player Button */}
        <button
          className="h-7 px-2 flex items-center justify-center transition-colors hover:bg-[var(--accent)] text-[var(--foreground)] bg-[var(--background)] border border-[var(--border)] rounded"
          title="Video Player"
          onClick={onVideoPlayerToggle}
        >
          <Video className="w-3 h-3" />
        </button>



        {/* View Mode Toggle */}
        <div className="flex items-center bg-[var(--background)] border border-[var(--border)] rounded overflow-hidden">
          <button
            onClick={() => onViewModeChange?.('timeline')}
            className={`h-7 px-2 flex items-center justify-center transition-colors ${
              viewMode === 'timeline' 
                ? 'bg-[var(--primary)] text-[var(--primary-foreground)]' 
                : 'hover:bg-[var(--accent)] text-[var(--foreground)]'
            }`}
            title="Audio Editor"
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
          <button
            onClick={() => onViewModeChange?.('score')}
            className={`h-7 px-2 flex items-center justify-center transition-colors ${
              viewMode === 'score' 
                ? 'bg-[var(--primary)] text-[var(--primary-foreground)]' 
                : 'hover:bg-[var(--accent)] text-[var(--foreground)]'
            }`}
            title="Score Editor"
          >
            <FileMusic className="w-3 h-3" />
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

        {/* Snap Mode Toggle */}
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            className={`h-6 w-6 p-0 hover:bg-[var(--muted)] transition-colors ${
              snapMode !== 'free' ? 'bg-[var(--primary)]/20 text-[var(--primary)]' : ''
            }`}
            onClick={() => {
              const modes: ('free' | 'grid' | 'beat' | 'measure')[] = ['free', 'grid', 'beat', 'measure'];
              const currentIndex = modes.indexOf(snapMode);
              const nextMode = modes[(currentIndex + 1) % modes.length];
              onSnapModeChange?.(nextMode);
            }}
            title={`Snap: ${snapMode.toUpperCase()} (Click to cycle)`}
          >
            {snapMode === 'free' && <Move className="w-3 h-3" />}
            {snapMode === 'grid' && <Grid3x3 className="w-3 h-3" />}
            {snapMode === 'beat' && <Target className="w-3 h-3" />}
            {snapMode === 'measure' && <Music className="w-3 h-3" />}
          </Button>
          
          {/* Snap Mode Indicator */}
          <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2">
            <span className="text-[8px] text-[var(--muted-foreground)] font-mono uppercase">
              {snapMode}
            </span>
          </div>
        </div>

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