
import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { AppContext } from '../App';
import { getTranslation } from '../utils/translations';

const UserDetails = () => {
  const { appData, updateAppData, nextStep } = useContext(AppContext);
  const [formData, setFormData] = useState({
    name: appData.userName || '',
    email: appData.userEmail || '',
    phone: appData.userPhone || '',
    propertyType: appData.propertyType || ''
  });
  const [errors, setErrors] = useState({});

  // Get current translations
  const t = (key, params = {}) => getTranslation(key, appData.language, params);

  const propertyTypes = [
    { value: 'residential', label: t('Residential'), icon: '🏠' },
    { value: 'commercial', label: t('Commercial'), icon: '🏢' },
    { value: 'industrial', label: t('Industrial'), icon: '🏭' },
    { value: 'institutional', label: t('Institutional'), icon: '🏛️' }
  ];

  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = t('nameRequired');
    } else if (formData.name.trim().length < 2) {
      newErrors.name = t('nameMinLength');
    }

    // Email validation (optional but if provided, should be valid)
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('emailInvalid');
    }

    // Phone validation (optional but if provided, should be valid)
    if (formData.phone && !/^\+?[\d\s\-\(\)]{10,15}$/.test(formData.phone)) {
      newErrors.phone = t('phoneInvalid');
    }

    // Property type validation
    if (!formData.propertyType) {
      newErrors.propertyType = t('propertyTypeRequired');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleContinue = () => {
    if (validateForm()) {
      updateAppData({
        userName: formData.name.trim(),
        userEmail: formData.email.trim(),
        userPhone: formData.phone.trim(),
        propertyType: formData.propertyType
      });
      nextStep();
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg p-8"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-indigo-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            {t('User Details')}
          </h2>
        </div>

        {/* Form */}
        <div className="space-y-6">
          {/* Name Field */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              {t('Full Name')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder={t('Enter Full Name')}
              className={`w-full p-4 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                errors.name ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
            />
            {errors.name && (
              <p className="text-red-600 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          {/* Email Field (Optional) */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              {t('email')} <span className="text-gray-400 text-sm">({t('optional')})</span>
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder={t('Enter Email')}
              className={`w-full p-4 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
            />
            {errors.email && (
              <p className="text-red-600 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          {/* Phone Field (Optional) */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              {t('Phone')} <span className="text-gray-400 text-sm">({t('optional')})</span>
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder={t('Enter Phone')}
              className={`w-full p-4 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                errors.phone ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
            />
            {errors.phone && (
              <p className="text-red-600 text-sm mt-1">{errors.phone}</p>
            )}
          </div>

          {/* Property Type */}
          <div>
            <label className="block text-gray-700 font-semibold mb-4">
              {t('Property Type')} <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {propertyTypes.map((type) => (
                <motion.button
                  key={type.value}
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleInputChange('propertyType', type.value)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    formData.propertyType === type.value
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-600'
                      : 'border-gray-300 hover:border-indigo-400 text-gray-700'
                  }`}
                >
                  <div className="text-2xl mb-2">{type.icon}</div>
                  <div className="font-medium text-sm">{type.label}</div>
                </motion.button>
              ))}
            </div>
            {errors.propertyType && (
              <p className="text-red-600 text-sm mt-2">{errors.propertyType}</p>
            )}
          </div>


          {/* Privacy Notice */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-gray-500 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              <div className="text-sm">
                <h5 className="font-semibold text-gray-800 mb-1">{t('Privacy Notice')}</h5>
                <p className="text-gray-600">{t('Privacy Text')}</p>
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
            className="bg-indigo-600 text-white py-3 px-8 rounded-lg font-semibold text-lg hover:bg-indigo-700 transition-colors shadow-lg"
          >
            {t('Continue')}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default UserDetails;

