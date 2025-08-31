interface AudioMeterProps {
  level: number; // 0-100
  peak?: number;
  orientation?: 'vertical' | 'horizontal';
  width?: string;
  height?: string;
}

export function AudioMeter({
  level,
  peak,
  orientation = 'vertical',
  width = 'w-4',
  height = 'h-32',
}: AudioMeterProps) {
  const meterLevel = Math.max(0, Math.min(100, level));
  const peakLevel = peak ? Math.max(0, Math.min(100, peak)) : 0;

  if (orientation === 'vertical') {
    return (
      <div
        className={`${width} ${height} bg-[hsl(var(--nord-2))] rounded overflow-hidden relative`}
      >
        <div
          className="w-full meter-bar rounded absolute bottom-0 transition-all duration-100"
          style={{ height: `${meterLevel}%` }}
        />
        {peak && (
          <div
            className="w-full h-0.5 bg-[hsl(var(--aurora-red))] absolute"
            style={{ bottom: `${peakLevel}%` }}
          />
        )}
      </div>
    );
  }

  return (
    <div
      className={`${height} ${width} bg-[hsl(var(--nord-2))] rounded overflow-hidden relative`}
    >
      <div
        className="h-full meter-bar rounded absolute left-0 transition-all duration-100"
        style={{ width: `${meterLevel}%` }}
      />
      {peak && (
        <div
          className="h-full w-0.5 bg-[hsl(var(--aurora-red))] absolute"
          style={{ left: `${peakLevel}%` }}
        />
      )}
    </div>
  );
}
