import { useState } from 'react';
import SettingsIcon from '@mui/icons-material/Settings';
import './App.css';
import { useData } from './context/DataContext';

// Import our modular components
import InfoSection from './components/InfoSection/InfoSection';
import LinksSection from './components/LinksSection/LinksSection';
import SettingsPopup from './components/SettingsPopup/SettingsPopup';

function App() {
  // Get all data from context
  const { data, updateLinkGroups, updateLinkSettings } = useData();
  
  // Use default values if properties are undefined
  const linkGroups = data.linkGroups || [];
  const linkSettings = data.linkSettings || { displayMode: 'both', linksPerRow: 4 };
  const themeSettings = data.themeSettings || { theme: 'light', backgroundImage: null };
  
  const { displayMode: linkDisplayMode, linksPerRow } = linkSettings;
  const { theme, backgroundImage } = themeSettings;
  
  // Derive dark mode from theme
  const isDarkMode = theme === 'dark';
  
  // UI state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Create container style with background image if present
  const containerStyle = backgroundImage ? {
    backgroundImage: `url(${backgroundImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat'
  } : {};

  return (
    <div 
      className={`fluxor-container ${isDarkMode ? 'dark-theme' : 'light-theme'} ${backgroundImage ? 'has-bg-image' : ''}`}
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
            setLinkGroups={updateLinkGroups}
            setLinkDisplayMode={(mode) => updateLinkSettings({ displayMode: mode })}
            linksPerRow={linksPerRow}
            setLinksPerRow={(count) => updateLinkSettings({ linksPerRow: count })}
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
