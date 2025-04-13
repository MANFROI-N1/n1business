
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface BackButtonProps {
  delay?: number;
  to?: string;
  label?: string;
}

const BackButton = ({ delay = 0.8, to = "/", label = "Voltar para login" }: BackButtonProps) => {
  const navigate = useNavigate();

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay }}
      className="pt-2"
    >
      <Button 
        variant="outline" 
        className="w-full flex items-center gap-2"
        onClick={() => navigate(to)}
      >
        <ArrowLeft className="h-4 w-4" />
        {label}
      </Button>
    </motion.div>
  );
};

export default BackButton;
