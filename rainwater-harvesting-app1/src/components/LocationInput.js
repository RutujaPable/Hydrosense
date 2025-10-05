
import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { AppContext } from '../App';
import { getTranslation } from '../utils/translations';

const LocationInput = () => {
  const { appData, updateAppData, nextStep } = useContext(AppContext);
  const [loading, setLoading] = useState(false);
  const [manualInput, setManualInput] = useState(false);
  const [address, setAddress] = useState('');
  const [locationError, setLocationError] = useState('');

  // Get current translations
  const t = (key, params = {}) => getTranslation(key, appData.language, params);

  const getCurrentLocation = () => {
    setLoading(true);
    setLocationError('');

    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        // For demo purposes, we'll use the coordinates directly
        // In production, you'd use a geocoding API here
        updateAppData({
          location: {
            coordinates: { lat: latitude, lng: longitude },
            address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
            city: 'Current Location',
            state: 'State',
            country: 'India'
          }
        });
        
        setLoading(false);
      },
      (error) => {
        setLoading(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError('Location access denied. Please enable location access or enter manually.');
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError('Location information unavailable. Please try manual input.');
            break;
          case error.TIMEOUT:
            setLocationError('Location request timeout. Please try again.');
            break;
          default:
            setLocationError('Unknown error occurred while fetching location.');
            break;
        }
        setManualInput(true);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!address.trim()) return;

    setLoading(true);
    setLocationError('');

    // Simulate geocoding - in production, use a real geocoding API
    setTimeout(() => {
      updateAppData({
        location: {
          coordinates: { lat: 28.6139, lng: 77.2090 }, // Default to Delhi
          address: address,
          city: 'City',
          state: 'State',
          country: 'India'
        }
      });
      setLoading(false);
    }, 1000);
  };

  const handleContinue = () => {
    if (appData.location) {
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
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            {t('locationTitle')}
          </h2>
          <p className="text-gray-600">
            {t('locationSubtitle')}
          </p>
        </div>

        {!appData.location && !manualInput && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={getCurrentLocation}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-blue-700 disabled:opacity-50 transition-colors mb-4"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                  {t('detecting')}
                </div>
              ) : (
                t('useCurrentLocation')
              )}
            </motion.button>

            <div className="flex items-center mb-4">
              <div className="flex-grow border-t border-gray-300"></div>
              <span className="px-4 text-gray-500 text-sm">OR</span>
              <div className="flex-grow border-t border-gray-300"></div>
            </div>

            <button
              onClick={() => setManualInput(true)}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              {t('enterManually')}
            </button>
          </motion.div>
        )}

        {locationError && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6"
          >
            {locationError}
          </motion.div>
        )}

        {manualInput && !appData.location && (
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleManualSubmit}
          >
            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-2">
                {t('enterAddress')}
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder={t('addressPlaceholder')}
                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <p className="text-sm text-gray-500 mt-2">
                Please include city and state for better accuracy
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || !address.trim()}
              className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  {t('finding')}
                </div>
              ) : (
                t('findLocation')
              )}
            </button>
          </motion.form>
        )}

        {appData.location && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
              <div className="flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-green-800 font-semibold">{t('locationConfirmed')}</span>
              </div>
              <p className="text-gray-700 mb-2">
                <strong>{t('location')}</strong> {appData.location.address}
              </p>
              {appData.location.coordinates && (
                <p className="text-gray-600 text-sm">
                  Coordinates: {appData.location.coordinates.lat.toFixed(6)}, {appData.location.coordinates.lng.toFixed(6)}
                </p>
              )}
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleContinue}
              className="bg-blue-600 text-white py-3 px-8 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              {t('continueToRoof')}
            </motion.button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default LocationInput;


