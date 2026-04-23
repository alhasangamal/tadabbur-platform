import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, BookOpen, ChevronLeft, ChevronRight, X, Info, MapPin, Tag as TagIcon, Sparkles, History, ScrollText } from 'lucide-react';
import storiesData from '../data/stories_data.json';

const emojiMap = {
  "آدم عليه السلام": "🌱",
  "نوح عليه السلام": "🚢",
  "إبراهيم عليه السلام": "🔥",
  "موسى وفرعون": "🌊",
  "يوسف عليه السلام": "👑",
  "عيسى ومريم": "✨",
  "لوط عليه السلام": "🏙️",
  "هود وصالح (عاد وثمود)": "🌪️",
  "داود وسليمان": "🐜",
  "أصحاب الكهف": "⛰️",
  "ذو القرنين": "🧱",
  "أيوب عليه السلام": "🩹",
  "يونس عليه السلام": "🐳",
  "شعيب عليه السلام": "⚖️",
  "قارون": "💰",
  "الخضر وموسى": "🛶",
  "زكريا ويحيى": "🕊️",
  "طالوت وجالوت وداود": "🗡️",
  "أصحاب الأخدود": "🔥"
};

const StoriesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStory, setSelectedStory] = useState(null);
  const [activeTag, setActiveTag] = useState('الكل');

  const allTags = useMemo(() => {
    const tags = new Set(['الكل']);
    storiesData.forEach(story => {
      story.التاجز?.forEach(tag => tags.add(tag));
    });
    return Array.from(tags);
  }, []);

  const filteredStories = useMemo(() => {
    return storiesData.filter(story => {
      const matchesSearch = story.اسم_صاحب_القصة.includes(searchTerm) || 
                           story.شرح_مبسط.includes(searchTerm);
      const matchesTag = activeTag === 'الكل' || story.التاجز?.includes(activeTag);
      return matchesSearch && matchesTag;
    });
  }, [searchTerm, activeTag]);

  return (
    <div className="min-h-screen bg-transparent pb-20">
      {/* Hero Section */}
      <section className="text-center mb-16 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-block px-4 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-sm font-bold mb-6 tracking-wide"
        >
          عِبَرٌ وَآيَاتٌ خَالِدَة
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-5xl md:text-7xl font-serif font-bold text-emerald-900 dark:text-emerald-100 mb-6"
        >
          القصص <span className="text-gold-600">القرآنية</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-lg text-emerald-800/70 dark:text-emerald-300/60 max-w-2xl mx-auto leading-relaxed italic"
        >
          "نَحْنُ نَقُصُّ عَلَيْكَ أَحْسَنَ الْقَصَصِ بِمَا أَوْحَيْنَا إِلَيْكَ هَذَا الْقُرْآنَ"
          <br />
          تأمل في حكمة تكرار القصص والزوايا البيانية المختلفة لكل سورة.
        </motion.p>
      </section>

      {/* Control Bar */}
      <section className="relative z-30 mb-12">
        <div className="max-w-4xl mx-auto bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl p-4 rounded-3xl shadow-2xl border border-emerald-100 dark:border-gray-800 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="ابحث عن قصة نبي أو موضع..."
              className="w-full pr-12 pl-4 py-3 bg-sand-50 dark:bg-gray-800 rounded-2xl border-none focus:ring-2 focus:ring-emerald-500 transition-all text-emerald-900 dark:text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2 w-full md:w-auto justify-center">
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => setActiveTag(tag)}
                className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                  activeTag === tag
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200 dark:shadow-none'
                    : 'bg-sand-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-emerald-50'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Story Grid */}
      <AnimatePresence mode="wait">
        <motion.div 
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {filteredStories.map((story) => (
            <motion.div
              key={story.اسم_صاحب_القصة}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              whileHover={{ y: -5 }}
              onClick={() => setSelectedStory(story)}
              className="group relative cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-gold-500/10 rounded-[2rem] blur-2xl group-hover:blur-3xl transition-all opacity-0 group-hover:opacity-100" />
              <div className="relative bg-white dark:bg-gray-800/50 p-6 rounded-[2rem] border border-emerald-100 dark:border-gray-700 shadow-xl dark:shadow-2xl overflow-hidden group-hover:border-emerald-300 transition-all">
                <div className="flex justify-between items-start mb-6">
                  <div className="text-4xl bg-emerald-50 dark:bg-emerald-900/30 p-4 rounded-2xl shadow-inner">
                    {emojiMap[story.اسم_صاحب_القصة] || '📜'}
                  </div>
                  <div className="flex flex-wrap items-end gap-1 max-w-[50%]">
                    {story.التاجز?.map((tag, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-sand-100 dark:bg-gray-700 text-[10px] font-bold text-emerald-800 dark:text-emerald-400 rounded-lg whitespace-nowrap">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                
                <h3 className="text-xl font-serif font-bold text-emerald-900 dark:text-emerald-100 mb-3 group-hover:text-emerald-600 transition-colors">
                  {story.اسم_صاحب_القصة}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed mb-4">
                  {story.شرح_مبسط}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-emerald-50 dark:border-gray-700">
                  <span className="text-xs font-bold text-gold-600 flex items-center gap-1">
                    <History className="w-3 h-3" />
                    {story.المواضع.length} مَوَاضِع
                  </span>
                  <div className="flex items-center gap-1 text-emerald-600 font-bold text-sm">
                    تَأَمَّل <ChevronLeft className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Story Detail Overlay */}
      <AnimatePresence>
        {selectedStory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 overflow-hidden"
          >
            <motion.div 
              className="absolute inset-0 bg-emerald-950/40 backdrop-blur-md"
              onClick={() => setSelectedStory(null)}
            />
            <motion.div
              layoutId={selectedStory.اسم_صاحب_القصة}
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              className="relative w-full max-w-5xl max-h-[90vh] bg-sand-50 dark:bg-gray-900 rounded-[3rem] shadow-full overflow-hidden flex flex-col border border-white/20"
            >
              {/* Header */}
              <div className="p-8 pb-4 flex justify-between items-start border-b border-emerald-100 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 backdrop-blur-md">
                <div className="flex items-center gap-6">
                  <div className="text-6xl">{emojiMap[selectedStory.اسم_صاحب_القصة] || '📜'}</div>
                  <div>
                    <h2 className="text-3xl font-serif font-bold text-emerald-900 dark:text-white mb-2">
                      قصة {selectedStory.اسم_صاحب_القصة}
                    </h2>
                    <div className="flex gap-2">
                      {selectedStory.التاجز?.map(tag => (
                        <span key={tag} className="flex items-center gap-1 px-3 py-1 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 rounded-full text-xs font-bold">
                          <TagIcon className="w-3 h-3" /> {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedStory(null)}
                  className="p-3 bg-white dark:bg-gray-700 rounded-full shadow-lg hover:rotate-90 transition-all hover:bg-emerald-50"
                >
                  <X className="w-6 h-6 text-emerald-800 dark:text-gray-200" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-8 space-y-12 no-scrollbar">
                {/* Intro Card */}
                <div className="grid md:grid-cols-3 gap-8">
                  <div className="md:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-emerald-50 dark:border-gray-700 shadow-sm relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-5">
                        <ScrollText className="w-24 h-24" />
                      </div>
                      <h4 className="text-gold-600 font-bold mb-4 flex items-center gap-2">
                        <Info className="w-5 h-5" /> فَلْسَفَةُ الـتَّكْرَار
                      </h4>
                      <p className="text-xl text-emerald-900 dark:text-emerald-100 leading-relaxed font-serif">
                        {selectedStory.شرح_مبسط}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      {selectedStory.المحاور_عبر_السور?.map((محور, i) => (
                        <span key={i} className="px-4 py-2 bg-white/50 dark:bg-gray-800/50 border border-emerald-100 dark:border-gray-700 rounded-2xl text-sm font-bold text-emerald-800 dark:text-emerald-400">
                           {محور}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-emerald-800 to-emerald-950 text-white p-8 rounded-3xl shadow-xl flex flex-col justify-center items-center text-center">
                    <Sparkles className="w-10 h-10 text-gold-400 mb-4" />
                    <div className="text-4xl font-bold mb-2">{selectedStory.المواضع.length}</div>
                    <div className="text-emerald-200 uppercase tracking-widest text-xs font-bold">بَرَاعَة بَيَانِيَّة</div>
                    <p className="text-sm mt-4 text-emerald-100/70">
                      تتوزع مشاهد هذه القصة عبر السور، كل مشهد يخدم سياقاً عقدياً أو تشريعياً فريداً.
                    </p>
                  </div>
                </div>

                {/* Locations Grid */}
                <div className="space-y-8">
                  <h3 className="text-2xl font-serif font-bold text-emerald-900 dark:text-emerald-100 border-b-2 border-gold-500 pb-2 inline-block">
                    المواضع والزوايا البيانية
                  </h3>
                  
                  <div className="grid grid-cols-1 gap-8">
                    {selectedStory.المواضع.map((mowda, idx) => (
                      <div key={idx} className="bg-white dark:bg-gray-800 rounded-[2.5rem] border border-emerald-100 dark:border-gray-700 shadow-xl overflow-hidden group">
                        <div className="p-8 md:p-10 flex flex-col lg:flex-row gap-10">
                          {/* Context & Info */}
                          <div className="lg:w-1/3 space-y-6">
                            <div className="flex items-center gap-3">
                              <span className="w-10 h-10 bg-gold-100 dark:bg-gold-900/30 text-gold-700 dark:text-gold-400 rounded-xl flex items-center justify-center font-bold text-lg">
                                {idx + 1}
                              </span>
                              <h5 className="text-xl font-bold text-emerald-900 dark:text-white">
                                {mowda.title.replace('🔍 ', '')}
                              </h5>
                            </div>
                            
                            <div className="space-y-4">
                              <div className="flex items-center gap-2 text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-900/20 px-4 py-2 rounded-xl w-fit">
                                <BookOpen className="w-4 h-4" />
                                {mowda.surah_name} ({mowda.ayah_range})
                              </div>
                              <p className="text-sm text-gray-500 dark:text-gray-400 bg-sand-50 dark:bg-gray-900/50 p-6 rounded-2xl italic border-r-4 border-gold-400 leading-relaxed shadow-inner">
                                {mowda.context}
                              </p>
                            </div>
                          </div>

                          {/* Verse Display */}
                          <div className="lg:w-2/3">
                            {mowda.text ? (
                              <div className="bg-[#fcfbf9] dark:bg-gray-900 p-8 rounded-3xl border border-emerald-50/50 dark:border-gray-700 shadow-inner relative group-hover:bg-white dark:group-hover:bg-gray-800 transition-colors">
                                <div className="absolute top-4 left-4 opacity-10 group-hover:scale-110 transition-transform">
                                   <MapPin className="w-12 h-12 text-emerald-800" />
                                </div>
                                <div className="text-3xl md:text-3xl font-me-quran select-none leading-[2.2] md:leading-[2.5] text-center md:text-right">
                                  {mowda.text}
                                </div>
                              </div>
                            ) : (
                              <div className="h-full flex items-center justify-center bg-sand-100 dark:bg-gray-800/50 rounded-3xl border-2 border-dashed border-emerald-100 dark:border-gray-700 opacity-50">
                                <p className="text-emerald-800/50 dark:text-emerald-400/50 font-bold">
                                  يتم استعراض هذا الموضع من خلال سياق السورة العام
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-emerald-900/5 dark:bg-emerald-950/20 flex justify-center border-t border-emerald-50 dark:border-gray-800">
                <button 
                  onClick={() => setSelectedStory(null)}
                  className="px-8 py-2 bg-emerald-800 text-white rounded-full font-bold shadow-lg hover:bg-emerald-700 transition-all"
                >
                  إغلاق المتصفح
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StoriesPage;
