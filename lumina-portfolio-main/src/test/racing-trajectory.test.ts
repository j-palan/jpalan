import { describe, expect, it } from "vitest";
import { buildRacingTrajectory } from "@/lib/racingTrajectory";

describe("smooth racing trajectory", () => {
  it("caches its samples instead of rebuilding geometry each frame", () => {
    let calls = 0;
    const trajectory = buildRacingTrajectory((t) => {
      calls++;
      return { x: t * 1000, y: Math.sin(t * Math.PI) * 30 };
    });
    expect(calls).toBe(161);
    for (let i = 0; i < 1000; i++) trajectory(i / 1000);
    expect(calls).toBe(161);
  });

  it("has continuous position and steering across every spline join", () => {
    const trajectory = buildRacingTrajectory((t) => ({
      x: t * 1000, y: Math.sin(t * Math.PI * 2) * 20,
    }));
    for (let i = 1; i < 160; i++) {
      const before = trajectory(i / 160 - 1e-7);
      const after = trajectory(i / 160 + 1e-7);
      expect(Math.hypot(after.x - before.x, after.y - before.y)).toBeLessThan(0.001);
      expect(Math.abs(after.heading - before.heading)).toBeLessThan(0.00001);
    }
  });
});
