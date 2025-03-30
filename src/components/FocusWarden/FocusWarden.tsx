import React, { useState, useEffect, useRef } from 'react';
import { TextField, Button, Box, Typography, InputAdornment, IconButton } from '@mui/material';
import { Link as LinkIcon, Shield as ShieldIcon, Timer as TimerIcon, Gavel as GavelIcon, ManageAccounts as ManageIcon } from '@mui/icons-material';
import { FocusWardenProps, BlockedSite, BlockType } from './types';
import FocusWardenPopup from './FocusWardenPopup';
import { normalizeUrl } from './utils';
import { useData } from '../../context/DataContext';
import ToggleSelector from '../ToggleSelector/ToggleSelector';
import './FocusWarden.css';

/**
 * Helper function to get today's date string in YYYY-MM-DD format
 * Used for daily time limit reset tracking
 */
function getTodayString(): string {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

/**
 * Focus Warden Component
 * 
 * A productivity tool that allows users to block distracting websites
 * either permanently or with time limits.
 */
export const FocusWarden: React.FC<FocusWardenProps> = ({ className }) => {
  // Context and state
  const { data, updateWidgetData } = useData();
  const [url, setUrl] = useState('');
  const [blockType, setBlockType] = useState<BlockType>('permanent');
  const [timeLimit, setTimeLimit] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [blockedSites, setBlockedSites] = useState<BlockedSite[]>(
    data?.widgets?.focusWarden?.blockedSites || []
  );
  
  // Refs
  const timeLimitInputRef = useRef<HTMLInputElement>(null);

  // Block type options for the toggle selector
  const blockTypeOptions = [
    { 
      value: 'permanent' as BlockType, 
      label: 'Permanent'
    },
    { 
      value: 'timeLimit' as BlockType, 
      label: 'Restrict Time'
    }
  ];

  /**
   * Load blocked sites from storage on component mount and when data changes
   */
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
        setBlockedSites(storedSites);
      } catch (error) {
        console.error('Error loading blocked sites:', error);
      }
    };

    loadBlockedSites();
  }, [data?.widgets?.focusWarden?.blockedSites, updateWidgetData]);

  /**
   * Auto-focus the time limit input when the block type changes to timeLimit
   */
  useEffect(() => {
    if (blockType === 'timeLimit' && timeLimitInputRef.current) {
      setTimeout(() => {
        timeLimitInputRef.current?.focus();
      }, 0);
    }
  }, [blockType]);

  /**
   * Validates a URL string
   * Accepts both full URLs (with protocol) and domain-only formats
   * 
   * @param input URL string to validate
   * @returns boolean indicating if URL is valid
   */
  const validateUrl = (input: string): boolean => {
    try {
      new URL(input.startsWith('http') ? input : `https://${input}`);
      return true;
    } catch {
      return false;
    }
  };

  /**
   * Opens the manage sites popup and refreshes data from storage
   */
  const handleOpenPopup = async () => {
    // Refresh data from storage before opening popup
    try {
      if (typeof chrome !== 'undefined' && chrome.storage?.local) {
        const chromeData = await chrome.storage.local.get('blockedSites');
        const freshBlockedSites = chromeData.blockedSites || [];
        setBlockedSites(freshBlockedSites);
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
    
    setIsPopupOpen(true);
  };

  /**
   * Redirects already open tabs when adding a permanent block
   * Ensures immediate blocking without requiring page refresh
   * 
   * @param site The newly added blocked site
   */
  const redirectOpenTabs = async (site: BlockedSite) => {
    if (site.type !== 'permanent') return;
    
    try {
      if (typeof chrome !== 'undefined' && chrome.tabs) {
        // Get all open tabs
        const tabs = await chrome.tabs.query({});
        
        // Get domain from site URL
        let siteDomain = site.url.replace(/^https?:\/\//, '').split('/')[0].replace(/^www\./, '');
        
        // Check each tab
        for (const tab of tabs) {
          if (tab.url && tab.url.startsWith('http')) {
            try {
              const tabUrl = new URL(tab.url);
              const tabDomain = tabUrl.hostname.replace(/^www\./, '');
              
              // Check if this tab matches the site
              const isMatchingSite = 
                tabDomain === siteDomain || 
                tabDomain.endsWith(`.${siteDomain}`) || 
                siteDomain.endsWith(`.${tabDomain}`);
              
              if (isMatchingSite && tab.id) {
                // Create params for redirect
                const params = new URLSearchParams();
                params.append('url', site.url);
                params.append('type', site.type);
                
                const redirectUrl = chrome.runtime.getURL(`/blocked.html?${params.toString()}`);
                
                // Redirect the tab
                await chrome.tabs.update(tab.id, { url: redirectUrl });
              }
            } catch (e) {
              console.error('Error processing tab:', e);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error redirecting open tabs:', error);
    }
  };

  /**
   * Handles adding a new site to the blocked list
   * Validates input, creates a new site object, and updates storage
   */
  const handleAddSite = () => {
    // Validate URL
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

    // Check for duplicate sites
    const normalizedUrl = normalizeUrl(url);
    if (blockedSites.some(site => site.url === normalizedUrl)) {
      setError('This site is already blocked');
      return;
    }

    // Create new site object
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
        
        // Immediately redirect any open tabs if this is a permanent block
        redirectOpenTabs(newSite);
      }
    } catch (error) {
      console.error('Error saving blocked sites to extension storage:', error);
    }
    
    // Reset form
    setUrl('');
    setTimeLimit('');
    setError('');
  };

  /**
   * Handles deleting a site from the blocked list
   * 
   * @param siteId ID of the site to delete
   */
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

  // Calculate stats for display
  const stats = {
    totalBlocked: blockedSites.length,
    permanentCount: blockedSites.filter(site => site.type === 'permanent').length,
    timeLimitedCount: blockedSites.filter(site => site.type === 'timeLimit').length,
  };

  return (
    <>
      <div className={`focus-warden ${className || ''}`} style={{ minHeight: '300px', width: '100%' }}>
        {/* Widget Title with Manage Icon */}
        <Box className="widget-title">
          <ShieldIcon className="widget-icon" />
          <Typography variant="h6" className="widget-title-text">
            Focus Warden
          </Typography>
          <IconButton 
            className="manage-icon-btn"
            onClick={handleOpenPopup}
            aria-label="Manage blocked sites"
            title="Manage blocked sites"
            size="small"
          >
            <ManageIcon />
          </IconButton>
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
            <span className="stat-label">Time Restricted</span>
          </div>
        </Box>

        {/* URL Input Row */}
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
                <InputAdornment position="start" style={{ marginRight: 30 }}>
                  <LinkIcon className="input-icon" />
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
              inputRef={timeLimitInputRef}
              inputProps={{ min: "1" }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end" style={{ marginLeft: 8 }}>
                    <TimerIcon className="input-icon" style={{ fontSize: '0.9rem' }} />
                  </InputAdornment>
                ),
                style: { paddingRight: 12 },
              }}
            />
          )}
        </Box>

        {/* Block Button */}
        <Box className="actions-row">
          <Button
            variant="contained"
            onClick={handleAddSite}
            fullWidth
            className="block-btn"
            disabled={!url || !!error}
          >
            Block
          </Button>
        </Box>
      </div>

      {/* Manage Sites Popup */}
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