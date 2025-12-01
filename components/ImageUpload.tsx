import React, { useRef, useState, useEffect } from 'react';
import { Upload, Camera, Link as LinkIcon, Loader2, Image as ImageIcon, ArrowRight, X } from 'lucide-react';

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
        shadow-[0_20px_60px_-12px_rgba(0,0,0,0.12),0_8px_24px_-8px_rgba(0,0,0,0.06)] 
        p-[3px] overflow-hidden bg-slate-200
        flex flex-col 
        transition-all duration-500 ease-out
        ${dragActive ? 'scale-[1.01]' : ''}
      `}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
        {/* --- BORDER ANIMATIONS --- */}
        <div className="absolute inset-0 bg-slate-200" />
        <div className="absolute inset-[-100%] animate-[spin_5s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#e2e8f0_0%,#cbd5e1_50%,#e2e8f0_100%)] opacity-100 group-hover:opacity-0 transition-opacity duration-500" />
        <div className="absolute inset-[-100%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#0000_0%,#3b82f6_50%,#0000_100%)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        {dragActive && (
             <div className="absolute inset-[-100%] animate-[spin_1.5s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#3b82f6_0%,#60a5fa_50%,#3b82f6_100%)] opacity-100 z-10" />
        )}

        {/* --- INNER CARD CONTENT WITH DEPTH --- */}
        <div className="relative flex-1 w-full h-full rounded-[1.4rem] sm:rounded-[2.4rem] flex flex-col justify-center overflow-hidden z-20 bg-[#fafafa]">
            
            {/* 1. Technical Grid Texture */}
            <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1.5px,transparent_1.5px)] [background-size:24px_24px] opacity-[0.4] pointer-events-none"></div>

            {/* 2. Deep Inset Shadow (The "Tray" Effect) */}
            <div className="absolute inset-0 shadow-[inset_0_2px_20px_rgba(0,0,0,0.02),inset_0_10px_40px_-10px_rgba(0,0,0,0.05)] rounded-[1.4rem] sm:rounded-[2.4rem] pointer-events-none"></div>

            {/* 3. Top Highlight (Ambient Light) */}
            <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-white to-transparent opacity-80 pointer-events-none"></div>

            {/* 4. Bottom Shadow/Depth */}
            <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-slate-100/80 to-transparent pointer-events-none"></div>

            {/* Soft Inner Glow on Hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>

            {/* --- CONTENT LAYER --- */}
            <input ref={inputRef} type="file" className="hidden" onChange={handleChange} accept="image/*" disabled={isLoading} />
            <input ref={cameraInputRef} type="file" className="hidden" onChange={handleChange} accept="image/*" capture="environment" disabled={isLoading} />

            <div className="flex flex-col items-center justify-center text-center w-full relative z-30 px-4 py-6 sm:px-6 sm:py-8 h-full">
                
                {/* 3D Icon Section */}
                {!showUrlInput && (
                    <div 
                    className={`relative w-14 h-14 sm:w-24 sm:h-24 mb-4 sm:mb-8 transition-transform duration-500 ease-out ${isLoading ? 'scale-110' : 'group-hover:scale-110 group-hover:-translate-y-2'} cursor-pointer`} 
                    onClick={() => inputRef.current?.click()}
                    >
                        {isLoading ? (
                            <div className="relative w-full h-full flex items-center justify-center">
                                <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl animate-pulse"></div>
                                <Loader2 className="w-8 h-8 sm:w-12 sm:h-12 text-blue-600 animate-spin relative z-10 drop-shadow-md" />
                            </div>
                        ) : (
                            <>
                                {/* Floating Platform Shadow */}
                                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-2 bg-slate-300/50 rounded-[100%] blur-sm group-hover:w-12 group-hover:blur-md transition-all duration-500"></div>

                                {/* Icon Container with Glassmorphism */}
                                <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-tr from-white to-slate-50 rounded-2xl sm:rounded-[2rem] shadow-[0_8px_16px_-4px_rgba(0,0,0,0.05),inset_0_1px_2px_rgba(255,255,255,0.8)] border border-white">
                                    <div className="absolute inset-0 bg-blue-50/30 rounded-2xl sm:rounded-[2rem]"></div>
                                    <Upload className="w-6 h-6 sm:w-10 sm:h-10 text-blue-600 drop-shadow-md relative z-10" />
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* Content Area */}
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
                                className="w-full pl-12 pr-12 py-3 sm:py-4 bg-white/80 border border-slate-200 rounded-2xl text-sm sm:text-base focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400 shadow-[inset_0_2px_4px_rgba(0,0,0,0.03)]"
                                disabled={isProcessingUrl}
                            />
                            <button 
                                type="submit"
                                disabled={isProcessingUrl}
                                className="absolute right-2.5 p-1.5 sm:p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:shadow-none transform active:scale-90"
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
                        <h3 className="text-lg sm:text-3xl font-black text-slate-800 mb-1.5 sm:mb-3 tracking-tight drop-shadow-sm">
                            {isLoading ? 'Analyzing...' : 'Start Scan'}
                        </h3>
                        <p className="text-slate-500 text-[11px] sm:text-base mb-5 sm:mb-10 font-medium max-w-[220px] sm:max-w-[280px] mx-auto leading-relaxed">
                            Drag & drop or select a photo to identify defects instantly.
                        </p>

                        {/* --- COMPACT PRO MOBILE ROW LAYOUT --- */}
                        <div className="flex flex-row items-stretch gap-1.5 sm:gap-3 w-full justify-center max-w-[90%] sm:max-w-md mx-auto h-[46px] sm:h-[58px]">
                            
                            {/* 1. Main Upload Button (Dominant) */}
                            <button 
                                onClick={() => inputRef.current?.click()}
                                disabled={isLoading}
                                className="
                                flex-[1.5]
                                group/btn relative overflow-hidden
                                bg-gradient-to-br from-blue-600 to-indigo-600
                                hover:from-blue-500 hover:to-indigo-500
                                text-white px-3 sm:px-6 
                                rounded-xl sm:rounded-2xl
                                text-xs sm:text-base font-bold
                                shadow-[0_8px_20px_-5px_rgba(37,99,235,0.4),inset_0_1px_0_rgba(255,255,255,0.2)]
                                hover:shadow-[0_15px_25px_-5px_rgba(37,99,235,0.5)]
                                transition-all duration-300 ease-out
                                transform hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0
                                flex items-center justify-center gap-2
                                "
                            >
                                <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-100" />
                                <span className="relative z-10 whitespace-nowrap">
                                    Upload<span className="inline"> Photo</span>
                                </span>
                            </button>

                            {/* 2. Camera Button (Compact Square) */}
                            <button 
                                onClick={() => cameraInputRef.current?.click()}
                                disabled={isLoading}
                                className="
                                flex-shrink-0 w-[46px] sm:w-[58px]
                                bg-white
                                border border-slate-200
                                rounded-xl sm:rounded-2xl
                                flex items-center justify-center
                                text-slate-600 hover:text-blue-600
                                shadow-[0_2px_5px_rgba(0,0,0,0.05)]
                                hover:shadow-md
                                hover:border-blue-200
                                transition-all duration-300
                                transform hover:-translate-y-0.5 active:scale-[0.95]
                                "
                                aria-label="Take Photo"
                            >
                                <Camera className="w-5 h-5 sm:w-6 sm:h-6" />
                            </button>
                            
                            {/* 3. Link Button (Compact Square) */}
                            <button 
                                onClick={() => setShowUrlInput(true)}
                                disabled={isLoading}
                                className="
                                flex-shrink-0 w-[46px] sm:w-[58px]
                                bg-white
                                border border-slate-200
                                rounded-xl sm:rounded-2xl
                                flex items-center justify-center
                                text-slate-600 hover:text-blue-600
                                shadow-[0_2px_5px_rgba(0,0,0,0.05)]
                                hover:shadow-md
                                hover:border-blue-200
                                transition-all duration-300
                                transform hover:-translate-y-0.5 active:scale-[0.95]
                                "
                                aria-label="Paste Link"
                            >
                                <LinkIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                            </button>
                        </div>

                        {/* Footer Text */}
                        <div className="flex items-center gap-3 text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-auto pt-3 sm:pt-10 opacity-60">
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
    </div>
  );
};