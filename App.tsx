import React, { useState, useEffect, useCallback } from 'react';
import { Hero } from './components/Hero';
import { AnalysisReport } from './components/AnalysisReport';
import { analyzeBuildingImage } from './services/geminiService';
import { AnalysisResult, LoadingState } from './types';
import { AlertTriangle, Database, CheckCircle2, ScanLine, Activity, Shield, RefreshCw, Cpu, Signal, Zap } from 'lucide-react';

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

// --- INTRO ANIMATION COMPONENT ---
const IntroOverlay = ({ onComplete }: { onComplete: () => void }) => {
  const [loadingText, setLoadingText] = useState("INITIALIZING SYSTEM...");
  const [progress, setProgress] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Progress Bar Animation
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 2; // Speed of loader
      });
    }, 30);

    // Text Cycling
    const textTimers = [
      setTimeout(() => setLoadingText("CONNECTING TO NEURAL NET..."), 600),
      setTimeout(() => setLoadingText("CALIBRATING OPTICAL SENSORS..."), 1200),
      setTimeout(() => setLoadingText("LOADING AUSTRALIAN STANDARDS..."), 1800),
      setTimeout(() => setLoadingText("SYSTEM READY."), 2400),
    ];

    // Exit Trigger
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(onComplete, 800); // Wait for exit animation to finish before unmounting
    }, 2600);

    return () => {
      clearInterval(interval);
      textTimers.forEach(clearTimeout);
      clearTimeout(exitTimer);
    };
  }, [onComplete]);

  return (
    <div className={`fixed inset-0 z-[100] flex flex-col items-center justify-center transition-all duration-700 ${isExiting ? 'pointer-events-none' : ''}`}>
      
      {/* Top Curtain (White) */}
      <div className={`absolute top-0 left-0 w-full h-[50vh] bg-slate-900 border-b border-slate-800 z-10 flex items-end justify-center pb-10 transition-transform duration-700 ease-in-out ${isExiting ? '-translate-y-full' : 'translate-y-0'}`}>
         {/* Background Grid */}
         <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.05)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20"></div>
      </div>

      {/* Bottom Curtain (White) */}
      <div className={`absolute bottom-0 left-0 w-full h-[50vh] bg-slate-900 border-t border-slate-800 z-10 flex items-start justify-center pt-10 transition-transform duration-700 ease-in-out ${isExiting ? 'translate-y-full' : 'translate-y-0'}`}>
         {/* Background Grid */}
         <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.05)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20"></div>
      </div>

      {/* CENTER CONTENT (Floats on top of curtains) */}
      <div className={`relative z-20 flex flex-col items-center transition-all duration-500 ${isExiting ? 'opacity-0 scale-150 blur-sm' : 'opacity-100 scale-100'}`}>
        
        {/* Logo Container */}
        <div className="bg-white p-4 rounded-2xl shadow-[0_0_50px_rgba(79,70,229,0.4)] mb-8 animate-pulse">
            <img 
                src="https://creativebilal.com/wp-content/uploads/2025/12/Black-Blue-Minimalist-Modern-Initial-Font-Logo.png" 
                alt="Logo" 
                className="w-16 h-16 object-contain"
            />
        </div>

        {/* Text */}
        <h1 className="text-2xl font-black text-white tracking-widest uppercase mb-2">
            Creative Build <span className="text-blue-500">AI</span>
        </h1>
        <p className="font-mono text-blue-400 text-xs tracking-[0.2em] mb-6 h-4">
            {loadingText}
        </p>

        {/* Loader Bar */}
        <div className="w-64 h-1 bg-slate-800 rounded-full overflow-hidden relative">
            <div 
                className="h-full bg-blue-500 shadow-[0_0_15px_#3b82f6]" 
                style={{ width: `${progress}%`, transition: 'width 0.1s linear' }}
            ></div>
        </div>

        {/* Tech Decor */}
        <div className="absolute -left-20 top-1/2 -translate-y-1/2 hidden sm:block">
            <div className="w-1 h-16 bg-gradient-to-b from-transparent via-slate-700 to-transparent"></div>
        </div>
        <div className="absolute -right-20 top-1/2 -translate-y-1/2 hidden sm:block">
             <div className="w-1 h-16 bg-gradient-to-b from-transparent via-slate-700 to-transparent"></div>
        </div>
      </div>

    </div>
  );
};

// --- DYNAMIC GRID ANIMATION COMPONENT ---
interface Snake {
  id: number;
  type: 'h' | 'v';
  pos: number;
  duration: number;
}

const GridAnimations = () => {
  const [snakes, setSnakes] = useState<Snake[]>([]);

  useEffect(() => {
    // Spawner Interval
    const interval = setInterval(() => {
      // Limit total active snakes to avoid DOM overload
      setSnakes(prev => {
        if (prev.length > 25) return prev; // Wait for some to finish

        const isHorizontal = Math.random() > 0.45; // Slight bias
        const gridSize = 60; // Must match background-size
        
        // Calculate boundaries
        const maxPos = isHorizontal 
          ? window.innerHeight 
          : window.innerWidth;
        
        // Pick a random grid line index
        const lineIndex = Math.floor(Math.random() * (maxPos / gridSize));
        const pos = lineIndex * gridSize;

        return [...prev, {
          id: Date.now() + Math.random(),
          type: isHorizontal ? 'h' : 'v',
          pos: pos,
          duration: 3 + Math.random() * 5 // 3s to 8s duration
        }];
      });
    }, 400); // Spawn new snake every 400ms

    return () => clearInterval(interval);
  }, []);

  const removeSnake = useCallback((id: number) => {
    setSnakes(prev => prev.filter(s => s.id !== id));
  }, []);

  return (
    <>
      {snakes.map(snake => (
        <div
          key={snake.id}
          className={snake.type === 'h' ? 'grid-snake-h' : 'grid-snake-v'}
          style={{
            [snake.type === 'h' ? 'top' : 'left']: `${snake.pos}px`,
            animationDuration: `${snake.duration}s`,
          }}
          onAnimationEnd={() => removeSnake(snake.id)}
        />
      ))}
    </>
  );
};


const App: React.FC = () => {
  const [showIntro, setShowIntro] = useState(true);
  const [loadingState, setLoadingState] = useState<LoadingState>({ status: 'idle' });
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [base64Data, setBase64Data] = useState<string | null>(null);
  
  // Animation States
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStepIndex, setScanStepIndex] = useState(0);

  // --- IFRAME RESIZER LOGIC ---
  useEffect(() => {
    let lastHeight = 0;
    
    const sendHeight = () => {
      const rootElement = document.getElementById('root');
      if (rootElement) {
        const height = rootElement.scrollHeight + 10;
        if (Math.abs(height - lastHeight) > 2) {
            lastHeight = height;
            window.parent.postMessage({ type: 'setHeight', height: height }, '*');
        }
      }
    };

    sendHeight();
    const resizeObserver = new ResizeObserver(() => { sendHeight(); });
    const rootEl = document.getElementById('root');
    if (rootEl) resizeObserver.observe(rootEl);
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
           return prev + (Math.random() * 4); 
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
    <div className="w-full min-h-screen h-auto font-sans text-slate-900 bg-[#f8fafc] selection:bg-blue-100 flex flex-col relative overflow-x-hidden">
      <style>{`
        /* --- CORE ANIMATIONS --- */
        @keyframes scan-vertical {
            0% { top: 0%; opacity: 0; }
            15% { opacity: 1; box-shadow: 0 0 15px rgba(59,130,246,0.9); }
            85% { opacity: 1; box-shadow: 0 0 15px rgba(59,130,246,0.9); }
            100% { top: 100%; opacity: 0; }
        }
        @keyframes fade-in-up {
            0% { opacity: 0; transform: translateY(20px); }
            100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes text-shine {
            0% { background-position: 200% center; }
            100% { background-position: 0% center; }
        }
        @keyframes blob {
            0% { transform: translate(0px, 0px) scale(1); }
            33% { transform: translate(30px, -50px) scale(1.1); }
            66% { transform: translate(-20px, 20px) scale(0.9); }
            100% { transform: translate(0px, 0px) scale(1); }
        }
        
        /* --- PREMIUM GRID BACKGROUND --- */
        .bg-grid-tech-premium {
           background-size: 60px 60px;
           background-image:
             linear-gradient(to right, rgba(99, 102, 241, 0.06) 1px, transparent 1px),
             linear-gradient(to bottom, rgba(99, 102, 241, 0.06) 1px, transparent 1px);
        }

        /* --- DYNAMIC SNAKE ANIMATIONS --- */
        .grid-snake-h {
            position: absolute;
            left: -100%;
            height: 1px; /* Matches grid line width */
            width: 30%; /* Length of the tail */
            background: linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.2), #fff, rgba(99, 102, 241, 0.2), transparent);
            box-shadow: 0 0 8px rgba(99, 102, 241, 0.4);
            animation: snake-h-run linear forwards;
            opacity: 0.6;
            z-index: 0;
            will-change: left;
        }

        @keyframes snake-h-run {
            0% { left: -30%; opacity: 0; }
            10% { opacity: 0.8; }
            90% { opacity: 0.8; }
            100% { left: 100%; opacity: 0; }
        }

        .grid-snake-v {
            position: absolute;
            top: -100%;
            width: 1px; /* Matches grid line width */
            height: 30%;
            background: linear-gradient(180deg, transparent, rgba(59, 130, 246, 0.2), #fff, rgba(59, 130, 246, 0.2), transparent);
            box-shadow: 0 0 8px rgba(59, 130, 246, 0.4);
            animation: snake-v-run linear forwards;
            opacity: 0.6;
            z-index: 0;
            will-change: top;
        }

        @keyframes snake-v-run {
            0% { top: -30%; opacity: 0; }
            10% { opacity: 0.8; }
            90% { opacity: 0.8; }
            100% { top: 100%; opacity: 0; }
        }

        /* --- UTILS --- */
        .animate-scan-vertical {
            animation: scan-vertical 2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
        .animate-fade-in-up {
            animation: fade-in-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            opacity: 0;
        }
        .animate-text-shine {
            background-size: 200% auto;
            animation: text-shine 3s linear infinite;
        }
        .animate-blob {
            animation: blob 15s infinite;
        }
        
        .delay-100 { animation-delay: 100ms; }
        .delay-200 { animation-delay: 200ms; }
        .delay-300 { animation-delay: 300ms; }
        .delay-500 { animation-delay: 500ms; }
        
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}</style>
      
      {/* --- INTRO OVERLAY --- */}
      {showIntro && <IntroOverlay onComplete={() => setShowIntro(false)} />}

      {/* --- PREMIUM DYNAMIC BACKGROUND --- */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          
          {/* 1. Base Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-slate-100 to-[#f1f5f9]"></div>

          {/* 2. Floating Ambient Energy (Blobs) */}
          <div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] bg-blue-500/5 rounded-full blur-[120px] animate-blob mix-blend-multiply"></div>
          <div className="absolute top-[30%] right-[-20%] w-[60vw] h-[60vw] bg-indigo-500/5 rounded-full blur-[120px] animate-blob animation-delay-2000 mix-blend-multiply"></div>
          
          {/* 3. The Tech Grid */}
          <div className="absolute inset-0 bg-grid-tech-premium opacity-100"></div>

          {/* 4. DYNAMIC SNAKE ANIMATIONS (New Logic) */}
          <GridAnimations />

          {/* 5. Fade Out Bottom */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#f8fafc] via-transparent to-transparent h-full"></div>
      </div>
      
      {/* --- OVERLAY MODAL FOR ANALYSIS --- */}
      {(loadingState.status === 'analyzing' || loadingState.status === 'error') && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xl animate-fade-in h-[100dvh]">
            <div className="w-full max-w-sm sm:max-w-md md:max-w-2xl bg-slate-950 rounded-xl overflow-hidden border border-slate-800 shadow-[0_0_80px_-20px_rgba(59,130,246,0.6)] relative transform transition-all">
                {/* Decoration Lines */}
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-60"></div>
                <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-60"></div>
                
                <div className="flex flex-col md:flex-row h-[420px] md:h-[320px]">
                    {/* Left: Image Sensor */}
                    <div className="relative w-full h-[180px] md:h-full md:w-5/12 bg-slate-900 border-b md:border-b-0 md:border-r border-slate-800 overflow-hidden group">
                        <div className="absolute inset-0 bg-grid-tech-premium opacity-20"></div>
                        <img 
                          src={previewUrl!} 
                          alt="Target" 
                          className="w-full h-full object-cover opacity-60 mix-blend-overlay contrast-125 saturate-0 group-hover:saturate-50 transition-all duration-500" 
                        />
                        <div className="absolute left-0 w-full h-[2px] bg-blue-400 shadow-[0_0_20px_rgba(59,130,246,1)] animate-scan-vertical z-20"></div>
                        <div className="absolute top-3 left-3 flex items-center gap-1.5 z-30">
                            <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]"></div>
                            <span className="text-[10px] font-mono font-bold text-red-400 tracking-widest uppercase">REC_Active</span>
                        </div>
                        <div className="absolute bottom-3 right-3 z-30">
                             <ScanLine className="w-5 h-5 text-blue-500/80 drop-shadow-[0_0_5px_rgba(59,130,246,0.8)]" />
                        </div>
                    </div>

                    {/* Right: Data Console */}
                    <div className="flex-1 p-5 md:p-6 flex flex-col justify-between bg-slate-950 relative">
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <div className="p-1 rounded bg-blue-500/10 border border-blue-500/20">
                                      <Cpu className="w-3.5 h-3.5 text-blue-500" />
                                    </div>
                                    <h3 className="text-[10px] md:text-xs font-bold text-blue-100 uppercase tracking-[0.2em] shadow-blue-500/50">Creative Build Core</h3>
                                </div>
                                <div className="flex items-center gap-2">
                                   <Signal className="w-3 h-3 text-emerald-500" />
                                   <span className="text-[9px] font-mono text-slate-500">LOW_LATENCY</span>
                                </div>
                            </div>
                            <div className="h-[1px] w-full bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 mb-5"></div>
                            <div className="h-[90px] mb-2 flex flex-col justify-center space-y-3">
                                <div className="flex items-start gap-3">
                                    <Activity className="w-3.5 h-3.5 text-blue-500 mt-0.5 shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-1">Current Operation</p>
                                        <p className="text-[11px] md:text-xs font-mono text-blue-400 font-bold truncate tracking-wide">
                                            {loadingState.status === 'error' ? 'SYSTEM_FAILURE' : SCAN_STEPS[scanStepIndex]}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Database className="w-3.5 h-3.5 text-slate-600 mt-0.5 shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-1">Standard Reference</p>
                                        <p className="text-[10px] md:text-xs font-mono text-slate-300 tracking-wide">
                                            NCC_AU_STANDARDS_2025.JSON
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {loadingState.status === 'error' && (
                            <div className="absolute inset-0 z-40 bg-slate-950/90 flex flex-col items-center justify-center p-6 text-center">
                                <AlertTriangle className="w-8 h-8 text-red-500 mb-3" />
                                <p className="text-red-400 font-mono text-xs mb-4">{loadingState.message}</p>
                                <button onClick={handleReset} className="px-4 py-2 border border-red-500/30 text-red-400 text-xs font-bold rounded hover:bg-red-500/10 flex items-center gap-2">
                                  <RefreshCw className="w-3 h-3" /> RETRY SYSTEM
                                </button>
                            </div>
                        )}

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
                                 <div className="absolute top-0 bottom-0 bg-white/20 w-full animate-pulse z-0" style={{ left: '-100%' }}></div>
                             </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      )}

      <main className="flex-grow flex flex-col relative z-10">
        {!previewUrl || loadingState.status === 'analyzing' ? (
             <div className={loadingState.status === 'analyzing' ? 'blur-sm grayscale opacity-30 pointer-events-none transition-all duration-1000' : ''}>
                <Hero onImageSelected={handleImageSelected} isLoading={false} />
             </div>
        ) : (
          <div className="w-full max-w-7xl mx-auto px-3 pt-6 sm:px-6 lg:p-8 animate-fade-in pb-12">
            <div className="space-y-6">
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