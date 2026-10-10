/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  Habit,
  Task,
  UserPreferences,
  AmbientTrack,
  ActivePanel,
  TimerMode,
} from './types';
import {
  loadHabits,
  saveHabits,
  loadTasks,
  saveTasks,
  loadPreferences,
  savePreferences,
  getInitialHabits,
  getInitialTasks,
  formatDateKey,
  calculateCurrentStreak,
  BACKGROUND_PRESETS,
  loadFocusStats,
  incrementFocusSession,
} from './utils/storage';
import { soundEngine } from './utils/audioEngine';
import { TopBar } from './components/TopBar';
import { Timer } from './components/Timer';
import { TaskPanel } from './components/TaskPanel';
import { AmbientAudio } from './components/AmbientAudio';
import { BackgroundSelector } from './components/BackgroundSelector';
import { BottomBar } from './components/BottomBar';
import { HabitTracker } from './components/HabitTracker/HabitTracker';
import { HabitModal } from './components/HabitTracker/HabitModal';
import { YouTubePlayer } from './components/YouTubeBackground/YouTubePlayer';
import { YouTubeControls } from './components/YouTubeBackground/YouTubeControls';
import { AuthModal } from './components/Auth/AuthModal';
import { LeaderboardModal } from './components/Leaderboard/LeaderboardModal';
import { useAuth } from './firebase/AuthContext';
import { db } from './firebase/config';
import {
  saveHabitToFirestore,
  deleteHabitFromFirestore,
  saveTaskToFirestore,
  deleteTaskFromFirestore,
  savePreferencesToFirestore,
  uploadLocalHabitsToCloud,
  uploadLocalTasksToCloud,
  saveLeaderboardEntryToFirestore,
} from './firebase/syncService';
import { handleFirestoreError, OperationType } from './firebase/errorHandler';
import { collection, onSnapshot } from 'firebase/firestore';

const INITIAL_TRACKS: AmbientTrack[] = [
  { id: 'rain', name: 'Gentle Rain', icon: 'CloudRain', volume: 0.6, isPlaying: false },
  { id: 'ocean', name: 'Ocean Waves', icon: 'Waves', volume: 0.5, isPlaying: false },
  { id: 'forest', name: 'Forest & Birds', icon: 'Trees', volume: 0.5, isPlaying: false },
  { id: 'cafe', name: 'Warm Café', icon: 'Coffee', volume: 0.45, isPlaying: false },
  { id: 'campfire', name: 'Campfire Crackle', icon: 'Flame', volume: 0.5, isPlaying: false },
  { id: 'binaural', name: 'Alpha Focus (10Hz)', icon: 'Zap', volume: 0.4, isPlaying: false },
];

export default function App() {
  const { user, setSyncStatus } = useAuth();

  // --- Persistent State ---
  const [habits, setHabits] = useState<Habit[]>(() => loadHabits());
  const [tasks, setTasks] = useState<Task[]>(() => loadTasks());
  const [preferences, setPreferences] = useState<UserPreferences>(() => loadPreferences());
  const [focusStats, setFocusStats] = useState(() => loadFocusStats());

  // --- UI State ---
  const [activePanel, setActivePanel] = useState<ActivePanel>('none');
  const [activeTaskId, setActiveTaskId] = useState<string | undefined>(undefined);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // --- Habit Modal State ---
  const [isHabitModalOpen, setIsHabitModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

  // --- Sound Tracks State ---
  const [tracks, setTracks] = useState<AmbientTrack[]>(INITIAL_TRACKS);
  const [isMuted, setIsMuted] = useState(false);
  const [isYouTubePlaying, setIsYouTubePlaying] = useState<boolean>(true);

  // Keep localStorage updated as local/offline backup
  useEffect(() => {
    saveHabits(habits);
  }, [habits]);

  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  useEffect(() => {
    savePreferences(preferences);
  }, [preferences]);

  // Derived stats
  const streaks = useMemo(() => habits.map((h) => calculateCurrentStreak(h)), [habits]);
  const activeStreak = streaks.length > 0 ? Math.max(...streaks) : 0;

  const totalHabitsCompletedCount = useMemo(() => {
    let count = 0;
    habits.forEach((h) => {
      Object.values(h.completions).forEach((c) => {
        if (c >= h.targetPerDay) count++;
      });
    });
    return count;
  }, [habits]);

  // Sync latest personal stats to community leaderboard in Firestore
  useEffect(() => {
    if (!user) return;
    saveLeaderboardEntryToFirestore(user.uid, {
      displayName: user.displayName || 'Focus User',
      photoURL: user.photoURL || '',
      totalFocusMinutes: focusStats.totalFocusMinutes,
      completedSessions: focusStats.completedSessions,
      currentStreak: activeStreak,
      habitsCompletedCount: totalHabitsCompletedCount,
    });
  }, [user, focusStats, activeStreak, totalHabitsCompletedCount]);

  // Fullscreen listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // --- Firebase Cloud Firestore Realtime Synchronization ---
  const isInitialCloudSyncRef = useRef(false);

  useEffect(() => {
    if (!user) {
      isInitialCloudSyncRef.current = false;
      return;
    }

    setSyncStatus('syncing');

    // 1. Subscribe to user habits collection
    const habitsPath = `users/${user.uid}/habits`;
    const habitsQuery = collection(db, 'users', user.uid, 'habits');
    const unsubHabits = onSnapshot(
      habitsQuery,
      (snapshot) => {
        if (!snapshot.empty) {
          const cloudHabits: Habit[] = [];
          snapshot.forEach((docSnap) => {
            cloudHabits.push(docSnap.data() as Habit);
          });
          setHabits(cloudHabits);
          setSyncStatus('synced');
        } else if (!isInitialCloudSyncRef.current) {
          // Upload initial local habits to cloud for new user
          isInitialCloudSyncRef.current = true;
          const currentLocal = loadHabits();
          if (currentLocal.length > 0) {
            uploadLocalHabitsToCloud(user.uid, currentLocal);
          }
        }
      },
      (error) => {
        setSyncStatus('error');
        handleFirestoreError(error, OperationType.GET, habitsPath);
      }
    );

    // 2. Subscribe to user tasks collection
    const tasksPath = `users/${user.uid}/tasks`;
    const tasksQuery = collection(db, 'users', user.uid, 'tasks');
    const unsubTasks = onSnapshot(
      tasksQuery,
      (snapshot) => {
        if (!snapshot.empty) {
          const cloudTasks: Task[] = [];
          snapshot.forEach((docSnap) => {
            cloudTasks.push(docSnap.data() as Task);
          });
          setTasks(cloudTasks);
          setSyncStatus('synced');
        } else if (!isInitialCloudSyncRef.current) {
          const currentLocal = loadTasks();
          if (currentLocal.length > 0) {
            uploadLocalTasksToCloud(user.uid, currentLocal);
          }
        }
      },
      (error) => {
        setSyncStatus('error');
        handleFirestoreError(error, OperationType.GET, tasksPath);
      }
    );

    return () => {
      unsubHabits();
      unsubTasks();
    };
  }, [user, setSyncStatus]);

  // --- Audio Handlers ---
  const handleToggleTrack = (trackId: AmbientTrack['id']) => {
    setTracks((prev) =>
      prev.map((t) => {
        if (t.id === trackId) {
          const nextPlaying = !t.isPlaying;
          if (nextPlaying) {
            soundEngine.playTrack(t.id, t.volume);
          } else {
            soundEngine.stopTrack(t.id);
          }
          return { ...t, isPlaying: nextPlaying };
        }
        return t;
      })
    );
  };

  const handleUpdateTrackVolume = (trackId: AmbientTrack['id'], vol: number) => {
    setTracks((prev) =>
      prev.map((t) => {
        if (t.id === trackId) {
          soundEngine.setTrackVolume(t.id, vol);
          return { ...t, volume: vol };
        }
        return t;
      })
    );
  };

  const handleUpdateMasterVolume = (vol: number) => {
    setPreferences((p) => {
      const updated = { ...p, soundVolume: vol };
      if (user) savePreferencesToFirestore(user.uid, updated);
      return updated;
    });
    soundEngine.setMasterVolume(vol);
  };

  const handleToggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    soundEngine.setMute(nextMute);
  };

  // --- Task Handlers ---
  const handleAddTask = (newTask: Omit<Task, 'id' | 'completed' | 'completedSessions'>) => {
    const task: Task = {
      ...newTask,
      id: `task-${Date.now()}`,
      completed: false,
      completedSessions: 0,
    };
    setTasks((prev) => [task, ...prev]);
    if (user) {
      saveTaskToFirestore(user.uid, task);
    }
  };

  const handleToggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const updated = { ...t, completed: !t.completed };
          if (user) saveTaskToFirestore(user.uid, updated);
          return updated;
        }
        return t;
      })
    );
  };

  const handleDeleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    if (activeTaskId === id) setActiveTaskId(undefined);
    if (user) {
      deleteTaskFromFirestore(user.uid, id);
    }
  };

  const handleSelectActiveTask = (task: Task) => {
    setActiveTaskId(task.id);
    setActivePanel('none'); // Close tasks panel to focus
  };

  const handleUpdateTaskRounds = (taskId: string, delta: number) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const nextEst = Math.max(1, t.estimatedSessions + delta);
          const updated = {
            ...t,
            estimatedSessions: nextEst,
            completed: t.completedSessions >= nextEst,
          };
          if (user) saveTaskToFirestore(user.uid, updated);
          return updated;
        }
        return t;
      })
    );
  };

  // --- Timer Session Complete Handler ---
  const handleSessionComplete = (mode: TimerMode, completedTaskId?: string) => {
    if (mode === 'focus') {
      const updatedStats = incrementFocusSession(preferences.focusDuration);
      setFocusStats(updatedStats);

      if (user) {
        saveLeaderboardEntryToFirestore(user.uid, {
          displayName: user.displayName || 'Focus User',
          photoURL: user.photoURL || '',
          totalFocusMinutes: updatedStats.totalFocusMinutes,
          completedSessions: updatedStats.completedSessions,
          currentStreak: activeStreak,
          habitsCompletedCount: totalHabitsCompletedCount,
        });
      }

      if (completedTaskId) {
        setTasks((prev) =>
          prev.map((t) => {
            if (t.id === completedTaskId) {
              const nextDone = t.completedSessions + 1;
              const updated = {
                ...t,
                completedSessions: nextDone,
                completed: nextDone >= t.estimatedSessions ? true : t.completed,
              };
              if (user) saveTaskToFirestore(user.uid, updated);
              return updated;
            }
            return t;
          })
        );
      }
    }
  };

  // --- Habit Handlers ---
  const handleToggleHabitCompletion = useCallback(
    (habitId: string, dateKey: string) => {
      setHabits((prev) =>
        prev.map((h) => {
          if (h.id === habitId) {
            const currentCount = h.completions[dateKey] || 0;
            const nextCount = currentCount >= h.targetPerDay ? 0 : currentCount + 1;
            const updatedCompletions = { ...h.completions };
            if (nextCount === 0) {
              delete updatedCompletions[dateKey];
            } else {
              updatedCompletions[dateKey] = nextCount;
            }
            const updatedHabit = { ...h, completions: updatedCompletions };
            if (user) {
              saveHabitToFirestore(user.uid, updatedHabit);
            }
            return updatedHabit;
          }
          return h;
        })
      );
    },
    [user]
  );

  const handleSaveHabit = (
    habitData: Omit<Habit, 'id' | 'completions' | 'createdAt'> & { id?: string }
  ) => {
    if (habitData.id) {
      // Edit existing
      setHabits((prev) =>
        prev.map((h) => {
          if (h.id === habitData.id) {
            const updated = { ...h, ...habitData };
            if (user) saveHabitToFirestore(user.uid, updated);
            return updated;
          }
          return h;
        })
      );
    } else {
      // Create new
      const newHabit: Habit = {
        ...habitData,
        id: `habit-${Date.now()}`,
        completions: {},
        createdAt: new Date().toISOString(),
      };
      setHabits((prev) => [newHabit, ...prev]);
      if (user) {
        saveHabitToFirestore(user.uid, newHabit);
      }
    }
  };

  const handleDeleteHabit = (habitId: string) => {
    setHabits((prev) => prev.filter((h) => h.id !== habitId));
    if (user) {
      deleteHabitFromFirestore(user.uid, habitId);
    }
  };

  const handleOpenEditHabit = (habit: Habit) => {
    setEditingHabit(habit);
    setIsHabitModalOpen(true);
  };

  const handleOpenCreateHabit = () => {
    setEditingHabit(null);
    setIsHabitModalOpen(true);
  };

  const handleResetDemoData = () => {
    const demoHabits = getInitialHabits();
    const demoTasks = getInitialTasks();
    setHabits(demoHabits);
    setTasks(demoTasks);
    saveHabits(demoHabits);
    saveTasks(demoTasks);
    if (user) {
      uploadLocalHabitsToCloud(user.uid, demoHabits);
      uploadLocalTasksToCloud(user.uid, demoTasks);
    }
  };

  const handleUpdatePreferences = (updated: Partial<UserPreferences>) => {
    setPreferences((p) => {
      const next = { ...p, ...updated };
      if (user) savePreferencesToFirestore(user.uid, next);
      return next;
    });
  };

  // Selected background object
  const currentBg =
    BACKGROUND_PRESETS.find((b) => b.id === preferences.backgroundId) ||
    BACKGROUND_PRESETS[0];

  const todayKey = formatDateKey(new Date());
  const todayCompletedHabitsCount = habits.filter(
    (h) => (h.completions[todayKey] || 0) >= h.targetPerDay
  ).length;

  const activeTask = tasks.find((t) => t.id === activeTaskId);
  const activeTracksCount = tracks.filter((t) => t.isPlaying).length;
  const pendingTasksCount = tasks.filter((t) => !t.completed).length;

  return (
    <div className="relative w-screen h-screen overflow-hidden flex flex-col justify-between select-none">
      {/* 1. Ambient Background Layer */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {/* YouTube Ambient Video Layer */}
        {preferences.youtubeEnabled && (
          <YouTubePlayer
            videoId={preferences.youtubeVideoId}
            volume={preferences.youtubeVolume}
            isMuted={preferences.youtubeMuted || isMuted}
            isPlaying={isYouTubePlaying}
            showVideo={preferences.youtubeShowVideo}
            blur={preferences.backgroundBlur}
          />
        )}

        {/* Static / Preset Image or Gradient (shows when YouTube is disabled or video is hidden) */}
        {(!preferences.youtubeEnabled || !preferences.youtubeShowVideo) && (
          currentBg.type === 'image' ? (
            <img
              src={currentBg.value}
              alt="Ambient scene backdrop"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover transition-all duration-700 ease-in-out scale-105"
              style={{
                filter: `blur(${preferences.backgroundBlur}px)`,
              }}
            />
          ) : (
            <div
              className="w-full h-full transition-all duration-700"
              style={{
                background: currentBg.value,
                filter: `blur(${preferences.backgroundBlur}px)`,
              }}
            />
          )
        )}

        {/* Ambient Dark Scrim Overlay */}
        <div
          className="absolute inset-0 bg-stone-950 transition-opacity duration-300"
          style={{ opacity: preferences.overlayDarkness / 100 }}
        />

        {/* Subtle Vignette */}
        <div className="absolute inset-0 bg-radial from-transparent via-transparent to-black/60 pointer-events-none" />
      </div>

      {/* 2. Top Header Bar */}
      <TopBar
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        activeTracksCount={activeTracksCount + (preferences.youtubeEnabled ? 1 : 0)}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
        onOpenSettings={() => setActivePanel('background')}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenLeaderboard={() => setActivePanel('leaderboard')}
        user={user}
      />

      {/* 3. Center Section: Flowtex Focus Timer */}
      <main className="relative z-10 flex-1 flex items-center justify-center">
        <Timer
          preferences={preferences}
          activeTask={activeTask}
          tasks={tasks}
          onSessionComplete={handleSessionComplete}
          onClearActiveTask={() => setActiveTaskId(undefined)}
          onSelectActiveTask={handleSelectActiveTask}
          onOpenTaskPanel={() => setActivePanel('tasks')}
          onUpdatePreferences={handleUpdatePreferences}
        />
      </main>

      {/* 4. Floating Action Panels (Tasks / Sounds / Background / YouTube) */}
      {activePanel === 'tasks' && (
        <div className="absolute left-6 bottom-24 z-30 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <TaskPanel
            tasks={tasks}
            activeTaskId={activeTaskId}
            onAddTask={handleAddTask}
            onToggleTask={handleToggleTask}
            onDeleteTask={handleDeleteTask}
            onSelectActiveTask={handleSelectActiveTask}
            onUpdateTaskRounds={handleUpdateTaskRounds}
            onClose={() => setActivePanel('none')}
          />
        </div>
      )}

      {activePanel === 'sounds' && (
        <div className="absolute right-6 bottom-24 z-30 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <AmbientAudio
            tracks={tracks}
            onToggleTrack={handleToggleTrack}
            onUpdateTrackVolume={handleUpdateTrackVolume}
            masterVolume={preferences.soundVolume}
            onUpdateMasterVolume={handleUpdateMasterVolume}
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
            onClose={() => setActivePanel('none')}
          />
        </div>
      )}

      {activePanel === 'youtube' && (
        <div className="absolute right-6 bottom-24 z-30 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <YouTubeControls
            videoId={preferences.youtubeVideoId}
            isEnabled={preferences.youtubeEnabled}
            volume={preferences.youtubeVolume}
            isMuted={preferences.youtubeMuted}
            isPlaying={isYouTubePlaying}
            showVideo={preferences.youtubeShowVideo}
            onToggleEnabled={(enabled) =>
              handleUpdatePreferences({ youtubeEnabled: enabled })
            }
            onUpdateVideoId={(id) =>
              handleUpdatePreferences({ youtubeVideoId: id, youtubeEnabled: true })
            }
            onUpdateVolume={(vol) =>
              handleUpdatePreferences({ youtubeVolume: vol })
            }
            onToggleMute={() =>
              handleUpdatePreferences({ youtubeMuted: !preferences.youtubeMuted })
            }
            onTogglePlay={() => setIsYouTubePlaying((prev) => !prev)}
            onToggleShowVideo={() =>
              handleUpdatePreferences({ youtubeShowVideo: !preferences.youtubeShowVideo })
            }
            onClose={() => setActivePanel('none')}
          />
        </div>
      )}

      {activePanel === 'background' && (
        <div className="absolute right-6 bottom-24 z-30 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <BackgroundSelector
            preferences={preferences}
            onUpdatePreferences={handleUpdatePreferences}
            onClose={() => setActivePanel('none')}
          />
        </div>
      )}

      {/* 5. Flowtex Comprehensive Habit Tracker Drawer / Modal */}
      {activePanel === 'habits' && (
        <HabitTracker
          habits={habits}
          preferences={preferences}
          onUpdatePreferences={handleUpdatePreferences}
          onToggleCompletion={handleToggleHabitCompletion}
          onOpenCreateModal={handleOpenCreateHabit}
          onEditHabit={handleOpenEditHabit}
          onImportHabits={(imported) => {
            setHabits(imported);
            if (user) uploadLocalHabitsToCloud(user.uid, imported);
          }}
          onResetDemoData={handleResetDemoData}
          onClose={() => setActivePanel('none')}
        />
      )}

      {/* 6. Habit Creation / Edit Modal */}
      <HabitModal
        habit={editingHabit}
        isOpen={isHabitModalOpen}
        onClose={() => {
          setIsHabitModalOpen(false);
          setEditingHabit(null);
        }}
        onSave={handleSaveHabit}
        onDelete={handleDeleteHabit}
      />

      {/* 7. Firebase Auth & Cloud Account Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        habitsCount={habits.length}
        tasksCount={tasks.length}
      />

      {/* 8. Global Community Leaderboard Modal */}
      <LeaderboardModal
        isOpen={activePanel === 'leaderboard'}
        onClose={() => setActivePanel('none')}
        currentUser={user}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        userStats={{
          totalFocusMinutes: focusStats.totalFocusMinutes,
          completedSessions: focusStats.completedSessions,
          currentStreak: activeStreak,
          habitsCompletedCount: totalHabitsCompletedCount,
        }}
      />

      {/* 9. Bottom Dock Bar */}
      <footer className="relative z-20 pb-2">
        <BottomBar
          activePanel={activePanel}
          onTogglePanel={(panel) => setActivePanel(panel)}
          pendingTasksCount={pendingTasksCount}
          todayCompletedHabitsCount={todayCompletedHabitsCount}
          totalHabitsCount={habits.length}
          activeStreak={activeStreak}
          activeSoundsCount={activeTracksCount}
          isYouTubeActive={preferences.youtubeEnabled}
          isFullscreen={isFullscreen}
          onToggleFullscreen={toggleFullscreen}
        />
      </footer>
    </div>
  );
}
