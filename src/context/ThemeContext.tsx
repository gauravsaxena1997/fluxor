import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

type ThemeType = 'light' | 'dark';

interface ThemeContextType {
  theme: ThemeType;
  toggleTheme: () => void;
  isDarkMode: boolean;
  backgroundImage: string | null;
  setBackgroundImage: (url: string | null) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Get initial theme from localStorage or default to 'light'
  const [theme, setTheme] = useState<ThemeType>(() => {
    const savedTheme = localStorage.getItem('fluxor-theme');
    return (savedTheme as ThemeType) || 'light';
  });

  // Get initial background image from localStorage
  const [backgroundImage, setBackgroundImage] = useState<string | null>(() => {
    const savedBgImage = localStorage.getItem('fluxor-bg-image');
    return savedBgImage || null;
  });

  const isDarkMode = theme === 'dark';

  // Update localStorage and document body class when theme changes
  useEffect(() => {
    localStorage.setItem('fluxor-theme', theme);
    document.body.className = theme === 'dark' ? 'dark-theme' : 'light-theme';
  }, [theme]);

  // Update localStorage and apply background image when it changes
  useEffect(() => {
    if (backgroundImage) {
      localStorage.setItem('fluxor-bg-image', backgroundImage);
    } else {
      localStorage.removeItem('fluxor-bg-image');
    }
  }, [backgroundImage]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const value = {
    theme,
    toggleTheme,
    isDarkMode,
    backgroundImage,
    setBackgroundImage
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
