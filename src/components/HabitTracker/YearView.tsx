import React, { useState } from 'react';
import { Habit } from '../../types';
import { formatDateKey, isHabitCompletedOnDate } from '../../utils/storage';

interface YearViewProps {
  habits: Habit[];
}

export const YearView: React.FC<YearViewProps> = ({ habits }) => {
  const [selectedHabitId, setSelectedHabitId] = useState<string>('all');
  const [hoveredDay, setHoveredDay] = useState<{ dateKey: string; count: number; dateStr: string } | null>(null);

  const currentYear = new Date().getFullYear();

  // Generate 52 weeks (364/365 days) ending today
  const generateWeeksData = () => {
    const today = new Date();
    const weeks = [];
    const targetHabits = selectedHabitId === 'all'
      ? habits
      : habits.filter((h) => h.id === selectedHabitId);

    // Start 52 weeks ago
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 52 * 7 + (7 - today.getDay()));

    for (let w = 0; w < 52; w++) {
      const weekDays = [];
      for (let d = 0; d < 7; d++) {
        const dateObj = new Date(startDate);
        dateObj.setDate(startDate.getDate() + (w * 7 + d));
        const key = formatDateKey(dateObj);

        // Count how many habits were completed on this day
        let completedCount = 0;
        targetHabits.forEach((h) => {
          if (isHabitCompletedOnDate(h, key)) completedCount++;
        });

        weekDays.push({
          date: dateObj,
          key,
          completedCount,
          isFuture: dateObj > today,
        });
      }
      weeks.push(weekDays);
    }

    return weeks;
  };

  const weeks = generateWeeksData();

  // Calculate intensity color
  const getIntensityColor = (count: number, isFuture: boolean) => {
    if (isFuture) return 'bg-transparent border border-white/5';
    if (count === 0) return 'bg-white/5 border border-white/5';

    if (selectedHabitId !== 'all') {
      const habit = habits.find((h) => h.id === selectedHabitId);
      return count > 0 ? (habit?.color || '#10B981') : 'bg-white/5';
    }

    // Combined habits intensity levels
    if (count === 1) return 'bg-emerald-950 border border-emerald-800 text-emerald-300';
    if (count === 2) return 'bg-emerald-800 border border-emerald-700';
    if (count === 3) return 'bg-emerald-600 border border-emerald-500';
    return 'bg-emerald-400 border border-emerald-300';
  };

  return (
    <div className="space-y-6">
      {/* Top Filter and Info */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-2">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight">
            Annual Habit Heatmap ({currentYear})
          </h3>
          <p className="text-xs text-white/50">52-week visual consistency matrix</p>
        </div>

        {/* Habit Selector Dropdown / Pills */}
        <select
          value={selectedHabitId}
          onChange={(e) => setSelectedHabitId(e.target.value)}
          aria-label="Filter heatmap by habit"
          className="bg-white/10 text-white text-xs px-3 py-1.5 rounded-xl border border-white/10 focus:outline-none focus:border-amber-400 cursor-pointer"
        >
          <option value="all" className="bg-stone-900 text-white">All Habits Combined</option>
          {habits.map((h) => (
            <option key={h.id} value={h.id} className="bg-stone-900 text-white">
              {h.emoji} {h.title}
            </option>
          ))}
        </select>
      </div>

      {/* Heatmap Card */}
      <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4 overflow-x-auto">
        <div className="min-w-[680px]">
          {/* Day of Week Labels + Grid */}
          <div className="flex gap-1.5">
            {/* Days Column */}
            <div className="flex flex-col justify-between py-1 text-[10px] text-white/40 font-mono pr-2">
              <span>Mon</span>
              <span>Wed</span>
              <span>Fri</span>
              <span>Sun</span>
            </div>

            {/* Weeks columns */}
            <div className="flex gap-1 flex-1">
              {weeks.map((week, wIdx) => (
                <div key={wIdx} className="flex flex-col gap-1">
                  {week.map((day) => {
                    const isCustomColor = selectedHabitId !== 'all' && day.completedCount > 0;
                    const habit = habits.find((h) => h.id === selectedHabitId);

                    return (
                      <div
                        key={day.key}
                        onMouseEnter={() =>
                          setHoveredDay({
                            dateKey: day.key,
                            count: day.completedCount,
                            dateStr: day.date.toLocaleDateString(undefined, {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            }),
                          })
                        }
                        onMouseLeave={() => setHoveredDay(null)}
                        className={`w-3.5 h-3.5 rounded-sm transition-transform hover:scale-125 cursor-pointer ${
                          isCustomColor ? '' : getIntensityColor(day.completedCount, day.isFuture)
                        }`}
                        style={{
                          backgroundColor: isCustomColor ? habit?.color : undefined,
                        }}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Hover Status & Legend */}
          <div className="flex items-center justify-between pt-4 mt-3 border-t border-white/10 text-xs">
            <div className="text-white/70 font-mono min-h-[1.25rem]">
              {hoveredDay ? (
                <span>
                  <strong>{hoveredDay.count}</strong> completion{hoveredDay.count !== 1 ? 's' : ''} on {hoveredDay.dateStr}
                </span>
              ) : (
                <span className="text-white/40">Hover over any tile for date details</span>
              )}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-1.5 text-[11px] text-white/50">
              <span>Less</span>
              <div className="w-3 h-3 rounded-sm bg-white/5 border border-white/5" />
              <div className="w-3 h-3 rounded-sm bg-emerald-950 border border-emerald-800" />
              <div className="w-3 h-3 rounded-sm bg-emerald-800" />
              <div className="w-3 h-3 rounded-sm bg-emerald-600" />
              <div className="w-3 h-3 rounded-sm bg-emerald-400" />
              <span>More</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
