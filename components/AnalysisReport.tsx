import React, { useState } from 'react';
import { AnalysisResult, LeadProfile } from '../types';
import { CheckCircle, ArrowRight, Download, FileText, Activity, AlertOctagon, TrendingUp, Layers } from 'lucide-react';
import { LeadForm } from './LeadForm';
import { jsPDF } from 'jspdf';

interface AnalysisReportProps {
  data: AnalysisResult;
  onReset: () => void;
  previewUrl: string | null;
  base64Image: string | null;
}

export const AnalysisReport: React.FC<AnalysisReportProps> = ({ data, onReset, previewUrl, base64Image }) => {
  // Check if user is already unlocked from localStorage
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
        
        // --- CONFIG & STYLES ---
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 15;
        const contentWidth = pageWidth - (margin * 2);
        
        // Colors
        const colors = {
            primary: [30, 41, 59],     // Slate 800
            secondary: [71, 85, 105],  // Slate 600
            accent: [37, 99, 235],     // Blue 600
            bgLight: [248, 250, 252],  // Slate 50
            border: [226, 232, 240],   // Slate 200
            white: [255, 255, 255],
            red: [220, 38, 38],        // Red 600
            orange: [234, 88, 12],     // Orange 600
            green: [22, 163, 74],      // Green 600
            textDark: [15, 23, 42],    // Slate 900
            textGray: [100, 116, 139]  // Slate 500
        };

        // Helper Functions
        const setFill = (c: number[]) => doc.setFillColor(c[0], c[1], c[2]);
        const setText = (c: number[]) => doc.setTextColor(c[0], c[1], c[2]);
        const setDraw = (c: number[]) => doc.setDrawColor(c[0], c[1], c[2]);
        const setFont = (type: 'bold' | 'normal', size: number = 10) => {
             doc.setFont("helvetica", type);
             doc.setFontSize(size);
        };

        let yPos = margin;

        // --- HEADER ---
        const drawHeader = () => {
            // Top Bar Background
            setFill(colors.primary);
            doc.rect(0, 0, pageWidth, 24, 'F');
            
            // Branding
            setText(colors.white);
            setFont('bold', 14);
            doc.text("AusBuild Inspect AI", margin, 11);
            
            setFont('normal', 8);
            setText(colors.textGray);
            doc.text("PRELIMINARY DEFECT ASSESSMENT", margin, 17);

            // Metadata Right
            const dateStr = new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
            setFont('normal', 9);
            setText(colors.white);
            doc.text(dateStr, pageWidth - margin, 11, { align: 'right' });
            
            setText(colors.textGray);
            setFont('normal', 7);
            doc.text(`ID: ${Math.random().toString(36).substr(2, 9).toUpperCase()}`, pageWidth - margin, 17, { align: 'right' });
            
            return 38; // Return start Y for content
        };

        yPos = drawHeader();

        // --- SECTION 1: EXECUTIVE DASHBOARD ---
        
        // Section Title
        setText(colors.textDark);
        setFont('bold', 11);
        doc.text("EXECUTIVE OVERVIEW", margin, yPos - 5);
        setDraw(colors.border);
        doc.line(margin, yPos - 3, pageWidth - margin, yPos - 3);

        const summaryBoxHeight = 80;
        
        // 1. Image (Left Column)
        const imgDim = 65;
        if (base64Image) {
            try {
                setDraw(colors.border);
                doc.rect(margin, yPos, imgDim, imgDim);
                doc.addImage(`data:image/jpeg;base64,${base64Image}`, 'JPEG', margin + 1, yPos + 1, imgDim - 2, imgDim - 2, undefined, 'FAST');
            } catch (err) {
                console.warn("PDF Image Error", err);
            }
        }

        // 2. Data (Right Column)
        const rightColX = margin + imgDim + 10;
        const rightColWidth = contentWidth - imgDim - 10;
        let rightY = yPos + 2;

        // Severity Score Title
        setFont('bold', 8);
        setText(colors.textGray);
        doc.text("RISK SEVERITY SCORE", rightColX, rightY);

        // Score Value
        const scoreVal = data.severityScore;
        const scoreColor = scoreVal > 70 ? colors.red : scoreVal > 40 ? colors.orange : colors.green;
        
        setFont('bold', 36);
        setText(scoreColor);
        doc.text(scoreVal.toString(), rightColX, rightY + 14);
        
        setFont('bold', 12);
        setText(colors.textGray);
        doc.text("/ 100", rightColX + 22, rightY + 14);

        // Severity Badge
        const badgeText = scoreVal > 70 ? "CRITICAL ATTENTION" : scoreVal > 40 ? "MODERATE RISK" : "LOW RISK";
        const badgeWidth = doc.getTextWidth(badgeText) + 8;
        setFill(scoreColor);
        doc.roundedRect(rightColX + 55, rightY + 5, badgeWidth, 6, 1, 1, 'F');
        setText(colors.white);
        setFont('bold', 7);
        doc.text(badgeText, rightColX + 59, rightY + 9);

        // Summary Title
        rightY += 30;
        setFont('bold', 9);
        setText(colors.textDark);
        doc.text("SUMMARY OF FINDINGS", rightColX, rightY);
        
        // Summary Text
        rightY += 5;
        setFont('normal', 9);
        setText(colors.secondary);
        const splitSummary = doc.splitTextToSize(data.summary, rightColWidth);
        doc.text(splitSummary, rightColX, rightY);

        yPos += summaryBoxHeight;

        // --- SECTION 2: DETAILED FINDINGS ---
        
        // Header
        setText(colors.textDark);
        setFont('bold', 11);
        doc.text("DETAILED DEFECT ANALYSIS", margin, yPos);
        setDraw(colors.border);
        doc.line(margin, yPos + 2, pageWidth - margin, yPos + 2);
        yPos += 12;

        // Issues Loop
        data.issues.forEach((issue, index) => {
            // Layout Calculations
            const colWidth = (contentWidth / 2) - 8;
            const descLines = doc.splitTextToSize(issue.visualDescription, colWidth);
            const causeLines = doc.splitTextToSize(issue.possibleCause, colWidth);
            const recLines = doc.splitTextToSize(issue.recommendation, contentWidth - 16);
            
            const contentRowHeight = Math.max(descLines.length, causeLines.length) * 4;
            const recRowHeight = recLines.length * 4;
            
            // Total Card Height: Header(10) + Gap(6) + Content(row) + Gap(6) + RecBox(row+10) + Padding(4)
            const cardHeight = 10 + 6 + contentRowHeight + 6 + (recRowHeight + 12) + 4;

            // Page Break Check
            if (yPos + cardHeight > pageHeight - 20) {
                doc.addPage();
                drawHeader();
                yPos = 38;
                
                // Re-draw section header
                setText(colors.textDark);
                setFont('bold', 11);
                doc.text("DETAILED DEFECT ANALYSIS (CONT.)", margin, yPos - 5);
                setDraw(colors.border);
                doc.line(margin, yPos - 3, pageWidth - margin, yPos - 3);
            }

            // Colors for this card
            const sevColor = issue.severity === 'High' ? colors.red : issue.severity === 'Moderate' ? colors.orange : colors.accent;

            // 1. Card Container
            setDraw(colors.border);
            setFill(colors.white);
            doc.roundedRect(margin, yPos, contentWidth, cardHeight, 1.5, 1.5, 'FD');
            
            // 2. Left Color Strip
            setFill(sevColor);
            doc.rect(margin, yPos, 1.5, cardHeight, 'F'); // Simple left border

            // 3. Card Header
            const contentX = margin + 8;
            let currentY = yPos + 8;

            // Number Circle
            setFill(sevColor);
            doc.circle(contentX, currentY - 1.5, 3, 'F');
            setText(colors.white);
            setFont('bold', 7);
            doc.text(`${index + 1}`, contentX, currentY - 0.5, { align: 'center' });

            // Category Title
            setText(colors.textDark);
            setFont('bold', 10);
            doc.text(issue.category.toUpperCase(), contentX + 6, currentY);

            // Severity & Urgency (Right)
            setFont('bold', 8);
            setText(sevColor);
            const sevText = `${issue.severity.toUpperCase()} • ${issue.urgency.toUpperCase()}`;
            doc.text(sevText, margin + contentWidth - 8, currentY, { align: 'right' });

            // Divider Line
            currentY += 4;
            setDraw(colors.bgLight);
            doc.line(margin + 4, currentY, margin + contentWidth - 4, currentY);

            // 4. Content Columns
            currentY += 5;
            
            // Labels
            setFont('bold', 7);
            setText(colors.textGray);
            doc.text("OBSERVATION", contentX, currentY);
            const col2X = contentX + colWidth + 5;
            doc.text("LIKELY CAUSE", col2X, currentY);

            // Text content
            currentY += 4;
            setFont('normal', 9);
            setText(colors.primary);
            doc.text(descLines, contentX, currentY);
            doc.text(causeLines, col2X, currentY);

            currentY += contentRowHeight + 5;

            // 5. Remediation Box
            setFill(colors.bgLight);
            setDraw(colors.bgLight); // Invisible border
            // Draw box background
            doc.roundedRect(contentX - 3, currentY - 3, contentWidth - 10, recRowHeight + 10, 1, 1, 'F');

            setFont('bold', 7);
            setText(colors.accent);
            doc.text("REMEDIATION STRATEGY", contentX, currentY + 1);
            
            currentY += 5;
            setFont('normal', 9);
            setText(colors.primary);
            doc.text(recLines, contentX, currentY);

            // Update Main Y
            yPos += cardHeight + 6; // Spacer between cards
        });

        // --- FOOTER SECTION ---
        // Ensure space for disclaimer
        if (yPos + 35 > pageHeight - 20) {
            doc.addPage();
            drawHeader();
            yPos = 38;
        } else {
            yPos += 5;
        }

        // Disclaimer Box
        setDraw(colors.border);
        setFill(colors.bgLight);
        doc.rect(margin, yPos, contentWidth, 25, 'FD');
        
        setFont('bold', 8);
        setText(colors.textDark);
        doc.text("IMPORTANT DISCLAIMER", margin + 5, yPos + 7);
        
        setFont('normal', 7);
        setText(colors.textGray);
        const disLines = doc.splitTextToSize(data.disclaimer, contentWidth - 10);
        doc.text(disLines, margin + 5, yPos + 12);

        // Page Numbers Loop
        const pageCount = doc.getNumberOfPages();
        for(let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            
            // Bottom Divider
            setDraw(colors.border);
            doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);
            
            // Text
            setFont('normal', 7);
            setText(colors.textGray);
            doc.text(`AusBuild Inspect AI Generated Report`, margin, pageHeight - 7);
            doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin, pageHeight - 7, { align: 'right' });
        }

        doc.save(`AusBuild-Report-${new Date().toISOString().slice(0,10)}.pdf`);
    } catch (e) {
        console.error("PDF Generation Error", e);
        alert("Failed to generate PDF. Please try again.");
    } finally {
        setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="w-full pb-12">
      
      {/* 1. Dashboard Header: Summary & Severity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 animate-fade-in no-print">
         
         {/* Main Summary Card */}
         <div className="lg:col-span-2 bg-white rounded-2xl p-5 sm:p-8 border border-slate-200 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <FileText className="w-24 h-24 sm:w-32 sm:h-32" />
            </div>
            <div className="relative z-10">
                <h3 className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 sm:mb-4 flex items-center gap-2">
                    <Activity className="w-3.5 h-3.5 text-blue-500" /> 
                    AI Executive Summary
                </h3>
                {/* Updated Typography for Mobile */}
                <p className="text-slate-800 text-sm sm:text-lg leading-relaxed font-medium text-justify sm:text-left">
                    {data.summary}
                </p>
                <div className="mt-5 sm:mt-6 flex flex-wrap gap-2">
                    {data.topCategories.map((cat, i) => (
                        <span key={i} className="inline-flex items-center px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md text-[9px] sm:text-xs font-bold uppercase tracking-wide border border-slate-200 group-hover:border-blue-200 group-hover:bg-blue-50 transition-colors">
                           <Layers className="w-3 h-3 mr-1.5 text-slate-400 group-hover:text-blue-500" /> {cat}
                        </span>
                    ))}
                </div>
            </div>
         </div>

         {/* Severity Gauge Card */}
         <div className="bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-800 shadow-2xl text-white flex flex-col items-center justify-center relative overflow-hidden">
             {/* Background Effects */}
             <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-blue-500/5 blur-3xl pointer-events-none"></div>
             
             <h3 className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 sm:mb-6 z-10 flex items-center gap-2">
                 Risk Severity Index
             </h3>
             
             <div className="relative w-full max-w-[180px] sm:max-w-[200px] aspect-[2/1] mb-1 z-10">
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
                        <span className="text-[10px] sm:text-xs font-medium text-slate-500 align-top ml-1 relative top-1">/100</span>
                     </div>
                </div>
             </div>
             
             <div className={`mt-3 px-4 py-1.5 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-wide border backdrop-blur-sm ${
                data.severityScore > 70 ? 'bg-red-500/10 border-red-500/20 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.25)]' : 
                data.severityScore > 40 ? 'bg-orange-500/10 border-orange-500/20 text-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.25)]' : 
                'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.25)]'
             }`}>
                {data.severityScore > 70 ? 'Critical Attention' : data.severityScore > 40 ? 'Moderate Risk' : 'Low Risk'}
             </div>
         </div>
      </div>

      {/* 2. Detailed Breakdown (Gated) */}
      <div className="relative mt-8 sm:mt-12">
        
        {!isUnlocked && (
           <div className="absolute inset-0 z-20 backdrop-blur-[4px] bg-white/30 flex items-start justify-center pt-20 rounded-3xl no-print">
              <LeadForm onSubmit={handleUnlock} analysisData={data} />
           </div>
        )}

        <div className={`transition-all duration-700 ${!isUnlocked ? 'select-none opacity-80 h-[600px] overflow-hidden' : 'opacity-100'}`}>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 px-1 gap-4">
             <h2 className="text-lg sm:text-2xl font-bold text-slate-900 flex items-center">
               <AlertOctagon className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 text-slate-400" />
               Detailed Defect Findings
             </h2>
             
             {isUnlocked && (
                <button 
                  onClick={generatePDF}
                  disabled={isGeneratingPdf}
                  className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-colors shadow-sm no-print"
                >
                  {isGeneratingPdf ? <Activity className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  <span>Export Report (PDF)</span>
                </button>
             )}
          </div>
            
          <div className="grid gap-4 sm:gap-6 break-inside-avoid">
            {data.issues.map((issue, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden group hover:shadow-md transition-shadow">
                 {/* Issue Header */}
                 <div className="border-b border-slate-100 p-3 sm:p-4 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                     <div className="flex items-center">
                        <span className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold mr-3 shrink-0 ${
                            issue.severity === 'High' ? 'bg-red-100 text-red-600' : issue.severity === 'Moderate' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'
                        }`}>
                            {index + 1}
                        </span>
                        <div className="min-w-0">
                            <h3 className="font-bold text-slate-900 text-sm sm:text-base truncate pr-2">{issue.category}</h3>
                            <span className="text-[10px] sm:text-xs text-slate-500 block">Detected via Visual Analysis</span>
                        </div>
                     </div>
                     <div className="flex items-center gap-2 sm:space-x-3">
                         <span className={`px-2 py-1 rounded text-[9px] sm:text-[10px] font-bold uppercase tracking-wide border whitespace-nowrap ${
                             issue.severity === 'High' ? 'bg-red-50 text-red-700 border-red-100' : 
                             issue.severity === 'Moderate' ? 'bg-orange-50 text-orange-700 border-orange-100' : 
                             'bg-yellow-50 text-yellow-700 border-yellow-100'
                         }`}>
                             {issue.severity}
                         </span>
                         <span className="px-2 py-1 bg-slate-200 text-slate-600 text-[9px] sm:text-[10px] font-bold uppercase tracking-wide rounded whitespace-nowrap">
                             {issue.urgency}
                         </span>
                     </div>
                 </div>

                 {/* Issue Content */}
                 <div className="p-4 sm:p-6 grid md:grid-cols-12 gap-5 sm:gap-6">
                     <div className="md:col-span-7 space-y-4">
                        <div>
                            <h4 className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Observation</h4>
                            <p className="text-slate-800 leading-relaxed text-xs sm:text-sm">{issue.visualDescription}</p>
                        </div>
                        <div>
                            <h4 className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Likely Cause</h4>
                            <p className="text-slate-600 leading-relaxed text-xs sm:text-sm">{issue.possibleCause}</p>
                        </div>
                     </div>
                     <div className="md:col-span-5 bg-blue-50/50 rounded-lg p-4 sm:p-5 border border-blue-100/50">
                        <h4 className="text-[9px] sm:text-[10px] font-bold text-blue-800 uppercase tracking-widest mb-2 flex items-center">
                            <TrendingUp className="w-3 h-3 mr-1" /> Remediation Strategy
                        </h4>
                        <p className="text-slate-700 text-xs sm:text-sm mb-4 leading-relaxed">
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
          <div className="mt-8 sm:mt-12 grid md:grid-cols-2 gap-4 sm:gap-8 break-inside-avoid">
             <div className="bg-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-2xl">
                <h3 className="font-bold text-base sm:text-xl mb-4 sm:mb-6">Homeowner Checklist</h3>
                <ul className="space-y-3 sm:space-y-4">
                  {data.nextSteps.map((step, idx) => (
                    <li key={idx} className="flex items-start">
                      <div className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-blue-600 flex items-center justify-center text-[10px] sm:text-xs font-bold mt-0.5 mr-3">
                        {idx + 1}
                      </div>
                      <span className="text-slate-300 text-xs sm:text-sm leading-relaxed">{step}</span>
                    </li>
                  ))}
                </ul>
             </div>

             <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 sm:p-8 text-white shadow-2xl flex flex-col items-center justify-center text-center no-print relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <CheckCircle className="w-24 h-24 sm:w-32 sm:h-32" />
                </div>
                <div className="relative z-10">
                    <h3 className="font-bold text-lg sm:text-2xl mb-2">Finalize Your Inspection</h3>
                    <p className="text-blue-100 text-xs sm:text-sm mb-6 sm:mb-8 max-w-xs mx-auto">
                    This AI scan is an indicator. For legal compliance and insurance, book a certified physical inspection.
                    </p>
                    <button 
                    onClick={handleBooking}
                    className="w-full bg-white text-blue-700 font-bold py-3.5 sm:py-4 px-6 rounded-xl hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-xs sm:text-sm"
                    >
                    Book Certified Inspector
                    </button>
                </div>
             </div>
          </div>
        </div>
      </div>

      <div className="mt-12 sm:mt-16 pt-8 border-t border-slate-200 text-center px-4">
         <p className="text-[9px] sm:text-[10px] text-slate-400 max-w-3xl mx-auto leading-normal">
           {data.disclaimer}
         </p>
         <button onClick={onReset} className="mt-6 text-xs sm:text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors no-print">
           Start New Analysis
         </button>
      </div>
    </div>
  );
};