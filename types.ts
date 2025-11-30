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
}

export interface LoadingState {
  status: 'idle' | 'uploading' | 'analyzing' | 'success' | 'error';
  message?: string;
}
