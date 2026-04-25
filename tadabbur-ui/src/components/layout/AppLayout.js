import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useQuranData } from '../../context/QuranDataContext';
import {
  Moon,
  Sun,
  Book,
  Network,
  Library,
  Gavel,
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
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { t } from '../../locales';

const AppLayout = ({ children }) => {
  const { theme, toggleTheme, lang, isRtl } = useQuranData();
  const location = useLocation();

  const [jurisMenuOpen, setJurisMenuOpen] = React.useState(false);
  const [rhetoricMenuOpen, setRhetoricMenuOpen] = React.useState(false);
  const [storiesMenuOpen, setStoriesMenuOpen] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [mobileJurisOpen, setMobileJurisOpen] = React.useState(false);
  const [mobileRhetoricOpen, setMobileRhetoricOpen] = React.useState(false);
  const [mobileStoriesOpen, setMobileStoriesOpen] = React.useState(false);
  const [showScroll, setShowScroll] = React.useState(false);

  React.useEffect(() => {
    const checkScroll = () => {
      if (!showScroll && window.pageYOffset > 400) {
        setShowScroll(true);
      } else if (showScroll && window.pageYOffset <= 400) {
        setShowScroll(false);
      }
    };

    window.addEventListener('scroll', checkScroll);
    return () => window.removeEventListener('scroll', checkScroll);
  }, [showScroll]);

  const navLinks = [
    { name: 'home', path: '/', icon: Book },
    { name: 'surahs', path: '/surahs', icon: Library },
    { name: 'graph', path: '/graph', icon: Network },
  ];

  const jurisprudenceLinks = [
    { nameEn: 'Rulings', nameAr: 'آيات الأحكام', path: '/ahkam', icon: Gavel },
    { nameEn: 'Abrogation', nameAr: 'الناسخ والمنسوخ', path: '/nasikh', icon: ArrowLeftRight },
    { nameEn: 'Legislations', nameAr: 'التشريعات', path: '/tashriaat', icon: Scale },
  ];

  const rhetoricLinks = [
    { nameEn: 'Parables', nameAr: 'الأمثال القرآنية', path: '/amthal', icon: Sparkles },
    { nameEn: 'Similarities', nameAr: 'المتشابهات والروابط', path: '/mutash', icon: Copy },
    { nameEn: 'Dualities', nameAr: 'الثنائيات القرآنية', path: '/contrasts', icon: Scale },
    { nameEn: 'Endings', nameAr: 'الفواصل القرآنية', path: '/endings', icon: Hash },
  ];

  const storiesLinks = [
    { nameEn: 'Quranic Stories', nameAr: 'القصص القرآنية', path: '/stories', icon: Library },
    { nameEn: 'Quranic Characters', nameAr: 'شخصيات القرآن', path: '/characters', icon: User },
  ];


  const isJurisActive = jurisprudenceLinks.some((link) => location.pathname === link.path);
  const isRhetoricActive = rhetoricLinks.some((link) => location.pathname === link.path);
  const isStoriesActive = storiesLinks.some((link) => location.pathname === link.path);

  React.useEffect(() => {
    if (mobileMenuOpen) {
      setMobileJurisOpen(isJurisActive);
      setMobileRhetoricOpen(isRhetoricActive);
      setMobileStoriesOpen(isStoriesActive);
    }
  }, [mobileMenuOpen, isJurisActive, isRhetoricActive, isStoriesActive]);

  const closeAllMenus = () => {
    setJurisMenuOpen(false);
    setRhetoricMenuOpen(false);
    setStoriesMenuOpen(false);
    setMobileMenuOpen(false);
  };

  const closeDesktopMenus = () => {
    setJurisMenuOpen(false);
    setRhetoricMenuOpen(false);
    setStoriesMenuOpen(false);
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
          <span>{isRtl ? titleAr : titleEn}</span>
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
                  <span>{isRtl ? link.nameAr : link.nameEn}</span>
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

      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/70 dark:bg-gray-900/80 border-b border-emerald-100 dark:border-gray-700 shadow-sm transition-colors duration-300 w-full">
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
              <div className="shrink-0 p-2 bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-xl shadow-lg">
                <Book className="w-5 h-5 text-gold-500" />
              </div>
              <span className="min-w-0 truncate text-lg font-bold tracking-tight font-serif flex items-baseline gap-1">
                <span className="text-emerald-900 dark:text-emerald-300">{t(lang, 'platform_name')}</span>
                <span className="text-gold-600 dark:text-gold-500 text-xl border-b-2 border-gold-400/30">{t(lang, 'platform_name_mid')}</span>
                <span className="text-emerald-800 dark:text-emerald-400">{t(lang, 'platform_name_last')}</span>
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
              className="flex min-w-0 items-center gap-2 sm:gap-3"
              onClick={closeAllMenus}
            >
              <div className="shrink-0 p-2 bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-xl shadow-lg">
                <Book className="w-5 h-5 sm:w-6 sm:h-6 text-gold-500" />
              </div>
              <span className="min-w-0 truncate text-lg sm:text-2xl font-bold tracking-tight font-serif flex items-baseline gap-1 sm:gap-1.5">
                <span className="truncate text-emerald-900 dark:text-emerald-300">{t(lang, 'platform_name')}</span>
                <span className="truncate text-gold-600 dark:text-gold-500 text-xl sm:text-3xl pb-1 border-b-2 border-gold-400/30">{t(lang, 'platform_name_mid')}</span>
                <span className="text-emerald-800 dark:text-emerald-400">{t(lang, 'platform_name_last')}</span>
              </span>
            </Link>

            <nav className="hidden md:flex gap-6 items-center">
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
                  }}
                  onClick={() => setJurisMenuOpen((open) => !open)}
                  className={`flex items-center gap-2 font-medium transition-all py-2 border-b-2 ${
                    isJurisActive
                      ? 'text-emerald-700 dark:text-emerald-400 border-emerald-500'
                      : 'text-gray-600 dark:text-gray-400 border-transparent hover:text-emerald-600 dark:hover:text-emerald-400'
                  }`}
                >
                  <Gavel className="w-4 h-4" />
                  <span>{isRtl ? 'الأحكام' : 'Jurisprudence'}</span>
                  <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${jurisMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {jurisMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      onMouseLeave={() => setJurisMenuOpen(false)}
                      className="absolute top-full left-0 mt-1 w-56 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-emerald-50 dark:border-gray-700 overflow-hidden z-[60]"
                    >
                      <div className="p-2 space-y-1">
                        {jurisprudenceLinks.map((link) => (
                          <Link
                            key={link.path}
                            to={link.path}
                            onClick={() => setJurisMenuOpen(false)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                              location.pathname === link.path
                                ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-bold'
                                : 'text-gray-600 dark:text-gray-300 hover:bg-emerald-50/50 dark:hover:bg-gray-700 hover:text-emerald-600'
                            }`}
                          >
                            <link.icon className="w-4 h-4" />
                            <span className="text-sm font-medium">{isRtl ? link.nameAr : link.nameEn}</span>
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
                  }}
                  onClick={() => setRhetoricMenuOpen((open) => !open)}
                  className={`flex items-center gap-2 font-medium transition-all py-2 border-b-2 ${
                    isRhetoricActive
                      ? 'text-emerald-700 dark:text-emerald-400 border-emerald-500'
                      : 'text-gray-600 dark:text-gray-400 border-transparent hover:text-emerald-600 dark:hover:text-emerald-400'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isRtl ? 'البلاغة' : 'Rhetoric'}</span>
                  <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${rhetoricMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {rhetoricMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      onMouseLeave={() => setRhetoricMenuOpen(false)}
                      className="absolute top-full left-0 mt-1 w-56 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-emerald-50 dark:border-gray-700 overflow-hidden z-[60]"
                    >
                      <div className="p-2 space-y-1">
                        {rhetoricLinks.map((link) => (
                          <Link
                            key={link.path}
                            to={link.path}
                            onClick={() => setRhetoricMenuOpen(false)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                              location.pathname === link.path
                                ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-bold'
                                : 'text-gray-600 dark:text-gray-300 hover:bg-emerald-50/50 dark:hover:bg-gray-700 hover:text-emerald-600'
                            }`}
                          >
                            <link.icon className="w-4 h-4" />
                            <span className="text-sm font-medium">{isRtl ? link.nameAr : link.nameEn}</span>
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
                  }}
                  onClick={() => setStoriesMenuOpen((open) => !open)}
                  className={`flex items-center gap-2 font-medium transition-all py-2 border-b-2 ${
                    isStoriesActive
                      ? 'text-emerald-700 dark:text-emerald-400 border-emerald-500'
                      : 'text-gray-600 dark:text-gray-400 border-transparent hover:text-emerald-600 dark:hover:text-emerald-400'
                  }`}
                >
                  <Library className="w-4 h-4" />
                  <span>{isRtl ? 'القصص' : 'Stories'}</span>
                  <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${storiesMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {storiesMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      onMouseLeave={() => setStoriesMenuOpen(false)}
                      className="absolute top-full left-0 mt-1 w-56 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-emerald-50 dark:border-gray-700 overflow-hidden z-[60]"
                    >
                      <div className="p-2 space-y-1">
                        {storiesLinks.map((link) => (
                          <Link
                            key={link.path}
                            to={link.path}
                            onClick={() => setStoriesMenuOpen(false)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                              location.pathname === link.path
                                ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-bold'
                                : 'text-gray-600 dark:text-gray-300 hover:bg-emerald-50/50 dark:hover:bg-gray-700 hover:text-emerald-600'
                            }`}
                          >
                            <link.icon className="w-4 h-4" />
                            <span className="text-sm font-medium">{isRtl ? link.nameAr : link.nameEn}</span>
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

                {renderMobileAccordion('الأحكام', 'Jurisprudence', Gavel, mobileJurisOpen, setMobileJurisOpen, jurisprudenceLinks, isJurisActive)}
                {renderMobileAccordion('البلاغة', 'Rhetoric', Sparkles, mobileRhetoricOpen, setMobileRhetoricOpen, rhetoricLinks, isRhetoricActive)}
                {renderMobileAccordion('القصص', 'Stories', Library, mobileStoriesOpen, setMobileStoriesOpen, storiesLinks, isStoriesActive)}

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

      <AnimatePresence>
        {showScroll && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className={`fixed bottom-8 ${isRtl ? 'left-8' : 'right-8'} p-3 bg-emerald-600 text-white rounded-full shadow-xl hover:bg-emerald-700 transition-colors z-[100]`}
            title="العودة للأعلى"
          >
            <ArrowUp className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AppLayout;
