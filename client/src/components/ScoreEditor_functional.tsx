import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { AudioTrack, TransportState } from '@/types/audio';
import { Edit3, Plus, VolumeX, Volume2 } from 'lucide-react';

interface Note {
  id: string;
  pitch: number;
  startTime: number;
  duration: number;
  velocity?: number;
}

interface Staff {
  id: string;
  clef: 'treble' | 'bass';
  keySignature: string;
  timeSignature: [number, number];
  notes: Note[];
  instrument: string;
  tempo: number;
  visible: boolean;
}

interface ScoreEditorProps {
  tracks: AudioTrack[];
  transport: TransportState;
  zoomLevel?: number;
  bpm?: number;
  timeSignature?: [number, number];
  onTrackMute: (trackId: string) => void;
  onTrackSolo: (trackId: string) => void;
  onTrackSelect?: (trackId: string) => void;
  isLocked?: boolean;
}

export function ScoreEditor({ 
  tracks, 
  transport, 
  zoomLevel = 1,
  bpm = 120,
  timeSignature = [4, 4],
  onTrackMute,
  onTrackSolo,
  onTrackSelect,
  isLocked = false
}: ScoreEditorProps) {
  const [selectedStaff, setSelectedStaff] = useState<string | null>(null);
  const [selectedNotes, setSelectedNotes] = useState<Set<string>>(new Set());
  const [currentTool, setCurrentTool] = useState<'select' | 'note'>('select');
  const [noteValue, setNoteValue] = useState<number>(1);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number; noteId: string } | null>(null);
  
  const [staffs, setStaffs] = useState<Staff[]>([
    {
      id: 'staff-1',
      clef: 'treble',
      keySignature: 'C',
      timeSignature: timeSignature,
      instrument: 'Piano',
      tempo: bpm,
      notes: [
        { id: 'note-1', pitch: 60, startTime: 0, duration: 1, velocity: 80 },
        { id: 'note-2', pitch: 64, startTime: 1, duration: 1, velocity: 85 },
        { id: 'note-3', pitch: 67, startTime: 2, duration: 1, velocity: 75 },
        { id: 'note-4', pitch: 72, startTime: 3, duration: 1, velocity: 90 },
      ],
      visible: true
    }
  ]);

  const staffHeight = 100;
  const lineSpacing = 10;
  const noteWidth = 60;

  // Initialize audio context
  useEffect(() => {
    const initAudio = () => {
      if (!audioContext) {
        try {
          const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
          setAudioContext(ctx);
        } catch (error) {
          console.warn('Audio context not available:', error);
        }
      }
    };
    
    const handleClick = () => {
      initAudio();
      document.removeEventListener('click', handleClick);
    };
    
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [audioContext]);

  // Play note function
  const playNote = (note: Note) => {
    if (!audioContext) return;
    
    try {
      const frequency = 440 * Math.pow(2, (note.pitch - 69) / 12);
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
      oscillator.type = 'triangle';
      
      const volume = (note.velocity || 80) / 127 * 0.3;
      gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.warn('Error playing note:', error);
    }
  };





  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isLocked) return;
      
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedNotes.size > 0) {
          setStaffs(prev => prev.map(staff => ({
            ...staff,
            notes: staff.notes.filter(note => !selectedNotes.has(note.id))
          })));
          setSelectedNotes(new Set());
        }
      } else if (e.key === 'Escape') {
        setSelectedNotes(new Set());
        setCurrentTool('select');
      } else if (e.key >= '1' && e.key <= '4') {
        const noteValues = [4, 2, 1, 0.5];
        setNoteValue(noteValues[parseInt(e.key) - 1]);
        setCurrentTool('note');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedNotes, isLocked]);

  return (
    <div className="h-full flex flex-col">


      {/* Main content */}
      <div className="flex-1 flex">
        <div className="flex-1 overflow-auto">
          <canvas className="w-full h-full bg-white" />
        </div>


      </div>
    </div>
  );
}