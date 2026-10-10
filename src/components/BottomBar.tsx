import React from 'react';
import { CheckSquare, Flame, Volume2, Sparkles, Youtube, Maximize, Minimize, Trophy } from 'lucide-react';
import { ActivePanel } from '../types';

interface BottomBarProps {
  activePanel: ActivePanel;
  onTogglePanel: (panel: ActivePanel) => void;
  pendingTasksCount: number;
  todayCompletedHabitsCount: number;
  totalHabitsCount: number;
  activeStreak: number;
  activeSoundsCount: number;
  isYouTubeActive?: boolean;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

export const BottomBar: React.FC<BottomBarProps> = ({
  activePanel,
  onTogglePanel,
  pendingTasksCount,
  todayCompletedHabitsCount,
  totalHabitsCount,
  activeStreak,
  activeSoundsCount,
  isYouTubeActive,
  isFullscreen,
  onToggleFullscreen,
}) => {
  return (
    <div className="relative z-20 flex items-center justify-between px-4 sm:px-6 py-4 w-full select-none max-w-5xl mx-auto">
      {/* Left: Streak Counter Widget */}
      <button
        onClick={() => onTogglePanel('habits')}
        title="View Habit Streaks & Analytics"
        className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-black/40 hover:bg-black/60 backdrop-blur-xl border border-white/10 text-white shadow-xl transition-all group active:scale-95"
      >
        <div className="w-6 h-6 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
          <Flame className="w-4 h-4 fill-amber-400" />
        </div>
        <div className="flex flex-col text-left">
          <span className="text-xs font-bold font-mono tracking-tight text-white leading-tight">
            {activeStreak} {activeStreak === 1 ? 'day' : 'days'}
          </span>
          <span className="text-[10px] text-white/50 leading-tight">
            Active Streak
          </span>
        </div>
      </button>

      {/* Center: Main Floating Navigation Pill */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-black/50 backdrop-blur-2xl border border-white/15 shadow-2xl">
        {/* Tasks Toggle */}
        <button
          onClick={() => onTogglePanel(activePanel === 'tasks' ? 'none' : 'tasks')}
          className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs font-medium transition-all ${
            activePanel === 'tasks'
              ? 'bg-white text-stone-950 font-bold shadow-md'
              : 'text-white/80 hover:text-white hover:bg-white/10'
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          <span className="hidden sm:inline">Tasks</span>
          {pendingTasksCount > 0 && (
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                activePanel === 'tasks'
                  ? 'bg-stone-900 text-white'
                  : 'bg-white/20 text-white'
              }`}
            >
              {pendingTasksCount}
            </span>
          )}
        </button>

        {/* Habit Tracker Toggle */}
        <button
          onClick={() => onTogglePanel(activePanel === 'habits' ? 'none' : 'habits')}
          className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs font-medium transition-all ${
            activePanel === 'habits'
              ? 'bg-amber-400 text-stone-950 font-bold shadow-md'
              : 'text-white/80 hover:text-white hover:bg-white/10'
          }`}
        >
          <span className="text-sm">⚡</span>
          <span className="hidden sm:inline">Habits</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
              activePanel === 'habits'
                ? 'bg-stone-900 text-amber-300'
                : 'bg-white/20 text-white'
            }`}
          >
            {todayCompletedHabitsCount}/{totalHabitsCount}
          </span>
        </button>

        {/* Global Leaderboard Toggle */}
        <button
          onClick={() => onTogglePanel(activePanel === 'leaderboard' ? 'none' : 'leaderboard')}
          title="Global Focus Leaderboard"
          className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs font-medium transition-all ${
            activePanel === 'leaderboard'
              ? 'bg-gradient-to-r from-amber-400 to-yellow-300 text-stone-950 font-bold shadow-md'
              : 'text-white/80 hover:text-white hover:bg-white/10'
          }`}
        >
          <Trophy className={`w-4 h-4 ${activePanel === 'leaderboard' ? 'text-stone-950 fill-stone-950' : 'text-amber-400'}`} />
          <span className="hidden sm:inline">Leaderboard</span>
        </button>

        {/* Ambient Sounds Toggle */}
        <button
          onClick={() => onTogglePanel(activePanel === 'sounds' ? 'none' : 'sounds')}
          className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs font-medium transition-all ${
            activePanel === 'sounds'
              ? 'bg-white text-stone-950 font-bold shadow-md'
              : 'text-white/80 hover:text-white hover:bg-white/10'
          }`}
        >
          <Volume2 className="w-4 h-4" />
          <span className="hidden sm:inline">Sounds</span>
          {activeSoundsCount > 0 && (
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          )}
        </button>

        {/* YouTube Stream Quick Toggle */}
        <button
          onClick={() => onTogglePanel(activePanel === 'youtube' ? 'none' : 'youtube')}
          className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs font-medium transition-all ${
            activePanel === 'youtube'
              ? 'bg-rose-500 text-white font-bold shadow-md'
              : isYouTubeActive
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
              : 'text-white/80 hover:text-white hover:bg-white/10'
          }`}
        >
          <Youtube className="w-4 h-4" />
          <span className="hidden md:inline">YouTube</span>
          {isYouTubeActive && (
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
          )}
        </button>
      </div>

      {/* Right: Background & Fullscreen Controls */}
      <div className="flex items-center gap-2">
        {/* Background Atmosphere Switcher */}
        <button
          onClick={() => onTogglePanel(activePanel === 'background' ? 'none' : 'background')}
          title="Change Ambient Scene & Atmosphere"
          className={`p-2.5 rounded-2xl backdrop-blur-xl border text-white transition-all ${
            activePanel === 'background'
              ? 'bg-white text-stone-950 border-white shadow-lg'
              : 'bg-black/40 hover:bg-black/60 border-white/10 text-white/80 hover:text-white'
          }`}
        >
          <Sparkles className="w-4 h-4" />
        </button>

        {/* Fullscreen Button */}
        <button
          onClick={onToggleFullscreen}
          title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          className="p-2.5 rounded-2xl bg-black/40 hover:bg-black/60 backdrop-blur-xl border border-white/10 text-white/80 hover:text-white shadow-xl transition-all active:scale-95"
        >
          {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};
