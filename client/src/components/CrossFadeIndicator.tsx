import { useMemo } from 'react';
import { TransportState } from '@/types/audio';

interface CrossFadeConfig {
  id: string;
  trackAId: string;
  trackBId: string;
  crossFadeTime: number;
  startTime: number;
  isActive: boolean;
}

interface CrossFadeIndicatorProps {
  crossFadeConfigs: CrossFadeConfig[];
  transport: TransportState;
  timelineWidth: number;
  pixelsPerSecond: number;
  tracks: any[];
}

export function CrossFadeIndicator({ 
  crossFadeConfigs, 
  transport, 
  timelineWidth, 
  pixelsPerSecond,
  tracks 
}: CrossFadeIndicatorProps) {
  const activeCrossFades = useMemo(() => {
    return crossFadeConfigs.filter(config => config.isActive);
  }, [crossFadeConfigs]);

  const getTrackPosition = (trackId: string) => {
    const trackIndex = tracks.findIndex(track => track.id === trackId);
    return trackIndex >= 0 ? trackIndex : 0;
  };

  const getTrackName = (trackId: string) => {
    const track = tracks.find(t => t.id === trackId);
    return track ? track.name : 'Unknown';
  };

  if (activeCrossFades.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      {activeCrossFades.map(config => {
        const startX = config.startTime * pixelsPerSecond;
        const width = config.crossFadeTime * pixelsPerSecond;
        const endX = startX + width;
        
        // Skip if cross-fade is outside visible area
        if (endX < 0 || startX > timelineWidth) return null;

        const trackAIndex = getTrackPosition(config.trackAId);
        const trackBIndex = getTrackPosition(config.trackBId);
        const topTrackIndex = Math.min(trackAIndex, trackBIndex);
        const bottomTrackIndex = Math.max(trackAIndex, trackBIndex);
        
        const trackHeight = 100; // Height per track
        const top = topTrackIndex * trackHeight;
        const height = (bottomTrackIndex - topTrackIndex + 1) * trackHeight;

        // Calculate current progress if transport is within cross-fade time
        const currentTime = transport.currentTime;
        const isCurrentlyActive = currentTime >= config.startTime && currentTime <= (config.startTime + config.crossFadeTime);
        const progress = isCurrentlyActive 
          ? Math.min(1, Math.max(0, (currentTime - config.startTime) / config.crossFadeTime))
          : 0;

        return (
          <div
            key={config.id}
            className="absolute"
            style={{
              left: `${startX}px`,
              top: `${top}px`,
              width: `${width}px`,
              height: `${height}px`
            }}
          >
            {/* Cross-fade background */}
            <div 
              className={`absolute inset-0 rounded-lg border-2 transition-all duration-200 ${
                isCurrentlyActive 
                  ? 'border-purple-400 bg-purple-500/20' 
                  : 'border-purple-300 bg-purple-500/10'
              }`}
            />
            
            {/* Progress indicator */}
            {isCurrentlyActive && (
              <div 
                className="absolute top-0 bottom-0 bg-purple-500/40 transition-all duration-100"
                style={{ 
                  width: `${progress * 100}%`,
                  left: 0
                }}
              />
            )}

            {/* Fade direction arrows */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-white/90 px-2 py-1 rounded text-xs font-medium text-purple-900 shadow-sm">
                {getTrackName(config.trackAId)} → {getTrackName(config.trackBId)}
              </div>
            </div>

            {/* Time indicators */}
            <div className="absolute -top-6 left-0 text-xs text-purple-600 font-mono bg-white/80 px-1 rounded">
              {Math.floor(config.startTime / 60)}:{(config.startTime % 60).toFixed(1).padStart(4, '0')}
            </div>
            <div className="absolute -top-6 right-0 text-xs text-purple-600 font-mono bg-white/80 px-1 rounded">
              {Math.floor((config.startTime + config.crossFadeTime) / 60)}:{((config.startTime + config.crossFadeTime) % 60).toFixed(1).padStart(4, '0')}
            </div>

            {/* Duration label */}
            <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-purple-600 font-mono bg-white/80 px-1 rounded">
              {config.crossFadeTime.toFixed(1)}s
            </div>
          </div>
        );
      })}
    </div>
  );
}