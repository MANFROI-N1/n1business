
import { GupTpData } from "@/types/instancia";
import { useBreakpoint } from "@/hooks/use-mobile";

export function filterInstancias(data: GupTpData[] | undefined, searchTerm: string) {
  if (!data) return [];
  if (!searchTerm) return data;
  
  const searchLower = searchTerm.toLowerCase();
  
  return data.filter(item => {
    const instanciaMatch = item.Instancia ? item.Instancia.toLowerCase().includes(searchLower) : false;
    const nomeMatch = item.NomeAppGup ? item.NomeAppGup.toLowerCase().includes(searchLower) : false;
    
    return instanciaMatch || nomeMatch;
  });
}

export function paginateData(data: GupTpData[], currentPage: number, itemsPerPage: number) {
  // Verificar se os dados existem
  if (!data || data.length === 0) {
    return [];
  }
  
  // Garantir que a paginação não ultrapasse o tamanho do array
  const startIndex = Math.min((currentPage - 1) * itemsPerPage, data.length - 1);
  const endIndex = Math.min(startIndex + itemsPerPage, data.length);
  
  return data.slice(startIndex, endIndex);
}

export function calculateTotalPages(dataLength: number, itemsPerPage: number) {
  if (dataLength === 0) return 1;
  return Math.max(1, Math.ceil(dataLength / itemsPerPage));
}

// Função auxiliar para determinar o número de itens por página com base no tamanho da tela
export function getItemsPerPage() {
  const { isMobile, isTablet } = useBreakpoint();
  
  if (isMobile) {
    return 6; // Menos itens em telas móveis
  } else if (isTablet) {
    return 9; // Quantidade média em tablets
  } else {
    return 12; // Mais itens em desktops
  }
}
