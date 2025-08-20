// Text-to-Speech service supporting Indian languages
class TextToSpeechService {
  constructor() {
    this.synth = window.speechSynthesis;
    this.voices = [];
    this.isLoaded = false;
    this.languageMap = {
      'hi': 'hi-IN',    // Hindi
      'ml': 'ml-IN',    // Malayalam  
      'ta': 'ta-IN',    // Tamil
      'te': 'te-IN',    // Telugu
      'kn': 'kn-IN',    // Kannada
      'en': 'en-IN'     // English (Indian)
    };
    this.loadVoices();
  }

  loadVoices() {
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = () => {
        this.voices = this.synth.getVoices();
        this.isLoaded = true;
        console.log('Available voices loaded:', this.voices.length);
      };
    }
    
    // Fallback for browsers that don't support onvoiceschanged
    setTimeout(() => {
      if (!this.isLoaded) {
        this.voices = this.synth.getVoices();
        this.isLoaded = true;
        console.log('Voices loaded via fallback:', this.voices.length);
      }
    }, 1000);
  }

  getVoiceForLanguage(language) {
    const langCode = this.languageMap[language] || 'hi-IN';
    
    // Try to find a voice that matches the language
    let voice = this.voices.find(v => v.lang === langCode);
    
    // Fallback to similar language codes
    if (!voice) {
      const langPrefix = langCode.split('-')[0];
      voice = this.voices.find(v => v.lang.startsWith(langPrefix));
    }
    
    // Ultimate fallback to default voice
    if (!voice && this.voices.length > 0) {
      voice = this.voices[0];
    }
    
    return voice;
  }

  async speak(text, language = 'hi', options = {}) {
    if (!this.synth) {
      throw new Error('Speech synthesis not supported in this browser');
    }

    // Stop any ongoing speech
    this.stop();

    return new Promise((resolve, reject) => {
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Set voice
      const voice = this.getVoiceForLanguage(language);
      if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang;
      } else {
        utterance.lang = this.languageMap[language] || 'hi-IN';
      }

      // Configure utterance
      utterance.rate = options.rate || 0.9;
      utterance.pitch = options.pitch || 1;
      utterance.volume = options.volume || 1;

      // Event handlers
      utterance.onstart = () => {
        console.log('Speech synthesis started');
        if (options.onStart) options.onStart();
      };

      utterance.onend = () => {
        console.log('Speech synthesis completed');
        if (options.onEnd) options.onEnd();
        resolve();
      };

      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event.error);
        if (options.onError) options.onError(event.error);
        reject(new Error(event.error));
      };

      utterance.onpause = () => {
        console.log('Speech synthesis paused');
        if (options.onPause) options.onPause();
      };

      utterance.onresume = () => {
        console.log('Speech synthesis resumed');
        if (options.onResume) options.onResume();
      };

      // Start speaking
      this.synth.speak(utterance);
    });
  }

  stop() {
    if (this.synth && this.synth.speaking) {
      this.synth.cancel();
    }
  }

  pause() {
    if (this.synth && this.synth.speaking) {
      this.synth.pause();
    }
  }

  resume() {
    if (this.synth && this.synth.paused) {
      this.synth.resume();
    }
  }

  isSupported() {
    return !!this.synth;
  }

  isSpeaking() {
    return this.synth && this.synth.speaking;
  }

  isPaused() {
    return this.synth && this.synth.paused;
  }

  getAvailableVoices() {
    return this.voices;
  }

  getSupportedLanguages() {
    return Object.keys(this.languageMap);
  }

  // Get available voices for a specific language
  getVoicesForLanguage(language) {
    const langCode = this.languageMap[language] || 'hi-IN';
    return this.voices.filter(voice => 
      voice.lang === langCode || voice.lang.startsWith(langCode.split('-')[0])
    );
  }
}

export default new TextToSpeechService();
