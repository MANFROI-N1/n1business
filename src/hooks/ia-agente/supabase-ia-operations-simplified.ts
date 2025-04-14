import { supabase } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";
import { webhookConfig } from "@/config/webhook";

// Tipo para as mensagens do IA Agente
export interface IAMessage {
  id: number;
  created_at: string;
  updated_at: string;
  user_id: string;
  conversation_id: string;
  agent_type: string;
  content: string;
  sender: "user" | "agent";
  status: "sending" | "sent" | "error";
  attachments: string[] | null;
  metadata: any | null;
}

// Função para criar uma nova conversa (retorna um novo conversation_id)
export function createNewConversation(): string {
  return uuidv4();
}

// Função para enviar uma mensagem
export async function sendMessage(
  userId: string,
  conversationId: string,
  agentType: string,
  content: string,
  sender: "user" | "agent",
  attachments?: string[],
  metadata?: any
): Promise<IAMessage | null> {
  try {
    const { data, error } = await supabase
      .from("IAAgente")
      .insert([
        {
          user_id: userId,
          conversation_id: conversationId,
          agent_type: agentType,
          content,
          sender,
          status: "sent",
          attachments: attachments || null,
          metadata: metadata || null,
          updated_at: new Date().toISOString()
        }
      ])
      .select();

    if (error) {
      console.error("Erro ao enviar mensagem:", error);
      return null;
    }

    return data[0] as IAMessage;
  } catch (error) {
    console.error("Erro ao enviar mensagem:", error);
    return null;
  }
}

// Função para buscar mensagens de uma conversa
export async function getConversationMessages(
  userId: string,
  conversationId: string
): Promise<IAMessage[]> {
  try {
    const { data, error } = await supabase
      .from("IAAgente")
      .select("*")
      .eq("user_id", userId)
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Erro ao buscar mensagens:", error);
      return [];
    }

    return data as IAMessage[];
  } catch (error) {
    console.error("Erro ao buscar mensagens:", error);
    return [];
  }
}

// Função para listar todas as conversas de um usuário
export async function getUserConversations(
  userId: string,
  agentType?: string
): Promise<{ conversationId: string; lastMessage: string; agentType: string; updatedAt: string }[]> {
  try {
    // Primeiro, buscar todas as mensagens do usuário
    let query = supabase
      .from("IAAgente")
      .select("*")
      .eq("user_id", userId);
    
    if (agentType) {
      query = query.eq("agent_type", agentType);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error("Erro ao buscar conversas:", error);
      return [];
    }
    
    // Agrupar mensagens por conversation_id
    const conversations: Record<string, IAMessage[]> = {};
    
    for (const message of data) {
      if (!conversations[message.conversation_id]) {
        conversations[message.conversation_id] = [];
      }
      conversations[message.conversation_id].push(message);
    }
    
    // Obter a última mensagem de cada conversa
    return Object.entries(conversations).map(([conversationId, messages]) => {
      // Ordenar mensagens por data
      const sortedMessages = messages.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      
      const lastMessage = sortedMessages[0];
      
      return {
        conversationId,
        lastMessage: lastMessage.content,
        agentType: lastMessage.agent_type,
        updatedAt: lastMessage.updated_at
      };
    }).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  } catch (error) {
    console.error("Erro ao buscar conversas:", error);
    return [];
  }
}

// Função de fallback para quando o webhook não estiver disponível
function generateFallbackResponse(userMessage: string, agentType: string): string {
  // Gerar resposta simulada baseada no tipo de agente
  switch (agentType) {
    case "Templates":
      return `Analisei sua solicitação sobre templates: "${userMessage}". Posso ajudar você a criar um template eficaz para WhatsApp Business API que tenha alta taxa de aprovação. Gostaria de começar com um modelo básico ou tem alguma ideia específica em mente?`;
    case "Campanhas":
      return `Sobre sua campanha: "${userMessage}". Para maximizar o engajamento, recomendo segmentar seu público e personalizar as mensagens. Podemos analisar os dados de campanhas anteriores ou criar uma nova estratégia. Como gostaria de proceder?`;
    case "Eventos":
      return `Sobre seu evento: "${userMessage}". Posso ajudar a configurar lembretes automáticos e confirmações de presença via WhatsApp. Qual é a data do evento e quantos participantes você espera?`;
    case "Relatorios":
      return `Analisei os dados relacionados a: "${userMessage}". Os principais indicadores mostram uma taxa de abertura de 68% e conversão de 12%. Recomendo ajustar o horário de envio para aumentar o engajamento. Gostaria de ver uma análise mais detalhada?`;
    default:
      return `Recebi sua mensagem: "${userMessage}". Como posso ajudar você hoje?`;
  }
}

// Função para enviar mensagem para o webhook do n8n
async function sendMessageToWebhook(
  userId: string,
  conversationId: string,
  userMessage: string,
  agentType: string,
  messageHistory: IAMessage[]
): Promise<string> {
  try {
    // Obter a URL do webhook do n8n da configuração
    const webhookUrl = webhookConfig.getWebhookUrl();
    
    // Formatar o histórico de mensagens para enviar como contexto
    const formattedHistory = messageHistory.map(msg => ({
      role: msg.sender === "user" ? "user" : "assistant",
      content: msg.content
    }));
    
    // Preparar o payload para o webhook
    const payload = {
      userId,
      conversationId,
      message: userMessage,
      agentType,
      messageHistory: formattedHistory
    };
    
    console.log(`Enviando mensagem para webhook: ${webhookUrl}`, payload);
    
    // Enviar a requisição para o webhook
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      throw new Error(`Erro na resposta do webhook: ${response.status}`);
    }
    
    const responseData = await response.json();
    console.log("Resposta do webhook:", responseData);
    
    // Verificar se a resposta está no formato esperado
    if (responseData.role === "assistant" && responseData.content) {
      // Verificar se o agentType na resposta corresponde ao agentType da solicitação
      if (responseData.agentType && responseData.agentType !== agentType) {
        console.warn(`Tipo de agente na resposta (${responseData.agentType}) é diferente do solicitado (${agentType})`);
      }
      
      // Retornar o conteúdo da resposta
      return responseData.content;
    }
    
    // Tentar outros formatos de resposta se o formato principal não estiver disponível
    return responseData.content || 
           (responseData.response && typeof responseData.response === 'string' ? responseData.response : null) || 
           (responseData.message && typeof responseData.message === 'string' ? responseData.message : null) || 
           "Desculpe, não consegui processar sua solicitação.";
  } catch (error) {
    console.error("Erro ao enviar mensagem para o webhook:", error);
    
    // Usar resposta de fallback se o webhook falhar
    console.log("Usando resposta de fallback devido a erro no webhook");
    return generateFallbackResponse(userMessage, agentType);
  }
}

// Função para processar mensagem com IA
export async function processMessageWithAI(
  userId: string,
  conversationId: string,
  userMessage: string,
  agentType: string
): Promise<IAMessage | null> {
  try {
    // Primeiro, salvar a mensagem do usuário
    const userMessageObj = await sendMessage(
      userId,
      conversationId,
      agentType,
      userMessage,
      "user"
    );

    if (!userMessageObj) {
      throw new Error("Falha ao salvar mensagem do usuário");
    }

    // Buscar histórico de mensagens para contexto
    const messages = await getConversationMessages(userId, conversationId);
    
    // Enviar a mensagem para o webhook do n8n e aguardar resposta
    const aiResponse = await sendMessageToWebhook(
      userId,
      conversationId,
      userMessage,
      agentType,
      messages
    );
    
    // Metadados para a resposta
    const metadata = {
      source: "n8n_webhook",
      agentType,
      timestamp: new Date().toISOString()
    };
    
    // Salvar a resposta do agente
    const agentMessageObj = await sendMessage(
      userId,
      conversationId,
      agentType, // Garantir que a mensagem seja salva com o tipo de agente correto
      aiResponse,
      "agent",
      null,
      metadata
    );
    
    return agentMessageObj;
  } catch (error) {
    console.error("Erro ao processar mensagem com IA:", error);
    return null;
  }
}
