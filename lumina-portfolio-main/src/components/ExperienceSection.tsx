import { motion } from "framer-motion";
import { GlassCard } from "./GlassCard";
import { ArrowUpRight } from "lucide-react";

const companyLogos: Record<string, string> = {
  VITALL: "/vitall.png",
  LTIMindtree: "/LTI.png",
  "Industry 4.0": "/i4logo.png",
};

const companyUrls: Record<string, string> = {
  VITALL: "https://www.vitall.com/",
  LTIMindtree: "https://www.ltimindtree.com/",
  "Industry 4.0": "https://www.uwindustry4.ca/",
};

const experiences = [
  {
    title: "Software Engineer Intern",
    company: "VITALL",
    period: "Sept 2025 – Dec 2025",
    location: "Toronto, ON",
    highlights: [
      "Built automated data pipeline in React, NestJS, & AWS, cutting manual effort by 10× to save $150K+ yearly",
      "Designed backend services with PostgreSQL/RDS & Prisma ORM, supporting 13+ clients and netted $130K",
      "Built LLM-powered data pipeline with AWS Lambda and S3, processing 1K+ documents/month",
    ],
    tags: ["React", "NestJS", "AWS", "PostgreSQL", "GraphQL"],
  },
  {
    title: "Software Engineer Intern",
    company: "LTIMindtree",
    period: "Jan 2025 – April 2025",
    location: "Toronto, ON",
    highlights: [
      "Engineered 10+ RESTful microservices in Java Spring Boot transforming 100K+ records weekly",
      "Automated email notification workflows, reducing manual intervention by 80%",
      "Achieved sub-200ms response times for 95% of production API calls",
    ],
    tags: ["Java", "Spring Boot", "SQL", "REST APIs", "Postman"],
  },
  {
    title: "Software Engineering Team Lead",
    company: "Industry 4.0",
    period: "Oct 2024 – Sept 2025",
    location: "Waterloo, ON",
    highlights: [
      "Built and shipped Next.js + React platform, driving 220+ user sign-ups and $2K+ funding",
      "Directed 3 data engineering challenges, evaluating deliverables from 200+ participants",
      "Optimized frameworks, reducing event prep time by 15% and boosting satisfaction by 20%",
    ],
    tags: ["Next.js", "React", "Leadership", "Agile"],
  },
];

export const ExperienceSection = () => {
  return (
    <section id="experience" className="section px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <span className="section-title">Experience</span>
          <h2 className="font-caslon text-4xl md:text-5xl font-semibold tracking-tight">
            Where I've <span className="gradient-text-accent">contributed</span>
          </h2>
        </motion.div>

        <div className="space-y-6">
          {experiences.map((exp, index) => (
            <GlassCard key={exp.company} delay={index * 0.1}>
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-xl font-semibold mb-1 flex items-center gap-2">
                    {exp.title}
                    <ArrowUpRight className="w-4 h-4 text-accent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h3>
                  <a
                    href={companyUrls[exp.company]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent font-medium flex items-center gap-2 hover:underline underline-offset-2 transition-all"
                  >
                    {companyLogos[exp.company] && (
                      <img
                        src={companyLogos[exp.company]}
                        alt={exp.company}
                        className="h-4 w-4 object-contain"
                      />
                    )}
                    {exp.company}
                  </a>
                </div>
                <div className="text-sm text-muted-foreground text-right">
                  <p>{exp.period}</p>
                  <p>{exp.location}</p>
                </div>
              </div>

              <ul className="space-y-2 mb-4">
                {exp.highlights.map((highlight, i) => (
                  <li key={i} className="text-muted-foreground text-sm leading-relaxed flex gap-3">
                    <span className="text-accent mt-1.5">•</span>
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>

              <div className="flex flex-wrap gap-2">
                {exp.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 text-xs rounded-full bg-secondary/50 text-secondary-foreground"
                  >
                    {tag}
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
