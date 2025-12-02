import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public handleReload = () => {
    window.location.reload();
  };

  public handleReset = () => {
     // Clear any potentially corrupted local storage
     try {
         localStorage.removeItem('ausbuild_user_profile');
     } catch(e) {}
     this.setState({ hasError: false, error: null });
     window.location.reload();
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center p-4 font-sans">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="bg-red-50 p-6 border-b border-red-100 flex justify-center">
               <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                 <AlertTriangle className="w-8 h-8 text-red-600" />
               </div>
            </div>
            
            <div className="p-8 text-center">
              <h2 className="text-xl font-bold text-slate-900 mb-2">System Encountered an Error</h2>
              <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                We encountered an unexpected issue while loading the application. This might be due to network connectivity or browser compatibility.
              </p>
              
              <div className="bg-slate-50 rounded-lg p-3 mb-6 text-left border border-slate-100 overflow-auto max-h-32">
                  <p className="text-[10px] font-mono text-slate-400 break-all">
                      {this.state.error?.message || "Unknown Error"}
                  </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={this.handleReload}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/10"
                  >
                    <RefreshCw className="w-4 h-4" /> Reload App
                  </button>
                  <button 
                    onClick={this.handleReset}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors"
                  >
                    <Home className="w-4 h-4" /> Reset Cache
                  </button>
              </div>
            </div>
            
            <div className="bg-slate-50 p-3 text-center border-t border-slate-100">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">AusBuild Inspect AI • Safe Mode</span>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}