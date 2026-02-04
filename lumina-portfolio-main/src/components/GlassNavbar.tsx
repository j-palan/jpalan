import { motion } from "framer-motion";
import { MagneticButton } from "./MagneticButton";

const navItems = [
  { label: "About", href: "#about" },
  { label: "Experience", href: "#experience" },
  { label: "Projects", href: "#projects" },
  { label: "Contact", href: "#contact" },
];

export const GlassNavbar = () => {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 left-0 right-0 z-50 px-6 py-4"
    >
      <nav className="max-w-5xl mx-auto">
        <div className="glass rounded-full px-2 py-2 flex items-center justify-between">
          {/* Logo */}
          <MagneticButton href="#" className="px-4 py-2">
            <span className="text-lg font-semibold tracking-tight">JP</span>
          </MagneticButton>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <MagneticButton key={item.label} href={item.href}>
                <span className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200">
                  {item.label}
                </span>
              </MagneticButton>
            ))}
          </div>

          {/* CTA */}
          <MagneticButton href="mailto:j2palan@uwaterloo.ca">
            <span className="glass-button text-sm">
              Get in Touch
            </span>
          </MagneticButton>
        </div>
      </nav>
    </motion.header>
  );
};
