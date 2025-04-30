'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getTailwindColor } from './tailwindColorMap';

type ThemeColor = {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
};

type ThemeOption = {
  id: string;
  name: string;
  colors: ThemeColor;
  icon: string;
};

type OceanThemeContextType = {
  currentTheme: ThemeOption;
  themeOptions: ThemeOption[];
  setTheme: (themeId: string) => void;
  applyThemeClass: (baseClass: string) => string;
  themeVariables: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
  };
};

// Modern themed color schemes
const themeOptions: ThemeOption[] = [
  {
    id: 'modernMint',
    name: 'Modern Mint',
    icon: '🌱',
    colors: {
      primary: 'from-emerald-500 to-emerald-700',
      secondary: 'from-teal-400 to-teal-600',
      accent: 'amber-400',
      background: 'bg-slate-50',
      text: 'text-slate-800'
    }
  },
  {
    id: 'purpleHaze',
    name: 'Purple Haze',
    icon: '💜',
    colors: {
      primary: 'from-purple-500 to-purple-700',
      secondary: 'from-indigo-400 to-indigo-600',
      accent: 'amber-400',
      background: 'bg-slate-50',
      text: 'text-slate-800'
    }
  },
  {
    id: 'sunsetOrange',
    name: 'Sunset Orange',
    icon: '🌅',
    colors: {
      primary: 'from-orange-500 to-orange-700',
      secondary: 'from-amber-400 to-amber-600',
      accent: 'gray-400',
      background: 'bg-slate-50',
      text: 'text-slate-800'
    }
  },
  {
    id: 'nightMode',
    name: 'Night Mode',
    icon: '🌙',
    colors: {
      primary: 'from-slate-600 to-slate-800',
      secondary: 'from-slate-400 to-slate-600',
      accent: 'amber-400',
      background: 'bg-slate-900',
      text: 'text-white'
    }
  },
  {
    id: 'skyPrimary',
    name: 'Sky Primary',
    icon: '☁️',
    colors: {
      primary: 'from-primary-400 to-primary-600',
      secondary: 'from-cyan-300 to-cyan-500',
      accent: 'amber-400',
      background: 'bg-slate-50',
      text: 'text-slate-800'
    }
  }
];

// Create the context
const OceanThemeContext = createContext<OceanThemeContextType | undefined>(undefined);

// Custom hook to use the theme context
export const useOceanTheme = () => {
  const context = useContext(OceanThemeContext);
  if (context === undefined) {
    throw new Error('useOceanTheme must be used within an OceanThemeProvider');
  }
  return context;
};

type OceanThemeProviderProps = {
  children: ReactNode;
  defaultTheme?: string;
};

export function OceanThemeProvider({
  children,
  defaultTheme = 'modernMint'
}: OceanThemeProviderProps) {
  const [currentThemeId, setCurrentThemeId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('ocean-theme-id');
      return savedTheme && themeOptions.some(t => t.id === savedTheme) 
        ? savedTheme 
        : defaultTheme;
    }
    return defaultTheme;
  });
  
  const currentTheme = themeOptions.find(t => t.id === currentThemeId) || themeOptions[0];
  
  // Function to apply theme classes to an element
  const applyThemeClass = (baseClass: string): string => {
    // Add theme-specific classes to the base class
    return `${baseClass} ${currentTheme.colors.background}`;
  };
  
  // Extract color values for CSS variables
  const extractColorValue = (colorClass: string): string => {
    // If it's a gradient (contains 'from-' and 'to-'), extract the 'from-' part
    if (colorClass.includes('from-')) {
      const fromPart = colorClass.split(' ').find(c => c.startsWith('from-'));
      return fromPart ? getTailwindColor(fromPart.replace('from-', '')) : '';
    }
    // Otherwise, just get the color directly
    return getTailwindColor(colorClass.replace('bg-', '').replace('text-', ''));
  };
  
  // Theme variables for CSS
  const themeVariables = {
    primary: extractColorValue(currentTheme.colors.primary),
    secondary: extractColorValue(currentTheme.colors.secondary),
    accent: getTailwindColor(currentTheme.colors.accent),
    background: getTailwindColor(currentTheme.colors.background.replace('bg-', '')),
    foreground: getTailwindColor(currentTheme.colors.text.replace('text-', ''))
  };
  
  // Apply theme as CSS variables
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const root = document.documentElement;
      root.style.setProperty('--primary', themeVariables.primary);
      root.style.setProperty('--secondary', themeVariables.secondary);
      root.style.setProperty('--accent', themeVariables.accent);
      root.style.setProperty('--background', themeVariables.background);
      root.style.setProperty('--foreground', themeVariables.foreground);
      
      // Save theme preference
      localStorage.setItem('ocean-theme-id', currentThemeId);
    }
  }, [currentThemeId, themeVariables]);
  
  // Function to set the theme
  const setTheme = (themeId: string) => {
    if (themeOptions.some(theme => theme.id === themeId)) {
      setCurrentThemeId(themeId);
    }
  };
  
  // Context value
  const contextValue: OceanThemeContextType = {
    currentTheme,
    themeOptions,
    setTheme,
    applyThemeClass,
    themeVariables
  };
  
  return (
    <OceanThemeContext.Provider value={contextValue}>
      <div className="transition-colors duration-500" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>
        {children}
      </div>
    </OceanThemeContext.Provider>
  );
}