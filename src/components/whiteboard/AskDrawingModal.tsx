import React, { useState } from 'react';
import { X, Sparkles, Send, PenTool } from 'lucide-react';

interface AskDrawingModalProps {
  isOpen: boolean;
  onClose: () => void;
  snapshotImage: string;
  topic: string;
  stepCaption?: string;
  onSubmit: (question: string) => Promise<void>;
  isLoading: boolean;
}

export const AskDrawingModal: React.FC<AskDrawingModalProps> = ({
  isOpen,
  onClose,
  snapshotImage,
  topic,
  stepCaption,
  onSubmit,
  isLoading
}) => {
  const [question, setQuestion] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(question.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden z-10">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 leading-tight">Ask About Your Drawing</h3>
              <p className="text-[11px] text-slate-500">Multimodal AI visual inspection</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Drawing Preview */}
          <div className="rounded-xl border border-slate-200 bg-slate-900 overflow-hidden flex items-center justify-center max-h-48 relative">
            {snapshotImage ? (
              <img
                src={snapshotImage}
                alt="Your whiteboard markup"
                className="w-full h-full object-contain max-h-48 bg-white"
              />
            ) : (
              <div className="text-slate-400 text-xs p-8 flex items-center gap-2">
                <PenTool className="w-4 h-4" />
                <span>No drawing marks captured</span>
              </div>
            )}
            <span className="absolute bottom-2 right-2 text-[10px] bg-slate-900/80 text-white px-2 py-0.5 rounded font-mono">
              Drawing Snapshot
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Your Question or Note (Optional)
            </label>
            <textarea
              rows={2}
              value={question}
              onChange={e => setQuestion(e.target.value)}
              placeholder="e.g., Why is this part circled? What does this cable do?"
              className="w-full text-xs md:text-sm bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all active:scale-95 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                  <span>Analyzing Drawing...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Ask Tutor</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
