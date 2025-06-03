interface WaveformVisualizationProps {
  data: number[];
  color: string;
  fileName: string;
  isPlaying: boolean;
}

export function WaveformVisualization({ data, color, fileName, isPlaying }: WaveformVisualizationProps) {
  // Calculate contrasting waveform color based on background
  const getWaveformColor = (bgColor: string) => {
    switch (bgColor) {
      case '#E5E5E5': // Light gray (Video) - use dark waveform
        return '#2D3748';
      case '#E53E3E': // Red (Dialogue) - use dark red waveform
        return '#C53030';
      case '#718096': // Gray (Music) - use light waveform
        return '#E2E8F0';
      case '#48BB78': // Bright green (Foley) - use darker green waveform
        return '#2F855A';
      case '#4299E1': // Bright blue (Sound Design) - use darker blue waveform
        return '#2B6CB0';
      case '#FF9FF3': // Pink (Ambiance) - use dark pink waveform
        return '#D53F8C';
      default:
        return '#4A5568'; // Default dark gray
    }
  };

  const waveformColor = getWaveformColor(color);

  // Generate detailed waveform points for smooth curves
  const generateWaveformPath = () => {
    if (!data.length) return '';
    
    const width = 400; // Total width of waveform
    const height = 64; // Height of track
    const centerY = height / 2;
    const samplesPerPixel = Math.max(1, Math.floor(data.length / width));
    
    let path = `M 0 ${centerY}`;
    
    for (let x = 0; x < width; x++) {
      const sampleIndex = Math.floor(x * samplesPerPixel);
      if (sampleIndex < data.length) {
        const amplitude = (data[sampleIndex] / 100) * (height / 2);
        const y1 = centerY - amplitude; // Top of waveform
        const y2 = centerY + amplitude; // Bottom of waveform
        
        path += ` L ${x} ${y1}`;
      }
    }
    
    // Complete the waveform by drawing the bottom half in reverse
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
    <div className="absolute inset-0 rounded overflow-hidden" style={{ backgroundColor: `${color}20` }}>
      {/* Waveform SVG */}
      <svg 
        className="w-full h-full" 
        viewBox="0 0 400 64" 
        preserveAspectRatio="none"
      >
        {/* Background grid lines */}
        <defs>
          <pattern id="grid" width="20" height="64" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 64" fill="none" stroke={`${waveformColor}20`} strokeWidth="1"/>
          </pattern>
        </defs>
        <rect width="400" height="64" fill="url(#grid)" />
        
        {/* Center line */}
        <line x1="0" y1="32" x2="400" y2="32" stroke={`${waveformColor}40`} strokeWidth="1" strokeDasharray="2,2" />
        
        {/* Waveform path */}
        <path
          d={generateWaveformPath()}
          fill={waveformColor}
          fillOpacity="0.6"
          stroke={waveformColor}
          strokeWidth="1"
          className={`transition-all duration-200 ${isPlaying ? 'animate-pulse' : ''}`}
        />
        
        {/* Waveform outline for crisp edges */}
        {data.map((amplitude, index) => {
          const x = (index / data.length) * 400;
          const y1 = 32 - (amplitude / 100) * 30;
          const y2 = 32 + (amplitude / 100) * 30;
          return (
            <line
              key={index}
              x1={x}
              y1={y1}
              x2={x}
              y2={y2}
              stroke={waveformColor}
              strokeWidth="1.5"
              opacity="0.9"
              className={isPlaying ? 'animate-pulse' : ''}
            />
          );
        })}
        
        {/* Playhead indicator */}
        {isPlaying && (
          <line
            x1="50"
            y1="0"
            x2="50"
            y2="64"
            stroke="var(--primary)"
            strokeWidth="2"
            opacity="0.8"
            className="animate-bounce"
          />
        )}
      </svg>
      
      {/* File name overlay */}
      <div className="absolute top-1 left-2 text-xs font-mono text-[var(--foreground)] bg-[var(--background)]/80 px-2 py-1 rounded backdrop-blur-sm">
        {fileName}
      </div>
      
      {/* Audio info overlay */}
      <div className="absolute top-1 right-2 text-xs font-mono text-[var(--muted-foreground)] bg-[var(--background)]/80 px-2 py-1 rounded backdrop-blur-sm">
        {isPlaying ? '▶ Playing' : '⏸ Paused'}
      </div>
    </div>
  );
}
