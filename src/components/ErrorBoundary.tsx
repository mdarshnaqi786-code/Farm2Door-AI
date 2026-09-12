import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';
import { safeStorage } from '../utils/safeStorage';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[BOOT] ErrorBoundary caught error:', error);
    console.error('[BOOT] ErrorBoundary componentStack:', errorInfo?.componentStack);
    console.error('[BOOT] ErrorBoundary full errorInfo:', errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    try {
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
    } catch {
      this.setState({ hasError: false, error: null, errorInfo: null });
    }
  };

  private handleClearStateAndReload = () => {
    try {
      safeStorage.removeItem('farm2door_user_session');
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
    } catch {
      this.setState({ hasError: false, error: null, errorInfo: null });
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4 font-sans">
          <div className="max-w-lg w-full bg-white rounded-2xl border border-stone-200 shadow-xl p-6 text-stone-800">
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center text-amber-700 mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h1 className="text-xl font-bold text-stone-900 mb-2 font-display">
              Farm2Door AI encountered an unexpected issue
            </h1>
            <p className="text-sm text-stone-600 mb-4">
              The application caught a rendering exception. You can recover immediately by reloading or clearing temporary preview state.
            </p>

            {this.state.error && (
              <div className="bg-stone-900 text-stone-100 p-3 rounded-lg text-xs font-mono mb-4 overflow-x-auto max-h-48 whitespace-pre-wrap">
                <div className="text-red-400 font-bold mb-1">
                  {this.state.error.name}: {this.state.error.message}
                </div>
                {this.state.error.stack && (
                  <div className="text-stone-400 opacity-80 text-[11px]">
                    {this.state.error.stack.split('\n').slice(0, 6).join('\n')}
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={this.handleReset}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm"
              >
                <RotateCcw className="w-4 h-4" />
                Reload Application
              </button>
              <button
                type="button"
                onClick={this.handleClearStateAndReload}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-sm font-medium transition-colors"
              >
                <Home className="w-4 h-4" />
                Reset Session & Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
