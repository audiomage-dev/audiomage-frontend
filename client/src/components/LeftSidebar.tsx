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
    <div className="h-full flex flex-col bg-gradient-to-b from-[var(--muted)] to-[var(--background)]">
      {/* Transport Controls */}
      <div className="flex-none">
        <TransportControls
          transport={transport}
          bpm={bpm}
          timeSignature={timeSignature}
          onPlay={onPlay}
          onPause={onPause}
          onStop={onStop}
          onRecord={onRecord}
        />
      </div>

      {/* Project Browser */}
      <div className="flex-1 min-h-0 border-y border-[var(--border)]">
        <ProjectBrowser />
      </div>

      {/* AI Assistant Panel */}
      <div className="flex-none h-64">
        <AIAssistant
          suggestions={aiSuggestions}
          isProcessing={isAIProcessing}
        />
      </div>
    </div>
  );
}
