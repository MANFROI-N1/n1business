
import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
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
    console.error("Uncaught error:", error, errorInfo);
  }
  
  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      return (
        <div className="w-full min-h-[200px] flex flex-col items-center justify-center p-6 rounded-lg border border-red-200 bg-red-50 text-red-900">
          <AlertTriangle className="h-12 w-12 mb-4 text-red-500" />
          <h2 className="text-lg font-semibold mb-2">Algo deu errado</h2>
          <p className="text-sm text-center mb-4">
            Ocorreu um erro ao carregar este componente.
          </p>
          <Button 
            variant="outline"
            onClick={() => window.location.reload()}
          >
            Tentar novamente
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) {
  return function WithErrorBoundary(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}
