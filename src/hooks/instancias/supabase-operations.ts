import { supabase } from "@/lib/supabase";
import { GupTpData, NewInstanceFormData, WhatsAppTemplateData } from "@/types/instancia";
import { v4 as uuidv4 } from 'uuid';
import * as XLSX from 'xlsx';

/**
 * Envia um webhook para notificar sobre a criação de um template
 * @param data Dados a serem enviados no webhook
 * @returns true se o webhook foi enviado com sucesso, false caso contrário
 */
export async function sendTemplateWebhook(data: {
  template: string;
  idconjunto: string;
  nome: string;
  data: string;
  id: string;
}): Promise<boolean> {
  try {
    console.log("Enviando webhook com os dados:", data);
    
    // URL do webhook
    const webhookUrl = 'https://webhook.n1promotora.com.br/webhook/2eed000d-affb-4aa5-9259-d2038e55c114';
    
    // URL do proxy de webhook (para contornar problemas de CORS)
    // Em produção, isso apontará para a função serverless na Vercel
    // Em desenvolvimento, pode apontar para localhost se estiver rodando o servidor de desenvolvimento
    const isProduction = window.location.hostname !== 'localhost';
    const proxyUrl = isProduction 
      ? '/api/webhook-proxy' // Em produção, usa a rota relativa que será tratada pela Vercel
      : 'http://localhost:3000/api/webhook-proxy'; // Em desenvolvimento
    
    console.log(`Ambiente: ${isProduction ? 'Produção' : 'Desenvolvimento'}, usando URL: ${proxyUrl}`);
    
    // Simplificar os dados para enviar apenas "ativar"
    const formattedData = "ativar";
    
    console.log("Dados formatados para envio:", formattedData);
    
    // Armazenar webhooks pendentes no localStorage para garantir que não sejam perdidos
    try {
      const pendingWebhooks = JSON.parse(localStorage.getItem('pendingWebhooks') || '[]');
      pendingWebhooks.push({
        data: formattedData,
        timestamp: new Date().toISOString(),
        attempts: 0
      });
      localStorage.setItem('pendingWebhooks', JSON.stringify(pendingWebhooks));
      console.log(`Webhook armazenado para sincronização. Total pendente: ${pendingWebhooks.length}`);
    } catch (storageError) {
      console.error("Erro ao armazenar webhook no localStorage:", storageError);
    }
    
    // Usar o proxy de webhook (abordagem principal)
    try {
      console.log("Enviando webhook via proxy:", proxyUrl);
      const proxyResponse = await fetch(proxyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: formattedData
      });
      
      // Obter a resposta do proxy
      const responseData = await proxyResponse.json().catch(e => {
        console.error("Erro ao analisar resposta do proxy:", e);
        return null;
      });
      
      console.log("Resposta do proxy:", responseData);
      
      // Verificar se o proxy reportou sucesso
      if (responseData && responseData.success) {
        console.log("Webhook enviado com sucesso via proxy:", responseData);
        
        // Registrar o webhook como enviado
        try {
          const sentWebhooks = JSON.parse(localStorage.getItem('sentWebhooks') || '[]');
          sentWebhooks.push({
            data: formattedData,
            timestamp: new Date().toISOString(),
            method: 'proxy',
            response: responseData
          });
          localStorage.setItem('sentWebhooks', JSON.stringify(sentWebhooks));
          
          // Remover dos pendentes
          const pendingWebhooks = JSON.parse(localStorage.getItem('pendingWebhooks') || '[]');
          const updatedPending = pendingWebhooks.filter(webhook => 
            webhook.data !== formattedData
          );
          localStorage.setItem('pendingWebhooks', JSON.stringify(updatedPending));
        } catch (storageError) {
          console.error("Erro ao atualizar webhooks no localStorage:", storageError);
        }
        
        return true;
      } else {
        // Mesmo que o proxy reporte falha, vamos verificar se a mensagem indica sucesso
        const responseMessage = responseData?.data || responseData?.message || '';
        if (typeof responseMessage === 'string' && responseMessage.includes('Workflow was started')) {
          console.log("Webhook processado com sucesso apesar do status de erro");
          
          // Registrar o webhook como enviado
          try {
            const sentWebhooks = JSON.parse(localStorage.getItem('sentWebhooks') || '[]');
            sentWebhooks.push({
              data: formattedData,
              timestamp: new Date().toISOString(),
              method: 'proxy-partial-success',
              response: responseData
            });
            localStorage.setItem('sentWebhooks', JSON.stringify(sentWebhooks));
          } catch (storageError) {
            console.error("Erro ao registrar webhook enviado no localStorage:", storageError);
          }
          
          return true;
        }
        
        console.warn("Proxy retornou erro:", responseData);
        throw new Error(`Proxy retornou erro: ${JSON.stringify(responseData)}`);
      }
    } catch (proxyError) {
      console.error("Erro ao usar proxy de webhook:", proxyError);
      // Continuar com as próximas abordagens
    }
    
    // Abordagem 2: Tentar enviar diretamente para o webhook
    try {
      console.log("Tentativa 2: Enviando diretamente para o webhook");
      const directResponse = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: formattedData,
        mode: 'no-cors' // Isso permite o envio, mas não permite verificar a resposta
      });
      
      console.log("Webhook possivelmente enviado diretamente (resposta opaca devido a no-cors)");
      
      // Como estamos usando no-cors, não podemos verificar o status da resposta
      // Vamos assumir que foi bem-sucedido, mas manter o webhook nos pendentes por precaução
      try {
        const sentWebhooks = JSON.parse(localStorage.getItem('sentWebhooks') || '[]');
        sentWebhooks.push({
          data: formattedData,
          timestamp: new Date().toISOString(),
          method: 'direct-nocors'
        });
        localStorage.setItem('sentWebhooks', JSON.stringify(sentWebhooks));
      } catch (storageError) {
        console.error("Erro ao registrar webhook enviado no localStorage:", storageError);
      }
      
      return true;
    } catch (directError) {
      console.error("Erro ao enviar webhook diretamente:", directError);
    }
    
    console.warn("Todas as tentativas de envio de webhook falharam");
    return false;
  } catch (error) {
    console.error("Erro ao enviar webhook:", error);
    
    // Registrar o webhook como pendente para tentativas futuras
    try {
      console.log("Webhook salvo para sincronização posterior após erro crítico");
      const pendingWebhooks = JSON.parse(localStorage.getItem('pendingWebhooks') || '[]');
      
      // Garantir que os dados estejam no formato correto
      const formattedData = "ativar";
      
      // Verificar se já existe um webhook pendente com o mesmo idconjunto
      const existingIndex = pendingWebhooks.findIndex(webhook => 
        webhook.data === formattedData
      );
      
      if (existingIndex >= 0) {
        // Atualizar o webhook existente
        pendingWebhooks[existingIndex].attempts = (pendingWebhooks[existingIndex].attempts || 0) + 1;
        pendingWebhooks[existingIndex].lastAttempt = new Date().toISOString();
      } else {
        // Adicionar novo webhook pendente
        pendingWebhooks.push({
          data: formattedData,
          timestamp: new Date().toISOString(),
          attempts: 1,
          lastError: error.message
        });
      }
      
      localStorage.setItem('pendingWebhooks', JSON.stringify(pendingWebhooks));
      console.log(`Total de webhooks pendentes: ${pendingWebhooks.length}`);
    } catch (storageError) {
      console.error("Erro ao armazenar webhook no localStorage:", storageError);
    }
    
    return false;
  }
}

/**
 * Tenta sincronizar webhooks pendentes que foram salvos localmente
 * Esta função pode ser chamada periodicamente ou quando o usuário retornar online
 */
export async function syncPendingWebhooks(): Promise<{success: number, failed: number}> {
  try {
    const pendingWebhooks = JSON.parse(localStorage.getItem('pendingWebhooks') || '[]');
    if (pendingWebhooks.length === 0) {
      return { success: 0, failed: 0 };
    }
    
    console.log(`Tentando sincronizar ${pendingWebhooks.length} webhooks pendentes...`);
    
    let success = 0;
    let failed = 0;
    const remaining = [];
    
    for (const webhook of pendingWebhooks) {
      try {
        const result = await sendTemplateWebhook(webhook.data);
        if (result) {
          success++;
        } else {
          failed++;
          // Manter na lista de pendentes apenas se falhou há menos de 24 horas
          const timestamp = new Date(webhook.timestamp);
          const now = new Date();
          const hoursDiff = (now.getTime() - timestamp.getTime()) / (1000 * 60 * 60);
          
          if (hoursDiff < 24) {
            remaining.push(webhook);
          }
        }
      } catch (e) {
        failed++;
        remaining.push(webhook);
      }
    }
    
    localStorage.setItem('pendingWebhooks', JSON.stringify(remaining));
    console.log(`Sincronização concluída: ${success} com sucesso, ${failed} falhas, ${remaining.length} pendentes`);
    
    return { success, failed };
  } catch (error) {
    console.error('Erro ao sincronizar webhooks pendentes:', error);
    return { success: 0, failed: 0 };
  }
}

/**
 * Interface para os dados de uma campanha
 */
export interface CampanhaData {
  name: string;
  blocks: string[][];
  totalNumbers?: number;
  fileName?: string;
  planilhaData: any[];
  dia?: string;
  periodo?: string;
  templateId?: string;
  templateNome?: string;
}

// Função para obter a data atual no formato brasileiro
function getCurrentBrazilianDate(): string {
  const now = new Date();
  return now.toLocaleDateString('pt-BR');
}

/**
 * Busca instâncias ativas da tabela GupTp
 * @param limit Número máximo de instâncias a serem retornadas
 * @returns Lista de instâncias ativas
 */
async function fetchActiveInstances(limit: number = 100): Promise<GupTpData[]> {
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

/**
 * Busca as campanhas do Supabase
 * @returns Lista de campanhas
 */
export async function fetchCampanhas(): Promise<any[]> {
  try {
    // Primeiro tentar buscar da tabela Campanhas (nova)
    const { data: campanhasNovas, error: errorNovas } = await supabase
      .from('Campanhas')
      .select('*')
      .order('dataCriacao', { ascending: false });
    
    if (!errorNovas && campanhasNovas && campanhasNovas.length > 0) {
      console.log('Campanhas encontradas na tabela Campanhas:', campanhasNovas.length);
      
      // Para cada campanha, buscar o total de contatos na tabela Disparador
      const campanhasComProgresso = await Promise.all(
        campanhasNovas.map(async (campanha) => {
          // Contar total de contatos da campanha
          const { count: totalContatos, error: errorTotal } = await supabase
            .from('Disparador')
            .select('*', { count: 'exact', head: true })
            .eq('id_campanha', campanha.id_campanha);

          // Contar contatos já enviados
          const { count: contatosEnviados, error: errorEnviados } = await supabase
            .from('Disparador')
            .select('*', { count: 'exact', head: true })
            .eq('id_campanha', campanha.id_campanha)
            .eq('Disparador', 'true');

          // Formatar a data de criação se for uma string válida
          let dataFormatada = campanha.dataCriacao;
          try {
            if (campanha.dataCriacao && !isNaN(Date.parse(campanha.dataCriacao))) {
              dataFormatada = new Date(campanha.dataCriacao).toISOString();
            }
          } catch (e) {
            console.warn('Erro ao formatar data:', e);
          }

          // Usar o total_contatos da tabela Campanhas se disponível, ou o valor contado da tabela Disparador
          const totalMensagens = campanha.total_contatos || totalContatos || 0;

          return {
            id_campanha: campanha.id_campanha,
            nome_campanha: campanha.nome_campanha,
            dataCriacao: dataFormatada,
            status: campanha.status,
            dia: campanha.Dia,
            periodo: campanha.Periodo,
            totalMensagens: totalMensagens,
            enviadas: contatosEnviados || 0,
            templateNome: campanha.nome_conjunto_template || "Sem template",
            templateId: campanha.id_conjunto_template || ""
          };
        })
      );
      
      return campanhasComProgresso;
    }
    
    // Se não encontrou na tabela Campanhas, tentar na tabela Disparador
    try {
      // Consulta para buscar campanhas únicas (agrupadas por id_campanha)
      const { data: campanhas, error } = await supabase
        .from('Disparador')
        .select('id_campanha, nome_campanha, dataCriacao, status')
        .order('dataCriacao', { ascending: false })
        .not('id_campanha', 'is', null); // Sintaxe correta para "is not null"
      
      if (error) {
        console.error('Erro ao buscar campanhas da tabela Disparador:', error);
        return [];
      }

      // Agrupar por id_campanha para evitar duplicatas
      const campanhasUnicas = campanhas.reduce((acc: any[], current: any) => {
        const x = acc.find(item => item.id_campanha === current.id_campanha);
        if (!x) {
          acc.push(current);
        }
        return acc;
      }, []);

      // Para cada campanha, buscar o progresso (total e enviados)
      const campanhasComProgresso = await Promise.all(
        campanhasUnicas.map(async (campanha) => {
          // Contar total de contatos da campanha
          const { count: totalContatos, error: errorTotal } = await supabase
            .from('Disparador')
            .select('*', { count: 'exact', head: true })
            .eq('id_campanha', campanha.id_campanha);

          // Contar contatos já enviados
          const { count: contatosEnviados, error: errorEnviados } = await supabase
            .from('Disparador')
            .select('*', { count: 'exact', head: true })
            .eq('id_campanha', campanha.id_campanha)
            .eq('Disparador', 'true');

          // Formatar a data de criação se for uma string válida
          let dataFormatada = campanha.dataCriacao;
          try {
            if (campanha.dataCriacao && !isNaN(Date.parse(campanha.dataCriacao))) {
              dataFormatada = new Date(campanha.dataCriacao).toISOString();
            }
          } catch (e) {
            console.warn('Erro ao formatar data:', e);
          }

          if (errorTotal || errorEnviados) {
            console.error('Erro ao buscar progresso da campanha:', errorTotal || errorEnviados);
            return {
              ...campanha,
              dataCriacao: dataFormatada,
              totalMensagens: 0,
              enviadas: 0
            };
          }

          return {
            ...campanha,
            dataCriacao: dataFormatada,
            totalMensagens: totalContatos || 0,
            enviadas: contatosEnviados || 0
          };
        })
      );
      
      return campanhasComProgresso;
    } catch (errorDisparador) {
      console.error('Erro ao buscar campanhas da tabela Disparador:', errorDisparador);
      return [];
    }
  } catch (error) {
    console.error('Erro ao buscar campanhas:', error);
    return [];
  }
}

/**
 * Busca as campanhas da tabela Campanhas
 * @returns Lista de campanhas
 */
export async function fetchCampanhasFromCampanhasTable(): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('Campanhas')
      .select('*')
      .order('dataCriacao', { ascending: false });
    
    if (error) {
      console.error('Erro ao buscar campanhas da tabela Campanhas:', error);
      return [];
    }
    
    // Mapear para o formato esperado pelo componente
    const campanhasFormatadas = data.map(campanha => ({
      id_campanha: campanha.id_campanha,
      nome_campanha: campanha.nome_campanha,
      dataCriacao: campanha.dataCriacao,
      status: campanha.status,
      dia: campanha.Dia,
      periodo: campanha.Periodo,
      totalMensagens: 0, // Esses valores precisariam ser calculados
      enviadas: 0
    }));
    
    return campanhasFormatadas;
  } catch (error) {
    console.error('Erro ao buscar campanhas da tabela Campanhas:', error);
    return [];
  }
}

/**
 * Verifica a estrutura da tabela disparador
 */
async function verificarTabelaDisparador() {
  try {
    console.log("Verificando estrutura da tabela Disparador...");
    
    // Primeiro, verificar se a tabela existe
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');
    
    if (tablesError) {
      console.error("Erro ao verificar tabelas:", tablesError);
    } else {
      const tableNames = tables?.map(t => t.table_name) || [];
      console.log("Tabelas disponíveis:", tableNames);
      
      if (!tableNames.includes('Disparador')) {
        console.error("Tabela 'Disparador' não encontrada!");
      }
    }
    
    // Verificar a estrutura da tabela Disparador
    const { data, error } = await supabase
      .from('Disparador')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error("Erro ao verificar a tabela Disparador:", error);
    } else {
      if (data && data.length > 0) {
        console.log("Estrutura da tabela Disparador:", Object.keys(data[0]));
      } else {
        console.log("Tabela Disparador está vazia");
        
        // Tentar obter a estrutura da tabela de outra forma
        const { data: columns, error: columnsError } = await supabase
          .from('information_schema.columns')
          .select('column_name, data_type')
          .eq('table_schema', 'public')
          .eq('table_name', 'disparador');
        
        if (columnsError) {
          console.error("Erro ao verificar colunas:", columnsError);
        } else {
          console.log("Colunas da tabela Disparador:", columns);
        }
      }
    }
  } catch (error) {
    console.error("Erro ao verificar a tabela Disparador:", error);
  }
}

/**
 * Verifica a estrutura da tabela disparador
 * @returns Informações sobre as colunas da tabela
 */
async function verificarEstruturaTabelaDisparador(): Promise<any> {
  try {
    // Consultar a estrutura da tabela no schema information_schema
    const { data, error } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_schema', 'public')
      .eq('table_name', 'disparador');
    
    if (error) {
      console.error("Erro ao verificar estrutura da tabela:", error);
      return null;
    }
    
    console.log("Estrutura da tabela disparador:", data);
    return data;
  } catch (error) {
    console.error("Erro ao verificar estrutura da tabela:", error);
    return null;
  }
}

/**
 * Verifica a estrutura da tabela Disparador e retorna as colunas existentes
 * @returns Lista de nomes de colunas da tabela Disparador
 */
export async function verificarColunasDisparador(): Promise<string[]> {
  try {
    // Fazer uma consulta simples para obter um registro e verificar suas colunas
    const { data, error } = await supabase
      .from('Disparador')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error("Erro ao verificar colunas da tabela Disparador:", error);
      return [];
    }
    
    if (!data || data.length === 0) {
      // Se não houver dados, tentar obter apenas a estrutura
      console.warn("Nenhum registro encontrado na tabela Disparador. Tentando obter estrutura...");
      
      // Tentar uma consulta que retorna apenas a estrutura
      const { data: emptyData, error: structError } = await supabase
        .from('Disparador')
        .select('id') // Selecionar apenas o ID para minimizar dados
        .limit(0);  // Não retornar nenhum dado real
      
      if (structError) {
        console.error("Erro ao obter estrutura da tabela Disparador:", structError);
        return [];
      }
      
      // Se chegou aqui, a tabela existe mas não tem dados
      // Retornar uma lista de colunas conhecidas com base na MEMORY
      console.log("Tabela Disparador existe mas está vazia. Usando estrutura conhecida.");
      return ['id', 'created_at', 'Nome', 'Whatsapp', 'Cpf', 'Instancia', 'Disparador', 'nome_campanha', 'status', 'id_campanha', 'dataCriacao'];
    }
    
    // Se temos dados, extrair as colunas do primeiro registro
    const colunas = Object.keys(data[0]);
    console.log("Colunas da tabela Disparador:", colunas);
    return colunas;
  } catch (error) {
    console.error("Erro ao verificar colunas da tabela Disparador:", error);
    return [];
  }
}

/**
 * Salva um arquivo de campanha no Supabase
 * @param contatos Lista de contatos a serem salvos
 * @param campanhaData Dados da campanha
 * @param updateStatus Função opcional para atualizar o status de processamento
 * @returns Resultado da operação
 */
export async function saveCampanhaFile(
  contatos: any[], 
  campanhaData: {
    nome: string;
    id_conjunto_template: string;
    nome_conjunto_template: string;
    dia: string;
    periodo: string;
    status: string;
    total_contatos: number;
    contatos_enviados: number;
    arquivo_nome: string;
    id_campanha: string;
    data_criacao: string;
    id_conjunto?: number;
  },
  updateStatus?: (status: string) => void
): Promise<{ success: boolean; message: string }> {
  try {
    console.log("Iniciando processamento de campanha:", campanhaData.nome);
    console.log("Contatos recebidos:", contatos.length);
    
    if (updateStatus) {
      updateStatus(`Iniciando processamento de ${contatos.length} contatos...`);
    }
    
    // Verificar se há dados válidos
    if (!campanhaData.nome || !contatos || contatos.length === 0) {
      throw new Error("Dados da campanha inválidos ou incompletos");
    }
    
    // Gerar um novo idconjunto para esta campanha
    const novoIdConjunto = uuidv4();
    console.log("Novo idconjunto gerado:", novoIdConjunto);
    
    // Buscar instâncias configuradas para o dia e período especificados
    console.log(`Buscando instâncias para Dia ${campanhaData.dia} - ${campanhaData.periodo}...`);
    
    if (updateStatus) {
      updateStatus(`Buscando instâncias para Dia ${campanhaData.dia} - ${campanhaData.periodo}...`);
    }
    
    let instancias = [];
    
    try {
      // Buscar instâncias configuradas para o dia e período específicos na tabela GupTp
      const { data: instanciasFiltradas, error: instanciasError } = await supabase
        .from('GupTp')
        .select('*')
        .eq('Dia', campanhaData.dia)
        .eq('Periodo', campanhaData.periodo);
      
      if (instanciasError) {
        console.error("Erro ao buscar instâncias por dia e período:", instanciasError);
      } else if (instanciasFiltradas && instanciasFiltradas.length > 0) {
        // Mapear os detalhes das instâncias
        instancias = instanciasFiltradas.map(inst => ({
          id: inst.id,
          instancia: inst.Instancia,
          nome: inst.NomeAppGup || 'Sem nome'
        }));
        
        console.log(`Encontradas ${instancias.length} instâncias para Dia ${campanhaData.dia} - ${campanhaData.periodo}`);
        
        if (updateStatus) {
          updateStatus(`Encontradas ${instancias.length} instâncias para Dia ${campanhaData.dia} - ${campanhaData.periodo}`);
        }
      } else {
        console.warn(`Nenhuma instância encontrada para Dia ${campanhaData.dia} - ${campanhaData.periodo}`);
      }
    } catch (e) {
      console.error("Erro ao buscar instâncias:", e);
    }
    
    // Se não encontrou instâncias configuradas para o dia e período, buscar todas as instâncias
    if (instancias.length === 0) {
      console.warn("Nenhuma instância configurada para o dia e período. Buscando todas as instâncias...");
      
      if (updateStatus) {
        updateStatus("Nenhuma instância configurada para o dia e período. Buscando todas as instâncias...");
      }
      
      try {
        const { data: todasInstancias, error: instanciasError } = await supabase
          .from('GupTp')
          .select('*');
        
        if (instanciasError) {
          console.error("Erro ao buscar instâncias:", instanciasError);
        } else if (todasInstancias && todasInstancias.length > 0) {
          // Extrair os números de instância da tabela GupTp
          instancias = todasInstancias.map(inst => ({
            id: inst.id,
            instancia: inst.Instancia,
            nome: inst.NomeAppGup || 'Sem nome'
          }));
          
          console.log(`Encontradas ${instancias.length} instâncias no total`);
          
          if (updateStatus) {
            updateStatus(`Encontradas ${instancias.length} instâncias no total`);
          }
        }
      } catch (e) {
        console.error("Erro ao buscar todas as instâncias:", e);
      }
    }
    
    // Se não encontrou instâncias, criar uma instância padrão
    if (instancias.length === 0) {
      console.warn("Nenhuma instância encontrada. Usando instância padrão.");
      
      if (updateStatus) {
        updateStatus("Nenhuma instância encontrada. Usando instância padrão.");
      }
      
      instancias = [
        {
          id: 1,
          instancia: "554899944674",
          nome: "Instância Padrão"
        }
      ];
    }
    
    // Processar os contatos
    // Verificar a estrutura dos contatos recebidos e adaptá-los conforme necessário
    console.log("Amostra de contatos recebidos:", contatos.slice(0, 2));
    
    if (updateStatus) {
      updateStatus("Validando contatos...");
    }
    
    const contatosValidos = contatos.map(contato => {
      // Garantir que o contato seja um objeto
      if (typeof contato === 'string') {
        return { Whatsapp: contato };
      }
      return contato;
    }).filter(contato => {
      // Verificar se o contato tem um número de telefone válido
      const telefone = contato.Whatsapp || contato.whatsapp || contato.WHATSAPP;
      return telefone && String(telefone).replace(/\D/g, '').length >= 8;
    });
    
    console.log(`Total de ${contatosValidos.length} contatos válidos para processar`);
    
    if (updateStatus) {
      updateStatus(`Total de ${contatosValidos.length} contatos válidos para processar`);
    }
    
    // Distribuir os contatos entre as instâncias (800 por instância)
    const CONTATOS_POR_INSTANCIA = 800;
    let sucessos = 0;
    let falhas = 0;
    
    // Ordenar as instâncias para garantir que sejam usadas em ordem
    instancias.sort((a, b) => a.id - b.id);
    
    // Dividir os contatos em lotes de 800 para cada instância
    const totalLotes = Math.ceil(contatosValidos.length / CONTATOS_POR_INSTANCIA);
    
    console.log(`Iniciando processamento de ${totalLotes} lotes de ${CONTATOS_POR_INSTANCIA} contatos`);
    
    if (updateStatus) {
      updateStatus(`Iniciando processamento de ${totalLotes} lotes de contatos...`);
    }
    
    // Processar cada lote
    for (let lote = 0; lote < totalLotes; lote++) {
      // Determinar qual instância usar (em ordem)
      const instanciaIndex = lote % instancias.length;
      const instancia = instancias[instanciaIndex];
      
      // Calcular o início e fim do lote atual
      const inicioLote = lote * CONTATOS_POR_INSTANCIA;
      const fimLote = Math.min((lote + 1) * CONTATOS_POR_INSTANCIA, contatosValidos.length);
      const contatosLote = contatosValidos.slice(inicioLote, fimLote);
      
      console.log(`Processando lote ${lote + 1}/${totalLotes}: ${contatosLote.length} contatos para a instância ${instancia.instancia}`);
      
      if (updateStatus) {
        updateStatus(`Processando lote ${lote + 1}/${totalLotes}: ${contatosLote.length} contatos para a instância ${instancia.instancia}`);
      }
      
      // Preparar os dados para inserção em lote - USAR APENAS CAMPOS QUE EXISTEM NA TABELA
      const dadosParaInserir = contatosLote.map((contato, index) => {
        // Normalizar os dados para garantir consistência
        let nome = '';
        let whatsapp = '';
        let cpf = '';
        
        // Verificar diferentes formatos de propriedades
        if (contato) {
          // Verificar nome em diferentes formatos
          if (typeof contato === 'object') {
            nome = String(contato.Nome || contato.nome || contato.NOME || '').trim();
            
            // Processar WhatsApp em diferentes formatos
            whatsapp = String(contato.Whatsapp || contato.whatsapp || contato.WHATSAPP || 
                              contato.Telefone || contato.telefone || contato.TELEFONE || 
                              contato.Celular || contato.celular || contato.CELULAR || '').replace(/\D/g, '');
            
            // Processar CPF em diferentes formatos
            cpf = String(contato.Cpf || contato.cpf || contato.CPF || 
                        contato.Documento || contato.documento || contato.DOCUMENTO || '').trim();
          }
        }
        
        // Log para depuração
        console.log("Mapeando contato para inserção:", { 
          original: contato,
          normalizado: { nome, whatsapp, cpf }
        });
        
        // Garantir que os campos nunca sejam vazios
        if (!nome) nome = `Contato ${index + 1}`;
        if (!cpf) cpf = '-';
        
        // Validar número de WhatsApp (deve ter pelo menos 8 dígitos)
        if (whatsapp.length < 8) {
          console.warn(`Número de WhatsApp inválido para ${nome}: ${whatsapp}`);
          // Tentar extrair número de qualquer campo que pareça conter dígitos
          if (typeof contato === 'object') {
            for (const key in contato) {
              const value = String(contato[key] || '');
              const digits = value.replace(/\D/g, '');
              if (digits.length >= 8 && /^\d+$/.test(digits)) {
                whatsapp = digits;
                console.log(`Encontrado possível número de WhatsApp em campo alternativo ${key}: ${whatsapp}`);
                break;
              }
            }
          }
        }
        
        // Usar apenas os campos que existem na tabela Disparador conforme a MEMORY
        const dadoInserir = {
          Nome: nome,
          Whatsapp: whatsapp,
          Cpf: cpf,
          Instancia: instancia.instancia,
          Disparador: 'false',
          nome_campanha: campanhaData.nome,
          status: 'pendente',
          id_campanha: campanhaData.id_campanha,
          dataCriacao: campanhaData.data_criacao
        };
        
        console.log("Objeto final para inserção:", dadoInserir);
        
        return dadoInserir;
      });
      
      try {
        // Inserir os dados no Supabase em lotes menores para evitar problemas
        const TAMANHO_LOTE_INSERCAO = 50; // Inserir 50 registros por vez
        
        for (let i = 0; i < dadosParaInserir.length; i += TAMANHO_LOTE_INSERCAO) {
          const loteMenor = dadosParaInserir.slice(i, i + TAMANHO_LOTE_INSERCAO);
          
          if (updateStatus) {
            updateStatus(`Inserindo sublote ${Math.floor(i/TAMANHO_LOTE_INSERCAO) + 1} do lote ${lote + 1}/${totalLotes}...`);
          }
          
          const { error } = await supabase
            .from('Disparador')
            .insert(loteMenor);
          
          if (error) {
            console.error(`Erro ao inserir sublote ${Math.floor(i/TAMANHO_LOTE_INSERCAO) + 1}:`, error);
            falhas += loteMenor.length;
            
            if (updateStatus) {
              updateStatus(`Erro ao inserir sublote ${Math.floor(i/TAMANHO_LOTE_INSERCAO) + 1}: ${error.message}`);
            }
          } else {
            console.log(`Sublote ${Math.floor(i/TAMANHO_LOTE_INSERCAO) + 1} inserido com sucesso (${loteMenor.length} contatos)`);
            sucessos += loteMenor.length;
            
            if (updateStatus) {
              updateStatus(`Sublote ${Math.floor(i/TAMANHO_LOTE_INSERCAO) + 1} inserido com sucesso (${loteMenor.length} contatos)`);
            }
          }
        }
      } catch (error) {
        console.error(`Erro ao processar lote ${lote + 1}:`, error);
        falhas += contatosLote.length;
        
        if (updateStatus) {
          updateStatus(`Erro ao processar lote ${lote + 1}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
      }
    }
    
    // Salvar a campanha na tabela Campanhas (com C maiúsculo)
    try {
      if (updateStatus) {
        updateStatus("Salvando informações da campanha...");
      }
      
      // Verificar a estrutura da tabela Campanhas antes de inserir
      const { data: colunasCampanhas, error: erroColunas } = await supabase
        .from('Campanhas')
        .select('*')
        .limit(1);
        
      if (erroColunas) {
        console.error("Erro ao verificar estrutura da tabela Campanhas:", erroColunas);
        // Continuar mesmo com erro, usando campos básicos
      }
      
      // Determinar quais campos existem na tabela
      const colunas = colunasCampanhas && colunasCampanhas.length > 0 
        ? Object.keys(colunasCampanhas[0]) 
        : ['nome_campanha', 'status', 'id_campanha', 'dataCriacao', 'finalizada'];
      
      console.log("Colunas disponíveis na tabela Campanhas:", colunas);
      
      // Criar objeto apenas com campos que existem na tabela
      const campanhaMaiusculo: any = {
        nome_campanha: campanhaData.nome,
        status: campanhaData.status,
        id_campanha: campanhaData.id_campanha,
        dataCriacao: campanhaData.data_criacao,
        finalizada: campanhaData.status === 'concluída' ? 'sim' : 'não'
      };
      
      // Adicionar campos opcionais apenas se existirem na tabela
      if (colunas.includes('Dia')) {
        campanhaMaiusculo.Dia = campanhaData.dia;
      }
      
      if (colunas.includes('Periodo')) {
        campanhaMaiusculo.Periodo = campanhaData.periodo;
      }
      
      console.log("Objeto final para inserção na tabela Campanhas:", campanhaMaiusculo);
      
      const { data: dataMaiusculo, error: errorMaiusculo } = await supabase
        .from('Campanhas')
        .insert([campanhaMaiusculo]);
      
      if (errorMaiusculo) {
        console.error("Erro ao salvar na tabela Campanhas:", errorMaiusculo);
        
        if (updateStatus) {
          updateStatus(`Erro ao salvar na tabela Campanhas: ${errorMaiusculo.message}`);
        }
      } else {
        console.log("Campanha salva com sucesso na tabela Campanhas");
        
        if (updateStatus) {
          updateStatus("Campanha salva com sucesso na tabela Campanhas");
        }
      }
    } catch (error) {
      console.error("Erro ao salvar na tabela Campanhas:", error);
      
      if (updateStatus) {
        updateStatus(`Erro ao salvar na tabela Campanhas: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      }
    }
    
    console.log(`Processamento concluído: ${sucessos} contatos processados com sucesso, ${falhas} falhas`);
    
    if (updateStatus) {
      updateStatus(`Processamento concluído: ${sucessos} contatos processados com sucesso, ${falhas} falhas`);
    }
    
    return {
      success: true,
      message: `Campanha criada com sucesso: ${sucessos} contatos processados, ${falhas} falhas`
    };
  } catch (error) {
    console.error("Erro ao processar campanha:", error);
    
    if (updateStatus) {
      updateStatus(`Erro ao processar campanha: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
    
    return {
      success: false,
      message: error instanceof Error ? error.message : "Erro desconhecido ao processar campanha"
    };
  }
}

/**
 * Busca instâncias ativas da tabela GupTp
 * @param limit Número máximo de instâncias a serem retornadas
 * @returns Lista de instâncias ativas
 */
export async function fetchInstancias() {
  console.log("Iniciando busca de instâncias...");
  try {
    const { data, error } = await supabase
      .from('GupTp')
      .select('*');
    
    if (error) {
      console.error("Erro ao buscar instâncias:", error);
      throw error;
    }

    console.log("Instâncias encontradas:", data);
    
    if (!data || data.length === 0) {
      console.log("Nenhuma instância encontrada no banco de dados");
    } else {
      console.log(`${data.length} instâncias encontradas`);
      data.forEach((item, index) => {
        console.log(`Instância ${index + 1}:`, { 
          id: item.id, 
          nome: item.NomeAppGup, 
          instancia: item.Instancia 
        });
      });
    }
    
    return data as GupTpData[];
  } catch (error) {
    console.error("Erro ao buscar instâncias:", error);
    throw error;
  }
}

/**
 * Adiciona uma nova instância
 * @param newInstance Dados da nova instância
 */
export async function addInstancia(newInstance: NewInstanceFormData) {
  const { error } = await supabase
    .from('GupTp')
    .insert([{ 
      NomeAppGup: newInstance.nome,
      Instancia: newInstance.instancia,
      Dia: newInstance.day,
      Periodo: newInstance.periodo,
      Quantidade: newInstance.quantidade,
      token: newInstance.token,
      statusTp: newInstance.status
    }]);

  if (error) {
    console.error("Erro ao adicionar instância:", error);
    throw error;
  }
}

/**
 * Exclui uma instância
 * @param id ID da instância a ser excluída
 */
export async function deleteInstancia(id: number) {
  const { error } = await supabase
    .from('GupTp')
    .delete()
    .eq('id', id);

  if (error) {
    console.error("Erro ao excluir instância:", error);
    throw error;
  }
}

/**
 * Busca o último idconjunto utilizado ou gera um novo se não existir
 * @returns O último idconjunto ou um novo UUID
 */
async function getOrCreateIdConjunto(): Promise<string> {
  try {
    // Buscar o último idconjunto utilizado
    const { data, error } = await supabase
      .from('GupTp')
      .select('idconjunto')
      .not('idconjunto', 'is', null)
      .order('id', { ascending: false })
      .limit(1);
    
    if (error) {
      console.error("Erro ao buscar último idconjunto:", error);
      throw error;
    }
    
    // Se encontrou um idconjunto, retorna ele, senão gera um novo
    if (data && data.length > 0 && data[0].idconjunto) {
      return data[0].idconjunto;
    } else {
      return uuidv4();
    }
  } catch (error) {
    console.error("Erro ao obter idconjunto:", error);
    return uuidv4(); // Em caso de erro, gera um novo UUID
  }
}

/**
 * Salva os templates de WhatsApp no Supabase atualizando todas as linhas existentes na tabela
 * com o mesmo ID de conjunto
 * @param templates Objeto contendo os três templates a serem salvos
 * @returns Dados do template salvo incluindo o idconjunto gerado
 */
export async function saveWhatsAppTemplates(templates: {
  template1: string;
  template2: string;
  template3: string;
  nome?: string; // Nome opcional para o conjunto
}): Promise<WhatsAppTemplateData & { conjuntoId?: number }> {
  try {
    // Buscar todas as instâncias existentes
    const { data: existingInstancias, error: fetchError } = await supabase
      .from('GupTp')
      .select('id, NomeAppGup, Instancia');
    
    if (fetchError) {
      console.error("Erro ao buscar instâncias existentes:", fetchError);
      throw fetchError;
    }
    
    // Gerar um novo idconjunto para cada salvamento
    const idconjunto = uuidv4();
    console.log("Novo idconjunto gerado:", idconjunto);
    
    // Obter a data atual no formato brasileiro
    const brazilianDate = getCurrentBrazilianDate();
    
    // Nome do conjunto (usar o fornecido ou gerar um padrão)
    const nomeConjunto = templates.nome || `Conjunto de Templates ${brazilianDate}`;
    
    // Preparar os dados para atualização
    const templateData: Partial<GupTpData> = {
      textTp: templates.template1,
      textTp1: templates.template2,
      textTp2: templates.template3,
      idconjunto: idconjunto,
      DataConjunto: brazilianDate,
      NomeAppGup: nomeConjunto,
      statusTp: "Ativo"
    };
    
    console.log("Salvando templates no Supabase:", templateData);
    
    // Criar um registro na tabela Conjuntos com o novo idconjunto e informações adicionais
    // Esta etapa deve ser feita antes de salvar na tabela GupTp
    let conjuntoId: number | undefined;
    try {
      const conjuntoRecord = {
        idconjunto: idconjunto,
        Nome: nomeConjunto,
        Status: 'ativo',
        Data: brazilianDate,
        Ativo: true,
        Criado: new Date().toISOString()
      };
      
      console.log("Tentando inserir na tabela Conjuntos:", conjuntoRecord);
      
      // Inserir na tabela Conjuntos
      const { data, error } = await supabase
        .from('Conjuntos')
        .insert([conjuntoRecord])
        .select('id');
      
      if (error) {
        console.error("Erro ao criar registro na tabela Conjuntos:", error);
        // Não interromper o fluxo se falhar ao criar o registro na tabela Conjuntos
      } else if (data && data.length > 0) {
        console.log("Registro criado com sucesso na tabela Conjuntos:", data[0]);
        conjuntoId = data[0].id;
      } else {
        console.error("Falha ao criar registro na tabela Conjuntos");
      }
    } catch (conjuntoErr) {
      console.error("Erro ao criar registro na tabela Conjuntos:", conjuntoErr);
      // Não interromper o fluxo se falhar ao criar o registro na tabela Conjuntos
    }
    
    // Enviar webhook para notificar a criação do template
    try {
      console.log('Iniciando envio do webhook...');
      
      const webhookResult = await sendTemplateWebhook({
        template: "ativar",
        idconjunto: idconjunto,
        nome: nomeConjunto,
        data: brazilianDate,
        id: conjuntoId?.toString() || idconjunto
      });
      
      console.log('Resultado do webhook:', webhookResult);
      
      if (webhookResult) {
        console.log("Webhook enviado com sucesso!");
      } else {
        console.warn("Falha ao enviar webhook, mas o template será salvo.");
      }
    } catch (webhookError) {
      console.error("Erro ao enviar webhook:", webhookError);
      // Não interromper o fluxo se falhar ao enviar o webhook
    }
    
    if (existingInstancias && existingInstancias.length > 0) {
      // Atualizar todas as instâncias existentes uma por uma
      console.log(`Atualizando ${existingInstancias.length} instâncias existentes com o mesmo idconjunto: ${idconjunto}`);
      
      let updateErrors = [];
      
      // Atualizar cada instância individualmente
      for (const instancia of existingInstancias) {
        try {
          const { error } = await supabase
            .from('GupTp')
            .update(templateData)
            .eq('id', instancia.id);
          
          if (error) {
            console.error(`Erro ao atualizar template para instância ${instancia.id}:`, error);
            updateErrors.push({ id: instancia.id, error });
          }
        } catch (err) {
          console.error(`Erro ao atualizar template para instância ${instancia.id}:`, err);
          updateErrors.push({ id: instancia.id, error: err });
        }
      }
      
      if (updateErrors.length > 0) {
        console.error(`Ocorreram ${updateErrors.length} erros durante a atualização dos templates`);
        if (updateErrors.length === existingInstancias.length) {
          throw new Error("Falha ao atualizar todos os templates");
        }
      }
      
      console.log(`Templates atualizados com sucesso em ${existingInstancias.length - updateErrors.length} instâncias`);
      
      // Retornar os dados da instância atualizada
      return {
        textTp: templates.template1,
        textTp1: templates.template2,
        textTp2: templates.template3,
        idconjunto: idconjunto,
        DataConjunto: brazilianDate,
        conjuntoId: conjuntoId
      };
    } else {
      // Se não houver registros, criar um novo
      console.log("Nenhuma instância encontrada para atualizar. Criando nova instância.");
      
      const newInstance: Partial<GupTpData> = {
        textTp: templates.template1,
        textTp1: templates.template2,
        textTp2: templates.template3,
        idconjunto: idconjunto,
        DataConjunto: brazilianDate,
        NomeAppGup: nomeConjunto,
        Instancia: "default",
        statusTp: "Ativo"
      };
      
      const { data, error } = await supabase
        .from('GupTp')
        .insert([newInstance])
        .select();
      
      if (error) {
        console.error("Erro ao criar templates:", error);
        throw error;
      }
      
      console.log("Templates criados com sucesso:", data);
      
      // Retornar os dados da nova instância
      return {
        textTp: templates.template1,
        textTp1: templates.template2,
        textTp2: templates.template3,
        idconjunto: idconjunto,
        DataConjunto: brazilianDate,
        conjuntoId: conjuntoId
      };
    }
  } catch (error) {
    console.error("Erro ao salvar templates:", error);
    throw error;
  }
}

/**
 * Busca templates de WhatsApp pelo idconjunto
 * @param idconjunto Identificador único do conjunto de templates
 * @returns Array com os templates encontrados
 */
export async function fetchWhatsAppTemplatesByIdConjunto(idconjunto: string): Promise<WhatsAppTemplateData[]> {
  try {
    const { data, error } = await supabase
      .from('GupTp')
      .select('textTp, textTp1, textTp2, idconjunto, DataConjunto')
      .eq('idconjunto', idconjunto);
    
    if (error) {
      console.error("Erro ao buscar templates:", error);
      throw error;
    }
    
    return data as WhatsAppTemplateData[];
  } catch (error) {
    console.error("Erro ao buscar templates:", error);
    throw error;
  }
}

/**
 * Busca todos os conjuntos de templates de WhatsApp
 * @returns Array com todos os templates
 */
export async function fetchAllWhatsAppTemplates(): Promise<WhatsAppTemplateData[]> {
  try {
    const { data, error } = await supabase
      .from('GupTp')
      .select('textTp, textTp1, textTp2, idconjunto, DataConjunto')
      .not('textTp', 'is', null); // Busca apenas registros que têm templates
    
    if (error) {
      console.error("Erro ao buscar templates:", error);
      throw error;
    }
    
    // Filtrar para ter apenas um template por idconjunto
    const uniqueTemplates: WhatsAppTemplateData[] = [];
    const idConjuntoSet = new Set<string>();
    
    if (data) {
      for (const template of data) {
        if (template.idconjunto && !idConjuntoSet.has(template.idconjunto)) {
          idConjuntoSet.add(template.idconjunto);
          uniqueTemplates.push(template as WhatsAppTemplateData);
        }
      }
    }
    
    console.log(`Encontrados ${data?.length || 0} templates no total, ${uniqueTemplates.length} únicos após filtragem`);
    
    return uniqueTemplates;
  } catch (error) {
    console.error("Erro ao buscar templates:", error);
    throw error;
  }
}

/**
 * Processa um arquivo XLSX e extrai todos os dados
 * @param file Arquivo XLSX a ser processado
 * @returns Dados da planilha em formato JSON
 */
export async function processXlsxFile(file: File): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Pegar a primeira planilha
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Converter para JSON com cabeçalhos
        const jsonData = XLSX.utils.sheet_to_json<any>(worksheet, { defval: '' });
        
        console.log("Dados brutos da planilha:", jsonData.slice(0, 3));
        
        // Verificar se os dados estão vazios
        if (jsonData.length === 0) {
          console.error("Nenhum dado encontrado na planilha");
          return resolve([]);
        }
        
        // Verificar se os dados estão em um formato esperado
        const primeiraLinha = jsonData[0];
        console.log("Primeira linha da planilha:", primeiraLinha);
        
        // Identificar as colunas da planilha
        const colunas = Object.keys(primeiraLinha);
        console.log("Colunas identificadas na planilha:", colunas);
        
        // Mapear colunas para os campos necessários
        let colunaWhatsapp = '';
        let colunaNome = '';
        let colunaCpf = '';
        
        // Identificar automaticamente as colunas corretas
        for (const coluna of colunas) {
          const colunaLower = coluna.toLowerCase();
          if (colunaLower.includes('whatsapp') || colunaLower.includes('telefone') || 
              colunaLower.includes('celular') || colunaLower.includes('fone')) {
            colunaWhatsapp = coluna;
          } else if (colunaLower.includes('nome') || colunaLower.includes('name')) {
            colunaNome = coluna;
          } else if (colunaLower.includes('cpf') || colunaLower.includes('documento') || 
                    colunaLower.includes('doc')) {
            colunaCpf = coluna;
          }
        }
        
        console.log("Mapeamento de colunas:", { colunaNome, colunaWhatsapp, colunaCpf });
        
        // Se não encontrou as colunas, tentar identificar pelo conteúdo
        if (!colunaWhatsapp) {
          // Procurar coluna que tenha valores que pareçam números de telefone
          for (const coluna of colunas) {
            const amostra = String(primeiraLinha[coluna] || '');
            const numeros = amostra.replace(/\D/g, '');
            if (numeros.length >= 8 && /^\d+$/.test(numeros)) {
              colunaWhatsapp = coluna;
              console.log(`Coluna de WhatsApp identificada pelo conteúdo: ${coluna}`);
              break;
            }
          }
        }
        
        // Processar os dados com base no mapeamento de colunas
        const normalizedData = jsonData.map((row, index) => {
          // Extrair e limpar os valores
          let nome = colunaNome ? String(row[colunaNome] || '') : '';
          let whatsapp = '';
          let cpf = colunaCpf ? String(row[colunaCpf] || '') : '';
          
          // Processar WhatsApp
          if (colunaWhatsapp) {
            whatsapp = String(row[colunaWhatsapp] || '').replace(/\D/g, '');
          }
          
          // Se não encontrou WhatsApp pela coluna mapeada, procurar em todas as colunas
          if (!whatsapp) {
            for (const coluna of colunas) {
              const valor = String(row[coluna] || '');
              const numeros = valor.replace(/\D/g, '');
              if (numeros.length >= 8 && /^\d+$/.test(numeros)) {
                whatsapp = numeros;
                console.log(`WhatsApp encontrado na coluna ${coluna}: ${whatsapp}`);
                break;
              }
            }
          }
          
          // Garantir valores padrão se estiverem vazios
          if (!nome) nome = `Contato ${index + 1}`;
          if (!cpf) cpf = '-';
          
          // Criar objeto normalizado
          return {
            Nome: nome,
            Whatsapp: whatsapp,
            Cpf: cpf
          };
        });
        
        console.log(`Processados ${normalizedData.length} registros da planilha`);
        console.log('Amostra de dados normalizados:', normalizedData.slice(0, 3));
        
        resolve(normalizedData);
      } catch (error) {
        console.error("Erro ao processar arquivo XLSX:", error);
        reject(error);
      }
    };
    
    reader.onerror = (error) => {
      console.error("Erro ao ler arquivo XLSX:", error);
      reject(error);
    };
    
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Interface para os dados de um conjunto de templates
 */
export interface ConjuntoTemplatesData {
  id?: string;
  nome: string;
  template1: string;
  template2?: string;
  template3?: string;
  status?: string;
  created_at?: string;
}

/**
 * Interface para os dados da tabela Conjuntos
 */
export interface ConjuntosData {
  id: number;
  created_at: string;
  Nome: string | null;
  Status: string | null;
  Data: string | null;
  idconjunto: string | null;
}

/**
 * Interface para os dados de uma campanha
 */
export interface CampanhaCompleta {
  id?: number;
  created_at?: string;
  nome: string;
  id_conjunto_template: string;
  nome_conjunto_template: string;
  dia: string;
  periodo: string;
  status: string;
  total_contatos: number;
  contatos_enviados: number;
  arquivo_nome: string;
  data_criacao: string;
  id_conjunto?: number;
}

/**
 * Atualiza o status de uma campanha
 * @param idCampanha ID da campanha
 * @param novoStatus Novo status da campanha
 * @returns Resultado da operação
 */
export async function updateCampanhaStatus(idCampanha: string, novoStatus: string): Promise<boolean> {
  try {
    // Atualizar na tabela Disparador
    const { error: errorDisparador } = await supabase
      .from('Disparador')
      .update({ status: novoStatus })
      .eq('id_campanha', idCampanha);
    
    if (errorDisparador) {
      console.error('Erro ao atualizar status da campanha na tabela Disparador:', errorDisparador);
    }
    
    // Atualizar também na tabela Campanhas
    const { error: errorCampanhas } = await supabase
      .from('Campanhas')
      .update({ 
        status: novoStatus,
        finalizada: novoStatus === 'concluída' ? 'sim' : 'não'
      })
      .eq('id_campanha', idCampanha);
    
    if (errorCampanhas) {
      console.error('Erro ao atualizar status da campanha na tabela Campanhas:', errorCampanhas);
    }
    
    // Considerar sucesso se pelo menos uma das atualizações funcionou
    return !errorDisparador || !errorCampanhas;
  } catch (error) {
    console.error('Erro ao atualizar status da campanha:', error);
    return false;
  }
}

/**
 * Busca todos os registros da tabela Conjuntos
 * @returns Lista de todos os conjuntos cadastrados
 */
export async function fetchAllConjuntos(): Promise<ConjuntosData[] | null> {
  try {
    const { data, error } = await supabase
      .from('Conjuntos')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Erro ao buscar conjuntos:", error);
      return null;
    }
    
    return data as ConjuntosData[];
  } catch (error) {
    console.error("Erro ao buscar conjuntos:", error);
    return null;
  }
}

/**
 * Busca um conjunto pelo ID
 * @param id ID do conjunto
 * @returns Dados do conjunto
 */
export async function fetchConjuntoById(id: number): Promise<ConjuntosData | null> {
  try {
    const { data, error } = await supabase
      .from('Conjuntos')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error("Erro ao buscar conjunto:", error);
      throw error;
    }
    
    return data as ConjuntosData;
  } catch (error) {
    console.error("Erro ao buscar conjunto:", error);
    return null;
  }
}

/**
 * Cria um novo conjunto vazio na tabela Conjuntos
 * @returns O conjunto criado
 */
export async function createConjunto(): Promise<ConjuntosData> {
  try {
    const idconjunto = uuidv4();
    const dataAtual = getCurrentBrazilianDate();
    
    const conjuntoRecord = {
      idconjunto: idconjunto,
      Nome: `Conjunto ${dataAtual}`,
      Status: 'ativo',
      Data: dataAtual
    };
    
    const createdConjunto = await createConjuntoRecord(conjuntoRecord);
    
    if (!createdConjunto) {
      throw new Error("Falha ao criar registro na tabela Conjuntos");
    }
    
    return createdConjunto;
  } catch (error) {
    console.error("Erro ao criar conjunto:", error);
    throw error;
  }
}

/**
 * Cria um novo registro na tabela Conjuntos
 * @param conjuntoData Dados do conjunto a ser criado
 * @returns O conjunto criado ou null em caso de erro
 */
export async function createConjuntoRecord(conjuntoData: {
  idconjunto: string;
  Nome: string;
  Status: string;
  Data: string;
}): Promise<ConjuntosData | null> {
  try {
    console.log("Criando registro na tabela Conjuntos:", conjuntoData);
    
    const { data, error } = await supabase
      .from('Conjuntos')
      .insert([conjuntoData])
      .select();
    
    if (error) {
      console.error("Erro ao criar registro na tabela Conjuntos:", error);
      return null;
    }
    
    console.log("Registro criado com sucesso na tabela Conjuntos:", data);
    return data[0] as ConjuntosData;
  } catch (error) {
    console.error("Erro ao criar registro na tabela Conjuntos:", error);
    return null;
  }
}

/**
 * Salva um conjunto de templates na tabela conjuntos_templates
 * @param conjunto Dados do conjunto de templates a ser salvo
 * @returns Dados do conjunto salvo
 */
export async function saveConjuntoTemplates(conjunto: ConjuntoTemplatesData): Promise<ConjuntoTemplatesData> {
  try {
    const { data, error } = await supabase
      .from('conjuntos_templates')
      .insert([{
        nome: conjunto.nome,
        template1: conjunto.template1,
        template2: conjunto.template2 || '',
        template3: conjunto.template3 || '',
        status: conjunto.status || 'ativo'
      }])
      .select();
    
    if (error) {
      console.error("Erro ao salvar conjunto de templates:", error);
      throw error;
    }
    
    return data[0] as ConjuntoTemplatesData;
  } catch (error) {
    console.error("Erro ao salvar conjunto de templates:", error);
    throw error;
  }
}

/**
 * Busca todos os conjuntos de templates
 * @returns Lista de conjuntos de templates
 */
export async function fetchAllConjuntosTemplates(): Promise<ConjuntoTemplatesData[]> {
  try {
    const { data, error } = await supabase
      .from('conjuntos_templates')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Erro ao buscar conjuntos de templates:", error);
      throw error;
    }
    
    return data as ConjuntoTemplatesData[];
  } catch (error) {
    console.error("Erro ao buscar conjuntos de templates:", error);
    throw error;
  }
}

/**
 * Busca um conjunto de templates pelo ID
 * @param id ID do conjunto de templates
 * @returns Dados do conjunto de templates
 */
export async function fetchConjuntoTemplatesById(id: string): Promise<ConjuntoTemplatesData | null> {
  try {
    const { data, error } = await supabase
      .from('conjuntos_templates')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error("Erro ao buscar conjunto de templates:", error);
      throw error;
    }
    
    return data as ConjuntoTemplatesData;
  } catch (error) {
    console.error("Erro ao buscar conjunto de templates:", error);
    return null;
  }
}

/**
 * Salva uma campanha na tabela campanhas
 * @param campanha Dados da campanha a ser salva
 * @returns Dados da campanha salva
 */
export async function saveCampanha(campanha: CampanhaCompleta): Promise<CampanhaCompleta> {
  try {
    // Obter a data atual no formato brasileiro
    const dataCriacao = getCurrentBrazilianDate();
    
    const { data, error } = await supabase
      .from('campanhas')
      .insert([{
        nome: campanha.nome,
        id_conjunto_template: campanha.id_conjunto_template,
        nome_conjunto_template: campanha.nome_conjunto_template,
        dia: campanha.dia,
        periodo: campanha.periodo,
        status: campanha.status || 'pendente',
        total_contatos: campanha.total_contatos,
        contatos_enviados: campanha.contatos_enviados || 0,
        arquivo_nome: campanha.arquivo_nome,
        data_criacao: dataCriacao
      }])
      .select();
    
    if (error) {
      console.error("Erro ao salvar campanha:", error);
      throw error;
    }
    
    return data[0] as CampanhaCompleta;
  } catch (error) {
    console.error("Erro ao salvar campanha:", error);
    throw error;
  }
}

/**
 * Busca todas as campanhas
 * @returns Lista de campanhas
 */
export async function fetchAllCampanhas(): Promise<CampanhaCompleta[]> {
  try {
    const { data, error } = await supabase
      .from('campanhas')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Erro ao buscar campanhas:", error);
      throw error;
    }
    
    return data as CampanhaCompleta[];
  } catch (error) {
    console.error("Erro ao buscar campanhas:", error);
    throw error;
  }
}

/**
 * Atualiza o status de uma campanha
 * @param id ID da campanha
 * @param status Novo status da campanha
 * @returns Sucesso da operação
 */
export async function updateStatusCampanha(id: string, status: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('campanhas')
      .update({ status })
      .eq('id', id);
    
    if (error) {
      console.error("Erro ao atualizar status da campanha:", error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error("Erro ao atualizar status da campanha:", error);
    return false;
  }
}

/**
 * Atualiza o contador de contatos enviados de uma campanha
 * @param id ID da campanha
 * @param contatos_enviados Número de contatos enviados
 * @returns Sucesso da operação
 */
export async function updateCampanhaContatosEnviados(id: string, contatos_enviados: number): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('campanhas')
      .update({ contatos_enviados })
      .eq('id', id);
    
    if (error) {
      console.error("Erro ao atualizar contatos enviados da campanha:", error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error("Erro ao atualizar contatos enviados da campanha:", error);
    return false;
  }
}
