import { motion } from "framer-motion";
import { MessageSquare, Plus, Search } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useRef } from "react";
import CampanhasTable from "@/components/campanhas/CampanhasTable";
import { useToast } from "@/hooks/use-toast";
import { CreateCampanhaDialog } from "@/components/campanhas/CreateCampanhaDialog";

export default function CampanhasPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { toast } = useToast();
  
  // Referências para as tabelas de campanhas
  const ativasTableRef = useRef(null);
  const agendadasTableRef = useRef(null);
  const concluidasTableRef = useRef(null);
  const todasTableRef = useRef(null);
  
  // Função para atualizar todas as tabelas de campanhas
  const refreshAllTables = () => {
    setRefreshTrigger(prev => prev + 1);
  };
  
  // Função chamada quando uma campanha é criada com sucesso
  const handleCampanhaCreated = () => {
    refreshAllTables();
    setIsCreateDialogOpen(false);
    toast({
      title: "Campanha criada com sucesso",
      description: "A lista de campanhas foi atualizada.",
    });
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
            <MessageSquare className="h-8 w-8" />
            <h1 className="text-2xl font-bold">Gerenciamento de Campanhas</h1>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Campanha
          </Button>
        </div>
        
        <Tabs defaultValue="ativas" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="ativas">Campanhas Ativas</TabsTrigger>
            <TabsTrigger value="agendadas">Agendadas</TabsTrigger>
            <TabsTrigger value="concluidas">Concluídas</TabsTrigger>
            <TabsTrigger value="todas">Todas</TabsTrigger>
          </TabsList>
          
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input 
                placeholder="Buscar campanhas..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <TabsContent value="ativas" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Campanhas Ativas</CardTitle>
                <CardDescription>
                  Visualize e gerencie as campanhas que estão atualmente em execução.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CampanhasTable status="ativa" searchTerm={searchTerm} refreshTrigger={refreshTrigger} />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="agendadas" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Campanhas Agendadas</CardTitle>
                <CardDescription>
                  Visualize e gerencie as campanhas que estão agendadas para execução futura.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CampanhasTable status="agendada" searchTerm={searchTerm} refreshTrigger={refreshTrigger} />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="concluidas" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Campanhas Concluídas</CardTitle>
                <CardDescription>
                  Histórico de campanhas que já foram executadas.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CampanhasTable status="concluida" searchTerm={searchTerm} refreshTrigger={refreshTrigger} />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="todas" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Todas as Campanhas</CardTitle>
                <CardDescription>
                  Visão geral de todas as campanhas no sistema.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CampanhasTable status="todas" searchTerm={searchTerm} refreshTrigger={refreshTrigger} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
      
      {/* Dialog para criar nova campanha */}
      <CreateCampanhaDialog 
        open={isCreateDialogOpen} 
        onOpenChange={setIsCreateDialogOpen} 
        onCampanhaCreated={handleCampanhaCreated}
      />
    </AdminLayout>
  );
}
