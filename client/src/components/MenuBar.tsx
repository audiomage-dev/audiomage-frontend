import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { Moon, Sun, Settings, Mic2 } from 'lucide-react';

export function MenuBar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="h-12 bg-gradient-to-r from-[var(--background)] via-[var(--muted)] to-[var(--background)] border-b border-[var(--border)] px-6 flex items-center justify-between shadow-lg">
      <div className="flex items-center space-x-8">
        <div className="flex items-center space-x-3">
          <div className="flex space-x-1">
            <div className="w-3 h-3 rounded-full bg-[var(--red)] shadow-sm"></div>
            <div className="w-3 h-3 rounded-full bg-[var(--yellow)] shadow-sm"></div>
            <div className="w-3 h-3 rounded-full bg-[var(--green)] shadow-sm"></div>
          </div>
          <Mic2 className="w-5 h-5 text-[var(--primary)]" />
          <span className="font-bold text-lg bg-gradient-to-r from-[var(--primary)] to-[var(--frost3)] bg-clip-text text-transparent">
            Audiomage Studio
          </span>
        </div>
        
        <nav className="flex items-center space-x-1">
          {['File', 'Edit', 'Track', 'Mix', 'View', 'AI', 'Window'].map((item) => (
            <Button
              key={item}
              variant="ghost"
              size="sm"
              className="px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] rounded-lg transition-all duration-200"
            >
              {item}
            </Button>
          ))}
        </nav>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-3 bg-[var(--muted)] px-4 py-2 rounded-xl border border-[var(--border)]">
          <div className="w-2 h-2 rounded-full bg-[var(--green)] animate-pulse"></div>
          <span className="text-sm font-medium text-[var(--muted-foreground)]">AI Ready</span>
        </div>
        
        <div className="flex items-center space-x-2 bg-[var(--secondary)] px-3 py-2 rounded-lg">
          <span className="text-sm font-mono font-bold text-[var(--secondary-foreground)]">120</span>
          <span className="text-xs text-[var(--muted-foreground)]">BPM</span>
          <div className="w-px h-4 bg-[var(--border)]"></div>
          <span className="text-sm font-mono font-bold text-[var(--secondary-foreground)]">4/4</span>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={toggleTheme}
          className="h-9 w-9 p-0 rounded-lg border-[var(--border)] hover:bg-[var(--accent)] transition-all duration-200"
        >
          {theme === 'nord-light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          className="h-9 w-9 p-0 rounded-lg hover:bg-[var(--accent)] transition-all duration-200"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
