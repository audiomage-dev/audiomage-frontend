import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { Moon, Sun, Settings, Mic2, Search, Command, Play, Pause, Square, Volume2, Plus, Minus } from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onCommand: (command: string) => void;
}

interface MetronomeProps {
  isOpen: boolean;
  onClose: () => void;
  currentBpm: number;
  timeSignature: [number, number];
  onBpmChange: (bpm: number) => void;
  onTimeSignatureChange: (timeSignature: [number, number]) => void;
}

function CommandPalette({ isOpen, onClose, onCommand }: CommandPaletteProps) {
  const [searchTerm, setSearchTerm] = useState('');
  
  const commands = [
    { id: 'new-project', name: 'New Project', category: 'File', shortcut: 'Ctrl+N' },
    { id: 'open-project', name: 'Open Project', category: 'File', shortcut: 'Ctrl+O' },
    { id: 'save-project', name: 'Save Project', category: 'File', shortcut: 'Ctrl+S' },
    { id: 'export-audio', name: 'Export Audio', category: 'File', shortcut: 'Ctrl+E' },
    { id: 'import-audio', name: 'Import Audio File', category: 'File', shortcut: 'Ctrl+I' },
    
    { id: 'undo', name: 'Undo', category: 'Edit', shortcut: 'Ctrl+Z' },
    { id: 'redo', name: 'Redo', category: 'Edit', shortcut: 'Ctrl+Y' },
    { id: 'cut', name: 'Cut', category: 'Edit', shortcut: 'Ctrl+X' },
    { id: 'copy', name: 'Copy', category: 'Edit', shortcut: 'Ctrl+C' },
    { id: 'paste', name: 'Paste', category: 'Edit', shortcut: 'Ctrl+V' },
    { id: 'select-all', name: 'Select All', category: 'Edit', shortcut: 'Ctrl+A' },
    
    { id: 'add-track', name: 'Add Audio Track', category: 'Track', shortcut: 'Ctrl+T' },
    { id: 'duplicate-track', name: 'Duplicate Track', category: 'Track', shortcut: 'Ctrl+D' },
    { id: 'mute-track', name: 'Mute Selected Track', category: 'Track', shortcut: 'M' },
    { id: 'solo-track', name: 'Solo Selected Track', category: 'Track', shortcut: 'S' },
    { id: 'record-enable', name: 'Record Enable Track', category: 'Track', shortcut: 'R' },
    
    { id: 'mixer-view', name: 'Show Mixer', category: 'Mix', shortcut: 'F3' },
    { id: 'eq-track', name: 'Add EQ to Track', category: 'Mix', shortcut: 'Ctrl+Q' },
    { id: 'compressor-track', name: 'Add Compressor', category: 'Mix', shortcut: 'Ctrl+K' },
    { id: 'reverb-track', name: 'Add Reverb', category: 'Mix', shortcut: 'Ctrl+R' },
    
    { id: 'zoom-in', name: 'Zoom In', category: 'View', shortcut: 'Ctrl+=' },
    { id: 'zoom-out', name: 'Zoom Out', category: 'View', shortcut: 'Ctrl+-' },
    { id: 'fit-to-window', name: 'Fit to Window', category: 'View', shortcut: 'Ctrl+0' },
    { id: 'toggle-timeline', name: 'Toggle Timeline', category: 'View', shortcut: 'F1' },
    { id: 'toggle-mixer', name: 'Toggle Mixer', category: 'View', shortcut: 'F2' },
    
    { id: 'ai-master', name: 'AI Auto-Master', category: 'AI', shortcut: 'Ctrl+Shift+M' },
    { id: 'ai-enhance', name: 'AI Enhance Audio', category: 'AI', shortcut: 'Ctrl+Shift+E' },
    { id: 'ai-denoise', name: 'AI Noise Reduction', category: 'AI', shortcut: 'Ctrl+Shift+N' },
    { id: 'ai-chat', name: 'Open AI Chat', category: 'AI', shortcut: 'Ctrl+Shift+A' },
  ];

  const filteredCommands = commands.filter(cmd =>
    cmd.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cmd.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'Enter' && filteredCommands.length > 0) {
      onCommand(filteredCommands[0].id);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-32">
      <div className="bg-[var(--background)] border border-[var(--border)] rounded-xl shadow-2xl w-full max-w-2xl mx-4">
        {/* Search Header */}
        <div className="p-4 border-b border-[var(--border)]">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-[var(--muted-foreground)]" />
            <input
              type="text"
              placeholder="Type a command or search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full pl-10 pr-4 py-2 bg-[var(--input)] border border-[var(--border)] rounded-lg text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
              autoFocus
            />
          </div>
        </div>

        {/* Commands List */}
        <div className="max-h-96 overflow-y-auto scrollbar-thin">
          {filteredCommands.length > 0 ? (
            <div className="p-2">
              {Object.entries(
                filteredCommands.reduce((groups, cmd) => {
                  if (!groups[cmd.category]) groups[cmd.category] = [];
                  groups[cmd.category].push(cmd);
                  return groups;
                }, {} as Record<string, typeof commands>)
              ).map(([category, commands]) => (
                <div key={category} className="mb-3">
                  <div className="px-2 py-1 text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">
                    {category}
                  </div>
                  {commands.map((cmd) => (
                    <button
                      key={cmd.id}
                      onClick={() => {
                        onCommand(cmd.id);
                        onClose();
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-[var(--accent)] rounded-lg transition-colors"
                    >
                      <span className="text-sm text-[var(--foreground)]">{cmd.name}</span>
                      <span className="text-xs text-[var(--muted-foreground)] font-mono">{cmd.shortcut}</span>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-[var(--muted-foreground)]">
              <Search className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No commands found</p>
              <p className="text-xs mt-1">Try searching for "track", "AI", or "export"</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-[var(--border)] bg-[var(--muted)] rounded-b-xl">
          <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)]">
            <div className="flex items-center space-x-4">
              <span>
                <kbd className="px-2 py-1 bg-[var(--secondary)] border border-[var(--border)] rounded">↑↓</kbd>
                <span className="ml-1">to navigate</span>
              </span>
              <span>
                <kbd className="px-2 py-1 bg-[var(--secondary)] border border-[var(--border)] rounded">↵</kbd>
                <span className="ml-1">to select</span>
              </span>
              <span>
                <kbd className="px-2 py-1 bg-[var(--secondary)] border border-[var(--border)] rounded">esc</kbd>
                <span className="ml-1">to cancel</span>
              </span>
            </div>
            <span>{filteredCommands.length} commands</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Metronome({ isOpen, onClose, currentBpm, timeSignature, onBpmChange, onTimeSignatureChange }: MetronomeProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(75);
  const [accent, setAccent] = useState(true);
  const [currentBeat, setCurrentBeat] = useState(0);
  const [bpmInput, setBpmInput] = useState(currentBpm.toString());

  useEffect(() => {
    setBpmInput(currentBpm.toString());
  }, [currentBpm]);

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentBeat(prev => (prev + 1) % timeSignature[0]);
    }, (60 / currentBpm) * 1000);

    return () => clearInterval(interval);
  }, [isPlaying, currentBpm, timeSignature]);

  const handleBpmInputChange = (value: string) => {
    setBpmInput(value);
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue >= 40 && numValue <= 300) {
      onBpmChange(numValue);
    }
  };

  const adjustBpm = (delta: number) => {
    const newBpm = Math.max(40, Math.min(300, currentBpm + delta));
    onBpmChange(newBpm);
  };

  const presetBpms = [60, 72, 80, 90, 100, 110, 120, 130, 140, 150, 160, 180];
  const timeSignatures: [number, number][] = [[4, 4], [3, 4], [2, 4], [6, 8], [9, 8], [12, 8]];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[var(--background)] border border-[var(--border)] rounded-lg shadow-xl p-6 w-96 max-w-[90vw]">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-[var(--foreground)]">Metronome</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            ×
          </Button>
        </div>

        {/* BPM Display and Controls */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center space-x-4 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => adjustBpm(-1)}
              className="h-8 w-8 p-0"
            >
              <Minus className="h-4 w-4" />
            </Button>
            
            <div className="flex flex-col items-center">
              <input
                type="number"
                value={bpmInput}
                onChange={(e) => handleBpmInputChange(e.target.value)}
                className="text-4xl font-bold text-center bg-transparent border-none outline-none w-24 text-[var(--foreground)]"
                min="40"
                max="300"
              />
              <span className="text-sm text-[var(--muted-foreground)]">BPM</span>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => adjustBpm(1)}
              className="h-8 w-8 p-0"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Fine adjustment */}
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Button variant="outline" size="sm" onClick={() => adjustBpm(-10)}>-10</Button>
            <Button variant="outline" size="sm" onClick={() => adjustBpm(-5)}>-5</Button>
            <Button variant="outline" size="sm" onClick={() => adjustBpm(5)}>+5</Button>
            <Button variant="outline" size="sm" onClick={() => adjustBpm(10)}>+10</Button>
          </div>
        </div>

        {/* Transport Controls */}
        <div className="flex items-center justify-center space-x-3 mb-6">
          <Button
            variant={isPlaying ? "default" : "outline"}
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center space-x-2"
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            <span>{isPlaying ? "Stop" : "Start"}</span>
          </Button>
          
          <Button
            variant="outline"
            onClick={() => setIsPlaying(false)}
          >
            <Square className="h-4 w-4" />
          </Button>
        </div>

        {/* Beat Indicator */}
        <div className="flex justify-center space-x-2 mb-6">
          {Array.from({ length: timeSignature[0] }, (_, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full transition-colors duration-100 ${
                i === currentBeat && isPlaying
                  ? i === 0 && accent
                    ? 'bg-[var(--red)]'
                    : 'bg-[var(--primary)]'
                  : 'bg-[var(--muted)]'
              }`}
            />
          ))}
        </div>

        {/* Time Signature */}
        <div className="mb-6">
          <label className="text-sm font-medium text-[var(--foreground)] mb-2 block">Time Signature</label>
          <div className="flex flex-wrap gap-2">
            {timeSignatures.map((sig) => (
              <Button
                key={`${sig[0]}/${sig[1]}`}
                variant={timeSignature[0] === sig[0] && timeSignature[1] === sig[1] ? "default" : "outline"}
                size="sm"
                onClick={() => onTimeSignatureChange(sig)}
              >
                {sig[0]}/{sig[1]}
              </Button>
            ))}
          </div>
        </div>

        {/* Volume and Settings */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-[var(--foreground)] mb-2 block">Volume</label>
            <div className="flex items-center space-x-3">
              <Volume2 className="h-4 w-4 text-[var(--muted-foreground)]" />
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => setVolume(parseInt(e.target.value))}
                className="flex-1"
              />
              <span className="text-sm text-[var(--muted-foreground)] w-8">{volume}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-[var(--foreground)]">Accent first beat</label>
            <Button
              variant={accent ? "default" : "outline"}
              size="sm"
              onClick={() => setAccent(!accent)}
            >
              {accent ? "On" : "Off"}
            </Button>
          </div>
        </div>

        {/* BPM Presets */}
        <div className="mt-6">
          <label className="text-sm font-medium text-[var(--foreground)] mb-2 block">Quick BPM</label>
          <div className="grid grid-cols-6 gap-2">
            {presetBpms.map((bpm) => (
              <Button
                key={bpm}
                variant={currentBpm === bpm ? "default" : "outline"}
                size="sm"
                onClick={() => onBpmChange(bpm)}
                className="text-xs"
              >
                {bpm}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function MenuBar() {
  const { theme, toggleTheme } = useTheme();
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showMetronome, setShowMetronome] = useState(false);
  const [bpm, setBpm] = useState(120);
  const [timeSignature, setTimeSignature] = useState<[number, number]>([4, 4]);

  const handleCommand = (commandId: string) => {
    console.log('Executing command:', commandId);
    // Handle command execution here
  };

  // Global keyboard shortcut for command palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'P') {
        e.preventDefault();
        setShowCommandPalette(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <div className="h-12 bg-gradient-to-r from-[var(--background)] via-[var(--muted)] to-[var(--background)] border-b border-[var(--border)] px-6 flex items-center justify-between shadow-lg">
        <div className="flex items-center space-x-8">
          <div className="flex items-center space-x-3">
            <div className="flex space-x-1">
              <div className="w-3 h-3 rounded-full bg-[var(--red)] shadow-sm"></div>
              <div className="w-3 h-3 rounded-full bg-[var(--yellow)] shadow-sm"></div>
              <div className="w-3 h-3 rounded-full bg-[var(--green)] shadow-sm"></div>
            </div>
            <Mic2 className="w-5 h-5 text-[var(--primary)]" />
            <span className="font-bold text-lg bg-gradient-to-r from-[var(--primary)] to-[var(--frost3)] bg-clip-text text-transparent">
              Audiomage Studio
            </span>
          </div>
          
          {/* Command Palette Trigger */}
          <Button
            onClick={() => setShowCommandPalette(true)}
            variant="outline"
            size="sm"
            className="flex items-center space-x-2 px-4 py-2 border-[var(--border)] hover:bg-[var(--accent)] transition-all duration-200"
          >
            <Command className="w-4 h-4" />
            <span className="text-sm">Command Palette</span>
            <kbd className="px-2 py-1 bg-[var(--secondary)] border border-[var(--border)] rounded text-xs">⌘⇧P</kbd>
          </Button>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3 bg-[var(--muted)] px-4 py-2 rounded-xl border border-[var(--border)]">
            <div className="w-2 h-2 rounded-full bg-[var(--green)] animate-pulse"></div>
            <span className="text-sm font-medium text-[var(--muted-foreground)]">AI Ready</span>
          </div>
          
          <div 
            className="flex items-center space-x-2 bg-[var(--secondary)] px-3 py-2 rounded-lg cursor-pointer hover:bg-[var(--secondary)]/80 transition-colors"
            onClick={() => setShowMetronome(true)}
          >
            <span className="text-sm font-mono font-bold text-[var(--secondary-foreground)]">{bpm}</span>
            <span className="text-xs text-[var(--muted-foreground)]">BPM</span>
            <div className="w-px h-4 bg-[var(--border)]"></div>
            <span className="text-sm font-mono font-bold text-[var(--secondary-foreground)]">{timeSignature[0]}/{timeSignature[1]}</span>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={toggleTheme}
            className="h-9 w-9 p-0 rounded-lg border-[var(--border)] hover:bg-[var(--accent)] transition-all duration-200"
          >
            {theme === 'nord-light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </Button>

        </div>
      </div>

      <CommandPalette
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        onCommand={handleCommand}
      />

      <Metronome
        isOpen={showMetronome}
        onClose={() => setShowMetronome(false)}
        currentBpm={bpm}
        timeSignature={timeSignature}
        onBpmChange={setBpm}
        onTimeSignatureChange={setTimeSignature}
      />
    </>
  );
}
