import React, { useState, useContext, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON, Marker, Popup, useMap } from 'react-leaflet';
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

// Component to handle map centering
function MapCenter({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, 15);
    }
  }, [center, map]);
  return null;
}

const SiteSuitabilityMap = () => {
  const { appData, nextStep } = useContext(AppContext);
  const [gridData, setGridData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!appData.location || !appData.location.coordinates) {
      setError('Location not found. Please go back and set your location.');
      setLoading(false);
      return;
    }

    const fetchSuitabilityGrid = async () => {
      try {
        const apiUrl = process.env.REACT_APP_API_URL;
        if (!apiUrl) {
          throw new Error('API URL not configured');
        }

        const response = await fetch(`${apiUrl}/get_suitability_grid`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lat: appData.location.coordinates.lat,
            lng: appData.location.coordinates.lng,
          }),
        });

        if (!response.ok) {
          throw new Error(`Server error: ${response.status}`);
        }

        const data = await response.json();
        
        // Validate GeoJSON structure
        if (!data || !data.type || data.type !== 'FeatureCollection' || !Array.isArray(data.features)) {
          throw new Error('Invalid GeoJSON format received from server');
        }

        setGridData(data);
      } catch (err) {
        console.error('Suitability map error:', err);
        setError(`Could not load suitability map: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchSuitabilityGrid();
  }, [appData.location]);
  
  const getColor = (score) => {
    if (score > 8) return '#2ca25f';
    if (score > 6) return '#7fc97f';
    if (score > 4) return '#fed976';
    if (score > 2) return '#feb24c';
    return '#f03b20';
  };

  const styleFeature = (feature) => ({
    fillColor: getColor(feature.properties.suitability_score),
    weight: 1,
    opacity: 1,
    color: 'white',
    fillOpacity: 0.6,
  });

  const onEachFeature = (feature, layer) => {
    if (feature.properties) {
      const props = feature.properties;
      layer.bindPopup(`
        <div style="font-size: 12px;">
          <strong>Suitability Score:</strong> ${props.suitability_score}<br/>
          <strong>Rainfall:</strong> ${Math.round(props.rainfall)} mm<br/>
          <strong>Groundwater Depth:</strong> ${Math.round(props.groundwater_depth)} m<br/>
          <strong>Permeability:</strong> ${props.permeability.toFixed(1)}
        </div>
      `);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Generating regional suitability map...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center bg-red-50 p-6 rounded-lg">
            <p className="text-red-700 font-semibold mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const userLocation = appData.location.coordinates;
  const mapCenter = [userLocation.lat, userLocation.lng];

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

        <div className="relative bg-gray-100 rounded-lg p-4 mb-6">
          <MapContainer
            center={mapCenter}
            zoom={15}
            scrollWheelZoom={true}
            className="rounded-lg"
            style={{ height: '450px', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapCenter center={mapCenter} />
            
            {gridData && (
              <GeoJSON 
                data={gridData} 
                style={styleFeature}
                onEachFeature={onEachFeature}
              />
            )}
            
            <Marker position={mapCenter}>
              <Popup>
                <div style={{ textAlign: 'center' }}>
                  <strong>Your Location</strong><br/>
                  {appData.location.address}
                </div>
              </Popup>
            </Marker>
          </MapContainer>
          
          {/* Legend */}
          <div className="absolute bottom-8 right-8 bg-white bg-opacity-90 p-4 rounded-lg shadow-lg z-[1000]">
            <h4 className="font-bold text-sm mb-3">Suitability Score</h4>
            <div className="space-y-2">
              <div className="flex items-center">
                <div className="w-6 h-4 mr-2" style={{backgroundColor: '#2ca25f'}}></div>
                <span className="text-xs">High (8-10)</span>
              </div>
              <div className="flex items-center">
                <div className="w-6 h-4 mr-2" style={{backgroundColor: '#7fc97f'}}></div>
                <span className="text-xs">Good (6-8)</span>
              </div>
              <div className="flex items-center">
                <div className="w-6 h-4 mr-2" style={{backgroundColor: '#fed976'}}></div>
                <span className="text-xs">Medium (4-6)</span>
              </div>
              <div className="flex items-center">
                <div className="w-6 h-4 mr-2" style={{backgroundColor: '#feb24c'}}></div>
                <span className="text-xs">Fair (2-4)</span>
              </div>
              <div className="flex items-center">
                <div className="w-6 h-4 mr-2" style={{backgroundColor: '#f03b20'}}></div>
                <span className="text-xs">Low (0-2)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Location Info */}
        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-900 mb-2">Your Location Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-blue-700">Address:</span>
              <div className="font-medium text-gray-800">{appData.location.address}</div>
            </div>
            <div>
              <span className="text-blue-700">Coordinates:</span>
              <div className="font-medium text-gray-800">
                {userLocation.lat.toFixed(6)}, {userLocation.lng.toFixed(6)}
              </div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={nextStep}
            className="bg-green-600 text-white py-3 px-8 rounded-lg font-semibold text-lg hover:bg-green-700 transition-colors shadow-lg"
          >
            Continue to Roof Details →
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default SiteSuitabilityMap;