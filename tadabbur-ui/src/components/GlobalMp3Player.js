import React from 'react';
import { useMp3Quran } from '../context/Mp3QuranContext';
import QuranAudioPlayer from './QuranAudioPlayer';
import { motion, AnimatePresence } from 'framer-motion';
import { Headphones, Maximize2, X } from 'lucide-react';

export default function GlobalMp3Player() {
  const { mp3PlayerState, closeMp3Player, toggleMinimizeMp3Player } = useMp3Quran();

  return (
    <>
      {/* Minimized Floating Button */}
      <AnimatePresence>
        {mp3PlayerState.isOpen && mp3PlayerState.isMinimized && (
          <motion.div
            key="minimized"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-6 right-6 z-[100] flex items-center gap-2 pointer-events-auto"
            dir="rtl"
          >
            <button
              onClick={toggleMinimizeMp3Player}
              className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 px-4 py-3 rounded-full flex items-center gap-3 transition-all"
              title="تكبير المشغل"
            >
              <Headphones className="w-5 h-5 animate-pulse" />
              <span className="font-bold text-sm">سورة {mp3PlayerState.surahName}</span>
              <Maximize2 className="w-4 h-4 mr-2" />
            </button>
            <button
              onClick={closeMp3Player}
              className="bg-red-500 hover:bg-red-400 text-white shadow-lg shadow-red-500/30 w-10 h-10 rounded-full flex items-center justify-center transition-all"
              title="إغلاق المشغل"
            >
              <X className="w-5 h-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full Player */}
      <AnimatePresence>
        {mp3PlayerState.isOpen && (
          <motion.div
            key="maximized"
            initial={{ y: 100, opacity: 0 }}
            animate={{ 
              y: mp3PlayerState.isMinimized ? 100 : 0, 
              opacity: mp3PlayerState.isMinimized ? 0 : 1 
            }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className={`fixed bottom-0 left-0 right-0 z-[90] p-4 md:p-6 flex justify-center pointer-events-none`}
          >
            <div 
              className={`w-full max-w-4xl shadow-2xl rounded-2xl overflow-hidden border border-emerald-500/20 pointer-events-auto ${mp3PlayerState.isMinimized ? 'invisible' : 'visible'}`}
            >
              <QuranAudioPlayer 
                surahNumber={mp3PlayerState.surahNumber}
                surahName={mp3PlayerState.surahName}
                onClose={closeMp3Player}
                onMinimize={toggleMinimizeMp3Player}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
