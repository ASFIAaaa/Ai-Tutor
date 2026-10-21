import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  HelpCircle,
  Lightbulb,
  Maximize2,
  CheckCircle2,
  RotateCcw,
  Send,
  MessageSquare,
  ArrowRight,
  BookOpen
} from 'lucide-react';
import { DiagramElement, DiagramLesson, LearnerLevel, TutorMessage } from '../../types';

interface TutorPanelProps {
  topic: string;
  level: LearnerLevel;
  selectedElement: DiagramElement | null;
  currentStepIndex: number;
  totalSteps: number;
  lessonSummary?: string;
  onAskTutor: (params: {
    question?: string;
    actionType?: 'question' | 'breakdown' | 'simpler_diagram' | 'analogy' | 'confusion_loop';
    element?: DiagramElement | null;
  }) => Promise<void>;
  isLoading: boolean;
  tutorMessages: TutorMessage[];
  onApplySimplerDiagram?: (diagram: DiagramLesson) => void;
  onResetElementSelection?: () => void;
}

export const TutorPanel: React.FC<TutorPanelProps> = ({
  topic,
  level,
  selectedElement,
  currentStepIndex,
  totalSteps,
  lessonSummary,
  onAskTutor,
  isLoading,
  tutorMessages,
  onApplySimplerDiagram,
  onResetElementSelection
}) => {
  const [inputText, setInputText] = useState('');
  const [showConfusionCheck, setShowConfusionCheck] = useState(false);
  const [comprehensionFeedback, setComprehensionFeedback] = useState<'understood' | 'confused' | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    const q = inputText.trim();
    setInputText('');
    await onAskTutor({ question: q, element: selectedElement, actionType: 'question' });
    setShowConfusionCheck(true);
    setComprehensionFeedback(null);
  };

  const handleActionClick = async (actionType: 'breakdown' | 'simpler_diagram' | 'analogy') => {
    if (isLoading) return;
    await onAskTutor({ actionType, element: selectedElement });
    setShowConfusionCheck(true);
    setComprehensionFeedback(null);
  };

  const handleUnderstood = () => {
    setComprehensionFeedback('understood');
    setShowConfusionCheck(false);
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 }
      });
    } catch {}
  };

  const handleStillConfused = async () => {
    setComprehensionFeedback('confused');
    setShowConfusionCheck(true);
    await onAskTutor({ actionType: 'confusion_loop', element: selectedElement });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 leading-tight">AI Whiteboard Tutor</h3>
            <p className="text-[11px] text-slate-500">Ask anything or click any diagram part</p>
          </div>
        </div>

        {/* Selected Element Pill */}
        {selectedElement && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200 rounded-lg text-xs font-semibold text-amber-800">
            <span>{selectedElement.label || selectedElement.type}</span>
            <button
              type="button"
              onClick={onResetElementSelection}
              className="text-amber-500 hover:text-amber-700 ml-1 font-mono text-[10px]"
            >
              ×
            </button>
          </div>
        )}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3.5 max-h-[380px]">
        {/* Initial Prompt Banner */}
        {tutorMessages.length === 0 && (
          <div className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-xl text-slate-700 text-xs flex flex-col gap-2">
            <div className="flex items-start gap-2">
              <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-900">Any confusion?</p>
                <p className="text-slate-600 mt-0.5">
                  Click on any part of the diagram, draw on it with the whiteboard pen, or ask a question below.
                </p>
              </div>
            </div>

            {/* Quick Starter Question Chips */}
            <div className="flex flex-wrap gap-1.5 mt-1 pt-2 border-t border-amber-200/50">
              {[
                'What does this part do?',
                'Why are packets used?',
                'What if this device fails?',
                'Show me an analogy'
              ].map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setInputText(chip);
                  }}
                  className="px-2.5 py-1 bg-white hover:bg-amber-100 text-[11px] font-medium text-slate-700 rounded-md border border-amber-200/80 transition-colors"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Conversation Stream */}
        {tutorMessages.map(msg => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs md:text-sm leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-slate-900 text-white rounded-br-none'
                  : 'bg-slate-100 text-slate-800 rounded-bl-none border border-slate-200/60'
              }`}
            >
              {msg.drawingImage && (
                <img
                  src={msg.drawingImage}
                  alt="Student drawing"
                  className="w-full max-h-32 object-contain bg-white rounded-lg border border-slate-200 mb-2"
                />
              )}
              <div className="whitespace-pre-line">{msg.text}</div>
            </div>
            <span className="text-[10px] text-slate-400 mt-1 px-1">
              {msg.sender === 'user' ? 'You' : 'VisuaLearn Tutor'}
            </span>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl text-xs text-slate-600 animate-pulse">
            <Sparkles className="w-4 h-4 text-orange-500 animate-spin" />
            <span>Tutor is formulating a clear explanation...</span>
          </div>
        )}
      </div>

      {/* 3 Action Buttons: Break it down more, Show simpler diagram, Everyday example */}
      <div className="px-4 py-2 bg-slate-50/80 border-t border-slate-100 flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => handleActionClick('breakdown')}
          disabled={isLoading}
          className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
        >
          <BookOpen className="w-3.5 h-3.5 text-sky-600" />
          <span>Break it down more</span>
        </button>

        <button
          type="button"
          onClick={() => handleActionClick('simpler_diagram')}
          disabled={isLoading}
          className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
        >
          <Maximize2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Simpler diagram</span>
        </button>

        <button
          type="button"
          onClick={() => handleActionClick('analogy')}
          disabled={isLoading}
          className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
        >
          <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
          <span>Everyday example</span>
        </button>
      </div>

      {/* Comprehension Check Loop: "Does that make sense now?" */}
      {showConfusionCheck && (
        <div className="px-4 py-2.5 bg-amber-50/90 border-t border-amber-200 flex items-center justify-between gap-2">
          <span className="text-xs font-semibold text-amber-900">
            Does that make sense now?
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleUnderstood}
              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-bold transition-all flex items-center gap-1 shadow-sm active:scale-95"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Yes, got it!</span>
            </button>

            <button
              type="button"
              onClick={handleStillConfused}
              className="px-2.5 py-1 bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-md text-xs font-semibold transition-all active:scale-95"
            >
              <span>Still confused</span>
            </button>
          </div>
        </div>
      )}

      {comprehensionFeedback === 'understood' && (
        <div className="px-4 py-2 bg-emerald-50 border-t border-emerald-200 text-xs text-emerald-800 font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Awesome job! You mastered this concept. Keep exploring!</span>
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-slate-200 flex items-center gap-2 bg-white">
        <input
          type="text"
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          placeholder={
            selectedElement
              ? `Ask about ${selectedElement.label || selectedElement.type}...`
              : "Type any question ('I don't understand this')..."
          }
          className="flex-1 text-xs md:text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all"
        />

        <button
          type="submit"
          disabled={!inputText.trim() || isLoading}
          className="p-2.5 bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-40 rounded-xl transition-all shadow-sm active:scale-95 shrink-0"
          title="Send question to AI tutor"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
