import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ProjectBrowser } from './ProjectBrowser';
import { AISuggestionsPanel } from './AISuggestionsPanel';
import { AudioChangemapsPanel } from './AudioChangemapsPanel';
import { ProjectVersionsPanel } from './ProjectVersionsPanel';
import { QuickActionsPanel } from './QuickActionsPanel';
import { AIToolsModal } from './AIToolsModal';
import { 
  FolderOpen, 
  Search, 
  GitBranch, 
  Terminal, 
  Settings, 
  Layers,
  Sliders,
  Music,
  Zap,
  Users,
  HelpCircle,
  Lightbulb,
  Check,
  X,
  Square,
  CheckSquare,
  History,
  Library,
  Play,
  Pause,
  Volume2,
  Monitor,
  Headphones,
  Keyboard,
  Globe,
  Shield,
  Database,
  Download,
  Upload,
  RefreshCw,
  Heart,
  Filter,
  Tag,
  Clock,
  Star,
  Wand2,
  Sparkles,
  Mic,
  Radio,
  TrendingUp,
  Scissors,
  Copy,
  RotateCcw,
  Volume,
  VolumeX,
  Waves,
  Piano,
  Activity,
  Gauge,
  Crown,
  Minimize2,
  Wind,
  Music2,
  Shuffle,
  Film,
  MessageSquare,
  FileAudio,
  BarChart3,
  Target
} from 'lucide-react';

interface SidebarItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  component?: React.ReactNode;
}

export function VerticalSidebar() {
  const [activePanel, setActivePanel] = useState<string>('quick-actions');
  const [isExpanded, setIsExpanded] = useState(true);
  const [isAIToolsModalOpen, setIsAIToolsModalOpen] = useState(false);
  const [selectedAITool, setSelectedAITool] = useState<string>('auto-eq');
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const handleAIToolClick = (toolId: string) => {
    setSelectedAITool(toolId);
    setIsAIToolsModalOpen(true);
  };

  const sidebarItems: SidebarItem[] = [
    {
      id: 'quick-actions',
      icon: <Wand2 className="w-5 h-5" />,
      label: 'Quick Actions',
      component: <QuickActionsPanel />
    },
    {
      id: 'files',
      icon: <FolderOpen className="w-5 h-5" />,
      label: 'Explorer',
      component: <ProjectBrowser />
    },
    {
      id: 'search',
      icon: <Search className="w-5 h-5" />,
      label: 'Search',
      component: (
        <div className="p-4">
          <h3 className="text-sm font-medium text-[var(--foreground)] mb-3">Global Search</h3>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Search in project..."
              className="w-full px-3 py-2 text-sm bg-[var(--input)] border border-[var(--border)] rounded-md text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]"
            />
            <div className="text-xs text-[var(--muted-foreground)]">
              Search across all audio files, MIDI, and project data
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'version',
      icon: <GitBranch className="w-5 h-5" />,
      label: 'Version Control',
      component: <ProjectVersionsPanel />
    },
    {
      id: 'tracks',
      icon: <Layers className="w-5 h-5" />,
      label: 'Track Manager',
      component: (
        <div className="p-4">
          <h3 className="text-sm font-medium text-[var(--foreground)] mb-3">Track Overview</h3>
          <div className="space-y-2">
            {['Vocal Lead', 'Guitar Rhythm', 'Bass Line', 'Drums'].map((track, index) => (
              <div key={track} className="flex items-center justify-between p-2 bg-[var(--muted)] rounded-md">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full bg-[var(--${['blue', 'green', 'yellow', 'red'][index]})]`}></div>
                  <span className="text-xs text-[var(--foreground)]">{track}</span>
                </div>
                <div className="text-xs text-[var(--muted-foreground)]">
                  {index === 0 ? 'REC' : 'PLAY'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 'mixer',
      icon: <Sliders className="w-5 h-5" />,
      label: 'Quick Mix',
      component: (
        <div className="h-full flex flex-col bg-gradient-to-b from-[var(--background)] to-[var(--muted)]/20">
          {/* Header with Mixing State */}
          <div className="p-4 border-b border-[var(--border)] bg-gradient-to-r from-[var(--primary)]/5 to-[var(--secondary)]/5">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-[var(--foreground)]">Mix Engine</h3>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-[var(--green)] rounded-full animate-pulse"></div>
                <span className="text-xs text-[var(--muted-foreground)] font-mono">LIVE</span>
              </div>
            </div>
            <div className="text-xs text-[var(--muted-foreground)]">Real-time processing active</div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-4 scrollbar-hide">
            {/* Compact Master Volume & Levels */}
            <div className="grid grid-cols-2 gap-3">
              {/* Circular Master Volume */}
              <div className="text-center">
                <div className="text-xs font-medium text-[var(--foreground)] mb-2">Master</div>
                <div className="relative w-16 h-16 mx-auto">
                  <div className="absolute inset-0 rounded-full border-2 border-[var(--muted)]"></div>
                  <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" stroke="url(#volumeGradient)" strokeWidth="6" fill="none" strokeDasharray="264" strokeDashoffset="66" />
                    <defs>
                      <linearGradient id="volumeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="var(--primary)" />
                        <stop offset="100%" stopColor="var(--secondary)" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-xs font-bold text-[var(--foreground)]">-6.2</div>
                  </div>
                </div>
              </div>

              {/* Compact Level Meters */}
              <div className="text-center">
                <div className="text-xs font-medium text-[var(--foreground)] mb-2">Levels</div>
                <div className="flex justify-center space-x-2">
                  <div className="text-center">
                    <div className="text-xs mb-1 font-mono">L</div>
                    <div className="relative w-4 h-16 bg-[var(--muted)] rounded-full overflow-hidden">
                      {[...Array(8)].map((_, i) => (
                        <div key={i} className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0.5 rounded-full ${i < 6 ? 'bg-[var(--green)]' : i < 7 ? 'bg-[var(--yellow)]' : 'bg-[var(--red)]'}`} style={{ height: `${(i + 1) * 12}%` }} />
                      ))}
                    </div>
                    <div className="text-xs font-mono mt-1 text-[var(--green)]">-3.2</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs mb-1 font-mono">R</div>
                    <div className="relative w-4 h-16 bg-[var(--muted)] rounded-full overflow-hidden">
                      {[...Array(8)].map((_, i) => (
                        <div key={i} className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0.5 rounded-full ${i < 5 ? 'bg-[var(--green)]' : i < 6 ? 'bg-[var(--yellow)]' : 'bg-[var(--red)]'}`} style={{ height: `${(i + 1) * 10}%` }} />
                      ))}
                    </div>
                    <div className="text-xs font-mono mt-1 text-[var(--green)]">-4.1</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Compact EQ */}
            <div>
              <div className="text-xs font-medium text-[var(--foreground)] mb-2 text-center">EQ</div>
              <div className="grid grid-cols-3 gap-2">
                {['High', 'Mid', 'Low'].map((band, index) => (
                  <div key={band} className="text-center">
                    <div className={`w-6 h-6 mx-auto rounded-full border-2 cursor-pointer ${
                      band === 'High' ? 'border-[var(--blue)] bg-[var(--blue)]/20' :
                      band === 'Mid' ? 'border-[var(--green)] bg-[var(--green)]/20' :
                      'border-[var(--red)] bg-[var(--red)]/20'
                    }`} />
                    <div className="text-xs font-mono mt-1">
                      {band === 'High' ? '+0.0' : band === 'Mid' ? '-1.2' : '+2.1'}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Compact Processing Chain */}
            <div>
              <div className="text-xs font-medium text-[var(--foreground)] mb-2 text-center">Chain</div>
              <div className="space-y-1">
                {[
                  { name: 'Compressor', value: '3:1', color: 'var(--green)', active: true },
                  { name: 'Limiter', value: '-0.1dB', color: 'var(--blue)', active: true }
                ].map((processor) => (
                  <div key={processor.name} className="flex items-center justify-between p-2 rounded border border-[var(--primary)]/20 bg-[var(--muted)]/20">
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${processor.active ? 'animate-pulse' : ''}`} style={{ backgroundColor: processor.color }} />
                      <span className="text-xs">{processor.name}</span>
                    </div>
                    <span className="text-xs font-mono">{processor.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Compact Analysis */}
            <div className="p-3 bg-gradient-to-br from-[var(--secondary)]/20 to-[var(--primary)]/10 rounded-lg border border-[var(--primary)]/20">
              <div className="text-xs font-medium text-[var(--foreground)] mb-2 text-center">Analysis</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="text-center">
                  <div className="text-[var(--muted-foreground)]">LUFS</div>
                  <div className="font-mono text-[var(--green)]">-14.2</div>
                </div>
                <div className="text-center">
                  <div className="text-[var(--muted-foreground)]">Peak</div>
                  <div className="font-mono text-[var(--yellow)]">-1.2</div>
                </div>
              </div>
              <div className="mt-2 p-1 bg-[var(--green)]/10 rounded text-center">
                <div className="text-xs text-[var(--green)]">✨ Ready</div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'ai',
      icon: <Zap className="w-5 h-5" />,
      label: 'AI Assistant',
      component: (
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-[var(--border)] bg-[var(--muted)]">
            <h3 className="text-sm font-medium text-[var(--foreground)] mb-2">AI Production Suite</h3>
            <p className="text-xs text-[var(--muted-foreground)]">Advanced AI tools for audio production and post-production</p>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            
            {/* Real-time Processing */}
            <div className="space-y-2">
              <div className="text-xs font-medium text-[var(--foreground)] mb-2">Real-time Processing</div>
              <Button size="sm" variant="outline" className="w-full justify-start text-xs h-8" onClick={() => handleAIToolClick('auto-eq')}>
                <Volume2 className="w-3 h-3 mr-2 text-[var(--purple)]" />
                AI Auto-EQ
              </Button>
              <Button size="sm" variant="outline" className="w-full justify-start text-xs h-8" onClick={() => handleAIToolClick('smart-compressor')}>
                <Zap className="w-3 h-3 mr-2 text-[var(--blue)]" />
                Smart Compressor
              </Button>
              <Button size="sm" variant="outline" className="w-full justify-start text-xs h-8" onClick={() => handleAIToolClick('noise-suppression')}>
                <VolumeX className="w-3 h-3 mr-2 text-[var(--green)]" />
                Noise Suppression
              </Button>
              <Button size="sm" variant="outline" className="w-full justify-start text-xs h-8" onClick={() => handleAIToolClick('de-esser')}>
                <Headphones className="w-3 h-3 mr-2 text-[var(--orange)]" />
                De-esser Pro
              </Button>
            </div>

            {/* Audio Enhancement */}
            <div className="space-y-2">
              <div className="text-xs font-medium text-[var(--foreground)] mb-2">Audio Enhancement</div>
              <Button size="sm" variant="outline" className="w-full justify-start text-xs h-8" onClick={() => handleAIToolClick('vocal-clarity')}>
                <Sparkles className="w-3 h-3 mr-2 text-[var(--purple)]" />
                Vocal Clarity AI
              </Button>
              <Button size="sm" variant="outline" className="w-full justify-start text-xs h-8" onClick={() => handleAIToolClick('instrument-isolation')}>
                <Music className="w-3 h-3 mr-2 text-[var(--blue)]" />
                Instrument Isolation
              </Button>
              <Button size="sm" variant="outline" className="w-full justify-start text-xs h-8" onClick={() => handleAIToolClick('harmonic-enhancer')}>
                <Waves className="w-3 h-3 mr-2 text-[var(--cyan)]" />
                Harmonic Enhancer
              </Button>
              <Button size="sm" variant="outline" className="w-full justify-start text-xs h-8" onClick={() => handleAIToolClick('stereo-widener')}>
                <TrendingUp className="w-3 h-3 mr-2 text-[var(--green)]" />
                Stereo Widener
              </Button>
            </div>

            {/* Stem Separation */}
            <div className="space-y-2">
              <div className="text-xs font-medium text-[var(--foreground)] mb-2">Stem Separation</div>
              <Button size="sm" variant="outline" className="w-full justify-start text-xs h-8" onClick={() => handleAIToolClick('isolate-vocals')}>
                <Radio className="w-3 h-3 mr-2 text-[var(--red)]" />
                Isolate Vocals
              </Button>
              <Button size="sm" variant="outline" className="w-full justify-start text-xs h-8" onClick={() => handleAIToolClick('extract-drums')}>
                <Music className="w-3 h-3 mr-2 text-[var(--blue)]" />
                Extract Drums
              </Button>
              <Button size="sm" variant="outline" className="w-full justify-start text-xs h-8" onClick={() => handleAIToolClick('separate-bass')}>
                <Piano className="w-3 h-3 mr-2 text-[var(--purple)]" />
                Separate Bass
              </Button>
              <Button size="sm" variant="outline" className="w-full justify-start text-xs h-8" onClick={() => handleAIToolClick('four-stem-split')}>
                <Layers className="w-3 h-3 mr-2 text-[var(--orange)]" />
                4-Stem Split
              </Button>
            </div>

            {/* Mix Analysis */}
            <div className="space-y-2">
              <div className="text-xs font-medium text-[var(--foreground)] mb-2">Mix Analysis</div>
              <Button size="sm" variant="outline" className="w-full justify-start text-xs h-8" onClick={() => handleAIToolClick('frequency-analysis')}>
                <BarChart3 className="w-3 h-3 mr-2 text-[var(--blue)]" />
                Frequency Analysis
              </Button>
              <Button size="sm" variant="outline" className="w-full justify-start text-xs h-8" onClick={() => handleAIToolClick('loudness-check')}>
                <Target className="w-3 h-3 mr-2 text-[var(--green)]" />
                Loudness Check
              </Button>
              <Button size="sm" variant="outline" className="w-full justify-start text-xs h-8" onClick={() => handleAIToolClick('phase-correlation')}>
                <Activity className="w-3 h-3 mr-2 text-[var(--purple)]" />
                Phase Correlation
              </Button>
              <Button size="sm" variant="outline" className="w-full justify-start text-xs h-8" onClick={() => handleAIToolClick('dynamic-range')}>
                <Gauge className="w-3 h-3 mr-2 text-[var(--orange)]" />
                Dynamic Range
              </Button>
            </div>

            {/* Mastering */}
            <div className="space-y-2">
              <div className="text-xs font-medium text-[var(--foreground)] mb-2">AI Mastering</div>
              <Button size="sm" variant="outline" className="w-full justify-start text-xs h-8" onClick={() => handleAIToolClick('auto-master')}>
                <Crown className="w-3 h-3 mr-2 text-[var(--yellow)]" />
                Auto-Master
              </Button>
              <Button size="sm" variant="outline" className="w-full justify-start text-xs h-8" onClick={() => handleAIToolClick('genre-matching')}>
                <Sliders className="w-3 h-3 mr-2 text-[var(--blue)]" />
                Genre Matching
              </Button>
              <Button size="sm" variant="outline" className="w-full justify-start text-xs h-8" onClick={() => handleAIToolClick('limiting-ai')}>
                <Minimize2 className="w-3 h-3 mr-2 text-[var(--red)]" />
                Limiting AI
              </Button>
              <Button size="sm" variant="outline" className="w-full justify-start text-xs h-8" onClick={() => handleAIToolClick('platform-optimize')}>
                <Globe className="w-3 h-3 mr-2 text-[var(--green)]" />
                Platform Optimize
              </Button>
            </div>

            {/* Content Generation */}
            <div className="space-y-2">
              <div className="text-xs font-medium text-[var(--foreground)] mb-2">AI Generation</div>
              <Button size="sm" variant="outline" className="w-full justify-start text-xs h-8" onClick={() => handleAIToolClick('voice-synthesis')}>
                <Mic className="w-3 h-3 mr-2 text-[var(--purple)]" />
                Voice Synthesis
              </Button>
              <Button size="sm" variant="outline" className="w-full justify-start text-xs h-8" onClick={() => handleAIToolClick('ambient-generator')}>
                <Wind className="w-3 h-3 mr-2 text-[var(--cyan)]" />
                Ambient Generator
              </Button>
              <Button size="sm" variant="outline" className="w-full justify-start text-xs h-8" onClick={() => handleAIToolClick('midi-composer')}>
                <Music2 className="w-3 h-3 mr-2 text-[var(--blue)]" />
                MIDI Composer
              </Button>
              <Button size="sm" variant="outline" className="w-full justify-start text-xs h-8" onClick={() => handleAIToolClick('variation-creator')}>
                <Shuffle className="w-3 h-3 mr-2 text-[var(--orange)]" />
                Variation Creator
              </Button>
            </div>

            {/* Post-Production */}
            <div className="space-y-2">
              <div className="text-xs font-medium text-[var(--foreground)] mb-2">Post-Production</div>
              <Button size="sm" variant="outline" className="w-full justify-start text-xs h-8" onClick={() => handleAIToolClick('video-sync')}>
                <Film className="w-3 h-3 mr-2 text-[var(--purple)]" />
                Audio to Video Sync
              </Button>
              <Button size="sm" variant="outline" className="w-full justify-start text-xs h-8" onClick={() => handleAIToolClick('speech-enhancement')}>
                <MessageSquare className="w-3 h-3 mr-2 text-[var(--blue)]" />
                Speech Enhancement
              </Button>
              <Button size="sm" variant="outline" className="w-full justify-start text-xs h-8" onClick={() => handleAIToolClick('auto-edit')}>
                <Scissors className="w-3 h-3 mr-2 text-[var(--red)]" />
                Auto-Edit
              </Button>
              <Button size="sm" variant="outline" className="w-full justify-start text-xs h-8" onClick={() => handleAIToolClick('format-converter')}>
                <FileAudio className="w-3 h-3 mr-2 text-[var(--green)]" />
                Format Converter
              </Button>
            </div>

            {/* AI Status */}
            <div className="p-3 bg-[var(--secondary)] rounded-md mt-4">
              <div className="text-xs font-medium text-[var(--foreground)] mb-2">AI Engine Status</div>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span>GPU Acceleration</span>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-[var(--green)] rounded-full"></div>
                    <span className="text-[var(--green)]">Active</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span>Neural Models</span>
                  <span className="font-mono">12 loaded</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span>Processing Queue</span>
                  <span className="font-mono">3 tasks</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'terminal',
      icon: <Terminal className="w-5 h-5" />,
      label: 'Audio Console',
      component: (
        <div className="p-4">
          <h3 className="text-sm font-medium text-[var(--foreground)] mb-3">Audio Console</h3>
          <div className="bg-[var(--muted)] rounded-md p-3 font-mono text-xs">
            <div className="text-[var(--green)]">$ Audio Engine Ready</div>
            <div className="text-[var(--muted-foreground)]">Sample Rate: 48kHz</div>
            <div className="text-[var(--muted-foreground)]">Buffer: 256 samples</div>
            <div className="text-[var(--muted-foreground)]">Latency: 5.3ms</div>
          </div>
        </div>
      )
    },
    {
      id: 'collab',
      icon: <Users className="w-5 h-5" />,
      label: 'Collaboration',
      component: (
        <div className="p-4">
          <h3 className="text-sm font-medium text-[var(--foreground)] mb-3">Live Session</h3>
          <div className="space-y-2">
            <div className="flex items-center space-x-2 p-2 bg-[var(--muted)] rounded-md">
              <div className="w-2 h-2 rounded-full bg-[var(--green)] animate-pulse"></div>
              <span className="text-xs text-[var(--foreground)]">You (Producer)</span>
            </div>
            <div className="text-xs text-[var(--muted-foreground)]">
              Invite collaborators to work on this project in real-time
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'suggestions',
      icon: <Lightbulb className="w-5 h-5" />,
      label: 'AI Suggestions',
      component: <AISuggestionsPanel />
    },
    {
      id: 'changemaps',
      icon: <History className="w-5 h-5" />,
      label: 'Audio Changemaps',
      component: <AudioChangemapsPanel />
    },
    {
      id: 'library',
      icon: <Library className="w-5 h-5" />,
      label: 'AI Sound Library',
      component: (
        <div className="h-full flex flex-col">
          {/* Search and Filters Header */}
          <div className="p-4 border-b border-[var(--border)] bg-[var(--muted)]">
            <div className="space-y-3">
              {/* Main Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
                <input
                  type="text"
                  placeholder="Search sounds, tags, or descriptions..."
                  className="w-full pl-10 pr-4 py-2 text-sm bg-[var(--background)] border border-[var(--border)] rounded-md focus:outline-none focus:border-[var(--primary)]"
                />
              </div>

              {/* Quick Filters */}
              <div className="flex flex-wrap gap-1">
                {['SFX', 'Ambiance', 'Foley', 'Music', 'Voice'].map((filter) => (
                  <Button
                    key={filter}
                    variant="outline"
                    size="sm"
                    className="h-6 px-2 text-xs"
                  >
                    {filter}
                  </Button>
                ))}
              </div>

              {/* Advanced Filters Toggle */}
              <div className="flex items-center justify-between">
                <Button variant="ghost" size="sm" className="text-xs">
                  <Filter className="w-3 h-3 mr-1" />
                  Advanced Filters
                </Button>
                <span className="text-xs text-[var(--muted-foreground)]">12,847 sounds</span>
              </div>
            </div>
          </div>

          {/* Category Navigation */}
          <div className="p-4 border-b border-[var(--border)]">
            <h4 className="text-xs font-medium text-[var(--muted-foreground)] mb-2">Categories</h4>
            <div className="space-y-1">
              {[
                { name: 'Nature & Weather', count: 2156, icon: '🌿' },
                { name: 'Urban & City', count: 1843, icon: '🏙️' },
                { name: 'Mechanical & Tech', count: 2934, icon: '⚙️' },
                { name: 'Human Activities', count: 1567, icon: '👥' },
                { name: 'Musical Elements', count: 987, icon: '🎵' },
                { name: 'Abstract & Designed', count: 756, icon: '✨' },
                { name: 'Animals & Creatures', count: 634, icon: '🦅' },
                { name: 'Vehicles & Transport', count: 1245, icon: '🚗' }
              ].map((category) => (
                <div
                  key={category.name}
                  className="flex items-center justify-between p-2 rounded hover:bg-[var(--accent)] cursor-pointer group"
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">{category.icon}</span>
                    <span className="text-sm">{category.name}</span>
                  </div>
                  <span className="text-xs text-[var(--muted-foreground)] group-hover:text-[var(--foreground)]">
                    {category.count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Sound Results */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium">Recent & Trending</h4>
                <div className="flex space-x-1">
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <Square className="w-3 h-3" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <Layers className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                {[
                  {
                    name: 'Rain on Leaves Heavy.wav',
                    category: 'Nature',
                    duration: '2:34',
                    tags: ['rain', 'nature', 'ambient'],
                    popular: true
                  },
                  {
                    name: 'City Traffic Morning.wav',
                    category: 'Urban',
                    duration: '1:47',
                    tags: ['traffic', 'urban', 'morning'],
                    popular: false
                  },
                  {
                    name: 'Footsteps Gravel Slow.wav',
                    category: 'Foley',
                    duration: '0:15',
                    tags: ['footsteps', 'gravel', 'walking'],
                    popular: true
                  },
                  {
                    name: 'Mechanical Hum Industrial.wav',
                    category: 'Tech',
                    duration: '4:12',
                    tags: ['mechanical', 'industrial', 'loop'],
                    popular: false
                  },
                  {
                    name: 'Ocean Waves Gentle.wav',
                    category: 'Nature',
                    duration: '3:56',
                    tags: ['ocean', 'waves', 'peaceful'],
                    popular: true
                  }
                ].map((sound, index) => (
                  <div
                    key={sound.name}
                    className="p-3 border border-[var(--border)] rounded-md hover:bg-[var(--accent)] group cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2 min-w-0">
                        {sound.popular && <Star className="w-3 h-3 text-[var(--yellow)] flex-shrink-0" />}
                        <span className="text-sm font-medium truncate">{sound.name}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                        >
                          <Play className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                        >
                          <Download className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                        >
                          <Heart className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)]">
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-1 bg-[var(--secondary)] rounded text-xs">
                          {sound.category}
                        </span>
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{sound.duration}</span>
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-1 mt-2">
                      {sound.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-1.5 py-0.5 bg-[var(--muted)] text-xs rounded"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Load More */}
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-4 text-xs"
              >
                Load More Sounds
              </Button>
            </div>
          </div>

          {/* Now Playing Mini Player */}
          <div className="border-t border-[var(--border)] p-3 bg-[var(--muted)]">
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <Pause className="w-3 h-3" />
              </Button>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium truncate">Rain on Leaves Heavy.wav</div>
                <div className="text-xs text-[var(--muted-foreground)]">0:45 / 2:34</div>
              </div>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <Volume2 className="w-3 h-3" />
              </Button>
            </div>
            <div className="mt-2">
              <div className="h-1 bg-[var(--background)] rounded-full">
                <div className="h-full w-1/3 bg-[var(--primary)] rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  const handleItemClick = (itemId: string) => {
    if (activePanel === itemId && isExpanded) {
      setIsExpanded(false);
    } else {
      setActivePanel(itemId);
      setIsExpanded(true);
    }
  };

  const activeItem = sidebarItems.find(item => item.id === activePanel);

  return (
    <div className="flex h-full">
      {/* Icon Bar */}
      <div className="w-12 bg-[var(--muted)] border-r border-[var(--border)] flex flex-col">
        {/* Main Icons */}
        <div className="flex-1 py-2">
          {sidebarItems.map((item) => (
            <Button
              key={item.id}
              variant="ghost"
              size="sm"
              onClick={() => handleItemClick(item.id)}
              className={`w-full h-10 p-0 mb-1 rounded-none border-r-2 transition-all duration-200 ${
                activePanel === item.id && isExpanded
                  ? 'bg-[var(--accent)] border-r-[var(--primary)] text-[var(--primary)]'
                  : 'border-r-transparent hover:bg-[var(--accent)]'
              }`}
              title={item.label}
            >
              {item.icon}
            </Button>
          ))}
        </div>

        {/* Bottom Icons */}
        <div className="border-t border-[var(--border)] py-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-full h-10 p-0 mb-1 rounded-none hover:bg-[var(--accent)]"
            title="Settings"
            onClick={() => setIsSettingsModalOpen(true)}
          >
            <Settings className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-full h-10 p-0 rounded-none hover:bg-[var(--accent)]"
            title="Help"
          >
            <HelpCircle className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Expandable Panel */}
      {isExpanded && activeItem && (
        <div className="w-80 bg-[var(--background)] border-r border-[var(--border)] flex flex-col">
          {/* Panel Header */}
          <div className="h-8 px-3 py-2 border-b border-[var(--border)] bg-[var(--muted)] flex items-center justify-between">
            <span className="text-xs font-medium text-[var(--foreground)] uppercase tracking-wider">
              {activeItem.label}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(false)}
              className="h-4 w-4 p-0 hover:bg-[var(--accent)]"
            >
              <span className="text-xs">×</span>
            </Button>
          </div>

          {/* Panel Content */}
          <div className="flex-1 overflow-hidden">
            {activeItem.component}
          </div>
        </div>
      )}
      
      {/* AI Tools Modal */}
      <AIToolsModal 
        isOpen={isAIToolsModalOpen}
        onClose={() => setIsAIToolsModalOpen(false)}
        initialTool={selectedAITool}
      />

      {/* Settings Modal */}
      {isSettingsModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[var(--background)] border border-[var(--border)] rounded-lg w-[800px] max-h-[90vh] flex flex-col shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
              <h2 className="text-lg font-semibold text-[var(--foreground)]">Settings</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSettingsModalOpen(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Content */}
            <div className="flex flex-1 min-h-0">
              {/* Settings Categories */}
              <div className="w-64 border-r border-[var(--border)] bg-[var(--muted)]/30">
                <div className="p-3">
                  <div className="space-y-1">
                    {[
                      { id: 'general', icon: Settings, label: 'General' },
                      { id: 'audio', icon: Headphones, label: 'Audio' },
                      { id: 'display', icon: Monitor, label: 'Display' },
                      { id: 'keyboard', icon: Keyboard, label: 'Keyboard' },
                      { id: 'ai', icon: Sparkles, label: 'AI Assistant' },
                      { id: 'network', icon: Globe, label: 'Network' },
                      { id: 'privacy', icon: Shield, label: 'Privacy' },
                      { id: 'storage', icon: Database, label: 'Storage' }
                    ].map((category) => (
                      <button
                        key={category.id}
                        className="w-full flex items-center space-x-3 px-3 py-2 text-left text-sm hover:bg-[var(--accent)] rounded-md transition-colors"
                      >
                        <category.icon className="w-4 h-4 text-[var(--muted-foreground)]" />
                        <span className="text-[var(--foreground)]">{category.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Settings Panel */}
              <div className="flex-1 p-6 overflow-y-auto">
                <div className="space-y-6">
                  {/* General Settings */}
                  <div className="space-y-4">
                    <h3 className="text-base font-medium text-[var(--foreground)]">General</h3>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium text-[var(--foreground)]">Auto-save</label>
                          <p className="text-xs text-[var(--muted-foreground)]">Automatically save project changes</p>
                        </div>
                        <button className="w-10 h-6 bg-[var(--primary)] rounded-full relative">
                          <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1 transition-transform" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium text-[var(--foreground)]">Show AI suggestions</label>
                          <p className="text-xs text-[var(--muted-foreground)]">Display AI-powered editing suggestions</p>
                        </div>
                        <button className="w-10 h-6 bg-[var(--primary)] rounded-full relative">
                          <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1 transition-transform" />
                        </button>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-[var(--foreground)]">Default project location</label>
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            value="/home/user/AudioProjects"
                            className="flex-1 px-3 py-2 text-sm bg-[var(--input)] border border-[var(--border)] rounded-md text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]"
                            readOnly
                          />
                          <Button variant="outline" size="sm">
                            <FolderOpen className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Audio Settings */}
                  <div className="space-y-4">
                    <h3 className="text-base font-medium text-[var(--foreground)]">Audio</h3>
                    
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-[var(--foreground)]">Sample Rate</label>
                        <select className="w-full px-3 py-2 text-sm bg-[var(--input)] border border-[var(--border)] rounded-md text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]">
                          <option>44.1 kHz</option>
                          <option>48 kHz</option>
                          <option>96 kHz</option>
                          <option>192 kHz</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-[var(--foreground)]">Buffer Size</label>
                        <select className="w-full px-3 py-2 text-sm bg-[var(--input)] border border-[var(--border)] rounded-md text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]">
                          <option>64 samples</option>
                          <option>128 samples</option>
                          <option>256 samples</option>
                          <option>512 samples</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-[var(--foreground)]">Audio Driver</label>
                        <select className="w-full px-3 py-2 text-sm bg-[var(--input)] border border-[var(--border)] rounded-md text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]">
                          <option>ASIO</option>
                          <option>Core Audio</option>
                          <option>DirectSound</option>
                          <option>WASAPI</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* AI Settings */}
                  <div className="space-y-4">
                    <h3 className="text-base font-medium text-[var(--foreground)]">AI Assistant</h3>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium text-[var(--foreground)]">Real-time analysis</label>
                          <p className="text-xs text-[var(--muted-foreground)]">Analyze audio in real-time</p>
                        </div>
                        <button className="w-10 h-6 bg-[var(--primary)] rounded-full relative">
                          <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1 transition-transform" />
                        </button>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-[var(--foreground)]">AI Processing Quality</label>
                        <select className="w-full px-3 py-2 text-sm bg-[var(--input)] border border-[var(--border)] rounded-md text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]">
                          <option>Fast</option>
                          <option>Balanced</option>
                          <option>High Quality</option>
                          <option>Maximum Quality</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-4 border-t border-[var(--border)] bg-[var(--muted)]/20">
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reset to Defaults
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export Settings
                </Button>
                <Button variant="outline" size="sm">
                  <Upload className="w-4 h-4 mr-2" />
                  Import Settings
                </Button>
              </div>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsSettingsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  size="sm"
                  onClick={() => setIsSettingsModalOpen(false)}
                >
                  <Check className="w-4 h-4 mr-2" />
                  Apply Changes
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}