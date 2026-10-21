import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  User,
  LogOut,
  Sparkles,
  Check
} from 'lucide-react';
import { LEARNER_LEVELS } from '../../topics';
import { LearnerLevel, UserProfile } from '../../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onSignInWithGoogle: (name?: string, email?: string) => Promise<void>;
  onContinueAsGuest: (preferredLevel: LearnerLevel) => void;
  onSignOut: () => Promise<void>;
  onLevelChange: (level: LearnerLevel) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSignInWithGoogle,
  onContinueAsGuest,
  onSignOut,
  onLevelChange
}) => {
  const [customName, setCustomName] = useState(currentUser.displayName || '');
  const [customEmail, setCustomEmail] = useState(currentUser.email || '');
  const [selectedLevel, setSelectedLevel] = useState<LearnerLevel>(currentUser.preferredLevel || 'student');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    try {
      await onSignInWithGoogle(customName, customEmail);
      onLevelChange(selectedLevel);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGuestContinue = () => {
    onContinueAsGuest(selectedLevel);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog Card */}
      <div className="relative bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden z-10">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">
                {currentUser.isGuest ? 'Sign In or Guest Profile' : 'Student Account'}
              </h3>
              <p className="text-xs text-slate-500">
                {currentUser.isGuest ? 'Choose how you want to save your lessons' : currentUser.email}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Preferred Level Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Preferred Learning Level
            </label>
            <div className="grid grid-cols-1 gap-2">
              {LEARNER_LEVELS.map(lvl => (
                <button
                  key={lvl.id}
                  type="button"
                  onClick={() => {
                    setSelectedLevel(lvl.id);
                    onLevelChange(lvl.id);
                  }}
                  className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                    selectedLevel === lvl.id
                      ? 'border-slate-900 bg-slate-900 text-white shadow-sm'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div>
                    <span className="text-xs font-bold block">{lvl.label} ({lvl.ageRange})</span>
                    <span className={`text-[11px] block mt-0.5 ${selectedLevel === lvl.id ? 'text-slate-300' : 'text-slate-500'}`}>
                      {lvl.description}
                    </span>
                  </div>
                  {selectedLevel === lvl.id && (
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 ml-2" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* If already logged in */}
          {!currentUser.isGuest ? (
            <div className="space-y-3 pt-2">
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                <div className="text-xs">
                  <p className="font-bold text-emerald-900">Signed in as {currentUser.displayName}</p>
                  <p className="text-emerald-700">{currentUser.email}</p>
                  <p className="text-emerald-600 mt-1">Your lessons, diagram states, and whiteboard drawings are synced.</p>
                </div>
              </div>

              <button
                type="button"
                onClick={async () => {
                  await onSignOut();
                  onClose();
                }}
                className="w-full py-2.5 px-4 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            /* If guest, show options to sign in or continue as guest */
            <div className="space-y-3 pt-2">
              {/* Sign in with Google Button */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isSubmitting}
                className="w-full py-3 px-4 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 rounded-xl text-xs font-bold flex items-center justify-center gap-3 shadow-sm transition-all hover:border-slate-400 active:scale-95"
              >
                {/* Google SVG Logo */}
                <svg className="w-4 h-4" viewBox="0 0 24 24">
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
                <span>Sign in with Google</span>
              </button>

              {/* Continue as Guest Button */}
              <button
                type="button"
                onClick={handleGuestContinue}
                className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <span>Continue as Guest</span>
              </button>

              <p className="text-[11px] text-slate-500 text-center">
                Guest learning history and whiteboard drawings are safely kept in your browser.
              </p>
            </div>
          )}

          {/* Privacy Note */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-2 text-[11px] text-slate-500">
            <ShieldCheck className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <p>
              <strong>Privacy Note:</strong> We collect only your name and email to save your personal learning progress and whiteboard annotations. Your data is private to you and never shared.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
