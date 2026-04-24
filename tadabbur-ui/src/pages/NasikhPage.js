import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ArrowLeftRight, BookOpen, Layers, Filter, CheckCircle2, AlertCircle } from "lucide-react";
import { useQuranData } from "../context/QuranDataContext";
import nasikhData from "../data/nasikh_data.json";

export default function NasikhPage() {
  const { isRtl } = useQuranData();
  const [selectedCategory, setSelectedCategory] = useState("الكل");

  // Get unique categories (flattened and unique)
  const categories = useMemo(() => {
    const allCats = nasikhData.flatMap((item) => item.category || []);
    const uniqueCats = new Set(allCats.filter(Boolean));
    return ["الكل", ...Array.from(uniqueCats)];
  }, []);

  // Filtered data
  const filteredData = useMemo(() => {
    return nasikhData.filter((item) => {
      const matchesCategory = 
        selectedCategory === "الكل" || 
        (Array.isArray(item.category) && item.category.includes(selectedCategory));
      return matchesCategory;
    });
  }, [selectedCategory]);

  // Stats
  const stats = useMemo(() => [
    { label: "حالة نسخ", value: nasikhData.length, icon: ArrowLeftRight },
    { label: "سورة", value: new Set(nasikhData.map(d => d.surah_name)).size, icon: BookOpen },
    { label: "تصنيف المباحث", value: categories.length - 1, icon: Layers },
  ], [categories]);

  return (
    <div className="space-y-12 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade">
      {/* Page Header */}
      <section className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-emerald-900 dark:text-emerald-300">
           الناسخ والمنسوخ
        </h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
          دراسة التدرج التشريعي في القرآن الكريم، حيث استبدل الله حكماً بحكم آخر أيسر أو أنسب لمرحلة معينة من التشريع، وفق ميزان الحكمة الإلهية.
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

      {/* Nasikh Grid */}
      <motion.div 
        layout
        className="grid grid-cols-1 gap-12"
      >
        <AnimatePresence mode="popLayout">
          {filteredData.map((item, idx) => (
            <motion.div
              layout
              key={`${item.surah_name}-${item.ayah_number}-${idx}`}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.4 }}
              className="group bg-white dark:bg-gray-800 rounded-[2.5rem] overflow-hidden border border-emerald-50 dark:border-gray-700 shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col"
            >
              {/* Card Header Bar */}
              <div className="bg-[#fcfbf7] dark:bg-gray-900 px-8 py-5 flex justify-between items-center border-b border-emerald-50 dark:border-gray-700">
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 px-4 py-1 rounded-full text-sm font-bold shadow-sm">
                    {item.surah_name} {item.ayah_number}
                  </div>
                  {Array.isArray(item.category) && item.category.map((cat, cIdx) => (
                    <span key={cIdx} className="text-[10px] font-bold text-gold-600 dark:text-gold-400 flex items-center gap-1.5 bg-gold-50 dark:bg-gold-900/20 px-3 py-1 rounded-lg border border-gold-100/50 dark:border-gold-900/30">
                      <Layers className="w-3 h-3" />
                      {cat}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                   <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                   <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Case Verified</span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-10 space-y-10">
                {/* Headline */}
                <div className="border-r-4 border-gold-500 pr-5">
                   <h3 className="text-2xl md:text-3xl font-bold text-emerald-950 dark:text-emerald-200 leading-tight">
                     {item.title}
                   </h3>
                </div>

                {/* Verses Container (Stacked with logical flow) */}
                <div className="space-y-8">
                  {/* Mansukh Block */}
                  {item.mansukh_text && (
                    <div className="relative group/verse">
                       <div className="absolute -top-3 right-8 z-10 bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-200 dark:border-amber-800 shadow-sm">
                         المنسوخ (Abrogated)
                       </div>
                       <div className="relative bg-amber-50/20 dark:bg-amber-900/5 rounded-[2rem] p-8 border border-amber-100/30 dark:border-amber-900/20 transition-all group-hover/verse:bg-amber-50/40 dark:group-hover/verse:bg-amber-900/10">
                          <p className="quran-text opacity-70 group-hover/verse:opacity-100 transition-opacity">
                            {item.mansukh_text}
                          </p>
                       </div>
                    </div>
                  )}

                  {/* Visual Connector if both exist */}
                  {item.mansukh_text && item.nasikh_text && (
                    <div className="flex justify-center -my-4 relative z-20">
                       <div className="bg-gold-500 text-white p-2 rounded-full shadow-lg border-4 border-white dark:border-gray-800">
                          <ArrowLeftRight className="w-5 h-5" />
                       </div>
                    </div>
                  )}

                  {/* Nasikh Block */}
                  {item.nasikh_text && (
                    <div className="relative group/verse">
                       <div className="absolute -top-3 right-8 z-10 bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-200 dark:border-emerald-800 shadow-sm">
                         الناسخ (Abrogating)
                       </div>
                       <div className="bg-emerald-50/40 dark:bg-emerald-900/20 rounded-[2rem] p-8 border border-emerald-100/50 dark:border-emerald-900/30 transition-all group-hover/verse:bg-emerald-50/60 dark:group-hover/verse:bg-amber-900/30 shadow-inner">
                          <p className="quran-text">
                            {item.nasikh_text}
                          </p>
                       </div>
                    </div>
                  )}
                </div>

                {/* Detailed Explanation */}
                <div className="bg-sand-50/30 dark:bg-gray-900/40 rounded-3xl p-8 border-t border-emerald-50/50 dark:border-gray-700/50">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-gold-100 dark:bg-gold-900/30 rounded-xl">
                      <BookOpen className="w-5 h-5 text-gold-700 dark:text-gold-400" />
                    </div>
                    <h4 className="text-lg font-bold text-emerald-900 dark:text-emerald-300">
                      بيان العلة التشريعية
                    </h4>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-xl font-medium">
                    {item.explanation}
                  </p>
                </div>
              </div>

              {/* Decorative Accent */}
              <div className="h-2 w-full bg-gradient-to-l from-emerald-600 via-gold-400 to-emerald-800" />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Footer Disclaimer */}
      <div className="mt-12 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/40 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-4">
        <AlertCircle className="w-8 h-8 text-amber-600 shrink-0" />
        <p className="text-sm text-amber-800 dark:text-amber-300 leading-relaxed">
          <strong>تنبيه هام:</strong> علم الناسخ والمنسوخ من أدق العلوم الشرعية، والأمثلة المعروضة هنا هي من الحالات المتفق عليها أو المشهورة عند جمهور المفسرين والأصوليين، وتهدف المنصة لتقريب صورة التدرج التشريعي فقط.
        </p>
      </div>
    </div>
  );
}
