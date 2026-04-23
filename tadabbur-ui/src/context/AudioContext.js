import React, { createContext, useState, useContext, useRef, useEffect } from 'react';

const AudioContext = createContext();

export const RECITERS = [
  { id: 7, name: 'مشاري راشد العفاسي', englishName: 'Mishary Rashid Alafasy' },
  { id: 1, name: 'عبد الباسط عبد الصمد', englishName: 'AbdulBaset AbdulSamad' },
  { id: 6, name: 'محمود خليل الحصري', englishName: 'Mahmoud Khalil Al-Husary' },
  { id: 5, name: 'سعد الغامدي', englishName: 'Saad Al-Ghamdi' }
];

export const AudioProvider = ({ children }) => {
  const [currentSurah, setCurrentSurah] = useState(null);
  const [reciterId, setReciterId] = useState(7);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [timings, setTimings] = useState([]);
  const [versesMap, setVersesMap] = useState({});
  const [currentVerse, setCurrentVerse] = useState(null);
  
  const audioRef = useRef(new Audio());

  // Version Marker for Debugging
  useEffect(() => {
    window._AUDIO_VERSION = "v11-final";
    window._AUDIO_STATE = { currentSurah, isPlaying, currentVerse };
  }, [currentSurah, isPlaying, currentVerse]);

  const fetchWithRetry = async (url, retries = 3) => {
    for (let i = 0; i < retries; i++) {
        try {
            const res = await fetch(url);
            if (res.ok) return await res.json();
        } catch (e) {
            if (i === retries - 1) throw e;
            await new Promise(r => setTimeout(r, 1000));
        }
    }
    throw new Error(`Failed to fetch ${url}`);
  };

  const playSurah = async (surah, forceReload = false) => {
    if (!surah || !surah.surah_number) return;

    if (!forceReload && currentSurah && currentSurah.surah_number === surah.surah_number) {
        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            audioRef.current.play();
            setIsPlaying(true);
        }
        return;
    }

    // When switching reciters, we will start from the beginning.

    setIsLoading(true);
    setCurrentVerse(null);
    setCurrentSurah(surah);
    setTimings([]);
    setVersesMap({});

    try {
      const API_BASE = process.env.REACT_APP_QURAN_API || 'https://api.quran.com/api/v4';
      
      // 1. Fetch Timings
      const timingData = await fetchWithRetry(`${API_BASE}/chapter_recitations/${reciterId}/${surah.surah_number}`);
      const audioFile = timingData?.audio_file;
      if (!audioFile) throw new Error("Audio file data missing");
      
      const vTimings = Array.isArray(audioFile.verse_timings) ? audioFile.verse_timings : [];
      setTimings(vTimings);

      // 2. Fetch Verses & Translation (ID 131 is Saheeh International)
      const verseData = await fetchWithRetry(`${API_BASE}/verses/by_chapter/${surah.surah_number}?translations=131&fields=text_uthmani&language=en`);
      
      const newMap = {};
      const versesArray = verseData?.verses || [];
      
      versesArray.forEach(v => {
        if (!v || !v.verse_key) return;
        
        let enText = '';
        const translations = v.translations;
        if (Array.isArray(translations)) {
            const first = translations.at(0);
            if (first && typeof first === 'object') {
                enText = first.text || '';
            }
        }

        newMap[v.verse_key] = {
          ar: v.text_uthmani || v.text_imlaei || '',
          en: enText
        };
      });
      setVersesMap(newMap);

      // 3. Play
      audioRef.current.src = String(audioFile.audio_url);
      audioRef.current.load();
      
      

      await audioRef.current.play();
      setIsPlaying(true);
    } catch (error) {
      console.error("!!! ATOMIC SYNC ERROR !!!:", error);
      setIsPlaying(false);
    } finally {
      setIsLoading(false);
    }
  };

  const resetAudio = () => {
    if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
    }
    setCurrentSurah(null);
    setIsPlaying(false);
    setCurrentVerse(null);
    setTimings([]);
    setVersesMap({});
  };

  // Instant Reciter Switching
  useEffect(() => {
    if (currentSurah && (isPlaying || isLoading)) {
        playSurah(currentSurah, true);
    }
  }, [reciterId]);

  useEffect(() => {
    const audio = audioRef.current;
    const handleTimeUpdate = () => {
      const timeMs = (audio.currentTime || 0) * 1000;
      setCurrentTime(audio.currentTime || 0);

      if (Array.isArray(timings) && timings.length > 0) {
        const found = timings.find(t => timeMs >= t.timestamp_from && timeMs < t.timestamp_to);
        if (found && versesMap[found.verse_key]) {
          const vData = versesMap[found.verse_key];
          if (currentVerse?.key !== found.verse_key) {
            setCurrentVerse({ key: String(found.verse_key), ...vData });
          }
        }
      }
    };

    const handleLoadedMetadata = () => setDuration(audio.duration || 0);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [timings, versesMap, currentVerse]);

  const cleanText = (html) => {
    if (!html || typeof html !== 'string') return '';
    return html.replace(/<[^>]*>?/gm, '');
  };

  const val = {
    currentSurah,
    reciterId,
    setReciterId,
    isPlaying,
    setIsPlaying,
    isLoading,
    currentTime,
    duration,
    resetAudio,
    playSurah: playSurah,
    triggerGlobalAudio: playSurah, 
    audioRef
  };

  window._SYNC_LOADED = "ATOMIC_V11";

  return <AudioContext.Provider value={val}>{children}</AudioContext.Provider>;
};

export const useAudio = () => useContext(AudioContext);
