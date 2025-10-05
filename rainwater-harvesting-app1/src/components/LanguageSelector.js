import React, { useContext, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AppContext } from '../App';
import { getTranslation } from '../utils/translations';

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸', nativeName: 'English' },
  { code: 'hi', name: 'हिंदी', flag: '🇮🇳', nativeName: 'Hindi' },
  { code: 'te', name: 'తెలుగు', flag: '🇮🇳', nativeName: 'Telugu' },
  { code: 'ta', name: 'தமிழ்', flag: '🇮🇳', nativeName: 'Tamil' },
  { code: 'bn', name: 'বাংলা', flag: '🇮🇳', nativeName: 'Bengali' },
  { code: 'mr', name: 'मराठी', flag: '🇮🇳', nativeName: 'Marathi' },
  { code: 'gu', name: 'ગુજરાતી', flag: '🇮🇳', nativeName: 'Gujarati' },
  { code: 'kn', name: 'ಕನ್ನಡ', flag: '🇮🇳', nativeName: 'Kannada' }
];

const LanguageSelector = () => {
  const { appData, updateAppData, nextStep } = useContext(AppContext);
  const [stats, setStats] = useState({
    assessmentsCompleted: 0,
    litersSavedAnnually: 0,
    averageAnnualSavings: 0,
  });
  const [loading, setLoading] = useState(true);

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
        setStats({
          assessmentsCompleted: 3,
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
  
  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num;
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <motion.div
          className="mb-8"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        >
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-600 to-emerald-600 rounded-3xl flex items-center justify-center shadow-2xl animate-float">
            <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm7 10c0-3.31-2.69-6-6-6s-6 2.69-6 6c0 2.22 1.21 4.15 3 5.19l1-1.74c-1.19-.7-2-1.97-2-3.45 0-2.21 1.79-4 4-4s4 1.79 4 4c0 1.48-.81 2.75-2 3.45l1 1.74c1.79-1.04 3-2.97 3-5.19z"/>
            </svg>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold gradient-text mb-4">
            {t('tagline')}
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto">
            {t('subtitle')}
          </p>
        </motion.div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            { value: stats.assessmentsCompleted, label: 'Assessments Completed', icon: '✅', color: 'from-blue-500 to-blue-600' },
            { value: formatNumber(stats.litersSavedAnnually), label: 'Liters Saved Annually', icon: '💧', color: 'from-emerald-500 to-emerald-600' },
            { value: `₹${stats.averageAnnualSavings.toLocaleString()}`, label: 'Average Annual Savings', icon: '💰', color: 'from-purple-500 to-purple-600' }
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1, duration: 0.5 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="glass-card rounded-2xl p-6 hover-lift"
            >
              <div className={`text-4xl mb-3 w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                {stat.icon}
              </div>
              <div className={`text-4xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-2`}>
                {loading ? '...' : stat.value}+
              </div>
              <div className="text-gray-600 font-medium">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Language Selection */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.5, duration: 0.6 }}
        className="glass-card rounded-3xl shadow-2xl p-8 md:p-12"
      >
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
          {t('selectLanguage')}
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {languages.map((lang, index) => (
            <motion.button
              key={lang.code}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 + index * 0.05 }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => selectLanguage(lang.code)}
              className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
                appData.language === lang.code
                  ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-emerald-50 shadow-xl'
                  : 'border-gray-200 hover:border-blue-300 bg-white hover:shadow-lg'
              }`}
            >
              <div className="text-4xl mb-3">{lang.flag}</div>
              <div className={`font-bold text-lg ${
                appData.language === lang.code ? 'gradient-text' : 'text-gray-800'
              }`}>
                {lang.name}
              </div>
              <div className="text-sm text-gray-500 mt-1">{lang.nativeName}</div>
              
              {appData.language === lang.code && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-2 right-2"
                >
                  <div className="w-6 h-6 bg-gradient-to-br from-blue-600 to-emerald-600 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </motion.div>
              )}
            </motion.button>
          ))}
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleStartAssessment}
          disabled={!appData.language}
          className="btn-primary w-full text-xl py-4 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="flex items-center justify-center space-x-2">
            <span>{t('startAssessment')}</span>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </span>
        </motion.button>
      </motion.div>

      {/* Feature Highlights */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {[
          { icon: '🎯', title: 'AI-Powered', desc: 'Smart recommendations based on your location' },
          { icon: '📊', title: 'Data-Driven', desc: 'Real rainfall and groundwater analysis' },
          { icon: '🌍', title: 'Eco-Friendly', desc: 'Reduce carbon footprint & water bills' }
        ].map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 + index * 0.1 }}
            className="text-center p-6 glass-card rounded-2xl"
          >
            <div className="text-4xl mb-3">{feature.icon}</div>
            <h3 className="font-bold text-lg text-gray-800 mb-2">{feature.title}</h3>
            <p className="text-gray-600 text-sm">{feature.desc}</p>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default LanguageSelector;