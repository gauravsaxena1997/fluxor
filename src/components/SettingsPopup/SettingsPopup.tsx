import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useData } from '../../context/DataContext';
import './SettingsPopup.css';
import CloseIcon from '@mui/icons-material/Close';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import WallpaperIcon from '@mui/icons-material/Wallpaper';
import ClearIcon from '@mui/icons-material/Clear';

interface SettingsPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsPopup = ({
  isOpen,
  onClose
}: SettingsPopupProps) => {
  const { data, updateThemeSettings, toggleTheme } = useData();
  const themeSettings = data.themeSettings || { theme: 'light', backgroundImage: null };
  const { theme, backgroundImage } = themeSettings;
  
  const isDarkMode = theme === 'dark';
  const [imageUrl, setImageUrl] = useState(backgroundImage || '');
  const [error, setError] = useState('');
  
  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageUrl(e.target.value);
    setError('');
  };
  
  const applyBackgroundImage = () => {
    if (!imageUrl.trim()) {
      updateThemeSettings({ backgroundImage: null });
      return;
    }
    
    // Simple URL validation
    const isValidUrl = /^(http|https):\/\/[^ "]+$/.test(imageUrl);
    if (!isValidUrl) {
      setError('Please enter a valid URL starting with http:// or https://');
      return;
    }
    
    // Check if it's an image URL (basic check)
    const isImageUrl = /\.(jpeg|jpg|gif|png|webp)(\?.*)?$/i.test(imageUrl);
    if (!isImageUrl) {
      // Try to validate URL is an image
      const img = new Image();
      img.onload = () => {
        updateThemeSettings({ backgroundImage: imageUrl });
        setError('');
      };
      img.onerror = () => {
        setError('The URL does not appear to be a valid image');
      };
      img.src = imageUrl;
    } else {
      updateThemeSettings({ backgroundImage: imageUrl });
      setError('');
    }
  };
  
  const clearBackgroundImage = () => {
    setImageUrl('');
    updateThemeSettings({ backgroundImage: null });
    setError('');
  };
  
  if (!isOpen) return null;
  
  const modalContent = (
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
        
        <div className="settings-section">
          <h3>Background Image</h3>
          <div className="background-image-control">
            <div className="image-url-input-wrapper">
              <WallpaperIcon className="input-icon" />
              <input
                type="text"
                value={imageUrl}
                onChange={handleImageUrlChange}
                placeholder="Paste image URL from web"
                className={`image-url-input ${error ? 'error' : ''}`}
              />
              {imageUrl && (
                <button 
                  className="clear-url-btn" 
                  onClick={clearBackgroundImage}
                  aria-label="Clear URL"
                >
                  <ClearIcon />
                </button>
              )}
            </div>
            {error && <div className="error-message">{error}</div>}
            <div className="image-controls">
              <button 
                className="apply-image-btn" 
                onClick={applyBackgroundImage}
                disabled={!imageUrl.trim() && !backgroundImage}
              >
                Apply
              </button>
              {backgroundImage && (
                <button 
                  className="remove-image-btn" 
                  onClick={clearBackgroundImage}
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  
  // Create portal to render at document body level
  return createPortal(
    modalContent,
    document.body
  );
};

export default SettingsPopup;
