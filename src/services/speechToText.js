// Enhanced Speech-to-Text service supporting Indian languages
class SpeechToTextService {
  constructor() {
    this.recognition = null;
    this.isListening = false;
    this.currentLanguage = 'hi';
    this.transcript = '';
    this.confidence = 0;
    this.interimTranscript = '';
    
    // Extended language mapping with dialect support
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
    
    // Language detection patterns
    this.languagePatterns = {
      'hi': /[\u0900-\u097F]/,  // Devanagari
      'ta': /[\u0B80-\u0BFF]/,  // Tamil
      'te': /[\u0C00-\u0C7F]/,  // Telugu
      'ml': /[\u0D00-\u0D7F]/,  // Malayalam
      'kn': /[\u0C80-\u0CFF]/,  // Kannada
      'bn': /[\u0980-\u09FF]/,  // Bengali
      'gu': /[\u0A80-\u0AFF]/,  // Gujarati
      'mr': /[\u0900-\u097F]/,  // Marathi (Devanagari)
      'pa': /[\u0A00-\u0A7F]/,  // Punjabi
      'or': /[\u0B00-\u0B7F]/,  // Odia
      'as': /[\u0980-\u09FF]/   // Assamese
    };
    
    this.initializeRecognition();
  }

  initializeRecognition() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.error('Speech recognition not supported in this browser');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();
    
    // Enhanced recognition settings for better accuracy
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.maxAlternatives = 3; // Get multiple alternatives for better accuracy
    
    // Set timeout values for better handling
    if (this.recognition.serviceURI) {
      this.recognition.serviceURI = 'wss://www.google.com/speech-api/full-duplex/v1/up';
    }
  }

  async startListening(language = 'hi', onResult, onError, onStart, onEnd, options = {}) {
    if (!this.recognition) {
      const error = 'Speech recognition not available';
      console.error(error);
      if (onError) onError(error);
      return;
    }

    if (this.isListening) {
      this.stopListening();
    }

    this.currentLanguage = language;
    this.recognition.lang = this.languageMap[language] || 'hi-IN';
    this.isListening = true;
    this.transcript = '';
    this.interimTranscript = '';
    
    // Set recognition timeout based on options
    const timeout = options.timeout || 10000; // Default 10 seconds
    const autoRestart = options.autoRestart !== false; // Default true

    this.recognition.onstart = () => {
      console.log('Speech recognition started');
      if (onStart) onStart();
    };

    this.recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';
      let bestConfidence = 0;
      let detectedLanguage = this.currentLanguage;
      
      // Process all results
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript;
        const confidence = result[0].confidence || 0;
        
        // Try to detect language from transcript
        const possibleLang = this.detectLanguageFromText(transcript);
        if (possibleLang && possibleLang !== 'en') {
          detectedLanguage = possibleLang;
        }
        
        if (result.isFinal) {
          finalTranscript += transcript;
          if (confidence > bestConfidence) {
            bestConfidence = confidence;
          }
        } else {
          interimTranscript += transcript;
        }
      }
      
      // Store current state
      if (finalTranscript) {
        this.transcript = finalTranscript;
        this.confidence = bestConfidence;
      }
      this.interimTranscript = interimTranscript;
      
      console.log('Speech recognized:', {
        final: finalTranscript,
        interim: interimTranscript,
        confidence: bestConfidence,
        detectedLanguage
      });
      
      if (onResult) {
        onResult({
          transcript: finalTranscript || interimTranscript,
          finalTranscript,
          interimTranscript,
          confidence: bestConfidence,
          isFinal: !!finalTranscript,
          language: detectedLanguage,
          alternatives: this.getAlternatives(event)
        });
      }
    };

    this.recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      this.isListening = false;
      if (onError) onError(event.error);
    };

    this.recognition.onend = () => {
      console.log('Speech recognition ended');
      this.isListening = false;
      if (onEnd) onEnd();
    };

    try {
      this.recognition.start();
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      this.isListening = false;
      if (onError) onError(error.message);
    }
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  isSupported() {
    return !!this.recognition;
  }

  getSupportedLanguages() {
    return Object.keys(this.languageMap);
  }
  
  // Detect language from text using character patterns
  detectLanguageFromText(text) {
    if (!text || text.trim().length === 0) return null;
    
    for (const [lang, pattern] of Object.entries(this.languagePatterns)) {
      if (pattern.test(text)) {
        return lang;
      }
    }
    
    // Default to English if no pattern matches
    return 'en';
  }
  
  // Get alternative transcriptions
  getAlternatives(event) {
    const alternatives = [];
    if (event.results && event.results.length > 0) {
      const result = event.results[event.results.length - 1];
      for (let i = 0; i < Math.min(result.length, 3); i++) {
        alternatives.push({
          transcript: result[i].transcript,
          confidence: result[i].confidence || 0
        });
      }
    }
    return alternatives;
  }
  
  // Get current transcription state
  getCurrentTranscript() {
    return {
      final: this.transcript,
      interim: this.interimTranscript,
      confidence: this.confidence,
      language: this.currentLanguage
    };
  }
  
  // Clear current transcript
  clearTranscript() {
    this.transcript = '';
    this.interimTranscript = '';
    this.confidence = 0;
  }
  
  // Check if a specific language is supported
  isLanguageSupported(languageCode) {
    return this.languageMap.hasOwnProperty(languageCode);
  }
  
  // Get the full language name
  getLanguageName(languageCode) {
    const names = {
      'hi': 'Hindi (हिंदी)',
      'ml': 'Malayalam (മലയാളം)',
      'ta': 'Tamil (தமிழ்)',
      'te': 'Telugu (తెలుగు)',
      'kn': 'Kannada (ಕನ್ನಡ)',
      'en': 'English',
      'bn': 'Bengali (বাংলা)',
      'gu': 'Gujarati (ગુજરાતી)',
      'mr': 'Marathi (मराठी)',
      'pa': 'Punjabi (ਪੰਜਾਬੀ)',
      'or': 'Odia (ଓଡ଼ିଆ)',
      'as': 'Assamese (অসমীয়া)'
    };
    return names[languageCode] || languageCode;
  }
}

export default new SpeechToTextService();
