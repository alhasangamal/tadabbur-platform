import React from 'react';
import { Bookmark } from 'lucide-react';
import { useBookmarks } from '../../context/BookmarkContext';

export default function BookmarkButton({ item, type, className = '' }) {
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const active = isBookmarked(item);

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleBookmark(item, type);
      }}
      className={`p-2 rounded-full transition-all duration-300 ${active ? 'bg-gold-100 text-gold-600 dark:bg-gold-900/30 dark:text-gold-400' : 'bg-sand-50/50 text-gray-400 hover:bg-gold-50 hover:text-gold-500 dark:bg-gray-800/50 dark:text-gray-500 dark:hover:bg-gray-700 dark:hover:text-gold-400'} ${className}`}
      title={active ? 'إزالة من المحفوظات' : 'حفظ في المحفوظات'}
    >
      <Bookmark className={`w-5 h-5 ${active ? 'fill-current' : ''}`} />
    </button>
  );
}
