import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { 
  Send, 
  Bot, 
  User, 
  Loader2, 
  RefreshCcw, 
  BookOpen, 
  Sparkles, 
  Info,
  Quote,
  Compass
} from 'lucide-react';
import axios from 'axios';
import { useQuranData } from '../context/QuranDataContext';

export default function AskQuranPage() {
  const { isRtl, theme, lang } = useQuranData();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: isRtl 
        ? 'مرحباً بك في "اسأل القرآن". أنا مساعدك الذكي لاستكشاف كنوز كتاب الله وتدبر آياته. كيف يمكنني مساعدتك اليوم؟' 
        : 'Welcome to "Ask the Quran". I am your intelligent assistant for exploring the treasures of Allah\'s book. How can I help you today?',
      type: 'text'
    }
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const API_BASE = process.env.REACT_APP_API_URL || 'https://tadabbur-api.onrender.com';

  const [isInitialMount, setIsInitialMount] = useState(true);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    // Small timeout to ensure it stays at top after other components mount
    const timer = setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'instant' });
      setIsInitialMount(false);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const scrollToBottom = () => {
    if (!isInitialMount) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (messages.length > 1) {
      scrollToBottom();
    }
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', content: input, type: 'text' };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE}/ai/ask`, { question: currentInput });
      const aiResponse = { 
        role: 'assistant', 
        content: response.data.answer, 
        sources: response.data.sources,
        type: 'text'
      };
      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('AI Error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: isRtl ? 'عذراً، حدث خطأ أثناء التواصل مع المحرك. تأكد من تشغيل الخادم وخدمة الذكاء الاصطناعي.' : 'Sorry, an error occurred while connecting to the engine. Please ensure the server is running.',
        type: 'error'
      }]);
    } finally {
      setLoading(false);
    }
  };

  const suggestedQuestions = [
    { text: isRtl ? 'ما هي آيات الصبر؟' : 'What are the verses about patience?', icon: '🌱' },
    { text: isRtl ? 'قصة سيدنا يوسف عليه السلام' : 'Story of Prophet Joseph', icon: '👑' },
    { text: isRtl ? 'أدعية من القرآن للرزق' : 'Quranic duas for livelihood', icon: '✨' },
    { text: isRtl ? 'معنى "الحمد لله" في القرآن' : 'Meaning of "Alhamdulillah" in Quran', icon: '📖' },
  ];

  return (
    <div className="relative min-h-screen pb-12">
      <Helmet>
        <title>{isRtl ? 'اسأل القرآن - مساعد تدبر الذكي' : 'Ask Quran - Tadabbur AI'}</title>
      </Helmet>

      {/* Decorative Background Pattern */}
      <div className="absolute inset-0 z-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 flex flex-col gap-8 pt-4">
        
        {/* Premium Page Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative group overflow-hidden rounded-[3rem] p-1 shadow-2xl"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-gold-500 via-emerald-600 to-teal-500 animate-gradient-x" />
          <div className="relative bg-white/90 dark:bg-gray-900/90 backdrop-blur-2xl rounded-[2.9rem] p-8 md:p-12 border border-white/20">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex items-center gap-6">
                <div className="relative w-24 h-24 flex items-center justify-center">
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 border-2 border-dashed border-gold-500/30 rounded-full"
                  />
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl flex items-center justify-center shadow-xl transform rotate-12 group-hover:rotate-0 transition-transform duration-500">
                    <Sparkles className="w-8 h-8 text-gold-400" />
                  </div>
                </div>
                <div className="text-center md:text-right">
                  <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-900 to-emerald-600 dark:from-emerald-400 dark:to-teal-300 mb-2 font-kufi">
                    {isRtl ? 'اسأل القرآن' : 'Ask the Quran'}
                  </h1>
                  <div className="flex items-center justify-center md:justify-start gap-2">
                    <div className="h-px w-8 bg-gold-500/50" />
                    <p className="text-gray-500 dark:text-emerald-100/60 text-lg font-medium font-serif italic">
                      {isRtl ? 'بصيرة من نور وتدبر بحكمة' : 'Insight from light and reflection with wisdom'}
                    </p>
                    <div className="h-px w-8 bg-gold-500/50" />
                  </div>
                </div>
              </div>
              
              <button 
                onClick={() => setMessages([messages[0]])}
                className="group relative px-6 py-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 font-bold rounded-2xl border border-emerald-100 dark:border-emerald-800 hover:bg-emerald-600 hover:text-white transition-all duration-300 shadow-sm"
              >
                <div className="flex items-center gap-2">
                  <RefreshCcw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                  <span>{isRtl ? 'تصفير المحادثة' : 'Clear Chat'}</span>
                </div>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Chat Container */}
        <div className="flex-1 flex flex-col min-h-[600px] bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl rounded-[3rem] shadow-2xl border border-emerald-100/50 dark:border-emerald-900/20 overflow-hidden">
          
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-10 custom-scrollbar scroll-smooth">
            <AnimatePresence mode='popLayout'>
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`relative flex gap-4 max-w-[85%] md:max-w-[75%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    
                    {/* Avatar with Glow */}
                    <div className="relative shrink-0">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${
                        msg.role === 'user' 
                          ? 'bg-emerald-600 text-white' 
                          : 'bg-white dark:bg-gray-800 text-emerald-600 border border-emerald-100 dark:border-emerald-900/50'
                      }`}>
                        {msg.role === 'user' ? <User className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
                      </div>
                      <div className={`absolute -inset-1 rounded-2xl blur-md opacity-20 ${msg.role === 'user' ? 'bg-emerald-500' : 'bg-emerald-400'}`} />
                    </div>

                    {/* Content Bubble */}
                    <div className="flex flex-col gap-3 group">
                      <div className={`relative px-8 py-6 rounded-[2rem] shadow-sm leading-relaxed text-lg font-arabic transition-all duration-300 ${
                        msg.role === 'user'
                          ? 'bg-emerald-600 text-white rounded-tr-none'
                          : msg.type === 'error'
                            ? 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-900 rounded-tl-none'
                            : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border border-emerald-50 dark:border-emerald-900/30 rounded-tl-none hover:shadow-xl hover:shadow-emerald-500/5'
                      }`}>
                        {msg.content}
                        
                        {/* Quran Ornament for Assistant */}
                        {msg.role === 'assistant' && msg.type !== 'error' && (
                          <div className="absolute -bottom-3 -right-3 text-gold-500/20 text-3xl select-none opacity-0 group-hover:opacity-100 transition-opacity">۞</div>
                        )}
                      </div>

                      {/* Sources Section */}
                      {msg.sources && msg.sources.length > 0 && (
                        <div className="flex flex-wrap gap-2 px-2">
                          {msg.sources.map((src, sIdx) => (
                            <motion.div 
                              key={sIdx}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 px-3 py-1.5 rounded-full text-[10px] font-bold border border-emerald-100/50 dark:border-emerald-800/30"
                            >
                              <BookOpen className="w-3 h-3" />
                              {src.type === 'verse' ? `${src.surah_name} : ${src.ayah_number}` : src.title}
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {loading && (
              <div className="flex justify-start">
                <div className="flex gap-4 items-center bg-white/40 dark:bg-gray-800/40 px-6 py-4 rounded-3xl border border-emerald-50 dark:border-emerald-900/20">
                  <div className="relative">
                    <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
                    <div className="absolute inset-0 blur-md bg-emerald-400 opacity-20" />
                  </div>
                  <span className="text-sm font-bold text-emerald-600/70 animate-pulse">{isRtl ? 'جاري التدبر في الآيات...' : 'Reflecting on verses...'}</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Controls & Input */}
          <div className="p-8 md:p-12 bg-emerald-50/20 dark:bg-black/20 border-t border-emerald-100/50 dark:border-emerald-900/30">
            
            {/* Suggestions with Better Styling */}
            <div className="flex flex-wrap justify-center gap-4 mb-10">
              {suggestedQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => setInput(q.text)}
                  className="group flex items-center gap-3 bg-white/80 dark:bg-gray-800/80 hover:bg-emerald-600 dark:hover:bg-emerald-600 hover:text-white text-emerald-900 dark:text-emerald-300 px-5 py-3 rounded-2xl transition-all border border-emerald-100 dark:border-emerald-900/50 shadow-sm hover:shadow-emerald-500/20 active:scale-95"
                >
                  <span className="text-xl group-hover:rotate-12 transition-transform">{q.icon}</span>
                  <span className="text-sm font-bold">{q.text}</span>
                </button>
              ))}
            </div>

            {/* Input Box with Glow Effect */}
            <form onSubmit={handleSubmit} className="relative max-w-4xl mx-auto group">
              <div className="absolute -inset-2 bg-gradient-to-r from-gold-500/20 to-emerald-500/20 rounded-[2.5rem] blur-xl opacity-0 group-focus-within:opacity-100 transition duration-500" />
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={isRtl ? 'ماذا تود أن تسأل عن كتاب الله اليوم؟' : 'What would you like to ask about Allah\'s book today?'}
                  className="w-full bg-white/90 dark:bg-gray-800/90 border-2 border-emerald-100 dark:border-emerald-900/50 rounded-[2rem] py-7 px-10 pr-24 shadow-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none text-xl text-gray-800 dark:text-white transition-all placeholder:text-gray-400 dark:placeholder:text-emerald-100/20"
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="absolute left-4 right-auto md:left-auto md:right-4 top-1/2 -translate-y-1/2 w-16 h-16 bg-gradient-to-br from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-2xl flex items-center justify-center transition-all shadow-xl hover:scale-105 disabled:opacity-50 disabled:scale-100 active:scale-95 group-hover:shadow-emerald-500/20"
                >
                  <Send className={`w-8 h-8 ${isRtl ? 'rotate-180' : ''}`} />
                </button>
              </div>
            </form>
            <div className="mt-8 flex items-center justify-center gap-6 text-[10px] font-bold text-gray-400 dark:text-emerald-100/20 uppercase tracking-[0.2em]">
              <div className="flex items-center gap-2">
                <Compass className="w-3 h-3" />
                <span>{isRtl ? 'بيانات موثقة' : 'Verified Data'}</span>
              </div>
              <div className="w-1.5 h-1.5 rounded-full bg-gold-500/30" />
              <div className="flex items-center gap-2">
                <Quote className="w-3 h-3" />
                <span>{isRtl ? 'تدبر عميق' : 'Deep Reflection'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative Footer Ornament */}
        <div className="flex justify-center opacity-20 py-4">
          <div className="h-px w-24 bg-gradient-to-r from-transparent via-emerald-500 to-transparent" />
          <div className="mx-4 text-emerald-500">۞</div>
          <div className="h-px w-24 bg-gradient-to-r from-transparent via-emerald-500 to-transparent" />
        </div>
      </div>
    </div>
  );
}
