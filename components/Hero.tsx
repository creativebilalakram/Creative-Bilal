import React from 'react';
import { CheckCircle2, Star, ShieldCheck } from 'lucide-react';
import { ImageUpload } from './ImageUpload';

interface HeroProps {
  onImageSelected: (file: File) => void;
  isLoading: boolean;
}

export const Hero: React.FC<HeroProps> = ({ onImageSelected, isLoading }) => {
  return (
    <div className="relative pt-8 pb-10 sm:pt-12 sm:pb-16 md:pt-24 md:pb-32 overflow-hidden w-full">
      
      {/* Hero Content */}
      <div className="relative w-full max-w-[1400px] mx-auto px-3 sm:px-6 flex flex-col items-center text-center z-10">
        
        {/* Top Trust Badge */}
        <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-md border border-slate-200/60 rounded-full px-3 py-1 sm:px-4 sm:py-1.5 shadow-sm mb-6 sm:mb-10 animate-fade-in-up cursor-default hover:border-blue-200 transition-colors duration-300">
          <ShieldCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-600" />
          <span className="text-[9px] sm:text-xs font-bold text-slate-600 tracking-wide uppercase">
            Trusted by 1,200+ Aussies
          </span>
        </div>

        {/* Headline - Pro Level Typography */}
        {/* Adjusted sizes: text-3xl (30px) on mobile ensures "Instant AI Building" fits on one line. */}
        {/* Forced <br> ensures strict 2-row layout: Row 1 "Instant AI Building", Row 2 "Defect Scan" */}
        <h1 className="text-[2rem] xs:text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter text-slate-900 mb-4 sm:mb-8 w-full animate-fade-in-up delay-100 leading-[1.1] sm:leading-[1] px-1 drop-shadow-sm">
          Instant AI Building <br className="block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 pb-1 tracking-tight">Defect Scan</span>
        </h1>
        
        {/* Subtext - Optimized Size */}
        <p className="text-[13px] xs:text-sm sm:text-xl text-slate-500 mb-8 sm:mb-14 max-w-xl sm:max-w-2xl mx-auto leading-relaxed font-medium animate-fade-in-up delay-200 px-4 sm:px-4">
          Upload a photo of a crack, leak, or wall. Get a <span className="text-slate-900 font-bold">free preliminary assessment</span> matching Australian standards in seconds.
        </p>

        {/* Upload Container - The Hero Element */}
        <div className="w-full max-w-2xl mx-auto animate-fade-in-up delay-300 mb-10 sm:mb-16 relative z-20 px-0 sm:px-0">
            {/* The "Killer" ImageUpload Card will go here */}
            <ImageUpload onImageSelected={onImageSelected} isLoading={isLoading} />
        </div>

        {/* Bottom Trust/Rating Pills */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 animate-fade-in-up delay-500 w-full px-4 sm:px-4">
            
            {/* Rating Pill */}
            <div className="group bg-white/60 backdrop-blur-md border border-white/50 rounded-xl sm:rounded-2xl px-4 py-2.5 sm:px-5 sm:py-3 shadow-sm flex items-center gap-3 w-full sm:w-auto justify-center sm:justify-start hover:shadow-md transition-all duration-300">
                <div className="flex -space-x-2 sm:-space-x-3">
                    <img src="https://i.pravatar.cc/100?img=11" alt="User" className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 border-white shadow-sm" />
                    <img src="https://i.pravatar.cc/100?img=59" alt="User" className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 border-white shadow-sm" />
                    <img src="https://i.pravatar.cc/100?img=68" alt="User" className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 border-white shadow-sm" />
                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[8px] sm:text-[10px] font-bold text-slate-600 shadow-sm">
                        2k+
                    </div>
                </div>
                <div className="flex flex-col items-start">
                    <div className="flex text-amber-400 gap-0.5">
                        {[1,2,3,4,5].map(i => <Star key={i} className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-current" />)}
                    </div>
                    <span className="text-[10px] sm:text-xs font-bold text-slate-600 group-hover:text-slate-900 transition-colors">4.9/5 from Homeowners</span>
                </div>
            </div>

            {/* Guarantee Pill */}
            <div className="group bg-white/60 backdrop-blur-md border border-white/50 rounded-xl sm:rounded-2xl px-4 py-2.5 sm:px-6 sm:py-4 shadow-sm flex items-center justify-center gap-2 w-full sm:w-auto hover:shadow-md transition-all duration-300">
                <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500 shrink-0 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] sm:text-xs font-bold text-slate-700">No Credit Card Required</span>
            </div>

        </div>

      </div>
    </div>
  );
};