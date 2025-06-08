import React from 'react';
import { 
  Scissors, Copy, Trash2, TrendingUp, TrendingDown, Files, 
  Volume2, VolumeX, Radio, Circle, Plus, Sparkles, Sliders,
  Move, Link
} from 'lucide-react';

interface Suggestion {
  id: string;
  label: string;
  icon: any;
  action: string;
  priority: 'high' | 'medium' | 'low';
  category: 'edit' | 'audio' | 'organize' | 'ai' | 'workflow';
  description?: string;
  shortcut?: string;
  destructive?: boolean;
}

interface ContextMenuProps {
  x: number;
  y: number;
  type: 'clip' | 'track' | 'empty-space' | 'multi-selection' | 'range' | 'track-header';
  context: {
    clipId?: string;
    trackId?: string;
    trackType?: string;
    clipType?: string;
    isEmpty?: boolean;
    selectedCount?: number;
    timePosition?: number;
    rangeData?: { startTime: number; endTime: number; };
    trackName?: string;
    clipName?: string;
  };
  suggestions: Suggestion[];
  onAction: (action: string, context: any) => void;
  onClose: () => void;
}

export function IntelligentContextMenu({ 
  x, y, type, context, suggestions, onAction, onClose 
}: ContextMenuProps) {
  return (
    <div
      className="fixed bg-[var(--background)] border border-[var(--border)] rounded-lg shadow-xl py-1 z-50 min-w-56"
      style={{ left: x, top: y }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Context Header */}
      <div className="px-3 py-2 text-xs text-[var(--muted-foreground)] border-b border-[var(--border)]">
        <div className="font-medium capitalize">{type.replace('-', ' ')}</div>
        {context.clipName && (
          <div className="text-[var(--muted-foreground)]">{context.clipName}</div>
        )}
        {context.trackName && (
          <div className="text-[var(--muted-foreground)]">Track: {context.trackName}</div>
        )}
      </div>
      
      {/* Suggestions grouped by priority */}
      {['high', 'medium', 'low'].map(priority => {
        const prioritySuggestions = suggestions.filter(s => s.priority === priority);
        if (prioritySuggestions.length === 0) return null;
        
        return (
          <div key={priority} className={priority === 'high' ? '' : 'border-t border-[var(--border)]/50'}>
            {prioritySuggestions.map((suggestion) => {
              const Icon = suggestion.icon;
              return (
                <button
                  key={suggestion.id}
                  onClick={() => {
                    onAction(suggestion.action, context);
                    onClose();
                  }}
                  className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between transition-colors ${
                    suggestion.destructive 
                      ? 'hover:bg-[var(--red)]/10 hover:text-[var(--red)]' 
                      : suggestion.category === 'ai'
                        ? 'hover:bg-[var(--purple)]/10 hover:text-[var(--purple)]'
                        : 'hover:bg-[var(--accent)]'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Icon className="w-3 h-3" />
                    <div>
                      <div className="font-medium">{suggestion.label}</div>
                      {suggestion.description && (
                        <div className="text-[var(--muted-foreground)] text-[10px] mt-0.5">{suggestion.description}</div>
                      )}
                    </div>
                  </div>
                  {suggestion.shortcut && (
                    <span className="text-[var(--muted-foreground)] text-[10px] font-mono">{suggestion.shortcut}</span>
                  )}
                </button>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

// Generate contextual suggestions based on what was clicked
export function generateContextualSuggestions(contextType: string, context: any): Suggestion[] {
  const suggestions: Suggestion[] = [];

  switch (contextType) {
    case 'clip':
      const isAudioClip = context.clipType === 'audio';
      const isVideoClip = context.clipType === 'video';
      
      // High priority actions for clips
      suggestions.push(
        { id: 'cut', label: 'Cut', icon: Scissors, action: 'cut', priority: 'high', category: 'edit', shortcut: 'Ctrl+X' },
        { id: 'copy', label: 'Copy', icon: Copy, action: 'copy', priority: 'high', category: 'edit', shortcut: 'Ctrl+C' },
        { id: 'delete', label: 'Delete', icon: Trash2, action: 'delete', priority: 'high', category: 'edit', shortcut: 'Del', destructive: true }
      );

      // Audio-specific suggestions
      if (isAudioClip) {
        suggestions.push(
          { id: 'normalize', label: 'Normalize Audio', icon: TrendingUp, action: 'normalize', priority: 'medium', category: 'audio', description: 'Optimize volume levels' },
          { id: 'fade-in', label: 'Fade In', icon: TrendingUp, action: 'fade-in', priority: 'medium', category: 'audio' },
          { id: 'fade-out', label: 'Fade Out', icon: TrendingDown, action: 'fade-out', priority: 'medium', category: 'audio' },
          { id: 'ai-enhance', label: 'AI Audio Enhancement', icon: Sparkles, action: 'ai-enhance', priority: 'medium', category: 'ai', description: 'Improve audio quality with AI' }
        );
      }

      // Video-specific suggestions
      if (isVideoClip) {
        suggestions.push(
          { id: 'extract-audio', label: 'Extract Audio', icon: Volume2, action: 'extract-audio', priority: 'medium', category: 'workflow' },
          { id: 'color-correct', label: 'Color Correction', icon: Circle, action: 'color-correct', priority: 'medium', category: 'workflow' }
        );
      }

      // Organization suggestions
      suggestions.push(
        { id: 'duplicate', label: 'Duplicate', icon: Files, action: 'duplicate', priority: 'low', category: 'organize', shortcut: 'Ctrl+D' },
        { id: 'split', label: 'Split at Playhead', icon: Scissors, action: 'split', priority: 'low', category: 'edit' }
      );
      break;

    case 'empty-space':
      suggestions.push(
        { id: 'paste', label: 'Paste', icon: Copy, action: 'paste', priority: 'high', category: 'edit', shortcut: 'Ctrl+V' },
        { id: 'record', label: 'Record Here', icon: Circle, action: 'record', priority: 'medium', category: 'workflow', description: 'Start recording at this position' },
        { id: 'add-marker', label: 'Add Marker', icon: Plus, action: 'add-marker', priority: 'low', category: 'organize' },
        { id: 'ai-generate', label: 'AI Generate Music', icon: Sparkles, action: 'ai-generate', priority: 'medium', category: 'ai', description: 'Create music with AI' }
      );
      break;

    case 'track-header':
      suggestions.push(
        { id: 'mute-track', label: 'Mute Track', icon: VolumeX, action: 'mute-track', priority: 'high', category: 'workflow' },
        { id: 'solo-track', label: 'Solo Track', icon: Radio, action: 'solo-track', priority: 'high', category: 'workflow' },
        { id: 'duplicate-track', label: 'Duplicate Track', icon: Files, action: 'duplicate-track', priority: 'medium', category: 'organize' },
        { id: 'delete-track', label: 'Delete Track', icon: Trash2, action: 'delete-track', priority: 'low', category: 'organize', destructive: true },
        { id: 'track-effects', label: 'Add Effects', icon: Sliders, action: 'track-effects', priority: 'medium', category: 'audio' }
      );
      break;

    case 'multi-selection':
      const count = context.selectedCount || 0;
      suggestions.push(
        { id: 'group-clips', label: `Group ${count} Clips`, icon: Link, action: 'group-clips', priority: 'high', category: 'organize' },
        { id: 'align-clips', label: 'Align Clips', icon: Move, action: 'align-clips', priority: 'medium', category: 'organize' },
        { id: 'normalize-all', label: 'Normalize All', icon: TrendingUp, action: 'normalize-all', priority: 'medium', category: 'audio' },
        { id: 'delete-all', label: `Delete ${count} Clips`, icon: Trash2, action: 'delete-all', priority: 'low', category: 'edit', destructive: true }
      );
      break;

    case 'range':
      suggestions.push(
        { id: 'split-range', label: 'Split All at Boundaries', icon: Scissors, action: 'split-range', priority: 'high', category: 'edit' },
        { id: 'extract-range', label: 'Extract to New Track', icon: Plus, action: 'extract-range', priority: 'medium', category: 'organize' },
        { id: 'bounce-range', label: 'Bounce Selection', icon: Files, action: 'bounce-range', priority: 'medium', category: 'workflow' },
        { id: 'ai-mix-range', label: 'AI Smart Mix', icon: Sparkles, action: 'ai-mix-range', priority: 'medium', category: 'ai', description: 'Auto-balance levels with AI' }
      );
      break;
  }

  return suggestions.sort((a, b) => {
    const priorityOrder: Record<string, number> = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });
}