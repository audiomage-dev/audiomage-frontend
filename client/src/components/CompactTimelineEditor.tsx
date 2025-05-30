import { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { WaveformVisualization } from './WaveformVisualization';
import { AudioTrack, TransportState } from '../types/audio';
import { 
  Volume2, 
  VolumeX, 
  Radio, 
  Circle, 
  Edit3, 
  Trash2, 
  Copy, 
  Plus, 
  ZoomIn, 
  ZoomOut, 
  Move, 
  Hand, 
  MousePointer,
  Play,
  Pause,
  Square,
  SkipBack,
  SkipForward,
  Scissors,
  RotateCcw
} from 'lucide-react';

interface CompactTimelineEditorProps {
  tracks: AudioTrack[];
  transport: TransportState;
  onTrackMute: (trackId: string) => void;
  onTrackSolo: (trackId: string) => void;
  onTrackSelect?: (trackId: string) => void;
  onClipMove?: (clipId: string, fromTrackId: string, toTrackId: string, newStartTime: number) => void;
}

export function CompactTimelineEditor({ tracks, transport, onTrackMute, onTrackSolo, onTrackSelect, onClipMove }: CompactTimelineEditorProps) {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [scrollX, setScrollX] = useState(0);
  const [selectedTrackIds, setSelectedTrackIds] = useState<string[]>([]);
  const [currentTool, setCurrentTool] = useState<'select' | 'hand' | 'edit'>('select');
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionBox, setSelectionBox] = useState<{ startX: number; startY: number; endX: number; endY: number } | null>(null);
  
  // Audio selection state
  const [audioSelection, setAudioSelection] = useState<{
    trackId: string;
    startTime: number;
    endTime: number;
    startX: number;
    endX: number;
    trackIndex: number;
    isActive: boolean;
    isLocked: boolean;
  } | null>(null);

  // Clip dragging state
  const [draggingClip, setDraggingClip] = useState<{
    clipId: string;
    trackId: string;
    startX: number;
    startY: number;
    originalStartTime: number;
    originalTrackIndex: number;
    currentTrackIndex: number;
    currentOffsetX: number;
    currentOffsetY: number;
  } | null>(null);

  // Context menu states
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; trackIds: string[] } | null>(null);
  const [audioContextMenu, setAudioContextMenu] = useState<{ 
    x: number; 
    y: number; 
    selection: { trackId: string; startTime: number; endTime: number; trackName: string } 
  } | null>(null);
  
  const timelineRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  // Calculate dynamic timeline width based on clips
  const getTimelineWidth = useCallback(() => {
    let maxTime = 1200; // Default 20 minutes
    
    tracks.forEach(track => {
      track.clips?.forEach(clip => {
        const clipEndTime = clip.startTime + clip.duration;
        if (clipEndTime > maxTime) {
          maxTime = clipEndTime;
        }
      });
    });
    
    // Add 10% buffer and ensure minimum width
    const bufferedTime = maxTime * 1.1;
    const scaledWidth = bufferedTime * zoomLevel;
    
    return Math.max(1200, scaledWidth);
  }, [tracks, zoomLevel]);

  // Canvas drawing function for grid background
  const drawCanvasGrid = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw grid lines
    ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--border').trim() || '#e5e7eb';
    ctx.globalAlpha = 0.3;
    ctx.lineWidth = 1;

    // Vertical grid lines (time markers every 30 seconds)
    const timelineWidth = getTimelineWidth();
    const totalTime = timelineWidth / zoomLevel;
    const gridInterval = (30 / totalTime) * timelineWidth; // 30 seconds
    
    for (let i = 0; i < width; i += gridInterval) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, height);
      ctx.stroke();
    }

    // Horizontal track lines
    for (let i = 1; i < tracks.length; i++) {
      const y = i * 96;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    ctx.globalAlpha = 1;
  }, [tracks, zoomLevel, getTimelineWidth]);

  // Redraw canvas when dependencies change
  useEffect(() => {
    drawCanvasGrid();
  }, [drawCanvasGrid]);

  const handleTrackSelect = useCallback((trackId: string, e?: React.MouseEvent) => {
    if (e?.ctrlKey || e?.metaKey) {
      // Multi-select with Ctrl/Cmd
      setSelectedTrackIds(prev => 
        prev.includes(trackId) 
          ? prev.filter(id => id !== trackId)
          : [...prev, trackId]
      );
    } else {
      // Single select
      setSelectedTrackIds([trackId]);
    }
    onTrackSelect?.(trackId);
  }, [onTrackSelect]);

  const handleClipDragStart = useCallback((e: React.MouseEvent, clipId: string, trackId: string) => {
    e.stopPropagation();
    e.preventDefault();
    
    const track = tracks.find(t => t.id === trackId);
    const clip = track?.clips?.find(c => c.id === clipId);
    const trackIndex = tracks.findIndex(t => t.id === trackId);
    
    if (clip && trackIndex >= 0) {
      console.log('Starting clip drag:', clipId);
      
      const dragState = {
        clipId,
        trackId,
        startX: e.clientX,
        startY: e.clientY,
        originalStartTime: clip.startTime,
        originalTrackIndex: trackIndex,
        currentTrackIndex: trackIndex,
        currentOffsetX: 0,
        currentOffsetY: 0
      };
      
      setDraggingClip(dragState);
      setIsDragging(true);
      
      // Add document-level mouse event listeners for smooth dragging
      const handleDocumentMouseMove = (e: MouseEvent) => {
        const deltaX = e.clientX - dragState.startX;
        const deltaY = e.clientY - dragState.startY;
        
        // Calculate new track position
        const trackHeight = 96;
        const newTrackIndex = Math.max(0, Math.min(tracks.length - 1, 
          dragState.originalTrackIndex + Math.round(deltaY / trackHeight)
        ));
        
        setDraggingClip(prev => prev ? {
          ...prev,
          currentTrackIndex: newTrackIndex,
          currentOffsetX: deltaX,
          currentOffsetY: deltaY
        } : null);
      };
      
      const handleDocumentMouseUp = (e: MouseEvent) => {
        document.removeEventListener('mousemove', handleDocumentMouseMove);
        document.removeEventListener('mouseup', handleDocumentMouseUp);
        
        console.log('Mouse up - finalizing clip drag for:', dragState.clipId);
        
        // Finalize clip dragging and persist position
        const deltaX = e.clientX - dragState.startX;
        const deltaY = e.clientY - dragState.startY;
        
        console.log('Delta movement:', { deltaX, deltaY });
        
        const timelineWidth = getTimelineWidth();
        const totalTime = timelineWidth / zoomLevel;
        const deltaTime = (deltaX / timelineWidth) * totalTime;
        const newStartTime = Math.max(0, dragState.originalStartTime + deltaTime);
        
        console.log('Time calculation:', { 
          timelineWidth, 
          totalTime, 
          deltaTime, 
          originalStartTime: dragState.originalStartTime, 
          newStartTime 
        });
        
        const trackHeight = 96;
        const newTrackIndex = Math.max(0, Math.min(tracks.length - 1, 
          dragState.originalTrackIndex + Math.round(deltaY / trackHeight)
        ));
        
        const newTrackId = tracks[newTrackIndex]?.id;
        
        console.log('Track calculation:', { 
          originalTrackIndex: dragState.originalTrackIndex, 
          newTrackIndex, 
          originalTrackId: dragState.trackId, 
          newTrackId 
        });
        
        console.log(`Clip ${dragState.clipId} moved to ${newStartTime}s on track ${newTrackId} (index ${newTrackIndex})`);
        
        // Persist the clip movement to actual data
        if (onClipMove && newTrackId) {
          console.log('Calling onClipMove with:', { 
            clipId: dragState.clipId, 
            fromTrackId: dragState.trackId, 
            toTrackId: newTrackId, 
            newStartTime 
          });
          onClipMove(dragState.clipId, dragState.trackId, newTrackId, newStartTime);
        } else {
          console.error('onClipMove not called:', { onClipMove: !!onClipMove, newTrackId });
        }
        
        console.log('Setting dragging clip to null');
        setDraggingClip(null);
      };
      
      document.addEventListener('mousemove', handleDocumentMouseMove);
      document.addEventListener('mouseup', handleDocumentMouseUp);
    }
  }, [tracks, onClipMove, zoomLevel, getTimelineWidth]);

  const handleAudioSelectionStart = useCallback((e: React.MouseEvent, trackId: string, trackIndex: number) => {
    if (e.button !== 0) return; // Only left click
    
    const rect = e.currentTarget.getBoundingClientRect();
    const startX = e.clientX - rect.left + scrollX;
    const timelineWidth = getTimelineWidth();
    const totalTime = timelineWidth / zoomLevel;
    const startTime = (startX / timelineWidth) * totalTime;
    
    console.log('Starting audio selection:', { startX, startTime, trackId });
    
    setAudioSelection({
      trackId,
      startTime,
      endTime: startTime,
      startX,
      endX: startX,
      trackIndex,
      isActive: true,
      isLocked: false
    });
  }, [scrollX, zoomLevel]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left click
    
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    
    // Start selection box if using select tool
    if (currentTool === 'select') {
      setIsSelecting(true);
      setSelectionBox({
        startX: e.clientX,
        startY: e.clientY,
        endX: e.clientX,
        endY: e.clientY
      });
    }
  }, [currentTool]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    // Handle clip dragging first - this is the priority
    if (draggingClip) {
      const deltaX = e.clientX - draggingClip.startX;
      const deltaY = e.clientY - draggingClip.startY;
      
      // Calculate new time position
      const timelineWidth = getTimelineWidth();
      const totalTime = timelineWidth / zoomLevel;
      const deltaTime = (deltaX / timelineWidth) * totalTime;
      const newTime = Math.max(0, draggingClip.originalStartTime + deltaTime);
      
      // Calculate new track position
      const trackHeight = 96;
      const newTrackIndex = Math.max(0, Math.min(tracks.length - 1, 
        draggingClip.originalTrackIndex + Math.round(deltaY / trackHeight)
      ));
      
      // Update dragging state with new track and current offsets
      setDraggingClip(prev => prev ? {
        ...prev,
        currentTrackIndex: newTrackIndex,
        currentOffsetX: deltaX,
        currentOffsetY: deltaY
      } : null);
      
      console.log('Dragging clip to time:', newTime, 'track:', newTrackIndex, 'offsets:', deltaX, deltaY);
      return; // Exit early when dragging clip
    }
    
    if (!isDragging) return;

    if (currentTool === 'hand') {
      // Hand tool - pan the timeline
      const deltaX = e.clientX - dragStart.x;
      setScrollX(prev => Math.max(0, prev - deltaX));
      setDragStart({ x: e.clientX, y: e.clientY });
    } else if (isSelecting && selectionBox) {
      // Update selection box
      setSelectionBox(prev => prev ? {
        ...prev,
        endX: e.clientX,
        endY: e.clientY
      } : null);
      
      // Calculate selected tracks based on selection box
      if (selectionBox) {
        const endY = e.clientY;
        const minY = Math.min(selectionBox.startY, endY);
        const maxY = Math.max(selectionBox.startY, endY);
        
        // Calculate which tracks are in selection
        const selectedIds = tracks.filter((_, index) => {
          const trackTop = index * 96;
          const trackBottom = trackTop + 96;
          return trackTop < maxY && trackBottom > minY;
        }).map(t => t.id);
        
        setSelectedTrackIds(selectedIds);
      }
    }

    // Update audio selection if active
    if (audioSelection && audioSelection.isActive && !audioSelection.isLocked) {
      const rect = timelineRef.current?.getBoundingClientRect();
      if (rect) {
        const currentX = e.clientX - rect.left + scrollX;
        const timelineWidth = getTimelineWidth();
        const totalTime = timelineWidth / zoomLevel;
        const currentTime = (currentX / timelineWidth) * totalTime;
        
        setAudioSelection(prev => prev ? {
          ...prev,
          endTime: currentTime,
          endX: currentX
        } : null);
      }
    }
  }, [isDragging, dragStart, zoomLevel, tracks.length, isSelecting, selectionBox, tracks, audioSelection, scrollX, draggingClip, getTimelineWidth]);

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    setIsDragging(false);
    setIsSelecting(false);
    setSelectionBox(null);
    
    // Finalize clip dragging if in progress
    if (draggingClip) {
      const deltaX = e.clientX - draggingClip.startX;
      const deltaY = e.clientY - draggingClip.startY;
      
      const timelineWidth = getTimelineWidth();
      const totalTime = timelineWidth / zoomLevel;
      const deltaTime = (deltaX / timelineWidth) * totalTime;
      const newStartTime = Math.max(0, draggingClip.originalStartTime + deltaTime);
      
      const trackHeight = 96;
      const newTrackIndex = Math.max(0, Math.min(tracks.length - 1, 
        draggingClip.originalTrackIndex + Math.round(deltaY / trackHeight)
      ));
      
      const newTrackId = tracks[newTrackIndex]?.id;
      
      console.log(`Clip ${draggingClip.clipId} moved to ${newStartTime}s on track ${newTrackId} (index ${newTrackIndex})`);
      
      // Persist the clip movement to actual data
      if (onClipMove && newTrackId) {
        onClipMove(draggingClip.clipId, draggingClip.trackId, newTrackId, newStartTime);
      }
      
      setDraggingClip(null);
    }
    
    // Finalize audio selection if it exists and has a meaningful duration
    if (audioSelection && Math.abs(audioSelection.endTime - audioSelection.startTime) > 0.1) { // Minimum 0.1 second selection
      // Normalize the selection coordinates and keep it locked
      const startTime = Math.min(audioSelection.startTime, audioSelection.endTime);
      const endTime = Math.max(audioSelection.startTime, audioSelection.endTime);
      const startX = Math.min(audioSelection.startX, audioSelection.endX);
      const endX = Math.max(audioSelection.startX, audioSelection.endX);
      
      setAudioSelection(prev => prev ? {
        ...prev,
        startTime,
        endTime,
        startX,
        endX,
        isActive: false,
        isLocked: true
      } : null);
      
      console.log('Audio selection finalized:', { startTime, endTime });
    } else if (audioSelection) {
      // Selection too small, clear it
      console.log('Selection too small, clearing:', audioSelection);
      setAudioSelection(null);
    }
  }, [audioSelection, draggingClip, zoomLevel]);

  const handleScroll = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      // Zoom with Ctrl+scroll
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setZoomLevel(prev => Math.max(0.1, Math.min(5, prev + delta)));
    } else {
      // Horizontal scroll
      setScrollX(prev => Math.max(0, prev + e.deltaX));
    }
  }, []);

  const handleTrackRightClick = useCallback((e: React.MouseEvent, trackId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    // If right-clicking on a non-selected track, select it
    if (!selectedTrackIds.includes(trackId)) {
      setSelectedTrackIds([trackId]);
    }
    
    // Use current selection if multiple tracks are selected
    const targetTracks = selectedTrackIds.includes(trackId) ? selectedTrackIds : [trackId];
    
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      trackIds: targetTracks
    });
  }, [selectedTrackIds]);

  const handleAudioRightClick = useCallback((e: React.MouseEvent, trackId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (audioSelection && audioSelection.trackId === trackId && audioSelection.isLocked) {
      const track = tracks.find(t => t.id === trackId);
      setAudioContextMenu({
        x: e.clientX,
        y: e.clientY,
        selection: {
          trackId,
          startTime: audioSelection.startTime,
          endTime: audioSelection.endTime,
          trackName: track?.name || 'Unknown Track'
        }
      });
    }
  }, [audioSelection, tracks]);

  // Close context menus when clicking elsewhere
  useEffect(() => {
    const handleClick = () => {
      setContextMenu(null);
      setAudioContextMenu(null);
    };
    
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  return (
    <div className="flex h-full bg-[var(--background)]">
      {/* Left Sidebar - Track Headers */}
      <div className="w-64 border-r border-[var(--border)] flex flex-col">
        {/* Header */}
        <div className="h-8 border-b border-[var(--border)] bg-[var(--muted)]/30">
          <div className="flex items-center justify-between px-3 h-full">
            <span className="text-xs font-medium text-[var(--muted-foreground)]">TRACKS</span>
            <div className="flex items-center space-x-1">
              <Button
                onClick={() => setCurrentTool('select')}
                variant="ghost"
                size="sm"
                className={`h-5 w-5 p-0 ${currentTool === 'select' ? 'bg-[var(--accent)]' : ''}`}
              >
                <MousePointer className="w-3 h-3" />
              </Button>
              <Button
                onClick={() => setCurrentTool('hand')}
                variant="ghost"
                size="sm"
                className={`h-5 w-5 p-0 ${currentTool === 'hand' ? 'bg-[var(--accent)]' : ''}`}
              >
                <Hand className="w-3 h-3" />
              </Button>
              <Button
                onClick={() => setCurrentTool('edit')}
                variant="ghost"
                size="sm"
                className={`h-5 w-5 p-0 ${currentTool === 'edit' ? 'bg-[var(--accent)]' : ''}`}
              >
                <Edit3 className="w-3 h-3" />
              </Button>
            </div>
          </div>
          
          <div className="flex items-center justify-between px-3 py-1 border-t border-[var(--border)]">
            <div className="flex items-center space-x-1">
              <Button
                onClick={() => setZoomLevel(prev => Math.max(0.1, prev - 0.2))}
                variant="ghost"
                size="sm"
                className="h-5 w-5 p-0"
              >
                <ZoomOut className="w-3 h-3" />
              </Button>
              <span className="text-xs text-[var(--muted-foreground)] min-w-[3rem] text-center">
                {Math.round(zoomLevel * 100)}%
              </span>
              <Button
                onClick={() => setZoomLevel(prev => Math.min(5, prev + 0.2))}
                variant="ghost"
                size="sm"
                className="h-5 w-5 p-0"
              >
                <ZoomIn className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>
        
        <div className="flex-1 overflow-hidden">
          {tracks.map((track, index) => (
            <div
              key={track.id}
              className={`h-24 border-b border-[var(--border)] px-3 py-2 cursor-pointer transition-colors group ${
                selectedTrackIds.includes(track.id) 
                  ? 'bg-[var(--accent)] border-l-2 border-l-[var(--primary)]' 
                  : 'hover:bg-[var(--accent)]/50'
              }`}
              onClick={(e) => handleTrackSelect(track.id, e)}
              onContextMenu={(e) => handleTrackRightClick(e, track.id)}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center space-x-2 min-w-0">
                  <div 
                    className="w-2 h-2 rounded-sm flex-shrink-0" 
                    style={{ backgroundColor: track.color }}
                  ></div>
                  <span className="text-sm font-medium text-[var(--foreground)] truncate">
                    {track.name}
                  </span>
                  {track.type === 'ai-generated' && (
                    <div className="w-1.5 h-1.5 bg-[var(--purple)] rounded-full"></div>
                  )}
                </div>
                <div className="flex items-center space-x-1">
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      onTrackMute(track.id);
                    }}
                    variant="ghost"
                    size="sm"
                    className={`h-5 w-5 p-0 rounded text-xs ${
                      track.muted 
                        ? 'bg-[var(--red)] text-white' 
                        : 'hover:bg-[var(--accent)] opacity-60 group-hover:opacity-100'
                    }`}
                  >
                    M
                  </Button>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      onTrackSolo(track.id);
                    }}
                    variant="ghost"
                    size="sm"
                    className={`h-5 w-5 p-0 rounded text-xs ${
                      track.soloed 
                        ? 'bg-[var(--yellow)] text-black' 
                        : 'hover:bg-[var(--accent)] opacity-60 group-hover:opacity-100'
                    }`}
                  >
                    S
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)]">
                <span>{track.type}</span>
                <span>{track.clips?.length || 0} clips</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Side - Timeline */}
      <div className="flex-1 flex flex-col">
        {/* Timeline Header with Ruler */}
        <div className="h-8 border-b border-[var(--border)] bg-[var(--muted)]/30 relative overflow-hidden">
          <div 
            className="absolute inset-0 flex items-center"
            style={{ 
              width: `${Math.max(1200, 1200 * zoomLevel)}px`,
              transform: `translateX(-${scrollX}px)`
            }}
          >
            {Array.from({ length: Math.ceil(1200 / 60) + 1 }).map((_, i) => {
              const timeSeconds = i * 60;
              const minutes = Math.floor(timeSeconds / 60);
              const seconds = timeSeconds % 60;
              const position = (timeSeconds / 1200) * 100;
              
              return (
                <div
                  key={i}
                  className="absolute text-xs text-[var(--muted-foreground)] font-mono"
                  style={{ left: `${position}%` }}
                >
                  {minutes}:{seconds.toString().padStart(2, '0')}
                </div>
              );
            })}
          </div>
        </div>

        {/* Timeline Content with Canvas Grid */}
        <div 
          className="flex-1 overflow-auto scrollbar-thin select-none mt-8" 
          ref={timelineRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onWheel={handleScroll}
          onMouseLeave={() => {
            setIsDragging(false);
            setIsSelecting(false);
            setSelectionBox(null);
            setDraggingClip(null);
          }}
          style={{ cursor: currentTool === 'hand' ? 'grab' : isDragging ? 'grabbing' : 'default' }}
        >
          <div 
            className="relative" 
            style={{ 
              width: `${getTimelineWidth()}px`, 
              height: `${tracks.length * 96}px`,
              transform: `translateX(-${scrollX}px)`
            }}
          >
            {/* Grid lines inside timeline content */}
            <canvas
              ref={canvasRef}
              className="absolute top-0 left-0 pointer-events-none z-0"
              width={getTimelineWidth()}
              height={tracks.length * 96}
            />
            {tracks.map((track, index) => (
              <div
                key={track.id}
                className={`absolute left-0 right-0 h-24 transition-colors ${
                  selectedTrackIds.includes(track.id) 
                    ? 'bg-[var(--accent)]/20' 
                    : draggingClip && draggingClip.currentTrackIndex === index
                      ? 'bg-[var(--primary)]/20 border-2 border-[var(--primary)] border-dashed'
                      : 'hover:bg-[var(--muted)]/20'
                }`}
                style={{ top: `${index * 96}px` }}
                onClick={(e) => handleTrackSelect(track.id, e)}
                onContextMenu={(e) => handleTrackRightClick(e, track.id)}
              >
                {/* Audio Clips */}
                <div 
                  className="h-full relative cursor-crosshair"
                  onMouseDown={(e) => handleAudioSelectionStart(e, track.id, index)}
                  onContextMenu={(e) => handleAudioRightClick(e, track.id)}
                >
                  {track.clips?.map((clip) => {
                    const timelineWidth = getTimelineWidth();
                    const totalTime = timelineWidth / zoomLevel;
                    const clipStartX = (clip.startTime / totalTime) * timelineWidth;
                    const clipWidth = (clip.duration / totalTime) * timelineWidth;
                    
                    return (
                      <div
                        key={clip.id}
                        className={`absolute top-1 h-20 rounded-md shadow-md border border-opacity-30 cursor-move hover:shadow-lg transition-all duration-200 ${
                          draggingClip?.clipId === clip.id ? 'opacity-60 scale-105 z-50' : 'z-5'
                        }`}
                        style={{
                          left: `${clipStartX}px`,
                          width: `${clipWidth}px`,
                          backgroundColor: clip.color,
                          borderColor: clip.color,
                          transform: draggingClip?.clipId === clip.id 
                            ? `translate(${draggingClip.currentOffsetX}px, ${draggingClip.currentOffsetY}px)` 
                            : 'none',
                          zIndex: draggingClip?.clipId === clip.id ? 50 : 5
                        }}
                        onMouseDown={(e) => handleClipDragStart(e, clip.id, track.id)}
                        onDoubleClick={() => console.log('Edit clip:', clip.name)}
                      >
                        {/* Clip Header */}
                        <div className="h-5 bg-black bg-opacity-20 rounded-t-md px-2 flex items-center justify-between text-xs text-white font-medium">
                          <span className="truncate flex-1">{clip.name}</span>
                          <span className="text-xs opacity-75">{clip.duration.toFixed(1)}s</span>
                        </div>
                        
                        {/* Line Waveform */}
                        <div className="h-14 px-2 py-1 relative">
                          {clip.waveformData && (
                            <svg className="w-full h-full" viewBox={`0 0 ${clipWidth} 52`} preserveAspectRatio="none">
                              <path
                                d={`M 0,26 ${clip.waveformData.map((amplitude, i) => {
                                  const x = (i / (clip.waveformData!.length - 1)) * clipWidth;
                                  const y = 26 - ((amplitude - 50) / 50) * 25;
                                  return `L ${x},${y}`;
                                }).join(' ')}`}
                                stroke="rgba(255,255,255,0.8)"
                                strokeWidth="1"
                                fill="none"
                                vectorEffect="non-scaling-stroke"
                              />
                              <line
                                x1="0"
                                y1="26"
                                x2={clipWidth}
                                y2="26"
                                stroke="rgba(255,255,255,0.2)"
                                strokeWidth="0.5"
                                vectorEffect="non-scaling-stroke"
                              />
                            </svg>
                          )}
                        </div>
                        
                        {/* Fade In/Out Indicators */}
                        {clip.fadeIn && clip.fadeIn > 0 && (
                          <div 
                            className="absolute top-0 left-0 h-full bg-gradient-to-r from-transparent to-white opacity-20"
                            style={{ width: `${(clip.fadeIn / clip.duration) * 100}%` }}
                          />
                        )}
                        {clip.fadeOut && clip.fadeOut > 0 && (
                          <div 
                            className="absolute top-0 right-0 h-full bg-gradient-to-l from-transparent to-white opacity-20"
                            style={{ width: `${(clip.fadeOut / clip.duration) * 100}%` }}
                          />
                        )}
                        
                        {/* Resize Handles */}
                        <div className="absolute left-0 top-0 w-2 h-full cursor-ew-resize bg-white bg-opacity-0 hover:bg-opacity-30 transition-colors" />
                        <div className="absolute right-0 top-0 w-2 h-full cursor-ew-resize bg-white bg-opacity-0 hover:bg-opacity-30 transition-colors" />
                      </div>
                    );
                  })}
                  
                  {/* Audio Selection Overlay */}
                  {audioSelection && audioSelection.trackId === track.id && (
                    <div
                      className="absolute top-0 bottom-0 bg-[var(--primary)]/25 border-2 border-[var(--primary)] pointer-events-none rounded-sm"
                      style={{
                        left: `${audioSelection.startX}px`,
                        width: `${audioSelection.endX - audioSelection.startX}px`,
                        zIndex: 10
                      }}
                    >
                      <div className="absolute top-0 left-0 right-0 h-5 bg-[var(--primary)]/60 flex items-center justify-center border-b border-[var(--primary)]">
                        <span className="text-xs text-white font-mono font-semibold">
                          {(audioSelection.endTime - audioSelection.startTime).toFixed(2)}s
                        </span>
                      </div>
                      
                      {/* Selection handles */}
                      <div className="absolute left-0 top-0 w-1 h-full bg-[var(--primary)] cursor-ew-resize" />
                      <div className="absolute right-0 top-0 w-1 h-full bg-[var(--primary)] cursor-ew-resize" />
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {/* Playhead */}
            <div 
              className="absolute top-0 bottom-0 w-0.5 bg-[var(--primary)] z-20 pointer-events-none"
              style={{ 
                left: `${(transport.currentTime / (getTimelineWidth() / zoomLevel)) * getTimelineWidth()}px` 
              }}
            />
          </div>
        </div>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="fixed bg-[var(--background)] border border-[var(--border)] rounded-lg shadow-xl py-1 z-50 min-w-32"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-2 py-1 text-xs text-[var(--muted-foreground)] border-b border-[var(--border)]">
            {contextMenu.trackIds.length === 1 ? '1 track selected' : `${contextMenu.trackIds.length} tracks selected`}
          </div>
          {[
            { label: 'Duplicate', icon: Copy, action: 'duplicate' },
            { label: 'Group', icon: Plus, action: 'group' },
            { label: 'Mute All', icon: VolumeX, action: 'mute' },
            { label: 'Solo All', icon: Radio, action: 'solo' },
            { label: 'Rename', icon: Edit3, action: 'rename', disabled: contextMenu.trackIds.length > 1 },
            { label: 'Delete', icon: Trash2, action: 'delete', destructive: true },
          ].map(({ label, icon: Icon, action, disabled, destructive }) => (
            <button
              key={label}
              disabled={disabled}
              onClick={() => {
                console.log(`${action} tracks:`, contextMenu.trackIds);
                if (action === 'mute') {
                  contextMenu.trackIds.forEach(id => onTrackMute(id));
                } else if (action === 'solo') {
                  contextMenu.trackIds.forEach(id => onTrackSolo(id));
                }
                setContextMenu(null);
              }}
              className={`w-full px-2 py-1 text-left text-xs flex items-center space-x-2 transition-colors ${
                disabled 
                  ? 'opacity-50 cursor-not-allowed' 
                  : destructive 
                    ? 'hover:bg-[var(--red)]/10 hover:text-[var(--red)]' 
                    : 'hover:bg-[var(--accent)]'
              }`}
            >
              <Icon className="w-3 h-3" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Audio Selection Context Menu */}
      {audioContextMenu && (
        <div
          className="fixed bg-[var(--background)] border border-[var(--border)] rounded-lg shadow-xl py-1 z-50 min-w-48"
          style={{ left: audioContextMenu.x, top: audioContextMenu.y }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-3 py-2 text-xs text-[var(--muted-foreground)] border-b border-[var(--border)]">
            <div className="font-medium">{audioContextMenu.selection.trackName}</div>
            <div className="font-mono">
              {audioContextMenu.selection.startTime.toFixed(2)}s - {audioContextMenu.selection.endTime.toFixed(2)}s
            </div>
            <div className="text-[var(--primary)]">
              Duration: {(audioContextMenu.selection.endTime - audioContextMenu.selection.startTime).toFixed(2)}s
            </div>
          </div>
          
          {[
            { label: 'Cut', icon: Scissors, action: 'cut', shortcut: 'Ctrl+X' },
            { label: 'Copy', icon: Copy, action: 'copy', shortcut: 'Ctrl+C' },
            { label: 'Delete', icon: Trash2, action: 'delete', destructive: true },
            { separator: true },
            { label: 'Fade In', icon: SkipForward, action: 'fade-in' },
            { label: 'Fade Out', icon: SkipBack, action: 'fade-out' },
            { label: 'Normalize', icon: ZoomIn, action: 'normalize' },
            { separator: true },
            { label: 'Reverse', icon: RotateCcw, action: 'reverse' },
            { label: 'Speed Change', icon: Move, action: 'speed' },
            { separator: true },
            { label: 'AI Enhance', icon: Plus, action: 'ai-enhance', ai: true },
            { label: 'AI Remove Noise', icon: VolumeX, action: 'ai-denoise', ai: true },
            { label: 'AI Separate Stems', icon: Radio, action: 'ai-stems', ai: true },
          ].map((item, index) => {
            if (item.separator) {
              return <div key={index} className="border-t border-[var(--border)] my-1" />;
            }
            
            const { label, icon: Icon, action, shortcut, destructive, ai } = item;
            return (
              <button
                key={label}
                onClick={() => {
                  console.log(`${action} audio selection:`, audioContextMenu.selection);
                  setAudioContextMenu(null);
                  setAudioSelection(null);
                }}
                className={`w-full px-3 py-1.5 text-left text-xs flex items-center justify-between transition-colors ${
                  destructive 
                    ? 'hover:bg-[var(--red)]/10 hover:text-[var(--red)]' 
                    : ai
                      ? 'hover:bg-[var(--purple)]/10 hover:text-[var(--purple)]'
                      : 'hover:bg-[var(--accent)]'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Icon className="w-3 h-3" />
                  <span>{label}</span>
                </div>
                {shortcut && <span className="text-[var(--muted-foreground)] text-xs">{shortcut}</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}