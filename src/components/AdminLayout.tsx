import { BarChart, FileText, MessageSquare, Users, Server, LogOut, Database, Bot } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const menuItems = [
  {
    title: "Dashboard",
    icon: BarChart,
    url: "/admin/relatorios",
  },
  {
    title: "IA Agente",
    icon: Bot,
    url: "/admin/ia-agente",
  },
  {
    title: "Template",
    icon: FileText,
    url: "/admin/templates",
  },
  {
    title: "Campanhas",
    icon: MessageSquare,
    url: "/admin/campanhas",
  },
  {
    title: "Mailing",
    icon: Database,
    url: "/admin/mailing",
  },
  {
    title: "Instâncias",
    icon: Server,
    url: "/admin/instancias",
  },
  {
    title: "Usuários",
    icon: Users,
    url: "/admin/usuarios",
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();
  const { user, signOut } = useAuth();
  
  // Extract the first letter of the email for avatar fallback
  const userInitial = user?.email ? user.email[0].toUpperCase() : '?';
  
  // Determine user role (simplified version - in a real app you would fetch this from the backend)
  const userRole = "Administrador"; // This would be dynamic in a real implementation
  
  // Digital avatar URL - using a digital robot/AI avatar style
  const avatarUrl = "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=256&q=80";
  
  return (
    <SidebarProvider>
      <div className="min-h-screen flex flex-nowrap w-full bg-zinc-900">
        <Sidebar 
          variant="sidebar" 
          className={`bg-zinc-900 border-r border-zinc-800 ${isMobile ? "!w-12" : "!w-60"}`}
        > 
          <SidebarHeader className="flex justify-center items-center py-4 border-b border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10">
                <img src="/n1-logo.svg" alt="N1 Logo" className="h-8 w-8" />
              </div>
              {!isMobile && (
                <span className="font-bold text-lg bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                  N1 BUSINESS
                </span>
              )}
            </div>
          </SidebarHeader>
          <SidebarContent className="px-3 py-4">
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild
                        className="mt-1 transition-all duration-200 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-300"
                      >
                        <Link 
                          to={item.url} 
                          className="flex items-center gap-3 text-sm font-medium"
                        >
                          <div className="flex items-center justify-center w-8 h-8 rounded-md">
                            <item.icon className="h-5 w-5 text-zinc-400" />
                          </div>
                          {!isMobile && <span>{item.title}</span>}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          
          <SidebarFooter className="mt-auto mb-4 px-3">
            <Separator className="my-3 bg-zinc-800" />
            {user && (
              <div 
                className={`flex ${isMobile ? 'justify-center' : 'items-center'} gap-3 p-3 rounded-lg relative overflow-hidden bg-zinc-800 border border-zinc-700`}
              >
                <Avatar className="h-10 w-10 border border-zinc-700 z-10 relative">
                  <AvatarImage src={avatarUrl} alt={user.email || "User"} />
                  <AvatarFallback className="bg-gradient-to-br from-zinc-700 to-zinc-800 text-zinc-300">
                    {userInitial}
                  </AvatarFallback>
                </Avatar>
                
                {!isMobile && (
                  <div className="flex flex-col overflow-hidden z-10 relative">
                    <span className="text-sm font-medium truncate text-zinc-300">
                      {user.email}
                    </span>
                    <span className="text-xs text-zinc-400">
                      {userRole}
                    </span>
                  </div>
                )}
                
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="ml-auto h-8 w-8 text-zinc-400 hover:text-zinc-300 hover:bg-zinc-700 z-10 relative"
                  onClick={signOut}
                  title="Sair"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            )}
          </SidebarFooter>
        </Sidebar>
        <main className="flex-1 p-2 sm:p-3 lg:p-4 w-full overflow-auto bg-zinc-900 text-zinc-300">
          <SidebarTrigger className="mb-4 text-zinc-400 hover:text-zinc-300 hover:bg-zinc-800" />
          <div className="w-full">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
