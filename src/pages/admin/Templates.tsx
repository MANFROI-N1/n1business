import { motion } from "framer-motion";
import { CalendarIcon, FileText, Plus, Search } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TemplatesList } from "@/components/templates/TemplatesList";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import CreateTemplateDialog from "@/components/templates/CreateTemplateDialog";

export default function TemplatesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [activeTab, setActiveTab] = useState("todos");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0); // Estado para forçar atualização da lista
  
  // Função para atualizar a lista após criar um novo conjunto
  const handleCreateDialogChange = (open: boolean) => {
    setCreateDialogOpen(open);
    
    // Se o diálogo foi fechado, atualizar a lista
    if (!open) {
      // Incrementar o refreshTrigger para forçar a atualização da lista
      setRefreshTrigger(prev => prev + 1);
    }
  };

  // Função para lidar com o salvamento de templates
  const handleSaveTemplate = (data: any) => {
    console.log("Template salvo:", data);
    // Incrementar o refreshTrigger para forçar a atualização da lista
    setRefreshTrigger(prev => prev + 1);
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
            <FileText className="h-8 w-8" />
            <h1 className="text-2xl font-bold">Gerenciamento de Templates</h1>
          </div>
          <Button variant="default" onClick={() => setCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Template
          </Button>
        </div>
        
        <Tabs 
          defaultValue="todos" 
          className="w-full"
          onValueChange={setActiveTab}
        >
          <TabsList className="mb-4">
            <TabsTrigger value="todos">Todos</TabsTrigger>
            <TabsTrigger value="hoje">Hoje</TabsTrigger>
            <TabsTrigger value="ontem">Ontem</TabsTrigger>
            <TabsTrigger value="personalizados">Personalizado</TabsTrigger>
          </TabsList>
          
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input 
                placeholder="Buscar templates..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {activeTab === "personalizados" && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="mr-auto border-white text-white">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "dd/MM/yyyy") : "Selecionar data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            )}
          </div>

          <TabsContent value="todos" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Todos os Templates</CardTitle>
                <CardDescription>
                  Visualize e gerencie todos os templates disponíveis no sistema.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TemplatesList searchTerm={searchTerm} refreshTrigger={refreshTrigger} />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="hoje" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Templates de Hoje</CardTitle>
                <CardDescription>
                  Visualize e gerencie os templates criados hoje.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TemplatesList searchTerm={searchTerm} filter="hoje" refreshTrigger={refreshTrigger} />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="ontem" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Templates de Ontem</CardTitle>
                <CardDescription>
                  Visualize e gerencie os templates criados ontem.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TemplatesList searchTerm={searchTerm} filter="ontem" refreshTrigger={refreshTrigger} />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="personalizados" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Templates Personalizado</CardTitle>
                <CardDescription>
                  Selecione uma data específica para visualizar os templates criados nessa data.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TemplatesList 
                  searchTerm={searchTerm} 
                  filter="personalizado" 
                  customDate={selectedDate}
                  refreshTrigger={refreshTrigger}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <CreateTemplateDialog 
          open={createDialogOpen} 
          onOpenChange={handleCreateDialogChange} 
          onSave={handleSaveTemplate}
        />
      </motion.div>
    </AdminLayout>
  );
}
