import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { TrendingUp, Brain, Server, Trophy, Rocket, Users } from 'lucide-react';

const highlights = [
  {
    icon: TrendingUp,
    title: '$150K+ Saved Annually',
    description: 'Built automated data pipelines reducing manual processing time by 80%',
    gradient: 'from-emerald-500 to-teal-500',
  },
  {
    icon: Brain,
    title: 'LLM Document Processing',
    description: 'Engineered AI-powered system for intelligent document analysis and extraction',
    gradient: 'from-primary to-secondary',
  },
  {
    icon: Server,
    title: '100K+ Records/Week',
    description: 'Designed microservices architecture handling massive data throughput',
    gradient: 'from-orange-500 to-amber-500',
  },
  {
    icon: Trophy,
    title: '$5K Hackathon Winner',
    description: 'First place for innovative AI solution among 50+ competing teams',
    gradient: 'from-yellow-500 to-orange-500',
  },
  {
    icon: Rocket,
    title: 'Production Software',
    description: 'Shipped scalable solutions for multiple enterprise clients',
    gradient: 'from-pink-500 to-rose-500',
  },
  {
    icon: Users,
    title: '200+ Participants Led',
    description: 'Spearheaded engineering initiatives and mentored junior developers',
    gradient: 'from-violet-500 to-purple-500',
  },
];

const HighlightCard = ({ highlight, index }: { highlight: typeof highlights[0]; index: number }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="group relative"
    >
      {/* Card */}
      <div className="relative h-full p-6 md:p-8 rounded-2xl glass-card animated-border overflow-hidden transition-all duration-500 hover:scale-[1.02]">
        {/* Shimmer overlay */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div 
            className="absolute inset-0"
            style={{
              background: `linear-gradient(135deg, transparent 0%, hsl(199 89% 48% / 0.05) 50%, transparent 100%)`,
            }}
          />
        </div>

        {/* Glow effect on hover */}
        <div className="absolute -inset-px rounded-2xl bg-gradient-to-r from-primary/20 to-secondary/20 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500" />

        {/* Content */}
        <div className="relative z-10">
          {/* Icon */}
          <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${highlight.gradient} mb-4`}>
            <highlight.icon className="w-6 h-6 text-white" />
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors duration-300">
            {highlight.title}
          </h3>

          {/* Description */}
          <p className="text-muted-foreground leading-relaxed">
            {highlight.description}
          </p>
        </div>

        {/* Decorative corner */}
        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-primary/5 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>
    </motion.div>
  );
};

const Highlights = () => {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section id="highlights" className="py-24 md:py-32 relative">
      {/* Background accent */}
      <div className="absolute inset-0 bg-gradient-to-b from-muted/20 via-transparent to-transparent" />

      <div className="container mx-auto px-6 relative">
        {/* Section header */}
        <motion.div
          ref={sectionRef}
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full text-sm font-medium bg-primary/10 text-primary mb-4">
            Impact
          </span>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Highlights & <span className="gradient-text">Achievements</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Key milestones from building products that scale and drive real business value.
          </p>
        </motion.div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {highlights.map((highlight, index) => (
            <HighlightCard key={highlight.title} highlight={highlight} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Highlights;
