import React, { useState, useEffect, useRef } from 'react';
import { Hero } from './components/Hero';
import { AnalysisReport } from './components/AnalysisReport';
import { analyzeBuildingImage } from './services/geminiService';
import { AnalysisResult, LoadingState } from './types';
import { AlertTriangle, Database, CheckCircle2, ScanLine } from 'lucide-react';

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
  const [base64Data, setBase64Data] = useState<string | null>(null);
  
  // Animation States
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStepIndex, setScanStepIndex] = useState(0);

  // --- IFRAME RESIZER LOGIC ---
  useEffect(() => {
    const sendHeight = () => {
      const rootElement = document.getElementById('root');
      if (rootElement) {
        const height = rootElement.offsetHeight + 10;
        window.parent.postMessage({ type: 'setHeight', height: height }, '*');
      }
    };
    sendHeight();
    const resizeObserver = new ResizeObserver(() => sendHeight());
    const rootEl = document.getElementById('root');
    if (rootEl) resizeObserver.observe(rootEl);
    const interval = setInterval(sendHeight, 500);
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

      progressInterval = setInterval(() => {
        setScanProgress(prev => {
           if (prev >= 92) return prev;
           return prev + (Math.random() * 2); 
        });
      }, 150);

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
          ctx.drawImage(img, 0, 0, width, height);
          const mimeType = 'image/jpeg';
          const dataUrl = canvas.toDataURL(mimeType, 0.7);
          const base64 = dataUrl.split(',')[1];
          resolve({ base64, mimeType });
        };
        img.onerror = (e) => reject(e);
      };
      reader.onerror = (e) => reject(e);
    });
  };

  const handleImageSelected = async (file: File) => {
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setLoadingState({ status: 'analyzing', message: 'Scanning image for defects...' });
    setResult(null);
    setBase64Data(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    try {
      const { base64, mimeType } = await compressImage(file);
      setBase64Data(base64); // Save for PDF export
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
    setBase64Data(null);
    setLoadingState({ status: 'idle' });
    setScanProgress(0);
    window.scrollTo(0, 0);
  };

  return (
    <div className="w-full h-fit font-sans text-slate-900 bg-[#f8fafc] selection:bg-blue-100 flex flex-col relative overflow-hidden">
      <style>{`
        @keyframes scan-line {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        @keyframes breathe {
          0% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.05); opacity: 1; }
          100% { transform: scale(1); opacity: 0.8; }
        }
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        .animate-scan {
          animation: scan-line 2.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
        .animate-breathe {
          animation: breathe 4s ease-in-out infinite;
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .bg-grid-clean {
           background-image: linear-gradient(#cbd5e1 1px, transparent 1px), linear-gradient(90deg, #cbd5e1 1px, transparent 1px);
           background-size: 40px 40px;
        }
        .bg-noise {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E");
        }
      `}</style>
      
      {/* Background Layers */}
      <div className="fixed inset-0 bg-grid-clean z-0 pointer-events-none opacity-[0.15]"></div>
      <div className="fixed inset-0 bg-noise z-0 pointer-events-none opacity-40 mix-blend-overlay"></div>
      
      {/* Glow Orbs */}
      <div className="fixed top-[-10%] left-[20%] w-[500px] h-[500px] bg-blue-400/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="fixed bottom-[-10%] right-[10%] w-[400px] h-[400px] bg-indigo-400/10 rounded-full blur-[100px] pointer-events-none"></div>

      <main className="flex-grow flex flex-col relative z-10">
        
        {!previewUrl ? (
          <Hero onImageSelected={handleImageSelected} isLoading={false} />
        ) : (
          /* PADDING UPDATE: px-3 (12px) for mobile */
          <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:p-8 animate-fade-in pb-12">
            <div className="space-y-8">
              
              {/* === PRO ANALYSIS INTERFACE === */}
              <div className={`relative bg-white/80 backdrop-blur-xl rounded-3xl overflow-hidden transition-all duration-500 border border-white/50 shadow-2xl ${loadingState.status === 'analyzing' ? 'ring-4 ring-blue-50/50' : ''}`}>
                
                {/* Technical Header Bar */}
                {loadingState.status !== 'success' && (
                  <div className="bg-slate-900/95 backdrop-blur text-white px-4 sm:px-6 py-4 flex items-center justify-between border-b border-slate-800 transition-all duration-500">
                    <div className="flex items-center space-x-4">
                      {loadingState.status === 'analyzing' ? (
                        <div className="flex items-center space-x-2">
                            <span className="relative flex h-2.5 w-2.5">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
                            </span>
                            <span className="font-mono font-bold tracking-widest text-xs text-blue-100 uppercase">Analysis Active</span>
                        </div>
                      ) : (
                          <div className="flex items-center space-x-2">
                            <AlertTriangle className="w-4 h-4 text-red-400" />
                            <span className="font-mono font-bold tracking-widest text-xs text-red-100 uppercase">Error</span>
                          </div>
                      )}
                    </div>
                    <div className="hidden md:flex items-center space-x-8 text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                      <span className="flex items-center"><Database className="w-3 h-3 mr-2" /> NCC-2025 DB</span>
                    </div>
                  </div>
                )}

                <div className={`flex transition-all duration-700 ease-in-out ${loadingState.status === 'success' ? 'flex-row h-28 items-stretch' : 'flex-col md:flex-row min-h-[500px]'}`}>
                    
                    {/* Left: Visual Sensor (Image) */}
                    <div className={`relative bg-slate-950 overflow-hidden group flex items-center justify-center transition-all duration-700 ease-in-out ${loadingState.status === 'success' ? 'w-24 sm:w-28 md:w-36 flex-shrink-0' : 'w-full md:w-5/12'}`}>
                         <img 
                           src={previewUrl} 
                           alt="Analyzed Target" 
                           className={`w-full h-full object-cover absolute inset-0 transition-all duration-1000 ${loadingState.status === 'analyzing' ? 'scale-105 opacity-60 object-contain' : 'opacity-100'}`} 
                         />
                         
                         {loadingState.status === 'analyzing' && (
                           <>
                             <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
                             <div className="absolute left-0 w-full h-[1px] bg-blue-500 shadow-[0_0_30px_rgba(59,130,246,1)] animate-scan z-20"></div>
                             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-500/20">
                                <ScanLine className="w-24 h-24 animate-pulse" />
                             </div>
                           </>
                         )}
                    </div>
                    
                    {/* Right: Intelligence Panel */}
                    {/* PADDING UPDATE: p-5 (20px) on mobile instead of p-8 */}
                    <div className={`flex flex-col justify-center relative transition-all duration-700 ease-in-out ${loadingState.status === 'success' ? 'flex-1 p-4 md:px-8 bg-white/50' : 'w-full md:w-7/12 p-5 md:p-12 bg-white'}`}>
                      
                      {loadingState.status === 'analyzing' && (
                        <div className="space-y-8 sm:space-y-10 animate-fade-in w-full max-w-md mx-auto">
                          <div>
                            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2 sm:mb-3 tracking-tight">Processing Visuals</h2>
                            <p className="text-slate-500 text-base sm:text-lg">Inspecting against Australian Building Standards.</p>
                          </div>

                          {/* Tech Console */}
                          <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-4 sm:p-5 font-mono text-sm space-y-4 shadow-inner">
                             <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                                <span className="text-slate-400 text-xs uppercase tracking-wider">Protocol</span>
                                <span className="text-blue-600 font-bold text-xs sm:text-sm">STRUCTURAL_DIAGNOSTIC_V2</span>
                             </div>
                             <div className="flex justify-between items-center">
                                <span className="text-slate-400 text-xs uppercase tracking-wider">Status</span>
                                <span className="text-slate-800 animate-pulse font-medium text-right ml-4">{SCAN_STEPS[scanStepIndex]}</span>
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
                        <div className="bg-red-50/80 border border-red-100 rounded-2xl p-6 sm:p-8 text-red-900 max-w-md mx-auto text-center backdrop-blur-sm">
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
                              <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0 shadow-sm">
                                 <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                              </div>
                              <div>
                                 <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                   Scan Complete
                                 </h2>
                                 <p className="text-slate-500 text-sm">
                                   Found <span className="font-bold text-slate-900">{result?.issues.length} issues</span>.
                                 </p>
                              </div>
                           </div>
                           
                           <div className="flex items-center gap-3 w-full md:w-auto">
                               <button 
                                 onClick={handleReset}
                                 className="px-4 py-2.5 bg-white border border-slate-200 text-slate-500 font-bold rounded-lg hover:bg-slate-50 hover:text-slate-700 text-sm transition-colors whitespace-nowrap shadow-sm hover:shadow-md"
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
                  <AnalysisReport data={result} onReset={handleReset} previewUrl={previewUrl} base64Image={base64Data} />
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