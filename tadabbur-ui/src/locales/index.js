export const translations = {
  ar: {
    home: "الرئيسية",
    surahs: "السور",
    graph: "العلاقات",
    bookmarks: "المحفوظات",
    about: "من نحن",
    jurisprudence: "الأحكام",
    rhetoric: "البلاغة",
    stories: "القصص",
    characters: "شخصيات القرآن",

    search_placeholder: "البحث الشامل في المنصة...",
    platform_name: "منصة",
    platform_name_mid: "تدبـر",
    platform_name_last: "القرآن",
    // Home Page
    welcome: "مرحباً بك في منصة تدبر",
    welcome_sub: "استكشف كنوز القرآن الكريم وعجائبه بأسلوب عصري",
  },
  en: {
    home: "Home",
    surahs: "Surahs",
    graph: "Graph",
    bookmarks: "Bookmarks",
    about: "About Us",
    jurisprudence: "Jurisprudence",
    rhetoric: "Rhetoric",
    stories: "Stories",
    characters: "Characters",

    search_placeholder: "Global search...",
    platform_name: "Tadabbur",
    platform_name_mid: "Platform",
    platform_name_last: "",
    // Home Page
    welcome: "Welcome to Tadabbur Platform",
    welcome_sub: "Explore the treasures of the Holy Quran in a modern way",
  }
};

export const t = (lang, key) => {
  return translations[lang]?.[key] || key;
};
