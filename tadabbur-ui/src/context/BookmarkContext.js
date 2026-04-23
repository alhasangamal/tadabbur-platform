import React, { createContext, useState, useEffect, useContext } from 'react';

const BookmarkContext = createContext();

export const BookmarkProvider = ({ children }) => {
  const [bookmarks, setBookmarks] = useState(() => {
    try {
      const saved = localStorage.getItem('tadabbur_bookmarks');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Failed to load bookmarks', e);
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('tadabbur_bookmarks', JSON.stringify(bookmarks));
    } catch (e) {
      console.error('Failed to save bookmarks', e);
    }
  }, [bookmarks]);

  const toggleBookmark = (item, type) => {
    setBookmarks(prev => {
      // Create a unique ID based on the title or ayah text
      const id = item.title || item.ayah_text || item.hukm || item.legislation || JSON.stringify(item).substring(0, 50);
      const exists = prev.some(b => b.id === id);
      
      if (exists) {
        return prev.filter(b => b.id !== id);
      } else {
        return [{ id, type, item, timestamp: Date.now() }, ...prev];
      }
    });
  };

  const isBookmarked = (item) => {
    if (!item) return false;
    const id = item.title || item.ayah_text || item.hukm || item.legislation || JSON.stringify(item).substring(0, 50);
    return bookmarks.some(b => b.id === id);
  };

  const clearBookmarks = () => {
    setBookmarks([]);
  };

  return (
    <BookmarkContext.Provider value={{ bookmarks, toggleBookmark, isBookmarked, clearBookmarks }}>
      {children}
    </BookmarkContext.Provider>
  );
};

export const useBookmarks = () => useContext(BookmarkContext);
