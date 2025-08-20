# 🌾 Voice-Enabled Agricultural Assistant

## Overview

This project implements a comprehensive voice-enabled agricultural assistant that supports multiple Indian languages. It's designed specifically for Indian farmers who prefer voice interaction over text-based systems.

### 🎯 Problem Statement
Many farmers in India struggle with text-based agricultural advisory systems due to:
- Limited literacy in English
- Preference for voice communication in local languages
- Complex technical interfaces

### 🚀 Solution
A voice-enabled AI assistant that:
- Accepts voice input in Hindi, Malayalam, Tamil, Telugu, Kannada, and English
- Provides intelligent agricultural advice using AI (Gemini/DeepSeek)
- Responds with voice output in the user's preferred language
- Integrates real-time weather data for accurate recommendations

## 🏗️ Architecture

```
Voice Input → Speech-to-Text → Language Detection → AI Processing → Weather Integration → Text-to-Speech → Voice Output
```

### Core Components

1. **Speech-to-Text Service** (`speechToText.js`)
   - Web Speech API integration
   - Support for Indian language variants
   - Real-time transcription

2. **AI Service** (`aiService.js`)
   - Gemini AI & DeepSeek integration
   - Agricultural knowledge base
   - Weather-aware responses
   - Multi-language support

3. **Text-to-Speech Service** (`textToSpeech.js`)
   - Web Speech Synthesis API
   - Indian language voice support
   - Customizable speech parameters

4. **Voice Processor** (`voiceProcessor.js`)
   - Complete voice interaction pipeline
   - Error handling and fallbacks
   - State management

5. **Voice Chatbot Interface** (`VoiceChatbot.jsx`)
   - Farmer-friendly UI
   - Language selection
   - Live transcription display
   - Weather information display

## 🌐 Supported Languages

| Language | Code | Script | Example Query |
|----------|------|--------|---------------|
| Hindi | `hi` | Devanagari | कल बारिश होगी? |
| Tamil | `ta` | Tamil | நாளை மழை வருமா? |
| Telugu | `te` | Telugu | రేపు వర్షం వస్తుందా? |
| Malayalam | `ml` | Malayalam | നാളെ മഴ വരുമോ? |
| Kannada | `kn` | Kannada | ನಾಳೆ ಮಳೆ ಬರುತ್ತದೆಯೇ? |
| English | `en` | Latin | Will it rain tomorrow? |

## 🛠️ Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Create a `.env` file based on `.env.example`:

```bash
# Google Cloud APIs (Optional - for enhanced speech services)
VITE_GOOGLE_CLOUD_PROJECT_ID=your-project-id
VITE_GOOGLE_CLOUD_KEY_FILE=path-to-service-account-key.json

# AI APIs
VITE_GEMINI_API_KEY=your-gemini-api-key
VITE_DEEPSEEK_API_KEY=your-deepseek-api-key

# Weather API
VITE_WEATHER_API_KEY=your-weather-api-key

# Configuration
VITE_SUPPORTED_LANGUAGES=hi,ml,ta,te,kn,en
VITE_DEFAULT_LANGUAGE=hi
```

### 3. API Setup

#### Gemini AI API
1. Go to [Google AI Studio](https://makersuite.google.com/)
2. Create a new API key
3. Add to your `.env` file

#### Weather API
1. Sign up at [WeatherAPI.com](https://www.weatherapi.com/)
2. Get your free API key
3. Add to your `.env` file

#### DeepSeek API (Alternative)
1. Sign up at [DeepSeek](https://www.deepseek.com/)
2. Get your API key
3. Add to your `.env` file

### 4. Start Development Server

```bash
npm run dev
```

## 🎤 Usage Guide

### For Farmers

1. **Access the Voice Assistant**
   - Navigate to `/voice-chat` in your browser
   - Allow microphone permissions when prompted

2. **Select Your Language**
   - Click the settings icon
   - Choose your preferred language from the dropdown

3. **Ask Questions**
   - **Voice**: Click the microphone button and speak
   - **Text**: Type your question in the text box

4. **Receive Responses**
   - Get AI-powered agricultural advice
   - Hear responses in your selected language
   - View weather information when relevant

### Sample Questions

#### Hindi
- "कल बारिश होगी?" (Will it rain tomorrow?)
- "गेहूं की फसल कब काटूं?" (When to harvest wheat?)
- "मिट्टी में क्या खाद डालूं?" (What fertilizer for soil?)

#### Tamil
- "நாளை மழை வருமா?" (Will it rain tomorrow?)
- "நெல் பயிரை எப்போது அறுவடை செய்வது?" (When to harvest rice?)
- "மண்ணில் என்ன உரம் போட வேண்டும்?" (What fertilizer for soil?)

#### Telugu
- "రేపు వర్షం వస్తుందా?" (Will it rain tomorrow?)
- "వరి పంటను ఎప్పుడు కోయాలి?" (When to harvest rice?)
- "నేలలో ఏ ఎరువు వేయాలి?" (What fertilizer for soil?)

## 🧪 Testing

### Automated Testing

```javascript
import { VoiceAssistantTester } from './src/tests/voiceAssistantTest.js';

const tester = new VoiceAssistantTester();

// Run comprehensive tests
await tester.runTests();

// Test voice processor integration
await tester.testVoiceProcessor();
```

### Manual Testing

```javascript
import { demoVoiceAssistant } from './src/tests/voiceAssistantTest.js';

// Display demo information
demoVoiceAssistant();
```

### Browser Console Testing

Open browser console and run:

```javascript
// Test voice support
console.log('Voice supported:', voiceProcessor.isVoiceSupported());

// Test a query
await voiceProcessor.processTextQuery("कल बारिश होगी?", "hi");
```

## 🎯 Features

### Core Features
- ✅ Voice input in 6 Indian languages
- ✅ AI-powered agricultural advice
- ✅ Weather-integrated responses
- ✅ Voice output in selected language
- ✅ Text fallback for non-voice environments
- ✅ Real-time transcription display
- ✅ Language auto-detection
- ✅ Location-based weather data

### Advanced Features
- ✅ Offline fallback responses
- ✅ Error handling and recovery
- ✅ Performance optimization
- ✅ Mobile-responsive design
- ✅ Settings persistence
- ✅ Voice state indicators

## 📱 Browser Compatibility

| Browser | Speech Recognition | Speech Synthesis | Status |
|---------|-------------------|------------------|--------|
| Chrome | ✅ | ✅ | Fully Supported |
| Edge | ✅ | ✅ | Fully Supported |
| Firefox | ⚠️ | ✅ | Limited Support |
| Safari | ⚠️ | ✅ | Limited Support |

**Note**: For best experience, use Chrome or Edge browsers.

## 🔧 Technical Details

### Speech Recognition
- Uses Web Speech API
- Continuous listening with interim results
- Language-specific recognition models
- Confidence scoring

### AI Integration
- Gemini AI for intelligent responses
- DeepSeek as fallback
- Agricultural knowledge base prompts
- Context-aware responses

### Weather Integration
- Real-time weather data from WeatherAPI
- Location-based forecasts
- Agricultural weather patterns
- Rain probability for irrigation advice

### Voice Synthesis
- Web Speech Synthesis API
- Language-specific voices
- Adjustable speech parameters (rate, pitch, volume)
- Cross-platform compatibility

## 🔒 Privacy & Security

- **No Data Storage**: Voice data is processed in real-time and not stored
- **API Security**: API keys are environment-variable based
- **Local Processing**: Speech recognition happens in the browser
- **HTTPS Required**: Secure connection required for microphone access

## 🚨 Troubleshooting

### Common Issues

1. **Microphone Not Working**
   - Check browser permissions
   - Ensure HTTPS connection
   - Try refreshing the page

2. **Voice Recognition Inaccurate**
   - Speak clearly and slowly
   - Reduce background noise
   - Check language selection

3. **AI Responses Slow**
   - Check internet connection
   - Verify API keys are configured
   - Try text input as fallback

4. **Voice Output Not Working**
   - Check browser audio settings
   - Ensure volume is up
   - Try different browser

### Debug Mode

Enable debug logging:

```javascript
// In browser console
localStorage.setItem('voiceDebug', 'true');
```

## 🎯 Real-World Impact

### Target Users
- Small-scale farmers
- Agricultural workers
- Rural communities
- Agricultural extension workers

### Use Cases
- **Weather Queries**: "कल बारिश होगी?" → Get rain predictions with irrigation advice
- **Crop Management**: "गेहूं कब काटूं?" → Harvest timing recommendations
- **Disease Diagnosis**: "पत्तियां पीली हैं" → Disease identification and treatment
- **Fertilizer Advice**: "क्या खाद डालूं?" → NPK recommendations based on crop and soil
- **Government Schemes**: "योजना में कैसे आवेदन करूं?" → Application process guidance

### Expected Benefits
- 🌱 Improved crop yields through better timing
- 💧 Water conservation through weather-aware irrigation
- 🐛 Early pest/disease detection and treatment
- 💰 Cost savings through optimized fertilizer use
- 📚 Access to agricultural knowledge in native languages

## 🔮 Future Enhancements

### Phase 2 Features
- [ ] Offline voice processing with local models
- [ ] Image-based disease detection with voice description
- [ ] Market price integration
- [ ] SMS/WhatsApp integration for voice messages
- [ ] Farmer community features

### Phase 3 Features
- [ ] IoT sensor integration
- [ ] Predictive analytics
- [ ] Crop planning recommendations
- [ ] Financial advisory features
- [ ] Machine learning personalization

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Submit a pull request

### Testing New Languages
1. Add language queries to `testQueries` in `voiceAssistantTest.js`
2. Update language mappings in services
3. Test speech recognition and synthesis
4. Update documentation

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Indian Farmers**: For inspiring this solution
- **Google**: For Gemini AI and Speech APIs
- **WeatherAPI**: For weather data integration
- **Open Source Community**: For tools and libraries used

---

## 📞 Support

For technical support or questions:
- 📧 Email: support@leaflense.com
- 🐛 Issues: [GitHub Issues](https://github.com/your-repo/issues)
- 📖 Documentation: [Wiki](https://github.com/your-repo/wiki)

---

**Made with ❤️ for Indian Farmers**
