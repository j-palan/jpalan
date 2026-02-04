import { motion } from "framer-motion";

const skillCategories = [
  {
    title: "Languages & Databases",
    skills: ["Java", "JavaScript", "TypeScript", "Python", "Ruby", "GraphQL", "SQL", "PostgreSQL", "MongoDB"],
  },
  {
    title: "Frameworks",
    skills: ["Spring Boot", "React", "Next.js", "Node.js", "NestJS", "Ruby on Rails", "Express.js", "Tailwind"],
  },
  {
    title: "Cloud & DevOps",
    skills: ["AWS", "GCP", "Azure", "Docker", "Kubernetes", "GitHub Actions", "Lambda", "S3", "RDS"],
  },
  {
    title: "Concepts",
    skills: ["Generative AI", "LLMs", "Machine Learning", "System Design", "Data Structures", "Algorithms"],
  },
];

export const SkillsSection = () => {
  return (
    <section id="skills" className="section px-6 overflow-hidden">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <span className="section-title">Skills</span>
          <h2 className="font-caslon text-4xl md:text-5xl font-semibold tracking-tight">
            My <span className="gradient-text-accent">toolkit</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {skillCategories.map((category, catIndex) => (
            <motion.div
              key={category.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: catIndex * 0.1 }}
            >
              <h3 className="text-lg font-medium mb-4 text-foreground/90">{category.title}</h3>
              <div className="flex flex-wrap gap-2">
                {category.skills.map((skill, skillIndex) => (
                  <motion.span
                    key={skill}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 0.4,
                      delay: catIndex * 0.1 + skillIndex * 0.03,
                    }}
                    whileHover={{ scale: 1.05 }}
                    className="px-4 py-2 text-sm rounded-xl glass cursor-default"
                  >
                    {skill}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
