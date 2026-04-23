import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Scale, BookOpen, Layers, Tag as TagIcon, Info, Lightbulb, Zap, ArrowRightLeft } from "lucide-react";
import { useQuranData } from "../context/QuranDataContext";
import contrastsData from "../data/contrasts_data.json";

export default function ContrastsPage() {
  const { isRtl } = useQuranData();
  const [selectedCategory, setSelectedCategory] = useState("الكل");

  // Get unique categories from the category_type arrays
  const categories = useMemo(() => {
    const allCats = contrastsData.flatMap((item) => item.category_type || []);
    const unique = new Set(allCats);
    return ["الكل", ...Array.from(unique)];
  }, []);

  // Filtered data
  const filteredData = useMemo(() => {
    return contrastsData.filter((item) => {
      const matchesCategory = 
        selectedCategory === "الكل" || 
        (Array.isArray(item.category_type) && item.category_type.includes(selectedCategory));
      return matchesCategory;
    });
  }, [selectedCategory]);

  return (
    <div className="space-y-12 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade">
      {/* Page Header */}
      <section className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-emerald-900 dark:text-emerald-300">
           الثنائيات والتقابلات القرآنية
        </h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
          نظام التوازن الكوني والبياني في القرآن، حيث تتقابل المعاني (الحق مقابل الباطل، الدنيا مقابل الآخرة) لتتجلى الحقائق.
        </p>
      </section>

      {/* Categories Filter Box */}
      <div className="bg-[#f8f6f1] dark:bg-[#0f172a] p-8 rounded-3xl border border-emerald-100 dark:border-emerald-900/40 shadow-xl relative z-30">
        <div className="flex flex-wrap gap-2 justify-center">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 ${
                selectedCategory === cat
                  ? "bg-emerald-700 text-white shadow-md transform scale-105"
                  : "bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-emerald-50 dark:border-gray-700 hover:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
              }`}
            >
              {cat}
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
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="group bg-white dark:bg-gray-800 rounded-[4rem] overflow-hidden border border-emerald-100 dark:border-gray-700 shadow-xl hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-all duration-500"
            >
              {/* Card Header Overlay */}
              <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-900 p-10 text-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                   <div className="grid grid-cols-6 gap-2 rotate-12 transform scale-150">
                      {[...Array(24)].map((_, i) => <Zap key={i} className="w-12 h-12 text-white" />)}
                   </div>
                </div>
                <div className="relative z-10 space-y-4">
                  <div className="flex justify-center gap-2 flex-wrap">
                    {Array.isArray(item.category_type) && item.category_type.map((cat, cIdx) => (
                      <span key={cIdx} className="bg-gold-500/20 text-gold-400 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border border-gold-500/30 backdrop-blur-sm">
                        {cat}
                      </span>
                    ))}
                  </div>
                  <h3 className="text-3xl md:text-4xl font-bold text-white leading-tight max-w-4xl mx-auto flex items-center justify-center gap-4">
                    <Scale className="w-10 h-10 text-gold-500 opacity-80" />
                    {item.title}
                  </h3>
                </div>
              </div>

              {/* Duality Verses Area */}
              <div className="p-12 relative">
                {/* Subtle Divider Line (Vertical on LG, Horizontal on Small) */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 hidden lg:block h-3/4 w-px bg-gradient-to-b from-transparent via-emerald-100 dark:via-emerald-900 to-transparent opacity-50" />
                
                <div className={`grid grid-cols-1 ${item.ayahs.length > 1 ? 'lg:grid-cols-2' : ''} gap-12 lg:gap-24 relative`}>
                  {item.ayahs.map((ayah, aIdx) => (
                    <div key={aIdx} className="space-y-6 flex flex-col items-center text-center">
                       <div className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-900/20 px-4 py-2 rounded-2xl border border-emerald-100 dark:border-emerald-800/50 shadow-sm">
                          <span className="text-sm font-black text-emerald-800 dark:text-emerald-400">
                            {ayah.surah_name} {ayah.ayah_number}
                          </span>
                          <BookOpen className="w-4 h-4 text-emerald-300 dark:text-emerald-600" />
                       </div>
                       <div className="p-8 bg-[#fcfbf7] dark:bg-gray-900/40 rounded-[3rem] border border-emerald-50/50 dark:border-gray-700 min-h-[160px] flex items-center justify-center relative w-full group-hover:border-emerald-200 transition-colors">
                          <p className={`text-xl md:text-2xl quran-text ${aIdx % 2 === 0 ? 'text-emerald-900 dark:text-emerald-100' : 'text-amber-900 dark:text-amber-100'}`}>
                             {ayah.ayah_text}
                          </p>
                       </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Wisdom / Explanation Area */}
              <div className="px-12 pb-12">
                <div className="bg-emerald-50/20 dark:bg-emerald-900/10 rounded-[3rem] p-10 border border-emerald-50 dark:border-emerald-900/20 space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-emerald-100 dark:bg-emerald-900/40 rounded-2xl">
                      <ArrowRightLeft className="w-6 h-6 text-emerald-700 dark:text-emerald-400" />
                    </div>
                    <h4 className="text-xl font-bold text-emerald-950 dark:text-emerald-200">اللطيفة البيانية والحكمة</h4>
                  </div>
                  <div className="relative">
                    <span className="absolute -top-6 -right-6 text-emerald-100 dark:text-emerald-900/20 text-8xl font-serif pointer-events-none opacity-50">“</span>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-xl font-medium pr-6 indent-4">
                      {item.explanation}
                    </p>
                  </div>
                </div>
              </div>

              {/* Bottom Decorative Pattern */}
              <div className="h-2 w-full bg-gradient-to-r from-emerald-600 via-gold-400 to-emerald-600" />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Empty State */}
      {filteredData.length === 0 && (
        <div className="py-20 text-center space-y-4">
          <div className="mx-auto w-24 h-24 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center">
            <Search className="w-12 h-12 text-gray-200" />
          </div>
          <h3 className="text-2xl font-bold text-gray-400">لم يتم العثور على ثنائيات في هذا التصنيف</h3>
        </div>
      )}
    </div>
  );
}
