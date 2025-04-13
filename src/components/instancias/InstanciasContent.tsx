
import React from "react";
import { Button } from "@/components/ui/button";
import { InstanciaCard } from "@/components/instancias/InstanciaCard";
import { InstanciasLoadingSkeleton } from "@/components/instancias/LoadingSkeleton";
import { ErrorDisplay } from "@/components/ui/error-display";
import { GupTpData } from "@/types/instancia";
import { AlertCircle, Loader2 } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface InstanciasContentProps {
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  filteredData?: GupTpData[];
  paginatedData?: GupTpData[];
  currentPage: number;
  totalPages: number;
  goToPage: (page: number) => void;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  refetch: () => void;
  onDelete: (id: number) => Promise<void>;
}

export const InstanciasContent: React.FC<InstanciasContentProps> = ({
  isLoading,
  isError,
  error,
  filteredData,
  paginatedData,
  currentPage,
  totalPages,
  goToPage,
  searchTerm,
  setSearchTerm,
  refetch,
  onDelete
}) => {
  
  if (isLoading) {
    return <InstanciasLoadingSkeleton />;
  }

  if (isError) {
    return (
      <ErrorDisplay
        title="Erro ao carregar instâncias"
        message={`Não foi possível carregar as instâncias. ${error instanceof Error ? error.message : 'Tente novamente mais tarde.'}`}
        onRetry={() => refetch()}
      />
    );
  }

  // Verificação explícita se os dados existem
  if (!filteredData) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="h-10 w-10 text-yellow-500 mx-auto mb-3" />
        <h3 className="text-base font-medium text-gray-900 mb-1">Aguardando dados...</h3>
        <p className="text-xs text-muted-foreground mb-3">
          Não foi possível obter os dados das instâncias.
        </p>
        <Button 
          variant="outline" 
          className="mt-1 text-xs py-1 px-2 h-7"
          onClick={() => refetch()}
        >
          <Loader2 className="mr-1 h-3 w-3 animate-spin" />
          Tentar novamente
        </Button>
      </div>
    );
  }

  if (filteredData.length === 0) {
    return (
      <div className="text-center py-8">
        <h3 className="text-base font-medium text-gray-900 mb-1">Nenhuma instância encontrada</h3>
        <p className="text-xs text-muted-foreground mb-3">
          {searchTerm 
            ? "Não encontramos instâncias correspondentes à sua pesquisa." 
            : "Você ainda não tem instâncias cadastradas."}
        </p>
        {searchTerm && (
          <Button
            variant="outline"
            className="mt-1 text-xs py-1 px-2 h-7"
            onClick={() => setSearchTerm("")}
          >
            Limpar pesquisa
          </Button>
        )}
        <Button
          variant="outline"
          className="mt-1 ml-2 text-xs py-1 px-2 h-7"
          onClick={() => refetch()}
        >
          Atualizar
        </Button>
      </div>
    );
  }

  // Função para gerar os números de página para exibição
  const generatePageNumbers = () => {
    // Sempre exibimos 5 páginas ou menos
    // Vamos determinar o intervalo de páginas a serem exibidas
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);
    
    // Ajustar para garantir que sempre mostramos 5 páginas quando possível
    if (endPage - startPage < 4 && totalPages > 4) {
      if (startPage === 1) {
        endPage = Math.min(5, totalPages);
      } else {
        startPage = Math.max(1, endPage - 4);
      }
    }
    
    return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
  };

  const pageNumbers = generatePageNumbers();
  const totalItems = filteredData.length;

  return (
    <div className="space-y-3 w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 w-full">
        {paginatedData && paginatedData.map((item) => (
          <InstanciaCard 
            key={item.id} 
            item={item} 
            onDelete={onDelete} 
          />
        ))}
      </div>
      
      {/* Paginação aprimorada com contagem total */}
      {totalPages > 1 && (
        <div className="flex flex-col items-center space-y-1 mt-3">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => goToPage(currentPage - 1)}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>

              {/* Exibir "..." se não estivermos na primeira página ou próxima a ela */}
              {pageNumbers[0] > 1 && (
                <>
                  <PaginationItem>
                    <PaginationLink 
                      onClick={() => goToPage(1)} 
                      className="h-7 w-7 text-xs"
                    >
                      1
                    </PaginationLink>
                  </PaginationItem>
                  {pageNumbers[0] > 2 && (
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )}
                </>
              )}

              {/* Exibir os números de página */}
              {pageNumbers.map(page => (
                <PaginationItem key={page}>
                  <PaginationLink 
                    isActive={currentPage === page} 
                    onClick={() => goToPage(page)}
                    className="h-7 w-7 text-xs"
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}

              {/* Exibir "..." se não estivermos na última página ou próxima a ela */}
              {pageNumbers[pageNumbers.length - 1] < totalPages && (
                <>
                  {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )}
                  <PaginationItem>
                    <PaginationLink 
                      onClick={() => goToPage(totalPages)}
                      className="h-7 w-7 text-xs"
                    >
                      {totalPages}
                    </PaginationLink>
                  </PaginationItem>
                </>
              )}

              <PaginationItem>
                <PaginationNext 
                  onClick={() => goToPage(currentPage + 1)}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
          
          {/* Contador de itens */}
          <div className="text-xs text-muted-foreground">
            Mostrando página {currentPage} de {totalPages} (Total: {totalItems} instâncias)
          </div>
        </div>
      )}
    </div>
  );
}
