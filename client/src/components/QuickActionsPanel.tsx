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
  Package,
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
      category: 'mixing',
    },
    {
      id: 'auto-pan',
      name: 'Stereo Magic',
      description: 'Intelligently pan tracks for optimal stereo image',
      icon: <Target className="w-4 h-4" />,
      shortcut: 'Cmd+Shift+P',
      category: 'mixing',
    },
    {
      id: 'ducking',
      name: 'Pump & Duck',
      description: 'Apply ducking compression to selected tracks',
      icon: <Waves className="w-4 h-4" />,
      category: 'mixing',
    },
    {
      id: 'vocal-enhance',
      name: 'Vocal Sparkle',
      description: 'Apply vocal clarity and presence enhancement',
      icon: <Crown className="w-4 h-4" />,
      category: 'mixing',
    },

    // AI Macros
    {
      id: 'ai-master',
      name: 'AI Master Chef',
      description: 'Intelligent mastering chain for professional sound',
      icon: <Gem className="w-4 h-4" />,
      shortcut: 'Cmd+Shift+M',
      category: 'ai',
    },
    {
      id: 'ai-stem-separate',
      name: 'Stem Surgeon',
      description: 'AI-powered vocal and instrument separation',
      icon: <Puzzle className="w-4 h-4" />,
      category: 'ai',
    },
    {
      id: 'ai-noise-reduce',
      name: 'Noise Ninja',
      description: 'Remove background noise using AI analysis',
      icon: <Shield className="w-4 h-4" />,
      category: 'ai',
    },
    {
      id: 'ai-pitch-correct',
      name: 'Pitch Perfect',
      description: 'Automatic pitch correction and tuning',
      icon: <Bolt className="w-4 h-4" />,
      category: 'ai',
    },

    // Editing Macros
    {
      id: 'auto-crossfade',
      name: 'Smooth Operator',
      description: 'Add smooth crossfades between selected clips',
      icon: <Blend className="w-4 h-4" />,
      shortcut: 'Cmd+X',
      category: 'editing',
    },
    {
      id: 'duplicate-pattern',
      name: 'Copy Cat',
      description: 'Duplicate selected clips with spacing',
      icon: <GitBranch className="w-4 h-4" />,
      shortcut: 'Cmd+D',
      category: 'editing',
    },
    {
      id: 'quantize-timing',
      name: 'Time Keeper',
      description: 'Snap selected audio to grid timing',
      icon: <Clock className="w-4 h-4" />,
      shortcut: 'Cmd+Q',
      category: 'editing',
    },
    {
      id: 'reverse-audio',
      name: 'Backwards Magic',
      description: 'Reverse selected audio clips',
      icon: <Shuffle className="w-4 h-4" />,
      category: 'editing',
    },

    // Effects Macros
    {
      id: 'vintage-warmth',
      name: 'Golden Age',
      description: 'Add analog tape saturation and warmth',
      icon: <Sun className="w-4 h-4" />,
      category: 'effects',
    },
    {
      id: 'space-verb',
      name: 'Hall of Fame',
      description: 'Add dimensional reverb to selected tracks',
      icon: <Mountain className="w-4 h-4" />,
      category: 'effects',
    },
    {
      id: 'lo-fi-texture',
      name: 'Retro Vibe',
      description: 'Apply lo-fi character and texture',
      icon: <Moon className="w-4 h-4" />,
      category: 'effects',
    },
    {
      id: 'stereo-widener',
      name: 'Wide & Wild',
      description: 'Enhance stereo width and presence',
      icon: <Wind className="w-4 h-4" />,
      category: 'effects',
    },
    {
      id: 'frost-effect',
      name: 'Frosty Touch',
      description: 'Add crystalline high-frequency shimmer',
      icon: <Snowflake className="w-4 h-4" />,
      category: 'effects',
    },
    {
      id: 'fire-drive',
      name: 'Fire Drive',
      description: 'Add aggressive harmonic distortion',
      icon: <Flame className="w-4 h-4" />,
      category: 'effects',
    },

    // Workflow Macros
    {
      id: 'bounce-stems',
      name: 'Export Express',
      description: 'Export individual track stems',
      icon: <Rocket className="w-4 h-4" />,
      shortcut: 'Cmd+E',
      category: 'workflow',
    },
    {
      id: 'create-bus',
      name: 'Bus Builder',
      description: 'Route selected tracks to new bus',
      icon: <Package className="w-4 h-4" />,
      category: 'workflow',
    },
    {
      id: 'quick-comp',
      name: 'Comp Wizard',
      description: 'Create comp track from selected takes',
      icon: <Wand2 className="w-4 h-4" />,
      category: 'workflow',
    },
    {
      id: 'backup-project',
      name: 'Time Machine',
      description: 'Create timestamped project backup',
      icon: <Archive className="w-4 h-4" />,
      category: 'workflow',
    },
  ];

  const categories = [
    { id: 'mixing', name: 'Mixing', icon: <Gauge className="w-5 h-5" /> },
    { id: 'ai', name: 'AI Tools', icon: <Sparkles className="w-5 h-5" /> },
    { id: 'editing', name: 'Editing', icon: <Scissors className="w-5 h-5" /> },
    { id: 'effects', name: 'Effects', icon: <Wand2 className="w-5 h-5" /> },
    { id: 'workflow', name: 'Workflow', icon: <Zap className="w-5 h-5" /> },
  ];

  const filteredActions = macroActions.filter(
    (action) => action.category === selectedCategory
  );

  const handleActionClick = (actionId: string) => {
    console.log(`Executing macro: ${actionId}`);
    // Here you would implement the actual macro functionality
  };

  return (
    <div className="h-full flex flex-col">
      {/* Category Navigation */}
      <div className="p-3 border-b border-[var(--border)] bg-[var(--card)]">
        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 mb-3">
          {categories.map((category) => {
            const categoryCount = macroActions.filter(
              (a) => a.category === category.id
            ).length;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                  selectedCategory === category.id
                    ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                    : 'bg-[var(--muted)] border border-[var(--border)] hover:bg-[var(--accent)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                }`}
              >
                <div className="w-4 h-4">{category.icon}</div>
                <span className="text-xs font-medium">{category.name}</span>
                <div
                  className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                    selectedCategory === category.id
                      ? 'bg-[var(--primary-foreground)]/20 text-[var(--primary-foreground)]'
                      : 'bg-[var(--background)] text-[var(--muted-foreground)]'
                  }`}
                >
                  {categoryCount}
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Category Header */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--muted)] border border-[var(--border)]">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-md bg-[var(--primary)]/10 border border-[var(--primary)]/20">
              <div className="text-[var(--primary)] w-4 h-4">
                {categories.find((c) => c.id === selectedCategory)?.icon}
              </div>
            </div>
            <div>
              <span className="text-sm font-semibold text-[var(--foreground)]">
                {categories.find((c) => c.id === selectedCategory)?.name}
              </span>
              <p className="text-xs text-[var(--muted-foreground)]">
                {selectedCategory === 'mixing' &&
                  'Balance and enhance your mix'}
                {selectedCategory === 'ai' && 'AI-powered audio processing'}
                {selectedCategory === 'editing' &&
                  'Precision audio editing tools'}
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
      <div className="px-3 py-2 text-xs text-[var(--muted-foreground)] bg-[var(--background)] border-b border-[var(--border)]">
        {selectedItems.length > 0
          ? `${selectedItems.length} items selected`
          : 'No items selected'}
      </div>

      {/* Actions List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="p-2 space-y-1">
          {filteredActions.map((action) => (
            <div key={action.id} className="group">
              <Button
                variant="ghost"
                onClick={() => handleActionClick(action.id)}
                disabled={
                  selectedItems.length === 0 &&
                  !['ai-master', 'backup-project'].includes(action.id)
                }
                className="w-full h-auto p-3 text-left justify-start disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[var(--accent)] transition-colors rounded-lg border border-transparent hover:border-[var(--border)]"
              >
                <div className="flex items-start space-x-3 w-full">
                  <div className="text-[var(--muted-foreground)] group-hover:text-[var(--primary)] transition-colors w-4 h-4 mt-0.5">
                    {action.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-[var(--foreground)]">
                        {action.name}
                      </span>
                      {action.shortcut && (
                        <span className="text-xs text-[var(--muted-foreground)] font-mono bg-[var(--muted)] px-1.5 py-0.5 rounded">
                          {action.shortcut}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[var(--muted-foreground)] mt-1 leading-relaxed">
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
      <div className="border-t border-[var(--border)] p-3 bg-[var(--card)]">
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="ghost"
            className="flex-1 text-xs font-medium bg-[var(--primary)]/10 hover:bg-[var(--primary)]/20 border border-[var(--primary)]/20 hover:border-[var(--primary)]/40 transition-colors disabled:opacity-40"
            disabled={selectedItems.length === 0}
          >
            <Rocket className="w-3 h-3 mr-1.5" />
            Execute
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

        <div className="mt-2 flex items-center justify-center space-x-2">
          <div
            className={`w-2 h-2 rounded-full transition-colors ${
              selectedItems.length > 0
                ? 'bg-[var(--primary)]'
                : 'bg-[var(--muted-foreground)]'
            }`}
          ></div>
          <span className="text-xs text-[var(--muted-foreground)]">
            {selectedItems.length > 0
              ? 'Ready to execute'
              : 'Select items to begin'}
          </span>
        </div>
      </div>
    </div>
  );
}
