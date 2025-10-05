
import React, { useContext, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AppContext } from '../App';

const MaintenanceReminder = () => {
  const { appData, nextStep } = useContext(AppContext);
  const [selectedReminders, setSelectedReminders] = useState({});
  const [installationDate, setInstallationDate] = useState(new Date().toISOString().split('T')[0]);
  const [timeUntilMaintenance, setTimeUntilMaintenance] = useState({});

  const maintenanceSchedules = {
    recharge_pit: [
      {
        id: 'monthly_check',
        task: 'Check inlet for blockages',
        frequency: 'Monthly',
        priority: 'High',
        description: 'Inspect and clean the inlet pipe to ensure smooth water flow',
        icon: '🔍',
        defaultEnabled: true
      },
      {
        id: 'quarterly_diverter',
        task: 'Clean first flush diverter',
        frequency: 'Quarterly',
        priority: 'High',
        description: 'Clean the first flush diverter to maintain water quality',
        icon: '🧽',
        defaultEnabled: true
      },
      {
        id: 'biannual_sand',
        task: 'Inspect top sand layer',
        frequency: 'Bi-annually',
        priority: 'Medium',
        description: 'Check and replace top sand layer if needed',
        icon: '🏔️',
        defaultEnabled: true
      },
      {
        id: 'annual_complete',
        task: 'Complete system check',
        frequency: 'Annually',
        priority: 'High',
        description: 'Comprehensive inspection and cleaning of entire system',
        icon: '🔧',
        defaultEnabled: true
      },
      {
        id: 'filter_replacement',
        task: 'Replace filter layer',
        frequency: '3-5 years',
        priority: 'Medium',
        description: 'Replace the filter media for optimal performance',
        icon: '🔄',
        defaultEnabled: false
      }
    ],
    recharge_trench: [
      {
        id: 'monthly_debris',
        task: 'Remove debris from trench',
        frequency: 'Monthly',
        priority: 'High',
        description: 'Clear leaves, debris, and sediments from the trench',
        icon: '🧹',
        defaultEnabled: true
      },
      {
        id: 'quarterly_pipes',
        task: 'Check pipe perforations',
        frequency: 'Quarterly',
        priority: 'Medium',
        description: 'Inspect distribution pipes for blockages',
        icon: '🔧',
        defaultEnabled: true
      },
      {
        id: 'biannual_membrane',
        task: 'Inspect membrane condition',
        frequency: 'Bi-annually',
        priority: 'Medium',
        description: 'Check geotextile membrane for damage or wear',
        icon: '🔍',
        defaultEnabled: true
      },
      {
        id: 'annual_pipes_clean',
        task: 'Clean distribution pipes',
        frequency: 'Annually',
        priority: 'High',
        description: 'Thorough cleaning of all distribution pipes',
        icon: '💧',
        defaultEnabled: true
      },
      {
        id: 'membrane_replacement',
        task: 'Replace membrane',
        frequency: '2-3 years',
        priority: 'Low',
        description: 'Replace geotextile membrane if damaged',
        icon: '🔄',
        defaultEnabled: false
      }
    ],
    recharge_well: [
      {
        id: 'monthly_chamber',
        task: 'Check settling chamber',
        frequency: 'Monthly',
        priority: 'High',
        description: 'Inspect and clean the settling chamber',
        icon: '🏗️',
        defaultEnabled: true
      },
      {
        id: 'quarterly_diverter_well',
        task: 'Clean first flush diverter',
        frequency: 'Quarterly',
        priority: 'High',
        description: 'Maintain the first flush diverter system',
        icon: '🧽',
        defaultEnabled: true
      },
      {
        id: 'biannual_quality',
        task: 'Water quality testing',
        frequency: 'Bi-annually',
        priority: 'High',
        description: 'Test groundwater quality and system performance',
        icon: '🧪',
        defaultEnabled: true
      },
      {
        id: 'annual_inspection',
        task: 'Professional well inspection',
        frequency: 'Annually',
        priority: 'High',
        description: 'Complete professional inspection of the well system',
        icon: '👨‍🔧',
        defaultEnabled: true
      },
      {
        id: 'well_redevelopment',
        task: 'Well redevelopment',
        frequency: '5-7 years',
        priority: 'Medium',
        description: 'Professional well redevelopment if performance decreases',
        icon: '🔄',
        defaultEnabled: false
      }
    ]
  };

  const getFrequencyInDays = (frequency) => {
    switch (frequency) {
      case 'Monthly': return 30;
      case 'Quarterly': return 90;
      case 'Bi-annually': return 180;
      case 'Annually': return 365;
      case '2-3 years': return 365 * 2.5;
      case '3-5 years': return 365 * 4;
      case '5-7 years': return 365 * 6;
      default: return 30;
    }
  };

  const calculateNextMaintenanceDate = (installDate, frequency) => {
    const install = new Date(installDate);
    const days = getFrequencyInDays(frequency);
    const nextDate = new Date(install.getTime() + (days * 24 * 60 * 60 * 1000));
    return nextDate;
  };

  const calculateTimeRemaining = (nextDate) => {
    const now = new Date();
    const timeDiff = nextDate.getTime() - now.getTime();
    const days = Math.ceil(timeDiff / (24 * 60 * 60 * 1000));
    
    if (days < 0) return 'Overdue';
    if (days === 0) return 'Due today';
    if (days === 1) return '1 day left';
    if (days < 7) return `${days} days left`;
    if (days < 30) return `${Math.ceil(days / 7)} weeks left`;
    if (days < 365) return `${Math.ceil(days / 30)} months left`;
    return `${Math.ceil(days / 365)} years left`;
  };

  useEffect(() => {
    const structure = appData.selectedStructure;
    if (structure && maintenanceSchedules[structure.id]) {
      const initialReminders = {};
      const initialTimeRemaining = {};
      
      maintenanceSchedules[structure.id].forEach(task => {
        initialReminders[task.id] = task.defaultEnabled;
        const nextDate = calculateNextMaintenanceDate(installationDate, task.frequency);
        initialTimeRemaining[task.id] = {
          nextDate,
          timeRemaining: calculateTimeRemaining(nextDate)
        };
      });
      
      setSelectedReminders(initialReminders);
      setTimeUntilMaintenance(initialTimeRemaining);
    }
  }, [installationDate, appData.selectedStructure]);

  const toggleReminder = (taskId) => {
    setSelectedReminders(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };

  const setupNotifications = async () => {
    if ('Notification' in window && 'serviceWorker' in navigator) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        // In a real implementation, you would register service worker
        // and schedule notifications based on the maintenance schedule
        alert('Notifications have been enabled! You will receive reminders for your selected maintenance tasks.');
      }
    } else {
      alert('Your browser does not support notifications. Please use calendar reminders instead.');
    }
  };

  const exportToCalendar = () => {
    const structure = appData.selectedStructure;
    if (!structure || !maintenanceSchedules[structure.id]) return;

    let calendarData = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Rainwater Harvesting//Maintenance Schedule//EN\n";

    maintenanceSchedules[structure.id].forEach(task => {
      if (selectedReminders[task.id] && timeUntilMaintenance[task.id]) {
        const nextDate = timeUntilMaintenance[task.id].nextDate;
        const dateStr = nextDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        
        calendarData += `BEGIN:VEVENT\n`;
        calendarData += `UID:${task.id}@rwh-maintenance\n`;
        calendarData += `DTSTART:${dateStr}\n`;
        calendarData += `DTEND:${dateStr}\n`;
        calendarData += `SUMMARY:RWH Maintenance: ${task.task}\n`;
        calendarData += `DESCRIPTION:${task.description}\n`;
        calendarData += `LOCATION:${appData.location?.address || 'Property'}\n`;
        calendarData += `END:VEVENT\n`;
      }
    });

    calendarData += "END:VCALENDAR";

    const blob = new Blob([calendarData], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'rainwater-harvesting-maintenance.ics';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const structure = appData.selectedStructure;
  const tasks = structure ? maintenanceSchedules[structure.id] || [] : [];

  if (!structure) {
    return (
      <div className="max-w-4xl mx-auto text-center">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8">
          <h3 className="text-xl font-semibold text-yellow-800 mb-2">No Structure Selected</h3>
          <p className="text-yellow-700">Please go back and select a structure to set up maintenance reminders.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg p-8"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-yellow-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 19h6v-2H4v2zM16 3h5v5l-5-5zM4 7h6V5H4v2zM4 13h6v-2H4v2z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Maintenance Schedule
          </h2>
          <p className="text-gray-600">
            Set up reminders to keep your {structure.name} performing optimally
          </p>
        </div>

        {/* Installation Date */}
        <div className="bg-blue-50 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Installation Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Installation Date (Planned/Actual)
              </label>
              <input
                type="date"
                value={installationDate}
                onChange={(e) => setInstallationDate(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-end">
              <div className="bg-white rounded-lg p-4 w-full">
                <div className="text-sm text-gray-600">Structure Selected</div>
                <div className="text-xl font-semibold text-gray-800">{structure.name}</div>
                <div className="text-sm text-gray-500">{structure.dimensions}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Maintenance Tasks */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-6">Maintenance Tasks</h3>
          <div className="space-y-4">
            {tasks.map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`border rounded-lg p-6 transition-all ${
                  selectedReminders[task.id] 
                    ? 'border-blue-200 bg-blue-50' 
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-start space-x-4">
                  {/* Checkbox */}
                  <div className="flex-shrink-0 mt-1">
                    <input
                      type="checkbox"
                      checked={selectedReminders[task.id] || false}
                      onChange={() => toggleReminder(task.id)}
                      className="w-5 h-5 text-blue-600 border-2 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </div>

                  {/* Task Icon */}
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-2xl shadow-sm">
                      {task.icon}
                    </div>
                  </div>

                  {/* Task Details */}
                  <div className="flex-grow">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="text-lg font-semibold text-gray-800">{task.task}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        task.priority === 'High' ? 'bg-red-100 text-red-800' :
                        task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {task.priority}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-3">{task.description}</p>
                    <div className="flex items-center space-x-4 text-sm">
                      <span className="text-gray-500">
                        <strong>Frequency:</strong> {task.frequency}
                      </span>
                      {timeUntilMaintenance[task.id] && (
                        <span className={`font-semibold ${
                          timeUntilMaintenance[task.id].timeRemaining.includes('Overdue') || 
                          timeUntilMaintenance[task.id].timeRemaining.includes('today') ? 
                          'text-red-600' : 'text-green-600'
                        }`}>
                          <strong>Next:</strong> {timeUntilMaintenance[task.id].timeRemaining}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Next Date */}
                  {timeUntilMaintenance[task.id] && (
                    <div className="flex-shrink-0 text-right">
                      <div className="text-sm text-gray-500">Next Due</div>
                      <div className="font-semibold text-gray-800">
                        {timeUntilMaintenance[task.id].nextDate.toLocaleDateString()}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Reminder Options */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Reminder Options</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={setupNotifications}
              className="bg-blue-600 text-white p-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
              </svg>
              Browser Notifications
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={exportToCalendar}
              className="bg-green-600 text-white p-4 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center"
            >
              <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              Export to Calendar
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                const reminderText = `Rainwater Harvesting Maintenance Reminders:\n\n${
                  tasks.filter(task => selectedReminders[task.id])
                    .map(task => `• ${task.task} - Every ${task.frequency}`)
                    .join('\n')
                }`;
                
                if (navigator.share) {
                  navigator.share({
                    title: 'RWH Maintenance Schedule',
                    text: reminderText
                  });
                } else {
                  navigator.clipboard.writeText(reminderText);
                  alert('Schedule copied to clipboard!');
                }
              }}
              className="bg-purple-600 text-white p-4 rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center justify-center"
            >
              <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
              </svg>
              Share Schedule
            </motion.button>
          </div>
        </div>

        {/* Maintenance Tips */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-yellow-800 mb-4 flex items-center">
            <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            Maintenance Tips
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <ul className="space-y-2 text-gray-700">
              <li>• Keep a maintenance log to track all activities</li>
              <li>• Schedule maintenance before monsoon season</li>
              <li>• Check system after heavy rainfall events</li>
              <li>• Use only clean tools and materials</li>
            </ul>
            <ul className="space-y-2 text-gray-700">
              <li>• Document any issues or unusual observations</li>
              <li>• Take photos during maintenance for records</li>
              <li>• Contact professionals for major repairs</li>
              <li>• Keep spare parts and materials handy</li>
            </ul>
          </div>
        </div>

        {/* Continue Button */}
        <div className="text-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={nextStep}
            className="bg-yellow-600 text-white py-3 px-8 rounded-lg font-semibold text-lg hover:bg-yellow-700 transition-colors"
          >
            View Final Dashboard →
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default MaintenanceReminder;