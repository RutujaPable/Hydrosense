
import React, { useContext, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AppContext } from '../App';
import { getTranslation } from '../utils/translations';

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
  { code: 'te', name: 'తెలుగు', flag: '🇮🇳' },
  { code: 'ta', name: 'தமிழ்', flag: '🇮🇳' },
  { code: 'bn', name: 'বাংলা', flag: '🇮🇳' },
  { code: 'mr', name: 'मराठी', flag: '🇮🇳' },
  { code: 'gu', name: 'ગુજરાતી', flag: '🇮🇳' },
  { code: 'kn', name: 'ಕನ್ನಡ', flag: '🇮🇳' }
];

const LanguageSelector = () => {
  const { appData, updateAppData, nextStep } = useContext(AppContext);

  // NEW: State for dynamic stats
  const [stats, setStats] = useState({
    assessmentsCompleted: 0,
    litersSavedAnnually: 0,
    averageAnnualSavings: 0,
  });
  const [loading, setLoading] = useState(true);

  // NEW: Fetch stats from backend on component mount
  useEffect(() => {
    const fetchStats = async () => {
      try {
            const apiUrl = process.env.REACT_APP_API_URL;
            const response = await fetch(`${apiUrl}/get_app_stats`);
            if (!response.ok) throw new Error('Failed to fetch stats');
            const data = await response.json();
            setStats(data);
      } catch (error) {
        console.error("Failed to fetch app stats:", error);
        // Fallback to placeholder stats if backend is down
        setStats({
          assessmentsCompleted: 3, // Default to your initial mock data size
          litersSavedAnnually: 455000,
          averageAnnualSavings: 7583,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);


  const selectLanguage = (langCode) => {
    updateAppData({ language: langCode });
  };

  const handleStartAssessment = () => {
    if (appData.language) {
      nextStep();
    }
  };

  const t = (key, params = {}) => getTranslation(key, appData.language, params);
  
  // Helper to format large numbers
  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num;
  };

  return (
    <div className="max-w-4xl mx-auto text-center">
      {/* Hero Section */}
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mb-12">
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto mb-6 bg-blue-600 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm7 10c0-3.31-2.69-6-6-6s-6 2.69-6 6c0 2.22 1.21 4.15 3 5.19l1-1.74c-1.19-.7-2-1.97-2-3.45 0-2.21 1.79-4 4-4s4 1.79 4 4c0 1.48-.81 2.75-2 3.45l1 1.74c1.79-1.04 3-2.97 3-5.19z"/>
            </svg>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">{t('tagline')}</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">{t('subtitle')}</p>
        </div>

        {/* MODIFIED: Statistics Cards now use dynamic data */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }} className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-3xl font-bold text-blue-600 mb-2">{loading ? '...' : `${stats.assessmentsCompleted.toLocaleString()}+`}</div>
            <div className="text-gray-600">Assessments Completed</div>
          </motion.div>
          
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }} className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-3xl font-bold text-green-600 mb-2">{loading ? '...' : formatNumber(stats.litersSavedAnnually)}</div>
            <div className="text-gray-600">Liters Saved Annually</div>
          </motion.div>
          
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.5 }} className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-3xl font-bold text-indigo-600 mb-2">{loading ? '...' : `₹${stats.averageAnnualSavings.toLocaleString()}`}</div>
            <div className="text-gray-600">Average Annual Savings</div>
          </motion.div>
        </div>
      </motion.div>

      {/* Language Selection (Unchanged) */}
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.6 }} className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-8">{t('selectLanguage')}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {languages.map((lang) => (
            <motion.button
              key={lang.code}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => selectLanguage(lang.code)}
              className={`p-4 rounded-lg border-2 transition-all ${appData.language === lang.code ? 'border-blue-600 bg-blue-50 shadow-md' : 'border-gray-300 hover:border-blue-400'}`}
            >
              <div className="text-2xl mb-2">{lang.flag}</div>
              <div className="font-medium text-gray-800">{lang.name}</div>
            </motion.button>
          ))}
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleStartAssessment}
          disabled={!appData.language}
          className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors shadow-lg"
        >
          {t('startAssessment')} →
        </motion.button>
      </motion.div>
    </div>
  );
};

export default LanguageSelector;


