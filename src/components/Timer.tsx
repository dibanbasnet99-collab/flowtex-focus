import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Plus,
  Minus,
  CheckCircle2,
  Mic,
  MicOff,
  Bell,
  Clock,
  Target,
} from 'lucide-react';
import { TimerMode, Task, UserPreferences } from '../types';
import { soundEngine } from '../utils/audioEngine';
import { voiceAnnouncer } from '../utils/voiceAnnouncer';
import { FlipClock } from './FlipClock/FlipClock';
import confetti from 'canvas-confetti';

interface TimerProps {
  preferences: UserPreferences;
  activeTask?: Task;
  tasks?: Task[];
  onSessionComplete: (mode: TimerMode, taskId?: string) => void;
  onClearActiveTask?: () => void;
  onSelectActiveTask?: (task: Task) => void;
  onOpenTaskPanel?: () => void;
  onUpdatePreferences?: (updated: Partial<UserPreferences>) => void;
}

export const Timer: React.FC<TimerProps> = ({
  preferences,
  activeTask,
  tasks,
  onSessionComplete,
  onClearActiveTask,
  onSelectActiveTask,
  onOpenTaskPanel,
  onUpdatePreferences,
}) => {
  const [mode, setMode] = useState<TimerMode>('focus');
  const [timeLeft, setTimeLeft] = useState<number>(preferences.focusDuration * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [completedSessionsCount, setCompletedSessionsCount] = useState<number>(0);

  // Sync timeLeft when preferences change if timer is not running
  useEffect(() => {
    if (!isRunning) {
      if (mode === 'focus') setTimeLeft(preferences.focusDuration * 60);
      else if (mode === 'shortBreak') setTimeLeft(preferences.shortBreakDuration * 60);
      else if (mode === 'longBreak') setTimeLeft(preferences.longBreakDuration * 60);
    }
  }, [preferences.focusDuration, preferences.shortBreakDuration, preferences.longBreakDuration, mode]);

  // Announce when linked task changes while in focus mode
  const prevTaskIdRef = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (activeTask && activeTask.id !== prevTaskIdRef.current && mode === 'focus') {
      prevTaskIdRef.current = activeTask.id;
      const durationMins = Math.ceil(timeLeft / 60);
      voiceAnnouncer.announceMode('focus', durationMins, activeTask.title, preferences.voiceAnnouncements);
    }
  }, [activeTask, mode, preferences.voiceAnnouncements, timeLeft]);

  // Main countdown timer effect with mechanical tick
  useEffect(() => {
    let interval: number | null = null;

    if (isRunning) {
      interval = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleComplete();
            return 0;
          }
          // Mechanical clock tick sound
          if (preferences.mechanicalTick) {
            soundEngine.playMechanicalTick(0.35);
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, mode, completedSessionsCount, preferences]);

  // Trigger celebration and mode transition
  const handleComplete = () => {
    setIsRunning(false);
    soundEngine.playChime(preferences.bellVolume);

    if (mode === 'focus') {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
      const nextCount = completedSessionsCount + 1;
      setCompletedSessionsCount(nextCount);
      onSessionComplete('focus', activeTask?.id);

      // Auto cycle to short break or long break
      const isLongBreak = nextCount % preferences.longBreakInterval === 0;
      const nextMode: TimerMode = isLongBreak ? 'longBreak' : 'shortBreak';
      const nextDurationMins = isLongBreak ? preferences.longBreakDuration : preferences.shortBreakDuration;

      setMode(nextMode);
      setTimeLeft(nextDurationMins * 60);

      // AI Voice announcement on transition to break
      voiceAnnouncer.announceMode(
        nextMode,
        nextDurationMins,
        undefined,
        preferences.voiceAnnouncements
      );

      if (preferences.autoStartBreaks) {
        setIsRunning(true);
      }
    } else {
      // Break ended -> switch back to focus
      onSessionComplete(mode);
      setMode('focus');
      const focusMins = preferences.focusDuration;
      setTimeLeft(focusMins * 60);

      // AI Voice announcement on returning to focus
      voiceAnnouncer.announceMode(
        'focus',
        focusMins,
        activeTask?.title,
        preferences.voiceAnnouncements
      );

      if (preferences.autoStartFocus) {
        setIsRunning(true);
      }
    }
  };

  const handleModeChange = (newMode: TimerMode) => {
    setMode(newMode);
    setIsRunning(false);

    let durationMins = preferences.focusDuration;
    if (newMode === 'focus') {
      durationMins = preferences.focusDuration;
    } else if (newMode === 'shortBreak') {
      durationMins = preferences.shortBreakDuration;
    } else if (newMode === 'longBreak') {
      durationMins = preferences.longBreakDuration;
    }

    setTimeLeft(durationMins * 60);

    // AI Voice announces mode switch
    voiceAnnouncer.announceMode(
      newMode,
      durationMins,
      newMode === 'focus' ? activeTask?.title : undefined,
      preferences.voiceAnnouncements
    );
  };

  const handleTogglePlay = () => {
    const nextRunning = !isRunning;
    setIsRunning(nextRunning);

    if (nextRunning) {
      // Initial click sound
      if (preferences.mechanicalTick) {
        soundEngine.playMechanicalTick(0.5);
      }
      // Announce upon pressing start if voice enabled
      const currentMins = Math.ceil(timeLeft / 60);
      voiceAnnouncer.announceMode(
        mode,
        currentMins,
        mode === 'focus' ? activeTask?.title : undefined,
        preferences.voiceAnnouncements
      );
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    if (mode === 'focus') setTimeLeft(preferences.focusDuration * 60);
    else if (mode === 'shortBreak') setTimeLeft(preferences.shortBreakDuration * 60);
    else if (mode === 'longBreak') setTimeLeft(preferences.longBreakDuration * 60);
    if (preferences.mechanicalTick) {
      soundEngine.playMechanicalTick(0.4);
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const adjustMinutes = (deltaMinutes: number) => {
    setTimeLeft((prev) => Math.max(60, prev + deltaMinutes * 60));
    if (preferences.mechanicalTick) {
      soundEngine.playMechanicalTick(0.3);
    }
  };

  // Format MM and SS for Flip Clock
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="flex flex-col items-center justify-center select-none text-center px-4 max-w-2xl mx-auto">
      {/* Mode Selector Segmented Controls */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-full bg-black/45 backdrop-blur-xl border border-white/10 shadow-2xl mb-6 transition-all">
        <button
          onClick={() => handleModeChange('focus')}
          className={`px-5 py-2 rounded-full text-xs font-semibold tracking-wider transition-all duration-200 ${
            mode === 'focus'
              ? 'bg-white text-stone-900 shadow-md scale-100 font-bold'
              : 'text-white/70 hover:text-white hover:bg-white/5'
          }`}
        >
          FOCUS
        </button>
        <button
          onClick={() => handleModeChange('shortBreak')}
          className={`px-5 py-2 rounded-full text-xs font-semibold tracking-wider transition-all duration-200 ${
            mode === 'shortBreak'
              ? 'bg-emerald-400 text-stone-950 shadow-md scale-100 font-bold'
              : 'text-white/70 hover:text-white hover:bg-white/5'
          }`}
        >
          SHORT BREAK
        </button>
        <button
          onClick={() => handleModeChange('longBreak')}
          className={`px-5 py-2 rounded-full text-xs font-semibold tracking-wider transition-all duration-200 ${
            mode === 'longBreak'
              ? 'bg-cyan-400 text-stone-950 shadow-md scale-100 font-bold'
              : 'text-white/70 hover:text-white hover:bg-white/5'
          }`}
        >
          LONG BREAK
        </button>
      </div>

      {/* Main 3D Split-Flap Flip Clock Display */}
      <div className="relative group my-3 flex items-center justify-center">
        <FlipClock minutes={minutes} seconds={seconds} />

        {/* Quick minute adjusters on hover */}
        <div className="absolute -right-10 sm:-right-14 top-1/2 -translate-y-1/2 flex flex-col gap-2 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => adjustMinutes(1)}
            title="Add 1 minute"
            className="p-2 rounded-full bg-black/50 hover:bg-white/20 text-white/80 hover:text-white backdrop-blur-md border border-white/10 transition-colors shadow-lg active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => adjustMinutes(-1)}
            title="Subtract 1 minute"
            className="p-2 rounded-full bg-black/50 hover:bg-white/20 text-white/80 hover:text-white backdrop-blur-md border border-white/10 transition-colors shadow-lg active:scale-95"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Primary Action Controls */}
      <div className="flex items-center gap-4 mt-2">
        {/* Reset */}
        <button
          onClick={handleReset}
          title="Reset Timer"
          className="p-3.5 rounded-full bg-black/40 hover:bg-black/60 text-white/70 hover:text-white backdrop-blur-md border border-white/10 transition-all duration-200 active:scale-95 shadow-lg"
        >
          <RotateCcw className="w-5 h-5" />
        </button>

        {/* Play / Pause Primary Button */}
        <button
          onClick={handleTogglePlay}
          className={`flex items-center justify-center w-20 h-20 rounded-full transition-all duration-300 shadow-2xl active:scale-95 ${
            isRunning
              ? 'bg-white/20 hover:bg-white/30 text-white border-2 border-white/30 backdrop-blur-xl'
              : 'bg-white hover:bg-stone-100 text-stone-900 shadow-white/10'
          }`}
          title={isRunning ? 'Pause' : 'Start Focus'}
        >
          {isRunning ? (
            <Pause className="w-8 h-8 fill-current" />
          ) : (
            <Play className="w-8 h-8 fill-current ml-1" />
          )}
        </button>

        {/* Skip / Next */}
        <button
          onClick={handleSkip}
          title="Skip to next session"
          className="p-3.5 rounded-full bg-black/40 hover:bg-black/60 text-white/70 hover:text-white backdrop-blur-md border border-white/10 transition-all duration-200 active:scale-95 shadow-lg"
        >
          <SkipForward className="w-5 h-5" />
        </button>
      </div>

      {/* Focused Task Display directly below play/pause controls */}
      <div className="my-4 min-h-[44px] flex items-center justify-center">
        {activeTask ? (
          <div className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-black/50 backdrop-blur-xl border border-amber-400/40 text-white text-xs shadow-2xl max-w-lg transition-all animate-in fade-in duration-200">
            <div className="w-6 h-6 rounded-lg bg-amber-400/20 text-amber-300 flex items-center justify-center shrink-0">
              <Target className="w-3.5 h-3.5" />
            </div>
            <div className="flex flex-col text-left truncate mr-1">
              <div className="flex items-center gap-1.5 truncate">
                <span className="text-[10px] text-white/50 uppercase tracking-wider font-semibold">Focusing on:</span>
                <span className="font-bold text-white truncate max-w-[200px] sm:max-w-[320px]">
                  {activeTask.title}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-white/50">
                <span className="text-amber-300 font-mono font-medium">
                  Round {activeTask.completedSessions + 1} of {activeTask.estimatedSessions}
                </span>
                <span>·</span>
                <span className="capitalize">{activeTask.priority} priority</span>
              </div>
            </div>
            {onClearActiveTask && (
              <button
                onClick={onClearActiveTask}
                title="Unlink task from clock"
                className="p-1 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors ml-auto text-xs"
              >
                ✕
              </button>
            )}
          </div>
        ) : (
          <button
            onClick={onOpenTaskPanel}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/15 hover:border-amber-400/50 text-white/80 hover:text-white text-xs transition-all shadow-md group"
          >
            <Target className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
            <span>Select a task to focus on</span>
            {tasks && tasks.filter((t) => !t.completed).length > 0 && (
              <span className="text-[10px] text-amber-300/80 font-mono">
                ({tasks.filter((t) => !t.completed).length} pending)
              </span>
            )}
          </button>
        )}
      </div>

      {/* Auxiliary Settings Pill: Voice Announcements & Clock Tick Toggles */}
      {onUpdatePreferences && (
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-black/30 backdrop-blur-md border border-white/10 text-[11px] text-white/60">
          {/* AI Voice Toggle */}
          <button
            onClick={() =>
              onUpdatePreferences({ voiceAnnouncements: !preferences.voiceAnnouncements })
            }
            title={preferences.voiceAnnouncements ? 'AI Voice announcements enabled' : 'AI Voice announcements muted'}
            className={`flex items-center gap-1 px-2 py-0.5 rounded-full transition-colors ${
              preferences.voiceAnnouncements
                ? 'text-amber-300 bg-amber-400/20'
                : 'text-white/40 hover:text-white'
            }`}
          >
            {preferences.voiceAnnouncements ? (
              <Mic className="w-3 h-3" />
            ) : (
              <MicOff className="w-3 h-3" />
            )}
            <span>Voice {preferences.voiceAnnouncements ? 'On' : 'Off'}</span>
          </button>

          <span className="text-white/20">·</span>

          {/* Mechanical Tick Toggle */}
          <button
            onClick={() =>
              onUpdatePreferences({ mechanicalTick: !preferences.mechanicalTick })
            }
            title={preferences.mechanicalTick ? 'Mechanical clock clicking on' : 'Mechanical clock clicking muted'}
            className={`flex items-center gap-1 px-2 py-0.5 rounded-full transition-colors ${
              preferences.mechanicalTick
                ? 'text-amber-300 bg-amber-400/20'
                : 'text-white/40 hover:text-white'
            }`}
          >
            <Clock className="w-3 h-3" />
            <span>Clock Click {preferences.mechanicalTick ? 'On' : 'Off'}</span>
          </button>
        </div>
      )}
    </div>
  );
};
