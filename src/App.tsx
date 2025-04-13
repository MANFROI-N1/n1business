import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Register from "./pages/Register";
import PasswordRecovery from "./pages/PasswordRecovery";
import NotFound from "./pages/NotFound";
import UsersPage from "./pages/admin/Users";
import CampanhasPage from "./pages/admin/Campanhas";
import TemplatesPage from "./pages/admin/Templates";
import RelatoriosPage from "./pages/admin/Relatorios";
import InstanciasPage from "./pages/admin/Instancias";
import MailingPage from "./pages/admin/Mailing";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/cadastro" element={<Register />} />
            <Route path="/recuperar-senha" element={<PasswordRecovery />} />
            <Route path="/admin/usuarios" element={<UsersPage />} />
            <Route path="/admin/campanhas" element={<CampanhasPage />} />
            <Route path="/admin/templates" element={<TemplatesPage />} />
            <Route path="/admin/relatorios" element={<RelatoriosPage />} />
            <Route path="/admin/instancias" element={<InstanciasPage />} />
            <Route path="/admin/mailing" element={<MailingPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
