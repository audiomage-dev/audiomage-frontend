import { Button } from '@/components/ui/button';
import { Session } from '../types/audio';
import { useState, useEffect } from 'react';
import { Copy, Edit, X, Save, FolderOpen, AlertTriangle } from 'lucide-react';
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
      <div className="bg-[#2B2B2B] border-b border-[#404040] px-1 h-8 flex items-start overflow-x-auto scrollbar-hide">
        {sessions.map((session, index) => (
          <div key={session.id} className="flex items-start">
            <div
              className={`
                relative flex items-center gap-2 px-4 py-1.5 cursor-pointer
                transition-all duration-200 group min-w-max
                ${session.isActive 
                  ? 'bg-[#3A3A3A] text-white' 
                  : 'bg-[#323232] text-[#B8B8B8] hover:bg-[#373737] hover:text-white'
                }
                rounded-t-md border-2
                ${session.isActive 
                  ? 'border-[#5A9FD4]' 
                  : 'border-transparent border-t-transparent hover:border-t-[#757575] hover:border-l-transparent hover:border-r-transparent hover:border-b-transparent'
                }
                mt-0.5
              `}
              onClick={() => onSwitchSession(session.id)}
              onContextMenu={(e) => handleContextMenu(e, session.id)}
            >
              <div className={`w-2 h-2 rounded-full mr-1 ${
                session.isActive ? 'bg-[#5A9FD4]' : 'bg-[#666666] group-hover:bg-[#888888]'
              }`} />
              
              <span className="text-xs font-medium truncate max-w-[100px]">{session.name}</span>
              
              {sessions.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleContextAction('close', session.id);
                  }}
                  className="opacity-0 group-hover:opacity-70 hover:opacity-100 transition-opacity duration-150 p-0.5 rounded hover:bg-[#FF4444] hover:text-white ml-1"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              )}
              
              {/* Tab bottom border overlay for active state */}
              {session.isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#5A9FD4]" />
              )}
            </div>
          </div>
        ))}
        
        <Button
          onClick={onAddSession}
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 text-[#888888] hover:text-white hover:bg-[#373737] rounded ml-2 mt-1 text-xs border border-[#404040] hover:border-[#5A5A5A]"
        >
          +
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
