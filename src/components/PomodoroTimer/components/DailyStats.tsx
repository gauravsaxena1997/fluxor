import React from 'react';
import { CycleType } from '../types';

interface DailyStatsProps {
  pomodoros: number;
  shortBreak: number;
  longBreak: number;
  currentCycle: CycleType;
  onCycleSwitch: (cycle: CycleType) => void;
  isTimerRunning: boolean;
}

export const DailyStats: React.FC<DailyStatsProps> = ({
  pomodoros,
  shortBreak,
  longBreak,
  currentCycle,
  onCycleSwitch,
  isTimerRunning,
}) => {
  console.log('📊 DailyStats received props:', { pomodoros, shortBreak, longBreak });
  
  const stats = [
    { type: 'pomodoro' as CycleType, label: `Pomodoro${pomodoros !== 1 ? 's' : ''}`, count: pomodoros },
    { type: 'shortBreak' as CycleType, label: `Short Break${shortBreak !== 1 ? 's' : ''}`, count: shortBreak },
    { type: 'longBreak' as CycleType, label: `Long Break${longBreak !== 1 ? 's' : ''}`, count: longBreak },
  ];

  return (
    <div className="daily-stats">
      <div className="stats-container">
        {stats.map(({ type, label, count }) => (
          <div
            key={type}
            className={`stat-item ${currentCycle === type ? 'active' : ''} ${isTimerRunning ? 'disabled' : ''}`}
            onClick={() => !isTimerRunning && onCycleSwitch(type)}
          >
            <span className="stat-count">{count}</span>
            <span className="stat-label">{label}</span>
          </div>
        ))}
      </div>
      
      <style>{`
        .daily-stats {
          position: absolute;
          top: 2rem;
          left: 50%;
          transform: translateX(-50%);
          z-index: 10;
        }

        .stats-container {
          display: flex;
          gap: 1.5rem;
          background: rgba(0, 0, 0, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 12px;
          padding: 0; /* remove inner padding to eliminate top/bottom gap */
          min-width: 500px; /* slightly larger bar */
          min-height: 64px; /* increase height */
          align-items: stretch; /* let items fill full height */
        }

        .stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 0.75rem 1rem; /* taller items */
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          min-width: 120px;
          flex: 1;
          height: 100%; /* fill container height to remove vertical gap */
        }

        .stat-item:hover:not(.disabled) {
          background: rgba(255, 255, 255, 0.1);
        }

        .stat-item.active {
          background: rgba(255, 255, 255, 0.2);
          font-weight: bold;
        }

        .stat-item.disabled {
          cursor: not-allowed;
          opacity: 0.6;
        }

        .stat-count {
          font-size: 1.4rem; /* larger numbers */
          font-weight: bold;
          color: white;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
          line-height: 1.2;
        }

        .stat-label {
          font-size: 0.8rem; /* slightly larger label */
          color: rgba(255, 255, 255, 0.8);
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
          white-space: nowrap;
          line-height: 1.1;
        }

        @media (max-width: 768px) {
          .stats-container {
            gap: 0.75rem;
            padding: 0; /* keep no inner padding on mobile too */
            min-width: 320px;
            min-height: 56px;
          }

          .stat-item {
            min-width: 90px;
            padding: 0.5rem 0.75rem;
          }

          .stat-count {
            font-size: 1.25rem;
          }

          .stat-label {
            font-size: 0.7rem;
          }
        }
      `}</style>
    </div>
  );
};
