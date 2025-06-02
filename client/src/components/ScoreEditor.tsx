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
  pitch: number;
  startTime: number;
  duration: number;
  velocity: number;
  accidental?: 'sharp' | 'flat' | 'natural' | 'double-sharp' | 'double-flat';
  articulation?: string[];
  tie?: { start: boolean; end: boolean; };
  slur?: string;
  beam?: string;
  tuplet?: { type: number; bracket: boolean; };
  lyrics?: string;
  fingering?: string;
}

interface Chord {
  id: string;
  notes: Note[];
  startTime: number;
  duration: number;
  symbol?: string;
}

interface Dynamic {
  id: string;
  time: number;
  marking: string;
  type: 'dynamic' | 'crescendo' | 'diminuendo';
  endTime?: number;
}

interface TempoMarking {
  id: string;
  time: number;
  bpm: number;
  text?: string;
}

interface RehearsalMark {
  id: string;
  time: number;
  letter: string;
}

interface Measure {
  id: string;
  number: number;
  timeSignature?: [number, number];
  keySignature?: string;
  barlineType: 'single' | 'double' | 'final' | 'repeat-start' | 'repeat-end' | 'invisible';
  repeatCount?: number;
}

interface Staff {
  id: string;
  clef: 'treble' | 'bass' | 'alto' | 'tenor' | 'percussion';
  keySignature: string;
  timeSignature: [number, number];
  instrument: string;
  tempo: number;
  notes: Note[];
  chords: Chord[];
  dynamics: Dynamic[];
  tempoMarkings: TempoMarking[];
  rehearsalMarks: RehearsalMark[];
  measures: Measure[];
  visible: boolean;
  locked: boolean;
  volume: number;
  pan: number;
  midiChannel: number;
  transposition: number;
  capo?: number;
  tuning?: string[];
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
  const [currentTool, setCurrentTool] = useState<'select' | 'note' | 'rest' | 'chord' | 'dynamics' | 'text'>('select');
  const [noteValue, setNoteValue] = useState<number>(1);
  const [currentAccidental, setCurrentAccidental] = useState<'sharp' | 'flat' | 'natural' | 'double-sharp' | 'double-flat' | null>(null);
  const [currentArticulation, setCurrentArticulation] = useState<string | null>(null);
  const [currentKeySignature, setCurrentKeySignature] = useState<string>('C');
  const [currentTimeSignature, setCurrentTimeSignature] = useState<[number, number]>(timeSignature);
  const [currentTempo, setCurrentTempo] = useState<number>(bpm);
  const [currentDynamic, setCurrentDynamic] = useState<string>('mf');
  const [viewMode, setViewMode] = useState<'page' | 'continuous' | 'single'>('page');

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
      visible: true,
      locked: false,
      volume: 100,
      pan: 0
    }
  ]);

  const scoreCanvasRef = useRef<HTMLCanvasElement>(null);

  // Helper functions
  const getKeySignatureAccidentals = useCallback((keySignature: string) => {
    const signatures: Record<string, Array<{symbol: string, line: number}>> = {
      'C': [],
      'G': [{ symbol: '♯', line: 5 }],
      'D': [{ symbol: '♯', line: 5 }, { symbol: '♯', line: 2 }],
      'F': [{ symbol: '♭', line: 4 }],
      'Bb': [{ symbol: '♭', line: 4 }, { symbol: '♭', line: 1 }],
    };
    return signatures[keySignature] || [];
  }, []);

  const getNotePosition = useCallback((pitch: number, clef: string, staffY: number, staffLineSpacing: number) => {
    let noteY = staffY;
    const needsLedgerLines: number[] = [];

    if (clef === 'treble') {
      const g4Position = staffY + staffLineSpacing * 3;
      const semitoneOffset = pitch - 67;
      const stepOffset = Math.round(semitoneOffset * 0.5);
      noteY = g4Position - stepOffset * (staffLineSpacing / 2);
    } else if (clef === 'bass') {
      const f3Position = staffY + staffLineSpacing;
      const semitoneOffset = pitch - 53;
      const stepOffset = Math.round(semitoneOffset * 0.5);
      noteY = f3Position - stepOffset * (staffLineSpacing / 2);
    }

    const staffTop = staffY;
    const staffBottom = staffY + staffLineSpacing * 4;
    
    if (noteY < staffTop) {
      for (let y = staffTop - staffLineSpacing; y >= noteY; y -= staffLineSpacing) {
        needsLedgerLines.push(y);
      }
    } else if (noteY > staffBottom) {
      for (let y = staffBottom + staffLineSpacing; y <= noteY; y += staffLineSpacing) {
        needsLedgerLines.push(y);
      }
    }

    return { noteY, needsLedgerLines };
  }, []);

  const getNoteSymbol = useCallback((duration: number) => {
    if (duration >= 4) return '𝅝';
    if (duration >= 2) return '𝅗𝅥';
    if (duration >= 1) return '𝅘𝅥';
    if (duration >= 0.5) return '𝅘𝅥𝅮';
    return '𝅘𝅥𝅯';
  }, []);

  const getAccidentalSymbol = useCallback((accidental: string) => {
    const symbols: Record<string, string> = {
      'sharp': '♯',
      'flat': '♭',
      'natural': '♮',
      'double-sharp': '𝄪',
      'double-flat': '𝄫'
    };
    return symbols[accidental] || '';
  }, []);

  // Score rendering function
  const renderScore = useCallback(() => {
    const canvas = scoreCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const canvasWidth = rect.width;
    const canvasHeight = rect.height;

    const isDark = document.documentElement.classList.contains('nord-dark') || document.documentElement.classList.contains('dark');
    const colors = {
      background: isDark ? '#2e3440' : '#eceff4',
      staffLines: isDark ? '#81a1c1' : '#2e3440',
      notes: isDark ? '#eceff4' : '#2e3440',
      text: isDark ? '#d8dee9' : '#2e3440',
      selectedNote: '#5e81ac',
      measureLines: isDark ? '#4c566a' : '#d8dee9',
      ledgerLines: isDark ? '#81a1c1' : '#2e3440',
      accidentals: isDark ? '#eceff4' : '#2e3440',
      dynamics: isDark ? '#b48ead' : '#5e81ac',
      tempo: isDark ? '#ebcb8b' : '#d08770'
    };

    ctx.fillStyle = colors.background;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    const pageMargin = 60;
    const systemSpacing = 120;
    const staffLineSpacing = 8;
    const staffHeight = staffLineSpacing * 4;
    const measureWidth = (canvasWidth - pageMargin * 2 - 200) / 4;

    // Title
    ctx.fillStyle = colors.text;
    ctx.font = 'bold 24px serif';
    ctx.textAlign = 'center';
    ctx.fillText('Score Editor', canvasWidth / 2, 40);

    // Render each staff
    staffs.forEach((staff, staffIndex) => {
      if (!staff.visible) return;

      const systemY = 100 + staffIndex * systemSpacing;
      const staffY = systemY + 20;
      
      // Staff lines
      ctx.strokeStyle = colors.staffLines;
      ctx.lineWidth = 1.2;
      
      for (let i = 0; i < 5; i++) {
        const lineY = staffY + i * staffLineSpacing;
        ctx.beginPath();
        ctx.moveTo(pageMargin + 100, lineY);
        ctx.lineTo(canvasWidth - pageMargin, lineY);
        ctx.stroke();
      }

      // Clef
      ctx.fillStyle = colors.text;
      ctx.font = '32px serif';
      ctx.textAlign = 'center';
      
      const clefSymbols = {
        treble: '𝄞',
        bass: '𝄢',
        alto: '𝄡',
        tenor: '𝄡',
        percussion: '𝄥'
      };
      
      ctx.fillText(clefSymbols[staff.clef], pageMargin + 50, staffY + staffLineSpacing * 2.5);

      // Key signature
      ctx.font = '20px serif';
      let keySignatureX = pageMargin + 80;
      
      const keySignatureAccidentals = getKeySignatureAccidentals(staff.keySignature);
      keySignatureAccidentals.forEach((accidental, index) => {
        const accidentalY = staffY + accidental.line * (staffLineSpacing / 2);
        ctx.fillText(accidental.symbol, keySignatureX + index * 12, accidentalY);
      });

      // Time signature
      ctx.font = 'bold 24px serif';
      const timeSignatureX = keySignatureX + (keySignatureAccidentals.length * 12) + 20;
      ctx.fillText(staff.timeSignature[0].toString(), timeSignatureX, staffY + staffLineSpacing);
      ctx.fillText(staff.timeSignature[1].toString(), timeSignatureX, staffY + staffLineSpacing * 3);

      // Measure lines
      const firstMeasureX = timeSignatureX + 30;
      
      for (let i = 0; i <= 4; i++) {
        const measureX = firstMeasureX + i * measureWidth;
        ctx.strokeStyle = i === 4 ? colors.staffLines : colors.measureLines;
        ctx.lineWidth = i === 4 ? 3 : 1;
        ctx.beginPath();
        ctx.moveTo(measureX, staffY);
        ctx.lineTo(measureX, staffY + staffHeight);
        ctx.stroke();
      }

      // Notes
      staff.notes.forEach(note => {
        const measureNumber = Math.floor(note.startTime / staff.timeSignature[0]);
        const beatInMeasure = note.startTime % staff.timeSignature[0];
        const noteX = firstMeasureX + measureNumber * measureWidth + (beatInMeasure / staff.timeSignature[0]) * measureWidth;
        
        const { noteY, needsLedgerLines } = getNotePosition(note.pitch, staff.clef, staffY, staffLineSpacing);
        
        ctx.fillStyle = selectedNotes.has(note.id) ? colors.selectedNote : colors.notes;
        
        // Ledger lines
        if (needsLedgerLines.length > 0) {
          ctx.strokeStyle = colors.ledgerLines;
          ctx.lineWidth = 1;
          needsLedgerLines.forEach(ledgerY => {
            ctx.beginPath();
            ctx.moveTo(noteX - 15, ledgerY);
            ctx.lineTo(noteX + 15, ledgerY);
            ctx.stroke();
          });
        }
        
        // Note head
        const noteSymbol = getNoteSymbol(note.duration);
        ctx.font = '24px serif';
        ctx.textAlign = 'center';
        ctx.fillText(noteSymbol, noteX, noteY);

        // Stem
        if (note.duration < 4) {
          const stemDirection = noteY < staffY + staffLineSpacing * 2.5 ? 1 : -1;
          const stemLength = staffLineSpacing * 3.5;
          const stemX = noteX + (stemDirection > 0 ? 8 : -8);
          
          ctx.strokeStyle = colors.notes;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(stemX, noteY - 2);
          ctx.lineTo(stemX, noteY - (stemLength * stemDirection));
          ctx.stroke();
        }

        // Accidental
        if (note.accidental) {
          const accidentalSymbol = getAccidentalSymbol(note.accidental);
          ctx.font = '18px serif';
          ctx.fillText(accidentalSymbol, noteX - 25, noteY);
        }
      });

      // Instrument name
      ctx.fillStyle = colors.text;
      ctx.font = '14px serif';
      ctx.textAlign = 'right';
      ctx.fillText(staff.instrument, pageMargin + 40, staffY + staffLineSpacing * 2);
    });
  }, [staffs, selectedNotes, getKeySignatureAccidentals, getNotePosition, getNoteSymbol, getAccidentalSymbol]);

  useEffect(() => {
    renderScore();
    
    // Listen for theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          setTimeout(renderScore, 0); // Small delay to ensure class changes are applied
        }
      });
    });
    
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    
    return () => observer.disconnect();
  }, [renderScore]);

  // Handle canvas click
  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isLocked || currentTool !== 'note') return;

    const canvas = scoreCanvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const staffIndex = Math.floor((y - 120) / 120);
    const staff = staffs[staffIndex];
    
    if (!staff || !staff.visible) return;

    const measureWidth = (rect.width - 260) / 4;
    const clickTime = Math.max(0, ((x - 190) / measureWidth) * staff.timeSignature[0]);
    
    if (clickTime >= 0) {
      const staffY = 120 + staffIndex * 120;
      const relativeY = y - staffY;
      const pitchOffset = Math.round((32 - relativeY) / 4);
      const pitch = 60 + pitchOffset;

      const newNote: Note = {
        id: `note-${Date.now()}`,
        pitch: pitch,
        startTime: Math.round(clickTime * 4) / 4,
        duration: noteValue,
        velocity: 80,
        accidental: currentAccidental || undefined,
        articulation: currentArticulation ? [currentArticulation] : undefined
      };

      setStaffs(prevStaffs => 
        prevStaffs.map((s, i) => 
          i === staffIndex 
            ? { ...s, notes: [...s.notes, newNote] }
            : s
        )
      );
    }
  }, [isLocked, currentTool, noteValue, currentAccidental, currentArticulation, staffs]);

  // Control palette categories
  const paletteCategories = {
    'Notation': [
      { id: 'whole', icon: '𝅝', label: 'Whole Note', action: () => setNoteValue(4) },
      { id: 'half', icon: '𝅗𝅥', label: 'Half Note', action: () => setNoteValue(2) },
      { id: 'quarter', icon: '𝅘𝅥', label: 'Quarter Note', action: () => setNoteValue(1) },
      { id: 'eighth', icon: '𝅘𝅥𝅮', label: 'Eighth Note', action: () => setNoteValue(0.5) },
      { id: 'sixteenth', icon: '𝅘𝅥𝅯', label: 'Sixteenth Note', action: () => setNoteValue(0.25) },
    ],
    'Accidentals & Pitch': [
      { id: 'sharp', icon: '♯', label: 'Sharp', action: () => setCurrentAccidental('sharp') },
      { id: 'flat', icon: '♭', label: 'Flat', action: () => setCurrentAccidental('flat') },
      { id: 'natural', icon: '♮', label: 'Natural', action: () => setCurrentAccidental('natural') },
      { id: 'clear', icon: '✕', label: 'Clear', action: () => setCurrentAccidental(null) }
    ],
    'Clefs & Signatures': [
      { id: 'treble-clef', icon: '𝄞', label: 'Treble Clef', action: () => {} },
      { id: 'bass-clef', icon: '𝄢', label: 'Bass Clef', action: () => {} },
    ],
    'Dynamics & Expression': [
      { id: 'pp', icon: 'pp', label: 'Piano', action: () => setCurrentDynamic('pp') },
      { id: 'mf', icon: 'mf', label: 'Mezzo Forte', action: () => setCurrentDynamic('mf') },
      { id: 'ff', icon: 'ff', label: 'Fortissimo', action: () => setCurrentDynamic('ff') },
    ],
    'Structure & Layout': [
      { id: 'barline', icon: '|', label: 'Barline', action: () => {} },
      { id: 'double-barline', icon: '||', label: 'Double Barline', action: () => {} },
    ]
  };

  return (
    <div className="h-full flex bg-[var(--background)]">
      {/* Left Control Palette */}
      <div className="w-64 bg-[var(--muted)] border-r border-[var(--border)] flex flex-col">
        <div className="border-b border-[var(--border)]">
          <Select value={selectedPaletteCategory} onValueChange={setSelectedPaletteCategory}>
            <SelectTrigger className="w-full border-0 rounded-none">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(paletteCategories).map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 p-2 overflow-y-auto">
          <div className="grid grid-cols-3 gap-1">
            {paletteCategories[selectedPaletteCategory as keyof typeof paletteCategories]?.map(item => (
              <Button
                key={item.id}
                variant="ghost"
                size="sm"
                className="h-12 p-1 flex flex-col items-center justify-center text-xs hover:bg-[var(--accent)] text-[var(--foreground)]"
                onClick={item.action}
                title={item.label}
              >
                <span className="text-lg font-serif leading-none">{item.icon}</span>
                <span className="text-[10px] mt-1 leading-none">{item.label.split(' ')[0]}</span>
              </Button>
            ))}
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 p-2">
          <div className="grid grid-cols-3 gap-1">
            <Button
              variant={currentTool === 'select' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setCurrentTool('select')}
              title="Select Tool"
            >
              <MousePointer className="h-4 w-4" />
            </Button>
            <Button
              variant={currentTool === 'note' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setCurrentTool('note')}
              title="Note Tool"
            >
              <Music className="h-4 w-4" />
            </Button>
            <Button
              variant={currentTool === 'text' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setCurrentTool('text')}
              title="Text Tool"
            >
              <Type className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Score Area */}
      <div className="flex-1 flex flex-col">
        <div className="h-12 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" title="Play">
              <Play className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" title="Pause">
              <Pause className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" title="Stop">
              <Square className="h-4 w-4" />
            </Button>
            
            <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-2" />
            
            <Button variant="ghost" size="sm" title="Zoom In">
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" title="Zoom Out">
              <ZoomOut className="h-4 w-4" />
            </Button>
            
            <Select value={viewMode} onValueChange={(value: 'page' | 'continuous' | 'single') => setViewMode(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="page">Page View</SelectItem>
                <SelectItem value="continuous">Continuous</SelectItem>
                <SelectItem value="single">Single Line</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">♩ = {currentTempo}</span>
            <span className="text-sm text-gray-600 dark:text-gray-400">{currentTimeSignature[0]}/{currentTimeSignature[1]}</span>
            
            <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-2" />
            
            <Button variant="ghost" size="sm" title="Save">
              <Save className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" title="Export">
              <FileDown className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" title="Settings">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4 bg-[var(--background)] text-[var(--foreground)]">
          <canvas
            ref={scoreCanvasRef}
            className="w-full h-full border border-gray-200 dark:border-gray-700 rounded cursor-pointer"
            onClick={handleCanvasClick}
            style={{ 
              minHeight: '600px',
              backgroundColor: 'transparent'
            }}
          />
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="w-64 bg-[var(--muted)] border-l border-[var(--border)] flex flex-col">
        <div className="p-4 border-b border-[var(--border)]">
          <h3 className="font-semibold text-sm mb-2 text-[var(--foreground)]">Staff Controls</h3>
          
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
          {staffs.map((staff, index) => (
            <div
              key={staff.id}
              className={`p-3 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${
                selectedStaff === staff.id ? 'bg-blue-50 dark:bg-blue-900' : ''
              }`}
              onClick={() => setSelectedStaff(staff.id)}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm">{staff.instrument}</span>
                <div className="flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      setStaffs(prev => prev.map(s => s.id === staff.id ? {...s, visible: !s.visible} : s));
                    }}
                  >
                    {staff.visible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      setStaffs(prev => prev.map(s => s.id === staff.id ? {...s, locked: !s.locked} : s));
                    }}
                  >
                    {staff.locked ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
                  </Button>
                </div>
              </div>
              
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                {staff.clef === 'treble' ? '𝄞' : '𝄢'} {staff.keySignature} {staff.timeSignature[0]}/{staff.timeSignature[1]}
              </div>
              
              <div className="flex items-center space-x-2">
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
                  <Radio className="h-3 w-3" />
                </Button>
                <Slider
                  value={[staff.volume]}
                  onValueChange={(value) => {
                    setStaffs(prev => prev.map(s => s.id === staff.id ? {...s, volume: value[0]} : s));
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

        <div className="p-2 border-t border-gray-200 dark:border-gray-700">
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
                tempo: 120,
                notes: [],
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