import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { X, Volume2, RotateCcw, Play, Pause } from 'lucide-react';
import { AudioTrack, TransportState } from '@/types/audio';

interface CrossFadeConfig {
  id: string;
  trackAId: string;
  trackBId: string;
  crossFadeTime: number; // Duration in seconds
  fadeInCurve: 'linear' | 'exponential' | 'logarithmic';
  fadeOutCurve: 'linear' | 'exponential' | 'logarithmic';
  startTime: number; // When the crossfade starts
  isActive: boolean;
}

interface CrossFadePanelProps {
  isOpen: boolean;
  onClose: () => void;
  tracks: AudioTrack[];
  transport: TransportState;
  onApplyCrossFade: (config: CrossFadeConfig) => void;
  selectedTracks?: string[];
}

export function CrossFadePanel({ 
  isOpen, 
  onClose, 
  tracks, 
  transport, 
  onApplyCrossFade,
  selectedTracks = []
}: CrossFadePanelProps) {
  const [trackA, setTrackA] = useState<string>('');
  const [trackB, setTrackB] = useState<string>('');
  const [crossFadeTime, setCrossFadeTime] = useState([2]); // Default 2 seconds
  const [fadeInCurve, setFadeInCurve] = useState<'linear' | 'exponential' | 'logarithmic'>('linear');
  const [fadeOutCurve, setFadeOutCurve] = useState<'linear' | 'exponential' | 'logarithmic'>('linear');
  const [startTime, setStartTime] = useState([0]);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [previewGain, setPreviewGain] = useState(0.5); // 0 = track A only, 1 = track B only

  // Auto-select tracks if they are provided
  useEffect(() => {
    if (selectedTracks.length >= 2) {
      setTrackA(selectedTracks[0]);
      setTrackB(selectedTracks[1]);
    } else if (selectedTracks.length === 1 && tracks.length >= 2) {
      setTrackA(selectedTracks[0]);
      const otherTrack = tracks.find(t => t.id !== selectedTracks[0]);
      if (otherTrack) setTrackB(otherTrack.id);
    }
  }, [selectedTracks, tracks]);

  const getTrackName = (trackId: string) => {
    const track = tracks.find(t => t.id === trackId);
    return track ? track.name : 'Unknown Track';
  };

  const getFadeCurveFunction = (curve: string, progress: number): number => {
    switch (curve) {
      case 'exponential':
        return Math.pow(progress, 2);
      case 'logarithmic':
        return Math.sqrt(progress);
      case 'linear':
      default:
        return progress;
    }
  };

  const calculateCrossFadeGain = (progress: number, isTrackA: boolean): number => {
    if (isTrackA) {
      // Track A fades out
      const fadeProgress = 1 - progress;
      return getFadeCurveFunction(fadeOutCurve, fadeProgress);
    } else {
      // Track B fades in
      return getFadeCurveFunction(fadeInCurve, progress);
    }
  };

  const handleApplyCrossFade = useCallback(() => {
    if (!trackA || !trackB) {
      return;
    }

    const config: CrossFadeConfig = {
      id: `crossfade-${Date.now()}`,
      trackAId: trackA,
      trackBId: trackB,
      crossFadeTime: crossFadeTime[0],
      fadeInCurve,
      fadeOutCurve,
      startTime: startTime[0],
      isActive: true
    };

    onApplyCrossFade(config);
    onClose();
  }, [trackA, trackB, crossFadeTime, fadeInCurve, fadeOutCurve, startTime, onApplyCrossFade, onClose]);

  const handlePreviewCrossFade = useCallback(() => {
    setIsPreviewMode(!isPreviewMode);
  }, [isPreviewMode]);

  const resetSettings = useCallback(() => {
    setCrossFadeTime([2]);
    setFadeInCurve('linear');
    setFadeOutCurve('linear');
    setStartTime([0]);
    setPreviewGain(0.5);
    setIsPreviewMode(false);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-[var(--background)] border border-[var(--border)] rounded-xl shadow-2xl w-full max-w-2xl mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--border)]">
          <div className="flex items-center space-x-3">
            <div className="w-4 h-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"></div>
            <h2 className="text-xl font-semibold text-[var(--foreground)]">Real-Time Cross Fade</h2>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={resetSettings}
              title="Reset to defaults"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Track Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--foreground)]">Track A (Fade Out)</label>
              <select
                value={trackA}
                onChange={(e) => setTrackA(e.target.value)}
                className="w-full p-2 border border-[var(--border)] rounded-md bg-[var(--background)] text-[var(--foreground)]"
              >
                <option value="">Select Track A</option>
                {tracks.map(track => (
                  <option key={track.id} value={track.id}>{track.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--foreground)]">Track B (Fade In)</label>
              <select
                value={trackB}
                onChange={(e) => setTrackB(e.target.value)}
                className="w-full p-2 border border-[var(--border)] rounded-md bg-[var(--background)] text-[var(--foreground)]"
              >
                <option value="">Select Track B</option>
                {tracks.map(track => (
                  <option key={track.id} value={track.id}>{track.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Cross Fade Duration */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-[var(--foreground)]">Cross Fade Duration</label>
              <span className="text-sm text-[var(--muted-foreground)] font-mono">
                {crossFadeTime[0].toFixed(1)}s
              </span>
            </div>
            <Slider
              value={crossFadeTime}
              onValueChange={setCrossFadeTime}
              max={10}
              min={0.1}
              step={0.1}
              className="w-full"
            />
          </div>

          {/* Start Time */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-[var(--foreground)]">Start Time</label>
              <span className="text-sm text-[var(--muted-foreground)] font-mono">
                {Math.floor(startTime[0] / 60)}:{(startTime[0] % 60).toFixed(1).padStart(4, '0')}
              </span>
            </div>
            <Slider
              value={startTime}
              onValueChange={setStartTime}
              max={300} // 5 minutes max
              min={0}
              step={0.1}
              className="w-full"
            />
          </div>

          {/* Fade Curves */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--foreground)]">Fade Out Curve</label>
              <select
                value={fadeOutCurve}
                onChange={(e) => setFadeOutCurve(e.target.value as any)}
                className="w-full p-2 border border-[var(--border)] rounded-md bg-[var(--background)] text-[var(--foreground)]"
              >
                <option value="linear">Linear</option>
                <option value="exponential">Exponential</option>
                <option value="logarithmic">Logarithmic</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--foreground)]">Fade In Curve</label>
              <select
                value={fadeInCurve}
                onChange={(e) => setFadeInCurve(e.target.value as any)}
                className="w-full p-2 border border-[var(--border)] rounded-md bg-[var(--background)] text-[var(--foreground)]"
              >
                <option value="linear">Linear</option>
                <option value="exponential">Exponential</option>
                <option value="logarithmic">Logarithmic</option>
              </select>
            </div>
          </div>

          {/* Preview Section */}
          {trackA && trackB && (
            <div className="border border-[var(--border)] rounded-lg p-4 bg-[var(--muted)]/30">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-[var(--foreground)]">Preview Cross Fade</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreviewCrossFade}
                  className="flex items-center space-x-2"
                >
                  {isPreviewMode ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                  <span>{isPreviewMode ? 'Stop' : 'Preview'}</span>
                </Button>
              </div>
              
              {/* Preview Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)]">
                  <span>{getTrackName(trackA)}</span>
                  <span>{getTrackName(trackB)}</span>
                </div>
                <Slider
                  value={[previewGain]}
                  onValueChange={(value) => setPreviewGain(value[0])}
                  max={1}
                  min={0}
                  step={0.01}
                  className="w-full"
                />
                <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)]">
                  <span>Gain A: {(calculateCrossFadeGain(previewGain, true) * 100).toFixed(0)}%</span>
                  <span>Gain B: {(calculateCrossFadeGain(previewGain, false) * 100).toFixed(0)}%</span>
                </div>
              </div>
            </div>
          )}

          {/* Visual Curve Preview */}
          {trackA && trackB && (
            <div className="border border-[var(--border)] rounded-lg p-4 bg-[var(--muted)]/30">
              <div className="text-sm font-medium text-[var(--foreground)] mb-3">Fade Curve Preview</div>
              <div className="relative h-20 bg-[var(--background)] rounded border">
                <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
                  {/* Fade out curve (Track A) */}
                  <path
                    d={`M 0,${40 - (40 * getFadeCurveFunction(fadeOutCurve, 1))} ${Array.from({ length: 100 }, (_, i) => {
                      const progress = i / 99;
                      const gain = calculateCrossFadeGain(progress, true);
                      return `L ${i},${40 - (40 * gain)}`;
                    }).join(' ')}`}
                    fill="none"
                    stroke="rgb(59, 130, 246)"
                    strokeWidth="1"
                  />
                  {/* Fade in curve (Track B) */}
                  <path
                    d={`M 0,${40 - (40 * getFadeCurveFunction(fadeInCurve, 0))} ${Array.from({ length: 100 }, (_, i) => {
                      const progress = i / 99;
                      const gain = calculateCrossFadeGain(progress, false);
                      return `L ${i},${40 - (40 * gain)}`;
                    }).join(' ')}`}
                    fill="none"
                    stroke="rgb(147, 51, 234)"
                    strokeWidth="1"
                  />
                </svg>
                <div className="absolute bottom-1 left-2 text-xs text-blue-500">Track A</div>
                <div className="absolute bottom-1 right-2 text-xs text-purple-500">Track B</div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-[var(--border)] bg-[var(--muted)]/30 rounded-b-xl">
          <div className="text-sm text-[var(--muted-foreground)]">
            {trackA && trackB 
              ? `Cross fade from "${getTrackName(trackA)}" to "${getTrackName(trackB)}"` 
              : 'Select two tracks to configure cross fade'
            }
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleApplyCrossFade}
              disabled={!trackA || !trackB}
              className="bg-gradient-to-r from-blue-500 to-purple-500 text-white"
            >
              Apply Cross Fade
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}