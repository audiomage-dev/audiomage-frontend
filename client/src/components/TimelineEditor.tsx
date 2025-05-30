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
  ZoomOut
} from 'lucide-react';

interface TimelineEditorProps {
  tracks: AudioTrack[];
  transport: TransportState;
  onTrackMute: (trackId: string) => void;
  onTrackSolo: (trackId: string) => void;
}

interface ContextMenuProps {
  x: number;
  y: number;
  trackId: string;
  onClose: () => void;
  onAction: (action: string, trackId: string) => void;
}

function TrackContextMenu({ x, y, trackId, onClose, onAction }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const [submenuPosition, setSubmenuPosition] = useState({ x: 0, y: 0 });

  const handleAction = (action: string) => {
    onAction(action, trackId);
    onClose();
  };

  const handleSubmenuHover = (submenu: string, event: React.MouseEvent) => {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    setActiveSubmenu(submenu);
    setSubmenuPosition({
      x: rect.right + 5,
      y: rect.top
    });
  };

  const handleSubmenuLeave = () => {
    setActiveSubmenu(null);
  };

  const effectsSubmenu = [
    { name: 'EQ - Parametric', icon: 'sliders-h', color: 'var(--frost3)' },
    { name: 'Compressor - Vintage', icon: 'compress-arrows-alt', color: 'var(--primary)' },
    { name: 'Reverb - Hall', icon: 'water', color: 'var(--frost1)' },
    { name: 'Delay - Stereo', icon: 'clock', color: 'var(--orange)' },
    { name: 'Saturation - Tube', icon: 'fire', color: 'var(--red)' },
    { name: 'AI DeNoise Pro', icon: 'robot', color: 'var(--purple)' }
  ];

  const sendsSubmenu = [
    { name: 'Send to Reverb Bus', icon: 'share', color: 'var(--frost1)' },
    { name: 'Send to Delay Bus', icon: 'share-alt', color: 'var(--orange)' },
    { name: 'Send to Parallel Comp', icon: 'code-branch', color: 'var(--primary)' },
    { name: 'Create New Send...', icon: 'plus', color: 'var(--green)' }
  ];

  return (
    <>
      <div
        ref={menuRef}
        className="fixed bg-[var(--background)] border border-[var(--border)] rounded-lg shadow-xl py-2 z-50 min-w-48"
        style={{ left: x, top: y }}
      >
        <div className="px-3 py-2 border-b border-[var(--border)]">
          <span className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">Track Actions</span>
        </div>
        
        <div className="py-1">
          <button
            onClick={() => handleAction('duplicate')}
            className="w-full px-3 py-2 text-left text-sm hover:bg-[var(--accent)] flex items-center space-x-2"
          >
            <i className="fas fa-copy text-[var(--primary)]"></i>
            <span>Duplicate Track</span>
          </button>
          
          <button
            onClick={() => handleAction('rename')}
            className="w-full px-3 py-2 text-left text-sm hover:bg-[var(--accent)] flex items-center space-x-2"
          >
            <i className="fas fa-edit text-[var(--frost2)]"></i>
            <span>Rename Track</span>
          </button>
          
          <button
            onClick={() => handleAction('color')}
            className="w-full px-3 py-2 text-left text-sm hover:bg-[var(--accent)] flex items-center space-x-2"
          >
            <i className="fas fa-palette text-[var(--purple)]"></i>
            <span>Change Color</span>
          </button>
          
          <div className="border-t border-[var(--border)] my-1"></div>
          
          <button
            onClick={() => handleAction('freeze')}
            className="w-full px-3 py-2 text-left text-sm hover:bg-[var(--accent)] flex items-center space-x-2"
          >
            <i className="fas fa-snowflake text-[var(--frost1)]"></i>
            <span>Freeze Track</span>
          </button>
          
          <button
            onClick={() => handleAction('bounce')}
            className="w-full px-3 py-2 text-left text-sm hover:bg-[var(--accent)] flex items-center space-x-2"
          >
            <i className="fas fa-download text-[var(--green)]"></i>
            <span>Bounce to Audio</span>
          </button>
          
          <div className="border-t border-[var(--border)] my-1"></div>
          
          <button
            onMouseEnter={(e) => handleSubmenuHover('effects', e)}
            onMouseLeave={handleSubmenuLeave}
            className="w-full px-3 py-2 text-left text-sm hover:bg-[var(--accent)] flex items-center justify-between"
          >
            <div className="flex items-center space-x-2">
              <i className="fas fa-sliders-h text-[var(--frost3)]"></i>
              <span>Add Effect</span>
            </div>
            <i className="fas fa-chevron-right text-xs text-[var(--muted-foreground)]"></i>
          </button>
          
          <button
            onMouseEnter={(e) => handleSubmenuHover('sends', e)}
            onMouseLeave={handleSubmenuLeave}
            className="w-full px-3 py-2 text-left text-sm hover:bg-[var(--accent)] flex items-center justify-between"
          >
            <div className="flex items-center space-x-2">
              <i className="fas fa-share text-[var(--orange)]"></i>
              <span>Add Send</span>
            </div>
            <i className="fas fa-chevron-right text-xs text-[var(--muted-foreground)]"></i>
          </button>
          
          <div className="border-t border-[var(--border)] my-1"></div>
          
          <button
            onClick={() => handleAction('delete')}
            className="w-full px-3 py-2 text-left text-sm hover:bg-[var(--accent)] hover:text-[var(--red)] flex items-center space-x-2"
          >
            <i className="fas fa-trash text-[var(--red)]"></i>
            <span>Delete Track</span>
          </button>
        </div>
      </div>

      {/* Submenus */}
      {activeSubmenu === 'effects' && (
        <div
          className="fixed bg-[var(--background)] border border-[var(--border)] rounded-lg shadow-xl py-2 z-50 min-w-52"
          style={{ left: submenuPosition.x, top: submenuPosition.y }}
          onMouseEnter={() => setActiveSubmenu('effects')}
          onMouseLeave={handleSubmenuLeave}
        >
          <div className="px-3 py-2 border-b border-[var(--border)]">
            <span className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">Effects</span>
          </div>
          {effectsSubmenu.map((effect, index) => (
            <button
              key={index}
              onClick={() => handleAction(`effect:${effect.name}`)}
              className="w-full px-3 py-2 text-left text-sm hover:bg-[var(--accent)] flex items-center space-x-2"
            >
              <i className={`fas fa-${effect.icon}`} style={{ color: effect.color }}></i>
              <span>{effect.name}</span>
            </button>
          ))}
        </div>
      )}

      {activeSubmenu === 'sends' && (
        <div
          className="fixed bg-[var(--background)] border border-[var(--border)] rounded-lg shadow-xl py-2 z-50 min-w-52"
          style={{ left: submenuPosition.x, top: submenuPosition.y }}
          onMouseEnter={() => setActiveSubmenu('sends')}
          onMouseLeave={handleSubmenuLeave}
        >
          <div className="px-3 py-2 border-b border-[var(--border)]">
            <span className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">Sends</span>
          </div>
          {sendsSubmenu.map((send, index) => (
            <button
              key={index}
              onClick={() => handleAction(`send:${send.name}`)}
              className="w-full px-3 py-2 text-left text-sm hover:bg-[var(--accent)] flex items-center space-x-2"
            >
              <i className={`fas fa-${send.icon}`} style={{ color: send.color }}></i>
              <span>{send.name}</span>
            </button>
          ))}
        </div>
      )}
    </>
  );
}

export function TimelineEditor({ tracks, transport, onTrackMute, onTrackSolo }: TimelineEditorProps) {
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; trackId: string } | null>(null);
  const [showChatBox, setShowChatBox] = useState(false);
  const [chatPrompt, setChatPrompt] = useState('');
  
  const handleTrackSelect = (trackId: string) => {
    setSelectedTrackId(trackId);
  };

  const handleTrackRightClick = (e: React.MouseEvent, trackId: string) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, trackId });
    setSelectedTrackId(trackId);
  };

  const handleContextMenuClose = () => {
    setContextMenu(null);
  };

  const handleContextMenuAction = (action: string, trackId: string) => {
    console.log(`Action: ${action} on track: ${trackId}`);
    // Handle different actions
    switch (action) {
      case 'duplicate':
        console.log('Duplicating track', trackId);
        break;
      case 'rename':
        console.log('Renaming track', trackId);
        break;
      case 'color':
        console.log('Changing color of track', trackId);
        break;
      case 'freeze':
        console.log('Freezing track', trackId);
        break;
      case 'bounce':
        console.log('Bouncing track', trackId);
        break;
      case 'delete':
        console.log('Deleting track', trackId);
        break;
      default:
        if (action.startsWith('effect:')) {
          console.log('Adding effect:', action.replace('effect:', ''), 'to track', trackId);
        } else if (action.startsWith('send:')) {
          console.log('Adding send:', action.replace('send:', ''), 'to track', trackId);
        }
        break;
    }
  };

  const handleChatSubmit = () => {
    if (chatPrompt.trim()) {
      console.log('AI Chat Prompt:', chatPrompt);
      // Process the chat prompt here
      setChatPrompt('');
      setShowChatBox(false);
    }
  };

  const handleChatKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleChatSubmit();
    }
    if (e.key === 'Escape') {
      setShowChatBox(false);
      setChatPrompt('');
    }
  };

  // Close context menu when clicking outside
  const handleGlobalClick = () => {
    if (contextMenu) {
      setContextMenu(null);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex-1 flex flex-col" onClick={handleGlobalClick}>
      {/* Compact Toolbar */}
      <div className="bg-[var(--muted)] border-b border-[var(--border)] px-3 py-1 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex space-x-0.5">
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 bg-[var(--primary)] text-white">
              <Move className="w-3 h-3" />
            </Button>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-[var(--accent)]">
              <Scissors className="w-3 h-3" />
            </Button>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-[var(--accent)]">
              <ZoomIn className="w-3 h-3" />
            </Button>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-[var(--accent)]">
              <ZoomOut className="w-3 h-3" />
            </Button>
          </div>
          <div className="h-3 border-l border-[var(--border)]"></div>
          <div className="flex items-center space-x-1 text-xs">
            <span>Snap:</span>
            <select className="bg-[var(--input)] border border-[var(--border)] rounded px-1 py-0 text-xs h-5">
              <option>1/16</option>
              <option>1/8</option>
              <option>1/4</option>
            </select>
          </div>
          <div className="flex items-center space-x-2 text-xs text-[var(--muted-foreground)]">
            <span>48kHz</span>
            <span>•</span>
            <span>256</span>
            <span>•</span>
            <div className="flex items-center space-x-1">
              <div className="w-1.5 h-1.5 bg-[var(--green)] rounded-full"></div>
              <span>23%</span>
            </div>
          </div>
        </div>
        
        <Button
          onClick={() => setShowChatBox(!showChatBox)}
          variant={showChatBox ? "default" : "outline"}
          size="sm"
          className="h-6 px-2 text-xs"
        >
          <span>AI</span>
        </Button>
      </div>

      {/* AI Chat Box */}
      {showChatBox && (
        <div className="bg-gradient-to-r from-[var(--muted)] to-[var(--secondary)] border-b border-[var(--border)] p-4">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-[var(--green)] rounded-full animate-pulse"></div>
              <span className="text-sm font-semibold text-[var(--foreground)]">AI Assistant</span>
            </div>
            
            <div className="flex-1 flex items-center space-x-2">
              <div className="relative flex-1">
                <i className="fas fa-magic absolute left-3 top-3 text-[var(--muted-foreground)] text-sm"></i>
                <input
                  type="text"
                  value={chatPrompt}
                  onChange={(e) => setChatPrompt(e.target.value)}
                  onKeyDown={handleChatKeyPress}
                  placeholder="Ask AI: 'Add reverb to lead vocal', 'Make drums punchier', 'Auto-master this track'..."
                  className="w-full pl-10 pr-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-sm text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
                  autoFocus
                />
              </div>
              
              <Button
                onClick={handleChatSubmit}
                disabled={!chatPrompt.trim()}
                size="sm"
                className="px-4 py-2 h-10 bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <i className="fas fa-paper-plane mr-2"></i>
                Send
              </Button>
              
              <Button
                onClick={() => setShowChatBox(false)}
                variant="outline"
                size="sm"
                className="px-3 py-2 h-10 border-[var(--border)] hover:bg-[var(--accent)]"
              >
                <i className="fas fa-times"></i>
              </Button>
            </div>
          </div>
          
          <div className="mt-3 flex items-center space-x-4 text-xs text-[var(--muted-foreground)]">
            <span>💡 Try: "Add EQ to track 2", "Create harmony for vocals", "Mix for streaming"</span>
            <div className="flex items-center space-x-1">
              <span>Press</span>
              <kbd className="px-2 py-1 bg-[var(--secondary)] border border-[var(--border)] rounded text-xs">Enter</kbd>
              <span>to send,</span>
              <kbd className="px-2 py-1 bg-[var(--secondary)] border border-[var(--border)] rounded text-xs">Esc</kbd>
              <span>to close</span>
            </div>
          </div>
        </div>
      )}

      {/* Timeline Header */}
      <div className="bg-[var(--muted)] border-b border-[var(--border)] p-2">
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
            <div 
              key={track.id} 
              className={`flex border-b border-[var(--border)] ${
                selectedTrackId === track.id ? 'bg-[var(--accent)]' : 'hover:bg-[var(--muted)]/50'
              } transition-colors cursor-pointer`}
              onClick={() => handleTrackSelect(track.id)}
              onContextMenu={(e) => handleTrackRightClick(e, track.id)}
            >
              {/* Track Header */}
              <div className="w-48 bg-[var(--muted)] border-r border-[var(--border)] p-2 flex flex-col justify-center">
                <div className="flex items-center space-x-2 mb-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`w-4 h-4 rounded-sm text-xs h-auto p-0 ${
                      !track.muted ? 'bg-[var(--green)]' : 'bg-[var(--secondary)]'
                    }`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    ●
                  </Button>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      onTrackMute(track.id);
                    }}
                    variant="ghost"
                    size="sm"
                    className={`w-4 h-4 rounded-sm text-xs h-auto p-0 ${
                      track.muted ? 'bg-[var(--orange)]' : 'bg-[var(--secondary)] hover:bg-[var(--orange)]'
                    }`}
                  >
                    M
                  </Button>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      onTrackSolo(track.id);
                    }}
                    variant="ghost"
                    size="sm"
                    className={`w-4 h-4 rounded-sm text-xs h-auto p-0 ${
                      track.soloed ? 'bg-[var(--yellow)]' : 'bg-[var(--secondary)] hover:bg-[var(--yellow)]'
                    }`}
                  >
                    S
                  </Button>
                  {track.type === 'ai-generated' && (
                    <i className="fas fa-robot text-[var(--frost1)] text-xs"></i>
                  )}
                </div>
                <div className={`text-xs font-semibold`} style={{ color: track.color }}>
                  {track.name}
                </div>
                <div className="text-xs text-[var(--muted-foreground)]">
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

      {/* Context Menu */}
      {contextMenu && (
        <TrackContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          trackId={contextMenu.trackId}
          onClose={handleContextMenuClose}
          onAction={handleContextMenuAction}
        />
      )}
    </div>
  );
}
