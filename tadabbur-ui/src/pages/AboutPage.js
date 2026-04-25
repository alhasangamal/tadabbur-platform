import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useQuranData } from '../context/QuranDataContext';
import {
  Mail,
  Code,
  Database,
  BrainCircuit,
  MessageSquare,
  Send,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  BookOpen,
  Globe,
  MessageCircle,
} from 'lucide-react';
import { motion } from 'framer-motion';

const API_BASE = process.env.REACT_APP_API_URL || 'https://tadabbur-api.onrender.com';

export default function AboutPage() {
  const { isRtl } = useQuranData();
  const [formData, setFormData] = useState({
    type: 'general',
    name: '',
    email: '',
    page: '',
    message: '',
  });
  const [status, setStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTypeSelect = (type) => {
    setFormData((prev) => ({ ...prev, type }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setStatus('submitting');

    try {
      const response = await fetch(`${API_BASE}/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          name: formData.name.trim(),
          email: formData.email.trim(),
          page: formData.page.trim(),
          message: formData.message.trim(),
        }),
      });

      if (!response.ok) {
        let detail = 'تعذر إرسال الرسالة حالياً.';
        try {
          const data = await response.json();
          detail = data.detail || detail;
        } catch {
          // Ignore non-JSON error responses.
        }
        throw new Error(detail);
      }

      setStatus('success');
      setFormData({ type: 'general', name: '', email: '', page: '', message: '' });
      setTimeout(() => setStatus('idle'), 5000);
    } catch (error) {
      setStatus('error');
      setErrorMessage(error.message || 'تعذر إرسال الرسالة حالياً.');
    }
  };

  const messageTypes = [
    { id: 'bug', label: 'الإبلاغ عن خطأ', icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-200 dark:border-red-800' },
    { id: 'suggestion', label: 'اقتراح', icon: Sparkles, color: 'text-gold-500', bg: 'bg-gold-50 dark:bg-gold-900/20', border: 'border-gold-200 dark:border-gold-800' },
    { id: 'correction', label: 'تصحيح بيانات', icon: BookOpen, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-200 dark:border-blue-800' },
    { id: 'general', label: 'عام', icon: MessageSquare, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-200 dark:border-emerald-800' },
  ];

  const pages = [
    'الصفحة الرئيسية',
    'فهرس السور',
    'عرض السورة',
    'الرسم البياني للمفاهيم',
    'آيات الأحكام',
    'الناسخ والمنسوخ',
    'التشريعات',
    'الأمثال القرآنية',
    'المتشابهات',
    'الثنائيات',
    'القصص القرآنية',
    'أخرى',
  ];

  return (
    <div className="w-full max-w-5xl mx-auto space-y-12 animate-fade pb-20 px-4 md:px-0">
      <Helmet>
        <title>عن المنصة وتواصل معنا | منصة تدبر</title>
        <meta
          name="description"
          content="تعرّف على مطور منصة تدبر وتواصل معنا لتقديم اقتراحاتك أو الإبلاغ عن الأخطاء."
        />
      </Helmet>

      <div className="text-center space-y-4 pt-4">
        <h1 className="text-4xl md:text-5xl font-bold font-kufi text-emerald-900 dark:text-emerald-400">
          من نحن
        </h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
          منصة تهدف إلى توظيف أحدث تقنيات الويب والذكاء الاصطناعي لخدمة كتاب الله، وتيسير تدبره،
          وعرض علومه بطريقة معاصرة وتفاعلية وميسرة.
        </p>
      </div>

      <div className="flex flex-col gap-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-xl overflow-hidden h-fit w-full"
        >
          <div className="bg-gradient-to-br from-emerald-800 to-emerald-900 p-8 md:p-12 text-center relative overflow-hidden flex flex-col md:flex-row items-center gap-8 justify-center">
            <div className="absolute top-0 right-0 opacity-10">
              <Database className="w-64 h-64 -mr-10 -mt-10" />
            </div>

            <div className="relative z-10 flex-shrink-0">
              <div className="w-48 h-48 rounded-full mb-4 shadow-2xl ring-4 ring-gold-400/80 ring-offset-8 ring-offset-emerald-900/50 mx-auto relative overflow-hidden">
                <img
                  src="/WhatsApp Image 2025-09-29 at 21.35.26_7739398b.jpg"
                  alt="Alhassan Gamal"
                  className="w-full h-full object-cover object-top"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://ui-avatars.com/api/?name=Alhassan+Gamal&background=047857&color=fff';
                  }}
                />
              </div>
            </div>

            <div className={`relative z-10 flex flex-col items-center ${isRtl ? 'md:items-start md:text-right' : 'md:items-start md:text-left'} text-center`}>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">الحسن جمال</h2>
              <p className="text-gold-400 font-medium tracking-wide text-lg md:text-xl">عالم بيانات وخبير تحليلات استراتيجية</p>
              <p className="text-emerald-100/80 text-md mt-1" dir="ltr">Data Scientist & Strategic Analytics Expert</p>

              <div className="flex items-center gap-3 mt-6">
                <a href="https://www.linkedin.com/in/alhasan-gamal-480473173/" target="_blank" rel="noopener noreferrer" className="p-2.5 bg-white/10 hover:bg-white/20 hover:scale-110 rounded-full transition-all text-white border border-white/10 hover:border-white/30 shadow-lg" title="LinkedIn">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                    <rect x="2" y="9" width="4" height="12"></rect>
                    <circle cx="4" cy="4" r="2"></circle>
                  </svg>
                </a>
                <a href="https://github.com/alhasangamal" target="_blank" rel="noopener noreferrer" className="p-2.5 bg-white/10 hover:bg-white/20 hover:scale-110 rounded-full transition-all text-white border border-white/10 hover:border-white/30 shadow-lg" title="GitHub">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path>
                    <path d="M9 18c-4.51 2-5-2-7-2"></path>
                  </svg>
                </a>
                <a href="https://alhassanprortfolio.netlify.app/" target="_blank" rel="noopener noreferrer" className="p-2.5 bg-white/10 hover:bg-white/20 hover:scale-110 rounded-full transition-all text-white border border-white/10 hover:border-white/30 shadow-lg" title="Portfolio Website">
                  <Globe className="w-5 h-5" />
                </a>
                <a href="mailto:alhasangamal19@gmail.com" className="p-2.5 bg-white/10 hover:bg-white/20 hover:scale-110 rounded-full transition-all text-white border border-white/10 hover:border-white/30 shadow-lg" title="Email">
                  <Mail className="w-5 h-5" />
                </a>
                <a href="https://api.whatsapp.com/send?phone=201033257024" target="_blank" rel="noopener noreferrer" className="p-2.5 bg-white/10 hover:bg-white/20 hover:scale-110 rounded-full transition-all text-white border border-white/10 hover:border-white/30 shadow-lg" title="WhatsApp">
                  <MessageCircle className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>

          <div className="p-8 md:p-12 space-y-8">
            <div className="space-y-4 max-w-4xl mx-auto">
              <h3 className="text-2xl font-bold text-emerald-800 dark:text-emerald-400 flex items-center gap-3 border-b border-gray-100 dark:border-gray-700 pb-3">
                <Code className="w-6 h-6" />
                عن المطور
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg text-justify">
                متخصص في هندسة البيانات وبناء نماذج الذكاء الاصطناعي، مع خبرة في تصميم حلول ذكاء الأعمال
                والتحليلات المتقدمة. جاءت منصة تدبر كامتداد لهذه الخبرة لتقديم تجربة قرآنية معاصرة
                تُسهل التدبر والاستكشاف وتربط المعاني والعلاقات بأسلوب بصري وتقني حديث.
              </p>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg text-justify">
                الهدف من المشروع هو بناء عمل نافع يخدم كتاب الله، ويوظف التقنية في تسهيل الوصول إلى
                المفاهيم، والموضوعات، والروابط بين السور والآيات في بيئة استخدام واضحة ومريحة.
              </p>
            </div>

            <div className="space-y-4 max-w-4xl mx-auto">
              <h3 className="text-2xl font-bold text-emerald-800 dark:text-emerald-400 flex items-center gap-3 border-b border-gray-100 dark:border-gray-700 pb-3">
                <BrainCircuit className="w-6 h-6" />
                التقنيات وراء المنصة
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg mb-4">
                تم بناء المنصة باستخدام هيكلية حديثة تجمع بين الواجهة التفاعلية، وواجهات برمجة
                التطبيقات السريعة، وقواعد البيانات العلائقية والرسمية.
              </p>
              <div className="flex flex-wrap gap-3">
                {['Python', 'FastAPI', 'React', 'Neo4j', 'PostgreSQL', 'TailwindCSS', 'Playwright', 'Machine Learning'].map((tech) => (
                  <span key={tech} className="px-4 py-2 bg-sand-100 dark:bg-gray-700 text-emerald-800 dark:text-emerald-300 rounded-full text-md font-medium border border-sand-200 dark:border-gray-600 shadow-sm transition-transform hover:scale-105" dir="ltr">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-xl p-8 md:p-12 w-full max-w-4xl mx-auto"
        >
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3 mb-2">
              <Mail className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              تواصل معنا
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              يمكنك إرسال اقتراح، بلاغ خطأ، أو تصحيح بيانات، وسيتم إرساله فعليًا إلى البريد المخصص للاستقبال.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
                نوع الرسالة <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                {messageTypes.map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => handleTypeSelect(type.id)}
                    className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-300 ${
                      formData.type === type.id
                        ? `${type.bg} ${type.border} ${type.color} shadow-md scale-[1.02]`
                        : 'border-gray-100 dark:border-gray-700 hover:border-emerald-200 dark:hover:border-emerald-800 text-gray-500 bg-gray-50 dark:bg-gray-800/50'
                    }`}
                  >
                    <type.icon className={`w-6 h-6 mb-2 ${formData.type === type.id ? type.color : 'text-gray-400'}`} />
                    <span className="font-medium text-sm">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
                  الاسم
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="اكتب اسمك هنا..."
                  className="w-full bg-sand-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
                  البريد الإلكتروني
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="example@mail.com"
                  dir="ltr"
                  className="w-full bg-sand-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
                الصفحة / القسم المعني
              </label>
              <select
                name="page"
                value={formData.page}
                onChange={handleChange}
                className="w-full bg-sand-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all appearance-none"
              >
                <option value="">-- اختر الصفحة (اختياري) --</option>
                {pages.map((page) => (
                  <option key={page} value={page}>{page}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
                نص الرسالة <span className="text-red-500">*</span>
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={5}
                placeholder="اكتب تفاصيل الرسالة هنا بدقة..."
                className="w-full bg-sand-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-none"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={status === 'submitting' || status === 'success' || !formData.message.trim()}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {status === 'idle' && (
                <>
                  <Send className="w-5 h-5" />
                  <span>إرسال الرسالة</span>
                </>
              )}
              {status === 'submitting' && (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>جاري الإرسال...</span>
                </div>
              )}
              {status === 'success' && (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>تم الإرسال بنجاح. شكرًا لتواصلك.</span>
                </>
              )}
              {status === 'error' && (
                <>
                  <AlertCircle className="w-5 h-5" />
                  <span>إعادة المحاولة</span>
                </>
              )}
            </button>

            {status === 'error' && (
              <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-300">
                {errorMessage || 'حدث خطأ أثناء إرسال الرسالة.'}
              </div>
            )}
          </form>
        </motion.div>
      </div>
    </div>
  );
}
