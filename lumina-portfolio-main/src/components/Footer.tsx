import { motion } from "framer-motion";

export const Footer = () => {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="py-12 px-6 border-t border-border/50"
    >
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
        <p>
          Designed & Built by <span className="text-foreground">Jai Palan</span>
        </p>
        <p>© {new Date().getFullYear()} All rights reserved.</p>
      </div>
    </motion.footer>
  );
};
