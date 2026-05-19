import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { 
  Sun, Moon, Shield, BookOpen, Heart, Sparkles, 
  X, Copy, Pause, Check, Home, CloudRain, Briefcase, Volume2, Search, Loader
} from 'lucide-react';
import toast from 'react-hot-toast';

const BASE_AUDIO_URL = "https://raw.githubusercontent.com/rn0x/Adhkar-json/main";

const guessIcon = (categoryName) => {
  if (categoryName.includes('الصباح')) return Sun;
  if (categoryName.includes('المساء') || categoryName.includes('النوم')) return Moon;
  if (categoryName.includes('الصلاة') || categoryName.includes('المسجد') || categoryName.includes('الآذان')) return BookOpen;
  if (categoryName.includes('المنزل') || categoryName.includes('الخلاء')) return Home;
  if (categoryName.includes('السفر') || categoryName.includes('الركوب')) return Briefcase;
  if (categoryName.includes('الهم') || categoryName.includes('الحزن') || categoryName.includes('المصيبة')) return Heart;
  if (categoryName.includes('الوضوء')) return CloudRain;
  if (categoryName.includes('المرض') || categoryName.includes('المريض')) return Shield;
  return Sparkles;
};

const DhikrCard = ({ dhikr, onCopy, playingId, onPlayPause }) => {
  const [count, setCount] = useState(dhikr.count || 1);
  const isDone = count <= 0;

  useEffect(() => {
    setCount(dhikr.count || 1);
  }, [dhikr]);

  const handleDecrement = (e) => {
    e.stopPropagation();
    if (count > 0) {
      setCount(prev => prev - 1);
      if (count - 1 === 0) {
        toast.success('تم إتمام الذكر', { icon: '✨' });
      }
    }
  };

  const hasAudio = !!dhikr.audio;
  const isPlaying = playingId === dhikr.id;

  return (
    <div 
      onClick={handleDecrement}
      className={`relative bg-white/70 dark:bg-gray-900/40 backdrop-blur-md p-6 md:p-8 rounded-[2rem] border transition-all duration-300 shadow-xl cursor-pointer
        ${isDone ? 'border-emerald-500/50 opacity-60' : 'border-emerald-100/50 dark:border-gray-700/50 hover:border-emerald-400/30'}`}
    >
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
        <Sparkles className="w-24 h-24 text-emerald-500" />
      </div>

      <div className="relative z-10 flex flex-col gap-6">
        <div className="text-2xl md:text-3xl text-emerald-950 dark:text-emerald-50 leading-relaxed font-serif font-bold text-center">
          {dhikr.text}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-emerald-900/10 dark:border-white/10">
          {/* Controls */}
          <div className="flex gap-2">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onCopy(dhikr.text);
              }}
              className="p-3 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full hover:bg-emerald-100 hover:text-emerald-700 transition-colors"
              title="نسخ الذكر"
            >
              <Copy className="w-5 h-5" />
            </button>
            
            <button 
              onClick={(e) => {
                e.stopPropagation();
                if (!hasAudio) {
                  toast('الصوت غير متاح لهذا الذكر', { icon: 'ℹ️' });
                  return;
                }
                onPlayPause(dhikr);
              }}
              className={`p-3 rounded-full transition-colors flex items-center gap-2 ${
                isPlaying 
                  ? 'bg-red-50 text-red-500 hover:bg-red-100 dark:bg-red-900/30' 
                  : hasAudio
                    ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100'
                    : 'bg-gray-50 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
              }`}
              title={isPlaying ? "إيقاف الصوت" : hasAudio ? "تشغيل الصوت" : "لا يوجد صوت"}
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
          </div>

          {/* Counter */}
          <div className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-900/30 px-4 py-2 rounded-full border border-emerald-200/50 dark:border-emerald-500/20">
            {isDone ? (
              <span className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold">
                <Check className="w-5 h-5" />
                اكتمل
              </span>
            ) : (
              <>
                <span className="text-emerald-900/60 dark:text-emerald-400/70 text-sm font-bold uppercase tracking-widest">
                  التكرار
                </span>
                <span className="text-2xl font-bold text-emerald-700 dark:text-emerald-300 font-serif w-8 text-center">
                  {count}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const HisnMuslimPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [playingId, setPlayingId] = useState(null);
  
  const audioRef = useRef(null);

  const { data: categories = [], isLoading, isError } = useQuery({
    queryKey: ['hisnMuslim'],
    queryFn: async () => {
      const res = await fetch('https://raw.githubusercontent.com/rn0x/Adhkar-json/main/adhkar.json');
      if (!res.ok) throw new Error('فشل تحميل البيانات');
      return res.json();
    }
  });

  const filteredCategories = useMemo(() => {
    return categories.filter(cat => {
      const matchesTitle = cat.category.includes(searchTerm);
      const matchesDhikr = cat.array.some(d => d.text.includes(searchTerm));
      return matchesTitle || matchesDhikr;
    });
  }, [categories, searchTerm]);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('تم نسخ الذكر بنجاح');
  };

  const handlePlayPause = (dhikr) => {
    if (playingId === dhikr.id) {
      audioRef.current?.pause();
      setPlayingId(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      
      const audioUrl = dhikr.audio.startsWith('/') 
        ? `${BASE_AUDIO_URL}${dhikr.audio}`
        : dhikr.audio;
        
      const audio = new Audio(audioUrl);
      audio.onended = () => setPlayingId(null);
      audio.onerror = () => {
        toast.error('حدث خطأ أثناء تشغيل الصوت');
        setPlayingId(null);
      };
      
      audioRef.current = audio;
      audio.play().catch(() => toast.error('تعذر تشغيل الصوت تلقائياً'));
      setPlayingId(dhikr.id);
    }
  };

  // Stop audio when modal closes or unmounts
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  const closeOverlay = () => {
    setSelectedCategory(null);
    if (audioRef.current) {
      audioRef.current.pause();
      setPlayingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-6">
        <Loader className="w-12 h-12 text-emerald-600 animate-spin" />
        <div className="text-xl font-bold text-emerald-800 animate-pulse">جاري تحميل حصن المسلم...</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-6">
        <div className="text-red-500 font-bold text-2xl">عذراً، حدث خطأ أثناء تحميل البيانات</div>
        <button onClick={() => window.location.reload()} className="px-6 py-2 bg-emerald-600 text-white rounded-xl shadow-lg">إعادة المحاولة</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent pb-20">
      <Helmet>
        <title>حصن المسلم | منصة تدبر</title>
        <meta name="description" content="تصفح أذكار حصن المسلم، أذكار الصباح والمساء، أدعية القرآن والسنة مع إمكانية الاستماع." />
      </Helmet>
      
      {/* Page Background Pattern */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05] z-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:32px_32px]" />
      </div>

      {/* Hero Section */}
      <section className="text-center mb-16 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold mb-6 tracking-widest uppercase border border-emerald-200/50 dark:border-emerald-500/20"
        >
          <Shield className="w-4 h-4" />
          ألا بذكر الله تطمئن القلوب
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-5xl md:text-7xl font-serif font-bold text-emerald-900 dark:text-emerald-100 mb-6"
        >
          حصن <span className="text-gold-600">المسلم</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-xl text-emerald-800/70 dark:text-emerald-300/60 max-w-2xl mx-auto leading-relaxed italic"
        >
          من أذكار الكتاب والسنة. تصفح الأذكار والأدعية لجميع الأوقات والأحوال.
        </motion.p>
      </section>

      {/* Search Bar */}
      <div className="max-w-3xl mx-auto px-4 mb-16 relative z-10">
        <div className="relative group">
          <div className="absolute inset-y-0 right-6 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-emerald-500/50 group-focus-within:text-emerald-500 transition-colors" />
          </div>
          <input
            type="text"
            className="w-full pl-6 pr-14 py-5 bg-white/70 dark:bg-gray-800/50 border border-emerald-100 dark:border-gray-700 rounded-3xl shadow-xl shadow-emerald-500/5 text-lg text-emerald-900 dark:text-emerald-100 placeholder-emerald-900/30 dark:placeholder-emerald-100/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all backdrop-blur-md"
            placeholder="ابحث في الأقسام أو الأذكار..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Grid of Categories */}
      <AnimatePresence mode="wait">
        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-4 relative z-10"
        >
          {filteredCategories.map((cat) => {
            const Icon = guessIcon(cat.category);
            return (
              <motion.div
                key={cat.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ y: -8 }}
                onClick={() => setSelectedCategory(cat)}
                className="group relative cursor-pointer h-full"
              >
                <div className="absolute inset-0 bg-emerald-500/5 rounded-[2rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative h-full bg-white/70 dark:bg-gray-800/40 backdrop-blur-md p-6 rounded-[2rem] border border-emerald-100/50 dark:border-gray-700/50 shadow-xl flex flex-col items-center text-center group-hover:border-emerald-500/30 transition-all duration-300">
                  
                  <div className="w-16 h-16 flex items-center justify-center bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl mb-4 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500">
                    <Icon className="w-8 h-8" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-emerald-950 dark:text-white mb-2 leading-relaxed">
                    {cat.category}
                  </h3>
                  
                  <div className="mt-auto pt-4 flex items-center gap-2 text-sm text-emerald-900/50 dark:text-emerald-300/50 font-bold">
                    <BookOpen className="w-4 h-4" />
                    <span>{cat.array?.length || 0} أذكار</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </AnimatePresence>

      {/* Detail Overlay */}
      <AnimatePresence>
        {selectedCategory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8"
          >
            <motion.div 
              className="absolute inset-0 bg-emerald-950/70 backdrop-blur-md"
              onClick={closeOverlay}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 50 }}
              className="relative w-full max-w-4xl max-h-[90vh] bg-[#fcfaf2] dark:bg-gray-950 rounded-[2.5rem] shadow-full flex flex-col border border-emerald-100 dark:border-gray-800"
            >
              {/* Header */}
              <div className="p-6 md:p-8 flex justify-between items-center border-b border-emerald-100 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-t-[2.5rem] relative z-10 shrink-0">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                    {React.createElement(guessIcon(selectedCategory.category), { className: "w-6 h-6" })}
                  </div>
                  <h2 className="text-2xl md:text-3xl font-serif font-bold text-emerald-950 dark:text-white leading-tight">
                    {selectedCategory.category}
                  </h2>
                </div>
                
                <button 
                  onClick={closeOverlay}
                  className="p-3 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-red-500 hover:text-white transition-all text-gray-500 dark:text-gray-400 shrink-0"
                  title="إغلاق"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Adhkar List */}
              <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 no-scrollbar relative z-10 bg-emerald-50/30 dark:bg-gray-900/20">
                {selectedCategory.array.map((dhikr) => (
                  <DhikrCard 
                    key={dhikr.id} 
                    dhikr={dhikr} 
                    onCopy={handleCopy} 
                    playingId={playingId}
                    onPlayPause={handlePlayPause}
                  />
                ))}
              </div>
              
              {/* Footer Indicator */}
              <div className="p-4 bg-emerald-50/80 dark:bg-gray-900/80 backdrop-blur-md flex justify-center border-t border-emerald-100 dark:border-gray-800 rounded-b-[2.5rem] relative z-10 text-sm font-bold text-emerald-800/50 dark:text-emerald-300/50 shrink-0">
                اضغط على بطاقة الذكر لاحتساب التكرار
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HisnMuslimPage;
