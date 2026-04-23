import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bookmark, Trash2, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useBookmarks } from '../context/BookmarkContext';

// Helper to map type to English paths
const getCategoryPath = (type) => {
  switch (type) {
    case 'الأحكام': return '/ahkam';
    case 'الأمثال': return '/amthal';
    case 'الثنائيات': return '/contrasts';
    case 'المتشابهات': return '/mutash';
    case 'الناسخ والمنسوخ': return '/nasikh';
    case 'القصص': return '/stories';
    case 'التشريعات': return '/tashriaat';
    default: return '/';
  }
};

export default function BookmarksPage() {
  const { bookmarks, toggleBookmark, clearBookmarks } = useBookmarks();
  const [filter, setFilter] = useState('الكل');

  const types = ['الكل', ...new Set(bookmarks.map(b => b.type))];

  const filteredBookmarks = bookmarks.filter(b => filter === 'الكل' || b.type === filter);

  return (
    <div className="space-y-12 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade font-sans">
      <section className="text-center space-y-4 mb-12">
        <h1 className="title-primary flex items-center justify-center gap-4">
           <Bookmark className="w-12 h-12 text-gold-500 fill-current" />
           <span className="text-gradient-emerald">المحفوظات</span>
        </h1>
        <p className="text-ink-light dark:text-sand-300 max-w-3xl mx-auto text-xl font-light">
          الآيات والمواضيع التي قمت بحفظها للرجوع إليها لاحقاً.
        </p>
      </section>

      {bookmarks.length > 0 && (
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 glass-panel p-4 rounded-3xl">
          <div className="flex bg-white/60 dark:bg-ink/60 p-2 rounded-2xl overflow-x-auto max-w-full">
            {types.map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`whitespace-nowrap py-2 px-4 rounded-xl text-sm font-bold transition-all duration-300 ${
                  filter === type
                    ? "bg-emerald-800 text-gold-400 shadow-md transform scale-100"
                    : "bg-transparent text-ink-light dark:text-sand-400 hover:text-emerald-700 dark:hover:text-emerald-400"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
          
          <button 
            onClick={() => {
              if (window.confirm('هل أنت متأكد من حذف جميع المحفوظات؟')) {
                clearBookmarks();
              }
            }}
            className="flex items-center gap-2 px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-colors font-bold text-sm"
          >
            <Trash2 className="w-4 h-4" />
            مسح الكل
          </button>
        </div>
      )}

      {bookmarks.length === 0 ? (
        <div className="py-24 text-center space-y-6 glass-card mx-auto max-w-2xl">
          <div className="mx-auto w-24 h-24 bg-sand-100 dark:bg-ink-dark rounded-full flex items-center justify-center">
            <Bookmark className="w-12 h-12 text-sand-400" />
          </div>
          <h3 className="text-2xl font-bold text-ink-light dark:text-sand-400">لم تقم بحفظ أي عناصر بعد</h3>
          <p className="text-gray-500">استخدم زر الحفظ الموجود في البطاقات لإضافة العناصر هنا.</p>
          <Link to="/" className="inline-block mt-4 px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors">
            العودة للرئيسية
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence>
            {filteredBookmarks.map((bookmark) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                key={bookmark.id}
                className="glass-card flex flex-col h-full hover:shadow-lg transition-shadow group relative"
              >
                <div className="p-6 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-4">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                      {bookmark.type}
                    </span>
                    <button
                      onClick={() => toggleBookmark(bookmark.item, bookmark.type)}
                      className="p-2 text-red-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 rounded-full transition-colors"
                      title="إزالة"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <h3 className="text-2xl font-kufi font-bold text-ink dark:text-sand-50 mb-3 line-clamp-2">
                    {bookmark.item.title || bookmark.item.surah_name || "عنصر محفوظ"}
                  </h3>
                  
                  <p className="text-ink-light dark:text-sand-300 text-sm line-clamp-4 mb-6 flex-grow">
                    {bookmark.item.hukm || bookmark.item.summary || bookmark.item.difference || bookmark.item.legislation || bookmark.item.explanation || bookmark.item.ayah_text || "تفاصيل العنصر"}
                  </p>
                  
                  <div className="mt-auto pt-4 border-t border-sand-200 dark:border-ink-light/20 flex justify-between items-center">
                    <span className="text-xs text-gray-400">{new Date(bookmark.timestamp).toLocaleDateString('ar-EG')}</span>
                    <Link 
                      to={getCategoryPath(bookmark.type)} 
                      className="inline-flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold hover:text-gold-600 transition-colors"
                    >
                      <span>عرض القسم</span>
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
