import { useState } from 'react';
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

interface TrackInspectorProps {
  track: AudioTrack;
  onTrackMute: (trackId: string) => void;
  onTrackSolo: (trackId: string) => void;
  onClose: () => void;
}

export function TrackInspector({ track, onTrackMute, onTrackSolo, onClose }: TrackInspectorProps) {
  const [activeTab, setActiveTab] = useState<'mixer' | 'effects' | 'eq' | 'sends'>('mixer');
  const [expandedEffects, setExpandedEffects] = useState<string[]>([]);

  const toggleEffect = (effectId: string) => {
    setExpandedEffects(prev => 
      prev.includes(effectId) 
        ? prev.filter(id => id !== effectId)
        : [...prev, effectId]
    );
  };

  const tabs = [
    { id: 'mixer', label: 'Mixer', icon: Sliders },
    { id: 'effects', label: 'Effects', icon: Zap },
    { id: 'eq', label: 'EQ', icon: BarChart3 },
    { id: 'sends', label: 'Sends', icon: Radio }
  ];

  return (
    <div className="h-64 bg-[var(--background)] border-t border-[var(--border)] flex flex-col">
      {/* Header */}
      <div className="h-10 bg-[var(--muted)] border-b border-[var(--border)] px-4 flex items-center justify-between">
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
      <div className="flex-1 overflow-hidden">
        {activeTab === 'mixer' && (
          <div className="h-full flex">
            {/* Channel Strip */}
            <div className="w-80 border-r border-[var(--border)] p-4">
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
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        defaultValue={track.volume.toString()}
                        className="w-full h-2 bg-[var(--muted)] rounded-lg"
                      />
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
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      defaultValue={track.pan.toString()}
                      className="flex-1 h-1 bg-[var(--muted)] rounded-lg"
                    />
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
            <div className="w-20 border-r border-[var(--border)] p-2">
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

            {/* Waveform Display */}
            <div className="flex-1 p-4">
              <h4 className="text-xs font-medium text-[var(--muted-foreground)] mb-2">Waveform</h4>
              <div className="h-32 bg-[var(--muted)] rounded-md flex items-center justify-center relative overflow-hidden">
                {track.waveformData ? (
                  <div className="w-full h-full flex items-center">
                    <div className="w-full h-16 bg-gradient-to-r from-transparent via-[var(--primary)]/20 to-transparent relative">
                      {Array.from({ length: 100 }).map((_, i) => (
                        <div
                          key={i}
                          className="absolute bottom-1/2 bg-[var(--primary)]"
                          style={{
                            left: `${i}%`,
                            width: '1px',
                            height: `${Math.random() * 30 + 5}px`,
                            transform: 'translateY(50%)'
                          }}
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-[var(--muted-foreground)]">
                    <BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <div className="text-xs">No audio data</div>
                  </div>
                )}
              </div>
              
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
      </div>
    </div>
  );
}