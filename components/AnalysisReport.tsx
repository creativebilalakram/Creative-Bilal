import React, { useState } from 'react';
import { AnalysisResult, LeadProfile } from '../types';
import { CheckCircle, ArrowRight, Download, FileText, Activity, AlertOctagon, TrendingUp, Layers } from 'lucide-react';
import { LeadForm } from './LeadForm';
import { jsPDF } from 'jspdf';

interface AnalysisReportProps {
  data: AnalysisResult;
  onReset: () => void;
  previewUrl: string | null;
}

export const AnalysisReport: React.FC<AnalysisReportProps> = ({ data, onReset, previewUrl }) => {
  // FEATURE FIX: Initialize state DIRECTLY from localStorage.
  // This ensures the form is hidden immediately on the first render if data exists.
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
        return !!localStorage.getItem('ausbuild_user_profile');
    }
    return false;
  });

  const [lead, setLead] = useState<LeadProfile | null>(() => {
      if (typeof window !== 'undefined') {
          const saved = localStorage.getItem('ausbuild_user_profile');
          return saved ? JSON.parse(saved) : null;
      }
      return null;
  });
  
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const handleUnlock = (profile: LeadProfile) => {
    console.log("Lead captured:", profile);
    setLead(profile);
    setIsUnlocked(true);
  };

  const handleBooking = () => {
    window.open("https://calendly.com/", "_blank");
  };

  const generatePDF = async () => {
    setIsGeneratingPdf(true);
    try {
        const doc = new jsPDF();
        let yPos = 20;

        doc.setFontSize(22);
        doc.setTextColor(37, 99, 235);
        doc.text("AusBuild Inspect AI", 20, yPos);
        
        yPos += 10;
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text("Preliminary Visual Defect Report", 20, yPos);
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 150, yPos);

        yPos += 15;
        doc.setDrawColor(200);
        doc.line(20, yPos - 5, 190, yPos - 5);
        
        doc.setFontSize(14);
        doc.setTextColor(0);
        doc.text("Inspection Summary", 20, yPos);
        yPos += 7;
        
        doc.setFontSize(10);
        doc.setTextColor(50);
        const splitSummary = doc.splitTextToSize(data.summary, 170);
        doc.text(splitSummary, 20, yPos);
        yPos += splitSummary.length * 5 + 5;

        doc.setFontSize(11);
        doc.setTextColor(0);
        doc.text(`Calculated Severity Score: ${data.severityScore}/100`, 20, yPos);
        yPos += 10;

        doc.setFontSize(14);
        doc.text("Detected Issues", 20, yPos);
        yPos += 10;

        data.issues.forEach((issue, index) => {
            if (yPos > 270) {
                doc.addPage();
                yPos = 20;
            }
            
            doc.setFontSize(11);
            doc.setTextColor(0);
            doc.text(`${index + 1}. ${issue.category} (${issue.severity} Severity)`, 20, yPos);
            yPos += 6;

            doc.setFontSize(10);
            doc.setTextColor(80);
            const desc = `Observation: ${issue.visualDescription}`;
            const splitDesc = doc.splitTextToSize(desc, 160);
            doc.text(splitDesc, 25, yPos);
            yPos += splitDesc.length * 5;

            const cause = `Possible Cause: ${issue.possibleCause}`;
            const splitCause = doc.splitTextToSize(cause, 160);
            doc.text(splitCause, 25, yPos);
            yPos += splitCause.length * 5;

            const rec = `Recommendation: ${issue.recommendation}`;
            const splitRec = doc.splitTextToSize(rec, 160);
            doc.text(splitRec, 25, yPos);
            yPos += splitRec.length * 5 + 5;
        });

        yPos += 10;
        if (yPos > 260) {
            doc.addPage();
            yPos = 20;
        }
        
        doc.setDrawColor(200);
        doc.line(20, yPos, 190, yPos);
        yPos += 10;
        
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text("DISCLAIMER:", 20, yPos);
        yPos += 5;
        const disclaimerText = data.disclaimer;
        const splitDisclaimer = doc.splitTextToSize(disclaimerText, 170);
        doc.text(splitDisclaimer, 20, yPos);

        doc.save(`AusBuild-Report-${new Date().toISOString().slice(0,10)}.pdf`);
    } catch (e) {
        console.error("PDF Generation Error", e);
        alert("Failed to generate PDF. Please use browser print instead.");
    } finally {
        setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="w-full pb-12">
      
      {/* 1. Dashboard Header: Summary & Severity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 animate-fade-in no-print">
         
         {/* Main Summary Card */}
         <div className="lg:col-span-2 bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <FileText className="w-32 h-32" />
            </div>
            <div className="relative z-10">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-blue-500" /> 
                    AI Executive Summary
                </h3>
                <p className="text-slate-800 text-base sm:text-lg leading-relaxed font-medium">
                    {data.summary}
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                    {data.topCategories.map((cat, i) => (
                        <span key={i} className="inline-flex items-center px-3 py-1 bg-slate-100 text-slate-600 rounded-md text-xs font-bold uppercase tracking-wide border border-slate-200 group-hover:border-blue-200 group-hover:bg-blue-50 transition-colors">
                           <Layers className="w-3 h-3 mr-1.5 text-slate-400 group-hover:text-blue-500" /> {cat}
                        </span>
                    ))}
                </div>
            </div>
         </div>

         {/* Severity Gauge Card - UPDATED */}
         <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-2xl text-white flex flex-col items-center justify-center relative overflow-hidden">
             {/* Background Effects */}
             <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-blue-500/5 blur-3xl pointer-events-none"></div>
             
             <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 z-10 flex items-center gap-2">
                 Risk Severity Index
             </h3>
             
             <div className="relative w-full max-w-[200px] aspect-[2/1] mb-1 z-10">
                <svg viewBox="0 0 200 100" className="w-full h-full overflow-visible">
                    {/* Gradients */}
                    <defs>
                        <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#10b981" />
                            <stop offset="50%" stopColor="#f97316" />
                            <stop offset="100%" stopColor="#ef4444" />
                        </linearGradient>
                        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                            <feMerge>
                                <feMergeNode in="coloredBlur"/>
                                <feMergeNode in="SourceGraphic"/>
                            </feMerge>
                        </filter>
                    </defs>
                    
                    {/* Background Track */}
                    <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#1e293b" strokeWidth="12" strokeLinecap="round" />
                    
                    {/* Active Track with Gradient and Animation */}
                    <path 
                        d="M 20 100 A 80 80 0 0 1 180 100" 
                        fill="none" 
                        stroke="url(#gaugeGradient)" 
                        strokeWidth="12" 
                        strokeLinecap="round" 
                        strokeDasharray="251.2" 
                        strokeDashoffset={251.2 * (1 - data.severityScore / 100)}
                        filter="url(#glow)"
                        className="transition-all duration-1500 ease-out"
                        style={{ transitionProperty: 'stroke-dashoffset' }}
                    />
                </svg>

                {/* Center Value */}
                <div className="absolute bottom-0 left-0 w-full text-center transform translate-y-1">
                     <div className="text-4xl sm:text-5xl font-black tracking-tighter text-white drop-shadow-2xl">
                        {data.severityScore}
                        <span className="text-xs sm:text-sm font-medium text-slate-500 align-top ml-1 relative top-1">/100</span>
                     </div>
                </div>
             </div>
             
             <div className={`mt-3 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wide border backdrop-blur-sm ${
                data.severityScore > 70 ? 'bg-red-500/10 border-red-500/20 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.25)]' : 
                data.severityScore > 40 ? 'bg-orange-500/10 border-orange-500/20 text-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.25)]' : 
                'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.25)]'
             }`}>
                {data.severityScore > 70 ? 'Critical Attention' : data.severityScore > 40 ? 'Moderate Risk' : 'Low Risk'}
             </div>
         </div>
      </div>

      {/* 2. Detailed Breakdown (Gated) */}
      <div className="relative mt-12">
        
        {!isUnlocked && (
           <div className="absolute inset-0 z-20 backdrop-blur-[4px] bg-white/30 flex items-start justify-center pt-20 rounded-3xl no-print">
              <LeadForm onSubmit={handleUnlock} />
           </div>
        )}

        <div className={`transition-all duration-700 ${!isUnlocked ? 'select-none opacity-80 h-[600px] overflow-hidden' : 'opacity-100'}`}>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 px-1 gap-4">
             <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center">
               <AlertOctagon className="w-6 h-6 mr-3 text-slate-400" />
               Detailed Defect Findings
             </h2>
             
             {isUnlocked && (
                <button 
                  onClick={generatePDF}
                  disabled={isGeneratingPdf}
                  className="flex items-center space-x-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-sm no-print w-full sm:w-auto justify-center"
                >
                  {isGeneratingPdf ? <Activity className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  <span>Export Report</span>
                </button>
             )}
          </div>
            
          <div className="grid gap-6 break-inside-avoid">
            {data.issues.map((issue, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden group hover:shadow-md transition-shadow">
                 {/* Issue Header */}
                 <div className="border-b border-slate-100 p-4 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                     <div className="flex items-center">
                        <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-3 shrink-0 ${
                            issue.severity === 'High' ? 'bg-red-100 text-red-600' : issue.severity === 'Moderate' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'
                        }`}>
                            {index + 1}
                        </span>
                        <div className="min-w-0">
                            <h3 className="font-bold text-slate-900 text-base truncate pr-2">{issue.category}</h3>
                            <span className="text-xs text-slate-500 block">Detected via Visual Analysis</span>
                        </div>
                     </div>
                     <div className="flex items-center flex-wrap gap-2 sm:space-x-3">
                         <span className={`px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wide border whitespace-nowrap ${
                             issue.severity === 'High' ? 'bg-red-50 text-red-700 border-red-100' : 
                             issue.severity === 'Moderate' ? 'bg-orange-50 text-orange-700 border-orange-100' : 
                             'bg-yellow-50 text-yellow-700 border-yellow-100'
                         }`}>
                             {issue.severity} Severity
                         </span>
                         <span className="px-2.5 py-1 bg-slate-200 text-slate-600 text-xs font-bold uppercase tracking-wide rounded whitespace-nowrap">
                             {issue.urgency}
                         </span>
                     </div>
                 </div>

                 {/* Issue Content */}
                 <div className="p-5 sm:p-6 grid md:grid-cols-12 gap-6">
                     <div className="md:col-span-7 space-y-4">
                        <div>
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Observation</h4>
                            <p className="text-slate-800 leading-relaxed text-sm">{issue.visualDescription}</p>
                        </div>
                        <div>
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Likely Cause</h4>
                            <p className="text-slate-600 leading-relaxed text-sm">{issue.possibleCause}</p>
                        </div>
                     </div>
                     <div className="md:col-span-5 bg-blue-50/50 rounded-lg p-5 border border-blue-100/50">
                        <h4 className="text-xs font-bold text-blue-800 uppercase tracking-widest mb-2 flex items-center">
                            <TrendingUp className="w-3 h-3 mr-1" /> Remediation Strategy
                        </h4>
                        <p className="text-slate-700 text-sm mb-4">
                            {issue.recommendation}
                        </p>
                        <button onClick={handleBooking} className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center group/btn no-print">
                            Consult an Expert <ArrowRight className="w-3 h-3 ml-1 group-hover/btn:translate-x-1 transition-transform" />
                        </button>
                     </div>
                 </div>
              </div>
            ))}
          </div>

          {/* Action Footer */}
          <div className="mt-12 grid md:grid-cols-2 gap-8 break-inside-avoid">
             <div className="bg-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-2xl">
                <h3 className="font-bold text-lg sm:text-xl mb-6">Homeowner Checklist</h3>
                <ul className="space-y-4">
                  {data.nextSteps.map((step, idx) => (
                    <li key={idx} className="flex items-start">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold mt-0.5 mr-3">
                        {idx + 1}
                      </div>
                      <span className="text-slate-300 text-sm leading-relaxed">{step}</span>
                    </li>
                  ))}
                </ul>
             </div>

             <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 sm:p-8 text-white shadow-2xl flex flex-col items-center justify-center text-center no-print relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <CheckCircle className="w-32 h-32" />
                </div>
                <div className="relative z-10">
                    <h3 className="font-bold text-xl sm:text-2xl mb-2">Finalize Your Inspection</h3>
                    <p className="text-blue-100 text-sm mb-8 max-w-xs mx-auto">
                    This AI scan is an indicator. For legal compliance and insurance, book a certified physical inspection.
                    </p>
                    <button 
                    onClick={handleBooking}
                    className="w-full bg-white text-blue-700 font-bold py-4 px-6 rounded-xl hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                    Book Certified Inspector
                    </button>
                </div>
             </div>
          </div>
        </div>
      </div>

      <div className="mt-16 pt-8 border-t border-slate-200 text-center px-4">
         <p className="text-[10px] text-slate-400 max-w-3xl mx-auto leading-normal">
           {data.disclaimer}
         </p>
         <button onClick={onReset} className="mt-6 text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors no-print">
           Start New Analysis
         </button>
      </div>
    </div>
  );
};