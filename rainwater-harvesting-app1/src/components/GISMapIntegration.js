import React, { useState, useContext, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Polygon, useMapEvents, useMap } from 'react-leaflet';
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

// Component to center map on location
function MapCenter({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, 19);
    }
  }, [center, map]);
  return null;
}

const DraggablePolygon = ({ positions, setPositions }) => {
  const [dragging, setDragging] = useState(null);
  const markersRef = useRef([]);

  const map = useMapEvents({
    mousemove(e) {
      if (dragging !== null) {
        const newPositions = [...positions];
        newPositions[dragging] = [e.latlng.lat, e.latlng.lng];
        setPositions(newPositions);
      }
    },
    mouseup() {
      setDragging(null);
    }
  });

  useEffect(() => {
    markersRef.current.forEach(marker => {
      if (map.hasLayer(marker)) {
        map.removeLayer(marker);
      }
    });
    markersRef.current = [];

    positions.forEach((position, index) => {
      const marker = L.circleMarker(position, {
        radius: 8,
        fillColor: '#ef4444',
        color: '#ffffff',
        weight: 2,
        fillOpacity: 1,
        draggable: false
      });

      marker.on('mousedown', (e) => {
        e.originalEvent.preventDefault();
        setDragging(index);
      });

      marker.addTo(map);
      markersRef.current.push(marker);
    });

    return () => {
      markersRef.current.forEach(marker => {
        if (map.hasLayer(marker)) {
          map.removeLayer(marker);
        }
      });
    };
  }, [positions, map, setDragging]);

  return (
    <Polygon
      positions={positions}
      pathOptions={{
        color: '#3b82f6',
        fillColor: '#93c5fd',
        fillOpacity: 0.4,
        weight: 2
      }}
    />
  );
};

const GISMapIntegration = () => {
  const { appData, updateAppData, nextStep } = useContext(AppContext);
  const [roofBoundary, setRoofBoundary] = useState([]);
  const [calculatedArea, setCalculatedArea] = useState(0);

  useEffect(() => {
    if (appData.location && appData.location.coordinates && appData.roofArea && !roofBoundary.length) {
      const { lat, lng } = appData.location.coordinates;
      const areaInSqM = appData.roofArea;
      
      const sideLength = Math.sqrt(areaInSqM);
      const offset = (sideLength / 111000);
      
      const initialBoundary = [
        [lat + offset/2, lng - offset/2],
        [lat + offset/2, lng + offset/2],
        [lat - offset/2, lng + offset/2],
        [lat - offset/2, lng - offset/2]
      ];
      
      setRoofBoundary(initialBoundary);
    }
  }, [appData.location, appData.roofArea, roofBoundary.length]);

  useEffect(() => {
    if (roofBoundary.length > 2) {
      const area = calculatePolygonArea(roofBoundary);
      setCalculatedArea(area);
    }
  }, [roofBoundary]);

  const calculatePolygonArea = (coordinates) => {
    if (coordinates.length < 3) return 0;
    
    let area = 0;
    for (let i = 0; i < coordinates.length; i++) {
      const j = (i + 1) % coordinates.length;
      area += coordinates[i][0] * coordinates[j][1];
      area -= coordinates[j][0] * coordinates[i][1];
    }
    area = Math.abs(area) / 2;
    
    const metersPerDegree = 111000;
    return area * metersPerDegree * metersPerDegree;
  };

  const handleConfirm = () => {
    if (roofBoundary.length > 2) {
      updateAppData({
        roofBoundary,
        roofArea: Math.round(calculatedArea)
      });
      nextStep();
    }
  };

  const resetBoundary = () => {
    if (appData.location && appData.location.coordinates && appData.roofArea) {
      const { lat, lng } = appData.location.coordinates;
      const areaInSqM = appData.roofArea;
      const sideLength = Math.sqrt(areaInSqM);
      const offset = (sideLength / 111000);
      
      const resetBoundary = [
        [lat + offset/2, lng - offset/2],
        [lat + offset/2, lng + offset/2],
        [lat - offset/2, lng + offset/2],
        [lat - offset/2, lng - offset/2]
      ];
      
      setRoofBoundary(resetBoundary);
    }
  };

  if (!appData.location || !appData.location.coordinates) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">Location data not available. Please go back and set your location.</p>
            <button
              onClick={() => window.history.back()}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const mapCenter = [appData.location.coordinates.lat, appData.location.coordinates.lng];

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg p-8"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Map Your Rooftop
          </h2>
          <p className="text-gray-600">
            Adjust the boundary markers to match your actual roof area
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Interactive Map</h3>
              
              {roofBoundary.length > 0 && (
                <MapContainer
                  center={mapCenter}
                  zoom={19}
                  scrollWheelZoom={true}
                  className="rounded-lg"
                  style={{ height: '400px', width: '100%' }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <MapCenter center={mapCenter} />
                  <DraggablePolygon 
                    positions={roofBoundary} 
                    setPositions={setRoofBoundary} 
                  />
                </MapContainer>
              )}
            </div>

            <div className="flex flex-wrap gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={resetBoundary}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Reset Boundary
              </motion.button>
              
              <div className="flex items-center text-sm text-gray-600">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                Drag the red corners to adjust your roof boundary
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-4 space-y-6">
              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Measurements</h3>
                
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-600">Original Estimate</div>
                    <div className="text-2xl font-bold text-blue-600">{appData.roofArea} m²</div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-gray-600">Mapped Area</div>
                    <div className="text-2xl font-bold text-purple-600">
                      {Math.round(calculatedArea)} m²
                    </div>
                  </div>
                  
                  {calculatedArea > 0 && (
                    <div className="pt-3 border-t border-blue-200">
                      <div className="text-sm text-gray-600">Difference</div>
                      <div className={`text-lg font-semibold ${
                        Math.round(calculatedArea) > appData.roofArea ? 'text-green-600' : 'text-orange-600'
                      }`}>
                        {Math.round(calculatedArea) > appData.roofArea ? '+' : ''}{Math.round(calculatedArea - appData.roofArea)} m²
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Potential Preview</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Per mm rainfall:</span>
                    <span className="font-semibold">{Math.round(calculatedArea * 0.8)}L</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Annual potential*:</span>
                    <span className="font-semibold text-green-600">
                      {Math.round(calculatedArea * 0.8 * 800)}L
                    </span>
                  </div>
                  
                  <div className="text-xs text-gray-500 mt-2">
                    *Based on 800mm average rainfall
                  </div>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleConfirm}
                disabled={roofBoundary.length < 3}
                className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Confirm Boundary →
              </motion.button>
              
              {roofBoundary.length > 0 && (
                <div className="text-center">
                  <span className="text-sm text-gray-500">
                    {roofBoundary.length} corners mapped
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default GISMapIntegration;