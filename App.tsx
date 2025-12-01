import React, { useState, useEffect, useRef } from 'react';
import { Hero } from './components/Hero';
import { AnalysisReport } from './components/AnalysisReport';
import { analyzeBuildingImage } from './services/geminiService';
import { AnalysisResult, LoadingState } from './types';
import { AlertTriangle, Database, CheckCircle2, ScanLine, Activity, Server, Cpu, Radio, Shield, Zap, RefreshCw } from 'lucide-react';

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

  // --- IFRAME RESIZER LOGIC (STABILIZED) ---
  useEffect(() => {
    let lastHeight = 0;
    
    const sendHeight = () => {
      const rootElement = document.getElementById('root');
      if (rootElement) {
        // Use scrollHeight to capture full content height
        // We add a minimal fixed buffer (10px) for bottom breathing room
        const height = rootElement.scrollHeight + 10;
        
        // Only send update if height changed by more than 2px to prevent infinite micro-adjustments
        // This stops the "growing" bug where iframe resize triggers content resize triggers iframe resize...
        if (Math.abs(height - lastHeight) > 2) {
            lastHeight = height;
            window.parent.postMessage({ type: 'setHeight', height: height }, '*');
        }
      }
    };

    // Initial sizing
    sendHeight();

    // Use ResizeObserver for efficient, event-driven updates
    const resizeObserver = new ResizeObserver(() => {
        sendHeight();
    });
    
    const rootEl = document.getElementById('root');
    if (rootEl) resizeObserver.observe(rootEl);
    
    // Backup interval (slower) to catch any layout shifts missed by observer
    // but checks the same condition to avoid loops
    const interval = setInterval(sendHeight, 1000);
    
    return () => {
      resizeObserver.disconnect();
      clearInterval(interval);
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
           return prev + (Math.random() * 4); // Faster, smoother progress
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
    
    // Smooth scroll to top to ensure modal is centered in view
    window.scrollTo({ top: 0, behavior: 'smooth' });

    try {
      const { base64, mimeType } = await compressImage(file);
      setBase64Data(base64); 
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    // CRITICAL FIX: Removed 'min-h-screen' to prevent infinite loop with iframe resizer. 
    // Used 'h-auto' and 'w-full' to let content dictate height naturally.
    <div className="w-full h-auto font-sans text-slate-900 bg-[#f8fafc] selection:bg-blue-100 flex flex-col relative overflow-hidden">
      <style>{`
        @keyframes scan-line {
          0% { top: 0%; opacity: 0; }
          100% { top: 100%; opacity: 0; }
        }
        @keyframes scan-vertical {
            0% { top: 0%; opacity: 0; }
            15% { opacity: 1; box-shadow: 0 0 15px rgba(59,130,246,0.9); }
            85% { opacity: 1; box-shadow: 0 0 15px rgba(59,130,246,0.9); }
            100% { top: 100%; opacity: 0; }
        }
        .animate-scan-vertical {
            animation: scan-vertical 2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
        .bg-grid-clean {
           background-image: linear-gradient(#cbd5e1 1px, transparent 1px), linear-gradient(90deg, #cbd5e1 1px, transparent 1px);
           background-size: 40px 40px;
        }
        /* Dark Technical Grid for Modal */
        .bg-grid-tech {
           background-image: linear-gradient(rgba(59, 130, 246, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.08) 1px, transparent 1px);
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-fade-in h-[100dvh]">
            
            {/* The KILLER CARD */}
            <div className="w-full max-w-sm sm:max-w-md md:max-w-2xl bg-slate-950 rounded-xl overflow-hidden border border-slate-800 shadow-[0_0_80px_-20px_rgba(59,130,246,0.6)] relative transform transition-all">
                
                {/* Decoration Lines */}
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-60"></div>
                <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-60"></div>
                
                {/* Card Content Grid - Fixed Height to prevent Jitter */}
                <div className="flex flex-col md:flex-row h-[420px] md:h-[320px]">
                    
                    {/* Left/Top: Image Sensor */}
                    <div className="relative w-full h-[180px] md:h-full md:w-5/12 bg-slate-900 border-b md:border-b-0 md:border-r border-slate-800 overflow-hidden group">
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
                        <div className="absolute top-3 left-3 flex items-center gap-1.5 z-30">
                            <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]"></div>
                            <span className="text-[10px] font-mono font-bold text-red-400 tracking-widest uppercase">REC_Active</span>
                        </div>
                        <div className="absolute bottom-3 right-3 z-30">
                             <ScanLine className="w-5 h-5 text-blue-500/80 drop-shadow-[0_0_5px_rgba(59,130,246,0.8)]" />
                        </div>
                        
                        {/* Corner Brackets */}
                        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-blue-500/30"></div>
                        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-blue-500/30"></div>
                    </div>

                    {/* Right/Bottom: Data Console */}
                    <div className="flex-1 p-5 md:p-6 flex flex-col justify-between bg-slate-950 relative">
                        
                        {/* Header */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <div className="p-1 rounded bg-blue-500/10 border border-blue-500/20">
                                      <Shield className="w-3.5 h-3.5 text-blue-500" />
                                    </div>
                                    <h3 className="text-[10px] md:text-xs font-bold text-blue-100 uppercase tracking-[0.2em] shadow-blue-500/50">AusBuild Core</h3>
                                </div>
                                <div className="flex items-center gap-2">
                                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                   <span className="text-[9px] font-mono text-slate-500">ONLINE</span>
                                </div>
                            </div>
                            
                            <div className="h-[1px] w-full bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 mb-5"></div>
                        
                            {/* Dynamic Text Console - Fixed Height Wrapper to Stop Jitter */}
                            <div className="h-[90px] mb-2 flex flex-col justify-center space-y-3">
                                <div className="flex items-start gap-3">
                                    <Activity className="w-3.5 h-3.5 text-blue-500 mt-0.5 shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-1">Process Node</p>
                                        <p className="text-[11px] md:text-xs font-mono text-blue-400 font-bold truncate tracking-wide">
                                            {loadingState.status === 'error' ? 'SYSTEM_FAILURE' : SCAN_STEPS[scanStepIndex]}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <Database className="w-3.5 h-3.5 text-slate-600 mt-0.5 shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-1">Reference Lib</p>
                                        <p className="text-[10px] md:text-xs font-mono text-slate-300 tracking-wide">
                                            NCC_AU_STANDARDS_2025.JSON
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Error Message if Any */}
                        {loadingState.status === 'error' && (
                            <div className="absolute inset-0 z-40 bg-slate-950/90 flex flex-col items-center justify-center p-6 text-center">
                                <AlertTriangle className="w-8 h-8 text-red-500 mb-3" />
                                <p className="text-red-400 font-mono text-xs mb-4">{loadingState.message}</p>
                                <button onClick={handleReset} className="px-4 py-2 border border-red-500/30 text-red-400 text-xs font-bold rounded hover:bg-red-500/10 flex items-center gap-2">
                                  <RefreshCw className="w-3 h-3" /> RETRY SYSTEM
                                </button>
                            </div>
                        )}

                        {/* Progress Section */}
                        <div className="mt-auto pt-4 border-t border-slate-800/50">
                             <div className="flex justify-between items-end mb-2">
                                 <span className="text-[9px] md:text-[10px] font-mono text-slate-500 uppercase flex items-center gap-1.5">
                                    <div className="w-2 h-2 border border-slate-600 border-t-transparent rounded-full animate-spin"></div>
                                    Analyzing Data...
                                 </span>
                                 <span className="text-sm md:text-base font-mono font-bold text-white">{Math.round(scanProgress)}%</span>
                             </div>
                             <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden relative">
                                 <div 
                                    className="h-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,1)] transition-all duration-150 relative z-10"
                                    style={{ width: `${Math.max(5, scanProgress)}%` }}
                                 ></div>
                                 {/* Progress Glitch Effect */}
                                 <div className="absolute top-0 bottom-0 bg-white/20 w-full animate-pulse z-0" style={{ left: '-100%' }}></div>
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
             // Show Hero initially OR if analyzing (Background stays visible behind modal)
             // This prevents the black background issue
             <div className={loadingState.status === 'analyzing' ? 'blur-sm grayscale opacity-30 pointer-events-none transition-all duration-1000' : ''}>
                <Hero onImageSelected={handleImageSelected} isLoading={false} />
             </div>
        ) : (
          /* RESULT VIEW (Only shows when status === 'success') */
          // Added 'pt-6' specifically for better mobile spacing from top
          <div className="w-full max-w-7xl mx-auto px-3 pt-6 sm:px-6 lg:p-8 animate-fade-in pb-12">
            <div className="space-y-6">
              
              {/* SUCCESS HEADER - Replaces the huge analysis card */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
                 <div className="flex items-center gap-3">
                     <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
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