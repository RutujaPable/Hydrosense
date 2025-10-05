import React, { useState, createContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LanguageSelector from './components/LanguageSelector';
import LocationInput from './components/LocationInput';
import RoofDataInput from './components/RoofDataInput';
import GISMapIntegration from './components/GISMapIntegration';
import DataFetching from './components/DataFetching';
import AIAssessment from './components/AIAssessment';
import StructureRecommendation from './components/StructureRecommendation';
import StructureDetails from './components/StructureDetails';
import CostBenefitAnalysis from './components/CostBenefitAnalysis';
import ReportGeneration from './components/ReportGeneration';
import MaintenanceReminder from './components/MaintenanceReminder';
import Dashboard from './components/Dashboard';
import SiteSuitabilityMap from './components/SiteSuitabilityMap';
import UserDetails from './components/UserDetails';
import './App.css';

export const AppContext = createContext();

function App() {
  const [currentStep, setCurrentStep] = useState(0);
  const [appData, setAppData] = useState({
    language: 'en',
    userName: '',
    userEmail: '',
    userPhone: '',
    propertyType: '',
    location: null,
    roofArea: 0,
    familySize: 0,
    availableSpace: '',
    roofBoundary: null,
    rainfallData: null,
    groundwaterLevel: null,
    harvestPotential: 0,
    selectedStructure: null,
    costAnalysis: null,
    reportData: null
  });

  const steps = [
    { component: LanguageSelector, title: "Select Language", icon: "🌐" },
    { component: UserDetails, title: "Personal Details", icon: "👤" },
    { component: LocationInput, title: "Location", icon: "📍" },
    { component: SiteSuitabilityMap, title: "Site Analysis", icon: "🗺️" },
    { component: RoofDataInput, title: "Roof Details", icon: "🏠" },
    { component: GISMapIntegration, title: "Map Integration", icon: "🗺️" },
    { component: DataFetching, title: "Data Analysis", icon: "📊" },
    { component: AIAssessment, title: "AI Assessment", icon: "🤖" },
    { component: StructureRecommendation, title: "Recommendations", icon: "💡" },
    { component: StructureDetails, title: "Structure Details", icon: "🔧" },
    { component: CostBenefitAnalysis, title: "Cost Analysis", icon: "💰" },
    { component: ReportGeneration, title: "Report", icon: "📄" },
    { component: MaintenanceReminder, title: "Maintenance", icon: "🔔" },
    { component: Dashboard, title: "Dashboard", icon: "📈" }
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const updateAppData = (newData) => {
    setAppData(prev => ({ ...prev, ...newData }));
  };

  const CurrentComponent = steps[currentStep].component;
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <AppContext.Provider value={{
      appData,
      updateAppData,
      nextStep,
      prevStep,
      currentStep,
      totalSteps: steps.length
    }}>
      <div className="min-h-screen pb-24">
        {/* Enhanced Header */}
        <header className="sticky top-0 z-50 glass-card border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              {/* Logo Section */}
              <div className="flex items-center space-x-4">
                <motion.div 
                  className="relative"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                    <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                </motion.div>
                
                <div>
                  <h1 className="text-2xl font-bold gradient-text">
                    HydroSense
                  </h1>
                  <p className="text-sm text-gray-600 font-medium">
                    Smart Water Solutions
                  </p>
                </div>
              </div>
              
              {/* Progress Section */}
              <div className="hidden md:flex items-center space-x-6">
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-700">
                    {steps[currentStep].title}
                  </div>
                  <div className="text-xs text-gray-500">
                    Step {currentStep + 1} of {steps.length}
                  </div>
                </div>
                
                <div className="relative w-48">
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-blue-600 to-emerald-600 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                    />
                  </div>
                  <div className="absolute -top-1 right-0 text-xs font-bold text-blue-600">
                    {Math.round(progress)}%
                  </div>
                </div>
              </div>

              {/* Mobile Progress */}
              <div className="md:hidden">
                <div className="text-sm font-semibold text-gray-700">
                  {currentStep + 1}/{steps.length}
                </div>
              </div>
            </div>

            {/* Mobile Progress Bar */}
            <div className="md:hidden mt-3">
              <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-gradient-to-r from-blue-600 to-emerald-600"
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20, scale: 0.98 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -20, scale: 0.98 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            >
              <CurrentComponent />
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Enhanced Footer Navigation */}
        <footer className="fixed bottom-0 left-0 right-0 glass-card border-t z-40">
          <div className="container mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <motion.button
                onClick={prevStep}
                disabled={currentStep === 0}
                whileHover={{ scale: currentStep === 0 ? 1 : 1.05 }}
                whileTap={{ scale: currentStep === 0 ? 1 : 0.95 }}
                className="btn-secondary disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span className="flex items-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span className="hidden sm:inline">Previous</span>
                </span>
              </motion.button>
              
              {/* Step Indicators */}
              <div className="hidden sm:flex space-x-2">
                {steps.map((step, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.2 }}
                    className="relative group"
                  >
                    <div
                      className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                        index === currentStep 
                          ? 'bg-gradient-to-r from-blue-600 to-emerald-600 w-8' 
                          : index < currentStep 
                            ? 'bg-green-500' 
                            : 'bg-gray-300'
                      }`}
                    />
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {step.icon} {step.title}
                    </div>
                  </motion.div>
                ))}
              </div>
              
              <motion.button
                onClick={nextStep}
                disabled={currentStep === steps.length - 1}
                whileHover={{ scale: currentStep === steps.length - 1 ? 1 : 1.05 }}
                whileTap={{ scale: currentStep === steps.length - 1 ? 1 : 0.95 }}
                className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span className="flex items-center space-x-2">
                  <span className="hidden sm:inline">Next</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </motion.button>
            </div>
          </div>
        </footer>
      </div>
    </AppContext.Provider>
  );
}

export default App;