import { supabase } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";

// Tipos para as entidades
export interface IAConversation {
  id: number;
  created_at: string;
  updated_at: string;
  user_id: string;
  agent_type: string;
  title: string | null;
  status: string;
  metadata: any | null;
}

export interface IAMessage {
  id: number;
  created_at: string;
  conversation_id: number;
  content: string;
  sender: "user" | "agent";
  status: "sending" | "sent" | "error";
  attachments: string[] | null;
  metadata: any | null;
}

export interface IAAgentSettings {
  id: number;
  created_at: string;
  updated_at: string;
  agent_type: string;
  model: string;
  system_prompt: string;
  temperature: number;
  max_tokens: number;
  enabled: boolean;
  metadata: any | null;
}

export interface IAAgentAction {
  id: number;
  created_at: string;
  message_id: number;
  action_type: string;
  status: string;
  result: any | null;
  metadata: any | null;
}

// Funções para gerenciar conversas
export async function createConversation(
  userId: string,
  agentType: string,
  title?: string
): Promise<IAConversation | null> {
  try {
    const { data, error } = await supabase
      .from("IAConversations")
      .insert([
        {
          user_id: userId,
          agent_type: agentType,
          title: title || `Nova conversa com ${agentType}`,
          status: "active"
        }
      ])
      .select();

    if (error) {
      console.error("Erro ao criar conversa:", error);
      return null;
    }

    return data[0] as IAConversation;
  } catch (error) {
    console.error("Erro ao criar conversa:", error);
    return null;
  }
}

export async function getConversations(
  userId: string,
  agentType?: string
): Promise<IAConversation[]> {
  try {
    let query = supabase
      .from("IAConversations")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });

    if (agentType) {
      query = query.eq("agent_type", agentType);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Erro ao buscar conversas:", error);
      return [];
    }

    return data as IAConversation[];
  } catch (error) {
    console.error("Erro ao buscar conversas:", error);
    return [];
  }
}

export async function getConversationById(
  conversationId: number
): Promise<IAConversation | null> {
  try {
    const { data, error } = await supabase
      .from("IAConversations")
      .select("*")
      .eq("id", conversationId)
      .single();

    if (error) {
      console.error("Erro ao buscar conversa:", error);
      return null;
    }

    return data as IAConversation;
  } catch (error) {
    console.error("Erro ao buscar conversa:", error);
    return null;
  }
}

export async function updateConversationStatus(
  conversationId: number,
  status: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("IAConversations")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", conversationId);

    if (error) {
      console.error("Erro ao atualizar status da conversa:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Erro ao atualizar status da conversa:", error);
    return false;
  }
}

// Funções para gerenciar mensagens
export async function createMessage(
  conversationId: number,
  content: string,
  sender: "user" | "agent",
  attachments?: string[]
): Promise<IAMessage | null> {
  try {
    // Atualizar o timestamp da conversa
    await supabase
      .from("IAConversations")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", conversationId);

    // Criar a mensagem
    const { data, error } = await supabase
      .from("IAMessages")
      .insert([
        {
          conversation_id: conversationId,
          content,
          sender,
          status: "sent",
          attachments: attachments || null
        }
      ])
      .select();

    if (error) {
      console.error("Erro ao criar mensagem:", error);
      return null;
    }

    return data[0] as IAMessage;
  } catch (error) {
    console.error("Erro ao criar mensagem:", error);
    return null;
  }
}

export async function getMessagesByConversation(
  conversationId: number
): Promise<IAMessage[]> {
  try {
    const { data, error } = await supabase
      .from("IAMessages")
      .select("*")
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

// Funções para gerenciar configurações de agentes
export async function getAgentSettings(
  agentType: string
): Promise<IAAgentSettings | null> {
  try {
    const { data, error } = await supabase
      .from("IAAgentSettings")
      .select("*")
      .eq("agent_type", agentType)
      .single();

    if (error) {
      console.error("Erro ao buscar configurações do agente:", error);
      return null;
    }

    return data as IAAgentSettings;
  } catch (error) {
    console.error("Erro ao buscar configurações do agente:", error);
    return null;
  }
}

// Funções para gerenciar ações dos agentes
export async function createAgentAction(
  messageId: number,
  actionType: string,
  metadata?: any
): Promise<IAAgentAction | null> {
  try {
    const { data, error } = await supabase
      .from("IAAgentActions")
      .insert([
        {
          message_id: messageId,
          action_type: actionType,
          status: "pending",
          metadata: metadata || null
        }
      ])
      .select();

    if (error) {
      console.error("Erro ao criar ação do agente:", error);
      return null;
    }

    return data[0] as IAAgentAction;
  } catch (error) {
    console.error("Erro ao criar ação do agente:", error);
    return null;
  }
}

export async function updateAgentActionStatus(
  actionId: number,
  status: string,
  result?: any
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("IAAgentActions")
      .update({ 
        status, 
        result: result || null 
      })
      .eq("id", actionId);

    if (error) {
      console.error("Erro ao atualizar status da ação:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Erro ao atualizar status da ação:", error);
    return false;
  }
}

// Função para processar mensagem com IA
export async function processMessageWithAI(
  conversationId: number,
  userMessage: string,
  agentType: string
): Promise<IAMessage | null> {
  try {
    // Primeiro, salvar a mensagem do usuário
    const userMessageObj = await createMessage(
      conversationId,
      userMessage,
      "user"
    );

    if (!userMessageObj) {
      throw new Error("Falha ao salvar mensagem do usuário");
    }

    // Buscar configurações do agente
    const settings = await getAgentSettings(agentType);
    
    if (!settings) {
      throw new Error(`Configurações do agente ${agentType} não encontradas`);
    }

    // Buscar histórico de mensagens para contexto
    const messages = await getMessagesByConversation(conversationId);
    
    // Aqui você integraria com a API de IA (OpenAI, etc.)
    // Por enquanto, vamos simular uma resposta
    
    // Simular processamento
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Gerar resposta simulada baseada no tipo de agente
    let aiResponse = "";
    
    switch (agentType) {
      case "Templates":
        aiResponse = `Analisei sua solicitação sobre templates: "${userMessage}". Posso ajudar você a criar um template eficaz para WhatsApp Business API que tenha alta taxa de aprovação. Gostaria de começar com um modelo básico ou tem alguma ideia específica em mente?`;
        break;
      case "Campanhas":
        aiResponse = `Sobre sua campanha: "${userMessage}". Para maximizar o engajamento, recomendo segmentar seu público e personalizar as mensagens. Podemos analisar os dados de campanhas anteriores ou criar uma nova estratégia. Como gostaria de proceder?`;
        break;
      case "Eventos":
        aiResponse = `Sobre seu evento: "${userMessage}". Posso ajudar a configurar lembretes automáticos e confirmações de presença via WhatsApp. Qual é a data do evento e quantos participantes você espera?`;
        break;
      case "Relatorios":
        aiResponse = `Analisei os dados relacionados a: "${userMessage}". Os principais indicadores mostram uma taxa de abertura de 68% e conversão de 12%. Recomendo ajustar o horário de envio para aumentar o engajamento. Gostaria de ver uma análise mais detalhada?`;
        break;
      default:
        aiResponse = `Recebi sua mensagem: "${userMessage}". Como posso ajudar você hoje?`;
    }
    
    // Salvar a resposta do agente
    const agentMessageObj = await createMessage(
      conversationId,
      aiResponse,
      "agent"
    );
    
    return agentMessageObj;
  } catch (error) {
    console.error("Erro ao processar mensagem com IA:", error);
    return null;
  }
}
