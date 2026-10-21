import React from 'react';
import { User, History, Sparkles } from 'lucide-react';
import { UserProfile } from '../../types';

interface TopBarProps {
  currentUser: UserProfile;
  onOpenAuth: () => void;
  onOpenHistory: () => void;
  onSelectTopic: (topic: string) => void;
  onNewTopic: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentUser,
  onOpenAuth,
  onOpenHistory,
  onSelectTopic,
  onNewTopic
}) => {
  return (
    <header className="flex items-center justify-between gap-8 px-6 py-4 bg-white border-b border-slate-200 sticky top-0 z-30">
      {/* Zone 1: Single text element wordmark */}
      <a
        href="#home"
        onClick={e => {
          e.preventDefault();
          onNewTopic();
        }}
        className="text-xl font-extrabold tracking-tight text-slate-900 whitespace-nowrap shrink-0 font-display flex items-center gap-2"
      >
        <span className="w-8 h-8 rounded-lg bg-orange-500 text-white flex items-center justify-center font-bold text-sm shadow-sm">
          V
        </span>
        <span>VisuaLearn</span>
      </a>

      {/* Zone 2: 4–5 clean single-line text navigation links */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
        <a
          href="#explore"
          onClick={e => {
            e.preventDefault();
            onNewTopic();
          }}
          className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
        >
          Explore Topics
        </a>
        <a
          href="#router"
          onClick={e => {
            e.preventDefault();
            onSelectTopic('What does a router do');
          }}
          className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
        >
          Routers
        </a>
        <a
          href="#firewall"
          onClick={e => {
            e.preventDefault();
            onSelectTopic('What is a firewall');
          }}
          className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
        >
          Firewalls
        </a>
        <a
          href="#history"
          onClick={e => {
            e.preventDefault();
            onOpenHistory();
          }}
          className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
        >
          <History className="w-4 h-4 text-slate-400" />
          <span>My Lessons</span>
        </a>
      </nav>

      {/* Zone 3: 1 primary action */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Mobile history button */}
        <button
          type="button"
          onClick={onOpenHistory}
          className="md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          title="Past Lessons"
        >
          <History className="w-5 h-5" />
        </button>

        {/* Profile / Account CTA */}
        <button
          type="button"
          onClick={onOpenAuth}
          className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 flex items-center gap-2 shadow-xs active:scale-95"
        >
          <User className="w-3.5 h-3.5 text-slate-300" />
          <span className="max-w-[120px] truncate">
            {currentUser.isGuest ? 'Guest Learner' : currentUser.displayName}
          </span>
        </button>
      </div>
    </header>
  );
};
