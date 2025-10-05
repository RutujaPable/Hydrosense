
class BuildingDetectionService {
  constructor() {
    this.sources = [
      { name: 'OpenStreetMap', method: this.getFromOSM },
      { name: 'Satellite Analysis', method: this.getFromSatellite },
      { name: 'Estimation', method: this.getEstimate }
    ];
  }

  async detectBuilding(lat, lng) {
    for (const source of this.sources) {
      try {
        console.log(`Trying ${source.name}...`);
        const result = await source.method.call(this, lat, lng);
        if (result && result > 20) {
          return {
            area: result,
            source: source.name,
            confidence: this.getConfidence(source.name)
          };
        }
      } catch (error) {
        console.log(`${source.name} failed:`, error.message);
        continue;
      }
    }
    
    throw new Error('All detection methods failed');
  }

  async getFromOSM(lat, lng) {
    const overpassQuery = `
      [out:json][timeout:10];
      (
        way["building"](around:30,${lat},${lng});
        relation["building"](around:30,${lat},${lng});
      );
      out geom;
    `;
    
    const response = await fetch(
      `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQuery)}`,
      { timeout: 10000 }
    );
    
    if (!response.ok) throw new Error('OSM request failed');
    
    const data = await response.json();
    
    if (data.elements && data.elements.length > 0) {
      const building = data.elements[0];
      
      if (building.geometry) {
        // Calculate area from polygon coordinates
        return this.calculatePolygonArea(building.geometry);
      } else if (building.nodes) {
        // Handle way format
        return this.estimateFromNodes(building.nodes);
      }
    }
    
    throw new Error('No building found in OSM');
  }

  calculatePolygonArea(coordinates) {
    let area = 0;
    const coords = coordinates.map(coord => [coord.lat, coord.lon]);
    
    for (let i = 0; i < coords.length - 1; i++) {
      const [lat1, lon1] = coords[i];
      const [lat2, lon2] = coords[i + 1];
      area += (lon2 - lon1) * (lat2 + lat1);
    }
    
    area = Math.abs(area) / 2;
    
    // Convert to square meters (rough approximation)
    const metersPerDegree = 111000;
    return Math.round(area * metersPerDegree * metersPerDegree);
  }

  async getFromSatellite(lat, lng) {
    // Your existing satellite detection code (simplified)
    const zoom = 19;
    const n = 2 ** zoom;
    const x = Math.floor((lng + 180) / 360 * n);
    const y = Math.floor((1 - Math.asinh(Math.tan(lat * Math.PI / 180)) / Math.PI) / 2 * n);
    
    // Try multiple tile sources
    const tileSources = [
      `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${zoom}/${y}/${x}`,
      `https://mt1.google.com/vt/lyrs=s&x=${x}&y=${y}&z=${zoom}` // May have CORS issues
    ];
    
    for (const tileUrl of tileSources) {
      try {
        const area = await this.analyzeImage(tileUrl, lat, zoom);
        if (area > 0) return area;
      } catch (error) {
        continue;
      }
    }
    
    throw new Error('Satellite analysis failed');
  }

  async analyzeImage(imageUrl, lat, zoom) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        // Simple center-based analysis
        const area = this.simpleAreaEstimate(canvas, lat, zoom);
        resolve(area);
      };
      
      img.onerror = () => reject(new Error('Image load failed'));
      
      setTimeout(() => reject(new Error('Image load timeout')), 5000);
      img.src = imageUrl;
    });
  }

  simpleAreaEstimate(canvas, lat, zoom) {
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const sampleSize = 40;
    
    const imageData = ctx.getImageData(
      centerX - sampleSize/2, 
      centerY - sampleSize/2, 
      sampleSize, 
      sampleSize
    );
    
    let buildingPixels = 0;
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      if (this.isBuildingPixel(r, g, b)) {
        buildingPixels++;
      }
    }
    
    const metersPerPixel = 156543.03392 * Math.cos(lat * Math.PI / 180) / Math.pow(2, zoom);
    const areaPerPixel = metersPerPixel * metersPerPixel;
    
    // Scale up from sample to estimated building size
    const estimatedArea = (buildingPixels / (sampleSize * sampleSize)) * 2500 * areaPerPixel;
    
    return Math.max(30, Math.min(400, Math.round(estimatedArea)));
  }

  isBuildingPixel(r, g, b) {
    const gray = (r + g + b) / 3;
    
    // Detect various building materials
    return (
      (gray > 80 && gray < 200) || // Gray roofs
      (r > g + 20 && r > 100) || // Red roofs  
      (gray > 200) // Light roofs
    );
  }

  async getEstimate(lat, lng) {
    // Fallback estimation based on location type
    // This uses geocoding to determine if it's residential/commercial
    
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
    );
    
    const data = await response.json();
    
    if (data.address) {
      const { house_number, residential, commercial } = data.address;
      
      if (house_number || residential) {
        return 120; // Typical residential
      } else if (commercial) {
        return 300; // Typical commercial
      }
    }
    
    return 100; // Generic fallback
  }

  getConfidence(source) {
    switch (source) {
      case 'OpenStreetMap': return 'High';
      case 'Satellite Analysis': return 'Medium';
      case 'Estimation': return 'Low';
      default: return 'Low';
    }
  }
}

export default BuildingDetectionService;


