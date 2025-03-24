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
  }, [data]);

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