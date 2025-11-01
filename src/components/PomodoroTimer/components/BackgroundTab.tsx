import React, { useState } from 'react';
import ShuffleIcon from '@mui/icons-material/Shuffle';
import LinkIcon from '@mui/icons-material/Link';
import PaletteIcon from '@mui/icons-material/Palette';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import type { BackgroundSection } from '../types';

interface BackgroundTabProps {
  currentBackground: string;
  onBackgroundChange: (backgroundUrl: string) => void;
  keywords: string;
  activeSection: BackgroundSection;
  onChangeKeywords: (keywords: string) => void;
  onChangeActiveSection: (section: BackgroundSection) => void;
}

export const BackgroundTab: React.FC<BackgroundTabProps> = ({
  currentBackground,
  onBackgroundChange,
  keywords,
  activeSection,
  onChangeKeywords,
  onChangeActiveSection,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [customUrl, setCustomUrl] = useState('');

  // Preset gradient backgrounds
  const presetBackgrounds = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
    'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
    'linear-gradient(135deg, #fad0c4 0%, #ffd1ff 100%)',
    'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    'linear-gradient(135deg, #ff8a80 0%, #ea80fc 100%)',
    'linear-gradient(135deg, #8fd3f4 0%, #84fab0 100%)',
  ];

  // Get random background using dynamic keywords
  const getRandomBackground = async () => {
    console.log('getRandomBackground called with keywords:', keywords);
    setIsLoading(true);
    try {
      // Always use local implementation with user's keywords
      const searchTerms = keywords.trim() || 'soothing, focus, nature';
      // Normalize to comma-separated terms without encoding commas (Unsplash Source expects this form)
      const normalizedTerms = searchTerms.split(/[\s,\n]+/).filter(Boolean).join(',');
      console.log('Using search terms:', normalizedTerms);
      
      // Using Unsplash Source API with search terms (random route) and a cache-busting sig
      const unsplashUrl = `https://source.unsplash.com/random/1920x1080/?${normalizedTerms}&sig=${Date.now()}`;
      
      console.log('Testing Unsplash URL:', unsplashUrl);
      
      // Test if image loads properly
      const img = new Image();
      // Reduce chance of hotlink 403s
      img.referrerPolicy = 'no-referrer';
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        console.log('Unsplash image loaded successfully');
        onBackgroundChange(unsplashUrl);
        setIsLoading(false);
      };
      img.onerror = (e) => {
        console.log('Unsplash failed, trying Picsum fallback', e);
        // Try Picsum as a CORS-friendly random image fallback
        const picsumUrl = `https://picsum.photos/1920/1080?random=${Date.now()}`;
        const img2 = new Image();
        img2.referrerPolicy = 'no-referrer';
        img2.crossOrigin = 'anonymous';
        img2.onload = () => {
          console.log('Picsum image loaded successfully');
          onBackgroundChange(picsumUrl);
          setIsLoading(false);
        };
        img2.onerror = (e2) => {
          console.log('Picsum failed, using gradient fallback', e2);
          onBackgroundChange('linear-gradient(135deg, #667eea 0%, #764ba2 100%)');
          setIsLoading(false);
        };
        img2.src = picsumUrl;
      };
      img.src = unsplashUrl;
      
    } catch (error) {
      console.error('Error setting random background:', error);
      // Fallback to a simple gradient
      onBackgroundChange('linear-gradient(135deg, #667eea 0%, #764ba2 100%)');
      setIsLoading(false);
    }
  };

  // Set custom URL background
  const setCustomBackground = () => {
    if (customUrl.trim()) {
      onBackgroundChange(customUrl.trim());
      setCustomUrl('');
    }
  };

  // Set preset background
  const setPresetBackground = (background: string) => {
    onBackgroundChange(background);
  };

  return (
    <div className="background-tab">
      <div className="tab-header">
        <h3 className="tab-heading">Background Settings</h3>
        <p className="tab-description">Customize your focus environment</p>
      </div>
      
      {/* Current Background Preview */}
      <div className="current-background">
        <h4>Current Background</h4>
        <div 
          className="background-preview"
          style={
            currentBackground && currentBackground.includes('gradient') ? {
              backgroundImage: currentBackground,
            } : currentBackground ? {
              backgroundImage: `url(${currentBackground})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            } : {}
          }
        />
      </div>

      {/* Navigation Tabs */}
      <div className="section-tabs">
        <button 
          className={`section-tab ${activeSection === 'shuffle' ? 'active' : ''}`}
          onClick={() => onChangeActiveSection('shuffle')}
        >
          <ShuffleIcon sx={{ fontSize: 20 }} />
          Shuffle
        </button>
        <button 
          className={`section-tab ${activeSection === 'custom' ? 'active' : ''}`}
          onClick={() => onChangeActiveSection('custom')}
        >
          <LinkIcon sx={{ fontSize: 20 }} />
          Custom URL
        </button>
        <button 
          className={`section-tab ${activeSection === 'presets' ? 'active' : ''}`}
          onClick={() => onChangeActiveSection('presets')}
        >
          <PaletteIcon sx={{ fontSize: 20 }} />
          Presets
        </button>
      </div>

      {/* Section Content */}
      <div className="section-content">
        {activeSection === 'shuffle' && (
          <div className="shuffle-section">
            <div className="section-header">
              <h4>Shuffle Background</h4>
              <div className="info-row">
                <InfoOutlinedIcon sx={{ fontSize: 16, color: '#666', marginRight: 0.5 }} />
                <span className="info-text">Every refresh sets a new random image as background</span>
              </div>
            </div>
            
            <div className="input-group">
              <label htmlFor="keywords" className="input-label">Search Keywords:</label>
              <textarea
                id="keywords"
                className="keywords-input"
                value={keywords}
                onChange={(e) => onChangeKeywords(e.target.value)}
                placeholder="Enter keywords like: anime, manga, nature, space, etc."
                rows={3}
              />
            </div>
            
            <button 
              className={`action-btn primary ${isLoading ? 'loading' : ''}`}
              onClick={getRandomBackground}
              disabled={isLoading}
            >
              <ShuffleIcon sx={{ fontSize: 20, marginRight: 1 }} />
              {isLoading ? 'Finding Background...' : 'Random Background'}
            </button>
          </div>
        )}

        {activeSection === 'custom' && (
          <div className="custom-section">
            <div className="section-header">
              <h4>Custom Image URL</h4>
              <p className="section-description">Paste your own image URL to set as background</p>
            </div>
            
            <div className="input-group">
              <label htmlFor="customUrl" className="input-label">Image URL:</label>
              <input
                id="customUrl"
                type="url"
                className="url-input"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            
            <button 
              className="action-btn primary"
              onClick={setCustomBackground}
              disabled={!customUrl.trim()}
            >
              <LinkIcon sx={{ fontSize: 20, marginRight: 1 }} />
              Set Background
            </button>
          </div>
        )}

        {activeSection === 'presets' && (
          <div className="presets-section">
            <div className="section-header">
              <h4>Gradient Presets</h4>
              <p className="section-description">Choose from beautiful gradient backgrounds</p>
            </div>
            
            <div className="presets-grid">
              {presetBackgrounds.map((gradient, index) => (
                <button
                  key={index}
                  className="preset-item"
                  style={{ background: gradient }}
                  onClick={() => setPresetBackground(gradient)}
                  title={`Gradient ${index + 1}`}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        .background-tab {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          width: 100%;
          height: 100%;
          min-width: 0;  /* avoid causing horizontal overflow */
          min-height: 0; /* allow flex child to shrink within modal-content */
          box-sizing: border-box;
          /* remove inner scroll; modal-content is the scroll container */
          overflow: visible;
        }

        .tab-header {
          text-align: center;
          padding-bottom: 1rem;
          border-bottom: 1px solid rgba(0, 0, 0, 0.1);
        }

        .tab-heading {
          margin: 0 0 0.5rem 0;
          color: #333;
          font-size: 1.4rem;
          font-weight: 600;
        }

        .tab-description {
          margin: 0;
          color: #666;
          font-size: 0.9rem;
        }

        .current-background {
          margin-bottom: 1rem;
        }

        .current-background h4 {
          margin: 0 0 0.75rem 0;
          color: #555;
          font-size: 1rem;
          font-weight: 500;
        }

        .background-preview {
          width: 100%;
          height: 120px;
          border-radius: 8px;
          border: 2px solid rgba(0, 0, 0, 0.1);
          background-color: #f5f5f5;
        }

        .section-tabs {
          display: flex;
          gap: 0;
          background: rgba(0, 0, 0, 0.05);
          border-radius: 8px;
          padding: 4px;
        }

        .section-tab {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          background: transparent;
          border: none;
          border-radius: 6px;
          color: #666;
          font-size: 0.85rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .section-tab:hover {
          background: rgba(255, 255, 255, 0.7);
          color: #333;
        }

        .section-tab.active {
          background: white;
          color: #5c6bc0;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .section-content {
          min-height: 200px;
        }

        .section-header {
          margin-bottom: 1rem;
        }

        .section-header h4 {
          margin: 0 0 0.5rem 0;
          color: #333;
          font-size: 1.1rem;
          font-weight: 600;
        }

        .section-description {
          margin: 0;
          color: #666;
          font-size: 0.85rem;
        }

        .info-row {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          margin-top: 0.25rem;
        }

        .info-text {
          color: #666;
          font-size: 0.8rem;
          font-style: italic;
        }

        .input-group {
          margin-bottom: 1rem;
        }

        .input-label {
          display: block;
          margin-bottom: 0.5rem;
          color: #555;
          font-size: 0.9rem;
          font-weight: 500;
        }

        .keywords-input,
        .url-input {
          width: 100%;
          padding: 0.75rem;
          border: 2px solid rgba(0, 0, 0, 0.1);
          border-radius: 8px;
          font-size: 0.9rem;
          font-family: inherit;
          resize: vertical;
          transition: border-color 0.2s ease;
        }

        .keywords-input:focus,
        .url-input:focus {
          outline: none;
          border-color: #5c6bc0;
        }

        .keywords-input {
          min-height: 60px;
        }

        .action-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.875rem 1.5rem;
          border: none;
          border-radius: 8px;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .action-btn.primary {
          background: #5c6bc0;
          color: white;
        }

        .action-btn.primary:hover:not(:disabled) {
          background: #4c5bb5;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(92, 107, 192, 0.3);
        }

        .action-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .action-btn.loading {
          background: #7986cb;
        }

        .action-btn.loading::after {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.2),
            transparent
          );
          animation: shimmer 1.5s infinite;
        }

        @keyframes shimmer {
          0% { left: -100%; }
          100% { left: 100%; }
        }

        .presets-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.75rem;
        }

        .preset-item {
          aspect-ratio: 16/9;
          border: 2px solid rgba(0, 0, 0, 0.1);
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
          overflow: hidden;
        }

        .preset-item:hover {
          border-color: #5c6bc0;
          transform: scale(1.02);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .preset-item::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0);
          transition: background 0.2s ease;
        }

        .preset-item:hover::after {
          background: rgba(255, 255, 255, 0.1);
        }

        /* Scrollbar Styling */
        .background-tab::-webkit-scrollbar {
          width: 6px;
        }

        .background-tab::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.05);
          border-radius: 3px;
        }

        .background-tab::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 3px;
        }

        .background-tab::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 0, 0, 0.3);
        }
      `}</style>
    </div>
  );
};