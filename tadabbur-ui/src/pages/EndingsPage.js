import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, BookOpen, Lightbulb, ChevronDown, Hash, MapPin, Filter, Layers, Sparkles, BarChart3, Moon } from "lucide-react";
import { List } from "react-window";
import { useQuranData } from "../context/QuranDataContext";
import endingsData from "../data/quran_endings.json";
import insightsData from "../data/insights_data.json";
import densityDataScraped from "../data/density_data.json";
import revelationDataStatic from "../data/revelation_data.json";

export default function EndingsPage() {
  const { isRtl, surahsList } = useQuranData();
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedPair, setExpandedPair] = useState(null);
  const [activeTab, setActiveTab] = useState("pairs"); // pairs | repeats | topics | density | revelation | insights
  const [sortBy, setSortBy] = useState("count"); // count | name

  // Filtered & sorted pairs
  const filteredPairs = useMemo(() => {
    let data = endingsData.filter((item) => {
      if (!searchTerm) return true;
      return (
        item.pair.includes(searchTerm) ||
        item.meaning.includes(searchTerm) ||
        item.contexts.some((c) => c.includes(searchTerm))
      );
    });
    if (sortBy === "count") {
      data = [...data].sort((a, b) => b.references.length - a.references.length);
    }
    return data;
  }, [searchTerm, sortBy]);

  // Top 20 for repetitions
  const topEndings = useMemo(() => {
    return [...endingsData]
      .sort((a, b) => b.references.length - a.references.length)
      .slice(0, 20);
  }, []);

  // Stats
  const totalVerses = useMemo(
    () => endingsData.reduce((sum, item) => sum + item.references.length, 0),
    []
  );

  const stats = [
    { label: "زوج فاصلة", value: endingsData.length, icon: Sparkles },
    { label: "آية قرآنية", value: totalVerses, icon: BookOpen },
    { label: "اكتشاف بلاغي", value: insightsData.length, icon: Lightbulb },
  ];

  const barColors = [
    "bg-gradient-to-l from-emerald-600 to-emerald-400",
    "bg-gradient-to-l from-blue-600 to-blue-400",
    "bg-gradient-to-l from-amber-600 to-amber-400",
    "bg-gradient-to-l from-rose-600 to-rose-400",
    "bg-gradient-to-l from-violet-600 to-violet-400",
    "bg-gradient-to-l from-teal-600 to-teal-400",
    "bg-gradient-to-l from-orange-600 to-orange-400",
    "bg-gradient-to-l from-indigo-600 to-indigo-400",
  ];

  // --- NEW: Topics Data ---
  const themeMapping = {
    "الرحمة والمغفرة": ["غفور", "رحيم", "رؤوف", "تواب", "عفو"],
    "العلم والحكمة": ["حكيم", "عليم"],
    "القوة والحكم": ["عزيز", "قوي", "متين", "جبار", "قهار", "مقتدر"],
    "الإدراك الإلهي": ["سميع", "بصير", "خبير", "شهيد", "لطيف"],
    "الفضل والقدرة": ["قدير", "واسع", "فضل", "رزاق", "وهاب"],
    "العدل والتحذير": ["عقاب", "حساب", "منتقم", "خزي"],
    "الجلال الإلهي": ["جلال", "إكرام", "علي", "كبير", "مجيد", "حميد", "غني", "واحد"]
  };

  const topicData = useMemo(() => {
    // We count each unique verse reference once for its primary theme
    const themeCounts = {};
    Object.keys(themeMapping).forEach(t => themeCounts[t] = 0);

    endingsData.forEach(p => {
      // Find the first theme that matches any word in the pair
      const matchedTheme = Object.entries(themeMapping).find(([theme, keywords]) => 
        keywords.some(k => p.pair.includes(k))
      );
      if (matchedTheme) {
        themeCounts[matchedTheme[0]] += p.references.length;
      }
    });

    return Object.entries(themeCounts)
      .map(([theme, count]) => ({ theme, count }))
      .sort((a, b) => b.count - a.count);
  }, []);

  // --- NEW: Density Data ---
  const densityData = useMemo(() => {
    if (!surahsList.length) return [];
    
    const surahStats = surahsList.map(s => {
      const endingsInSurah = endingsData.reduce((count, p) => {
        return count + p.references.filter(r => r.surah === s.name_ar || r.surah === s.surah_name_ar).length;
      }, 0);
      
      const versesCount = s.verses_count || 1;
      const density = (endingsInSurah / versesCount) * 100;
      
      return {
        id: s.id,
        name: s.name_ar || s.surah_name_ar,
        verses: versesCount,
        endings: endingsInSurah,
        density: density
      };
    });

    return surahStats
      .filter(s => s.endings > 0)
      .sort((a, b) => b.density - a.density)
      .slice(0, 10);
  }, [surahsList]);

  // --- NEW: Revelation Data ---
  // (Using static data from revelation_data.json as requested)

  return (
    <div className="space-y-10 pb-20 max-w-7xl mx-auto animate-fade">
      {/* Hero Header */}
      <section className="relative overflow-hidden bg-emerald-900 rounded-[2rem] p-10 md:p-16 text-center shadow-xl">
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage:
              'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23d97706\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          }}
        />
        <div className="relative z-10">
          <h1
            className="text-4xl md:text-6xl font-serif text-white font-bold mb-4"
            style={{ lineHeight: "1.3" }}
          >
            الفواصل القرآنية
          </h1>
          <p className="text-emerald-200/80 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
            أزواج الأسماء الحسنى التي تختم بها آيات القرآن الكريم — أختام دلالية
            تغلق المعنى بالصفة الأنسب وتكشف عن نظام بلاغي مُحكم
          </p>
        </div>
      </section>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="bg-white dark:bg-gray-800 border border-emerald-100 dark:border-gray-700 rounded-2xl p-6 shadow-sm flex items-center justify-between transition-all hover:shadow-md"
          >
            <div className="space-y-1">
              <span className="text-4xl font-serif text-gold-600 dark:text-gold-500">
                {stat.value}
              </span>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {stat.label}
              </p>
            </div>
            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl">
              <stat.icon className="w-8 h-8 text-emerald-700 dark:text-emerald-400" />
            </div>
          </div>
        ))}
      </div>

      {/* Tab Switcher */}
      <div className="flex flex-wrap gap-4 p-2 bg-sand-50/50 dark:bg-gray-900/50 rounded-2xl border border-emerald-50 dark:border-gray-800 max-w-4xl mx-auto justify-center">
        {[
          { id: "pairs", label: "أزواج الصفات", icon: Layers },
          { id: "repeats", label: "التكرارات", icon: BarChart3 },
          { id: "topics", label: "المواضيع", icon: MapPin },
          { id: "density", label: "الكثافة", icon: Filter },
          { id: "revelation", label: "مكي/مدني", icon: Sparkles },
          { id: "insights", label: "اكتشافات", icon: Lightbulb },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${
              activeTab === tab.id
                ? "bg-emerald-700 text-white shadow-lg scale-105"
                : "text-gray-500 hover:bg-white dark:hover:bg-gray-800 dark:text-gray-400"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ════════════════════  PAIRS TAB  ════════════════════ */}
      {activeTab === "pairs" && (
        <motion.div
          key="pairs"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Search & Sort Controls */}
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-3xl p-6 shadow-xl border border-emerald-50 dark:border-gray-700">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search
                  className="absolute right-4 top-1/2 text-gray-400 w-5 h-5"
                  style={{ transform: "translateY(-50%)" }}
                />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="ابحث عن زوج فاصلة، معنى، أو سياق..."
                  className="w-full bg-sand-50 dark:bg-gray-900 border-none rounded-xl py-3 pr-12 pl-4 shadow-sm focus:ring-2 focus:ring-emerald-500 outline-none text-gray-700 dark:text-gray-200 transition-shadow"
                />
              </div>
              <div className="flex gap-2 p-1 bg-sand-50 dark:bg-gray-900 rounded-xl">
                <button
                  onClick={() => setSortBy("count")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    sortBy === "count"
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-400"
                      : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-400"
                  }`}
                >
                  بالتكرار
                </button>
                <button
                  onClick={() => setSortBy("name")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    sortBy === "name"
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-400"
                      : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-400"
                  }`}
                >
                  أبجدي
                </button>
              </div>
            </div>
            <div className="mt-3 text-sm text-gray-400 dark:text-gray-500">
              عرض {filteredPairs.length} من {endingsData.length} زوج فاصلة
            </div>
          </div>

          {/* Pairs Cards */}
          <div className="space-y-5">
            <AnimatePresence mode="popLayout">
              {filteredPairs.map((pair, idx) => {
                const isExpanded = expandedPair === idx;
                return (
                  <motion.div
                    layout
                    key={pair.pair}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className={`bg-white dark:bg-gray-800 rounded-3xl border overflow-hidden transition-all duration-300 ${
                      isExpanded
                        ? "border-emerald-400 dark:border-emerald-600 shadow-xl"
                        : "border-emerald-50 dark:border-gray-700 shadow-sm hover:shadow-lg hover:border-emerald-200 dark:hover:border-emerald-800"
                    }`}
                  >
                    {/* Card Header — always visible */}
                    <button
                      onClick={() =>
                        setExpandedPair(isExpanded ? null : idx)
                      }
                      className="w-full text-right p-6 md:p-8"
                    >
                      <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
                        {/* Pair name badge */}
                        <div className="flex items-center gap-4 shrink-0">
                          <div
                            className={`min-w-[3rem] h-12 px-3 rounded-2xl flex items-center justify-center font-bold text-lg border-2 transition-colors ${
                              isExpanded
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/50 dark:text-emerald-400 dark:border-emerald-800"
                                : "bg-sand-50 text-gray-400 border-transparent dark:bg-gray-900"
                            }`}
                          >
                            {pair.references.length}
                          </div>
                          <h3
                            className={`text-2xl md:text-3xl font-serif font-bold transition-colors ${
                              isExpanded
                                ? "text-emerald-800 dark:text-emerald-400"
                                : "text-gray-900 dark:text-white"
                            }`}
                          >
                            {pair.pair}
                          </h3>
                        </div>

                        {/* Meaning + Contexts */}
                        <div className="flex-1 flex flex-col md:flex-row md:items-center gap-2 md:gap-6">
                          <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base font-medium">
                            {pair.meaning}
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {pair.contexts.map((ctx, ci) => (
                              <span
                                key={ci}
                                className="text-[11px] font-bold text-gold-700 dark:text-gold-400 bg-gold-50 dark:bg-gold-900/20 px-3 py-1 rounded-lg border border-gold-100/50 dark:border-gold-900/30"
                              >
                                {ctx}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Chevron */}
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-400 transition-transform duration-300 shrink-0 ${
                            isExpanded
                              ? "rotate-180 bg-emerald-50 text-emerald-600 dark:bg-emerald-900/50"
                              : ""
                          }`}
                        >
                          <ChevronDown className="w-5 h-5" />
                        </div>
                      </div>
                    </button>

                    {/* Expanded Content */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="px-6 md:px-8 pb-8 border-t border-gray-100 dark:border-gray-700/50">
                            {/* Placements */}
                            {pair.placements && (
                              <div className="mt-6 p-5 bg-gradient-to-r from-gold-50 to-amber-50 dark:from-gray-900 dark:to-gray-900/50 rounded-2xl border border-gold-100 dark:border-gold-900/30">
                                <div className="flex items-center gap-2 mb-2">
                                  <MapPin className="w-4 h-4 text-gold-600" />
                                  <span className="text-xs font-black text-gold-700 dark:text-gold-400 uppercase tracking-[0.15em]">
                                    موضعاته ودلالاته
                                  </span>
                                </div>
                                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed font-medium">
                                  {pair.placements}
                                </p>
                              </div>
                            )}

                            {/* Verses */}
                            <div className="mt-6">
                              <h4 className="text-sm font-black text-gray-400 dark:text-gray-500 mb-4 flex items-center gap-2">
                                <BookOpen className="w-4 h-4 text-emerald-600" />
                                <span>
                                  الآيات ({pair.references.length})
                                </span>
                              </h4>
                              <div className="space-y-3">
                                {pair.references.length > 10 ? (
                                  <List
                                    height={400}
                                    itemCount={pair.references.length}
                                    itemSize={130}
                                    width="100%"
                                    className="custom-scrollbar"
                                  >
                                    {({ index, style }) => (
                                      <div style={style} className="pr-2 pb-3">
                                        <div className="bg-sand-50/50 dark:bg-gray-900/30 rounded-2xl p-5 border border-gray-100 dark:border-gray-700/50 hover:border-emerald-200 dark:hover:border-emerald-800 transition-colors h-full">
                                          <div className="flex items-center gap-2 mb-2">
                                            <span className="inline-flex items-center justify-center min-w-[2rem] h-7 px-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 text-xs font-bold border border-emerald-200 dark:border-emerald-800">
                                              {pair.references[index].ayah}
                                            </span>
                                            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                              سورة {pair.references[index].surah}
                                            </span>
                                          </div>
                                          {pair.references[index].text && (
                                            <p className="quran-text text-sm leading-[1.8] truncate">
                                              {pair.references[index].text}
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                    )}
                                  </List>
                                ) : (
                                  <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                    {pair.references.map((ref, ri) => (
                                      <div
                                        key={ri}
                                        className="bg-sand-50/50 dark:bg-gray-900/30 rounded-2xl p-5 border border-gray-100 dark:border-gray-700/50 hover:border-emerald-200 dark:hover:border-emerald-800 transition-colors"
                                      >
                                        <div className="flex items-center gap-2 mb-3">
                                          <span className="inline-flex items-center justify-center min-w-[2rem] h-7 px-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 text-xs font-bold border border-emerald-200 dark:border-emerald-800">
                                            {ref.ayah}
                                          </span>
                                          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                            سورة {ref.surah}
                                          </span>
                                        </div>
                                        {ref.text && (
                                          <p className="quran-text text-base leading-[2.2]">
                                            {ref.text}
                                          </p>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {filteredPairs.length === 0 && (
            <div className="text-center py-20 text-gray-400 dark:text-gray-500 text-lg">
              لا توجد نتائج مطابقة لبحثك.
            </div>
          )}
        </motion.div>
      )}

      {/* ════════════════════  REPEATS TAB  ════════════════════ */}
      {activeTab === "repeats" && (
        <motion.div
          key="repeats"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-gray-800 rounded-[3rem] p-8 md:p-12 shadow-2xl border border-emerald-50 dark:border-gray-700"
        >
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
            <div>
              <h2 className="text-3xl font-serif font-bold text-gray-900 dark:text-white mb-2">
                أكثر 20 فاصلة تكرارًا
              </h2>
              <div className="h-1.5 w-24 bg-gold-500 rounded-full" />
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <BarChart3 className="w-5 h-5" />
              <span className="text-sm font-bold uppercase tracking-widest">التوزيع الإحصائي</span>
            </div>
          </div>

          <div className="space-y-6">
            {topEndings.map((pair, idx) => {
              const maxCount = topEndings[0].references.length;
              const widthPercentage = (pair.references.length / maxCount) * 100;
              const colorClass = barColors[idx % barColors.length];

              return (
                <div key={pair.pair} className="group flex items-center gap-6">
                  {/* Label (Right) */}
                  <div className="w-32 md:w-40 text-right shrink-0">
                    <span className="text-base md:text-lg font-serif font-bold text-gray-800 dark:text-gray-200 group-hover:text-emerald-600 transition-colors">
                      {pair.pair}
                    </span>
                  </div>

                  {/* Bar (Middle) */}
                  <div className="flex-1 h-10 bg-gray-50 dark:bg-gray-900/50 rounded-lg overflow-hidden relative border border-gray-100/50 dark:border-gray-800/50 group-hover:border-emerald-200 dark:group-hover:border-emerald-900/30 transition-all">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${widthPercentage}%` }}
                      transition={{ duration: 1.2, delay: idx * 0.04, ease: "easeOut" }}
                      className={`h-full ${colorClass} shadow-lg relative`}
                    >
                      {/* Shine effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-transparent to-transparent opacity-30" />
                    </motion.div>
                  </div>

                  {/* Value (Left) */}
                  <div className="w-12 text-left shrink-0">
                    <span className="text-xl font-serif font-black text-gray-300 dark:text-gray-600 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                      {pair.references.length}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-12 pt-8 border-t border-gray-100 dark:border-gray-700 flex justify-center">
             <p className="text-gray-400 text-sm flex items-center gap-2 italic">
               <Sparkles className="w-4 h-4 text-gold-500" />
               إحصائيات مبنية على جميع مواضع الفواصل في المصحف الشريف
             </p>
          </div>
        </motion.div>
      )}

      {/* ════════════════════  INSIGHTS TAB  ════════════════════ */}
      {activeTab === "insights" && (
        <motion.div
          key="insights"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-serif font-bold text-gray-900 dark:text-white mb-2">
              اكتشافات بلاغية
            </h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
              أنماط وملاحظات عميقة حول منظومة الفواصل القرآنية
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {insightsData.map((insight, idx) => (
              <motion.div
                key={insight["رقم"]}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
                className="group bg-white dark:bg-gray-800 rounded-3xl p-8 border border-emerald-50 dark:border-gray-700 shadow-sm hover:shadow-xl hover:border-gold-200 dark:hover:border-gold-800 transition-all duration-300 relative overflow-hidden"
              >
                {/* Number badge */}
                <div className="absolute top-6 left-6 w-12 h-12 rounded-2xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:scale-110 transition-transform">
                  {insight["رقم"]}
                </div>

                {/* Decorative corner */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-50 to-transparent dark:from-emerald-900/20 dark:to-transparent rounded-bl-[3rem] opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="relative z-10 pr-0 pt-2">
                  <div className="flex items-start gap-3 mb-4">
                    <Lightbulb className="w-5 h-5 text-gold-500 mt-1 shrink-0" />
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">
                      {insight["العنوان"]}
                    </h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-base font-medium">
                    {insight["النص"]}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ════════════════════  TOPICS TAB  ════════════════════ */}
      {activeTab === "topics" && (
        <motion.div
          key="topics"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-gray-800 rounded-[3rem] p-8 md:p-12 shadow-2xl border border-emerald-50 dark:border-gray-700"
        >
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-serif font-bold text-gray-900 dark:text-white mb-2">
                التوزيع الموضوعي
              </h2>
              <div className="h-1.5 w-24 bg-gold-500 rounded-full" />
            </div>
          </div>

          <div className="space-y-6">
            {topicData.map((item, idx) => {
              const maxCount = topicData[0].count;
              const widthPercentage = (item.count / maxCount) * 100;
              const colorClass = barColors[idx % barColors.length];

              return (
                <div key={item.theme} className="group flex items-center gap-6">
                  <div className="w-32 md:w-40 text-right shrink-0">
                    <span className="text-base font-bold text-gray-700 dark:text-gray-300">
                      {item.theme}
                    </span>
                  </div>
                  <div className="flex-1 h-10 bg-gray-50 dark:bg-gray-900/50 rounded-lg overflow-hidden relative">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${widthPercentage}%` }}
                      transition={{ duration: 1, delay: idx * 0.1 }}
                      className={`h-full ${colorClass} shadow-lg`}
                    />
                  </div>
                  <div className="w-12 text-left shrink-0">
                    <span className="text-lg font-bold text-gray-400">
                      {item.count}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* ════════════════════  DENSITY TAB  ════════════════════ */}
      {activeTab === "density" && (
        <motion.div
          key="density"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-xl border border-emerald-50 dark:border-gray-700 overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead>
                <tr className="bg-sand-50 dark:bg-gray-900/50 border-b border-emerald-100 dark:border-gray-700">
                  <th className="px-6 py-5 text-gold-700 font-bold">#</th>
                  <th className="px-6 py-5 text-gold-700 font-bold">السورة</th>
                  <th className="px-6 py-5 text-gold-700 font-bold">آيات</th>
                  <th className="px-6 py-5 text-gold-700 font-bold">فواصل</th>
                  <th className="px-6 py-5 text-gold-700 font-bold">كثافة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                {densityDataScraped.map((s, idx) => (
                  <tr key={idx} className="hover:bg-emerald-50/30 dark:hover:bg-emerald-900/10 transition-colors">
                    <td className="px-6 py-4 text-emerald-600 font-bold">{s.رقم_السورة}</td>
                    <td className="px-6 py-4 font-bold text-gray-800 dark:text-gray-200">{s.السورة_عربي}</td>
                    <td className="px-6 py-4 text-gray-500">{s.عدد_الآيات}</td>
                    <td className="px-6 py-4 text-emerald-700 font-bold">{s.عدد_الفواصل}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                         <div className="flex-1 h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden w-32 border border-gray-200 dark:border-gray-600">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: s.الكثافة }}
                              className="h-full bg-teal-600"
                            />
                         </div>
                         <span className="text-xs font-bold text-teal-600">{s.الكثافة}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* ════════════════════  REVELATION TAB  ════════════════════ */}
      {activeTab === "revelation" && (
        <motion.div
          key="revelation"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          {/* Meccan Card */}
          <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-8 border border-emerald-50 dark:border-gray-700 shadow-xl">
             <div className="flex justify-between items-start mb-6">
                <div className="text-right">
                  <h3 className="text-2xl font-serif font-bold text-gold-600">مكية ({revelationDataStatic.makki.count})</h3>
                  <p className="text-xs text-gray-400 mt-1">{revelationDataStatic.makki.subtitle}</p>
                </div>
                <Moon className="w-8 h-8 text-gold-400" />
             </div>
             <div className="space-y-4 mt-8">
                {revelationDataStatic.makki.top.map((p, i) => (
                  <div key={i} className="flex justify-between items-center group">
                    <span className="text-gray-700 dark:text-gray-300 font-medium group-hover:text-gold-600 transition-colors">{p.pair}</span>
                    <span className="text-emerald-600 font-bold">{p.count}×</span>
                  </div>
                ))}
             </div>
          </div>

          {/* Medinan Card */}
          <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-8 border border-emerald-50 dark:border-gray-700 shadow-xl">
             <div className="flex justify-between items-start mb-6">
                <div className="text-right">
                  <h3 className="text-2xl font-serif font-bold text-gold-600">مدنية ({revelationDataStatic.madani.count})</h3>
                  <p className="text-xs text-gray-400 mt-1">{revelationDataStatic.madani.subtitle}</p>
                </div>
                <MapPin className="w-8 h-8 text-emerald-400" />
             </div>
             <div className="space-y-4 mt-8">
                {revelationDataStatic.madani.top.map((p, i) => (
                  <div key={i} className="flex justify-between items-center group">
                    <span className="text-gray-700 dark:text-gray-300 font-medium group-hover:text-gold-600 transition-colors">{p.pair}</span>
                    <span className="text-emerald-600 font-bold">{p.count}×</span>
                  </div>
                ))}
             </div>
          </div>
        </motion.div>
      )}

      {/* Footer Quote */}
      <div className="mt-16 text-center py-12 border-t border-emerald-100 dark:border-gray-800">
        <p className="text-2xl md:text-3xl font-serif text-emerald-800 dark:text-emerald-400 italic leading-relaxed">
          "وَلِلَّهِ الْأَسْمَاءُ الْحُسْنَىٰ فَادْعُوهُ بِهَا"
        </p>
        <p className="text-sm text-gray-400 mt-4">— سورة الأعراف : ١٨٠</p>
      </div>
    </div>
  );
}
