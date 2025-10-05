
import React, { useState, useContext, createContext } from 'react';
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
import './App.css';
import SiteSuitabilityMap from './components/SiteSuitabilityMap';
import UserDetails from './components/UserDetails';

// Global App Context
export const AppContext = createContext();

function App() {
  const [currentStep, setCurrentStep] = useState(0);
  const [appData, setAppData] = useState({
    language: 'en',
    userName: '',           // NEW
    userEmail: '',          // NEW  
    userPhone: '',          // NEW
    propertyType: '',       // NEW
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
    { component: LanguageSelector, title: "Select Language" },
    { component: UserDetails, title: "Personal Details" },
    { component: LocationInput, title: "Location Details" },
    { component: SiteSuitabilityMap, title: "Area Suitability" },
    { component: RoofDataInput, title: "Roof Information" },
    { component: GISMapIntegration, title: "Map Integration" },
    { component: DataFetching, title: "Data Analysis" },
    { component: AIAssessment, title: "Potential Assessment" },
    { component: StructureRecommendation, title: "Structure Options" },
    { component: StructureDetails, title: "Structure Details" },
    { component: CostBenefitAnalysis, title: "Cost Analysis" },
    { component: ReportGeneration, title: "Generate Report" },
    { component: MaintenanceReminder, title: "Maintenance" },
    { component: Dashboard, title: "Dashboard" }
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateAppData = (newData) => {
    setAppData(prev => ({ ...prev, ...newData }));
  };

  const CurrentComponent = steps[currentStep].component;

  return (
    <AppContext.Provider value={{
      appData,
      updateAppData,
      nextStep,
      prevStep,
      currentStep,
      totalSteps: steps.length
    }}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
        {/* Header */}
        <header className="bg-white shadow-lg">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">RH</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-800">
                    HydroSense
                  </h1>
                  <p className="text-sm text-gray-600">
                    Varsha Jal, Bhavishya Kal
                  </p>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="flex items-center space-x-4">
                <div className="w-48 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm text-gray-600">
                  {currentStep + 1}/{steps.length}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              <CurrentComponent />
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Footer Navigation */}
        <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
          <div className="container mx-auto flex justify-between items-center">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-400 transition-colors"
            >
              Previous
            </button>
            
            <div className="flex space-x-2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full ${
                    index === currentStep 
                      ? 'bg-blue-600' 
                      : index < currentStep 
                        ? 'bg-green-500' 
                        : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
            
            <button
              onClick={nextStep}
              disabled={currentStep === steps.length - 1}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
            >
              Next
            </button>
          </div>
        </footer>
      </div>
    </AppContext.Provider>
  );
}

export default App;

