// src/components/ui/ThemeProvider.tsx
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type ThemeType = 'modern' | 'professional' | 'vibrant' | 'minimal' | 'dark';

type ThemeContextType = {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  colorPalette: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const colorPalettes = {
  modern: {
    primary: '#4f46e5',
    secondary: '#7c3aed',
    accent: '#10b981',
    background: '#f9fafb',
    text: '#111827'
  },
  professional: {
    primary: '#2563eb',
    secondary: '#1d4ed8',
    accent: '#059669',
    background: '#ffffff',
    text: '#1f2937'
  },
  vibrant: {
    primary: '#db2777',
    secondary: '#e11d48',
    accent: '#f59e0b',
    background: '#fef2f2',
    text: '#1f2937'
  },
  minimal: {
    primary: '#6b7280',
    secondary: '#9ca3af',
    accent: '#d1d5db',
    background: '#ffffff',
    text: '#111827'
  },
  dark: {
    primary: '#8b5cf6',
    secondary: '#7c3aed',
    accent: '#10b981',
    background: '#1f2937',
    text: '#f9fafb'
  }
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeType>('modern');
  
  useEffect(() => {
    // Load theme from localStorage
    const savedTheme = localStorage.getItem('theme') as ThemeType;
    if (savedTheme && Object.keys(colorPalettes).includes(savedTheme)) {
      setTheme(savedTheme);
    }
  }, []);
  
  useEffect(() => {
    // Apply theme to document element
    Object.keys(colorPalettes).forEach(t => {
      document.documentElement.classList.remove(`theme-${t}`);
    });
    document.documentElement.classList.add(`theme-${theme}`);
    
    // Apply CSS variables
    const palette = colorPalettes[theme];
    document.documentElement.style.setProperty('--primary-color', palette.primary);
    document.documentElement.style.setProperty('--secondary-color', palette.secondary);
    document.documentElement.style.setProperty('--accent-color', palette.accent);
    document.documentElement.style.setProperty('--background', palette.background);
    document.documentElement.style.setProperty('--foreground', palette.text);
    
    // Save theme to localStorage
    localStorage.setItem('theme', theme);
  }, [theme]);
  
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
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
