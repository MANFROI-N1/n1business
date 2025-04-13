import { createClient } from '@supabase/supabase-js';

// Usando variáveis de ambiente para as credenciais do Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xqxmrkedkpdgfvtisnsf.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhxeG1ya2Vka3BkZ2Z2dGlzbnNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAyMzYwODMsImV4cCI6MjA1NTgxMjA4M30.E4gxJupuA96mc2_V6g8Y166WcfOOA3oWKB906P5FBS4';

// Log para debug em desenvolvimento
if (import.meta.env.DEV) {
  console.log('Supabase URL:', supabaseUrl);
  console.log('Usando variáveis de ambiente:', !!import.meta.env.VITE_SUPABASE_URL);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Função para facilitar o diagnóstico de problemas de autenticação
export const checkAuthStatus = async () => {
  try {
    const { data, error } = await supabase.auth.getSession();
    console.log("Status de autenticação:", { data, error });
    return { data, error };
  } catch (err) {
    console.error("Erro ao verificar status de autenticação:", err);
    return { data: null, error: err };
  }
};
