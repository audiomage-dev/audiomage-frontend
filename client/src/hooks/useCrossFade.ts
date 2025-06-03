import { useState, useCallback, useRef, useEffect } from 'react';
import { AudioTrack, TransportState } from '@/types/audio';

interface CrossFadeConfig {
  id: string;
  trackAId: string;
  trackBId: string;
  crossFadeTime: number;
  fadeInCurve: 'linear' | 'exponential' | 'logarithmic';
  fadeOutCurve: 'linear' | 'exponential' | 'logarithmic';
  startTime: number;
  isActive: boolean;
}

interface CrossFadeState {
  isActive: boolean;
  progress: number; // 0 to 1
  trackAGain: number;
  trackBGain: number;
  currentConfig: CrossFadeConfig | null;
}

export function useCrossFade(transport: TransportState, tracks: AudioTrack[]) {
  const [crossFadeConfigs, setCrossFadeConfigs] = useState<CrossFadeConfig[]>([]);
  const [activeCrossFades, setActiveCrossFades] = useState<Map<string, CrossFadeState>>(new Map());
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodesRef = useRef<Map<string, GainNode>>(new Map());
  const animationFrameRef = useRef<number | null>(null);

  // Initialize audio context
  useEffect(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Calculate fade curve value
  const getFadeCurveValue = useCallback((curve: string, progress: number): number => {
    const clampedProgress = Math.max(0, Math.min(1, progress));
    
    switch (curve) {
      case 'exponential':
        return Math.pow(clampedProgress, 2);
      case 'logarithmic':
        return Math.sqrt(clampedProgress);
      case 'linear':
      default:
        return clampedProgress;
    }
  }, []);

  // Calculate cross-fade gains
  const calculateCrossFadeGains = useCallback((config: CrossFadeConfig, progress: number) => {
    const trackAGain = getFadeCurveValue(config.fadeOutCurve, 1 - progress);
    const trackBGain = getFadeCurveValue(config.fadeInCurve, progress);
    
    return { trackAGain, trackBGain };
  }, [getFadeCurveValue]);

  // Apply gain to audio track
  const applyGainToTrack = useCallback((trackId: string, gain: number) => {
    const audioContext = audioContextRef.current;
    if (!audioContext) return;

    let gainNode = gainNodesRef.current.get(trackId);
    
    if (!gainNode) {
      gainNode = audioContext.createGain();
      gainNodesRef.current.set(trackId, gainNode);
    }

    // Smooth gain transition to avoid audio pops
    const currentTime = audioContext.currentTime;
    gainNode.gain.cancelScheduledValues(currentTime);
    gainNode.gain.setValueAtTime(gainNode.gain.value, currentTime);
    gainNode.gain.linearRampToValueAtTime(gain, currentTime + 0.01); // 10ms transition
  }, []);

  // Update cross-fade state based on transport time
  const updateCrossFades = useCallback(() => {
    const currentTime = transport.currentTime;
    const newActiveCrossFades = new Map<string, CrossFadeState>();

    crossFadeConfigs.forEach(config => {
      if (!config.isActive) return;

      const crossFadeStartTime = config.startTime;
      const crossFadeEndTime = config.startTime + config.crossFadeTime;

      if (currentTime >= crossFadeStartTime && currentTime <= crossFadeEndTime) {
        // Cross-fade is active
        const elapsedTime = currentTime - crossFadeStartTime;
        const progress = elapsedTime / config.crossFadeTime;
        const { trackAGain, trackBGain } = calculateCrossFadeGains(config, progress);

        const state: CrossFadeState = {
          isActive: true,
          progress,
          trackAGain,
          trackBGain,
          currentConfig: config
        };

        newActiveCrossFades.set(config.id, state);

        // Apply gains to tracks
        applyGainToTrack(config.trackAId, trackAGain);
        applyGainToTrack(config.trackBId, trackBGain);
      } else if (currentTime > crossFadeEndTime) {
        // Cross-fade completed - ensure final state
        applyGainToTrack(config.trackAId, 0);
        applyGainToTrack(config.trackBId, 1);
      } else if (currentTime < crossFadeStartTime) {
        // Before cross-fade - ensure initial state
        applyGainToTrack(config.trackAId, 1);
        applyGainToTrack(config.trackBId, 0);
      }
    });

    setActiveCrossFades(newActiveCrossFades);

    // Continue animation loop if transport is playing
    if (transport.isPlaying) {
      animationFrameRef.current = requestAnimationFrame(updateCrossFades);
    }
  }, [transport.currentTime, transport.isPlaying, crossFadeConfigs, calculateCrossFadeGains, applyGainToTrack]);

  // Start/stop cross-fade processing based on transport state
  useEffect(() => {
    if (transport.isPlaying && crossFadeConfigs.length > 0) {
      updateCrossFades();
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [transport.isPlaying, updateCrossFades]);

  // Add cross-fade configuration
  const addCrossFade = useCallback((config: CrossFadeConfig) => {
    setCrossFadeConfigs(prev => [...prev, config]);
  }, []);

  // Remove cross-fade configuration
  const removeCrossFade = useCallback((configId: string) => {
    setCrossFadeConfigs(prev => prev.filter(config => config.id !== configId));
    
    // Clean up any active cross-fade state
    setActiveCrossFades(prev => {
      const newMap = new Map(prev);
      newMap.delete(configId);
      return newMap;
    });
  }, []);

  // Update cross-fade configuration
  const updateCrossFade = useCallback((configId: string, updates: Partial<CrossFadeConfig>) => {
    setCrossFadeConfigs(prev => 
      prev.map(config => 
        config.id === configId ? { ...config, ...updates } : config
      )
    );
  }, []);

  // Get cross-fade state for a specific configuration
  const getCrossFadeState = useCallback((configId: string): CrossFadeState | null => {
    return activeCrossFades.get(configId) || null;
  }, [activeCrossFades]);

  // Get all active cross-fades
  const getActiveCrossFades = useCallback(() => {
    return Array.from(activeCrossFades.values());
  }, [activeCrossFades]);

  // Create real-time preview of cross-fade
  const previewCrossFade = useCallback((config: CrossFadeConfig, previewProgress: number) => {
    const { trackAGain, trackBGain } = calculateCrossFadeGains(config, previewProgress);
    
    // Apply preview gains temporarily
    applyGainToTrack(config.trackAId, trackAGain);
    applyGainToTrack(config.trackBId, trackBGain);

    return { trackAGain, trackBGain };
  }, [calculateCrossFadeGains, applyGainToTrack]);

  // Reset all gains to normal
  const resetAllGains = useCallback(() => {
    tracks.forEach(track => {
      applyGainToTrack(track.id, 1);
    });
  }, [tracks, applyGainToTrack]);

  // Get gain node for a track (for external audio routing)
  const getTrackGainNode = useCallback((trackId: string): GainNode | null => {
    return gainNodesRef.current.get(trackId) || null;
  }, []);

  return {
    // State
    crossFadeConfigs,
    activeCrossFades: Array.from(activeCrossFades.values()),
    
    // Actions
    addCrossFade,
    removeCrossFade,
    updateCrossFade,
    
    // Queries
    getCrossFadeState,
    getActiveCrossFades,
    getTrackGainNode,
    
    // Preview
    previewCrossFade,
    resetAllGains,
    
    // Audio context
    audioContext: audioContextRef.current
  };
}