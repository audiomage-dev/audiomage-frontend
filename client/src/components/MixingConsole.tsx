import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AudioMeter } from './AudioMeter';
import { ChannelStrip } from './ChannelStrip';
import { MixerChannel, AIAnalysis } from '../types/audio';

interface MixingConsoleProps {
  channels: MixerChannel[];
  aiAnalysis: AIAnalysis;
  masterVolume: number;
  onChannelVolumeChange: (channelId: string, volume: number) => void;
  onChannelMute: (channelId: string) => void;
  onChannelSolo: (channelId: string) => void;
  onMasterVolumeChange: (volume: number) => void;
}

export function MixingConsole({
  channels,
  aiAnalysis,
  masterVolume,
  onChannelVolumeChange,
  onChannelMute,
  onChannelSolo,
  onMasterVolumeChange,
}: MixingConsoleProps) {
  const [activeTab, setActiveTab] = useState<'mix' | 'fx' | 'ai' | 'meter'>('mix');
  const [masterFaderPosition, setMasterFaderPosition] = useState(masterVolume);

  const handleMasterFaderChange = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const percentage = Math.max(0, Math.min(100, ((rect.height - y) / rect.height) * 100));
    setMasterFaderPosition(percentage);
    onMasterVolumeChange(percentage);
  };

  const formatDb = (percentage: number) => {
    const db = (percentage - 80) * 0.75;
    return `${db > 0 ? '+' : ''}${db.toFixed(1)}dB`;
  };

  const tabs = [
    { id: 'mix', label: 'Mix', icon: 'fas fa-sliders-h' },
    { id: 'fx', label: 'FX', icon: 'fas fa-magic' },
    { id: 'ai', label: 'AI', icon: 'fas fa-robot' },
    { id: 'meter', label: 'Meter', icon: 'fas fa-signal' },
  ];

  return (
    <div className="w-80 bg-[hsl(var(--nord-1))] border-l border-[hsl(var(--nord-2))] flex flex-col">
      {/* Panel Tabs */}
      <div className="border-b border-[hsl(var(--nord-2))] p-1 flex space-x-1">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            variant="ghost"
            size="sm"
            className={`px-3 py-1 rounded text-xs h-auto ${
              activeTab === tab.id
                ? 'bg-[hsl(var(--frost-4))] text-white'
                : 'bg-[hsl(var(--nord-2))] hover:bg-[hsl(var(--nord-3))]'
            }`}
          >
            <i className={`${tab.icon} mr-1`}></i>
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Master Section */}
      <div className="p-3 border-b border-[hsl(var(--nord-2))]">
        <div className="text-sm font-semibold mb-2 flex items-center">
          <i className="fas fa-sliders-h text-[hsl(var(--frost-2))] mr-2"></i>
          Master Bus
        </div>
        <div className="flex items-center space-x-2">
          {/* Master Fader */}
          <div className="flex flex-col items-center">
            <div 
              className="w-6 h-32 bg-[hsl(var(--nord-2))] rounded-full relative fader-track cursor-pointer"
              onClick={handleMasterFaderChange}
            >
              <div 
                className="absolute left-1/2 transform -translate-x-1/2 w-4 h-6 bg-[hsl(var(--frost-4))] rounded-sm border border-[hsl(var(--nord-3))] cursor-pointer"
                style={{ bottom: `${masterFaderPosition * 0.75 + 8}%` }}
              />
            </div>
            <span className="text-xs font-mono mt-1">{formatDb(masterFaderPosition)}</span>
          </div>
          
          {/* Master Meters */}
          <div className="flex space-x-1">
            <AudioMeter level={85} peak={92} height="h-32" />
            <AudioMeter level={78} peak={88} height="h-32" />
          </div>
          
          {/* Master EQ */}
          <div className="flex-1 space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-xs">HF</span>
              <div className="w-6 h-6 rounded-full knob cursor-pointer"></div>
              <span className="text-xs font-mono">+2.1</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs">MF</span>
              <div className="w-6 h-6 rounded-full knob cursor-pointer"></div>
              <span className="text-xs font-mono">-0.5</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs">LF</span>
              <div className="w-6 h-6 rounded-full knob cursor-pointer"></div>
              <span className="text-xs font-mono">+1.8</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {activeTab === 'mix' && (
          <div className="p-2 space-y-2">
            {channels.map((channel) => (
              <ChannelStrip
                key={channel.id}
                channel={channel}
                onVolumeChange={onChannelVolumeChange}
                onMuteToggle={onChannelMute}
                onSoloToggle={onChannelSolo}
              />
            ))}
          </div>
        )}

        {activeTab === 'ai' && (
          <div className="p-3 space-y-3">
            <div className="ai-glow bg-[hsl(var(--nord-2))] p-3 rounded">
              <div className="flex items-center space-x-2 mb-3">
                <i className="fas fa-robot text-[hsl(var(--frost-1))]"></i>
                <span className="text-sm font-semibold">AI Audio Analysis</span>
                <div className={`w-2 h-2 rounded-full ${aiAnalysis.isProcessing ? 'bg-[hsl(var(--aurora-yellow))] animate-pulse' : 'bg-[hsl(var(--aurora-green))]'}`}></div>
              </div>
              
              <div className="space-y-3">
                <div className="bg-[hsl(var(--nord-3))] p-2 rounded">
                  <div className="text-[hsl(var(--frost-1))] mb-2 text-xs font-semibold">Spectral Analysis:</div>
                  <div className="h-16 spectral-display rounded mb-2 relative overflow-hidden">
                    {aiAnalysis.spectralData.map((value, index) => (
                      <div
                        key={index}
                        className="absolute bottom-0 w-1 bg-[hsl(var(--frost-2))] opacity-80"
                        style={{
                          left: `${(index / aiAnalysis.spectralData.length) * 100}%`,
                          height: `${value}%`,
                        }}
                      />
                    ))}
                  </div>
                  <div className="text-[hsl(var(--nord-4))] text-xs">
                    Peak at {aiAnalysis.peakFrequency}Hz detected in vocal range
                  </div>
                </div>
                
                <div className="bg-[hsl(var(--nord-3))] p-2 rounded">
                  <div className="text-[hsl(var(--frost-1))] mb-2 text-xs font-semibold">AI Recommendations:</div>
                  <div className="space-y-1 text-xs">
                    {aiAnalysis.recommendations.slice(1).map((rec, index) => (
                      <div key={index} className="text-[hsl(var(--nord-4))]">• {rec}</div>
                    ))}
                  </div>
                </div>

                <div className="bg-[hsl(var(--nord-3))] p-2 rounded">
                  <div className="text-[hsl(var(--frost-1))] mb-2 text-xs font-semibold">Audio Metrics:</div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[hsl(var(--nord-3))]">LUFS:</span>
                      <span className="font-mono text-[hsl(var(--frost-2))] ml-1">{aiAnalysis.lufs}</span>
                    </div>
                    <div>
                      <span className="text-[hsl(var(--nord-3))]">Peak:</span>
                      <span className="font-mono text-[hsl(var(--aurora-yellow))] ml-1">{aiAnalysis.peak}dB</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'fx' && (
          <div className="p-3">
            <div className="text-sm font-semibold mb-3">Effects Rack</div>
            <div className="space-y-2">
              {['Reverb - Hall', 'Delay - Analog', 'Chorus - Vintage', 'Limiter - Broadcast'].map((fx, index) => (
                <div key={index} className="plugin-slot p-2 rounded flex items-center justify-between">
                  <span className="text-xs">{fx}</span>
                  <div className="flex space-x-1">
                    <Button variant="ghost" size="sm" className="w-4 h-4 rounded text-xs h-auto p-0">●</Button>
                    <Button variant="ghost" size="sm" className="w-4 h-4 rounded text-xs h-auto p-0">
                      <i className="fas fa-cog"></i>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'meter' && (
          <div className="p-3">
            <div className="text-sm font-semibold mb-3">Audio Meters</div>
            <div className="space-y-4">
              <div className="flex justify-center space-x-2">
                <AudioMeter level={85} peak={92} height="h-40" />
                <AudioMeter level={78} peak={88} height="h-40" />
              </div>
              <div className="text-center space-y-1 text-xs">
                <div className="font-mono">L: -3.2dB | R: -4.1dB</div>
                <div className="font-mono">RMS: -18.5dB</div>
                <div className="font-mono">LUFS: {aiAnalysis.lufs}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
