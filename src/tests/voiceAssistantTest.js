// Test suite for Voice-enabled Agricultural Assistant
// This file contains sample queries to test the system in various Indian languages

import voiceProcessor from '../services/voiceProcessor.js';
import aiService from '../services/aiService.js';

// Sample agricultural queries in different Indian languages
const testQueries = {
  // Hindi queries
  hindi: [
    "कल बारिश होगी?",
    "गेहूं की फसल कब काटनी चाहिए?",
    "मिट्टी में कौन सी खाद डालूं?",
    "टमाटर की पत्तियां पीली हो रही हैं, क्या करूं?",
    "धान की खेती के लिए कितना पानी चाहिए?",
    "कपास में कीड़े लग गए हैं, कैसे बचाऊं?",
    "इस साल मक्का की कीमत कैसी रहेगी?",
    "जैविक खाद कैसे बनाऊं?",
    "मौसम खराब है, क्या बुआई करूं?",
    "सरकारी योजना में कैसे आवेदन करूं?"
  ],

  // Tamil queries  
  tamil: [
    "நாளை மழை வருமா?",
    "நெல் பயிரை எப்போது அறுவடை செய்வது?",
    "மண்ணில் என்ன உரம் போட வேண்டும்?",
    "தக்காளி இலைகள் மஞ்சள் ஆகின்றன, என்ன செய்வது?",
    "நெல் பயிருக்கு எவ்வளவு தண்ணீர் தேவை?",
    "பருத்தியில் பூச்சிகள் தாக்கியுள்ளன, எப்படி காப்பாற்றுவது?",
    "இந்த ஆண்டு மக்காச்சோளம் விலை எப்படி இருக்கும்?",
    "இயற்கை உரம் எப்படி தயாரிப்பது?",
    "வானிலை மோசம், விதைப்பு செய்யலாமா?",
    "அரசு திட்டத்தில் எப்படி விண்ணப்பிப்பது?"
  ],

  // Telugu queries
  telugu: [
    "రేపు వర్షం వస్తుందా?",
    "వరి పంటను ఎప్పుడు కోయాలి?",
    "నేలలో ఏ ఎరువు వేయాలి?",
    "టమాటా ఆకులు పసుపు రంగులోకి మారుతున్నాయి, ఏమి చేయాలి?",
    "వరి పంటకు ఎంత నీరు అవసరం?",
    "పత్తిలో కీటకాలు దాడి చేశాయి, ఎలా కాపాడాలి?",
    "ఈ సంవత్సరం మొక్కజొన్న ధర ఎలా ఉంటుంది?",
    "సేంద్రీయ ఎరువు ఎలా తయారు చేయాలి?",
    "వాతావరణం చెడుగా ఉంది, విత్తనాలు వేయవచ్చా?",
    "ప్రభుత్వ పథకంలో ఎలా దరఖాస్తు చేయాలి?"
  ],

  // Malayalam queries
  malayalam: [
    "നാളെ മഴ വരുമോ?",
    "നെല്ല് വിള എപ്പോൾ വെട്ടണം?",
    "മണ്ണിൽ ഏത് വളം ഇടണം?",
    "തക്കാളി ഇലകൾ മഞ്ഞയായി മാറുന്നു, എന്ത് ചെയ്യണം?",
    "നെല്ല് വിളയ്ക്ക് എത്ര വെള്ളം വേണം?",
    "പരുത്തിയിൽ കീടങ്ങൾ ആക്രമിച്ചു, എങ്ങനെ രക്ഷിക്കാം?",
    "ഈ വർഷം ചോളത്തിന്റെ വില എങ്ങനെ ഇരിക്കും?",
    "ജൈവവളം എങ്ങനെ ഉണ്ടാക്കാം?",
    "കാലാവസ്ഥ മോശമാണ്, വിത്ത് വിതയ്ക്കാമോ?",
    "സർക്കാർ പദ്ധതിയിൽ എങ്ങനെ അപേക്ഷിക്കാം?"
  ],

  // Kannada queries
  kannada: [
    "ನಾಳೆ ಮಳೆ ಬರುತ್ತದೆಯೇ?",
    "ಅಕ್ಕಿ ಬೆಳೆಯನ್ನು ಯಾವಾಗ ಕೊಯ್ಯಬೇಕು?",
    "ಮಣ್ಣಿನಲ್ಲಿ ಯಾವ ಗೊಬ್ಬರ ಹಾಕಬೇಕು?",
    "ಟೊಮ್ಯಾಟೊ ಎಲೆಗಳು ಹಳದಿ ಆಗುತ್ತಿವೆ, ಏನು ಮಾಡಬೇಕು?",
    "ಅಕ್ಕಿ ಬೆಳೆಗೆ ಎಷ್ಟು ನೀರು ಬೇಕು?",
    "ಹತ್ತಿಯಲ್ಲಿ ಕೀಟಗಳು ದಾಳಿ ಮಾಡಿವೆ, ಹೇಗೆ ರಕ್ಷಿಸಬೇಕು?",
    "ಈ ವರ್ಷ ಮೆಕ್ಕೆ ಜೋಳದ ಬೆಲೆ ಹೇಗಿರುತ್ತದೆ?",
    "ಸಾವಯವ ಗೊಬ್ಬರ ಹೇಗೆ ತಯಾರಿಸಬೇಕು?",
    "ಹವಾಮಾನ ಕೆಟ್ಟಿದೆ, ಬಿತ್ತನೆ ಮಾಡಬಹುದೇ?",
    "ಸರ್ಕಾರಿ ಯೋಜನೆಯಲ್ಲಿ ಹೇಗೆ ಅರ್ಜಿ ಸಲ್ಲಿಸಬೇಕು?"
  ],

  // English queries for comparison
  english: [
    "Will it rain tomorrow?",
    "When should I harvest wheat crop?",
    "What fertilizer should I apply to soil?",
    "Tomato leaves are turning yellow, what to do?",
    "How much water does rice crop need?",
    "Cotton is attacked by insects, how to save?",
    "How will corn prices be this year?",
    "How to make organic fertilizer?",
    "Weather is bad, should I sow seeds?",
    "How to apply for government scheme?"
  ]
};

// Expected response patterns for validation
const expectedResponsePatterns = {
  weather: ['rain', 'बारिश', 'മഴ', 'వర్షం', 'மழை', 'ಮಳೆ', 'weather', 'मौसम'],
  harvest: ['harvest', 'काटना', 'വെട്ടാൻ', 'కోయాలి', 'அறுவடை', 'ಕೊಯ್ಯಬೇಕು'],
  fertilizer: ['fertilizer', 'खाद', 'വളം', 'ఎరువు', 'உரம்', 'ಗೊಬ್ಬರ', 'NPK', 'urea'],
  disease: ['disease', 'बीमारी', 'രോഗം', 'వ్యాధి', 'நோய்', 'ರೋಗ', 'yellow', 'पीला'],
  irrigation: ['water', 'पानी', 'വെള്ളം', 'నీరు', 'தண்ணீர்', 'ನೀರು', 'irrigation', 'सिंचाई'],
  pest: ['pest', 'कीट', 'കീടം', 'కీటకాలు', 'பூச்சி', 'ಕೀಟ', 'insect', 'pesticide'],
  price: ['price', 'कीमत', 'വില', 'ధర', 'விலை', 'ಬೆಲೆ', 'market', 'बाज़ार'],
  organic: ['organic', 'जैविक', 'ജൈവ', 'సేంద్రీయ', 'இயற்கை', 'ಸಾವಯವ', 'compost'],
  government: ['government', 'सरकार', 'സർക്കാർ', 'ప్రభుత్వ', 'அரசு', 'ಸರ್ಕಾರ', 'scheme', 'योजना']
};

// Test configuration
class VoiceAssistantTester {
  constructor() {
    this.testResults = [];
    this.passedTests = 0;
    this.totalTests = 0;
  }

  // Test individual query
  async testQuery(query, language, expectedCategory) {
    this.totalTests++;
    console.log(`\n🧪 Testing: "${query}" (${language})`);
    
    try {
      // Process query
      const startTime = Date.now();
      const result = await aiService.processQuery(query, language, 'Delhi');
      const processingTime = Date.now() - startTime;

      // Validate response
      const response = result.response.toLowerCase();
      const patterns = expectedResponsePatterns[expectedCategory] || [];
      const hasExpectedContent = patterns.some(pattern => 
        response.includes(pattern.toLowerCase())
      );

      // Check if response is in correct language (basic check)
      const isCorrectLanguage = this.validateLanguage(result.response, language);

      const testResult = {
        query,
        language,
        category: expectedCategory,
        response: result.response,
        weather: result.weather,
        processingTime,
        hasExpectedContent,
        isCorrectLanguage,
        passed: hasExpectedContent && isCorrectLanguage && processingTime < 10000
      };

      if (testResult.passed) {
        this.passedTests++;
        console.log(`✅ PASSED (${processingTime}ms)`);
      } else {
        console.log(`❌ FAILED - Expected: ${expectedCategory}, Processing time: ${processingTime}ms`);
      }

      console.log(`📝 Response: ${result.response.substring(0, 100)}...`);
      
      this.testResults.push(testResult);
      return testResult;

    } catch (error) {
      console.log(`❌ ERROR: ${error.message}`);
      this.testResults.push({
        query,
        language,
        category: expectedCategory,
        error: error.message,
        passed: false
      });
      return null;
    }
  }

  // Basic language validation
  validateLanguage(response, expectedLanguage) {
    const languagePatterns = {
      'hi': /[\u0900-\u097F]/,  // Devanagari
      'ta': /[\u0B80-\u0BFF]/,  // Tamil
      'te': /[\u0C00-\u0C7F]/,  // Telugu
      'ml': /[\u0D00-\u0D7F]/,  // Malayalam
      'kn': /[\u0C80-\u0CFF]/,  // Kannada
      'en': /^[A-Za-z\s\d\.,!?%()-]+$/ // English (basic)
    };

    const pattern = languagePatterns[expectedLanguage];
    return pattern ? pattern.test(response) : true;
  }

  // Run comprehensive tests
  async runTests() {
    console.log('🚀 Starting Voice Agricultural Assistant Tests\n');
    
    // Test categories mapping
    const categories = [
      'weather', 'harvest', 'fertilizer', 'disease', 'irrigation', 
      'pest', 'price', 'organic', 'weather', 'government'
    ];

    // Test each language
    for (const [language, queries] of Object.entries(testQueries)) {
      console.log(`\n🌍 Testing ${language.toUpperCase()} queries:`);
      console.log('='.repeat(50));

      for (let i = 0; i < queries.length && i < 5; i++) { // Test first 5 queries per language
        const query = queries[i];
        const category = categories[i];
        await this.testQuery(query, language === 'english' ? 'en' : language.substr(0, 2), category);
        
        // Small delay between tests
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    this.generateReport();
  }

  // Test voice processor integration
  async testVoiceProcessor() {
    console.log('\n🎤 Testing Voice Processor Integration:');
    console.log('='.repeat(50));

    // Test voice support detection
    console.log('Voice Support:', voiceProcessor.isVoiceSupported() ? '✅' : '❌');
    
    // Test language support
    const supportedLanguages = voiceProcessor.getSupportedLanguages();
    console.log('Supported Languages:', supportedLanguages.join(', '));

    // Test text processing (fallback)
    try {
      const testQuery = "कल बारिश होगी?";
      console.log(`\nTesting text processing: "${testQuery}"`);
      
      const result = await voiceProcessor.processTextQuery(testQuery, 'hi');
      console.log('✅ Text processing successful');
      
    } catch (error) {
      console.log('❌ Text processing failed:', error.message);
    }
  }

  // Generate test report
  generateReport() {
    console.log('\n📊 TEST REPORT');
    console.log('='.repeat(50));
    console.log(`Total Tests: ${this.totalTests}`);
    console.log(`Passed: ${this.passedTests}`);
    console.log(`Failed: ${this.totalTests - this.passedTests}`);
    console.log(`Success Rate: ${((this.passedTests / this.totalTests) * 100).toFixed(2)}%`);

    // Language-wise breakdown
    const languageStats = {};
    this.testResults.forEach(result => {
      if (!languageStats[result.language]) {
        languageStats[result.language] = { total: 0, passed: 0 };
      }
      languageStats[result.language].total++;
      if (result.passed) languageStats[result.language].passed++;
    });

    console.log('\n📈 Language-wise Results:');
    Object.entries(languageStats).forEach(([lang, stats]) => {
      const rate = ((stats.passed / stats.total) * 100).toFixed(2);
      console.log(`  ${lang}: ${stats.passed}/${stats.total} (${rate}%)`);
    });

    // Performance stats
    const responseTimes = this.testResults
      .filter(r => r.processingTime)
      .map(r => r.processingTime);
    
    if (responseTimes.length > 0) {
      const avgTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
      const maxTime = Math.max(...responseTimes);
      const minTime = Math.min(...responseTimes);
      
      console.log('\n⚡ Performance Stats:');
      console.log(`  Average Response Time: ${avgTime.toFixed(2)}ms`);
      console.log(`  Max Response Time: ${maxTime}ms`);
      console.log(`  Min Response Time: ${minTime}ms`);
    }

    // Failed tests details
    const failedTests = this.testResults.filter(r => !r.passed);
    if (failedTests.length > 0) {
      console.log('\n❌ Failed Tests:');
      failedTests.forEach(test => {
        console.log(`  - "${test.query}" (${test.language}) - ${test.error || 'Validation failed'}`);
      });
    }
  }
}

// Demo function for manual testing
export function demoVoiceAssistant() {
  console.log('🌾 Voice-enabled Agricultural Assistant Demo');
  console.log('='.repeat(50));
  console.log('Sample queries you can test:');
  
  Object.entries(testQueries).forEach(([language, queries]) => {
    console.log(`\n${language.toUpperCase()}:`);
    queries.slice(0, 3).forEach((query, index) => {
      console.log(`  ${index + 1}. ${query}`);
    });
  });
  
  console.log('\nTo test manually:');
  console.log('1. Go to /voice-chat page');
  console.log('2. Select your preferred language');
  console.log('3. Click the microphone button and speak');
  console.log('4. Or type your query in the text box');
  console.log('\nThe system will:');
  console.log('✓ Detect your language automatically');
  console.log('✓ Process your agricultural query');
  console.log('✓ Provide weather-aware responses');
  console.log('✓ Speak back in your selected language');
}

// Export test functions
export { VoiceAssistantTester, testQueries, expectedResponsePatterns };

// Auto-run demo if this file is executed directly
if (typeof window !== 'undefined') {
  window.demoVoiceAssistant = demoVoiceAssistant;
  window.VoiceAssistantTester = VoiceAssistantTester;
}
