
import React, { useContext, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { AppContext } from '../App';

const CostBenefitAnalysis = () => {
  const { appData, updateAppData, nextStep } = useContext(AppContext);
  const [analysisData, setAnalysisData] = useState(null);
  const [activeView, setActiveView] = useState('comparison');

  useEffect(() => {
    calculateCostBenefit();
  }, [appData]);

  const calculateCostBenefit = () => {
    // Provide default values for missing data
    const structure = appData.selectedStructure || {
      name: 'Recharge Pit',
      cost: '₹15,000 - ₹25,000',
      efficiency: '85%'
    };
    
    const harvestPotential = appData.harvestPotential?.annualPotential || 12000;
    const familySize = appData.familySize || 4;
    const roofArea = appData.roofArea || 100;

    // Extract cost range with better parsing
    const costString = structure.cost.replace(/[₹,]/g, ''); // Remove ₹ and commas
    const costMatch = costString.match(/(\d+)\s*-\s*(\d+)/);
    
    let averageCost = 20000; // Default fallback
    if (costMatch) {
      const minCost = parseInt(costMatch[1]) || 15000;
      const maxCost = parseInt(costMatch[2]) || 25000;
      averageCost = (minCost + maxCost) / 2;
    }

    // Calculate savings with safer defaults
    const waterCostPerLiter = 0.05; // ₹0.05 per liter (municipal water)
    const annualWaterSavings = harvestPotential * waterCostPerLiter;
    const maintenanceCostPerYear = averageCost * 0.05; // 5% of initial cost
    const netAnnualSavings = Math.max(0, annualWaterSavings - maintenanceCostPerYear);

    // Calculate payback period with safety check
    const paybackPeriod = netAnnualSavings > 0 ? Math.ceil(averageCost / netAnnualSavings) : 0;

    // 20-year analysis
    const yearlyData = [];
    let cumulativeSavings = 0;
    let cumulativeCost = averageCost;

    for (let year = 1; year <= 20; year++) {
      cumulativeSavings += netAnnualSavings;
      const netBenefit = cumulativeSavings - cumulativeCost;
      
      yearlyData.push({
        year: year,
        savings: Math.round(cumulativeSavings),
        cost: Math.round(cumulativeCost),
        netBenefit: Math.round(netBenefit),
        annualSaving: Math.round(netAnnualSavings)
      });

      // Add replacement cost every 10 years (20% of initial cost)
      if (year % 10 === 0) {
        cumulativeCost += averageCost * 0.2;
      }
    }

    // Environmental benefits
    const co2Saved = harvestPotential * 0.0005; // kg CO2 per liter saved
    const energySaved = harvestPotential * 0.003; // kWh per liter

    const analysis = {
      initialCost: averageCost,
      annualSavings: annualWaterSavings,
      maintenanceCost: maintenanceCostPerYear,
      netAnnualSavings: netAnnualSavings,
      paybackPeriod: paybackPeriod,
      twentyYearSavings: Math.round(yearlyData[19].netBenefit),
      yearlyData: yearlyData,
      environmental: {
        co2Saved: Math.round(co2Saved * 100) / 100, // Round to 2 decimal places
        energySaved: Math.round(energySaved),
        waterSaved: harvestPotential
      }
    };

    setAnalysisData(analysis);
    updateAppData({ costAnalysis: analysis });
  };

  if (!analysisData) {
    return (
      <div className="max-w-4xl mx-auto text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-600 mt-4">Calculating cost-benefit analysis...</p>
      </div>
    );
  }

  const comparisonData = [
    {
      category: 'Initial Investment',
      amount: analysisData.initialCost,
      type: 'cost'
    },
    {
      category: 'Annual Water Savings',
      amount: analysisData.annualSavings,
      type: 'savings'
    },
    {
      category: 'Annual Maintenance',
      amount: analysisData.maintenanceCost,
      type: 'cost'
    },
    {
      category: 'Net Annual Benefit',
      amount: analysisData.netAnnualSavings,
      type: 'savings'
    }
  ];

  const environmentalData = [
    { name: 'Water Saved', value: analysisData.environmental.waterSaved, color: '#3B82F6', unit: 'liters/year' },
    { name: 'CO₂ Reduced', value: analysisData.environmental.co2Saved, color: '#10B981', unit: 'kg/year' },
    { name: 'Energy Saved', value: analysisData.environmental.energySaved, color: '#F59E0B', unit: 'kWh/year' }
  ];

  const viewOptions = [
    { id: 'comparison', name: 'Cost Comparison', icon: '📊' },
    { id: 'timeline', name: '20-Year Projection', icon: '📈' },
    { id: 'environmental', name: 'Environmental Impact', icon: '🌱' }
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
          <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Cost-Benefit Analysis
          </h2>
          <p className="text-gray-600">
            Financial and environmental impact of your rainwater harvesting system
          </p>
        </div>

        {/* Key Metrics Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-blue-50 rounded-lg p-6 text-center"
          >
            <div className="text-3xl font-bold text-blue-600 mb-2">
              ₹{analysisData.initialCost.toLocaleString()}
            </div>
            <div className="text-gray-600 font-medium">Initial Investment</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-green-50 rounded-lg p-6 text-center"
          >
            <div className="text-3xl font-bold text-green-600 mb-2">
              ₹{Math.round(analysisData.netAnnualSavings).toLocaleString()}
            </div>
            <div className="text-gray-600 font-medium">Annual Savings</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-purple-50 rounded-lg p-6 text-center"
          >
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {analysisData.paybackPeriod}
            </div>
            <div className="text-gray-600 font-medium">Years Payback</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-orange-50 rounded-lg p-6 text-center"
          >
            <div className="text-3xl font-bold text-orange-600 mb-2">
              ₹{Math.round(analysisData.twentyYearSavings / 1000)}K
            </div>
            <div className="text-gray-600 font-medium">20-Year Benefit</div>
          </motion.div>
        </div>

        {/* View Selector */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-100 rounded-lg p-1">
            {viewOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => setActiveView(option.id)}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
                  activeView === option.id
                    ? 'bg-white text-gray-800 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {option.icon} {option.name}
              </button>
            ))}
          </div>
        </div>

        {/* Chart Content */}
        <motion.div
          key={activeView}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Cost Comparison View */}
          {activeView === 'comparison' && (
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-6 text-center">
                  Annual Cost vs Savings Comparison
                </h3>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={comparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="category" 
                      tick={{ fontSize: 12 }}
                      interval={0}
                      angle={-45}
                      textAnchor="end"
                      height={100}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      formatter={(value, name) => [`₹${Math.round(value).toLocaleString()}`, name]}
                    />
                    <Bar 
                      dataKey="amount" 
                      radius={[4, 4, 0, 0]}
                    >
                      {comparisonData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.type === 'cost' ? '#EF4444' : '#10B981'} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                  <h4 className="font-semibold text-red-800 mb-3 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 6a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                    Total Costs
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-700">Initial Setup:</span>
                      <span className="font-semibold">₹{analysisData.initialCost.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Annual Maintenance:</span>
                      <span className="font-semibold">₹{Math.round(analysisData.maintenanceCost).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <h4 className="font-semibold text-green-800 mb-3 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    Annual Benefits
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-700">Water Savings:</span>
                      <span className="font-semibold">₹{Math.round(analysisData.annualSavings).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Net Benefit:</span>
                      <span className="font-semibold text-green-600">₹{Math.round(analysisData.netAnnualSavings).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 20-Year Timeline View */}
          {activeView === 'timeline' && (
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-6 text-center">
                20-Year Financial Projection
              </h3>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={analysisData.yearlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    formatter={(value, name) => [`₹${Math.round(value).toLocaleString()}`, name]}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="savings" 
                    stroke="#10B981" 
                    strokeWidth={3}
                    name="Cumulative Savings"
                    dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="cost" 
                    stroke="#EF4444" 
                    strokeWidth={3}
                    name="Cumulative Cost"
                    dot={{ fill: '#EF4444', strokeWidth: 2, r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="netBenefit" 
                    stroke="#3B82F6" 
                    strokeWidth={3}
                    name="Net Benefit"
                    dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-600 mb-1">
                    ₹{Math.round(analysisData.yearlyData[9].netBenefit / 1000)}K
                  </div>
                  <div className="text-sm text-gray-600">10-Year Benefit</div>
                </div>
                <div className="bg-white rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600 mb-1">
                    ₹{Math.round(analysisData.yearlyData[14].netBenefit / 1000)}K
                  </div>
                  <div className="text-sm text-gray-600">15-Year Benefit</div>
                </div>
                <div className="bg-white rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600 mb-1">
                    ₹{Math.round(analysisData.yearlyData[19].netBenefit / 1000)}K
                  </div>
                  <div className="text-sm text-gray-600">20-Year Benefit</div>
                </div>
              </div>
            </div>
          )}

          {/* Environmental Impact View */}
          {activeView === 'environmental' && (
            <div className="space-y-6">
              <div className="bg-green-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-6 text-center">
                  Annual Environmental Impact
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={environmentalData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={(entry) => `${entry.name}: ${entry.value} ${entry.unit}`}
                    >
                      {environmentalData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {environmentalData.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white border border-gray-200 rounded-lg p-6 text-center"
                  >
                    <div className="text-3xl mb-3">
                      {item.name === 'Water Saved' ? '💧' : 
                       item.name === 'CO₂ Reduced' ? '🌱' : '⚡'}
                    </div>
                    <div className="text-2xl font-bold mb-2" style={{ color: item.color }}>
                      {item.value.toLocaleString()}
                    </div>
                    <div className="text-gray-600 font-medium mb-1">{item.name}</div>
                    <div className="text-sm text-gray-500">{item.unit}</div>
                  </motion.div>
                ))}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h4 className="font-semibold text-blue-800 mb-4 flex items-center">
                  <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                  </svg>
                  Environmental Benefits Explained
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <h5 className="font-semibold text-blue-700 mb-2">Water Conservation</h5>
                    <p className="text-gray-700">
                      Reduces dependence on municipal water supply and groundwater extraction
                    </p>
                  </div>
                  <div>
                    <h5 className="font-semibold text-green-700 mb-2">Carbon Footprint</h5>
                    <p className="text-gray-700">
                      Less energy needed for water treatment and distribution reduces CO₂ emissions
                    </p>
                  </div>
                  <div>
                    <h5 className="font-semibold text-orange-700 mb-2">Energy Savings</h5>
                    <p className="text-gray-700">
                      Reduces energy consumption in water pumping and treatment facilities
                    </p>
                  </div>
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
            className="bg-green-600 text-white py-3 px-8 rounded-lg font-semibold text-lg hover:bg-green-700 transition-colors shadow-lg"
          >
            Generate Detailed Report →
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default CostBenefitAnalysis;


