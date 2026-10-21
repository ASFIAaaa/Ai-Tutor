import React from 'react';
import {
  History,
  X,
  Trash2,
  Calendar,
  ExternalLink,
  Search,
  PenTool
} from 'lucide-react';
import { LessonHistoryItem } from '../../types';

interface HistorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  lessons: LessonHistoryItem[];
  currentLessonId?: string;
  onSelectLesson: (lesson: LessonHistoryItem) => void;
  onDeleteLesson: (lessonId: string) => void;
}

export const HistorySidebar: React.FC<HistorySidebarProps> = ({
  isOpen,
  onClose,
  lessons,
  currentLessonId,
  onSelectLesson,
  onDeleteLesson
}) => {
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredLessons = React.useMemo(() => {
    if (!searchTerm.trim()) return lessons;
    const q = searchTerm.toLowerCase();
    return lessons.filter(l =>
      l.topic.toLowerCase().includes(q) ||
      l.explanationText.toLowerCase().includes(q) ||
      l.level.toLowerCase().includes(q)
    );
  }, [lessons, searchTerm]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-slate-700" />
              <h2 className="text-base font-bold text-slate-900">Learning History</h2>
              <span className="text-xs font-mono px-2 py-0.5 bg-slate-200 text-slate-700 rounded-full font-semibold">
                {lessons.length}
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search Bar */}
          <div className="p-3 border-b border-slate-100">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search past lessons..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>

          {/* List of Saved Lessons */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {filteredLessons.length === 0 ? (
              <div className="text-center py-12 px-4">
                <History className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-700">No lessons saved yet</p>
                <p className="text-xs text-slate-400 mt-1">
                  Start any topic to automatically save your lesson, diagram, and drawings.
                </p>
              </div>
            ) : (
              filteredLessons.map(lesson => {
                const isSelected = lesson.id === currentLessonId;
                const formattedDate = new Date(lesson.createdAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                });

                // Count total drawing strokes across steps
                const totalStrokes = Object.values(lesson.drawings || {}).reduce(
                  (sum, s) => sum + (Array.isArray(s) ? s.length : 0),
                  0
                );

                return (
                  <div
                    key={lesson.id}
                    onClick={() => {
                      onSelectLesson(lesson);
                      onClose();
                    }}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer group flex flex-col gap-2 ${
                      isSelected
                        ? 'border-amber-400 bg-amber-50/60 ring-1 ring-amber-300'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs md:text-sm font-bold text-slate-900 group-hover:text-amber-800 transition-colors">
                        {lesson.topic}
                      </h4>
                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation();
                          if (confirm(`Remove "${lesson.topic}" from history?`)) {
                            onDeleteLesson(lesson.id);
                          }
                        }}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors opacity-0 group-hover:opacity-100"
                        title="Delete lesson"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                      {lesson.explanationText}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="capitalize font-semibold text-slate-600">
                          {lesson.level}
                        </span>
                        {totalStrokes > 0 && (
                          <span className="flex items-center gap-1 text-orange-600 font-medium">
                            <PenTool className="w-3 h-3" />
                            {totalStrokes} drawing{totalStrokes > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                      <span className="flex items-center gap-1 font-mono">
                        <Calendar className="w-3 h-3" />
                        {formattedDate}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
