import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';

export function MenuBar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="bg-[hsl(var(--muted))] border-b border-[hsl(var(--border))] px-2 py-1 flex items-center justify-between text-xs">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <i className="fas fa-wave-square text-[hsl(var(--frost-2))] text-lg"></i>
          <span className="font-semibold text-[hsl(var(--foreground))]">Audiomage Pro Studio</span>
        </div>
        <div className="flex space-x-1">
          {['File', 'Edit', 'Track', 'Mix', 'Window', 'AI'].map((item) => (
            <Button
              key={item}
              variant="ghost"
              size="sm"
              className="px-2 py-1 hover:bg-[hsl(var(--accent))] rounded text-[hsl(var(--foreground))] h-auto"
            >
              {item}
            </Button>
          ))}
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-1 bg-[hsl(var(--accent))] px-2 py-1 rounded">
          <i className="fas fa-robot text-[hsl(var(--frost-1))]"></i>
          <span className="text-xs">AI Assistant Active</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleTheme}
          className="p-1 hover:bg-[hsl(var(--accent))] rounded h-auto"
          title={theme === 'nord-light' ? 'Switch to Nord Dark' : 'Switch to Nord Light'}
        >
          <i className={`fas ${theme === 'nord-light' ? 'fa-moon' : 'fa-sun'} text-[hsl(var(--frost-3))]`}></i>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="p-1 hover:bg-[hsl(var(--accent))] rounded h-auto"
        >
          <i className="fas fa-cog text-[hsl(var(--foreground))]"></i>
        </Button>
      </div>
    </div>
  );
}
