import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { COIN_THICKNESS_RATIO, SLAT_COUNT, coinCentreHeight } from "@/components/coin/geometry";
import { REST_TILT, TIMING, TOTAL_ROTATION } from "@/components/coin/useCoinTimeline";

const coinCss = readFileSync(resolve(__dirname, "../components/coin/coin.css"), "utf8");

describe("coin geometry", () => {
  it("spins a whole number of turns, so the J face lands up", () => {
    expect(TOTAL_ROTATION % 360).toBe(0);
  });

  it("comes to rest flat on the table", () => {
    expect(REST_TILT).toBe(90);
  });

  /* The rim divisor and the thickness ratio each live in two places. If they
     drift apart the rim gains gaps or the faces float off the edge, which is
     easy to miss by eye at spin speed. */
  it("uses the same slat count in CSS as in JS", () => {
    expect(coinCss).toContain(`/ ${SLAT_COUNT} + 1px`);
  });

  it("uses the same thickness ratio in CSS as in JS", () => {
    expect(coinCss).toContain(`* ${COIN_THICKNESS_RATIO})`);
  });

  it("overlaps neighbouring slats so the rim has no seams", () => {
    expect(coinCss).toMatch(/--slat-w:\s*calc\(6\.2832 \* var\(--coin-r\) \/ \d+ \+ 1px\)/);
  });
});

describe("tip-over geometry", () => {
  const R = 90;

  it("stands an upright coin one radius above the table", () => {
    expect(coinCentreHeight(R, 0)).toBeCloseTo(R, 6);
  });

  it("rests a fully flat coin on half its thickness", () => {
    expect(coinCentreHeight(R, 90)).toBeCloseTo((R * COIN_THICKNESS_RATIO) / 2, 6);
  });

  const halfThickness = (R * COIN_THICKNESS_RATIO) / 2;
  const centreHeight = (deg: number) => coinCentreHeight(R, deg);

  /* The coin pivots on the corner between rim and face, which is
     √(R² + (t/2)²) from the centre — further than the radius. So tipping off
     perfectly upright lifts it a fraction of a pixel before it falls, which is
     exactly why a coin can balance on its edge at all. */
  it("lifts fractionally off perfect balance before it falls", () => {
    const peak = Math.max(...Array.from({ length: 1801 }, (_, i) => centreHeight(i / 20)));
    expect(peak).toBeCloseTo(Math.hypot(R, halfThickness), 4);
    expect(peak - R).toBeLessThan(0.5);
  });

  it("never sinks through the table", () => {
    for (let deg = 0; deg <= 90; deg += 1) {
      expect(centreHeight(deg)).toBeGreaterThanOrEqual(halfThickness - 1e-9);
    }
  });

  it("falls continuously once it is past the balance point", () => {
    let previous = Infinity;
    for (let deg = 10; deg <= 90; deg += 1) {
      const height = centreHeight(deg);
      expect(height).toBeLessThan(previous);
      previous = height;
    }
  });
});

describe("intro timing", () => {
  it("resolves the page before the coin has finished settling", () => {
    expect(TIMING.reveal).toBeLessThan(TIMING.atRest);
  });

  it("runs its phases in order", () => {
    expect(TIMING.topple).toBeLessThan(TIMING.atRest);
    expect(TIMING.reveal).toBeLessThanOrEqual(TIMING.flip);
    expect(TIMING.flip).toBeLessThan(TIMING.handoff);
    expect(TIMING.handoff).toBeLessThan(TIMING.end);
  });

  it("keeps the failsafe after every other phase, so it can only ever be a backstop", () => {
    expect(TIMING.failsafe).toBeGreaterThan(TIMING.end);
  });

  it("never holds the page for longer than the failsafe", () => {
    expect(TIMING.failsafe).toBeLessThanOrEqual(4);
  });
});
