import React, { useState } from 'react';
import { useAudio, RECITERS } from '../../context/AudioContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, X } from 'lucide-react';

const AudioPlayer = () => {
    const { 
        currentSurah, 
        isPlaying, 
        setIsPlaying, 
        isLoading, 
        currentTime, 
        duration, 
        audioRef, 
        reciterId, 
        setReciterId,
        resetAudio
    } = useAudio();

    const [isMuted, setIsMuted] = useState(false);
    const [volume, setVolume] = useState(1);

    if (!currentSurah && !isLoading) return null;

    const formatTime = (time) => {
        if (isNaN(time)) return "00:00";
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    const handleSeek = (e) => {
        const time = parseFloat(e.target.value);
        audioRef.current.currentTime = time;
    };

    const togglePlay = () => {
        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            audioRef.current.play();
            setIsPlaying(true);
        }
    };

    const toggleMute = () => {
        setIsMuted(!isMuted);
        audioRef.current.muted = !isMuted;
    };

    return (
        <motion.div 
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4"
        >
            <div className="max-w-6xl mx-auto bg-black/60 backdrop-blur-2xl border border-white/10 rounded-3xl p-4 md:p-6 shadow-2xl overflow-hidden relative">
                {/* Background Glow */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[100px] -z-10"></div>
                
                <div className="flex flex-col md:flex-row items-center gap-6">
                    
                    {/* Surah Info & Play/Pause */}
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <button 
                            onClick={togglePlay}
                            disabled={isLoading}
                            className="w-14 h-14 bg-emerald-500 hover:bg-emerald-400 text-black rounded-full flex items-center justify-center transition-all shadow-lg active:scale-90"
                        >
                            {isLoading ? (
                                <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                            ) : isPlaying ? (
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6V4zm8 0h4v16h4V4z"/></svg>
                            ) : (
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                            )}
                        </button>
                        
                        <div className="hidden sm:block">
                            <h4 className="text-white font-bold text-lg">{currentSurah?.surah_name_ar}</h4>
                            <p className="text-white/50 text-xs">{currentSurah?.surah_name_en}</p>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="flex-1 w-full">
                        <div className="flex justify-between text-[10px] text-white/40 mb-2 uppercase tracking-widest font-bold">
                            <span>{formatTime(currentTime)}</span>
                            <span>{formatTime(duration)}</span>
                        </div>
                        <input 
                            type="range"
                            min="0"
                            max={duration || 100}
                            step="0.1"
                            value={currentTime}
                            onChange={handleSeek}
                            className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-500 hover:accent-emerald-400 transition-all"
                        />
                    </div>

                    {/* Reciter & Volume */}
                    <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                        <div className="relative group">
                            <select 
                                value={reciterId}
                                onChange={(e) => setReciterId(parseInt(e.target.value))}
                                className="bg-emerald-950/80 border-2 border-emerald-500/30 text-emerald-50 text-xs md:text-sm rounded-xl px-4 py-3 outline-none focus:border-emerald-400 transition-all font-bold cursor-pointer appearance-none pr-10 shadow-inner"
                                style={{ minWidth: '180px' }}
                            >
                                {RECITERS.map(r => (
                                    <option key={r.id} value={r.id} className="bg-emerald-900 text-white py-2">
                                        {r.name}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400 pointer-events-none group-hover:scale-110 transition-transform" />
                        </div>

                        <div className="flex items-center gap-3">
                            <button onClick={toggleMute} className="text-white/60 hover:text-white transition-colors">
                                {isMuted ? (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
                                )}
                            </button>
                            <button onClick={resetAudio} className="text-white/60 hover:text-red-400 transition-colors ml-2" title="إغلاق المشغل">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default AudioPlayer;
