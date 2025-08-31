import { useState, useEffect, useCallback } from 'react';
import {
  AudioTrack,
  Project,
  Session,
  TransportState,
  AIAnalysis,
  MixerChannel,
} from '../types/audio';

export function useAudioWorkstation() {
  // Transport state
  const [transport, setTransport] = useState<TransportState>({
    isPlaying: false,
    isPaused: false,
    isStopped: true,
    isRecording: false,
    currentTime: 0,
    isLooping: false,
  });

  // Project data
  const [currentProject, setCurrentProject] = useState<Project>({
    id: '1',
    name: 'Film_Mix_v3.amp',
    tracks: [],
    bpm: 120,
    timeSignature: [4, 4],
    sampleRate: 48000,
    bufferSize: 256,
    masterVolume: 75,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // Sessions
  const [sessions, setSessions] = useState<Session[]>([
    {
      id: '1',
      projectId: '1',
      name: 'Film_Mix_v3.amp',
      isActive: true,
      lastAccessed: new Date(),
    },
    {
      id: '2',
      projectId: '2',
      name: 'Podcast_Master.amp',
      isActive: false,
      lastAccessed: new Date(Date.now() - 3600000),
    },
    {
      id: '3',
      projectId: '3',
      name: 'Music_Prod_v1.amp',
      isActive: false,
      lastAccessed: new Date(Date.now() - 7200000),
    },
  ]);

  // Audio tracks
  const [tracks, setTracks] = useState<AudioTrack[]>([
    {
      id: '1',
      name: 'Lead Vocal',
      type: 'audio',
      volume: 85,
      pan: 50,
      muted: false,
      soloed: false,
      color: '#88C0D0',
      clips: [
        {
          id: 'clip-1',
          name: 'Lead_Vocal_take3.wav',
          filePath: 'Lead_Vocal_take3.wav',
          startTime: 15.2,
          duration: 45.8,
          offset: 0,
          volume: 85,
          color: '#88C0D0',
          waveformData: [
            45, 60, 30, 85, 70, 40, 90, 35, 75, 55, 80, 25, 95, 60, 50, 85, 40,
            70, 90, 30, 65, 85, 45, 75, 60, 90, 35, 80, 55, 70, 85, 40, 60, 75,
            50, 90, 45, 65, 80, 35,
          ],
          fadeIn: 0.1,
          fadeOut: 0.2,
        },
        {
          id: 'clip-2',
          name: 'Lead_Vocal_chorus.wav',
          filePath: 'Lead_Vocal_chorus.wav',
          startTime: 120.5,
          duration: 32.1,
          offset: 0,
          volume: 90,
          color: '#88C0D0',
          waveformData: [
            55, 70, 40, 95, 80, 50, 85, 45, 90, 65, 75, 35, 88, 70, 60, 95, 50,
            80, 85, 40, 75, 95, 55, 85, 70, 80, 45, 90, 65, 80, 95, 50, 70, 85,
            60, 88, 55, 75, 90, 45,
          ],
        },
      ],
      effects: [
        {
          id: '1',
          name: 'AI DeNoise Pro',
          type: 'noise-reduction',
          enabled: true,
          parameters: {},
        },
        {
          id: '2',
          name: 'EQ - Vintage',
          type: 'equalizer',
          enabled: true,
          parameters: {},
        },
        {
          id: '3',
          name: 'Compressor',
          type: 'dynamics',
          enabled: true,
          parameters: {},
        },
      ],
    },
    {
      id: '2',
      name: 'Drums',
      type: 'audio',
      volume: 80,
      pan: 50,
      muted: false,
      soloed: false,
      color: '#BF616A',
      clips: [
        {
          id: 'clip-3',
          name: 'Drums_Master.wav',
          filePath: 'Drums_Master.wav',
          startTime: 0,
          duration: 180.5,
          offset: 0,
          volume: 80,
          color: '#BF616A',
          waveformData: [
            95, 30, 85, 25, 90, 35, 80, 40, 95, 20, 75, 45, 85, 30, 90, 25, 70,
            50, 95, 35, 80, 45, 75, 30, 90, 40, 85, 25, 95, 30, 70, 50, 85, 35,
            90, 25, 80, 45, 95, 30,
          ],
        },
      ],
      effects: [
        {
          id: '4',
          name: 'Gate - Precision',
          type: 'gate',
          enabled: true,
          parameters: {},
        },
        {
          id: '5',
          name: 'AI Drum Enhance',
          type: 'ai-enhancement',
          enabled: true,
          parameters: {},
        },
      ],
    },
    {
      id: '3',
      name: 'Bass DI',
      type: 'audio',
      volume: 70,
      pan: 45,
      muted: false,
      soloed: false,
      color: '#B48EAD',
      clips: [
        {
          id: 'clip-4',
          name: 'Bass_DI_01.wav',
          startTime: 0,
          duration: 32.5,
          offset: 0,
          volume: 75,
          color: '#B48EAD',
          waveformData: [
            75, 75, 70, 80, 65, 85, 70, 75, 80, 60, 90, 55, 85, 70, 75, 65, 90,
            60, 85, 75, 70, 80, 65, 90, 55, 85, 75, 70, 80, 65, 85, 70, 75, 80,
            60, 90, 55, 85, 70, 75,
          ],
        },
        {
          id: 'clip-5',
          name: 'Bass_DI_02.wav',
          startTime: 64.0,
          duration: 48.0,
          offset: 0,
          volume: 78,
          color: '#B48EAD',
          waveformData: [
            80, 70, 85, 75, 90, 65, 75, 85, 70, 90, 60, 85, 75, 80, 70, 90, 65,
            85, 75, 80, 70, 85, 75, 90, 65, 80, 75, 85, 70, 90, 65, 85, 75, 80,
            70, 90, 65, 85, 75, 80,
          ],
        },
        {
          id: 'clip-6',
          name: 'Bass_DI_03.wav',
          startTime: 128.0,
          duration: 64.0,
          offset: 0,
          volume: 72,
          color: '#B48EAD',
          waveformData: [
            70, 80, 75, 85, 70, 90, 65, 85, 75, 80, 70, 85, 75, 90, 65, 80, 75,
            85, 70, 90, 65, 85, 75, 80, 70, 85, 75, 90, 65, 80, 75, 85, 70, 90,
            65, 85, 75, 80, 70, 85,
          ],
        },
      ],
      effects: [
        {
          id: '6',
          name: 'Bass Compressor',
          type: 'compressor',
          enabled: true,
          parameters: {},
        },
        {
          id: '7',
          name: 'EQ - Low Cut',
          type: 'eq',
          enabled: true,
          parameters: {},
        },
      ],
    },
    {
      id: '4',
      name: 'Electric Guitar',
      type: 'audio',
      volume: 82,
      pan: 65,
      muted: false,
      soloed: false,
      color: '#EBCB8B',
      clips: [
        {
          id: 'clip-7',
          name: 'Guitar_Rhythm_01.wav',
          startTime: 0,
          duration: 96.0,
          offset: 0,
          volume: 80,
          color: '#EBCB8B',
          waveformData: [
            60, 85, 40, 90, 55, 85, 45, 95, 35, 80, 50, 85, 40, 90, 45, 85, 55,
            95, 35, 80, 50, 85, 45, 90, 40, 85, 55, 95, 35, 80, 50, 85, 45, 90,
            40, 85, 55, 95, 35, 80,
          ],
        },
        {
          id: 'clip-8',
          name: 'Guitar_Lead_01.wav',
          startTime: 64.0,
          duration: 32.0,
          offset: 0,
          volume: 85,
          color: '#EBCB8B',
          waveformData: [
            45, 95, 30, 85, 50, 90, 35, 95, 25, 80, 55, 90, 30, 95, 40, 85, 50,
            90, 35, 95, 25, 80, 55, 90, 30, 95, 40, 85, 50, 90, 35, 95, 25, 80,
            55, 90, 30, 95, 40, 85,
          ],
        },
        {
          id: 'clip-9',
          name: 'Guitar_Solo.wav',
          startTime: 160.0,
          duration: 24.0,
          offset: 0,
          volume: 88,
          color: '#EBCB8B',
          waveformData: [
            35, 95, 25, 90, 40, 95, 20, 85, 45, 95, 30, 90, 35, 95, 25, 85, 50,
            95, 20, 90, 40, 95, 30, 85, 45, 95, 25, 90, 35, 95, 30, 85, 50, 95,
            20, 90, 40, 95, 25, 85,
          ],
        },
      ],
      effects: [
        {
          id: '8',
          name: 'Amp Simulator',
          type: 'amp',
          enabled: true,
          parameters: {},
        },
        {
          id: '9',
          name: 'Reverb Hall',
          type: 'reverb',
          enabled: true,
          parameters: {},
        },
      ],
    },
    {
      id: '5',
      name: 'Acoustic Guitar',
      type: 'audio',
      volume: 68,
      pan: 35,
      muted: false,
      soloed: false,
      color: '#A3BE8C',
      clips: [
        {
          id: 'clip-10',
          name: 'Acoustic_Strumming.wav',
          startTime: 32.0,
          duration: 128.0,
          offset: 0,
          volume: 70,
          color: '#A3BE8C',
          waveformData: [
            50, 65, 45, 70, 40, 75, 35, 65, 50, 70, 45, 75, 40, 65, 50, 70, 45,
            75, 35, 65, 50, 70, 45, 75, 40, 65, 50, 70, 45, 75, 35, 65, 50, 70,
            45, 75, 40, 65, 50, 70,
          ],
        },
        {
          id: 'clip-11',
          name: 'Acoustic_Fingerpicking.wav',
          startTime: 180.0,
          duration: 40.0,
          offset: 0,
          volume: 65,
          color: '#A3BE8C',
          waveformData: [
            40, 55, 35, 60, 30, 65, 25, 55, 40, 60, 35, 65, 30, 55, 40, 60, 35,
            65, 25, 55, 40, 60, 35, 65, 30, 55, 40, 60, 35, 65, 25, 55, 40, 60,
            35, 65, 30, 55, 40, 60,
          ],
        },
      ],
      effects: [
        {
          id: '10',
          name: 'Acoustic Enhancer',
          type: 'enhancer',
          enabled: true,
          parameters: {},
        },
      ],
    },
    {
      id: '6',
      name: 'Piano',
      type: 'midi',
      volume: 75,
      pan: 50,
      muted: false,
      soloed: false,
      color: '#88C0D0',
      clips: [
        {
          id: 'clip-12',
          name: 'Piano_Chords.mid',
          startTime: 0,
          duration: 64.0,
          offset: 0,
          volume: 77,
          color: '#88C0D0',
          waveformData: [
            55, 70, 50, 75, 45, 80, 40, 70, 55, 75, 50, 80, 45, 70, 55, 75, 50,
            80, 40, 70, 55, 75, 50, 80, 45, 70, 55, 75, 50, 80, 40, 70, 55, 75,
            50, 80, 45, 70, 55, 75,
          ],
        },
        {
          id: 'clip-13',
          name: 'Piano_Melody.mid',
          startTime: 96.0,
          duration: 48.0,
          offset: 0,
          volume: 73,
          color: '#88C0D0',
          waveformData: [
            45, 85, 35, 80, 50, 85, 30, 75, 55, 85, 40, 80, 45, 85, 35, 75, 60,
            85, 30, 80, 50, 85, 40, 75, 55, 85, 35, 80, 45, 85, 40, 75, 60, 85,
            30, 80, 50, 85, 35, 75,
          ],
        },
      ],
      effects: [
        {
          id: '11',
          name: 'Piano Reverb',
          type: 'reverb',
          enabled: true,
          parameters: {},
        },
      ],
    },
    {
      id: '7',
      name: 'Violin',
      type: 'midi',
      volume: 65,
      pan: 30,
      muted: false,
      soloed: false,
      color: '#D08770',
      clips: [
        {
          id: 'clip-14',
          name: 'Strings_Pad.mid',
          startTime: 32.0,
          duration: 160.0,
          offset: 0,
          volume: 68,
          color: '#D08770',
          waveformData: [
            30, 60, 25, 65, 20, 70, 15, 60, 30, 65, 25, 70, 20, 60, 30, 65, 25,
            70, 15, 60, 30, 65, 25, 70, 20, 60, 30, 65, 25, 70, 15, 60, 30, 65,
            25, 70, 20, 60, 30, 65,
          ],
        },
      ],
      effects: [
        {
          id: '12',
          name: 'Strings Reverb',
          type: 'reverb',
          enabled: true,
          parameters: {},
        },
        {
          id: '13',
          name: 'Chorus',
          type: 'chorus',
          enabled: true,
          parameters: {},
        },
      ],
    },
    {
      id: '8',
      name: 'Synth Lead',
      type: 'midi',
      volume: 78,
      pan: 60,
      muted: false,
      soloed: false,
      color: '#5E81AC',
      clips: [
        {
          id: 'clip-15',
          name: 'Synth_Lead_01.mid',
          startTime: 64.0,
          duration: 32.0,
          offset: 0,
          volume: 80,
          color: '#5E81AC',
          waveformData: [
            40, 90, 30, 85, 50, 90, 25, 80, 55, 90, 35, 85, 40, 90, 30, 80, 60,
            90, 25, 85, 50, 90, 35, 80, 55, 90, 30, 85, 40, 90, 35, 80, 60, 90,
            25, 85, 50, 90, 30, 80,
          ],
        },
        {
          id: 'clip-16',
          name: 'Synth_Lead_02.mid',
          startTime: 128.0,
          duration: 48.0,
          offset: 0,
          volume: 82,
          color: '#5E81AC',
          waveformData: [
            35, 95, 25, 90, 45, 95, 20, 85, 50, 95, 30, 90, 35, 95, 25, 85, 55,
            95, 20, 90, 45, 95, 30, 85, 50, 95, 25, 90, 35, 95, 30, 85, 55, 95,
            20, 90, 45, 95, 25, 85,
          ],
        },
      ],
      effects: [
        {
          id: '14',
          name: 'Delay',
          type: 'delay',
          enabled: true,
          parameters: {},
        },
        {
          id: '15',
          name: 'Filter Sweep',
          type: 'filter',
          enabled: true,
          parameters: {},
        },
      ],
    },
    {
      id: '9',
      name: 'Synth Bass',
      type: 'midi',
      volume: 82,
      pan: 50,
      muted: false,
      soloed: false,
      color: '#BF616A',
      clips: [
        {
          id: 'clip-bass-1',
          name: 'Bass_Line.mid',
          startTime: 0,
          duration: 128.0,
          offset: 0,
          volume: 85,
          color: '#BF616A',
          waveformData: [
            60, 45, 70, 40, 65, 50, 75, 35, 60, 55, 70, 40, 65, 45, 75, 50, 60,
            40, 70, 55, 65, 35, 75, 45, 60, 50, 70, 40, 65, 55, 75, 35, 60, 45,
            70, 50, 65, 40, 75, 55,
          ],
        },
      ],
      effects: [
        {
          id: '16',
          name: 'Bass Compressor',
          type: 'compressor',
          enabled: true,
          parameters: {},
        },
        {
          id: '17',
          name: 'Sub Bass',
          type: 'eq',
          enabled: true,
          parameters: {},
        },
      ],
    },
    {
      id: '10',
      name: 'Cello',
      type: 'midi',
      volume: 70,
      pan: 70,
      muted: false,
      soloed: false,
      color: '#A3BE8C',
      clips: [
        {
          id: 'clip-strings-1',
          name: 'String_Pads.mid',
          startTime: 16.0,
          duration: 96.0,
          offset: 0,
          volume: 72,
          color: '#A3BE8C',
          waveformData: [
            35, 50, 30, 55, 25, 60, 20, 50, 35, 55, 30, 60, 25, 50, 35, 55, 30,
            60, 20, 50, 35, 55, 30, 60, 25, 50, 35, 55, 30, 60, 20, 50, 35, 55,
            30, 60, 25, 50, 35, 55,
          ],
        },
      ],
      effects: [
        {
          id: '18',
          name: 'String Reverb',
          type: 'reverb',
          enabled: true,
          parameters: {},
        },
      ],
    },
    {
      id: '11',
      name: 'Backup Vocals',
      type: 'audio',
      volume: 62,
      pan: 30,
      muted: false,
      soloed: false,
      color: '#BF616A',
      clips: [
        {
          id: 'clip-17',
          name: 'BVox_Harmony_01.wav',
          startTime: 32.0,
          duration: 16.0,
          offset: 0,
          volume: 65,
          color: '#BF616A',
          waveformData: [
            50, 75, 45, 80, 40, 85, 35, 75, 50, 80, 45, 85, 40, 75, 50, 80, 45,
            85, 35, 75, 50, 80, 45, 85, 40, 75, 50, 80, 45, 85, 35, 75, 50, 80,
            45, 85, 40, 75, 50, 80,
          ],
        },
        {
          id: 'clip-18',
          name: 'BVox_Harmony_02.wav',
          startTime: 80.0,
          duration: 24.0,
          offset: 0,
          volume: 68,
          color: '#BF616A',
          waveformData: [
            45, 80, 40, 85, 35, 90, 30, 80, 45, 85, 40, 90, 35, 80, 45, 85, 40,
            90, 30, 80, 45, 85, 40, 90, 35, 80, 45, 85, 40, 90, 30, 80, 45, 85,
            40, 90, 35, 80, 45, 85,
          ],
        },
        {
          id: 'clip-19',
          name: 'BVox_Chorus.wav',
          startTime: 128.0,
          duration: 32.0,
          offset: 0,
          volume: 70,
          color: '#BF616A',
          waveformData: [
            55, 85, 50, 90, 45, 95, 40, 85, 55, 90, 50, 95, 45, 85, 55, 90, 50,
            95, 40, 85, 55, 90, 50, 95, 45, 85, 55, 90, 50, 95, 40, 85, 55, 90,
            50, 95, 45, 85, 55, 90,
          ],
        },
      ],
      effects: [
        {
          id: '16',
          name: 'Vocal Reverb',
          type: 'reverb',
          enabled: true,
          parameters: {},
        },
        {
          id: '17',
          name: 'De-esser',
          type: 'de-esser',
          enabled: true,
          parameters: {},
        },
      ],
    },
    {
      id: '10',
      name: 'Percussion',
      type: 'audio',
      volume: 58,
      pan: 45,
      muted: false,
      soloed: false,
      color: '#EBCB8B',
      clips: [
        {
          id: 'clip-20',
          name: 'Tambourine.wav',
          startTime: 0,
          duration: 192.0,
          offset: 0,
          volume: 60,
          color: '#EBCB8B',
          waveformData: [
            25, 70, 20, 75, 15, 80, 10, 70, 25, 75, 20, 80, 15, 70, 25, 75, 20,
            80, 10, 70, 25, 75, 20, 80, 15, 70, 25, 75, 20, 80, 10, 70, 25, 75,
            20, 80, 15, 70, 25, 75,
          ],
        },
        {
          id: 'clip-21',
          name: 'Shaker.wav',
          startTime: 64.0,
          duration: 128.0,
          offset: 0,
          volume: 55,
          color: '#EBCB8B',
          waveformData: [
            15, 55, 10, 60, 5, 65, 0, 55, 15, 60, 10, 65, 5, 55, 15, 60, 10, 65,
            0, 55, 15, 60, 10, 65, 5, 55, 15, 60, 10, 65, 0, 55, 15, 60, 10, 65,
            5, 55, 15, 60,
          ],
        },
      ],
      effects: [
        {
          id: '18',
          name: 'EQ - High Boost',
          type: 'eq',
          enabled: true,
          parameters: {},
        },
      ],
    },
    {
      id: '11',
      name: 'Flute',
      type: 'midi',
      volume: 58,
      pan: 40,
      muted: false,
      soloed: false,
      color: '#81A1C1',
      clips: [
        {
          id: 'clip-22',
          name: 'Flute_Melody.mid',
          startTime: 80.0,
          duration: 64.0,
          offset: 0,
          volume: 60,
          color: '#81A1C1',
          waveformData: [
            30, 65, 25, 70, 20, 75, 15, 65, 30, 70, 25, 75, 20, 65, 30, 70, 25,
            75, 15, 65, 30, 70, 25, 75, 20, 65, 30, 70, 25, 75, 15, 65, 30, 70,
            25, 75, 20, 65, 30, 70,
          ],
        },
      ],
      effects: [
        {
          id: '19',
          name: 'Woodwind Reverb',
          type: 'reverb',
          enabled: true,
          parameters: {},
        },
        {
          id: '20',
          name: 'Breath Controller',
          type: 'dynamics',
          enabled: true,
          parameters: {},
        },
      ],
    },
    {
      id: '12',
      name: 'FX Return',
      type: 'audio',
      volume: 35,
      pan: 50,
      muted: false,
      soloed: false,
      color: '#4C566A',
      clips: [
        {
          id: 'clip-23',
          name: 'Reverb_Return.wav',
          startTime: 32.0,
          duration: 160.0,
          offset: 0,
          volume: 38,
          color: '#4C566A',
          waveformData: [
            10, 30, 5, 35, 0, 40, -5, 30, 10, 35, 5, 40, 0, 30, 10, 35, 5, 40,
            -5, 30, 10, 35, 5, 40, 0, 30, 10, 35, 5, 40, -5, 30, 10, 35, 5, 40,
            0, 30, 10, 35,
          ],
        },
      ],
      effects: [],
    },
  ]);

  // Mixer channels
  const [mixerChannels, setMixerChannels] = useState<MixerChannel[]>([
    {
      id: '1',
      trackId: '1',
      name: 'Ch 1 - Lead Vocal',
      volume: 85,
      pan: 50,
      muted: false,
      soloed: false,
      gain: 0,
      sends: { reverb: 25 },
      eq: { highFreq: 2.1, midFreq: -0.5, lowFreq: 1.8 },
      effects: [],
    },
    {
      id: '2',
      trackId: '2',
      name: 'Ch 2 - Drums',
      volume: 80,
      pan: 50,
      muted: false,
      soloed: false,
      gain: 0,
      sends: { reverb: 15 },
      eq: { highFreq: 0, midFreq: 0, lowFreq: 0 },
      effects: [],
    },
    {
      id: '3',
      trackId: '3',
      name: 'Ch 3 - Bass DI',
      volume: 70,
      pan: 45,
      muted: false,
      soloed: false,
      gain: -2,
      sends: { reverb: 5 },
      eq: { highFreq: -1.2, midFreq: 0.8, lowFreq: 2.4 },
      effects: [],
    },
    {
      id: '4',
      trackId: '4',
      name: 'Ch 4 - Electric Guitar',
      volume: 82,
      pan: 65,
      muted: false,
      soloed: false,
      gain: 1,
      sends: { reverb: 35 },
      eq: { highFreq: 1.8, midFreq: 1.2, lowFreq: -0.5 },
      effects: [],
    },
    {
      id: '5',
      trackId: '5',
      name: 'Ch 5 - Acoustic Guitar',
      volume: 68,
      pan: 35,
      muted: false,
      soloed: false,
      gain: 0,
      sends: { reverb: 20 },
      eq: { highFreq: 0.8, midFreq: 0.2, lowFreq: -1.0 },
      effects: [],
    },
    {
      id: '6',
      trackId: '6',
      name: 'Ch 6 - Piano',
      volume: 75,
      pan: 50,
      muted: false,
      soloed: false,
      gain: -1,
      sends: { reverb: 30 },
      eq: { highFreq: 0.5, midFreq: 0, lowFreq: 0.2 },
      effects: [],
    },
    {
      id: '7',
      trackId: '7',
      name: 'Ch 7 - Strings',
      volume: 65,
      pan: 50,
      muted: false,
      soloed: false,
      gain: -3,
      sends: { reverb: 45 },
      eq: { highFreq: 0.3, midFreq: -0.2, lowFreq: -2.0 },
      effects: [],
    },
    {
      id: '8',
      trackId: '8',
      name: 'Ch 8 - Synth Lead',
      volume: 78,
      pan: 60,
      muted: false,
      soloed: false,
      gain: 2,
      sends: { reverb: 25 },
      eq: { highFreq: 2.0, midFreq: 1.5, lowFreq: -1.5 },
      effects: [],
    },
    {
      id: '9',
      trackId: '9',
      name: 'Ch 9 - Backup Vocals',
      volume: 62,
      pan: 30,
      muted: false,
      soloed: false,
      gain: 0,
      sends: { reverb: 40 },
      eq: { highFreq: 1.5, midFreq: 0.3, lowFreq: -0.8 },
      effects: [],
    },
    {
      id: '10',
      trackId: '10',
      name: 'Ch 10 - Percussion',
      volume: 58,
      pan: 45,
      muted: false,
      soloed: false,
      gain: 1,
      sends: { reverb: 10 },
      eq: { highFreq: 3.0, midFreq: 0, lowFreq: -1.0 },
      effects: [],
    },
    {
      id: '11',
      trackId: '11',
      name: 'Ch 11 - Ambient',
      volume: 45,
      pan: 50,
      muted: false,
      soloed: false,
      gain: -5,
      sends: { reverb: 60 },
      eq: { highFreq: -0.5, midFreq: -1.0, lowFreq: 0.5 },
      effects: [],
    },
    {
      id: '12',
      trackId: '12',
      name: 'Ch 12 - FX Return',
      volume: 35,
      pan: 50,
      muted: false,
      soloed: false,
      gain: -8,
      sends: { reverb: 0 },
      eq: { highFreq: 0, midFreq: 0, lowFreq: 0 },
      effects: [],
    },
  ]);

  // AI Analysis
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis>({
    spectralData: Array.from({ length: 50 }, (_, i) => Math.random() * 100),
    peakFrequency: 2400,
    recommendations: [
      'The dialogue at 01:30 could benefit from noise reduction. Apply DeNoise Pro?',
      'Apply 3dB cut at 2.4kHz',
      'Increase reverb send by 15%',
      'Consider parallel compression',
    ],
    lufs: -23.1,
    peak: -3.2,
    isProcessing: false,
  });

  // Transport controls
  const play = useCallback(() => {
    setTransport((prev) => ({
      ...prev,
      isPlaying: true,
      isPaused: false,
      isStopped: false,
    }));
  }, []);

  const pause = useCallback(() => {
    setTransport((prev) => ({
      ...prev,
      isPlaying: false,
      isPaused: true,
      isStopped: false,
    }));
  }, []);

  const stop = useCallback(() => {
    setTransport((prev) => ({
      ...prev,
      isPlaying: false,
      isPaused: false,
      isStopped: true,
      currentTime: 0,
    }));
  }, []);

  const toggleRecording = useCallback(() => {
    setTransport((prev) => ({ ...prev, isRecording: !prev.isRecording }));
  }, []);

  const seekTo = useCallback((time: number) => {
    setTransport((prev) => ({ ...prev, currentTime: Math.max(0, time) }));
  }, []);

  // Track controls
  const updateTrackVolume = useCallback((trackId: string, volume: number) => {
    setTracks((prev) =>
      prev.map((track) => (track.id === trackId ? { ...track, volume } : track))
    );
  }, []);

  const toggleTrackMute = useCallback((trackId: string) => {
    setTracks((prev) =>
      prev.map((track) =>
        track.id === trackId ? { ...track, muted: !track.muted } : track
      )
    );
  }, []);

  const toggleTrackSolo = useCallback((trackId: string) => {
    setTracks((prev) =>
      prev.map((track) =>
        track.id === trackId ? { ...track, soloed: !track.soloed } : track
      )
    );
  }, []);

  // Session management
  const switchSession = useCallback((sessionId: string) => {
    setSessions((prev) =>
      prev.map((session) => ({
        ...session,
        isActive: session.id === sessionId,
      }))
    );
  }, []);

  // Update clip position function
  const updateClipPosition = useCallback(
    (
      clipId: string,
      fromTrackId: string,
      toTrackId: string,
      newStartTime: number
    ) => {
      console.log(
        `updateClipPosition called: ${clipId} from ${fromTrackId} to ${toTrackId} at ${newStartTime}s`
      );

      setTracks((prevTracks) => {
        // Find the clip in the source track
        const sourceTrack = prevTracks.find((t) => t.id === fromTrackId);
        const clipToMove = sourceTrack?.clips?.find((c) => c.id === clipId);

        if (!clipToMove) {
          console.error('Clip not found for movement');
          return prevTracks;
        }

        console.log(
          `Moving clip "${clipToMove.name}" from ${clipToMove.startTime}s to ${newStartTime}s`
        );

        // Update tracks with moved clip
        const updatedTracks = prevTracks.map((track) => {
          if (track.id === fromTrackId && fromTrackId === toTrackId) {
            // Same track movement - just update the clip's position
            const updatedClip = {
              ...clipToMove,
              startTime: newStartTime,
            };
            const updatedTrack = {
              ...track,
              clips:
                track.clips?.map((c) => (c.id === clipId ? updatedClip : c)) ||
                [],
            };
            console.log(
              `Updated clip position on same track ${track.name}, total clips:`,
              updatedTrack.clips?.length
            );
            return updatedTrack;
          } else if (track.id === fromTrackId) {
            // Remove clip from source track (different track movement)
            const updatedTrack = {
              ...track,
              clips: track.clips?.filter((c) => c.id !== clipId) || [],
            };
            console.log(
              `Removed clip from track ${track.name}, remaining clips:`,
              updatedTrack.clips?.length
            );
            return updatedTrack;
          } else if (track.id === toTrackId) {
            // Add clip to target track with new position (different track movement)
            const updatedClip = {
              ...clipToMove,
              startTime: newStartTime,
            };
            const updatedTrack = {
              ...track,
              clips: [...(track.clips || []), updatedClip],
            };
            console.log(
              `Added clip to track ${track.name}, total clips:`,
              updatedTrack.clips?.length
            );
            return updatedTrack;
          }
          return track;
        });

        console.log(
          'Updated tracks state:',
          updatedTracks.map((t) => ({ name: t.name, clips: t.clips?.length }))
        );
        return updatedTracks;
      });
    },
    []
  );

  // Update clip properties (for resizing)
  const updateClipProperties = useCallback(
    (
      clipId: string,
      trackId: string,
      newStartTime: number,
      newDuration: number
    ) => {
      console.log(
        `updateClipProperties called: ${clipId} on ${trackId} - startTime: ${newStartTime}s, duration: ${newDuration}s`
      );

      setTracks((prevTracks) => {
        return prevTracks.map((track) => {
          if (track.id === trackId) {
            const updatedTrack = {
              ...track,
              clips:
                track.clips?.map((clip) => {
                  if (clip.id === clipId) {
                    return {
                      ...clip,
                      startTime: newStartTime,
                      duration: newDuration,
                    };
                  }
                  return clip;
                }) || [],
            };
            console.log(`Updated clip properties on track ${track.name}`);
            return updatedTrack;
          }
          return track;
        });
      });
    },
    []
  );

  // AI suggestions
  const [aiSuggestions] = useState([
    'The bass track could benefit from low-end enhancement at 80Hz',
    'Consider applying vintage compression to the vocal for warmth',
    'Drum reverb tail is too long - reduce decay by 20%',
    'High frequencies above 10kHz are too bright - apply gentle roll-off',
    'The mix needs more stereo width - try M/S processing',
  ]);

  // Simulate time updates when playing
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (transport.isPlaying) {
      interval = setInterval(() => {
        setTransport((prev) => ({
          ...prev,
          currentTime: prev.currentTime + 0.1,
        }));
      }, 100);
    }
    return () => clearInterval(interval);
  }, [transport.isPlaying]);

  // Simulate waveform animation
  useEffect(() => {
    const interval = setInterval(() => {
      if (transport.isPlaying) {
        setTracks((prev) =>
          prev.map((track) => ({
            ...track,
            waveformData:
              track.waveformData?.map(() => Math.random() * 100 + 20) || [],
          }))
        );
      }
    }, 150);

    return () => clearInterval(interval);
  }, [transport.isPlaying]);

  return {
    // State
    transport,
    currentProject,
    sessions,
    tracks,
    mixerChannels,
    aiAnalysis,
    aiSuggestions,

    // Actions
    play,
    pause,
    stop,
    toggleRecording,
    seekTo,
    updateTrackVolume,
    toggleTrackMute,
    toggleTrackSolo,
    switchSession,
    setCurrentProject,
    setTracks,
    setMixerChannels,
    updateClipPosition,
    updateClipProperties,
  };
}
