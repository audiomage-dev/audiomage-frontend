import { Button } from '@/components/ui/button';
import { WaveformVisualization } from './WaveformVisualization';
import { AudioTrack, TransportState } from '../types/audio';

interface TimelineEditorProps {
  tracks: AudioTrack[];
  transport: TransportState;
  onTrackMute: (trackId: string) => void;
  onTrackSolo: (trackId: string) => void;
}

export function TimelineEditor({ tracks, transport, onTrackMute, onTrackSolo }: TimelineEditorProps) {
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Toolbar */}
      <div className="bg-[hsl(var(--muted))] border-b border-[hsl(var(--border))] p-2 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1">
            <Button variant="ghost" size="sm" className="p-1 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded h-auto">
              <i className="fas fa-mouse-pointer text-xs"></i>
            </Button>
            <Button variant="ghost" size="sm" className="p-1 hover:bg-[hsl(var(--accent))] rounded h-auto">
              <i className="fas fa-cut text-xs"></i>
            </Button>
            <Button variant="ghost" size="sm" className="p-1 hover:bg-[hsl(var(--accent))] rounded h-auto">
              <i className="fas fa-expand-arrows-alt text-xs"></i>
            </Button>
            <Button variant="ghost" size="sm" className="p-1 hover:bg-[hsl(var(--accent))] rounded h-auto">
              <i className="fas fa-hand-paper text-xs"></i>
            </Button>
          </div>
          <div className="h-4 border-l border-[hsl(var(--muted-foreground))]"></div>
          <div className="flex items-center space-x-1 text-xs">
            <span>Snap:</span>
            <select className="bg-[hsl(var(--input))] border border-[hsl(var(--border))] rounded px-1 text-xs text-[hsl(var(--foreground))]">
              <option>1/16</option>
              <option>1/8</option>
              <option>1/4</option>
            </select>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-xs">
          <span className="font-mono">Sample Rate: 48kHz</span>
          <span className="font-mono">Buffer: 256</span>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-[hsl(var(--aurora-green))] rounded-full"></div>
            <span>CPU: 23%</span>
          </div>
        </div>
      </div>

      {/* Timeline Header */}
      <div className="bg-[hsl(var(--muted))] border-b border-[hsl(var(--border))] p-2">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-semibold">Timeline Editor</span>
            <Button variant="ghost" size="sm" className="text-xs bg-[hsl(var(--secondary))] hover:bg-[hsl(var(--accent))] px-2 py-1 rounded h-auto">
              <i className="fas fa-search-plus mr-1"></i>Zoom
            </Button>
          </div>
          <div className="flex items-center space-x-2 text-xs">
            <Button variant="ghost" size="sm" className="bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] px-2 py-1 rounded h-auto">Audio</Button>
            <Button variant="ghost" size="sm" className="bg-[hsl(var(--secondary))] hover:bg-[hsl(var(--accent))] px-2 py-1 rounded h-auto">MIDI</Button>
            <Button variant="ghost" size="sm" className="bg-[hsl(var(--secondary))] hover:bg-[hsl(var(--accent))] px-2 py-1 rounded h-auto">Video</Button>
          </div>
        </div>
        
        {/* Timeline Ruler */}
        <div className="bg-[hsl(var(--secondary))] p-2 rounded font-mono text-xs">
          <div className="flex justify-between items-center mb-1">
            {[0, 60, 120, 180, 240].map(seconds => (
              <span key={seconds}>{formatTime(seconds)}</span>
            ))}
          </div>
          <div className="h-4 bg-[hsl(var(--muted-foreground))] rounded relative overflow-hidden">
            <div 
              className="absolute top-0 w-0.5 h-full bg-[hsl(var(--frost-2))]"
              style={{ left: `${(transport.currentTime / 240) * 100}%` }}
            ></div>
            <div 
              className="absolute top-0 w-8 h-full bg-[hsl(var(--frost-2))] bg-opacity-20"
              style={{ left: `${Math.max(0, (transport.currentTime / 240) * 100 - 2)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Multi-Track Timeline */}
      <div className="flex-1 bg-[hsl(var(--background))] timeline-grid overflow-auto scrollbar-thin">
        <div className="min-w-full">
          {tracks.map((track) => (
            <div key={track.id} className="flex border-b border-[hsl(var(--border))]">
              {/* Track Header */}
              <div className="w-48 bg-[hsl(var(--muted))] border-r border-[hsl(var(--border))] p-2 flex flex-col justify-center">
                <div className="flex items-center space-x-2 mb-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`w-4 h-4 rounded-sm text-xs h-auto p-0 ${
                      !track.muted ? 'bg-[hsl(var(--aurora-green))]' : 'bg-[hsl(var(--secondary))]'
                    }`}
                  >
                    ●
                  </Button>
                  <Button
                    onClick={() => onTrackMute(track.id)}
                    variant="ghost"
                    size="sm"
                    className={`w-4 h-4 rounded-sm text-xs h-auto p-0 ${
                      track.muted ? 'bg-[hsl(var(--aurora-orange))]' : 'bg-[hsl(var(--secondary))] hover:bg-[hsl(var(--aurora-orange))]'
                    }`}
                  >
                    M
                  </Button>
                  <Button
                    onClick={() => onTrackSolo(track.id)}
                    variant="ghost"
                    size="sm"
                    className={`w-4 h-4 rounded-sm text-xs h-auto p-0 ${
                      track.soloed ? 'bg-[hsl(var(--aurora-yellow))]' : 'bg-[hsl(var(--secondary))] hover:bg-[hsl(var(--aurora-yellow))]'
                    }`}
                  >
                    S
                  </Button>
                  {track.type === 'ai-generated' && (
                    <i className="fas fa-robot text-[hsl(var(--frost-1))] text-xs"></i>
                  )}
                </div>
                <div className={`text-xs font-semibold`} style={{ color: track.color }}>
                  {track.name}
                </div>
                <div className="text-xs text-[hsl(var(--muted-foreground))]">
                  {track.type === 'ai-generated' ? 'Generated' : 'Input: 1-2'}
                </div>
              </div>
              
              {/* Track Content */}
              <div className="flex-1 h-16 relative">
                {track.waveformData && (
                  <WaveformVisualization
                    data={track.waveformData}
                    color={track.color}
                    fileName={track.filePath || `${track.name}.wav`}
                    isPlaying={transport.isPlaying}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
