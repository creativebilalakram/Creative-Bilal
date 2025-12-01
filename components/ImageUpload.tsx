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
        min-h-[340px] sm:min-h-[420px] /* Compact on mobile */
        rounded-[2rem] sm:rounded-[2.5rem]
        shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)]
        p-[2px] overflow-hidden bg-slate-100
        flex flex-col 
        transition-all duration-500 ease-out
        ${dragActive ? 'scale-[1.01]' : ''}
      `}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
        {/* --- SNAKE BORDER ANIMATION LAYERS --- */}
        
        {/* 1. Base Rim */}
        <div className="absolute inset-0 bg-slate-200/50" />

        {/* 2. IDLE STATE: Subtle "Ghost" Silver Snake (Always visible when not hovering) */}
        <div className="absolute inset-[-100%] animate-[spin_5s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#0000_0%,#0000_90%,#94a3b8_95%,#e2e8f0_100%)] opacity-70 group-hover:opacity-0 transition-opacity duration-500" />

        {/* 3. HOVER STATE: High-Energy Blue Snake (Visible on Hover) */}
        <div className="absolute inset-[-100%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#0000_0%,#0000_92%,#3b82f6_98%,#ffffff_100%)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* 4. DRAG STATE: Full Blue Spin */}
        {dragActive && (
             <div className="absolute inset-[-100%] animate-[spin_1.5s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#3b82f6_0%,#60a5fa_50%,#3b82f6_100%)] opacity-100 z-10" />
        )}

        {/* --- INNER CARD CONTENT --- */}
        <div className="relative flex-1 w-full h-full bg-white/95 backdrop-blur-3xl rounded-[1.9rem] sm:rounded-[2.4rem] flex flex-col justify-center overflow-hidden z-20">
            
            {/* Soft Inner Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>

            <input ref={inputRef} type="file" className="hidden" onChange={handleChange} accept="image/*" disabled={isLoading} />
            <input ref={cameraInputRef} type="file" className="hidden" onChange={handleChange} accept="image/*" capture="environment" disabled={isLoading} />

            <div className="flex flex-col items-center justify-center text-center w-full relative z-30 px-4 py-6 sm:px-6 sm:py-8">
                
                {/* 3D Icon Section */}
                {!showUrlInput && (
                    <div 
                    className={`relative w-20 h-20 sm:w-24 sm:h-24 mb-6 sm:mb-8 transition-transform duration-500 ease-out ${isLoading ? 'scale-110' : 'group-hover:scale-110 group-hover:-translate-y-2'} cursor-pointer`} 
                    onClick={() => inputRef.current?.click()}
                    >
                        {isLoading ? (
                            <div className="relative w-full h-full flex items-center justify-center">
                                <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl animate-pulse"></div>
                                <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 text-blue-600 animate-spin relative z-10 drop-shadow-md" />
                            </div>
                        ) : (
                            <>
                                {/* Animated layers for 3D feel */}
                                <div className="absolute inset-0 bg-gradient-to-tr from-blue-400/20 to-indigo-400/20 rounded-[2rem] blur-xl animate-pulse"></div>
                                <div className="absolute inset-0 bg-white/80 rounded-[2rem] shadow-inner border border-white/50"></div>
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 rounded-[2rem] opacity-50"></div>
                                
                                <div className="relative w-full h-full flex items-center justify-center transform transition-transform duration-500 group-hover:rotate-6">
                                    <Upload className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600 drop-shadow-md" />
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
                                className="w-full pl-12 pr-12 py-3 sm:py-4 bg-white/60 border border-slate-200 rounded-2xl text-sm sm:text-base focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400 shadow-sm"
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
                        <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2 sm:mb-3 tracking-tight drop-shadow-sm">
                            {isLoading ? 'Analyzing...' : 'Start Scan'}
                        </h3>
                        <p className="text-slate-500 text-sm sm:text-base mb-6 sm:mb-10 font-medium max-w-[240px] sm:max-w-[280px] mx-auto leading-relaxed">
                            Drag & drop or select a photo to identify defects instantly.
                        </p>

                        {/* Buttons Row - Tactile Design - Compact on Mobile */}
                        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full justify-center max-w-md mx-auto">
                            
                            {/* Main Upload Button */}
                            <button 
                                onClick={() => inputRef.current?.click()}
                                disabled={isLoading}
                                className="
                                group/btn relative overflow-hidden
                                bg-gradient-to-br from-blue-600 to-indigo-600
                                hover:from-blue-500 hover:to-indigo-500
                                text-white px-8 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl
                                text-sm sm:text-base font-bold
                                shadow-[0_10px_20px_-5px_rgba(37,99,235,0.4)]
                                hover:shadow-[0_20px_30px_-5px_rgba(37,99,235,0.5)]
                                transition-all duration-300 ease-out
                                transform hover:-translate-y-1 active:scale-[0.98] active:translate-y-0
                                w-full sm:w-auto flex items-center justify-center gap-3
                                "
                            >
                                <span className="relative z-10 flex items-center gap-2">
                                    <ImageIcon className="w-5 h-5" />
                                    Upload Photo
                                </span>
                                <div className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-in-out z-0"></div>
                            </button>

                            <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto justify-center">
                                {/* Camera Button */}
                                <button 
                                    onClick={() => cameraInputRef.current?.click()}
                                    disabled={isLoading}
                                    className="
                                    flex-1 sm:flex-none h-[50px] sm:h-[56px] sm:w-[56px]
                                    bg-white/50 backdrop-blur-sm
                                    border border-slate-200
                                    rounded-xl sm:rounded-2xl
                                    flex items-center justify-center
                                    text-slate-600 hover:text-blue-600
                                    shadow-[0_4px_10px_-2px_rgba(0,0,0,0.05)]
                                    hover:shadow-[0_10px_20px_-5px_rgba(0,0,0,0.1)]
                                    hover:border-blue-200 hover:bg-white
                                    transition-all duration-300
                                    transform hover:-translate-y-1 active:scale-[0.95]
                                    "
                                    aria-label="Take Photo"
                                >
                                    <Camera className="w-5 h-5" />
                                </button>
                                
                                {/* Link Button */}
                                <button 
                                    onClick={() => setShowUrlInput(true)}
                                    disabled={isLoading}
                                    className="
                                    flex-1 sm:flex-none h-[50px] sm:h-[56px] sm:w-[56px]
                                    bg-white/50 backdrop-blur-sm
                                    border border-slate-200
                                    rounded-xl sm:rounded-2xl
                                    flex items-center justify-center
                                    text-slate-600 hover:text-blue-600
                                    shadow-[0_4px_10px_-2px_rgba(0,0,0,0.05)]
                                    hover:shadow-[0_10px_20px_-5px_rgba(0,0,0,0.1)]
                                    hover:border-blue-200 hover:bg-white
                                    transition-all duration-300
                                    transform hover:-translate-y-1 active:scale-[0.95]
                                    "
                                    aria-label="Paste Link"
                                >
                                    <LinkIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Footer Text */}
                        <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-auto pt-6 sm:pt-10 opacity-70">
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