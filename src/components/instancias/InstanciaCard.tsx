
import React from "react";
import { Copy, Eye, MoreHorizontal } from "lucide-react";
import { GupTpData } from "@/types/instancia";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface InstanciaCardProps {
  item: GupTpData;
  onDelete: (id: number) => Promise<void>;
}

export const InstanciaCard: React.FC<InstanciaCardProps> = ({ item, onDelete }) => {
  const { toast } = useToast();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: "Informação copiada para a área de transferência.",
    });
  };

  const getStatusVariant = (status?: string) => {
    if (!status) return "secondary";
    return status.toLowerCase() === "conectado" ? "default" : "outline";
  };

  const getStatusClass = (status?: string) => {
    if (!status) return "";
    return status.toLowerCase() === "conectado" ? "bg-green-600 hover:bg-green-700" : "";
  };

  return (
    <Card key={item.id} className="overflow-hidden">
      <CardContent className="p-3">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-base font-semibold truncate">{item.NomeAppGup || "Sem nome"}</h3>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => copyToClipboard(item.Instancia || "")}>
                Copiar Instância
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => copyToClipboard(item.token || "")}>
                Copiar Token
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-red-500 focus:text-red-500" 
                onClick={() => onDelete(item.id)}
              >
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="space-y-1 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Instância:</span>
            <span className="font-medium truncate max-w-[140px]">{item.Instancia || "N/A"}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Dia:</span>
            <span className="font-medium">{item.Day || "N/A"}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Período:</span>
            <span className="font-medium">{item.Periodo || "N/A"}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Quantidade:</span>
            <span className="font-medium">{item.Quantidade || "0"}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Token:</span>
            <div className="flex items-center">
              <span className="font-mono text-xs mr-1 truncate max-w-[100px]">
                {item.token ? "••••••••" : "N/A"}
              </span>
              {item.token && (
                <div className="flex space-x-1">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-4 w-4"
                    onClick={() => copyToClipboard(item.token || "")}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-4 w-4"
                  >
                    <Eye className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-0 border-t">
        <div className="flex w-full">
          <Badge 
            variant={getStatusVariant(item.Status)}
            className={`rounded-none rounded-bl-lg flex-1 justify-center py-1 text-xs ${getStatusClass(item.Status)}`}
          >
            {item.Status || "Desconectado"}
          </Badge>
          <Button 
            variant="ghost" 
            size="sm" 
            className="rounded-none rounded-br-lg border-l hover:bg-red-900/10 text-red-500 flex-1 justify-center py-1 px-2 h-auto font-normal text-xs"
            onClick={() => onDelete(item.id)}
          >
            Excluir
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};
