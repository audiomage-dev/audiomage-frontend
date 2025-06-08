import { Button } from '@/components/ui/button';
import { Session } from '../types/audio';
import { useState, useEffect } from 'react';
import { Copy, Edit, X, Save, FolderOpen, AlertTriangle, Plus } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface SessionTabsProps {
  sessions: Session[];
  onSwitchSession: (sessionId: string) => void;
  onAddSession: () => void;
  onCloseSession: (sessionId: string) => void;
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

export function SessionTabs({ sessions, onSwitchSession, onAddSession, onCloseSession }: SessionTabsProps) {
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; sessionId: string } | null>(null);
  const [closeDialogOpen, setCloseDialogOpen] = useState(false);
  const [sessionToClose, setSessionToClose] = useState<string | null>(null);

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
        handleCloseRequest(sessionId);
        break;
    }
    setContextMenu(null);
  };

  const handleCloseRequest = (sessionId: string) => {
    setSessionToClose(sessionId);
    setCloseDialogOpen(true);
  };

  const handleConfirmClose = () => {
    if (sessionToClose) {
      onCloseSession(sessionToClose);
      setSessionToClose(null);
    }
    setCloseDialogOpen(false);
  };

  const handleCancelClose = () => {
    setSessionToClose(null);
    setCloseDialogOpen(false);
  };
  return (
    <>
      <div className="bg-[var(--background)] border-b border-[var(--border)] px-2 h-10 flex items-center overflow-x-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-[var(--muted)] hover:scrollbar-thumb-[var(--muted-foreground)]">
        <div className="flex items-center gap-1 min-w-max">
          {sessions.map((session, index) => (
            <div key={session.id} className="relative group">
              <div
                className={`
                  relative flex items-center gap-2 px-4 py-2 cursor-pointer
                  transition-all duration-200 min-w-max rounded-lg
                  ${session.isActive 
                    ? 'bg-[var(--accent)] text-[var(--accent-foreground)] shadow-sm ring-1 ring-[var(--primary)]/20' 
                    : 'bg-transparent text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]'
                  }
                  border border-transparent
                  ${session.isActive 
                    ? 'border-[var(--primary)]/30' 
                    : 'hover:border-[var(--border)]'
                  }
                `}
                onClick={() => onSwitchSession(session.id)}
                onContextMenu={(e) => handleContextMenu(e, session.id)}
              >
                {/* Status indicator */}
                <div className={`w-2 h-2 rounded-full transition-colors ${
                  session.isActive 
                    ? 'bg-[var(--primary)] shadow-sm' 
                    : 'bg-[var(--muted-foreground)]/40 group-hover:bg-[var(--muted-foreground)]/60'
                }`} />
                
                {/* Session name */}
                <span className="text-sm font-medium truncate max-w-[120px]">
                  {session.name}
                </span>
                
                {/* Close button */}
                {sessions.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleContextAction('close', session.id);
                    }}
                    className={`
                      opacity-0 group-hover:opacity-100 transition-all duration-200 
                      p-1 rounded-md hover:bg-[var(--destructive)] hover:text-[var(--destructive-foreground)]
                      ${session.isActive ? 'hover:bg-[var(--destructive)]' : ''}
                    `}
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
                
                {/* Active indicator */}
                {session.isActive && (
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-6 h-0.5 bg-[var(--primary)] rounded-full" />
                )}
              </div>
            </div>
          ))}
        </div>
        
        {/* Add session button */}
        <div className="ml-2 flex-shrink-0">
          <Button
            onClick={onAddSession}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] rounded-lg border border-dashed border-[var(--border)] hover:border-[var(--primary)]/30 transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
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

      {/* Close Confirmation Dialog */}
      <AlertDialog open={closeDialogOpen} onOpenChange={setCloseDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-[var(--destructive)]" />
              Close Session
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to close this session? Any unsaved changes will be lost. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelClose}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmClose}
              className="bg-[var(--destructive)] text-[var(--destructive-foreground)] hover:bg-[var(--destructive)]/90"
            >
              Close Session
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
