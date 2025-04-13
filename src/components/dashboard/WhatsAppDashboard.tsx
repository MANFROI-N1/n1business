import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Clock, BarChart } from "lucide-react";
import {
  BarChart as RechartsBarChart,
  LineChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

// Dados vazios para o gráfico (mantendo a estrutura)
const messageData = [];

// Componente de estatística
interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
  className?: string;
}

function StatCard({ title, value, icon, description, className }: StatCardProps) {
  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h3 className="text-2xl font-bold mt-1">{value}</h3>
            {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
          </div>
          <div className="p-2 bg-primary/10 rounded-full">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function WhatsAppDashboard() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Mensagens Enviadas" 
          value="-" 
          icon={<BarChart className="h-5 w-5 text-primary" />}
          description=""
        />
        
        <StatCard 
          title="Mensagens Entregues" 
          value="-" 
          icon={<Check className="h-5 w-5 text-green-500" />}
          description=""
        />
        
        <StatCard 
          title="Mensagens Lidas" 
          value="-" 
          icon={<Check className="h-5 w-5 text-blue-500" />}
          description=""
        />
        
        <StatCard 
          title="Tempo Médio de Resposta" 
          value="-" 
          icon={<Clock className="h-5 w-5 text-orange-500" />}
          description=""
        />
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Desempenho de Mensagens</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsBarChart data={messageData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="enviadas" fill="#4f46e5" name="Enviadas" />
                <Bar dataKey="entregues" fill="#10b981" name="Entregues" />
                <Bar dataKey="lidas" fill="#3b82f6" name="Lidas" />
              </RechartsBarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Taxa de Engajamento</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={messageData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="lidas" 
                  stroke="#3b82f6" 
                  name="Taxa de Leitura" 
                  activeDot={{ r: 8 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Estatísticas de Uso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Templates Mais Usados</span>
                <span className="text-sm text-muted-foreground">Uso</span>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Boas-vindas</span>
                  <div className="flex items-center">
                    <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden mr-2">
                      <div className="h-full bg-primary rounded-full" style={{ width: '0%' }}></div>
                    </div>
                    <span className="text-xs">-</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm">Promoção</span>
                  <div className="flex items-center">
                    <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden mr-2">
                      <div className="h-full bg-primary rounded-full" style={{ width: '0%' }}></div>
                    </div>
                    <span className="text-xs">-</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm">Confirmação</span>
                  <div className="flex items-center">
                    <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden mr-2">
                      <div className="h-full bg-primary rounded-full" style={{ width: '0%' }}></div>
                    </div>
                    <span className="text-xs">-</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm">Atendimento</span>
                  <div className="flex items-center">
                    <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden mr-2">
                      <div className="h-full bg-primary rounded-full" style={{ width: '0%' }}></div>
                    </div>
                    <span className="text-xs">-</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
