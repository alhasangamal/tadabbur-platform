import React, { useState, useMemo, startTransition } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { Loader2, BookOpenCheck, Palette, Eye, EyeOff, X } from "lucide-react";

// Tajweed rules legend data
const TAJWEED_RULES = [
  { key: 'madda_necessary', name: 'مد لازم', color: '#B71C1C' },
  { key: 'madda_obligatory', name: 'مد واجب', color: '#C62828' },
  { key: 'madda_permissible', name: 'مد جائز', color: '#D32F2F' },
  { key: 'madda_normal', name: 'مد طبيعي', color: '#EF5350' },
  { key: 'ghunnah', name: 'غنة', color: '#1B5E20' },
  { key: 'ikhafa', name: 'إخفاء', color: '#2E7D32' },
  { key: 'ikhafa_shafawi', name: 'إخفاء شفوي', color: '#388E3C' },
  { key: 'idgham_ghunnah', name: 'إدغام بغنة', color: '#43A047' },
  { key: 'idgham_wo_ghunnah', name: 'إدغام بلا غنة', color: '#78909C' },
  { key: 'iqlab', name: 'إقلاب', color: '#00796B' },
  { key: 'qalaqah', name: 'قلقلة', color: '#0D47A1' },
  { key: 'ham_wasl', name: 'همزة وصل', color: '#90A4AE' },
  { key: 'laam_shamsiyah', name: 'لام شمسية', color: '#A1887F' },
];

const TAJWEED_DESCRIPTIONS = {
  madda_necessary: "مد لازم (6 حركات)",
  madda_obligatory: "مد واجب متصل (4 أو 5 حركات)",
  madda_permissible: "مد جائز منفصل (2 أو 4 أو 5 حركات)",
  madda_normal: "مد طبيعي (حركتان)",
  ghunnah: "غنة (مقدار حركتان)",
  ikhafa: "إخفاء (غنة مقدار حركتان)",
  ikhafa_shafawi: "إخفاء شفوي (غنة مقدار حركتان)",
  idgham_ghunnah: "إدغام بغنة (غنة مقدار حركتان)",
  idgham_wo_ghunnah: "إدغام بلا غنة (إدغام كامل بدون غنة)",
  iqlab: "إقلاب (قلب النون الساكنة أو التنوين ميماً مع الغنة حركتان)",
  qalaqah: "قلقلة (اضطراب الحرف الساكن في مخرجه عند النطق به)",
  ham_wasl: "همزة وصل (تسقط في وصل الكلام وتثبت في البدء)",
  laam_shamsiyah: "لام شمسية (مدغمة لا تلفظ)",
  slnt: "حرف صامت (يكتب ولا يلفظ)"
};

const cleanTajweedText = (html) => {
  if (!html) return '';
  let cleaned = html.replace(/<span class=end>[^<]*<\/span>/g, '');
  cleaned = cleaned.replace(/<tajweed class=["']?([^"'>\s]+)["']?>/g, (match, ruleKey) => {
    const desc = TAJWEED_DESCRIPTIONS[ruleKey] || '';
    return `<tajweed class="${ruleKey}" data-tip="${desc}" title="${desc}">`;
  });
  return cleaned;
};

export default function MushafReadingSection({ 
  id, 
  surahName, 
  surahObj, 
  showReadSection, 
  setShowReadSection 
}) {
  const [tajweedMode, setTajweedMode] = useState(false);
  const [showLegend, setShowLegend] = useState(true);

  // Fetch all surah verses using React Query for caching
  const { data: surahVerses = [], isLoading: surahVersesLoading } = useQuery({
    queryKey: ['surah-verses', id],
    queryFn: async () => {
      const QURAN_API = 'https://api.quran.com/api/v4';
      const res = await axios.get(`${QURAN_API}/verses/by_chapter/${id}?language=ar&words=false&fields=text_uthmani,text_uthmani_tajweed&per_page=300&page=1`);
      return res.data?.verses || [];
    },
    enabled: showReadSection, // Only fetch when section is open
    staleTime: 1000 * 60 * 60, // 1 hour cache
  });

  const surahVersesLoaded = surahVerses.length > 0;

  // Memoized consolidated HTML block
  const consolidatedHtml = useMemo(() => {
    if (!surahVerses || surahVerses.length === 0) return '';
    return surahVerses.map((verse, idx) => {
      const verseNum = verse.verse_key?.split(':')[1] || (idx + 1);
      const text = tajweedMode 
        ? (verse.text_uthmani_tajweed ? cleanTajweedText(verse.text_uthmani_tajweed) : verse.text_uthmani)
        : verse.text_uthmani;
      const badgeHtml = ` <span class="mushaf-verse-badge select-none">${verseNum}</span> `;
      return `<span>${text}</span>${badgeHtml}`;
    }).join(' ');
  }, [surahVerses, tajweedMode]);

  return (
    <AnimatePresence>
      {showReadSection && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="relative overflow-hidden rounded-[2rem] shadow-2xl border border-gray-200 dark:border-gray-800"
        >
          {/* Ornamental top border */}
          <div className="h-2 bg-gradient-to-r from-emerald-700 via-yellow-600 to-emerald-700" />

          {/* Reading Header */}
          <div className="bg-gradient-to-l from-emerald-50 via-white to-teal-50 dark:from-gray-800 dark:via-gray-850 dark:to-gray-900 px-6 md:px-8 py-5 flex flex-wrap gap-4 items-center justify-between border-b border-emerald-100 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center shadow-lg shrink-0">
                <BookOpenCheck className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">قراءة {surahName}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {surahVersesLoading ? 'جاري التحميل...' : `${surahVerses.length} آية`}
                  {tajweedMode && ' • التجويد الميسر'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => startTransition(() => setTajweedMode(prev => !prev))}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${tajweedMode
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                title={tajweedMode ? 'إيقاف التجويد' : 'تفعيل التجويد'}
              >
                <Palette className="w-4 h-4" />
                <span className="hidden sm:inline">{tajweedMode ? 'التجويد مفعل' : 'أحكام التجويد'}</span>
              </button>

              {tajweedMode && (
                <button
                  onClick={() => setShowLegend(prev => !prev)}
                  className={`p-2.5 rounded-xl transition-all duration-200 ${showLegend
                      ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
                    }`}
                  title={showLegend ? 'إخفاء الدليل' : 'إظهار الدليل'}
                >
                  {showLegend ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              )}

              <button
                onClick={() => setShowReadSection(false)}
                className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-red-100 dark:hover:bg-red-900/30 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Tajweed Legend */}
          <AnimatePresence>
            {tajweedMode && showLegend && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden bg-gradient-to-r from-emerald-50/50 via-white to-teal-50/50 dark:from-emerald-950/20 dark:via-gray-900/30 dark:to-teal-950/20 border-b border-emerald-100/50 dark:border-emerald-900/20"
              >
                <div className="tajweed-legend py-3 px-4">
                  {TAJWEED_RULES.map((rule) => (
                    <div key={rule.key} className="tajweed-legend-item">
                      <span className="tajweed-legend-dot" style={{ backgroundColor: rule.color }} />
                      <span className="text-gray-700 dark:text-gray-300">{rule.name}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Reading Content Area: Mushaf Desk Style */}
          <div
            className="mushaf-desk max-h-[75vh] overflow-y-auto"
            style={{ direction: 'rtl' }}
          >
            {surahVersesLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="relative">
                  <div className="absolute inset-0 animate-ping rounded-full bg-emerald-400/30 w-16 h-16" />
                  <Loader2 className="w-12 h-12 text-emerald-500 animate-spin relative" />
                </div>
                <p className="text-gray-500 dark:text-gray-400 font-medium mt-4">جاري تحميل الآيات...</p>
              </div>
            ) : !surahVersesLoaded ? (
              <div className="text-center py-16 text-gray-400 dark:text-gray-500">
                لا توجد آيات متاحة حالياً.
              </div>
            ) : (
              <div className="mushaf-page max-w-4xl mx-auto my-2">
                <div className="mushaf-corner mushaf-corner-tr" />
                <div className="mushaf-corner mushaf-corner-tl" />
                <div className="mushaf-corner mushaf-corner-br" />
                <div className="mushaf-corner mushaf-corner-bl" />

                <div className="mushaf-header select-none">
                  <span>سُورَةُ {surahName}</span>
                  <span className="text-gold-600 text-lg">۞</span>
                  <span>آيَاتُهَا {surahObj?.verses_count || surahVerses.length}</span>
                </div>

                {id !== "9" && id !== 9 && (
                  <div className="mushaf-bismillah-container select-none">
                    <div className="mushaf-bismillah-box">
                      <span className="text-2xl md:text-3xl font-bold text-gray-950 dark:text-gray-50 animate-fade-in" style={{ fontFamily: 'Amiri, serif', lineHeight: '2' }}>
                        بِسْمِ اللَّهِ الرَّحْمَـٰنِ الرَّحِيمِ
                      </span>
                    </div>
                  </div>
                )}

                <div 
                  className="tajweed-text text-2xl md:text-3xl text-center" 
                  style={{ textAlign: 'justify' }}
                  dangerouslySetInnerHTML={{ __html: consolidatedHtml }}
                />
              </div>
            )}
          </div>

          <div className="h-1.5 bg-gradient-to-r from-emerald-600 via-gold-500 to-emerald-600" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
