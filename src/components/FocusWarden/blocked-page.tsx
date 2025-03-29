import React, { useEffect, useState } from 'react';
import './BlockedSite.css';

interface BlockedPageProps {
  url: string;
  blockType: 'permanent' | 'timeLimit';
  timeLimit?: number;
  createdAt?: number;
  limitReached?: boolean;
}

function getBlockedMessage(props: BlockedPageProps): string {
  const { url, blockType, timeLimit, limitReached } = props;
  
  if (blockType === 'permanent') {
    return `This site (${url}) has been permanently blocked to help you stay focused.`;
  }
  
  if (blockType === 'timeLimit' && limitReached) {
    return `You've reached your daily time limit of ${timeLimit} minutes for ${url}. The site will be available again tomorrow.`;
  }
  
  return `This site (${url}) has been blocked to help you stay focused.`;
}

export const BlockedPage: React.FC = () => {
  const [pageParams, setPageParams] = useState<BlockedPageProps>({
    url: '',
    blockType: 'permanent'
  });
  
  useEffect(() => {
    // Get URL parameters
    const params = new URLSearchParams(window.location.search);
    const url = params.get('url') || '';
    const typeParam = params.get('type') || 'permanent';
    // Validate the type parameter
    const type = (typeParam === 'permanent' || typeParam === 'timeLimit') 
      ? typeParam 
      : 'permanent';
    const timeLimit = params.get('timeLimit') ? parseInt(params.get('timeLimit') || '0', 10) : undefined;
    const createdAt = params.get('createdAt') ? parseInt(params.get('createdAt') || '0', 10) : undefined;
    const limitReached = params.get('limitReached') === 'true';
    
    setPageParams({ url, blockType: type, timeLimit, createdAt, limitReached });
  }, []);
  
  const blockedMessage = getBlockedMessage(pageParams);
  
  return (
    <div className="blocked-page-container">
      <div className="blocked-content">
        <div className="blocked-icon">
          <span className="material-icons" aria-hidden="true">block</span>
        </div>
        
        <h1>Site Blocked</h1>
        
        <p className="blocked-message">{blockedMessage}</p>
        
        {pageParams.blockType === 'timeLimit' && pageParams.limitReached && (
          <div className="time-limit-info">
            <p>Your time limit settings:</p>
            <ul>
              <li>Daily limit: {pageParams.timeLimit} minutes</li>
              <li>Status: Limit reached for today</li>
              <li>Resets: Tomorrow at midnight</li>
            </ul>
          </div>
        )}
        
        <div className="action-buttons">
          <button 
            className="back-button"
            onClick={() => window.history.back()}
          >
            Go Back
          </button>
          <button 
            className="home-button"
            onClick={() => {
              try {
                window.location.href = chrome.runtime.getURL('index.html');
              } catch (e) {
                // Fallback if chrome API is not available
                window.location.href = '/index.html';
              }
            }}
          >
            Go to Home
          </button>
        </div>
        
        <div className="motivation">
          <p>"Focus on being productive instead of busy."</p>
        </div>
      </div>
    </div>
  );
};

export default BlockedPage; 