import React, { useState, useEffect } from 'react';
import { Eye, Users, Calendar } from 'lucide-react';
import { useQuranData } from '../../context/QuranDataContext';

const StatsFooter = () => {
  const { lang, isRtl } = useQuranData();
  const [stats, setStats] = useState({
    totalViews: 0,
    totalVisitors: 0,
    todayViews: 0
  });

  useEffect(() => {
    // Automatic Calculation Logic (Local Simulation)
    // In a real app, this would be a POST request to /api/stats/increment
    const updateStats = () => {
      const lastVisit = localStorage.getItem('last_visit');
      const today = new Date().toDateString();
      
      let localTodayViews = parseInt(localStorage.getItem('today_views') || '0');
      let localTotalViews = parseInt(localStorage.getItem('total_views') || '0');
      let localTotalVisitors = parseInt(localStorage.getItem('total_visitors') || '0');

      // Increment views on every mount (automatic calculation)
      localTodayViews += 1;
      localTotalViews += 1;

      // Increment visitors if it's a new day or first time
      if (lastVisit !== today) {
        localTotalVisitors += 1;
        localStorage.setItem('last_visit', today);
        // Reset today's views if it's a new day
        if (lastVisit) localTodayViews = 1;
      }

      localStorage.setItem('today_views', localTodayViews.toString());
      localStorage.setItem('total_views', localTotalViews.toString());
      localStorage.setItem('total_visitors', localTotalVisitors.toString());

      setStats({
        totalViews: localTotalViews,
        totalVisitors: localTotalVisitors,
        todayViews: localTodayViews
      });
    };

    updateStats();
  }, []);

  const formatNumber = (num) => {
    return new Intl.NumberFormat(lang === 'ar' ? 'ar-EG' : 'en-US').format(num);
  };

  return (
    <footer className="mt-12 pb-6 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white/40 dark:bg-gray-900/40 backdrop-blur-sm border border-emerald-100/30 dark:border-gray-800/30 rounded-full py-2 px-6 flex items-center justify-between shadow-sm">
          
          <div className="flex items-center gap-6 text-[11px] font-medium text-gray-500 dark:text-gray-400">
            {/* Total Views */}
            <div className="flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-500" />
              <span>{isRtl ? 'المشاهدات:' : 'Views:'}</span>
              <span className="font-bold text-gray-900 dark:text-gray-200">{formatNumber(stats.totalViews)}</span>
            </div>

            {/* Total Visitors */}
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-gold-600 dark:text-gold-500" />
              <span>{isRtl ? 'الزوار:' : 'Visitors:'}</span>
              <span className="font-bold text-gray-900 dark:text-gray-200">{formatNumber(stats.totalVisitors)}</span>
            </div>

            {/* Today's Views */}
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-500" />
              <span>{isRtl ? 'اليوم:' : 'Today:'}</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatNumber(stats.todayViews)}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
             <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
             <span className="text-[9px] text-emerald-600 dark:text-emerald-500 font-bold uppercase tracking-tighter">Live</span>
          </div>

        </div>
        <p className="text-center mt-3 text-[10px] text-gray-400 dark:text-gray-500 font-serif">
          {isRtl ? 'هذا العمل خالص لوجه الله تعالى - صدقة جارية' : 'This work is for the sake of Allah - Sadaqah Jariyah'}
        </p>
      </div>
    </footer>
  );
};

export default StatsFooter;
