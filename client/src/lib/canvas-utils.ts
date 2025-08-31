// Canvas utilities for high-DPI rendering and waveform drawing

export interface DpiCanvasSetupResult {
  ctx: CanvasRenderingContext2D;
  pixelRatio: number;
}

export function setupHiDPICanvas(
  canvas: HTMLCanvasElement,
  widthCssPx: number,
  heightCssPx: number
): DpiCanvasSetupResult {
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('2D context not available');
  const dpr = Math.max(1, Math.floor(window.devicePixelRatio || 1));
  canvas.width = Math.floor(widthCssPx * dpr);
  canvas.height = Math.floor(heightCssPx * dpr);
  canvas.style.width = `${widthCssPx}px`;
  canvas.style.height = `${heightCssPx}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx, pixelRatio: dpr };
}

// Map large sample arrays to per-pixel min/max envelope efficiently
export function optimizeDataSampling(
  samples: number[],
  targetPixelWidth: number
): { min: number[]; max: number[] } {
  const length = samples.length;
  if (length === 0 || targetPixelWidth <= 0) return { min: [], max: [] };
  const blockSize = Math.max(1, Math.floor(length / targetPixelWidth));
  const bucketCount = Math.min(targetPixelWidth, Math.ceil(length / blockSize));
  const min: number[] = new Array(bucketCount);
  const max: number[] = new Array(bucketCount);

  let i = 0;
  for (let b = 0; b < bucketCount; b++) {
    let localMin = Infinity;
    let localMax = -Infinity;
    const end = Math.min(length, i + blockSize);
    for (; i < end; i++) {
      const v = samples[i];
      if (v < localMin) localMin = v;
      if (v > localMax) localMax = v;
    }
    min[b] = localMin === Infinity ? 0 : localMin;
    max[b] = localMax === -Infinity ? 0 : localMax;
  }
  return { min, max };
}

export function createWaveformGradient(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  color: string
): CanvasGradient {
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  // Use color with varying alpha to mimic SVG fillOpacity
  // Expect color like CSS color string; we layer via globalAlpha for simplicity
  gradient.addColorStop(0, color);
  gradient.addColorStop(1, color);
  return gradient;
}

export function clearCanvas(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
) {
  ctx.clearRect(0, 0, width, height);
}

export interface WaveformDrawOptions {
  width: number;
  height: number;
  color: string;
  min: number[];
  max: number[];
  baseline?: number; // 0..1 relative
  lineWidth?: number;
  fillOpacity?: number; // 0..1
  strokeOpacity?: number; // 0..1
}

export function renderWaveform(
  ctx: CanvasRenderingContext2D,
  opts: WaveformDrawOptions
) {
  const {
    width,
    height,
    color,
    min,
    max,
    baseline = 0.5,
    lineWidth = 1,
    fillOpacity = 0.6,
    strokeOpacity = 1,
  } = opts;

  const centerY = height * baseline;
  const halfHeight = height * 0.5;

  // Grid background similar to SVG pattern (vertical lines every 20px)
  ctx.save();
  ctx.lineWidth = 1;
  ctx.strokeStyle = withAlpha(color, 0.0625);
  for (let x = 0; x <= width; x += 20) {
    drawLine(ctx, x + 0.5, 0, x + 0.5, height);
  }
  // Center line
  ctx.strokeStyle = withAlpha(color, 0.1875);
  drawDashedLine(ctx, 0, Math.floor(centerY) + 0.5, width, Math.floor(centerY) + 0.5, [2, 2]);
  ctx.restore();

  // Filled waveform envelope
  ctx.save();
  ctx.beginPath();
  for (let x = 0; x < max.length; x++) {
    const px = (x / max.length) * width;
    const yTop = centerY - (max[x] / 100) * halfHeight;
    if (x === 0) ctx.moveTo(px, yTop);
    else ctx.lineTo(px, yTop);
  }
  for (let x = min.length - 1; x >= 0; x--) {
    const px = (x / min.length) * width;
    const yBot = centerY + (Math.abs(min[x]) / 100) * halfHeight;
    ctx.lineTo(px, yBot);
  }
  ctx.closePath();

  ctx.globalAlpha = fillOpacity;
  ctx.fillStyle = createWaveformGradient(ctx, width, height, color);
  ctx.fill();

  ctx.globalAlpha = strokeOpacity;
  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = color;
  ctx.stroke();
  ctx.restore();
}

export function updatePlaybackCursor(
  ctx: CanvasRenderingContext2D,
  xPositionPx: number,
  height: number
) {
  // Draw a vertical playhead; caller should clear/redraw scene around it or draw on overlay
  ctx.save();
  ctx.lineWidth = 2;
  ctx.strokeStyle = 'var(--primary)';
  drawLine(ctx, Math.floor(xPositionPx) + 0.5, 0, Math.floor(xPositionPx) + 0.5, height);
  ctx.restore();
}

export function drawLine(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number
) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

export function drawDashedLine(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  dash: number[]
) {
  ctx.save();
  ctx.setLineDash(dash);
  drawLine(ctx, x1, y1, x2, y2);
  ctx.restore();
}

function withAlpha(color: string, alpha: number): string {
  // Supports hex with 6 chars or CSS color names via rgba fallback
  if (color.startsWith('#')) {
    const hex = color.replace('#', '');
    const bigint = parseInt(hex, 16);
    let r = 0, g = 0, b = 0;
    if (hex.length === 6) {
      r = (bigint >> 16) & 255;
      g = (bigint >> 8) & 255;
      b = bigint & 255;
    }
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  return `color-mix(in srgb, ${color} ${Math.round(alpha * 100)}%, transparent)`;
}

