import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { WaveformVisualization } from './WaveformVisualization';
import { AudioTrack, TransportState } from '../types/audio';
import { 
  Volume2, 
  VolumeX, 
  Radio, 
  Circle, 
  Edit3, 
  Copy, 
  Trash2, 
  MoreHorizontal,
  Play,
  Pause,
  RotateCcw,
  Scissors,
  Move,
  ZoomIn,
  ZoomOut,
  Plus,
  Minus,
  SkipForward,
  SkipBack
} from 'lucide-react';

interface CompactTimelineEditorProps {
  tracks: AudioTrack[];
  transport: TransportState;
  onTrackMute: (trackId: string) => void;
  onTrackSolo: (trackId: string) => void;
}

export function CompactTimelineEditor({ tracks, transport, onTrackMute, onTrackSolo }: CompactTimelineEditorProps) {
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; trackId: string } | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [currentTool, setCurrentTool] = useState<'select' | 'cut' | 'zoom' | 'hand'>('select');
  const [showChatBox, setShowChatBox] = useState(false);
  const [chatPrompt, setChatPrompt] = useState('');
  const timelineRef = useRef<HTMLDivElement>(null);

  const handleTrackSelect = useCallback((trackId: string) => {
    setSelectedTrackId(trackId);
  }, []);

  const handleTrackRightClick = useCallback((e: React.MouseEvent, trackId: string) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, trackId });
    setSelectedTrackId(trackId);
  }, []);

  const handleZoomIn = useCallback(() => {
    setZoomLevel(prev => Math.min(prev * 1.5, 8));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoomLevel(prev => Math.max(prev / 1.5, 0.25));
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderTimelineRuler = () => {
    const duration = 240; // 4 minutes
    const steps = Math.floor(duration / (60 / zoomLevel));
    const markers = [];
    
    for (let i = 0; i <= steps; i++) {
      const time = (i * 60) / zoomLevel;
      const position = (time / duration) * 100;
      
      markers.push(
        <div key={i} className="absolute top-0 flex flex-col items-center" style={{ left: `${position}%` }}>
          <div className="w-px h-2 bg-[var(--border)]"></div>
          <span className="text-xs text-[var(--muted-foreground)] mt-1">{formatTime(time)}</span>
        </div>
      );
    }
    
    return markers;
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Ultra-Compact Toolbar */}
      <div className="bg-[var(--muted)] border-b border-[var(--border)] px-2 py-1 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="flex space-x-0.5">
            {[
              { tool: 'select', icon: Move, active: currentTool === 'select' },
              { tool: 'cut', icon: Scissors, active: currentTool === 'cut' },
              { tool: 'zoom', icon: ZoomIn, active: currentTool === 'zoom' },
            ].map(({ tool, icon: Icon, active }) => (
              <Button
                key={tool}
                variant="ghost"
                size="sm"
                onClick={() => setCurrentTool(tool as any)}
                className={`h-5 w-5 p-0 ${active ? 'bg-[var(--primary)] text-white' : 'hover:bg-[var(--accent)]'}`}
              >
                <Icon className="w-3 h-3" />
              </Button>
            ))}
          </div>
          
          <div className="h-3 border-l border-[var(--border)]"></div>
          
          <div className="flex items-center space-x-1">
            <Button variant="ghost" size="sm" onClick={handleZoomOut} className="h-5 w-5 p-0">
              <Minus className="w-3 h-3" />
            </Button>
            <span className="text-xs font-mono w-8 text-center">{Math.round(zoomLevel * 100)}%</span>
            <Button variant="ghost" size="sm" onClick={handleZoomIn} className="h-5 w-5 p-0">
              <Plus className="w-3 h-3" />
            </Button>
          </div>
          
          <div className="flex items-center space-x-1 text-xs">
            <span>Grid:</span>
            <select className="bg-[var(--input)] border-0 rounded px-1 py-0 text-xs h-4">
              <option>1/8</option>
              <option>1/4</option>
              <option>1/2</option>
            </select>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="text-xs text-[var(--muted-foreground)]">
            {formatTime(transport.currentTime)} / {formatTime(240)}
          </div>
          <Button
            onClick={() => setShowChatBox(!showChatBox)}
            variant={showChatBox ? "default" : "outline"}
            size="sm"
            className="h-5 px-2 text-xs"
          >
            AI
          </Button>
        </div>
      </div>

      {/* Compact AI Chat */}
      {showChatBox && (
        <div className="bg-[var(--secondary)] border-b border-[var(--border)] p-2">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={chatPrompt}
              onChange={(e) => setChatPrompt(e.target.value)}
              placeholder="AI command: 'add reverb', 'normalize track 2'..."
              className="flex-1 px-2 py-1 bg-[var(--background)] border border-[var(--border)] rounded text-xs"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  console.log('AI Command:', chatPrompt);
                  setChatPrompt('');
                  setShowChatBox(false);
                }
                if (e.key === 'Escape') setShowChatBox(false);
              }}
            />
            <Button size="sm" className="h-6 px-2 text-xs">Send</Button>
          </div>
        </div>
      )}

      {/* Timeline Ruler */}
      <div className="h-6 bg-[var(--muted)] border-b border-[var(--border)] relative overflow-hidden">
        <div className="relative h-full" style={{ width: `${100 * zoomLevel}%` }}>
          {renderTimelineRuler()}
          {/* Playhead */}
          <div 
            className="absolute top-0 bottom-0 w-0.5 bg-[var(--primary)] z-10"
            style={{ left: `${(transport.currentTime / 240) * 100}%` }}
          >
            <div className="w-2 h-2 bg-[var(--primary)] -ml-0.75 -mt-0.5 rotate-45"></div>
          </div>
        </div>
      </div>

      {/* Compact Track Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Track Headers */}
        <div className="w-36 border-r border-[var(--border)] bg-[var(--background)] flex flex-col">
          <div className="h-5 bg-[var(--muted)] border-b border-[var(--border)] px-2 flex items-center justify-between">
            <span className="text-xs font-medium">Tracks</span>
            <div className="flex space-x-0.5">
              <Button variant="ghost" size="sm" className="h-3 w-3 p-0">
                <Copy className="w-2 h-2" />
              </Button>
              <Button variant="ghost" size="sm" className="h-3 w-3 p-0">
                <Trash2 className="w-2 h-2" />
              </Button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {tracks.map((track) => (
              <div
                key={track.id}
                className={`h-6 border-b border-[var(--border)] px-2 py-1 cursor-pointer transition-colors group ${
                  selectedTrackId === track.id 
                    ? 'bg-[var(--accent)] border-l-2 border-l-[var(--primary)]' 
                    : 'hover:bg-[var(--accent)]/50'
                }`}
                onClick={() => handleTrackSelect(track.id)}
                onContextMenu={(e) => handleTrackRightClick(e, track.id)}
              >
                <div className="flex items-center justify-between h-full">
                  <div className="flex items-center space-x-1 min-w-0">
                    <div 
                      className="w-1.5 h-1.5 rounded-sm flex-shrink-0" 
                      style={{ backgroundColor: track.color }}
                    ></div>
                    <span className="text-xs font-medium text-[var(--foreground)] truncate">
                      {track.name}
                    </span>
                  </div>
                  <div className="flex items-center space-x-0.5">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        onTrackMute(track.id);
                      }}
                      variant="ghost"
                      size="sm"
                      className={`h-3 w-3 p-0 rounded ${
                        track.muted 
                          ? 'bg-[var(--red)] text-white' 
                          : 'hover:bg-[var(--accent)] opacity-50 group-hover:opacity-100'
                      }`}
                    >
                      {track.muted ? <VolumeX className="w-1.5 h-1.5" /> : <Volume2 className="w-1.5 h-1.5" />}
                    </Button>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        onTrackSolo(track.id);
                      }}
                      variant="ghost"
                      size="sm"
                      className={`h-3 w-3 p-0 rounded ${
                        track.soloed 
                          ? 'bg-[var(--yellow)] text-black' 
                          : 'hover:bg-[var(--accent)] opacity-50 group-hover:opacity-100'
                      }`}
                    >
                      {track.soloed ? <Radio className="w-1.5 h-1.5" /> : <Circle className="w-1.5 h-1.5" />}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline Content */}
        <div className="flex-1 overflow-auto scrollbar-thin" ref={timelineRef}>
          <div className="relative" style={{ width: `${100 * zoomLevel}%`, minHeight: `${tracks.length * 24}px` }}>
            {tracks.map((track, index) => (
              <div
                key={track.id}
                className={`absolute left-0 right-0 h-6 border-b border-[var(--border)] ${
                  selectedTrackId === track.id ? 'bg-[var(--accent)]/30' : 'hover:bg-[var(--muted)]/30'
                }`}
                style={{ top: `${index * 24}px` }}
                onClick={() => handleTrackSelect(track.id)}
                onContextMenu={(e) => handleTrackRightClick(e, track.id)}
              >
                {/* Audio Waveform */}
                <div className="h-full flex items-center px-1">
                  {track.waveformData && (
                    <WaveformVisualization
                      data={track.waveformData}
                      color={track.color}
                      fileName={track.name}
                      isPlaying={transport.isPlaying && !track.muted}
                    />
                  )}
                  {!track.waveformData && (
                    <div 
                      className="h-2 rounded opacity-60"
                      style={{ 
                        backgroundColor: track.color,
                        width: `${(Math.random() * 60 + 20)}%`
                      }}
                    ></div>
                  )}
                </div>
                
                {/* Track Effects Indicators */}
                {track.effects && track.effects.length > 0 && (
                  <div className="absolute top-0 right-1 flex space-x-0.5">
                    {track.effects.slice(0, 3).map((effect, i) => (
                      <div key={i} className="w-1 h-1 bg-[var(--primary)] rounded-full opacity-60"></div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            
            {/* Grid Lines */}
            <div className="absolute inset-0 pointer-events-none">
              {Array.from({ length: Math.floor(240 / (15 / zoomLevel)) }).map((_, i) => (
                <div
                  key={i}
                  className="absolute top-0 bottom-0 w-px bg-[var(--border)] opacity-30"
                  style={{ left: `${(i * 15 * zoomLevel / 240) * 100}%` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="fixed bg-[var(--background)] border border-[var(--border)] rounded-lg shadow-xl py-1 z-50 min-w-32"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={(e) => e.stopPropagation()}
        >
          {[
            { label: 'Duplicate', icon: Copy },
            { label: 'Rename', icon: Edit3 },
            { label: 'Delete', icon: Trash2 },
          ].map(({ label, icon: Icon }) => (
            <button
              key={label}
              onClick={() => {
                console.log(`${label} track:`, contextMenu.trackId);
                setContextMenu(null);
              }}
              className="w-full px-2 py-1 text-left text-xs hover:bg-[var(--accent)] flex items-center space-x-2"
            >
              <Icon className="w-3 h-3" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}