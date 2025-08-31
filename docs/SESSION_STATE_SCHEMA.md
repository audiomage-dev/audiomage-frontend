# AudioMage Session State Schema

## Complete Session State Object

The session state represents the complete working state of an AudioMage session, including all UI positions, audio settings, project data, and user interactions.

```typescript
interface SessionState {
  // Core Session Identity
  session: {
    id: string;                    // Unique session identifier
    name: string;                  // Session filename (e.g., "Film_Mix_v3.amp")
    projectId: string;             // Associated project ID
    isActive: boolean;             // Currently active session
    createdAt: Date;               // Session creation timestamp
    lastAccessed: Date;            // Last access timestamp
    lastSaved: Date;               // Last save timestamp
    isDirty: boolean;              // Unsaved changes flag
    version: string;               // Session format version
  };

  // Project Configuration
  project: {
    id: string;                    // Project identifier
    name: string;                  // Project display name
    description?: string;          // Project description
    bpm: number;                   // Beats per minute (60-300)
    timeSignature: [number, number]; // [numerator, denominator]
    sampleRate: number;            // 44100 | 48000 | 96000 | 192000
    bufferSize: number;            // 128 | 256 | 512 | 1024 | 2048
    bitDepth: number;              // 16 | 24 | 32
    masterVolume: number;          // Master output level (0-100)
    masterPan: number;             // Master pan (-100 to 100)
    recordingPath: string;         // Default recording directory
    backupInterval: number;        // Auto-backup interval in minutes
    maxUndoSteps: number;          // Undo history depth
  };

  // Transport State
  transport: {
    isPlaying: boolean;            // Playback active
    isPaused: boolean;             // Playback paused
    isStopped: boolean;            // Playback stopped
    isRecording: boolean;          // Recording active
    currentTime: number;           // Current position in seconds
    startTime: number;             // Session start time
    endTime: number;               // Session end time
    loopStart?: number;            // Loop start position
    loopEnd?: number;              // Loop end position
    isLooping: boolean;            // Loop mode enabled
    isMetronomeEnabled: boolean;   // Metronome active
    metronomeVolume: number;       // Metronome level (0-100)
    preRoll: number;               // Pre-roll time in bars
    postRoll: number;              // Post-roll time in bars
    recordMode: 'replace' | 'overdub' | 'punch'; // Recording mode
    punchIn?: number;              // Punch-in position
    punchOut?: number;             // Punch-out position
    followPlayhead: boolean;       // Timeline follows playback
    scrubbing: boolean;            // Scrub mode active
  };

  // Audio Tracks
  tracks: AudioTrack[];

  // Track State Detail
  interface AudioTrack {
    id: string;                    // Track identifier
    name: string;                  // Track display name
    type: 'audio' | 'midi' | 'instrument' | 'aux' | 'ai-generated';
    color: string;                 // Track color (hex)
    icon?: string;                 // Track icon identifier

    // Audio Properties
    filePath?: string;             // Audio file location
    startOffset: number;           // File start offset in seconds
    duration?: number;             // Track duration
    sampleRate?: number;           // Source sample rate
    bitDepth?: number;             // Source bit depth
    channels: number;              // Mono=1, Stereo=2, etc.

    // Timeline Position
    position: number;              // Start position in seconds
    length: number;                // Track length in seconds
    locked: boolean;               // Position locked
    timeStretch: number;           // Time stretch ratio (0.5-2.0)
    pitchShift: number;            // Pitch shift in semitones

    // Mix Parameters
    volume: number;                // Track volume (0-100)
    pan: number;                   // Pan position (-100 to 100)
    gain: number;                  // Input gain (-60 to 60 dB)
    phase: boolean;                // Phase invert
    muted: boolean;                // Track mute state
    soloed: boolean;               // Track solo state
    armed: boolean;                // Record armed
    monitor: 'off' | 'input' | 'tape'; // Monitor mode

    // Automation
    automation: {
      volume: AutomationLane;
      pan: AutomationLane;
      gain: AutomationLane;
      [paramName: string]: AutomationLane;
    };

    // Effects Chain
    effects: AudioEffect[];

    // Visual State
    waveformData?: number[];       // Cached waveform points
    peakData?: number[];           // Peak meter data
    collapsed: boolean;            // Track height collapsed
    height: number;                // Track height in pixels
    lanes: TrackLane[];            // Sub-lanes (takes, comps, etc.)

    // MIDI Properties (when type === 'midi')
    midiChannel?: number;          // MIDI channel (1-16)
    midiPort?: string;             // MIDI port identifier
    notes?: MidiNote[];            // MIDI note data
    controllers?: MidiController[]; // MIDI CC data

    // Instrument Properties (when type === 'instrument')
    instrument?: {
      pluginId: string;
      preset?: string;
      parameters: Record<string, number>;
    };
  }

  // Automation Lane Structure
  interface AutomationLane {
    enabled: boolean;              // Automation active
    mode: 'read' | 'write' | 'touch' | 'latch';
    points: AutomationPoint[];     // Automation data points
    curve: 'linear' | 'smooth' | 'stepped';
  }

  interface AutomationPoint {
    time: number;                  // Time position in seconds
    value: number;                 // Parameter value
    curve?: 'linear' | 'exponential' | 'logarithmic';
  }

  // Audio Effects
  interface AudioEffect {
    id: string;                    // Effect instance ID
    pluginId: string;              // Effect type identifier
    name: string;                  // Display name
    enabled: boolean;              // Effect active
    bypassed: boolean;             // Effect bypassed
    wet: number;                   // Wet/dry mix (0-100)
    parameters: Record<string, EffectParameter>;
    preset?: string;               // Current preset name
    position: number;              // Position in effects chain
  }

  interface EffectParameter {
    value: number;                 // Current value
    min: number;                   // Minimum value
    max: number;                   // Maximum value
    default: number;               // Default value
    unit?: string;                 // Units (Hz, dB, %, etc.)
    automation?: AutomationLane;   // Parameter automation
  }

  // Mixer State
  mixer: {
    channels: MixerChannel[];
    master: MasterChannel;
    buses: AudioBus[];
    sends: SendEffect[];
    routing: RoutingMatrix;
    snapshots: MixerSnapshot[];
    currentSnapshot?: string;
  };

  interface MixerChannel {
    id: string;                    // Channel identifier
    trackId: string;               // Associated track
    name: string;                  // Channel name

    // Channel Strip
    input: {
      gain: number;                // Input gain (-60 to 60 dB)
      phase: boolean;              // Phase invert
      highpass: number;            // HPF frequency (20-2000 Hz)
      lowpass: number;             // LPF frequency (2k-20k Hz)
    };

    // EQ Section
    eq: {
      enabled: boolean;
      highShelf: EQBand;
      highMid: EQBand;
      lowMid: EQBand;
      lowShelf: EQBand;
    };

    // Dynamics
    compressor: {
      enabled: boolean;
      threshold: number;           // dB
      ratio: number;               // 1:1 to 20:1
      attack: number;              // ms
      release: number;             // ms
      knee: number;                // dB
      gain: number;                // Makeup gain dB
    };

    gate: {
      enabled: boolean;
      threshold: number;           // dB
      ratio: number;
      attack: number;              // ms
      hold: number;                // ms
      release: number;             // ms
    };

    // Mix Controls
    volume: number;                // Channel fader (0-100)
    pan: number;                   // Pan position (-100 to 100)
    muted: boolean;                // Channel mute
    soloed: boolean;               // Channel solo

    // Send Levels
    sends: Record<string, number>; // Send ID -> level

    // Metering
    meters: {
      peak: number;                // Peak level dB
      rms: number;                 // RMS level dB
      lufs: number;                // LUFS measurement
      gainReduction: number;       // Compressor GR dB
    };
  }

  interface EQBand {
    frequency: number;             // Hz
    gain: number;                  // dB
    q: number;                     // Quality factor
    type: 'shelf' | 'bell' | 'highpass' | 'lowpass';
    enabled: boolean;
  }

  interface MasterChannel {
    volume: number;                // Master fader
    pan: number;                   // Master pan
    muted: boolean;                // Master mute

    // Master EQ
    eq: {
      enabled: boolean;
      bands: EQBand[];
    };

    // Master Compressor
    compressor: {
      enabled: boolean;
      threshold: number;
      ratio: number;
      attack: number;
      release: number;
      knee: number;
      gain: number;
    };

    // Master Limiter
    limiter: {
      enabled: boolean;
      ceiling: number;             // dB
      release: number;             // ms
    };

    // Master Effects
    effects: AudioEffect[];

    // Metering
    meters: {
      peak: number;
      rms: number;
      lufs: number;
      gainReduction: number;
    };
  }

  // Audio Buses
  interface AudioBus {
    id: string;                    // Bus identifier
    name: string;                  // Bus name
    type: 'aux' | 'group' | 'vca';
    channels: string[];            // Connected channel IDs
    volume: number;                // Bus level
    pan: number;                   // Bus pan
    muted: boolean;                // Bus mute
    effects: AudioEffect[];        // Bus effects
  }

  // Timeline & UI State
  timeline: {
    zoom: number;                  // Horizontal zoom level (0.1-100)
    verticalZoom: number;          // Track height multiplier
    scrollX: number;               // Horizontal scroll position
    scrollY: number;               // Vertical scroll position
    viewStart: number;             // Visible start time
    viewEnd: number;               // Visible end time
    snapToGrid: boolean;           // Grid snap enabled
    gridResolution: string;        // '1/4', '1/8', '1/16', etc.
    showWaveforms: boolean;        // Waveform display
    showAutomation: boolean;       // Automation lanes visible
    trackHeaderWidth: number;      // Track name column width
    selection: TimelineSelection;  // Selected region
    clipboard: ClipboardData[];    // Copy/paste buffer
    markers: Marker[];             // Timeline markers
    regions: Region[];             // Named regions
  };

  interface TimelineSelection {
    active: boolean;               // Selection exists
    startTime: number;             // Selection start
    endTime: number;               // Selection end
    tracks: string[];              // Selected track IDs
  }

  interface Marker {
    id: string;                    // Marker ID
    time: number;                  // Position in seconds
    name: string;                  // Marker name
    color: string;                 // Marker color
    type: 'marker' | 'tempo' | 'signature';
  }

  interface Region {
    id: string;                    // Region ID
    name: string;                  // Region name
    startTime: number;             // Start position
    endTime: number;               // End position
    color: string;                 // Region color
    locked: boolean;               // Position locked
  }

  // User Interface State
  ui: {
    layout: {
      leftSidebarOpen: boolean;
      leftSidebarWidth: number;
      rightSidebarOpen: boolean;   // AI Chat sidebar
      rightSidebarWidth: number;
      bottomPanelOpen: boolean;    // Track Inspector
      bottomPanelHeight: number;
      timelineHeight: number;
      mixerVisible: boolean;
      mixerHeight: number;
    };

    panels: {
      projectBrowser: boolean;
      aiSuggestions: boolean;
      audioChangemaps: boolean;
      projectVersions: boolean;
      aiSoundLibrary: boolean;
      trackInspector: boolean;
      chatAssistant: boolean;
    };

    theme: 'nord-light' | 'nord-dark';

    zoom: {
      timeline: number;
      mixer: number;
      waveform: number;
    };

    view: {
      trackMode: 'normal' | 'compact' | 'minimal';
      meterMode: 'peak' | 'rms' | 'lufs';
      timeFormat: 'bars:beats' | 'min:sec' | 'samples' | 'frames';
      followPlayhead: boolean;
      autoScroll: boolean;
    };

    selection: {
      activeTrack?: string;
      selectedTracks: string[];
      selectedRegion?: TimelineSelection;
      activeTool: 'select' | 'cut' | 'zoom' | 'hand' | 'pencil';
    };

    commandPalette: {
      visible: boolean;
      lastCommands: string[];      // Recent command history
    };
  };

  // AI Assistant State
  ai: {
    chatHistory: {
      [sessionId: string]: ChatMessage[];
    };

    suggestions: AISuggestion[];

    analysis: {
      lastRun: Date;
      spectralData: number[];
      peakFrequency: number;
      recommendations: string[];
      lufs: number;
      peak: number;
      isProcessing: boolean;
    };

    soundLibrary: {
      searchQuery: string;
      selectedCategory?: string;
      favorites: string[];           // Sound IDs
      recentlyUsed: string[];        // Sound IDs
      collections: SoundCollection[];
    };
  };

  interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    sessionId: string;
  }

  interface AISuggestion {
    id: string;
    category: 'mixing' | 'effects' | 'arrangement' | 'mastering';
    title: string;
    description: string;
    confidence: number;            // 0-1
    priority: 'low' | 'medium' | 'high';
    accepted?: boolean;
    ignored?: boolean;
    timestamp: Date;
  }

  // Version Control State
  versionControl: {
    currentVersion: string;        // Current version hash
    head: string;                  // HEAD version hash
    branch: string;                // Current branch
    uncommittedChanges: boolean;   // Dirty working tree
    history: ProjectVersion[];     // Version history
    branches: Branch[];            // Available branches
    tags: Tag[];                   // Version tags
  };

  interface ProjectVersion {
    id: string;
    hash: string;
    message: string;
    author: string;
    timestamp: Date;
    type: 'commit' | 'merge' | 'tag';
    branch: string;
    parents: string[];
    isCurrent: boolean;
    isHead: boolean;
    changes: {
      added: string[];
      modified: string[];
      deleted: string[];
    };
  }

  // Collaboration State
  collaboration: {
    enabled: boolean;
    participants: SessionParticipant[];
    locks: ResourceLock[];
    comments: Comment[];
    annotations: Annotation[];
    presence: UserPresence[];
  };

  interface SessionParticipant {
    userId: string;
    name: string;
    avatar?: string;
    role: 'owner' | 'collaborator' | 'viewer';
    isOnline: boolean;
    lastSeen: Date;
    cursor?: {
      trackId: string;
      time: number;
    };
  }

  interface ResourceLock {
    resourceId: string;
    resourceType: 'track' | 'effect' | 'mixer_channel';
    userId: string;
    timestamp: Date;
    expiresAt: Date;
  }

  // Performance Metrics
  performance: {
    cpuUsage: number;              // CPU percentage
    memoryUsage: number;           // Memory MB
    diskUsage: number;             // Disk MB
    audioBufferUnderruns: number;  // Buffer underrun count
    latency: number;               // Audio latency ms
    sampleRate: number;            // Active sample rate
    bufferSize: number;            // Active buffer size
    activeVoices: number;          // Current voice count
  };

  // Audio Analysis Cache
  analysis: {
    tracks: {
      [trackId: string]: {
        waveform: number[];
        spectrum: number[];
        peaks: number[];
        rms: number[];
        lastUpdated: Date;
      };
    };

    project: {
      spectralBalance: number[];
      dynamicRange: number;
      stereoWidth: number;
      phaseCorrelation: number;
      lufsIntegrated: number;
      lufsShortTerm: number;
      peakLevel: number;
      lastAnalyzed: Date;
    };
  };

  // Undo/Redo State
  history: {
    undoStack: HistoryEntry[];
    redoStack: HistoryEntry[];
    maxEntries: number;
    grouping: boolean;             // Group related actions
    savePoint: number;             // Last save position
  };

  interface HistoryEntry {
    id: string;
    description: string;
    timestamp: Date;
    type: 'track' | 'effect' | 'mixer' | 'automation' | 'transport';
    changes: StateChange[];
  }

  interface StateChange {
    path: string;                  // Object path (e.g., 'tracks.123.volume')
    oldValue: any;                 // Previous value
    newValue: any;                 // New value
  }

  // System State
  system: {
    audioDevices: AudioDevice[];
    midiDevices: MidiDevice[];
    pluginScanComplete: boolean;
    availablePlugins: Plugin[];
    systemLoad: SystemLoad;
    diskSpace: DiskSpace;
  };

  interface AudioDevice {
    id: string;
    name: string;
    type: 'input' | 'output' | 'duplex';
    sampleRates: number[];
    bufferSizes: number[];
    channels: number;
    isDefault: boolean;
    isActive: boolean;
  }

  interface SystemLoad {
    cpu: number;                   // CPU percentage
    memory: number;                // Memory percentage
    disk: number;                  // Disk I/O percentage
    network: number;               // Network usage
  }
}
```

## Session State Management

### State Persistence

- Session state is automatically saved every 30 seconds
- Manual save triggers complete state serialization
- State is stored in JSON format with compression
- Binary audio data is stored separately with references

### State Validation

- All numeric values have defined ranges
- Required fields are validated on load
- Backward compatibility maintained across versions
- Migration scripts handle schema updates

### State Synchronization

- Real-time updates via WebSocket events
- Optimistic updates for immediate UI feedback
- Conflict resolution for concurrent modifications
- State snapshots for rollback capability

## Usage Patterns

### Creating New Session

```typescript
const newSession: SessionState = {
  session: {
    id: generateId(),
    name: 'Untitled_Session.amp',
    projectId: projectId,
    isActive: true,
    createdAt: new Date(),
    lastAccessed: new Date(),
    lastSaved: new Date(),
    isDirty: false,
    version: '1.0.0',
  },
  // ... default values for all other properties
};
```

### Session State Updates

```typescript
// Update transport state
updateSessionState({
  path: 'transport.isPlaying',
  value: true,
  timestamp: Date.now(),
});

// Update track volume
updateSessionState({
  path: `tracks.${trackId}.volume`,
  value: 75,
  timestamp: Date.now(),
});
```

### State Queries

```typescript
// Get current playback position
const position = sessionState.transport.currentTime;

// Check if track is muted
const isMuted = sessionState.tracks.find((t) => t.id === trackId)?.muted;

// Get mixer channel state
const channel = sessionState.mixer.channels.find((c) => c.trackId === trackId);
```

This comprehensive session state object captures the complete working state of an AudioMage session, enabling full restoration, collaboration, version control, and real-time synchronization across all system components.
