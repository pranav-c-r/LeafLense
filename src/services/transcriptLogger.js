// Enhanced transcript logging service for voice assistant conversations
class TranscriptLogger {
  constructor() {
    this.conversations = new Map();
    this.currentSessionId = null;
    this.storageKey = 'voice_assistant_transcripts';
    this.maxHistoryDays = 30; // Keep logs for 30 days
    this.maxConversationsPerDay = 100;
    
    this.initializeStorage();
  }

  // Initialize storage and load existing conversations
  initializeStorage() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const data = JSON.parse(stored);
        // Convert plain objects back to Map
        if (data.conversations) {
          this.conversations = new Map(Object.entries(data.conversations));
        }
        // Clean up old conversations
        this.cleanupOldConversations();
      }
    } catch (error) {
      console.warn('Error loading transcript history:', error);
      this.conversations = new Map();
    }
  }

  // Start a new conversation session
  startSession(userId = 'anonymous', metadata = {}) {
    this.currentSessionId = this.generateSessionId();
    
    const session = {
      id: this.currentSessionId,
      userId,
      startTime: new Date(),
      endTime: null,
      messages: [],
      metadata: {
        userAgent: navigator.userAgent,
        language: navigator.language,
        location: metadata.location || 'Unknown',
        ...metadata
      },
      stats: {
        totalMessages: 0,
        totalUserMessages: 0,
        totalBotMessages: 0,
        averageConfidence: 0,
        languagesUsed: new Set(),
        conversationDuration: 0
      }
    };

    this.conversations.set(this.currentSessionId, session);
    this.saveToStorage();
    
    console.log('Started new conversation session:', this.currentSessionId);
    return this.currentSessionId;
  }

  // End current conversation session
  endSession() {
    if (!this.currentSessionId || !this.conversations.has(this.currentSessionId)) {
      return null;
    }

    const session = this.conversations.get(this.currentSessionId);
    session.endTime = new Date();
    session.stats.conversationDuration = session.endTime - session.startTime;
    
    // Calculate final stats
    if (session.messages.length > 0) {
      const confidenceValues = session.messages
        .filter(msg => msg.confidence !== undefined)
        .map(msg => msg.confidence);
      
      if (confidenceValues.length > 0) {
        session.stats.averageConfidence = 
          confidenceValues.reduce((a, b) => a + b, 0) / confidenceValues.length;
      }
    }

    // Convert Set to Array for JSON serialization
    session.stats.languagesUsed = Array.from(session.stats.languagesUsed);
    
    this.saveToStorage();
    
    const sessionId = this.currentSessionId;
    this.currentSessionId = null;
    
    console.log('Ended conversation session:', sessionId, 'Duration:', session.stats.conversationDuration + 'ms');
    return sessionId;
  }

  // Log a user input message
  logUserInput(transcript, metadata = {}) {
    if (!this.currentSessionId) {
      this.startSession();
    }

    const message = {
      id: this.generateMessageId(),
      sessionId: this.currentSessionId,
      type: 'user_input',
      timestamp: new Date(),
      content: {
        transcript: transcript.finalTranscript || transcript.transcript || '',
        interimTranscript: transcript.interimTranscript || '',
        confidence: transcript.confidence || 0,
        language: transcript.language || 'unknown',
        alternatives: transcript.alternatives || []
      },
      metadata: {
        recognitionMethod: 'browser_speech_api',
        processingTime: metadata.processingTime || 0,
        ...metadata
      }
    };

    this.addMessageToSession(message);
    return message.id;
  }

  // Log an AI response
  logAIResponse(response, query, metadata = {}) {
    if (!this.currentSessionId) {
      this.startSession();
    }

    const message = {
      id: this.generateMessageId(),
      sessionId: this.currentSessionId,
      type: 'ai_response',
      timestamp: new Date(),
      content: {
        response: response.response || response,
        query: query,
        language: response.language || metadata.language || 'unknown',
        weather: response.weather || null
      },
      metadata: {
        aiService: metadata.aiService || 'unknown',
        processingTime: metadata.processingTime || 0,
        tokensUsed: metadata.tokensUsed || 0,
        ...metadata
      }
    };

    this.addMessageToSession(message);
    return message.id;
  }

  // Log TTS playback
  logTTSPlayback(text, language, metadata = {}) {
    if (!this.currentSessionId) return null;

    const message = {
      id: this.generateMessageId(),
      sessionId: this.currentSessionId,
      type: 'tts_playback',
      timestamp: new Date(),
      content: {
        text,
        language: language || 'unknown',
        duration: metadata.duration || 0
      },
      metadata: {
        voice: metadata.voice || 'default',
        rate: metadata.rate || 1,
        pitch: metadata.pitch || 1,
        volume: metadata.volume || 1,
        ...metadata
      }
    };

    this.addMessageToSession(message);
    return message.id;
  }

  // Log errors
  logError(error, context = {}) {
    if (!this.currentSessionId) {
      this.startSession();
    }

    const message = {
      id: this.generateMessageId(),
      sessionId: this.currentSessionId,
      type: 'error',
      timestamp: new Date(),
      content: {
        error: error.message || error,
        stack: error.stack || null,
        context: context.type || 'unknown'
      },
      metadata: {
        severity: context.severity || 'error',
        component: context.component || 'unknown',
        ...context
      }
    };

    this.addMessageToSession(message);
    console.error('Logged error:', error, context);
    return message.id;
  }

  // Add message to current session
  addMessageToSession(message) {
    if (!this.conversations.has(this.currentSessionId)) {
      console.warn('No active session for message:', message);
      return;
    }

    const session = this.conversations.get(this.currentSessionId);
    session.messages.push(message);
    
    // Update session stats
    session.stats.totalMessages++;
    if (message.type === 'user_input') {
      session.stats.totalUserMessages++;
    } else if (message.type === 'ai_response') {
      session.stats.totalBotMessages++;
    }
    
    // Track language usage
    if (message.content.language) {
      session.stats.languagesUsed.add(message.content.language);
    }

    this.saveToStorage();
  }

  // Get current session
  getCurrentSession() {
    if (!this.currentSessionId || !this.conversations.has(this.currentSessionId)) {
      return null;
    }
    return this.conversations.get(this.currentSessionId);
  }

  // Get all conversations
  getAllConversations() {
    return Array.from(this.conversations.values());
  }

  // Get conversations for a specific date range
  getConversationsByDateRange(startDate, endDate) {
    return Array.from(this.conversations.values()).filter(conv => {
      const convDate = new Date(conv.startTime);
      return convDate >= startDate && convDate <= endDate;
    });
  }

  // Get conversations by language
  getConversationsByLanguage(language) {
    return Array.from(this.conversations.values()).filter(conv => {
      return conv.stats.languagesUsed.includes(language);
    });
  }

  // Export conversation data
  exportConversations(format = 'json', filter = {}) {
    let conversations = Array.from(this.conversations.values());
    
    // Apply filters
    if (filter.dateRange) {
      conversations = conversations.filter(conv => {
        const convDate = new Date(conv.startTime);
        return convDate >= filter.dateRange.start && convDate <= filter.dateRange.end;
      });
    }
    
    if (filter.language) {
      conversations = conversations.filter(conv => {
        return conv.stats.languagesUsed.includes(filter.language);
      });
    }
    
    if (filter.userId) {
      conversations = conversations.filter(conv => conv.userId === filter.userId);
    }

    const exportData = {
      exportDate: new Date().toISOString(),
      totalConversations: conversations.length,
      filter,
      conversations: conversations.map(conv => ({
        ...conv,
        // Convert Set back to Array for export
        stats: {
          ...conv.stats,
          languagesUsed: Array.from(conv.stats.languagesUsed || [])
        }
      }))
    };

    switch (format) {
      case 'csv':
        return this.exportToCSV(exportData);
      case 'txt':
        return this.exportToTXT(exportData);
      default:
        return JSON.stringify(exportData, null, 2);
    }
  }

  // Export to CSV format
  exportToCSV(data) {
    const headers = ['Session ID', 'Start Time', 'End Time', 'Duration (ms)', 'User Messages', 'Bot Messages', 'Languages', 'Avg Confidence'];
    let csv = headers.join(',') + '\n';
    
    data.conversations.forEach(conv => {
      const row = [
        conv.id,
        conv.startTime,
        conv.endTime || 'N/A',
        conv.stats.conversationDuration || 0,
        conv.stats.totalUserMessages,
        conv.stats.totalBotMessages,
        conv.stats.languagesUsed.join(';'),
        (conv.stats.averageConfidence || 0).toFixed(2)
      ];
      csv += row.join(',') + '\n';
    });
    
    return csv;
  }

  // Export to plain text format
  exportToTXT(data) {
    let txt = `Voice Assistant Conversation Export\n`;
    txt += `Export Date: ${data.exportDate}\n`;
    txt += `Total Conversations: ${data.totalConversations}\n\n`;
    
    data.conversations.forEach((conv, index) => {
      txt += `=== Conversation ${index + 1} ===\n`;
      txt += `Session ID: ${conv.id}\n`;
      txt += `Start: ${conv.startTime}\n`;
      txt += `End: ${conv.endTime || 'Ongoing'}\n`;
      txt += `Languages: ${conv.stats.languagesUsed.join(', ')}\n`;
      txt += `Messages: ${conv.stats.totalMessages}\n\n`;
      
      conv.messages.forEach(msg => {
        txt += `[${msg.timestamp}] ${msg.type.toUpperCase()}: `;
        if (msg.type === 'user_input') {
          txt += `"${msg.content.transcript}" (${msg.content.language}, ${(msg.content.confidence * 100).toFixed(1)}%)\n`;
        } else if (msg.type === 'ai_response') {
          txt += `"${msg.content.response}" (${msg.content.language})\n`;
        } else if (msg.type === 'error') {
          txt += `${msg.content.error}\n`;
        }
      });
      txt += '\n';
    });
    
    return txt;
  }

  // Get analytics/statistics
  getAnalytics(dateRange = null) {
    let conversations = Array.from(this.conversations.values());
    
    if (dateRange) {
      conversations = conversations.filter(conv => {
        const convDate = new Date(conv.startTime);
        return convDate >= dateRange.start && convDate <= dateRange.end;
      });
    }

    const analytics = {
      totalConversations: conversations.length,
      totalMessages: conversations.reduce((sum, conv) => sum + conv.stats.totalMessages, 0),
      totalUserMessages: conversations.reduce((sum, conv) => sum + conv.stats.totalUserMessages, 0),
      totalBotMessages: conversations.reduce((sum, conv) => sum + conv.stats.totalBotMessages, 0),
      averageConversationDuration: 0,
      averageConfidence: 0,
      languageBreakdown: {},
      dailyActivity: {},
      errorCount: 0,
      commonErrors: {}
    };

    // Calculate averages and breakdowns
    const durations = conversations.map(conv => conv.stats.conversationDuration || 0).filter(d => d > 0);
    const confidences = conversations.map(conv => conv.stats.averageConfidence || 0).filter(c => c > 0);
    
    if (durations.length > 0) {
      analytics.averageConversationDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
    }
    
    if (confidences.length > 0) {
      analytics.averageConfidence = confidences.reduce((a, b) => a + b, 0) / confidences.length;
    }

    // Language breakdown
    conversations.forEach(conv => {
      conv.stats.languagesUsed.forEach(lang => {
        analytics.languageBreakdown[lang] = (analytics.languageBreakdown[lang] || 0) + 1;
      });
    });

    // Daily activity
    conversations.forEach(conv => {
      const date = new Date(conv.startTime).toISOString().split('T')[0];
      analytics.dailyActivity[date] = (analytics.dailyActivity[date] || 0) + 1;
    });

    // Error analysis
    conversations.forEach(conv => {
      conv.messages.forEach(msg => {
        if (msg.type === 'error') {
          analytics.errorCount++;
          const errorType = msg.content.context || 'unknown';
          analytics.commonErrors[errorType] = (analytics.commonErrors[errorType] || 0) + 1;
        }
      });
    });

    return analytics;
  }

  // Clean up old conversations
  cleanupOldConversations() {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.maxHistoryDays);

    const toDelete = [];
    for (const [sessionId, conversation] of this.conversations) {
      if (new Date(conversation.startTime) < cutoffDate) {
        toDelete.push(sessionId);
      }
    }

    toDelete.forEach(sessionId => {
      this.conversations.delete(sessionId);
    });

    if (toDelete.length > 0) {
      console.log(`Cleaned up ${toDelete.length} old conversations`);
      this.saveToStorage();
    }
  }

  // Save to localStorage
  saveToStorage() {
    try {
      const data = {
        conversations: Object.fromEntries(this.conversations),
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.warn('Error saving transcript history:', error);
    }
  }

  // Generate unique session ID
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Generate unique message ID
  generateMessageId() {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Clear all conversation data
  clearAllData() {
    this.conversations.clear();
    this.currentSessionId = null;
    localStorage.removeItem(this.storageKey);
    console.log('Cleared all conversation data');
  }

  // Get storage usage info
  getStorageInfo() {
    const data = localStorage.getItem(this.storageKey);
    const sizeInBytes = data ? new Blob([data]).size : 0;
    const sizeInMB = (sizeInBytes / (1024 * 1024)).toFixed(2);
    
    return {
      totalConversations: this.conversations.size,
      storageSize: `${sizeInMB} MB`,
      storageBytes: sizeInBytes,
      oldestConversation: this.getOldestConversationDate(),
      newestConversation: this.getNewestConversationDate()
    };
  }

  // Get oldest conversation date
  getOldestConversationDate() {
    if (this.conversations.size === 0) return null;
    
    let oldest = null;
    for (const conversation of this.conversations.values()) {
      if (!oldest || new Date(conversation.startTime) < new Date(oldest)) {
        oldest = conversation.startTime;
      }
    }
    return oldest;
  }

  // Get newest conversation date
  getNewestConversationDate() {
    if (this.conversations.size === 0) return null;
    
    let newest = null;
    for (const conversation of this.conversations.values()) {
      if (!newest || new Date(conversation.startTime) > new Date(newest)) {
        newest = conversation.startTime;
      }
    }
    return newest;
  }
}

export default new TranscriptLogger();
