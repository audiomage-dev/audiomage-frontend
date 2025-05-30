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
    <div className="p-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-[var(--foreground)]">Project Versions</h3>
        <div className="flex items-center space-x-1">
          <div className="w-1.5 h-1.5 rounded-full bg-[var(--green)] animate-pulse"></div>
          <span className="text-xs text-[var(--muted-foreground)]">Auto-save</span>
        </div>
      </div>

      {/* Branch legend */}
      <div className="mb-2 p-1.5 bg-[var(--secondary)] rounded text-xs">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1">
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: getBranchColor('main') }}></div>
            <span className="text-[var(--foreground)]">main</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: getBranchColor('feature/piano') }}></div>
            <span className="text-[var(--muted-foreground)]">feature/piano</span>
          </div>
        </div>
      </div>

      {/* Version tree */}
      <div className="space-y-0.5">
        {versions.reverse().map((version, index) => (
          <div key={version.id} className="relative">
            {/* Connection lines */}
            {index < versions.length - 1 && (
              <div 
                className="absolute left-2 top-5 w-px h-3 opacity-30"
                style={{ backgroundColor: getBranchColor(version.branch) }}
              ></div>
            )}
            
            {/* Merge lines for merge commits */}
            {version.type === 'merge' && version.parents.length > 1 && (
              <div className="absolute left-4 top-2">
                <div 
                  className="w-3 h-px opacity-30"
                  style={{ backgroundColor: getBranchColor('feature/piano') }}
                ></div>
              </div>
            )}

            <div 
              className={`flex items-start space-x-2 p-1.5 rounded hover:bg-[var(--accent)] cursor-pointer transition-colors ${
                selectedVersion === version.id ? 'bg-[var(--accent)] ring-1 ring-[var(--primary)]' : ''
              }`}
              onClick={() => setSelectedVersion(selectedVersion === version.id ? null : version.id)}
            >
              {/* Commit dot and icon */}
              <div className="relative flex-shrink-0">
                <div 
                  className="w-4 h-4 rounded-full border flex items-center justify-center"
                  style={{ 
                    borderColor: getBranchColor(version.branch),
                    backgroundColor: version.isCurrent ? getBranchColor(version.branch) : 'var(--background)'
                  }}
                >
                  {version.type === 'merge' ? (
                    <GitMerge className="w-2 h-2" />
                  ) : version.type === 'tag' ? (
                    <Tag className="w-2 h-2" />
                  ) : (
                    <div className="w-1 h-1 rounded-full bg-current" />
                  )}
                </div>
                {version.isHead && (
                  <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[var(--primary)] rounded-full"></div>
                )}
              </div>

              {/* Commit info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[var(--foreground)] truncate pr-2">
                    {version.message}
                  </span>
                  <span className="text-xs text-[var(--muted-foreground)] font-mono">
                    {version.hash}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2 text-xs text-[var(--muted-foreground)] mt-0.5">
                  <span>{version.author}</span>
                  <span>•</span>
                  <span>{formatTimestamp(version.timestamp)}</span>
                  <span>•</span>
                  <span style={{ color: getBranchColor(version.branch) }}>
                    {version.branch}
                  </span>
                  {version.type === 'tag' && (
                    <>
                      <span>•</span>
                      <span className="px-1 bg-[var(--primary)] text-[var(--primary-foreground)] rounded">
                        TAG
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Expanded details */}
            {selectedVersion === version.id && (
              <div className="ml-6 mt-1 p-2 bg-[var(--muted)] rounded border-l-2" 
                   style={{ borderLeftColor: getBranchColor(version.branch) }}>
                {/* File changes */}
                <div className="mb-2">
                  <div className="text-xs font-medium text-[var(--foreground)] mb-1">Changes</div>
                  <div className="space-y-0.5">
                    {version.changes.added.map((file) => (
                      <div key={file} className="flex items-center space-x-1 text-xs">
                        <span className="text-[var(--green)] w-2">+</span>
                        <span className="text-[var(--foreground)] truncate">{file}</span>
                      </div>
                    ))}
                    {version.changes.modified.map((file) => (
                      <div key={file} className="flex items-center space-x-1 text-xs">
                        <span className="text-[var(--yellow)] w-2">~</span>
                        <span className="text-[var(--foreground)] truncate">{file}</span>
                      </div>
                    ))}
                    {version.changes.deleted.map((file) => (
                      <div key={file} className="flex items-center space-x-1 text-xs">
                        <span className="text-[var(--red)] w-2">-</span>
                        <span className="text-[var(--foreground)] truncate">{file}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-1">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="text-xs h-6 px-2"
                    onClick={() => checkoutVersion(version.id)}
                    disabled={version.isCurrent}
                  >
                    {version.isCurrent ? 'Current' : 'Checkout'}
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="text-xs h-6 px-2"
                    onClick={() => createBranch(version.id)}
                  >
                    Branch
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="text-xs h-6 px-2"
                  >
                    <Archive className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="mt-2 pt-2 border-t border-[var(--border)] flex space-x-1">
        <Button size="sm" variant="outline" className="flex-1 text-xs h-6">
          <GitCommit className="w-3 h-3 mr-1" />
          Snapshot
        </Button>
        <Button size="sm" variant="outline" className="flex-1 text-xs h-6">
          <GitBranch className="w-3 h-3 mr-1" />
          Branch
        </Button>
      </div>
    </div>
  );
}