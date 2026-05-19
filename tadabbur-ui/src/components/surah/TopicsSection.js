import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { ChevronDown, Loader2 } from "lucide-react";

// Sub-component for individual topic to manage its own verse fetching
const TopicItem = ({ topic, index, isExpanded, onToggle }) => {
  const { data: verses = [], isLoading: versesLoading } = useQuery({
    queryKey: ['topic-verses', topic.id],
    queryFn: async () => {
      const API_BASE = process.env.REACT_APP_API_URL || 'https://tadabbur-api.onrender.com';
      const res = await axios.get(`${API_BASE}/topics/${topic.id}/verses`);
      return res.data?.verses || [];
    },
    enabled: isExpanded, // Only fetch if this topic is expanded
    staleTime: 1000 * 60 * 60, // 1 hour cache
  });

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-2xl border transition-all duration-300 overflow-hidden ${
        isExpanded
          ? 'border-emerald-500 dark:border-emerald-500 shadow-[0_10px_40px_-10px_rgba(16,185,129,0.2)]'
          : 'border-gray-100 dark:border-gray-700 shadow-sm hover:border-emerald-200 dark:hover:border-emerald-800'
      }`}
    >
      <button
        onClick={() => onToggle(topic.id)}
        className="w-full text-right p-6 px-8 flex items-center justify-between"
      >
        <div className="flex items-center gap-6">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg border-2 ${
            isExpanded 
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/50 dark:text-emerald-400 dark:border-emerald-800' 
              : 'bg-sand-50 text-gray-400 border-transparent dark:bg-gray-900'
          }`}>
            {index + 1}
          </div>
          <div className="flex flex-col">
            <span className={`text-xl font-bold ${isExpanded ? 'text-emerald-800 dark:text-emerald-400' : 'text-gray-800 dark:text-gray-200'} transition-colors`}>
              {topic.title_ar}
            </span>
            <span className="text-gray-400 dark:text-gray-500 text-sm font-medium mt-1">
              نطاق الآيات: {topic.verses_range}
            </span>
          </div>
        </div>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-400 transition-transform duration-300 ${isExpanded ? 'rotate-180 bg-emerald-50 text-emerald-600 dark:bg-emerald-900/50' : ''}`}>
          <ChevronDown className="w-5 h-5 text-current" />
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-8 pt-2 border-t border-gray-50 dark:border-gray-700/50 bg-sand-50/50 dark:bg-gray-900/20">
              {versesLoading ? (
                <div className="flex justify-center p-8">
                  <Loader2 className="w-8 h-8 text-gold-500 animate-spin" />
                </div>
              ) : (
                <div className="space-y-6">
                  {verses.length > 0 ? (
                    verses.map((v, i) => (
                      <div key={i} className="bg-white dark:bg-gray-800/80 rounded-2xl p-6 border border-emerald-50 dark:border-emerald-900/30 mb-4 shadow-sm">
                        <p className="quran-text">
                          {v.text_uthmani}
                          <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 text-sm mr-4 border border-emerald-100 dark:border-emerald-800 font-bold">
                            {v.ayah_key.split(':')[1]}
                          </span>
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center">لا يوجد نصوص آيات مسجلة لهذا المقطع</p>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function TopicsSection({ topics }) {
  const [expandedTopic, setExpandedTopic] = useState(null);

  const handleToggleTopic = (topicId) => {
    setExpandedTopic(prev => prev === topicId ? null : topicId);
  };

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 flex items-center gap-3">
        <div className="w-2 h-8 bg-gold-500 rounded-full" />
        البناء المعماري الموضوعي
      </h2>

      {topics.length === 0 ? (
        <div className="bg-sand-50 dark:bg-gray-800 rounded-2xl p-8 text-center text-gray-500 dark:text-gray-400 border border-dashed border-gray-300 dark:border-gray-700">
          لا توجد بيانات موضوعية متوفرة لهذه السورة حالياً.
        </div>
      ) : (
        <div className="space-y-4">
          {topics.map((topic, index) => (
            <TopicItem 
              key={topic.id}
              topic={topic}
              index={index}
              isExpanded={expandedTopic === topic.id}
              onToggle={handleToggleTopic}
            />
          ))}
        </div>
      )}
    </div>
  );
}
