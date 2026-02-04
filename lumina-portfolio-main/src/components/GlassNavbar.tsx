import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { MagneticButton } from "./MagneticButton";

const navItems = [
  { label: "Experience", href: "/work#experience" },
  { label: "Projects", href: "/work#projects" },
  { label: "Skills", href: "/work#skills" },
  { label: "Contact", href: "/work#contact" },
];

export const GlassNavbar = () => {
  const location = useLocation();

  const handleNavClick = (href: string) => {
    // If already on /work, scroll to section; otherwise navigate
    if (location.pathname === "/work" && href.startsWith("/work#")) {
      const id = href.replace("/work#", "");
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 left-0 right-0 z-50 px-6 py-4"
    >
      <nav className="max-w-5xl mx-auto">
        <div className="glass rounded-full px-2 py-2 flex items-center justify-between">
          {/* Logo — link home */}
          <MagneticButton>
            <Link to="/" className="px-4 py-2 block">
              <span className="font-caslon text-lg font-semibold tracking-tight hover:text-accent transition-colors">
                JP
              </span>
            </Link>
          </MagneticButton>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <MagneticButton key={item.label}>
                <Link
                  to={item.href}
                  onClick={() => handleNavClick(item.href)}
                  className="px-4 py-2 block text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                >
                  {item.label}
                </Link>
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
