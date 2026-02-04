import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Linkedin, Github, Mail } from "lucide-react";
import { MagneticButton } from "./MagneticButton";

/** Company link with logo, bold, hover underline */
const CompanyLink = ({
  href,
  logo,
  name,
  logoClassName,
}: {
  href: string;
  logo: string;
  name: string;
  logoClassName?: string;
}) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="font-semibold text-foreground hover:underline underline-offset-2"
  >
    <img
      src={logo}
      alt={name}
      className={`inline-block align-text-bottom object-contain mr-1.5 ${logoClassName ?? "h-4 w-4"}`}
    />
    <span className="align-baseline">{name}</span>
  </a>
);

/** Bold metric */
const Metric = ({ children }: { children: React.ReactNode }) => (
  <span className="font-semibold text-foreground">{children}</span>
);

/** Money value with green glow */
const Money = ({ children }: { children: React.ReactNode }) => (
  <span className="font-semibold text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.6)]">
    {children}
  </span>
);

export const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center px-6 overflow-hidden">
      {/* Ambient gradient background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-1/4 -left-1/4 w-[600px] h-[600px] rounded-full opacity-30"
          style={{
            background: "radial-gradient(circle, hsl(210 100% 50% / 0.3) 0%, transparent 70%)",
          }}
          animate={{
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-1/4 -right-1/4 w-[500px] h-[500px] rounded-full opacity-20"
          style={{
            background: "radial-gradient(circle, hsl(280 100% 50% / 0.2) 0%, transparent 70%)",
          }}
          animate={{
            x: [0, -30, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Content — two-column layout */}
      <div className="relative z-10 w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center py-24">
        {/* Left — Name + CTA */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="text-left"
        >
          <h1 className="font-caslon text-hero font-semibold tracking-tight leading-[1.1] mb-8">
            <span className="block font-normal text-muted-foreground">Hey, I'm</span>
            <MagneticButton>
              <span className="block gradient-text-accent cursor-default">Jai Palan</span>
            </MagneticButton>
          </h1>

          <div className="flex items-center gap-4">
            <Link
              to="/work"
              className="inline-block glass-button glow text-lg font-medium"
            >
              View My Work
            </Link>

            {/* Social icons */}
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center gap-2"
            >
              <MagneticButton href="https://www.linkedin.com/in/jai-palan">
                <div className="w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-white/10 transition-colors">
                  <Linkedin className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
                </div>
              </MagneticButton>
              <MagneticButton href="https://github.com/j-palan">
                <div className="w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-white/10 transition-colors">
                  <Github className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
                </div>
              </MagneticButton>
              <MagneticButton href="mailto:j2palan@uwaterloo.ca">
                <div className="w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-white/10 transition-colors">
                  <Mail className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
                </div>
              </MagneticButton>
            </motion.div>
          </div>
        </motion.div>

        {/* Right — Impact bullets + contact */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="text-left"
        >
          <h2 className="text-sm font-medium uppercase tracking-widest text-muted-foreground mb-6">
            Proven Impact
          </h2>

          <ul className="space-y-4 mb-8">
           

            {/* Bullet 2 — VITALL */}
            <motion.li
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="flex gap-3 text-sm md:text-base text-foreground/80 leading-relaxed"
            >
              <span className="mt-2 shrink-0 w-1.5 h-1.5 rounded-full bg-accent" aria-hidden />
              <span>
                Startup operator at{" "}
                <CompanyLink href="https://www.vitall.com/" logo="/vitall.png" name="VITALL" />
                , a fast-moving early-stage company, where I owned end-to-end features that cut manual workflows by <Metric>10×</Metric>, saved <Money>$150K+</Money> annually, and supported <Metric>13+</Metric> paying clients, directly contributing to <Money>$130K</Money> in revenue.
              </span>
            </motion.li>

            {/* Bullet 3 — LTIMindtree */}
            <motion.li
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="flex gap-3 text-sm md:text-base text-foreground/80 leading-relaxed"
            >
              <span className="mt-2 shrink-0 w-1.5 h-1.5 rounded-full bg-accent" aria-hidden />
              <span>
                Enterprise engineering experience at{" "}
                <CompanyLink href="https://www.ltimindtree.com/" logo="/LTI.png" name="LTIMindtree" />
                , working on production systems that process <Metric>100,000+</Metric> financial transactions weekly between Unitrax™ and <Metric>5+</Metric> major financial institutions.
              </span>
            </motion.li>

            {/* Bullet 4 — Industry 4.0 */}
            <motion.li
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="flex gap-3 text-sm md:text-base text-foreground/80 leading-relaxed"
            >
              <span className="mt-2 shrink-0 w-1.5 h-1.5 rounded-full bg-accent" aria-hidden />
              <span>
                Technical leader at{" "}
                <CompanyLink
                  href="https://www.uwindustry4.ca/"
                  logo="/i4logo.png"
                  name="Industry 4.0"
                  logoClassName="h-5 w-5"
                />
                {" "}, where I built and scaled a platform to <Metric>220+</Metric> users, secured <Metric>3</Metric> sponsors, raised <Money>$2K+</Money>, and led competitions engaging <Metric>200+</Metric> participants.
              </span>
            </motion.li>

            {/* Bullet 5 */}
            <motion.li
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.0, ease: [0.16, 1, 0.3, 1] }}
              className="flex gap-3 text-sm md:text-base text-foreground/80 leading-relaxed"
            >
              <span className="mt-2 shrink-0 w-1.5 h-1.5 rounded-full bg-accent" aria-hidden />
              <span>
               I love building things that help people and make a difference. I want to see my work used by millions of people.
              </span>
            </motion.li>
          </ul>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-sm text-muted-foreground"
          >
            You can reach out to me at{" "}
            <span className="text-foreground">j2palan[at]uwaterloo[dot]ca</span>
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
};
