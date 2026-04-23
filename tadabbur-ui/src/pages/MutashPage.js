import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Copy, BookOpen, Layers, Tag as TagIcon, Info, Lightbulb, ArrowRightLeft, Sparkles } from "lucide-react";
import { useQuranData } from "../context/QuranDataContext";
import mutashData from "../data/mutash_data.json";
import BookmarkButton from "../components/common/BookmarkButton";

export default function MutashPage() {
  const { isRtl } = useQuranData();
  const [selectedType, setSelectedType] = useState("الكل");

  // Unique types
  const types = ["الكل", "متشابهات لفظية", "روابط موضوعية"];

  // Filtered data
  const filteredData = useMemo(() => {
    return mutashData.filter((item) => {
      const matchesType = selectedType === "الكل" || item.type === selectedType;
      return matchesType;
    });
  }, [selectedType]);

  return (
    <div className="space-y-16 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade font-sans">
      {/* Page Header */}
      <section className="text-center space-y-6">
        <h1 className="title-primary flex items-center justify-center gap-4">
           <ArrowRightLeft className="w-12 h-12 text-gold-500" />
           <span className="text-gradient-emerald">المتشابهات والروابط الموضوعية</span>
        </h1>
        <p className="text-ink-light dark:text-sand-300 max-w-3xl mx-auto text-xl leading-relaxed font-light">
          استكشاف الدقة اللفظية والترابط بين آيات الكتاب العزيز، وكيف تختلف الكلمات لتناسب المقامات.
        </p>
      </section>

      {/* Type Filters Box */}
      <div className="bg-sand-50 dark:bg-ink-dark rounded-3xl border border-sand-200 dark:border-ink-light/20 shadow-xl p-4 flex justify-center max-w-2xl mx-auto relative z-30">
        <div className="flex bg-white/60 dark:bg-ink/60 p-2 rounded-2xl w-full">
          {types.map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`flex-1 py-3 px-4 rounded-xl text-base font-bold transition-all duration-300 ${
                selectedType === type
                  ? "bg-emerald-800 text-gold-400 shadow-md transform scale-100"
                  : "bg-transparent text-ink-light dark:text-sand-400 hover:text-emerald-700 dark:hover:text-emerald-400"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Comparisons Grid */}
      <motion.div 
        layout
        className="space-y-20"
      >
        <AnimatePresence mode="popLayout">
          {filteredData.map((item, idx) => (
            <motion.div
              layout
              key={`${item.title}-${idx}`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5 }}
              className="group glass-card overflow-hidden"
            >
              {/* Card Header Overlay */}
              <div className="bg-gradient-to-l from-sand-100/80 to-white/80 dark:from-ink-dark/80 dark:to-ink/80 p-10 border-b border-sand-200/50 dark:border-ink-light/20 flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="flex flex-col items-center md:items-start gap-5 flex-1">
                  <div className="flex items-center gap-3 flex-wrap justify-center md:justify-start">
                    {/* Record Type Badge */}
                    <span className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-2 shadow-sm ${
                      item.type === "متشابهات لفظية" ? "bg-gold-100/50 dark:bg-gold-900/30 text-gold-800 dark:text-gold-400" : "bg-emerald-100/50 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400"
                    }`}>
                      {item.type === "متشابهات لفظية" ? <Copy className="w-4 h-4" /> : <Layers className="w-4 h-4" />}
                      {item.type}
                    </span>

                    {/* Topic Badge */}
                    <span className="px-5 py-2 rounded-full text-xs font-bold bg-white/50 dark:bg-ink-dark/50 text-ink dark:text-sand-200 border border-sand-200 dark:border-ink-light/30 flex items-center gap-2 shadow-sm">
                      <TagIcon className="w-4 h-4 text-gold-600" />
                      {item.topic}
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <h3 className="text-3xl md:text-4xl font-kufi font-bold text-emerald-950 dark:text-sand-50 text-center md:text-right leading-tight">
                      {item.title}
                    </h3>
                    <BookmarkButton item={item} type={item.type || "المتشابهات"} />
                  </div>
                </div>
                <div className="p-6 bg-sand-50 dark:bg-ink-dark rounded-full shadow-inner border border-sand-200 dark:border-ink-light/20 group-hover:shadow-md transition-all">
                  {item.type === "متشابهات لفظية" ? <Sparkles className="w-10 h-10 text-gold-500" /> : <ArrowRightLeft className="w-10 h-10 text-emerald-600" />}
                </div>
              </div>

              {/* Ayahs Comparison Grid */}
              <div className="p-10">
                <div className={`grid grid-cols-1 ${item.ayahs.length > 1 ? 'lg:grid-cols-' + Math.min(item.ayahs.length, 3) : ''} gap-8 mb-16`}>
                  {item.ayahs.map((ayah, aIdx) => (
                    <div key={aIdx} className="relative h-full">
                      <div className="bg-white/40 dark:bg-ink-dark/40 rounded-3xl p-8 border border-sand-200/50 dark:border-ink-light/20 transition-all hover:bg-white/80 dark:hover:bg-ink-dark/80 hover:shadow-soft h-full flex flex-col">
                         <div className="space-y-8 flex-1">
                            <div className="flex justify-between items-center bg-sand-50/80 dark:bg-ink/80 px-5 py-3 rounded-2xl border border-sand-200 dark:border-ink-light/30 shadow-sm">
                              <span className="text-base font-bold text-emerald-800 dark:text-emerald-400">
                                {ayah.surah_name} <span className="font-sans ml-1 text-sm">{ayah.ayah_number}</span>
                              </span>
                              <BookOpen className="w-5 h-5 text-gold-600 dark:text-gold-500" />
                            </div>
                            <p className="quran-text px-2">
                              {ayah.ayah_text}
                            </p>
                         </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Analysis Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Difference */}
                  <div className="bg-sand-50/50 dark:bg-ink-dark/50 p-10 rounded-3xl border border-gold-200/50 dark:border-gold-900/30 space-y-6 transition-all hover:shadow-soft">
                    <div className="flex items-center gap-4">
                      <div className="p-4 bg-white dark:bg-ink rounded-2xl shadow-sm">
                        <Info className="w-7 h-7 text-gold-600 dark:text-gold-500" />
                      </div>
                      <h4 className="text-2xl font-kufi font-bold text-ink dark:text-sand-50">الفرق الدقيق</h4>
                    </div>
                    <p className="text-ink-light dark:text-sand-300 leading-loose text-xl font-medium pr-6 border-r-4 border-gold-400/50">
                      {item.difference}
                    </p>
                  </div>

                  {/* Importance */}
                  <div className="bg-emerald-50/30 dark:bg-emerald-950/20 p-10 rounded-3xl border border-emerald-200/50 dark:border-emerald-900/30 space-y-6 transition-all hover:shadow-soft">
                    <div className="flex items-center gap-4">
                      <div className="p-4 bg-white dark:bg-ink rounded-2xl shadow-sm">
                        <Lightbulb className="w-7 h-7 text-emerald-600 dark:text-emerald-500" />
                      </div>
                      <h4 className="text-2xl font-kufi font-bold text-ink dark:text-sand-50">لماذا هذا مهم؟</h4>
                    </div>
                    <p className="text-ink-light dark:text-sand-300 leading-loose text-xl font-medium pr-6 border-r-4 border-emerald-500/50">
                      {item.importance}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Empty State */}
      {filteredData.length === 0 && (
        <div className="py-24 text-center space-y-6">
          <div className="mx-auto w-28 h-28 bg-sand-100 dark:bg-ink-dark rounded-full flex items-center justify-center shadow-inner">
            <Search className="w-14 h-14 text-sand-400 dark:text-ink-light" />
          </div>
          <h3 className="text-3xl font-kufi font-bold text-ink-light dark:text-sand-400">لم يتم العثور على نتائج تطابق اختيارك</h3>
        </div>
      )}
    </div>
  );
}
