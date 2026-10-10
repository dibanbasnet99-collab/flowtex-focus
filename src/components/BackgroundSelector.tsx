import React from 'react';
import { X, Image as ImageIcon, Sparkles, Sliders } from 'lucide-react';
import { BackgroundOption, UserPreferences } from '../types';
import { BACKGROUND_PRESETS } from '../utils/storage';

interface BackgroundSelectorProps {
  preferences: UserPreferences;
  onUpdatePreferences: (updated: Partial<UserPreferences>) => void;
  onClose: () => void;
}

export const BackgroundSelector: React.FC<BackgroundSelectorProps> = ({
  preferences,
  onUpdatePreferences,
  onClose,
}) => {
  return (
    <div className="w-full max-w-md rounded-2xl glass-panel p-5 text-white shadow-2xl flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span className="text-base font-semibold tracking-tight">Ambient Environment</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Background Presets Grid */}
      <div className="my-4 space-y-2 overflow-y-auto max-h-[40vh] pr-1">
        <span className="text-xs text-white/50 font-medium">Select Scene</span>
        <div className="grid grid-cols-2 gap-2.5">
          {BACKGROUND_PRESETS.map((preset) => {
            const isSelected = preferences.backgroundId === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => onUpdatePreferences({ backgroundId: preset.id })}
                className={`relative group h-24 rounded-xl overflow-hidden border text-left transition-all p-2 flex flex-col justify-end ${
                  isSelected
                    ? 'ring-2 ring-amber-400 border-white/40 shadow-lg scale-[1.02]'
                    : 'border-white/10 hover:border-white/25 opacity-80 hover:opacity-100'
                }`}
              >
                {/* Visual Preview */}
                {preset.type === 'image' ? (
                  <img
                    src={preset.value}
                    alt={preset.name}
                    referrerPolicy="no-referrer"
                    className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                ) : (
                  <div
                    className="absolute inset-0 w-full h-full"
                    style={{ background: preset.value }}
                  />
                )}

                {/* Dark overlay for label readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

                {/* Label */}
                <span className="relative z-10 text-xs font-semibold text-white drop-shadow truncate">
                  {preset.name}
                </span>
                <span className="relative z-10 text-[9px] text-white/70">
                  {preset.type === 'image' ? 'Cinematic Scene' : 'Gradient Mesh'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Ambient Adjustment Controls */}
      <div className="space-y-4 pt-3 border-t border-white/10">
        <div className="flex items-center gap-2 text-xs text-white/60 font-medium">
          <Sliders className="w-3.5 h-3.5" />
          <span>Atmosphere Adjustments</span>
        </div>

        {/* Blur Slider */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-white/70">Background Blur</span>
            <span className="font-mono text-white/50">{preferences.backgroundBlur}px</span>
          </div>
          <input
            type="range"
            min="0"
            max="16"
            step="1"
            value={preferences.backgroundBlur}
            onChange={(e) => onUpdatePreferences({ backgroundBlur: parseInt(e.target.value) })}
            className="w-full accent-amber-400 cursor-pointer h-1.5 bg-white/20 rounded-lg"
          />
        </div>

        {/* Darkness Overlay Slider */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-white/70">Dimming Overlay</span>
            <span className="font-mono text-white/50">{preferences.overlayDarkness}%</span>
          </div>
          <input
            type="range"
            min="10"
            max="80"
            step="5"
            value={preferences.overlayDarkness}
            onChange={(e) => onUpdatePreferences({ overlayDarkness: parseInt(e.target.value) })}
            className="w-full accent-amber-400 cursor-pointer h-1.5 bg-white/20 rounded-lg"
          />
        </div>
      </div>
    </div>
  );
};
