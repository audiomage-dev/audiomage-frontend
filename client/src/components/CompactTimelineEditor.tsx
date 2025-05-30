import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { WaveformVisualization } from './WaveformVisualization';
import { AudioTrack, TransportState } from '../types/audio';
import { 
  Volume2, 
  VolumeX, 
  Radio, 
  Circle, 
  Edit3, 
  Copy, 
  Trash2, 
  MoreHorizontal,
  Play,
  Pause,
  RotateCcw,
  Scissors,
  Move,
  ZoomIn,
  ZoomOut,
  Plus,
  Minus,
  SkipForward,
  SkipBack
} from 'lucide-react';

interface CompactTimelineEditorProps {
  tracks: AudioTrack[];
  transport: TransportState;
  onTrackMute: (trackId: string) => void;
  onTrackSolo: (trackId: string) => void;
  onTrackSelect?: (trackId: string) => void;
}

export function CompactTimelineEditor({ tracks, transport, onTrackMute, onTrackSolo, onTrackSelect }: CompactTimelineEditorProps) {
  const [selectedTrackIds, setSelectedTrackIds] = useState<string[]>([]);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; trackIds: string[] } | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [currentTool, setCurrentTool] = useState<'select' | 'cut' | 'zoom' | 'hand'>('select');
  const [showChatBox, setShowChatBox] = useState(false);
  const [chatPrompt, setChatPrompt] = useState('');
  const [scrollX, setScrollX] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionBox, setSelectionBox] = useState<{ startX: number; startY: number; endX: number; endY: number } | null>(null);
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
  
  const [draggingClip, setDraggingClip] = useState<{
    clipId: string;
    trackId: string;
    startX: number;
    startY: number;
    originalStartTime: number;
  } | null>(null);
  const [audioContextMenu, setAudioContextMenu] = useState<{ 
    x: number; 
    y: number; 
    selection: { trackId: string; startTime: number; endTime: number; trackName: string } 
  } | null>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  const handleTrackSelect = useCallback((trackId: string, e?: React.MouseEvent) => {
    if (e?.ctrlKey || e?.metaKey) {
      // Multi-select with Ctrl/Cmd
      setSelectedTrackIds(prev => 
        prev.includes(trackId) 
          ? prev.filter(id => id !== trackId)
          : [...prev, trackId]
      );
    } else if (e?.shiftKey && selectedTrackIds.length > 0) {
      // Range select with Shift
      const currentIndex = tracks.findIndex(t => t.id === trackId);
      const lastSelectedIndex = tracks.findIndex(t => t.id === selectedTrackIds[selectedTrackIds.length - 1]);
      const start = Math.min(currentIndex, lastSelectedIndex);
      const end = Math.max(currentIndex, lastSelectedIndex);
      const rangeIds = tracks.slice(start, end + 1).map(t => t.id);
      setSelectedTrackIds(rangeIds);
    } else {
      // Single select
      setSelectedTrackIds([trackId]);
      // Notify parent component of track selection
      onTrackSelect?.(trackId);
    }
  }, [tracks, selectedTrackIds, onTrackSelect]);

  const handleTrackRightClick = useCallback((e: React.MouseEvent, trackId: string) => {
    e.preventDefault();
    const trackIds = selectedTrackIds.includes(trackId) ? selectedTrackIds : [trackId];
    if (!selectedTrackIds.includes(trackId)) {
      setSelectedTrackIds([trackId]);
    }
    setContextMenu({ x: e.clientX, y: e.clientY, trackIds });
  }, [selectedTrackIds]);

  const handleZoomIn = useCallback(() => {
    setZoomLevel(prev => Math.min(prev * 1.5, 8));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoomLevel(prev => Math.max(prev / 1.5, 0.25));
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (currentTool === 'hand' || e.button === 1) { // Middle mouse button or hand tool
      setIsDragging(true);
      setDragStart({ x: e.clientX + scrollX, y: e.clientY + scrollY });
      e.preventDefault();
    } else if (currentTool === 'select' && e.button === 0) { // Left click for selection
      const rect = timelineRef.current?.getBoundingClientRect();
      if (rect) {
        // Clear existing audio selection when clicking elsewhere
        setAudioSelection(null);
        setIsSelecting(true);
        const startX = e.clientX - rect.left;
        const startY = e.clientY - rect.top;
        setSelectionBox({ startX, startY, endX: startX, endY: startY });
        setContextMenu(null);
        setAudioContextMenu(null);
      }
    }
  }, [currentTool, scrollX, scrollY]);

  const handleAudioSelectionStart = useCallback((e: React.MouseEvent, trackId: string, trackIndex: number) => {
    if (currentTool === 'select') {
      e.stopPropagation();
      const rect = timelineRef.current?.getBoundingClientRect();
      if (rect) {
        const startX = e.clientX - rect.left + scrollX;
        const timelineWidth = Math.max(1200, 1200 * zoomLevel);
        const startTime = (startX / timelineWidth) * 1200; // 20 minutes total
        
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
        setContextMenu(null);
        setAudioContextMenu(null);
      }
    }
  }, [currentTool, scrollX, zoomLevel]);

  const handleClipDragStart = useCallback((e: React.MouseEvent, clipId: string, trackId: string) => {
    e.stopPropagation();
    const rect = timelineRef.current?.getBoundingClientRect();
    if (rect) {
      const track = tracks.find(t => t.id === trackId);
      const clip = track?.clips?.find(c => c.id === clipId);
      if (clip) {
        setDraggingClip({
          clipId,
          trackId,
          startX: e.clientX,
          startY: e.clientY,
          originalStartTime: clip.startTime
        });
      }
    }
  }, [tracks]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      const deltaX = dragStart.x - e.clientX;
      const deltaY = dragStart.y - e.clientY;
      
      const maxScrollX = Math.max(0, (100 * zoomLevel - 100) * (timelineRef.current?.clientWidth || 800) / 100);
      const maxScrollY = Math.max(0, tracks.length * 48 - (timelineRef.current?.clientHeight || 400));
      
      setScrollX(Math.max(0, Math.min(maxScrollX, deltaX)));
      setScrollY(Math.max(0, Math.min(maxScrollY, deltaY)));
    } else if (isSelecting && selectionBox) {
      const rect = timelineRef.current?.getBoundingClientRect();
      if (rect) {
        const endX = e.clientX - rect.left;
        const endY = e.clientY - rect.top;
        setSelectionBox(prev => prev ? { ...prev, endX, endY } : null);
        
        // Calculate which tracks are in selection
        const minY = Math.min(selectionBox.startY, endY);
        const maxY = Math.max(selectionBox.startY, endY);
        const selectedIds = tracks.filter((_, index) => {
          const trackTop = index * 48;
          const trackBottom = trackTop + 48;
          return trackTop < maxY && trackBottom > minY;
        }).map(t => t.id);
        
        setSelectedTrackIds(selectedIds);
      }
    } else if (draggingClip) {
      // Handle clip dragging
      const deltaX = e.clientX - draggingClip.startX;
      const timelineWidth = Math.max(1200, 1200 * zoomLevel);
      const deltaTime = (deltaX / timelineWidth) * 1200;
      const newStartTime = Math.max(0, draggingClip.originalStartTime + deltaTime);
      
      console.log('Dragging clip to time:', newStartTime);
      
    } else if (audioSelection && !audioSelection.isLocked) {
      const rect = timelineRef.current?.getBoundingClientRect();
      if (rect) {
        const currentX = e.clientX - rect.left + scrollX;
        const timelineWidth = Math.max(1200, 1200 * zoomLevel);
        const currentTime = (currentX / timelineWidth) * 1200;
        
        console.log('Updating audio selection:', { currentX, currentTime });
        
        setAudioSelection(prev => prev ? {
          ...prev,
          endTime: currentTime,
          endX: currentX,
          isActive: true,
          isLocked: false
        } : null);
      }
    }
  }, [isDragging, dragStart, zoomLevel, tracks.length, isSelecting, selectionBox, tracks, audioSelection, scrollX, draggingClip]);

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    setIsDragging(false);
    setIsSelecting(false);
    setSelectionBox(null);
    
    // Finalize clip dragging if in progress
    if (draggingClip) {
      const deltaX = e.clientX - draggingClip.startX;
      const timelineWidth = Math.max(1200, 1200 * zoomLevel);
      const deltaTime = (deltaX / timelineWidth) * 1200;
      const newStartTime = Math.max(0, draggingClip.originalStartTime + deltaTime);
      
      console.log(`Clip ${draggingClip.clipId} moved to ${newStartTime}s`);
      
      // Here you would update the actual clip position in your data
      // For now, just log the final position
      setDraggingClip(null);
    }
    
    // Finalize audio selection if it exists and has a meaningful duration
    if (audioSelection && Math.abs(audioSelection.endTime - audioSelection.startTime) > 0.1) { // Minimum 0.1 second selection
      // Normalize the selection coordinates and keep it locked
      const normalizedSelection = {
        ...audioSelection,
        startTime: Math.min(audioSelection.startTime, audioSelection.endTime),
        endTime: Math.max(audioSelection.startTime, audioSelection.endTime),
        startX: Math.min(audioSelection.startX, audioSelection.endX),
        endX: Math.max(audioSelection.startX, audioSelection.endX),
        isActive: true,
        isLocked: true // Mark as locked to persist after mouse release
      };
      
      setAudioSelection(normalizedSelection);
      console.log('Audio selection locked:', normalizedSelection);
    } else if (audioSelection) {
      // Clear selection if it's too small
      console.log('Selection too small, clearing:', audioSelection);
      setAudioSelection(null);
    }
  }, [audioSelection, draggingClip, zoomLevel]);

  const handleAudioRightClick = useCallback((e: React.MouseEvent, trackId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (audioSelection && audioSelection.trackId === trackId) {
      const track = tracks.find(t => t.id === trackId);
      if (track) {
        setAudioContextMenu({
          x: e.clientX,
          y: e.clientY,
          selection: {
            trackId,
            startTime: Math.min(audioSelection.startTime, audioSelection.endTime),
            endTime: Math.max(audioSelection.startTime, audioSelection.endTime),
            trackName: track.name
          }
        });
      }
    }
  }, [audioSelection, tracks]);

  const handleScroll = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey) {
      // Zoom with Ctrl+Wheel
      e.preventDefault();
      if (e.deltaY < 0) {
        handleZoomIn();
      } else {
        handleZoomOut();
      }
    } else if (e.shiftKey) {
      // Horizontal scroll with Shift+Wheel
      e.preventDefault();
      const maxScrollX = Math.max(0, (100 * zoomLevel - 100) * (timelineRef.current?.clientWidth || 800) / 100);
      setScrollX(prev => Math.max(0, Math.min(maxScrollX, prev + e.deltaY)));
    } else {
      // Vertical scroll
      e.preventDefault();
      const maxScrollY = Math.max(0, tracks.length * 48 - (timelineRef.current?.clientHeight || 400));
      setScrollY(prev => Math.max(0, Math.min(maxScrollY, prev + e.deltaY)));
    }
  }, [handleZoomIn, handleZoomOut, zoomLevel, tracks.length]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderTimelineRuler = () => {
    const duration = 1200; // 20 minutes for long audio support
    const stepInterval = Math.max(5, 30 / zoomLevel); // Dynamic step based on zoom
    const steps = Math.floor(duration / stepInterval);
    const markers = [];
    
    for (let i = 0; i <= steps; i++) {
      const time = i * stepInterval;
      const position = (time / duration) * 100;
      
      // Only show markers that are visible in current scroll position
      const markerScreenPos = position * zoomLevel - (scrollX / window.innerWidth) * 100;
      if (markerScreenPos >= -10 && markerScreenPos <= 110) {
        markers.push(
          <div key={i} className="absolute top-0 flex flex-col items-center" style={{ left: `${position}%` }}>
            <div className="w-px h-3 bg-[var(--border)]"></div>
            <span className="text-xs text-[var(--muted-foreground)] mt-0.5">{formatTime(time)}</span>
          </div>
        );
      }
    }
    
    return markers;
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Ultra-Compact Toolbar */}
      <div className="bg-[var(--muted)] border-b border-[var(--border)] px-2 py-1 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="flex space-x-0.5">
            {[
              { tool: 'select', icon: Move, active: currentTool === 'select' },
              { tool: 'cut', icon: Scissors, active: currentTool === 'cut' },
              { tool: 'zoom', icon: ZoomIn, active: currentTool === 'zoom' },
              { tool: 'hand', icon: SkipForward, active: currentTool === 'hand' },
            ].map(({ tool, icon: Icon, active }) => (
              <Button
                key={tool}
                variant="ghost"
                size="sm"
                onClick={() => setCurrentTool(tool as any)}
                className={`h-5 w-5 p-0 ${active ? 'bg-[var(--primary)] text-white' : 'hover:bg-[var(--accent)]'}`}
                title={tool === 'hand' ? 'Hand Tool (drag to pan)' : tool}
              >
                <Icon className="w-3 h-3" />
              </Button>
            ))}
          </div>
          
          <div className="h-3 border-l border-[var(--border)]"></div>
          
          <div className="flex items-center space-x-1">
            <Button variant="ghost" size="sm" onClick={handleZoomOut} className="h-5 w-5 p-0">
              <Minus className="w-3 h-3" />
            </Button>
            <span className="text-xs font-mono w-8 text-center">{Math.round(zoomLevel * 100)}%</span>
            <Button variant="ghost" size="sm" onClick={handleZoomIn} className="h-5 w-5 p-0">
              <Plus className="w-3 h-3" />
            </Button>
          </div>
          
          <div className="flex items-center space-x-1 text-xs">
            <span>Grid:</span>
            <select className="bg-[var(--input)] border-0 rounded px-1 py-0 text-xs h-4">
              <option>1/8</option>
              <option>1/4</option>
              <option>1/2</option>
            </select>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="text-xs text-[var(--muted-foreground)] font-mono">
            {formatTime(transport.currentTime)} / {formatTime(1200)}
          </div>
          <div className="text-xs text-[var(--muted-foreground)]">
            Scroll: {Math.round(scrollX)}px, {Math.round(scrollY)}px
          </div>
          <Button
            onClick={() => setShowChatBox(!showChatBox)}
            variant={showChatBox ? "default" : "outline"}
            size="sm"
            className="h-5 px-2 text-xs"
          >
            AI
          </Button>
        </div>
      </div>

      {/* Compact AI Chat */}
      {showChatBox && (
        <div className="bg-[var(--secondary)] border-b border-[var(--border)] p-2">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={chatPrompt}
              onChange={(e) => setChatPrompt(e.target.value)}
              placeholder="AI command: 'add reverb', 'normalize track 2'..."
              className="flex-1 px-2 py-1 bg-[var(--background)] border border-[var(--border)] rounded text-xs"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  console.log('AI Command:', chatPrompt);
                  setChatPrompt('');
                  setShowChatBox(false);
                }
                if (e.key === 'Escape') setShowChatBox(false);
              }}
            />
            <Button size="sm" className="h-6 px-2 text-xs">Send</Button>
          </div>
        </div>
      )}

      {/* Timeline Ruler */}
      <div className="h-8 bg-[var(--muted)] border-b border-[var(--border)] relative overflow-hidden">
        <div 
          className="relative h-full cursor-pointer" 
          style={{ 
            width: `${100 * zoomLevel}%`,
            transform: `translateX(-${scrollX}px)`
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onWheel={handleScroll}
        >
          {renderTimelineRuler()}
          {/* Playhead */}
          <div 
            className="absolute top-0 bottom-0 w-0.5 bg-[var(--primary)] z-10 pointer-events-none"
            style={{ left: `${(transport.currentTime / 1200) * 100}%` }}
          >
            <div className="w-3 h-3 bg-[var(--primary)] -ml-1.5 -mt-1 rotate-45"></div>
          </div>
        </div>
      </div>

      {/* Unified Track and Timeline Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Track Headers */}
        <div className="w-48 border-r border-[var(--border)] bg-[var(--background)] flex flex-col">
          <div className="h-8 bg-[var(--muted)] border-b border-[var(--border)] px-3 flex items-center justify-between">
            <span className="text-sm font-medium">Tracks ({tracks.length})</span>
            <div className="flex space-x-1">
              <Button variant="ghost" size="sm" className="h-5 w-5 p-0 hover:bg-[var(--accent)]">
                <Plus className="w-3 h-3" />
              </Button>
              <Button variant="ghost" size="sm" className="h-5 w-5 p-0 hover:bg-[var(--accent)]">
                <Copy className="w-3 h-3" />
              </Button>
              <Button variant="ghost" size="sm" className="h-5 w-5 p-0 hover:bg-[var(--accent)]">
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </div>
          
          <div className="flex-1 overflow-hidden">
            {tracks.map((track, index) => (
              <div
                key={track.id}
                className={`h-12 border-b border-[var(--border)] px-3 py-2 cursor-pointer transition-colors group ${
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
                      {track.muted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
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
                      {track.soloed ? <Radio className="w-3 h-3" /> : <Circle className="w-3 h-3" />}
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)]">
                  <span>{track.type.toUpperCase()}</span>
                  <span className="font-mono">{Math.round(track.volume)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Connected Timeline Content */}
        <div 
          className="flex-1 overflow-auto scrollbar-thin select-none mt-8" 
          ref={timelineRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onWheel={handleScroll}
          style={{ cursor: currentTool === 'hand' ? 'grab' : isDragging ? 'grabbing' : 'default' }}
        >
          <div 
            className="relative bg-[var(--background)]" 
            style={{ 
              width: `${Math.max(1200, 1200 * zoomLevel)}px`, 
              height: `${tracks.length * 48}px`
            }}
          >
            {tracks.map((track, index) => (
              <div
                key={track.id}
                className={`absolute left-0 right-0 h-12 border-b border-[var(--border)] transition-colors ${
                  selectedTrackIds.includes(track.id) ? 'bg-[var(--accent)]/20' : 'hover:bg-[var(--muted)]/20'
                }`}
                style={{ top: `${index * 48}px` }}
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
                    const timelineWidth = Math.max(1200, 1200 * zoomLevel);
                    const clipStartX = (clip.startTime / 1200) * timelineWidth; // 20 minutes total
                    const clipWidth = (clip.duration / 1200) * timelineWidth;
                    
                    return (
                      <div
                        key={clip.id}
                        className="absolute top-1 h-20 rounded-md shadow-md border border-opacity-30 cursor-move hover:shadow-lg transition-all duration-200"
                        style={{
                          left: `${clipStartX - scrollX}px`,
                          width: `${clipWidth}px`,
                          backgroundColor: clip.color,
                          borderColor: clip.color,
                          zIndex: 5
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
                                  const y = 26 - ((amplitude - 50) / 50) * 25; // Center at 26, normalize amplitude
                                  return `L ${x},${y}`;
                                }).join(' ')}`}
                                stroke="rgba(255,255,255,0.8)"
                                strokeWidth="1"
                                fill="none"
                                vectorEffect="non-scaling-stroke"
                              />
                              {/* Center line */}
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
                        left: `${audioSelection.startX - scrollX}px`,
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
                
                {/* Track Effects Indicators */}
                {track.effects && track.effects.length > 0 && (
                  <div className="absolute top-1 right-2 flex space-x-1">
                    {track.effects.slice(0, 4).map((effect, i) => (
                      <div 
                        key={i} 
                        className="w-1.5 h-1.5 bg-[var(--primary)] rounded-full opacity-70"
                        title={effect.name}
                      />
                    ))}
                  </div>
                )}
                
                {/* Track Selection Indicator */}
                {selectedTrackIds.includes(track.id) && (
                  <div className="absolute left-0 top-0 w-1 h-full bg-[var(--primary)]" />
                )}
              </div>
            ))}
            
            {/* Grid Lines */}
            <div className="absolute inset-0 pointer-events-none">
              {Array.from({ length: Math.floor(1200 / (30 / zoomLevel)) }).map((_, i) => (
                <div
                  key={i}
                  className="absolute top-0 bottom-0 w-px bg-[var(--border)] opacity-20"
                  style={{ left: `${(i * 30 * zoomLevel / 1200) * 100}%` }}
                />
              ))}
            </div>
            
            {/* Playhead */}
            <div 
              className="absolute top-0 bottom-0 w-0.5 bg-[var(--primary)] z-20 pointer-events-none"
              style={{ left: `${(transport.currentTime / 1200) * 100}%` }}
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