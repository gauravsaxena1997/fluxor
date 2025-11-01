import React, { useState } from 'react';
import { usePomodoroTimer } from './hooks/usePomodoroTimer';
import { DailyStats } from './components/DailyStats';
import { TimerDisplay } from './components/TimerDisplay';
import { CompletionPopup } from './components/CompletionPopup';
import { SettingsModal } from './components/SettingsModal';
import MenuIcon from '@mui/icons-material/Menu';

export const PomodoroTimer: React.FC = () => {
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  
  console.log('🏠 PomodoroTimer component rendering...');
  
  const {
    isRunning,
    isPaused,
    cycleType,
    dailyStats,
    backgroundImg,
    backgroundPrefs,
    formattedTime,
    showCompletionPopup,
    completionMessage,
    startTimer,
    pauseTimer,
    resetTimer,
    switchCycle,
    dismissCompletionPopup,
    updateBackground,
    updateBackgroundPrefs,
    timerSettings,
    updateTimerSettings,
  } = usePomodoroTimer();

  console.log('🏠 PomodoroTimer received dailyStats:', JSON.stringify(dailyStats));
  console.log('🏠 PomodoroTimer received cycleType:', cycleType);

  return (
    <div className="pomodoro-timer">
      <div 
        className="background-image"
        style={
          backgroundImg && backgroundImg.includes('gradient') ? {
            backgroundImage: backgroundImg,
          } : backgroundImg ? {
            backgroundImage: `url(${backgroundImg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          } : {}
        }
      />
      
      {/* Hamburger Menu Icon */}
      <div 
        className="hamburger-menu"
        onClick={() => setIsSettingsModalOpen(true)}
      >
        <MenuIcon sx={{ fontSize: 32, color: 'white' }} />
      </div>
      
      <div className="content-overlay">
        <DailyStats
          pomodoros={dailyStats.pomodoros}
          shortBreak={dailyStats.shortBreak}
          longBreak={dailyStats.longBreak}
          currentCycle={cycleType}
          onCycleSwitch={switchCycle}
          isTimerRunning={isRunning}
        />
        
        <div className="timer-section">
          <TimerDisplay
            time={formattedTime}
            cycleType={cycleType}
            isRunning={isRunning}
            isPaused={isPaused}
            onStart={startTimer}
            onPause={pauseTimer}
            onReset={resetTimer}
          />
        </div>
      </div>

      {showCompletionPopup && (
        <CompletionPopup
          message={completionMessage}
          onDismiss={dismissCompletionPopup}
        />
      )}

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        currentBackground={backgroundImg}
        onBackgroundChange={updateBackground}
        backgroundPrefs={backgroundPrefs}
        onUpdateBackgroundPrefs={updateBackgroundPrefs}
        isTimerRunning={isRunning}
        timerSettings={timerSettings}
        onUpdateTimerSettings={updateTimerSettings}
      />
      
      <style>{`
        .pomodoro-timer {
          position: relative;
          width: 100vw;
          height: 100vh;
          overflow: hidden;
        }

        .background-image {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 1;
        }

        .hamburger-menu {
          position: fixed;
          top: 2rem;
          right: 2rem;
          z-index: 100;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 8px;
          background: rgba(0, 0, 0, 0.1);
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
        }

        .hamburger-menu:hover {
          background: rgba(0, 0, 0, 0.2);
          transform: scale(1.05);
        }

        .content-overlay {
          position: relative;
          z-index: 2;
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .timer-section {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Reset default styles */
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};
