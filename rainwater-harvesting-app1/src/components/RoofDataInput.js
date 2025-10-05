
import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { AppContext } from '../App';
import { getTranslation } from '../utils/translations';
import AutoRoofDetection from './AutoRoofDetection';

const RoofDataInput = () => {
  const { appData, updateAppData, nextStep } = useContext(AppContext);
  const [roofArea, setRoofArea] = useState(appData.roofArea || 100);
  const [familySize, setFamilySize] = useState(appData.familySize || 4);
  const [availableSpace, setAvailableSpace] = useState(appData.availableSpace || '');

  // Get current translations
  const t = (key, params = {}) => getTranslation(key, appData.language, params);
    const handleAutoDetectionComplete = (detectedArea) => {
    setRoofArea(detectedArea);
  };


  const spaceOptions = [
    { value: 'small', label: t('smallSpace'), description: t('smallSpaceDesc') },
    { value: 'medium', label: t('mediumSpace'), description: t('mediumSpaceDesc') },
    { value: 'large', label: t('largeSpace'), description: t('largeSpaceDesc') },
    { value: 'very-large', label: t('veryLargeSpace'), description: t('veryLargeSpaceDesc') }
  ];

  const handleContinue = () => {
    if (roofArea > 0 && familySize > 0 && availableSpace) {
      updateAppData({
        roofArea,
        familySize,
        availableSpace
      });
      nextStep();
    }
  };

  const getRoofSizeCategory = (area) => {
    if (area < 50) return { category: 'Small', color: 'text-orange-600', bg: 'bg-orange-50' };
    if (area < 150) return { category: 'Medium', color: 'text-blue-600', bg: 'bg-blue-50' };
    if (area < 300) return { category: 'Large', color: 'text-green-600', bg: 'bg-green-50' };
    return { category: 'Very Large', color: 'text-purple-600', bg: 'bg-purple-50' };
  };

  const getWaterNeed = (size) => {
    return size * 150; // Approximate daily water need per person (150L)
  };

  const roofSizeInfo = getRoofSizeCategory(roofArea);
  const dailyWaterNeed = getWaterNeed(familySize);

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg p-8"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            {t('roofTitle')}
          </h2>
          <p className="text-gray-600">
            {t('roofSubtitle')}
          </p>
        </div>
        <AutoRoofDetection onDetectionComplete={handleAutoDetectionComplete} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Input Controls */}
          <div className="space-y-8">
            {/* Roof Area */}
            <div>
              <label className="block text-gray-700 font-semibold mb-4">
                {t('roofArea')}: {roofArea} sq m
              </label>
              <div className="relative">
                <input
                  type="range"
                  min="20"
                  max="500"
                  value={roofArea}
                  onChange={(e) => setRoofArea(parseInt(e.target.value))}
                  className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-sm text-gray-500 mt-2">
                  <span>20 sq m</span>
                  <span>500 sq m</span>
                </div>
              </div>
              
              {/* Alternative numeric input */}
              <div className="mt-4">
                <input
                  type="number"
                  value={roofArea}
                  onChange={(e) => setRoofArea(parseInt(e.target.value) || 0)}
                  className="w-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter area"
                />
                <span className="ml-2 text-gray-600">{t('squareMeters')}</span>
              </div>

              <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-2 ${roofSizeInfo.color} ${roofSizeInfo.bg}`}>
                {roofSizeInfo.category} Roof
              </div>
            </div>

            {/* Family Size */}
            <div>
              <label className="block text-gray-700 font-semibold mb-4">
                {t('familySize')}: {familySize} {t('familyMembers')}
              </label>
              <div className="grid grid-cols-4 gap-3">
                {[1, 2, 3, 4, 5, 6, 8, 10].map((size) => (
                  <motion.button
                    key={size}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setFamilySize(size)}
                    className={`p-4 rounded-lg border-2 font-semibold transition-all ${
                      familySize === size
                        ? 'border-blue-600 bg-blue-50 text-blue-600'
                        : 'border-gray-300 hover:border-blue-400 text-gray-700'
                    }`}
                  >
                    {size}
                  </motion.button>
                ))}
              </div>
              
              <div className="mt-4">
                <input
                  type="number"
                  value={familySize}
                  onChange={(e) => setFamilySize(parseInt(e.target.value) || 0)}
                  min="1"
                  max="50"
                  className="w-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Custom"
                />
                <span className="ml-2 text-gray-600">{t('familyMembers')}</span>
              </div>
            </div>

            {/* Available Space */}
            <div>
              <label className="block text-gray-700 font-semibold mb-4">
                {t('availableSpace')}
              </label>
              <div className="space-y-3">
                {spaceOptions.map((option) => (
                  <motion.div
                    key={option.value}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setAvailableSpace(option.value)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      availableSpace === option.value
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-300 hover:border-blue-400'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                        availableSpace === option.value
                          ? 'border-blue-600 bg-blue-600'
                          : 'border-gray-400'
                      }`}>
                        {availableSpace === option.value && (
                          <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800">{option.label}</div>
                        <div className="text-sm text-gray-600">{option.description}</div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Preview & Information */}
          <div className="space-y-6">
            {/* Visual Preview */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">{t('propertyPreview')}</h3>
              
              {/* Simple roof visualization */}
              <div className="relative bg-blue-100 rounded-lg p-8 mb-4" style={{ minHeight: '200px' }}>
                <div 
                  className="bg-red-400 rounded-sm mx-auto"
                  style={{
                    width: `${Math.min(roofArea / 5, 80)}px`,
                    height: `${Math.min(roofArea / 8, 60)}px`,
                    marginTop: '20px'
                  }}
                ></div>
                <div className="text-center mt-4 text-sm text-gray-600">
                  Roof: {roofArea} sq m
                </div>
                
                {/* Space indicator */}
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-center justify-between">
                    <div className={`w-4 h-4 rounded ${
                      availableSpace === 'small' ? 'bg-orange-400' :
                      availableSpace === 'medium' ? 'bg-blue-400' :
                      availableSpace === 'large' ? 'bg-green-400' : 'bg-purple-400'
                    }`}></div>
                    <span className="text-xs text-gray-600">Available Space</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-600">{dailyWaterNeed}L</div>
                <div className="text-sm text-gray-600">{t('dailyWaterNeed')}</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-600">{Math.round(roofArea * 0.8)}L</div>
                <div className="text-sm text-gray-600">{t('perMmRainfall')}</div>
              </div>
            </div>

            {/* Helpful Tips */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div>
                  <div className="font-semibold text-yellow-800 text-sm">{t('measurementTips')}</div>
                  <div className="text-yellow-700 text-sm mt-1">
                    {t('measurementTipText')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Continue Button */}
        <div className="text-center mt-8">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleContinue}
            disabled={!roofArea || !familySize || !availableSpace}
            className="bg-blue-600 text-white py-3 px-8 rounded-lg font-semibold text-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {t('continueToMap')}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default RoofDataInput;

