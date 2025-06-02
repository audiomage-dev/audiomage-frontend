import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Folder, 
  FolderOpen, 
  Volume2, 
  Music, 
  Piano, 
  Sliders, 
  FileText, 
  Code, 
  Image, 
  File,
  Drum,
  Bot,
  Copy,
  Trash2,
  Edit3,
  FolderPlus,
  Download,
  Upload,
  Eye,
  Play,
  Share2,
  RefreshCw,
  Move,
  Scissors,
  Info
} from 'lucide-react';

interface ProjectItem {
  id: string;
  name: string;
  type: 'audio' | 'midi' | 'folder' | 'project' | 'fx' | 'samples' | 'file' | 'video' | 'image';
  children?: ProjectItem[];
  level: number;
  url?: string;
  size?: number;
  duration?: number;
}

interface ProjectBrowserProps {
  onFileSelect?: (file: {
    id: string;
    name: string;
    type: 'audio' | 'video' | 'image';
    url: string;
    duration?: number;
    size?: number;
  }) => void;
}

export function ProjectBrowser({ onFileSelect }: ProjectBrowserProps = {}) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['1', '5', '8', '21']));
  const [searchTerm, setSearchTerm] = useState('');
  const [contextMenu, setContextMenu] = useState<{ 
    x: number; 
    y: number; 
    item: ProjectItem;
  } | null>(null);

  const projectItems: ProjectItem[] = [
    {
      id: '1',
      name: 'Audio',
      type: 'folder',
      level: 0,
      children: [
        { id: '2', name: 'Lead_Vocal_take3.wav', type: 'audio', level: 1 },
        { id: '3', name: 'Drums_Master.wav', type: 'audio', level: 1 },
        { id: '4', name: 'Bass_DI_compressed.wav', type: 'audio', level: 1 },
        { id: '11', name: 'Guitar_Clean.wav', type: 'audio', level: 1 },
        { id: '12', name: 'Synth_Pad.wav', type: 'audio', level: 1 },
        { id: '17', name: 'Vocal_Harmony.mp3', type: 'audio', level: 1 },
        { id: '18', name: 'Background_Music.flac', type: 'audio', level: 1 },
      ]
    },
    {
      id: '5',
      name: 'MIDI',
      type: 'folder',
      level: 0,
      children: [
        { id: '6', name: 'Piano_Chords.mid', type: 'midi', level: 1 },
        { id: '7', name: 'Synth_Lead.mid', type: 'midi', level: 1 },
        { id: '13', name: 'Drum_Pattern.mid', type: 'midi', level: 1 },
        { id: '19', name: 'Bass_Line.midi', type: 'midi', level: 1 },
      ]
    },
    {
      id: '8',
      name: 'Effects',
      type: 'folder',
      level: 0,
      children: [
        { id: '9', name: 'Reverb_Hall.fxp', type: 'fx', level: 1 },
        { id: '10', name: 'Compressor_Vintage.fxp', type: 'fx', level: 1 },
        { id: '14', name: 'EQ_Master.fxp', type: 'fx', level: 1 },
        { id: '20', name: 'Delay_Stereo.vstpreset', type: 'fx', level: 1 },
      ]
    },
    {
      id: '21',
      name: 'Resources',
      type: 'folder',
      level: 0,
      children: [
        { id: '22', name: 'project_notes.txt', type: 'file', level: 1 },
        { id: '23', name: 'session_info.json', type: 'file', level: 1 },
        { id: '24', name: 'album_cover.png', type: 'file', level: 1 },
        { id: '25', name: 'README.md', type: 'file', level: 1 },
      ]
    },
    { id: '15', name: 'Samples', type: 'folder', level: 0, children: [] },
    { id: '16', name: 'Project.amg', type: 'project', level: 0 },
  ];

  const getFileIcon = (type: string, name: string = '') => {
    const fileName = name.toLowerCase();
    
    // Check file extensions for more specific icons
    if (fileName.endsWith('.wav') || fileName.endsWith('.aiff') || fileName.endsWith('.flac')) {
      return <Volume2 className="w-3 h-3" />;
    }
    if (fileName.endsWith('.mp3') || fileName.endsWith('.m4a') || fileName.endsWith('.ogg')) {
      return <Music className="w-3 h-3" />;
    }
    if (fileName.endsWith('.mid') || fileName.endsWith('.midi')) {
      return <Piano className="w-3 h-3" />;
    }
    if (fileName.endsWith('.fxp') || fileName.endsWith('.vstpreset')) {
      return <Sliders className="w-3 h-3" />;
    }
    if (fileName.endsWith('.json') || fileName.endsWith('.xml')) {
      return <Code className="w-3 h-3" />;
    }
    if (fileName.endsWith('.txt') || fileName.endsWith('.md')) {
      return <FileText className="w-3 h-3" />;
    }
    if (fileName.endsWith('.png') || fileName.endsWith('.jpg') || fileName.endsWith('.jpeg')) {
      return <Image className="w-3 h-3" />;
    }
    
    // Check by type
    switch (type) {
      case 'folder': return <Folder className="w-3 h-3" />;
      case 'audio': return <Volume2 className="w-3 h-3" />;
      case 'midi': return <Piano className="w-3 h-3" />;
      case 'fx': return <Sliders className="w-3 h-3" />;
      case 'project': return <FolderOpen className="w-3 h-3" />;
      case 'samples': return <Drum className="w-3 h-3" />;
      case 'ai-generated': return <Bot className="w-3 h-3" />;
      default: return <File className="w-3 h-3" />;
    }
  };

  const getFileColor = (type: string, name: string = '') => {
    const fileName = name.toLowerCase();
    
    // Color by file extension with Nord theme colors
    if (fileName.endsWith('.wav') || fileName.endsWith('.aiff') || fileName.endsWith('.flac')) {
      return '#5E81AC'; // Nord blue
    }
    if (fileName.endsWith('.mp3') || fileName.endsWith('.m4a') || fileName.endsWith('.ogg')) {
      return '#A3BE8C'; // Nord green
    }
    if (fileName.endsWith('.mid') || fileName.endsWith('.midi')) {
      return '#EBCB8B'; // Nord yellow
    }
    if (fileName.endsWith('.fxp') || fileName.endsWith('.vstpreset')) {
      return '#B48EAD'; // Nord purple
    }
    if (fileName.endsWith('.json') || fileName.endsWith('.xml')) {
      return '#D08770'; // Nord orange
    }
    if (fileName.endsWith('.txt') || fileName.endsWith('.md')) {
      return '#4C566A'; // Nord gray
    }
    if (fileName.endsWith('.png') || fileName.endsWith('.jpg') || fileName.endsWith('.jpeg')) {
      return '#88C0D0'; // Nord frost
    }
    
    // Color by type
    switch (type) {
      case 'folder': return '#81A1C1';
      case 'audio': return '#5E81AC';
      case 'midi': return '#EBCB8B';
      case 'fx': return '#B48EAD';
      case 'project': return '#8FBCBB';
      case 'samples': return '#D08770';
      case 'ai-generated': return '#BF616A';
      default: return '#4C566A';
    }
  };

  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const handleContextMenuAction = (action: string, item: ProjectItem) => {
    switch (action) {
      case 'open':
        console.log('Opening:', item.name);
        break;
      case 'preview':
        console.log('Previewing:', item.name);
        break;
      case 'play':
        console.log('Playing:', item.name);
        break;
      case 'rename':
        console.log('Renaming:', item.name);
        break;
      case 'duplicate':
        console.log('Duplicating:', item.name);
        break;
      case 'delete':
        console.log('Deleting:', item.name);
        break;
      case 'export':
        console.log('Exporting:', item.name);
        break;
      case 'import':
        console.log('Importing to:', item.name);
        break;
      case 'addToTimeline':
        console.log('Adding to timeline:', item.name);
        break;
      case 'copyPath':
        navigator.clipboard.writeText(`/project/${item.name}`);
        break;
      case 'properties':
        console.log('Showing properties for:', item.name);
        break;
      case 'newFolder':
        console.log('Creating new folder in:', item.name);
        break;
      case 'move':
        console.log('Moving:', item.name);
        break;
      case 'convertFormat':
        console.log('Converting format for:', item.name);
        break;
    }
    setContextMenu(null);
  };

  const getContextMenuItems = (item: ProjectItem) => {
    const baseItems = [
      { id: 'open', label: 'Open', icon: Eye, shortcut: 'Enter' },
      { id: 'rename', label: 'Rename', icon: Edit3, shortcut: 'F2' },
      { id: 'duplicate', label: 'Duplicate', icon: Copy, shortcut: 'Ctrl+D' },
      { id: 'delete', label: 'Delete', icon: Trash2, shortcut: 'Del', dangerous: true },
      { id: 'separator1', label: '', icon: null },
      { id: 'copyPath', label: 'Copy Path', icon: Copy, shortcut: 'Ctrl+Shift+C' },
      { id: 'properties', label: 'Properties', icon: Info, shortcut: 'Alt+Enter' },
    ];

    if (item.type === 'folder') {
      return [
        { id: 'open', label: 'Expand', icon: FolderOpen, shortcut: 'Enter' },
        { id: 'newFolder', label: 'New Folder', icon: FolderPlus, shortcut: 'Ctrl+Shift+N' },
        { id: 'import', label: 'Import Files', icon: Upload, shortcut: 'Ctrl+I' },
        { id: 'separator1', label: '', icon: null },
        ...baseItems.slice(1)
      ];
    }

    if (item.type === 'audio') {
      return [
        { id: 'preview', label: 'Preview', icon: Eye, shortcut: 'Space' },
        { id: 'play', label: 'Play', icon: Play, shortcut: 'Enter' },
        { id: 'addToTimeline', label: 'Add to Timeline', icon: Move, shortcut: 'Ctrl+T' },
        { id: 'separator1', label: '', icon: null },
        { id: 'export', label: 'Export', icon: Download, shortcut: 'Ctrl+E' },
        { id: 'convertFormat', label: 'Convert Format', icon: RefreshCw, shortcut: 'Ctrl+Shift+C' },
        { id: 'separator2', label: '', icon: null },
        ...baseItems.slice(1)
      ];
    }

    if (item.type === 'midi') {
      return [
        { id: 'open', label: 'Open in Piano Roll', icon: Piano, shortcut: 'Enter' },
        { id: 'preview', label: 'Preview', icon: Eye, shortcut: 'Space' },
        { id: 'addToTimeline', label: 'Add to Timeline', icon: Move, shortcut: 'Ctrl+T' },
        { id: 'separator1', label: '', icon: null },
        { id: 'export', label: 'Export', icon: Download, shortcut: 'Ctrl+E' },
        { id: 'separator2', label: '', icon: null },
        ...baseItems.slice(1)
      ];
    }

    if (item.type === 'fx') {
      return [
        { id: 'open', label: 'Load Effect', icon: Sliders, shortcut: 'Enter' },
        { id: 'preview', label: 'Preview', icon: Eye, shortcut: 'Space' },
        { id: 'separator1', label: '', icon: null },
        { id: 'export', label: 'Export Preset', icon: Download, shortcut: 'Ctrl+E' },
        { id: 'separator2', label: '', icon: null },
        ...baseItems.slice(1)
      ];
    }

    return baseItems;
  };

  const highlightSearchTerm = (text: string, searchTerm: string) => {
    if (!searchTerm) return text;
    
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => {
      if (part.toLowerCase() === searchTerm.toLowerCase()) {
        return `<mark class="bg-[var(--yellow)] text-[var(--background)] px-1 rounded">${part}</mark>`;
      }
      return part;
    }).join('');
  };

  const renderItem = (item: ProjectItem) => {
    const isExpanded = expandedFolders.has(item.id);
    const hasChildren = item.children && item.children.length > 0;
    const paddingLeft = item.level * 16 + 8;
    const matchesSearch = searchTerm && item.name.toLowerCase().includes(searchTerm.toLowerCase());

    return (
      <div key={item.id}>
        <div
          className={`flex items-center h-6 px-1 hover:bg-[var(--accent)] cursor-pointer transition-colors group text-sm select-none ${
            matchesSearch ? 'bg-[var(--accent)]/50' : ''
          }`}
          style={{ paddingLeft: `${paddingLeft}px` }}
          onClick={() => hasChildren && toggleFolder(item.id)}
          onContextMenu={(e) => {
            e.preventDefault();
            setContextMenu({
              x: e.clientX,
              y: e.clientY,
              item
            });
          }}
        >
          {hasChildren && (
            <i 
              className={`fas fa-chevron-${isExpanded ? 'down' : 'right'} text-xs text-[var(--muted-foreground)] mr-1 w-2`}
            />
          )}
          {!hasChildren && <div className="w-3 mr-1" />}
          
          <div 
            className="mr-2 flex items-center" 
            style={{ color: getFileColor(item.type, item.name) }}
          >
            {getFileIcon(item.type, item.name)}
          </div>
          
          <span 
            className="text-[var(--foreground)] flex-1 truncate leading-none"
            dangerouslySetInnerHTML={{ 
              __html: highlightSearchTerm(item.name, searchTerm) 
            }}
          />
          
          {item.type === 'audio' && (
            <span className="text-xs text-[var(--muted-foreground)] ml-2 opacity-60">WAV</span>
          )}
          {item.type === 'midi' && (
            <span className="text-xs text-[var(--muted-foreground)] ml-2 opacity-60">MIDI</span>
          )}
          {item.type === 'fx' && (
            <span className="text-xs text-[var(--muted-foreground)] ml-2 opacity-60">FX</span>
          )}
        </div>
        
        {hasChildren && isExpanded && item.children?.map(child => renderItem(child))}
      </div>
    );
  };

  const filterItems = (items: ProjectItem[], term: string): ProjectItem[] => {
    if (!term) return items;
    
    return items.reduce((filtered: ProjectItem[], item) => {
      const searchTerm = term.toLowerCase();
      const itemName = item.name.toLowerCase();
      const itemType = item.type.toLowerCase();
      
      // Search in name, type, and file extensions
      const matchesName = itemName.includes(searchTerm);
      const matchesType = itemType.includes(searchTerm);
      const matchesExtension = itemName.endsWith('.wav') && searchTerm.includes('wav') ||
                              itemName.endsWith('.mid') && searchTerm.includes('mid') ||
                              itemName.endsWith('.fxp') && searchTerm.includes('fx');
      
      const filteredChildren = item.children ? filterItems(item.children, term) : [];
      
      if (matchesName || matchesType || matchesExtension || filteredChildren.length > 0) {
        filtered.push({
          ...item,
          children: filteredChildren.length > 0 ? filteredChildren : item.children
        });
      }
      
      return filtered;
    }, []);
  };

  const filteredItems = filterItems(projectItems, searchTerm);
  
  // Count total items and search results
  const countItems = (items: ProjectItem[]): number => {
    return items.reduce((count, item) => {
      return count + 1 + (item.children ? countItems(item.children) : 0);
    }, 0);
  };
  
  const totalItems = countItems(projectItems);
  const searchResults = searchTerm ? countItems(filteredItems) : totalItems;

  return (
    <div className="h-full flex flex-col bg-[var(--background)]">
      {/* Header */}
      <div className="flex-none p-3 border-b border-[var(--border)] bg-gradient-to-r from-[var(--muted)] to-[var(--secondary)]">
        {/* Search */}
        <div className="relative">
          <i className="fas fa-search absolute left-2 top-2 text-xs text-[var(--muted-foreground)]"></i>
          <input
            type="text"
            placeholder="Search files, types, extensions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setSearchTerm('');
              }
            }}
            className="w-full pl-7 pr-8 py-1 text-xs bg-[var(--input)] border border-[var(--border)] rounded-md text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2 top-2 text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
            >
              <i className="fas fa-times"></i>
            </button>
          )}
        </div>
      </div>
      
      {/* File Tree */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="py-1">
          {filteredItems.map(item => renderItem(item))}
        </div>
      </div>
      
      {/* Footer Info */}
      <div className="flex-none p-2 border-t border-[var(--border)] bg-[var(--muted)]">
        <div className="text-xs text-[var(--muted-foreground)] flex items-center justify-between">
          <span>
            {searchTerm ? (
              <>
                <i className="fas fa-search mr-1"></i>
                {searchResults} of {totalItems} files
              </>
            ) : (
              `${totalItems} files`
            )}
          </span>
          <span>2.4 GB</span>
        </div>
        {searchTerm && (
          <div className="text-xs text-[var(--muted-foreground)] mt-1">
            <kbd className="px-1 py-0.5 bg-[var(--secondary)] border border-[var(--border)] rounded text-xs">Esc</kbd>
            <span className="ml-1">to clear search</span>
          </div>
        )}
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setContextMenu(null)}
          />
          <div
            className="fixed z-50 bg-[var(--background)] border border-[var(--border)] rounded-md shadow-2xl py-1 min-w-48 backdrop-blur-sm"
            style={{
              left: contextMenu.x,
              top: contextMenu.y,
              backgroundColor: 'var(--background)',
              borderColor: 'var(--border)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)'
            }}
          >
            {getContextMenuItems(contextMenu.item).map((item, index) => {
              if (item.id.startsWith('separator')) {
                return (
                  <div key={index} className="h-px bg-[var(--border)] my-1 mx-2" />
                );
              }

              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleContextMenuAction(item.id, contextMenu.item)}
                  className={`w-full px-3 py-1.5 text-left text-sm flex items-center justify-between hover:bg-[var(--accent)] transition-colors ${
                    item.dangerous ? 'text-[var(--destructive)] hover:bg-[var(--destructive)]/10' : 'text-[var(--foreground)]'
                  }`}
                >
                  <div className="flex items-center">
                    {Icon && <Icon className="w-4 h-4 mr-2" />}
                    <span>{item.label}</span>
                  </div>
                  {item.shortcut && (
                    <kbd className="text-xs text-[var(--muted-foreground)] bg-[var(--muted)] px-1 py-0.5 rounded">
                      {item.shortcut}
                    </kbd>
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
