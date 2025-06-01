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
      <div className="bg-[hsl(var(--muted))] border-b border-[hsl(var(--border))] px-2 flex items-center space-x-1 text-xs overflow-x-auto scrollbar-thin">
        {sessions.map((session) => (
          <div
            key={session.id}
            className={`flex items-center px-3 py-1 rounded-t border-t-2 min-w-max cursor-pointer ${
              session.isActive
                ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] border-[hsl(var(--frost-2))]'
                : 'bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] hover:bg-[hsl(var(--accent))] border-transparent'
            }`}
            onClick={() => onSwitchSession(session.id)}
            onContextMenu={(e) => handleContextMenu(e, session.id)}
          >
            <span className="font-mono">{session.name}</span>
            <Button
              variant="ghost"
              size="sm"
              className="ml-2 hover:text-[hsl(var(--aurora-red))] h-auto p-0"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        ))}
        <Button
          variant="ghost"
          size="sm"
          className="p-1 hover:bg-[hsl(var(--accent))] rounded h-auto"
        >
          <i className="fas fa-plus text-[hsl(var(--foreground))]"></i>
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
