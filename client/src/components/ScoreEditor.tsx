import { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { AudioTrack, TransportState } from '../types/audio';
import { 
  Music,
  Edit3,
  Play,
  Pause,
  Square,
  SkipBack,
  SkipForward,
  ZoomIn,
  ZoomOut,
  Save,
  FileDown,
  Settings,
  Volume2,
  VolumeX,
  Radio,
  Minus,
  Plus,
  RotateCcw,
  RotateCw,
  Copy,
  Scissors,
  Move,
  MousePointer,
  Type,
  Circle,
  Square as SquareIcon,
  Triangle,
  Diamond,
  Music2,
  Music3,
  Music4,
  Clef,
  Hash,
  Clock,
  Zap,
  MoreHorizontal,
  Repeat,
  ArrowRight,
  BarChart3,
  FileMusic,
  Palette,
  Layers,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Keyboard
} from 'lucide-react';

interface Note {
  id: string;
  pitch: number; // MIDI note number (21-108 for piano)
  startTime: number; // Start time in quarter notes
  duration: number; // Duration in quarter notes (0.25=sixteenth, 0.5=eighth, 1=quarter, 2=half, 4=whole)
  velocity: number; // 0-127
  accidental?: 'sharp' | 'flat' | 'natural' | 'double-sharp' | 'double-flat';
  articulation?: string[];
  tie?: boolean;
  slur?: string; // slur group ID
  beam?: string; // beam group ID
}

interface Staff {
  id: string;
  clef: 'treble' | 'bass' | 'alto' | 'tenor' | 'percussion';
  keySignature: string; // 'C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#', 'F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb'
  timeSignature: [number, number];
  instrument: string;
  tempo: number;
  notes: Note[];
  chords: any[];
  dynamics: Array<{ time: number; marking: string; }>;
  measures: Array<{ id: string; number: number; barline: string; }>;
  visible: boolean;
  locked: boolean;
  volume: number;
  pan: number;
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
  const [currentClef, setCurrentClef] = useState<'treble' | 'bass' | 'alto' | 'tenor' | 'percussion'>('treble');
  const [currentKeySignature, setCurrentKeySignature] = useState<string>('C');
  const [currentTimeSignature, setCurrentTimeSignature] = useState<[number, number]>(timeSignature);
  const [currentTempo, setCurrentTempo] = useState<number>(bpm);
  const [currentDynamic, setCurrentDynamic] = useState<string>('mf');
  const [playbackTime, setPlaybackTime] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [viewMode, setViewMode] = useState<'page' | 'continuous' | 'single'>('page');
  const [showGrid, setShowGrid] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);

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
        { time: 0, marking: 'mf' }
      ],
      measures: [
        { id: 'measure-1', number: 1, barline: 'single' },
        { id: 'measure-2', number: 2, barline: 'single' },
        { id: 'measure-3', number: 3, barline: 'single' },
        { id: 'measure-4', number: 4, barline: 'double' }
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

  // Score rendering function
  const renderScore = useCallback(() => {
    const canvas = scoreCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set canvas size
    canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const canvasWidth = canvas.offsetWidth;
    const canvasHeight = canvas.offsetHeight;

    // Colors based on theme
    const isDark = document.documentElement.classList.contains('dark');
    const colors = {
      background: isDark ? '#1a1a1a' : '#ffffff',
      staffLines: isDark ? '#404040' : '#000000',
      notes: isDark ? '#ffffff' : '#000000',
      text: isDark ? '#ffffff' : '#000000',
      selectedNote: isDark ? '#3b82f6' : '#2563eb',
      playhead: '#ef4444'
    };

    // Set background
    ctx.fillStyle = colors.background;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Render each staff
    staffs.forEach((staff, staffIndex) => {
      if (!staff.visible) return;

      const staffY = 80 + staffIndex * (staffHeight + 40);
      
      // Draw staff lines
      ctx.strokeStyle = colors.staffLines;
      ctx.lineWidth = 1;
      
      for (let i = 0; i < 5; i++) {
        const lineY = staffY + i * lineSpacing;
        ctx.beginPath();
        ctx.moveTo(60, lineY);
        ctx.lineTo(canvasWidth - 60, lineY);
        ctx.stroke();
      }

      // Draw clef
      ctx.fillStyle = colors.text;
      ctx.font = '24px serif';
      ctx.textAlign = 'center';
      
      const clefSymbols = {
        treble: '𝄞',
        bass: '𝄢',
        alto: '𝄡',
        tenor: '𝄡',
        percussion: '𝄥'
      };
      
      ctx.fillText(clefSymbols[staff.clef], 40, staffY + 30);

      // Draw key signature
      ctx.font = '16px serif';
      let keySignatureX = 80;
      
      const keySignatureAccidentals = getKeySignatureAccidentals(staff.keySignature);
      keySignatureAccidentals.forEach((accidental, index) => {
        ctx.fillText(accidental.symbol, keySignatureX + index * 15, staffY + accidental.line * lineSpacing / 2);
      });

      // Draw time signature
      ctx.font = '20px serif';
      ctx.fillText(staff.timeSignature[0].toString(), keySignatureX + 40, staffY + 10);
      ctx.fillText(staff.timeSignature[1].toString(), keySignatureX + 40, staffY + 35);

      // Draw measure lines
      const measuresPerStaff = 4;
      const measureWidth = (canvasWidth - 200) / measuresPerStaff;
      
      for (let i = 0; i <= measuresPerStaff; i++) {
        const measureX = 120 + i * measureWidth;
        ctx.beginPath();
        ctx.moveTo(measureX, staffY);
        ctx.lineTo(measureX, staffY + 48);
        ctx.stroke();
      }

      // Draw notes
      staff.notes.forEach(note => {
        const noteX = 120 + (note.startTime / staff.timeSignature[0]) * measureWidth + (note.startTime % staff.timeSignature[0]) * (measureWidth / staff.timeSignature[0]);
        const noteY = getNoteYPosition(note.pitch, staff.clef, staffY);
        
        ctx.fillStyle = selectedNotes.has(note.id) ? colors.selectedNote : colors.notes;
        
        // Draw note head
        const noteSymbol = getNoteSymbol(note.duration);
        ctx.font = '20px serif';
        ctx.textAlign = 'center';
        ctx.fillText(noteSymbol, noteX, noteY);

        // Draw stem
        if (note.duration <= 2) {
          ctx.beginPath();
          ctx.moveTo(noteX + 8, noteY - 5);
          ctx.lineTo(noteX + 8, noteY - 35);
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        // Draw accidental
        if (note.accidental) {
          const accidentalSymbol = getAccidentalSymbol(note.accidental);
          ctx.font = '16px serif';
          ctx.fillText(accidentalSymbol, noteX - 20, noteY);
        }
      });

      // Draw playhead
      if (isPlaying && playbackTime !== null) {
        const playheadX = 120 + (playbackTime / staff.timeSignature[0]) * measureWidth;
        ctx.strokeStyle = colors.playhead;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(playheadX, staffY - 10);
        ctx.lineTo(playheadX, staffY + 58);
        ctx.stroke();
      }
    });
  }, [staffs, selectedNotes, isPlaying, playbackTime, zoomLevel]);

  // Helper functions
  const getKeySignatureAccidentals = (keySignature: string) => {
    const signatures: Record<string, Array<{symbol: string, line: number}>> = {
      'C': [],
      'G': [{ symbol: '♯', line: 5 }],
      'D': [{ symbol: '♯', line: 5 }, { symbol: '♯', line: 2 }],
      'A': [{ symbol: '♯', line: 5 }, { symbol: '♯', line: 2 }, { symbol: '♯', line: 6 }],
      'E': [{ symbol: '♯', line: 5 }, { symbol: '♯', line: 2 }, { symbol: '♯', line: 6 }, { symbol: '♯', line: 3 }],
      'B': [{ symbol: '♯', line: 5 }, { symbol: '♯', line: 2 }, { symbol: '♯', line: 6 }, { symbol: '♯', line: 3 }, { symbol: '♯', line: 7 }],
      'F#': [{ symbol: '♯', line: 5 }, { symbol: '♯', line: 2 }, { symbol: '♯', line: 6 }, { symbol: '♯', line: 3 }, { symbol: '♯', line: 7 }, { symbol: '♯', line: 4 }],
      'C#': [{ symbol: '♯', line: 5 }, { symbol: '♯', line: 2 }, { symbol: '♯', line: 6 }, { symbol: '♯', line: 3 }, { symbol: '♯', line: 7 }, { symbol: '♯', line: 4 }, { symbol: '♯', line: 1 }],
      'F': [{ symbol: '♭', line: 4 }],
      'Bb': [{ symbol: '♭', line: 4 }, { symbol: '♭', line: 1 }],
      'Eb': [{ symbol: '♭', line: 4 }, { symbol: '♭', line: 1 }, { symbol: '♭', line: 5 }],
      'Ab': [{ symbol: '♭', line: 4 }, { symbol: '♭', line: 1 }, { symbol: '♭', line: 5 }, { symbol: '♭', line: 2 }],
      'Db': [{ symbol: '♭', line: 4 }, { symbol: '♭', line: 1 }, { symbol: '♭', line: 5 }, { symbol: '♭', line: 2 }, { symbol: '♭', line: 6 }],
      'Gb': [{ symbol: '♭', line: 4 }, { symbol: '♭', line: 1 }, { symbol: '♭', line: 5 }, { symbol: '♭', line: 2 }, { symbol: '♭', line: 6 }, { symbol: '♭', line: 3 }],
      'Cb': [{ symbol: '♭', line: 4 }, { symbol: '♭', line: 1 }, { symbol: '♭', line: 5 }, { symbol: '♭', line: 2 }, { symbol: '♭', line: 6 }, { symbol: '♭', line: 3 }, { symbol: '♭', line: 7 }]
    };
    return signatures[keySignature] || [];
  };

  const getNoteYPosition = (pitch: number, clef: string, staffY: number) => {
    // Convert MIDI pitch to staff position
    const middleC = 60;
    const pitchOffset = pitch - middleC;
    
    // Treble clef: middle C is one ledger line below the staff
    if (clef === 'treble') {
      return staffY + 48 + 6 - (pitchOffset * 3);
    }
    // Bass clef: middle C is one ledger line above the staff
    else if (clef === 'bass') {
      return staffY - 6 - (pitchOffset * 3);
    }
    // Default to treble
    return staffY + 48 + 6 - (pitchOffset * 3);
  };

  const getNoteSymbol = (duration: number) => {
    if (duration >= 4) return '𝅝'; // whole note
    if (duration >= 2) return '𝅗𝅥'; // half note
    if (duration >= 1) return '𝅘𝅥'; // quarter note
    if (duration >= 0.5) return '𝅘𝅥𝅮'; // eighth note
    return '𝅘𝅥𝅯'; // sixteenth note
  };

  const getAccidentalSymbol = (accidental: string) => {
    const symbols: Record<string, string> = {
      'sharp': '♯',
      'flat': '♭',
      'natural': '♮',
      'double-sharp': '𝄪',
      'double-flat': '𝄫'
    };
    return symbols[accidental] || '';
  };

  // Render score when dependencies change
  useEffect(() => {
    renderScore();
  }, [renderScore]);

  // Handle canvas click
  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isLocked) return;

    const canvas = scoreCanvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Find clicked staff and position
    const staffIndex = Math.floor((y - 80) / (staffHeight + 40));
    const staff = staffs[staffIndex];
    
    if (!staff || !staff.visible) return;

    const staffY = 80 + staffIndex * (staffHeight + 40);
    const measureWidth = (canvas.offsetWidth - 200) / 4;
    const clickTime = ((x - 120) / measureWidth) * staff.timeSignature[0];
    
    if (currentTool === 'note' && clickTime >= 0) {
      // Calculate pitch from Y position
      const relativeY = y - staffY;
      const pitchOffset = Math.round((48 + 6 - relativeY) / 3);
      const pitch = 60 + pitchOffset; // Middle C + offset

      // Add new note
      const newNote: Note = {
        id: `note-${Date.now()}`,
        pitch: pitch,
        startTime: Math.max(0, Math.round(clickTime * 4) / 4), // Snap to sixteenth notes
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
      { id: 'whole-rest', icon: '𝄻', label: 'Whole Rest', action: () => setCurrentTool('rest') },
      { id: 'half-rest', icon: '𝄼', label: 'Half Rest', action: () => setCurrentTool('rest') },
      { id: 'quarter-rest', icon: '𝄽', label: 'Quarter Rest', action: () => setCurrentTool('rest') },
      { id: 'eighth-rest', icon: '𝄾', label: 'Eighth Rest', action: () => setCurrentTool('rest') },
      { id: 'sixteenth-rest', icon: '𝄿', label: 'Sixteenth Rest', action: () => setCurrentTool('rest') }
    ],
    'Accidentals & Pitch': [
      { id: 'sharp', icon: '♯', label: 'Sharp', action: () => setCurrentAccidental('sharp') },
      { id: 'flat', icon: '♭', label: 'Flat', action: () => setCurrentAccidental('flat') },
      { id: 'natural', icon: '♮', label: 'Natural', action: () => setCurrentAccidental('natural') },
      { id: 'double-sharp', icon: '𝄪', label: 'Double Sharp', action: () => setCurrentAccidental('double-sharp') },
      { id: 'double-flat', icon: '𝄫', label: 'Double Flat', action: () => setCurrentAccidental('double-flat') },
      { id: 'clear-accidental', icon: '✕', label: 'Clear', action: () => setCurrentAccidental(null) }
    ],
    'Clefs & Signatures': [
      { id: 'treble-clef', icon: '𝄞', label: 'Treble Clef', action: () => setCurrentClef('treble') },
      { id: 'bass-clef', icon: '𝄢', label: 'Bass Clef', action: () => setCurrentClef('bass') },
      { id: 'alto-clef', icon: '𝄡', label: 'Alto Clef', action: () => setCurrentClef('alto') },
      { id: 'tenor-clef', icon: '𝄡', label: 'Tenor Clef', action: () => setCurrentClef('tenor') },
      { id: 'percussion-clef', icon: '𝄥', label: 'Percussion', action: () => setCurrentClef('percussion') }
    ],
    'Dynamics & Expression': [
      { id: 'ppp', icon: 'ppp', label: 'Pianissimo', action: () => setCurrentDynamic('ppp') },
      { id: 'pp', icon: 'pp', label: 'Piano', action: () => setCurrentDynamic('pp') },
      { id: 'p', icon: 'p', label: 'Piano', action: () => setCurrentDynamic('p') },
      { id: 'mp', icon: 'mp', label: 'Mezzo Piano', action: () => setCurrentDynamic('mp') },
      { id: 'mf', icon: 'mf', label: 'Mezzo Forte', action: () => setCurrentDynamic('mf') },
      { id: 'f', icon: 'f', label: 'Forte', action: () => setCurrentDynamic('f') },
      { id: 'ff', icon: 'ff', label: 'Fortissimo', action: () => setCurrentDynamic('ff') },
      { id: 'fff', icon: 'fff', label: 'Fortississimo', action: () => setCurrentDynamic('fff') },
      { id: 'crescendo', icon: '𝖡', label: 'Crescendo', action: () => setCurrentTool('dynamics') },
      { id: 'diminuendo', icon: '𝖣', label: 'Diminuendo', action: () => setCurrentTool('dynamics') },
      { id: 'accent', icon: '>', label: 'Accent', action: () => setCurrentArticulation('accent') },
      { id: 'staccato', icon: '•', label: 'Staccato', action: () => setCurrentArticulation('staccato') },
      { id: 'legato', icon: '⌒', label: 'Legato', action: () => setCurrentArticulation('legato') },
      { id: 'tenuto', icon: '−', label: 'Tenuto', action: () => setCurrentArticulation('tenuto') },
      { id: 'fermata', icon: '𝄐', label: 'Fermata', action: () => setCurrentArticulation('fermata') }
    ],
    'Structure & Layout': [
      { id: 'barline', icon: '|', label: 'Barline', action: () => setCurrentTool('text') },
      { id: 'double-barline', icon: '||', label: 'Double Barline', action: () => setCurrentTool('text') },
      { id: 'final-barline', icon: '|]', label: 'Final Barline', action: () => setCurrentTool('text') },
      { id: 'repeat-start', icon: '|:', label: 'Repeat Start', action: () => setCurrentTool('text') },
      { id: 'repeat-end', icon: ':|', label: 'Repeat End', action: () => setCurrentTool('text') },
      { id: 'da-capo', icon: 'D.C.', label: 'Da Capo', action: () => setCurrentTool('text') },
      { id: 'dal-segno', icon: 'D.S.', label: 'Dal Segno', action: () => setCurrentTool('text') },
      { id: 'coda', icon: '𝄌', label: 'Coda', action: () => setCurrentTool('text') },
      { id: 'segno', icon: '𝄋', label: 'Segno', action: () => setCurrentTool('text') },
      { id: 'tie', icon: '⌐', label: 'Tie', action: () => setCurrentTool('tie') },
      { id: 'slur', icon: '⌒', label: 'Slur', action: () => setCurrentTool('slur') },
      { id: 'beam', icon: '𝅛', label: 'Beam', action: () => setCurrentTool('beam') }
    ]
  };

  return (
    <div className="h-full flex bg-white dark:bg-gray-900">
      {/* Left Control Palette */}
      <div className="w-64 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        {/* Palette Category Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700">
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

        {/* Palette Items */}
        <div className="flex-1 p-2 overflow-y-auto">
          <div className="grid grid-cols-3 gap-1">
            {paletteCategories[selectedPaletteCategory as keyof typeof paletteCategories]?.map(item => (
              <Button
                key={item.id}
                variant="ghost"
                size="sm"
                className="h-12 p-1 flex flex-col items-center justify-center text-xs hover:bg-blue-50 dark:hover:bg-blue-900"
                onClick={item.action}
                title={item.label}
              >
                <span className="text-lg font-serif leading-none">{item.icon}</span>
                <span className="text-[10px] mt-1 leading-none">{item.label.split(' ')[0]}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Tool Selection */}
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
        {/* Top Toolbar */}
        <div className="h-12 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {/* Playback Controls */}
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
            
            {/* View Controls */}
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
            {/* Tempo and Time Signature */}
            <span className="text-sm text-gray-600 dark:text-gray-400">♩ = {currentTempo}</span>
            <span className="text-sm text-gray-600 dark:text-gray-400">{currentTimeSignature[0]}/{currentTimeSignature[1]}</span>
            
            <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-2" />
            
            {/* File Operations */}
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

        {/* Score Canvas */}
        <div className="flex-1 overflow-auto p-4">
          <canvas
            ref={scoreCanvasRef}
            className="w-full h-full border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-gray-900"
            onClick={handleCanvasClick}
            style={{ minHeight: '600px' }}
          />
        </div>
      </div>

      {/* Right Sidebar - Staff Controls */}
      <div className="w-64 bg-gray-50 dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-sm mb-2">Staff Controls</h3>
          
          {/* Key Signature Selection */}
          <div className="mb-3">
            <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">Key Signature</label>
            <Select value={currentKeySignature} onValueChange={setCurrentKeySignature}>
              <SelectTrigger className="w-full h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="C">C Major</SelectItem>
                <SelectItem value="G">G Major</SelectItem>
                <SelectItem value="D">D Major</SelectItem>
                <SelectItem value="A">A Major</SelectItem>
                <SelectItem value="E">E Major</SelectItem>
                <SelectItem value="B">B Major</SelectItem>
                <SelectItem value="F#">F# Major</SelectItem>
                <SelectItem value="C#">C# Major</SelectItem>
                <SelectItem value="F">F Major</SelectItem>
                <SelectItem value="Bb">Bb Major</SelectItem>
                <SelectItem value="Eb">Eb Major</SelectItem>
                <SelectItem value="Ab">Ab Major</SelectItem>
                <SelectItem value="Db">Db Major</SelectItem>
                <SelectItem value="Gb">Gb Major</SelectItem>
                <SelectItem value="Cb">Cb Major</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Time Signature */}
          <div className="mb-3">
            <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">Time Signature</label>
            <div className="flex space-x-1">
              <Select value={currentTimeSignature[0].toString()} onValueChange={(value) => setCurrentTimeSignature([parseInt(value), currentTimeSignature[1]])}>
                <SelectTrigger className="w-16 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="3">3</SelectItem>
                  <SelectItem value="4">4</SelectItem>
                  <SelectItem value="6">6</SelectItem>
                  <SelectItem value="9">9</SelectItem>
                  <SelectItem value="12">12</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm self-center">/</span>
              <Select value={currentTimeSignature[1].toString()} onValueChange={(value) => setCurrentTimeSignature([currentTimeSignature[0], parseInt(value)])}>
                <SelectTrigger className="w-16 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="4">4</SelectItem>
                  <SelectItem value="8">8</SelectItem>
                  <SelectItem value="16">16</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tempo */}
          <div className="mb-3">
            <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">Tempo (BPM)</label>
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

        {/* Staff List */}
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
                {staff.clef === 'treble' ? '𝄞' : staff.clef === 'bass' ? '𝄢' : '𝄡'} {staff.keySignature} {staff.timeSignature[0]}/{staff.timeSignature[1]}
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

        {/* Add Staff Button */}
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
                chords: [],
                dynamics: [],
                measures: [],
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