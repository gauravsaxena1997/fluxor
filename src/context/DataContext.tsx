import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Storage key for all application data
const STORAGE_KEY = 'flux';

// Define the data structure
interface LinkItem {
  id: string;
  name: string;
  url: string;
  icon: string;
}

interface LinkGroup {
  id: string;
  name: string;
  links: LinkItem[];
}

type LinkDisplayMode = 'icon-only' | 'name-only' | 'both';
type ThemeType = 'light' | 'dark';

// Define the structure for all application data
interface AppData {
  themeSettings: {
    theme: ThemeType;
    backgroundImage: string | null;
    accentColor: string;
  };
  linkSettings: {
    displayMode: LinkDisplayMode;
    linksPerRow: number;
  };
  linkGroups: LinkGroup[];
}

// Create default data
const defaultData: AppData = {
  themeSettings: {
    theme: 'light',
    backgroundImage: null,
    accentColor: '#4db6ac',
  },
  linkSettings: {
    displayMode: 'both',
    linksPerRow: 4,
  },
  linkGroups: [
    {
      id: '1',
      name: 'Basics',
      links: [
        { id: '1-1', name: 'Gmail', url: 'https://gmail.com', icon: 'email' },
        { id: '1-2', name: 'Calendar', url: 'https://calendar.google.com', icon: 'event' },
        { id: '1-3', name: 'YouTube', url: 'https://youtube.com', icon: 'youtube' },
        { id: '1-4', name: 'LinkedIn', url: 'https://linkedin.com', icon: 'linkedin' },
        { id: '1-5', name: 'Drive', url: 'https://drive.google.com', icon: 'folder' },
      ]
    },
    {
      id: '2',
      name: 'Job',
      links: [
        { id: '2-1', name: 'Naukri', url: 'https://naukri.com', icon: 'work' },
        { id: '2-2', name: 'Instahire', url: 'https://instahire.com', icon: 'person_search' },
        { id: '2-3', name: 'FoundIt', url: 'https://foundit.in', icon: 'search' },
      ]
    },
    {
      id: '3',
      name: 'Dev',
      links: [
        { id: '3-1', name: 'GitHub', url: 'https://github.com', icon: 'github' },
        { id: '3-2', name: 'CodeSandbox', url: 'https://codesandbox.io', icon: 'dashboard' },
      ]
    },
    {
      id: '4',
      name: 'AI',
      links: [
        { id: '4-1', name: 'ChatGPT', url: 'https://chat.openai.com', icon: 'chat' },
        { id: '4-2', name: 'Google AI Studio', url: 'https://makersuite.google.com', icon: 'auto_awesome' },
        { id: '4-2', name: 'DeepSeek', url: 'https://chat.deepseek.com', icon: 'auto_awesome' },
        { id: '4-3', name: 'Cursor', url: 'https://cursor.sh', icon: 'edit' },
      ]
    }
  ]
};

// Interface for the context value
interface DataContextType {
  data: AppData;
  updateLinkGroups: (groups: LinkGroup[]) => void;
  updateLinkSettings: (settings: Partial<AppData['linkSettings']>) => void;
  updateThemeSettings: (settings: Partial<AppData['themeSettings']>) => void;
  toggleTheme: () => void;
}

// Create the context with default values
const DataContext = createContext<DataContextType>({
  data: defaultData,
  updateLinkGroups: () => {},
  updateLinkSettings: () => {},
  updateThemeSettings: () => {},
  toggleTheme: () => {},
});

// Provider component
interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  // Initialize state from localStorage or default values
  const [data, setData] = useState<AppData>(() => {
    try {
      const storedData = localStorage.getItem(STORAGE_KEY);
      
      // If data exists in localStorage, use it
      if (storedData) {
        return JSON.parse(storedData);
      }
      
      // Otherwise check if we have legacy data to migrate
      const legacyLinkGroups = localStorage.getItem('linkGroups');
      const legacyDisplayMode = localStorage.getItem('linkDisplayMode');
      const legacyLinksPerRow = localStorage.getItem('linksPerRow');
      const legacyTheme = localStorage.getItem('fluxor-theme');
      const legacyBgImage = localStorage.getItem('fluxor-bg-image');
      
      // If we have legacy data, migrate it to the new format
      if (legacyLinkGroups || legacyDisplayMode || legacyLinksPerRow || legacyTheme || legacyBgImage) {
        const migratedData = { ...defaultData };
        
        if (legacyLinkGroups) {
          migratedData.linkGroups = JSON.parse(legacyLinkGroups);
        }
        
        if (legacyDisplayMode) {
          migratedData.linkSettings.displayMode = legacyDisplayMode as LinkDisplayMode;
        }
        
        if (legacyLinksPerRow) {
          migratedData.linkSettings.linksPerRow = parseInt(legacyLinksPerRow, 10);
        }

        if (legacyTheme) {
          migratedData.themeSettings.theme = legacyTheme as ThemeType;
        }

        if (legacyBgImage) {
          migratedData.themeSettings.backgroundImage = legacyBgImage;
        }
        
        return migratedData;
      }
      
      // If no data exists, return the default data
      return defaultData;
    } catch (error) {
      console.error('Error loading data from localStorage:', error);
      return defaultData;
    }
  });

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    
    // Apply accent color to CSS root variable
    document.documentElement.style.setProperty('--accent-color', data.themeSettings.accentColor);
    // Also derive and set the hover color (slightly darker)
    const darkerAccent = adjustColorBrightness(data.themeSettings.accentColor, -10);
    document.documentElement.style.setProperty('--accent-hover', darkerAccent);
  }, [data]);

  // Helper function to darken/lighten a color
  const adjustColorBrightness = (color: string, percent: number): string => {
    try {
      // For named colors, convert to hex first
      if (!/^#/.test(color)) {
        const tempEl = document.createElement("div");
        tempEl.style.color = color;
        document.body.appendChild(tempEl);
        const computedColor = getComputedStyle(tempEl).color;
        document.body.removeChild(tempEl);
        
        // RGB format like "rgb(r, g, b)" or "rgba(r, g, b, a)"
        if (computedColor.startsWith("rgb")) {
          const rgbValues = computedColor.match(/\d+/g);
          if (rgbValues && rgbValues.length >= 3) {
            const r = parseInt(rgbValues[0]);
            const g = parseInt(rgbValues[1]);
            const b = parseInt(rgbValues[2]);
            color = rgbToHex(r, g, b);
          }
        }
      }
      
      // Now we have a hex color
      let r = parseInt(color.substring(1, 3), 16);
      let g = parseInt(color.substring(3, 5), 16);
      let b = parseInt(color.substring(5, 7), 16);

      r = Math.max(0, Math.min(255, r + (percent * 2.55)));
      g = Math.max(0, Math.min(255, g + (percent * 2.55)));
      b = Math.max(0, Math.min(255, b + (percent * 2.55)));

      return `#${Math.round(r).toString(16).padStart(2, '0')}${Math.round(g).toString(16).padStart(2, '0')}${Math.round(b).toString(16).padStart(2, '0')}`;
    } catch (e) {
      console.error("Error adjusting color brightness:", e);
      return color; // Return original if there's an error
    }
  };

  // Convert RGB to Hex
  const rgbToHex = (r: number, g: number, b: number): string => {
    return `#${[r, g, b].map(x => Math.round(x).toString(16).padStart(2, '0')).join('')}`;
  };

  // Update document body class when theme changes
  useEffect(() => {
    // Ensure themeSettings exists before accessing it
    if (data && data.themeSettings && data.themeSettings.theme) {
      document.body.className = data.themeSettings.theme === 'dark' ? 'dark-theme' : 'light-theme';
    } else {
      // Default to light theme if themeSettings is undefined
      document.body.className = 'light-theme';
    }
  }, [data.themeSettings?.theme]);

  // Update link groups
  const updateLinkGroups = (groups: LinkGroup[]) => {
    setData(prevData => ({
      ...prevData,
      linkGroups: groups,
    }));
  };

  // Update link settings
  const updateLinkSettings = (settings: Partial<AppData['linkSettings']>) => {
    setData(prevData => ({
      ...prevData,
      linkSettings: {
        ...prevData.linkSettings,
        ...settings,
      },
    }));
  };

  // Update theme settings
  const updateThemeSettings = (settings: Partial<AppData['themeSettings']>) => {
    setData(prevData => ({
      ...prevData,
      themeSettings: {
        ...prevData.themeSettings,
        ...settings,
      },
    }));
  };

  // Toggle theme helper function
  const toggleTheme = () => {
    updateThemeSettings({
      theme: data.themeSettings?.theme === 'light' ? 'dark' : 'light'
    });
  };

  // Clear legacy storage items after migration
  useEffect(() => {
    // Run only once after initial data load
    localStorage.removeItem('linkGroups');
    localStorage.removeItem('linkDisplayMode');
    localStorage.removeItem('linksPerRow');
    localStorage.removeItem('fluxor-theme');
    localStorage.removeItem('fluxor-bg-image');
  }, []);

  // Provide the context value
  const contextValue: DataContextType = {
    data,
    updateLinkGroups,
    updateLinkSettings,
    updateThemeSettings,
    toggleTheme,
  };

  return (
    <DataContext.Provider value={contextValue}>
      {children}
    </DataContext.Provider>
  );
};

// Custom hook for using the context
export const useData = () => useContext(DataContext);

export type { LinkItem, LinkGroup, LinkDisplayMode, ThemeType, AppData }; 