
import React, { useContext, useState } from 'react';
import { motion } from 'framer-motion';
import jsPDF from 'jspdf';
import { AppContext } from '../App';

const ReportGeneration = () => {
  const { appData, nextStep } = useContext(AppContext);
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(false);
  const [shareMethod, setShareMethod] = useState('');

  const generatePDFReport = async () => {
    setIsGenerating(true);
    
    // Simulate generation time
    await new Promise(resolve => setTimeout(resolve, 2000));

    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.width;
    const margin = 20;
    let yPosition = 30;

    // Helper function to add text with automatic line breaks
    const addText = (text, x, y, fontSize = 12, style = 'normal') => {
      pdf.setFontSize(fontSize);
      pdf.setFont(undefined, style);
      const lines = pdf.splitTextToSize(text, pageWidth - 2 * margin);
      pdf.text(lines, x, y);
      return y + (lines.length * fontSize * 0.6);
    };

    // Header
    pdf.setFillColor(59, 130, 246); // Blue
    pdf.rect(0, 0, pageWidth, 40, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(24);
    pdf.setFont(undefined, 'bold');
    pdf.text('Rainwater Harvesting Assessment Report', margin, 25);
    
    pdf.setFontSize(12);
    pdf.setFont(undefined, 'normal');
    pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, margin, 35);

    // Reset text color
    pdf.setTextColor(0, 0, 0);
    yPosition = 60;

    // Executive Summary
    yPosition = addText('EXECUTIVE SUMMARY', margin, yPosition, 16, 'bold');
    yPosition += 10;
    
    const summaryText = `This report provides a comprehensive analysis of rainwater harvesting potential for your property. Based on your roof area of ${appData.roofArea} sq meters and local rainfall data, we recommend implementing a ${appData.selectedStructure?.name || 'suitable structure'} to harvest approximately ${appData.harvestPotential?.annualPotential || 0} liters of water annually.`;
    
    yPosition = addText(summaryText, margin, yPosition, 11);
    yPosition += 15;

    // Property Details
    yPosition = addText('PROPERTY DETAILS', margin, yPosition, 16, 'bold');
    yPosition += 10;
    
    yPosition = addText(`Location: ${appData.location?.address || 'Not specified'}`, margin, yPosition, 11);
    yPosition = addText(`Roof Area: ${appData.roofArea} square meters`, margin, yPosition, 11);
    yPosition = addText(`Family Size: ${appData.familySize} members`, margin, yPosition, 11);
    yPosition = addText(`Available Space: ${appData.availableSpace || 'Not specified'}`, margin, yPosition, 11);
    yPosition += 15;

    // Environmental Data
    yPosition = addText('ENVIRONMENTAL DATA', margin, yPosition, 16, 'bold');
    yPosition += 10;
    
    if (appData.rainfallData) {
      yPosition = addText(`Annual Rainfall: ${Math.round(appData.rainfallData.annualAverage)} mm`, margin, yPosition, 11);
      yPosition = addText(`Rainy Days: ${Math.round(appData.rainfallData.rainyDays)} days per year`, margin, yPosition, 11);
      yPosition = addText(`Rainfall Reliability: ${Math.round(appData.rainfallData.reliability * 100)}%`, margin, yPosition, 11);
    }
    
    if (appData.groundwaterData) {
      yPosition = addText(`Groundwater Depth: ${Math.round(appData.groundwaterData.depthToWater)} meters`, margin, yPosition, 11);
      yPosition = addText(`Soil Type: ${appData.groundwaterData.soilType}`, margin, yPosition, 11);
      yPosition = addText(`Permeability: ${appData.groundwaterData.permeability}`, margin, yPosition, 11);
    }
    yPosition += 15;

    // Check if we need a new page
    if (yPosition > 250) {
      pdf.addPage();
      yPosition = 30;
    }

    // Recommended Structure
    yPosition = addText('RECOMMENDED STRUCTURE', margin, yPosition, 16, 'bold');
    yPosition += 10;
    
    if (appData.selectedStructure) {
      yPosition = addText(`Structure Type: ${appData.selectedStructure.name}`, margin, yPosition, 11);
      yPosition = addText(`Dimensions: ${appData.selectedStructure.dimensions}`, margin, yPosition, 11);
      yPosition = addText(`Capacity: ${appData.selectedStructure.capacity}`, margin, yPosition, 11);
      yPosition = addText(`Efficiency: ${appData.selectedStructure.efficiency}`, margin, yPosition, 11);
      yPosition = addText(`Estimated Cost: ${appData.selectedStructure.cost}`, margin, yPosition, 11);
      yPosition = addText(`Maintenance Level: ${appData.selectedStructure.maintenance}`, margin, yPosition, 11);
    }
    yPosition += 15;

    // Harvesting Potential
    yPosition = addText('HARVESTING POTENTIAL', margin, yPosition, 16, 'bold');
    yPosition += 10;
    
    if (appData.harvestPotential) {
      yPosition = addText(`Annual Potential: ${appData.harvestPotential.annualPotential?.toLocaleString() || 0} liters`, margin, yPosition, 11);
      yPosition = addText(`Monthly Average: ${appData.harvestPotential.monthlyAverage?.toLocaleString() || 0} liters`, margin, yPosition, 11);
      yPosition = addText(`Daily Average: ${appData.harvestPotential.dailyAverage?.toLocaleString() || 0} liters`, margin, yPosition, 11);
      yPosition = addText(`Family Water Need Coverage: ${appData.harvestPotential.familyBenefit || 0}%`, margin, yPosition, 11);
    }
    yPosition += 15;

    // Financial Analysis
    if (appData.costAnalysis) {
      yPosition = addText('FINANCIAL ANALYSIS', margin, yPosition, 16, 'bold');
      yPosition += 10;
      
      yPosition = addText(`Initial Investment: ₹${appData.costAnalysis.initialCost?.toLocaleString()}`, margin, yPosition, 11);
      yPosition = addText(`Annual Water Savings: ₹${Math.round(appData.costAnalysis.annualSavings)?.toLocaleString()}`, margin, yPosition, 11);
      yPosition = addText(`Net Annual Savings: ₹${Math.round(appData.costAnalysis.netAnnualSavings)?.toLocaleString()}`, margin, yPosition, 11);
      yPosition = addText(`Payback Period: ${appData.costAnalysis.paybackPeriod} years`, margin, yPosition, 11);
      yPosition = addText(`20-Year Net Benefit: ₹${Math.round(appData.costAnalysis.twentyYearSavings / 1000)}K`, margin, yPosition, 11);
      yPosition += 15;
    }

    // Environmental Impact
    yPosition = addText('ENVIRONMENTAL IMPACT', margin, yPosition, 16, 'bold');
    yPosition += 10;
    
    if (appData.costAnalysis?.environmental) {
      yPosition = addText(`Annual Water Conservation: ${appData.costAnalysis.environmental.waterSaved.toLocaleString()} liters`, margin, yPosition, 11);
      yPosition = addText(`CO2 Reduction: ${appData.costAnalysis.environmental.co2Saved} kg per year`, margin, yPosition, 11);
      yPosition = addText(`Energy Savings: ${appData.costAnalysis.environmental.energySaved} kWh per year`, margin, yPosition, 11);
    }
    yPosition += 15;

    // Check if we need a new page for recommendations
    if (yPosition > 200) {
      pdf.addPage();
      yPosition = 30;
    }

    // Recommendations
    yPosition = addText('RECOMMENDATIONS', margin, yPosition, 16, 'bold');
    yPosition += 10;
    
    const recommendations = [
      '1. Install a first-flush diverter to ensure water quality',
      '2. Regular maintenance every 3 months for optimal performance',
      '3. Consider water quality testing before consumption',
      '4. Install overflow provisions for excess water management',
      '5. Keep maintenance logs for system longevity'
    ];

    recommendations.forEach(rec => {
      yPosition = addText(rec, margin, yPosition, 11);
      yPosition += 2;
    });

    yPosition += 15;

    // Footer
    pdf.setFillColor(240, 240, 240);
    pdf.rect(0, pdf.internal.pageSize.height - 30, pageWidth, 30, 'F');
    
    pdf.setTextColor(100, 100, 100);
    pdf.setFontSize(10);
    pdf.text('Generated by Smart Rainwater Harvesting Assessment Platform', margin, pdf.internal.pageSize.height - 15);
    pdf.text('For technical support, contact: support@rwh-platform.com', margin, pdf.internal.pageSize.height - 5);

    // Save the PDF
    pdf.save('Rainwater-Harvesting-Assessment-Report.pdf');
    
    setIsGenerating(false);
    setReportGenerated(true);
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent('Rainwater Harvesting Assessment Report');
    const body = encodeURIComponent(`
Hi,

I've completed my rainwater harvesting assessment and wanted to share the key findings:

🏠 Property: ${appData.location?.address || 'Not specified'}
💧 Annual Potential: ${appData.harvestPotential?.annualPotential?.toLocaleString() || 0} liters
🏗️ Recommended Structure: ${appData.selectedStructure?.name || 'Not selected'}
💰 Investment: ${appData.selectedStructure?.cost || 'Not calculated'}
📈 Payback Period: ${appData.costAnalysis?.paybackPeriod || 'N/A'} years

This system could save approximately ₹${Math.round(appData.costAnalysis?.netAnnualSavings || 0).toLocaleString()} annually while contributing to water conservation.

Best regards
    `);
    
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
  };

  const shareViaSMS = () => {
    const message = encodeURIComponent(`Rainwater Harvesting Assessment: My ${appData.roofArea}m² roof can harvest ${appData.harvestPotential?.annualPotential?.toLocaleString() || 0} liters annually with ${appData.selectedStructure?.name || 'recommended structure'}. ROI in ${appData.costAnalysis?.paybackPeriod || 'N/A'} years!`);
    
    window.open(`sms:?body=${message}`, '_blank');
  };

  const copyToClipboard = async () => {
    const reportSummary = `
🏠 Rainwater Harvesting Assessment Summary

📍 Location: ${appData.location?.address || 'Not specified'}
📏 Roof Area: ${appData.roofArea} sq m
👥 Family Size: ${appData.familySize} members

🌧️ Annual Rainfall: ${Math.round(appData.rainfallData?.annualAverage || 0)} mm
💧 Harvest Potential: ${appData.harvestPotential?.annualPotential?.toLocaleString() || 0} liters/year
🏗️ Recommended: ${appData.selectedStructure?.name || 'Not selected'}

💰 Investment: ${appData.selectedStructure?.cost || 'Not calculated'}
📈 Annual Savings: ₹${Math.round(appData.costAnalysis?.netAnnualSavings || 0).toLocaleString()}
⏱️ Payback: ${appData.costAnalysis?.paybackPeriod || 'N/A'} years
🌱 CO₂ Saved: ${appData.costAnalysis?.environmental?.co2Saved || 0} kg/year

Generated by Smart RWH Assessment Platform
    `;

    try {
      await navigator.clipboard.writeText(reportSummary);
      alert('Report summary copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg p-8"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-orange-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Generate & Share Report
          </h2>
          <p className="text-gray-600">
            Create a detailed PDF report and share your assessment
          </p>
        </div>

        {/* Report Preview */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Report Preview</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Location:</span>
                <span className="font-semibold">{appData.location?.address || 'Not specified'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Roof Area:</span>
                <span className="font-semibold">{appData.roofArea} sq m</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Family Size:</span>
                <span className="font-semibold">{appData.familySize} members</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Annual Rainfall:</span>
                <span className="font-semibold">{Math.round(appData.rainfallData?.annualAverage || 0)} mm</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Harvest Potential:</span>
                <span className="font-semibold text-blue-600">
                  {appData.harvestPotential?.annualPotential?.toLocaleString() || 0} L/year
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Recommended Structure:</span>
                <span className="font-semibold">{appData.selectedStructure?.name || 'Not selected'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Investment:</span>
                <span className="font-semibold">{appData.selectedStructure?.cost || 'Not calculated'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payback Period:</span>
                <span className="font-semibold text-green-600">
                  {appData.costAnalysis?.paybackPeriod || 'N/A'} years
                </span>
              </div>
            </div>
          </div>

          {/* Key Highlights */}
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 mb-3">Key Highlights</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  ₹{Math.round(appData.costAnalysis?.netAnnualSavings || 0).toLocaleString()}
                </div>
                <div className="text-gray-600">Annual Savings</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {appData.costAnalysis?.environmental?.waterSaved?.toLocaleString() || 0}L
                </div>
                <div className="text-gray-600">Water Conserved</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 mb-1">
                  {appData.costAnalysis?.environmental?.co2Saved || 0}kg
                </div>
                <div className="text-gray-600">CO₂ Reduced</div>
              </div>
            </div>
          </div>
        </div>

        {/* PDF Generation */}
        <div className="text-center mb-8">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={generatePDFReport}
            disabled={isGenerating}
            className="bg-orange-600 text-white py-4 px-8 rounded-lg font-semibold text-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg mb-4"
          >
            {isGenerating ? (
              <div className="flex items-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-6 h-6 border-2 border-white border-t-transparent rounded-full mr-3"
                />
                Generating PDF Report...
              </div>
            ) : (
              <>
                📄 Generate PDF Report
              </>
            )}
          </motion.button>
          
          {reportGenerated && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-green-50 border border-green-200 rounded-lg p-4"
            >
              <div className="flex items-center justify-center mb-2">
                <svg className="w-6 h-6 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-green-800 font-semibold">PDF Report Generated Successfully!</span>
              </div>
              <p className="text-green-700 text-sm">
                Your detailed rainwater harvesting assessment report has been downloaded.
              </p>
            </motion.div>
          )}
        </div>

        {/* Sharing Options */}
        <div className="border-t border-gray-200 pt-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-6 text-center">Share Your Assessment</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={shareViaEmail}
              className="bg-blue-600 text-white p-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
              Email
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={shareViaSMS}
              className="bg-green-600 text-white p-4 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center"
            >
              <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
              </svg>
              SMS
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={copyToClipboard}
              className="bg-purple-600 text-white p-4 rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center justify-center"
            >
              <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
              </svg>
              Copy
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: 'Rainwater Harvesting Assessment',
                    text: `My property can harvest ${appData.harvestPotential?.annualPotential?.toLocaleString() || 0} liters annually!`,
                    url: window.location.href
                  });
                } else {
                  copyToClipboard();
                }
              }}
              className="bg-indigo-600 text-white p-4 rounded-lg font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center"
            >
              <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
              </svg>
              Share
            </motion.button>
          </div>
        </div>

        {/* Continue Button */}
        <div className="text-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={nextStep}
            className="bg-orange-600 text-white py-3 px-8 rounded-lg font-semibold text-lg hover:bg-orange-700 transition-colors"
          >
            Setup Maintenance Reminders →
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default ReportGeneration;

