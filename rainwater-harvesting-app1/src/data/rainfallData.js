
export const rainfallData = {
  // Mock rainfall data for different regions in India
  regions: {
    'north': {
      annualAverage: 650,
      monthlyData: [25, 30, 35, 40, 50, 120, 180, 160, 100, 60, 35, 25],
      rainyDays: 65,
      reliability: 0.75
    },
    'south': {
      annualAverage: 920,
      monthlyData: [40, 35, 45, 80, 110, 160, 140, 130, 180, 150, 80, 60],
      rainyDays: 85,
      reliability: 0.82
    },
    'west': {
      annualAverage: 1100,
      monthlyData: [15, 20, 25, 35, 45, 280, 350, 280, 220, 80, 30, 20],
      rainyDays: 75,
      reliability: 0.85
    },
    'east': {
      annualAverage: 1400,
      monthlyData: [30, 40, 50, 70, 120, 280, 320, 300, 220, 100, 50, 40],
      rainyDays: 95,
      reliability: 0.88
    }
  },

  getRainfallForLocation: (lat, lng) => {
    // Simple logic to determine region based on coordinates
    if (lat > 26) return rainfallData.regions.north;
    if (lat < 15) return rainfallData.regions.south;
    if (lng < 77) return rainfallData.regions.west;
    return rainfallData.regions.east;
  }
};


