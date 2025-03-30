import React, { useEffect, useState } from 'react';
import './BlockedSite.css';

// Import block images
import blockImage1 from '../../assets/block-images/block1.jpg';
import blockImage2 from '../../assets/block-images/block2.jpg';
import blockImage3 from '../../assets/block-images/block3.jpg';
import blockImage4 from '../../assets/block-images/block4.jpg';
import blockImage5 from '../../assets/block-images/block5.jpg';
import blockImage6 from '../../assets/block-images/block6.jpg';
import blockImage7 from '../../assets/block-images/block7.jpg';
import blockImage8 from '../../assets/block-images/block8.jpg';
import blockImage9 from '../../assets/block-images/block9.jpg';
import blockImage10 from '../../assets/block-images/block10.jpg';

interface BlockedPageProps {
  url: string;
  blockType: 'permanent' | 'timeLimit';
  timeLimit?: number;
  createdAt?: number;
  limitReached?: boolean;
}

// Collection of block images
const blockImages = [
  blockImage1, blockImage2, blockImage3, blockImage4, blockImage5,
  blockImage6, blockImage7, blockImage8, blockImage9, blockImage10
];

// Collection of predefined messages for permanent blocks
const permanentBlockMessages = [
  "Nice try! This site is permanently blocked. Maybe try reading a book instead?",
  "Access denied! Your future self will thank you for staying away from this site.",
  "Sorry, but this site is off-limits. How about doing something productive instead?",
  "This site has been banished to the shadow realm. Your productivity thanks you!",
  "Nope! This site is blocked forever. Time to focus on what really matters.",
  "You've been permanently blocked from procrastination. You're welcome!",
  "This site is blocked. Forever. As in, don't even try again tomorrow.",
  "Access to this distraction has been revoked. Productivity level up!",
  "This site is blocked because your goals are more important than temporary entertainment.",
  "Site blocked! Remember: temporary fun, permanent regret. Stay focused!"
];

// Collection of predefined messages for time-limited blocks
const timeLimitMessages = [
  "Time's up! You've reached your daily limit for this site.",
  "That's enough for today! Your time limit has been reached.",
  "Looks like you've spent enough time here today. Come back tomorrow!",
  "Time limit reached! Your productivity is being protected.",
  "Sorry, no more time left for this site today. Try again tomorrow.",
  "Daily time allocation depleted. Time to switch to something more productive!",
  "You've used up all your allotted time here. See you tomorrow!",
  "Time's up! Your future self will thank you for this limit.",
  "That's all the time you've allowed yourself for today. Good job setting boundaries!",
  "Time limit reached! Remember why you set this limit in the first place."
];

// Collection of motivational messages
const motivationalMessages = [
  "Focus on being productive instead of busy.",
  "The key to success is to focus on goals, not obstacles.",
  "Your focus determines your reality.",
  "Small progress is still progress.",
  "You didn't come this far to only come this far.",
  "Success is the sum of small efforts repeated day in and day out.",
  "What you stay focused on will grow.",
  "The most powerful way to change your life is to change your habits.",
  "Remember why you started.",
  "Every accomplishment starts with the decision to try.",
  "You have the same amount of hours in a day as everyone else. Make them count.",
  "Don't count the days, make the days count."
];

function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

// Helper function to safely get hostname from URL string
function safeGetHostname(urlString: string): string {
  if (!urlString || urlString.trim() === '') {
    return 'this site';
  }
  
  try {
    // Make sure URL has a protocol
    const urlWithProtocol = urlString.startsWith('http') ? urlString : `https://${urlString}`;
    return new URL(urlWithProtocol).hostname;
  } catch (error) {
    console.error('Invalid URL:', urlString, error);
    return urlString; // Return the original string if parsing fails
  }
}

function getBlockedMessage(props: BlockedPageProps): string {
  const { url, blockType, timeLimit, limitReached } = props;
  const hostname = safeGetHostname(url);
  
  if (blockType === 'permanent') {
    return getRandomItem(permanentBlockMessages).replace(/this site/gi, hostname);
  }
  
  if (blockType === 'timeLimit' && limitReached) {
    const message = getRandomItem(timeLimitMessages).replace(/this site/gi, hostname);
    return timeLimit ? message.replace(/time limit/gi, `${timeLimit}-minute limit`) : message;
  }
  
  return `This site (${hostname}) has been blocked to help you stay focused.`;
}

export const BlockedPage: React.FC = () => {
  const [pageParams, setPageParams] = useState<BlockedPageProps>({
    url: '',
    blockType: 'permanent'
  });
  const [randomImage, setRandomImage] = useState<string>('');
  const [motivationalMessage, setMotivationalMessage] = useState<string>('');
  
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
    
    // Set random image and motivational message
    setRandomImage(getRandomItem(blockImages));
    setMotivationalMessage(getRandomItem(motivationalMessages));
  }, []);
  
  const blockedMessage = getBlockedMessage(pageParams);
  const hostname = pageParams.url ? safeGetHostname(pageParams.url) : 'this site';
  
  return (
    <div 
      className="blocked-page-container"
      style={{ 
        backgroundImage: `url(${randomImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="overlay"></div>
      <div className="blocked-content">
        <div className="blocked-icon">
          <span className="material-icons" aria-hidden="true">block</span>
        </div>
        
        <h1>Access Blocked</h1>
        
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
          <h3>Remember Why You Blocked {hostname}</h3>
          <p>"{motivationalMessage}"</p>
        </div>
      </div>
    </div>
  );
};

export default BlockedPage; 