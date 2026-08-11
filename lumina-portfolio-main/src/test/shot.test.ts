import { describe, expect, it } from "vitest";
import { MAX_BOUNCES, stepShot, type Flight, type StepTarget } from "@/components/shot/physics";

const VIEWPORT = { width: 1000, height: 800 };
/** Deterministic, so a bounce reflects exactly and the test can assert angles. */
const noJitter = () => 0.5;

const shot = (over: Partial<Flight> = {}): Flight => ({
  x: 100,
  y: 100,
  vx: 1000,
  vy: 0,
  bounces: 0,
  age: 0,
  inside: new Set(),
  cooldown: new Map(),
  ...over,
});

const box = (id: string, solid: boolean, rect: StepTarget["rect"]): StepTarget => ({
  id,
  solid,
  rect,
});

describe("pass-through targets", () => {
  const row = [box("row", false, { left: 200, right: 400, top: 0, bottom: 200 })];

  it("registers a hit without turning the round", () => {
    const round = shot();
    const { hits } = stepShot(round, 0.25, row, VIEWPORT, noJitter);
    expect(hits).toEqual(["row"]);
    expect(round.vx).toBe(1000);
    expect(round.vy).toBe(0);
  });

  it("fires once per pass, not once per frame", () => {
    const round = shot();
    const first = stepShot(round, 0.15, row, VIEWPORT, noJitter);
    const second = stepShot(round, 0.05, row, VIEWPORT, noJitter);
    expect(first.hits).toEqual(["row"]);
    expect(second.hits).toEqual([]);
  });

  it("can be hit again after leaving and re-entering", () => {
    const round = shot();
    stepShot(round, 0.25, row, VIEWPORT, noJitter);
    stepShot(round, 0.25, row, VIEWPORT, noJitter);
    round.vx = -1000;
    const back = stepShot(round, 0.25, row, VIEWPORT, noJitter);
    expect(back.hits).toEqual(["row"]);
  });
});

describe("solid targets", () => {
  const heading = [box("h1", true, { left: 200, right: 400, top: 0, bottom: 200 })];

  it("turns the round back the way it came", () => {
    const round = shot();
    const { hits } = stepShot(round, 0.15, heading, VIEWPORT, noJitter);
    expect(hits).toEqual(["h1"]);
    expect(round.vx).toBe(-1000);
  });

  it("does not leave the round stranded inside the target", () => {
    const round = shot();
    stepShot(round, 0.15, heading, VIEWPORT, noJitter);
    expect(round.x).toBeLessThan(200);
  });

  it("reflects vertically when entered from above", () => {
    const round = shot({ x: 300, y: -50, vx: 0, vy: 1000 });
    stepShot(round, 0.1, heading, VIEWPORT, noJitter);
    expect(round.vy).toBe(-1000);
  });
});

describe("bounce budget", () => {
  it("spends one bounce per wall and stops turning once exhausted", () => {
    const round = shot({ x: 500, y: 400, vx: 4000, vy: 0 });
    for (let i = 0; i < MAX_BOUNCES; i += 1) {
      stepShot(round, 0.5, [], VIEWPORT, noJitter);
    }
    expect(round.bounces).toBe(MAX_BOUNCES);

    const heading = Math.sign(round.vx);
    stepShot(round, 0.5, [], VIEWPORT, noJitter);
    expect(Math.sign(round.vx)).toBe(heading);
  });

  it("retires the shot only once the round is clear of the screen", () => {
    const round = shot({ x: 990, y: 400, vx: 4000, vy: 0, bounces: MAX_BOUNCES });
    expect(stepShot(round, 0.05, [], VIEWPORT, noJitter).spent).toBe(false);
    expect(stepShot(round, 0.5, [], VIEWPORT, noJitter).spent).toBe(true);
  });

  it("lets the round through solid targets once the budget is gone", () => {
    const heading = [box("h1", true, { left: 200, right: 400, top: 0, bottom: 200 })];
    const round = shot({ bounces: MAX_BOUNCES });
    const { hits } = stepShot(round, 0.15, heading, VIEWPORT, noJitter);
    expect(hits).toEqual(["h1"]);
    expect(round.vx).toBe(1000);
  });
});

describe("corner ping-pong", () => {
  /* A solid target tucked against the edge, with the wall right behind it. */
  const corner = [box("icons", true, { left: 900, right: 980, top: 0, bottom: 40 })];

  it("will not let one target deflect the round twice in quick succession", () => {
    const round = shot({ x: 890, y: 20, vx: 4000, vy: 0 });

    stepShot(round, 0.016, corner, VIEWPORT, noJitter);
    expect(round.bounces).toBe(1);

    /* Sent back into the wall, turned around, and driven at the icons again. */
    round.vx = 4000;
    let deflections = 0;
    for (let i = 0; i < 6; i += 1) {
      const before = round.bounces;
      stepShot(round, 0.016, corner, VIEWPORT, noJitter);
      if (round.bounces > before) deflections += 1;
      round.x = 890;
      round.vx = 4000;
      round.inside.clear();
    }
    expect(deflections).toBe(0);
  });

  it("lets the same target deflect again once the round has moved on", () => {
    const round = shot({ x: 890, y: 20, vx: 4000, vy: 0 });
    stepShot(round, 0.016, corner, VIEWPORT, noJitter);

    round.age += 0.5;
    round.x = 890;
    round.vx = 4000;
    round.inside.clear();
    stepShot(round, 0.016, corner, VIEWPORT, noJitter);
    expect(round.bounces).toBe(2);
  });
});

describe("targets that have gone away", () => {
  it("ignores a target with no rect rather than throwing", () => {
    const round = shot();
    expect(() => stepShot(round, 0.25, [box("gone", true, null)], VIEWPORT, noJitter)).not.toThrow();
  });
});
