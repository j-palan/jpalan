import { describe, expect, it } from "vitest";
import { experience } from "@/data/experience";
import { links } from "@/data/site";

describe("experience data", () => {
  it("is ordered newest first", () => {
    const years = experience.map((role) => Number(role.year));
    expect(years).toEqual([...years].sort((a, b) => b - a));
  });

  it("links every row somewhere real over https", () => {
    for (const role of experience) {
      expect(role.href).toMatch(/^https:\/\//);
    }
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
