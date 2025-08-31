import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Unlock,
  RotateCcw,
  RotateCw,
  Copy,
  Cut,
  Paste,
  Trash2,
  Edit,
  Move3D,
  FileMusic,
  Piano,
  Guitar,
  Drum,
  Mic,
  Volume2,
  SkipBack,
  SkipForward,
} from 'lucide-react';

// Comprehensive music notation interfaces
interface Note {
  id: string;
  pitch: number; // MIDI note number
  startTime: number; // Beat position
  duration: number; // Note duration (4=whole, 2=half, 1=quarter, 0.5=eighth, etc.)
  velocity: number;
  voice: number; // 1-4 for multiple voices per staff
  accidental?: 'sharp' | 'flat' | 'natural' | 'double-sharp' | 'double-flat';
  articulation: string[]; // staccato, accent, tenuto, marcato, etc.
  tie?: { start: boolean; end: boolean };
  slur?: string; // slur group ID
  beam?: string; // beam group ID
  tuplet?: { type: number; bracket: boolean; number: string };
  lyrics?: { [verse: number]: string };
  fingering?: string;
  ornament?: 'trill' | 'mordent' | 'turn' | 'appoggiatura' | 'acciaccatura';
  fermata?: boolean;
  tremolo?: number; // tremolo lines
}

interface Chord {
  id: string;
  notes: Note[];
  startTime: number;
  symbol: string; // Chord symbol (C, Am7, etc.)
  bass?: string; // Bass note for slash chords
  voice: number;
}

interface Dynamic {
  id: string;
  time: number;
  marking: string; // pp, p, mp, mf, f, ff, fff
  type: 'instant' | 'hairpin-crescendo' | 'hairpin-diminuendo' | 'text';
  endTime?: number;
  text?: string;
}

interface TempoMarking {
  id: string;
  time: number;
  bpm: number;
  noteValue: number; // 1=quarter, 0.5=eighth, etc.
  text?: string; // Allegro, Andante, etc.
  metronome?: boolean;
}

interface RehearsalMark {
  id: string;
  time: number;
  text: string; // A, B, C or numbers
  style: 'box' | 'circle' | 'none';
}

interface Barline {
  id: string;
  time: number;
  type:
    | 'single'
    | 'double'
    | 'final'
    | 'repeat-start'
    | 'repeat-end'
    | 'dashed'
    | 'heavy'
    | 'invisible';
  repeatCount?: number;
}

interface KeySignature {
  id: string;
  time: number;
  key: string; // C, G, D, A, E, B, F#, C#, F, Bb, Eb, Ab, Db, Gb, Cb
  mode: 'major' | 'minor';
}

interface TimeSignature {
  id: string;
  time: number;
  numerator: number;
  denominator: number;
  display?: 'normal' | 'common' | 'cut';
}

interface TextAnnotation {
  id: string;
  time: number;
  text: string;
  type: 'expression' | 'technique' | 'tempo' | 'rehearsal' | 'lyrics' | 'chord';
  style: 'normal' | 'bold' | 'italic' | 'underline';
  position: 'above' | 'below' | 'inline';
}

interface Staff {
  id: string;
  name: string;
  shortName: string;
  clef: 'treble' | 'bass' | 'alto' | 'tenor' | 'percussion' | 'tab';
  instrument: string;
  midiChannel: number;
  transposition: number; // Semitones
  capo?: number; // For guitar
  tuning?: string[]; // For string instruments

  // Musical content
  notes: Note[];
  chords: Chord[];
  dynamics: Dynamic[];
  tempoMarkings: TempoMarking[];
  rehearsalMarks: RehearsalMark[];
  barlines: Barline[];
  keySignatures: KeySignature[];
  timeSignatures: TimeSignature[];
  textAnnotations: TextAnnotation[];

  // Display properties
  visible: boolean;
  locked: boolean;
  color: string;
  lineSpacing: number;

  // Audio properties
  volume: number;
  pan: number;
  mute: boolean;
  solo: boolean;

  // Staff-specific settings
  voiceCount: number;
  showClef: boolean;
  showKeySignature: boolean;
  showTimeSignature: boolean;
  showMeasureNumbers: boolean;
  hideEmptyStaves: boolean;
}

interface ScoreLayout {
  pageSize: 'A4' | 'letter' | 'legal' | 'tabloid';
  orientation: 'portrait' | 'landscape';
  margins: { top: number; bottom: number; left: number; right: number };
  systemSpacing: number;
  staffSpacing: number;
  pageBreaks: number[];
  systemBreaks: number[];
}

interface ScoreSettings {
  title: string;
  composer: string;
  lyricist?: string;
  copyright?: string;

  defaultTempo: number;
  defaultKeySignature: string;
  defaultTimeSignature: [number, number];

  beamingRules: 'auto' | 'manual';
  stemDirection: 'auto' | 'up' | 'down';
  accidentalRules: 'modern' | 'traditional';

  layout: ScoreLayout;
}

interface AdvancedScoreEditorProps {
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

export function AdvancedScoreEditor({
  tracks,
  transport,
  zoomLevel = 1,
  bpm = 120,
  timeSignature = [4, 4],
  onTrackMute,
  onTrackSolo,
  onTrackSelect,
  isLocked = false,
}: AdvancedScoreEditorProps) {
  // UI State
  const [selectedTool, setSelectedTool] = useState<
    | 'select'
    | 'note'
    | 'rest'
    | 'chord'
    | 'text'
    | 'dynamic'
    | 'slur'
    | 'tie'
    | 'beam'
  >('select');
  const [selectedPalette, setSelectedPalette] = useState('notes');
  const [currentNoteValue, setCurrentNoteValue] = useState(1); // Quarter note
  const [currentVoice, setCurrentVoice] = useState(1);
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
  const [selectedNotes, setSelectedNotes] = useState<Set<string>>(new Set());
  const [clipboard, setClipboard] = useState<Note[]>([]);
  const [undoStack, setUndoStack] = useState<Staff[][]>([]);
  const [redoStack, setRedoStack] = useState<Staff[][]>([]);

  // Music State
  const [scoreSettings, setScoreSettings] = useState<ScoreSettings>({
    title: 'Untitled Score',
    composer: '',
    defaultTempo: bpm,
    defaultKeySignature: 'C',
    defaultTimeSignature: timeSignature,
    beamingRules: 'auto',
    stemDirection: 'auto',
    accidentalRules: 'modern',
    layout: {
      pageSize: 'A4',
      orientation: 'portrait',
      margins: { top: 50, bottom: 50, left: 50, right: 50 },
      systemSpacing: 120,
      staffSpacing: 80,
      pageBreaks: [],
      systemBreaks: [],
    },
  });

  const [staves, setStaves] = useState<Staff[]>([
    {
      id: 'staff-1',
      name: 'Piano',
      shortName: 'Pno.',
      clef: 'treble',
      instrument: 'acoustic_grand_piano',
      midiChannel: 1,
      transposition: 0,
      notes: [
        {
          id: 'note-1',
          pitch: 60,
          startTime: 0,
          duration: 1,
          velocity: 80,
          voice: 1,
          articulation: [],
          tie: { start: false, end: false },
        },
        {
          id: 'note-2',
          pitch: 64,
          startTime: 1,
          duration: 1,
          velocity: 85,
          voice: 1,
          articulation: ['staccato'],
          tie: { start: false, end: false },
        },
        {
          id: 'note-3',
          pitch: 67,
          startTime: 2,
          duration: 1,
          velocity: 75,
          voice: 1,
          articulation: ['accent'],
          tie: { start: false, end: false },
        },
        {
          id: 'note-4',
          pitch: 72,
          startTime: 3,
          duration: 1,
          velocity: 90,
          voice: 1,
          articulation: [],
          tie: { start: false, end: false },
          fermata: true,
        },
      ],
      chords: [],
      dynamics: [
        { id: 'dyn-1', time: 0, marking: 'mf', type: 'instant' },
        {
          id: 'dyn-2',
          time: 2,
          marking: 'crescendo',
          type: 'hairpin-crescendo',
          endTime: 3,
        },
      ],
      tempoMarkings: [
        { id: 'tempo-1', time: 0, bpm: 120, noteValue: 1, text: 'Moderato' },
      ],
      rehearsalMarks: [],
      barlines: [
        { id: 'bar-1', time: 4, type: 'single' },
        { id: 'bar-2', time: 8, type: 'final' },
      ],
      keySignatures: [{ id: 'key-1', time: 0, key: 'C', mode: 'major' }],
      timeSignatures: [{ id: 'time-1', time: 0, numerator: 4, denominator: 4 }],
      textAnnotations: [],
      visible: true,
      locked: false,
      color: '#000000',
      lineSpacing: 8,
      volume: 100,
      pan: 0,
      mute: false,
      solo: false,
      voiceCount: 1,
      showClef: true,
      showKeySignature: true,
      showTimeSignature: true,
      showMeasureNumbers: true,
      hideEmptyStaves: false,
    },
  ]);

  const scoreCanvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  // Music theory helpers
  const noteNames = [
    'C',
    'C#',
    'D',
    'D#',
    'E',
    'F',
    'F#',
    'G',
    'G#',
    'A',
    'A#',
    'B',
  ];
  const keySignatures = {
    C: { sharps: 0, flats: 0, accidentals: [] },
    G: { sharps: 1, flats: 0, accidentals: ['F#'] },
    D: { sharps: 2, flats: 0, accidentals: ['F#', 'C#'] },
    A: { sharps: 3, flats: 0, accidentals: ['F#', 'C#', 'G#'] },
    E: { sharps: 4, flats: 0, accidentals: ['F#', 'C#', 'G#', 'D#'] },
    B: { sharps: 5, flats: 0, accidentals: ['F#', 'C#', 'G#', 'D#', 'A#'] },
    'F#': {
      sharps: 6,
      flats: 0,
      accidentals: ['F#', 'C#', 'G#', 'D#', 'A#', 'E#'],
    },
    'C#': {
      sharps: 7,
      flats: 0,
      accidentals: ['F#', 'C#', 'G#', 'D#', 'A#', 'E#', 'B#'],
    },
    F: { sharps: 0, flats: 1, accidentals: ['Bb'] },
    Bb: { sharps: 0, flats: 2, accidentals: ['Bb', 'Eb'] },
    Eb: { sharps: 0, flats: 3, accidentals: ['Bb', 'Eb', 'Ab'] },
    Ab: { sharps: 0, flats: 4, accidentals: ['Bb', 'Eb', 'Ab', 'Db'] },
    Db: { sharps: 0, flats: 5, accidentals: ['Bb', 'Eb', 'Ab', 'Db', 'Gb'] },
    Gb: {
      sharps: 0,
      flats: 6,
      accidentals: ['Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb'],
    },
    Cb: {
      sharps: 0,
      flats: 7,
      accidentals: ['Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb', 'Fb'],
    },
  };

  // Advanced note positioning with proper music theory
  const getNoteStaffPosition = useCallback(
    (pitch: number, clef: string) => {
      const octave = Math.floor(pitch / 12);
      const semitone = pitch % 12;
      const noteName = noteNames[semitone];

      // Staff line positions (0 = middle line, negative = above, positive = below)
      const staffPositions: { [clef: string]: { [note: string]: number } } = {
        treble: {
          C: octave < 5 ? (5 - octave) * 7 + 6 : (5 - octave) * 7 + 6,
          D: octave < 5 ? (5 - octave) * 7 + 5 : (5 - octave) * 7 + 5,
          E: octave < 5 ? (5 - octave) * 7 + 4 : (5 - octave) * 7 + 4,
          F: octave < 5 ? (5 - octave) * 7 + 3 : (5 - octave) * 7 + 3,
          G: octave < 5 ? (5 - octave) * 7 + 2 : (5 - octave) * 7 + 2,
          A: octave < 5 ? (5 - octave) * 7 + 1 : (5 - octave) * 7 + 1,
          B: octave < 5 ? (5 - octave) * 7 + 0 : (5 - octave) * 7 + 0,
        },
        bass: {
          C: octave < 3 ? (3 - octave) * 7 + 6 : (3 - octave) * 7 + 6,
          D: octave < 3 ? (3 - octave) * 7 + 5 : (3 - octave) * 7 + 5,
          E: octave < 3 ? (3 - octave) * 7 + 4 : (3 - octave) * 7 + 4,
          F: octave < 3 ? (3 - octave) * 7 + 3 : (3 - octave) * 7 + 3,
          G: octave < 3 ? (3 - octave) * 7 + 2 : (3 - octave) * 7 + 2,
          A: octave < 3 ? (3 - octave) * 7 + 1 : (3 - octave) * 7 + 1,
          B: octave < 3 ? (3 - octave) * 7 + 0 : (3 - octave) * 7 + 0,
        },
      };

      const baseNote = noteName.replace('#', '').replace('b', '');
      return staffPositions[clef]?.[baseNote] || 0;
    },
    [noteNames]
  );

  // Comprehensive score rendering
  const renderScore = useCallback(() => {
    const canvas = scoreCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Setup canvas
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const canvasWidth = rect.width;
    const canvasHeight = rect.height;

    // Theme colors
    const isDark = document.documentElement.classList.contains('dark');
    const colors = {
      background: isDark ? '#1a1a1a' : '#ffffff',
      staff: isDark ? '#666666' : '#000000',
      notes: isDark ? '#ffffff' : '#000000',
      text: isDark ? '#cccccc' : '#333333',
      selected: '#3b82f6',
      measure: isDark ? '#555555' : '#999999',
      dynamic: '#8b5cf6',
      tempo: '#f59e0b',
    };

    // Clear and set background
    ctx.fillStyle = colors.background;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Score layout constants
    const margins = { left: 80, right: 40, top: 80, bottom: 40 };
    const systemWidth = canvasWidth - margins.left - margins.right;
    const staffHeight = 32; // 5 lines * 8px spacing
    const systemHeight = 120;
    const measuresPerSystem = 4;
    const measureWidth = systemWidth / measuresPerSystem;

    // Render title and composer
    ctx.fillStyle = colors.text;
    ctx.font = 'bold 24px serif';
    ctx.textAlign = 'center';
    ctx.fillText(scoreSettings.title, canvasWidth / 2, 40);

    if (scoreSettings.composer) {
      ctx.font = '16px serif';
      ctx.textAlign = 'right';
      ctx.fillText(scoreSettings.composer, canvasWidth - margins.right, 60);
    }

    // Render each staff system
    staves.forEach((staff, staffIndex) => {
      if (!staff.visible) return;

      const systemY = margins.top + staffIndex * systemHeight;
      const staffY = systemY + 20;

      // Staff lines
      ctx.strokeStyle = colors.staff;
      ctx.lineWidth = 1;
      for (let i = 0; i < 5; i++) {
        const lineY = staffY + i * 8;
        ctx.beginPath();
        ctx.moveTo(margins.left + 60, lineY);
        ctx.lineTo(margins.left + systemWidth, lineY);
        ctx.stroke();
      }

      // Clef
      if (staff.showClef) {
        ctx.fillStyle = colors.text;
        ctx.font = '32px serif';
        ctx.textAlign = 'center';
        const clefSymbols = {
          treble: '𝄞',
          bass: '𝄢',
          alto: '𝄡',
          tenor: '𝄡',
          percussion: '𝄥',
        };
        ctx.fillText(
          clefSymbols[staff.clef] || '𝄞',
          margins.left + 30,
          staffY + 20
        );
      }

      // Key signature
      if (staff.showKeySignature) {
        const currentKey = staff.keySignatures[staff.keySignatures.length - 1];
        if (
          currentKey &&
          keySignatures[currentKey.key as keyof typeof keySignatures]
        ) {
          const keyInfo =
            keySignatures[currentKey.key as keyof typeof keySignatures];
          ctx.font = '16px serif';

          keyInfo.accidentals.forEach((acc, index) => {
            const symbol = acc.includes('#') ? '♯' : '♭';
            const x = margins.left + 65 + index * 8;
            const y = staffY + 16; // Position based on note
            ctx.fillText(symbol, x, y);
          });
        }
      }

      // Time signature
      if (staff.showTimeSignature) {
        const currentTime =
          staff.timeSignatures[staff.timeSignatures.length - 1];
        if (currentTime) {
          ctx.font = 'bold 20px serif';
          ctx.textAlign = 'center';
          const x = margins.left + 120;
          ctx.fillText(currentTime.numerator.toString(), x, staffY + 12);
          ctx.fillText(currentTime.denominator.toString(), x, staffY + 28);
        }
      }

      // Measure lines
      for (let i = 0; i <= measuresPerSystem; i++) {
        const x = margins.left + 140 + i * measureWidth;
        ctx.strokeStyle =
          i === measuresPerSystem ? colors.staff : colors.measure;
        ctx.lineWidth = i === measuresPerSystem ? 2 : 1;
        ctx.beginPath();
        ctx.moveTo(x, staffY);
        ctx.lineTo(x, staffY + staffHeight);
        ctx.stroke();
      }

      // Notes
      staff.notes.forEach((note) => {
        const x =
          margins.left +
          140 +
          (note.startTime / 4) * measureWidth +
          (note.startTime % 1) * (measureWidth / 4);

        const staffPos = getNoteStaffPosition(note.pitch, staff.clef);
        const y = staffY + 16 + staffPos * 2; // Convert staff position to pixels

        ctx.fillStyle = selectedNotes.has(note.id)
          ? colors.selected
          : colors.notes;

        // Note head
        const noteHeads = {
          4: '𝅝', // whole
          2: '𝅗𝅥', // half
          1: '𝅘𝅥', // quarter
          0.5: '𝅘𝅥𝅮', // eighth
          0.25: '𝅘𝅥𝅯', // sixteenth
        };

        ctx.font = '20px serif';
        ctx.textAlign = 'center';
        ctx.fillText(
          noteHeads[note.duration as keyof typeof noteHeads] || '𝅘𝅥',
          x,
          y
        );

        // Stem
        if (note.duration <= 2) {
          const stemUp = y > staffY + 16;
          const stemX = x + (stemUp ? 7 : -7);
          const stemY1 = y - 3;
          const stemY2 = stemUp ? y - 28 : y + 28;

          ctx.strokeStyle = colors.notes;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(stemX, stemY1);
          ctx.lineTo(stemX, stemY2);
          ctx.stroke();

          // Flags for eighth notes and shorter
          if (note.duration <= 0.5) {
            ctx.font = '12px serif';
            const flag = stemUp ? '𝄾' : '𝄿';
            ctx.fillText(flag, stemX + (stemUp ? 2 : -8), stemY2 + 3);
          }
        }

        // Accidentals
        if (note.accidental) {
          const accSymbols = {
            sharp: '♯',
            flat: '♭',
            natural: '♮',
            'double-sharp': '𝄪',
            'double-flat': '𝄫',
          };
          ctx.font = '16px serif';
          ctx.fillText(accSymbols[note.accidental], x - 20, y);
        }

        // Articulations
        note.articulation.forEach((art, index) => {
          const artSymbols = {
            staccato: '•',
            accent: '>',
            tenuto: '−',
            marcato: '∧',
            staccatissimo: '▼',
          };
          ctx.font = '12px serif';
          const artY = y + (index + 1) * 12;
          ctx.fillText(
            artSymbols[art as keyof typeof artSymbols] || art,
            x,
            artY
          );
        });

        // Fermata
        if (note.fermata) {
          ctx.font = '16px serif';
          ctx.fillText('𝄐', x, y - 20);
        }
      });

      // Dynamics
      staff.dynamics.forEach((dynamic) => {
        const x = margins.left + 140 + (dynamic.time / 4) * measureWidth;
        const y = staffY + staffHeight + 20;

        ctx.fillStyle = colors.dynamic;
        ctx.font = 'italic 14px serif';
        ctx.textAlign = 'left';

        if (dynamic.type === 'instant') {
          ctx.fillText(dynamic.marking, x, y);
        } else if (dynamic.type.includes('hairpin')) {
          // Draw hairpin crescendo/diminuendo
          const endX =
            margins.left + 140 + (dynamic.endTime! / 4) * measureWidth;
          ctx.strokeStyle = colors.dynamic;
          ctx.lineWidth = 1;

          if (dynamic.type === 'hairpin-crescendo') {
            ctx.beginPath();
            ctx.moveTo(x, y - 5);
            ctx.lineTo(endX, y - 8);
            ctx.moveTo(x, y + 5);
            ctx.lineTo(endX, y + 2);
            ctx.stroke();
          } else {
            ctx.beginPath();
            ctx.moveTo(x, y - 8);
            ctx.lineTo(endX, y - 5);
            ctx.moveTo(x, y + 2);
            ctx.lineTo(endX, y + 5);
            ctx.stroke();
          }
        }
      });

      // Tempo markings
      staff.tempoMarkings.forEach((tempo) => {
        const x = margins.left + 140 + (tempo.time / 4) * measureWidth;
        const y = staffY - 20;

        ctx.fillStyle = colors.tempo;
        ctx.font = 'bold 12px serif';
        ctx.textAlign = 'left';

        const tempoText = tempo.text
          ? `${tempo.text} (♩ = ${tempo.bpm})`
          : `♩ = ${tempo.bpm}`;
        ctx.fillText(tempoText, x, y);
      });

      // Staff name
      ctx.fillStyle = colors.text;
      ctx.font = 'bold 14px serif';
      ctx.textAlign = 'right';
      ctx.fillText(staff.name, margins.left - 10, staffY + 16);
    });

    setCanvasSize({ width: canvasWidth, height: canvasHeight });
  }, [staves, selectedNotes, scoreSettings, getNoteStaffPosition]);

  // Render on changes
  useEffect(() => {
    renderScore();
  }, [renderScore]);

  // Advanced tool palettes
  const toolPalettes = {
    notes: [
      { id: 'whole', symbol: '𝅝', label: 'Whole Note', value: 4 },
      { id: 'half', symbol: '𝅗𝅥', label: 'Half Note', value: 2 },
      { id: 'quarter', symbol: '𝅘𝅥', label: 'Quarter Note', value: 1 },
      { id: 'eighth', symbol: '𝅘𝅥𝅮', label: 'Eighth Note', value: 0.5 },
      { id: 'sixteenth', symbol: '𝅘𝅥𝅯', label: 'Sixteenth Note', value: 0.25 },
      { id: 'thirty-second', symbol: '𝅘𝅥𝅰', label: '32nd Note', value: 0.125 },
    ],
    rests: [
      { id: 'whole-rest', symbol: '𝄻', label: 'Whole Rest', value: 4 },
      { id: 'half-rest', symbol: '𝄼', label: 'Half Rest', value: 2 },
      { id: 'quarter-rest', symbol: '𝄽', label: 'Quarter Rest', value: 1 },
      { id: 'eighth-rest', symbol: '𝄾', label: 'Eighth Rest', value: 0.5 },
      { id: 'sixteenth-rest', symbol: '𝄿', label: '16th Rest', value: 0.25 },
    ],
    accidentals: [
      { id: 'sharp', symbol: '♯', label: 'Sharp', value: 'sharp' },
      { id: 'flat', symbol: '♭', label: 'Flat', value: 'flat' },
      { id: 'natural', symbol: '♮', label: 'Natural', value: 'natural' },
      {
        id: 'double-sharp',
        symbol: '𝄪',
        label: 'Double Sharp',
        value: 'double-sharp',
      },
      {
        id: 'double-flat',
        symbol: '𝄫',
        label: 'Double Flat',
        value: 'double-flat',
      },
    ],
    articulations: [
      { id: 'staccato', symbol: '•', label: 'Staccato', value: 'staccato' },
      { id: 'accent', symbol: '>', label: 'Accent', value: 'accent' },
      { id: 'tenuto', symbol: '−', label: 'Tenuto', value: 'tenuto' },
      { id: 'marcato', symbol: '∧', label: 'Marcato', value: 'marcato' },
      { id: 'fermata', symbol: '𝄐', label: 'Fermata', value: 'fermata' },
    ],
    dynamics: [
      { id: 'ppp', symbol: 'ppp', label: 'Pianissimo', value: 'ppp' },
      { id: 'pp', symbol: 'pp', label: 'Piano', value: 'pp' },
      { id: 'p', symbol: 'p', label: 'Piano', value: 'p' },
      { id: 'mp', symbol: 'mp', label: 'Mezzo Piano', value: 'mp' },
      { id: 'mf', symbol: 'mf', label: 'Mezzo Forte', value: 'mf' },
      { id: 'f', symbol: 'f', label: 'Forte', value: 'f' },
      { id: 'ff', symbol: 'ff', label: 'Fortissimo', value: 'ff' },
      { id: 'fff', symbol: 'fff', label: 'Fortississimo', value: 'fff' },
    ],
    clefs: [
      { id: 'treble', symbol: '𝄞', label: 'Treble Clef', value: 'treble' },
      { id: 'bass', symbol: '𝄢', label: 'Bass Clef', value: 'bass' },
      { id: 'alto', symbol: '𝄡', label: 'Alto Clef', value: 'alto' },
      { id: 'tenor', symbol: '𝄡', label: 'Tenor Clef', value: 'tenor' },
      {
        id: 'percussion',
        symbol: '𝄥',
        label: 'Percussion',
        value: 'percussion',
      },
    ],
  };

  return (
    <div className="h-full flex bg-white dark:bg-gray-900">
      {/* Advanced Tool Palette */}
      <div className="w-80 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        <Tabs
          value={selectedPalette}
          onValueChange={setSelectedPalette}
          className="flex-1 flex flex-col"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="notes">Notes</TabsTrigger>
            <TabsTrigger value="symbols">Symbols</TabsTrigger>
            <TabsTrigger value="tools">Tools</TabsTrigger>
          </TabsList>

          <TabsContent value="notes" className="flex-1 p-2 space-y-4">
            <div>
              <h4 className="font-medium mb-2 text-sm">Note Values</h4>
              <div className="grid grid-cols-3 gap-1">
                {toolPalettes.notes.map((note) => (
                  <Button
                    key={note.id}
                    variant={
                      currentNoteValue === note.value ? 'default' : 'ghost'
                    }
                    size="sm"
                    className="h-12 flex flex-col items-center justify-center"
                    onClick={() => setCurrentNoteValue(note.value)}
                    title={note.label}
                  >
                    <span className="text-lg font-serif">{note.symbol}</span>
                    <span className="text-xs">{note.label.split(' ')[0]}</span>
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2 text-sm">Rests</h4>
              <div className="grid grid-cols-3 gap-1">
                {toolPalettes.rests.map((rest) => (
                  <Button
                    key={rest.id}
                    variant="ghost"
                    size="sm"
                    className="h-12 flex flex-col items-center justify-center"
                    title={rest.label}
                  >
                    <span className="text-lg font-serif">{rest.symbol}</span>
                    <span className="text-xs">{rest.label.split(' ')[0]}</span>
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2 text-sm">Voice</h4>
              <Select
                value={currentVoice.toString()}
                onValueChange={(value) => setCurrentVoice(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Voice 1</SelectItem>
                  <SelectItem value="2">Voice 2</SelectItem>
                  <SelectItem value="3">Voice 3</SelectItem>
                  <SelectItem value="4">Voice 4</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          <TabsContent value="symbols" className="flex-1 p-2 space-y-4">
            <div>
              <h4 className="font-medium mb-2 text-sm">Accidentals</h4>
              <div className="grid grid-cols-3 gap-1">
                {toolPalettes.accidentals.map((acc) => (
                  <Button
                    key={acc.id}
                    variant="ghost"
                    size="sm"
                    className="h-12 flex flex-col items-center justify-center"
                    title={acc.label}
                  >
                    <span className="text-lg font-serif">{acc.symbol}</span>
                    <span className="text-xs">{acc.label}</span>
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2 text-sm">Articulations</h4>
              <div className="grid grid-cols-3 gap-1">
                {toolPalettes.articulations.map((art) => (
                  <Button
                    key={art.id}
                    variant="ghost"
                    size="sm"
                    className="h-12 flex flex-col items-center justify-center"
                    title={art.label}
                  >
                    <span className="text-lg font-serif">{art.symbol}</span>
                    <span className="text-xs">{art.label}</span>
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2 text-sm">Dynamics</h4>
              <div className="grid grid-cols-2 gap-1">
                {toolPalettes.dynamics.map((dyn) => (
                  <Button
                    key={dyn.id}
                    variant="ghost"
                    size="sm"
                    className="h-10 flex items-center justify-center"
                    title={dyn.label}
                  >
                    <span className="text-sm font-italic">{dyn.symbol}</span>
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2 text-sm">Clefs</h4>
              <div className="grid grid-cols-2 gap-1">
                {toolPalettes.clefs.map((clef) => (
                  <Button
                    key={clef.id}
                    variant="ghost"
                    size="sm"
                    className="h-12 flex flex-col items-center justify-center"
                    title={clef.label}
                  >
                    <span className="text-lg font-serif">{clef.symbol}</span>
                    <span className="text-xs">{clef.label.split(' ')[0]}</span>
                  </Button>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="tools" className="flex-1 p-2">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2 text-sm">Selection Tools</h4>
                <div className="grid grid-cols-2 gap-1">
                  <Button
                    variant={selectedTool === 'select' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setSelectedTool('select')}
                  >
                    <MousePointer className="h-4 w-4 mr-1" />
                    Select
                  </Button>
                  <Button
                    variant={selectedTool === 'note' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setSelectedTool('note')}
                  >
                    <Music className="h-4 w-4 mr-1" />
                    Note
                  </Button>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2 text-sm">Edit Tools</h4>
                <div className="grid grid-cols-3 gap-1">
                  <Button variant="ghost" size="sm" title="Copy">
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" title="Cut">
                    <Cut className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" title="Paste">
                    <Paste className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" title="Undo">
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" title="Redo">
                    <RotateCw className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" title="Delete">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Main Score Area */}
      <div className="flex-1 flex flex-col">
        {/* Enhanced Toolbar */}
        <div className="h-14 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 flex items-center justify-between">
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
            <Button variant="ghost" size="sm">
              <SkipBack className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <SkipForward className="h-4 w-4" />
            </Button>

            <div className="w-px h-6 bg-gray-300 mx-2" />

            <Button variant="ghost" size="sm">
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm text-gray-600">
              {Math.round(zoomLevel * 100)}%
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <Input
              value={scoreSettings.title}
              onChange={(e) =>
                setScoreSettings((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder="Score Title"
              className="w-48"
            />

            <div className="w-px h-6 bg-gray-300 mx-2" />

            <Button variant="ghost" size="sm">
              <Save className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <FileDown className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Score Canvas */}
        <div className="flex-1 overflow-auto bg-white dark:bg-gray-900">
          <canvas
            ref={scoreCanvasRef}
            className="w-full min-h-full cursor-crosshair"
            style={{ minHeight: '800px' }}
          />
        </div>
      </div>

      {/* Enhanced Properties Panel */}
      <div className="w-80 bg-gray-50 dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col">
        <Tabs defaultValue="score" className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="score">Score</TabsTrigger>
            <TabsTrigger value="staves">Staves</TabsTrigger>
            <TabsTrigger value="properties">Properties</TabsTrigger>
          </TabsList>

          <TabsContent value="score" className="flex-1 p-4 space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Composer</label>
              <Input
                value={scoreSettings.composer}
                onChange={(e) =>
                  setScoreSettings((prev) => ({
                    ...prev,
                    composer: e.target.value,
                  }))
                }
                placeholder="Composer name"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Default Tempo
              </label>
              <div className="flex items-center space-x-2">
                <Slider
                  value={[scoreSettings.defaultTempo]}
                  onValueChange={([value]) =>
                    setScoreSettings((prev) => ({
                      ...prev,
                      defaultTempo: value,
                    }))
                  }
                  min={60}
                  max={200}
                  step={1}
                  className="flex-1"
                />
                <span className="text-sm w-12 text-center">
                  {scoreSettings.defaultTempo}
                </span>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Key Signature
              </label>
              <Select
                value={scoreSettings.defaultKeySignature}
                onValueChange={(value) =>
                  setScoreSettings((prev) => ({
                    ...prev,
                    defaultKeySignature: value,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(keySignatures).map((key) => (
                    <SelectItem key={key} value={key}>
                      {key} Major
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Time Signature
              </label>
              <div className="flex space-x-2">
                <Select
                  value={scoreSettings.defaultTimeSignature[0].toString()}
                  onValueChange={(value) =>
                    setScoreSettings((prev) => ({
                      ...prev,
                      defaultTimeSignature: [
                        parseInt(value),
                        prev.defaultTimeSignature[1],
                      ],
                    }))
                  }
                >
                  <SelectTrigger className="flex-1">
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
                <span className="text-lg self-center">/</span>
                <Select
                  value={scoreSettings.defaultTimeSignature[1].toString()}
                  onValueChange={(value) =>
                    setScoreSettings((prev) => ({
                      ...prev,
                      defaultTimeSignature: [
                        prev.defaultTimeSignature[0],
                        parseInt(value),
                      ],
                    }))
                  }
                >
                  <SelectTrigger className="flex-1">
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
          </TabsContent>

          <TabsContent value="staves" className="flex-1 overflow-y-auto">
            {staves.map((staff, index) => (
              <div
                key={staff.id}
                className={`p-3 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${
                  selectedStaffId === staff.id
                    ? 'bg-blue-50 dark:bg-blue-900'
                    : ''
                }`}
                onClick={() => setSelectedStaffId(staff.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">{staff.name}</span>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        setStaves((prev) =>
                          prev.map((s) =>
                            s.id === staff.id
                              ? { ...s, visible: !s.visible }
                              : s
                          )
                        );
                      }}
                    >
                      {staff.visible ? (
                        <Eye className="h-3 w-3" />
                      ) : (
                        <EyeOff className="h-3 w-3" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        setStaves((prev) =>
                          prev.map((s) =>
                            s.id === staff.id ? { ...s, locked: !s.locked } : s
                          )
                        );
                      }}
                    >
                      {staff.locked ? (
                        <Lock className="h-3 w-3" />
                      ) : (
                        <Unlock className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                  {staff.clef === 'treble'
                    ? '𝄞'
                    : staff.clef === 'bass'
                      ? '𝄢'
                      : '𝄡'}{' '}
                  {staff.keySignatures[0]?.key || 'C'}{' '}
                  {staff.timeSignatures[0]?.numerator || 4}/
                  {staff.timeSignatures[0]?.denominator || 4}
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
                    {staff.mute ? (
                      <VolumeX className="h-3 w-3" />
                    ) : (
                      <Volume2 className="h-3 w-3" />
                    )}
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
                    onValueChange={([value]) => {
                      setStaves((prev) =>
                        prev.map((s) =>
                          s.id === staff.id ? { ...s, volume: value } : s
                        )
                      );
                    }}
                    min={0}
                    max={100}
                    step={1}
                    className="flex-1"
                  />
                </div>
              </div>
            ))}

            <div className="p-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => {
                  const newStaff: Staff = {
                    id: `staff-${Date.now()}`,
                    name: 'New Staff',
                    shortName: 'Staff',
                    clef: 'treble',
                    instrument: 'acoustic_grand_piano',
                    midiChannel: staves.length + 1,
                    transposition: 0,
                    notes: [],
                    chords: [],
                    dynamics: [],
                    tempoMarkings: [],
                    rehearsalMarks: [],
                    barlines: [],
                    keySignatures: [
                      { id: 'key-1', time: 0, key: 'C', mode: 'major' },
                    ],
                    timeSignatures: [
                      { id: 'time-1', time: 0, numerator: 4, denominator: 4 },
                    ],
                    textAnnotations: [],
                    visible: true,
                    locked: false,
                    color: '#000000',
                    lineSpacing: 8,
                    volume: 100,
                    pan: 0,
                    mute: false,
                    solo: false,
                    voiceCount: 1,
                    showClef: true,
                    showKeySignature: true,
                    showTimeSignature: true,
                    showMeasureNumbers: true,
                    hideEmptyStaves: false,
                  };
                  setStaves((prev) => [...prev, newStaff]);
                }}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Staff
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="properties" className="flex-1 p-4">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Layout Settings</h4>
                <div className="space-y-2">
                  <div>
                    <label className="text-sm">Page Size</label>
                    <Select
                      value={scoreSettings.layout.pageSize}
                      onValueChange={(
                        value: 'A4' | 'letter' | 'legal' | 'tabloid'
                      ) =>
                        setScoreSettings((prev) => ({
                          ...prev,
                          layout: { ...prev.layout, pageSize: value },
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A4">A4</SelectItem>
                        <SelectItem value="letter">Letter</SelectItem>
                        <SelectItem value="legal">Legal</SelectItem>
                        <SelectItem value="tabloid">Tabloid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm">System Spacing</label>
                    <Slider
                      value={[scoreSettings.layout.systemSpacing]}
                      onValueChange={([value]) =>
                        setScoreSettings((prev) => ({
                          ...prev,
                          layout: { ...prev.layout, systemSpacing: value },
                        }))
                      }
                      min={80}
                      max={200}
                      step={10}
                    />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Engraving Rules</h4>
                <div className="space-y-2">
                  <div>
                    <label className="text-sm">Beaming</label>
                    <Select
                      value={scoreSettings.beamingRules}
                      onValueChange={(value: 'auto' | 'manual') =>
                        setScoreSettings((prev) => ({
                          ...prev,
                          beamingRules: value,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auto">Automatic</SelectItem>
                        <SelectItem value="manual">Manual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm">Stem Direction</label>
                    <Select
                      value={scoreSettings.stemDirection}
                      onValueChange={(value: 'auto' | 'up' | 'down') =>
                        setScoreSettings((prev) => ({
                          ...prev,
                          stemDirection: value,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auto">Automatic</SelectItem>
                        <SelectItem value="up">Always Up</SelectItem>
                        <SelectItem value="down">Always Down</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
