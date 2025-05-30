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
                  <div key={effect.id} className="border border-[var(--border)] rounded-md">
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
            <h4 className="text-sm font-medium mb-4">Parametric EQ</h4>
            
            {/* EQ Curve Visual */}
            <div className="h-32 bg-[var(--muted)] rounded-md mb-4 flex items-center justify-center relative overflow-hidden">
              <svg className="w-full h-full" viewBox="0 0 300 100">
                <path 
                  d="M0,80 Q75,70 150,50 Q225,30 300,40" 
                  stroke="var(--primary)" 
                  strokeWidth="2" 
                  fill="none"
                />
                <circle cx="75" cy="70" r="4" fill="var(--primary)" className="cursor-pointer" />
                <circle cx="150" cy="50" r="4" fill="var(--primary)" className="cursor-pointer" />
                <circle cx="225" cy="30" r="4" fill="var(--primary)" className="cursor-pointer" />
              </svg>
            </div>
            
            {/* EQ Bands */}
            <div className="grid grid-cols-4 gap-4">
              {['Low', 'Low-Mid', 'High-Mid', 'High'].map((band, index) => (
                <div key={band} className="space-y-2">
                  <div className="text-xs font-medium text-center">{band}</div>
                  <div className="space-y-1">
                    <div className="text-xs text-[var(--muted-foreground)]">Freq</div>
                    <input type="range" min="0" max="100" defaultValue="50" className="w-full h-1 bg-[var(--muted)] rounded-lg" />
                    <div className="text-xs font-mono text-center">
                      {index === 0 ? '80Hz' : index === 1 ? '400Hz' : index === 2 ? '2.5kHz' : '12kHz'}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-[var(--muted-foreground)]">Gain</div>
                    <input type="range" min="0" max="100" defaultValue="50" className="w-full h-1 bg-[var(--muted)] rounded-lg" />
                    <div className="text-xs font-mono text-center">0.0dB</div>
                  </div>
                </div>
              ))}
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