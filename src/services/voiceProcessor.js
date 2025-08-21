import speechToTextService from './speechToText.js';
import textToSpeechService from './textToSpeech.js';
import aiService from './aiService.js';

// Voice processing pipeline for agricultural queries
class VoiceProcessor {
  constructor() {
    this.isProcessing = false;
    this.currentLanguage = 'hi'; // Default to Hindi
    this.userLocation = 'Delhi'; // Default location
    this.onStateChange = null; // Callback for state changes
    this.onTranscription = null; // Callback for live transcription
    this.onResponse = null; // Callback for AI responses
    this.onError = null; // Callback for errors
  }

  // Set callbacks for different events
  setCallbacks({ onStateChange, onTranscription, onResponse, onError }) {
    this.onStateChange = onStateChange;
    this.onTranscription = onTranscription;
    this.onResponse = onResponse;
    this.onError = onError;
  }

  // Set current language
  setLanguage(language) {
    if (speechToTextService.getSupportedLanguages().includes(language)) {
      this.currentLanguage = language;
      console.log('Language set to:', language);
    } else {
      console.warn('Unsupported language:', language);
    }
  }

  // Set user location for weather context
  setLocation(location) {
    this.userLocation = location;
    console.log('Location set to:', location);
  }

  // Start voice interaction
  async startVoiceInteraction() {
    if (this.isProcessing) {
      console.log('Already processing, stopping current session');
      this.stopVoiceInteraction();
      return;
    }

    if (!speechToTextService.isSupported()) {
      const error = 'Speech recognition not supported in this browser';
      console.error(error);
      if (this.onError) this.onError(error);
      return;
    }

    this.isProcessing = true;
    if (this.onStateChange) this.onStateChange('listening');

    try {
      // Start listening for user's voice
      await speechToTextService.startListening(
        this.currentLanguage,
        this.handleSpeechResult.bind(this),
        this.handleSpeechError.bind(this),
        this.handleSpeechStart.bind(this),
        this.handleSpeechEnd.bind(this)
      );
    } catch (error) {
      console.error('Failed to start voice interaction:', error);
      this.isProcessing = false;
      if (this.onStateChange) this.onStateChange('idle');
      if (this.onError) this.onError(error.message);
    }
  }

  // Stop voice interaction
  stopVoiceInteraction() {
    speechToTextService.stopListening();
    textToSpeechService.stop();
    this.isProcessing = false;
    if (this.onStateChange) this.onStateChange('idle');
    console.log('Voice interaction stopped');
  }

  // Handle speech recognition results
  async handleSpeechResult(result) {
    console.log('Speech result:', result);
    
    // Update live transcription
    if (this.onTranscription) {
      this.onTranscription({
        text: result.transcript,
        confidence: result.confidence,
        isFinal: result.isFinal,
        language: result.language
      });
    }

    // Process final result
    if (result.isFinal) {
      const transcript = result.transcript.trim();
      if (transcript.length === 0) {
        console.log('Empty transcript, ignoring');
        return;
      }

      if (this.onStateChange) this.onStateChange('processing');
      
      try {
        // Auto-detect language if needed
        const detectedLanguage = aiService.detectLanguage(transcript);
        const processingLanguage = detectedLanguage !== 'en' ? detectedLanguage : this.currentLanguage;
        
        console.log('Processing query:', transcript, 'in language:', processingLanguage);
        
        // Process with AI service (uses Gemini 2.0 Flash by default)
        const aiResult = await aiService.processQuery(
          transcript, 
          processingLanguage, 
          this.userLocation,
          true // Explicitly use Gemini
        );

        console.log('AI response:', aiResult);

        // Update UI with response
        if (this.onResponse) {
          this.onResponse({
            query: transcript,
            response: aiResult.response,
            language: aiResult.language,
            weather: aiResult.weather,
            timestamp: aiResult.timestamp
          });
        }

        // Speak the response
        if (this.onStateChange) this.onStateChange('speaking');
        await this.speakResponse(aiResult.response, aiResult.language);

      } catch (error) {
        console.error('Error processing voice query:', error);
        const errorMessage = this.getErrorMessage(error, this.currentLanguage);
        
        if (this.onError) this.onError(errorMessage);
        
        // Speak error message
        if (this.onStateChange) this.onStateChange('speaking');
        await this.speakResponse(errorMessage, this.currentLanguage);
      } finally {
        this.isProcessing = false;
        if (this.onStateChange) this.onStateChange('idle');
      }
    }
  }

  // Handle speech recognition errors
  handleSpeechError(error) {
    console.error('Speech recognition error:', error);
    this.isProcessing = false;
    if (this.onStateChange) this.onStateChange('error');
    
    const errorMessage = this.getErrorMessage(error, this.currentLanguage);
    if (this.onError) this.onError(errorMessage);
  }

  // Handle speech recognition start
  handleSpeechStart() {
    console.log('Speech recognition started');
    if (this.onStateChange) this.onStateChange('listening');
  }

  // Handle speech recognition end
  handleSpeechEnd() {
    console.log('Speech recognition ended');
    // Don't change state here as we might be processing
  }

  // Speak response using TTS
  async speakResponse(text, language = null) {
    if (!textToSpeechService.isSupported()) {
      console.warn('Text-to-speech not supported');
      return;
    }

    const speakLanguage = language || this.currentLanguage;
    
    try {
      await textToSpeechService.speak(text, speakLanguage, {
        rate: 0.9,
        pitch: 1,
        volume: 1,
        onStart: () => {
          console.log('Started speaking response');
        },
        onEnd: () => {
          console.log('Finished speaking response');
          if (this.onStateChange) this.onStateChange('idle');
        },
        onError: (error) => {
          console.error('TTS error:', error);
          if (this.onStateChange) this.onStateChange('idle');
        }
      });
    } catch (error) {
      console.error('Failed to speak response:', error);
      if (this.onStateChange) this.onStateChange('idle');
    }
  }

  // Get localized error messages
  getErrorMessage(error, language) {
    const errorMessages = {
      'hi': {
        'no-speech': 'कोई आवाज नहीं सुनाई दी। कृपया दोबारा कोशिश करें।',
        'audio-capture': 'माइक्रोफोन की समस्या। कृपया अनुमति दें।',
        'not-allowed': 'माइक्रोफोन की अनुमति नहीं है। कृपया सेटिंग में अनुमति दें।',
        'network': 'इंटरनेट कनेक्शन की समस्या।',
        'default': 'कुछ गलत हुआ। कृपया दोबारा कोशिश करें।'
      },
      'en': {
        'no-speech': 'No speech detected. Please try again.',
        'audio-capture': 'Microphone issue. Please allow access.',
        'not-allowed': 'Microphone access denied. Please enable in settings.',
        'network': 'Network connection issue.',
        'default': 'Something went wrong. Please try again.'
      }
    };

    const messages = errorMessages[language] || errorMessages.en;
    
    if (typeof error === 'string') {
      return messages[error] || messages.default;
    }
    
    return messages.default;
  }

  // Process text query (fallback for when voice is not available)
  async processTextQuery(text, language = null) {
    const processingLanguage = language || this.currentLanguage;
    
    try {
      if (this.onStateChange) this.onStateChange('processing');
      
      const aiResult = await aiService.processQuery(
        text, 
        processingLanguage, 
        this.userLocation,
        true // Explicitly use Gemini
      );

      if (this.onResponse) {
        this.onResponse({
          query: text,
          response: aiResult.response,
          language: aiResult.language,
          weather: aiResult.weather,
          timestamp: aiResult.timestamp
        });
      }

      return aiResult;
    } catch (error) {
      console.error('Error processing text query:', error);
      if (this.onError) this.onError(this.getErrorMessage('default', processingLanguage));
      throw error;
    } finally {
      if (this.onStateChange) this.onStateChange('idle');
    }
  }

  // Check if voice features are supported
  isVoiceSupported() {
    return speechToTextService.isSupported() && textToSpeechService.isSupported();
  }

  // Get current state
  getState() {
    if (this.isProcessing) {
      if (speechToTextService.isListening) return 'listening';
      if (textToSpeechService.isSpeaking()) return 'speaking';
      return 'processing';
    }
    return 'idle';
  }

  // Get supported languages
  getSupportedLanguages() {
    return speechToTextService.getSupportedLanguages();
  }
}

export default new VoiceProcessor();
