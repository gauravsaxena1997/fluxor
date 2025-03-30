import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Close as CloseIcon,
  Gavel as GavelIcon,
  Timer as TimerIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { BlockedSite } from './types';
import ToggleSelector from '../ToggleSelector/ToggleSelector';
import './FocusWardenPopup.css';
import { getFaviconUrl } from './utils';

interface FocusWardenPopupProps {
  isOpen: boolean;
  onClose: () => void;
  blockedSites: BlockedSite[];
  onDeleteSite: (siteId: string) => void;
}

const FocusWardenPopup = ({
  isOpen,
  onClose,
  blockedSites,
  onDeleteSite
}: FocusWardenPopupProps) => {
  const [deleteConfirmSite, setDeleteConfirmSite] = useState<BlockedSite | null>(null);
  const [activeTab, setActiveTab] = useState<'permanent' | 'timeLimit'>('permanent');
  const [localBlockedSites, setLocalBlockedSites] = useState<BlockedSite[]>(blockedSites);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  // Update local state when props change
  useEffect(() => {
    setLocalBlockedSites(blockedSites);
  }, [blockedSites]);

  // Get stats
  const permanentSites = localBlockedSites.filter(site => site.type === 'permanent');
  const timeLimitSites = localBlockedSites.filter(site => site.type === 'timeLimit');

  // Tab options
  const tabOptions = [
    { 
      value: 'permanent' as const, 
      label: `Permanent (${permanentSites.length})`, 
      icon: <GavelIcon className="tab-icon" /> 
    },
    { 
      value: 'timeLimit' as const, 
      label: `Time Restricted (${timeLimitSites.length})`, 
      icon: <TimerIcon className="tab-icon" /> 
    }
  ];

  // Refresh function to sync the latest time data
  const handleRefresh = async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    
    try {
      // Only proceed if we're in an extension context
      if (typeof chrome !== 'undefined' && chrome.storage?.local) {
        const chromeData = await chrome.storage.local.get('blockedSites');
        const freshBlockedSites = chromeData.blockedSites || [];
        setLocalBlockedSites(freshBlockedSites);
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      // Add a small delay to show the refresh animation
      setTimeout(() => {
        setIsRefreshing(false);
      }, 500);
    }
  };

  // Format time usage display
  const getTimeUsageDisplay = (site: BlockedSite): string => {
    if (!site.timeLimit) return 'Daily limit: 0 min';
    return `Daily limit: ${site.timeLimit} min`;
  };

  // Calculate remaining time and progress percentage for time-limited sites
  const getTimeRemaining = (site: BlockedSite): { text: string, progressPercent: number } => {
    if (!site.timeLimit) return { text: '0 min', progressPercent: 0 };
    
    // If limit is reached for today, show message
    if (site.limitReached) {
      return { text: 'Limit reached for today', progressPercent: 100 };
    }

    // Get the usage time (default to 0 if not set)
    const usedMinutes = site.usageTime || 0;
    
    // Calculate remaining minutes
    const remainingMinutes = Math.max(0, site.timeLimit - usedMinutes);
    
    // Calculate progress percentage
    const progressPercent = Math.min(100, (usedMinutes / site.timeLimit) * 100);
    
    // Format the display nicely
    if (remainingMinutes <= 0) {
      return { text: 'Limit reached for today', progressPercent: 100 };
    } else if (remainingMinutes < 1) {
      return { text: 'Less than a minute left', progressPercent: progressPercent };
    } else {
      return { 
        text: `${remainingMinutes.toFixed(2)} minutes left`, 
        progressPercent: progressPercent 
      };
    }
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  // Focus management
  useEffect(() => {
    if (isOpen && popupRef.current) {
      popupRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const modalContent = (
    <div 
      className={`focus-warden-popup ${isOpen ? 'active' : ''}`}
      ref={popupRef} 
      tabIndex={-1}
    >
      <div className="focus-warden-popup-content">
        <div className="focus-warden-popup-header">
          <h2 id="focus-warden-popup-title">Manage Blocked Sites</h2>
          <div className="header-actions">
            <button 
              className={`refresh-button ${isRefreshing ? 'refreshing' : ''}`}
              onClick={handleRefresh}
              disabled={isRefreshing}
              aria-label="Refresh time data"
              title="Refresh time data"
            >
              <RefreshIcon />
            </button>
            <button 
              className="focus-warden-popup-close" 
              onClick={onClose}
              aria-label="Close blocked sites list"
            >
              <CloseIcon />
            </button>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="focus-warden-popup-tabs">
          <ToggleSelector
            options={tabOptions}
            value={activeTab}
            onChange={setActiveTab}
            block={true}
          />
        </div>
        
        {/* Content */}
        <div className="focus-warden-popup-body">
          {activeTab === 'permanent' ? (
            <>
              {permanentSites.length === 0 ? (
                <p className="focus-warden-popup-empty">No permanently blocked sites</p>
              ) : (
                <ul className="focus-warden-popup-list">
                  {permanentSites.map(site => (
                    <li key={site.id} className="focus-warden-popup-item">
                      <div className="site-favicon">
                        <img 
                          src={getFaviconUrl(site.url)} 
                          alt=""
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="%23aaa" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>';
                          }}
                        />
                      </div>
                      <div className="site-info">
                        <div className="site-url">{site.url}</div>
                        <div className="site-type permanent">
                          <GavelIcon /> Permanently blocked
                        </div>
                      </div>
                      <button 
                        className="delete-btn"
                        onClick={() => setDeleteConfirmSite(site)}
                        aria-label={`Delete ${site.url} from blocked sites`}
                      >
                        <DeleteIcon />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </>
          ) : (
            <>
              {timeLimitSites.length === 0 ? (
                <p className="focus-warden-popup-empty">No time-limited blocks</p>
              ) : (
                <ul className="focus-warden-popup-list">
                  {timeLimitSites.map(site => (
                    <li key={site.id} className="focus-warden-popup-item">
                      <div className="site-favicon">
                        <img 
                          src={getFaviconUrl(site.url)} 
                          alt=""
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="%23aaa" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>';
                          }}
                        />
                      </div>
                      <div className="site-info">
                        <div className="site-url">{site.url}</div>
                        <div className="site-type time-limit">
                          <TimerIcon /> {getTimeUsageDisplay(site)}
                        </div>
                        <div className="time-progress-container">
                          <div 
                            className="time-progress-bar" 
                            style={{ width: `${getTimeRemaining(site).progressPercent}%` }}
                          ></div>
                          <div className="time-remaining">
                            {getTimeRemaining(site).text}
                          </div>
                        </div>
                      </div>
                      <button 
                        className="delete-btn"
                        onClick={() => setDeleteConfirmSite(site)}
                        aria-label={`Delete ${site.url} from blocked sites`}
                      >
                        <DeleteIcon />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );

  // Confirmation Dialog
  const confirmDialog = deleteConfirmSite && (
    <div className="focus-warden-popup-overlay">
      <div className="focus-warden-confirm-dialog">
        <h3>Confirm Delete</h3>
        <p>
          Are you sure you want to remove <strong>{deleteConfirmSite.url}</strong> from blocked sites?
        </p>
        <div className="confirm-actions">
          <button 
            className="confirm-cancel"
            onClick={() => setDeleteConfirmSite(null)}
          >
            Cancel
          </button>
          <button 
            className="confirm-delete"
            onClick={() => {
              onDeleteSite(deleteConfirmSite.id);
              setDeleteConfirmSite(null);
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );

  // Use createPortal to render the popup at the document level
  return createPortal(
    <>
      <div className="focus-warden-popup-backdrop" onClick={onClose}></div>
      {modalContent}
      {confirmDialog}
    </>,
    document.body
  );
};

export default FocusWardenPopup; 