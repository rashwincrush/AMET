'use client';

import { ReactNode, useState, useEffect, createContext, useContext } from 'react';

type ThemeOption = {
  id: string;
  name: string;
  icon: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
};

// Single theme option
const themeOptions: ThemeOption[] = [
  {
    id: 'ocean-blue',
    name: 'White Theme',
    icon: '⚪',
    colors: {
      primary: '#333333',
      secondary: '#666666',
      accent: '#b71c1c',
      background: '#ffffff',
      text: '#333333'
    }
  }
];

// Create the theme context
const ThemeContext = createContext<{
  currentThemeId: string;
  themeOptions: ThemeOption[];
  setTheme: (themeId: string) => void;
}>({
  currentThemeId: 'ocean-blue',
  themeOptions,
  setTheme: () => {}
});

type SimpleThemeProviderProps = {
  children: ReactNode;
  defaultTheme?: string;
};

export  function SimpleThemeProvider({ 
  children
}: SimpleThemeProviderProps) {
  // Always use the single theme
  const currentThemeId = themeOptions[0].id;
  
  const applyTheme = (themeId: string) => {
    const theme = themeOptions.find(t => t.id === themeId) || themeOptions[0];
    const root = document.documentElement;
    root.style.setProperty('--primary-color', theme.colors.primary);
    root.style.setProperty('--secondary-color', theme.colors.secondary);
    root.style.setProperty('--accent-color', theme.colors.accent);
    root.style.setProperty('--background', theme.colors.background);
    root.style.setProperty('--foreground', theme.colors.text);
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      applyTheme(currentThemeId);
      localStorage.setItem('theme-id', currentThemeId);
    }
  }, [currentThemeId]);

  // No-op setTheme function since we only have one theme
  const setTheme = (themeId: string) => {
    // Do nothing as we only have one theme
    return;
  };
  
  return (
    <ThemeContext.Provider value={{ currentThemeId, themeOptions, setTheme }}>
      <div className="transition-colors duration-500" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

// Hook to use the theme
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a SimpleThemeProvider');
  }
  return context;
}

// Empty ThemeSelector component since we don't need theme selection anymore
export function ThemeSelector() {
  return null;
}