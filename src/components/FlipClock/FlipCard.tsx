import React, { useEffect, useState } from 'react';

interface FlipCardProps {
  digit: string;
}

export const FlipCard: React.FC<FlipCardProps> = ({ digit }) => {
  const [current, setCurrent] = useState(digit);
  const [previous, setPrevious] = useState(digit);
  const [flipping, setFlipping] = useState(false);
  const [flipKey, setFlipKey] = useState(0);

  useEffect(() => {
    if (digit !== current) {
      setPrevious(current);
      setCurrent(digit);
      setFlipping(true);
      setFlipKey((prev) => prev + 1);

      const timeout = setTimeout(() => {
        setFlipping(false);
      }, 550);

      return () => clearTimeout(timeout);
    }
  }, [digit, current]);

  return (
    <div className="relative w-16 sm:w-24 md:w-28 lg:w-32 h-24 sm:h-36 md:h-44 lg:h-48 select-none shadow-2xl rounded-2xl">
      {/* Outer Card Frame */}
      <div className="relative w-full h-full rounded-2xl bg-zinc-950/95 border border-white/20 shadow-[0_12px_36px_rgba(0,0,0,0.8)] overflow-hidden">
        
        {/* 1. Static Top Half: Displays the new incoming digit (current) */}
        <div className="relative w-full h-1/2 overflow-hidden bg-gradient-to-b from-stone-900 via-stone-900 to-stone-950 border-b border-black/80">
          <div className="absolute top-0 left-0 w-full h-[200%] flex items-center justify-center">
            <span className="font-mono font-bold text-white text-5xl sm:text-7xl md:text-8xl lg:text-9xl leading-none tabular-nums drop-shadow-md">
              {current}
            </span>
          </div>
          {/* Subtle glossy sheen */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
        </div>

        {/* 2. Static Bottom Half: Displays the old digit until covered, or current digit once flap lands */}
        <div className="relative w-full h-1/2 overflow-hidden bg-gradient-to-b from-stone-950 via-stone-900 to-stone-900 border-t border-white/5">
          <div className="absolute bottom-0 left-0 w-full h-[200%] flex items-center justify-center">
            <span className="font-mono font-bold text-white text-5xl sm:text-7xl md:text-8xl lg:text-9xl leading-none tabular-nums drop-shadow-md">
              {flipping ? previous : current}
            </span>
          </div>
        </div>

        {/* 3. Flipping Flap - Top Leaf: Folds downward to hide previous digit */}
        {flipping && (
          <div
            key={`top-${flipKey}`}
            className="absolute top-0 left-0 w-full h-1/2 overflow-hidden bg-gradient-to-b from-stone-900 via-stone-900 to-stone-950 border-b border-black/80 z-20 animate-flip-top"
          >
            <div className="absolute top-0 left-0 w-full h-[200%] flex items-center justify-center">
              <span className="font-mono font-bold text-white text-5xl sm:text-7xl md:text-8xl lg:text-9xl leading-none tabular-nums drop-shadow-md">
                {previous}
              </span>
            </div>
            {/* Darkening fold shadow */}
            <div className="absolute inset-0 bg-black/50 pointer-events-none animate-shadow-top" />
          </div>
        )}

        {/* 4. Flipping Flap - Bottom Leaf: Flaps down to reveal and lock in current digit */}
        {flipping && (
          <div
            key={`bottom-${flipKey}`}
            className="absolute bottom-0 left-0 w-full h-1/2 overflow-hidden bg-gradient-to-b from-stone-950 via-stone-900 to-stone-900 border-t border-white/5 z-30 animate-flip-bottom"
          >
            <div className="absolute bottom-0 left-0 w-full h-[200%] flex items-center justify-center">
              <span className="font-mono font-bold text-white text-5xl sm:text-7xl md:text-8xl lg:text-9xl leading-none tabular-nums drop-shadow-md">
                {current}
              </span>
            </div>
            {/* Shadow clearing */}
            <div className="absolute inset-0 bg-black/40 pointer-events-none animate-shadow-bottom" />
          </div>
        )}

        {/* Center Mechanical Split Seam Line */}
        <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-[3px] bg-black/95 z-40 shadow-[0_2px_4px_rgba(0,0,0,0.9)] pointer-events-none" />

        {/* Left Side Hinge Notch */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 sm:w-2 h-3.5 sm:h-4 bg-stone-950 border-r border-t border-b border-white/15 rounded-r-md z-50 pointer-events-none shadow" />
        
        {/* Right Side Hinge Notch */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 sm:w-2 h-3.5 sm:h-4 bg-stone-950 border-l border-t border-b border-white/15 rounded-l-md z-50 pointer-events-none shadow" />
      </div>
    </div>
  );
};
