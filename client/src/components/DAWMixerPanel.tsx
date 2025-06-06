import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { 
  Volume2, 
  VolumeX, 
  Radio, 
  Settings, 
  Headphones,
  Monitor,
  RotateCcw,
  Mic,
  Music,
  Play,
  Square,
  Circle,
  Send,
  ArrowUpDown,
  Zap,
  Filter,
  Waves,
  Volume1
} from 'lucide-react';
import { AudioTrack } from '../types/audio';

interface MixerChannel {
  id: string;
  name: string;
  type: 'audio' | 'aux' | 'master';
  input: string;
  volume: number;
  pan: number;
  mute: boolean;
  solo: boolean;
  record: boolean;
  highGain: number;
  midGain: number;
  lowGain: number;
  highFreq: number;
  midFreq: number;
  lowFreq: number;
  aux1Send: number;
  aux2Send: number;
  color: string;
  inputGain: number;
  phase: boolean;
  highpass: boolean;
  compressor: {
    enabled: boolean;
    threshold: number;
    ratio: number;
    attack: number;
    release: number;
  };
}

interface DAWMixerPanelProps {
  tracks: AudioTrack[];
  onVolumeChange: (trackId: string, volume: number) => void;
  onMuteToggle: (trackId: string) => void;
  onSoloToggle: (trackId: string) => void;
  onPanChange?: (trackId: string, pan: number) => void;
  onEQChange?: (trackId: string, band: 'high' | 'mid' | 'low', gain: number) => void;
  masterVolume?: number;
  onMasterVolumeChange?: (volume: number) => void;
}

export function DAWMixerPanel({
  tracks,
  onVolumeChange,
  onMuteToggle,
  onSoloToggle,
  onPanChange,
  onEQChange,
  masterVolume = 75,
  onMasterVolumeChange
}: DAWMixerPanelProps) {
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [showEQ, setShowEQ] = useState(true);
  const [showSends, setShowSends] = useState(false);
  const [masterMute, setMasterMute] = useState(false);

  // Convert tracks to mixer channels
  const mixerChannels: MixerChannel[] = tracks.map(track => ({
    id: track.id,
    name: track.name,
    type: 'audio' as const,
    input: track.type === 'audio' ? 'Line In' : 'MIDI',
    volume: track.volume || 75,
    pan: track.pan || 0,
    mute: track.muted || false,
    solo: track.soloed || false,
    record: false,
    highGain: 0,
    midGain: 0,
    lowGain: 0,
    highFreq: 8000,
    midFreq: 1000,
    lowFreq: 200,
    aux1Send: 0,
    aux2Send: 0,
    color: track.color || '#3b82f6',
    inputGain: 0,
    phase: false,
    highpass: false,
    compressor: {
      enabled: false,
      threshold: -20,
      ratio: 4,
      attack: 10,
      release: 100
    }
  }));

  // Add aux channels
  const auxChannels: MixerChannel[] = [
    {
      id: 'aux1',
      name: 'Reverb',
      type: 'aux',
      input: 'Aux 1',
      volume: 65,
      pan: 0,
      mute: false,
      solo: false,
      record: false,
      highGain: 0,
      midGain: 0,
      lowGain: 0,
      highFreq: 8000,
      midFreq: 1000,
      lowFreq: 200,
      aux1Send: 0,
      aux2Send: 0,
      color: '#10b981',
      inputGain: 0,
      phase: false,
      highpass: false,
      compressor: {
        enabled: false,
        threshold: -20,
        ratio: 4,
        attack: 10,
        release: 100
      }
    },
    {
      id: 'aux2',
      name: 'Delay',
      type: 'aux',
      input: 'Aux 2',
      volume: 55,
      pan: 0,
      mute: false,
      solo: false,
      record: false,
      highGain: 0,
      midGain: 0,
      lowGain: 0,
      highFreq: 8000,
      midFreq: 1000,
      lowFreq: 200,
      aux1Send: 0,
      aux2Send: 0,
      color: '#f59e0b',
      inputGain: 0,
      phase: false,
      highpass: false,
      compressor: {
        enabled: false,
        threshold: -20,
        ratio: 4,
        attack: 10,
        release: 100
      }
    }
  ];

  // Master channel
  const masterChannel: MixerChannel = {
    id: 'master',
    name: 'Master',
    type: 'master',
    input: 'Mix',
    volume: masterVolume,
    pan: 0,
    mute: masterMute,
    solo: false,
    record: false,
    highGain: 0,
    midGain: 0,
    lowGain: 0,
    highFreq: 8000,
    midFreq: 1000,
    lowFreq: 200,
    aux1Send: 0,
    aux2Send: 0,
    color: '#ef4444',
    inputGain: 0,
    phase: false,
    highpass: false,
    compressor: {
      enabled: false,
      threshold: -6,
      ratio: 2,
      attack: 5,
      release: 50
    }
  };

  const allChannels = [...mixerChannels, ...auxChannels, masterChannel];

  const handleVolumeChange = useCallback((channelId: string, value: number[]) => {
    const volume = value[0];
    if (channelId === 'master') {
      onMasterVolumeChange?.(volume);
    } else if (channelId.startsWith('aux')) {
      // Handle aux channel volume
      console.log(`Aux ${channelId} volume:`, volume);
    } else {
      onVolumeChange(channelId, volume);
    }
  }, [onVolumeChange, onMasterVolumeChange]);

  const handleMuteToggle = useCallback((channelId: string) => {
    if (channelId === 'master') {
      setMasterMute(!masterMute);
    } else if (channelId.startsWith('aux')) {
      console.log(`Toggle aux ${channelId} mute`);
    } else {
      onMuteToggle(channelId);
    }
  }, [onMuteToggle, masterMute]);

  const handleSoloToggle = useCallback((channelId: string) => {
    if (channelId === 'master') {
      return; // Master can't be soloed
    } else if (channelId.startsWith('aux')) {
      console.log(`Toggle aux ${channelId} solo`);
    } else {
      onSoloToggle(channelId);
    }
  }, [onSoloToggle]);

  const handlePanChange = useCallback((channelId: string, value: number[]) => {
    const pan = value[0];
    onPanChange?.(channelId, pan);
  }, [onPanChange]);

  const handleEQChange = useCallback((channelId: string, band: 'high' | 'mid' | 'low', value: number[]) => {
    const gain = value[0];
    onEQChange?.(channelId, band, gain);
  }, [onEQChange]);

  const ChannelStrip = ({ channel }: { channel: MixerChannel }) => (
    <div 
      className={`flex flex-col w-16 bg-[var(--card)] border border-[var(--border)] rounded-t-lg ${
        selectedChannel === channel.id ? 'ring-2 ring-[var(--primary)]' : ''
      }`}
      onClick={() => setSelectedChannel(channel.id)}
    >
      {/* Channel Header */}
      <div className="p-1 bg-[var(--muted)] border-b border-[var(--border)]">
        <div className="text-[10px] font-medium text-center truncate" title={channel.name}>
          {channel.name}
        </div>
        <div className="text-[8px] text-[var(--muted-foreground)] text-center">
          {channel.input}
        </div>
      </div>

      {/* Input Gain */}
      <div className="p-1 border-b border-[var(--border)]">
        <div className="text-[8px] text-center mb-1">GAIN</div>
        <div className="h-8 flex items-center justify-center">
          <Slider
            value={[channel.inputGain]}
            min={-20}
            max={20}
            step={0.5}
            orientation="vertical"
            className="h-6"
          />
        </div>
        <div className="text-[7px] text-center mt-1">{channel.inputGain.toFixed(1)}</div>
      </div>

      {/* EQ Section */}
      {showEQ && (
        <div className="p-1 border-b border-[var(--border)]">
          <div className="text-[8px] text-center mb-1">EQ</div>
          
          {/* High */}
          <div className="mb-1">
            <div className="text-[7px] text-center">HI</div>
            <div className="h-6 flex items-center justify-center">
              <Slider
                value={[channel.highGain]}
                min={-15}
                max={15}
                step={0.5}
                orientation="vertical"
                className="h-4"
                onValueChange={(value) => handleEQChange(channel.id, 'high', value)}
              />
            </div>
            <div className="text-[6px] text-center">{channel.highGain.toFixed(1)}</div>
          </div>

          {/* Mid */}
          <div className="mb-1">
            <div className="text-[7px] text-center">MID</div>
            <div className="h-6 flex items-center justify-center">
              <Slider
                value={[channel.midGain]}
                min={-15}
                max={15}
                step={0.5}
                orientation="vertical"
                className="h-4"
                onValueChange={(value) => handleEQChange(channel.id, 'mid', value)}
              />
            </div>
            <div className="text-[6px] text-center">{channel.midGain.toFixed(1)}</div>
          </div>

          {/* Low */}
          <div>
            <div className="text-[7px] text-center">LO</div>
            <div className="h-6 flex items-center justify-center">
              <Slider
                value={[channel.lowGain]}
                min={-15}
                max={15}
                step={0.5}
                orientation="vertical"
                className="h-4"
                onValueChange={(value) => handleEQChange(channel.id, 'low', value)}
              />
            </div>
            <div className="text-[6px] text-center">{channel.lowGain.toFixed(1)}</div>
          </div>
        </div>
      )}

      {/* Aux Sends */}
      {showSends && (
        <div className="p-1 border-b border-[var(--border)]">
          <div className="text-[8px] text-center mb-1">SENDS</div>
          
          <div className="mb-1">
            <div className="text-[7px] text-center">AUX1</div>
            <div className="h-6 flex items-center justify-center">
              <Slider
                value={[channel.aux1Send]}
                min={0}
                max={100}
                step={1}
                orientation="vertical"
                className="h-4"
              />
            </div>
          </div>

          <div>
            <div className="text-[7px] text-center">AUX2</div>
            <div className="h-6 flex items-center justify-center">
              <Slider
                value={[channel.aux2Send]}
                min={0}
                max={100}
                step={1}
                orientation="vertical"
                className="h-4"
              />
            </div>
          </div>
        </div>
      )}

      {/* Pan */}
      <div className="p-1 border-b border-[var(--border)]">
        <div className="text-[8px] text-center mb-1">PAN</div>
        <div className="h-4 flex items-center justify-center">
          <Slider
            value={[channel.pan]}
            min={-50}
            max={50}
            step={1}
            orientation="horizontal"
            className="w-12"
            onValueChange={(value) => handlePanChange(channel.id, value)}
          />
        </div>
        <div className="text-[7px] text-center mt-1">
          {channel.pan === 0 ? 'C' : channel.pan > 0 ? `R${channel.pan}` : `L${Math.abs(channel.pan)}`}
        </div>
      </div>

      {/* Control Buttons */}
      <div className="p-1 border-b border-[var(--border)] space-y-1">
        {/* Record/Phase/HPF for audio channels */}
        {channel.type === 'audio' && (
          <div className="flex justify-center">
            <Button
              size="sm"
              variant={channel.record ? "destructive" : "secondary"}
              className="h-4 w-4 p-0"
              onClick={() => console.log(`Toggle record ${channel.id}`)}
            >
              <Circle className="w-2 h-2" />
            </Button>
          </div>
        )}

        {/* Mute */}
        <div className="flex justify-center">
          <Button
            size="sm"
            variant={channel.mute ? "destructive" : "secondary"}
            className="h-4 w-8 p-0 text-[8px]"
            onClick={() => handleMuteToggle(channel.id)}
          >
            {channel.mute ? <VolumeX className="w-2 h-2" /> : 'M'}
          </Button>
        </div>

        {/* Solo */}
        {channel.type !== 'master' && (
          <div className="flex justify-center">
            <Button
              size="sm"
              variant={channel.solo ? "default" : "secondary"}
              className="h-4 w-8 p-0 text-[8px]"
              onClick={() => handleSoloToggle(channel.id)}
            >
              {channel.solo ? <Radio className="w-2 h-2" /> : 'S'}
            </Button>
          </div>
        )}
      </div>

      {/* Volume Fader */}
      <div className="flex-1 p-1 flex flex-col items-center">
        <div className="text-[8px] text-center mb-1">VOL</div>
        <div className="flex-1 flex items-center justify-center min-h-[120px]">
          <Slider
            value={[channel.volume]}
            min={0}
            max={100}
            step={0.1}
            orientation="vertical"
            className="h-full"
            onValueChange={(value) => handleVolumeChange(channel.id, value)}
          />
        </div>
        <div className="text-[7px] text-center mt-1">
          {channel.volume.toFixed(1)}
        </div>
        <div className="text-[6px] text-center text-[var(--muted-foreground)]">
          {channel.volume === 0 ? '-∞' : `${(20 * Math.log10(channel.volume / 100)).toFixed(1)}dB`}
        </div>
      </div>

      {/* Channel Color Strip */}
      <div 
        className="h-1 rounded-b-lg"
        style={{ backgroundColor: channel.color }}
      />
    </div>
  );

  return (
    <div className="bg-[var(--background)] border-t border-[var(--border)]">
      {/* Mixer Controls Header */}
      <div className="p-2 bg-[var(--muted)] border-b border-[var(--border)] flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h3 className="text-sm font-medium">Mixer</h3>
          <div className="flex space-x-1">
            <Button
              size="sm"
              variant={showEQ ? "default" : "secondary"}
              className="h-6 px-2 text-xs"
              onClick={() => setShowEQ(!showEQ)}
            >
              <Filter className="w-3 h-3 mr-1" />
              EQ
            </Button>
            <Button
              size="sm"
              variant={showSends ? "default" : "secondary"}
              className="h-6 px-2 text-xs"
              onClick={() => setShowSends(!showSends)}
            >
              <Send className="w-3 h-3 mr-1" />
              Sends
            </Button>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button size="sm" variant="secondary" className="h-6 px-2 text-xs">
            <Settings className="w-3 h-3 mr-1" />
            Setup
          </Button>
          <Button size="sm" variant="secondary" className="h-6 px-2 text-xs">
            <Monitor className="w-3 h-3 mr-1" />
            Monitor
          </Button>
          <Button size="sm" variant="secondary" className="h-6 px-2 text-xs">
            <Headphones className="w-3 h-3 mr-1" />
            Phones
          </Button>
        </div>
      </div>

      {/* Channel Strips */}
      <div className="p-2">
        <div className="flex space-x-1 overflow-x-auto">
          {allChannels.map(channel => (
            <ChannelStrip key={channel.id} channel={channel} />
          ))}
        </div>
      </div>
    </div>
  );
}