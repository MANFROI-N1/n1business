import React, { useState, useRef, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Paperclip } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { 
  createNewConversation, 
  sendMessage, 
  getConversationMessages, 
  processMessageWithAI 
} from "@/hooks/ia-agente/supabase-ia-operations-simplified";
import { v4 as uuidv4 } from 'uuid';

// Tipos para mensagens
interface Message {
  id: string;
  content: string;
  sender: "user" | "agent";
  timestamp: Date;
  status: "sending" | "sent" | "error";
  attachments?: string[];
}

// Componente para exibir uma mensagem individual
const ChatMessage = ({ message }: { message: Message }) => {
  const isUser = message.sender === "user";
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      {!isUser && (
        <div className="flex-shrink-0 mr-3">
          <div className="bg-[#27272a] rounded-md h-9 w-9 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="24" height="24" rx="4" fill="#27272a"/>
              <path d="M12 3C7.58 3 4 6.58 4 11V16.5C4 17.33 4.67 18 5.5 18H8.5C9.33 18 10 18.67 10 19.5V20.5C10 21.33 10.67 22 11.5 22H12.5C13.33 22 14 21.33 14 20.5V19.5C14 18.67 14.67 18 15.5 18H18.5C19.33 18 20 17.33 20 16.5V11C20 6.58 16.42 3 12 3Z" stroke="#E4E4E7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 11C9 11 10 13 12 13C14 13 15 11 15 11" stroke="#E4E4E7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M8 7L10 9" stroke="#E4E4E7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 7L14 9" stroke="#E4E4E7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      )}
      <div 
        className={`max-w-[80%] rounded-lg p-3 ${
          isUser 
            ? 'bg-[#27272a] text-zinc-200' 
            : 'bg-[#1e1e1e] text-zinc-200 border border-zinc-800'
        }`}
      >
        <div className="text-sm">{message.content}</div>
        <div className="text-xs text-zinc-400 mt-1 text-right">
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
      {isUser && (
        <div className="flex-shrink-0 ml-3">
          <div className="bg-[#27272a] rounded-md h-9 w-9 flex items-center justify-center">
            <span className="text-zinc-200 text-xs font-medium">U</span>
          </div>
        </div>
      )}
    </div>
  );
};

// Componente para o chat de um tipo específico
const AgentChat = ({ agentType }: { agentType: string }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [conversationId, setConversationId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  // Criar nova conversa
  const createNewConversation = async () => {
    try {
      // Aqui você chamaria a API para criar uma nova conversa
      // Por enquanto, vamos apenas gerar um ID único
      const newId = uuidv4();
      
      // Em um cenário real, você salvaria isso no banco de dados
      console.log(`Nova conversa criada: ${newId}`);
      
      return newId;
    } catch (error) {
      console.error("Erro ao criar nova conversa:", error);
      throw error;
    }
  };

  // Função para criar ou recuperar uma conversa existente
  const createOrGetConversation = async (userId: string, agentType: string) => {
    try {
      // Em um cenário real, você verificaria se já existe uma conversa ativa
      // para este usuário e tipo de agente
      
      // Por enquanto, vamos apenas criar uma nova
      return await createNewConversation();
    } catch (error) {
      console.error("Erro ao obter conversa:", error);
      throw error;
    }
  };

  // Inicializar conversa
  useEffect(() => {
    const initializeChat = async () => {
      setIsLoading(true);
      try {
        // Criar uma nova conversa ou recuperar a conversa existente
        const userId = user?.id || "anonymous";
        const conversationId = await createOrGetConversation(userId, agentType);
        setConversationId(conversationId);
        
        // Adicionar mensagem de boas-vindas
        let welcomeMessage = "";
        switch (agentType) {
          case "Templates":
            welcomeMessage = "Olá! Sou o assistente de Templates. Como posso ajudar você a criar ou gerenciar seus templates de WhatsApp?";
            break;
          case "Campanhas":
            welcomeMessage = "Olá! Sou o assistente de Campanhas. Como posso ajudar você a criar ou gerenciar suas campanhas de marketing?";
            break;
          case "Eventos":
            welcomeMessage = "Olá! Sou o assistente de Eventos. Como posso ajudar você a criar ou gerenciar seus eventos?";
            break;
          case "Relatorios":
            welcomeMessage = "Olá! Sou o assistente de Relatórios. Posso ajudar você a gerar e analisar relatórios de desempenho.";
            break;
          default:
            welcomeMessage = "Olá! Como posso ajudar você hoje?";
        }

        // Limpar mensagens anteriores e adicionar a mensagem de boas-vindas
        setMessages([{
          id: `welcome-${agentType}`,
          content: welcomeMessage,
          sender: "agent",
          timestamp: new Date(),
          status: "sent"
        }]);
        
        // Focar no input
        if (inputRef.current) {
          inputRef.current.focus();
        }
      } catch (error) {
        console.error("Erro ao inicializar o chat:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeChat();
  }, [agentType]);

  // Rolar para o final quando novas mensagens são adicionadas
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !user) return;

    // Adicionar mensagem do usuário à interface
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: inputValue,
      sender: "user",
      timestamp: new Date(),
      status: "sending"
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      // Processar mensagem com IA
      const response = await processMessageWithAI(
        user.id || "anonymous",
        conversationId,
        inputValue,
        agentType
      );

      if (response) {
        // Atualizar status da mensagem do usuário
        setMessages(prev => 
          prev.map(msg => 
            msg.id === userMessage.id 
              ? { ...msg, status: "sent" } 
              : msg
          )
        );

        // Adicionar resposta do agente
        const agentMessage: Message = {
          id: `agent-${Date.now()}`,
          content: response.content,
          sender: "agent",
          timestamp: new Date(response.created_at),
          status: "sent"
        };

        setMessages(prev => [...prev, agentMessage]);
      } else {
        throw new Error("Falha ao processar mensagem");
      }
    } catch (error) {
      console.error("Erro ao processar mensagem:", error);
      
      // Atualizar status da mensagem do usuário para erro
      setMessages(prev => 
        prev.map(msg => 
          msg.id === userMessage.id 
            ? { ...msg, status: "error" } 
            : msg
        )
      );

      toast({
        title: "Erro",
        description: "Não foi possível processar sua mensagem. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-240px)] bg-[#27272a] rounded-lg overflow-hidden border border-zinc-800 mb-4">
      {/* Cabeçalho do chat */}
      <div className="border-b border-zinc-800 p-4 flex items-center justify-between bg-[#1a1a1a]">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="24" height="24" rx="4" fill="#27272a"/>
              <path d="M12 3C7.58 3 4 6.58 4 11V16.5C4 17.33 4.67 18 5.5 18H8.5C9.33 18 10 18.67 10 19.5V20.5C10 21.33 10.67 22 11.5 22H12.5C13.33 22 14 21.33 14 20.5V19.5C14 18.67 14.67 18 15.5 18H18.5C19.33 18 20 17.33 20 16.5V11C20 6.58 16.42 3 12 3Z" stroke="#E4E4E7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 11C9 11 10 13 12 13C14 13 15 11 15 11" stroke="#E4E4E7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M8 7L10 9" stroke="#E4E4E7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 7L14 9" stroke="#E4E4E7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <div className="font-medium text-zinc-200">Assistente de {agentType}</div>
            <div className="flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-green-500"></span>
              <span className="text-xs text-zinc-400">Online • Powered by IA</span>
            </div>
          </div>
        </div>
      </div>

      {/* Área de mensagens */}
      <ScrollArea className="flex-1 p-4 bg-[#27272a]">
        <div className="space-y-4">
          {messages.map(message => (
            <ChatMessage key={message.id} message={message} />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Área de input */}
      <div className="border-t border-zinc-800 p-4 bg-[#1a1a1a]">
        <div className="relative px-1">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !isLoading && handleSendMessage()}
            placeholder="Mensagem..."
            className="pr-28 py-6 bg-[#27272a] border-zinc-800 text-zinc-200 placeholder:text-zinc-500 focus-visible:ring-zinc-700"
            disabled={isLoading}
          />
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-full text-zinc-400 hover:text-zinc-300 hover:bg-zinc-700"
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            <Button 
              onClick={handleSendMessage} 
              disabled={!inputValue.trim() || isLoading} 
              size="icon" 
              className="h-8 w-8 rounded-full bg-zinc-700 hover:bg-zinc-600 text-zinc-200"
            >
              {isLoading ? (
                <div className="h-4 w-4 border-2 border-zinc-300 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function IAAgentePage() {
  return (
    <div className="w-full">
      <div className="flex flex-col space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22 12H18L15 21L9 3L6 12H2" stroke="#E4E4E7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-200">Gerenciamento de Agentes</h1>
        </div>

        <Tabs defaultValue="Templates" className="w-full">
          <div className="bg-zinc-800/50 rounded-xl p-1 mb-6 inline-block">
            <TabsList className="bg-transparent">
              <TabsTrigger 
                value="Templates" 
                className="data-[state=active]:bg-zinc-700 data-[state=active]:text-zinc-200 text-zinc-400 hover:text-zinc-300"
              >
                Templates
              </TabsTrigger>
              <TabsTrigger 
                value="Campanhas" 
                className="data-[state=active]:bg-zinc-700 data-[state=active]:text-zinc-200 text-zinc-400 hover:text-zinc-300"
              >
                Campanhas
              </TabsTrigger>
              <TabsTrigger 
                value="Eventos" 
                className="data-[state=active]:bg-zinc-700 data-[state=active]:text-zinc-200 text-zinc-400 hover:text-zinc-300"
              >
                Eventos
              </TabsTrigger>
              <TabsTrigger 
                value="Relatorios" 
                className="data-[state=active]:bg-zinc-700 data-[state=active]:text-zinc-200 text-zinc-400 hover:text-zinc-300"
              >
                Relatórios
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="Templates" className="mt-0">
            <AgentChat agentType="Templates" />
          </TabsContent>
          
          <TabsContent value="Campanhas" className="mt-0">
            <AgentChat agentType="Campanhas" />
          </TabsContent>
          
          <TabsContent value="Eventos" className="mt-0">
            <AgentChat agentType="Eventos" />
          </TabsContent>
          
          <TabsContent value="Relatorios" className="mt-0">
            <AgentChat agentType="Relatorios" />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
