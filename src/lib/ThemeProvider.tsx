import { createContext, useContext, useState, ReactNode } from 'react';

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

const themeOptions: ThemeOption[] = [
  {
    
    colors: {
      primary: '#0077be',
      secondary: '#00aaff',
      accent: '#ffcc00',
      background: '#f0f4f8',
      text: '#333333',
    },
    icon: '🌊',
  },
  {
    id: 'light-nautical',
    name: 'Light Nautical',
    colors: {
      primary: '#f0f4f8',
      secondary: '#0077be',
      accent: '#ffcc00',
      background: '#ffffff',
      text: '#333333',
    },
    icon: '⚓',
  },
];

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(themeOptions[0]); // Default to the first theme

  const toggleTheme = (themeId) => {
    const selectedTheme = themeOptions.find((t) => t.id === themeId);
    if (selectedTheme) {
      setTheme(selectedTheme);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  return useContext(ThemeContext);
};
