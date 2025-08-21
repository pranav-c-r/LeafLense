import axios from 'axios';

// Agricultural AI service supporting multiple Indian languages
class AgriculturalAIService {
  constructor() {
    this.geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY;
    this.deepseekApiKey = import.meta.env.VITE_DEEPSEEK_API_KEY;
    this.weatherApiKey = import.meta.env.VITE_WEATHER_API_KEY;
    
    this.languageNames = {
      'hi': 'Hindi',
      'ml': 'Malayalam',
      'ta': 'Tamil', 
      'te': 'Telugu',
      'kn': 'Kannada',
      'en': 'English'
    };

    // Agricultural knowledge base prompts
    this.basePrompt = `You are an expert agricultural advisor specializing in Indian farming practices. 
    You have deep knowledge of:
    - Indian crops (rice, wheat, cotton, sugarcane, etc.)
    - Weather patterns and seasonal farming
    - Pest and disease management
    - Soil health and fertilizers
    - Irrigation techniques
    - Crop yields and market prices
    - Government schemes for farmers
    
    Always provide practical, actionable advice suitable for Indian farmers.
    Keep responses concise but informative.
    When discussing weather, mention specific timelines and probabilities.
    Include local agricultural practices when relevant.`;
  }

  // Get weather data for agricultural predictions
  async getWeatherData(location = 'Delhi', days = 7) {
    if (!this.weatherApiKey) {
      console.warn('Weather API key not configured, using mock data');
      return this.getMockWeatherData();
    }

    try {
      const response = await axios.get(
        `http://api.weatherapi.com/v1/forecast.json?key=${this.weatherApiKey}&q=${location}&days=${days}&aqi=no&alerts=yes`
      );
      return response.data;
    } catch (error) {
      console.error('Weather API error:', error);
      return this.getMockWeatherData();
    }
  }

  getMockWeatherData() {
    return {
      current: {
        temp_c: 28,
        humidity: 65,
        condition: { text: 'Partly cloudy' }
      },
      forecast: {
        forecastday: [
          {
            date: '2024-01-20',
            day: {
              maxtemp_c: 30,
              mintemp_c: 18,
              avghumidity: 65,
              daily_chance_of_rain: 80,
              condition: { text: 'Light rain' }
            }
          }
        ]
      }
    };
  }

  // Process agricultural query using Gemini AI
  async processWithGemini(query, language = 'hi', weatherData = null) {
    if (!this.geminiApiKey) {
      throw new Error('Gemini API key not configured');
    }

    const languageName = this.languageNames[language] || 'Hindi';
    let contextPrompt = `${this.basePrompt}\n\nRespond in ${languageName} language.`;
    
    if (weatherData) {
      contextPrompt += `\n\nCurrent weather context:
      Temperature: ${weatherData.current.temp_c}°C
      Humidity: ${weatherData.current.humidity}%
      Condition: ${weatherData.current.condition.text}
      Upcoming forecast: ${weatherData.forecast.forecastday[0]?.day.condition.text || 'Not available'}
      Rain probability: ${weatherData.forecast.forecastday[0]?.day.daily_chance_of_rain || 0}%`;
    }

    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${this.geminiApiKey}`,
        {
          contents: [{
            parts: [{
              text: `${contextPrompt}\n\nFarmer's question: ${query}\n\nProvide a helpful, practical response in ${languageName}.`
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        },
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      return response.data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error('Gemini 2.0 Flash API error:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }
      throw new Error('Failed to process query with Gemini 2.0 Flash AI');
    }
  }

  // Process agricultural query using DeepSeek (alternative)
  async processWithDeepSeek(query, language = 'hi', weatherData = null) {
    if (!this.deepseekApiKey) {
      throw new Error('DeepSeek API key not configured');
    }

    const languageName = this.languageNames[language] || 'Hindi';
    let contextPrompt = `${this.basePrompt}\n\nRespond in ${languageName} language.`;
    
    if (weatherData) {
      contextPrompt += `\n\nWeather context: ${JSON.stringify(weatherData.current, null, 2)}`;
    }

    try {
      const response = await axios.post(
        'https://api.deepseek.com/v1/chat/completions',
        {
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: contextPrompt
            },
            {
              role: 'user', 
              content: query
            }
          ],
          max_tokens: 500,
          temperature: 0.7
        },
        {
          headers: {
            'Authorization': `Bearer ${this.deepseekApiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('DeepSeek API error:', error);
      throw new Error('Failed to process query with DeepSeek AI');
    }
  }

  // Main method to process agricultural queries
  async processQuery(query, language = 'hi', location = 'Delhi', useGemini = true) {
    try {
      // Get weather data for context
      const weatherData = await this.getWeatherData(location);
      
      // Process with selected AI service
      let response;
      if (useGemini && this.geminiApiKey) {
        response = await this.processWithGemini(query, language, weatherData);
      } else if (this.deepseekApiKey) {
        response = await this.processWithDeepSeek(query, language, weatherData);
      } else {
        // Fallback to local processing
        response = await this.processLocally(query, language, weatherData);
      }

      return {
        response,
        weather: weatherData,
        language,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('AI processing error:', error);
      // Fallback to local processing
      return {
        response: await this.processLocally(query, language),
        weather: null,
        language,
        timestamp: new Date()
      };
    }
  }

  // Local fallback processing
  async processLocally(query, language = 'hi', weatherData = null) {
    const queryLower = query.toLowerCase();
    
    // Weather-related queries
    if (queryLower.includes('rain') || queryLower.includes('बारिश') || queryLower.includes('వర్షం')) {
      if (weatherData?.forecast?.forecastday[0]) {
        const rainChance = weatherData.forecast.forecastday[0].day.daily_chance_of_rain;
        const responses = {
          'hi': `हाँ, कल ${rainChance}% बारिश की संभावना है। ${rainChance > 70 ? 'सिंचाई न करें।' : 'हल्की सिंचाई कर सकते हैं।'}`,
          'en': `Yes, ${rainChance}% chance of rain tomorrow. ${rainChance > 70 ? 'Avoid irrigation.' : 'Light irrigation is okay.'}`
        };
        return responses[language] || responses.en;
      }
    }

    // Crop-related queries
    if (queryLower.includes('crop') || queryLower.includes('फसल') || queryLower.includes('పంట')) {
      const responses = {
        'hi': 'इस मौसम में गेहूं और सरसों की बुआई अच्छी होगी। मिट्टी की नमी बनाए रखें।',
        'en': 'This season is good for wheat and mustard sowing. Maintain soil moisture.'
      };
      return responses[language] || responses.en;
    }

    // Default response
    const responses = {
      'hi': 'मैं आपकी कृषि संबंधी समस्या को समझने की कोशिश कर रहा हूँ। कृपया अधिक विवरण दें।',
      'en': 'I am trying to understand your agricultural query. Please provide more details.'
    };
    return responses[language] || responses.en;
  }

  // Language detection for mixed queries
  detectLanguage(text) {
    // Simple language detection based on character patterns
    if (/[\u0900-\u097F]/.test(text)) return 'hi'; // Devanagari (Hindi)
    if (/[\u0D00-\u0D7F]/.test(text)) return 'ml'; // Malayalam
    if (/[\u0B80-\u0BFF]/.test(text)) return 'ta'; // Tamil
    if (/[\u0C00-\u0C7F]/.test(text)) return 'te'; // Telugu
    if (/[\u0C80-\u0CFF]/.test(text)) return 'kn'; // Kannada
    return 'en'; // Default to English
  }

  // Get crop recommendations based on location and season
  async getCropRecommendations(location, season, language = 'hi') {
    const weatherData = await this.getWeatherData(location);
    const query = `What crops should I grow in ${season} season?`;
    return this.processQuery(query, language, location);
  }

  // Get fertilizer recommendations
  async getFertilizerRecommendations(cropType, soilType, language = 'hi') {
    const query = `What fertilizer should I use for ${cropType} crop in ${soilType} soil?`;
    return this.processQuery(query, language);
  }
}

export default new AgriculturalAIService();
