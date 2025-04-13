import React, { useState, useRef, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import { 
  MessageSquare, 
  Phone, 
  AlertCircle,
  X,
  Save,
  ChevronLeft,
  Signal,
  Wifi,
  Battery,
  Bold,
  List,
  Smile,
  Info,
  Smartphone
} from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

// Hook personalizado para substituir useMediaQuery
const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }

    const listener = () => setMatches(media.matches);
    media.addEventListener("change", listener);
    
    return () => media.removeEventListener("change", listener);
  }, [matches, query]);

  return matches;
};

interface CreateTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  savedTemplateInfo?: any;
  onSave: (data: any) => void;
}

const CreateTemplateDialog = ({ 
  open, 
  onOpenChange, 
  savedTemplateInfo = null,
  onSave 
}: CreateTemplateDialogProps) => {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [activeTemplateIndex, setActiveTemplateIndex] = useState(1);
  const [templates, setTemplates] = useState<Record<string, string>>({
    template1: savedTemplateInfo?.templates?.template1 || "Temos uma ótima notícia para você! 🎉\nSua proposta financeira continua válida para liberação. Escolha uma opção para continuar:\n\n✅ Digite 1 para falar com um atendente.\n❌ Digite 2 se não quiser receber nossas mensagens.\n\nEstamos à disposição para te ajudar! 👍",
    template2: savedTemplateInfo?.templates?.template2 || "Olá! Seu pedido #12345 foi confirmado e está em processamento. Acompanhe o status pelo nosso app.",
    template3: savedTemplateInfo?.templates?.template3 || "Lembrete: Você tem um agendamento conosco amanhã às 14h. Confirme com 1 ou reagende com 2."
  });
  const [conjuntoNome, setConjuntoNome] = useState(savedTemplateInfo?.name || "");
  const [isSaving, setIsSaving] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const charLimit = 1000;
  
  // Função para formatar texto com negrito do WhatsApp
  const formatWhatsAppText = (text: string) => {
    if (!text) return '';
    
    // Formatar negrito
    let formattedText = text.replace(/\*(.*?)\*/g, '<strong>$1</strong>');
    
    // Preservar quebras de linha
    formattedText = formattedText.replace(/\n/g, '<br>');
    
    return formattedText;
  };

  // Renderiza o template no formato de iPhone
  const renderPhoneTemplate = (content: string) => {
    return (
      <div className="relative w-full max-w-[280px] mx-auto aspect-[10/19] overflow-hidden bg-black rounded-[22px] border-[6px] border-gray-800 shadow-xl">
        {/* Status Bar */}
        <div className="absolute top-0 left-0 right-0 h-5 bg-black z-10 flex items-center justify-between px-4">
          <div className="text-white text-[9px] font-medium">9:41</div>
          <div className="flex items-center gap-1">
            <Signal className="h-2.5 w-2.5 text-white" />
            <Wifi className="h-2.5 w-2.5 text-white" />
            <Battery className="h-2.5 w-2.5 text-white" />
          </div>
        </div>
        
        {/* Notch */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1/3 h-5 bg-black rounded-b-lg z-10"></div>
        
        {/* Home indicator */}
        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1/3 h-1 bg-gray-700 rounded-full z-10"></div>
        
        {/* WhatsApp Header */}
        <div className="w-full bg-[#075E54] p-2 flex items-center gap-1.5 mt-5">
          <div className="flex items-center gap-1">
            <Avatar className="h-6 w-6">
              <AvatarFallback className="bg-[#128C7E] text-[9px] text-white">N1</AvatarFallback>
            </Avatar>
          </div>
          <div>
            <div className="text-white text-[11px] font-medium">N1 Business</div>
            <div className="text-white/80 text-[9px]">online</div>
          </div>
        </div>
        
        {/* Chat Area */}
        <div className="w-full h-[calc(100%-5.5rem)] bg-[#ECE5DD] p-2.5 overflow-hidden">
          <div className="flex flex-col gap-1.5 h-full">
            <div className="bg-[#DCF8C6] self-end max-w-[85%] p-2 rounded-md text-[11px] leading-tight text-black shadow-sm">
              {content ? (
                <div className="whitespace-pre-wrap break-words" dangerouslySetInnerHTML={{ __html: formatWhatsAppText(content) }}></div>
              ) : (
                <div>Estamos à disposição para te ajudar! 👍</div>
              )}
              <div className="text-[8px] text-right text-gray-500/70 mt-1 flex items-center justify-end gap-0.5">
                <span>10:34</span>
                <svg className="w-2.5 h-2.5" viewBox="0 0 16 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15.0129 0.803711L5.50391 10.3127L1.01091 5.81971L0.0129089 6.81771L5.50391 12.3087L16.0129 1.80171L15.0129 0.803711Z" fill="#4FC3F7"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Função para lidar com a mudança de mensagem
  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= charLimit) {
      setTemplates(prev => ({
        ...prev,
        [`template${activeTemplateIndex}`]: value
      }));
    }
  };
  
  // Função para lidar com atalhos de teclado
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Ctrl+B para negrito
    if (e.ctrlKey && e.key === 'b') {
      e.preventDefault();
      insertFormatting('bold');
    }
    // Ctrl+I para lista
    if (e.ctrlKey && e.key === 'i') {
      e.preventDefault();
      insertFormatting('list');
    }
    // Ctrl+E para emoji
    if (e.ctrlKey && e.key === 'e') {
      e.preventDefault();
      insertFormatting('emoji');
    }
  };
  
  // Função para inserir formatação
  const insertFormatting = (type: 'bold' | 'list' | 'emoji') => {
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = templates[`template${activeTemplateIndex}`];
    
    let newText = '';
    let newCursorPos = 0;
    
    switch (type) {
      case 'bold':
        if (start === end) {
          newText = text.substring(0, start) + '*texto em negrito*' + text.substring(end);
          newCursorPos = start + 1;
        } else {
          newText = text.substring(0, start) + '*' + text.substring(start, end) + '*' + text.substring(end);
          newCursorPos = end + 2;
        }
        break;
      case 'list':
        newText = text.substring(0, start) + '\n• Item 1\n• Item 2\n• Item 3' + text.substring(end);
        newCursorPos = start + 3;
        break;
      case 'emoji':
        newText = text.substring(0, start) + '👍' + text.substring(end);
        newCursorPos = start + 2;
        break;
    }
    
    setTemplates(prev => ({
      ...prev,
      [`template${activeTemplateIndex}`]: newText
    }));
    
    // Definir o foco e a posição do cursor após a atualização do estado
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };
  
  // Função para selecionar um template
  const selectTemplate = (index: number) => {
    setActiveTemplateIndex(index);
  };
  
  // Função para salvar os templates
  const handleSave = async () => {
    if (!conjuntoNome.trim()) {
      toast({
        title: "Nome do conjunto é obrigatório",
        description: "Por favor, informe um nome para o conjunto de templates.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Preparar dados para salvar
      const templateData = {
        template1: templates.template1,
        template2: templates.template2,
        template3: templates.template3,
        nome: conjuntoNome
      };
      
      console.log("Template salvo:", {
        id: savedTemplateInfo?.id,
        name: conjuntoNome,
        templates: templateData
      });
      
      // Chamar a função de callback com os dados
      await onSave({
        id: savedTemplateInfo?.id,
        name: conjuntoNome,
        templates: templateData
      });
      
      // Fechar o diálogo após salvar
      onOpenChange(false);
      
      toast({
        title: "Templates salvos com sucesso!",
        description: `O conjunto "${conjuntoNome}" foi salvo e enviado para ativação.`,
      });
    } catch (error) {
      console.error("Erro ao salvar templates:", error);
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar os templates. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-5xl p-0 bg-zinc-900 backdrop-blur-md border border-zinc-800/30 shadow-2xl overflow-hidden rounded-lg"
        aria-describedby="template-dialog-description"
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-zinc-200">Criar Novo Template</DialogTitle>
          <DialogDescription id="template-dialog-description" className="sr-only">
            Crie e edite templates para envio de mensagens via WhatsApp
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col h-auto max-h-[90vh]">
          {/* Header */}
          <div className="py-4 px-6 border-b border-zinc-800 flex justify-between items-center">
            <DialogTitle className="text-xl font-semibold text-zinc-400">Criar Novo Template</DialogTitle>
            <div className="mr-14">
              <Button
                onClick={handleSave}
                className="bg-white text-zinc-900 rounded-md transition-all duration-300 flex items-center gap-2 px-5 h-10 shadow-md hover:bg-zinc-100 hover:shadow-white/10 hover:translate-y-[-1px] active:translate-y-[1px] disabled:opacity-70 disabled:hover:translate-y-0 disabled:bg-white/70 disabled:cursor-not-allowed"
                disabled={isSaving || !conjuntoNome.trim()}
              >
                {isSaving ? (
                  <>
                    <div className="h-4 w-4 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin" />
                    <span>Salvando...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Salvar Templates</span>
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="mb-4">
              <Label htmlFor="templateSetName" className="text-sm font-medium mb-2 block text-zinc-400">
                Nome do Conjunto
              </Label>
              <Input
                id="templateSetName"
                value={conjuntoNome}
                onChange={(e) => setConjuntoNome(e.target.value)}
                className="bg-zinc-800 border-zinc-700 focus:border-zinc-600 focus-visible:ring-1 focus-visible:ring-zinc-600/30 transition-all duration-200"
                placeholder="Conjunto de Templates 01/04/2025"
              />
            </div>
            
            <div className="grid grid-cols-12 gap-4">
              {/* Coluna da esquerda - 8/12 - Editor */}
              <div className="col-span-8">
                <div className="flex flex-col h-[450px] bg-zinc-800 border border-zinc-700 rounded-xl shadow-md overflow-hidden">
                  <div className="p-4 border-b border-zinc-700 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-zinc-400" />
                      <h3 className="font-medium text-zinc-400">Editor de Mensagem</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        key={1}
                        variant="ghost"
                        size="sm"
                        className={`h-8 w-8 p-0 rounded-full ${
                          activeTemplateIndex === 1
                            ? 'bg-white text-zinc-900'
                            : 'text-white hover:bg-white/10'
                        }`}
                        onClick={() => selectTemplate(1)}
                      >
                        1
                      </Button>
                      <Button
                        key={2}
                        variant="ghost"
                        size="sm"
                        className={`h-8 w-8 p-0 rounded-full ${
                          activeTemplateIndex === 2
                            ? 'bg-white text-zinc-900'
                            : 'text-white hover:bg-white/10'
                        }`}
                        onClick={() => selectTemplate(2)}
                      >
                        2
                      </Button>
                      <Button
                        key={3}
                        variant="ghost"
                        size="sm"
                        className={`h-8 w-8 p-0 rounded-full ${
                          activeTemplateIndex === 3
                            ? 'bg-white text-zinc-900'
                            : 'text-white hover:bg-white/10'
                        }`}
                        onClick={() => selectTemplate(3)}
                      >
                        3
                      </Button>
                    </div>
                  </div>
                  <div className="flex-1 p-4 overflow-hidden">
                    <div className="flex items-center gap-2 mb-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 rounded-md text-white hover:bg-white/10"
                        onClick={() => insertFormatting('bold')}
                      >
                        <Bold className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 rounded-md text-white hover:bg-white/10"
                        onClick={() => insertFormatting('list')}
                      >
                        <List className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 rounded-md text-white hover:bg-white/10"
                        onClick={() => insertFormatting('emoji')}
                      >
                        <Smile className="h-4 w-4" />
                      </Button>
                      <div className="text-xs text-white">Template {activeTemplateIndex}</div>
                    </div>
                    <Textarea
                      ref={textareaRef}
                      value={templates[`template${activeTemplateIndex}`]}
                      onChange={handleMessageChange}
                      onKeyDown={handleKeyDown}
                      className="h-[350px] resize-none bg-zinc-800 border-zinc-700 focus:border-zinc-600 focus-visible:ring-1 focus-visible:ring-zinc-600/30 transition-all duration-200"
                      placeholder="Digite sua mensagem aqui..."
                    />
                  </div>
                </div>
              </div>
              
              {/* Coluna da direita - 4/12 - Prévia */}
              <div className="col-span-4">
                <div className="flex flex-col h-[450px] bg-zinc-800 border border-zinc-700 rounded-xl shadow-md overflow-hidden">
                  <div className="p-4 border-b border-zinc-700 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-zinc-400" />
                      <h3 className="font-medium text-zinc-400">Prévia</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        key={1}
                        variant="ghost"
                        size="sm"
                        className={`h-8 w-8 p-0 rounded-full ${
                          activeTemplateIndex === 1
                            ? 'bg-white text-zinc-900'
                            : 'text-white hover:bg-white/10'
                        }`}
                        onClick={() => selectTemplate(1)}
                      >
                        1
                      </Button>
                      <Button
                        key={2}
                        variant="ghost"
                        size="sm"
                        className={`h-8 w-8 p-0 rounded-full ${
                          activeTemplateIndex === 2
                            ? 'bg-white text-zinc-900'
                            : 'text-white hover:bg-white/10'
                        }`}
                        onClick={() => selectTemplate(2)}
                      >
                        2
                      </Button>
                      <Button
                        key={3}
                        variant="ghost"
                        size="sm"
                        className={`h-8 w-8 p-0 rounded-full ${
                          activeTemplateIndex === 3
                            ? 'bg-white text-zinc-900'
                            : 'text-white hover:bg-white/10'
                        }`}
                        onClick={() => selectTemplate(3)}
                      >
                        3
                      </Button>
                    </div>
                  </div>
                  <div className="flex-1 flex items-center justify-center p-4 overflow-hidden bg-zinc-900 rounded-lg" style={{ height: '420px' }}>
                    {renderPhoneTemplate(templates[`template${activeTemplateIndex}`])}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTemplateDialog;
