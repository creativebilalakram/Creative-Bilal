import React from 'react';
import { Award } from 'lucide-react';
import { ImageUpload } from './ImageUpload';

interface HeroProps {
  onImageSelected: (file: File) => void;
  isLoading: boolean;
}

export const Hero: React.FC<HeroProps> = ({ onImageSelected, isLoading }) => {
  return (
    <div className="relative pt-10 pb-20 sm:pt-16 sm:pb-24 lg:pb-32 overflow-hidden w-full flex flex-col items-center selection:bg-indigo-100">
      
      {/* --- BACKGROUND FX LAYER --- */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute top-[-20%] left-[50%] -translate-x-1/2 w-[120%] h-[800px] bg-gradient-to-b from-blue-50/40 via-indigo-50/10 to-transparent blur-[120px] opacity-60"></div>
          <div className="absolute top-10 left-10 opacity-10 hidden xl:block text-slate-500 animate-fade-in-up delay-500">
             <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                 <path d="M0 20H40 M20 0V40" stroke="currentColor" strokeWidth="1" />
             </svg>
          </div>
      </div>

      <div className="relative w-full max-w-[1400px] mx-auto px-4 sm:px-6 flex flex-col items-center text-center z-10">
        
        {/* --- LOGO SECTION (PNG with White Box & Shadow) --- */}
        <div className="flex items-center gap-3 mb-10 animate-fade-in-up">
             {/* The Logo Container - Solid White, Slight Popout Shadow */}
             <div className="bg-white p-2 rounded-xl shadow-lg shadow-slate-900/5 border border-slate-100">
                <img 
                    src="https://creativebilal.com/wp-content/uploads/2025/12/Black-Blue-Minimalist-Modern-Initial-Font-Logo.png" 
                    alt="Creative Build AI Logo" 
                    className="w-10 h-10 object-contain"
                />
             </div>
             <span className="font-bold text-slate-900 tracking-tight text-xl sm:text-2xl">Creative Build <span className="text-indigo-600">AI</span></span>
        </div>

        {/* --- HEADLINE --- */}
        <div className="relative mb-8 sm:mb-12 w-full flex justify-center">
            <h1 className="relative flex flex-col md:block items-center justify-center 
              text-[2.5rem] xs:text-[3rem] sm:text-5xl md:text-5xl lg:text-6xl xl:text-[4.5rem] 
              font-black tracking-tight leading-[1.1] text-slate-900 
              animate-fade-in-up delay-100 max-w-none w-full"
            >
              <span className="inline-block md:mr-3 mb-1 md:mb-0">Identify Building</span>
              
              {/* --- LIGHT MOVING ANIMATION --- */}
              <span className="relative inline-flex items-center">
                  {/* Backdrop blur */}
                  <span className="absolute -inset-2 bg-indigo-500/5 blur-lg rounded-full opacity-0 sm:opacity-100"></span>
                  
                  {/* The Gradient Text with Shine Animation */}
                  <span className="relative pb-1 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-500 to-indigo-600 bg-[length:200%_auto] animate-text-shine">
                    Defects Instantly
                  </span>

                  {/* Star Sparkle */}
                  <svg className="absolute -top-4 -right-6 sm:-top-5 sm:-right-8 w-6 h-6 sm:w-10 sm:h-10 text-amber-400 opacity-0 sm:opacity-100 animate-pulse drop-shadow-sm" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
                  </svg>
              </span>
            </h1>
        </div>
        
        {/* --- SUBTEXT --- */}
        <p className="text-sm sm:text-lg text-slate-500 mb-10 sm:mb-16 max-w-2xl mx-auto leading-relaxed font-medium animate-fade-in-up delay-200 px-4">
          Upload a photo of any <span className="text-slate-900 font-bold decoration-indigo-300 underline decoration-2 underline-offset-4">structural issue</span>. Our AI analyzes severity, cause, and repair costs against Australian Standards.
        </p>

        {/* --- UPLOAD COMPONENT --- */}
        <div className="w-full max-w-2xl mx-auto animate-fade-in-up delay-300 mb-12 sm:mb-20 relative z-20 px-2">
            {/* Glow behind the card */}
            <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-indigo-500/10 rounded-[3rem] blur-3xl opacity-0 sm:opacity-100 transition-opacity duration-1000 animate-pulse"></div>
            <ImageUpload onImageSelected={onImageSelected} isLoading={isLoading} />
        </div>

        {/* --- SOCIAL PROOF (Fully Rounded Pills) --- */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 animate-fade-in-up delay-500 w-full px-4 relative z-20 pb-10">
            {/* Pill 1 */}
            <div className="flex items-center gap-4 bg-white/80 backdrop-blur-md px-6 py-3 rounded-full border border-slate-200/60 shadow-sm hover:shadow-md transition-all cursor-default group w-full sm:w-auto justify-center sm:justify-start">
                <div className="flex -space-x-3 shrink-0">
                    <img src="https://i.pravatar.cc/100?img=33" alt="U" className="w-8 h-8 rounded-full border-2 border-white shadow-sm grayscale group-hover:grayscale-0 transition-all" />
                    <img src="https://i.pravatar.cc/100?img=47" alt="U" className="w-8 h-8 rounded-full border-2 border-white shadow-sm grayscale group-hover:grayscale-0 transition-all" />
                    <img src="https://i.pravatar.cc/100?img=12" alt="U" className="w-8 h-8 rounded-full border-2 border-white shadow-sm grayscale group-hover:grayscale-0 transition-all" />
                </div>
                <div className="flex flex-col items-start leading-none">
                    <span className="text-sm font-bold text-slate-900">2,400+ Reports</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Generated this week</span>
                </div>
            </div>

            {/* Pill 2 */}
            <div className="flex items-center gap-3 bg-white/80 backdrop-blur-md px-6 py-3 rounded-full border border-slate-200/60 shadow-sm hover:shadow-md transition-all cursor-default group w-full sm:w-auto justify-center sm:justify-start">
                 <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100 shrink-0">
                    <Award className="w-4 h-4" />
                </div>
                <div className="flex flex-col items-start leading-none">
                    <span className="text-sm font-bold text-slate-900">98.5% Precision</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">NCC 2025 Logic Core</span>
                </div>
            </div>
        </div>

    </div>
    </div>
  );
};