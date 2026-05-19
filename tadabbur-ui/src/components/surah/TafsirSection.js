import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { Loader2, BookMarked, X } from "lucide-react";

const stripHtml = (html) => {
  if (!html) return '';
  return html.replace(/<[^>]*>?/gm, '');
};

export default function TafsirSection({
  id,
  surahName,
  selectedTafsir,
  closeTafsir
}) {
  const [page, setPage] = useState(1);
  const [allTafsirs, setAllTafsirs] = useState([]);

  // Reset when tafsir changes
  useEffect(() => {
    setPage(1);
    setAllTafsirs([]);
  }, [selectedTafsir]);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['tafsir', selectedTafsir?.id, id, page],
    queryFn: async () => {
      if (!selectedTafsir) return null;
      const QURAN_API = 'https://api.quran.com/api/v4';
      const res = await axios.get(`${QURAN_API}/tafsirs/${selectedTafsir.id}/by_chapter/${id}?per_page=10&page=${page}`);
      return res.data;
    },
    enabled: !!selectedTafsir,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });

  useEffect(() => {
    if (data?.tafsirs) {
      if (page === 1) {
        setAllTafsirs(data.tafsirs);
      } else {
        setAllTafsirs(prev => {
          // Avoid duplicates if React Query triggers multiple times
          const existingIds = new Set(prev.map(t => t.verse_id));
          const newTafsirs = data.tafsirs.filter(t => !existingIds.has(t.verse_id));
          return [...prev, ...newTafsirs];
        });
      }
    }
  }, [data, page]);

  const handleLoadMore = () => {
    if (data?.pagination?.next_page) {
      setPage(prev => prev + 1);
    }
  };

  return (
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
              className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-red-100 dark:hover:bg-red-900/30 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tafsir Content */}
          <div className="p-6 md:p-8 max-h-[70vh] overflow-y-auto custom-scrollbar" style={{ direction: 'rtl' }}>
            {isLoading && page === 1 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-4">
                <Loader2 className="w-10 h-10 text-gold-500 animate-spin" />
                <p className="text-gray-500 dark:text-gray-400 font-medium">جاري تحميل التفسير...</p>
              </div>
            ) : allTafsirs.length === 0 ? (
              <div className="text-center py-16 text-gray-400 dark:text-gray-500">
                لا يوجد تفسير متاح لهذه السورة حالياً.
              </div>
            ) : (
              <div className="space-y-6">
                {allTafsirs.map((item, idx) => (
                  <div key={`${item.verse_id}-${idx}`} className="bg-sand-50/50 dark:bg-gray-900/30 rounded-2xl p-6 border border-gray-100 dark:border-gray-700/50">
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
                {data?.pagination?.next_page && (
                  <div className="flex justify-center pt-4 pb-2">
                    <button
                      onClick={handleLoadMore}
                      disabled={isFetching}
                      className="flex items-center gap-2 px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl transition-colors shadow-lg disabled:opacity-50"
                    >
                      {isFetching ? (
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
  );
}
