export interface SpeechOptions {
  rate?: number; // 0.75 to 1.5
  pitch?: number;
  voiceURI?: string;
  onSentenceChange?: (index: number) => void;
  onEnd?: () => void;
  onError?: (err: any) => void;
}

class SpeechService {
  private synth: SpeechSynthesis | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isSpeakingInternal = false;
  private isPausedInternal = false;
  private currentSentenceIndex = -1;
  private sentenceQueue: string[] = [];
  private activeOptions: SpeechOptions = {};
  private listeners: (() => void)[] = [];

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.loadVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  public isSupported(): boolean {
    return Boolean(this.synth);
  }

  private loadVoices(): void {
    if (!this.synth) return;
    const allVoices = this.synth.getVoices();
    // Prioritize English voices
    this.voices = allVoices.filter(v => v.lang.startsWith('en') || v.lang === '');
    if (this.voices.length === 0) {
      this.voices = allVoices;
    }
    this.notifyListeners();
  }

  public onVoicesChanged(cb: () => void): () => void {
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter(l => l !== cb);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(cb => {
      try {
        cb();
      } catch (e) {
        console.error(e);
      }
    });
  }

  public getEnglishVoices(): SpeechSynthesisVoice[] {
    return this.voices;
  }

  public isSpeaking(): boolean {
    return this.isSpeakingInternal;
  }

  public isPaused(): boolean {
    return this.isPausedInternal;
  }

  public stop(): void {
    if (!this.synth) return;
    this.synth.cancel();
    this.isSpeakingInternal = false;
    this.isPausedInternal = false;
    this.currentSentenceIndex = -1;
    this.sentenceQueue = [];
    if (this.activeOptions.onSentenceChange) {
      this.activeOptions.onSentenceChange(-1);
    }
  }

  public pause(): void {
    if (!this.synth || !this.isSpeakingInternal) return;
    this.synth.pause();
    this.isPausedInternal = true;
  }

  public resume(): void {
    if (!this.synth || !this.isPausedInternal) return;
    this.synth.resume();
    this.isPausedInternal = false;
  }

  /**
   * Splits full text into sentences and speaks them sequentially with accurate sentence highlighting.
   */
  public speakText(text: string, options: SpeechOptions = {}): void {
    if (!this.synth) return;
    this.stop();

    const cleanText = text.trim();
    if (!cleanText) {
      options.onEnd?.();
      return;
    }

    // Split into sentences (handling . ! ?)
    const sentences = cleanText
      .split(/(?<=[.?!])\s+/)
      .map(s => s.trim())
      .filter(Boolean);

    if (sentences.length === 0) {
      sentences.push(cleanText);
    }

    this.sentenceQueue = [...sentences];
    this.activeOptions = options;
    this.currentSentenceIndex = -1;
    this.isSpeakingInternal = true;
    this.isPausedInternal = false;

    this.speakNextSentence();
  }

  private speakNextSentence(): void {
    if (!this.synth) return;

    if (this.sentenceQueue.length === 0) {
      this.isSpeakingInternal = false;
      this.currentSentenceIndex = -1;
      this.activeOptions.onSentenceChange?.(-1);
      this.activeOptions.onEnd?.();
      return;
    }

    const sentence = this.sentenceQueue.shift()!;
    this.currentSentenceIndex += 1;
    this.activeOptions.onSentenceChange?.(this.currentSentenceIndex);

    const utterance = new SpeechSynthesisUtterance(sentence);
    this.currentUtterance = utterance;

    utterance.rate = this.activeOptions.rate || 1.0;
    utterance.pitch = this.activeOptions.pitch || 1.0;
    utterance.lang = 'en-US';

    if (this.activeOptions.voiceURI) {
      const selected = this.voices.find(v => v.voiceURI === this.activeOptions.voiceURI);
      if (selected) utterance.voice = selected;
    } else {
      // Pick a good default natural English voice if available
      const preferred = this.voices.find(v =>
        v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('Aaron')
      );
      if (preferred) utterance.voice = preferred;
    }

    utterance.onend = () => {
      // Small natural pause between sentences
      setTimeout(() => {
        if (this.isSpeakingInternal && !this.isPausedInternal) {
          this.speakNextSentence();
        }
      }, 150);
    };

    utterance.onerror = (e) => {
      console.warn('SpeechSynthesis error:', e);
      if (this.isSpeakingInternal) {
        this.speakNextSentence();
      }
    };

    this.synth.speak(utterance);
  }
}

export const speechService = new SpeechService();
