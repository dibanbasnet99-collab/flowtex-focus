import React, { useState } from 'react';
import { Volume2, VolumeX, CloudRain, Trees, Coffee, Waves, Flame, Zap, X } from 'lucide-react';
import { AmbientTrack } from '../types';
import { soundEngine } from '../utils/audioEngine';

interface AmbientAudioProps {
  tracks: AmbientTrack[];
  onToggleTrack: (trackId: AmbientTrack['id']) => void;
  onUpdateTrackVolume: (trackId: AmbientTrack['id'], volume: number) => void;
  masterVolume: number;
  onUpdateMasterVolume: (vol: number) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onClose: () => void;
}

export const AmbientAudio: React.FC<AmbientAudioProps> = ({
  tracks,
  onToggleTrack,
  onUpdateTrackVolume,
  masterVolume,
  onUpdateMasterVolume,
  isMuted,
  onToggleMute,
  onClose,
}) => {
  const getIcon = (id: AmbientTrack['id']) => {
    switch (id) {
      case 'rain': return <CloudRain className="w-4 h-4" />;
      case 'forest': return <Trees className="w-4 h-4" />;
      case 'cafe': return <Coffee className="w-4 h-4" />;
      case 'ocean': return <Waves className="w-4 h-4" />;
      case 'campfire': return <Flame className="w-4 h-4" />;
      case 'binaural': return <Zap className="w-4 h-4" />;
    }
  };

  const activeCount = tracks.filter((t) => t.isPlaying).length;

  return (
    <div className="w-full max-w-sm rounded-2xl glass-panel p-5 text-white shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="text-base font-semibold tracking-tight">Ambient Soundscapes</span>
          {activeCount > 0 && (
            <span className="text-[11px] text-emerald-300 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30">
              {activeCount} active
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Master Volume Bar */}
      <div className="flex items-center gap-3 my-4 p-2.5 rounded-xl bg-white/5 border border-white/10">
        <button
          onClick={onToggleMute}
          title={isMuted ? 'Unmute master' : 'Mute master'}
          className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
        </button>
        <div className="flex-1 flex flex-col gap-1">
          <div className="flex items-center justify-between text-[11px] text-white/60">
            <span>Master Volume</span>
            <span className="font-mono">{Math.round(masterVolume * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={masterVolume}
            onChange={(e) => onUpdateMasterVolume(parseFloat(e.target.value))}
            className="w-full accent-amber-400 cursor-pointer h-1.5 bg-white/20 rounded-lg"
          />
        </div>
      </div>

      {/* Tracks List */}
      <div className="space-y-2.5 overflow-y-auto max-h-[50vh] pr-1">
        {tracks.map((track) => {
          return (
            <div
              key={track.id}
              className={`p-2.5 rounded-xl border transition-all ${
                track.isPlaying
                  ? 'bg-white/10 border-white/20 shadow-md'
                  : 'bg-white/5 border-white/5 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center justify-between">
                <button
                  onClick={() => onToggleTrack(track.id)}
                  className="flex items-center gap-2.5 flex-1 text-left"
                >
                  <div
                    className={`p-2 rounded-lg transition-colors ${
                      track.isPlaying
                        ? 'bg-amber-400 text-stone-950 shadow-sm'
                        : 'bg-white/10 text-white/60'
                    }`}
                  >
                    {getIcon(track.id)}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-white">{track.name}</span>
                    <span className="text-[10px] text-white/40">
                      {track.isPlaying ? 'Playing' : 'Tap to start'}
                    </span>
                  </div>
                </button>

                {/* Individual Track Volume */}
                {track.isPlaying && (
                  <div className="flex items-center gap-2 w-28">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.02"
                      value={track.volume}
                      onChange={(e) => onUpdateTrackVolume(track.id, parseFloat(e.target.value))}
                      className="w-full accent-amber-400 cursor-pointer h-1 bg-white/20 rounded-lg"
                    />
                    <span className="text-[10px] font-mono text-white/50 w-7 text-right">
                      {Math.round(track.volume * 100)}%
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="pt-3 mt-2 border-t border-white/10 text-center">
        <p className="text-[10px] text-white/40">
          Synthesized in real-time via Web Audio API · Zero external streaming
        </p>
      </div>
    </div>
  );
};
