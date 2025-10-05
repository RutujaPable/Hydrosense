
import React, { useState, useContext, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON, Marker, Popup } from 'react-leaflet';
import { motion } from 'framer-motion';
import { AppContext } from '../App';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const SiteSuitabilityMap = () => {
  const { appData, nextStep } = useContext(AppContext);
  const [gridData, setGridData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!appData.location) {
      setError('Location not found. Please go back and set your location.');
      setLoading(false);
      return;
    }

    const fetchSuitabilityGrid = async () => {
      try {
        const apiUrl = process.env.REACT_APP_API_URL;
        const response = await fetch(`${apiUrl}/get_weather`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lat: appData.location.coordinates.lat,
            lng: appData.location.coordinates.lng,
          }),
        });
        if (!response.ok) {
          throw new Error('Failed to fetch suitability data from the server.');
        }
        const data = await response.json();
        setGridData(data);
      } catch (err) {
        setError('Could not load suitability map. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSuitabilityGrid();
  }, [appData.location]);
  
  const getColor = (score) => {
    if (score > 8) return '#2ca25f'; // High (Green)
    if (score > 6) return '#7fc97f';
    if (score > 4) return '#fed976'; // Medium (Yellow)
    if (score > 2) return '#feb24c';
    return '#f03b20'; // Low (Red)
  };

  const styleFeature = (feature) => ({
    fillColor: getColor(feature.properties.suitability_score),
    weight: 1,
    opacity: 1,
    color: 'white',
    fillOpacity: 0.6,
  });

  if (loading) {
    return (
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-600 mt-4">Generating regional suitability map...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center bg-red-50 p-6 rounded-lg">
        <p className="text-red-700 font-semibold">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg p-8"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path>
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Area Suitability Analysis
          </h2>
          <p className="text-gray-600">
            This map shows the potential for rainwater harvesting in your area based on key environmental factors.
          </p>
        </div>

        <div className="relative bg-gray-100 rounded-lg p-4">
          <MapContainer
            center={[appData.location.coordinates.lat, appData.location.coordinates.lng]}
            zoom={15}
            scrollWheelZoom={true}
            className="rounded-lg"
            style={{ height: '450px', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {gridData && <GeoJSON data={gridData} style={styleFeature} />}
            <Marker position={[appData.location.coordinates.lat, appData.location.coordinates.lng]}>
              <Popup>Your Location</Popup>
            </Marker>
          </MapContainer>
          
          {/* Legend */}
          <div className="absolute bottom-4 right-4 bg-white bg-opacity-80 p-3 rounded-lg shadow-md z-[1000]">
              <h4 className="font-bold text-sm mb-2">Suitability</h4>
              <div className="flex items-center mb-1"><div className="w-4 h-4 mr-2" style={{backgroundColor: '#2ca25f'}}></div><span className="text-xs">High</span></div>
              <div className="flex items-center mb-1"><div className="w-4 h-4 mr-2" style={{backgroundColor: '#fed976'}}></div><span className="text-xs">Medium</span></div>
              <div className="flex items-center"><div className="w-4 h-4 mr-2" style={{backgroundColor: '#f03b20'}}></div><span className="text-xs">Low</span></div>
          </div>
        </div>

        <div className="text-center mt-8">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={nextStep}
              className="bg-green-600 text-white py-3 px-8 rounded-lg font-semibold text-lg hover:bg-green-700 transition-colors"
            >
              Continue to Roof Details →
            </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default SiteSuitabilityMap;

