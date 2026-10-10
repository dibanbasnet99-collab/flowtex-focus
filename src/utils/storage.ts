import { Habit, Task, UserPreferences, BackgroundOption } from '../types';

export const HABIT_COLORS = [
  '#EF4444', // Red
  '#F97316', // Orange
  '#F59E0B', // Amber
  '#EAB308', // Yellow
  '#84CC16', // Lime
  '#10B981', // Emerald
  '#14B8A6', // Teal
  '#06B6D4', // Cyan
  '#0EA5E9', // Sky
  '#3B82F6', // Blue
  '#6366F1', // Indigo
  '#8B5CF6', // Violet
  '#A855F7', // Purple
  '#D946EF', // Fuchsia
  '#EC4899', // Pink
  '#F43F5E', // Rose
];

export const HABIT_EMOJIS = [
  '🧘', '🏋️', '📖', '🚰', '💻', '🌿', '💤', '🍎',
  '✍️', '🏃', '🎨', '🧠', '☕', '🎯', '🥑', '✨',
  '🚲', '🎹', '💊', '🚶', '🧹', '📝', '🥗', '💡',
];

export const BACKGROUND_PRESETS: BackgroundOption[] = [
  {
    id: 'lofi_study',
    name: 'Cozy Study Room',
    type: 'image',
    value: '/images/ambient_lofi_study_1791571977466.jpg',
  },
  {
    id: 'misty_forest',
    name: 'Misty Evergreen',
    type: 'image',
    value: '/images/ambient_misty_forest_1791571990844.jpg',
  },
  {
    id: 'cozy_cafe',
    name: 'Rainy Café Window',
    type: 'image',
    value: '/images/ambient_cozy_cafe_1791572003177.jpg',
  },
  {
    id: 'mountain_lake',
    name: 'Alpine Lake Sunrise',
    type: 'image',
    value: '/images/ambient_mountain_lake_1791572012285.jpg',
  },
  {
    id: 'mesh_indigo',
    name: 'Midnight Aurora (Mesh)',
    type: 'gradient',
    value: 'radial-gradient(at 10% 20%, #1e1b4b 0px, transparent 50%), radial-gradient(at 90% 10%, #064e3b 0px, transparent 50%), radial-gradient(at 50% 90%, #312e81 0px, transparent 50%), #09090b',
  },
  {
    id: 'mesh_sunset',
    name: 'Twilight Dusk (Mesh)',
    type: 'gradient',
    value: 'radial-gradient(at 0% 0%, #4c1d95 0px, transparent 50%), radial-gradient(at 100% 0%, #831843 0px, transparent 50%), radial-gradient(at 50% 100%, #1e1b4b 0px, transparent 50%), #09090b',
  },
  {
    id: 'mesh_forest',
    name: 'Deep Forest Zen (Mesh)',
    type: 'gradient',
    value: 'radial-gradient(at 0% 100%, #064e3b 0px, transparent 50%), radial-gradient(at 100% 0%, #042f2e 0px, transparent 50%), radial-gradient(at 50% 50%, #022c22 0px, transparent 50%), #021a15',
  },
  {
    id: 'mesh_minimal',
    name: 'Obsidian Minimal',
    type: 'gradient',
    value: 'linear-gradient(180deg, #18181b 0%, #09090b 100%)',
  },
];

export const INSPIRATIONAL_QUOTES = [
  { text: "Turn obstacles into opportunities.", author: "Marcus Aurelius" },
  { text: "Focus is a muscle. The more you protect it, the stronger it grows.", author: "Cal Newport" },
  { text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", author: "Will Durant" },
  { text: "Small disciplines repeated with consistency every day lead to great achievements.", author: "John C. Maxwell" },
  { text: "Simplicity boils down to two steps: Identify the essential. Eliminate the rest.", author: "Leo Babauta" },
  { text: "Action precedes motivation. Begin, and the mind will follow.", author: "James Clear" },
  { text: "In the depth of winter, I finally learned that within me there lay an invincible summer.", author: "Albert Camus" },
  { text: "Peace comes from being able to contribute the best that we have.", author: "Hafiz" },
];

export function formatDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

// Generate rich seed habits with realistic past completion history
export function getInitialHabits(): Habit[] {
  const today = new Date();
  const generateHistory = (rate: number, target: number = 1) => {
    const completions: Record<string, number> = {};
    for (let i = 0; i < 90; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      if (Math.random() < rate) {
        completions[formatDateKey(d)] = target > 1 ? Math.floor(Math.random() * target) + 1 : 1;
      }
    }
    return completions;
  };

  return [
    {
      id: 'habit-1',
      title: 'Morning Meditation',
      description: '15 minutes of mindful breathwork and stillness',
      color: '#8B5CF6',
      emoji: '🧘',
      category: 'Mindset',
      targetPerDay: 1,
      frequencyDays: [0, 1, 2, 3, 4, 5, 6],
      reminderTime: '07:30',
      streakType: 'daily',
      completions: generateHistory(0.85, 1),
      createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
    },
    {
      id: 'habit-2',
      title: 'Deep Work (2+ Hours)',
      description: 'Focused distraction-free coding or writing session',
      color: '#3B82F6',
      emoji: '💻',
      category: 'Work',
      targetPerDay: 1,
      frequencyDays: [1, 2, 3, 4, 5],
      reminderTime: '09:00',
      streakType: 'daily',
      completions: generateHistory(0.8, 1),
      createdAt: new Date(Date.now() - 75 * 86400000).toISOString(),
    },
    {
      id: 'habit-3',
      title: 'Hydrate (8 Glasses)',
      description: 'Maintain hydration throughout the day',
      color: '#06B6D4',
      emoji: '🚰',
      category: 'Health',
      targetPerDay: 8,
      frequencyDays: [0, 1, 2, 3, 4, 5, 6],
      streakType: 'daily',
      completions: generateHistory(0.9, 8),
      createdAt: new Date(Date.now() - 90 * 86400000).toISOString(),
    },
    {
      id: 'habit-4',
      title: 'Read 25 Pages',
      description: 'Non-fiction books on philosophy, design & science',
      color: '#F59E0B',
      emoji: '📖',
      category: 'Learning',
      targetPerDay: 1,
      frequencyDays: [0, 1, 2, 3, 4, 5, 6],
      reminderTime: '21:30',
      streakType: 'daily',
      completions: generateHistory(0.72, 1),
      createdAt: new Date(Date.now() - 45 * 86400000).toISOString(),
    },
    {
      id: 'habit-5',
      title: 'Workout & Movement',
      description: 'Strength training, calisthenics, or evening walk',
      color: '#10B981',
      emoji: '🏋️',
      category: 'Fitness',
      targetPerDay: 1,
      frequencyDays: [1, 2, 3, 4, 5, 6],
      reminderTime: '17:30',
      streakType: 'daily',
      completions: generateHistory(0.68, 1),
      createdAt: new Date(Date.now() - 50 * 86400000).toISOString(),
    },
  ];
}

export function getInitialTasks(): Task[] {
  return [
    {
      id: 'task-1',
      title: 'Design high-conversion landing page structure',
      completed: false,
      priority: 'high',
      estimatedSessions: 3,
      completedSessions: 1,
      category: 'Design',
    },
    {
      id: 'task-2',
      title: 'Refactor state persistence and audio synchronization',
      completed: false,
      priority: 'high',
      estimatedSessions: 2,
      completedSessions: 0,
      category: 'Engineering',
    },
    {
      id: 'task-3',
      title: 'Review quarterly goals & habit consistency chart',
      completed: true,
      priority: 'medium',
      estimatedSessions: 1,
      completedSessions: 1,
      category: 'Planning',
    },
    {
      id: 'task-4',
      title: 'Draft weekly engineering notes and learnings',
      completed: false,
      priority: 'low',
      estimatedSessions: 2,
      completedSessions: 0,
      category: 'Writing',
    },
  ];
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'dark',
  focusDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  longBreakInterval: 4,
  autoStartBreaks: false,
  autoStartFocus: false,
  backgroundId: 'lofi_study',
  backgroundBlur: 4,
  overlayDarkness: 35,
  soundVolume: 0.7,
  bellVolume: 0.8,
  habitSortOrder: 'custom',
  voiceAnnouncements: true,
  mechanicalTick: true,
  youtubeEnabled: false,
  youtubeVideoId: 'jfKfPfyJRdk',
  youtubeVolume: 60,
  youtubeMuted: false,
  youtubeShowVideo: true,
};

// --- LocalStorage persistence keys ---
const STORAGE_HABITS_KEY = 'flocus_habitex_habits_v1';
const STORAGE_TASKS_KEY = 'flocus_habitex_tasks_v1';
const STORAGE_PREFS_KEY = 'flocus_habitex_prefs_v1';
const STORAGE_STATS_KEY = 'flocus_habitex_stats_v1';
const STORAGE_FOCUS_STATS_KEY = 'flocus_habitex_focus_stats_v1';

export interface UserFocusStats {
  totalFocusMinutes: number;
  completedSessions: number;
}

export function loadFocusStats(): UserFocusStats {
  try {
    const raw = localStorage.getItem(STORAGE_FOCUS_STATS_KEY);
    if (!raw) return { totalFocusMinutes: 125, completedSessions: 5 };
    return JSON.parse(raw);
  } catch {
    return { totalFocusMinutes: 125, completedSessions: 5 };
  }
}

export function saveFocusStats(stats: UserFocusStats): void {
  try {
    localStorage.setItem(STORAGE_FOCUS_STATS_KEY, JSON.stringify(stats));
  } catch (err) {
    console.error('Failed to save focus stats', err);
  }
}

export function incrementFocusSession(minutes: number): UserFocusStats {
  const current = loadFocusStats();
  const updated: UserFocusStats = {
    totalFocusMinutes: current.totalFocusMinutes + Math.max(1, minutes),
    completedSessions: current.completedSessions + 1,
  };
  saveFocusStats(updated);
  return updated;
}

export const DEMO_COMMUNITY_LEADERBOARD = [
  {
    userId: 'demo-user-1',
    displayName: 'Elena Rostova',
    photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    totalFocusMinutes: 1485, // ~24.7 hrs
    completedSessions: 59,
    currentStreak: 24,
    habitsCompletedCount: 168,
    category: 'Software Engineer',
  },
  {
    userId: 'demo-user-2',
    displayName: 'Kenji Takahashi',
    photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    totalFocusMinutes: 1320, // 22 hrs
    completedSessions: 52,
    currentStreak: 31,
    habitsCompletedCount: 182,
    category: 'Architecture Student',
  },
  {
    userId: 'demo-user-3',
    displayName: 'Sarah Lin',
    photoURL: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    totalFocusMinutes: 1150, // 19.1 hrs
    completedSessions: 46,
    currentStreak: 18,
    habitsCompletedCount: 140,
    category: 'Writer & Researcher',
  },
  {
    userId: 'demo-user-4',
    displayName: 'Marcus Thorne',
    photoURL: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    totalFocusMinutes: 975, // 16.2 hrs
    completedSessions: 39,
    currentStreak: 14,
    habitsCompletedCount: 112,
    category: 'Product Designer',
  },
  {
    userId: 'demo-user-5',
    displayName: 'Priya Sharma',
    photoURL: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    totalFocusMinutes: 850, // 14.1 hrs
    completedSessions: 34,
    currentStreak: 21,
    habitsCompletedCount: 135,
    category: 'Data Scientist',
  },
  {
    userId: 'demo-user-6',
    displayName: 'Alex Chen',
    photoURL: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    totalFocusMinutes: 725, // 12 hrs
    completedSessions: 29,
    currentStreak: 12,
    habitsCompletedCount: 94,
    category: 'Med Student',
  },
  {
    userId: 'demo-user-7',
    displayName: 'Carlos Mendez',
    photoURL: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    totalFocusMinutes: 620,
    completedSessions: 24,
    currentStreak: 9,
    habitsCompletedCount: 78,
    category: 'Indie Hacker',
  },
  {
    userId: 'demo-user-8',
    displayName: 'Maya Patel',
    photoURL: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80',
    totalFocusMinutes: 500,
    completedSessions: 20,
    currentStreak: 15,
    habitsCompletedCount: 88,
    category: 'Creative Director',
  },
];

export function loadHabits(): Habit[] {
  try {
    const raw = localStorage.getItem(STORAGE_HABITS_KEY);
    if (!raw) {
      const initial = getInitialHabits();
      saveHabits(initial);
      return initial;
    }
    return JSON.parse(raw);
  } catch {
    return getInitialHabits();
  }
}

export function saveHabits(habits: Habit[]) {
  try {
    localStorage.setItem(STORAGE_HABITS_KEY, JSON.stringify(habits));
  } catch (err) {
    console.error('Failed to save habits to localStorage', err);
  }
}

export function loadTasks(): Task[] {
  try {
    const raw = localStorage.getItem(STORAGE_TASKS_KEY);
    if (!raw) {
      const initial = getInitialTasks();
      saveTasks(initial);
      return initial;
    }
    return JSON.parse(raw);
  } catch {
    return getInitialTasks();
  }
}

export function saveTasks(tasks: Task[]) {
  try {
    localStorage.setItem(STORAGE_TASKS_KEY, JSON.stringify(tasks));
  } catch (err) {
    console.error('Failed to save tasks to localStorage', err);
  }
}

export function loadPreferences(): UserPreferences {
  try {
    const raw = localStorage.getItem(STORAGE_PREFS_KEY);
    if (!raw) return DEFAULT_PREFERENCES;
    return { ...DEFAULT_PREFERENCES, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function savePreferences(prefs: UserPreferences) {
  try {
    localStorage.setItem(STORAGE_PREFS_KEY, JSON.stringify(prefs));
  } catch (err) {
    console.error('Failed to save preferences', err);
  }
}

// --- Analytics calculations ---
export function isHabitCompletedOnDate(habit: Habit, dateKey: string): boolean {
  const count = habit.completions[dateKey] || 0;
  return count >= habit.targetPerDay;
}

export function getHabitCompletionCount(habit: Habit, dateKey: string): number {
  return habit.completions[dateKey] || 0;
}

export function calculateCurrentStreak(habit: Habit): number {
  let streak = 0;
  const d = new Date();

  // If completed today, start counting from today.
  // Otherwise check if completed yesterday. If not, streak is 0.
  const todayKey = formatDateKey(d);
  const isTodayDone = isHabitCompletedOnDate(habit, todayKey);

  if (!isTodayDone) {
    d.setDate(d.getDate() - 1);
    const yesterdayKey = formatDateKey(d);
    if (!isHabitCompletedOnDate(habit, yesterdayKey)) {
      return 0;
    }
  }

  while (true) {
    const key = formatDateKey(d);
    if (isHabitCompletedOnDate(habit, key)) {
      streak++;
      d.setDate(d.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

export function calculateBestStreak(habit: Habit): number {
  const dates = Object.keys(habit.completions)
    .filter(k => isHabitCompletedOnDate(habit, k))
    .sort();

  if (dates.length === 0) return 0;

  let best = 1;
  let current = 1;

  for (let i = 1; i < dates.length; i++) {
    const prev = parseDateKey(dates[i - 1]);
    const curr = parseDateKey(dates[i]);
    const diffDays = Math.round((curr.getTime() - prev.getTime()) / 86400000);

    if (diffDays === 1) {
      current++;
      if (current > best) best = current;
    } else if (diffDays > 1) {
      current = 1;
    }
  }

  return Math.max(best, calculateCurrentStreak(habit));
}

export function calculateOverallStats(habits: Habit[]) {
  const allCompletedDaysSet = new Set<string>();
  let totalCompletions = 0;

  habits.forEach(h => {
    Object.entries(h.completions).forEach(([date, count]) => {
      if (count >= h.targetPerDay) {
        allCompletedDaysSet.add(date);
        totalCompletions += count;
      }
    });
  });

  const streaks = habits.map(h => calculateCurrentStreak(h));
  const currentStreak = streaks.length > 0 ? Math.max(...streaks) : 0;
  const bestStreaks = habits.map(h => calculateBestStreak(h));
  const bestStreak = bestStreaks.length > 0 ? Math.max(...bestStreaks) : 0;

  // Last 30 days completion rate
  let possibleOpportunities = 0;
  let actualCompletions = 0;
  const now = new Date();
  for (let i = 0; i < 30; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = formatDateKey(d);
    habits.forEach(h => {
      possibleOpportunities++;
      if (isHabitCompletedOnDate(h, key)) {
        actualCompletions++;
      }
    });
  }

  const completionRate = possibleOpportunities > 0 ? Math.round((actualCompletions / possibleOpportunities) * 100) : 0;

  return {
    totalCompletedDays: allCompletedDaysSet.size,
    totalCompletions,
    currentDailyStreak: currentStreak,
    bestDailyStreak: bestStreak,
    completionRate,
  };
}
