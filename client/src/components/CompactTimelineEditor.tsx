import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { 
  Play, Pause, Square, SkipBack, SkipForward, 
  Volume2, VolumeX, Edit3, Trash2, Copy, Plus, 
  Minus, ZoomIn, ZoomOut, Grid3x3, Clock, 
  Move, RotateCcw, Scissors, Link, Circle,
  TrendingUp, TrendingDown, BarChart3, Files,
  Radio, Sparkles, X, ChevronDown, ChevronRight,
  Settings, MoreHorizontal, Target, MousePointer2,
  Layers, Maximize2, Minimize2
} from 'lucide-react';
import { AudioTrack, TransportState } from '@/types/audio';
import { IntelligentContextMenu, generateContextualSuggestions } from './IntelligentContextMenu';

interface CompactTimelineEditorProps {
  tracks: AudioTrack[];
  transport: TransportState;
  zoomLevel?: number;
  bpm?: number;
  timeSignature?: [number, number];
  snapMode?: 'free' | 'grid' | 'beat' | 'measure';
  gridDisplayMode?: 'seconds' | 'timecode';
  onTrackMute: (trackId: string) => void;
  onTrackSolo: (trackId: string) => void;
  onTrackSelect?: (trackId: string) => void;
  onClipMove?: (clipId: string, fromTrackId: string, toTrackId: string, newStartTime: number) => void;
  onClipResize?: (clipId: string, trackId: string, newStartTime: number, newDuration: number) => void;
  onZoomChange?: (zoomLevel: number) => void;
  isLocked?: boolean;
  collapsedGroups?: Set<string>;
  onToggleGroupCollapse?: (groupId: string) => void;
}

export function CompactTimelineEditor({ 
  tracks, 
  transport, 
  zoomLevel: externalZoomLevel = 1, 
  bpm = 120, 
  timeSignature = [4, 4], 
  snapMode = 'grid', 
  gridDisplayMode = 'timecode', 
  onTrackMute, 
  onTrackSolo, 
  onTrackSelect, 
  onClipMove, 
  onClipResize, 
  onZoomChange, 
  isLocked = false, 
  collapsedGroups = new Set(), 
  onToggleGroupCollapse 
}: CompactTimelineEditorProps) {
  
  // State management
  const [internalZoomLevel, setInternalZoomLevel] = useState(externalZoomLevel);
  const [selectedTracks, setSelectedTracks] = useState<Set<string>>(new Set());
  const [selectedClips, setSelectedClips] = useState<Set<string>>(new Set());
  const [dragState, setDragState] = useState<any>(null);
  const [rangeSelection, setRangeSelection] = useState<any>(null);
  const [intelligentContextMenu, setIntelligentContextMenu] = useState<any>(null);
  const [showRangeActions, setShowRangeActions] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });

  // Refs
  const timelineRef = useRef<HTMLDivElement>(null);
  const tracksContainerRef = useRef<HTMLDivElement>(null);

  // Constants
  const TRACK_HEIGHT = 64;
  const HEADER_HEIGHT = 40;
  const PIXELS_PER_SECOND = 50 * internalZoomLevel;
  const TIMELINE_DURATION = 300; // seconds

  // Utility functions
  const formatTime = useCallback((seconds: number): string => {
    if (gridDisplayMode === 'timecode') {
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      const frames = Math.floor((seconds % 1) * 30);
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}:${frames.toString().padStart(2, '0')}`;
    } else {
      return `${seconds.toFixed(2)}s`;
    }
  }, [gridDisplayMode]);

  const timeToPixels = useCallback((time: number): number => {
    return time * PIXELS_PER_SECOND;
  }, [PIXELS_PER_SECOND]);

  const pixelsToTime = useCallback((pixels: number): number => {
    return pixels / PIXELS_PER_SECOND;
  }, [PIXELS_PER_SECOND]);

  // Event handlers
  const handleContextualAction = useCallback((action: string, context: any) => {
    console.log('Contextual action:', action, context);
    setIntelligentContextMenu(null);
  }, []);

  const handleRightClick = useCallback((e: React.MouseEvent, type: string, context: any) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Generate intelligent suggestions based on context
    const suggestions = generateContextualSuggestions(type, context);
    
    setIntelligentContextMenu({
      x: e.clientX,
      y: e.clientY,
      type,
      context,
      suggestions
    });
  }, []);

  const handleZoomChange = useCallback((newZoom: number) => {
    const clampedZoom = Math.max(0.1, Math.min(5, newZoom));
    setInternalZoomLevel(clampedZoom);
    onZoomChange?.(clampedZoom);
  }, [onZoomChange]);

  // Render timeline grid
  const renderTimelineGrid = () => {
    const gridLines = [];
    const step = snapMode === 'beat' ? 60 / bpm : 1; // 1 second or 1 beat
    
    for (let time = 0; time <= TIMELINE_DURATION; time += step) {
      const x = timeToPixels(time);
      const isMainGrid = time % (step * 4) === 0;
      
      gridLines.push(
        <div
          key={`grid-${time}`}
          className={`absolute top-0 bottom-0 ${
            isMainGrid 
              ? 'border-l border-[var(--border)] opacity-60' 
              : 'border-l border-[var(--border)] opacity-20'
          }`}
          style={{ left: x }}
        />
      );
    }
    
    return gridLines;
  };

  // Render time ruler
  const renderTimeRuler = () => {
    const markers = [];
    const step = snapMode === 'beat' ? 60 / bpm * 4 : 5; // 4 beats or 5 seconds
    
    for (let time = 0; time <= TIMELINE_DURATION; time += step) {
      const x = timeToPixels(time);
      
      markers.push(
        <div
          key={`marker-${time}`}
          className="absolute top-0 flex flex-col items-center text-xs text-[var(--muted-foreground)]"
          style={{ left: x - 25, width: 50 }}
        >
          <div className="h-2 w-px bg-[var(--border)]" />
          <span className="mt-1 font-mono">{formatTime(time)}</span>
        </div>
      );
    }
    
    return markers;
  };

  // Render track
  const renderTrack = (track: AudioTrack, index: number) => {
    const isSelected = selectedTracks.has(track.id);
    
    return (
      <div
        key={track.id}
        className={`flex border-b border-[var(--border)] ${
          isSelected ? 'bg-[var(--accent)]' : 'bg-[var(--background)]'
        }`}
        style={{ height: TRACK_HEIGHT }}
      >
        {/* Track Header */}
        <div 
          className="w-48 flex-shrink-0 flex items-center px-3 border-r border-[var(--border)] relative"
          style={{ 
            backgroundColor: `${track.color}33`, // 20% transparency
            borderLeft: `4px solid ${track.color}`
          }}
          onContextMenu={(e) => handleRightClick(e, 'track-header', { 
            trackId: track.id, 
            trackName: track.name, 
            trackType: track.type 
          })}
        >
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-white truncate">
              {track.name}
            </div>
          </div>
          
          <div className="flex items-center space-x-1 ml-2">
            <button
              onClick={() => onTrackMute(track.id)}
              className={`w-6 h-6 rounded text-xs font-bold transition-colors ${
                track.muted
                  ? 'bg-red-500 text-white'
                  : 'bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--accent)]'
              }`}
            >
              M
            </button>
            <button
              onClick={() => onTrackSolo(track.id)}
              className={`w-6 h-6 rounded text-xs font-bold transition-colors ${
                track.soloed
                  ? 'bg-yellow-500 text-white'
                  : 'bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--accent)]'
              }`}
            >
              S
            </button>
          </div>
        </div>
        
        {/* Track Content */}
        <div 
          className="flex-1 relative"
          style={{ 
            backgroundColor: `${track.color}0D` // 5% transparency
          }}
          onContextMenu={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const timePosition = pixelsToTime(e.clientX - rect.left);
            handleRightClick(e, 'empty-space', { 
              trackId: track.id, 
              timePosition,
              isEmpty: true 
            });
          }}
        >
          {/* Clips */}
          {track.clips?.map((clip) => (
            <div
              key={clip.id}
              className={`absolute top-1 bottom-1 rounded cursor-pointer transition-colors ${
                selectedClips.has(clip.id) ? 'ring-2 ring-white/50' : ''
              }`}
              style={{
                left: timeToPixels(clip.startTime),
                width: timeToPixels(clip.duration),
                backgroundColor: `${track.color}CC`, // 80% opacity
                border: `1px solid ${track.color}`,
              }}
              onContextMenu={(e) => {
                e.stopPropagation();
                handleRightClick(e, 'clip', { 
                  clipId: clip.id, 
                  clipName: clip.name, 
                  trackId: track.id, 
                  trackName: track.name,
                  clipType: track.type 
                });
              }}
            >
              <div className="px-2 py-1 text-xs text-white font-medium truncate drop-shadow-sm">
                {clip.name}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Effect for handling clicks outside menu
  useEffect(() => {
    const handleClickOutside = () => {
      setIntelligentContextMenu(null);
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="h-full flex flex-col bg-[var(--background)]">
      {/* Timeline Header */}
      <div 
        className="relative bg-[var(--muted)]/10 border-b border-[var(--border)]"
        style={{ height: HEADER_HEIGHT }}
      >
        <div className="flex">
          {/* Track Header Space */}
          <div className="w-48 flex-shrink-0 border-r border-[var(--border)] flex items-center justify-between px-3">
            <div className="flex items-center space-x-1">
              <button
                onClick={() => {
                  // Toggle grid view - could be passed as prop or managed in parent
                  console.log('Toggle grid view');
                }}
                className="w-7 h-7 flex items-center justify-center text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--accent)] rounded"
                title="Toggle Grid View"
              >
                <Grid3x3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleZoomChange(internalZoomLevel * 1.2)}
                className="w-7 h-7 flex items-center justify-center text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--accent)] rounded"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleZoomChange(internalZoomLevel / 1.2)}
                className="w-7 h-7 flex items-center justify-center text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--accent)] rounded"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center">
              <button
                onClick={() => {
                  // Add new track - could trigger a callback to parent
                  console.log('Add new track');
                }}
                className="w-8 h-8 flex items-center justify-center text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--accent)] rounded"
                title="Add Track"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          {/* Time Ruler */}
          <div className="flex-1 relative overflow-hidden">
            {renderTimeRuler()}
          </div>
        </div>
      </div>
      
      {/* Timeline Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Tracks */}
        <div className="flex-1 relative">
          <div 
            ref={tracksContainerRef}
            className="overflow-auto h-full"
          >
            {tracks.map((track, index) => renderTrack(track, index))}
          </div>
          
          {/* Grid Overlay - exclude track header area */}
          <div className="absolute top-0 bottom-0 right-0 pointer-events-none overflow-hidden" style={{ left: 192 }}>
            <div className="relative h-full">
              {renderTimelineGrid()}
            </div>
          </div>
          
          {/* Playhead */}
          <div
            className="absolute top-0 bottom-0 w-px bg-red-500 pointer-events-none z-10"
            style={{ left: timeToPixels(transport.currentTime) + 192 }} // 192px = track header width
          />
        </div>
      </div>

      {/* Intelligent Context Menu */}
      {intelligentContextMenu && (
        <IntelligentContextMenu
          x={intelligentContextMenu.x}
          y={intelligentContextMenu.y}
          type={intelligentContextMenu.type}
          context={intelligentContextMenu.context}
          suggestions={intelligentContextMenu.suggestions}
          onAction={handleContextualAction}
          onClose={() => setIntelligentContextMenu(null)}
        />
      )}
    </div>
  );
}