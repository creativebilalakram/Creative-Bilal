import React, { useState } from 'react';
import { Lock, ArrowRight, Loader2, ShieldCheck } from 'lucide-react';
import { LeadProfile, AnalysisResult } from '../types';

// --- CONFIGURATION ---
// STEP 1: Deploy your Google Apps Script (Extensions > Apps Script)
// STEP 2: Copy the "Web App URL" from the deployment dialog
// STEP 3: Paste it below inside the quotes
const GOOGLE_APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzvptjS-lTi-jNN1cEoW6JShdoN2sOS0akJhKaSPTpW--n7x1yCB9MHoHoYQHJGfRax/exec"; 

