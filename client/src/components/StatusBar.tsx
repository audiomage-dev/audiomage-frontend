import { AIAnalysis } from '../types/audio';

interface StatusBarProps {
  projectName: string;
  isSaved: boolean;
  aiAnalysis: AIAnalysis;
  lastAIAnalysis: Date;
}

export function StatusBar({ projectName, isSaved, aiAnalysis, lastAIAnalysis }: StatusBarProps) {
  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'just now';
    if (diffMins === 1) return '1 min ago';
    return `${diffMins} min ago`;
  };

  return (
    <div className="bg-[hsl(var(--nord-1))] border-t border-[hsl(var(--nord-2))] px-3 py-1 flex items-center justify-between text-xs">
      <div className="flex items-center space-x-4">
        <span className="font-mono">Project: {projectName}</span>
        <span className={`flex items-center space-x-1 ${isSaved ? 'text-[hsl(var(--aurora-green))]' : 'text-[hsl(var(--aurora-orange))]'}`}>
          <span>●</span>
          <span>{isSaved ? 'Saved' : 'Unsaved'}</span>
        </span>
        <span>Last AI Analysis: {formatTimeAgo(lastAIAnalysis)}</span>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-1">
          <span>LUFS:</span>
          <span className="font-mono text-[hsl(var(--frost-2))]">{aiAnalysis.lufs}</span>
        </div>
        <div className="flex items-center space-x-1">
          <span>Peak:</span>
          <span className="font-mono text-[hsl(var(--aurora-yellow))]">{aiAnalysis.peak}dB</span>
        </div>
        <div className="flex items-center space-x-1">
          <span>AI Processing:</span>
          <div className={`w-2 h-2 rounded-full ${aiAnalysis.isProcessing ? 'bg-[hsl(var(--aurora-yellow))] animate-pulse' : 'bg-[hsl(var(--aurora-green))]'}`}></div>
          <span className={aiAnalysis.isProcessing ? 'text-[hsl(var(--aurora-yellow))]' : 'text-[hsl(var(--aurora-green))]'}>
            {aiAnalysis.isProcessing ? 'Processing' : 'Ready'}
          </span>
        </div>
      </div>
    </div>
  );
}
