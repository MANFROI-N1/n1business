import { useState, useRef } from "react";
import { FileUp, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

interface MailingUploaderProps {
  onUploadComplete: (fileName: string, recordCount: number) => void;
}

export function MailingUploader({ onUploadComplete }: MailingUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === "text/csv" || file.name.endsWith(".csv")) {
        setSelectedFile(file);
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
  
  const handleUpload = () => {
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
    
    // Simulação de upload com progresso
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          
          // Gerar um número aleatório de registros para simulação
          const recordCount = Math.floor(Math.random() * 1000) + 500;
          
          // Chamar a função de callback com os dados do arquivo processado
          onUploadComplete(selectedFile.name, recordCount);
          
          setSelectedFile(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
          
          toast({
            title: "Upload concluído",
            description: `O mailing "${selectedFile.name}" foi processado com sucesso.`,
          });
          
          return 0;
        }
        return prev + 10;
      });
    }, 300);
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
      } else {
        toast({
          title: "Formato inválido",
          description: "Por favor, selecione um arquivo CSV.",
          variant: "destructive"
        });
      }
    }
  };
  
  return (
    <div>
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
          
          <Label htmlFor="csv-upload" className="cursor-pointer">
            <Button variant="outline" type="button">
              <Upload className="h-4 w-4 mr-2" />
              Selecionar arquivo
            </Button>
          </Label>
        </div>
      </div>
      
      {selectedFile && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Arquivo selecionado:</p>
              <p className="text-sm text-muted-foreground">{selectedFile.name}</p>
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
          
          {isUploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Processando arquivo...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} />
            </div>
          )}
          
          <Button 
            onClick={handleUpload} 
            disabled={isUploading}
            className="w-full"
          >
            {isUploading ? "Processando..." : "Iniciar Upload"}
          </Button>
        </div>
      )}
    </div>
  );
}
