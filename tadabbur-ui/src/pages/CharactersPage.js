import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Users, 
  BookOpen, 
  ChevronLeft, 
  X, 
  Info, 
  Sparkles, 
  History, 
  ScrollText,
  User as UserIcon,
  Tag as TagIcon
} from 'lucide-react';
import charactersData from '../data/characters_data.json';

const CharactersPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [activeCategory, setActiveCategory] = useState('الكل');

  const allCategories = useMemo(() => {
    const categories = new Set(['الكل']);
    charactersData.forEach(char => {
      if (char.نوع_الشخصية) {
        categories.add(char.نوع_الشخصية.replace(/^[^\s]+\s+/, '')); // Remove emoji for the filter button
      }
    });
    return Array.from(categories);
  }, []);

  const filteredCharacters = useMemo(() => {
    return charactersData.filter(char => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = char.الاسم_عربي.includes(searchTerm) || 
                           char.الاسم_انجليزي.toLowerCase().includes(searchLower) ||
                           char.التصنيفات?.some(tag => tag.includes(searchTerm)) ||
                           char.السور?.includes(searchTerm);
      
      const charTypeClean = char.نوع_الشخصية?.replace(/^[^\s]+\s+/, '');
      const matchesCategory = activeCategory === 'الكل' || charTypeClean === activeCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, activeCategory]);

  const parseSurahs = (surahStr) => {
    if (!surahStr) return [];
    return surahStr.replace(/📖 ذُكر في: /, '').split('، ').map(s => s.trim());
  };

  return (
    <div className="min-h-screen bg-transparent pb-20">
      {/* Hero Section */}
      <section className="text-center mb-16 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-block px-4 py-1.5 rounded-full bg-gold-100 dark:bg-gold-900/30 text-gold-700 dark:text-gold-400 text-sm font-bold mb-6 tracking-wide"
        >
          أَعْلَامٌ خَلَّدَهُمُ الْقُرْآن
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-5xl md:text-7xl font-serif font-bold text-emerald-900 dark:text-emerald-100 mb-6"
        >
          شخصيات <span className="text-gold-600">القرآن</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-lg text-emerald-800/70 dark:text-emerald-300/60 max-w-2xl mx-auto leading-relaxed italic"
        >
          استكشف ملامح الشخصيات القرآنية، خصائصهم، ومواضع ذكرهم في كتاب الله.
          <br />
          تأمل في الدروس والعبر المستفادة من سيرهم العطرة.
        </motion.p>
      </section>

      {/* Control Bar */}
      <section className="relative z-30 mb-12">
        <div className="max-w-4xl mx-auto bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl p-4 rounded-3xl shadow-2xl border border-emerald-100 dark:border-gray-800 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="ابحث عن اسم شخصية، نبي، أو تصنيف..."
              className="w-full pr-12 pl-4 py-3 bg-sand-50 dark:bg-gray-800 rounded-2xl border-none focus:ring-2 focus:ring-emerald-500 transition-all text-emerald-900 dark:text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2 w-full md:w-auto justify-center">
            {allCategories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
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

      {/* Characters Grid */}
      <AnimatePresence mode="wait">
        <motion.div 
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {filteredCharacters.map((char) => (
            <motion.div
              key={char.الاسم_عربي}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              whileHover={{ y: -5 }}
              onClick={() => setSelectedCharacter(char)}
              className="group relative cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-gold-500/5 rounded-[2.5rem] blur-xl opacity-50 group-hover:opacity-100 transition-opacity" />
              <div className="relative h-full bg-white/70 dark:bg-gray-800/40 backdrop-blur-md p-7 rounded-[2.5rem] border border-emerald-100/50 dark:border-gray-700/50 shadow-xl hover:shadow-2xl hover:border-emerald-300/50 transition-all flex flex-col">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-16 h-16 flex items-center justify-center text-4xl bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-900/20 dark:to-gray-800 rounded-2xl shadow-inner border border-emerald-100/20 dark:border-gray-700">
                    {char.أيقونة || '👤'}
                  </div>
                  <div className="flex flex-wrap justify-end gap-1.5 max-w-[50%]">
                    {char.التصنيفات?.slice(0, 3).map((tag, idx) => (
                      <span key={idx} className="px-2.5 py-1 bg-emerald-50/50 dark:bg-emerald-900/30 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 rounded-lg border border-emerald-100/20 dark:border-emerald-500/10">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="flex-1">
                  <h3 className="text-2xl font-serif font-bold text-emerald-900 dark:text-emerald-100 mb-1 group-hover:text-emerald-600 transition-colors leading-tight">
                    {char.الاسم_عربي}
                  </h3>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mb-6 font-medium italic">
                    {char.الاسم_انجليزي}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-5 border-t border-emerald-50/50 dark:border-gray-700/50">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold block">مواضع الذكر</span>
                    <span className="text-lg font-bold text-gold-600 flex items-center gap-2">
                      <History className="w-4 h-4 opacity-70" />
                      {char.عدد_الذكر}
                    </span>
                  </div>
                  <div className="space-y-1 text-left">
                    <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold block">الخصائص</span>
                    <span className="text-lg font-bold text-emerald-600 flex items-center gap-2 justify-end">
                      {char.عدد_الخصائص}
                      <Sparkles className="w-4 h-4 opacity-70" />
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Character Detail Overlay */}
      <AnimatePresence>
        {selectedCharacter && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 overflow-hidden"
          >
            <motion.div 
              className="absolute inset-0 bg-emerald-950/40 backdrop-blur-md"
              onClick={() => setSelectedCharacter(null)}
            />
            <motion.div
              layoutId={selectedCharacter.الاسم_عربي}
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              className="relative w-full max-w-5xl max-h-[90vh] bg-sand-50 dark:bg-gray-900 rounded-[3rem] shadow-full overflow-hidden flex flex-col border border-white/20"
            >
              {/* Header */}
              <div className="p-8 pb-4 flex justify-between items-start border-b border-emerald-100 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 backdrop-blur-md">
                <div className="flex items-center gap-6">
                  <div className="text-6xl p-4 bg-white dark:bg-gray-700 rounded-2xl shadow-lg">
                    {selectedCharacter.أيقونة || '👤'}
                  </div>
                  <div>
                    <h2 className="text-3xl font-serif font-bold text-emerald-900 dark:text-white mb-2">
                      {selectedCharacter.الاسم_عربي}
                    </h2>
                    <div className="flex gap-2">
                      <span className="flex items-center gap-1 px-3 py-1 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 rounded-full text-xs font-bold">
                        <Users className="w-3 h-3" /> {selectedCharacter.نوع_الشخصية}
                      </span>
                      {selectedCharacter.التصنيفات?.map(tag => (
                        <span key={tag} className="flex items-center gap-1 px-3 py-1 bg-gold-100 dark:bg-gold-900/40 text-gold-700 dark:text-gold-300 rounded-full text-xs font-bold">
                          <TagIcon className="w-3 h-3" /> {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedCharacter(null)}
                  className="p-3 bg-white dark:bg-gray-700 rounded-full shadow-lg hover:rotate-90 transition-all hover:bg-emerald-50"
                >
                  <X className="w-6 h-6 text-emerald-800 dark:text-gray-200" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-8 space-y-12 no-scrollbar">
                {/* Stats Summary */}
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-white/50 dark:bg-gray-800/50 p-6 rounded-3xl border border-emerald-100 dark:border-gray-700 shadow-sm">
                    <h4 className="text-gray-400 text-[10px] uppercase tracking-widest font-bold mb-4">ذُكر في السور</h4>
                    <div className="flex flex-wrap gap-2">
                      {parseSurahs(selectedCharacter.السور).map((surah, idx) => (
                        <span key={idx} className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-xl text-xs font-bold border border-emerald-100/50 dark:border-emerald-500/10">
                          {surah}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-emerald-800 to-emerald-950 text-white p-6 rounded-3xl shadow-xl flex flex-col justify-center items-center text-center">
                    <Sparkles className="w-8 h-8 text-gold-400 mb-2" />
                    <div className="text-3xl font-bold">{selectedCharacter.عدد_الخصائص}</div>
                    <div className="text-emerald-200 uppercase tracking-widest text-[10px] font-bold">خاصية قرآنية</div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-emerald-50 dark:border-gray-700 shadow-sm flex flex-col justify-center items-center text-center">
                    <History className="w-8 h-8 text-gold-600 mb-2" />
                    <div className="text-3xl font-bold text-emerald-900 dark:text-white">{selectedCharacter.عدد_الذكر}</div>
                    <div className="text-gray-400 uppercase tracking-widest text-[10px] font-bold">مرة ذُكر</div>
                  </div>
                </div>

                {/* Traits Grid */}
                <div className="space-y-8">
                  <h3 className="text-2xl font-serif font-bold text-emerald-900 dark:text-emerald-100 border-b-2 border-gold-500 pb-2 inline-block">
                    الخصائص والمواضع
                  </h3>
                  
                  <div className="grid grid-cols-1 gap-6">
                    {selectedCharacter.الخصائص.map((trait, idx) => (
                      <div key={idx} className="bg-white dark:bg-gray-800 rounded-[2.5rem] border border-emerald-100 dark:border-gray-700 shadow-xl overflow-hidden group">
                        <div className="p-8 flex flex-col lg:flex-row gap-8">
                          {/* Info */}
                          <div className="lg:w-1/3 space-y-4">
                            <div className="flex items-center gap-3">
                              <span className="w-10 h-10 bg-gold-100 dark:bg-gold-900/30 text-gold-700 dark:text-gold-400 rounded-xl flex items-center justify-center font-bold text-lg">
                                {idx + 1}
                              </span>
                              <h5 className="text-xl font-bold text-emerald-900 dark:text-white leading-tight">
                                {trait.الخاصية}
                              </h5>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed italic border-r-4 border-gold-400 pr-4">
                              {trait.المعنى}
                            </p>
                          </div>

                          {/* References */}
                          <div className="lg:w-2/3 space-y-4">
                            {trait.المراجع.map((ref, ridx) => (
                              <div key={ridx} className="bg-sand-50 dark:bg-gray-900 p-6 rounded-3xl border border-emerald-50/50 dark:border-gray-700 relative group-hover:bg-white dark:group-hover:bg-gray-800 transition-colors">
                                <div className="flex items-center gap-2 text-emerald-600 font-bold mb-3 text-xs">
                                  <BookOpen className="w-3 h-3" />
                                  سورة {ref.السورة} ({ref.الآية})
                                </div>
                                <div className="quran-text text-lg text-emerald-900 dark:text-emerald-100 text-right leading-[2.5] font-serif">
                                  {ref.النص}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-emerald-900/5 dark:bg-emerald-950/20 flex justify-center border-t border-emerald-50 dark:border-gray-800">
                <button 
                  onClick={() => setSelectedCharacter(null)}
                  className="px-8 py-2 bg-emerald-800 text-white rounded-full font-bold shadow-lg hover:bg-emerald-700 transition-all"
                >
                  إغلاق التفاصيل
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CharactersPage;
