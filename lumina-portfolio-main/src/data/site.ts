export const site = {
  name: "Jai Palan",
  greeting: "Hey, I’m",
  firstName: "Jai",
  initials: ["J", "P"] as const,
  description:
    "Software engineer. Currently at OpsLevel, working on evaluation tooling for autonomous coding agents.",
};

/** Two sentences, no more. Rendered with `current` as an inline link. */
export const intro = {
  lead: "I build software — currently at",
  current: { label: "OpsLevel", href: "https://www.opslevel.com/" },
  leadEnd: ", where I work on evaluation tooling for autonomous coding agents.",
  tail: "I care most about work that ends up in front of a lot of people.",
};

export const links = [
  { label: "Email", href: "mailto:j2palan@uwaterloo.ca", icon: "mail" },
  { label: "GitHub", href: "https://github.com/j-palan", icon: "github" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/jai-palan", icon: "linkedin" },
] as const;
