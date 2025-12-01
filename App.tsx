import React, { useState, useEffect, useRef } from 'react';
import { Hero } from './components/Hero';
import { AnalysisReport } from './components/AnalysisReport';
import { analyzeBuildingImage } from './services/geminiService';
import { AnalysisResult, LoadingState } from './types';
import { AlertTriangle, Database, CheckCircle2, ScanLine, Activity, Server, Cpu } from 'lucide-react';

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
           if (prev >= 95) return prev;
           return prev + (Math.random() * 2.5); 
        });
      }, 150);

      stepInterval = setInterval(() => {
        setScanStepIndex(prev => (prev + 1) % SCAN_STEPS.length);
      }, 1000);
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
          100% { top: 100%; opacity: 0; }
        }
        @keyframes scan-vertical {
            0%, 100% { top: 0%; opacity: 0; }
            50% { opacity: 1; }
            100% { top: 100%; opacity: 0; }
        }
        .animate-scan-vertical {
            animation: scan-vertical 2s linear infinite;
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
          /* Centering Container for Analysis Mode */
          <div className={`
              w-full max-w-7xl mx-auto px-3 sm:px-6 lg:p-8 animate-fade-in pb-12
              ${loadingState.status === 'analyzing' ? 'min-h-[90vh] flex flex-col items-center justify-center' : ''}
          `}>
            <div className="space-y-8 w-full">
              
              {/* === PRO ANALYSIS INTERFACE === */}
              <div className={`
                  relative bg-white rounded-[2rem] overflow-hidden 
                  shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)] 
                  border border-slate-100
                  transition-all duration-700 ease-in-out
                  mx-auto
                  ${loadingState.status === 'analyzing' ? 'w-full max-w-5xl scale-100' : 'w-full'}
              `}>
                
                <div className={`flex transition-all duration-700 ease-in-out ${loadingState.status === 'success' ? 'flex-row h-28 items-stretch' : 'flex-col md:flex-row min-h-[480px]'}`}>
                    
                    {/* Left: Visual Sensor (Image) */}
                    <div className={`relative bg-slate-950 overflow-hidden group flex items-center justify-center transition-all duration-700 ease-in-out ${loadingState.status === 'success' ? 'w-24 sm:w-28 md:w-36 flex-shrink-0' : 'w-full md:w-5/12'}`}>
                         <img 
                           src={previewUrl} 
                           alt="Analyzed Target" 
                           className={`w-full h-full object-cover absolute inset-0 transition-all duration-1000 ${loadingState.status === 'analyzing' ? 'opacity-50 scale-105' : 'opacity-100'}`} 
                         />
                         
                         {loadingState.status === 'analyzing' && (
                           <>
                             {/* Professional Grid Overlay */}
                             <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.1)_1px,transparent_1px)] bg-[size:32px_32px]"></div>
                             
                             {/* Scanning Beam */}
                             <div className="absolute left-0 w-full h-0.5 bg-blue-400 shadow-[0_0_25px_rgba(59,130,246,1)] animate-scan-vertical z-20"></div>
                             
                             {/* Radar UI Elements */}
                             <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="w-64 h-64 border border-blue-500/20 rounded-full animate-ping opacity-30 absolute"></div>
                                <div className="w-48 h-48 border border-blue-500/40 rounded-full animate-spin [animation-duration:4s] border-t-transparent border-l-transparent absolute"></div>
                                <ScanLine className="relative text-blue-400 w-10 h-10 animate-pulse drop-shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
                             </div>

                             {/* Image Meta Data Overlay */}
                             <div className="absolute bottom-4 left-4 right-4 flex justify-between text-[9px] font-mono text-blue-300/80 uppercase tracking-widest">
                                <span>Input: JPG_HQ</span>
                                <span>Target: Structural</span>
                             </div>
                           </>
                         )}
                    </div>
                    
                    {/* Right: Intelligence Panel */}
                    <div className={`flex flex-col justify-center relative transition-all duration-700 ease-in-out ${loadingState.status === 'success' ? 'flex-1 p-4 md:px-8 bg-white' : 'w-full md:w-7/12 p-6 md:p-12 bg-white'}`}>
                      
                      {loadingState.status === 'analyzing' && (
                        <div className="space-y-8 animate-fade-in w-full max-w-lg mx-auto">
                          
                          {/* Header Badge */}
                          <div className="flex items-center gap-3">
                             <div className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-600"></span>
                             </div>
                             <span className="text-xs font-bold tracking-[0.2em] text-blue-600 uppercase">System Active</span>
                          </div>

                          <div>
                            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3 tracking-tight">Processing Visuals</h2>
                            <p className="text-slate-500 text-base leading-relaxed">
                                Our AI is currently segmenting the image to identify structural anomalies against NCC standards.
                            </p>
                          </div>

                          {/* Tech Console */}
                          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 font-mono text-sm relative overflow-hidden group">
                             <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                             <div className="flex justify-between items-start mb-2">
                                <span className="text-slate-400 text-[10px] uppercase tracking-wider font-bold">Current Protocol</span>
                                <Cpu className="w-4 h-4 text-slate-400" />
                             </div>
                             <div className="text-slate-800 font-bold text-lg mb-4">
                                STRUCTURAL_DIAGNOSTIC_V2
                             </div>
                             
                             <div className="space-y-2">
                                <div className="flex justify-between text-xs text-slate-500">
                                    <span>Status</span>
                                    <span className="text-blue-600 font-bold animate-pulse">{SCAN_STEPS[scanStepIndex]}</span>
                                </div>
                                <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden">
                                    <div className="bg-blue-600 h-full rounded-full transition-all duration-300" style={{width: `${(scanStepIndex / SCAN_STEPS.length) * 100}%`}}></div>
                                </div>
                             </div>
                          </div>

                          {/* Master Progress */}
                          <div className="space-y-2 pt-2">
                             <div className="flex justify-between items-end">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Progress</span>
                                <span className="text-2xl font-black text-slate-900 leading-none">{Math.round(scanProgress)}%</span>
                             </div>
                             <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-all duration-200 ease-out"
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