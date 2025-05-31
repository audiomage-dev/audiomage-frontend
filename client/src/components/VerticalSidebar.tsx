import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ProjectBrowser } from './ProjectBrowser';
import { AISuggestionsPanel } from './AISuggestionsPanel';
import { AudioChangemapsPanel } from './AudioChangemapsPanel';
import { ProjectVersionsPanel } from './ProjectVersionsPanel';
import { QuickActionsPanel } from './QuickActionsPanel';
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
  Download,
  Heart,
  Filter,
  Tag,
  Clock,
  Star,
  Wand2,
  Sparkles,
  Mic,
  Headphones,

  Radio,
  TrendingUp,
  Scissors,
  Copy,
  RotateCcw,
  Volume,
  VolumeX
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
      id: 'quick-actions',
      icon: <Wand2 className="w-5 h-5" />,
      label: 'Quick Actions',
      component: <QuickActionsPanel />
    },
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
      component: <ProjectVersionsPanel />
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
        <div className="p-4 space-y-4">
          {/* Master Section */}
          <div>
            <h3 className="text-sm font-medium text-[var(--foreground)] mb-3">Master Controls</h3>
            
            {/* Master Volume */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--muted-foreground)]">Master Volume</span>
                <span className="text-xs font-mono text-[var(--foreground)]">-6.2dB</span>
              </div>
              <div className="relative">
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  defaultValue="75"
                  className="w-full h-2 bg-[var(--muted)] rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-[var(--muted-foreground)] mt-1">
                  <span>-∞</span>
                  <span>0dB</span>
                  <span>+6</span>
                </div>
              </div>
            </div>

            {/* Level Meters */}
            <div className="space-y-2 mb-4">
              <div className="text-xs text-[var(--muted-foreground)]">Output Levels</div>
              <div className="flex space-x-1">
                {/* Left Channel */}
                <div className="flex-1">
                  <div className="text-xs text-center mb-1">L</div>
                  <div className="h-20 w-4 bg-[var(--muted)] rounded-sm relative overflow-hidden">
                    <div className="absolute bottom-0 w-full bg-gradient-to-t from-[var(--green)] via-[var(--yellow)] to-[var(--red)] h-3/4 rounded-sm"></div>
                    <div className="absolute top-1/4 left-0 right-0 h-px bg-[var(--red)] opacity-50"></div>
                  </div>
                  <div className="text-xs text-center mt-1 font-mono">-3.2</div>
                </div>
                {/* Right Channel */}
                <div className="flex-1">
                  <div className="text-xs text-center mb-1">R</div>
                  <div className="h-20 w-4 bg-[var(--muted)] rounded-sm relative overflow-hidden">
                    <div className="absolute bottom-0 w-full bg-gradient-to-t from-[var(--green)] via-[var(--yellow)] to-[var(--red)] h-2/3 rounded-sm"></div>
                    <div className="absolute top-1/4 left-0 right-0 h-px bg-[var(--red)] opacity-50"></div>
                  </div>
                  <div className="text-xs text-center mt-1 font-mono">-4.1</div>
                </div>
              </div>
            </div>

            {/* Quick EQ */}
            <div className="space-y-2 mb-4">
              <div className="text-xs text-[var(--muted-foreground)]">Master EQ</div>
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center">
                  <div className="text-xs mb-1">High</div>
                  <input type="range" min="0" max="100" defaultValue="50" className="w-full h-1 bg-[var(--muted)] rounded-lg appearance-none cursor-pointer" orient="vertical" />
                  <div className="text-xs font-mono mt-1">+0.0</div>
                </div>
                <div className="text-center">
                  <div className="text-xs mb-1">Mid</div>
                  <input type="range" min="0" max="100" defaultValue="45" className="w-full h-1 bg-[var(--muted)] rounded-lg appearance-none cursor-pointer" />
                  <div className="text-xs font-mono mt-1">-1.2</div>
                </div>
                <div className="text-center">
                  <div className="text-xs mb-1">Low</div>
                  <input type="range" min="0" max="100" defaultValue="55" className="w-full h-1 bg-[var(--muted)] rounded-lg appearance-none cursor-pointer" />
                  <div className="text-xs font-mono mt-1">+2.1</div>
                </div>
              </div>
            </div>

            {/* Master Effects */}
            <div className="space-y-2 mb-4">
              <div className="text-xs text-[var(--muted-foreground)]">Master Chain</div>
              <div className="space-y-1">
                <div className="flex items-center justify-between p-2 bg-[var(--muted)] rounded text-xs">
                  <span>Compressor</span>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-[var(--green)] rounded-full"></div>
                    <span className="font-mono">3:1</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-2 bg-[var(--muted)] rounded text-xs">
                  <span>Limiter</span>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-[var(--blue)] rounded-full"></div>
                    <span className="font-mono">-0.1dB</span>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Analysis */}
            <div className="p-3 bg-[var(--secondary)] rounded-md">
              <div className="text-xs text-[var(--muted-foreground)] mb-2">AI Analysis</div>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span>LUFS</span>
                  <span className="font-mono text-[var(--green)]">-14.2</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span>Dynamic Range</span>
                  <span className="font-mono text-[var(--blue)]">8.3 LU</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span>Peak</span>
                  <span className="font-mono text-[var(--yellow)]">-1.2dBFS</span>
                </div>
                <div className="text-xs text-[var(--green)] mt-2">✓ Broadcast ready</div>
              </div>
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
      component: <AISuggestionsPanel />
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
                {['SFX', 'Ambiance', 'Foley', 'Music', 'Voice'].map((filter) => (
                  <Button
                    key={filter}
                    variant="outline"
                    size="sm"
                    className="h-6 px-2 text-xs"
                  >
                    {filter}
                  </Button>
                ))}
              </div>

              {/* Advanced Filters Toggle */}
              <div className="flex items-center justify-between">
                <Button variant="ghost" size="sm" className="text-xs">
                  <Filter className="w-3 h-3 mr-1" />
                  Advanced Filters
                </Button>
                <span className="text-xs text-[var(--muted-foreground)]">12,847 sounds</span>
              </div>
            </div>
          </div>

          {/* Category Navigation */}
          <div className="p-4 border-b border-[var(--border)]">
            <h4 className="text-xs font-medium text-[var(--muted-foreground)] mb-2">Categories</h4>
            <div className="space-y-1">
              {[
                { name: 'Nature & Weather', count: 2156, icon: '🌿' },
                { name: 'Urban & City', count: 1843, icon: '🏙️' },
                { name: 'Mechanical & Tech', count: 2934, icon: '⚙️' },
                { name: 'Human Activities', count: 1567, icon: '👥' },
                { name: 'Musical Elements', count: 987, icon: '🎵' },
                { name: 'Abstract & Designed', count: 756, icon: '✨' },
                { name: 'Animals & Creatures', count: 634, icon: '🦅' },
                { name: 'Vehicles & Transport', count: 1245, icon: '🚗' }
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
                    popular: true
                  },
                  {
                    name: 'City Traffic Morning.wav',
                    category: 'Urban',
                    duration: '1:47',
                    tags: ['traffic', 'urban', 'morning'],
                    popular: false
                  },
                  {
                    name: 'Footsteps Gravel Slow.wav',
                    category: 'Foley',
                    duration: '0:15',
                    tags: ['footsteps', 'gravel', 'walking'],
                    popular: true
                  },
                  {
                    name: 'Mechanical Hum Industrial.wav',
                    category: 'Tech',
                    duration: '4:12',
                    tags: ['mechanical', 'industrial', 'loop'],
                    popular: false
                  },
                  {
                    name: 'Ocean Waves Gentle.wav',
                    category: 'Nature',
                    duration: '3:56',
                    tags: ['ocean', 'waves', 'peaceful'],
                    popular: true
                  }
                ].map((sound, index) => (
                  <div
                    key={sound.name}
                    className="p-3 border border-[var(--border)] rounded-md hover:bg-[var(--accent)] group cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2 min-w-0">
                        {sound.popular && <Star className="w-3 h-3 text-[var(--yellow)] flex-shrink-0" />}
                        <span className="text-sm font-medium truncate">{sound.name}</span>
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
                <div className="text-xs font-medium truncate">Rain on Leaves Heavy.wav</div>
                <div className="text-xs text-[var(--muted-foreground)]">0:45 / 2:34</div>
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