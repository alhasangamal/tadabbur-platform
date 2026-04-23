import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useQuranData } from '../../context/QuranDataContext';
import { t } from '../../locales';

export default function GlobalSearchBar() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { isRtl, lang } = useQuranData();

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setQuery('');
    }
  };

  return (
    <form 
      onSubmit={handleSearch} 
      className={`relative flex items-center w-full max-w-md transition-all duration-300 focus-within:ring-2 focus-within:ring-gold-500 rounded-full bg-sand-100/50 dark:bg-ink/50 border border-sand-200 dark:border-ink-light/20 ${isRtl ? 'flex-row-reverse' : ''}`}
    >
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t(lang, 'search_placeholder')}
        className={`w-full bg-transparent border-none py-2 px-4 text-sm text-ink dark:text-sand-50 placeholder-ink-light/60 dark:placeholder-sand-400/60 focus:outline-none focus:ring-0 ${isRtl ? 'text-right' : 'text-left'}`}
        dir={isRtl ? 'rtl' : 'ltr'}
      />
      <button 
        type="submit"
        className="p-2 text-ink-light dark:text-sand-400 hover:text-gold-600 dark:hover:text-gold-400 transition-colors"
      >
        <Search className="w-5 h-5" />
      </button>
    </form>
  );
}
