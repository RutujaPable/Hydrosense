
export const groundwaterData = {
  regions: {
    'alluvial': {
      depthToWater: 8,
      waterLevel: 'Moderate',
      aquiferType: 'Alluvium',
      rechargeRate: 0.25,
      soilType: 'Sandy Loam',
      permeability: 'Good'
    },
    'hardrock': {
      depthToWater: 15,
      waterLevel: 'Deep',
      aquiferType: 'Hard Rock',
      rechargeRate: 0.15,
      soilType: 'Rocky',
      permeability: 'Fair'
    },
    'coastal': {
      depthToWater: 5,
      waterLevel: 'Shallow',
      aquiferType: 'Coastal Alluvium',
      rechargeRate: 0.3,
      soilType: 'Sandy',
      permeability: 'Excellent'
    }
  },

  getGroundwaterForLocation: (lat, lng) => {
    // Simplified logic - in reality, this would use geological survey data
    if (lat > 25 && lng > 75) return groundwaterData.regions.alluvial;
    if (lat < 20) return groundwaterData.regions.coastal;
    return groundwaterData.regions.hardrock;
  }
};

