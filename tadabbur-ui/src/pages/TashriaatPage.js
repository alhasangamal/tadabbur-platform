import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Scale, BookOpen, Layers, Filter, CheckCircle2, Info } from "lucide-react";
import { useQuranData } from "../context/QuranDataContext";
import tashriaatData from "../data/tashriaat_data.json";

export default function TashriaatPage() {
  const { isRtl } = useQuranData();
  const [selectedCategory, setSelectedCategory] = useState("الكل");

  // Get unique categories (flattened and unique)
  const categories = useMemo(() => {
    const allCats = tashriaatData.flatMap((item) => item.category || []);
    const uniqueCats = new Set(allCats.filter(Boolean));
    return ["الكل", ...Array.from(uniqueCats)];
  }, []);

  // Filtered data
  const filteredData = useMemo(() => {
    return tashriaatData.filter((item) => {
      const matchesCategory = 
        selectedCategory === "الكل" || 
        (Array.isArray(item.category) && item.category.includes(selectedCategory));
      return matchesCategory;
    });
  }, [selectedCategory]);

  // Stats
  const stats = useMemo(() => [
    { label: "مبحث تشريعي", value: tashriaatData.length, icon: Scale },
    { label: "سورة", value: new Set(tashriaatData.map(d => d.surah_name)).size, icon: BookOpen },
    { label: "أبواب القانون", value: categories.length - 1, icon: Layers },
  ], [categories]);

  return (
    <div className="space-y-12 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade">
      {/* Page Header */}
      <section className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-emerald-900 dark:text-emerald-300">
           التشريعات القرآنية
        </h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
          استعراض للتدرج التشريعي وحكمة وضع القوانين في القرآن الكريم، وكيف بُنيت أسس المجتمع الإسلامي خطوة بخطوة.
        </p>
      </section>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white dark:bg-gray-800 border border-emerald-100 dark:border-gray-700 rounded-2xl p-6 shadow-sm flex items-center justify-between transition-all hover:shadow-md">
            <div className="space-y-1">
              <span className="text-4xl font-serif text-gold-600 dark:text-gold-500">{stat.value}</span>
              <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
            </div>
            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl">
              <stat.icon className="w-8 h-8 text-emerald-700 dark:text-emerald-400" />
            </div>
          </div>
        ))}
      </div>

      {/* Filters Box */}
      {/* Filters Box */}
      <div className="bg-[#f8f6f1] dark:bg-[#0f172a] p-8 rounded-3xl border border-emerald-100 dark:border-emerald-900/40 shadow-xl relative z-30">
        <div className="flex flex-wrap gap-3 justify-center">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${
                selectedCategory === cat
                  ? "bg-emerald-700 text-white shadow-md transform scale-105"
                  : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-emerald-50 dark:border-gray-700 hover:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <motion.div 
        layout
        className="grid grid-cols-1 lg:grid-cols-2 gap-8"
      >
        <AnimatePresence mode="popLayout">
          {filteredData.map((item, idx) => (
            <motion.div
              layout
              key={`${item.surah_name}-${item.ayah_number}-${idx}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="group bg-white dark:bg-gray-800 rounded-3xl overflow-hidden border border-emerald-50 dark:border-gray-700 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
            >
              {/* Card Header */}
              <div className="bg-[#fcfbf7] dark:bg-gray-900 px-6 py-4 flex justify-between items-center border-b border-emerald-50 dark:border-gray-700">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 px-3 py-1 rounded-full text-sm font-bold">
                    {item.surah_name} {item.ayah_number}
                  </div>
                  {Array.isArray(item.category) && item.category.map((cat, cIdx) => (
                    <span key={cIdx} className="text-[10px] font-semibold text-gold-600 dark:text-gold-400 flex items-center gap-1 bg-gold-50 dark:bg-gold-900/20 px-2 py-0.5 rounded-md border border-gold-100/50 dark:border-gold-900/30">
                      <Filter className="w-2.5 h-2.5" />
                      {cat}
                    </span>
                  ))}
                </div>
                <div className="text-emerald-200 group-hover:text-gold-500 transition-colors hidden sm:block">
                  <Scale className="w-5 h-5" />
                </div>
              </div>

              {/* Card Body */}
              <div className="p-8 space-y-6 flex-1">
                {/* Stage Headline */}
                <div className="border-r-4 border-gold-500 pr-4">
                  <h3 className="text-emerald-800 dark:text-emerald-300 font-bold text-xl leading-tight">
                    {item.title}
                  </h3>
                </div>

                {/* Ayah Text */}
                <div className="relative py-4">
                  <span className="absolute -top-4 -right-4 text-emerald-50 dark:text-emerald-900/10 text-6xl font-serif pointer-events-none opacity-50">«</span>
                  <p className="text-3xl md:text-3xl quran-text bg-emerald-50/30 dark:bg-emerald-900/10 rounded-3xl p-6 shadow-inner">
                    {item.ayah_text}
                  </p>
                </div>

                {/* Explanation */}
                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-tighter flex items-center gap-2">
                    <Info className="w-4 h-4" /> العلة التشريعية والمرحلة
                  </h4>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg pb-2">
                    {item.explanation}
                  </p>
                </div>
              </div>

              {/* Footer Gradient Accent */}
              <div className="h-1.5 w-full bg-gradient-to-l from-emerald-600 via-gold-400 to-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* No Results Fallback */}
      {filteredData.length === 0 && (
        <div className="py-20 text-center space-y-4">
          <div className="mx-auto w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
            <Search className="w-10 h-10 text-gray-300" />
          </div>
          <h3 className="text-xl font-medium text-gray-500">لم يتم العثور على تشريعات في هذا التصنيف</h3>
          <button 
            onClick={() => { setSelectedCategory("الكل"); }}
            className="text-emerald-600 font-bold hover:underline"
          >
            إعادة تعيين المرشحات
          </button>
        </div>
      )}
    </div>
  );
}
