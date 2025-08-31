import { useEffect, useMemo, useRef, useState } from 'react';
import {
  setupHiDPICanvas,
  optimizeDataSampling,
  renderWaveform as renderWaveformCanvas,
  clearCanvas,
  updatePlaybackCursor,
} from '../lib/canvas-utils';

interface WaveformVisualizationProps {
  data: number[];
  color: string;
  fileName: string;
  isPlaying: boolean;
  width?: number;
  height?: number;
}

const USE_CANVAS = (import.meta as any).env?.VITE_FEATURE_CANVAS_WAVEFORM === '1';

export function WaveformVisualization({ data, color, fileName, isPlaying, width = 400, height = 64 }: WaveformVisualizationProps) {
  // SVG fallback renderer (for feature flag off or debugging)
  const renderSVG = () => {
    const generateWaveformPath = () => {
      if (!data.length) return '';
      const centerY = height / 2;
      const samplesPerPixel = Math.max(1, Math.floor(data.length / width));
      let path = `M 0 ${centerY}`;
      for (let x = 0; x < width; x++) {
        const sampleIndex = Math.floor(x * samplesPerPixel);
        if (sampleIndex < data.length) {
          const amplitude = (data[sampleIndex] / 100) * (height / 2);
          const y1 = centerY - amplitude;
          path += ` L ${x} ${y1}`;
        }
      }
      for (let x = width - 1; x >= 0; x--) {
        const sampleIndex = Math.floor(x * samplesPerPixel);
        if (sampleIndex < data.length) {
          const amplitude = (data[sampleIndex] / 100) * (height / 2);
          const y2 = centerY + amplitude;
          path += ` L ${x} ${y2}`;
        }
      }
      path += ' Z';
      return path;
    };

    return (
      <svg
        className="w-full h-full"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
      >
        <defs>
          <pattern id="grid" width="20" height={`${height}`} patternUnits="userSpaceOnUse">
            <path d={`M 20 0 L 0 0 0 ${height}`} fill="none" stroke={`${color}10`} strokeWidth="1" />
          </pattern>
        </defs>
        <rect width={`${width}`} height={`${height}`} fill="url(#grid)" />
        <line x1="0" y1={`${height / 2}`} x2={`${width}`} y2={`${height / 2}`} stroke={`${color}30`} strokeWidth="1" strokeDasharray="2,2" />
        <path
          d={generateWaveformPath()}
          fill={color}
          fillOpacity="0.6"
          stroke={color}
          strokeWidth="1"
          className={`transition-all duration-200 ${isPlaying ? 'animate-pulse' : ''}`}
        />
        {data.map((amplitude, index) => {
          const x = (index / data.length) * width;
          const y1 = height / 2 - (amplitude / 100) * (height / 2 - 2);
          const y2 = height / 2 + (amplitude / 100) * (height / 2 - 2);
          return (
            <line
              key={index}
              x1={x}
              y1={y1}
              x2={x}
              y2={y2}
              stroke={color}
              strokeWidth="1.5"
              opacity="0.8"
              className={isPlaying ? 'animate-pulse' : ''}
            />
          );
        })}
        {isPlaying && (
          <line x1="50" y1="0" x2="50" y2={`${height}`} stroke="var(--primary)" strokeWidth="2" opacity="0.8" className="animate-bounce" />
        )}
      </svg>
    );
  };

  if (!USE_CANVAS) {
    return (
      <div className="absolute inset-0 rounded overflow-hidden" style={{ backgroundColor: `${color}15` }}>
        {renderSVG()}
        <div className="absolute top-1 left-2 text-xs font-mono text-[var(--foreground)] bg-[var(--background)]/80 px-2 py-1 rounded backdrop-blur-sm">
          {fileName}
        </div>
        <div className="absolute top-1 right-2 text-xs font-mono text-[var(--muted-foreground)] bg-[var(--background)]/80 px-2 py-1 rounded backdrop-blur-sm">
          {isPlaying ? '▶ Playing' : '⏸ Paused'}
        </div>
      </div>
    );
  }

  // Canvas-based implementation
  const containerRef = useRef<HTMLDivElement | null>(null);
  const waveformCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const cursorCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [size, setSize] = useState<{ w: number; h: number }>({ w: width, h: height });

  // Re-sample data per pixel width
  const envelope = useMemo(() => {
    return optimizeDataSampling(data, Math.max(1, Math.floor(size.w)));
  }, [data, size.w]);

  // Resize observer for responsive layout
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      for (const entry of entries) {
        const cr = entry.contentRect;
        setSize({ w: Math.max(1, Math.floor(cr.width)), h: Math.max(1, Math.floor(cr.height)) });
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Draw static waveform when size/data/color change
  useEffect(() => {
    const canvas = waveformCanvasRef.current;
    if (!canvas) return;
    const { ctx } = setupHiDPICanvas(canvas, size.w, size.h);
    clearCanvas(ctx, size.w, size.h);
    renderWaveformCanvas(ctx, {
      width: size.w,
      height: size.h,
      color,
      min: envelope.min,
      max: envelope.max,
      baseline: 0.5,
      lineWidth: 1,
      fillOpacity: 0.6,
      strokeOpacity: 1,
    });
  }, [size.w, size.h, color, envelope.min, envelope.max]);

  // Playback cursor overlay at 60fps when playing
  useEffect(() => {
    const canvas = cursorCanvasRef.current;
    if (!canvas) return;
    const { ctx } = setupHiDPICanvas(canvas, size.w, size.h);
    let raf = 0;
    let start = performance.now();

    const draw = (t: number) => {
      clearCanvas(ctx, size.w, size.h);
      if (isPlaying) {
        const elapsed = (t - start) / 1000; // seconds
        const speedPxPerSec = 60; // arbitrary cursor speed
        const x = (elapsed * speedPxPerSec) % size.w;
        updatePlaybackCursor(ctx, x, size.h);
      }
      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [isPlaying, size.w, size.h]);

  return (
    <div ref={containerRef} className="absolute inset-0 rounded overflow-hidden" style={{ backgroundColor: `${color}15` }}>
      <canvas ref={waveformCanvasRef} className="w-full h-full block" />
      <canvas ref={cursorCanvasRef} className="w-full h-full block absolute inset-0 pointer-events-none" />
      <div className="absolute top-1 left-2 text-xs font-mono text-[var(--foreground)] bg-[var(--background)]/80 px-2 py-1 rounded backdrop-blur-sm">
        {fileName}
      </div>
      <div className="absolute top-1 right-2 text-xs font-mono text-[var(--muted-foreground)] bg-[var(--background)]/80 px-2 py-1 rounded backdrop-blur-sm">
        {isPlaying ? '▶ Playing' : '⏸ Paused'}
      </div>
    </div>
  );
}
