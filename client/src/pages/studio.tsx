import { AudioWorkstation } from '@/components/AudioWorkstation';

export default function Studio() {
  return (
    <div className="min-h-screen bg-[hsl(var(--nord-0))] text-[hsl(var(--nord-4))]">
      <AudioWorkstation />
    </div>
  );
}
