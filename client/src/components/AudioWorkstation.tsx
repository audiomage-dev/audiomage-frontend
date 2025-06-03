import { MenuBar } from './MenuBar';
import { SessionTabs } from './SessionTabs';
import { VerticalSidebar } from './VerticalSidebar';
import { AIChatSidebar } from './AIChatSidebar';
import { CompactTransportBar } from './CompactTransportBar';
import { CompactTimelineEditor } from './CompactTimelineEditor';
import { MidiEditor } from './MidiEditor';
import { InteractiveScoreEditor } from './InteractiveScoreEditor';
import { MixingConsole } from './MixingConsole';
import { StatusBar } from './StatusBar';
import { TrackInspector } from './TrackInspector';
import { MediaPreviewPane } from './MediaPreviewPane';
import { VideoPlayer } from './VideoPlayer';
import { CrossFadePanel } from './CrossFadePanel';
import { useAudioWorkstation } from '../hooks/useAudioWorkstation';
import { useCrossFade } from '../hooks/useCrossFade';
import { useState, useRef, useEffect } from 'react';
import { FileMusic } from 'lucide-react';

export function AudioWorkstation() {
  const {
    transport,
    currentProject,
    sessions,
    tracks,
    mixerChannels,
    aiAnalysis,
    aiSuggestions,
    play,
    pause,
    stop,
    toggleRecording,
    seekTo,
    updateTrackVolume,
    toggleTrackMute,
    toggleTrackSolo,
    switchSession,
    setCurrentProject,
    updateClipPosition,
    updateClipProperties,
  } = useAudioWorkstation();

  const [selectedTrack, setSelectedTrack] = useState<string | null>(null);
  const [isChatSidebarOpen, setIsChatSidebarOpen] = useState(false);
  const [inspectorHeight, setInspectorHeight] = useState(300); // Default height for track inspector
  const [zoomLevel, setZoomLevel] = useState(1);
  const [viewMode, setViewMode] = useState<'timeline' | 'midi' | 'score'>('timeline');
  const [isMidiPlaying, setIsMidiPlaying] = useState(false);
  const [midiPlaybackTime, setMidiPlaybackTime] = useState(0);
  
  // Media preview state
  const [selectedMediaFile, setSelectedMediaFile] = useState<{
    id: string;
    name: string;
    type: 'audio' | 'video' | 'image';
    url: string;
    duration?: number;
    size?: number;
  } | null>(null);
  
  // Lock states for Timeline and MIDI editors
  const [isTimelineLocked, setIsTimelineLocked] = useState(false);
  const [isMidiLocked, setIsMidiLocked] = useState(false);
  
  // Video player state
  const [isVideoPlayerOpen, setIsVideoPlayerOpen] = useState(false);
  
  // Cross-fade state
  const [isCrossFadePanelOpen, setIsCrossFadePanelOpen] = useState(false);
  const [selectedTracksForCrossFade, setSelectedTracksForCrossFade] = useState<string[]>([]);
  
  // Initialize cross-fade functionality
  const {
    addCrossFade,
    removeCrossFade,
    activeCrossFades,
    crossFadeConfigs,
    resetAllGains
  } = useCrossFade(transport, tracks);
  
  // Global MIDI playback control functions
  const [midiPlaybackFunctions, setMidiPlaybackFunctions] = useState<{
    playMidiTrack: (() => void) | null;
    pauseMidiPlayback: (() => void) | null;
    stopMidiPlayback: (() => void) | null;
  }>({
    playMidiTrack: null,
    pauseMidiPlayback: null,
    stopMidiPlayback: null,
  });

  const handleMasterVolumeChange = (volume: number) => {
    setCurrentProject({
      ...currentProject,
      masterVolume: volume,
    });
  };

  const handleChannelVolumeChange = (channelId: string, volume: number) => {
    // Update channel volume logic
    console.log(`Channel ${channelId} volume: ${volume}`);
  };

  const handleZoomIn = () => {
    const newZoomLevel = Math.min(zoomLevel * 1.5, 10);
    setZoomLevel(newZoomLevel);
  };

  const handleZoomOut = () => {
    const newZoomLevel = Math.max(zoomLevel / 1.5, 0.1);
    setZoomLevel(newZoomLevel);
  };

  const handleZoomChange = (newZoomLevel: number) => {
    setZoomLevel(newZoomLevel);
  };

  const handleChannelMute = (channelId: string) => {
    // Toggle channel mute logic
    console.log(`Toggle mute for channel: ${channelId}`);
  };

  const handleChannelSolo = (channelId: string) => {
    // Toggle channel solo logic
    console.log(`Toggle solo for channel: ${channelId}`);
  };

  // Auto-select first MIDI track when switching to MIDI mode
  useEffect(() => {
    if (viewMode === 'midi' && !selectedTrack) {
      const midiTracks = tracks.filter(track => track.type === 'midi');
      if (midiTracks.length > 0) {
        setSelectedTrack(midiTracks[0].id);
      }
    }
  }, [viewMode, selectedTrack, tracks]);



  return (
    <div className="h-screen flex flex-col select-none bg-[var(--background)]">
      {/* Top Menu Bar */}
      <div className="flex-none">
        <MenuBar />
      </div>
      
      {/* Session Tabs */}
      <div className="flex-none h-10 border-b border-[var(--border)]">
        <SessionTabs 
          sessions={sessions} 
          onSwitchSession={switchSession} 
        />
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Vertical Sidebar */}
        <div className="flex-none">
          <VerticalSidebar onFileSelect={setSelectedMediaFile} />
        </div>
        
        {/* Center Panel - Timeline */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Media Preview Pane */}
          <MediaPreviewPane
            file={selectedMediaFile}
            onClose={() => setSelectedMediaFile(null)}
            isVisible={!!selectedMediaFile}
          />
          
          {/* Transport Bar */}
          <div className="flex-none">
            <CompactTransportBar
              transport={transport}
              bpm={currentProject.bpm}
              timeSignature={currentProject.timeSignature}
              zoomLevel={zoomLevel}
              viewMode={viewMode}
              midiPlaybackTime={midiPlaybackTime}
              onPlay={play}
              onPause={pause}
              onStop={stop}
              onRecord={toggleRecording}
              onSeek={seekTo}
              onZoomIn={handleZoomIn}
              onZoomOut={handleZoomOut}
              onViewModeChange={setViewMode}
              onMidiPlay={() => {
                console.log('onMidiPlay called, functions available:', !!midiPlaybackFunctions.playMidiTrack);
                midiPlaybackFunctions.playMidiTrack?.();
              }}
              onMidiPause={() => {
                console.log('AudioWorkstation: onMidiPause called, functions available:', !!midiPlaybackFunctions.pauseMidiPlayback);
                midiPlaybackFunctions.pauseMidiPlayback?.();
              }}
              onMidiStop={() => {
                midiPlaybackFunctions.stopMidiPlayback?.();
              }}
              isMidiPlaying={isMidiPlaying}
              selectedTrack={selectedTrack}
              isTimelineLocked={isTimelineLocked}
              isMidiLocked={isMidiLocked}
              onTimelineLockToggle={() => setIsTimelineLocked(!isTimelineLocked)}
              onMidiLockToggle={() => setIsMidiLocked(!isMidiLocked)}
              onVideoPlayerToggle={() => setIsVideoPlayerOpen(!isVideoPlayerOpen)}
              onCrossFadeToggle={() => setIsCrossFadePanelOpen(!isCrossFadePanelOpen)}
              onBpmChange={(newBpm) => setCurrentProject(prev => ({ ...prev, bpm: newBpm }))}
              onTimeSignatureChange={(newTimeSignature) => setCurrentProject(prev => ({ ...prev, timeSignature: newTimeSignature }))}
            />
          </div>
          
          {/* Editor Area - Timeline, MIDI, or Score */}
          <div className="flex-1 overflow-hidden">
            {viewMode === 'timeline' ? (
              <CompactTimelineEditor
                tracks={tracks}
                transport={transport}
                zoomLevel={zoomLevel}
                bpm={currentProject.bpm}
                timeSignature={currentProject.timeSignature}
                onTrackMute={toggleTrackMute}
                onTrackSolo={toggleTrackSolo}
                onTrackSelect={setSelectedTrack}
                onClipMove={updateClipPosition}
                onClipResize={updateClipProperties}
                onZoomChange={handleZoomChange}
                isLocked={isTimelineLocked}
              />
            ) : viewMode === 'midi' ? (
              <MidiEditor
                tracks={tracks}
                transport={transport}
                zoomLevel={zoomLevel}
                onTrackMute={toggleTrackMute}
                onTrackSolo={toggleTrackSolo}
                onTrackSelect={setSelectedTrack}
                onMidiPlayingChange={setIsMidiPlaying}
                onMidiControlsRegister={setMidiPlaybackFunctions}
                onMidiTimeChange={setMidiPlaybackTime}
                isMidiPlaying={isMidiPlaying}
                isLocked={isMidiLocked}
              />
            ) : (
              <InteractiveScoreEditor
                tracks={tracks}
                transport={transport}
                onTrackMute={toggleTrackMute}
                onTrackSolo={toggleTrackSolo}
                isLocked={isTimelineLocked}
              />
            )}
          </div>

          {/* Track Inspector Bottom Pane - Only show in timeline view */}
          {selectedTrack && viewMode === 'timeline' && (
            <div 
              className="flex-none relative border-t border-[var(--border)]"
              style={{ height: `${inspectorHeight}px` }}
            >
              {/* Resize Handle */}
              <div
                className="absolute top-0 left-0 right-0 h-1 cursor-ns-resize hover:bg-[var(--primary)] transition-colors z-10"
                onMouseDown={(e) => {
                  e.preventDefault();
                  const startY = e.clientY;
                  const startHeight = inspectorHeight;
                  
                  const handleMouseMove = (e: MouseEvent) => {
                    const deltaY = startY - e.clientY;
                    const newHeight = Math.max(200, Math.min(600, startHeight + deltaY));
                    setInspectorHeight(newHeight);
                  };
                  
                  const handleMouseUp = () => {
                    document.removeEventListener('mousemove', handleMouseMove);
                    document.removeEventListener('mouseup', handleMouseUp);
                  };
                  
                  document.addEventListener('mousemove', handleMouseMove);
                  document.addEventListener('mouseup', handleMouseUp);
                }}
              />
              
              <div className="h-full overflow-y-auto overflow-x-hidden">
                <TrackInspector
                  track={tracks.find(t => t.id === selectedTrack)!}
                  onTrackMute={toggleTrackMute}
                  onTrackSolo={toggleTrackSolo}
                  onClose={() => setSelectedTrack(null)}
                />
              </div>
            </div>
          )}

        </div>
      </div>
      
      {/* Bottom Status Bar */}
      <div className="flex-none h-6">
        <StatusBar
          projectName={currentProject.name}
          isSaved={true}
          aiAnalysis={aiAnalysis}
          lastAIAnalysis={new Date(Date.now() - 120000)}
        />
      </div>

      {/* Right AI Chat Sidebar */}
      <AIChatSidebar
        isOpen={isChatSidebarOpen}
        onToggle={() => setIsChatSidebarOpen(!isChatSidebarOpen)}
        currentSession={sessions.find(s => s.isActive)?.name}
      />

      {/* Video Player Modal */}
      <VideoPlayer
        isOpen={isVideoPlayerOpen}
        onClose={() => setIsVideoPlayerOpen(false)}
        transport={transport}
        onVideoTimeUpdate={seekTo}
      />

      {/* Cross Fade Panel */}
      <CrossFadePanel
        isOpen={isCrossFadePanelOpen}
        onClose={() => setIsCrossFadePanelOpen(false)}
        tracks={tracks}
        transport={transport}
        onApplyCrossFade={addCrossFade}
        selectedTracks={selectedTracksForCrossFade}
      />
    </div>
  );
}
