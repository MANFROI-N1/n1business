import React, { useState, useRef, useEffect, useCallback } from "react";
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
import { X, Upload, FileSpreadsheet, Loader2, Check, AlertCircle, CheckCircle, MessageSquare, UploadCloud, Users } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { fetchAllWhatsAppTemplates, saveCampanhaFile, verificarColunasDisparador, createConjunto, fetchAllConjuntos, processXlsxFile } from "@/hooks/instancias/supabase-operations";
import { ConjuntosData } from "@/hooks/instancias/supabase-operations";
import { v4 as uuidv4 } from 'uuid';
import { fetchInstanciasByGroup } from '@/hooks/instancias/group-functions';

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
  const [selectedGroup, setSelectedGroup] = useState<string>("1");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [groupInstances, setGroupInstances] = useState<any[]>([]);
  const [isLoadingInstances, setIsLoadingInstances] = useState(false);
  const [fileContent, setFileContent] = useState<any>(null);
  const [processingStatus, setProcessingStatus] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
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
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
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

  const fetchInstancesByGroup = useCallback(async (group: string) => {
    try {
      setIsLoadingInstances(true);
      const instances = await fetchInstanciasByGroup(group);
      setGroupInstances(instances);
      
      if (instances.length === 0) {
        toast({
          title: "Aviso",
          description: `Nenhuma instância encontrada para o Grupo ${group}`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Instâncias carregadas",
          description: `${instances.length} instâncias encontradas no Grupo ${group}`,
        });
      }
    } catch (error) {
      console.error("Erro ao buscar instâncias:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as instâncias do grupo",
        variant: "destructive",
      });
    } finally {
      setIsLoadingInstances(false);
    }
  }, [toast]);

  useEffect(() => {
    if (selectedGroup) {
      fetchInstancesByGroup(selectedGroup);
    }
  }, [selectedGroup, fetchInstancesByGroup]);

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
      setSelectedGroup("1");
      setSelectedDate(null);
      setFileContent(null);
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

  // Função para salvar a campanha
  const handleSaveCampanha = async () => {
    try {
      if (!campanhaName) {
        toast({
          title: "Erro",
          description: "Por favor, insira um nome para a campanha",
          variant: "destructive",
        });
        return;
      }

      if (!fileContent || fileContent.length === 0) {
        toast({
          title: "Erro",
          description: "Por favor, faça upload de um arquivo com contatos",
          variant: "destructive",
        });
        return;
      }

      setIsSaving(true);
      setProcessingStatus("Iniciando processamento...");

      // Gerar ID único para a campanha
      const campanhaId = uuidv4();
      const dataCriacao = new Date().toISOString();

      // Criar o objeto com os dados da campanha
      const campanhaData = {
        nome: campanhaName,
        grupo: selectedGroup,
        status: "pendente",
        total_contatos: fileContent.length,
        contatos_enviados: 0,
        id_campanha: campanhaId,
        data_criacao: dataCriacao
      };

      // Processar e salvar os contatos
      setProcessingStatus("Processando contatos...");
      const result = await saveCampanhaFile(
        fileContent,
        {
          nome: campanhaName,
          grupo: selectedGroup,
          id_campanha: campanhaId,
          data_criacao: dataCriacao
        },
        (status) => setProcessingStatus(status)
      );

      if (!result.success) {
        throw new Error(result.message);
      }

      // Atualizar a lista de campanhas
      if (onCampanhaCreated) {
        onCampanhaCreated();
      }

      toast({
        title: "Sucesso",
        description: result.message,
      });
      
      // Resetar o formulário
      setCampanhaName("");
      setSelectedGroup("1");
      setBlocks([]);
      setFileName("");
      setPlanilhaData([]);
      setFileContent(null);
      setIsSaving(false);
      setProcessingStatus("");
      
      // Fechar o diálogo
      onOpenChange(false);
    } catch (error) {
      console.error("Erro ao salvar campanha:", error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro desconhecido ao salvar campanha",
        variant: "destructive",
      });
      setIsSaving(false);
      setProcessingStatus("");
    }
  };

  const handleRemoveFile = () => {
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
  };

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
          <Label htmlFor="name">Nome da Campanha</Label>
          <div className="relative">
            <Input
              id="name"
              placeholder="Digite o nome da campanha"
              value={campanhaName}
              onChange={(e) => setCampanhaName(e.target.value)}
              className="pl-10 h-12 focus-visible:ring-2 focus-visible:ring-offset-2 transition-all duration-200"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
              <MessageSquare className="h-5 w-5" />
            </div>
          </div>
        </div>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Grupo de Instâncias</Label>
            <div className="relative">
              <Select 
                value={selectedGroup} 
                onValueChange={setSelectedGroup}
              >
                <SelectTrigger className="w-full h-12 pl-10 focus-visible:ring-2 focus-visible:ring-offset-2 transition-all duration-200">
                  <SelectValue placeholder="Selecione um grupo" />
                </SelectTrigger>
                <SelectContent>
                  {["1", "2", "3", "4", "5", "6"].map((group) => (
                    <SelectItem key={group} value={group}>
                      Grupo {group}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                <Users className="h-5 w-5" />
              </div>
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="file">Arquivo de Contatos</Label>
          <div 
            className={`border-2 border-dashed rounded-xl p-8 transition-all duration-300 ${
              isDragging 
                ? 'border-primary bg-primary/5 scale-[1.02] shadow-md' 
                : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="flex flex-col items-center justify-center space-y-4 text-center cursor-pointer">
              {file ? (
                <>
                  <div className="p-4 rounded-full bg-primary/10">
                    <FileSpreadsheet className="h-10 w-10 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <p className="font-medium">{fileName}</p>
                    <p className="text-sm text-muted-foreground">
                      {totalNumbers} contatos encontrados
                    </p>
                  </div>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    className="mt-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFile();
                    }}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Remover arquivo
                  </Button>
                </>
              ) : (
                <>
                  <div className="p-4 rounded-full bg-muted">
                    <UploadCloud className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <div className="space-y-2">
                    <p className="font-medium">Clique para fazer upload ou arraste o arquivo aqui</p>
                    <p className="text-sm text-muted-foreground">
                      Suporta arquivos CSV, TXT e XLSX (máx. 10MB)
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            id="file"
            className="hidden"
            accept=".csv,.txt,.xlsx"
            onChange={handleFileChange}
            disabled={isUploading}
          />
        </div>
        
        <DialogFooter className="flex flex-col sm:flex-row gap-3 sm:gap-2 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
            className="w-full sm:w-auto transition-all duration-200 hover:bg-destructive/10"
          >
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSaveCampanha}
            disabled={isSaving || !file || !campanhaName}
            className="w-full sm:w-auto relative overflow-hidden group transition-all duration-300"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Processando...
              </>
            ) : (
              <>
                <span className="absolute inset-0 w-0 bg-white/20 transition-all duration-300 group-hover:w-full"></span>
                <Check className="h-4 w-4 mr-2" />
                Salvar Campanha
              </>
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
