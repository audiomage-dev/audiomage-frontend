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
      <div className="bg-[#252526] border-b border-[#2d2d30] px-3 h-9 flex items-center overflow-x-auto">
        {sessions.map((session, index) => (
          <div key={session.id} className="flex items-center">
            <div
              className={`
                flex items-center gap-2 px-3 py-1.5 cursor-pointer
                transition-colors duration-150 group relative text-xs font-medium
                ${session.isActive 
                  ? 'bg-[#1a1a1a] text-white border-b border-[#0e639c]' 
                  : 'bg-[#252526] text-[#cccccc] hover:bg-[#1e1e1e] hover:text-white'
                }
              `}
              onClick={() => onSwitchSession(session.id)}
              onContextMenu={(e) => handleContextMenu(e, session.id)}
            >
              <span className="truncate max-w-[120px]">{session.name}</span>
              
              {sessions.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleContextAction('close', session.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 p-0.5 rounded hover:bg-[#FF4444] hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
            {index < sessions.length - 1 && (
              <div className="w-px h-5 bg-[#2d2d30] mx-1" />
            )}
          </div>
        ))}
        <div className="w-px h-5 bg-[#2d2d30] mx-1" />
        <Button
          onClick={onAddSession}
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0 text-[#cccccc] hover:text-white hover:bg-[#1e1e1e] rounded ml-2 text-sm"
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
