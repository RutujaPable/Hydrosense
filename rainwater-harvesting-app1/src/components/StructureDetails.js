
import React, { useContext, useState } from 'react';
import { motion } from 'framer-motion';
import { AppContext } from '../App';

const StructureDetails = () => {
  const { appData, nextStep } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState('overview');
  
  const structure = appData.selectedStructure;

  if (!structure) {
    return (
      <div className="max-w-4xl mx-auto text-center">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8">
          <h3 className="text-xl font-semibold text-yellow-800 mb-2">No Structure Selected</h3>
          <p className="text-yellow-700">Please go back and select a structure first.</p>
        </div>
      </div>
    );
  }

  const constructionSteps = {
    recharge_pit: [
      { step: 1, title: 'Site Preparation', description: 'Mark and excavate 2m × 2m × 3m pit', time: '1 day' },
      { step: 2, title: 'Base Layer', description: 'Place 30cm layer of large stones (20-40mm)', time: 'Half day' },
      { step: 3, title: 'Filter Layers', description: 'Add gravel (10-20mm) and coarse sand layers', time: 'Half day' },
      { step: 4, title: 'Top Layer', description: 'Final layer of fine sand and soil cover', time: 'Half day' },
      { step: 5, title: 'Connection', description: 'Connect roof drainage to the pit', time: 'Half day' }
    ],
    recharge_trench: [
      { step: 1, title: 'Excavation', description: 'Dig 10m × 1m × 2m trench along roof line', time: '1-2 days' },
      { step: 2, title: 'Slope Gradient', description: 'Ensure proper slope for water flow (1:100)', time: 'Half day' },
      { step: 3, title: 'Filter Media', description: 'Fill with graded filter material', time: '1 day' },
      { step: 4, title: 'Perforated Pipes', description: 'Install distribution pipes with holes', time: 'Half day' },
      { step: 5, title: 'Cover System', description: 'Cover with permeable membrane and soil', time: 'Half day' }
    ],
    recharge_well: [
      { step: 1, title: 'Drilling', description: 'Bore 1m diameter well to 10m depth', time: '1-2 days' },
      { step: 2, title: 'Casing Installation', description: 'Install perforated concrete rings', time: '1 day' },
      { step: 3, title: 'Filter Pack', description: 'Place graded gravel around casing', time: 'Half day' },
      { step: 4, title: 'Top Chamber', description: 'Construct settling chamber at top', time: '1 day' },
      { step: 5, title: 'Inlet System', description: 'Connect roof drainage with first flush diverter', time: 'Half day' }
    ]
  };

  const materialsList = {
    recharge_pit: [
      { item: 'Boulder (60-80mm)', quantity: '2 cubic meters', cost: '₹1,500' },
      { item: 'Gravel (20-40mm)', quantity: '1.5 cubic meters', cost: '₹1,200' },
      { item: 'Coarse Sand', quantity: '1 cubic meter', cost: '₹800' },
      { item: 'Fine Sand', quantity: '0.5 cubic meters', cost: '₹400' },
      { item: 'Geotextile Fabric', quantity: '10 sq meters', cost: '₹600' },
      { item: 'PVC Pipes & Fittings', quantity: '1 set', cost: '₹2,000' },
      { item: 'Labor Cost', quantity: '3 days', cost: '₹4,500' }
    ],
    recharge_trench: [
      { item: 'Boulder (40-60mm)', quantity: '4 cubic meters', cost: '₹3,000' },
      { item: 'Gravel (10-20mm)', quantity: '3 cubic meters', cost: '₹2,400' },
      { item: 'Coarse Sand', quantity: '2 cubic meters', cost: '₹1,600' },
      { item: 'Perforated Pipes', quantity: '12 meters', cost: '₹1,800' },
      { item: 'Geotextile Membrane', quantity: '15 sq meters', cost: '₹900' },
      { item: 'Excavation', quantity: '20 cubic meters', cost: '₹6,000' },
      { item: 'Labor Cost', quantity: '4 days', cost: '₹6,000' }
    ],
    recharge_well: [
      { item: 'Drilling Cost', quantity: '10 meters', cost: '₹8,000' },
      { item: 'Concrete Rings', quantity: '10 pieces', cost: '₹6,000' },
      { item: 'Gravel Pack', quantity: '2 cubic meters', cost: '₹1,600' },
      { item: 'Settling Chamber', quantity: '1 unit', cost: '₹3,000' },
      { item: 'PVC Pipes & Fittings', quantity: '1 set', cost: '₹2,500' },
      { item: 'First Flush Diverter', quantity: '1 unit', cost: '₹1,500' },
      { item: 'Labor & Installation', quantity: '5 days', cost: '₹10,000' }
    ]
  };

  const maintenanceSchedule = {
    recharge_pit: [
      { frequency: 'Monthly', task: 'Check inlet for blockages', importance: 'High' },
      { frequency: 'Quarterly', task: 'Clean first flush diverter', importance: 'High' },
      { frequency: 'Bi-annually', task: 'Inspect and clean top sand layer', importance: 'Medium' },
      { frequency: 'Annually', task: 'Complete system check and cleaning', importance: 'High' },
      { frequency: '3-5 years', task: 'Replace top filter layer', importance: 'Medium' }
    ],
    recharge_trench: [
      { frequency: 'Monthly', task: 'Remove debris from trench', importance: 'High' },
      { frequency: 'Quarterly', task: 'Check pipe perforations', importance: 'Medium' },
      { frequency: 'Bi-annually', task: 'Inspect membrane condition', importance: 'Medium' },
      { frequency: 'Annually', task: 'Clean distribution pipes', importance: 'High' },
      { frequency: '2-3 years', task: 'Replace membrane if damaged', importance: 'Low' }
    ],
    recharge_well: [
      { frequency: 'Monthly', task: 'Check settling chamber', importance: 'High' },
      { frequency: 'Quarterly', task: 'Clean first flush diverter', importance: 'High' },
      { frequency: 'Bi-annually', task: 'Water quality testing', importance: 'High' },
      { frequency: 'Annually', task: 'Professional well inspection', importance: 'High' },
      { frequency: '5-7 years', task: 'Well redevelopment if needed', importance: 'Medium' }
    ]
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: '📋' },
    { id: 'construction', name: 'Construction', icon: '🔨' },
    { id: 'materials', name: 'Materials & Cost', icon: '📊' },
    { id: 'maintenance', name: 'Maintenance', icon: '🔧' },
    { id: 'pros-cons', name: 'Pros & Cons', icon: '⚖️' }
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg p-8"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center">
            <span className="text-2xl">{structure.icon}</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            {structure.name} - Detailed Guide
          </h2>
          <p className="text-gray-600">
            Complete specifications, construction guide, and maintenance information
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap justify-center mb-8 border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 mx-1 mb-2 rounded-t-lg font-semibold text-sm transition-colors ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tab.icon} {tab.name}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-blue-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Technical Specifications</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Dimensions:</span>
                      <span className="font-semibold">{structure.dimensions}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Storage Capacity:</span>
                      <span className="font-semibold">{structure.capacity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Recharge Efficiency:</span>
                      <span className="font-semibold text-green-600">{structure.efficiency}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Suitability:</span>
                      <span className="font-semibold">{structure.suitability}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Best Applications</h3>
                  <div className="space-y-3">
                    {structure.bestFor.map((application, index) => (
                      <div key={index} className="flex items-center">
                        <svg className="w-5 h-5 text-green-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-700">{application}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Description</h3>
                <p className="text-gray-700 leading-relaxed">{structure.description}</p>
              </div>
            </div>
          )}

          {/* Construction Tab */}
          {activeTab === 'construction' && (
            <div className="space-y-6">
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-center">
                  <svg className="w-6 h-6 text-orange-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h3 className="font-semibold text-orange-800">Professional Installation Recommended</h3>
                    <p className="text-orange-700 text-sm">Some steps require technical expertise and proper tools</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {constructionSteps[structure.id]?.map((step, index) => (
                  <motion.div
                    key={step.step}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start bg-gray-50 rounded-lg p-4"
                  >
                    <div className="flex-shrink-0 w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold mr-4">
                      {step.step}
                    </div>
                    <div className="flex-grow">
                      <h4 className="font-semibold text-gray-800 mb-1">{step.title}</h4>
                      <p className="text-gray-600 mb-2">{step.description}</p>
                      <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded">
                        Time: {step.time}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Materials & Cost Tab */}
          {activeTab === 'materials' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Material Requirements & Costs</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-300">
                        <th className="text-left py-3 px-2 font-semibold text-gray-700">Material</th>
                        <th className="text-left py-3 px-2 font-semibold text-gray-700">Quantity</th>
                        <th className="text-right py-3 px-2 font-semibold text-gray-700">Cost</th>
                      </tr>
                    </thead>
                    <tbody>
                      {materialsList[structure.id]?.map((material, index) => (
                        <motion.tr
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="border-b border-gray-200"
                        >
                          <td className="py-3 px-2 text-gray-800">{material.item}</td>
                          <td className="py-3 px-2 text-gray-600">{material.quantity}</td>
                          <td className="py-3 px-2 text-right font-semibold text-gray-800">{material.cost}</td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="mt-6 pt-4 border-t border-gray-300">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-800">Total Estimated Cost:</span>
                    <span className="text-xl font-bold text-green-600">{structure.cost}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    *Costs may vary based on location and material quality. Prices include local market rates.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Maintenance Tab */}
          {activeTab === 'maintenance' && (
            <div className="space-y-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-semibold text-yellow-800 mb-2">Regular Maintenance is Key</h3>
                <p className="text-yellow-700 text-sm">
                  Proper maintenance ensures optimal performance and extends system lifespan
                </p>
              </div>

              <div className="space-y-4">
                {maintenanceSchedule[structure.id]?.map((task, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-800">{task.task}</h4>
                        <p className="text-gray-600 text-sm">Frequency: {task.frequency}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        task.importance === 'High' ? 'bg-red-100 text-red-800' :
                        task.importance === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {task.importance}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Pros & Cons Tab */}
          {activeTab === 'pros-cons' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-green-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center">
                  <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Advantages
                </h3>
                <div className="space-y-3">
                  {structure.advantages.map((advantage, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start"
                    >
                      <svg className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">{advantage}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="bg-red-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-red-800 mb-4 flex items-center">
                  <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  Considerations
                </h3>
                <div className="space-y-3">
                  {structure.disadvantages.map((disadvantage, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start"
                    >
                      <svg className="w-5 h-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">{disadvantage}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Continue Button */}
        <div className="text-center mt-8">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={nextStep}
            className="bg-purple-600 text-white py-3 px-8 rounded-lg font-semibold text-lg hover:bg-purple-700 transition-colors"
          >
            Proceed to Cost Analysis →
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default StructureDetails;


