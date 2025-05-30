import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ProjectBrowser } from './ProjectBrowser';
import { 
  FolderOpen, 
  Search, 
  GitBranch, 
  Terminal, 
  Settings, 
  Layers,
  Sliders,
  Music,
  Zap,
  Users,
  HelpCircle,
  Lightbulb
} from 'lucide-react';

interface SidebarItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  component?: React.ReactNode;
}

export function VerticalSidebar() {
  const [activePanel, setActivePanel] = useState<string>('files');
  const [isExpanded, setIsExpanded] = useState(true);

  const sidebarItems: SidebarItem[] = [
    {
      id: 'files',
      icon: <FolderOpen className="w-5 h-5" />,
      label: 'Explorer',
      component: <ProjectBrowser />
    },
    {
      id: 'search',
      icon: <Search className="w-5 h-5" />,
      label: 'Search',
      component: (
        <div className="p-4">
          <h3 className="text-sm font-medium text-[var(--foreground)] mb-3">Global Search</h3>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Search in project..."
              className="w-full px-3 py-2 text-sm bg-[var(--input)] border border-[var(--border)] rounded-md text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]"
            />
            <div className="text-xs text-[var(--muted-foreground)]">
              Search across all audio files, MIDI, and project data
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'version',
      icon: <GitBranch className="w-5 h-5" />,
      label: 'Version Control',
      component: (
        <div className="p-4">
          <h3 className="text-sm font-medium text-[var(--foreground)] mb-3">Project Versions</h3>
          <div className="space-y-2">
            <div className="p-2 bg-[var(--muted)] rounded-md">
              <div className="text-xs font-medium text-[var(--foreground)]">Current Session</div>
              <div className="text-xs text-[var(--muted-foreground)]">Auto-saved 2 min ago</div>
            </div>
            <div className="text-xs text-[var(--muted-foreground)]">
              Track changes and save project snapshots
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'tracks',
      icon: <Layers className="w-5 h-5" />,
      label: 'Track Manager',
      component: (
        <div className="p-4">
          <h3 className="text-sm font-medium text-[var(--foreground)] mb-3">Track Overview</h3>
          <div className="space-y-2">
            {['Vocal Lead', 'Guitar Rhythm', 'Bass Line', 'Drums'].map((track, index) => (
              <div key={track} className="flex items-center justify-between p-2 bg-[var(--muted)] rounded-md">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full bg-[var(--${['blue', 'green', 'yellow', 'red'][index]})]`}></div>
                  <span className="text-xs text-[var(--foreground)]">{track}</span>
                </div>
                <div className="text-xs text-[var(--muted-foreground)]">
                  {index === 0 ? 'REC' : 'PLAY'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 'mixer',
      icon: <Sliders className="w-5 h-5" />,
      label: 'Quick Mix',
      component: (
        <div className="p-4">
          <h3 className="text-sm font-medium text-[var(--foreground)] mb-3">Master Controls</h3>
          <div className="space-y-3">
            <div>
              <div className="text-xs text-[var(--muted-foreground)] mb-1">Master Volume</div>
              <div className="flex items-center space-x-2">
                <div className="flex-1 h-2 bg-[var(--muted)] rounded-full">
                  <div className="h-full w-3/4 bg-[var(--primary)] rounded-full"></div>
                </div>
                <span className="text-xs font-mono text-[var(--foreground)]">-6dB</span>
              </div>
            </div>
            <div>
              <div className="text-xs text-[var(--muted-foreground)] mb-1">AI Analysis</div>
              <div className="text-xs text-[var(--green)]">✓ Mix balanced</div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'ai',
      icon: <Zap className="w-5 h-5" />,
      label: 'AI Assistant',
      component: (
        <div className="p-4">
          <h3 className="text-sm font-medium text-[var(--foreground)] mb-3">AI Tools</h3>
          <div className="space-y-2">
            <Button size="sm" variant="outline" className="w-full justify-start text-xs">
              <Music className="w-3 h-3 mr-2" />
              Auto-Master Track
            </Button>
            <Button size="sm" variant="outline" className="w-full justify-start text-xs">
              <Zap className="w-3 h-3 mr-2" />
              Enhance Audio
            </Button>
            <Button size="sm" variant="outline" className="w-full justify-start text-xs">
              <Search className="w-3 h-3 mr-2" />
              Analyze Mix
            </Button>
          </div>
        </div>
      )
    },
    {
      id: 'terminal',
      icon: <Terminal className="w-5 h-5" />,
      label: 'Audio Console',
      component: (
        <div className="p-4">
          <h3 className="text-sm font-medium text-[var(--foreground)] mb-3">Audio Console</h3>
          <div className="bg-[var(--muted)] rounded-md p-3 font-mono text-xs">
            <div className="text-[var(--green)]">$ Audio Engine Ready</div>
            <div className="text-[var(--muted-foreground)]">Sample Rate: 48kHz</div>
            <div className="text-[var(--muted-foreground)]">Buffer: 256 samples</div>
            <div className="text-[var(--muted-foreground)]">Latency: 5.3ms</div>
          </div>
        </div>
      )
    },
    {
      id: 'collab',
      icon: <Users className="w-5 h-5" />,
      label: 'Collaboration',
      component: (
        <div className="p-4">
          <h3 className="text-sm font-medium text-[var(--foreground)] mb-3">Live Session</h3>
          <div className="space-y-2">
            <div className="flex items-center space-x-2 p-2 bg-[var(--muted)] rounded-md">
              <div className="w-2 h-2 rounded-full bg-[var(--green)] animate-pulse"></div>
              <span className="text-xs text-[var(--foreground)]">You (Producer)</span>
            </div>
            <div className="text-xs text-[var(--muted-foreground)]">
              Invite collaborators to work on this project in real-time
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'suggestions',
      icon: <Lightbulb className="w-5 h-5" />,
      label: 'AI Suggestions',
      component: (
        <div className="p-4">
          <h3 className="text-sm font-medium text-[var(--foreground)] mb-3">AI Suggestions</h3>
          <div className="space-y-3">
            <div className="bg-[var(--muted)] rounded-md p-3 border-l-2 border-l-[var(--blue)]">
              <div className="text-xs font-medium text-[var(--foreground)] mb-1">Mix Enhancement</div>
              <div className="text-xs text-[var(--muted-foreground)]">
                Consider adding high-shelf EQ to vocals around 8kHz for more presence
              </div>
            </div>
            <div className="bg-[var(--muted)] rounded-md p-3 border-l-2 border-l-[var(--green)]">
              <div className="text-xs font-medium text-[var(--foreground)] mb-1">Arrangement</div>
              <div className="text-xs text-[var(--muted-foreground)]">
                Bass and kick drum could benefit from sidechain compression
              </div>
            </div>
            <div className="bg-[var(--muted)] rounded-md p-3 border-l-2 border-l-[var(--yellow)]">
              <div className="text-xs font-medium text-[var(--foreground)] mb-1">Creative Idea</div>
              <div className="text-xs text-[var(--muted-foreground)]">
                Try a subtle tape saturation on the drum bus for vintage warmth
              </div>
            </div>
            <div className="bg-[var(--muted)] rounded-md p-3 border-l-2 border-l-[var(--purple)]">
              <div className="text-xs font-medium text-[var(--foreground)] mb-1">Mastering</div>
              <div className="text-xs text-[var(--muted-foreground)]">
                Current LUFS: -14.2. Target: -14.0 for streaming platforms
              </div>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[var(--border)]">
            <Button size="sm" variant="outline" className="w-full text-xs">
              <Zap className="w-3 h-3 mr-2" />
              Generate New Suggestions
            </Button>
          </div>
        </div>
      )
    }
  ];

  const handleItemClick = (itemId: string) => {
    if (activePanel === itemId && isExpanded) {
      setIsExpanded(false);
    } else {
      setActivePanel(itemId);
      setIsExpanded(true);
    }
  };

  const activeItem = sidebarItems.find(item => item.id === activePanel);

  return (
    <div className="flex h-full">
      {/* Icon Bar */}
      <div className="w-12 bg-[var(--muted)] border-r border-[var(--border)] flex flex-col">
        {/* Main Icons */}
        <div className="flex-1 py-2">
          {sidebarItems.map((item) => (
            <Button
              key={item.id}
              variant="ghost"
              size="sm"
              onClick={() => handleItemClick(item.id)}
              className={`w-full h-10 p-0 mb-1 rounded-none border-r-2 transition-all duration-200 ${
                activePanel === item.id && isExpanded
                  ? 'bg-[var(--accent)] border-r-[var(--primary)] text-[var(--primary)]'
                  : 'border-r-transparent hover:bg-[var(--accent)]'
              }`}
              title={item.label}
            >
              {item.icon}
            </Button>
          ))}
        </div>

        {/* Bottom Icons */}
        <div className="border-t border-[var(--border)] py-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-full h-10 p-0 mb-1 rounded-none hover:bg-[var(--accent)]"
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-full h-10 p-0 rounded-none hover:bg-[var(--accent)]"
            title="Help"
          >
            <HelpCircle className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Expandable Panel */}
      {isExpanded && activeItem && (
        <div className="w-80 bg-[var(--background)] border-r border-[var(--border)] flex flex-col">
          {/* Panel Header */}
          <div className="h-8 px-3 py-2 border-b border-[var(--border)] bg-[var(--muted)] flex items-center justify-between">
            <span className="text-xs font-medium text-[var(--foreground)] uppercase tracking-wider">
              {activeItem.label}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(false)}
              className="h-4 w-4 p-0 hover:bg-[var(--accent)]"
            >
              <span className="text-xs">×</span>
            </Button>
          </div>

          {/* Panel Content */}
          <div className="flex-1 overflow-hidden">
            {activeItem.component}
          </div>
        </div>
      )}
    </div>
  );
}