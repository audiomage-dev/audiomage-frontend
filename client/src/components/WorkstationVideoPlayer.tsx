import { useState, useRef, useEffect, useCallback } from 'react';
import { MoreVertical, ExternalLink } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

interface WorkstationVideoPlayerProps {
  src?: string;
  className?: string;
  onSizeChange?: (width: number, height: number) => void;
  onMoveToIndependentScreen?: () => void;
  initialWidth?: number;
  initialHeight?: number;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
}

export function WorkstationVideoPlayer({ 
  src = "/api/placeholder-video",
  className = "",
  onSizeChange,
  onMoveToIndependentScreen,
  initialWidth = 512,
  initialHeight = 384,
  minWidth = 200,
  minHeight = 150,
  maxWidth = 800,
  maxHeight = 600
}: WorkstationVideoPlayerProps) {
  const [isResizing, setIsResizing] = useState(false);
  const [size, setSize] = useState({ width: initialWidth, height: initialHeight });
  
  const containerRef = useRef<HTMLDivElement>(null);
  const resizeStartPos = useRef({ x: 0, y: 0, width: 0, height: 0 });

  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsResizing(true);
    resizeStartPos.current = {
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height
    };
  }, [size]);

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - resizeStartPos.current.x;
      const deltaY = e.clientY - resizeStartPos.current.y;
      
      const newWidth = Math.max(minWidth, Math.min(maxWidth, resizeStartPos.current.width + deltaX));
      const newHeight = Math.max(minHeight, Math.min(maxHeight, resizeStartPos.current.height + deltaY));
      
      setSize({ width: newWidth, height: newHeight });
      onSizeChange?.(newWidth, newHeight);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, minWidth, minHeight, maxWidth, maxHeight, onSizeChange]);

  return (
    <div
      ref={containerRef}
      className={`bg-black border border-[var(--border)] rounded-lg overflow-hidden shadow-lg relative ${className}`}
      style={{
        width: size.width,
        height: size.height
      }}
    >
      {/* Video Element - no controls */}
      <video
        className="w-full h-full object-cover"
        poster="/api/placeholder-video-poster"
        preload="metadata"
        muted
        loop
        autoPlay
      >
        <source src={src} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Three Dots Menu - bottom right corner */}
      <div className="absolute bottom-2 right-2 z-20">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="w-8 h-8 p-0 bg-black/50 hover:bg-black/70 text-white border-none"
            >
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem
              onClick={onMoveToIndependentScreen}
              className="flex items-center space-x-2"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Move to Independent Screen</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Resize Handle - bottom right corner, positioned to avoid menu */}
      <div
        className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize bg-[var(--muted)]/80 hover:bg-[var(--muted)] border-l border-t border-[var(--border)] rounded-tl-md z-10"
        onMouseDown={handleResizeStart}
      >
        <div className="absolute bottom-1 right-1 w-2 h-2">
          <div className="w-full h-0.5 bg-[var(--muted-foreground)] mb-0.5"></div>
          <div className="w-full h-0.5 bg-[var(--muted-foreground)]"></div>
        </div>
      </div>
    </div>
  );
}