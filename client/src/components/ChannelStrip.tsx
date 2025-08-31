import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AudioMeter } from './AudioMeter';
import { MixerChannel, AudioEffect } from '../types/audio';

interface ChannelStripProps {
  channel: MixerChannel;
  onVolumeChange: (channelId: string, volume: number) => void;
  onMuteToggle: (channelId: string) => void;
  onSoloToggle: (channelId: string) => void;
}

export function ChannelStrip({
  channel,
  onVolumeChange,
  onMuteToggle,
  onSoloToggle,
}: ChannelStripProps) {
  const [faderPosition, setFaderPosition] = useState(channel.volume);

  const handleFaderChange = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const percentage = Math.max(
      0,
      Math.min(100, ((rect.height - y) / rect.height) * 100)
    );
    setFaderPosition(percentage);
    onVolumeChange(channel.id, percentage);
  };

  const getChannelColor = () => {
    if (channel.name.includes('Vocal')) return 'text-[hsl(var(--frost-2))]';
    if (channel.name.includes('Drums'))
      return 'text-[hsl(var(--aurora-orange))]';
    if (channel.name.includes('Bass'))
      return 'text-[hsl(var(--aurora-yellow))]';
    if (channel.name.includes('AI')) return 'text-[hsl(var(--frost-1))]';
    return 'text-[hsl(var(--nord-4))]';
  };

  const formatDb = (percentage: number) => {
    const db = (percentage - 80) * 0.75;
    return `${db > 0 ? '+' : ''}${db.toFixed(1)}dB`;
  };

  return (
    <div
      className={`bg-[hsl(var(--nord-2))] rounded p-2 ${channel.name.includes('AI') ? 'ai-glow' : ''}`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className={`text-xs font-semibold ${getChannelColor()}`}>
          {channel.name.includes('AI') && <i className="fas fa-robot mr-1"></i>}
          {channel.name}
        </span>
        <div className="flex space-x-1">
          <Button
            variant="ghost"
            size="sm"
            className={`w-4 h-4 rounded-sm text-xs h-auto p-0 ${
              !channel.muted
                ? 'bg-[hsl(var(--aurora-green))]'
                : 'bg-[hsl(var(--nord-2))]'
            }`}
          >
            ●
          </Button>
          <Button
            onClick={() => onMuteToggle(channel.id)}
            variant="ghost"
            size="sm"
            className={`w-4 h-4 rounded-sm text-xs h-auto p-0 ${
              channel.muted
                ? 'bg-[hsl(var(--aurora-orange))]'
                : 'bg-[hsl(var(--nord-2))] hover:bg-[hsl(var(--aurora-orange))]'
            }`}
          >
            M
          </Button>
          <Button
            onClick={() => onSoloToggle(channel.id)}
            variant="ghost"
            size="sm"
            className={`w-4 h-4 rounded-sm text-xs h-auto p-0 ${
              channel.soloed
                ? 'bg-[hsl(var(--aurora-yellow))]'
                : 'bg-[hsl(var(--nord-2))] hover:bg-[hsl(var(--aurora-yellow))]'
            }`}
          >
            S
          </Button>
        </div>
      </div>

      {/* Plugin Chain */}
      <div className="mb-2">
        <div className="text-xs text-[hsl(var(--nord-3))] mb-1">
          Plugin Chain:
        </div>
        <div className="space-y-1">
          {channel.effects.map((effect: AudioEffect) => (
            <div
              key={`channel-${channel.id}-effect-${effect.id}`}
              className="plugin-slot p-1 rounded text-xs flex items-center justify-between"
            >
              <span
                className={
                  effect.type === 'ai-enhancement' ||
                  effect.type === 'noise-reduction'
                    ? 'text-[hsl(var(--frost-1))]'
                    : ''
                }
              >
                {effect.name}
              </span>
              <i className="fas fa-cog cursor-pointer hover:text-[hsl(var(--frost-2))]"></i>
            </div>
          ))}
          <div className="plugin-slot p-1 rounded text-xs border-2 border-dashed border-[hsl(var(--nord-3))] text-[hsl(var(--nord-3))] text-center cursor-pointer hover:border-[hsl(var(--frost-3))]">
            + Add Plugin
          </div>
        </div>
      </div>

      {/* Channel Controls */}
      <div className="flex items-center space-x-2">
        {/* Fader */}
        <div className="flex flex-col items-center">
          <div
            className="w-4 h-20 bg-[hsl(var(--nord-3))] rounded-full relative fader-track cursor-pointer"
            onClick={handleFaderChange}
          >
            <div
              className="absolute left-1/2 transform -translate-x-1/2 w-3 h-4 bg-[hsl(var(--frost-3))] rounded-sm border border-[hsl(var(--nord-3))] cursor-pointer"
              style={{ bottom: `${faderPosition * 0.8}%` }}
            />
          </div>
          <span className="text-xs font-mono mt-1">
            {formatDb(faderPosition)}
          </span>
        </div>

        {/* Meter */}
        <AudioMeter
          level={channel.volume}
          peak={channel.volume + 10}
          height="h-20"
        />

        {/* Knobs */}
        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs">Gain</span>
            <div className="w-5 h-5 rounded-full knob cursor-pointer"></div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs">Pan</span>
            <div className="w-5 h-5 rounded-full knob cursor-pointer"></div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs">Send</span>
            <div className="w-5 h-5 rounded-full knob cursor-pointer"></div>
          </div>
        </div>
      </div>

      {/* AI Analysis for AI channels */}
      {channel.name.includes('AI') && (
        <div className="mt-2 space-y-2 text-xs">
          <div className="bg-[hsl(var(--nord-3))] p-2 rounded">
            <div className="text-[hsl(var(--frost-1))] mb-1">
              Spectral Analysis:
            </div>
            <div className="h-12 spectral-display rounded mb-1"></div>
            <div className="text-[hsl(var(--nord-4))]">
              Peak at 2.4kHz detected in vocal range
            </div>
          </div>

          <div className="bg-[hsl(var(--nord-3))] p-2 rounded">
            <div className="text-[hsl(var(--frost-1))] mb-1">
              AI Recommendations:
            </div>
            <div className="text-[hsl(var(--nord-4))]">
              • Apply 3dB cut at 2.4kHz
            </div>
            <div className="text-[hsl(var(--nord-4))]">
              • Increase reverb send by 15%
            </div>
            <div className="text-[hsl(var(--nord-4))]">
              • Consider parallel compression
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
