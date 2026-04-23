import React, { useState, useRef, useEffect } from 'react';
import { Book } from 'lucide-react';

const SplashScreen = ({ onComplete }) => {
  const [phase, setPhase] = useState('initial'); // 'initial', 'playing', 'fading'
  const fallbackTimeoutRef = useRef(null);
  const audioInstanceRef = useRef(null);

  const exitSplash = () => {
    if (fallbackTimeoutRef.current) clearTimeout(fallbackTimeoutRef.current);
    if (audioInstanceRef.current) {
        audioInstanceRef.current.pause();
    }
    setPhase(prev => {
      if (prev === 'fading') return prev;
      setTimeout(() => {
        onComplete();
      }, 1000); // fade out duration
      return 'fading';
    });
  };

  const handleEnterClick = () => {
    setPhase('playing');
    
    const audioPath = process.env.PUBLIC_URL + '/assets/audio/sad_29_massad.mp3';
    console.log("Attempting to play:", audioPath);
    const audio = new Audio(audioPath);
    audioInstanceRef.current = audio;
    audio.volume = 0.8;
    audio.onended = () => {
        console.log("Audio playback finished");
        exitSplash();
    };

    audio.play().then(() => {
        console.log("Audio is playing successfully");
    }).catch(e => {
        console.error("Audio play failed:", e);
        setTimeout(exitSplash, 3000);
    });

    // Maximum safety fallback
    fallbackTimeoutRef.current = setTimeout(exitSplash, 25000);
  };

  // cleanup on unmount
  useEffect(() => {
    return () => {
      if (fallbackTimeoutRef.current) clearTimeout(fallbackTimeoutRef.current);
      if (audioInstanceRef.current) {
          audioInstanceRef.current.pause();
          audioInstanceRef.current.src = "";
      }
    }
  }, []);

  return (
    <div className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gray-900 transition-opacity duration-1000 ${phase === 'fading' ? 'opacity-0 pointer-events-none' : 'opacity-100'}`} dir="rtl">
      
      {/* Background aesthetics */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] opacity-10 mix-blend-overlay"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-600 rounded-full blur-[120px] opacity-20 animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gold-500 rounded-full blur-[100px] opacity-10"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center text-center max-w-2xl px-6">
        
        {/* Logo/Icon */}
        <div className={`transition-all duration-1000 ${phase === 'playing' ? 'scale-110 mb-8' : 'scale-100 mb-6'}`}>
          <div className="p-4 bg-gradient-to-br from-emerald-700 to-emerald-950 rounded-2xl shadow-2xl border border-emerald-500/30">
            <Book className="w-12 h-12 text-gold-400" />
          </div>
        </div>

        {/* Title */}
        <h1 className={`font-serif text-4xl md:text-5xl font-bold mb-6 transition-all duration-1000 ${phase === 'playing' ? 'text-gold-400' : 'text-white'}`}>
          مِنَصَّة تَدَبُّـر الْقُرْآن
        </h1>

        {/* Dynamic Content */}
        {phase === 'initial' ? (
          <div className="animate-fade-in-up mt-8">
            <button 
              onClick={handleEnterClick}
              className="group relative px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full font-bold text-lg shadow-lg shadow-emerald-900/50 transition-all hover:scale-105 active:scale-95 flex items-center gap-3 overflow-hidden"
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
              <span className="font-serif text-xl tracking-wide">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيم - تجربة المنصة</span>
            </button>
            <p className="mt-6 text-gray-400 text-sm">التجربة مدعومة بالتلاوة الصوتية</p>
          </div>
        ) : (
          <div className="mt-8 animate-fade-in flex flex-col items-center">
            {/* The Verse Typography */}
            <p className="font-serif text-emerald-100 text-2xl md:text-3xl leading-relaxed mb-8 font-medium">
              "كِتَابٌ أَنزَلْنَاهُ إِلَيْكَ مُبَارَكٌ لِّيَدَّبَّرُوا آيَاتِهِ<br className="md:hidden" /> وَلِيَتَذَكَّرَ أُولُو الْأَلْبَابِ"
            </p>
            
            {/* Elegant loading indicator */}
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-gold-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-gold-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-gold-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SplashScreen;
