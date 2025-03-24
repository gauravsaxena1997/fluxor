import { useState, useEffect } from 'react';
import './InfoSection.css';
import { useTheme } from '../../context/ThemeContext';
import SearchIcon from '@mui/icons-material/Search';

interface InfoSectionProps {
  // No longer need linkPosition since we're using a fixed layout
}

const InfoSection = ({}: InfoSectionProps) => {
  const { isDarkMode } = useTheme();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  // Check for window resize to determine mobile vs desktop view
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Format time as HH:MM
  const formatTime = () => {
    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  // Format date as "Day, Month Date"
  const formatDate = () => {
    return currentTime.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
  };

  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.open(`https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`, '_blank');
    }
  };

  // Render desktop layout
  const renderDesktopLayout = () => (
    <div className="info-section-content">
      <div className="time-date-container">
        <div className="time">{formatTime()}</div>
        <div className="date">{formatDate()}</div>
      </div>
      <div className="search-container">
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-input-wrapper">
            <SearchIcon className="search-icon" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search the web"
              className="search-input"
            />
          </div>
        </form>
      </div>
    </div>
  );

  // Render mobile layout
  const renderMobileLayout = () => (
    <div className="info-section-content">
      <div className="time-container">
        <div className="time">{formatTime()}</div>
      </div>
      <div className="date-container">
        <div className="date">{formatDate()}</div>
      </div>
      <div className="search-container">
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-input-wrapper">
            <SearchIcon className="search-icon" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search"
              className="search-input"
            />
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div className={`info-section ${isDarkMode ? 'dark-theme' : 'light-theme'}`}>
      {isMobile ? renderMobileLayout() : renderDesktopLayout()}
    </div>
  );
};

export default InfoSection;
