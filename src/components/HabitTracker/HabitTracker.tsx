import React, { useState } from 'react';
import { X, Plus, Calendar, BarChart3, Settings, Grid3X3, CalendarDays, Filter } from 'lucide-react';
import { Habit, HabitTrackerTab, UserPreferences } from '../../types';
import { WeekView } from './WeekView';
import { MonthView } from './MonthView';
import { YearView } from './YearView';
import { StatsView } from './StatsView';
import { HabitSettings } from './HabitSettings';
import { calculateCurrentStreak } from '../../utils/storage';

interface HabitTrackerProps {
  habits: Habit[];
  preferences: UserPreferences;
  onUpdatePreferences: (updated: Partial<UserPreferences>) => void;
  onToggleCompletion: (habitId: string, dateKey: string) => void;
  onOpenCreateModal: () => void;
  onEditHabit: (habit: Habit) => void;
  onImportHabits: (imported: Habit[]) => void;
  onResetDemoData: () => void;
  onClose: () => void;
}

export const HabitTracker: React.FC<HabitTrackerProps> = ({
  habits,
  preferences,
  onUpdatePreferences,
  onToggleCompletion,
  onOpenCreateModal,
  onEditHabit,
  onImportHabits,
  onResetDemoData,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<HabitTrackerTab>('week');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Categories extraction
  const categories = ['all', ...Array.from(new Set(habits.map((h) => h.category)))];

  // Sorting
  const sortedHabits = [...habits].sort((a, b) => {
    if (preferences.habitSortOrder === 'streak') {
      return calculateCurrentStreak(b) - calculateCurrentStreak(a);
    }
    if (preferences.habitSortOrder === 'name') {
      return a.title.localeCompare(b.title);
    }
    if (preferences.habitSortOrder === 'category') {
      return a.category.localeCompare(b.category);
    }
    return 0; // custom / default
  });

  const filteredHabits = selectedCategory === 'all'
    ? sortedHabits
    : sortedHabits.filter((h) => h.category === selectedCategory);

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl h-[92vh] max-h-[880px] rounded-3xl glass-panel p-4 sm:p-6 text-white shadow-2xl flex flex-col overflow-hidden border border-white/15">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-white/10 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-stone-950 flex items-center justify-center shadow-lg font-bold text-lg">
              🔥
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold tracking-tight">Flowtex Studio</h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/70">
                  {habits.length} habits
                </span>
              </div>
              <p className="text-xs text-white/50">Comprehensive consistency architecture</p>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={onOpenCreateModal}
              className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs flex items-center gap-1.5 shadow-md transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              New Habit
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex items-center justify-between gap-2 py-3 border-b border-white/10 overflow-x-auto">
          <div className="flex items-center gap-1 p-1 rounded-xl bg-black/40 border border-white/10 text-xs">
            <button
              onClick={() => setActiveTab('week')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === 'week'
                  ? 'bg-white/20 text-white shadow font-semibold'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Week View</span>
            </button>
            <button
              onClick={() => setActiveTab('month')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === 'month'
                  ? 'bg-white/20 text-white shadow font-semibold'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <Grid3X3 className="w-3.5 h-3.5" />
              <span>Month View</span>
            </button>
            <button
              onClick={() => setActiveTab('year')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === 'year'
                  ? 'bg-white/20 text-white shadow font-semibold'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Year View</span>
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === 'stats'
                  ? 'bg-white/20 text-white shadow font-semibold'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Statistics</span>
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === 'settings'
                  ? 'bg-white/20 text-white shadow font-semibold'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Settings</span>
            </button>
          </div>

          {/* Quick Category Filter (Shown in Week & Month view) */}
          {(activeTab === 'week' || activeTab === 'month') && categories.length > 2 && (
            <div className="hidden sm:flex items-center gap-1">
              <span className="text-[11px] text-white/40 mr-1 flex items-center gap-1">
                <Filter className="w-3 h-3" />
                Tag:
              </span>
              <div className="flex items-center gap-1 overflow-x-auto max-w-xs">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2 py-0.5 rounded-md text-[11px] capitalize transition-colors ${
                      selectedCategory === cat
                        ? 'bg-white/20 text-white font-medium'
                        : 'text-white/50 hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Tab Content Viewport */}
        <div className="flex-1 overflow-y-auto py-4 pr-1">
          {activeTab === 'week' && (
            <WeekView
              habits={filteredHabits}
              onToggleCompletion={onToggleCompletion}
              onEditHabit={onEditHabit}
              onOpenNewHabit={onOpenCreateModal}
            />
          )}

          {activeTab === 'month' && (
            <MonthView
              habits={filteredHabits}
              onToggleCompletion={onToggleCompletion}
            />
          )}

          {activeTab === 'year' && (
            <YearView habits={habits} />
          )}

          {activeTab === 'stats' && (
            <StatsView habits={habits} />
          )}

          {activeTab === 'settings' && (
            <HabitSettings
              habits={habits}
              preferences={preferences}
              onUpdatePreferences={onUpdatePreferences}
              onImportHabits={onImportHabits}
              onResetDemoData={onResetDemoData}
            />
          )}
        </div>
      </div>
    </div>
  );
};
