import { useState, useRef, useEffect } from 'react'
import { Mic, MicOff, Volume2, VolumeX, Settings, MapPin, Languages, Sparkles, Loader2, User, Bot, MessageSquare, History, Zap, RefreshCw } from 'lucide-react'
import voiceProcessor from '../services/voiceProcessor'
import aiService from '../services/aiService'
import textToSpeechService from '../services/textToSpeech'
import TranscriptDisplay from '../components/TranscriptDisplay'
import transcriptLogger from '../services/transcriptLogger'
import googleSpeechService from '../services/googleSpeechService'

const VoiceChatbot = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: "नमस्ते! मैं आपका कृषि सहायक हूं। मैं हिंदी, तमिल, तेलुगू, मलयालम, कन्नड़ और अंग्रेजी में आपकी मदद कर सकता हूं। आप मुझसे बात करके या टाइप करके अपने सवाल पूछ सकते हैं।",
      timestamp: new Date(),
      language: 'hi'
    }
  ])
  
  const [input, setInput] = useState('')
  const [isVoiceMode, setIsVoiceMode] = useState(false)
  const [voiceState, setVoiceState] = useState('idle') // idle, listening, processing, speaking, error
  const [currentTranscription, setCurrentTranscription] = useState(null)
  const [selectedLanguage, setSelectedLanguage] = useState('hi')
  const [location, setLocation] = useState('Delhi')
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isTTSEnabled, setIsTTSEnabled] = useState(true)
  const [useGoogleSpeech, setUseGoogleSpeech] = useState(false)
  const [autoDetectLanguage, setAutoDetectLanguage] = useState(true)
  const [showTranscriptPanel, setShowTranscriptPanel] = useState(false)
  const [voiceSettings, setVoiceSettings] = useState({
    rate: 0.9,
    pitch: 1,
    volume: 1
  })
  
  const messagesEndRef = useRef(null)

  const languages = [
    { code: 'hi', name: 'हिंदी', englishName: 'Hindi' },
    { code: 'en', name: 'English', englishName: 'English' },
    { code: 'ta', name: 'தமிழ்', englishName: 'Tamil' },
    { code: 'te', name: 'తెలుగు', englishName: 'Telugu' },
    { code: 'ml', name: 'മലയാളം', englishName: 'Malayalam' },
    { code: 'kn', name: 'ಕನ್ನಡ', englishName: 'Kannada' },
    { code: 'bn', name: 'বাংলা', englishName: 'Bengali' },
    { code: 'gu', name: 'ગુજરાતી', englishName: 'Gujarati' },
    { code: 'mr', name: 'मराठी', englishName: 'Marathi' },
    { code: 'pa', name: 'ਪੰਜਾਬੀ', englishName: 'Punjabi' }
  ]

  // Sample questions in different languages
  const sampleQuestions = {
    'hi': [
      "कल बारिश होगी?",
      "गेहूं की फसल कैसी है?",
      "क्या खाद डालूं?",
      "कीट से बचाव कैसे करूं?",
      "फसल कब काटूं?"
    ],
    'en': [
      "Will it rain tomorrow?",
      "How is my wheat crop?",
      "What fertilizer to use?",
      "How to prevent pests?",
      "When to harvest crop?"
    ],
    'ta': [
      "நாளை மழை வருமா?",
      "கோதுமை பயிர் எப்படி உள்ளது?",
      "எந்த உரம் பயன்படுத்த வேண்டும்?",
      "பூச்சிகளை எப்படி தடுப்பது?",
      "பயிரை எப்போது அறுவடை செய்வது?"
    ],
    'te': [
      "రేపు వర్షం వస్తుందా?",
      "గోధుమ పంట ఎలా ఉంది?",
      "ఏ ఎరువు వాడాలి?",
      "కీటకాలను ఎలా నివారించాలి?",
      "పంటను ఎప్పుడు కోయాలి?"
    ],
    'ml': [
      "നാളെ മഴ വരുമോ?",
      "ഗോതമ്പ് വിള എങ്ങനെയുണ്ട്?",
      "എന്ത് വളം ഉപയോഗിക്കണം?",
      "കീടങ്ങളെ എങ്ങനെ തടയാം?",
      "വിള എപ്പോൾ വെട്ടണം?"
    ],
    'kn': [
      "ನಾಳೆ ಮಳೆ ಬರುತ್ತದೆಯೇ?",
      "ಗೋಧಿ ಬೆಳೆ ಹೇಗಿದೆ?",
      "ಯಾವ ಗೊಬ್ಬರ ಬಳಸಬೇಕು?",
      "ಕೀಟಗಳನ್ನು ಹೇಗೆ ತಡೆಯುವುದು?",
      "ಬೆಳೆಯನ್ನು ಯಾವಾಗ ಕೊಯ್ಯಬೇಕು?"
    ]
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // Initialize transcript logger session
    transcriptLogger.startSession('user', { location, preferredLanguage: selectedLanguage })
    
    // Initialize voice processor
    voiceProcessor.setCallbacks({
      onStateChange: (state) => {
        setVoiceState(state)
      },
      onTranscription: (transcription) => {
        setCurrentTranscription(transcription)
        
        // Log user input when final
        if (transcription.isFinal && transcription.transcript) {
          transcriptLogger.logUserInput(transcription)
        }
      },
      onResponse: (response) => {
        const userMessage = {
          id: messages.length,
          type: 'user',
          content: response.query,
          timestamp: response.timestamp,
          language: response.language
        }
        
        const botMessage = {
          id: messages.length + 1,
          type: 'bot',
          content: response.response,
          timestamp: response.timestamp,
          language: response.language,
          weather: response.weather,
          query: response.query
        }
        
        setMessages(prev => [...prev, userMessage, botMessage])
        setCurrentTranscription(null)
        
        // Log AI response
        transcriptLogger.logAIResponse(response, response.query)
        
        // Auto-switch language if detected different from selected
        if (autoDetectLanguage && response.language !== selectedLanguage) {
          console.log(`Auto-switching language from ${selectedLanguage} to ${response.language}`)
          setSelectedLanguage(response.language)
        }
      },
      onError: (error) => {
        console.error('Voice processor error:', error)
        setCurrentTranscription(null)
        
        // Log error
        transcriptLogger.logError(error, { component: 'voiceProcessor' })
        
        // Add error message
        const errorMessage = {
          id: messages.length + 1,
          type: 'bot',
          content: error,
          timestamp: new Date(),
          isError: true
        }
        setMessages(prev => [...prev, errorMessage])
      }
    })

    voiceProcessor.setLanguage(selectedLanguage)
    voiceProcessor.setLocation(location)

    return () => {
      voiceProcessor.stopVoiceInteraction()
      transcriptLogger.endSession()
    }
  }, [selectedLanguage, location, autoDetectLanguage])

  const toggleVoiceMode = async () => {
    if (isVoiceMode) {
      voiceProcessor.stopVoiceInteraction()
      setIsVoiceMode(false)
      setCurrentTranscription('')
    } else {
      if (voiceProcessor.isVoiceSupported()) {
        setIsVoiceMode(true)
        await voiceProcessor.startVoiceInteraction()
      } else {
        alert('Voice features are not supported in this browser. Please use Chrome or Edge.')
      }
    }
  }

  const handleTextSubmit = async () => {
    if (!input.trim()) return

    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      content: input,
      timestamp: new Date(),
      language: selectedLanguage
    }

    setMessages(prev => [...prev, userMessage])
    const queryText = input
    setInput('')
    setVoiceState('processing')

    try {
      // Process query directly with AI service
      const aiResponse = await aiService.processQuery(queryText, selectedLanguage, location)
      
      const botMessage = {
        id: messages.length + 2,
        type: 'bot',
        content: aiResponse.response,
        timestamp: aiResponse.timestamp,
        language: aiResponse.language,
        weather: aiResponse.weather
      }
      
      setMessages(prev => [...prev, botMessage])
      
      // Speak the response if TTS is enabled
      if (isTTSEnabled) {
        setVoiceState('speaking')
        try {
          await textToSpeechService.speak(aiResponse.response, selectedLanguage)
        } catch (ttsError) {
          console.error('TTS error:', ttsError)
        }
      }
    } catch (error) {
      console.error('Text query error:', error)
      const errorMessage = {
        id: messages.length + 2,
        type: 'bot',
        content: "I'm having trouble processing your request. Please try again.",
        timestamp: new Date(),
        isError: true
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setVoiceState('idle')
    }
  }

  const handleSampleQuestion = (question) => {
    setInput(question)
  }

  const getStateIcon = () => {
    switch (voiceState) {
      case 'listening':
        return <Mic className="h-6 w-6 text-red-400 animate-pulse" />
      case 'processing':
        return <Loader2 className="h-6 w-6 text-yellow-400 animate-spin" />
      case 'speaking':
        return <Volume2 className="h-6 w-6 text-blue-400 animate-bounce" />
      default:
        return <MicOff className="h-6 w-6 text-gray-400" />
    }
  }

  const getStateText = () => {
    const stateTexts = {
      'hi': {
        idle: 'बोलने के लिए दबाएं',
        listening: 'सुन रहा हूं...',
        processing: 'प्रोसेसिंग...',
        speaking: 'जवाब दे रहा हूं...',
        error: 'त्रुटि हुई है'
      },
      'en': {
        idle: 'Press to speak',
        listening: 'Listening...',
        processing: 'Processing...',
        speaking: 'Speaking...',
        error: 'Error occurred'
      }
    }
    return stateTexts[selectedLanguage]?.[voiceState] || stateTexts.en[voiceState] || 'Ready'
  }

  return (
    <div className="p-6 h-full flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">कृषि वॉइस असिस्टेंट</h1>
            <p className="text-slate-400">Voice-enabled Agricultural Assistant</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className="p-3 bg-slate-700/50 hover:bg-slate-600/50 rounded-lg transition-colors"
          >
            <Settings className="h-5 w-5 text-slate-300" />
          </button>
          
          {/* Voice Support Indicator */}
          <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
            voiceProcessor.isVoiceSupported() 
              ? 'bg-emerald-600/20 text-emerald-400' 
              : 'bg-red-600/20 text-red-400'
          }`}>
            {getStateIcon()}
            <span className="text-sm">{getStateText()}</span>
          </div>
        </div>
      </div>

      {/* Settings Panel */}
      {isSettingsOpen && (
        <div className="mb-6 p-4 bg-slate-800/40 backdrop-blur-sm rounded-xl border border-slate-700/50">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                <Languages className="inline h-4 w-4 mr-1" />
                भाषा / Language
              </label>
              <select
                value={selectedLanguage}
                onChange={(e) => {
                  setSelectedLanguage(e.target.value)
                  voiceProcessor.setLanguage(e.target.value)
                }}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
              >
                {languages.map(lang => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name} ({lang.englishName})
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                <MapPin className="inline h-4 w-4 mr-1" />
                स्थान / Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => {
                  setLocation(e.target.value)
                  voiceProcessor.setLocation(e.target.value)
                }}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                placeholder="Enter your location"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                <Volume2 className="inline h-4 w-4 mr-1" />
                आवाज / Voice Output
              </label>
              <button
                onClick={() => setIsTTSEnabled(!isTTSEnabled)}
                className={`w-full px-3 py-2 rounded-lg font-medium transition-colors ${
                  isTTSEnabled 
                    ? 'bg-emerald-600 text-white' 
                    : 'bg-slate-700 text-slate-300'
                }`}
              >
                {isTTSEnabled ? 'चालू / ON' : 'बंद / OFF'}
              </button>
            </div>
          </div>
          
          {/* Advanced Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-700/50">
            <div>
              <label className="flex items-center space-x-2 text-sm text-slate-300">
                <input
                  type="checkbox"
                  checked={autoDetectLanguage}
                  onChange={(e) => setAutoDetectLanguage(e.target.checked)}
                  className="rounded bg-slate-700 border-slate-600 text-emerald-600 focus:ring-emerald-500"
                />
                <span>स्वतः भाषा पहचानें / Auto-detect Language</span>
              </label>
            </div>
            
            <div>
              <label className="flex items-center space-x-2 text-sm text-slate-300">
                <input
                  type="checkbox"
                  checked={useGoogleSpeech}
                  onChange={(e) => setUseGoogleSpeech(e.target.checked)}
                  className="rounded bg-slate-700 border-slate-600 text-emerald-600 focus:ring-emerald-500"
                  disabled={!googleSpeechService.isAvailable()}
                />
                <span>
                  Google Speech API {!googleSpeechService.isAvailable() && '(Not Available)'}
                </span>
              </label>
            </div>
            
            <div>
              <button
                onClick={() => setShowTranscriptPanel(!showTranscriptPanel)}
                className={`w-full px-3 py-2 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 ${
                  showTranscriptPanel 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                <MessageSquare className="h-4 w-4" />
                <span>Live Transcript</span>
              </button>
            </div>
            
            <div>
              <button
                onClick={() => {
                  const analytics = transcriptLogger.getAnalytics()
                  console.log('Voice Analytics:', analytics)
                  alert(`Conversations: ${analytics.totalConversations}\nMessages: ${analytics.totalMessages}\nAvg Confidence: ${(analytics.averageConfidence * 100).toFixed(1)}%`)
                }}
                className="w-full px-3 py-2 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 bg-slate-700 text-slate-300 hover:bg-slate-600"
              >
                <History className="h-4 w-4" />
                <span>Analytics</span>
              </button>
            </div>
          </div>
          
          {/* Voice Settings */}
          <div className="pt-4 border-t border-slate-700/50 mt-4">
            <h4 className="text-sm font-medium text-slate-300 mb-3">Voice Settings</h4>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Speed</label>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={voiceSettings.rate}
                  onChange={(e) => setVoiceSettings({...voiceSettings, rate: parseFloat(e.target.value)})}
                  className="w-full accent-emerald-500"
                />
                <span className="text-xs text-slate-500">{voiceSettings.rate}x</span>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Pitch</label>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={voiceSettings.pitch}
                  onChange={(e) => setVoiceSettings({...voiceSettings, pitch: parseFloat(e.target.value)})}
                  className="w-full accent-emerald-500"
                />
                <span className="text-xs text-slate-500">{voiceSettings.pitch}x</span>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Volume</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={voiceSettings.volume}
                  onChange={(e) => setVoiceSettings({...voiceSettings, volume: parseFloat(e.target.value)})}
                  className="w-full accent-emerald-500"
                />
                <span className="text-xs text-slate-500">{Math.round(voiceSettings.volume * 100)}%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Transcript Panel */}
      {showTranscriptPanel && (
        <div className="mb-4">
          <TranscriptDisplay
            currentTranscript={currentTranscription}
            isListening={voiceState === 'listening'}
            isSpeaking={voiceState === 'speaking'}
            onExportTranscript={(data) => {
              console.log('Exported transcript data:', data)
            }}
            className="max-h-64"
          />
        </div>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-slate-800/40 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden">
        
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start space-x-3 ${
                message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                message.type === 'bot' 
                  ? message.isError 
                    ? 'bg-red-500'
                    : 'bg-gradient-to-br from-emerald-500 to-emerald-600'
                  : 'bg-gradient-to-br from-blue-500 to-purple-600'
              }`}>
                {message.type === 'bot' ? (
                  <Bot className="h-5 w-5 text-white" />
                ) : (
                  <User className="h-5 w-5 text-white" />
                )}
              </div>
              
              <div className={`max-w-md ${message.type === 'user' ? 'text-right' : ''}`}>
                <div className={`inline-block px-4 py-3 rounded-2xl ${
                  message.type === 'bot'
                    ? message.isError
                      ? 'bg-red-600/20 text-red-200'
                      : 'bg-slate-700/50 text-slate-100'
                    : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                }`}>
                  <p className="text-sm leading-relaxed">{message.content}</p>
                  
                  {/* Weather info for bot responses */}
                  {message.weather && (
                    <div className="mt-2 pt-2 border-t border-slate-600/50">
                      <p className="text-xs text-slate-400">
                        🌡️ {message.weather.current.temp_c}°C | 
                        💧 {message.weather.current.humidity}% | 
                        ☁️ {message.weather.current.condition.text}
                      </p>
                    </div>
                  )}
                </div>
                
                <p className="text-xs text-slate-500 mt-1">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  {message.language && ` • ${languages.find(l => l.code === message.language)?.englishName}`}
                </p>
              </div>
            </div>
          ))}
          
          {/* Live transcription */}
          {currentTranscription && !showTranscriptPanel && (
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 rounded-full bg-slate-600 flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
              <div className="bg-slate-700/30 border border-slate-600/50 rounded-2xl px-4 py-3 max-w-md">
                <div className="space-y-2">
                  {currentTranscription.interimTranscript && (
                    <p className="text-sm text-slate-300 italic">
                      {currentTranscription.interimTranscript}...
                    </p>
                  )}
                  {currentTranscription.finalTranscript && (
                    <div className="bg-emerald-600/10 border border-emerald-600/30 rounded p-2">
                      <p className="text-sm text-white font-medium">
                        {currentTranscription.finalTranscript}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs text-emerald-400">
                          {Math.round((currentTranscription.confidence || 0) * 100)}% confidence
                        </span>
                        {currentTranscription.detectedLanguage && currentTranscription.detectedLanguage !== selectedLanguage && (
                          <span className="text-xs text-yellow-400">
                            Detected: {languages.find(l => l.code === currentTranscription.detectedLanguage)?.englishName}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Voice Control Section */}
        <div className="p-6 border-t border-slate-700/50 bg-slate-800/20">
          
          {/* Voice Button */}
          <div className="flex justify-center mb-4">
            <button
              onClick={toggleVoiceMode}
              disabled={voiceState === 'processing' || voiceState === 'speaking'}
              className={`w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-lg transition-all transform hover:scale-105 disabled:scale-100 ${
                isVoiceMode
                  ? voiceState === 'listening'
                    ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                    : voiceState === 'processing'
                    ? 'bg-yellow-500 animate-pulse'
                    : voiceState === 'speaking'
                    ? 'bg-blue-500 animate-bounce'
                    : 'bg-emerald-500 hover:bg-emerald-600'
                  : 'bg-slate-600 hover:bg-slate-500'
              } disabled:cursor-not-allowed shadow-lg`}
            >
              {getStateIcon()}
            </button>
          </div>
          
          <p className="text-center text-sm text-slate-400 mb-4">
            {getStateText()}
          </p>

          {/* Sample Questions */}
          {messages.length <= 1 && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-slate-300 mb-3 text-center">
                नमूना प्रश्न / Sample Questions:
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {sampleQuestions[selectedLanguage]?.slice(0, 4).map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleSampleQuestion(question)}
                    className="text-xs px-3 py-2 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 rounded-lg transition-colors text-left"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Text Input */}
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleTextSubmit()
                  }
                }}
                placeholder={selectedLanguage === 'hi' ? "यहाँ अपना सवाल लिखें..." : "Type your question here..."}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 input-focus resize-none"
                rows={1}
                disabled={voiceState === 'processing' || voiceState === 'speaking'}
              />
            </div>
            
            <button
              onClick={handleTextSubmit}
              disabled={!input.trim() || voiceState === 'processing' || voiceState === 'speaking'}
              className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 disabled:from-slate-600 disabled:to-slate-700 text-white rounded-lg transition-all disabled:cursor-not-allowed"
            >
              भेजें / Send
            </button>
          </div>
          
          <p className="text-xs text-slate-500 mt-2 text-center">
            Voice: Click the microphone • Text: Type and press Enter
          </p>
        </div>
      </div>
    </div>
  )
}

export default VoiceChatbot
