
import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { AppContext } from '../App';
import BuildingDetectionService from '../services/buildingDetection';

const AutoRoofDetection = ({ onDetectionComplete }) => {
  const { appData } = useContext(AppContext);
  const [detecting, setDetecting] = useState(false);
  const [detectionResult, setDetectionResult] = useState(null);
  const [error, setError] = useState('');
  

  const detectRoofArea = async (lat, lng) => {
    // Get satellite image from tile service
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    return new Promise((resolve, reject) => {
      // Calculate tile coordinates for zoom level 19
      const zoom = 19;
      const n = 2 ** zoom;
      const x = Math.floor((lng + 180) / 360 * n);
      const y = Math.floor((1 - Math.asinh(Math.tan(lat * Math.PI / 180)) / Math.PI) / 2 * n);
      
      // Use Esri satellite tiles (free)
      const tileUrl = `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${zoom}/${y}/${x}`;
      
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        // Process the image to detect roof area
        const roofArea = processImageForRoof(canvas, lat, zoom);
        resolve(roofArea);
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load satellite image'));
      };
      
      img.src = tileUrl;
    });
  };

const processImageForRoof = (canvas, lat, zoom) => {
  const ctx = canvas.getContext('2d');
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  
  // Create a more sophisticated roof detection
  const roofRegions = findRoofRegions(imageData);
  const largestRoof = findLargestRoof(roofRegions);
  
  if (largestRoof.area === 0) {
    // Fallback to center-based detection with smaller search area
    return estimateFromCenter(canvas, lat, zoom);
  }
  
  // Convert pixels to square meters
  const metersPerPixel = 156543.03392 * Math.cos(lat * Math.PI / 180) / Math.pow(2, zoom);
  const areaPerPixel = metersPerPixel * metersPerPixel;
  const estimatedArea = largestRoof.area * areaPerPixel;
  
  // Remove the artificial clamping and use more realistic bounds
  return Math.max(20, Math.min(2000, Math.round(estimatedArea)));
};

const findRoofRegions = (imageData) => {
  const { data, width, height } = imageData;
  const visited = new Array(width * height).fill(false);
  const regions = [];
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const index = y * width + x;
      if (!visited[index]) {
        const pixelIndex = index * 4;
        const r = data[pixelIndex];
        const g = data[pixelIndex + 1];
        const b = data[pixelIndex + 2];
        
        if (isRoofColor(r, g, b)) {
          const region = floodFill(data, width, height, x, y, visited);
          if (region.area > 50) { // Only consider regions with substantial area
            regions.push(region);
          }
        }
      }
    }
  }
  
  return regions;
};

const floodFill = (data, width, height, startX, startY, visited) => {
  const stack = [{x: startX, y: startY}];
  const region = {area: 0, pixels: []};
  const startIndex = (startY * width + startX) * 4;
  const targetColor = {
    r: data[startIndex],
    g: data[startIndex + 1], 
    b: data[startIndex + 2]
  };
  
  while (stack.length > 0) {
    const {x, y} = stack.pop();
    
    if (x < 0 || x >= width || y < 0 || y >= height) continue;
    
    const index = y * width + x;
    if (visited[index]) continue;
    
    const pixelIndex = index * 4;
    const r = data[pixelIndex];
    const g = data[pixelIndex + 1];
    const b = data[pixelIndex + 2];
    
    // Check if pixel is similar to target color and is roof-like
    if (isRoofColor(r, g, b) && colorSimilar(targetColor, {r, g, b}, 30)) {
      visited[index] = true;
      region.area++;
      region.pixels.push({x, y});
      
      // Add neighbors
      stack.push({x: x + 1, y});
      stack.push({x: x - 1, y});
      stack.push({x, y: y + 1});
      stack.push({x, y: y - 1});
    }
  }
  
  return region;
};

const colorSimilar = (color1, color2, threshold) => {
  const diff = Math.sqrt(
    Math.pow(color1.r - color2.r, 2) +
    Math.pow(color1.g - color2.g, 2) +
    Math.pow(color1.b - color2.b, 2)
  );
  return diff < threshold;
};

const findLargestRoof = (regions) => {
  if (regions.length === 0) return {area: 0, pixels: []};
  
  return regions.reduce((largest, current) => 
    current.area > largest.area ? current : largest
  );
};

const estimateFromCenter = (canvas, lat, zoom) => {
  const ctx = canvas.getContext('2d');
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  
  // Sample from multiple areas, not just center
  const sampleAreas = [
    {x: canvas.width * 0.4, y: canvas.height * 0.4, radius: 30},
    {x: canvas.width * 0.5, y: canvas.height * 0.5, radius: 35},
    {x: canvas.width * 0.6, y: canvas.height * 0.6, radius: 30}
  ];
  
  let totalRoofPixels = 0;
  let totalSampledPixels = 0;
  
  for (const area of sampleAreas) {
    const areaPixels = sampleCircularArea(data, canvas.width, canvas.height, area.x, area.y, area.radius);
    totalRoofPixels += areaPixels.roofPixels;
    totalSampledPixels += areaPixels.totalPixels;
  }
  
  if (totalSampledPixels === 0) return 80; // Default fallback
  
  const roofRatio = totalRoofPixels / totalSampledPixels;
  const metersPerPixel = 156543.03392 * Math.cos(lat * Math.PI / 180) / Math.pow(2, zoom);
  const areaPerPixel = metersPerPixel * metersPerPixel;
  
  // Estimate total roof area based on ratio and typical residential lot size
  const estimatedTotalArea = roofRatio * (canvas.width * canvas.height) * areaPerPixel;
  
  return Math.max(30, Math.min(800, Math.round(estimatedTotalArea * 0.3))); // Assume roof is ~30% of visible area
};

const sampleCircularArea = (data, width, height, centerX, centerY, radius) => {
  let roofPixels = 0;
  let totalPixels = 0;
  
  for (let y = centerY - radius; y <= centerY + radius; y++) {
    for (let x = centerX - radius; x <= centerX + radius; x++) {
      const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
      
      if (distance <= radius && x >= 0 && x < width && y >= 0 && y < height) {
        const index = (Math.floor(y) * width + Math.floor(x)) * 4;
        const r = data[index];
        const g = data[index + 1];
        const b = data[index + 2];
        
        totalPixels++;
        if (isRoofColor(r, g, b)) {
          roofPixels++;
        }
      }
    }
  }
  
  return { roofPixels, totalPixels };
};
const isRoofColor = (r, g, b) => {
  const gray = (r + g + b) / 3;
  const variance = Math.sqrt(((r - gray) ** 2 + (g - gray) ** 2 + (b - gray) ** 2) / 3);
  
  // More precise roof color detection
  
  // Concrete/gray roofs - common in urban areas
  if (gray > 70 && gray < 180 && variance < 25) {
    return true;
  }
  
  // Terra cotta/clay tile roofs - reddish brown
  if (r > g + 15 && r > b + 10 && r > 80 && r < 200) {
    return true;
  }
  
  // Metal roofs - often have slight blue or green tint
  if (Math.abs(r - g) < 15 && Math.abs(g - b) < 15 && gray > 90 && gray < 170) {
    return true;
  }
  
  // Dark asphalt shingles
  if (gray < 70 && variance < 15) {
    return true;
  }
  
  // White/light colored roofs
  if (gray > 200 && variance < 20) {
    return true;
  }
  
  return false;
};

  const detectionService = new BuildingDetectionService();

  const handleAutoDetect = async () => {
    if (!appData.location) {
      setError('Location not available. Please set your location first.');
      return;
    }

    setDetecting(true);
    setError('');
    setDetectionResult(null);

    try {
      const { lat, lng } = appData.location.coordinates;
      const result = await detectionService.detectBuilding(lat, lng);
      
      setDetectionResult({
        area: result.area,
        confidence: result.confidence,
        method: result.source
      });

      if (onDetectionComplete) {
        onDetectionComplete(result.area);
      }
    } catch (error) {
      setError('Detection failed: ' + error.message);
    } finally {
      setDetecting(false);
    }
  };
  return (
    <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        <svg className="w-6 h-6 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
        AI Roof Detection
      </h3>
      
      <p className="text-gray-600 mb-4">
        Automatically detect your roof area using real satellite imagery analysis.
      </p>

      {!detectionResult && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleAutoDetect}
          disabled={detecting || !appData.location}
          className="bg-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
        >
          {detecting ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Analyzing Satellite Image...
            </>
          ) : (
            <>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Detect Roof from Satellite
            </>
          )}
        </motion.button>
      )}

      {detectionResult && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-lg p-4 border border-purple-200"
        >
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-gray-800">Detection Complete</h4>
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
              detectionResult.confidence === 'High' 
                ? 'bg-green-100 text-green-800' 
                : detectionResult.confidence === 'Medium'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {detectionResult.confidence} Confidence
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Detected Area:</span>
              <div className="text-2xl font-bold text-purple-600">{detectionResult.area} m²</div>
            </div>
            <div>
              <span className="text-gray-600">Method:</span>
              <div className="font-semibold text-gray-800">{detectionResult.method}</div>
            </div>
          </div>
          
          <div className="mt-3 text-xs text-yellow-600 bg-yellow-50 p-2 rounded">
            Note: Automated detection provides estimates. Please verify and adjust if needed based on your actual roof dimensions.
          </div>
          
          <button
            onClick={() => {
              setDetectionResult(null);
              setError('');
            }}
            className="mt-3 text-purple-600 hover:text-purple-700 text-sm font-medium"
          >
            Detect Again
          </button>
        </motion.div>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mt-4"
        >
          {error}
          <div className="mt-2 text-sm">
            <strong>Alternative:</strong> You can manually enter your roof area using the slider below, or try the interactive map in the next step.
          </div>
        </motion.div>
      )}

      <div className="mt-4 text-xs text-gray-500">
        <p>• Uses real satellite imagery from Esri World Imagery</p>
        <p>• Analyzes colors and patterns to identify roof structures</p>
        <p>• Works best with clear satellite images and distinct roof colors</p>
        <p>• May not work in all browsers due to CORS restrictions</p>
      </div>
    </div>
  );
};

export default AutoRoofDetection;

