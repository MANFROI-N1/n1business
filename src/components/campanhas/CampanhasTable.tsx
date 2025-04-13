import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, Pause } from "lucide-react";
import { useState, useEffect } from "react";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from "@/components/ui/pagination";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { fetchCampanhas, updateCampanhaStatus } from "@/hooks/instancias/supabase-operations";
import { toast } from "@/components/ui/use-toast";

// Tipo para os dados de campanha
type Campanha = {
  id_campanha: string;
  nome_campanha: string;
  dataCriacao: string;
  status: 'pendente' | 'ativa' | 'pausada' | 'concluida';
  templateNome: string;
  templateId: string;
  totalMensagens: number;
  enviadas: number;
  dia?: string;
  periodo?: string;
};

type Props = {
  status: string;
  searchTerm: string;
  refreshTrigger?: number;
};

export default function CampanhasTable({ status, searchTerm, refreshTrigger = 0 }: Props) {
  const [page, setPage] = useState(1);
  const [filteredData, setFilteredData] = useState<Campanha[]>([]);
  const [campanhas, setCampanhas] = useState<Campanha[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const itemsPerPage = 5; // 5 itens por página
  
  // Buscar campanhas do Supabase
  const loadCampanhas = async () => {
    setIsLoading(true);
    try {
      const data = await fetchCampanhas();
      setCampanhas(data);
    } catch (error) {
      console.error("Erro ao carregar campanhas:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as campanhas",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Carregar campanhas ao montar o componente e quando o refreshTrigger mudar
  useEffect(() => {
    loadCampanhas();
  }, [refreshTrigger]);
  
  // Filtrar os dados com base no status e termo de busca
  useEffect(() => {
    let filtered = [...campanhas];
    
    // Filtrar por status
    if (status !== 'todas') {
      filtered = filtered.filter(campanha => 
        status === 'ativa' ? (campanha.status === 'ativa' || campanha.status === 'pausada') :
        campanha.status === status
      );
    }
    
    // Filtrar por termo de busca
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(campanha =>
        campanha.nome_campanha.toLowerCase().includes(term) ||
        campanha.templateNome?.toLowerCase().includes(term)
      );
    }
    
    setFilteredData(filtered);
    setPage(1); // Resetar para a primeira página ao mudar os filtros
  }, [status, searchTerm, campanhas]);

  // Calcular o total de páginas
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  
  // Obter os itens da página atual
  const currentItems = filteredData.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  // Função para gerar os números de página para exibição
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
  const totalItems = filteredData.length;

  // Renderizar o status com badge colorida
  const renderStatus = (status: string) => {
    switch (status) {
      case 'ativa':
        return <Badge className="bg-green-500">Ativa</Badge>;
      case 'pendente':
        return <Badge className="bg-blue-500">Pendente</Badge>;
      case 'concluida':
        return <Badge className="bg-gray-500">Concluída</Badge>;
      case 'pausada':
        return <Badge className="bg-yellow-500">Pausada</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Funções para ações
  const handlePlayPause = async (id: string, currentStatus: string) => {
    try {
      const novoStatus = currentStatus === 'pausada' || currentStatus === 'pendente' ? 'ativa' : 'pausada';
      const success = await updateCampanhaStatus(id, novoStatus);
      
      if (success) {
        // Atualizar a lista de campanhas
        await loadCampanhas();
        toast({
          title: "Sucesso",
          description: `Campanha ${novoStatus === 'ativa' ? 'iniciada' : 'pausada'} com sucesso`,
        });
      } else {
        toast({
          title: "Erro",
          description: "Não foi possível atualizar o status da campanha",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erro ao atualizar status da campanha:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao atualizar o status da campanha",
        variant: "destructive",
      });
    }
  };

  // Função para navegar para uma página específica
  const goToPage = (pageNumber: number) => {
    setPage(Math.max(1, Math.min(pageNumber, totalPages)));
  };

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome da Campanha</TableHead>
            <TableHead>Data de Criação</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Conjunto de Template</TableHead>
            <TableHead>Progresso</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-6">
                Carregando campanhas...
              </TableCell>
            </TableRow>
          ) : currentItems.length > 0 ? (
            currentItems.map((campanha) => (
              <TableRow key={campanha.id_campanha}>
                <TableCell className="font-medium py-3">{campanha.nome_campanha}</TableCell>
                <TableCell className="py-3">
                  {campanha.dataCriacao && !isNaN(Date.parse(campanha.dataCriacao)) 
                    ? new Date(campanha.dataCriacao).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    : 'Data inválida'}
                </TableCell>
                <TableCell className="py-3">{renderStatus(campanha.status)}</TableCell>
                <TableCell className="py-3">
                  {campanha.templateNome ? (
                    <div className="flex items-center">
                      <span className="text-sm font-medium">{campanha.templateNome}</span>
                      {campanha.templateId && (
                        <span className="ml-1 text-xs text-muted-foreground">
                          (ID: {campanha.templateId.substring(0, 8)})
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-muted-foreground">Sem template</span>
                  )}
                </TableCell>
                <TableCell className="py-3">
                  <div className="w-full">
                    <div className="flex justify-between text-xs mb-1">
                      <span>{campanha.enviadas || 0}</span>
                      <span>{campanha.totalMensagens || 0}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ 
                          width: `${campanha.totalMensagens ? Math.min(100, (campanha.enviadas / campanha.totalMensagens) * 100) : 0}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-right py-3">
                  <div className="flex justify-end gap-1">
                    {(campanha.status === 'ativa' || campanha.status === 'pausada' || campanha.status === 'pendente') && (
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handlePlayPause(campanha.id_campanha, campanha.status)}>
                        {campanha.status === 'pausada' || campanha.status === 'pendente' ? (
                          <Play className="h-4 w-4" />
                        ) : (
                          <Pause className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-6">
                Nenhuma campanha encontrada
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      
      {filteredData.length > 0 && (
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
            Mostrando {(page - 1) * itemsPerPage + 1} a {Math.min(page * itemsPerPage, totalItems)} de {totalItems} campanhas
          </div>
        </div>
      )}
    </div>
  );
}
