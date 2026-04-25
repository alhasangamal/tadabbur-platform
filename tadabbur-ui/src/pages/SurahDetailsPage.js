import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useQuranData } from "../context/QuranDataContext";
import { useAudio, RECITERS } from "../context/AudioContext";
import { Loader2, ArrowLeft, ArrowRight, BookOpen, MapPin, Moon, Play, Pause, ChevronDown, BookMarked, X } from "lucide-react";

const TAFSIR_OPTIONS = [
  { id: 14, name: 'تفسير ابن كثير', slug: 'ar-tafsir-ibn-kathir' },
  { id: 90, name: 'تفسير القرطبي', slug: 'ar-tafseer-al-qurtubi' },
  { id: 16, name: 'التفسير الميسر', slug: 'ar-tafsir-muyassar' },
  { id: 91, name: 'تفسير السعدي', slug: 'ar-tafseer-al-saddi' },
  { id: 93, name: 'التفسير الوسيط (طنطاوي)', slug: 'ar-tafsir-al-wasit' },
  { id: 94, name: 'تفسير البغوي', slug: 'ar-tafsir-al-baghawi' },
  { id: 15, name: 'تفسير الطبري', slug: 'ar-tafsir-al-tabari' },
];

export default function SurahDetailsPage() {
  const { id } = useParams();
  const { isRtl, theme, surahs } = useQuranData();
  const { playSurah, isPlaying, currentSurah, isLoading: audioLoading, resetAudio } = useAudio();
  
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedTopic, setExpandedTopic] = useState(null);
  const [topicVerses, setTopicVerses] = useState({}); // Cache for verses
  const [versesLoading, setVersesLoading] = useState(false);

  // Tafsir state
  const [showTafsirMenu, setShowTafsirMenu] = useState(false);
  const [selectedTafsir, setSelectedTafsir] = useState(null);
  const [tafsirData, setTafsirData] = useState([]);
  const [tafsirLoading, setTafsirLoading] = useState(false);
  const [tafsirPage, setTafsirPage] = useState(1);
  const [tafsirPagination, setTafsirPagination] = useState(null);

  const surahObj = surahs?.[id] || {};
  const surahName = surahObj?.name_ar || `سورة ${id}`;
  const otherNames = surahObj?.other_names || "";
  const namingReason = surahObj?.naming_reason || "";
  
  const isMakki = surahObj?.revelation_type?.toLowerCase?.() === 'makki';
  const revelationType = isMakki ? 'مكية' : 'مدنية';
  
  const isCurrentPlaying = isPlaying && currentSurah?.surah_number === parseInt(id);

  useEffect(() => {
    const API_BASE = process.env.REACT_APP_API_URL || 'https://tadabbur-api.onrender.com';
    const fetchTopics = async () => {
      try {
        const res = await axios.get(`${API_BASE}/surahs/${id}/topics`);
        setTopics(res.data.topics || []);
      } catch (err) {
        console.error("Error fetching topics:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTopics();
  }, [id]);

  // Reset tafsir when surah changes
  useEffect(() => {
    setSelectedTafsir(null);
    setTafsirData([]);
    setTafsirPage(1);
    setTafsirPagination(null);
  }, [id]);

  const handleToggleTopic = async (topicId) => {
    if (expandedTopic === topicId) {
      setExpandedTopic(null);
      return;
    }
    setExpandedTopic(topicId);
    
    if (!topicVerses[topicId]) {
      const API_BASE = process.env.REACT_APP_API_URL || 'https://tadabbur-api.onrender.com';
      setVersesLoading(true);
      try {
        const res = await axios.get(`${API_BASE}/topics/${topicId}/verses`);
        setTopicVerses(prev => ({ ...prev, [topicId]: res.data.verses }));
      } catch (err) {
        console.error("Error fetching verses:", err);
      } finally {
        setVersesLoading(false);
      }
    }
  };

  const fetchTafsir = async (tafsirId, page = 1) => {
    setTafsirLoading(true);
    try {
      const QURAN_API = 'https://api.quran.com/api/v4';
      const res = await axios.get(`${QURAN_API}/tafsirs/${tafsirId}/by_chapter/${id}?per_page=10&page=${page}`);
      const tafsirs = res.data?.tafsirs || [];
      setTafsirData(prev => page === 1 ? tafsirs : [...prev, ...tafsirs]);
      setTafsirPagination(res.data?.pagination || null);
    } catch (err) {
      console.error("Error fetching tafsir:", err);
    } finally {
      setTafsirLoading(false);
    }
  };

  const handleSelectTafsir = (tafsir) => {
    setSelectedTafsir(tafsir);
    setShowTafsirMenu(false);
    setTafsirData([]);
    setTafsirPage(1);
    fetchTafsir(tafsir.id, 1);
  };

  const handleLoadMore = () => {
    const nextPage = tafsirPage + 1;
    setTafsirPage(nextPage);
    fetchTafsir(selectedTafsir.id, nextPage);
  };

  const closeTafsir = () => {
    setSelectedTafsir(null);
    setTafsirData([]);
    setTafsirPage(1);
    setTafsirPagination(null);
  };

  const stripHtml = (html) => {
    if (!html) return '';
    return html.replace(/<[^>]*>?/gm, '');
  };

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto space-y-8 animate-fade pb-20">
        <div className="flex items-center gap-2 text-gray-300 dark:text-gray-700 bg-white dark:bg-gray-800 px-4 py-2 rounded-xl w-32 h-10 animate-pulse"></div>
        <div className="bg-emerald-900/40 rounded-[2rem] p-10 md:p-16 text-center h-64 animate-pulse"></div>
        <div className="mt-12 space-y-4">
          <div className="w-48 h-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse mb-8"></div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 flex items-center justify-between animate-pulse">
              <div className="flex items-center gap-6">
                <div className="w-10 h-10 rounded-xl bg-gray-200 dark:bg-gray-700"></div>
                <div className="space-y-2">
                  <div className="w-48 h-5 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                  <div className="w-32 h-3 bg-gray-100 dark:bg-gray-800 rounded-full"></div>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-fade pb-20">
      {/* Back Navigation */}
      <div className="flex items-center">
        <Link 
          to="/surahs" 
          className="flex items-center gap-2 text-gray-500 hover:text-emerald-600 dark:text-gray-400 dark:hover:text-emerald-400 font-medium bg-white dark:bg-gray-800 px-4 py-2 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors"
        >
          {isRtl ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
          <span>{isRtl ? "العودة للفهرس" : "Back to Index"}</span>
        </Link>
      </div>

      {/* Surah Header Card */}
      <div className="relative overflow-hidden bg-emerald-900 rounded-[2rem] p-10 md:p-16 text-center shadow-xl">
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23d97706\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
        
        <div className="relative z-10 flex flex-col items-center">
            <div className="flex items-center gap-4 md:gap-6 mb-8 flex-wrap justify-center">
               <div className="w-16 h-16 bg-emerald-800/50 border border-emerald-700 rounded-2xl flex items-center justify-center text-gold-400 text-2xl font-bold">
                 {id}
               </div>

               <button 
                 onClick={() => playSurah({ 
                   surah_number: parseInt(id), 
                   surah_name_ar: surahName, 
                   surah_name_en: surahObj?.surah_name_en || surahObj?.name_en || "" 
                 })}
                 disabled={audioLoading}
                 className={`group relative flex items-center gap-3 px-6 py-3 rounded-2xl transition-all duration-300 font-bold overflow-hidden ${
                   isCurrentPlaying 
                     ? 'bg-emerald-500 text-black shadow-[0_0_30px_rgba(16,185,129,0.4)]' 
                     : 'bg-white/10 text-white hover:bg-white/20 border border-white/10'
                 }`}
               >
                  <span>{isCurrentPlaying ? "جاري الاستماع..." : "استماع للسورة"}</span>
                  
                  {isCurrentPlaying && (
                    <span className="flex gap-0.5 ml-2">
                      <span className="w-1 h-3 bg-black animate-bounce" style={{ animationDelay: '0s' }}></span>
                      <span className="w-1 h-4 bg-black animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                      <span className="w-1 h-2 bg-black animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                    </span>
                  )}
               </button>

               {/* Tafsir Dropdown Button */}
               <div className="relative">
                 <button
                   onClick={() => setShowTafsirMenu(!showTafsirMenu)}
                   className={`flex items-center gap-2 px-5 py-3 rounded-2xl transition-all duration-300 font-bold ${
                     selectedTafsir
                       ? 'bg-gold-500 text-black shadow-[0_0_20px_rgba(217,119,6,0.3)]'
                       : 'bg-white/10 text-white hover:bg-white/20 border border-white/10'
                   }`}
                 >
                   <BookMarked className="w-5 h-5" />
                   <span>{selectedTafsir ? selectedTafsir.name : 'التفاسير'}</span>
                   <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showTafsirMenu ? 'rotate-180' : ''}`} />
                 </button>

                 <AnimatePresence>
                   {showTafsirMenu && (
                     <motion.div
                       initial={{ opacity: 0, y: -8, scale: 0.95 }}
                       animate={{ opacity: 1, y: 0, scale: 1 }}
                       exit={{ opacity: 0, y: -8, scale: 0.95 }}
                       transition={{ duration: 0.2 }}
                       className="absolute top-full mt-2 right-0 w-64 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
                     >
                       <div className="p-2 max-h-72 overflow-y-auto">
                         {TAFSIR_OPTIONS.map((tafsir) => (
                           <button
                             key={tafsir.id}
                             onClick={() => handleSelectTafsir(tafsir)}
                             className={`w-full text-right px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                               selectedTafsir?.id === tafsir.id
                                 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300'
                                 : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                             }`}
                           >
                             {tafsir.name}
                           </button>
                         ))}
                       </div>
                     </motion.div>
                   )}
                 </AnimatePresence>
               </div>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-serif text-white font-bold mb-2 tracking-tight" style={{ lineHeight: '1.2' }}>
              {surahName}
            </h1>
            
            {otherNames && (
              <div className="text-emerald-200/60 font-serif text-lg md:text-xl mb-6 flex items-center gap-2">
                <span className="text-xs px-2 py-0.5 border border-emerald-700 rounded text-emerald-300">مسميات أخرى</span>
                {otherNames}
              </div>
            )}
            
            <div className="flex items-center gap-4 text-emerald-100/80 font-medium">
              <div className="flex items-center gap-1.5 bg-emerald-800/40 px-3 py-1 rounded-full border border-emerald-700/50">
                {isMakki ? <Moon className="w-4 h-4 text-gold-400" /> : <MapPin className="w-4 h-4 text-emerald-400" />}
                <span>{revelationType}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-emerald-800/40 px-3 py-1 rounded-full border border-emerald-700/50">
                <BookOpen className="w-4 h-4 text-gold-400" />
                <span dir="ltr">{topics.length} محاور</span>
              </div>
            </div>

            {namingReason && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 max-w-2xl w-full self-start bg-black/20 backdrop-blur-sm border border-emerald-700/30 rounded-2xl p-6 text-right"
              >
                <h3 className="text-gold-400 text-sm font-bold mb-2 flex items-center gap-2 justify-start">
                  <span className="text-lg">💡</span> سبب تسمية السورة
                </h3>
                <p className="text-emerald-50/90 text-sm leading-relaxed">
                  {namingReason}
                </p>
              </motion.div>
            )}
            
            {id !== "9" && (
              <div className="mt-10 text-2xl text-gold-400 font-serif opacity-90">
                بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
              </div>
            )}
        </div>
      </div>

      {/* Tafsir Section */}
      <AnimatePresence>
        {selectedTafsir && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white dark:bg-gray-800 rounded-[2rem] shadow-xl border border-gold-200 dark:border-gold-900/30 overflow-hidden"
          >
            {/* Tafsir Header */}
            <div className="bg-gradient-to-l from-gold-50 to-amber-50 dark:from-gray-800 dark:to-gray-900 px-8 py-6 flex items-center justify-between border-b border-gold-100 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gold-500/20 dark:bg-gold-500/10 flex items-center justify-center">
                  <BookMarked className="w-5 h-5 text-gold-600 dark:text-gold-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">{selectedTafsir.name}</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">سورة {surahName}</p>
                </div>
              </div>
              <button
                onClick={closeTafsir}
                className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-red-100 dark:hover:bg-red-900/30 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tafsir Content */}
            <div className="p-6 md:p-8 max-h-[70vh] overflow-y-auto" style={{ direction: 'rtl' }}>
              {tafsirLoading && tafsirData.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-4">
                  <Loader2 className="w-10 h-10 text-gold-500 animate-spin" />
                  <p className="text-gray-500 dark:text-gray-400 font-medium">جاري تحميل التفسير...</p>
                </div>
              ) : tafsirData.length === 0 ? (
                <div className="text-center py-16 text-gray-400 dark:text-gray-500">
                  لا يوجد تفسير متاح لهذه السورة حالياً.
                </div>
              ) : (
                <div className="space-y-6">
                  {tafsirData.map((item, idx) => (
                    <div key={idx} className="bg-sand-50/50 dark:bg-gray-900/30 rounded-2xl p-6 border border-gray-100 dark:border-gray-700/50">
                      <div className="flex items-center gap-2 mb-4">
                        <span className="inline-flex items-center justify-center min-w-[2rem] h-8 px-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 text-sm font-bold border border-emerald-200 dark:border-emerald-800">
                          {item.verse_key?.split(':')[1] || idx + 1}
                        </span>
                        <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">
                          الآية {item.verse_key}
                        </span>
                      </div>
                      <p className="text-gray-800 dark:text-gray-200 leading-loose text-base font-medium whitespace-pre-wrap">
                        {stripHtml(item.text)}
                      </p>
                    </div>
                  ))}

                  {/* Load More */}
                  {tafsirPagination && tafsirPagination.next_page && (
                    <div className="flex justify-center pt-4 pb-2">
                      <button
                        onClick={handleLoadMore}
                        disabled={tafsirLoading}
                        className="flex items-center gap-2 px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl transition-colors shadow-lg disabled:opacity-50"
                      >
                        {tafsirLoading ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          'تحميل المزيد'
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 flex items-center gap-3">
          <div className="w-2 h-8 bg-gold-500 rounded-full" />
          البناء المعماري الموضوعي
        </h2>

        {topics.length === 0 ? (
          <div className="bg-sand-50 dark:bg-gray-800 rounded-2xl p-8 text-center text-gray-500 dark:text-gray-400 border border-dashed border-gray-300 dark:border-gray-700">
            لا توجد بيانات موضوعية متوفرة لهذه السورة حالياً.
          </div>
        ) : (
          <div className="space-y-4">
            {topics.map((topic, index) => {
              const isExpanded = expandedTopic === topic.id;
              return (
                <div 
                  key={topic.id}
                  className={`bg-white dark:bg-gray-800 rounded-2xl border transition-all duration-300 overflow-hidden ${
                    isExpanded 
                      ? 'border-emerald-500 dark:border-emerald-500 shadow-lg' 
                      : 'border-gray-100 dark:border-gray-700 shadow-sm hover:border-emerald-200 dark:hover:border-emerald-800'
                  }`}
                >
                  <button 
                    onClick={() => handleToggleTopic(topic.id)}
                    className="w-full text-right p-6 px-8 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-6">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg border-2 ${
                        isExpanded ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/50 dark:text-emerald-400 dark:border-emerald-800' : 'bg-sand-50 text-gray-400 border-transparent dark:bg-gray-900'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="flex flex-col">
                        <span className={`text-xl font-bold ${isExpanded ? 'text-emerald-800 dark:text-emerald-400' : 'text-gray-800 dark:text-gray-200'} transition-colors`}>
                          {topic.title_ar}
                        </span>
                        <span className="text-gray-400 dark:text-gray-500 text-sm font-medium mt-1">
                          نطاق الآيات: {topic.verses_range}
                        </span>
                      </div>
                    </div>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-400 transition-transform duration-300 ${isExpanded ? 'rotate-180 bg-emerald-50 text-emerald-600 dark:bg-emerald-900/50' : ''}`}>
                      <ChevronDown className="w-5 h-5 text-current" />
                    </div>
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="p-8 pt-2 border-t border-gray-50 dark:border-gray-700/50 bg-sand-50/50 dark:bg-gray-900/20">
                          {versesLoading && !topicVerses[topic.id] ? (
                            <div className="flex justify-center p-8">
                              <Loader2 className="w-8 h-8 text-gold-500 animate-spin" />
                            </div>
                          ) : (
                            <div className="space-y-6">
                              {topicVerses[topic.id]?.length > 0 ? (
                                topicVerses[topic.id].map((v, i) => (
                                  <div key={i} className="bg-white dark:bg-gray-800/50 rounded-2xl p-6 border border-emerald-50 dark:border-emerald-900/30 mb-4 shadow-sm">
                                    <p className="quran-text">
                                      {v.text_uthmani} 
                                      <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 text-sm mr-4 border border-emerald-100 dark:border-emerald-800 font-bold">
                                        {v.ayah_key.split(':')[1]}
                                      </span>
                                    </p>
                                  </div>
                                ))
                              ) : (
                                <p className="text-gray-500 text-center">لا يوجد نصوص آيات مسجلة لهذا المقطع</p>
                              )}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
