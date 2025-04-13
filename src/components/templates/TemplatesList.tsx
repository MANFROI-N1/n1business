import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  fetchAllWhatsAppTemplates,
  WhatsAppTemplateData
} from "@/hooks/instancias/supabase-operations";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export function TemplatesList({ 
  searchTerm = "", 
  filter = "todos", 
  customDate,
  refreshTrigger = 0
}: { 
  searchTerm?: string; 
  filter?: string;
  customDate?: Date;
  refreshTrigger?: number;
}) {
  const [templates, setTemplates] = useState<WhatsAppTemplateData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchTemplates();
  }, [searchTerm, filter, customDate, refreshTrigger]);

  const fetchTemplates = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!user) {
        setError("Você precisa estar autenticado para visualizar os templates.");
        setTemplates([]);
        setIsLoading(false);
        return;
      }
      
      // Buscar templates da tabela GupTp
      const whatsappTemplates = await fetchAllWhatsAppTemplates();
      console.log("Templates encontrados:", whatsappTemplates?.length || 0);
      
      // Aplicar filtros
      let filteredTemplates = whatsappTemplates || [];
      
      // Filtrar por termo de busca
      if (searchTerm) {
        filteredTemplates = filteredTemplates.filter(template => 
          template.NomeAppGup?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          template.textTp?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          template.textTp1?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          template.textTp2?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      // Filtrar por data
      if (filter === "hoje") {
        const today = new Date().toLocaleDateString('pt-BR');
        filteredTemplates = filteredTemplates.filter(template => 
          template.DataConjunto === today
        );
      } else if (filter === "ontem") {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toLocaleDateString('pt-BR');
        filteredTemplates = filteredTemplates.filter(template => 
          template.DataConjunto === yesterdayStr
        );
      } else if (filter === "personalizado" && customDate) {
        const customDateStr = customDate.toLocaleDateString('pt-BR');
        filteredTemplates = filteredTemplates.filter(template => 
          template.DataConjunto === customDateStr
        );
      }
      
      if (filteredTemplates.length > 0) {
        setTemplates(filteredTemplates);
      } else {
        setTemplates([]);
        if (filter !== "todos" || searchTerm) {
          toast({
            title: "Nenhum template encontrado",
            description: "Não há templates que correspondam aos filtros aplicados.",
            variant: "default"
          });
        } else if (whatsappTemplates?.length === 0) {
          toast({
            title: "Nenhum template encontrado",
            description: "Não há templates disponíveis. Crie um novo template.",
            variant: "default"
          });
        }
      }
    } catch (error) {
      console.error("Erro ao carregar templates:", error);
      setError("Não foi possível carregar os templates. Verifique sua conexão e tente novamente.");
      toast({
        title: "Erro ao carregar templates",
        description: "Não foi possível carregar os templates. Verifique sua conexão e tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Templates Salvos</h2>
        <Button onClick={fetchTemplates} variant="outline" size="sm">
          Atualizar
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="p-4">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2 mt-2" />
              </CardHeader>
              <CardContent className="p-4">
                <Skeleton className="h-24 w-full" />
              </CardContent>
              <CardFooter className="p-4 flex justify-end">
                <Skeleton className="h-9 w-20" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : error ? (
        <Card className="p-8 text-center">
          <CardTitle className="mb-2">Erro</CardTitle>
          <CardDescription>
            {error}
          </CardDescription>
          {!user && (
            <div className="mt-4">
              <Button asChild variant="default">
                <a href="/">Fazer Login</a>
              </Button>
            </div>
          )}
        </Card>
      ) : templates.length === 0 ? (
        <Card className="p-8 text-center">
          <CardTitle className="mb-2">Nenhum template encontrado</CardTitle>
          <CardDescription>
            {filter !== "todos" || searchTerm 
              ? "Não há templates que correspondam aos filtros aplicados."
              : "Crie um novo template para começar a usar o sistema."}
          </CardDescription>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template, index) => (
            <TemplateCard key={template.idconjunto || index} template={template} />
          ))}
        </div>
      )}
    </div>
  );
}

interface TemplateCardProps {
  template: WhatsAppTemplateData;
}

function TemplateCard({ template }: TemplateCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-4">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">
            {template.NomeAppGup || `Template ${template.idconjunto?.substring(0, 8) || "Sem ID"}`}
          </CardTitle>
          <Badge variant="outline">{template.statusTp || "Ativo"}</Badge>
        </div>
        <CardDescription>
          Criado em: {template.DataConjunto || "Data não disponível"}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4">
        <Tabs defaultValue="template1">
          <TabsList className="mb-2">
            <TabsTrigger value="template1">Template 1</TabsTrigger>
            <TabsTrigger value="template2">Template 2</TabsTrigger>
            <TabsTrigger value="template3">Template 3</TabsTrigger>
          </TabsList>
          <TabsContent value="template1" className="text-sm border p-2 rounded-md min-h-[100px] max-h-[200px] overflow-auto">
            {template.textTp || "Nenhum conteúdo"}
          </TabsContent>
          <TabsContent value="template2" className="text-sm border p-2 rounded-md min-h-[100px] max-h-[200px] overflow-auto">
            {template.textTp1 || "Nenhum conteúdo"}
          </TabsContent>
          <TabsContent value="template3" className="text-sm border p-2 rounded-md min-h-[100px] max-h-[200px] overflow-auto">
            {template.textTp2 || "Nenhum conteúdo"}
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="p-4 flex justify-end">
        <Button variant="outline" size="sm">
          Usar Template
        </Button>
      </CardFooter>
    </Card>
  );
}
