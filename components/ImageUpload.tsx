import React, { useRef, useState, useEffect } from 'react';
import { Upload, Camera, Link as LinkIcon, Loader2, Image as ImageIcon, ArrowRight, X, ScanLine, Aperture } from 'lucide-react';

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
    // Outer Container
    <div 
      className={`
        relative group w-full 
        min-h-[280px] sm:min-h-[420px]
        rounded-[1.5rem] sm:rounded-[2.5rem]
        
        /* SHARP DROP SHADOW ONLY - Deep & Architectural */
        shadow-[0_20px_60px_-15px_rgba(15,23,42,0.2)]
        
        bg-transparent
        
        transition-all duration-500 ease-out
        
        ${dragActive ? 'scale-[0.995]' : ''}
      `}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
        {/* --- 1. ADAPTIVE SNAKE BORDER LAYER --- */}
        <div className="absolute inset-0 rounded-[1.5rem] sm:rounded-[2.5rem] overflow-hidden z-0">
             
             {/* A. Professional Silver Snake (DEFAULT) */}
             {/* Slow spin, subtle contrast, looks engineered */}
             <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] 
                 bg-[conic-gradient(from_0deg,transparent_0_340deg,#cbd5e1_350deg,#64748b_360deg)]
                 animate-[spin_4s_linear_infinite]
                 opacity-100 group-hover:opacity-0 transition-opacity duration-500
             "></div>

             {/* B. Electric Blue Snake (HOVER) */}
             {/* Fast spin, high energy, activates on interaction */}
             <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] 
                 bg-[conic-gradient(from_0deg,transparent_0_340deg,#60a5fa_350deg,#2563eb_360deg)]
                 animate-[spin_2s_linear_infinite]
                 opacity-0 group-hover:opacity-100 transition-opacity duration-500
             "></div>
        </div>

        {/* --- 2. KILLER BACKGROUND FACE --- */}
        {/* Inset by 1.5px to reveal snake border sharply */}
        <div className="absolute inset-[1.5px] rounded-[calc(1.5rem-1.5px)] sm:rounded-[calc(2.5rem-1.5px)] z-10 
            overflow-hidden bg-[#f8fafc]
        ">
            {/* Base: Platinum Mesh Gradient */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white via-slate-50 to-slate-100 opacity-100"></div>
            
            {/* Texture: Micro-Noise (Adds physical material feel) */}
            <div className="absolute inset-0 opacity-[0.03] mix-blend-multiply" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>

             {/* Pattern: Technical Grid (Very Subtle, Fades out at edges) */}
             <div className="absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.03)_1px,transparent_1px)] [background-size:32px_32px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_100%)] pointer-events-none"></div>

            {/* Reflection: Top Glass Bevel */}
            <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white to-transparent opacity-80"></div>
            <div className="absolute bottom-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-slate-300 to-transparent opacity-50"></div>
        </div>

        {/* --- 3. CONTENT LAYER --- */}
        <input ref={inputRef} type="file" className="hidden" onChange={handleChange} accept="image/*" disabled={isLoading} />
        <input ref={cameraInputRef} type="file" className="hidden" onChange={handleChange} accept="image/*" capture="environment" disabled={isLoading} />

        <div className="relative z-20 flex flex-col items-center justify-center w-full h-full px-4 py-8 sm:py-12 flex-1">
            
            {/* Icon Section */}
            {!showUrlInput && (
                <div 
                className={`
                    relative w-16 h-16 sm:w-24 sm:h-24 mb-6 sm:mb-10 
                    transition-all duration-500 ease-out 
                    ${isLoading ? 'scale-110' : 'group-hover:scale-105 group-hover:-translate-y-2'} 
                    cursor-pointer
                `} 
                onClick={() => inputRef.current?.click()}
                >
                    {isLoading ? (
                        <div className="relative w-full h-full flex items-center justify-center">
                            <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl animate-pulse"></div>
                            <Loader2 className="w-8 h-8 sm:w-12 sm:h-12 text-blue-600 animate-spin relative z-10 drop-shadow-md" />
                        </div>
                    ) : (
                        <>
                            {/* Icon Shadow */}
                            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-14 h-2 bg-slate-900/10 rounded-[100%] blur-[4px] group-hover:w-20 group-hover:blur-[6px] transition-all duration-500"></div>

                            {/* Pro Icon Container */}
                            <div className="relative w-full h-full flex items-center justify-center bg-white rounded-[1.2rem] sm:rounded-[2rem] shadow-[0_10px_30px_-10px_rgba(15,23,42,0.1),inset_0_1px_0_rgba(255,255,255,1),0_0_0_1px_rgba(226,232,240,1)] group-hover:shadow-[0_20px_40px_-12px_rgba(37,99,235,0.25),0_0_0_1px_rgba(59,130,246,0.3)] transition-all duration-500">
                                <ScanLine className="absolute inset-0 w-full h-full text-slate-100 p-3" strokeWidth={1} />
                                <Upload className="w-7 h-7 sm:w-10 sm:h-10 text-slate-700 group-hover:text-blue-600 transition-colors relative z-10" />
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* Main Text & Buttons */}
            {showUrlInput ? (
                <div className="w-full max-w-sm animate-fade-in py-4 flex flex-col items-center">
                    <h3 className="text-lg sm:text-xl font-bold text-slate-800 mb-4 sm:mb-6">Paste Image Link</h3>
                    <form onSubmit={handleUrlSubmit} className="relative flex items-center w-full mb-4 group/input">
                        <LinkIcon className="absolute left-4 w-5 h-5 text-slate-400 group-focus-within/input:text-blue-500 transition-colors" />
                        <input 
                            ref={urlInputRef}
                            type="url"
                            value={urlValue}
                            onChange={(e) => setUrlValue(e.target.value)}
                            placeholder="https://..."
                            className="w-full pl-12 pr-12 py-3 sm:py-4 bg-white border border-slate-200 rounded-2xl text-sm sm:text-base focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400 shadow-[0_2px_4px_rgba(0,0,0,0.02)]"
                            disabled={isProcessingUrl}
                        />
                        <button 
                            type="submit"
                            disabled={isProcessingUrl}
                            className="absolute right-2.5 p-1.5 sm:p-2 bg-slate-900 text-white rounded-xl hover:bg-blue-600 transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:shadow-none transform active:scale-90"
                        >
                            {isProcessingUrl ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                        </button>
                    </form>
                    <button 
                        onClick={() => { setShowUrlInput(false); setUrlValue(''); }}
                        className="text-xs font-bold text-slate-400 hover:text-slate-600 flex items-center justify-center gap-1.5 px-4 py-2 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <X className="w-3.5 h-3.5" /> Cancel
                    </button>
                </div>
            ) : (
                <>
                    <h3 className="text-xl sm:text-3xl font-black text-slate-900 mb-2 sm:mb-3 tracking-tight drop-shadow-sm">
                        {isLoading ? 'Analyzing...' : 'Start Scan'}
                    </h3>
                    <p className="text-slate-500 text-xs sm:text-base mb-6 sm:mb-10 font-medium max-w-[240px] sm:max-w-[320px] mx-auto leading-relaxed text-center">
                        Drag & drop or select a photo to identify defects instantly.
                    </p>

                    {/* --- PRO CONTROLS ROW --- */}
                    <div className="flex flex-row items-stretch gap-2 sm:gap-3 w-full justify-center max-w-[95%] sm:max-w-md mx-auto h-[50px] sm:h-[60px]">
                        
                        {/* 1. Main Upload Button - SHARP UPDATE */}
                        <button 
                            onClick={() => inputRef.current?.click()}
                            disabled={isLoading}
                            className="
                            flex-[1.5]
                            group/btn relative overflow-hidden
                            bg-slate-900 hover:bg-blue-600
                            text-white px-4 sm:px-6 
                            rounded-xl sm:rounded-2xl
                            text-sm sm:text-base font-bold
                            
                            /* SHARP EDGES - No Blur */
                            border border-slate-700 hover:border-blue-500
                            /* Removed all blurry shadows */
                            shadow-none
                            
                            transition-all duration-300 ease-out
                            transform hover:-translate-y-0.5 active:scale-[0.98]
                            flex items-center justify-center gap-2.5
                            "
                        >
                            {/* Subtle internal shine */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700 ease-in-out"></div>
                            
                            <Aperture className="w-4 h-4 sm:w-5 sm:h-5 text-slate-300 group-hover/btn:text-white transition-colors" />
                            <span className="relative z-10 whitespace-nowrap tracking-wide">
                                Upload Photo
                            </span>
                        </button>

                        {/* 2. Camera Button - SHARP UPDATE */}
                        <button 
                            onClick={() => cameraInputRef.current?.click()}
                            disabled={isLoading}
                            className="
                            flex-shrink-0 w-[50px] sm:w-[60px]
                            bg-white
                            border border-slate-200
                            rounded-xl sm:rounded-2xl
                            flex items-center justify-center
                            text-slate-600 hover:text-blue-600 hover:border-blue-400 hover:bg-blue-50
                            shadow-none
                            transition-all duration-300
                            "
                            aria-label="Take Photo"
                        >
                            <Camera className="w-5 h-5 sm:w-6 sm:h-6" />
                        </button>
                        
                        {/* 3. Link Button - SHARP UPDATE */}
                        <button 
                            onClick={() => setShowUrlInput(true)}
                            disabled={isLoading}
                            className="
                            flex-shrink-0 w-[50px] sm:w-[60px]
                            bg-white
                            border border-slate-200
                            rounded-xl sm:rounded-2xl
                            flex items-center justify-center
                            text-slate-600 hover:text-blue-600 hover:border-blue-400 hover:bg-blue-50
                            shadow-none
                            transition-all duration-300
                            "
                            aria-label="Paste Link"
                        >
                            <LinkIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                        </button>
                    </div>

                    {/* Footer Text */}
                    <div className="flex items-center gap-3 text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-auto pt-6 sm:pt-10 opacity-60">
                        <span>JPG</span>
                        <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                        <span>PNG</span>
                        <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                        <span>Secure</span>
                    </div>
                </>
            )}
        </div>
    </div>
  );
};