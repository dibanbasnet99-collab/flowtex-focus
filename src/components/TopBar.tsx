import React, { useState } from 'react';
import { Sparkles, Volume2, VolumeX, Shuffle, Maximize, Minimize, Cloud, User as UserIcon, Trophy } from 'lucide-react';
import { INSPIRATIONAL_QUOTES } from '../utils/storage';
import { User } from 'firebase/auth';

interface TopBarProps {
  isMuted: boolean;
  onToggleMute: () => void;
  activeTracksCount: number;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onOpenSettings: () => void;
  onOpenAuth: () => void;
  onOpenLeaderboard?: () => void;
  user: User | null;
}

export const TopBar: React.FC<TopBarProps> = ({
  isMuted,
  onToggleMute,
  activeTracksCount,
  isFullscreen,
  onToggleFullscreen,
  onOpenAuth,
  onOpenLeaderboard,
  user,
}) => {
  const [quoteIndex, setQuoteIndex] = useState(0);

  const handleNextQuote = () => {
    setQuoteIndex((prev) => (prev + 1) % INSPIRATIONAL_QUOTES.length);
  };

  const currentQuote = INSPIRATIONAL_QUOTES[quoteIndex];

  return (
    <header className="relative z-20 flex items-center justify-between px-6 py-4 w-full select-none">
      {/* Brand Zone */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center justify-center shadow-lg transition-transform hover:scale-105">
          <span className="text-lg">🌿</span>
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="text-base font-bold tracking-tight text-white drop-shadow-md">
              Flowtex
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse ml-0.5" />
          </div>
          <span className="text-[11px] text-white/60 tracking-wider">
            Ambient Focus & Habits
          </span>
        </div>
      </div>

      {/* Center / Right Quote Zone & User Action */}
      <div className="flex items-center gap-3">
        {/* Floating Quote Widget */}
        <div className="hidden lg:flex items-center gap-2.5 px-4 py-2 rounded-full bg-black/30 backdrop-blur-md border border-white/10 text-white/90 shadow-sm max-w-lg transition-all hover:bg-black/40">
          <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
          <p className="text-xs font-normal tracking-wide italic truncate">
            "{currentQuote.text}"
          </p>
          <span className="text-[10px] text-white/50 shrink-0">
            — {currentQuote.author}
          </span>
          <button
            onClick={handleNextQuote}
            title="Next inspirational quote"
            className="p-1 hover:text-amber-300 text-white/40 rounded-full transition-colors"
          >
            <Shuffle className="w-3 h-3" />
          </button>
        </div>

        {/* Audio Quick Mute Button */}
        <button
          onClick={onToggleMute}
          title={isMuted ? 'Unmute Ambient Sound' : 'Mute Ambient Sound'}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur-md border text-xs font-medium transition-all ${
            activeTracksCount > 0 && !isMuted
              ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-200'
              : 'bg-black/30 border-white/10 text-white/70 hover:text-white'
          }`}
        >
          {isMuted ? (
            <VolumeX className="w-3.5 h-3.5" />
          ) : (
            <Volume2 className="w-3.5 h-3.5" />
          )}
          <span className="hidden sm:inline">
            {isMuted
              ? 'Muted'
              : activeTracksCount > 0
              ? `${activeTracksCount} Sound${activeTracksCount > 1 ? 's' : ''}`
              : 'Audio'}
          </span>
        </button>

        {/* Global Leaderboard Button */}
        {onOpenLeaderboard && (
          <button
            onClick={onOpenLeaderboard}
            title="Open Global Community Leaderboard"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur-md border border-amber-400/30 bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 text-xs font-medium transition-all group"
          >
            <Trophy className="w-3.5 h-3.5 fill-amber-400 text-amber-300 group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline">Leaderboard</span>
          </button>
        )}

        {/* Firebase User Authentication / Cloud Sync Button */}
        <button
          onClick={onOpenAuth}
          title={user ? `Signed in as ${user.displayName || user.email}` : 'Sign in with Google to backup records'}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-md border text-xs font-medium transition-all ${
            user
              ? 'bg-amber-400/20 border-amber-400/40 text-amber-200 hover:bg-amber-400/30'
              : 'bg-black/40 hover:bg-black/60 border-white/10 text-white/80 hover:text-white'
          }`}
        >
          {user ? (
            user.photoURL ? (
              <img
                src={user.photoURL}
                alt="Avatar"
                referrerPolicy="no-referrer"
                className="w-4 h-4 rounded-full object-cover"
              />
            ) : (
              <Cloud className="w-3.5 h-3.5 text-amber-300" />
            )
          ) : (
            <Cloud className="w-3.5 h-3.5 text-sky-400" />
          )}

          <span className="hidden sm:inline">
            {user ? (user.displayName ? user.displayName.split(' ')[0] : 'Cloud Synced') : 'Cloud Sync'}
          </span>
        </button>

        {/* Fullscreen Quick Toggle */}
        <button
          onClick={onToggleFullscreen}
          title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          className="p-2 rounded-full bg-black/30 backdrop-blur-md border border-white/10 text-white/70 hover:text-white transition-colors"
        >
          {isFullscreen ? (
            <Minimize className="w-4 h-4" />
          ) : (
            <Maximize className="w-4 h-4" />
          )}
        </button>
      </div>
    </header>
  );
};
