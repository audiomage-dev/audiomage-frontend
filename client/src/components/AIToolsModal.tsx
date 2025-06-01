import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Volume2, 
  Zap, 
  VolumeX, 
  Headphones,
  Sparkles,
  Music,
  Waves,
  TrendingUp,
  Radio,
  Piano,
  Layers,
  BarChart3,
  Target,
  Activity,
  Gauge,
  Crown,
  Sliders,
  Minimize2,
  Globe,
  Mic,
  Wind,
  Music2,
  Shuffle,
  Film,
  MessageSquare,
  Scissors,
  FileAudio,
  Search,
  Play,
  Pause,
  Settings,
  Upload,
  Download,
  RefreshCw,
  Check,
  X,
  ChevronDown
} from 'lucide-react';

interface AIToolsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTool?: string;
}

interface AITool {
  id: string;
  name: string;
  category: string;
  icon: React.ReactNode;
  description: string;
  shortcut?: string;
  color: string;
}

const aiTools: AITool[] = [
  // Real-time Processing
  { id: 'auto-eq', name: 'AI Auto-EQ', category: 'Real-time Processing', icon: <Volume2 className="w-4 h-4" />, description: 'Intelligent frequency balancing for optimal sound', color: 'var(--purple)' },
  { id: 'smart-compressor', name: 'Smart Compressor', category: 'Real-time Processing', icon: <Zap className="w-4 h-4" />, description: 'Adaptive compression with AI-driven parameters', color: 'var(--blue)' },
  { id: 'noise-suppression', name: 'Noise Suppression', category: 'Real-time Processing', icon: <VolumeX className="w-4 h-4" />, description: 'Real-time background noise removal', color: 'var(--green)' },
  { id: 'de-esser', name: 'De-esser Pro', category: 'Real-time Processing', icon: <Headphones className="w-4 h-4" />, description: 'Advanced sibilance reduction', color: 'var(--orange)' },
  
  // Audio Enhancement
  { id: 'vocal-clarity', name: 'Vocal Clarity AI', category: 'Audio Enhancement', icon: <Sparkles className="w-4 h-4" />, description: 'Enhance vocal presence and clarity', color: 'var(--purple)' },
  { id: 'instrument-isolation', name: 'Instrument Isolation', category: 'Audio Enhancement', icon: <Music className="w-4 h-4" />, description: 'Separate and enhance specific instruments', color: 'var(--blue)' },
  { id: 'harmonic-enhancer', name: 'Harmonic Enhancer', category: 'Audio Enhancement', icon: <Waves className="w-4 h-4" />, description: 'Add warmth and harmonic richness', color: 'var(--cyan)' },
  { id: 'stereo-widener', name: 'Stereo Widener', category: 'Audio Enhancement', icon: <TrendingUp className="w-4 h-4" />, description: 'Intelligent stereo field expansion', color: 'var(--green)' },
  
  // Stem Separation
  { id: 'isolate-vocals', name: 'Isolate Vocals', category: 'Stem Separation', icon: <Radio className="w-4 h-4" />, description: 'Extract vocal tracks from mixed audio', color: 'var(--red)' },
  { id: 'extract-drums', name: 'Extract Drums', category: 'Stem Separation', icon: <Music className="w-4 h-4" />, description: 'Separate drum elements from mix', color: 'var(--blue)' },
  { id: 'separate-bass', name: 'Separate Bass', category: 'Stem Separation', icon: <Piano className="w-4 h-4" />, description: 'Isolate bass frequencies and instruments', color: 'var(--purple)' },
  { id: 'four-stem-split', name: '4-Stem Split', category: 'Stem Separation', icon: <Layers className="w-4 h-4" />, description: 'Complete track separation into 4 stems', color: 'var(--orange)' },
  
  // Mix Analysis
  { id: 'frequency-analysis', name: 'Frequency Analysis', category: 'Mix Analysis', icon: <BarChart3 className="w-4 h-4" />, description: 'Deep spectral analysis and recommendations', color: 'var(--blue)' },
  { id: 'loudness-check', name: 'Loudness Check', category: 'Mix Analysis', icon: <Target className="w-4 h-4" />, description: 'LUFS compliance and loudness standards', color: 'var(--green)' },
  { id: 'phase-correlation', name: 'Phase Correlation', category: 'Mix Analysis', icon: <Activity className="w-4 h-4" />, description: 'Stereo phase relationship analysis', color: 'var(--purple)' },
  { id: 'dynamic-range', name: 'Dynamic Range', category: 'Mix Analysis', icon: <Gauge className="w-4 h-4" />, description: 'Dynamic range measurement and optimization', color: 'var(--orange)' },
  
  // AI Mastering
  { id: 'auto-master', name: 'Auto-Master', category: 'AI Mastering', icon: <Crown className="w-4 h-4" />, description: 'Complete AI-driven mastering chain', color: 'var(--yellow)' },
  { id: 'genre-matching', name: 'Genre Matching', category: 'AI Mastering', icon: <Sliders className="w-4 h-4" />, description: 'Style-specific mastering presets', color: 'var(--blue)' },
  { id: 'limiting-ai', name: 'Limiting AI', category: 'AI Mastering', icon: <Minimize2 className="w-4 h-4" />, description: 'Intelligent peak limiting and control', color: 'var(--red)' },
  { id: 'platform-optimize', name: 'Platform Optimize', category: 'AI Mastering', icon: <Globe className="w-4 h-4" />, description: 'Optimize for streaming platforms', color: 'var(--green)' },
  
  // AI Generation
  { id: 'voice-synthesis', name: 'Voice Synthesis', category: 'AI Generation', icon: <Mic className="w-4 h-4" />, description: 'Generate realistic voice recordings', color: 'var(--purple)' },
  { id: 'ambient-generator', name: 'Ambient Generator', category: 'AI Generation', icon: <Wind className="w-4 h-4" />, description: 'Create atmospheric soundscapes', color: 'var(--cyan)' },
  { id: 'midi-composer', name: 'MIDI Composer', category: 'AI Generation', icon: <Music2 className="w-4 h-4" />, description: 'AI-powered melody and harmony creation', color: 'var(--blue)' },
  { id: 'variation-creator', name: 'Variation Creator', category: 'AI Generation', icon: <Shuffle className="w-4 h-4" />, description: 'Generate musical variations and ideas', color: 'var(--orange)' },
  
  // Post-Production
  { id: 'video-sync', name: 'Audio to Video Sync', category: 'Post-Production', icon: <Film className="w-4 h-4" />, description: 'Automatic audio-video synchronization', color: 'var(--purple)' },
  { id: 'speech-enhancement', name: 'Speech Enhancement', category: 'Post-Production', icon: <MessageSquare className="w-4 h-4" />, description: 'Improve dialogue clarity and presence', color: 'var(--blue)' },
  { id: 'auto-edit', name: 'Auto-Edit', category: 'Post-Production', icon: <Scissors className="w-4 h-4" />, description: 'Intelligent audio editing and cleanup', color: 'var(--red)' },
  { id: 'format-converter', name: 'Format Converter', category: 'Post-Production', icon: <FileAudio className="w-4 h-4" />, description: 'High-quality format conversion', color: 'var(--green)' }
];

export function AIToolsModal({ isOpen, onClose, initialTool = 'auto-eq' }: AIToolsModalProps) {
  const [selectedTool, setSelectedTool] = useState(initialTool);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  const categories = ['All', ...Array.from(new Set(aiTools.map(tool => tool.category)))];
  
  const filteredTools = aiTools.filter(tool => {
    const matchesSearch = tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tool.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || tool.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const currentTool = aiTools.find(tool => tool.id === selectedTool) || aiTools[0];

  if (!isOpen) return null;

  const renderToolInterface = (tool: AITool) => {
    switch (tool.id) {
      case 'auto-eq':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">Target Curve</label>
                <select className="w-full mt-1 p-2 text-sm bg-[var(--secondary)] border border-[var(--border)] rounded">
                  <option>Flat Response</option>
                  <option>Vocal Enhancement</option>
                  <option>Podcast</option>
                  <option>Music Master</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">Processing Strength</label>
                <input type="range" min="0" max="100" defaultValue="75" className="w-full mt-1" />
              </div>
            </div>
            <div className="h-32 bg-[var(--muted)] rounded flex items-center justify-center">
              <div className="text-xs text-[var(--muted-foreground)]">Frequency Response Graph</div>
            </div>
            <div className="flex space-x-2">
              <Button size="sm" className="flex-1">
                <Play className="w-3 h-3 mr-1" />
                Preview
              </Button>
              <Button size="sm" variant="outline" className="flex-1">
                <Download className="w-3 h-3 mr-1" />
                Apply
              </Button>
            </div>
          </div>
        );
      
      case 'smart-compressor':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">Ratio</label>
                <select className="w-full mt-1 p-2 text-sm bg-[var(--secondary)] border border-[var(--border)] rounded">
                  <option>2:1</option>
                  <option>4:1</option>
                  <option>8:1</option>
                  <option>∞:1 (Limiter)</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">Attack (ms)</label>
                <input type="number" defaultValue="5" className="w-full mt-1 p-2 text-sm bg-[var(--secondary)] border border-[var(--border)] rounded" />
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">Release (ms)</label>
                <input type="number" defaultValue="100" className="w-full mt-1 p-2 text-sm bg-[var(--secondary)] border border-[var(--border)] rounded" />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--muted-foreground)]">Threshold</label>
              <input type="range" min="-40" max="0" defaultValue="-12" className="w-full mt-1" />
              <div className="text-xs text-[var(--muted-foreground)] mt-1">-12 dB</div>
            </div>
            <div className="h-24 bg-[var(--muted)] rounded flex items-center justify-center">
              <div className="text-xs text-[var(--muted-foreground)]">Gain Reduction Meter</div>
            </div>
          </div>
        );
      
      case 'isolate-vocals':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">Isolation Quality</label>
                <select className="w-full mt-1 p-2 text-sm bg-[var(--secondary)] border border-[var(--border)] rounded">
                  <option>High (Slower)</option>
                  <option>Standard</option>
                  <option>Fast (Real-time)</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">Output Format</label>
                <select className="w-full mt-1 p-2 text-sm bg-[var(--secondary)] border border-[var(--border)] rounded">
                  <option>Vocals Only</option>
                  <option>Instrumental Only</option>
                  <option>Both Stems</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium">Vocal Clarity</span>
                <span className="text-xs text-[var(--muted-foreground)]">85%</span>
              </div>
              <input type="range" min="0" max="100" defaultValue="85" className="w-full" />
            </div>
            <div className="bg-[var(--secondary)] p-3 rounded">
              <div className="text-xs font-medium mb-2">Processing Status</div>
              <div className="flex items-center space-x-2">
                <RefreshCw className="w-3 h-3 animate-spin" />
                <span className="text-xs">Analyzing audio structure...</span>
              </div>
            </div>
          </div>
        );
      
      case 'auto-master':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">Target Platform</label>
                <select className="w-full mt-1 p-2 text-sm bg-[var(--secondary)] border border-[var(--border)] rounded">
                  <option>Spotify</option>
                  <option>Apple Music</option>
                  <option>YouTube</option>
                  <option>Broadcast</option>
                  <option>CD Master</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">Genre</label>
                <select className="w-full mt-1 p-2 text-sm bg-[var(--secondary)] border border-[var(--border)] rounded">
                  <option>Pop</option>
                  <option>Rock</option>
                  <option>Hip-Hop</option>
                  <option>Electronic</option>
                  <option>Classical</option>
                  <option>Jazz</option>
                </select>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium">Target LUFS</span>
                <span className="text-xs text-[var(--muted-foreground)]">-14.0</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium">Dynamic Range</span>
                <span className="text-xs text-[var(--muted-foreground)]">8.5 LU</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium">True Peak Limit</span>
                <span className="text-xs text-[var(--muted-foreground)]">-1.0 dB</span>
              </div>
            </div>
            <Button className="w-full">
              <Crown className="w-3 h-3 mr-2" />
              Start Mastering Process
            </Button>
          </div>
        );
      
      default:
        return (
          <div className="space-y-4">
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-[var(--secondary)] rounded-lg flex items-center justify-center mx-auto mb-3">
                {tool.icon}
              </div>
              <h4 className="text-sm font-medium mb-2">{tool.name}</h4>
              <p className="text-xs text-[var(--muted-foreground)] mb-4">{tool.description}</p>
              <Button size="sm">
                <Settings className="w-3 h-3 mr-1" />
                Configure
              </Button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-start justify-center pt-20 z-50">
      <div className="bg-[var(--background)] border border-[var(--border)] rounded-xl shadow-2xl w-[800px] max-w-[95vw] max-h-[80vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-[var(--border)] bg-[var(--muted)] rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-[var(--primary)] rounded-lg flex items-center justify-center">
                <Zap className="h-4 w-4 text-[var(--primary-foreground)]" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[var(--foreground)]">AI Production Suite</h3>
                <p className="text-xs text-[var(--muted-foreground)]">Advanced AI tools for audio production</p>
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

        <div className="flex flex-1 overflow-hidden">
          {/* Tool Selection Sidebar */}
          <div className="w-80 border-r border-[var(--border)] flex flex-col">
            {/* Search and Filters */}
            <div className="p-3 border-b border-[var(--border)]">
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 text-[var(--muted-foreground)]" />
                <Input
                  placeholder="Search AI tools..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 h-8 text-xs bg-[var(--secondary)] border-[var(--border)]"
                />
              </div>
              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full p-2 text-xs bg-[var(--secondary)] border border-[var(--border)] rounded"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Tool List */}
            <div className="flex-1 overflow-y-auto p-2">
              <div className="space-y-1">
                {Object.entries(
                  filteredTools.reduce((groups, tool) => {
                    if (!groups[tool.category]) groups[tool.category] = [];
                    groups[tool.category].push(tool);
                    return groups;
                  }, {} as Record<string, typeof filteredTools>)
                ).map(([category, tools]) => (
                  <div key={category} className="mb-3">
                    {selectedCategory === 'All' && (
                      <div className="px-2 py-1 text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">
                        {category}
                      </div>
                    )}
                    {tools.map((tool) => (
                      <button
                        key={tool.id}
                        onClick={() => setSelectedTool(tool.id)}
                        className={`w-full text-left p-2 rounded-md hover:bg-[var(--accent)] flex items-center space-x-2 text-xs ${
                          selectedTool === tool.id ? 'bg-[var(--accent)] border border-[var(--primary)]' : ''
                        }`}
                      >
                        <div style={{ color: tool.color }}>{tool.icon}</div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-[var(--foreground)] truncate">{tool.name}</div>
                          <div className="text-[var(--muted-foreground)] truncate">{tool.description}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tool Interface */}
          <div className="flex-1 flex flex-col">
            {/* Tool Header */}
            <div className="p-4 border-b border-[var(--border)]">
              <div className="flex items-center space-x-3">
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${currentTool.color}20`, color: currentTool.color }}
                >
                  {currentTool.icon}
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-[var(--foreground)]">{currentTool.name}</h4>
                  <p className="text-sm text-[var(--muted-foreground)]">{currentTool.description}</p>
                </div>
              </div>
            </div>

            {/* Tool Content */}
            <div className="flex-1 p-4 overflow-y-auto">
              {renderToolInterface(currentTool)}
            </div>

            {/* Tool Footer */}
            <div className="p-4 border-t border-[var(--border)] bg-[var(--muted)]">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-[var(--green)] rounded-full"></div>
                  <span className="text-xs text-[var(--muted-foreground)]">AI Engine Ready</span>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button size="sm">
                    <Check className="w-3 h-3 mr-1" />
                    Apply
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}