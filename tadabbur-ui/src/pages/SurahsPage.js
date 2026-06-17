import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useQuranData } from '../context/QuranDataContext';
import { Loader2, MapPin, Moon, Book, Layers } from 'lucide-react';
import DataFilterHeader from '../components/common/DataFilterHeader';

const MotionLink = motion(Link);

const SURAH_JUZ_MAP = [
  1, 1, 3, 4, 6, 7, 8, 9, 10, 11, 11, 12, 13, 13, 14, 14, 15, 15, 16, 16, 
  17, 17, 18, 18, 18, 19, 19, 20, 20, 21, 21, 21, 21, 22, 22, 22, 23, 23, 
  23, 24, 24, 25, 25, 25, 25, 26, 26, 26, 26, 26, 26, 27, 27, 27, 27, 27, 
  27, 28, 28, 28, 28, 28, 28, 28, 28, 28, 29, 29, 29, 29, 29, 29, 29, 29, 
  29, 29, 29, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 
  30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 
  30, 30, 30, 30
];

export default function SurahsPage() {
  const { lang, isRtl, surahsList, loading, error, refreshData } = useQuranData();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('الكل'); // الكل, مكية, مدنية
  const [sortOrder] = useState('asc'); // asc, desc (by number)

  const filteredSurahs = useMemo(() => {
    return (surahsList || [])
      .filter(s => {
        const nameAr = s.name_ar || '';
        const nameEn = s.name_en || '';
        const matchSearch = nameAr.includes(searchTerm) || nameEn.toLowerCase().includes(searchTerm.toLowerCase());
        const type = s.revelation_type?.toLowerCase() || '';
        const isMakkiData = type.includes('mak') || type.includes('mec');
        const isMadaniData = type.includes('mad') || type.includes('med');
        
        const matchType = filterType === 'الكل' 
          ? true 
          : filterType === 'مكية' ? isMakkiData : isMadaniData;
        
        return matchSearch && matchType;
      })
      .sort((a, b) => sortOrder === 'asc' ? a.id - b.id : b.id - a.id);
  }, [surahsList, searchTerm, filterType, sortOrder]);

  const t = {
    ar: {
      title: "فهرس السور",
      desc: "استعرض سور القرآن الكريم مع تفاصيل النزول وعدد الآيات.",
      searchParams: "ابحث باسم أو رقم السورة...",
      all: "الكل",
      makki: "مكية",
      madani: "مدنية",
      sortAsc: "ترتيب تصاعدي",
      sortDesc: "ترتيب تنازلي",
      verses: "آية",
      juz: "جزء"
    },
    en: {
      title: "Surah Index",
      desc: "Browse chapters of the Holy Quran with revelation details and verse counts.",
      searchParams: "Search by name or number...",
      all: "All",
      makki: "Meccan",
      madani: "Medinan",
      sortAsc: "Ascending",
      sortDesc: "Descending",
      verses: "Verses",
      juz: "Juz"
    }
  }[lang];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-emerald-600 animate-spin" />
        <p className="mt-4 text-emerald-800 dark:text-emerald-400 font-medium">{isRtl ? 'جاري تحميل قائمة السور...' : 'Loading Surahs...'}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 space-y-6">
        <div className="w-16 h-16 bg-red-50 dark:bg-red-950/30 rounded-full flex items-center justify-center text-red-600 dark:text-red-400">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div className="space-y-2 max-w-md">
          <h2 className="text-2xl font-black text-gray-900 dark:text-white font-kufi">
            {isRtl ? 'تعذر الاتصال بالخادم' : 'Server Connection Failed'}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
            {isRtl 
              ? 'تأكد من اتصالك بالإنترنت، أو أن الخادم يعمل بشكل صحيح. قد يستغرق الخادم بعض الوقت للاستيقاظ عند التشغيل لأول مرة.' 
              : 'Please check your internet connection or verify the server status. Note that cold starts on Render free tier can take up to 50 seconds.'}
          </p>
          <div className="bg-red-500/10 text-red-700 dark:text-red-400 text-xs font-mono p-3 rounded-xl border border-red-500/20 break-all select-all">
            {error}
          </div>
        </div>
        <button
          onClick={refreshData}
          className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold rounded-2xl shadow-lg hover:shadow-emerald-600/20 transition-all font-kufi flex items-center gap-2"
        >
          {isRtl ? 'إعادة المحاولة' : 'Try Again'}
        </button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8 animate-fade pb-10">
      <DataFilterHeader 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        categories={['الكل', 'مكية', 'مدنية']}
        selectedCategory={filterType}
        setSelectedCategory={setFilterType}
        placeholder={t.searchParams}
        isRtl={isRtl}
      />

      <motion.div 
        variants={{
          show: { transition: { staggerChildren: 0.05 } }
        }}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        {filteredSurahs.map((surah) => {
          const isMakki = (surah.revelation_type?.toLowerCase() || '').includes('mak') || (surah.revelation_type?.toLowerCase() || '').includes('mec');
          return (
            <MotionLink
              to={`/surahs/${surah.id}`}
              variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 260, damping: 20 } }
              }}
              key={surah.id}
              className={`group relative overflow-hidden bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-[2rem] p-6 border transition-all duration-500 cursor-pointer block ${
                isMakki 
                  ? 'border-amber-100/50 dark:border-amber-900/30 hover:border-amber-400 dark:hover:border-amber-600 shadow-xl shadow-amber-900/5 hover:shadow-amber-900/10' 
                  : 'border-emerald-100/50 dark:border-emerald-900/30 hover:border-emerald-400 dark:hover:border-emerald-600 shadow-xl shadow-emerald-900/5 hover:shadow-emerald-900/10'
              }`}
            >
              {/* Background Accent */}
              <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-700 ${
                isMakki ? 'bg-amber-400' : 'bg-emerald-400'
              }`} />

              <div className="flex justify-between items-start mb-8 relative z-10">
                <div className={`flex items-center justify-center w-12 h-12 rounded-2xl font-bold text-xl transition-all duration-500 ring-4 ${
                  isMakki 
                    ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 ring-amber-50/50 dark:ring-amber-900/20 group-hover:bg-amber-500 group-hover:text-white group-hover:ring-amber-200' 
                    : 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400 ring-emerald-50/50 dark:ring-emerald-900/20 group-hover:bg-emerald-500 group-hover:text-white group-hover:ring-emerald-200'
                }`}>
                  {surah.id}
                </div>
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-black border transition-all duration-300 ${
                  isMakki 
                    ? 'bg-amber-50/50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-500 border-amber-100 dark:border-amber-900/50' 
                    : 'bg-emerald-50/50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-500 border-emerald-100 dark:border-emerald-900/50'
                }`}>
                  {isMakki ? (
                    <>
                      <Moon className="w-3.5 h-3.5" />
                      <span className="font-kufi">مكية</span>
                    </>
                  ) : (
                    <>
                      <MapPin className="w-3.5 h-3.5" />
                      <span className="font-kufi">مدنية</span>
                    </>
                  )}
                </div>
            </div>

            <div className="space-y-1 relative z-10 mb-6">
              <h3 className="text-3xl font-black text-gray-900 dark:text-white font-kufi group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                {surah.name_ar}
              </h3>
              <div className="text-gray-400 dark:text-gray-500 font-bold text-sm tracking-widest uppercase">
                سورة {surah.id}
              </div>
            </div>

            <div className="flex justify-between items-center text-xs font-black text-gray-400 dark:text-gray-500 pt-5 border-t border-gray-100/50 dark:border-gray-700/50 relative z-10">
              <span className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-900/50 px-2 py-1 rounded-lg">
                <Book className="w-3 h-3" />
                {surah.verses} آيات
              </span>
              <span className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-900/50 px-2 py-1 rounded-lg">
                <Layers className="w-3 h-3" />
                الجزء {SURAH_JUZ_MAP[surah.id - 1] || 30}
              </span>
            </div>
          </MotionLink>
        );
      })}
    </motion.div>
      
      {filteredSurahs.length === 0 && (
        <div className="text-center py-20 text-gray-500 dark:text-gray-400 text-lg">
          لا توجد نتائج مطابقة لبحثك.
        </div>
      )}
    </div>
  );
}
