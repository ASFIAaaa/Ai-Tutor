import React from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  Volume2,
  VolumeX,
  Gauge,
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { DiagramStep } from '../../types';

interface DiagramControlsProps {
  steps: DiagramStep[];
  currentStepIndex: number;
  isPlaying: boolean;
  playbackSpeed: number; // 0.5, 1, 2
  narrationEnabled: boolean;
  activeSentenceIndex: number;
  voices: SpeechSynthesisVoice[];
  selectedVoiceURI: string;
  speechSupported: boolean;
  onPlayPauseToggle: () => void;
  onNextStep: () => void;
  onPrevStep: () => void;
  onRestart: () => void;
  onStepSelect: (index: number) => void;
  onSpeedChange: (speed: number) => void;
  onNarrationToggle: () => void;
  onVoiceChange: (voiceURI: string) => void;
  isDrawingActive: boolean;
  onToggleDrawing: () => void;
}

export const DiagramControls: React.FC<DiagramControlsProps> = ({
  steps,
  currentStepIndex,
  isPlaying,
  playbackSpeed,
  narrationEnabled,
  activeSentenceIndex,
  voices,
  selectedVoiceURI,
  speechSupported,
  onPlayPauseToggle,
  onNextStep,
  onPrevStep,
  onRestart,
  onStepSelect,
  onSpeedChange,
  onNarrationToggle,
  onVoiceChange,
  isDrawingActive,
  onToggleDrawing
}) => {
  const currentStep = steps[currentStepIndex] || steps[0];

  // Split current caption into sentences for highlighting
  const captionSentences = React.useMemo(() => {
    if (!currentStep) return [];
    return currentStep.caption
      .split(/(?<=[.?!])\s+/)
      .map(s => s.trim())
      .filter(Boolean);
  }, [currentStep]);

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* 1. Step Progress Bar */}
      <div className="flex items-center gap-2 w-full px-1">
        <span className="text-xs font-mono text-slate-500 whitespace-nowrap">
          Step {currentStepIndex + 1} of {steps.length}
        </span>
        <div className="flex items-center gap-1.5 flex-1">
          {steps.map((s, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onStepSelect(idx)}
              className={`h-2 flex-1 rounded-full transition-all duration-300 relative group ${
                idx === currentStepIndex
                  ? 'bg-amber-500 ring-2 ring-amber-300 ring-offset-1'
                  : idx < currentStepIndex
                  ? 'bg-slate-400 hover:bg-slate-500'
                  : 'bg-slate-200 hover:bg-slate-300'
              }`}
              title={`Step ${idx + 1}: ${s.title}`}
            >
              {/* Tooltip on hover */}
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-slate-900 text-white text-[11px] px-2 py-0.5 rounded whitespace-nowrap z-30 shadow-lg pointer-events-none">
                {s.title}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Primary Playback & Voice Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
        {/* Playback Controls: Restart, Prev, Play/Pause, Next */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onRestart}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            title="Restart from beginning"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onPrevStep}
            disabled={currentStepIndex === 0}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 rounded-lg transition-colors"
            title="Previous step"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onPlayPauseToggle}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold text-xs flex items-center gap-2 shadow-sm transition-transform active:scale-95"
            title={isPlaying ? 'Pause animation' : 'Play animation'}
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-white" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>Play</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onNextStep}
            disabled={currentStepIndex === steps.length - 1}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 rounded-lg transition-colors"
            title="Next step"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        {/* Speed Selector (0.5x, 1x, 2x) */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
          <Gauge className="w-3.5 h-3.5 text-slate-500 ml-1.5 mr-0.5" />
          {[0.5, 1, 2].map(speed => (
            <button
              key={speed}
              type="button"
              onClick={() => onSpeedChange(speed)}
              className={`px-2 py-1 text-xs font-mono font-medium rounded-md transition-colors ${
                playbackSpeed === speed
                  ? 'bg-white text-slate-900 shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {speed}x
            </button>
          ))}
        </div>

        {/* Voice Narration & Whiteboard Controls */}
        <div className="flex items-center gap-2">
          {/* Whiteboard Layer Toggle */}
          <button
            type="button"
            onClick={onToggleDrawing}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all flex items-center gap-1.5 ${
              isDrawingActive
                ? 'bg-orange-50 border-orange-300 text-orange-700 shadow-sm'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <span>Draw</span>
          </button>

          {/* Voice Narration Toggle & Voice Selector */}
          {speechSupported && (
            <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200">
              <button
                type="button"
                onClick={onNarrationToggle}
                className={`p-2 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-medium ${
                  narrationEnabled
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
                title={narrationEnabled ? 'Mute voice narration' : 'Turn on voice narration'}
              >
                {narrationEnabled ? (
                  <>
                    <Volume2 className="w-4 h-4 text-emerald-600" />
                    <span className="hidden sm:inline">Voice ON</span>
                  </>
                ) : (
                  <>
                    <VolumeX className="w-4 h-4 text-slate-400" />
                    <span className="hidden sm:inline">Voice OFF</span>
                  </>
                )}
              </button>

              {/* Voice Choice Dropdown */}
              {narrationEnabled && voices.length > 0 && (
                <div className="relative inline-block">
                  <select
                    value={selectedVoiceURI}
                    onChange={e => onVoiceChange(e.target.value)}
                    className="text-xs bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-2 py-1.5 pr-6 appearance-none focus:outline-none focus:ring-1 focus:ring-emerald-500 max-w-[130px] truncate"
                    title="Select narration voice"
                  >
                    {voices.map(v => (
                      <option key={v.voiceURI} value={v.voiceURI}>
                        {v.name.replace(/(Google|Microsoft|Apple|Desktop)\s*/g, '')}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 3. Step Caption Card with Sentence-by-Sentence Highlight */}
      <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col gap-1.5 transition-all">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-600 font-mono">
            {currentStep.title}
          </span>
          <span className="text-xs text-slate-500">
            Click any diagram element to inspect
          </span>
        </div>

        <p className="text-sm md:text-base leading-relaxed text-slate-800">
          {captionSentences.length > 0 ? (
            captionSentences.map((sentence, sIdx) => {
              const isReadingSentence = narrationEnabled && activeSentenceIndex === sIdx;
              return (
                <span
                  key={sIdx}
                  className={`transition-colors duration-200 rounded px-1 -mx-1 ${
                    isReadingSentence
                      ? 'bg-amber-100 text-amber-950 font-medium ring-2 ring-amber-300'
                      : ''
                  }`}
                >
                  {sentence}{' '}
                </span>
              );
            })
          ) : (
            currentStep.caption
          )}
        </p>
      </div>
    </div>
  );
};
