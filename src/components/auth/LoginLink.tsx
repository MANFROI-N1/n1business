import { motion } from "framer-motion";
import { Link } from "react-router-dom";

interface LoginLinkProps {
  delay?: number;
}

const LoginLink = ({ delay = 0.7 }: LoginLinkProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay }}
      className="text-center text-sm"
    >
      <p className="text-zinc-400">
        Já tem uma conta?{" "}
        <Link to="/" className="text-zinc-300 hover:underline">
          Faça login
        </Link>
      </p>
    </motion.div>
  );
};

export default LoginLink;
