
import React, { useState, useContext, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppContext } from '../App';

const AIAssessment = () => {
  const { appData, updateAppData, nextStep } = useContext(AppContext);
  const [calculationStep, setCalculationStep] = useState(0);
  const [showFormula, setShowFormula] = useState(false);
  const [harvestPotential, setHarvestPotential] = useState(0);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [intermediateResults, setIntermediateResults] = useState({});

  const calculationSteps = [
    {
      title: "Analyzing Catchment Area",
      description: "Processing rooftop dimensions",
      icon: "🏠",
      duration: 2000
    },
    {
      title: "Calculating Runoff Coefficient",
      description: "Considering roof material and efficiency",
      icon: "💧",
      duration: 1500
    },
    {
      title: "Processing Rainfall Data",
      description: "Integrating local precipitation patterns",
      icon: "🌧️",
      duration: 1800
    },
    {
      title: "Computing Harvest Potential",
      description: "Finalizing annual collection capacity",
      icon: "📊",
      duration: 2200
    }
  ];

  useEffect(() => {
    const performCalculations = async () => {
      const roofArea = appData.roofArea || 100;
      const rainfall = appData.rainfallData?.annualAverage || 850;
      
      // Step 1: Catchment Area Analysis
      setCalculationStep(0);
      await new Promise(resolve => setTimeout(resolve, calculationSteps[0].duration));
      
      const effectiveArea = roofArea * 0.95; // Account for parapets, etc.
      setIntermediateResults(prev => ({ ...prev, effectiveArea }));

      // Step 2: Runoff Coefficient Calculation
      setCalculationStep(1);
      await new Promise(resolve => setTimeout(resolve, calculationSteps[1].duration));
      
      // Runoff coefficient based on roof material (assuming concrete/metal roof)
      const runoffCoefficient = 0.8; // Typical for hard surfaces
      setIntermediateResults(prev => ({ ...prev, runoffCoefficient }));

      // Step 3: Rainfall Data Processing
      setCalculationStep(2);
      await new Promise(resolve => setTimeout(resolve, calculationSteps[2].duration));
      
      const monsoonFactor = appData.rainfallData?.reliability || 0.8;
      const adjustedRainfall = rainfall * monsoonFactor;
      setIntermediateResults(prev => ({ ...prev, adjustedRainfall, rainfall }));

      // Step 4: Final Calculation
      setCalculationStep(3);
      setShowFormula(true);
      
      await new Promise(resolve => setTimeout(resolve, 1000)); // Show formula
      
      // Rainwater Harvesting Formula: Area × Rainfall × Runoff Coefficient
      const annualPotential = effectiveArea * (adjustedRainfall / 1000) * runoffCoefficient; // Convert mm to meters
      const finalPotential = Math.round(annualPotential * 1000); // Convert to liters
      
      await new Promise(resolve => setTimeout(resolve, calculationSteps[3].duration - 1000));
      
      setHarvestPotential(finalPotential);
      setShowFormula(false);
      
      // Additional calculations
      const monthlyAverage = Math.round(finalPotential / 12);
      const dailyAverage = Math.round(finalPotential / 365);
      const familyBenefit = Math.round(finalPotential / (appData.familySize * 150 * 365) * 100); // % of daily water need
      
      const assessmentResults = {
        annualPotential: finalPotential,
        monthlyAverage,
        dailyAverage,
        familyBenefit,
        efficiency: runoffCoefficient,
        reliability: monsoonFactor,
        calculation: {
          area: effectiveArea,
          rainfall: adjustedRainfall,
          coefficient: runoffCoefficient,
          formula: "Area × Rainfall × Coefficient"
        }
      };

      updateAppData({ harvestPotential: assessmentResults });
      
      setTimeout(() => {
        setAnalysisComplete(true);
      }, 1500);
    };

    if (appData.rainfallData && appData.groundwaterData) {
      performCalculations();
    }
  }, [appData, updateAppData]);

  const handleContinue = () => {
    nextStep();
  };

  const getPotentialCategory = (potential) => {
    if (potential < 5000) return { category: 'Low', color: 'text-orange-600', bg: 'bg-orange-50' };
    if (potential < 15000) return { category: 'Moderate', color: 'text-blue-600', bg: 'bg-blue-50' };
    if (potential < 30000) return { category: 'High', color: 'text-green-600', bg: 'bg-green-50' };
    return { category: 'Excellent', color: 'text-purple-600', bg: 'bg-purple-50' };
  };

  const potentialInfo = getPotentialCategory(harvestPotential);

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg p-8"
      >
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            AI-Powered Assessment
          </h2>
          <p className="text-gray-600">
            Computing your rainwater harvesting potential
          </p>
        </div>

        {/* Calculation Progress */}
        {!analysisComplete && (
          <div className="mb-8">
            {calculationSteps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ 
                  opacity: index <= calculationStep ? 1 : 0.5, 
                  x: 0,
                  scale: index === calculationStep ? 1.02 : 1
                }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className={`flex items-center p-4 mb-4 rounded-lg transition-all ${
                  index === calculationStep 
                    ? 'bg-blue-50 border-2 border-blue-200' 
                    : index < calculationStep
                      ? 'bg-green-50 border-2 border-green-200'
                      : 'bg-gray-50 border-2 border-gray-200'
                }`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl mr-4 ${
                  index === calculationStep
                    ? 'bg-blue-500 text-white animate-pulse'
                    : index < calculationStep
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-400 text-white'
                }`}>
                  {index < calculationStep ? '✓' : step.icon}
                </div>

                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800">{step.title}</h3>
                  <p className="text-sm text-gray-600">{step.description}</p>
                  
                  {index === calculationStep && (
                    <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                      <motion.div
                        className="bg-blue-600 h-2 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        transition={{ duration: step.duration / 1000, ease: "easeInOut" }}
                      />
                    </div>
                  )}
                </div>

                {/* Real-time results display */}
                {index < calculationStep && intermediateResults && (
                  <div className="ml-4 text-right">
                    {index === 0 && (
                      <div className="text-sm text-gray-600">
                        <div>{Math.round(intermediateResults.effectiveArea)} m²</div>
                      </div>
                    )}
                    {index === 1 && (
                      <div className="text-sm text-gray-600">
                        <div>{(intermediateResults.runoffCoefficient * 100)}%</div>
                      </div>
                    )}
                    {index === 2 && (
                      <div className="text-sm text-gray-600">
                        <div>{Math.round(intermediateResults.adjustedRainfall)} mm</div>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}

        {/* Formula Overlay */}
        <AnimatePresence>
          {showFormula && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            >
              <motion.div
                initial={{ y: 50 }}
                animate={{ y: 0 }}
                className="bg-white rounded-xl p-8 max-w-lg mx-4 shadow-2xl"
              >
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">
                    Harvesting Formula
                  </h3>
                  <div className="bg-blue-50 rounded-lg p-6 mb-4">
                    <div className="text-lg font-mono text-blue-800">
                      Annual Potential = Area × Rainfall × Coefficient
                    </div>
                    <div className="text-sm text-gray-600 mt-2">
                      {Math.round(intermediateResults.effectiveArea)} m² × {Math.round(intermediateResults.adjustedRainfall)} mm × {intermediateResults.runoffCoefficient}
                    </div>
                  </div>
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-gray-600">Calculating...</span>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Display */}
        {analysisComplete && harvestPotential > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            {/* Main Result */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, duration: 0.8, type: "spring", bounce: 0.5 }}
                className="mb-6"
              >
                <div className={`inline-block px-6 py-3 rounded-full text-sm font-medium mb-4 ${potentialInfo.color} ${potentialInfo.bg}`}>
                  {potentialInfo.category} Potential
                </div>
                <div className="text-6xl font-bold text-green-600 mb-2">
                  {harvestPotential.toLocaleString()}L
                </div>
                <div className="text-xl text-gray-600">
                  Annual Rainwater Harvesting Potential
                </div>
              </motion.div>
            </div>

            {/* Detailed Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.5 }}
                className="bg-blue-50 rounded-lg p-6 text-center"
              >
                <div className="text-3xl font-bold text-blue-600">
                  {Math.round(harvestPotential / 12).toLocaleString()}L
                </div>
                <div className="text-gray-600 font-medium">Monthly Average</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                className="bg-green-50 rounded-lg p-6 text-center"
              >
                <div className="text-3xl font-bold text-green-600">
                  {Math.round(harvestPotential / 365)}L
                </div>
                <div className="text-gray-600 font-medium">Daily Average</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.5 }}
                className="bg-purple-50 rounded-lg p-6 text-center"
              >
                <div className="text-3xl font-bold text-purple-600">
                  {Math.round(harvestPotential / (appData.familySize * 150 * 365) * 100)}%
                </div>
                <div className="text-gray-600 font-medium">Family Water Need</div>
              </motion.div>
            </div>

            {/* Technical Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0, duration: 0.5 }}
              className="bg-gray-50 rounded-lg p-6 mb-8"
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Calculation Details
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Roof Area:</span>
                  <div className="font-semibold">{appData.roofArea} m²</div>
                </div>
                <div>
                  <span className="text-gray-600">Annual Rainfall:</span>
                  <div className="font-semibold">{Math.round(appData.rainfallData.annualAverage)} mm</div>
                </div>
                <div>
                  <span className="text-gray-600">Runoff Efficiency:</span>
                  <div className="font-semibold">{(intermediateResults.runoffCoefficient * 100)}%</div>
                </div>
                <div>
                  <span className="text-gray-600">Reliability:</span>
                  <div className="font-semibold">{Math.round(appData.rainfallData.reliability * 100)}%</div>
                </div>
              </div>
            </motion.div>

            {/* Continue Button */}
            <div className="text-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleContinue}
                className="bg-green-600 text-white py-3 px-8 rounded-lg font-semibold text-lg hover:bg-green-700 transition-colors shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.5 }}
              >
                View Structure Recommendations →
              </motion.button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default AIAssessment;

