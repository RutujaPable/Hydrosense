
import React, { useState, useContext, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AppContext } from '../App';

const DataFetching = () => {
  const { appData, updateAppData, nextStep } = useContext(AppContext);
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState('');
  const [data, setData] = useState({
    rainfall: null,
    groundwater: null
  });

  const steps = [
    {
      title: "Fetching Local Rainfall Data",
      description: "Analyzing 1-year historical precipitation",
      icon: "🌧️",
      duration: 3000,
      key: 'rainfall'
    },
    {
      title: "Groundwater Level Analysis",
      description: "Checking subsurface water conditions",
      icon: "💧",
      duration: 2500,
      key: 'groundwater'
    },
    {
      title: "Soil Permeability Assessment",
      description: "Evaluating infiltration capacity",
      icon: "🏔️",
      duration: 2000,
      key: 'soil' // Using groundwater data for this as well
    }
  ];

  // This function now calls our backend
  const fetchRainfallData = async () => {
    const { coordinates } = appData.location;
    if (!coordinates) {
      throw new Error("Location data is missing.");
    }

    try {
      const response = await fetch(`${apiUrl}/get_weather`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ lat: coordinates.lat, lng: coordinates.lng })
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch rainfall data from backend.');
      }
      
      return result.data;
    } catch (err) {
      console.error("API call failed:", err);
      // Fallback to mock data if backend fails
      setError('Could not connect to live weather service. Using regional estimates.');
      return getMockRainfallData();
    }
  };
  
  // This remains a mock function for now, as per the PDF's scope for this step
  const fetchGroundwaterData = async () => {
    const mockGroundwaterData = {
      depthToWater: 8 + Math.random() * 25, // meters
      waterLevel: 'Moderate', // Low, Moderate, High
      aquiferType: 'Alluvium', // Alluvium, Hard Rock, etc.
      rechargeRate: 0.15 + Math.random() * 0.25,
      soilType: 'Sandy Loam',
      permeability: 'Good', // Poor, Fair, Good, Excellent
      groundwaterQuality: 'Suitable',
      seasonalVariation: 2.5 + Math.random() * 3
    };
    return mockGroundwaterData;
  };
  
  // A fallback in case the backend isn't running
  const getMockRainfallData = () => {
     return {
      annualAverage: 850 + Math.random() * 400, // mm
      monthlyData: [ { month: 'Jan', rainfall: 15 }, { month: 'Feb', rainfall: 20 }, { month: 'Mar', rainfall: 25 }, { month: 'Apr', rainfall: 35 }, { month: 'May', rainfall: 45 }, { month: 'Jun', rainfall: 120 }, { month: 'Jul', rainfall: 200 }, { month: 'Aug', rainfall: 180 }, { month: 'Sep', rainfall: 150 }, { month: 'Oct', rainfall: 80 }, { month: 'Nov', rainfall: 30 }, { month: 'Dec', rainfall: 20 } ],
      rainyDays: 75 + Math.random() * 40,
      intensity: 'Medium',
      reliability: 0.78 + Math.random() * 0.2
    };
  }

  useEffect(() => {
    const executeFetching = async () => {
      // Step 0: Rainfall
      setCurrentStep(0);
      const rainfall = await fetchRainfallData();
      setData(prev => ({...prev, rainfall}));

      // Step 1: Groundwater
      setCurrentStep(1);
      await new Promise(resolve => setTimeout(resolve, steps[1].duration));
      const groundwater = await fetchGroundwaterData();
      setData(prev => ({...prev, groundwater}));
      
      // Step 2: Soil (simulated)
      setCurrentStep(2);
      await new Promise(resolve => setTimeout(resolve, steps[2].duration));
    };

    executeFetching();
  }, []);

  // Effect to move to the next step once all data is fetched
  useEffect(() => {
    if (data.rainfall && data.groundwater) {
      updateAppData({
        rainfallData: data.rainfall,
        groundwaterData: data.groundwater
      });
      setTimeout(() => {
        nextStep();
      }, 2000);
    }
  }, [data, updateAppData, nextStep]);


  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg p-8"
      >
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-white animate-spin-slow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Analyzing Local Conditions
          </h2>
          <p className="text-gray-600">
            Fetching environmental data for accurate assessment
          </p>
        </div>
        
        {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg mb-4 text-center"
            >
              {error}
            </motion.div>
        )}

        {/* Progress Steps */}
        <div className="mb-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{
                opacity: index <= currentStep ? 1 : 0.5,
                x: 0,
                scale: index === currentStep ? 1.02 : 1
              }}
              transition={{ delay: index * 0.2, duration: 0.5 }}
              className={`flex items-center p-4 mb-4 rounded-lg transition-all ${
                index === currentStep
                  ? 'bg-blue-50 border-2 border-blue-200'
                  : data[step.key]
                    ? 'bg-green-50 border-2 border-green-200'
                    : 'bg-gray-50 border-2 border-gray-200'
              }`}
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl mr-4 ${
                index === currentStep
                  ? 'bg-blue-500 text-white animate-pulse'
                  : data[step.key]
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-400 text-white'
              }`}>
                {data[step.key] ? '✓' : step.icon}
              </div>

              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800">{step.title}</h3>
                <p className="text-sm text-gray-600">{step.description}</p>
                
                {index === currentStep && !data[step.key] && (
                  <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                    <motion.div
                      className="bg-blue-600 h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ duration: step.duration / 1000, ease: "linear" }}
                    />
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
        
        {data.rainfall && data.groundwater && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center bg-green-50 border border-green-200 rounded-lg p-6"
          >
            <div className="w-16 h-16 mx-auto mb-4 bg-green-500 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Data Analysis Complete!</h3>
            <p className="text-gray-600">
              Proceeding to calculate your rainwater harvesting potential...
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default DataFetching;

