import { motion } from "framer-motion";
import { GlassCard } from "./GlassCard";
import { MagneticButton } from "./MagneticButton";
import { ArrowUpRight, Trophy, Users } from "lucide-react";

const projects = [
  {
    title: "Incident Manager",
    description:
      "End-to-end incident replay and analysis platform with LLM-powered workflows to classify incident timelines, root causes, and action items in real time.",
    award: "Won $5,000 at Hack the 6ix",
    tech: ["Ruby on Rails", "OpenAI API", "Next.js", "Prompt Engineering"],
    icon: Trophy,
  },
  {
    title: "Runz",
    description:
      "Mobile app to organize university pickup basketball runs with real-time 'I'm Next' queues and team management.",
    stats: "50+ active users",
    tech: ["React Native", "Expo", "Supabase", "Real-time"],
    icon: Users,
  },
];

export const ProjectsSection = () => {
  return (
    <section id="projects" className="section px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <span className="section-title">Projects</span>
          <h2 className="font-caslon text-4xl md:text-5xl font-semibold tracking-tight">
            What I've <span className="gradient-text-accent">built</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {projects.map((project, index) => (
            <GlassCard key={project.title} delay={index * 0.15} className="group">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center">
                  <project.icon className="w-6 h-6 text-accent" />
                </div>
                <MagneticButton>
                  <div className="w-10 h-10 rounded-full glass flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </MagneticButton>
              </div>

              <h3 className="text-xl font-semibold mb-2">{project.title}</h3>

              {project.award && (
                <p className="text-accent text-sm font-medium mb-2">{project.award}</p>
              )}
              {project.stats && (
                <p className="text-accent/80 text-sm font-medium mb-2">{project.stats}</p>
              )}

              <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                {project.description}
              </p>

              <div className="flex flex-wrap gap-2">
                {project.tech.map((t) => (
                  <span
                    key={t}
                    className="px-3 py-1 text-xs rounded-full bg-secondary/50 text-secondary-foreground"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  );
};
