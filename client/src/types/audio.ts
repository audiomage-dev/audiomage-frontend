export interface AudioClip {
  id: string;
  name: string;
  filePath?: string;
  startTime: number; // Position on timeline in seconds
  duration: number; // Duration in seconds
  offset: number; // Offset within the source file
  volume: number; // 0-100
  color: string;
  waveformData?: number[];
  fadeIn?: number;
  fadeOut?: number;
}

export interface AudioTrack {
  id: string;
  name: string;
  type: 'audio' | 'midi' | 'ai-generated' | 'video';
  volume: number; // 0-100
  pan: number; // 0-100, 50 is center
  muted: boolean;
  soloed: boolean;
  color: string;
  clips: AudioClip[];
  effects: AudioEffect[];
  // Hierarchical track properties
  isParent?: boolean;
  isExpanded?: boolean;
  parentId?: string;
}

export interface AudioEffect {
  id: string;
  name: string;
  type: string;
  enabled: boolean;
  parameters: Record<string, number>;
}

export interface Project {
  id: string;
  name: string;
  tracks: AudioTrack[];
  bpm: number;
  timeSignature: [number, number];
  sampleRate: number;
  bufferSize: number;
  masterVolume: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Session {
  id: string;
  projectId: string;
  name: string;
  isActive: boolean;
  lastAccessed: Date;
}

export interface TransportState {
  isPlaying: boolean;
  isPaused: boolean;
  isStopped: boolean;
  isRecording: boolean;
  currentTime: number; // in seconds
  loopStart?: number;
  loopEnd?: number;
  isLooping: boolean;
}

export interface AIAnalysis {
  spectralData: number[];
  peakFrequency: number;
  recommendations: string[];
  lufs: number;
  peak: number;
  isProcessing: boolean;
}

export interface MixerChannel {
  id: string;
  trackId: string;
  name: string;
  volume: number;
  pan: number;
  muted: boolean;
  soloed: boolean;
  gain: number;
  sends: Record<string, number>;
  eq: {
    highFreq: number;
    midFreq: number;
    lowFreq: number;
  };
  effects: AudioEffect[];
}
