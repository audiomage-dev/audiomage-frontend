import React, { useState, useCallback } from 'react';
import { 
  Scissors, Copy, Trash2, TrendingUp, TrendingDown, Files, 
  Volume2, VolumeX, Radio, Circle, Plus, Sparkles, Sliders,
  Move, Link
} from 'lucide-react';
import { AudioTrack } from '../types/audio';

interface SimpleContextualMenuProps {
  tracks: AudioTrack[];
  onTrackMute: (trackId: string) => void;
  onTrackSolo: (trackId: string) => void;
}

export function SimpleContextualMenu({ tracks, onTrackMute, onTrackSolo }: SimpleContextualMenuProps) {
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    type: 'clip' | 'track' | 'empty-space';
    context: any;
    suggestions: any[];
  } | null>(null);

  const generateSuggestions = useCallback((type: string, context: any) => {
    switch (type) {
      case 'clip':
        return [
          { id: 'cut', label: 'Cut', icon: Scissors, action: 'cut', priority: 'high', category: 'edit', shortcut: 'Ctrl+X' },
          { id: 'copy', label: 'Copy', icon: Copy, action: 'copy', priority: 'high', category: 'edit', shortcut: 'Ctrl+C' },
          { id: 'normalize', label: 'Normalize Audio', icon: TrendingUp, action: 'normalize', priority: 'medium', category: 'audio' },
          { id: 'ai-enhance', label: 'AI Enhancement', icon: Sparkles, action: 'ai-enhance', priority: 'medium', category: 'ai' },
          { id: 'delete', label: 'Delete', icon: Trash2, action: 'delete', priority: 'low', category: 'edit', destructive: true }
        ];
      case 'track':
        return [
          { id: 'mute', label: 'Mute Track', icon: VolumeX, action: 'mute-track', priority: 'high', category: 'workflow' },
          { id: 'solo', label: 'Solo Track', icon: Radio, action: 'solo-track', priority: 'high', category: 'workflow' },
          { id: 'effects', label: 'Add Effects', icon: Sliders, action: 'track-effects', priority: 'medium', category: 'audio' },
          { id: 'duplicate', label: 'Duplicate Track', icon: Files, action: 'duplicate-track', priority: 'low', category: 'organize' }
        ];
      case 'empty-space':
        return [
          { id: 'paste', label: 'Paste', icon: Copy, action: 'paste', priority: 'high', category: 'edit', shortcut: 'Ctrl+V' },
          { id: 'record', label: 'Record Here', icon: Circle, action: 'record', priority: 'medium', category: 'workflow' },
          { id: 'ai-generate', label: 'AI Generate Music', icon: Sparkles, action: 'ai-generate', priority: 'medium', category: 'ai' },
          { id: 'marker', label: 'Add Marker', icon: Plus, action: 'add-marker', priority: 'low', category: 'organize' }
        ];
      default:
        return [];
    }
  }, []);

  const handleContextAction = useCallback((action: string, context: any) => {
    console.log(`Action: ${action}`, context);
    
    switch (action) {
      case 'mute-track':
        if (context.trackId) onTrackMute(context.trackId);
        break;
      case 'solo-track':
        if (context.trackId) onTrackSolo(context.trackId);
        break;
      default:
        console.log(`Handled action: ${action}`);
    }
    
    setContextMenu(null);
  }, [onTrackMute, onTrackSolo]);

  const handleRightClick = useCallback((e: React.MouseEvent, type: string, context: any) => {
    e.preventDefault();
    e.stopPropagation();
    
    const suggestions = generateSuggestions(type, context);
    
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      type: type as any,
      context,
      suggestions
    });
  }, [generateSuggestions]);

  return (
    <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
      <h3 className="text-sm font-medium mb-4">Intelligent Contextual Menu Demo</h3>
      
      <div className="space-y-2">
        {/* Demo Clip */}
        <div 
          className="p-3 bg-blue-200 dark:bg-blue-800 rounded cursor-pointer hover:bg-blue-300 dark:hover:bg-blue-700"
          onContextMenu={(e) => handleRightClick(e, 'clip', { clipId: 'demo-clip', clipName: 'Audio Clip 1', trackId: 'track-1' })}
        >
          Right-click me (Audio Clip)
        </div>
        
        {/* Demo Track */}
        <div 
          className="p-3 bg-green-200 dark:bg-green-800 rounded cursor-pointer hover:bg-green-300 dark:hover:bg-green-700"
          onContextMenu={(e) => handleRightClick(e, 'track', { trackId: 'track-1', trackName: 'Track 1' })}
        >
          Right-click me (Track Header)
        </div>
        
        {/* Demo Empty Space */}
        <div 
          className="p-3 bg-gray-200 dark:bg-gray-700 rounded cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-600"
          onContextMenu={(e) => handleRightClick(e, 'empty-space', { timePosition: 5.2 })}
        >
          Right-click me (Empty Space)
        </div>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="fixed bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-xl py-1 z-50 min-w-56"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-600">
            <div className="font-medium capitalize">{contextMenu.type.replace('-', ' ')}</div>
            {contextMenu.context.clipName && (
              <div>{contextMenu.context.clipName}</div>
            )}
            {contextMenu.context.trackName && (
              <div>Track: {contextMenu.context.trackName}</div>
            )}
          </div>
          
          {/* Suggestions */}
          {['high', 'medium', 'low'].map(priority => {
            const suggestions = contextMenu.suggestions.filter(s => s.priority === priority);
            if (suggestions.length === 0) return null;
            
            return (
              <div key={priority} className={priority === 'high' ? '' : 'border-t border-gray-200 dark:border-gray-600'}>
                {suggestions.map((suggestion) => {
                  const Icon = suggestion.icon;
                  return (
                    <button
                      key={suggestion.id}
                      onClick={() => handleContextAction(suggestion.action, contextMenu.context)}
                      className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between transition-colors ${
                        suggestion.destructive 
                          ? 'hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400' 
                          : suggestion.category === 'ai'
                            ? 'hover:bg-purple-50 hover:text-purple-600 dark:hover:bg-purple-900/20 dark:hover:text-purple-400'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <Icon className="w-3 h-3" />
                        <div>
                          <div className="font-medium">{suggestion.label}</div>
                          {suggestion.description && (
                            <div className="text-gray-400 text-[10px] mt-0.5">{suggestion.description}</div>
                          )}
                        </div>
                      </div>
                      {suggestion.shortcut && (
                        <span className="text-gray-400 text-[10px] font-mono">{suggestion.shortcut}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}
      
      {/* Click outside to close */}
      {contextMenu && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setContextMenu(null)}
        />
      )}
    </div>
  );
}