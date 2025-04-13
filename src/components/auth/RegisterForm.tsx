import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Lock, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface RegisterFormProps {
  isLoading: boolean;
  setIsLoading: (value: boolean) => void;
}

const RegisterForm = ({ isLoading, setIsLoading }: RegisterFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();
  const { signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !confirmPassword) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log("Tentando registrar com:", { email });
      
      const { data, error } = await signUp(email, password);

      console.log("Resposta do registro:", { data, error });

      if (error) {
        console.error("Erro detalhado do registro:", error);
        
        let mensagemErro = "Ocorreu um erro ao realizar o cadastro";
        
        // Tratando mensagens de erro comuns
        if (error.message?.includes("email")) {
          mensagemErro = "Email inválido ou já está em uso";
        } else if (error.message?.includes("password")) {
          mensagemErro = "A senha deve ter pelo menos 6 caracteres";
        }
        
        toast({
          title: "Erro no cadastro",
          description: mensagemErro,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Cadastro realizado",
          description: "Verifique seu email para confirmar o cadastro",
        });
        navigate("/");
      }
    } catch (error) {
      console.error("Erro no registro:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao realizar o cadastro. Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-2"
      >
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
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-2"
      >
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
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
        className="space-y-2"
      >
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500 h-5 w-5" />
          <input
            type="password"
            placeholder="Confirme sua senha"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg py-2 pl-10 pr-4 text-sm text-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-600/30 focus:border-zinc-600 placeholder:text-zinc-500"
            disabled={isLoading}
          />
        </div>
      </motion.div>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full bg-white hover:bg-zinc-100 text-zinc-900 rounded-lg py-2 flex items-center justify-center space-x-2 transition-colors shadow-md hover:shadow-white/10 hover:translate-y-[-1px] active:translate-y-[1px]"
        type="submit"
        disabled={isLoading}
      >
        {isLoading ? (
          <div className="h-5 w-5 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin" />
        ) : (
          <Mail className="h-5 w-5" />
        )}
        <span>{isLoading ? "Cadastrando..." : "Criar conta"}</span>
      </motion.button>
    </form>
  );
};

export default RegisterForm;
