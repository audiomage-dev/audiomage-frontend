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
  keySignature: string;
  timeSignature: [number, number];
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
        { id: 'note-1', pitch: 60, startTime: 0, duration: 1, velocity: 80 },
        { id: 'note-2', pitch: 64, startTime: 1, duration: 1, velocity: 85 },
        { id: 'note-3', pitch: 67, startTime: 2, duration: 1, velocity: 75 },
        { id: 'note-4', pitch: 72, startTime: 3, duration: 1, velocity: 90 },
      ],
      chords: [],
      dynamics: [
        { time: 0, marking: 'mp' }
      ]
    }
  ]);
  const [currentTool, setCurrentTool] = useState<'select' | 'note' | 'rest' | 'chord' | 'dynamics'>('select');
  const [noteValue, setNoteValue] = useState<number>(1);
  const [playbackPosition, setPlaybackPosition] = useState(0);
  
  const scoreCanvasRef = useRef<HTMLCanvasElement>(null);
  const staffHeight = 120;
  const lineSpacing = 12;
  const noteWidth = 40;

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
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--background').trim() || '#ffffff';
    ctx.fillRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
    
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
      
      // Draw clef
      ctx.font = 'bold 28px serif';
      ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--foreground').trim() || '#000000';
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
      
      // Draw instrument name and tempo
      ctx.font = '12px sans-serif';
      ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--muted-foreground').trim() || '#666666';
      ctx.fillText(staff.instrument, 10, yOffset - 10);
      ctx.fillText(`♩ = ${staff.tempo}`, 10, yOffset - 25);
      
      // Draw notes with enhanced styling
      ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--foreground').trim() || '#000000';
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
        
        // Draw note head with proper styling
        ctx.fillStyle = selectedNotes.has(note.id) ? '#3b82f6' : (getComputedStyle(document.documentElement).getPropertyValue('--foreground').trim() || '#000000');
        ctx.beginPath();
        
        if (note.duration >= 2) {
          ctx.ellipse(x, y, 7, 5, 0, 0, 2 * Math.PI);
          ctx.stroke();
        } else {
          ctx.ellipse(x, y, 7, 5, 0, 0, 2 * Math.PI);
          ctx.fill();
        }
        
        // Draw stem for quarter notes and shorter
        if (note.duration <= 2 && note.duration >= 0.25) {
          ctx.strokeStyle = selectedNotes.has(note.id) ? '#3b82f6' : (getComputedStyle(document.documentElement).getPropertyValue('--foreground').trim() || '#000000');
          ctx.lineWidth = 2;
          ctx.beginPath();
          const stemDirection = line <= 2 ? 1 : -1;
          ctx.moveTo(x + (stemDirection > 0 ? 7 : -7), y);
          ctx.lineTo(x + (stemDirection > 0 ? 7 : -7), y + (stemDirection * -35));
          ctx.stroke();
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

  // Handle canvas interactions
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
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
      
      if (currentTool === 'note') {
        const time = Math.max(0, (x - 140) / (noteWidth * zoomLevel));
        const staffY = staffIndex * (staffHeight + 60) + 40;
        const relativeY = y - staffY;
        const line = Math.round((relativeY - 24) / (lineSpacing / 2));
        
        let midiNote: number;
        if (staff.clef === 'treble') {
          midiNote = 72 - line;
        } else {
          midiNote = 50 - line;
        }
        
        const newNote: Note = {
          id: `note-${Date.now()}`,
          pitch: Math.max(0, Math.min(127, midiNote)),
          startTime: Math.round(time * 4) / 4,
          duration: noteValue,
          velocity: 80
        };
        
        setStaffs(prev => prev.map(s => 
          s.id === staff.id 
            ? { ...s, notes: [...s.notes, newNote].sort((a, b) => a.startTime - b.startTime) }
            : s
        ));
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

  // Redraw when state changes
  useEffect(() => {
    drawScore();
  }, [staffs, selectedNotes, zoomLevel, transport.isPlaying, playbackPosition]);

  return (
    <div className="h-full flex flex-col bg-[var(--background)]">
      {/* Enhanced Score Toolbar */}
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
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Zoom Out">
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-xs text-[var(--foreground)] min-w-[3rem] text-center font-mono">
              {Math.round(zoomLevel * 100)}%
            </span>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Zoom In">
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
            onClick={handleCanvasClick}
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