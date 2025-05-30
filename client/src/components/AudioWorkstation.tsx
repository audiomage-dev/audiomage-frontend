import { MenuBar } from './MenuBar';
import { SessionTabs } from './SessionTabs';
import { LeftSidebar } from './LeftSidebar';
import { TimelineEditor } from './TimelineEditor';
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
        {/* Left Panel - Transport & Project */}
        <div className="flex-none w-80 bg-gradient-to-b from-[var(--muted)] to-[var(--background)] border-r border-[var(--border)]">
          <LeftSidebar
            transport={transport}
            bpm={currentProject.bpm}
            timeSignature={currentProject.timeSignature}
            aiSuggestions={aiSuggestions}
            isAIProcessing={aiAnalysis.isProcessing}
            onPlay={play}
            onPause={pause}
            onStop={stop}
            onRecord={toggleRecording}
          />
        </div>
        
        {/* Center Panel - Timeline */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Timeline Editor */}
          <div className="flex-1 overflow-hidden">
            <TimelineEditor
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
