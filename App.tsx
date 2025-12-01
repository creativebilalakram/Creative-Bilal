import React, { useState, useEffect, useRef } from 'react';
import { Hero } from './components/Hero';
import { AnalysisReport } from './components/AnalysisReport';
import { analyzeBuildingImage } from './services/geminiService';
import { AnalysisResult, LoadingState } from './types';
import { AlertTriangle, Database, CheckCircle2, ScanLine, Activity, Server, Cpu, Radio, Shield, Zap } from 'lucide-react';

const SCAN_STEPS = [
  "INITIALIZING_VISION_MODELS",
  "SEGMENTING_STRUCTURAL_ELEMENTS",
  "DETECTING_SURFACE_ANOMALIES",
  "ANALYZING_MATERIAL_TEXTURE",
  "REF_DB: NCC_2025_COMPLIANCE",
  "CALCULATING_RISK_VECTORS",
  "GENERATING_REMEDIATION_PLAN",
  "FINALIZING_REPORT_OUTPUT"
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
           if (prev >= 98) return prev;
           return prev + (Math.random() * 3); 
        });
      }, 100);

      stepInterval = setInterval(() => {
        setScanStepIndex(prev => (prev + 1) % SCAN_STEPS.length);
      }, 800);
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
    // Don't scroll to top immediately, the modal will handle focus
    
    try {
      const { base64, mimeType } = await compressImage(file);
      setBase64Data(base64); 
      const data = await analyzeBuildingImage(base64, mimeType);
      setResult(data);
      setLoadingState({ status: 'success' });
      // Small delay before closing modal to show 100%
      setTimeout(() => {
        // Logic handled in render
      }, 500);
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
            0% { top: 0%; opacity: 0.8; box-shadow: 0 0 10px rgba(59,130,246,0.8); }
            50% { opacity: 0.4; }
            100% { top: 100%; opacity: 0.8; box-shadow: 0 0 10px rgba(59,130,246,0.8); }
        }
        .animate-scan-vertical {
            animation: scan-vertical 1.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
        .bg-grid-clean {
           background-image: linear-gradient(#cbd5e1 1px, transparent 1px), linear-gradient(90deg, #cbd5e1 1px, transparent 1px);
           background-size: 40px 40px;
        }
        /* Dark Technical Grid for Modal */
        .bg-grid-tech {
           background-image: linear-gradient(rgba(59, 130, 246, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.05) 1px, transparent 1px);
           background-size: 20px 20px;
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

      {/* --- OVERLAY MODAL FOR ANALYSIS (CENTERED) --- */}
      {(loadingState.status === 'analyzing' || loadingState.status === 'error') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-fade-in">
            
            {/* The KILLER CARD */}
            <div className="w-full max-w-sm sm:max-w-md md:max-w-2xl bg-slate-950 rounded-xl overflow-hidden border border-slate-800 shadow-[0_0_50px_-12px_rgba(59,130,246,0.3)] relative">
                
                {/* Decoration Lines */}
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50"></div>
                <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50"></div>
                
                {/* Card Content Grid */}
                <div className="flex flex-col md:flex-row h-auto md:h-[320px]">
                    
                    {/* Left/Top: Image Sensor */}
                    <div className="relative w-full md:w-5/12 h-48 md:h-full bg-slate-900 border-b md:border-b-0 md:border-r border-slate-800 overflow-hidden group">
                        {/* Background Grid */}
                        <div className="absolute inset-0 bg-grid-tech"></div>
                        
                        {/* The Image */}
                        <img 
                          src={previewUrl!} 
                          alt="Target" 
                          className="w-full h-full object-cover opacity-60 mix-blend-overlay contrast-125 saturate-0 group-hover:saturate-50 transition-all duration-500" 
                        />
                        
                        {/* Scanner Beam */}
                        <div className="absolute left-0 w-full h-[2px] bg-blue-400 shadow-[0_0_20px_rgba(59,130,246,1)] animate-scan-vertical z-20"></div>

                        {/* HUD Elements */}
                        <div className="absolute top-2 left-2 flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                            <span className="text-[9px] font-mono text-red-400 tracking-widest uppercase">REC_Active</span>
                        </div>
                        <div className="absolute bottom-2 right-2">
                             <ScanLine className="w-4 h-4 text-blue-500/80" />
                        </div>
                        
                        {/* Corner Brackets */}
                        <div className="absolute top-2 right-2 w-3 h-3 border-t border-r border-blue-500/30"></div>
                        <div className="absolute bottom-2 left-2 w-3 h-3 border-b border-l border-blue-500/30"></div>
                    </div>

                    {/* Right/Bottom: Data Console */}
                    <div className="flex-1 p-4 md:p-6 flex flex-col justify-between bg-slate-950 relative">
                        
                        {/* Header */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <Shield className="w-3.5 h-3.5 text-blue-500" />
                                    <h3 className="text-[10px] md:text-xs font-bold text-blue-100 uppercase tracking-[0.2em]">AusBuild Diagnostics</h3>
                                </div>
                                <div className="px-1.5 py-0.5 rounded border border-blue-500/30 bg-blue-500/10 text-[9px] font-mono text-blue-400">
                                    V2.4.0
                                </div>
                            </div>
                            
                            <div className="h-[1px] w-full bg-slate-800 mb-4"></div>
                        
                            {/* Dynamic Text Console - Compact */}
                            <div className="space-y-3 mb-4">
                                
                                <div className="flex items-start gap-3">
                                    <Activity className="w-3.5 h-3.5 text-blue-500 mt-0.5 shrink-0" />
                                    <div className="flex-1">
                                        <p className="text-[10px] md:text-xs font-mono text-slate-400 uppercase tracking-wide mb-1">Current Process</p>
                                        <p className="text-xs md:text-sm font-mono text-blue-400 font-bold animate-pulse truncate">
                                            {loadingState.status === 'error' ? 'SYSTEM_FAILURE' : SCAN_STEPS[scanStepIndex]}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <Database className="w-3.5 h-3.5 text-slate-600 mt-0.5 shrink-0" />
                                    <div className="flex-1">
                                        <p className="text-[10px] md:text-xs font-mono text-slate-400 uppercase tracking-wide mb-1">Target Database</p>
                                        <p className="text-[10px] md:text-xs font-mono text-slate-300">
                                            NCC_AU_STANDARDS_2025.JSON
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Error Message if Any */}
                        {loadingState.status === 'error' && (
                            <div className="bg-red-500/10 border border-red-500/20 p-2 rounded text-[10px] text-red-400 font-mono mb-2">
                                {loadingState.message}
                                <button onClick={handleReset} className="block mt-2 underline hover:text-red-300">RETRY_CONNECTION</button>
                            </div>
                        )}

                        {/* Progress Section */}
                        <div className="mt-auto">
                             <div className="flex justify-between items-end mb-1.5">
                                 <span className="text-[9px] md:text-[10px] font-mono text-slate-500 uppercase">Processing...</span>
                                 <span className="text-sm md:text-base font-mono font-bold text-white">{Math.round(scanProgress)}%</span>
                             </div>
                             <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                                 <div 
                                    className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)] transition-all duration-150"
                                    style={{ width: `${Math.max(5, scanProgress)}%` }}
                                 ></div>
                             </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
      )}

      <main className="flex-grow flex flex-col relative z-10">
        
        {/* Main Content Area */}
        {!previewUrl || loadingState.status === 'analyzing' ? (
             // Show Hero initially OR if analyzing (analyzing overlays on top)
             // We keep hero mounted or similar layout to prevent layout shifts underneath
             !previewUrl ? (
                <Hero onImageSelected={handleImageSelected} isLoading={false} />
             ) : (
                /* Placeholder background when analyzing (behind the modal) */
                <div className="w-full h-screen flex items-center justify-center">
                    <div className="text-slate-300 animate-pulse text-sm font-mono tracking-widest">SYSTEM BUSY</div>
                </div>
             )
        ) : (
          /* RESULT VIEW (Only shows when status === 'success') */
          <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:p-8 animate-fade-in pb-12">
            <div className="space-y-6">
              
              {/* SUCCESS HEADER - Replaces the huge analysis card */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
                 <div className="flex items-center gap-3">
                     <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                         <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                     </div>
                     <div>
                         <h2 className="text-sm font-bold text-slate-900">Analysis Complete</h2>
                         <p className="text-[10px] sm:text-xs text-slate-500">{result?.issues.length} issues identified successfully.</p>
                     </div>
                 </div>
                 <button 
                    onClick={handleReset}
                    className="text-xs font-bold text-slate-500 hover:text-blue-600 px-3 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                 >
                    New Scan
                 </button>
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