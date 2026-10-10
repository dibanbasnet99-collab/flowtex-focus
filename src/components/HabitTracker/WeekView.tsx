import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Flame, Plus, Check, Edit2 } from 'lucide-react';
import { Habit } from '../../types';
import { formatDateKey, calculateCurrentStreak, isHabitCompletedOnDate, getHabitCompletionCount } from '../../utils/storage';
import confetti from 'canvas-confetti';

interface WeekViewProps {
  habits: Habit[];
  onToggleCompletion: (habitId: string, dateKey: string) => void;
  onEditHabit: (habit: Habit) => void;
  onOpenNewHabit: () => void;
}

export const WeekView: React.FC<WeekViewProps> = ({
  habits,
  onToggleCompletion,
  onEditHabit,
  onOpenNewHabit,
}) => {
  const [weekOffset, setWeekOffset] = useState(0); // 0 = current week, -1 = last week

  // Calculate the 7 days of the selected week (Mon to Sun)
  const getDaysOfWeek = (offset: number) => {
    const today = new Date();
    const currentDay = today.getDay(); // 0 is Sun, 1 is Mon...
    // Distance from Monday
    const distanceToMonday = (currentDay + 6) % 7;
    const monday = new Date(today);
    monday.setDate(today.getDate() - distanceToMonday + offset * 7);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      days.push({
        date: d,
        key: formatDateKey(d),
        dayName: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
        dayNumber: d.getDate(),
        isToday: formatDateKey(d) === formatDateKey(today),
      });
    }
    return days;
  };

  const weekDays = getDaysOfWeek(weekOffset);
  const todayKey = formatDateKey(new Date());

  const handleDayClick = (habit: Habit, dateKey: string) => {
    onToggleCompletion(habit.id, dateKey);
    // If completed today's target, throw subtle confetti
    const currentCount = getHabitCompletionCount(habit, dateKey);
    if (currentCount + 1 >= habit.targetPerDay) {
      confetti({
        particleCount: 25,
        spread: 45,
        origin: { y: 0.8 },
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Week Navigator Bar */}
      <div className="flex items-center justify-between px-2 py-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-white">
            {weekDays[0].date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} –{' '}
            {weekDays[6].date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
          {weekOffset !== 0 && (
            <button
              onClick={() => setWeekOffset(0)}
              className="text-[11px] px-2 py-0.5 rounded-full bg-white/10 hover:bg-white/20 text-white/80 transition-colors"
            >
              Today
            </button>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setWeekOffset((p) => p - 1)}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-white/70 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setWeekOffset((p) => p + 1)}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-white/70 hover:text-white transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Weekday Column Headers (Desktop Alignment) */}
      <div className="hidden md:grid grid-cols-12 gap-2 px-4 py-1 text-xs text-white/50 font-medium">
        <div className="col-span-5">Habit Details</div>
        <div className="col-span-7 grid grid-cols-7 gap-2 text-center">
          {weekDays.map((d) => (
            <div
              key={d.key}
              className={`py-1 rounded-lg ${
                d.isToday ? 'text-amber-300 font-bold bg-amber-400/10' : ''
              }`}
            >
              <div>{d.dayName}</div>
              <div className="text-[11px] opacity-70 font-mono">{d.dayNumber}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Habits List Cards */}
      <div className="space-y-3">
        {habits.length === 0 ? (
          <div className="text-center py-12 rounded-2xl bg-white/5 border border-white/10 p-6">
            <span className="text-3xl mb-2 block">✨</span>
            <h3 className="text-sm font-semibold text-white">No habits created yet</h3>
            <p className="text-xs text-white/50 mt-1 max-w-sm mx-auto">
              Start building your daily ritual by creating your first habit.
            </p>
            <button
              onClick={onOpenNewHabit}
              className="mt-4 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs inline-flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-4 h-4" />
              Create Habit
            </button>
          </div>
        ) : (
          habits.map((habit) => {
            const streak = calculateCurrentStreak(habit);
            return (
              <div
                key={habit.id}
                className="group relative p-4 rounded-2xl bg-white/5 hover:bg-white/[0.08] border border-white/10 transition-all shadow-sm"
              >
                <div className="flex flex-col md:grid md:grid-cols-12 gap-3 items-center">
                  {/* Left Habit Info */}
                  <div className="w-full md:col-span-5 flex items-center justify-between md:justify-start gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 border"
                        style={{
                          backgroundColor: `${habit.color}22`,
                          borderColor: `${habit.color}55`,
                        }}
                      >
                        {habit.emoji}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-semibold text-white truncate">
                            {habit.title}
                          </h4>
                          {/* Streak Flame */}
                          {streak > 0 && (
                            <span className="flex items-center gap-0.5 text-[11px] font-bold text-amber-400 font-mono">
                              <Flame className="w-3.5 h-3.5 fill-amber-400" />
                              {streak}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-white/50">
                          <span>{habit.category}</span>
                          {habit.targetPerDay > 1 && (
                            <>
                              <span>·</span>
                              <span>Target: {habit.targetPerDay}/day</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Edit button */}
                    <button
                      onClick={() => onEditHabit(habit)}
                      title="Edit Habit"
                      className="p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* 7 Weekday Completion Pills */}
                  <div className="w-full md:col-span-7 grid grid-cols-7 gap-2">
                    {weekDays.map((d) => {
                      const count = getHabitCompletionCount(habit, d.key);
                      const isCompleted = count >= habit.targetPerDay;
                      const isPartial = count > 0 && !isCompleted;

                      return (
                        <div
                          key={d.key}
                          className="flex flex-col items-center gap-1"
                        >
                          {/* Mobile Day Label */}
                          <span className="md:hidden text-[10px] text-white/40">
                            {d.dayName}
                          </span>

                          <button
                            type="button"
                            onClick={() => handleDayClick(habit, d.key)}
                            title={`${habit.title} on ${d.dayName} ${d.dayNumber}: ${count}/${habit.targetPerDay}`}
                            className={`w-full h-11 rounded-xl flex flex-col items-center justify-center transition-all duration-200 border relative ${
                              isCompleted
                                ? 'shadow-md scale-100 border-transparent text-stone-950 font-bold'
                                : isPartial
                                ? 'border-amber-400/40 bg-white/10 text-white'
                                : 'bg-white/[0.03] hover:bg-white/10 border-white/5 text-white/30 hover:text-white/60'
                            }`}
                            style={{
                              backgroundColor: isCompleted ? habit.color : undefined,
                            }}
                          >
                            {isCompleted ? (
                              <Check className="w-4 h-4 text-stone-950 stroke-[3]" />
                            ) : isPartial ? (
                              <span className="text-[11px] font-mono font-bold text-amber-300">
                                {count}/{habit.targetPerDay}
                              </span>
                            ) : (
                              <div
                                className="w-2 h-2 rounded-full opacity-30"
                                style={{ backgroundColor: habit.color }}
                              />
                            )}

                            {/* Today ring indicator */}
                            {d.isToday && (
                              <div className="absolute inset-0 rounded-xl ring-1 ring-amber-400/70 pointer-events-none" />
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
