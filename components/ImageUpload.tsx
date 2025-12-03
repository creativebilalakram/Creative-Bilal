import React, { useRef, useState, useEffect } from 'react';
import { Upload, Camera, Link as LinkIcon, Loader2, ArrowRight, X, ScanLine, Plus, ShieldCheck, Activity } from 'lucide-react';

interface ImageUploadProps {
  onImageSelected: (file: File) => void;
  isLoading: boolean;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ onImageSelected, isLoading }) => {
  const [dragActive, setDragActive] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlValue, setUrlValue] = useState('');
  const [isProcessingUrl, setIsProcessingUrl] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const urlInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showUrlInput && urlInputRef.current) {
        urlInputRef.current.focus();
    }
  }, [showUrlInput]);

  // Handle Paste
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (isLoading || showUrlInput) return;
      if (e.clipboardData && e.clipboardData.files.length > 0) {
        const file = e.clipboardData.files[0];
        if (file.type.startsWith('image/')) {
          onImageSelected(file);
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [onImageSelected, isLoading, showUrlInput]);

  // Drag Handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isLoading) return;
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (isLoading) return;
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (JPG, PNG).');
      return;
    }
    onImageSelected(file);
  };

  const handleUrlSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!urlValue) return;
      
      setIsProcessingUrl(true);
      try {
          const res = await fetch(urlValue, { mode: 'cors' });
          const blob = await res.blob();
          if (!blob.type.startsWith('image/')) throw new Error("Not an image");
          
          const file = new File([blob], "url_image.jpg", { type: blob.type });
          onImageSelected(file);
          setShowUrlInput(false);
          setUrlValue('');
      } catch (err) {
          alert("Could not directly load image due to browser security (CORS). Please save the image and upload it instead.");
      } finally {
          setIsProcessingUrl(false);
      }
  };

  return (
    // Outer Container - SNAKE BORDER CONTAINER
    <div 
      className={`
        relative group w-full 
        h-[420px] sm:h-[480px]
        rounded-[2.5rem]
        shadow-[0_25px_50px_-12px_rgba(15,23,42,0.25)]
        transition-all duration-500 ease-out
        ${dragActive ? 'scale-[0.99]' : 'hover:shadow-[0_40px_70px_-15px_rgba(79,70,229,0.15)]'}
        p-[3px] /* Width of the Snake Border */
        overflow-hidden
        bg-white
      `}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
        {/* --- 1. SNAKE ANIMATION LAYERS --- */}
        <div className="absolute inset-[-100%] bg-[conic-gradient(from_0deg,transparent_0_340deg,#cbd5e1_360deg)] animate-[spin_4s_linear_infinite] opacity-100 group-hover:opacity-0 transition-opacity duration-500"></div>
        <div className="absolute inset-[-100%] bg-[conic-gradient(from_0deg,transparent_0_340deg,#6366f1_360deg)] animate-[spin_2s_linear_infinite] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

        {/* --- 2. AUTHENTIC DEVICE FRAME (Inner Box) --- */}
        <div className="absolute inset-[3px] rounded-[2.3rem] bg-[#f8fafc] border-[6px] border-white ring-1 ring-slate-200/50 overflow-hidden z-10">
            
            {/* Background Authentic Grid */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.03)_1px,transparent_1px)] [background-size:40px_40px]"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,white_0%,transparent_80%)] opacity-60"></div>
            </div>

            {/* Status Indicators */}
            <div className="absolute top-6 left-8 right-8 flex justify-between items-center z-20">
                <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm px-3 py-1.5 rounded-full border border-slate-200/60 shadow-sm">
                    <div className={`w-2 h-2 rounded-full ${isLoading ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`}></div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none pt-[1px]">
                        {isLoading ? 'System Busy' : 'System Ready'}
                    </span>
                </div>
                <div className="hidden sm:flex items-center gap-1.5 opacity-40">
                    <Activity className="w-3 h-3 text-slate-400" />
                    <span className="text-[10px] font-mono font-bold text-slate-400">V.2.4</span>
                </div>
            </div>

            {/* --- 3. CONTENT --- */}
            <input ref={inputRef} type="file" className="hidden" onChange={handleChange} accept="image/*" disabled={isLoading} />
            <input ref={cameraInputRef} type="file" className="hidden" onChange={handleChange} accept="image/*" capture="environment" disabled={isLoading} />

            <div className="relative z-20 flex flex-col items-center justify-center h-full w-full px-4 py-8">
                
                {showUrlInput ? (
                    // --- URL INPUT MODE ---
                    <div className="w-full max-w-sm animate-fade-in flex flex-col items-center justify-center h-full">
                        <div className="bg-slate-100 p-4 rounded-full mb-6 border border-slate-200">
                            <LinkIcon className="w-8 h-8 text-slate-500" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-6">Paste Image Link</h3>
                        <form onSubmit={handleUrlSubmit} className="relative flex items-center w-full mb-4 group/input">
                            <LinkIcon className="absolute left-4 w-5 h-5 text-slate-400 group-focus-within/input:text-indigo-500 transition-colors" />
                            <input 
                                ref={urlInputRef}
                                type="url"
                                value={urlValue}
                                onChange={(e) => setUrlValue(e.target.value)}
                                placeholder="https://..."
                                className="w-full pl-12 pr-12 py-4 bg-white border border-slate-200 rounded-full text-base focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 shadow-[0_2px_10px_rgba(0,0,0,0.03)]"
                                disabled={isProcessingUrl}
                            />
                            <button 
                                type="submit"
                                disabled={isProcessingUrl}
                                className="absolute right-2 p-2 bg-slate-900 text-white rounded-full hover:bg-indigo-600 transition-all shadow-md disabled:opacity-70 transform active:scale-90"
                            >
                                {isProcessingUrl ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                            </button>
                        </form>
                        <button 
                            onClick={() => { setShowUrlInput(false); setUrlValue(''); }}
                            className="text-xs font-bold text-slate-400 hover:text-slate-600 flex items-center justify-center gap-1.5 px-4 py-2 hover:bg-slate-100 rounded-full transition-colors"
                        >
                            <X className="w-3.5 h-3.5" /> Cancel
                        </button>
                    </div>
                ) : (
                    // --- DEFAULT MODE ---
                    <div className="flex flex-col items-center justify-between h-full w-full py-2">
                        
                        <div className="flex-1"></div>

                        <div className="flex flex-col items-center mb-8">
                            {/* ICON */}
                            <div 
                            className={`
                                relative w-20 h-20 sm:w-24 sm:h-24 mb-6
                                transition-all duration-500 ease-out 
                                ${isLoading ? 'scale-110' : 'group-hover:scale-105 group-hover:-translate-y-2'} 
                                cursor-pointer
                            `} 
                            onClick={() => inputRef.current?.click()}
                            >
                                {isLoading ? (
                                    <div className="relative w-full h-full flex items-center justify-center">
                                        <div className="absolute inset-0 bg-indigo-500/20 rounded-3xl blur-xl animate-pulse"></div>
                                        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin relative z-10 drop-shadow-md" />
                                    </div>
                                ) : (
                                    <>
                                        <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 w-16 h-4 bg-slate-900/10 rounded-[100%] blur-[6px] group-hover:w-20 group-hover:blur-[8px] transition-all duration-500"></div>
                                        <div className="relative w-full h-full flex items-center justify-center bg-white rounded-[2rem] shadow-[0_20px_40px_-10px_rgba(79,70,229,0.15),inset_0_1px_0_rgba(255,255,255,1),0_0_0_1px_rgba(226,232,240,1)] group-hover:shadow-[0_25px_50px_-12px_rgba(79,70,229,0.25),0_0_0_1px_rgba(99,102,241,0.3)] transition-all duration-500">
                                            <ScanLine className="absolute inset-0 w-full h-full text-slate-100 p-4" strokeWidth={1} />
                                            <Upload className="w-8 h-8 sm:w-10 sm:h-10 text-slate-700 group-hover:text-indigo-600 transition-colors relative z-10" />
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* HEADLINE */}
                            <h3 className="text-2xl sm:text-4xl font-black text-slate-900 mb-3 tracking-tight text-center">
                                {isLoading ? 'Scanning...' : 'Start Scan'}
                            </h3>
                            <p className="text-slate-500 text-sm sm:text-base font-medium max-w-[280px] mx-auto text-center leading-relaxed mb-8">
                                Drag & drop or select a photo.
                            </p>

                            {/* --- COMPACT BUTTONS (ROUNDED FULL) --- */}
                            <div className="flex flex-col sm:flex-row items-center gap-3 w-full justify-center max-w-[90%] sm:max-w-lg mx-auto">
                                
                                {/* Upload Button with DYNAMIC LIGHT SHINE */}
                                <button 
                                    onClick={() => inputRef.current?.click()}
                                    disabled={isLoading}
                                    className="
                                    relative w-full sm:flex-1
                                    group/btn overflow-hidden
                                    bg-slate-900 
                                    text-white px-6 py-3.5 
                                    rounded-full
                                    text-sm font-bold tracking-wide
                                    shadow-xl shadow-slate-900/20
                                    hover:shadow-indigo-600/30
                                    transition-all duration-300 ease-out
                                    transform hover:-translate-y-0.5 active:scale-[0.98]
                                    flex items-center justify-center gap-2.5
                                    "
                                >
                                    {/* Base Gradient Hover */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                                    
                                    {/* DYNAMIC LIGHT SHINE EFFECT */}
                                    <div className="absolute inset-0 -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent z-10"></div>
                                    <style>{`
                                      @keyframes shimmer {
                                        100% { transform: translateX(100%); }
                                      }
                                    `}</style>

                                    <Plus className="w-5 h-5 text-indigo-300 group-hover/btn:text-white transition-colors relative z-20" />
                                    <span className="relative z-20">Upload Photo</span>
                                </button>

                                <div className="flex w-full sm:w-auto gap-3">
                                    <button 
                                        onClick={() => cameraInputRef.current?.click()}
                                        disabled={isLoading}
                                        className="
                                        flex-1 sm:flex-none
                                        h-[50px] w-[60px]
                                        bg-white border border-slate-200
                                        rounded-full
                                        flex items-center justify-center
                                        text-slate-600 
                                        hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50
                                        shadow-sm hover:shadow-md
                                        transition-all duration-200
                                        group/cam
                                        "
                                    >
                                        <Camera className="w-5 h-5 group-hover/cam:scale-110 transition-transform" />
                                    </button>
                                    
                                    <button 
                                        onClick={() => setShowUrlInput(true)}
                                        disabled={isLoading}
                                        className="
                                        flex-1 sm:flex-none
                                        h-[50px] w-[60px]
                                        bg-white border border-slate-200
                                        rounded-full
                                        flex items-center justify-center
                                        text-slate-600 
                                        hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50
                                        shadow-sm hover:shadow-md
                                        transition-all duration-200
                                        group/link
                                        "
                                    >
                                        <LinkIcon className="w-5 h-5 group-hover/link:scale-110 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1"></div>

                        {/* --- PROMINENT FOOTER --- */}
                        <div className="mt-auto pb-2">
                            <div className="inline-flex items-center gap-4 px-6 py-2.5 rounded-full bg-white/50 border border-slate-200/60 backdrop-blur-md shadow-sm">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">JPG</span>
                                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">PNG</span>
                                <div className="w-px h-3 bg-slate-300 mx-1"></div>
                                <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 uppercase tracking-widest">
                                    <ShieldCheck className="w-3.5 h-3.5" /> Secure
                                </span>
                            </div>
                        </div>

                    </div>
                )}
            </div>
        </div>
    </div>
  );
};