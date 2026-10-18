import { describe, expect, it } from "vitest";
import { blueRacingLine, purpleOvertake } from "@/lib/racingOvertake";

describe("purple's upper-road overtake", () => {
  it("starts in line and pulls out before accelerating", () => {
    expect(purpleOvertake(0)).toEqual(blueRacingLine(0));
    expect(purpleOvertake(0.5)).toEqual(blueRacingLine(0.5));
    expect(purpleOvertake(0.57).progress).toBe(0.57);
  });

  it("clears blue on a separate line, without catching red", () => {
    const baseProgress = 0.87;
    const pass = purpleOvertake(baseProgress);
    const blueProgress = baseProgress + (1.08 - 0.9) / 4.5;
    const redProgress = baseProgress + (1.08 - 0.42) / 4.5;
    expect(pass.progress - blueProgress).toBeGreaterThan(0.05);
    expect(pass.progress).toBeLessThan(redProgress);
    expect(pass.lane - blueRacingLine(blueProgress).lane).toBe(30);
  });

  it("always moves forward and stays inside the road", () => {
    let previous = -1;
    for (let i = 0; i <= 1000; i++) {
      const pass = purpleOvertake(i / 1000);
      expect(pass.progress).toBeGreaterThan(previous);
      expect(pass.lane).toBeGreaterThanOrEqual(-14);
      expect(pass.lane).toBeLessThanOrEqual(23);
      previous = pass.progress;
    }
  });

  it("keeps clearance while alongside and builds speed progressively", () => {
    for (let i = 0; i <= 1000; i++) {
      const t = i / 1000;
      const purple = purpleOvertake(t);
      const blue = blueRacingLine(t + 0.18 / 4.5);
      if (Math.abs(purple.progress - blue.progress) < 0.025) {
        expect(purple.lane - blue.lane).toBeGreaterThan(24);
      }
      const rate = (purpleOvertake(t + 0.0001).progress - purple.progress) / 0.0001;
      expect(rate).toBeLessThan(1.52);
    }
  });
});
