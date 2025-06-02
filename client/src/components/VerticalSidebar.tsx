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
        <div className="p-4 space-y-6 bg-gradient-to-b from-transparent via-blue-500/5 to-purple-500/5">
          {/* Holographic Master Section */}
          <div className="relative">
            {/* Glowing border effect */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 rounded-xl opacity-20 blur-sm"></div>
            <div className="relative bg-[var(--background)]/90 backdrop-blur-xl border border-white/10 rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Master Control Matrix
                </h3>
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                </div>
              </div>
            
              {/* Futuristic Volume Control */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-cyan-300/80">MASTER OUTPUT</span>
                  <div className="px-2 py-1 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-full border border-cyan-400/30">
                    <span className="text-xs font-mono text-cyan-300">-6.2dB</span>
                  </div>
                </div>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-cyan-500/20 rounded-full blur-sm group-hover:blur-none transition-all duration-300"></div>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    defaultValue="75"
                    className="relative w-full h-3 bg-transparent rounded-full appearance-none cursor-pointer slider-neo"
                  />
                  <div className="flex justify-between text-xs text-cyan-400/60 mt-2 font-mono">
                    <span>-∞</span>
                    <span>0dB</span>
                    <span>+6</span>
                  </div>
                </div>
              </div>

              {/* Holographic Level Meters */}
              <div className="space-y-3 mb-6">
                <div className="text-xs font-medium text-purple-300/80">SPECTRUM ANALYSIS</div>
                <div className="flex space-x-4 justify-center">
                  {/* Left Channel - Neo Design */}
                  <div className="flex flex-col items-center space-y-2">
                    <div className="text-xs font-mono text-blue-300">L</div>
                    <div className="relative">
                      <div className="h-24 w-6 bg-black/50 rounded-lg border border-blue-400/30 overflow-hidden backdrop-blur-sm">
                        <div className="absolute bottom-0 w-full h-3/4 bg-gradient-to-t from-emerald-400 via-yellow-400 via-orange-400 to-red-400 rounded-lg opacity-80"></div>
                        <div className="absolute top-0 left-0 right-0 h-full bg-gradient-to-b from-transparent via-transparent to-black/20"></div>
                        {/* Peak indicator */}
                        <div className="absolute top-2 left-0 right-0 h-0.5 bg-red-400 shadow-lg shadow-red-400/50"></div>
                      </div>
                      <div className="absolute -right-8 top-1/2 transform -translate-y-1/2 text-xs font-mono text-emerald-300">-3.2</div>
                    </div>
                  </div>
                  {/* Right Channel - Neo Design */}
                  <div className="flex flex-col items-center space-y-2">
                    <div className="text-xs font-mono text-purple-300">R</div>
                    <div className="relative">
                      <div className="h-24 w-6 bg-black/50 rounded-lg border border-purple-400/30 overflow-hidden backdrop-blur-sm">
                        <div className="absolute bottom-0 w-full h-2/3 bg-gradient-to-t from-emerald-400 via-yellow-400 via-orange-400 to-red-400 rounded-lg opacity-80"></div>
                        <div className="absolute top-0 left-0 right-0 h-full bg-gradient-to-b from-transparent via-transparent to-black/20"></div>
                        {/* Peak indicator */}
                        <div className="absolute top-2 left-0 right-0 h-0.5 bg-red-400 shadow-lg shadow-red-400/50"></div>
                      </div>
                      <div className="absolute -right-8 top-1/2 transform -translate-y-1/2 text-xs font-mono text-emerald-300">-4.1</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Neural EQ Matrix */}
              <div className="space-y-3 mb-6">
                <div className="text-xs font-medium text-orange-300/80">NEURAL EQ MATRIX</div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'HIGH', value: '+0.0', color: 'from-red-400 to-orange-400' },
                    { label: 'MID', value: '-1.2', color: 'from-yellow-400 to-green-400' },
                    { label: 'LOW', value: '+2.1', color: 'from-green-400 to-blue-400' }
                  ].map((band, i) => (
                    <div key={band.label} className="text-center">
                      <div className="text-xs mb-2 font-mono text-gray-300">{band.label}</div>
                      <div className="relative group">
                        <div className={`absolute inset-0 bg-gradient-to-t ${band.color} opacity-20 rounded-full blur-sm group-hover:opacity-40 transition-all duration-300`}></div>
                        <input 
                          type="range" 
                          min="0" 
                          max="100" 
                          defaultValue={50 + i * 5} 
                          className="relative w-full h-2 bg-transparent rounded-full appearance-none cursor-pointer eq-slider"
                        />
                      </div>
                      <div className="text-xs font-mono mt-2 text-cyan-300">{band.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Processing Chain */}
              <div className="space-y-3 mb-6">
                <div className="text-xs font-medium text-violet-300/80">PROCESSING CHAIN</div>
                <div className="space-y-2">
                  {[
                    { name: 'Neural Compressor', status: 'active', value: '3:1', color: 'emerald' },
                    { name: 'Quantum Limiter', status: 'active', value: '-0.1dB', color: 'blue' }
                  ].map((fx) => (
                    <div key={fx.name} className="group">
                      <div className="relative overflow-hidden">
                        <div className={`absolute inset-0 bg-gradient-to-r from-${fx.color}-500/10 to-${fx.color}-400/5 rounded-lg`}></div>
                        <div className="relative flex items-center justify-between p-3 border border-white/10 rounded-lg backdrop-blur-sm hover:border-white/20 transition-all duration-300">
                          <span className="text-xs font-medium text-gray-200">{fx.name}</span>
                          <div className="flex items-center space-x-2">
                            <div className={`w-2 h-2 bg-${fx.color}-400 rounded-full shadow-lg shadow-${fx.color}-400/50 animate-pulse`}></div>
                            <span className="text-xs font-mono text-gray-300">{fx.value}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Analysis Matrix */}
              <div className="relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 rounded-lg opacity-20 blur-sm"></div>
                <div className="relative p-4 bg-black/30 backdrop-blur-xl border border-white/10 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-xs font-bold text-transparent bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text">
                      AI NEURAL ANALYSIS
                    </div>
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'LUFS', value: '-14.2', color: 'text-green-400' },
                      { label: 'DR', value: '8.3 LU', color: 'text-blue-400' },
                      { label: 'PEAK', value: '-1.2dBFS', color: 'text-yellow-400' },
                      { label: 'STATUS', value: 'OPTIMAL', color: 'text-emerald-400' }
                    ].map((metric) => (
                      <div key={metric.label} className="text-center">
                        <div className="text-xs text-gray-400 font-mono">{metric.label}</div>
                        <div className={`text-xs font-bold ${metric.color} mt-1`}>{metric.value}</div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 text-center">
                    <div className="inline-flex items-center space-x-2 px-3 py-1 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-full border border-green-400/30">
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-xs font-medium text-green-300">BROADCAST READY</span>
                    </div>
                  </div>
                </div>
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