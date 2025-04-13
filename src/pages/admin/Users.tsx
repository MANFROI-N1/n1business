
import { useState } from "react";
import { motion } from "framer-motion";
import { Users, Search, PlusCircle } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import CreateUserDialog from "@/components/users/CreateUserDialog";
import UsersList from "@/components/users/UsersList";

export default function UsersPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("todos");

  return (
    <AdminLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Users className="h-8 w-8" />
            <h1 className="text-2xl font-bold">Gerenciamento de Usuários</h1>
          </div>
          <Button 
            onClick={() => setIsDialogOpen(true)} 
            className="bg-white text-black hover:bg-gray-100 flex items-center gap-2"
          >
            <PlusCircle className="h-4 w-4" />
            Usuário +
          </Button>
        </div>
        
        <Tabs 
          defaultValue="todos" 
          className="w-full"
          onValueChange={setActiveTab}
        >
          <TabsList className="mb-4">
            <TabsTrigger value="todos">Todos</TabsTrigger>
            <TabsTrigger value="admin">Administradores</TabsTrigger>
            <TabsTrigger value="manager">Gerentes</TabsTrigger>
            <TabsTrigger value="user">Usuários</TabsTrigger>
          </TabsList>
          
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input 
                placeholder="Buscar usuários..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <TabsContent value="todos" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Todos os Usuários</CardTitle>
                <CardDescription>
                  Visualize e gerencie todos os usuários do sistema.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UsersList searchTerm={searchTerm} />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="admin" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Administradores</CardTitle>
                <CardDescription>
                  Visualize e gerencie os usuários com papel de administrador.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UsersList type="admin" searchTerm={searchTerm} />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="manager" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Gerentes</CardTitle>
                <CardDescription>
                  Visualize e gerencie os usuários com papel de gerente.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UsersList type="manager" searchTerm={searchTerm} />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="user" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Usuários</CardTitle>
                <CardDescription>
                  Visualize e gerencie os usuários comuns.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UsersList type="user" searchTerm={searchTerm} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <CreateUserDialog 
          open={isDialogOpen} 
          onOpenChange={setIsDialogOpen} 
        />
      </motion.div>
    </AdminLayout>
  );
}
