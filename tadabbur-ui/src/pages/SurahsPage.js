import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useQuranData } from '../context/QuranDataContext';
import { Search, Loader2, MapPin, Moon, Sun, ArrowDown01, ArrowUp10, ArrowUp } from 'lucide-react';
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
  const { lang, isRtl, surahsList, loading } = useQuranData();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, Meccan, Medinan
  const [sortOrder, setSortOrder] = useState('asc'); // asc, desc (by number)

  const filteredSurahs = useMemo(() => {
    return (surahsList || [])
      .filter(s => {
        const matchSearch = s.name_ar.includes(searchTerm) || s.name_en.toLowerCase().includes(searchTerm.toLowerCase());
        const type = s.revelation_type?.toLowerCase() || '';
        const isMakkiData = type.includes('mak') || type.includes('mec');
        const isMadaniData = type.includes('mad') || type.includes('med');
        
        const matchType = filterType === 'all' 
          ? true 
          : filterType === 'Makki' ? isMakkiData : isMadaniData;
        
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

  return (
    <div className="w-full space-y-8 animate-fade pb-10">
      <DataFilterHeader 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        categories={['all', 'Makki', 'Madani']}
        selectedCategory={filterType}
        setSelectedCategory={setFilterType}
        placeholder={t.searchParams}
        isRtl={isRtl}
      />

      {/* Grid */}
      <div 
        key={filterType}
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
      >
        {filteredSurahs.map((surah) => {
          const isMakki = surah.revelation_type?.toLowerCase().includes('mak') || surah.revelation_type?.toLowerCase().includes('mec');
          return (
            <MotionLink
              to={`/surahs/${surah.id}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={surah.id}
              className={`group relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl p-5 border shadow-sm transition-all duration-300 cursor-pointer block ${
                isMakki 
                  ? 'border-amber-100/50 dark:border-amber-900/30 hover:border-amber-300 dark:hover:border-amber-700 hover:shadow-amber-900/10' 
                  : 'border-emerald-100/50 dark:border-emerald-900/30 hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-emerald-900/10'
              }`}
            >
              {/* Corner Ribbon / Decoration */}
              <div className={`absolute top-0 right-0 w-16 h-16 rounded-bl-3xl opacity-0 group-hover:opacity-100 transition-opacity ${
                isMakki 
                  ? 'bg-gradient-to-br from-amber-50 to-transparent dark:from-amber-900/20' 
                  : 'bg-gradient-to-br from-emerald-50 to-transparent dark:from-emerald-900/20'
              }`} />

              <div className="flex justify-between items-start mb-6">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-lg transition-colors ${
                  isMakki 
                    ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 group-hover:bg-amber-500 group-hover:text-white' 
                    : 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white'
                }`}>
                  {surah.id}
                </div>
                <div className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold border transition-colors ${
                  isMakki 
                    ? 'bg-amber-50/50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-500 border-amber-100 dark:border-amber-900/50' 
                    : 'bg-emerald-50/50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-500 border-emerald-100 dark:border-emerald-900/50'
                }`}>
                  {isMakki ? (
                    <>
                      <Moon className="w-3 h-3" />
                      <span>مكية</span>
                    </>
                  ) : (
                    <>
                      <MapPin className="w-3 h-3" />
                      <span>مدنية</span>
                    </>
                  )}
                </div>
              </div>

            <div className={`text-2xl font-bold text-gray-900 dark:text-white mb-1 tracking-tight ${isRtl ? 'font-serif' : ''}`}>
              {surah.name_ar}
            </div>
            <div className="text-gray-500 dark:text-gray-400 font-medium text-sm mb-6">
              سورة {surah.id}
            </div>

            <div className="flex justify-between items-center text-xs font-semibold text-gray-400 dark:text-gray-500 pt-4 border-t border-gray-100 dark:border-gray-700">
              <span>{surah.verses} {t.verses}</span>
              <span>{t.juz} {SURAH_JUZ_MAP[surah.id - 1] || 30}</span>
            </div>
          </MotionLink>
        );
      })}
    </div>
      
      {filteredSurahs.length === 0 && (
        <div className="text-center py-20 text-gray-500 dark:text-gray-400 text-lg">
          لا توجد نتائج مطابقة لبحثك.
        </div>
      )}
    </div>
  );
}
