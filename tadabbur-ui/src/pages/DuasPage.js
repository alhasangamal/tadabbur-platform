import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { 
  Search, 
  Hand, 
  CloudRain, 
  Sun, 
  Moon, 
  Sparkles, 
  X, 
  BookOpen, 
  Heart,
  Shield,
  Zap,
  ChevronLeft,
  Share2,
  Download
} from 'lucide-react';
import ShareModal from '../components/common/ShareModal';
import duasData from '../data/duas_data.json';

const categoryIcons = {
  'مغفرة': Shield,
  'هداية': Sun,
  'حماية': Shield,
  'رزق': CloudRain,
  'صبر': Moon,
  'أنبياء': Heart,
  'توبة': Shield,
  'ذرية': Heart,
  'جامع': Zap,
  'استعاذة': Shield,
  'نصر': Zap,
  'رحمة': CloudRain,
  'ثبات': Shield,
  'يقين': Sun,
  'آخرة': Sparkles,
  'نجاة': Zap,
  'حسن الخاتمة': Sparkles,
  'شكر': Heart,
  'صلاة': BookOpen,
  'والدين': Heart,
  'توفيق': Sparkles,
  'تفكر': BookOpen,
  'عبادة يومية': BookOpen,
  'قبول العمل': Sparkles,
  'default': Sparkles
};

const DuasPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDua, setSelectedDua] = useState(null);
  const [activeCategory, setActiveCategory] = useState('الكل');
  const [shareData, setShareData] = useState(null);

  const allCategories = useMemo(() => {
    const categories = new Set(['الكل']);
    duasData.forEach(d => {
      d.التخصص?.forEach(cat => categories.add(cat));
    });
    return Array.from(categories);
  }, []);

  const filteredData = useMemo(() => {
    return duasData.filter(d => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = d.الدعاء.includes(searchTerm) || 
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

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "الرئيسية",
        "item": window.location.origin
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "أدعية القرآن",
        "item": window.location.href
      }
    ]
  };

  return (
    <div className="min-h-screen bg-transparent pb-20">
      <Helmet>
        <title>أدعية القرآن الكريم | منصة تدبر</title>
        <meta name="description" content="استكشف أجمل الأدعية القرآنية المستجابة، مناجاة الأنبياء والصالحين في كتاب الله مع شرح مقاصدها وفضلها." />
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
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
          <Hand className="w-4 h-4" />
          ادْعُونِي أَسْتَجِبْ لَكُمْ
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-5xl md:text-7xl font-serif font-bold text-emerald-900 dark:text-emerald-100 mb-6"
        >
          أدعية <span className="text-gold-600">القرآن</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-xl text-emerald-800/70 dark:text-emerald-300/60 max-w-2xl mx-auto leading-relaxed italic"
        >
          مناجاة الخالق بكلماته. استكشف الأدعية التي نطق بها الأنبياء والصالحون، واعرف فضلها ومقاصدها الإيمانية.
        </motion.p>
      </section>

      {/* Search & Categories */}
      <section className="relative z-30 mb-12 max-w-5xl mx-auto px-4">
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl p-3 rounded-[2.5rem] shadow-2xl border border-emerald-100 dark:border-gray-800 flex flex-col md:flex-row gap-3 items-center">
          <div className="relative flex-1 w-full group">
            <Search className="absolute right-6 top-1/2 -translate-y-1/2 text-emerald-500 w-5 h-5 group-focus-within:scale-110 transition-transform" />
            <input
              type="text"
              placeholder="ابحث عن دعاء، موضوع، أو فضل معين..."
              className="w-full pr-14 pl-6 py-4 bg-emerald-50/50 dark:bg-gray-800/50 rounded-[1.8rem] border-none focus:ring-2 focus:ring-emerald-500 transition-all text-emerald-950 dark:text-white placeholder:text-emerald-900/30 dark:placeholder:text-emerald-100/20 font-bold"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2 p-2 w-full justify-center">
            {allCategories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-6 py-2 rounded-2xl text-xs font-bold transition-all ${
                  activeCategory === cat
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 scale-105'
                    : 'bg-white dark:bg-gray-800 text-emerald-900/60 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-gray-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Grid */}
      <AnimatePresence mode="wait">
        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4 relative z-10"
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
                whileHover={{ y: -8 }}
                onClick={() => setSelectedDua(item)}
                className="group relative cursor-pointer"
              >
                <div className="absolute inset-0 bg-emerald-500/5 rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative h-full bg-white/70 dark:bg-gray-800/40 backdrop-blur-md p-8 rounded-[2.5rem] border border-emerald-100/50 dark:border-gray-700/50 shadow-xl flex flex-col group-hover:border-emerald-500/30 transition-all duration-300">
                  <div className="flex justify-between items-start mb-6 relative z-10">
                    <div className="w-14 h-14 flex items-center justify-center bg-emerald-500 text-white rounded-2xl shadow-lg shadow-emerald-500/20 group-hover:rotate-12 transition-transform duration-500">
                      <Icon className="w-7 h-7" />
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] font-black uppercase tracking-widest text-emerald-600/50 dark:text-emerald-400/30 mb-1">المصدر</div>
                      <div className="text-sm font-bold text-emerald-900 dark:text-emerald-100">
                        {item.السورة}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-1 relative z-10">
                    <h3 className="text-xl font-serif font-bold text-emerald-950 dark:text-white mb-3 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors leading-relaxed">
                      {item.الدعاء}
                    </h3>
                    <p className="text-sm text-emerald-900/60 dark:text-emerald-300/40 line-clamp-3 font-medium mb-6 leading-relaxed italic">
                      {item.الغرض}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-6 relative z-10">
                    {item.التخصص?.map((tag, tIdx) => (
                      <span key={tIdx} className="px-3 py-1 bg-emerald-500/5 dark:bg-emerald-400/5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 rounded-lg border border-emerald-500/10">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="pt-6 border-t border-emerald-900/5 dark:border-white/5 flex justify-between items-center relative z-10">
                    <div className="flex gap-4">
                      <span className="text-[10px] font-bold uppercase tracking-tighter text-emerald-600/40 group-hover:text-emerald-500 transition-colors">تأمل الدعاء</span>
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
                    </div>
                    <ChevronLeft className="w-5 h-5 text-emerald-500 group-hover:-translate-x-2 transition-transform" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </AnimatePresence>

      {/* Detail Overlay */}
      <AnimatePresence>
        {selectedDua && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10"
          >
            <motion.div 
              className="absolute inset-0 bg-emerald-950/70 backdrop-blur-md"
              onClick={() => setSelectedDua(null)}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 50 }}
              className="relative w-full max-w-5xl max-h-[85vh] bg-[#fcfaf2] dark:bg-gray-950 rounded-[3rem] shadow-full overflow-hidden flex flex-col border border-emerald-100"
            >
              {/* Header */}
              <div className="p-10 pb-8 flex justify-between items-start border-b border-emerald-100 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl relative z-10">
                <div className="flex-1 pr-4">
                  <div className="flex items-center gap-3 text-emerald-500 font-bold mb-4 uppercase tracking-[0.2em] text-xs">
                    <Sparkles className="w-5 h-5" />
                    <span>دعاء قرآني</span>
                  </div>
                  <h2 className="text-3xl md:text-5xl font-serif font-bold text-emerald-950 dark:text-white leading-tight">
                    {selectedDua.الدعاء}
                  </h2>
                  <div className="mt-4 flex items-center gap-2 text-sm text-emerald-900/40 dark:text-emerald-500 font-bold">
                    <BookOpen className="w-4 h-4" />
                    <span>سورة {selectedDua.السورة}</span>
                  </div>
                </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setShareData(selectedDua)}
                      className="p-4 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 rounded-full shadow-lg hover:bg-emerald-600 hover:text-white transition-all"
                      title="مشاركة"
                    >
                      <Share2 className="w-7 h-7" />
                    </button>
                    <button 
                      onClick={() => setSelectedDua(null)}
                      className="p-4 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:rotate-90 transition-all hover:bg-red-500 hover:text-white"
                    >
                      <X className="w-7 h-7 text-emerald-900 dark:text-emerald-100" />
                    </button>
                  </div>
              </div>

              <div className="flex-1 overflow-y-auto p-10 md:p-16 space-y-16 no-scrollbar relative z-10">
                <section>
                  <div className="bg-emerald-900/5 dark:bg-emerald-500/5 p-12 md:p-20 rounded-[3rem] border border-emerald-500/10 text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.03]">
                      <Hand className="w-48 h-48" />
                    </div>
                    <div className="quran-text text-3xl md:text-5xl text-emerald-950 dark:text-emerald-50 leading-[2.2] md:leading-[2.5] font-serif dir-rtl relative z-10">
                      {selectedDua.النص}
                    </div>
                  </div>
                </section>

                {/* Insight Section */}
                <section className="space-y-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                      <Zap className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-bold text-emerald-950 dark:text-white">
                      فضل الدعاء ومقاصده
                    </h3>
                  </div>
                  <div className="bg-white dark:bg-gray-900 p-10 rounded-[2.5rem] border border-emerald-100 dark:border-gray-800 shadow-xl">
                    <p className="text-xl text-emerald-900/80 dark:text-emerald-200 leading-relaxed font-bold text-right italic">
                      {selectedDua.الغرض}
                    </p>
                  </div>
                </section>
              </div>
              
              {/* Footer */}
              <div className="p-8 bg-emerald-50/50 dark:bg-gray-900/50 backdrop-blur-md flex justify-center border-t border-emerald-100 dark:border-gray-800 relative z-10">
                <button 
                  onClick={() => setSelectedDua(null)}
                  className="px-16 py-4 bg-emerald-700 hover:bg-emerald-600 text-white rounded-[2rem] font-bold shadow-xl transition-all hover:scale-105"
                >
                  إغلاق
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <ShareModal 
        isOpen={!!shareData} 
        onClose={() => setShareData(null)} 
        data={shareData} 
        type="dua"
      />
    </div>
  );
};

export default DuasPage;
