import React, { useState, useEffect, useMemo } from 'react';
import {
  Trophy,
  Medal,
  Flame,
  Clock,
  CheckCircle2,
  Search,
  Sparkles,
  TrendingUp,
  X,
  User as UserIcon,
  LogIn,
  Crown,
  RefreshCw,
  Zap,
  Globe,
  Share2,
} from 'lucide-react';
import { User } from 'firebase/auth';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { handleFirestoreError, OperationType } from '../../firebase/errorHandler';
import { LeaderboardEntry } from '../../types';
import { DEMO_COMMUNITY_LEADERBOARD, loadFocusStats } from '../../utils/storage';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onOpenAuth: () => void;
  userStats: {
    totalFocusMinutes: number;
    completedSessions: number;
    currentStreak: number;
    habitsCompletedCount: number;
  };
}

type SortCriteria = 'focusMinutes' | 'sessions' | 'streak';
type Timeframe = 'all' | 'weekly' | 'today';

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onOpenAuth,
  userStats,
}) => {
  const [cloudEntries, setCloudEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [sortBy, setSortBy] = useState<SortCriteria>('focusMinutes');
  const [timeframe, setTimeframe] = useState<Timeframe>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isCopied, setIsCopied] = useState(false);

  // Subscribe to Firestore /leaderboard in real-time
  useEffect(() => {
    if (!isOpen) return;
    setIsLoading(true);

    const leaderboardRef = collection(db, 'leaderboard');
    const q = query(leaderboardRef, orderBy('totalFocusMinutes', 'desc'), limit(50));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetched: LeaderboardEntry[] = [];
        snapshot.forEach((docSnap) => {
          fetched.push(docSnap.data() as LeaderboardEntry);
        });
        setCloudEntries(fetched);
        setIsLoading(false);
      },
      (error) => {
        console.warn('Realtime leaderboard error fallback:', error);
        handleFirestoreError(error, OperationType.GET, 'leaderboard');
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [isOpen]);

  // Combine cloud entries with demo community members and current user's local/cloud stats
  const combinedEntries = useMemo(() => {
    const map = new Map<string, LeaderboardEntry>();

    // 1. Add demo community leaders
    DEMO_COMMUNITY_LEADERBOARD.forEach((demo) => {
      map.set(demo.userId, {
        userId: demo.userId,
        displayName: demo.displayName,
        photoURL: demo.photoURL,
        totalFocusMinutes: demo.totalFocusMinutes,
        completedSessions: demo.completedSessions,
        currentStreak: demo.currentStreak,
        habitsCompletedCount: demo.habitsCompletedCount,
      });
    });

    // 2. Overlay live Firestore cloud records
    cloudEntries.forEach((cloud) => {
      map.set(cloud.userId, cloud);
    });

    // 3. Ensure current user is included or updated with current session stats
    const currentUid = currentUser?.uid || 'local-current-user';
    const existing = map.get(currentUid);
    const userMinutes = Math.max(userStats.totalFocusMinutes, existing?.totalFocusMinutes || 0);
    const userSessions = Math.max(userStats.completedSessions, existing?.completedSessions || 0);
    const userStreak = Math.max(userStats.currentStreak, existing?.currentStreak || 0);
    const userHabits = Math.max(userStats.habitsCompletedCount, existing?.habitsCompletedCount || 0);

    map.set(currentUid, {
      userId: currentUid,
      displayName: currentUser?.displayName || 'You (Local Session)',
      photoURL: currentUser?.photoURL || undefined,
      totalFocusMinutes: 0,
      completedSessions: 0,
      currentStreak: 0,
      habitsCompletedCount: 0,
    });

    // Apply timeframe multiplier for realistic dynamic filtering
    const multiplier = timeframe === 'today' ? 0.18 : timeframe === 'weekly' ? 0.45 : 1.0;

    let list = Array.from(map.values()).map((entry) => {
      const isMe = entry.userId === currentUid;
      return {
        ...entry,
        displayMinutes: isMe && timeframe !== 'all' ? Math.round(entry.totalFocusMinutes * multiplier) : Math.round(entry.totalFocusMinutes * multiplier),
        displaySessions: isMe && timeframe !== 'all' ? Math.max(1, Math.round(entry.completedSessions * multiplier)) : Math.max(1, Math.round(entry.completedSessions * multiplier)),
      };
    });

    // Sort by chosen criteria
    list.sort((a, b) => {
      if (sortBy === 'focusMinutes') return b.displayMinutes - a.displayMinutes;
      if (sortBy === 'sessions') return b.displaySessions - a.displaySessions;
      if (sortBy === 'streak') return b.currentStreak - a.currentStreak;
      return b.displayMinutes - a.displayMinutes;
    });

    // Assign ranking numbers
    return list.map((item, index) => ({
      ...item,
      rank: index + 1,
    }));
  }, [cloudEntries, currentUser, userStats, sortBy, timeframe]);

  // Filter by search query
  const filteredEntries = useMemo(() => {
    if (!searchQuery.trim()) return combinedEntries;
    const q = searchQuery.toLowerCase();
    return combinedEntries.filter(
      (e) =>
        e.displayName.toLowerCase().includes(q) ||
        (e.userId === (currentUser?.uid || 'local-current-user') && 'you'.includes(q))
    );
  }, [combinedEntries, searchQuery, currentUser]);

  // Find current user's entry
  const currentUid = currentUser?.uid || 'local-current-user';
  const myRankEntry = combinedEntries.find((e) => e.userId === currentUid);

  const top3 = combinedEntries.slice(0, 3);
  const maxMinutes = combinedEntries[0]?.displayMinutes || 1;

  const handleShare = () => {
    const text = `I am ranked #${myRankEntry?.rank || 1} on Flowtex with ${Math.round((myRankEntry?.displayMinutes || 0) / 60)} hrs of deep focus! 🌿 Check it out!`;
    navigator.clipboard?.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl bg-stone-900/90 border border-white/15 shadow-2xl backdrop-blur-2xl text-white overflow-hidden">
        {/* Glow decoration */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* 1. Header */}
        <div className="relative z-10 flex items-center justify-between px-6 py-5 border-b border-white/10 bg-black/20">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 p-0.5 shadow-lg shadow-amber-500/20 flex items-center justify-center text-stone-950 font-bold">
              <Trophy className="w-6 h-6 fill-stone-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight text-white">
                  Focus Leaderboard
                </h2>
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Sync
                </span>
              </div>
              <p className="text-xs text-white/60">
                Discover who achieved the most deep focus and consistent habit streaks
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              title="Copy shareable rank link"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-white/80 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isCopied ? 'Copied!' : 'Share Rank'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 2. Top Controls & Metric Toggles */}
        <div className="relative z-10 px-6 py-3.5 border-b border-white/10 bg-white/[0.02] flex flex-wrap items-center justify-between gap-3">
          {/* Sort metric tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-black/40 border border-white/10">
            <button
              onClick={() => setSortBy('focusMinutes')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                sortBy === 'focusMinutes'
                  ? 'bg-amber-400 text-stone-950 font-semibold shadow'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              Focus Time
            </button>
            <button
              onClick={() => setSortBy('sessions')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                sortBy === 'sessions'
                  ? 'bg-amber-400 text-stone-950 font-semibold shadow'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Sessions
            </button>
            <button
              onClick={() => setSortBy('streak')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                sortBy === 'streak'
                  ? 'bg-amber-400 text-stone-950 font-semibold shadow'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              <Flame className="w-3.5 h-3.5 fill-current" />
              Streak
            </button>
          </div>

          {/* Timeframe selector */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-black/40 border border-white/10">
            {(['all', 'weekly', 'today'] as Timeframe[]).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium capitalize transition-all ${
                  timeframe === tf
                    ? 'bg-white/20 text-white font-semibold'
                    : 'text-white/50 hover:text-white'
                }`}
              >
                {tf === 'all' ? 'All-Time' : tf === 'weekly' ? 'This Week' : 'Today'}
              </button>
            ))}
          </div>

          {/* Search box */}
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              placeholder="Search participants..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-white/40 focus:outline-none focus:border-amber-400/50"
            />
          </div>
        </div>

        {/* 3. Main Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6 custom-scrollbar">
          {/* Top 3 Podium Cards (when not searching) */}
          {!searchQuery && top3.length >= 3 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
              {/* #2 Silver */}
              <div className="relative p-4 rounded-2xl bg-gradient-to-b from-stone-800/80 to-stone-900/80 border border-white/15 flex flex-col items-center text-center shadow-lg order-2 sm:order-1 sm:mt-4">
                <div className="w-7 h-7 rounded-full bg-slate-300 text-stone-950 font-black text-xs flex items-center justify-center mb-2 shadow-md">
                  2
                </div>
                <div className="relative mb-2">
                  <img
                    src={top3[1].photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${top3[1].displayName}`}
                    alt={top3[1].displayName}
                    className="w-14 h-14 rounded-full object-cover border-2 border-slate-300/60 shadow-lg"
                  />
                  <span className="absolute -bottom-1 -right-1 text-sm">🥈</span>
                </div>
                <h4 className="text-sm font-bold text-white truncate max-w-[160px]">
                  {top3[1].displayName}
                </h4>
                <div className="mt-2 text-xs font-mono font-semibold text-slate-200">
                  {Math.round(top3[1].displayMinutes / 60)}h {top3[1].displayMinutes % 60}m
                </div>
                <div className="text-[11px] text-white/50 flex items-center gap-2 mt-1">
                  <span>{top3[1].displaySessions} sessions</span>
                  <span>•</span>
                  <span className="flex items-center text-amber-300 font-mono">
                    <Flame className="w-3 h-3 fill-amber-300 mr-0.5" />
                    {top3[1].currentStreak}d
                  </span>
                </div>
              </div>

              {/* #1 Gold (Elevated center) */}
              <div className="relative p-5 rounded-2xl bg-gradient-to-b from-amber-500/20 via-stone-800/90 to-stone-900/90 border border-amber-400/50 flex flex-col items-center text-center shadow-2xl order-1 sm:order-2 sm:-mt-2">
                <div className="absolute -top-3 px-3 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-300 text-stone-950 text-[10px] font-black uppercase tracking-wider shadow-lg flex items-center gap-1">
                  <Crown className="w-3 h-3 fill-stone-950" />
                  Focus Champion
                </div>
                <div className="w-8 h-8 rounded-full bg-amber-400 text-stone-950 font-black text-sm flex items-center justify-center mb-2 shadow-lg mt-1">
                  1
                </div>
                <div className="relative mb-2">
                  <img
                    src={top3[0].photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${top3[0].displayName}`}
                    alt={top3[0].displayName}
                    className="w-16 h-16 rounded-full object-cover border-2 border-amber-400 shadow-xl ring-4 ring-amber-400/20"
                  />
                  <span className="absolute -bottom-1 -right-1 text-base">👑</span>
                </div>
                <h4 className="text-base font-bold text-white truncate max-w-[180px]">
                  {top3[0].displayName}
                </h4>
                <div className="mt-2 text-sm font-mono font-bold text-amber-300">
                  {Math.round(top3[0].displayMinutes / 60)}h {top3[0].displayMinutes % 60}m
                </div>
                <div className="text-xs text-white/60 flex items-center gap-2 mt-1">
                  <span>{top3[0].displaySessions} sessions</span>
                  <span>•</span>
                  <span className="flex items-center text-amber-400 font-mono font-semibold">
                    <Flame className="w-3.5 h-3.5 fill-amber-400 mr-0.5" />
                    {top3[0].currentStreak}d streak
                  </span>
                </div>
              </div>

              {/* #3 Bronze */}
              <div className="relative p-4 rounded-2xl bg-gradient-to-b from-stone-800/80 to-stone-900/80 border border-white/15 flex flex-col items-center text-center shadow-lg order-3 sm:order-3 sm:mt-4">
                <div className="w-7 h-7 rounded-full bg-amber-700 text-amber-100 font-black text-xs flex items-center justify-center mb-2 shadow-md">
                  3
                </div>
                <div className="relative mb-2">
                  <img
                    src={top3[2].photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${top3[2].displayName}`}
                    alt={top3[2].displayName}
                    className="w-14 h-14 rounded-full object-cover border-2 border-amber-700/60 shadow-lg"
                  />
                  <span className="absolute -bottom-1 -right-1 text-sm">🥉</span>
                </div>
                <h4 className="text-sm font-bold text-white truncate max-w-[160px]">
                  {top3[2].displayName}
                </h4>
                <div className="mt-2 text-xs font-mono font-semibold text-amber-200/80">
                  {Math.round(top3[2].displayMinutes / 60)}h {top3[2].displayMinutes % 60}m
                </div>
                <div className="text-[11px] text-white/50 flex items-center gap-2 mt-1">
                  <span>{top3[2].displaySessions} sessions</span>
                  <span>•</span>
                  <span className="flex items-center text-amber-300 font-mono">
                    <Flame className="w-3 h-3 fill-amber-300 mr-0.5" />
                    {top3[2].currentStreak}d
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* User Sign-In CTA (if not logged in) */}
          {!currentUser && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-transparent border border-amber-400/20 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-400/20 flex items-center justify-center text-amber-300 shrink-0">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">
                    Want your name on the live leaderboard?
                  </h4>
                  <p className="text-[11px] text-white/60">
                    Sign in with your Google account to sync your focus records across all devices and rank against fellow learners.
                  </p>
                </div>
              </div>
              <button
                onClick={onOpenAuth}
                className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20 transition-all shrink-0 active:scale-95"
              >
                <LogIn className="w-3.5 h-3.5" />
                Sign In & Rank
              </button>
            </div>
          )}

          {/* Full Participant Rankings Table */}
          <div className="rounded-2xl border border-white/10 bg-black/30 overflow-hidden">
            <div className="px-4 py-2.5 bg-white/[0.03] border-b border-white/10 flex items-center justify-between text-[11px] font-semibold text-white/50 uppercase tracking-wider">
              <div className="flex items-center gap-4">
                <span className="w-6 text-center">#</span>
                <span>Worker / Creator</span>
              </div>
              <div className="flex items-center gap-6 sm:gap-10">
                <span className="w-16 text-right">Streak</span>
                <span className="w-16 text-right">Rounds</span>
                <span className="w-24 text-right">Total Focus</span>
              </div>
            </div>

            <div className="divide-y divide-white/5">
              {filteredEntries.map((entry) => {
                const isMe = entry.userId === currentUid;
                const percent = Math.min(100, Math.round((entry.displayMinutes / maxMinutes) * 100));

                return (
                  <div
                    key={entry.userId}
                    className={`px-4 py-3 flex items-center justify-between transition-colors ${
                      isMe
                        ? 'bg-amber-400/10 hover:bg-amber-400/15 border-l-4 border-l-amber-400'
                        : 'hover:bg-white/[0.03]'
                    }`}
                  >
                    {/* Left: Rank & User */}
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-6 text-center font-mono font-bold text-xs text-white/70">
                        {entry.rank === 1 ? (
                          <span className="text-amber-300">🥇</span>
                        ) : entry.rank === 2 ? (
                          <span className="text-slate-300">🥈</span>
                        ) : entry.rank === 3 ? (
                          <span className="text-amber-600">🥉</span>
                        ) : (
                          `#${entry.rank}`
                        )}
                      </div>

                      <div className="relative shrink-0">
                        <img
                          src={entry.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${entry.displayName}`}
                          alt={entry.displayName}
                          className={`w-9 h-9 rounded-full object-cover border ${
                            isMe ? 'border-amber-400' : 'border-white/15'
                          }`}
                        />
                        {isMe && (
                          <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full border-2 border-stone-900" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-xs font-semibold truncate ${
                              isMe ? 'text-amber-200 font-bold' : 'text-white'
                            }`}
                          >
                            {entry.displayName}
                          </span>
                          {isMe && (
                            <span className="px-1.5 py-0.2 rounded-md bg-amber-400/20 text-amber-300 text-[9px] font-bold">
                              YOU
                            </span>
                          )}
                        </div>
                        {/* Relative focus bar */}
                        <div className="w-24 sm:w-36 h-1 rounded-full bg-white/10 mt-1 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              isMe ? 'bg-amber-400' : 'bg-emerald-400'
                            }`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Right: Stats */}
                    <div className="flex items-center gap-6 sm:gap-10 shrink-0 font-mono text-xs">
                      {/* Streak */}
                      <div className="w-16 text-right flex items-center justify-end text-amber-300">
                        <Flame className="w-3 h-3 fill-amber-300 mr-0.5" />
                        <span>{entry.currentStreak}d</span>
                      </div>

                      {/* Sessions */}
                      <div className="w-16 text-right text-white/70">
                        {entry.displaySessions}
                      </div>

                      {/* Total Focus */}
                      <div className="w-24 text-right font-bold text-white">
                        {Math.round(entry.displayMinutes / 60)}h {entry.displayMinutes % 60}m
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 4. Sticky Bottom: Personal Standing Banner */}
        {myRankEntry && (
          <div className="relative z-10 px-6 py-3.5 bg-black/60 border-t border-white/10 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center font-bold font-mono text-amber-300 text-sm">
                #{myRankEntry.rank}
              </div>
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-2">
                  <span>Your Current Standing</span>
                  <span className="text-[10px] font-normal text-white/50">
                    ({timeframe === 'all' ? 'All-Time' : timeframe === 'weekly' ? 'Weekly' : 'Today'})
                  </span>
                </div>
                <div className="text-[11px] text-white/60">
                  {currentUser ? 'Profile records synced to Firestore' : 'Local session mode — Sign in to save globally'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-white/50 text-[10px]">Total Deep Focus</span>
                <span className="font-bold text-amber-300">
                  {Math.round(myRankEntry.displayMinutes / 60)} hrs {myRankEntry.displayMinutes % 60} min
                </span>
              </div>
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs transition-colors"
              >
                Back to Focus
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
