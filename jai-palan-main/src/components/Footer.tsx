import { motion } from 'framer-motion';
import { Github, Linkedin, Mail, ArrowUp, Heart } from 'lucide-react';

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const socialLinks = [
    { icon: Github, href: 'https://github.com/jaipalan', label: 'GitHub' },
    { icon: Linkedin, href: 'https://linkedin.com/in/jaipalan', label: 'LinkedIn' },
    { icon: Mail, href: 'mailto:jai@example.com', label: 'Email' },
  ];

  return (
    <footer className="py-16 md:py-24 relative">
      <div className="absolute top-0 left-0 right-0 h-px bg-white/[0.06]" />

      <div className="container mx-auto px-6">
        <div className="flex flex-col items-center">
          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h3 className="text-2xl md:text-4xl font-bold mb-4">
              Let's Build Something <span className="gradient-text">Amazing</span>
            </h3>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Open to new opportunities and interesting projects. Let's connect!
            </p>
            
            <a
              href="mailto:jai@example.com"
              className="magnetic inline-flex items-center gap-2 px-8 py-4 rounded-xl btn-primary text-lg font-semibold"
            >
              <Mail className="w-5 h-5" />
              Get in Touch
            </a>
          </motion.div>

          {/* Social links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex items-center gap-4 mb-12"
          >
            {socialLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target={link.href.startsWith('http') ? '_blank' : undefined}
                rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                aria-label={link.label}
                className="magnetic p-4 rounded-xl glass-card hover:border-primary/50 transition-all duration-300 group"
              >
                <link.icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </a>
            ))}
          </motion.div>

          {/* Scroll to top */}
          <motion.button
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            onClick={scrollToTop}
            className="magnetic p-3 rounded-full glass-card border border-white/[0.06] hover:border-white/[0.12] transition-all duration-300 mb-8 group"
            aria-label="Scroll to top"
          >
            <ArrowUp className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:-translate-y-0.5 transition-all" />
          </motion.button>

          {/* Copyright */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center text-sm text-muted-foreground"
          >
            <p className="flex items-center justify-center gap-1">
              Designed & built with <Heart className="w-4 h-4 text-rose-500" /> by Jai Palan
            </p>
            <p className="mt-2">© {new Date().getFullYear()} All rights reserved.</p>
          </motion.div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
