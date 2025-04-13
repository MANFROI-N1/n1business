import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Lock, Mail, LogIn } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        toast({
          title: "Erro de login",
          description: "E-mail ou senha inválidos",
          variant: "destructive",
        });
        console.error("Login error details:", error);
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao fazer login",
        variant: "destructive",
      });
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-zinc-900 to-zinc-800 p-4">
      <div className="w-full max-w-md">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 space-y-6 shadow-lg">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-zinc-300">Bem-vindo a N1 Negócios</h2>
            <p className="text-sm text-zinc-400">
              Faça login para acessar sua conta
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500 h-5 w-5" />
                <input
                  type="email"
                  placeholder="Seu e-mail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg py-2 pl-10 pr-4 text-sm text-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-600/30 focus:border-zinc-600 placeholder:text-zinc-500"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500 h-5 w-5" />
                <input
                  type="password"
                  placeholder="Sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg py-2 pl-10 pr-4 text-sm text-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-600/30 focus:border-zinc-600 placeholder:text-zinc-500"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="text-right">
              <Link
                to="/recuperar-senha"
                className="text-sm text-zinc-400 hover:text-zinc-300 hover:underline"
              >
                Esqueceu sua senha?
              </Link>
            </div>

            <button
              className="w-full bg-white hover:bg-zinc-100 text-zinc-900 rounded-lg py-2 flex items-center justify-center space-x-2 transition-colors shadow-md hover:shadow-white/10 hover:translate-y-[-1px] active:translate-y-[1px]"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="h-5 w-5 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin" />
              ) : (
                <LogIn className="h-5 w-5" />
              )}
              <span>{isLoading ? "Entrando..." : "Entrar"}</span>
            </button>
          </form>

          <div className="text-center text-sm">
            <p className="text-zinc-400">
              Não tem uma conta?{" "}
              <Link to="/cadastro" className="text-zinc-300 hover:underline">
                Criar conta
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center mt-4 text-sm text-zinc-500">
          Protegido com criptografia de ponta a ponta
        </p>
      </div>
    </div>
  );
};

export default Index;
