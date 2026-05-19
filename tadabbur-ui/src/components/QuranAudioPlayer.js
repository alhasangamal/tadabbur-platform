import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Play, Pause, Loader2, AlertCircle, Volume2, X, Minimize2 } from "lucide-react";

const API_URL = "https://www.mp3quran.net/api/v3/reciters?language=ar";

const REQUIRED_RECITERS = [
  "عبد الرحمن السديس",
  "سعود الشريم",
  "ماهر المعيقلي",
  "ياسر الدوسري",
  "عبد الباسط عبد الصمد",
  "محمد صديق المنشاوي",
  "محمود خليل الحصري",
  "أبو بكر الشاطري",
  "ناصر القطامي",
  "إسلام صبحي",
  "وديع اليمني",
  "فارس عباد",
  "القارئ ياسين",
  "إبراهيم الأخضر",
  "مشاري العفاسي",
  "نورين محمد صديق",
  "عبدالرشيد صوفي",
  "بدر التركي"
];

const REQUIRED_RIWAYAT = [
  "حفص عن عاصم",
  "ورش عن نافع",
  "قالون عن نافع",
  "الدوري عن أبي عمرو",
  "السوسي عن أبي عمرو",
];

const RECITER_SPECIFIC_RIWAYAT = {
  "محمود خليل الحصري": ["حفص عن عاصم", "ورش عن نافع", "قالون عن نافع", "الدوري عن أبي عمرو"],
  "القارئ ياسين": ["ورش عن نافع"],
  "إبراهيم الأخضر": ["حفص عن عاصم"],
  "أبو بكر الشاطري": ["حفص عن عاصم"],
};

function buildAudioUrl(server, surahNumber) {
  return `${server}${String(surahNumber).padStart(3, "0")}.mp3`;
}

export default function QuranAudioPlayer({ surahNumber, surahName, onClose, onMinimize }) {
  const [reciters, setReciters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedRiwayah, setSelectedRiwayah] = useState("حفص عن عاصم");
  const [selectedReciterId, setSelectedReciterId] = useState("");

  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    const fetchReciters = async () => {
      try {
        setLoading(true);
        const response = await axios.get(API_URL);
        const allReciters = response.data.reciters;

        const filteredReciters = allReciters
          .filter((reciter) => REQUIRED_RECITERS.some(req => reciter.name.includes(req)))
          .map((reciter) => {
            const reciterName = REQUIRED_RECITERS.find(req => reciter.name.includes(req)) || reciter.name;
            const displayName = reciterName === "القارئ ياسين" ? "ياسين الجزائري" : reciterName;
            
            const filteredMoshaf = reciter.moshaf.filter((m) => {
              const isRequiredRiwayah = REQUIRED_RIWAYAT.some(req => m.name.includes(req));
              const specificRestrictions = RECITER_SPECIFIC_RIWAYAT[reciterName];
              
              if (specificRestrictions) {
                return specificRestrictions.some(req => m.name.includes(req));
              }
              return isRequiredRiwayah;
            });

            return {
              ...reciter,
              cleanName: displayName,
              moshaf: filteredMoshaf,
            };
          })
          .filter((reciter) => reciter.moshaf.length > 0);

        setReciters(filteredReciters);
      } catch (err) {
        console.error("Error fetching MP3Quran API", err);
        setError("تعذر جلب بيانات القرّاء. يرجى المحاولة لاحقاً.");
      } finally {
        setLoading(false);
      }
    };

    fetchReciters();
  }, []);

  const availableReciters = reciters.filter(r => 
    r.moshaf.some(m => m.name.includes(selectedRiwayah))
  );

  useEffect(() => {
    if (availableReciters.length > 0) {
      const isCurrentReciterValid = availableReciters.some(r => r.id.toString() === selectedReciterId);
      if (!isCurrentReciterValid) {
        setSelectedReciterId(availableReciters[0].id.toString());
      }
    }
  }, [selectedRiwayah, availableReciters, selectedReciterId]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, [selectedReciterId, selectedRiwayah, surahNumber]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(e => console.error("Error playing audio", e));
    }
    setIsPlaying(!isPlaying);
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  const selectedReciter = reciters.find((r) => r.id.toString() === selectedReciterId);
  const selectedMoshaf = selectedReciter?.moshaf.find((m) => m.name.includes(selectedRiwayah));

  const surahList = selectedMoshaf?.surah_list.split(",") || [];
  const isSurahAvailable = surahList.includes(surahNumber.toString());

  const currentAudioUrl = selectedMoshaf && isSurahAvailable
    ? buildAudioUrl(selectedMoshaf.server, surahNumber)
    : "";

  if (loading) {
    return (
      <div className="w-full bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center min-h-[200px]" dir="rtl">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mb-4" />
        <p className="text-gray-500 font-medium">جاري جلب القراء والروايات...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full bg-red-50 dark:bg-red-900/20 rounded-2xl p-6 border border-red-200 dark:border-red-800 flex items-center gap-3 text-red-600 dark:text-red-400 relative" dir="rtl">
        {onClose && (
          <button onClick={onClose} className="absolute top-4 left-4 text-gray-400 hover:text-red-500">
            <X className="w-5 h-5" />
          </button>
        )}
        <AlertCircle className="w-6 h-6" />
        <p className="font-medium">{error}</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 shadow-lg border border-emerald-100 dark:border-gray-700 relative overflow-hidden" dir="rtl">
      {/* Decorative background element */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-br-[100px] pointer-events-none" />

      <div className="flex items-center justify-between mb-6 border-b border-emerald-200 dark:border-gray-700 pb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-md">
            <Volume2 className="w-5 h-5" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-white">تلاوة سورة {surahName}</h3>
        </div>
        <div className="flex items-center gap-2">
          {onMinimize && (
            <button onClick={onMinimize} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-emerald-100 hover:text-emerald-600 dark:hover:bg-emerald-900/40 text-gray-500 transition-colors" title="تصغير">
              <Minimize2 className="w-4 h-4" />
            </button>
          )}
          {onClose && (
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/40 text-gray-500 transition-colors" title="إغلاق">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 relative z-10">
        {/* Dropdown الروايات */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-gray-700 dark:text-gray-300">الرواية</label>
          <select
            value={selectedRiwayah}
            onChange={(e) => setSelectedRiwayah(e.target.value)}
            className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-xl focus:ring-emerald-500 focus:border-emerald-500 block w-full p-3 font-medium transition-colors cursor-pointer shadow-sm"
          >
            {REQUIRED_RIWAYAT.map((riwayah) => (
              <option key={riwayah} value={riwayah}>{riwayah}</option>
            ))}
          </select>
        </div>

        {/* Dropdown القراء */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-gray-700 dark:text-gray-300">القارئ المتاح</label>
          <select
            value={selectedReciterId}
            onChange={(e) => setSelectedReciterId(e.target.value)}
            disabled={availableReciters.length === 0}
            className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-xl focus:ring-emerald-500 focus:border-emerald-500 block w-full p-3 font-medium transition-colors cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {availableReciters.length === 0 ? (
              <option value="">لا يوجد قراء لهذه الرواية</option>
            ) : (
              availableReciters.map((r) => (
                <option key={r.id} value={r.id}>{r.cleanName}</option>
              ))
            )}
          </select>
        </div>
      </div>

      {/* مشغل الصوت */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-emerald-100 dark:border-gray-700 flex flex-col items-center shadow-sm relative z-10">
        {!isSurahAvailable ? (
          <div className="text-amber-600 dark:text-amber-400 font-medium py-3 text-center w-full bg-amber-50 dark:bg-amber-900/20 rounded-lg">
            عذراً، تلاوة هذه السورة غير متوفرة لهذا القارئ بالرواية المحددة.
          </div>
        ) : (
          <div className="w-full flex flex-col md:flex-row items-center gap-4">
            <button
              onClick={togglePlay}
              className={`flex-shrink-0 w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                isPlaying 
                  ? "bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/30" 
                  : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/30"
              }`}
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
            </button>
            
            <div className="flex-1 w-full flex flex-col text-center md:text-right">
              <span className="font-bold text-gray-800 dark:text-gray-200">
                سورة {surahName}
              </span>
              <span className="text-sm text-emerald-600 dark:text-emerald-400 font-medium mt-1">
                {selectedReciter?.cleanName} • {selectedRiwayah}
              </span>
            </div>

            {/* Native Audio Element */}
            <audio
              ref={audioRef}
              src={currentAudioUrl}
              onEnded={handleAudioEnded}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              controls
              className="w-full md:w-auto h-10 mt-3 md:mt-0"
              controlsList="nodownload"
            />
          </div>
        )}
      </div>
    </div>
  );
}
