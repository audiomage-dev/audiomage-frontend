interface WaveformVisualizationProps {
  data: number[];
  color: string;
  fileName: string;
  isPlaying: boolean;
}

export function WaveformVisualization({ data, color, fileName, isPlaying }: WaveformVisualizationProps) {
  return (
    <div className="absolute inset-2 rounded flex items-end justify-around px-1" style={{ backgroundColor: `${color}20` }}>
      {data.map((height, index) => (
        <div
          key={index}
          className={`w-1 waveform-bar ${isPlaying ? 'animate-waveform' : ''}`}
          style={{
            backgroundColor: color,
            height: `${height}%`,
          }}
        />
      ))}
      <div className="absolute top-1 left-2 text-xs font-mono text-[hsl(var(--nord-4))] bg-[hsl(var(--nord-0))] bg-opacity-80 px-1 rounded">
        {fileName}
      </div>
    </div>
  );
}
