import { describe, expect, it } from "vitest";
import { buildCalendar } from "@/lib/githubCalendar";

describe("GitHub contribution calendar", () => {
  it("pads the rolling year into Sunday-first weeks", () => {
    const calendar = buildCalendar([
      { date: "2026-09-14", count: 1, level: 1 },
      { date: "2026-09-15", count: 4, level: 3 },
      { date: "2026-09-16", count: 0, level: 0 },
    ]);

    expect(calendar).toHaveLength(7);
    expect(calendar[0]).toBeNull();
    expect(calendar[1]?.date).toBe("2026-09-14");
    expect(calendar[3]?.date).toBe("2026-09-16");
  });

  it("sorts API data before laying it out", () => {
    const calendar = buildCalendar([
      { date: "2026-09-15", count: 4, level: 3 },
      { date: "2026-09-14", count: 1, level: 1 },
    ]);

    expect(calendar.filter(Boolean).map((day) => day?.date)).toEqual([
      "2026-09-14",
      "2026-09-15",
    ]);
  });
});
