# Enhanced Voice Assistant for Indian Languages

## Overview

Your LeafLense voice assistant has been significantly enhanced to provide comprehensive support for local Indian languages with advanced transcription capabilities. The system now offers a professional-grade multilingual voice interface for agricultural queries.

## 🚀 New Features

### 1. Enhanced Speech Recognition (`speechToText.js`)
- **Extended Language Support**: Added support for 12+ Indian languages including Bengali, Gujarati, Marathi, Punjabi, Odia, and Assamese
- **Auto Language Detection**: Automatically detects the spoken language using Unicode character patterns
- **Alternative Transcriptions**: Provides multiple recognition alternatives with confidence scores
- **Improved Accuracy**: Better voice recognition parameters for Indian accents and dialects

### 2. Real-time Transcript Display (`TranscriptDisplay.jsx`)
- **Live Transcription**: Shows real-time speech-to-text conversion with interim and final results
- **Confidence Indicators**: Visual confidence scores with color-coded feedback
- **Language Detection**: Shows detected vs. selected language mismatches
- **Conversation History**: Exportable conversation logs with timestamps
- **Alternative Recognition**: Display multiple recognition options for unclear speech

### 3. Advanced Transcript Logging (`transcriptLogger.js`)
- **Session Management**: Tracks conversation sessions with metadata
- **Comprehensive Logging**: Records user inputs, AI responses, TTS playback, and errors
- **Analytics Dashboard**: Provides detailed conversation analytics and statistics
- **Export Functionality**: Export transcripts in JSON, CSV, and TXT formats
- **Data Persistence**: Automatic cleanup of old conversations (30-day retention)

### 4. Google Cloud Speech Integration (`googleSpeechService.js`)
- **Premium Recognition**: Google Cloud Speech-to-Text API integration for higher accuracy
- **Agricultural Context**: Custom speech contexts for farming terminology
- **Regional Dialects**: Support for Indian regional dialect variations
- **Word-level Timestamps**: Detailed timing information for each recognized word
- **Enhanced Audio Processing**: Professional audio preprocessing for better results

### 5. Improved Text-to-Speech (`textToSpeech.js`)
- **Voice Quality Scoring**: Automatic selection of the best available voice for each language
- **Voice Preferences**: User-selectable voice preferences with quality indicators
- **Gender Preferences**: Language-specific optimal voice gender selection
- **Provider Detection**: Recognizes and prioritizes premium voice providers (Google, Microsoft, etc.)
- **Voice Testing**: Built-in voice quality testing with sample phrases

### 6. Advanced Voice Settings
- **Auto Language Switching**: Automatically switches language based on speech detection
- **Voice Customization**: Adjustable speech rate, pitch, and volume controls
- **Provider Selection**: Option to use Google Cloud Speech vs. browser APIs
- **Real-time Settings**: Live transcript panel with conversation analytics

## 🌏 Supported Languages

| Language | Code | Script | Status |
|----------|------|--------|---------|
| Hindi | `hi` | Devanagari | ✅ Full Support |
| English | `en` | Latin | ✅ Full Support |
| Tamil | `ta` | Tamil | ✅ Full Support |
| Telugu | `te` | Telugu | ✅ Full Support |
| Malayalam | `ml` | Malayalam | ✅ Full Support |
| Kannada | `kn` | Kannada | ✅ Full Support |
| Bengali | `bn` | Bengali | ✅ Enhanced |
| Gujarati | `gu` | Gujarati | ✅ Enhanced |
| Marathi | `mr` | Devanagari | ✅ Enhanced |
| Punjabi | `pa` | Gurmukhi | ✅ Enhanced |
| Odia | `or` | Odia | ✅ Enhanced |
| Assamese | `as` | Bengali | ✅ Enhanced |

## 🎯 Key Improvements for Indian Users

### Agricultural Terminology
- **Farming Vocabulary**: Enhanced recognition for Indian agricultural terms
- **Regional Crops**: Better understanding of local crop names and farming practices
- **Weather Context**: Improved weather-related query processing
- **Local Knowledge**: Context-aware responses based on Indian farming practices

### User Experience
- **Bilingual Interface**: Seamless switching between local languages and English
- **Cultural Context**: UI elements and prompts in local languages
- **Voice Feedback**: Audio responses in the user's preferred language
- **Error Handling**: Localized error messages and fallback options

## 🔧 Setup and Configuration

### Environment Variables
Add these to your `.env` file:
```env
VITE_GOOGLE_CLOUD_API_KEY=your_google_cloud_api_key
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_WEATHER_API_KEY=your_weather_api_key
```

### Google Cloud Setup
1. Create a Google Cloud project
2. Enable Speech-to-Text API
3. Create service account credentials
4. Set `VITE_GOOGLE_CLOUD_API_KEY` environment variable

### Dependencies
The following packages are already included in your project:
- `@google-cloud/speech`: ^6.7.0
- `@google-cloud/text-to-speech`: ^5.4.0
- `react-speech-recognition`: ^3.10.0

## 📱 User Interface Features

### Main Chat Interface
- **Voice Button**: Large, animated microphone button with status indicators
- **Live Transcription**: Real-time display of speech recognition
- **Language Switching**: Quick language selection with auto-detection
- **Confidence Display**: Visual confidence scores for recognition accuracy

### Settings Panel
- **Language Selection**: Support for 10+ Indian languages
- **Location Settings**: Weather-aware agricultural advice
- **Voice Controls**: Speech rate, pitch, and volume adjustments
- **Advanced Options**: Google Speech API toggle, auto-detect language

### Transcript Panel
- **Live Transcription**: Real-time speech-to-text display
- **History Management**: Conversation history with export options
- **Analytics**: Usage statistics and confidence metrics
- **Export Options**: JSON, CSV, and TXT format downloads

## 🔍 Advanced Features

### Language Detection
```javascript
// Automatic language detection from speech patterns
const detectedLanguage = speechToTextService.detectLanguageFromText(transcript);
if (autoDetectLanguage && detectedLanguage !== selectedLanguage) {
  // Auto-switch to detected language
  setSelectedLanguage(detectedLanguage);
}
```

### Voice Quality Selection
```javascript
// Automatic selection of best available voice
const bestVoice = textToSpeechService.getVoiceForLanguage('hi');
// Voice quality scoring based on provider and features
const qualityScore = textToSpeechService.calculateVoiceQuality(voice, 'hi');
```

### Conversation Analytics
```javascript
// Get detailed conversation analytics
const analytics = transcriptLogger.getAnalytics();
console.log(`Conversations: ${analytics.totalConversations}`);
console.log(`Average Confidence: ${analytics.averageConfidence * 100}%`);
console.log(`Languages Used: ${Object.keys(analytics.languageBreakdown)}`);
```

## 🎮 Usage Examples

### Basic Voice Interaction
1. Click the microphone button
2. Speak your agricultural question in any supported language
3. View real-time transcription with confidence scores
4. Receive AI response with text-to-speech output
5. Switch languages seamlessly during conversation

### Advanced Features
1. Enable "Live Transcript" panel for detailed transcription view
2. Use "Auto-detect Language" for multilingual conversations
3. Access "Analytics" to view conversation statistics
4. Export conversation transcripts for record keeping

## 🛡️ Error Handling

The system includes comprehensive error handling:
- **Network Issues**: Fallback to local processing
- **Speech Recognition Failures**: Multiple retry attempts
- **Language Mismatches**: Auto-correction suggestions
- **Voice Synthesis Errors**: Silent fallback options

## 📊 Performance Optimizations

- **Lazy Loading**: Components loaded only when needed
- **Caching**: Voice preferences and settings cached locally
- **Cleanup**: Automatic removal of old conversation data
- **Batching**: Efficient transcript logging and storage

## 🔮 Future Enhancements

Potential future improvements:
- **Real-time Streaming**: WebSocket-based streaming recognition
- **Voice Training**: User-specific voice model adaptation
- **Offline Mode**: Local speech processing capabilities
- **Multi-speaker**: Support for multiple speakers in conversation
- **Voice Commands**: System control through voice commands

## 🐛 Troubleshooting

### Common Issues
1. **Microphone Access**: Ensure browser permissions are granted
2. **Voice Quality**: Check internet connection for cloud services
3. **Language Detection**: Verify clear pronunciation and audio quality
4. **API Keys**: Ensure all environment variables are properly set

### Browser Compatibility
- **Recommended**: Chrome 88+, Edge 88+, Firefox 85+
- **Voice Features**: Chrome and Edge provide best speech recognition
- **Fallbacks**: Graceful degradation for unsupported browsers

## 📝 API Documentation

### Core Services
- `speechToTextService`: Enhanced speech recognition with Indian language support
- `textToSpeechService`: Advanced text-to-speech with voice quality selection
- `transcriptLogger`: Comprehensive conversation logging and analytics
- `googleSpeechService`: Premium Google Cloud Speech integration

### React Components
- `VoiceChatbot`: Main chat interface with enhanced multilingual support
- `TranscriptDisplay`: Real-time transcription panel with export features

This enhanced voice assistant provides a professional-grade multilingual experience specifically tailored for Indian agricultural users, with comprehensive transcription capabilities and seamless language switching.
