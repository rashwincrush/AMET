'use client';

import { ReactNode, useState, useEffect, createContext, useContext } from 'react';
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

type UnifiedThemeContextType = {
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
    id: 'pureWhite',
    name: 'Pure White',
    icon: '⚪',
    colors: {
      primary: 'from-blue-500 to-blue-600',
      secondary: 'from-blue-400 to-blue-500',
      accent: 'blue-500',
      background: 'bg-white',
      text: 'text-gray-800'
    }
  },
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
      accent: 'blue-400',
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
    id: 'skyBlue',
    name: 'Sky Blue',
    icon: '☁️',
    colors: {
      primary: 'from-blue-400 to-blue-600',
      secondary: 'from-cyan-300 to-cyan-500',
      accent: 'amber-400',
      background: 'bg-slate-50',
      text: 'text-slate-800'
    }
  }
];

// Create the context
const UnifiedThemeContext = createContext<UnifiedThemeContextType | undefined>(undefined);

// Custom hook to use the theme context
export const useTheme = () => {
  const context = useContext(UnifiedThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a UnifiedThemeProvider');
  }
  return context;
};

type UnifiedThemeProviderProps = {
  children: ReactNode;
  defaultTheme?: string;
};

export function UnifiedThemeProvider({
  children,
  defaultTheme = 'pureWhite'
}: UnifiedThemeProviderProps) {
  const [currentThemeId, setCurrentThemeId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      // Try to get theme from localStorage, checking both previous storage keys
      const savedTheme = localStorage.getItem('ocean-theme-id') || 
                         localStorage.getItem('theme-id') || 
                         localStorage.getItem('theme');
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
      
      // Set CSS variables for both naming conventions to ensure compatibility
      // with components using either provider
      
      // OceanThemeProvider style variables
      root.style.setProperty('--primary', themeVariables.primary);
      root.style.setProperty('--secondary', themeVariables.secondary);
      root.style.setProperty('--accent', themeVariables.accent);
      root.style.setProperty('--background', themeVariables.background);
      root.style.setProperty('--foreground', themeVariables.foreground);
      
      // SimpleThemeProvider style variables
      root.style.setProperty('--primary-color', themeVariables.primary);
      root.style.setProperty('--secondary-color', themeVariables.secondary);
      root.style.setProperty('--accent-color', themeVariables.accent);
      
      // Save theme preference using a unified key
      localStorage.setItem('unified-theme-id', currentThemeId);
    }
  }, [currentThemeId, themeVariables]);
  
  // Function to set the theme
  const setTheme = (themeId: string) => {
    if (themeOptions.some(theme => theme.id === themeId)) {
      setCurrentThemeId(themeId);
    }
  };
  
  // Context value
  const contextValue: UnifiedThemeContextType = {
    currentTheme,
    themeOptions,
    setTheme,
    applyThemeClass,
    themeVariables
  };
  
  return (
    <UnifiedThemeContext.Provider value={contextValue}>
      <div className="transition-colors duration-500" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>
        {children}
      </div>
    </UnifiedThemeContext.Provider>
  );
}

// ThemeSelector component for selecting themes
export function ThemeSelector() {
  const { currentTheme, themeOptions, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Only render the selector after component has mounted to prevent hydration errors
  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render anything until after hydration to prevent mismatch
  if (!mounted) return null;

  return (
    <div className="flex flex-wrap gap-2 p-3 bg-black/30 backdrop-blur-md rounded-lg shadow-lg border border-white/20">
      {themeOptions.map((theme) => {
        // Extract gradient colors for the button background
        let gradientStart = '';
        let gradientEnd = '';
        
        if (theme.colors.primary.includes('from-')) {
          const fromPart = theme.colors.primary.split(' ').find(c => c.startsWith('from-'));
          const toPart = theme.colors.primary.split(' ').find(c => c.startsWith('to-'));
          
          gradientStart = fromPart ? fromPart.replace('from-', '') : 'gray-500';
          gradientEnd = toPart ? toPart.replace('to-', '') : 'gray-700';
        }
        
        return (
          <button
            key={theme.id}
            onClick={() => setTheme(theme.id)}
            className={`flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ${
              currentTheme.id === theme.id ? 'ring-2 ring-amber-400 scale-110 shadow-lg' : 'opacity-70 hover:opacity-100 hover:shadow-md'
            }`}
            style={{
              background: theme.id === currentTheme.id 
                ? `linear-gradient(to right, var(--primary), var(--secondary))` 
                : `linear-gradient(to right, ${getTailwindColor(gradientStart)}, ${getTailwindColor(gradientEnd)})`,
              color: theme.colors.text.includes('white') ? 'white' : 'black'
            }}
            title={theme.name}
          >
            <span className="text-lg">{theme.icon}</span>
            {currentTheme.id === theme.id && (
              <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}