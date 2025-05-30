import { useState } from 'react';
import { Button } from '@/components/ui/button';

export function MenuBar() {
  const [isDark, setIsDark] = useState(true);

  const toggleTheme = () => {
    setIsDark(!isDark);
    // Theme toggle logic would go here
  };

  return (
    <div className="bg-[hsl(var(--nord-1))] border-b border-[hsl(var(--nord-2))] px-2 py-1 flex items-center justify-between text-xs">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <i className="fas fa-wave-square text-[hsl(var(--frost-2))] text-lg"></i>
          <span className="font-semibold text-[hsl(var(--nord-4))]">Audiomage Pro Studio</span>
        </div>
        <div className="flex space-x-1">
          {['File', 'Edit', 'Track', 'Mix', 'Window', 'AI'].map((item) => (
            <Button
              key={item}
              variant="ghost"
              size="sm"
              className="px-2 py-1 hover:bg-[hsl(var(--nord-2))] rounded text-[hsl(var(--nord-4))] h-auto"
            >
              {item}
            </Button>
          ))}
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-1 bg-[hsl(var(--nord-2))] px-2 py-1 rounded">
          <i className="fas fa-robot text-[hsl(var(--frost-1))]"></i>
          <span className="text-xs">AI Assistant Active</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleTheme}
          className="p-1 hover:bg-[hsl(var(--nord-2))] rounded h-auto"
        >
          <i className="fas fa-moon text-[hsl(var(--frost-3))]"></i>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="p-1 hover:bg-[hsl(var(--nord-2))] rounded h-auto"
        >
          <i className="fas fa-cog text-[hsl(var(--nord-4))]"></i>
        </Button>
      </div>
    </div>
  );
}
