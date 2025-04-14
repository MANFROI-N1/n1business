import React, { useState, useRef, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { X, Upload, FileSpreadsheet, Loader2, Check, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { fetchAllWhatsAppTemplates, saveCampanhaFile, verificarColunasDisparador, createConjunto, fetchAllConjuntos, processXlsxFile } from "@/hooks/instancias/supabase-operations";
import { ConjuntosData } from "@/hooks/instancias/supabase-operations";
import { v4 as uuidv4 } from 'uuid';

interface CreateCampanhaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCampanhaCreated?: () => void;
}

export function CreateCampanhaDialog({ 
  open, 
  onOpenChange,
  onCampanhaCreated
}: CreateCampanhaDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [campanhaName, setCampanhaName] = useState("");
  const [phoneNumbers, setPhoneNumbers] = useState<string[]>([]);
  const [blocks, setBlocks] = useState<string[][]>([]);
  const [totalNumbers, setTotalNumbers] = useState(0);
  const [fileName, setFileName] = useState("");
  const [planilhaData, setPlanilhaData] = useState<any[]>([]);
  const [selectedDay, setSelectedDay] = useState<string>("1");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("Manhã");
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [templates, setTemplates] = useState<{id: string, nome: string, textTp: string, textTp1: string, textTp2: string, status: string, data: string}[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const [fileContent, setFileContent] = useState<any>(null);
  const [processingStatus, setProcessingStatus] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Verificar se é um arquivo CSV, TXT ou XLSX
      const isValidFileType = 
        selectedFile.type === "text/csv" || 
        selectedFile.type === "text/plain" || 
        selectedFile.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        selectedFile.name.endsWith('.csv') || 
        selectedFile.name.endsWith('.txt') ||
        selectedFile.name.endsWith('.xlsx');
      
      if (!isValidFileType) {
        toast({
          title: "Formato de arquivo inválido",
          description: "Por favor, selecione um arquivo CSV, TXT ou XLSX.",
          variant: "destructive"
        });
        return;
      }
      
      setFile(selectedFile);
      processFile(selectedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      
      // Verificar se é um arquivo CSV, TXT ou XLSX
      const isValidFileType = 
        droppedFile.type === "text/csv" || 
        droppedFile.type === "text/plain" || 
        droppedFile.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        droppedFile.name.endsWith('.csv') || 
        droppedFile.name.endsWith('.txt') ||
        droppedFile.name.endsWith('.xlsx');
      
      if (!isValidFileType) {
        toast({
          title: "Formato de arquivo inválido",
          description: "Por favor, selecione um arquivo CSV, TXT ou XLSX.",
          variant: "destructive",
        });
        return;
      }
      
      setFile(droppedFile);
      processFile(droppedFile);
    }
  };

  const startProgress = () => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 10;
      if (progress > 95) {
        clearInterval(interval);
        progress = 95; // Deixar em 95% até que o processamento real termine
      }
      setUploadProgress(Math.min(progress, 95));
    }, 300);
    
    return () => clearInterval(interval);
  };

  const stopProgress = () => {
    setUploadProgress(0);
  };

  // Função para ler arquivo como texto
  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          resolve(e.target.result as string);
        } else {
          reject(new Error("Falha ao ler o arquivo"));
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });
  };

  const processFile = async (file: File) => {
    setIsProcessing(true);
    try {
      console.log("Processando arquivo:", file.name, "tipo:", file.type);
      
      // Verificar o tipo de arquivo
      const isXlsx = file.name.endsWith('.xlsx') || file.name.endsWith('.xls') || file.type.includes('excel') || file.type.includes('spreadsheetml');
      const isCsv = file.name.endsWith('.csv') || file.type.includes('csv');
      const isTxt = file.name.endsWith('.txt') || file.type.includes('text/plain');
      
      console.log("Tipo de arquivo detectado:", { isXlsx, isCsv, isTxt });
      
      let contacts: any[] = [];
      
      if (isXlsx) {
        console.log("Processando arquivo XLSX");
        contacts = await processXlsxFile(file);
      } else if (isCsv || isTxt) {
        console.log("Processando arquivo CSV/TXT");
        const content = await readFileAsText(file);
        
        // Verificar se o conteúdo parece ser um CSV estruturado
        const lines = content.split(/\r?\n/);
        const firstLine = lines[0].trim();
        
        if (firstLine.includes(',') && lines.length > 1) {
          console.log("Detectado CSV estruturado com cabeçalhos");
          
          // Extrair cabeçalhos
          const headers = firstLine.split(',').map(h => h.trim());
          console.log("Cabeçalhos detectados:", headers);
          
          // Processar as linhas de dados
          contacts = [];
          for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            
            const values = line.split(',').map(v => v.trim());
            if (values.length < headers.length) continue;
            
            const contact: any = {};
            let hasPhoneNumber = false;
            
            // Mapear valores para as propriedades
            headers.forEach((header, index) => {
              if (index < values.length) {
                const value = values[index];
                contact[header] = value;
                
                // Verificar se algum campo parece ser um número de telefone
                const cleanedValue = value.replace(/\D/g, '');
                if (cleanedValue.length >= 8 && /^\d+$/.test(cleanedValue)) {
                  hasPhoneNumber = true;
                  // Adicionar explicitamente como Whatsapp se o cabeçalho não for claro
                  if (!headers.some(h => /whatsapp|telefone|celular|phone/i.test(h))) {
                    contact['Whatsapp'] = cleanedValue;
                  }
                }
              }
            });
            
            // Garantir que temos pelo menos um nome e um número
            if (!contact['Nome'] && !contact['nome']) {
              contact['Nome'] = `Contato ${i}`;
            }
            
            if (!contact['Cpf'] && !contact['cpf']) {
              contact['Cpf'] = '-';
            }
            
            if (hasPhoneNumber) {
              contacts.push(contact);
            }
          }
        } else {
          // Processar como lista simples de números
          console.log("Processando como lista simples de números");
          const phoneNumbers = extractPhoneNumbers(content);
          contacts = phoneNumbers.map((number, index) => ({
            Nome: `Contato ${index + 1}`,
            Whatsapp: number,
            Cpf: '-'
          }));
        }
      } else {
        throw new Error("Formato de arquivo não suportado. Use CSV, TXT ou XLSX.");
      }
      
      console.log(`Total de ${contacts.length} contatos extraídos do arquivo`);
      console.log("Amostra de contatos:", contacts.slice(0, 3));
      
      if (contacts.length === 0) {
        throw new Error("Nenhum contato válido encontrado no arquivo.");
      }
      
      // Atualizar o estado com os contatos processados
      setFileContent(contacts);
      setFileName(file.name);
      setPhoneNumbers(contacts.map(c => c.Whatsapp));
      setBlocks(splitIntoBlocks(contacts.map(c => c.Whatsapp), 800));
      setTotalNumbers(contacts.length);
      
      // Parar a simulação de progresso
      stopProgress();
      setIsProcessing(false);
      
      toast({
        title: "Arquivo processado com sucesso",
        description: `Foram encontrados ${contacts.length} números de telefone, divididos em ${blocks.length} blocos.`,
      });
    } catch (error) {
      console.error("Erro ao processar arquivo:", error);
      toast({
        title: "Erro ao processar arquivo",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
      stopProgress();
      setIsProcessing(false);
    }
  };

  const readTextFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          resolve(event.target.result as string);
        } else {
          reject(new Error("Falha ao ler o arquivo"));
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });
  };

  const extractPhoneNumbers = (content: string): string[] => {
    console.log("Extraindo números de telefone do conteúdo:", content.substring(0, 200) + "...");
    
    // Dividir o conteúdo por quebras de linha
    const lines = content.split(/\r?\n/);
    console.log(`Total de ${lines.length} linhas encontradas`);
    
    // Verificar se parece ser um CSV estruturado
    const firstLine = lines[0].trim();
    if (firstLine.includes(',') && !(/^\d+/.test(firstLine))) {
      console.log("Detectado formato CSV estruturado com cabeçalhos");
      
      // Extrair cabeçalhos
      const headers = firstLine.split(',').map(h => h.trim());
      
      // Encontrar índice da coluna que pode conter números de telefone
      let phoneColumnIndex = headers.findIndex(h => 
        /whatsapp|telefone|celular|phone|número|numero|contato/i.test(h)
      );
      
      // Se não encontrou uma coluna específica, usar a primeira coluna
      if (phoneColumnIndex === -1) phoneColumnIndex = 0;
      
      console.log(`Usando coluna ${headers[phoneColumnIndex]} (índice ${phoneColumnIndex}) para extrair números`);
      
      // Extrair números da coluna identificada
      const phoneNumbers = [];
      
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const values = line.split(',').map(v => v.trim());
        
        if (values.length > phoneColumnIndex) {
          const phoneValue = values[phoneColumnIndex];
          const cleanedNumber = phoneValue.replace(/\D/g, '');
          
          if (cleanedNumber.length >= 8) {
            phoneNumbers.push(cleanedNumber);
          }
        }
      }
      
      console.log(`Extraídos ${phoneNumbers.length} números de telefone do CSV estruturado`);
      return phoneNumbers;
    }
    
    // Se não for CSV estruturado, processar como lista simples
    console.log("Processando como lista simples de números");
    
    // Filtrar linhas vazias e extrair números de telefone
    const extractedNumbers = lines
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => {
        // Se a linha contiver vírgulas (CSV), pegar o primeiro campo
        if (line.includes(',')) {
          return line.split(',')[0].trim();
        }
        // Se a linha contiver tabulações, pegar o primeiro campo
        if (line.includes('\t')) {
          return line.split('\t')[0].trim();
        }
        // Caso contrário, usar a linha inteira
        return line;
      })
      // Limpar formatação dos números (remover espaços, traços, parênteses)
      .map(number => number.replace(/\D/g, ''))
      // Filtrar apenas números com pelo menos 8 dígitos
      .filter(number => number.length >= 8);
    
    console.log(`Extraídos ${extractedNumbers.length} números de telefone da lista simples`);
    return extractedNumbers;
  };

  const splitIntoBlocks = (numbers: string[], blockSize: number): string[][] => {
    const blocks: string[][] = [];
    for (let i = 0; i < numbers.length; i += blockSize) {
      blocks.push(numbers.slice(i, i + blockSize));
    }
    return blocks;
  };

  const loadTemplates = async () => {
    try {
      setIsLoadingTemplates(true);
      
      // Buscar templates da tabela GupTp
      const whatsappTemplates = await fetchAllWhatsAppTemplates();
      console.log("Templates encontrados:", whatsappTemplates?.length || 0);
      
      if (whatsappTemplates && whatsappTemplates.length > 0) {
        // Transformar os dados para o formato esperado pelo componente
        const formattedTemplates = whatsappTemplates.map(template => ({
          id: template.idconjunto || '',
          nome: template.NomeAppGup || `Template ${template.idconjunto?.substring(0, 8) || "Sem ID"}`,
          textTp: template.textTp || '',
          textTp1: template.textTp1 || '',
          textTp2: template.textTp2 || '',
          status: template.statusTp || 'Ativo',
          data: template.DataConjunto || ''
        }));
        
        setTemplates(formattedTemplates);
      } else {
        setTemplates([]);
        toast({
          title: "Nenhum template encontrado",
          description: "Não há templates disponíveis. Crie um na tela de Templates.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Erro ao carregar templates:", error);
      toast({
        title: "Erro ao carregar templates",
        description: "Não foi possível carregar os templates.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingTemplates(false);
    }
  };

  const handleSaveCampanha = async () => {
    try {
      setIsSaving(true);
      setProcessingStatus('Iniciando processamento...');
      
      // Validações mais específicas
      if (!campanhaName) {
        toast({
          title: "Nome da campanha é obrigatório",
          description: "Por favor, informe um nome para a campanha.",
          variant: "destructive",
        });
        setIsSaving(false);
        return;
      }

      if (!selectedTemplate) {
        toast({
          title: "Template não selecionado",
          description: "Por favor, selecione um conjunto de templates para a campanha.",
          variant: "destructive"
        });
        setIsSaving(false);
        return;
      }

      if (!fileContent || fileContent.length === 0) {
        toast({
          title: "Nenhum número para enviar",
          description: "Por favor, faça o upload de um arquivo com números de telefone.",
          variant: "destructive"
        });
        setIsSaving(false);
        return;
      }
      
      // Verificar estrutura da tabela Disparador
      await verificarColunasDisparador();
      
      try {
        // Criar um novo registro na tabela Conjuntos
        let conjuntoId: number | undefined;
        try {
          const novoConjunto: ConjuntosData = await createConjunto();
          conjuntoId = novoConjunto.id;
          console.log("Novo conjunto criado para a campanha:", novoConjunto);
        } catch (conjuntoError) {
          console.error("Erro ao criar conjunto para a campanha:", conjuntoError);
          // Continuar mesmo sem o conjunto criado
        }
        
        // Obter o template selecionado
        const selectedTemplateData = templates.find(t => t.id === selectedTemplate);
        
        // Gerar ID único para a campanha
        const campaignId = uuidv4();
        
        // Obter a data atual no formato ISO para armazenamento
        const currentDate = new Date();
        const isoDate = currentDate.toISOString();
        
        // Preparar dados da campanha
        const campaignData = {
          nome: campanhaName,
          id_conjunto_template: selectedTemplate,
          nome_conjunto_template: selectedTemplateData?.nome || "Template sem nome",
          dia: selectedDay,
          periodo: selectedPeriod || "manhã",
          status: "pendente",
          total_contatos: fileContent.length,
          contatos_enviados: 0,
          arquivo_nome: fileName || "Arquivo sem nome",
          id_campanha: campaignId,
          data_criacao: isoDate,
          id_conjunto: conjuntoId // Adicionar o ID do conjunto criado
        };
        
        console.log("Dados da campanha a ser salva:", campaignData);
        
        // Salvar a campanha e os contatos usando a nova versão da função
        const result = await saveCampanhaFile(
          fileContent, 
          campaignData,
          (status) => setProcessingStatus(status) // Passar função de callback para atualizar o status
        );
        
        if (result.success) {
          toast({
            title: "Campanha criada com sucesso",
            description: `A campanha "${campanhaName}" foi criada com ${fileContent.length} contatos.`,
          });
          
          // Resetar o formulário
          setCampanhaName("");
          setSelectedDay("1");
          setSelectedPeriod("manhã");
          setSelectedTemplate("");
          setBlocks([]);
          setFileName("");
          setFileContent(null);
          setFile(null);
          
          // Chamar a função onCampanhaCreated
          onCampanhaCreated?.();
          
          // Fechar o diálogo
          onOpenChange(false);
        } else {
          throw new Error(result.message || "Erro ao salvar a campanha");
        }
      } catch (error) {
        console.error("Erro ao salvar campanha:", error);
        toast({
          title: "Erro ao criar campanha",
          description: error instanceof Error ? error.message : "Ocorreu um erro ao criar a campanha.",
          variant: "destructive"
        });
      } finally {
        setIsSaving(false);
      }
    } catch (error) {
      console.error("Erro ao salvar campanha:", error);
      toast({
        title: "Erro ao criar campanha",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao criar a campanha.",
        variant: "destructive"
      });
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (open) {
      // Resetar estados
      setFile(null);
      setIsProcessing(false);
      setIsSaving(false);
      setIsUploading(false);
      setUploadProgress(0);
      setCampanhaName("");
      setPhoneNumbers([]);
      setBlocks([]);
      setTotalNumbers(0);
      setFileName("");
      setPlanilhaData([]);
      setSelectedDay("1");
      setSelectedPeriod("Manhã");
      setSelectedTemplate("");
      setSelectedDate(null);
      setFileContent(null);
      
      // Carregar templates
      loadTemplates();
    }
  }, [open]);

  const HeaderContent = (
    <div className="flex items-center justify-between w-full">
      <div>
        <DialogTitle>Nova Campanha</DialogTitle>
        <DialogDescription>Crie uma nova campanha de disparo</DialogDescription>
      </div>
    </div>
  );

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader className="mb-5">
            {HeaderContent}
          </DialogHeader>
          {renderContent()}
        </DialogContent>
      </Dialog>
    </>
  );

  function renderContent() {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="campanha-name">Nome da Campanha</Label>
          <Input
            id="campanha-name"
            placeholder="Digite o nome da campanha"
            value={campanhaName}
            onChange={(e) => setCampanhaName(e.target.value)}
            disabled={isUploading}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="campanha-dia">Dia</Label>
            <Select
              value={selectedDay}
              onValueChange={setSelectedDay}
              disabled={isUploading}
            >
              <SelectTrigger id="campanha-dia">
                <SelectValue placeholder="Selecione o dia" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Dia 1</SelectItem>
                <SelectItem value="2">Dia 2</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="campanha-periodo">Período</Label>
            <Select
              value={selectedPeriod}
              onValueChange={setSelectedPeriod}
              disabled={isUploading}
            >
              <SelectTrigger id="campanha-periodo">
                <SelectValue placeholder="Selecione um período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Manhã">Manhã</SelectItem>
                <SelectItem value="Tarde">Tarde</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="campanha-template">Conjunto de Template</Label>
          {isLoadingTemplates ? (
            <div className="flex items-center space-x-2 h-10 px-3 border rounded-md">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Carregando templates...</span>
            </div>
          ) : templates.length === 0 ? (
            <div className="flex items-center h-10 px-3 border rounded-md bg-muted">
              <span className="text-sm">Nenhum template disponível</span>
            </div>
          ) : templates.length === 1 ? (
            // Se houver apenas um template, mostrar diretamente
            <div className="flex items-center h-10 px-3 border rounded-md bg-background">
              <span className="text-sm font-medium">{templates[0].nome} (ID: {templates[0].id.substring(0, 8)})</span>
            </div>
          ) : (
            // Se houver mais de um template, mostrar select
            <Select
              value={selectedTemplate}
              onValueChange={setSelectedTemplate}
              disabled={isUploading}
            >
              <SelectTrigger id="campanha-template">
                <SelectValue placeholder="Selecione um conjunto de template" />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.nome} (ID: {template.id.substring(0, 8)})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        
        <div className="space-y-2">
          <Label>Arquivo de Contatos</Label>
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
              file ? 'border-green-500 bg-green-50 dark:bg-green-950/20' : 'border-gray-300 hover:border-primary'
            }`}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept=".csv,.txt,.xlsx"
              disabled={isUploading || isProcessing}
            />
            
            {isProcessing ? (
              <div className="flex flex-col items-center justify-center space-y-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Processando arquivo...</p>
                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                  <div className="bg-primary h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
                </div>
              </div>
            ) : file ? (
              <div className="flex flex-col items-center justify-center space-y-2">
                <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-2">
                  <Upload className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <p className="text-sm font-medium">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {totalNumbers} números encontrados em {blocks.length} blocos
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                    setPhoneNumbers([]);
                    setBlocks([]);
                    setTotalNumbers(0);
                    setFileName("");
                    setPlanilhaData([]);
                    setFileContent(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = "";
                    }
                  }}
                >
                  Remover arquivo
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center space-y-2">
                <div className="bg-primary/10 rounded-full p-2">
                  <Upload className="h-6 w-6 text-primary" />
                </div>
                <p className="text-sm font-medium">Clique para selecionar ou arraste um arquivo</p>
                <p className="text-xs text-muted-foreground">
                  Formatos suportados: CSV, TXT, XLSX
                </p>
              </div>
            )}
          </div>
        </div>
        
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSaveCampanha}
            disabled={isSaving || !file || !campanhaName || !selectedTemplate}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              "Salvar Campanha"
            )}
          </Button>
        </DialogFooter>
        
        {/* Exibir status de processamento */}
        {processingStatus && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
            <div className="flex items-center">
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin text-blue-600 dark:text-blue-400" />}
              <p className="text-sm text-blue-600 dark:text-blue-400">{processingStatus}</p>
            </div>
          </div>
        )}
      </div>
    );
  }
}
