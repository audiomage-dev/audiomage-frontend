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
    <div className="h-screen flex flex-col select-none">
      <MenuBar />
      
      <SessionTabs 
        sessions={sessions} 
        onSwitchSession={switchSession} 
      />
      
      <div className="flex-1 flex">
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
        
        <TimelineEditor
          tracks={tracks}
          transport={transport}
          onTrackMute={toggleTrackMute}
          onTrackSolo={toggleTrackSolo}
        />
        
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
      
      <StatusBar
        projectName={currentProject.name}
        isSaved={true}
        aiAnalysis={aiAnalysis}
        lastAIAnalysis={new Date(Date.now() - 120000)} // 2 minutes ago
      />
    </div>
  );
}
