import { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { AudioTrack, TransportState } from '../types/audio';
import { 
  Music,
  Play,
  Pause,
  Square,
  ZoomIn,
  ZoomOut,
  Save,
  FileDown,
  Settings,
  VolumeX,
  Radio,
  Plus,
  MousePointer,
  Type,
  Eye,
  EyeOff,
  Lock,
  Unlock
} from 'lucide-react';

interface Note {
  id: string;
  pitch: number; // MIDI note number
  startTime: number; // Beat position
  duration: number; // Note duration
  velocity: number;
  x?: number; // Canvas position
  y?: number; // Canvas position
}

interface Staff {
  id: string;
  clef: 'treble' | 'bass';
  keySignature: string;
  timeSignature: [number, number];
  instrument: string;
  notes: Note[];
  visible: boolean;
  locked: boolean;
  volume: number;
}

interface InteractiveScoreEditorProps {
  tracks: AudioTrack[];
  transport: TransportState;
  onTrackMute: (trackId: string) => void;
  onTrackSolo: (trackId: string) => void;
  isLocked?: boolean;
}

export function InteractiveScoreEditor({ 
  tracks, 
  transport, 
  onTrackMute,
  onTrackSolo,
  isLocked = false
}: InteractiveScoreEditorProps) {
  const [currentTool, setCurrentTool] = useState<'note' | 'select'>('note');
  const [noteValue, setNoteValue] = useState(1); // Quarter note
  const [selectedNotes, setSelectedNotes] = useState<Set<string>>(new Set());
  const [currentKeySignature, setCurrentKeySignature] = useState('C');
  const [currentTempo, setCurrentTempo] = useState(120);
  const [viewMode, setViewMode] = useState<'page' | 'continuous'>('page');
  
  const [staffs, setStaffs] = useState<Staff[]>([
    {
      id: 'staff-1',
      clef: 'treble',
      keySignature: 'C',
      timeSignature: [4, 4],
      instrument: 'Piano',
      notes: [],
      visible: true,
      locked: false,
      volume: 100
    }
  ]);

  const scoreCanvasRef = useRef<HTMLCanvasElement>(null);

  // Calculate note position on staff
  const calculateNotePosition = (pitch: number, clef: string, staffY: number): { y: number; needsLedger: boolean } => {
    const lineSpacing = 10;
    let baseNote = clef === 'treble' ? 67 : 53; // G4 for treble, F3 for bass
    let baseLine = 2; // Middle line of staff
    
    const semitoneOffset = pitch - baseNote;
    const stepOffset = Math.round(semitoneOffset * 3.5 / 7); // Approximate staff position
    const y = staffY + (baseLine - stepOffset) * (lineSpacing / 2);
    
    const needsLedger = y < staffY - lineSpacing || y > staffY + 4 * lineSpacing;
    
    return { y, needsLedger };
  };

  // Remove note
  const removeNote = useCallback((noteId: string) => {
    setStaffs(prev => prev.map(staff => ({
      ...staff,
      notes: staff.notes.filter(note => note.id !== noteId)
    })));
    setSelectedNotes(prev => {
      const newSet = new Set(prev);
      newSet.delete(noteId);
      return newSet;
    });
  }, []);

  // Add note at position with smart snapping
  const addNote = useCallback((x: number, y: number, staffId: string) => {
    const staff = staffs.find(s => s.id === staffId);
    if (!staff || staff.locked) return;

    // Calculate time position with grid snapping
    const measureWidth = 200;
    const startX = 150;
    const relativeX = x - startX;
    const beat = Math.max(0, (relativeX / measureWidth) * 4);
    
    // Smart quantization based on note value
    const quantization = noteValue >= 1 ? 0.25 : noteValue; // Quarter note or smaller
    const quantizedBeat = Math.round(beat / quantization) * quantization;
    
    // Calculate pitch from y position with staff line snapping
    const staffY = 80;
    const lineSpacing = 10;
    const relativeY = y - (staffY + 20); // Center of staff
    
    // Snap to staff lines and spaces
    const staffStep = Math.round(relativeY / (lineSpacing / 2));
    const snappedY = staffY + 20 - (staffStep * (lineSpacing / 2));
    
    const basePitch = staff.clef === 'treble' ? 67 : 53; // G4 or F3
    const pitch = basePitch + staffStep;

    // Check for existing note at this position
    const existingNote = staff.notes.find(note => 
      Math.abs(note.startTime - quantizedBeat) < 0.01 && 
      Math.abs(note.pitch - pitch) < 0.5
    );

    if (existingNote) {
      // Remove existing note instead of adding duplicate
      removeNote(existingNote.id);
      return;
    }

    // Create new note with snapped positions
    const newNote: Note = {
      id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      pitch: Math.max(21, Math.min(108, pitch)),
      startTime: quantizedBeat,
      duration: noteValue,
      velocity: 80,
      x: startX + (quantizedBeat / 4) * measureWidth,
      y: snappedY
    };

    setStaffs(prev => prev.map(s => 
      s.id === staffId 
        ? { ...s, notes: [...s.notes, newNote].sort((a, b) => a.startTime - b.startTime) }
        : s
    ));

    // Auto-select the new note
    setSelectedNotes(new Set([newNote.id]));
  }, [staffs, noteValue, removeNote]);

  // Enhanced canvas interaction with drag support
  const [isDragging, setIsDragging] = useState(false);
  const [draggedNote, setDraggedNote] = useState<Note | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Canvas mouse down handler
  const handleCanvasMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isLocked) return;

    const canvas = scoreCanvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Find clicked note
    let clickedNote: Note | null = null;
    let clickedStaff: Staff | null = null;
    
    for (const staff of staffs) {
      for (const note of staff.notes) {
        if (note.x && note.y && 
            Math.abs(x - note.x) < 15 && 
            Math.abs(y - note.y) < 10) {
          clickedNote = note;
          clickedStaff = staff;
          break;
        }
      }
      if (clickedNote) break;
    }

    if (currentTool === 'note') {
      if (clickedNote) {
        // Remove existing note
        removeNote(clickedNote.id);
      } else {
        // Add new note
        addNote(x, y, 'staff-1');
      }
    } else if (currentTool === 'select') {
      if (clickedNote) {
        // Handle selection
        if (e.shiftKey) {
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

        // Start drag if note is selected
        if (selectedNotes.has(clickedNote.id) || !e.shiftKey) {
          setIsDragging(true);
          setDraggedNote(clickedNote);
          setDragOffset({
            x: x - (clickedNote.x || 0),
            y: y - (clickedNote.y || 0)
          });
        }
      } else {
        // Clear selection when clicking empty space
        if (!e.shiftKey) {
          setSelectedNotes(new Set());
        }
      }
    }
  }, [isLocked, currentTool, addNote, removeNote, staffs, selectedNotes]);

  // Canvas mouse move handler for dragging
  const handleCanvasMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !draggedNote) return;

    const canvas = scoreCanvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Calculate new position
    const newX = x - dragOffset.x;
    const newY = y - dragOffset.y;

    // Update note positions for all selected notes
    const selectedIds = selectedNotes.has(draggedNote.id) ? selectedNotes : new Set([draggedNote.id]);
    const deltaX = newX - (draggedNote.x || 0);
    const deltaY = newY - (draggedNote.y || 0);

    setStaffs(prev => prev.map(staff => ({
      ...staff,
      notes: staff.notes.map(note => {
        if (selectedIds.has(note.id)) {
          const newNoteX = (note.x || 0) + deltaX;
          const newNoteY = (note.y || 0) + deltaY;
          
          // Convert back to musical parameters
          const measureWidth = 200;
          const startX = 150;
          const relativeX = newNoteX - startX;
          const beat = Math.max(0, (relativeX / measureWidth) * 4);
          const quantization = noteValue >= 1 ? 0.25 : noteValue;
          const quantizedBeat = Math.round(beat / quantization) * quantization;

          // Calculate pitch from y position
          const staffY = 80;
          const lineSpacing = 10;
          const relativeY = newNoteY - (staffY + 20);
          const staffStep = Math.round(relativeY / (lineSpacing / 2));
          const snappedY = staffY + 20 - (staffStep * (lineSpacing / 2));
          const basePitch = staff.clef === 'treble' ? 67 : 53;
          const pitch = Math.max(21, Math.min(108, basePitch + staffStep));

          return {
            ...note,
            x: startX + (quantizedBeat / 4) * measureWidth,
            y: snappedY,
            startTime: quantizedBeat,
            pitch: pitch
          };
        }
        return note;
      })
    })));
  }, [isDragging, draggedNote, dragOffset, selectedNotes, noteValue]);

  // Canvas mouse up handler
  const handleCanvasMouseUp = useCallback(() => {
    setIsDragging(false);
    setDraggedNote(null);
    setDragOffset({ x: 0, y: 0 });
  }, []);

  // Render score
  const renderScore = useCallback(() => {
    const canvas = scoreCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height);

    const isDark = document.documentElement.classList.contains('dark') || 
                   document.documentElement.classList.contains('nord-dark');
    
    console.log('Theme detection - isDark:', isDark, 'classes:', document.documentElement.className);
    
    const colors = {
      staff: isDark ? '#e5e7eb' : '#374151',
      notes: isDark ? '#f9fafb' : '#1f2937',
      selected: isDark ? '#60a5fa' : '#3b82f6',
      text: isDark ? '#f3f4f6' : '#111827'
    };

    // Draw each staff
    staffs.forEach((staff, staffIndex) => {
      if (!staff.visible) return;

      const staffY = 80 + staffIndex * 120;
      const lineSpacing = 10;

      // Draw staff lines
      ctx.strokeStyle = colors.staff;
      ctx.lineWidth = 1;
      for (let i = 0; i < 5; i++) {
        const y = staffY + i * lineSpacing;
        ctx.beginPath();
        ctx.moveTo(50, y);
        ctx.lineTo(rect.width - 50, y);
        ctx.stroke();
      }

      // Draw clef
      ctx.fillStyle = colors.text;
      ctx.font = '24px serif';
      ctx.textAlign = 'center';
      ctx.fillText(staff.clef === 'treble' ? '𝄞' : '𝄢', 80, staffY + 25);

      // Draw measures
      const measureWidth = 200;
      for (let i = 0; i <= 4; i++) {
        const x = 120 + i * measureWidth;
        ctx.beginPath();
        ctx.moveTo(x, staffY);
        ctx.lineTo(x, staffY + 4 * lineSpacing);
        ctx.stroke();
      }

      // Draw notes
      staff.notes.forEach(note => {
        const measureWidth = 200;
        const startX = 150;
        const x = startX + (note.startTime / 4) * measureWidth;
        const { y } = calculateNotePosition(note.pitch, staff.clef, staffY);

        // Update note position for click detection
        note.x = x;
        note.y = y;

        // Draw note
        ctx.fillStyle = selectedNotes.has(note.id) ? colors.selected : colors.notes;
        ctx.beginPath();
        ctx.ellipse(x, y, 6, 4, 0, 0, 2 * Math.PI);
        ctx.fill();

        // Draw stem
        ctx.strokeStyle = selectedNotes.has(note.id) ? colors.selected : colors.notes;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x + 6, y);
        ctx.lineTo(x + 6, y - 30);
        ctx.stroke();

        // Note duration indicators
        if (note.duration < 1) {
          // Eighth note flag
          ctx.fillStyle = selectedNotes.has(note.id) ? colors.selected : colors.notes;
          ctx.beginPath();
          ctx.moveTo(x + 6, y - 30);
          ctx.lineTo(x + 15, y - 25);
          ctx.lineTo(x + 15, y - 20);
          ctx.lineTo(x + 6, y - 25);
          ctx.fill();
        }
      });

      // Draw instrument label
      ctx.fillStyle = colors.text;
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(staff.instrument, 10, staffY + 20);
    });
  }, [staffs, selectedNotes]);

  // Re-render when dependencies change
  useEffect(() => {
    renderScore();
  }, [renderScore]);

  // Listen for theme changes and re-render
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          setTimeout(renderScore, 0);
        }
      });
    });
    
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    
    return () => observer.disconnect();
  }, [renderScore]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isLocked) return;

      if (e.key >= '1' && e.key <= '4') {
        const durations = [4, 2, 1, 0.5];
        setNoteValue(durations[parseInt(e.key) - 1]);
        e.preventDefault();
      }

      switch (e.key.toLowerCase()) {
        case 'n':
          setCurrentTool('note');
          e.preventDefault();
          break;
        case 's':
          setCurrentTool('select');
          e.preventDefault();
          break;
        case 'delete':
        case 'backspace':
          selectedNotes.forEach(noteId => removeNote(noteId));
          e.preventDefault();
          break;
        case 'escape':
          setSelectedNotes(new Set());
          e.preventDefault();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLocked, selectedNotes, removeNote]);

  return (
    <div className="h-full flex bg-[var(--background)]">
      {/* Left Control Palette */}
      <div className="w-64 bg-[var(--muted)] border-r border-[var(--border)] flex flex-col p-4">
        <h3 className="font-semibold text-sm mb-4 text-[var(--foreground)]">Tools</h3>
        
        <div className="space-y-2 mb-6">
          <Button
            variant={currentTool === 'note' ? 'default' : 'outline'}
            size="sm"
            className="w-full justify-start"
            onClick={() => setCurrentTool('note')}
          >
            <Music className="h-4 w-4 mr-2" />
            Note Tool (N)
          </Button>
          <Button
            variant={currentTool === 'select' ? 'default' : 'outline'}
            size="sm"
            className="w-full justify-start"
            onClick={() => setCurrentTool('select')}
          >
            <MousePointer className="h-4 w-4 mr-2" />
            Select Tool (S)
          </Button>
        </div>

        <h4 className="font-medium text-sm mb-2 text-[var(--foreground)]">Note Values</h4>
        <div className="grid grid-cols-2 gap-1 mb-4">
          {[
            { value: 4, label: 'Whole', key: '1' },
            { value: 2, label: 'Half', key: '2' },
            { value: 1, label: 'Quarter', key: '3' },
            { value: 0.5, label: 'Eighth', key: '4' }
          ].map(note => (
            <Button
              key={note.value}
              variant={noteValue === note.value ? 'default' : 'outline'}
              size="sm"
              className="text-xs"
              onClick={() => setNoteValue(note.value)}
            >
              {note.label} ({note.key})
            </Button>
          ))}
        </div>

        <div className="text-xs text-[var(--muted-foreground)] space-y-1">
          <p>• Click staff to add notes</p>
          <p>• Click notes to remove them</p>
          <p>• Use Select tool to select notes</p>
          <p>• Press Delete to remove selected</p>
          <p>• Use 1-4 keys for note values</p>
        </div>
      </div>

      {/* Main Score Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Toolbar */}
        <div className="bg-[var(--background)] border-b border-[var(--border)] p-2 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              <Play className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Pause className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Square className="h-4 w-4" />
            </Button>
            
            <div className="w-px h-6 bg-[var(--border)] mx-2" />
            
            <Button variant="ghost" size="sm">
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <ZoomOut className="h-4 w-4" />
            </Button>
            
            <Select value={viewMode} onValueChange={(value: 'page' | 'continuous') => setViewMode(value)}>
              <SelectTrigger className="w-32 border-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="page">Page View</SelectItem>
                <SelectItem value="continuous">Continuous</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm text-[var(--muted-foreground)]">♩ = {currentTempo}</span>
            <Button variant="ghost" size="sm">
              <Save className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <FileDown className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 overflow-auto p-4">
          <canvas
            ref={scoreCanvasRef}
            className="w-full border border-[var(--border)] rounded cursor-pointer bg-[var(--background)]"
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            style={{ 
              minHeight: '400px',
              height: '600px'
            }}
          />
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="w-64 bg-[var(--muted)] border-l border-[var(--border)] flex flex-col">
        <div className="p-4 border-b border-[var(--border)]">
          <h3 className="font-semibold text-sm mb-2 text-[var(--foreground)]">Score Settings</h3>
          
          <div className="mb-3">
            <label className="text-xs text-[var(--muted-foreground)] mb-1 block">Key Signature</label>
            <Select value={currentKeySignature} onValueChange={setCurrentKeySignature}>
              <SelectTrigger className="w-full h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="C">C Major</SelectItem>
                <SelectItem value="G">G Major</SelectItem>
                <SelectItem value="D">D Major</SelectItem>
                <SelectItem value="F">F Major</SelectItem>
                <SelectItem value="Bb">Bb Major</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="mb-3">
            <label className="text-xs text-[var(--muted-foreground)] mb-1 block">Tempo (BPM)</label>
            <div className="flex items-center space-x-2">
              <Slider
                value={[currentTempo]}
                onValueChange={(value) => setCurrentTempo(value[0])}
                min={60}
                max={200}
                step={1}
                className="flex-1"
              />
              <span className="text-xs w-8 text-center">{currentTempo}</span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {staffs.map((staff) => (
            <div
              key={staff.id}
              className="p-3 border-b border-[var(--border)]"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm">{staff.instrument}</span>
                <div className="flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => {
                      setStaffs(prev => prev.map(s => 
                        s.id === staff.id ? {...s, visible: !s.visible} : s
                      ));
                    }}
                  >
                    {staff.visible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => {
                      setStaffs(prev => prev.map(s => 
                        s.id === staff.id ? {...s, locked: !s.locked} : s
                      ));
                    }}
                  >
                    {staff.locked ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
                  </Button>
                </div>
              </div>
              
              <div className="text-xs text-[var(--muted-foreground)] mb-2">
                {staff.clef === 'treble' ? '𝄞' : '𝄢'} {staff.keySignature} {staff.timeSignature[0]}/{staff.timeSignature[1]}
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => onTrackMute(staff.id)}
                >
                  <VolumeX className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => onTrackSolo(staff.id)}
                >
                  <Radio className="h-3 w-3" />
                </Button>
                <Slider
                  value={[staff.volume]}
                  onValueChange={(value) => {
                    setStaffs(prev => prev.map(s => 
                      s.id === staff.id ? {...s, volume: value[0]} : s
                    ));
                  }}
                  min={0}
                  max={100}
                  step={1}
                  className="flex-1"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="p-2 border-t border-[var(--border)]">
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
                instrument: 'Piano',
                notes: [],
                visible: true,
                locked: false,
                volume: 100
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