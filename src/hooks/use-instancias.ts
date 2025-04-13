
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { NewInstanceFormData } from "@/types/instancia";
import { fetchInstancias, addInstancia, deleteInstancia } from "./instancias/supabase-operations";
import { filterInstancias, paginateData, calculateTotalPages } from "./instancias/data-operations";

export function useInstancias() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newInstance, setNewInstance] = useState<NewInstanceFormData>({
    nome: "",
    instancia: "",
    day: "",
    periodo: "",
    quantidade: "",
    token: "",
    status: "true",
  });
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['guptp'],
    queryFn: fetchInstancias,
    staleTime: 30000,
    refetchOnWindowFocus: true
  });

  const filteredData = filterInstancias(data, searchTerm);
  const totalPages = calculateTotalPages(filteredData.length, itemsPerPage);
  const paginatedData = paginateData(filteredData, currentPage, itemsPerPage);

  const goToPage = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleNewInstance = async () => {
    try {
      if (!newInstance.nome || !newInstance.instancia) {
        toast({
          title: "Erro",
          description: "Por favor, preencha todos os campos obrigatórios.",
          variant: "destructive"
        });
        return;
      }

      await addInstancia(newInstance);

      toast({
        title: "Sucesso",
        description: "Instância adicionada com sucesso!",
      });

      setNewInstance({
        nome: "",
        instancia: "",
        day: "",
        periodo: "",
        quantidade: "",
        token: "",
        status: "true",
      });
      setIsAddDialogOpen(false);
      refetch();
    } catch (error: any) {
      console.error("Erro ao adicionar instância:", error);
      toast({
        title: "Erro",
        description: `Falha ao adicionar a instância: ${error.message || "Erro desconhecido"}`,
        variant: "destructive"
      });
    }
  };

  const handleDeleteInstance = async (id: number) => {
    try {
      await deleteInstancia(id);

      toast({
        title: "Sucesso",
        description: "Instância removida com sucesso!",
      });
      refetch();
    } catch (error: any) {
      console.error("Erro ao remover instância:", error);
      toast({
        title: "Erro",
        description: `Falha ao remover a instância: ${error.message || "Erro desconhecido"}`,
        variant: "destructive"
      });
    }
  };

  return {
    searchTerm,
    setSearchTerm,
    isAddDialogOpen,
    setIsAddDialogOpen,
    newInstance,
    setNewInstance,
    data,
    filteredData,
    paginatedData,
    currentPage,
    totalPages,
    goToPage,
    isLoading,
    isError,
    error,
    refetch,
    handleNewInstance,
    handleDeleteInstance
  };
}
