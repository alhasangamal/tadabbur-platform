import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Book, Sparkles, History, ScrollText, X, Command, Scale, MessageSquare, Binary, Hash, ArrowLeftRight, Copy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuranData } from '../../context/QuranDataContext';
import duasData from '../../data/duas_data.json';
import cosmicData from '../../data/cosmic_data.json';
import asbabData from '../../data/asbab_data.json';
import asmaData from '../../data/asma_data.json';
import ahkamData from '../../data/ahkam_data.json';
import amthalData from '../../data/amthal_data.json';
import aqsamData from '../../data/aqsam_data.json';
import arqamData from '../../data/arqam_data.json';
import charactersData from '../../data/characters_data.json';
import contrastsData from '../../data/contrasts_data.json';
import dialoguesData from '../../data/dialogues_data.json';
import mutashData from '../../data/mutash_data.json';
import nasikhData from '../../data/nasikh_data.json';
import storiesData from '../../data/stories_data.json';
import tashriaatData from '../../data/tashriaat_data.json';
import endingsData from '../../data/quran_endings.json';

const CommandPalette = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();
  const { surahs } = useQuranData();

  const allData = useMemo(() => {
    const items = [];
    
    // 1. Surahs
    if (surahs) {
      Object.entries(surahs).forEach(([id, s]) => {
        items.push({
          id: `surah-${id}`,
          title: s.name_ar,
          subtitle: `سورة رقم ${id}`,
          content: `${s.name_ar} ${s.name_en} سورة مكة مدنية`,
          type: 'سورة',
          icon: <Book className="w-4 h-4" />,
          link: `/surahs/${id}`,
          color: 'emerald'
        });
      });
    }

    // 2. Duas
    duasData.forEach((d, i) => {
      items.push({
        id: `dua-${i}`,
        title: d.الدعاء,
        subtitle: d.السورة,
        content: d.النص,
        type: 'دعاء',
        icon: <Sparkles className="w-4 h-4 text-emerald-500" />,
        link: '/duas',
        color: 'emerald'
      });
    });

    // 3. Cosmic
    cosmicData.forEach((c, i) => {
      items.push({
        id: `cosmic-${i}`,
        title: c.الآية,
        subtitle: c.السورة,
        content: c.النص,
        type: 'آية كونية',
        icon: <Sparkles className="w-4 h-4 text-gold-500" />,
        link: '/cosmic',
        color: 'gold'
      });
    });

    // 4. Asbab
    asbabData.forEach((a, i) => {
      items.push({
        id: `asbab-${i}`,
        title: a.العنوان,
        subtitle: a.السورة,
        content: a.سبب_النزول,
        type: 'سبب نزول',
        icon: <History className="w-4 h-4 text-emerald-500" />,
        link: '/asbab',
        color: 'emerald'
      });
    });

    // 5. Asma Allah
    asmaData.forEach((a, i) => {
      items.push({
        id: `asma-${i}`,
        title: a.الاسم_عربي,
        subtitle: 'من أسماء الله الحسنى',
        content: a.المعنى,
        type: 'أسماء الله الحسنى',
        icon: <Sparkles className="w-4 h-4 text-gold-600" />,
        link: '/asma',
        color: 'gold'
      });
    });

    // 6. Characters
    charactersData.forEach((c, i) => {
      items.push({
        id: `char-${i}`,
        title: c.الاسم_عربي,
        subtitle: c.نوع_الشخصية,
        content: Array.isArray(c.الخصائص) ? c.الخصائص.join(' ') : '',
        type: 'شخصية قرآنية',
        icon: <ScrollText className="w-4 h-4 text-blue-500" />,
        link: '/characters',
        color: 'blue'
      });
    });

    // 7. Stories
    storiesData.forEach((s, i) => {
      items.push({
        id: `story-${i}`,
        title: s.اسم_صاحب_القصة,
        subtitle: 'قصص القرآن',
        content: s.شرح_مبسط,
        type: 'قصة قرآنية',
        icon: <Book className="w-4 h-4 text-blue-600" />,
        link: '/stories',
        color: 'blue'
      });
    });

    // 8. Ahkam
    ahkamData.forEach((a, i) => {
      items.push({
        id: `ahkam-${i}`,
        title: a.short_text,
        subtitle: `${a.surah_name} - آية ${a.ayah_number}`,
        content: a.explanation,
        type: 'حكم شرعي',
        icon: <History className="w-4 h-4 text-purple-500" />,
        link: '/ahkam',
        color: 'purple'
      });
    });

    // 9. Amthal
    amthalData.forEach((a, i) => {
      items.push({
        id: `amthal-${i}`,
        title: a.title,
        subtitle: a.surah,
        content: a.explanation,
        type: 'مثل قرآني',
        icon: <Sparkles className="w-4 h-4 text-amber-500" />,
        link: '/amthal',
        color: 'amber'
      });
    });

    // 10. Dialogues
    dialoguesData.forEach((d, i) => {
      items.push({
        id: `dialogue-${i}`,
        title: d.العنوان,
        subtitle: d.الأطراف,
        content: d.النص,
        type: 'حوار قرآني',
        icon: <MessageSquare className="w-4 h-4 text-indigo-500" />,
        link: '/dialogues',
        color: 'indigo'
      });
    });

    // 11. Tashriaat
    tashriaatData.forEach((t, i) => {
      items.push({
        id: `tashriaat-${i}`,
        title: t.العنوان,
        subtitle: t.المجال,
        content: t.الآيات,
        type: 'تشريع قرآني',
        icon: <Scale className="w-4 h-4 text-emerald-600" />,
        link: '/tashriaat',
        color: 'emerald'
      });
    });

    // 12. Mutashabih (Similarities)
    mutashData.forEach((m, i) => {
      items.push({
        id: `mutash-${i}`,
        title: m.الآية,
        subtitle: m.السورة,
        content: m.الملاحظة_البلاغية || m.التوجيه_البلاغي,
        type: 'متشابه لفظي',
        icon: <Copy className="w-4 h-4 text-cyan-500" />,
        link: '/mutash',
        color: 'cyan'
      });
    });

    // 13. Contrasts (Dualities)
    contrastsData.forEach((c, i) => {
      items.push({
        id: `contrast-${i}`,
        title: `${c.الكلمة_1} مقابل ${c.الكلمة_2}`,
        subtitle: 'ثنائيات قرآنية',
        content: c.الدلالة_البلاغية,
        type: 'ثنائية قرآنية',
        icon: <ArrowLeftRight className="w-4 h-4 text-orange-500" />,
        link: '/contrasts',
        color: 'orange'
       });
    });

    // 14. Nasikh (Abrogation)
    nasikhData.forEach((n, i) => {
      items.push({
        id: `nasikh-${i}`,
        title: n.الآية_المنسوخة,
        subtitle: n.السورة,
        content: n.الحكم,
        type: 'ناسخ ومنسوخ',
        icon: <ArrowLeftRight className="w-4 h-4 text-red-500" />,
        link: '/nasikh',
        color: 'red'
      });
    });

    // 15. Endings
    endingsData.forEach((e, i) => {
      items.push({
        id: `ending-${i}`,
        title: `خاتمة: ${e.الآية}`,
        subtitle: e.السورة,
        content: e.التناسب_البلاغي,
        type: 'فواصل قرآنية',
        icon: <Hash className="w-4 h-4 text-slate-500" />,
        link: '/endings',
        color: 'slate'
      });
    });

    // 16. Aqsam (Oaths)
    aqsamData.forEach((a, i) => {
      items.push({
        id: `aqsam-${i}`,
        title: a.موضوع_القسم,
        subtitle: a.السورة,
        content: a.جواب_القسم,
        type: 'قسم قرآني',
        icon: <ScrollText className="w-4 h-4 text-lime-600" />,
        link: '/aqsam',
        color: 'lime'
      });
    });

    // 17. Arqam (Numbers)
    arqamData.forEach((a, i) => {
      items.push({
        id: `arqam-${i}`,
        title: `العدد ${a.العدد}`,
        subtitle: a.المعدود,
        content: a.الآية,
        type: 'رقم قرآني',
        icon: <Binary className="w-4 h-4 text-violet-500" />,
        link: '/arqam',
        color: 'violet'
      });
    });

    return items;
  }, [surahs]);

  const filteredItems = useMemo(() => {
    if (!query) return [];
    
    const lowerQuery = query.toLowerCase();
    
    return allData
      .map(item => {
        let score = 0;
        const title = (item.title || '').toLowerCase();
        const subtitle = (item.subtitle || '').toLowerCase();
        const content = (item.content || '').toLowerCase();

        if (title === lowerQuery) score += 100;
        else if (title.startsWith(lowerQuery)) score += 50;
        else if (title.includes(lowerQuery)) score += 20;
        
        if (subtitle.includes(lowerQuery)) score += 10;
        if (content.includes(lowerQuery)) score += 5;

        return { ...item, score };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
  }, [allData, query]);

  const toggle = useCallback(() => {
    setIsOpen(prev => !prev);
    setSelectedIndex(0);
    setQuery('');
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        toggle();
      }
      
      if (!isOpen) return;

      if (e.key === 'Escape') setIsOpen(false);
      
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % filteredItems.length);
      }
      
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredItems.length) % filteredItems.length);
      }
      
      if (e.key === 'Enter' && filteredItems[selectedIndex]) {
        e.preventDefault();
        handleSelect(filteredItems[selectedIndex]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggle, isOpen, filteredItems, selectedIndex]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleSelect = (item) => {
    navigate(item.link);
    setIsOpen(false);
    setQuery('');
  };

  return (
    <>
      {/* Trigger Button (Floating or in Header) */}
      <button 
        onClick={toggle}
        className="fixed bottom-24 right-8 z-[60] p-4 bg-emerald-600 text-white rounded-full shadow-2xl hover:scale-110 transition-all flex items-center gap-2 group"
      >
        <Command className="w-6 h-6" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 whitespace-nowrap font-bold">بحث شامل (Cmd+K)</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-emerald-950/40 backdrop-blur-md"
              onClick={() => setIsOpen(false)}
            />
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: -20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: -20 }}
              className="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-3xl shadow-full overflow-hidden border border-emerald-100 dark:border-gray-800"
            >
              <div className="p-6 border-b border-emerald-50 dark:border-gray-800 flex items-center gap-4">
                <Search className="w-6 h-6 text-emerald-500" />
                <input 
                  autoFocus
                  type="text"
                  placeholder="ابحث في السور، الأدعية، الآيات الكونية، أو أسباب النزول..."
                  className="flex-1 bg-transparent border-none outline-none text-xl text-emerald-950 dark:text-white placeholder:text-emerald-200"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <div className="flex items-center gap-1 px-2 py-1 bg-emerald-50 dark:bg-gray-800 rounded text-[10px] text-emerald-400 font-mono">
                  ESC
                </div>
              </div>

              <div className="max-h-[60vh] overflow-y-auto p-4 custom-scrollbar">
                {filteredItems.length > 0 ? (
                  <div className="space-y-2">
                    {filteredItems.map((item, idx) => (
                      <button
                        key={item.id}
                        onClick={() => handleSelect(item)}
                        className={`w-full text-right p-4 rounded-2xl flex items-center justify-between group transition-all ${
                          selectedIndex === idx ? 'bg-emerald-50 dark:bg-emerald-900/30' : 'hover:bg-emerald-50/50 dark:hover:bg-gray-800/50'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                            {item.icon}
                          </div>
                          <div className="text-right flex-1 min-w-0">
                            <div className="font-bold text-emerald-950 dark:text-white truncate">{item.title}</div>
                            <div className="text-xs text-emerald-400 truncate">{item.subtitle}</div>
                            {query && item.content && item.content.toLowerCase().includes(query.toLowerCase()) && !item.title.toLowerCase().includes(query.toLowerCase()) && (
                              <div className="text-[10px] text-gray-400 mt-1 line-clamp-1 italic">
                                ...{item.content.substring(item.content.toLowerCase().indexOf(query.toLowerCase()) - 20, item.content.toLowerCase().indexOf(query.toLowerCase()) + 60)}...
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                          {item.type}
                        </div>
                      </button>
                    ))}
                  </div>
                ) : query ? (
                  <div className="py-20 text-center text-emerald-200">
                    <X className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p>لم يتم العثور على نتائج لـ "{query}"</p>
                  </div>
                ) : (
                  <div className="py-12 text-center text-emerald-300">
                    <Command className="w-12 h-12 mx-auto mb-4 opacity-10" />
                    <p className="font-serif">ابدأ الكتابة للبحث في كنوز القرآن...</p>
                  </div>
                )}
              </div>

              <div className="p-4 bg-emerald-50/50 dark:bg-gray-800/50 flex justify-between items-center border-t border-emerald-50 dark:border-gray-800">
                <div className="flex gap-4 text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                  <span className="flex items-center gap-1">ENTER للإختيار</span>
                  <span className="flex items-center gap-1">ESC للإغلاق</span>
                </div>
                <div className="text-emerald-600 font-serif text-sm">تدبّر القرآن</div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default CommandPalette;
