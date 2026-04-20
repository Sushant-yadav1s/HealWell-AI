import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { chatbotAPI } from '../services/api';
import Navbar from '../components/Navbar';
import { Send, Bot, User, Sparkles, Mic, MicOff, Volume2, VolumeX, Languages } from 'lucide-react';
import { toast } from 'sonner';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

type Language = 'en' | 'hi';

const translations = {
  en: {
    greeting: (name?: string) => name 
      ? `Hello ${name}! 👋 Welcome to HEALWELL AI. I'm your AI Health Assistant and I'm here to help you with:
      
• Health-related questions and general wellness advice
• Dietary recommendations and nutrition tips
• Exercise and yoga suggestions
• Stress management and sleep improvement
• Symptom guidance (with appropriate medical disclaimers)

What would you like to ask me today?`
      : `Hello! 👋 Welcome to HEALWELL AI. I'm your AI Health Assistant and I'm here to help you with health-related questions, yoga recommendations, dietary advice, and more. 

Please note: You need to be logged in to use the chatbot. How can I assist you today?`,
    quickQuestions: [
      "How to relieve headache?",
      "Yoga for back pain",
      "Foods rich in Vitamin D",
      "Tips to boost immunity"
    ],
    placeholder: "Type or speak your health question...",
    quickQuestionsLabel: "Quick questions:",
    listening: "Listening...",
    voiceNotSupported: "Voice input is not supported in your browser",
    speechError: "Speech recognition error. Please try again.",
    couldNotStart: "Could not start voice input",
    loginRequired: "Please login to use the chatbot",
    connectionError: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.",
    failedResponse: "Failed to get AI response. Please try again."
  },
  hi: {
    greeting: (name?: string) => name
      ? `नमस्ते ${name}! 👋 HEALWELL AI में आपका स्वागत है। मैं आपका AI स्वास्थ्य सहायक हूं और मैं यहां आपकी सहायता के लिए हूं:
      
• स्वास्थ्य संबंधी प्रश्न और सामान्य कल्याण सलाह
• आहार सिफारिशें और पोषण युक्तियां
• व्यायाम और योग सुझाव
• तनाव प्रबंधन और नींद में सुधार
• लक्षण मार्गदर्शन (उपयुक्त चिकित्सकीय अस्वीकरण के साथ)

आज आप मुझसे क्या पूछना चाहेंगे?`
      : `नमस्ते! 👋 HEALWELL AI में आपका स्वागत है। मैं आपका AI स्वास्थ्य सहायक हूं और मैं स्वास्थ्य संबंधी प्रश्नों, योग सिफारिशों, आहार सलाह और बहुत कुछ के लिए यहां हूं।

कृपया ध्यान दें: चैटबॉट का उपयोग करने के लिए आपको लॉगिन करना होगा। मैं आज आपकी कैसे सहायता कर सकता हूं?`,
    quickQuestions: [
      "सिरदर्द से राहत कैसे पाएं?",
      "पीठ दर्द के लिए योग",
      "विटामिन डी से भरपूर खाद्य पदार्थ",
      "रोग प्रतिरोधक क्षमता बढ़ाने के टिप्स"
    ],
    placeholder: "अपना स्वास्थ्य प्रश्न टाइप या बोलें...",
    quickQuestionsLabel: "त्वरित प्रश्न:",
    listening: "सुन रहे हैं...",
    voiceNotSupported: "आपके ब्राउज़र में वॉइस इनपुट समर्थित नहीं है",
    speechError: "भाषण मान्यता त्रुटि। कृपया पुनः प्रयास करें।",
    couldNotStart: "वॉइस इनपुट शुरू नहीं कर सका",
    loginRequired: "कृपया चैटबॉट का उपयोग करने के लिए लॉगिन करें",
    connectionError: "क्षमा करें, अभी मैं कनेक्ट होने में परेशानी हो रही है। कृपया कुछ समय बाद पुनः प्रयास करें।",
    failedResponse: "AI प्रतिक्रिया प्राप्त करने में विफल। कृपया पुनः प्रयास करें।"
  }
};

export default function Chatbot() {
  const { user } = useAuth();
  const [language, setLanguage] = useState<Language>('en');

  // Initialize greeting message
  const getGreetingMessage = (lang: Language) => {
    const t = translations[lang];
    return t.greeting(user?.name);
  };

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: getGreetingMessage('en'),
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  const t = translations[language];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Update speech recognition language when language changes
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = language === 'en' ? 'en-US' : 'hi-IN';
    }
  }, [language]);

  // Update greeting message when language changes (only if still on first message)
  useEffect(() => {
    if (messages.length === 1) {
      setMessages([{
        id: '1',
        text: getGreetingMessage(language),
        sender: 'bot',
        timestamp: new Date()
      }]);
    }
  }, [language]); // eslint-disable-line react-hooks/exhaustive-deps

  // Initialize speech synthesis and recognition (only once on mount)
  useEffect(() => {
    // Check browser support
    if ('speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    } else {
      toast.info('Speech synthesis not supported in your browser');
    }

    // Check for speech recognition support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = language === 'en' ? 'en-US' : 'hi-IN';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        toast.error(translations[language].speechError);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    } else {
      console.warn('Speech recognition not supported in your browser');
    }

    // Cleanup
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
//
  // Function to handle voice input
  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      toast.error(t.voiceNotSupported);
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        toast.info(t.listening);
      } catch (error) {
        console.error('Error starting speech recognition:', error);
        toast.error(t.couldNotStart);
      }
    }
  };

  // Function to speak bot responses
  const speakText = (text: string) => {
    if (!synthRef.current || !isVoiceEnabled) return;

    // Cancel any ongoing speech
    synthRef.current.cancel();

    // Create utterance
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 0.8;
    utterance.lang = language === 'en' ? 'en-US' : 'hi-IN';

    // Speak
    synthRef.current.speak(utterance);
  };

  const toggleVoiceOutput = () => {
    setIsVoiceEnabled(!isVoiceEnabled);
    if (synthRef.current && !isVoiceEnabled) {
      synthRef.current.cancel();
    }
  };

  const handleSend = async () => {
  if (!input.trim()) return;

  if (!user) {
    toast.error(t.loginRequired);
    return;
  }

  const userMessage: Message = {
    id: Date.now().toString(),
    text: input,
    sender: 'user',
    timestamp: new Date()
  };

  setMessages(prev => [...prev, userMessage]);
  const messageText = input;
  setInput('');
  setIsTyping(true);

  try {
    // 🔥 CALL BACKEND API
    const response = await chatbotAPI.chat(messageText, user.id, language);

    // ✅ FIXED: use "response" not "message"
    if (response.success && response.response) {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: response.response,
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botResponse]);

      // 🔊 Speak response
      setTimeout(() => {
        speakText(response.response);
      }, 500);

    } else {
      throw new Error('Failed to get AI response');
    }

  } catch (error: any) {
    console.error('Chatbot error:', error);

    const errorMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: t.connectionError,
      sender: 'bot',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, errorMessage]);
    toast.error(t.failedResponse);
  } finally {
    setIsTyping(false);
  }
};

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickQuestions = t.quickQuestions;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navbar />

      <div className="pt-24 pb-6 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 mb-4">
              <Sparkles className="w-4 h-4" />
              <span>AI Health Assistant</span>
            </div>
            <h1 className="text-gray-900 dark:text-white mb-2">Chat with Health AI</h1>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Ask questions about symptoms, yoga, nutrition, and wellness
            </p>
            {/* Language Selector */}
            <div className="flex justify-center gap-2">
              <button
                onClick={() => setLanguage('en')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  language === 'en'
                    ? 'bg-emerald-500 text-white shadow-lg'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                🇬🇧 English
              </button>
              <button
                onClick={() => setLanguage('hi')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  language === 'hi'
                    ? 'bg-emerald-500 text-white shadow-lg'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                🇮🇳 हिंदी
              </button>
            </div>
          </div>

          {/* Chat Container */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col h-[600px]">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.sender === 'bot'
                      ? 'bg-gradient-to-br from-emerald-500 to-cyan-500'
                      : 'bg-gradient-to-br from-purple-500 to-pink-500'
                  }`}>
                    {message.sender === 'bot' ? (
                      <Bot className="w-5 h-5 text-white" />
                    ) : (
                      <User className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                      message.sender === 'bot'
                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                        : 'bg-gradient-to-br from-emerald-500 to-cyan-500 text-white'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.text}</p>
                    <p className={`text-xs mt-2 ${
                      message.sender === 'bot' ? 'text-gray-500 dark:text-gray-400' : 'text-white/70'
                    }`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl px-4 py-3">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Questions */}
            {messages.length === 1 && (
              <div className="px-6 pb-4">
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">{t.quickQuestionsLabel}</p>
                <div className="flex flex-wrap gap-2">
                  {quickQuestions.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => setInput(question)}
                      className="px-3 py-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors text-sm"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={t.placeholder}
                  className="flex-1 px-4 py-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
                
                <button
                  onClick={toggleVoiceInput}
                  disabled={isListening}
                  className={`p-3 rounded-lg transition-all ${
                    isListening
                      ? 'bg-red-500 text-white animate-pulse'
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  } disabled:cursor-not-allowed`}
                  title="Voice input"
                >
                  {isListening ? (
                    <MicOff className="w-5 h-5" />
                  ) : (
                    <Mic className="w-5 h-5" />
                  )}
                </button>

                <button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="p-3 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
              {/* Voice Output Toggle - below input */}
              <div className="flex justify-center mt-2">
                <button
                  onClick={toggleVoiceOutput}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs transition-all ${
                    isVoiceEnabled
                      ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/50'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                  title={isVoiceEnabled ? 'Disable voice output' : 'Enable voice output'}
                >
                  {isVoiceEnabled ? (
                    <>
                      <Volume2 className="w-4 h-4" />
                      <span>{language === 'en' ? 'Voice ON' : 'आवाज़ चालू'}</span>
                    </>
                  ) : (
                    <>
                      <VolumeX className="w-4 h-4" />
                      <span>{language === 'en' ? 'Voice OFF' : 'आवाज़ बंद'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
