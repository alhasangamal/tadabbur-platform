import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Globe, 
  Moon, 
  Sun, 
  Zap, 
  X, 
  Sparkles, 
  ScrollText,
  Mountain,
  Waves,
  Fingerprint,
  Orbit,
  Bookmark,
  Compass,
  ArrowUpRight,
  Share2,
  BookOpen
} from 'lucide-react';
import cosmicData from '../data/cosmic_data.json';
import ShareModal from '../components/common/ShareModal';

const categoryIcons = {
  'الشمس والقمر': Sun,
  'خلق الإنسان': Fingerprint,
  'خلق الكون': Orbit,
  'الماء والبحار': Waves,
  'الأرض والجبال': Mountain,
  'ظواهر جوية': Zap,
  'عالم الحيوان': Globe,
  'default': Sparkles
};

const CosmicPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVerse, setSelectedVerse] = useState(null);
  const [activeCategory, setActiveCategory] = useState('الكل');
  const [shareData, setShareData] = useState(null);

  // Extract all categories for filtering
  const allCategories = useMemo(() => {
    const categories = new Set(['الكل']);
    cosmicData.forEach(d => {
      d.التخصص?.forEach(cat => categories.add(cat));
    });
    return Array.from(categories);
  }, []);

  // Filter logic
  const filteredData = useMemo(() => {
    return cosmicData.filter(d => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = d.الآية.includes(searchTerm) || 
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
    <div className="min-h-screen bg-transparent pb-20 overflow-x-hidden">
      {/* Hero Section with Cosmic Background */}
      <section className="text-center mb-16 relative pt-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-emerald-500/10 dark:bg-emerald-400/5 blur-[120px] rounded-full -z-10" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-block px-4 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold mb-6 tracking-widest uppercase"
        >
          أَفَلَا يَنْظُرُونَ إِلَى الْإِبِلِ كَيْفَ خُلِقَتْ
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-5xl md:text-7xl font-serif font-bold text-emerald-900 dark:text-emerald-100 mb-6"
        >
          الآيات <span className="text-gold-600">الكونية</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-lg text-emerald-800/70 dark:text-emerald-300/60 max-w-2xl mx-auto leading-relaxed italic"
        >
          تأمل في آيات الله المبثوثة في الآفاق وفي أنفسكم. 
          <br />
          حقائق علمية وإشارات كونية أودعها الخالق في محكم التنزيل قبل أربعة عشر قرناً.
        </motion.p>
      </section>

      {/* Modern Control Bar */}
      <section className="relative z-30 mb-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white/40 dark:bg-gray-900/40 backdrop-blur-2xl p-6 rounded-[2.5rem] shadow-2xl border border-white/40 dark:border-gray-800/40 flex flex-col gap-6">
            <div className="relative w-full">
              <Search className="absolute right-5 top-1/2 -translate-y-1/2 text-emerald-600/50 w-6 h-6" />
              <input
                type="text"
                placeholder="ابحث عن ظاهرة كونية، حقيقة علمية، أو سورة..."
                className="w-full pr-14 pl-6 py-4 bg-white/60 dark:bg-gray-800/60 rounded-2xl border-none focus:ring-2 focus:ring-emerald-500 transition-all text-emerald-900 dark:text-white placeholder:text-gray-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              {allCategories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                    activeCategory === cat
                      ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-200 dark:shadow-none scale-105'
                      : 'bg-white/60 dark:bg-gray-800/60 text-gray-600 dark:text-gray-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Cosmic Grid */}
      <div className="max-w-7xl mx-auto px-4">
        <AnimatePresence mode="wait">
          <motion.div 
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {filteredData.map((item, idx) => {
              const Icon = getIcon(item.التخصص);
              return (
                <motion.div
                  key={idx}
                  layout
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  whileHover={{ y: -10 }}
                  onClick={() => setSelectedVerse(item)}
                  className="group relative"
                >
                  {/* Glowing background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-gold-500/5 to-transparent rounded-[3rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <div className="relative h-full bg-white/60 dark:bg-gray-800/30 backdrop-blur-xl p-8 rounded-[3rem] border border-emerald-100/50 dark:border-gray-700/50 shadow-lg hover:shadow-2xl hover:border-emerald-300 transition-all duration-500 flex flex-col cursor-pointer overflow-hidden">
                    {/* Decorative element */}
                    <div className="absolute -top-10 -left-10 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-colors" />
                    
                    <div className="flex justify-between items-center mb-8">
                      <div className="w-14 h-14 flex items-center justify-center bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-900/40 dark:to-gray-800 rounded-2xl shadow-inner border border-emerald-100/30 dark:border-gray-600 group-hover:rotate-[360deg] transition-transform duration-1000">
                        <Icon className="w-7 h-7 text-emerald-600" />
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] uppercase tracking-widest text-emerald-600/60 font-black mb-1">الموضع</div>
                        <div className="text-sm font-bold text-emerald-900 dark:text-emerald-100 flex items-center gap-1 justify-end">
                          <Bookmark className="w-3 h-3 text-gold-500" />
                          {item.السورة}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="text-2xl font-serif font-bold text-emerald-950 dark:text-white mb-4 leading-snug group-hover:text-emerald-600 transition-colors">
                        {item.الآية}
                      </h3>
                      <p className="text-sm text-emerald-800/50 dark:text-emerald-300/30 line-clamp-3 italic mb-8 font-medium">
                        {item.النص}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-6">
                      {item.التخصص?.map((tag, tIdx) => (
                        <span key={tIdx} className="px-3 py-1 bg-emerald-500/5 dark:bg-emerald-400/5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 rounded-full border border-emerald-500/10">
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="pt-6 border-t border-emerald-50 dark:border-gray-700/50 flex justify-between items-center">
                      <span className="text-xs font-bold text-gold-600">اكتشف الإعجاز</span>
                      <div className="flex gap-4">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setShareData(item);
                          }}
                          className="text-emerald-400 hover:text-emerald-600 transition-colors"
                          title="مشاركة كصورة"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                        <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-gray-700 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all">
                          <ArrowUpRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Cosmic Detail Overlay */}
      <AnimatePresence>
        {selectedVerse && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 overflow-hidden"
          >
            <motion.div 
              className="absolute inset-0 bg-[#020617]/90 backdrop-blur-2xl"
              onClick={() => setSelectedVerse(null)}
            />
            
            {/* Animated Stars Background for Modal */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-white rounded-full"
                  initial={{ 
                    x: Math.random() * window.innerWidth, 
                    y: Math.random() * window.innerHeight,
                    scale: 0
                  }}
                  animate={{ 
                    scale: [0, 1, 0],
                    opacity: [0, 1, 0]
                  }}
                  transition={{ 
                    duration: 2 + Math.random() * 3,
                    repeat: Infinity,
                    delay: Math.random() * 5
                  }}
                />
              ))}
            </div>

            <motion.div
              initial={{ scale: 0.8, y: 100, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.8, y: 100, opacity: 0 }}
              className="relative w-full max-w-5xl max-h-[92vh] bg-white dark:bg-gray-900 rounded-[3.5rem] shadow-full overflow-hidden flex flex-col border border-white/20 dark:border-gray-800"
            >
              {/* Header with Visual Icon */}
              <div className="relative p-10 pb-6 flex justify-between items-start">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/30 rounded-[2rem] flex items-center justify-center shadow-xl border border-emerald-100 dark:border-emerald-800">
                    {React.createElement(getIcon(selectedVerse.التخصص), { className: "w-10 h-10 text-emerald-600" })}
                  </div>
                  <div>
                    <div className="text-gold-600 font-bold text-sm tracking-widest mb-1 flex items-center gap-2">
                      <Compass className="w-4 h-4" />
                      {selectedVerse.السورة}
                    </div>
                    <h2 className="text-3xl md:text-4xl font-serif font-black text-emerald-900 dark:text-white">
                      {selectedVerse.الآية}
                    </h2>
                  </div>
                </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setShareData(selectedVerse)}
                      className="p-4 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 rounded-full shadow-lg hover:bg-emerald-600 hover:text-white transition-all"
                      title="مشاركة"
                    >
                      <Share2 className="w-6 h-6" />
                    </button>
                    <button 
                      onClick={() => setSelectedVerse(null)}
                      className="p-4 bg-emerald-50 dark:bg-gray-800 rounded-full shadow-lg hover:rotate-90 transition-all hover:bg-emerald-100"
                    >
                      <X className="w-6 h-6 text-emerald-800 dark:text-emerald-100" />
                    </button>
                  </div>
              </div>

              {/* Content Area */}
              <div className="flex-1 overflow-y-auto p-10 md:p-14 space-y-16 no-scrollbar">
                {/* The Verse Card */}
                <section>
                  <div className="relative group">
                    <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500/20 to-gold-500/20 rounded-[3rem] blur-2xl opacity-50 group-hover:opacity-100 transition-opacity" />
                    <div className="relative bg-white dark:bg-gray-800/80 p-10 md:p-16 rounded-[3rem] shadow-2xl border border-emerald-50 dark:border-gray-700 text-center">
                      <ScrollText className="absolute top-6 left-6 w-12 h-12 text-emerald-100 dark:text-gray-700" />
                      <div className="quran-text text-3xl md:text-5xl text-emerald-900 dark:text-emerald-50 leading-[2.5] md:leading-[3] font-serif dir-rtl mb-4">
                        {selectedVerse.النص}
                      </div>
                    </div>
                  </div>
                </section>

                {/* Insight & Knowledge */}
                <section className="grid md:grid-cols-1 gap-10">
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <Sparkles className="w-6 h-6 text-gold-500" />
                      <h3 className="text-2xl font-serif font-bold text-emerald-900 dark:text-emerald-100">بصيرة إيمانية وحقيقة علمية</h3>
                    </div>
                    <div className="bg-emerald-50/30 dark:bg-emerald-950/20 p-10 rounded-[3rem] border border-emerald-100 dark:border-emerald-500/20 relative">
                      <div className="absolute top-0 right-10 -translate-y-1/2 px-6 py-2 bg-gold-600 text-white rounded-full text-xs font-black uppercase tracking-widest shadow-lg">التفصيل</div>
                      <p className="text-xl text-emerald-900 dark:text-emerald-100 leading-relaxed font-medium text-right dir-rtl">
                        {selectedVerse.الغرض}
                      </p>
                    </div>
                  </div>
                </section>

                {/* Tags & Related */}
                <div className="flex flex-wrap gap-4 pt-10 border-t border-emerald-100 dark:border-gray-800">
                  {selectedVerse.التخصص?.map((tag, idx) => (
                    <span key={idx} className="px-6 py-2 bg-emerald-50 dark:bg-gray-800 text-emerald-700 dark:text-emerald-400 rounded-full text-sm font-bold border border-emerald-100 dark:border-gray-700">
                      # {tag}
                    </span>
                  ))}
                </div>
              </div>
              
              {/* Footer */}
              <div className="p-8 bg-emerald-900 text-white flex justify-center items-center gap-10">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gold-500 rounded-full animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-widest text-emerald-200">الإعجاز العلمي في القرآن الكريم</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Share Modal */}
      <ShareModal 
        isOpen={!!shareData} 
        onClose={() => setShareData(null)} 
        data={shareData} 
        type="cosmic"
      />
    </div>
  );
};

export default CosmicPage;
