export interface UserProfile {
  userId: string;
  displayName: string;
  email: string;
  avatarUrl: string;
  points: number;
  level: number;
  totalOffset: number; // in kg of CO2
  createdAt: string;
  updatedAt: string;
}

export type ActivityType = 'driving' | 'transport' | 'electricity' | 'diet' | 'waste';

export interface Habit {
  id: string;
  title: string;
  description: string;
  category: 'transport' | 'energy' | 'diet' | 'waste' | 'water';
  points: number;
  co2Saved: number; // typical kg of CO2 saved per action/day
}

export interface HabitLog {
  logId: string; // userId_habitId_YYYY-MM-DD
  userId: string;
  habitId: string;
  habitTitle: string;
  category: string;
  pointsEarned: number;
  carbonSaved: number;
  date: string; // YYYY-MM-DD
  loggedAt: string;
}

export interface ImpactLog {
  logId: string;
  userId: string;
  activityType: ActivityType;
  quantity: number; // miles, kWh, beef portions, etc.
  unit: string;
  carbonSaved: number; // offset or saved in kg CO2 against a baseline
  pointsEarned: number;
  notes: string;
  loggedAt: string;
}

export interface Goal {
  goalId: string;
  userId: string;
  title: string;
  category: 'transport' | 'energy' | 'diet' | 'waste' | 'general';
  targetValue: number; // kg of CO2 to save or count of habits
  currentValue: number;
  unit: 'kg CO2' | 'habits';
  status: 'active' | 'completed';
  deadline: string; // YYYY-MM-DD
  createdAt: string;
}

export interface AISuggestions {
  dailyTips: string[];
  goalStrategies: string[];
  coachingStatement: string;
}

export interface LeaderboardEntry {
  userId: string;
  displayName: string;
  avatarUrl: string;
  points: number;
  level: number;
  totalOffset: number;
  rank?: number;
}
