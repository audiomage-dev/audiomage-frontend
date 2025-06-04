import { useState, useCallback, useEffect } from 'react';
import { AudioTrack, AudioClip, TransportState, MixerChannel, AudioEffect } from '../types/audio';

export function useAudioWorkstation() {
  // Session tabs with different project content
  const [sessions, setSessions] = useState([
    { id: '1', name: 'Main Session', isActive: true },
    { id: '2', name: 'Alternate Mix', isActive: false },
    { id: '3', name: 'Rough Draft', isActive: false },
  ]);

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

  // Get different tracks for each session
  const getTracksForSession = useCallback((sessionId: string): AudioTrack[] => {
    switch (sessionId) {
      case '1': // Video Post-Production Project
        return [
          {
            id: 'video-dialogue',
            name: 'Video Dialogue',
            type: 'audio',
            volume: 85,
            pan: 50,
            muted: false,
            soloed: false,
            color: '#3B82F6',
            clips: [
              {
                id: 'clip-dialogue-1',
                name: 'Interview_Audio.wav',
                startTime: 0,
                duration: 120,
                offset: 0,
                volume: 85,
                color: '#3B82F6',
                waveformData: [75, 85, 80, 90, 70, 95, 78, 88, 82, 92, 76, 94, 79, 89, 77, 93, 81, 91, 74, 96, 84, 86, 73, 98, 87, 83, 75, 91, 82, 89, 78, 94, 80, 88, 76, 92, 79, 90, 85, 87, 72, 95, 86, 84, 77, 97, 83, 89, 81, 93, 78, 96, 84, 90, 80, 94, 82, 88, 86, 92, 74, 98, 87, 85, 79, 95, 83, 91, 81, 89, 85, 93, 77, 97, 88, 86, 80, 94, 84, 90, 82, 92, 86, 88, 78, 96, 89, 87, 83, 93, 81, 95, 85, 89, 80, 94, 87, 91, 84, 88]
              }
            ],
            effects: [{ id: '1', name: 'De-noise', type: 'noise-reduction', enabled: true, parameters: {} }]
          },
          {
            id: 'video-music',
            name: 'Background Music',
            type: 'audio',
            volume: 45,
            pan: 50,
            muted: false,
            soloed: false,
            color: '#10B981',
            clips: [
              {
                id: 'clip-music-1',
                name: 'Cinematic_Score.wav',
                startTime: 10,
                duration: 100,
                offset: 0,
                volume: 45,
                color: '#10B981',
                waveformData: [25, 35, 30, 40, 20, 45, 28, 37, 32, 42, 24, 44, 29, 38, 27, 43, 31, 39, 23, 46, 34, 36, 22, 48, 36, 33, 25, 41, 32, 39, 28, 44, 30, 38, 26, 42, 29, 40, 35, 37, 21, 45, 36, 34, 27, 47, 33, 39, 31, 43, 28, 46, 34, 40, 30, 44, 32, 38, 36, 42, 24, 48, 37, 35, 29, 45, 33, 41, 31, 39, 35, 43, 27, 47, 38, 36, 30, 44, 34, 40, 32, 42, 36, 38, 28, 46, 39, 37, 33, 43, 31, 45, 35, 39, 30, 44, 37, 41, 34, 38]
              }
            ],
            effects: [{ id: '2', name: 'Reverb', type: 'reverb', enabled: true, parameters: {} }]
          },
          {
            id: 'video-sfx',
            name: 'Sound Effects',
            type: 'audio',
            volume: 65,
            pan: 50,
            muted: false,
            soloed: false,
            color: '#F59E0B',
            clips: [
              {
                id: 'clip-sfx-1',
                name: 'Door_Slam.wav',
                startTime: 45,
                duration: 3,
                offset: 0,
                volume: 65,
                color: '#F59E0B',
                waveformData: [90, 95, 88, 98, 85, 100, 92, 96, 89, 99, 87, 97, 91, 94, 86, 98, 93, 95, 84, 100, 94, 93, 83, 99, 96, 92, 88, 97, 91, 95, 89, 98, 90, 94, 87, 96, 92, 97, 95, 93, 82, 100, 96, 91, 89, 99, 94, 95, 93, 97, 90, 98, 95, 94, 92, 96, 91, 93, 96, 95, 85, 100, 97, 92, 90, 98, 94, 96, 93, 94, 96, 97, 88, 99, 98, 93, 92, 96, 95, 94, 93, 95, 97, 93, 89, 98, 99, 92, 94, 97, 93, 98, 96, 94, 91, 96, 98, 95, 95, 93]
              }
            ],
            effects: []
          }
        ];
      case '2': // Podcast Project
        return [
          {
            id: 'podcast-host',
            name: 'Podcast Host',
            type: 'audio',
            volume: 80,
            pan: 40,
            muted: false,
            soloed: false,
            color: '#8B5CF6',
            clips: [
              {
                id: 'clip-host-1',
                name: 'Host_Introduction.wav',
                startTime: 0,
                duration: 60,
                offset: 0,
                volume: 80,
                color: '#8B5CF6',
                waveformData: [65, 75, 70, 80, 60, 85, 68, 78, 72, 82, 66, 84, 69, 79, 67, 83, 71, 81, 64, 86, 74, 76, 63, 88, 77, 73, 65, 81, 72, 79, 68, 84, 70, 78, 66, 82, 69, 80, 75, 77, 62, 85, 76, 74, 67, 87, 73, 79, 71, 83, 68, 86, 74, 80, 70, 84, 72, 78, 76, 82, 64, 88, 77, 75, 69, 85, 73, 81, 71, 79, 75, 83, 67, 87, 78, 76, 70, 84, 74, 80, 72, 82, 76, 78, 68, 86, 79, 77, 73, 83, 71, 85, 75, 79, 70, 84, 77, 81, 74, 78]
              }
            ],
            effects: [{ id: '3', name: 'Compressor', type: 'compressor', enabled: true, parameters: {} }]
          },
          {
            id: 'podcast-guest',
            name: 'Podcast Guest',
            type: 'audio',
            volume: 78,
            pan: 60,
            muted: false,
            soloed: false,
            color: '#EC4899',
            clips: [
              {
                id: 'clip-guest-1',
                name: 'Guest_Response.wav',
                startTime: 15,
                duration: 40,
                offset: 0,
                volume: 78,
                color: '#EC4899',
                waveformData: [58, 68, 63, 73, 55, 78, 61, 71, 65, 75, 59, 77, 62, 72, 60, 76, 64, 74, 57, 79, 67, 69, 56, 81, 70, 66, 58, 74, 65, 72, 61, 77, 63, 71, 59, 75, 62, 73, 68, 70, 55, 78, 69, 67, 60, 80, 66, 72, 64, 76, 61, 79, 67, 73, 63, 77, 65, 71, 69, 75, 57, 81, 70, 68, 62, 78, 66, 74, 64, 72, 68, 76, 60, 80, 71, 69, 63, 77, 67, 73, 65, 75, 69, 71, 61, 79, 72, 70, 66, 76, 64, 78, 68, 72, 63, 77, 70, 74, 67, 71]
              }
            ],
            effects: [{ id: '4', name: 'EQ', type: 'equalizer', enabled: true, parameters: {} }]
          }
        ];
      case '3': // Music Production Project
        return [
          {
            id: 'music-drums',
            name: 'Drum Kit',
            type: 'audio',
            volume: 75,
            pan: 50,
            muted: false,
            soloed: false,
            color: '#EF4444',
            clips: [
              {
                id: 'clip-drums-1',
                name: 'Rock_Beat.wav',
                startTime: 0,
                duration: 80,
                offset: 0,
                volume: 75,
                color: '#EF4444',
                waveformData: [80, 90, 85, 95, 75, 100, 88, 92, 82, 96, 86, 94, 89, 91, 87, 93, 91, 95, 84, 100, 94, 88, 83, 98, 96, 90, 85, 93, 92, 95, 89, 98, 90, 94, 87, 96, 92, 97, 95, 93, 82, 100, 96, 91, 89, 99, 94, 95, 93, 97, 90, 98, 95, 94, 92, 96, 91, 93, 96, 95, 85, 100, 97, 92, 90, 98, 94, 96, 93, 94, 96, 97, 88, 99, 98, 93, 92, 96, 95, 94, 93, 95, 97, 93, 89, 98, 99, 92, 94, 97, 93, 98, 96, 94, 91, 96, 98, 95, 95, 93]
              }
            ],
            effects: [{ id: '6', name: 'Gate', type: 'gate', enabled: true, parameters: {} }]
          },
          {
            id: 'music-bass',
            name: 'Bass Guitar',
            type: 'audio',
            volume: 70,
            pan: 50,
            muted: false,
            soloed: false,
            color: '#059669',
            clips: [
              {
                id: 'clip-bass-1',
                name: 'Bass_Line.wav',
                startTime: 0,
                duration: 80,
                offset: 0,
                volume: 70,
                color: '#059669',
                waveformData: [50, 60, 55, 65, 45, 70, 58, 62, 52, 66, 56, 64, 59, 61, 57, 63, 61, 65, 54, 70, 64, 58, 53, 68, 66, 60, 55, 63, 62, 65, 59, 68, 60, 64, 57, 66, 62, 67, 65, 63, 52, 70, 66, 61, 59, 69, 64, 65, 63, 67, 60, 68, 65, 64, 62, 66, 61, 63, 66, 65, 55, 70, 67, 62, 60, 68, 64, 66, 63, 64, 66, 67, 58, 69, 68, 63, 62, 66, 65, 64, 63, 65, 67, 63, 59, 68, 69, 62, 64, 67, 63, 68, 66, 64, 61, 66, 68, 65, 65, 63]
              }
            ],
            effects: [{ id: '7', name: 'Distortion', type: 'distortion', enabled: false, parameters: {} }]
          },
          {
            id: 'music-guitar',
            name: 'Electric Guitar',
            type: 'audio',
            volume: 68,
            pan: 30,
            muted: false,
            soloed: false,
            color: '#D97706',
            clips: [
              {
                id: 'clip-guitar-1',
                name: 'Lead_Guitar.wav',
                startTime: 20,
                duration: 60,
                offset: 0,
                volume: 68,
                color: '#D97706',
                waveformData: [85, 95, 90, 100, 80, 105, 93, 97, 87, 101, 91, 99, 94, 96, 92, 98, 96, 100, 89, 105, 99, 93, 88, 103, 101, 95, 90, 98, 97, 100, 94, 103, 95, 99, 92, 101, 97, 102, 100, 98, 87, 105, 101, 96, 94, 104, 99, 100, 98, 102, 95, 103, 100, 99, 97, 101, 96, 98, 101, 100, 90, 105, 102, 97, 95, 103, 99, 101, 98, 99, 101, 102, 93, 104, 103, 98, 97, 101, 100, 99, 98, 100, 102, 98, 94, 103, 104, 97, 99, 102, 98, 103, 101, 99, 96, 101, 103, 100, 100, 98]
              }
            ],
            effects: [{ id: '8', name: 'Chorus', type: 'chorus', enabled: true, parameters: {} }]
          }
        ];
      default:
        return [];
    }
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

  // Add new session
  const addSession = useCallback(() => {
    const newId = (sessions.length + 1).toString();
    const newSession = {
      id: newId,
      name: `Project ${newId}`,
      isActive: false
    };
    
    setSessions(prev => [...prev, newSession]);
  }, [sessions]);

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