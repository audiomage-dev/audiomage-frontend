import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Camera, 
  Play, 
  Pause, 
  RotateCcw, 
  Save, 
  Trash2, 
  Copy, 
  Edit3,
  Shuffle,
  Timer,
  Layers,
  Volume2,
  Settings
} from 'lucide-react';
import { MixSnapshot, MixSceneManager, AudioTrack } from '../types/audio';

interface MixSceneSnapshotsProps {
  tracks: AudioTrack[];
  masterVolume: number;
  sceneManager: MixSceneManager;
  onSnapshotCreate: (name: string, description?: string) => void;
  onSnapshotLoad: (snapshotId: string) => void;
  onSnapshotDelete: (snapshotId: string) => void;
  onSnapshotUpdate: (snapshotId: string, data: Partial<MixSnapshot>) => void;
  onCrossfadeStart: (targetSnapshotId: string, duration: number) => void;
  onCrossfadeStop: () => void;
  onCrossfadePositionChange: (position: number) => void;
}

export function MixSceneSnapshots({
  tracks,
  masterVolume,
  sceneManager,
  onSnapshotCreate,
  onSnapshotLoad,
  onSnapshotDelete,
  onSnapshotUpdate,
  onCrossfadeStart,
  onCrossfadeStop,
  onCrossfadePositionChange
}: MixSceneSnapshotsProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newSnapshotName, setNewSnapshotName] = useState('');
  const [newSnapshotDescription, setNewSnapshotDescription] = useState('');
  const [selectedSnapshot, setSelectedSnapshot] = useState<string | null>(null);
  const [crossfadeDuration, setCrossfadeDuration] = useState(3);
  const [isExpanded, setIsExpanded] = useState(false);

  // Auto-close create dialog on successful creation
  useEffect(() => {
    if (sceneManager.snapshots.length > 0 && isCreateDialogOpen) {
      const latestSnapshot = sceneManager.snapshots[sceneManager.snapshots.length - 1];
      if (latestSnapshot.name === newSnapshotName) {
        setIsCreateDialogOpen(false);
        setNewSnapshotName('');
        setNewSnapshotDescription('');
      }
    }
  }, [sceneManager.snapshots, isCreateDialogOpen, newSnapshotName]);

  const handleCreateSnapshot = useCallback(() => {
    if (newSnapshotName.trim()) {
      onSnapshotCreate(newSnapshotName.trim(), newSnapshotDescription.trim() || undefined);
    }
  }, [newSnapshotName, newSnapshotDescription, onSnapshotCreate]);

  const handleLoadSnapshot = useCallback((snapshotId: string) => {
    if (sceneManager.isBlending) {
      onCrossfadeStop();
    }
    onSnapshotLoad(snapshotId);
    setSelectedSnapshot(snapshotId);
  }, [sceneManager.isBlending, onSnapshotLoad, onCrossfadeStop]);

  const handleStartCrossfade = useCallback((targetId: string) => {
    if (sceneManager.currentSnapshot && targetId !== sceneManager.currentSnapshot) {
      onCrossfadeStart(targetId, crossfadeDuration);
      setSelectedSnapshot(targetId);
    }
  }, [sceneManager.currentSnapshot, crossfadeDuration, onCrossfadeStart]);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getSnapshotChannelCount = (snapshot: MixSnapshot) => {
    return Object.keys(snapshot.channels).length;
  };

  if (!isExpanded) {
    return (
      <div className="bg-zinc-900 border-t border-zinc-700 p-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(true)}
              className="text-zinc-400 hover:text-white"
            >
              <Layers className="w-4 h-4 mr-1" />
              Mix Scenes ({sceneManager.snapshots.length})
            </Button>
            {sceneManager.currentSnapshot && (
              <Badge variant="secondary" className="text-xs">
                {sceneManager.snapshots.find(s => s.id === sceneManager.currentSnapshot)?.name}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-1">
            {sceneManager.isBlending && (
              <div className="flex items-center gap-2">
                <div className="text-xs text-green-400">Blending</div>
                <div className="w-16 h-1 bg-zinc-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-400 transition-all duration-100"
                    style={{ width: `${sceneManager.crossfadePosition}%` }}
                  />
                </div>
              </div>
            )}
            
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white">
                  <Camera className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-zinc-900 border-zinc-700">
                <DialogHeader>
                  <DialogTitle className="text-white">Create Mix Snapshot</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-zinc-400 mb-1 block">Snapshot Name</label>
                    <Input
                      value={newSnapshotName}
                      onChange={(e) => setNewSnapshotName(e.target.value)}
                      placeholder="Enter snapshot name..."
                      className="bg-zinc-800 border-zinc-600 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-zinc-400 mb-1 block">Description (Optional)</label>
                    <Input
                      value={newSnapshotDescription}
                      onChange={(e) => setNewSnapshotDescription(e.target.value)}
                      placeholder="Describe this mix state..."
                      className="bg-zinc-800 border-zinc-600 text-white"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="ghost" 
                      onClick={() => setIsCreateDialogOpen(false)}
                      className="text-zinc-400"
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleCreateSnapshot}
                      disabled={!newSnapshotName.trim()}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Save className="w-4 h-4 mr-1" />
                      Create Snapshot
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 border-t border-zinc-700 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(false)}
            className="text-zinc-400 hover:text-white"
          >
            <Layers className="w-4 h-4 mr-1" />
            Mix Scene Snapshots
          </Button>
          <Badge variant="secondary" className="text-xs">
            {sceneManager.snapshots.length} Saved
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Crossfade Controls */}
          {sceneManager.isBlending && (
            <div className="flex items-center gap-2 px-3 py-1 bg-zinc-800 rounded-lg border border-zinc-600">
              <Timer className="w-4 h-4 text-green-400" />
              <div className="text-xs text-green-400">Crossfading</div>
              <div className="w-24">
                <Slider
                  value={[sceneManager.crossfadePosition]}
                  onValueChange={([value]) => onCrossfadePositionChange(value)}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onCrossfadeStop}
                className="text-red-400 hover:text-red-300"
              >
                <Pause className="w-4 h-4" />
              </Button>
            </div>
          )}
          
          {/* Crossfade Duration */}
          <div className="flex items-center gap-2">
            <label className="text-xs text-zinc-400">Duration:</label>
            <Input
              type="number"
              value={crossfadeDuration}
              onChange={(e) => setCrossfadeDuration(Number(e.target.value))}
              min={0.5}
              max={30}
              step={0.5}
              className="w-16 h-7 bg-zinc-800 border-zinc-600 text-white text-xs"
            />
            <span className="text-xs text-zinc-400">s</span>
          </div>
          
          {/* Create Snapshot */}
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="border-zinc-600 text-zinc-300 hover:bg-zinc-800">
                <Camera className="w-4 h-4 mr-1" />
                Capture
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-zinc-900 border-zinc-700">
              <DialogHeader>
                <DialogTitle className="text-white">Create Mix Snapshot</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-zinc-400 mb-1 block">Snapshot Name</label>
                  <Input
                    value={newSnapshotName}
                    onChange={(e) => setNewSnapshotName(e.target.value)}
                    placeholder="Enter snapshot name..."
                    className="bg-zinc-800 border-zinc-600 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm text-zinc-400 mb-1 block">Description (Optional)</label>
                  <Input
                    value={newSnapshotDescription}
                    onChange={(e) => setNewSnapshotDescription(e.target.value)}
                    placeholder="Describe this mix state..."
                    className="bg-zinc-800 border-zinc-600 text-white"
                  />
                </div>
                <div className="bg-zinc-800 p-3 rounded-lg">
                  <div className="text-sm text-zinc-300 mb-2">Current State Preview:</div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-zinc-400">
                    <div>Tracks: {tracks.length}</div>
                    <div>Master: {masterVolume}%</div>
                    <div>Active: {tracks.filter(t => !t.muted).length}</div>
                    <div>Solo: {tracks.filter(t => t.soloed).length}</div>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="ghost" 
                    onClick={() => setIsCreateDialogOpen(false)}
                    className="text-zinc-400"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreateSnapshot}
                    disabled={!newSnapshotName.trim()}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Save className="w-4 h-4 mr-1" />
                    Create Snapshot
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Snapshots Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {sceneManager.snapshots.map((snapshot) => (
          <Card 
            key={snapshot.id} 
            className={`
              bg-zinc-800 border-zinc-600 cursor-pointer transition-all duration-200 hover:border-zinc-500
              ${sceneManager.currentSnapshot === snapshot.id ? 'ring-2 ring-blue-500 border-blue-500' : ''}
              ${sceneManager.crossfadeTarget === snapshot.id ? 'ring-2 ring-green-500 border-green-500' : ''}
            `}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm text-white truncate">{snapshot.name}</CardTitle>
                <div className="flex items-center gap-1">
                  {sceneManager.currentSnapshot === snapshot.id && (
                    <Badge variant="secondary" className="text-xs px-1">Active</Badge>
                  )}
                  {sceneManager.crossfadeTarget === snapshot.id && (
                    <Badge className="text-xs px-1 bg-green-600">Target</Badge>
                  )}
                </div>
              </div>
              {snapshot.description && (
                <p className="text-xs text-zinc-400 truncate">{snapshot.description}</p>
              )}
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="space-y-2">
                {/* Snapshot Info */}
                <div className="grid grid-cols-2 gap-2 text-xs text-zinc-400">
                  <div>Channels: {getSnapshotChannelCount(snapshot)}</div>
                  <div>Master: {snapshot.masterVolume}%</div>
                  <div className="col-span-2">{formatDate(snapshot.createdAt)}</div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex items-center gap-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleLoadSnapshot(snapshot.id)}
                        disabled={sceneManager.currentSnapshot === snapshot.id}
                        className="flex-1 text-xs h-7 text-zinc-300 hover:text-white"
                      >
                        <Play className="w-3 h-3 mr-1" />
                        Load
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Load this snapshot instantly</TooltipContent>
                  </Tooltip>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleStartCrossfade(snapshot.id)}
                        disabled={sceneManager.currentSnapshot === snapshot.id || !sceneManager.currentSnapshot}
                        className="flex-1 text-xs h-7 text-green-400 hover:text-green-300"
                      >
                        <Shuffle className="w-3 h-3 mr-1" />
                        Blend
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Crossfade to this snapshot</TooltipContent>
                  </Tooltip>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onSnapshotDelete(snapshot.id)}
                        className="text-red-400 hover:text-red-300 h-7 w-7 p-0"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Delete this snapshot</TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {/* Empty State */}
        {sceneManager.snapshots.length === 0 && (
          <Card className="bg-zinc-800 border-zinc-600 border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-8 text-center">
              <Camera className="w-8 h-8 text-zinc-500 mb-2" />
              <p className="text-sm text-zinc-400 mb-1">No snapshots saved</p>
              <p className="text-xs text-zinc-500">Capture your first mix scene</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}