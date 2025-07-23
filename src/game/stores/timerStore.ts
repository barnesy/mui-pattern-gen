import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

interface TimerState {
  isActive: boolean;
  isPaused: boolean;
  startTime: number | null;
  pausedTime: number;
  timeLimit: number | null; // in seconds
  elapsedTime: number; // in seconds
}

interface TimerStore extends TimerState {
  startTimer: (timeLimit?: number) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  stopTimer: () => void;
  tick: () => void;
  getTimeRemaining: () => number;
  getProgress: () => number;
}

const initialState: TimerState = {
  isActive: false,
  isPaused: false,
  startTime: null,
  pausedTime: 0,
  timeLimit: null,
  elapsedTime: 0,
};

export const useTimerStore = create<TimerStore>()(
  subscribeWithSelector((set, get) => ({
    ...initialState,
    
    startTimer: (timeLimit) => {
      set({
        isActive: true,
        isPaused: false,
        startTime: Date.now(),
        pausedTime: 0,
        timeLimit: timeLimit || null,
        elapsedTime: 0,
      });
    },
    
    pauseTimer: () => {
      const state = get();
      if (state.isActive && !state.isPaused) {
        set({
          isPaused: true,
          pausedTime: Date.now(),
        });
      }
    },
    
    resumeTimer: () => {
      const state = get();
      if (state.isActive && state.isPaused && state.startTime) {
        const pauseDuration = Date.now() - state.pausedTime;
        set({
          isPaused: false,
          startTime: state.startTime + pauseDuration,
          pausedTime: 0,
        });
      }
    },
    
    stopTimer: () => {
      set(initialState);
    },
    
    tick: () => {
      const state = get();
      if (state.isActive && !state.isPaused && state.startTime) {
        const elapsed = Math.floor((Date.now() - state.startTime) / 1000);
        set({ elapsedTime: elapsed });
        
        // Auto-stop if time limit reached
        if (state.timeLimit && elapsed >= state.timeLimit) {
          get().stopTimer();
        }
      }
    },
    
    getTimeRemaining: () => {
      const state = get();
      if (!state.timeLimit) return Infinity;
      const remaining = state.timeLimit - state.elapsedTime;
      return Math.max(0, remaining);
    },
    
    getProgress: () => {
      const state = get();
      if (!state.timeLimit) return 0;
      return Math.min(1, state.elapsedTime / state.timeLimit);
    },
  }))
);

// Helper hook for timer display
export const useFormattedTime = () => {
  const elapsedTime = useTimerStore(state => state.elapsedTime);
  const timeRemaining = useTimerStore(state => state.getTimeRemaining());
  const hasTimeLimit = useTimerStore(state => state.timeLimit !== null);
  
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  return {
    elapsed: formatTime(elapsedTime),
    remaining: hasTimeLimit ? formatTime(timeRemaining) : null,
    isExpired: hasTimeLimit && timeRemaining === 0,
  };
};