import { useState } from "react";
import { motion } from "framer-motion";
import RegisterForm from "@/components/auth/RegisterForm";
import PageHeader from "@/components/auth/PageHeader";
import LoginLink from "@/components/auth/LoginLink";
import BackButton from "@/components/auth/BackButton";

const Register = () => {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-zinc-900 to-zinc-800 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 space-y-6 shadow-lg">
          <PageHeader 
            title="Criar uma nova conta" 
            subtitle="Preencha os dados abaixo para se cadastrar" 
          />

          <RegisterForm isLoading={isLoading} setIsLoading={setIsLoading} />
          
          <LoginLink />
          
          <BackButton />
        </div>
        
        <p className="text-center mt-4 text-sm text-zinc-500">
          Protegido com criptografia de ponta a ponta
        </p>
      </motion.div>
    </div>
  );
};

export default Register;
