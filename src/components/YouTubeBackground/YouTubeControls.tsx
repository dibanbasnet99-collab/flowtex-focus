import React, { useState } from 'react';
import { Youtube, Volume2, VolumeX, Play, Pause, Eye, EyeOff, Check, Sparkles, X } from 'lucide-react';
import { YOUTUBE_PRESETS, extractYouTubeVideoId } from '../../utils/youtube';

interface YouTubeControlsProps {
  videoId: string;
  isEnabled: boolean;
  volume: number;
  isMuted: boolean;
  isPlaying: boolean;
  showVideo: boolean;
  onToggleEnabled: (enabled: boolean) => void;
  onUpdateVideoId: (id: string) => void;
  onUpdateVolume: (vol: number) => void;
  onToggleMute: () => void;
  onTogglePlay: () => void;
  onToggleShowVideo: () => void;
  onClose: () => void;
}

export const YouTubeControls: React.FC<YouTubeControlsProps> = ({
  videoId,
  isEnabled,
  volume,
  isMuted,
  isPlaying,
  showVideo,
  onToggleEnabled,
  onUpdateVideoId,
  onUpdateVolume,
  onToggleMute,
  onTogglePlay,
  onToggleShowVideo,
  onClose,
}) => {
  const [customInput, setCustomInput] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);

  const handleApplyCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInput.trim()) return;

    const extracted = extractYouTubeVideoId(customInput);
    if (extracted) {
      onUpdateVideoId(extracted);
      if (!isEnabled) onToggleEnabled(true);
      setCustomInput('');
      setInputError(null);
    } else {
      setInputError('Could not find a valid YouTube video ID from this URL.');
    }
  };

  const handleSelectPreset = (pId: string) => {
    onUpdateVideoId(pId);
    if (!isEnabled) onToggleEnabled(true);
  };

  return (
    <div className="w-full max-w-md rounded-2xl glass-panel p-5 text-white shadow-2xl flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-rose-600/30 text-rose-400 border border-rose-500/30">
            <Youtube className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-semibold tracking-tight">YouTube Ambient Stream</h3>
            <p className="text-[11px] text-white/50">Play video & sound in background</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Main Enable / Status Bar */}
      <div className="flex items-center justify-between my-3 p-3 rounded-xl bg-white/5 border border-white/10">
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-white">YouTube Stream</span>
          <span className="text-[11px] text-white/50">
            {isEnabled ? (isPlaying ? 'Streaming audio & video' : 'Paused') : 'Inactive'}
          </span>
        </div>

        <button
          onClick={() => onToggleEnabled(!isEnabled)}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            isEnabled
              ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-md'
              : 'bg-white/10 hover:bg-white/20 text-white/70'
          }`}
        >
          {isEnabled ? 'Active' : 'Turn On'}
        </button>
      </div>

      {isEnabled && (
        <div className="space-y-3.5 pb-2">
          {/* Audio & Playback Controls Bar */}
          <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              {/* Play / Pause */}
              <button
                onClick={onTogglePlay}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white text-xs font-medium transition-colors"
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-3.5 h-3.5 fill-current" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    Play
                  </>
                )}
              </button>

              {/* Show/Hide Video in Background */}
              <button
                onClick={onToggleShowVideo}
                title={showVideo ? 'Video visible as canvas' : 'Audio only (video hidden)'}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  showVideo
                    ? 'bg-amber-400/20 border-amber-400/40 text-amber-300'
                    : 'bg-white/5 border-white/10 text-white/50 hover:text-white'
                }`}
              >
                {showVideo ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span>{showVideo ? 'Video Canvas: On' : 'Audio Only'}</span>
              </button>
            </div>

            {/* Volume Slider */}
            <div className="flex items-center gap-2.5 pt-1">
              <button
                onClick={onToggleMute}
                className="text-white/60 hover:text-white transition-colors"
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
              </button>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={isMuted ? 0 : volume}
                onChange={(e) => onUpdateVolume(parseInt(e.target.value))}
                className="w-full accent-rose-400 cursor-pointer h-1.5 bg-white/20 rounded-lg"
              />
              <span className="text-[11px] font-mono text-white/50 w-8 text-right">
                {isMuted ? '0%' : `${volume}%`}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Custom URL Input Form */}
      <form onSubmit={handleApplyCustom} className="my-2">
        <label className="block text-xs font-medium text-white/70 mb-1">
          Paste Custom YouTube Link or Video ID
        </label>
        <div className="flex items-center gap-1.5">
          <input
            type="text"
            placeholder="e.g. https://youtu.be/... or video ID"
            value={customInput}
            onChange={(e) => {
              setCustomInput(e.target.value);
              setInputError(null);
            }}
            className="flex-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-white/30 focus:outline-none focus:border-rose-400"
          />
          <button
            type="submit"
            className="px-3 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white font-medium text-xs transition-colors"
          >
            Load
          </button>
        </div>
        {inputError && (
          <p className="text-[11px] text-rose-300 mt-1">{inputError}</p>
        )}
      </form>

      {/* Curated Focus Presets */}
      <div className="space-y-1.5 pt-2">
        <span className="text-xs font-medium text-white/60">Curated Focus Streams</span>
        <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
          {YOUTUBE_PRESETS.map((p) => {
            const isSelected = videoId === p.videoId;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => handleSelectPreset(p.videoId)}
                className={`w-full flex items-center justify-between p-2 rounded-xl border text-left transition-all text-xs ${
                  isSelected && isEnabled
                    ? 'bg-rose-500/20 border-rose-500/40 text-rose-200'
                    : 'bg-white/5 border-white/5 hover:bg-white/10 text-white/80'
                }`}
              >
                <div className="truncate pr-2">
                  <div className="font-medium truncate">{p.title}</div>
                  <div className="text-[10px] text-white/40">{p.category}</div>
                </div>
                {isSelected && isEnabled && (
                  <Check className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
