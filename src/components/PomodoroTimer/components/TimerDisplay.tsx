import React from 'react';
import { CycleType, CYCLE_LABELS } from '../types';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import ReplayIcon from '@mui/icons-material/Replay';

interface TimerDisplayProps {
  time: string;
  cycleType: CycleType;
  isRunning: boolean;
  isPaused: boolean;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
}

export const TimerDisplay: React.FC<TimerDisplayProps> = ({
  time,
  cycleType,
  isRunning,
  isPaused,
  onStart,
  onPause,
  onReset,
}) => {
  console.log('🖥️ TimerDisplay received time:', time, 'cycle:', cycleType, 'isRunning:', isRunning, 'isPaused:', isPaused);
  
  return (
    <div className="timer-display">
      <div className="cycle-label">{CYCLE_LABELS[cycleType]}</div>
      <div className="timer-time">{time}</div>
      <div className="timer-controls">
        <button 
          className="timer-btn control-btn" 
          onClick={!isRunning ? onStart : onPause}
          aria-label={!isRunning ? (isPaused ? 'Resume timer' : 'Start timer') : 'Pause timer'}
          title={!isRunning ? (isPaused ? 'Resume timer' : 'Start timer') : 'Pause timer'}
        >
          {!isRunning ? <PlayArrowIcon sx={{ fontSize: 32 }} /> : <PauseIcon sx={{ fontSize: 32 }} />}
        </button>
        
        {isPaused && (
          <button 
            className="timer-btn control-btn reset-btn" 
            onClick={onReset}
            aria-label="Reset timer"
            title="Reset timer"
          >
            <ReplayIcon sx={{ fontSize: 32 }} />
          </button>
        )}
      </div>
      
      <style>{`
        .timer-display {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1.5rem;
        }

        .cycle-label {
          font-size: 1.75rem;
          color: white;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
          text-align: center;
          font-weight: 700; /* increased for better visibility */
          letter-spacing: 0.05em;
        }

        .timer-time {
          font-size: 8rem;
          font-weight: 700;
          color: white;
          text-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
          letter-spacing: 0.05em;
          line-height: 1;
        }

        .timer-controls {
          display: flex;
          gap: 1.5rem;
          align-items: center;
        }

        .timer-btn {
          background: rgba(255, 255, 255, 0.15);
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          width: 80px;
          height: 80px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(10px);
        }

        .timer-btn:hover {
          background: rgba(255, 255, 255, 0.25);
          border-color: rgba(255, 255, 255, 0.5);
          transform: scale(1.05);
        }

        .timer-btn:active {
          transform: scale(0.95);
        }

        .control-btn {
          color: white;
        }

        .reset-btn {
          color: white;
          width: 70px;
          height: 70px;
        }

        @media (max-width: 768px) {
          .cycle-label {
            font-size: 1.5rem;
          }

          .timer-time {
            font-size: 6rem;
          }

          .timer-btn {
            width: 70px;
            height: 70px;
          }
          
          .reset-btn {
            width: 60px;
            height: 60px;
          }
        }

        @media (max-width: 480px) {
          .cycle-label {
            font-size: 1.25rem;
          }

          .timer-time {
            font-size: 4rem;
          }

          .timer-btn {
            width: 60px;
            height: 60px;
          }
          
          .reset-btn {
            width: 50px;
            height: 50px;
          }
        }
      `}</style>
    </div>
  );
};
