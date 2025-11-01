import { useCallback, useEffect, useRef, useState } from 'react';
import { PomodoroData, CycleType, TimerSettings } from '../types';

const STORAGE_KEY = 'pomodoro-timer-data';

const DEFAULT_DATA: PomodoroData = {
  backgroundImg: '',
  dailyStats: {
    pomodoros: 0,
    shortBreak: 0,
    longBreak: 0,
  },
  timerStats: {
    value: '25:00',
    lastSyncedAt: Date.now(),
    cycleType: 'pomodoro',
    isRunning: false,
  },
  timerSettings: {
    pomodoro: 25,
    shortBreak: 5,
    longBreak: 15,
  },
  backgroundPrefs: {
    keywords: 'soothing, focus, nature, productivity',
    activeSection: 'shuffle',
  },
};

// Minimal Chrome-like typings used in this hook
type ChromeLike = {
  storage?: {
    local?: {
      get?: (keys: string[], cb: (items: Record<string, unknown>) => void) => void;
      set?: (items: Record<string, unknown>, cb: () => void) => void;
    };
    onChanged?: {
      addListener?: (
        cb: (changes: Record<string, { newValue?: PomodoroData; oldValue?: PomodoroData }>, area: string) => void
      ) => void;
      removeListener?: (
        cb: (changes: Record<string, { newValue?: PomodoroData; oldValue?: PomodoroData }>, area: string) => void
      ) => void;
    };
  };
  runtime?: {
    lastError?: { message?: string };
  };
};

// Check if we're in a Chrome extension environment
const isExtensionEnvironment = () => {
  const chromeApi = (globalThis as { chrome?: ChromeLike }).chrome;
  return !!(chromeApi?.storage?.local);
};

// Storage abstraction layer
const storageAPI = {
  async get(key: string) {
    if (isExtensionEnvironment()) {
      // Use callback form for maximum compatibility
      return await new Promise<unknown>((resolve, reject) => {
        try {
          const chromeApi = (globalThis as { chrome?: ChromeLike }).chrome;
          chromeApi?.storage?.local?.get?.([key], (items: Record<string, unknown>) => {
            const err = chromeApi?.runtime?.lastError;
            if (err) {
              reject(err);
              return;
            }
            resolve((items as Record<string, unknown>)[key]);
          });
        } catch (e) {
          reject(e);
        }
      });
    } else {
      // Fallback to localStorage for development
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : undefined;
    }
  },

  async set(key: string, value: unknown) {
    if (isExtensionEnvironment()) {
      // Use callback form for maximum compatibility
      await new Promise<void>((resolve, reject) => {
        try {
          const chromeApi = (globalThis as { chrome?: ChromeLike }).chrome;
          chromeApi?.storage?.local?.set?.({ [key]: value }, () => {
            const err = chromeApi?.runtime?.lastError;
            if (err) {
              reject(err);
              return;
            }
            resolve();
          });
        } catch (e) {
          reject(e);
        }
      });
    } else {
      // Fallback to localStorage for development
      localStorage.setItem(key, JSON.stringify(value));
    }
  }
};

export const useStorage = () => {
  const [data, setData] = useState<PomodoroData>(DEFAULT_DATA);
  const [isLoading, setIsLoading] = useState(true);
  // Prevent infinite refresh loops for Unsplash backgrounds within a single load
  const unsplashRefreshedRef = useRef(false);

  const loadData = useCallback(async () => {
    try {
      console.log('🔍 LOAD DEBUG: Starting loadData...');
      const storedData = await storageAPI.get(STORAGE_KEY) as PomodoroData;
      console.log('🔍 LOAD DEBUG: Raw stored data:', JSON.stringify(storedData));
      
      if (storedData) {
        console.log('🔍 LOAD DEBUG: Found stored data, merging with defaults and setting state');
        const merged: PomodoroData = {
          ...DEFAULT_DATA,
          ...storedData,
          timerSettings: {
            ...DEFAULT_DATA.timerSettings!,
            ...(storedData.timerSettings ?? {}),
          },
          backgroundPrefs: {
            ...DEFAULT_DATA.backgroundPrefs!,
            ...(storedData.backgroundPrefs ?? {}),
          },
        };
        console.log('🔍 LOAD DEBUG: dailyStats:', JSON.stringify(merged.dailyStats));
        console.log('🔍 LOAD DEBUG: timerStats:', JSON.stringify(merged.timerStats));
        console.log('🔍 LOAD DEBUG: timerSettings:', JSON.stringify(merged.timerSettings));
        console.log('🔍 LOAD DEBUG: backgroundPrefs:', JSON.stringify(merged.backgroundPrefs));
        setData(merged);
      } else {
        console.log('🔍 LOAD DEBUG: No stored data, using defaults');
        await saveData(DEFAULT_DATA);
      }
    } catch (error) {
      console.error('🔍 LOAD DEBUG: Error loading data:', error);
      setData(DEFAULT_DATA);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateTimerSettings = async (settings: Partial<TimerSettings>) => {
    // Merge with existing or defaults
    const merged: TimerSettings = {
      pomodoro: data.timerSettings?.pomodoro ?? DEFAULT_DATA.timerSettings!.pomodoro,
      shortBreak: data.timerSettings?.shortBreak ?? DEFAULT_DATA.timerSettings!.shortBreak,
      longBreak: data.timerSettings?.longBreak ?? DEFAULT_DATA.timerSettings!.longBreak,
      ...settings,
    };

    const newData: PomodoroData = {
      ...data,
      timerSettings: merged,
    };
    await saveData(newData);
  };

  const updateBackgroundPrefs = async (prefs: Partial<NonNullable<PomodoroData['backgroundPrefs']>>) => {
    const merged = {
      keywords: data.backgroundPrefs?.keywords ?? DEFAULT_DATA.backgroundPrefs!.keywords,
      activeSection: data.backgroundPrefs?.activeSection ?? DEFAULT_DATA.backgroundPrefs!.activeSection,
      ...prefs,
    };
    const newData: PomodoroData = {
      ...data,
      backgroundPrefs: merged,
    };
    await saveData(newData);
  };

  const saveData = async (newData: PomodoroData) => {
    try {
      console.log('💾 SAVE DEBUG: saveData called');
      console.log('💾 SAVE DEBUG: dailyStats:', JSON.stringify(newData.dailyStats));
      console.log('💾 SAVE DEBUG: timerStats:', JSON.stringify(newData.timerStats));
      console.log('💾 SAVE DEBUG: timerSettings:', JSON.stringify(newData.timerSettings));
      console.log('💾 SAVE DEBUG: Full data object:', JSON.stringify(newData));
      
      await storageAPI.set(STORAGE_KEY, newData);
      console.log('💾 SAVE DEBUG: Storage set completed successfully');
      
      setData(newData);
      console.log('💾 SAVE DEBUG: State updated successfully');
    } catch (error) {
      console.error('💾 SAVE DEBUG: Error saving data:', error);
    }
  };

  const updateTimerStats = async (value: string, cycleType: CycleType, isRunning: boolean = false) => {
    const newData = {
      ...data,
      timerStats: {
        value,
        lastSyncedAt: Date.now(),
        cycleType,
        isRunning,
      },
    };
    try {
      console.log('💾 updateTimerStats - saving to storage:', { value, cycleType, isRunning });
      await storageAPI.set(STORAGE_KEY, newData);
      console.log('💾 Storage save completed');
      
      // Only update state if the values are actually different
      const shouldUpdate = data.timerStats.value !== value || data.timerStats.cycleType !== cycleType || data.timerStats.isRunning !== isRunning;
      console.log('💾 Should update state?', shouldUpdate);
      console.log('💾 Current data.timerStats:', JSON.stringify(data.timerStats));
      console.log('💾 New values:', { value, cycleType, isRunning });
      
      if (shouldUpdate) {
        console.log('💾 Updating state with newData');
        setData(newData);
      } else {
        console.log('💾 Skipping state update - values unchanged');
      }
    } catch (error) {
      console.error('Error saving timer stats:', error);
    }
  };

  const updateDailyStats = async (newStats: PomodoroData['dailyStats']) => {
    console.log('🔄 === UPDATE DAILY STATS DEBUG START ===');
    console.log('📊 Input newStats (FULL OBJECT):', JSON.stringify(newStats));
    console.log('📊 Current data.dailyStats:', JSON.stringify(data.dailyStats));
    console.log('📊 Full data object:', JSON.stringify(data));
    
    const newData = {
      ...data,
      dailyStats: newStats, // Use the full stats object directly
    };
    
    console.log('📊 New data being saved:', JSON.stringify(newData.dailyStats));
    console.log('📊 Full new data object:', JSON.stringify(newData));
    
    await saveData(newData);
    
    console.log('🔄 === UPDATE DAILY STATS DEBUG END ===');
  };

  const resetDailyStats = async () => {
    const newData = {
      ...data,
      dailyStats: {
        pomodoros: 0,
        shortBreak: 0,
        longBreak: 0,
      },
    };
    await saveData(newData);
  };

  const updateBackground = useCallback(async (backgroundImg: string) => {
    const newData = {
      ...data,
      backgroundImg,
    };
    await saveData(newData);
  }, [data]);

  const shuffleBackground = useCallback(async () => {
    console.log('PomodoroTimer shuffleBackground called (for startup only)');
    
    const gradients = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
      'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
      'linear-gradient(135deg, #fad0c4 0%, #ffd1ff 100%)',
    ];
    
    try {
      // Try Unsplash first with random keywords (for startup)
      const keywords = ['nature', 'landscape', 'mountain', 'ocean', 'forest', 'sunset', 'sky', 'abstract', 'minimal', 'color', 'architecture', 'city', 'space', 'flowers', 'desert'];
      const randomKeyword = keywords[Math.floor(Math.random() * keywords.length)];
      
      console.log('PomodoroTimer using random keyword:', randomKeyword);
      
      // Using Unsplash Source API random route with cache-busting signature
      const unsplashUrl = `https://source.unsplash.com/random/1920x1080/?${randomKeyword}&sig=${Date.now()}`;
      
      console.log('PomodoroTimer testing Unsplash URL:', unsplashUrl);
      
      // Test if image loads properly
      const img = new Image();
      img.referrerPolicy = 'no-referrer';
      img.onload = async () => {
        console.log('PomodoroTimer: Unsplash image loaded successfully');
        await updateBackground(unsplashUrl);
      };
      img.onerror = async (e) => {
        console.log('PomodoroTimer: Unsplash failed, trying Picsum fallback', e);
        // Try Picsum as a CORS-friendly random image fallback before gradient
        const picsumUrl = `https://picsum.photos/1920/1080?random=${Date.now()}`;
        const img2 = new Image();
        img2.referrerPolicy = 'no-referrer';
        img2.crossOrigin = 'anonymous';
        img2.onload = async () => {
          console.log('PomodoroTimer: Picsum image loaded successfully');
          await updateBackground(picsumUrl);
        };
        img2.onerror = async (e2) => {
          console.log('PomodoroTimer: Picsum failed, using gradient fallback', e2);
          const randomGradient = gradients[Math.floor(Math.random() * gradients.length)];
          await updateBackground(randomGradient);
        };
        img2.src = picsumUrl;
      };
      img.src = unsplashUrl;
      
    } catch (error) {
      console.error('Error setting shuffled background:', error);
      // Fallback to gradient
      const randomGradient = gradients[Math.floor(Math.random() * gradients.length)];
      console.log('PomodoroTimer using fallback gradient:', randomGradient);
      await updateBackground(randomGradient);
    }
  }, [updateBackground]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Cross-tab sync: listen for storage changes and update state
  useEffect(() => {
    // LocalStorage sync for dev
    const onWindowStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY || !e.newValue) return;
      try {
        const parsed = JSON.parse(e.newValue) as PomodoroData;
        const merged: PomodoroData = {
          ...DEFAULT_DATA,
          ...parsed,
          timerSettings: {
            ...DEFAULT_DATA.timerSettings!,
            ...(parsed.timerSettings ?? {}),
          },
          backgroundPrefs: {
            ...DEFAULT_DATA.backgroundPrefs!,
            ...(parsed.backgroundPrefs ?? {}),
          },
        };
        setData(merged);
      } catch (err) {
        console.warn('Failed to parse localStorage change for Pomodoro data', err);
      }
    };

    window.addEventListener('storage', onWindowStorage);

    // Chrome extension storage sync
    type StorageChange = { newValue?: PomodoroData; oldValue?: PomodoroData };
    const onChromeStorage = (
      changes: Record<string, StorageChange>,
      area: string
    ) => {
      if (area !== 'local') return;
      const change = changes[STORAGE_KEY];
      if (!change || !change.newValue) return;
      const parsed = change.newValue as PomodoroData;
      const merged: PomodoroData = {
        ...DEFAULT_DATA,
        ...parsed,
        timerSettings: {
          ...DEFAULT_DATA.timerSettings!,
          ...(parsed.timerSettings ?? {}),
        },
        backgroundPrefs: {
          ...DEFAULT_DATA.backgroundPrefs!,
          ...(parsed.backgroundPrefs ?? {}),
        },
      };
      setData(merged);
    };

    if (isExtensionEnvironment()) {
      try {
        type ChromeLike = {
          storage?: {
            onChanged?: {
              addListener?: (
                cb: (changes: Record<string, StorageChange>, area: string) => void
              ) => void;
              removeListener?: (
                cb: (changes: Record<string, StorageChange>, area: string) => void
              ) => void;
            };
          };
        };
        const chromeApi = (globalThis as { chrome?: ChromeLike }).chrome;
        chromeApi?.storage?.onChanged?.addListener?.(onChromeStorage);
      } catch (e) {
        console.warn('Failed to add chrome.storage listener', e);
      }
    }

    return () => {
      window.removeEventListener('storage', onWindowStorage);
      if (isExtensionEnvironment()) {
        try {
          type ChromeLike = {
            storage?: {
              onChanged?: {
                addListener?: (
                  cb: (changes: Record<string, StorageChange>, area: string) => void
                ) => void;
                removeListener?: (
                  cb: (changes: Record<string, StorageChange>, area: string) => void
                ) => void;
              };
            };
          };
          const chromeApi = (globalThis as { chrome?: ChromeLike }).chrome;
          chromeApi?.storage?.onChanged?.removeListener?.(onChromeStorage);
        } catch (e) {
          console.warn('Failed to remove chrome.storage listener', e);
        }
      }
    };
  }, []);

  // Auto-shuffle background on first load if no background is set
  useEffect(() => {
    if (!isLoading && (!data.backgroundImg || data.backgroundImg.trim() === '')) {
      console.log('PomodoroTimer: No background set, triggering shuffle...', { bg: data.backgroundImg });
      shuffleBackground().catch(error => console.error('PomodoroTimer shuffle failed:', error));
    }
  }, [isLoading, data.backgroundImg, shuffleBackground]);

  // If the saved background is an Unsplash Source URL, refresh it on each load
  // to ensure a new random image without changing user-selected gradients or custom URLs.
  useEffect(() => {
    if (isLoading || unsplashRefreshedRef.current) return;
    const bg = data.backgroundImg;
    if (bg && bg.includes('source.unsplash.com')) {
      try {
        // Preserve existing keywords and replace/add sig for cache busting
        const qIndex = bg.indexOf('?');
        if (qIndex !== -1) {
          const base = bg.substring(0, qIndex);
          let query = bg.substring(qIndex + 1);
          // Remove existing sig if present
          query = query.replace(/(&|\?)sig=\d+/g, '').replace(/^&+|&+$/g, '');
          const refreshedUrl = `${base}?${query}${query ? '&' : ''}sig=${Date.now()}`;
          if (refreshedUrl !== bg) {
            console.log('PomodoroTimer: Refreshing Unsplash background for this load');
            unsplashRefreshedRef.current = true;
            updateBackground(refreshedUrl);
          }
        }
      } catch (e) {
        console.warn('PomodoroTimer: Failed to refresh Unsplash background URL', e);
      }
    }
  }, [isLoading, data.backgroundImg, updateBackground]);

  return {
    data,
    isLoading,
    saveData,
    updateTimerStats,
    updateDailyStats,
    resetDailyStats,
    updateBackground,
    shuffleBackground,
    updateTimerSettings,
    updateBackgroundPrefs,
  };
};
