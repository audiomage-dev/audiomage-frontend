import { MenuBar } from './MenuBar';
import { SessionTabs } from './SessionTabs';
import { VerticalSidebar } from './VerticalSidebar';
import { CompactTransportBar } from './CompactTransportBar';
import { CompactTimelineEditor } from './CompactTimelineEditor';
import { MixingConsole } from './MixingConsole';
import { StatusBar } from './StatusBar';
import { useAudioWorkstation } from '../hooks/useAudioWorkstation';

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
  } = useAudioWorkstation();

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
              onPlay={play}
              onPause={pause}
              onStop={stop}
              onRecord={toggleRecording}
            />
          </div>
          
          {/* Timeline Editor */}
          <div className="flex-1 overflow-hidden">
            <CompactTimelineEditor
              tracks={tracks}
              transport={transport}
              onTrackMute={toggleTrackMute}
              onTrackSolo={toggleTrackSolo}
            />
          </div>
          
          {/* Mixing Console at bottom */}
          <div className="flex-none h-48 border-t border-[var(--border)]">
            <MixingConsole
              channels={mixerChannels}
              aiAnalysis={aiAnalysis}
              masterVolume={currentProject.masterVolume}
              onChannelVolumeChange={handleChannelVolumeChange}
              onChannelMute={handleChannelMute}
              onChannelSolo={handleChannelSolo}
              onMasterVolumeChange={handleMasterVolumeChange}
            />
          </div>
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
    </div>
  );
}
