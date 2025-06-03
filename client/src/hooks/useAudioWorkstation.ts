import { useState, useCallback } from 'react';
import { AudioTrack, AudioClip, TransportState, MixerChannel, AudioEffect } from '../types/audio';

export function useAudioWorkstation() {
  // Transport state
  const [transport, setTransport] = useState<TransportState>({
    isPlaying: false,
    isRecording: false,
    currentTime: 0,
    bpm: 120,
    timeSignature: [4, 4],
    isLooping: false,
    loopStart: 0,
    loopEnd: 64,
  });

  // Current project
  const [currentProject, setCurrentProject] = useState('Untitled Project');

  // Session tabs
  const [sessions, setSessions] = useState([
    { id: '1', name: 'Main Session', isActive: true },
    { id: '2', name: 'Alternate Mix', isActive: false },
    { id: '3', name: 'Rough Draft', isActive: false },
  ]);

  // Audio tracks - 6 categories for video post-production
  const [tracks, setTracks] = useState<AudioTrack[]>([
    {
      id: 'video-input',
      name: 'Video Input',
      type: 'audio',
      volume: 75,
      pan: 50,
      muted: false,
      soloed: false,
      color: '#FF6B6B',
      clips: [
        {
          id: 'clip-video-1',
          name: 'Main_Video.mp4',
          startTime: 0,
          duration: 180,
          offset: 0,
          volume: 75,
          color: '#FF6B6B',
          waveformData: [45, 60, 55, 70, 50, 65, 48, 72, 52, 68, 47, 75, 53, 67, 49, 73, 51, 69, 46, 74, 54, 66, 50, 71, 48, 67, 52, 73, 49, 68, 51, 74, 47, 69, 53, 72, 50, 70]
        }
      ],
      effects: [
        { id: '1', name: 'Noise Gate', type: 'gate', enabled: true, parameters: {} },
        { id: '2', name: 'EQ - Video', type: 'equalizer', enabled: true, parameters: {} }
      ],
    },
    {
      id: 'dialogue',
      name: 'Dialogue',
      type: 'audio',
      volume: 85,
      pan: 50,
      muted: false,
      soloed: false,
      color: '#4ECDC4',
      clips: [
        {
          id: 'clip-dialogue-1',
          name: 'Interview_01.wav',
          startTime: 5,
          duration: 45,
          offset: 0,
          volume: 85,
          color: '#4ECDC4',
          waveformData: [65, 80, 70, 85, 60, 90, 68, 82, 72, 88, 64, 86, 69, 83, 67, 89, 71, 84, 63, 87, 73, 81, 66, 90, 70, 85, 68, 83, 72, 87, 65, 88, 69, 84, 71, 86, 67, 82]
        },
        {
          id: 'clip-dialogue-2',
          name: 'Interview_02.wav',
          startTime: 60,
          duration: 38,
          offset: 0,
          volume: 82,
          color: '#4ECDC4',
          waveformData: [62, 78, 67, 83, 58, 88, 65, 80, 69, 86, 61, 84, 66, 81, 64, 87, 68, 82, 60, 85, 70, 79, 63, 88, 67, 83, 65, 81, 69, 85, 62, 86, 66, 82, 68, 84, 64, 80]
        }
      ],
      effects: [
        { id: '3', name: 'De-esser', type: 'de-esser', enabled: true, parameters: {} },
        { id: '4', name: 'Compressor', type: 'compressor', enabled: true, parameters: {} }
      ],
    },
    {
      id: 'music',
      name: 'Music',
      type: 'audio',
      volume: 65,
      pan: 50,
      muted: false,
      soloed: false,
      color: '#45B7D1',
      clips: [
        {
          id: 'clip-music-1',
          name: 'Background_Music.wav',
          startTime: 0,
          duration: 180,
          offset: 0,
          volume: 65,
          color: '#45B7D1',
          waveformData: [35, 50, 40, 55, 30, 60, 38, 52, 42, 58, 34, 56, 39, 53, 37, 59, 41, 54, 33, 57, 43, 51, 36, 60, 40, 55, 38, 53, 42, 57, 35, 58, 39, 54, 41, 56, 37, 52]
        }
      ],
      effects: [
        { id: '5', name: 'EQ - Music', type: 'equalizer', enabled: true, parameters: {} },
        { id: '6', name: 'Reverb - Hall', type: 'reverb', enabled: true, parameters: {} }
      ],
    },
    {
      id: 'foley',
      name: 'Foley',
      type: 'audio',
      volume: 70,
      pan: 50,
      muted: false,
      soloed: false,
      color: '#96CEB4',
      clips: [
        {
          id: 'clip-foley-1',
          name: 'Footsteps.wav',
          startTime: 15,
          duration: 8,
          offset: 0,
          volume: 70,
          color: '#96CEB4',
          waveformData: [25, 40, 30, 45, 20, 50, 28, 42, 32, 48, 24, 46, 29, 43, 27, 49, 31, 44, 23, 47, 33, 41, 26, 50, 30, 45, 28, 43, 32, 47, 25, 48, 29, 44, 31, 46, 27, 42]
        },
        {
          id: 'clip-foley-2',
          name: 'Door_Close.wav',
          startTime: 75,
          duration: 2,
          offset: 0,
          volume: 68,
          color: '#96CEB4',
          waveformData: [55, 70, 60, 75, 50, 80, 58, 72, 62, 78, 54, 76, 59, 73, 57, 79, 61, 74, 53, 77, 63, 71, 56, 80, 60, 75, 58, 73, 62, 77, 55, 78, 59, 74, 61, 76, 57, 72]
        }
      ],
      effects: [
        { id: '7', name: 'EQ - Foley', type: 'equalizer', enabled: true, parameters: {} },
        { id: '8', name: 'Reverb - Room', type: 'reverb', enabled: true, parameters: {} }
      ],
    },
    {
      id: 'sound-design',
      name: 'Sound Design',
      type: 'audio',
      volume: 60,
      pan: 50,
      muted: false,
      soloed: false,
      color: '#FECA57',
      clips: [
        {
          id: 'clip-sfx-1',
          name: 'Transition_Whoosh.wav',
          startTime: 30,
          duration: 3,
          offset: 0,
          volume: 60,
          color: '#FECA57',
          waveformData: [40, 75, 50, 80, 35, 85, 45, 77, 55, 82, 38, 78, 48, 79, 42, 83, 52, 76, 37, 81, 58, 74, 43, 85, 49, 80, 44, 78, 54, 82, 40, 84, 47, 77, 53, 79, 41, 75]
        }
      ],
      effects: [
        { id: '9', name: 'Distortion', type: 'distortion', enabled: true, parameters: {} },
        { id: '10', name: 'Delay', type: 'delay', enabled: true, parameters: {} }
      ],
    },
    {
      id: 'ambiance',
      name: 'Ambiance',
      type: 'audio',
      volume: 45,
      pan: 50,
      muted: false,
      soloed: false,
      color: '#FF9FF3',
      clips: [
        {
          id: 'clip-ambient-1',
          name: 'City_Ambience.wav',
          startTime: 0,
          duration: 180,
          offset: 0,
          volume: 45,
          color: '#FF9FF3',
          waveformData: [15, 25, 20, 30, 10, 35, 18, 27, 22, 32, 14, 28, 19, 29, 17, 33, 21, 26, 13, 31, 23, 24, 16, 35, 20, 30, 18, 28, 22, 32, 15, 34, 19, 27, 21, 29, 17, 25]
        }
      ],
      effects: [
        { id: '11', name: 'EQ - Ambience', type: 'equalizer', enabled: true, parameters: {} },
        { id: '12', name: 'Reverb - Natural', type: 'reverb', enabled: true, parameters: {} }
      ],
    }
  ]);

  // Mixer channels
  const [mixerChannels, setMixerChannels] = useState<MixerChannel[]>([
    {
      id: '1',
      trackId: 'video-input',
      name: 'Ch 1 - Video',
      volume: 75,
      pan: 50,
      muted: false,
      soloed: false,
      gain: 0,
      sends: { reverb: 15 },
      eq: { highFreq: 0, midFreq: 0, lowFreq: 0 },
      effects: [],
    },
    {
      id: '2',
      trackId: 'dialogue',
      name: 'Ch 2 - Dialogue',
      volume: 85,
      pan: 50,
      muted: false,
      soloed: false,
      gain: 0,
      sends: { reverb: 20 },
      eq: { highFreq: 2.1, midFreq: -0.5, lowFreq: 1.8 },
      effects: [],
    },
    {
      id: '3',
      trackId: 'music',
      name: 'Ch 3 - Music',
      volume: 65,
      pan: 50,
      muted: false,
      soloed: false,
      gain: 0,
      sends: { reverb: 35 },
      eq: { highFreq: 1.2, midFreq: 0.8, lowFreq: -1.5 },
      effects: [],
    },
    {
      id: '4',
      trackId: 'foley',
      name: 'Ch 4 - Foley',
      volume: 70,
      pan: 50,
      muted: false,
      soloed: false,
      gain: 0,
      sends: { reverb: 25 },
      eq: { highFreq: 0.8, midFreq: 1.2, lowFreq: 0.5 },
      effects: [],
    },
    {
      id: '5',
      trackId: 'sound-design',
      name: 'Ch 5 - SFX',
      volume: 60,
      pan: 50,
      muted: false,
      soloed: false,
      gain: 0,
      sends: { reverb: 40 },
      eq: { highFreq: 3.0, midFreq: 1.5, lowFreq: -2.0 },
      effects: [],
    },
    {
      id: '6',
      trackId: 'ambiance',
      name: 'Ch 6 - Ambiance',
      volume: 45,
      pan: 50,
      muted: false,
      soloed: false,
      gain: 0,
      sends: { reverb: 50 },
      eq: { highFreq: -1.5, midFreq: 0.2, lowFreq: 1.0 },
      effects: [],
    },
  ]);

  // AI Analysis state
  const [aiAnalysis, setAiAnalysis] = useState({
    isAnalyzing: false,
    results: {
      peakLevels: { left: -12.5, right: -11.8 },
      dynamicRange: 18.2,
      frequencyBalance: { low: 0.85, mid: 0.92, high: 0.78 },
      suggestedBpm: 120,
      keyDetection: 'C Major',
      audioQuality: 'Excellent',
    }
  });

  // AI Suggestions
  const [aiSuggestions, setAiSuggestions] = useState([
    'Consider adding light compression to dialogue tracks',
    'Music levels could be reduced by 2-3dB for better balance',
    'Add subtle reverb to foley sounds for spatial depth'
  ]);

  // Transport controls
  const play = useCallback(() => {
    setTransport(prev => ({ ...prev, isPlaying: true }));
  }, []);

  const pause = useCallback(() => {
    setTransport(prev => ({ ...prev, isPlaying: false }));
  }, []);

  const stop = useCallback(() => {
    setTransport(prev => ({ ...prev, isPlaying: false, currentTime: 0 }));
  }, []);

  const toggleRecording = useCallback(() => {
    setTransport(prev => ({ 
      ...prev, 
      isRecording: !prev.isRecording,
      isPlaying: !prev.isRecording ? true : prev.isPlaying 
    }));
  }, []);

  const seekTo = useCallback((time: number) => {
    setTransport(prev => ({ ...prev, currentTime: time }));
  }, []);

  // Track controls
  const updateTrackVolume = useCallback((trackId: string, volume: number) => {
    setTracks(prev => prev.map(track => 
      track.id === trackId ? { ...track, volume } : track
    ));
  }, []);

  const toggleTrackMute = useCallback((trackId: string) => {
    setTracks(prev => prev.map(track => 
      track.id === trackId ? { ...track, muted: !track.muted } : track
    ));
  }, []);

  const toggleTrackSolo = useCallback((trackId: string) => {
    setTracks(prev => prev.map(track => 
      track.id === trackId ? { ...track, soloed: !track.soloed } : track
    ));
  }, []);

  // Session management
  const switchSession = useCallback((sessionId: string) => {
    setSessions(prev => prev.map(session => ({
      ...session,
      isActive: session.id === sessionId
    })));
  }, []);

  // Clip management
  const updateClipPosition = useCallback((clipId: string, trackId: string, newStartTime: number, newDuration?: number) => {
    setTracks(prevTracks => {
      return prevTracks.map(track => {
        if (track.id === trackId) {
          return {
            ...track,
            clips: track.clips.map(clip => {
              if (clip.id === clipId) {
                return {
                  ...clip,
                  startTime: newStartTime,
                  ...(newDuration !== undefined && { duration: newDuration })
                };
              }
              return clip;
            })
          };
        }
        return track;
      });
    });
  }, []);

  const updateClipProperties = useCallback((clipId: string, trackId: string, properties: Partial<AudioClip>) => {
    setTracks(prevTracks => 
      prevTracks.map(track => 
        track.id === trackId 
          ? {
              ...track,
              clips: track.clips.map(clip => 
                clip.id === clipId ? { ...clip, ...properties } : clip
              )
            }
          : track
      )
    );
  }, []);

  // Simulate playback time updates
  const updatePlaybackTime = useCallback(() => {
    if (transport.isPlaying) {
      setTransport(prev => ({
        ...prev,
        currentTime: prev.currentTime + 0.1
      }));
    }
  }, [transport.isPlaying]);

  // Auto-stop at end
  const handleAutoStop = useCallback(() => {
    const maxDuration = Math.max(...tracks.flatMap(track => 
      track.clips.map(clip => clip.startTime + clip.duration)
    ));
    
    if (transport.currentTime >= maxDuration) {
      setTracks(prev => prev.map(track => ({ ...track, soloed: false })));
      stop();
    }
  }, [tracks, transport.currentTime, stop]);

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
    updateClipPosition,
    updateClipProperties,
  };
}