import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Sparkles, BookOpen, Layers, Filter, CheckCircle2, Image as ImageIcon } from "lucide-react";
import { useQuranData } from "../context/QuranDataContext";
import amthalData from "../data/amthal_data.json";

export default function AmthalPage() {
  const { isRtl } = useQuranData();
  const [selectedCategory, setSelectedCategory] = useState("الكل");

  // Get unique categories (flattened and unique)
  const categories = useMemo(() => {
    const allCats = amthalData.flatMap((item) => item.category || []);
    const uniqueCats = new Set(allCats.filter(Boolean));
    return ["الكل", ...Array.from(uniqueCats)];
  }, []);

  // Filtered data
  const filteredData = useMemo(() => {
    return amthalData.filter((item) => {
      const matchesCategory = 
        selectedCategory === "الكل" || 
        (Array.isArray(item.category) && item.category.includes(selectedCategory));
      return matchesCategory;
    });
  }, [selectedCategory]);

  // Stats
  const stats = useMemo(() => [
    { label: "مثل قرآني", value: amthalData.length, icon: Sparkles },
    { label: "سورة", value: new Set(amthalData.map(d => d.surah_name)).size, icon: BookOpen },
    { label: "تصنيف المواعظ", value: categories.length - 1, icon: Layers },
  ], [categories]);

  return (
    <div className="space-y-12 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade">
      {/* Page Header */}
      <section className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-emerald-900 dark:text-emerald-300">
           الأمثال القرآنية
        </h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
          نوافذ بيانية تقرّب الحقائق الغائبة بصور مشاهدة، حيث يضرب الله الأمثال للناس لعلهم يتفكرون ويعقلون.
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

      {/* Parables Grid */}
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
              className="group bg-white dark:bg-gray-800 rounded-[3rem] overflow-hidden border border-emerald-50 dark:border-gray-700 shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col md:flex-row min-h-[400px]"
            >
              {/* Card Meta Side */}
              <div className="md:w-72 bg-[#fcfbf7] dark:bg-gray-900 p-8 flex flex-col items-center justify-center border-l border-emerald-50 dark:border-gray-700">
                <div className="space-y-8 flex flex-col items-center text-center">
                  <div className="bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 px-6 py-2 rounded-full text-sm font-bold shadow-sm">
                    {item.surah_name} {item.ayah_number}
                  </div>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {Array.isArray(item.category) && item.category.map((cat, cIdx) => (
                      <span key={cIdx} className="text-[11px] font-bold text-gold-700 dark:text-gold-400 bg-gold-50 dark:bg-gold-900/20 px-4 py-1.5 rounded-lg border border-gold-100/50 dark:border-gold-900/30">
                        #{cat}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Main Content Area */}
              <div className="flex-1 p-10 flex flex-col space-y-8">
                {/* Parable Brief Title */}
                <div className="border-r-4 border-gold-500 pr-5">
                   <h3 className="text-2xl md:text-3xl font-bold text-emerald-950 dark:text-emerald-200 leading-tight">
                     {item.short_text}
                   </h3>
                </div>

                {/* The Verse Card */}
                <div className="bg-sand-50/30 dark:bg-gray-900/20 rounded-[2.5rem] p-10 border border-emerald-50/50 dark:border-gray-800/50 relative group-hover:bg-sand-50/50 dark:group-hover:bg-gray-800/40 transition-colors">
                   <ImageIcon className="absolute top-6 left-6 text-emerald-100 dark:text-emerald-900/30 w-12 h-12" />
                   <p className="text-3xl md:text-3xl quran-text drop-shadow-sm">
                     {item.ayah_text}
                   </p>
                </div>

                {/* Semantic Analysis */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-gold-600" />
                    <h4 className="text-sm font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">{isRtl ? 'التدبر والبيان' : 'CONSTRUCTION & MEANING'}</h4>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-xl font-medium">
                    {item.explanation}
                  </p>
                </div>
              </div>

              {/* Side Accent */}
              <div className="w-2 bg-gradient-to-b from-emerald-600 via-gold-400 to-emerald-800 md:block hidden" />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Footer Quote */}
      <div className="mt-20 text-center py-12 border-t border-emerald-100 dark:border-gray-800">
        <p className="text-3xl font-serif text-emerald-800 dark:text-emerald-400 italic">
          "وَتِلْكَ الْأَمْثَالُ نَضْرِبُهَا لِلنَّاسِ وَمَا يَعْقِلُهَا إِلَّا الْعَالِمُونَ"
        </p>
        <p className="text-sm text-gray-400 mt-4">— سورة العنكبوت : ٤٣</p>
      </div>
    </div>
  );
}
