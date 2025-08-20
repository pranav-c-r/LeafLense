// Speech-to-Text service supporting Indian languages
class SpeechToTextService {
  constructor() {
    this.recognition = null;
    this.isListening = false;
    this.languageMap = {
      'hi': 'hi-IN',    // Hindi
      'ml': 'ml-IN',    // Malayalam  
      'ta': 'ta-IN',    // Tamil
      'te': 'te-IN',    // Telugu
      'kn': 'kn-IN',    // Kannada
      'en': 'en-IN'     // English (Indian)
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
    
    this.recognition.continuous = false;
    this.recognition.interimResults = true;
    this.recognition.maxAlternatives = 1;
  }

  async startListening(language = 'hi', onResult, onError, onStart, onEnd) {
    if (!this.recognition) {
      const error = 'Speech recognition not available';
      console.error(error);
      if (onError) onError(error);
      return;
    }

    if (this.isListening) {
      this.stopListening();
    }

    this.recognition.lang = this.languageMap[language] || 'hi-IN';
    this.isListening = true;

    this.recognition.onstart = () => {
      console.log('Speech recognition started');
      if (onStart) onStart();
    };

    this.recognition.onresult = (event) => {
      const result = event.results[event.results.length - 1];
      const transcript = result[0].transcript;
      const confidence = result[0].confidence;
      
      console.log('Speech recognized:', transcript, 'Confidence:', confidence);
      
      if (onResult) {
        onResult({
          transcript,
          confidence,
          isFinal: result.isFinal,
          language: language
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
}

export default new SpeechToTextService();
