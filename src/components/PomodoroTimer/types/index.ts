export type CycleType = 'pomodoro' | 'shortBreak' | 'longBreak';

export interface DailyStats {
  pomodoros: number;
  shortBreak: number;
  longBreak: number;
}

export interface TimerStats {
  value: string; // MM:SS format
  lastSyncedAt: number; // timestamp
  cycleType: CycleType;
  isRunning: boolean; // track if timer was running when saved
}

export interface TimerSettings {
  pomodoro: number; // minutes
  shortBreak: number; // minutes
  longBreak: number; // minutes
}

export interface PomodoroData {
  backgroundImg: string;
  dailyStats: DailyStats;
  timerStats: TimerStats;
  timerSettings?: TimerSettings; // optional for backward compatibility
  backgroundPrefs?: BackgroundPrefs; // optional for backward compatibility
}

export interface TimerState {
  timeLeft: number; // seconds
  isRunning: boolean;
  cycleType: CycleType;
  dailyStats: DailyStats;
}

export const CYCLE_DURATIONS: Record<CycleType, number> = {
  // Defaults: 25, 5, 15 minutes (in seconds)
  pomodoro: 25 * 60,
  shortBreak: 5 * 60,  
  longBreak: 15 * 60,
};

export const CYCLE_LABELS: Record<CycleType, string> = {
  pomodoro: 'You are in a focused session',
  shortBreak: 'You are on a short break',
  longBreak: 'Enjoy a long break',
};

export type BackgroundSection = 'shuffle' | 'custom' | 'presets';

export interface BackgroundPrefs {
  keywords: string;
  activeSection: BackgroundSection;
}
