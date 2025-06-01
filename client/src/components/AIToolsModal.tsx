import { useState, useEffect } from 'react';
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
  
  // Update selected tool when modal opens with a specific tool
  useEffect(() => {
    if (isOpen) {
      setSelectedTool(initialTool);
    }
  }, [isOpen, initialTool]);
  
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
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">Threshold</label>
                <input type="range" min="-40" max="0" defaultValue="-12" className="w-full mt-1" />
                <div className="text-xs text-[var(--muted-foreground)] mt-1">-12 dB</div>
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">Makeup Gain</label>
                <input type="range" min="0" max="20" defaultValue="3" className="w-full mt-1" />
                <div className="text-xs text-[var(--muted-foreground)] mt-1">+3 dB</div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="flex items-center justify-between p-2 bg-[var(--secondary)] rounded">
                <span>Input</span>
                <span className="font-mono text-[var(--green)]">-8.2 dB</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-[var(--secondary)] rounded">
                <span>GR</span>
                <span className="font-mono text-[var(--red)]">-3.4 dB</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-[var(--secondary)] rounded">
                <span>Output</span>
                <span className="font-mono text-[var(--blue)]">-4.8 dB</span>
              </div>
            </div>
            <div className="h-20 bg-[var(--muted)] rounded flex items-center justify-center">
              <div className="text-xs text-[var(--muted-foreground)]">Real-time Gain Reduction Display</div>
            </div>
          </div>
        );
      
      case 'noise-suppression':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">Noise Profile</label>
                <select className="w-full mt-1 p-2 text-sm bg-[var(--secondary)] border border-[var(--border)] rounded">
                  <option>Auto-detect</option>
                  <option>Broadband</option>
                  <option>Hiss</option>
                  <option>Hum/Buzz</option>
                  <option>Wind</option>
                  <option>Air Conditioning</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">Processing Mode</label>
                <select className="w-full mt-1 p-2 text-sm bg-[var(--secondary)] border border-[var(--border)] rounded">
                  <option>Real-time</option>
                  <option>High Quality</option>
                  <option>Preserve Transients</option>
                </select>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium">Noise Reduction</span>
                <span className="text-xs text-[var(--muted-foreground)]">75%</span>
              </div>
              <input type="range" min="0" max="100" defaultValue="75" className="w-full" />
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium">Sensitivity</span>
                <span className="text-xs text-[var(--muted-foreground)]">60%</span>
              </div>
              <input type="range" min="0" max="100" defaultValue="60" className="w-full" />
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="flex items-center justify-between p-2 bg-[var(--secondary)] rounded">
                <span>Noise Floor</span>
                <span className="font-mono text-[var(--red)]">-42.1 dB</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-[var(--secondary)] rounded">
                <span>Signal/Noise</span>
                <span className="font-mono text-[var(--green)]">18.3 dB</span>
              </div>
            </div>
            <Button size="sm" variant="outline" className="w-full">
              <RefreshCw className="w-3 h-3 mr-1" />
              Learn Noise Profile
            </Button>
          </div>
        );
      
      case 'vocal-clarity':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">Voice Type</label>
                <select className="w-full mt-1 p-2 text-sm bg-[var(--secondary)] border border-[var(--border)] rounded">
                  <option>Male Voice</option>
                  <option>Female Voice</option>
                  <option>Spoken Word</option>
                  <option>Singing</option>
                  <option>Podcast</option>
                  <option>Broadcast</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">Enhancement Style</label>
                <select className="w-full mt-1 p-2 text-sm bg-[var(--secondary)] border border-[var(--border)] rounded">
                  <option>Natural</option>
                  <option>Warm</option>
                  <option>Bright</option>
                  <option>Radio</option>
                  <option>Studio</option>
                </select>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium">Presence Boost</span>
                <span className="text-xs text-[var(--muted-foreground)]">65%</span>
              </div>
              <input type="range" min="0" max="100" defaultValue="65" className="w-full" />
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium">Clarity Enhancement</span>
                <span className="text-xs text-[var(--muted-foreground)]">80%</span>
              </div>
              <input type="range" min="0" max="100" defaultValue="80" className="w-full" />
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium">Breath Control</span>
                <span className="text-xs text-[var(--muted-foreground)]">40%</span>
              </div>
              <input type="range" min="0" max="100" defaultValue="40" className="w-full" />
            </div>
            <div className="h-16 bg-[var(--muted)] rounded flex items-center justify-center">
              <div className="text-xs text-[var(--muted-foreground)]">Spectral Analysis Display</div>
            </div>
          </div>
        );
      
      case 'frequency-analysis':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">Analysis Type</label>
                <select className="w-full mt-1 p-2 text-sm bg-[var(--secondary)] border border-[var(--border)] rounded">
                  <option>Full Spectrum</option>
                  <option>Peak Analysis</option>
                  <option>RMS Average</option>
                  <option>Third Octave</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">Window Size</label>
                <select className="w-full mt-1 p-2 text-sm bg-[var(--secondary)] border border-[var(--border)] rounded">
                  <option>2048</option>
                  <option>4096</option>
                  <option>8192</option>
                  <option>16384</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">Averaging</label>
                <select className="w-full mt-1 p-2 text-sm bg-[var(--secondary)] border border-[var(--border)] rounded">
                  <option>None</option>
                  <option>2x</option>
                  <option>4x</option>
                  <option>8x</option>
                </select>
              </div>
            </div>
            <div className="h-32 bg-[var(--muted)] rounded flex items-center justify-center">
              <div className="text-xs text-[var(--muted-foreground)]">Real-time FFT Spectrum Analyzer</div>
            </div>
            <div className="grid grid-cols-4 gap-2 text-xs">
              <div className="text-center p-2 bg-[var(--secondary)] rounded">
                <div className="font-mono text-[var(--blue)]">Bass</div>
                <div className="text-[var(--muted-foreground)]">-6.2 dB</div>
              </div>
              <div className="text-center p-2 bg-[var(--secondary)] rounded">
                <div className="font-mono text-[var(--green)]">Low Mid</div>
                <div className="text-[var(--muted-foreground)]">-2.1 dB</div>
              </div>
              <div className="text-center p-2 bg-[var(--secondary)] rounded">
                <div className="font-mono text-[var(--yellow)]">High Mid</div>
                <div className="text-[var(--muted-foreground)]">+1.8 dB</div>
              </div>
              <div className="text-center p-2 bg-[var(--secondary)] rounded">
                <div className="font-mono text-[var(--purple)]">Treble</div>
                <div className="text-[var(--muted-foreground)]">-0.5 dB</div>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button size="sm" variant="outline" className="flex-1">
                <Download className="w-3 h-3 mr-1" />
                Export Data
              </Button>
              <Button size="sm" variant="outline" className="flex-1">
                <RefreshCw className="w-3 h-3 mr-1" />
                Reset Analysis
              </Button>
            </div>
          </div>
        );
      
      case 'voice-synthesis':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">Voice Model</label>
                <select className="w-full mt-1 p-2 text-sm bg-[var(--secondary)] border border-[var(--border)] rounded">
                  <option>Natural Female</option>
                  <option>Natural Male</option>
                  <option>Professional Male</option>
                  <option>Professional Female</option>
                  <option>Narrator</option>
                  <option>Character Voice</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">Language</label>
                <select className="w-full mt-1 p-2 text-sm bg-[var(--secondary)] border border-[var(--border)] rounded">
                  <option>English (US)</option>
                  <option>English (UK)</option>
                  <option>Spanish</option>
                  <option>French</option>
                  <option>German</option>
                  <option>Italian</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--muted-foreground)]">Text Input</label>
              <textarea 
                className="w-full mt-1 p-2 text-sm bg-[var(--secondary)] border border-[var(--border)] rounded h-20 resize-none"
                placeholder="Enter text to synthesize..."
                defaultValue="Welcome to the AI-powered audio workstation. This is a demonstration of high-quality voice synthesis."
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">Speed</label>
                <input type="range" min="0.5" max="2" step="0.1" defaultValue="1" className="w-full mt-1" />
                <div className="text-xs text-[var(--muted-foreground)] text-center">1.0x</div>
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">Pitch</label>
                <input type="range" min="-12" max="12" defaultValue="0" className="w-full mt-1" />
                <div className="text-xs text-[var(--muted-foreground)] text-center">0 ST</div>
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">Emotion</label>
                <input type="range" min="0" max="100" defaultValue="50" className="w-full mt-1" />
                <div className="text-xs text-[var(--muted-foreground)] text-center">Neutral</div>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button size="sm" className="flex-1">
                <Play className="w-3 h-3 mr-1" />
                Generate & Preview
              </Button>
              <Button size="sm" variant="outline">
                <Upload className="w-3 h-3 mr-1" />
                Add to Track
              </Button>
            </div>
          </div>
        );
      
      case 'midi-composer':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">Musical Style</label>
                <select className="w-full mt-1 p-2 text-sm bg-[var(--secondary)] border border-[var(--border)] rounded">
                  <option>Classical</option>
                  <option>Jazz</option>
                  <option>Pop</option>
                  <option>Electronic</option>
                  <option>Ambient</option>
                  <option>Cinematic</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">Key Signature</label>
                <select className="w-full mt-1 p-2 text-sm bg-[var(--secondary)] border border-[var(--border)] rounded">
                  <option>C Major</option>
                  <option>G Major</option>
                  <option>D Major</option>
                  <option>A Minor</option>
                  <option>E Minor</option>
                  <option>Custom</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-3">
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">Tempo</label>
                <input type="number" min="60" max="200" defaultValue="120" className="w-full mt-1 p-2 text-sm bg-[var(--secondary)] border border-[var(--border)] rounded" />
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">Bars</label>
                <input type="number" min="4" max="64" defaultValue="16" className="w-full mt-1 p-2 text-sm bg-[var(--secondary)] border border-[var(--border)] rounded" />
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">Time Sig</label>
                <select className="w-full mt-1 p-2 text-sm bg-[var(--secondary)] border border-[var(--border)] rounded">
                  <option>4/4</option>
                  <option>3/4</option>
                  <option>6/8</option>
                  <option>7/8</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">Complexity</label>
                <select className="w-full mt-1 p-2 text-sm bg-[var(--secondary)] border border-[var(--border)] rounded">
                  <option>Simple</option>
                  <option>Medium</option>
                  <option>Complex</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-xs font-medium text-[var(--muted-foreground)]">Instruments</div>
              <div className="grid grid-cols-2 gap-2">
                {['Piano', 'Strings', 'Brass', 'Woodwinds', 'Percussion', 'Bass'].map(instrument => (
                  <label key={instrument} className="flex items-center space-x-2 text-xs">
                    <input type="checkbox" defaultChecked={instrument === 'Piano'} className="rounded" />
                    <span>{instrument}</span>
                  </label>
                ))}
              </div>
            </div>
            <Button size="sm" className="w-full">
              <Music2 className="w-3 h-3 mr-1" />
              Generate Composition
            </Button>
          </div>
        );
      
      case 'isolate-vocals':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">Isolation Algorithm</label>
                <select className="w-full mt-1 p-2 text-sm bg-[var(--secondary)] border border-[var(--border)] rounded">
                  <option>PANN-based Deep Learning</option>
                  <option>Spectral Subtraction</option>
                  <option>HPSS (Harmonic-Percussive)</option>
                  <option>Center Channel Extraction</option>
                  <option>AI Hybrid Model</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">Processing Quality</label>
                <select className="w-full mt-1 p-2 text-sm bg-[var(--secondary)] border border-[var(--border)] rounded">
                  <option>Ultra High (8x processing)</option>
                  <option>High Quality (4x processing)</option>
                  <option>Balanced (2x processing)</option>
                  <option>Real-time (1x processing)</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">Vocal Sensitivity</label>
                <input type="range" min="0" max="100" defaultValue="75" className="w-full mt-1" />
                <div className="text-xs text-[var(--muted-foreground)] text-center mt-1">75%</div>
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">Harmonic Preservation</label>
                <input type="range" min="0" max="100" defaultValue="85" className="w-full mt-1" />
                <div className="text-xs text-[var(--muted-foreground)] text-center mt-1">85%</div>
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">Artifact Reduction</label>
                <input type="range" min="0" max="100" defaultValue="90" className="w-full mt-1" />
                <div className="text-xs text-[var(--muted-foreground)] text-center mt-1">90%</div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-xs font-medium text-[var(--muted-foreground)]">Output Configuration</div>
              <div className="grid grid-cols-2 gap-2">
                <label className="flex items-center space-x-2 text-xs">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span>Isolated Vocals</span>
                </label>
                <label className="flex items-center space-x-2 text-xs">
                  <input type="checkbox" className="rounded" />
                  <span>Instrumental Track</span>
                </label>
                <label className="flex items-center space-x-2 text-xs">
                  <input type="checkbox" className="rounded" />
                  <span>Vocal Harmonies Only</span>
                </label>
                <label className="flex items-center space-x-2 text-xs">
                  <input type="checkbox" className="rounded" />
                  <span>Lead Vocal Only</span>
                </label>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="flex items-center justify-between p-2 bg-[var(--secondary)] rounded">
                <span>Separation Quality</span>
                <span className="font-mono text-[var(--green)]">94.2%</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-[var(--secondary)] rounded">
                <span>SNR Improvement</span>
                <span className="font-mono text-[var(--blue)]">+18.7 dB</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-[var(--secondary)] rounded">
                <span>Processing Time</span>
                <span className="font-mono text-[var(--orange)]">2.3s</span>
              </div>
            </div>
            <div className="h-20 bg-[var(--muted)] rounded flex items-center justify-center">
              <div className="text-xs text-[var(--muted-foreground)]">Real-time Separation Quality Monitor</div>
            </div>
            <div className="flex space-x-2">
              <Button size="sm" variant="outline" className="flex-1">
                <Play className="w-3 h-3 mr-1" />
                Preview Separation
              </Button>
              <Button size="sm" className="flex-1">
                <Download className="w-3 h-3 mr-1" />
                Process & Export
              </Button>
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