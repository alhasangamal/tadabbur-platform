import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Helmet } from "react-helmet-async";
import axios from "axios";
import { useQuranData } from "../context/QuranDataContext";
import { Loader2, ArrowLeft, ArrowRight, BookOpen, MapPin, Moon, ChevronDown, BookMarked, BookOpenCheck, Headphones } from "lucide-react";
import { useMp3Quran } from "../context/Mp3QuranContext";
import AudioTafsirSection from "../components/AudioTafsirSection";
import MushafReadingSection from "../components/surah/MushafReadingSection";
import TafsirSection from "../components/surah/TafsirSection";
import TopicsSection from "../components/surah/TopicsSection";

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
  const { isRtl, surahs } = useQuranData();

  // Component Visibilities
  const [showTafsirMenu, setShowTafsirMenu] = useState(false);
  const [selectedTafsir, setSelectedTafsir] = useState(null);
  const [showReadSection, setShowReadSection] = useState(false);
  const { mp3PlayerState, openMp3Player, closeMp3Player } = useMp3Quran();
  const [showAudioTafsir, setShowAudioTafsir] = useState(false);

  const showAudioPlayer = mp3PlayerState.isOpen && mp3PlayerState.surahNumber === (parseInt(id) || 1);

  const surahObj = surahs?.[id] || {};
  const surahName = surahObj?.name_ar || `سورة ${id}`;
  const otherNames = surahObj?.other_names || "";
  const namingReason = surahObj?.naming_reason || "";

  const isMakki = surahObj?.revelation_type?.toLowerCase?.() === 'makki';
  const revelationType = isMakki ? 'مكية' : 'مدنية';

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
        "name": "فهرس السور",
        "item": `${window.location.origin}/surahs`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": surahName,
        "item": window.location.href
      }
    ]
  };

  const surahJsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "name": surahName,
    "alternateName": surahObj?.surah_name_en || surahObj?.name_en,
    "description": namingReason || `تفاصيل ومحاور ${surahName}`,
    "publisher": {
      "@type": "Organization",
      "name": "منصة تدبر"
    },
    "genre": "Religious Text",
    "about": {
      "@type": "Thing",
      "name": "القرآن الكريم"
    }
  };

  const API_BASE = process.env.REACT_APP_API_URL || 'https://tadabbur-api.onrender.com';

  const { data: topics = [], isLoading: topicsLoading } = useQuery({
    queryKey: ['surah-topics', id],
    queryFn: async () => {
      const res = await axios.get(`${API_BASE}/surahs/${id}/topics`);
      return res.data.topics || [];
    },
    staleTime: 1000 * 60 * 30, // 30 mins cache
  });

  const handleSelectTafsir = (tafsir) => {
    setSelectedTafsir(tafsir);
    setShowTafsirMenu(false);
  };

  if (topicsLoading) {
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
      <Helmet>
        <title>{surahName} | منصة تدبر</title>
        <meta name="description" content={`تصفح سورة ${surahName}، استكشف محاورها، مسمياتها، وسبب التسمية مع تلاوات صوتية وتفاسير متنوعة.`} />
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(surahJsonLd)}
        </script>
      </Helmet>
      
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
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 rounded-[2rem] p-8 md:p-16 text-center shadow-2xl border border-emerald-700/50">
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23d97706\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />

        <div className="relative z-10 flex flex-col items-center">
          {/* Action Buttons */}
          <div className="flex items-center gap-3 md:gap-4 mb-8 flex-wrap justify-center w-full max-w-2xl mx-auto">
            <div className="w-14 h-14 md:w-16 md:h-16 bg-emerald-800/50 border border-emerald-600 rounded-2xl flex items-center justify-center text-gold-400 text-xl md:text-2xl font-bold shadow-inner">
              {id}
            </div>

            <button
              onClick={() => showAudioPlayer ? closeMp3Player() : openMp3Player(parseInt(id) || 1, surahName)}
              className={`group flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-3 rounded-2xl transition-all duration-300 font-bold overflow-hidden ${showAudioPlayer
                  ? 'bg-emerald-500 text-black shadow-[0_0_30px_rgba(16,185,129,0.4)]'
                  : 'bg-white/10 text-white hover:bg-white/20 border border-white/10 backdrop-blur-md'
                }`}
            >
              <span>{showAudioPlayer ? "إخفاء المشغل" : "استماع"}</span>
            </button>

            {/* Tafsir Dropdown Button */}
            <div className="relative flex-1 min-w-[140px]">
              <button
                onClick={() => setShowTafsirMenu(!showTafsirMenu)}
                className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl transition-all duration-300 font-bold ${selectedTafsir
                    ? 'bg-gold-500 text-black shadow-[0_0_20px_rgba(217,119,6,0.3)]'
                    : 'bg-white/10 text-white hover:bg-white/20 border border-white/10 backdrop-blur-md'
                  }`}
              >
                <BookMarked className="w-5 h-5 hidden sm:block" />
                <span>{selectedTafsir ? selectedTafsir.name.replace('تفسير ', '') : 'التفاسير'}</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showTafsirMenu ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {showTafsirMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full mt-2 left-0 right-0 sm:right-auto sm:w-64 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
                  >
                    <div className="p-2 max-h-72 overflow-y-auto custom-scrollbar">
                      {TAFSIR_OPTIONS.map((tafsir) => (
                        <button
                          key={tafsir.id}
                          onClick={() => handleSelectTafsir(tafsir)}
                          className={`w-full text-right px-4 py-3 rounded-xl text-sm font-medium transition-colors ${selectedTafsir?.id === tafsir.id
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

            {/* Read Surah Button */}
            <button
              onClick={() => setShowReadSection(!showReadSection)}
              className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-3 rounded-2xl transition-all duration-300 font-bold ${showReadSection
                  ? 'bg-emerald-400 text-black shadow-[0_0_20px_rgba(52,211,153,0.3)]'
                  : 'bg-white/10 text-white hover:bg-white/20 border border-white/10 backdrop-blur-md'
                }`}
            >
              <BookOpenCheck className="w-5 h-5 hidden sm:block" />
              <span>{showReadSection ? 'إخفاء' : 'قراءة'}</span>
            </button>

            {/* Audio Tafsir Button */}
            <button
              onClick={() => setShowAudioTafsir(!showAudioTafsir)}
              className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-3 rounded-2xl transition-all duration-300 font-bold ${showAudioTafsir
                  ? 'bg-teal-400 text-black shadow-[0_0_20px_rgba(45,212,191,0.3)]'
                  : 'bg-white/10 text-white hover:bg-white/20 border border-white/10 backdrop-blur-md'
                }`}
            >
              <Headphones className="w-5 h-5 hidden sm:block" />
              <span>{showAudioTafsir ? 'إخفاء' : 'التفسير الصوتي'}</span>
            </button>
          </div>

          <h1 className="text-5xl md:text-7xl font-serif text-white font-bold mb-2 tracking-tight drop-shadow-md" style={{ lineHeight: '1.2' }}>
            {surahName}
          </h1>

          {otherNames && (
            <div className="text-emerald-200/80 font-serif text-lg md:text-xl mb-6 flex items-center gap-2 flex-wrap justify-center">
              <span className="text-xs px-2 py-0.5 border border-emerald-600 rounded text-emerald-300 bg-emerald-900/50">مسميات أخرى</span>
              {otherNames}
            </div>
          )}

          <div className="flex items-center gap-4 text-emerald-100/90 font-medium">
            <div className="flex items-center gap-1.5 bg-emerald-800/60 px-4 py-1.5 rounded-full border border-emerald-600/50 backdrop-blur-sm">
              {isMakki ? <Moon className="w-4 h-4 text-gold-400" /> : <MapPin className="w-4 h-4 text-emerald-400" />}
              <span>{revelationType}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-emerald-800/60 px-4 py-1.5 rounded-full border border-emerald-600/50 backdrop-blur-sm">
              <BookOpen className="w-4 h-4 text-gold-400" />
              <span dir="ltr">{topics.length} محاور</span>
            </div>
          </div>

          {namingReason && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 max-w-2xl w-full self-center bg-black/20 backdrop-blur-md border border-emerald-500/30 rounded-2xl p-6 text-center shadow-inner"
            >
              <h3 className="text-gold-400 text-sm font-bold mb-3 flex items-center gap-2 justify-center">
                <span className="text-lg">💡</span> سبب تسمية السورة
              </h3>
              <p className="text-emerald-50/90 text-sm md:text-base leading-relaxed">
                {namingReason}
              </p>
            </motion.div>
          )}

          {id !== "9" && id !== 9 && (
            <div className="mt-10 text-2xl md:text-3xl text-gold-400 font-serif opacity-90 drop-shadow-sm">
              بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
            </div>
          )}
        </div>
      </div>

      {/* Tafsir Section */}
      <TafsirSection 
        id={id} 
        surahName={surahName} 
        selectedTafsir={selectedTafsir} 
        closeTafsir={() => setSelectedTafsir(null)} 
      />

      {/* Audio Tafsir Section */}
      <AnimatePresence>
        {showAudioTafsir && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-8"
          >
            <AudioTafsirSection initialSuraId={id} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Read Surah Section */}
      <MushafReadingSection 
        id={id} 
        surahName={surahName} 
        surahObj={surahObj} 
        showReadSection={showReadSection} 
        setShowReadSection={setShowReadSection} 
      />

      {/* Topics Section */}
      <TopicsSection topics={topics} />

    </div>
  );
}
