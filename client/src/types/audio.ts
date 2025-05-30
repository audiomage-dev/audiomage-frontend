export interface AudioTrack {
  id: string;
  name: string;
  type: 'audio' | 'midi' | 'ai-generated';
  filePath?: string;
  position: number;
  volume: number; // 0-100
  pan: number; // 0-100, 50 is center
  muted: boolean;
  soloed: boolean;
  color: string;
  waveformData?: number[];
  effects: AudioEffect[];
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
