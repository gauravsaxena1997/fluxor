import React from 'react';
import { PomodoroTimer } from './PomodoroTimer';

export const TestPage: React.FC = () => {
  return (
    <div style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      width: '100vw', 
      height: '100vh', 
      zIndex: 9999 
    }}>
      <PomodoroTimer />
    </div>
  );
};
