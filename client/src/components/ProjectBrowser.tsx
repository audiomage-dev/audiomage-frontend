interface ProjectItem {
  id: string;
  name: string;
  type: 'audio' | 'midi' | 'folder';
  icon: string;
  color: string;
}

const projectItems: ProjectItem[] = [
  { id: '1', name: 'Lead_Vocal.wav', type: 'audio', icon: 'fas fa-music', color: 'text-[hsl(var(--frost-3))]' },
  { id: '2', name: 'Drums_Kit.wav', type: 'audio', icon: 'fas fa-drum', color: 'text-[hsl(var(--aurora-orange))]' },
  { id: '3', name: 'Bass_DI.wav', type: 'audio', icon: 'fas fa-guitar', color: 'text-[hsl(var(--aurora-yellow))]' },
  { id: '4', name: 'Dialogue.wav', type: 'audio', icon: 'fas fa-microphone', color: 'text-[hsl(var(--aurora-green))]' },
  { id: '5', name: 'MIDI_Keys.mid', type: 'midi', icon: 'fas fa-piano', color: 'text-[hsl(var(--aurora-purple))]' },
  { id: '6', name: 'Samples', type: 'folder', icon: 'fas fa-folder', color: 'text-[hsl(var(--nord-4))]' },
];

export function ProjectBrowser() {
  return (
    <div className="flex-1 p-3 overflow-y-auto scrollbar-thin">
      <div className="text-sm font-semibold mb-2 flex items-center">
        <i className="fas fa-folder-open text-[hsl(var(--frost-2))] mr-2"></i>
        Project Browser
      </div>
      
      <div className="space-y-1">
        {projectItems.map((item) => (
          <div
            key={item.id}
            className="flex items-center space-x-2 p-1 hover:bg-[hsl(var(--nord-2))] rounded cursor-pointer"
          >
            <i className={`${item.icon} ${item.color} text-xs`}></i>
            <span className="text-xs font-mono">{item.name}</span>
          </div>
        ))}
      </div>
      
      <div className="mt-4 text-xs text-[hsl(var(--nord-3))]">
        <div className="mb-2 font-semibold">Quick Actions:</div>
        <div className="space-y-1">
          <div className="flex items-center space-x-2 p-1 hover:bg-[hsl(var(--nord-2))] rounded cursor-pointer">
            <i className="fas fa-plus text-[hsl(var(--frost-1))]"></i>
            <span>Import Audio</span>
          </div>
          <div className="flex items-center space-x-2 p-1 hover:bg-[hsl(var(--nord-2))] rounded cursor-pointer">
            <i className="fas fa-robot text-[hsl(var(--frost-1))]"></i>
            <span>Generate AI Audio</span>
          </div>
          <div className="flex items-center space-x-2 p-1 hover:bg-[hsl(var(--nord-2))] rounded cursor-pointer">
            <i className="fas fa-microphone text-[hsl(var(--aurora-red))]"></i>
            <span>Record New</span>
          </div>
        </div>
      </div>
    </div>
  );
}
