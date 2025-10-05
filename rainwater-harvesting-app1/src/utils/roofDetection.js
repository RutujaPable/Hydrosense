
class RoofDetector {
  constructor() {
    this.backendUrl = 'http://localhost:5000';  // Backend URL
    this.isBackendAvailable = false;
    this.checkBackendHealth();
  }

  async checkBackendHealth() {
    try {
      const response = await fetch(`${this.backendUrl}/health`);
      this.isBackendAvailable = response.ok;
      console.log(`Backend health check: ${this.isBackendAvailable ? 'OK' : 'Failed'}`);
    } catch (error) {
      this.isBackendAvailable = false;
      console.warn('Backend not available, using fallback detection');
    }
  }

  async detectRoofFromCoordinates(lat, lng, zoom = 19) {
    try {
      if (this.isBackendAvailable) {
        return await this.detectWithBackend(lat, lng, zoom);
      } else {
        return await this.detectWithFrontend(lat, lng, zoom);
      }
    } catch (error) {
      console.error('Roof detection failed:', error);
      throw error;
    }
  }

  async detectWithBackend(lat, lng, zoom) {
    const response = await fetch(`${this.backendUrl}/detect_roof`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ lat, lng, zoom })
    });

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Backend detection failed');
    }

    return {
      area: result.roof_area,
      confidence: result.confidence,
      method: 'Python Backend + OpenCV'
    };
  }

  async detectWithFrontend(lat, lng, zoom) {
    // Your existing frontend detection code
    // ... (keep the existing implementation as fallback)
  }
}

export default RoofDetector;


