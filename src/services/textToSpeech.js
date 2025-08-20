// Enhanced Text-to-Speech service supporting Indian languages
class TextToSpeechService {
  constructor() {
    this.synth = window.speechSynthesis;
    this.voices = [];
    this.isLoaded = false;
    this.selectedVoices = {}; // User's preferred voice for each language
    
    // Extended language mapping with regional variants
    this.languageMap = {
      'hi': 'hi-IN',    // Hindi
      'ml': 'ml-IN',    // Malayalam  
      'ta': 'ta-IN',    // Tamil
      'te': 'te-IN',    // Telugu
      'kn': 'kn-IN',    // Kannada
      'en': 'en-IN',    // English (Indian)
      'bn': 'bn-IN',    // Bengali
      'gu': 'gu-IN',    // Gujarati
      'mr': 'mr-IN',    // Marathi
      'pa': 'pa-IN',    // Punjabi
      'or': 'or-IN',    // Odia
      'as': 'as-IN'     // Assamese
    };
    
    // Voice quality preferences (prioritized)
    this.voiceQualityPrefs = [
      'premium', 'enhanced', 'neural', 'high-quality',
      'natural', 'standard', 'basic'
    ];
    
    // Gender preferences for voices
    this.voiceGenderPrefs = {
      'hi': 'female',
      'en': 'female', 
      'ta': 'female',
      'te': 'female',
      'ml': 'female',
      'kn': 'male',
      'bn': 'female',
      'gu': 'female',
      'mr': 'female',
      'pa': 'male',
      'or': 'female',
      'as': 'female'
    };
    
    this.loadVoices();
    this.loadUserPreferences();
  }

  loadVoices() {
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = () => {
        this.voices = this.synth.getVoices();
        this.isLoaded = true;
        this.analyzeVoiceQuality();
        console.log('Available voices loaded:', this.voices.length);
        this.logAvailableVoices();
      };
    }
    
    // Fallback for browsers that don't support onvoiceschanged
    setTimeout(() => {
      if (!this.isLoaded) {
        this.voices = this.synth.getVoices();
        this.isLoaded = true;
        this.analyzeVoiceQuality();
        console.log('Voices loaded via fallback:', this.voices.length);
        this.logAvailableVoices();
      }
    }, 1000);
    
    // Additional fallback with longer delay
    setTimeout(() => {
      const newVoices = this.synth.getVoices();
      if (newVoices.length > this.voices.length) {
        this.voices = newVoices;
        this.analyzeVoiceQuality();
        console.log('Additional voices loaded:', newVoices.length);
      }
    }, 3000);
  }

  getVoiceForLanguage(language) {
    const langCode = this.languageMap[language] || 'hi-IN';
    
    // Check if user has selected a preferred voice for this language
    if (this.selectedVoices[language]) {
      const selectedVoice = this.voices.find(v => v.voiceURI === this.selectedVoices[language]);
      if (selectedVoice) {
        return selectedVoice;
      }
    }
    
    // Find the best quality voice for the language
    const candidateVoices = this.getVoicesForLanguage(language);
    if (candidateVoices.length > 0) {
      return this.selectBestVoice(candidateVoices, language);
    }
    
    // Ultimate fallback to default voice
    if (this.voices.length > 0) {
      return this.voices[0];
    }
    
    return null;
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

  // Get available voices for a specific language with quality analysis
  getVoicesForLanguage(language) {
    const langCode = this.languageMap[language] || 'hi-IN';
    const langPrefix = langCode.split('-')[0];
    
    // Find voices that match exactly or by language prefix
    const matchingVoices = this.voices.filter(voice => {
      return voice.lang === langCode || 
             voice.lang.startsWith(langPrefix) ||
             voice.lang.toLowerCase().includes(langPrefix);
    });
    
    // Sort by quality score
    return matchingVoices.sort((a, b) => {
      const scoreA = this.calculateVoiceQuality(a, language);
      const scoreB = this.calculateVoiceQuality(b, language);
      return scoreB - scoreA;
    });
  }
  
  // Analyze voice quality and create quality map
  analyzeVoiceQuality() {
    this.voiceQuality = new Map();
    
    this.voices.forEach(voice => {
      const quality = this.calculateVoiceQuality(voice);
      this.voiceQuality.set(voice.voiceURI, quality);
    });
  }
  
  // Calculate voice quality score
  calculateVoiceQuality(voice, targetLanguage = null) {
    let score = 0;
    const name = voice.name.toLowerCase();
    const lang = voice.lang.toLowerCase();
    
    // Base score for being local vs remote
    score += voice.localService ? 20 : 40; // Remote voices often better quality
    
    // Quality indicators in voice name
    if (name.includes('neural') || name.includes('premium')) score += 30;
    if (name.includes('enhanced') || name.includes('high-quality')) score += 25;
    if (name.includes('natural') || name.includes('wavenet')) score += 20;
    if (name.includes('standard')) score += 10;
    if (name.includes('basic') || name.includes('compact')) score += 5;
    
    // Specific high-quality voice providers
    if (name.includes('google')) score += 25;
    if (name.includes('microsoft') || name.includes('cortana')) score += 20;
    if (name.includes('amazon') || name.includes('polly')) score += 20;
    if (name.includes('speechify')) score += 15;
    
    // Language-specific bonuses
    if (targetLanguage && this.languageMap[targetLanguage]) {
      const targetLang = this.languageMap[targetLanguage];
      if (lang === targetLang.toLowerCase()) score += 15;
      if (lang.includes('in') && targetLang.includes('IN')) score += 10;
    }
    
    // Gender preference
    if (targetLanguage && this.voiceGenderPrefs[targetLanguage]) {
      const prefGender = this.voiceGenderPrefs[targetLanguage];
      if ((prefGender === 'female' && (name.includes('female') || name.includes('woman'))) ||
          (prefGender === 'male' && (name.includes('male') || name.includes('man')))) {
        score += 10;
      }
    }
    
    // Penalize obviously poor quality voices
    if (name.includes('robotic') || name.includes('low')) score -= 20;
    
    return score;
  }
  
  // Select the best voice from candidates
  selectBestVoice(voices, language) {
    if (voices.length === 0) return null;
    if (voices.length === 1) return voices[0];
    
    // Already sorted by quality, but let's double-check with language-specific scoring
    const scoredVoices = voices.map(voice => ({
      voice,
      score: this.calculateVoiceQuality(voice, language)
    }));
    
    scoredVoices.sort((a, b) => b.score - a.score);
    
    return scoredVoices[0].voice;
  }
  
  // Set preferred voice for a language
  setPreferredVoice(language, voiceURI) {
    this.selectedVoices[language] = voiceURI;
    this.saveUserPreferences();
    console.log(`Set preferred voice for ${language}:`, voiceURI);
  }
  
  // Get all available voices with quality scores
  getVoicesWithQuality(language = null) {
    let voices = language ? this.getVoicesForLanguage(language) : this.voices;
    
    return voices.map(voice => ({
      ...voice,
      qualityScore: this.calculateVoiceQuality(voice, language),
      isSelected: language && this.selectedVoices[language] === voice.voiceURI,
      displayName: this.getVoiceDisplayName(voice)
    }));
  }
  
  // Get user-friendly voice name
  getVoiceDisplayName(voice) {
    let name = voice.name;
    
    // Clean up common voice name patterns
    name = name.replace(/^(Google|Microsoft|Amazon|Speechify)\s*/i, '');
    name = name.replace(/\s*(\([^)]*\))$/, ''); // Remove parenthetical info
    name = name.replace(/\s*-.*$/, ''); // Remove dash and everything after
    
    // Add quality indicators
    const originalName = voice.name.toLowerCase();
    if (originalName.includes('neural') || originalName.includes('premium')) {
      name += ' (Premium)';
    } else if (originalName.includes('enhanced') || originalName.includes('wavenet')) {
      name += ' (Enhanced)';
    } else if (originalName.includes('natural')) {
      name += ' (Natural)';
    }
    
    // Add language info if not obvious
    if (!name.includes('Indian') && voice.lang.includes('IN')) {
      name += ' (Indian)';
    }
    
    return name;
  }
  
  // Load user voice preferences from localStorage
  loadUserPreferences() {
    try {
      const stored = localStorage.getItem('voice_preferences');
      if (stored) {
        this.selectedVoices = JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Error loading voice preferences:', error);
      this.selectedVoices = {};
    }
  }
  
  // Save user voice preferences to localStorage
  saveUserPreferences() {
    try {
      localStorage.setItem('voice_preferences', JSON.stringify(this.selectedVoices));
    } catch (error) {
      console.warn('Error saving voice preferences:', error);
    }
  }
  
  // Log available voices for debugging
  logAvailableVoices() {
    console.log('Available voices by language:');
    Object.keys(this.languageMap).forEach(lang => {
      const voices = this.getVoicesForLanguage(lang);
      if (voices.length > 0) {
        console.log(`${lang}:`, voices.map(v => `${v.name} (${v.lang})`));
      }
    });
  }
  
  // Test voice quality by speaking sample text
  async testVoice(voice, language = 'en') {
    const testPhrases = {
      'hi': 'नमस्ते, यह आवाज़ की गुणवत्ता की जांच है।',
      'en': 'Hello, this is a voice quality test.',
      'ta': 'வணக்கம், இது குரல் தர சோதனை.',
      'te': 'హలో, ఇది వాయిస్ క్వాలిటీ టెస్ట్.',
      'ml': 'നമസ്കാരം, ഇത് വോയ്സ് ക്വാളിറ്റി ടെസ്റ്റ് ആണ്.',
      'kn': 'ನಮಸ್ಕಾರ, ಇದು ಧ್ವನಿ ಗುಣಮಟ್ಟ ಪರೀಕ್ಷೆ.'
    };
    
    const text = testPhrases[language] || testPhrases['en'];
    
    try {
      await this.speak(text, language, {
        rate: 0.9,
        pitch: 1,
        volume: 0.7,
        voiceOverride: voice
      });
      return true;
    } catch (error) {
      console.error('Voice test failed:', error);
      return false;
    }
  }
  
  // Enhanced speak method with voice override
  async speakWithVoice(text, voice, options = {}) {
    if (!this.synth || !voice) {
      throw new Error('Speech synthesis or voice not available');
    }

    this.stop();

    return new Promise((resolve, reject) => {
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Set the specific voice
      utterance.voice = voice;
      utterance.lang = voice.lang;

      // Configure utterance
      utterance.rate = options.rate || 0.9;
      utterance.pitch = options.pitch || 1;
      utterance.volume = options.volume || 1;

      // Event handlers
      utterance.onstart = () => {
        console.log('Speech synthesis started with voice:', voice.name);
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

      this.synth.speak(utterance);
    });
  }
  
  // Get voice statistics
  getVoiceStats() {
    const stats = {
      totalVoices: this.voices.length,
      voicesByLanguage: {},
      qualityDistribution: { premium: 0, enhanced: 0, standard: 0, basic: 0 },
      localVsRemote: { local: 0, remote: 0 }
    };
    
    Object.keys(this.languageMap).forEach(lang => {
      stats.voicesByLanguage[lang] = this.getVoicesForLanguage(lang).length;
    });
    
    this.voices.forEach(voice => {
      const quality = this.calculateVoiceQuality(voice);
      if (quality >= 50) stats.qualityDistribution.premium++;
      else if (quality >= 30) stats.qualityDistribution.enhanced++;
      else if (quality >= 15) stats.qualityDistribution.standard++;
      else stats.qualityDistribution.basic++;
      
      if (voice.localService) stats.localVsRemote.local++;
      else stats.localVsRemote.remote++;
    });
    
    return stats;
  }
}

export default new TextToSpeechService();
