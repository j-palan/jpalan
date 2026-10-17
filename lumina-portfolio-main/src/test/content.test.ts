import { describe, expect, it } from "vitest";
import { experience } from "@/data/experience";
import { links } from "@/data/site";

describe("experience data", () => {
  it("keeps work history ordered newest first", () => {
    const years = experience.map((role) => Number(role.year));
    expect(years).toEqual([...years].sort((a, b) => b - a));
  });

  it("links every row somewhere real over https", () => {
    for (const role of experience) {
      expect(role.href).toMatch(/^https:\/\//);
    }
  });

  it("lists Cadence beneath OpsLevel with its project call to action", () => {
    const opsLevelIndex = experience.findIndex((role) => role.org === "OpsLevel");
    const cadence = experience[opsLevelIndex + 1];

    expect(cadence).toMatchObject({
      year: "2026",
      org: "Cadence",
      href: "https://cadencecv.ca/",
      role: "400+ users",
      dates: "Try now!",
      note: "Turns your coding agent’s running log of shipped work into a tailored, one-page LaTeX resume.",
    });
  });

  it("keeps every note to a single line", () => {
    for (const role of experience) {
      if (!role.note) continue;
      expect(role.note).not.toContain("\n");
      expect(role.note.length).toBeLessThanOrEqual(140);
    }
  });
});

describe("contact", () => {
  /* The previous site published a personal mobile number. It should not come
     back with a copy-paste. */
  it("publishes no phone number", () => {
    const serialised = JSON.stringify({ experience, links });
    expect(serialised).not.toMatch(/tel:/);
    expect(serialised).not.toMatch(/\d{3}-\d{3}-\d{4}/);
  });
});
