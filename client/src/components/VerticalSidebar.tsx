import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ProjectBrowser } from './ProjectBrowser';
import { AudioChangemapsPanel } from './AudioChangemapsPanel';
import { ProjectVersionsPanel } from './ProjectVersionsPanel';
import { QuickActionsPanel } from './QuickActionsPanel';
import { AIToolsModal } from './AIToolsModal';
import { SpellbookModal } from './SpellbookModal';
import { InlineChatPanel } from './InlineChatPanel';
import { AISoundLibrary } from './AISoundLibrary';
import { 
  FolderOpen, 
  GitBranch, 
  Settings, 
  Zap,
  Users,
  HelpCircle,
  History,
  Library,
  Volume2,
  VolumeX,
  Headphones,
  Music,
  Sparkles,
  Mic,
  Radio,
  TrendingUp,
  BarChart3,
  Target,
  Activity,
  Gauge,
  Crown,
  Sliders,
  Piano,
  Layers,
  Waves,
  Wand2,
  Lightbulb,
  MessageSquare,
  Menu,
  ChevronDown
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

// Define the SidebarItem interface
interface SidebarItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  component: React.ReactNode;
}

interface VerticalSidebarProps {
  onFileSelect?: (file: {
    id: string;
    name: string;
    type: 'audio' | 'video' | 'image';
    url: string;
    duration?: number;
    size?: number;
  }) => void;
  containerHeight?: number;
}

export function VerticalSidebar({ onFileSelect, containerHeight }: VerticalSidebarProps = {}) {
  const [activePanel, setActivePanel] = useState<string>('quick-actions');
  const [isExpanded, setIsExpanded] = useState(true);
  const [isAIToolsModalOpen, setIsAIToolsModalOpen] = useState(false);
  const [selectedAITool, setSelectedAITool] = useState<string>('auto-eq');
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isSpellbookModalOpen, setIsSpellbookModalOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Determine if buttons should collapse based on container height
  useEffect(() => {
    if (containerHeight) {
      // Calculate space needed for all buttons (8 buttons * 32px height + 8 * 4px spacing + padding)
      const buttonHeight = 32; // h-8 = 32px
      const buttonSpacing = 4; // space-y-1 = 4px
      const paddingAndOtherElements = 80; // Toggle button, settings button, padding
      const totalNeededHeight = (sidebarItems.length * buttonHeight) + 
                               ((sidebarItems.length - 1) * buttonSpacing) + 
                               paddingAndOtherElements;
      
      const shouldCollapse = containerHeight < totalNeededHeight;
      setIsCollapsed(shouldCollapse);
      if (shouldCollapse && dropdownOpen) {
        setDropdownOpen(false);
      }
    }
  }, [containerHeight, dropdownOpen]);

  const handleAIToolClick = (toolId: string) => {
    setSelectedAITool(toolId);
    setIsAIToolsModalOpen(true);
  };

  const sidebarItems: SidebarItem[] = [
    {
      id: 'prompts',
      icon: <MessageSquare className="w-5 h-5" />,
      label: 'Prompts',
      component: (
        <InlineChatPanel currentSession="Main Session" />
      )
    },
    {
      id: 'quick-actions',
      icon: <Wand2 className="w-5 h-5" />,
      label: 'Quick Actions',
      component: <QuickActionsPanel />
    },
    {
      id: 'files',
      icon: <FolderOpen className="w-5 h-5" />,
      label: 'Explorer',
      component: <ProjectBrowser onFileSelect={onFileSelect} />
    },
    {
      id: 'version',
      icon: <GitBranch className="w-5 h-5" />,
      label: 'Version Control',
      component: <ProjectVersionsPanel />
    },
    {
      id: 'ai',
      icon: <Zap className="w-5 h-5" />,
      label: 'AI Assistant',
      component: (
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-[var(--border)] bg-[var(--muted)]">
            <h3 className="text-sm font-medium text-[var(--foreground)] mb-2">AI Production Suite</h3>
            <p className="text-xs text-[var(--muted-foreground)]">Advanced AI tools and intelligent suggestions for audio production</p>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            
            {/* AI Suggestions Section - Integrated */}
            <div className="space-y-2 p-3 bg-gradient-to-br from-[var(--primary)]/5 to-[var(--secondary)]/5 rounded-lg border border-[var(--primary)]/20">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="w-4 h-4 text-[var(--primary)]" />
                <div className="text-xs font-medium text-[var(--foreground)]">Smart Suggestions</div>
              </div>
              <div className="space-y-2">
                {[
                  { id: 'eq-vocal', category: 'Enhancement', title: 'Vocal EQ Boost', description: 'Add presence at 3kHz', color: 'border-blue-400' },
                  { id: 'compress-drums', category: 'Dynamics', title: 'Drum Compression', description: 'Tighten drum transients', color: 'border-green-400' },
                  { id: 'stereo-width', category: 'Spatial', title: 'Stereo Widening', description: 'Enhance stereo image', color: 'border-purple-400' }
                ].map((suggestion) => (
                  <div key={suggestion.id} className={`p-2 bg-[var(--card)] rounded border ${suggestion.color} hover:bg-[var(--accent)] transition-colors cursor-pointer`}>
                    <div className="text-xs font-medium text-[var(--foreground)]">{suggestion.title}</div>
                    <div className="text-xs text-[var(--muted-foreground)]">{suggestion.description}</div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-[var(--primary)]">{suggestion.category}</span>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" className="h-5 w-5 p-0 text-green-500 hover:text-green-600">
                          ✓
                        </Button>
                        <Button size="sm" variant="ghost" className="h-5 w-5 p-0 text-red-500 hover:text-red-600">
                          ✕
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Real-time Processing */}
            <div className="space-y-2">
              <div className="text-xs font-medium text-[var(--foreground)] mb-2">Real-time Processing</div>
              <Button size="sm" variant="outline" className="w-full justify-start text-xs h-8" onClick={() => handleAIToolClick('auto-eq')}>
                <Volume2 className="w-3 h-3 mr-2 text-[var(--purple)]" />
                AI Auto-EQ
              </Button>
              <Button size="sm" variant="outline" className="w-full justify-start text-xs h-8" onClick={() => handleAIToolClick('smart-compressor')}>
                <Zap className="w-3 h-3 mr-2 text-[var(--blue)]" />
                Smart Compressor
              </Button>
              <Button size="sm" variant="outline" className="w-full justify-start text-xs h-8" onClick={() => handleAIToolClick('noise-suppression')}>
                <VolumeX className="w-3 h-3 mr-2 text-[var(--green)]" />
                Noise Suppression
              </Button>
              <Button size="sm" variant="outline" className="w-full justify-start text-xs h-8" onClick={() => handleAIToolClick('de-esser')}>
                <Headphones className="w-3 h-3 mr-2 text-[var(--orange)]" />
                De-esser Pro
              </Button>
            </div>

            {/* Audio Enhancement */}
            <div className="space-y-2">
              <div className="text-xs font-medium text-[var(--foreground)] mb-2">Audio Enhancement</div>
              <Button size="sm" variant="outline" className="w-full justify-start text-xs h-8" onClick={() => handleAIToolClick('vocal-clarity')}>
                <Sparkles className="w-3 h-3 mr-2 text-[var(--purple)]" />
                Vocal Clarity AI
              </Button>
              <Button size="sm" variant="outline" className="w-full justify-start text-xs h-8" onClick={() => handleAIToolClick('instrument-isolation')}>
                <Music className="w-3 h-3 mr-2 text-[var(--blue)]" />
                Instrument Isolation
              </Button>
              <Button size="sm" variant="outline" className="w-full justify-start text-xs h-8" onClick={() => handleAIToolClick('harmonic-enhancer')}>
                <Waves className="w-3 h-3 mr-2 text-[var(--cyan)]" />
                Harmonic Enhancer
              </Button>
              <Button size="sm" variant="outline" className="w-full justify-start text-xs h-8" onClick={() => handleAIToolClick('stereo-widener')}>
                <TrendingUp className="w-3 h-3 mr-2 text-[var(--green)]" />
                Stereo Widener
              </Button>
            </div>

            {/* Stem Separation */}
            <div className="space-y-2">
              <div className="text-xs font-medium text-[var(--foreground)] mb-2">Stem Separation</div>
              <Button size="sm" variant="outline" className="w-full justify-start text-xs h-8" onClick={() => handleAIToolClick('isolate-vocals')}>
                <Radio className="w-3 h-3 mr-2 text-[var(--red)]" />
                Isolate Vocals
              </Button>
              <Button size="sm" variant="outline" className="w-full justify-start text-xs h-8" onClick={() => handleAIToolClick('extract-drums')}>
                <Music className="w-3 h-3 mr-2 text-[var(--blue)]" />
                Extract Drums
              </Button>
              <Button size="sm" variant="outline" className="w-full justify-start text-xs h-8" onClick={() => handleAIToolClick('separate-bass')}>
                <Piano className="w-3 h-3 mr-2 text-[var(--purple)]" />
                Separate Bass
              </Button>
              <Button size="sm" variant="outline" className="w-full justify-start text-xs h-8" onClick={() => handleAIToolClick('four-stem-split')}>
                <Layers className="w-3 h-3 mr-2 text-[var(--orange)]" />
                4-Stem Split
              </Button>
            </div>

            {/* Mix Analysis */}
            <div className="space-y-2">
              <div className="text-xs font-medium text-[var(--foreground)] mb-2">Mix Analysis</div>
              <Button size="sm" variant="outline" className="w-full justify-start text-xs h-8" onClick={() => handleAIToolClick('frequency-analysis')}>
                <BarChart3 className="w-3 h-3 mr-2 text-[var(--blue)]" />
                Frequency Analysis
              </Button>
              <Button size="sm" variant="outline" className="w-full justify-start text-xs h-8" onClick={() => handleAIToolClick('loudness-check')}>
                <Target className="w-3 h-3 mr-2 text-[var(--green)]" />
                Loudness Check
              </Button>
              <Button size="sm" variant="outline" className="w-full justify-start text-xs h-8" onClick={() => handleAIToolClick('phase-correlation')}>
                <Activity className="w-3 h-3 mr-2 text-[var(--purple)]" />
                Phase Correlation
              </Button>
              <Button size="sm" variant="outline" className="w-full justify-start text-xs h-8" onClick={() => handleAIToolClick('dynamic-range')}>
                <Gauge className="w-3 h-3 mr-2 text-[var(--orange)]" />
                Dynamic Range
              </Button>
            </div>

            {/* Mastering */}
            <div className="space-y-2">
              <div className="text-xs font-medium text-[var(--foreground)] mb-2">AI Mastering</div>
              <Button size="sm" variant="outline" className="w-full justify-start text-xs h-8" onClick={() => handleAIToolClick('auto-master')}>
                <Crown className="w-3 h-3 mr-2 text-[var(--yellow)]" />
                Auto-Master
              </Button>
              <Button size="sm" variant="outline" className="w-full justify-start text-xs h-8" onClick={() => handleAIToolClick('genre-matching')}>
                <Sliders className="w-3 h-3 mr-2 text-[var(--blue)]" />
                Genre Matching
              </Button>
            </div>

            {/* AI Status */}
            <div className="p-3 bg-[var(--secondary)] rounded-md mt-4">
              <div className="text-xs font-medium text-[var(--foreground)] mb-2">AI Engine Status</div>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span>GPU Acceleration</span>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-[var(--green)] rounded-full"></div>
                    <span className="text-[var(--green)]">Active</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span>Neural Models</span>
                  <span className="font-mono">12 loaded</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span>Processing Queue</span>
                  <span className="font-mono">3 tasks</span>
                </div>
              </div>
            </div>
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
      id: 'changemaps',
      icon: <History className="w-5 h-5" />,
      label: 'Audio Changemaps',
      component: <AudioChangemapsPanel />
    },
    {
      id: 'library',
      icon: <Library className="w-5 h-5" />,
      label: 'AI Sound Library',
      component: <AISoundLibrary />
    },
    {
      id: 'spellbook',
      icon: <Wand2 className="w-5 h-5" />,
      label: 'Spellbook',
      component: (
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-[var(--border)] bg-[var(--muted)]">
            <h3 className="text-sm font-medium text-[var(--foreground)] mb-2">Workflow Automation</h3>
            <p className="text-xs text-[var(--muted-foreground)]">Pre-built workflows and custom automation templates</p>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Quick Workflow Templates */}
            <div className="space-y-2">
              <div className="text-xs font-medium text-[var(--foreground)] mb-2">Quick Templates</div>
              <Button size="sm" variant="outline" className="w-full justify-start text-xs h-8" onClick={() => setIsSpellbookModalOpen(true)}>
                <Mic className="w-3 h-3 mr-2 text-[var(--purple)]" />
                Vocal Chain
              </Button>
              <Button size="sm" variant="outline" className="w-full justify-start text-xs h-8" onClick={() => setIsSpellbookModalOpen(true)}>
                <Target className="w-3 h-3 mr-2 text-[var(--blue)]" />
                Drum Mix
              </Button>
              <Button size="sm" variant="outline" className="w-full justify-start text-xs h-8" onClick={() => setIsSpellbookModalOpen(true)}>
                <Crown className="w-3 h-3 mr-2 text-[var(--yellow)]" />
                Mix Bus Master
              </Button>
              <Button size="sm" variant="outline" className="w-full justify-start text-xs h-8" onClick={() => setIsSpellbookModalOpen(true)}>
                <Sparkles className="w-3 h-3 mr-2 text-[var(--green)]" />
                Creative FX
              </Button>
            </div>

            {/* Automation Actions */}
            <div className="space-y-2">
              <div className="text-xs font-medium text-[var(--foreground)] mb-2">Automation</div>
              <Button size="sm" variant="outline" className="w-full justify-start text-xs h-8">
                <Activity className="w-3 h-3 mr-2 text-[var(--red)]" />
                Record Macro
              </Button>
              <Button size="sm" variant="outline" className="w-full justify-start text-xs h-8">
                <Library className="w-3 h-3 mr-2 text-[var(--blue)]" />
                My Templates
              </Button>
            </div>

            {/* Open Full Spellbook */}
            <div className="pt-2 border-t border-[var(--border)]">
              <Button 
                size="sm" 
                className="w-full text-xs h-8 bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] hover:from-[var(--primary)]/90 hover:to-[var(--secondary)]/90"
                onClick={() => setIsSpellbookModalOpen(true)}
              >
                <Wand2 className="w-3 h-3 mr-2" />
                Open Spellbook
              </Button>
            </div>
          </div>
        </div>
      )
    },

  ];

  return (
    <div className={`${isExpanded ? 'w-full' : 'w-12'} h-full bg-[var(--background)] border border-[var(--border)] rounded-lg transition-all duration-300 flex`}>
      {/* Sidebar Icons */}
      <div className="w-12 flex flex-col items-center py-2 space-y-1 bg-[var(--background)]">
        {isCollapsed ? (
          /* Collapsed: Single dropdown button */
          <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="w-8 h-8 p-0 bg-[var(--primary)] text-[var(--primary-foreground)]"
                title="Panel Options"
              >
                <Menu className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="right" align="start" className="w-48">
              {sidebarItems.map((item) => (
                <DropdownMenuItem
                  key={item.id}
                  onClick={() => {
                    setActivePanel(item.id);
                    setDropdownOpen(false);
                    if (!isExpanded) setIsExpanded(true);
                  }}
                  className="flex items-center space-x-2"
                >
                  <span className="w-4 h-4">{item.icon}</span>
                  <span>{item.label}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          /* Normal: Individual buttons */
          sidebarItems.map((item) => (
            <Button
              key={item.id}
              variant="ghost"
              size="sm"
              className={`w-8 h-8 p-0 ${
                activePanel === item.id 
                  ? 'bg-[var(--primary)] text-[var(--primary-foreground)]' 
                  : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
              }`}
              onClick={() => {
                setActivePanel(item.id);
                if (!isExpanded) setIsExpanded(true);
              }}
              title={item.label}
            >
              {item.icon}
            </Button>
          ))
        )}
        
        <div className="flex-1" />
        
        {/* Settings Button */}
        <Button
          variant="ghost"
          size="sm"
          className="w-8 h-8 p-0 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          onClick={() => setIsSettingsModalOpen(true)}
          title="Settings"
        >
          <Settings className="w-4 h-4" />
        </Button>
        
        {/* Collapse/Expand Button */}
        <Button
          variant="ghost"
          size="sm"
          className="w-8 h-8 p-0 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          onClick={() => setIsExpanded(!isExpanded)}
          title={isExpanded ? "Collapse" : "Expand"}
        >
          {isExpanded ? '◀' : '▶'}
        </Button>
      </div>

      {/* Panel Content */}
      {isExpanded && (
        <div className="flex-1 h-full overflow-hidden">
          {sidebarItems.find(item => item.id === activePanel)?.component}
        </div>
      )}

      {/* Modals */}
      <AIToolsModal
        isOpen={isAIToolsModalOpen}
        onClose={() => setIsAIToolsModalOpen(false)}
        initialTool={selectedAITool}
      />

      <SpellbookModal
        isOpen={isSpellbookModalOpen}
        onClose={() => setIsSpellbookModalOpen(false)}
      />
    </div>
  );
}