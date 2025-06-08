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
      { id: 'video', name: 'Video', color: '#FF6B6B', isGroup: false }, // Red for video
      { id: 'dialogue', name: 'Dialogue', color: '#4ECDC4', isGroup: false }, // Teal for dialogue
      { id: 'music', name: 'Music', color: '#45B7D1', isGroup: false }, // Blue for music
      { id: 'foley', name: 'Foley', color: '#96CEB4', isGroup: true }, // Green for foley (container)
      { id: 'foley-1', name: 'Foley 1', color: '#96CEB4', isGroup: false, parentId: 'foley' },
      { id: 'foley-2', name: 'Foley 2', color: '#96CEB4', isGroup: false, parentId: 'foley' },
      { id: 'foley-3', name: 'Foley 3', color: '#96CEB4', isGroup: false, parentId: 'foley' },
      { id: 'foley-4', name: 'Foley 4', color: '#96CEB4', isGroup: false, parentId: 'foley' },
      { id: 'foley-5', name: 'Foley 5', color: '#96CEB4', isGroup: false, parentId: 'foley' },
      { id: 'foley-6', name: 'Foley 6', color: '#96CEB4', isGroup: false, parentId: 'foley' },
      { id: 'sound-design', name: 'Sound Design', color: '#FFEAA7', isGroup: true }, // Yellow for sound design (container)
      { id: 'sound-design-1', name: 'Sound Design 1', color: '#FFEAA7', isGroup: false, parentId: 'sound-design' },
      { id: 'sound-design-2', name: 'Sound Design 2', color: '#FFEAA7', isGroup: false, parentId: 'sound-design' },
      { id: 'sound-design-3', name: 'Sound Design 3', color: '#FFEAA7', isGroup: false, parentId: 'sound-design' },
      { id: 'sound-design-4', name: 'Sound Design 4', color: '#FFEAA7', isGroup: false, parentId: 'sound-design' },
      { id: 'sound-design-5', name: 'Sound Design 5', color: '#FFEAA7', isGroup: false, parentId: 'sound-design' },
      { id: 'sound-design-6', name: 'Sound Design 6', color: '#FFEAA7', isGroup: false, parentId: 'sound-design' },
      { id: 'ambiance', name: 'Ambiance', color: '#DDA0DD', isGroup: true }, // Purple for ambiance (container)
      { id: 'ambiance-1', name: 'Ambiance 1', color: '#DDA0DD', isGroup: false, parentId: 'ambiance' },
      { id: 'ambiance-2', name: 'Ambiance 2', color: '#DDA0DD', isGroup: false, parentId: 'ambiance' },
      { id: 'ambiance-3', name: 'Ambiance 3', color: '#DDA0DD', isGroup: false, parentId: 'ambiance' },
      { id: 'ambiance-4', name: 'Ambiance 4', color: '#DDA0DD', isGroup: false, parentId: 'ambiance' },
      { id: 'ambiance-5', name: 'Ambiance 5', color: '#DDA0DD', isGroup: false, parentId: 'ambiance' },
      { id: 'ambiance-6', name: 'Ambiance 6', color: '#DDA0DD', isGroup: false, parentId: 'ambiance' }
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
              return [
                {
                  id: 'clip-dialogue-1',
                  name: 'Interview_Audio.wav',
                  startTime: 0,
                  duration: 120,
                  offset: 0,
                  volume: 85,
                  color: '#3B82F6',
                  waveformData: [75, 85, 80, 90, 70, 95, 78, 88, 82, 92, 76, 94, 79, 89, 77, 93, 81, 91, 74, 96, 84, 86, 73, 98, 87, 83, 75, 91, 82, 89, 78, 94, 80, 88, 76, 92, 79, 90, 85, 87, 72, 95, 86, 84, 77, 97, 83, 89, 81, 93, 78, 96, 84, 90, 80, 94, 82, 88, 86, 92, 74, 98, 87, 85, 79, 95, 83, 91, 81, 89, 85, 93, 77, 97, 88, 86, 80, 94, 84, 90, 82, 92, 86, 88, 78, 96, 89, 87, 83, 93, 81, 95, 85, 89, 80, 94, 87, 91, 84, 88]
                },
                {
                  id: 'clip-dialogue-2',
                  name: 'Narrator_VO.wav',
                  startTime: 130,
                  duration: 45,
                  offset: 0,
                  volume: 82,
                  color: '#3B82F6',
                  waveformData: [70, 80, 75, 85, 65, 90, 73, 83, 77, 87, 71, 89, 74, 84, 72, 88, 76, 86, 69, 91, 79, 81, 68, 93, 82, 78, 70, 86, 77, 84, 73, 89, 75, 83, 71, 87, 74, 85, 80, 82, 67, 90, 81, 79, 72, 92, 78, 84, 76, 88, 73, 91, 79, 85, 75, 89, 77, 83, 81, 87, 69, 93, 82, 80, 74, 90, 78, 86, 76, 84, 80, 88, 72, 92, 83, 81, 75, 89, 79, 85, 77, 87, 81, 83, 73, 91, 84, 82, 78, 88, 76, 90, 80, 84, 75, 89, 82, 86, 79, 83]
                }
              ];
            case 'music':
              return [
                {
                  id: 'clip-music-1',
                  name: 'Cinematic_Score.wav',
                  startTime: 10,
                  duration: 100,
                  offset: 0,
                  volume: 45,
                  color: '#10B981',
                  waveformData: [25, 35, 30, 40, 20, 45, 28, 37, 32, 42, 24, 44, 29, 38, 27, 43, 31, 39, 23, 46, 34, 36, 22, 48, 36, 33, 25, 41, 32, 39, 28, 44, 30, 38, 26, 42, 29, 40, 35, 37, 21, 45, 36, 34, 27, 47, 33, 39, 31, 43, 28, 46, 34, 40, 30, 44, 32, 38, 36, 42, 24, 48, 37, 35, 29, 45, 33, 41, 31, 39, 35, 43, 27, 47, 38, 36, 30, 44, 34, 40, 32, 42, 36, 38, 28, 46, 39, 37, 33, 43, 31, 45, 35, 39, 30, 44, 37, 41, 34, 38]
                },
                {
                  id: 'clip-music-2',
                  name: 'Tension_Build.wav',
                  startTime: 120,
                  duration: 35,
                  offset: 0,
                  volume: 38,
                  color: '#10B981',
                  waveformData: [18, 28, 23, 33, 15, 38, 21, 30, 25, 35, 19, 37, 22, 31, 20, 36, 24, 32, 17, 39, 27, 29, 16, 41, 29, 26, 18, 34, 25, 32, 21, 37, 23, 31, 19, 35, 22, 33, 28, 30, 14, 38, 29, 27, 20, 40, 26, 32, 24, 36, 21, 39, 27, 33, 23, 37, 25, 31, 29, 35, 17, 41, 30, 28, 22, 38, 26, 34, 24, 32, 28, 36, 20, 40, 31, 29, 23, 37, 27, 33, 25, 35, 29, 31, 21, 39, 32, 30, 26, 36, 24, 38, 28, 32, 23, 37, 30, 34, 27, 31]
                },
                {
                  id: 'clip-music-3',
                  name: 'Outro_Theme.wav',
                  startTime: 165,
                  duration: 15,
                  offset: 0,
                  volume: 50,
                  color: '#10B981',
                  waveformData: [30, 40, 35, 45, 25, 50, 33, 43, 37, 47, 31, 49, 34, 44, 32, 48, 36, 46, 29, 51, 39, 41, 28, 53, 42, 38, 30, 46, 37, 44, 33, 49, 35, 43, 31, 47, 34, 45, 40, 42, 27, 50, 41, 39, 32, 52, 38, 44, 36, 48, 33, 51, 39, 45, 35, 49, 37, 43, 41, 47, 29, 53, 42, 40, 34, 50, 38, 46, 36, 44, 40, 48, 32, 52, 43, 41, 35, 49, 39, 45, 37, 47, 41, 43, 33, 51, 44, 42, 38, 48, 36, 50, 40, 44, 35, 49, 42, 46, 39, 43]
                }
              ];
            // Individual Foley tracks
            case 'foley-1':
              return [
                {
                  id: 'clip-foley-1-1',
                  name: 'Footsteps_Concrete.wav',
                  startTime: 25,
                  duration: 8,
                  offset: 0,
                  volume: 70,
                  color: '#F59E0B',
                  waveformData: [65, 75, 70, 80, 60, 85, 68, 78, 72, 82, 66, 84, 69, 79, 67, 83, 71, 81, 64, 86, 74, 76, 63, 88, 77, 73, 65, 81, 72, 79, 68, 84, 70, 78, 66, 82, 69, 80, 75, 77, 62, 85, 76, 74, 67, 87, 73, 79, 71, 83, 68, 86, 74, 80, 70, 84, 72, 78, 76, 82, 64, 88, 77, 75, 69, 85, 73, 81, 71, 79, 75, 83, 67, 87, 78, 76, 70, 84, 74, 80, 72, 82, 76, 78, 68, 86, 79, 77, 73, 83, 71, 85, 75, 79, 70, 84, 77, 81, 74, 78]
                },
                {
                  id: 'clip-foley-1-2',
                  name: 'Footsteps_Gravel.wav',
                  startTime: 85,
                  duration: 6,
                  offset: 0,
                  volume: 65,
                  color: '#F59E0B',
                  waveformData: [58, 68, 63, 73, 53, 78, 61, 71, 65, 75, 59, 77, 62, 72, 60, 76, 64, 74, 57, 79, 67, 69, 56, 81, 70, 66, 58, 74, 65, 72, 61, 77, 63, 71, 59, 75, 62, 73, 68, 70, 55, 78, 69, 67, 60, 80, 66, 72, 64, 76, 61, 79, 67, 73, 63, 77, 65, 71, 69, 75, 57, 81, 70, 68, 62, 78, 66, 74, 64, 72, 68, 76, 60, 80, 71, 69, 63, 77, 67, 73, 65, 75, 69, 71, 61, 79, 72, 70, 66, 76, 64, 78, 68, 72, 63, 77, 70, 74, 67, 71]
                },
                {
                  id: 'clip-foley-1-3',
                  name: 'Footsteps_Wood.wav',
                  startTime: 150,
                  duration: 4,
                  offset: 0,
                  volume: 68,
                  color: '#F59E0B',
                  waveformData: [60, 70, 65, 75, 55, 80, 63, 73, 67, 77, 61, 79, 64, 74, 62, 78, 66, 76, 59, 81, 69, 71, 58, 83, 72, 68, 60, 76, 67, 74, 63, 79, 65, 73, 61, 77, 64, 75, 70, 72, 57, 80, 71, 69, 62, 82, 68, 74, 66, 78, 63, 81, 69, 75, 65, 79, 67, 73, 71, 77, 59, 83, 72, 70, 64, 80, 68, 76, 66, 74, 70, 78, 62, 82, 73, 71, 65, 79, 69, 75, 67, 77, 71, 73, 63, 81, 74, 72, 68, 78, 66, 80, 70, 74, 65, 79, 72, 76, 69, 73]
                }
              ];
            case 'foley-2':
              return [
                {
                  id: 'clip-foley-2-1',
                  name: 'Door_Creak.wav',
                  startTime: 42,
                  duration: 4,
                  offset: 0,
                  volume: 65,
                  color: '#F59E0B',
                  waveformData: [45, 55, 50, 60, 40, 65, 48, 58, 52, 62, 46, 64, 49, 59, 47, 63, 51, 61, 44, 66, 54, 56, 43, 68, 57, 53, 45, 61, 52, 59, 48, 64, 50, 58, 46, 62, 49, 60, 55, 57, 42, 65, 56, 54, 47, 67, 53, 59, 51, 63, 48, 66, 54, 60, 50, 64, 52, 58, 56, 62, 44, 68, 57, 55, 49, 65, 53, 61, 51, 59, 55, 63, 47, 67, 58, 56, 50, 64, 54, 60, 52, 62, 56, 58, 48, 66, 59, 57, 53, 63, 51, 65, 55, 59, 50, 64, 57, 61, 54, 58]
                },
                {
                  id: 'clip-foley-2-2',
                  name: 'Door_Close.wav',
                  startTime: 95,
                  duration: 2,
                  offset: 0,
                  volume: 72,
                  color: '#F59E0B',
                  waveformData: [70, 85, 78, 90, 65, 95, 73, 88, 76, 92, 71, 94, 74, 89, 72, 93, 75, 91, 69, 96, 79, 86, 68, 98, 82, 83, 70, 91, 77, 89, 73, 94, 75, 88, 71, 92, 74, 90, 80, 87, 67, 95, 81, 84, 72, 97, 78, 89, 76, 93, 73, 96, 79, 90, 75, 94, 77, 88, 81, 92, 69, 98, 82, 85, 74, 95, 78, 91, 76, 89, 80, 93, 72, 97, 83, 86, 75, 94, 79, 90, 77, 92, 81, 88, 73, 96, 84, 87, 78, 93, 76, 95, 80, 89, 75, 94, 82, 91, 79, 88]
                },
                {
                  id: 'clip-foley-2-3',
                  name: 'Keys_Jingle.wav',
                  startTime: 130,
                  duration: 3,
                  offset: 0,
                  volume: 58,
                  color: '#F59E0B',
                  waveformData: [40, 50, 45, 55, 35, 60, 43, 53, 47, 57, 41, 59, 44, 54, 42, 58, 46, 56, 39, 61, 49, 51, 38, 63, 52, 48, 40, 56, 47, 54, 43, 59, 45, 53, 41, 57, 44, 55, 50, 52, 37, 60, 51, 49, 42, 62, 48, 54, 46, 58, 43, 61, 49, 55, 45, 59, 47, 53, 51, 57, 39, 63, 52, 50, 44, 60, 48, 56, 46, 54, 50, 58, 42, 62, 53, 51, 45, 59, 49, 55, 47, 57, 51, 53, 43, 61, 54, 52, 48, 58, 46, 60, 50, 54, 45, 59, 52, 56, 49, 53]
                }
              ];
            case 'foley-3':
              return [
                {
                  id: 'clip-foley-3-1',
                  name: 'Glass_Break.wav',
                  startTime: 67,
                  duration: 2,
                  offset: 0,
                  volume: 80,
                  color: '#F59E0B',
                  waveformData: [85, 95, 90, 98, 80, 100, 88, 96, 92, 99, 86, 97, 89, 94, 87, 98, 91, 95, 83, 100, 93, 92, 82, 99, 95, 90, 85, 97, 90, 94, 88, 98, 89, 93, 86, 96, 90, 97, 94, 92, 81, 100, 95, 90, 87, 99, 92, 94, 90, 97, 88, 98, 93, 94, 89, 96, 90, 92, 94, 95, 83, 100, 96, 90, 88, 98, 92, 95, 90, 93, 94, 97, 86, 99, 96, 91, 89, 96, 93, 94, 90, 95, 95, 92, 87, 98, 97, 90, 92, 96, 90, 98, 94, 93, 88, 96, 96, 94, 93, 92]
                },
                {
                  id: 'clip-foley-3-2',
                  name: 'Dishes_Clatter.wav',
                  startTime: 110,
                  duration: 5,
                  offset: 0,
                  volume: 72,
                  color: '#F59E0B',
                  waveformData: [65, 78, 72, 85, 60, 90, 68, 82, 75, 88, 63, 87, 70, 80, 66, 86, 73, 83, 62, 91, 76, 79, 61, 93, 79, 76, 65, 85, 72, 82, 68, 89, 70, 81, 64, 87, 69, 84, 77, 80, 59, 92, 78, 77, 67, 94, 75, 83, 71, 89, 66, 93, 77, 85, 69, 91, 74, 82, 78, 88, 62, 95, 80, 79, 70, 92, 76, 86, 72, 84, 79, 90, 65, 94, 81, 78, 71, 91, 77, 85, 73, 89, 80, 81, 67, 93, 82, 79, 75, 90, 71, 95, 79, 83, 69, 92, 81, 86, 76, 82]
                }
              ];
            case 'foley-4':
              return [{
                id: 'clip-foley-4-1',
                name: 'Paper_Rustle.wav',
                startTime: 15,
                duration: 6,
                offset: 0,
                volume: 55,
                color: '#F59E0B',
                waveformData: [35, 45, 40, 50, 30, 55, 38, 48, 42, 52, 36, 54, 39, 49, 37, 53, 41, 51, 34, 56, 44, 46, 33, 58, 47, 43, 35, 51, 42, 49, 38, 54, 40, 48, 36, 52, 39, 50, 45, 47, 32, 55, 46, 44, 37, 57, 43, 49, 41, 53, 38, 56, 44, 50, 40, 54, 42, 48, 46, 52, 34, 58, 47, 45, 39, 55, 43, 51, 41, 49, 45, 53, 37, 57, 48, 46, 40, 54, 44, 50, 42, 52, 46, 48, 38, 56, 49, 47, 43, 53, 41, 55, 45, 49, 40, 54, 47, 51, 44, 48]
              }];
            case 'foley-5':
              return [{
                id: 'clip-foley-5-1',
                name: 'Chair_Squeak.wav',
                startTime: 78,
                duration: 3,
                offset: 0,
                volume: 60,
                color: '#F59E0B',
                waveformData: [50, 60, 55, 65, 45, 70, 53, 63, 57, 67, 51, 69, 54, 64, 52, 68, 56, 66, 49, 71, 59, 61, 48, 73, 62, 58, 50, 66, 57, 64, 53, 69, 55, 63, 51, 67, 54, 65, 60, 62, 47, 70, 61, 59, 52, 72, 58, 64, 56, 68, 53, 71, 59, 65, 55, 69, 57, 63, 61, 67, 49, 73, 62, 60, 54, 70, 58, 66, 56, 64, 60, 68, 52, 72, 63, 61, 55, 69, 59, 65, 57, 67, 61, 63, 53, 71, 64, 62, 58, 68, 56, 70, 60, 64, 55, 69, 62, 66, 59, 63]
              }];
            
            // Individual Sound Design tracks
            case 'sound-design-1':
              return [
                {
                  id: 'clip-sound-design-1-1',
                  name: 'Whoosh_Impact.wav',
                  startTime: 45,
                  duration: 3,
                  offset: 0,
                  volume: 65,
                  color: '#8B5CF6',
                  waveformData: [90, 95, 88, 98, 85, 100, 92, 96, 89, 99, 87, 97, 91, 94, 86, 98, 93, 95, 84, 100, 94, 93, 83, 99, 96, 92, 88, 97, 91, 95, 89, 98, 90, 94, 87, 96, 92, 97, 95, 93, 82, 100, 96, 91, 89, 99, 94, 95, 93, 97, 90, 98, 95, 94, 92, 96, 91, 93, 96, 95, 85, 100, 97, 92, 90, 98, 94, 96, 93, 94, 96, 97, 88, 99, 98, 93, 92, 96, 95, 94, 93, 95, 97, 93, 89, 98, 99, 92, 94, 97, 93, 98, 96, 94, 91, 96, 98, 95, 95, 93]
                },
                {
                  id: 'clip-sound-design-1-2',
                  name: 'Magic_Shimmer.wav',
                  startTime: 65,
                  duration: 4,
                  offset: 0,
                  volume: 55,
                  color: '#8B5CF6',
                  waveformData: [70, 80, 75, 85, 65, 90, 73, 83, 77, 87, 71, 89, 74, 84, 72, 88, 76, 86, 69, 91, 79, 81, 68, 93, 82, 78, 70, 86, 77, 84, 73, 89, 75, 83, 71, 87, 74, 85, 80, 82, 67, 90, 81, 79, 72, 92, 78, 84, 76, 88, 73, 91, 79, 85, 75, 89, 77, 83, 81, 87, 69, 93, 82, 80, 74, 90, 78, 86, 76, 84, 80, 88, 72, 92, 83, 81, 75, 89, 79, 85, 77, 87, 81, 83, 73, 91, 84, 82, 78, 88, 76, 90, 80, 84, 75, 89, 82, 86, 79, 83]
                },
                {
                  id: 'clip-sound-design-1-3',
                  name: 'Transition_Sweep.wav',
                  startTime: 120,
                  duration: 2,
                  offset: 0,
                  volume: 70,
                  color: '#8B5CF6',
                  waveformData: [85, 90, 87, 92, 83, 95, 88, 91, 89, 93, 86, 94, 88, 90, 87, 93, 89, 91, 84, 96, 91, 89, 83, 97, 93, 87, 85, 92, 89, 90, 87, 94, 88, 90, 86, 93, 89, 91, 92, 89, 82, 95, 93, 88, 87, 96, 90, 91, 89, 93, 87, 95, 91, 90, 88, 94, 89, 90, 92, 92, 84, 97, 93, 89, 88, 95, 90, 92, 89, 91, 92, 93, 86, 96, 94, 90, 88, 94, 91, 91, 89, 93, 93, 90, 87, 95, 95, 89, 90, 93, 89, 95, 92, 91, 88, 94, 93, 92, 91, 90]
                }
              ];
            case 'sound-design-2':
              return [{
                id: 'clip-sound-design-2-1',
                name: 'Electrical_Buzz.wav',
                startTime: 89,
                duration: 12,
                offset: 0,
                volume: 50,
                color: '#8B5CF6',
                waveformData: [75, 85, 80, 90, 70, 95, 78, 88, 82, 92, 76, 94, 79, 89, 77, 93, 81, 91, 74, 96, 84, 86, 73, 98, 87, 83, 75, 91, 82, 89, 78, 94, 80, 88, 76, 92, 79, 90, 85, 87, 72, 95, 86, 84, 77, 97, 83, 89, 81, 93, 78, 96, 84, 90, 80, 94, 82, 88, 86, 92, 74, 98, 87, 85, 79, 95, 83, 91, 81, 89, 85, 93, 77, 97, 88, 86, 80, 94, 84, 90, 82, 92, 86, 88, 78, 96, 89, 87, 83, 93, 81, 95, 85, 89, 80, 94, 87, 91, 84, 88]
              }];
            case 'sound-design-3':
              return [{
                id: 'clip-sound-design-3-1',
                name: 'Laser_Zap.wav',
                startTime: 134,
                duration: 1.5,
                offset: 0,
                volume: 75,
                color: '#8B5CF6',
                waveformData: [95, 100, 92, 98, 90, 100, 94, 99, 96, 100, 93, 99, 95, 97, 91, 100, 97, 98, 89, 100, 98, 96, 88, 100, 99, 95, 92, 99, 96, 98, 94, 100, 95, 97, 93, 99, 96, 100, 98, 96, 87, 100, 99, 94, 95, 100, 97, 98, 96, 99, 94, 100, 98, 97, 95, 99, 96, 98, 99, 100, 90, 100, 100, 95, 96, 100, 98, 99, 96, 98, 99, 100, 93, 100, 100, 96, 97, 99, 98, 97, 96, 98, 100, 96, 94, 100, 100, 95, 98, 99, 96, 100, 99, 97, 95, 99, 100, 98, 98, 96]
              }];
            case 'sound-design-4':
              return [{
                id: 'clip-sound-design-4-1',
                name: 'Metal_Clang.wav',
                startTime: 156,
                duration: 4,
                offset: 0,
                volume: 70,
                color: '#8B5CF6',
                waveformData: [80, 90, 85, 95, 75, 100, 83, 93, 87, 97, 81, 99, 84, 94, 82, 98, 86, 96, 79, 100, 89, 91, 78, 99, 92, 88, 80, 96, 87, 94, 83, 99, 85, 93, 81, 97, 84, 95, 90, 92, 77, 100, 91, 89, 82, 98, 88, 94, 86, 98, 83, 99, 89, 95, 85, 99, 87, 93, 91, 97, 79, 100, 92, 90, 84, 98, 88, 96, 86, 94, 90, 98, 82, 99, 93, 91, 85, 97, 89, 95, 87, 97, 91, 93, 83, 99, 94, 92, 88, 98, 86, 100, 90, 94, 85, 99, 92, 96, 89, 93]
              }];
            case 'sound-design-5':
              return [{
                id: 'clip-sound-design-5-1',
                name: 'Explosion_Distant.wav',
                startTime: 165,
                duration: 8,
                offset: 0,
                volume: 45,
                color: '#8B5CF6',
                waveformData: [60, 70, 65, 75, 55, 80, 63, 73, 67, 77, 61, 79, 64, 74, 62, 78, 66, 76, 59, 81, 69, 71, 58, 83, 72, 68, 60, 76, 67, 74, 63, 79, 65, 73, 61, 77, 64, 75, 70, 72, 57, 80, 71, 69, 62, 82, 68, 74, 66, 78, 63, 81, 69, 75, 65, 79, 67, 73, 71, 77, 59, 83, 72, 70, 64, 80, 68, 76, 66, 74, 70, 78, 62, 82, 73, 71, 65, 79, 69, 75, 67, 77, 71, 73, 63, 81, 74, 72, 68, 78, 66, 80, 70, 74, 65, 79, 72, 76, 69, 73]
              }];
            
            // Individual Ambiance tracks
            case 'ambiance-1':
              return [{
                id: 'clip-ambiance-1-1',
                name: 'City_Traffic.wav',
                startTime: 0,
                duration: 180,
                offset: 0,
                volume: 35,
                color: '#EC4899',
                waveformData: [15, 25, 20, 30, 10, 35, 18, 27, 22, 32, 14, 34, 19, 28, 17, 33, 21, 29, 13, 36, 24, 26, 12, 38, 26, 23, 15, 31, 22, 29, 18, 34, 20, 28, 16, 32, 19, 30, 25, 27, 11, 35, 26, 24, 17, 37, 23, 29, 21, 33, 18, 36, 24, 30, 20, 34, 22, 28, 26, 32, 14, 38, 27, 25, 19, 35, 23, 31, 21, 29, 25, 33, 17, 37, 28, 26, 20, 34, 24, 30, 22, 32, 26, 28, 18, 36, 29, 27, 23, 33, 21, 35, 25, 29, 20, 34, 27, 31, 24, 28]
              }];
            case 'ambiance-2':
              return [
                {
                  id: 'clip-ambiance-2-1',
                  name: 'Wind_Subtle.wav',
                  startTime: 0,
                  duration: 180,
                  offset: 0,
                  volume: 25,
                  color: '#EC4899',
                  waveformData: [10, 20, 15, 25, 8, 30, 13, 22, 17, 27, 11, 29, 14, 23, 12, 28, 16, 24, 9, 31, 19, 21, 7, 33, 21, 18, 10, 26, 17, 24, 13, 29, 15, 23, 11, 27, 14, 25, 20, 22, 6, 30, 21, 19, 12, 32, 18, 24, 16, 28, 13, 31, 19, 25, 15, 29, 17, 23, 21, 27, 9, 33, 22, 20, 14, 30, 18, 26, 16, 24, 20, 28, 12, 32, 23, 21, 15, 29, 19, 25, 17, 27, 21, 23, 13, 31, 24, 22, 18, 28, 16, 30, 20, 24, 15, 29, 22, 26, 19, 23]
                }
              ];
            case 'ambiance-3':
              return [{
                id: 'clip-ambiance-3-1',
                name: 'Office_Hum.wav',
                startTime: 45,
                duration: 90,
                offset: 0,
                volume: 20,
                color: '#EC4899',
                waveformData: [8, 18, 13, 23, 6, 28, 11, 20, 15, 25, 9, 27, 12, 21, 10, 26, 14, 22, 7, 29, 17, 19, 5, 31, 19, 16, 8, 24, 15, 22, 11, 27, 13, 21, 9, 25, 12, 23, 18, 20, 4, 28, 19, 17, 10, 30, 16, 22, 14, 26, 11, 29, 17, 23, 13, 27, 15, 21, 19, 25, 7, 31, 20, 18, 12, 28, 16, 24, 14, 22, 18, 26, 10, 30, 21, 19, 13, 27, 17, 23, 15, 25, 19, 21, 11, 29, 22, 20, 16, 26, 14, 28, 18, 22, 13, 27, 20, 24, 17, 21]
              }];
            case 'ambiance-4':
              return [{
                id: 'clip-ambiance-4-1',
                name: 'Rain_Light.wav',
                startTime: 60,
                duration: 120,
                offset: 0,
                volume: 30,
                color: '#EC4899',
                waveformData: [12, 22, 17, 27, 10, 32, 15, 25, 19, 29, 13, 31, 16, 26, 14, 30, 18, 28, 11, 33, 21, 23, 9, 35, 23, 20, 12, 28, 19, 26, 15, 31, 17, 25, 13, 29, 16, 27, 22, 24, 8, 32, 23, 21, 14, 34, 20, 26, 18, 30, 15, 33, 21, 27, 17, 31, 19, 25, 23, 29, 11, 35, 24, 22, 16, 32, 20, 28, 18, 26, 22, 30, 14, 34, 25, 23, 17, 31, 21, 27, 19, 29, 23, 25, 15, 33, 26, 24, 20, 30, 18, 32, 22, 26, 17, 31, 24, 28, 21, 25]
              }];
            case 'ambiance-5':
              return [{
                id: 'clip-ambiance-5-1',
                name: 'Forest_Birds.wav',
                startTime: 90,
                duration: 90,
                offset: 0,
                volume: 40,
                color: '#EC4899',
                waveformData: [20, 30, 25, 35, 18, 40, 23, 33, 27, 37, 21, 39, 24, 34, 22, 38, 26, 36, 19, 41, 29, 31, 17, 43, 31, 28, 20, 36, 27, 34, 23, 39, 25, 33, 21, 37, 24, 35, 30, 32, 16, 40, 31, 29, 22, 42, 28, 34, 26, 38, 23, 41, 29, 35, 25, 39, 27, 33, 31, 37, 19, 43, 32, 30, 24, 40, 28, 36, 26, 34, 30, 38, 22, 42, 33, 31, 25, 39, 29, 35, 27, 37, 31, 33, 23, 41, 34, 32, 28, 38, 26, 40, 30, 34, 25, 39, 32, 36, 29, 33]
              }];
            
            // Parent group tracks (return empty since children have the clips)
            case 'foley':
            case 'sound-design':
            case 'ambiance':
              return [];
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
      effects: [],
      isGroup: trackBase.isGroup,
      parentId: trackBase.parentId
    }));
  }, []);

  // Audio tracks - initialize with session 1 tracks
  const [tracks, setTracks] = useState<AudioTrack[]>(() => getTracksForSession('1'));

  // Track group collapse state
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

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
      { id: 'video', name: 'Video', color: '#E5E5E5', isGroup: false },
      { id: 'dialogue', name: 'Dialogue', color: '#3B82F6', isGroup: false },
      { id: 'music', name: 'Music', color: '#10B981', isGroup: false },
      { id: 'foley', name: 'Foley', color: '#F59E0B', isGroup: true },
      { id: 'foley-1', name: 'Foley 1', color: '#F59E0B', isGroup: false, parentId: 'foley' },
      { id: 'foley-2', name: 'Foley 2', color: '#F59E0B', isGroup: false, parentId: 'foley' },
      { id: 'foley-3', name: 'Foley 3', color: '#F59E0B', isGroup: false, parentId: 'foley' },
      { id: 'foley-4', name: 'Foley 4', color: '#F59E0B', isGroup: false, parentId: 'foley' },
      { id: 'foley-5', name: 'Foley 5', color: '#F59E0B', isGroup: false, parentId: 'foley' },
      { id: 'sound-design', name: 'Sound Design', color: '#8B5CF6', isGroup: true },
      { id: 'sound-design-1', name: 'SFX 1', color: '#8B5CF6', isGroup: false, parentId: 'sound-design' },
      { id: 'sound-design-2', name: 'SFX 2', color: '#8B5CF6', isGroup: false, parentId: 'sound-design' },
      { id: 'sound-design-3', name: 'SFX 3', color: '#8B5CF6', isGroup: false, parentId: 'sound-design' },
      { id: 'sound-design-4', name: 'SFX 4', color: '#8B5CF6', isGroup: false, parentId: 'sound-design' },
      { id: 'sound-design-5', name: 'SFX 5', color: '#8B5CF6', isGroup: false, parentId: 'sound-design' },
      { id: 'ambiance', name: 'Ambiance', color: '#EC4899', isGroup: true },
      { id: 'ambiance-1', name: 'Ambiance 1', color: '#EC4899', isGroup: false, parentId: 'ambiance' },
      { id: 'ambiance-2', name: 'Ambiance 2', color: '#EC4899', isGroup: false, parentId: 'ambiance' },
      { id: 'ambiance-3', name: 'Ambiance 3', color: '#EC4899', isGroup: false, parentId: 'ambiance' },
      { id: 'ambiance-4', name: 'Ambiance 4', color: '#EC4899', isGroup: false, parentId: 'ambiance' },
      { id: 'ambiance-5', name: 'Ambiance 5', color: '#EC4899', isGroup: false, parentId: 'ambiance' }
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
      effects: [],
      isGroup: trackBase.isGroup,
      parentId: trackBase.parentId
    }));
  }, []);

  // Toggle group collapse state
  const toggleGroupCollapse = useCallback((groupId: string) => {
    setCollapsedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupId)) {
        newSet.delete(groupId);
      } else {
        newSet.add(groupId);
      }
      return newSet;
    });
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
    collapsedGroups,
    
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
    toggleGroupCollapse,
  };
}