import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link } from 'wouter';
import { useTheme } from '../contexts/ThemeContext';
import audiomageLogoPath from '@assets/audiomage-logo-transparent.png';
import { 
  Search, 
  Command, 
  Sun, 
  Moon, 
  Volume2, 
  Play, 
  Pause, 
  Minus, 
  Plus,
  Shield,
  Bell,
  User,
  ChevronDown,
  Globe,
  UserPlus,
  Terminal,
  LogOut,
  Settings,
  X,
  UserCheck,
  Eye,
  Edit,
  Crown
} from 'lucide-react';

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
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-start justify-center pt-20 z-50">
      <div className="bg-[var(--background)] border border-[var(--border)] rounded-xl shadow-2xl w-[600px] max-w-[90vw] max-h-[70vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-[var(--border)] bg-[var(--muted)] rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-[var(--primary)] rounded-lg flex items-center justify-center">
                <Command className="h-4 w-4 text-[var(--primary-foreground)]" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[var(--foreground)]">Command Palette</h3>
                <p className="text-xs text-[var(--muted-foreground)]">Quick access to all functions</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 hover:bg-[var(--accent)]"
            >
              ×
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-[var(--border)]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
            <Input
              placeholder="Search commands..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pl-10 bg-[var(--secondary)] border-[var(--border)] focus:ring-[var(--ring)]"
              autoFocus
            />
          </div>
        </div>

        {/* Commands */}
        <div className="flex-1 overflow-y-auto p-2">
          {filteredCommands.length > 0 ? (
            <div className="space-y-1">
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
  const [currentBeat, setCurrentBeat] = useState(0);
  const [volume, setVolume] = useState(50);
  const audioContextRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize audio context
  const initAudioContext = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  };

  // Play click sound
  const playClick = (isAccent: boolean = false) => {
    const audioContext = initAudioContext();
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Higher frequency for accent beats
    oscillator.frequency.setValueAtTime(isAccent ? 1200 : 800, audioContext.currentTime);
    oscillator.type = 'sine';

    // Volume control
    const adjustedVolume = (volume / 100) * 0.1; // Keep volume reasonable
    gainNode.gain.setValueAtTime(adjustedVolume, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  };

  // Start/stop metronome
  const togglePlayback = () => {
    if (isPlaying) {
      stopMetronome();
    } else {
      startMetronome();
    }
  };

  const startMetronome = () => {
    const interval = 60000 / currentBpm; // Convert BPM to milliseconds
    let beat = 0;

    const tick = () => {
      const isAccent = beat === 0; // First beat of measure is accent
      playClick(isAccent);
      setCurrentBeat(beat);
      beat = (beat + 1) % timeSignature[0];
    };

    // Play first beat immediately
    tick();
    
    intervalRef.current = setInterval(tick, interval);
    setIsPlaying(true);
  };

  const stopMetronome = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsPlaying(false);
    setCurrentBeat(0);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopMetronome();
    };
  }, []);

  // Update interval when BPM changes
  useEffect(() => {
    if (isPlaying) {
      stopMetronome();
      startMetronome();
    }
  }, [currentBpm]);

  const adjustBpm = (delta: number) => {
    const newBpm = Math.max(60, Math.min(200, currentBpm + delta));
    onBpmChange(newBpm);
  };

  const presetBpms = [60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 170, 180];
  const timeSignatures: [number, number][] = [[4, 4], [3, 4], [2, 4], [6, 8], [9, 8], [12, 8]];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-start justify-center pt-20 z-50">
      <div className="bg-[var(--background)] border border-[var(--border)] rounded-xl shadow-2xl w-[600px] max-w-[90vw] max-h-[70vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-[var(--border)] bg-[var(--muted)] rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-[var(--primary)] rounded-lg flex items-center justify-center">
                <Volume2 className="h-4 w-4 text-[var(--primary-foreground)]" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[var(--foreground)]">Metronome</h3>
                <p className="text-xs text-[var(--muted-foreground)]">Professional timing and tempo control</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 hover:bg-[var(--accent)]"
            >
              ×
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* BPM Display and Controls */}
          <div className="text-center mb-8">
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
                  value={currentBpm}
                  onChange={(e) => onBpmChange(Math.max(60, Math.min(200, parseInt(e.target.value) || 60)))}
                  className="text-4xl font-bold text-center bg-transparent border-none outline-none w-20 text-[var(--foreground)]"
                  min="60"
                  max="200"
                />
                <span className="text-sm text-[var(--muted-foreground)] uppercase tracking-wider">BPM</span>
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

            {/* Beat Indicator */}
            <div className="flex items-center justify-center space-x-2 mb-6">
              {Array.from({ length: timeSignature[0] }, (_, i) => (
                <div
                  key={i}
                  className={`w-4 h-4 rounded-full border-2 transition-all duration-100 ${
                    i === currentBeat && isPlaying
                      ? 'bg-[var(--primary)] border-[var(--primary)] scale-125'
                      : i === 0
                      ? 'border-[var(--primary)] bg-transparent'
                      : 'border-[var(--muted-foreground)] bg-transparent'
                  }`}
                />
              ))}
            </div>

            {/* Play/Pause Button */}
            <Button
              onClick={togglePlayback}
              className="h-16 w-16 rounded-full bg-[var(--primary)] hover:bg-[var(--primary)]/90 mb-6"
            >
              {isPlaying ? (
                <Pause className="h-6 w-6 text-[var(--primary-foreground)]" />
              ) : (
                <Play className="h-6 w-6 text-[var(--primary-foreground)] ml-1" />
              )}
            </Button>
          </div>

          {/* Time Signature */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Time Signature</label>
            <div className="flex justify-center space-x-2">
              {timeSignatures.map((sig) => (
                <Button
                  key={`${sig[0]}/${sig[1]}`}
                  variant={timeSignature[0] === sig[0] && timeSignature[1] === sig[1] ? "default" : "outline"}
                  size="sm"
                  onClick={() => onTimeSignatureChange(sig)}
                  className="text-xs"
                >
                  {sig[0]}/{sig[1]}
                </Button>
              ))}
            </div>
          </div>

          {/* Volume Control */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Volume</label>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-[var(--muted-foreground)]">0</span>
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => setVolume(parseInt(e.target.value))}
                className="flex-1 h-2 bg-[var(--secondary)] rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-sm text-[var(--muted-foreground)]">100</span>
            </div>
            <div className="text-center mt-1 text-sm text-[var(--muted-foreground)]">{volume}%</div>
          </div>

          {/* BPM Presets */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Quick BPM</label>
            <div className="grid grid-cols-4 gap-2">
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

        {/* Footer */}
        <div className="p-3 border-t border-[var(--border)] bg-[var(--muted)] rounded-b-xl">
          <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)]">
            <div className="flex items-center space-x-4">
              <span>Click BPM display in transport to open</span>
            </div>
            <span>{timeSignature[0]}/{timeSignature[1]} at {currentBpm} BPM</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function MenuBar() {
  const { theme, toggleTheme } = useTheme();
  const [showCommandPalette, setShowCommandPalette] = useState(false);

  const [projectName, setProjectName] = useState("Untitled Project");
  const [isEditingName, setIsEditingName] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showAccessModal, setShowAccessModal] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const handleCommand = (commandId: string) => {
    console.log('Executing command:', commandId);
    // Handle command execution here
  };

  const handleProjectNameEdit = () => {
    setIsEditingName(true);
  };

  const handleProjectNameSave = (newName: string) => {
    setProjectName(newName.trim() || "Untitled Project");
    setIsEditingName(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleProjectNameSave(e.currentTarget.value);
    } else if (e.key === 'Escape') {
      setIsEditingName(false);
    }
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

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  return (
    <>
      <div className="h-12 bg-gradient-to-r from-[var(--background)] via-[var(--muted)] to-[var(--background)] border-b border-[var(--border)] px-6 flex items-center justify-between shadow-lg">
        {/* Left side - Project Info */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Link href="/home">
              <img 
                src={audiomageLogoPath} 
                alt="Audiomage Logo" 
                className="w-8 h-8 object-contain cursor-pointer hover:opacity-80 transition-opacity"
              />
            </Link>
            {isEditingName ? (
              <input
                type="text"
                defaultValue={projectName}
                className="text-sm font-medium text-[var(--foreground)] bg-transparent border-none outline-none focus:bg-[var(--muted)] px-1 rounded"
                onBlur={(e) => handleProjectNameSave(e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
                style={{ width: `${Math.max(projectName.length * 8 + 20, 120)}px` }}
              />
            ) : (
              <span 
                className="text-sm font-medium text-[var(--foreground)] cursor-pointer hover:bg-[var(--muted)] px-1 rounded transition-colors"
                onClick={handleProjectNameEdit}
                title="Click to edit project name"
              >
                {projectName}
              </span>
            )}
            <span className="text-xs text-[var(--muted-foreground)]">•</span>
            <span className="text-xs text-[var(--muted-foreground)]">Saved</span>
          </div>
        </div>

        {/* Center - Quick Actions */}
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowCommandPalette(true)}
            className="text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          >
            <Command className="h-4 w-4 mr-1" />
            Commands
          </Button>
          

        </div>

        {/* Right side - Controls */}
        <div className="flex items-center space-x-2">
          {/* Access Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAccessModal(true)}
            className="text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          >
            <Shield className="h-4 w-4 mr-1" />
            Access
          </Button>



          {/* Notification Bell */}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 relative"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-2 w-2"></span>
          </Button>

          {/* User Avatar Menu */}
          <div className="relative" ref={userMenuRef}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="h-8 w-8 p-0 rounded-full bg-blue-600 hover:bg-blue-700"
            >
              <User className="h-4 w-4 text-white" />
            </Button>
            
            {showUserMenu && (
              <div className="absolute right-0 top-10 w-64 bg-[var(--popover)] border border-[var(--border)] rounded-lg shadow-lg z-50 opacity-100">
                <div className="p-3 border-b border-[var(--border)]">
                  <div className="text-sm font-medium text-[var(--popover-foreground)]">Switch Workspace</div>
                </div>
                
                <div className="py-2">
                  <div className="px-3 py-2 hover:bg-[var(--muted)] cursor-pointer">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
                        <User className="h-3 w-3 text-white" />
                      </div>
                      <span className="text-sm text-[var(--popover-foreground)]">Personal</span>
                    </div>
                  </div>
                  
                  <div className="px-3 py-2 hover:bg-[var(--muted)] cursor-pointer">
                    <div className="flex items-center space-x-3">
                      <img 
                        src={audiomageLogoPath} 
                        alt="A" 
                        className="w-6 h-6 object-contain"
                      />
                      <div className="flex-1">
                        <span className="text-sm text-[var(--popover-foreground)]">Audiomage BV</span>
                        <span className="text-xs text-[var(--muted-foreground)] ml-2">Admin</span>
                        <ChevronDown className="h-3 w-3 inline ml-1" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-[var(--border)] py-2">
                  <div className="px-3 py-2 hover:bg-[var(--muted)] cursor-pointer">
                    <div className="flex items-center space-x-3">
                      <Settings className="h-4 w-4 text-[var(--muted-foreground)]" />
                      <span className="text-sm text-[var(--popover-foreground)]">Account</span>
                    </div>
                  </div>
                  
                  <div className="px-3 py-2 hover:bg-[var(--muted)] cursor-pointer">
                    <div className="flex items-center space-x-3">
                      <User className="h-4 w-4 text-[var(--muted-foreground)]" />
                      <span className="text-sm text-[var(--popover-foreground)]">Profile</span>
                    </div>
                  </div>
                  
                  <div className="px-3 py-2 hover:bg-[var(--muted)] cursor-pointer">
                    <div className="flex items-center space-x-3">
                      <UserPlus className="h-4 w-4 text-[var(--muted-foreground)]" />
                      <span className="text-sm text-[var(--popover-foreground)]">Create Team</span>
                    </div>
                  </div>
                  
                  <div className="px-3 py-2 hover:bg-[var(--muted)] cursor-pointer">
                    <div className="flex items-center space-x-3">
                      <Terminal className="h-4 w-4 text-[var(--muted-foreground)]" />
                      <span className="text-sm text-[var(--popover-foreground)]">CLUI</span>
                    </div>
                  </div>
                  
                  <div className="px-3 py-2 hover:bg-[var(--muted)] cursor-pointer">
                    <div className="flex items-center space-x-3">
                      <LogOut className="h-4 w-4 text-[var(--muted-foreground)]" />
                      <span className="text-sm text-[var(--popover-foreground)]">Log out</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="h-8 w-8 p-0"
          >
            {theme === 'nord-dark' ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      <CommandPalette
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        onCommand={handleCommand}
      />

      {/* Access Modal */}
      {showAccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-[var(--popover)] border border-[var(--border)] rounded-xl shadow-2xl w-[520px] max-h-[80vh] overflow-hidden backdrop-blur-sm">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-[var(--primary)]" />
                <h2 className="text-lg font-semibold text-[var(--popover-foreground)]">Audio Project Access</h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAccessModal(false)}
                className="h-8 w-8 p-0 hover:bg-[var(--muted)]"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Project Info */}
            <div className="p-4 border-b border-[var(--border)] bg-[var(--muted)]/20">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded bg-[var(--primary)] flex items-center justify-center">
                  <span className="text-[var(--primary-foreground)] font-semibold text-sm">A</span>
                </div>
                <div>
                  <div className="text-sm font-medium text-[var(--popover-foreground)]">Audio Production Studio</div>
                  <div className="text-xs text-[var(--muted-foreground)]">audiomage-audio-project</div>
                </div>
              </div>
            </div>

            {/* Search Bar */}
            <div className="p-4 border-b border-[var(--border)]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
                <Input
                  placeholder="Share with groups or other members"
                  className="pl-10 bg-[var(--background)] border-[var(--border)] text-[var(--foreground)]"
                />
              </div>
            </div>

            {/* Content */}
            <div className="max-h-[400px] overflow-y-auto">
              {/* Groups with access */}
              <div className="p-4">
                <h3 className="text-sm font-medium text-[var(--popover-foreground)] mb-3">Groups with access</h3>
                
                {/* Audio Production Team */}
                <div className="mb-4">
                  <div className="flex items-center justify-between p-3 rounded-lg border border-[var(--border)] bg-[var(--background)]">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded bg-[var(--primary)] flex items-center justify-center">
                        <span className="text-[var(--primary-foreground)] font-semibold text-sm">A</span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-[var(--popover-foreground)]">Audio Production Team</div>
                        <div className="text-xs text-[var(--muted-foreground)]">4 members</div>
                      </div>
                    </div>
                  </div>

                  {/* Role Groups */}
                  <div className="ml-11 mt-2 space-y-2">
                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-[var(--muted-foreground)]" />
                        <span className="text-sm text-[var(--popover-foreground)]">Producers</span>
                        <span className="text-xs text-[var(--muted-foreground)]">1 member</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 px-3 text-xs"
                      >
                        Owner <ChevronDown className="h-3 w-3 ml-1" />
                      </Button>
                    </div>

                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-[var(--muted-foreground)]" />
                        <span className="text-sm text-[var(--popover-foreground)]">Engineers</span>
                        <span className="text-xs text-[var(--muted-foreground)]">2 members</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 px-3 text-xs"
                      >
                        Editor <ChevronDown className="h-3 w-3 ml-1" />
                      </Button>
                    </div>

                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-[var(--muted-foreground)]" />
                        <span className="text-sm text-[var(--popover-foreground)]">Collaborators</span>
                        <span className="text-xs text-[var(--muted-foreground)]">0 members</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 px-3 text-xs"
                      >
                        None <ChevronDown className="h-3 w-3 ml-1" />
                      </Button>
                    </div>

                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center space-x-2">
                        <Eye className="h-4 w-4 text-[var(--muted-foreground)]" />
                        <span className="text-sm text-[var(--popover-foreground)]">Listeners</span>
                        <span className="text-xs text-[var(--muted-foreground)]">1 member</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 px-3 text-xs"
                      >
                        Viewer <ChevronDown className="h-3 w-3 ml-1" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* People with access */}
              <div className="p-4 border-t border-[var(--border)]">
                <h3 className="text-sm font-medium text-[var(--popover-foreground)] mb-3">People with access</h3>
                
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-[var(--popover-foreground)]">Project Owner</div>
                      <div className="text-xs text-[var(--muted-foreground)]">Audio Producer</div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 px-3 text-xs"
                  >
                    Owner <ChevronDown className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              </div>

              {/* Info Banner */}
              <div className="p-4 border-t border-[var(--border)]">
                <div className="flex items-start space-x-3 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs">i</span>
                  </div>
                  <div className="text-sm text-blue-900 dark:text-blue-100">
                    <span className="font-medium">View detailed role permissions</span>
                    <span className="text-blue-600 dark:text-blue-400 ml-1 cursor-pointer hover:underline">here.</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 w-5 p-0 ml-auto text-blue-600 dark:text-blue-400"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-[var(--border)] bg-[var(--muted)]/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-xs text-[var(--muted-foreground)]">
                  <Shield className="h-4 w-4" />
                  <span>Internal to Audio Production</span>
                  <ChevronDown className="h-3 w-3" />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                >
                  Cover page
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

    </>
  );
}