import { useState, useRef, useEffect, useCallback } from 'react';
import { X, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MovableVideoPlayerProps {
  src?: string;
  isVisible?: boolean;
  onClose?: () => void;
  onMaximize?: () => void;
}

export function MovableVideoPlayer({ 
  src = "/api/placeholder-video",
  isVisible = false,
  onClose,
  onMaximize
}: MovableVideoPlayerProps) {
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  const playerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!playerRef.current) return;
    
    const rect = playerRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    setIsDragging(true);
  }, []);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      
      // Keep player within viewport bounds
      const maxX = window.innerWidth - 320; // player width
      const maxY = window.innerHeight - 180; // player height
      
      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY))
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  if (!isVisible) return null;

  return (
    <div
      ref={playerRef}
      className="fixed z-50 w-80 h-45 bg-black rounded-lg shadow-2xl border border-[var(--border)] overflow-hidden"
      style={{
        left: position.x,
        top: position.y,
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Header with controls */}
      <div className="absolute top-0 left-0 right-0 h-8 bg-black/80 flex items-center justify-between px-2 z-10">
        <div className="text-white text-xs font-medium">Mini Player</div>
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            className="w-6 h-6 p-0 text-white hover:bg-white/20"
            onClick={(e) => {
              e.stopPropagation();
              onMaximize?.();
            }}
          >
            <Maximize2 className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-6 h-6 p-0 text-white hover:bg-white/20"
            onClick={(e) => {
              e.stopPropagation();
              onClose?.();
            }}
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Video */}
      <video
        className="w-full h-full object-cover"
        autoPlay
        muted
        loop
        poster="/api/placeholder-video-poster"
        preload="metadata"
        onClick={(e) => e.stopPropagation()}
      >
        <source src={src} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
}