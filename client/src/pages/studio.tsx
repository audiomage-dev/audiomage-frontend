import { AudioWorkstation } from '@/components/AudioWorkstation';

export default function Studio() {
  return (
    <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      <AudioWorkstation />
    </div>
  );
}
