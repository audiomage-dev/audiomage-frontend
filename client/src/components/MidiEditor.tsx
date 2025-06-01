import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AudioTrack, TransportState } from '@/types/audio';
import { Volume2, VolumeX } from 'lucide-react';

interface MidiNote {
  id: string;
  pitch: number; // MIDI note number (0-127)
  startTime: number; // Start time in beats
  duration: number; // Duration in beats
  velocity: number; // Velocity (0-127)
}

interface MidiEditorProps {
  tracks: AudioTrack[];
  transport: TransportState;
  zoomLevel?: number;
  onTrackMute: (trackId: string) => void;
  onTrackSolo: (trackId: string) => void;
  onTrackSelect?: (trackId: string) => void;
  onNoteAdd?: (trackId: string, note: MidiNote) => void;
  onNoteEdit?: (trackId: string, noteId: string, note: Partial<MidiNote>) => void;
  onNoteDelete?: (trackId: string, noteId: string) => void;
}

export function MidiEditor({ 
  tracks, 
  transport, 
  zoomLevel = 1,
  onTrackMute,
  onTrackSolo,
  onTrackSelect,
  onNoteAdd,
  onNoteEdit,
  onNoteDelete
}: MidiEditorProps) {
  const [selectedTrack, setSelectedTrack] = useState<string | null>(tracks.find(t => t.type === 'midi')?.id || null);
  const [selectedNotes, setSelectedNotes] = useState<Set<string>>(new Set());
  const [isDragging, setIsDragging] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [midiNotes, setMidiNotes] = useState<Record<string, MidiNote[]>>({});
  const pianoRollRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  // MIDI note configuration
  const noteHeight = 16;
  const octaves = 10; // C0 to C10
  const notesPerOctave = 12;
  const totalNotes = octaves * notesPerOctave + 1; // 121 notes total
  const beatWidth = 50 * zoomLevel;
  const totalBeats = 64; // 16 bars of 4/4 time
  
  // Piano key configuration
  const whiteKeyPattern = [0, 2, 4, 5, 7, 9, 11]; // C, D, E, F, G, A, B
  const blackKeyPattern = [1, 3, 6, 8, 10]; // C#, D#, F#, G#, A#

  // Convert MIDI note number to note name
  const getNoteNameFromMidi = (midiNumber: number): string => {
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const octave = Math.floor(midiNumber / 12) - 1;
    const noteIndex = midiNumber % 12;
    return `${noteNames[noteIndex]}${octave}`;
  };

  // Check if a MIDI note is a black key
  const isBlackKey = (midiNumber: number): boolean => {
    const noteInOctave = midiNumber % 12;
    return blackKeyPattern.includes(noteInOctave);
  };

  // Get Y position for a MIDI note
  const getNoteY = (midiNumber: number): number => {
    return (127 - midiNumber) * noteHeight;
  };

  // Get MIDI note from Y position
  const getMidiFromY = (y: number): number => {
    return Math.max(0, Math.min(127, 127 - Math.floor(y / noteHeight)));
  };

  // Get beat position from X coordinate
  const getBeatFromX = (x: number): number => {
    return Math.max(0, x / beatWidth);
  };

  // Snap to grid
  const snapToBeat = (beat: number): number => {
    const snapSize = 0.25; // 16th note snap
    return Math.round(beat / snapSize) * snapSize;
  };

  // Generate realistic MIDI note data based on track content
  const getMidiNotesFromTrack = (track: AudioTrack): MidiNote[] => {
    if (track.type !== 'midi') return [];
    
    const notes: MidiNote[] = [];
    
    if (track.name === 'Piano') {
      // Piano chord progression in C major
      const chordProgression = [
        [60, 64, 67], // C major
        [57, 60, 64], // A minor
        [62, 65, 69], // D minor
        [67, 71, 74], // G major
        [60, 64, 67], // C major
        [65, 69, 72], // F major
        [67, 71, 74], // G major
        [60, 64, 67], // C major
      ];
      
      chordProgression.forEach((chord, chordIndex) => {
        const startTime = chordIndex * 4; // 4 beats per chord
        chord.forEach((pitch, noteIndex) => {
          notes.push({
            id: `piano_chord_${chordIndex}_${noteIndex}_${Math.random().toString(36).substr(2, 5)}`,
            pitch,
            startTime,
            duration: 3.5,
            velocity: 85 + Math.floor(Math.random() * 20),
          });
          
          // Add some arpeggiated notes
          if (Math.random() > 0.6) {
            notes.push({
              id: `piano_arp_${chordIndex}_${noteIndex}_${Math.random().toString(36).substr(2, 5)}`,
              pitch: pitch + 12,
              startTime: startTime + 0.5 + noteIndex * 0.25,
              duration: 0.5,
              velocity: 60 + Math.floor(Math.random() * 15),
            });
          }
        });
      });
      
      // Add melody line
      const melody = [72, 74, 76, 77, 76, 74, 72, 69, 67, 69, 72, 71, 69, 67, 60];
      melody.forEach((pitch, index) => {
        notes.push({
          id: `piano_melody_${index}`,
          pitch,
          startTime: index * 2 + 0.5,
          duration: 1.5,
          velocity: 95 + Math.random() * 15,
        });
      });
    }
    
    if (track.name === 'Synth Bass') {
      // Bass line pattern
      const bassNotes = [36, 36, 43, 41, 38, 38, 45, 43, 36, 36, 43, 41, 33, 33, 40, 38];
      bassNotes.forEach((pitch, index) => {
        notes.push({
          id: `bass_${index}`,
          pitch,
          startTime: index * 2,
          duration: 1.75,
          velocity: 110 + Math.random() * 10,
        });
      });
    }
    
    if (track.name === 'Strings') {
      // String pad chords
      const stringChords = [
        [48, 52, 55, 60], // C major spread
        [45, 48, 52, 57], // A minor spread
        [50, 53, 57, 62], // D minor spread
        [55, 59, 62, 67], // G major spread
      ];
      
      stringChords.forEach((chord, chordIndex) => {
        const startTime = chordIndex * 8;
        chord.forEach((pitch, noteIndex) => {
          notes.push({
            id: `strings_${chordIndex}_${noteIndex}`,
            pitch,
            startTime,
            duration: 7.5,
            velocity: 70 + Math.random() * 15,
          });
        });
      });
    }
    
    return notes;
  };

  // Initialize MIDI notes when tracks change
  useEffect(() => {
    const newMidiNotes: Record<string, MidiNote[]> = {};
    tracks.forEach(track => {
      if (track.type === 'midi') {
        newMidiNotes[track.id] = getMidiNotesFromTrack(track);
      }
    });
    setMidiNotes(newMidiNotes);
  }, [tracks]);

  // Add note function
  const addNote = (trackId: string, note: MidiNote) => {
    setMidiNotes(prev => ({
      ...prev,
      [trackId]: [...(prev[trackId] || []), note]
    }));
    onNoteAdd?.(trackId, note);
  };

  // Handle note click
  const handleNoteClick = (noteId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (event.ctrlKey || event.metaKey) {
      const newSelected = new Set(selectedNotes);
      if (newSelected.has(noteId)) {
        newSelected.delete(noteId);
      } else {
        newSelected.add(noteId);
      }
      setSelectedNotes(newSelected);
    } else {
      setSelectedNotes(new Set([noteId]));
    }
  };

  // Handle grid click for note creation
  const handleGridClick = (event: React.MouseEvent) => {
    if (!selectedTrack || isDragging) return;

    const rect = gridRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const beat = snapToBeat(getBeatFromX(x));
    const pitch = getMidiFromY(y);

    const newNote: MidiNote = {
      id: `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      pitch,
      startTime: beat,
      duration: 1,
      velocity: 100,
    };

    addNote(selectedTrack, newNote);
    console.log(`Added note: ${getNoteNameFromMidi(pitch)} at beat ${beat}`);
  };

  // Render piano keys
  const renderPianoKeys = () => {
    const keys = [];
    
    for (let midiNote = 127; midiNote >= 0; midiNote--) {
      const isBlack = isBlackKey(midiNote);
      const noteName = getNoteNameFromMidi(midiNote);
      const y = getNoteY(midiNote);
      
      keys.push(
        <div
          key={midiNote}
          className={`absolute flex items-center px-2 text-xs border-b cursor-pointer transition-colors ${
            isBlack 
              ? 'bg-gray-800 text-white border-gray-700 hover:bg-gray-700 w-20 shadow-inner' 
              : 'bg-white text-gray-900 border-gray-300 hover:bg-gray-50 w-28 shadow-sm'
          }`}
          style={{
            top: y,
            height: noteHeight,
            zIndex: isBlack ? 2 : 1,
            borderRight: isBlack ? 'none' : '1px solid #e5e7eb',
            boxShadow: isBlack 
              ? 'inset 0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.2)' 
              : 'inset 0 1px 0 rgba(255,255,255,0.8), 0 1px 2px rgba(0,0,0,0.1)',
          }}
          onClick={() => {
            // Play note preview
            console.log(`Playing note: ${noteName} (${midiNote})`);
          }}
        >
          <span className={`select-none font-mono text-xs ${isBlack ? 'text-gray-300' : 'text-gray-700'}`}>
            {noteName}
          </span>
        </div>
      );
    }
    
    return keys;
  };

  // Render grid lines
  const renderGrid = () => {
    const lines = [];
    
    // Horizontal lines (one per semitone)
    for (let i = 0; i <= 127; i++) {
      const y = getNoteY(i);
      const isBlack = isBlackKey(i);
      lines.push(
        <line
          key={`h-${i}`}
          x1="0"
          y1={y + noteHeight}
          x2={totalBeats * beatWidth}
          y2={y + noteHeight}
          stroke="var(--border)"
          strokeWidth={isBlack ? "0.5" : "1"}
          opacity={isBlack ? "0.3" : "0.6"}
        />
      );
    }
    
    // Vertical lines (beat markers)
    for (let beat = 0; beat <= totalBeats; beat++) {
      const x = beat * beatWidth;
      const isMeasure = beat % 4 === 0;
      lines.push(
        <line
          key={`v-${beat}`}
          x1={x}
          y1="0"
          x2={x}
          y2={totalNotes * noteHeight}
          stroke="var(--border)"
          strokeWidth={isMeasure ? "2" : "1"}
          opacity={isMeasure ? "0.8" : "0.4"}
        />
      );
    }
    
    return lines;
  };

  // Render MIDI notes
  const renderNotes = (): JSX.Element[] => {
    const noteElements: JSX.Element[] = [];
    
    tracks.forEach(track => {
      const trackNotes = midiNotes[track.id] || [];
      
      trackNotes.forEach((note: MidiNote) => {
        const x = note.startTime * beatWidth;
        const y = getNoteY(note.pitch);
        const width = note.duration * beatWidth - 2; // Small gap between notes
        const height = noteHeight - 2;
        
        const isSelected = selectedNotes.has(note.id);
        const velocityOpacity = note.velocity / 127;
        
        noteElements.push(
          <rect
            key={note.id}
            x={x + 1}
            y={y + 1}
            width={Math.max(width, 10)}
            height={height}
            fill={isSelected ? 'var(--primary)' : track.color}
            fillOpacity={velocityOpacity * 0.7 + 0.3}
            stroke={isSelected ? 'var(--primary)' : 'rgba(0,0,0,0.3)'}
            strokeWidth={isSelected ? "2" : "1"}
            rx="3"
            className="cursor-pointer hover:brightness-110 transition-all"
            onClick={(e) => handleNoteClick(note.id, e as any)}
            onMouseDown={(e) => {
              e.preventDefault();
              setIsDragging(true);
              // Start drag operation
            }}
          />
        );
        
        // Note velocity indicator
        if (width > 20) {
          noteElements.push(
            <text
              key={`${note.id}-vel`}
              x={x + 4}
              y={y + noteHeight - 4}
              fontSize="10"
              fill="white"
              className="pointer-events-none select-none"
            >
              {note.velocity}
            </text>
          );
        }
      });
    });
    
    return noteElements;
  };

  // Render playhead
  const renderPlayhead = () => {
    const x = (transport.currentTime / 60) * 120 * beatWidth; // Assuming 120 BPM for conversion
    
    return (
      <line
        x1={x}
        y1="0"
        x2={x}
        y2={totalNotes * noteHeight}
        stroke="var(--destructive)"
        strokeWidth="2"
        className="pointer-events-none"
      />
    );
  };

  return (
    <div className="flex h-full bg-[var(--background)]">
      {/* Track List Sidebar */}
      <div className="w-48 bg-[var(--muted)] border-r border-[var(--border)] flex flex-col">
        <div className="h-10 bg-[var(--background)] border-b border-[var(--border)] flex items-center px-3">
          <span className="text-sm font-medium text-[var(--foreground)]">MIDI Tracks</span>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {tracks.filter(track => track.type === 'midi' || track.type === 'ai-generated').map(track => (
            <div
              key={track.id}
              className={`p-3 border-b border-[var(--border)] cursor-pointer transition-colors ${
                selectedTrack === track.id 
                  ? 'bg-[var(--accent)] border-l-4 border-l-[var(--primary)]' 
                  : 'hover:bg-[var(--accent)]'
              }`}
              onClick={() => {
                setSelectedTrack(track.id);
                onTrackSelect?.(track.id);
              }}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-[var(--foreground)] truncate">
                  {track.name}
                </span>
                <div className="flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      onTrackSolo(track.id);
                    }}
                    title={track.soloed ? "Unsolo" : "Solo"}
                  >
                    <span className={`text-xs font-bold ${track.soloed ? 'text-[var(--primary)]' : 'text-[var(--muted-foreground)]'}`}>
                      S
                    </span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      onTrackMute(track.id);
                    }}
                    title={track.muted ? "Unmute" : "Mute"}
                  >
                    {track.muted ? (
                      <VolumeX className="h-3 w-3 text-[var(--muted-foreground)]" />
                    ) : (
                      <Volume2 className="h-3 w-3 text-[var(--muted-foreground)]" />
                    )}
                  </Button>
                </div>
              </div>
              
              <div className="text-xs text-[var(--muted-foreground)]">
                {midiNotes[track.id]?.length || 0} notes
              </div>
              
              {/* Track color indicator */}
              <div
                className="w-full h-1 rounded mt-2"
                style={{ backgroundColor: track.color }}
              />
            </div>
          ))}
          
          {tracks.filter(track => track.type === 'midi' || track.type === 'ai-generated').length === 0 && (
            <div className="p-6 text-center text-[var(--muted-foreground)]">
              <span className="text-sm">No MIDI tracks found</span>
              <p className="text-xs mt-1">Add MIDI tracks to start editing</p>
            </div>
          )}
        </div>
      </div>

      {/* Piano Roll Editor */}
      <div className="flex-1 flex flex-col">
        {/* Ruler */}
        <div className="h-10 bg-[var(--background)] border-b border-[var(--border)] flex">
          <div className="w-28 bg-[var(--muted)] border-r border-[var(--border)] flex items-center justify-center">
            <span className="text-xs text-[var(--muted-foreground)]">Note</span>
          </div>
          <div className="flex-1 relative overflow-hidden">
            <svg width={totalBeats * beatWidth} height="40">
              {/* Beat markers */}
              {Array.from({ length: totalBeats + 1 }, (_, beat) => {
                const x = beat * beatWidth;
                const isMeasure = beat % 4 === 0;
                return (
                  <g key={beat}>
                    <line
                      x1={x}
                      y1="30"
                      x2={x}
                      y2="40"
                      stroke="var(--border)"
                      strokeWidth={isMeasure ? "2" : "1"}
                    />
                    {isMeasure && (
                      <text
                        x={x + 4}
                        y="20"
                        fontSize="12"
                        fill="var(--foreground)"
                        className="select-none"
                      >
                        {Math.floor(beat / 4) + 1}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Main Editor Area */}
        <div className="flex-1 flex">
          {/* Piano Keys */}
          <div className="w-28 bg-[var(--muted)] border-r border-[var(--border)] relative overflow-hidden">
            <div
              className="relative"
              style={{ height: totalNotes * noteHeight }}
            >
              {renderPianoKeys()}
            </div>
          </div>

          {/* Note Grid */}
          <div className="flex-1 relative overflow-auto" ref={pianoRollRef}>
            <div
              ref={gridRef}
              className="relative cursor-crosshair"
              style={{
                width: totalBeats * beatWidth,
                height: totalNotes * noteHeight,
              }}
              onClick={handleGridClick}
            >
              <svg
                width={totalBeats * beatWidth}
                height={totalNotes * noteHeight}
                className="absolute inset-0"
              >
                {renderGrid()}
                {renderNotes()}
                {transport.isPlaying && renderPlayhead()}
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}