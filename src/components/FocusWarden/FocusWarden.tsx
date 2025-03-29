import React, { useState, useEffect } from 'react';
import { TextField, Button, Box, Typography, InputAdornment, IconButton } from '@mui/material';
import { Link as LinkIcon, Shield as ShieldIcon, Timer as TimerIcon, Gavel as GavelIcon, Add as AddIcon } from '@mui/icons-material';
import { FocusWardenProps, BlockedSite, BlockType } from './types';
import FocusWardenPopup from './FocusWardenPopup';
import { normalizeUrl } from './utils';
import { useData } from '../../context/DataContext';
import ToggleSelector from '../ToggleSelector/ToggleSelector';
import './FocusWarden.css';

// Safety check for webRequest API - wrap in try/catch to prevent errors
try {
  // Only try to access chrome.webRequest if it exists
  if (typeof chrome !== 'undefined' && chrome.webRequest && chrome.webRequest.onBeforeRequest) {
    console.log('webRequest API detected');
  }
} catch (error) {
  console.error('Error checking webRequest API:', error);
}

// Helper function to get today's date string in YYYY-MM-DD format
function getTodayString(): string {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export const FocusWarden: React.FC<FocusWardenProps> = ({ className }) => {
  const { data, updateWidgetData } = useData();
  const [url, setUrl] = useState('');
  const [blockType, setBlockType] = useState<BlockType>('permanent');
  const [timeLimit, setTimeLimit] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [blockedSites, setBlockedSites] = useState<BlockedSite[]>(
    data?.widgets?.focusWarden?.blockedSites || []
  );

  // Define toggle options
  const blockTypeOptions = [
    { 
      value: 'permanent' as BlockType, 
      label: 'Permanent'
    },
    { 
      value: 'timeLimit' as BlockType, 
      label: 'Time Limit'
    }
  ];

  // Load blocked sites from storage on mount
  useEffect(() => {
    const loadBlockedSites = async () => {
      try {
        // First check chrome.storage if we're in an extension context
        if (typeof chrome !== 'undefined' && chrome.storage?.local) {
          try {
            const chromeData = await chrome.storage.local.get('blockedSites');
            const chromeBlockedSites = chromeData.blockedSites || [];
            
            // Compare with what we have in the DataContext
            const storedSites = data?.widgets?.focusWarden?.blockedSites || [];
            
            // Merge sites - prefer chrome.storage data for extension context
            if (chromeBlockedSites.length > 0) {
              if (JSON.stringify(chromeBlockedSites) !== JSON.stringify(storedSites)) {
                // Make sure widgets exists before updating
                if (!data.widgets) {
                  // Initialize widgets if it doesn't exist
                  updateWidgetData('focusWarden', { blockedSites: chromeBlockedSites });
                } else {
                  // Update normally if widgets exists
                  updateWidgetData('focusWarden', { blockedSites: chromeBlockedSites });
                }
                setBlockedSites(chromeBlockedSites);
                return;
              }
            } else if (storedSites.length > 0) {
              // Update chrome.storage to match DataContext
              chrome.storage.local.set({ blockedSites: storedSites });
            }
          } catch (error) {
            console.error('Error accessing chrome.storage:', error);
          }
        }
        
        // Get blocked sites from DataContext with null checks
        const storedSites = data?.widgets?.focusWarden?.blockedSites || [];
        
        // Important: No longer filter out expired time-limited sites
        setBlockedSites(storedSites);
      } catch (error) {
        console.error('Error loading blocked sites:', error);
      }
    };

    loadBlockedSites();
  }, [data?.widgets?.focusWarden?.blockedSites, updateWidgetData]);

  const validateUrl = (input: string): boolean => {
    try {
      new URL(input.startsWith('http') ? input : `https://${input}`);
      return true;
    } catch {
      return false;
    }
  };

  const handleAddSite = () => {
    if (!url) {
      setError('Please enter a URL');
      return;
    }

    if (!validateUrl(url)) {
      setError('Invalid URL format');
      return;
    }

    // Validate time limit for time-limited blocks
    let parsedTimeLimit: number | undefined;
    if (blockType === 'timeLimit') {
      parsedTimeLimit = parseInt(timeLimit);
      if (isNaN(parsedTimeLimit) || parsedTimeLimit <= 0) {
        setError('Please enter a valid time limit greater than 0 minutes');
        return;
      }
    }

    const normalizedUrl = normalizeUrl(url);
    if (blockedSites.some(site => site.url === normalizedUrl)) {
      setError('This site is already blocked');
      return;
    }

    const newSite: BlockedSite = {
      id: Date.now().toString(),
      url: normalizedUrl,
      type: blockType,
      timeLimit: parsedTimeLimit,
      createdAt: Date.now(),
      // Add necessary properties for time limit tracking
      usageTime: 0,
      lastResetDate: getTodayString(),
      isActive: false,
      limitReached: false
    };

    const updatedSites = [...blockedSites, newSite];
    
    // Update DataContext
    updateWidgetData('focusWarden', { blockedSites: updatedSites });
    setBlockedSites(updatedSites);
    
    // Also update chrome.storage if in extension context
    try {
      if (typeof chrome !== 'undefined' && chrome.storage?.local) {
        chrome.storage.local.set({ blockedSites: updatedSites });
      }
    } catch (error) {
      console.error('Error saving blocked sites to extension storage:', error);
    }
    
    // Reset form
    setUrl('');
    setTimeLimit('');
    setError('');
  };

  const handleDeleteSite = (siteId: string) => {
    const updatedSites = blockedSites.filter(site => site.id !== siteId);
    
    // Update DataContext
    updateWidgetData('focusWarden', { blockedSites: updatedSites });
    setBlockedSites(updatedSites);
    
    // Also update chrome.storage if in extension context
    try {
      if (typeof chrome !== 'undefined' && chrome.storage?.local) {
        chrome.storage.local.set({ blockedSites: updatedSites });
      }
    } catch (error) {
      console.error('Error saving blocked sites to extension storage:', error);
    }
  };

  const stats = {
    totalBlocked: blockedSites.length,
    permanentCount: blockedSites.filter(site => site.type === 'permanent').length,
    timeLimitedCount: blockedSites.filter(site => site.type === 'timeLimit').length,
  };

  return (
    <>
      <div className={`focus-warden ${className || ''}`}>
        {/* Widget Title */}
        <Box className="widget-title">
          <ShieldIcon className="widget-icon" />
          <Typography variant="h6" className="widget-title-text">
            Focus Warden
          </Typography>
        </Box>

        {/* Stats Row */}
        <Box className="stats-row">
          <div className="stat-item">
            <GavelIcon className="stat-icon" />
            <span className="stat-count">{stats.permanentCount}</span>
            <span className="stat-label">Permanent</span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <TimerIcon className="stat-icon" />
            <span className="stat-count">{stats.timeLimitedCount}</span>
            <span className="stat-label">Time Limit</span>
          </div>
        </Box>

        {/* URL Input Row with Add Button */}
        <Box className="url-input-row">
          <TextField
            fullWidth
            size="small"
            placeholder="Enter URL (e.g., youtube.com)"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setError(''); // Clear error when input changes
            }}
            error={!!error}
            helperText={error}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start" style={{ marginRight: 8 }}>
                  <LinkIcon className="input-icon" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton 
                    edge="end" 
                    onClick={handleAddSite}
                    disabled={!url || !!error}
                    size="small"
                  >
                    <AddIcon className="add-icon" />
                  </IconButton>
                </InputAdornment>
              ),
              style: { paddingLeft: 8 },
            }}
          />
        </Box>

        {/* Type and Time Limit Row */}
        <Box className="type-row">
          <ToggleSelector 
            options={blockTypeOptions} 
            value={blockType} 
            onChange={setBlockType} 
            name="blockType"
            size="medium"
          />
          
          {blockType === 'timeLimit' && (
            <TextField
              size="small"
              type="number"
              placeholder="Minutes"
              value={timeLimit}
              onChange={(e) => setTimeLimit(e.target.value)}
              className="time-limit-input"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end" style={{ marginLeft: 8 }}>
                    <TimerIcon className="input-icon" style={{ fontSize: '0.9rem' }} />
                  </InputAdornment>
                ),
                style: { paddingRight: 8 },
              }}
            />
          )}
        </Box>

        {/* Manage Sites Button */}
        <Box className="actions-row">
          <Button
            variant="outlined"
            onClick={() => setIsPopupOpen(true)}
            fullWidth
            className="manage-sites-btn"
          >
            Manage blocked sites
          </Button>
        </Box>
      </div>

      <FocusWardenPopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        blockedSites={blockedSites}
        onDeleteSite={handleDeleteSite}
      />
    </>
  );
};

export default FocusWarden; 