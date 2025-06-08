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
  RotateCcw,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Sparkles,
  X,
  Files,
  Copy,
  Link,
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

export function CompactTimelineEditor({ tracks, transport, zoomLevel: externalZoomLevel = 1, bpm = 120, timeSignature = [4, 4], snapMode = 'grid', onTrackMute, onTrackSolo, onTrackSelect, onClipMove, onClipResize, onZoomChange, isLocked = false, collapsedGroups = new Set(), onToggleGroupCollapse }: CompactTimelineEditorProps) {
  // Generate unique component ID to prevent key conflicts
  const componentId = useRef(`timeline-${Math.random().toString(36).substr(2, 9)}`).current;
  const [internalZoomLevel, setInternalZoomLevel] = useState(1);
  const zoomLevel = externalZoomLevel;
  const [scrollX, setScrollX] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const [selectedTrackIds, setSelectedTrackIds] = useState<string[]>([]);
  const [currentTool, setCurrentTool] = useState<'select' | 'hand' | 'edit'>('select');
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionBox, setSelectionBox] = useState<{ startX: number; startY: number; endX: number; endY: number } | null>(null);
  
  // Multi-track selection state
  const [multiSelection, setMultiSelection] = useState<{
    startTime: number;
    endTime: number;
    startTrackIndex: number;
    endTrackIndex: number;
    startX: number;
    endX: number;
    startY: number;
    endY: number;
    isActive: boolean;
    selectedClips: string[];
  } | null>(null);

  // Clip area selection state
  const [clipAreaSelection, setClipAreaSelection] = useState<{
    clipId: string;
    trackId: string;
    startTime: number;
    endTime: number;
    startX: number;
    endX: number;
    isActive: boolean;
    multiTrack?: {
      startTrackIndex: number;
      endTrackIndex: number;
      affectedTracks: string[];
    };
  } | null>(null);

  // Mouse cursor state
  const [cursorState, setCursorState] = useState<'default' | 'grab' | 'grabbing' | 'col-resize' | 'text' | 'crosshair'>('default');

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
    initialGrabOffset: number; // Where within the clip the mouse grabbed it
    selectedClips?: Array<{
      clipId: string;
      trackId: string;
      originalStartTime: number;
      originalTrackIndex: number;
    }>;
  } | null>(null);

  // Clip resizing state
  const [resizingClip, setResizingClip] = useState<{
    clipId: string;
    trackId: string;
    edge: 'left' | 'right';
    startX: number;
    originalStartTime: number;
    originalDuration: number;
  } | null>(null);

  // Virtual extension state
  const [virtualExtension, setVirtualExtension] = useState<{
    clipId: string;
    trackId: string;
    edge: 'left' | 'right';
    startTime: number;
    endTime: number;
    originalStartTime: number;
    originalDuration: number;
    extensionLength: number;
    x: number;
    y: number;
    width: number;
  } | null>(null);

  // Context menu states
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; trackIds: string[] } | null>(null);
  const [audioContextMenu, setAudioContextMenu] = useState<{ 
    x: number; 
    y: number; 
    selection: { trackId: string; startTime: number; endTime: number; trackName: string } 
  } | null>(null);
  const [clipContextMenu, setClipContextMenu] = useState<{ 
    x: number; 
    y: number; 
    clip: { id: string; name: string; trackId: string; trackName: string } 
  } | null>(null);
  
  // LLM prompt state
  const [showLLMPrompt, setShowLLMPrompt] = useState(false);
  const [llmPrompt, setLLMPrompt] = useState('');
  const [selectedClipForLLM, setSelectedClipForLLM] = useState<{ id: string; name: string; trackName: string; trackType: string } | null>(null);

  // Mouse position detection within clips
  const getClipInteractionZone = useCallback((e: React.MouseEvent, clipElement: HTMLElement, clip: any) => {
    const rect = clipElement.getBoundingClientRect();
    const relativeX = e.clientX - rect.left;
    const relativeY = e.clientY - rect.top;
    const clipWidth = rect.width;
    const clipHeight = rect.height;
    
    // Define zones: resize handles (10px each), top half for selection, bottom half for drag
    const resizeHandleWidth = 10;
    
    // Priority: resize handles override everything
    if (relativeX <= resizeHandleWidth) {
      return 'resize-left';
    } else if (relativeX >= clipWidth - resizeHandleWidth) {
      return 'resize-right';
    } 
    // Top half for area selection (excluding resize handles)
    else if (relativeY <= clipHeight / 2) {
      return 'select-area';
    } 
    // Bottom half for dragging
    else {
      return 'drag';
    }
  }, []);

  // Update cursor based on interaction zone
  const updateCursorForClip = useCallback((zone: string) => {
    switch (zone) {
      case 'resize-left':
      case 'resize-right':
        setCursorState('col-resize');
        break;
      case 'select-area':
        setCursorState('text');
        break;
      case 'drag':
        setCursorState('grab');
        break;
      default:
        setCursorState('default');
    }
  }, []);

  // Snap calculation function
  const calculateSnappedTime = useCallback((timeInSeconds: number): number => {
    if (snapMode === 'free') {
      console.log('Snap: FREE mode - no snapping applied');
      return timeInSeconds;
    }
    
    let snappedTime = timeInSeconds;
    
    switch (snapMode) {
      case 'grid': {
        // Snap to 0.5-second grid for more noticeable effect
        const gridSize = 0.5; // 0.5 seconds
        snappedTime = Math.round(timeInSeconds / gridSize) * gridSize;
        console.log(`Snap: GRID mode - ${timeInSeconds.toFixed(3)}s -> ${snappedTime.toFixed(3)}s (${gridSize}s grid)`);
        break;
      }
      case 'beat': {
        // Snap to beat (quarter note) - 60 seconds per minute / BPM = seconds per beat
        const secondsPerBeat = 60 / bpm;
        snappedTime = Math.round(timeInSeconds / secondsPerBeat) * secondsPerBeat;
        console.log(`Snap: BEAT mode - ${timeInSeconds.toFixed(3)}s -> ${snappedTime.toFixed(3)}s (${secondsPerBeat.toFixed(3)}s per beat)`);
        break;
      }
      case 'measure': {
        // Snap to measure - 4 beats per measure (assuming 4/4 time signature)
        const beatsPerMeasure = timeSignature[0];
        const secondsPerBeat = 60 / bpm;
        const secondsPerMeasure = beatsPerMeasure * secondsPerBeat;
        snappedTime = Math.round(timeInSeconds / secondsPerMeasure) * secondsPerMeasure;
        console.log(`Snap: MEASURE mode - ${timeInSeconds.toFixed(3)}s -> ${snappedTime.toFixed(3)}s (${secondsPerMeasure.toFixed(3)}s per measure)`);
        break;
      }
      default:
        snappedTime = timeInSeconds;
    }
    
    return Math.max(0, snappedTime); // Ensure non-negative
  }, [snapMode, zoomLevel, bpm, timeSignature]);

  // Virtual extension action handlers
  const handleExtensionAction = useCallback((action: 'blank' | 'ai' | 'stretch') => {
    if (!virtualExtension) return;

    const { clipId, trackId, edge, originalStartTime, originalDuration, extensionLength } = virtualExtension;

    switch (action) {
      case 'blank':
        // Extend with blank/silent content
        console.log('Extending clip with blank content:', { clipId, extensionLength });
        const blankNewStartTime = edge === 'left' ? originalStartTime - extensionLength : originalStartTime;
        const blankNewDuration = originalDuration + extensionLength;
        if (onClipResize) {
          onClipResize(clipId, trackId, blankNewStartTime, blankNewDuration);
        }
        break;

      case 'ai':
        // Extend with AI-generated content
        console.log('Extending clip with AI content:', { clipId, extensionLength });
        // For now, treat as blank extension - AI generation would be implemented later
        const aiNewStartTime = edge === 'left' ? originalStartTime - extensionLength : originalStartTime;
        const aiNewDuration = originalDuration + extensionLength;
        if (onClipResize) {
          onClipResize(clipId, trackId, aiNewStartTime, aiNewDuration);
        }
        break;

      case 'stretch':
        // Extend by stretching existing content
        console.log('Extending clip by stretching:', { clipId, extensionLength });
        const stretchNewStartTime = edge === 'left' ? originalStartTime - extensionLength : originalStartTime;
        const stretchNewDuration = originalDuration + extensionLength;
        if (onClipResize) {
          onClipResize(clipId, trackId, stretchNewStartTime, stretchNewDuration);
        }
        break;
    }

    // Clear virtual extension
    setVirtualExtension(null);
  }, [virtualExtension, onClipResize]);

  const cancelVirtualExtension = useCallback(() => {
    setVirtualExtension(null);
  }, []);
  
  const timelineRef = useRef<HTMLDivElement>(null);
  const tracksRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  // Zoom functions
  const handleZoomIn = useCallback(() => {
    const newZoomLevel = Math.min(zoomLevel * 1.5, 10);
    onZoomChange?.(newZoomLevel);
  }, [zoomLevel, onZoomChange]);

  const handleZoomOut = useCallback(() => {
    const newZoomLevel = Math.max(zoomLevel / 1.5, 0.1);
    onZoomChange?.(newZoomLevel);
  }, [zoomLevel, onZoomChange]);

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
  }, [tracks, zoomLevel, snapMode, bpm, timeSignature]);

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

    // Horizontal track lines
    for (let i = 1; i < tracks.length; i++) {
      const y = i * 64;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    ctx.globalAlpha = 1;
  }, [tracks, zoomLevel, getTimelineWidth, snapMode, bpm, timeSignature]);

  // Redraw canvas when dependencies change
  useEffect(() => {
    drawCanvasGrid();
  }, [drawCanvasGrid]);

  // Standard DAW keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent shortcuts when typing in inputs
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      const isCtrl = e.ctrlKey || e.metaKey;
      const isShift = e.shiftKey;
      const isAlt = e.altKey;

      switch (e.key.toLowerCase()) {
        case 'a':
          if (isCtrl) {
            e.preventDefault();
            // Select All clips
            const allClipIds: string[] = [];
            tracks.forEach(track => {
              track.clips?.forEach(clip => allClipIds.push(clip.id));
            });
            
            if (allClipIds.length > 0) {
              setMultiSelection({
                startTime: 0,
                endTime: Math.max(...tracks.flatMap(t => t.clips?.map(c => c.startTime + c.duration) || [])),
                startTrackIndex: 0,
                endTrackIndex: tracks.length - 1,
                startX: 0,
                endX: getTimelineWidth(),
                startY: 0,
                endY: tracks.length * 64,
                isActive: false,
                selectedClips: allClipIds
              });
            }
          }
          break;
          
        case 'escape':
          e.preventDefault();
          // Clear all selections
          setMultiSelection(null);
          setClipAreaSelection(null);
          setContextMenu(null);
          setAudioContextMenu(null);
          setClipContextMenu(null);
          break;
          
        case 'delete':
        case 'backspace':
          e.preventDefault();
          // Delete selected clips
          if (multiSelection && multiSelection.selectedClips.length > 0) {
            console.log('Deleting selected clips:', multiSelection.selectedClips);
            // In a real implementation, this would call an onDeleteClips callback
            setMultiSelection(null);
          }
          break;
          
        case 'd':
          if (isCtrl) {
            e.preventDefault();
            // Duplicate selected clips
            if (multiSelection && multiSelection.selectedClips.length > 0) {
              console.log('Duplicating selected clips:', multiSelection.selectedClips);
              // In a real implementation, this would call an onDuplicateClips callback
            }
          }
          break;
          
        case 'g':
          if (isCtrl) {
            e.preventDefault();
            // Group selected clips
            if (multiSelection && multiSelection.selectedClips.length > 1) {
              console.log('Grouping selected clips:', multiSelection.selectedClips);
              // In a real implementation, this would call an onGroupClips callback
            }
          }
          break;
          
        case 'u':
          if (isCtrl && isShift) {
            e.preventDefault();
            // Ungroup selected clips
            console.log('Ungrouping selected clips');
            // In a real implementation, this would call an onUngroupClips callback
          }
          break;
          
        case 'arrowleft':
          if (isCtrl && multiSelection && multiSelection.selectedClips.length > 0) {
            e.preventDefault();
            // Nudge selected clips left
            const nudgeAmount = isShift ? 1.0 : 0.1; // Fine vs coarse nudging
            console.log(`Nudging clips left by ${nudgeAmount}s`);
            // In a real implementation, this would call onNudgeClips
          }
          break;
          
        case 'arrowright':
          if (isCtrl && multiSelection && multiSelection.selectedClips.length > 0) {
            e.preventDefault();
            // Nudge selected clips right
            const nudgeAmount = isShift ? 1.0 : 0.1;
            console.log(`Nudging clips right by ${nudgeAmount}s`);
            // In a real implementation, this would call onNudgeClips
          }
          break;
          
        case 'arrowup':
          if (isCtrl && multiSelection && multiSelection.selectedClips.length > 0) {
            e.preventDefault();
            // Move selected clips up one track
            console.log('Moving clips up one track');
            // In a real implementation, this would call onMoveClipsToTrack
          }
          break;
          
        case 'arrowdown':
          if (isCtrl && multiSelection && multiSelection.selectedClips.length > 0) {
            e.preventDefault();
            // Move selected clips down one track
            console.log('Moving clips down one track');
            // In a real implementation, this would call onMoveClipsToTrack
          }
          break;
          
        case 'r':
          if (!isCtrl && !isShift && !isAlt) {
            e.preventDefault();
            // Switch to Range/Selector tool
            setCurrentTool('select');
            console.log('Switched to Range/Selector tool');
          }
          break;
          
        case 'h':
          if (!isCtrl && !isShift && !isAlt) {
            e.preventDefault();
            // Switch to Hand/Pan tool
            setCurrentTool('hand');
            console.log('Switched to Hand/Pan tool');
          }
          break;
          
        case 'e':
          if (!isCtrl && !isShift && !isAlt) {
            e.preventDefault();
            // Switch to Edit tool
            setCurrentTool('edit');
            console.log('Switched to Edit tool');
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [tracks, multiSelection, getTimelineWidth]);

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

  // Handle timeline-based range selection across all clips and empty areas
  const handleTimelineRangeSelection = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Get timeline container for calculations
    const timelineContainer = timelineRef.current;
    if (!timelineContainer) return;
    
    const timelineRect = timelineContainer.getBoundingClientRect();
    const selectionStartX = e.clientX - timelineRect.left;
    const selectionStartY = e.clientY - timelineRect.top;
    const startTrackIndex = Math.floor(selectionStartY / 96);
    
    // Calculate time position on timeline
    const pixelsPerSecond = 60 * zoomLevel;
    const absoluteStartTime = selectionStartX / pixelsPerSecond;
    
    console.log('Starting timeline range selection:', {
      absoluteStartTime: absoluteStartTime.toFixed(3),
      startTrackIndex
    });
    
    let isSelecting = false;
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = Math.abs(moveEvent.clientX - e.clientX);
      const deltaY = Math.abs(moveEvent.clientY - e.clientY);
      
      if (!isSelecting && (deltaX > 3 || deltaY > 3)) {
        isSelecting = true;
        setCursorState('crosshair');
      }
      
      if (isSelecting) {
        const currentX = moveEvent.clientX - timelineRect.left;
        const currentY = moveEvent.clientY - timelineRect.top;
        const currentTrackIndex = Math.floor(currentY / 96);
        
        // Calculate time range
        const absoluteEndTime = currentX / pixelsPerSecond;
        const selectionStartTime = Math.min(absoluteStartTime, absoluteEndTime);
        const selectionEndTime = Math.max(absoluteStartTime, absoluteEndTime);
        
        // Only enable multi-track selection if user is dragging vertically significantly
        const verticalDragThreshold = 48;
        const isVerticalDrag = Math.abs(currentTrackIndex - startTrackIndex) > 0 && 
                              Math.abs(currentY - selectionStartY) > verticalDragThreshold;
        
        let multiTrackData = undefined;
        let primaryTrackId = tracks[startTrackIndex]?.id;
        
        if (isVerticalDrag) {
          // Calculate affected tracks and filter by clips in time range
          const minTrackIndex = Math.max(0, Math.min(startTrackIndex, currentTrackIndex));
          const maxTrackIndex = Math.min(tracks.length - 1, Math.max(startTrackIndex, currentTrackIndex));
          const candidateTracks = tracks.slice(minTrackIndex, maxTrackIndex + 1);
          
          // Filter tracks that have clips overlapping with the selection time range
          const affectedTracks = candidateTracks.filter(candidateTrack => {
            if (!candidateTrack.clips) return false;
            
            return candidateTrack.clips.some(trackClip => {
              const clipStart = trackClip.startTime;
              const clipEnd = trackClip.startTime + trackClip.duration;
              
              // Check if clip overlaps with selection time range
              return clipStart < selectionEndTime && clipEnd > selectionStartTime;
            });
          });
          
          if (affectedTracks.length > 1) {
            multiTrackData = {
              startTrackIndex: minTrackIndex,
              endTrackIndex: maxTrackIndex,
              affectedTracks: affectedTracks.map(t => t.id)
            };
          }
        }
        
        // Create timeline-based selection
        setClipAreaSelection({
          clipId: 'timeline-selection',
          trackId: primaryTrackId || tracks[0]?.id || '',
          startTime: selectionStartTime,
          endTime: selectionEndTime,
          startX: Math.min(selectionStartX, currentX),
          endX: Math.max(selectionStartX, currentX),
          isActive: true,
          multiTrack: multiTrackData
        });
      }
    };
    
    const handleMouseUp = (upEvent: MouseEvent) => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      setCursorState('default');
      
      if (!isSelecting) {
        // Clear any existing selection on timeline click
        setClipAreaSelection(null);
      }
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [tracks, zoomLevel]);

  const handleClipDragStart = useCallback((e: React.MouseEvent, clipId: string, trackId: string) => {
    // Prevent dragging when timeline is locked
    if (isLocked) {
      return;
    }
    
    const track = tracks.find(t => t.id === trackId);
    const clip = track?.clips?.find(c => c.id === clipId);
    const trackIndex = tracks.findIndex(t => t.id === trackId);
    
    if (!clip) return;
    
    // Standard DAW behavior: Check modifier keys
    const isShiftClick = e.shiftKey;
    const isCtrlClick = e.ctrlKey || e.metaKey;
    const isAltClick = e.altKey;
    
    // Detect interaction zone
    const clipElement = e.currentTarget as HTMLElement;
    const zone = getClipInteractionZone(e, clipElement, clip);
    
    if (zone === 'select-area') {
      // Handle timeline-based range selection
      handleTimelineRangeSelection(e);
      return;
    } else if (zone === 'resize-left' || zone === 'resize-right') {
      // Handle resizing
      setCursorState('col-resize');
      handleClipResizeStart(e, clipId, trackId, zone === 'resize-left' ? 'left' : 'right');
      return;
    }
    
    // DAW Standard: Handle clip selection before dragging
    const isClipSelected = multiSelection && multiSelection.selectedClips.includes(clipId);
    
    if (isCtrlClick) {
      // Ctrl+click: Toggle clip selection
      if (isClipSelected && multiSelection) {
        // Remove from selection
        const newSelectedClips = multiSelection.selectedClips.filter(id => id !== clipId);
        if (newSelectedClips.length === 0) {
          setMultiSelection(null);
        } else {
          setMultiSelection({
            ...multiSelection,
            selectedClips: newSelectedClips
          });
        }
      } else {
        // Add to selection
        const existingSelection = multiSelection?.selectedClips || [];
        setMultiSelection({
          startTime: clip.startTime,
          endTime: clip.startTime + clip.duration,
          startTrackIndex: trackIndex,
          endTrackIndex: trackIndex,
          startX: clip.startTime * 60 * zoomLevel,
          endX: (clip.startTime + clip.duration) * 60 * zoomLevel,
          startY: trackIndex * 64,
          endY: (trackIndex + 1) * 64,
          isActive: false,
          selectedClips: [...existingSelection, clipId]
        });
      }
      return; // Don't start drag on Ctrl+click
    } else if (isShiftClick && multiSelection && multiSelection.selectedClips.length > 0) {
      // Shift+click: Extend selection to include range between last selected and this clip
      console.log('Shift+click: Extending selection range');
      // For now, just add this clip to selection
      if (!isClipSelected) {
        setMultiSelection({
          ...multiSelection,
          selectedClips: [...multiSelection.selectedClips, clipId]
        });
      }
      return; // Don't start drag on Shift+click
    } else if (!isClipSelected && !isShiftClick) {
      // Click on unselected clip without modifiers: select only this clip
      setMultiSelection({
        startTime: clip.startTime,
        endTime: clip.startTime + clip.duration,
        startTrackIndex: trackIndex,
        endTrackIndex: trackIndex,
        startX: clip.startTime * 60 * zoomLevel,
        endX: (clip.startTime + clip.duration) * 60 * zoomLevel,
        startY: trackIndex * 64,
        endY: (trackIndex + 1) * 64,
        isActive: false,
        selectedClips: [clipId]
      });
    }
    
    // Default drag behavior for clip movement
    e.stopPropagation();
    e.preventDefault();
    setCursorState('grabbing');
    
    if (clip && trackIndex >= 0) {
      console.log('Starting clip drag:', clipId);
      
      // Check if this clip is part of a multi-selection
      const isMultiSelected = multiSelection && 
        !multiSelection.isActive && 
        multiSelection.selectedClips.includes(clipId);
      
      let selectedClips: Array<{ clipId: string; trackId: string; originalStartTime: number; originalTrackIndex: number; }> = [];
      
      if (isMultiSelected && multiSelection) {
        // Prepare all selected clips for group dragging
        selectedClips = multiSelection.selectedClips.map(selectedClipId => {
          for (let trackIdx = 0; trackIdx < tracks.length; trackIdx++) {
            const currentTrack = tracks[trackIdx];
            const selectedClip = currentTrack.clips?.find(c => c.id === selectedClipId);
            if (selectedClip) {
              return {
                clipId: selectedClipId,
                trackId: currentTrack.id,
                originalStartTime: selectedClip.startTime,
                originalTrackIndex: trackIdx
              };
            }
          }
          return null;
        }).filter(Boolean) as Array<{ clipId: string; trackId: string; originalStartTime: number; originalTrackIndex: number; }>;
        
        console.log('Group dragging selected clips:', selectedClips.length);
      }
      
      // Calculate where within the clip the mouse grabbed it
      const clipElement = e.currentTarget as HTMLElement;
      const clipRect = clipElement.getBoundingClientRect();
      const initialGrabOffset = e.clientX - clipRect.left;
      
      const dragState = {
        clipId,
        trackId,
        startX: e.clientX,
        startY: e.clientY,
        originalStartTime: clip.startTime,
        originalTrackIndex: trackIndex,
        currentTrackIndex: trackIndex,
        currentOffsetX: 0,
        currentOffsetY: 0,
        initialGrabOffset: initialGrabOffset, // Store where mouse grabbed within clip
        selectedClips: selectedClips.length > 0 ? selectedClips : undefined
      };
      
      setDraggingClip(dragState);
      setIsDragging(true);
      
      // Add document-level mouse event listeners for smooth dragging
      const handleDocumentMouseMove = (e: MouseEvent) => {
        e.preventDefault();
        
        const deltaX = e.clientX - dragState.startX;
        const deltaY = e.clientY - dragState.startY;
        
        // Calculate new track position with improved smoothing
        const trackHeight = 64;
        const newTrackIndex = Math.max(0, Math.min(tracks.length - 1, 
          dragState.originalTrackIndex + Math.round(deltaY / trackHeight)
        ));
        
        // Use requestAnimationFrame for smooth updates
        requestAnimationFrame(() => {
          setDraggingClip(prev => prev ? {
            ...prev,
            currentTrackIndex: newTrackIndex,
            currentOffsetX: deltaX,
            currentOffsetY: deltaY
          } : null);
        });
      };
      
      const handleDocumentMouseUp = (e: MouseEvent) => {
        document.removeEventListener('mousemove', handleDocumentMouseMove);
        document.removeEventListener('mouseup', handleDocumentMouseUp);
        
        console.log('Mouse up - finalizing clip drag for:', dragState.clipId);
        
        // Get timeline container and calculate exact position
        const timelineContainer = document.querySelector('[data-timeline-container]');
        if (!timelineContainer) {
          console.error('Timeline container not found');
          setDraggingClip(null);
          setIsDragging(false);
          return;
        }
        
        const containerRect = timelineContainer.getBoundingClientRect();
        const scrollLeft = timelineContainer.scrollLeft || 0;
        
        // Calculate exact position compensating for initial grab offset
        const relativeX = e.clientX - containerRect.left + scrollLeft;
        const adjustedX = relativeX - dragState.initialGrabOffset;
        
        // Calculate exact time position with improved precision
        const pixelsPerSecond = 60 * zoomLevel;
        const rawNewStartTime = Math.max(0, adjustedX / pixelsPerSecond);
        const newStartTime = calculateSnappedTime(rawNewStartTime);
        
        console.log(`Precise position calculation:
          Mouse clientX: ${e.clientX}
          Container left: ${containerRect.left}
          Scroll left: ${scrollLeft}
          Relative X: ${relativeX}
          Initial grab offset: ${dragState.initialGrabOffset}
          Adjusted X: ${adjustedX}
          Pixels per second: ${pixelsPerSecond}
          Raw time: ${rawNewStartTime.toFixed(3)}s
          Snapped time: ${newStartTime.toFixed(3)}s`);
        
        const deltaY = e.clientY - dragState.startY;
        
        const trackHeight = 64;
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
        
        // Handle group movement if multiple clips are selected
        if (dragState.selectedClips && dragState.selectedClips.length > 0) {
          console.log(`Group moving ${dragState.selectedClips.length} clips`);
          
          // Calculate the primary clip's movement (the one being dragged)
          const primaryClipDeltaTime = newStartTime - dragState.originalStartTime;
          const primaryClipTrackDelta = Math.round(deltaY / trackHeight);
          
          // Check if all clips can move to their new positions without conflicts
          let canMoveGroup = true;
          let finalDeltaTime = primaryClipDeltaTime;
          let finalTrackDelta = primaryClipTrackDelta;
          const proposedMoves: Array<{
            clipId: string;
            fromTrackId: string;
            toTrackId: string;
            newStartTime: number;
          }> = [];
          
          // Helper function to check for collisions and find dodging position
          const findValidGroupPosition = (deltaTime: number, trackDelta: number, maxAttempts = 10): { deltaTime: number; trackDelta: number; valid: boolean } => {
            for (let attempt = 0; attempt < maxAttempts; attempt++) {
              let hasCollision = false;
              const testMoves: Array<{
                clipId: string;
                fromTrackId: string;
                toTrackId: string;
                newStartTime: number;
              }> = [];
              
              // Test all clips at this position
              for (const selectedClip of dragState.selectedClips || []) {
                let clipNewStartTime = selectedClip.originalStartTime + deltaTime;
                let clipNewTrackIndex = selectedClip.originalTrackIndex + trackDelta;
                
                // Check boundaries
                if (clipNewStartTime < 0 || clipNewTrackIndex < 0 || clipNewTrackIndex >= tracks.length) {
                  hasCollision = true;
                  break;
                }
                
                const clipNewTrackId = tracks[clipNewTrackIndex]?.id;
                if (!clipNewTrackId) {
                  hasCollision = true;
                  break;
                }
                
                // Get the clip's duration for collision detection
                const originalTrack = tracks.find(t => t.id === selectedClip.trackId);
                const originalClip = originalTrack?.clips?.find(c => c.id === selectedClip.clipId);
                const clipDuration = originalClip?.duration || 10;
                
                // Check for collisions with existing clips on the target track
                const targetTrack = tracks[clipNewTrackIndex];
                const existingClips = targetTrack.clips || [];
                
                for (const existingClip of existingClips) {
                  // Skip if it's one of the clips being moved
                  if (dragState.selectedClips?.some(sc => sc.clipId === existingClip.id)) {
                    continue;
                  }
                  
                  // Check for time overlap
                  const clipEnd = clipNewStartTime + clipDuration;
                  const existingEnd = existingClip.startTime + existingClip.duration;
                  
                  if (!(clipEnd <= existingClip.startTime || clipNewStartTime >= existingEnd)) {
                    hasCollision = true;
                    break;
                  }
                }
                
                if (hasCollision) break;
                
                testMoves.push({
                  clipId: selectedClip.clipId,
                  fromTrackId: selectedClip.trackId,
                  toTrackId: clipNewTrackId,
                  newStartTime: clipNewStartTime
                });
              }
              
              if (!hasCollision) {
                return { deltaTime, trackDelta, valid: true };
              }
              
              // Try dodging in the direction opposite to movement
              const dodgeDirection = deltaTime >= 0 ? -1 : 1;
              deltaTime += dodgeDirection * 5; // Dodge by 5 seconds
            }
            
            return { deltaTime: primaryClipDeltaTime, trackDelta: primaryClipTrackDelta, valid: false };
          };
          
          // Find valid position with dodging
          const validPosition = findValidGroupPosition(primaryClipDeltaTime, primaryClipTrackDelta);
          
          if (validPosition.valid) {
            finalDeltaTime = validPosition.deltaTime;
            finalTrackDelta = validPosition.trackDelta;
            
            // Generate final moves with the valid position
            for (const selectedClip of dragState.selectedClips || []) {
              let clipNewStartTime = selectedClip.originalStartTime + finalDeltaTime;
              let clipNewTrackIndex = selectedClip.originalTrackIndex + finalTrackDelta;
              const clipNewTrackId = tracks[clipNewTrackIndex]?.id;
              
              if (clipNewTrackId) {
                proposedMoves.push({
                  clipId: selectedClip.clipId,
                  fromTrackId: selectedClip.trackId,
                  toTrackId: clipNewTrackId,
                  newStartTime: clipNewStartTime
                });
              }
            }
          } else {
            console.log(`Group move blocked: could not find valid position even with dodging`);
            canMoveGroup = false;
          }
          
          // Only move if all clips can be moved successfully
          if (canMoveGroup && onClipMove) {
            console.log(`Moving group of ${proposedMoves.length} clips`);
            proposedMoves.forEach(move => {
              console.log(`Moving selected clip ${move.clipId} to ${move.newStartTime}s on track ${move.toTrackId}`);
              onClipMove(move.clipId, move.fromTrackId, move.toTrackId, move.newStartTime);
            });
          } else {
            console.log(`Group move cancelled - one or more clips blocked`);
          }
          
          // Clear the multi-selection after group move
          setMultiSelection(null);
        } else {
          // Single clip movement
          console.log(`Clip ${dragState.clipId} moved to ${newStartTime}s on track ${newTrackId} (index ${newTrackIndex})`);
          
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
        }
        
        console.log('Setting dragging clip to null');
        setDraggingClip(null);
      };
      
      document.addEventListener('mousemove', handleDocumentMouseMove);
      document.addEventListener('mouseup', handleDocumentMouseUp);
    }
  }, [tracks, onClipMove, zoomLevel, getTimelineWidth]);

  // Clip resizing functionality
  const handleClipResizeStart = useCallback((e: React.MouseEvent, clipId: string, trackId: string, edge: 'left' | 'right') => {
    // Prevent resizing when timeline is locked
    if (isLocked) {
      return;
    }
    
    e.preventDefault();
    e.stopPropagation();
    
    const track = tracks.find(t => t.id === trackId);
    const clip = track?.clips?.find(c => c.id === clipId);
    if (!clip) return;
    
    console.log('Starting clip resize:', clipId, edge);
    
    setResizingClip({
      clipId,
      trackId,
      edge,
      startX: e.clientX,
      originalStartTime: clip.startTime,
      originalDuration: clip.duration
    });
  }, [tracks]);

  // Handle clip resize movement
  useEffect(() => {
    if (!resizingClip) return;

    const handleDocumentMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - resizingClip.startX;
      const timelineWidth = getTimelineWidth();
      const totalTime = timelineWidth / zoomLevel;
      const deltaTime = (deltaX / timelineWidth) * totalTime;
      
      // Calculate new clip properties based on resize edge
      let newStartTime = resizingClip.originalStartTime;
      let newDuration = resizingClip.originalDuration;
      
      if (resizingClip.edge === 'left') {
        // Resizing from the left edge - changes start time and duration
        newStartTime = Math.max(0, resizingClip.originalStartTime + deltaTime);
        newDuration = resizingClip.originalDuration - (newStartTime - resizingClip.originalStartTime);
      } else {
        // Resizing from the right edge - only changes duration
        newDuration = Math.max(0.1, resizingClip.originalDuration + deltaTime);
      }
      
      // Ensure minimum duration
      newDuration = Math.max(0.1, newDuration);
      
      // Check if we're extending beyond original clip bounds (virtual extension)
      const isExtending = (resizingClip.edge === 'right' && newDuration > resizingClip.originalDuration) ||
                         (resizingClip.edge === 'left' && newStartTime < resizingClip.originalStartTime);
      
      if (isExtending) {
        // Calculate virtual extension properties
        const track = tracks.find(t => t.id === resizingClip.trackId);
        const trackIndex = tracks.findIndex(t => t.id === resizingClip.trackId);
        
        if (track && trackIndex >= 0) {
          const extensionLength = resizingClip.edge === 'right' 
            ? newDuration - resizingClip.originalDuration
            : resizingClip.originalStartTime - newStartTime;
          
          const extensionStartTime = resizingClip.edge === 'right'
            ? resizingClip.originalStartTime + resizingClip.originalDuration
            : newStartTime;
          
          const extensionEndTime = resizingClip.edge === 'right'
            ? resizingClip.originalStartTime + newDuration
            : resizingClip.originalStartTime;
          
          // Calculate position and dimensions for virtual extension overlay using consistent pixel-per-second calculation
          const pixelsPerSecond = 60 * zoomLevel; // Use same calculation as clip rendering
          const extensionX = extensionStartTime * pixelsPerSecond;
          const extensionWidth = extensionLength * pixelsPerSecond;
          const extensionY = trackIndex * 64; // Track height is 64px, not 96px
          
          setVirtualExtension({
            clipId: resizingClip.clipId,
            trackId: resizingClip.trackId,
            edge: resizingClip.edge,
            startTime: extensionStartTime,
            endTime: extensionEndTime,
            originalStartTime: resizingClip.originalStartTime,
            originalDuration: resizingClip.originalDuration,
            extensionLength,
            x: extensionX,
            y: extensionY,
            width: extensionWidth
          });
        }
      } else {
        setVirtualExtension(null);
      }
      
      console.log('Resizing clip:', { edge: resizingClip.edge, newStartTime, newDuration, isExtending });
    };

    const handleDocumentMouseUp = (e: MouseEvent) => {
      console.log('Clip resize finished for:', resizingClip.clipId);
      
      const deltaX = e.clientX - resizingClip.startX;
      const timelineWidth = getTimelineWidth();
      const totalTime = timelineWidth / zoomLevel;
      const deltaTime = (deltaX / timelineWidth) * totalTime;
      
      // Calculate final clip properties
      let newStartTime = resizingClip.originalStartTime;
      let newDuration = resizingClip.originalDuration;
      
      if (resizingClip.edge === 'left') {
        newStartTime = Math.max(0, resizingClip.originalStartTime + deltaTime);
        newDuration = resizingClip.originalDuration - (newStartTime - resizingClip.originalStartTime);
      } else {
        newDuration = Math.max(0.1, resizingClip.originalDuration + deltaTime);
      }
      
      newDuration = Math.max(0.1, newDuration);
      
      // Check if we have a virtual extension (extending beyond original bounds)
      const isExtending = (resizingClip.edge === 'right' && newDuration > resizingClip.originalDuration) ||
                         (resizingClip.edge === 'left' && newStartTime < resizingClip.originalStartTime);
      
      if (isExtending && virtualExtension) {
        // Keep virtual extension active for user to choose action - don't apply resize yet
        console.log('Virtual extension active - waiting for user action');
      } else if (!isExtending) {
        // Only apply resize if not extending beyond original bounds
        if (Math.abs(newStartTime - resizingClip.originalStartTime) > 0.01 || 
            Math.abs(newDuration - resizingClip.originalDuration) > 0.01) {
          
          if (onClipResize) {
            console.log('Applying clip resize within bounds:', { clipId: resizingClip.clipId, newStartTime, newDuration });
            onClipResize(resizingClip.clipId, resizingClip.trackId, newStartTime, newDuration);
          }
        }
        setVirtualExtension(null);
      }
      
      setResizingClip(null);
    };

    document.addEventListener('mousemove', handleDocumentMouseMove);
    document.addEventListener('mouseup', handleDocumentMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleDocumentMouseMove);
      document.removeEventListener('mouseup', handleDocumentMouseUp);
    };
  }, [resizingClip, zoomLevel, getTimelineWidth, onClipMove]);

  const handleMultiSelectionStart = useCallback((e: React.MouseEvent, startTrackIndex: number) => {
    if (e.button !== 0) return; // Only left click
    
    // Prevent multi-selection when timeline is locked
    if (isLocked) {
      return;
    }
    
    // Standard DAW behavior: Check modifier keys for selection behavior
    const isShiftClick = e.shiftKey;
    const isCtrlClick = e.ctrlKey || e.metaKey;
    const isAltClick = e.altKey;
    
    // If there's already an active multi-selection with clips
    if (multiSelection && !multiSelection.isActive && multiSelection.selectedClips.length > 0) {
      const timelineRect = timelineRef.current?.getBoundingClientRect();
      if (!timelineRect) return;
      
      const clickX = e.clientX - timelineRect.left + scrollX;
      const timelineWidth = getTimelineWidth();
      const totalTime = timelineWidth / zoomLevel;
      const clickTime = (clickX / timelineWidth) * totalTime;
      
      const isWithinTimeRange = clickTime >= multiSelection.startTime && clickTime <= multiSelection.endTime;
      const isWithinTrackRange = startTrackIndex >= multiSelection.startTrackIndex && 
                                startTrackIndex <= multiSelection.endTrackIndex;
      
      if (isWithinTimeRange && isWithinTrackRange) {
        // DAW Standard: Click within selection area starts drag unless Ctrl/Cmd is held
        if (!isCtrlClick) {
          // Start dragging the selection
          console.log('Starting drag of existing selection');
          return;
        } else {
          // Ctrl/Cmd+click within selection: deselect this area
          console.log('Deselecting area with Ctrl+click');
          setMultiSelection(null);
          setClipAreaSelection(null);
          return;
        }
      }
      
      // Click outside selection area
      if (!isShiftClick && !isCtrlClick) {
        // Standard: Clear previous selection when clicking outside without modifiers
        setMultiSelection(null);
        setClipAreaSelection(null);
      }
    }
    
    const timelineRect = timelineRef.current?.getBoundingClientRect();
    if (!timelineRect) return;
    
    const startX = e.clientX - timelineRect.left + scrollX;
    const trackY = startTrackIndex * 64; // Track height is 64px
    const startY = trackY + (e.clientY - e.currentTarget.getBoundingClientRect().top);
    
    const timelineWidth = getTimelineWidth();
    const pixelsPerSecond = 60 * zoomLevel;
    const startTime = startX / pixelsPerSecond;
    
    console.log('Starting DAW-style selection:', { 
      startTime: startTime.toFixed(3), 
      startTrackIndex, 
      modifiers: { shift: isShiftClick, ctrl: isCtrlClick, alt: isAltClick }
    });
    
    setMultiSelection({
      startTime,
      endTime: startTime,
      startTrackIndex,
      endTrackIndex: startTrackIndex,
      startX,
      endX: startX,
      startY,
      endY: startY,
      isActive: true,
      selectedClips: []
    });
  }, [scrollX, zoomLevel, getTimelineWidth, multiSelection, tracks]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left click
    
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    
    // DAW Standard: Check modifier keys for empty space clicks
    const isCtrlClick = e.ctrlKey || e.metaKey;
    const isShiftClick = e.shiftKey;
    
    // Clear clip area selection when clicking on empty space
    const target = e.target as HTMLElement;
    const isClickingOnClip = target.closest('[data-clip-element]');
    const isClickingOnSelection = target.closest('[data-selection-box]');
    
    if (!isClickingOnClip && !isClickingOnSelection) {
      // Clicking on empty timeline space
      if (!isCtrlClick && !isShiftClick) {
        // Standard behavior: clear all selections when clicking empty space without modifiers
        setClipAreaSelection(null);
        setMultiSelection(null);
      }
    }
    
    // Start selection box if using select tool and not clicking on clips/selections
    if (currentTool === 'select' && !isClickingOnClip && !isClickingOnSelection) {
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

    // Update multi-track selection if active
    if (multiSelection && multiSelection.isActive) {
      const rect = timelineRef.current?.getBoundingClientRect();
      if (rect) {
        const currentX = e.clientX - rect.left + scrollX;
        const currentY = e.clientY - rect.top;
        const timelineWidth = getTimelineWidth();
        const totalTime = timelineWidth / zoomLevel;
        const currentTime = (currentX / timelineWidth) * totalTime;
        const currentTrackIndex = Math.floor(currentY / 96);
        
        // Calculate which clips are within the selection area
        const startTime = Math.min(multiSelection.startTime, currentTime);
        const endTime = Math.max(multiSelection.startTime, currentTime);
        const startTrackIndex = Math.min(multiSelection.startTrackIndex, currentTrackIndex);
        const endTrackIndex = Math.max(multiSelection.startTrackIndex, currentTrackIndex);
        
        const selectedClips: string[] = [];
        for (let trackIdx = startTrackIndex; trackIdx <= endTrackIndex && trackIdx < tracks.length; trackIdx++) {
          const track = tracks[trackIdx];
          track.clips?.forEach(clip => {
            const clipStart = clip.startTime;
            const clipEnd = clip.startTime + clip.duration;
            // Check if clip overlaps with selection
            if (clipStart < endTime && clipEnd > startTime) {
              selectedClips.push(clip.id);
            }
          });
        }
        
        setMultiSelection(prev => prev ? {
          ...prev,
          endTime: currentTime,
          endX: currentX,
          endY: currentY,
          endTrackIndex: currentTrackIndex,
          selectedClips
        } : null);
      }
    }
  }, [isDragging, dragStart, zoomLevel, tracks.length, isSelecting, selectionBox, tracks, multiSelection, scrollX, draggingClip, getTimelineWidth]);

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    setIsDragging(false);
    setIsSelecting(false);
    setSelectionBox(null);
    
    // Note: Clip dragging finalization is handled by the document mouse up handler
    // to avoid duplicate calls to onClipMove
    
    // Finalize multi-track selection if it exists and has meaningful content
    if (multiSelection && (Math.abs(multiSelection.endTime - multiSelection.startTime) > 0.1 || multiSelection.selectedClips.length > 0)) {
      // Normalize the selection coordinates
      const startTime = Math.min(multiSelection.startTime, multiSelection.endTime);
      const endTime = Math.max(multiSelection.startTime, multiSelection.endTime);
      const startX = Math.min(multiSelection.startX, multiSelection.endX);
      const endX = Math.max(multiSelection.startX, multiSelection.endX);
      const startY = Math.min(multiSelection.startY, multiSelection.endY);
      const endY = Math.max(multiSelection.startY, multiSelection.endY);
      const startTrackIndex = Math.min(multiSelection.startTrackIndex, multiSelection.endTrackIndex);
      const endTrackIndex = Math.max(multiSelection.startTrackIndex, multiSelection.endTrackIndex);
      
      setMultiSelection(prev => prev ? {
        ...prev,
        startTime,
        endTime,
        startX,
        endX,
        startY,
        endY,
        startTrackIndex,
        endTrackIndex,
        isActive: false
      } : null);
      
      console.log('Multi-track selection finalized:', { startTime, endTime, startTrackIndex, endTrackIndex, selectedClips: multiSelection.selectedClips });
    } else if (multiSelection) {
      // Selection too small, clear it
      console.log('Selection too small, clearing:', multiSelection);
      setMultiSelection(null);
    }
  }, [multiSelection, draggingClip, zoomLevel]);

  const handleScroll = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      // Zoom with Ctrl+scroll
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      const newZoomLevel = Math.max(0.1, Math.min(5, zoomLevel + delta));
      onZoomChange?.(newZoomLevel);
    } else {
      // Horizontal scroll
      setScrollX(prev => Math.max(0, prev + e.deltaX));
    }
  }, [zoomLevel, onZoomChange]);

  // Check if selected clips can be glued together
  const canGlueSelectedClips = useCallback(() => {
    if (!multiSelection || multiSelection.selectedClips.length < 2) {
      return false;
    }

    // Get all selected clips with their track information
    const selectedClipsWithTracks: Array<{ clip: any; trackId: string }> = [];
    
    tracks.forEach(track => {
      track.clips?.forEach(clip => {
        if (multiSelection.selectedClips.includes(clip.id)) {
          selectedClipsWithTracks.push({ clip, trackId: track.id });
        }
      });
    });

    // Group clips by track
    const clipsByTrack = new Map<string, any[]>();
    selectedClipsWithTracks.forEach(({ clip, trackId }) => {
      if (!clipsByTrack.has(trackId)) {
        clipsByTrack.set(trackId, []);
      }
      clipsByTrack.get(trackId)!.push(clip);
    });

    // Check each track to see if clips are adjacent
    for (const [trackId, trackClips] of Array.from(clipsByTrack.entries())) {
      if (trackClips.length < 2) continue;
      
      // Sort clips by start time
      trackClips.sort((a: any, b: any) => a.startTime - b.startTime);
      
      // Check if clips are adjacent (within 0.1 seconds tolerance)
      for (let i = 0; i < trackClips.length - 1; i++) {
        const currentClip = trackClips[i];
        const nextClip = trackClips[i + 1];
        const gap = nextClip.startTime - (currentClip.startTime + currentClip.duration);
        
        if (Math.abs(gap) <= 0.1) {
          return true; // Found at least one set of adjacent clips
        }
      }
    }

    return false;
  }, [multiSelection, tracks]);



  // Handle timeline scroll and sync with tracks panel
  const handleTimelineScroll = useCallback((e: Event) => {
    const target = e.target as HTMLDivElement;
    if (target && tracksRef.current) {
      const newScrollY = target.scrollTop;
      setScrollY(newScrollY);
      // Sync tracks panel scroll
      tracksRef.current.scrollTop = newScrollY;
    }
  }, []);

  // Handle tracks panel scroll and sync with timeline
  const handleTracksScroll = useCallback((e: Event) => {
    const target = e.target as HTMLDivElement;
    if (target && timelineRef.current) {
      const newScrollY = target.scrollTop;
      setScrollY(newScrollY);
      // Sync timeline scroll
      timelineRef.current.scrollTop = newScrollY;
    }
  }, []);

  // Add scroll event listeners for synchronization
  useEffect(() => {
    const timelineElement = timelineRef.current;
    const tracksElement = tracksRef.current;

    if (timelineElement && tracksElement) {
      timelineElement.addEventListener('scroll', handleTimelineScroll);
      tracksElement.addEventListener('scroll', handleTracksScroll);

      return () => {
        timelineElement.removeEventListener('scroll', handleTimelineScroll);
        tracksElement.removeEventListener('scroll', handleTracksScroll);
      };
    }
  }, [handleTimelineScroll, handleTracksScroll]);

  // Handle gluing selected clips together
  const handleGlueClips = useCallback(() => {
    if (!multiSelection || multiSelection.selectedClips.length < 2) {
      return;
    }

    // Get all selected clips with their track information
    const selectedClipsWithTracks: Array<{ clip: any; trackId: string }> = [];
    
    tracks.forEach(track => {
      track.clips?.forEach(clip => {
        if (multiSelection.selectedClips.includes(clip.id)) {
          selectedClipsWithTracks.push({ clip, trackId: track.id });
        }
      });
    });

    // Group clips by track
    const clipsByTrack = new Map<string, any[]>();
    selectedClipsWithTracks.forEach(({ clip, trackId }) => {
      if (!clipsByTrack.has(trackId)) {
        clipsByTrack.set(trackId, []);
      }
      clipsByTrack.get(trackId)!.push(clip);
    });

    // Process each track
    Array.from(clipsByTrack.entries()).forEach(([trackId, trackClips]) => {
      if (trackClips.length < 2) return;
      
      // Sort clips by start time
      trackClips.sort((a: any, b: any) => a.startTime - b.startTime);
      
      // Find groups of adjacent clips
      const adjacentGroups: any[][] = [];
      let currentGroup: any[] = [trackClips[0]];
      
      for (let i = 1; i < trackClips.length; i++) {
        const prevClip = trackClips[i - 1];
        const currentClip = trackClips[i];
        const gap = currentClip.startTime - (prevClip.startTime + prevClip.duration);
        
        if (Math.abs(gap) <= 0.1) {
          // Adjacent clips - add to current group
          currentGroup.push(currentClip);
        } else {
          // Gap found - finalize current group and start new one
          if (currentGroup.length > 1) {
            adjacentGroups.push(currentGroup);
          }
          currentGroup = [currentClip];
        }
      }
      
      // Don't forget the last group
      if (currentGroup.length > 1) {
        adjacentGroups.push(currentGroup);
      }
      
      // Glue each group of adjacent clips
      adjacentGroups.forEach(group => {
        if (group.length < 2) return;
        
        // Calculate combined clip properties
        const firstClip = group[0];
        const lastClip = group[group.length - 1];
        const totalDuration = (lastClip.startTime + lastClip.duration) - firstClip.startTime;
        
        // Create new glued clip
        const gluedClip = {
          id: `glued-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: `Glued: ${group.map((c: any) => c.name).join(' + ')}`,
          startTime: firstClip.startTime,
          duration: totalDuration,
          color: firstClip.color,
          type: 'glued',
          originalClips: group.map((c: any) => c.id)
        };
        
        console.log(`Gluing ${group.length} clips on track ${trackId}:`, group.map((c: any) => c.name).join(', '));
        console.log('Would create glued clip:', gluedClip);
      });
    });

    // Clear selection after gluing
    setMultiSelection(null);
  }, [multiSelection, tracks]);

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

  const handleMultiSelectionRightClick = useCallback((e: React.MouseEvent, trackId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (multiSelection && !multiSelection.isActive) {
      const track = tracks.find(t => t.id === trackId);
      setAudioContextMenu({
        x: e.clientX,
        y: e.clientY,
        selection: {
          trackId,
          startTime: multiSelection.startTime,
          endTime: multiSelection.endTime,
          trackName: track?.name || 'Unknown Track'
        }
      });
    }
  }, [multiSelection, tracks]);

  const handleSelectionBoxDragStart = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (!multiSelection || multiSelection.isActive || multiSelection.selectedClips.length === 0) return;
    
    console.log(`Starting selection box drag with ${multiSelection.selectedClips.length} clips`);
    
    // Prepare all selected clips for group dragging
    const selectedClips: Array<{ clipId: string; trackId: string; originalStartTime: number; originalTrackIndex: number; }> = [];
    
    multiSelection.selectedClips.forEach(selectedClipId => {
      for (let trackIdx = 0; trackIdx < tracks.length; trackIdx++) {
        const currentTrack = tracks[trackIdx];
        const selectedClip = currentTrack.clips?.find(c => c.id === selectedClipId);
        if (selectedClip) {
          selectedClips.push({
            clipId: selectedClipId,
            trackId: currentTrack.id,
            originalStartTime: selectedClip.startTime,
            originalTrackIndex: trackIdx
          });
          break;
        }
      }
    });
    
    // Use the first clip as the reference for dragging
    const referenceClip = selectedClips[0];
    if (!referenceClip) return;
    
    const dragState = {
      clipId: referenceClip.clipId,
      trackId: referenceClip.trackId,
      startX: e.clientX,
      startY: e.clientY,
      originalStartTime: referenceClip.originalStartTime,
      originalTrackIndex: referenceClip.originalTrackIndex,
      currentTrackIndex: referenceClip.originalTrackIndex,
      currentOffsetX: 0,
      currentOffsetY: 0,
      initialGrabOffset: 0, // For multi-selection, use 0 as reference
      selectedClips
    };
    
    setDraggingClip(dragState);
    setIsDragging(true);
    
    // Add document-level mouse event listeners for smooth dragging
    const handleDocumentMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - dragState.startX;
      const deltaY = e.clientY - dragState.startY;
      
      // Calculate new track position for reference
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
      
      // Don't update selection coordinates during drag - keep them stable for clickability
      // Visual feedback will be handled through CSS transforms instead
    };
    
    const handleDocumentMouseUp = (e: MouseEvent) => {
      document.removeEventListener('mousemove', handleDocumentMouseMove);
      document.removeEventListener('mouseup', handleDocumentMouseUp);
      
      console.log('Mouse up - finalizing selection box drag');
      
      // Use the same group movement logic as clip dragging
      const deltaX = e.clientX - dragState.startX;
      const deltaY = e.clientY - dragState.startY;
      
      const timelineWidth = getTimelineWidth();
      const totalTime = timelineWidth / zoomLevel;
      const primaryClipDeltaTime = (deltaX / timelineWidth) * totalTime;
      const primaryClipTrackDelta = Math.round(deltaY / 96);
      
      // Check if all clips can move to their new positions with dodging
      let canMoveGroup = true;
      let finalDeltaTime = primaryClipDeltaTime;
      let finalTrackDelta = primaryClipTrackDelta;
      const proposedMoves: Array<{
        clipId: string;
        fromTrackId: string;
        toTrackId: string;
        newStartTime: number;
      }> = [];
      
      // Helper function to check for collisions and find dodging position
      const findValidGroupPosition = (deltaTime: number, trackDelta: number, maxAttempts = 10): { deltaTime: number; trackDelta: number; valid: boolean } => {
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
          let hasCollision = false;
          
          // Test all clips at this position
          for (const selectedClip of selectedClips) {
            let clipNewStartTime = selectedClip.originalStartTime + deltaTime;
            let clipNewTrackIndex = selectedClip.originalTrackIndex + trackDelta;
            
            // Check boundaries
            if (clipNewStartTime < 0 || clipNewTrackIndex < 0 || clipNewTrackIndex >= tracks.length) {
              hasCollision = true;
              break;
            }
            
            const clipNewTrackId = tracks[clipNewTrackIndex]?.id;
            if (!clipNewTrackId) {
              hasCollision = true;
              break;
            }
            
            // Get the clip's duration for collision detection
            const originalTrack = tracks.find(t => t.id === selectedClip.trackId);
            const originalClip = originalTrack?.clips?.find(c => c.id === selectedClip.clipId);
            const clipDuration = originalClip?.duration || 10;
            
            // Check for collisions with existing clips on the target track
            const targetTrack = tracks[clipNewTrackIndex];
            const existingClips = targetTrack.clips || [];
            
            for (const existingClip of existingClips) {
              // Skip if it's one of the clips being moved
              if (selectedClips.some(sc => sc.clipId === existingClip.id)) {
                continue;
              }
              
              // Check for time overlap
              const clipEnd = clipNewStartTime + clipDuration;
              const existingEnd = existingClip.startTime + existingClip.duration;
              
              if (!(clipEnd <= existingClip.startTime || clipNewStartTime >= existingEnd)) {
                hasCollision = true;
                break;
              }
            }
            
            if (hasCollision) break;
          }
          
          if (!hasCollision) {
            return { deltaTime, trackDelta, valid: true };
          }
          
          // Try dodging in the direction opposite to movement
          const dodgeDirection = deltaTime >= 0 ? -1 : 1;
          deltaTime += dodgeDirection * 5; // Dodge by 5 seconds
        }
        
        return { deltaTime: primaryClipDeltaTime, trackDelta: primaryClipTrackDelta, valid: false };
      };
      
      // Find valid position with dodging
      const validPosition = findValidGroupPosition(primaryClipDeltaTime, primaryClipTrackDelta);
      
      if (validPosition.valid) {
        finalDeltaTime = validPosition.deltaTime;
        finalTrackDelta = validPosition.trackDelta;
        
        // Generate final moves with the valid position
        for (const selectedClip of selectedClips) {
          let clipNewStartTime = selectedClip.originalStartTime + finalDeltaTime;
          let clipNewTrackIndex = selectedClip.originalTrackIndex + finalTrackDelta;
          const clipNewTrackId = tracks[clipNewTrackIndex]?.id;
          
          proposedMoves.push({
            clipId: selectedClip.clipId,
            fromTrackId: selectedClip.trackId,
            toTrackId: clipNewTrackId!,
            newStartTime: clipNewStartTime
          });
        }
      } else {
        console.log(`Selection box move blocked: could not find valid position even with dodging`);
        canMoveGroup = false;
      }
      
      if (canMoveGroup && onClipMove) {
        console.log(`Moving selection box with ${proposedMoves.length} clips`);
        proposedMoves.forEach(move => {
          onClipMove(move.clipId, move.fromTrackId, move.toTrackId, move.newStartTime);
        });
        setMultiSelection(null);
      } else {
        console.log('Selection box move cancelled - one or more clips blocked');
      }
      
      setDraggingClip(null);
    };
    
    document.addEventListener('mousemove', handleDocumentMouseMove);
    document.addEventListener('mouseup', handleDocumentMouseUp);
  }, [multiSelection, tracks, onClipMove, zoomLevel, getTimelineWidth]);

  const handleClipRightClick = useCallback((e: React.MouseEvent, clipId: string, trackId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    const track = tracks.find(t => t.id === trackId);
    const clip = track?.clips?.find(c => c.id === clipId);
    
    if (clip && track) {
      setClipContextMenu({
        x: e.clientX,
        y: e.clientY,
        clip: {
          id: clipId,
          name: clip.name,
          trackId: trackId,
          trackName: track.name
        }
      });
    }
  }, [tracks]);

  const getPresetPrompts = useCallback((trackType: string, clipName: string) => {
    const isVocal = clipName.toLowerCase().includes('vocal') || clipName.toLowerCase().includes('voice') || clipName.toLowerCase().includes('bvox');
    const isDrum = clipName.toLowerCase().includes('drum') || clipName.toLowerCase().includes('kick') || clipName.toLowerCase().includes('snare');
    const isGuitar = clipName.toLowerCase().includes('guitar') || clipName.toLowerCase().includes('amp');
    const isBass = clipName.toLowerCase().includes('bass');
    const isPiano = clipName.toLowerCase().includes('piano');
    const isStrings = clipName.toLowerCase().includes('string') || clipName.toLowerCase().includes('violin');
    
    if (trackType === 'ai-generated') {
      return [
        "Enhance the spatial positioning and depth",
        "Make this sound more organic and natural",
        "Add subtle harmonic distortion for warmth",
        "Increase the dynamic range and expression",
        "Blend this better with acoustic elements"
      ];
    }
    
    if (trackType === 'midi') {
      return [
        "Make this MIDI performance more humanized",
        "Add realistic velocity variations",
        "Enhance the expression and dynamics",
        "Create a more natural timing feel",
        "Add subtle pitch variations for realism"
      ];
    }
    
    // Audio clips - type-specific suggestions
    if (isVocal) {
      return [
        "Enhance vocal clarity and presence",
        "Remove background noise and breath sounds",
        "Add warmth and smooth out harsh frequencies",
        "Improve pitch stability and tuning",
        "Create a more intimate vocal sound"
      ];
    }
    
    if (isDrum) {
      return [
        "Enhance the punch and impact",
        "Tighten the low end and add clarity",
        "Create more separation between elements",
        "Add vintage analog warmth",
        "Increase the stereo width"
      ];
    }
    
    if (isGuitar) {
      return [
        "Add vintage tube amp character",
        "Enhance sustain and harmonic content",
        "Clean up fret noise and artifacts",
        "Add spatial depth with reverb",
        "Brighten the tone without harshness"
      ];
    }
    
    if (isBass) {
      return [
        "Enhance low-end definition and punch",
        "Add harmonic excitement to mids",
        "Tighten the timing and groove",
        "Remove muddiness and clarify notes",
        "Add vintage bass amp character"
      ];
    }
    
    if (isPiano) {
      return [
        "Add concert hall ambience",
        "Enhance the natural resonance",
        "Balance the dynamic range",
        "Add vintage piano character",
        "Improve note separation and clarity"
      ];
    }
    
    if (isStrings) {
      return [
        "Add orchestral hall reverb",
        "Enhance the bow articulation",
        "Smooth out harsh frequencies",
        "Add emotional expression",
        "Create a more lush ensemble sound"
      ];
    }
    
    // Generic audio prompts
    return [
      "Enhance overall clarity and presence",
      "Add vintage analog character",
      "Improve the stereo image",
      "Clean up unwanted noise",
      "Add harmonic enhancement"
    ];
  }, []);

  const handleLLMPromptSubmit = useCallback(async () => {
    if (!llmPrompt.trim() || !selectedClipForLLM) return;
    
    try {
      console.log(`LLM Prompt for ${selectedClipForLLM.name}: ${llmPrompt}`);
      // Here we would integrate with Perplexity API
      // For now, just log the prompt
      
      // Reset prompt state
      setLLMPrompt('');
      setShowLLMPrompt(false);
      setSelectedClipForLLM(null);
    } catch (error) {
      console.error('Error processing LLM prompt:', error);
    }
  }, [llmPrompt, selectedClipForLLM]);

  // Close context menus when clicking elsewhere
  useEffect(() => {
    const handleClick = () => {
      setContextMenu(null);
      setAudioContextMenu(null);
      setClipContextMenu(null);
    };
    
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  return (
    <div className="compact-timeline-editor flex h-full bg-[var(--background)]">

      {/* Left Sidebar - Track Headers */}
      <div className="w-64 border-r border-[var(--border)] flex flex-col">
        {/* Header */}
        <div className="h-8 border-b border-[var(--border)] bg-[var(--muted)]/30">
          <div className="flex items-center justify-between px-3 h-full w-full">
            <div className="flex items-center space-x-1 flex-1 justify-evenly">
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
              
              <div className="w-px h-4 bg-[var(--border)]" />
              
              <Button
                onClick={handleGlueClips}
                variant="ghost"
                size="sm"
                className="h-5 w-5 p-0"
                disabled={!canGlueSelectedClips()}
                title="Glue selected clips together"
              >
                <Link className="w-3 h-3" />
              </Button>
            </div>
          </div>
          

        </div>
        
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
                
                // Calculate total height for the group
                const groupHeight = allGroupTracks.length * 64; // 64px per track (h-16 = 4rem = 64px)
                
                // Render single container for the entire group
                renderedTracks.push(
                  <div
                    key={`track-group-${track.id}`}
                    className={`border-b border-[var(--border)] border-l-4 px-3 py-1 cursor-pointer transition-colors group ${
                      allGroupTracks.some(t => selectedTrackIds.includes(t.id))
                        ? 'border-l-[var(--primary)]' 
                        : 'hover:brightness-110'
                    }`}
                    style={{ 
                      height: `${groupHeight}px`,
                      borderLeftColor: allGroupTracks.some(t => selectedTrackIds.includes(t.id)) 
                        ? 'var(--primary)' 
                        : track.color,
                      backgroundColor: (() => {
                        if (allGroupTracks.some(t => selectedTrackIds.includes(t.id))) {
                          return 'var(--accent)';
                        }
                        // Convert track color to rgba with 10% opacity
                        const hex = track.color.replace('#', '');
                        const r = parseInt(hex.substr(0, 2), 16);
                        const g = parseInt(hex.substr(2, 2), 16);
                        const b = parseInt(hex.substr(4, 2), 16);
                        return `rgba(${r}, ${g}, ${b}, 0.1)`;
                      })()
                    }}
                    onClick={(e) => handleTrackSelect(track.id, e)}
                    onContextMenu={(e) => handleTrackRightClick(e, track.id)}
                  >
                    {/* Parent track header positioned in the middle of the group */}
                    <div 
                      className="flex items-center justify-between min-w-0"
                      style={{ 
                        height: '100%',
                        alignItems: 'center'
                      }}
                    >
                      <div className="flex items-center space-x-2 min-w-0">
                        {/* Collapse/Expand Icon */}
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleGroupCollapse?.(track.id);
                          }}
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0 hover:bg-[var(--accent)]"
                        >
                          {collapsedGroups.has(track.id) ? (
                            <ChevronRight className="w-3 h-3 text-[var(--muted-foreground)]" />
                          ) : (
                            <ChevronDown className="w-3 h-3 text-[var(--muted-foreground)]" />
                          )}
                        </Button>
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
                
                // Skip all tracks in this group
                i += allGroupTracks.length;
              } else if (!track.parentId) {
                // Regular track (not grouped)
                renderedTracks.push(
                  <div
                    key={`track-sidebar-${track.id}-${i}`}
                    className={`h-16 border-b border-[var(--border)] border-l-4 px-3 py-1 cursor-pointer transition-colors group ${
                      selectedTrackIds.includes(track.id) 
                        ? 'border-l-[var(--primary)]' 
                        : 'hover:brightness-110'
                    }`}
                    style={{ 
                      borderLeftColor: selectedTrackIds.includes(track.id) 
                        ? 'var(--primary)' 
                        : track.color,
                      backgroundColor: (() => {
                        if (selectedTrackIds.includes(track.id)) {
                          return 'var(--accent)';
                        }
                        // Convert track color to rgba with 10% opacity
                        const hex = track.color.replace('#', '');
                        const r = parseInt(hex.substr(0, 2), 16);
                        const g = parseInt(hex.substr(2, 2), 16);
                        const b = parseInt(hex.substr(4, 2), 16);
                        return `rgba(${r}, ${g}, ${b}, 0.1)`;
                      })()
                    }}
                    onClick={(e) => handleTrackSelect(track.id, e)}
                    onContextMenu={(e) => handleTrackRightClick(e, track.id)}
                  >
                    <div className="flex items-center justify-between min-w-0 mb-1">
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
                    </div>
                    <div className="flex items-center space-x-1">
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
          onMouseDown={(e) => {
            // Check if clicking on empty timeline area (not on a clip)
            const target = e.target as HTMLElement;
            const isClipElement = target.closest('[data-clip-id]');
            
            if (!isClipElement && currentTool === 'select') {
              handleTimelineRangeSelection(e);
            } else {
              handleMouseDown(e);
            }
          }}
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
              height: `${tracks.length * 64}px`,
              transform: `translateX(-${scrollX}px)`
            }}
          >
            {/* Grid lines inside timeline content */}
            <canvas
              ref={canvasRef}
              className="absolute top-0 left-0 pointer-events-none z-0"
              width={getTimelineWidth()}
              height={tracks.length * 64}
            />
            {tracks.map((track, index) => {
              // Convert track color to rgba with 5% opacity
              const getTrackBackgroundColor = (color: string) => {
                // Remove # if present
                const hex = color.replace('#', '');
                // Convert hex to rgb
                const r = parseInt(hex.substr(0, 2), 16);
                const g = parseInt(hex.substr(2, 2), 16);
                const b = parseInt(hex.substr(4, 2), 16);
                return `rgba(${r}, ${g}, ${b}, 0.05)`;
              };

              return (
                <div
                  key={`track-timeline-${track.id}-${index}`}
                  className={`absolute left-0 right-0 h-16 transition-colors ${
                    selectedTrackIds.includes(track.id) 
                      ? 'border-2 border-[var(--primary)]' 
                      : draggingClip && draggingClip.currentTrackIndex === index
                        ? 'border-2 border-[var(--primary)] border-dashed'
                        : 'hover:brightness-110'
                  }`}
                  style={{ 
                    top: `${index * 64}px`,
                    backgroundColor: getTrackBackgroundColor(track.color)
                  }}
                  onClick={(e) => handleTrackSelect(track.id, e)}
                  onContextMenu={(e) => handleTrackRightClick(e, track.id)}
                >
                {/* Audio Clips */}
                <div 
                  className="h-full relative cursor-crosshair"
                  onMouseDown={(e) => handleMultiSelectionStart(e, index)}
                  onContextMenu={(e) => handleMultiSelectionRightClick(e, track.id)}
                >
                  {track.clips?.map((clip) => {
                    const timelineWidth = getTimelineWidth();
                    const pixelsPerSecond = 60 * zoomLevel; // Use same calculation as drag logic
                    const clipStartX = clip.startTime * pixelsPerSecond;
                    const clipWidth = clip.duration * pixelsPerSecond;
                    
                    return (
                      <div
                        key={`${track.id}-clip-${clip.id}`}
                        data-clip-id={clip.id}
                        data-clip-element="true"
                        className={`absolute top-1 h-[58px] rounded-md shadow-md border border-opacity-30 cursor-move hover:shadow-lg transition-all duration-200 ${
                          draggingClip?.clipId === clip.id 
                            ? 'opacity-60 scale-105 z-50' 
                            : draggingClip?.selectedClips?.some(sc => sc.clipId === clip.id)
                              ? 'opacity-70 scale-102 z-40 ring-2 ring-[var(--primary)]'
                              : multiSelection && multiSelection.selectedClips.includes(clip.id)
                                ? 'ring-2 ring-[var(--primary)]'
                                : 'z-5'
                        }`}
                        onMouseDown={(e) => handleClipDragStart(e, clip.id, track.id)}
                        onMouseMove={(e) => {
                          const zone = getClipInteractionZone(e, e.currentTarget as HTMLElement, clip);
                          updateCursorForClip(zone);
                        }}
                        onMouseLeave={() => setCursorState('default')}
                        onContextMenu={(e) => {
                          // Check if there's an active selection on this clip
                          if (clipAreaSelection && clipAreaSelection.clipId === clip.id) {
                            // Prevent the clip's context menu from showing
                            e.preventDefault();
                            e.stopPropagation();
                            return;
                          }
                          handleClipRightClick(e, clip.id, track.id);
                        }}
                        onDoubleClick={() => console.log('Edit clip:', clip.name)}
                        style={{
                          left: `${clipStartX}px`,
                          width: `${clipWidth}px`,
                          backgroundColor: clip.color,
                          borderColor: clip.color,
                          cursor: cursorState,
                          transform: (() => {
                            if (draggingClip?.clipId === clip.id && draggingClip.selectedClips && draggingClip.selectedClips.length > 0) {
                              return `translate(${draggingClip.currentOffsetX}px, ${draggingClip.currentOffsetY}px)`;
                            }
                            else if (draggingClip?.clipId === clip.id) {
                              return `translate(${draggingClip.currentOffsetX}px, ${draggingClip.currentOffsetY}px)`;
                            }
                            else if (draggingClip?.selectedClips?.some(sc => sc.clipId === clip.id)) {
                              return `translate(${draggingClip.currentOffsetX}px, ${draggingClip.currentOffsetY}px)`;
                            }
                            return 'none';
                          })(),
                          zIndex: draggingClip?.clipId === clip.id ? 50 : 
                                 draggingClip?.selectedClips?.some(sc => sc.clipId === clip.id) ? 40 : 5
                        }}
                      >
                        {/* Clip Header */}
                        <div className="h-4 bg-black bg-opacity-20 rounded-t-md px-2 flex items-center justify-between text-xs text-white font-medium">
                          <span className="truncate flex-1 text-xs">{clip.name}</span>
                          <span className="text-xs opacity-75">{clip.duration.toFixed(1)}s</span>
                        </div>
                        
                        {/* Line Waveform */}
                        <div className="h-[50px] px-2 py-1 relative">
                          {clip.waveformData && (
                            <svg className="w-full h-full" viewBox={`0 0 ${clipWidth} 46`} preserveAspectRatio="none">
                              <path
                                d={`M 0,23 ${clip.waveformData.map((amplitude, i) => {
                                  const x = (i / (clip.waveformData!.length - 1)) * clipWidth;
                                  const y = 23 - ((amplitude - 50) / 50) * 22;
                                  return `L ${x},${y}`;
                                }).join(' ')}`}
                                stroke="rgba(255,255,255,0.8)"
                                strokeWidth="1"
                                fill="none"
                                vectorEffect="non-scaling-stroke"
                              />
                              <line
                                x1="0"
                                y1="23"
                                x2={clipWidth}
                                y2="23"
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
                        
                        {/* Clip Area Selection Overlay - Darker shade of clip color */}
                        {clipAreaSelection && (
                          clipAreaSelection.clipId === clip.id || 
                          (clipAreaSelection.multiTrack && clipAreaSelection.multiTrack.affectedTracks.includes(track.id))
                        ) && (
                          <div 
                            className="absolute top-0"
                            style={{
                              left: `${clipAreaSelection.startX}px`,
                              width: `${clipAreaSelection.endX - clipAreaSelection.startX}px`,
                              height: '100%',
                              background: (() => {
                                // Create darker shade of clip color
                                const clipColorRgb = clip.color;
                                // Convert hex to rgb and darken by 40%
                                const hex = clipColorRgb.replace('#', '');
                                const r = parseInt(hex.substr(0, 2), 16);
                                const g = parseInt(hex.substr(2, 2), 16);
                                const b = parseInt(hex.substr(4, 2), 16);
                                return `rgba(${Math.floor(r * 0.5)}, ${Math.floor(g * 0.5)}, ${Math.floor(b * 0.5)}, 0.6)`;
                              })(),
                              borderRadius: '2px'
                            }}
                            onContextMenu={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              
                              const selectionLabel = clipAreaSelection.multiTrack 
                                ? `Range Selection (${clipAreaSelection.multiTrack.affectedTracks.length} tracks)`
                                : `Range Selection`;
                              
                              setClipContextMenu({
                                x: e.clientX,
                                y: e.clientY,
                                clip: {
                                  id: clip.id,
                                  name: selectionLabel,
                                  trackId: track.id,
                                  trackName: track.name
                                }
                              });
                            }}
                          />
                        )}

                        {/* Resize Handles */}
                        <div 
                          className="absolute left-0 top-0 w-2 h-full cursor-ew-resize bg-white bg-opacity-0 hover:bg-opacity-30 transition-colors"
                          onMouseDown={(e) => handleClipResizeStart(e, clip.id, track.id, 'left')}
                        />
                        <div 
                          className="absolute right-0 top-0 w-2 h-full cursor-ew-resize bg-white bg-opacity-0 hover:bg-opacity-30 transition-colors"
                          onMouseDown={(e) => handleClipResizeStart(e, clip.id, track.id, 'right')}
                        />
                      </div>
                    );
                  })}
                  
                  {/* Multi-track Selection Overlay - highlight selected clips */}
                  {multiSelection && !multiSelection.isActive && (
                    <>
                      {track.clips?.map((clip) => {
                        if (multiSelection.selectedClips.includes(clip.id)) {
                          const pixelsPerSecond = 60 * zoomLevel; // Use same calculation as main clips
                          const leftPosition = clip.startTime * pixelsPerSecond;
                          const clipWidth = clip.duration * pixelsPerSecond;
                          
                          return (
                            <div
                              key={`multiselect-${track.id}-${clip.id}-${clip.startTime}`}
                              className="absolute top-0 bottom-0 bg-[var(--primary)]/30 border-2 border-[var(--primary)] pointer-events-none rounded-sm"
                              style={{
                                left: `${leftPosition}px`,
                                width: `${clipWidth}px`,
                                zIndex: 15
                              }}
                            />
                          );
                        }
                        return null;
                      })}
                    </>
                  )}
                </div>
              </div>
            );
            })}
            
            {/* Multi-track Selection Box */}
            {multiSelection && multiSelection.isActive && (
              <div
                className="absolute border-2 border-[var(--primary)] bg-[var(--primary)]/20 pointer-events-none rounded-sm z-20"
                style={{
                  left: `${Math.min(multiSelection.startX, multiSelection.endX)}px`,
                  top: `${Math.min(multiSelection.startY, multiSelection.endY)}px`,
                  width: `${Math.abs(multiSelection.endX - multiSelection.startX)}px`,
                  height: `${Math.abs(multiSelection.endY - multiSelection.startY)}px`,
                }}
              >
                <div className="absolute top-0 left-0 right-0 h-5 bg-[var(--primary)]/80 flex items-center justify-center">
                  <span className="text-xs text-white font-mono font-semibold">
                    {multiSelection.selectedClips.length} clips
                  </span>
                </div>
              </div>
            )}

            {/* Draggable Selection Box (when not actively selecting) */}
            {multiSelection && !multiSelection.isActive && multiSelection.selectedClips.length > 0 && (
              <div
                className="absolute border-2 border-[var(--primary)] bg-[var(--primary)]/10 hover:bg-[var(--primary)]/20 rounded-sm cursor-move transition-colors pointer-events-auto"
                style={{
                  left: `${Math.min(multiSelection.startX, multiSelection.endX)}px`,
                  top: `${Math.min(multiSelection.startY, multiSelection.endY)}px`,
                  width: `${Math.abs(multiSelection.endX - multiSelection.startX)}px`,
                  height: `${Math.abs(multiSelection.endY - multiSelection.startY)}px`,
                  zIndex: 100, // High z-index to be above clips
                  transform: draggingClip && draggingClip.selectedClips ? 
                    `translate(${draggingClip.currentOffsetX || 0}px, ${draggingClip.currentOffsetY || 0}px)` : 
                    'none'
                }}
                onMouseDown={(e) => handleSelectionBoxDragStart(e)}
              >
                <div className="absolute top-0 left-0 right-0 h-5 bg-[var(--primary)]/80 flex items-center justify-center">
                  <span className="text-xs text-white font-mono font-semibold">
                    {multiSelection.selectedClips.length} clips selected
                  </span>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs text-[var(--primary)] font-semibold bg-white/80 px-2 py-1 rounded">
                    {draggingClip && draggingClip.selectedClips ? 'Moving...' : 'Drag to move'}
                  </span>
                </div>
              </div>
            )}

            {/* Virtual Extension Overlay */}
            {virtualExtension && (
              <div
                className="absolute z-15 border-2 border-dashed border-[var(--primary)] bg-[var(--primary)]/10 pointer-events-none rounded-md"
                style={{
                  left: `${virtualExtension.x}px`,
                  top: `${virtualExtension.y + 1}px`,
                  width: `${virtualExtension.width}px`,
                  height: '58px',
                }}
              >
                {/* Action buttons group - positioned next to cancel button */}
                <div className="absolute top-0.5 right-7 flex space-x-1 pointer-events-auto">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="h-5 w-5 p-0 bg-[var(--background)] border border-[var(--border)] hover:bg-[var(--muted)] shadow-lg"
                    onClick={() => handleExtensionAction('ai')}
                    title="Extend with AI-generated content"
                  >
                    <Sparkles className="w-2.5 h-2.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="h-5 w-5 p-0 bg-[var(--background)] border border-[var(--border)] hover:bg-[var(--muted)] shadow-lg"
                    onClick={() => handleExtensionAction('blank')}
                    title="Extend with blank/silent content"
                  >
                    <Circle className="w-2.5 h-2.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="h-5 w-5 p-0 bg-[var(--background)] border border-[var(--border)] hover:bg-[var(--muted)] shadow-lg"
                    onClick={() => handleExtensionAction('stretch')}
                    title="Extend by stretching existing content"
                  >
                    <TrendingUp className="w-2.5 h-2.5" />
                  </Button>
                </div>
                
                {/* Cancel button */}
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute top-0.5 right-0.5 h-5 w-5 p-0 pointer-events-auto hover:bg-[var(--destructive)]/20 rounded-full"
                  onClick={cancelVirtualExtension}
                  title="Cancel extension"
                >
                  <X className="w-2.5 h-2.5" />
                </Button>
                
                {/* Extension info */}
                <div className="absolute bottom-0.5 left-1.5 text-[10px] text-[var(--muted-foreground)] font-mono pointer-events-none">
                  +{virtualExtension.extensionLength.toFixed(1)}s
                </div>
              </div>
            )}

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
              {Icon && <Icon className="w-3 h-3" />}
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
              return <div key={`separator-${index}`} className="border-t border-[var(--border)] my-1" />;
            }
            
            const { label, icon: Icon, action, shortcut, destructive, ai } = item;
            return (
              <button
                key={`audio-action-${action}-${index}`}
                onClick={() => {
                  console.log(`${action} multi-track selection:`, audioContextMenu.selection);
                  setAudioContextMenu(null);
                  setMultiSelection(null);
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
                  {Icon && <Icon className="w-3 h-3" />}
                  <span>{label}</span>
                </div>
                {shortcut && <span className="text-[var(--muted-foreground)] text-xs">{shortcut}</span>}
              </button>
            );
          })}
        </div>
      )}

      {/* Clip Context Menu */}
      {clipContextMenu && (
        <div
          className="fixed bg-[var(--background)] border border-[var(--border)] rounded-lg shadow-xl py-1 z-50 min-w-48"
          style={{ left: clipContextMenu.x, top: clipContextMenu.y }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-3 py-2 text-xs text-[var(--muted-foreground)] border-b border-[var(--border)]">
            <div className="font-medium">{clipContextMenu.clip.name}</div>
            <div className="text-[var(--muted-foreground)]">Track: {clipContextMenu.clip.trackName}</div>
          </div>
          
          {(() => {
            // Range selection specific options
            if (clipContextMenu.clip.name.includes('Range Selection') || clipContextMenu.clip.name.includes('Selection')) {
              return [
                { label: 'Cut Range', icon: Scissors, action: 'cut-range', shortcut: 'Ctrl+X' },
                { label: 'Copy Range', icon: Copy, action: 'copy-range', shortcut: 'Ctrl+C' },
                { label: 'Delete Range', icon: Trash2, action: 'delete-range', destructive: true, shortcut: 'Del' },
                { type: 'separator' },
                { label: 'Crop to Selection', icon: Circle, action: 'crop-selection' },
                { label: 'Bounce to Audio', icon: Link, action: 'bounce-audio' },
                { type: 'separator' },
                { label: 'Fade In Selection', icon: TrendingUp, action: 'fade-in-range' },
                { label: 'Fade Out Selection', icon: TrendingDown, action: 'fade-out-range' },
                { label: 'Crossfade', icon: RotateCcw, action: 'crossfade' },
                { type: 'separator' },
                { label: 'Normalize Range', icon: BarChart3, action: 'normalize-range' },
                { label: 'Reverse Audio', icon: RotateCcw, action: 'reverse-audio' },
                { type: 'separator' },
                { label: 'AI Enhancement', icon: Sparkles, action: 'ai-enhance-range', ai: true },
                { label: 'Split at Selection', icon: Scissors, action: 'split-selection' },
              ];
            }
            
            // Regular clip options
            return [
              { label: 'Cut', icon: Scissors, action: 'cut', shortcut: 'Ctrl+X' },
              { label: 'Copy', icon: Copy, action: 'copy', shortcut: 'Ctrl+C' },
              { label: 'Duplicate', icon: Files, action: 'duplicate', shortcut: 'Ctrl+D' },
              { type: 'separator' },
              { label: 'Fade In', icon: TrendingUp, action: 'fade-in' },
              { label: 'Fade Out', icon: TrendingDown, action: 'fade-out' },
              { label: 'Normalize', icon: BarChart3, action: 'normalize' },
              { type: 'separator' },
              { label: 'AI Prompt', icon: Sparkles, action: 'ai-prompt', ai: true },
              { type: 'separator' },
              { label: 'Delete', icon: Trash2, action: 'delete', destructive: true, shortcut: 'Del' },
            ];
          })().map((item, index) => {
            if (item.type === 'separator') {
              return <div key={`clip-separator-${index}`} className="h-px bg-[var(--border)] my-1" />;
            }
            
            const { label, icon: Icon, action, shortcut, destructive, ai } = item;
            return (
              <button
                key={`clip-action-${label}-${index}`}
                onClick={() => {
                  if (action === 'ai-prompt') {
                    const track = tracks.find(t => t.id === clipContextMenu.clip.trackId);
                    setSelectedClipForLLM({
                      id: clipContextMenu.clip.id,
                      name: clipContextMenu.clip.name,
                      trackName: clipContextMenu.clip.trackName,
                      trackType: track?.type || 'audio'
                    });
                    setShowLLMPrompt(true);
                  } else {
                    console.log(`${action} clip:`, clipContextMenu.clip);
                  }
                  setClipContextMenu(null);
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
                  {Icon && <Icon className="w-3 h-3" />}
                  <span>{label}</span>
                </div>
                {shortcut && <span className="text-[var(--muted-foreground)] text-xs">{shortcut}</span>}
              </button>
            );
          })}
        </div>
      )}

      {/* LLM Prompt Dialog */}
      {showLLMPrompt && selectedClipForLLM && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[var(--background)] border border-[var(--border)] rounded-lg shadow-xl p-4 w-96 max-w-[90vw]">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-medium">AI Prompt</h3>
                <p className="text-xs text-[var(--muted-foreground)]">
                  {selectedClipForLLM.name} • {selectedClipForLLM.trackName}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowLLMPrompt(false);
                  setSelectedClipForLLM(null);
                  setLLMPrompt('');
                }}
                className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-3">
              {/* Preset Prompts */}
              <div>
                <label className="text-xs text-[var(--muted-foreground)] mb-2 block">
                  Quick suggestions for {selectedClipForLLM.trackType} clips:
                </label>
                <div className="grid grid-cols-1 gap-1 max-h-32 overflow-y-auto">
                  {getPresetPrompts(selectedClipForLLM.trackType, selectedClipForLLM.name).map((preset, index) => (
                    <button
                      key={`preset-${selectedClipForLLM.id}-${index}-${preset.length}`}
                      onClick={() => setLLMPrompt(preset)}
                      className="text-left text-xs p-2 rounded-md bg-[var(--muted)]/20 hover:bg-[var(--muted)]/40 border border-[var(--border)]/50 hover:border-[var(--border)] transition-colors"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Custom Prompt */}
              <div>
                <label className="text-xs text-[var(--muted-foreground)] mb-1 block">
                  Or enter your custom prompt:
                </label>
                <textarea
                  value={llmPrompt}
                  onChange={(e) => setLLMPrompt(e.target.value)}
                  placeholder="e.g. 'Enhance the vocal clarity' or 'Add reverb to this clip'"
                  className="w-full h-20 px-3 py-2 text-xs bg-[var(--muted)]/20 border border-[var(--border)] rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => {
                    setShowLLMPrompt(false);
                    setSelectedClipForLLM(null);
                    setLLMPrompt('');
                  }}
                  className="px-3 py-1.5 text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLLMPromptSubmit}
                  disabled={!llmPrompt.trim()}
                  className="px-3 py-1.5 text-xs bg-[var(--primary)] text-[var(--primary-foreground)] rounded-md hover:bg-[var(--primary)]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-1"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Process</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}