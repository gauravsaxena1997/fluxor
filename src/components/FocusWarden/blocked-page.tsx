import React, { useEffect, useState } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Gavel as GavelIcon } from '@mui/icons-material';
import { BlockedSite } from './types';
import { getRandomDungeonMessage, calculateTimeRemaining } from './utils';
import './BlockedSite.css';

interface BlockedPageProps {
  site: BlockedSite;
}

export const BlockedPage: React.FC<BlockedPageProps> = ({ site }) => {
  const message = getRandomDungeonMessage();
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (site.type === 'timeLimit') {
      const updateTime = () => {
        const remaining = calculateTimeRemaining(site);
        setTimeRemaining(remaining);
      };

      updateTime();
      const interval = setInterval(updateTime, 60000); // Update every minute
      return () => clearInterval(interval);
    }
  }, [site]);

  const handleBack = () => {
    window.history.back();
  };

  return (
    <Box className="blocked-page">
      <Box className="blocked-content">
        <GavelIcon className="gavel-icon" />
        <Typography variant="h4" className="blocked-title">
          Site Blocked by Focus Warden
        </Typography>
        <Typography variant="body1" className="blocked-message">
          {message}
        </Typography>
        <Typography variant="body2" className="blocked-url">
          {site.url}
        </Typography>
        {site.type === 'timeLimit' && timeRemaining !== null && (
          <Typography variant="body2" className="time-remaining">
            Time remaining: {timeRemaining} minutes
          </Typography>
        )}
        <Button
          variant="contained"
          onClick={handleBack}
          className="back-button"
        >
          Return to Safety
        </Button>
      </Box>
    </Box>
  );
}; 