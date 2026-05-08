import React from 'react';
import { useAudio } from '../../context/AudioContext';
import { motion, AnimatePresence } from 'framer-motion';

const VerseSyncDisplay = () => {
  const { currentVerse, isPlaying, currentSurah, isLoading } = useAudio();

  // We show it if audio is playing OR if it's loading (to show a placeholder)
  // or if we have a current verse and audio is just paused.
  const shouldShow = (isPlaying || isLoading || currentVerse) && currentSurah;

  if (!shouldShow || !currentVerse) return null;

  return (
    <div className="fixed bottom-32 left-0 right-0 z-[100] px-4 md:px-8 pointer-events-none">
      <div className="max-w-4xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentVerse.key}
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="bg-black/40 backdrop-blur-2xl border border-white/20 rounded-3xl p-6 md:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] text-center pointer-events-auto relative overflow-hidden"
          >
            {/* Glossy Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none"></div>

            {/* Metadata */}
            <div className="mb-4 flex items-center justify-center gap-3">
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-[10px] font-bold tracking-widest uppercase border border-emerald-500/30">
                {currentSurah?.surah_name_ar || "Surah"}
              </span>
              <span className="text-white/30 text-xs">•</span>
              <span className="text-white/60 text-xs font-medium uppercase tracking-tighter">
                Verse {currentVerse?.key?.split(':')?.at(1) || "?"}
              </span>
            </div>

            {/* Arabic Verse */}
            <div className="text-3xl md:text-5xl text-white mb-6 leading-relaxed font-me-quran drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
              {currentVerse.ar}
            </div>

            {/* English Translation */}
            <div className="text-base md:text-lg text-emerald-50/80 italic font-light max-w-3xl mx-auto leading-relaxed">
              {currentVerse.en}
            </div>

            {/* Subtle glow effect */}
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl opacity-50 -z-10"></div>
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-teal-500/20 rounded-full blur-3xl opacity-50 -z-10"></div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default VerseSyncDisplay;
