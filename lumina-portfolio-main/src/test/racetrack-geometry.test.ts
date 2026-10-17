import { describe, expect, it, vi } from "vitest";
import { measureTrack } from "@/lib/racetrackGeometry";

const createPath = (data: string) => {
  const getPointAtLength = vi.fn((distance: number) => ({ x: distance, y: distance / 2 }));
  const path = {
    getAttribute: () => data,
    getTotalLength: () => 100,
    getPointAtLength,
  } as unknown as SVGPathElement;
  return { path, getPointAtLength };
};

describe("cached racetrack geometry", () => {
  it("interpolates positions and clamps the ends without further SVG reads", () => {
    const { path, getPointAtLength } = createPath("interpolation-track");
    const geometry = measureTrack(path);
    const callsAfterSetup = getPointAtLength.mock.calls.length;
    expect(callsAfterSetup).toBe(35);
    for (let frame = 0; frame < 1000; frame++) geometry.pointAt(frame / 10);
    expect(geometry.pointAt(37.5)).toEqual({ x: 37.5, y: 18.75 });
    expect(geometry.pointAt(-20)).toEqual({ x: 0, y: 0 });
    expect(geometry.pointAt(120)).toEqual({ x: 100, y: 50 });
    expect(getPointAtLength).toHaveBeenCalledTimes(callsAfterSetup);
  });

  it("reuses measured geometry after remounting the same road", () => {
    const original = createPath("cached-track");
    const remounted = createPath("cached-track");
    const geometry = measureTrack(original.path);
    expect(measureTrack(remounted.path)).toBe(geometry);
    expect(remounted.getPointAtLength).not.toHaveBeenCalled();
  });
});
