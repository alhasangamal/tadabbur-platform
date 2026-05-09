import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useQuranData } from '../../context/QuranDataContext';
import {
  Moon,
  Sun,
  Book,
  Network,
  Library,
  History,
  Gavel,
  Hand,
  ArrowLeftRight,
  ChevronDown,
  Scale,
  Sparkles,
  Copy,
  ArrowUp,
  User,
  Menu,
  X,
  Hash,
  MessageSquare,
  Globe,
  FlaskConical,
  Scroll,
  Binary,
  Church,
  Bot,
} from 'lucide-react';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import { t } from '../../locales';
import StatsFooter from './StatsFooter';


const AppLayout = ({ children }) => {
  const { theme, toggleTheme, lang, isRtl } = useQuranData();
  const location = useLocation();

  const { scrollYProgress: rawScrollProgress } = useScroll();
  const scrollYProgress = useSpring(rawScrollProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const [jurisMenuOpen, setJurisMenuOpen] = React.useState(false);
  const [rhetoricMenuOpen, setRhetoricMenuOpen] = React.useState(false);
  const [storiesMenuOpen, setStoriesMenuOpen] = React.useState(false);
  const [scienceMenuOpen, setScienceMenuOpen] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [mobileJurisOpen, setMobileJurisOpen] = React.useState(false);
  const [mobileRhetoricOpen, setMobileRhetoricOpen] = React.useState(false);
  const [mobileStoriesOpen, setMobileStoriesOpen] = React.useState(false);
  const [mobileScienceOpen, setMobileScienceOpen] = React.useState(false);
  const [worshipMenuOpen, setWorshipMenuOpen] = React.useState(false);
  const [mobileWorshipOpen, setMobileWorshipOpen] = React.useState(false);

  // Scroll logic removed in favor of BackToTop component

  const navLinks = [
    { name: 'home', path: '/', icon: Book },
    { name: 'surahs', path: '/surahs', icon: Library },
    { name: 'graph', path: '/graph', icon: Network },
    { name: 'bookmarks', path: '/bookmarks', icon: Sparkles },
  ];

  const jurisprudenceLinks = [
    { name: 'آيات الأحكام', path: '/ahkam', icon: Gavel },
    { name: 'الناسخ والمنسوخ', path: '/nasikh', icon: ArrowLeftRight },
    { name: 'التشريعات', path: '/tashriaat', icon: Scale },
  ];

  const rhetoricLinks = [
    { name: 'الأمثال القرآنية', path: '/amthal', icon: Sparkles },
    { name: 'المتشابهات والروابط', path: '/mutash', icon: Copy },
    { name: 'الثنائيات القرآنية', path: '/contrasts', icon: Scale },
    { name: 'الفواصل القرآنية', path: '/endings', icon: Hash },
  ];

  const scienceLinks = [
    { name: 'الآيات الكونية', path: '/cosmic', icon: Globe },
    { name: 'أقسام الله', path: '/aqsam', icon: Scroll },
    { name: 'الأرقام القرآنية', path: '/arqam', icon: Binary },
    { name: 'أسباب النزول', path: '/asbab', icon: History },
  ];

  const storiesLinks = [
    { name: 'القصص القرآنية', path: '/stories', icon: Library },
    { name: 'شخصيات القرآن', path: '/characters', icon: User },
    { name: 'الحوارات القرآنية', path: '/dialogues', icon: MessageSquare },
  ];

  const worshipLinks = [
    { name: 'الأدعية القرآنية', path: '/duas', icon: Hand },
    { name: 'أسماء الله الحسنى', path: '/asma', icon: Sparkles },
  ];


  const isJurisActive = jurisprudenceLinks.some((link) => location.pathname === link.path);
  const isRhetoricActive = rhetoricLinks.some((link) => location.pathname === link.path);
  const isStoriesActive = storiesLinks.some((link) => location.pathname === link.path);
  const isScienceActive = scienceLinks.some((link) => location.pathname === link.path);
  const isWorshipActive = worshipLinks.some((link) => location.pathname === link.path);

  React.useEffect(() => {
    if (mobileMenuOpen) {
      setMobileJurisOpen(isJurisActive);
      setMobileRhetoricOpen(isRhetoricActive);
      setMobileStoriesOpen(isStoriesActive);
      setMobileScienceOpen(isScienceActive);
      setMobileWorshipOpen(isWorshipActive);
    }
  }, [mobileMenuOpen, isJurisActive, isRhetoricActive, isStoriesActive, isScienceActive, isWorshipActive]);

  const closeAllMenus = () => {
    setJurisMenuOpen(false);
    setRhetoricMenuOpen(false);
    setStoriesMenuOpen(false);
    setScienceMenuOpen(false);
    setMobileMenuOpen(false);
  };

  const closeDesktopMenus = () => {
    setJurisMenuOpen(false);
    setRhetoricMenuOpen(false);
    setStoriesMenuOpen(false);
    setScienceMenuOpen(false);
    setWorshipMenuOpen(false);
  };

  const renderMobileAccordion = (titleAr, titleEn, Icon, isOpen, setOpen, links, isActive) => (
    <div className="pt-2">
      <button
        onClick={() => setOpen((open) => !open)}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
          isActive
            ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
            : 'text-gray-600 dark:text-gray-300 hover:bg-emerald-50/50'
        }`}
      >
        <span className="flex items-center gap-3 text-sm font-bold">
          <Icon className="w-4 h-4" />
          <span>{titleAr}</span>
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-1 space-y-1 pr-4">
              {links.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium ${
                    location.pathname === link.path
                      ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-bold'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-emerald-50/50'
                  }`}
                >
                  <link.icon className="w-4 h-4" />
                  <span>{link.name}</span>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <div className={`min-h-screen transition-colors duration-500 font-sans ${isRtl ? 'rtl' : 'ltr'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="fixed inset-0 z-[-1] bg-[#f8f6f1] dark:bg-[#0f172a] transition-colors duration-500" />

      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-emerald-600 z-[60] origin-left"
        style={{ scaleX: scrollYProgress }}
      />

      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[var(--glass)] border-b border-[var(--glass-border)] shadow-[var(--glass-shadow)] transition-colors duration-300 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center gap-3 h-20 md:hidden w-full">
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-gold-600 dark:hover:text-gold-400 transition-colors shrink-0"
              title="تغيير المظهر"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <Link
              to="/"
              className="flex min-w-0 items-center justify-center gap-2 flex-1"
              onClick={closeAllMenus}
            >
              <div className="shrink-0 p-2 bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-xl shadow-lg ring-1 ring-white/20">
                <Book className="w-5 h-5 text-gold-500" />
              </div>
              <span className="min-w-0 truncate text-lg font-bold tracking-tight font-serif flex items-baseline gap-1">
                <span className="text-emerald-950 dark:text-emerald-100 font-kufi">{t(lang, 'platform_name')}</span>
                <span className="text-gold-600 dark:text-gold-500 text-xl border-b-2 border-gold-400/30 font-kufi">{t(lang, 'platform_name_mid')}</span>
                <span className="text-emerald-900 dark:text-emerald-400 font-kufi">{t(lang, 'platform_name_last')}</span>
              </span>
            </Link>

            <button
              onClick={() => setMobileMenuOpen((open) => !open)}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-emerald-600 transition-colors shrink-0"
              aria-label={mobileMenuOpen ? 'إغلاق القائمة' : 'فتح القائمة'}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          <div className="hidden md:flex justify-between items-center gap-3 h-20">
            <Link
              to="/"
              className="flex min-w-0 items-center gap-2 sm:gap-3 group"
              onClick={closeAllMenus}
            >
              <div className="shrink-0 p-2.5 bg-gradient-to-br from-emerald-600 to-emerald-900 rounded-2xl shadow-xl ring-1 ring-white/20 group-hover:scale-110 transition-transform duration-500">
                <Book className="w-6 h-6 text-gold-400" />
              </div>
              <span className="min-w-0 truncate text-lg sm:text-2xl font-bold tracking-tight font-serif flex items-baseline gap-1 sm:gap-2">
                <span className="truncate text-emerald-950 dark:text-emerald-50 font-kufi">{t(lang, 'platform_name')}</span>
                <span className="truncate text-gold-600 dark:text-gold-500 text-xl sm:text-3xl pb-1 border-b-4 border-gold-400/30 font-kufi group-hover:border-gold-500 transition-colors">{t(lang, 'platform_name_mid')}</span>
                <span className="text-emerald-900 dark:text-emerald-400 font-kufi">{t(lang, 'platform_name_last')}</span>
              </span>
            </Link>

            <nav className="hidden xl:flex gap-4 items-center">
              {navLinks.map((link) => {
                const active = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={closeDesktopMenus}
                    className={`flex items-center gap-2 font-medium transition-all ${
                      active
                        ? 'text-emerald-700 dark:text-emerald-400 border-b-2 border-emerald-500'
                        : 'text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400'
                    } py-2`}
                  >
                    <link.icon className="w-4 h-4" />
                    <span>{t(lang, link.name)}</span>
                  </Link>
                );
              })}

              <div className="relative">
                <button
                  onMouseEnter={() => {
                    setJurisMenuOpen(true);
                    setRhetoricMenuOpen(false);
                    setStoriesMenuOpen(false);
                    setScienceMenuOpen(false);
                    setWorshipMenuOpen(false);
                  }}
                  onClick={() => setJurisMenuOpen((open) => !open)}
                  className={`flex items-center gap-2 font-medium transition-all py-2 border-b-2 ${
                    isJurisActive
                      ? 'text-emerald-700 dark:text-emerald-400 border-emerald-500'
                      : 'text-gray-600 dark:text-gray-400 border-transparent hover:text-emerald-600 dark:hover:text-emerald-400'
                  }`}
                >
                  <Gavel className="w-4 h-4" />
                  <span>الأحكام</span>
                  <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${jurisMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {jurisMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      onMouseLeave={() => setJurisMenuOpen(false)}
                      className="absolute top-full left-0 mt-2 w-64 bg-[var(--glass)] backdrop-blur-2xl rounded-[2rem] shadow-[var(--glass-shadow)] border border-[var(--glass-border)] overflow-hidden z-[60] p-2"
                    >
                      <div className="p-2 space-y-1">
                        {jurisprudenceLinks.map((link) => (
                          <Link
                            key={link.path}
                            to={link.path}
                            onClick={() => setJurisMenuOpen(false)}
                            className={`flex items-center gap-3 px-5 py-4 rounded-2xl transition-all duration-300 ${
                              location.pathname === link.path
                                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20 font-bold scale-[1.02]'
                                : 'text-gray-600 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-700 dark:hover:text-emerald-400'
                            }`}
                          >
                            <link.icon className="w-4 h-4" />
                            <span className="text-sm font-medium">{link.name}</span>
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="relative">
                <button
                  onMouseEnter={() => {
                    setRhetoricMenuOpen(true);
                    setJurisMenuOpen(false);
                    setStoriesMenuOpen(false);
                    setScienceMenuOpen(false);
                    setWorshipMenuOpen(false);
                  }}
                  onClick={() => setRhetoricMenuOpen((open) => !open)}
                  className={`flex items-center gap-2 font-medium transition-all py-2 border-b-2 ${
                    isRhetoricActive
                      ? 'text-emerald-700 dark:text-emerald-400 border-emerald-500'
                      : 'text-gray-600 dark:text-gray-400 border-transparent hover:text-emerald-600 dark:hover:text-emerald-400'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>البلاغة</span>
                  <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${rhetoricMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {rhetoricMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      onMouseLeave={() => setRhetoricMenuOpen(false)}
                      className="absolute top-full left-0 mt-2 w-64 bg-[var(--glass)] backdrop-blur-2xl rounded-[2rem] shadow-[var(--glass-shadow)] border border-[var(--glass-border)] overflow-hidden z-[60] p-2"
                    >
                      <div className="p-2 space-y-1">
                        {rhetoricLinks.map((link) => (
                          <Link
                            key={link.path}
                            to={link.path}
                            onClick={() => setRhetoricMenuOpen(false)}
                            className={`flex items-center gap-3 px-5 py-4 rounded-2xl transition-all duration-300 ${
                              location.pathname === link.path
                                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20 font-bold scale-[1.02]'
                                : 'text-gray-600 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-700 dark:hover:text-emerald-400'
                            }`}
                          >
                            <link.icon className="w-4 h-4" />
                            <span className="text-sm font-medium">{link.name}</span>
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="relative">
                <button
                  onMouseEnter={() => {
                    setStoriesMenuOpen(true);
                    setJurisMenuOpen(false);
                    setRhetoricMenuOpen(false);
                    setScienceMenuOpen(false);
                    setWorshipMenuOpen(false);
                  }}
                  onClick={() => setStoriesMenuOpen((open) => !open)}
                  className={`flex items-center gap-2 font-medium transition-all py-2 border-b-2 ${
                    isStoriesActive
                      ? 'text-emerald-700 dark:text-emerald-400 border-emerald-500'
                      : 'text-gray-600 dark:text-gray-400 border-transparent hover:text-emerald-600 dark:hover:text-emerald-400'
                  }`}
                >
                  <Library className="w-4 h-4" />
                  <span>القصص</span>
                  <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${storiesMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {storiesMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      onMouseLeave={() => setStoriesMenuOpen(false)}
                      className="absolute top-full left-0 mt-2 w-64 bg-[var(--glass)] backdrop-blur-2xl rounded-[2rem] shadow-[var(--glass-shadow)] border border-[var(--glass-border)] overflow-hidden z-[60] p-2"
                    >
                      <div className="p-2 space-y-1">
                        {storiesLinks.map((link) => (
                          <Link
                            key={link.path}
                            to={link.path}
                            onClick={() => setStoriesMenuOpen(false)}
                            className={`flex items-center gap-3 px-5 py-4 rounded-2xl transition-all duration-300 ${
                              location.pathname === link.path
                                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20 font-bold scale-[1.02]'
                                : 'text-gray-600 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-700 dark:hover:text-emerald-400'
                            }`}
                          >
                            <link.icon className="w-4 h-4" />
                            <span className="text-sm font-medium">{link.name}</span>
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="relative">
                <button
                  onMouseEnter={() => {
                    setScienceMenuOpen(true);
                    setJurisMenuOpen(false);
                    setRhetoricMenuOpen(false);
                    setStoriesMenuOpen(false);
                    setWorshipMenuOpen(false);
                  }}
                  onClick={() => setScienceMenuOpen((open) => !open)}
                  className={`flex items-center gap-2 font-medium transition-all py-2 border-b-2 ${
                    isScienceActive
                      ? 'text-emerald-700 dark:text-emerald-400 border-emerald-500'
                      : 'text-gray-600 dark:text-gray-400 border-transparent hover:text-emerald-600 dark:hover:text-emerald-400'
                  }`}
                >
                  <FlaskConical className="w-4 h-4" />
                  <span>العلوم</span>
                  <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${scienceMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {scienceMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      onMouseLeave={() => setScienceMenuOpen(false)}
                      className="absolute top-full left-0 mt-2 w-64 bg-[var(--glass)] backdrop-blur-2xl rounded-[2rem] shadow-[var(--glass-shadow)] border border-[var(--glass-border)] overflow-hidden z-[60] p-2"
                    >
                      <div className="p-2 space-y-1">
                        {scienceLinks.map((link) => (
                          <Link
                            key={link.path}
                            to={link.path}
                            onClick={() => setScienceMenuOpen(false)}
                            className={`flex items-center gap-3 px-5 py-4 rounded-2xl transition-all duration-300 ${
                              location.pathname === link.path
                                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20 font-bold scale-[1.02]'
                                : 'text-gray-600 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-700 dark:hover:text-emerald-400'
                            }`}
                          >
                            <link.icon className="w-4 h-4" />
                            <span className="text-sm font-medium">{link.name}</span>
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="relative">
                <button
                  onMouseEnter={() => {
                    setWorshipMenuOpen(true);
                    setJurisMenuOpen(false);
                    setRhetoricMenuOpen(false);
                    setStoriesMenuOpen(false);
                    setScienceMenuOpen(false);
                  }}
                  onClick={() => setWorshipMenuOpen((open) => !open)}
                  className={`flex items-center gap-2 font-medium transition-all py-2 border-b-2 ${
                    isWorshipActive
                      ? 'text-emerald-700 dark:text-emerald-400 border-emerald-500'
                      : 'text-gray-600 dark:text-gray-400 border-transparent hover:text-emerald-600 dark:hover:text-emerald-400'
                  }`}
                >
                  <Church className="w-4 h-4" />
                  <span>العبادات</span>
                  <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${worshipMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {worshipMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      onMouseLeave={() => setWorshipMenuOpen(false)}
                      className="absolute top-full left-0 mt-2 w-64 bg-[var(--glass)] backdrop-blur-2xl rounded-[2rem] shadow-[var(--glass-shadow)] border border-[var(--glass-border)] overflow-hidden z-[60] p-2"
                    >
                      <div className="p-2 space-y-1">
                        {worshipLinks.map((link) => (
                          <Link
                            key={link.path}
                            to={link.path}
                            onClick={() => setWorshipMenuOpen(false)}
                            className={`flex items-center gap-3 px-5 py-4 rounded-2xl transition-all duration-300 ${
                              location.pathname === link.path
                                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20 font-bold scale-[1.02]'
                                : 'text-gray-600 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-700 dark:hover:text-emerald-400'
                            }`}
                          >
                            <link.icon className="w-4 h-4" />
                            <span className="text-sm font-medium">{link.name}</span>
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Link
                to="/about"
                onClick={closeDesktopMenus}
                className={`flex items-center gap-2 font-medium transition-all ${
                  location.pathname === '/about'
                    ? 'text-emerald-700 dark:text-emerald-400 border-b-2 border-emerald-500'
                    : 'text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400'
                } py-2`}
              >
                <User className="w-4 h-4" />
                <span>{t(lang, 'about')}</span>
              </Link>
            </nav>

            <div className="shrink-0 flex items-center gap-2 md:gap-4">
              <button
                onClick={toggleTheme}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-gold-600 dark:hover:text-gold-400 transition-colors"
                title="تغيير المظهر"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="md:hidden overflow-hidden border-t border-emerald-100 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg"
            >
              <nav className="p-4 space-y-1 max-h-[70vh] overflow-y-auto">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-bold ${
                      location.pathname === link.path
                        ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-emerald-50/50'
                    }`}
                  >
                    <link.icon className="w-5 h-5" />
                    <span>{t(lang, link.name)}</span>
                  </Link>
                ))}

                {renderMobileAccordion('الأحكام', '', Gavel, mobileJurisOpen, setMobileJurisOpen, jurisprudenceLinks, isJurisActive)}
                {renderMobileAccordion('البلاغة', '', Sparkles, mobileRhetoricOpen, setMobileRhetoricOpen, rhetoricLinks, isRhetoricActive)}
                {renderMobileAccordion('القصص', '', Library, mobileStoriesOpen, setMobileStoriesOpen, storiesLinks, isStoriesActive)}
                {renderMobileAccordion('العلوم', '', FlaskConical, mobileScienceOpen, setMobileScienceOpen, scienceLinks, isScienceActive)}
                {renderMobileAccordion('العبادات', '', Church, mobileWorshipOpen, setMobileWorshipOpen, worshipLinks, isWorshipActive)}

                <Link
                  to="/about"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium ${
                    location.pathname === '/about'
                      ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-bold'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-emerald-50/50'
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span>{t(lang, 'about')}</span>
                </Link>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className={`${location.pathname === '/graph' ? '' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12'} relative animate-fade`}>
        {children}
      </main>


      {location.pathname === '/' && <StatsFooter />}

      <AnimatePresence>
        {/* showScroll handled by BackToTop component */}
      </AnimatePresence>
    </div>
  );
};

export default AppLayout;
