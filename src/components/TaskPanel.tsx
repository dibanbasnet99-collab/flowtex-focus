import React, { useState } from 'react';
import { Check, Trash2, Plus, Minus, Target, X, CheckCircle2, Circle } from 'lucide-react';
import { Task } from '../types';

interface TaskPanelProps {
  tasks: Task[];
  activeTaskId?: string;
  onAddTask: (task: Omit<Task, 'id' | 'completed' | 'completedSessions'>) => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onSelectActiveTask: (task: Task) => void;
  onUpdateTaskRounds?: (taskId: string, delta: number) => void;
  onClose: () => void;
}

export const TaskPanel: React.FC<TaskPanelProps> = ({
  tasks,
  activeTaskId,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onSelectActiveTask,
  onUpdateTaskRounds,
  onClose,
}) => {
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [newEstimatedSessions, setNewEstimatedSessions] = useState(2);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onAddTask({
      title: newTitle.trim(),
      priority: newPriority,
      estimatedSessions: newEstimatedSessions,
    });
    setNewTitle('');
    setNewEstimatedSessions(2);
  };

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'active') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <div className="w-full max-w-md rounded-2xl glass-panel p-5 text-white shadow-2xl flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="text-base font-semibold tracking-tight">Focus Tasks</span>
          <span className="text-xs text-white/50 px-2 py-0.5 rounded-full bg-white/10">
            {completedCount}/{tasks.length} done
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 my-3 p-1 rounded-xl bg-black/30 border border-white/5 text-xs">
        <button
          onClick={() => setFilter('all')}
          className={`flex-1 py-1 rounded-lg font-medium transition-all ${
            filter === 'all' ? 'bg-white/15 text-white shadow' : 'text-white/60 hover:text-white'
          }`}
        >
          All ({tasks.length})
        </button>
        <button
          onClick={() => setFilter('active')}
          className={`flex-1 py-1 rounded-lg font-medium transition-all ${
            filter === 'active' ? 'bg-white/15 text-white shadow' : 'text-white/60 hover:text-white'
          }`}
        >
          Active ({tasks.length - completedCount})
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`flex-1 py-1 rounded-lg font-medium transition-all ${
            filter === 'completed' ? 'bg-white/15 text-white shadow' : 'text-white/60 hover:text-white'
          }`}
        >
          Done ({completedCount})
        </button>
      </div>

      {/* Task Input Form */}
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="flex flex-col gap-2 p-2.5 rounded-xl bg-white/5 border border-white/10">
          <input
            type="text"
            placeholder="Add a high-priority task..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="w-full bg-transparent text-sm text-white placeholder-white/40 focus:outline-none px-1"
          />

          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/10 text-xs">
            {/* Priority Selector */}
            <div className="flex items-center gap-1">
              <span className="text-[11px] text-white/40 mr-1">Priority:</span>
              {(['low', 'medium', 'high'] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setNewPriority(p)}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium capitalize transition-all ${
                    newPriority === p
                      ? p === 'high'
                        ? 'bg-rose-500/30 text-rose-300 border border-rose-500/40 font-semibold'
                        : p === 'medium'
                        ? 'bg-amber-500/30 text-amber-300 border border-amber-500/40 font-semibold'
                        : 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-semibold'
                      : 'text-white/40 hover:text-white/70'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Rounds Selector with Stepper Buttons */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-black/40 rounded-lg p-0.5 border border-white/10">
                <button
                  type="button"
                  onClick={() => setNewEstimatedSessions((s) => Math.max(1, s - 1))}
                  className="w-5 h-5 flex items-center justify-center hover:bg-white/20 rounded text-white/70 hover:text-white transition-colors"
                  title="Decrease rounds"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="font-mono text-xs px-1 text-amber-300 font-bold min-w-[16px] text-center">
                  {newEstimatedSessions}
                </span>
                <span className="text-[10px] text-white/40 pr-1">rounds</span>
                <button
                  type="button"
                  onClick={() => setNewEstimatedSessions((s) => Math.min(20, s + 1))}
                  className="w-5 h-5 flex items-center justify-center hover:bg-white/20 rounded text-white/70 hover:text-white transition-colors"
                  title="Increase rounds"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>

              <button
                type="submit"
                disabled={!newTitle.trim()}
                className="px-2.5 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 disabled:opacity-40 text-stone-950 font-bold text-xs flex items-center gap-1 transition-all shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                Add
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Task List */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[160px]">
        {filteredTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center text-white/40 text-xs">
            <CheckCircle2 className="w-8 h-8 mb-2 opacity-30" />
            <p>No tasks here. Add one above to start focusing!</p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isSelected = activeTaskId === task.id;
            return (
              <div
                key={task.id}
                className={`group flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                  isSelected
                    ? 'bg-amber-400/10 border-amber-400/60 shadow-md ring-1 ring-amber-400/30'
                    : 'bg-white/5 border-white/5 hover:bg-white/10'
                }`}
              >
                {/* Left check and title */}
                <div className="flex items-center gap-2.5 flex-1 min-w-0 mr-2">
                  <button
                    onClick={() => onToggleTask(task.id)}
                    className="text-white/50 hover:text-white transition-colors shrink-0"
                  >
                    {task.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 fill-emerald-400/20" />
                    ) : (
                      <Circle className="w-4 h-4" />
                    )}
                  </button>

                  <span
                    className={`text-xs truncate transition-all ${
                      task.completed
                        ? 'line-through text-white/40'
                        : 'text-white/90 font-medium'
                    }`}
                  >
                    {task.title}
                  </span>
                </div>

                {/* Right metadata and actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {/* Priority indicator */}
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded capitalize ${
                      task.priority === 'high'
                        ? 'bg-rose-500/20 text-rose-300'
                        : task.priority === 'medium'
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-emerald-500/20 text-emerald-300'
                    }`}
                  >
                    {task.priority}
                  </span>

                  {/* Interactive Rounds Stepper on existing task */}
                  {onUpdateTaskRounds ? (
                    <div className="flex items-center gap-0.5 bg-black/40 rounded-lg px-1.5 py-0.5 border border-white/10 text-[11px] font-mono">
                      <button
                        type="button"
                        onClick={() => onUpdateTaskRounds(task.id, -1)}
                        disabled={task.estimatedSessions <= 1}
                        className="text-white/40 hover:text-white disabled:opacity-20 p-0.5 transition-colors"
                        title="Decrease target rounds"
                      >
                        <Minus className="w-2.5 h-2.5" />
                      </button>
                      <span className="text-white/80 px-1 font-medium">
                        {task.completedSessions}/{task.estimatedSessions}
                      </span>
                      <button
                        type="button"
                        onClick={() => onUpdateTaskRounds(task.id, 1)}
                        className="text-white/40 hover:text-white p-0.5 transition-colors"
                        title="Increase target rounds"
                      >
                        <Plus className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  ) : (
                    <span className="text-[10px] text-white/40 font-mono">
                      {task.completedSessions}/{task.estimatedSessions}
                    </span>
                  )}

                  {/* Focus on this button */}
                  {!task.completed && (
                    <button
                      onClick={() => onSelectActiveTask(task)}
                      title={isSelected ? 'Currently focused with clock' : 'Focus on this task with clock'}
                      className={`p-1.5 rounded-lg transition-all text-xs flex items-center gap-1 ${
                        isSelected
                          ? 'text-amber-300 bg-amber-400/20 font-bold border border-amber-400/40'
                          : 'text-white/50 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <Target className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline text-[10px]">{isSelected ? 'Active' : 'Focus'}</span>
                    </button>
                  )}

                  {/* Delete button */}
                  <button
                    onClick={() => onDeleteTask(task.id)}
                    title="Delete task"
                    className="p-1 rounded text-white/30 hover:text-rose-400 opacity-60 group-hover:opacity-100 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
