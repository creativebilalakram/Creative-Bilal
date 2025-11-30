import React from 'react';
import { CheckCircle2, Star, ShieldCheck } from 'lucide-react';
import { ImageUpload } from './ImageUpload';

interface HeroProps {
  onImageSelected: (file: File) => void;
  isLoading: boolean;
}

export const Hero: React.FC<HeroProps> = ({ onImageSelected, isLoading }) => {
  return (
    <div className="relative pt-8 pb-12 md:pt-20 md:pb-24 overflow-hidden">
      
      {/* Hero Content */}
      <div className="relative w-full max-w-[1400px] mx-auto px-4 sm:px-6 flex flex-col items-center text-center z-10">
        
        {/* Top Trust Badge */}
        <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-md border border-slate-200/60 rounded-full px-3 py-1.5 sm:px-4 shadow-sm mb-6 sm:mb-8 animate-fade-in-up hover:shadow-md transition-shadow cursor-default">
          <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" />
          <span className="text-[10px] sm:text-xs font-bold text-slate-700 tracking-wide">
            Trusted by 1,200+ Homeowners
          </span>
          <span className="text-slate-300 text-[10px]">|</span>
          <span className="text-[10px] sm:text-xs font-medium text-slate-500">Updated Daily</span>
        </div>

        {/* Headline - Responsive Text Size */}
        <h1 className="text-4xl sm:text-5xl md:text-5xl lg:text-7xl font-black tracking-tight text-slate-900 mb-4 sm:mb-6 w-full animate-fade-in-up delay-100 leading-[1.1] whitespace-normal lg:whitespace-nowrap px-2">
          Instant AI Building <span className="text-blue-600 block sm:inline">Defect Scan</span>
        </h1>
        
        <p className="text-base sm:text-lg text-slate-500 mb-8 sm:mb-10 max-w-3xl mx-auto leading-relaxed font-medium animate-fade-in-up delay-200 px-4">
          Upload a photo of a crack, leak, or wall. Our AI—trained on Australian standards—gives you a preliminary assessment in seconds.
        </p>

        {/* Upload Container */}
        <div className="w-full max-w-2xl mx-auto animate-fade-in-up delay-300 mb-10 sm:mb-12 relative z-20">
            {/* Soft Glow behind card */}
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-100 to-indigo-50 rounded-[2.5rem] blur-xl opacity-70 pointer-events-none"></div>
            <ImageUpload onImageSelected={onImageSelected} isLoading={isLoading} />
        </div>

        {/* Bottom Trust/Rating Pills - Fixed: Male Avatars & Removed Hover Effect */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-8 animate-fade-in-up delay-500 w-full px-4">
            
            {/* Rating Pill */}
            <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-full px-2 pl-2 py-2 pr-6 shadow-sm flex items-center gap-3 w-full sm:w-auto justify-center sm:justify-start">
                <div className="flex -space-x-2">
                    <div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white overflow-hidden">
                        <img src="https://i.pravatar.cc/100?img=11" alt="User" className="w-full h-full object-cover" />
                    </div>
                    <div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white overflow-hidden">
                        <img src="https://i.pravatar.cc/100?img=59" alt="User" className="w-full h-full object-cover" />
                    </div>
                    <div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white overflow-hidden">
                        <img src="https://i.pravatar.cc/100?img=68" alt="User" className="w-full h-full object-cover" />
                    </div>
                    <div className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-500">
                        2k
                    </div>
                </div>
                <div className="flex flex-col items-start">
                    <div className="flex text-yellow-400">
                        <Star className="w-3 h-3 fill-current" />
                        <Star className="w-3 h-3 fill-current" />
                        <Star className="w-3 h-3 fill-current" />
                        <Star className="w-3 h-3 fill-current" />
                        <Star className="w-3 h-3 fill-current" />
                    </div>
                    <span className="text-xs font-bold text-slate-700">4.9/5 Average Rating</span>
                </div>
            </div>

            {/* Guarantee Pill */}
            <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-full px-5 py-3 shadow-sm flex items-center justify-center gap-2 w-full sm:w-auto">
                <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                <span className="text-xs font-bold text-slate-600">Preliminary Scan Free • No Credit Card</span>
            </div>

        </div>

      </div>
    </div>
  );
};