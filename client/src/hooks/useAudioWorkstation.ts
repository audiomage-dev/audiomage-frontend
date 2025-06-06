import { useState, useCallback } from 'react';
import { AudioTrack, AudioClip, TransportState, MixerChannel, AudioEffect } from '../types/audio';

export function useAudioWorkstation() {
  // Session management
  const [sessions, setSessions] = useState([
    { id: '1', name: 'Video Project', isActive: true },
    { id: '2', name: 'Podcast Mix', isActive: false },
    { id: '3', name: 'Music Track', isActive: false },
  ]);

  // Transport state
  const [transport, setTransport] = useState<TransportState>({
    isPlaying: false,
    isPaused: false,
    isStopped: true,
    isRecording: false,
    currentTime: 0,
    isLooping: false,
    loopStart: 0,
    loopEnd: 64,
  });

  // Current project
  const [currentProject, setCurrentProject] = useState('Untitled Project');

  // Get different clips for each session with standardized track structure
  const getTracksForSession = useCallback((sessionId: string): AudioTrack[] => {
    const baseTrackStructure = [
      { id: 'video', name: 'Video', color: '#E5E5E5' },
      { id: 'dialogue', name: 'Dialogue', color: '#3B82F6' },
      { id: 'music', name: 'Music', color: '#10B981' },
      { id: 'foley', name: 'Foley', color: '#F59E0B' },
      { id: 'sound-design', name: 'Sound Design', color: '#8B5CF6' },
      { id: 'ambiance', name: 'Ambiance', color: '#EC4899' }
    ];

    const getClipsForTrack = (trackId: string, sessionId: string): AudioClip[] => {
      // For new projects (session ID > 3), return empty clips
      if (parseInt(sessionId) > 3) {
        return [];
      }

      switch (sessionId) {
        case '1': // Video Post-Production Project
          switch (trackId) {
            case 'video':
              return [{
                id: 'clip-video-1',
                name: 'Main_Video.mp4',
                startTime: 0,
                duration: 180,
                offset: 0,
                volume: 75,
                color: '#E5E5E5',
                waveformData: [45, 60, 55, 70, 50, 65, 48, 72, 52, 68, 47, 75, 53, 67, 49, 73, 51, 69, 46, 74, 54, 66, 50, 71, 48, 67, 52, 73, 49, 68, 51, 74, 47, 69, 53, 72, 50, 70, 44, 68, 56, 74, 43, 71, 57, 69, 45, 76, 54, 65, 49, 72, 52, 67, 48, 75, 51, 68, 47, 73, 55, 66, 50, 70, 46, 74, 53, 67, 49, 71, 52, 69, 48, 75, 54, 65, 47, 72, 56, 68, 44, 74, 51, 67, 50, 73, 53, 66, 49, 70, 55, 69, 46, 75, 52, 68, 48, 72, 54, 66]
              }];
            case 'dialogue':
              return [{
                id: 'clip-dialogue-1',
                name: 'Interview_Audio.wav',
                startTime: 0,
                duration: 120,
                offset: 0,
                volume: 85,
                color: '#3B82F6',
                waveformData: [75, 85, 80, 90, 70, 95, 78, 88, 82, 92, 76, 94, 79, 89, 77, 93, 81, 91, 74, 96, 84, 86, 73, 98, 87, 83, 75, 91, 82, 89, 78, 94, 80, 88, 76, 92, 79, 90, 85, 87, 72, 95, 86, 84, 77, 97, 83, 89, 81, 93, 78, 96, 84, 90, 80, 94, 82, 88, 86, 92, 74, 98, 87, 85, 79, 95, 83, 91, 81, 89, 85, 93, 77, 97, 88, 86, 80, 94, 84, 90, 82, 92, 86, 88, 78, 96, 89, 87, 83, 93, 81, 95, 85, 89, 80, 94, 87, 91, 84, 88]
              }];
            case 'music':
              return [{
                id: 'clip-music-1',
                name: 'Cinematic_Score.wav',
                startTime: 10,
                duration: 100,
                offset: 0,
                volume: 45,
                color: '#10B981',
                waveformData: [25, 35, 30, 40, 20, 45, 28, 37, 32, 42, 24, 44, 29, 38, 27, 43, 31, 39, 23, 46, 34, 36, 22, 48, 36, 33, 25, 41, 32, 39, 28, 44, 30, 38, 26, 42, 29, 40, 35, 37, 21, 45, 36, 34, 27, 47, 33, 39, 31, 43, 28, 46, 34, 40, 30, 44, 32, 38, 36, 42, 24, 48, 37, 35, 29, 45, 33, 41, 31, 39, 35, 43, 27, 47, 38, 36, 30, 44, 34, 40, 32, 42, 36, 38, 28, 46, 39, 37, 33, 43, 31, 45, 35, 39, 30, 44, 37, 41, 34, 38]
              }];
            case 'foley':
              return [{
                id: 'clip-foley-1',
                name: 'Footsteps_Concrete.wav',
                startTime: 25,
                duration: 8,
                offset: 0,
                volume: 70,
                color: '#F59E0B',
                waveformData: [65, 75, 70, 80, 60, 85, 68, 78, 72, 82, 66, 84, 69, 79, 67, 83, 71, 81, 64, 86, 74, 76, 63, 88, 77, 73, 65, 81, 72, 79, 68, 84, 70, 78, 66, 82, 69, 80, 75, 77, 62, 85, 76, 74, 67, 87, 73, 79, 71, 83, 68, 86, 74, 80, 70, 84, 72, 78, 76, 82, 64, 88, 77, 75, 69, 85, 73, 81, 71, 79, 75, 83, 67, 87, 78, 76, 70, 84, 74, 80, 72, 82, 76, 78, 68, 86, 79, 77, 73, 83, 71, 85, 75, 79, 70, 84, 77, 81, 74, 78]
              }];
            case 'sound-design':
              return [{
                id: 'clip-sound-design-1',
                name: 'Door_Slam.wav',
                startTime: 45,
                duration: 3,
                offset: 0,
                volume: 65,
                color: '#8B5CF6',
                waveformData: [90, 95, 88, 98, 85, 100, 92, 96, 89, 99, 87, 97, 91, 94, 86, 98, 93, 95, 84, 100, 94, 93, 83, 99, 96, 92, 88, 97, 91, 95, 89, 98, 90, 94, 87, 96, 92, 97, 95, 93, 82, 100, 96, 91, 89, 99, 94, 95, 93, 97, 90, 98, 95, 94, 92, 96, 91, 93, 96, 95, 85, 100, 97, 92, 90, 98, 94, 96, 93, 94, 96, 97, 88, 99, 98, 93, 92, 96, 95, 94, 93, 95, 97, 93, 89, 98, 99, 92, 94, 97, 93, 98, 96, 94, 91, 96, 98, 95, 95, 93]
              }];
            case 'ambiance':
              return [{
                id: 'clip-ambiance-1',
                name: 'City_Ambiance.wav',
                startTime: 0,
                duration: 180,
                offset: 0,
                volume: 35,
                color: '#EC4899',
                waveformData: [15, 25, 20, 30, 10, 35, 18, 27, 22, 32, 14, 34, 19, 28, 17, 33, 21, 29, 13, 36, 24, 26, 12, 38, 26, 23, 15, 31, 22, 29, 18, 34, 20, 28, 16, 32, 19, 30, 25, 27, 11, 35, 26, 24, 17, 37, 23, 29, 21, 33, 18, 36, 24, 30, 20, 34, 22, 28, 26, 32, 14, 38, 27, 25, 19, 35, 23, 31, 21, 29, 25, 33, 17, 37, 28, 26, 20, 34, 24, 30, 22, 32, 26, 28, 18, 36, 29, 27, 23, 33, 21, 35, 25, 29, 20, 34, 27, 31, 24, 28]
              }];
            default:
              return [];
          }
        case '2': // Podcast Project
          switch (trackId) {
            case 'video':
              return [];
            case 'dialogue':
              return [
                {
                  id: 'clip-host-1',
                  name: 'Host_Introduction.wav',
                  startTime: 0,
                  duration: 60,
                  offset: 0,
                  volume: 80,
                  color: '#3B82F6',
                  waveformData: [65, 75, 70, 80, 60, 85, 68, 78, 72, 82, 66, 84, 69, 79, 67, 83, 71, 81, 64, 86, 74, 76, 63, 88, 77, 73, 65, 81, 72, 79, 68, 84, 70, 78, 66, 82, 69, 80, 75, 77, 62, 85, 76, 74, 67, 87, 73, 79, 71, 83, 68, 86, 74, 80, 70, 84, 72, 78, 76, 82, 64, 88, 77, 75, 69, 85, 73, 81, 71, 79, 75, 83, 67, 87, 78, 76, 70, 84, 74, 80, 72, 82, 76, 78, 68, 86, 79, 77, 73, 83, 71, 85, 75, 79, 70, 84, 77, 81, 74, 78]
                },
                {
                  id: 'clip-guest-1',
                  name: 'Guest_Response.wav',
                  startTime: 65,
                  duration: 40,
                  offset: 0,
                  volume: 78,
                  color: '#3B82F6',
                  waveformData: [58, 68, 63, 73, 55, 78, 61, 71, 65, 75, 59, 77, 62, 72, 60, 76, 64, 74, 57, 79, 67, 69, 56, 81, 70, 66, 58, 74, 65, 72, 61, 77, 63, 71, 59, 75, 62, 73, 68, 70, 55, 78, 69, 67, 60, 80, 66, 72, 64, 76, 61, 79, 67, 73, 63, 77, 65, 71, 69, 75, 57, 81, 70, 68, 62, 78, 66, 74, 64, 72, 68, 76, 60, 80, 71, 69, 63, 77, 67, 73, 65, 75, 69, 71, 61, 79, 72, 70, 66, 76, 64, 78, 68, 72, 63, 77, 70, 74, 67, 71]
                }
              ];
            case 'music':
              return [{
                id: 'clip-podcast-music-1',
                name: 'Podcast_Intro.wav',
                startTime: 0,
                duration: 15,
                offset: 0,
                volume: 40,
                color: '#10B981',
                waveformData: [20, 30, 25, 35, 15, 40, 23, 32, 27, 37, 19, 39, 24, 33, 22, 38, 26, 34, 18, 41, 29, 31, 17, 43, 31, 28, 20, 36, 27, 34, 23, 39, 25, 33, 21, 37, 24, 35, 30, 32, 16, 40, 31, 29, 22, 42, 28, 34, 26, 38, 23, 41, 29, 35, 25, 39, 27, 33, 31, 37, 19, 43, 32, 30, 24, 40, 28, 36, 26, 34, 30, 38, 22, 42, 33, 31, 25, 39, 29, 35, 27, 37, 31, 33, 23, 41, 34, 32, 28, 38, 26, 40, 30, 34, 25, 39, 32, 36, 29, 33]
              }];
            case 'foley':
              return [];
            case 'sound-design':
              return [{
                id: 'clip-podcast-sfx-1',
                name: 'Notification_Ding.wav',
                startTime: 105,
                duration: 1,
                offset: 0,
                volume: 50,
                color: '#8B5CF6',
                waveformData: [85, 95, 90, 100, 80, 105, 88, 97, 82, 101, 86, 99, 89, 96, 87, 98, 91, 100, 84, 105, 94, 93, 83, 103, 96, 95, 85, 98, 92, 100, 89, 103, 90, 99, 87, 101, 92, 102, 100, 98, 82, 105, 101, 96, 89, 104, 99, 100, 93, 102, 90, 103, 100, 99, 92, 101, 91, 98, 101, 100, 85, 105, 102, 97, 90, 103, 99, 101, 93, 99, 101, 102, 88, 104, 103, 98, 92, 101, 100, 99, 93, 100, 102, 98, 89, 103, 104, 97, 94, 102, 98, 103, 101, 99, 91, 101, 103, 100, 100, 98]
              }];
            case 'ambiance':
              return [{
                id: 'clip-podcast-ambiance-1',
                name: 'Studio_Ambiance.wav',
                startTime: 0,
                duration: 120,
                offset: 0,
                volume: 25,
                color: '#EC4899',
                waveformData: [8, 15, 12, 18, 5, 20, 10, 16, 14, 19, 7, 21, 11, 17, 9, 20, 13, 18, 6, 22, 16, 14, 4, 24, 18, 11, 8, 19, 14, 17, 10, 21, 12, 16, 8, 19, 11, 18, 15, 14, 3, 20, 16, 12, 9, 23, 13, 17, 11, 20, 10, 22, 14, 18, 12, 21, 13, 16, 16, 19, 6, 24, 17, 13, 11, 20, 13, 19, 11, 17, 15, 20, 9, 23, 18, 14, 12, 21, 14, 18, 12, 19, 16, 16, 10, 22, 19, 15, 13, 20, 11, 21, 15, 17, 12, 21, 17, 19, 14, 16]
              }];
            default:
              return [];
          }
        case '3': // Music Production Project
          switch (trackId) {
            case 'video':
              return [];
            case 'dialogue':
              return [];
            case 'music':
              return [
                {
                  id: 'clip-drums-1',
                  name: 'Rock_Beat.wav',
                  startTime: 0,
                  duration: 80,
                  offset: 0,
                  volume: 75,
                  color: '#10B981',
                  waveformData: [80, 90, 85, 95, 75, 100, 88, 92, 82, 96, 86, 94, 89, 91, 87, 93, 91, 95, 84, 100, 94, 88, 83, 98, 96, 90, 85, 93, 92, 95, 89, 98, 90, 94, 87, 96, 92, 97, 95, 93, 82, 100, 96, 91, 89, 99, 94, 95, 93, 97, 90, 98, 95, 94, 92, 96, 91, 93, 96, 95, 85, 100, 97, 92, 90, 98, 94, 96, 93, 94, 96, 97, 88, 99, 98, 93, 92, 96, 95, 94, 93, 95, 97, 93, 89, 98, 99, 92, 94, 97, 93, 98, 96, 94, 91, 96, 98, 95, 95, 93]
                },
                {
                  id: 'clip-bass-1',
                  name: 'Bass_Line.wav',
                  startTime: 0,
                  duration: 80,
                  offset: 0,
                  volume: 70,
                  color: '#10B981',
                  waveformData: [50, 60, 55, 65, 45, 70, 58, 62, 52, 66, 56, 64, 59, 61, 57, 63, 61, 65, 54, 70, 64, 58, 53, 68, 66, 60, 55, 63, 62, 65, 59, 68, 60, 64, 57, 66, 62, 67, 65, 63, 52, 70, 66, 61, 59, 69, 64, 65, 63, 67, 60, 68, 65, 64, 62, 66, 61, 63, 66, 65, 55, 70, 67, 62, 60, 68, 64, 66, 63, 64, 66, 67, 58, 69, 68, 63, 62, 66, 65, 64, 63, 65, 67, 63, 59, 68, 69, 62, 64, 67, 63, 68, 66, 64, 61, 66, 68, 65, 65, 63]
                },
                {
                  id: 'clip-guitar-1',
                  name: 'Lead_Guitar.wav',
                  startTime: 20,
                  duration: 60,
                  offset: 0,
                  volume: 68,
                  color: '#10B981',
                  waveformData: [85, 95, 90, 100, 80, 105, 93, 97, 87, 101, 91, 99, 94, 96, 92, 98, 96, 100, 89, 105, 99, 93, 88, 103, 101, 95, 90, 98, 97, 100, 94, 103, 95, 99, 92, 101, 97, 102, 100, 98, 87, 105, 101, 96, 94, 104, 99, 100, 98, 102, 95, 103, 100, 99, 97, 101, 96, 98, 101, 100, 90, 105, 102, 97, 95, 103, 99, 101, 98, 99, 101, 102, 93, 104, 103, 98, 97, 101, 100, 99, 98, 100, 102, 98, 94, 103, 104, 97, 99, 102, 98, 103, 101, 99, 96, 101, 103, 100, 100, 98]
                }
              ];
            case 'foley':
              return [];
            case 'sound-design':
              return [{
                id: 'clip-music-reverb-1',
                name: 'Reverb_Tail.wav',
                startTime: 75,
                duration: 10,
                offset: 0,
                volume: 45,
                color: '#8B5CF6',
                waveformData: [25, 35, 30, 40, 20, 45, 28, 37, 32, 42, 24, 44, 29, 38, 27, 43, 31, 39, 23, 46, 34, 36, 22, 48, 36, 33, 25, 41, 32, 39, 28, 44, 30, 38, 26, 42, 29, 40, 35, 37, 21, 45, 36, 34, 27, 47, 33, 39, 31, 43, 28, 46, 34, 40, 30, 44, 32, 38, 36, 42, 24, 48, 37, 35, 29, 45, 33, 41, 31, 39, 35, 43, 27, 47, 38, 36, 30, 44, 34, 40, 32, 42, 36, 38, 28, 46, 39, 37, 33, 43, 31, 45, 35, 39, 30, 44, 37, 41, 34, 38]
              }];
            case 'ambiance':
              return [{
                id: 'clip-music-ambiance-1',
                name: 'Concert_Hall.wav',
                startTime: 0,
                duration: 80,
                offset: 0,
                volume: 30,
                color: '#EC4899',
                waveformData: [12, 22, 18, 28, 8, 32, 15, 25, 20, 30, 10, 34, 17, 27, 14, 31, 19, 29, 9, 35, 22, 24, 7, 37, 24, 21, 12, 29, 20, 27, 15, 32, 18, 26, 12, 30, 17, 28, 23, 25, 6, 33, 24, 22, 14, 35, 21, 27, 17, 31, 16, 34, 22, 28, 18, 32, 20, 26, 24, 30, 10, 37, 25, 23, 17, 33, 21, 29, 17, 27, 23, 31, 13, 35, 26, 24, 18, 32, 22, 28, 20, 30, 24, 26, 16, 34, 27, 25, 21, 31, 19, 33, 23, 27, 18, 32, 25, 29, 22, 26]
              }];
            default:
              return [];
          }
        default:
          return [];
      }
    };

    return baseTrackStructure.map(trackBase => ({
      id: trackBase.id,
      name: trackBase.name,
      type: 'audio' as const,
      volume: 75,
      pan: 50,
      muted: false,
      soloed: false,
      color: trackBase.color,
      clips: getClipsForTrack(trackBase.id, sessionId),
      effects: []
    }));
  }, []);

  // Audio tracks - initialize with session 1 tracks
  const [tracks, setTracks] = useState<AudioTrack[]>(() => getTracksForSession('1'));

  // Mixer channels
  const [mixerChannels, setMixerChannels] = useState<MixerChannel[]>([
    {
      id: '1',
      trackId: 'dialogue',
      name: 'Ch 1 - Dialogue',
      volume: 85,
      pan: 50,
      muted: false,
      soloed: false,
      gain: 0,
      sends: { reverb: 15 },
      eq: { highFreq: 1.2, midFreq: 0.8, lowFreq: 0.6 },
      effects: [],
    },
    {
      id: '2',
      trackId: 'music',
      name: 'Ch 2 - Music',
      volume: 65,
      pan: 50,
      muted: false,
      soloed: false,
      gain: 0,
      sends: { reverb: 30 },
      eq: { highFreq: 0.9, midFreq: 1.1, lowFreq: 1.3 },
      effects: [],
    }
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
      spectralData: [0.1, 0.2, 0.3, 0.4, 0.5],
      peakFrequency: 440,
      recommendations: ['Use EQ to enhance clarity'],
      lufs: -23.0,
      thd: 0.1
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
    setTransport(prev => ({ ...prev, isPlaying: true, isPaused: false, isStopped: false }));
  }, []);

  const pause = useCallback(() => {
    setTransport(prev => ({ ...prev, isPlaying: false, isPaused: true, isStopped: false }));
  }, []);

  const stop = useCallback(() => {
    setTransport(prev => ({ ...prev, isPlaying: false, isPaused: false, isStopped: true, currentTime: 0 }));
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

  const updateTrackPan = useCallback((trackId: string, pan: number) => {
    setTracks(prev => prev.map(track => 
      track.id === trackId ? { ...track, pan } : track
    ));
  }, []);

  // Session management with content switching
  const switchSession = useCallback((sessionId: string) => {
    setSessions(prev => prev.map(session => ({
      ...session,
      isActive: session.id === sessionId
    })));
    
    // Load tracks for the new session
    setTracks(getTracksForSession(sessionId));
  }, [getTracksForSession]);

  const closeSession = useCallback((sessionId: string) => {
    setSessions(prev => {
      const filteredSessions = prev.filter(session => session.id !== sessionId);
      
      // If we're closing the active session, make the first remaining session active
      if (filteredSessions.length > 0) {
        const wasActiveSession = prev.find(session => session.id === sessionId)?.isActive;
        if (wasActiveSession) {
          filteredSessions[0].isActive = true;
          // Load tracks for the new active session
          setTracks(getTracksForSession(filteredSessions[0].id));
        }
      }
      
      return filteredSessions;
    });
  }, [getTracksForSession]);

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

  // Add new session and switch to it
  const addSession = useCallback(() => {
    const newId = (sessions.length + 1).toString();
    const newSession = {
      id: newId,
      name: `Project ${newId}`,
      isActive: true
    };
    
    setSessions(prev => prev.map(session => ({ ...session, isActive: false })).concat(newSession));
    
    // Load empty tracks for the new session
    setTracks(getTracksForSession(newId));
  }, [sessions, getTracksForSession]);

  // Get empty tracks for new projects
  const getEmptyTracksForSession = useCallback((): AudioTrack[] => {
    const baseTrackStructure = [
      { id: 'video', name: 'Video', color: '#E5E5E5' },
      { id: 'dialogue', name: 'Dialogue', color: '#3B82F6' },
      { id: 'music', name: 'Music', color: '#10B981' },
      { id: 'foley', name: 'Foley', color: '#F59E0B' },
      { id: 'sound-design', name: 'Sound Design', color: '#8B5CF6' },
      { id: 'ambiance', name: 'Ambiance', color: '#EC4899' }
    ];

    return baseTrackStructure.map(trackBase => ({
      id: trackBase.id,
      name: trackBase.name,
      type: 'audio' as const,
      volume: 75,
      pan: 50,
      muted: false,
      soloed: false,
      color: trackBase.color,
      clips: [], // Empty clips for new project
      effects: []
    }));
  }, []);

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
    addSession,
    closeSession,
    setCurrentProject,
    updateClipPosition,
    updateClipProperties,
  };
}