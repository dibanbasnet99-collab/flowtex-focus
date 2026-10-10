import React, { useState } from 'react';
import { Flame, CheckCircle, Trophy, TrendingUp, Calendar } from 'lucide-react';
import { Habit } from '../../types';
import { calculateOverallStats, calculateCurrentStreak, calculateBestStreak, isHabitCompletedOnDate, formatDateKey } from '../../utils/storage';
import { YearView } from './YearView';

interface StatsViewProps {
  habits: Habit[];
}

export const StatsView: React.FC<StatsViewProps> = ({ habits }) => {
  const [hoveredMonthIdx, setHoveredMonthIdx] = useState<number | null>(null);
  const stats = calculateOverallStats(habits);

  const currentYear = new Date().getFullYear();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Calculate completions per month for current year
  const monthlyData = months.map((mName, mIdx) => {
    let completions = 0;
    const daysInMonth = new Date(currentYear, mIdx + 1, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(currentYear, mIdx, day);
      const key = formatDateKey(d);
      habits.forEach((h) => {
        if (isHabitCompletedOnDate(h, key)) completions++;
      });
    }

    return { month: mName, count: completions };
  });

  const maxMonthVal = Math.max(...monthlyData.map((d) => d.count), 1);

  // SVG Area / Bar chart coordinates
  const svgWidth = 600;
  const svgHeight = 180;
  const paddingX = 40;
  const paddingY = 25;

  const points = monthlyData.map((d, i) => {
    const x = paddingX + (i / (months.length - 1)) * (svgWidth - paddingX * 2);
    const y = svgHeight - paddingY - (d.count / maxMonthVal) * (svgHeight - paddingY * 2);
    return { x, y, ...d };
  });

  const pathD = points.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${svgHeight - paddingY} L ${points[0].x} ${svgHeight - paddingY} Z`;

  return (
    <div className="space-y-6">
      {/* 4 Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Total Completed Days */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between text-white/50 mb-2">
            <span className="text-xs font-medium">Total Days</span>
            <Calendar className="w-4 h-4 text-sky-400" />
          </div>
          <div className="font-mono text-2xl font-bold text-white tabular-nums">
            {stats.totalCompletedDays}
          </div>
          <span className="text-[11px] text-white/40 mt-1">Days with completed habits</span>
        </div>

        {/* Completion Rate */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between text-white/50 mb-2">
            <span className="text-xs font-medium">Completion Rate</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="font-mono text-2xl font-bold text-emerald-400 tabular-nums">
            {stats.completionRate}%
          </div>
          <span className="text-[11px] text-white/40 mt-1">Last 30 days consistency</span>
        </div>

        {/* Current Daily Streak */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between text-white/50 mb-2">
            <span className="text-xs font-medium">Current Streak</span>
            <Flame className="w-4 h-4 text-amber-400 fill-amber-400/30" />
          </div>
          <div className="font-mono text-2xl font-bold text-amber-400 tabular-nums">
            {stats.currentDailyStreak} <span className="text-xs text-white/50 font-normal">days</span>
          </div>
          <span className="text-[11px] text-white/40 mt-1">Active daily streak</span>
        </div>

        {/* Best Daily Streak */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between text-white/50 mb-2">
            <span className="text-xs font-medium">Best Streak</span>
            <Trophy className="w-4 h-4 text-purple-400" />
          </div>
          <div className="font-mono text-2xl font-bold text-purple-300 tabular-nums">
            {stats.bestDailyStreak} <span className="text-xs text-white/50 font-normal">days</span>
          </div>
          <span className="text-[11px] text-white/40 mt-1">All-time personal record</span>
        </div>
      </div>

      {/* Interactive Monthly Completions Chart */}
      <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">
              Monthly Progress Curve ({currentYear})
            </h3>
            <p className="text-xs text-white/50">Cumulative habit completions across Jan–Dec</p>
          </div>
          {hoveredMonthIdx !== null && (
            <div className="px-3 py-1 rounded-lg bg-amber-400/20 border border-amber-400/40 text-xs font-mono text-amber-300 font-bold">
              {monthlyData[hoveredMonthIdx].month}: {monthlyData[hoveredMonthIdx].count} checks
            </div>
          )}
        </div>

        <div className="w-full overflow-x-auto">
          <div className="min-w-[500px]">
            <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-44 overflow-visible">
              <defs>
                <linearGradient id="curveGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1={paddingX} y1={paddingY} x2={svgWidth - paddingX} y2={paddingY} stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
              <line x1={paddingX} y1={svgHeight / 2} x2={svgWidth - paddingX} y2={svgHeight / 2} stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
              <line x1={paddingX} y1={svgHeight - paddingY} x2={svgWidth - paddingX} y2={svgHeight - paddingY} stroke="rgba(255,255,255,0.1)" />

              {/* Area fill */}
              <path d={areaD} fill="url(#curveGradient)" />

              {/* Line stroke */}
              <path d={pathD} fill="none" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />

              {/* Data points */}
              {points.map((p, idx) => (
                <g key={p.month} className="cursor-pointer" onMouseEnter={() => setHoveredMonthIdx(idx)} onMouseLeave={() => setHoveredMonthIdx(null)}>
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={hoveredMonthIdx === idx ? 6 : 4}
                    fill={hoveredMonthIdx === idx ? '#F59E0B' : '#18181b'}
                    stroke="#F59E0B"
                    strokeWidth="2"
                    className="transition-all"
                  />
                  <text
                    x={p.x}
                    y={svgHeight - 6}
                    textAnchor="middle"
                    fill="rgba(255,255,255,0.45)"
                    fontSize="10"
                    fontFamily="monospace"
                  >
                    {p.month}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </div>
      </div>

      {/* Heatmap Section */}
      <YearView habits={habits} />
    </div>
  );
};
