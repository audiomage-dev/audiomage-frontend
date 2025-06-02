import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Button } from '@/components/ui/button';
import { AudioTrack, TransportState } from '@/types/audio';
import { Volume2, VolumeX, Edit3, Scissors, Copy, Grid3x3, BarChart3, Settings, Play, Pause, Square, MoreVertical, Trash2, ArrowUp, ArrowDown, RotateCcw, Volume1 } from 'lucide-react';

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
  onMidiPlayingChange?: (isPlaying: boolean) => void;
  onMidiTimeChange?: (time: number) => void;
  onMidiControlsRegister?: (functions: {
    playMidiTrack: () => void;
    pauseMidiPlayback: () => void;
    stopMidiPlayback: () => void;
  }) => void;
  isMidiPlaying?: boolean;
  isLocked?: boolean;
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
  onNoteDelete,
  onMidiPlayingChange,
  onMidiTimeChange,
  onMidiControlsRegister,
  isMidiPlaying = false,
  isLocked = false
}: MidiEditorProps) {
  const [selectedTrack, setSelectedTrack] = useState<string | null>(tracks.find(t => t.type === 'midi')?.id || null);
  const [selectedNotes, setSelectedNotes] = useState<Set<string>>(new Set());
  const [isDragging, setIsDragging] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [dragState, setDragState] = useState<{
    noteId: string;
    trackId: string;
    startX: number;
    startY: number;
    originalNote: MidiNote;
  } | null>(null);
  const [heldPianoKey, setHeldPianoKey] = useState<number | null>(null);
  const heldOscillatorRef = useRef<OscillatorNode | null>(null);
  const [midiNotes, setMidiNotes] = useState<Record<string, MidiNote[]>>({});
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [showVelocityEditor, setShowVelocityEditor] = useState(false);
  const [currentInstrument, setCurrentInstrument] = useState('piano');
  const [quantizeValue, setQuantizeValue] = useState(0.25); // 16th note default
  const [drawingNote, setDrawingNote] = useState<MidiNote | null>(null);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [midiPlaybackTime, setMidiPlaybackTime] = useState(0);
  const [midiPlaybackInterval, setMidiPlaybackInterval] = useState<NodeJS.Timeout | null>(null);
  const pauseTimeRef = useRef(0);
  const playbackStartTimeRef = useRef(0);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [noteContextMenu, setNoteContextMenu] = useState<{
    x: number;
    y: number;
    note: MidiNote;
    trackId: string;
  } | null>(null);
  const [activeOscillators, setActiveOscillators] = useState<Set<OscillatorNode>>(new Set());
  const activeOscillatorsRef = useRef<Set<OscillatorNode>>(new Set());
  const [isPaused, setIsPaused] = useState(false);
  const isPausedRef = useRef(false);
  const currentPlayingTrackRef = useRef<string | null>(null);
  const playedNotesRef = useRef<Set<string>>(new Set());
  const pianoRollRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const pianoKeysRef = useRef<HTMLDivElement>(null);
  const drawStartRef = useRef<{ x: number; y: number } | null>(null);

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

  // Convert MIDI note to frequency
  const midiToFrequency = (midiNote: number): number => {
    return 440 * Math.pow(2, (midiNote - 69) / 12);
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
    
    console.log(`Generating MIDI notes for track: "${track.name}" (type: ${track.type})`);
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
            id: `piano_chord_${chordIndex}_${noteIndex}`,
            pitch,
            startTime,
            duration: 3.5,
            velocity: 85 + (chordIndex * 3) % 20,
          });
          
          // Add some arpeggiated notes
          if ((chordIndex + noteIndex) % 3 === 0) {
            notes.push({
              id: `piano_arp_${chordIndex}_${noteIndex}`,
              pitch: pitch + 12,
              startTime: startTime + 0.5 + noteIndex * 0.25,
              duration: 0.5,
              velocity: 60 + (noteIndex * 5) % 15,
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
          velocity: 95 + (index * 2) % 15,
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
          velocity: 110 + (index * 2) % 10,
        });
      });
    }
    
    if (track.name === 'Strings' || track.name === 'Strings Section') {
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
            velocity: 70 + (chordIndex * 3 + noteIndex * 2) % 15,
          });
        });
      });
    }
    
    // Fallback: Generate default notes for any MIDI track without specific patterns
    if (notes.length === 0) {
      console.log(`No specific pattern found for "${track.name}", generating default MIDI notes`);
      
      // Generate a simple melody pattern for any unmatched MIDI track
      const defaultNotes = [60, 62, 64, 65, 67, 69, 71, 72]; // C major scale
      defaultNotes.forEach((pitch, index) => {
        notes.push({
          id: `default_${track.name.replace(/\s+/g, '_')}_${index}`,
          pitch,
          startTime: index * 2,
          duration: 1.5,
          velocity: 80 + (index * 5) % 20,
        });
      });
    }
    
    console.log(`Generated ${notes.length} MIDI notes for "${track.name}"`);
    return notes;
  };

  // Initialize audio context for note playback
  useEffect(() => {
    const initAudio = async () => {
      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        setAudioContext(ctx);
        
        // Resume audio context if suspended (required by browsers)
        if (ctx.state === 'suspended') {
          console.log('Audio context suspended, will resume on user interaction');
        }
      } catch (error) {
        console.error('Failed to initialize audio context:', error);
      }
    };
    
    initAudio();
    
    return () => {
      if (audioContext) {
        audioContext.close();
      }
    };
  }, []);



  // Initialize MIDI notes when tracks change - only if not already initialized
  useEffect(() => {
    const newMidiNotes: Record<string, MidiNote[]> = { ...midiNotes };
    let hasChanges = false;
    
    tracks.forEach(track => {
      if (track.type === 'midi' && !newMidiNotes[track.id]) {
        newMidiNotes[track.id] = getMidiNotesFromTrack(track);
        hasChanges = true;
      }
    });
    
    if (hasChanges) {
      setMidiNotes(newMidiNotes);
    }
  }, [tracks]);

  // Add note function
  const addNote = (trackId: string, note: MidiNote) => {
    // Prevent adding notes when MIDI editor is locked
    if (isLocked) {
      return;
    }
    
    setMidiNotes(prev => ({
      ...prev,
      [trackId]: [...(prev[trackId] || []), note]
    }));
    onNoteAdd?.(trackId, note);
  };

  // Edit note function
  const editNote = (trackId: string, noteId: string, updates: Partial<MidiNote>) => {
    setMidiNotes(prev => ({
      ...prev,
      [trackId]: (prev[trackId] || []).map(note => 
        note.id === noteId ? { ...note, ...updates } : note
      )
    }));
    onNoteEdit?.(trackId, noteId, updates);
  };

  // Delete note function
  const deleteNote = (trackId: string, noteId: string) => {
    setMidiNotes(prev => ({
      ...prev,
      [trackId]: (prev[trackId] || []).filter(note => note.id !== noteId)
    }));
    onNoteDelete?.(trackId, noteId);
  };

  // Quantize selected notes
  const quantizeNotes = () => {
    if (!selectedTrack || selectedNotes.size === 0) return;
    
    selectedNotes.forEach(noteId => {
      const note = midiNotes[selectedTrack]?.find(n => n.id === noteId);
      if (note) {
        const quantizedStartTime = Math.round(note.startTime / quantizeValue) * quantizeValue;
        editNote(selectedTrack, noteId, { startTime: quantizedStartTime });
      }
    });
  };

  // Adjust velocity for selected notes
  const adjustVelocity = (velocityChange: number) => {
    if (!selectedTrack || selectedNotes.size === 0) return;
    
    selectedNotes.forEach(noteId => {
      const note = midiNotes[selectedTrack]?.find(n => n.id === noteId);
      if (note) {
        const newVelocity = Math.max(1, Math.min(127, note.velocity + velocityChange));
        editNote(selectedTrack, noteId, { velocity: newVelocity });
      }
    });
  };

  // Play a single MIDI note
  const playNote = async (pitch: number, velocity: number = 100, duration: number = 0.5) => {
    if (!audioContext) {
      console.warn('Audio context not available');
      return;
    }
    
    // Don't play new notes if paused using ref for immediate detection
    if (isPausedRef.current) {
      return;
    }
    
    try {
      // Ensure audio context is running
      if (audioContext.state === 'suspended') {
        console.log('Resuming audio context...');
        await audioContext.resume();
      }

      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      const filterNode = audioContext.createBiquadFilter();
      
      // Connect audio nodes
      oscillator.connect(filterNode);
      filterNode.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Convert MIDI note to frequency
      const frequency = 440 * Math.pow(2, (pitch - 69) / 12);
      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
      
      // Set oscillator type based on instrument
      const waveType = getInstrumentWaveType(currentInstrument);
      oscillator.type = waveType;
      
      // Configure filter for more realistic sound
      filterNode.type = 'lowpass';
      filterNode.frequency.setValueAtTime(frequency * 4, audioContext.currentTime);
      filterNode.Q.setValueAtTime(1, audioContext.currentTime);
      
      // Set volume based on velocity with better dynamics
      const volume = Math.max(0.01, (velocity / 127) * 0.2);
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
      
      // Track active oscillator in both state and ref
      activeOscillatorsRef.current.add(oscillator);
      setActiveOscillators(prev => new Set(prev).add(oscillator));
      
      // Remove oscillator from active set when it ends
      oscillator.onended = () => {
        activeOscillatorsRef.current.delete(oscillator);
        setActiveOscillators(prev => {
          const newSet = new Set(prev);
          newSet.delete(oscillator);
          return newSet;
        });
      };
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration);
      
      console.log(`Playing note: ${getNoteNameFromMidi(pitch)} (${pitch}) at ${frequency.toFixed(1)}Hz with ${waveType} wave`);
    } catch (error) {
      console.error('Error playing note:', error);
    }
  };

  // Play all notes in the current track (transport play functionality)
  const playAllNotes = () => {
    if (!selectedTrack || !audioContext) return;
    
    const trackNotes = midiNotes[selectedTrack] || [];
    if (trackNotes.length === 0) return;
    
    console.log(`Playing ${trackNotes.length} notes from track`);
    
    trackNotes.forEach(note => {
      const delay = note.startTime * 0.5; // Convert beats to seconds (simplified)
      setTimeout(() => {
        playNote(note.pitch, note.velocity, note.duration * 0.5);
      }, delay * 1000);
    });
  };



  // Transport integration disabled to prevent interference with MIDI playback
  // MIDI playback is independent and controlled by MIDI transport controls

  // Handle note click - now plays the note
  const handleNoteClick = (noteId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    
    // Find and play the clicked note
    if (selectedTrack) {
      const note = midiNotes[selectedTrack]?.find(n => n.id === noteId);
      if (note) {
        playNote(note.pitch, note.velocity, note.duration * 0.5);
      }
    }
    
    // Handle selection
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

  // Note dragging functionality
  const handleNoteMouseDown = (noteId: string, event: React.MouseEvent) => {
    if (isLocked) return;
    
    event.stopPropagation();
    event.preventDefault();
    
    if (!selectedTrack) return;
    
    const note = midiNotes[selectedTrack]?.find(n => n.id === noteId);
    if (!note) return;
    
    // Start dragging
    setIsDragging(true);
    setDragState({
      noteId,
      trackId: selectedTrack,
      startX: event.clientX,
      startY: event.clientY,
      originalNote: { ...note }
    });
    
    // Add selected note if not already selected
    if (!selectedNotes.has(noteId)) {
      setSelectedNotes(new Set([noteId]));
    }
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    if (!dragState || !isDragging) return;
    
    event.preventDefault();
    
    const deltaX = event.clientX - dragState.startX;
    const deltaY = event.clientY - dragState.startY;
    
    // Calculate new position
    const beatsPerPixel = 1 / beatWidth;
    const pitchPerPixel = 1 / noteHeight;
    
    const newStartTime = Math.max(0, dragState.originalNote.startTime + (deltaX * beatsPerPixel));
    const newPitch = Math.max(0, Math.min(127, dragState.originalNote.pitch - Math.round(deltaY * pitchPerPixel)));
    
    // Update note position
    setMidiNotes(prevNotes => {
      const updatedNotes = { ...prevNotes };
      if (updatedNotes[dragState.trackId]) {
        updatedNotes[dragState.trackId] = updatedNotes[dragState.trackId].map(note => 
          note.id === dragState.noteId ? {
            ...note,
            startTime: newStartTime,
            pitch: newPitch
          } : note
        );
      }
      return updatedNotes;
    });
  };

  const handleMouseUp = () => {
    if (dragState) {
      // Notify parent component of note changes
      if (onNoteEdit && dragState.trackId) {
        const updatedNote = midiNotes[dragState.trackId]?.find(n => n.id === dragState.noteId);
        if (updatedNote) {
          onNoteEdit(dragState.trackId, dragState.noteId, {
            startTime: updatedNote.startTime,
            pitch: updatedNote.pitch
          });
        }
      }
    }
    
    setIsDragging(false);
    setDragState(null);
  };



  // Global mouse event handlers for dragging
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (dragState && isDragging) {
        const deltaX = e.clientX - dragState.startX;
        const deltaY = e.clientY - dragState.startY;
        
        // Calculate new position
        const beatsPerPixel = 1 / beatWidth;
        const pitchPerPixel = 1 / noteHeight;
        
        const newStartTime = Math.max(0, dragState.originalNote.startTime + (deltaX * beatsPerPixel));
        const newPitch = Math.max(0, Math.min(127, dragState.originalNote.pitch - Math.round(deltaY * pitchPerPixel)));
        
        // Update note position
        setMidiNotes(prevNotes => {
          const updatedNotes = { ...prevNotes };
          if (updatedNotes[dragState.trackId]) {
            updatedNotes[dragState.trackId] = updatedNotes[dragState.trackId].map(note => 
              note.id === dragState.noteId ? {
                ...note,
                startTime: newStartTime,
                pitch: newPitch
              } : note
            );
          }
          return updatedNotes;
        });
      }
    };

    const handleGlobalMouseUp = () => {
      if (dragState) {
        // Notify parent component of note changes
        if (onNoteEdit && dragState.trackId) {
          const updatedNote = midiNotes[dragState.trackId]?.find(n => n.id === dragState.noteId);
          if (updatedNote) {
            onNoteEdit(dragState.trackId, dragState.noteId, {
              startTime: updatedNote.startTime,
              pitch: updatedNote.pitch
            });
          }
        }
      }
      
      setIsDragging(false);
      setDragState(null);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleGlobalMouseMove);
        document.removeEventListener('mouseup', handleGlobalMouseUp);
      };
    }
  }, [isDragging, dragState, onNoteEdit, beatWidth, noteHeight, midiNotes]);

  // Global mouse up listener for piano keys
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (heldPianoKey !== null) {
        handlePianoKeyMouseUp();
      }
    };

    if (heldPianoKey !== null) {
      document.addEventListener('mouseup', handleGlobalMouseUp);
      document.addEventListener('mouseleave', handleGlobalMouseUp);
      
      return () => {
        document.removeEventListener('mouseup', handleGlobalMouseUp);
        document.removeEventListener('mouseleave', handleGlobalMouseUp);
      };
    }
  }, [heldPianoKey]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedTrack) return;
      
      // Delete selected notes
      if (e.key === 'Delete' || e.key === 'Backspace') {
        selectedNotes.forEach(noteId => {
          deleteNote(selectedTrack, noteId);
        });
        setSelectedNotes(new Set());
      }
      
      // Quantize notes
      if (e.key === 'q' || e.key === 'Q') {
        quantizeNotes();
      }
      
      // Velocity adjustments
      if (e.key === 'ArrowUp' && selectedNotes.size > 0) {
        e.preventDefault();
        adjustVelocity(10);
      }
      if (e.key === 'ArrowDown' && selectedNotes.size > 0) {
        e.preventDefault();
        adjustVelocity(-10);
      }
      
      // Select all notes in current track
      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        e.preventDefault();
        const trackNotes = midiNotes[selectedTrack] || [];
        setSelectedNotes(new Set(trackNotes.map(note => note.id)));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedTrack, selectedNotes, midiNotes, quantizeNotes, adjustVelocity]);

  // Handle grid mouse down for note creation/drawing
  const handleGridMouseDown = (event: React.MouseEvent) => {
    if (!selectedTrack) return;

    // Check if we clicked on an existing note - if so, don't create a new one
    const target = event.target as Element;
    if (target.tagName === 'rect' && target.getAttribute('data-note-id')) {
      // Clicked on an existing note, don't create a new one
      return;
    }

    const rect = gridRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const beat = snapToBeat(getBeatFromX(x));
    const pitch = getMidiFromY(y);

    // Check if there's already a note at this position
    const existingNotes = midiNotes[selectedTrack] || [];
    const noteAtPosition = existingNotes.find(note => 
      Math.abs(note.pitch - pitch) < 0.5 && 
      Math.abs(note.startTime - beat) < 0.25
    );

    if (noteAtPosition) {
      // There's already a note here, don't create a new one
      return;
    }

    // Start drawing a new note only if there's no existing note
    drawStartRef.current = { x, y };
    setIsDrawing(true);

    const newNote: MidiNote = {
      id: `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      pitch,
      startTime: beat,
      duration: 0.25, // Start with minimum duration
      velocity: 100,
    };

    setDrawingNote(newNote);
  };

  // Handle grid mouse move for note resizing during drawing
  const handleGridMouseMove = (event: React.MouseEvent) => {
    if (!isDrawing || !drawingNote || !drawStartRef.current) return;

    const rect = gridRef.current?.getBoundingClientRect();
    if (!rect) return;

    const currentX = event.clientX - rect.left;
    const startBeat = getBeatFromX(drawStartRef.current.x);
    const currentBeat = getBeatFromX(currentX);
    
    const duration = Math.max(0.25, snapToBeat(currentBeat - startBeat));

    setDrawingNote(prev => prev ? { ...prev, duration } : null);
  };

  // Handle grid mouse up to finalize note creation
  const handleGridMouseUp = () => {
    if (!isDrawing || !drawingNote || !selectedTrack) return;

    // Add the final note to the track
    addNote(selectedTrack, drawingNote);
    console.log(`Added note: ${getNoteNameFromMidi(drawingNote.pitch)} at beat ${drawingNote.startTime} with duration ${drawingNote.duration}`);
    
    // Play the created note
    playNote(drawingNote.pitch, drawingNote.velocity, 0.3);

    // Reset drawing state
    setIsDrawing(false);
    setDrawingNote(null);
    drawStartRef.current = null;
  };

  // Handle piano key click to play note and add to canvas
  const handlePianoKeyClick = (pitch: number) => {
    if (!selectedTrack) return;
    
    // Get instrument type from selected track
    let instrumentForSound = currentInstrument;
    const track = tracks.find(t => t.id === selectedTrack);
    if (track) {
      const trackName = track.name.toLowerCase();
      if (trackName.includes('piano')) instrumentForSound = 'piano';
      else if (trackName.includes('bass')) instrumentForSound = 'bass';
      else if (trackName.includes('string')) instrumentForSound = 'strings';
      else if (trackName.includes('synth')) {
        if (trackName.includes('lead')) instrumentForSound = 'synth_lead';
        else if (trackName.includes('pad')) instrumentForSound = 'synth_pad';
        else if (trackName.includes('bass')) instrumentForSound = 'synth_bass';
        else instrumentForSound = 'synth_lead';
      }
      else if (trackName.includes('guitar')) instrumentForSound = 'guitar';
      else if (trackName.includes('organ')) instrumentForSound = 'organ';
      else if (trackName.includes('brass')) instrumentForSound = 'brass';
      else if (trackName.includes('drum')) instrumentForSound = 'drums';
      else if (trackName.includes('percussion')) instrumentForSound = 'percussion';
    }
    
    // Play the exact MIDI note with track-specific instrument characteristics
    const velocity = getInstrumentVelocity(instrumentForSound);
    const duration = getInstrumentDuration(instrumentForSound);
    
    playNote(pitch, velocity, duration);
    
    // Add note to the canvas at the current playback position
    const currentTime = midiPlaybackTime || 0;
    const startTime = Math.max(0, currentTime);
    
    const newNote: MidiNote = {
      id: `note-${Date.now()}-${Math.random()}`,
      pitch: pitch,
      startTime: startTime,
      duration: 1.0, // 1 beat duration
      velocity: Math.round(velocity * 127) // Convert to MIDI velocity (0-127)
    };
    
    // Add the note to the track
    if (onNoteAdd) {
      onNoteAdd(selectedTrack, newNote);
      console.log(`Added note: ${getNoteNameFromMidi(pitch)} (${pitch}) at beat ${startTime.toFixed(2)} to track ${selectedTrack}`);
    }
    
    console.log(`Playing note: ${getNoteNameFromMidi(pitch)} (${pitch}) at ${midiToFrequency(pitch).toFixed(1)}Hz with ${instrumentForSound}`);
  };

  const handlePianoKeyMouseDown = (pitch: number, event: React.MouseEvent) => {
    event.preventDefault();
    if (heldPianoKey === pitch) return;
    
    // Stop any currently held note
    if (heldOscillatorRef.current) {
      try {
        heldOscillatorRef.current.stop();
      } catch (e) {
        // Oscillator might already be stopped
      }
    }
    
    // Get instrument type from selected track
    let instrumentForSound = currentInstrument;
    if (selectedTrack) {
      const track = tracks.find(t => t.id === selectedTrack);
      if (track) {
        const trackName = track.name.toLowerCase();
        if (trackName.includes('piano')) instrumentForSound = 'piano';
        else if (trackName.includes('bass')) instrumentForSound = 'bass';
        else if (trackName.includes('string')) instrumentForSound = 'strings';
        else if (trackName.includes('synth')) {
          if (trackName.includes('lead')) instrumentForSound = 'synth_lead';
          else if (trackName.includes('pad')) instrumentForSound = 'synth_pad';
          else if (trackName.includes('bass')) instrumentForSound = 'synth_bass';
          else instrumentForSound = 'synth_lead';
        }
        else if (trackName.includes('guitar')) instrumentForSound = 'guitar';
        else if (trackName.includes('organ')) instrumentForSound = 'organ';
        else if (trackName.includes('brass')) instrumentForSound = 'brass';
        else if (trackName.includes('drum')) instrumentForSound = 'drums';
        else if (trackName.includes('percussion')) instrumentForSound = 'percussion';
      }
    }
    
    // Use the same playNote function that existing notes use for consistent instrument sounds
    const velocity = getInstrumentVelocity(instrumentForSound);
    const duration = 2.0; // Longer duration for hold
    
    console.log(`Holding note: ${getNoteNameFromMidi(pitch)} (${pitch}) with ${instrumentForSound} instrument`);
    
    // Play using the same function as existing notes
    playNote(pitch, velocity, duration);
    setHeldPianoKey(pitch);
  };

  const handlePianoKeyMouseUp = () => {
    // For instrument sounds using playNote, we don't need to manually stop oscillators
    // The playNote function handles the audio lifecycle automatically
    setHeldPianoKey(null);
    if (heldOscillatorRef.current) {
      heldOscillatorRef.current = null;
    }
  };

  // Get velocity based on instrument type
  const getInstrumentVelocity = (instrument: string): number => {
    const velocityMap: Record<string, number> = {
      piano: 100,
      electric_piano: 90,
      organ: 110,
      guitar: 85,
      bass: 120,
      strings: 75,
      brass: 105,
      woodwind: 80,
      synth_lead: 110,
      synth_pad: 70,
      synth_bass: 115,
      drums: 127,
      percussion: 100,
      sound_fx: 95
    };
    return velocityMap[instrument] || 100;
  };

  // Get duration based on instrument type
  const getInstrumentDuration = (instrument: string): number => {
    const durationMap: Record<string, number> = {
      piano: 0.8,
      electric_piano: 0.6,
      organ: 1.2,
      guitar: 0.7,
      bass: 0.9,
      strings: 1.5,
      brass: 1.0,
      woodwind: 1.1,
      synth_lead: 0.5,
      synth_pad: 2.0,
      synth_bass: 0.8,
      drums: 0.3,
      percussion: 0.4,
      sound_fx: 1.0
    };
    return durationMap[instrument] || 0.5;
  };

  // Get waveform type based on instrument
  const getInstrumentWaveType = (instrument: string): OscillatorType => {
    const waveTypeMap: Record<string, OscillatorType> = {
      piano: 'triangle',
      electric_piano: 'triangle',
      organ: 'square',
      guitar: 'sawtooth',
      bass: 'triangle',
      strings: 'sawtooth',
      brass: 'sawtooth',
      woodwind: 'sine',
      synth_lead: 'sawtooth',
      synth_pad: 'triangle',
      synth_bass: 'square',
      drums: 'square',
      percussion: 'triangle',
      sound_fx: 'square'
    };
    return waveTypeMap[instrument] || 'sine';
  };

  // Handle scroll synchronization
  const handleScrollSync = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    setScrollOffset(scrollTop);
  };

  // Handle note right-click context menu
  const handleNoteRightClick = (e: React.MouseEvent, note: MidiNote, trackId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    setNoteContextMenu({
      x: e.clientX,
      y: e.clientY,
      note,
      trackId
    });
  };

  // Handle note context menu actions
  const handleNoteContextAction = (action: string, note: MidiNote, trackId: string) => {
    // Prevent note editing when MIDI editor is locked
    if (isLocked && action !== 'play-note') {
      return;
    }
    
    switch (action) {
      case 'duplicate':
        const duplicatedNote: MidiNote = {
          ...note,
          id: `${trackId}-${Date.now()}-${Math.random()}`,
          startTime: note.startTime + note.duration
        };
        setMidiNotes(prev => ({
          ...prev,
          [trackId]: [...(prev[trackId] || []), duplicatedNote]
        }));
        console.log('Note duplicated');
        break;
        
      case 'delete':
        setMidiNotes(prev => ({
          ...prev,
          [trackId]: (prev[trackId] || []).filter(n => n.id !== note.id)
        }));
        console.log('Note deleted');
        break;
        
      case 'quantize':
        const quantizedNote = {
          ...note,
          startTime: Math.round(note.startTime * 4) / 4, // Quantize to 16th notes
          duration: Math.round(note.duration * 4) / 4
        };
        setMidiNotes(prev => ({
          ...prev,
          [trackId]: (prev[trackId] || []).map(n => n.id === note.id ? quantizedNote : n)
        }));
        console.log('Note quantized');
        break;
        
      case 'velocity-up':
        const velocityUpNote = {
          ...note,
          velocity: Math.min(127, note.velocity + 10)
        };
        setMidiNotes(prev => ({
          ...prev,
          [trackId]: (prev[trackId] || []).map(n => n.id === note.id ? velocityUpNote : n)
        }));
        console.log('Note velocity increased');
        break;
        
      case 'velocity-down':
        const velocityDownNote = {
          ...note,
          velocity: Math.max(1, note.velocity - 10)
        };
        setMidiNotes(prev => ({
          ...prev,
          [trackId]: (prev[trackId] || []).map(n => n.id === note.id ? velocityDownNote : n)
        }));
        console.log('Note velocity decreased');
        break;
        
      case 'octave-up':
        const octaveUpNote = {
          ...note,
          pitch: Math.min(127, note.pitch + 12)
        };
        setMidiNotes(prev => ({
          ...prev,
          [trackId]: (prev[trackId] || []).map(n => n.id === note.id ? octaveUpNote : n)
        }));
        console.log('Note moved up one octave');
        break;
        
      case 'octave-down':
        const octaveDownNote = {
          ...note,
          pitch: Math.max(0, note.pitch - 12)
        };
        setMidiNotes(prev => ({
          ...prev,
          [trackId]: (prev[trackId] || []).map(n => n.id === note.id ? octaveDownNote : n)
        }));
        console.log('Note moved down one octave');
        break;
        
      case 'play-note':
        const velocity = getInstrumentVelocity(currentInstrument);
        const duration = getInstrumentDuration(currentInstrument);
        playNote(note.pitch, velocity, duration);
        console.log(`Playing note: ${getNoteNameFromMidi(note.pitch)}`);
        break;
    }
    
    setNoteContextMenu(null);
  };

  // Note Context Menu Component
  const NoteContextMenu = () => {
    if (!noteContextMenu) return null;

    return (
      <div
        className="fixed z-50 bg-[var(--background)] border border-[var(--border)] rounded-lg shadow-xl py-2 min-w-48 backdrop-blur-sm"
        style={{
          left: noteContextMenu.x,
          top: noteContextMenu.y,
          transform: 'translate(-50%, -10px)',
          backgroundColor: 'var(--background)',
          opacity: 1
        }}
        onMouseLeave={() => setNoteContextMenu(null)}
      >
        {/* Note Info Header */}
        <div className="px-3 py-2 border-b border-[var(--border)] bg-[var(--muted)]/30">
          <div className="text-xs font-medium text-[var(--foreground)]">
            {getNoteNameFromMidi(noteContextMenu.note.pitch)} • Vel: {noteContextMenu.note.velocity}
          </div>
          <div className="text-xs text-[var(--muted-foreground)]">
            Duration: {noteContextMenu.note.duration.toFixed(2)} beats
          </div>
        </div>

        {/* Playback Actions */}
        <div className="py-1">
          <button
            className="w-full px-3 py-2 text-left text-sm hover:bg-[var(--accent)] flex items-center space-x-2"
            onClick={() => handleNoteContextAction('play-note', noteContextMenu.note, noteContextMenu.trackId)}
          >
            <Play className="w-4 h-4" />
            <span>Play Note</span>
          </button>
        </div>

        <div className="border-t border-[var(--border)] my-1"></div>

        {/* Edit Actions */}
        <div className="py-1">
          <button
            className="w-full px-3 py-2 text-left text-sm hover:bg-[var(--accent)] flex items-center space-x-2"
            onClick={() => handleNoteContextAction('duplicate', noteContextMenu.note, noteContextMenu.trackId)}
          >
            <Copy className="w-4 h-4" />
            <span>Duplicate Note</span>
          </button>
          
          <button
            className="w-full px-3 py-2 text-left text-sm hover:bg-[var(--accent)] flex items-center space-x-2"
            onClick={() => handleNoteContextAction('quantize', noteContextMenu.note, noteContextMenu.trackId)}
          >
            <Grid3x3 className="w-4 h-4" />
            <span>Quantize to Grid</span>
          </button>
        </div>

        <div className="border-t border-[var(--border)] my-1"></div>

        {/* Velocity Controls */}
        <div className="py-1">
          <button
            className="w-full px-3 py-2 text-left text-sm hover:bg-[var(--accent)] flex items-center space-x-2"
            onClick={() => handleNoteContextAction('velocity-up', noteContextMenu.note, noteContextMenu.trackId)}
          >
            <Volume2 className="w-4 h-4" />
            <span>Increase Velocity (+10)</span>
          </button>
          
          <button
            className="w-full px-3 py-2 text-left text-sm hover:bg-[var(--accent)] flex items-center space-x-2"
            onClick={() => handleNoteContextAction('velocity-down', noteContextMenu.note, noteContextMenu.trackId)}
          >
            <Volume1 className="w-4 h-4" />
            <span>Decrease Velocity (-10)</span>
          </button>
        </div>

        <div className="border-t border-[var(--border)] my-1"></div>

        {/* Pitch Controls */}
        <div className="py-1">
          <button
            className="w-full px-3 py-2 text-left text-sm hover:bg-[var(--accent)] flex items-center space-x-2"
            onClick={() => handleNoteContextAction('octave-up', noteContextMenu.note, noteContextMenu.trackId)}
          >
            <ArrowUp className="w-4 h-4" />
            <span>Octave Up (+12)</span>
          </button>
          
          <button
            className="w-full px-3 py-2 text-left text-sm hover:bg-[var(--accent)] flex items-center space-x-2"
            onClick={() => handleNoteContextAction('octave-down', noteContextMenu.note, noteContextMenu.trackId)}
          >
            <ArrowDown className="w-4 h-4" />
            <span>Octave Down (-12)</span>
          </button>
        </div>

        <div className="border-t border-[var(--border)] my-1"></div>

        {/* Destructive Actions */}
        <div className="py-1">
          <button
            className="w-full px-3 py-2 text-left text-sm hover:bg-[var(--destructive)] hover:text-[var(--destructive-foreground)] flex items-center space-x-2 text-[var(--destructive)]"
            onClick={() => handleNoteContextAction('delete', noteContextMenu.note, noteContextMenu.trackId)}
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Note</span>
          </button>
        </div>
      </div>
    );
  };

  // Close context menu when clicking elsewhere
  useEffect(() => {
    const handleClickOutside = () => {
      setNoteContextMenu(null);
    };

    if (noteContextMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [noteContextMenu]);

  // Helper function to start new playback
  const startNewPlayback = (trackId: string, startFromBeat: number = 0) => {
    if (!trackId || !midiNotes[trackId]) return;
    
    const bpm = 120;
    const beatsPerSecond = bpm / 60;
    
    // Set up timing
    playbackStartTimeRef.current = Date.now() - (startFromBeat / beatsPerSecond * 1000);
    currentPlayingTrackRef.current = trackId;
    
    const interval = setInterval(() => {
      if (isPausedRef.current) return;
      
      const elapsed = (Date.now() - playbackStartTimeRef.current) / 1000;
      const currentBeat = elapsed * beatsPerSecond;
      
      setMidiPlaybackTime(currentBeat);
      onMidiTimeChange?.(currentBeat);
      
      // Play notes
      const trackNotes = midiNotes[trackId] || [];
      trackNotes.forEach((note: MidiNote) => {
        const noteKey = `${trackId}_${note.id}`;
        if (currentBeat >= note.startTime && 
            currentBeat <= note.startTime + note.duration && 
            !playedNotesRef.current.has(noteKey)) {
          
          playedNotesRef.current.add(noteKey);
          const waveType = getInstrumentWaveType(currentInstrument);
          const frequency = 440 * Math.pow(2, (note.pitch - 69) / 12);
          
          if (audioContext) {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.type = waveType;
            oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
            
            const velocity = note.velocity / 127;
            gainNode.gain.setValueAtTime(velocity * 0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + note.duration * 0.5);
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.start();
            oscillator.stop(audioContext.currentTime + note.duration * 0.5);
            
            activeOscillatorsRef.current.add(oscillator);
            setActiveOscillators(new Set(activeOscillatorsRef.current));
            
            oscillator.onended = () => {
              activeOscillatorsRef.current.delete(oscillator);
              setActiveOscillators(new Set(activeOscillatorsRef.current));
            };
          }
        }
      });
      
      // Stop at end
      const maxEndTime = Math.max(...trackNotes.map(note => note.startTime + note.duration));
      if (currentBeat >= maxEndTime) {
        clearInterval(interval);
        setMidiPlaybackInterval(null);
        setMidiPlaybackTime(0);
        onMidiPlayingChange?.(false);
        onMidiTimeChange?.(0);
        playedNotesRef.current.clear();
        isPausedRef.current = false;
        setIsPaused(false);
      }
    }, 16);
    
    setMidiPlaybackInterval(interval);
  };

  // MIDI-specific playback controls
  const playMidiTrack = () => {
    console.log('playMidiTrack called - isPaused:', isPaused, 'isPausedRef:', isPausedRef.current, 'currentTrack:', currentPlayingTrackRef.current, 'selectedTrack:', selectedTrack);
    
    // If paused and same track, resume playback from pause position
    if (isPausedRef.current && currentPlayingTrackRef.current === selectedTrack) {
      console.log('Resuming MIDI playback from pause position:', pauseTimeRef.current);
      
      // Reset playback start time to continue from exact pause position
      const bpm = 120;
      const beatsPerSecond = bpm / 60;
      const pausedSeconds = pauseTimeRef.current / beatsPerSecond;
      playbackStartTimeRef.current = Date.now() - (pausedSeconds * 1000);
      console.log('Reset playback timing to continue from pause position:', pauseTimeRef.current);
      
      // Clear pause state immediately
      isPausedRef.current = false;
      setIsPaused(false);
      
      // Update UI state
      setMidiPlaybackTime(pauseTimeRef.current);
      onMidiPlayingChange?.(true);
      onMidiTimeChange?.(pauseTimeRef.current);
      
      // The interval should already be running, just unpaused
      console.log('Resuming from pause - interval should continue');
      return;
    }
    
    // If paused but different track, stop current and start new
    if (isPausedRef.current && currentPlayingTrackRef.current !== selectedTrack) {
      console.log('Switching tracks during pause, stopping current playback...');
      stopMidiPlayback();
      // Continue to start new track
    }
    
    // If playing, pause instead
    if (midiPlaybackInterval && !isPausedRef.current) {
      pauseMidiPlayback();
      return;
    }
    
    console.log('Debug playMidiTrack:', { 
      selectedTrack, 
      midiNotesKeys: Object.keys(midiNotes),
      selectedTrackNotes: midiNotes[selectedTrack || '']?.length || 0,
      trackNames: tracks.map(t => ({ id: t.id, name: t.name, type: t.type }))
    });
    
    // If no selected track, use the first available MIDI track
    let trackToPlay: string | null = selectedTrack;
    if (!trackToPlay || !midiNotes[trackToPlay]) {
      const availableTracks = Object.keys(midiNotes).filter(trackId => midiNotes[trackId]?.length > 0);
      if (availableTracks.length > 0) {
        trackToPlay = availableTracks[0];
        console.log('Using first available track:', trackToPlay);
      } else {
        console.log('No MIDI tracks with notes available');
        return;
      }
    }
    
    if (!trackToPlay) {
      console.log('No valid track to play');
      return;
    }
    
    // Ensure trackToPlay is non-null for the rest of the function
    const activeTrack = trackToPlay;
    
    console.log('Starting MIDI playback...');
    currentPlayingTrackRef.current = activeTrack;
    isPausedRef.current = false;
    setIsPaused(false);
    onMidiPlayingChange?.(true);
    
    // Reset playback time, pause time, and played notes for new tracks
    setMidiPlaybackTime(0);
    pauseTimeRef.current = 0;
    playedNotesRef.current.clear();
    
    playbackStartTimeRef.current = Date.now();
    const bpm = 120; // Default BPM for MIDI playback
    const beatsPerSecond = bpm / 60;
    
    const interval = setInterval(() => {
      // Check if playback is paused using ref for immediate detection
      if (isPausedRef.current) {
        return;
      }
      
      const elapsed = (Date.now() - playbackStartTimeRef.current) / 1000;
      const currentBeat = elapsed * beatsPerSecond;
      setMidiPlaybackTime(currentBeat);
      onMidiTimeChange?.(currentBeat);
      
      // Play notes that should be triggered at this time
      const trackNotes = midiNotes[activeTrack] || [];
      trackNotes.forEach((note: MidiNote) => {
        const noteStartTime = note.startTime;
        const noteKey = `${note.id}-${noteStartTime}`;
        
        // If we've reached this note's start time and haven't played it yet
        if (currentBeat >= noteStartTime && !playedNotesRef.current.has(noteKey)) {
          playedNotesRef.current.add(noteKey);
          const velocity = note.velocity || getInstrumentVelocity(currentInstrument);
          const duration = note.duration * 0.4 || getInstrumentDuration(currentInstrument);
          playNote(note.pitch, velocity, duration);
          console.log(`Playing note at beat ${currentBeat.toFixed(2)}: ${getNoteNameFromMidi(note.pitch)}`);
        }
      });
      
      // Stop at end of track (32 beats for demo)
      if (currentBeat >= 32) {
        console.log('Reached end of track, stopping playback');
        stopMidiPlayback();
      }
    }, 25); // Update every 25ms for smoother playback
    
    setMidiPlaybackInterval(interval);
    console.log(`Started MIDI playback for track "${tracks.find(t => t.id === activeTrack)?.name}" with ${midiNotes[activeTrack]?.length || 0} notes`);
  };

  const pauseMidiPlayback = () => {
    console.log('Pausing MIDI playback - stopping', activeOscillatorsRef.current.size, 'active notes');
    console.log('Current midiPlaybackTime:', midiPlaybackTime);
    
    // Calculate current playback time more accurately if needed
    let currentTime = midiPlaybackTime;
    if (playbackStartTimeRef.current > 0) {
      const bpm = 120;
      const beatsPerSecond = bpm / 60;
      const elapsed = (Date.now() - playbackStartTimeRef.current) / 1000;
      currentTime = elapsed * beatsPerSecond;
      console.log('Calculated current time from elapsed:', currentTime);
    }
    
    // Save current playback time for resume
    pauseTimeRef.current = Math.max(currentTime, 0);
    console.log('Saved pause time:', pauseTimeRef.current);
    
    // Set pause state immediately in both state and ref
    isPausedRef.current = true;
    setIsPaused(true);
    console.log('Pause state set to true - isPausedRef:', isPausedRef.current, 'currentTrack:', currentPlayingTrackRef.current);
    
    // Don't clear the interval during pause - we need it for resume
    // The interval will check isPausedRef.current and skip execution
    
    // Stop all active oscillators immediately using ref
    const oscillatorsToStop = Array.from(activeOscillatorsRef.current);
    oscillatorsToStop.forEach(oscillator => {
      try {
        oscillator.stop(0); // Stop immediately
        console.log('Stopped oscillator');
      } catch (error) {
        console.log('Error stopping oscillator:', error);
      }
    });
    
    // Clear both ref and state
    activeOscillatorsRef.current.clear();
    setActiveOscillators(new Set());
    
    onMidiPlayingChange?.(false);
    console.log('MIDI playback paused - all audio stopped');
  };

  const stopMidiPlayback = () => {
    setIsPaused(false);
    if (midiPlaybackInterval) {
      clearInterval(midiPlaybackInterval);
      setMidiPlaybackInterval(null);
    }
    
    // Stop all active oscillators
    activeOscillators.forEach(oscillator => {
      try {
        oscillator.stop();
      } catch (error) {
        // Oscillator might already be stopped
      }
    });
    setActiveOscillators(new Set());
    
    onMidiPlayingChange?.(false);
    setMidiPlaybackTime(0);
    console.log('MIDI playback stopped');
  };

  // Register MIDI playback functions with parent component
  useEffect(() => {
    if (onMidiControlsRegister) {
      onMidiControlsRegister({
        playMidiTrack,
        pauseMidiPlayback,
        stopMidiPlayback,
      });
    }
  }, [onMidiControlsRegister, selectedTrack, midiNotes]);

  // Handle simple click (when not dragging)
  const handleGridClick = (event: React.MouseEvent) => {
    // This will be handled by mousedown/mouseup for consistent behavior
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
          onMouseDown={(e) => handlePianoKeyMouseDown(midiNote, e)}
          onMouseUp={handlePianoKeyMouseUp}
          onClick={() => handlePianoKeyClick(midiNote)}
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
    
    // Only render notes for selected track or all MIDI tracks if none selected
    const tracksToRender = selectedTrack ? 
      tracks.filter(t => t.id === selectedTrack) : 
      tracks.filter(t => t.type === 'midi');
    
    tracksToRender.forEach(track => {
      const trackNotes = midiNotes[track.id] || [];
      console.log(`Rendering ${trackNotes.length} notes for track "${track.name}"`);
      
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
            data-note-id={note.id}
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
            onClick={(e) => !isDragging && handleNoteClick(note.id, e as any)}
            onContextMenu={(e) => handleNoteRightClick(e, note, selectedTrack || '')}
            onMouseDown={(e) => handleNoteMouseDown(note.id, e as any)}
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

    // Render drawing note preview
    if (drawingNote && selectedTrack) {
      const track = tracks.find(t => t.id === selectedTrack);
      if (track) {
        const x = drawingNote.startTime * beatWidth;
        const y = getNoteY(drawingNote.pitch);
        const width = drawingNote.duration * beatWidth - 2;
        const height = noteHeight - 2;

        noteElements.push(
          <rect
            key="drawing-preview"
            x={x + 1}
            y={y + 1}
            width={Math.max(width, 10)}
            height={height}
            fill={track.color}
            fillOpacity={0.5}
            stroke={track.color}
            strokeWidth="2"
            strokeDasharray="5,5"
            rx="3"
            className="pointer-events-none"
          />
        );
      }
    }
    
    return noteElements;
  };

  // Render playhead
  const renderPlayhead = () => {
    // Use MIDI playback time for MIDI editor, measured in beats
    const x = midiPlaybackTime * beatWidth;
    
    return (
      <line
        x1={x}
        y1="0"
        x2={x}
        y2={totalNotes * noteHeight}
        stroke="var(--primary)"
        strokeWidth="2"
        className="pointer-events-none"
        style={{ filter: 'drop-shadow(0 0 2px var(--primary))' }}
      />
    );
  };

  return (
    <div className="flex h-full bg-[var(--background)] overflow-hidden">
      {/* Track List Sidebar */}
      <div className="w-48 bg-[var(--muted)] border-r border-[var(--border)] flex flex-col">
        <div className="h-10 bg-[var(--background)] border-b border-[var(--border)] flex items-center px-3">
          <span className="text-sm font-medium text-[var(--foreground)]">MIDI Tracks</span>
        </div>
        
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          {tracks.filter(track => track.type === 'midi' || track.type === 'ai-generated').map(track => (
            <div
              key={track.id}
              className={`p-3 border-b border-[var(--border)] cursor-pointer transition-colors ${
                selectedTrack === track.id 
                  ? 'bg-[var(--muted)] border-l-4 border-l-[var(--primary)]' 
                  : 'hover:bg-[var(--muted)]/50'
              }`}
              onClick={() => {
                setSelectedTrack(track.id);
                onTrackSelect?.(track.id);
                
                // Auto-select appropriate instrument based on track name
                const trackName = track.name.toLowerCase();
                if (trackName.includes('piano')) setCurrentInstrument('piano');
                else if (trackName.includes('bass')) setCurrentInstrument('bass');
                else if (trackName.includes('string')) setCurrentInstrument('strings');
                else if (trackName.includes('synth')) {
                  if (trackName.includes('lead')) setCurrentInstrument('synth_lead');
                  else if (trackName.includes('pad')) setCurrentInstrument('synth_pad');
                  else if (trackName.includes('bass')) setCurrentInstrument('synth_bass');
                  else setCurrentInstrument('synth_lead');
                }
                else if (trackName.includes('guitar')) setCurrentInstrument('guitar');
                else if (trackName.includes('organ')) setCurrentInstrument('organ');
                else if (trackName.includes('brass')) setCurrentInstrument('brass');
                else if (trackName.includes('drum')) setCurrentInstrument('drums');
                else if (trackName.includes('percussion')) setCurrentInstrument('percussion');
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
      <div className="flex-1 flex flex-col min-h-0">
        {/* MIDI Toolbar */}
        <div className="h-12 bg-[var(--muted)] border-b border-[var(--border)] px-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Note: MIDI playback is now handled by the main transport controls */}
            
            {/* Copy/Edit Tools */}
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2"
                title="Copy Selected Notes"
                onClick={() => {
                  if (selectedNotes.size > 0) {
                    console.log(`Copied ${selectedNotes.size} notes`);
                  }
                }}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>

            <div className="w-px h-6 bg-[var(--border)]"></div>

            {/* Quantize Controls */}
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2"
                onClick={quantizeNotes}
                title="Quantize Selected Notes (Q)"
                disabled={selectedNotes.size === 0}
              >
                <Grid3x3 className="h-4 w-4" />
              </Button>
              <select
                value={quantizeValue}
                onChange={(e) => setQuantizeValue(parseFloat(e.target.value))}
                className="h-8 px-2 text-xs bg-[var(--background)] border border-[var(--border)] rounded"
              >
                <option value={1}>1/4</option>
                <option value={0.5}>1/8</option>
                <option value={0.25}>1/16</option>
                <option value={0.125}>1/32</option>
              </select>
            </div>

            <div className="w-px h-6 bg-[var(--border)]"></div>

            {/* Velocity Controls */}
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2"
                onClick={() => setShowVelocityEditor(!showVelocityEditor)}
                title="Toggle Velocity Editor"
              >
                <BarChart3 className="h-4 w-4" />
              </Button>
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-xs"
                  onClick={() => adjustVelocity(-10)}
                  disabled={selectedNotes.size === 0}
                  title="Decrease Velocity"
                >
                  -
                </Button>
                <span className="text-xs text-[var(--muted-foreground)] min-w-[3rem] text-center">
                  {selectedNotes.size > 0 && selectedTrack ? 
                    `${midiNotes[selectedTrack]?.find(n => selectedNotes.has(n.id))?.velocity || 0}` : 
                    'Vel'
                  }
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-xs"
                  onClick={() => adjustVelocity(10)}
                  disabled={selectedNotes.size === 0}
                  title="Increase Velocity"
                >
                  +
                </Button>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Instrument Selector */}
            {selectedTrack && (
              <div className="flex items-center space-x-2">
                <span className="text-xs text-[var(--muted-foreground)]">Instrument:</span>
                <select
                  value={currentInstrument}
                  onChange={(e) => setCurrentInstrument(e.target.value)}
                  className="h-8 px-2 text-xs bg-[var(--background)] border border-[var(--border)] rounded min-w-[100px]"
                  title="Select MIDI Instrument"
                >
                  <option value="piano">Piano</option>
                  <option value="electric_piano">Electric Piano</option>
                  <option value="organ">Organ</option>
                  <option value="guitar">Guitar</option>
                  <option value="bass">Bass</option>
                  <option value="strings">Strings</option>
                  <option value="brass">Brass</option>
                  <option value="woodwind">Woodwind</option>
                  <option value="synth_lead">Synth Lead</option>
                  <option value="synth_pad">Synth Pad</option>
                  <option value="synth_bass">Synth Bass</option>
                  <option value="drums">Drums</option>
                  <option value="percussion">Percussion</option>
                  <option value="sound_fx">Sound FX</option>
                </select>
              </div>
            )}
            
            <span className="text-xs text-[var(--muted-foreground)]">
              {selectedNotes.size > 0 ? `${selectedNotes.size} selected` : 'No selection'}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              title="MIDI Settings"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

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
        <div className="flex-1 flex min-h-0">
          {/* Piano Keys - Fixed Position */}
          <div 
            ref={pianoKeysRef}
            className="w-28 bg-[var(--muted)] border-r border-[var(--border)] relative overflow-hidden"
          >
            <div
              className="relative"
              style={{ 
                height: totalNotes * noteHeight,
                transform: `translateY(-${scrollOffset}px)`
              }}
            >
              {renderPianoKeys()}
            </div>
          </div>

          {/* Note Grid - Scrollable Canvas */}
          <div 
            className="flex-1 overflow-y-auto select-none" 
            style={{ overflowX: 'hidden' }}
            ref={pianoRollRef}
            onScroll={handleScrollSync}
          >
            <div
              ref={gridRef}
              className="relative cursor-crosshair"
              style={{
                width: totalBeats * beatWidth,
                height: totalNotes * noteHeight,
              }}
              onMouseDown={handleGridMouseDown}
              onMouseMove={handleGridMouseMove}
              onMouseUp={handleGridMouseUp}
            >
              <svg
                width={totalBeats * beatWidth}
                height={totalNotes * noteHeight}
                className="absolute inset-0"
              >
                {renderGrid()}
                {renderNotes()}
                {(isMidiPlaying || midiPlaybackTime > 0) && renderPlayhead()}
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Note Context Menu */}
      <NoteContextMenu />
    </div>
  );
}