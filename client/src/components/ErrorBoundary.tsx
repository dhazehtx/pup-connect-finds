import React, { Component, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { captureError } from '@/utils/sentry';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    if (import.meta.env.DEV) {
      console.error('[ERROR BOUNDARY]', error, errorInfo.componentStack);
    }
    captureError(error, {
      componentStack: errorInfo.componentStack,
      source: 'ErrorBoundary',
    });
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[200px] flex items-center justify-center p-6">
          <div className="text-center max-w-md">
            <AlertTriangle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Something went wrong
            </h3>
            <p className="text-gray-600 mb-4">
              Something broke while rendering this screen. You can reload, go home, or try again if you have not changed anything important.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <Button onClick={() => window.location.reload()} variant="outline">
                Refresh page
              </Button>
              <Button asChild variant="outline">
                <a href="/">Go home</a>
              </Button>
              <Button onClick={() => this.setState({ hasError: false, error: undefined })} variant="default">
                Try again
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;