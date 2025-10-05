
export const calculateHarvestingPotential = (roofArea, annualRainfall, runoffCoefficient = 0.8) => {
  const annualPotential = roofArea * (annualRainfall / 1000) * runoffCoefficient * 1000;
  return Math.round(annualPotential);
};

export const calculateRunoffCoefficient = (roofType = 'concrete') => {
  const coefficients = {
    concrete: 0.8,
    metal: 0.85,
    tile: 0.75,
    asphalt: 0.7
  };
  return coefficients[roofType] || 0.8;
};

export const calculateRechargeStructureDimensions = (harvestPotential, structureType) => {
  switch (structureType) {
    case 'recharge_pit':
      const pitDepth = 3;
      const pitArea = harvestPotential / (pitDepth * 365 * 0.8);
      const sideDimension = Math.sqrt(pitArea);
      return {
        length: Math.max(2, Math.round(sideDimension)),
        width: Math.max(2, Math.round(sideDimension)),
        depth: pitDepth
      };
    
    case 'recharge_trench':
      const trenchDepth = 2;
      const trenchWidth = 1;
      const trenchLength = harvestPotential / (trenchDepth * trenchWidth * 365 * 0.75);
      return {
        length: Math.max(10, Math.round(trenchLength)),
        width: trenchWidth,
        depth: trenchDepth
      };
    
    default:
      return null;
  }
};

export const calculateCostBenefit = (structure, harvestPotential, initialCost) => {
  const waterCostPerLiter = 0.05;
  const annualWaterSavings = harvestPotential * waterCostPerLiter;
  const maintenanceCostPerYear = initialCost * 0.05;
  const netAnnualSavings = annualWaterSavings - maintenanceCostPerYear;
  const paybackPeriod = Math.ceil(initialCost / netAnnualSavings);
  
  return {
    initialCost,
    annualWaterSavings,
    maintenanceCostPerYear,
    netAnnualSavings,
    paybackPeriod
  };
};
