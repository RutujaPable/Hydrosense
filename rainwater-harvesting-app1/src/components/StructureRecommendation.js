
import React, { useContext, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AppContext } from '../App';

const structures = [
  {
    id: 'recharge_pit',
    name: 'Recharge Pit',
    icon: '🕳️',
    dimensions: '2m × 2m × 3m',
    capacity: '12 cubic meters',
    cost: '₹15,000 - ₹25,000',
    suitability: 'Medium to large roofs',
    efficiency: '85%',
    maintenance: 'Low',
    description: 'Deep excavated pit filled with filter media for groundwater recharge',
    bestFor: ['Clay soil', 'Urban areas', 'Limited space'],
    advantages: [
      'High recharge efficiency',
      'Requires minimal space',
      'Easy to construct',
      'Low maintenance cost'
    ],
    disadvantages: [
      'Higher initial cost',
      'Requires excavation',
      'Not suitable for rocky terrain'
    ]
  },
  {
    id: 'recharge_trench',
    name: 'Recharge Trench',
    icon: '📏',
    dimensions: '10m × 1m × 2m',
    capacity: '20 cubic meters',
    cost: '₹20,000 - ₹35,000',
    suitability: 'Large roofs with space',
    efficiency: '75%',
    maintenance: 'Medium',
    description: 'Long shallow trench with gravel and sand layers for water infiltration',
    bestFor: ['Sandy soil', 'Large compounds', 'Rural areas'],
    advantages: [
      'Handles large water volumes',
      'Natural filtration process',
      'Cost-effective for large areas',
      'Easy to clean and maintain'
    ],
    disadvantages: [
      'Requires more space',
      'Regular cleaning needed',
      'Lower efficiency than pits'
    ]
  },
  {
    id: 'recharge_well',
    name: 'Recharge Well',
    icon: '🔵',
    dimensions: '1m diameter × 10m deep',
    capacity: '8 cubic meters',
    cost: '₹25,000 - ₹40,000',
    suitability: 'Deep water table areas',
    efficiency: '90%',
    maintenance: 'High',
    description: 'Vertical well structure for direct aquifer recharge in deep water table areas',
    bestFor: ['Deep groundwater', 'Hard rock aquifers', 'Commercial buildings'],
    advantages: [
      'Highest recharge efficiency',
      'Direct aquifer connection',
      'Suitable for all soil types',
      'Minimal surface area required'
    ],
    disadvantages: [
      'Highest construction cost',
      'Regular maintenance required',
      'Professional installation needed'
    ]
  }
];

// New function to calculate suitability scores for each structure
const calculateSuitabilityScores = (appData) => {
  const { roofArea, availableSpace, groundwaterData } = appData;

  const getSpaceScore = (structureId) => {
    switch (structureId) {
      case 'recharge_pit':
        if (availableSpace === 'small') return 10;
        if (availableSpace === 'medium') return 8;
        if (availableSpace === 'large') return 4;
        return 2;
      case 'recharge_trench':
        if (availableSpace === 'small') return 1;
        if (availableSpace === 'medium') return 3;
        if (availableSpace === 'large') return 8;
        return 10;
      case 'recharge_well':
        if (availableSpace === 'small') return 9;
        if (availableSpace === 'medium') return 7;
        if (availableSpace === 'large') return 5;
        return 3;
      default: return 0;
    }
  };

  const getSoilScore = (structureId) => {
    const soilType = groundwaterData?.soilType || 'Sandy Loam';
    switch (structureId) {
      case 'recharge_pit':
        if (soilType === 'Sandy Loam') return 7;
        if (soilType === 'Rocky') return 3;
        if (soilType === 'Sandy') return 5;
        return 6;
      case 'recharge_trench':
        if (soilType === 'Sandy Loam') return 8;
        if (soilType === 'Rocky') return 2;
        if (soilType === 'Sandy') return 10;
        return 7;
      case 'recharge_well':
        if (soilType === 'Sandy Loam') return 6;
        if (soilType === 'Rocky') return 10;
        if (soilType === 'Sandy') return 8;
        return 7;
      default: return 0;
    }
  };

  const getGroundwaterScore = (structureId) => {
    const depth = groundwaterData?.depthToWater || 10;
    switch (structureId) {
      case 'recharge_pit':
        return depth < 10 ? 8 : (depth < 20 ? 6 : 4);
      case 'recharge_trench':
        return depth < 10 ? 9 : (depth < 20 ? 7 : 5);
      case 'recharge_well':
        return depth < 10 ? 4 : (depth < 20 ? 8 : 10);
      default: return 0;
    }
  };

  const getRoofAreaScore = (structureId) => {
    switch (structureId) {
      case 'recharge_pit':
        return roofArea < 100 ? 7 : (roofArea < 250 ? 9 : 6);
      case 'recharge_trench':
        return roofArea < 100 ? 3 : (roofArea < 250 ? 7 : 10);
      case 'recharge_well':
        return roofArea < 100 ? 5 : (roofArea < 250 ? 8 : 9);
      default: return 0;
    }
  };

  const scoredStructures = structures.map(structure => {
    const scores = {
      space: getSpaceScore(structure.id),
      soil: getSoilScore(structure.id),
      groundwater: getGroundwaterScore(structure.id),
      roof: getRoofAreaScore(structure.id),
    };
    const totalScore = scores.space + scores.soil + scores.groundwater + scores.roof;
    return { ...structure, scores, totalScore };
  });

  return scoredStructures.sort((a, b) => b.totalScore - a.totalScore);
};


const StructureRecommendation = () => {
  const { appData, updateAppData, nextStep } = useContext(AppContext);
  const [selectedStructure, setSelectedStructure] = useState(null);
  const [rankedStructures, setRankedStructures] = useState([]);

  useEffect(() => {
    const recommendations = calculateSuitabilityScores(appData);
    setRankedStructures(recommendations);
    // Pre-select the top recommendation for the user
    if (recommendations.length > 0) {
      handleStructureSelect(recommendations[0]);
    }
  }, [appData]);


  const handleStructureSelect = (structure) => {
    setSelectedStructure(structure);
    updateAppData({ selectedStructure: structure });
  };

  const handleContinue = () => {
    if (selectedStructure) {
      nextStep();
    }
  };

  if (rankedStructures.length === 0) {
    return <div>Calculating recommendations...</div>;
  }

  const recommendedId = rankedStructures[0].id;

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg p-8"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-indigo-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Choose Your Structure
          </h2>
          <p className="text-gray-600">
            Select the rainwater harvesting structure that best fits your needs
          </p>
        </div>

        {/* Recommendation Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <div className="flex items-center">
            <svg className="w-6 h-6 text-blue-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <h3 className="font-semibold text-blue-800">AI Recommendation</h3>
              <p className="text-blue-700 text-sm">
                Based on your property data, our top recommendation is the{' '}
                <strong>{structures.find(s => s.id === recommendedId)?.name}</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Structure Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {rankedStructures.map((structure, index) => (
            <motion.div
              key={structure.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ y: -5 }}
              className={`relative cursor-pointer transition-all duration-300 ${
                selectedStructure?.id === structure.id
                  ? 'transform -translate-y-2'
                  : ''
              }`}
              onClick={() => handleStructureSelect(structure)}
            >
              {/* Recommended Badge */}
              {structure.id === recommendedId && (
                <div className="absolute -top-3 -right-3 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg z-10">
                  Recommended
                </div>
              )}

              <div className={`flex flex-col h-full bg-white border-2 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all ${
                selectedStructure?.id === structure.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300'
              }`}>
                {/* Structure Icon and Name */}
                <div className="text-center mb-4">
                  <div className="text-4xl mb-2">{structure.icon}</div>
                  <h3 className="text-xl font-bold text-gray-800">{structure.name}</h3>
                </div>
                
                {/* NEW: Suitability Score */}
                <div className="mb-4 text-center">
                    <div className="text-3xl font-bold text-blue-600">{structure.totalScore}</div>
                    <div className="text-sm text-gray-500 font-medium">Suitability Score</div>
                </div>

                {/* Key Specifications */}
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-600">Space: {structure.scores.space}/10</span>
                      <span className="text-gray-600">Soil: {structure.scores.soil}/10</span>
                      <span className="text-gray-600">GW: {structure.scores.groundwater}/10</span>
                      <span className="text-gray-600">Roof: {structure.scores.roof}/10</span>
                  </div>
                </div>
                
                <div className="flex-grow space-y-3 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Efficiency:</span>
                    <span className="font-semibold text-green-600">{structure.efficiency}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Cost Range:</span>
                    <span className="font-semibold text-gray-800">{structure.cost}</span>
                  </div>
                </div>

                {/* Maintenance Level */}
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-sm text-gray-600">Maintenance:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    structure.maintenance === 'Low' ? 'bg-green-100 text-green-800' :
                    structure.maintenance === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {structure.maintenance}
                  </span>
                </div>

                {/* Selection Indicator */}
                {selectedStructure?.id === structure.id && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-4 left-4 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center"
                  >
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Selection Summary */}
        {selectedStructure && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6"
          >
            <div className="flex items-center mb-3">
              <svg className="w-6 h-6 text-green-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <h3 className="text-lg font-semibold text-green-800">
                Selected: {selectedStructure.name}
              </h3>
            </div>
            <p className="text-green-700 mb-4">{selectedStructure.description}</p>
          </motion.div>
        )}

        {/* Continue Button */}
        <div className="text-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleContinue}
            disabled={!selectedStructure}
            className="bg-indigo-600 text-white py-3 px-8 rounded-lg font-semibold text-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            View Details →
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default StructureRecommendation;

