import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';

const QuranDataContext = createContext();

export const useQuranData = () => useContext(QuranDataContext);

const CACHE_KEY_SURAHS = 'tadabbur_cache_surahs';
const CACHE_KEY_GRAPH = 'tadabbur_cache_graph';
const CACHE_EXPIRY = 1000 * 60 * 60 * 24; // 24 hours

export const QuranDataProvider = ({ children }) => {
  const [surahs, setSurahs] = useState({});
  const [surahsList, setSurahsList] = useState([]);
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const lang = 'ar';

  const fetchAllData = useCallback(async (force = false) => {
    const API_BASE = process.env.REACT_APP_API_URL || 'https://tadabbur-api.onrender.com';
    
    // Try to load from cache first
    if (!force) {
      const cachedSurahs = localStorage.getItem(CACHE_KEY_SURAHS);
      const cachedGraph = localStorage.getItem(CACHE_KEY_GRAPH);
      
      if (cachedSurahs && cachedGraph) {
        try {
          const s = JSON.parse(cachedSurahs);
          const g = JSON.parse(cachedGraph);
          if (Date.now() - s.timestamp < CACHE_EXPIRY) {
            setSurahs(s.dict);
            setSurahsList(s.list);
            setGraphData(g.data);
            setLoading(false);
            // Optionally still fetch in background to refresh cache
            // return; 
          }
        } catch (e) {
          console.error("Cache parsing error", e);
        }
      }
    }

    setLoading(true);
    try {
      const [surahsRes, graphRes] = await Promise.all([
        axios.get(`${API_BASE}/surahs`).catch(() => ({ data: [] })),
        axios.get(`${API_BASE}/graph`).catch(() => ({ data: { nodes: [], links: [] } }))
      ]);
      
      const surahsArray = surahsRes.data || [];
      const surahsDict = {};
      surahsArray.forEach(s => {
        surahsDict[s.id] = s;
      });

      setSurahs(surahsDict);
      setSurahsList(surahsArray);
      setGraphData(graphRes.data || { nodes: [], links: [] });

      // Save to cache
      localStorage.setItem(CACHE_KEY_SURAHS, JSON.stringify({
        dict: surahsDict,
        list: surahsArray,
        timestamp: Date.now()
      }));
      localStorage.setItem(CACHE_KEY_GRAPH, JSON.stringify({
        data: graphRes.data,
        timestamp: Date.now()
      }));

    } catch (err) {
      console.error("Data fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  }, []);

  const value = useMemo(() => ({
    surahs,
    surahsList,
    graphData,
    loading,
    theme,
    toggleTheme,
    lang,
    isRtl: true,
    refreshData: () => fetchAllData(true)
  }), [surahs, surahsList, graphData, loading, theme, toggleTheme, fetchAllData]);

  return (
    <QuranDataContext.Provider value={value}>
      {children}
    </QuranDataContext.Provider>
  );
};
