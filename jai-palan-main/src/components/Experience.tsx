import { motion, useInView } from 'framer-motion';
import { useRef, useState } from 'react';
import { Briefcase, ChevronRight } from 'lucide-react';

const experiences = [
  {
    company: 'VITALL',
    role: 'Software Engineer Intern',
    period: '2024',
    description: 'Built data pipelines and AI-powered document processing systems for healthcare analytics platform.',
    impact: [
      'Reduced data processing time by 80%',
      'Implemented LLM-based document extraction',
      'Automated reporting workflows',
    ],
    tech: ['Python', 'TypeScript', 'AWS', 'PostgreSQL', 'OpenAI'],
  },
  {
    company: 'LTIMindtree',
    role: 'Software Engineer Intern',
    period: '2023',
    description: 'Developed microservices handling 100K+ records weekly for enterprise clients.',
    impact: [
      'Designed scalable REST APIs',
      'Improved query performance by 60%',
      'Built monitoring dashboards',
    ],
    tech: ['Java', 'Spring Boot', 'Kubernetes', 'Docker', 'GraphQL'],
  },
  {
    company: 'Industry 4.0',
    role: 'Engineering Team Lead',
    period: '2022 - 2023',
    description: 'Led a team of 15 engineers on IoT and automation projects for manufacturing clients.',
    impact: [
      'Led 200+ participants in engineering initiatives',
      'Shipped production software to 5 clients',
      'Mentored 10+ junior developers',
    ],
    tech: ['React', 'Node.js', 'Python', 'IoT', 'Azure'],
  },
];

const ExperienceCard = ({ exp, index, isExpanded, onToggle }: { 
  exp: typeof experiences[0]; 
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: index % 2 === 0 ? -40 : 40 }}
      animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: index % 2 === 0 ? -40 : 40 }}
      transition={{ duration: 0.6, delay: index * 0.2 }}
      className="relative group"
    >
      {/* Timeline connector */}
      <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-px bg-border md:-translate-x-1/2">
        {/* Dot */}
        <motion.div 
          className="absolute top-8 -translate-x-1/2 w-4 h-4 rounded-full bg-background border-2 border-primary"
          animate={{ scale: isExpanded ? 1.2 : 1 }}
        >
          <div className="absolute inset-0 rounded-full bg-primary/30 animate-ping" />
        </motion.div>
      </div>

      {/* Card */}
      <div 
        className={`ml-8 md:ml-0 md:w-[calc(50%-2rem)] ${
          index % 2 === 0 ? 'md:mr-auto md:pr-8' : 'md:ml-auto md:pl-8'
        }`}
      >
        <motion.div
          onClick={onToggle}
          className="magnetic glass-card rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:scale-[1.01] border border-white/[0.06]"
          whileHover={{ y: -5 }}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <span className="text-sm text-primary font-medium">{exp.period}</span>
              <h3 className="text-xl font-bold mt-1">{exp.company}</h3>
              <p className="text-muted-foreground">{exp.role}</p>
            </div>
            <motion.div
              animate={{ rotate: isExpanded ? 90 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </motion.div>
          </div>

          {/* Description */}
          <p className="text-muted-foreground text-sm mb-4">{exp.description}</p>

          {/* Expanded content */}
          <motion.div
            initial={false}
            animate={{ height: isExpanded ? 'auto' : 0, opacity: isExpanded ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            {/* Impact */}
            <div className="mb-4 pt-4 border-t border-border">
              <h4 className="text-sm font-semibold mb-2 text-foreground">Key Impact</h4>
              <ul className="space-y-2">
                {exp.impact.map((item, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={isExpanded ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-2 text-sm text-muted-foreground"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    {item}
                  </motion.li>
                ))}
              </ul>
            </div>

            {/* Tech stack */}
            <div className="flex flex-wrap gap-2">
              {exp.tech.map((tech) => (
                <span
                  key={tech}
                  className="px-2 py-1 text-xs rounded-md bg-muted text-muted-foreground"
                >
                  {tech}
                </span>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};

const Experience = () => {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  return (
    <section id="experience" className="py-24 md:py-32 relative">
      <div className="container mx-auto px-6">
        {/* Section header */}
        <motion.div
          ref={sectionRef}
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium bg-primary/10 text-primary mb-4">
            <Briefcase className="w-4 h-4" />
            Experience
          </span>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Where I've <span className="gradient-text">Made Impact</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A journey through companies where I've built systems that scale and delivered measurable results.
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="relative max-w-4xl mx-auto space-y-8">
          {experiences.map((exp, index) => (
            <ExperienceCard
              key={exp.company}
              exp={exp}
              index={index}
              isExpanded={expandedIndex === index}
              onToggle={() => setExpandedIndex(expandedIndex === index ? null : index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Experience;
