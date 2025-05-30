import { TransportControls } from './TransportControls';
import { AIAssistant } from './AIAssistant';
import { ProjectBrowser } from './ProjectBrowser';
import { TransportState } from '../types/audio';

interface LeftSidebarProps {
  transport: TransportState;
  bpm: number;
  timeSignature: [number, number];
  aiSuggestions: string[];
  isAIProcessing: boolean;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onRecord: () => void;
}

export function LeftSidebar({
  transport,
  bpm,
  timeSignature,
  aiSuggestions,
  isAIProcessing,
  onPlay,
  onPause,
  onStop,
  onRecord,
}: LeftSidebarProps) {
  return (
    <div className="w-64 bg-[hsl(var(--muted))] border-r border-[hsl(var(--border))] flex flex-col">
      <TransportControls
        transport={transport}
        bpm={bpm}
        timeSignature={timeSignature}
        onPlay={onPlay}
        onPause={onPause}
        onStop={onStop}
        onRecord={onRecord}
      />
      
      <AIAssistant
        suggestions={aiSuggestions}
        isProcessing={isAIProcessing}
      />
      
      <ProjectBrowser />
    </div>
  );
}
