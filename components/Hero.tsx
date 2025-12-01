import React from 'react';
import { CheckCircle2, Star, ShieldCheck } from 'lucide-react';
import { ImageUpload } from './ImageUpload';

interface HeroProps {
  onImageSelected: (file: File) => void;
  isLoading: boolean;
}

export const Hero: React.FC<HeroProps> = ({ onImageSelected, isLoading }) => {
  return (
    <div className="relative pt-10 pb-12 sm:pt-12 sm:pb-16 md:pt-24 md:pb-32 overflow-hidden w-full">
      
      {/* Hero Content */}
      {/* PADDING UPDATE: px-3 for mobile */}
      <div className="relative w-full max-w-[1400px] mx-auto px-3 sm:px-6 flex flex-col items-center text-center z-10">
        
        {/* Top Trust Badge */}
        <div className="inline-flex items-center gap-2 bg-white/70 backdrop-blur-md border border-slate-200/60 rounded-full px-4 py-1.5 shadow-[0_4px_10px_rgba(0,0,0,0.03)] mb-8 sm:mb-10 animate-fade-in-up cursor-default hover:border-blue-200 transition-colors duration-300">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
          <span className="text-[10px] sm:text-xs font-bold text-slate-600 tracking-wide uppercase">
            Trusted by 1,200+ Aussies
          </span>
        </div>

        {/* Headline */}
        {/* FONT UPDATE: Smaller on mobile (4xl) to avoid breaking words */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter text-slate-900 mb-6 sm:mb-8 w-full animate-fade-in-up delay-100 leading-[1] px-1 drop-shadow-sm">
          Instant AI Building <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 pb-1">Defect Scan</span>
        </h1>
        
        <p className="text-base sm:text-xl text-slate-500 mb-10 sm:mb-14 max-w-2xl mx-auto leading-relaxed font-medium animate-fade-in-up delay-200 px-2 sm:px-4">
          Upload a photo of a crack, leak, or wall. Get a <span className="text-slate-900 font-bold">free preliminary assessment</span> matching Australian standards in seconds.
        </p>

        {/* Upload Container - The Hero Element */}
        {/* PADDING UPDATE: px-0 on mobile, wrapper handles it */}
        <div className="w-full max-w-2xl mx-auto animate-fade-in-up delay-300 mb-12 sm:mb-16 relative z-20 px-0 sm:px-0">
            {/* The "Killer" ImageUpload Card will go here */}
            <ImageUpload onImageSelected={onImageSelected} isLoading={isLoading} />
        </div>

        {/* Bottom Trust/Rating Pills */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 animate-fade-in-up delay-500 w-full px-2 sm:px-4">
            
            {/* Rating Pill */}
            <div className="group bg-white/60 backdrop-blur-md border border-white/50 rounded-2xl px-5 py-3 shadow-[0_8px_20px_-5px_rgba(0,0,0,0.05)] flex items-center gap-3 w-full sm:w-auto justify-center sm:justify-start hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
                <div className="flex -space-x-3">
                    <img src="https://i.pravatar.cc/100?img=11" alt="User" className="w-8 h-8 rounded-full border-2 border-white shadow-sm" />
                    <img src="https://i.pravatar.cc/100?img=59" alt="User" className="w-8 h-8 rounded-full border-2 border-white shadow-sm" />
                    <img src="https://i.pravatar.cc/100?img=68" alt="User" className="w-8 h-8 rounded-full border-2 border-white shadow-sm" />
                    <div className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-600 shadow-sm">
                        2k+
                    </div>
                </div>
                <div className="flex flex-col items-start">
                    <div className="flex text-amber-400 gap-0.5">
                        {[1,2,3,4,5].map(i => <Star key={i} className="w-3 h-3 fill-current" />)}
                    </div>
                    <span className="text-xs font-bold text-slate-600 group-hover:text-slate-900 transition-colors">4.9/5 from Homeowners</span>
                </div>
            </div>

            {/* Guarantee Pill */}
            <div className="group bg-white/60 backdrop-blur-md border border-white/50 rounded-2xl px-6 py-4 shadow-[0_8px_20px_-5px_rgba(0,0,0,0.05)] flex items-center justify-center gap-2 w-full sm:w-auto hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-slate-700">No Credit Card Required</span>
            </div>

        </div>

      </div>
    </div>
  );
};