import { motion } from "framer-motion";
import { Database, FileUp, Upload } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { processMailingFile } from "@/hooks/mailing/supabase-mailing-operations";

export default function MailingPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [totalLines, setTotalLines] = useState(0);
  const [processedLines, setProcessedLines] = useState(0);
  const [processingSpeed, setProcessingSpeed] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string>('idle'); // 'idle', 'uploading', 'success', 'error'
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const processingStartTimeRef = useRef<number | null>(null);
  const lastProcessedLinesRef = useRef<number>(0);
  const lastUpdateTimeRef = useRef<number | null>(null);
  
  const { toast } = useToast();
  
  // Efeito para calcular a velocidade de processamento e o tempo restante
  useEffect(() => {
    if (isUploading && processedLines > 0 && totalLines > 0) {
      const now = Date.now();
      
      // Calcular velocidade apenas se temos um ponto de referência anterior
      if (lastUpdateTimeRef.current && lastProcessedLinesRef.current < processedLines) {
        const timeElapsed = (now - lastUpdateTimeRef.current) / 1000; // em segundos
        const linesProcessed = processedLines - lastProcessedLinesRef.current;
        
        if (timeElapsed > 0) {
          const speed = Math.round(linesProcessed / timeElapsed); // linhas por segundo
          setProcessingSpeed(speed);
          
          // Calcular tempo restante
          const remainingLines = totalLines - processedLines;
          if (speed > 0) {
            const remainingSeconds = Math.ceil(remainingLines / speed);
            
            if (remainingSeconds < 60) {
              setTimeRemaining(`${remainingSeconds} segundo${remainingSeconds !== 1 ? 's' : ''}`);
            } else {
              const minutes = Math.floor(remainingSeconds / 60);
              const seconds = remainingSeconds % 60;
              setTimeRemaining(`${minutes} minuto${minutes !== 1 ? 's' : ''} e ${seconds} segundo${seconds !== 1 ? 's' : ''}`);
            }
          }
        }
      }
      
      // Atualizar referências para o próximo cálculo
      lastUpdateTimeRef.current = now;
      lastProcessedLinesRef.current = processedLines;
    }
  }, [isUploading, processedLines, totalLines]);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === "text/csv" || file.name.endsWith(".csv")) {
        setSelectedFile(file);
        
        // Resetar estados de progresso
        setUploadProgress(0);
        setTotalLines(0);
        setProcessedLines(0);
        setProcessingSpeed(0);
        setTimeRemaining(null);
        setUploadStatus('idle');
      } else {
        toast({
          title: "Formato inválido",
          description: "Por favor, selecione um arquivo CSV.",
          variant: "destructive"
        });
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    }
  };
  
  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: "Nenhum arquivo selecionado",
        description: "Por favor, selecione um arquivo CSV para fazer upload.",
        variant: "destructive"
      });
      return;
    }
    
    setIsUploading(true);
    setUploadProgress(0);
    setUploadStatus('uploading');
    processingStartTimeRef.current = Date.now();
    lastUpdateTimeRef.current = null;
    lastProcessedLinesRef.current = 0;
    
    // Iniciar com um progresso mínimo para feedback visual imediato
    setUploadProgress(1);
    
    try {
      console.log("Iniciando processamento do arquivo:", selectedFile.name);
      
      // Processar o arquivo CSV com callback de progresso
      const result = await processMailingFile(selectedFile, (progress, totalLinesCount, processedLinesCount) => {
        console.log(`Callback de progresso: ${progress}%, ${processedLinesCount}/${totalLinesCount} linhas`);
        setUploadProgress(progress);
        setTotalLines(totalLinesCount);
        setProcessedLines(processedLinesCount);
      });
      
      console.log("Resultado do processamento:", result);
      
      // Completar o progresso
      setUploadProgress(100);
      setUploadStatus('success');
      
      if (result.success) {
        toast({
          title: "Upload concluído",
          description: `O arquivo "${selectedFile.name}" foi processado com sucesso. ${result.recordCount} de ${result.totalLines} contatos foram importados.`,
        });
      } else {
        setUploadStatus('error');
        toast({
          title: "Erro no processamento",
          description: result.error || "Ocorreu um erro ao processar o arquivo.",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error("Erro ao fazer upload do arquivo:", error);
      setUploadStatus('error');
      toast({
        title: "Erro no upload",
        description: error.message || "Ocorreu um erro ao fazer o upload do arquivo.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      
      // Resetar estados após um tempo
      setTimeout(() => {
        setUploadProgress(0);
        setTotalLines(0);
        setProcessedLines(0);
        setProcessingSpeed(0);
        setTimeRemaining(null);
        setUploadStatus('idle');
      }, 5000);
    }
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === "text/csv" || file.name.endsWith(".csv")) {
        setSelectedFile(file);
        
        // Resetar estados de progresso
        setUploadProgress(0);
        setTotalLines(0);
        setProcessedLines(0);
        setProcessingSpeed(0);
        setTimeRemaining(null);
        setUploadStatus('idle');
      } else {
        toast({
          title: "Formato inválido",
          description: "Por favor, selecione um arquivo CSV.",
          variant: "destructive"
        });
      }
    }
  };

  // Função para acionar o input de arquivo quando o botão for clicado
  const handleSelectFileClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  // Função para formatar o tamanho do arquivo
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };
  
  return (
    <AdminLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Database className="h-8 w-8" />
            <h1 className="text-2xl font-bold">Gerenciamento de Mailing</h1>
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Upload de Mailing</CardTitle>
            <CardDescription>
              Faça upload de arquivos CSV contendo listas de contatos para suas campanhas.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div 
              className={`border-2 border-dashed rounded-lg p-8 text-center ${
                selectedFile ? 'border-primary' : 'border-gray-300'
              } transition-colors duration-200 mb-6`}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="bg-primary/10 p-4 rounded-full">
                  <FileUp className="h-10 w-10 text-primary" />
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-medium text-lg">
                    {selectedFile ? selectedFile.name : "Arraste seu arquivo CSV ou clique para selecionar"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Suporta apenas arquivos CSV
                  </p>
                </div>
                
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                  id="csv-upload"
                />
                
                <Button 
                  variant="outline" 
                  type="button"
                  onClick={handleSelectFileClick}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Selecionar arquivo
                </Button>
              </div>
            </div>
            
            {selectedFile && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Arquivo selecionado:</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedFile.name} ({formatFileSize(selectedFile.size)})
                    </p>
                  </div>
                  <Button 
                    onClick={() => {
                      setSelectedFile(null);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = "";
                      }
                    }}
                    variant="ghost"
                    size="sm"
                  >
                    Remover
                  </Button>
                </div>
                
                <Button 
                  onClick={handleUpload} 
                  disabled={isUploading}
                  className="w-full"
                >
                  {isUploading ? "Processando..." : "Iniciar Upload"}
                </Button>
              </div>
            )}
            
            {/* Sempre mostrar a área de progresso quando estiver carregando, mesmo sem arquivo selecionado */}
            {(isUploading || uploadStatus === 'success' || uploadStatus === 'error') && (
              <div className="space-y-4 mt-4 border p-4 rounded-lg">
                <div className="flex justify-between text-sm font-medium">
                  <span>
                    {uploadStatus === 'uploading' && "Processando arquivo..."}
                    {uploadStatus === 'success' && "Processamento concluído!"}
                    {uploadStatus === 'error' && "Erro no processamento!"}
                  </span>
                  <span>{uploadProgress}%</span>
                </div>
                
                {/* Barra de progresso principal */}
                <Progress 
                  value={uploadProgress} 
                  className="h-3" 
                  color={uploadStatus === 'error' ? 'bg-red-500' : undefined}
                />
                
                {totalLines > 0 && (
                  <div className="mt-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">
                        {processedLines.toLocaleString()} / {totalLines.toLocaleString()} registros
                      </span>
                      <span className="text-gray-500">
                        {processingSpeed.toLocaleString()} linhas/seg
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </AdminLayout>
  );
}
