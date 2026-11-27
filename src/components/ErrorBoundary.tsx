import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error.message || 'An unexpected rendering error occurred.',
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    if (import.meta.env.DEV) {
      console.error('BreatheWise render error:', error, info.componentStack);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white border border-red-200 rounded-2xl p-6 shadow-sm text-center">
            <h1 className="text-lg font-bold text-slate-900">Something went wrong</h1>
            <p className="text-sm text-slate-600 mt-2">{this.state.errorMessage}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 rounded-xl bg-forest-800 text-white text-sm font-medium hover:bg-forest-900"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
