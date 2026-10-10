import React from 'react';
import { X, Cloud, LogOut, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../../firebase/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  habitsCount: number;
  tasksCount: number;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  habitsCount,
  tasksCount,
}) => {
  const { user, signInWithGoogle, signOutUser, loading, error, clearError } = useAuth();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl glass-panel p-6 text-white shadow-2xl border border-white/15">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center justify-center shadow">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight">Cloud Sync & Account</h3>
              <p className="text-[11px] text-white/50">Firebase Authentication & Firestore</p>
            </div>
          </div>
          <button
            onClick={() => {
              clearError();
              onClose();
            }}
            className="p-1 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="my-3 p-3 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-200 text-xs flex items-center justify-between">
            <span>{error}</span>
            <button onClick={clearError} className="text-rose-300 hover:text-white">✕</button>
          </div>
        )}

        {user ? (
          /* Signed In State */
          <div className="space-y-5 pt-4">
            <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-white/5 border border-white/10">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  referrerPolicy="no-referrer"
                  className="w-12 h-12 rounded-xl object-cover ring-2 ring-amber-400/40"
                />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-amber-400 text-stone-950 font-bold flex items-center justify-center text-lg">
                  {user.displayName ? user.displayName[0].toUpperCase() : 'U'}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-bold text-white truncate">
                  {user.displayName || 'Focus User'}
                </h4>
                <p className="text-xs text-white/60 truncate">{user.email}</p>
                <div className="flex items-center gap-1.5 mt-1 text-[11px] text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Records securely backed up</span>
                </div>
              </div>
            </div>

            {/* Cloud Storage Stats */}
            <div className="grid grid-cols-2 gap-2 text-center text-xs">
              <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                <span className="text-white/40 block text-[10px]">Cloud Habits</span>
                <span className="text-lg font-bold font-mono text-white">{habitsCount}</span>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                <span className="text-white/40 block text-[10px]">Cloud Tasks</span>
                <span className="text-lg font-bold font-mono text-white">{tasksCount}</span>
              </div>
            </div>

            {/* Security Assurance */}
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-200/90 text-[11px] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>Zero-trust Attribute-Based Access Control rules protect your records.</span>
            </div>

            <button
              onClick={() => {
                signOutUser();
                onClose();
              }}
              className="w-full py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-semibold text-xs flex items-center justify-center gap-2 border border-rose-500/30 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out of Flowtex
            </button>
          </div>
        ) : (
          /* Logged Out State */
          <div className="space-y-5 pt-4 text-center">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <Sparkles className="w-6 h-6 text-amber-300 mx-auto" />
              <h4 className="text-sm font-bold text-white">Save & Sync Across Devices</h4>
              <p className="text-xs text-white/60 leading-relaxed">
                Connect your account to automatically sync your Pomodoro streaks, Habitex consistency calendar, and focus tasks securely in the cloud.
              </p>
            </div>

            {/* Google Sign In Button */}
            <button
              onClick={() => signInWithGoogle()}
              disabled={loading}
              className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-stone-100 text-stone-900 font-bold text-xs flex items-center justify-center gap-3 shadow-xl transition-all active:scale-95"
            >
              {/* Google Colorful Logo SVG */}
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google / Gmail</span>
            </button>

            {/* Facebook / OAuth Provider Note */}
            <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-[11px] text-white/50 text-left">
              <span className="font-semibold text-white/80 block mb-0.5">ℹ️ Authentication Provider Note</span>
              Google Authentication is active and provisioned for this workspace. To enable Facebook Login in production, configure the Facebook App ID in the Firebase Console Auth Providers tab.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
