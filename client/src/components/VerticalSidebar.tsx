import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ProjectBrowser } from './ProjectBrowser';
import { AISuggestionsPanel } from './AISuggestionsPanel';
import { AudioChangemapsPanel } from './AudioChangemapsPanel';
import { ProjectVersionsPanel } from './ProjectVersionsPanel';
import { QuickActionsPanel } from './QuickActionsPanel';
import { AIToolsModal } from './AIToolsModal';
import { SpellbookModal } from './SpellbookModal';
import { AudioTrack } from '../types/audio';
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
  Lightbulb,
  Check,
  X,
  Square,
  CheckSquare,
  History,
  Library,
  Play,
  Pause,
  Volume2,
  Monitor,
  Headphones,
  Keyboard,
  Globe,
  Shield,
  Database,
  Download,
  Upload,
  RefreshCw,
  Heart,
  Filter,
  Tag,
  Clock,
  Star,
  Wand2,
  Sparkles,
  Mic,
  Radio,
  TrendingUp,
  Scissors,
  Copy,
  RotateCcw,
  Volume,
  VolumeX,
  Waves,
  Piano,
  Activity,
  Gauge,
  Crown,
  Minimize2,
  Wind,
  Music2,
  Shuffle,
  Film,
  MessageSquare,
  FileAudio,
  BarChart3,
  Target,
  BookOpen,
  FileText,
  Trash2,
  Archive,
  HardDrive,
} from 'lucide-react';

interface SidebarItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  component?: React.ReactNode;
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
  tracks?: AudioTrack[];
}

export function VerticalSidebar({ onFileSelect, tracks = [] }: VerticalSidebarProps = {}) {
  const [activePanel, setActivePanel] = useState<string>('quick-actions');
  const [isExpanded, setIsExpanded] = useState(true);
  const [isAIToolsModalOpen, setIsAIToolsModalOpen] = useState(false);
  const [selectedAITool, setSelectedAITool] = useState<string>('auto-eq');
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isSpellbookModalOpen, setIsSpellbookModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<
    Array<{
      id: string;
      type: 'audio' | 'midi' | 'project' | 'track' | 'clip';
      name: string;
      path?: string;
      description?: string;
      lastModified?: string;
    }>
  >([]);
  const [searchFilters, setSearchFilters] = useState<{
    audio: boolean;
    midi: boolean;
    projects: boolean;
    tracks: boolean;
  }>({
    audio: true,
    midi: true,
    projects: true,
    tracks: true,
  });
  const [collaborators, setCollaborators] = useState([
    {
      id: '1',
      name: 'Alex Chen',
      role: 'Producer',
      status: 'online',
      avatar: '👨‍🎵',
      lastSeen: 'now',
    },
    {
      id: '2',
      name: 'Maya Rodriguez',
      role: 'Audio Engineer',
      status: 'online',
      avatar: '👩‍🎤',
      lastSeen: 'now',
    },
    {
      id: '3',
      name: 'Jordan Smith',
      role: 'Composer',
      status: 'away',
      avatar: '🎹',
      lastSeen: '5 min ago',
    },
    {
      id: '4',
      name: 'Sam Taylor',
      role: 'Mixing Engineer',
      status: 'offline',
      avatar: '🎛️',
      lastSeen: '2 hours ago',
    },
  ]);
  const [sessionStatus, setSessionStatus] = useState<
    'active' | 'idle' | 'offline'
  >('active');
  const [activeSettingsCategory, setActiveSettingsCategory] =
    useState('general');

  const handleAIToolClick = (toolId: string) => {
    setSelectedAITool(toolId);
    setIsAIToolsModalOpen(true);
  };

  // Mock search function - in a real app, this would query your backend/database
  const performSearch = (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    const mockData = [
      {
        id: '1',
        type: 'audio' as const,
        name: 'Vocal_Lead_Take_3.wav',
        path: '/project/vocals/',
        description: 'Main vocal recording, take 3',
        lastModified: '2 hours ago',
      },
      {
        id: '2',
        type: 'midi' as const,
        name: 'Piano_Melody.mid',
        path: '/project/midi/',
        description: 'Main piano melody track',
        lastModified: '1 day ago',
      },
      {
        id: '3',
        type: 'track' as const,
        name: 'Drums - Full Kit',
        description: 'Complete drum kit setup with 8 channels',
        lastModified: '3 hours ago',
      },
      {
        id: '4',
        type: 'project' as const,
        name: 'Summer Song Project.ap',
        path: '/projects/',
        description: 'Main project file for summer track',
        lastModified: '30 minutes ago',
      },
      {
        id: '5',
        type: 'clip' as const,
        name: 'Guitar Solo Clip',
        description: 'Guitar solo recorded in take 2',
        lastModified: '1 hour ago',
      },
    ];

    // Simple search filter based on query
    const filtered = mockData.filter((item) => {
      const searchTerm = query.toLowerCase();
      const matchesName = item.name.toLowerCase().includes(searchTerm);
      const matchesDescription =
        item.description?.toLowerCase().includes(searchTerm) || false;
      const matchesType =
        searchFilters[item.type as keyof typeof searchFilters];

      return (matchesName || matchesDescription) && matchesType;
    });

    setSearchResults(filtered);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    performSearch(query);
  };

  const toggleFilter = (filterType: keyof typeof searchFilters) => {
    setSearchFilters((prev) => ({
      ...prev,
      [filterType]: !prev[filterType],
    }));

    // Re-run search with new filters
    if (searchQuery) {
      performSearch(searchQuery);
    }
  };

  const sidebarItems: SidebarItem[] = [
    {
      id: 'quick-actions',
      icon: <Wand2 className="w-5 h-5" />,
      label: 'Quick Actions',
      component: <QuickActionsPanel />,
    },
    {
      id: 'files',
      icon: <FolderOpen className="w-5 h-5" />,
      label: 'Explorer',
      component: <ProjectBrowser onFileSelect={onFileSelect} />,
    },
    {
      id: 'search',
      icon: <Search className="w-5 h-5" />,
      label: 'Search',
      component: (
        <div className="h-full flex flex-col">
          {/* Search Header */}
          <div className="p-4 border-b border-[var(--border)]">
            <h3 className="text-sm font-medium text-[var(--foreground)] mb-3">
              Global Search
            </h3>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Search in project..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-[var(--input)] border border-[var(--border)] rounded-md text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]"
              />

              {/* Search Filters */}
              <div className="flex flex-wrap gap-2">
                {Object.entries(searchFilters).map(([key, enabled]) => (
                  <button
                    key={key}
                    onClick={() =>
                      toggleFilter(key as keyof typeof searchFilters)
                    }
                    className={`px-2 py-1 text-xs rounded-full transition-colors ${
                      enabled
                        ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                        : 'bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--accent)]'
                    }`}
                  >
                    <div className="flex items-center space-x-1">
                      {key === 'audio' && <FileAudio className="w-3 h-3" />}
                      {key === 'midi' && <Piano className="w-3 h-3" />}
                      {key === 'projects' && <FolderOpen className="w-3 h-3" />}
                      {key === 'tracks' && <Layers className="w-3 h-3" />}
                      <span className="capitalize">{key}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Search Results */}
          <div className="flex-1 overflow-y-auto">
            {searchQuery && (
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-[var(--muted-foreground)]">
                    {searchResults.length} results for "{searchQuery}"
                  </span>
                  {searchResults.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-xs"
                      onClick={() => {
                        setSearchQuery('');
                        setSearchResults([]);
                      }}
                    >
                      Clear
                    </Button>
                  )}
                </div>

                {searchResults.length === 0 ? (
                  <div className="text-center py-8">
                    <Search className="w-8 h-8 text-[var(--muted-foreground)] mx-auto mb-2" />
                    <div className="text-sm text-[var(--muted-foreground)]">
                      No results found
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {searchResults.map((result) => (
                      <div
                        key={result.id}
                        className="p-3 bg-[var(--muted)]/30 rounded-lg hover:bg-[var(--accent)] cursor-pointer transition-colors border border-transparent hover:border-[var(--border)]"
                        onClick={() => {
                          // Handle result click - could open file, navigate, etc.
                          console.log('Selected search result:', result);
                        }}
                      >
                        <div className="flex items-start space-x-2">
                          <div className="flex-shrink-0 mt-1">
                            {result.type === 'audio' && (
                              <FileAudio className="w-4 h-4 text-[var(--blue)]" />
                            )}
                            {result.type === 'midi' && (
                              <Piano className="w-4 h-4 text-[var(--green)]" />
                            )}
                            {result.type === 'project' && (
                              <FolderOpen className="w-4 h-4 text-[var(--purple)]" />
                            )}
                            {result.type === 'track' && (
                              <Layers className="w-4 h-4 text-[var(--orange)]" />
                            )}
                            {result.type === 'clip' && (
                              <Film className="w-4 h-4 text-[var(--pink)]" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-[var(--foreground)] truncate">
                              {result.name}
                            </div>
                            {result.description && (
                              <div className="text-xs text-[var(--muted-foreground)] mt-1 truncate">
                                {result.description}
                              </div>
                            )}
                            <div className="flex items-center justify-between mt-2">
                              {result.path && (
                                <span className="text-xs text-[var(--muted-foreground)] truncate">
                                  {result.path}
                                </span>
                              )}
                              {result.lastModified && (
                                <span className="text-xs text-[var(--muted-foreground)] flex-shrink-0">
                                  {result.lastModified}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Empty State */}
            {!searchQuery && (
              <div className="p-4 text-center">
                <div className="py-8">
                  <Search className="w-12 h-12 text-[var(--muted-foreground)] mx-auto mb-4" />
                  <div className="text-sm text-[var(--foreground)] mb-2">
                    Search across your project
                  </div>
                  <div className="text-xs text-[var(--muted-foreground)]">
                    Find audio files, MIDI tracks, project files, and more
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      id: 'version',
      icon: <GitBranch className="w-5 h-5" />,
      label: 'Version Control',
      component: <ProjectVersionsPanel />,
    },
    {
      id: 'tracks',
      icon: <Layers className="w-5 h-5" />,
      label: 'Track Manager',
      component: (
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-[var(--foreground)]">
              Track Overview
            </h3>
            <span className="text-xs text-[var(--muted-foreground)]">
              {tracks.length} tracks
            </span>
          </div>
          
          {tracks.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-xs text-[var(--muted-foreground)] mb-2">
                No tracks in project
              </div>
              <div className="text-xs text-[var(--muted-foreground)]">
                Add audio files to get started
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {tracks.map((track) => {
                const clipCount = track.clips?.length || 0;
                const isRecording = !track.muted && !track.soloed && clipCount === 0;
                const isPlaying = !track.muted && clipCount > 0;
                
                return (
                  <div
                    key={track.id}
                    className="flex items-center justify-between p-2 bg-[var(--muted)] rounded-md hover:bg-[var(--accent)] transition-colors"
                  >
                    <div className="flex items-center space-x-2 flex-1 min-w-0">
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: track.color }}
                      ></div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs text-[var(--foreground)] truncate font-medium">
                          {track.name}
                        </div>
                        <div className="text-xs text-[var(--muted-foreground)] mt-0.5">
                          {track.type} • {clipCount} clip{clipCount !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      {track.muted && (
                        <div className="w-4 h-4 rounded-full bg-[var(--red)]/20 border border-[var(--red)] flex items-center justify-center">
                          <VolumeX className="w-2 h-2 text-[var(--red)]" />
                        </div>
                      )}
                      {track.soloed && (
                        <div className="w-4 h-4 rounded-full bg-[var(--yellow)]/20 border border-[var(--yellow)] flex items-center justify-center">
                          <Volume2 className="w-2 h-2 text-[var(--yellow)]" />
                        </div>
                      )}
                      
                      <div className="text-xs font-mono text-[var(--muted-foreground)] min-w-[32px] text-right">
                        {track.muted ? 'MUTE' : track.soloed ? 'SOLO' : isRecording ? 'REC' : isPlaying ? 'PLAY' : 'IDLE'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ),
    },
    {
      id: 'mixer',
      icon: <Sliders className="w-5 h-5" />,
      label: 'Quick Mix',
      component: (
        <div className="h-full flex flex-col bg-gradient-to-b from-[var(--background)] to-[var(--muted)]/20">
          {/* Header with Mixing State */}
          <div className="p-4 border-b border-[var(--border)] bg-gradient-to-r from-[var(--primary)]/5 to-[var(--secondary)]/5">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-[var(--foreground)]">
                Mix Engine
              </h3>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-[var(--green)] rounded-full animate-pulse"></div>
                <span className="text-xs text-[var(--muted-foreground)] font-mono">
                  LIVE
                </span>
              </div>
            </div>
            <div className="text-xs text-[var(--muted-foreground)]">
              Real-time processing active
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-4 scrollbar-hide">
            {/* Compact Master Volume & Levels */}
            <div className="grid grid-cols-2 gap-3">
              {/* Circular Master Volume */}
              <div className="text-center">
                <div className="text-xs font-medium text-[var(--foreground)] mb-2">
                  Master
                </div>
                <div className="relative w-16 h-16 mx-auto">
                  <div className="absolute inset-0 rounded-full border-2 border-[var(--muted)]"></div>
                  <svg
                    className="absolute inset-0 w-full h-full transform -rotate-90"
                    viewBox="0 0 100 100"
                  >
                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      stroke="url(#volumeGradient)"
                      strokeWidth="6"
                      fill="none"
                      strokeDasharray="264"
                      strokeDashoffset="66"
                    />
                    <defs>
                      <linearGradient
                        id="volumeGradient"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="100%"
                      >
                        <stop offset="0%" stopColor="var(--primary)" />
                        <stop offset="100%" stopColor="var(--secondary)" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-xs font-bold text-[var(--foreground)]">
                      -6.2
                    </div>
                  </div>
                </div>
              </div>

              {/* Compact Level Meters */}
              <div className="text-center">
                <div className="text-xs font-medium text-[var(--foreground)] mb-2">
                  Levels
                </div>
                <div className="flex justify-center space-x-2">
                  <div className="text-center">
                    <div className="text-xs mb-1 font-mono">L</div>
                    <div className="relative w-4 h-16 bg-[var(--muted)] rounded-full overflow-hidden">
                      {[...Array(8)].map((_, i) => (
                        <div
                          key={i}
                          className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0.5 rounded-full ${i < 6 ? 'bg-[var(--green)]' : i < 7 ? 'bg-[var(--yellow)]' : 'bg-[var(--red)]'}`}
                          style={{ height: `${(i + 1) * 12}%` }}
                        />
                      ))}
                    </div>
                    <div className="text-xs font-mono mt-1 text-[var(--green)]">
                      -3.2
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs mb-1 font-mono">R</div>
                    <div className="relative w-4 h-16 bg-[var(--muted)] rounded-full overflow-hidden">
                      {[...Array(8)].map((_, i) => (
                        <div
                          key={i}
                          className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0.5 rounded-full ${i < 5 ? 'bg-[var(--green)]' : i < 6 ? 'bg-[var(--yellow)]' : 'bg-[var(--red)]'}`}
                          style={{ height: `${(i + 1) * 10}%` }}
                        />
                      ))}
                    </div>
                    <div className="text-xs font-mono mt-1 text-[var(--green)]">
                      -4.1
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Compact EQ */}
            <div>
              <div className="text-xs font-medium text-[var(--foreground)] mb-2 text-center">
                EQ
              </div>
              <div className="grid grid-cols-3 gap-2">
                {['High', 'Mid', 'Low'].map((band, index) => (
                  <div key={band} className="text-center">
                    <div
                      className={`w-6 h-6 mx-auto rounded-full border-2 cursor-pointer ${
                        band === 'High'
                          ? 'border-[var(--blue)] bg-[var(--blue)]/20'
                          : band === 'Mid'
                            ? 'border-[var(--green)] bg-[var(--green)]/20'
                            : 'border-[var(--red)] bg-[var(--red)]/20'
                      }`}
                    />
                    <div className="text-xs font-mono mt-1">
                      {band === 'High'
                        ? '+0.0'
                        : band === 'Mid'
                          ? '-1.2'
                          : '+2.1'}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Compact Processing Chain */}
            <div>
              <div className="text-xs font-medium text-[var(--foreground)] mb-2 text-center">
                Chain
              </div>
              <div className="space-y-1">
                {[
                  {
                    name: 'Compressor',
                    value: '3:1',
                    color: 'var(--green)',
                    active: true,
                  },
                  {
                    name: 'Limiter',
                    value: '-0.1dB',
                    color: 'var(--blue)',
                    active: true,
                  },
                ].map((processor) => (
                  <div
                    key={processor.name}
                    className="flex items-center justify-between p-2 rounded border border-[var(--primary)]/20 bg-[var(--muted)]/20"
                  >
                    <div className="flex items-center space-x-2">
                      <div
                        className={`w-2 h-2 rounded-full ${processor.active ? 'animate-pulse' : ''}`}
                        style={{ backgroundColor: processor.color }}
                      />
                      <span className="text-xs">{processor.name}</span>
                    </div>
                    <span className="text-xs font-mono">{processor.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Compact Analysis */}
            <div className="p-3 bg-gradient-to-br from-[var(--secondary)]/20 to-[var(--primary)]/10 rounded-lg border border-[var(--primary)]/20">
              <div className="text-xs font-medium text-[var(--foreground)] mb-2 text-center">
                Analysis
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="text-center">
                  <div className="text-[var(--muted-foreground)]">LUFS</div>
                  <div className="font-mono text-[var(--green)]">-14.2</div>
                </div>
                <div className="text-center">
                  <div className="text-[var(--muted-foreground)]">Peak</div>
                  <div className="font-mono text-[var(--yellow)]">-1.2</div>
                </div>
              </div>
              <div className="mt-2 p-1 bg-[var(--green)]/10 rounded text-center">
                <div className="text-xs text-[var(--green)]">✨ Ready</div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'ai',
      icon: <Zap className="w-5 h-5" />,
      label: 'AI Assistant',
      component: (
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-[var(--border)] bg-[var(--muted)]">
            <h3 className="text-sm font-medium text-[var(--foreground)] mb-2">
              AI Production Suite
            </h3>
            <p className="text-xs text-[var(--muted-foreground)]">
              Advanced AI tools for audio production and post-production
            </p>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Real-time Processing */}
            <div className="space-y-2">
              <div className="text-xs font-medium text-[var(--foreground)] mb-2">
                Real-time Processing
              </div>
              <Button
                size="sm"
                variant="outline"
                className="w-full justify-start text-xs h-8"
                onClick={() => handleAIToolClick('auto-eq')}
              >
                <Volume2 className="w-3 h-3 mr-2 text-[var(--purple)]" />
                AI Auto-EQ
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="w-full justify-start text-xs h-8"
                onClick={() => handleAIToolClick('smart-compressor')}
              >
                <Zap className="w-3 h-3 mr-2 text-[var(--blue)]" />
                Smart Compressor
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="w-full justify-start text-xs h-8"
                onClick={() => handleAIToolClick('noise-suppression')}
              >
                <VolumeX className="w-3 h-3 mr-2 text-[var(--green)]" />
                Noise Suppression
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="w-full justify-start text-xs h-8"
                onClick={() => handleAIToolClick('de-esser')}
              >
                <Headphones className="w-3 h-3 mr-2 text-[var(--orange)]" />
                De-esser Pro
              </Button>
            </div>

            {/* Audio Enhancement */}
            <div className="space-y-2">
              <div className="text-xs font-medium text-[var(--foreground)] mb-2">
                Audio Enhancement
              </div>
              <Button
                size="sm"
                variant="outline"
                className="w-full justify-start text-xs h-8"
                onClick={() => handleAIToolClick('vocal-clarity')}
              >
                <Sparkles className="w-3 h-3 mr-2 text-[var(--purple)]" />
                Vocal Clarity AI
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="w-full justify-start text-xs h-8"
                onClick={() => handleAIToolClick('instrument-isolation')}
              >
                <Music className="w-3 h-3 mr-2 text-[var(--blue)]" />
                Instrument Isolation
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="w-full justify-start text-xs h-8"
                onClick={() => handleAIToolClick('harmonic-enhancer')}
              >
                <Waves className="w-3 h-3 mr-2 text-[var(--cyan)]" />
                Harmonic Enhancer
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="w-full justify-start text-xs h-8"
                onClick={() => handleAIToolClick('stereo-widener')}
              >
                <TrendingUp className="w-3 h-3 mr-2 text-[var(--green)]" />
                Stereo Widener
              </Button>
            </div>

            {/* Stem Separation */}
            <div className="space-y-2">
              <div className="text-xs font-medium text-[var(--foreground)] mb-2">
                Stem Separation
              </div>
              <Button
                size="sm"
                variant="outline"
                className="w-full justify-start text-xs h-8"
                onClick={() => handleAIToolClick('isolate-vocals')}
              >
                <Radio className="w-3 h-3 mr-2 text-[var(--red)]" />
                Isolate Vocals
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="w-full justify-start text-xs h-8"
                onClick={() => handleAIToolClick('extract-drums')}
              >
                <Music className="w-3 h-3 mr-2 text-[var(--blue)]" />
                Extract Drums
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="w-full justify-start text-xs h-8"
                onClick={() => handleAIToolClick('separate-bass')}
              >
                <Piano className="w-3 h-3 mr-2 text-[var(--purple)]" />
                Separate Bass
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="w-full justify-start text-xs h-8"
                onClick={() => handleAIToolClick('four-stem-split')}
              >
                <Layers className="w-3 h-3 mr-2 text-[var(--orange)]" />
                4-Stem Split
              </Button>
            </div>

            {/* Mix Analysis */}
            <div className="space-y-2">
              <div className="text-xs font-medium text-[var(--foreground)] mb-2">
                Mix Analysis
              </div>
              <Button
                size="sm"
                variant="outline"
                className="w-full justify-start text-xs h-8"
                onClick={() => handleAIToolClick('frequency-analysis')}
              >
                <BarChart3 className="w-3 h-3 mr-2 text-[var(--blue)]" />
                Frequency Analysis
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="w-full justify-start text-xs h-8"
                onClick={() => handleAIToolClick('loudness-check')}
              >
                <Target className="w-3 h-3 mr-2 text-[var(--green)]" />
                Loudness Check
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="w-full justify-start text-xs h-8"
                onClick={() => handleAIToolClick('phase-correlation')}
              >
                <Activity className="w-3 h-3 mr-2 text-[var(--purple)]" />
                Phase Correlation
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="w-full justify-start text-xs h-8"
                onClick={() => handleAIToolClick('dynamic-range')}
              >
                <Gauge className="w-3 h-3 mr-2 text-[var(--orange)]" />
                Dynamic Range
              </Button>
            </div>

            {/* Mastering */}
            <div className="space-y-2">
              <div className="text-xs font-medium text-[var(--foreground)] mb-2">
                AI Mastering
              </div>
              <Button
                size="sm"
                variant="outline"
                className="w-full justify-start text-xs h-8"
                onClick={() => handleAIToolClick('auto-master')}
              >
                <Crown className="w-3 h-3 mr-2 text-[var(--yellow)]" />
                Auto-Master
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="w-full justify-start text-xs h-8"
                onClick={() => handleAIToolClick('genre-matching')}
              >
                <Sliders className="w-3 h-3 mr-2 text-[var(--blue)]" />
                Genre Matching
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="w-full justify-start text-xs h-8"
                onClick={() => handleAIToolClick('limiting-ai')}
              >
                <Minimize2 className="w-3 h-3 mr-2 text-[var(--red)]" />
                Limiting AI
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="w-full justify-start text-xs h-8"
                onClick={() => handleAIToolClick('platform-optimize')}
              >
                <Globe className="w-3 h-3 mr-2 text-[var(--green)]" />
                Platform Optimize
              </Button>
            </div>

            {/* Content Generation */}
            <div className="space-y-2">
              <div className="text-xs font-medium text-[var(--foreground)] mb-2">
                AI Generation
              </div>
              <Button
                size="sm"
                variant="outline"
                className="w-full justify-start text-xs h-8"
                onClick={() => handleAIToolClick('voice-synthesis')}
              >
                <Mic className="w-3 h-3 mr-2 text-[var(--purple)]" />
                Voice Synthesis
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="w-full justify-start text-xs h-8"
                onClick={() => handleAIToolClick('ambient-generator')}
              >
                <Wind className="w-3 h-3 mr-2 text-[var(--cyan)]" />
                Ambient Generator
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="w-full justify-start text-xs h-8"
                onClick={() => handleAIToolClick('midi-composer')}
              >
                <Music2 className="w-3 h-3 mr-2 text-[var(--blue)]" />
                MIDI Composer
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="w-full justify-start text-xs h-8"
                onClick={() => handleAIToolClick('variation-creator')}
              >
                <Shuffle className="w-3 h-3 mr-2 text-[var(--orange)]" />
                Variation Creator
              </Button>
            </div>

            {/* Post-Production */}
            <div className="space-y-2">
              <div className="text-xs font-medium text-[var(--foreground)] mb-2">
                Post-Production
              </div>
              <Button
                size="sm"
                variant="outline"
                className="w-full justify-start text-xs h-8"
                onClick={() => handleAIToolClick('video-sync')}
              >
                <Film className="w-3 h-3 mr-2 text-[var(--purple)]" />
                Audio to Video Sync
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="w-full justify-start text-xs h-8"
                onClick={() => handleAIToolClick('speech-enhancement')}
              >
                <MessageSquare className="w-3 h-3 mr-2 text-[var(--blue)]" />
                Speech Enhancement
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="w-full justify-start text-xs h-8"
                onClick={() => handleAIToolClick('auto-edit')}
              >
                <Scissors className="w-3 h-3 mr-2 text-[var(--red)]" />
                Auto-Edit
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="w-full justify-start text-xs h-8"
                onClick={() => handleAIToolClick('format-converter')}
              >
                <FileAudio className="w-3 h-3 mr-2 text-[var(--green)]" />
                Format Converter
              </Button>
            </div>

            {/* AI Status */}
            <div className="p-3 bg-[var(--secondary)] rounded-md mt-4">
              <div className="text-xs font-medium text-[var(--foreground)] mb-2">
                AI Engine Status
              </div>
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
      ),
    },
    {
      id: 'terminal',
      icon: <Terminal className="w-5 h-5" />,
      label: 'Audio Console',
      component: (
        <div className="p-4">
          <h3 className="text-sm font-medium text-[var(--foreground)] mb-3">
            Audio Console
          </h3>
          <div className="bg-[var(--muted)] rounded-md p-3 font-mono text-xs">
            <div className="text-[var(--green)]">$ Audio Engine Ready</div>
            <div className="text-[var(--muted-foreground)]">
              Sample Rate: 48kHz
            </div>
            <div className="text-[var(--muted-foreground)]">
              Buffer: 256 samples
            </div>
            <div className="text-[var(--muted-foreground)]">Latency: 5.3ms</div>
          </div>
        </div>
      ),
    },
    {
      id: 'collab',
      icon: <Users className="w-5 h-5" />,
      label: 'Collaboration',
      component: (
        <div className="h-full flex flex-col">
          {/* Session Header */}
          <div className="p-4 border-b border-[var(--border)] bg-gradient-to-r from-[var(--primary)]/5 to-[var(--secondary)]/5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div
                  className={`w-3 h-3 rounded-full ${sessionStatus === 'active' ? 'bg-[var(--green)]' : sessionStatus === 'idle' ? 'bg-[var(--yellow)]' : 'bg-[var(--red)]'} animate-pulse`}
                ></div>
                <h3 className="text-sm font-medium text-[var(--foreground)]">
                  Live Session
                </h3>
              </div>
              <div className="flex space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  title="Session Settings"
                >
                  <Settings className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  title="Record Session"
                >
                  <Radio className="w-3 h-3 text-[var(--red)]" />
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-[var(--muted-foreground)]">
                Session: Summer Song Mix
              </span>
              <span className="text-[var(--green)] font-mono">
                {collaborators.filter((c) => c.status === 'online').length}{' '}
                online
              </span>
            </div>
          </div>

          {/* Collaborators List */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
                  Team Members ({collaborators.length})
                </h4>
                <Button variant="ghost" size="sm" className="h-6 text-xs">
                  <Users className="w-3 h-3 mr-1" />
                  Invite
                </Button>
              </div>

              <div className="space-y-2">
                {collaborators.map((collaborator) => (
                  <div
                    key={collaborator.id}
                    className="p-3 bg-[var(--muted)]/30 rounded-lg border border-transparent hover:border-[var(--border)] hover:bg-[var(--accent)] transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 min-w-0">
                        <div className="relative">
                          <div className="text-lg">{collaborator.avatar}</div>
                          <div
                            className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-[var(--background)] ${
                              collaborator.status === 'online'
                                ? 'bg-[var(--green)]'
                                : collaborator.status === 'away'
                                  ? 'bg-[var(--yellow)]'
                                  : 'bg-[var(--muted-foreground)]'
                            }`}
                          ></div>
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-[var(--foreground)] truncate">
                            {collaborator.name}
                          </div>
                          <div className="text-xs text-[var(--muted-foreground)]">
                            {collaborator.role}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-1">
                        {collaborator.status === 'online' && (
                          <div className="flex space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-5 w-5 p-0"
                              title="Start Voice Chat"
                            >
                              <Mic className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-5 w-5 p-0"
                              title="Send Message"
                            >
                              <MessageSquare className="w-3 h-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-2 text-xs text-[var(--muted-foreground)]">
                      {collaborator.status === 'online'
                        ? 'Active now'
                        : `Last seen ${collaborator.lastSeen}`}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Real-time Activity Feed */}
            <div className="border-t border-[var(--border)] p-4">
              <h4 className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider mb-3">
                Recent Activity
              </h4>
              <div className="space-y-3">
                {[
                  {
                    user: 'Maya',
                    action: 'adjusted EQ on Track 3',
                    time: '2 min ago',
                    type: 'edit',
                  },
                  {
                    user: 'Alex',
                    action: 'added reverb effect',
                    time: '5 min ago',
                    type: 'edit',
                  },
                  {
                    user: 'Jordan',
                    action: 'uploaded new MIDI file',
                    time: '12 min ago',
                    type: 'upload',
                  },
                  {
                    user: 'Maya',
                    action: 'left a comment on Verse 2',
                    time: '15 min ago',
                    type: 'comment',
                  },
                  {
                    user: 'Sam',
                    action: 'joined the session',
                    time: '23 min ago',
                    type: 'join',
                  },
                ].map((activity, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <div
                      className={`w-2 h-2 rounded-full mt-1 flex-shrink-0 ${
                        activity.type === 'edit'
                          ? 'bg-[var(--blue)]'
                          : activity.type === 'upload'
                            ? 'bg-[var(--green)]'
                            : activity.type === 'comment'
                              ? 'bg-[var(--purple)]'
                              : 'bg-[var(--yellow)]'
                      }`}
                    ></div>
                    <div className="min-w-0">
                      <div className="text-xs text-[var(--foreground)]">
                        <span className="font-medium">{activity.user}</span>{' '}
                        {activity.action}
                      </div>
                      <div className="text-xs text-[var(--muted-foreground)]">
                        {activity.time}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Session Controls */}
            <div className="border-t border-[var(--border)] p-4">
              <h4 className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider mb-3">
                Session Controls
              </h4>
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" className="text-xs">
                    <Shuffle className="w-3 h-3 mr-1" />
                    Sync Play
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs">
                    <Target className="w-3 h-3 mr-1" />
                    Follow Me
                  </Button>
                </div>

                <Button variant="outline" size="sm" className="w-full text-xs">
                  <MessageSquare className="w-3 h-3 mr-1" />
                  Open Chat
                </Button>

                <div className="flex items-center justify-between pt-2">
                  <div className="text-xs text-[var(--muted-foreground)]">
                    Permissions:
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      title="Edit Permissions"
                    >
                      <Shield className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1">
                  <span className="px-2 py-1 bg-[var(--muted)] text-xs rounded">
                    Edit Tracks
                  </span>
                  <span className="px-2 py-1 bg-[var(--muted)] text-xs rounded">
                    Add Effects
                  </span>
                  <span className="px-2 py-1 bg-[var(--muted)] text-xs rounded">
                    Mix Controls
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Session Status Bar */}
          <div className="border-t border-[var(--border)] p-3 bg-[var(--muted)]/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-[var(--green)] rounded-full animate-pulse"></div>
                <span className="text-xs text-[var(--foreground)] font-medium">
                  Connected
                </span>
              </div>
              <div className="text-xs text-[var(--muted-foreground)] font-mono">
                24:36 session time
              </div>
            </div>
            <div className="mt-1 text-xs text-[var(--muted-foreground)]">
              Auto-save enabled • Low latency mode
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'suggestions',
      icon: <Lightbulb className="w-5 h-5" />,
      label: 'AI Suggestions',
      component: <AISuggestionsPanel />,
    },
    {
      id: 'changemaps',
      icon: <History className="w-5 h-5" />,
      label: 'Audio Changemaps',
      component: <AudioChangemapsPanel />,
    },
    {
      id: 'library',
      icon: <Library className="w-5 h-5" />,
      label: 'AI Sound Library',
      component: (
        <div className="h-full flex flex-col">
          {/* Search and Filters Header */}
          <div className="p-4 border-b border-[var(--border)] bg-[var(--muted)]">
            <div className="space-y-3">
              {/* Main Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
                <input
                  type="text"
                  placeholder="Search sounds, tags, or descriptions..."
                  className="w-full pl-10 pr-4 py-2 text-sm bg-[var(--background)] border border-[var(--border)] rounded-md focus:outline-none focus:border-[var(--primary)]"
                />
              </div>

              {/* Quick Filters */}
              <div className="flex flex-wrap gap-1">
                {['SFX', 'Ambiance', 'Foley', 'Music', 'Voice'].map(
                  (filter) => (
                    <Button
                      key={filter}
                      variant="outline"
                      size="sm"
                      className="h-6 px-2 text-xs"
                    >
                      {filter}
                    </Button>
                  )
                )}
              </div>

              {/* Advanced Filters Toggle */}
              <div className="flex items-center justify-between">
                <Button variant="ghost" size="sm" className="text-xs">
                  <Filter className="w-3 h-3 mr-1" />
                  Advanced Filters
                </Button>
                <span className="text-xs text-[var(--muted-foreground)]">
                  12,847 sounds
                </span>
              </div>
            </div>
          </div>

          {/* Category Navigation */}
          <div className="p-4 border-b border-[var(--border)]">
            <h4 className="text-xs font-medium text-[var(--muted-foreground)] mb-2">
              Categories
            </h4>
            <div className="space-y-1">
              {[
                { name: 'Nature & Weather', count: 2156, icon: '🌿' },
                { name: 'Urban & City', count: 1843, icon: '🏙️' },
                { name: 'Mechanical & Tech', count: 2934, icon: '⚙️' },
                { name: 'Human Activities', count: 1567, icon: '👥' },
                { name: 'Musical Elements', count: 987, icon: '🎵' },
                { name: 'Abstract & Designed', count: 756, icon: '✨' },
                { name: 'Animals & Creatures', count: 634, icon: '🦅' },
                { name: 'Vehicles & Transport', count: 1245, icon: '🚗' },
              ].map((category) => (
                <div
                  key={category.name}
                  className="flex items-center justify-between p-2 rounded hover:bg-[var(--accent)] cursor-pointer group"
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">{category.icon}</span>
                    <span className="text-sm">{category.name}</span>
                  </div>
                  <span className="text-xs text-[var(--muted-foreground)] group-hover:text-[var(--foreground)]">
                    {category.count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Sound Results */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium">Recent & Trending</h4>
                <div className="flex space-x-1">
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <Square className="w-3 h-3" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <Layers className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                {[
                  {
                    name: 'Rain on Leaves Heavy.wav',
                    category: 'Nature',
                    duration: '2:34',
                    tags: ['rain', 'nature', 'ambient'],
                    popular: true,
                  },
                  {
                    name: 'City Traffic Morning.wav',
                    category: 'Urban',
                    duration: '1:47',
                    tags: ['traffic', 'urban', 'morning'],
                    popular: false,
                  },
                  {
                    name: 'Footsteps Gravel Slow.wav',
                    category: 'Foley',
                    duration: '0:15',
                    tags: ['footsteps', 'gravel', 'walking'],
                    popular: true,
                  },
                  {
                    name: 'Mechanical Hum Industrial.wav',
                    category: 'Tech',
                    duration: '4:12',
                    tags: ['mechanical', 'industrial', 'loop'],
                    popular: false,
                  },
                  {
                    name: 'Ocean Waves Gentle.wav',
                    category: 'Nature',
                    duration: '3:56',
                    tags: ['ocean', 'waves', 'peaceful'],
                    popular: true,
                  },
                ].map((sound, index) => (
                  <div
                    key={sound.name}
                    className="p-3 border border-[var(--border)] rounded-md hover:bg-[var(--accent)] group cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2 min-w-0">
                        {sound.popular && (
                          <Star className="w-3 h-3 text-[var(--yellow)] flex-shrink-0" />
                        )}
                        <span className="text-sm font-medium truncate">
                          {sound.name}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                        >
                          <Play className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                        >
                          <Download className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                        >
                          <Heart className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)]">
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-1 bg-[var(--secondary)] rounded text-xs">
                          {sound.category}
                        </span>
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{sound.duration}</span>
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1 mt-2">
                      {sound.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-1.5 py-0.5 bg-[var(--muted)] text-xs rounded"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Load More */}
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-4 text-xs"
              >
                Load More Sounds
              </Button>
            </div>
          </div>

          {/* Now Playing Mini Player */}
          <div className="border-t border-[var(--border)] p-3 bg-[var(--muted)]">
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <Pause className="w-3 h-3" />
              </Button>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium truncate">
                  Rain on Leaves Heavy.wav
                </div>
                <div className="text-xs text-[var(--muted-foreground)]">
                  0:45 / 2:34
                </div>
              </div>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <Volume2 className="w-3 h-3" />
              </Button>
            </div>
            <div className="mt-2">
              <div className="h-1 bg-[var(--background)] rounded-full">
                <div className="h-full w-1/3 bg-[var(--primary)] rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
  ];

  const handleItemClick = (itemId: string) => {
    if (activePanel === itemId && isExpanded) {
      setIsExpanded(false);
    } else {
      setActivePanel(itemId);
      setIsExpanded(true);
    }
  };

  const activeItem = sidebarItems.find((item) => item.id === activePanel);

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
            title="Spellbook"
            onClick={() => setIsSpellbookModalOpen(true)}
          >
            <BookOpen className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-full h-10 p-0 mb-1 rounded-none hover:bg-[var(--accent)]"
            title="Settings"
            onClick={() => setIsSettingsModalOpen(true)}
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
          <div className="flex-1 overflow-hidden">{activeItem.component}</div>
        </div>
      )}

      {/* AI Tools Modal */}
      <AIToolsModal
        isOpen={isAIToolsModalOpen}
        onClose={() => setIsAIToolsModalOpen(false)}
        initialTool={selectedAITool}
      />

      {/* Spellbook Modal */}
      <SpellbookModal
        isOpen={isSpellbookModalOpen}
        onClose={() => setIsSpellbookModalOpen(false)}
      />

      {/* Settings Modal */}
      {isSettingsModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[var(--background)] border border-[var(--border)] rounded-lg w-[900px] max-h-[90vh] flex flex-col shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
              <h2 className="text-lg font-semibold text-[var(--foreground)]">
                Settings
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSettingsModalOpen(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Content */}
            <div className="flex flex-1 min-h-0">
              {/* Settings Categories */}
              <div className="w-56 border-r border-[var(--border)] bg-[var(--muted)]/30">
                <div className="p-3">
                  <div className="space-y-1">
                    {[
                      { id: 'general', icon: Settings, label: 'General' },
                      { id: 'audio', icon: Headphones, label: 'Audio' },
                      { id: 'display', icon: Monitor, label: 'Display' },
                      { id: 'keyboard', icon: Keyboard, label: 'Keyboard' },
                      { id: 'ai', icon: Sparkles, label: 'AI Assistant' },
                      { id: 'network', icon: Globe, label: 'Network' },
                      { id: 'privacy', icon: Shield, label: 'Privacy' },
                      { id: 'storage', icon: Database, label: 'Storage' },
                    ].map((category) => (
                      <button
                        key={category.id}
                        onClick={() => setActiveSettingsCategory(category.id)}
                        className={`w-full flex items-center space-x-3 px-3 py-2 text-left text-sm rounded-md transition-colors ${
                          activeSettingsCategory === category.id
                            ? 'bg-[var(--accent)] text-[var(--primary)]'
                            : 'hover:bg-[var(--accent)]'
                        }`}
                      >
                        <category.icon
                          className={`w-4 h-4 ${
                            activeSettingsCategory === category.id
                              ? 'text-[var(--primary)]'
                              : 'text-[var(--muted-foreground)]'
                          }`}
                        />
                        <span className="text-[var(--foreground)]">
                          {category.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Settings Panel */}
              <div className="flex-1 p-6 overflow-y-auto">
                {activeSettingsCategory === 'general' && (
                  <div className="space-y-6">
                    <h3 className="text-base font-medium text-[var(--foreground)] mb-4">
                      General Settings
                    </h3>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <label className="text-sm font-medium text-[var(--foreground)]">
                            Auto-save Projects
                          </label>
                          <p className="text-xs text-[var(--muted-foreground)]">
                            Automatically save project changes every 5 minutes
                          </p>
                        </div>
                        <button className="w-10 h-6 bg-[var(--primary)] rounded-full relative">
                          <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <label className="text-sm font-medium text-[var(--foreground)]">
                            Show Tooltips
                          </label>
                          <p className="text-xs text-[var(--muted-foreground)]">
                            Display helpful tooltips on hover
                          </p>
                        </div>
                        <button className="w-10 h-6 bg-[var(--primary)] rounded-full relative">
                          <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <label className="text-sm font-medium text-[var(--foreground)]">
                            Confirm Destructive Actions
                          </label>
                          <p className="text-xs text-[var(--muted-foreground)]">
                            Ask for confirmation before deleting tracks or
                            projects
                          </p>
                        </div>
                        <button className="w-10 h-6 bg-[var(--primary)] rounded-full relative">
                          <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1" />
                        </button>
                      </div>

                      <div className="border-t border-[var(--border)] pt-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-[var(--foreground)]">
                            Default Project Location
                          </label>
                          <div className="flex space-x-2">
                            <input
                              type="text"
                              value="/home/user/AudioProjects"
                              className="flex-1 px-3 py-2 text-sm bg-[var(--input)] border border-[var(--border)] rounded-md"
                              readOnly
                            />
                            <Button variant="outline" size="sm">
                              <FolderOpen className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-2 mt-4">
                          <label className="text-sm font-medium text-[var(--foreground)]">
                            Language
                          </label>
                          <select className="w-full px-3 py-2 text-sm bg-[var(--input)] border border-[var(--border)] rounded-md">
                            <option>English (US)</option>
                            <option>English (UK)</option>
                            <option>Spanish</option>
                            <option>French</option>
                            <option>German</option>
                            <option>Japanese</option>
                            <option>Chinese (Simplified)</option>
                          </select>
                        </div>

                        <div className="space-y-2 mt-4">
                          <label className="text-sm font-medium text-[var(--foreground)]">
                            Time Format
                          </label>
                          <select className="w-full px-3 py-2 text-sm bg-[var(--input)] border border-[var(--border)] rounded-md">
                            <option>12-hour (AM/PM)</option>
                            <option>24-hour</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeSettingsCategory === 'audio' && (
                  <div className="space-y-6">
                    <h3 className="text-base font-medium text-[var(--foreground)] mb-4">
                      Audio Settings
                    </h3>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-[var(--foreground)]">
                          Audio Driver
                        </label>
                        <select className="w-full px-3 py-2 text-sm bg-[var(--input)] border border-[var(--border)] rounded-md">
                          <option>Web Audio API (Default)</option>
                          <option>ASIO</option>
                          <option>CoreAudio</option>
                          <option>WASAPI</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-[var(--foreground)]">
                          Sample Rate
                        </label>
                        <select className="w-full px-3 py-2 text-sm bg-[var(--input)] border border-[var(--border)] rounded-md">
                          <option>44.1 kHz</option>
                          <option>48 kHz</option>
                          <option>88.2 kHz</option>
                          <option>96 kHz</option>
                          <option>192 kHz</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-[var(--foreground)]">
                          Buffer Size
                        </label>
                        <select className="w-full px-3 py-2 text-sm bg-[var(--input)] border border-[var(--border)] rounded-md">
                          <option>64 samples (1.5ms)</option>
                          <option>128 samples (2.9ms)</option>
                          <option>256 samples (5.8ms)</option>
                          <option>512 samples (11.6ms)</option>
                          <option>1024 samples (23.2ms)</option>
                          <option>2048 samples (46.4ms)</option>
                        </select>
                        <p className="text-xs text-[var(--muted-foreground)]">
                          Lower values reduce latency but increase CPU usage
                        </p>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-[var(--foreground)]">
                          Bit Depth
                        </label>
                        <select className="w-full px-3 py-2 text-sm bg-[var(--input)] border border-[var(--border)] rounded-md">
                          <option>16-bit</option>
                          <option>24-bit</option>
                          <option>32-bit Float</option>
                        </select>
                      </div>

                      <div className="border-t border-[var(--border)] pt-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <label className="text-sm font-medium text-[var(--foreground)]">
                              Enable Audio Pre-loading
                            </label>
                            <p className="text-xs text-[var(--muted-foreground)]">
                              Pre-load audio files for faster playback
                            </p>
                          </div>
                          <button className="w-10 h-6 bg-[var(--primary)] rounded-full relative">
                            <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1" />
                          </button>
                        </div>

                        <div className="flex items-center justify-between mt-4">
                          <div className="flex-1">
                            <label className="text-sm font-medium text-[var(--foreground)]">
                              Record Monitoring
                            </label>
                            <p className="text-xs text-[var(--muted-foreground)]">
                              Enable input monitoring during recording
                            </p>
                          </div>
                          <button className="w-10 h-6 bg-[var(--muted)] rounded-full relative">
                            <div className="w-4 h-4 bg-white rounded-full absolute left-1 top-1" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeSettingsCategory === 'display' && (
                  <div className="space-y-6">
                    <h3 className="text-base font-medium text-[var(--foreground)] mb-4">
                      Display Settings
                    </h3>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-[var(--foreground)]">
                          Theme
                        </label>
                        <select className="w-full px-3 py-2 text-sm bg-[var(--input)] border border-[var(--border)] rounded-md">
                          <option>Nord (Default)</option>
                          <option>Dark</option>
                          <option>Light</option>
                          <option>High Contrast</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-[var(--foreground)]">
                          UI Scale
                        </label>
                        <div className="flex items-center space-x-4">
                          <input
                            type="range"
                            min="75"
                            max="150"
                            defaultValue="100"
                            className="flex-1"
                          />
                          <span className="text-sm text-[var(--muted-foreground)] w-12">
                            100%
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-[var(--foreground)]">
                          Waveform Display
                        </label>
                        <select className="w-full px-3 py-2 text-sm bg-[var(--input)] border border-[var(--border)] rounded-md">
                          <option>Peaks and RMS</option>
                          <option>Peaks Only</option>
                          <option>Spectral</option>
                        </select>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <label className="text-sm font-medium text-[var(--foreground)]">
                            Show Grid Lines
                          </label>
                          <p className="text-xs text-[var(--muted-foreground)]">
                            Display grid lines in timeline and editors
                          </p>
                        </div>
                        <button className="w-10 h-6 bg-[var(--primary)] rounded-full relative">
                          <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <label className="text-sm font-medium text-[var(--foreground)]">
                            Smooth Scrolling
                          </label>
                          <p className="text-xs text-[var(--muted-foreground)]">
                            Enable smooth scrolling animations
                          </p>
                        </div>
                        <button className="w-10 h-6 bg-[var(--primary)] rounded-full relative">
                          <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <label className="text-sm font-medium text-[var(--foreground)]">
                            Show Peak Meters
                          </label>
                          <p className="text-xs text-[var(--muted-foreground)]">
                            Display real-time level meters on tracks
                          </p>
                        </div>
                        <button className="w-10 h-6 bg-[var(--primary)] rounded-full relative">
                          <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {activeSettingsCategory === 'keyboard' && (
                  <div className="space-y-6">
                    <h3 className="text-base font-medium text-[var(--foreground)] mb-4">
                      Keyboard Shortcuts
                    </h3>

                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="Search shortcuts..."
                        className="w-full px-3 py-2 text-sm bg-[var(--input)] border border-[var(--border)] rounded-md"
                      />
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-[var(--muted-foreground)]">
                          Transport
                        </h4>
                        <div className="space-y-1">
                          {[
                            { action: 'Play/Pause', shortcut: 'Space' },
                            { action: 'Stop', shortcut: 'Shift + Space' },
                            { action: 'Record', shortcut: 'R' },
                            { action: 'Loop Toggle', shortcut: 'L' },
                            { action: 'Jump to Start', shortcut: 'Home' },
                            { action: 'Jump to End', shortcut: 'End' },
                          ].map((item) => (
                            <div
                              key={item.action}
                              className="flex items-center justify-between p-2 hover:bg-[var(--accent)] rounded"
                            >
                              <span className="text-sm">{item.action}</span>
                              <kbd className="px-2 py-1 text-xs bg-[var(--muted)] rounded">
                                {item.shortcut}
                              </kbd>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-[var(--muted-foreground)]">
                          Editing
                        </h4>
                        <div className="space-y-1">
                          {[
                            { action: 'Cut', shortcut: 'Ctrl + X' },
                            { action: 'Copy', shortcut: 'Ctrl + C' },
                            { action: 'Paste', shortcut: 'Ctrl + V' },
                            { action: 'Undo', shortcut: 'Ctrl + Z' },
                            { action: 'Redo', shortcut: 'Ctrl + Shift + Z' },
                            { action: 'Delete', shortcut: 'Delete' },
                            { action: 'Select All', shortcut: 'Ctrl + A' },
                            { action: 'Duplicate', shortcut: 'Ctrl + D' },
                          ].map((item) => (
                            <div
                              key={item.action}
                              className="flex items-center justify-between p-2 hover:bg-[var(--accent)] rounded"
                            >
                              <span className="text-sm">{item.action}</span>
                              <kbd className="px-2 py-1 text-xs bg-[var(--muted)] rounded">
                                {item.shortcut}
                              </kbd>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-[var(--muted-foreground)]">
                          View
                        </h4>
                        <div className="space-y-1">
                          {[
                            { action: 'Zoom In', shortcut: 'Ctrl + +' },
                            { action: 'Zoom Out', shortcut: 'Ctrl + -' },
                            { action: 'Fit to Window', shortcut: 'Ctrl + 0' },
                            { action: 'Toggle Mixer', shortcut: 'M' },
                            { action: 'Toggle Piano Roll', shortcut: 'P' },
                          ].map((item) => (
                            <div
                              key={item.action}
                              className="flex items-center justify-between p-2 hover:bg-[var(--accent)] rounded"
                            >
                              <span className="text-sm">{item.action}</span>
                              <kbd className="px-2 py-1 text-xs bg-[var(--muted)] rounded">
                                {item.shortcut}
                              </kbd>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeSettingsCategory === 'ai' && (
                  <div className="space-y-6">
                    <h3 className="text-base font-medium text-[var(--foreground)] mb-4">
                      AI Assistant Settings
                    </h3>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <label className="text-sm font-medium text-[var(--foreground)]">
                            Enable AI Assistant
                          </label>
                          <p className="text-xs text-[var(--muted-foreground)]">
                            Use AI-powered features and suggestions
                          </p>
                        </div>
                        <button className="w-10 h-6 bg-[var(--primary)] rounded-full relative">
                          <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <label className="text-sm font-medium text-[var(--foreground)]">
                            Auto-suggestions
                          </label>
                          <p className="text-xs text-[var(--muted-foreground)]">
                            Automatically show AI suggestions while editing
                          </p>
                        </div>
                        <button className="w-10 h-6 bg-[var(--primary)] rounded-full relative">
                          <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1" />
                        </button>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-[var(--foreground)]">
                          AI Model
                        </label>
                        <select className="w-full px-3 py-2 text-sm bg-[var(--input)] border border-[var(--border)] rounded-md">
                          <option>Audiomage Pro (Recommended)</option>
                          <option>Audiomage Fast</option>
                          <option>Audiomage Accurate</option>
                          <option>Custom Model</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-[var(--foreground)]">
                          Processing Priority
                        </label>
                        <select className="w-full px-3 py-2 text-sm bg-[var(--input)] border border-[var(--border)] rounded-md">
                          <option>Balanced</option>
                          <option>Speed</option>
                          <option>Quality</option>
                          <option>Low Latency</option>
                        </select>
                      </div>

                      <div className="border-t border-[var(--border)] pt-4">
                        <h4 className="text-sm font-medium text-[var(--foreground)] mb-3">
                          AI Features
                        </h4>
                        <div className="space-y-3">
                          {[
                            {
                              feature: 'Smart EQ',
                              description: 'Automatic frequency balancing',
                            },
                            {
                              feature: 'Noise Reduction',
                              description: 'Remove background noise',
                            },
                            {
                              feature: 'Voice Enhancement',
                              description: 'Improve vocal clarity',
                            },
                            {
                              feature: 'Auto-mastering',
                              description: 'Professional mastering chain',
                            },
                            {
                              feature: 'Stem Separation',
                              description: 'Isolate instruments and vocals',
                            },
                            {
                              feature: 'Tempo Detection',
                              description: 'Automatic BPM analysis',
                            },
                          ].map((item) => (
                            <div
                              key={item.feature}
                              className="flex items-center justify-between"
                            >
                              <div className="flex-1">
                                <label className="text-sm text-[var(--foreground)]">
                                  {item.feature}
                                </label>
                                <p className="text-xs text-[var(--muted-foreground)]">
                                  {item.description}
                                </p>
                              </div>
                              <button className="w-10 h-6 bg-[var(--primary)] rounded-full relative">
                                <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeSettingsCategory === 'network' && (
                  <div className="space-y-6">
                    <h3 className="text-base font-medium text-[var(--foreground)] mb-4">
                      Network Settings
                    </h3>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <label className="text-sm font-medium text-[var(--foreground)]">
                            Cloud Sync
                          </label>
                          <p className="text-xs text-[var(--muted-foreground)]">
                            Sync projects across devices
                          </p>
                        </div>
                        <button className="w-10 h-6 bg-[var(--primary)] rounded-full relative">
                          <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <label className="text-sm font-medium text-[var(--foreground)]">
                            Auto-backup to Cloud
                          </label>
                          <p className="text-xs text-[var(--muted-foreground)]">
                            Automatically backup projects online
                          </p>
                        </div>
                        <button className="w-10 h-6 bg-[var(--primary)] rounded-full relative">
                          <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1" />
                        </button>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-[var(--foreground)]">
                          Collaboration Port
                        </label>
                        <input
                          type="text"
                          value="8080"
                          className="w-full px-3 py-2 text-sm bg-[var(--input)] border border-[var(--border)] rounded-md"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-[var(--foreground)]">
                          Max Upload Bandwidth
                        </label>
                        <select className="w-full px-3 py-2 text-sm bg-[var(--input)] border border-[var(--border)] rounded-md">
                          <option>Unlimited</option>
                          <option>10 Mbps</option>
                          <option>5 Mbps</option>
                          <option>2 Mbps</option>
                          <option>1 Mbps</option>
                        </select>
                      </div>

                      <div className="border-t border-[var(--border)] pt-4">
                        <h4 className="text-sm font-medium text-[var(--foreground)] mb-3">
                          Connected Services
                        </h4>
                        <div className="space-y-2">
                          {[
                            {
                              service: 'SoundCloud',
                              status: 'Connected',
                              icon: '☁️',
                            },
                            {
                              service: 'Spotify for Artists',
                              status: 'Not Connected',
                              icon: '🎵',
                            },
                            {
                              service: 'YouTube',
                              status: 'Connected',
                              icon: '📺',
                            },
                            {
                              service: 'Dropbox',
                              status: 'Not Connected',
                              icon: '📦',
                            },
                          ].map((item) => (
                            <div
                              key={item.service}
                              className="flex items-center justify-between p-2 border border-[var(--border)] rounded"
                            >
                              <div className="flex items-center space-x-2">
                                <span>{item.icon}</span>
                                <span className="text-sm">{item.service}</span>
                              </div>
                              <Button
                                variant={
                                  item.status === 'Connected'
                                    ? 'outline'
                                    : 'default'
                                }
                                size="sm"
                                className="text-xs"
                              >
                                {item.status === 'Connected'
                                  ? 'Disconnect'
                                  : 'Connect'}
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeSettingsCategory === 'privacy' && (
                  <div className="space-y-6">
                    <h3 className="text-base font-medium text-[var(--foreground)] mb-4">
                      Privacy Settings
                    </h3>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <label className="text-sm font-medium text-[var(--foreground)]">
                            Analytics
                          </label>
                          <p className="text-xs text-[var(--muted-foreground)]">
                            Share usage data to improve the application
                          </p>
                        </div>
                        <button className="w-10 h-6 bg-[var(--muted)] rounded-full relative">
                          <div className="w-4 h-4 bg-white rounded-full absolute left-1 top-1" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <label className="text-sm font-medium text-[var(--foreground)]">
                            Crash Reports
                          </label>
                          <p className="text-xs text-[var(--muted-foreground)]">
                            Automatically send crash reports
                          </p>
                        </div>
                        <button className="w-10 h-6 bg-[var(--primary)] rounded-full relative">
                          <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <label className="text-sm font-medium text-[var(--foreground)]">
                            Public Profile
                          </label>
                          <p className="text-xs text-[var(--muted-foreground)]">
                            Allow others to see your profile
                          </p>
                        </div>
                        <button className="w-10 h-6 bg-[var(--muted)] rounded-full relative">
                          <div className="w-4 h-4 bg-white rounded-full absolute left-1 top-1" />
                        </button>
                      </div>

                      <div className="border-t border-[var(--border)] pt-4">
                        <h4 className="text-sm font-medium text-[var(--foreground)] mb-3">
                          Data Management
                        </h4>
                        <div className="space-y-3">
                          <Button
                            variant="outline"
                            className="w-full justify-start"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Export My Data
                          </Button>
                          <Button
                            variant="outline"
                            className="w-full justify-start"
                          >
                            <FileText className="w-4 h-4 mr-2" />
                            View Privacy Policy
                          </Button>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-[var(--destructive)]"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete All Data
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeSettingsCategory === 'storage' && (
                  <div className="space-y-6">
                    <h3 className="text-base font-medium text-[var(--foreground)] mb-4">
                      Storage Settings
                    </h3>

                    <div className="space-y-4">
                      <div className="p-4 bg-[var(--muted)] rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">
                            Storage Usage
                          </span>
                          <span className="text-sm text-[var(--muted-foreground)]">
                            68.4 GB / 100 GB
                          </span>
                        </div>
                        <div className="w-full h-2 bg-[var(--background)] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] rounded-full"
                            style={{ width: '68.4%' }}
                          ></div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-[var(--foreground)]">
                          Storage Breakdown
                        </h4>
                        <div className="space-y-2">
                          {[
                            {
                              type: 'Audio Files',
                              size: '42.1 GB',
                              color: 'bg-[var(--blue)]',
                            },
                            {
                              type: 'Projects',
                              size: '18.3 GB',
                              color: 'bg-[var(--green)]',
                            },
                            {
                              type: 'Plugins',
                              size: '4.2 GB',
                              color: 'bg-[var(--purple)]',
                            },
                            {
                              type: 'Samples',
                              size: '3.8 GB',
                              color: 'bg-[var(--yellow)]',
                            },
                          ].map((item) => (
                            <div
                              key={item.type}
                              className="flex items-center justify-between p-2 border border-[var(--border)] rounded"
                            >
                              <div className="flex items-center space-x-2">
                                <div
                                  className={`w-3 h-3 rounded ${item.color}`}
                                ></div>
                                <span className="text-sm">{item.type}</span>
                              </div>
                              <span className="text-sm text-[var(--muted-foreground)]">
                                {item.size}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-[var(--foreground)]">
                          Cache Size Limit
                        </label>
                        <select className="w-full px-3 py-2 text-sm bg-[var(--input)] border border-[var(--border)] rounded-md">
                          <option>1 GB</option>
                          <option>2 GB</option>
                          <option>5 GB</option>
                          <option>10 GB</option>
                          <option>Unlimited</option>
                        </select>
                      </div>

                      <div className="border-t border-[var(--border)] pt-4">
                        <h4 className="text-sm font-medium text-[var(--foreground)] mb-3">
                          Storage Actions
                        </h4>
                        <div className="space-y-2">
                          <Button
                            variant="outline"
                            className="w-full justify-start"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Clear Cache
                          </Button>
                          <Button
                            variant="outline"
                            className="w-full justify-start"
                          >
                            <Archive className="w-4 h-4 mr-2" />
                            Archive Old Projects
                          </Button>
                          <Button
                            variant="outline"
                            className="w-full justify-start"
                          >
                            <HardDrive className="w-4 h-4 mr-2" />
                            Manage External Storage
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-4 border-t border-[var(--border)] bg-[var(--muted)]/20">
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reset to Defaults
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export Settings
                </Button>
                <Button variant="outline" size="sm">
                  <Upload className="w-4 h-4 mr-2" />
                  Import Settings
                </Button>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsSettingsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button size="sm" onClick={() => setIsSettingsModalOpen(false)}>
                  <Check className="w-4 h-4 mr-2" />
                  Apply Changes
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
