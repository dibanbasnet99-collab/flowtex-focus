import React, { useState, useEffect } from 'react';
import { X, Plus, Minus, Trash2, Check } from 'lucide-react';
import { Habit } from '../../types';
import { HABIT_COLORS, HABIT_EMOJIS } from '../../utils/storage';

interface HabitModalProps {
  habit?: Habit | null; // null if creating new
  isOpen: boolean;
  onClose: () => void;
  onSave: (habitData: Omit<Habit, 'id' | 'completions' | 'createdAt'> & { id?: string }) => void;
  onDelete?: (id: string) => void;
}

const DEFAULT_CATEGORIES = ['Health', 'Work', 'Mindset', 'Fitness', 'Learning', 'Personal'];
const DAYS_OF_WEEK = [
  { label: 'M', full: 'Mon', index: 1 },
  { label: 'T', full: 'Tue', index: 2 },
  { label: 'W', full: 'Wed', index: 3 },
  { label: 'T', full: 'Thu', index: 4 },
  { label: 'F', full: 'Fri', index: 5 },
  { label: 'S', full: 'Sat', index: 6 },
  { label: 'S', full: 'Sun', index: 0 },
];

export const HabitModal: React.FC<HabitModalProps> = ({
  habit,
  isOpen,
  onClose,
  onSave,
  onDelete,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(HABIT_COLORS[5]); // Default Emerald
  const [emoji, setEmoji] = useState('🧘');
  const [category, setCategory] = useState('Mindset');
  const [targetPerDay, setTargetPerDay] = useState(1);
  const [frequencyDays, setFrequencyDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);
  const [reminderTime, setReminderTime] = useState('08:00');
  const [streakType, setStreakType] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  useEffect(() => {
    if (habit) {
      setTitle(habit.title);
      setDescription(habit.description || '');
      setColor(habit.color || HABIT_COLORS[0]);
      setEmoji(habit.emoji || '✨');
      setCategory(habit.category || 'Personal');
      setTargetPerDay(habit.targetPerDay || 1);
      setFrequencyDays(habit.frequencyDays || [0, 1, 2, 3, 4, 5, 6]);
      setReminderTime(habit.reminderTime || '08:00');
      setStreakType(habit.streakType || 'daily');
    } else {
      // Reset form
      setTitle('');
      setDescription('');
      setColor(HABIT_COLORS[Math.floor(Math.random() * HABIT_COLORS.length)]);
      setEmoji(HABIT_EMOJIS[Math.floor(Math.random() * HABIT_EMOJIS.length)]);
      setCategory('Health');
      setTargetPerDay(1);
      setFrequencyDays([0, 1, 2, 3, 4, 5, 6]);
      setReminderTime('08:00');
      setStreakType('daily');
    }
  }, [habit, isOpen]);

  if (!isOpen) return null;

  const toggleDay = (idx: number) => {
    if (frequencyDays.includes(idx)) {
      if (frequencyDays.length === 1) return; // Keep at least one day
      setFrequencyDays(frequencyDays.filter((d) => d !== idx));
    } else {
      setFrequencyDays([...frequencyDays, idx].sort());
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      id: habit?.id,
      title: title.trim(),
      description: description.trim(),
      color,
      emoji,
      category,
      targetPerDay,
      frequencyDays,
      reminderTime,
      streakType,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl glass-panel p-6 text-white shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-md border border-white/20"
              style={{ backgroundColor: `${color}33`, borderColor: color }}
            >
              {emoji}
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight">
                {habit ? 'Edit Habit' : 'Create New Habit'}
              </h2>
              <p className="text-xs text-white/50">Flowtex Habits & Rituals</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 pt-4">
          {/* Title & Description */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-white/70 mb-1">Habit Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Read 20 pages, Hydrate, Workout..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-white/70 mb-1">Description / Intent</label>
              <input
                type="text"
                placeholder="e.g. Mindful reading before sleep..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 text-xs focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all"
              />
            </div>
          </div>

          {/* Color Palette (16 Vibrant Circles) */}
          <div>
            <label className="block text-xs font-medium text-white/70 mb-2">Color Accent</label>
            <div className="grid grid-cols-8 gap-2">
              {HABIT_COLORS.map((c) => {
                const isSelected = color === c;
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`h-7 w-7 rounded-full transition-all flex items-center justify-center ${
                      isSelected ? 'ring-2 ring-white scale-110 shadow-lg' : 'opacity-80 hover:opacity-100 hover:scale-105'
                    }`}
                    style={{ backgroundColor: c }}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 text-white drop-shadow stroke-[3]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Emoji Selector */}
          <div>
            <label className="block text-xs font-medium text-white/70 mb-2">Emoji Identifier</label>
            <div className="grid grid-cols-8 gap-2 p-2 rounded-xl bg-white/5 border border-white/5 max-h-32 overflow-y-auto">
              {HABIT_EMOJIS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setEmoji(e)}
                  className={`text-lg p-1.5 rounded-lg transition-transform ${
                    emoji === e ? 'bg-white/20 scale-110 shadow' : 'hover:bg-white/10'
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* Category Tag Input */}
          <div>
            <label className="block text-xs font-medium text-white/70 mb-2">Category</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {DEFAULT_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                    category === cat
                      ? 'bg-amber-400/20 text-amber-300 border border-amber-400/50'
                      : 'bg-white/5 text-white/60 hover:text-white border border-white/5'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <input
              type="text"
              placeholder="Or custom category name..."
              value={DEFAULT_CATEGORIES.includes(category) ? '' : category}
              onChange={(e) => setCategory(e.target.value || 'Personal')}
              className="w-full px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 text-xs focus:outline-none"
            />
          </div>

          {/* Target Counter (Completions per day with + and -) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
              <label className="block text-xs font-medium text-white/70 mb-2">Target Per Day</label>
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setTargetPerDay((p) => Math.max(1, p - 1))}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <div className="text-center font-mono">
                  <span className="text-xl font-bold text-white">{targetPerDay}</span>
                  <span className="text-[11px] text-white/50 block">times / day</span>
                </div>
                <button
                  type="button"
                  onClick={() => setTargetPerDay((p) => Math.min(20, p + 1))}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Streak Tracking Mode */}
            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
              <label className="block text-xs font-medium text-white/70 mb-2">Tracking Cadence</label>
              <div className="grid grid-cols-3 gap-1">
                {(['daily', 'weekly', 'monthly'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setStreakType(mode)}
                    className={`py-2 rounded-lg text-xs font-medium capitalize transition-all ${
                      streakType === mode
                        ? 'bg-white/20 text-white shadow border border-white/20'
                        : 'text-white/50 hover:text-white'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Frequency & Reminder Days */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-white/70">Frequency (Repeat on)</label>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-white/50">Reminder:</span>
                <input
                  type="time"
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                  className="bg-white/10 text-white text-xs px-2 py-0.5 rounded border border-white/10 focus:outline-none"
                />
              </div>
            </div>
            <div className="flex items-center justify-between gap-1">
              {DAYS_OF_WEEK.map((day) => {
                const isActive = frequencyDays.includes(day.index);
                return (
                  <button
                    key={day.full}
                    type="button"
                    onClick={() => toggleDay(day.index)}
                    className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-amber-400 text-stone-950 font-bold shadow-md scale-100'
                        : 'bg-white/5 text-white/40 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {day.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            {habit && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  if (confirm('Delete this habit and all its logged history?')) {
                    onDelete(habit.id);
                    onClose();
                  }
                }}
                className="px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-500/20 text-xs font-medium flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-white/60 hover:text-white text-xs font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-bold shadow-lg transition-all"
              >
                {habit ? 'Save Changes' : 'Create Habit'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
