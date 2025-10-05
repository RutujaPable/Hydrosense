
import React, { useContext, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppContext } from '../App';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default Leaflet markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const Dashboard = () => {
  const { appData } = useContext(AppContext);
  
  // --- NEW STATE MANAGEMENT for community data ---
  const [communityData, setCommunityData] = useState({ users: [], totalWaterSaved: 0 });
  const [showShareModal, setShowShareModal] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [animatedCounters, setAnimatedCounters] = useState({
    waterSaved: 0,
    groundwaterRecharge: 0,
    communityUsers: 0,
    co2Reduced: 0,
    moneySaved: 0
  });

  const userMetrics = {
    waterSaved: appData.harvestPotential?.annualPotential || 12000,
    groundwaterRecharge: Math.round((appData.roofArea || 100) * 1.5),
    co2Reduced: appData.costAnalysis?.environmental?.co2Saved || 6,
    moneySaved: appData.costAnalysis?.netAnnualSavings || 600
  };

  // --- MODIFIED useEffect: Fetches live community data ---
  useEffect(() => {
    const fetchCommunityData = async () => {
      try {
        const response = await fetch(`${apiUrl}/get_weather`);
        if (!response.ok) throw new Error('Network response was not ok');
        const projects = await response.json();
        const totalWaterSaved = projects.reduce((sum, project) => sum + project.water_saved, 0);
        setCommunityData({ users: projects, totalWaterSaved });
      } catch (error) {
        console.error("Failed to fetch community data:", error);
        setCommunityData({ users: [], totalWaterSaved: 15640000 }); // Fallback
      } finally {
        setLoading(false);
      }
    };
    fetchCommunityData();
  }, []);

  // Animate counters (depends on fetched communityData)
  useEffect(() => {
    if (loading) return; 

    const duration = 2000;
    const steps = 60;
    const stepDuration = duration / steps;

    const targets = {
      waterSaved: userMetrics.waterSaved,
      groundwaterRecharge: userMetrics.groundwaterRecharge,
      communityUsers: communityData.users.length || 1247,
      co2Reduced: userMetrics.co2Reduced,
      moneySaved: userMetrics.moneySaved
    };

    const intervals = {};
    Object.keys(targets).forEach(key => {
      const target = targets[key];
      const increment = target / steps;
      let current = 0;
      
      intervals[key] = setInterval(() => {
        current += increment;
        if (current >= target) {
          current = target;
          clearInterval(intervals[key]);
        }
        setAnimatedCounters(prev => ({ ...prev, [key]: Math.round(current) }));
      }, stepDuration);
    });

    return () => {
      Object.values(intervals).forEach(clearInterval);
    };
  }, [loading, communityData.users.length]);

  // --- NEW: Handler for sharing project ---
  const handleShareProject = async (event) => {
    event.preventDefault();
    if (!appData.location || !appData.selectedStructure) {
        alert("Cannot share project without location and structure details.");
        return;
    }
    const newProject = {
      name: appData.userName || "Anonymous",
      location_name: appData.location.address,
      lat: appData.location.coordinates.lat,
      lng: appData.location.coordinates.lng,
      water_saved: userMetrics.waterSaved,
      structure_type: appData.selectedStructure.name,
    };

    try {
      const response = await fetch(`${apiUrl}/get_weather`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProject),
      });
      const result = await response.json();
      if (result.success) {
        setCommunityData(prev => ({
          users: [...prev.users, result.project],
          totalWaterSaved: prev.totalWaterSaved + result.project.water_saved
        }));
        setShowShareModal(false);
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      alert('Failed to connect to the server to share your project.');
    }
  };

  const achievements = [
    { icon: '🏆', title: 'Water Warrior', description: 'Completed comprehensive rainwater harvesting assessment', earned: true },
    { icon: '🌱', title: 'Environmental Champion', description: 'Contributing to carbon footprint reduction', earned: true },
    { icon: '💡', title: 'Smart Investor', description: `ROI projection: ${Math.round((userMetrics.moneySaved * 10 / (appData.costAnalysis?.initialCost || 20000)) * 100)}% in 10 years`, earned: true },
    { icon: '🔧', title: 'Maintenance Master', description: 'Set up comprehensive maintenance schedule', earned: !!appData.selectedStructure }
  ];

  const impactComparison = [
    { metric: 'Annual Water Savings', user: `${animatedCounters.waterSaved.toLocaleString()} L`, equivalent: `${Math.round(animatedCounters.waterSaved / 150)} people daily need`, icon: '💧' },
    { metric: 'Carbon Footprint Reduction', user: `${animatedCounters.co2Reduced} kg CO₂`, equivalent: `${Math.round(animatedCounters.co2Reduced / 0.4)} km car drive saved`, icon: '🌱' },
    { metric: 'Annual Cost Savings', user: `₹${animatedCounters.moneySaved.toLocaleString()}`, equivalent: `${Math.round(animatedCounters.moneySaved / 500)} months mobile bills`, icon: '💰' },
    { metric: 'Groundwater Recharge Area', user: `${animatedCounters.groundwaterRecharge} m²`, equivalent: `${Math.round(animatedCounters.groundwaterRecharge / 100)} parking spaces`, icon: '🏔️' }
  ];

  const nextSteps = [
    { title: 'Get Professional Quote', description: 'Contact certified contractors for installation', priority: 'High', timeframe: 'Within 1 week' },
    { title: 'Obtain Permits', description: 'Check local building codes and get necessary permits', priority: 'High', timeframe: '2-3 weeks' },
    { title: 'Material Procurement', description: 'Source quality materials as per specifications', priority: 'Medium', timeframe: '3-4 weeks' },
    { title: 'Installation', description: 'Begin construction of your rainwater harvesting system', priority: 'High', timeframe: '4-6 weeks' },
    { title: 'System Testing', description: 'Test system performance and water quality', priority: 'High', timeframe: '6-7 weeks' }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-xl p-8">
        <div className="w-20 h-20 mx-auto mb-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
          <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        </div>
        <h1 className="text-4xl font-bold mb-4">Congratulations{appData.userName ? `, ${appData.userName.split(' ')[0]}` : ''}! 🎉</h1>
        <p className="text-xl opacity-90">Your rainwater harvesting assessment is complete. You're ready to make a positive impact!</p>
      </motion.div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="bg-blue-50 rounded-xl p-6 text-center border border-blue-200">
          <div className="text-4xl mb-3">💧</div>
          <div className="text-3xl font-bold text-blue-600 mb-2">{animatedCounters.waterSaved.toLocaleString()}L</div>
          <div className="text-gray-600 font-medium">Annual Water Harvest</div>
          <div className="text-sm text-gray-500 mt-1">Your potential savings</div>
        </motion.div>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className="bg-green-50 rounded-xl p-6 text-center border border-green-200">
          <div className="text-4xl mb-3">🏔️</div>
          <div className="text-3xl font-bold text-green-600 mb-2">{animatedCounters.groundwaterRecharge}m²</div>
          <div className="text-gray-600 font-medium">Groundwater Recharge</div>
          <div className="text-sm text-gray-500 mt-1">Area benefited</div>
        </motion.div>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }} className="bg-purple-50 rounded-xl p-6 text-center border border-purple-200">
          <div className="text-4xl mb-3">👥</div>
          <div className="text-3xl font-bold text-purple-600 mb-2">{animatedCounters.communityUsers.toLocaleString()}</div>
          <div className="text-gray-600 font-medium">Community Projects</div>
          <div className="text-sm text-gray-500 mt-1">Join the movement</div>
        </motion.div>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }} className="bg-orange-50 rounded-xl p-6 text-center border border-orange-200">
          <div className="text-4xl mb-3">💰</div>
          <div className="text-3xl font-bold text-orange-600 mb-2">₹{animatedCounters.moneySaved.toLocaleString()}</div>
          <div className="text-gray-600 font-medium">Annual Savings</div>
          <div className="text-sm text-gray-500 mt-1">Net benefit</div>
        </motion.div>
      </div>

      {/* Impact Comparison */}
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Your Environmental Impact</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {impactComparison.map((item, index) => (
            <motion.div key={index} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.8 + (index * 0.1) }} className="flex items-center bg-gray-50 rounded-lg p-4">
              <div className="text-3xl mr-4">{item.icon}</div>
              <div>
                <h3 className="font-semibold text-gray-800">{item.metric}</h3>
                <div className="text-lg font-bold text-blue-600">{item.user}</div>
                <div className="text-sm text-gray-600">{item.equivalent}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* REBUILT Community Hub Section */}
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.0 }} className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Community Knowledge Hub</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Live Community Impact</h3>
            <div className="grid grid-cols-2 gap-4 text-center mb-6">
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{communityData.users.length}</div>
                <div className="text-sm text-gray-600">Active Projects</div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{Math.round(communityData.totalWaterSaved / 1000).toLocaleString()}K L</div>
                <div className="text-sm text-gray-600">Total Water Saved</div>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-4">Explore projects from fellow water conservationists. Your project could be the next one on the map!</p>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowShareModal(true)} className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors">
              Share Your Implemented Project
            </motion.button>
          </div>
          <div className="rounded-lg overflow-hidden h-80 lg:h-full border">
            {appData.location ? (
              <MapContainer center={[appData.location.coordinates.lat, appData.location.coordinates.lng]} zoom={11} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {communityData.users.map(project => (
                  project.lat && project.lng && (
                    <Marker key={project.id} position={[project.lat, project.lng]}>
                      <Popup>
                        <div className="text-sm">
                          <img src={project.image_url} alt={project.structure_type} className="w-full h-24 object-cover rounded-md mb-2"/>
                          <p className="font-bold">{project.structure_type} by {project.name}</p>
                          <p>{project.location_name}</p>
                          <p className="text-green-600 font-semibold">{project.water_saved.toLocaleString()} L/year saved</p>
                        </div>
                      </Popup>
                    </Marker>
                  )
                ))}
              </MapContainer>
            ) : <div className="flex items-center justify-center h-full bg-gray-100 text-gray-500">Location data needed for map.</div>}
          </div>
        </div>
      </motion.div>

      {/* Achievements */}
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2 }} className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Your Achievements</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {achievements.map((achievement, index) => (
            <motion.div key={index} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.4 + (index * 0.1) }} className={`flex items-center p-4 rounded-lg border-2 ${achievement.earned ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50 opacity-50'}`}>
              <div className="text-3xl mr-4">{achievement.icon}</div>
              <div>
                <h3 className="font-semibold text-gray-800">{achievement.title}</h3>
                <p className="text-sm text-gray-600">{achievement.description}</p>
              </div>
              {achievement.earned && (<div className="ml-auto"><svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg></div>)}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Next Steps */}
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.6 }} className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Implementation Roadmap</h2>
        <div className="space-y-4">
          {nextSteps.map((step, index) => (
            <motion.div key={index} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.8 + (index * 0.1) }} className="flex items-center bg-gray-50 rounded-lg p-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mr-4">{index + 1}</div>
              <div className="flex-grow">
                <h3 className="font-semibold text-gray-800">{step.title}</h3>
                <p className="text-sm text-gray-600">{step.description}</p>
              </div>
              <div className="text-right">
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${step.priority === 'High' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>{step.priority}</span>
                <div className="text-sm text-gray-500 mt-1">{step.timeframe}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Final Call-to-Action */}
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2.0 }} className="bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-xl p-8 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Make a Difference?</h2>
        <p className="text-xl opacity-90 mb-6">Your assessment shows great potential for water conservation and cost savings.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white bg-opacity-20 rounded-lg p-4">
            <div className="text-2xl font-bold">{userMetrics.waterSaved.toLocaleString()}L</div>
            <div className="text-sm">Annual Water Harvest</div>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-4">
            <div className="text-2xl font-bold">₹{userMetrics.moneySaved.toLocaleString()}</div>
            <div className="text-sm">Annual Savings</div>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-4">
            <div className="text-2xl font-bold">{appData.costAnalysis?.paybackPeriod || 'N/A'}</div>
            <div className="text-sm">Years Payback</div>
          </div>
        </div>
        <div className="space-y-4 md:space-y-0 md:space-x-4 md:flex md:justify-center">
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => window.location.reload()} className="bg-white text-blue-600 py-3 px-8 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors shadow-lg">
            Start New Assessment
          </motion.button>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => {
              const reportData = `...`; // Original share logic
              if (navigator.share) { navigator.share({ title: 'My Rainwater Harvesting Assessment', text: reportData }); }
              else { navigator.clipboard.writeText(reportData); alert('Assessment summary copied to clipboard!'); }
            }}
            className="bg-green-500 text-white py-3 px-8 rounded-lg font-semibold text-lg hover:bg-green-600 transition-colors shadow-lg">
            Share Results
          </motion.button>
        </div>
      </motion.div>

      {/* Footer */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.4 }} className="text-center py-8 text-gray-600">
        <p className="text-lg font-medium mb-2">Thank you for choosing sustainable water management! 🙏</p>
        <p className="text-sm">Together, we're building a water-secure future for generations to come.</p>
        <div className="mt-4 text-xs">Generated by Smart Rainwater Harvesting Assessment Platform • {new Date().getFullYear()}</div>
      </motion.div>

      {/* NEW: Share Modal */}
      <AnimatePresence>
        {showShareModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Share Your Project</h2>
              <p className="text-gray-600 mb-6">Inspire the community by adding your project to the map. We'll use the data from your current assessment.</p>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2 mb-6 text-sm">
                <p><strong>User:</strong> {appData.userName || "Anonymous"}</p>
                <p><strong>Location:</strong> {appData.location?.address || "Not specified"}</p>
                <p><strong>Structure:</strong> {appData.selectedStructure?.name || "Not selected"}</p>
                <p><strong>Water Saved:</strong> {userMetrics.waterSaved.toLocaleString()} L/year</p>
              </div>
              <div className="flex justify-end space-x-4">
                <button onClick={() => setShowShareModal(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">Cancel</button>
                <button onClick={handleShareProject} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Confirm & Share</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
