import { useTheme } from '../../context/ThemeContext';
import './SettingsPopup.css';
import CloseIcon from '@mui/icons-material/Close';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';

interface SettingsPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsPopup = ({
  isOpen,
  onClose
}: SettingsPopupProps) => {
  const { isDarkMode, toggleTheme } = useTheme();
  
  return (
    <div className={`settings-popup ${isOpen ? 'active' : ''} ${isDarkMode ? 'dark-theme' : 'light-theme'}`}>
      <div className="settings-popup-content">
        <div className="settings-header">
          <h2>Settings</h2>
          <button 
            className="settings-close-btn" 
            onClick={onClose}
            aria-label="Close settings"
          >
            <CloseIcon />
          </button>
        </div>
        
        <div className="settings-section">
          <h3>Theme</h3>
          <div className="theme-toggle">
            <button 
              className={`theme-option ${!isDarkMode ? 'active' : ''}`}
              onClick={() => !isDarkMode || toggleTheme()}
              aria-label="Light theme"
            >
              <LightModeIcon className="theme-icon" /> Light
            </button>
            <button 
              className={`theme-option ${isDarkMode ? 'active' : ''}`}
              onClick={() => isDarkMode || toggleTheme()}
              aria-label="Dark theme"
            >
              <DarkModeIcon className="theme-icon" /> Dark
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPopup;
