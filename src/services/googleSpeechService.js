// Google Cloud Speech-to-Text service for enhanced Indian language recognition
import axios from 'axios';

class GoogleSpeechService {
  constructor() {
    this.apiKey = import.meta.env.VITE_GOOGLE_CLOUD_API_KEY;
    this.isInitialized = false;
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.isRecording = false;
    
    // Enhanced language mapping for Google Cloud Speech
    this.languageMap = {
      'hi': 'hi-IN',         // Hindi (India)
      'en': 'en-IN',         // English (India)  
      'ta': 'ta-IN',         // Tamil (India)
      'te': 'te-IN',         // Telugu (India)
      'ml': 'ml-IN',         // Malayalam (India)
      'kn': 'kn-IN',         // Kannada (India)
      'bn': 'bn-IN',         // Bengali (India)
      'gu': 'gu-IN',         // Gujarati (India)
      'mr': 'mr-IN',         // Marathi (India)
      'pa': 'pa-Guru-IN',    // Punjabi (India)
      'or': 'or-IN',         // Odia (India)
      'as': 'as-IN',         // Assamese (India)
      'ne': 'ne-NP',         // Nepali
      'si': 'si-LK',         // Sinhala (Sri Lanka)
      'ur': 'ur-PK'          // Urdu (Pakistan)
    };

    // Regional dialect support
    this.dialectMap = {
      'hi-IN': ['hi-IN'],
      'en-IN': ['en-IN', 'en-US', 'en-GB'],
      'ta-IN': ['ta-IN', 'ta-LK', 'ta-SG'],
      'te-IN': ['te-IN'],
      'ml-IN': ['ml-IN'],
      'kn-IN': ['kn-IN'],
      'bn-IN': ['bn-IN', 'bn-BD'],
      'gu-IN': ['gu-IN'],
      'mr-IN': ['mr-IN'],
      'pa-Guru-IN': ['pa-Guru-IN'],
      'or-IN': ['or-IN'],
      'as-IN': ['as-IN']
    };

    this.initialize();
  }

  async initialize() {
    if (!this.apiKey) {
      console.warn('Google Cloud API key not provided, Google Speech service will be unavailable');
      return;
    }

    try {
      // Test API key validity
      await this.testConnection();
      this.isInitialized = true;
      console.log('Google Speech service initialized successfully');
    } catch (error) {
      console.warn('Google Speech service initialization failed:', error);
    }
  }

  async testConnection() {
    if (!this.apiKey) {
      throw new Error('No API key provided');
    }

    // Simple test request to validate API key
    const testAudio = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=';
    
    try {
      await this.recognizeAudio(testAudio, 'en-IN', { maxAlternatives: 1 });
      return true;
    } catch (error) {
      if (error.response?.status === 403) {
        throw new Error('Invalid Google Cloud API key');
      }
      // Other errors might be expected for empty audio
      return true;
    }
  }

  async startRecording(language = 'hi', options = {}) {
    if (!this.isInitialized) {
      throw new Error('Google Speech service not initialized');
    }

    if (this.isRecording) {
      await this.stopRecording();
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });

      this.mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      this.audioChunks = [];
      this.isRecording = true;

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        
        try {
          // Convert to base64 for Google Cloud API
          const audioBase64 = await this.blobToBase64(audioBlob);
          const result = await this.recognizeAudio(audioBase64, language, options);
          
          if (options.onResult) {
            options.onResult(result);
          }
        } catch (error) {
          console.error('Speech recognition error:', error);
          if (options.onError) {
            options.onError(error);
          }
        }
      };

      this.mediaRecorder.start();

      if (options.onStart) {
        options.onStart();
      }

      // Auto-stop after specified duration or 30 seconds default
      const duration = options.duration || 30000;
      setTimeout(() => {
        if (this.isRecording) {
          this.stopRecording();
        }
      }, duration);

      return true;
    } catch (error) {
      console.error('Failed to start recording:', error);
      if (options.onError) {
        options.onError(error);
      }
      throw error;
    }
  }

  async stopRecording() {
    if (!this.isRecording || !this.mediaRecorder) {
      return false;
    }

    this.isRecording = false;
    this.mediaRecorder.stop();

    // Stop all tracks
    if (this.mediaRecorder.stream) {
      this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
    }

    return true;
  }

  async recognizeAudio(audioData, language = 'hi', options = {}) {
    if (!this.isInitialized || !this.apiKey) {
      throw new Error('Google Speech service not initialized');
    }

    const languageCode = this.languageMap[language] || 'hi-IN';
    
    // Prepare request body for Google Cloud Speech API
    const requestBody = {
      config: {
        encoding: 'WEBM_OPUS',
        sampleRateHertz: 16000,
        languageCode: languageCode,
        enableAutomaticPunctuation: true,
        enableWordTimeOffsets: true,
        enableWordConfidence: true,
        maxAlternatives: options.maxAlternatives || 3,
        profanityFilter: false,
        useEnhanced: true,
        model: 'latest_long', // Best model for longer audio
        
        // Alternative language codes for better recognition
        alternativeLanguageCodes: this.getAlternativeLanguages(languageCode),
        
        // Speech contexts for agricultural terms
        speechContexts: [{
          phrases: this.getAgriculturalPhrases(language),
          boost: 20.0
        }],

        // Audio channel count
        audioChannelCount: 1,
        enableSeparateRecognitionPerChannel: false,
        
        // Metadata for better results
        metadata: {
          recordingDeviceType: 'PC_MICROPHONE',
          recordingDeviceName: 'Web Browser',
          originalMediaType: 'AUDIO',
          interactionType: 'VOICE_SEARCH',
          microphoneDistance: 'NEARFIELD'
        }
      },
      audio: {
        content: audioData.split(',')[1] // Remove data:audio/webm;base64, prefix
      }
    };

    try {
      const response = await axios.post(
        `https://speech.googleapis.com/v1/speech:recognize?key=${this.apiKey}`,
        requestBody,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      return this.processRecognitionResponse(response.data, language);
    } catch (error) {
      console.error('Google Speech API error:', error);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      throw new Error('Failed to recognize speech with Google Cloud API');
    }
  }

  // Process and format the recognition response
  processRecognitionResponse(data, originalLanguage) {
    if (!data.results || data.results.length === 0) {
      return {
        transcript: '',
        confidence: 0,
        alternatives: [],
        language: originalLanguage,
        wordTimings: [],
        detectedLanguage: originalLanguage
      };
    }

    const result = data.results[0];
    const alternative = result.alternatives[0];

    // Extract word-level information
    const wordTimings = alternative.words ? alternative.words.map(word => ({
      word: word.word,
      startTime: parseFloat(word.startTime?.replace('s', '') || '0'),
      endTime: parseFloat(word.endTime?.replace('s', '') || '0'),
      confidence: word.confidence || 0
    })) : [];

    // Process all alternatives
    const alternatives = result.alternatives.map((alt, index) => ({
      transcript: alt.transcript,
      confidence: alt.confidence || 0,
      isTop: index === 0
    }));

    // Detect actual language used
    let detectedLanguage = originalLanguage;
    if (data.results[0].languageCode) {
      const detectedCode = data.results[0].languageCode;
      for (const [lang, code] of Object.entries(this.languageMap)) {
        if (code === detectedCode) {
          detectedLanguage = lang;
          break;
        }
      }
    }

    return {
      transcript: alternative.transcript || '',
      confidence: alternative.confidence || 0,
      alternatives: alternatives,
      language: detectedLanguage,
      originalLanguage: originalLanguage,
      wordTimings: wordTimings,
      detectedLanguage: detectedLanguage,
      totalBilledTime: data.totalBilledTime,
      requestId: data.requestId
    };
  }

  // Get alternative language codes for better recognition
  getAlternativeLanguages(primaryLanguage) {
    const alternatives = this.dialectMap[primaryLanguage] || [primaryLanguage];
    return alternatives.slice(1, 4); // Return up to 3 alternatives
  }

  // Get agricultural phrases for speech context
  getAgriculturalPhrases(language) {
    const phrases = {
      'hi': [
        'फसल', 'खेती', 'किसान', 'बारिश', 'मौसम', 'सिंचाई', 'खाद', 'बीज',
        'गेहूं', 'धान', 'मक्का', 'कपास', 'गन्ना', 'आलू', 'टमाटर', 'प्याज',
        'कीट', 'रोग', 'दवा', 'स्प्रे', 'हार्वेस्ट', 'बुआई', 'जुताई'
      ],
      'en': [
        'crop', 'farming', 'farmer', 'rain', 'weather', 'irrigation', 'fertilizer', 'seed',
        'wheat', 'rice', 'corn', 'cotton', 'sugarcane', 'potato', 'tomato', 'onion',
        'pest', 'disease', 'pesticide', 'spray', 'harvest', 'sowing', 'plowing'
      ],
      'ta': [
        'பயிர்', 'விவசாயம், 'விவசாயி', 'மழை', 'வானிலை', 'நீர்ப்பாசனம்', 'உரம்', 'விதை',
        'கோதுமை', 'நெல்', 'மக்காச்சோளம்', 'பருத்தி', 'கரும்பு', 'உருளைக்கிழங்கு', 'தக்காளி', 'வெங்காயம்'
      ],
      'te': [
        'పంట', 'వ్యవసాయం', 'రైతు', 'వర్షం', 'వాతావరణం', 'నీటిపారుదల', 'ఎరువు', 'విత్తనం',
        'గోధుమ', 'వరి', 'మొక్కజొన్న', 'పత్తి', 'చెరకు', 'బంగాళదుంప', 'టమాటా', 'ఉల్లిపాయ'
      ],
      'ml': [
        'വിള', 'കൃഷി', 'കർഷകൻ', 'മഴ', 'കാലാവസ്ഥ', 'ജലസേചനം', 'വളം', 'വിത്ത്',
        'ഗോതമ്പ്', 'നെല്ല്', 'ചോളം', 'പരുത്തി', 'കരിമ്പ്', 'ഉരുളക്കിഴങ്ങ്', 'തക്കാളി', 'സവാള'
      ],
      'kn': [
        'ಬೆಳೆ', 'ಕೃಷಿ', 'ರೈತ', 'ಮಳೆ', 'ಹವಾಮಾನ', 'ನೀರಾವರಿ', 'ಗೊಬ್ಬರ', 'ಬೀಜ',
        'ಗೋಧಿ', 'ಅಕ್ಕಿ', 'ಮೆಕ್ಕೆಜೋಳ', 'ಹತ್ತಿ', 'ಕಬ್ಬು', 'ಆಲೂಗೆಡ್ಡೆ', 'ಟೊಮ್ಯಾಟೊ', 'ಈರುಳ್ಳಿ'
      ]
    };

    return phrases[language] || phrases['en'];
  }

  // Convert Blob to base64
  async blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        resolve(result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  // Check if service is available
  isAvailable() {
    return this.isInitialized && !!this.apiKey;
  }

  // Get supported languages
  getSupportedLanguages() {
    return Object.keys(this.languageMap);
  }

  // Get language name
  getLanguageName(code) {
    const names = {
      'hi': 'Hindi (हिंदी)',
      'en': 'English',
      'ta': 'Tamil (தமிழ்)',
      'te': 'Telugu (తెలుగు)', 
      'ml': 'Malayalam (മലയാളം)',
      'kn': 'Kannada (ಕನ್ನಡ)',
      'bn': 'Bengali (বাংলা)',
      'gu': 'Gujarati (ગુજરાતી)',
      'mr': 'Marathi (मराठी)',
      'pa': 'Punjabi (ਪੰਜਾਬੀ)',
      'or': 'Odia (ଓଡ଼ିଆ)',
      'as': 'Assamese (অসমীয়া)',
      'ne': 'Nepali (नेपाली)',
      'si': 'Sinhala (සිංහල)',
      'ur': 'Urdu (اردو)'
    };
    
    return names[code] || code;
  }

  // Stream recognition (for real-time transcription)
  async startStreamRecognition(language = 'hi', options = {}) {
    if (!this.isInitialized) {
      throw new Error('Google Speech service not initialized');
    }

    // Note: Web streaming requires WebSocket connection to Google Cloud
    // This is a simplified implementation - full streaming requires server-side proxy
    console.warn('Stream recognition requires server-side implementation for production use');
    
    // For now, fall back to regular recording
    return this.startRecording(language, {
      ...options,
      duration: 5000 // Shorter chunks for pseudo-streaming
    });
  }

  // Clean up resources
  cleanup() {
    if (this.isRecording) {
      this.stopRecording();
    }
    
    this.audioChunks = [];
    this.mediaRecorder = null;
  }
}

export default new GoogleSpeechService();
