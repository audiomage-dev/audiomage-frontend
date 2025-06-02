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
      <div className="p-4 border-b border-[var(--border)] bg-gradient-to-br from-[var(--card)]/80 via-[var(--background)] to-[var(--muted)]/20 backdrop-blur-sm">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--primary)]/60 animate-pulse"></div>
            <h3 className="text-sm font-bold text-[var(--foreground)]">Quick Actions</h3>
          </div>
          <div className="text-xs text-[var(--muted-foreground)] font-mono bg-[var(--muted)]/30 px-2 py-1 rounded">
            {macroActions.length} total
          </div>
        </div>
        
        {/* Category Pills */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {categories.map((category) => {
            const categoryCount = macroActions.filter(a => a.category === category.id).length;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`group flex items-center space-x-3 p-3 rounded-xl transition-all duration-300 transform hover:scale-[1.02] ${
                  selectedCategory === category.id
                    ? 'bg-gradient-to-br from-[var(--primary)] via-[var(--primary)]/90 to-[var(--primary)]/70 text-[var(--primary-foreground)] shadow-xl shadow-[var(--primary)]/30 border border-[var(--primary)]/40'
                    : 'bg-gradient-to-br from-[var(--card)]/60 to-[var(--muted)]/40 border border-[var(--border)]/30 hover:bg-gradient-to-br hover:from-[var(--accent)]/80 hover:to-[var(--accent)]/50 hover:border-[var(--primary)]/40 text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:shadow-lg'
                }`}
              >
                <div className={`p-2 rounded-lg transition-all duration-300 group-hover:scale-110 ${
                  selectedCategory === category.id 
                    ? 'bg-[var(--primary-foreground)]/20 text-[var(--primary-foreground)]'
                    : 'bg-[var(--primary)]/10 text-[var(--primary)] group-hover:bg-[var(--primary)]/20'
                }`}>
                  {category.icon}
                </div>
                <div className="flex-1 text-left">
                  <div className="text-xs font-semibold">{category.name}</div>
                  <div className={`text-xs font-bold ${
                    selectedCategory === category.id
                      ? 'text-[var(--primary-foreground)]/80'
                      : 'text-[var(--muted-foreground)] group-hover:text-[var(--primary)]'
                  }`}>
                    {categoryCount} actions
                  </div>
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
        <div className="p-3 space-y-3">
          {filteredActions.map((action, index) => (
            <div
              key={action.id}
              className="group relative animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="relative bg-gradient-to-br from-[var(--card)]/80 to-[var(--card)]/40 rounded-xl border border-[var(--border)]/30 hover:border-[var(--primary)]/40 transition-all duration-300 hover:shadow-lg hover:shadow-[var(--primary)]/10 group-hover:scale-[1.02] transform backdrop-blur-sm">
                <Button
                  variant="ghost"
                  onClick={() => handleActionClick(action.id)}
                  disabled={selectedItems.length === 0 && !['ai-master', 'backup-project'].includes(action.id)}
                  className="w-full h-auto p-4 text-left justify-start disabled:opacity-40 disabled:cursor-not-allowed hover:bg-transparent rounded-xl"
                >
                  <div className="flex items-start space-x-4 w-full">
                    <div className="relative">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-[var(--primary)]/20 to-[var(--primary)]/10 text-[var(--primary)] group-hover:from-[var(--primary)]/30 group-hover:to-[var(--primary)]/20 transition-all duration-300 group-hover:scale-110 transform">
                        {action.icon}
                      </div>
                      <div className="absolute -inset-1 bg-gradient-to-r from-[var(--primary)]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl blur-sm"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-bold text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors">
                          {action.name}
                        </h4>
                        {action.shortcut && (
                          <div className="flex items-center space-x-1">
                            <div className="w-1 h-1 rounded-full bg-[var(--muted-foreground)]/40"></div>
                            <span className="text-xs text-[var(--muted-foreground)] font-mono bg-[var(--muted)]/40 px-2 py-1 rounded-md group-hover:bg-[var(--primary)]/10 group-hover:text-[var(--primary)] transition-all duration-300">
                              {action.shortcut}
                            </span>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-[var(--muted-foreground)] leading-relaxed group-hover:text-[var(--foreground)]/90 transition-colors">
                        {action.description}
                      </p>
                      
                      {/* Progress indicator */}
                      <div className="mt-3 flex items-center space-x-2">
                        <div className="flex-1 h-1 bg-[var(--muted)]/30 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-[var(--primary)] to-[var(--primary)]/60 rounded-full transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
                        </div>
                        <span className="text-xs text-[var(--muted-foreground)] font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          Ready
                        </span>
                      </div>
                    </div>
                  </div>
                </Button>
                
                {/* Enhanced glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/5 via-transparent to-[var(--primary)]/3 opacity-0 group-hover:opacity-100 transition-all duration-500 rounded-xl pointer-events-none"></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Execute Bar */}
      <div className="border-t border-[var(--border)] p-4 bg-gradient-to-br from-[var(--card)]/60 via-[var(--muted)]/20 to-[var(--background)] backdrop-blur-sm">
        <div className="space-y-3">
          {/* Main Action Button */}
          <Button
            size="sm"
            variant="ghost"
            className="w-full h-10 text-sm font-bold bg-gradient-to-r from-[var(--primary)] to-[var(--primary)]/80 hover:from-[var(--primary)]/90 hover:to-[var(--primary)]/70 text-[var(--primary-foreground)] border border-[var(--primary)]/40 hover:border-[var(--primary)]/60 transition-all duration-300 hover:shadow-xl hover:shadow-[var(--primary)]/30 disabled:opacity-40 disabled:from-[var(--muted)] disabled:to-[var(--muted)]/80 disabled:text-[var(--muted-foreground)] rounded-xl transform hover:scale-[1.02]"
            disabled={selectedItems.length === 0}
          >
            <div className="flex items-center space-x-2">
              <Rocket className="w-4 h-4" />
              <span>Execute Selected Actions</span>
              {selectedItems.length > 0 && (
                <div className="px-2 py-0.5 bg-[var(--primary-foreground)]/20 rounded-full text-xs font-bold">
                  {selectedItems.length}
                </div>
              )}
            </div>
          </Button>
          
          {/* Secondary Actions */}
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant="ghost"
              className="flex-1 text-xs font-medium bg-[var(--muted)]/40 hover:bg-[var(--accent)] border border-[var(--border)]/40 hover:border-[var(--primary)]/30 transition-all duration-300 rounded-lg"
              onClick={() => setSelectedItems([])}
            >
              <Square className="w-3 h-3 mr-1.5" />
              Clear Selection
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="flex-1 text-xs font-medium bg-[var(--muted)]/40 hover:bg-[var(--accent)] border border-[var(--border)]/40 hover:border-[var(--primary)]/30 transition-all duration-300 rounded-lg"
            >
              <Star className="w-3 h-3 mr-1.5" />
              Save Preset
            </Button>
          </div>
        </div>
        
        {/* Enhanced status indicator */}
        <div className="mt-3 pt-3 border-t border-[var(--border)]/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full transition-all duration-500 ${
                selectedItems.length > 0 
                  ? 'bg-gradient-to-r from-[var(--green)] to-[var(--green)]/70 shadow-lg shadow-[var(--green)]/40 animate-pulse' 
                  : 'bg-[var(--muted-foreground)]/50'
              }`}></div>
              <span className="text-xs text-[var(--muted-foreground)] font-medium">
                {selectedItems.length > 0 ? `${selectedItems.length} actions ready` : 'Select items to begin'}
              </span>
            </div>
            <div className="text-xs text-[var(--muted-foreground)] font-mono">
              {categories.find(c => c.id === selectedCategory)?.name}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}