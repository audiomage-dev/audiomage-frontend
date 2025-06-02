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
}

interface Staff {
  id: string;
  clef: 'treble' | 'bass' | 'alto' | 'tenor';
  keySignature: string; // e.g., 'C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#', 'F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb'
  timeSignature: [number, number]; // [numerator, denominator]
  notes: Note[];
  instrument: string;
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
      notes: [
        { id: 'note-1', pitch: 60, startTime: 0, duration: 1 }, // C4 quarter note
        { id: 'note-2', pitch: 64, startTime: 1, duration: 1 }, // E4 quarter note
        { id: 'note-3', pitch: 67, startTime: 2, duration: 1 }, // G4 quarter note
        { id: 'note-4', pitch: 72, startTime: 3, duration: 1 }, // C5 quarter note
      ]
    }
  ]);
  const [currentTool, setCurrentTool] = useState<'select' | 'note' | 'rest' | 'beam'>('select');
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
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
    
    // Draw staffs
    staffs.forEach((staff, staffIndex) => {
      const yOffset = staffIndex * (staffHeight + 40) + 40;
      
      // Draw staff lines
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1;
      for (let i = 0; i < 5; i++) {
        const y = yOffset + i * lineSpacing;
        ctx.beginPath();
        ctx.moveTo(40, y);
        ctx.lineTo(canvas.offsetWidth - 40, y);
        ctx.stroke();
      }
      
      // Draw clef
      ctx.font = '24px serif';
      ctx.fillStyle = '#000000';
      ctx.fillText(staff.clef === 'treble' ? '𝄞' : '𝄢', 45, yOffset + 30);
      
      // Draw time signature
      ctx.font = '16px serif';
      ctx.fillText(staff.timeSignature[0].toString(), 80, yOffset + 20);
      ctx.fillText(staff.timeSignature[1].toString(), 80, yOffset + 40);
      
      // Draw key signature (simplified)
      if (staff.keySignature !== 'C') {
        ctx.fillText(`Key: ${staff.keySignature}`, 100, yOffset + 30);
      }
      
      // Draw notes
      staff.notes.forEach((note) => {
        const x = 140 + (note.startTime * noteWidth * zoomLevel);
        const { line, accidental } = midiToStaffPosition(note.pitch, staff.clef);
        const y = yOffset + (line * lineSpacing / 2) + 24;
        
        // Draw note head
        ctx.fillStyle = selectedNotes.has(note.id) ? '#3b82f6' : '#000000';
        ctx.beginPath();
        ctx.ellipse(x, y, 6, 4, 0, 0, 2 * Math.PI);
        ctx.fill();
        
        // Draw stem
        if (note.duration <= 2) { // Half note or shorter
          ctx.beginPath();
          ctx.moveTo(x + 6, y);
          ctx.lineTo(x + 6, y - 30);
          ctx.stroke();
        }
        
        // Draw accidental
        if (accidental) {
          ctx.font = '14px serif';
          ctx.fillText(accidental === 'sharp' ? '♯' : '♭', x - 15, y + 5);
        }
        
        // Draw duration markers
        if (note.duration < 1) {
          // Draw flags for eighth notes and shorter
          ctx.font = '12px serif';
          ctx.fillText('♫', x + 8, y - 25);
        }
      });
      
      // Draw playback cursor
      if (transport.isPlaying) {
        const cursorX = 140 + (playbackPosition * noteWidth * zoomLevel);
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cursorX, yOffset - 10);
        ctx.lineTo(cursorX, yOffset + staffHeight);
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

  // Handle canvas click
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isLocked) return;
    
    const canvas = scoreCanvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Find which staff was clicked
    const staffIndex = Math.floor((y - 40) / (staffHeight + 40));
    if (staffIndex >= 0 && staffIndex < staffs.length) {
      const staff = staffs[staffIndex];
      setSelectedStaff(staff.id);
      
      if (currentTool === 'note') {
        // Add a new note
        const time = Math.max(0, (x - 140) / (noteWidth * zoomLevel));
        const staffY = (staffIndex * (staffHeight + 40)) + 40;
        const relativeY = y - staffY;
        const line = Math.round((relativeY - 24) / (lineSpacing / 2));
        
        // Convert staff position back to MIDI note
        const midiNote = staff.clef === 'treble' ? 60 + (6 - line) : 60 + (line - 6);
        
        const newNote: Note = {
          id: `note-${Date.now()}`,
          pitch: Math.max(0, Math.min(127, midiNote)),
          startTime: Math.round(time * 4) / 4, // Quantize to 16th notes
          duration: noteValue
        };
        
        setStaffs(prev => prev.map(s => 
          s.id === staff.id 
            ? { ...s, notes: [...s.notes, newNote].sort((a, b) => a.startTime - b.startTime) }
            : s
        ));
      }
    }
  };

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
          </div>

          {/* Note Duration */}
          <div className="flex items-center space-x-1">
            <span className="text-sm text-[var(--muted-foreground)]">Duration:</span>
            <select
              value={noteValue}
              onChange={(e) => setNoteValue(Number(e.target.value))}
              className="h-8 px-2 bg-[var(--background)] border border-[var(--border)] rounded text-sm"
            >
              <option value={4}>Whole</option>
              <option value={2}>Half</option>
              <option value={1}>Quarter</option>
              <option value={0.5}>Eighth</option>
              <option value={0.25}>Sixteenth</option>
            </select>
          </div>

          <div className="w-px h-6 bg-[var(--border)]"></div>

          {/* Copy/Edit Tools */}
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2"
              title="Copy Selected"
              onClick={() => {
                if (selectedNotes.size > 0) {
                  console.log(`Copied ${selectedNotes.size} notes`);
                }
              }}
            >
              <Copy className="h-4 w-4" />
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
          <h3 className="text-sm font-semibold text-[var(--foreground)] mb-3">Staffs</h3>
          <div className="space-y-2">
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
                  <div>
                    <div className="text-sm font-medium">{staff.instrument}</div>
                    <div className="text-xs text-[var(--muted-foreground)]">
                      {staff.clef} clef • {staff.keySignature} • {staff.timeSignature[0]}/{staff.timeSignature[1]}
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
            
            <Button
              variant="outline"
              size="sm"
              className="w-full mt-2"
              onClick={() => {
                const newStaff: Staff = {
                  id: `staff-${Date.now()}`,
                  clef: 'treble',
                  keySignature: 'C',
                  timeSignature: [4, 4],
                  instrument: 'New Staff',
                  notes: []
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
    </div>
  );
}