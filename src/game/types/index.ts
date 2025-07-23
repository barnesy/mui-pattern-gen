export interface Player {
  id: string;
  githubUsername: string;
  displayName: string;
  avatar: string;
  level: number;
  xp: number;
  totalPoints: number;
  currentStreak: number;
  longestStreak: number;
  joinedAt: Date;
  achievements: Achievement[];
  stats: PlayerStats;
}

export interface PlayerStats {
  patternsCreated: number;
  challengesCompleted: number;
  battlesWon: number;
  reviewsGiven: number;
  helpfulVotes: number;
  averageScore: number;
  favoriteCategory: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: Date;
  progress?: number;
  maxProgress?: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  points: number;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'epic';
  category: string;
  requirements: ChallengeRequirement[];
  timeLimit?: number; // in minutes
  points: number;
  bonusPoints?: BonusPoint[];
  createdAt: Date;
  expiresAt?: Date;
  githubIssueNumber?: number;
  completions: number;
  averageScore: number;
}

export interface ChallengeRequirement {
  id: string;
  description: string;
  type: 'component' | 'prop' | 'feature' | 'accessibility' | 'performance';
  validation?: string; // Regex or validation rule
}

export interface BonusPoint {
  description: string;
  points: number;
  condition: string;
}

export interface PatternSubmission {
  id: string;
  challengeId: string;
  playerId: string;
  patternName: string;
  code: string;
  props: Record<string, any>;
  score: Score;
  submittedAt: Date;
  githubPrUrl?: string;
  status: 'pending' | 'reviewing' | 'approved' | 'rejected';
  reviews: Review[];
}

export interface Score {
  total: number;
  breakdown: {
    speed: number;
    quality: number;
    creativity: number;
    accessibility: number;
    performance: number;
    bonuses: number;
  };
  aiAnalysis?: string;
}

export interface Review {
  id: string;
  reviewerId: string;
  rating: number;
  comment?: string;
  helpful: number;
  createdAt: Date;
}

export interface Team {
  id: string;
  name: string;
  description: string;
  avatar: string;
  members: string[]; // Player IDs
  captain: string;
  points: number;
  achievements: Achievement[];
  createdAt: Date;
}

export interface Battle {
  id: string;
  type: 'solo' | 'team';
  participants: string[]; // Player or Team IDs
  challenge: Challenge;
  startTime: Date;
  endTime?: Date;
  winner?: string;
  submissions: Record<string, PatternSubmission>;
  spectators: number;
  live: boolean;
}

export interface GameState {
  currentPlayer: Player | null;
  activeChallenge: Challenge | null;
  activeBattle: Battle | null;
  recentSubmissions: PatternSubmission[];
  leaderboard: LeaderboardEntry[];
  notifications: Notification[];
}

export interface LeaderboardEntry {
  rank: number;
  playerId: string;
  playerName: string;
  avatar: string;
  points: number;
  level: number;
  streak: number;
  change: number; // Position change
}

export interface Notification {
  id: string;
  type: 'achievement' | 'challenge' | 'review' | 'battle' | 'team';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
}

export interface ChallengeTimer {
  challengeId: string;
  startTime: Date;
  timeLimit: number;
  timeRemaining: number;
  isPaused: boolean;
}

export interface GameConfig {
  xpPerLevel: number;
  streakBonus: number;
  reviewPoints: number;
  helpfulVotePoints: number;
  minScoreToPass: number;
  maxChallengesPerDay: number;
}