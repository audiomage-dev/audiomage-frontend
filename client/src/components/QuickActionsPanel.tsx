import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Wand2, 
  Sparkles, 
  Mic, 
  Headphones, 
  Sliders, 
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
  Clock
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
      name: 'Normalize Levels',
      description: 'Auto-balance volume levels across selected tracks',
      icon: <Sliders className="w-4 h-4" />,
      shortcut: 'Cmd+Shift+N',
      category: 'mixing'
    },
    {
      id: 'auto-pan',
      name: 'Auto Pan',
      description: 'Intelligently pan tracks for optimal stereo image',
      icon: <Radio className="w-4 h-4" />,
      shortcut: 'Cmd+Shift+P',
      category: 'mixing'
    },
    {
      id: 'ducking',
      name: 'Sidechain Ducking',
      description: 'Apply ducking compression to selected tracks',
      icon: <Volume className="w-4 h-4" />,
      category: 'mixing'
    },
    {
      id: 'vocal-enhance',
      name: 'Vocal Enhancement',
      description: 'Apply vocal clarity and presence enhancement',
      icon: <Mic className="w-4 h-4" />,
      category: 'mixing'
    },

    // AI Macros
    {
      id: 'ai-master',
      name: 'AI Mastering',
      description: 'Intelligent mastering chain for professional sound',
      icon: <Sparkles className="w-4 h-4" />,
      shortcut: 'Cmd+Shift+M',
      category: 'ai'
    },
    {
      id: 'ai-stem-separate',
      name: 'Stem Separation',
      description: 'AI-powered vocal and instrument separation',
      icon: <Layers className="w-4 h-4" />,
      category: 'ai'
    },
    {
      id: 'ai-noise-reduce',
      name: 'Noise Reduction',
      description: 'Remove background noise using AI analysis',
      icon: <Filter className="w-4 h-4" />,
      category: 'ai'
    },
    {
      id: 'ai-pitch-correct',
      name: 'Pitch Correction',
      description: 'Automatic pitch correction and tuning',
      icon: <TrendingUp className="w-4 h-4" />,
      category: 'ai'
    },

    // Editing Macros
    {
      id: 'auto-crossfade',
      name: 'Auto Crossfade',
      description: 'Add smooth crossfades between selected clips',
      icon: <Scissors className="w-4 h-4" />,
      shortcut: 'Cmd+X',
      category: 'editing'
    },
    {
      id: 'duplicate-pattern',
      name: 'Duplicate Pattern',
      description: 'Duplicate selected clips with spacing',
      icon: <Copy className="w-4 h-4" />,
      shortcut: 'Cmd+D',
      category: 'editing'
    },
    {
      id: 'quantize-timing',
      name: 'Quantize Timing',
      description: 'Snap selected audio to grid timing',
      icon: <Clock className="w-4 h-4" />,
      shortcut: 'Cmd+Q',
      category: 'editing'
    },
    {
      id: 'reverse-audio',
      name: 'Reverse Audio',
      description: 'Reverse selected audio clips',
      icon: <RotateCcw className="w-4 h-4" />,
      category: 'editing'
    },

    // Effects Macros
    {
      id: 'vintage-warmth',
      name: 'Vintage Warmth',
      description: 'Add analog tape saturation and warmth',
      icon: <Heart className="w-4 h-4" />,
      category: 'effects'
    },
    {
      id: 'space-verb',
      name: 'Space Reverb',
      description: 'Add dimensional reverb to selected tracks',
      icon: <Headphones className="w-4 h-4" />,
      category: 'effects'
    },
    {
      id: 'lo-fi-texture',
      name: 'Lo-Fi Texture',
      description: 'Apply lo-fi character and texture',
      icon: <Star className="w-4 h-4" />,
      category: 'effects'
    },
    {
      id: 'stereo-widener',
      name: 'Stereo Widener',
      description: 'Enhance stereo width and presence',
      icon: <Sliders className="w-4 h-4" />,
      category: 'effects'
    },

    // Workflow Macros
    {
      id: 'bounce-stems',
      name: 'Bounce Stems',
      description: 'Export individual track stems',
      icon: <Download className="w-4 h-4" />,
      shortcut: 'Cmd+E',
      category: 'workflow'
    },
    {
      id: 'create-bus',
      name: 'Create Bus',
      description: 'Route selected tracks to new bus',
      icon: <Zap className="w-4 h-4" />,
      category: 'workflow'
    },
    {
      id: 'quick-comp',
      name: 'Quick Comp',
      description: 'Create comp track from selected takes',
      icon: <Music className="w-4 h-4" />,
      category: 'workflow'
    },
    {
      id: 'backup-project',
      name: 'Backup Project',
      description: 'Create timestamped project backup',
      icon: <Square className="w-4 h-4" />,
      category: 'workflow'
    }
  ];

  const categories = [
    { id: 'mixing', name: 'Mixing', icon: <Sliders className="w-4 h-4" /> },
    { id: 'ai', name: 'AI Tools', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'editing', name: 'Editing', icon: <Scissors className="w-4 h-4" /> },
    { id: 'effects', name: 'Effects', icon: <Wand2 className="w-4 h-4" /> },
    { id: 'workflow', name: 'Workflow', icon: <Zap className="w-4 h-4" /> }
  ];

  const filteredActions = macroActions.filter(action => action.category === selectedCategory);

  const handleActionClick = (actionId: string) => {
    console.log(`Executing macro: ${actionId}`);
    // Here you would implement the actual macro functionality
  };

  return (
    <div className="h-full flex flex-col">
      {/* Category Tabs */}
      <div className="border-b border-[var(--border)] bg-[var(--muted)]/30">
        <div className="flex overflow-x-auto">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center space-x-1 px-3 py-2 text-xs whitespace-nowrap border-b-2 transition-colors ${
                selectedCategory === category.id
                  ? 'border-[var(--primary)] text-[var(--primary)] bg-[var(--background)]'
                  : 'border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
              }`}
            >
              {category.icon}
              <span>{category.name}</span>
            </button>
          ))}
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
      <div className="flex-1 overflow-y-auto">
        <div className="p-2 space-y-1">
          {filteredActions.map((action) => (
            <div
              key={action.id}
              className="group"
            >
              <Button
                variant="ghost"
                onClick={() => handleActionClick(action.id)}
                disabled={selectedItems.length === 0 && !['ai-master', 'backup-project'].includes(action.id)}
                className="w-full h-auto p-3 text-left justify-start disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--accent)] transition-colors"
              >
                <div className="flex items-start space-x-3 w-full">
                  <div className="text-[var(--muted-foreground)] group-hover:text-[var(--foreground)] transition-colors">
                    {action.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-[var(--foreground)]">
                        {action.name}
                      </span>
                      {action.shortcut && (
                        <span className="text-xs text-[var(--muted-foreground)] font-mono">
                          {action.shortcut}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[var(--muted-foreground)] mt-0.5 leading-tight">
                      {action.description}
                    </p>
                  </div>
                </div>
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Execute Bar */}
      <div className="border-t border-[var(--border)] p-2 bg-[var(--muted)]/20">
        <div className="flex space-x-1">
          <Button
            size="sm"
            variant="ghost"
            className="flex-1 text-xs"
            disabled={selectedItems.length === 0}
          >
            <Play className="w-3 h-3 mr-1" />
            Run Selected
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-xs"
            onClick={() => setSelectedItems([])}
          >
            Clear
          </Button>
        </div>
      </div>
    </div>
  );
}