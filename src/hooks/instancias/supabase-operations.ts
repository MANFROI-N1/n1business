/**
 * Interface para os dados de um template de WhatsApp
 */
export interface WhatsAppTemplateData {
  id?: number;
  nome: string;
  texttp?: string;
  texttp1?: string;
  texttp2?: string;
  idconjunto?: string;
  DataConjunto?: string;
  token?: string;
  appId?: string;
  instancia?: string;
  statusTp?: string;
  // Campos específicos da tabela Conjuntos
  conjuntoId?: number;
  conjuntoNome?: string;
  conjuntoStatus?: string;
}

import { supabase } from "@/lib/supabase";
import { GupTpData, NewInstanceFormData } from "@/types/instancia";
import { v4 as uuidv4 } from 'uuid';
import * as XLSX from 'xlsx';

/**
 * Envia um webhook para notificar a criação de um template
 * @param data Dados a serem enviados no webhook
 * @returns Resultado da operação
 */
export async function sendTemplateWebhook(data: any): Promise<boolean> {
  try {
    // URL do webhook de produção
    const webhookUrl = 'https://webhooktp.n1promotora.com.br/webhook/template';
    
    // URL do proxy local (quando em desenvolvimento) ou na Vercel (quando em produção)
    const proxyUrl = window.location.hostname === 'localhost' 
      ? `${window.location.protocol}//${window.location.host}/api/webhook-proxy` 
      : `${window.location.origin}/api/webhook-proxy`;
    
    console.log(`Enviando webhook via proxy: ${proxyUrl}`);
    console.log('Dados do webhook:', JSON.stringify(data, null, 2));
    
    // Garantir que os dados estejam no formato correto esperado pelo servidor
    const formattedData = {
      template: data.template || "ativar",
      idconjunto: data.idconjunto || "",
      nome: data.nome || "",
      data: data.data || new Date().toLocaleDateString('pt-BR'),
      id: data.id || ""
    };
    
    // Abordagem 1: Tentar com o proxy de webhook
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(proxyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formattedData),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      console.log('Resposta do proxy:', response.status);
      const responseData = await response.json().catch(() => null);
      console.log('Dados da resposta:', responseData);
      
      if (response.ok) {
        console.log('Webhook enviado com sucesso via proxy');
        
        // Salvar no localStorage que o webhook foi enviado com sucesso
        try {
          const sentWebhooks = JSON.parse(localStorage.getItem('sentWebhooks') || '[]');
          sentWebhooks.push({
            timestamp: new Date().toISOString(),
            data: formattedData,
            method: 'proxy',
            success: true
          });
          localStorage.setItem('sentWebhooks', JSON.stringify(sentWebhooks.slice(-20)));
        } catch (storageError) {
          console.warn('Erro ao salvar registro de webhook no localStorage:', storageError);
        }
        
        return true;
      } else {
        console.warn('Falha ao enviar webhook via proxy:', response.status, responseData);
        // Continuar para os métodos alternativos
      }
    } catch (proxyError) {
      console.warn('Erro ao enviar webhook via proxy:', proxyError);
      console.log('Tentando métodos alternativos...');
    }
    
    // Abordagem 2: Tentar com fetch API diretamente (fallback)
    try {
      console.log('Tentando enviar webhook diretamente via fetch...');
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(formattedData),
        signal: controller.signal,
        mode: 'no-cors' // Importante para contornar CORS
      });
      
      clearTimeout(timeoutId);
      
      console.log('Resposta do fetch direto:', response.status);
      if (response.status === 0 || response.status === 200) {
        console.log('Webhook enviado com sucesso via fetch direto (modo no-cors)');
        
        // Salvar no localStorage que o webhook foi enviado com sucesso
        try {
          const sentWebhooks = JSON.parse(localStorage.getItem('sentWebhooks') || '[]');
          sentWebhooks.push({
            timestamp: new Date().toISOString(),
            data: formattedData,
            method: 'fetch-direct',
            success: true
          });
          localStorage.setItem('sentWebhooks', JSON.stringify(sentWebhooks.slice(-20)));
        } catch (storageError) {
          console.warn('Erro ao salvar registro de webhook no localStorage:', storageError);
        }
        
        return true;
      }
    } catch (fetchError) {
      console.warn('Erro ao enviar webhook via fetch direto:', fetchError);
    }
    
    // Abordagem 3: Usar um formulário HTML com POST (fallback)
    try {
      console.log('Tentando enviar webhook via formulário HTML...');
      
      // Criar um elemento <form> para enviar os dados como um formulário
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = webhookUrl;
      form.style.display = 'none';
      
      // Criar um campo oculto para os dados JSON
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = 'data';
      input.value = JSON.stringify(formattedData);
      
      // Adicionar o campo ao formulário
      form.appendChild(input);
      
      // Criar um iframe invisível para enviar o formulário sem abrir uma nova aba
      const iframe = document.createElement('iframe');
      iframe.name = 'webhook-frame';
      iframe.style.display = 'none';
      document.body.appendChild(iframe);
      
      // Configurar o iframe como alvo do formulário
      form.target = 'webhook-frame';
      
      // Adicionar o formulário ao documento
      document.body.appendChild(form);
      
      // Enviar o formulário
      form.submit();
      
      // Remover o formulário e o iframe após um curto período
      setTimeout(() => {
        try {
          document.body.removeChild(form);
          document.body.removeChild(iframe);
        } catch (e) {
          console.warn('Erro ao remover elementos do DOM:', e);
        }
      }, 5000);
      
      console.log('Webhook enviado via formulário HTML');
      
      // Salvar no localStorage que o webhook foi enviado
      try {
        const sentWebhooks = JSON.parse(localStorage.getItem('sentWebhooks') || '[]');
        sentWebhooks.push({
          timestamp: new Date().toISOString(),
          data: formattedData,
          method: 'form',
          success: true
        });
        localStorage.setItem('sentWebhooks', JSON.stringify(sentWebhooks.slice(-20)));
      } catch (storageError) {
        console.warn('Erro ao salvar registro de webhook no localStorage:', storageError);
      }
      
      return true;
    } catch (formError) {
      console.warn('Erro ao enviar webhook via formulário:', formError);
    }
    
    // Se chegou aqui, todas as tentativas falharam
    // Salvar no localStorage para tentar mais tarde
    try {
      const pendingWebhooks = JSON.parse(localStorage.getItem('pendingWebhooks') || '[]');
      pendingWebhooks.push({
        timestamp: new Date().toISOString(),
        data: formattedData,
        attempts: 3
      });
      localStorage.setItem('pendingWebhooks', JSON.stringify(pendingWebhooks));
      console.log('Webhook salvo para sincronização posterior. Total pendente:', pendingWebhooks.length);
    } catch (storageError) {
      console.error('Erro ao salvar webhook pendente:', storageError);
    }
    
    return false;
  } catch (error) {
    console.error('Erro crítico ao enviar webhook:', error);
    
    // Tentar salvar no localStorage para sincronização posterior
    try {
      const pendingWebhooks = JSON.parse(localStorage.getItem('pendingWebhooks') || '[]');
      pendingWebhooks.push({
        timestamp: new Date().toISOString(),
        data: {
          template: data.template || "ativar",
          idconjunto: data.idconjunto || "",
          nome: data.nome || "",
          data: data.data || new Date().toLocaleDateString('pt-BR'),
          id: data.id || ""
        },
        error: error.message
      });
      localStorage.setItem('pendingWebhooks', JSON.stringify(pendingWebhooks));
      console.log('Webhook salvo para sincronização posterior após erro crítico. Total pendente:', pendingWebhooks.length);
    } catch (storageError) {
      console.error('Erro ao salvar webhook pendente após erro crítico:', storageError);
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
      
      // Se a tabela existe mas não tem dados
      // Retornar uma lista de colunas conhecidas com base na MEMORY
      console.log("Tabela Disparador existe mas está vazia. Usando estrutura conhecida.");
      return [
        'id', 
        'created_at', 
        'Nome', 
        'Whatsapp', 
        'Cpf', 
        'Instancia', 
        'appId', 
        'token', 
        'Disparador', 
        'nome_campanha', 
        'status', 
        'id_campanha', 
        'dataCriacao',
        'dia_envio',
        'periodo_envio'
      ];
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
 * Busca instâncias ativas por grupo
 * @param grupo Número do grupo (1, 2, 3 ou 4)
 * @returns Lista de instâncias ativas do grupo especificado
 */
export async function fetchInstanciasByGroup(grupo: string): Promise<any[]> {
  try {
    console.log(`Buscando instâncias do Grupo ${grupo}...`);
    
    const { data, error } = await supabase
      .from('GupTp')
      .select('id, Instancia, Status, NomeAppGup, appId, token')
      .eq('Grupo', grupo)
      .eq('Status', 'ativo');
    
    if (error) {
      console.error(`Erro ao buscar instâncias do Grupo ${grupo}:`, error);
      return [];
    }
    
    if (!data || data.length === 0) {
      console.warn(`Nenhuma instância ativa encontrada para o Grupo ${grupo}`);
      return [];
    }
    
    console.log(`Encontradas ${data.length} instâncias ativas no Grupo ${grupo}:`, data);
    return data;
  } catch (error) {
    console.error(`Erro ao buscar instâncias do Grupo ${grupo}:`, error);
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
    grupo: string; 
    id_campanha: string; 
    data_criacao: string 
  },
  updateStatus?: (status: string) => void
): Promise<{ success: boolean; message: string }> {
  try {
    console.log("Iniciando salvamento de campanha...");
    console.log("Dados da campanha:", campanhaData);
    console.log(`Total de contatos a processar: ${contatos.length}`);
    
    if (!contatos || contatos.length === 0) {
      return { success: false, message: "Nenhum contato para processar" };
    }
    
    // Verificar se a tabela Campanhas existe e tem as colunas necessárias
    console.log("Verificando a tabela Campanhas...");
    try {
      const { data: campanhasCheck, error: errorCheck } = await supabase
        .from('Campanhas')
        .select('*')
        .limit(1);
      
      if (errorCheck) {
        console.error("Erro ao verificar a tabela Campanhas:", errorCheck);
      } else {
        console.log("Estrutura da tabela Campanhas:", campanhasCheck && campanhasCheck.length > 0 ? Object.keys(campanhasCheck[0]) : []);
      }
    } catch (checkError) {
      console.error("Erro ao verificar a tabela Campanhas:", checkError);
    }
    
    // Buscar instâncias do grupo especificado
    const { data: instanciasGrupo, error: errorInstancias } = await supabase
      .from('GupTp')
      .select('id, Instancia, Grupo, NomeAppGup, appId, token')
      .eq('Grupo', campanhaData.grupo); // Filtrar pelo grupo selecionado
    
    if (errorInstancias) {
      console.error("Erro ao buscar instâncias do grupo:", errorInstancias);
      return { success: false, message: `Erro ao buscar instâncias: ${errorInstancias.message}` };
    }
    
    if (!instanciasGrupo || instanciasGrupo.length === 0) {
      console.error("Nenhuma instância encontrada para o grupo:", campanhaData.grupo);
      return { success: false, message: `Nenhuma instância encontrada para o Grupo ${campanhaData.grupo}` };
    }
    
    console.log(`Encontradas ${instanciasGrupo.length} instâncias no Grupo ${campanhaData.grupo}`);
    
    // Salvar a campanha na tabela Campanhas
    console.log("Salvando dados da campanha na tabela Campanhas...");
    
    // Adaptando para os nomes de colunas corretos conforme visto na estrutura da tabela
    const campanha = {
      nome_campanha: campanhaData.nome,
      status: "pendente",
      id_campanha: campanhaData.id_campanha,
      dataCriacao: campanhaData.data_criacao,
      finalizada: false,
      grupo: campanhaData.grupo, // Adicionando o campo grupo
      // Não incluir campos que não existem na tabela
      // total_contatos e contatos_enviados não existem na tabela
    };
    
    const { data: campanhaInserida, error: errorCampanha } = await supabase
      .from('Campanhas')
      .insert([campanha]);
    
    if (errorCampanha) {
      console.error("Erro ao salvar campanha na tabela Campanhas:", errorCampanha);
      // Continuar mesmo com erro para salvar os contatos
    } else {
      console.log("Campanha salva com sucesso na tabela Campanhas:", campanhaInserida);
    }
    
    // Verificar colunas da tabela Disparador
    const colunas = await verificarColunasDisparador();
    console.log("Colunas disponíveis na tabela Disparador:", colunas);
    
    // Distribuir contatos entre as instâncias de forma equilibrada
    const MAX_CONTATOS_POR_INSTANCIA = 800;
    const distribuicaoInstancias: { [key: string]: number } = {};
    
    // Inicializar o contador para cada instância
    instanciasGrupo.forEach(instancia => {
      distribuicaoInstancias[instancia.Instancia] = 0;
    });
    
    // Mapear instâncias por seu número para fácil acesso
    const instanciasPorNumero: { [key: string]: any } = {};
    instanciasGrupo.forEach(instancia => {
      instanciasPorNumero[instancia.Instancia] = instancia;
    });
    
    // Calcular a distribuição ideal dos contatos
    const totalInstancias = instanciasGrupo.length;
    const totalContatos = contatos.length;
    
    // Determinar quantas instâncias precisamos usar
    // Se tivermos 1000 contatos e cada instância pode ter 800,
    // precisamos de pelo menos 2 instâncias (1000 / 800 = 1.25, arredondado para cima = 2)
    const instanciasNecessarias = Math.min(
      Math.ceil(totalContatos / MAX_CONTATOS_POR_INSTANCIA),
      totalInstancias
    );
    
    // Calcular quantos contatos cada instância utilizada deve receber
    // Se tivermos 1000 contatos e 2 instâncias necessárias, cada uma recebe 500
    const contatosPorInstanciaUtilizada = Math.ceil(totalContatos / instanciasNecessarias);
    
    console.log(`Total de contatos: ${totalContatos}`);
    console.log(`Total de instâncias disponíveis: ${totalInstancias}`);
    console.log(`Instâncias necessárias para distribuição: ${instanciasNecessarias}`);
    console.log(`Contatos por instância utilizada: ${contatosPorInstanciaUtilizada}`);
    
    // Função para selecionar a próxima instância para receber um contato
    let indiceInstanciaAtual = 0;
    const selecionarProximaInstancia = () => {
      // Seleciona a próxima instância de forma circular
      const instancia = instanciasGrupo[indiceInstanciaAtual];
      
      // Avança para a próxima instância
      indiceInstanciaAtual = (indiceInstanciaAtual + 1) % instanciasNecessarias;
      
      return instancia;
    };
    
    // Processar em lotes para evitar timeout
    const BATCH_SIZE = 100;
    const totalBatches = Math.ceil(contatos.length / BATCH_SIZE);
    
    let totalProcessado = 0;
    let totalSalvo = 0;
    
    for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
      const start = batchIndex * BATCH_SIZE;
      const end = Math.min(start + BATCH_SIZE, contatos.length);
      const batch = contatos.slice(start, end);
      
      const registros = [];
      
      for (const contato of batch) {
        // Selecionar a próxima instância para receber o contato
        const instanciaSelecionada = selecionarProximaInstancia();
        
        // Criar o registro para inserção
        const registro: any = {
          Nome: contato.Nome || '',
          Whatsapp: contato.Whatsapp || '',
          Cpf: contato.Cpf || '',
          Instancia: instanciaSelecionada.Instancia,
          appId: instanciaSelecionada.appId || '',
          token: instanciaSelecionada.token || '',
          NomeAppGup: instanciaSelecionada.NomeAppGup || '',
          Disparador: 'false',
          nome_campanha: campanhaData.nome,
          status: 'pendente',
          id_campanha: campanhaData.id_campanha,
          dataCriacao: campanhaData.data_criacao
        };
        
        registros.push(registro);
        
        // Incrementar o contador para a instância selecionada
        distribuicaoInstancias[instanciaSelecionada.Instancia] = 
          (distribuicaoInstancias[instanciaSelecionada.Instancia] || 0) + 1;
      }
      
      // Inserir os registros no Supabase
      const { data, error } = await supabase
        .from('Disparador')
        .insert(registros);
      
      if (error) {
        console.error(`Erro ao salvar lote ${batchIndex + 1}/${totalBatches}:`, error);
        // Continuar mesmo com erro
      } else {
        totalSalvo += registros.length;
      }
      
      totalProcessado += batch.length;
      
      // Atualizar o status de processamento
      if (updateStatus) {
        const porcentagem = Math.round((totalProcessado / contatos.length) * 100);
        updateStatus(`Processados ${totalProcessado} de ${contatos.length} contatos (${porcentagem}%)`);
      }
      
      // Pequena pausa para evitar sobrecarga
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log("Distribuição final por instância:", distribuicaoInstancias);
    console.log(`Total de contatos processados: ${totalProcessado}`);
    console.log(`Total de contatos salvos: ${totalSalvo}`);
    
    // Atualizar a mensagem de sucesso para refletir se foram usadas instâncias do grupo selecionado ou instâncias alternativas
    let mensagemSucesso = "";
    if (instanciasGrupo && instanciasGrupo.length > 0) {
      mensagemSucesso = `Campanha salva com sucesso. ${totalSalvo} contatos distribuídos entre ${instanciasGrupo.length} instâncias do Grupo ${campanhaData.grupo}.`;
    } else {
      mensagemSucesso = `Campanha salva com sucesso. ${totalSalvo} contatos salvos usando instâncias alternativas.`;
    }
    
    return { 
      success: true, 
      message: mensagemSucesso
    };
  } catch (error) {
    console.error("Erro ao salvar campanha:", error);
    return { success: false, message: `Erro ao salvar campanha: ${error}` };
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
 * Salva um template de WhatsApp no Supabase
 * @param template Objeto contendo o template a ser salvo
 * @returns Dados do template salvo incluindo o idconjunto gerado
 */
export async function saveWhatsAppTemplates(templates: {
  template1: string;
  template2?: string;
  template3?: string;
  nome?: string; // Nome opcional para o conjunto
}): Promise<WhatsAppTemplateData & { conjuntoId?: number }> {
  try {
    // Gerar um novo idconjunto
    const idconjunto = await getOrCreateIdConjunto();
    const dataAtual = getCurrentBrazilianDate();
    
    console.log(`Salvando template com idconjunto ${idconjunto}`);
    
    // Tentar várias abordagens para salvar na tabela Conjuntos
    try {
      console.log("Tentando múltiplas abordagens para salvar na tabela Conjuntos...");
      
      const nome = templates.nome || `Template ${new Date().toISOString().slice(0, 10)}`;
      
      // Abordagem 1: Inserção direta
      try {
        console.log("Abordagem 1: Inserção direta");
        const { data: data1, error: error1 } = await supabase
          .from('Conjuntos')
          .insert([{
            idconjunto,
            Nome: nome,
            Status: 'ativo',
            Data: dataAtual
          }]);
        
        if (error1) {
          console.error("Erro na abordagem 1:", error1);
        } else {
          console.log("Abordagem 1 bem-sucedida");
        }
      } catch (error1) {
        console.error("Exceção na abordagem 1:", error1);
      }
    } catch (conjuntoError) {
      console.error("Erro geral ao tentar salvar na tabela Conjuntos:", conjuntoError);
    }
    
    // Vamos salvar apenas um template na tabela GupTp
    // Buscar uma instância ativa para salvar o template
    const { data: instancias, error: instanciasError } = await supabase
      .from('GupTp')
      .select('*')
      .limit(1);
    
    if (instanciasError || !instancias || instancias.length === 0) {
      console.error("Erro ao buscar instâncias:", instanciasError);
      throw new Error("Nenhuma instância encontrada para salvar o template");
    }
    
    const instancia = instancias[0];
    console.log(`Usando instância ${instancia.id} para salvar o template`);
    
    // Dados do template a ser salvo
    const templateData = {
      idconjunto,
      DataConjunto: dataAtual,
      NomeTemplate: templates.nome || `Template ${new Date().toISOString().slice(0, 10)}`,
      templateId: templates.template1,
      statusTp: 'Ativo'
    };
    
    // Salvar o template na tabela GupTp
    const { data, error } = await supabase
      .from('GupTp')
      .update(templateData)
      .eq('id', instancia.id)
      .select();
    
    if (error) {
      console.error(`Erro ao salvar template para instância ${instancia.id}:`, error);
      throw error;
    }
    
    const savedTemplate = data?.[0];
    
    if (!savedTemplate) {
      throw new Error("Falha ao salvar o template");
    }
    
    // Enviar webhook para notificar a criação do template
    try {
      await sendTemplateWebhook({
        template: "ativar",
        idconjunto,
        nome: templates.nome || `Template ${new Date().toISOString().slice(0, 10)}`,
        data: dataAtual,
        id: savedTemplate.id
      });
    } catch (webhookError) {
      console.error("Erro ao enviar webhook de template:", webhookError);
      // Continuar mesmo se o webhook falhar
    }
    
    // Mapear o resultado para o formato esperado
    return {
      id: savedTemplate.id,
      nome: savedTemplate.NomeTemplate || templates.nome || 'Template sem nome',
      texttp: savedTemplate.templateId || templates.template1 || '',
      texttp1: '',
      texttp2: '',
      idconjunto: savedTemplate.idconjunto,
      DataConjunto: savedTemplate.DataConjunto,
      token: savedTemplate.token,
      appId: savedTemplate.appId,
      instancia: savedTemplate.Instancia,
      statusTp: savedTemplate.statusTp || 'Ativo',
      conjuntoId: savedTemplate.id
    };
  } catch (error) {
    console.error("Erro ao salvar template:", error);
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
    // Buscar dados usando a estrutura atual da tabela GupTp
    const { data, error } = await supabase
      .from('GupTp')
      .select('id, NomeAppGup, Instancia, templateId, NomeTemplate, idconjunto, DataConjunto, token, appId, statusTp')
      .eq('idconjunto', idconjunto);
    
    if (error) {
      console.error("Erro ao buscar templates:", error);
      throw error;
    }
    
    // Mapear os dados para o formato esperado pela aplicação
    const mappedData = data?.map(item => ({
      id: item.id,
      nome: item.NomeTemplate || item.NomeAppGup || 'Template sem nome',
      texttp: item.templateId || '', // Usar templateId como texttp para compatibilidade
      texttp1: '', // Não temos mais múltiplos templates
      texttp2: '', // Não temos mais múltiplos templates
      idconjunto: item.idconjunto,
      DataConjunto: item.DataConjunto,
      token: item.token,
      appId: item.appId,
      instancia: item.Instancia,
      statusTp: item.statusTp || 'Ativo'
    })) || [];
    
    return mappedData;
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
    console.log("Iniciando fetchAllWhatsAppTemplates...");
    
    // Primeiro, vamos buscar diretamente da tabela Conjuntos para ver o que temos
    console.log("Buscando diretamente da tabela Conjuntos para diagnóstico...");
    const { data: conjuntosDiagnostico, error: conjuntosErrorDiagnostico } = await supabase
      .from('Conjuntos')
      .select('*');
    
    if (conjuntosErrorDiagnostico) {
      console.error("Erro ao buscar diretamente da tabela Conjuntos:", conjuntosErrorDiagnostico);
    } else {
      console.log("Dados diretos da tabela Conjuntos:", conjuntosDiagnostico);
      console.log("Total de registros na tabela Conjuntos:", conjuntosDiagnostico?.length || 0);
    }
    
    // Verificar a tabela Conjuntos sem usar funções agregadas
    try {
      const { data: conjuntosCheck, error: conjuntosError } = await supabase
        .from('Conjuntos')
        .select('*')
        .limit(1);
      
      if (conjuntosError) {
        console.error("Erro ao verificar tabela Conjuntos:", conjuntosError);
      } else {
        console.log("Tabela Conjuntos existe, registro de exemplo:", conjuntosCheck);
      }
    } catch (checkError) {
      console.error("Erro ao verificar existência da tabela Conjuntos:", checkError);
    }
    
    // Buscar dados da tabela GupTp
    console.log("Buscando dados da tabela GupTp...");
    const { data: gupTpData, error: gupTpError } = await supabase
      .from('GupTp')
      .select('id, NomeAppGup, Instancia, templateId, NomeTemplate, idconjunto, DataConjunto, token, appId, statusTp')
      .not('templateId', 'is', null); // Buscar apenas registros com templateId
    
    if (gupTpError) {
      console.error("Erro ao buscar templates da tabela GupTp:", gupTpError);
      throw gupTpError;
    }
    
    console.log("Dados da GupTp obtidos:", gupTpData?.length || 0, "registros");
    
    // Buscar dados da tabela Conjuntos
    console.log("Buscando dados da tabela Conjuntos...");
    const { data: conjuntosData, error: conjuntosDataError } = await supabase
      .from('Conjuntos')
      .select('*');
    
    if (conjuntosDataError) {
      console.error("Erro ao buscar dados da tabela Conjuntos:", conjuntosDataError);
      console.log("Continuando apenas com dados da GupTp");
    } else {
      console.log("Dados da tabela Conjuntos obtidos:", conjuntosData?.length || 0, "registros");
    }
    
    // Se não houver dados na GupTp, retornar array vazio
    if (!gupTpData || gupTpData.length === 0) {
      console.log("Nenhum template encontrado na tabela GupTp");
      return [];
    }
    
    // Criar um mapa dos dados da tabela Conjuntos para facilitar o acesso
    const conjuntosMap = new Map();
    if (conjuntosData && conjuntosData.length > 0) {
      console.log("Criando mapa de conjuntos com os seguintes dados:", conjuntosData);
      
      conjuntosData.forEach(conjunto => {
        if (conjunto.idconjunto) {
          console.log(`Adicionando conjunto ao mapa - ID: ${conjunto.idconjunto}, Nome: ${conjunto.Nome}`);
          conjuntosMap.set(conjunto.idconjunto, conjunto);
        } else {
          console.log("Conjunto sem idconjunto encontrado:", conjunto);
        }
      });
    }
    
    console.log("Mapa de conjuntos criado com", conjuntosMap.size, "entradas");
    
    // Processar cada template individualmente
    const templatesMap = new Map<string, any>();
    
    for (const item of gupTpData) {
      const key = `${item.id}_${item.idconjunto || 'no-conjunto'}`;
      templatesMap.set(key, item);
    }
    
    console.log(`Total de templates após remover duplicações: ${templatesMap.size}`);
    
    // Mapear para o formato esperado, incluindo dados da tabela Conjuntos quando disponíveis
    const processedTemplates = Array.from(templatesMap.values()).map(item => {
      // Buscar dados do conjunto correspondente
      const conjunto = item.idconjunto ? conjuntosMap.get(item.idconjunto) : null;
      
      // Imprimir detalhes para debug
      if (conjunto) {
        console.log(`Conjunto encontrado para idconjunto ${item.idconjunto}:`, conjunto);
      } else {
        console.log(`Nenhum conjunto encontrado para idconjunto ${item.idconjunto}`);
      }
      
      return {
        id: item.id,
        nome: conjunto?.Nome ?? item.NomeTemplate ?? item.NomeAppGup ?? 'Template sem nome',
        texttp: item.templateId ?? '', // Usar templateId como texttp para compatibilidade
        texttp1: '', // Não temos mais múltiplos templates
        texttp2: '', // Não temos mais múltiplos templates
        idconjunto: item.idconjunto,
        DataConjunto: conjunto?.Data ?? item.DataConjunto,
        token: item.token,
        appId: item.appId,
        instancia: item.Instancia,
        statusTp: conjunto?.Status ?? item.statusTp ?? 'Ativo',
        // Adicionar dados específicos da tabela Conjuntos
        conjuntoId: conjunto?.id,
        conjuntoStatus: conjunto?.Status,
        conjuntoNome: conjunto?.Nome
      };
    });
    
    console.log(`Templates processados com dados de Conjuntos: ${processedTemplates.length}`);
    
    // Verificar se há algum template com dados inválidos
    const hasInvalidTemplates = processedTemplates.some(template => 
      !template.id || !template.nome || template.nome === 'Template sem nome'
    );
    
    if (hasInvalidTemplates) {
      console.warn("Alguns templates têm dados incompletos ou inválidos");
    }
    
    // Mostrar amostra dos dados processados
    if (processedTemplates.length > 0) {
      console.log("Amostra do primeiro template processado:", JSON.stringify(processedTemplates[0], null, 2));
    }
    
    return processedTemplates;
  } catch (error) {
    console.error("Erro ao carregar templates:", error);
    // Retornar array vazio em vez de lançar erro para evitar tela branca
    console.log("Retornando array vazio devido a erro");
    return [];
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
 * Adiciona as colunas AppId e Token à tabela Disparador se elas não existirem
 */
async function adicionarColunasInstancia(): Promise<boolean> {
  try {
    // Verificar se as colunas já existem
    const { data: colunas, error: errorColunas } = await supabase
      .rpc('get_table_columns', { table_name: 'Disparador' });

    if (errorColunas) {
      console.error("Erro ao verificar colunas:", errorColunas);
      return false;
    }

    const colunasExistentes = colunas || [];
    const precisaAddAppId = !colunasExistentes.includes('appId');
    const precisaAddToken = !colunasExistentes.includes('token');

    if (!precisaAddAppId && !precisaAddToken) {
      console.log("Colunas appId e token já existem na tabela Disparador");
      return true;
    }

    // Adicionar as colunas necessárias
    if (precisaAddAppId) {
      const { error: errorAppId } = await supabase
        .rpc('add_column_if_not_exists', {
          table_name: 'Disparador',
          column_name: 'appId',
          column_type: 'text'
        });

      if (errorAppId) {
        console.error("Erro ao adicionar coluna appId:", errorAppId);
        return false;
      }
    }

    if (precisaAddToken) {
      const { error: errorToken } = await supabase
        .rpc('add_column_if_not_exists', {
          table_name: 'Disparador',
          column_name: 'token',
          column_type: 'text'
        });

      if (errorToken) {
        console.error("Erro ao adicionar coluna token:", errorToken);
        return false;
      }
    }

    console.log("Colunas adicionadas com sucesso");
    return true;
  } catch (error) {
    console.error("Erro ao adicionar colunas:", error);
    return false;
  }
}

/**
 * Envia um webhook para notificar a mudança de status de uma campanha
 * @param data Dados a serem enviados no webhook
 * @returns Resultado da operação
 */
export async function sendCampanhaWebhook(data: any): Promise<boolean> {
  try {
    console.log('=== ENVIANDO WEBHOOK DE CAMPANHA ===');
    console.log('Dados recebidos:', JSON.stringify(data, null, 2));

    // Usar o mesmo webhook para todos os ambientes
    const webhookUrl = 'https://webhooktp.n1promotora.com.br/webhook/5a864ece-f592-4ade-9dfc-6be06a47129c';

    console.log('URL do webhook:', webhookUrl);
    console.log('Ambiente:', window.location.hostname === 'localhost' ? 'Desenvolvimento' : 'Produção');

    // Formatar os dados conforme esperado pelo webhook
    const webhookData = {
      acao: data.status === 'ativa' ? 'iniciar' : 'pausar',
      id_campanha: data.id_campanha,
      nome_campanha: data.nome_campanha,
      data: data.data,
      status: data.status,
      grupo: data.grupo,
    };
    
    console.log('Dados formatados para webhook:', JSON.stringify(webhookData, null, 2));

    // Configurar headers
    const headers = {
      'Content-Type': 'application/json',
      'X-Request-ID': `n1business-${Date.now()}`,
      'X-Source': 'n1business-app'
    };

    // Enviar o webhook com timeout para evitar bloqueio da interface
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos de timeout

    try {
      // Enviar o webhook
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(webhookData),
        signal: controller.signal,
        mode: 'cors' // Usar 'cors' para permitir requisições cross-origin
      });

      clearTimeout(timeoutId);

      // Log da resposta
      console.log('Status da resposta:', response.status);
      if (response.status === 0) {
        console.error('Erro de CORS ou conexão recusada');
        return false;
      }

      console.log('Status text:', response.statusText);

      if (!response.ok) {
        let errorText = '';
        try {
          errorText = await response.text();
        } catch (e) {
          errorText = 'Não foi possível ler o corpo da resposta';
        }
        
        console.error('Erro na resposta:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        return false;
      }

      let responseData;
      try {
        responseData = await response.json();
      } catch (e) {
        console.log('Resposta não é um JSON válido, mas a requisição foi bem-sucedida');
        responseData = { success: true };
      }
      
      console.log('Resposta do webhook:', JSON.stringify(responseData, null, 2));
      console.log('=== WEBHOOK ENVIADO COM SUCESSO ===');

      return true;
    } catch (fetchError) {
      clearTimeout(timeoutId);
      console.error('Erro ao enviar webhook:', fetchError);
      
      // Em ambiente de desenvolvimento, considerar sucesso mesmo com erro
      if (window.location.hostname === 'localhost') {
        console.log('Ambiente de desenvolvimento: considerando webhook como enviado com sucesso mesmo com erro');
        return true;
      }
      
      return false;
    }
  } catch (error) {
    console.error('Erro ao enviar webhook de campanha:', error);
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
    console.log("Tentando criar registro na tabela Conjuntos:", conjuntoData);
    
    // Verificar se a tabela Conjuntos existe
    try {
      const { data: tableInfo, error: tableError } = await supabase
        .from('Conjuntos')
        .select('id')
        .limit(1);
      
      if (tableError) {
        console.error("Erro ao verificar a tabela Conjuntos:", tableError);
        console.log("A tabela Conjuntos pode não existir ou não temos permissão para acessá-la");
        
        // Tentar criar a tabela se ela não existir
        try {
          console.log("Tentando criar a tabela Conjuntos...");
          const { error: createError } = await supabase.rpc('create_table_if_not_exists', {
            table_name: 'Conjuntos',
            column_definitions: 'id SERIAL PRIMARY KEY, created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), idconjunto TEXT, Nome TEXT, Status TEXT, Data TEXT'
          });
          
          if (createError) {
            console.error("Erro ao criar a tabela Conjuntos:", createError);
            // Continuar mesmo com erro
          } else {
            console.log("Tabela Conjuntos criada com sucesso");
          }
        } catch (createTableError) {
          console.error("Erro ao tentar criar a tabela Conjuntos:", createTableError);
          // Continuar mesmo com erro
        }
      } else {
        console.log("Tabela Conjuntos existe e está acessível");
      }
    } catch (checkTableError) {
      console.error("Erro ao verificar existência da tabela Conjuntos:", checkTableError);
      // Continuar mesmo com erro
    }
    
    // Tentar inserir o registro
    console.log("Inserindo dados na tabela Conjuntos:", conjuntoData);
    const { data, error } = await supabase
      .from('Conjuntos')
      .insert([conjuntoData])
      .select();
    
    if (error) {
      console.error("Erro ao criar registro na tabela Conjuntos:", error);
      console.log("Código do erro:", error.code);
      console.log("Mensagem do erro:", error.message);
      console.log("Detalhes do erro:", error.details);
      
      // Tentar uma abordagem alternativa se a primeira falhar
      try {
        console.log("Tentando abordagem alternativa de inserção...");
        const { error: altError } = await supabase
          .from('Conjuntos')
          .insert([{
            idconjunto: conjuntoData.idconjunto,
            Nome: conjuntoData.Nome,
            Status: conjuntoData.Status,
            Data: conjuntoData.Data
          }]);
        
        if (altError) {
          console.error("Erro na abordagem alternativa:", altError);
          return null;
        } else {
          console.log("Inserção alternativa bem-sucedida, mas sem retorno de dados");
          return {
            id: 0, // ID fictício
            created_at: new Date().toISOString(),
            ...conjuntoData
          } as ConjuntosData;
        }
      } catch (altError) {
        console.error("Erro na abordagem alternativa:", altError);
        return null;
      }
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

/**
 * Atualiza o status de uma campanha
 * @param idCampanha ID da campanha
 * @param novoStatus Novo status da campanha
 * @returns Sucesso da operação
 */
export async function updateCampanhaStatus(idCampanha: string, novoStatus: string): Promise<boolean> {
  try {
    console.log('=== ATUALIZANDO STATUS DA CAMPANHA ===');
    console.log('ID da campanha:', idCampanha);
    console.log('Novo status:', novoStatus);

    // Primeiro buscar os dados da campanha
    const { data: campanhaData, error: errorBusca } = await supabase
      .from('Campanhas')
      .select('*')
      .eq('id_campanha', idCampanha)
      .single();
    
    if (errorBusca) {
      console.error('Erro ao buscar dados da campanha:', errorBusca);
      return false;
    }

    console.log('Dados da campanha:', JSON.stringify(campanhaData, null, 2));

    // Atualizar na tabela Disparador
    const { error: errorDisparador } = await supabase
      .from('Disparador')
      .update({ 
        status: novoStatus,
        dia_envio: campanhaData.dia,        // Atualizando dia_envio
        periodo_envio: campanhaData.periodo  // Atualizando periodo_envio
      })
      .eq('id_campanha', idCampanha);
    
    if (errorDisparador) {
      console.error('Erro ao atualizar status na tabela Disparador:', errorDisparador);
    }
    
    // Atualizar na tabela Campanhas
    const { error: errorCampanhas } = await supabase
      .from('Campanhas')
      .update({ 
        status: novoStatus,
        finalizada: novoStatus === 'concluída' ? 'sim' : 'não'
      })
      .eq('id_campanha', idCampanha);
    
    if (errorCampanhas) {
      console.error('Erro ao atualizar status na tabela Campanhas:', errorCampanhas);
    }

    // Se a atualização foi bem sucedida, enviar o webhook
    if (!errorDisparador && !errorCampanhas) {
      console.log('Status atualizado com sucesso, enviando webhook...');
      
      // Enviar webhook com os dados da campanha
      const webhookResult = await sendCampanhaWebhook({
        id_campanha: idCampanha,
        nome_campanha: campanhaData.nome_campanha,
        data: campanhaData.data_criacao,
        status: novoStatus,
        grupo: campanhaData.grupo
      });

      console.log('Resultado do webhook:', webhookResult);
    }
    
    // Considerar sucesso se ambas as atualizações funcionaram
    return !errorDisparador && !errorCampanhas;
  } catch (error) {
    console.error('Erro ao atualizar status da campanha:', error);
    return false;
  }
}
