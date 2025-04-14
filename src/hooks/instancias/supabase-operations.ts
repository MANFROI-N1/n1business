import { supabase } from "@/lib/supabase";
import { GupTpData, NewInstanceFormData, WhatsAppTemplateData } from "@/types/instancia";
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
    dia: string; 
    periodo: string; 
    id_campanha: string; 
    data_criacao: string 
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
    
    // Salvar os dados da campanha na tabela Campanhas
    console.log("Salvando dados da campanha na tabela Campanhas...");
    const { error: campanhaError } = await supabase
      .from('Campanhas')
      .insert([{
        nome_campanha: campanhaData.nome,
        status: 'pendente', // Usando lowercase para manter consistência
        id_campanha: campanhaData.id_campanha,
        dataCriacao: campanhaData.data_criacao,
        finalizada: 'false',
        Dia: campanhaData.dia,
        Periodo: campanhaData.periodo
      }]);

    if (campanhaError) {
      console.error("Erro ao salvar campanha:", campanhaError);
      return {
        success: false,
        message: `Erro ao salvar campanha: ${campanhaError.message}`
      };
    } else {
      console.log("Campanha salva com sucesso na tabela Campanhas");
    }

    // Gerar um novo idconjunto para esta campanha
    const novoIdConjunto = uuidv4();
    console.log("Novo idconjunto gerado:", novoIdConjunto);
    
    // Buscar instâncias configuradas para o dia e período específicos
    console.log(`Buscando instâncias para Dia "${campanhaData.dia}" e Periodo "${campanhaData.periodo}"...`);
    
    if (updateStatus) {
      updateStatus(`Buscando instâncias para Dia "${campanhaData.dia}" e Periodo "${campanhaData.periodo}"...`);
    }
    
    let instancias = [];
    
    try {
      // Buscar instâncias configuradas para o dia e período específicos na tabela GupTp
      console.log(`Buscando instâncias para Dia "${campanhaData.dia}" e Periodo "${campanhaData.periodo}"...`);
      
      // Normalizar o período para comparação (remover acentos e converter para minúsculas)
      const normalizePeriodo = (periodo) => {
        return periodo
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, ""); // Remove acentos
      };
      
      const periodoNormalizado = normalizePeriodo(campanhaData.periodo);
      console.log(`Período normalizado para busca: "${periodoNormalizado}"`);
      
      // Usar a consulta SQL direta para buscar as instâncias pelo dia
      const { data: instanciasDia, error: instanciasError } = await supabase
        .from('GupTp')
        .select('*')
        .eq('Dia', campanhaData.dia);
      
      if (instanciasError) {
        console.error("Erro ao buscar instâncias:", instanciasError);
      } else if (instanciasDia && instanciasDia.length > 0) {
        // Log de todas as instâncias encontradas para o dia
        console.log(`Encontradas ${instanciasDia.length} instâncias para o Dia ${campanhaData.dia}`);
        
        // Filtrar apenas as instâncias com o período correto
        const instanciasFiltradas = instanciasDia.filter(inst => {
          // Normalizar o período da instância
          const instPeriodoNormalizado = inst.Periodo ? normalizePeriodo(inst.Periodo) : "";
          
          // Verificar se o período normalizado da instância é "manha"
          const periodoMatch = instPeriodoNormalizado === "manha";
          
          console.log(`Instância ${inst.Instancia}: Periodo=${inst.Periodo}, Normalizado=${instPeriodoNormalizado}, Match=${periodoMatch}`);
          
          return periodoMatch;
        });
        
        console.log(`Filtradas ${instanciasFiltradas.length} instâncias com Periodo="Manha"`);
        
        if (instanciasFiltradas.length > 0) {
          // Mapear as instâncias para o formato esperado
          instancias = instanciasFiltradas.map(inst => ({
            id: inst.id,
            instancia: inst.Instancia,
            nome: inst.NomeAppGup || 'Sem nome',
            appId: inst.appId || '',
            token: inst.token || ''
          }));
          
          console.log(`Mapeadas ${instancias.length} instâncias para distribuição`);
          console.log("Instâncias para distribuição:", instancias);
          
          if (updateStatus) {
            updateStatus(`Encontradas ${instancias.length} instâncias para Dia ${campanhaData.dia} e Periodo Manha`);
          }
        } else {
          console.warn(`Nenhuma instância encontrada para Dia ${campanhaData.dia} e Periodo Manha após filtragem`);
        }
      } else {
        console.warn(`Nenhuma instância encontrada para o dia ${campanhaData.dia}`);
      }
    } catch (error) {
      console.error("Erro ao buscar instâncias:", error);
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
          nome: "Instância Padrão",
          appId: "",  // AppId padrão vazio
          token: ""   // Token padrão vazio
        }
      ];
    }
    
    // Processar os contatos em lotes de 800 por instância
    const CONTACTS_PER_INSTANCE = 800;
    let sucessos = 0;
    let falhas = 0;

    // Distribuir os contatos entre as instâncias disponíveis
    if (updateStatus) {
      updateStatus(`Distribuindo ${contatos.length} contatos entre ${instancias.length} instâncias disponíveis...`);
    }

    // Verificar se temos instâncias suficientes para todos os contatos
    if (instancias.length === 0) {
      throw new Error("Nenhuma instância disponível para processar os contatos");
    }

    // Calcular quantos grupos de 800 contatos precisamos
    const totalGrupos = Math.ceil(contatos.length / CONTACTS_PER_INSTANCE);
    console.log(`Total de grupos de ${CONTACTS_PER_INSTANCE} contatos: ${totalGrupos}`);

    // Verificar se temos instâncias suficientes para todos os grupos
    if (totalGrupos > instancias.length) {
      console.warn(`Atenção: Temos mais grupos (${totalGrupos}) do que instâncias (${instancias.length}). Algumas instâncias receberão mais de um grupo.`);
    }

    // Inicializar o objeto para armazenar contatos por instância
    const contatosPorInstancia = {};
    instancias.forEach(inst => {
      contatosPorInstancia[inst.instancia] = [];
    });

    // Distribuir os contatos em grupos de 800 para cada instância
    let currentInstanceIndex = 0;
    let currentInstanceCount = 0;
    
    // Processar cada contato
    contatos.forEach((contato, index) => {
      // Se a instância atual já tem 800 contatos, passar para a próxima
      if (currentInstanceCount >= CONTACTS_PER_INSTANCE) {
        currentInstanceIndex = (currentInstanceIndex + 1) % instancias.length;
        currentInstanceCount = 0;
        console.log(`Contato ${index}: Mudando para próxima instância: ${instancias[currentInstanceIndex].instancia}`);
      }
      
      // Obter a instância atual
      const instancia = instancias[currentInstanceIndex];
      
      // Processar o contato
      const contatoProcessado = {
        Nome: contato.Nome || '',
        Whatsapp: contato.Whatsapp || '',
        Cpf: contato.Cpf || '',
        Instancia: instancia.instancia,
        appId: instancia.appId,      // Usando o nome correto do campo
        token: instancia.token,      // Usando o nome correto do campo
        Disparador: 'false',
        nome_campanha: campanhaData.nome,
        status: 'pendente',          // Usando lowercase para manter consistência
        id_campanha: campanhaData.id_campanha,
        dataCriacao: campanhaData.data_criacao,
        dia_envio: campanhaData.dia,
        periodo_envio: campanhaData.periodo
      };
      
      // Adicionar o contato ao array da instância atual
      contatosPorInstancia[instancia.instancia].push(contatoProcessado);
      currentInstanceCount++;
      
      // Log a cada 100 contatos
      if (index % 100 === 0) {
        console.log(`Processado contato ${index}: Instância ${instancia.instancia}, Count ${currentInstanceCount}`);
      }
    });

    // Log do resultado da distribuição
    Object.entries(contatosPorInstancia).forEach(([instancia, contatosInst]) => {
      if (Array.isArray(contatosInst)) {
        console.log(`Instância ${instancia}: ${contatosInst.length} contatos`);
      }
    });
    
    // Processar cada instância separadamente
    for (const [instancia, contatosInstancia] of Object.entries(contatosPorInstancia)) {
      // Garantir que contatosInstancia é um array antes de continuar
      if (!Array.isArray(contatosInstancia)) {
        console.error(`Instância ${instancia} não tem um array de contatos válido`);
        continue;
      }
      
      console.log(`Processando instância ${instancia} com ${contatosInstancia.length} contatos...`);

      // Dividir em lotes menores para inserção
      const BATCH_SIZE = 100;
      for (let i = 0; i < contatosInstancia.length; i += BATCH_SIZE) {
        const lote = contatosInstancia.slice(i, i + BATCH_SIZE);
        console.log(`Inserindo lote ${Math.floor(i/BATCH_SIZE) + 1} de ${Math.ceil(contatosInstancia.length/BATCH_SIZE)} para instância ${instancia}`);
        
        // Log do primeiro contato do lote para debug
        console.log('Exemplo de contato do lote:', lote[0]);

        try {
          const { error: insertError } = await supabase
            .from('Disparador')
            .insert(lote)
            .select();

          if (insertError) {
            console.error(`Erro ao inserir lote ${Math.floor(i/BATCH_SIZE) + 1}:`, insertError);
            falhas += lote.length;
          } else {
            sucessos += lote.length;
            console.log(`Lote ${Math.floor(i/BATCH_SIZE) + 1} inserido com sucesso`);
          }
        } catch (error) {
          console.error(`Erro ao processar lote ${Math.floor(i/BATCH_SIZE) + 1}:`, error);
          falhas += lote.length;
        }
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
      DataConjunto: brazilianDate
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
        Data: brazilianDate
      };
      
      const createdConjunto = await createConjuntoRecord(conjuntoRecord);
      
      if (createdConjunto) {
        console.log("Registro criado com sucesso na tabela Conjuntos:", createdConjunto);
        conjuntoId = createdConjunto.id;
      } else {
        console.error("Falha ao criar registro na tabela Conjuntos");
      }
    } catch (conjuntoErr) {
      console.error("Erro ao criar registro na tabela Conjuntos:", conjuntoErr);
    }
    
    // Enviar webhook para notificar a criação do template
    try {
      const webhookData = {
        template: "ativar",
        idconjunto: idconjunto,
        nome: nomeConjunto,
        data: brazilianDate,
        id: conjuntoId?.toString() || idconjunto
      };
      
      console.log("Enviando webhook com os dados:", webhookData);
      const webhookResult = await sendTemplateWebhook(webhookData);
      
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

    // URL do webhook - em desenvolvimento usa o proxy, em produção vai direto
    const webhookUrl = window.location.hostname === 'localhost'
      ? '/api/webhook-proxy'  // Vai usar o proxy configurado no Vite
      : 'https://webhooktp.n1promotora.com.br/webhook/campanha';

    console.log('URL do webhook:', webhookUrl);

    // Formatar os dados conforme esperado pelo webhook
    const webhookData = {
      acao: data.status === 'ativa' ? 'iniciar' : 'pausar',
      id_campanha: data.id_campanha,
      nome_campanha: data.nome_campanha,
      data: data.data,
      status: data.status,
      dia_envio: data.dia_envio || '',
      periodo_envio: data.periodo_envio || ''
    };

    console.log('Dados formatados para webhook:', JSON.stringify(webhookData, null, 2));

    // Configurar headers
    const headers = {
      'Content-Type': 'application/json',
      'X-Request-ID': `n1business-${Date.now()}`,
      'X-Source': 'n1business-app'
    };

    // Enviar o webhook
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(webhookData)
    });

    // Log da resposta
    console.log('Status da resposta:', response.status);
    if (response.status === 0) {
      console.error('Erro de CORS ou conexão recusada');
      return false;
    }

    console.log('Status text:', response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erro na resposta:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      return false;
    }

    const responseData = await response.json();
    console.log('Resposta do webhook:', JSON.stringify(responseData, null, 2));
    console.log('=== WEBHOOK ENVIADO COM SUCESSO ===');

    return true;
  } catch (error) {
    console.error('Erro ao enviar webhook de campanha:', error);
    return false;
  }
}

/**
 * Atualiza o status de uma campanha
 * @param id ID da campanha
 * @param status Novo status da campanha
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
        data: campanhaData.dataCriacao,
        status: novoStatus,
        dia_envio: campanhaData.dia,        // Passando o campo correto
        periodo_envio: campanhaData.periodo  // Passando o campo correto
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
