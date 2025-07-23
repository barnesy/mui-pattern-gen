import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { 
  GameState, 
  Player, 
  Challenge, 
  Battle, 
  PatternSubmission,
  LeaderboardEntry,
  Notification,
  Achievement
} from '../types';

interface GameStore extends GameState {
  // Player actions
  setCurrentPlayer: (player: Player | null) => void;
  updatePlayerXP: (xp: number) => void;
  addAchievement: (achievement: Achievement) => void;
  updateStreak: (streak: number) => void;
  
  // Challenge actions
  setActiveChallenge: (challenge: Challenge | null) => void;
  startChallenge: (challenge: Challenge) => void;
  completeChallenge: (submission: PatternSubmission) => void;
  
  // Battle actions
  setActiveBattle: (battle: Battle | null) => void;
  updateBattleSubmission: (playerId: string, submission: PatternSubmission) => void;
  
  // Submission actions
  addRecentSubmission: (submission: PatternSubmission) => void;
  updateSubmissionStatus: (submissionId: string, status: PatternSubmission['status']) => void;
  
  // Leaderboard actions
  updateLeaderboard: (entries: LeaderboardEntry[]) => void;
  
  // Notification actions
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markNotificationRead: (notificationId: string) => void;
  clearNotifications: () => void;
  
  // Game flow
  resetGame: () => void;
}

const initialState: GameState = {
  currentPlayer: null,
  activeChallenge: null,
  activeBattle: null,
  recentSubmissions: [],
  leaderboard: [],
  notifications: [],
};

export const useGameStore = create<GameStore>()(
  subscribeWithSelector((set, get) => ({
    ...initialState,
    
    // Player actions
    setCurrentPlayer: (player) => set({ currentPlayer: player }),
    
    updatePlayerXP: (xp) => set((state) => {
      if (!state.currentPlayer) return state;
      
      const newXP = state.currentPlayer.xp + xp;
      const newLevel = Math.floor(newXP / 1000); // 1000 XP per level
      
      return {
        currentPlayer: {
          ...state.currentPlayer,
          xp: newXP,
          level: newLevel,
          totalPoints: state.currentPlayer.totalPoints + xp,
        }
      };
    }),
    
    addAchievement: (achievement) => set((state) => {
      if (!state.currentPlayer) return state;
      
      const exists = state.currentPlayer.achievements.some(a => a.id === achievement.id);
      if (exists) return state;
      
      return {
        currentPlayer: {
          ...state.currentPlayer,
          achievements: [...state.currentPlayer.achievements, achievement],
        }
      };
    }),
    
    updateStreak: (streak) => set((state) => {
      if (!state.currentPlayer) return state;
      
      return {
        currentPlayer: {
          ...state.currentPlayer,
          currentStreak: streak,
          longestStreak: Math.max(streak, state.currentPlayer.longestStreak),
        }
      };
    }),
    
    // Challenge actions
    setActiveChallenge: (challenge) => set({ activeChallenge: challenge }),
    
    startChallenge: (challenge) => {
      set({ activeChallenge: challenge });
      
      // Add notification
      get().addNotification({
        type: 'challenge',
        title: 'Challenge Started!',
        message: `You've started "${challenge.title}". Good luck!`,
      });
    },
    
    completeChallenge: (submission) => {
      const state = get();
      
      // Update player stats
      if (state.currentPlayer) {
        set((state) => ({
          currentPlayer: state.currentPlayer ? {
            ...state.currentPlayer,
            stats: {
              ...state.currentPlayer.stats,
              challengesCompleted: state.currentPlayer.stats.challengesCompleted + 1,
              patternsCreated: state.currentPlayer.stats.patternsCreated + 1,
            }
          } : null,
        }));
        
        // Award XP
        get().updatePlayerXP(submission.score.total);
      }
      
      // Add to recent submissions
      get().addRecentSubmission(submission);
      
      // Clear active challenge
      set({ activeChallenge: null });
      
      // Add notification
      get().addNotification({
        type: 'challenge',
        title: 'Challenge Completed!',
        message: `You scored ${submission.score.total} points!`,
      });
    },
    
    // Battle actions
    setActiveBattle: (battle) => set({ activeBattle: battle }),
    
    updateBattleSubmission: (playerId, submission) => set((state) => {
      if (!state.activeBattle) return state;
      
      return {
        activeBattle: {
          ...state.activeBattle,
          submissions: {
            ...state.activeBattle.submissions,
            [playerId]: submission,
          }
        }
      };
    }),
    
    // Submission actions
    addRecentSubmission: (submission) => set((state) => ({
      recentSubmissions: [submission, ...state.recentSubmissions].slice(0, 10),
    })),
    
    updateSubmissionStatus: (submissionId, status) => set((state) => ({
      recentSubmissions: state.recentSubmissions.map(sub =>
        sub.id === submissionId ? { ...sub, status } : sub
      ),
    })),
    
    // Leaderboard actions
    updateLeaderboard: (entries) => set({ leaderboard: entries }),
    
    // Notification actions
    addNotification: (notification) => set((state) => ({
      notifications: [
        {
          ...notification,
          id: `notif-${Date.now()}-${Math.random()}`,
          timestamp: new Date(),
          read: false,
        },
        ...state.notifications,
      ].slice(0, 20), // Keep last 20 notifications
    })),
    
    markNotificationRead: (notificationId) => set((state) => ({
      notifications: state.notifications.map(notif =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      ),
    })),
    
    clearNotifications: () => set({ notifications: [] }),
    
    // Game flow
    resetGame: () => set(initialState),
  }))
);

// Selectors
export const selectCurrentPlayer = (state: GameStore) => state.currentPlayer;
export const selectActiveChallenge = (state: GameStore) => state.activeChallenge;
export const selectActiveBattle = (state: GameStore) => state.activeBattle;
export const selectRecentSubmissions = (state: GameStore) => state.recentSubmissions;
export const selectLeaderboard = (state: GameStore) => state.leaderboard;
export const selectUnreadNotifications = (state: GameStore) => 
  state.notifications.filter(n => !n.read);