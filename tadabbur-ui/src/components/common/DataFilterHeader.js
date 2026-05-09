import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, X } from 'lucide-react';

const DataFilterHeader = ({ 
  searchTerm, 
  setSearchTerm, 
  categories, 
  selectedCategory, 
  setSelectedCategory,
  placeholder = "ابحث...",
  isRtl = true 
}) => {
  return (
    <section className="space-y-8 mb-12">
      {/* Search & Stats Bar */}
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-gold-500/10 to-emerald-500/10 blur-2xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
        <div className="relative bg-white/70 dark:bg-gray-900/70 backdrop-blur-3xl p-2 rounded-[2rem] shadow-2xl border border-emerald-500/10 ring-1 ring-white/20 dark:ring-black/20 flex flex-col md:flex-row items-center gap-2">
          <div className="relative flex-1 w-full">
            <Search className={`absolute right-6 top-1/2 -translate-y-1/2 text-emerald-500 w-5 h-5 group-focus-within:scale-110 transition-transform`} />
            <input
              type="text"
              placeholder={placeholder}
              className={`w-full pr-16 pl-8 py-5 bg-emerald-50/20 dark:bg-emerald-950/20 rounded-[1.5rem] border-none focus:ring-2 focus:ring-gold-500/50 transition-all text-emerald-950 dark:text-white placeholder:text-emerald-900/30 dark:placeholder:text-emerald-100/10 font-bold text-lg`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <AnimatePresence>
              {searchTerm && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => setSearchTerm('')}
                  className={`absolute left-6 top-1/2 -translate-y-1/2 p-2 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 rounded-full transition-colors`}
                >
                  <X className="w-4 h-4 text-gray-400" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Categories Scroll Area */}
      {categories && categories.length > 1 && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-3 pb-2">
            <div className="flex items-center gap-2 pr-4 border-l border-emerald-100 dark:border-gray-800 shrink-0">
              <Filter className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs font-black text-emerald-900/40 dark:text-emerald-100/20 uppercase tracking-widest">التصنيفات</span>
            </div>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`shrink-0 px-6 py-2.5 rounded-2xl text-sm font-bold transition-all duration-300 border ${
                  selectedCategory === cat
                    ? "bg-emerald-800 text-gold-400 border-emerald-700 shadow-lg shadow-emerald-900/20 scale-105"
                    : "bg-white/50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 border-emerald-50/50 dark:border-gray-700/50 hover:border-emerald-300 dark:hover:border-emerald-700"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default DataFilterHeader;
