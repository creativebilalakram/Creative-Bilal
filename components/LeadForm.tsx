import React, { useState } from 'react';
import { Lock, ArrowRight, Loader2, ShieldCheck } from 'lucide-react';
import { LeadProfile } from '../types';

interface LeadFormProps {
  onSubmit: (lead: LeadProfile) => void;
}

export const LeadForm: React.FC<LeadFormProps> = ({ onSubmit }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<LeadProfile>({
    name: '',
    email: '',
    phone: '',
    suburb: '',
    propertyType: 'House',
    urgency: 'Within 2 weeks',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // --- GOOGLE SHEETS CONFIGURATION ---
    const GOOGLE_APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzvptjS-lTi-jNN1cEoW6JShdoN2sOS0akJhKaSPTpW--n7x1yCB9MHoHoYQHJGfRax/exec"; 

    try {
        if (GOOGLE_APPS_SCRIPT_URL) {
            // FIX: Using URLSearchParams is much more reliable for Google Scripts
            // than JSON body when using no-cors.
            const params = new URLSearchParams();
            params.append('name', formData.name);
            params.append('email', formData.email);
            params.append('phone', formData.phone);
            params.append('suburb', formData.suburb);
            params.append('propertyType', formData.propertyType);
            params.append('urgency', formData.urgency);
            params.append('created_at', new Date().toISOString());

            await fetch(GOOGLE_APPS_SCRIPT_URL, {
                method: "POST",
                mode: "no-cors", 
                headers: { 
                    "Content-Type": "application/x-www-form-urlencoded" 
                },
                body: params.toString()
            });
        } else {
            await new Promise(resolve => setTimeout(resolve, 800));
        }

        // --- SAVE TO LOCAL STORAGE (Immediate Fix) ---
        localStorage.setItem('ausbuild_user_profile', JSON.stringify(formData));
        
        console.log("Lead captured & saved:", formData);
        onSubmit(formData);

    } catch (err) {
        console.error("Submission failed", err);
        // Fail-safe: user can still see report if api fails
        onSubmit(formData);
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden w-full max-w-lg mx-auto relative z-30 transform -translate-y-4 mx-3 sm:mx-auto">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-5 sm:px-8 sm:py-6 text-white flex flex-col gap-1">
          <div className="flex items-center gap-2 mb-1">
             <div className="p-1.5 bg-white/10 rounded-lg shrink-0">
                <Lock className="w-4 h-4 text-blue-400" />
             </div>
             <h3 className="font-bold text-base sm:text-lg tracking-tight leading-tight">Unlock Professional Report</h3>
          </div>
          <p className="text-slate-400 text-[10px] sm:text-xs pl-9 leading-relaxed">
            Get your comprehensive defect analysis, severity score, and repair guide instantly.
          </p>
      </div>

      <form onSubmit={handleSubmit} className="p-5 sm:p-8 space-y-4 sm:space-y-5">
        
        {/* Row 1: Name & Phone - Stacks on mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">Full Name</label>
            <input 
              required
              name="name"
              type="text"
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-slate-50/50 text-slate-900 text-sm font-medium placeholder:text-slate-400"
              placeholder="e.g. John Doe"
              onChange={handleChange}
            />
          </div>
          <div className="space-y-1.5">
             <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">Phone</label>
            <input 
              required
              name="phone"
              type="tel"
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-slate-50/50 text-slate-900 text-sm font-medium placeholder:text-slate-400"
              placeholder="0400 000 000"
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Row 2: Email */}
        <div className="space-y-1.5">
           <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
            <input 
              required
              name="email"
              type="email"
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-slate-50/50 text-slate-900 text-sm font-medium placeholder:text-slate-400"
              placeholder="john@example.com"
              onChange={handleChange}
            />
        </div>

        {/* Row 3: Suburb & Type - Stacks on mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
           <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">Suburb</label>
            <input 
              required
              name="suburb"
              type="text"
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-slate-50/50 text-slate-900 text-sm font-medium placeholder:text-slate-400"
              placeholder="e.g. Bondi"
              onChange={handleChange}
            />
           </div>
           <div className="space-y-1.5">
             <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">Property Type</label>
             <div className="relative">
                <select 
                  name="propertyType"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50/50 text-slate-900 text-sm font-medium appearance-none cursor-pointer"
                  onChange={handleChange}
                >
                  <option>House</option>
                  <option>Unit/Apartment</option>
                  <option>Townhouse</option>
                  <option>Commercial</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
             </div>
           </div>
        </div>

        {/* Row 4: Urgency */}
        <div className="space-y-1.5">
             <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">Urgency Level</label>
             <div className="relative">
                 <select 
                   name="urgency"
                   className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50/50 text-slate-900 text-sm font-medium appearance-none cursor-pointer"
                   onChange={handleChange}
                 >
                   <option>Standard (Within 2 weeks)</option>
                   <option>High (Need Help ASAP)</option>
                   <option>Low (Just Monitoring)</option>
                 </select>
                 <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
             </div>
        </div>

        <button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full mt-2 sm:mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 sm:py-4 rounded-xl shadow-xl shadow-blue-600/20 hover:shadow-blue-600/30 transition-all flex items-center justify-center group disabled:bg-blue-400 disabled:cursor-not-allowed transform hover:-translate-y-0.5 active:translate-y-0 text-sm sm:text-base"
        >
          {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
              <>
                Unlock Full Report 
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </>
          )}
        </button>
        
        <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 mt-2">
          <ShieldCheck className="w-3 h-3 text-slate-300" />
          <span>Your data is secure & encrypted.</span>
        </div>
      </form>
    </div>
  );
};