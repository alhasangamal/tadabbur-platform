import React from "react";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import {
  Book, MessageSquare, Bookmark, Database, Star, ScrollText, Send, Bot,
  Info
} from "lucide-react";
import { useQuranData } from "../context/QuranDataContext";

export default function HomePage() {
  const { lang, isRtl } = useQuranData();

  const containerVars = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVars = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="w-full space-y-20 pb-20 font-sans">
      <Helmet>
        <title>منصة تدبر القرآن الكريم | الرئيسية</title>
        <meta name="description" content="منصة متقدمة لتدبر القرآن الكريم، استكشاف الأحكام، القصص، المتشابهات، البلاغة، باستخدام أحدث تقنيات البحث وتصور البيانات." />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "منصة تدبر",
            "url": window.location.origin,
            "potentialAction": {
              "@type": "SearchAction",
              "target": `${window.location.origin}/search?q={search_term_string}`,
              "query-input": "required name=search_term_string"
            }
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "منصة تدبر",
            "url": window.location.origin,
            "logo": `${window.location.origin}/logo512.png`
          })}
        </script>
      </Helmet>
      {/* HERO SECTION */}
      <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#064e3b] via-[#022c22] to-[#065f46] shadow-2xl p-10 md:p-20 text-center transform-gpu">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div 
            animate={{ 
              rotate: [0, 90, 180, 270, 360],
              scale: [1, 1.2, 1, 1.1, 1]
            }}
            transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
            className="absolute -top-1/2 -right-1/4 w-[100%] h-[100%] opacity-[0.03] border-[2px] border-gold-500 rounded-full"
          />
          <motion.div 
            animate={{ 
              rotate: [360, 270, 180, 90, 0],
              scale: [1, 1.1, 1.2, 1, 1]
            }}
            transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-1/2 -left-1/4 w-[80%] h-[80%] opacity-[0.02] border-[1px] border-gold-400 rounded-[40%]"
          />
          <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M30 0l2.5 10h10l-7.5 7.5L37.5 30 30 22.5 22.5 30l2.5-12.5L17.5 10h10L30 0z\' fill=\'%23d4af37\' fill-opacity=\'1\'/%3E%3C/svg%3E")' }} />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative z-10 flex flex-col items-center max-w-5xl mx-auto space-y-10"
        >
          <div className="inline-block px-8 py-2.5 rounded-full bg-emerald-950/40 border border-gold-500/30 text-gold-400 text-sm md:text-lg font-serif tracking-widest shadow-inner backdrop-blur-sm">
            {isRtl ? "بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ" : "In the name of Allah"}
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-5xl font-serif font-bold text-white leading-tight drop-shadow-lg" style={{ lineHeight: '1.6' }}>
            {isRtl ? "﴿ كِتَابٌ أَنزَلْنَاهُ إِلَيْكَ مُبَارَكٌ لِّيَدَّبَّرُوا آيَاتِهِ وَلِيَتَذَكَّرَ أُولُو الْأَلْبَابِ ﴾" : "A blessed Book which We have revealed to you"}
          </h1>
          <p className="text-emerald-50 text-lg md:text-2xl max-w-3xl leading-relaxed font-light opacity-90">
            {isRtl ? "منصة شاملة لتدبّر القرآن — استكشف البنية العددية والمعمارية الموضوعية والأنماط اللغوية للقرآن الكريم برؤية تقنية معاصرة." : "A comprehensive platform for Quranic contemplation."}
          </p>
        </motion.div>
      </section>

      {/* 1. البنية الأساسية */}
      <section>
        <div className="flex items-center justify-between border-b border-sand-300 dark:border-ink-light/50 pb-4 mb-8">
          <h2 className="title-primary !mb-0 flex items-center gap-3">
            <span className="text-3xl">📊</span> البنية الأساسية
          </h2>
        </div>

        <motion.div variants={containerVars} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {[
            { n: "114", l: "سورة" },
            { n: "6,236", l: "آية" },
            { n: "86 / 28", l: "سورة مكية / مدنية" },
            { n: "30", l: "جزء" },
            { n: "60", l: "حزب" },
            { n: "23", l: "سنة نزول" }
          ].map((stat, i) => (
            <motion.div 
              key={i} 
              variants={itemVars} 
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="glass-card p-8 flex flex-col items-center justify-center text-center group cursor-default"
            >
              <span className="text-4xl md:text-5xl text-gradient-gold font-serif mb-3 font-bold group-hover:scale-110 transition-transform">{stat.n}</span>
              <span className="text-base md:text-lg text-ink-light dark:text-sand-300 font-medium">{stat.l}</span>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* 2. السور والبنية */}
      <section>
        <div className="flex items-center justify-between border-b border-sand-300 dark:border-ink-light/50 pb-4 mb-8">
          <h2 className="title-primary !mb-0 flex items-center gap-3">
            <span className="text-3xl">📖</span> السور والبنية
          </h2>
        </div>

        <motion.div variants={containerVars} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { n: "15", t: "سجدة تلاوة", d: "الأعراف · الرعد · النحل · الإسراء · مريم · الحج (٢) · الفرقان · النمل · السجدة · ص · فصلت · النجم · الانشقاق · العلق" },
            { n: "29", t: "سورة بحروف مقطعة", d: "الم (6 سور) · حم (7 سور) · طسم (2) · المص · كهيعص · طه · يس · ص · ق · ن · المر · طس" },
            { n: "14", t: "تركيبة حروف مقطعة", d: "" },
            { n: "6", t: "سور بأسماء أنبياء", d: "يونس · هود · يوسف · إبراهيم · محمد · نوح" },
            { n: "1", t: "سورة باسم امرأة", d: "سورة مريم (19)" },
            { n: "113", t: "سورة تبدأ بالبسملة", d: "جميع السور ما عدا سورة التوبة · البسملة في الفاتحة هي الآية الأولى" },
            { n: "5", t: "سور تبدأ بالحمد", d: "الفاتحة · الأنعام · الكهف · سبأ · فاطر" },
            { n: "7", t: "سور تبدأ بالتسبيح", d: "الإسراء (سبحان) · الحديد · الحشر · الصف · الجمعة · التغابن (سَبَّحَ/يُسَبِّحُ) · الأعلى (سَبِّحِ)" }
          ].map((item, i) => (
            <motion.div key={i} variants={itemVars} className="group glass-card p-6 text-center cursor-default relative overflow-hidden flex flex-col justify-center min-h-[180px]">
              <div className="transition-transform duration-500 ease-out group-hover:-translate-y-10 z-10 w-full">
                <span className="block text-4xl text-gradient-gold font-serif mb-2 font-bold">{item.n}</span>
                <span className="block text-base text-ink dark:text-sand-50 font-medium">{item.t}</span>
              </div>
              {item.d && (
                <div className="absolute inset-x-6 bottom-4 opacity-0 translate-y-6 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 z-10">
                  <span className="block text-xs text-ink-light dark:text-sand-300 leading-relaxed font-light">{item.d}</span>
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* 3. الإحصاءات السريعة (أطول، أقصر، إلخ) */}
      <section>
        <motion.div variants={containerVars} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { l: "أطول سورة", v: "البقرة", s: "286 آية" },
            { l: "أقصر سورة", v: "الكوثر", s: "3 آيات" },
            { l: "أطول آية", v: "البقرة 2:282 — آية الدَّيْن", s: "" },
            { l: "أقصر آية", v: "طه، يس، حم", s: "حرف أو حرفان" },
            { l: "أعظم آية", v: "آية الكرسي", s: "البقرة 2:255" },
            { l: "السورة الوحيدة بلا بسملة", v: "التوبة", s: "سورة 9" }
          ].map((stat, i) => (
            <motion.div key={i} variants={itemVars} className="glass-card p-8 flex flex-col justify-center items-start text-right border-l-4 border-l-emerald-600 dark:border-l-emerald-500">
              <span className="text-sm text-emerald-800 dark:text-emerald-400 font-bold mb-2 uppercase tracking-wide">{stat.l}</span>
              <span className="text-2xl text-ink dark:text-sand-50 font-serif">
                {stat.v} {stat.s && <span className="text-base font-sans text-ink-light dark:text-sand-400 mr-2">{stat.s}</span>}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* 5. جدول كيف تبدأ السور */}
      <section>
        <div className="flex items-center justify-between border-b border-sand-300 dark:border-ink-light/50 pb-4 mb-8">
          <h2 className="title-primary !mb-0">
            كيف تبدأ السور الـ 114
          </h2>
        </div>

        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-base text-right" dir="rtl">
              <thead className="bg-sand-100/50 dark:bg-ink-dark/50 border-b border-sand-300 dark:border-ink-light/30 text-ink dark:text-sand-50">
                <tr>
                  <th className="px-8 py-5 font-bold">نوع الافتتاح</th>
                  <th className="px-8 py-5 font-bold">العدد</th>
                  <th className="px-8 py-5 font-bold text-right">أمثلة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand-200/50 dark:divide-ink-light/20">
                {[
                  { t: "الحروف المقطعة", c: "29", e: "الم، حم، يس، طه، ص، ق، ن" },
                  { t: "جملة خبرية", c: "32", e: "إنا أنزلناه، قد أفلح، ألهاكم" },
                  { t: "أمر أو نداء", c: "17", e: "قل، يا أيها الناس، يا أيها النبي" },
                  { t: "القَسَم", c: "15", e: "والعصر، والفجر، والضحى، والشمس" },
                  { t: "الحمد والتسبيح", c: "14", e: "الحمد لله، سبحان، تبارك" },
                  { t: "شرطية أو زمانية", c: "7", e: "إذا وقعت، إذا جاء، إذا زلزلت" }
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-sand-50/50 dark:hover:bg-ink-light/10 transition-colors">
                    <td className="px-8 py-5 text-ink dark:text-sand-100 font-medium">{row.t}</td>
                    <td className="px-8 py-5 text-emerald-700 dark:text-emerald-400 font-bold">{row.c}</td>
                    <td className="px-8 py-5 text-ink-light dark:text-sand-300">{row.e}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 6. الأسماء والصفات / الأنبياء والشخصيات */}
      <section>
        <div className="flex items-center justify-between border-b border-sand-300 dark:border-ink-light/50 pb-4 mb-8">
          <h2 className="title-primary !mb-0 flex items-center gap-3">
            <span className="text-3xl">🕌</span> الأسماء والصفات الإلهية
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="glass-card p-8 text-center shadow-md border border-gold-300/50">
            <span className="block text-6xl text-gradient-gold font-serif mb-3 font-bold drop-shadow-sm">99</span>
            <span className="block text-lg text-ink-light dark:text-sand-300 font-medium">اسماً لله الحسنى</span>
          </div>
        </div>

        <div className="flex items-center justify-between border-b border-sand-300 dark:border-ink-light/50 pb-4 mb-8">
          <h2 className="title-primary !mb-0 flex items-center gap-3">
            <span className="text-3xl">👤</span> الأنبياء والشخصيات
          </h2>
        </div>
        <motion.div variants={containerVars} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { n: "25", t: "نبيًا مذكورًا", d: "موسى · إبراهيم · نوح · عيسى · داود · سليمان · يوسف · يعقوب · إسحاق · إسماعيل · زكريا · يحيى · هارون · آدم · أيوب · يونس · هود · صالح · شعيب · لوط..." },
            { n: "19", t: "شخصية بارزة", d: "مريم · لقمان · ذو القرنين · طالوت · زيد بن حارثة · فرعون · هامان · قارون · السامري · أصحاب الكهف · ذو الكفل..." },
            { n: "17", t: "جماعة وأمة", d: "بنو إسرائيل · الحواريون · قريش · الروم · الأعراب · الأنصار · المهاجرون · أهل الكتاب · المشركون · المنافقون..." },
            { n: "25", t: "أمة تاريخية مذكورة", d: "قوم نوح · عاد · ثمود · قوم لوط · أصحاب مدين · المؤتفكات · قوم تبع · أصحاب الرس · أصحاب الأيكة..." }
          ].map((item, i) => (
            <motion.div key={i} variants={itemVars} className="group glass-card p-6 text-center cursor-default relative overflow-hidden flex flex-col justify-center min-h-[200px]">
              <div className="transition-transform duration-500 ease-out group-hover:-translate-y-12 z-10 w-full">
                <span className="block text-5xl text-gradient-gold font-serif mb-2 font-bold">{item.n}</span>
                <span className="block text-base text-ink dark:text-sand-50 font-medium">{item.t}</span>
              </div>
              <div className="absolute inset-x-6 bottom-6 opacity-0 translate-y-6 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 z-10">
                <span className="block text-xs text-ink-light dark:text-sand-300 leading-relaxed font-light">{item.d}</span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* 8. محتوى القرآن */}
      <section>
        <div className="flex items-center justify-between border-b border-sand-300 dark:border-ink-light/50 pb-4 mb-8">
          <h2 className="title-primary !mb-0 flex items-center gap-3">
            <span className="text-3xl">📜</span> محتوى القرآن
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {[
            { n: 23, text: "حالة نسخ", desc: "تدرج تحريم الخمر · نسخ عدة المتوفى عنها زوجها · اتجاه القبلة..." },
            { n: 23, text: "قسم إلهي", desc: "وَالْعَصْرِ · وَالضُّحَى · وَالتِّينِ وَالزَّيْتُونِ · وَالشَّمْسِ وَضُحَاهَا..." },
            { n: 35, text: "ثنائية قرآنية", desc: "الدنيا والآخرة · الجنة والنار · الليل والنهار · الملائكة والشياطين..." },
            { n: 25, text: "حوار قرآني", desc: "حوار الله مع الملائكة · حوار إبراهيم مع أبيه · حوار موسى مع الخضر..." },
            { n: 14, text: "قصة قرآنية", desc: "قصة يوسف · قصة موسى وفرعون · قصة أصحاب الكهف · قصة نوح والطوفان..." },
            { n: 30, text: "مَثَل قرآني", desc: "مَثَلُ الَّذِينَ يُنْفِقُونَ أَمْوَالَهُمْ كَمَثَلِ حَبَّةٍ · مَثَلُهُمْ كَمَثَلِ الَّذِي اسْتَوْقَدَ نَارًا..." },
            { n: 53, text: "دعاء قرآني", desc: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً · رَبِّ اغْفِرْ لِي وَلِوَالِدَيَّ · رَبِّ اشْرَحْ لِي صَدْرِي..." },
          ].reverse().map((item, i) => (
            <motion.div 
              key={i} 
              variants={itemVars}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group glass-card p-5 text-center cursor-default relative overflow-hidden flex flex-col justify-center min-h-[180px]"
            >
              <div className="transition-transform duration-500 ease-out group-hover:-translate-y-10 z-10 w-full flex flex-col items-center justify-center">
                <span className="block text-3xl text-gradient-gold font-serif mb-2 font-bold">{item.n}</span>
                <span className="block text-sm font-medium text-ink dark:text-sand-50">{item.text}</span>
              </div>
              <div className="absolute inset-x-3 bottom-4 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 z-10">
                <span className="block text-[11px] text-ink-light dark:text-sand-300 leading-relaxed font-light">{item.desc}</span>
              </div>
              {/* Subtle hover overlay */}
              <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </motion.div>
          ))}
        </div>
      </section>

    </div>
  );
}
