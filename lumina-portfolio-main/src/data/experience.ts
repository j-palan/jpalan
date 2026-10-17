export type Role = {
  /** Gutter year. Rendered only when it differs from the row above. */
  year: string;
  org: string;
  href: string;
  role: string;
  dates: string;
  /** One line. Revealed on hover, or on tap. Omit for no disclosure. */
  note?: string;
};

export const experience: Role[] = [
  {
    year: "2026",
    org: "OpsLevel",
    href: "https://www.opslevel.com/",
    role: "Software Engineer Intern",
    dates: "Apr – Present",
    note: "Built an LLM-as-judge harness that benchmarks autonomous coding agents against human-merged pull requests.",
  },
  {
    year: "2026",
    org: "Cadence",
    href: "https://cadencecv.ca/",
    role: "400+ users",
    dates: "Try now!",
    note: "Turns your coding agent’s running log of shipped work into a tailored, one-page LaTeX resume.",
  },
  {
    year: "2025",
    org: "VITALL",
    href: "https://www.vitall.com/",
    role: "Software Engineer Intern",
    dates: "Sep – Dec",
    note: "Automated data pipelines in React, NestJS and AWS — cut manual effort 10× and saved $150K+ a year.",
  },
  {
    year: "2025",
    org: "LTIMindtree",
    href: "https://www.ltimindtree.com/",
    role: "Software Engineer Intern",
    dates: "Jan – Apr",
    note: "Ten Java microservices moving 100K+ financial records weekly at sub-200ms p95.",
  },
  {
    year: "2024",
    org: "Industry 4.0",
    href: "https://www.uwindustry4.ca/",
    role: "Software Engineering Lead",
    dates: "Oct – Sep",
    note: "Built the platform, grew it to 220+ users, and ran data challenges for 200+ participants.",
  },
  {
    year: "2023",
    org: "Waterloo",
    href: "https://uwaterloo.ca/",
    role: "Nano-Science + CS",
    dates: "2023 – Present",
  },
];
