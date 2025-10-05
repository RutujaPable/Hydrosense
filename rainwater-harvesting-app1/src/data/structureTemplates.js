
export const structureTemplates = {
  recharge_pit: {
    id: 'recharge_pit',
    name: 'Recharge Pit',
    icon: '🕳️',
    description: 'Deep excavated pit filled with filter media for groundwater recharge',
    suitability: ['Small to medium roofs', 'Clay soil', 'Urban areas'],
    efficiency: 85,
    maintenance: 'Low',
    costRange: { min: 15000, max: 25000 },
    materials: [
      { item: 'Excavation', unit: 'cubic meter', rate: 300 },
      { item: 'Boulder (60-80mm)', unit: 'cubic meter', rate: 750 },
      { item: 'Gravel (20-40mm)', unit: 'cubic meter', rate: 800 },
      { item: 'Coarse Sand', unit: 'cubic meter', rate: 800 },
      { item: 'Geotextile Fabric', unit: 'square meter', rate: 60 },
      { item: 'PVC Pipes', unit: 'set', rate: 2000 }
    ]
  },
  recharge_trench: {
    id: 'recharge_trench',
    name: 'Recharge Trench',
    icon: '📏',
    description: 'Long shallow trench with gravel and sand layers for water infiltration',
    suitability: ['Large roofs', 'Sandy soil', 'Rural areas'],
    efficiency: 75,
    maintenance: 'Medium',
    costRange: { min: 20000, max: 35000 },
    materials: [
      { item: 'Excavation', unit: 'cubic meter', rate: 300 },
      { item: 'Boulder (40-60mm)', unit: 'cubic meter', rate: 750 },
      { item: 'Gravel (10-20mm)', unit: 'cubic meter', rate: 800 },
      { item: 'Perforated Pipes', unit: 'meter', rate: 150 },
      { item: 'Geotextile Membrane', unit: 'square meter', rate: 60 }
    ]
  },
  recharge_well: {
    id: 'recharge_well',
    name: 'Recharge Well',
    icon: '🔵',
    description: 'Vertical well structure for direct aquifer recharge',
    suitability: ['Deep water table', 'Hard rock aquifers', 'Commercial buildings'],
    efficiency: 90,
    maintenance: 'High',
    costRange: { min: 25000, max: 40000 },
    materials: [
      { item: 'Drilling', unit: 'meter', rate: 800 },
      { item: 'Concrete Rings', unit: 'piece', rate: 600 },
      { item: 'Gravel Pack', unit: 'cubic meter', rate: 800 },
      { item: 'Settling Chamber', unit: 'unit', rate: 3000 },
      { item: 'First Flush Diverter', unit: 'unit', rate: 1500 }
    ]
  }
};

export const getRecommendedStructure = (roofArea, availableSpace, soilType) => {
  if (roofArea > 200 && availableSpace === 'large') {
    return structureTemplates.recharge_trench;
  } else if (roofArea > 150 && soilType === 'hardrock') {
    return structureTemplates.recharge_well;
  } else {
    return structureTemplates.recharge_pit;
  }
};


