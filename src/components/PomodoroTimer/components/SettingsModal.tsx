import React, { useState } from 'react';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import WallpaperIcon from '@mui/icons-material/Wallpaper';
import TimerIcon from '@mui/icons-material/Timer';
import SettingsIcon from '@mui/icons-material/Settings';
import { BackgroundTab } from './BackgroundTab';
import { TimerSettingsTab } from './TimerSettingsTab';
import type { TimerSettings, BackgroundPrefs, BackgroundSection } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBackground: string;
  onBackgroundChange: (backgroundUrl: string) => void;
  // Timer settings props
  isTimerRunning: boolean;
  timerSettings?: TimerSettings;
  onUpdateTimerSettings: (settings: Partial<TimerSettings>) => void;
  // Background preferences
  backgroundPrefs?: BackgroundPrefs;
  onUpdateBackgroundPrefs: (prefs: Partial<BackgroundPrefs>) => void;
}

type TabType = 'music' | 'background' | 'timer' | 'settings';

export const SettingsModal: React.FC<SettingsModalProps> = ({ 
  isOpen, 
  onClose, 
  currentBackground, 
  onBackgroundChange,
  isTimerRunning,
  timerSettings,
  onUpdateTimerSettings,
  backgroundPrefs,
  onUpdateBackgroundPrefs,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('music');

  const tabs = [
    { id: 'music' as TabType, icon: MusicNoteIcon, label: 'Music' },
    { id: 'background' as TabType, icon: WallpaperIcon, label: 'Background' },
    { id: 'timer' as TabType, icon: TimerIcon, label: 'Timer' },
    { id: 'settings' as TabType, icon: SettingsIcon, label: 'Settings' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'music':
        return <div className="tab-content">Music Component is visible</div>;
      case 'background':
        return (
          <BackgroundTab
            currentBackground={currentBackground}
            onBackgroundChange={onBackgroundChange}
            keywords={backgroundPrefs?.keywords ?? 'soothing, focus, nature, productivity'}
            activeSection={backgroundPrefs?.activeSection ?? 'shuffle'}
            onChangeKeywords={(kw: string) => onUpdateBackgroundPrefs({ keywords: kw })}
            onChangeActiveSection={(sec: BackgroundSection) => onUpdateBackgroundPrefs({ activeSection: sec })}
          />
        );
      case 'timer':
        return (
          <TimerSettingsTab
            isRunning={isTimerRunning}
            settings={timerSettings}
            onUpdate={onUpdateTimerSettings}
          />
        );
      case 'settings':
        return <div className="tab-content">Settings Component is visible</div>;
      default:
        return null;
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`modal-backdrop ${isOpen ? 'open' : ''}`}
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className={`settings-modal ${isOpen ? 'open' : ''}`}>
        {/* Tabs */}
        <div className="tabs-container">
          {tabs.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              className={`tab-btn ${activeTab === id ? 'active' : ''}`}
              onClick={() => setActiveTab(id)}
              title={label}
            >
              <Icon sx={{ fontSize: 28 }} />
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="modal-content">
          {renderTabContent()}
        </div>
      </div>

      <style>{`
        .modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(5px);
          z-index: 1000;
          opacity: 0;
          visibility: hidden;
          transition: all 0.3s ease;
        }

        .modal-backdrop.open {
          opacity: 1;
          visibility: visible;
        }

        .settings-modal {
          position: fixed;
          top: 0;
          right: 0;
          width: 40%;
          height: 100vh;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-left: 1px solid rgba(255, 255, 255, 0.2);
          z-index: 1001;
          transform: translateX(100%);
          transition: transform 0.3s ease;
          display: flex;
          flex-direction: column;
          box-shadow: -8px 0 32px rgba(0, 0, 0, 0.2);
        }

        .settings-modal.open {
          transform: translateX(0);
        }

        .tabs-container {
          display: flex;
          padding: 0;
          gap: 0;
          border-bottom: 1px solid rgba(0, 0, 0, 0.1);
          width: 100%;
        }

        .tab-btn {
          background: rgba(0, 0, 0, 0.05);
          border: none;
          border-radius: 0;
          padding: 1.5rem 1rem;
          cursor: pointer;
          transition: all 0.2s ease;
          color: #666;
          display: flex;
          align-items: center;
          justify-content: center;
          flex: 1;
          height: 80px;
          border-right: 1px solid rgba(0, 0, 0, 0.1);
        }
        
        .tab-btn:last-child {
          border-right: none;
        }

        .tab-btn:hover {
          background: rgba(0, 0, 0, 0.1);
          color: #333;
        }

        .tab-btn.active {
          background: #5c6bc0;
          color: white;
          position: relative;
        }
        
        .tab-btn.active::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: #5c6bc0;
        }

        .modal-content {
          flex: 1;
          padding: 2rem;
          box-sizing: border-box;
          width: 100%;
          height: 100%;
          min-height: 0; /* allow flex child to shrink without forcing nested scrollbars */
          overflow-y: auto;
          overflow-x: hidden; /* prevent horizontal scrollbar gap */
        }

        .tab-content {
          background: rgba(0, 0, 0, 0.05);
          border-radius: 12px;
          padding: 2rem;
          text-align: center;
          font-size: 1.2rem;
          color: #666;
          border: 2px dashed rgba(0, 0, 0, 0.2);
        }

        /* Mobile Responsiveness */
        @media (max-width: 768px) {
          .settings-modal {
            width: 80%;
          }
        }

        @media (max-width: 480px) {
          .settings-modal {
            width: 100%;
          }
          
          .modal-header {
            padding: 1.5rem;
          }
          
          .tabs-container {
            padding: 1rem;
          }
          
          .tab-btn {
            min-width: 50px;
            height: 50px;
            padding: 0.75rem;
          }
          
          .modal-content {
            padding: 1.5rem;
          }
        }
      `}</style>
    </>
  );
};