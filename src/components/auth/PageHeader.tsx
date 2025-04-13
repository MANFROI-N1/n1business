import { motion } from "framer-motion";

interface PageHeaderProps {
  title: string;
  subtitle: string;
}

const PageHeader = ({ title, subtitle }: PageHeaderProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="text-center space-y-2"
    >
      <h2 className="text-2xl font-bold text-zinc-300">{title}</h2>
      <p className="text-sm text-zinc-400">
        {subtitle}
      </p>
    </motion.div>
  );
};

export default PageHeader;
