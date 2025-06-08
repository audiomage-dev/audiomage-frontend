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
import { WorkstationVideoPlayer } from './WorkstationVideoPlayer';
import { MovableVideoPlayer } from './MovableVideoPlayer';

import { MediaPreviewPane } from './MediaPreviewPane';

import { useAudioWorkstation } from '../hooks/useAudioWorkstation';
import { useState, useRef, useEffect, useCallback } from 'react';
import { FileMusic } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function AudioWorkstation() {
  const {
    transport,
    currentProject,
    sessions,
    tracks,
    mixerChannels,
    aiAnalysis,
    aiSuggestions,
    collapsedGroups,
    play,
    pause,
    stop,
    toggleRecording,
    seekTo,
    updateTrackVolume,
    toggleTrackMute,
    toggleTrackSolo,
    switchSession,
    addSession,
    closeSession,
    setCurrentProject,
    updateClipPosition,
    updateClipProperties,
    toggleGroupCollapse,
  } = useAudioWorkstation();

  const [selectedTrack, setSelectedTrack] = useState<string | null>(null);
  const [isChatSidebarOpen, setIsChatSidebarOpen] = useState(false);
  const [videoPlayerSize, setVideoPlayerSize] = useState({ width: 512, height: 384 });

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
  
  // Snap mode state
  const [snapMode, setSnapMode] = useState<'free' | 'grid' | 'beat' | 'measure'>('grid');
  
  // Grid display mode state
  const [gridDisplayMode, setGridDisplayMode] = useState<'seconds' | 'timecode'>('seconds');
  
  // Video player dimensions for sidebar container height calculation
  const [videoPlayerHeight, setVideoPlayerHeight] = useState(200);
  const [sidebarContainerHeight, setSidebarContainerHeight] = useState(400);
  
  // Independent video player state
  const [isVideoIndependent, setIsVideoIndependent] = useState(false);
  const [isMiniPlayer, setIsMiniPlayer] = useState(false);

  // MIDI playback functions state
  const [midiPlaybackFunctions, setMidiPlaybackFunctions] = useState<{
    playMidiTrack?: () => void;
    pauseMidiPlayback?: () => void;
    stopMidiPlayback?: () => void;
  }>({});

  // Define handler functions with useCallback first
  const handleZoomIn = useCallback(() => {
    const newZoomLevel = Math.min(zoomLevel * 1.5, 10);
    setZoomLevel(newZoomLevel);
  }, [zoomLevel]);

  const handleZoomOut = useCallback(() => {
    const newZoomLevel = Math.max(zoomLevel / 1.5, 0.1);
    setZoomLevel(newZoomLevel);
  }, [zoomLevel]);

  const handleZoomChange = useCallback((newZoomLevel: number) => {
    setZoomLevel(newZoomLevel);
  }, []);

  // Calculate sidebar container height based on video player height
  useEffect(() => {
    const viewportHeight = window.innerHeight;
    const headerHeight = 60;
    const padding = 32;
    
    if (isMiniPlayer) {
      const availableHeight = viewportHeight - headerHeight - padding;
      setSidebarContainerHeight(Math.max(availableHeight, 100));
    } else {
      const videoPadding = 16;
      const totalVideoHeight = videoPlayerHeight + videoPadding;
      const availableHeight = viewportHeight - headerHeight - totalVideoHeight - padding;
      setSidebarContainerHeight(Math.max(availableHeight, 100));
    }
  }, [videoPlayerHeight, isMiniPlayer]);

  // Video player handlers
  const handleMoveVideoToIndependentScreen = useCallback(() => {
    setIsVideoIndependent(true);
  }, []);

  const handleToggleMiniPlayer = useCallback(() => {
    setIsMiniPlayer(!isMiniPlayer);
  }, [isMiniPlayer]);

  const handleCloseMiniPlayer = useCallback(() => {
    setIsMiniPlayer(false);
  }, []);

  const handleMaximizeMiniPlayer = useCallback(() => {
    setIsMiniPlayer(false);
  }, []);

  // Create AI analysis with required properties
  const aiAnalysisData = {
    spectralData: [10, 25, 40, 35, 60, 45, 30, 55, 70, 85, 75, 90, 80, 65, 50, 40, 30, 20, 15, 10],
    peakFrequency: 440,
    recommendations: [
      "Apply 3dB cut at 2.4kHz",
      "Increase reverb send by 15%", 
      "Consider parallel compression",
      "Add subtle harmonic enhancement"
    ],
    lufs: -14.2,
    peak: -1.2,
    isProcessing: false
  };

  return (
    <div className="audio-workstation h-screen flex flex-col select-none bg-[var(--background)]">
      {/* Top Menu Bar with Session Tabs */}
      <div className="flex-none">
        <MenuBar 
          sessions={sessions}
          onSwitchSession={switchSession}
          onAddSession={addSession}
          onCloseSession={closeSession}
        />
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Video Player and Sidebar */}
        <div 
          className="flex-none flex flex-col bg-[var(--muted)] border-r border-[var(--border)]" 
          style={{ 
            width: isMiniPlayer ? 320 : Math.max(320, videoPlayerSize.width + 16),
            minWidth: isMiniPlayer ? 320 : Math.max(320, videoPlayerSize.width + 16),
            maxWidth: isMiniPlayer ? 320 : Math.max(320, videoPlayerSize.width + 16)
          }}
        >
          {/* Resizable Video Player - Hidden when mini-player is active */}
          {!isMiniPlayer && (
            <div 
              className="flex-none p-2 border-b border-[var(--border)]"
              style={{ 
                height: videoPlayerSize.height + 16,
                minHeight: videoPlayerSize.height + 16
              }}
            >
              <WorkstationVideoPlayer
                src={selectedMediaFile?.type === 'video' ? selectedMediaFile.url : "/api/placeholder-video"}
                initialWidth={videoPlayerSize.width}
                initialHeight={videoPlayerSize.height}
                minWidth={200}
                minHeight={150}
                maxWidth={800}
                maxHeight={600}
                onSizeChange={(width, height) => {
                  setVideoPlayerSize({ width, height });
                  setVideoPlayerHeight(height);
                }}
                onMoveToIndependentScreen={handleMoveVideoToIndependentScreen}
                onToggleMiniPlayer={handleToggleMiniPlayer}
              />
            </div>
          )}
          
          {/* Vertical Sidebar below video */}
          <div className="flex-1 flex flex-col min-h-0 p-2">
            <VerticalSidebar 
              onFileSelect={setSelectedMediaFile} 
              containerHeight={sidebarContainerHeight}
            />
          </div>
        </div>
        
        {/* Center Panel - Timeline with Master Fader */}
        <div className="flex-1 flex min-w-0">
          {/* Master Fader Panel - Between video player and tracks */}
          <div 
            className="w-24 bg-[var(--background)] border-r border-b border-[var(--border)] flex flex-col items-center py-3 px-3"
            style={{ height: videoPlayerSize.height + 16 + 'px' }}
          >
            {/* Master Label */}
            <div className="text-center mb-2">
              <span className="text-[9px] font-bold text-[var(--foreground)] tracking-widest">MASTER</span>
            </div>
            
            {/* Main Control Area - Horizontal Layout */}
            <div className="flex-1 flex flex-row items-stretch w-full px-1">
              
              {/* Meter Scale - Positioned on the left */}
              <div className="flex flex-col justify-between text-[5px] text-[var(--foreground)] font-mono font-bold py-2 leading-none mr-1">
                <span className="text-red-500">0</span>
                <span className="text-yellow-600">-6</span>
                <span className="text-green-600">-12</span>
                <span className="text-gray-500">-∞</span>
              </div>

              {/* Stereo Peak Meters - Left and Right Channels */}
              <div className="flex gap-0.5">
                {/* Left Channel Meter */}
                <div className="w-2 bg-[var(--card)] border border-[var(--border)] rounded-sm relative overflow-hidden shadow-sm flex-1 min-h-0">
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-green-400 via-yellow-400 to-red-400"
                       style={{ height: '75%' }}>
                  </div>
                  {/* Peak hold indicator - Left */}
                  <div className="absolute w-full h-px bg-red-300 shadow-md" style={{ top: '25%' }}></div>
                  {/* Channel label */}
                  <div className="absolute bottom-0 w-full text-center text-[4px] text-white font-bold bg-black/60">L</div>
                </div>
                
                {/* Right Channel Meter */}
                <div className="w-2 bg-[var(--card)] border border-[var(--border)] rounded-sm relative overflow-hidden shadow-sm flex-1 min-h-0">
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-green-400 via-yellow-400 to-red-400"
                       style={{ height: '68%' }}>
                  </div>
                  {/* Peak hold indicator - Right */}
                  <div className="absolute w-full h-px bg-red-300 shadow-md" style={{ top: '32%' }}></div>
                  {/* Channel label */}
                  <div className="absolute bottom-0 w-full text-center text-[4px] text-white font-bold bg-black/60">R</div>
                </div>
              </div>

              {/* Spacer */}
              <div className="flex-1"></div>

              {/* Neve-Style Master Fader - Positioned at right edge */}
              <div className="w-6 relative flex-1 min-h-0 max-w-6">
                {/* Fader Track - Neve Style */}
                <div className="absolute left-1/2 top-2 bottom-2 w-1 bg-gradient-to-b from-gray-700 via-gray-800 to-gray-900 border border-gray-600 rounded-sm transform -translate-x-1/2 shadow-inner">
                  {/* Track center line */}
                  <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-500 transform -translate-x-1/2"></div>
                  {/* Track markings */}
                  <div className="absolute left-0 right-0 top-1/4 h-px bg-gray-500"></div>
                  <div className="absolute left-0 right-0 top-1/2 h-px bg-gray-400"></div>
                  <div className="absolute left-0 right-0 top-3/4 h-px bg-gray-500"></div>
                </div>
                
                {/* Metallic Fader Handle - Professional */}
                <div 
                  className="absolute w-5 h-8 bg-gradient-to-b from-gray-300 via-gray-400 to-gray-600 border-2 border-gray-500 rounded-sm cursor-grab active:cursor-grabbing shadow-lg hover:shadow-xl transition-all hover:scale-105 select-none"
                  style={{ 
                    top: '25%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.4), inset 0 -1px 0 rgba(0,0,0,0.4), 0 2px 4px rgba(0,0,0,0.5)',
                    background: 'linear-gradient(to bottom, #e5e7eb 0%, #9ca3af 50%, #6b7280 100%)'
                  }}
                  title="Master Volume: 0dB"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    const faderContainer = e.currentTarget.parentElement;
                    if (!faderContainer) return;
                    
                    const containerRect = faderContainer.getBoundingClientRect();
                    const handleHeight = 32; // 8 * 4px (w-5 h-8)
                    const trackHeight = containerRect.height - 16; // Subtract top/bottom padding
                    
                    const handleMouseMove = (moveEvent: MouseEvent) => {
                      const relativeY = moveEvent.clientY - containerRect.top - 8; // Subtract top padding
                      const clampedY = Math.max(0, Math.min(trackHeight - handleHeight, relativeY));
                      const topPercent = (clampedY / (trackHeight - handleHeight)) * 100;
                      
                      e.currentTarget.style.top = topPercent + '%';
                      
                      // Calculate dB value (inverted because top = higher volume)
                      const volumePercent = 1 - (topPercent / 100);
                      const dbValue = -60 + (volumePercent * 66); // -60dB to +6dB range
                      e.currentTarget.title = `Master Volume: ${dbValue.toFixed(1)}dB`;
                    };
                    
                    const handleMouseUp = () => {
                      document.removeEventListener('mousemove', handleMouseMove);
                      document.removeEventListener('mouseup', handleMouseUp);
                      e.currentTarget.style.cursor = 'grab';
                    };
                    
                    document.addEventListener('mousemove', handleMouseMove);
                    document.addEventListener('mouseup', handleMouseUp);
                    e.currentTarget.style.cursor = 'grabbing';
                  }}
                ></div>
              </div>
            </div>
            
            {/* Bottom Controls - Refined */}
            <div className="flex flex-col gap-2 mt-3 items-center">
              {/* Mute Button - More prominent */}
              <button
                className="h-5 w-8 p-0 rounded text-[7px] border border-[var(--border)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] font-bold bg-[var(--card)] text-[var(--foreground)] cursor-pointer transition-all shadow-sm hover:shadow-md"
                title="Master Mute"
              >
                MUTE
              </button>
              
              {/* Level Display - Cleaner */}
              <div className="text-center bg-[var(--card)] rounded px-2 py-1 border border-[var(--border)] shadow-sm">
                <div className="text-[7px] font-mono text-[var(--foreground)] font-bold">
                  -2.3dB
                </div>
              </div>
            </div>
          </div>
          
          {/* Timeline Content */}
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
                bpm={120}
                timeSignature={[4, 4]}
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
                  midiPlaybackFunctions.playMidiTrack?.();
                }}
                onMidiPause={() => {
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
                snapMode={snapMode}
                onSnapModeChange={setSnapMode}
                gridDisplayMode={gridDisplayMode}
                onGridDisplayModeChange={setGridDisplayMode}
                onBpmChange={(newBpm) => setCurrentProject(`${currentProject} - BPM: ${newBpm}`)}
                onTimeSignatureChange={(newTimeSignature) => setCurrentProject(`${currentProject} - Time: ${newTimeSignature}`)}
              />
            </div>
          
            {/* Editor Area - Timeline, MIDI, or Score */}
            <div className="flex-1 overflow-hidden">
              {viewMode === 'timeline' ? (
                <CompactTimelineEditor
                  tracks={tracks}
                  transport={transport}
                  zoomLevel={zoomLevel}
                  bpm={120}
                  timeSignature={[4, 4] as [number, number]}
                  snapMode={snapMode}
                  gridDisplayMode={gridDisplayMode}
                  onTrackMute={toggleTrackMute}
                  onTrackSolo={toggleTrackSolo}
                  onTrackSelect={setSelectedTrack}
                  onClipMove={(clipId: string, fromTrackId: string, toTrackId: string, newStartTime: number) => {
                    updateClipPosition(clipId, toTrackId, newStartTime);
                  }}
                  onClipResize={(clipId: string, trackId: string, newStartTime: number, newDuration: number) => {
                    updateClipPosition(clipId, trackId, newStartTime, newDuration);
                  }}
                  onZoomChange={handleZoomChange}
                  isLocked={isTimelineLocked}
                  collapsedGroups={collapsedGroups}
                  onToggleGroupCollapse={toggleGroupCollapse}
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
          </div>
        </div>
      </div>
      
      {/* Bottom Status Bar */}
      <div className="flex-none h-6">
        <StatusBar
          projectName={currentProject}
          isSaved={true}
          aiAnalysis={aiAnalysisData}
          lastAIAnalysis={new Date(Date.now() - 120000)}
        />
      </div>

      {/* Movable Mini Player */}
      <MovableVideoPlayer
        src={selectedMediaFile?.type === 'video' ? selectedMediaFile.url : "/api/placeholder-video"}
        isVisible={isMiniPlayer}
        onClose={handleCloseMiniPlayer}
        onMaximize={handleMaximizeMiniPlayer}
      />
    </div>
  );
}