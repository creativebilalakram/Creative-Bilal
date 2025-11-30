import React, { useState, useEffect, useRef } from 'react';
import { Hero } from './components/Hero';
import { AnalysisReport } from './components/AnalysisReport';
import { analyzeBuildingImage } from './services/geminiService';
import { AnalysisResult, LoadingState } from './types';
import { AlertTriangle, Cpu, Activity, Database, CheckCircle2, Zap, BarChart3, ScanLine, ArrowRight } from 'lucide-react';

const SCAN_STEPS = [
  "Initializing vision models...",
  "Segmenting structural elements...",
  "Detecting surface anomalies...",
  "Analyzing material texture...",
  "Cross-referencing AU Standards...",
  "Calculating severity score...",
  "Generating repair recommendations...",
  "Finalizing report..."
];

const App: React.FC = () => {
  const [loadingState, setLoadingState] = useState<LoadingState>({ status: 'idle' });
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  // Animation States
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStepIndex, setScanStepIndex] = useState(0);

  // --- IFRAME RESIZER LOGIC (IMPROVED) ---
  useEffect(() => {
    const sendHeight = () => {
      // We target the 'root' div because document.body.scrollHeight can sometimes 
      // get stuck at a larger size in iframes.
      const rootElement = document.getElementById('root');
      if (rootElement) {
        // Add a tiny buffer (10px) to prevent scrollbar flickering
        const height = rootElement.offsetHeight + 10;
        window.parent.postMessage({ type: 'setHeight', height: height }, '*');
      }
    };

    // 1. Send height immediately on load
    sendHeight();

    // 2. Observer for DOM changes (animations, expanding sections)
    const resizeObserver = new ResizeObserver(() => {
      sendHeight();
    });
    
    const rootEl = document.getElementById('root');
    if (rootEl) {
      resizeObserver.observe(rootEl);
    }

    // 3. Fallback interval to catch anything the observer misses
    const interval = setInterval(sendHeight, 500);

    // 4. Force update when key states change (Resetting, Loading finishing)
    // This timeout ensures React has finished painting the new layout (e.g. shrinking back to Hero)
    const stateChangeTimeout = setTimeout(sendHeight, 100);

    return () => {
      resizeObserver.disconnect();
      clearInterval(interval);
      clearTimeout(stateChangeTimeout);
    };
  }, [result, loadingState, scanStepIndex, previewUrl]); 

  useEffect(() => {
    let progressInterval: ReturnType<typeof setInterval>;
    let stepInterval: ReturnType<typeof setInterval>;

    if (loadingState.status === 'analyzing') {
      setScanProgress(0);
      setScanStepIndex(0);

      // Smooth progress bar simulation (caps at 90% until complete)
      progressInterval = setInterval(() => {
        setScanProgress(prev => {
           if (prev >= 92) return prev;
           return prev + (Math.random() * 2); 
        });
      }, 150);

      // Cycle through technical steps
      stepInterval = setInterval(() => {
        setScanStepIndex(prev => (prev + 1) % SCAN_STEPS.length);
      }, 1200);
    } else if (loadingState.status === 'success') {
       setScanProgress(100);
    }

    return () => {
      clearInterval(progressInterval);
      clearInterval(stepInterval);
    };
  }, [loadingState.status]);

  // Utility to compress image to avoid API payload limits (RPC errors)
  const compressImage = async (file: File): Promise<{ base64: string, mimeType: string }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Canvas context not available'));
            return;
          }

          // Resize to max 1024px to ensure payload is under API limits
          const MAX_DIMENSION = 1024;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_DIMENSION) {
              height *= MAX_DIMENSION / width;
              width = MAX_DIMENSION;
            }
          } else {
            if (height > MAX_DIMENSION) {
              width *= MAX_DIMENSION / height;
              height = MAX_DIMENSION;
            }
          }

          canvas.width = width;
          canvas.height = height;

          // Draw and compress
          ctx.drawImage(img, 0, 0, width, height);
          
          // Force JPEG with 0.7 quality for optimal size/quality ratio
          const mimeType = 'image/jpeg';
          const dataUrl = canvas.toDataURL(mimeType, 0.7);
          
          // Remove prefix "data:image/jpeg;base64,"
          const base64 = dataUrl.split(',')[1];
          resolve({ base64, mimeType });
        };
        img.onerror = (e) => reject(e);
      };
      reader.onerror = (e) => reject(e);
    });
  };

  const handleImageSelected = async (file: File) => {
    // 1. Show preview immediately
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setLoadingState({ status: 'analyzing', message: 'Scanning image for defects...' });
    setResult(null);
    
    // Scroll to top lightly to ensure user sees the scanner
    window.scrollTo({ top: 0, behavior: 'smooth' });

    try {
      // 2. Compress image to prevent XHR/RPC errors
      const { base64, mimeType } = await compressImage(file);

      // 3. Send to API
      const data = await analyzeBuildingImage(base64, mimeType);
      setResult(data);
      setLoadingState({ status: 'success' });
    } catch (error) {
      console.error("Analysis failed:", error);
      setLoadingState({ 
        status: 'error', 
        message: 'Analysis failed. The image might be too complex or the connection timed out. Please try again with a smaller photo.' 
      });
    }
  };

  const handleReset = () => {
    setResult(null);
    setPreviewUrl(null);
    setLoadingState({ status: 'idle' });
    setScanProgress(0);
    // Force immediate scroll to top to help resize
    window.scrollTo(0, 0);
  };

  return (
    // CHANGED: Removed 'min-h-screen'. Using 'w-full' and 'h-fit' allows the container to shrink to content.
    // 'bg-white' ensures no transparency issues.
    <div className="w-full h-fit font-sans text-slate-900 bg-white selection:bg-blue-100 flex flex-col relative overflow-hidden">
      <style>{`
        @keyframes scan-line {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .animate-scan {
          animation: scan-line 2.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
        .bg-grid-clean {
           background-image: linear-gradient(#e2e8f0 1px, transparent 1px), linear-gradient(90deg, #e2e8f0 1px, transparent 1px);
           background-size: 40px 40px;
        }
      `}</style>
      
      {/* Background Pattern - Grid with low opacity */}
      <div className="fixed inset-0 bg-grid-clean z-0 pointer-events-none opacity-40"></div>
      
      {/* Main Content */}
      <main className="flex-grow flex flex-col relative z-10">
        
        {!previewUrl ? (
          <Hero onImageSelected={handleImageSelected} isLoading={false} />
        ) : (
          <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 animate-fade-in pb-12">
            <div className="space-y-8">
              
              {/* === PRO ANALYSIS INTERFACE === */}
              <div className={`relative bg-white rounded-2xl overflow-hidden transition-all duration-500 border border-slate-200 shadow-2xl ${loadingState.status === 'analyzing' ? 'ring-4 ring-blue-50/50' : ''}`}>
                
                {/* Technical Header Bar - Hidden on Success for Compactness */}
                {loadingState.status !== 'success' && (
                  <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800 transition-all duration-500">
                    <div className="flex items-center space-x-4">
                      {loadingState.status === 'analyzing' ? (
                        <div className="flex items-center space-x-2">
                            <span className="relative flex h-2.5 w-2.5">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
                            </span>
                            <span className="font-mono font-bold tracking-widest text-xs text-blue-100 uppercase">System Active</span>
                        </div>
                      ) : (
                          <div className="flex items-center space-x-2">
                            <AlertTriangle className="w-4 h-4 text-red-400" />
                            <span className="font-mono font-bold tracking-widest text-xs text-red-100 uppercase">System Error</span>
                          </div>
                      )}
                    </div>
                    <div className="hidden md:flex items-center space-x-8 text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                      <span className="flex items-center hover:text-white transition-colors cursor-help"><Database className="w-3 h-3 mr-2" /> NCC-2025 DB</span>
                      <span className="flex items-center hover:text-white transition-colors cursor-help"><Activity className="w-3 h-3 mr-2" /> Low Latency</span>
                    </div>
                  </div>
                )}

                <div className={`flex transition-all duration-700 ease-in-out ${loadingState.status === 'success' ? 'flex-row h-28 items-stretch' : 'flex-col md:flex-row min-h-[500px]'}`}>
                    
                    {/* Left: Visual Sensor (Image) */}
                    <div className={`relative bg-slate-950 overflow-hidden group flex items-center justify-center transition-all duration-700 ease-in-out ${loadingState.status === 'success' ? 'w-28 md:w-36 flex-shrink-0' : 'w-full md:w-5/12'}`}>
                         <img 
                           src={previewUrl} 
                           alt="Analyzed Target" 
                           className={`w-full h-full object-cover absolute inset-0 transition-all duration-1000 ${loadingState.status === 'analyzing' ? 'scale-105 opacity-60 object-contain' : 'opacity-100'}`} 
                         />
                         
                         {loadingState.status === 'analyzing' && (
                           <>
                             <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
                             <div className="absolute left-0 w-full h-[1px] bg-blue-500 shadow-[0_0_30px_rgba(59,130,246,1)] animate-scan z-20"></div>
                             <div className="absolute top-6 left-6 border-l border-t border-blue-500/50 w-6 h-6 z-20"></div>
                             <div className="absolute top-6 right-6 border-r border-t border-blue-500/50 w-6 h-6 z-20"></div>
                             <div className="absolute bottom-6 left-6 border-l border-b border-blue-500/50 w-6 h-6 z-20"></div>
                             <div className="absolute bottom-6 right-6 border-r border-b border-blue-500/50 w-6 h-6 z-20"></div>
                             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-500/20">
                                <ScanLine className="w-24 h-24 animate-pulse" />
                             </div>
                           </>
                         )}
                    </div>
                    
                    {/* Right: Intelligence Panel */}
                    <div className={`flex flex-col justify-center bg-white relative transition-all duration-700 ease-in-out ${loadingState.status === 'success' ? 'flex-1 p-4 md:px-8' : 'w-full md:w-7/12 p-8 md:p-12'}`}>
                      
                      {loadingState.status === 'analyzing' && (
                        <div className="space-y-10 animate-fade-in w-full max-w-md mx-auto">
                          <div>
                            <h2 className="text-4xl font-bold text-slate-900 mb-3 tracking-tight">Processing Visual Data</h2>
                            <p className="text-slate-500 text-lg">Our AI is currently inspecting the image against Australian Building Standards.</p>
                          </div>

                          {/* Tech Console */}
                          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 font-mono text-sm space-y-4">
                             <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                                <span className="text-slate-400 text-xs uppercase tracking-wider">Protocol</span>
                                <span className="text-blue-600 font-bold">STRUCTURAL_DIAGNOSTIC_V2</span>
                             </div>
                             <div className="flex justify-between items-center">
                                <span className="text-slate-400 text-xs uppercase tracking-wider">Status</span>
                                <span className="text-slate-800 animate-pulse font-medium">{SCAN_STEPS[scanStepIndex]}</span>
                             </div>
                          </div>

                          {/* Progress Bar */}
                          <div className="space-y-3">
                             <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                                <span className="text-slate-400">Analysis Progress</span>
                                <span className="text-slate-900">{Math.round(scanProgress)}%</span>
                             </div>
                             <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-blue-600 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.5)] transition-all duration-300 ease-out"
                                  style={{ width: `${Math.max(2, scanProgress)}%` }}
                                ></div>
                             </div>
                          </div>
                        </div>
                      )}

                      {loadingState.status === 'error' && (
                        <div className="bg-red-50 border border-red-100 rounded-2xl p-8 text-red-900 max-w-md mx-auto text-center">
                           <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5">
                             <AlertTriangle className="w-7 h-7 text-red-600" />
                           </div>
                           <h3 className="font-bold text-xl mb-2">Analysis Interrupted</h3>
                           <p className="text-sm mb-6 text-red-700 leading-relaxed opacity-90">{loadingState.message}</p>
                           <button onClick={handleReset} className="w-full px-6 py-3 bg-white border border-red-200 text-red-600 font-bold rounded-xl text-sm hover:bg-red-50 transition-all shadow-sm">
                             Restart System
                           </button>
                        </div>
                      )}

                      {loadingState.status === 'success' && (
                        <div className="animate-fade-in flex flex-col md:flex-row items-center justify-between gap-4 w-full h-full">
                           <div className="flex items-center gap-4 w-full md:w-auto">
                              <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0">
                                 <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                              </div>
                              <div>
                                 <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                   Analysis Complete
                                 </h2>
                                 <p className="text-slate-500 text-sm">
                                   Identified <span className="font-bold text-slate-900">{result?.issues.length} potential issues</span>.
                                 </p>
                              </div>
                           </div>
                           
                           <div className="flex items-center gap-3 w-full md:w-auto">
                               <button 
                                   onClick={() => document.getElementById('report-section')?.scrollIntoView({behavior: 'smooth'})}
                                   className="flex-1 md:flex-none px-5 py-2.5 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 transition-all shadow-sm flex items-center justify-center text-sm"
                                 >
                                   <BarChart3 className="w-4 h-4 mr-2" />
                                   View Report
                               </button>
                               <button 
                                 onClick={handleReset}
                                 className="px-4 py-2.5 bg-white border border-slate-200 text-slate-500 font-bold rounded-lg hover:bg-slate-50 hover:text-slate-700 text-sm transition-colors whitespace-nowrap"
                               >
                                 New Scan
                               </button>
                           </div>
                        </div>
                      )}

                    </div>
                </div>
              </div>
              
              {/* Results Component */}
              {result && (
                <div id="report-section">
                  <AnalysisReport data={result} onReset={handleReset} previewUrl={previewUrl} />
                </div>
              )}
              
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;