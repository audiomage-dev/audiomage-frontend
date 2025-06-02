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

  const canvasRef = useRef<HTMLCanvasElement>(null);
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

  // Drawing function
  const drawScore = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = Math.max(400, staffs.length * (staffHeight + 40) + 80);

    // Clear canvas
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    staffs.forEach((staff, staffIndex) => {
      if (!staff.visible) return;

      const yOffset = staffIndex * (staffHeight + 40) + 40;

      // Draw staff lines
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1;
      for (let i = 0; i < 5; i++) {
        const y = yOffset + (i * lineSpacing);
        ctx.beginPath();
        ctx.moveTo(60, y);
        ctx.lineTo(canvas.width - 40, y);
        ctx.stroke();
      }

      // Draw clef
      ctx.font = 'bold 24px serif';
      ctx.fillStyle = '#000000';
      if (staff.clef === 'treble') {
        ctx.fillText('𝄞', 20, yOffset + 25);
      } else {
        ctx.fillText('𝄢', 20, yOffset + 15);
      }

      // Draw notes
      staff.notes.forEach((note) => {
        const x = 100 + (note.startTime * noteWidth * zoomLevel);
        
        // Calculate note position on staff
        let line = 0;
        if (staff.clef === 'treble') {
          line = 5 - (note.pitch - 60) / 2;
        } else {
          line = 5 - (note.pitch - 40) / 2;
        }
        
        const y = yOffset + (line * lineSpacing / 2);

        // Note color
        const isSelected = selectedNotes.has(note.id);
        ctx.fillStyle = isSelected ? '#3b82f6' : '#000000';
        ctx.strokeStyle = isSelected ? '#3b82f6' : '#000000';

        // Draw note head
        ctx.beginPath();
        ctx.ellipse(x, y, 6, 4, 0, 0, 2 * Math.PI);
        if (note.duration >= 2) {
          ctx.stroke();
        } else {
          ctx.fill();
        }

        // Draw stem for quarter notes and shorter
        if (note.duration < 2) {
          ctx.lineWidth = 2;
          ctx.beginPath();
          const stemHeight = 24;
          if (line <= 2) {
            ctx.moveTo(x + 6, y);
            ctx.lineTo(x + 6, y - stemHeight);
          } else {
            ctx.moveTo(x - 6, y);
            ctx.lineTo(x - 6, y + stemHeight);
          }
          ctx.stroke();
        }
      });

      // Draw instrument name
      ctx.font = '12px sans-serif';
      ctx.fillStyle = '#666666';
      ctx.fillText(staff.instrument, 10, yOffset - 15);
    });
  }, [staffs, selectedNotes, zoomLevel]);

  // Redraw canvas when needed
  useEffect(() => {
    drawScore();
  }, [drawScore]);

  // Mouse event handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isLocked) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const staffIndex = Math.floor((y - 40) / (staffHeight + 40));
    if (staffIndex >= 0 && staffIndex < staffs.length) {
      const staff = staffs[staffIndex];
      
      // Check if clicking on existing note
      const clickedNote = staff.notes.find(note => {
        const noteX = 100 + (note.startTime * noteWidth * zoomLevel);
        let line = 0;
        if (staff.clef === 'treble') {
          line = 5 - (note.pitch - 60) / 2;
        } else {
          line = 5 - (note.pitch - 40) / 2;
        }
        const noteY = staffIndex * (staffHeight + 40) + 40 + (line * lineSpacing / 2);
        
        return Math.abs(x - noteX) <= 12 && Math.abs(y - noteY) <= 8;
      });

      if (clickedNote) {
        if (currentTool === 'select') {
          // Select note
          if (e.ctrlKey || e.metaKey) {
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
            setSelectedNotes(new Set([clickedNote.id]));
          }
          
          // Play note
          playNote(clickedNote);
          
          // Start drag
          setIsDragging(true);
          setDragStart({ x, y, noteId: clickedNote.id });
        }
      } else if (currentTool === 'note') {
        // Add new note
        const time = Math.max(0, Math.round((x - 100) / (noteWidth * zoomLevel)));
        const yOffset = staffIndex * (staffHeight + 40) + 40;
        const lineFromY = Math.round((y - yOffset) / (lineSpacing / 2));
        
        let pitch = 60;
        if (staff.clef === 'treble') {
          pitch = 60 + (5 - lineFromY) * 2;
        } else {
          pitch = 40 + (5 - lineFromY) * 2;
        }
        
        const newNote: Note = {
          id: `note-${Date.now()}`,
          pitch: Math.max(21, Math.min(108, pitch)),
          startTime: time,
          duration: noteValue,
          velocity: 80
        };

        playNote(newNote);

        setStaffs(prev => prev.map(s => 
          s.id === staff.id 
            ? { ...s, notes: [...s.notes, newNote].sort((a, b) => a.startTime - b.startTime) }
            : s
        ));
      } else {
        // Clear selection
        setSelectedNotes(new Set());
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !dragStart || isLocked) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const staffIndex = Math.floor((y - 40) / (staffHeight + 40));
    if (staffIndex >= 0 && staffIndex < staffs.length) {
      const staff = staffs[staffIndex];
      const time = Math.max(0, Math.round((x - 100) / (noteWidth * zoomLevel)));
      const yOffset = staffIndex * (staffHeight + 40) + 40;
      const lineFromY = Math.round((y - yOffset) / (lineSpacing / 2));
      
      let pitch = 60;
      if (staff.clef === 'treble') {
        pitch = 60 + (5 - lineFromY) * 2;
      } else {
        pitch = 40 + (5 - lineFromY) * 2;
      }

      setStaffs(prev => prev.map(s => ({
        ...s,
        notes: s.notes.map(note => 
          note.id === dragStart.noteId
            ? { ...note, startTime: time, pitch: Math.max(21, Math.min(108, pitch)) }
            : note
        )
      })));
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragStart(null);
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
      {/* Toolbar */}
      <div className="border-b p-2 flex items-center space-x-2">
        <Button
          variant={currentTool === 'select' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setCurrentTool('select')}
        >
          <Edit3 className="h-4 w-4 mr-1" />
          Select
        </Button>
        
        {[
          { value: 4, name: 'Whole', symbol: '𝅝' },
          { value: 2, name: 'Half', symbol: '𝅗𝅥' },
          { value: 1, name: 'Quarter', symbol: '♩' },
          { value: 0.5, name: 'Eighth', symbol: '♪' }
        ].map((note) => (
          <Button
            key={note.value}
            variant={currentTool === 'note' && noteValue === note.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setNoteValue(note.value);
              setCurrentTool('note');
            }}
            title={note.name}
          >
            <span className="text-lg">{note.symbol}</span>
          </Button>
        ))}
      </div>

      {/* Main content */}
      <div className="flex-1 flex">
        <div className="flex-1 overflow-auto">
          <canvas
            ref={canvasRef}
            className="w-full h-full cursor-crosshair"
            style={{ minHeight: '400px' }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          />
        </div>

        {/* Staff sidebar */}
        <div className="w-64 border-l p-4 overflow-y-auto">
          <h3 className="text-sm font-semibold mb-3">Staffs</h3>
          
          {staffs.map((staff) => (
            <div
              key={staff.id}
              className={`p-3 rounded border cursor-pointer mb-2 ${
                selectedStaff === staff.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
              }`}
              onClick={() => setSelectedStaff(staff.id)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">{staff.instrument}</div>
                  <div className="text-xs text-gray-500">
                    {staff.clef} • {staff.keySignature} • {staff.timeSignature[0]}/{staff.timeSignature[1]}
                  </div>
                  <div className="text-xs text-gray-500">
                    {staff.notes.length} notes
                  </div>
                </div>
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      onTrackMute(staff.id);
                    }}
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
                visible: true
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