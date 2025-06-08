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
  ChevronDown,
  Wand2,
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
  {
    id: 'auto-eq',
    name: 'AI Auto-EQ',
    category: 'Real-time Processing',
    icon: <Volume2 className="w-4 h-4" />,
    description: 'Intelligent frequency balancing for optimal sound',
    color: 'var(--purple)',
  },
  {
    id: 'smart-compressor',
    name: 'Smart Compressor',
    category: 'Real-time Processing',
    icon: <Zap className="w-4 h-4" />,
    description: 'Adaptive compression with AI-driven parameters',
    color: 'var(--blue)',
  },
  {
    id: 'noise-suppression',
    name: 'Noise Suppression',
    category: 'Real-time Processing',
    icon: <VolumeX className="w-4 h-4" />,
    description: 'Real-time background noise removal',
    color: 'var(--green)',
  },
  {
    id: 'de-esser',
    name: 'De-esser Pro',
    category: 'Real-time Processing',
    icon: <Headphones className="w-4 h-4" />,
    description: 'Advanced sibilance reduction',
    color: 'var(--orange)',
  },

  // Audio Enhancement
  {
    id: 'vocal-clarity',
    name: 'Vocal Clarity AI',
    category: 'Audio Enhancement',
    icon: <Sparkles className="w-4 h-4" />,
    description: 'Enhance vocal presence and clarity',
    color: 'var(--purple)',
  },
  {
    id: 'instrument-isolation',
    name: 'Instrument Isolation',
    category: 'Audio Enhancement',
    icon: <Music className="w-4 h-4" />,
    description: 'Separate and enhance specific instruments',
    color: 'var(--blue)',
  },
  {
    id: 'harmonic-enhancer',
    name: 'Harmonic Enhancer',
    category: 'Audio Enhancement',
    icon: <Waves className="w-4 h-4" />,
    description: 'Add warmth and harmonic richness',
    color: 'var(--cyan)',
  },
  {
    id: 'stereo-widener',
    name: 'Stereo Widener',
    category: 'Audio Enhancement',
    icon: <TrendingUp className="w-4 h-4" />,
    description: 'Intelligent stereo field expansion',
    color: 'var(--green)',
  },

  // Stem Separation
  {
    id: 'isolate-vocals',
    name: 'Isolate Vocals',
    category: 'Stem Separation',
    icon: <Radio className="w-4 h-4" />,
    description: 'Extract vocal tracks from mixed audio',
    color: 'var(--red)',
  },
  {
    id: 'extract-drums',
    name: 'Extract Drums',
    category: 'Stem Separation',
    icon: <Music className="w-4 h-4" />,
    description: 'Separate drum elements from mix',
    color: 'var(--blue)',
  },
  {
    id: 'separate-bass',
    name: 'Separate Bass',
    category: 'Stem Separation',
    icon: <Piano className="w-4 h-4" />,
    description: 'Isolate bass frequencies and instruments',
    color: 'var(--purple)',
  },
  {
    id: 'four-stem-split',
    name: '4-Stem Split',
    category: 'Stem Separation',
    icon: <Layers className="w-4 h-4" />,
    description: 'Complete track separation into 4 stems',
    color: 'var(--orange)',
  },

  // Mix Analysis
  {
    id: 'frequency-analysis',
    name: 'Frequency Analysis',
    category: 'Mix Analysis',
    icon: <BarChart3 className="w-4 h-4" />,
    description: 'Deep spectral analysis and recommendations',
    color: 'var(--blue)',
  },
  {
    id: 'loudness-check',
    name: 'Loudness Check',
    category: 'Mix Analysis',
    icon: <Target className="w-4 h-4" />,
    description: 'LUFS compliance and loudness standards',
    color: 'var(--green)',
  },
  {
    id: 'phase-correlation',
    name: 'Phase Correlation',
    category: 'Mix Analysis',
    icon: <Activity className="w-4 h-4" />,
    description: 'Stereo phase relationship analysis',
    color: 'var(--purple)',
  },
  {
    id: 'dynamic-range',
    name: 'Dynamic Range',
    category: 'Mix Analysis',
    icon: <Gauge className="w-4 h-4" />,
    description: 'Dynamic range measurement and optimization',
    color: 'var(--orange)',
  },

  // AI Mastering
  {
    id: 'auto-master',
    name: 'Auto-Master',
    category: 'AI Mastering',
    icon: <Crown className="w-4 h-4" />,
    description: 'Complete AI-driven mastering chain',
    color: 'var(--yellow)',
  },
  {
    id: 'genre-matching',
    name: 'Genre Matching',
    category: 'AI Mastering',
    icon: <Sliders className="w-4 h-4" />,
    description: 'Style-specific mastering presets',
    color: 'var(--blue)',
  },
  {
    id: 'limiting-ai',
    name: 'Limiting AI',
    category: 'AI Mastering',
    icon: <Minimize2 className="w-4 h-4" />,
    description: 'Intelligent peak limiting and control',
    color: 'var(--red)',
  },
  {
    id: 'platform-optimize',
    name: 'Platform Optimize',
    category: 'AI Mastering',
    icon: <Globe className="w-4 h-4" />,
    description: 'Optimize for streaming platforms',
    color: 'var(--green)',
  },

  // AI Generation
  {
    id: 'voice-synthesis',
    name: 'Voice Synthesis',
    category: 'AI Generation',
    icon: <Mic className="w-4 h-4" />,
    description: 'Generate realistic voice recordings',
    color: 'var(--purple)',
  },
  {
    id: 'ambient-generator',
    name: 'Ambient Generator',
    category: 'AI Generation',
    icon: <Wind className="w-4 h-4" />,
    description: 'Create atmospheric soundscapes',
    color: 'var(--cyan)',
  },
  {
    id: 'midi-composer',
    name: 'MIDI Composer',
    category: 'AI Generation',
    icon: <Music2 className="w-4 h-4" />,
    description: 'AI-powered melody and harmony creation',
    color: 'var(--blue)',
  },
  {
    id: 'variation-creator',
    name: 'Variation Creator',
    category: 'AI Generation',
    icon: <Shuffle className="w-4 h-4" />,
    description: 'Generate musical variations and ideas',
    color: 'var(--orange)',
  },

  // Post-Production
  {
    id: 'video-sync',
    name: 'Audio to Video Sync',
    category: 'Post-Production',
    icon: <Film className="w-4 h-4" />,
    description: 'Automatic audio-video synchronization',
    color: 'var(--purple)',
  },
  {
    id: 'speech-enhancement',
    name: 'Speech Enhancement',
    category: 'Post-Production',
    icon: <MessageSquare className="w-4 h-4" />,
    description: 'Improve dialogue clarity and presence',
    color: 'var(--blue)',
  },
  {
    id: 'auto-edit',
    name: 'Auto-Edit',
    category: 'Post-Production',
    icon: <Scissors className="w-4 h-4" />,
    description: 'Intelligent audio editing and cleanup',
    color: 'var(--red)',
  },
  {
    id: 'format-converter',
    name: 'Format Converter',
    category: 'Post-Production',
    icon: <FileAudio className="w-4 h-4" />,
    description: 'High-quality format conversion',
    color: 'var(--green)',
  },
];

export function AIToolsModal({
  isOpen,
  onClose,
  initialTool = 'auto-eq',
}: AIToolsModalProps) {
  const [selectedTool, setSelectedTool] = useState(initialTool);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Update selected tool when modal opens with a specific tool
  useEffect(() => {
    if (isOpen) {
      setSelectedTool(initialTool);
    }
  }, [isOpen, initialTool]);

  const categories = [
    'All',
    ...Array.from(new Set(aiTools.map((tool) => tool.category))),
  ];

  const filteredTools = aiTools.filter((tool) => {
    const matchesSearch =
      tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === 'All' || tool.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const currentTool =
    aiTools.find((tool) => tool.id === selectedTool) || aiTools[0];

  if (!isOpen) return null;

  const renderToolInterface = (tool: AITool) => {
    switch (tool.id) {
      case 'auto-eq':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">
                  Target Curve
                </label>
                <select className="w-full mt-1 p-2 text-sm bg-[var(--secondary)] border border-[var(--border)] rounded">
                  <option>Flat Response</option>
                  <option>Vocal Enhancement</option>
                  <option>Podcast</option>
                  <option>Music Master</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">
                  Processing Strength
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  defaultValue="75"
                  className="w-full mt-1"
                />
              </div>
            </div>
            <div className="h-32 bg-[var(--muted)] rounded p-3 relative">
              <div className="text-xs font-medium text-[var(--muted-foreground)] mb-2">
                Frequency Response Graph
              </div>
              <div className="h-20 relative border-l border-b border-[var(--border)]">
                <svg className="w-full h-full" viewBox="0 0 300 80">
                  <path
                    d="M0,60 Q75,45 150,50 T300,55"
                    stroke="var(--blue)"
                    strokeWidth="2"
                    fill="none"
                    opacity="0.8"
                  />
                  <path
                    d="M0,70 Q75,55 150,60 T300,65"
                    stroke="var(--green)"
                    strokeWidth="1.5"
                    fill="none"
                    opacity="0.6"
                  />
                  <circle
                    cx="120"
                    cy="50"
                    r="3"
                    fill="var(--yellow)"
                    opacity="0.8"
                  >
                    <animate
                      attributeName="opacity"
                      values="0.8;1;0.8"
                      dur="2s"
                      repeatCount="indefinite"
                    />
                  </circle>
                </svg>
                <div className="absolute bottom-0 left-0 text-xs text-[var(--muted-foreground)]">
                  20Hz
                </div>
                <div className="absolute bottom-0 right-0 text-xs text-[var(--muted-foreground)]">
                  20kHz
                </div>
                <div className="absolute top-0 left-0 text-xs text-[var(--muted-foreground)]">
                  +12dB
                </div>
              </div>
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
                <label className="text-xs font-medium text-[var(--muted-foreground)]">
                  Ratio
                </label>
                <select className="w-full mt-1 p-2 text-sm bg-[var(--secondary)] border border-[var(--border)] rounded">
                  <option>2:1</option>
                  <option>4:1</option>
                  <option>8:1</option>
                  <option>∞:1 (Limiter)</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">
                  Attack (ms)
                </label>
                <input
                  type="number"
                  defaultValue="5"
                  className="w-full mt-1 p-2 text-sm bg-[var(--secondary)] border border-[var(--border)] rounded"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">
                  Release (ms)
                </label>
                <input
                  type="number"
                  defaultValue="100"
                  className="w-full mt-1 p-2 text-sm bg-[var(--secondary)] border border-[var(--border)] rounded"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">
                  Threshold
                </label>
                <input
                  type="range"
                  min="-40"
                  max="0"
                  defaultValue="-12"
                  className="w-full mt-1"
                />
                <div className="text-xs text-[var(--muted-foreground)] mt-1">
                  -12 dB
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">
                  Makeup Gain
                </label>
                <input
                  type="range"
                  min="0"
                  max="20"
                  defaultValue="3"
                  className="w-full mt-1"
                />
                <div className="text-xs text-[var(--muted-foreground)] mt-1">
                  +3 dB
                </div>
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
              <div className="text-xs text-[var(--muted-foreground)]">
                Real-time Gain Reduction Display
              </div>
            </div>
          </div>
        );

      case 'noise-suppression':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">
                  Noise Profile
                </label>
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
                <label className="text-xs font-medium text-[var(--muted-foreground)]">
                  Processing Mode
                </label>
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
                <span className="text-xs text-[var(--muted-foreground)]">
                  75%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                defaultValue="75"
                className="w-full"
              />
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium">Sensitivity</span>
                <span className="text-xs text-[var(--muted-foreground)]">
                  60%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                defaultValue="60"
                className="w-full"
              />
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
                <label className="text-xs font-medium text-[var(--muted-foreground)]">
                  Voice Type
                </label>
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
                <label className="text-xs font-medium text-[var(--muted-foreground)]">
                  Enhancement Style
                </label>
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
                <span className="text-xs text-[var(--muted-foreground)]">
                  65%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                defaultValue="65"
                className="w-full"
              />
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium">Clarity Enhancement</span>
                <span className="text-xs text-[var(--muted-foreground)]">
                  80%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                defaultValue="80"
                className="w-full"
              />
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium">Breath Control</span>
                <span className="text-xs text-[var(--muted-foreground)]">
                  40%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                defaultValue="40"
                className="w-full"
              />
            </div>
            <div className="h-16 bg-[var(--muted)] rounded flex items-center justify-center">
              <div className="text-xs text-[var(--muted-foreground)]">
                Spectral Analysis Display
              </div>
            </div>
          </div>
        );

      case 'frequency-analysis':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">
                  Analysis Type
                </label>
                <select className="w-full mt-1 p-2 text-sm bg-[var(--secondary)] border border-[var(--border)] rounded">
                  <option>Full Spectrum</option>
                  <option>Peak Analysis</option>
                  <option>RMS Average</option>
                  <option>Third Octave</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">
                  Window Size
                </label>
                <select className="w-full mt-1 p-2 text-sm bg-[var(--secondary)] border border-[var(--border)] rounded">
                  <option>2048</option>
                  <option>4096</option>
                  <option>8192</option>
                  <option>16384</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">
                  Averaging
                </label>
                <select className="w-full mt-1 p-2 text-sm bg-[var(--secondary)] border border-[var(--border)] rounded">
                  <option>None</option>
                  <option>2x</option>
                  <option>4x</option>
                  <option>8x</option>
                </select>
              </div>
            </div>
            <div className="h-32 bg-[var(--muted)] rounded flex items-center justify-center">
              <div className="text-xs text-[var(--muted-foreground)]">
                Real-time FFT Spectrum Analyzer
              </div>
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
                <label className="text-xs font-medium text-[var(--muted-foreground)]">
                  Voice Model
                </label>
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
                <label className="text-xs font-medium text-[var(--muted-foreground)]">
                  Language
                </label>
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
              <label className="text-xs font-medium text-[var(--muted-foreground)]">
                Text Input
              </label>
              <textarea
                className="w-full mt-1 p-2 text-sm bg-[var(--secondary)] border border-[var(--border)] rounded h-20 resize-none"
                placeholder="Enter text to synthesize..."
                defaultValue="Welcome to the AI-powered audio workstation. This is a demonstration of high-quality voice synthesis."
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">
                  Speed
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  defaultValue="1"
                  className="w-full mt-1"
                />
                <div className="text-xs text-[var(--muted-foreground)] text-center">
                  1.0x
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">
                  Pitch
                </label>
                <input
                  type="range"
                  min="-12"
                  max="12"
                  defaultValue="0"
                  className="w-full mt-1"
                />
                <div className="text-xs text-[var(--muted-foreground)] text-center">
                  0 ST
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">
                  Emotion
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  defaultValue="50"
                  className="w-full mt-1"
                />
                <div className="text-xs text-[var(--muted-foreground)] text-center">
                  Neutral
                </div>
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
                <label className="text-xs font-medium text-[var(--muted-foreground)]">
                  Musical Style
                </label>
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
                <label className="text-xs font-medium text-[var(--muted-foreground)]">
                  Key Signature
                </label>
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
                <label className="text-xs font-medium text-[var(--muted-foreground)]">
                  Tempo
                </label>
                <input
                  type="number"
                  min="60"
                  max="200"
                  defaultValue="120"
                  className="w-full mt-1 p-2 text-sm bg-[var(--secondary)] border border-[var(--border)] rounded"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">
                  Bars
                </label>
                <input
                  type="number"
                  min="4"
                  max="64"
                  defaultValue="16"
                  className="w-full mt-1 p-2 text-sm bg-[var(--secondary)] border border-[var(--border)] rounded"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">
                  Time Sig
                </label>
                <select className="w-full mt-1 p-2 text-sm bg-[var(--secondary)] border border-[var(--border)] rounded">
                  <option>4/4</option>
                  <option>3/4</option>
                  <option>6/8</option>
                  <option>7/8</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">
                  Complexity
                </label>
                <select className="w-full mt-1 p-2 text-sm bg-[var(--secondary)] border border-[var(--border)] rounded">
                  <option>Simple</option>
                  <option>Medium</option>
                  <option>Complex</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-xs font-medium text-[var(--muted-foreground)]">
                Instruments
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  'Piano',
                  'Strings',
                  'Brass',
                  'Woodwinds',
                  'Percussion',
                  'Bass',
                ].map((instrument) => (
                  <label
                    key={instrument}
                    className="flex items-center space-x-2 text-xs"
                  >
                    <input
                      type="checkbox"
                      defaultChecked={instrument === 'Piano'}
                      className="rounded"
                    />
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
                <label className="text-xs font-medium text-[var(--muted-foreground)]">
                  Isolation Algorithm
                </label>
                <select className="w-full mt-1 p-2 text-sm bg-[var(--secondary)] border border-[var(--border)] rounded">
                  <option>PANN-based Deep Learning</option>
                  <option>Spectral Subtraction</option>
                  <option>HPSS (Harmonic-Percussive)</option>
                  <option>Center Channel Extraction</option>
                  <option>AI Hybrid Model</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">
                  Processing Quality
                </label>
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
                <label className="text-xs font-medium text-[var(--muted-foreground)]">
                  Vocal Sensitivity
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  defaultValue="75"
                  className="w-full mt-1"
                />
                <div className="text-xs text-[var(--muted-foreground)] text-center mt-1">
                  75%
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">
                  Harmonic Preservation
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  defaultValue="85"
                  className="w-full mt-1"
                />
                <div className="text-xs text-[var(--muted-foreground)] text-center mt-1">
                  85%
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">
                  Artifact Reduction
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  defaultValue="90"
                  className="w-full mt-1"
                />
                <div className="text-xs text-[var(--muted-foreground)] text-center mt-1">
                  90%
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-xs font-medium text-[var(--muted-foreground)]">
                Output Configuration
              </div>
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
              <div className="text-xs text-[var(--muted-foreground)]">
                Real-time Separation Quality Monitor
              </div>
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
                <label className="text-xs font-medium text-[var(--muted-foreground)]">
                  Target Platform
                </label>
                <select className="w-full mt-1 p-2 text-sm bg-[var(--secondary)] border border-[var(--border)] rounded">
                  <option>Spotify</option>
                  <option>Apple Music</option>
                  <option>YouTube</option>
                  <option>Broadcast</option>
                  <option>CD Master</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">
                  Genre
                </label>
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
                <span className="text-xs text-[var(--muted-foreground)]">
                  -14.0
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium">Dynamic Range</span>
                <span className="text-xs text-[var(--muted-foreground)]">
                  8.5 LU
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium">True Peak Limit</span>
                <span className="text-xs text-[var(--muted-foreground)]">
                  -1.0 dB
                </span>
              </div>
            </div>
            <Button className="w-full">
              <Crown className="w-3 h-3 mr-2" />
              Start Mastering Process
            </Button>
          </div>
        );

      case 'extract-drums':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">
                  Separation Algorithm
                </label>
                <select className="w-full mt-1 p-2 text-sm bg-[var(--secondary)] border border-[var(--border)] rounded">
                  <option>AI Deep Learning (Spleeter)</option>
                  <option>Spectral Masking</option>
                  <option>HPSS + Neural Net</option>
                  <option>Drumtrack Isolation</option>
                  <option>Transient Detection</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">
                  Output Quality
                </label>
                <select className="w-full mt-1 p-2 text-sm bg-[var(--secondary)] border border-[var(--border)] rounded">
                  <option>Studio Quality (Slow)</option>
                  <option>High Quality</option>
                  <option>Balanced</option>
                  <option>Real-time</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-xs font-medium text-[var(--muted-foreground)]">
                Drum Element Control
              </div>
              <div className="space-y-2">
                {[
                  'Kick Drum',
                  'Snare',
                  'Hi-hats',
                  'Cymbals',
                  'Toms',
                  'Percussion',
                ].map((element) => (
                  <div
                    key={element}
                    className="flex items-center justify-between"
                  >
                    <span className="text-xs w-20">{element}</span>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      defaultValue="80"
                      className="flex-1 mx-3"
                    />
                    <span className="text-xs w-8 text-[var(--muted-foreground)]">
                      80%
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="flex items-center justify-between p-2 bg-[var(--secondary)] rounded">
                <span>Isolation</span>
                <span className="font-mono text-[var(--green)]">89.4%</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-[var(--secondary)] rounded">
                <span>Artifacts</span>
                <span className="font-mono text-[var(--blue)]">Low</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-[var(--secondary)] rounded">
                <span>Time</span>
                <span className="font-mono text-[var(--orange)]">3.2s</span>
              </div>
            </div>
            <div className="h-20 bg-[var(--muted)] rounded flex items-center justify-center">
              <div className="text-xs text-[var(--muted-foreground)]">
                Drum Separation Waveform
              </div>
            </div>
          </div>
        );

      case 'separate-bass':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">
                  Bass Type
                </label>
                <select className="w-full mt-1 p-2 text-sm bg-[var(--secondary)] border border-[var(--border)] rounded">
                  <option>Electric Bass</option>
                  <option>Upright Bass</option>
                  <option>Synth Bass</option>
                  <option>Sub Bass</option>
                  <option>All Bass Frequencies</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">
                  Frequency Range
                </label>
                <select className="w-full mt-1 p-2 text-sm bg-[var(--secondary)] border border-[var(--border)] rounded">
                  <option>20-250 Hz (Sub + Bass)</option>
                  <option>40-200 Hz (Fundamental)</option>
                  <option>20-500 Hz (Extended)</option>
                  <option>Custom Range</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">
                  Low Cut (Hz)
                </label>
                <input
                  type="number"
                  min="10"
                  max="100"
                  defaultValue="20"
                  className="w-full mt-1 p-2 text-sm bg-[var(--secondary)] border border-[var(--border)] rounded"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">
                  High Cut (Hz)
                </label>
                <input
                  type="number"
                  min="100"
                  max="1000"
                  defaultValue="250"
                  className="w-full mt-1 p-2 text-sm bg-[var(--secondary)] border border-[var(--border)] rounded"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">
                  Sensitivity
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  defaultValue="75"
                  className="w-full mt-1"
                />
                <div className="text-xs text-[var(--muted-foreground)] text-center">
                  75%
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">
                  Harmonic Preservation
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  defaultValue="60"
                  className="w-full mt-1"
                />
                <div className="text-xs text-[var(--muted-foreground)] text-center">
                  60%
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">
                  Attack Preservation
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  defaultValue="85"
                  className="w-full mt-1"
                />
                <div className="text-xs text-[var(--muted-foreground)] text-center">
                  85%
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-xs font-medium text-[var(--muted-foreground)]">
                Processing Options
              </div>
              <div className="grid grid-cols-2 gap-2">
                <label className="flex items-center space-x-2 text-xs">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span>Preserve Dynamics</span>
                </label>
                <label className="flex items-center space-x-2 text-xs">
                  <input type="checkbox" className="rounded" />
                  <span>Mono Bass Output</span>
                </label>
                <label className="flex items-center space-x-2 text-xs">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span>Phase Coherent</span>
                </label>
                <label className="flex items-center space-x-2 text-xs">
                  <input type="checkbox" className="rounded" />
                  <span>Enhance Fundamentals</span>
                </label>
              </div>
            </div>
            <div className="h-16 bg-[var(--muted)] rounded flex items-center justify-center">
              <div className="text-xs text-[var(--muted-foreground)]">
                Bass Frequency Analysis
              </div>
            </div>
          </div>
        );

      case 'four-stem-split':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">
                  Stem Configuration
                </label>
                <select className="w-full mt-1 p-2 text-sm bg-[var(--secondary)] border border-[var(--border)] rounded">
                  <option>Vocals, Drums, Bass, Other</option>
                  <option>Vocals, Drums, Music, Other</option>
                  <option>Lead, Rhythm, Bass, Drums</option>
                  <option>Custom Configuration</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">
                  AI Model
                </label>
                <select className="w-full mt-1 p-2 text-sm bg-[var(--secondary)] border border-[var(--border)] rounded">
                  <option>Spleeter 4-stem</option>
                  <option>DEMUCS v3</option>
                  <option>OpenUnmix</option>
                  <option>Custom Neural Net</option>
                </select>
              </div>
            </div>
            <div className="space-y-3">
              <div className="text-xs font-medium text-[var(--muted-foreground)]">
                Stem Quality Control
              </div>
              {['Vocals', 'Drums', 'Bass', 'Other Instruments'].map(
                (stem, i) => (
                  <div key={stem} className="flex items-center justify-between">
                    <span className="text-xs w-24">{stem}</span>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      defaultValue={[85, 80, 75, 70][i]}
                      className="flex-1 mx-3"
                    />
                    <span className="text-xs w-12 text-[var(--muted-foreground)]">
                      {[85, 80, 75, 70][i]}%
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0 ml-2"
                    >
                      <Play className="w-3 h-3" />
                    </Button>
                  </div>
                )
              )}
            </div>
            <div className="grid grid-cols-4 gap-2 text-xs">
              <div className="text-center p-2 bg-[var(--secondary)] rounded">
                <div className="font-mono text-[var(--purple)]">Vocals</div>
                <div className="text-[var(--muted-foreground)]">92.1%</div>
              </div>
              <div className="text-center p-2 bg-[var(--secondary)] rounded">
                <div className="font-mono text-[var(--blue)]">Drums</div>
                <div className="text-[var(--muted-foreground)]">87.5%</div>
              </div>
              <div className="text-center p-2 bg-[var(--secondary)] rounded">
                <div className="font-mono text-[var(--green)]">Bass</div>
                <div className="text-[var(--muted-foreground)]">84.3%</div>
              </div>
              <div className="text-center p-2 bg-[var(--secondary)] rounded">
                <div className="font-mono text-[var(--orange)]">Other</div>
                <div className="text-[var(--muted-foreground)]">78.9%</div>
              </div>
            </div>
            <div className="bg-[var(--secondary)] p-3 rounded">
              <div className="text-xs font-medium mb-2">Processing Status</div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>Overall quality:</span>
                  <span className="font-mono text-[var(--green)]">85.7%</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated time:</span>
                  <span className="font-mono">4.2 minutes</span>
                </div>
                <div className="flex justify-between">
                  <span>GPU acceleration:</span>
                  <span className="font-mono text-[var(--green)]">Enabled</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'genre-matching':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">
                  Target Genre
                </label>
                <select className="w-full mt-1 p-2 text-sm bg-[var(--secondary)] border border-[var(--border)] rounded">
                  <option>Pop/Top 40</option>
                  <option>Rock/Alternative</option>
                  <option>Hip-Hop/Rap</option>
                  <option>Electronic/EDM</option>
                  <option>Classical</option>
                  <option>Jazz</option>
                  <option>Country</option>
                  <option>R&B/Soul</option>
                  <option>Metal</option>
                  <option>Folk/Acoustic</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">
                  Era/Style
                </label>
                <select className="w-full mt-1 p-2 text-sm bg-[var(--secondary)] border border-[var(--border)] rounded">
                  <option>Modern (2020s)</option>
                  <option>2010s</option>
                  <option>2000s</option>
                  <option>90s</option>
                  <option>80s</option>
                  <option>70s</option>
                  <option>60s</option>
                  <option>Classic</option>
                </select>
              </div>
            </div>
            <div className="space-y-3">
              <div className="text-xs font-medium text-[var(--muted-foreground)]">
                Mastering Characteristics
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-[var(--muted-foreground)]">
                    Loudness Target
                  </label>
                  <input
                    type="range"
                    min="-23"
                    max="-8"
                    defaultValue="-14"
                    className="w-full mt-1"
                  />
                  <div className="text-xs text-[var(--muted-foreground)] text-center">
                    -14 LUFS
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-[var(--muted-foreground)]">
                    Dynamic Range
                  </label>
                  <input
                    type="range"
                    min="3"
                    max="20"
                    defaultValue="8"
                    className="w-full mt-1"
                  />
                  <div className="text-xs text-[var(--muted-foreground)] text-center">
                    8 LU
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-xs font-medium text-[var(--muted-foreground)]">
                Genre-Specific Processing
              </div>
              <div className="grid grid-cols-2 gap-2">
                <label className="flex items-center space-x-2 text-xs">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span>EQ Curve Matching</span>
                </label>
                <label className="flex items-center space-x-2 text-xs">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span>Compression Style</span>
                </label>
                <label className="flex items-center space-x-2 text-xs">
                  <input type="checkbox" className="rounded" />
                  <span>Stereo Enhancement</span>
                </label>
                <label className="flex items-center space-x-2 text-xs">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span>Harmonic Saturation</span>
                </label>
              </div>
            </div>
            <div className="bg-[var(--secondary)] p-3 rounded">
              <div className="text-xs font-medium mb-2">Genre Analysis</div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>Detected genre:</span>
                  <span className="font-mono">Rock/Alternative</span>
                </div>
                <div className="flex justify-between">
                  <span>Confidence:</span>
                  <span className="font-mono text-[var(--green)]">87%</span>
                </div>
                <div className="flex justify-between">
                  <span>Suggested LUFS:</span>
                  <span className="font-mono">-13.5</span>
                </div>
                <div className="flex justify-between">
                  <span>Typical DR:</span>
                  <span className="font-mono">6-9 LU</span>
                </div>
              </div>
            </div>
            <div className="h-16 bg-[var(--muted)] rounded flex items-center justify-center">
              <div className="text-xs text-[var(--muted-foreground)]">
                Genre Reference Curve
              </div>
            </div>
          </div>
        );

      case 'limiting-ai':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">
                  Limiter Type
                </label>
                <select className="w-full mt-1 p-2 text-sm bg-[var(--secondary)] border border-[var(--border)] rounded">
                  <option>Transparent (Clean)</option>
                  <option>Musical (Warm)</option>
                  <option>Aggressive (Loud)</option>
                  <option>Vintage (Character)</option>
                  <option>Broadcast (Safe)</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">
                  Look-ahead
                </label>
                <select className="w-full mt-1 p-2 text-sm bg-[var(--secondary)] border border-[var(--border)] rounded">
                  <option>10ms (Standard)</option>
                  <option>5ms (Fast)</option>
                  <option>20ms (Smooth)</option>
                  <option>Auto-adaptive</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">
                  Ceiling
                </label>
                <input
                  type="range"
                  min="-3"
                  max="0"
                  step="0.1"
                  defaultValue="-0.1"
                  className="w-full mt-1"
                />
                <div className="text-xs text-[var(--muted-foreground)] text-center">
                  -0.1 dBFS
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">
                  Release
                </label>
                <input
                  type="range"
                  min="1"
                  max="1000"
                  defaultValue="50"
                  className="w-full mt-1"
                />
                <div className="text-xs text-[var(--muted-foreground)] text-center">
                  50ms
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">
                  Character
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  defaultValue="25"
                  className="w-full mt-1"
                />
                <div className="text-xs text-[var(--muted-foreground)] text-center">
                  25%
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-xs font-medium text-[var(--muted-foreground)]">
                Advanced Controls
              </div>
              <div className="grid grid-cols-2 gap-2">
                <label className="flex items-center space-x-2 text-xs">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span>ISP (Inter-sample Peaks)</span>
                </label>
                <label className="flex items-center space-x-2 text-xs">
                  <input type="checkbox" className="rounded" />
                  <span>Multiband Processing</span>
                </label>
                <label className="flex items-center space-x-2 text-xs">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span>Adaptive Release</span>
                </label>
                <label className="flex items-center space-x-2 text-xs">
                  <input type="checkbox" className="rounded" />
                  <span>Dither to 16-bit</span>
                </label>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2 text-xs">
              <div className="text-center p-2 bg-[var(--secondary)] rounded">
                <div className="font-mono text-[var(--red)]">Peak</div>
                <div className="text-[var(--muted-foreground)]">-0.1 dB</div>
              </div>
              <div className="text-center p-2 bg-[var(--secondary)] rounded">
                <div className="font-mono text-[var(--orange)]">GR</div>
                <div className="text-[var(--muted-foreground)]">-2.3 dB</div>
              </div>
              <div className="text-center p-2 bg-[var(--secondary)] rounded">
                <div className="font-mono text-[var(--blue)]">ISP</div>
                <div className="text-[var(--muted-foreground)]">-0.8 dB</div>
              </div>
              <div className="text-center p-2 bg-[var(--secondary)] rounded">
                <div className="font-mono text-[var(--green)]">RMS</div>
                <div className="text-[var(--muted-foreground)]">-12.1 dB</div>
              </div>
            </div>
            <div className="h-20 bg-[var(--muted)] rounded flex items-center justify-center">
              <div className="text-xs text-[var(--muted-foreground)]">
                Real-time Gain Reduction Meter
              </div>
            </div>
          </div>
        );

      case 'loudness-check':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">
                  Measurement Standard
                </label>
                <select className="w-full mt-1 p-2 text-sm bg-[var(--secondary)] border border-[var(--border)] rounded">
                  <option>EBU R128 (Broadcast)</option>
                  <option>ATSC A/85 (US TV)</option>
                  <option>ARIB TR-B32 (Japan)</option>
                  <option>iTunes/Apple Music</option>
                  <option>Spotify Loudness</option>
                  <option>YouTube Normalization</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">
                  Target Platform
                </label>
                <select className="w-full mt-1 p-2 text-sm bg-[var(--secondary)] border border-[var(--border)] rounded">
                  <option>Streaming (-14 LUFS)</option>
                  <option>Broadcast (-23 LUFS)</option>
                  <option>Cinema (-31 LUFS)</option>
                  <option>Podcast (-16 LUFS)</option>
                  <option>Custom Target</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="p-3 bg-[var(--secondary)] rounded">
                <div className="text-xs text-[var(--muted-foreground)]">
                  Integrated
                </div>
                <div className="text-xl font-mono text-[var(--green)]">
                  -14.2
                </div>
                <div className="text-xs text-[var(--green)]">LUFS</div>
              </div>
              <div className="p-3 bg-[var(--secondary)] rounded">
                <div className="text-xs text-[var(--muted-foreground)]">
                  Range
                </div>
                <div className="text-xl font-mono text-[var(--blue)]">8.3</div>
                <div className="text-xs text-[var(--blue)]">LU</div>
              </div>
              <div className="p-3 bg-[var(--secondary)] rounded">
                <div className="text-xs text-[var(--muted-foreground)]">
                  True Peak
                </div>
                <div className="text-xl font-mono text-[var(--orange)]">
                  -1.2
                </div>
                <div className="text-xs text-[var(--orange)]">dBTP</div>
              </div>
              <div className="p-3 bg-[var(--secondary)] rounded">
                <div className="text-xs text-[var(--muted-foreground)]">
                  Short-term
                </div>
                <div className="text-xl font-mono text-[var(--purple)]">
                  -13.8
                </div>
                <div className="text-xs text-[var(--purple)]">LUFS</div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-xs font-medium text-[var(--muted-foreground)]">
                Platform Compliance
              </div>
              <div className="space-y-1">
                {[
                  {
                    platform: 'Spotify',
                    target: '-14 LUFS',
                    status: 'Pass',
                    current: -14.2,
                  },
                  {
                    platform: 'Apple Music',
                    target: '-16 LUFS',
                    status: 'Loud',
                    current: -14.2,
                  },
                  {
                    platform: 'YouTube',
                    target: '-14 LUFS',
                    status: 'Pass',
                    current: -14.2,
                  },
                  {
                    platform: 'Tidal',
                    target: '-14 LUFS',
                    status: 'Pass',
                    current: -14.2,
                  },
                  {
                    platform: 'Broadcast',
                    target: '-23 LUFS',
                    status: 'Loud',
                    current: -14.2,
                  },
                ].map((item) => (
                  <div
                    key={item.platform}
                    className="flex items-center justify-between text-xs p-2 bg-[var(--background)] rounded"
                  >
                    <span className="font-medium w-20">{item.platform}</span>
                    <span className="text-[var(--muted-foreground)] w-16">
                      {item.target}
                    </span>
                    <span
                      className={`font-mono w-12 ${
                        item.status === 'Pass'
                          ? 'text-[var(--green)]'
                          : 'text-[var(--yellow)]'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="h-20 bg-[var(--muted)] rounded p-3 relative">
              <div className="text-xs font-medium text-[var(--muted-foreground)] mb-2">
                Loudness History (LUFS)
              </div>
              <div className="h-12 relative border-l border-b border-[var(--border)]">
                <svg className="w-full h-full" viewBox="0 0 200 48">
                  <path
                    d="M0,35 L25,32 L50,28 L75,30 L100,25 L125,27 L150,24 L175,26 L200,23"
                    stroke="var(--green)"
                    strokeWidth="2"
                    fill="none"
                    opacity="0.8"
                  />
                  <path
                    d="M0,20 L200,20"
                    stroke="var(--red)"
                    strokeWidth="1"
                    strokeDasharray="3,3"
                    opacity="0.6"
                  />
                  <circle cx="175" cy="26" r="2" fill="var(--blue)">
                    <animate
                      attributeName="cy"
                      values="26;24;28;26"
                      dur="3s"
                      repeatCount="indefinite"
                    />
                  </circle>
                </svg>
                <div className="absolute top-0 left-0 text-xs text-[var(--muted-foreground)]">
                  -10
                </div>
                <div className="absolute bottom-0 left-0 text-xs text-[var(--muted-foreground)]">
                  -30
                </div>
                <div className="absolute bottom-0 right-0 text-xs text-[var(--muted-foreground)]">
                  Now
                </div>
              </div>
            </div>
          </div>
        );

      case 'platform-optimize':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">
                  Target Platform
                </label>
                <select className="w-full mt-1 p-2 text-sm bg-[var(--secondary)] border border-[var(--border)] rounded">
                  <option>Spotify</option>
                  <option>Apple Music</option>
                  <option>YouTube Music</option>
                  <option>Tidal</option>
                  <option>Amazon Music</option>
                  <option>SoundCloud</option>
                  <option>Bandcamp</option>
                  <option>All Platforms</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">
                  Optimization Level
                </label>
                <select className="w-full mt-1 p-2 text-sm bg-[var(--secondary)] border border-[var(--border)] rounded">
                  <option>Conservative</option>
                  <option>Balanced</option>
                  <option>Aggressive</option>
                  <option>Maximum Loudness</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-xs font-medium text-[var(--muted-foreground)]">
                Platform Specifications
              </div>
              <div className="bg-[var(--secondary)] p-3 rounded">
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <div className="font-medium mb-1">Loudness Target</div>
                    <div className="text-[var(--muted-foreground)]">
                      -14.0 LUFS (Spotify)
                    </div>
                  </div>
                  <div>
                    <div className="font-medium mb-1">True Peak Limit</div>
                    <div className="text-[var(--muted-foreground)]">
                      -1.0 dBTP
                    </div>
                  </div>
                  <div>
                    <div className="font-medium mb-1">Sample Rate</div>
                    <div className="text-[var(--muted-foreground)]">
                      44.1 kHz
                    </div>
                  </div>
                  <div>
                    <div className="font-medium mb-1">Bit Depth</div>
                    <div className="text-[var(--muted-foreground)]">16-bit</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-xs font-medium text-[var(--muted-foreground)]">
                Optimization Features
              </div>
              <div className="grid grid-cols-2 gap-2">
                <label className="flex items-center space-x-2 text-xs">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span>Loudness Normalization</span>
                </label>
                <label className="flex items-center space-x-2 text-xs">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span>True Peak Limiting</span>
                </label>
                <label className="flex items-center space-x-2 text-xs">
                  <input type="checkbox" className="rounded" />
                  <span>EQ Matching</span>
                </label>
                <label className="flex items-center space-x-2 text-xs">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span>Format Conversion</span>
                </label>
                <label className="flex items-center space-x-2 text-xs">
                  <input type="checkbox" className="rounded" />
                  <span>Metadata Embedding</span>
                </label>
                <label className="flex items-center space-x-2 text-xs">
                  <input type="checkbox" className="rounded" />
                  <span>Quality Analysis</span>
                </label>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="flex items-center justify-between p-2 bg-[var(--secondary)] rounded">
                <span>Loudness</span>
                <span className="font-mono text-[var(--green)]">✓ -14.0</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-[var(--secondary)] rounded">
                <span>True Peak</span>
                <span className="font-mono text-[var(--green)]">✓ -1.0</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-[var(--secondary)] rounded">
                <span>Quality</span>
                <span className="font-mono text-[var(--green)]">95%</span>
              </div>
            </div>
            <div className="h-16 bg-[var(--muted)] rounded flex items-center justify-center">
              <div className="text-xs text-[var(--muted-foreground)]">
                Platform Compliance Dashboard
              </div>
            </div>
          </div>
        );

      case 'ambient-generator':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">
                  Environment Type
                </label>
                <select className="w-full mt-1 p-2 text-sm bg-[var(--secondary)] border border-[var(--border)] rounded">
                  <option>Forest/Nature</option>
                  <option>Ocean Waves</option>
                  <option>Rain/Thunderstorm</option>
                  <option>City/Urban</option>
                  <option>Space/Cosmic</option>
                  <option>Cave/Echo</option>
                  <option>Wind/Air</option>
                  <option>Fire/Crackling</option>
                  <option>Custom Mix</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">
                  Generation Style
                </label>
                <select className="w-full mt-1 p-2 text-sm bg-[var(--secondary)] border border-[var(--border)] rounded">
                  <option>Realistic/Natural</option>
                  <option>Cinematic/Dramatic</option>
                  <option>Meditative/Calm</option>
                  <option>Sci-Fi/Electronic</option>
                  <option>Horror/Dark</option>
                  <option>Fantasy/Magical</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-3">
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">
                  Intensity
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  defaultValue="60"
                  className="w-full mt-1"
                />
                <div className="text-xs text-[var(--muted-foreground)] text-center">
                  60%
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">
                  Variation
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  defaultValue="40"
                  className="w-full mt-1"
                />
                <div className="text-xs text-[var(--muted-foreground)] text-center">
                  40%
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">
                  Length (min)
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  defaultValue="5"
                  className="w-full mt-1 p-2 text-sm bg-[var(--secondary)] border border-[var(--border)] rounded"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">
                  Stereo Width
                </label>
                <input
                  type="range"
                  min="0"
                  max="200"
                  defaultValue="100"
                  className="w-full mt-1"
                />
                <div className="text-xs text-[var(--muted-foreground)] text-center">
                  100%
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-xs font-medium text-[var(--muted-foreground)]">
                Ambient Elements
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  'Low Frequency Rumble',
                  'Mid Frequency Texture',
                  'High Frequency Detail',
                  'Periodic Events',
                  'Movement/Motion',
                  'Harmonic Content',
                ].map((element) => (
                  <label
                    key={element}
                    className="flex items-center space-x-2 text-xs"
                  >
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span>{element}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">
                  Low Freq
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  defaultValue="70"
                  className="w-full mt-1"
                />
                <div className="text-xs text-[var(--muted-foreground)] text-center">
                  70%
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">
                  Mid Freq
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  defaultValue="50"
                  className="w-full mt-1"
                />
                <div className="text-xs text-[var(--muted-foreground)] text-center">
                  50%
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">
                  High Freq
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  defaultValue="30"
                  className="w-full mt-1"
                />
                <div className="text-xs text-[var(--muted-foreground)] text-center">
                  30%
                </div>
              </div>
            </div>
            <div className="bg-[var(--secondary)] p-3 rounded">
              <div className="text-xs font-medium mb-2">Generation Preview</div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>Estimated file size:</span>
                  <span className="font-mono">45.2 MB</span>
                </div>
                <div className="flex justify-between">
                  <span>Generation time:</span>
                  <span className="font-mono">2-3 minutes</span>
                </div>
                <div className="flex justify-between">
                  <span>Seamless loop:</span>
                  <span className="font-mono text-[var(--green)]">Yes</span>
                </div>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button size="sm" variant="outline" className="flex-1">
                <Play className="w-3 h-3 mr-1" />
                Preview 30s
              </Button>
              <Button size="sm" className="flex-1">
                <Wand2 className="w-3 h-3 mr-1" />
                Generate Ambient
              </Button>
            </div>
          </div>
        );

      case 'de-esser':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">
                  Detection Mode
                </label>
                <select className="w-full mt-1 p-2 text-sm bg-[var(--secondary)] border border-[var(--border)] rounded">
                  <option>Wideband (Classic)</option>
                  <option>Split-band (Precise)</option>
                  <option>Spectral (AI-Enhanced)</option>
                  <option>Multi-stage (Gentle)</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">
                  Processing Style
                </label>
                <select className="w-full mt-1 p-2 text-sm bg-[var(--secondary)] border border-[var(--border)] rounded">
                  <option>Transparent</option>
                  <option>Musical</option>
                  <option>Aggressive</option>
                  <option>Vintage</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">
                  Frequency (Hz)
                </label>
                <input
                  type="number"
                  min="2000"
                  max="12000"
                  defaultValue="6500"
                  className="w-full mt-1 p-2 text-sm bg-[var(--secondary)] border border-[var(--border)] rounded"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">
                  Threshold
                </label>
                <input
                  type="range"
                  min="-40"
                  max="0"
                  defaultValue="-18"
                  className="w-full mt-1"
                />
                <div className="text-xs text-[var(--muted-foreground)] text-center">
                  -18 dB
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">
                  Reduction
                </label>
                <input
                  type="range"
                  min="0"
                  max="20"
                  defaultValue="6"
                  className="w-full mt-1"
                />
                <div className="text-xs text-[var(--muted-foreground)] text-center">
                  6 dB
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">
                  Attack (ms)
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="10"
                  step="0.1"
                  defaultValue="0.5"
                  className="w-full mt-1"
                />
                <div className="text-xs text-[var(--muted-foreground)] text-center">
                  0.5 ms
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">
                  Release (ms)
                </label>
                <input
                  type="range"
                  min="1"
                  max="100"
                  defaultValue="25"
                  className="w-full mt-1"
                />
                <div className="text-xs text-[var(--muted-foreground)] text-center">
                  25 ms
                </div>
              </div>
            </div>
            <div className="h-16 bg-[var(--muted)] rounded p-3 relative">
              <div className="text-xs font-medium text-[var(--muted-foreground)] mb-2">
                Sibilance Detection
              </div>
              <div className="h-8 relative border-l border-b border-[var(--border)]">
                <svg className="w-full h-full" viewBox="0 0 200 32">
                  <path
                    d="M0,20 L40,18 L80,25 L120,15 L160,22 L200,19"
                    stroke="var(--blue)"
                    strokeWidth="1.5"
                    fill="none"
                    opacity="0.7"
                  />
                  <rect
                    x="100"
                    y="8"
                    width="40"
                    height="16"
                    fill="var(--red)"
                    opacity="0.4"
                  >
                    <animate
                      attributeName="opacity"
                      values="0.4;0.7;0.4"
                      dur="2s"
                      repeatCount="indefinite"
                    />
                  </rect>
                </svg>
                <div className="absolute bottom-0 left-0 text-xs text-[var(--muted-foreground)]">
                  6kHz
                </div>
                <div className="absolute bottom-0 right-0 text-xs text-[var(--muted-foreground)]">
                  8kHz
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="flex items-center justify-between p-2 bg-[var(--secondary)] rounded">
                <span>Sibilance Level</span>
                <span className="font-mono text-[var(--yellow)]">-12.4 dB</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-[var(--secondary)] rounded">
                <span>Reduction</span>
                <span className="font-mono text-[var(--green)]">-3.2 dB</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-[var(--secondary)] rounded">
                <span>Clarity</span>
                <span className="font-mono text-[var(--blue)]">92%</span>
              </div>
            </div>
          </div>
        );

      case 'instrument-isolation':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">
                  Target Instrument
                </label>
                <select className="w-full mt-1 p-2 text-sm bg-[var(--secondary)] border border-[var(--border)] rounded">
                  <option>Piano/Keyboard</option>
                  <option>Guitar (Electric)</option>
                  <option>Guitar (Acoustic)</option>
                  <option>Bass Guitar</option>
                  <option>Violin/Strings</option>
                  <option>Saxophone</option>
                  <option>Trumpet</option>
                  <option>Flute</option>
                  <option>Custom Frequency</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">
                  Isolation Method
                </label>
                <select className="w-full mt-1 p-2 text-sm bg-[var(--secondary)] border border-[var(--border)] rounded">
                  <option>AI Spectral Analysis</option>
                  <option>Harmonic Enhancement</option>
                  <option>Frequency Masking</option>
                  <option>Source Separation</option>
                  <option>Multi-band Isolation</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-3">
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">
                  Low Cut (Hz)
                </label>
                <input
                  type="number"
                  min="20"
                  max="2000"
                  defaultValue="80"
                  className="w-full mt-1 p-2 text-sm bg-[var(--secondary)] border border-[var(--border)] rounded"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">
                  High Cut (Hz)
                </label>
                <input
                  type="number"
                  min="1000"
                  max="20000"
                  defaultValue="8000"
                  className="w-full mt-1 p-2 text-sm bg-[var(--secondary)] border border-[var(--border)] rounded"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">
                  Focus (Hz)
                </label>
                <input
                  type="number"
                  min="100"
                  max="10000"
                  defaultValue="440"
                  className="w-full mt-1 p-2 text-sm bg-[var(--secondary)] border border-[var(--border)] rounded"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">
                  Q Factor
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="10"
                  step="0.1"
                  defaultValue="2.5"
                  className="w-full mt-1"
                />
                <div className="text-xs text-[var(--muted-foreground)] text-center">
                  2.5
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">
                  Isolation Strength
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  defaultValue="75"
                  className="w-full mt-1"
                />
                <div className="text-xs text-[var(--muted-foreground)] text-center">
                  75%
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">
                  Background Suppression
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  defaultValue="60"
                  className="w-full mt-1"
                />
                <div className="text-xs text-[var(--muted-foreground)] text-center">
                  60%
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-xs font-medium text-[var(--muted-foreground)]">
                Advanced Options
              </div>
              <div className="grid grid-cols-2 gap-2">
                <label className="flex items-center space-x-2 text-xs">
                  <input type="checkbox" className="rounded" />
                  <span>Preserve Harmonics</span>
                </label>
                <label className="flex items-center space-x-2 text-xs">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span>Noise Gate</span>
                </label>
                <label className="flex items-center space-x-2 text-xs">
                  <input type="checkbox" className="rounded" />
                  <span>Phase Correction</span>
                </label>
                <label className="flex items-center space-x-2 text-xs">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span>Stereo Enhancement</span>
                </label>
              </div>
            </div>
            <div className="h-20 bg-[var(--muted)] rounded flex items-center justify-center">
              <div className="text-xs text-[var(--muted-foreground)]">
                Instrument Detection Spectrum
              </div>
            </div>
          </div>
        );

      case 'stereo-widener':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">
                  Widening Algorithm
                </label>
                <select className="w-full mt-1 p-2 text-sm bg-[var(--secondary)] border border-[var(--border)] rounded">
                  <option>Haas Effect (Delay-based)</option>
                  <option>Mid-Side Processing</option>
                  <option>Stereo Enhancer</option>
                  <option>Binaural Widening</option>
                  <option>Harmonic Exciter</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">
                  Frequency Range
                </label>
                <select className="w-full mt-1 p-2 text-sm bg-[var(--secondary)] border border-[var(--border)] rounded">
                  <option>Full Spectrum</option>
                  <option>High Frequencies Only</option>
                  <option>Mid-High Range</option>
                  <option>Custom Range</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">
                  Width Amount
                </label>
                <input
                  type="range"
                  min="0"
                  max="200"
                  defaultValue="120"
                  className="w-full mt-1"
                />
                <div className="text-xs text-[var(--muted-foreground)] text-center">
                  120%
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">
                  Center Focus
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  defaultValue="50"
                  className="w-full mt-1"
                />
                <div className="text-xs text-[var(--muted-foreground)] text-center">
                  50%
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">
                  Bass Mono
                </label>
                <input
                  type="range"
                  min="0"
                  max="500"
                  defaultValue="120"
                  className="w-full mt-1"
                />
                <div className="text-xs text-[var(--muted-foreground)] text-center">
                  120 Hz
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">
                  Crossover Frequency
                </label>
                <input
                  type="number"
                  min="100"
                  max="5000"
                  defaultValue="300"
                  className="w-full mt-1 p-2 text-sm bg-[var(--secondary)] border border-[var(--border)] rounded"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">
                  Correlation Safety
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  defaultValue="75"
                  className="w-full mt-1"
                />
                <div className="text-xs text-[var(--muted-foreground)] text-center">
                  75%
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="flex items-center justify-between p-2 bg-[var(--secondary)] rounded">
                <span>Stereo Width</span>
                <span className="font-mono text-[var(--blue)]">142%</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-[var(--secondary)] rounded">
                <span>Correlation</span>
                <span className="font-mono text-[var(--green)]">0.82</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-[var(--secondary)] rounded">
                <span>Mono Compat</span>
                <span className="font-mono text-[var(--green)]">98%</span>
              </div>
            </div>
            <div className="h-16 bg-[var(--muted)] rounded flex items-center justify-center">
              <div className="text-xs text-[var(--muted-foreground)]">
                Stereo Field Visualization
              </div>
            </div>
          </div>
        );

      case 'harmonic-enhancer':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">
                  Enhancement Model
                </label>
                <select className="w-full mt-1 p-2 text-sm bg-[var(--secondary)] border border-[var(--border)] rounded">
                  <option>Tube Saturation (Warm)</option>
                  <option>Tape Saturation (Vintage)</option>
                  <option>Transistor Coloration</option>
                  <option>Exciter (Presence)</option>
                  <option>Analog Console</option>
                  <option>Digital Harmonic</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">
                  Target Frequency
                </label>
                <select className="w-full mt-1 p-2 text-sm bg-[var(--secondary)] border border-[var(--border)] rounded">
                  <option>Full Spectrum</option>
                  <option>Bass (20-250 Hz)</option>
                  <option>Midrange (250-4k Hz)</option>
                  <option>High Freq (4k-20k Hz)</option>
                  <option>Custom Range</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-3">
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">
                  Drive
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  defaultValue="35"
                  className="w-full mt-1"
                />
                <div className="text-xs text-[var(--muted-foreground)] text-center">
                  35%
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">
                  Even H.
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  defaultValue="65"
                  className="w-full mt-1"
                />
                <div className="text-xs text-[var(--muted-foreground)] text-center">
                  65%
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">
                  Odd H.
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  defaultValue="25"
                  className="w-full mt-1"
                />
                <div className="text-xs text-[var(--muted-foreground)] text-center">
                  25%
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">
                  Warmth
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  defaultValue="50"
                  className="w-full mt-1"
                />
                <div className="text-xs text-[var(--muted-foreground)] text-center">
                  50%
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">
                  Low Freq (Hz)
                </label>
                <input
                  type="number"
                  min="20"
                  max="1000"
                  defaultValue="80"
                  className="w-full mt-1 p-2 text-sm bg-[var(--secondary)] border border-[var(--border)] rounded"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">
                  High Freq (Hz)
                </label>
                <input
                  type="number"
                  min="1000"
                  max="20000"
                  defaultValue="8000"
                  className="w-full mt-1 p-2 text-sm bg-[var(--secondary)] border border-[var(--border)] rounded"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="flex items-center justify-between p-2 bg-[var(--secondary)] rounded">
                <span>THD</span>
                <span className="font-mono text-[var(--orange)]">0.8%</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-[var(--secondary)] rounded">
                <span>Warmth</span>
                <span className="font-mono text-[var(--yellow)]">+2.1 dB</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-[var(--secondary)] rounded">
                <span>Brightness</span>
                <span className="font-mono text-[var(--blue)]">+1.5 dB</span>
              </div>
            </div>
            <div className="h-20 bg-[var(--muted)] rounded flex items-center justify-center">
              <div className="text-xs text-[var(--muted-foreground)]">
                Harmonic Distortion Spectrum
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-xs font-medium text-[var(--muted-foreground)]">
                Advanced Controls
              </div>
              <div className="grid grid-cols-2 gap-2">
                <label className="flex items-center space-x-2 text-xs">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span>Auto Gain Compensation</span>
                </label>
                <label className="flex items-center space-x-2 text-xs">
                  <input type="checkbox" className="rounded" />
                  <span>Preserve Dynamics</span>
                </label>
              </div>
            </div>
          </div>
        );

      case 'speech-enhancement':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">
                  Speech Type
                </label>
                <select className="w-full mt-1 p-2 text-sm bg-[var(--secondary)] border border-[var(--border)] rounded">
                  <option>General Speech</option>
                  <option>Podcast/Interview</option>
                  <option>Lecture/Presentation</option>
                  <option>Telephone Quality</option>
                  <option>Broadcast/Radio</option>
                  <option>Audiobook</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">
                  Enhancement Level
                </label>
                <select className="w-full mt-1 p-2 text-sm bg-[var(--secondary)] border border-[var(--border)] rounded">
                  <option>Light (Subtle)</option>
                  <option>Moderate (Balanced)</option>
                  <option>Heavy (Maximum)</option>
                  <option>Custom</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">
                  Intelligibility
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  defaultValue="80"
                  className="w-full mt-1"
                />
                <div className="text-xs text-[var(--muted-foreground)] text-center">
                  80%
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">
                  Noise Reduction
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  defaultValue="60"
                  className="w-full mt-1"
                />
                <div className="text-xs text-[var(--muted-foreground)] text-center">
                  60%
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">
                  Vocal Clarity
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  defaultValue="75"
                  className="w-full mt-1"
                />
                <div className="text-xs text-[var(--muted-foreground)] text-center">
                  75%
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-xs font-medium text-[var(--muted-foreground)]">
                Processing Options
              </div>
              <div className="grid grid-cols-2 gap-2">
                <label className="flex items-center space-x-2 text-xs">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span>De-reverb</span>
                </label>
                <label className="flex items-center space-x-2 text-xs">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span>De-noise</span>
                </label>
                <label className="flex items-center space-x-2 text-xs">
                  <input type="checkbox" className="rounded" />
                  <span>Breath Removal</span>
                </label>
                <label className="flex items-center space-x-2 text-xs">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span>EQ Optimization</span>
                </label>
                <label className="flex items-center space-x-2 text-xs">
                  <input type="checkbox" className="rounded" />
                  <span>Compression</span>
                </label>
                <label className="flex items-center space-x-2 text-xs">
                  <input type="checkbox" className="rounded" />
                  <span>Gate Low Level</span>
                </label>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="flex items-center justify-between p-2 bg-[var(--secondary)] rounded">
                <span>SNR</span>
                <span className="font-mono text-[var(--green)]">+12.4 dB</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-[var(--secondary)] rounded">
                <span>Clarity</span>
                <span className="font-mono text-[var(--blue)]">87%</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-[var(--secondary)] rounded">
                <span>Quality</span>
                <span className="font-mono text-[var(--green)]">Excellent</span>
              </div>
            </div>
            <div className="h-16 bg-[var(--muted)] rounded flex items-center justify-center">
              <div className="text-xs text-[var(--muted-foreground)]">
                Speech Analysis Spectrum
              </div>
            </div>
          </div>
        );

      case 'voice-synthesis':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">
                  Voice Model
                </label>
                <select className="w-full mt-1 p-2 text-sm bg-[var(--secondary)] border border-[var(--border)] rounded">
                  <option>Neural Voice (English)</option>
                  <option>Studio Quality (English)</option>
                  <option>Conversational (English)</option>
                  <option>Multilingual Model</option>
                  <option>Custom Voice Clone</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">
                  Voice Character
                </label>
                <select className="w-full mt-1 p-2 text-sm bg-[var(--secondary)] border border-[var(--border)] rounded">
                  <option>Male Adult</option>
                  <option>Female Adult</option>
                  <option>Young Male</option>
                  <option>Young Female</option>
                  <option>Elderly Male</option>
                  <option>Elderly Female</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-3">
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">
                  Speed
                </label>
                <input
                  type="range"
                  min="50"
                  max="150"
                  defaultValue="100"
                  className="w-full mt-1"
                />
                <div className="text-xs text-[var(--muted-foreground)] text-center">
                  100%
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">
                  Pitch
                </label>
                <input
                  type="range"
                  min="50"
                  max="150"
                  defaultValue="100"
                  className="w-full mt-1"
                />
                <div className="text-xs text-[var(--muted-foreground)] text-center">
                  100%
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">
                  Emotion
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  defaultValue="50"
                  className="w-full mt-1"
                />
                <div className="text-xs text-[var(--muted-foreground)] text-center">
                  Neutral
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">
                  Breath
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  defaultValue="30"
                  className="w-full mt-1"
                />
                <div className="text-xs text-[var(--muted-foreground)] text-center">
                  30%
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-[var(--muted-foreground)]">
                Text to Synthesize
              </label>
              <textarea
                className="w-full h-24 p-3 text-sm bg-[var(--secondary)] border border-[var(--border)] rounded resize-none"
                placeholder="Enter the text you want to convert to speech..."
                defaultValue="Welcome to the AI Production Suite. This is a demonstration of high-quality voice synthesis technology."
              />
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="flex items-center justify-between p-2 bg-[var(--secondary)] rounded">
                <span>Quality</span>
                <span className="font-mono text-[var(--green)]">Studio</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-[var(--secondary)] rounded">
                <span>Length</span>
                <span className="font-mono text-[var(--blue)]">0:14</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-[var(--secondary)] rounded">
                <span>Size</span>
                <span className="font-mono text-[var(--purple)]">2.1 MB</span>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button size="sm" variant="outline" className="flex-1">
                <Play className="w-3 h-3 mr-1" />
                Preview Voice
              </Button>
              <Button size="sm" className="flex-1">
                <Mic className="w-3 h-3 mr-1" />
                Generate Speech
              </Button>
            </div>
          </div>
        );

      case 'midi-composer':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">
                  Musical Style
                </label>
                <select className="w-full mt-1 p-2 text-sm bg-[var(--secondary)] border border-[var(--border)] rounded">
                  <option>Pop/Contemporary</option>
                  <option>Classical</option>
                  <option>Jazz</option>
                  <option>Electronic</option>
                  <option>Rock</option>
                  <option>Hip-Hop</option>
                  <option>Ambient</option>
                  <option>World Music</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">
                  Key Signature
                </label>
                <select className="w-full mt-1 p-2 text-sm bg-[var(--secondary)] border border-[var(--border)] rounded">
                  <option>C Major</option>
                  <option>G Major</option>
                  <option>D Major</option>
                  <option>A Major</option>
                  <option>E Major</option>
                  <option>B Major</option>
                  <option>F# Major</option>
                  <option>C# Major</option>
                  <option>F Major</option>
                  <option>Bb Major</option>
                  <option>Eb Major</option>
                  <option>Ab Major</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-3">
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">
                  BPM
                </label>
                <input
                  type="number"
                  min="60"
                  max="200"
                  defaultValue="120"
                  className="w-full mt-1 p-2 text-sm bg-[var(--secondary)] border border-[var(--border)] rounded"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">
                  Time Sig
                </label>
                <select className="w-full mt-1 p-2 text-sm bg-[var(--secondary)] border border-[var(--border)] rounded">
                  <option>4/4</option>
                  <option>3/4</option>
                  <option>6/8</option>
                  <option>2/4</option>
                  <option>7/8</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">
                  Length (bars)
                </label>
                <input
                  type="number"
                  min="4"
                  max="64"
                  defaultValue="16"
                  className="w-full mt-1 p-2 text-sm bg-[var(--secondary)] border border-[var(--border)] rounded"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">
                  Complexity
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  defaultValue="5"
                  className="w-full mt-1"
                />
                <div className="text-xs text-[var(--muted-foreground)] text-center">
                  5
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-xs font-medium text-[var(--muted-foreground)]">
                Instruments to Generate
              </div>
              <div className="grid grid-cols-3 gap-2">
                <label className="flex items-center space-x-2 text-xs">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span>Piano/Keys</span>
                </label>
                <label className="flex items-center space-x-2 text-xs">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span>Bass</span>
                </label>
                <label className="flex items-center space-x-2 text-xs">
                  <input type="checkbox" className="rounded" />
                  <span>Drums</span>
                </label>
                <label className="flex items-center space-x-2 text-xs">
                  <input type="checkbox" className="rounded" />
                  <span>Strings</span>
                </label>
                <label className="flex items-center space-x-2 text-xs">
                  <input type="checkbox" className="rounded" />
                  <span>Guitar</span>
                </label>
                <label className="flex items-center space-x-2 text-xs">
                  <input type="checkbox" className="rounded" />
                  <span>Melody Lead</span>
                </label>
              </div>
            </div>
            <div className="bg-[var(--secondary)] p-3 rounded">
              <div className="text-xs font-medium mb-2">
                Generation Settings
              </div>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <div className="font-medium mb-1">Chord Progression</div>
                  <div className="text-[var(--muted-foreground)]">
                    Auto-generated
                  </div>
                </div>
                <div>
                  <div className="font-medium mb-1">Melody Style</div>
                  <div className="text-[var(--muted-foreground)]">Flowing</div>
                </div>
                <div>
                  <div className="font-medium mb-1">Rhythm Pattern</div>
                  <div className="text-[var(--muted-foreground)]">Moderate</div>
                </div>
                <div>
                  <div className="font-medium mb-1">Harmonic Richness</div>
                  <div className="text-[var(--muted-foreground)]">Balanced</div>
                </div>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button size="sm" variant="outline" className="flex-1">
                <Play className="w-3 h-3 mr-1" />
                Preview MIDI
              </Button>
              <Button size="sm" className="flex-1">
                <Music2 className="w-3 h-3 mr-1" />
                Generate Composition
              </Button>
            </div>
          </div>
        );

      case 'phase-correlation':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">
                  Analysis Mode
                </label>
                <select className="w-full mt-1 p-2 text-sm bg-[var(--secondary)] border border-[var(--border)] rounded">
                  <option>Real-time Monitoring</option>
                  <option>Full Track Analysis</option>
                  <option>Critical Sections Only</option>
                  <option>Frequency-specific</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">
                  Display Style
                </label>
                <select className="w-full mt-1 p-2 text-sm bg-[var(--secondary)] border border-[var(--border)] rounded">
                  <option>Goniometer</option>
                  <option>Correlation Meter</option>
                  <option>Phase Scope</option>
                  <option>Combined View</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="p-3 bg-[var(--secondary)] rounded">
                <div className="text-xs text-[var(--muted-foreground)]">
                  Correlation
                </div>
                <div className="text-lg font-mono text-[var(--green)]">
                  +0.85
                </div>
                <div className="text-xs text-[var(--green)]">Good</div>
              </div>
              <div className="p-3 bg-[var(--secondary)] rounded">
                <div className="text-xs text-[var(--muted-foreground)]">
                  Phase Shift
                </div>
                <div className="text-lg font-mono text-[var(--blue)]">12°</div>
                <div className="text-xs text-[var(--blue)]">Normal</div>
              </div>
              <div className="p-3 bg-[var(--secondary)] rounded">
                <div className="text-xs text-[var(--muted-foreground)]">
                  Mono Compat
                </div>
                <div className="text-lg font-mono text-[var(--green)]">96%</div>
                <div className="text-xs text-[var(--green)]">Excellent</div>
              </div>
              <div className="p-3 bg-[var(--secondary)] rounded">
                <div className="text-xs text-[var(--muted-foreground)]">
                  Width
                </div>
                <div className="text-lg font-mono text-[var(--purple)]">
                  115%
                </div>
                <div className="text-xs text-[var(--purple)]">Enhanced</div>
              </div>
            </div>
            <div className="h-32 bg-[var(--muted)] rounded p-3 relative">
              <div className="text-xs font-medium text-[var(--muted-foreground)] mb-2">
                Phase Correlation Goniometer
              </div>
              <div className="h-24 relative border border-[var(--border)] rounded">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke="var(--border)"
                    strokeWidth="1"
                    fill="none"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="30"
                    stroke="var(--border)"
                    strokeWidth="0.5"
                    fill="none"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="15"
                    stroke="var(--border)"
                    strokeWidth="0.5"
                    fill="none"
                  />
                  <line
                    x1="5"
                    y1="50"
                    x2="95"
                    y2="50"
                    stroke="var(--border)"
                    strokeWidth="0.5"
                  />
                  <line
                    x1="50"
                    y1="5"
                    x2="50"
                    y2="95"
                    stroke="var(--border)"
                    strokeWidth="0.5"
                  />
                  <ellipse
                    cx="50"
                    cy="50"
                    rx="25"
                    ry="15"
                    stroke="var(--green)"
                    strokeWidth="2"
                    fill="none"
                    opacity="0.7"
                  >
                    <animateTransform
                      attributeName="transform"
                      type="rotate"
                      values="0 50 50;360 50 50"
                      dur="8s"
                      repeatCount="indefinite"
                    />
                  </ellipse>
                  <circle cx="50" cy="50" r="2" fill="var(--blue)">
                    <animate
                      attributeName="r"
                      values="2;4;2"
                      dur="2s"
                      repeatCount="indefinite"
                    />
                  </circle>
                </svg>
                <div className="absolute top-1 left-1 text-xs text-[var(--muted-foreground)]">
                  +1
                </div>
                <div className="absolute bottom-1 left-1 text-xs text-[var(--muted-foreground)]">
                  -1
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-xs font-medium text-[var(--muted-foreground)]">
                Frequency Band Analysis
              </div>
              <div className="space-y-1">
                {[
                  'Low (20-250 Hz)',
                  'Low-Mid (250-500 Hz)',
                  'Mid (500-2k Hz)',
                  'High-Mid (2k-8k Hz)',
                  'High (8k-20k Hz)',
                ].map((band, i) => (
                  <div
                    key={band}
                    className="flex items-center justify-between text-xs"
                  >
                    <span>{band}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 h-1 bg-[var(--muted)] rounded-full">
                        <div
                          className="h-full bg-[var(--green)] rounded-full"
                          style={{ width: `${[85, 92, 88, 75, 68][i]}%` }}
                        ></div>
                      </div>
                      <span className="font-mono w-8">
                        {['+0.85', '+0.92', '+0.88', '+0.75', '+0.68'][i]}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'dynamic-range':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">
                  Measurement Standard
                </label>
                <select className="w-full mt-1 p-2 text-sm bg-[var(--secondary)] border border-[var(--border)] rounded">
                  <option>PLR (Peak to Loudness)</option>
                  <option>LRA (Loudness Range)</option>
                  <option>Crest Factor</option>
                  <option>RMS to Peak</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">
                  Time Window
                </label>
                <select className="w-full mt-1 p-2 text-sm bg-[var(--secondary)] border border-[var(--border)] rounded">
                  <option>Integrated</option>
                  <option>Short-term (3s)</option>
                  <option>Momentary (400ms)</option>
                  <option>Instantaneous</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">
                  Target Genre
                </label>
                <select className="w-full mt-1 p-2 text-sm bg-[var(--secondary)] border border-[var(--border)] rounded">
                  <option>Classical (High DR)</option>
                  <option>Jazz (Medium-High DR)</option>
                  <option>Rock (Medium DR)</option>
                  <option>Pop (Low-Medium DR)</option>
                  <option>Electronic (Low DR)</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="p-3 bg-[var(--secondary)] rounded">
                <div className="text-xs text-[var(--muted-foreground)]">
                  Current DR
                </div>
                <div className="text-2xl font-mono text-[var(--blue)]">8.3</div>
                <div className="text-xs text-[var(--blue)]">LU</div>
              </div>
              <div className="p-3 bg-[var(--secondary)] rounded">
                <div className="text-xs text-[var(--muted-foreground)]">
                  Peak Level
                </div>
                <div className="text-2xl font-mono text-[var(--green)]">
                  -1.2
                </div>
                <div className="text-xs text-[var(--green)]">dBFS</div>
              </div>
              <div className="p-3 bg-[var(--secondary)] rounded">
                <div className="text-xs text-[var(--muted-foreground)]">
                  RMS Level
                </div>
                <div className="text-2xl font-mono text-[var(--yellow)]">
                  -18.5
                </div>
                <div className="text-xs text-[var(--yellow)]">dBFS</div>
              </div>
              <div className="p-3 bg-[var(--secondary)] rounded">
                <div className="text-xs text-[var(--muted-foreground)]">
                  Crest Factor
                </div>
                <div className="text-2xl font-mono text-[var(--purple)]">
                  17.3
                </div>
                <div className="text-xs text-[var(--purple)]">dB</div>
              </div>
            </div>
            <div className="h-24 bg-[var(--muted)] rounded p-3 relative">
              <div className="text-xs font-medium text-[var(--muted-foreground)] mb-2">
                Dynamic Range History
              </div>
              <div className="h-16 relative border-l border-b border-[var(--border)]">
                <svg className="w-full h-full" viewBox="0 0 240 64">
                  <path
                    d="M0,50 L20,45 L40,35 L60,40 L80,30 L100,38 L120,25 L140,35 L160,28 L180,32 L200,26 L220,30 L240,35"
                    stroke="var(--blue)"
                    strokeWidth="2"
                    fill="none"
                    opacity="0.8"
                  />
                  <path
                    d="M0,55 L240,55"
                    stroke="var(--red)"
                    strokeWidth="1"
                    strokeDasharray="5,5"
                    opacity="0.5"
                  />
                  <circle cx="220" cy="30" r="2" fill="var(--yellow)">
                    <animate
                      attributeName="opacity"
                      values="0.5;1;0.5"
                      dur="1.5s"
                      repeatCount="indefinite"
                    />
                  </circle>
                </svg>
                <div className="absolute bottom-0 left-0 text-xs text-[var(--muted-foreground)]">
                  -5m
                </div>
                <div className="absolute bottom-0 right-0 text-xs text-[var(--muted-foreground)]">
                  Now
                </div>
                <div className="absolute top-0 left-0 text-xs text-[var(--muted-foreground)]">
                  20 LU
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-xs font-medium text-[var(--muted-foreground)]">
                Genre Comparison
              </div>
              <div className="space-y-1">
                {[
                  {
                    genre: 'Classical',
                    target: '15-20 LU',
                    current: 8.3,
                    status: 'Low',
                  },
                  {
                    genre: 'Jazz',
                    target: '10-15 LU',
                    current: 8.3,
                    status: 'Low',
                  },
                  {
                    genre: 'Rock',
                    target: '6-10 LU',
                    current: 8.3,
                    status: 'Good',
                  },
                  {
                    genre: 'Pop',
                    target: '4-8 LU',
                    current: 8.3,
                    status: 'Good',
                  },
                  {
                    genre: 'Electronic',
                    target: '3-6 LU',
                    current: 8.3,
                    status: 'High',
                  },
                ].map((item) => (
                  <div
                    key={item.genre}
                    className="flex items-center justify-between text-xs p-2 bg-[var(--secondary)] rounded"
                  >
                    <span className="font-medium">{item.genre}</span>
                    <span className="text-[var(--muted-foreground)]">
                      {item.target}
                    </span>
                    <span
                      className={`font-mono ${
                        item.status === 'Good'
                          ? 'text-[var(--green)]'
                          : item.status === 'Low'
                            ? 'text-[var(--red)]'
                            : 'text-[var(--yellow)]'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'variation-creator':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">
                  Variation Type
                </label>
                <select className="w-full mt-1 p-2 text-sm bg-[var(--secondary)] border border-[var(--border)] rounded">
                  <option>Melodic Variations</option>
                  <option>Harmonic Changes</option>
                  <option>Rhythmic Patterns</option>
                  <option>Arrangement Ideas</option>
                  <option>Genre Adaptations</option>
                  <option>Complete Remixes</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">
                  Creativity Level
                </label>
                <select className="w-full mt-1 p-2 text-sm bg-[var(--secondary)] border border-[var(--border)] rounded">
                  <option>Conservative (Stay close)</option>
                  <option>Moderate (Some changes)</option>
                  <option>Creative (More freedom)</option>
                  <option>Experimental (Bold changes)</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">
                  Tempo Variation
                </label>
                <input
                  type="range"
                  min="0"
                  max="50"
                  defaultValue="10"
                  className="w-full mt-1"
                />
                <div className="text-xs text-[var(--muted-foreground)] text-center">
                  ±10%
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">
                  Key Changes
                </label>
                <input
                  type="range"
                  min="0"
                  max="12"
                  defaultValue="2"
                  className="w-full mt-1"
                />
                <div className="text-xs text-[var(--muted-foreground)] text-center">
                  ±2 ST
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">
                  Arrangement
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  defaultValue="30"
                  className="w-full mt-1"
                />
                <div className="text-xs text-[var(--muted-foreground)] text-center">
                  30%
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-xs font-medium text-[var(--muted-foreground)]">
                Variation Elements
              </div>
              <div className="grid grid-cols-2 gap-2">
                <label className="flex items-center space-x-2 text-xs">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span>Chord Progressions</span>
                </label>
                <label className="flex items-center space-x-2 text-xs">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span>Melodic Phrases</span>
                </label>
                <label className="flex items-center space-x-2 text-xs">
                  <input type="checkbox" className="rounded" />
                  <span>Drum Patterns</span>
                </label>
                <label className="flex items-center space-x-2 text-xs">
                  <input type="checkbox" className="rounded" />
                  <span>Bass Lines</span>
                </label>
                <label className="flex items-center space-x-2 text-xs">
                  <input type="checkbox" className="rounded" />
                  <span>Sound Effects</span>
                </label>
                <label className="flex items-center space-x-2 text-xs">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span>Song Structure</span>
                </label>
              </div>
            </div>
            <div className="bg-[var(--secondary)] p-3 rounded">
              <div className="text-xs font-medium mb-2">
                Generated Variations
              </div>
              <div className="space-y-2">
                {[
                  {
                    name: 'Acoustic Version',
                    changes: 'Instrumentation, Tempo -15%',
                    rating: 4.5,
                  },
                  {
                    name: 'Jazz Interpretation',
                    changes: 'Harmony, Swing Feel',
                    rating: 4.2,
                  },
                  {
                    name: 'Electronic Remix',
                    changes: 'Full Arrangement, +2 ST',
                    rating: 3.8,
                  },
                  {
                    name: 'Minimal Version',
                    changes: 'Stripped Down, -30% Elements',
                    rating: 4.0,
                  },
                ].map((variation, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2 bg-[var(--background)] rounded text-xs"
                  >
                    <div>
                      <div className="font-medium">{variation.name}</div>
                      <div className="text-[var(--muted-foreground)]">
                        {variation.changes}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex">
                        {[...Array(5)].map((_, star) => (
                          <span
                            key={star}
                            className={
                              star < Math.floor(variation.rating)
                                ? 'text-[var(--yellow)]'
                                : 'text-[var(--muted)]'
                            }
                          >
                            ★
                          </span>
                        ))}
                      </div>
                      <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                        <Play className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'video-sync':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">
                  Sync Method
                </label>
                <select className="w-full mt-1 p-2 text-sm bg-[var(--secondary)] border border-[var(--border)] rounded">
                  <option>Automatic Detection</option>
                  <option>Waveform Matching</option>
                  <option>Timecode Sync</option>
                  <option>Clap/Slate Detection</option>
                  <option>Manual Alignment</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">
                  Precision Level
                </label>
                <select className="w-full mt-1 p-2 text-sm bg-[var(--secondary)] border border-[var(--border)] rounded">
                  <option>Sample Accurate</option>
                  <option>Frame Accurate</option>
                  <option>Millisecond Accurate</option>
                  <option>Quick Sync</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">
                  Video Frame Rate
                </label>
                <select className="w-full mt-1 p-2 text-sm bg-[var(--secondary)] border border-[var(--border)] rounded">
                  <option>23.976 fps</option>
                  <option>24 fps</option>
                  <option>25 fps (PAL)</option>
                  <option>29.97 fps (NTSC)</option>
                  <option>30 fps</option>
                  <option>60 fps</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">
                  Audio Offset (ms)
                </label>
                <input
                  type="number"
                  min="-5000"
                  max="5000"
                  defaultValue="0"
                  className="w-full mt-1 p-2 text-sm bg-[var(--secondary)] border border-[var(--border)] rounded"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">
                  Drift Correction
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  defaultValue="50"
                  className="w-full mt-1"
                />
                <div className="text-xs text-[var(--muted-foreground)] text-center">
                  Auto
                </div>
              </div>
            </div>
            <div className="bg-[var(--secondary)] p-3 rounded">
              <div className="text-xs font-medium mb-2">Sync Analysis</div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>Detected offset:</span>
                  <span className="font-mono">+125.3 ms</span>
                </div>
                <div className="flex justify-between">
                  <span>Confidence level:</span>
                  <span className="font-mono text-[var(--green)]">94.7%</span>
                </div>
                <div className="flex justify-between">
                  <span>Drift detected:</span>
                  <span className="font-mono">-0.02%</span>
                </div>
                <div className="flex justify-between">
                  <span>Sync points found:</span>
                  <span className="font-mono">12 markers</span>
                </div>
              </div>
            </div>
            <div className="h-20 bg-[var(--muted)] rounded flex items-center justify-center">
              <div className="text-xs text-[var(--muted-foreground)]">
                Waveform Correlation Display
              </div>
            </div>
          </div>
        );

      case 'auto-edit':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">
                  Edit Type
                </label>
                <select className="w-full mt-1 p-2 text-sm bg-[var(--secondary)] border border-[var(--border)] rounded">
                  <option>Podcast Cleanup</option>
                  <option>Music Arrangement</option>
                  <option>Interview Edit</option>
                  <option>Dialogue Edit</option>
                  <option>Custom Workflow</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">
                  Aggressiveness
                </label>
                <select className="w-full mt-1 p-2 text-sm bg-[var(--secondary)] border border-[var(--border)] rounded">
                  <option>Conservative</option>
                  <option>Balanced</option>
                  <option>Aggressive</option>
                  <option>Maximum</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-xs font-medium text-[var(--muted-foreground)]">
                Auto-Edit Features
              </div>
              <div className="grid grid-cols-2 gap-2">
                <label className="flex items-center space-x-2 text-xs">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span>Remove Silence</span>
                </label>
                <label className="flex items-center space-x-2 text-xs">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span>Noise Reduction</span>
                </label>
                <label className="flex items-center space-x-2 text-xs">
                  <input type="checkbox" className="rounded" />
                  <span>Normalize Levels</span>
                </label>
                <label className="flex items-center space-x-2 text-xs">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span>Remove Filler Words</span>
                </label>
                <label className="flex items-center space-x-2 text-xs">
                  <input type="checkbox" className="rounded" />
                  <span>Auto-Crossfades</span>
                </label>
                <label className="flex items-center space-x-2 text-xs">
                  <input type="checkbox" className="rounded" />
                  <span>Clip Boundaries</span>
                </label>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">
                  Silence Threshold
                </label>
                <input
                  type="range"
                  min="-60"
                  max="-20"
                  defaultValue="-45"
                  className="w-full mt-1"
                />
                <div className="text-xs text-[var(--muted-foreground)] text-center">
                  -45 dB
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">
                  Min Silence (ms)
                </label>
                <input
                  type="number"
                  min="100"
                  max="5000"
                  defaultValue="500"
                  className="w-full mt-1 p-2 text-sm bg-[var(--secondary)] border border-[var(--border)] rounded"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">
                  Fade Duration (ms)
                </label>
                <input
                  type="number"
                  min="10"
                  max="1000"
                  defaultValue="50"
                  className="w-full mt-1 p-2 text-sm bg-[var(--secondary)] border border-[var(--border)] rounded"
                />
              </div>
            </div>
            <div className="bg-[var(--secondary)] p-3 rounded">
              <div className="text-xs font-medium mb-2">Processing Preview</div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>Detected silences:</span>
                  <span className="font-mono">23 segments</span>
                </div>
                <div className="flex justify-between">
                  <span>Time reduction:</span>
                  <span className="font-mono text-[var(--green)]">
                    -2:34 (12%)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Filler words found:</span>
                  <span className="font-mono">7 instances</span>
                </div>
                <div className="flex justify-between">
                  <span>Noise segments:</span>
                  <span className="font-mono">4 regions</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'format-converter':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">
                  Output Format
                </label>
                <select className="w-full mt-1 p-2 text-sm bg-[var(--secondary)] border border-[var(--border)] rounded">
                  <option>WAV (Uncompressed)</option>
                  <option>FLAC (Lossless)</option>
                  <option>MP3 (320 kbps)</option>
                  <option>AAC (256 kbps)</option>
                  <option>OGG Vorbis</option>
                  <option>AIFF</option>
                  <option>DSD</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">
                  Sample Rate
                </label>
                <select className="w-full mt-1 p-2 text-sm bg-[var(--secondary)] border border-[var(--border)] rounded">
                  <option>44.1 kHz (CD Quality)</option>
                  <option>48 kHz (Professional)</option>
                  <option>88.2 kHz (High-Res)</option>
                  <option>96 kHz (Studio)</option>
                  <option>176.4 kHz</option>
                  <option>192 kHz (Mastering)</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">
                  Bit Depth
                </label>
                <select className="w-full mt-1 p-2 text-sm bg-[var(--secondary)] border border-[var(--border)] rounded">
                  <option>16-bit (CD)</option>
                  <option>24-bit (Professional)</option>
                  <option>32-bit Float</option>
                  <option>32-bit Integer</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">
                  Dithering
                </label>
                <select className="w-full mt-1 p-2 text-sm bg-[var(--secondary)] border border-[var(--border)] rounded">
                  <option>None</option>
                  <option>Triangular PDF</option>
                  <option>TPDF + Noise Shaping</option>
                  <option>Advanced</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)]">
                  Quality
                </label>
                <select className="w-full mt-1 p-2 text-sm bg-[var(--secondary)] border border-[var(--border)] rounded">
                  <option>Maximum</option>
                  <option>High</option>
                  <option>Good</option>
                  <option>Fast</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-xs font-medium text-[var(--muted-foreground)]">
                Processing Options
              </div>
              <div className="grid grid-cols-2 gap-2">
                <label className="flex items-center space-x-2 text-xs">
                  <input type="checkbox" className="rounded" />
                  <span>Normalize to -0.1 dBFS</span>
                </label>
                <label className="flex items-center space-x-2 text-xs">
                  <input type="checkbox" className="rounded" />
                  <span>DC Offset Removal</span>
                </label>
                <label className="flex items-center space-x-2 text-xs">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span>Preserve Metadata</span>
                </label>
                <label className="flex items-center space-x-2 text-xs">
                  <input type="checkbox" className="rounded" />
                  <span>Add Fade In/Out</span>
                </label>
              </div>
            </div>
            <div className="bg-[var(--secondary)] p-3 rounded">
              <div className="text-xs font-medium mb-2">Conversion Preview</div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>Input:</span>
                  <span className="font-mono">48kHz/24-bit WAV</span>
                </div>
                <div className="flex justify-between">
                  <span>Output:</span>
                  <span className="font-mono">44.1kHz/16-bit WAV</span>
                </div>
                <div className="flex justify-between">
                  <span>Size reduction:</span>
                  <span className="font-mono text-[var(--green)]">~33%</span>
                </div>
                <div className="flex justify-between">
                  <span>Est. time:</span>
                  <span className="font-mono">0:45</span>
                </div>
              </div>
            </div>
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
              <p className="text-xs text-[var(--muted-foreground)] mb-4">
                {tool.description}
              </p>
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
      <div className="bg-[var(--background)] border border-[var(--border)] rounded-xl shadow-2xl w-[1000px] max-w-[95vw] max-h-[80vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-[var(--border)] bg-[var(--muted)] rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-[var(--primary)] rounded-lg flex items-center justify-center">
                <Zap className="h-4 w-4 text-[var(--primary-foreground)]" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[var(--foreground)]">
                  AI Production Suite
                </h3>
                <p className="text-xs text-[var(--muted-foreground)]">
                  Advanced AI tools for audio production
                </p>
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
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Tool List */}
            <div className="flex-1 overflow-y-auto p-2">
              <div className="space-y-1">
                {Object.entries(
                  filteredTools.reduce(
                    (groups, tool) => {
                      if (!groups[tool.category]) groups[tool.category] = [];
                      groups[tool.category].push(tool);
                      return groups;
                    },
                    {} as Record<string, typeof filteredTools>
                  )
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
                          selectedTool === tool.id
                            ? 'bg-[var(--accent)] border border-[var(--primary)]'
                            : ''
                        }`}
                      >
                        <div style={{ color: tool.color }}>{tool.icon}</div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-[var(--foreground)] truncate">
                            {tool.name}
                          </div>
                          <div className="text-[var(--muted-foreground)] truncate">
                            {tool.description}
                          </div>
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
                  style={{
                    backgroundColor: `${currentTool.color}20`,
                    color: currentTool.color,
                  }}
                >
                  {currentTool.icon}
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-[var(--foreground)]">
                    {currentTool.name}
                  </h4>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    {currentTool.description}
                  </p>
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
                  <span className="text-xs text-[var(--muted-foreground)]">
                    AI Engine Ready
                  </span>
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
