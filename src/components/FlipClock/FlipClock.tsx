import React from 'react';
import { FlipCard } from './FlipCard';

interface FlipClockProps {
  minutes: number;
  seconds: number;
}

export const FlipClock: React.FC<FlipClockProps> = ({ minutes, seconds }) => {
  const mStr = String(minutes).padStart(2, '0');
  const sStr = String(seconds).padStart(2, '0');

  const m1 = mStr[0];
  const m2 = mStr[1];
  const s1 = sStr[0];
  const s2 = sStr[1];

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3 md:gap-4 select-none py-2">
      {/* Minutes Pair */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <FlipCard digit={m1} />
        <FlipCard digit={m2} />
      </div>

      {/* Colon Separator */}
      <div className="flex flex-col justify-center items-center gap-3 sm:gap-5 px-1 sm:px-2">
        <div className="w-2.5 sm:w-3.5 h-2.5 sm:h-3.5 rounded-full bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.8)] border border-amber-300 animate-pulse" />
        <div className="w-2.5 sm:w-3.5 h-2.5 sm:h-3.5 rounded-full bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.8)] border border-amber-300 animate-pulse" />
      </div>

      {/* Seconds Pair */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <FlipCard digit={s1} />
        <FlipCard digit={s2} />
      </div>
    </div>
  );
};
