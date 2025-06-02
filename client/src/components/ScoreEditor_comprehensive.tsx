import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { AudioTrack, TransportState } from '@/types/audio';
import { 
  Play, Pause, Square, Volume2, VolumeX, Edit3, Copy, Settings, 
  ZoomIn, ZoomOut, RotateCcw, Save, FileMusic, Plus, Minus,
  Music, Piano, Drum, Guitar, Mic, Upload, Printer, Undo, Redo
} from 'lucide-react';

interface Note {
  id: string;
  pitch: number;
  startTime: number;
  duration: number;
  velocity?: number;
  accidental?: 'sharp' | 'flat' | 'natural' | 'double-sharp' | 'double-flat';
  tied?: boolean;
  articulation?: 'staccato' | 'accent' | 'tenuto' | 'marcato' | 'fermata';
  ornament?: 'trill' | 'turn' | 'mordent' | 'grace';
  stem?: 'up' | 'down' | 'auto';
}

interface Chord {
  id: string;
  notes: Note[];
  startTime: number;
  duration: number;
}

interface Measure {
  id: string;
  number: number;
  timeSignature?: [number, number];
  keySignature?: string;
  tempo?: number;
  repeatStart?: boolean;
  repeatEnd?: boolean;
  repeatCount?: number;
  barline?: 'single' | 'double' | 'final' | 'repeat-start' | 'repeat-end';
}

interface Staff {
  id: string;
  clef: 'treble' | 'bass' | 'alto' | 'tenor' | 'percussion';
  keySignature: string;
  timeSignature: [number, number];
  notes: Note[];
  chords: Chord[];
  instrument: string;
  dynamics: { time: number; marking: string }[];
  tempo: number;
  measures: Measure[];
  visible: boolean;
  locked: boolean;
  color?: string;
  transpose?: number;
  volume?: number;
  pan?: number;
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
  const [selectedPaletteCategory, setSelectedPaletteCategory] = useState<string>('Notation');
  const [currentTool, setCurrentTool] = useState<'select' | 'note' | 'rest' | 'chord' | 'dynamics' | 'text' | 'slur' | 'tie' | 'beam'>('select');
  const [noteValue, setNoteValue] = useState<number>(1);
  const [currentAccidental, setCurrentAccidental] = useState<'sharp' | 'flat' | 'natural' | 'double-sharp' | 'double-flat' | null>(null);
  const [currentArticulation, setCurrentArticulation] = useState<string | null>(null);
  const [currentTheme, setCurrentTheme] = useState<string>('light');
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragState, setDragState] = useState<{
    noteId: string;
    staffId: string;
    startX: number;
    startY: number;
    originalNote: Note;
  } | null>(null);
  const [editCursor, setEditCursor] = useState<{
    staffIndex: number;
    time: number;
  } | null>(null);
  const [playbackTime, setPlaybackTime] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
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
      chords: [],
      dynamics: [{ time: 0, marking: 'mp' }],
      measures: [
        { id: 'measure-1', number: 1, barline: 'single' },
        { id: 'measure-2', number: 2, barline: 'single' },
        { id: 'measure-3', number: 3, barline: 'single' },
        { id: 'measure-4', number: 4, barline: 'final' }
      ],
      visible: true,
      locked: false,
      volume: 100,
      pan: 0
    }
  ]);

  const scoreCanvasRef = useRef<HTMLCanvasElement>(null);
  const staffHeight = 120;
  const lineSpacing = 12;
  const noteWidth = 40;

  // Theme detection
  useEffect(() => {
    const updateTheme = () => {
      const isDark = document.documentElement.classList.contains('dark');
      setCurrentTheme(isDark ? 'dark' : 'light');
    };
    
    updateTheme();
    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, { 
      attributes: true, 
      attributeFilter: ['class'] 
    });
    
    return () => observer.disconnect();
  }, []);

  // Update staffs when BPM or time signature changes
  useEffect(() => {
    setStaffs(prevStaffs => 
      prevStaffs.map(staff => ({
        ...staff,
        tempo: bpm,
        timeSignature: timeSignature,
      }))
    );
  }, [bpm, timeSignature]);

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
    
    const handleFirstInteraction = () => {
      initAudio();
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
    };
    
    document.addEventListener('click', handleFirstInteraction);
    document.addEventListener('keydown', handleFirstInteraction);
    
    return () => {
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
    };
  }, [audioContext]);

  // Get instrument waveform
  const getInstrumentWaveform = (instrument: string): OscillatorType => {
    const instrumentMap: { [key: string]: OscillatorType } = {
      'Piano': 'triangle',
      'Organ': 'sawtooth',
      'Guitar': 'sawtooth',
      'Violin': 'triangle',
      'Flute': 'sine',
      'Trumpet': 'square',
      'Saxophone': 'sawtooth',
      'Clarinet': 'triangle',
      'Cello': 'sawtooth',
      'Bass': 'triangle',
      'Soprano': 'sine',
      'Alto': 'sine',
      'Tenor': 'triangle',
      'Mixed Choir': 'sine'
    };
    
    return instrumentMap[instrument] || 'triangle';
  };

  // Convert note duration to seconds based on BPM
  const noteDurationToSeconds = (noteDuration: number, currentBpm: number = bpm) => {
    return (noteDuration * 60) / currentBpm;
  };

  // Play a note
  const playNote = (note: Note, instrument: string, duration: number = 0.5) => {
    if (!audioContext) return;
    
    try {
      const frequency = 440 * Math.pow(2, (note.pitch - 69) / 12);
      const waveform = getInstrumentWaveform(instrument);
      
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
      oscillator.type = waveform;
      
      const volume = (note.velocity || 80) / 127 * 0.3;
      gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration);
    } catch (error) {
      console.warn('Error playing note:', error);
    }
  };

  // Canvas drawing function
  const drawScore = useCallback(() => {
    const canvas = scoreCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = Math.max(600, staffs.length * (staffHeight + 60) + 100);

    // Get theme colors
    const isDark = currentTheme === 'dark';
    const backgroundColor = isDark ? '#0a0a0a' : '#ffffff';
    const foregroundColor = isDark ? '#fafafa' : '#0a0a0a';
    const borderColor = isDark ? '#27272a' : '#e4e4e7';

    // Clear canvas
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw each staff
    staffs.forEach((staff, staffIndex) => {
      if (!staff.visible) return;

      const yOffset = staffIndex * (staffHeight + 60) + 40;

      // Draw staff lines
      ctx.strokeStyle = foregroundColor;
      ctx.lineWidth = 1;
      for (let i = 0; i < 5; i++) {
        const y = yOffset + (i * lineSpacing) + 24;
        ctx.beginPath();
        ctx.moveTo(40, y);
        ctx.lineTo(canvas.width - 40, y);
        ctx.stroke();
      }

      // Draw clef
      ctx.font = 'bold 28px serif';
      ctx.fillStyle = foregroundColor;
      if (staff.clef === 'treble') {
        ctx.fillText('𝄞', 45, yOffset + 32);
      } else if (staff.clef === 'bass') {
        ctx.fillText('𝄢', 45, yOffset + 20);
      }

      // Draw time signature
      ctx.font = 'bold 18px serif';
      const timeSigX = 85;
      ctx.fillText(staff.timeSignature[0].toString(), timeSigX, yOffset + 16);
      ctx.fillText(staff.timeSignature[1].toString(), timeSigX, yOffset + 36);

      // Draw notes
      staff.notes.forEach((note) => {
        const x = 140 + (note.startTime * noteWidth * zoomLevel);
        const midiToLine = (pitch: number) => {
          if (staff.clef === 'treble') {
            return 6 - (pitch - 60) / 2;
          } else {
            return (pitch - 40) / 2;
          }
        };
        const line = midiToLine(note.pitch);
        const y = yOffset + (line * lineSpacing / 2) + 24;

        // Note color
        let noteColor = foregroundColor;
        if (selectedNotes.has(note.id)) {
          noteColor = '#3b82f6';
        }

        ctx.fillStyle = noteColor;
        ctx.strokeStyle = noteColor;

        // Draw note head
        ctx.beginPath();
        ctx.ellipse(x, y, 6, 4, 0, 0, 2 * Math.PI);
        if (note.duration >= 2) {
          ctx.stroke();
        } else {
          ctx.fill();
        }

        // Draw stem
        if (note.duration < 4) {
          ctx.lineWidth = 2;
          ctx.beginPath();
          const stemHeight = 24;
          const stemUp = line <= 2;
          if (stemUp) {
            ctx.moveTo(x + 6, y);
            ctx.lineTo(x + 6, y - stemHeight);
          } else {
            ctx.moveTo(x - 6, y);
            ctx.lineTo(x - 6, y + stemHeight);
          }
          ctx.stroke();
        }

        // Draw accidentals
        if (note.accidental) {
          ctx.font = '16px serif';
          const accSymbol = note.accidental === 'sharp' ? '♯' : 
                           note.accidental === 'flat' ? '♭' : '♮';
          ctx.fillText(accSymbol, x - 20, y + 4);
        }
      });

      // Draw instrument name
      ctx.font = '12px sans-serif';
      ctx.fillStyle = isDark ? '#a1a1aa' : '#71717a';
      ctx.fillText(staff.instrument, 10, yOffset - 10);
      ctx.fillText(`♩ = ${staff.tempo}`, 10, yOffset - 25);
    });
  }, [staffs, selectedNotes, zoomLevel, currentTheme, bpm]);

  // Redraw when state changes
  useEffect(() => {
    drawScore();
  }, [drawScore]);

  // Helper functions
  const pixelToMusicalPosition = (x: number, y: number, staffIndex: number, staffId: string) => {
    const time = Math.max(0, (x - 140) / (noteWidth * zoomLevel));
    const staff = staffs.find(s => s.id === staffId);
    if (!staff) return null;

    const staffY = staffIndex * (staffHeight + 60) + 40;
    const relativePitch = Math.round((staffY + 60 - y) / (lineSpacing / 2));
    const pitch = staff.clef === 'treble' ? 60 + relativePitch : 40 + relativePitch;

    return {
      time: Math.round(time * 4) / 4, // Snap to quarter beats
      pitch: Math.max(21, Math.min(108, pitch))
    };
  };

  const getNoteAtPosition = (x: number, y: number, staffIndex: number): { note: Note; staffId: string } | null => {
    const staff = staffs[staffIndex];
    if (!staff) return null;

    const staffY = staffIndex * (staffHeight + 60) + 40;
    
    for (const note of staff.notes) {
      const noteX = 140 + (note.startTime * noteWidth * zoomLevel);
      const midiToLine = (pitch: number) => {
        if (staff.clef === 'treble') {
          return 6 - (pitch - 60) / 2;
        } else {
          return (pitch - 40) / 2;
        }
      };
      const line = midiToLine(note.pitch);
      const noteY = staffY + (line * lineSpacing / 2) + 24;
      
      if (Math.abs(x - noteX) <= 12 && Math.abs(y - noteY) <= 8) {
        return { note, staffId: staff.id };
      }
    }
    return null;
  };

  // Mouse handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isLocked) return;

    const canvas = scoreCanvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const staffIndex = Math.floor((y - 40) / (staffHeight + 60));
    if (staffIndex >= 0 && staffIndex < staffs.length) {
      const staff = staffs[staffIndex];
      const clickedNote = getNoteAtPosition(x, y, staffIndex);

      if (clickedNote && currentTool === 'select') {
        // Start dragging note
        if (e.ctrlKey || e.metaKey) {
          // Multi-select
          setSelectedNotes(prev => {
            const newSet = new Set(prev);
            if (newSet.has(clickedNote.note.id)) {
              newSet.delete(clickedNote.note.id);
            } else {
              newSet.add(clickedNote.note.id);
            }
            return newSet;
          });
        } else {
          setSelectedNotes(new Set([clickedNote.note.id]));
          // Play the clicked note
          const noteDurationInSeconds = noteDurationToSeconds(clickedNote.note.duration);
          playNote(clickedNote.note, staff.instrument, noteDurationInSeconds);
        }

        // Start drag
        setIsDragging(true);
        setDragState({
          noteId: clickedNote.note.id,
          staffId: clickedNote.staffId,
          startX: x,
          startY: y,
          originalNote: { ...clickedNote.note }
        });
      } else if (!clickedNote && currentTool === 'note') {
        // Add new note
        const musicalPos = pixelToMusicalPosition(x, y, staffIndex, staff.id);
        if (musicalPos) {
          const newNote: Note = {
            id: `note-${Date.now()}`,
            pitch: musicalPos.pitch,
            startTime: musicalPos.time,
            duration: noteValue,
            velocity: 80,
            accidental: currentAccidental || undefined,
            articulation: currentArticulation as any || undefined
          };

          // Play the note
          const noteDurationInSeconds = noteDurationToSeconds(newNote.duration);
          playNote(newNote, staff.instrument, noteDurationInSeconds);

          setStaffs(prev => prev.map(s => 
            s.id === staff.id 
              ? { ...s, notes: [...s.notes, newNote].sort((a, b) => a.startTime - b.startTime) }
              : s
          ));
        }
      } else if (!clickedNote && currentTool === 'select') {
        // Clear selection
        setSelectedNotes(new Set());
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !dragState || isLocked) return;

    const canvas = scoreCanvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const staffIndex = Math.floor((y - 40) / (staffHeight + 60));
    if (staffIndex >= 0 && staffIndex < staffs.length) {
      const targetStaff = staffs[staffIndex];
      const musicalPos = pixelToMusicalPosition(x, y, staffIndex, targetStaff.id);
      
      if (musicalPos) {
        // Update note position
        setStaffs(prev => prev.map(staff => ({
          ...staff,
          notes: staff.notes.map(note => 
            note.id === dragState.noteId
              ? { ...note, startTime: musicalPos.time, pitch: musicalPos.pitch }
              : note
          )
        })));
      }
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging && dragState) {
      setIsDragging(false);
      setDragState(null);
    }
  };

  const handleDoubleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isLocked) return;

    const canvas = scoreCanvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const staffIndex = Math.floor((y - 40) / (staffHeight + 60));
    if (staffIndex >= 0 && staffIndex < staffs.length) {
      const clickedNote = getNoteAtPosition(x, y, staffIndex);
      
      if (clickedNote) {
        // Cycle through note durations
        const durations = [4, 2, 1, 0.5, 0.25];
        const currentIndex = durations.indexOf(clickedNote.note.duration);
        const nextDuration = durations[(currentIndex + 1) % durations.length];
        
        const staff = staffs.find(s => s.id === clickedNote.staffId);
        if (staff) {
          const updatedNote = { ...clickedNote.note, duration: nextDuration };
          const noteDurationInSeconds = noteDurationToSeconds(nextDuration);
          playNote(updatedNote, staff.instrument, noteDurationInSeconds);
        }
        
        setStaffs(prev => prev.map(staff => ({
          ...staff,
          notes: staff.notes.map(note => 
            note.id === clickedNote.note.id
              ? { ...note, duration: nextDuration }
              : note
          )
        })));
      }
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
      } else if (e.key >= '1' && e.key <= '5') {
        const noteValues = [4, 2, 1, 0.5, 0.25];
        setNoteValue(noteValues[parseInt(e.key) - 1]);
        setCurrentTool('note');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedNotes, isLocked]);

  // Transport integration
  useEffect(() => {
    setIsPlaying(transport.isPlaying);
    setPlaybackTime(transport.isPlaying ? transport.currentTime : null);
  }, [transport.isPlaying, transport.currentTime]);

  return (
    <div className="h-full flex flex-col bg-[var(--background)]">
      {/* Professional Control Palette */}
      <div className="border-b border-[var(--border)] bg-[var(--background)]">
        {/* Category Tabs */}
        <div className="h-10 px-3 flex items-center border-b border-[var(--border)]">
          {['Notation', 'Symbols', 'Dynamics', 'Structure', 'Playback'].map((category) => (
            <Button
              key={category}
              variant="ghost"
              size="sm"
              className={`h-8 px-3 rounded-t-md rounded-b-none ${
                selectedPaletteCategory === category 
                  ? 'bg-[var(--accent)] border-b-2 border-[var(--primary)]' 
                  : 'hover:bg-[var(--accent)]'
              }`}
              onClick={() => setSelectedPaletteCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Control Palette Content */}
        <div className="h-16 px-3 flex items-center overflow-x-auto">
          {selectedPaletteCategory === 'Notation' && (
            <div className="flex items-center space-x-2">
              {/* Clef Selection */}
              <div className="flex items-center space-x-1 pr-3 border-r border-[var(--border)]">
                <span className="text-xs text-[var(--muted-foreground)]">Clef:</span>
                {[
                  { type: 'treble', symbol: '𝄞', name: 'Treble' },
                  { type: 'bass', symbol: '𝄢', name: 'Bass' },
                  { type: 'alto', symbol: '𝄡', name: 'Alto' },
                  { type: 'tenor', symbol: '𝄡', name: 'Tenor' }
                ].map((clef) => (
                  <Button
                    key={clef.type}
                    variant="ghost"
                    size="sm"
                    className="h-10 w-10 p-0 text-lg"
                    title={clef.name}
                    onClick={() => {
                      if (selectedStaff) {
                        setStaffs(prev => prev.map(s => 
                          s.id === selectedStaff ? { ...s, clef: clef.type as any } : s
                        ));
                      }
                    }}
                  >
                    {clef.symbol}
                  </Button>
                ))}
              </div>

              {/* Key Signatures */}
              <div className="flex items-center space-x-1 pr-3 border-r border-[var(--border)]">
                <span className="text-xs text-[var(--muted-foreground)]">Key:</span>
                <select
                  value={selectedStaff ? staffs.find(s => s.id === selectedStaff)?.keySignature || 'C' : 'C'}
                  onChange={(e) => {
                    if (selectedStaff) {
                      setStaffs(prev => prev.map(s => 
                        s.id === selectedStaff ? { ...s, keySignature: e.target.value } : s
                      ));
                    }
                  }}
                  className="h-8 px-2 bg-[var(--background)] border border-[var(--border)] rounded text-sm"
                >
                  <option value="C">C Major</option>
                  <option value="G">G Major</option>
                  <option value="D">D Major</option>
                  <option value="A">A Major</option>
                  <option value="E">E Major</option>
                  <option value="B">B Major</option>
                  <option value="F#">F# Major</option>
                  <option value="C#">C# Major</option>
                  <option value="F">F Major</option>
                  <option value="Bb">Bb Major</option>
                  <option value="Eb">Eb Major</option>
                  <option value="Ab">Ab Major</option>
                </select>
              </div>

              {/* Time Signatures */}
              <div className="flex items-center space-x-1 pr-3 border-r border-[var(--border)]">
                <span className="text-xs text-[var(--muted-foreground)]">Time:</span>
                {[
                  [4, 4], [3, 4], [2, 4], [6, 8], [9, 8], [12, 8]
                ].map((timeSig) => (
                  <Button
                    key={`${timeSig[0]}-${timeSig[1]}`}
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-xs"
                    title={`${timeSig[0]}/${timeSig[1]}`}
                    onClick={() => {
                      if (selectedStaff) {
                        setStaffs(prev => prev.map(s => 
                          s.id === selectedStaff ? { ...s, timeSignature: timeSig as [number, number] } : s
                        ));
                      }
                    }}
                  >
                    <div className="text-center leading-tight">
                      <div>{timeSig[0]}</div>
                      <div>{timeSig[1]}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {selectedPaletteCategory === 'Symbols' && (
            <div className="flex items-center space-x-2">
              {/* Note Values */}
              <div className="flex items-center space-x-1 pr-3 border-r border-[var(--border)]">
                <span className="text-xs text-[var(--muted-foreground)]">Notes:</span>
                {[
                  { value: 4, symbol: '𝅝', name: 'Whole Note' },
                  { value: 2, symbol: '𝅗𝅥', name: 'Half Note' },
                  { value: 1, symbol: '♩', name: 'Quarter Note' },
                  { value: 0.5, symbol: '♪', name: 'Eighth Note' },
                  { value: 0.25, symbol: '♬', name: 'Sixteenth Note' }
                ].map((note) => (
                  <Button
                    key={note.value}
                    variant="ghost"
                    size="sm"
                    className={`h-10 w-10 p-0 text-lg ${noteValue === note.value ? 'bg-[var(--accent)]' : ''}`}
                    title={note.name}
                    onClick={() => {
                      setNoteValue(note.value);
                      setCurrentTool('note');
                    }}
                  >
                    {note.symbol}
                  </Button>
                ))}
              </div>

              {/* Accidentals */}
              <div className="flex items-center space-x-1 pr-3 border-r border-[var(--border)]">
                <span className="text-xs text-[var(--muted-foreground)]">Accidentals:</span>
                {[
                  { type: 'sharp', symbol: '♯', name: 'Sharp' },
                  { type: 'flat', symbol: '♭', name: 'Flat' },
                  { type: 'natural', symbol: '♮', name: 'Natural' }
                ].map((acc) => (
                  <Button
                    key={acc.type}
                    variant="ghost"
                    size="sm"
                    className={`h-10 w-10 p-0 text-lg ${currentAccidental === acc.type ? 'bg-[var(--accent)]' : ''}`}
                    title={acc.name}
                    onClick={() => setCurrentAccidental(acc.type as any)}
                  >
                    {acc.symbol}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {selectedPaletteCategory === 'Playback' && (
            <div className="flex items-center space-x-2">
              {/* Virtual Instruments */}
              <div className="flex items-center space-x-1 pr-3 border-r border-[var(--border)]">
                <span className="text-xs text-[var(--muted-foreground)]">Instruments:</span>
                <select
                  value={selectedStaff ? staffs.find(s => s.id === selectedStaff)?.instrument || 'Piano' : 'Piano'}
                  onChange={(e) => {
                    if (selectedStaff) {
                      setStaffs(prev => prev.map(s => 
                        s.id === selectedStaff ? { ...s, instrument: e.target.value } : s
                      ));
                    }
                  }}
                  className="h-8 px-2 bg-[var(--background)] border border-[var(--border)] rounded text-sm"
                >
                  <optgroup label="Piano">
                    <option value="Piano">Grand Piano</option>
                    <option value="Electric Piano">Electric Piano</option>
                    <option value="Harpsichord">Harpsichord</option>
                  </optgroup>
                  <optgroup label="Strings">
                    <option value="Violin">Violin</option>
                    <option value="Viola">Viola</option>
                    <option value="Cello">Cello</option>
                    <option value="Double Bass">Double Bass</option>
                    <option value="Guitar">Guitar</option>
                  </optgroup>
                  <optgroup label="Woodwinds">
                    <option value="Flute">Flute</option>
                    <option value="Clarinet">Clarinet</option>
                    <option value="Oboe">Oboe</option>
                    <option value="Saxophone">Saxophone</option>
                  </optgroup>
                  <optgroup label="Brass">
                    <option value="Trumpet">Trumpet</option>
                    <option value="French Horn">French Horn</option>
                    <option value="Trombone">Trombone</option>
                    <option value="Tuba">Tuba</option>
                  </optgroup>
                  <optgroup label="Choir">
                    <option value="Soprano">Soprano</option>
                    <option value="Alto">Alto</option>
                    <option value="Tenor">Tenor</option>
                    <option value="Bass">Bass</option>
                    <option value="Mixed Choir">Mixed Choir</option>
                  </optgroup>
                </select>
              </div>

              {/* Tempo Display */}
              <div className="flex items-center space-x-1">
                <span className="text-xs text-[var(--muted-foreground)]">Tempo:</span>
                <span className="text-sm font-mono">{bpm} BPM</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 overflow-auto">
          <canvas
            ref={scoreCanvasRef}
            className="w-full h-full cursor-crosshair"
            style={{ minHeight: '600px' }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onDoubleClick={handleDoubleClick}
          />
        </div>

        {/* Staff Management Sidebar */}
        <div className="w-64 border-l border-[var(--border)] bg-[var(--muted)] p-4 overflow-y-auto">
          <h3 className="text-sm font-semibold text-[var(--foreground)] mb-3">Score Properties</h3>
          
          <div className="space-y-2 mb-4">
            <h4 className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wide">Staffs</h4>
            {staffs.map((staff) => (
              <div
                key={staff.id}
                className={`p-3 rounded border cursor-pointer transition-colors ${
                  selectedStaff === staff.id
                    ? 'border-[var(--primary)] bg-[var(--primary)]/10'
                    : 'border-[var(--border)] hover:bg-[var(--accent)]'
                }`}
                onClick={() => setSelectedStaff(staff.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-sm font-medium">{staff.instrument}</div>
                    <div className="text-xs text-[var(--muted-foreground)]">
                      {staff.clef} • {staff.keySignature} • {staff.timeSignature[0]}/{staff.timeSignature[1]}
                    </div>
                    <div className="text-xs text-[var(--muted-foreground)] mt-1">
                      {staff.notes.length} notes • ♩ = {staff.tempo}
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        onTrackMute(staff.id);
                      }}
                      title="Mute"
                    >
                      <VolumeX className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        onTrackSolo(staff.id);
                      }}
                      title="Solo"
                    >
                      <Volume2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => {
              const newStaff: Staff = {
                id: `staff-${Date.now()}`,
                clef: 'treble',
                keySignature: 'C',
                timeSignature: timeSignature,
                instrument: 'New Staff',
                tempo: bpm,
                notes: [],
                chords: [],
                dynamics: [],
                measures: [
                  { id: `measure-${Date.now()}-1`, number: 1, barline: 'single' }
                ],
                visible: true,
                locked: false,
                volume: 100,
                pan: 0
              };
              setStaffs(prev => [...prev, newStaff]);
            }}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Staff
          </Button>
        </div>
      </div>
    </div>
  );
}