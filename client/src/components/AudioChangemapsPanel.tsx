import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Volume2, 
  Music, 
  Piano, 
  Sliders, 
  Play, 
  RotateCcw, 
  Check, 
  Clock, 
  ArrowRight,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

interface AudioChange {
  id: string;
  timestamp: Date;
  action: string;
  property: string;
  oldValue: string;
  newValue: string;
  applied: boolean;
  description: string;
}

interface TrackChangemap {
  trackId: string;
  trackName: string;
  trackType: 'audio' | 'midi';
  changes: AudioChange[];
  isExpanded: boolean;
}

export function AudioChangemapsPanel() {
  const [trackChangemaps, setTrackChangemaps] = useState<TrackChangemap[]>([
    {
      trackId: '1',
      trackName: 'Lead_Vocal_take3.wav',
      trackType: 'audio',
      isExpanded: true,
      changes: [
        {
          id: 'c1',
          timestamp: new Date(Date.now() - 300000),
          action: 'Volume Adjustment',
          property: 'volume',
          oldValue: '-6.0 dB',
          newValue: '-3.2 dB',
          applied: true,
          description: 'Increased vocal level for better presence in mix'
        },
        {
          id: 'c2',
          timestamp: new Date(Date.now() - 240000),
          action: 'EQ Applied',
          property: 'eq.highShelf',
          oldValue: '0.0 dB @ 8kHz',
          newValue: '+2.5 dB @ 8kHz',
          applied: true,
          description: 'High-shelf boost for vocal clarity'
        },
        {
          id: 'c3',
          timestamp: new Date(Date.now() - 120000),
          action: 'Compressor Added',
          property: 'compressor',
          oldValue: 'None',
          newValue: 'Ratio: 3:1, Attack: 5ms',
          applied: false,
          description: 'Dynamic control for consistent vocal level'
        }
      ]
    },
    {
      trackId: '2',
      trackName: 'Drums_Master.wav',
      trackType: 'audio',
      isExpanded: false,
      changes: [
        {
          id: 'c4',
          timestamp: new Date(Date.now() - 180000),
          action: 'Gate Applied',
          property: 'gate.threshold',
          oldValue: 'None',
          newValue: '-35 dB',
          applied: true,
          description: 'Noise gate to clean up drum bleed'
        },
        {
          id: 'c5',
          timestamp: new Date(Date.now() - 90000),
          action: 'Send Level',
          property: 'send.reverb',
          oldValue: '0%',
          newValue: '15%',
          applied: false,
          description: 'Send to reverb bus for ambient space'
        }
      ]
    },
    {
      trackId: '3',
      trackName: 'Piano_Chords.mid',
      trackType: 'midi',
      isExpanded: false,
      changes: [
        {
          id: 'c6',
          timestamp: new Date(Date.now() - 360000),
          action: 'Velocity Adjustment',
          property: 'velocity',
          oldValue: '90-110',
          newValue: '75-95',
          applied: true,
          description: 'Reduced velocity for more subtle piano dynamics'
        }
      ]
    }
  ]);

  const toggleTrackExpansion = (trackId: string) => {
    setTrackChangemaps(prev => prev.map(track => 
      track.trackId === trackId 
        ? { ...track, isExpanded: !track.isExpanded }
        : track
    ));
  };

  const applyChange = (trackId: string, changeId: string) => {
    setTrackChangemaps(prev => prev.map(track => 
      track.trackId === trackId 
        ? {
            ...track,
            changes: track.changes.map(change => 
              change.id === changeId 
                ? { ...change, applied: true }
                : change
            )
          }
        : track
    ));
  };

  const revertChange = (trackId: string, changeId: string) => {
    setTrackChangemaps(prev => prev.map(track => 
      track.trackId === trackId 
        ? {
            ...track,
            changes: track.changes.map(change => 
              change.id === changeId 
                ? { ...change, applied: false }
                : change
            )
          }
        : track
    ));
  };

  const getTrackIcon = (trackType: 'audio' | 'midi') => {
    return trackType === 'audio' ? <Volume2 className="w-4 h-4" /> : <Piano className="w-4 h-4" />;
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - timestamp.getTime()) / 1000);
    
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const totalChanges = trackChangemaps.reduce((sum, track) => sum + track.changes.length, 0);
  const appliedChanges = trackChangemaps.reduce((sum, track) => 
    sum + track.changes.filter(c => c.applied).length, 0
  );
  const pendingChanges = totalChanges - appliedChanges;

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-[var(--foreground)]">Audio Changemaps</h3>
        <div className="text-xs text-[var(--muted-foreground)]">
          {appliedChanges}/{totalChanges} applied • {pendingChanges} pending
        </div>
      </div>

      {/* Summary stats */}
      <div className="mb-4 p-2 bg-[var(--secondary)] rounded-md">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-[var(--green)] rounded-full"></div>
            <span className="text-[var(--muted-foreground)]">Applied: {appliedChanges}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-[var(--yellow)] rounded-full"></div>
            <span className="text-[var(--muted-foreground)]">Pending: {pendingChanges}</span>
          </div>
        </div>
      </div>

      {/* Track changemaps */}
      <div className="space-y-2">
        {trackChangemaps.map((track) => (
          <div key={track.trackId} className="border border-[var(--border)] rounded-md">
            {/* Track header */}
            <div 
              className="p-3 cursor-pointer hover:bg-[var(--accent)] transition-colors"
              onClick={() => toggleTrackExpansion(track.trackId)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {track.isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-[var(--muted-foreground)]" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-[var(--muted-foreground)]" />
                  )}
                  {getTrackIcon(track.trackType)}
                  <span className="text-sm font-medium text-[var(--foreground)] truncate">
                    {track.trackName}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-[var(--muted-foreground)]">
                    {track.changes.length} changes
                  </span>
                  <div className="flex space-x-1">
                    <div className={`w-2 h-2 rounded-full ${
                      track.changes.some(c => c.applied) ? 'bg-[var(--green)]' : 'bg-[var(--muted-foreground)]'
                    }`}></div>
                    <div className={`w-2 h-2 rounded-full ${
                      track.changes.some(c => !c.applied) ? 'bg-[var(--yellow)]' : 'bg-[var(--muted-foreground)]'
                    }`}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Changes list */}
            {track.isExpanded && (
              <div className="border-t border-[var(--border)]">
                {track.changes.map((change, index) => (
                  <div key={change.id} className="p-3 border-b border-[var(--border)] last:border-b-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${
                          change.applied ? 'bg-[var(--green)]' : 'bg-[var(--yellow)]'
                        }`}></div>
                        <span className="text-xs font-medium text-[var(--foreground)]">
                          {change.action}
                        </span>
                        <span className="text-xs text-[var(--muted-foreground)]">
                          {formatTimestamp(change.timestamp)}
                        </span>
                      </div>
                      <div className="flex space-x-1">
                        {!change.applied ? (
                          <Button
                            size="sm"
                            onClick={() => applyChange(track.trackId, change.id)}
                            className="h-5 w-5 p-0 bg-[var(--green)] hover:bg-[var(--green)]/80"
                            title="Apply change"
                          >
                            <Check className="w-3 h-3" />
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => revertChange(track.trackId, change.id)}
                            className="h-5 w-5 p-0"
                            title="Revert change"
                          >
                            <RotateCcw className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-xs text-[var(--muted-foreground)] mb-2">
                      {change.description}
                    </div>
                    
                    <div className="flex items-center space-x-2 text-xs">
                      <span className="px-2 py-1 bg-[var(--muted)] rounded text-[var(--muted-foreground)]">
                        {change.oldValue}
                      </span>
                      <ArrowRight className="w-3 h-3 text-[var(--muted-foreground)]" />
                      <span className="px-2 py-1 bg-[var(--primary)] text-[var(--primary-foreground)] rounded">
                        {change.newValue}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="mt-4 pt-3 border-t border-[var(--border)] space-y-2">
        <Button size="sm" variant="outline" className="w-full text-xs">
          <Play className="w-3 h-3 mr-2" />
          Apply All Pending Changes
        </Button>
        <Button size="sm" variant="outline" className="w-full text-xs">
          <Clock className="w-3 h-3 mr-2" />
          Create Snapshot
        </Button>
      </div>
    </div>
  );
}