import { Button } from '@/components/ui/button';
import { Session } from '../types/audio';
import { useState, useEffect } from 'react';
import { Copy, Edit, X, Save, FolderOpen } from 'lucide-react';

interface SessionTabsProps {
  sessions: Session[];
  onSwitchSession: (sessionId: string) => void;
}

interface ContextMenuProps {
  x: number;
  y: number;
  sessionId: string;
  onClose: () => void;
  onAction: (action: string, sessionId: string) => void;
}

function SessionContextMenu({ x, y, sessionId, onClose, onAction }: ContextMenuProps) {
  const menuItems = [
    { id: 'rename', label: 'Rename Session', icon: Edit },
    { id: 'duplicate', label: 'Duplicate Session', icon: Copy },
    { id: 'save', label: 'Save Session', icon: Save },
    { id: 'export', label: 'Export Session', icon: FolderOpen },
    { id: 'separator', label: '-' },
    { id: 'close', label: 'Close Session', icon: X, destructive: true }
  ];

  useEffect(() => {
    const handleClickOutside = () => onClose();
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [onClose]);

  return (
    <div 
      className="fixed bg-[var(--popover)] border border-[var(--border)] rounded-md shadow-lg py-1 z-50 min-w-[160px]"
      style={{ left: x, top: y }}
      onClick={(e) => e.stopPropagation()}
    >
      {menuItems.map((item) => 
        item.id === 'separator' ? (
          <div key={item.id} className="border-t border-[var(--border)] my-1" />
        ) : (
          <button
            key={item.id}
            className={`w-full flex items-center px-3 py-2 text-sm text-left hover:bg-[var(--accent)] transition-colors ${
              item.destructive ? 'text-[var(--destructive)] hover:text-[var(--destructive)]' : 'text-[var(--foreground)]'
            }`}
            onClick={() => {
              onAction(item.id, sessionId);
              onClose();
            }}
          >
            {item.icon && <item.icon className="w-4 h-4 mr-2" />}
            {item.label}
          </button>
        )
      )}
    </div>
  );
}

export function SessionTabs({ sessions, onSwitchSession }: SessionTabsProps) {
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; sessionId: string } | null>(null);

  const handleContextMenu = (e: React.MouseEvent, sessionId: string) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      sessionId
    });
  };

  const handleContextAction = (action: string, sessionId: string) => {
    console.log(`Action: ${action} on session: ${sessionId}`);
    // Handle different actions here
    switch (action) {
      case 'rename':
        // Implement rename functionality
        break;
      case 'duplicate':
        // Implement duplicate functionality
        break;
      case 'save':
        // Implement save functionality
        break;
      case 'export':
        // Implement export functionality
        break;
      case 'close':
        // Implement close functionality
        break;
    }
  };
  return (
    <>
      <div className="bg-transparent px-2 flex items-center space-x-2 text-xs overflow-x-auto scrollbar-thin">
        {sessions.map((session) => (
          <div
            key={session.id}
            className={`group session-tab flex items-center relative min-w-max cursor-pointer transition-all duration-300 rounded-lg overflow-hidden mx-0.5 ${
              session.isActive
                ? 'active bg-gradient-to-r from-[var(--primary)]/15 to-[var(--primary)]/8 text-[var(--foreground)] shadow-md border-2 border-[var(--primary)]/30 ring-1 ring-[var(--primary)]/10'
                : 'text-[var(--muted-foreground)] hover:bg-[var(--muted)]/90 hover:text-[var(--foreground)] border-2 border-[var(--border)]/50 hover:border-[var(--border)] hover:shadow-sm bg-[var(--background)]/80'
            }`}
            onClick={() => onSwitchSession(session.id)}
            onContextMenu={(e) => handleContextMenu(e, session.id)}
          >
            {/* Active indicator */}
            {session.isActive && (
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[var(--primary)] to-[var(--primary)]/60" />
            )}
            
            <div className="flex items-center px-3 py-2 gap-2">
              {/* Session status indicator */}
              <div className={`w-2 h-2 rounded-full transition-colors status-indicator ${
                session.isActive 
                  ? 'active bg-[var(--primary)] shadow-sm' 
                  : 'bg-[var(--muted-foreground)]/40 group-hover:bg-[var(--muted-foreground)]/60'
              }`} />
              
              <span className="font-medium text-xs truncate max-w-[100px] select-none">
                {session.name}
              </span>
              
              {/* Close button */}
              <Button
                variant="ghost"
                size="sm"
                className={`ml-1 h-4 w-4 p-0 rounded-full tab-close-btn ${
                  session.isActive
                    ? 'opacity-70 hover:opacity-100 hover:bg-[var(--destructive)]/10 hover:text-[var(--destructive)]'
                    : 'opacity-0 group-hover:opacity-70 hover:opacity-100 hover:bg-[var(--destructive)]/10 hover:text-[var(--destructive)]'
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleContextAction('close', session.id);
                }}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
            
            {/* Hover effect overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          </div>
        ))}
        {/* Add new session button */}
        <Button
          variant="ghost"
          size="sm"
          className="group new-tab-btn flex items-center gap-2 px-3 py-2 h-auto rounded-lg border border-dashed border-[var(--border)] hover:border-[var(--primary)]/40 hover:bg-[var(--primary)]/5 transition-all duration-200 text-[var(--muted-foreground)] hover:text-[var(--foreground)] ml-2"
          onClick={() => console.log('Add new session')}
        >
          <div className="w-4 h-4 rounded-full border border-current flex items-center justify-center group-hover:border-[var(--primary)] transition-colors">
            <span className="text-xs font-bold leading-none">+</span>
          </div>
          <span className="text-xs font-medium hidden sm:block">New</span>
        </Button>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <SessionContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          sessionId={contextMenu.sessionId}
          onClose={() => setContextMenu(null)}
          onAction={handleContextAction}
        />
      )}
    </>
  );
}
