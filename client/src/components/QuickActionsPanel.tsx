import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Wand2, 
  Sparkles, 
  Mic, 
  Headphones, 
  Radio, 
  TrendingUp, 
  Scissors, 
  Copy, 
  RotateCcw, 
  Volume, 
  VolumeX,
  Music,
  Sliders,
  Zap,
  Play,
  Square,
  Download,
  Filter,
  Heart,
  Star,
  Layers,
  Clock,
  Gauge,
  Palette,
  Wind,
  Blend,
  Target,
  Waves,
  Flame,
  Snowflake,
  Mountain,
  Sun,
  Moon,
  Bolt,
  Shield,
  Gem,
  Crown,
  Rocket,
  Puzzle,
  Shuffle,
  Archive,
  GitBranch,
  Package
} from 'lucide-react';

interface MacroAction {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  shortcut?: string;
  category: 'mixing' | 'ai' | 'editing' | 'effects' | 'workflow';
}

export function QuickActionsPanel() {
  const [selectedCategory, setSelectedCategory] = useState<string>('mixing');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const macroActions: MacroAction[] = [
    // Mixing Macros
    {
      id: 'normalize-levels',
      name: 'Level Balancer',
      description: 'Auto-balance volume levels across selected tracks',
      icon: <Gauge className="w-4 h-4" />,
      shortcut: 'Cmd+Shift+N',
      category: 'mixing'
    },
    {
      id: 'auto-pan',
      name: 'Stereo Magic',
      description: 'Intelligently pan tracks for optimal stereo image',
      icon: <Target className="w-4 h-4" />,
      shortcut: 'Cmd+Shift+P',
      category: 'mixing'
    },
    {
      id: 'ducking',
      name: 'Pump & Duck',
      description: 'Apply ducking compression to selected tracks',
      icon: <Waves className="w-4 h-4" />,
      category: 'mixing'
    },
    {
      id: 'vocal-enhance',
      name: 'Vocal Sparkle',
      description: 'Apply vocal clarity and presence enhancement',
      icon: <Crown className="w-4 h-4" />,
      category: 'mixing'
    },

    // AI Macros
    {
      id: 'ai-master',
      name: 'AI Master Chef',
      description: 'Intelligent mastering chain for professional sound',
      icon: <Gem className="w-4 h-4" />,
      shortcut: 'Cmd+Shift+M',
      category: 'ai'
    },
    {
      id: 'ai-stem-separate',
      name: 'Stem Surgeon',
      description: 'AI-powered vocal and instrument separation',
      icon: <Puzzle className="w-4 h-4" />,
      category: 'ai'
    },
    {
      id: 'ai-noise-reduce',
      name: 'Noise Ninja',
      description: 'Remove background noise using AI analysis',
      icon: <Shield className="w-4 h-4" />,
      category: 'ai'
    },
    {
      id: 'ai-pitch-correct',
      name: 'Pitch Perfect',
      description: 'Automatic pitch correction and tuning',
      icon: <Bolt className="w-4 h-4" />,
      category: 'ai'
    },

    // Editing Macros
    {
      id: 'auto-crossfade',
      name: 'Smooth Operator',
      description: 'Add smooth crossfades between selected clips',
      icon: <Blend className="w-4 h-4" />,
      shortcut: 'Cmd+X',
      category: 'editing'
    },
    {
      id: 'duplicate-pattern',
      name: 'Copy Cat',
      description: 'Duplicate selected clips with spacing',
      icon: <GitBranch className="w-4 h-4" />,
      shortcut: 'Cmd+D',
      category: 'editing'
    },
    {
      id: 'quantize-timing',
      name: 'Time Keeper',
      description: 'Snap selected audio to grid timing',
      icon: <Clock className="w-4 h-4" />,
      shortcut: 'Cmd+Q',
      category: 'editing'
    },
    {
      id: 'reverse-audio',
      name: 'Backwards Magic',
      description: 'Reverse selected audio clips',
      icon: <Shuffle className="w-4 h-4" />,
      category: 'editing'
    },

    // Effects Macros
    {
      id: 'vintage-warmth',
      name: 'Golden Age',
      description: 'Add analog tape saturation and warmth',
      icon: <Sun className="w-4 h-4" />,
      category: 'effects'
    },
    {
      id: 'space-verb',
      name: 'Hall of Fame',
      description: 'Add dimensional reverb to selected tracks',
      icon: <Mountain className="w-4 h-4" />,
      category: 'effects'
    },
    {
      id: 'lo-fi-texture',
      name: 'Retro Vibe',
      description: 'Apply lo-fi character and texture',
      icon: <Moon className="w-4 h-4" />,
      category: 'effects'
    },
    {
      id: 'stereo-widener',
      name: 'Wide & Wild',
      description: 'Enhance stereo width and presence',
      icon: <Wind className="w-4 h-4" />,
      category: 'effects'
    },
    {
      id: 'frost-effect',
      name: 'Frosty Touch',
      description: 'Add crystalline high-frequency shimmer',
      icon: <Snowflake className="w-4 h-4" />,
      category: 'effects'
    },
    {
      id: 'fire-drive',
      name: 'Fire Drive',
      description: 'Add aggressive harmonic distortion',
      icon: <Flame className="w-4 h-4" />,
      category: 'effects'
    },

    // Workflow Macros
    {
      id: 'bounce-stems',
      name: 'Export Express',
      description: 'Export individual track stems',
      icon: <Rocket className="w-4 h-4" />,
      shortcut: 'Cmd+E',
      category: 'workflow'
    },
    {
      id: 'create-bus',
      name: 'Bus Builder',
      description: 'Route selected tracks to new bus',
      icon: <Package className="w-4 h-4" />,
      category: 'workflow'
    },
    {
      id: 'quick-comp',
      name: 'Comp Wizard',
      description: 'Create comp track from selected takes',
      icon: <Wand2 className="w-4 h-4" />,
      category: 'workflow'
    },
    {
      id: 'backup-project',
      name: 'Time Machine',
      description: 'Create timestamped project backup',
      icon: <Archive className="w-4 h-4" />,
      category: 'workflow'
    }
  ];

  const categories = [
    { id: 'mixing', name: 'Mixing', icon: <Gauge className="w-5 h-5" /> },
    { id: 'ai', name: 'AI Tools', icon: <Sparkles className="w-5 h-5" /> },
    { id: 'editing', name: 'Editing', icon: <Scissors className="w-5 h-5" /> },
    { id: 'effects', name: 'Effects', icon: <Wand2 className="w-5 h-5" /> },
    { id: 'workflow', name: 'Workflow', icon: <Zap className="w-5 h-5" /> }
  ];

  const filteredActions = macroActions.filter(action => action.category === selectedCategory);

  const handleActionClick = (actionId: string) => {
    console.log(`Executing macro: ${actionId}`);
    // Here you would implement the actual macro functionality
  };

  return (
    <div className="h-full flex flex-col">
      {/* Category Navigation */}
      <div className="p-3 border-b border-[var(--border)] bg-gradient-to-br from-[var(--muted)]/20 via-[var(--background)] to-[var(--muted)]/10">
        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 mb-3">
          {categories.map((category) => {
            const categoryCount = macroActions.filter(a => a.category === category.id).length;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-full transition-all duration-300 transform hover:scale-105 ${
                  selectedCategory === category.id
                    ? 'bg-gradient-to-r from-[var(--primary)] to-[var(--primary)]/80 text-[var(--primary-foreground)] shadow-lg shadow-[var(--primary)]/25'
                    : 'bg-[var(--muted)]/40 border border-[var(--border)]/50 hover:bg-[var(--accent)]/60 hover:border-[var(--primary)]/30 text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                }`}
              >
                <div className={`transition-all duration-300 ${
                  selectedCategory === category.id ? 'text-[var(--primary-foreground)]' : ''
                }`}>
                  {category.icon}
                </div>
                <span className="text-xs font-medium">{category.name}</span>
                <div className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${
                  selectedCategory === category.id
                    ? 'bg-[var(--primary-foreground)]/20 text-[var(--primary-foreground)]'
                    : 'bg-[var(--muted)] text-[var(--muted-foreground)]'
                }`}>
                  {categoryCount}
                </div>
              </button>
            );
          })}
        </div>
        
        {/* Active Category Header */}
        <div className="flex items-center justify-between p-2 rounded-lg bg-gradient-to-r from-[var(--primary)]/10 to-[var(--primary)]/5 border border-[var(--primary)]/20">
          <div className="flex items-center space-x-2">
            <div className="p-1 rounded-md bg-[var(--primary)]/20">
              <div className="text-[var(--primary)]">
                {categories.find(c => c.id === selectedCategory)?.icon}
              </div>
            </div>
            <div>
              <span className="text-sm font-bold text-[var(--foreground)]">
                {categories.find(c => c.id === selectedCategory)?.name}
              </span>
              <p className="text-xs text-[var(--muted-foreground)]">
                {selectedCategory === 'mixing' && 'Balance and enhance your mix'}
                {selectedCategory === 'ai' && 'AI-powered audio processing'}
                {selectedCategory === 'editing' && 'Precision audio editing tools'}
                {selectedCategory === 'effects' && 'Creative audio effects'}
                {selectedCategory === 'workflow' && 'Streamline your workflow'}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-[var(--primary)]">
              {filteredActions.length}
            </div>
            <div className="text-xs text-[var(--muted-foreground)]">
              {filteredActions.length === 1 ? 'action' : 'actions'}
            </div>
          </div>
        </div>
      </div>

      {/* Selection Info */}
      <div className="px-3 py-2 text-xs text-[var(--muted-foreground)] bg-[var(--muted)]/20 border-b border-[var(--border)]">
        {selectedItems.length > 0 ? (
          `${selectedItems.length} items selected`
        ) : (
          'No items selected'
        )}
      </div>

      {/* Actions List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="p-2 space-y-2">
          {filteredActions.map((action, index) => (
            <div
              key={action.id}
              className="group relative"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <Button
                variant="ghost"
                onClick={() => handleActionClick(action.id)}
                disabled={selectedItems.length === 0 && !['ai-master', 'backup-project'].includes(action.id)}
                className="w-full h-auto p-3 text-left justify-start disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gradient-to-r hover:from-[var(--accent)] hover:to-[var(--accent)]/50 transition-all duration-300 hover:shadow-md rounded-lg border border-transparent hover:border-[var(--border)] group-hover:scale-[1.02] transform"
              >
                <div className="flex items-start space-x-3 w-full">
                  <div className="text-[var(--muted-foreground)] group-hover:text-[var(--primary)] transition-all duration-300 group-hover:scale-110 transform">
                    {action.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors">
                        {action.name}
                      </span>
                      {action.shortcut && (
                        <span className="text-xs text-[var(--muted-foreground)] font-mono bg-[var(--muted)]/30 px-1.5 py-0.5 rounded group-hover:bg-[var(--primary)]/10 transition-colors">
                          {action.shortcut}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[var(--muted-foreground)] mt-1 leading-relaxed group-hover:text-[var(--foreground)]/80 transition-colors">
                      {action.description}
                    </p>
                  </div>
                </div>
                
                {/* Subtle glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-[var(--primary)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg pointer-events-none"></div>
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Execute Bar */}
      <div className="border-t border-[var(--border)] p-3 bg-gradient-to-r from-[var(--muted)]/30 to-[var(--muted)]/10 backdrop-blur-sm">
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="ghost"
            className="flex-1 text-xs font-medium bg-gradient-to-r from-[var(--primary)]/10 to-[var(--primary)]/5 hover:from-[var(--primary)]/20 hover:to-[var(--primary)]/10 border border-[var(--primary)]/20 hover:border-[var(--primary)]/40 transition-all duration-300 hover:shadow-lg disabled:opacity-40"
            disabled={selectedItems.length === 0}
          >
            <Rocket className="w-3 h-3 mr-1.5" />
            Execute Magic
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-xs px-3 hover:bg-[var(--accent)] transition-colors"
            onClick={() => setSelectedItems([])}
          >
            <Square className="w-3 h-3 mr-1" />
            Reset
          </Button>
        </div>
        
        {/* Fun status indicator */}
        <div className="mt-2 flex items-center justify-center space-x-2">
          <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
            selectedItems.length > 0 
              ? 'bg-[var(--green)] shadow-lg shadow-[var(--green)]/50' 
              : 'bg-[var(--muted-foreground)]'
          }`}></div>
          <span className="text-xs text-[var(--muted-foreground)] font-medium">
            {selectedItems.length > 0 ? 'Ready to rock!' : 'Select items to begin'}
          </span>
        </div>
      </div>
    </div>
  );
}