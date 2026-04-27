import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toBlob } from 'html-to-image';
import { toast } from 'react-hot-toast';
import { 
  X as CloseIcon, 
  Copy, 
  Check, 
  Send, 
  MessageCircle, 
  Share2,
  BookOpen,
  Globe
} from 'lucide-react';

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
);

const TelegramIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M11.944 0C5.346 0 0 5.346 0 11.944s5.346 11.944 11.944 11.944 11.944-5.346 11.944-11.944S18.542 0 11.944 0zm5.206 8.358l-1.782 8.4c-.134.601-.489.749-1 .46l-2.722-2.006-1.314 1.264c-.145.145-.267.267-.547.267l.195-2.766 5.034-4.546c.219-.195-.048-.304-.339-.11l-6.222 3.918-2.684-.84c-.584-.183-.596-.584.122-.865l10.485-4.041c.485-.176.908.114.769.899z"/></svg>
);

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
);

const XIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932 6.064-6.932zm-1.294 19.486h2.039L6.486 3.24H4.298l13.309 17.398z"/></svg>
);

const ShareModal = ({ isOpen, onClose, data, type = 'dua' }) => {
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const cardRef = useRef(null);

  if (!data) return null;

  const shareText = `${data.الدعاء || data.الآية}\n\n${data.النص}\n\nالمصدر: سورة ${data.السورة}\nمنصة تدبر القرآن: ${window.location.origin}`;
  const shareUrl = window.location.href;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      toast.success("تم نسخ النص بنجاح", { icon: '📋' });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("فشل نسخ النص");
    }
  };

  const handleShareImage = async () => {
    if (!cardRef.current) return;
    
    setIsGenerating(true);
    try {
      const blob = await toBlob(cardRef.current, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: '#fcfaf2'
      });

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [new File([blob], 'tadabbur.png', { type: 'image/png' })] })) {
        await navigator.share({
          files: [new File([blob], 'tadabbur.png', { type: 'image/png' })],
          title: data.الدعاء || data.الآية,
          text: 'تمت المشاركة من منصة تدبّر القرآن'
        });
      } else {
        // Fallback to download
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `tadabbur-${Date.now()}.png`;
        link.click();
        window.URL.revokeObjectURL(url);
        toast.success("تم حفظ الصورة بنجاح", { icon: '🖼️' });
      }
    } catch (error) {
      console.error('Error generating image:', error);
      toast.error("فشل حفظ الصورة");
    } finally {
      setIsGenerating(false);
    }
  };

  const socialPlatforms = [
    {
      name: 'WhatsApp',
      icon: <WhatsAppIcon />,
      color: 'bg-[#25D366]',
      url: `https://wa.me/?text=${encodeURIComponent(shareText)}`
    },
    {
      name: 'Telegram',
      icon: <TelegramIcon />,
      color: 'bg-[#0088cc]',
      url: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`
    },
    {
      name: 'X',
      icon: <XIcon />,
      color: 'bg-[#000000]',
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`
    },
    {
      name: 'Facebook',
      icon: <FacebookIcon />,
      color: 'bg-[#1877F2]',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-6"
        >
          <motion.div 
            className="absolute inset-0 bg-emerald-950/60 backdrop-blur-sm" 
            onClick={onClose} 
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative w-full max-w-md max-h-[85vh] bg-[#fcfaf2] rounded-[2rem] overflow-hidden shadow-2xl border-[6px] border-emerald-700/90 flex flex-col"
          >
            {/* Scrollable area for content only */}
            <div className="flex-1 overflow-y-auto scrollbar-hide bg-[#fcfaf2]">
              <div ref={cardRef} className="bg-[#fcfaf2] min-h-full">
                <div className="p-8 md:p-10 text-center space-y-8 relative overflow-hidden flex flex-col justify-center">
                  {/* Subtle Dot Pattern */}
                  <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(#10b981 1.2px, transparent 0)', backgroundSize: '20px 20px' }} />
                  
                  <div className="relative z-10">
                    <div className="w-14 h-14 bg-emerald-800 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-md">
                      <Share2 className="w-7 h-7" />
                    </div>
                    <div className="!text-emerald-700/60 font-bold text-[9px] tracking-[0.2em] uppercase mb-2">
                      {type === 'dua' ? 'من أدعية القرآن الكريم' : 'من الآيات الكونية في القرآن'}
                    </div>
                    <h2 className="text-2xl md:text-3xl font-serif font-bold !text-emerald-950 mb-4 leading-tight">
                      {data.الدعاء || data.الآية}
                    </h2>
                    <div className="w-12 h-1 bg-gold-500/60 mx-auto rounded-full" />
                  </div>

                  <div className="relative z-10 px-2 py-6">
                    <p className="quran-text text-3xl md:text-4xl !text-[#022c22] leading-[3.2] mb-12 font-serif drop-shadow-sm">
                      {data.النص}
                    </p>
                    <p className="!text-emerald-900 font-serif text-xl font-bold italic">
                      سورة {data.السورة}
                    </p>
                  </div>

                  <div className="pt-10 border-t border-emerald-900/10 relative z-10 flex flex-col items-center gap-3 mt-4">
                    <p className="text-[10px] !text-emerald-800/40 font-medium text-center italic">
                      تمت المشاركة من منصة تدبّر القرآن
                    </p>
                    <div className="flex items-center gap-2 !text-emerald-950/80 font-bold text-sm">
                      <span className="tracking-widest">tadabbur.io</span>
                      <BookOpen className="w-4 h-4 !text-emerald-800" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sticky Actions Footer */}
            <div className="p-6 bg-white border-t border-emerald-900/10 space-y-4 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
              <div className="flex gap-3">
                <button
                  onClick={handleShareImage}
                  disabled={isGenerating}
                  className={`flex-[3] py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md ${
                    isGenerating 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-emerald-700 hover:bg-emerald-800 text-white hover:scale-[1.01] active:scale-95'
                  }`}
                >
                  {isGenerating ? (
                    <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Share2 className="w-4 h-4" />
                      <span className="text-sm">مشاركة كصورة</span>
                    </>
                  )}
                </button>
                <button
                  onClick={handleCopy}
                  className="flex-1 bg-white border border-emerald-100 p-3 rounded-xl text-emerald-900 flex items-center justify-center hover:bg-emerald-50 transition-all shadow-sm"
                  title="نسخ النص"
                >
                  {copied ? <Check className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>

              <div className="flex justify-center gap-2">
                {socialPlatforms.map((platform) => (
                  <a
                    key={platform.name}
                    href={platform.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${platform.color} w-10 h-10 rounded-lg text-white flex items-center justify-center hover:scale-110 transition-all shadow-sm`}
                    title={platform.name}
                  >
                    <div className="w-5 h-5">
                      {platform.icon}
                    </div>
                  </a>
                ))}
              </div>

              <button
                onClick={onClose}
                className="w-full text-[10px] font-bold text-emerald-900/30 hover:text-red-500 transition-colors uppercase tracking-[0.2em] pt-1"
              >
                إغلاق
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ShareModal;
