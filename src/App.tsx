import { useState, useEffect } from 'react';
import SettingsIcon from '@mui/icons-material/Settings';
import './App.css';
import { useTheme } from './context/ThemeContext';

// Import our modular components
import InfoSection from './components/InfoSection/InfoSection';
import LinksSection from './components/LinksSection/LinksSection';
import SettingsPopup from './components/SettingsPopup/SettingsPopup';

// Define link types
interface QuickLink {
  id: string;
  name: string;
  url: string;
  icon: string;
}

interface LinkGroup {
  id: string;
  name: string;
  links: QuickLink[];
}

// Define display mode type
type LinkDisplayMode = 'icon-only' | 'name-only' | 'both';

function App() {
  // Get theme from context
  const { isDarkMode } = useTheme();
  
  // UI state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Link groups state
  const [linkGroups, setLinkGroups] = useState<LinkGroup[]>(() => {
    const savedGroups = localStorage.getItem('linkGroups');
    if (savedGroups) {
      return JSON.parse(savedGroups);
    }
    
    // Default link groups if none are stored
    return [
      {
        id: '1',
        name: 'Social Media',
        links: [
          { id: '1-1', name: 'Twitter', url: 'https://twitter.com', icon: 'twitter' },
          { id: '1-2', name: 'Facebook', url: 'https://facebook.com', icon: 'facebook' },
          { id: '1-3', name: 'LinkedIn', url: 'https://linkedin.com', icon: 'linkedin' },
        ]
      },
      {
        id: '2',
        name: 'Productivity',
        links: [
          { id: '2-1', name: 'Gmail', url: 'https://gmail.com', icon: 'email' },
          { id: '2-2', name: 'Google Drive', url: 'https://drive.google.com', icon: 'folder' },
          { id: '2-3', name: 'Calendar', url: 'https://calendar.google.com', icon: 'event' },
        ]
      },
      {
        id: '3',
        name: 'Entertainment',
        links: [
          { id: '3-1', name: 'YouTube', url: 'https://youtube.com', icon: 'youtube' },
          { id: '3-2', name: 'Netflix', url: 'https://netflix.com', icon: 'movie' },
          { id: '3-3', name: 'Spotify', url: 'https://spotify.com', icon: 'music_note' },
        ]
      }
    ];
  });
  
  // Link display mode state
  const [linkDisplayMode, setLinkDisplayMode] = useState<LinkDisplayMode>(() => {
    const savedMode = localStorage.getItem('linkDisplayMode');
    return (savedMode as LinkDisplayMode) || 'both';
  });

  // Links per row state (default: 4, min: 1, max: 6)
  const [linksPerRow, setLinksPerRow] = useState<number>(() => {
    const savedCount = localStorage.getItem('linksPerRow');
    return savedCount ? parseInt(savedCount, 10) : 4;
  });

  // Save link groups when they change
  useEffect(() => {
    localStorage.setItem('linkGroups', JSON.stringify(linkGroups));
  }, [linkGroups]);
  
  // Save link display mode when it changes
  useEffect(() => {
    localStorage.setItem('linkDisplayMode', linkDisplayMode);
  }, [linkDisplayMode]);

  // Save links per row to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('linksPerRow', linksPerRow.toString());
  }, [linksPerRow]);

  return (
    <div className={`new-tab-container ${isDarkMode ? 'dark-theme' : 'light-theme'}`}>
      {/* App Controls - Settings and Edit Icons */}
      <div className="app-controls">
        <button 
          onClick={() => setIsSettingsOpen(!isSettingsOpen)}
          className="settings-toggle-btn"
          aria-label="Settings"
        >
          <SettingsIcon />
        </button>
      </div>

      <div className="content-wrapper">
        {/* Info Section with time and search */}
        <InfoSection />

        {/* Main container for Links and future features */}
        <div className="home-container">
          {/* Quick links (takes 50% width) */}
          <LinksSection 
            linkGroups={linkGroups}
            linkDisplayMode={linkDisplayMode}
            setLinkGroups={setLinkGroups}
            setLinkDisplayMode={setLinkDisplayMode}
            linksPerRow={linksPerRow}
            setLinksPerRow={setLinksPerRow}
          />
          
          {/* Future features will go here (right 50% of the screen) */}
          <div className="future-features-area">
            {/* This area is intentionally left empty for future features */}
          </div>
        </div>
      </div>

      {/* Settings Popup */}
      <SettingsPopup 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}

export default App;
