import { motion, useInView, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import { Code2, Layers, Cloud } from 'lucide-react';

const skillCategories = [
  {
    title: 'Languages',
    icon: Code2,
    skills: ['Java', 'TypeScript', 'Python', 'Ruby', 'GraphQL', 'SQL'],
  },
  {
    title: 'Frameworks',
    icon: Layers,
    skills: ['React', 'Next.js', 'NestJS', 'Spring Boot', 'Rails', 'Express'],
  },
  {
    title: 'Tools & Cloud',
    icon: Cloud,
    skills: ['AWS', 'Docker', 'Kubernetes', 'PostgreSQL', 'GitHub Actions', 'Redis'],
  },
];

const SkillPill = ({ skill, index, categoryIndex }: { skill: string; index: number; categoryIndex: number }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 20, stiffness: 300 };
  const x = useSpring(mouseX, springConfig);
  const y = useSpring(mouseY, springConfig);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    mouseX.set((e.clientX - centerX) / 5);
    mouseY.set((e.clientY - centerY) / 5);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    setIsHovered(false);
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ 
        duration: 0.5, 
        delay: (categoryIndex * 0.2) + (index * 0.05),
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      style={{ x, y }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      className="magnetic relative"
    >
      <motion.div
        animate={{
          scale: isHovered ? 1.1 : 1,
          boxShadow: isHovered 
            ? '0 0 30px hsl(199 89% 48% / 0.3)' 
            : '0 0 0px transparent',
        }}
        transition={{ duration: 0.2 }}
        className="px-5 py-3 rounded-xl glass-card border border-border cursor-default"
      >
        <span className={`font-medium transition-colors duration-200 ${isHovered ? 'text-primary' : 'text-foreground'}`}>
          {skill}
        </span>
        
        {/* Glow effect */}
        <motion.div
          className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/20 to-secondary/20 opacity-0"
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.2 }}
        />
      </motion.div>
    </motion.div>
  );
};

const SkillCategory = ({ category, categoryIndex }: { category: typeof skillCategories[0]; categoryIndex: number }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.6, delay: categoryIndex * 0.15 }}
      className="text-center"
    >
      {/* Category icon */}
      <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 mb-4">
        <category.icon className="w-6 h-6 text-primary" />
      </div>
      
      {/* Category title */}
      <h3 className="text-xl font-bold mb-6">{category.title}</h3>
      
      {/* Skills */}
      <div className="flex flex-wrap justify-center gap-3">
        {category.skills.map((skill, index) => (
          <SkillPill 
            key={skill} 
            skill={skill} 
            index={index} 
            categoryIndex={categoryIndex} 
          />
        ))}
      </div>
    </motion.div>
  );
};

const Skills = () => {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section id="skills" className="py-24 md:py-32 relative overflow-hidden">
      {/* Background pattern */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `radial-gradient(hsl(var(--foreground)) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

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
            <Code2 className="w-4 h-4" />
            Tech Stack
          </span>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Skills & <span className="gradient-text">Technologies</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            The tools and technologies I use to bring ideas to production.
          </p>
        </motion.div>

        {/* Skills grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
          {skillCategories.map((category, index) => (
            <SkillCategory key={category.title} category={category} categoryIndex={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Skills;
