import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Binary, 
  Hash, 
  BookOpen, 
  X, 
  Sparkles, 
  Calculator,
  Compass,
  Milestone,
  Fingerprint,
  ChevronLeft
} from 'lucide-react';
import arqamData from '../data/arqam_data.json';

const categoryIcons = {
  'أرقام في العبادات': Calculator,
  'أرقام في الكون': Compass,
  'أرقام في التاريخ': Milestone,
  'الوحدانية': Hash,
  'default': Binary
};

const ArqamPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNum, setSelectedNum] = useState(null);
  const [activeCategory, setActiveCategory] = useState('الكل');

  const allCategories = useMemo(() => {
    const categories = new Set(['الكل']);
    arqamData.forEach(d => {
      d.التخصص?.forEach(cat => categories.add(cat));
    });
    return Array.from(categories);
  }, []);

  const filteredData = useMemo(() => {
    return arqamData.filter(d => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = d.الرقم.includes(searchTerm) || 
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
      {/* Digital Grid Background Effect */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.07] z-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:40px_40px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
      </div>

      {/* Hero Section */}
      <section className="text-center mb-16 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-black mb-6 tracking-[0.2em] uppercase border border-emerald-200/50 dark:border-emerald-500/20"
        >
          <Binary className="w-4 h-4" />
          إِنَّآ أَنزَلْنَاهُ قُرْآنًا عَرَبِيًّا
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-6xl md:text-8xl font-black text-emerald-950 dark:text-white mb-6 tracking-tighter"
        >
          أرقام <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-400">القرآن</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-xl text-emerald-800/70 dark:text-emerald-300/60 max-w-2xl mx-auto leading-relaxed font-medium"
        >
          اكتشف دلالات الأعداد والأرقام في كتاب الله. 
          <br />
          من أسرار العبادات إلى عجائب الخلق وتناسق الأرقام.
        </motion.p>
      </section>

      {/* Modern Search Bar */}
      <section className="relative z-30 mb-12 max-w-5xl mx-auto">
        <div className="bg-white/70 dark:bg-gray-900/60 backdrop-blur-2xl p-2 rounded-[2rem] shadow-2xl border border-white/50 dark:border-gray-800/50 flex flex-col md:flex-row gap-2 items-center">
          <div className="relative flex-1 w-full group">
            <Search className="absolute right-6 top-1/2 -translate-y-1/2 text-emerald-500 w-6 h-6 group-focus-within:scale-110 transition-transform" />
            <input
              type="text"
              placeholder="ابحث عن عدد، دلالة رقمية، أو موضوع..."
              className="w-full pr-16 pl-6 py-5 bg-emerald-50/50 dark:bg-gray-800/50 rounded-[1.5rem] border-none focus:ring-2 focus:ring-emerald-500 transition-all text-emerald-950 dark:text-white placeholder:text-emerald-900/30 dark:placeholder:text-emerald-100/20 font-bold"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2 p-2 w-full md:w-auto justify-center">
            {allCategories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-6 py-3 rounded-2xl text-xs font-black transition-all ${
                  activeCategory === cat
                    ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-500/20 scale-105'
                    : 'bg-white dark:bg-gray-800 text-emerald-900/60 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-gray-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Arqam Grid */}
      <AnimatePresence mode="wait">
        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10"
        >
          {filteredData.map((item, idx) => {
            const Icon = getIcon(item.التخصص);
            return (
              <motion.div
                key={idx}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ y: -8, scale: 1.02 }}
                onClick={() => setSelectedNum(item)}
                className="group relative cursor-pointer"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-[3rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative h-full bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl p-8 rounded-[3rem] border border-white/40 dark:border-gray-800/40 shadow-xl hover:shadow-2xl transition-all duration-500 flex flex-col overflow-hidden">
                  {/* Category Badge */}
                  <div className="absolute top-0 left-0 p-8 opacity-[0.02] dark:opacity-[0.05] group-hover:opacity-10 transition-opacity">
                    <Icon className="w-32 h-32" />
                  </div>

                  <div className="flex justify-between items-start mb-8 relative z-10">
                    <div className="w-14 h-14 flex items-center justify-center bg-emerald-500 text-white rounded-[1.2rem] shadow-lg shadow-emerald-500/20 group-hover:rotate-12 transition-transform duration-500">
                      <Icon className="w-7 h-7" />
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] font-black uppercase tracking-widest text-emerald-600/50 dark:text-emerald-400/30 mb-1">الموقع</div>
                      <div className="text-sm font-black text-emerald-950 dark:text-emerald-100">
                        {item.السورة}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-1 relative z-10">
                    <h3 className="text-2xl font-black text-emerald-950 dark:text-white mb-4 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {item.الرقم}
                    </h3>
                    <p className="text-sm text-emerald-900/60 dark:text-emerald-300/40 line-clamp-2 font-medium mb-6">
                      {item.الغرض}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-8 relative z-10">
                    {item.التخصص?.map((tag, tIdx) => (
                      <span key={tIdx} className="px-3 py-1 bg-emerald-500/10 dark:bg-emerald-400/5 text-[10px] font-black text-emerald-700 dark:text-emerald-400 rounded-full border border-emerald-500/20">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="pt-6 border-t border-emerald-900/5 dark:border-white/5 flex justify-between items-center relative z-10">
                    <span className="text-[10px] font-black uppercase tracking-tighter text-emerald-600/40">استكشف السر الرقمي</span>
                    <ChevronLeft className="w-5 h-5 text-emerald-500 group-hover:-translate-x-2 transition-transform" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </AnimatePresence>

      {/* Empty State */}
      {filteredData.length === 0 && (
        <div className="text-center py-24 relative z-10">
          <div className="bg-emerald-50 dark:bg-gray-800/50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 text-emerald-200 dark:text-emerald-800 animate-pulse">
            <Calculator className="w-12 h-12" />
          </div>
          <h3 className="text-2xl font-black text-emerald-950 dark:text-white mb-2">رقم غير موجود</h3>
          <p className="text-emerald-900/40 dark:text-emerald-500">حاول البحث بكلمة أو عدد آخر</p>
        </div>
      )}

      {/* Futuristic Detail Overlay */}
      <AnimatePresence>
        {selectedNum && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10"
          >
            <motion.div 
              className="absolute inset-0 bg-emerald-950/80 backdrop-blur-2xl"
              onClick={() => setSelectedNum(null)}
            />
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 100 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 100 }}
              className="relative w-full max-w-5xl max-h-[85vh] bg-white dark:bg-gray-950 rounded-[4rem] shadow-full overflow-hidden flex flex-col border border-white/20"
            >
              {/* Overlay Background Pattern */}
              <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05] pointer-events-none">
                <div className="grid grid-cols-12 h-full w-full">
                  {[...Array(144)].map((_, i) => (
                    <div key={i} className="border border-emerald-500 p-4 font-mono text-[8px] flex items-center justify-center">
                      {Math.random() > 0.5 ? '1' : '0'}
                    </div>
                  ))}
                </div>
              </div>

              {/* Header */}
              <div className="p-10 pb-8 flex justify-between items-start border-b border-emerald-50 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl relative z-10">
                <div className="flex-1 pr-4">
                  <div className="flex items-center gap-3 text-emerald-500 font-black mb-4">
                    <Binary className="w-6 h-6" />
                    <span className="tracking-[0.3em] uppercase text-xs">كتاب مرقوم</span>
                  </div>
                  <h2 className="text-3xl md:text-5xl font-black text-emerald-950 dark:text-white">
                    {selectedNum.الرقم}
                  </h2>
                  <div className="mt-4 flex items-center gap-2 text-sm text-emerald-900/40 dark:text-emerald-500 font-bold">
                    <BookOpen className="w-4 h-4" />
                    <span>{selectedNum.السورة}</span>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedNum(null)}
                  className="p-4 bg-emerald-50 dark:bg-gray-800 rounded-full shadow-lg hover:rotate-90 transition-all hover:bg-emerald-500 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-10 md:p-16 space-y-16 no-scrollbar relative z-10">
                {/* Quranic Text */}
                <section>
                  <div className="bg-emerald-950/5 dark:bg-white/5 p-12 md:p-20 rounded-[3.5rem] border border-emerald-500/10 dark:border-emerald-500/5 relative overflow-hidden">
                    <div className="absolute -top-10 -right-10 opacity-[0.03]">
                      <Hash className="w-64 h-64" />
                    </div>
                    <div className="quran-text text-3xl md:text-5xl text-emerald-950 dark:text-emerald-50 text-center leading-[2.2] md:leading-[2.5] font-serif dir-rtl relative z-10">
                      {selectedNum.النص}
                    </div>
                  </div>
                </section>

                {/* Insight */}
                <section className="space-y-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-black text-emerald-950 dark:text-white">
                      الدلالة الرقمية والإعجاز
                    </h3>
                  </div>
                  <div className="bg-white dark:bg-gray-900 p-10 rounded-[3rem] border border-emerald-100 dark:border-gray-800 shadow-xl">
                    <p className="text-xl text-emerald-900/80 dark:text-emerald-200 leading-relaxed font-bold text-right">
                      {selectedNum.الغرض}
                    </p>
                  </div>
                </section>
              </div>
              
              {/* Footer */}
              <div className="p-8 bg-emerald-50/50 dark:bg-gray-900/50 backdrop-blur-md flex justify-center border-t border-emerald-50 dark:border-gray-800 relative z-10">
                <button 
                  onClick={() => setSelectedNum(null)}
                  className="px-16 py-5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-3xl font-black shadow-2xl shadow-emerald-500/30 transition-all hover:scale-105"
                >
                  العودة للأرقام
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ArqamPage;
