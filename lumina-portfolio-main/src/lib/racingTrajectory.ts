type Point = { x: number; y: number };

/** Cache a C2-continuous cubic B-spline: position, steering and curvature
 * remain continuous even when the sampled road's normals change. */
export const buildRacingTrajectory = (positionAt: (progress: number) => Point) => {
  const count = 160;
  const points = Array.from({ length: count + 1 }, (_, i) => positionAt(i / count));
  return (progress: number) => {
    const u = Math.max(0, Math.min(1, progress)) * count;
    const index = Math.min(count - 1, Math.floor(u));
    const t = u - index;
    const p = [-1, 0, 1, 2].map((offset) => points[Math.max(0, Math.min(count, index + offset))]);
    const weights = [(1 - t) ** 3, 3 * t ** 3 - 6 * t * t + 4,
      -3 * t ** 3 + 3 * t * t + 3 * t + 1, t ** 3];
    const derivatives = [-3 * (1 - t) ** 2, 9 * t * t - 12 * t,
      -9 * t * t + 6 * t + 3, 3 * t * t];
    const sum = (axis: "x" | "y", coefficients: number[]) =>
      p.reduce((value, point, i) => value + point[axis] * coefficients[i] / 6, 0);
    return { x: sum("x", weights), y: sum("y", weights),
      heading: Math.atan2(sum("y", derivatives), sum("x", derivatives)) };
  };
};
