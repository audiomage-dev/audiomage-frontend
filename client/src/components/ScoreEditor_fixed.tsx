import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AudioTrack, TransportState } from '@/types/audio';
import { 
  Play, Pause, Square, Volume2, VolumeX, Edit3, Copy, Settings, 
  ZoomIn, ZoomOut, RotateCcw, Save, FileMusic, Plus, Minus,
  Music, Piano, Drum, Guitar, Mic, Download, Upload, Printer,
  Undo, Redo, Type, MousePointer, Hand, Scissors, MoreHorizontal,
  AlignLeft, AlignCenter, AlignRight, Bold, Italic, Underline,
  Palette, Layout, Grid, Eye, EyeOff, Lock, Unlock
} from 'lucide-react';

interface Note {
  id: string;
  pitch: number; // MIDI note number (0-127)
  startTime: number; // Start time in beats
  duration: number; // Duration in beats (4 = whole note, 2 = half note, 1 = quarter note, etc.)
  accidental?: 'sharp' | 'flat' | 'natural' | 'double-sharp' | 'double-flat';
  tied?: boolean;
  velocity?: number; // 0-127
  articulation?: 'staccato' | 'accent' | 'tenuto' | 'marcato' | 'fermata' | 'staccatissimo' | 'sforzando';
  ornament?: 'trill' | 'turn' | 'mordent' | 'grace' | 'appoggiatura' | 'acciaccatura';
  stem?: 'up' | 'down' | 'auto';
  beaming?: 'start' | 'continue' | 'end' | 'none';
  lyrics?: string[];
  color?: string;
  hidden?: boolean;
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
  const [isDragging, setIsDragging] = useState(false);
  const [dragState, setDragState] = useState<{
    noteId: string;
    staffId: string;
    startX: number;
    startY: number;
    originalNote: Note;
  } | null>(null);
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
      dynamics: [
        { time: 0, marking: 'mp' }
      ],
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
  const [currentTool, setCurrentTool] = useState<'select' | 'note' | 'rest' | 'chord' | 'dynamics' | 'text' | 'slur' | 'tie' | 'beam'>('select');
  const [noteValue, setNoteValue] = useState<number>(1);
  const [playbackPosition, setPlaybackPosition] = useState(0);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [viewMode, setViewMode] = useState<'page' | 'continuous' | 'single'>('page');
  const [showGrid, setShowGrid] = useState(false);
  const [showMeasureNumbers, setShowMeasureNumbers] = useState(true);
  const [showInstrumentNames, setShowInstrumentNames] = useState(true);
  const [currentAccidental, setCurrentAccidental] = useState<'sharp' | 'flat' | 'natural' | 'double-sharp' | 'double-flat' | null>(null);
  const [currentArticulation, setCurrentArticulation] = useState<string | null>(null);
  const [undoHistory, setUndoHistory] = useState<Staff[][]>([]);
  const [redoHistory, setRedoHistory] = useState<Staff[][]>([]);
  const [clipboard, setClipboard] = useState<Note[]>([]);
  const [currentTheme, setCurrentTheme] = useState<string>('light');
  
  const scoreCanvasRef = useRef<HTMLCanvasElement>(null);
  const staffHeight = 120;
  const lineSpacing = 12;
  const noteWidth = 40;

  // Theme change detection
  useEffect(() => {
    const updateTheme = () => {
      const isDark = document.documentElement.classList.contains('dark');
      const theme = isDark ? 'dark' : 'light';
      setCurrentTheme(theme);
    };
    
    updateTheme();
    
    // Listen for theme changes
    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, { 
      attributes: true, 
      attributeFilter: ['class'] 
    });
    
    return () => observer.disconnect();
  }, []);

  // Update staffs when BPM or time signature changes from metronome
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
    
    // Initialize on first user interaction
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

  // Get instrument waveform based on staff instrument
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
      'Bass': 'triangle'
    };
    
    return instrumentMap[instrument] || 'triangle';
  };

  // Convert note duration to seconds based on current BPM
  const noteDurationToSeconds = (noteDuration: number, bpm: number = 120) => {
    // Note duration is in beats (4 = whole note, 1 = quarter note, etc.)
    // At 120 BPM, a quarter note = 0.5 seconds
    return (noteDuration * 60) / bpm;
  };

  // Play a single note with instrument-specific sound
  const playNote = (note: Note, instrument: string, duration: number = 0.5) => {
    if (!audioContext) return;
    
    try {
      const frequency = 440 * Math.pow(2, (note.pitch - 69) / 12); // A4 = 440Hz
      const waveform = getInstrumentWaveform(instrument);
      
      // Create oscillator for the note
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Set waveform and frequency
      oscillator.type = waveform;
      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
      
      // Set volume based on note velocity
      const velocity = (note.velocity || 80) / 127;
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(velocity * 0.3, audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
      
      // Apply instrument-specific envelope
      if (instrument.includes('Piano')) {
        // Piano has quick attack, slower decay
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(velocity * 0.4, audioContext.currentTime + 0.005);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration * 0.8);
      } else if (instrument.includes('Organ')) {
        // Organ has sustained tone
        gainNode.gain.setValueAtTime(velocity * 0.25, audioContext.currentTime);
        gainNode.gain.setValueAtTime(velocity * 0.25, audioContext.currentTime + duration * 0.9);
        gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + duration);
      } else if (instrument.includes('Violin') || instrument.includes('Cello')) {
        // Strings have gradual attack
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(velocity * 0.3, audioContext.currentTime + 0.1);
        gainNode.gain.setValueAtTime(velocity * 0.3, audioContext.currentTime + duration * 0.7);
        gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + duration);
      }
      
      // Start and stop the oscillator
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration);
      
    } catch (error) {
      console.warn('Error playing note:', error);
    }
  };

  // Check if click is on a note
  const getNoteAtPosition = (x: number, y: number, staffIndex: number): { note: Note; staffId: string } | null => {
    const staff = staffs[staffIndex];
    if (!staff) return null;
    
    const yOffset = staffIndex * (staffHeight + 60) + 40;
    
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
      const noteY = yOffset + (line * lineSpacing / 2) + 24;
      
      // Check if click is within note bounds
      if (Math.abs(x - noteX) <= 12 && Math.abs(y - noteY) <= 10) {
        return { note, staffId: staff.id };
      }
    }
    return null;
  };

  // Convert pixel position to musical position
  const pixelToMusicalPosition = (x: number, y: number, staffIndex: number, staffId: string) => {
    const staff = staffs.find(s => s.id === staffId);
    if (!staff) return null;
    
    const time = Math.max(0, (x - 140) / (noteWidth * zoomLevel));
    const yOffset = staffIndex * (staffHeight + 60) + 40;
    const relativeY = y - yOffset;
    const line = Math.round((relativeY - 24) / (lineSpacing / 2));
    
    let midiNote: number;
    if (staff.clef === 'treble') {
      midiNote = 72 - line;
    } else {
      midiNote = 50 - line;
    }
    
    return {
      time: Math.round(time * 4) / 4, // Quantize to 16th notes
      pitch: Math.max(0, Math.min(127, midiNote))
    };
  };

  // Enhanced musical notation rendering
  const drawScore = () => {
    const canvas = scoreCanvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    
    ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
    
    // Dynamic background based on theme
    const backgroundColor = getComputedStyle(document.documentElement).getPropertyValue('--background').trim() || '#ffffff';
    const foregroundColor = getComputedStyle(document.documentElement).getPropertyValue('--foreground').trim() || '#000000';
    const mutedColor = getComputedStyle(document.documentElement).getPropertyValue('--muted-foreground').trim() || '#666666';
    const borderColor = getComputedStyle(document.documentElement).getPropertyValue('--border').trim() || '#e5e5e5';
    
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
    
    staffs.forEach((staff, staffIndex) => {
      if (!staff.visible) return;
      
      const yOffset = staffIndex * (staffHeight + 60) + 40;
      
      // Draw staff lines with theme-aware colors
      ctx.strokeStyle = foregroundColor;
      ctx.lineWidth = 1.2;
      
      for (let i = 0; i < 5; i++) {
        const y = Math.floor(yOffset + i * lineSpacing) + 0.5; // Anti-aliasing
        ctx.beginPath();
        ctx.moveTo(40, y);
        ctx.lineTo(canvas.offsetWidth - 280, y);
        ctx.stroke();
      }
      
      // Draw ledger lines for notes outside staff
      staff.notes.forEach((note) => {
        const x = 140 + (note.startTime * noteWidth * zoomLevel);
        const midiToLine = (pitch: number) => {
          if (staff.clef === 'treble') {
            return 6 - (pitch - 60) / 2;
          } else {
            return 10 - (pitch - 48) / 2;
          }
        };
        
        const line = midiToLine(note.pitch);
        const noteY = yOffset + (line - 2) * (lineSpacing / 2);
        
        // Draw ledger lines above staff
        if (line < 0) {
          for (let ledger = -1; ledger >= line; ledger -= 2) {
            if (ledger % 2 === 1) {
              const ledgerY = Math.floor(yOffset + (ledger - 2) * (lineSpacing / 2)) + 0.5;
              ctx.beginPath();
              ctx.moveTo(x - 8, ledgerY);
              ctx.lineTo(x + 8, ledgerY);
              ctx.stroke();
            }
          }
        }
        
        // Draw ledger lines below staff
        if (line > 8) {
          for (let ledger = 9; ledger <= line; ledger += 2) {
            if (ledger % 2 === 1) {
              const ledgerY = Math.floor(yOffset + (ledger - 2) * (lineSpacing / 2)) + 0.5;
              ctx.beginPath();
              ctx.moveTo(x - 8, ledgerY);
              ctx.lineTo(x + 8, ledgerY);
              ctx.stroke();
            }
          }
        }
      });
      
      // Draw measure lines and grid
      const measureWidth = noteWidth * 4 * zoomLevel;
      const totalMeasures = Math.ceil((canvas.offsetWidth - 320) / measureWidth);
      
      for (let m = 0; m <= totalMeasures; m++) {
        const measureX = 140 + (m * measureWidth);
        if (measureX > canvas.offsetWidth - 280) break;
        
        // Draw measure line with theme colors
        ctx.strokeStyle = m === 0 ? foregroundColor : borderColor;
        ctx.lineWidth = m === 0 ? 2 : 1;
        ctx.beginPath();
        ctx.moveTo(measureX, yOffset);
        ctx.lineTo(measureX, yOffset + (4 * lineSpacing));
        ctx.stroke();
        
        // Draw measure numbers if enabled
        if (showMeasureNumbers && m > 0 && staffIndex === 0) {
          ctx.fillStyle = mutedColor;
          ctx.font = '11px sans-serif';
          ctx.fillText(m.toString(), measureX + 4, yOffset - 8);
        }
      }
      
      // Draw grid if enabled with theme awareness
      if (showGrid) {
        ctx.strokeStyle = borderColor + '40'; // Semi-transparent
        ctx.lineWidth = 0.5;
        ctx.setLineDash([1, 2]);
        
        // Vertical grid lines for beat divisions
        for (let beat = 0; beat < totalMeasures * 4; beat++) {
          const beatX = 140 + (beat * noteWidth * zoomLevel);
          if (beatX > canvas.offsetWidth - 280) break;
          
          ctx.beginPath();
          ctx.moveTo(beatX, yOffset);
          ctx.lineTo(beatX, yOffset + (4 * lineSpacing));
          ctx.stroke();
        }
        
        ctx.setLineDash([]);
      }
      
      // Draw clef with theme colors
      ctx.font = 'bold 28px serif';
      ctx.fillStyle = foregroundColor;
      if (staff.clef === 'treble') {
        ctx.fillText('𝄞', 45, yOffset + 32);
      } else if (staff.clef === 'bass') {
        ctx.fillText('𝄢', 45, yOffset + 20);
      }
      
      // Draw time signature
      ctx.font = 'bold 18px serif';
      ctx.fillStyle = foregroundColor;
      const timeSigX = 85;
      ctx.fillText(staff.timeSignature[0].toString(), timeSigX, yOffset + 16);
      ctx.fillText(staff.timeSignature[1].toString(), timeSigX, yOffset + 36);
      
      // Draw instrument name and tempo if enabled
      if (showInstrumentNames) {
        ctx.font = '12px sans-serif';
        ctx.fillStyle = mutedColor;
        ctx.fillText(staff.instrument, 10, yOffset - 10);
        ctx.fillText(`♩ = ${staff.tempo}`, 10, yOffset - 25);
      }
      
      // Draw notes with theme-aware styling
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
        
        // Determine note color based on state with theme awareness
        let noteColor = foregroundColor;
        if (selectedNotes.has(note.id)) {
          noteColor = '#3b82f6'; // Blue for selected notes
        } else if (dragState && dragState.noteId === note.id) {
          noteColor = '#ef4444'; // Red during drag
        }
        
        // Enhanced note head rendering with professional styling
        ctx.fillStyle = noteColor;
        ctx.strokeStyle = noteColor;
        ctx.beginPath();
        
        // Add slight glow effect for selected/dragged notes
        if (selectedNotes.has(note.id) || (dragState && dragState.noteId === note.id)) {
          ctx.shadowColor = noteColor;
          ctx.shadowBlur = 3;
        } else {
          ctx.shadowBlur = 0;
        }
        
        // Professional note head rendering with proper proportions
        const noteHeadWidth = 8;
        const noteHeadHeight = 6;
        
        // Apply subtle rotation for more natural appearance
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(-0.2); // Slight slant like real notation
        
        if (note.duration >= 2) {
          // Whole and half notes (hollow with thicker outline)
          ctx.beginPath();
          ctx.ellipse(0, 0, noteHeadWidth, noteHeadHeight, 0, 0, 2 * Math.PI);
          ctx.lineWidth = 1.8;
          ctx.stroke();
        } else {
          // Quarter notes and shorter (filled with smooth edges)
          ctx.beginPath();
          ctx.ellipse(0, 0, noteHeadWidth, noteHeadHeight, 0, 0, 2 * Math.PI);
          ctx.fill();
        }
        
        ctx.restore();
        
        // Draw accidentals
        if (note.accidental) {
          ctx.font = '16px serif';
          ctx.fillStyle = noteColor;
          let accSymbol = '';
          switch (note.accidental) {
            case 'sharp': accSymbol = '♯'; break;
            case 'flat': accSymbol = '♭'; break;
            case 'natural': accSymbol = '♮'; break;
            case 'double-sharp': accSymbol = '𝄪'; break;
            case 'double-flat': accSymbol = '𝄫'; break;
          }
          ctx.fillText(accSymbol, x - 20, y + 4);
        }
        
        // Reset shadow
        ctx.shadowBlur = 0;
        
        // Draw stem with professional proportions
        if (note.duration <= 2 && note.duration >= 0.25) {
          ctx.strokeStyle = noteColor;
          ctx.lineWidth = 2.2;
          ctx.lineCap = 'round';
          
          const stemDirection = line <= 2 ? 1 : -1;
          const stemLength = 32;
          const stemX = x + (stemDirection > 0 ? 8 : -8);
          
          ctx.beginPath();
          ctx.moveTo(stemX, y);
          ctx.lineTo(stemX, y + (stemDirection * -stemLength));
          ctx.stroke();
          
          // Enhanced beam/flag rendering
          if (note.duration < 1) {
            ctx.lineWidth = 3;
            const beamY = y + (stemDirection * -stemLength) + (stemDirection > 0 ? 3 : -3);
            
            if (note.duration === 0.5) {
              // Eighth note beam
              ctx.beginPath();
              ctx.moveTo(stemX, beamY);
              ctx.lineTo(stemX + 16, beamY + 2);
              ctx.lineTo(stemX + 16, beamY + 6);
              ctx.lineTo(stemX, beamY + 4);
              ctx.closePath();
              ctx.fill();
            } else if (note.duration === 0.25) {
              // Sixteenth note double beam
              ctx.beginPath();
              ctx.moveTo(stemX, beamY);
              ctx.lineTo(stemX + 16, beamY + 2);
              ctx.lineTo(stemX + 16, beamY + 5);
              ctx.lineTo(stemX, beamY + 3);
              ctx.closePath();
              ctx.fill();
              
              // Second beam
              ctx.beginPath();
              ctx.moveTo(stemX, beamY + 6);
              ctx.lineTo(stemX + 16, beamY + 8);
              ctx.lineTo(stemX + 16, beamY + 11);
              ctx.lineTo(stemX, beamY + 9);
              ctx.closePath();
              ctx.fill();
            }
          }
        }
        
        // Draw articulations
        if (note.articulation) {
          ctx.font = '12px serif';
          ctx.fillStyle = noteColor;
          const artY = line <= 2 ? y + 20 : y - 15;
          let artSymbol = '';
          
          switch (note.articulation) {
            case 'staccato': artSymbol = '·'; break;
            case 'accent': artSymbol = '>'; break;
            case 'tenuto': artSymbol = '—'; break;
            case 'marcato': artSymbol = '^'; break;
            case 'fermata': artSymbol = '𝄐'; break;
            case 'staccatissimo': artSymbol = '▼'; break;
            case 'sforzando': artSymbol = 'sf'; break;
          }
          
          const artWidth = ctx.measureText(artSymbol).width;
          ctx.fillText(artSymbol, x - artWidth / 2, artY);
        }
        
        // Draw selection outline for selected notes
        if (selectedNotes.has(note.id)) {
          ctx.strokeStyle = '#3b82f6';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([3, 3]);
          ctx.strokeRect(x - 14, y - 14, 28, 28);
          ctx.setLineDash([]);
        }
      });
      
      // Draw playback cursor
      if (transport.isPlaying) {
        const cursorX = 140 + (playbackPosition * noteWidth * zoomLevel);
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cursorX, yOffset - 10);
        ctx.lineTo(cursorX, yOffset + staffHeight + 10);
        ctx.stroke();
      }
    });
  };

  // Handle mouse down for note dragging and selection
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
      setSelectedStaff(staff.id);
      
      // Check if clicking on an existing note
      const clickedNote = getNoteAtPosition(x, y, staffIndex);
      
      if (clickedNote && currentTool === 'select') {
        // Play the note when clicked for its actual duration
        const staff = staffs.find(s => s.id === clickedNote.staffId);
        if (staff) {
          const noteDurationInSeconds = noteDurationToSeconds(clickedNote.note.duration);
          playNote(clickedNote.note, staff.instrument, noteDurationInSeconds);
        }
        
        // Start dragging the note
        setIsDragging(true);
        setDragState({
          noteId: clickedNote.note.id,
          staffId: clickedNote.staffId,
          startX: x,
          startY: y,
          originalNote: { ...clickedNote.note }
        });
        
        // Select the note
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
        }
      } else if (!clickedNote && currentTool === 'note') {
        // Add a new note with enhanced properties
        const musicalPos = pixelToMusicalPosition(x, y, staffIndex, staff.id);
        if (musicalPos) {
          // Add to undo history before making changes
          setUndoHistory(prev => [...prev, staffs]);
          setRedoHistory([]);
          
          const newNote: Note = {
            id: `note-${Date.now()}`,
            pitch: musicalPos.pitch,
            startTime: musicalPos.time,
            duration: noteValue,
            velocity: 80,
            accidental: currentAccidental || undefined,
            articulation: currentArticulation as any || undefined,
            stem: 'auto'
          };
          
          // Play the newly created note for its actual duration
          const noteDurationInSeconds = noteDurationToSeconds(newNote.duration);
          playNote(newNote, staff.instrument, noteDurationInSeconds);
          
          setStaffs(prev => prev.map(s => 
            s.id === staff.id 
              ? { ...s, notes: [...s.notes, newNote].sort((a, b) => a.startTime - b.startTime) }
              : s
          ));
        }
      } else if (!clickedNote && currentTool === 'select') {
        // Clear selection when clicking empty space
        setSelectedNotes(new Set());
      }
    }
  };

  // Handle mouse move for note dragging
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !dragState || isLocked) return;
    
    const canvas = scoreCanvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Find which staff the mouse is over
    const staffIndex = Math.floor((y - 40) / (staffHeight + 60));
    if (staffIndex >= 0 && staffIndex < staffs.length) {
      const targetStaff = staffs[staffIndex];
      const musicalPos = pixelToMusicalPosition(x, y, staffIndex, targetStaff.id);
      
      if (musicalPos) {
        // Update the note position in real-time
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

  // Handle mouse up to finish dragging
  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging && dragState) {
      setIsDragging(false);
      setDragState(null);
    }
  };

  // Handle double-click for note editing
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
        // Open note properties dialog (for now, cycle through durations)
        const durations = [4, 2, 1, 0.5, 0.25];
        const currentIndex = durations.indexOf(clickedNote.note.duration);
        const nextDuration = durations[(currentIndex + 1) % durations.length];
        
        // Play the note with its new duration
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

  // Update playback position
  useEffect(() => {
    if (transport.isPlaying) {
      const interval = setInterval(() => {
        setPlaybackPosition(prev => prev + 0.1);
      }, 100);
      return () => clearInterval(interval);
    }
  }, [transport.isPlaying]);

  // Handle keyboard shortcuts for note operations
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isLocked) return;
      
      if (e.key === 'Delete' || e.key === 'Backspace') {
        // Delete selected notes
        if (selectedNotes.size > 0) {
          setStaffs(prev => prev.map(staff => ({
            ...staff,
            notes: staff.notes.filter(note => !selectedNotes.has(note.id))
          })));
          setSelectedNotes(new Set());
        }
      } else if (e.key === 'Escape') {
        // Clear selection and cancel drag
        setSelectedNotes(new Set());
        setIsDragging(false);
        setDragState(null);
      } else if (e.key === 'a' && (e.ctrlKey || e.metaKey)) {
        // Select all notes in current staff
        e.preventDefault();
        if (selectedStaff) {
          const staff = staffs.find(s => s.id === selectedStaff);
          if (staff) {
            setSelectedNotes(new Set(staff.notes.map(note => note.id)));
          }
        }
      } else if (e.key === 'c' && (e.ctrlKey || e.metaKey)) {
        // Copy selected notes (placeholder for future implementation)
        if (selectedNotes.size > 0) {
          console.log(`Copied ${selectedNotes.size} notes`);
        }
      } else if (e.key === 'd' && (e.ctrlKey || e.metaKey)) {
        // Duplicate selected notes
        e.preventDefault();
        if (selectedNotes.size > 0 && selectedStaff) {
          const staff = staffs.find(s => s.id === selectedStaff);
          if (staff) {
            const selectedNoteObjects = staff.notes.filter(note => selectedNotes.has(note.id));
            const duplicatedNotes = selectedNoteObjects.map(note => ({
              ...note,
              id: `note-${Date.now()}-${Math.random()}`,
              startTime: note.startTime + 1 // Offset by 1 beat
            }));
            
            // Play the duplicated notes as a quick preview
            duplicatedNotes.forEach((note, index) => {
              setTimeout(() => {
                const noteDurationInSeconds = noteDurationToSeconds(note.duration);
                playNote(note, staff.instrument, noteDurationInSeconds);
              }, index * 150); // Stagger playback slightly
            });
            
            setStaffs(prev => prev.map(s => 
              s.id === selectedStaff 
                ? { ...s, notes: [...s.notes, ...duplicatedNotes].sort((a, b) => a.startTime - b.startTime) }
                : s
            ));
            
            // Select the duplicated notes
            setSelectedNotes(new Set(duplicatedNotes.map(note => note.id)));
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedNotes, isLocked, selectedStaff, staffs]);

  // Redraw when state changes (including theme)
  useEffect(() => {
    drawScore();
  }, [staffs, selectedNotes, zoomLevel, transport.isPlaying, playbackPosition, isDragging, dragState, currentTheme]);

  return (
    <div className="h-full flex flex-col bg-[var(--background)]">
      {/* Professional MuseScore-style Toolbar */}
      <div className="border-b border-[var(--border)] bg-[var(--background)]">
        {/* Main Toolbar Row */}
        <div className="h-12 px-3 flex items-center justify-between">
          <div className="flex items-center space-x-1">
            {/* File Operations */}
            <div className="flex items-center space-x-1 pr-3 border-r border-[var(--border)]">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="New Score">
                <FileMusic className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Open">
                <Upload className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Save">
                <Save className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Print">
                <Printer className="h-4 w-4" />
              </Button>
            </div>

            {/* Edit Operations */}
            <div className="flex items-center space-x-1 pr-3 border-r border-[var(--border)]">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0"
                title="Undo"
                disabled={undoHistory.length === 0}
                onClick={() => {
                  if (undoHistory.length > 0) {
                    setRedoHistory(prev => [staffs, ...prev]);
                    const previousState = undoHistory[undoHistory.length - 1];
                    setStaffs(previousState);
                    setUndoHistory(prev => prev.slice(0, -1));
                  }
                }}
              >
                <Undo className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0"
                title="Redo"
                disabled={redoHistory.length === 0}
                onClick={() => {
                  if (redoHistory.length > 0) {
                    setUndoHistory(prev => [...prev, staffs]);
                    const nextState = redoHistory[0];
                    setStaffs(nextState);
                    setRedoHistory(prev => prev.slice(1));
                  }
                }}
              >
                <Redo className="h-4 w-4" />
              </Button>
            </div>

            {/* Input Tools */}
            <div className="flex items-center space-x-1 pr-3 border-r border-[var(--border)]">
              <Button
                variant={currentTool === 'select' ? 'default' : 'ghost'}
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setCurrentTool('select')}
                title="Selection Tool"
              >
                <MousePointer className="h-4 w-4" />
              </Button>
              <Button
                variant={currentTool === 'note' ? 'default' : 'ghost'}
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setCurrentTool('note')}
                title="Note Input Mode"
              >
                <Music className="h-4 w-4" />
              </Button>
              <Button
                variant={currentTool === 'text' ? 'default' : 'ghost'}
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setCurrentTool('text')}
                title="Text Tool"
              >
                <Type className="h-4 w-4" />
              </Button>
              <Button
                variant={currentTool === 'slur' ? 'default' : 'ghost'}
                size="sm"
                className="h-8 px-2"
                onClick={() => setCurrentTool('slur')}
                title="Add Slur"
              >
                <span className="text-xs font-bold">⌒</span>
              </Button>
            </div>

            {/* Note Values */}
            <div className="flex items-center space-x-1 pr-3 border-r border-[var(--border)]">
              <span className="text-xs text-[var(--muted-foreground)] mr-1">Note:</span>
              {[
                { value: 4, symbol: '𝅝', name: 'Whole' },
                { value: 2, symbol: '𝅗𝅥', name: 'Half' },
                { value: 1, symbol: '♩', name: 'Quarter' },
                { value: 0.5, symbol: '♫', name: 'Eighth' },
                { value: 0.25, symbol: '♬', name: 'Sixteenth' }
              ].map(note => (
                <Button
                  key={note.value}
                  variant={noteValue === note.value ? 'default' : 'ghost'}
                  size="sm"
                  className="h-8 w-8 p-0 text-lg"
                  onClick={() => {
                    setNoteValue(note.value);
                    // Update selected notes to the new duration
                    if (selectedNotes.size > 0) {
                      setUndoHistory(prev => [...prev, staffs]);
                      setRedoHistory([]);
                      setStaffs(prev => prev.map(staff => ({
                        ...staff,
                        notes: staff.notes.map(n => 
                          selectedNotes.has(n.id)
                            ? { ...n, duration: note.value }
                            : n
                        )
                      })));
                      
                      // Play audio preview
                      const firstSelectedStaff = staffs.find(staff => 
                        staff.notes.some(n => selectedNotes.has(n.id))
                      );
                      if (firstSelectedStaff) {
                        const firstSelectedNote = firstSelectedStaff.notes.find(n => 
                          selectedNotes.has(n.id)
                        );
                        if (firstSelectedNote) {
                          const updatedNote = { ...firstSelectedNote, duration: note.value };
                          const noteDurationInSeconds = noteDurationToSeconds(note.value);
                          playNote(updatedNote, firstSelectedStaff.instrument, noteDurationInSeconds);
                        }
                      }
                    }
                  }}
                  title={note.name}
                >
                  {note.symbol}
                </Button>
              ))}
            </div>

            {/* Accidentals */}
            <div className="flex items-center space-x-1 pr-3 border-r border-[var(--border)]">
              <span className="text-xs text-[var(--muted-foreground)] mr-1">Acc:</span>
              {[
                { type: 'flat', symbol: '♭' },
                { type: 'natural', symbol: '♮' },
                { type: 'sharp', symbol: '♯' }
              ].map(acc => (
                <Button
                  key={acc.type}
                  variant={currentAccidental === acc.type ? 'default' : 'ghost'}
                  size="sm"
                  className="h-8 w-8 p-0 text-lg"
                  onClick={() => {
                    const newAccidental = currentAccidental === acc.type ? null : acc.type as any;
                    setCurrentAccidental(newAccidental);
                    
                    // Apply accidental to selected notes
                    if (selectedNotes.size > 0) {
                      setUndoHistory(prev => [...prev, staffs]);
                      setRedoHistory([]);
                      setStaffs(prev => prev.map(staff => ({
                        ...staff,
                        notes: staff.notes.map(note => 
                          selectedNotes.has(note.id)
                            ? { ...note, accidental: newAccidental || undefined }
                            : note
                        )
                      })));
                      
                      // Play audio preview with accidental
                      const firstSelectedStaff = staffs.find(staff => 
                        staff.notes.some(note => selectedNotes.has(note.id))
                      );
                      if (firstSelectedStaff) {
                        const firstSelectedNote = firstSelectedStaff.notes.find(note => 
                          selectedNotes.has(note.id)
                        );
                        if (firstSelectedNote) {
                          const updatedNote = { ...firstSelectedNote, accidental: newAccidental || undefined };
                          const noteDurationInSeconds = noteDurationToSeconds(updatedNote.duration);
                          playNote(updatedNote, firstSelectedStaff.instrument, noteDurationInSeconds);
                        }
                      }
                    }
                  }}
                  title={acc.type.charAt(0).toUpperCase() + acc.type.slice(1)}
                >
                  {acc.symbol}
                </Button>
              ))}
            </div>

            {/* View Options */}
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setShowGrid(!showGrid)}
                title="Toggle Grid"
              >
                <Grid className={`h-4 w-4 ${showGrid ? 'text-[var(--primary)]' : ''}`} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setShowMeasureNumbers(!showMeasureNumbers)}
                title="Toggle Measure Numbers"
              >
                <span className={`text-xs font-bold ${showMeasureNumbers ? 'text-[var(--primary)]' : ''}`}>123</span>
              </Button>
            </div>
          </div>

          {/* Note Duration */}
          <div className="flex items-center space-x-1">
            <span className="text-sm text-[var(--muted-foreground)]">Duration:</span>
            <select
              value={noteValue}
              onChange={(e) => {
                const newDuration = Number(e.target.value);
                setNoteValue(newDuration);
                
                // Update selected notes to the new duration
                if (selectedNotes.size > 0) {
                  setStaffs(prev => prev.map(staff => ({
                    ...staff,
                    notes: staff.notes.map(note => 
                      selectedNotes.has(note.id)
                        ? { ...note, duration: newDuration }
                        : note
                    )
                  })));
                  
                  // Play audio preview of the first selected note with new duration
                  const firstSelectedStaff = staffs.find(staff => 
                    staff.notes.some(note => selectedNotes.has(note.id))
                  );
                  if (firstSelectedStaff) {
                    const firstSelectedNote = firstSelectedStaff.notes.find(note => 
                      selectedNotes.has(note.id)
                    );
                    if (firstSelectedNote) {
                      const updatedNote = { ...firstSelectedNote, duration: newDuration };
                      const noteDurationInSeconds = noteDurationToSeconds(newDuration);
                      playNote(updatedNote, firstSelectedStaff.instrument, noteDurationInSeconds);
                    }
                  }
                }
              }}
              className="h-8 px-2 bg-[var(--background)] border border-[var(--border)] rounded text-sm"
            >
              <option value={4}>𝅝 Whole</option>
              <option value={2}>𝅗𝅥 Half</option>
              <option value={1}>♩ Quarter</option>
              <option value={0.5}>♫ Eighth</option>
              <option value={0.25}>♬ Sixteenth</option>
            </select>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Zoom Controls */}
          <div className="flex items-center space-x-1">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0" 
              title="Zoom Out"
              onClick={() => {
                const newZoom = Math.max(0.25, zoomLevel - 0.25);
                // Update zoom level through parent component if available
                if (typeof zoomLevel !== 'undefined') {
                  // For now, we'll handle zoom internally
                  drawScore();
                }
              }}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-xs text-[var(--foreground)] min-w-[3rem] text-center font-mono">
              {Math.round(zoomLevel * 100)}%
            </span>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0" 
              title="Zoom In"
              onClick={() => {
                const newZoom = Math.min(4, zoomLevel + 0.25);
                // Update zoom level through parent component if available
                if (typeof zoomLevel !== 'undefined') {
                  // For now, we'll handle zoom internally
                  drawScore();
                }
              }}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>

          {isLocked && (
            <div className="text-xs text-[var(--muted-foreground)] bg-[var(--muted)] px-2 py-1 rounded">
              LOCKED
            </div>
          )}
        </div>
      </div>

      {/* Main content area with enhanced sidebar */}
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

        {/* Enhanced Staff Management Sidebar */}
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
                timeSignature: [4, 4],
                instrument: 'New Staff',
                tempo: 120,
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