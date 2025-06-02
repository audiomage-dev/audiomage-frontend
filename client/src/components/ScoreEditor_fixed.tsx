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
        
        // Determine note color based on state
        let noteColor = getComputedStyle(document.documentElement).getPropertyValue('--foreground').trim() || '#000000';
        if (selectedNotes.has(note.id)) {
          noteColor = '#3b82f6';
        } else if (dragState && dragState.noteId === note.id) {
          noteColor = '#ef4444'; // Red during drag
        }
        
        // Draw note head with proper styling and hover effect
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
        
        if (note.duration >= 2) {
          ctx.ellipse(x, y, 7, 5, 0, 0, 2 * Math.PI);
          ctx.lineWidth = 2;
          ctx.stroke();
        } else {
          ctx.ellipse(x, y, 7, 5, 0, 0, 2 * Math.PI);
          ctx.fill();
        }
        
        // Reset shadow
        ctx.shadowBlur = 0;
        
        // Draw stem for quarter notes and shorter
        if (note.duration <= 2 && note.duration >= 0.25) {
          ctx.strokeStyle = noteColor;
          ctx.lineWidth = 2;
          ctx.beginPath();
          const stemDirection = line <= 2 ? 1 : -1;
          ctx.moveTo(x + (stemDirection > 0 ? 7 : -7), y);
          ctx.lineTo(x + (stemDirection > 0 ? 7 : -7), y + (stemDirection * -35));
          ctx.stroke();
          
          // Draw flags for eighth notes and shorter
          if (note.duration < 1) {
            ctx.font = '20px serif';
            ctx.fillStyle = noteColor;
            const flagX = x + (stemDirection > 0 ? 7 : -15);
            const flagY = y + (stemDirection * -35) + (stemDirection > 0 ? 5 : -5);
            ctx.fillText(stemDirection > 0 ? '𝄀' : '𝄁', flagX, flagY);
          }
        }
        
        // Draw selection outline for selected notes
        if (selectedNotes.has(note.id)) {
          ctx.strokeStyle = '#3b82f6';
          ctx.lineWidth = 1;
          ctx.setLineDash([2, 2]);
          ctx.strokeRect(x - 12, y - 12, 24, 24);
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
        // Add a new note
        const musicalPos = pixelToMusicalPosition(x, y, staffIndex, staff.id);
        if (musicalPos) {
          const newNote: Note = {
            id: `note-${Date.now()}`,
            pitch: musicalPos.pitch,
            startTime: musicalPos.time,
            duration: noteValue,
            velocity: 80
          };
          
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

  // Redraw when state changes
  useEffect(() => {
    drawScore();
  }, [staffs, selectedNotes, zoomLevel, transport.isPlaying, playbackPosition, isDragging, dragState]);

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