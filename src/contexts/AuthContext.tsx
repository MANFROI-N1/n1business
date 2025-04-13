
import { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{
    error: Error | null;
    data: Session | null;
  }>;
  signUp: (email: string, password: string) => Promise<{
    error: Error | null;
    data: any;
  }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Obter sessão inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("Sessão inicial:", session);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Ouvir mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        console.log("Estado de autenticação alterado:", _event, session);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      console.log("Tentando fazer login com:", { email });
      
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });
      
      console.log("Resposta do login:", { data, error });
      
      if (!error && data?.session) {
        setSession(data.session);
        setUser(data.session.user);
        navigate('/admin/relatorios');
        
        toast({
          title: "Login realizado com sucesso",
          description: `Bem-vindo, ${data.session.user.email}`,
        });
      }
      
      return { data: data?.session || null, error };
    } catch (err) {
      console.error("Erro de login:", err);
      return { data: null, error: err as Error };
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      console.log("Tentando registrar do contexto com:", { email });
      
      // Registrando com configuração para confirmação de email
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            email_confirm: true,
          }
        }
      });
      
      console.log("Resposta do registro do contexto:", { data, error });
      
      return { data, error };
    } catch (err) {
      console.error("Erro de registro do contexto:", err);
      return { data: null, error: err as Error };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/');
      toast({
        title: "Logout realizado",
        description: "Você saiu da sua conta com sucesso",
      });
    } catch (err) {
      console.error("Erro ao sair:", err);
      toast({
        title: "Erro ao sair",
        description: "Ocorreu um erro ao fazer logout",
        variant: "destructive",
      });
    }
  };

  const value = {
    session,
    user,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
