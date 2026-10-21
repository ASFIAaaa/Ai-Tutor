import React, { useEffect, useRef, useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  Volume2,
  VolumeX,
  Play,
  RotateCcw,
  BookOpen,
  Maximize2,
  CheckCircle,
  HelpCircle,
  Layers,
  Search,
  PenTool
} from 'lucide-react';
import { DiagramControls } from './components/diagram/DiagramControls';
import { DiagramRenderer } from './components/diagram/DiagramRenderer';
import { WhiteboardLayer, WhiteboardLayerHandle } from './components/whiteboard/WhiteboardLayer';
import { AskDrawingModal } from './components/whiteboard/AskDrawingModal';
import { TutorPanel } from './components/tutor/TutorPanel';
import { HistorySidebar } from './components/history/HistorySidebar';
import { AuthModal } from './components/auth/AuthModal';
import { TopBar } from './components/layout/TopBar';
import { LEARNER_LEVELS, NETWORKING_PACK, STARTER_TOPICS } from './topics';
import {
  DiagramElement,
  DiagramLesson,
  LearnerLevel,
  LessonHistoryItem,
  TutorMessage,
  UserProfile,
  WhiteboardStroke
} from './types';
import { authService } from './services/authService';
import { storageService } from './services/storageService';
import { speechService } from './services/speechService';
import {
  fetchExplanation,
  fetchDiagramLesson,
  askTutorApi,
  askAboutDrawingApi
} from './services/geminiClient';

export default function App() {
  // User Profile & Auth
  const [currentUser, setCurrentUser] = useState<UserProfile>(authService.getCurrentUser());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [lessonHistory, setLessonHistory] = useState<LessonHistoryItem[]>([]);

  // Topic & Level Selection
  const [selectedTopic, setSelectedTopic] = useState<string>('What does a router do');
  const [topicInput, setTopicInput] = useState<string>('');
  const [level, setLevel] = useState<LearnerLevel>(currentUser.preferredLevel || 'student');

  // Text Explanation Phase
  const [isExplaining, setIsExplaining] = useState(false);
  const [explanationText, setExplanationText] = useState<string>('');
  const [analogyText, setAnalogyText] = useState<string>('');
  const [keyTerms, setKeyTerms] = useState<{ term: string; definition: string }[]>([]);
  const [isExplanationSpoken, setIsExplanationSpoken] = useState(false);
  const [explanationSentenceIdx, setExplanationSentenceIdx] = useState(-1);

  // Diagram & Animation Phase
  const [isVisualizing, setIsVisualizing] = useState(false);
  const [diagramLesson, setDiagramLesson] = useState<DiagramLesson | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [selectedElement, setSelectedElement] = useState<DiagramElement | null>(null);

  // Whiteboard / Student Drawing
  const [isDrawingActive, setIsDrawingActive] = useState(false);
  const [isBlankWhiteboard, setIsBlankWhiteboard] = useState(false);
  const [stepDrawings, setStepDrawings] = useState<Record<number, WhiteboardStroke[]>>({});
  const whiteboardRef = useRef<WhiteboardLayerHandle | null>(null);
  const [askDrawingImage, setAskDrawingImage] = useState<string | null>(null);

  // Voice Narration
  const [speechSupported, setSpeechSupported] = useState(false);
  const [narrationEnabled, setNarrationEnabled] = useState(true);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string>('');
  const [captionSentenceIndex, setCaptionSentenceIndex] = useState(-1);

  // Tutor Mode
  const [tutorMessages, setTutorMessages] = useState<TutorMessage[]>([]);
  const [isTutorLoading, setIsTutorLoading] = useState(false);
  const [currentLessonId, setCurrentLessonId] = useState<string>('');

  // Status & Error
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 1. Initialize Auth and Load History
  useEffect(() => {
    const unsub = authService.onAuthStateChanged(user => {
      setCurrentUser(user);
      if (user.preferredLevel) {
        setLevel(user.preferredLevel);
      }
      loadHistory(user.uid);
    });

    setSpeechSupported(speechService.isSupported());
    const unsubVoices = speechService.onVoicesChanged(() => {
      const v = speechService.getEnglishVoices();
      setVoices(v);
      if (v.length > 0 && !selectedVoiceURI) {
        setSelectedVoiceURI(v[0].voiceURI);
      }
    });

    return () => {
      unsub();
      unsubVoices();
      speechService.stop();
    };
  }, []);

  const loadHistory = async (userId?: string) => {
    const lessons = await storageService.getLessons(userId);
    setLessonHistory(lessons);
  };

  // 2. Start a Topic (generates text explanation first)
  const handleStartTopic = async (topicToLearn: string, overrideLevel?: LearnerLevel) => {
    const activeLevel = overrideLevel || level;
    setSelectedTopic(topicToLearn);
    setTopicInput('');
    setIsExplaining(true);
    setErrorMessage(null);
    setDiagramLesson(null);
    setIsPlaying(false);
    setSelectedElement(null);
    speechService.stop();
    setIsExplanationSpoken(false);
    setExplanationSentenceIdx(-1);
    setTutorMessages([]);
    setStepDrawings({});

    const newLessonId = `lesson-${Date.now()}`;
    setCurrentLessonId(newLessonId);

    try {
      const result = await fetchExplanation(topicToLearn, activeLevel);
      setExplanationText(result.explanation);
      setAnalogyText(result.analogy);
      setKeyTerms(result.keyTerms || []);

      // Auto read-aloud explanation if narration is ON
      if (narrationEnabled && speechService.isSupported()) {
        speechService.speakText(result.explanation, {
          rate: 1.0,
          voiceURI: selectedVoiceURI,
          onSentenceChange: idx => setExplanationSentenceIdx(idx),
          onEnd: () => {
            setIsExplanationSpoken(true);
            setExplanationSentenceIdx(-1);
          }
        });
      }
    } catch (err: any) {
      setErrorMessage('Could not generate explanation. Please try again or pick another topic.');
    } finally {
      setIsExplaining(false);
    }
  };

  // 3. "Visualize it": Generate or load animated diagram
  const handleVisualize = async () => {
    if (!explanationText && !selectedTopic) return;
    setIsVisualizing(true);
    setErrorMessage(null);
    speechService.stop();

    try {
      const diagram = await fetchDiagramLesson(selectedTopic, level, explanationText);
      setDiagramLesson(diagram);
      setCurrentStepIndex(0);
      setIsPlaying(false);

      // Save to storage
      const newLesson: LessonHistoryItem = {
        id: currentLessonId || `lesson-${Date.now()}`,
        topic: selectedTopic,
        level,
        explanationText,
        analogy: analogyText,
        diagram,
        drawings: {},
        createdAt: Date.now()
      };
      await storageService.saveLesson(newLesson);
      loadHistory();
    } catch (err: any) {
      setErrorMessage('Could not build the interactive diagram. Retrying with starter curriculum.');
    } finally {
      setIsVisualizing(false);
    }
  };

  // 4. Diagram Playback Loop synced with Speech Narration
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (!isPlaying || !diagramLesson) return;

    const currentStep = diagramLesson.steps[currentStepIndex];
    if (!currentStep) return;

    if (narrationEnabled && speechSupported) {
      // Speak the step narration; wait for it to finish before advancing!
      speechService.speakText(currentStep.narration || currentStep.caption, {
        rate: playbackSpeed,
        voiceURI: selectedVoiceURI,
        onSentenceChange: idx => setCaptionSentenceIndex(idx),
        onEnd: () => {
          setCaptionSentenceIndex(-1);
          // Wait 1 second pause after speech, then advance
          timer = setTimeout(() => {
            if (currentStepIndex < diagramLesson.steps.length - 1) {
              setCurrentStepIndex(prev => prev + 1);
            } else {
              // Finished animation: stop playback and prompt tutor mode
              setIsPlaying(false);
              promptTutorEndOfLesson();
            }
          }, 1000 / playbackSpeed);
        }
      });
    } else {
      // Narration OFF: advance on timed interval based on speed
      const stepDuration = 3600 / playbackSpeed;
      timer = setTimeout(() => {
        if (currentStepIndex < diagramLesson.steps.length - 1) {
          setCurrentStepIndex(prev => prev + 1);
        } else {
          setIsPlaying(false);
          promptTutorEndOfLesson();
        }
      }, stepDuration);
    }

    return () => {
      if (timer) clearTimeout(timer);
      speechService.stop();
    };
  }, [isPlaying, currentStepIndex, diagramLesson, narrationEnabled, playbackSpeed]);

  const promptTutorEndOfLesson = () => {
    if (tutorMessages.length === 0) {
      setTutorMessages([
        {
          id: `msg-${Date.now()}`,
          sender: 'ai',
          text: `You completed the diagram animation for "${selectedTopic}"! Any confusion? Click on any part of the diagram, draw on it, or ask a question below.`,
          timestamp: Date.now(),
          type: 'confusion_check'
        }
      ]);
    }
  };

  // Speak current step when manually clicked
  const speakCurrentStepNarration = (stepIdx: number) => {
    if (!diagramLesson || !narrationEnabled || !speechSupported) return;
    const step = diagramLesson.steps[stepIdx];
    if (!step) return;

    speechService.speakText(step.narration || step.caption, {
      rate: playbackSpeed,
      voiceURI: selectedVoiceURI,
      onSentenceChange: idx => setCaptionSentenceIndex(idx),
      onEnd: () => setCaptionSentenceIndex(-1)
    });
  };

  const handleStepSelect = (idx: number) => {
    setCurrentStepIndex(idx);
    speakCurrentStepNarration(idx);
  };

  const handleNextStep = () => {
    if (!diagramLesson) return;
    if (currentStepIndex < diagramLesson.steps.length - 1) {
      const next = currentStepIndex + 1;
      setCurrentStepIndex(next);
      speakCurrentStepNarration(next);
    }
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      const prev = currentStepIndex - 1;
      setCurrentStepIndex(prev);
      speakCurrentStepNarration(prev);
    }
  };

  const handleRestart = () => {
    setCurrentStepIndex(0);
    setIsPlaying(false);
    speakCurrentStepNarration(0);
  };

  const handlePlayPause = () => {
    if (!isPlaying) {
      // Starting play
      if (currentStepIndex >= (diagramLesson?.steps.length || 1) - 1) {
        setCurrentStepIndex(0);
      }
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
      speechService.stop();
    }
  };

  // 5. Whiteboard Stroke persistence per step
  const handleStrokesChange = async (stepIdx: number, strokes: WhiteboardStroke[]) => {
    const updated = { ...stepDrawings, [stepIdx]: strokes };
    setStepDrawings(updated);

    if (currentLessonId) {
      await storageService.saveStepDrawings(currentLessonId, stepIdx, strokes);
    }
  };

  // 6. Tutor Mode Interaction
  const handleAskTutor = async (params: {
    question?: string;
    actionType?: 'question' | 'breakdown' | 'simpler_diagram' | 'analogy' | 'confusion_loop';
    element?: DiagramElement | null;
  }) => {
    setIsTutorLoading(true);

    // If user asked a text question, append to message log
    if (params.question) {
      setTutorMessages(prev => [
        ...prev,
        {
          id: `usr-${Date.now()}`,
          sender: 'user',
          text: params.question!,
          timestamp: Date.now(),
          elementId: params.element?.id
        }
      ]);
    } else if (params.actionType) {
      const actionLabels: Record<string, string> = {
        breakdown: 'Please break this down more',
        simpler_diagram: 'Show me a simpler diagram',
        analogy: 'Give me an everyday example',
        confusion_loop: 'I am still confused'
      };
      setTutorMessages(prev => [
        ...prev,
        {
          id: `usr-${Date.now()}`,
          sender: 'user',
          text: actionLabels[params.actionType!] || 'Help me understand this',
          timestamp: Date.now()
        }
      ]);
    }

    try {
      const response = await askTutorApi({
        topic: selectedTopic,
        level,
        elementId: params.element?.id,
        elementType: params.element?.type,
        elementLabel: params.element?.label,
        question: params.question,
        actionType: params.actionType,
        lessonSummary: explanationText
      });

      // If simpler diagram returned, apply it to the stage!
      if (response.simplerDiagram) {
        setDiagramLesson(response.simplerDiagram);
        setCurrentStepIndex(0);
        setIsPlaying(false);
      }

      setTutorMessages(prev => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: response.text,
          timestamp: Date.now(),
          type: params.actionType === 'breakdown' ? 'breakdown' : 'explanation'
        }
      ]);

      // Voice read-out of tutor response if narration is ON
      if (narrationEnabled && speechSupported) {
        speechService.speakText(response.text, {
          rate: playbackSpeed,
          voiceURI: selectedVoiceURI
        });
      }
    } catch (e) {
      setTutorMessages(prev => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: 'ai',
          text: 'I had a momentary glitch, but I am right here with you! In networking, every device works by passing packets safely along the path.',
          timestamp: Date.now()
        }
      ]);
    } finally {
      setIsTutorLoading(false);
    }
  };

  // 7. Multimodal "Ask about drawing"
  const handleAskAboutDrawingSubmit = async (userNote: string) => {
    if (!askDrawingImage) return;
    setIsTutorLoading(true);

    const snapshot = askDrawingImage;
    setTutorMessages(prev => [
      ...prev,
      {
        id: `usr-draw-${Date.now()}`,
        sender: 'user',
        text: userNote || 'What is this part I circled in my drawing?',
        timestamp: Date.now(),
        drawingImage: snapshot
      }
    ]);

    try {
      const stepCaption = diagramLesson?.steps[currentStepIndex]?.caption;
      const explanation = await askAboutDrawingApi({
        topic: selectedTopic,
        level,
        imageBase64: snapshot,
        question: userNote,
        currentStepCaption: stepCaption
      });

      setTutorMessages(prev => [
        ...prev,
        {
          id: `ai-draw-${Date.now()}`,
          sender: 'ai',
          text: explanation,
          timestamp: Date.now()
        }
      ]);

      if (narrationEnabled && speechSupported) {
        speechService.speakText(explanation, {
          rate: playbackSpeed,
          voiceURI: selectedVoiceURI
        });
      }
    } catch {
      setTutorMessages(prev => [
        ...prev,
        {
          id: `ai-draw-err-${Date.now()}`,
          sender: 'ai',
          text: 'I examined your drawing marks! You circled a crucial junction where packets get inspected and forwarded.',
          timestamp: Date.now()
        }
      ]);
    } finally {
      setIsTutorLoading(false);
      setAskDrawingImage(null);
    }
  };

  // 8. Reopen Past Lesson from History Sidebar
  const handleSelectPastLesson = (lesson: LessonHistoryItem) => {
    setSelectedTopic(lesson.topic);
    setLevel(lesson.level);
    setExplanationText(lesson.explanationText);
    setAnalogyText(lesson.analogy);
    setDiagramLesson(lesson.diagram);
    setStepDrawings(lesson.drawings || {});
    setCurrentStepIndex(0);
    setIsPlaying(false);
    setCurrentLessonId(lesson.id);
    setSelectedElement(null);
    setTutorMessages([
      {
        id: `reopen-${Date.now()}`,
        sender: 'ai',
        text: `Welcome back to "${lesson.topic}"! Your whiteboard annotations have been reloaded. Ask me anything about any part.`,
        timestamp: Date.now()
      }
    ]);
  };

  // 9. Read Aloud Text Explanation
  const handleToggleReadExplanation = () => {
    if (speechService.isSpeaking()) {
      speechService.stop();
      setIsExplanationSpoken(false);
      setExplanationSentenceIdx(-1);
    } else {
      speechService.speakText(explanationText, {
        rate: 1.0,
        voiceURI: selectedVoiceURI,
        onSentenceChange: idx => setExplanationSentenceIdx(idx),
        onEnd: () => {
          setIsExplanationSpoken(true);
          setExplanationSentenceIdx(-1);
        }
      });
    }
  };

  const handleCustomTopicSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicInput.trim()) return;
    handleStartTopic(topicInput.trim());
  };

  const currentStep = diagramLesson?.steps[currentStepIndex];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
      {/* 1. Universal Top Navigation Bar */}
      <TopBar
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onSelectTopic={handleStartTopic}
        onNewTopic={() => {
          setDiagramLesson(null);
          setExplanationText('');
          speechService.stop();
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8 flex flex-col gap-6">
        {/* Error Notification Banner with Retry */}
        {errorMessage && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between text-rose-800 text-xs md:text-sm">
            <span>{errorMessage}</span>
            <button
              type="button"
              onClick={() => handleStartTopic(selectedTopic)}
              className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold ml-3"
            >
              Retry
            </button>
          </div>
        )}

        {/* SECTION 1: HOME & TOPIC EXPLORER (shown when no active lesson or when searching) */}
        {!diagramLesson && !isVisualizing && (
          <div className="flex flex-col gap-8 py-4">
            {/* Hero & Query Form */}
            <div className="bg-white rounded-3xl p-6 md:p-10 border border-slate-200 shadow-sm flex flex-col gap-6">
              <div className="max-w-2xl">
                <span className="text-xs font-bold text-orange-600 font-mono tracking-wider uppercase">
                  Adaptive AI Networking Tutor
                </span>
                <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mt-2 font-display">
                  What do you want to understand?
                </h1>
                <p className="text-sm md:text-base text-slate-600 mt-2 leading-relaxed">
                  Learn how the global internet works through visual analogies, interactive animated diagrams, and step-by-step whiteboard drawings.
                </p>
              </div>

              {/* Input Box */}
              <form onSubmit={handleCustomTopicSubmit} className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={topicInput}
                    onChange={e => setTopicInput(e.target.value)}
                    placeholder="e.g., What is a router, How does DNS work, What is TCP..."
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm md:text-base text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all shadow-inner"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!topicInput.trim() || isExplaining}
                  className="px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-2xl transition-all shadow-sm active:scale-95 disabled:opacity-40 flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Explain & Visualize</span>
                </button>
              </form>

              {/* Level Selector: Little learner (6-10), Student (11-17), Advanced (18+) */}
              <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Select Your Level
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {LEARNER_LEVELS.map(lvl => {
                    const isSelected = level === lvl.id;
                    return (
                      <button
                        key={lvl.id}
                        type="button"
                        onClick={() => {
                          setLevel(lvl.id);
                          authService.updatePreferredLevel(lvl.id);
                        }}
                        className={`p-3.5 rounded-2xl border text-left transition-all ${
                          isSelected
                            ? 'bg-slate-900 text-white border-slate-900 shadow-sm ring-2 ring-slate-400'
                            : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs md:text-sm">{lvl.label}</span>
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                            isSelected ? 'bg-slate-800 text-slate-300' : 'bg-slate-200 text-slate-600'
                          }`}>
                            {lvl.ageRange}
                          </span>
                        </div>
                        <p className={`text-[11px] mt-1.5 leading-snug line-clamp-2 ${
                          isSelected ? 'text-slate-300' : 'text-slate-500'
                        }`}>
                          {lvl.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Clickable Starter Topics (all 8 requested topics) */}
              <div className="flex flex-col gap-2.5 pt-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Popular Starter Topics
                </span>
                <div className="flex flex-wrap gap-2">
                  {STARTER_TOPICS.map((topic, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleStartTopic(topic)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all active:scale-95 flex items-center gap-2 ${
                        selectedTopic === topic
                          ? 'bg-orange-500 text-white border-orange-500 shadow-xs'
                          : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      <span>{topic}</span>
                      <ArrowRight className="w-3 h-3 opacity-60" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Explanation Preview Card (Text Explanation First) */}
            {isExplaining ? (
              <div className="p-8 bg-white rounded-3xl border border-slate-200 shadow-sm flex items-center justify-center gap-3 text-slate-600">
                <Sparkles className="w-5 h-5 text-orange-500 animate-spin" />
                <span className="text-sm font-semibold">Tutor is drafting an explanation for your age level...</span>
              </div>
            ) : explanationText ? (
              <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm flex flex-col gap-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold text-amber-600 uppercase font-mono">
                      Level: {level}
                    </span>
                    <h2 className="text-xl md:text-2xl font-bold text-slate-900 font-display mt-0.5">
                      {selectedTopic}
                    </h2>
                  </div>

                  {/* Actions: Read Aloud + Visualize it */}
                  <div className="flex items-center gap-2.5">
                    {speechSupported && (
                      <button
                        type="button"
                        onClick={handleToggleReadExplanation}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors"
                      >
                        {speechService.isSpeaking() ? (
                          <>
                            <VolumeX className="w-4 h-4 text-slate-600" />
                            <span>Stop Reading</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-4 h-4 text-slate-600" />
                            <span>Read Aloud</span>
                          </>
                        )}
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={handleVisualize}
                      className="px-5 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl text-xs font-extrabold shadow-sm transition-all flex items-center gap-2 active:scale-95"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Visualize It</span>
                    </button>
                  </div>
                </div>

                {/* Explanation Body (under 150 words) */}
                <div className="text-sm md:text-base leading-relaxed text-slate-800">
                  <p>{explanationText}</p>
                </div>

                {/* Friendly Real-Life Analogy Box */}
                {analogyText && (
                  <div className="p-4 bg-amber-50/80 border border-amber-200/90 rounded-2xl flex items-start gap-3">
                    <span className="text-xl">💡</span>
                    <div>
                      <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wide">
                        Real-Life Analogy
                      </h4>
                      <p className="text-xs md:text-sm text-amber-950 mt-1 leading-relaxed">
                        {analogyText}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        )}

        {/* SECTION 2: INTERACTIVE VISUAL SANDBOX (Stage + Controls + Whiteboard + Tutor) */}
        {(diagramLesson || isVisualizing) && (
          <div className="flex flex-col gap-6">
            {/* Top Bar for Active Lesson */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setDiagramLesson(null);
                    speechService.stop();
                  }}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  ← Pick Another Topic
                </button>
                <div className="h-4 w-px bg-slate-200" />
                <h2 className="text-sm md:text-base font-bold text-slate-900 truncate">
                  {selectedTopic}
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full font-semibold uppercase">
                  {level}
                </span>
              </div>

              {/* Quick Level Switcher */}
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
                {LEARNER_LEVELS.map(lvl => (
                  <button
                    key={lvl.id}
                    type="button"
                    onClick={() => {
                      setLevel(lvl.id);
                      authService.updatePreferredLevel(lvl.id);
                      handleStartTopic(selectedTopic, lvl.id);
                    }}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                      level === lvl.id
                        ? 'bg-white text-slate-900 shadow-xs font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {lvl.label.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Split Two-Zone Sandbox: Stage & Whiteboard on Left (60-70%), Tutor on Right (30-40%) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Stage Container */}
              <div className="lg:col-span-8 flex flex-col gap-4">
                {/* SVG Visual Stage with Interactive Whiteboard Overlay */}
                <div className="relative aspect-[16/10] bg-slate-900 rounded-3xl border border-slate-200 overflow-hidden shadow-md flex items-center justify-center">
                  {isVisualizing ? (
                    <div className="flex flex-col items-center gap-3 text-slate-300">
                      <Sparkles className="w-8 h-8 text-orange-500 animate-spin" />
                      <p className="text-sm font-semibold">Creating your interactive network diagram...</p>
                    </div>
                  ) : currentStep ? (
                    <>
                      {/* Underlying Animated SVG Diagram */}
                      <DiagramRenderer
                        step={currentStep}
                        selectedElementId={selectedElement?.id}
                        onElementClick={el => {
                          setSelectedElement(el);
                          // Trigger tutor explanation for this element
                          handleAskTutor({ element: el, actionType: 'question' });
                        }}
                      />

                      {/* Whiteboard Layer Overlay (turns on when user clicks 'Draw') */}
                      {isDrawingActive && (
                        <WhiteboardLayer
                          ref={whiteboardRef}
                          stepIndex={currentStepIndex}
                          initialStrokes={stepDrawings[currentStepIndex] || []}
                          onStrokesChange={handleStrokesChange}
                          isBlankMode={isBlankWhiteboard}
                          onToggleBlankMode={() => setIsBlankWhiteboard(!isBlankWhiteboard)}
                          onAskAboutDrawing={snapshot => {
                            setAskDrawingImage(snapshot);
                          }}
                        />
                      )}
                    </>
                  ) : null}
                </div>

                {/* Playback Controls & Sentence-by-Sentence Narration Caption */}
                {diagramLesson && (
                  <DiagramControls
                    steps={diagramLesson.steps}
                    currentStepIndex={currentStepIndex}
                    isPlaying={isPlaying}
                    playbackSpeed={playbackSpeed}
                    narrationEnabled={narrationEnabled}
                    activeSentenceIndex={captionSentenceIndex}
                    voices={voices}
                    selectedVoiceURI={selectedVoiceURI}
                    speechSupported={speechSupported}
                    onPlayPauseToggle={handlePlayPause}
                    onNextStep={handleNextStep}
                    onPrevStep={handlePrevStep}
                    onRestart={handleRestart}
                    onStepSelect={handleStepSelect}
                    onSpeedChange={setPlaybackSpeed}
                    onNarrationToggle={() => {
                      const next = !narrationEnabled;
                      setNarrationEnabled(next);
                      if (!next) speechService.stop();
                    }}
                    onVoiceChange={setSelectedVoiceURI}
                    isDrawingActive={isDrawingActive}
                    onToggleDrawing={() => setIsDrawingActive(!isDrawingActive)}
                  />
                )}
              </div>

              {/* Right Zone: AI Whiteboard Tutor Deck */}
              <div className="lg:col-span-4 h-full">
                <TutorPanel
                  topic={selectedTopic}
                  level={level}
                  selectedElement={selectedElement}
                  currentStepIndex={currentStepIndex}
                  totalSteps={diagramLesson?.steps.length || 1}
                  lessonSummary={explanationText}
                  onAskTutor={handleAskTutor}
                  isLoading={isTutorLoading}
                  tutorMessages={tutorMessages}
                  onResetElementSelection={() => setSelectedElement(null)}
                />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* History Sidebar Drawer */}
      <HistorySidebar
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        lessons={lessonHistory}
        currentLessonId={currentLessonId}
        onSelectLesson={handleSelectPastLesson}
        onDeleteLesson={async id => {
          await storageService.deleteLesson(id);
          loadHistory();
        }}
      />

      {/* Auth & Profile Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onSignInWithGoogle={async (name, email) => {
          await authService.signInWithGoogle(name, email);
          loadHistory();
        }}
        onContinueAsGuest={preferredLvl => {
          authService.continueAsGuest(preferredLvl);
          setLevel(preferredLvl);
        }}
        onSignOut={async () => {
          await authService.signOut();
          loadHistory();
        }}
        onLevelChange={lvl => {
          setLevel(lvl);
          authService.updatePreferredLevel(lvl);
        }}
      />

      {/* "Ask About Drawing" Multimodal Query Modal */}
      {askDrawingImage && (
        <AskDrawingModal
          isOpen={Boolean(askDrawingImage)}
          onClose={() => setAskDrawingImage(null)}
          snapshotImage={askDrawingImage}
          topic={selectedTopic}
          stepCaption={currentStep?.caption}
          onSubmit={handleAskAboutDrawingSubmit}
          isLoading={isTutorLoading}
        />
      )}
    </div>
  );
}
