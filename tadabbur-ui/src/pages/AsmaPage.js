import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Sparkles, 
  X, 
  BookOpen, 
  Activity,
  Layers,
  Hash,
  ChevronLeft,
  Star,
  Info
} from 'lucide-react';
import asmaData from '../data/asma_data.json';

const AsmaPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedName, setSelectedName] = useState(null);

  const filteredData = useMemo(() => {
    return asmaData.filter(d => {
      return d.الاسم_عربي.includes(searchTerm) || 
             d.الاسم_انجليزي.toLowerCase().includes(searchTerm.toLowerCase()) ||
             d.المعنى.includes(searchTerm) ||
             d.الرقم.toString() === searchTerm;
    });
  }, [searchTerm]);

  return (
    <div className="min-h-screen bg-transparent pb-20">
      {/* Hero Section */}
      <section className="text-center mb-20 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gold-400/5 blur-[120px] rounded-full -z-10 animate-pulse" />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-sm font-bold mb-8 tracking-widest uppercase border border-emerald-100 dark:border-emerald-500/20 shadow-sm"
        >
          <Star className="w-4 h-4 text-gold-500" />
          وَلِلَّهِ الْأَسْمَاءُ الْحُسْنَى فَادْعُوهُ بِهَا
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-6xl md:text-8xl font-serif font-bold text-emerald-950 dark:text-emerald-50 mb-8"
        >
          أسماء الله <span className="text-gold-600 drop-shadow-sm">الحسنى</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-xl text-emerald-800/60 dark:text-emerald-300/40 max-w-3xl mx-auto leading-relaxed font-medium italic"
        >
          رحلة في معاني الجلال والجمال. استكشف دلالات الأسماء الحسنى، إحصائيات ذكرها في القرآن، ونماذج من الآيات التي تجلى فيها كل اسم.
        </motion.p>
      </section>

      {/* Search Bar */}
      <section className="py-4 mb-8 max-w-4xl mx-auto px-4">
        <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-3xl p-2 md:p-3 rounded-[2rem] shadow-2xl border border-emerald-500/10 dark:border-emerald-500/5 ring-1 ring-white/20 dark:ring-black/20">
          <div className="relative group">
            <Search className="absolute right-6 top-1/2 -translate-y-1/2 text-emerald-500 w-5 h-5 group-focus-within:scale-110 transition-transform" />
            <input
              type="text"
              placeholder="ابحث عن اسم، معنى، أو رقم..."
              className="w-full pr-14 pl-8 py-4 bg-emerald-50/20 dark:bg-emerald-950/20 rounded-[1.5rem] border-none focus:ring-2 focus:ring-gold-500/50 transition-all text-emerald-950 dark:text-white placeholder:text-emerald-900/30 dark:placeholder:text-emerald-100/10 font-bold text-base md:text-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Grid of Names */}
      <motion.div 
        layout
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 px-4 mt-8"
      >
        <AnimatePresence mode="popLayout">
          {filteredData.map((name) => (
            <motion.div
              key={name.الرقم}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              whileHover={{ y: -5, scale: 1.05 }}
              onClick={() => setSelectedName(name)}
              className="group relative cursor-pointer"
            >
              {/* Card Glow Effect */}
              <div className="absolute inset-0 bg-gold-400/5 rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="relative bg-white/70 dark:bg-gray-800/40 backdrop-blur-md p-8 rounded-[2.5rem] border border-emerald-100/50 dark:border-gray-700/50 shadow-lg group-hover:shadow-2xl group-hover:border-gold-500/30 transition-all duration-300 text-center h-full flex flex-col justify-center items-center">
                <span className="absolute top-4 left-6 text-[10px] font-black text-emerald-900/10 dark:text-white/5 tracking-tighter">#{name.الرقم}</span>
                
                <div className="text-4xl md:text-5xl font-serif font-bold text-emerald-950 dark:text-white mb-4 group-hover:text-gold-600 transition-colors">
                  {name.الالسم_عربي || name.الاسم_عربي}
                </div>
                
                <div className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-600/70 dark:text-emerald-400/50 mb-4 group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors">
                  {name.الاسم_انجليزي}
                </div>

                <div className="text-sm text-emerald-800/80 dark:text-emerald-100/60 line-clamp-1 font-bold italic group-hover:text-emerald-950 dark:group-hover:text-white transition-colors">
                  {name.المعنى}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Detail Overlay */}
      <AnimatePresence>
        {selectedName && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10"
          >
            <motion.div 
              className="absolute inset-0 bg-emerald-950/80 backdrop-blur-xl"
              onClick={() => setSelectedName(null)}
            />
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 100 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 100 }}
              className="relative w-full max-w-6xl max-h-[90vh] bg-[#fcfaf2] dark:bg-gray-950 rounded-[4rem] shadow-full overflow-hidden flex flex-col border border-gold-500/20"
            >
              {/* Modal Header */}
              <div className="p-10 md:p-14 flex flex-col md:flex-row justify-between items-center border-b border-emerald-100 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-md relative z-10 gap-8">
                <div className="text-center md:text-right w-full md:w-auto">
                  <div className="flex items-center justify-center md:justify-start gap-4 mb-8">
                    <span className="px-4 py-1.5 bg-gold-600 text-white text-[10px] font-black rounded-full shadow-sm">الاسم رقم {selectedName.الرقم}</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-black uppercase tracking-[0.3em] text-xs">{selectedName.الاسم_انجليزي}</span>
                  </div>
                  <h2 className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold text-emerald-950 dark:text-white mb-2 leading-tight">
                    {selectedName.الاسم_عربي}
                  </h2>
                </div>

                <div className="flex gap-4 md:gap-8 bg-emerald-900/5 dark:bg-emerald-500/5 p-6 rounded-[2.5rem] border border-emerald-500/10">
                  <div className="text-center px-4">
                    <div className="text-2xl md:text-3xl font-black text-emerald-950 dark:text-white">{selectedName.عدد_الذكر}</div>
                    <div className="text-[10px] font-bold text-emerald-600/40 uppercase tracking-widest mt-1">مرات الذكر</div>
                  </div>
                  <div className="w-px h-12 bg-emerald-500/10" />
                  <div className="text-center px-4">
                    <div className="text-2xl md:text-3xl font-black text-emerald-950 dark:text-white">{selectedName.عدد_الآيات}</div>
                    <div className="text-[10px] font-bold text-emerald-600/40 uppercase tracking-widest mt-1">عدد الآيات</div>
                  </div>
                  <div className="w-px h-12 bg-emerald-500/10" />
                  <div className="text-center px-4">
                    <div className="text-2xl md:text-3xl font-black text-emerald-950 dark:text-white">{selectedName.عدد_السور}</div>
                    <div className="text-[10px] font-bold text-emerald-600/40 uppercase tracking-widest mt-1">عدد السور</div>
                  </div>
                </div>

                <button 
                  onClick={() => setSelectedName(null)}
                  className="absolute top-8 left-8 p-4 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:rotate-90 transition-all hover:bg-emerald-600 hover:text-white"
                >
                  <X className="w-8 h-8" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-10 md:p-20 space-y-20 no-scrollbar relative z-10">
                {/* Meaning Section */}
                <section className="text-center max-w-4xl mx-auto">
                  <div className="inline-block p-4 bg-gold-500/10 rounded-2xl mb-8">
                    <Info className="w-8 h-8 text-gold-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-emerald-950 dark:text-white mb-6 uppercase tracking-widest">المعنى والدلالة</h3>
                  <p className="text-3xl md:text-4xl font-serif leading-relaxed text-emerald-900/80 dark:text-emerald-100 italic">
                    "{selectedName.المعنى}"
                  </p>
                </section>

                {/* Verses Section */}
                {selectedName.نماذج_الآيات?.length > 0 && (
                  <section className="space-y-12">
                    <div className="flex items-center gap-4 justify-center">
                      <div className="h-px flex-1 bg-emerald-500/10" />
                      <h3 className="text-xl font-black text-emerald-600 uppercase tracking-[0.3em] flex items-center gap-3">
                        <BookOpen className="w-5 h-5" />
                        نماذج من الآيات
                      </h3>
                      <div className="h-px flex-1 bg-emerald-500/10" />
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                      {selectedName.نماذج_الآيات.map((v, vi) => (
                        <div key={vi} className="group/verse bg-white/40 dark:bg-gray-900/40 p-10 rounded-[3rem] border border-emerald-500/10 hover:border-emerald-500/30 transition-all">
                          <div className="quran-text text-3xl md:text-4xl text-emerald-950 dark:text-emerald-50 leading-[2.2] md:leading-[2.5] text-center mb-8 font-serif">
                            {v.النص}
                          </div>
                          <div className="flex justify-center items-center gap-4 pt-6 border-t border-emerald-500/5">
                            <span className="text-xs font-black text-gold-600 tracking-widest uppercase">{v.المرجع}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-10 bg-emerald-900/5 dark:bg-emerald-950/20 flex justify-center border-t border-emerald-100 dark:border-gray-800 relative z-10">
                <button 
                  onClick={() => setSelectedName(null)}
                  className="px-20 py-5 bg-emerald-800 hover:bg-emerald-700 text-white rounded-full font-black shadow-3xl shadow-emerald-500/20 transition-all hover:scale-105"
                >
                  سبحانك ربي
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AsmaPage;
