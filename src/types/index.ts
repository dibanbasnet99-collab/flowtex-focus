export type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

export interface Habit {
  id: string;
  title: string;
  description: string;
  color: string; // hex or tailwind identifier
  emoji: string;
  category: string;
  targetPerDay: number;
  frequencyDays: number[]; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  reminderTime?: string;
  streakType: 'daily' | 'weekly' | 'monthly';
  completions: Record<string, number>; // "YYYY-MM-DD" -> count
  createdAt: string;
  archived?: boolean;
}

export type HabitTrackerTab = 'week' | 'month' | 'year' | 'stats' | 'settings';

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
  estimatedSessions: number;
  completedSessions: number;
  dueDate?: string;
  category?: string;
}

export interface AmbientTrack {
  id: 'rain' | 'forest' | 'cafe' | 'ocean' | 'campfire' | 'binaural';
  name: string;
  icon: string;
  volume: number; // 0.0 to 1.0
  isPlaying: boolean;
}

export interface BackgroundOption {
  id: string;
  name: string;
  type: 'image' | 'gradient';
  value: string; // image path or CSS gradient
  thumbnail?: string;
}

export interface UserPreferences {
  theme: 'dark' | 'light';
  focusDuration: number; // in minutes
  shortBreakDuration: number;
  longBreakDuration: number;
  longBreakInterval: number; // every X focus sessions
  autoStartBreaks: boolean;
  autoStartFocus: boolean;
  backgroundId: string;
  backgroundBlur: number; // 0 to 20 px
  overlayDarkness: number; // 0 to 80 %
  soundVolume: number;
  bellVolume: number;
  habitSortOrder: 'custom' | 'name' | 'streak' | 'category';
  voiceAnnouncements: boolean;
  mechanicalTick: boolean;
  youtubeEnabled: boolean;
  youtubeVideoId: string;
  youtubeVolume: number;
  youtubeMuted: boolean;
  youtubeShowVideo: boolean;
}

export interface LeaderboardEntry {
  userId: string;
  displayName: string;
  photoURL?: string;
  totalFocusMinutes: number;
  completedSessions: number;
  currentStreak: number;
  habitsCompletedCount: number;
  updatedAt?: string;
  rank?: number;
}

export type ActivePanel = 'none' | 'habits' | 'tasks' | 'sounds' | 'background' | 'settings' | 'youtube' | 'leaderboard';
