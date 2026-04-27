import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Scroll, 
  BookOpen, 
  X, 
  Sparkles, 
  ScrollText,
  Star,
  Clock,
  MapPin,
  Trees,
  CloudLightning,
  CheckCircle2,
  ChevronLeft
} from 'lucide-react';
import aqsamData from '../data/aqsam_data.json';

const categoryIcons = {
  'الزمن': Clock,
  'أماكن ونباتات': Trees,
  'مخلوقات': Star,
  'القرآن': BookOpen,
  'ظواهر كونية': CloudLightning,
  'default': Scroll
};

const AqsamPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOath, setSelectedOath] = useState(null);
  const [activeCategory, setActiveCategory] = useState('الكل');

  const allCategories = useMemo(() => {
    const categories = new Set(['الكل']);
    aqsamData.forEach(d => {
      d.التخصص?.forEach(cat => categories.add(cat));
    });
    return Array.from(categories);
  }, []);

  const filteredData = useMemo(() => {
    return aqsamData.filter(d => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = d.القسم.includes(searchTerm) || 
                           d.السورة.includes(searchTerm) ||
                           d.النص.includes(searchTerm) ||
                           d.الغرض.includes(searchTerm) ||
                           d.التخصص?.some(tag => tag.includes(searchTerm));
      
      const matchesCategory = activeCategory === 'الكل' || d.التخصص?.includes(activeCategory);
      
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, activeCategory]);

  const getIcon = (categories) => {
    if (!categories || categories.length === 0) return categoryIcons.default;
    const cat = categories[0];
    return categoryIcons[cat] || categoryIcons.default;
  };

  return (
    <div className="min-h-screen bg-transparent pb-20">
      {/* Hero Section */}
      <section className="text-center mb-16 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gold-500/5 blur-[100px] rounded-full -z-10" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-block px-4 py-1.5 rounded-full bg-gold-100 dark:bg-gold-900/30 text-gold-700 dark:text-gold-400 text-xs font-bold mb-6 tracking-widest uppercase"
        >
          لَا أُقْسِمُ بِيَوْمِ الْقِيَامَةِ
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-5xl md:text-7xl font-serif font-bold text-emerald-900 dark:text-emerald-100 mb-6"
        >
          أقسام <span className="text-gold-600">الله</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-lg text-emerald-800/70 dark:text-emerald-300/60 max-w-2xl mx-auto leading-relaxed italic"
        >
          تأمل في عظمة المقسم به وجواب القسم في كتاب الله.
          <br />
          مواضع أقسم فيها الخالق بمخلوقاته وعظيم آياته تأكيداً للحق وترسيخاً للإيمان.
        </motion.p>
      </section>

      {/* Control Bar */}
      <section className="relative z-30 mb-12">
        <div className="max-w-4xl mx-auto bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl p-4 rounded-3xl shadow-2xl border border-emerald-100 dark:border-gray-800 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="ابحث عن موضوع القسم، سورة، أو كلمة..."
              className="w-full pr-12 pl-4 py-3 bg-sand-50 dark:bg-gray-800 rounded-2xl border-none focus:ring-2 focus:ring-emerald-500 transition-all text-emerald-900 dark:text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2 w-full md:w-auto justify-center overflow-x-auto no-scrollbar py-2">
            {allCategories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  activeCategory === cat
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200 dark:shadow-none'
                    : 'bg-sand-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-emerald-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Aqsam Grid */}
      <AnimatePresence mode="wait">
        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {filteredData.map((oath, idx) => {
            const Icon = getIcon(oath.التخصص);
            return (
              <motion.div
                key={idx}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                whileHover={{ y: -5 }}
                onClick={() => setSelectedOath(oath)}
                className="group relative cursor-pointer"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-gold-500/5 to-emerald-500/5 rounded-[2.5rem] blur-xl opacity-50 group-hover:opacity-100 transition-opacity" />
                <div className="relative h-full bg-white/70 dark:bg-gray-800/40 backdrop-blur-md p-8 rounded-[2.5rem] border border-emerald-100/50 dark:border-gray-700/50 shadow-xl hover:shadow-2xl hover:border-gold-300/50 transition-all flex flex-col overflow-hidden">
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 flex items-center justify-center bg-gold-50 dark:bg-gold-900/20 text-gold-600 rounded-2xl border border-gold-100 dark:border-gray-700 group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">الموضع</div>
                      <div className="text-sm font-bold text-emerald-900 dark:text-emerald-100">
                        {oath.السورة}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-xl font-serif font-bold text-emerald-900 dark:text-emerald-100 mb-4 group-hover:text-gold-600 transition-colors leading-relaxed">
                      {oath.القسم}
                    </h3>
                    <p className="text-sm text-emerald-800/60 dark:text-emerald-300/40 line-clamp-3 italic mb-6 leading-relaxed">
                      "{oath.النص.substring(0, 120)}..."
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {oath.التخصص?.map((tag, tIdx) => (
                      <span key={tIdx} className="px-2.5 py-0.5 bg-emerald-50 dark:bg-emerald-900/20 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 rounded-lg border border-emerald-100/20 dark:border-emerald-500/10">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="pt-5 border-t border-emerald-50/50 dark:border-gray-700/50 flex justify-between items-center">
                    <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">تأمل القسم</span>
                    <ChevronLeft className="w-5 h-5 text-gold-600 group-hover:-translate-x-2 transition-transform" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </AnimatePresence>

      {/* Empty State */}
      {filteredData.length === 0 && (
        <div className="text-center py-20">
          <div className="bg-sand-50 dark:bg-gray-800/50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
            <Search className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-bold text-emerald-900 dark:text-emerald-100 mb-2">لا توجد نتائج</h3>
          <p className="text-gray-500">حاول البحث بمصطلحات أخرى</p>
        </div>
      )}

      {/* Detail Overlay */}
      <AnimatePresence>
        {selectedOath && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 overflow-hidden"
          >
            <motion.div 
              className="absolute inset-0 bg-emerald-950/60 backdrop-blur-md"
              onClick={() => setSelectedOath(null)}
            />
            <motion.div
              initial={{ scale: 0.9, y: 50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 50, opacity: 0 }}
              className="relative w-full max-w-4xl max-h-[90vh] bg-sand-50 dark:bg-gray-900 rounded-[3rem] shadow-full overflow-hidden flex flex-col border border-white/20"
            >
              {/* Header */}
              <div className="p-8 pb-6 flex justify-between items-start border-b border-emerald-100 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 backdrop-blur-md">
                <div className="flex-1 pr-4">
                  <div className="flex items-center gap-2 text-gold-600 font-bold mb-2">
                    <Scroll className="w-4 h-4" />
                    <span>سورة {selectedOath.السورة}</span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-serif font-bold text-emerald-900 dark:text-white leading-relaxed">
                    {selectedOath.الالقسم || selectedOath.القسم}
                  </h2>
                </div>
                <button 
                  onClick={() => setSelectedOath(null)}
                  className="p-3 bg-white dark:bg-gray-700 rounded-full shadow-lg hover:rotate-90 transition-all hover:bg-emerald-50"
                >
                  <X className="w-6 h-6 text-emerald-800 dark:text-gray-200" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-8 md:p-12 space-y-12 no-scrollbar">
                {/* Quranic Text */}
                <section className="relative">
                  <div className="bg-white/80 dark:bg-gray-800/80 p-10 md:p-14 rounded-[2.5rem] shadow-xl border border-gold-100/20 dark:border-gray-700 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                      <ScrollText className="w-32 h-32" />
                    </div>
                    <div className="quran-text text-2xl md:text-4xl text-emerald-900 dark:text-emerald-50 text-center leading-[2.5] md:leading-[3] font-serif dir-rtl relative z-10">
                      {selectedOath.النص}
                    </div>
                  </div>
                </section>

                {/* Purpose & Insight */}
                <section className="space-y-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gold-100 dark:bg-gold-900/30 text-gold-600 rounded-xl flex items-center justify-center">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <h3 className="text-2xl font-serif font-bold text-emerald-900 dark:text-emerald-100">
                      بلاغة القسم ومقاصده
                    </h3>
                  </div>
                  <div className="bg-white/50 dark:bg-gray-800/50 p-8 rounded-[2.5rem] border border-emerald-100 dark:border-gray-700">
                    <p className="text-lg text-emerald-800 dark:text-emerald-200 leading-relaxed italic text-right font-medium">
                      {selectedOath.الغرض}
                    </p>
                  </div>
                </section>

                {/* Tags */}
                <section className="flex flex-wrap gap-2">
                  {selectedOath.التخصص?.map((tag, idx) => (
                    <span key={idx} className="px-4 py-2 bg-emerald-600 text-white rounded-full text-xs font-bold shadow-md">
                      {tag}
                    </span>
                  ))}
                </section>
              </div>
              
              {/* Footer */}
              <div className="p-6 bg-emerald-900/5 dark:bg-emerald-950/20 flex justify-center border-t border-emerald-50 dark:border-gray-800">
                <button 
                  onClick={() => setSelectedOath(null)}
                  className="px-10 py-3 bg-emerald-800 hover:bg-emerald-700 text-white rounded-full font-bold shadow-xl transition-all"
                >
                  إغلاق
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AqsamPage;
