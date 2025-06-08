import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAudioWorkstation } from '../../../hooks/useAudioWorkstation';

describe('useAudioWorkstation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with default transport state', () => {
    const { result } = renderHook(() => useAudioWorkstation());

    expect(result.current.transport).toEqual({
      isPlaying: false,
      isPaused: false,
      isStopped: true,
      isRecording: false,
      currentTime: 0,
      isLooping: false,
    });
  });

  it('should start playback when play is called', () => {
    const { result } = renderHook(() => useAudioWorkstation());

    act(() => {
      result.current.play();
    });

    expect(result.current.transport.isPlaying).toBe(true);
    expect(result.current.transport.isStopped).toBe(false);
  });

  it('should pause playback when pause is called', () => {
    const { result } = renderHook(() => useAudioWorkstation());

    act(() => {
      result.current.play();
    });

    act(() => {
      result.current.pause();
    });

    expect(result.current.transport.isPaused).toBe(true);
    expect(result.current.transport.isPlaying).toBe(false);
  });

  it('should stop playback and reset time when stop is called', () => {
    const { result } = renderHook(() => useAudioWorkstation());

    act(() => {
      result.current.play();
    });

    act(() => {
      result.current.stop();
    });

    expect(result.current.transport.isStopped).toBe(true);
    expect(result.current.transport.isPlaying).toBe(false);
    expect(result.current.transport.currentTime).toBe(0);
  });

  it('should toggle recording state', () => {
    const { result } = renderHook(() => useAudioWorkstation());

    act(() => {
      result.current.toggleRecording();
    });

    expect(result.current.transport.isRecording).toBe(true);

    act(() => {
      result.current.toggleRecording();
    });

    expect(result.current.transport.isRecording).toBe(false);
  });

  it('should seek to specified time', () => {
    const { result } = renderHook(() => useAudioWorkstation());
    const targetTime = 120;

    act(() => {
      result.current.seekTo(targetTime);
    });

    expect(result.current.transport.currentTime).toBe(targetTime);
  });

  it('should update track volume', () => {
    const { result } = renderHook(() => useAudioWorkstation());
    const trackId = 'track-1';
    const newVolume = 75;

    act(() => {
      result.current.updateTrackVolume(trackId, newVolume);
    });

    // Verify the track volume was updated in the tracks array
    const updatedTrack = result.current.tracks.find(track => track.id === trackId);
    expect(updatedTrack?.volume).toBe(newVolume);
  });

  it('should toggle track mute', () => {
    const { result } = renderHook(() => useAudioWorkstation());
    const trackId = 'track-1';

    act(() => {
      result.current.toggleTrackMute(trackId);
    });

    const track = result.current.tracks.find(track => track.id === trackId);
    expect(track?.muted).toBe(true);

    act(() => {
      result.current.toggleTrackMute(trackId);
    });

    const unmutedTrack = result.current.tracks.find(track => track.id === trackId);
    expect(unmutedTrack?.muted).toBe(false);
  });

  it('should handle project updates', () => {
    const { result } = renderHook(() => useAudioWorkstation());
    const newProject = {
      ...result.current.currentProject,
      name: 'New Project Name',
      bpm: 140,
    };

    act(() => {
      result.current.setCurrentProject(newProject);
    });

    expect(result.current.currentProject.name).toBe('New Project Name');
    expect(result.current.currentProject.bpm).toBe(140);
  });
});