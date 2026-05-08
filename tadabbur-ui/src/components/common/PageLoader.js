import React from 'react';
import { motion } from 'framer-motion';
import { Book } from 'lucide-react';

const PageLoader = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-6">
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 5, -5, 0],
          opacity: [0.5, 1, 0.5]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="w-24 h-24 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center border-2 border-emerald-100 dark:border-emerald-800 shadow-xl"
      >
        <Book className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-center space-y-2"
      >
        <h3 className="text-xl font-bold text-emerald-800 dark:text-emerald-200">
          جاري التحميل...
        </h3>
        <p className="text-emerald-600/70 dark:text-emerald-400/70 text-sm font-medium">
          يرجى الانتظار قليلاً
        </p>
      </motion.div>
    </div>
  );
};

export default PageLoader;
