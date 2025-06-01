import { MenuBar } from './MenuBar';
import { SessionTabs } from './SessionTabs';
import { VerticalSidebar } from './VerticalSidebar';
import { AIChatSidebar } from './AIChatSidebar';
import { CompactTransportBar } from './CompactTransportBar';
import { CompactTimelineEditor } from './CompactTimelineEditor';
import { MidiEditor } from './MidiEditor';
import { MixingConsole } from './MixingConsole';
import { StatusBar } from './StatusBar';
import { TrackInspector } from './TrackInspector';
import { useAudioWorkstation } from '../hooks/useAudioWorkstation';
import { useState } from 'react';

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
  const [viewMode, setViewMode] = useState<'timeline' | 'midi'>('timeline');

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
          <VerticalSidebar />
        </div>
        
        {/* Center Panel - Timeline */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Transport Bar */}
          <div className="flex-none">
            <CompactTransportBar
              transport={transport}
              bpm={currentProject.bpm}
              timeSignature={currentProject.timeSignature}
              zoomLevel={zoomLevel}
              viewMode={viewMode}
              onPlay={play}
              onPause={pause}
              onStop={stop}
              onRecord={toggleRecording}
              onZoomIn={handleZoomIn}
              onZoomOut={handleZoomOut}
              onViewModeChange={setViewMode}
            />
          </div>
          
          {/* Editor Area - Timeline or MIDI */}
          <div className="flex-1 overflow-hidden">
            {viewMode === 'timeline' ? (
              <CompactTimelineEditor
                tracks={tracks}
                transport={transport}
                zoomLevel={zoomLevel}
                onTrackMute={toggleTrackMute}
                onTrackSolo={toggleTrackSolo}
                onTrackSelect={setSelectedTrack}
                onClipMove={updateClipPosition}
                onClipResize={updateClipProperties}
                onZoomChange={handleZoomChange}
              />
            ) : (
              <MidiEditor
                tracks={tracks}
                transport={transport}
                zoomLevel={zoomLevel}
                onTrackMute={toggleTrackMute}
                onTrackSolo={toggleTrackSolo}
                onTrackSelect={setSelectedTrack}
              />
            )}
          </div>

          {/* Track Inspector Bottom Pane */}
          {selectedTrack && (
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
              
              <div className="h-full overflow-hidden">
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
    </div>
  );
}
