import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { Habit } from '../../types';
import { formatDateKey, isHabitCompletedOnDate, getHabitCompletionCount } from '../../utils/storage';

interface MonthViewProps {
  habits: Habit[];
  onToggleCompletion: (habitId: string, dateKey: string) => void;
}

export const MonthView: React.FC<MonthViewProps> = ({
  habits,
  onToggleCompletion,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const monthName = currentDate.toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  });

  // Calculate days in current month
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const totalDays = lastDayOfMonth.getDate();

  // Day of week for 1st of month (0 = Sun, 1 = Mon ... 6 = Sat)
  const startingDayOfWeek = firstDayOfMonth.getDay();
  // Adjust to Monday first (0=Mon, 6=Sun)
  const adjustedStartingDay = (startingDayOfWeek + 6) % 7;

  const todayKey = formatDateKey(new Date());

  return (
    <div className="space-y-6">
      {/* Month Selector Bar */}
      <div className="flex items-center justify-between px-2">
        <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
          <span>{monthName}</span>
        </h3>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setCurrentDate(new Date())}
            className="text-xs px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-white/80 transition-colors"
          >
            Current Month
          </button>
          <button
            onClick={handlePrevMonth}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-white/70 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNextMonth}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-white/70 hover:text-white transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grid of Habits with their Month Calendar */}
      <div className="space-y-5">
        {habits.map((habit) => {
          let monthCompletedCount = 0;
          for (let d = 1; d <= totalDays; d++) {
            const dateObj = new Date(year, month, d);
            const key = formatDateKey(dateObj);
            if (isHabitCompletedOnDate(habit, key)) {
              monthCompletedCount++;
            }
          }
          const completionRate = Math.round((monthCompletedCount / totalDays) * 100);

          return (
            <div
              key={habit.id}
              className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3"
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-sm border"
                    style={{
                      backgroundColor: `${habit.color}22`,
                      borderColor: `${habit.color}66`,
                    }}
                  >
                    {habit.emoji}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">{habit.title}</h4>
                    <span className="text-[11px] text-white/50">{habit.category}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <span className="font-mono text-white/80">
                    <strong className="text-white">{monthCompletedCount}</strong> / {totalDays} days
                  </span>
                  <span
                    className="px-2 py-0.5 rounded-md font-mono font-semibold text-[11px]"
                    style={{
                      backgroundColor: `${habit.color}22`,
                      color: habit.color,
                    }}
                  >
                    {completionRate}%
                  </span>
                </div>
              </div>

              {/* Mini Calendar Grid */}
              <div className="pt-2">
                {/* Weekday headers */}
                <div className="grid grid-cols-7 gap-1.5 text-center text-[10px] text-white/40 mb-1.5 font-medium">
                  {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => (
                    <div key={idx}>{day}</div>
                  ))}
                </div>

                {/* Day cells */}
                <div className="grid grid-cols-7 gap-1.5">
                  {/* Empty lead cells */}
                  {Array.from({ length: adjustedStartingDay }).map((_, i) => (
                    <div key={`empty-${i}`} className="h-8 rounded-lg bg-transparent" />
                  ))}

                  {/* Day cells for current month */}
                  {Array.from({ length: totalDays }).map((_, i) => {
                    const dayNum = i + 1;
                    const dateObj = new Date(year, month, dayNum);
                    const dateKey = formatDateKey(dateObj);
                    const count = getHabitCompletionCount(habit, dateKey);
                    const isDone = isHabitCompletedOnDate(habit, dateKey);
                    const isToday = dateKey === todayKey;

                    return (
                      <button
                        key={dateKey}
                        onClick={() => onToggleCompletion(habit.id, dateKey)}
                        title={`${habit.title} on ${dateKey}: ${count}/${habit.targetPerDay}`}
                        className={`h-8 rounded-lg flex items-center justify-center text-xs font-mono transition-all relative ${
                          isDone
                            ? 'text-stone-950 font-bold shadow-sm'
                            : count > 0
                            ? 'bg-white/10 text-amber-300 font-bold border border-amber-400/40'
                            : 'bg-white/[0.03] text-white/60 hover:bg-white/10'
                        } ${isToday ? 'ring-1 ring-amber-400' : ''}`}
                        style={{
                          backgroundColor: isDone ? habit.color : undefined,
                        }}
                      >
                        {dayNum}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
