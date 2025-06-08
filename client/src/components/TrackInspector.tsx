import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { AudioTrack, AudioEffect } from '../types/audio';
import { 
  Volume2, 
  VolumeX, 
  Radio, 
  Circle,
  Settings,
  Plus,
  Minus,
  RotateCcw,
  Sliders,
  Mic,
  Headphones,
  Filter,
  Zap,
  BarChart3,
  Music,
  X,
  Eye,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

// WaveformDisplay component for visualizing audio waveforms
interface WaveformDisplayProps {
  track: AudioTrack;
}

function WaveformDisplay({ track }: WaveformDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number; time: number; amplitude: number } | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<{ time: number; amplitude: number; dbLevel: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !track.clips || track.clips.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // Clear canvas
    ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

    // Generate realistic waveform based on audio characteristics
    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;
    const centerY = height / 2;
    
    // Create gradient for waveform
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, 'rgba(94, 129, 172, 0.8)');
    gradient.addColorStop(0.5, 'rgba(94, 129, 172, 1)');
    gradient.addColorStop(1, 'rgba(94, 129, 172, 0.8)');
    
    ctx.fillStyle = gradient;
    ctx.strokeStyle = 'rgba(94, 129, 172, 0.9)';
    ctx.lineWidth = 1;

    // Draw waveform based on track content
    const samples = 200;
    const sampleWidth = width / samples;
    
    ctx.beginPath();
    ctx.moveTo(0, centerY);

    for (let i = 0; i < samples; i++) {
      const x = i * sampleWidth;
      
      // Generate waveform amplitude based on track characteristics
      let amplitude = 0;
      
      // Base amplitude influenced by track volume and content
      const baseAmplitude = (track.volume || 80) / 100 * 0.6;
      
      // Add frequency-based variation
      const frequency = Math.sin(i * 0.05) * 0.3 + Math.sin(i * 0.02) * 0.2;
      
      // Add some randomness for realistic look
      const noise = (Math.random() - 0.5) * 0.1;
      
      amplitude = baseAmplitude * (0.7 + frequency + noise);
      
      // Ensure amplitude doesn't exceed reasonable bounds
      amplitude = Math.max(0, Math.min(1, amplitude));
      
      const waveHeight = amplitude * (height * 0.4);
      
      // Draw positive waveform
      ctx.lineTo(x, centerY - waveHeight);
    }

    // Complete the waveform path
    for (let i = samples - 1; i >= 0; i--) {
      const x = i * sampleWidth;
      const baseAmplitude = (track.volume || 80) / 100 * 0.6;
      const frequency = Math.sin(i * 0.05) * 0.3 + Math.sin(i * 0.02) * 0.2;
      const noise = (Math.random() - 0.5) * 0.1;
      const amplitude = Math.max(0, Math.min(1, baseAmplitude * (0.7 + frequency + noise)));
      const waveHeight = amplitude * (height * 0.4);
      
      ctx.lineTo(x, centerY + waveHeight);
    }

    ctx.closePath();
    ctx.fill();

    // Add center line
    ctx.strokeStyle = 'rgba(94, 129, 172, 0.3)';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(width, centerY);
    ctx.stroke();

  }, [track]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Convert mouse position to time and amplitude
    const time = (x / canvas.offsetWidth) * 4; // 0-4 seconds
    const centerY = canvas.offsetHeight / 2;
    const amplitude = (centerY - y) / centerY; // -1 to 1 range

    setMousePosition({ x, y, time, amplitude });
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const time = (x / canvas.offsetWidth) * 4;
    const centerY = canvas.offsetHeight / 2;
    const amplitude = (centerY - y) / centerY;
    
    // Convert amplitude to dB level (simplified calculation)
    const dbLevel = amplitude > 0 ? 20 * Math.log10(Math.abs(amplitude)) : -60;

    setSelectedPoint({ time, amplitude, dbLevel });
  };

  const formatAmplitude = (amp: number): string => {
    return `${(amp * 100).toFixed(1)}%`;
  };

  const formatDbLevel = (db: number): string => {
    if (db <= -60) return '-∞dB';
    return `${db.toFixed(1)}dB`;
  };

  return (
    <div className="w-full h-full relative">
      <canvas 
        ref={canvasRef}
        className="w-full h-full cursor-crosshair"
        style={{ width: '100%', height: '100%' }}
        onMouseMove={handleMouseMove}
        onClick={handleClick}
        onMouseLeave={() => setMousePosition(null)}
      />
      
      {/* Crosshair overlay */}
      {mousePosition && (
        <>
          <div 
            className="absolute border-l border-blue-400/60 pointer-events-none"
            style={{ 
              left: mousePosition.x,
              top: 0,
              height: '100%'
            }}
          />
          <div 
            className="absolute border-t border-blue-400/60 pointer-events-none"
            style={{ 
              top: mousePosition.y,
              left: 0,
              width: '100%'
            }}
          />
        </>
      )}
      
      {/* Tooltip */}
      {mousePosition && (
        <div 
          className="absolute bg-black/80 text-white text-xs px-2 py-1 rounded pointer-events-none z-10"
          style={{ 
            left: Math.min(mousePosition.x + 10, 200),
            top: Math.max(mousePosition.y - 30, 5)
          }}
        >
          <div>{mousePosition.time.toFixed(3)}s</div>
          <div>{formatAmplitude(mousePosition.amplitude)}</div>
        </div>
      )}
      
      {/* Selected point info */}
      {selectedPoint && (
        <div className="absolute bottom-2 left-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
          <div>Time: {selectedPoint.time.toFixed(3)}s</div>
          <div>Amplitude: {formatAmplitude(selectedPoint.amplitude)}</div>
          <div>Level: {formatDbLevel(selectedPoint.dbLevel)}</div>
        </div>
      )}
      
      <div className="absolute top-2 right-2 text-xs text-white bg-black/50 px-2 py-1 rounded">
        Interactive Waveform
      </div>
    </div>
  );
}

// SpectrogramDisplay component for frequency domain visualization
interface SpectrogramDisplayProps {
  track: AudioTrack;
}

function SpectrogramDisplay({ track }: SpectrogramDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number; frequency: number; time: number } | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<{ frequency: number; time: number; magnitude: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !track.clips || track.clips.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // Clear canvas
    ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;
    
    // Create spectrogram visualization
    const timeSlices = 150;
    const frequencyBins = 64;
    const sliceWidth = width / timeSlices;
    const binHeight = height / frequencyBins;

    // Generate frequency spectrum data based on track characteristics
    for (let t = 0; t < timeSlices; t++) {
      for (let f = 0; f < frequencyBins; f++) {
        const x = t * sliceWidth;
        const y = height - (f * binHeight);
        
        // Generate frequency magnitude based on track content and frequency
        const trackVolume = (track.volume || 80) / 100;
        const frequency = (f / frequencyBins) * 22050; // Map to 0-22kHz
        
        // Simulate different frequency content based on track characteristics
        let magnitude = 0;
        
        // Low frequencies (bass content)
        if (frequency < 250) {
          magnitude = trackVolume * (0.8 + Math.sin(t * 0.1) * 0.3);
        }
        // Mid frequencies (vocals, instruments)
        else if (frequency < 4000) {
          magnitude = trackVolume * (0.6 + Math.sin(t * 0.05 + f * 0.02) * 0.4);
        }
        // High frequencies (cymbals, harmonics)
        else {
          magnitude = trackVolume * (0.3 + Math.sin(t * 0.08 + f * 0.01) * 0.2) * (1 - frequency / 22050);
        }
        
        // Add temporal variation
        magnitude *= (0.7 + Math.sin(t * 0.03) * 0.3);
        
        // Add some randomness for realistic look
        magnitude += (Math.random() - 0.5) * 0.1;
        magnitude = Math.max(0, Math.min(1, magnitude));
        
        // Color mapping based on magnitude
        const hue = 240 - (magnitude * 60); // Blue to cyan to yellow
        const saturation = 70 + (magnitude * 30);
        const lightness = 20 + (magnitude * 60);
        
        ctx.fillStyle = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
        ctx.fillRect(x, y, sliceWidth + 1, binHeight + 1);
      }
    }

    // Add frequency scale labels
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = '8px monospace';
    const freqLabels = ['20kHz', '10kHz', '5kHz', '2kHz', '1kHz', '500Hz', '250Hz', '100Hz', '50Hz'];
    freqLabels.forEach((label, i) => {
      const y = (i / (freqLabels.length - 1)) * height;
      ctx.fillText(label, 4, y + 3);
    });

    // Add time scale
    const timeLabels = ['0s', '1s', '2s', '3s'];
    timeLabels.forEach((label, i) => {
      const x = (i / (timeLabels.length - 1)) * (width - 30) + 15;
      ctx.fillText(label, x, height - 4);
    });

  }, [track]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Convert mouse position to frequency and time
    const frequency = ((canvas.offsetHeight - y) / canvas.offsetHeight) * 22050; // 0-22kHz
    const time = (x / canvas.offsetWidth) * 4; // 0-4 seconds

    setMousePosition({ x, y, frequency, time });
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const frequency = ((canvas.offsetHeight - y) / canvas.offsetHeight) * 22050;
    const time = (x / canvas.offsetWidth) * 4;
    
    // Calculate magnitude at this point (simplified simulation)
    const trackVolume = (track.volume || 80) / 100;
    let magnitude = 0;
    
    if (frequency < 250) {
      magnitude = trackVolume * (0.8 + Math.sin(time * 10) * 0.3);
    } else if (frequency < 4000) {
      magnitude = trackVolume * (0.6 + Math.sin(time * 5 + frequency * 0.002) * 0.4);
    } else {
      magnitude = trackVolume * (0.3 + Math.sin(time * 8 + frequency * 0.001) * 0.2) * (1 - frequency / 22050);
    }
    
    magnitude = Math.max(0, Math.min(1, magnitude));

    setSelectedPoint({ frequency, time, magnitude });
  };

  const formatFrequency = (freq: number): string => {
    if (freq >= 1000) {
      return `${(freq / 1000).toFixed(1)}kHz`;
    }
    return `${freq.toFixed(0)}Hz`;
  };

  return (
    <div className="w-full h-full relative">
      <canvas 
        ref={canvasRef}
        className="w-full h-full cursor-crosshair"
        style={{ width: '100%', height: '100%' }}
        onMouseMove={handleMouseMove}
        onClick={handleClick}
        onMouseLeave={() => setMousePosition(null)}
      />
      
      {/* Crosshair overlay */}
      {mousePosition && (
        <>
          <div 
            className="absolute border-l border-white/60 pointer-events-none"
            style={{ 
              left: mousePosition.x,
              top: 0,
              height: '100%'
            }}
          />
          <div 
            className="absolute border-t border-white/60 pointer-events-none"
            style={{ 
              top: mousePosition.y,
              left: 0,
              width: '100%'
            }}
          />
        </>
      )}
      
      {/* Tooltip */}
      {mousePosition && (
        <div 
          className="absolute bg-black/80 text-white text-xs px-2 py-1 rounded pointer-events-none z-10"
          style={{ 
            left: Math.min(mousePosition.x + 10, 200),
            top: Math.max(mousePosition.y - 30, 5)
          }}
        >
          <div>{formatFrequency(mousePosition.frequency)}</div>
          <div>{mousePosition.time.toFixed(2)}s</div>
        </div>
      )}
      
      {/* Selected point info */}
      {selectedPoint && (
        <div className="absolute bottom-2 left-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
          <div>Selected: {formatFrequency(selectedPoint.frequency)}</div>
          <div>Time: {selectedPoint.time.toFixed(2)}s</div>
          <div>Magnitude: {(selectedPoint.magnitude * 100).toFixed(1)}%</div>
        </div>
      )}
      
      <div className="absolute top-2 right-2 text-xs text-white bg-black/50 px-2 py-1 rounded">
        Interactive Spectrogram
      </div>
    </div>
  );
}

interface TrackInspectorProps {
  track: AudioTrack;
  onTrackMute: (trackId: string) => void;
  onTrackSolo: (trackId: string) => void;
  onClose: () => void;
}

export function TrackInspector({ track, onTrackMute, onTrackSolo, onClose }: TrackInspectorProps) {
  const [activeTab, setActiveTab] = useState<'mixer' | 'effects' | 'eq' | 'sends' | 'wavelets'>('mixer');
  const [expandedEffects, setExpandedEffects] = useState<string[]>([]);
  const [visualizationMode, setVisualizationMode] = useState<'waveform' | 'spectrogram'>('waveform');
  const [waveletData, setWaveletData] = useState<any>(null);
  const [isExtractingWavelets, setIsExtractingWavelets] = useState(false);
  const [allWavelets, setAllWavelets] = useState<any[]>([]);
  const [playingWavelet, setPlayingWavelet] = useState<string | null>(null);

  const toggleEffect = (effectId: string) => {
    setExpandedEffects(prev => 
      prev.includes(effectId) 
        ? prev.filter(id => id !== effectId)
        : [...prev, effectId]
    );
  };

  // Wavelet extraction function using Haar wavelets
  const extractWavelets = async () => {
    setIsExtractingWavelets(true);
    
    try {
      // Simulate wavelet extraction process
      console.log('Starting wavelet extraction for track:', track.name);
      
      // Generate sample audio data based on track characteristics
      const sampleRate = 44100;
      const duration = 2; // 2 seconds
      const samples = sampleRate * duration;
      const audioData = new Float32Array(samples);
      
      // Create synthetic audio signal based on track properties
      const frequency = track.name.toLowerCase().includes('bass') ? 80 : 
                       track.name.toLowerCase().includes('vocal') ? 440 : 
                       track.name.toLowerCase().includes('drum') ? 200 : 330;
      
      for (let i = 0; i < samples; i++) {
        const t = i / sampleRate;
        audioData[i] = Math.sin(2 * Math.PI * frequency * t) * 
                      Math.exp(-t * 2) * // Decay envelope
                      (track.volume || 80) / 100;
      }
      
      // Perform Haar wavelet decomposition
      const waveletLevels = 6;
      const coefficients = [];
      let currentData = Array.from(audioData);
      
      for (let level = 0; level < waveletLevels; level++) {
        const length = currentData.length;
        const approximation = new Array(Math.floor(length / 2));
        const detail = new Array(Math.floor(length / 2));
        
        // Haar wavelet transform
        for (let i = 0; i < Math.floor(length / 2); i++) {
          const evenSample = currentData[2 * i] || 0;
          const oddSample = currentData[2 * i + 1] || 0;
          
          approximation[i] = (evenSample + oddSample) / Math.sqrt(2);
          detail[i] = (evenSample - oddSample) / Math.sqrt(2);
        }
        
        coefficients.push({
          level: level + 1,
          approximation: approximation.slice(),
          detail: detail.slice(),
          energy: detail.reduce((sum, val) => sum + val * val, 0),
          maxCoeff: Math.max(...detail.map(Math.abs)),
          frequency: `${(sampleRate / Math.pow(2, level + 2)).toFixed(0)}-${(sampleRate / Math.pow(2, level + 1)).toFixed(0)}Hz`
        });
        
        currentData = approximation;
      }
      
      // Calculate wavelet statistics
      const totalEnergy = coefficients.reduce((sum, level) => sum + level.energy, 0);
      const dominantLevel = coefficients.reduce((prev, curr) => 
        curr.energy > prev.energy ? curr : prev, coefficients[0]);
      
      const waveletResults = {
        trackName: track.name,
        extractionTime: new Date().toISOString(),
        sampleRate,
        duration,
        coefficients,
        statistics: {
          totalEnergy: totalEnergy.toFixed(3),
          dominantLevel: dominantLevel.level,
          dominantFrequency: dominantLevel.frequency,
          compressionRatio: (coefficients.reduce((sum, level) => 
            sum + level.detail.filter(c => Math.abs(c) > 0.1).length, 0) / samples * 100).toFixed(1)
        }
      };
      
      setWaveletData(waveletResults);
      
      // Add to all wavelets collection
      const waveletEntry = {
        id: `wavelet_${Date.now()}`,
        trackName: track.name,
        trackId: track.id,
        extractionTime: waveletResults.extractionTime,
        data: waveletResults
      };
      
      setAllWavelets(prev => [waveletEntry, ...prev]);
      console.log('Wavelet extraction completed:', waveletResults);
      
    } catch (error) {
      console.error('Error during wavelet extraction:', error);
    } finally {
      setIsExtractingWavelets(false);
    }
  };

  // Function to play wavelet reconstruction
  const playWaveletAudio = async (waveletEntry: any) => {
    setPlayingWavelet(waveletEntry.id);
    
    try {
      // Create audio context
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Reconstruct audio from wavelet coefficients
      const coefficients = waveletEntry.data.coefficients;
      const sampleRate = waveletEntry.data.sampleRate;
      const duration = waveletEntry.data.duration;
      const samples = sampleRate * duration;
      
      // Inverse wavelet transform (simplified reconstruction)
      let reconstructed = new Float32Array(samples);
      
      // Start with the final approximation coefficients
      let currentLevel = coefficients[coefficients.length - 1].approximation;
      
      // Reconstruct level by level
      for (let level = coefficients.length - 1; level >= 0; level--) {
        const detail = coefficients[level].detail;
        const newLength = Math.min(currentLevel.length * 2, samples);
        const newLevel = new Float32Array(newLength);
        
        // Inverse Haar transform
        for (let i = 0; i < Math.floor(newLength / 2); i++) {
          const approx = currentLevel[i] || 0;
          const det = detail[i] || 0;
          
          newLevel[2 * i] = (approx + det) / Math.sqrt(2);
          newLevel[2 * i + 1] = (approx - det) / Math.sqrt(2);
        }
        
        currentLevel = newLevel;
      }
      
      // Copy to final buffer
      for (let i = 0; i < Math.min(reconstructed.length, currentLevel.length); i++) {
        reconstructed[i] = currentLevel[i] * 0.3; // Reduce volume
      }
      
      // Create audio buffer
      const audioBuffer = audioContext.createBuffer(1, reconstructed.length, sampleRate);
      audioBuffer.copyToChannel(reconstructed, 0);
      
      // Play the audio
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      source.start();
      
      // Stop playing indicator after duration
      setTimeout(() => {
        setPlayingWavelet(null);
      }, duration * 1000);
      
    } catch (error) {
      console.error('Error playing wavelet audio:', error);
      setPlayingWavelet(null);
    }
  };

  const tabs = [
    { id: 'mixer', label: 'Mixer', icon: Sliders },
    { id: 'effects', label: 'Effects', icon: Zap },
    { id: 'eq', label: 'EQ', icon: BarChart3 },
    { id: 'sends', label: 'Sends', icon: Radio },
    { id: 'wavelets', label: 'Wavelets', icon: () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h6l3-9 6 18 3-9h3" /></svg> }
  ];

  return (
    <div className="min-h-64 bg-[var(--background)] border-t border-[var(--border)] flex flex-col">
      {/* Header */}
      <div className="flex-none h-10 bg-[var(--muted)] border-b border-[var(--border)] px-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div 
            className="w-3 h-3 rounded-sm"
            style={{ backgroundColor: track.color }}
          />
          <span className="text-sm font-medium">{track.name}</span>
          <span className="text-xs text-[var(--muted-foreground)] px-2 py-1 bg-[var(--secondary)] rounded">
            {track.type.toUpperCase()}
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Tab Navigation */}
          <div className="flex space-x-1">
            {tabs.map(({ id, label, icon: Icon }) => (
              <Button
                key={id}
                variant={activeTab === id ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab(id as any)}
                className="h-7 px-2 text-xs"
              >
                <Icon className="w-3 h-3 mr-1" />
                {label}
              </Button>
            ))}
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-7 w-7 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'mixer' && (
          <div className="flex flex-col lg:flex-row min-h-full">
            {/* Channel Strip */}
            <div className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r border-[var(--border)] p-4 flex-shrink-0">
              <div className="space-y-4">
                {/* Input Section */}
                <div>
                  <h4 className="text-xs font-medium text-[var(--muted-foreground)] mb-2">Input</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs">Gain</span>
                      <span className="text-xs font-mono">+2.3dB</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      defaultValue="60"
                      className="w-full h-1 bg-[var(--muted)] rounded-lg"
                    />
                  </div>
                </div>

                {/* Volume Fader */}
                <div>
                  <h4 className="text-xs font-medium text-[var(--muted-foreground)] mb-2">Volume</h4>
                  <div className="flex items-center space-x-3">
                    <div className="flex-1">
                      <div className="range-with-centerline">
                        <input 
                          type="range" 
                          min="0" 
                          max="100" 
                          defaultValue={track.volume.toString()}
                          className="w-full h-2 bg-[var(--muted)] rounded-lg"
                        />
                      </div>
                      <div className="flex justify-between text-xs text-[var(--muted-foreground)] mt-1">
                        <span>-∞</span>
                        <span>0</span>
                        <span>+6</span>
                      </div>
                    </div>
                    <div className="text-xs font-mono">{track.volume}%</div>
                  </div>
                </div>

                {/* Pan Control */}
                <div>
                  <h4 className="text-xs font-medium text-[var(--muted-foreground)] mb-2">Pan</h4>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs">L</span>
                    <div className="flex-1 range-with-centerline">
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        defaultValue={track.pan.toString()}
                        className="w-full h-1 bg-[var(--muted)] rounded-lg"
                      />
                    </div>
                    <span className="text-xs">R</span>
                    <span className="text-xs font-mono w-8 text-center">
                      {track.pan === 50 ? 'C' : track.pan < 50 ? `L${50 - track.pan}` : `R${track.pan - 50}`}
                    </span>
                  </div>
                </div>

                {/* Mute/Solo */}
                <div className="flex space-x-2">
                  <Button
                    onClick={() => onTrackMute(track.id)}
                    variant={track.muted ? "destructive" : "outline"}
                    size="sm"
                    className="flex-1"
                  >
                    {track.muted ? <VolumeX className="w-4 h-4 mr-1" /> : <Volume2 className="w-4 h-4 mr-1" />}
                    Mute
                  </Button>
                  <Button
                    onClick={() => onTrackSolo(track.id)}
                    variant={track.soloed ? "default" : "outline"}
                    size="sm"
                    className="flex-1"
                  >
                    {track.soloed ? <Radio className="w-4 h-4 mr-1" /> : <Circle className="w-4 h-4 mr-1" />}
                    Solo
                  </Button>
                </div>
              </div>
            </div>

            {/* Level Meters */}
            <div className="w-full lg:w-20 border-b lg:border-b-0 lg:border-r border-[var(--border)] p-2 flex-shrink-0">
              <h4 className="text-xs font-medium text-[var(--muted-foreground)] mb-2 text-center">Levels</h4>
              <div className="flex justify-center space-x-1">
                <div className="flex flex-col items-center">
                  <div className="text-xs mb-1">L</div>
                  <div className="h-32 w-3 bg-[var(--muted)] rounded-sm relative overflow-hidden">
                    <div className="absolute bottom-0 w-full bg-gradient-to-t from-[var(--green)] via-[var(--yellow)] to-[var(--red)] h-3/4 rounded-sm"></div>
                  </div>
                  <div className="text-xs mt-1 font-mono">-6</div>
                </div>
                <div className="flex flex-col items-center">
                  <div className="text-xs mb-1">R</div>
                  <div className="h-32 w-3 bg-[var(--muted)] rounded-sm relative overflow-hidden">
                    <div className="absolute bottom-0 w-full bg-gradient-to-t from-[var(--green)] via-[var(--yellow)] to-[var(--red)] h-2/3 rounded-sm"></div>
                  </div>
                  <div className="text-xs mt-1 font-mono">-8</div>
                </div>
              </div>
            </div>

            {/* Waveform/Spectrogram Display */}
            <div className="flex-1 p-4 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] flex items-center space-x-1"
                    onClick={() => setVisualizationMode(prev => prev === 'waveform' ? 'spectrogram' : 'waveform')}
                  >
                    <BarChart3 className="w-3 h-3" />
                    <span>{visualizationMode === 'waveform' ? 'Waveform' : 'Spectrogram'}</span>
                    <ChevronDown className="w-3 h-3" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-6 px-2 text-xs font-medium hover:bg-[var(--accent)] flex items-center space-x-1"
                    onClick={extractWavelets}
                    disabled={track.type !== 'audio' || !track.clips || track.clips.length === 0 || isExtractingWavelets}
                  >
                    {isExtractingWavelets ? (
                      <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 12a9 9 0 11-6.219-8.56" />
                      </svg>
                    ) : (
                      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 12h6l3-9 6 18 3-9h3" />
                      </svg>
                    )}
                    <span>{isExtractingWavelets ? 'Extracting...' : 'Extract Wavelets'}</span>
                  </Button>
                </div>
                
                <div className="text-xs text-[var(--muted-foreground)]">
                  {visualizationMode === 'waveform' ? 'Time Domain' : 'Frequency Domain'}
                </div>
              </div>
              <div className="h-32 bg-[var(--muted)] rounded-md flex items-center justify-center relative overflow-hidden">
                {track.type === 'audio' && track.clips && track.clips.length > 0 ? (
                  visualizationMode === 'waveform' ? (
                    <WaveformDisplay track={track} />
                  ) : (
                    <SpectrogramDisplay track={track} />
                  )
                ) : track.type === 'midi' ? (
                  <div className="text-center text-[var(--muted-foreground)]">
                    <Music className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <div className="text-xs">MIDI Track</div>
                    <div className="text-xs opacity-70">No {visualizationMode} for MIDI</div>
                  </div>
                ) : (
                  <div className="text-center text-[var(--muted-foreground)]">
                    <BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <div className="text-xs">No audio data</div>
                  </div>
                )}
              </div>
              
              {/* Wavelet Analysis Results */}
              {waveletData && (
                <div className="mt-4 p-3 bg-[var(--muted)] rounded-md">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="text-xs font-medium">Wavelet Analysis</h5>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-5 w-5 p-0"
                      onClick={() => setWaveletData(null)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 text-xs mb-3">
                    <div>
                      <div className="text-[var(--muted-foreground)]">Total Energy</div>
                      <div className="font-mono">{waveletData.statistics.totalEnergy}</div>
                    </div>
                    <div>
                      <div className="text-[var(--muted-foreground)]">Dominant Level</div>
                      <div className="font-mono">Level {waveletData.statistics.dominantLevel}</div>
                    </div>
                    <div>
                      <div className="text-[var(--muted-foreground)]">Dominant Freq</div>
                      <div className="font-mono">{waveletData.statistics.dominantFrequency}</div>
                    </div>
                    <div>
                      <div className="text-[var(--muted-foreground)]">Compression</div>
                      <div className="font-mono">{waveletData.statistics.compressionRatio}%</div>
                    </div>
                  </div>
                  
                  {/* Wavelet Coefficients Visualization */}
                  <div className="space-y-1">
                    <div className="text-xs text-[var(--muted-foreground)] mb-1">Coefficient Levels</div>
                    {waveletData.coefficients.map((level: any, index: number) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div className="w-8 text-xs font-mono">L{level.level}</div>
                        <div className="flex-1 h-2 bg-[var(--background)] rounded-sm overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-sm"
                            style={{ 
                              width: `${Math.min(100, (level.energy / Math.max(...waveletData.coefficients.map((c: any) => c.energy))) * 100)}%` 
                            }}
                          />
                        </div>
                        <div className="w-16 text-xs font-mono text-right">{level.frequency}</div>
                        <div className="w-12 text-xs font-mono text-right">{level.energy.toFixed(2)}</div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-2 text-xs text-[var(--muted-foreground)]">
                    Extracted {new Date(waveletData.extractionTime).toLocaleTimeString()}
                  </div>
                </div>
              )}
              
              {/* Audio Analysis */}
              <div className="mt-4 grid grid-cols-2 gap-4 text-xs">
                <div>
                  <div className="text-[var(--muted-foreground)]">Peak</div>
                  <div className="font-mono text-[var(--yellow)]">-2.1dBFS</div>
                </div>
                <div>
                  <div className="text-[var(--muted-foreground)]">RMS</div>
                  <div className="font-mono text-[var(--green)]">-12.4dB</div>
                </div>
                <div>
                  <div className="text-[var(--muted-foreground)]">Duration</div>
                  <div className="font-mono">3:24.560</div>
                </div>
                <div>
                  <div className="text-[var(--muted-foreground)]">Sample Rate</div>
                  <div className="font-mono">48kHz</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'effects' && (
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-medium">Effects Chain</h4>
              <Button size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-1" />
                Add Effect
              </Button>
            </div>
            
            <div className="space-y-2">
              {track.effects?.length > 0 ? (
                track.effects.map((effect) => (
                  <div key={`track-${track.id}-effect-${effect.id}`} className="border border-[var(--border)] rounded-md">
                    <div 
                      className="p-3 cursor-pointer hover:bg-[var(--accent)] flex items-center justify-between"
                      onClick={() => toggleEffect(effect.id)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-2 h-2 rounded-full ${effect.enabled ? 'bg-[var(--green)]' : 'bg-[var(--muted-foreground)]'}`} />
                        <span className="text-sm font-medium">{effect.name}</span>
                        <span className="text-xs text-[var(--muted-foreground)] px-2 py-1 bg-[var(--secondary)] rounded">
                          {effect.type}
                        </span>
                      </div>
                      {expandedEffects.includes(effect.id) ? 
                        <ChevronDown className="w-4 h-4" /> : 
                        <ChevronRight className="w-4 h-4" />
                      }
                    </div>
                    
                    {expandedEffects.includes(effect.id) && (
                      <div className="p-3 border-t border-[var(--border)] bg-[var(--muted)]/30">
                        <div className="grid grid-cols-2 gap-4">
                          {Object.entries(effect.parameters).map(([param, value]) => (
                            <div key={param}>
                              <div className="text-xs text-[var(--muted-foreground)] mb-1 capitalize">
                                {param.replace(/([A-Z])/g, ' $1').trim()}
                              </div>
                              <input 
                                type="range" 
                                min="0" 
                                max="100" 
                                defaultValue={value.toString()}
                                className="w-full h-1 bg-[var(--muted)] rounded-lg"
                              />
                              <div className="text-xs font-mono mt-1">{value}%</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-[var(--muted-foreground)]">
                  <Filter className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <div className="text-sm">No effects applied</div>
                  <div className="text-xs">Add effects to shape your sound</div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'eq' && (
          <div className="p-4">
            {/* EQ Header */}
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-medium">8-Band Parametric EQ</h4>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={() => {
                    // Reset all EQ bands
                    console.log('Resetting EQ');
                  }}
                >
                  Reset
                </Button>
                <div className="text-xs text-[var(--muted-foreground)]">24dB/oct</div>
              </div>
            </div>
            
            {/* Professional EQ Curve Display */}
            <div className="h-48 bg-gradient-to-b from-[var(--muted)]/20 to-[var(--muted)] rounded-md mb-6 relative overflow-hidden border border-[var(--border)]">
              {/* Frequency Grid Lines */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 192">
                {/* Vertical frequency lines */}
                {[20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000].map((freq, i) => {
                  const x = (Math.log10(freq) - Math.log10(20)) / (Math.log10(20000) - Math.log10(20)) * 400;
                  return (
                    <g key={freq}>
                      <line 
                        x1={x} y1="0" x2={x} y2="192" 
                        stroke="var(--border)" 
                        strokeWidth="0.5" 
                        opacity={[100, 1000, 10000].includes(freq) ? "0.6" : "0.3"}
                      />
                      <text 
                        x={x} y="188" 
                        textAnchor="middle" 
                        className="text-xs fill-[var(--muted-foreground)]"
                        fontSize="8"
                      >
                        {freq >= 1000 ? `${freq/1000}k` : freq}
                      </text>
                    </g>
                  );
                })}
                
                {/* Horizontal gain lines */}
                {[-18, -12, -6, 0, 6, 12, 18].map((gain) => {
                  const y = 96 - (gain * 3.2); // Center at 96, scale gain
                  return (
                    <g key={gain}>
                      <line 
                        x1="0" y1={y} x2="400" y2={y} 
                        stroke="var(--border)" 
                        strokeWidth="0.5" 
                        opacity={gain === 0 ? "0.8" : "0.3"}
                      />
                      <text 
                        x="5" y={y - 2} 
                        className="text-xs fill-[var(--muted-foreground)]"
                        fontSize="8"
                      >
                        {gain > 0 ? `+${gain}` : gain}dB
                      </text>
                    </g>
                  );
                })}
                
                {/* EQ Response Curve */}
                <path 
                  d="M0,96 Q50,94 100,88 Q150,82 200,78 Q250,85 300,92 Q350,98 400,96" 
                  stroke="#5E81AC" 
                  strokeWidth="2.5" 
                  fill="none"
                  filter="drop-shadow(0 0 4px rgba(94, 129, 172, 0.4))"
                />
                
                {/* Interactive EQ Points */}
                {[
                  { x: 60, y: 88, freq: '80Hz', gain: '+2.5dB', q: '0.8' },
                  { x: 120, y: 82, freq: '320Hz', gain: '+4.2dB', q: '1.4' },
                  { x: 180, y: 78, freq: '1.2kHz', gain: '+5.8dB', q: '2.1' },
                  { x: 240, y: 85, freq: '3.5kHz', gain: '+3.2dB', q: '1.6' },
                  { x: 300, y: 92, freq: '8kHz', gain: '+1.1dB', q: '0.9' },
                ].map((point, index) => (
                  <g key={index}>
                    <circle 
                      cx={point.x} cy={point.y} r="5" 
                      fill="#5E81AC" 
                      stroke="#ECEFF4" 
                      strokeWidth="2" 
                      className="cursor-pointer hover:r-6 transition-all"
                      style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}
                    />
                    <circle 
                      cx={point.x} cy={point.y} r="8" 
                      fill="transparent" 
                      className="cursor-pointer"
                    />
                  </g>
                ))}
              </svg>
              
              {/* Real-time Spectrum Analyzer Overlay */}
              <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-r from-[var(--primary)]/10 via-[var(--primary)]/20 to-[var(--primary)]/10 opacity-30">
                {Array.from({ length: 40 }).map((_, i) => (
                  <div 
                    key={i}
                    className="inline-block w-2 bg-[var(--primary)] opacity-40"
                    style={{ 
                      height: `${Math.random() * 20 + 5}px`,
                      marginLeft: '8px',
                      animation: `pulse ${Math.random() * 2 + 1}s infinite ease-in-out`
                    }}
                  />
                ))}
              </div>
            </div>
            
            {/* Professional EQ Controls */}
            <div className="space-y-4">
              {/* Master Controls */}
              <div className="flex items-center justify-between p-3 bg-[var(--muted)] rounded-md">
                <div className="flex items-center space-x-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 rounded-full bg-[var(--primary)] text-[var(--primary-foreground)]"
                  >
                    <Volume2 className="w-4 h-4" />
                  </Button>
                  <div className="text-sm font-medium">Master EQ</div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-xs text-[var(--muted-foreground)]">Input</div>
                  <div className="text-xs font-mono">-3.2dB</div>
                  <div className="w-16 h-1 bg-[var(--background)] rounded-full overflow-hidden">
                    <div className="h-full w-3/4 bg-[var(--primary)] rounded-full"></div>
                  </div>
                  <div className="text-xs text-[var(--muted-foreground)]">Output</div>
                  <div className="text-xs font-mono">+1.8dB</div>
                </div>
              </div>
              
              {/* Individual EQ Bands */}
              {[
                { name: 'High-Pass', freq: '24Hz', gain: '0.0dB', q: '0.7', type: 'HPF', color: '#BF616A' },
                { name: 'Low Shelf', freq: '80Hz', gain: '+2.5dB', q: '0.8', type: 'LSF', color: '#D08770' },
                { name: 'Low Mid', freq: '320Hz', gain: '+4.2dB', q: '1.4', type: 'PEQ', color: '#EBCB8B' },
                { name: 'Mid', freq: '1.2kHz', gain: '+5.8dB', q: '2.1', type: 'PEQ', color: '#A3BE8C' },
                { name: 'High Mid', freq: '3.5kHz', gain: '+3.2dB', q: '1.6', type: 'PEQ', color: '#8FBCBB' },
                { name: 'Presence', freq: '8kHz', gain: '+1.1dB', q: '0.9', type: 'PEQ', color: '#88C0D0' },
                { name: 'High Shelf', freq: '12kHz', gain: '-1.2dB', q: '0.6', type: 'HSF', color: '#81A1C1' },
                { name: 'Low-Pass', freq: '18kHz', gain: '0.0dB', q: '0.5', type: 'LPF', color: '#B48EAD' },
              ].map((band, index) => (
                <div key={band.name} className="p-3 bg-[var(--muted)] rounded-md">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: band.color }}
                      />
                      <div className="text-sm font-medium">{band.name}</div>
                      <div className="text-xs px-2 py-1 bg-[var(--background)] rounded font-mono">
                        {band.type}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                    >
                      <Eye className="w-3 h-3" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    {/* Frequency */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs text-[var(--muted-foreground)]">Frequency</label>
                        <span className="text-xs font-mono">{band.freq}</span>
                      </div>
                      <div className="relative">
                        <input 
                          type="range" 
                          min="20" 
                          max="20000" 
                          defaultValue="1000"
                          className="w-full h-2 bg-[var(--background)] rounded-lg appearance-none cursor-pointer"
                          style={{
                            background: `linear-gradient(to right, var(--background) 0%, ${band.color} 50%, var(--background) 100%)`
                          }}
                        />
                      </div>
                    </div>
                    
                    {/* Gain */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs text-[var(--muted-foreground)]">Gain</label>
                        <span className="text-xs font-mono">{band.gain}</span>
                      </div>
                      <div className="relative">
                        <input 
                          type="range" 
                          min="-18" 
                          max="18" 
                          defaultValue="0"
                          className="w-full h-2 bg-[var(--background)] rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                    </div>
                    
                    {/* Q Factor */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs text-[var(--muted-foreground)]">Q</label>
                        <span className="text-xs font-mono">{band.q}</span>
                      </div>
                      <div className="relative">
                        <input 
                          type="range" 
                          min="0.1" 
                          max="10" 
                          step="0.1"
                          defaultValue="1"
                          className="w-full h-2 bg-[var(--background)] rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Analysis Tools */}
              <div className="p-3 bg-[var(--muted)] rounded-md">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm font-medium">Analysis</div>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                      Solo
                    </Button>
                    <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                      A/B
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-4 text-xs">
                  <div className="text-center">
                    <div className="text-[var(--muted-foreground)]">RMS</div>
                    <div className="font-mono">-12.4dB</div>
                  </div>
                  <div className="text-center">
                    <div className="text-[var(--muted-foreground)]">Peak</div>
                    <div className="font-mono">-3.8dB</div>
                  </div>
                  <div className="text-center">
                    <div className="text-[var(--muted-foreground)]">LUFS</div>
                    <div className="font-mono">-16.2</div>
                  </div>
                  <div className="text-center">
                    <div className="text-[var(--muted-foreground)]">THD</div>
                    <div className="font-mono">0.02%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'sends' && (
          <div className="p-4">
            <h4 className="text-sm font-medium mb-4">Send Effects</h4>
            
            <div className="space-y-4">
              {['Reverb A', 'Delay B', 'Chorus C'].map((send, index) => (
                <div key={send} className="flex items-center space-x-4 p-3 bg-[var(--muted)] rounded-md">
                  <div className="w-16 text-sm font-medium">{send}</div>
                  <div className="flex-1">
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      defaultValue={index === 0 ? "25" : "0"}
                      className="w-full h-1 bg-[var(--background)] rounded-lg"
                    />
                  </div>
                  <div className="w-12 text-xs font-mono text-right">
                    {index === 0 ? '-12dB' : '-∞dB'}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                  >
                    {index === 0 ? <Volume2 className="w-3 h-3" /> : <VolumeX className="w-3 h-3" />}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'wavelets' && (
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-medium">Extracted Wavelets</h4>
              <div className="text-xs text-[var(--muted-foreground)]">
                {allWavelets.length} analysis{allWavelets.length !== 1 ? 'es' : ''}
              </div>
            </div>
            
            {allWavelets.length > 0 ? (
              <div className="space-y-3">
                {allWavelets.map((waveletEntry) => (
                  <div key={waveletEntry.id} className="p-3 bg-[var(--muted)] rounded-md">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded-sm"
                          style={{ backgroundColor: track.color }}
                        />
                        <span className="text-sm font-medium">{waveletEntry.trackName}</span>
                        <span className="text-xs text-[var(--muted-foreground)]">
                          {new Date(waveletEntry.extractionTime).toLocaleTimeString()}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs"
                          onClick={() => playWaveletAudio(waveletEntry)}
                          disabled={playingWavelet === waveletEntry.id}
                        >
                          {playingWavelet === waveletEntry.id ? (
                            <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M21 12a9 9 0 11-6.219-8.56" />
                            </svg>
                          ) : (
                            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          )}
                          <span className="ml-1">{playingWavelet === waveletEntry.id ? 'Playing' : 'Play'}</span>
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => {
                            setAllWavelets(prev => prev.filter(w => w.id !== waveletEntry.id));
                          }}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Statistics */}
                    <div className="grid grid-cols-2 gap-3 text-xs mb-3">
                      <div>
                        <div className="text-[var(--muted-foreground)]">Total Energy</div>
                        <div className="font-mono">{waveletEntry.data.statistics.totalEnergy}</div>
                      </div>
                      <div>
                        <div className="text-[var(--muted-foreground)]">Dominant Level</div>
                        <div className="font-mono">Level {waveletEntry.data.statistics.dominantLevel}</div>
                      </div>
                      <div>
                        <div className="text-[var(--muted-foreground)]">Dominant Freq</div>
                        <div className="font-mono">{waveletEntry.data.statistics.dominantFrequency}</div>
                      </div>
                      <div>
                        <div className="text-[var(--muted-foreground)]">Compression</div>
                        <div className="font-mono">{waveletEntry.data.statistics.compressionRatio}%</div>
                      </div>
                    </div>
                    
                    {/* Compact Coefficient Visualization */}
                    <div className="space-y-1">
                      <div className="text-xs text-[var(--muted-foreground)] mb-1">Coefficient Levels</div>
                      {waveletEntry.data.coefficients.slice(0, 4).map((level: any, index: number) => (
                        <div key={index} className="flex items-center space-x-2">
                          <div className="w-6 text-xs font-mono">L{level.level}</div>
                          <div className="flex-1 h-1.5 bg-[var(--background)] rounded-sm overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-sm"
                              style={{ 
                                width: `${Math.min(100, (level.energy / Math.max(...waveletEntry.data.coefficients.map((c: any) => c.energy))) * 100)}%` 
                              }}
                            />
                          </div>
                          <div className="w-12 text-xs font-mono text-right">{level.frequency}</div>
                        </div>
                      ))}
                      {waveletEntry.data.coefficients.length > 4 && (
                        <div className="text-xs text-[var(--muted-foreground)] pl-8">
                          +{waveletEntry.data.coefficients.length - 4} more levels
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-[var(--muted-foreground)]">
                <svg className="w-8 h-8 mx-auto mb-2 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 12h6l3-9 6 18 3-9h3" />
                </svg>
                <div className="text-sm">No wavelets extracted</div>
                <div className="text-xs opacity-70">Extract wavelets from audio tracks to see them here</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}