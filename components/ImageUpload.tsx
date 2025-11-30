import React, { useRef, useState, useEffect } from 'react';
import { Upload, Camera, Link as LinkIcon, HardDrive, Loader2, Image as ImageIcon, ArrowRight, X } from 'lucide-react';

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

  // Handle Paste Event
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
    <div 
      className={`bg-white rounded-[2rem] p-6 sm:p-8 md:p-12 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.08)] transition-all duration-300 relative border-2 border-dashed border-slate-300 hover:border-blue-500 hover:bg-slate-50 min-h-[340px] md:min-h-[420px] flex flex-col justify-center
        ${dragActive ? 'border-blue-500 bg-blue-50/30 scale-[1.01]' : ''}`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
        <input ref={inputRef} type="file" className="hidden" onChange={handleChange} accept="image/*" disabled={isLoading} />
        <input ref={cameraInputRef} type="file" className="hidden" onChange={handleChange} accept="image/*" capture="environment" disabled={isLoading} />

        <div className="flex flex-col items-center justify-center text-center w-full">
            
            {/* Top Icon - Animated */}
            {!showUrlInput && (
                <div className={`w-16 h-16 sm:w-20 sm:h-20 bg-blue-50/80 rounded-full flex items-center justify-center mb-5 sm:mb-6 transition-transform duration-300 ${isLoading ? 'scale-110' : 'hover:scale-110'}`}>
                    {isLoading ? (
                        <div className="relative">
                            <div className="absolute inset-0 bg-blue-500 rounded-full opacity-20 animate-ping"></div>
                            <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 animate-spin relative z-10" />
                        </div>
                    ) : (
                        <div className="relative group cursor-pointer" onClick={() => inputRef.current?.click()}>
                            <div className="absolute inset-0 bg-blue-200 rounded-full opacity-0 group-hover:opacity-40 transition-opacity blur-md"></div>
                            <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 mb-1 relative z-10" />
                            <div className="h-1 w-5 bg-blue-600 rounded-full mx-auto relative z-10"></div>
                        </div>
                    )}
                </div>
            )}

            {/* Content Area - Swaps between Default and URL Input */}
            {showUrlInput ? (
                <div className="w-full max-w-sm animate-fade-in py-4 flex flex-col items-center">
                    <h3 className="text-xl font-bold text-slate-800 mb-6">Paste Image Link</h3>
                    <form onSubmit={handleUrlSubmit} className="relative flex items-center w-full mb-4">
                        <LinkIcon className="absolute left-4 w-4 h-4 text-slate-400" />
                        <input 
                            ref={urlInputRef}
                            type="url"
                            value={urlValue}
                            onChange={(e) => setUrlValue(e.target.value)}
                            placeholder="https://example.com/image.jpg"
                            className="w-full pl-10 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            disabled={isProcessingUrl}
                        />
                        <button 
                            type="submit"
                            disabled={isProcessingUrl}
                            className="absolute right-2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                            {isProcessingUrl ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                        </button>
                    </form>
                    <button 
                        onClick={() => { setShowUrlInput(false); setUrlValue(''); }}
                        className="text-xs font-bold text-slate-400 hover:text-slate-600 flex items-center justify-center gap-1 px-4 py-2 hover:bg-slate-50 rounded-lg transition-colors"
                    >
                        <X className="w-3 h-3" /> Cancel
                    </button>
                </div>
            ) : (
                <>
                    <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2 tracking-tight">
                        {isLoading ? 'Analyzing Structure...' : 'Start Defect Scan'}
                    </h3>
                    <p className="text-slate-400 text-sm mb-8 sm:mb-10 font-medium max-w-xs mx-auto">
                        Drag & drop, upload, or paste a link to get instant expert feedback.
                    </p>

                    {/* Buttons Row */}
                    <div className="flex flex-row items-center gap-2 sm:gap-3 w-full justify-center mb-8 flex-wrap">
                        
                        {/* Main Upload Button */}
                        <button 
                            onClick={() => inputRef.current?.click()}
                            disabled={isLoading}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 sm:px-8 py-3.5 rounded-full text-sm font-bold shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 transition-all flex items-center gap-2 transform hover:-translate-y-0.5 active:translate-y-0 w-full sm:w-auto justify-center sm:justify-start"
                        >
                            <ImageIcon className="w-4 h-4" />
                            Upload Photo
                        </button>

                        <div className="hidden sm:block w-px h-8 bg-slate-200 mx-2"></div>

                        {/* Circular Action Buttons - Responsive Grouping */}
                        <div className="flex gap-2 w-full sm:w-auto justify-center">
                            <button 
                                onClick={() => cameraInputRef.current?.click()}
                                title="Take Photo"
                                disabled={isLoading}
                                className="group w-11 h-11 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-500 hover:text-blue-600 hover:border-blue-300 transition-all hover:shadow-md"
                            >
                                <Camera className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            </button>
                            <button 
                                onClick={() => setShowUrlInput(true)}
                                title="Paste Link"
                                disabled={isLoading}
                                className="group w-11 h-11 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-500 hover:text-blue-600 hover:border-blue-300 transition-all hover:shadow-md"
                            >
                                <LinkIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            </button>
                            <button 
                                onClick={() => inputRef.current?.click()}
                                title="Drive"
                                disabled={isLoading}
                                className="group w-11 h-11 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-500 hover:text-blue-600 hover:border-blue-300 transition-all hover:shadow-md"
                            >
                                <HardDrive className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            </button>
                        </div>
                    </div>

                    {/* Footer Text */}
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-auto">
                        <span>JPG</span>
                        <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                        <span>PNG</span>
                        <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                        <span>MAX 10MB</span>
                    </div>
                </>
            )}

        </div>
    </div>
  );
};