import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  fetchAllWhatsAppTemplates,
  WhatsAppTemplateData
} from "@/hooks/instancias/supabase-operations";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from "@/components/ui/pagination";

export function TemplatesList({ 
  searchTerm = "", 
  filter = "todos", 
  customDate,
  refreshTrigger = 0
}: { 
  searchTerm?: string; 
  filter?: string;
  customDate?: Date;
  refreshTrigger?: number;
}) {
  const [templates, setTemplates] = useState<WhatsAppTemplateData[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<WhatsAppTemplateData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;
  const { toast } = useToast();
  const { user } = useAuth();

  // Carregar templates
  useEffect(() => {
    const loadTemplates = async () => {
      setIsLoading(true);
      try {
        const data = await fetchAllWhatsAppTemplates();
        setTemplates(data);
      } catch (err) {
        console.error("Erro ao carregar templates:", err);
        setError("Não foi possível carregar os templates");
        toast({
          title: "Erro",
          description: "Não foi possível carregar os templates",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadTemplates();
  }, [refreshTrigger, toast]);

  // Filtrar templates
  useEffect(() => {
    let filtered = [...templates];
    
    // Aplicar filtro por status
    if (filter !== "todos") {
      filtered = filtered.filter(template => template.statusTp === filter);
    }
    
    // Aplicar busca por termo
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(template => 
        template.NomeAppGup?.toLowerCase().includes(term) ||
        template.textTp?.toLowerCase().includes(term) ||
        template.textTp1?.toLowerCase().includes(term) ||
        template.textTp2?.toLowerCase().includes(term)
      );
    }
    
    // Aplicar filtro por data
    if (customDate) {
      const dateString = format(customDate, 'dd/MM/yyyy', { locale: ptBR });
      filtered = filtered.filter(template => 
        template.DataConjunto.includes(dateString)
      );
    }
    
    setFilteredTemplates(filtered);
    setPage(1); // Resetar para a primeira página
  }, [templates, filter, searchTerm, customDate]);

  // Calcular páginas
  const totalPages = Math.ceil(filteredTemplates.length / itemsPerPage);
  const currentItems = filteredTemplates.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  // Gerar números de página
  const generatePageNumbers = () => {
    let startPage = Math.max(1, page - 2);
    let endPage = Math.min(totalPages, startPage + 4);
    
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
  
  // Função para navegar para uma página específica
  const goToPage = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setPage(pageNumber);
    }
  };

  // Renderizar status com badge
  const renderStatus = (status: string) => {
    switch (status) {
      case 'ativo':
        return <Badge className="bg-green-500">Ativo</Badge>;
      case 'inativo':
        return <Badge className="bg-yellow-500">Inativo</Badge>;
      case 'pendente':
        return <Badge className="bg-blue-500">Pendente</Badge>;
      default:
        return <Badge className="bg-gray-500">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-500">{error}</p>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={() => window.location.reload()}
        >
          Tentar novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Template 1</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Data</TableHead>
              <TableHead className="text-right">ID</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentItems.length > 0 ? (
              currentItems.map((template) => (
                <TableRow key={template.idconjunto}>
                  <TableCell className="font-medium">
                    {template.NomeAppGup || `Template ${template.idconjunto?.substring(0, 8) || "Sem ID"}`}
                  </TableCell>
                  <TableCell>
                    {template.textTp ? 
                      (template.textTp.length > 30 ? 
                        `${template.textTp.substring(0, 30)}...` : 
                        template.textTp) : 
                      "Sem conteúdo"}
                  </TableCell>
                  <TableCell>Texto</TableCell>
                  <TableCell>
                    {renderStatus(template.statusTp || 'inativo')}
                  </TableCell>
                  <TableCell>
                    {template.DataConjunto || format(new Date(), 'dd/MM/yyyy', { locale: ptBR })}
                  </TableCell>
                  <TableCell className="text-right">
                    {template.idconjunto}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6">
                  Nenhum template encontrado
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {filteredTemplates.length > 0 && (
        <div className="flex flex-col items-center space-y-1 mt-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => goToPage(page - 1)}
                  className={page === 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>

              {/* Exibir "..." se não estivermos na primeira página ou próxima a ela */}
              {pageNumbers[0] > 1 && (
                <>
                  <PaginationItem>
                    <PaginationLink onClick={() => goToPage(1)}>1</PaginationLink>
                  </PaginationItem>
                  {pageNumbers[0] > 2 && (
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )}
                </>
              )}

              {/* Exibir os números de página */}
              {pageNumbers.map(pageNum => (
                <PaginationItem key={pageNum}>
                  <PaginationLink 
                    isActive={page === pageNum} 
                    onClick={() => goToPage(pageNum)}
                  >
                    {pageNum}
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
                    <PaginationLink onClick={() => goToPage(totalPages)}>
                      {totalPages}
                    </PaginationLink>
                  </PaginationItem>
                </>
              )}

              <PaginationItem>
                <PaginationNext 
                  onClick={() => goToPage(page + 1)}
                  className={page === totalPages ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
          
          <div className="text-sm text-muted-foreground">
            Mostrando {(page - 1) * itemsPerPage + 1} a {Math.min(page * itemsPerPage, filteredTemplates.length)} de {filteredTemplates.length} templates
          </div>
        </div>
      )}
    </div>
  );
}
