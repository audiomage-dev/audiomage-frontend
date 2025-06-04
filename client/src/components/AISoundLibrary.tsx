import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Car, 
  Zap, 
  Music, 
  TreePine, 
  Waves, 
  Home, 
  Plane, 
  Users, 
  Heart, 
  Gamepad2,
  Volume2,
  Download,
  Play,
  Pause,
  Search
} from 'lucide-react';
import { Input } from '@/components/ui/input';

interface SoundCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  soundCount: number;
  sounds: SoundItem[];
}

interface SoundItem {
  id: string;
  name: string;
  duration: string;
  size: string;
  category: string;
  tags: string[];
  previewUrl?: string;
}

export function AISoundLibrary() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [playingSound, setPlayingSound] = useState<string | null>(null);

  const soundCategories: SoundCategory[] = [
    {
      id: 'vehicles',
      name: 'Vehicle Sounds',
      icon: <Car className="w-4 h-4" />,
      color: 'text-blue-500',
      soundCount: 45,
      sounds: [
        { id: 'car_engine_1', name: 'Sports Car Engine Rev', duration: '3.2s', size: '2.1MB', category: 'vehicles', tags: ['engine', 'rev', 'sports'] },
        { id: 'car_brake_1', name: 'Car Brake Screech', duration: '1.8s', size: '1.3MB', category: 'vehicles', tags: ['brake', 'screech', 'tire'] },
        { id: 'motorcycle_1', name: 'Motorcycle Startup', duration: '4.1s', size: '2.8MB', category: 'vehicles', tags: ['motorcycle', 'startup', 'engine'] },
        { id: 'truck_horn_1', name: 'Truck Air Horn', duration: '2.5s', size: '1.9MB', category: 'vehicles', tags: ['horn', 'truck', 'air'] },
      ]
    },
    {
      id: 'weapons',
      name: 'Weapon Sounds',
      icon: <Zap className="w-4 h-4" />,
      color: 'text-red-500',
      soundCount: 32,
      sounds: [
        { id: 'gunshot_1', name: 'Pistol Gunshot', duration: '0.9s', size: '0.8MB', category: 'weapons', tags: ['gunshot', 'pistol', 'bang'] },
        { id: 'rifle_1', name: 'Assault Rifle Burst', duration: '1.5s', size: '1.2MB', category: 'weapons', tags: ['rifle', 'burst', 'automatic'] },
        { id: 'reload_1', name: 'Gun Reload', duration: '2.3s', size: '1.6MB', category: 'weapons', tags: ['reload', 'magazine', 'click'] },
        { id: 'sword_1', name: 'Sword Slash', duration: '1.1s', size: '0.9MB', category: 'weapons', tags: ['sword', 'slash', 'blade'] },
      ]
    },
    {
      id: 'nature',
      name: 'Nature Sounds',
      icon: <TreePine className="w-4 h-4" />,
      color: 'text-green-500',
      soundCount: 67,
      sounds: [
        { id: 'rain_1', name: 'Heavy Rainfall', duration: '10.0s', size: '7.2MB', category: 'nature', tags: ['rain', 'heavy', 'storm'] },
        { id: 'thunder_1', name: 'Thunder Crack', duration: '3.8s', size: '2.7MB', category: 'nature', tags: ['thunder', 'lightning', 'storm'] },
        { id: 'birds_1', name: 'Morning Bird Chorus', duration: '8.5s', size: '6.1MB', category: 'nature', tags: ['birds', 'morning', 'chirping'] },
        { id: 'wind_1', name: 'Strong Wind Gust', duration: '5.2s', size: '3.8MB', category: 'nature', tags: ['wind', 'gust', 'breeze'] },
      ]
    },
    {
      id: 'ambient',
      name: 'Ambient Sounds',
      icon: <Waves className="w-4 h-4" />,
      color: 'text-purple-500',
      soundCount: 58,
      sounds: [
        { id: 'city_1', name: 'City Traffic Ambience', duration: '15.0s', size: '10.8MB', category: 'ambient', tags: ['city', 'traffic', 'urban'] },
        { id: 'forest_1', name: 'Forest Atmosphere', duration: '12.3s', size: '8.9MB', category: 'ambient', tags: ['forest', 'peaceful', 'nature'] },
        { id: 'space_1', name: 'Deep Space Drone', duration: '20.0s', size: '14.4MB', category: 'ambient', tags: ['space', 'drone', 'cosmic'] },
        { id: 'underwater_1', name: 'Underwater Bubbles', duration: '7.8s', size: '5.6MB', category: 'ambient', tags: ['underwater', 'bubbles', 'ocean'] },
      ]
    },
    {
      id: 'household',
      name: 'Household Items',
      icon: <Home className="w-4 h-4" />,
      color: 'text-orange-500',
      soundCount: 41,
      sounds: [
        { id: 'door_1', name: 'Door Slam', duration: '1.2s', size: '0.9MB', category: 'household', tags: ['door', 'slam', 'close'] },
        { id: 'microwave_1', name: 'Microwave Beep', duration: '2.1s', size: '1.5MB', category: 'household', tags: ['microwave', 'beep', 'kitchen'] },
        { id: 'vacuum_1', name: 'Vacuum Cleaner', duration: '6.7s', size: '4.8MB', category: 'household', tags: ['vacuum', 'cleaning', 'motor'] },
        { id: 'phone_1', name: 'Phone Ring', duration: '3.5s', size: '2.5MB', category: 'household', tags: ['phone', 'ring', 'call'] },
      ]
    },
    {
      id: 'aircraft',
      name: 'Aircraft Sounds',
      icon: <Plane className="w-4 h-4" />,
      color: 'text-cyan-500',
      soundCount: 28,
      sounds: [
        { id: 'jet_1', name: 'Jet Engine Takeoff', duration: '8.9s', size: '6.4MB', category: 'aircraft', tags: ['jet', 'takeoff', 'engine'] },
        { id: 'helicopter_1', name: 'Helicopter Blades', duration: '5.5s', size: '4.0MB', category: 'aircraft', tags: ['helicopter', 'blades', 'rotor'] },
        { id: 'propeller_1', name: 'Propeller Plane', duration: '7.2s', size: '5.2MB', category: 'aircraft', tags: ['propeller', 'plane', 'vintage'] },
        { id: 'sonic_boom_1', name: 'Sonic Boom', duration: '2.8s', size: '2.0MB', category: 'aircraft', tags: ['sonic', 'boom', 'supersonic'] },
      ]
    }
  ];

  const selectedCategoryData = soundCategories.find(cat => cat.id === selectedCategory);
  
  const filteredSounds = selectedCategoryData?.sounds.filter(sound =>
    sound.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sound.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  ) || [];

  const handlePlaySound = (soundId: string) => {
    if (playingSound === soundId) {
      setPlayingSound(null);
    } else {
      setPlayingSound(soundId);
      // In a real implementation, this would play the actual audio file
      setTimeout(() => setPlayingSound(null), 2000); // Auto-stop after 2 seconds for demo
    }
  };

  const handleDownloadSound = (sound: SoundItem) => {
    // In a real implementation, this would trigger the download
    console.log(`Downloading sound: ${sound.name}`);
  };

  if (selectedCategory && selectedCategoryData) {
    return (
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-[var(--border)] bg-[var(--muted)]">
          <div className="flex items-center justify-between mb-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedCategory(null)}
              className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            >
              ← Back to Categories
            </Button>
            <div className={`flex items-center space-x-2 ${selectedCategoryData.color}`}>
              {selectedCategoryData.icon}
              <span className="text-sm font-medium">{selectedCategoryData.name}</span>
            </div>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
            <Input
              placeholder="Search sounds..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Sound List */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            {filteredSounds.map((sound) => (
              <div
                key={sound.id}
                className="p-3 bg-[var(--background)] border border-[var(--border)] rounded-lg hover:bg-[var(--muted)] transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-[var(--foreground)]">{sound.name}</h4>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-xs text-[var(--muted-foreground)]">{sound.duration}</span>
                      <span className="text-xs text-[var(--muted-foreground)]">{sound.size}</span>
                      <div className="flex items-center space-x-1">
                        {sound.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 bg-[var(--secondary)] text-xs rounded-full text-[var(--secondary-foreground)]"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-8 h-8 p-0"
                      onClick={() => handlePlaySound(sound.id)}
                    >
                      {playingSound === sound.id ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-8 h-8 p-0"
                      onClick={() => handleDownloadSound(sound)}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {filteredSounds.length === 0 && searchQuery && (
            <div className="text-center py-8 text-[var(--muted-foreground)]">
              <p>No sounds found matching "{searchQuery}"</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-[var(--border)] bg-[var(--muted)]">
        <h3 className="text-sm font-medium text-[var(--foreground)]">AI Sound Library</h3>
        <p className="text-xs text-[var(--muted-foreground)] mt-1">
          Browse AI-generated sound effects by category
        </p>
      </div>

      {/* Categories Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-1 gap-3">
          {soundCategories.map((category) => (
            <Button
              key={category.id}
              variant="outline"
              className="h-auto p-4 justify-start text-left hover:bg-[var(--muted)]"
              onClick={() => setSelectedCategory(category.id)}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center space-x-3">
                  <div className={category.color}>
                    {category.icon}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-[var(--foreground)]">
                      {category.name}
                    </div>
                    <div className="text-xs text-[var(--muted-foreground)]">
                      {category.soundCount} sounds available
                    </div>
                  </div>
                </div>
                <Volume2 className="w-4 h-4 text-[var(--muted-foreground)]" />
              </div>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}