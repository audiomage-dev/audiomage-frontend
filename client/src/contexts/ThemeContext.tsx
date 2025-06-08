import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'nord-light' | 'nord-dark';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    // Check localStorage first, default to nord-dark
    const saved = localStorage.getItem('audiomage-theme');
    return (saved as Theme) || 'nord-dark';
  });

  useEffect(() => {
    // Remove all theme classes first
    document.documentElement.classList.remove('nord-light', 'nord-dark');

    // Add the current theme class
    document.documentElement.classList.add(theme);

    // Save to localStorage
    localStorage.setItem('audiomage-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'nord-light' ? 'nord-dark' : 'nord-light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
