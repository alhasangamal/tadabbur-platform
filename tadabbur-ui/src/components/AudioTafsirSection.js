import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Loader2, Play, Pause, AlertCircle, Volume2, BookOpen, Music, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AudioTafsirSection({ initialSuraId = null }) {
  const [tafasirList, setTafasirList] = useState([]);
  const [selectedTafsirId, setSelectedTafsirId] = useState('');
  
  const [audioList, setAudioList] = useState([]);
  const [selectedAudio, setSelectedAudio] = useState(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  // 1. Fetch Tafasir List
  useEffect(() => {
    const fetchTafasir = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const res = await axios.get('https://mp3quran.net/api/v3/tafasir?language=ar');
        if (res.data && res.data.tafasir) {
          setTafasirList(res.data.tafasir);
          if (res.data.tafasir.length > 0) {
             setSelectedTafsirId(res.data.tafasir[0].id.toString());
          }
        }
      } catch (err) {
        setError('حدث خطأ أثناء جلب قائمة التفاسير. يرجى المحاولة لاحقاً.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchTafasir();
  }, []);

  // 2. Fetch Audios when Tafsir is selected
  useEffect(() => {
    if (!selectedTafsirId) return;

    const fetchAudios = async () => {
      try {
        setIsLoading(true);
        setError(null);
        setAudioList([]);
        setSelectedAudio(null);
        if (audioRef.current) {
          audioRef.current.pause();
          setIsPlaying(false);
        }

        let url = `https://www.mp3quran.net/api/v3/tafsir?tafsir=${selectedTafsirId}&language=ar`;
        if (initialSuraId) {
          url = `https://www.mp3quran.net/api/v3/tafsir?tafsir=${selectedTafsirId}&sura=${initialSuraId}&language=ar`;
        }

        const res = await axios.get(url);
        
        if (res.data && res.data.tafasir && res.data.tafasir.soar) {
          let available = [];
          const soarData = res.data.tafasir.soar;
          
          if (Array.isArray(soarData)) {
            available = soarData;
          } else if (typeof soarData === 'object') {
            const key = initialSuraId ? initialSuraId.toString() : null;
            if (key && soarData[key]) {
              available = soarData[key];
            } else {
              Object.values(soarData).forEach(arr => {
                if (Array.isArray(arr)) {
                  available = available.concat(arr);
                }
              });
            }
          }

          if (available.length > 0) {
            setAudioList(available);
            setSelectedAudio(available[0]);
          } else {
            setError(initialSuraId ? 'هذه السورة غير متاحة لهذا التفسير.' : 'لا توجد تلاوات متاحة لهذا التفسير.');
          }
        } else {
            setError(initialSuraId ? 'هذه السورة غير متاحة لهذا التفسير.' : 'لا توجد تلاوات متاحة لهذا التفسير.');
        }
      } catch (err) {
        setError('حدث خطأ أثناء جلب الملفات الصوتية. يرجى التأكد من الاتصال بالإنترنت.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAudios();
  }, [selectedTafsirId, initialSuraId]);

  const togglePlay = () => {
    if (audioRef.current && selectedAudio) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  const handleAudioSelect = (e) => {
    const audioId = parseInt(e.target.value);
    const audio = audioList.find(a => a.id === audioId);
    if (audio) {
      setSelectedAudio(audio);
      setIsPlaying(false);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    }
  };

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-[2rem] p-6 md:p-8 shadow-xl border border-gray-100 dark:border-gray-700 relative overflow-hidden" dir="rtl">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-gold-500/5 rounded-full blur-2xl -z-10 pointer-events-none" />

      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <Volume2 className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            التفسير الصوتي
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            استمع لتفسير الآيات والسور مباشرة
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Tafsir Selection */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            اختر التفسير
          </label>
          <div className="relative">
            <select
              value={selectedTafsirId}
              onChange={(e) => setSelectedTafsirId(e.target.value)}
              disabled={isLoading || tafasirList.length === 0}
              className="w-full appearance-none bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-base rounded-xl py-3 px-4 pr-10 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all disabled:opacity-50"
            >
              {tafasirList.map((tafsir) => (
                <option key={tafsir.id} value={tafsir.id}>
                  {tafsir.name}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
              <ChevronDown className="w-5 h-5 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Surah / Audio Part Selection */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <Music className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            اختر السورة / المقطع
          </label>
          <div className="relative">
            <select
              value={selectedAudio ? selectedAudio.id : ''}
              onChange={handleAudioSelect}
              disabled={isLoading || audioList.length === 0}
              className="w-full appearance-none bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-base rounded-xl py-3 px-4 pr-10 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all disabled:opacity-50"
            >
              {audioList.map((audio) => (
                <option key={audio.id} value={audio.id}>
                  {audio.name}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
              <ChevronDown className="w-5 h-5 text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <AnimatePresence mode="wait">
        {isLoading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center justify-center gap-3 py-8 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800"
          >
            <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
            <span className="text-gray-600 dark:text-gray-300 font-medium">جاري تحميل البيانات...</span>
          </motion.div>
        )}

        {!isLoading && error && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-2xl border border-red-100 dark:border-red-900/30"
          >
            <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
            <p className="font-medium">{error}</p>
          </motion.div>
        )}

        {!isLoading && !error && selectedAudio && (
          <motion.div
            key="player"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-gradient-to-r from-emerald-900 to-teal-900 rounded-2xl p-6 shadow-xl relative overflow-hidden"
          >
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\' fill-rule=\'evenodd\'%3E%3Ccircle cx=\'3\' cy=\'3\' r=\'3\'/%3E%3Ccircle cx=\'13\' cy=\'13\' r=\'3\'/%3E%3C/g%3E%3C/svg%3E")' }}></div>
            
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
              <button
                onClick={togglePlay}
                className="w-16 h-16 shrink-0 rounded-full bg-gold-400 hover:bg-gold-500 text-black flex items-center justify-center transition-transform hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(250,204,21,0.3)]"
              >
                {isPlaying ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-1" />}
              </button>

              <div className="flex-1 text-center md:text-right">
                <h3 className="text-white font-bold text-lg mb-1">{selectedAudio.name}</h3>
                <p className="text-emerald-200/80 text-sm">
                  {tafasirList.find(t => t.id.toString() === selectedTafsirId)?.name}
                </p>
                
                {/* Native audio element hidden, we use standard controls just in case, but we hide it and use our play button, or we can just show the native controls! Showing native controls is often better for seeking, volume, etc. */}
                <audio
                  ref={audioRef}
                  src={selectedAudio.url}
                  onEnded={handleAudioEnded}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  className="w-full mt-4 h-10 outline-none"
                  controls
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
