import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { ExternalLink, Github, Bot, Smartphone, Sparkles, Zap } from 'lucide-react';

const projects = [
  {
    title: 'Incident Manager',
    subtitle: 'AI-Powered Incident Analysis Platform',
    description: 'A sophisticated platform leveraging LLMs to automatically analyze, categorize, and suggest resolutions for production incidents. Features real-time alerting and pattern detection.',
    tags: ['AI/ML', 'Full-stack', 'React', 'Python', 'OpenAI'],
    icon: Bot,
    gradient: 'from-primary to-secondary',
    highlights: ['GPT-4 Integration', 'Real-time Analysis', '90% Faster Resolution'],
    demoUrl: '#',
    githubUrl: '#',
  },
  {
    title: 'Runz',
    subtitle: 'Mobile App for Pickup Sports',
    description: 'A location-based mobile application that connects athletes for spontaneous pickup games. Features real-time matchmaking, venue discovery, and social networking.',
    tags: ['Mobile', 'React Native', 'Node.js', 'Firebase', 'Maps API'],
    icon: Smartphone,
    gradient: 'from-emerald-500 to-teal-500',
    highlights: ['10K+ Users', 'Real-time Chat', 'GPS Matching'],
    demoUrl: '#',
    githubUrl: '#',
  },
];

const ProjectCard = ({ project, index }: { project: typeof projects[0]; index: number }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
      transition={{ duration: 0.8, delay: index * 0.2 }}
      className="group relative"
    >
      <div className="relative rounded-2xl glass-card overflow-hidden transition-all duration-300 hover:scale-[1.01] border border-white/[0.06]">
        {/* Card content */}
        <div className="relative rounded-2xl bg-card/80 p-8 md:p-10">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-8">
            <div>
              {/* Icon */}
              <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${project.gradient} mb-4`}>
                <project.icon className="w-8 h-8 text-white" />
              </div>
              
              {/* Title */}
              <h3 className="text-2xl md:text-3xl font-bold mb-2 group-hover:text-primary transition-colors">
                {project.title}
              </h3>
              <p className="text-muted-foreground font-medium">{project.subtitle}</p>
            </div>

            {/* CTA Buttons */}
            <div className="flex gap-3">
              <a
                href={project.demoUrl}
                className="magnetic inline-flex items-center gap-2 px-5 py-2.5 rounded-xl btn-primary text-sm font-semibold"
              >
                <Zap className="w-4 h-4" />
                Live Demo
              </a>
              <a
                href={project.githubUrl}
                className="magnetic inline-flex items-center gap-2 px-5 py-2.5 rounded-xl btn-glass text-sm font-semibold hover:text-primary"
              >
                <Github className="w-4 h-4" />
                Code
              </a>
            </div>
          </div>

          {/* Description */}
          <p className="text-muted-foreground leading-relaxed mb-8 max-w-2xl">
            {project.description}
          </p>

          {/* Highlights */}
          <div className="flex flex-wrap gap-3 mb-8">
            {project.highlights.map((highlight) => (
              <span
                key={highlight}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {highlight}
              </span>
            ))}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1.5 rounded-lg bg-muted text-muted-foreground text-sm"
              >
                {tag}
              </span>
            ))}
          </div>

        </div>
      </div>
    </motion.div>
  );
};

const Projects = () => {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section id="projects" className="py-24 md:py-32 relative">
      <div className="container mx-auto px-6 relative">
        {/* Section header */}
        <motion.div
          ref={sectionRef}
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium bg-primary/10 text-primary mb-4">
            <Sparkles className="w-4 h-4" />
            Featured Work
          </span>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Projects That <span className="gradient-text">Ship</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From AI-powered platforms to mobile apps — products built to solve real problems.
          </p>
        </motion.div>

        {/* Projects grid */}
        <div className="space-y-8">
          {projects.map((project, index) => (
            <ProjectCard key={project.title} project={project} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Projects;
