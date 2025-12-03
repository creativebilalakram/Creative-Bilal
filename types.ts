export interface DefectIssue {
  category: string;
  visualDescription: string;
  possibleCause: string;
  severity: 'Low' | 'Moderate' | 'High';
  urgency: 'Immediate' | 'Within 2 weeks' | 'Monitor';
  recommendation: string;
}

export interface AnalysisResult {
  summary: string;
  severityScore: number; // 0-100
  topCategories: string[];
  issues: DefectIssue[];
  nextSteps: string[];
  disclaimer: string;
}

export interface LeadProfile {
  name: string;
  email: string;
  phone: string;
  suburb: string;
  propertyType: string;
  urgency: string;
  
  // --- Pro Level Meta Data (Tech) ---
  userAgent?: string;       // Browser & OS info
  screenResolution?: string;// Device screen size
  language?: string;        // User's system language
  timezone?: string;        // User's local timezone
  referrer?: string;        // Where they came from
  platform?: string;        // OS Platform (Win, Mac, Android)

  // --- Personalized Targeting Data (Defect Context) ---
  severityScore?: number;    // e.g., 85 (High urgency lead)
  detectedDefects?: string;  // e.g., "Structural Cracks, Water Damage"
  analysisSummary?: string;  // Short AI summary of the problem
}

export interface LoadingState {
  status: 'idle' | 'uploading' | 'analyzing' | 'success' | 'error';
  message?: string;
}