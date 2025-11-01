import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useData } from '../../context/DataContext';
import './SettingsPopup.css';
import CloseIcon from '@mui/icons-material/Close';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import WallpaperIcon from '@mui/icons-material/Wallpaper';
import ClearIcon from '@mui/icons-material/Clear';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import ShuffleIcon from '@mui/icons-material/Shuffle';
import ToggleSelector from '../ToggleSelector/ToggleSelector';

interface SettingsPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsPopup = ({
  isOpen,
  onClose
}: SettingsPopupProps) => {
  const { data, updateThemeSettings, toggleTheme, shuffleBackground } = useData();
  const themeSettings = data.themeSettings || { theme: 'light', backgroundImage: null, accentColor: '#4db6ac' };
  const { theme, backgroundImage, accentColor } = themeSettings;
  
  const isDarkMode = theme === 'dark';
  const [imageUrl, setImageUrl] = useState(backgroundImage || '');
  const [error, setError] = useState('');
  const [accentColorInput, setAccentColorInput] = useState(accentColor || '#4db6ac');
  const [colorError, setColorError] = useState('');
  const [isShuffling, setIsShuffling] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  // Preset colors that look good with the theme
  const presetColors = [
    { color: '#4db6ac', name: 'Teal' },
    { color: '#5c6bc0', name: 'Indigo' },
    { color: '#ec407a', name: 'Pink' },
    { color: '#7cb342', name: 'Light Green' },
    { color: '#ffb300', name: 'Amber' },
    { color: '#f44336', name: 'Red' }
  ];
  
  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setImageUrl(value);
    setError('');
    
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Auto-apply if URL is valid
    if (value.trim()) {
      // Debounce the validation and application
      timeoutRef.current = setTimeout(() => {
        // Simple URL validation
        const isValidUrl = /^(http|https):\/\/[^ "]+$/.test(value);
        if (!isValidUrl) {
          setError('Please enter a valid URL starting with http:// or https://');
          return;
        }
        
        // Check if it's an image URL (basic check)
        const isImageUrl = /\.(jpeg|jpg|gif|png|webp)(\?.*)?$/i.test(value);
        if (!isImageUrl) {
          // Try to validate URL is an image
          const img = new Image();
          img.onload = () => {
            updateThemeSettings({ backgroundImage: value });
            setError('');
          };
          img.onerror = () => {
            setError('The URL does not appear to be a valid image');
          };
          img.src = value;
        } else {
          updateThemeSettings({ backgroundImage: value });
          setError('');
        }
      }, 1000);
    } else {
      updateThemeSettings({ backgroundImage: null });
    }
  };
  
  const clearBackgroundImage = () => {
    setImageUrl('');
    updateThemeSettings({ backgroundImage: null });
    setError('');
  };
  
  const handleAccentColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAccentColorInput(e.target.value);
    setColorError('');
    
    // Try to apply the color immediately if it's valid
    if (isValidCSSColor(e.target.value)) {
      updateThemeSettings({ accentColor: e.target.value });
    }
  };
  
  const handleColorPickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setAccentColorInput(newColor);
    setColorError('');
    updateThemeSettings({ accentColor: newColor });
  };
  
  const handlePresetColorClick = (color: string) => {
    setAccentColorInput(color);
    setColorError('');
    updateThemeSettings({ accentColor: color });
  };
  
  // Function to check if a color is valid
  const isValidCSSColor = (color: string): boolean => {
    try {
      const tempEl = document.createElement("div");
      tempEl.style.color = color;
      return tempEl.style.color !== "";
    } catch {
      return false;
    }
  };
  
  const handleClose = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    onClose();
  };
  
  if (!isOpen) return null;
  
  const modalContent = (
    <div className={`settings-popup ${isOpen ? 'active' : ''} ${isDarkMode ? 'dark-theme' : 'light-theme'}`}>
      <div className="settings-popup-content">
        <div className="settings-header">
          <h2>Settings</h2>
          <button 
            className="settings-close-btn" 
            onClick={handleClose}
            aria-label="Close settings"
          >
            <CloseIcon />
          </button>
        </div>
        
        <div className="settings-section">
          <h3>Theme</h3>
          <ToggleSelector
            options={[
              { value: 'light', label: 'Light', icon: <LightModeIcon /> },
              { value: 'dark', label: 'Dark', icon: <DarkModeIcon /> }
            ]}
            value={theme}
            onChange={(value) => {
              if (value !== theme) {
                toggleTheme();
              }
            }}
            name="theme-selector"
          />
        </div>
        
        <div className="settings-section">
          <h3>Accent Color</h3>
          <div className="accent-color-control">
            <div className="color-input-wrapper">
              <ColorLensIcon className="input-icon" />
              <input
                type="text"
                value={accentColorInput}
                onChange={handleAccentColorChange}
                placeholder="Color name or hex code"
                className={`color-text-input ${colorError ? 'error' : ''}`}
              />
              <input
                type="color"
                value={accentColorInput.startsWith('#') ? accentColorInput : '#4db6ac'}
                onChange={handleColorPickerChange}
                className="color-picker-input"
                aria-label="Select accent color"
              />
            </div>
            {colorError && <div className="error-message">{colorError}</div>}
            <div className="preset-colors">
              {presetColors.map((preset) => (
                <button
                  key={preset.color}
                  className={`preset-color-btn ${accentColorInput === preset.color ? 'active' : ''}`}
                  style={{ backgroundColor: preset.color }}
                  onClick={() => handlePresetColorClick(preset.color)}
                  title={preset.name}
                  aria-label={`Use ${preset.name} accent color`}
                />
              ))}
            </div>
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
              {(imageUrl || backgroundImage) && (
                <button 
                  className="clear-url-btn" 
                  onClick={clearBackgroundImage}
                  aria-label="Clear URL"
                >
                  <ClearIcon />
                </button>
              )}
            </div>
            <div className="background-action-buttons">
              <button 
                className={`shuffle-background-btn ${isShuffling ? 'loading' : ''}`}
                onClick={async () => {
                  console.log('Shuffle button clicked in main app');
                  setIsShuffling(true);
                  try {
                    await shuffleBackground();
                  } catch (error) {
                    console.error('Shuffle failed:', error);
                  } finally {
                    setIsShuffling(false);
                  }
                }}
                disabled={isShuffling}
                aria-label="Random Background"
              >
                <ShuffleIcon />
                <span>{isShuffling ? 'Shuffling...' : 'Random Background'}</span>
              </button>
            </div>
            {error && <div className="error-message">{error}</div>}
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
