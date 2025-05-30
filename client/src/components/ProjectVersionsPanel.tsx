import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  GitBranch, 
  GitCommit, 
  GitMerge, 
  Circle, 
  ArrowRight,
  Tag,
  User,
  Clock,
  CheckCircle,
  Archive
} from 'lucide-react';

interface ProjectVersion {
  id: string;
  hash: string;
  message: string;
  author: string;
  timestamp: Date;
  type: 'commit' | 'merge' | 'tag';
  branch: string;
  parents: string[];
  isCurrent: boolean;
  isHead: boolean;
  changes: {
    added: string[];
    modified: string[];
    deleted: string[];
  };
}

export function ProjectVersionsPanel() {
  const [versions] = useState<ProjectVersion[]>([
    {
      id: 'v1',
      hash: 'a1b2c3d',
      message: 'Initial project setup with vocal and drum tracks',
      author: 'Producer',
      timestamp: new Date(Date.now() - 7200000),
      type: 'commit',
      branch: 'main',
      parents: [],
      isCurrent: true,
      isHead: true,
      changes: {
        added: ['Lead_Vocal_take3.wav', 'Drums_Master.wav'],
        modified: [],
        deleted: []
      }
    },
    {
      id: 'v2',
      hash: 'e4f5g6h',
      message: 'Add bass and guitar tracks',
      author: 'Producer',
      timestamp: new Date(Date.now() - 5400000),
      type: 'commit',
      branch: 'main',
      parents: ['v1'],
      isCurrent: false,
      isHead: false,
      changes: {
        added: ['Bass_DI_compressed.wav', 'Guitar_Clean.wav'],
        modified: ['Project.amg'],
        deleted: []
      }
    },
    {
      id: 'v3',
      hash: 'i7j8k9l',
      message: 'Feature: Add MIDI piano arrangement',
      author: 'Composer',
      timestamp: new Date(Date.now() - 3600000),
      type: 'commit',
      branch: 'feature/piano',
      parents: ['v2'],
      isCurrent: false,
      isHead: false,
      changes: {
        added: ['Piano_Chords.mid'],
        modified: [],
        deleted: []
      }
    },
    {
      id: 'v4',
      hash: 'm1n2o3p',
      message: 'Merge piano arrangement into main',
      author: 'Producer',
      timestamp: new Date(Date.now() - 2700000),
      type: 'merge',
      branch: 'main',
      parents: ['v2', 'v3'],
      isCurrent: false,
      isHead: false,
      changes: {
        added: [],
        modified: ['Project.amg'],
        deleted: []
      }
    },
    {
      id: 'v5',
      hash: 'q4r5s6t',
      message: 'Add effects chain and mixing adjustments',
      author: 'Producer',
      timestamp: new Date(Date.now() - 1800000),
      type: 'commit',
      branch: 'main',
      parents: ['v4'],
      isCurrent: false,
      isHead: false,
      changes: {
        added: ['Reverb_Hall.fxp', 'Compressor_Vintage.fxp'],
        modified: ['Lead_Vocal_take3.wav', 'Drums_Master.wav'],
        deleted: []
      }
    },
    {
      id: 'v6',
      hash: 'u7v8w9x',
      message: 'Release: Demo Mix v1.0',
      author: 'Producer',
      timestamp: new Date(Date.now() - 900000),
      type: 'tag',
      branch: 'main',
      parents: ['v5'],
      isCurrent: false,
      isHead: false,
      changes: {
        added: ['Demo_Mix_v1.0.wav'],
        modified: [],
        deleted: []
      }
    }
  ]);

  const [selectedVersion, setSelectedVersion] = useState<string | null>(null);

  const getVersionIcon = (version: ProjectVersion) => {
    switch (version.type) {
      case 'merge':
        return <GitMerge className="w-4 h-4" />;
      case 'tag':
        return <Tag className="w-4 h-4" />;
      default:
        return <GitCommit className="w-4 h-4" />;
    }
  };

  const getBranchColor = (branch: string) => {
    switch (branch) {
      case 'main':
        return '#5E81AC';
      case 'feature/piano':
        return '#A3BE8C';
      case 'hotfix':
        return '#BF616A';
      default:
        return '#EBCB8B';
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - timestamp.getTime()) / 1000);
    
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const checkoutVersion = (versionId: string) => {
    console.log(`Checking out version: ${versionId}`);
    // Implementation would switch to this version
  };

  const createBranch = (fromVersionId: string) => {
    console.log(`Creating branch from version: ${fromVersionId}`);
    // Implementation would create a new branch
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-[var(--foreground)]">Project Versions</h3>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-[var(--green)] animate-pulse"></div>
          <span className="text-xs text-[var(--muted-foreground)]">Auto-save: ON</span>
        </div>
      </div>

      {/* Branch legend */}
      <div className="mb-4 p-2 bg-[var(--secondary)] rounded-md">
        <div className="text-xs font-medium text-[var(--foreground)] mb-2">Active Branches</div>
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getBranchColor('main') }}></div>
            <span className="text-xs text-[var(--foreground)]">main</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getBranchColor('feature/piano') }}></div>
            <span className="text-xs text-[var(--muted-foreground)]">feature/piano</span>
          </div>
        </div>
      </div>

      {/* Version tree */}
      <div className="space-y-1">
        {versions.reverse().map((version, index) => (
          <div key={version.id} className="relative">
            {/* Connection lines */}
            {index < versions.length - 1 && (
              <div 
                className="absolute left-3 top-8 w-px h-4 opacity-30"
                style={{ backgroundColor: getBranchColor(version.branch) }}
              ></div>
            )}
            
            {/* Merge lines for merge commits */}
            {version.type === 'merge' && version.parents.length > 1 && (
              <div className="absolute left-6 top-3">
                <div 
                  className="w-4 h-px opacity-30"
                  style={{ backgroundColor: getBranchColor('feature/piano') }}
                ></div>
              </div>
            )}

            <div 
              className={`flex items-start space-x-3 p-2 rounded-md hover:bg-[var(--accent)] cursor-pointer transition-colors ${
                selectedVersion === version.id ? 'bg-[var(--accent)] ring-1 ring-[var(--primary)]' : ''
              }`}
              onClick={() => setSelectedVersion(selectedVersion === version.id ? null : version.id)}
            >
              {/* Commit dot and icon */}
              <div className="relative flex-shrink-0">
                <div 
                  className="w-6 h-6 rounded-full border-2 flex items-center justify-center"
                  style={{ 
                    borderColor: getBranchColor(version.branch),
                    backgroundColor: version.isCurrent ? getBranchColor(version.branch) : 'var(--background)'
                  }}
                >
                  {getVersionIcon(version)}
                </div>
                {version.isHead && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-[var(--primary)] rounded-full flex items-center justify-center">
                    <CheckCircle className="w-2 h-2 text-white" />
                  </div>
                )}
              </div>

              {/* Commit info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-[var(--foreground)] truncate">
                      {version.message}
                    </span>
                    {version.type === 'tag' && (
                      <span className="px-1 py-0.5 bg-[var(--primary)] text-[var(--primary-foreground)] text-xs rounded">
                        TAG
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-[var(--muted-foreground)] font-mono">
                    {version.hash}
                  </span>
                </div>
                
                <div className="flex items-center space-x-3 text-xs text-[var(--muted-foreground)]">
                  <div className="flex items-center space-x-1">
                    <User className="w-3 h-3" />
                    <span>{version.author}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{formatTimestamp(version.timestamp)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <GitBranch className="w-3 h-3" />
                    <span style={{ color: getBranchColor(version.branch) }}>
                      {version.branch}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Expanded details */}
            {selectedVersion === version.id && (
              <div className="ml-9 mt-2 p-3 bg-[var(--muted)] rounded-md border-l-2" 
                   style={{ borderLeftColor: getBranchColor(version.branch) }}>
                {/* File changes */}
                <div className="mb-3">
                  <div className="text-xs font-medium text-[var(--foreground)] mb-2">Changes</div>
                  <div className="space-y-1">
                    {version.changes.added.map((file) => (
                      <div key={file} className="flex items-center space-x-2 text-xs">
                        <span className="text-[var(--green)]">+</span>
                        <span className="text-[var(--foreground)]">{file}</span>
                      </div>
                    ))}
                    {version.changes.modified.map((file) => (
                      <div key={file} className="flex items-center space-x-2 text-xs">
                        <span className="text-[var(--yellow)]">~</span>
                        <span className="text-[var(--foreground)]">{file}</span>
                      </div>
                    ))}
                    {version.changes.deleted.map((file) => (
                      <div key={file} className="flex items-center space-x-2 text-xs">
                        <span className="text-[var(--red)]">-</span>
                        <span className="text-[var(--foreground)]">{file}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="text-xs"
                    onClick={() => checkoutVersion(version.id)}
                    disabled={version.isCurrent}
                  >
                    {version.isCurrent ? 'Current' : 'Checkout'}
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="text-xs"
                    onClick={() => createBranch(version.id)}
                  >
                    New Branch
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="text-xs"
                  >
                    <Archive className="w-3 h-3 mr-1" />
                    Export
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="mt-4 pt-3 border-t border-[var(--border)] space-y-2">
        <Button size="sm" variant="outline" className="w-full text-xs">
          <GitCommit className="w-3 h-3 mr-2" />
          Create Snapshot
        </Button>
        <Button size="sm" variant="outline" className="w-full text-xs">
          <GitBranch className="w-3 h-3 mr-2" />
          New Branch from Current
        </Button>
      </div>
    </div>
  );
}