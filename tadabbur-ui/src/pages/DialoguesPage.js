import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  MessageSquare, 
  BookOpen, 
  X, 
  Sparkles, 
  ScrollText,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Hash
} from 'lucide-react';
import dialoguesData from '../data/dialogues_data.json';

const DialoguesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDialogue, setSelectedDialogue] = useState(null);
  const [activeCategory, setActiveCategory] = useState('الكل');

  // Extract all categories for filtering
  const allCategories = useMemo(() => {
    const categories = new Set(['الكل']);
    dialoguesData.forEach(d => {
      d.التخصص?.forEach(cat => categories.add(cat));
    });
    return Array.from(categories);
  }, []);

  // Filter logic
  const filteredDialogues = useMemo(() => {
    return dialoguesData.filter(d => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = d.الحوار.includes(searchTerm) || 
                           d.السورة.includes(searchTerm) ||
                           d.النص.includes(searchTerm) ||
                           d.الغرض.includes(searchTerm) ||
                           d.التخصص?.some(tag => tag.includes(searchTerm));
      
      const matchesCategory = activeCategory === 'الكل' || d.التخصص?.includes(activeCategory);
      
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, activeCategory]);

  return (
    <div className="min-h-screen bg-transparent pb-20">
      {/* Hero Section */}
      <section className="text-center mb-16 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-block px-4 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-sm font-bold mb-6 tracking-wide"
        >
          أَدَبُ الْحِوَارِ فِي الْقُرْآن
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-5xl md:text-7xl font-serif font-bold text-emerald-900 dark:text-emerald-100 mb-6"
        >
          حوارات <span className="text-gold-600">القرآن</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-lg text-emerald-800/70 dark:text-emerald-300/60 max-w-2xl mx-auto leading-relaxed italic"
        >
          تأمل في بلاغة الخطاب وفن المحاورة في كتاب الله. 
          <br />
          مواقف حوارية خلدها الوحي بين الخالق والملائكة، الأنبياء وأقوامهم، وعبر ثنايا القصص.
        </motion.p>
      </section>

      {/* Control Bar */}
      <section className="relative z-30 mb-12">
        <div className="max-w-4xl mx-auto bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl p-4 rounded-3xl shadow-2xl border border-emerald-100 dark:border-gray-800 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="ابحث عن عنوان الحوار، سورة، أو كلمة في النص..."
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

      {/* Dialogues Grid */}
      <AnimatePresence mode="wait">
        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {filteredDialogues.map((dialogue, idx) => (
            <motion.div
              key={idx}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              whileHover={{ y: -5 }}
              onClick={() => setSelectedDialogue(dialogue)}
              className="group relative cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-gold-500/5 rounded-[2.5rem] blur-xl opacity-50 group-hover:opacity-100 transition-opacity" />
              <div className="relative h-full bg-white/70 dark:bg-gray-800/40 backdrop-blur-md p-8 rounded-[2.5rem] border border-emerald-100/50 dark:border-gray-700/50 shadow-xl hover:shadow-2xl hover:border-emerald-300/50 transition-all flex flex-col">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 flex items-center justify-center bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-2xl border border-emerald-100 dark:border-gray-700 group-hover:scale-110 transition-transform">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <div className="flex flex-wrap justify-end gap-1.5 max-w-[60%]">
                    {dialogue.التخصص?.slice(0, 2).map((tag, tIdx) => (
                      <span key={tIdx} className="px-3 py-1 bg-gold-50/50 dark:bg-gold-900/20 text-[10px] font-bold text-gold-700 dark:text-gold-400 rounded-lg border border-gold-100/20 dark:border-gold-500/10">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="flex-1">
                  <div className="text-gold-600 dark:text-gold-500 text-xs font-bold mb-2 flex items-center gap-1">
                    <BookOpen className="w-3 h-3" />
                    سورة {dialogue.السورة}
                  </div>
                  <h3 className="text-xl font-serif font-bold text-emerald-900 dark:text-emerald-100 mb-4 group-hover:text-emerald-600 transition-colors leading-relaxed">
                    {dialogue.الحوار}
                  </h3>
                  <p className="text-sm text-emerald-800/60 dark:text-emerald-300/40 line-clamp-3 italic mb-6 leading-relaxed">
                    "{dialogue.النص.substring(0, 150)}..."
                  </p>
                </div>

                <div className="pt-5 border-t border-emerald-50/50 dark:border-gray-700/50 flex justify-between items-center">
                  <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">عرض التفاصيل</span>
                  <ChevronLeft className="w-5 h-5 text-emerald-600 group-hover:-translate-x-2 transition-transform" />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Empty State */}
      {filteredDialogues.length === 0 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20"
        >
          <div className="bg-sand-50 dark:bg-gray-800/50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
            <Search className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-bold text-emerald-900 dark:text-emerald-100 mb-2">لا توجد نتائج</h3>
          <p className="text-gray-500">حاول البحث بكلمات أخرى أو تغيير التصنيف</p>
        </motion.div>
      )}

      {/* Dialogue Detail Overlay */}
      <AnimatePresence>
        {selectedDialogue && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 overflow-hidden"
          >
            <motion.div 
              className="absolute inset-0 bg-emerald-950/60 backdrop-blur-md"
              onClick={() => setSelectedDialogue(null)}
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
                    <BookOpen className="w-4 h-4" />
                    <span>سورة {selectedDialogue.السورة}</span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-serif font-bold text-emerald-900 dark:text-white leading-relaxed">
                    {selectedDialogue.الحوار}
                  </h2>
                </div>
                <button 
                  onClick={() => setSelectedDialogue(null)}
                  className="p-3 bg-white dark:bg-gray-700 rounded-full shadow-lg hover:rotate-90 transition-all hover:bg-emerald-50"
                >
                  <X className="w-6 h-6 text-emerald-800 dark:text-gray-200" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-8 md:p-12 space-y-12 no-scrollbar">
                {/* Quranic Text Section */}
                <section className="relative">
                  <div className="absolute -right-4 top-0 bottom-0 w-1.5 bg-gradient-to-b from-gold-400 to-gold-600 rounded-full opacity-50" />
                  <div className="bg-white/80 dark:bg-gray-800/80 p-8 md:p-12 rounded-[2.5rem] shadow-xl border border-emerald-50 dark:border-gray-700 relative overflow-hidden group">
                    <div className="absolute top-0 left-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                      <ScrollText className="w-20 h-20 text-emerald-900 dark:text-white" />
                    </div>
                    <div className="quran-text text-2xl md:text-4xl text-emerald-900 dark:text-emerald-50 text-center leading-[2.5] md:leading-[2.8] font-serif dir-rtl relative z-10">
                      {selectedDialogue.النص}
                    </div>
                  </div>
                </section>

                {/* Purpose and Lessons Section */}
                <section className="space-y-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-xl flex items-center justify-center">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <h3 className="text-2xl font-serif font-bold text-emerald-900 dark:text-emerald-100">
                      الدلالات والعبر
                    </h3>
                  </div>
                  <div className="bg-emerald-50/50 dark:bg-emerald-900/10 p-8 rounded-[2.5rem] border border-emerald-100 dark:border-emerald-500/20">
                    <p className="text-lg text-emerald-800 dark:text-emerald-200 leading-relaxed italic text-right font-medium">
                      {selectedDialogue.الغرض}
                    </p>
                  </div>
                </section>

                {/* Categories & Tags */}
                <section className="flex flex-wrap gap-3 pt-6 border-t border-emerald-100 dark:border-gray-800">
                  <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 text-gray-400 text-xs font-bold rounded-full border border-emerald-50 dark:border-gray-700">
                    <Hash className="w-3 h-3" />
                    <span>التصنيفات:</span>
                  </div>
                  {selectedDialogue.التخصص?.map((cat, cIdx) => (
                    <span key={cIdx} className="px-4 py-2 bg-emerald-600 text-white rounded-full text-xs font-bold shadow-md">
                      {cat}
                    </span>
                  ))}
                </section>
              </div>
              
              {/* Footer */}
              <div className="p-6 bg-white/50 dark:bg-gray-800/50 flex justify-center border-t border-emerald-50 dark:border-gray-800">
                <button 
                  onClick={() => setSelectedDialogue(null)}
                  className="px-10 py-3 bg-emerald-800 hover:bg-emerald-700 text-white rounded-full font-bold shadow-xl transition-all flex items-center gap-2"
                >
                  <Bookmark className="w-4 h-4" />
                  حفظ في المفضلة
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DialoguesPage;
