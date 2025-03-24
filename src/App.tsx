import { useState, useEffect } from 'react';
import SettingsIcon from '@mui/icons-material/Settings';
import './App.css';
import './light-mode-fixes.css';
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
  const { isDarkMode, backgroundImage } = useTheme();
  
  // UI state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Clear existing saved links on first load
  useEffect(() => {
    localStorage.removeItem('linkGroups');
  }, []);
  
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

  // Create container style with background image if present
  const containerStyle = backgroundImage ? {
    backgroundImage: `url(${backgroundImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat'
  } : {};

  return (
    <div 
      className={`new-tab-container ${isDarkMode ? 'dark-theme' : 'light-theme'} ${backgroundImage ? 'has-bg-image' : ''}`}
      style={containerStyle}
    >
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
