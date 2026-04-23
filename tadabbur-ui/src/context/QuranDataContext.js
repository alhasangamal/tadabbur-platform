import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const QuranDataContext = createContext();

export const useQuranData = () => useContext(QuranDataContext);

export const QuranDataProvider = ({ children }) => {
  const [surahs, setSurahs] = useState({});
  const [surahsList, setSurahsList] = useState([]);
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  
  // Theme & Language State
  const [theme, setTheme] = useState('light');
  const [lang, setLang] = useState('ar');

  useEffect(() => {
    // Basic System Theme initialization
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    }

    const fetchAllData = async () => {
      const API_BASE = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';
      setLoading(true);
      try {
        const [surahsRes, graphRes] = await Promise.all([
          axios.get(`${API_BASE}/surahs`).catch(() => ({ data: [] })),
          axios.get(`${API_BASE}/graph`).catch(() => ({ data: { nodes: [], links: [] } }))
        ]);
        
        // Convert the array into a rich dictionary map for easy lookup
        const surahsDict = {};
        const surahsArray = surahsRes.data || [];
        surahsArray.forEach(s => {
          surahsDict[s.id] = s;
        });

        setSurahs(surahsDict);
        setSurahsList(surahsArray);
        setGraphData(graphRes.data || { nodes: [], links: [] });
      } catch (err) {
        console.error("Data fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAllData();
  }, []);

  const toggleTheme = () => {
    setTheme(prev => {
      const newTheme = prev === 'light' ? 'dark' : 'light';
      if (newTheme === 'dark') document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
      return newTheme;
    });
  };

  const toggleLang = () => {
    setLang(prev => prev === 'ar' ? 'en' : 'ar');
  };

  const value = {
    surahs,
    surahsList,
    graphData,
    loading,
    theme,
    toggleTheme,
    lang,
    toggleLang,
    isRtl: lang === 'ar'
  };

  return (
    <QuranDataContext.Provider value={value}>
      {children}
    </QuranDataContext.Provider>
  );
};
