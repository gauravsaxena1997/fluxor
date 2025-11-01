import { useCallback, useEffect, useRef, useState } from 'react';
import { CycleType, CYCLE_DURATIONS, TimerSettings, PomodoroData } from '../types';
import { useStorage } from './useStorage';

export const usePomodoroTimer = () => {
  const { data, isLoading, updateTimerStats, updateBackground, updateTimerSettings, saveData, updateBackgroundPrefs } = useStorage();
  
  console.log('🔄 usePomodoroTimer hook executing with data:', JSON.stringify(data.dailyStats));
  const [timeLeft, setTimeLeft] = useState(CYCLE_DURATIONS.pomodoro);
  const [isRunning, setIsRunning] = useState(false);
  const [showCompletionPopup, setShowCompletionPopup] = useState(false);
  const [completionMessage, setCompletionMessage] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);
  const [everStarted, setEverStarted] = useState(false);

  // Refs to prevent stale closures
  const timeLeftRef = useRef(timeLeft);
  const isRunningRef = useRef(isRunning);
  const cycleTypeRef = useRef(data.timerStats.cycleType);
  const dataRef = useRef(data);
  const prevSettingsRef = useRef<TimerSettings | undefined>(data.timerSettings);
  const prevCycleRef = useRef<CycleType | undefined>(data.timerStats.cycleType as CycleType);

  // Update refs when state changes
  useEffect(() => {
    console.log('🔄 timeLeftRef updated from', timeLeftRef.current, 'to', timeLeft);
    timeLeftRef.current = timeLeft;
  }, [timeLeft]);

  useEffect(() => {
    console.log('🔄 isRunningRef updated from', isRunningRef.current, 'to', isRunning);
    isRunningRef.current = isRunning;
  }, [isRunning]);

  useEffect(() => {
    console.log('🔄 cycleTypeRef updated from', cycleTypeRef.current, 'to', data.timerStats.cycleType);
    cycleTypeRef.current = data.timerStats.cycleType;
  }, [data.timerStats.cycleType]);

  useEffect(() => {
    console.log('🔄 dataRef updated with dailyStats:', JSON.stringify(data.dailyStats));
    dataRef.current = data;
  }, [data]);

  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const parseTime = (timeStr: string): number => {
    const [mins, secs] = timeStr.split(':').map(Number);
    return mins * 60 + secs;
  };

  const getCycleDurationSeconds = useCallback((cycle: CycleType): number => {
    const settings = dataRef.current.timerSettings;
    if (settings) {
      const minutes = cycle === 'pomodoro' ? settings.pomodoro : cycle === 'shortBreak' ? settings.shortBreak : settings.longBreak;
      return Math.max(1, Math.floor(minutes)) * 60;
    }
    return CYCLE_DURATIONS[cycle];
  }, []);

  const handleTimerComplete = useCallback(() => {
    console.log('🎯 === TIMER COMPLETION DEBUG START ===');
    console.log('🔍 Current timeLeft state:', timeLeft);
    console.log('🔍 timeLeftRef.current:', timeLeftRef.current);
    console.log('🔍 isRunning state:', isRunning);
    console.log('🔍 isRunningRef.current:', isRunningRef.current);
    
    const currentCycleType = cycleTypeRef.current;
    const currentData = dataRef.current;
    const currentStats = currentData.dailyStats;
    
    console.log('📊 Current cycle type:', currentCycleType);
    console.log('📊 Current daily stats BEFORE update:', JSON.stringify(currentStats));
    console.log('📊 stale data object:', JSON.stringify(data));
    console.log('📊 fresh dataRef object:', JSON.stringify(currentData));
    
    // Update daily stats - FIXED: Pass the incremented values directly
    let newStats;
    if (currentCycleType === 'pomodoro') {
      newStats = { pomodoros: currentStats.pomodoros + 1, shortBreak: currentStats.shortBreak, longBreak: currentStats.longBreak };
      console.log('✅ Incrementing pomodoros to:', newStats.pomodoros);
    } else if (currentCycleType === 'shortBreak') {
      newStats = { pomodoros: currentStats.pomodoros, shortBreak: currentStats.shortBreak + 1, longBreak: currentStats.longBreak };
      console.log('✅ Incrementing shortBreak to:', newStats.shortBreak);
    } else if (currentCycleType === 'longBreak') {
      newStats = { pomodoros: currentStats.pomodoros, shortBreak: currentStats.shortBreak, longBreak: currentStats.longBreak + 1 };
      console.log('✅ Incrementing longBreak to:', newStats.longBreak);
    } else {
      newStats = currentStats;
    }
    
    console.log('📊 Final stats update object:', JSON.stringify(newStats));
    // Reset timer to full duration
    const fullDuration = getCycleDurationSeconds(currentCycleType as CycleType);
    console.log('🔄 Resetting timer to full duration:', fullDuration);
    console.log('🔄 Current cycle type for reset:', currentCycleType);
    console.log('🔄 Formatted time for reset:', formatTime(fullDuration));
    
    setTimeLeft(fullDuration);
    // After completion, consider the session not actively started anymore so Reset hides
    setEverStarted(false);
    // Atomically persist both dailyStats and timerStats to avoid races
    const merged: PomodoroData = {
      ...currentData,
      dailyStats: newStats,
      timerStats: {
        value: formatTime(fullDuration),
        lastSyncedAt: Date.now(),
        cycleType: currentCycleType as CycleType,
        isRunning: false,
      },
    };
    console.log('💾 Saving merged completion data atomically');
    saveData(merged);
    
    console.log('🔄 Timer reset completed - new timeLeft should be:', fullDuration);
    
    // Show completion notification
    const cycleName = currentCycleType === 'pomodoro' ? 'pomodoro' :
                     currentCycleType === 'shortBreak' ? 'short break' : 'long break';
    setCompletionMessage(`Your ${cycleName} is complete!`);
    setShowCompletionPopup(true);
    
    console.log('🎯 === TIMER COMPLETION DEBUG END ===');
  }, [getCycleDurationSeconds, data, isRunning, timeLeft, formatTime, saveData]);

  // Initialize timer state on first load only
  useEffect(() => {
    if (isLoading || isInitialized) return;

    console.log('📦 === INITIALIZATION DEBUG START ===');
    console.log('📦 Full data object:', JSON.stringify(data));
    console.log('📦 isLoading:', isLoading);
    console.log('📦 isInitialized:', isInitialized);

    const { timerStats } = data;
    console.log('📦 timerStats from data:', JSON.stringify(timerStats));
    
    const savedTime = parseTime(timerStats.value);
    const fullDuration = getCycleDurationSeconds(timerStats.cycleType as CycleType);
    
    console.log('📦 savedTime (parsed):', savedTime);
    console.log('📦 fullDuration for', timerStats.cycleType, ':', fullDuration);
    console.log('📦 timerStats.isRunning:', timerStats.isRunning);
    
    // FIXED: Always restore the running state from storage
    setIsRunning(timerStats.isRunning);
    console.log('📦 Restored isRunning state to:', timerStats.isRunning);
    
    // If saved time equals full duration, treat as reset/fresh start
    if (savedTime === fullDuration) {
      console.log('📦 Saved time equals full duration, setting fresh start');
      setTimeLeft(fullDuration);
      setEverStarted(false);
    } else {
      console.log('📦 Saved time does not equal full duration');
      // Calculate elapsed time if timer was running when saved
      if (timerStats.isRunning) {
        console.log('📦 Timer was running, calculating elapsed time');
        const timeElapsed = Math.floor((Date.now() - timerStats.lastSyncedAt) / 1000);
        const remainingTime = Math.max(0, savedTime - timeElapsed);
        console.log('📦 timeElapsed:', timeElapsed);
        console.log('📦 remainingTime:', remainingTime);

        if (remainingTime === 0 && savedTime > 0) {
          console.log('📦 Session was completed while away');
          // Session completed while extension was closed - increment stats
          const currentStats = data.dailyStats;
          let newStats;
          if (timerStats.cycleType === 'pomodoro') {
            newStats = { pomodoros: currentStats.pomodoros + 1, shortBreak: currentStats.shortBreak, longBreak: currentStats.longBreak };
          } else if (timerStats.cycleType === 'shortBreak') {
            newStats = { pomodoros: currentStats.pomodoros, shortBreak: currentStats.shortBreak + 1, longBreak: currentStats.longBreak };
          } else if (timerStats.cycleType === 'longBreak') {
            newStats = { pomodoros: currentStats.pomodoros, shortBreak: currentStats.shortBreak, longBreak: currentStats.longBreak + 1 };
          } else {
            newStats = currentStats;
          }
          
          // Persist completion and reset atomically to avoid overwrites
          const cycleName = timerStats.cycleType === 'pomodoro' ? 'pomodoro' :
                           timerStats.cycleType === 'shortBreak' ? 'short break' : 'long break';
          const completionTime = new Date(timerStats.lastSyncedAt + (savedTime * 1000));
          setCompletionMessage(`Your last ${cycleName} was completed at ${completionTime.toLocaleTimeString()}. You can start a new one now.`);
          setShowCompletionPopup(true);
          setTimeLeft(fullDuration);
          setEverStarted(false);
          setIsRunning(false);
          const merged: PomodoroData = {
            ...dataRef.current,
            dailyStats: newStats,
            timerStats: {
              value: formatTime(fullDuration),
              lastSyncedAt: Date.now(),
              cycleType: timerStats.cycleType as CycleType,
              isRunning: false,
            },
          };
          console.log('💾 Saving merged data for completed-while-away case');
          saveData(merged);
        } else {
          console.log('📦 Setting time to remainingTime and continuing timer:', remainingTime);
          setTimeLeft(remainingTime);
          setEverStarted(true);
          // Timer continues running
        }
      } else {
        console.log('📦 Timer was paused, using saved time exactly:', savedTime);
        // Timer was paused, use saved time exactly
        setTimeLeft(savedTime);
        setEverStarted(savedTime !== fullDuration);
      }
    }

    console.log('📦 === INITIALIZATION DEBUG END ===');
    setIsInitialized(true);
  }, [isLoading, isInitialized, data, getCycleDurationSeconds, formatTime, saveData]);

  // Single interval for countdown and saving
  useEffect(() => {
    if (!isRunning) return;

    console.log('⏰ Starting timer interval for cycle:', cycleTypeRef.current);

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        const newTime = prev - 1;
        console.log(`⏱️ Timer tick: ${newTime}s remaining (cycle: ${cycleTypeRef.current})`);

        if (newTime <= 0) {
          // Do NOT persist a "0s running" state; go straight to completion to avoid races
          console.log('🎯 TIMER REACHED 0! Calling completion handler...');
          console.log('🔍 Before completion - timeLeft state will be:', newTime);
          setIsRunning(false);
          handleTimerComplete();
          return 0;
        }

        // Save to storage every second while running
        updateTimerStats(formatTime(newTime), cycleTypeRef.current, true);
        return newTime;
      });
    }, 1000);

    return () => {
      console.log('🛑 Clearing timer interval');
      clearInterval(interval);
    };
  }, [isRunning, handleTimerComplete, updateTimerStats, formatTime]);

  // Cross-tab reconciliation: react to shared storage changes
  useEffect(() => {
    if (!isInitialized) return;

    const ts = data.timerStats;
    const currCycle = ts.cycleType as CycleType;
    const full = getCycleDurationSeconds(currCycle);
    const savedTime = parseTime(ts.value);

    // Sync running flag
    if (isRunningRef.current !== ts.isRunning) {
      setIsRunning(ts.isRunning);
    }

    // Compute target time from shared state
    let target = savedTime;
    if (ts.isRunning) {
      const elapsed = Math.floor((Date.now() - ts.lastSyncedAt) / 1000);
      target = Math.max(0, savedTime - elapsed);
    }

    // Only adjust if drift is meaningful to avoid churn
    if (Math.abs(timeLeftRef.current - target) > 1) {
      setTimeLeft(target);
    }

    // Maintain everStarted so Reset button visibility is consistent
    setEverStarted(target !== full);
  }, [data.timerStats, isInitialized, getCycleDurationSeconds]);

  const startTimer = useCallback(() => {
    setIsRunning(true);
    setEverStarted(true);
    // Immediately broadcast start to storage so other tabs sync within <1s
    const cycle = dataRef.current.timerStats.cycleType as CycleType;
    updateTimerStats(formatTime(timeLeftRef.current), cycle, true);
  }, [updateTimerStats, formatTime]);

  const pauseTimer = useCallback(() => {
    setIsRunning(false);
    // Save current state as paused
    updateTimerStats(formatTime(timeLeft), data.timerStats.cycleType, false);
  }, [timeLeft, data.timerStats.cycleType, updateTimerStats, formatTime]);

  const resetTimer = useCallback(() => {
    setIsRunning(false);
    const currentCycle = data.timerStats.cycleType as CycleType;
    const fullDuration = getCycleDurationSeconds(currentCycle);
    setTimeLeft(fullDuration);
    setEverStarted(false);
    
    // Save reset state as paused
    updateTimerStats(formatTime(fullDuration), currentCycle, false);
  }, [data.timerStats.cycleType, updateTimerStats, getCycleDurationSeconds, formatTime]);

  const switchCycle = useCallback((newCycle: CycleType) => {
    if (isRunning) return;
    
    setIsRunning(false);
    const full = getCycleDurationSeconds(newCycle);
    setTimeLeft(full);
    setEverStarted(false);
    // Save new cycle as paused
    updateTimerStats(formatTime(full), newCycle, false);
  }, [isRunning, updateTimerStats, getCycleDurationSeconds, formatTime]);

  const dismissCompletionPopup = useCallback(() => {
    setShowCompletionPopup(false);
    setCompletionMessage('');
  }, []);

  // Determine if timer is paused (explicitly started then stopped)
  const isPaused = !isRunning && everStarted;

  // When timer settings or cycle actually change and timer is not running, reset to full duration
  useEffect(() => {
    if (!isInitialized) return;

    const currSettings = data.timerSettings;
    const prevSettings = prevSettingsRef.current;
    const currCycle = data.timerStats.cycleType as CycleType;
    const prevCycle = prevCycleRef.current;

    const settingsChanged = !prevSettings ||
      prevSettings.pomodoro !== (currSettings?.pomodoro ?? 25) ||
      prevSettings.shortBreak !== (currSettings?.shortBreak ?? 5) ||
      prevSettings.longBreak !== (currSettings?.longBreak ?? 15);

    const cycleChanged = prevCycle !== currCycle;

    if (!settingsChanged && !cycleChanged) return;

    // Update refs for next comparison
    prevSettingsRef.current = currSettings as TimerSettings | undefined;
    prevCycleRef.current = currCycle;

    if (isRunningRef.current) return;

    const full = getCycleDurationSeconds(currCycle);
    setTimeLeft(full);
    updateTimerStats(formatTime(full), currCycle, false);
  }, [isInitialized, data.timerSettings, data.timerStats.cycleType, getCycleDurationSeconds, updateTimerStats, formatTime]);

  return {
    timeLeft,
    isRunning,
    isPaused,
    cycleType: data.timerStats.cycleType,
    dailyStats: data.dailyStats,
    backgroundImg: data.backgroundImg,
    backgroundPrefs: data.backgroundPrefs,
    timerSettings: data.timerSettings,
    formattedTime: formatTime(timeLeft),
    showCompletionPopup,
    completionMessage,
    startTimer,
    pauseTimer,
    resetTimer,
    switchCycle,
    dismissCompletionPopup,
    updateBackground,
    updateTimerSettings,
    updateBackgroundPrefs,
  };
};
