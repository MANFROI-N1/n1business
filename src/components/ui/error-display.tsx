
import React from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorDisplayProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  title = "Erro ao carregar dados",
  message = "Ocorreu um erro ao carregar os dados. Por favor, tente novamente.",
  onRetry
}) => {
  return (
    <div className="w-full p-8 flex flex-col items-center justify-center text-center">
      <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-4">{message}</p>
      {onRetry && (
        <Button 
          variant="outline" 
          onClick={onRetry}
          className="mt-2"
        >
          Tentar novamente
        </Button>
      )}
    </div>
  );
};
