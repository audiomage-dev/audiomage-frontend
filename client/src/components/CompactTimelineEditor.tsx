import { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { WaveformVisualization } from './WaveformVisualization';
import { AudioTrack, TransportState } from '../types/audio';
import { 
  Volume2, 
  VolumeX, 
  Radio, 
  ChevronDown,
  ChevronRight
} from 'lucide-react';

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
  zoomLevel = 1, 
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
  // Generate unique component ID to prevent key conflicts
  const componentId = useRef(`timeline-${Math.random().toString(36).substr(2, 9)}`).current;
  const [scrollX, setScrollX] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  
  // Track resizing state
  const [trackHeights, setTrackHeights] = useState<{ [trackId: string]: number }>({});
  const [resizingTrack, setResizingTrack] = useState<{ trackId: string; startY: number; startHeight: number } | null>(null);
  
  // Refs
  const timelineRef = useRef<HTMLDivElement>(null);
  const tracksRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Track resize functionality
  const getTrackHeight = useCallback((trackId: string) => {
    return trackHeights[trackId] || 64; // Default height
  }, [trackHeights]);

  // Calculate dynamic timeline width based on clips
  const getTimelineWidth = useCallback(() => {
    let maxTime = 300; // Minimum 5 minutes default
    
    // Find the actual longest clip end time
    tracks.forEach(track => {
      track.clips?.forEach(clip => {
        const clipEndTime = clip.startTime + clip.duration;
        if (clipEndTime > maxTime) {
          maxTime = clipEndTime;
        }
      });
    });
    
    // Add reasonable buffer (20% or minimum 60 seconds)
    const bufferTime = Math.max(maxTime * 0.2, 60);
    const totalTime = maxTime + bufferTime;
    
    // Use same pixel-per-second ratio as clip rendering for consistency
    const pixelsPerSecond = 60 * zoomLevel; // Match clip rendering calculation
    const calculatedWidth = totalTime * pixelsPerSecond;
    
    // Ensure minimum width for usability
    return Math.max(800, calculatedWidth);
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

    // Draw snap grid lines based on current snap mode
    const timelineWidth = getTimelineWidth();
    const totalTime = timelineWidth / zoomLevel;
    
    let snapInterval = 30; // Default 30 seconds
    let snapColor = '#e5e7eb';
    let snapAlpha = 0.3;
    
    switch (snapMode) {
      case 'grid':
        snapInterval = 0.5; // 0.5 second intervals
        snapColor = '#3b82f6'; // Blue for grid snap
        snapAlpha = 0.4;
        break;
      case 'beat':
        snapInterval = 60 / bpm; // Beat intervals
        snapColor = '#10b981'; // Green for beat snap
        snapAlpha = 0.4;
        break;
      case 'measure':
        const beatsPerMeasure = timeSignature[0];
        snapInterval = (60 / bpm) * beatsPerMeasure; // Measure intervals
        snapColor = '#f59e0b'; // Orange for measure snap
        snapAlpha = 0.4;
        break;
      default:
        snapInterval = 30; // Fallback to 30 seconds
        snapColor = '#e5e7eb';
        snapAlpha = 0.3;
    }
    
    const gridInterval = (snapInterval / totalTime) * timelineWidth;
    
    // Only draw if grid interval is reasonable (not too dense)
    if (gridInterval > 2) {
      ctx.strokeStyle = snapColor;
      ctx.globalAlpha = snapAlpha;
      
      for (let i = 0; i < width; i += gridInterval) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, height);
        ctx.stroke();
      }
    }

    // Horizontal track lines with variable heights
    let cumulativeHeight = 0;
    for (let i = 0; i < tracks.length; i++) {
      cumulativeHeight += trackHeights[tracks[i].id] || 64; // Default height
      if (i < tracks.length - 1) { // Don't draw line after last track
        ctx.beginPath();
        ctx.moveTo(0, cumulativeHeight);
        ctx.lineTo(width, cumulativeHeight);
        ctx.stroke();
      }
    }

    ctx.globalAlpha = 1;
  }, [tracks, zoomLevel, getTimelineWidth, snapMode, bpm, timeSignature, trackHeights]);

  // Redraw canvas when dependencies change
  useEffect(() => {
    drawCanvasGrid();
  }, [drawCanvasGrid]);

  // Handle track header right-click
  const handleTrackRightClick = useCallback((e: React.MouseEvent, trackId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Basic track selection - simplified
    if (onTrackSelect) {
      onTrackSelect(trackId);
    }
  }, [onTrackSelect]);

  // Handle track resize
  const handleResizeStart = useCallback((e: React.MouseEvent, trackId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    setResizingTrack({
      trackId,
      startY: e.clientY,
      startHeight: getTrackHeight(trackId)
    });

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (resizingTrack) {
        const deltaY = moveEvent.clientY - resizingTrack.startY;
        const newHeight = Math.max(32, Math.min(200, resizingTrack.startHeight + deltaY));
        
        setTrackHeights(prev => ({
          ...prev,
          [resizingTrack.trackId]: newHeight
        }));
      }
    };

    const handleMouseUp = () => {
      setResizingTrack(null);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [resizingTrack, getTrackHeight]);

  // Sync scroll between timeline and tracks
  const handleTimelineScroll = useCallback((e: Event) => {
    const target = e.target as HTMLElement;
    if (tracksRef.current && target.scrollTop !== tracksRef.current.scrollTop) {
      tracksRef.current.scrollTop = target.scrollTop;
    }
  }, []);

  const handleTracksScroll = useCallback((e: Event) => {
    const target = e.target as HTMLElement;
    if (timelineRef.current && target.scrollTop !== timelineRef.current.scrollTop) {
      timelineRef.current.scrollTop = target.scrollTop;
    }
  }, []);

  useEffect(() => {
    const timelineElement = timelineRef.current;
    const tracksElement = tracksRef.current;

    if (timelineElement) {
      timelineElement.addEventListener('scroll', handleTimelineScroll);
    }
    if (tracksElement) {
      tracksElement.addEventListener('scroll', handleTracksScroll);
    }

    return () => {
      if (timelineElement) {
        timelineElement.removeEventListener('scroll', handleTimelineScroll);
      }
      if (tracksElement) {
        tracksElement.removeEventListener('scroll', handleTracksScroll);
      }
    };
  }, [handleTimelineScroll, handleTracksScroll]);

  // Default mouse handlers - no selection functionality
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Default behavior only - no selection
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    // Default behavior only - no selection
  }, []);

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    // Default behavior only - no selection
  }, []);

  const handleScroll = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      
      // Zoom functionality
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      const newZoom = Math.max(0.25, Math.min(4, zoomLevel + delta));
      
      if (onZoomChange) {
        onZoomChange(newZoom);
      }
    } else {
      // Horizontal scroll
      setScrollX(prev => Math.max(0, prev + e.deltaX));
    }
  }, [zoomLevel, onZoomChange]);

  return (
    <div className="flex flex-col h-full bg-[var(--background)]">
      {/* Left Side - Track Headers */}
      <div className="w-96 bg-[var(--muted)]/20 border-r border-[var(--border)] flex flex-col">
        {/* Header spacer to align with timeline ruler */}
        <div className="h-8 border-b border-[var(--border)] bg-[var(--muted)]/30"></div>
        
        <div className="flex-1 overflow-auto scrollbar-thin" ref={tracksRef}>
          {(() => {
            const renderedTracks: JSX.Element[] = [];
            let i = 0;
            
            while (i < tracks.length) {
              const track = tracks[i];
              
              // Check if this is a parent track with children
              const isParentTrack = track.isGroup && !track.parentId;
              
              if (isParentTrack) {
                // Find all child tracks
                const childTracks = tracks.filter(t => t.parentId === track.id);
                const allGroupTracks = [track, ...childTracks];
                
                // Calculate total height for the group - only child tracks count
                const isCollapsed = collapsedGroups.has(track.id);
                
                // Create single container for the group with parent header and child controls
                const groupHeight = isCollapsed 
                  ? getTrackHeight(track.id) 
                  : childTracks.reduce((acc, t) => acc + getTrackHeight(t.id), 0);
                  
                if (!isCollapsed) {
                  // Render expanded group with parent header and child controls
                  renderedTracks.push(
                    <div
                      key={`track-group-${track.id}`}
                      className={`border-b border-[var(--border)] border-l-4 px-3 py-1 cursor-pointer transition-colors group relative`}
                      style={{ 
                        height: `${groupHeight}px`,
                        borderLeftColor: track.color,
                        backgroundColor: (() => {
                          const hex = track.color.replace('#', '');
                          const r = parseInt(hex.substr(0, 2), 16);
                          const g = parseInt(hex.substr(2, 2), 16);
                          const b = parseInt(hex.substr(4, 2), 16);
                          return `rgba(${r}, ${g}, ${b}, 0.1)`;
                        })()
                      }}
                      onClick={(e) => handleTrackRightClick(e, track.id)}
                      onContextMenu={(e) => handleTrackRightClick(e, track.id)}
                    >
                      <div
                        className="absolute bottom-0 left-0 right-0 h-1 cursor-row-resize bg-transparent hover:bg-[var(--primary)] opacity-0 group-hover:opacity-100 transition-opacity z-10"
                        onMouseDown={(e) => handleResizeStart(e, track.id)}
                      />
                      {/* Collapse button - top left corner */}
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleGroupCollapse?.(track.id);
                        }}
                        variant="ghost"
                        size="sm"
                        className="absolute top-1 left-1 h-4 w-4 p-0 hover:bg-[var(--accent)] z-20"
                      >
                        <ChevronDown className="w-3 h-3 text-[var(--muted-foreground)]" />
                      </Button>

                      {/* Parent track header - vertically centered */}
                      <div 
                        className="absolute left-6 flex flex-col z-10" 
                        style={{ 
                          top: '50%', 
                          transform: 'translateY(-50%)',
                          maxWidth: `${384 - 120}px` // Responsive to panel width, accounting for controls
                        }}
                      >
                        {/* Header section */}
                        <div className="flex items-center space-x-2 mb-2">
                          <div 
                            className="w-2 h-2 rounded-sm flex-shrink-0" 
                            style={{ backgroundColor: track.color }}
                          ></div>
                          <div className="flex flex-col">
                            <div 
                              className="text-sm font-medium text-[var(--foreground)] leading-tight"
                              style={{ maxWidth: `${180}px` }}
                            >
                              {track.name.split(' ').map((word, index) => (
                                <div key={index} className="break-words">
                                  {word}
                                </div>
                              ))}
                            </div>
                            {track.type === 'ai-generated' && (
                              <div className="w-1.5 h-1.5 bg-[var(--purple)] rounded-full mt-0.5"></div>
                            )}
                          </div>
                        </div>
                        
                        {/* Parent track mute/solo buttons under header */}
                        <div className="flex items-center space-x-1">
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              // Mute/unmute all child tracks
                              childTracks.forEach(childTrack => {
                                onTrackMute(childTrack.id);
                              });
                            }}
                            variant="ghost"
                            size="sm"
                            className={`h-4 w-4 p-0 rounded text-xs border border-white/20 ${
                              childTracks.every(t => t.muted)
                                ? 'bg-[var(--red)] text-white border-white/40' 
                                : 'hover:bg-[var(--accent)] opacity-60 group-hover:opacity-100'
                            }`}
                          >
                            M
                          </Button>
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              // Solo/unsolo all child tracks
                              childTracks.forEach(childTrack => {
                                onTrackSolo(childTrack.id);
                              });
                            }}
                            variant="ghost"
                            size="sm"
                            className={`h-4 w-4 p-0 rounded text-xs border border-white/20 ${
                              childTracks.every(t => t.soloed)
                                ? 'bg-[var(--yellow)] text-black border-white/40' 
                                : 'hover:bg-[var(--accent)] opacity-60 group-hover:opacity-100'
                            }`}
                          >
                            S
                          </Button>
                        </div>
                      </div>

                      {/* Individual child track controls on the right */}
                      <div className="absolute right-1 top-0 flex flex-col justify-center h-full space-y-1">
                        {childTracks.map((childTrack, index) => (
                          <div 
                            key={`child-controls-${childTrack.id}`}
                            className="flex items-center space-x-1"
                            style={{ height: `${getTrackHeight(childTrack.id)}px` }}
                          >
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                onTrackMute(childTrack.id);
                              }}
                              variant="ghost"
                              size="sm"
                              className={`h-4 w-4 p-0 rounded text-xs border border-white/20 ${
                                childTrack.muted 
                                  ? 'bg-[var(--red)] text-white border-white/40' 
                                  : 'hover:bg-[var(--accent)] opacity-60 group-hover:opacity-100'
                              }`}
                              style={{ fontSize: '8px' }}
                            >
                              M
                            </Button>
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                onTrackSolo(childTrack.id);
                              }}
                              variant="ghost"
                              size="sm"
                              className={`h-4 w-4 p-0 rounded text-xs border border-white/20 ${
                                childTrack.soloed 
                                  ? 'bg-[var(--yellow)] text-black border-white/40' 
                                  : 'hover:bg-[var(--accent)] opacity-60 group-hover:opacity-100'
                              }`}
                              style={{ fontSize: '8px' }}
                            >
                              S
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                } else {
                  // Show collapsed parent track
                  renderedTracks.push(
                    <div
                      key={`track-group-collapsed-${track.id}`}
                      className={`border-b border-[var(--border)] border-l-4 px-3 py-1 cursor-pointer transition-colors group relative`}
                      style={{ 
                        height: `${getTrackHeight(track.id)}px`,
                        borderLeftColor: track.color,
                        backgroundColor: (() => {
                          const hex = track.color.replace('#', '');
                          const r = parseInt(hex.substr(0, 2), 16);
                          const g = parseInt(hex.substr(2, 2), 16);
                          const b = parseInt(hex.substr(4, 2), 16);
                          return `rgba(${r}, ${g}, ${b}, 0.1)`;
                        })()
                      }}
                      onClick={(e) => handleTrackRightClick(e, track.id)}
                      onContextMenu={(e) => handleTrackRightClick(e, track.id)}
                    >
                      <div
                        className="absolute bottom-0 left-0 right-0 h-1 cursor-row-resize bg-transparent hover:bg-[var(--primary)] opacity-0 group-hover:opacity-100 transition-opacity z-10"
                        onMouseDown={(e) => handleResizeStart(e, track.id)}
                      />
                      {/* Collapse button - top left corner */}
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleGroupCollapse?.(track.id);
                        }}
                        variant="ghost"
                        size="sm"
                        className="absolute top-1 left-1 h-4 w-4 p-0 hover:bg-[var(--accent)] z-20"
                      >
                        <ChevronRight className="w-3 h-3 text-[var(--muted-foreground)]" />
                      </Button>

                      <div className="flex items-center justify-between min-w-0">
                        <div className="flex items-center space-x-2 min-w-0 ml-6" style={{ maxWidth: `${384 - 80}px` }}>
                          <div 
                            className="w-2 h-2 rounded-sm flex-shrink-0" 
                            style={{ backgroundColor: track.color }}
                          ></div>
                          <div className="flex flex-col" style={{ maxWidth: `${240}px` }}>
                            <div 
                              className="text-sm font-medium text-[var(--foreground)] leading-tight"
                              style={{ maxWidth: `${240}px` }}
                            >
                              {track.name.split(' ').map((word, index) => (
                                <div key={index} className="break-words">
                                  {word}
                                </div>
                              ))}
                            </div>
                            {track.type === 'ai-generated' && (
                              <div className="w-1.5 h-1.5 bg-[var(--purple)] rounded-full mt-0.5"></div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-1 mr-1">
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              onTrackMute(track.id);
                            }}
                            variant="ghost"
                            size="sm"
                            className={`h-4 w-4 p-0 rounded text-xs border border-white/20 ${
                              track.muted 
                                ? 'bg-[var(--red)] text-white border-white/40' 
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
                            className={`h-4 w-4 p-0 rounded text-xs border border-white/20 ${
                              track.soloed 
                                ? 'bg-[var(--yellow)] text-black border-white/40' 
                                : 'hover:bg-[var(--accent)] opacity-60 group-hover:opacity-100'
                            }`}
                          >
                            S
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                }
                
                // Skip all tracks in this group
                i += allGroupTracks.length;
              } else if (!track.parentId) {
                // Regular track (not grouped)
                const trackHeight = getTrackHeight(track.id);
                renderedTracks.push(
                  <div
                    key={`track-${track.id}`}
                    className={`border-b border-[var(--border)] border-l-4 px-3 py-1 cursor-pointer transition-colors group relative`}
                    style={{ 
                      height: `${trackHeight}px`,
                      borderLeftColor: track.color,
                      backgroundColor: (() => {
                        const hex = track.color.replace('#', '');
                        const r = parseInt(hex.substr(0, 2), 16);
                        const g = parseInt(hex.substr(2, 2), 16);
                        const b = parseInt(hex.substr(4, 2), 16);
                        return `rgba(${r}, ${g}, ${b}, 0.1)`;
                      })()
                    }}
                    onClick={(e) => handleTrackRightClick(e, track.id)}
                    onContextMenu={(e) => handleTrackRightClick(e, track.id)}
                  >
                    {/* Resize Handle for Header */}
                    <div
                      className="absolute bottom-0 left-0 right-0 h-1 cursor-row-resize bg-transparent hover:bg-[var(--primary)] opacity-0 group-hover:opacity-100 transition-opacity z-10"
                      onMouseDown={(e) => handleResizeStart(e, track.id)}
                    />
                    <div className="flex items-center justify-between min-w-0">
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
                      <div className="flex items-center space-x-1 mr-1">
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            onTrackMute(track.id);
                          }}
                          variant="ghost"
                          size="sm"
                          className={`h-4 w-4 p-0 rounded text-xs border border-white/20 ${
                            track.muted 
                              ? 'bg-[var(--red)] text-white border-white/40' 
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
                          className={`h-4 w-4 p-0 rounded text-xs border border-white/20 ${
                            track.soloed 
                              ? 'bg-[var(--yellow)] text-black border-white/40' 
                              : 'hover:bg-[var(--accent)] opacity-60 group-hover:opacity-100'
                          }`}
                        >
                          S
                        </Button>
                      </div>
                    </div>
                  </div>
                );
                i++;
              } else {
                // Skip child tracks as they're handled by their parent
                i++;
              }
            }
            
            return renderedTracks;
          })()}
        </div>
      </div>

      {/* Right Side - Timeline */}
      <div className="flex-1 flex flex-col">
        {/* Timeline Header with Ruler */}
        <div className="h-8 border-b border-[var(--border)] bg-[var(--muted)]/30 relative overflow-hidden">
          
          {/* Grid lines in header */}
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{ 
              width: `${getTimelineWidth()}px`,
              transform: `translateX(-${scrollX}px)`
            }}
          >
            {(() => {
              const timelineWidth = getTimelineWidth();
              const pixelsPerSecond = 60 * zoomLevel;
              const totalTimelineSeconds = timelineWidth / pixelsPerSecond;
              
              // Grid interval based on zoom level and display mode
              let gridInterval: number;
              if (gridDisplayMode === 'timecode') {
                // Timecode mode: grid every 30 frames (assuming 30fps) = 1 second
                gridInterval = 1; // 1 second intervals
              } else {
                // Seconds mode: adaptive intervals based on zoom
                if (zoomLevel >= 4) {
                  gridInterval = 0.5; // Half-second intervals at high zoom
                } else if (zoomLevel >= 2) {
                  gridInterval = 1; // 1-second intervals at medium zoom
                } else {
                  gridInterval = 5; // 5-second intervals at low zoom
                }
              }
              
              const gridCount = Math.ceil(totalTimelineSeconds / gridInterval);
              
              return Array.from({ length: gridCount + 1 }).map((_, index) => {
                const timePosition = index * gridInterval;
                const xPosition = timePosition * pixelsPerSecond;
                
                if (xPosition > timelineWidth) return null;
                
                return (
                  <div
                    key={`header-grid-${index}`}
                    className="absolute top-0 bottom-0 w-px"
                    style={{
                      left: `${xPosition}px`,
                      backgroundColor: 'rgba(156, 163, 175, 0.3)', // Neutral grid color for header
                      transform: `translateX(-${scrollX}px)`
                    }}
                  />
                );
              }).filter(Boolean);
            })()}
          </div>
          
          <div 
            className="absolute inset-0 flex items-center"
            style={{ 
              width: `${getTimelineWidth()}px`,
              transform: `translateX(-${scrollX}px)`
            }}
          >
            {(() => {
              // Calculate minute markers based on actual timeline width
              const timelineWidthPx = getTimelineWidth();
              const pixelsPerSecond = 60 * zoomLevel; // Match timeline width calculation
              const totalTimelineSeconds = timelineWidthPx / pixelsPerSecond;
              const totalMinutes = Math.ceil(totalTimelineSeconds / 60);
              
              return Array.from({ length: totalMinutes + 1 }).map((_, minuteIndex) => {
                const minuteStartTime = minuteIndex * 60; // 60 seconds per minute
                const position = (minuteStartTime / totalTimelineSeconds) * 100;
                
                // Skip if position is beyond our timeline
                if (minuteStartTime > totalTimelineSeconds) return null;
                
                // Format time as minutes
                const minutes = Math.floor(minuteStartTime / 60);
                const timeLabel = `${minutes}:00`;
                
                return (
                  <div
                    key={`minute-marker-${minuteIndex}-${minuteStartTime}`}
                    className="absolute text-xs text-[var(--muted-foreground)] font-mono"
                    style={{ left: `${position}%` }}
                  >
                    {timeLabel}
                  </div>
                );
              }).filter(Boolean);
            })()}
          </div>
        </div>

        {/* Timeline Content with Canvas Grid */}
        <div 
          className="flex-1 overflow-auto scrollbar-thin select-none" 
          ref={timelineRef}
          data-timeline-container
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onWheel={handleScroll}
          style={{ cursor: 'default' }}
        >
          <div 
            className="relative" 
            style={{ 
              width: `${getTimelineWidth()}px`, 
              height: `${tracks.reduce((acc, track) => acc + getTrackHeight(track.id), 0)}px`,
              transform: `translateX(-${scrollX}px)`
            }}
          >
            {/* Grid lines inside timeline content */}
            <canvas
              ref={canvasRef}
              className="absolute top-0 left-0 pointer-events-none z-0"
              width={getTimelineWidth()}
              height={tracks.reduce((acc, track) => acc + getTrackHeight(track.id), 0)}
            />
            
            {/* Track timeline areas */}
            {tracks.filter(track => {
              // Only show child tracks (not parent tracks)
              // If it's a child track, check if its parent is collapsed
              if (track.parentId) {
                return !collapsedGroups.has(track.parentId);
              }
              // Skip parent tracks entirely - they don't get their own timeline row
              const hasChildren = tracks.some(t => t.parentId === track.id);
              return !hasChildren;
            }).map((track, index) => {
              // Calculate cumulative height for positioning
              let cumulativeHeight = 0;
              const allVisibleTracks = tracks.filter(t => {
                if (t.parentId) {
                  return !collapsedGroups.has(t.parentId);
                }
                const hasChildren = tracks.some(child => child.parentId === t.id);
                return !hasChildren;
              });

              for (let i = 0; i < index; i++) {
                cumulativeHeight += getTrackHeight(allVisibleTracks[i].id);
              }

              const trackHeight = getTrackHeight(track.id);

              return (
                <div
                  key={`track-timeline-${track.id}-${index}`}
                  className={`absolute left-0 right-0 transition-colors group hover:brightness-110`}
                  style={{ 
                    top: `${cumulativeHeight}px`,
                    height: `${trackHeight}px`,
                    backgroundColor: (() => {
                      const hex = track.color.replace('#', '');
                      const r = parseInt(hex.substr(0, 2), 16);
                      const g = parseInt(hex.substr(2, 2), 16);
                      const b = parseInt(hex.substr(4, 2), 16);
                      return `rgba(${r}, ${g}, ${b}, 0.05)`;
                    })()
                  }}
                  onClick={(e) => handleTrackRightClick(e, track.id)}
                  onContextMenu={(e) => handleTrackRightClick(e, track.id)}
                >
                  {/* Grid Lines */}
                  <div className="absolute inset-0 pointer-events-none">
                    {(() => {
                      const timelineWidth = getTimelineWidth();
                      const pixelsPerSecond = 60 * zoomLevel;
                      const totalTimelineSeconds = timelineWidth / pixelsPerSecond;
                      
                      // Grid interval based on zoom level and display mode
                      let gridInterval: number;
                      if (gridDisplayMode === 'timecode') {
                        // Timecode mode: grid every 30 frames (assuming 30fps) = 1 second
                        gridInterval = 1; // 1 second intervals
                      } else {
                        // Seconds mode: adaptive intervals based on zoom
                        if (zoomLevel >= 4) {
                          gridInterval = 0.5; // Half-second intervals at high zoom
                        } else if (zoomLevel >= 2) {
                          gridInterval = 1; // 1-second intervals at medium zoom
                        } else {
                          gridInterval = 5; // 5-second intervals at low zoom
                        }
                      }
                      
                      const gridCount = Math.ceil(totalTimelineSeconds / gridInterval);
                      
                      // Convert track color to rgba for grid lines
                      const getGridColor = (color: string) => {
                        const hex = color.replace('#', '');
                        const r = parseInt(hex.substr(0, 2), 16);
                        const g = parseInt(hex.substr(2, 2), 16);
                        const b = parseInt(hex.substr(4, 2), 16);
                        return `rgba(${r}, ${g}, ${b}, 0.15)`; // 15% opacity
                      };
                      
                      return Array.from({ length: gridCount + 1 }).map((_, index) => {
                        const timePosition = index * gridInterval;
                        const xPosition = timePosition * pixelsPerSecond;
                        
                        if (xPosition > timelineWidth) return null;
                        
                        return (
                          <div
                            key={`grid-${track.id}-${index}`}
                            className="absolute top-0 bottom-0 w-px"
                            style={{
                              left: `${xPosition}px`,
                              backgroundColor: getGridColor(track.color),
                              transform: `translateX(-${scrollX}px)`
                            }}
                          />
                        );
                      }).filter(Boolean);
                    })()}
                  </div>
                  
                  {/* Resize Handle */}
                  <div
                    className="absolute bottom-0 left-0 right-0 h-1 cursor-row-resize bg-transparent hover:bg-[var(--primary)] opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    onMouseDown={(e) => handleResizeStart(e, track.id)}
                    style={{
                      cursor: resizingTrack?.trackId === track.id ? 'row-resize' : 'row-resize'
                    }}
                  />

                  {/* Audio Clips */}
                  <div className="h-full relative">
                    {track.clips?.map((clip) => {
                      const clipWidth = (clip.duration / (getTimelineWidth() / (60 * zoomLevel))) * getTimelineWidth();
                      const clipLeft = (clip.startTime / (getTimelineWidth() / (60 * zoomLevel))) * getTimelineWidth();

                      return (
                        <div
                          key={`clip-${clip.id}`}
                          data-clip-id={clip.id}
                          className="absolute top-1 bottom-1 bg-gradient-to-r from-[var(--primary)] to-[var(--primary)]/80 rounded border border-[var(--primary)]/20 cursor-move group overflow-hidden"
                          style={{
                            left: `${clipLeft}px`,
                            width: `${clipWidth}px`,
                            backgroundColor: clip.color || track.color,
                          }}
                        >
                          {/* Clip content */}
                          <div className="h-full flex items-center justify-between px-2">
                            <span className="text-xs font-medium text-white truncate">
                              {clip.name}
                            </span>
                            {clip.type === 'audio' && (
                              <WaveformVisualization
                                audioData={clip.audioData}
                                width={Math.max(0, clipWidth - 16)}
                                height={trackHeight - 8}
                                color="rgba(255, 255, 255, 0.3)"
                              />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}