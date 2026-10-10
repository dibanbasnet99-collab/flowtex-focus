import React, { useRef, useState } from 'react';
import { Download, Upload, RotateCcw, Check, AlertCircle } from 'lucide-react';
import { Habit, UserPreferences } from '../../types';
import { getInitialHabits, getInitialTasks, DEFAULT_PREFERENCES } from '../../utils/storage';

interface HabitSettingsProps {
  habits: Habit[];
  preferences: UserPreferences;
  onUpdatePreferences: (updated: Partial<UserPreferences>) => void;
  onImportHabits: (imported: Habit[]) => void;
  onResetDemoData: () => void;
}

export const HabitSettings: React.FC<HabitSettingsProps> = ({
  habits,
  preferences,
  onUpdatePreferences,
  onImportHabits,
  onResetDemoData,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  // Export JSON
  const handleExport = () => {
    const exportPayload = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      habits,
      preferences,
    };
    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `flowtex_backup_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Import JSON
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed.habits)) {
          onImportHabits(parsed.habits);
          if (parsed.preferences) {
            onUpdatePreferences(parsed.preferences);
          }
          setImportStatus(`Successfully imported ${parsed.habits.length} habits!`);
        } else if (Array.isArray(parsed)) {
          onImportHabits(parsed);
          setImportStatus(`Successfully imported ${parsed.length} habits!`);
        } else {
          setImportStatus('Invalid JSON backup file structure.');
        }
      } catch {
        setImportStatus('Failed to parse backup JSON file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto py-2">
      {/* Display & Sorting Preferences */}
      <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4">
        <h4 className="text-sm font-semibold text-white tracking-tight">
          Display & Arrangement
        </h4>

        <div>
          <label className="block text-xs text-white/60 mb-2">Habit Sort Order</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'custom', label: 'Default' },
              { id: 'streak', label: 'By Streak' },
              { id: 'name', label: 'Alphabetical' },
              { id: 'category', label: 'By Category' },
            ].map((sort) => (
              <button
                key={sort.id}
                onClick={() => onUpdatePreferences({ habitSortOrder: sort.id as any })}
                className={`py-2 px-3 rounded-xl text-xs font-medium transition-all ${
                  preferences.habitSortOrder === sort.id
                    ? 'bg-amber-400 text-stone-950 font-bold shadow'
                    : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                {sort.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Focus Timer Preferences */}
      <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4">
        <h4 className="text-sm font-semibold text-white tracking-tight">
          Focus Session Intervals
        </h4>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs text-white/60 mb-1">Focus (min)</label>
            <input
              type="number"
              min="1"
              max="90"
              value={preferences.focusDuration}
              onChange={(e) => onUpdatePreferences({ focusDuration: parseInt(e.target.value) || 25 })}
              className="w-full bg-white/10 border border-white/10 rounded-xl px-3 py-2 text-sm text-white font-mono"
            />
          </div>
          <div>
            <label className="block text-xs text-white/60 mb-1">Short Break (min)</label>
            <input
              type="number"
              min="1"
              max="30"
              value={preferences.shortBreakDuration}
              onChange={(e) => onUpdatePreferences({ shortBreakDuration: parseInt(e.target.value) || 5 })}
              className="w-full bg-white/10 border border-white/10 rounded-xl px-3 py-2 text-sm text-white font-mono"
            />
          </div>
          <div>
            <label className="block text-xs text-white/60 mb-1">Long Break (min)</label>
            <input
              type="number"
              min="1"
              max="60"
              value={preferences.longBreakDuration}
              onChange={(e) => onUpdatePreferences({ longBreakDuration: parseInt(e.target.value) || 15 })}
              className="w-full bg-white/10 border border-white/10 rounded-xl px-3 py-2 text-sm text-white font-mono"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
          <span className="text-white/70">Auto-start Breaks</span>
          <button
            onClick={() => onUpdatePreferences({ autoStartBreaks: !preferences.autoStartBreaks })}
            className={`w-11 h-6 rounded-full transition-colors relative ${
              preferences.autoStartBreaks ? 'bg-amber-400' : 'bg-white/20'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-stone-900 transition-transform absolute top-1 ${
                preferences.autoStartBreaks ? 'left-6' : 'left-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Data Backup & Migration */}
      <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4">
        <h4 className="text-sm font-semibold text-white tracking-tight">
          Data Backup & Transfer
        </h4>
        <p className="text-xs text-white/50">
          All your check-ins and habits are stored safely in local browser storage. Export a JSON file to transfer between devices.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleExport}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium text-xs flex items-center gap-2 transition-colors border border-white/10"
          >
            <Download className="w-4 h-4 text-amber-300" />
            Export Data (JSON)
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium text-xs flex items-center gap-2 transition-colors border border-white/10"
          >
            <Upload className="w-4 h-4 text-sky-300" />
            Import Backup (JSON)
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {importStatus && (
          <div className="p-3 rounded-xl bg-white/10 border border-white/20 text-xs text-white/90 flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{importStatus}</span>
          </div>
        )}
      </div>

      {/* Danger Zone / Demo Reset */}
      <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/20 space-y-3">
        <h4 className="text-sm font-semibold text-rose-300 tracking-tight flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          Reset Demo Habits
        </h4>
        <p className="text-xs text-rose-200/70">
          Restore initial habits, historical check-in data, and sample focus tasks.
        </p>
        <button
          onClick={() => {
            if (confirm('Are you sure you want to reset all habits and reload sample data?')) {
              onResetDemoData();
            }
          }}
          className="px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 text-xs font-semibold border border-rose-500/30 transition-colors flex items-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset to Sample Data
        </button>
      </div>
    </div>
  );
};
