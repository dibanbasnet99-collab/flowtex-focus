/**
 * Voice Announcer using Web Speech API (SpeechSynthesis).
 * Announces timer mode shifts, tasks, and break durations with natural voice inflection.
 */

class VoiceAnnouncer {
  private selectedVoice: SpeechSynthesisVoice | null = null;
  private isSupported: boolean = false;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.isSupported = true;
      this.initVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = () => this.initVoices();
      }
    }
  }

  private initVoices() {
    if (!this.isSupported) return;
    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return;

    // Prefer high quality natural sounding English voices
    const preferred =
      voices.find((v) => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Daniel'))) ||
      voices.find((v) => v.lang === 'en-US') ||
      voices.find((v) => v.lang.startsWith('en')) ||
      voices[0];

    this.selectedVoice = preferred || null;
  }

  public speak(text: string, enabled: boolean = true) {
    if (!this.isSupported || !enabled || !text) return;

    try {
      window.speechSynthesis.cancel(); // cancel any ongoing speech to prevent queuing delays

      const utterance = new SpeechSynthesisUtterance(text);
      if (this.selectedVoice) {
        utterance.voice = this.selectedVoice;
      }
      utterance.rate = 1.0; // Clear, comfortable speaking pace
      utterance.pitch = 1.0;
      utterance.volume = 0.95;

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis failed', e);
    }
  }

  public announceMode(
    mode: 'focus' | 'shortBreak' | 'longBreak',
    durationMinutes: number,
    taskTitle?: string,
    enabled: boolean = true
  ) {
    if (!enabled) return;

    let message = '';
    if (mode === 'focus') {
      if (taskTitle) {
        message = `Starting task: ${taskTitle}. Focus session for ${durationMinutes} minutes.`;
      } else {
        message = `Starting focus session for ${durationMinutes} minutes.`;
      }
    } else if (mode === 'shortBreak') {
      message = `Short break for ${durationMinutes} minutes. Rest your eyes and take a deep breath.`;
    } else if (mode === 'longBreak') {
      message = `Long break for ${durationMinutes} minutes. Great work on completing your focus cycle.`;
    }

    this.speak(message, enabled);
  }
}

export const voiceAnnouncer = new VoiceAnnouncer();
