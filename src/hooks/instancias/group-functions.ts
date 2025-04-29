import { supabase } from "@/lib/supabase";
import { GupTpData } from "@/types/instancia";

/**
 * Busca instâncias por grupo
 * @param grupo Número do grupo (1, 2, 3 ou 4)
 * @returns Lista de instâncias do grupo especificado
 */
export async function fetchInstanciasByGroup(grupo: string): Promise<any[]> {
  console.log(`Buscando instâncias do Grupo ${grupo}...`);
  
  try {
    // Buscar todas as instâncias do grupo, independente do status
    const { data, error } = await supabase
      .from('GupTp')
      .select('id, Instancia, Status, Grupo, NomeAppGup, appId, token')
      .eq('Grupo', grupo);
    
    if (error) {
      console.error(`Erro ao buscar instâncias do Grupo ${grupo}:`, error);
      return [];
    }
    
    if (!data || data.length === 0) {
      console.warn(`Nenhuma instância encontrada para o Grupo ${grupo}`);
      return [];
    }
    
    console.log(`Encontradas ${data.length} instâncias no Grupo ${grupo}:`, data);
    return data;
  } catch (error) {
    console.error(`Erro ao buscar instâncias do Grupo ${grupo}:`, error);
    return [];
  }
}

/**
 * Busca instâncias ativas da tabela GupTp
 * @param limit Número máximo de instâncias a serem retornadas
 * @returns Lista de instâncias ativas
 */
export async function fetchActiveInstances(limit: number = 100): Promise<GupTpData[]> {
  try {
    console.log(`Buscando até ${limit} instâncias ativas...`);
    
    // Verificar a estrutura da tabela GupTp
    const { data: tableInfo, error: tableError } = await supabase
      .from('GupTp')
      .select('*')
      .limit(1);
    
    if (tableError) {
      console.error("Erro ao verificar a tabela GupTp:", tableError);
    } else {
      console.log("Estrutura da tabela GupTp:", tableInfo && tableInfo.length > 0 ? Object.keys(tableInfo[0]) : []);
    }
    
    // Buscar instâncias ativas
    const { data, error } = await supabase
      .from('GupTp')
      .select('*')
      .eq('statusTp', 'Ativo')
      .limit(limit);
    
    if (error) {
      console.error("Erro ao buscar instâncias ativas:", error);
      throw error;
    }
    
    if (!data || data.length === 0) {
      console.log("Nenhuma instância ativa encontrada. Buscando todas as instâncias...");
      
      // Se não encontrar instâncias ativas, buscar todas as instâncias
      const { data: allData, error: allError } = await supabase
        .from('GupTp')
        .select('*')
        .limit(limit);
      
      if (allError) {
        console.error("Erro ao buscar todas as instâncias:", allError);
        throw allError;
      }
      
      console.log(`Encontradas ${allData?.length || 0} instâncias no total`);
      
      // Se ainda não encontrar instâncias, criar uma instância padrão
      if (!allData || allData.length === 0) {
        console.log("Nenhuma instância encontrada. Criando instância padrão...");
        
        return [{
          id: 1,
          Instancia: "instancia_padrao",
          NomeAppGup: "Instância Padrão",
          statusTp: "Ativo"
        }] as GupTpData[];
      }
      
      return allData as GupTpData[];
    }
    
    console.log(`Encontradas ${data?.length || 0} instâncias ativas`);
    
    return data as GupTpData[];
  } catch (error) {
    console.error("Erro ao buscar instâncias ativas:", error);
    
    // Em caso de erro, retornar uma instância padrão
    console.log("Retornando instância padrão devido a erro...");
    
    return [{
      id: 1,
      Instancia: "instancia_padrao",
      NomeAppGup: "Instância Padrão",
      statusTp: "Ativo"
    }] as GupTpData[];
  }
}
