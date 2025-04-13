import { motion } from "framer-motion";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Mail, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";

const PasswordRecovery = () => {
  const [email, setEmail] = useState("");
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Erro",
        description: "Por favor, informe seu e-mail",
        variant: "destructive",
      });
      return;
    }

    // Aqui será implementada a integração com Supabase
    toast({
      title: "Aguarde",
      description: "Implementação do Supabase pendente",
    });
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-zinc-900 to-zinc-800 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 space-y-6 shadow-lg">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center space-y-2"
          >
            <h2 className="text-2xl font-bold text-zinc-300">Recuperar senha</h2>
            <p className="text-sm text-zinc-400">
              Digite seu e-mail para receber um link de recuperação
            </p>
          </motion.div>

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
                />
              </div>
            </motion.div>

            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-white hover:bg-zinc-100 text-zinc-900 rounded-lg py-2 flex items-center justify-center space-x-2 transition-colors shadow-md hover:shadow-white/10 hover:translate-y-[-1px] active:translate-y-[1px]"
              type="submit"
            >
              <RefreshCw className="h-5 w-5" />
              <span>Recuperar senha</span>
            </motion.button>
          </form>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center text-sm"
          >
            <p className="text-zinc-400">
              Lembrou sua senha?{" "}
              <Link to="/" className="text-zinc-300 hover:underline">
                Faça login
              </Link>
            </p>
          </motion.div>
        </div>
        
        <p className="text-center mt-4 text-sm text-zinc-500">
          Protegido com criptografia de ponta a ponta
        </p>
      </motion.div>
    </div>
  );
};

export default PasswordRecovery;
