import { motion } from 'framer-motion';
import { ArrowDown, Github, Mail, ExternalLink } from 'lucide-react';
import FloatingShapes from './FloatingShapes';

const Hero = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94] as const,
      },
    },
  };

  const scrollToWork = () => {
    document.getElementById('highlights')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-muted/20" />
      
      {/* Floating shapes */}
      <FloatingShapes />

      {/* Grid overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(hsl(var(--foreground)) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Content */}
      <motion.div
        className="relative z-10 container mx-auto px-6 text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Badge */}
        <motion.div variants={itemVariants} className="mb-8">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card text-sm text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            Open to opportunities
          </span>
        </motion.div>

        {/* Name */}
        <motion.h1 
          variants={itemVariants}
          className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6"
        >
          <span className="gradient-text">Jai Palan</span>
        </motion.h1>

        {/* Tagline */}
        <motion.p 
          variants={itemVariants}
          className="text-xl md:text-2xl lg:text-3xl text-muted-foreground font-light max-w-3xl mx-auto mb-4"
        >
          Software engineer building scalable systems,
        </motion.p>
        <motion.p 
          variants={itemVariants}
          className="text-xl md:text-2xl lg:text-3xl text-muted-foreground font-light max-w-3xl mx-auto mb-8"
        >
          <span className="text-foreground font-medium">AI tools</span>, and{' '}
          <span className="text-foreground font-medium">high-performance products</span>.
        </motion.p>

        {/* Tech stack pills */}
        <motion.div 
          variants={itemVariants}
          className="flex flex-wrap justify-center gap-3 mb-12"
        >
          {['Backend', 'AI/ML', 'Systems', 'Product'].map((tag) => (
            <span 
              key={tag}
              className="px-4 py-1.5 rounded-full text-sm font-medium border border-border bg-muted/30 text-muted-foreground hover:border-primary/50 hover:text-foreground transition-all duration-300"
            >
              {tag}
            </span>
          ))}
        </motion.div>

        {/* CTA Buttons */}
        <motion.div 
          variants={itemVariants}
          className="flex flex-wrap justify-center gap-4"
        >
          <button 
            onClick={scrollToWork}
            className="magnetic group px-8 py-4 rounded-xl btn-primary font-semibold text-lg flex items-center gap-2"
          >
            View Work
            <ArrowDown className="w-5 h-5 group-hover:translate-y-1 transition-transform" />
          </button>
          
          <a 
            href="mailto:jai@example.com"
            className="magnetic px-8 py-4 rounded-xl btn-glass font-semibold text-lg flex items-center gap-2 hover:text-primary transition-colors"
          >
            <Mail className="w-5 h-5" />
            Contact
          </a>
          
          <a 
            href="https://github.com/jaipalan"
            target="_blank"
            rel="noopener noreferrer"
            className="magnetic px-8 py-4 rounded-xl btn-glass font-semibold text-lg flex items-center gap-2 hover:text-primary transition-colors"
          >
            <Github className="w-5 h-5" />
            GitHub
            <ExternalLink className="w-4 h-4 opacity-50" />
          </a>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div 
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex flex-col items-center gap-2 text-muted-foreground"
        >
          <span className="text-xs uppercase tracking-widest">Scroll</span>
          <ArrowDown className="w-4 h-4" />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero;
