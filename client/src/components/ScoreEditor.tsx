import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AudioTrack, TransportState } from '@/types/audio';
import { 
  Play, Pause, Square, Volume2, VolumeX, Edit3, Copy, Settings, 
  ZoomIn, ZoomOut, RotateCcw, Save, FileMusic, Plus, Minus,
  Music, Piano, Drum, Guitar, Mic
} from 'lucide-react';

interface Note {
  id: string;
  pitch: number; // MIDI note number (0-127)
  startTime: number; // Start time in beats
  duration: number; // Duration in beats (4 = whole note, 2 = half note, 1 = quarter note, etc.)
  accidental?: 'sharp' | 'flat' | 'natural';
  tied?: boolean;
  velocity?: number; // 0-127
  articulation?: 'staccato' | 'accent' | 'tenuto' | 'marcato' | 'fermata';
  ornament?: 'trill' | 'turn' | 'mordent' | 'grace';
}

interface Chord {
  id: string;
  notes: Note[];
  startTime: number;
  duration: number;
}

interface Staff {
  id: string;
  clef: 'treble' | 'bass' | 'alto' | 'tenor';
  keySignature: string; // e.g., 'C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#', 'F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb'
  timeSignature: [number, number]; // [numerator, denominator]
  notes: Note[];
  chords: Chord[];
  instrument: string;
  dynamics: { time: number; marking: string }[];
  tempo: number;
}

interface ScoreEditorProps {
  tracks: AudioTrack[];
  transport: TransportState;
  zoomLevel?: number;
  onTrackMute: (trackId: string) => void;
  onTrackSolo: (trackId: string) => void;
  onTrackSelect?: (trackId: string) => void;
  isLocked?: boolean;
}

export function ScoreEditor({ 
  tracks, 
  transport, 
  zoomLevel = 1,
  onTrackMute,
  onTrackSolo,
  onTrackSelect,
  isLocked = false
}: ScoreEditorProps) {
  const [selectedStaff, setSelectedStaff] = useState<string | null>(null);
  const [selectedNotes, setSelectedNotes] = useState<Set<string>>(new Set());
  const [staffs, setStaffs] = useState<Staff[]>([
    {
      id: 'staff-1',
      clef: 'treble',
      keySignature: 'C',
      timeSignature: [4, 4],
      instrument: 'Piano',
      tempo: 120,
      notes: [
        { id: 'note-1', pitch: 60, startTime: 0, duration: 1, velocity: 80 }, // C4 quarter note
        { id: 'note-2', pitch: 64, startTime: 1, duration: 1, velocity: 85 }, // E4 quarter note
        { id: 'note-3', pitch: 67, startTime: 2, duration: 1, velocity: 75 }, // G4 quarter note
        { id: 'note-4', pitch: 72, startTime: 3, duration: 1, velocity: 90 }, // C5 quarter note
      ],
      chords: [],
      dynamics: [
        { time: 0, marking: 'mp' }
      ]
    }
  ]);
  const [currentTool, setCurrentTool] = useState<'select' | 'note' | 'rest' | 'chord' | 'dynamics'>('select');
  const [noteValue, setNoteValue] = useState<number>(1); // Quarter note by default
  const [playbackPosition, setPlaybackPosition] = useState(0);
  
  const scoreCanvasRef = useRef<HTMLCanvasElement>(null);
  const staffHeight = 120;
  const lineSpacing = 12;
  const noteWidth = 40;

  // Convert MIDI note number to staff position
  const midiToStaffPosition = (midiNote: number, clef: string): { line: number, accidental?: string } => {
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const octave = Math.floor(midiNote / 12) - 1;
    const noteIndex = midiNote % 12;
    const noteName = noteNames[noteIndex];
    
    // Treble clef staff positions (middle C = -6)
    const treblePositions: { [key: string]: number } = {
      'C': -6, 'D': -5, 'E': -4, 'F': -3, 'G': -2, 'A': -1, 'B': 0
    };
    
    // Bass clef staff positions (middle C = 6)
    const bassPositions: { [key: string]: number } = {
      'C': 6, 'D': 7, 'E': 8, 'F': 9, 'G': 10, 'A': 11, 'B': 12
    };
    
    const baseName = noteName.replace('#', '');
    const positions = clef === 'treble' ? treblePositions : bassPositions;
    const basePosition = positions[baseName] || 0;
    const octaveOffset = (octave - 4) * 7;
    
    return {
      line: basePosition + octaveOffset,
      accidental: noteName.includes('#') ? 'sharp' : noteName.includes('b') ? 'flat' : undefined
    };
  };

  // Get key signature sharps/flats
  const getKeySignatureAccidentals = (keySignature: string): { type: 'sharp' | 'flat', positions: number[] } => {
    const sharpKeys: { [key: string]: number[] } = {
      'G': [5], 'D': [5, 2], 'A': [5, 2, 6], 'E': [5, 2, 6, 3], 
      'B': [5, 2, 6, 3, 7], 'F#': [5, 2, 6, 3, 7, 4], 'C#': [5, 2, 6, 3, 7, 4, 1]
    };
    const flatKeys: { [key: string]: number[] } = {
      'F': [1], 'Bb': [1, 4], 'Eb': [1, 4, 0], 'Ab': [1, 4, 0, 3], 
      'Db': [1, 4, 0, 3, 6], 'Gb': [1, 4, 0, 3, 6, 2], 'Cb': [1, 4, 0, 3, 6, 2, 5]
    };
    
    if (sharpKeys[keySignature]) {
      return { type: 'sharp', positions: sharpKeys[keySignature] };
    } else if (flatKeys[keySignature]) {
      return { type: 'flat', positions: flatKeys[keySignature] };
    }
    return { type: 'sharp', positions: [] };
  };

  // Draw ledger lines for notes outside staff
  const drawLedgerLines = (ctx: CanvasRenderingContext2D, x: number, y: number, staffY: number) => {
    const staffLines = [0, 1, 2, 3, 4].map(i => staffY + i * lineSpacing);
    const notePosition = y;
    
    // Above staff
    if (notePosition < staffLines[0]) {
      let ledgerY = staffLines[0] - lineSpacing;
      while (ledgerY >= notePosition - lineSpacing/2) {
        ctx.beginPath();
        ctx.moveTo(x - 8, ledgerY);
        ctx.lineTo(x + 8, ledgerY);
        ctx.stroke();
        ledgerY -= lineSpacing;
      }
    }
    
    // Below staff
    if (notePosition > staffLines[4]) {
      let ledgerY = staffLines[4] + lineSpacing;
      while (ledgerY <= notePosition + lineSpacing/2) {
        ctx.beginPath();
        ctx.moveTo(x - 8, ledgerY);
        ctx.lineTo(x + 8, ledgerY);
        ctx.stroke();
        ledgerY += lineSpacing;
      }
    }
  };

  // Draw the score
  const drawScore = () => {
    const canvas = scoreCanvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas size
    canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--background').trim() || '#ffffff';
    ctx.fillRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
    
    // Draw staffs
    staffs.forEach((staff, staffIndex) => {
      const yOffset = staffIndex * (staffHeight + 60) + 40;
      
      // Draw staff lines
      ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--foreground').trim() || '#000000';
      ctx.lineWidth = 1;
      for (let i = 0; i < 5; i++) {
        const y = yOffset + i * lineSpacing;
        ctx.beginPath();
        ctx.moveTo(40, y);
        ctx.lineTo(canvas.offsetWidth - 280, y);
        ctx.stroke();
      }
      
      // Draw bar lines every 4 beats
      const beatsPerMeasure = staff.timeSignature[0];
      for (let beat = beatsPerMeasure; beat * noteWidth * zoomLevel < canvas.offsetWidth - 320; beat += beatsPerMeasure) {
        const x = 140 + (beat * noteWidth * zoomLevel);
        ctx.beginPath();
        ctx.moveTo(x, yOffset);
        ctx.lineTo(x, yOffset + (4 * lineSpacing));
        ctx.stroke();
      }
      
      // Draw clef
      ctx.font = 'bold 28px serif';
      ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--foreground').trim() || '#000000';
      if (staff.clef === 'treble') {
        ctx.fillText('𝄞', 45, yOffset + 32);
      } else if (staff.clef === 'bass') {
        ctx.fillText('𝄢', 45, yOffset + 20);
      }
      
      // Draw key signature
      const keyAccidentals = getKeySignatureAccidentals(staff.keySignature);
      if (keyAccidentals.positions.length > 0) {
        ctx.font = '16px serif';
        keyAccidentals.positions.forEach((pos, index) => {
          const x = 75 + (index * 8);
          const y = yOffset + (pos * 3) + 20;
          ctx.fillText(keyAccidentals.type === 'sharp' ? '♯' : '♭', x, y);
        });
      }
      
      // Draw time signature
      ctx.font = 'bold 18px serif';
      const timeSigX = 75 + (keyAccidentals.positions.length * 8) + 10;
      ctx.fillText(staff.timeSignature[0].toString(), timeSigX, yOffset + 16);
      ctx.fillText(staff.timeSignature[1].toString(), timeSigX, yOffset + 36);
      
      // Draw instrument name
      ctx.font = '12px sans-serif';
      ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--muted-foreground').trim() || '#666666';
      ctx.fillText(staff.instrument, 10, yOffset - 10);
      
      // Draw tempo marking
      ctx.font = 'bold 12px sans-serif';
      ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--foreground').trim() || '#000000';
      ctx.fillText(`♩ = ${staff.tempo}`, 10, yOffset - 25);
      
      // Draw dynamics markings
      staff.dynamics.forEach((dynamic) => {
        const x = 140 + (dynamic.time * noteWidth * zoomLevel);
        ctx.font = 'italic 14px serif';
        ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--foreground').trim() || '#000000';
        ctx.fillText(dynamic.marking, x, yOffset + staffHeight + 25);
      });
      
      // Draw notes
      ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--foreground').trim() || '#000000';
      staff.notes.forEach((note) => {
        const x = 140 + (note.startTime * noteWidth * zoomLevel);
        const { line, accidental } = midiToStaffPosition(note.pitch, staff.clef);
        const y = yOffset + (line * lineSpacing / 2) + 24;
        
        // Draw ledger lines if needed
        ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--foreground').trim() || '#000000';
        ctx.lineWidth = 1;
        drawLedgerLines(ctx, x, y, yOffset);
        
        // Draw note head
        ctx.fillStyle = selectedNotes.has(note.id) ? '#3b82f6' : (getComputedStyle(document.documentElement).getPropertyValue('--foreground').trim() || '#000000');
        ctx.beginPath();
        
        // Different note head shapes based on duration
        if (note.duration >= 2) {
          // Whole and half notes - hollow
          ctx.ellipse(x, y, 7, 5, 0, 0, 2 * Math.PI);
          ctx.stroke();
        } else {
          // Quarter notes and shorter - filled
          ctx.ellipse(x, y, 7, 5, 0, 0, 2 * Math.PI);
          ctx.fill();
        }
        
        // Draw stem
        if (note.duration <= 2 && note.duration >= 0.25) {
          ctx.strokeStyle = selectedNotes.has(note.id) ? '#3b82f6' : (getComputedStyle(document.documentElement).getPropertyValue('--foreground').trim() || '#000000');
          ctx.lineWidth = 2;
          ctx.beginPath();
          const stemDirection = line <= 2 ? 1 : -1; // Stem up for notes below middle line
          ctx.moveTo(x + (stemDirection > 0 ? 7 : -7), y);
          ctx.lineTo(x + (stemDirection > 0 ? 7 : -7), y + (stemDirection * -35));
          ctx.stroke();
          
          // Draw flags for eighth notes and shorter
          if (note.duration < 1) {
            ctx.font = '20px serif';
            ctx.fillStyle = selectedNotes.has(note.id) ? '#3b82f6' : (getComputedStyle(document.documentElement).getPropertyValue('--foreground').trim() || '#000000');
            const flagX = x + (stemDirection > 0 ? 7 : -15);
            const flagY = y + (stemDirection * -35) + (stemDirection > 0 ? 5 : -5);
            ctx.fillText(stemDirection > 0 ? '𝄀' : '𝄁', flagX, flagY);
          }
        }
        
        // Draw accidental
        if (accidental) {
          ctx.font = '16px serif';
          ctx.fillStyle = selectedNotes.has(note.id) ? '#3b82f6' : (getComputedStyle(document.documentElement).getPropertyValue('--foreground').trim() || '#000000');
          ctx.fillText(accidental === 'sharp' ? '♯' : '♭', x - 20, y + 5);
        }
        
        // Draw articulations
        if (note.articulation) {
          ctx.font = '12px serif';
          ctx.fillStyle = selectedNotes.has(note.id) ? '#3b82f6' : (getComputedStyle(document.documentElement).getPropertyValue('--foreground').trim() || '#000000');
          const articulationY = line <= 2 ? y + 20 : y - 15;
          
          switch (note.articulation) {
            case 'staccato':
              ctx.fillText('•', x, articulationY);
              break;
            case 'accent':
              ctx.fillText('>', x, articulationY);
              break;
            case 'tenuto':
              ctx.fillText('_', x, articulationY);
              break;
            case 'marcato':
              ctx.fillText('^', x, articulationY);
              break;
            case 'fermata':
              ctx.fillText('𝄐', x, articulationY);
              break;
          }
        }
        
        // Draw ornaments
        if (note.ornament) {
          ctx.font = '10px serif';
          ctx.fillStyle = selectedNotes.has(note.id) ? '#3b82f6' : (getComputedStyle(document.documentElement).getPropertyValue('--foreground').trim() || '#000000');
          const ornamentY = line <= 2 ? y - 25 : y + 30;
          
          switch (note.ornament) {
            case 'trill':
              ctx.fillText('tr', x - 5, ornamentY);
              break;
            case 'turn':
              ctx.fillText('∽', x, ornamentY);
              break;
            case 'mordent':
              ctx.fillText('𝄘', x, ornamentY);
              break;
            case 'grace':
              ctx.fillText('♮', x - 10, ornamentY);
              break;
          }
        }
      });
      
      // Draw chord symbols
      staff.chords.forEach((chord) => {
        const x = 140 + (chord.startTime * noteWidth * zoomLevel);
        
        // Generate chord name based on notes
        if (chord.notes.length > 0) {
          const rootNote = chord.notes[0];
          const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
          const chordName = noteNames[rootNote.pitch % 12];
          
          ctx.font = 'bold 14px serif';
          ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--foreground').trim() || '#000000';
          ctx.fillText(chordName, x, yOffset - 15);
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

  // Update playback position
  useEffect(() => {
    if (transport.isPlaying) {
      const interval = setInterval(() => {
        setPlaybackPosition(prev => prev + 0.1);
      }, 100);
      return () => clearInterval(interval);
    }
  }, [transport.isPlaying]);

  // Redraw when state changes
  useEffect(() => {
    drawScore();
  }, [staffs, selectedNotes, zoomLevel, transport.isPlaying, playbackPosition]);

  // Check if click is on a note
  const getNoteAtPosition = (x: number, y: number, staffIndex: number): Note | null => {
    const staff = staffs[staffIndex];
    if (!staff) return null;
    
    const staffY = staffIndex * (staffHeight + 60) + 40;
    
    for (const note of staff.notes) {
      const noteX = 140 + (note.startTime * noteWidth * zoomLevel);
      const { line } = midiToStaffPosition(note.pitch, staff.clef);
      const noteY = staffY + (line * lineSpacing / 2) + 24;
      
      // Check if click is within note bounds
      if (Math.abs(x - noteX) <= 10 && Math.abs(y - noteY) <= 8) {
        return note;
      }
    }
    return null;
  };

  // Handle canvas click
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isLocked) return;
    
    const canvas = scoreCanvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Find which staff was clicked
    const staffIndex = Math.floor((y - 40) / (staffHeight + 60));
    if (staffIndex >= 0 && staffIndex < staffs.length) {
      const staff = staffs[staffIndex];
      setSelectedStaff(staff.id);
      
      // Check if clicking on an existing note
      const clickedNote = getNoteAtPosition(x, y, staffIndex);
      
      if (clickedNote && currentTool === 'select') {
        // Select/deselect note
        if (e.ctrlKey || e.metaKey) {
          // Multi-select
          setSelectedNotes(prev => {
            const newSet = new Set(prev);
            if (newSet.has(clickedNote.id)) {
              newSet.delete(clickedNote.id);
            } else {
              newSet.add(clickedNote.id);
            }
            return newSet;
          });
        } else {
          // Single select
          setSelectedNotes(new Set([clickedNote.id]));
        }
      } else if (!clickedNote && currentTool === 'note') {
        // Add a new note
        const time = Math.max(0, (x - 140) / (noteWidth * zoomLevel));
        const staffY = staffIndex * (staffHeight + 60) + 40;
        const relativeY = y - staffY;
        const line = Math.round((relativeY - 24) / (lineSpacing / 2));
        
        // Convert staff position back to MIDI note
        let midiNote: number;
        if (staff.clef === 'treble') {
          midiNote = 72 - line; // C5 at line 0
        } else if (staff.clef === 'bass') {
          midiNote = 50 - line; // D3 at line 0
        } else {
          midiNote = 60 - line; // Middle C default
        }
        
        const newNote: Note = {
          id: `note-${Date.now()}`,
          pitch: Math.max(0, Math.min(127, midiNote)),
          startTime: Math.round(time * 4) / 4, // Quantize to 16th notes
          duration: noteValue,
          velocity: 80
        };
        
        setStaffs(prev => prev.map(s => 
          s.id === staff.id 
            ? { ...s, notes: [...s.notes, newNote].sort((a, b) => a.startTime - b.startTime) }
            : s
        ));
      } else if (!clickedNote && currentTool === 'select') {
        // Clear selection when clicking empty space
        setSelectedNotes(new Set());
      }
    }
  };

  // Handle key presses for note operations
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
        // Clear selection
        setSelectedNotes(new Set());
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedNotes, isLocked]);

  return (
    <div className="h-full flex flex-col bg-[var(--background)]">
      {/* Score Toolbar */}
      <div className="h-12 bg-[var(--muted)] border-b border-[var(--border)] px-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Tool Selection */}
          <div className="flex items-center space-x-1 bg-[var(--background)] border border-[var(--border)] rounded overflow-hidden">
            <button
              onClick={() => setCurrentTool('select')}
              className={`h-8 px-2 flex items-center justify-center transition-colors ${
                currentTool === 'select' 
                  ? 'bg-[var(--primary)] text-[var(--primary-foreground)]' 
                  : 'hover:bg-[var(--accent)] text-[var(--foreground)]'
              }`}
              title="Select Tool"
            >
              <Edit3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setCurrentTool('note')}
              className={`h-8 px-2 flex items-center justify-center transition-colors ${
                currentTool === 'note' 
                  ? 'bg-[var(--primary)] text-[var(--primary-foreground)]' 
                  : 'hover:bg-[var(--accent)] text-[var(--foreground)]'
              }`}
              title="Note Tool"
            >
              <Music className="h-4 w-4" />
            </button>
            <button
              onClick={() => setCurrentTool('chord')}
              className={`h-8 px-2 flex items-center justify-center transition-colors ${
                currentTool === 'chord' 
                  ? 'bg-[var(--primary)] text-[var(--primary-foreground)]' 
                  : 'hover:bg-[var(--accent)] text-[var(--foreground)]'
              }`}
              title="Chord Tool"
            >
              <Piano className="h-4 w-4" />
            </button>
            <button
              onClick={() => setCurrentTool('dynamics')}
              className={`h-8 px-2 flex items-center justify-center transition-colors ${
                currentTool === 'dynamics' 
                  ? 'bg-[var(--primary)] text-[var(--primary-foreground)]' 
                  : 'hover:bg-[var(--accent)] text-[var(--foreground)]'
              }`}
              title="Dynamics Tool"
            >
              <Volume2 className="h-4 w-4" />
            </button>
          </div>

          {/* Note Duration */}
          <div className="flex items-center space-x-1">
            <span className="text-sm text-[var(--muted-foreground)]">Duration:</span>
            <select
              value={noteValue}
              onChange={(e) => setNoteValue(Number(e.target.value))}
              className="h-8 px-2 bg-[var(--background)] border border-[var(--border)] rounded text-sm"
            >
              <option value={4}>𝅝 Whole</option>
              <option value={2}>𝅗𝅥 Half</option>
              <option value={1}>♩ Quarter</option>
              <option value={0.5}>♫ Eighth</option>
              <option value={0.25}>♬ Sixteenth</option>
            </select>
          </div>

          {/* Staff Configuration */}
          {selectedStaff && (
            <>
              <div className="flex items-center space-x-1">
                <span className="text-sm text-[var(--muted-foreground)]">Key:</span>
                <select
                  value={staffs.find(s => s.id === selectedStaff)?.keySignature || 'C'}
                  onChange={(e) => {
                    setStaffs(prev => prev.map(s => 
                      s.id === selectedStaff 
                        ? { ...s, keySignature: e.target.value }
                        : s
                    ));
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
                  <option value="F">F Major</option>
                  <option value="Bb">Bb Major</option>
                  <option value="Eb">Eb Major</option>
                  <option value="Ab">Ab Major</option>
                  <option value="Db">Db Major</option>
                </select>
              </div>

              <div className="flex items-center space-x-1">
                <span className="text-sm text-[var(--muted-foreground)]">Clef:</span>
                <select
                  value={staffs.find(s => s.id === selectedStaff)?.clef || 'treble'}
                  onChange={(e) => {
                    setStaffs(prev => prev.map(s => 
                      s.id === selectedStaff 
                        ? { ...s, clef: e.target.value as 'treble' | 'bass' | 'alto' | 'tenor' }
                        : s
                    ));
                  }}
                  className="h-8 px-2 bg-[var(--background)] border border-[var(--border)] rounded text-sm"
                >
                  <option value="treble">𝄞 Treble</option>
                  <option value="bass">𝄢 Bass</option>
                  <option value="alto">𝄡 Alto</option>
                  <option value="tenor">𝄡 Tenor</option>
                </select>
              </div>
            </>
          )}

          <div className="w-px h-6 bg-[var(--border)]"></div>

          {/* Copy/Edit Tools */}
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2"
              title="Copy Selected Notes"
              disabled={selectedNotes.size === 0}
              onClick={() => {
                if (selectedNotes.size > 0) {
                  console.log(`Copied ${selectedNotes.size} notes`);
                  // Future: implement copy to clipboard
                }
              }}
            >
              <Copy className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2"
              title="Delete Selected Notes"
              disabled={selectedNotes.size === 0}
              onClick={() => {
                if (selectedNotes.size > 0) {
                  setStaffs(prev => prev.map(staff => ({
                    ...staff,
                    notes: staff.notes.filter(note => !selectedNotes.has(note.id))
                  })));
                  setSelectedNotes(new Set());
                }
              }}
            >
              <Settings className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2"
              title="Clear All Notes"
              onClick={() => {
                if (selectedStaff) {
                  setStaffs(prev => prev.map(staff => 
                    staff.id === selectedStaff 
                      ? { ...staff, notes: [] }
                      : staff
                  ));
                  setSelectedNotes(new Set());
                }
              }}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
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
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>

          {/* Lock indicator */}
          {isLocked && (
            <div className="text-xs text-[var(--muted-foreground)] bg-[var(--muted)] px-2 py-1 rounded">
              LOCKED
            </div>
          )}
        </div>
      </div>

      {/* Main content area with sidebar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Score Canvas */}
        <div className="flex-1 overflow-auto">
          <canvas
            ref={scoreCanvasRef}
            className="w-full h-full cursor-crosshair"
            style={{ minHeight: '600px' }}
            onClick={handleCanvasClick}
          />
        </div>

        {/* Staff List Sidebar */}
        <div className="w-64 border-l border-[var(--border)] bg-[var(--muted)] p-4 overflow-y-auto">
          <h3 className="text-sm font-semibold text-[var(--foreground)] mb-3">Score Properties</h3>
          
          {/* Staff List */}
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

          {/* Selected Staff Properties */}
          {selectedStaff && (
            <div className="space-y-3 border-t border-[var(--border)] pt-4">
              <h4 className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wide">Staff Properties</h4>
              
              <div className="space-y-2">
                <div>
                  <label className="text-xs text-[var(--muted-foreground)]">Instrument Name</label>
                  <input
                    type="text"
                    value={staffs.find(s => s.id === selectedStaff)?.instrument || ''}
                    onChange={(e) => {
                      setStaffs(prev => prev.map(s => 
                        s.id === selectedStaff 
                          ? { ...s, instrument: e.target.value }
                          : s
                      ));
                    }}
                    className="w-full h-7 px-2 bg-[var(--background)] border border-[var(--border)] rounded text-xs"
                  />
                </div>

                <div>
                  <label className="text-xs text-[var(--muted-foreground)]">Tempo (BPM)</label>
                  <input
                    type="number"
                    min="40"
                    max="200"
                    value={staffs.find(s => s.id === selectedStaff)?.tempo || 120}
                    onChange={(e) => {
                      setStaffs(prev => prev.map(s => 
                        s.id === selectedStaff 
                          ? { ...s, tempo: parseInt(e.target.value) || 120 }
                          : s
                      ));
                    }}
                    className="w-full h-7 px-2 bg-[var(--background)] border border-[var(--border)] rounded text-xs"
                  />
                </div>

                <div>
                  <label className="text-xs text-[var(--muted-foreground)]">Time Signature</label>
                  <div className="flex space-x-1">
                    <select
                      value={staffs.find(s => s.id === selectedStaff)?.timeSignature[0] || 4}
                      onChange={(e) => {
                        const staff = staffs.find(s => s.id === selectedStaff);
                        if (staff) {
                          setStaffs(prev => prev.map(s => 
                            s.id === selectedStaff 
                              ? { ...s, timeSignature: [parseInt(e.target.value), staff.timeSignature[1]] as [number, number] }
                              : s
                          ));
                        }
                      }}
                      className="flex-1 h-7 px-1 bg-[var(--background)] border border-[var(--border)] rounded text-xs"
                    >
                      <option value={2}>2</option>
                      <option value={3}>3</option>
                      <option value={4}>4</option>
                      <option value={5}>5</option>
                      <option value={6}>6</option>
                      <option value={7}>7</option>
                      <option value={9}>9</option>
                      <option value={12}>12</option>
                    </select>
                    <span className="text-xs flex items-center">/</span>
                    <select
                      value={staffs.find(s => s.id === selectedStaff)?.timeSignature[1] || 4}
                      onChange={(e) => {
                        const staff = staffs.find(s => s.id === selectedStaff);
                        if (staff) {
                          setStaffs(prev => prev.map(s => 
                            s.id === selectedStaff 
                              ? { ...s, timeSignature: [staff.timeSignature[0], parseInt(e.target.value)] as [number, number] }
                              : s
                          ));
                        }
                      }}
                      className="flex-1 h-7 px-1 bg-[var(--background)] border border-[var(--border)] rounded text-xs"
                    >
                      <option value={1}>1</option>
                      <option value={2}>2</option>
                      <option value={4}>4</option>
                      <option value={8}>8</option>
                      <option value={16}>16</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <Button
            variant="outline"
            size="sm"
            className="w-full mt-4"
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
                dynamics: []
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