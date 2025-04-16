'use client';

import { useState, useEffect } from 'react';
import { useOceanTheme } from './OceanThemeProvider';
import { getTailwindColor } from './tailwindColorMap';

export  function ThemeSelector() {
  const { currentTheme, themeOptions, setTheme } = useOceanTheme();
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