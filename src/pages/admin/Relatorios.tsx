import { motion } from "framer-motion";
import { BarChart, BarChart2, Phone, PhoneCall, Clock, MessageSquare, User, CheckCircle } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import URADashboard from "@/components/dashboard/URADashboard";
import WhatsAppDashboard from "@/components/dashboard/WhatsAppDashboard";

export default function RelatoriosPage() {
  return (
    <AdminLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="pb-8"
      >
        <div className="flex items-center gap-4 mb-6">
          <BarChart className="h-8 w-8" />
          <h1 className="text-2xl font-bold">Dashboard</h1>
        </div>
        
        <Tabs defaultValue="ura" className="space-y-4">
          <TabsList className="mb-2">
            <TabsTrigger value="ura">URA</TabsTrigger>
            <TabsTrigger value="whatsapp">WHATSAPP</TabsTrigger>
            <TabsTrigger value="agrupado">AGRUPADO</TabsTrigger>
            <TabsTrigger value="custos">CUSTOS</TabsTrigger>
            <TabsTrigger value="personalizado">PERSONALIZADO</TabsTrigger>
          </TabsList>
          
          <TabsContent value="ura" className="space-y-4">
            <URADashboard />
          </TabsContent>
          
          <TabsContent value="whatsapp" className="space-y-4">
            <WhatsAppDashboard />
          </TabsContent>
          
          <TabsContent value="agrupado" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Dados Agrupados</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Dados agrupados serão implementados aqui</p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="custos" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Dados de Custos</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Dados de custos serão implementados aqui</p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="personalizado" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Dashboard Personalizado</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Dashboard personalizado será implementado aqui</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </AdminLayout>
  );
}
