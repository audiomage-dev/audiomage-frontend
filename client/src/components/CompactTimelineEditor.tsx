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
  Copy
} from 'lucide-react';

interface CompactTimelineEditorProps {
  tracks: AudioTrack[];
  transport: TransportState;
  zoomLevel?: number;
  bpm?: number;
  timeSignature?: [number, number];
  onTrackMute: (trackId: string) => void;
  onTrackSolo: (trackId: string) => void;
  onTrackSelect?: (trackId: string) => void;
  onClipMove?: (clipId: string, fromTrackId: string, toTrackId: string, newStartTime: number) => void;
  onClipResize?: (clipId: string, trackId: string, newStartTime: number, newDuration: number) => void;
  onZoomChange?: (zoomLevel: number) => void;
  isLocked?: boolean;
}

export function CompactTimelineEditor({ tracks, transport, zoomLevel: externalZoomLevel = 1, bpm = 120, timeSignature = [4, 4], onTrackMute, onTrackSolo, onTrackSelect, onClipMove, onClipResize, onZoomChange, isLocked = false }: CompactTimelineEditorProps) {
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

  // Fade controls state for hover interactions
  const [hoveredClip, setHoveredClip] = useState<string | null>(null);
  const [fadeControls, setFadeControls] = useState<{
    clipId: string;
    trackId: string;
    fadeIn: number;
    fadeOut: number;
    isDragging: boolean;
    dragType: 'in' | 'out' | null;
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
    
    // Scale based on zoom level with better pixel-per-second ratio
    const pixelsPerSecond = Math.max(2, 4 * zoomLevel); // Better scaling
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
    // Prevent dragging when timeline is locked
    if (isLocked) {
      return;
    }
    
    e.stopPropagation();
    e.preventDefault();
    
    const track = tracks.find(t => t.id === trackId);
    const clip = track?.clips?.find(c => c.id === clipId);
    const trackIndex = tracks.findIndex(t => t.id === trackId);
    
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
        selectedClips: selectedClips.length > 0 ? selectedClips : undefined
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
        
        // Handle group movement if multiple clips are selected
        if (dragState.selectedClips && dragState.selectedClips.length > 0) {
          console.log(`Group moving ${dragState.selectedClips.length} clips`);
          
          // Calculate the primary clip's movement (the one being dragged)
          const primaryClipDeltaTime = (deltaX / timelineWidth) * totalTime;
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
          
          // Calculate position and dimensions for virtual extension overlay
          const extensionX = (extensionStartTime / totalTime) * timelineWidth;
          const extensionWidth = (extensionLength / totalTime) * timelineWidth;
          const extensionY = trackIndex * 96;
          
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
    
    const timelineRect = timelineRef.current?.getBoundingClientRect();
    if (!timelineRect) return;
    
    const startX = e.clientX - timelineRect.left + scrollX;
    // Calculate Y position relative to the track that was clicked
    const trackY = startTrackIndex * 96; // Each track is 96px high
    const startY = trackY + (e.clientY - e.currentTarget.getBoundingClientRect().top);
    
    const timelineWidth = getTimelineWidth();
    const totalTime = timelineWidth / zoomLevel;
    const startTime = (startX / timelineWidth) * totalTime;
    
    console.log('Starting multi-track selection:', { startX, startY, startTime, startTrackIndex, trackY });
    
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
  }, [scrollX, zoomLevel, getTimelineWidth]);

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
          

        </div>
        
        <div className="flex-1 overflow-auto scrollbar-thin" ref={tracksRef}>
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
              width: `${getTimelineWidth()}px`,
              transform: `translateX(-${scrollX}px)`
            }}
          >
            {(() => {
              // Calculate minute markers based on actual timeline width
              const timelineWidthPx = getTimelineWidth();
              const pixelsPerSecond = Math.max(2, 4 * zoomLevel);
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
                    key={`${componentId}-minute-marker-${minuteIndex}`}
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
                  onMouseDown={(e) => handleMultiSelectionStart(e, index)}
                  onContextMenu={(e) => handleMultiSelectionRightClick(e, track.id)}
                >
                  {track.clips?.map((clip) => {
                    const timelineWidth = getTimelineWidth();
                    const pixelsPerSecond = Math.max(2, 4 * zoomLevel);
                    const totalTime = timelineWidth / pixelsPerSecond;
                    const clipStartX = (clip.startTime / totalTime) * timelineWidth;
                    const clipWidth = (clip.duration / totalTime) * timelineWidth;
                    
                    return (
                      <div
                        key={clip.id}
                        className={`absolute top-1 h-[88px] rounded-md shadow-md border border-opacity-30 cursor-move hover:shadow-lg transition-all duration-200 ${
                          draggingClip?.clipId === clip.id 
                            ? 'opacity-60 scale-105 z-50' 
                            : draggingClip?.selectedClips?.some(sc => sc.clipId === clip.id)
                              ? 'opacity-70 scale-102 z-40 ring-2 ring-[var(--primary)]'
                              : multiSelection && multiSelection.selectedClips.includes(clip.id)
                                ? 'ring-2 ring-[var(--primary)]'
                                : 'z-5'
                        }`}
                        style={{
                          left: `${clipStartX}px`,
                          width: `${clipWidth}px`,
                          backgroundColor: clip.color,
                          borderColor: clip.color,
                          transform: (() => {
                            // If this clip is being dragged and is part of a group selection, use group offset
                            if (draggingClip?.clipId === clip.id && draggingClip.selectedClips && draggingClip.selectedClips.length > 0) {
                              return `translate(${draggingClip.currentOffsetX}px, ${draggingClip.currentOffsetY}px)`;
                            }
                            // If this clip is being dragged individually
                            else if (draggingClip?.clipId === clip.id) {
                              return `translate(${draggingClip.currentOffsetX}px, ${draggingClip.currentOffsetY}px)`;
                            }
                            // If this clip is part of a dragged group but not the primary clip
                            else if (draggingClip?.selectedClips?.some(sc => sc.clipId === clip.id)) {
                              return `translate(${draggingClip.currentOffsetX}px, ${draggingClip.currentOffsetY}px)`;
                            }
                            return 'none';
                          })(),
                          zIndex: draggingClip?.clipId === clip.id ? 50 : 
                                 draggingClip?.selectedClips?.some(sc => sc.clipId === clip.id) ? 40 : 5
                        }}
                        onMouseDown={(e) => handleClipDragStart(e, clip.id, track.id)}
                        onContextMenu={(e) => handleClipRightClick(e, clip.id, track.id)}
                        onDoubleClick={() => console.log('Edit clip:', clip.name)}
                      >
                        {/* Clip Header with Fade Controls */}
                        <div 
                          className="h-5 bg-black bg-opacity-20 rounded-t-md px-2 flex items-center justify-between text-xs text-white font-medium relative cursor-pointer transition-all duration-200 hover:bg-black hover:bg-opacity-40"
                          onMouseEnter={() => setHoveredClip(clip.id)}
                          onMouseLeave={() => {
                            if (!fadeControls?.isDragging) {
                              setHoveredClip(null);
                              setFadeControls(null);
                            }
                          }}
                        >
                          <span className="truncate flex-1">{clip.name}</span>
                          <span className="text-xs opacity-75">{clip.duration.toFixed(1)}s</span>
                          

                        </div>
                        
                        {/* Line Waveform */}
                        <div className="h-16 px-2 py-1 relative">
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
                        
                        {/* Fade In/Out Visual Indicators */}
                        {(clip.fadeIn && clip.fadeIn > 0) || (fadeControls?.clipId === clip.id && fadeControls.fadeIn > 0) && (
                          <div 
                            className="absolute top-0 left-0 h-full bg-gradient-to-r from-black/60 via-black/30 to-transparent pointer-events-none z-10 transition-all duration-150"
                            style={{ 
                              width: `${((fadeControls?.clipId === clip.id ? fadeControls.fadeIn : clip.fadeIn || 0) / clip.duration) * 100}%`,
                              opacity: fadeControls?.clipId === clip.id && fadeControls.dragType === 'in' ? 0.8 : 0.6
                            }}
                          />
                        )}
                        {(clip.fadeOut && clip.fadeOut > 0) || (fadeControls?.clipId === clip.id && fadeControls.fadeOut > 0) && (
                          <div 
                            className="absolute top-0 right-0 h-full bg-gradient-to-l from-black/60 via-black/30 to-transparent pointer-events-none z-10 transition-all duration-150"
                            style={{ 
                              width: `${((fadeControls?.clipId === clip.id ? fadeControls.fadeOut : clip.fadeOut || 0) / clip.duration) * 100}%`,
                              opacity: fadeControls?.clipId === clip.id && fadeControls.dragType === 'out' ? 0.8 : 0.6
                            }}
                          />
                        )}

                          {/* Fade Handles - appear when hovering over header */}
                          {hoveredClip === clip.id && (
                            <>
                              {/* Fade-in handle at beginning of header */}
                              <div 
                                className="absolute left-0 top-0 h-5 w-3 bg-[var(--primary)]/80 hover:bg-[var(--primary)] cursor-ew-resize transition-all duration-200 flex items-center justify-center group rounded-tl-md"
                                onMouseDown={(e) => {
                                  e.stopPropagation();
                                  e.preventDefault();
                                  const startX = e.clientX;
                                  const currentFadeIn = clip.fadeIn || 0;
                                  
                                  setFadeControls({
                                    clipId: clip.id,
                                    trackId: track.id,
                                    fadeIn: currentFadeIn,
                                    fadeOut: clip.fadeOut || 0,
                                    isDragging: true,
                                    dragType: 'in'
                                  });
                                  
                                  const handleMouseMove = (e: MouseEvent) => {
                                    const deltaX = e.clientX - startX;
                                    const fadeInDelta = (deltaX / clipWidth) * clip.duration;
                                    const newFadeIn = Math.max(0, Math.min(clip.duration * 0.4, currentFadeIn + fadeInDelta));
                                    
                                    setFadeControls(prev => prev ? { ...prev, fadeIn: newFadeIn } : null);
                                  };
                                  
                                  const handleMouseUp = () => {
                                    document.removeEventListener('mousemove', handleMouseMove);
                                    document.removeEventListener('mouseup', handleMouseUp);
                                    if (fadeControls) {
                                      console.log(`Applied fade-in to clip ${clip.id}: ${fadeControls.fadeIn.toFixed(2)}s`);
                                    }
                                    setFadeControls(prev => prev ? { ...prev, isDragging: false } : null);
                                  };
                                  
                                  document.addEventListener('mousemove', handleMouseMove);
                                  document.addEventListener('mouseup', handleMouseUp);
                                }}
                                title={`Fade-in: ${(fadeControls?.clipId === clip.id ? fadeControls.fadeIn : clip.fadeIn || 0).toFixed(1)}s`}
                              >
                                <div className="w-0.5 h-2 bg-white rounded-full group-hover:h-3 transition-all duration-200"></div>
                              </div>
                              
                              {/* Fade-out handle at end of header */}
                              <div 
                                className="absolute right-0 top-0 h-5 w-3 bg-[var(--primary)]/80 hover:bg-[var(--primary)] cursor-ew-resize transition-all duration-200 flex items-center justify-center group rounded-tr-md"
                                onMouseDown={(e) => {
                                  e.stopPropagation();
                                  e.preventDefault();
                                  const startX = e.clientX;
                                  const currentFadeOut = clip.fadeOut || 0;
                                  
                                  setFadeControls({
                                    clipId: clip.id,
                                    trackId: track.id,
                                    fadeIn: clip.fadeIn || 0,
                                    fadeOut: currentFadeOut,
                                    isDragging: true,
                                    dragType: 'out'
                                  });
                                  
                                  const handleMouseMove = (e: MouseEvent) => {
                                    const deltaX = startX - e.clientX; // Reversed for fade-out
                                    const fadeOutDelta = (deltaX / clipWidth) * clip.duration;
                                    const newFadeOut = Math.max(0, Math.min(clip.duration * 0.4, currentFadeOut + fadeOutDelta));
                                    
                                    setFadeControls(prev => prev ? { ...prev, fadeOut: newFadeOut } : null);
                                  };
                                  
                                  const handleMouseUp = () => {
                                    document.removeEventListener('mousemove', handleMouseMove);
                                    document.removeEventListener('mouseup', handleMouseUp);
                                    if (fadeControls) {
                                      console.log(`Applied fade-out to clip ${clip.id}: ${fadeControls.fadeOut.toFixed(2)}s`);
                                    }
                                    setFadeControls(prev => prev ? { ...prev, isDragging: false } : null);
                                  };
                                  
                                  document.addEventListener('mousemove', handleMouseMove);
                                  document.addEventListener('mouseup', handleMouseUp);
                                }}
                                title={`Fade-out: ${(fadeControls?.clipId === clip.id ? fadeControls.fadeOut : clip.fadeOut || 0).toFixed(1)}s`}
                              >
                                <div className="w-0.5 h-2 bg-white rounded-full group-hover:h-3 transition-all duration-200"></div>
                              </div>
                            </>
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
                          const timelineWidth = getTimelineWidth();
                          const totalTime = timelineWidth / zoomLevel;
                          const leftPosition = (clip.startTime / totalTime) * timelineWidth;
                          const clipWidth = (clip.duration / totalTime) * timelineWidth;
                          
                          return (
                            <div
                              key={`selection-${clip.id}`}
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
            ))}
            
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
                  top: `${virtualExtension.y + 12}px`,
                  width: `${virtualExtension.width}px`,
                  height: '64px',
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
              return <div key={`separator-${index}`} className="border-t border-[var(--border)] my-1" />;
            }
            
            const { label, icon: Icon, action, shortcut, destructive, ai } = item;
            return (
              <button
                key={`action-${label}-${index}`}
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
                  <Icon className="w-3 h-3" />
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
          
          {[
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
          ].map((item, index) => {
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
                  <Icon className="w-3 h-3" />
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
                      key={`preset-${index}-${preset.substring(0, 10)}`}
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