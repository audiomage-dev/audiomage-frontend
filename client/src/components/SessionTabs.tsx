import { Button } from '@/components/ui/button';
import { Session } from '../types/audio';

interface SessionTabsProps {
  sessions: Session[];
  onSwitchSession: (sessionId: string) => void;
}

export function SessionTabs({ sessions, onSwitchSession }: SessionTabsProps) {
  return (
    <div className="bg-[hsl(var(--nord-1))] border-b border-[hsl(var(--nord-2))] px-2 flex items-center space-x-1 text-xs overflow-x-auto scrollbar-thin">
      {sessions.map((session) => (
        <div
          key={session.id}
          className={`flex items-center px-3 py-1 rounded-t border-t-2 min-w-max cursor-pointer ${
            session.isActive
              ? 'bg-[hsl(var(--frost-4))] text-white border-[hsl(var(--frost-2))]'
              : 'bg-[hsl(var(--nord-2))] text-[hsl(var(--nord-4))] hover:bg-[hsl(var(--nord-3))] border-transparent'
          }`}
          onClick={() => onSwitchSession(session.id)}
        >
          <span className="font-mono">{session.name}</span>
          <Button
            variant="ghost"
            size="sm"
            className="ml-2 hover:text-[hsl(var(--aurora-red))] h-auto p-0"
          >
            <i className="fas fa-times text-xs"></i>
          </Button>
        </div>
      ))}
      <Button
        variant="ghost"
        size="sm"
        className="p-1 hover:bg-[hsl(var(--nord-2))] rounded h-auto"
      >
        <i className="fas fa-plus text-[hsl(var(--nord-4))]"></i>
      </Button>
    </div>
  );
}
