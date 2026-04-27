import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  History, 
  BookOpen, 
  X, 
  Sparkles, 
  ScrollText,
  MapPin,
  ChevronLeft,
  Filter,
  Layers,
  Quote
} from 'lucide-react';
import asbabData from '../data/asbab_data.json';

const AsbabPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [activeType, setActiveType] = useState('الكل');

  const types = ['الكل', 'مدنية', 'مكية'];

  const filteredData = useMemo(() => {
    return asbabData.filter(d => {
      const matchesSearch = d.العنوان.includes(searchTerm) || 
                           d.السورة.includes(searchTerm) ||
                           d.سبب_النزول.includes(searchTerm) ||
                           d.المقصد.includes(searchTerm) ||
                           d.التصنيفات?.some(cat => cat.includes(searchTerm));
      
      const matchesType = activeType === 'الكل' || d.النوع.includes(activeType);
      
      return matchesSearch && matchesType;
    });
  }, [searchTerm, activeType]);

  return (
    <div className="min-h-screen bg-transparent pb-20">
      {/* Hero Section */}
      <section className="text-center mb-16 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-emerald-500/5 blur-[100px] rounded-full -z-10" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-block px-4 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold mb-6 tracking-widest uppercase"
        >
          لَقَدْ كَانَ فِي قَصَصِهِمْ عِبْرَةٌ
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-5xl md:text-7xl font-serif font-bold text-emerald-900 dark:text-emerald-100 mb-6"
        >
          أسباب <span className="text-emerald-600">النزول</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-lg text-emerald-800/70 dark:text-emerald-300/60 max-w-2xl mx-auto leading-relaxed italic"
        >
          استكشف السياق التاريخي والأحداث التي صاحبت نزول آيات الذكر الحكيم، لتفهم المقاصد الأعمق والحكمة الإلهية.
        </motion.p>
      </section>

      {/* Search & Filters */}
      <section className="mb-12 max-w-5xl mx-auto px-4">
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl p-4 rounded-3xl shadow-2xl border border-emerald-100 dark:border-gray-800 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-400 w-5 h-5" />
            <input
              type="text"
              placeholder="ابحث عن حدث، سورة، أو كلمة في سبب النزول..."
              className="w-full pr-12 pl-4 py-4 bg-emerald-50/50 dark:bg-gray-800 rounded-2xl border-none focus:ring-2 focus:ring-emerald-500 transition-all text-emerald-950 dark:text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            {types.map(t => (
              <button
                key={t}
                onClick={() => setActiveType(t)}
                className={`px-6 py-2 rounded-2xl text-sm font-bold transition-all ${
                  activeType === t
                    ? 'bg-emerald-600 text-white shadow-lg'
                    : 'bg-emerald-50 dark:bg-gray-800 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Grid */}
      <motion.div 
        layout
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4"
      >
        <AnimatePresence>
          {filteredData.map((item, idx) => (
            <motion.div
              key={idx}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              whileHover={{ y: -5 }}
              onClick={() => setSelectedEvent(item)}
              className="group relative cursor-pointer"
            >
              <div className="absolute inset-0 bg-emerald-500/5 rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative h-full bg-white/70 dark:bg-gray-800/40 backdrop-blur-md p-8 rounded-[2.5rem] border border-emerald-100/50 dark:border-gray-700/50 shadow-xl flex flex-col">
                <div className="flex justify-between items-start mb-6">
                  <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                    item.النوع?.includes('مدنية') 
                      ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' 
                      : 'bg-gold-50 text-gold-600 dark:bg-gold-900/30 dark:text-gold-400'
                  }`}>
                    {item.النوع}
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-emerald-900 dark:text-emerald-100">{item.السورة}</span>
                  </div>
                </div>

                <h3 className="text-xl font-serif font-bold text-emerald-900 dark:text-emerald-100 mb-4 leading-relaxed group-hover:text-emerald-600 transition-colors">
                  {item.العنوان}
                </h3>

                <p className="text-sm text-emerald-800/60 dark:text-emerald-300/40 line-clamp-3 italic mb-6 leading-relaxed">
                  {item.سبب_النزول}
                </p>

                <div className="mt-auto pt-6 border-t border-emerald-50 dark:border-gray-700/50 flex justify-between items-center">
                  <div className="flex flex-wrap gap-1">
                    {item.التصنيفات?.slice(0, 2).map((cat, ci) => (
                      <span key={ci} className="text-[10px] bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 px-2 py-0.5 rounded-lg">
                        {cat}
                      </span>
                    ))}
                  </div>
                  <ChevronLeft className="w-5 h-5 text-emerald-500 group-hover:-translate-x-2 transition-transform" />
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Overlay */}
      <AnimatePresence>
        {selectedEvent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 overflow-hidden"
          >
            <motion.div 
              className="absolute inset-0 bg-emerald-950/60 backdrop-blur-md"
              onClick={() => setSelectedEvent(null)}
            />
            <motion.div
              initial={{ scale: 0.9, y: 50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 50, opacity: 0 }}
              className="relative w-full max-w-5xl max-h-[90vh] bg-[#fcfaf2] dark:bg-gray-900 rounded-[3rem] shadow-full overflow-hidden flex flex-col border border-emerald-200/30"
            >
              {/* Header */}
              <div className="p-8 pb-6 flex justify-between items-start border-b border-emerald-100 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 backdrop-blur-md relative z-10">
                <div className="flex-1 pr-4">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-3 py-1 bg-emerald-600 text-white text-[10px] font-bold rounded-full">{selectedEvent.النوع}</span>
                    <span className="text-emerald-600 font-bold">سورة {selectedEvent.السورة}</span>
                  </div>
                  <h2 className="text-2xl md:text-4xl font-serif font-bold text-emerald-950 dark:text-white leading-relaxed">
                    {selectedEvent.العنوان}
                  </h2>
                </div>
                <button 
                  onClick={() => setSelectedEvent(null)}
                  className="p-3 bg-white dark:bg-gray-700 rounded-full shadow-lg hover:rotate-90 transition-all"
                >
                  <X className="w-6 h-6 text-emerald-800 dark:text-gray-200" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-8 md:p-12 space-y-12 no-scrollbar relative z-10">
                {/* Cause Section */}
                <section className="relative">
                  <div className="absolute -top-6 -right-6 text-emerald-500/10">
                    <Quote className="w-24 h-24" />
                  </div>
                  <h3 className="text-xl font-bold text-emerald-900 dark:text-emerald-100 mb-6 flex items-center gap-3">
                    <History className="w-5 h-5 text-emerald-500" />
                    سبب النزول
                  </h3>
                  <div className="bg-white/60 dark:bg-gray-800/60 p-8 rounded-[2.5rem] border border-emerald-100 dark:border-gray-700 shadow-sm">
                    <p className="text-lg text-emerald-900 dark:text-emerald-100 leading-relaxed italic text-right">
                      {selectedEvent.سبب_النزول}
                    </p>
                    {selectedEvent.المصدر && (
                      <div className="mt-6 pt-6 border-t border-emerald-50 dark:border-gray-700 flex items-center gap-2 text-emerald-600/70 dark:text-emerald-400/50 font-bold text-sm">
                        <span>📚 المصدر:</span>
                        <span>{selectedEvent.المصدر}</span>
                      </div>
                    )}
                  </div>
                </section>

                {/* Purpose Section */}
                <section>
                  <h3 className="text-xl font-bold text-emerald-900 dark:text-emerald-100 mb-6 flex items-center gap-3">
                    <Sparkles className="w-5 h-5 text-gold-500" />
                    المقصد الأعمق
                  </h3>
                  <div className="bg-emerald-900/5 dark:bg-emerald-500/5 p-8 rounded-[2.5rem] border border-emerald-200/20 dark:border-emerald-500/20">
                    <p className="text-lg text-emerald-900/80 dark:text-emerald-200 leading-relaxed font-medium">
                      {selectedEvent.المقصد}
                    </p>
                  </div>
                </section>

                {/* Verses Section */}
                {selectedEvent.الآيات?.length > 0 && (
                  <section>
                    <h3 className="text-xl font-bold text-emerald-900 dark:text-emerald-100 mb-6 flex items-center gap-3">
                      <BookOpen className="w-5 h-5 text-emerald-500" />
                      الآيات المتعلقة
                    </h3>
                    <div className="space-y-4">
                      {selectedEvent.الآيات.map((v, vi) => (
                        <div key={vi} className="bg-white/40 dark:bg-gray-800/40 p-6 rounded-2xl border border-emerald-50 dark:border-gray-700 flex flex-col md:flex-row gap-4 items-center">
                          <div className="shrink-0 w-10 h-10 bg-emerald-500 text-white rounded-full flex items-center justify-center font-serif text-sm">
                            {v.رقم}
                          </div>
                          <div className="quran-text text-xl md:text-2xl text-emerald-950 dark:text-emerald-50 text-center md:text-right leading-loose">
                            {v.نص}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </div>
              
              {/* Footer */}
              <div className="p-6 bg-emerald-900/5 dark:bg-emerald-950/20 flex justify-center border-t border-emerald-50 dark:border-gray-800 relative z-10">
                <button 
                  onClick={() => setSelectedEvent(null)}
                  className="px-12 py-3 bg-emerald-800 hover:bg-emerald-700 text-white rounded-full font-bold shadow-xl transition-all"
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

export default AsbabPage;
