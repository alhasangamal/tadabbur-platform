import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, Link } from 'react-router-dom';
import Fuse from 'fuse.js';
import { motion } from 'framer-motion';
import { Search, BookOpen, ExternalLink, ArrowRightLeft, Sparkles, Scale, Gavel, Library, Copy } from 'lucide-react';
import { useQuranData } from '../context/QuranDataContext';

// Import all data
import ahkamData from '../data/ahkam_data.json';
import amthalData from '../data/amthal_data.json';
import contrastsData from '../data/contrasts_data.json';
import mutashData from '../data/mutash_data.json';
import nasikhData from '../data/nasikh_data.json';
import storiesData from '../data/stories_data.json';
import tashriaatData from '../data/tashriaat_data.json';

// Helper to map type to English paths and icons
const getCategoryInfo = (type) => {
  switch (type) {
    case 'الأحكام': return { path: '/ahkam', icon: Gavel, color: 'text-amber-600', bg: 'bg-amber-100' };
    case 'الأمثال': return { path: '/amthal', icon: Sparkles, color: 'text-purple-600', bg: 'bg-purple-100' };
    case 'الثنائيات': return { path: '/contrasts', icon: Scale, color: 'text-blue-600', bg: 'bg-blue-100' };
    case 'المتشابهات': return { path: '/mutash', icon: Copy, color: 'text-emerald-600', bg: 'bg-emerald-100' };
    case 'الناسخ والمنسوخ': return { path: '/nasikh', icon: ArrowRightLeft, color: 'text-red-600', bg: 'bg-red-100' };
    case 'القصص': return { path: '/stories', icon: Library, color: 'text-indigo-600', bg: 'bg-indigo-100' };
    case 'التشريعات': return { path: '/tashriaat', icon: Scale, color: 'text-teal-600', bg: 'bg-teal-100' };
    default: return { path: '/', icon: BookOpen, color: 'text-gray-600', bg: 'bg-gray-100' };
  }
};

export default function SearchResultsPage() {
  const { isRtl } = useQuranData();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const query = queryParams.get('q') || '';

  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(true);

  // Combine and format all data for searching
  const searchableData = useMemo(() => {
    let combined = [];

    ahkamData.forEach(item => combined.push({ ...item, category: 'الأحكام', searchTitle: item.title, searchText: item.hukm + " " + item.explanation }));
    amthalData.forEach(item => combined.push({ ...item, category: 'الأمثال', searchTitle: item.title, searchText: item.explanation + " " + item.lesson }));
    contrastsData.forEach(item => combined.push({ ...item, category: 'الثنائيات', searchTitle: item.title, searchText: item.description + " " + item.concept1.title + " " + item.concept2.title }));
    mutashData.forEach(item => combined.push({ ...item, category: 'المتشابهات', searchTitle: item.title, searchText: item.difference + " " + item.importance }));
    nasikhData.forEach(item => combined.push({ ...item, category: 'الناسخ والمنسوخ', searchTitle: item.nasikh_ayah.surah_name, searchText: item.ruling_change + " " + item.wisdom }));
    storiesData.forEach(item => combined.push({ ...item, category: 'القصص', searchTitle: item.title, searchText: item.summary + " " + item.lessons?.join(" ") }));
    tashriaatData.forEach(item => combined.push({ ...item, category: 'التشريعات', searchTitle: item.title, searchText: item.legislation + " " + item.wisdom }));

    return combined;
  }, []);

  // Fuse.js search setup
  useEffect(() => {
    setIsSearching(true);
    
    if (!query) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    // Delay slightly to allow UI to render the "searching" state if needed
    const timeoutId = setTimeout(() => {
      const fuse = new Fuse(searchableData, {
        keys: ['searchTitle', 'searchText', 'category', 'topic', 'surah_name'],
        threshold: 0.3, // Fuzzy matching threshold (0 is exact, 1 is loose)
        includeScore: true,
        ignoreLocation: true,
      });

      const fuseResults = fuse.search(query);
      setResults(fuseResults.map(res => res.item));
      setIsSearching(false);
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [query, searchableData]);

  return (
    <div className="space-y-12 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade font-sans">
      <section className="text-center space-y-4 mb-12">
        <h1 className="title-primary flex items-center justify-center gap-4">
           <Search className="w-12 h-12 text-gold-500" />
           <span className="text-gradient-emerald">نتائج البحث</span>
        </h1>
        <p className="text-ink-light dark:text-sand-300 max-w-3xl mx-auto text-xl font-light">
          {query ? `نبحث عن: "${query}"` : 'أدخل كلمة للبحث في المنصة'}
        </p>
      </section>

      {!isSearching && query && (
        <div className="mb-6 flex justify-between items-center glass-panel p-4 rounded-2xl">
          <span className="font-bold text-emerald-800 dark:text-emerald-400">
            تم العثور على {results.length} نتيجة
          </span>
        </div>
      )}

      {isSearching ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-emerald-600"></div>
        </div>
      ) : results.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {results.map((item, idx) => {
            const catInfo = getCategoryInfo(item.category);
            const Icon = catInfo.icon;
            return (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                key={idx}
                className="glass-card flex flex-col h-full hover:shadow-lg transition-shadow group"
              >
                <div className="p-6 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${catInfo.bg} ${catInfo.color} dark:bg-opacity-20`}>
                      <Icon className="w-3 h-3" />
                      {item.category}
                    </span>
                  </div>
                  
                  <h3 className="text-2xl font-kufi font-bold text-ink dark:text-sand-50 mb-3 group-hover:text-emerald-600 transition-colors">
                    {item.searchTitle || item.title || "نتيجة بحث"}
                  </h3>
                  
                  <p className="text-ink-light dark:text-sand-300 text-base line-clamp-3 mb-6 flex-grow">
                    {item.searchText}
                  </p>
                  
                  <div className="mt-auto pt-4 border-t border-sand-200 dark:border-ink-light/20">
                    <Link 
                      to={catInfo.path} 
                      className="inline-flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold hover:text-gold-600 transition-colors"
                    >
                      <span>عرض التفاصيل في القسم</span>
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : query ? (
        <div className="py-24 text-center space-y-6 glass-card mx-auto max-w-2xl">
          <div className="mx-auto w-24 h-24 bg-sand-100 dark:bg-ink-dark rounded-full flex items-center justify-center">
            <Search className="w-12 h-12 text-sand-400" />
          </div>
          <h3 className="text-2xl font-bold text-ink-light dark:text-sand-400">لم يتم العثور على نتائج تطابق "{query}"</h3>
          <p className="text-gray-500">جرب البحث بكلمات أخرى أو بجذر الكلمة.</p>
        </div>
      ) : null}
    </div>
  );
}
