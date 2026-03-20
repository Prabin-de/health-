
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

class ErrorBoundary extends Component<Props, State> {
  override state: State = { hasError: false, errorMessage: '' };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMessage: error.message };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[VitalShield ErrorBoundary]', error, info.componentStack);
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, errorMessage: '' });
  };

  override render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center">
          <div className="h-16 w-16 bg-rose-50 rounded-2xl flex items-center justify-center mb-6">
            <i className="fas fa-triangle-exclamation text-rose-500 text-2xl"></i>
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Something went wrong</h2>
          <p className="text-slate-500 text-sm max-w-md mb-8">
            An unexpected error occurred while rendering this section. Your health data is safe.
          </p>
          {this.state.errorMessage && (
            <pre className="mb-6 px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-500 max-w-lg w-full text-left overflow-auto">
              {this.state.errorMessage}
            </pre>
          )}
          <button
            onClick={this.handleRetry}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl transition-colors flex items-center gap-2"
          >
            <i className="fas fa-rotate-right"></i>
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
